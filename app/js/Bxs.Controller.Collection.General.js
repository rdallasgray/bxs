/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

if (Bxs.Controller.Collection === undefined) {
	Bxs.Controller.Collection = {};
}

Bxs.Controller.Collection.General = function () {
	
}

Bxs.Controller.Collection.General.prototype = $.extend(true,{},
	
	Bxs.Controller.Abstract.prototype, 
	
	{
		loadSchema: function() {
			
			if (this.schema === undefined) {
				
				var self = this;
			
				var url = self.parseUrl(true);
	
				Bxs.Ajax.getSchema(url,function(data) {
						self.schema = data;
						$(Bxs.eventsPublisher).trigger("schemaLoaded."+self.attrs.id,[self]);
					}
				);
			}
		},
		
		setupObserves: function() {
			
			var self = this;
			
			if (self.attrs.observing !== undefined) {
				var observedId = self.attrs.observing;

				$(Bxs.eventsPublisher).bind("selectionChanged."+observedId,function() {
					self.observedSelectionChanged();
				});
				$(Bxs.eventsPublisher).bind("contentChanged."+observedId,function() {
					self.observedContentChanged();
				});
			}
		},
		
		observedSelectionChanged: function() {
			
			this.loadData();
		},
		
		observedContentChanged: function() {
			
			this.view.clearContent();
			this.setState("inactive");
		},
		
		observedFilterChanged: function() {
			
			if (this.defaultValues !== undefined) {
				this.loadData();
			}
		},
		
		setDefaultValues: function(values) {
			
			values = values || {};
			
			if (this.defaultValues === undefined) {
				this.defaultValues = {};
			}
			if (this.attrs.observing !== undefined) {
				var key = /:\w*/.exec(this.attrs.rootUrl)[0].substr(1);
				if (values[key] === undefined) {
					values[key] = $("#"+this.attrs.observing+"_broadcaster").attr("selectedId");
				}
			}
			
			this.defaultValues = values;
		},
		
		getFilterOptions: function() {
			
			if (this.filters === undefined) {
				return {};
			}
			
			var options = {};
			
			$.each(this.filters, function() {
				if (this.getValue() !== "null") {
					options[this.name] = this.getValue();
				}
			});
			
			return options;
		},
	
		loadData: function() {
						
			var self = this,
				url = self.parseUrl(),
				options = self.getFilterOptions(),
				loadFunc = function() {
					
					if (!self.view.isVisible()) {
						self.view.onVisibility(loadFunc);
						return;
					}
			
					self.setState("busy");
		
					$(Bxs.eventsPublisher).one("dataLoaded."+self.attrs.id,function(e,data) {
						self.view.setContent(data);
					});
					$(Bxs.eventsPublisher).one("viewReady."+self.attrs.id,function() {
						self.setState("ready");
					});
			
					Bxs.Ajax.get(
						url,
						function(data) {
							$(Bxs.eventsPublisher).trigger("dataLoaded."+self.attrs.id,[data]);	
						},
						options
					);
					self.setDefaultValues();
				};

			if (this.selectionTimer !== undefined) {
				clearTimeout(this.selectionTimer);
			}
			self.selectionTimer = setTimeout(loadFunc,250);
		},
		
		getLabelForAssociatedField: function(fieldName,id) {
			
			Bxs.Ajax.getMetadata(fieldName,function(metadata) {
				
				Bxs.Ajax.get(metadata.url+"/"+id, function(data) {
					$(Bxs.eventsPublisher).trigger("loadedLabelFor."+fieldName+"-"+id,[data]);
				});
				
			});
		},
		
		parseUrl: function(shortUrl) {
			// TODO Bxs.Url should take this over
			if (shortUrl === true) {
				return "/"+this.attrs.rootUrl.split("/").reverse().shift();
			}
			
			var self = this,
				split = self.attrs.rootUrl.split('/');
				
			if (split.length == 2) {
				return self.attrs.rootUrl;
			}
			
			$.each(split,function(idx) {
				var str = this.toString();
				if ($.string(str).startsWith(":")) {
					split[idx] = $(Bxs.Boxes.getById(self.attrs.observing).controller.broadcaster).attr("selectedId");
				}
			});
			
			return split.join("/");
		},
	
		commands: {
		
			edit: function() {
				
				if (this.view.getSelectedRow() === null) {
					return;
				}
			
				switch (this.getState()) {
					case "ready":
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
				
				if (this.view.getSelectedRow() === null) {
					return;
				}
			
				switch (this.getState()) {
				
					case "editing":
					case "creating":
					this.transmitData();
					break;
				
					default:
					return;
				}
			},
			
			cancel: function() {
			
				if (this.view.getSelectedRow() === null) {
					console.debug("returning");
					return;
				}
				
				switch (this.getState()) {
					
					case "editing":
					case "creating":
					this.editClose({ state: "cancel" });
					var self = this;
					$(Bxs.eventsPublisher).trigger("actionCancel."+self.attrs.id);
					break;
				
					default:
					return;
				}
			},
			newRow: function() {
				
				switch (this.getState()) {
					case "ready":
					this.createRow();
					break;
				
					default:
					return;
				}
			},
		
			deleteRow: function() {
			
				if (this.view.getSelectedRow() === null) {
					return;
				}
				
				if (!this.view.confirmDelete()) {
					return;
				}
				
				this.setState("deleting");
			
				var url = this.parseUrl()+"/"+$(this.broadcaster).attr("selectedId"),
					self = this;
			
				Bxs.Ajax.deleteRow(url,function(response) { self.handleData(response,"delete"); });
			},
		},
		
		createRow: function() {
			var values = this.defaultValues || null;
			this.view.editOpen({state: "creating", values: values});
			this.setState("creating");
		},
	
		editOpen: function() {
			Bxs.Boxes.disable();
			this.view.editOpen();
			this.setState("editing");
		},
	
		editClose: function(options) {
			Bxs.Boxes.enable();
			this.view.editClose(options);
			this.setState("ready");
		},
		
		transmitData: function() {
			
			this.setState("communicating");
			
			var data = this.view.getEditedData(),
				transmitType = "update";
				
			if (this.getPreviousState() === "creating") {
				transmitType = "insert";
			}
			
			this[transmitType](data);
		},
		
		update: function(data) {
			
			var url = this.parseUrl(true)+"/"+data.id,
				self = this;
			
			Bxs.Ajax.put(url,data,function(response) { self.handleData(response,"update"); });
		},
		
		insert: function(data) {
			
			var url = this.parseUrl(),
				self = this;
				
			Bxs.Ajax.post(url,data,function(response) { self.handleData(response,"insert"); });
		},
		
		handleData: function(response,action) {
			
			var self = this;

			switch (action) {
				
				case "delete":
				if (response.status !== 204) {
					self.recoverError(response);
					return;
				}
				self.handleDelete(response);
				break;
				
				case "insert":
				if (response.status !== 201) {
					self.recoverError(response);
					return;
				}
				self.handleInsert(response);
				break;
				
				case "update":
				if (response.status !== 200) {
					self.recoverError(response);
					return;
				}
				self.handleUpdate(response);
				break;
			}

			var newData = (response.text === "") ? {} : Bxs.Json.parse(response.text);
			
			$(Bxs.eventsPublisher).trigger("dataChanged",[{ box: self.attrs.name, action: action, data: newData }]);
		},
		
		handleDelete: function(response) {
			this.view.completeDeletion();
			this.setState("ready");
		},
		
		handleInsert: function(response) {
			this.handleUpdate(response);
		},
		
		handleUpdate: function(response) {
			var newData = Bxs.Json.parse(response.text);
			this.view.updateEditedRow(newData);
			this.editClose({ state: "complete" });
		},
		
		recoverError: function(response) {
			Bxs.serverError(response);
			self.setState(self.getPreviousState());
		},

		states: {
			busy: function() {
			},
			ready: function() {
				var self = this;
				$(Bxs.eventsPublisher).trigger("ready."+this.attrs.id,[self]);
			},
			editing: function() {
			},
			creating: function() {
			},
			communicating: function() {
			},
			deleting: function() {
			}
		},
	
		init: function() {
		
			var self = this;
			
			self.forwardState(self.view);
			
			self.setupObserves();
		
			$(Bxs.eventsPublisher).one("schemaLoaded."+self.attrs.id,function() {
				self.view.boot(self.schema);
			});
		
			if (self.attrs.observing === undefined && self.attrs.suppressList === undefined) {
				$(Bxs.eventsPublisher).one("viewBooted."+self.attrs.id,function() {
					self.loadData();
				});
			}
			else {
				$(Bxs.eventsPublisher).one("viewBooted."+self.attrs.id,function() {
					var state = (self.attrs.observing !== undefined) ? "inactive" : "ready";
					self.setState(state);
				});
			}
		
			$(Bxs.eventsPublisher).one("viewBooted."+self.attrs.id,function() {
				$(self.view.domNode).bind("select",function() {

					var colType = self.view.columnType;
				
					if ($(self.broadcaster).attr("selectedId") !== $(self.view.getSelectedRow()).children(colType+"[name='id']").attr("value")
						&& !!$(self.view.getSelectedRow()).children(colType+"[name='id']").attr("value")) 
					{
						$(self.broadcaster).attr("selectedId",$(self.view.getSelectedRow()).children(colType+"[name='id']").attr("value"));
						$(Bxs.eventsPublisher).trigger("selectionChanged."+self.attrs.id,[self]);
					}
				});
			});
		
			this.loadSchema();

		},
		
		addFilter: function(filter) {
			
			if (this.filters === undefined) {
				this.filters = {};
			}
			
			this.filters[filter.name] = filter;
			
			var self = this;
			
			$(filter.getDomNode()).bind("command", function() {
				self.observedFilterChanged();
			})
		}
	}
);
