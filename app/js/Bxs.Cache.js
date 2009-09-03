/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Cache = {

	_bucket: {},

	set: function(keys,data) {
		
		var pointer,key;
		
		[pointer,key] = Bxs.Cache._findKey(keys,true);
		
		pointer[key] = data;
	},
	
	_findKey: function(keys,createIfUndefined) {
		
		var pointer = Bxs.Cache._bucket,
			key = null,
			oldPointer = null;

		$.each(keys, function() {
			key = this;
			if (pointer[key] === undefined) {
				if (createIfUndefined !== true) {
					return false;
				}
				pointer[key] = {};
			}
			oldPointer = pointer;
			pointer = pointer[key];
		});
		
		return [oldPointer,key];
	},

	get: function(keys) {
		var pointer,key;
		
		[pointer,key] = Bxs.Cache._findKey(keys);
		
		if (pointer === null) {
			return false;
		}
		
		return pointer[key] === undefined ? false : pointer[key];
	},

	clear: function(keys) {
		
		var pointer,key;
		
		[pointer,key] = Bxs.Cache._findKey(keys);
		
		if (pointer === null) {
			return false;
		}
		
		if (pointer[key] !== undefined) {
			delete pointer[key];
		}
		
	}
};
