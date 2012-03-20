/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.Widget.Datetime = function(parentNode) {

	Bxs.Widget.Date.apply(this,arguments);
};

Bxs.Widget.Datetime.prototype = $.extend(true,{},
	
	Bxs.Widget.Date.prototype,

	{

		boot: function() {

			this.domNode = document.createElement("box");
			this.datePicker = document.createElement("datepicker");
			this.timePicker = document.createElement("timepicker");
			this.timePicker.setAttribute("hideseconds", "true");
			this.timePicker.setAttribute("increment", "5");
			this.timePicker.minuteLeadingZero = true;
			this.timePicker.hourLeadingZero = true;
			
			this.domNode.appendChild(this.datePicker);
			this.domNode.appendChild(this.timePicker);
						
			this.fixFocusBehaviour();

			$(Bxs.eventsPublisher).trigger("widgetReady."+$(this.parentNode).attr("name"),[this]);
		},
		
		focus: function() {
			this.datePicker.focus();
		},
		
		afterAppend: function() {
			this.fixDatePicker(this.datePicker);
			this.bindKeypressHandler();
		},
	
		setValue: function(value) {
			if (value === "") {
				value = "0000-00-00 00:00:00";
			}
			this.setDateValue(this.datePicker, value);
			this.timePicker.value = Bxs.Date.formatTime(value);
		},
		
		getTimeValue: function(timePicker) {
			var value = '',
				hour = (timePicker.hourField.value === "--") ? "0000" : timePicker.hourField.value,
				minute = (timePicker.minuteField.value === "--") ? "00" : timePicker.minuteField.value;
			
			return [hour, minute].join(":");
		},
	
		getValue: function() {
			var date = this.getDateValue(this.datePicker),
				time = this.getTimeValue(this.timePicker);
						
			return [date, " ", time, ":00"].join("");
		}

	}
);