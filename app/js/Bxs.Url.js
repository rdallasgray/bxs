Bxs.Url = {
	
	hasProtocol: function(url) {
		return $.url.setUrl(url).attr("protocol") !== null;
	},
	
	hasQueryString: function(url) {
		return $.url.setUrl(url).attr("query") !== null;
	},
	
	root: function() {
		return $.url.setUrl().attr("protocol")+"://"+$.url.attr("host");
	},
	
	auth: function() {
		return Bxs.Url.root()+"/admin/auth/login";
	},
	
	metadata: function() {
		return Bxs.Url.root()+"/admin/metadata";
	},
	
	construct: function(path,options) {
		var options = options || { includeFormat: true };
		
		path = path.replace(/^\//,"");
		path = path.replace(/^:[a-zA-Z]*/,function(str) { return Bxs.Url[str.substr(1)](); });
				
		if (!Bxs.Url.hasProtocol(path)) {
			path = Bxs.Url.root()+"/"+path;
		}
		if (Bxs.Url.hasQueryString(path) && options.includeFormat === true) {
			path += "&format=json";
		}
		else if (options.includeFormat === true) {
			path += "?format=json";
		}
		return path;
	}
	
}