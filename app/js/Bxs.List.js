/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.List = function(url,columnName) {
	
	this.url = url;
	this.columnName = columnName;
}

Bxs.List.prototype = {
	
	boot: function() {
		
		this.domNode = document.createDocumentFragment();
		var self = this;
		
		Bxs.Ajax.getMetadata(self.columnName,function(metadata) {
			
			self.metadata = metadata;
			
			Bxs.Ajax.get(self.url,function(dataSet,notModified) {

				var validCachedNode = false;
				
				if (notModified) {
					var cachedNode = Bxs.Cache.get(["Lists",self.url]);
					if (cachedNode !== false) {
						validCachedNode = true;
						self.domNode = cachedNode;
						$(Bxs.eventsPublisher).trigger("listReady."+self.url,[self]);
					}
				}
				
				if (!validCachedNode) {
					dataSet.forEach(function(row) {
						self.createNode(row);
					});
				
					Bxs.Cache.set(["Lists",self.url],self.domNode);
			
					$(Bxs.eventsPublisher).trigger("listReady."+self.url,[self]);
				}
			
			});
		});

		$(Bxs.eventsPublisher).bind("dataChanged",function(e,dataObject) {
			self.handleData(dataObject);
		});

	},
	
	createNode: function(data) {
		
		var menuitem = document.createElement("menuitem");
		
		menuitem.setAttribute("value",data.id);
		
		menuitem.setAttribute("label",Bxs.String.fromPattern(this.metadata.to_string_pattern,data));
		
		this.domNode.appendChild(menuitem);
		
		return menuitem;
	},

	handleData: function(dataObject) {

		if (dataObject.name !== this.metadata.name) {
			return;
		}
	
		this[dataObject.action](dataObject.data);
	},
	
	insert: function(data) {
		
		var row = this.createNode(data);
		
		$(Bxs.eventsPublisher).trigger("listRowAdded."+this.columnName,[row]);
		// only using this to add an item from a panel (New ...)
	},
	// delete and update only to prevent exceptions
	delete: function() {
		
	},
	
	update: function() {
		
	},

	getDomNode: function() {
		
		return this.domNode.cloneNode(true);
	}
}