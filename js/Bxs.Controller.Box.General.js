/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

if (Bxs.Controller.Box === undefined) {
	Bxs.Controller.Box = {};
}

Bxs.Controller.Box.General = function () {
	
}

Bxs.Controller.Box.General.prototype = $.extend(true,{},
	
	Bxs.Controller.Abstract.prototype, 
	
	{		
		setupObserves: function() {
			
			var self = this;
			
			if (self.view.attrs.observing !== undefined) {

				var observedId = self.view.attrs.observing;

				$(Bxs.eventsPublisher).bind("selectionChanged."+observedId,function() {
					self.observedSelectionChanged();
				});
				$(Bxs.eventsPublisher).bind("contentChanged."+observedId,function() {
					self.observedContentChanged();
				});
			}
			$(Bxs.eventsPublisher).bind("dataRequested."+self.view.attrs.id,function() {
				self.observedDataRequested();
			});
			$(Bxs.eventsPublisher).bind("dataChanged",function(e,dataObject) {
				if (dataObject.source !== self.view.attrs.id) {
					self.observedDataChanged(dataObject);
				}
			});
		},
		
		observedSelectionChanged: function() {
			this.loadDataDelayed();
		},
		
		observedContentChanged: function() {
			
			this.view.clearContent();
			this.view.setState("inactive");
		},
		
		observedDataRequested: function() {
			
			this.loadDataDelayed();
		},
		
		observedDataChanged: function(dataObject) {
		},
		
		loadDataDelayed: function() {
			
			var self = this;
			
			if (self.selectionTimer !== undefined) {
				clearTimeout(self.selectionTimer);
			}
			self.selectionTimer = setTimeout(function() { self.loadData(); },500);
		},
	
		loadData: function() {
			
			var self = this;

			if (!self.view.isVisible()) {
				self.view.onVisibility(function() { self.loadData(); });
				return;
			}
			self.view.setState("busy");

			var url = self.parseUrl(),
				options = self.view.hasFilters() ? self.view.getFilterOptions() : {};
			
			$(Bxs.eventsPublisher).one("dataLoaded."+self.view.attrs.id,function(e,data) {
				self.view.render(data);
			});

			Bxs.Ajax.getJSON(
				// TODO error handling
				url,
				function(data) {
					$(Bxs.eventsPublisher).trigger("dataLoaded."+self.view.attrs.id,[data]);	
				},
				options
			);
		},
		
		getCsv: function() {
			var self = this,
				url = self.parseUrl(),
				options = self.view.hasFilters() ? self.view.getFilterOptions() : {};
				
				options.format = "csv";
				options.download = "true";
				
				Bxs.Downloads.create(url, options, false);
		},
		
		refresh: function(forceRefresh) {
			this.view.activate(forceRefresh);
		},
		
		parseUrl: function(shortUrl) {
			
			if (shortUrl === true) {
				return "/"+this.view.attrs.rootUrl.split("/").reverse().shift();
			}
			
			if (this.view.hasForeignFilters()) {
				var url = this.view.getForeignFilters();
				if (url !== null) {
					return url;
				}
			}
			
			var url = this.view.attrs.rootUrl;
			// This replaces any occurence of ^:\w* with the selected id of the single observed box.
			// Do we need to account for multiple observeds? In which case it should replace specific matches
			// with the relevant property.
			if (this.view.attrs.observing !== undefined) {
				url = this.view.attrs.rootUrl.replace(
					/:\w*/g,
					this.view.getObservedBox().view.getSelectedId()
				);
			}
			
			return url;
		},
	
		commands: {
		
			edit: function() {

				if (!this.view.editable()) {
					return;
				}

				switch (this.view.getState()) {
					case "active":
					this.editOpen();
					break;
				
					case "editing":
					case "creating":
					this.transmitData();
					break;
				
					default:
					return;
				}
			},
		
			confirm: function() {

				if (!this.view.editable()) {
					return;
				}
			
				switch (this.view.getState()) {
				
					case "editing":
					case "creating":
					this.transmitData();
					break;
				
					default:
					return;
				}
			},
			
			cancel: function() {
			
				if (!this.view.editable()) {
					return;
				}
				
				switch (this.view.getState()) {
					
					case "editing":
					case "creating":
					this.editClose({ state: "cancel" });
					var self = this;
					$(Bxs.eventsPublisher).trigger("actionCancel."+self.view.attrs.id);
					break;
				
					default:
					return;
				}
			},
		},
	
		editOpen: function() {
			var self = this;
			
			Bxs.Boxes.disable();
			self.view.setState("opening");
			self.view.editOpen();
		},
	
		editClose: function(options) {
			Bxs.Boxes.enable();
			this.view.editClose(options);
			this.view.setState("ready");
		},
		
		transmitData: function() {

			this.view.setState("communicating");
			
			var data = this.view.getEditedData(),
				transmitType = "update";
				
			if (this.view.getPreviousState() === "creating") {
				transmitType = "insert";
			}
			
			if (this.view.attrs.id === "users" && transmitType === "update") {
				if (data.id == Bxs.auth.id) {
					if ((data.password !== Bxs.auth.password && data.password !== '')
						|| data.username !== Bxs.auth.username) {
						var self = this;
						$(Bxs.eventsPublisher).one("dataChanged",function(e, dataObject) {
							if (dataObject.source === self.view.attrs.id && dataObject.data.id == Bxs.auth.id) {
								self.bounceUser("Your username or password has changed - please log in again with your new details.");
							}
						});
					}
				}
			}
				
			this[transmitType](data);
		},
		
		bounceUser: function(msg) {
			alert(msg);
			Bxs.doLogout();
		},
		
		update: function(data) {
			
			var url = this.parseUrl(),
				self = this;

			Bxs.Ajax.put(url,data,function(response) {
          self.handleData(response,"update", null, url);
      });
		},
		
		handleData: function(response, action, deletedId, url) {
			
			var self = this;
        if (action === "update" && response.status === 204) {
            return Bxs.Ajax.get(url, function(newResponse) { self.handleData(newResponse, "update"); });
        }
        
			if (Bxs.Response.success(action,response.status)) {
				self.handleAction(action,response);

				var newData = (response.text === "" || response.text === "null") ? {} : Bxs.Json.parse(response.text);
				if (action === "delete") {
					newData = { id: deletedId };
				}
				
				$(Bxs.eventsPublisher).trigger("dataChanged",[{
					name: self.view.attrs.name,
					source: self.view.attrs.id, 
					action: action,
					data: newData
				}]);
			}
			else {
				self.recoverError(response);
				return;
			}
		},
		
		handleAction: function(action,response) {
			$(Bxs.eventsPublisher).trigger("action"+$.string(action).capitalize().str+"."+this.view.attrs.id);
			return this.handlers[action](this,response);
		},
		
		handleDropEvent: function(e) {
		},
		
		handlers: {
			update: function(self,response) {
				var newData = Bxs.Json.parse(response.text);
				self.view.updateEditView(newData);
				self.editClose({ state: "complete" });
			}
		},
		
		recoverError: function(response) {
			Bxs.error.recoverable(response);
			this.view.setState(this.view.getPreviousState());
		},
	
		init: function() {
		
			var self = this;
			
			self.setupObserves();
			self.view.boot();
			self.view.activate();
		}
	}
);
