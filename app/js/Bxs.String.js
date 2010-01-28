/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.String = {
	
	fromPattern: function(pattern,object,default_pattern) {
		
		default_pattern = default_pattern || "(no :match)";
		
		var string = pattern.replace(/:\w+/g,function(match) {
			var property = match.substr(1),
				stringPart = object[property];
			
			if (object[property] === undefined) {
				if (object[property+"_id"] !== undefined) {
					//TODO probably need to make this event-based so we can get a foreign list and make strings from that
					stringPart = object[property+"_id"];
				}
			}
				
			if (stringPart === "" || stringPart === undefined) {
				return default_pattern.replace(/:match/,property);
			}
				
			return stringPart;
		});
		
		return string;
	}
	
}