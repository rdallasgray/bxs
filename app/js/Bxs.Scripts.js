/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Scripts = {
	
	files: [
		"Bxs.Editor.js",
		"Bxs.Parser.js",
		"Bxs.Response.js",
		
		"Bxs.Mixin.Commandable.js",
		"Bxs.Mixin.Stateable.js",
		
		"Bxs.Xpath.js",
		"Bxs.Comparator.js",
		
		"Bxs.Boxes.js",
		"Bxs.Panel.js",
		"Bxs.List.js",
		"Bxs.String.js",
		
		"Bxs.Factory.Box.js",
		"Bxs.Factory.Filter.js",
		"Bxs.Factory.List.js",
		"Bxs.Factory.Widget.js",
		
		"Bxs.Media.Abstract.js",
		"Bxs.Media.Image.js",
		
		"Bxs.View.Abstract.js",
		"Bxs.View.Box.Abstract.js",
		"Bxs.View.Box.Textbox.js",
		"Bxs.View.Collection.Abstract.js",
		"Bxs.View.Collection.Listbox.js",
		"Bxs.View.Collection.Listbox.Image.js",
		
		"Bxs.View.Row.Abstract.js",
		"Bxs.View.Row.Listitem.js",
		
		"Bxs.Controller.Abstract.js",
		"Bxs.Controller.Box.General.js",
		"Bxs.Controller.Collection.General.js",
		"Bxs.Controller.Collection.Media.js",
		
		"Bxs.Widget.Abstract.js",
		"Bxs.Widget.String.js",
		"Bxs.Widget.Boolean.js",
		"Bxs.Widget.List.js",
		
		"Bxs.Filter.Abstract.js",
		"Bxs.Filter.Year.js",
		
		"Bxs.Toolbar.Abstract.js",
		"Bxs.Toolbar.Box.js",
		"Bxs.Toolbar.Collection.js",
		
		"Bxs.Cache.js",
	],
	
	load: function() {
		
		Bxs.Scripts.count = Bxs.Scripts.files.length;
		
		$.ajaxSetup({async: false});
		
		var	filesLoaded = 0;
		
		Bxs.Scripts.files.forEach(function(file) {
			$.get(Bxs.Url.app("/js/"+file),function(data) {
				try {
					data = data+"\n\n//@ sourceURL="+file;
					eval(data);
				}
				catch (e) {
					console.warn("failed to eval "+file+".js");
				}
			});
			
			filesLoaded++;
			$(Bxs.eventsPublisher).trigger("scriptLoaded",[filesLoaded]);
		});
		
		$.ajaxSetup({async: true});
	}
	
};

