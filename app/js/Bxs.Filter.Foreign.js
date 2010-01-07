/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.

Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.Filter.Foreign = function(node) {

	Bxs.Filter.Abstract.apply(this,arguments);
};

Bxs.Filter.Foreign.prototype = $.extend(true,{},

	Bxs.Filter.Abstract.prototype,

	{
		build: function() {
			
			var self = this;

			this.menupopup = document.createElement("menupopup");
			this.domNode.appendChild(this.menupopup);

			var allItem = document.createElement('menuitem');
			$(allItem).attr({ label: "All", value: "null", class: "strong" });
			this.menupopup.appendChild(allItem);

			var sep = document.createElement("menuseparator");
			this.menupopup.appendChild(sep);
			
			$(Bxs.eventsPublisher).one("listReady."+self.attrs.listUrl+self.attrs.target, function() {
				var n = self.list.getDomNode();
				$(self.menupopup).append(n);
			});
			this.list = Bxs.Factory.List.build(this.attrs.listUrl,this.name,self.attrs.target);

			this.setValue("null");
			$(this.domNode).attr("label","All");
		},

		getValue: function() {

			var value = Bxs.Widget.Abstract.prototype.getValue.apply(this),
				url = null;

			if (value !== "null") {
				url = this.attrs.targetUrl.replace(
					/:\w*/g,
					value
				);
			}

			return url;
		}
	}
);

