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
			
			this.loadDataDelayed();
		},
		
		loadRowData: function(url) {
				
			Bxs.Ajax.get(url, function(data) {
				$(Bxs.eventsPublisher).trigger("loadedRowData."+url,[data]);
			});
		},
		
		commands: $.extend(true, {}, Bxs.Controller.Box.General.prototype.commands, {
						
			newRow: function() {

				switch (this.view.getState()) {
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
				
				this.view.setState("deleting");
			
				var url = this.parseUrl()+"/"+this.view.getSelectedId(),
					self = this;
			
				Bxs.Ajax.deleteRow(url,function(response) { self.handleData(response,"delete"); });
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
			
			Bxs.Ajax.put(url,data,function(response) { self.handleData(response,"update"); });
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
