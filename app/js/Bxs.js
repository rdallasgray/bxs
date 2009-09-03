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
	
	mainDeck: $("#mainDeck"),

	service: {
		get: function(serviceRequest) {
			var requesterElement = document.createElement('serviceRequester');
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

	login: {
		controls: {
			submit:   $('#loginSubmit'),
			username: $('#loginUsername'),
			password: $('#loginPassword'),
			status:   $('#loginStatus'),
			deck:     $('#loginDeck')
		},
		setState: function(state) {
			return this.states[state]();
		},
		states: {
			start: function() {
				Bxs.login.controls.deck.get(0).selectedIndex = 0;
				Bxs.login.controls.username.get(0).enable();
				Bxs.login.controls.password.get(0).enable();
				Bxs.login.controls.submit.get(0).enable();
				Bxs.login.controls.username.val('');
				Bxs.login.controls.password.val('');
				Bxs.login.controls.status.get(0).label = '';
				delete Bxs.auth;
				Bxs.login.controls.username.get(0).focus();
			},
			submit: function() {
				Bxs.login.controls.username.get(0).disable();
				Bxs.login.controls.password.get(0).disable();
				Bxs.login.controls.submit.get(0).disable();
				Bxs.login.controls.status.get(0).label = 'Checking ...';
			},
			failure: function() {
				Bxs.login.setState("start");
				Bxs.login.controls.status.get(0).label = 'Incorrect username or password';
			},
			success: function() {
				Bxs.login.controls.status.get(0).label = 'OK';
				Bxs.auth = { username: Bxs.login.controls.username.val(), password: Bxs.login.controls.password.val() };
				Bxs.boot.start();
			}
		},
		reset: function() {
			Bxs.login.setState("start");
		},
		start: function() {
			Bxs.login.reset();
		},
		submit: function() {
			Bxs.login.setState("submit");
			var request = Bxs.Ajax.auth(Bxs.login.controls.username.val(),Bxs.login.controls.password.val());
		},
		submitOnEnter: function(e) {
			if (e.keyCode === KeyEvent.DOM_VK_RETURN) {
				Bxs.login.submit();
			}
		},
		handleResponse: function(response) {
			switch (response.status) {
				case 200:
				Bxs.login.success();
				break;
				case 401:
				Bxs.login.failure();
				break;
				default:
				Bxs.serverError(response);
			}
		},
		success: function() {
			Bxs.login.setState("success");
		},
		failure: function() {
			Bxs.login.setState("failure");
		}

	},
	
	boot: {
		controls: {
			scriptsStatus:     $('#scriptsStatus'),
			scriptsProgress:   $('#scriptsProgress'),
			tablesStatus:      $('#tablesStatus'),
			tablesProgress:    $('#tablesProgress'),
		},
		setState: function(state) {
			return this.states[state]();
		},
		states: {
			start: function() {
				Bxs.boot.controls.scriptsStatus.get(0).hide();
				Bxs.boot.controls.scriptsProgress.val(0);
				Bxs.boot.controls.tablesStatus.get(0).hide();
				Bxs.boot.controls.tablesProgress.val(0);
				Bxs.login.controls.deck.get(0).selectedIndex = 1;
			},
			loadingScripts: function() {
				Bxs.boot.controls.scriptsStatus.get(0).show();
			},
			buildingTables: function() {
				Bxs.boot.controls.tablesStatus.get(0).show();
			},
			complete: function() {
				Bxs.mainDeck.get(0).selectedIndex = 1;
			}
		},
		start: function() {
			Bxs.boot.setState("start");
			Bxs.boot.setState("loadingScripts");
			Bxs.Scripts.load();
			Bxs.boot.setState("buildingTables");
			Bxs.Factory.Table.init();
			Bxs.boot.setState("complete");
		}
	},
	
	serverError: function(response) {
		alert(response.status+': '+response.text);
	},
	
	init: function() {		
		Bxs.login.controls.submit.bind('command',Bxs.login.submit);
		Bxs.login.controls.password.bind('keypress',Bxs.login.submitOnEnter);
		Bxs.eventsPublisher = $("#eventsPublisher").get(0);
		Bxs.login.start();
	},

};

$(window).one('DOMContentLoaded',Bxs.init);
