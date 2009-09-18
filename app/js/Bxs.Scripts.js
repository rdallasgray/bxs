/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Scripts = {
	
	files: [
	
		"jquery.string.1.0",
		
		"Bxs.Mixin.Attributeable",
		"Bxs.Mixin.Commandable",
		"Bxs.Mixin.Stateable",
		
		"Bxs.Xpath",
		"Bxs.Comparator",

		"Bxs.Boxes",
		"Bxs.Panel",
		"Bxs.List",
		"Bxs.String",

		"Bxs.Factory.Box",
		"Bxs.Factory.Filter",
		"Bxs.Factory.List",
		"Bxs.Factory.Widget",

		"Bxs.Media.Abstract",
		"Bxs.Media.Image",

		"Bxs.View.Abstract",
		
		"Bxs.View.Collection.Abstract",
		"Bxs.View.Collection.Listbox",
		"Bxs.View.Collection.Listbox.Image",

		"Bxs.View.Row.Abstract",
		"Bxs.View.Row.Listitem",

		"Bxs.Controller.Abstract",
		"Bxs.Controller.Collection.General",
		"Bxs.Controller.Collection.Media",

		"Bxs.Widget.Abstract",
//		"Bxs.Widget.Integer",
		"Bxs.Widget.String",
//		"Bxs.Widget.Date",
//		"Bxs.Widget.Datetime",
		"Bxs.Widget.Boolean",
		"Bxs.Widget.List",
		
		"Bxs.Filter.Abstract",
		"Bxs.Filter.Year",
		
		"Bxs.Toolbar.Abstract",
		"Bxs.Toolbar.Edit",
		
		"Bxs.Cache"
		
	],
	
	//why is $.getScript not working? OK --it works with $.get and eval() ...
	// oh, it's because of the HEAD thing. Not meant for XUL.
	load: function() {
		
		// DEBUG
		return;
		
		$.ajaxSetup({async: false});
		
		var	fileTotal = Bxs.Scripts.files.length,
		    fileCount = fileTotal,
			progress = 0,
			progressBroadcaster = $('#scriptsProgressBroadcaster');
		
		Bxs.Scripts.files.forEach(function(file) {
			$.get([Bxs.Url.root(),"/Bxs/app/js/",file,".js"].join(''),function(data) {
				try {
					eval(data);
				}
				catch (e) {
					console.warn("failed to eval "+file+".js");
				}
			});
			
			fileCount--;
			progress = Math.round((100/fileTotal) * (fileTotal - fileCount));
			
			progressBroadcaster.attr("value",progress);
		});
		
		$.ajaxSetup({async: true});
	}
	
};

