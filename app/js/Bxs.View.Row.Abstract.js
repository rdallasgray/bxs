/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

if (Bxs.View.Row === undefined) {
	Bxs.View.Row = {};
}

Bxs.View.Row.Abstract = function(parentView,domNode,values) {
	
	this.parentView = parentView;
	this.schema = $.extend(true,{},this.parentView.controller.schema);
	this.defaultValues = values;
	var self = this;
	
	domNode = domNode || self.parentView.buildRow();
	
	self.domNode = domNode;
	$(self.domNode).attr("allowevents","true");
	self.widgets = {};
};


Bxs.View.Row.Abstract.prototype = $.extend(true,{},

	Bxs.Mixin.Stateable,

	{		
		getDomNode: function() {
			
			return this.domNode;
		},

		getData: function() {

			var data = {};

			$.each(this.widgets, function(columnName, widget) {
				data[columnName] = widget.getValue();
			});

			return data;
		},

		buildWidget: function(columnName,schema) {
			
			var domNode = $(this.domNode).children(this.parentView.columnType+"[name='"+columnName+"']"),
				self = this;
			
			if (self.defaultValues !== null && (value = self.defaultValues[columnName])) {
				$(domNode).attr("value",value);
			}

			$(Bxs.eventsPublisher).one("widgetReady."+columnName, function(e,widget) {
				
				domNode.append(widget.getDomNode());
// TODO check if this has side effects				
//				$(widget.getDomNode()).attr("disabled","true");

				$(Bxs.eventsPublisher).trigger("widgetAppended."+columnName);

				self.widgetCount--;
				
				if (self.widgetCount === 0) {
					$(Bxs.eventsPublisher).trigger("allWidgetsAppended");
				}
			});
			
			self.widgets[columnName] = Bxs.Factory.Widget.build(schema,$(domNode).attr("value"),domNode.get(0),self.parentView);

		},

		updateData: function(data) {
			
			var self = this;

			$.each(self.schema, function(columnName,values) {
				
				var column = $(self.domNode).children(self.parentView.columnType+"[name='"+columnName+"']"),
					label = "";
				
				if (/_id$/.test(columnName)) {
					self.labelAssociatedColumn(columnName,data[columnName],column);
				}
				else {
					$(column).attr("label",data[columnName]);
				}
				
				if (self.schema[columnName].type === "boolean") {
					$(column)
						.attr({
							type: "checkbox",
							value: data[columnName],
							checked: data[columnName]
						})
						.removeAttr("label");
				}
				
				else {
					$(column).attr({ value: data[columnName] });
				}
			});
		},
		
		labelAssociatedColumn: function(columnName,value,column) {
			
			var self = this;
			
			if (value !== "") {
				var realName = Bxs.Association.getName(columnName,self.parentView.attrs);
				Bxs.Ajax.getMetadata(realName,function(metadata) {
					$(Bxs.eventsPublisher).one("loadedRowData."+metadata.url+"/"+value,function(e,rowData) {
						$(column).attr("label",Bxs.String.fromPattern(metadata.to_string_pattern,rowData));
					});
					self.parentView.controller.loadRowData(metadata.url+"/"+value);
				})
			}
			else {
				$(column).attr("label","");
			}
		},
		
		focusFirstWidget: function() {
			$.each(this.widgets,function() {
				if(!$(this.getDomNode().parentNode).attr("hidden")) {
					this.getDomNode().focus();
					return false;
				}
			});
		},

		close: function() {

			var self = this;
			
			self.setState("communicating");

			$.each(self.widgets, function() {
				$(this.getDomNode()).remove();
			});

			$(self.domNode).removeAttr("allowevents");
			self.setState("closed");
		},

		states: {
			
			communicating: function() {
				this.disable();
				$(this.domNode).removeClass("open");
				$(this.domNode).addClass("communicating");
			},
			open: function() {
				$(this.domNode).removeClass("communicating");
				$(this.domNode).addClass("open");
				this.enable();
				this.focusFirstWidget();
			},
			closed: function() {
				$(this.domNode).removeClass("communicating");
				$(this.domNode).removeClass("open");
			}

		},

		disable: function() {
			$.each(this.widgets,function() {
				$(this.getDomNode()).attr("disabled","true");
			});
		},

		enable: function() {
			$.each(this.widgets,function() {
				$(this.getDomNode()).removeAttr("disabled");
			});
		},
		
		boot: function() {

			var self = this;
			
			$.each(self.schema, function(col) {
				if (self.parentView.ignoresColumn(col)) delete self.schema[col];
			}); 
			
			self.widgetCount = self.schema.__count__;
			
			self.setState("communicating");
			
			$(Bxs.eventsPublisher).one("allWidgetsAppended", function() {
				self.setState("open");
			});
			
			$.each(self.schema,function(columnName,schema) {
				self.buildWidget(columnName,schema);
			});

		}

	}

);
