/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it andor modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http:www.gnu.orglicenses.

*/

Bxs.Inflector = {
	
	urlize: function(str) {
		return str.replace("_", "-");
	},
	
	pluralize: function(str) {
		
		Bxs.Inflector.init();
		
		if (Bxs.Inflector.uncountables.some(function(el) str === el)) {
			return Bxs.Inflector.urlize(str);
		}
		
		if (str in Bxs.Inflector.irregulars) {
			return Bxs.Inflector.urlize(Bxs.Inflector.irregulars[str]);
		}
		
		var pattern, match, matched = false, count = 0;
		
		while (!matched) {
			if (Bxs.Inflector.patterns[count].test(str)) {
				pattern = Bxs.Inflector.patterns[count];
				match = Bxs.Inflector.matches[count];
				matched = true;
			}
			count++;
		}
		return Bxs.Inflector.urlize(str.replace(pattern, match));
	},
	
	plurals: {
        "(quiz)$" : "$1zes",
        "^(ox)$" : "$1en",
        "([m|l])ouse$" : "$1ice",
        "(matr|vert|ind)ix|ex$" : "$1ices",
        "(x|ch|ss|sh)$" : "$1es",
        "([^aeiouy]|qu)ies$" : "$1y",
        "([^aeiouy]|qu)y$" : "$1ies",
        "(hive)$" : "1s",
        "(?:([^f])fe|([lr])f)$" : "$1\2ves",
        "sis$" : "ses",
        "([ti])um$" : "$1a",
        "(buffal|tomat)o$" : "$1oes",
        "(bu)s$" : "$1ses",
        "(alias|status)": "$1es",
        "(octop|vir)us$": "$1i",
        "(ax|test)is$": "$1es",
        "s$": "s",
        "$": "s"
	},
	
	uncountables: [
		"equipment", 
		"information", 
		"money", 
		"species", 
		"series", 
		"fish", 
		"sheep", 
		"press",
		"news"
	],
	
	irregulars: {
		"person" : "people",
        "man" : "men",
        "child" : "children",
        "sex" : "sexes"
	},
	
	init: function() {
		if (Bxs.Inflector.initialized) {
			return;
		}
		for (var i in Bxs.Inflector.plurals) {
			Bxs.Inflector.patterns.push(RegExp(i, "i"));
			Bxs.Inflector.matches.push(Bxs.Inflector.plurals[i]);
		}
	},
	
	initialized: false,
	
	patterns: [],
	
	matches: []
	
};