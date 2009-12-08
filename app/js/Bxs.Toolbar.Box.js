/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.Toolbar.Box = function(target) {
	
	this.target = target;
	this.build();
	return this;
	
}

Bxs.Toolbar.Box.prototype = $.extend(true,{},
	
	Bxs.Toolbar.Abstract.prototype,
	
	{
		controlNames: ["edit","confirm","cancel"],
		
		build: function() {
			
			this.domNode = document.createElement("toolbar");
			this.domNode.className = "editBar",
			this.domNode.setAttribute("targetNode",this.target),
			this.controls = {};
			
			var self = this;
			
			self.controlNames.forEach(function(b) {
				self.controls[b] = document.createElement("toolbarbutton");
				$(self.controls[b]).attr({ 
					command: b+"-command", 
					targetId: self.target,
					tooltiptext: $("#"+b+"-command").attr("label")
				});
				self.domNode.appendChild(self.controls[b]);
			})
			
			self.controls.tools = document.createElement("toolbarbutton");
			$(self.controls.tools).attr({ label: "Tools", targetId: self.target, popup: "boxToolsPopup", disabled: "true" });
			this.domNode.appendChild(self.controls.tools);
			
			this.disable();
		},
		
		states: {
			
			busy: function() {
				this.disable();
			},
			ready: function() {
				this.disable();
				this.enable(["tools"]);
			},
			active: function() {
				this.disable();
				this.enable(["edit","tools"]);
			},
			inactive: function() {
				this.disable();
			},
			editing: function() {
				this.disable();
				this.enable(["confirm","cancel"]);
			},
			communicating: function() {
				this.disable();
			}
		},
		
		enable: function(controls) {
			
			var self = this;
			
			controls.forEach(function(c) {
				self.controls[c].removeAttribute("disabled");
			});
			
			$(self.controls.tools).attr("popup","boxToolsPopup");
		},
		
		disable: function() {
			
			var self = this;
			
			$.each(self.controls, function() {
				this.setAttribute("disabled","true");
			});
			
			$(self.controls.tools).removeAttr("popup");
		}
		
	}
	
);