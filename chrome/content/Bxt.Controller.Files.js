/*

Copyright (c) 2009 Robert Johnston

This file is part of Bxtension.

Bxtension is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Bxtension is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Bxtension. If not, see http://www.gnu.org/licenses/.

*/

Bxt.Controller.Files = {

	pick: function(contentType) {

		var filterFromMimeType = function(mimeType) {

			var type = mimeType.split("/")[0],
			extension = mimeType.split("/")[1],
			types = {
				image: "Image files"
			},
			extensions = {
				jpeg: ["jpeg","jpg"]
			};

			var filter = [types[type], extensions[extension].map(function(el) "*."+el).join("; ")];

			return filter;
		}

		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);   
		picker.init(window, "Select File for Upload", nsIFilePicker.modeOpen);

		if (contentType !== undefined) {
			var filter = filterFromMimeType(contentType);
			picker.appendFilter(filter[0],filter[1]);
		}

		return (picker.show() === nsIFilePicker.returnOK) ? picker.file : false;
	}

};
