/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Tables = {
	
	getById: function(id) {
		
		var match = Bxs.Tables.collection.filter(function(el) el.controller.attrs.id === id);
		return match.length > 0 ? match[0] : false;
	},
/*	
	getByUrl: function(url) {
		
		var match = Bxs.Tables.collection.filter(function(el) $(el.view.domNode).attr("url") === url);
		return match.length > 0 ? match[0] : false;
	},
*/	
	getByName: function(name) {
		
		var match = Bxs.Tables.collection.filter(function(el) el.controller.attrs.name === name);
		return match.length > 0 ? match : false;
	},
	
	add: function(table) {
		
		Bxs.Tables.collection.push(table);
	},
	
	remove: function(id) {
		
		var newCollection = Bxs.Tables.collection.filter(function(el) el.controller.attrs.id !== id);		
		
		Bxs.Tables.collection = newCollection;
	},
	
	disable: function() {
		Bxs.Tables.collection.forEach(function(el) el.view.disable());
	},
	
	enable: function() {
		Bxs.Tables.collection.forEach(function(el) el.view.enable());
	},
	
	collection: []
	
}