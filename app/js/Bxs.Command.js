/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Command = {
	
	_getContext: function() {
		
		var target = document.commandDispatcher.focusedElement,
			t = null,
			boxTargets = ["box","collection"];

		if (boxTargets.some(function(el) el === $(target).attr("bxs"))) {
			return ["box",target];
		};
		
		if ((t = $(target).parents("[bxs='box']").get(0)) || (t = $(target).parents("[bxs='collection']").get(0))) {
			return ["box",t];
		}
		
		if ((t = $(target).attr("targetId"))) {
			return ["box",$("#"+t).get(0)];
		}
		
		return ["unknown",null];
		
	},
	
	dispatch: function(command) {

		var [context, target] = this._getContext();

		if (this._contexts[context][command] !== undefined) {
			return this._contexts[context][command](target);
		}
	},
	
	_contexts: {
		
		unknown: {
			
		},
			
		box: {
			edit: function(target) {
		
				if (Bxs.Boxes.getById(target.id) === undefined) {
					return;
				}
		
				Bxs.Boxes.getById(target.id).controller.doCommand("edit");
			},

			confirm: function(target) {
		
				if (Bxs.Boxes.getById(target.id) === undefined) {
					return;
				}
		
				Bxs.Boxes.getById(target.id).controller.doCommand("confirm");
			},

			cancel: function(target) {
		
				if (Bxs.Boxes.getById(target.id) === undefined) {
					return;
				}
		
				Bxs.Boxes.getById(target.id).controller.doCommand("cancel");
			},
	
			newRow: function(target) {
		
				if (Bxs.Boxes.getById(target.id) === undefined) {
					return;
				}
		
				Bxs.Boxes.getById(target.id).controller.doCommand("newRow");
			},
	
			deleteRow: function(target) {
		
				if (Bxs.Boxes.getById(target.id) === undefined) {
					return;
				}
		
				Bxs.Boxes.getById(target.id).controller.doCommand("deleteRow");
			},
			
			tools: function(target) {
				
			}
		}
	}
	
};

