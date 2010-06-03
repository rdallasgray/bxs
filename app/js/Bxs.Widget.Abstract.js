/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

if (Bxs.Widget === undefined) {
	Bxs.Widget = {};
}

Bxs.Widget.Abstract = function(schema,parentNode,parentView) {

	this.schema = schema;
	this.parentNode = parentNode;
	this.parentView = parentView;
};

Bxs.Widget.Abstract.prototype = {
	
	boot: function() {
	},
	
	fixFocusBehaviour: function() {
		
		var self = this;
		
		$(self.domNode).bind("focus",function() {
			setTimeout(function() {
				var range = document.createRange(); 
				range.selectNode(self.domNode); 
				var selection = window.getSelection(); 
				selection.addRange(range); 
				selection.collapseToStart(); 
			},0);
		});
	},
	
	getDomNode: function() {
		return this.domNode;
	},
	
	afterAppend: function() {
		
	},
	
	setValue: function(value) {
		$(this.domNode).attr("value",value);
	},
	
	getValue: function() {
		var value = '';
		switch (this.domNode.value) {
			case undefined:
			value = $(this.domNode).attr("value");
			break;
			default:
			value = this.domNode.value;
		}
		return value;
	}
};