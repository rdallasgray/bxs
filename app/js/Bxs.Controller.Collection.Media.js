/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Controller.Collection.Media = function () {
	
	Bxs.Controller.Collection.General.apply(this,arguments);
}

Bxs.Controller.Collection.Media.prototype = $.extend(true,{},
	
	Bxs.Controller.Collection.General.prototype, 
	
	{
		createRow: function() {
			
			var url = Bxs.Url.construct(this.parseUrl()),
				self = this,
				req = {
					service: "fileUpload",
					options: {
						method: "POST",
						url: url,
						headers: {
							Accept: "application/json, text/javascript, */*"
						},
						username: Bxs.auth.username,
						password: Bxs.auth.password,
						contentType: this.view.attrs.media.type
					},
					callback: function() {
						if (Bxs.Url.construct(self.parseUrl()) === url) {
							self.handleData(req.response, "insert");
						}
					}
				};
			
			this.view.setState("ready"); // on error box will set previous state
			
			Bxs.service.get(req);
		},
		
		handlers: $.extend(true, {}, Bxs.Controller.Collection.General.prototype.handlers, {
			insert: function(self,response) {

				var data = Bxs.Json.parse(response.text),
					row = self.view.buildRow(data);
					
				self.view.appendRowAtHead(row);
			}
		}),
		
		downloadMedia: function() {
			var url = this.parseUrl(true)+"/"+this.view.getSelectedId();
				
			Bxs.Downloads.create(Bxs.Url.construct(url));
		},
		
		viewMedia: function() {
			var url = this.parseUrl(true)+"/"+this.view.getSelectedId(),
				viewWindow = window.open(url,"viewWindow");
		}
	}
);
