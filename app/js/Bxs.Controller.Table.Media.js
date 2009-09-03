/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Controller.Table.Media = function () {
	
	Bxs.Controller.Table.General.apply(this,arguments);
}

Bxs.Controller.Table.Media.prototype = $.extend(true,{},
	
	Bxs.Controller.Table.General.prototype, 
	
	{
		
		createRow: function() {
			
			this.setState("ready");
			
			var url = this.getLocation();
			
			var self = this,
				req = {
					service: "fileUpload",
					options: {
						method: "POST",
						url: url+"?format=json",
						username: Bxs.auth.username,
						password: Bxs.auth.password,
						contentType: this.attrs.media.type
					},
					callback: function() {
						if (self.getLocation() === url) {
							self.handleData(req.response, "insert");
						}
					}
				};
				
			Bxs.service.get(req);
		},
		
		handleInsert: function (response) {
			var data = Bxs.Json.parse(response.text);
			var row = this.view.buildRow(data);
			this.view.appendRowAtHead(row);
		},

		
	}
);
