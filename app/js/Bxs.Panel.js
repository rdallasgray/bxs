/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Panel = function(parentNode) {
	
	this.parentNode = parentNode;
	this.boot();
}

Bxs.Panel.prototype = {
	
	boot: function() {
		this.domNode = document.createElement("panel");
		$(this.domNode).attr({ id: "temp-panel", noautofocus: "true", noautohide: "true", ignorekeys: "true" });
		
		$("#mainPopupSet").append(this.domNode);
		
	},
	
	open: function() {
		this.domNode.openPopup(this.parentNode,'after_start',0,0,false,false);
	},
	
	close: function() {
		this.domNode.hidePopup();
		this.parentNode.focus();
	},
	
	cleanUp: function() {
		this.close();
		try {
			// jQuery not working here for some reason
			document.getElementById("mainPopupSet").removeChild(document.getElementById("temp-panel"));
		}
		catch(e) {
		}
	}
	
}