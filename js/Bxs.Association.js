/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Association = {
	
	getName: function(columnName,viewAttrs) {
		
		var name = columnName,
			viewAttrs = viewAttrs || {};
		
		if (/_id$/.test(name)) {
			name = name.slice(0,columnName.search(/_id$/));
		}

		if ("defaults" in viewAttrs) {
			if (name+"_type" in viewAttrs.defaults) {
				name = viewAttrs.defaults[name+"_type"] || name;
			}
		}
		
		return name;
	},
	
	getModelName: function(columnName, viewAttrs) {
		return Bxs.Inflector.pluralize(Bxs.Association.getName(columnName, viewAttrs));
	},
	
	getListUrl: function(modelName, view) {
		var listUrl = "/" + modelName;
		// Get the listed model's schema
		Bxs.Ajax.getSchema(listUrl, function(columnSchema) {
			var parentSchema = view.controller.schema,
				observedSchema = (view.attrs.observing === undefined) ? {} : view.getObservedBox().controller.schema,
				associateKeys = [],
				sharedKey,
				defaultColumn,
				associateId,
				row = null;
			
			// Check each key of the listed model's schema -- if it's an association, keep it for later checking
			$.each(columnSchema, function(key) { if (Bxs.Column.isAssociation(key)) associateKeys.push(key) });
			// If matching keys are found in the list schema and parent schema, use that key to construct the list's url
			if (!!(sharedKey = associateKeys.filter(function(el) el in parentSchema)[0])) {
				row = view.getSelectedRow();
			}
			else if (!!(sharedKey = associateKeys.filter(function(el) el in observedSchema)[0])) {
				row = view.getObservedBox().view.getSelectedRow();
			}
			if (row !== null) {
				associateId = $(row).find("[name='"+sharedKey+"']").attr("value");
				var keyModelName = Bxs.Inflector.pluralize(Bxs.Association.getName(sharedKey));
				listUrl = "/" + keyModelName + "/" + associateId + "/" + modelName;
			}
			$(Bxs.eventsPublisher).trigger("gotListUrl." + modelName + '-' + view.attrs.id, 
				[{ url: listUrl, key: sharedKey, id: associateId }]);
		});
	}
	
};