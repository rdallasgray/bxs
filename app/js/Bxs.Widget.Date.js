/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/


Bxs.Widget.Date = function(schema,parentNode) {

	Bxs.Widget.Abstract.apply(this,arguments);
};

Bxs.Widget.Date.prototype = $.extend(true,{},
	
	Bxs.Widget.Abstract.prototype,

	{

		boot: function() {

			this.domNode = document.createElement("datepicker");
						
			this.fixFocusBehaviour();

			$(Bxs.eventsPublisher).trigger("widgetReady."+$(this.parentNode).attr("name"),[this]);
		},
		
		fixDatePicker: function(datePicker) {
			
			var an = document.getAnonymousNodes(datePicker)[0],
				monthField = an.children[0],
				monthSeparator = an.children[1],
				dateField = an.children[2],
				dateSeparator = an.children[3];
				
			[monthField, monthSeparator, dateField, dateSeparator].forEach(function(item) {
				an.removeChild(item);
			});
			
			[monthSeparator, monthField, dateSeparator, dateField].forEach(function(item) {
				an.insertBefore(item, an.firstChild);
			});
		},
		
		bindKeypressHandler: function() {
			$(this.domNode).bind("keypress", function(e) {
				if (e.charCode !== 0 && (e.charCode < 48 || e.charCode > 57)) {
					e.originalTarget.value = (e.originalTarget.maxLength === 4) ? "----" : "--";
				}
			});
		},
		
		afterAppend: function() {
			this.fixDatePicker(this.domNode);
			this.bindKeypressHandler();
		},
		
		setDateValue: function(datePicker, value) {
			var date = new Date(),
				parsed = Bxs.Date.parseDate(value),
				defaultYear = (parsed[0] === '----') ? date.getFullYear() - 1: parsed[0],
				defaultMonth = (parsed[1] === '--') ? "01" : parsed[1],
				defaultDate = (parsed[2] === '--') ? "01" : parsed[2];

			datePicker.value = [defaultYear, defaultMonth, defaultDate].join("-");
			
			datePicker.yearField.value = parsed[0];
			datePicker.monthField.value = parsed[1];
			datePicker.dateField.value = parsed[2];
		},
		
		getDateValue: function(datePicker) {
			var value = '',
				year = (datePicker.yearField.value === "----") ? "0000" : datePicker.yearField.value,
				month = (datePicker.monthField.value === "--") ? "00" : datePicker.monthField.value,
				date = (datePicker.dateField.value === "--") ? "00" : datePicker.dateField.value;
			
			value = [year, month, date].join("-");
			
			return value;
		},
	
		setValue: function(value) {
			this.setDateValue(this.domNode, value);
		},
	
		getValue: function() {
			return this.getDateValue(this.domNode);
		}

	}
);