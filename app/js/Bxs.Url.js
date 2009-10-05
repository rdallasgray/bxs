Bxs.Url = {
	
	hasProtocol: function(url) {
		return $.url.setUrl(url).attr("protocol") !== null;
	},
	
	hasQueryString: function(url) {
		return $.url.setUrl(url).attr("query") !== null;
	},
	
	root: function(path) {
		var path = path || "";
		return $.url.setUrl().attr("protocol")+"://"+$.url.attr("host")+path;
	},
	
	app: function(path) {
		var path = path || "";
		return Bxs.Url.root("/Bxs/app"+path);
	},
	
	login: function() {
		return Bxs.Url.root("/admin/auth/login");
	},
	
	logout: function() {
		return Bxs.Url.root("/admin/auth/logout");
	},
	
	metadata: function() {
		return Bxs.Url.root()+"/admin/metadata";
	},
	
	construct: function(path,options) {
		
		var options = options || { includeFormat: true },
			path = path.replace(/^\//,"").replace(/^:[a-zA-Z]*/,function(str) { return Bxs.Url[str.substr(1)](); });
				
		if (!Bxs.Url.hasProtocol(path)) {
			path = Bxs.Url.root("/"+path);
		}
		if (Bxs.Url.hasQueryString(path) && options.includeFormat === true) {
			path += "&format=json";
		}
		// TODO use http accept instead of format=json
		else if (options.includeFormat === true) {
			path += "?format=json";
		}
		return path;
	}
	
}