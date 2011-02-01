/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Command = {
	
	_context: null,
	
	setContext: function(target) {
		this._context = target;
	},
	
	_clearContext: function() {
		this._context = null;
	},
	
	_hasContext: function() {
		return this._context !== null;
	},
	
	_getContext: function() {
		var target = this._hasContext() ? $("#"+this._context).get(0) : document.commandDispatcher.focusedElement,
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
		this._clearContext();
		if (this._contexts[context][command] !== undefined) {
			return this._contexts[context][command](target);
		}
		return false;
	},
	
	dispatchToolsCommand: function(command) {
		var context = "box", 
			target = Bxs.Boxes.getById($(document.popupNode).attr("targetId"));
		this._clearContext();
		return this._contexts[context][command](target);
	},
	
	manageToolsMenu: function() {
		
		var target = Bxs.Boxes.getById($(document.popupNode).attr("targetId")),
			commands = $("#boxToolsCommandSet").children(),
			menuitems = $("#boxToolsPopup").children();
			
		var state = target.view.getState();
		
		if (!(["active","ready"]).some(function(el) el === state)) {
			return false;
		}
		
		commands.attr("disabled","true");
		menuitems.addClass("hidden");
		
		var showCommands = function(i) {
			$.each(i, function() {
				$("#"+this+"-menuitem").removeClass("hidden");
			})
		}
		
		var enableCommands = function(c) {
			$.each(c, function() {
				$("#"+this+"-command").removeAttr("disabled");
			})
		}
		
		if (target.view.mediaType !== undefined) {
			showCommands(["viewMedia","downloadMedia"]);
			if (state === "active") {
				enableCommands(["viewMedia","downloadMedia"]);
			}
		}
		
		if ($(target.view.getDomNode()).attr("bxs") === "collection") {
			showCommands([/*"openAsPanel",*/"exportToCsv"]);
			
			if (!target.view.isEmpty()) {
				enableCommands(["exportToCsv"]);
			}
			
			if (state === "active") {
//				enableCommands(["openAsPanel"]);
			}
		}
		
		showCommands([/*"print",*/"refresh"]);

		if ((["active","ready"]).some(function(el) el === state)) {
			enableCommands(["refresh"]);
		}
		
		if (!target.view.isEmpty()) {
//			enableCommands(["print"]);
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
			
			refresh: function(target) {
				return target.controller.refresh();
			},
			
			viewMedia: function(target) {
				return target.controller.viewMedia();
			},
			
			downloadMedia: function(target) {
				return target.controller.downloadMedia();
			},
			
			exportToCsv: function(target) {
				return target.controller.getCsv();
			},
			
			openAsPanel: function(target) {
				alert("openAsPanel");
			},
			
			print: function(target) {
				alert("print");
			}
		}
	}
	
};

