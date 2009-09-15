/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.Widget.List = function(schema,parentNode,parentView) {

	Bxs.Widget.Abstract.apply(this,arguments);
	this.fieldName = $(parentNode).attr("name").slice(0,$(parentNode).attr("name").search(/_id$/));
	
};

Bxs.Widget.List.prototype = $.extend(true,{},
	
	Bxs.Widget.Abstract.prototype,

	{
		build: function() {

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
			$(newItem).attr({ label: "New "+this.fieldName, value: "" });
			$(newItem).addClass("strong");
			$(this.popup).append(newItem);
			
			var self = this;
			
			$(newItem).bind("command",function() {
				self.enterNewRow();
			});
			
			var sep = document.createElement("menuseparator");
			$(self.popup).append(sep);
			
			Bxs.Ajax.getMetadata(this.fieldName, function(metadata) {
				self.url = metadata.url;
				
				Bxs.Ajax.getSchema("/"+metadata.url, function(columnSchema) {
					var parentSchema = self.parentView.controller.schema,
						observedId = self.parentView.attrs.observing,
						associateKeys = [],
						sharedKey,
						requestList = function() {
							$(Bxs.eventsPublisher).one("listReady."+self.url, function(e,list) {
						
								self.list = list;
			
								$(self.popup).append(self.list.getDomNode());
								
								self.fixFocusBehaviour();
						
								$(Bxs.eventsPublisher).trigger("widgetReady."+self.fieldName+"_id",[self]);
							});
					
							Bxs.Factory.List.build(self.url,self.fieldName);
						}; 
					// could optimize by creating array from columnSchema and filtering with regex /_id$/
					
					$.each(columnSchema, function(key) { if (/_id$/.test(key)) associateKeys.push(key) });
					
					if (!!(sharedKey = associateKeys.filter(function(el) el in parentSchema)[0])) {
						var selectedId = $(self.parentNode).siblings("[name='"+sharedKey+"']").attr("value");
						self.setNewRowDefault(sharedKey,selectedId);
						Bxs.Ajax.getMetadata(sharedKey.substr(0,sharedKey.search(/_id$/)), function(keyMetadata) {
							self.url = keyMetadata.name+"/"+selectedId+"/"+self.url;
							requestList();
						});
					}
					else {
						requestList();
					}
/*yagni?					
					$.each(columnSchema,function(key) {
						
						if (/_id$/.test(key)) {

							var fieldName = key.slice(0,key.search(/_id$/));

							Bxs.Ajax.getMetadata(fieldName, function(keyMetadata) {
								
								if (observedId !== undefined) {
									var observed = $("#"+observedId).get(0);
									
									if (observed.getAttribute("name") === keyMetadata.name) {
										var selectedId = $("#"+observedId+"_broadcaster").attr("selectedId");
										self.url = keyMetadata.name+"/"+selectedId+"/"+self.url;
									}
									self.setNewRowDefault(key,selectedId);
								}

							});
						}
					});
*/					
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
				
				tableNode: document.createElement("listbox")
				
			};
			
			var self = this;
				
			self.newEntry.tableNode.width = document.documentElement.boxObject.width*0.75;

			$(Bxs.eventsPublisher).one("ready.temp-table",function(e,controller) {
				$(self.newEntry.panel.domNode).one("popupshown",function() {
					controller.doCommand("newRow");
				});
				self.newEntry.panel.open();
			});
		
			$(Bxs.eventsPublisher).one("actionCancel.temp-table",function() {
				self.cleanUpPanel();
				self.setValue(self.defaultValue);
			});
		
			$(self.newEntry.panel.domNode).one("popuphidden",function() {
				self.cleanUpPanel();
				self.setValue(self.defaultValue);
			});
			
			$(Bxs.eventsPublisher).one("listRowAdded."+self.fieldName,function(e,row) {
				$(self.popup).append(row);
				self.defaultValue = $(row).attr("value");
				self.cleanUpPanel();
			});

			Bxs.Ajax.getMetadata(this.fieldName,function(metadata) {
			
				var tableName = metadata.name,
					hide = [];
				
				$.each(self.getNewRowDefaults(), function(key) {
					hide.push(key);
				});
				
				$(self.newEntry.tableNode)
					.attr({ 
						view: "table", 
						id: "temp-table", 
						name:  tableName, 
						rootUrl: "/"+self.url, 
						hide: hide.toSource(), 
						rows: "1" ,
						suppressList: "true"
					})
					.addClass("singleRow");
	
				$(self.newEntry.panel.domNode).append(self.newEntry.tableNode);

				var table = Bxs.Factory.Table.build(self.newEntry.tableNode);
				
			});
		},
		
		cleanUpPanel: function() {
			
			if (this.newEntry === undefined) {
				return;
			}
			
			this.newEntry.panel.cleanUp();
			Bxs.Tables.remove("temp-table");
			delete this.newEntry;
		},
		
		addNewRow: function() {
			
			var self = this;

			$(Bxs.eventsPublisher).one("listRowAdded."+self.fieldName,function(e,item) {
				$(self.popup).append(item);
				self.cleanUpPanel();
				self.setValue($(item).attr("value"));
			});
			
		}

	}
);