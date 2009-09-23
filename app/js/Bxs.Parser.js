/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Parser = {
		
	attributes: function(attrs) {
		
		var attrObj = {},
			self = this;

		$.each(attrs, function(key,attr) {
			self.attribute(attrObj,attr.nodeName,attr.nodeValue);
		});
		
		return attrObj;
	},
	
	attribute: function(object,attr,val) {
		try {
			var testVal = function() { return eval("("+val+")"); }();
		}
		catch(e) {
			var testVal = val;
		}
		object[attr] = testVal;
	}

};
