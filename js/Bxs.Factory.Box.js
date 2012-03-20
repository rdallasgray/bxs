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

		var temp = temp || false,
			nodeType = $.string(node.nodeName).capitalize().str,
			boxType = $.string(node.getAttribute("bxs")).capitalize().str,
			box = {},
			defaultAttrs = {
				"hide" : "[]", 
				"ignore": "[]"
			};
		
		$.each(defaultAttrs, function(attr,value) {
			if ($(node).attr(attr) === "") {
				$(node).attr(attr,value);
			}
		});
		
		var parsedAttrs = Bxs.Parser.attributes(node.attributes);

		box.controller = node.hasAttribute("media") ? 
			new Bxs.Controller[boxType].Media : new Bxs.Controller[boxType].General;
		
		if (node.hasAttribute("media")) {
			var mediaType = /^\w*/.exec(parsedAttrs.media.type)[0];;
			try {
				box.view = new Bxs.View[boxType][nodeType][$.string(mediaType).capitalize().str](node);
			}
			catch(e) {
				box.view = new Bxs.View[boxType][nodeType](node);
			}
			box.view.mediaType = mediaType;
		}
		else {
			box.view = new Bxs.View[boxType][nodeType](node);
		}

		box.view.setController(box.controller);
		box.view.attrs = parsedAttrs;
		
		box.controller.setView(box.view);
		
		var filterNodes = $("[bxs='filter'][target='"+box.view.attrs.id+"']");
		if (filterNodes.length > 0) {
			$(filterNodes).each(function() {
				var filter = Bxs.Factory.Filter.build(this);
				box.view.addFilter(filter);
			});
		}
		
		box.controller.init();
		
		if (!temp) {
			Bxs.Boxes.add(box);
		}
		return box;
	},
	
	init: function() {
		
		var bxs = $("[bxs='box'],[bxs='collection']");
		
		Bxs.Boxes.count = bxs.length;
		
		var boxesBuilt = 0;
				
		bxs.each(function(node) {
			
			var node = this, box;
			
			if (box = Bxs.Boxes.getById(node.id)) {
				box.controller.refresh();
				boxesBuilt++;
				$(Bxs.eventsPublisher).trigger("boxBuilt",[boxesBuilt]);
				return true;
			}
			else {
				$(Bxs.eventsPublisher).one("boxBooted."+node.id, function() {
					boxesBuilt++;
					$(Bxs.eventsPublisher).trigger("boxBuilt",[boxesBuilt]);
				});
				Bxs.Factory.Box.build(node);
			}
		});
	}
	
};

