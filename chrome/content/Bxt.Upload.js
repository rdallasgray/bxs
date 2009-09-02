/*

Copyright (c) 2009 Robert Johnston

This file is part of Bxtension.

Bxtension is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Bxtension is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Bxtension. If not, see http://www.gnu.org/licenses/.

*/


Bxt.Upload = function(req,file) {

	this.id = new Date().getTime();
	this.req = req;
	this.file = file;
	
	var boundary = "boundary"+this.id;
	this.data = this.createStream(this.file,boundary);
	this.req.addHeader("Content-Type","multipart/form-data; boundary="+boundary);
	
	Bxt.Controller.Uploads.uploadList[this.id] = this;
	this.setState("queued");
};

Bxt.Upload.prototype = {

	prepare: function() {

		var callback = this.req.callback,
		self = this;

		this.req.callback = function() {
			if (self.req.xhr.status === 204) {
				self.req.reset();
				self.req.callback = callback;
				self.req.addHandler("progress",function(e) {
					self.reportProgress(e.loaded);
				},true);
				self.req.addHandler("load",function() {
					try {
						if (self.req.xhr.status === 201) {
							self.success();
						}
						else {
							self.fail();
						}
					}
					catch(e) {}
				});
				
				self.req.send(self.data);
			}
		}
	},
	
	setState: function(state) {
		this.state = state;
		var options = { uploadId: this.id, state: state };
		Bxt.Controller.Uploads.sendWindowEvent("UploadStateChange",options);
		Bxt.Controller.Uploads.processQueue();
	},
	
	start: function() {
		this.prepare();
		this.timeStarted = new Date().getTime();
		this.setState("active");
		this.req.send();
	},
	
	reportProgress: function(loaded) {
		this.loaded = loaded;
		var options = { uploadId: this.id, loaded: loaded };
		Bxt.Controller.Uploads.sendWindowEvent("UploadProgress",options);
	},
	
	cancel: function() {
		this.req.xhr.abort();
		this.setState("cancelled");
	},
	
	retry: function() {
		this.req.reset();
		this.setState("queued");
	},
	
	remove: function() {
		var options = { uploadId: this.id };
		Bxt.Controller.Uploads.sendWindowEvent("UploadRemoved",options);
		delete(Bxt.Controller.Uploads.uploadList[this.id]);
	},
	
	success: function() {
		this.setState("succeeded");
	},
	
	fail: function() {
		this.setState("failed");
	},
	
	createStream: function() {
		var boundary = "boundary"+this.id,
		 	prefix = 
			"--"+boundary+"\r\n"
		+	"Content-Disposition: form-data; name=\"file_data\"; filename=\""+this.file.leafName+"\"\r\n"
		+	"Content-Type: "+this.req.options.contentType+";"+"\r\n\r\n";

		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
							createInstance(Components.interfaces.nsIFileInputStream);

		istream.init(this.file, -1, -1, false);

		var bstream = Components.classes["@mozilla.org/binaryinputstream;1"].
		                    createInstance(Components.interfaces.nsIBinaryInputStream);

		bstream.setInputStream(istream);

		var bytes = bstream.readBytes(bstream.available());

		var data = prefix+bytes+"\r\n--"+boundary+"--";
	
		return data;
	}
	

}