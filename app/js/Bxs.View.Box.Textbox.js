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

Bxs.View.Box.Textbox = function(node) {
	
	Bxs.View.Box.Abstract.apply(this,arguments);
};

Bxs.View.Box.Textbox.prototype = $.extend(true,{},
	
	Bxs.View.Box.Abstract.prototype,
	
	{	
		clearContent: function() {
			if (this.textNode !== undefined) {
				this.textNode.innerHTML = "";
			}
		},
		
		buildContent: function(data) {
			this.textNode.innerHTML = data.text;
			this.setState("ready");
		},
	
		editOpen: function() {
			this.storedValue = this.textNode.innerHTML;
			$(this.domNode).addClass("editing");
			this.activateEditor();
		},
		
		getEditedData: function() {
			return { text: this.textNode.innerHTML };
		},
				
		updateEditView: function(data) {
			this.textNode.innerHTML = data.text;
		},

		editClose: function(options) {
			
			var options = options || { state: "default" };
			
			switch (options.state) {
				
				case "cancel":
				this.textNode.innerHTML = this.storedValue;
				this.deactivateEditor();
				break;
				
				case "complete":
				this.updateContent();
				this.deactivateEditor();
				break;
			}
			
			this.deactivateEditor();
			$(this.domNode).removeClass("editing");
		},
		
		boot: function() {
			
			var parentNode = this.domNode.parentNode,
				container = document.createElement("vbox"),
				i = document.createElementNS("http://www.w3.org/1999/xhtml","iframe"),
				self = this;
				
			i.addEventListener("load", function() {
				
				var cd = i.contentDocument,
					cw = i.contentWindow,
					css = cd.createElement("link");
					
				css.setAttribute("rel","stylesheet");
				css.setAttribute("type","text/css");				
				css.setAttribute("href",Bxs.Conf.css.default);
				cd.getElementsByTagName("head")[0].appendChild(css);
					
				self.activateEditor = function() {
					cd.body.style.overflow = "hidden";
					Bxs.Editor.init(cw);
				}
				self.deactivateEditor = function() {
					Bxs.Editor.deactivate(cw);
					cd.body.style.overflow = "auto";
				}
				self.updateContent = function() {
					self.textNode.innerHTML = Bxs.Editor.getContent(cw);
				}
				
				self.textNode = cd.getElementById("editor");
			},false);
			
			i.setAttribute("src",Bxs.Url.app("/html/editor.html"));
			
			// wrap domNode in vbox
			//TODO Generalise XULElements?
			$(this.domNode).before(container);
			$(this.domNode).remove();
			
			this.domNode = i;
			$(container).append(this.domNode);
			
			$(this.domNode).attr(this.attrs);

			var hbox = document.createElement("hbox");
			hbox.setAttribute("flex",0);
			
			this.editToolbar = new Bxs.Toolbar.Box(this.attrs.id);
			
			hbox.appendChild(this.editToolbar.getDomNode());
			
			$(this.domNode).after(hbox);
						
			this.forwardState(this.editToolbar);
			
			Bxs.View.Box.Abstract.prototype.boot.apply(this);
		},
		
		activate: function() {
			
			Bxs.View.Box.Abstract.prototype.activate.apply(this);
		}

	}
);
