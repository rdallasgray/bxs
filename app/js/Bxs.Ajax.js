/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Ajax = {
	
	auth: function(username,password) {
		var req = {
			service: "authenticatedRequest",
			options: {
				method: "GET",
				url: Bxs.location.admin+"/auth/login?format=json",
				username: username,
				password: password
			},
			callback: function() {
				Bxs.login.handleResponse(req.response);
			}
		};
		Bxs.service.get(req);
	},
	
	get: function(url,callback,options) {
		
		var queryString = (typeof options === "object") ? $.param(options) : false,
			fullUrl = queryString ? url+"?"+queryString : url,
			data;
		
		if (Bxs.Cache.get(["inProgress",fullUrl])) {
			$(Bxs.eventsPublisher).one("ajaxGetSuccess."+fullUrl,function(e,data,notModified) {
				if (typeof callback === "function") {
					callback(data,notModified);
				}
			});
			return;
		}
		
		var sendOptions = { format: "json" };
		
		if (typeof options === "object") {
			for (var i in options) {
				sendOptions[i] = options[i];
			}
		}

		var ajaxGet = $.getJSON(url,sendOptions,function(data) {

			var notModified = false,
				etag = ajaxGet.getResponseHeader("Etag"),
				cachedEtag = Bxs.Cache.get(["Etags",fullUrl]);

			if (etag !== null) {
				if (cachedEtag === etag) {
					notModified = true;
				}
				else {
					Bxs.Cache.set(["Etags",fullUrl],etag);
				}
			}
			
			if (typeof callback === "function") {
				callback(data,notModified);
			}

			$(Bxs.eventsPublisher).trigger("ajaxGetSuccess."+fullUrl,[ data, notModified ]);

			Bxs.Cache.clear(["inProgress",fullUrl]);
		});
		
		Bxs.Cache.set(["inProgress",fullUrl],ajaxGet);
	},
	
	getMetadata: function(name,callback) {
		
		var cached = Bxs.Cache.get(["metadata",name]);
		
		if (cached) {
			callback(cached);
		}
		
		else {
			this._authenticatedRequest(Bxs.location.admin+"/metadata/"+name,"GET",null,function(response) {
				var metadata = Bxs.Json.parse(response.text);
				Bxs.Cache.set(["metadata",name],metadata);
				callback(metadata);
			});
		}
		
	},
	
	getSchema: function(table,callback) {
		
		var cached = Bxs.Cache.get(["schema",table]);
		
		if (cached) {
			callback(cached);
		}
		
		else {
			this._authenticatedRequest(Bxs.location.root+"/"+table+"/new","GET",null,function(response) {
				var schema = Bxs.Json.parse(response.text);
				Bxs.Cache.set(["schema",table],schema);
				callback(schema);
			});
		}
		
	},
	
	put: function(url,data,callback) {
		this._authenticatedRequest(Bxs.location.root+url,"PUT",data,callback);
	},
	
	post: function(url,data,callback) {
		this._authenticatedRequest(Bxs.location.root+url,"POST",data,callback);
	},
	
	deleteRow: function(url,callback) {
		this._authenticatedRequest(Bxs.location.root+url,"DELETE",null,callback);
	},
		
	_authenticatedRequest: function(url,method,data,callback) {
		
		data = (data !== null) ? Bxs.Json.stringify(data) : null;
		
		var req = {
			service: "authenticatedRequest",
			options: {
				method: method,
				url: url+"?format=json",
				username: Bxs.auth.username,
				password: Bxs.auth.password
			},
			data: data,
			callback: callback
		};
		Bxs.service.get(req);
	}
	
};