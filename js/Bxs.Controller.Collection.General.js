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
	
	Bxs.Controller.Box.General.prototype, 
	
	{
		loadSchema: function() {
			
			if (this.schema === undefined) {
				
				var self = this;
			
				var url = self.parseUrl(true);
	
				Bxs.Ajax.getSchema(url,function(data) {
						self.schema = data;
						self.schema.id = null;
						$(Bxs.eventsPublisher).trigger("schemaLoaded."+self.view.attrs.id,[self]);
					}
				);
			}
		},
		
		setupObserves: function() {
			
			Bxs.Controller.Box.General.prototype.setupObserves.apply(this);
			
			var self = this;

			$(Bxs.eventsPublisher).bind("filterChanged."+self.view.attrs.id,function() {
				self.observedFilterChanged();
			});
		},
		
		observedFilterChanged: function() {
			
			if (this.view.getState() === "inactive") {
				return;
			}
			this.loadDataDelayed();
		},
		
		observedDataChanged: function(dataObject) {
			if (dataObject.name === this.view.attrs.name) {
				//TODO it's more complicated than this ... would need to know, e.g., the id set by any observed box.
				return this["remote"+$.string(dataObject.action).capitalize().str](dataObject.data);
			}
			if (dataObject.action === "insert") {
				// Don't need to check associations for inserts
				return;
			}
			if (this.view.associations !== undefined && this.view.associations[dataObject.name] !== undefined) {
				this.checkAssociation(dataObject);
			}
		},
		
		checkAssociation: function(dataObject) {
			var columnName = this.view.associations[dataObject.name],
				id = dataObject.data.id,
				columns = Bxs.Xpath.getArray(
					this.view.getDomNode(),
					"descendant::xul:"+this.view.columnType+"[@name='"+columnName+"' and @value='"+id+"']"
				);
				
			if (columns.length === 0) {
				return;
			}
			if (dataObject.action === "update") {
				return this.updateAssociation(columns);
			}
			if (dataObject.action === "delete") {
				return this.deleteAssociation(columns);
			}
		},
		
		updateAssociation: function(columns,data) {
			
			var self =  this;
			
			columns.forEach(function(column) {
				self.view.labelAssociatedColumn(column,column.getAttribute("value"));
			});
		},
		
		deleteAssociation: function(columns) {
			
			var self = this;
			
			$(columns).each(function() {
				var row = $(this).parents(self.view.rowType);
				row.remove();
			});
		},
		
		loadRowData: function(url,options) {
			
			Bxs.Ajax.getJSON(
				url, 
				function(data) { $(Bxs.eventsPublisher).trigger("loadedRowData."+url,[data]); },
				options
			);
		},
		
		commands: $.extend(true, {}, Bxs.Controller.Box.General.prototype.commands, {
						
			newRow: function() {

				switch (this.view.getState()) {
					case "ready":
					case "active":
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
			
				var url = this.parseUrl()+"/"+this.view.getSelectedId(),
					self = this,
					id = $(this.view.getSelectedRow()).children(this.view.columnType+"[name='id']").attr("value");
				
				if (this.view.attrs.id === "users") {
					if (id == Bxs.auth.id) {
						var self = this;
						$(Bxs.eventsPublisher).one("dataChanged",function(e, dataObject) {
							if (dataObject.source === self.view.attrs.id 
								&& dataObject.data.id == Bxs.auth.id
								&& dataObject.action === "delete") {
								self.bounceUser("Your authorization data has been deleted. Please log in again.");
							}
						});
					}
				}
			
				Bxs.Ajax.deleteRow(url,function(response) { self.handleData(response,"delete",id); });
			}
		}),
		
		createRow: function() {
			
			var values = this.defaultValues || null;
			
			this.view.editOpen({state: "creating", values: values});
			this.view.setState("creating");
		},
		
		insert: function(data) {
			var url = this.parseUrl(),
				self = this;
				
			Bxs.Ajax.post(url,data,function(response) { self.handleData(response,"insert"); });
		},
		
		update: function(data) {
			
			var url = this.parseUrl(true)+"/"+data.id,
				self = this;
			
			Bxs.Ajax.put(url,data,function(response) {
          self.handleData(response,"update", null, url);
      });
		},
		
		remoteInsert: function(data) {
			if (this.view.attrs.observing === undefined) {
				this.view.appendRowAtHead(this.view.buildRow(data,true));
			}
			else {
				this.refresh(true);
			}
		},
		
		remoteUpdate: function(data) {
			var row = null;

			if (row = this.view.getRowById(data.id)) {
				this.view.buildRow(data, true, row);
			}
		},
		
		remoteDelete: function(data) {
			var row = null;
			if (row = this.view.getRowById(data.id)) {
				this.view.completeDeletion(row);
			}
		},
		
		handlers: $.extend(true, {}, Bxs.Controller.Box.General.prototype.handlers, {
			insert: function(self,response) {
				self.handleAction("update",response);
			},
			delete: function(self,response) {
				self.view.completeDeletion();
				self.view.setState("ready");
			}
		}),
	
		init: function() {
		
			var self = this;
			
			self.setupObserves();

			$(Bxs.eventsPublisher).one("schemaLoaded."+self.view.attrs.id,function() {
				self.view.boot(self.schema);
				self.view.activate();
			});
		
			this.loadSchema();
		}
	}
);
