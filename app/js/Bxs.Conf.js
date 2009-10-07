Bxs.Conf = {
	
	editor: {
			mode: "none",
			theme: "advanced",
			content_css: Bxs.Url.app("/css/basic-html.css"),
			gecko_spellcheck: true,
			theme_advanced_toolbar_location: "top",
			theme_advanced_toolbar_align: "left",
			theme_advanced_buttons1: "print,|,undo,redo,|,formatselect,bold,italic,underline,sub,sup,removeformat,|,bullist,numlist,blockquote,|,link,unlink",
			theme_advanced_buttons2: "",
			theme_advanced_buttons3: "",
			plugins: "paste,print"
	},
	
	css: {
		basic: Bxs.Url.app("/css/basic-html.css"),
		main: Bxs.Url.root("/css/main.css"),
		default: Bxs.Url.app("/css/basic-html.css"),
	},
	
	activityTimeout: 1800000,
	
	auth: {
		loginUrl: "/admin/auth/login",
		logoutUrl: "/admin/auth/logout"
	},
	
	metadataUrl: "/admin/metadata",
	
};