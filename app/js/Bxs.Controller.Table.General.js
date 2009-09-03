/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

if (Bxs.Controller.Table === undefined) {
	Bxs.Controller.Table = {};
}

Bxs.Controller.Table.General = function () {
	
}

Bxs.Controller.Table.General.prototype = $.extend(true,{},
	
	Bxs.Controller.Abstract.prototype, 
	
	{
		loadSchema: function() {
			
			if (this.schema === undefined) {
				
				var self = this;
			
				var table = self.parseUrl(true);
	
				Bxs.Ajax.getSchema(table,function(data) {
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
				$(Bxs.eventsPublisher).bind("listChanged."+observedId,function() {
					self.observedListChanged();
				});
			}
		},
		
		observedSelectionChanged: function() {
			
			this.listWithDelay();
		},
		
		observedListChanged: function() {
			
			this.view.removeAllRows();
			this.setState("inactive");
		},
		
		observedFilterChanged: function() {
			
			if (this.defaultValues !== undefined) {
				this.listWithDelay();
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
		
		listWithDelay: function() {
			
			if (this.selectionTimer !== undefined) {
				clearTimeout(this.selectionTimer);
			}
			var self = this;
			self.selectionTimer = setTimeout(function() { self.list(); self.setDefaultValues(); },250);
		},
	
		list: function() {
		
			var self = this;
			
			if (!self.view.isVisible()) {
				self.view.onVisibility(function() {
					self.list();
				});
				return;
			}
			
			self.setState("busy");
		
			$(Bxs.eventsPublisher).one("dataLoaded."+self.attrs.id,function(e,data) {
				self.view.list(data);
			});
			$(Bxs.eventsPublisher).one("viewReady."+self.attrs.id,function() {
				self.setState("ready");
			});
			setTimeout(function() { self.loadData(); },250);
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
				options = self.getFilterOptions();
		
			Bxs.Ajax.get(
				Bxs.location.root+url,
				function(data) {
					$(Bxs.eventsPublisher).trigger("dataLoaded."+self.attrs.id,[data]);	
//					$(self.view.domNode).attr("url",url);
				},
				options
			);
		},
		
		getData: function(id) {

			var self = this;

			if (self.getState() !== "ready") {
				return false;
			}
						
			var data = [];

			var getRowData = function(row) {
				
				var dataRow = {};
				
				$.each($(row).children("listcell"), function() {
					dataRow[$(this).attr("name")] = $(this).attr("value");
				});
				
				return dataRow;
			}
			
			if (id !== undefined) {
				return getRowData($(self.view.domNode).find("listcell[name='id'][value='"+id+"']").parent("listitem").get(0));
			}
			
			$.each($(self.view.domNode).children("listitem"),function() {
				var row = this;
				data.push(getRowData(row));
			});
			
			return data;
			
		},
		
		getLabelForAssociatedField: function(fieldName,id) {
			
			Bxs.Ajax.getMetadata(fieldName,function(metadata) {
				
				Bxs.Ajax.get(Bxs.location.root+"/"+metadata.url+"/"+id, function(data) {
					$(Bxs.eventsPublisher).trigger("loadedLabelFor."+fieldName+"-"+id,[data]);
				});
				
			});
		},
		
		parseUrl: function(shortUrl) {
			
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
					split[idx] = $(Bxs.Tables.getById(self.attrs.observing).controller.broadcaster).attr("selectedId");
				}
			});
			
			return split.join("/");
		},
		
		getLocation: function() {
			return Bxs.location.root+this.parseUrl();
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
			Bxs.Tables.disable();
			this.view.editOpen();
			this.setState("editing");
		},
	
		editClose: function(options) {
			Bxs.Tables.enable();
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
					Bxs.serverError(response);
					self.setState(self.getPreviousState());
					return;
				}
				self.handleDelete(response);
				break;
				
				case "insert":
				if (response.status !== 201) {
					Bxs.serverError(response);
					self.setState(self.getPreviousState());
					return;
				}
				self.handleInsert(response);
				break;
				
				case "update":
				if (response.status !== 200) {
					Bxs.serverError(response);
					self.setState(self.getPreviousState());
					return;
				}
				self.handleUpdate(response);
				break;
			}

			var newData = (response.text === "") ? {} : Bxs.Json.parse(response.text);
			
			$(Bxs.eventsPublisher).trigger("dataChanged",[{ table: self.attrs.name, action: action, data: newData }]);
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
					self.list();
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
