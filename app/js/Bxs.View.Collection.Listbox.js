/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.View.Collection.Listbox = function(node) {
	
	// if not passed a node should create its own
	Bxs.View.Collection.Abstract.apply(this,arguments);
	
	this.rowType = "listitem";
	this.columnType = "listcell";
		
}

Bxs.View.Collection.Listbox.prototype = $.extend(true,{},
	
	Bxs.View.Collection.Abstract.prototype,
	
	{
		isEmpty: function() {
			return this.domNode.getRowCount() === 0;
		},
		
		getRowCount: function() {
			return this.domNode.getRowCount();
		},
		
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
			if (this.forceNextRefresh === true) {
				return true;
				this.forceNextRefresh = false;
			}
			
			var tabPanels = Bxs.Xpath.getArray(this.domNode,"ancestor::xul:tabpanel"),
				visiblePanels = 0;

			tabPanels.forEach(function(el) {
				if (el.parentNode.selectedPanel === el) {
					visiblePanels++;
				}
			});
			
			return (visiblePanels === tabPanels.length);
		},
		
		onVisibility: function(callback) {
			if (this.parentTab === undefined) {
				this.parentTab = $(this.domNode).parents("tabpanels").prev("tabs")
					.children("[linkedpanel='"+this.attrs.id+"_panel']").get(0);
			}
			var self = this;
			$(this.parentTab).unbind("command."+this.attrs.id);
			$(this.parentTab).one("command."+this.attrs.id,callback);
		},
		
		editOpen: function(options) {
			Bxs.View.Collection.Abstract.prototype.editOpen.apply(this, arguments);
			$(this.domNode).find("listheader").attr("disabled", "true");
		},
		
		editClose: function(options) {
			Bxs.View.Collection.Abstract.prototype.editClose.apply(this, arguments);
			$(this.domNode).find("listheader").removeAttr("disabled");
		},
		
		setColumnWidths: function(dataCount) {
			if (dataCount > 0) {
				$(this.domNode).find("listcol").each(function() {
					var width = Math.min(this.clientWidth, 200);
					$(this).attr("width", width);
				});
				this.columnWidthsSet = true;
			}
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
			// some of below could be extracted out to Bxs.View.Collection.Abstract
			$.each(schema, function(columnName) {

//				if (self.ignoresColumn(columnName)) return;
				
				// deal with *_id, i.e. belongs_to relationships
				if (Bxs.Column.isAssociation(columnName)) {
					var label = Bxs.Association.getName(columnName,self.attrs),
						url = "/" + Bxs.Inflector.pluralize(label);
					// preload the box data
//					Bxs.Ajax.getJSON(url, null,  { list: true });
				}

				var header = document.createElement('listheader'),
					headerLabel = label === undefined ? columnName : label,
					type = Bxs.Column.type(columnName);
					
				header.setAttribute("label",headerLabel);
				header.setAttribute("columnName",columnName);
				header.setAttribute("columnType", type);
				
				$(header).bind("click", function() {
					
					if (header.hasAttribute("disabled")) {
						return;
					}
			
					var dir = $(header).attr("sortDirection");
				
					dir = (dir === "ascending") ? "descending" : "ascending";
					
					$(self.domNode).children("listhead").children().removeAttr("sortDirection");
					
					$(header).attr("sortDirection",dir);
					
					self.sortRows($(header).attr("columnName"),dir);
				});

				var col = document.createElement('listcol');
				col.setAttribute("type", type);
			
				if (self.hidesColumn(columnName)) {
					$(header).attr("hidden","true");
					$(col).attr("hidden","true");
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

			$(self.domNode).bind("dblclick",function() {
				if (self.editView === undefined) {
					Bxs.Command.dispatch('edit'); 
				}
			});
			var hbox = document.createElement("hbox");
			hbox.setAttribute("flex",0);
			
			this.editToolbar = new Bxs.Toolbar.Collection(self.attrs.id);
			
			hbox.appendChild(this.editToolbar.getDomNode());
			
			$(this.domNode).after(hbox);

			Bxs.View.Collection.Abstract.prototype.boot.apply(this);
		}
	}
);
