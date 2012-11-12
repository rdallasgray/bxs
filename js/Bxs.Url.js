Bxs.Url = {
	
	hasProtocol: function(url) {
		return $.url.setUrl(url).attr("protocol") !== null;
	},
	
	hasQueryString: function(url) {
		return $.url.setUrl(url).attr("query") !== null;
	},
	
	root: function(path) {
		var path = path || "";
		return $.url.setUrl().attr("base").slice(0, -1) + path;
	},
	
	app: function(path) {
		var path = path || "";
		return Bxs.Url.root("/Bxs/app"+path);
	},
	
	login: function() {
		return Bxs.Url.root(Bxs.Conf.auth.loginUrl);
	},
	
	logout: function() {
		return Bxs.Url.root(Bxs.Conf.auth.logoutUrl);
	},
	
	metadata: function() {
		return Bxs.Url.root()+Bxs.Conf.metadataUrl;
	},
	
	construct: function(path,options) {
		var queryString = (typeof options === "object") ? $.param(options) : "",
			path = (queryString === "") ? path : path+"?"+queryString,
			path = path.replace(/^\//,"").replace(/^:[a-zA-Z]*/,function(str) { return Bxs.Url[str.substr(1)](); });
				
		if (!Bxs.Url.hasProtocol(path)) {
			path = Bxs.Url.root("/"+path);
		}
		
		return path;
	}
	
}
