/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.View.Collection.Listbox.Image = function(node) {
	
	Bxs.View.Collection.Listbox.apply(this,arguments);
		
}

Bxs.View.Collection.Listbox.Image.prototype = $.extend(true,{},
	
	Bxs.View.Collection.Listbox.prototype,
	
	{
		
		buildRow: function(data) {
			var row = Bxs.View.Collection.Listbox.prototype.buildRow.apply(this,arguments),
				col = $(row).children(this.columnType+"[media='image']").get(0),
				id = $(col).siblings("[name='id']").get(0).getAttribute("value"),
				attrs = this.attrs.media,
				img = new Bxs.Media.Image(col,id,attrs,function(attr) { col.setAttribute("image",attr); });
					
				img.load();
				return row;
		},
		
		buildRowTemplate: function() {
			
			Bxs.View.Collection.Listbox.prototype.buildRowTemplate.apply(this);

			var col = document.createElement(this.columnType);
			$(col).attr({ class: "listcell-iconic", media: "image" });
			var firstCol = $(this.rowTemplate).children(this.columnType+":not([hidden])").get(0);
		    if (firstCol !== undefined) {
			$(firstCol).before(col);
		    }
		    else {
			$(this.rowTemplate).append(col);
		    }
		},
		
		boot: function(schema) {
			
			Bxs.View.Collection.Listbox.prototype.boot.apply(this,[schema]);
						
			var head = $(this.domNode).children("listhead").get(0);
			var header = document.createElement("listheader");
			$(header).attr({label: this.mediaType, class: "media" });
		    var firstHeader = $(head).children("listheader:not([hidden])").get(0);
		    if (firstHeader !== undefined) {
			$(firstHeader).before(header);			
		    }
		    else {
			$(head).append(header);
		    }
			
			var cols = $(this.domNode).children("listcols").get(0);
			var col = document.createElement("listcol");
		    var firstCol = $(cols).children("listcol:not([hidden])").get(0);
		    if (firstCol !== undefined) {
			$(firstCol).before(col);
			var s = document.createElement("splitter");
			s.setAttribute("resizeafter","farthest");
			$(col).after(s);
		    }
		    else {
			$(cols).append(col);
		    }
		}
	}
);
