/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

if (Bxs.View.Box === undefined) {
	Bxs.View.Box = {};
}

Bxs.View.Box.Textbox = function(node) {
	
	Bxs.View.Box.Abstract.apply(this,arguments);
};

Bxs.View.Box.Textbox.prototype = $.extend(true,{},
	
	Bxs.View.Box.Abstract.prototype,
	
	{	
		clearContent: function() {

		},
		
		buildContent: function(data) {
			this.domNode.setAttribute("value",data.text);
		},
		
		boot: function() {
			
			var parentNode = this.domNode.parentNode,
				container = document.createElement("vbox"),
				self = this;
			
			// wrap domNode in vbox
			$(this.domNode).before(container);
			$(this.domNode).remove();
			$(container).append(this.domNode);
			
			var hbox = document.createElement("hbox");
			hbox.setAttribute("flex",0);
			
			this.editToolbar = new Bxs.Toolbar.Edit(this.attrs.id);
			
			hbox.appendChild(this.editToolbar.getDomNode());
			
			$(this.domNode).after(hbox);
		},
		
		activate: function() {
			
			var self = this;

			if (self.attrs.observing === undefined && self.attrs.suppressContentLoading === undefined) {
				self.requestData();
			}
			else {
				var state = (self.attrs.observing !== undefined) ? "inactive" : "ready";
				self.setState(state);
			}
		}

	}
);
