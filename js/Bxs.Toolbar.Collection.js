/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.Toolbar.Collection = function(target) {
	
	return Bxs.Toolbar.Box.apply(this,arguments);	
}

Bxs.Toolbar.Collection.prototype = $.extend(true,{},
	
	Bxs.Toolbar.Box.prototype,
	
	{
		controlNames: ["newRow","deleteRow"].concat(Bxs.Toolbar.Box.prototype.controlNames),
		
		states: $.extend(true,{},
			
			Bxs.Toolbar.Box.prototype.states,
			
			{
				ready: function() {
					this.disable();
					this.enable(["newRow","tools"]);
				},
				active: function() {
					this.disable();
					this.enable(["newRow","deleteRow","edit","tools"]);
				},
				creating: function() {
					this.disable();
					this.enable(["confirm","cancel"]);
				},
				deleting: function() {
					this.disable();
				}
			}
		)
	}
);