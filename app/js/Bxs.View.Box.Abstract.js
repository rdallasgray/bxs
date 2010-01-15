/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

if (Bxs.View.Box === undefined) {
	Bxs.View.Box = {};
}

Bxs.View.Box.Abstract = function(node) {
	
	this.domNode = node;	
};

Bxs.View.Box.Abstract.prototype = $.extend(true,{},
	
	Bxs.View.Abstract,
	Bxs.Mixin.Stateable,
	
	{	
		
		getDomNode: function() {
			return this.domNode;
		},
		
		isEmpty: function() {
			return true;
		},
		
		getObservedBox: function() {
			return Bxs.Boxes.getById(this.attrs.observing);
		},
		
		requestData: function() {
			$(Bxs.eventsPublisher).trigger("dataRequested."+this.attrs.id);
		},
		
		hasFilters: function() {
			return this.filters !== undefined && this.filters.length > 0;
		},
		
		hasForeignFilters: function() {
			if (this.filters === undefined || this.filters.length === 0) {
				return false;
			}
			var hff = false;
			$.each(this.filters, function() {
				if (this.attrs.filterType === 'foreign') {
					hff = true;
					return false;
				}
			});
			return hff;
		},
		
		render: function(data) {

			var self = this;
						
			$(Bxs.eventsPublisher).trigger("contentChanged."+self.attrs.id);
			self.clearContent();
			self.buildContent(data);
		},
		
		clearContent: function() {

		},
		
		buildContent: function(data) {

		},
		
		editable: function() {
			return true;
		},
	
		editOpen: function() {
			
		},
		
		getEditedData: function() {

		},
				
		updateEditView: function(data) {
			
		},

		editClose: function(options) {
			
			var options = options || {state: "default"};
			
			switch (options.state) {
				
				case "cancel":
				break;
				
				case "complete":
				break;
			}
		},
		
		states: {
			
			inactive: function() {
				this.disable();
			},
			busy: function() {
				$(this.domNode).addClass("busy");
			},
			ready: function() {
				$(this.domNode).removeClass("busy");
				this.enable();
				this.setState("active");
			},
			active: function() {
			},
			communicating: function() {
			},
			editing: function() {
			}
		},
		
		disable: function() {
			$(this.domNode).attr("disabled","true");
		},
		
		enable: function() {
			$(this.domNode).removeAttr("disabled");
		},

		setController: function(controller) {
			this.controller = controller;
		},
		
		isVisible: function() {
			return true;
		},
		
		onVisibility: function(callback) {
			callback();
		},
		
		boot: function() {
			$(Bxs.eventsPublisher).trigger("boxBooted."+this.attrs.id,[this]);
			// need to pass [this] so can get view when creating box on the fly, e.g. for adding new item in menulist
		},
		
		activate: function() {
			var self = this;

			if ((self.attrs.observing === undefined || self.getObservedBox().view.getSelectedId() !== null) 
				&& self.attrs.suppressContentLoading === undefined) {
				self.requestData();
			}
			else {
				var state = (self.attrs.observing !== undefined) ? "inactive" : "ready";
				self.setState(state);
			}
		},
		
	}
);
