/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Scripts = {
	
	files: [
		
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

