/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Json = {
	
	parse: function(str) {
		try {
			return JSON.parse(str);
		}
		catch(e) {
			if (str.length > 128) {
				str = str.substr(0,128)+" ...";
			}
			Bxs.error.fatal("Couldn't parse JSON string: "+str);
		}
	},
	
	stringify: function(obj) {
		try {
			return JSON.stringify(obj);
		}
		catch(e) {
			Bxs.error.fatal("Couldn't convert object to JSON string: "+obj.toSource());
		}
	}
	
/*	encode: function(obj) {
		this.obj = obj;
		this.jsonArr = [];
		this.jsonArr.push("{");
		this.begin();
		this.jsonArr.push("}");
		return(this.jsonArr.join(''));
	},
	decode: function(text) {
		console.debug(text);
		return eval("("+text+")");
	},
	begin: function() {
		for (var i in this.obj) {
			this.jsonArr.push('"',i,'":');
			this.recurse(this.obj[i]);
			this.jsonArr.push(',');
		}
		this.jsonArr.pop();
	},
	recurse: function(obj) {
		if (this.stringLike(obj)) {
			this.makeString(obj);
		}
		else if (obj instanceof Array) {
			this.makeArray(obj);
		}
		else {
			this.makeObject(obj);
		}
	},
	stringLike: function(obj) {
		return ['number','string','boolean'].some(function(el,idx,arr) { return typeof(obj) === el });
	},
	makeString: function(obj) {
		this.jsonArr.push('"',this.makeSafe(obj.toString()),'"');
	},
	makeArray: function(obj) {
		var mkArr = function(el,idx,arr) {
			this.stringLike(el) ? this.makeString(el) : this.recurse(el);
			this.jsonArr.push(",");
		}
		this.jsonArr.push("[");
		obj.forEach(mkArr,this);
		this.jsonArr.pop();
		this.jsonArr.push("]");
	},
	makeObject: function(obj) {
		if (obj === null || obj === undefined) {
			this.jsonArr.push('""');
			return;
		}
		this.jsonArr.push("{");
		for (var i in obj) {
			this.jsonArr.push('"',i,'":');
			this.stringLike(obj[i]) ? this.makeString(obj[i]) : this.recurse(obj[i]);
			this.jsonArr.push(",");
		}
		this.jsonArr.pop();
		this.jsonArr.push("}");
	},
	makeSafe: function(str) {
		str = str.replace(/\n/gm,'__CR__');
		str = str.replace(/\\/gm,'\\u005C');
		str = str.replace(/\	/gm,'\\u0009');
		str = str.replace(/\//gm,'\\u002F');
		str = str.replace(/\"/gm,'\\u0022');
		str = str.replace(/\'/gm,'\\u0027');
		str = str.replace(/\+/gm,'\\u002B');
		str = str.replace(/\%/gm,'\\u0025');
		str = str.replace(/__CR__/gm,'\\n');
		str = str.replace(/&/gm,'\\u0026');
		return str;
	}*/
};