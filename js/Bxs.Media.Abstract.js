/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

if (Bxs.Media === undefined) {
	Bxs.Media = {};
}

Bxs.Media.Abstract = function(node,id,attrs,callback) {

	this.targetNode = node;
	this.id = id;
	this.attrs = attrs;	
	this.callback = callback;
	
	var urlTemplate = (this.attrs.url === undefined) 
			? Bxs.Conf.media[this.attrs.type].url : this.attrs.url,
		viewUrlTemplate = (this.attrs.viewUrl === undefined) 
			? Bxs.Conf.media[this.attrs.type].viewUrl : this.attrs.viewUrl;
	
	this.url = urlTemplate.replace(/:\w*/,this.id);
	this.viewUrl = viewUrlTemplate.replace(/:\w*/,this.id);
}

Bxs.Media.Abstract.prototype = {
}
