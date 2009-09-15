/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.View.Table.Listbox = function(node) {
	
	// if not passed a node should create its own
	Bxs.View.Table.Abstract.apply(this,arguments);
	
	this.rowType = "listitem";
	this.columnType = "listcell";
		
}

Bxs.View.Table.Listbox.prototype = $.extend(true,{},
	
	Bxs.View.Table.Abstract.prototype,
	
	{
		
		getSelectedRow: function() {
			return this.domNode.selectedItem;
		},
		
		setSelectedRow: function(row) {
			this.domNode.selectItem(row);
		},
		
		clearSelection: function() {
			this.domNode.clearSelection();
		},
		
		ensureRowIsVisible: function(row) {
			this.domNode.ensureElementIsVisible(row);
		},
		
		isVisible: function() {
			var tabPanels = Bxs.Xpath.getArray(this.domNode,"ancestor::xul:tabpanel");
			
			if (tabPanels.length < 2) {
				return true;
			}
		
			var visiblePanels = 0;

			tabPanels.forEach(function(el) {
				if (el.parentNode.selectedPanel === el) {
					visiblePanels++;
				}
			});
			
			return (visiblePanels === tabPanels.length);
		},
		
		onVisibility: function(callback) {
			if (this.parentTab == undefined) {
				this.parentTab = $(this.domNode).parents("tabpanels").prev("tabs").children("[linkedpanel='"+this.attrs.id+"_panel']").get(0);
			}
			$(this.parentTab).one("command",callback);
		},

		boot: function(schema) {
			
			var parentNode = this.domNode.parentNode,
				container = document.createElement("vbox"),
				frag = document.createDocumentFragment(),
				listcols = document.createElement('listcols'),
				listhead = document.createElement('listhead'),
				self = this,
				visibleCols = [];
			
			// wrap domNode in vbox
			$(this.domNode).before(container);
			$(this.domNode).remove();
			$(container).append(this.domNode);
			
			
			// some of below could be extracted out to Bxs.View.Table.Abstract
			$.each(schema, function(field,values) {
				
				if (self.ignoresColumn(field)) return;
				
				// deal with *_id, i.e. belongs_to relationships
				if (/_id$/.test(field)) {
					var label = field.slice(0,field.search(/_id$/));
					// preload the table data
					Bxs.Ajax.getMetadata(label,function(metadata) {
						Bxs.Ajax.get(Bxs.Url.root()+"/"+metadata.url);
					});
				}
				
				var header = document.createElement('listheader');
				header.label = label === undefined ? field : label;
				header.setAttribute("fieldName",field);
				
				$(header).bind("click", function() {
			
					var dir = $(header).attr("sortDirection");
				
					dir = (dir === "ascending") ? "descending" : "ascending";
					
					$(self.domNode).children("listhead").children().removeAttr("sortDirection");
					
					$(header).attr("sortDirection",dir);
					
					self.sortRows($(header).attr("fieldName"),dir);
				});
			
				var col = document.createElement('listcol');
				var fieldLength = values.length ? parseInt(values.length) : 4;
				col.setAttribute('width',Math.min(Math.round(Math.sqrt(fieldLength) * 16),200));
			
				if (self.hidesColumn(field)) {
					header.hide();
					col.hide();
				}
				else {
					visibleCols.push(col);
				}
			
				listhead.appendChild(header);
				listcols.appendChild(col);
			});
			
			visibleCols.shift();
			$.each(visibleCols, function() {
				var splitter = document.createElement('splitter');
				splitter.setAttribute('resizeafter','farthest');
				this.parentNode.insertBefore(splitter,this);
			});
		
			frag.appendChild(listhead);
			frag.appendChild(listcols);
			self.domNode.appendChild(frag);
			
			self.buildRowTemplate();
			
			$(self.domNode).bind("dblclick",function() { Bxs.Command.dispatch('edit'); });
			
			var hbox = document.createElement("hbox");
			hbox.setAttribute("flex",0);
			
			this.editToolbar = new Bxs.Toolbar.Edit(self.attrs.id);
			
			hbox.appendChild(this.editToolbar.getDomNode());
			
			$(this.domNode).after(hbox);
			
			this.forwardState(this.editToolbar);
			
			$(self.domNode).bind("select", function() {
				if (self.getState() === "ready") self.setState("active");
			});
			
			$(Bxs.eventsPublisher).trigger("viewBooted."+self.attrs.id,self);
		}
	}
);
