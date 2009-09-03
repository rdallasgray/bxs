/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.Factory.Widget = {
	
	build: function(schema,value,parentNode,parentView) {
		
		var widgetType,
			name = $(parentNode).attr("name");
		
		if (/_id$/.test(name)) {
			widgetType = "List";
		}

		else {
			switch(schema.type) {
			
				case "date":
				case "datetime":
				case "integer":
				case "string":
				case "float":
				case "text":
				case "time":
				case "timestamp":
				case "decimal":
				widgetType = "String";
				break;
						
				case "boolean":
				widgetType = "Boolean";
				break;
				
			}
		}
		
		var widget = new Bxs.Widget[widgetType](schema,parentNode,parentView);
		
		$(Bxs.eventsPublisher).one("widgetAppended."+name,function() {
			widget.setValue(value); 
		});
		
		widget.build();
		
		return widget;
				
	}
	
};

