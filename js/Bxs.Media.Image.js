/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.Media.Image = function(node,id,attrs,callback) {

	Bxs.Media.Abstract.apply(this,arguments);
	
	this.img = new Image();

}

Bxs.Media.Image.prototype = $.extend(true,{},
	
	Bxs.Media.Abstract.prototype,

	{
		load: function() {
		
			var self = this;
		
			$("#tempBox").append(this.img);
		
		
			$(self.targetNode).addClass("mediaLoading");

			$(this.img).one("error", function() {
				$(self.targetNode).removeClass("mediaLoading");
				$(self.targetNode).addClass("mediaError");
				$(self.img).remove();
			});
		
			$(this.img).one("load", function() {
				$(self.targetNode).removeClass("mediaLoading");
				$(self.img).remove();
				self.callback(self.url);
			});
			
			this.img.src = Bxs.Url.root()+this.url;
		}
	}
);