/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

if (Bxs.Mixin === undefined) {
	Bxs.Mixin = {};
}

Bxs.Mixin.Stateable = {
		
	getState: function() {
		return this.state;
	},
	
	getPreviousState: function() {
		var state = this.stack[this.stack.length - 2] || null;
		return state;
	},

	setState: function(state) {
		
		if (this.stack === undefined) {
			this.stack = [];
		}
		
		this.state = state;
		
		if (this.stack.length > 2) {
			this.stack.shift();
		}
		this.stack.push(state);
		
		if (this.forwards !== undefined) {
			this.forwards.forEach(function(target) {
				target.setState(state);
			});
		}
		
		if (this.states[state] === undefined) return;

		return this.states[state].apply(this);
	},
	
	forwardState: function(target) {
		
		var self = this;
				
		if (this.forwards === undefined) {
			this.forwards = [];
		}
		if (target instanceof Array) {
			target.forEach(function(t) {
				self.forwards.push(t);
			});
		}
		else {
			self.forwards.push(target);
		}
	},

	states: {

	}

};
