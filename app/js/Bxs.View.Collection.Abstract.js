/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

if (Bxs.View.Collection === undefined) {
	Bxs.View.Collection = {};
}

Bxs.View.Collection.Abstract = function(node) {
	
	this.domNode = node;
	this.autoHideColumns = ["id","created_at","modified_at"];
	this.rowType = "";
	this.columnType = "";
	
};

Bxs.View.Collection.Abstract.prototype = $.extend(true,{},
	
	Bxs.View.Box.Abstract.prototype,
	
	{	
		getRowCount: function() {
			
		},
		
		getObservedBox: function() {
			return Bxs.Boxes.getById(this.attrs.observing);
		},
				
		getSelectedId: function() {
			var sel = $(this.getSelectedRow()).children(this.columnType+"[name='id']").attr("value");
			if ((sel !== undefined) && (sel !== "")) {
				this._selectedId = sel;
			}
			return sel;
		},

		addFilter: function(filter) {
			if (this.filters === undefined) {
				this.filters = [];
			}
			this.filters.push(filter);
		},
		
		getFilterOptions: function() {
			
			var options = {};

			$(this.filters).each(function() {
				if (this.attrs.filterType !== "foreign") {
					var value = this.getValue();
					if (value !== "null") {
						options[this.name] = value;
					}
				}
			});
			
			return options;
		},
		
		getForeignFilters: function() {
			
			var url = null;

			$(this.filters).each(function() {
				if (this.attrs.filterType === "foreign") {
					var value = this.getValue();
					if (value !== "null") {
						url = value;
					}
				}
			});
			
			return url;
		},
		
		clearContent: function() {
			this.removeAllRows();
		},
		
		buildContent: function(data) {

			var self = this,
				frag = document.createDocumentFragment(),
				rows = [];
		
			$.each(data,function() {
				rows.push(self.buildRow(this));
			});
			
			if (this.sortedBy !== undefined) {
				this.sortRowArray(rows,this.sortedBy.columnName,this.sortedBy.direction);
			}
			
			rows.forEach(function(row) {
				frag.appendChild(row);
			});
			
			self.domNode.appendChild(frag);
			
			if (self.associatedColumns.__count__ === 0) {
				self.setState("ready");
			}
			else {
				$(Bxs.eventsPublisher).one("associatedColumnsLabelled."+self.attrs.id, function() {
					self.setState("ready");
				});
				self.labelAssociatedColumns();
			}
		},
		
		buildRowTemplate: function() {
			
			var row = document.createElement(this.rowType),
				self = this;
			
			self.associatedColumns = [];
			
			$.each(self.controller.schema, function(columnName,values) {
				
				var column = document.createElement(self.columnType);
				
				$(column).attr({ "name": columnName });
				
				if (/_id$/.test(columnName) && !self.ignoresColumn(columnName)) {
					// it's an association column
					$(column).attr({ "association": "true" });
					self.associatedColumns.push(columnName);
				}
				
				if (values["type"] === "boolean") {
					$(column).attr({ "type": "checkbox","disabled": "true" });
				}
				
				if (self.hidesColumn(columnName) || self.ignoresColumn(columnName)) {
					$(column).attr({ "hidden": "true" });
				}
				
				row.appendChild(column);
			});
			
			self.rowTemplate = row;
		},
		
		buildRow: function(data) {
			data = data || {};

			var self = this,
				row = this.rowTemplate.cloneNode(true);
				
			for (var key in data) {
				var column = Bxs.Xpath.getNode(row,"descendant::xul:"+self.columnType+"[@name='"+key+"']");
				if (self.controller.schema[key].type === "boolean") {
					column.setAttribute("checked",data[key].toString());
				}
				if (!column.getAttribute("association")) {
					if (!(column.getAttribute("type") === "checkbox")) {
						column.setAttribute("label",data[key]);
					}
				}
				else {
					self.labelAssociatedColumn(key,data[key],column);
				}
				column.setAttribute("value",data[key]);
			}

			return row;
		},
		
		labelAssociatedColumn: function(columnName,value,column) {
			
			var self = this;
			
			if (value !== "") {
				var realName = Bxs.Association.getName(columnName,self.attrs);
				Bxs.Ajax.getMetadata(realName,function(metadata) {
					$(Bxs.eventsPublisher).one("loadedRowData."+metadata.url+"/"+value,function(e,rowData) {
						$(column).attr("label",Bxs.String.fromPattern(metadata.to_string_pattern,rowData));
					});
					self.controller.loadRowData(metadata.url+"/"+value);
				})
			}
			else {
				$(column).attr("label","");
			}
		},
		
		labelAssociatedColumns: function() {
			// using get/setAttribute for speed
			var self = this,
				columnCount = 0;

			self.associatedColumns.forEach(function(columnName) {
				//Xpath for speed
				var associatedColumns = Bxs.Xpath.getArray(self.domNode,"descendant::xul:"+self.columnType+"[@name='"+columnName+"']");

				if (associatedColumns.snapshotLength === 0) {
					columnCount++;
					if (columnCount === self.associatedColumns.__count__) {
						$(Bxs.eventsPublisher).trigger("associatedColumnsLabelled."+self.attrs.id);
					}
					return;
				}
				
				var realName = Bxs.Association.getName(columnName,self.attrs);
				
				Bxs.Ajax.getMetadata(realName, function(metadata) {
					if (self.associations === undefined) {
						self.associations = {};
					}
					if (self.associations[metadata.name] === undefined) {
						self.associations[metadata.name] = columnName;
					}
					Bxs.Ajax.getJSON(metadata.url, function(labelData) {
						var labelDataById = {};
						labelData.forEach(function(el) labelDataById[el.id] = el);
					
						setTimeout(function() {
							associatedColumns.forEach(function(el) {
								var column = el;
								if (column.getAttribute("value") === "") return;
								var columnData = labelDataById[column.getAttribute("value")];
								if (columnData !== undefined) {
									column.setAttribute("label",Bxs.String.fromPattern(metadata.to_string_pattern,columnData));
								}
							});
							columnCount++;
							if (columnCount === self.associatedColumns.__count__) {
								$(Bxs.eventsPublisher).trigger("associatedColumnsLabelled."+self.attrs.id);
							}
						},50);
					});
				});
			});			
		},
		
		hidesColumn: function(columnName) {
			return (
				this.attrs.hide.some(function(el) el === columnName)) 
				|| (this.autoHideColumns.some(function(el) el === columnName)
			);
		},
		
		ignoresColumn: function(columnName) {
			var ignores = this.attrs.ignore;
			if (this.attrs.observing !== undefined) {
				var parentColumn = this.attrs.rootUrl.match(/:\w*/g)[0].substr(1);
				ignores.push(parentColumn);
			}
			return ignores.some(function(el) el === columnName);
		},
		
		getArrayOfRows: function() {
			return $(this.domNode).children(this.rowType).get();
		},
		
		removeAllRows: function() {
			$(this.domNode).children(this.rowType).remove();
		},
		
		editable: function() {
			return this.getSelectedRow() !== null;
		},
	
		editOpen: function(options) {
			
			var options = options || { state: "default" };
			
			var selectedRow = null,
				state = "editing",
				values = options.values || null;
			
			if (options.state === "creating") {
				state = "creating";
				this.defaultSelection = this.getSelectedRow();
			}
			else {
				selectedRow = this.getSelectedRow();
			}
			
			this.editView = this.buildEditView(selectedRow,values);
			
			if (options.state === "creating") {
				this.newestRow = this.editView.getDomNode();
				if (this.getSelectedRow()) {
					$(this.getSelectedRow()).after(this.editView.getDomNode());
				}
				else {
					this.appendRowAtHead(this.editView.getDomNode());
				}
				this.setSelectedRow(this.editView.getDomNode());
			}

			this.editView.boot();
			this.ensureRowIsVisible(this.editView.getDomNode());
			this.setState(state);
		},
		
		buildEditView: function(selectedRow,values) {
			var row = new Bxs.View.Row[$.string(this.rowType).capitalize().str](this,selectedRow,values);
			return row;
		},
		
		appendRowAtHead: function(row) {
			var firstRow = $(this.domNode).children(this.rowType+":first").get(0);
			if (firstRow !== undefined) {
				$(firstRow).before(row);
			}
			else {
				$(this.domNode).append(row);
			}
			this.ensureRowIsVisible(row);
		},
		
		getEditedData: function() {
			return this.editView.getData();
		},
		
		updateEditView: function(data) {
			this.editView.updateData(data);
		},
		
		editClose: function(options) {
			
			var options = options || { state: "default" };
			
			this.editView.close();
			
			switch (options.state) {
				
				case "cancel":
				if (this.getState() === "creating") {
					$(this.editView.getDomNode()).remove();
					this.setSelectedRow(this.defaultSelection);
				}
				break;
				
				case "complete":
				if (this.getPreviousState() === "creating") {
					$(this.domNode).trigger("select",self);
				}
				break;
			}
			
			delete this.editView;
			this.domNode.focus();
		},
		
		confirmDelete: function() {
			
			this.setState("deleting");
			
			var confirmed = confirm("Are you sure you want to delete this row?");
			
			if (confirmed) {
				return true;
			}
			
			this.setState(this.getPreviousState());
			
			return false;
		},
		
		completeDeletion: function() {
			
			var defaultSelection = null;
			
			if ($(this.getSelectedRow()).next().length > 0) {
				defaultSelection = $(this.getSelectedRow()).next().get(0);
			}
			else if ($(this.getSelectedRow()).prev().length > 0) {
				defaultSelection = $(this.getSelectedRow()).prev().get(0);
			}
			
			$(this.getSelectedRow()).remove();
			
			if (defaultSelection !== null) {
				this.setSelectedRow(defaultSelection);
			}
		},
		
		states: $.extend(true, {}, Bxs.View.Box.Abstract.prototype.states, {
			ready: function() {
				$(this.domNode).removeClass("busy");
				$(this.domNode).removeClass("deleting");
				this.enable();
				
				if (this.getSelectedRow() !== null) {
					this.setState("active");
				}
			},
			active: function() {
				$(this.domNode).removeClass("deleting");
			},
			creating: function() {
			},
			deleting: function() {
				$(this.domNode).addClass("deleting");
			}
		}),
		
		sortRowArray: function(rows,column,direction) {
			
			var self = this; //used in sort function
			
			rows.sort(function(a,b) {
				
				var columnA = $(a).children(self.columnType+"[name='"+column+"']").get(0);
				var columnB = $(b).children(self.columnType+"[name='"+column+"']").get(0);
				
				var labelA = columnA.hasAttribute("label") ? columnA.getAttribute("label") : columnA.getAttribute("value");
				var labelB = columnB.hasAttribute("label") ? columnB.getAttribute("label") : columnB.getAttribute("value");

				return Bxs.Comparator(labelA,labelB);
			});
			
			if (direction === "descending") rows.reverse();
			
			return rows;

		},
		
		sortRows: function(columnName,direction) {
			var rows = this.getArrayOfRows(),
			s = this.getSelectedRow(),
			selectedRow = (s === null) ? null : s.cloneNode(true),
			self = this;
			
			this.clearSelection();
			this.removeAllRows();
			
			var rows = this.sortRowArray(rows,columnName,direction);
			
			var frag = document.createDocumentFragment();
			
			rows.forEach(function(row) {
				frag.appendChild(row);
			});
			
			this.domNode.appendChild(frag);

			if (selectedRow !== null) {
				
				var id = $(selectedRow).children(this.columnType+"[name='id']").attr("value"),
					row = $(this.domNode).find(this.columnType+"[name='id'][value='"+id+"']").parent().get(0);
					
				this.domNode.ensureElementIsVisible(row);
				this.setSelectedRow(row);
			}
			
			this.sortedBy = { columnName: columnName, direction: direction };
		},
		
		boot: function() {
			
			var self = this;
						
			this.forwardState(this.editToolbar);
			
			$(self.domNode).bind("select", function() {
				var s = self._selectedId,
					g = self.getSelectedId();

				if ((s !== g) && (g !== "") && (g !== undefined)) {
					$(Bxs.eventsPublisher).trigger("selectionChanged."+self.attrs.id);
					if (self.getState() === "ready") self.setState("active");
				}
			});
			
			Bxs.View.Box.Abstract.prototype.boot.apply(this);
		}
	}
);
