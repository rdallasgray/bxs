/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.Widget.List = function(schema,parentNode,parentView) {
	
	Bxs.Widget.Abstract.apply(this,arguments);
	
	this.columnName = $(parentNode).attr("name");	
};

Bxs.Widget.List.prototype = $.extend(true,{},
	
	Bxs.Widget.Abstract.prototype,

	{		
		boot: function() {
			
			this.listName = Bxs.Association.getName(
				this.columnName,
				this.parentView.attrs
			);
			
			this.domNode = document.createElement("menulist");

			$(this.domNode).attr({
				"flex": "1",
				"height": "0",
				"sizetopopup": "false"
			});
			
			this.popup = document.createElement("menupopup");
			
			$(this.domNode).append(this.popup);
			
			if (this.schema.null !== false) {
				var nullItem = document.createElement("menuitem");
				$(nullItem).attr("label","None");
				$(nullItem).attr("value","");
				$(nullItem).addClass("strong");
				$(this.popup).append(nullItem);
				var sep = document.createElement("menuseparator");
				$(this.popup).append(sep);
			}
			var newItem = document.createElement("menuitem");
			$(newItem).attr({ label: "New "+this.listName, value: "" });
			$(newItem).addClass("strong");
			$(this.popup).append(newItem);
			
			var self = this;
			
			$(newItem).bind("command",function() {
				self.enterNewRow();
			});
			
			var sep = document.createElement("menuseparator");
			$(self.popup).append(sep);
			
			Bxs.Ajax.getMetadata(this.listName, function(metadata) {
				
				self.url = metadata.url;
				
				Bxs.Ajax.getSchema(metadata.url, function(columnSchema) {
					var parentSchema = self.parentView.controller.schema,
						observedId = self.parentView.attrs.observing,
						associateKeys = [],
						sharedKey,
						requestList = function() {

							$(Bxs.eventsPublisher).one("listReady."+self.url, function(e,list) {

								self.list = list;
								$(self.popup).append(self.list.getDomNode());
								self.fixFocusBehaviour();
								$(Bxs.eventsPublisher).trigger("widgetReady."+self.columnName,[self]);
							});

							Bxs.Factory.List.build(self.url,self.listName);
						}; 
					// could optimize by creating array from columnSchema and filtering with regex /_id$/
					
					$.each(columnSchema, function(key) { if (/_id$/.test(key)) associateKeys.push(key) });
					
					if (!!(sharedKey = associateKeys.filter(function(el) el in parentSchema)[0])) {
						if (self.parentView.attrs.observing !== undefined) {
							var selectedId = self.parentView.getObservedBox().view.getSelectedId();
						}
						else {
							var defaultColumn = $(self.parentNode).siblings("[name='"+sharedKey+"']"),
								selectedId = defaultColumn.attr("value");
						}
						
						var buildListWithDefaults = function() {
							self.setNewRowDefault(sharedKey,selectedId);
							Bxs.Ajax.getMetadata(sharedKey.substr(0,sharedKey.search(/_id$/)), function(keyMetadata) {
								self.url = keyMetadata.name+"/"+selectedId+"/"+metadata.name;
								requestList();
							});
						}

						if (!isNaN(parseInt(selectedId))) {
							buildListWithDefaults();
						}
						else {
							// TODO set up so that when defaultColumn changes, we rebuild the list accordingly.
							requestList();
						}
					}
					else {
						requestList();
					}
				});
			});
		},
	
		setValue: function(value) {
			$(this.domNode).attr("value",value);
			this.domNode.selectedItem = this.getItemByValue(value);
			this.defaultValue = value;
		},
		
		getItemByValue: function(value) {			
			return $(this.popup).children("menuitem[value='"+value+"']").get(0);
		},
		
		setNewRowDefault: function(key,value) {
			if (this.newRowDefaults === undefined) {
				this.newRowDefaults = {};
			}
			this.newRowDefaults[key] = value;
		},
		
		getNewRowDefaults: function() {
			return this.newRowDefaults || {};
		},
		
		enterNewRow: function() {
			
			this.newEntry = {
				panel: new Bxs.Panel(this.domNode),
				boxNode: document.createElement("listbox")
			};
			
			var self = this;
				
			self.newEntry.boxNode.width = document.documentElement.boxObject.width*0.75;

			$(Bxs.eventsPublisher).one("boxBooted.temp-box",function(e,view) {
				$(self.newEntry.panel.domNode).one("popupshown",function() {
					view.controller.doCommand("newRow");
				});
				self.newEntry.panel.open();
			});
		
			$(Bxs.eventsPublisher).one("actionCancel.temp-box",function() {
				self.cleanUpPanel();
				self.setValue(self.defaultValue);
			});
		
			$(self.newEntry.panel.domNode).one("popuphidden",function() {
				self.cleanUpPanel();
				self.setValue(self.defaultValue);
			});

			$(Bxs.eventsPublisher).one("listRowAdded."+self.listName,function(e,row) {
				$(self.popup).append(row);
				self.defaultValue = $(row).attr("value");
				self.cleanUpPanel();
			});

			Bxs.Ajax.getMetadata(this.listName,function(metadata) {
			
				var boxName = metadata.name,
					hide = [];
				
				$.each(self.getNewRowDefaults(), function(key) {
					hide.push(key);
				});
				
				$(self.newEntry.boxNode)
					.attr({ 
						bxs: "collection", 
						id: "temp-box", 
						name:  boxName, 
						rootUrl: "/"+self.url, 
						hide: hide.toSource(), 
						rows: "1" ,
						suppressContentLoading: "true"
					})
					.addClass("singleRow");
	
				$(self.newEntry.panel.domNode).append(self.newEntry.boxNode);

				var box = Bxs.Factory.Box.build(self.newEntry.boxNode);
				
			});
		},
		
		cleanUpPanel: function() {
			
			if (this.newEntry === undefined) {
				return;
			}
			
			this.newEntry.panel.cleanUp();
			Bxs.Boxes.remove("temp-box");
			delete this.newEntry;
		},
		
		addNewRow: function() {
			
			var self = this;

			$(Bxs.eventsPublisher).one("listRowAdded."+self.listName,function(e,item) {
				$(self.popup).append(item);
				self.cleanUpPanel();
				self.setValue($(item).attr("value"));
			});
			
		}

	}
);