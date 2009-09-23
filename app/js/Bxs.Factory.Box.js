/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

if (Bxs.Factory === undefined) {
	Bxs.Factory = {};
}

Bxs.Factory.Box = {
	
	build: function(node,temp) {
		
		temp = temp || false;
		
		var nodeType = $.string(node.nodeName).capitalize().str,
			box = {};
				
		var defaultAttrs = {
			"hide" : "[]", 
			"ignore": "[]"
		};
		
		
		$.each(defaultAttrs, function(attr,value) {
			if ($(node).attr(attr) === "") {
				$(node).attr(attr,value);
			}
		});
		
		box.controller = node.hasAttribute("media") ? new Bxs.Controller.Collection.Media : new Bxs.Controller.Collection.General;
		
		box.controller.setAttributes(node.attributes);
		
		if (box.controller.hasAttribute("media")) {
			var mediaType = $.string(/^\w*/.exec(box.controller.attrs.media.type)[0]).capitalize().str;
			box.view = new Bxs.View.Collection[nodeType][mediaType](node);
		}
		else {
			box.view = new Bxs.View.Collection[nodeType](node);
		}
		box.view.setController(box.controller);
		box.view.setAttributes(node.attributes);
		
		box.controller.setView(box.view);
		
		var filters = $("[target='"+node.id+"']");
		$.each(filters, function() {
			var f = Bxs.Factory.Filter.build(this);
			box.controller.addFilter(f);
		});
		
		box.controller.init();
		
		if (!temp) {
			Bxs.Boxes.add(box);
		}
		
		return box;

	},
	
	init: function() {
		 
		$("[view='box']").each(function(node) {
			Bxs.Factory.Box.build(this);
		});
		
//		Bxs.Boxes.collection[0].view.domNode.focus();
	}
	
};

