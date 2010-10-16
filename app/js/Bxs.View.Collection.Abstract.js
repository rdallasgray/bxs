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
	this.autoHideColumns = ["id","created_at","updated_at"];
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
			if ((sel !== undefined) && (sel !== "") && (sel !== null)) {
				this._selectedId = sel;
			}
			sel = (sel === undefined) ? null : sel;
			return sel;
		},
		
		getRowById: function(id) {
			var row = $(this.getDomNode())
				.find(this.columnType + '[name="id"][value="' + id + '"]')
				.parent();

			return row.length > 0 ? row.get(0) : null;
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
			this._selectedId = null;
		},
		
		buildContent: function(data) {
			var self = this,
				frag = document.createDocumentFragment(),
				rows = [];
			
			data.forEach(function(el) {
				rows.push(self.buildRow(el));
			})
			if (this.sortedBy !== undefined) {
				this.sortRowArray(rows,this.sortedBy.columnName,this.sortedBy.direction);
			}
			
			rows.forEach(function(row) {
				frag.appendChild(row);
			});
			
			self.domNode.appendChild(frag);

			if (self.associatedColumns.length === 0) {
				self.setColumnWidths(data.length);
				self.setState("ready");
			}
			else {
				$(Bxs.eventsPublisher).one("associatedColumnsLabelled."+self.attrs.id, function() {
					self.setColumnWidths(data.length);
					self.setState("ready");
				});
				self.labelAssociatedColumns();
			}
		},
		
		buildRowTemplate: function() {
			var row = document.createElement(this.rowType),
				self = this;

			self.associatedColumns = [];
			
			$.each(self.controller.schema, function(columnName) {
				var column = document.createElement(self.columnType),
					type = Bxs.Column.type(columnName);

				$(column).attr({ "name": columnName, "type": type });

				if (type === "list" && !self.ignoresColumn(columnName)) {
					self.associatedColumns.push(columnName);
				}

				if (type === "boolean") {
					$(column).attr({ "type": "checkbox","disabled": "true" });
				}

				if (self.hidesColumn(columnName) || self.ignoresColumn(columnName)) {
					$(column).attr({ "hidden": "true" });
				}
				
				row.appendChild(column);
			});

			self.rowTemplate = row;
		},
		
		setColumnWidths: function(dataCount) {
			if (dataCount > 0) {
				this.columnWidthsSet = true;
			}
		},
		
		buildRow: function(data, singleRow, row) {
			data = data || {};

			var self = this,
				row = row || this.rowTemplate.cloneNode(true),
				schema = self.controller.schema;

			for (var key in data) {
				
				var type = Bxs.Column.type(key),
					value = data[key];
				
				if (!(key in schema)) {
					try {
						console.debug("key "+key+" not found in schema for "+sel.attrs.id);
					}
					catch(e) {}
					continue;
				}
				
				var column = Bxs.Xpath.getNode(row,"descendant::xul:"+self.columnType+"[@name='"+key+"']");
				
				switch(type) {
					case "boolean":
					column.setAttribute("checked",value.toString());
					break;
					
					case "list":
					if (singleRow === true) {
						self.labelAssociatedColumn(column, value);
					}
					break;
					
					default:
					column.setAttribute("label", self.getColumnLabel(value, type));
				}
				
				column.setAttribute("value", value);
			}
			
			return row;
		},
   	
		getColumnLabel: function(value, type) {
			switch (type) {
				case "password":
				return "••••••••";
				break;
					
				case "date":
				return Bxs.Date.formatDate(value);
				break;
				
				case "datetime":
				return Bxs.Date.formatDateTime(value);
				break;
				
				default:
				return value;
			}
		},
		
		labelAssociatedColumn: function(column,value) {
			var self = this,
				columnName = column.getAttribute("name");
			
			if (value !== "") {
				var modelName = Bxs.Association.getModelName(columnName,self.attrs),
					url = "/" + modelName;
			
				$(Bxs.eventsPublisher).one("loadedRowData." + url + "/" + value, function(e, rowData) {
					$(column).attr("label", rowData.label);
				});
				self.controller.loadRowData(url + "/" + value, { list: "true" });
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
				var associatedColumns = Bxs.Xpath.getArray(
					self.domNode,
					"descendant::xul:"+self.columnType+"[@name='"+columnName+"']"
				);

				if (associatedColumns.snapshotLength === 0) {
					columnCount++;
					if (columnCount === self.associatedColumns.length) {
						$(Bxs.eventsPublisher).trigger("associatedColumnsLabelled."+self.attrs.id);
					}
					return;
				}
				
				var modelName = Bxs.Association.getModelName(columnName,self.attrs),
					url = "/" + modelName;

					if (self.associations === undefined) {
						self.associations = {};
					}
					if (self.associations[modelName] === undefined) {
						self.associations[modelName] = columnName;
					}
					Bxs.Ajax.getJSON(url, function(labelData) {
						setTimeout(function() {
							associatedColumns.forEach(function(column) {
								if (column.getAttribute("value") === "") return;
								var columnData = labelData.filter(function(row) {
									return row.id === parseInt(column.getAttribute("value"))
								})[0];
								if (columnData !== undefined) {
									column.setAttribute("label",columnData.label);
								}
							});
							columnCount++;
							if (columnCount === self.associatedColumns.length) {
								$(Bxs.eventsPublisher).trigger("associatedColumnsLabelled."+self.attrs.id);
							}
						},50);
					},
					{ list: "true" });
			});			
		},
		
		hidesColumn: function(columnName) {
			if (this.attrs.hide === undefined) {
				this.attrs.hide = [];
			}
			if (this.autoHideColumns === undefined) {
				this.autoHideColumns = [];
			}
			return (
				this.attrs.hide.some(function(el) el === columnName)) 
				|| (this.autoHideColumns.some(function(el) el === columnName)
			);
		},
		
		ignoresColumn: function(columnName) {
			if (this.attrs.ignore === undefined) {
				this.attrs.ignore = [];
			}
			if (this.attrs.observing !== undefined) {
				var parentColumn = this.attrs.rootUrl.match(/:\w*/g)[0].substr(1);
				if (!this.attrs.ignore.some(function(el) el === parentColumn)) {
					this.attrs.ignore.push(parentColumn);
				}
			}
			return this.attrs.ignore.some(function(el) el === columnName);
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
			
			var options = options || { state: "default" },
				self = this,
				selectedRow = null,
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
			
			$(Bxs.eventsPublisher).one("editViewReady", function() {
				self.setState(state);
				self.ensureRowIsVisible(self.editView.getDomNode());
			});

			this.editView.boot();
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
		
		completeDeletion: function(row) {
			
			var defaultSelection = null,
				row = row || this.getSelectedRow();
			
			if (row.getAttribute("selected") === "true") {
				if ($(row).next().length > 0) {
					defaultSelection = $(row).next().get(0);
				}
				else if ($(row).prev().length > 0) {
					defaultSelection = $(row).prev().get(0);
				}
			}
			
			$(row).remove();
			
			if (defaultSelection !== null) {
				this.setSelectedRow(defaultSelection);
			}
		},
		
		states: $.extend(true, {}, Bxs.View.Box.Abstract.prototype.states, {
			ready: function() {
				$(this.domNode).attr("state", "ready");
				if (!this.columnWidthsSet) {
					this.setColumnWidths();
				}
				this.enable();
				
				if (this.getSelectedRow() !== null) {
					this.setState("active");
				}
			},
			creating: function() {
				$(this.domNode).attr("state", "creating");
			},
			deleting: function() {
				$(this.domNode).attr("state", "deleting");
			}
		}),
		
		sortRowArray: function(rows,column,direction) {
			
			var self = this; //used in sort function
			
			rows.sort(function(a,b) {
				var columnA = $(a).children(self.columnType+"[name='"+column+"']").get(0),
					columnB = $(b).children(self.columnType+"[name='"+column+"']").get(0),
					attr = (columnA.hasAttribute("label") 
						&& !["date", "datetime"].some(function(el) el == columnA.getAttribute("type"))) ?
							"label" : "value";

				return Bxs.Comparator(columnA.getAttribute(attr), columnB.getAttribute(attr));
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

				if ((s !== g) && (g !== "") && (g !== null)) {
					$(Bxs.eventsPublisher).trigger("selectionChanged."+self.attrs.id);
					if (self.getState() === "ready") self.setState("active");
				}
			});
			$(Bxs.eventsPublisher).bind("enteringNewRow."+self.attrs.id, function() {
				self.setState("inactive");
			});
			$(Bxs.eventsPublisher).bind("doneEnteringNewRow."+self.attrs.id, function() {
				self.setState(self.getPreviousState());
			});
			
			Bxs.View.Box.Abstract.prototype.boot.apply(this);
		}
	}
);
