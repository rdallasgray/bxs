/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Ajax = {
	
	login: function(username,password) {
		var req = {
			service: "authenticatedRequest",
			options: {
				method: "POST",
				url: Bxs.Url.construct(":login"),
				headers: {
					Accept: "application/json, text/javascript, */*"
				},
				username: username,
				password: password
			},
			callback: function() {
				Bxs.login.handleResponse(req.response);
			}
		};
		Bxs.service.get(req);
	},
	
	logout: function(callback) {
		var req = {
			service: "authenticatedRequest",
			options: {
				method: "POST",
				url: Bxs.Url.construct(":logout"),
				headers: {
					Accept: "application/json, text/javascript, */*"
				},
				username: Bxs.auth.username,
				password: Bxs.auth.password
			},
			callback: callback
		};
		Bxs.service.get(req);
	},
	
	getJSON: function(url,callback,options) {

		var url = Bxs.Url.construct(url,options),
			data;

		var ajaxGet = $.getJSON(url,null,function(data) {
			
			if (ajaxGet.status === 401) {
				return Bxs.Ajax._authenticatedRequest(url,"GET",data,callback);
			}
						
			var notModified = false,
				etag = ajaxGet.getResponseHeader("Etag"),
				cachedEtag = Bxs.Cache.get(["Etags",url]);

			if (etag !== null) {
				if (cachedEtag === etag) {
					notModified = true;
				}
				else {
					Bxs.Cache.set(["Etags",url],etag);
				}
			}
						
			if (typeof callback === "function") {
				callback(data,notModified);
			}
		});
	},

	getSchema: function(url,callback) {
		var url = Bxs.Url.construct(url+"/new"),
 			cached = Bxs.Cache.get(["schema",url]);
		
		if (cached) {
			callback(cached);
		}
		
		else {
			this._authenticatedRequest(url,"GET",null,function(response) {
				var schema = Bxs.Json.parse(response.text);
				Bxs.Cache.set(["schema",url],schema);
				callback(schema);
			});
		}
		
	},
	
	preflight: function(url,callback) {
		var req = {
			service: "authenticatedRequest",
			options: {
				method: "HEAD",
				url: url,
				username: Bxs.auth.username,
				password: Bxs.auth.password
			},
			callback: function() {
				callback();
			}
		};
		Bxs.service.get(req);
	},
	
	put: function(url,data,callback) {
		this._authenticatedRequest(Bxs.Url.construct(url),"PUT",data,callback);
	},
	
	post: function(url,data,callback) {
		this._authenticatedRequest(Bxs.Url.construct(url),"POST",data,callback);
	},
	
	deleteRow: function(url,callback) {
		this._authenticatedRequest(Bxs.Url.construct(url),"DELETE",null,callback);
	},
		
	_authenticatedRequest: function(url,method,data,callback,type) {
		
		var data = (data !== null) ? Bxs.Json.stringify(data) : null,
			type = type || "application/json, text/javascript, */*",
			req = {
			service: "authenticatedRequest",
			options: {
				method: method,
				url: url,
				headers: {
					Accept: type
				},
				username: Bxs.auth.username,
				password: Bxs.auth.password
			},
			data: data,
			callback: callback
		};
		
		Bxs.service.get(req);
	}
	
};