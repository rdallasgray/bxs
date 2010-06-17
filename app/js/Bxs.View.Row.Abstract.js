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

	{		
		getDomNode: function() {
			
			return this.domNode;
		},

		getData: function() {

			var data = {},
				self = this;
			
			$.each(this.schema, function(name) {
				if (name in self.widgets) {
					data[name] = self.widgets[name].getValue();
				}
				else {
					data[name] = $(self.domNode).children(self.parentView.columnType + "[name='" + name + "']")
						.attr("value");
				}
			});

			return data;
		},

		buildWidget: function(columnName) {
			
			var domNode = $(this.domNode).children(this.parentView.columnType+"[name='"+columnName+"']"),
				self = this;
			
			if ($(domNode).attr("hidden") === "true") {
				self.widgetCount--;
				if (self.widgetCount === 0) {
					$(Bxs.eventsPublisher).trigger("editViewReady");
				}
				return;
			}
			
			domNode.addClass("communicating");
			
			if (self.defaultValues !== null && (value = self.defaultValues[columnName])) {
				domNode.attr("value",value);
			}

			$(Bxs.eventsPublisher).one("widgetReady."+columnName, function(e,widget) {
				
				domNode.append(widget.getDomNode());
				widget.afterAppend();
				domNode.removeClass("communicating");
				domNode.addClass("open");
				if(!domNode.attr("hidden") && !self.focussed) {
					widget.focus();
					self.focussed = true;
				}

				$(Bxs.eventsPublisher).trigger("widgetAppended."+columnName);

				self.widgetCount--;
				if (self.widgetCount === 0) {
					$(Bxs.eventsPublisher).trigger("editViewReady");
				}
			});
			
			self.widgets[columnName] = Bxs.Factory.Widget.build(domNode.attr("value"), domNode.get(0), self.parentView);

		},

		updateData: function(data) {

			var self = this;

			$.each(self.schema, function(columnName) {
				var column = $(self.domNode).children(self.parentView.columnType+"[name='"+columnName+"']").get(0),
					label = "",
					type = Bxs.Column.type(columnName);
				
				if (type === "list") {
					self.parentView.labelAssociatedColumn(column,data[columnName]);
				}
				else {
					$(column).attr("label", self.parentView.getColumnLabel(data[columnName], type));
				}
				
				if (type === "boolean") {
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

		close: function() {

			var self = this;
	
			$(this.domNode).children(this.parentView.columnType).removeClass("open");
			this.focussed = false;

			self.disable();

			$.each(self.widgets, function() {
				$(this.getDomNode()).remove();
			});

			$(self.domNode).removeAttr("allowevents");
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

			$.each(self.schema,function(columnName) {
				self.buildWidget(columnName);
			});

		}

	}

);
