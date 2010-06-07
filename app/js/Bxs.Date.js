/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Date = {
	
	parseDate: function(isoDate) {
		
		var dateTime = isoDate.split(" "),
			parts = dateTime[0].split("-"),
			year = (parts[0] === "0000") ? "----" : parts[0],
			month = (parts[1] === "00") ? "--" : parts[1],
			date = (parts[2] === "00") ? "--" : parts[2];
			
		return [year, month, date];
	},
	
	formatDate: function(isoDate) {
		var parsed = Bxs.Date.parseDate(isoDate).filter(function(el) {
			return !isNaN(parseInt(el));
		});
		return parsed.reverse().join("/");
	},
	
	parseDateTime: function(isoDate) {
		var dateTime = isoDate.split(" "),
			parsedDate = Bxs.Date.parseDate(dateTime[0]),
			parsedTime = Bxs.Date.parseTime(dateTime[1]);
	
		return parsedDate.concat(parsedTime);
	},
	
	formatDateTime: function(isoDate) {
		var dateTime = isoDate.split(" "),
			formattedDate = Bxs.Date.formatDate(dateTime[0]),
			formattedTime = Bxs.Date.formatTime(dateTime[1]);
		
		return (formattedTime === "00:00") ? formattedDate : [formattedDate, formattedTime].join(", ");
	},
	
	parseTime: function(isoTime) {
		
		if (isoTime === undefined) {
			return ["00", "00"];
		}
		
		var dateTime = isoTime.split(" "),
			time = (dateTime.length > 1) ? dateTime[1] : dateTime[0],
			parts = time.split(":"),
			hour = parts[0],
			minute = parts[1];
			
		return [hour, minute];
	},
	
	formatTime: function(isoTime) {
		var time = Bxs.Date.parseTime(isoTime).join(":");
		
		return time;
	}
	
};
