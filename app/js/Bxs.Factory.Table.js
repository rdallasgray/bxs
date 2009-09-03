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

Bxs.Factory.Table = {
	
	build: function(node,temp) {
		
		temp = temp || false;
		
		var nodeType = $.string(node.nodeName).capitalize().str,
			table = {};
		
		var broadcaster = document.createElement('broadcaster');
		broadcaster.id = node.id+"_broadcaster";
		$('#mainBroadcasterSet').append(broadcaster);
		
		var defaultAttrs = {
			"hide" : "[]", 
			"ignore": "[]"
		};
		
		$.each(defaultAttrs, function(attr,value) {
			if ($(node).attr(attr) === "") {
				$(node).attr(attr,value);
			}
		});
		
		table.controller = node.hasAttribute("media") ? new Bxs.Controller.Table.Media : new Bxs.Controller.Table.General;
		
		table.controller.setAttributes(node.attributes);
		
		if (table.controller.hasAttribute("media")) {
			var mediaType = $.string(/^\w*/.exec(table.controller.attrs.media.type)[0]).capitalize().str;
			table.view = new Bxs.View.Table[nodeType][mediaType](node);
		}
		else {
			table.view = new Bxs.View.Table[nodeType](node);
		}
		table.view.setController(table.controller);
		table.view.setBroadcaster(broadcaster);
		table.view.setAttributes(node.attributes);
		
		table.controller.setView(table.view);
		table.controller.setBroadcaster(broadcaster);
		
		var filters = $("[target='"+node.id+"']");
		$.each(filters, function() {
			var f = Bxs.Factory.Filter.build(this);
			table.controller.addFilter(f);
		});
		
		table.controller.init();
		
		if (!temp) {
			Bxs.Tables.add(table);
			$(Bxs.eventsPublisher).trigger("newTable."+$(node).attr("name"));
		}
		
		return table;

	},
	
	init: function() {
		 
		$("[view='table']").each(function(node) {
			Bxs.Factory.Table.build(this);
		});
		
//		Bxs.Tables.collection[0].view.domNode.focus();
	}
	
};

