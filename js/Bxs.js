/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs = {
	
	location: {
		admin: "http://"+window.location.hostname+"/admin",
		root: "http://"+window.location.hostname
	},
	
	reqBxtVersion: "1.0.7.2",
	
	mainDeck: $("#bxs-deck-main"),

	service: {
		get: function(serviceRequest) {
			serviceRequest.mode = Bxs.mode;
			var requesterElement = document.createElement("serviceRequester");
			document.documentElement.appendChild(requesterElement);
			requesterElement.serviceRequest = serviceRequest;
			var respond = function() {
				serviceRequest.response = requesterElement.response;
				if (typeof serviceRequest.callback === "function") {
					serviceRequest.callback(serviceRequest.response);
				}
				document.documentElement.removeChild(requesterElement);
				delete requesterElement;
			}
			$(requesterElement).one("ServiceResponse",respond);

			var ev = document.createEvent("Events");
			ev.initEvent("ServiceRequest", true, false);
			requesterElement.dispatchEvent(ev);
		},

	},
	
	logoutButton: $("#logoutButton"),

	login: {
		controls: {
			submit:   $("#loginSubmit"),
			username: $("#loginUsername"),
			password: $("#loginPassword"),
			status:   $("#loginStatus"),
			deck:     $("#loginDeck")
		},
		setState: function(state) {
			return this.states[state]();
		},
		states: {
			start: function() {
				delete Bxs.auth;
				$(window).unbind("keydown");
				$(window).unbind("click");
				$(window).unbind("unload");
				$(window).unbind("beforeunload");
				Bxs.logoutButton.unbind("command");
				clearTimeout(Bxs.activityTimeout);
				Bxs.hideLogoutOverlay();
				Bxs.logoutButton.attr("label", "Log Out");
				Bxs.mainDeck.get(0).selectedIndex = 0;
				Bxs.login.controls.deck.get(0).selectedIndex = 0;
				Bxs.login.controls.username.removeAttr("disabled");
				Bxs.login.controls.password.removeAttr("disabled");
				Bxs.login.controls.submit.removeAttr("disabled");
				Bxs.login.controls.username.val("");
				Bxs.login.controls.password.val("");
				Bxs.login.controls.status.attr("label","");
				Bxs.login.controls.username.get(0).focus();
			},
			submit: function() {
				Bxs.login.controls.username.attr("disabled","true");
				Bxs.login.controls.password.attr("disabled","true");
				Bxs.login.controls.submit.attr("disabled","true");
				Bxs.login.controls.status.attr("label","Checking ...");
			},
			failure: function() {
				Bxs.login.setState("start");
				Bxs.login.controls.status.attr("label","Wrong username or password");
			},
			success: function() {
				Bxs.login.controls.status.attr("label","OK");
			},
			loggingOut: function() {
				Bxs.showLogoutOverlay();
				Bxs.logoutButton.attr("label", "Logging Out ...");
			}
		},
		start: function() {
			Bxs.login.setState("start");
		},
		submit: function() {
			Bxs.login.setState("submit");
			var request = Bxs.Ajax.login(Bxs.login.controls.username.val(),Bxs.login.controls.password.val());
		},
		passwordKeyPress: function(e) {
			
			switch (e.keyCode) {
				
				case KeyEvent.DOM_VK_RETURN:
				Bxs.login.submit();
				break;
			}
		},
		handleResponse: function(response) {
			switch (response.status) {
				case 200:
				Bxs.login.success(Bxs.Json.parse(response.text));
				break;
				case 401:
				Bxs.login.failure();
				break;
				default:
				Bxs.error.recoverable(response);
			}
		},
		success: function(response) {
			Bxs.login.setState("success");
			Bxs.auth = { 
				id: response.id,
				username: Bxs.login.controls.username.val(), 
				password: Bxs.login.controls.password.val() 
			};
			Bxs.boot.start();
		},
		failure: function() {
			Bxs.login.setState("failure");
		}

	},
		
	logout: function() {
		if (Bxs.auth === undefined) {
			return;
		}
		Bxs.login.setState("loggingOut");
		
		Bxs.Ajax.logout(Bxs.doLogout);
	},
	
	doLogout: function() {
		var req = {
			service: "clearHttpAuth",
			callback: function() {
				Bxs.Boxes.reset();
				Bxs.login.setState("start");
			}
		};
		Bxs.service.get(req);
	},
	
	showLogoutOverlay: function() {
		$("#logoutOverlay").show();
		$("#logoutOverlaySpinner").show();
	},
	
	hideLogoutOverlay: function() {
		$("#logoutOverlay").hide();
		$("#logoutOverlaySpinner").hide();
	},
	
	activity: function() {
		clearTimeout(Bxs.activityTimeout);
		Bxs.activityTimeout = setTimeout(Bxs.noActivity,Bxs.Conf.activityTimeout);
	},
	
	noActivity: function() {
		Bxs.login.controls.status.attr("label","Session timed out");
		Bxs.logout();
	},
	
	checkBeforeUnload: function() {
		var e = e || window.event;
		if (e) {
			e.returnValue = 'If you do wish to leave the page, you will be logged out automatically.';
		}
		return 'If you do wish to leave the page, you will be logged out automatically.';
	},
	
	boot: {
		controls: {
			scriptsStatus:    $("#scriptsStatus"),
			scriptsProgress:  $("#scriptsProgress"),
			boxesStatus:      $("#boxesStatus"),
			boxesProgress:    $("#boxesProgress"),
		},
		setState: function(state) {
			return this.states[state]();
		},
		states: {
			start: function() {
				$(Bxs.eventsPublisher).unbind("scriptLoaded");
				$(Bxs.eventsPublisher).unbind("boxBuilt");
				Bxs.boot.controls.scriptsStatus.attr("hidden","true");
				Bxs.boot.controls.scriptsProgress.val(0);
				Bxs.boot.controls.boxesStatus.attr("hidden","true");
				Bxs.boot.controls.boxesProgress.val(0);
				Bxs.login.controls.deck.get(0).selectedIndex = 1;
				$(Bxs.eventsPublisher).bind("scriptLoaded",function(e,data) {
					var percent = Math.round((data * 100)/Bxs.Scripts.count);
					Bxs.boot.controls.scriptsProgress.val(percent);
				});
				$(Bxs.eventsPublisher).bind("boxBuilt",function(e,data) {
					var percent = Math.round((data * 100)/Bxs.Boxes.count);
					Bxs.boot.controls.boxesProgress.val(percent);
					if (data === Bxs.Boxes.count) {
						Bxs.boot.setState("complete");
					}
				});
			},
			loadingScripts: function() {
				Bxs.boot.controls.scriptsStatus.removeAttr("hidden");
			},
			buildingBoxes: function() {
				Bxs.boot.controls.boxesStatus.removeAttr("hidden");
			},
			complete: function() {
				$(window).bind("keydown",Bxs.activity);
				$(window).bind("click", Bxs.activity);
				$(window).bind("unload", Bxs.logout);
				$(window).bind("beforeunload",Bxs.checkBeforeUnload);
				Bxs.logoutButton.one("command", Bxs.logout);
				Bxs.activityTimeout = setTimeout(Bxs.noActivity,Bxs.Conf.activityTimeout);
				Bxs.mainDeck.get(0).selectedIndex = 1;
			}
		},
		start: function() {
			Bxs.boot.setState("start");
			Bxs.boot.setState("loadingScripts");
			Bxs.Scripts.load();
			Bxs.boot.setState("buildingBoxes");
			Bxs.Factory.Box.init();
		}
	},
	
	error: {
		fatal: function(msg) {
			// TODO make sure all errors are notified (by POSTING to server://base/errors ?)
			try {
				console.debug(msg);
			}
			catch(e) {}
			setTimeout(function() { alert("Fatal error: \n"+msg+"\n\nPlease reload Boxes and try again. If errors continue please contact support."); }, 1)
			Bxs = null;
		},
		recoverable: function(response) {
			setTimeout(function() { alert("Error "+response.status+": "+response.text); }, 1)
		}
	},
	
	serverError: function(response) {
			setTimeout(function() { alert("Error "+response.status+": "+response.text); }, 1)
	},
	
	promptForBxtDownload: function() {
		var ok = confirm("Boxes needs to download an extension called Bxtension to help with some of its functions. Is this OK with you?");
		if (ok) {
			window.location = "http://bxtension.googlecode.com/svn/dist/current/bxtension.xpi";
		}
		else {
			confirm("Boxes will not function correctly without Bxtension.");
		}
	},
	
	promptForBxtUpdate: function() {
		var ok = confirm("Boxes needs to update Bxtension. Is this OK with you?");
		if (ok) {
			window.location = "http://bxtension.googlecode.com/svn/dist/current/bxtension.xpi";
		}
		else {
			confirm("Boxes will not function correctly without Bxtension.");
		}
	},
	
	init: function() {
		
		document.title = "Boxes: "+window.location.hostname;
		Bxs.mode = Bxs.Parser.queryString(document.location.search)["debug"] === "true" ? "debug" : "production";
		
		if (document.documentElement.getAttribute("bxt-version") === "") {
			Bxs.promptForBxtDownload();
		}
		else if (document.documentElement.getAttribute("bxt-version").toString().replace(".","") < 
			Bxs.reqBxtVersion.replace(".","")) {
			Bxs.promptForBxtUpdate();	
		}
		else {
			Bxs.login.controls.submit.bind("command",Bxs.login.submit);
			Bxs.login.controls.password.bind("keypress",Bxs.login.passwordKeyPress);
			Bxs.eventsPublisher = $("#eventsPublisher").get(0);
			Bxs.login.start();
		}
	}
};

$(window).one("load",Bxs.init);
