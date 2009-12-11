/*

Copyright (c) 2009 Robert Johnston

This file is part of Boxes.

Boxes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Boxes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Boxes. If not, see http://www.gnu.org/licenses/.

*/

Bxs.Xpath = {
	resolver: document.createNSResolver(document.documentElement),
	
	evaluate: function(cNode,expr,resultType) {
		var xPath = this;
		var xPathResult = document.evaluate(expr,cNode,
		function lookupNamespaceURI(prefix) {
			var nsURI = null;
			switch (prefix) {
				case 'xul':
				nsURI = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
				break;
				default:
				nsURI = xPath.resolver.lookupNamespaceURI(prefix);
				break;
			}
			return nsURI;
		},resultType,null);
		
		return xPathResult;
	},
	
	getArray: function(cNode,expr) {
		var xResult = Bxs.Xpath.evaluate(cNode,expr,XPathResult.ORDERED_NODE_ITERATOR_TYPE),
		 	result = [],
			node;
			
		while (node = xResult.iterateNext()) {
			result.push(node);
		}
		
		return result;
	},
	
	getNode: function(cNode,expr) {
		return Bxs.Xpath.evaluate(cNode,expr,XPathResult.ANY_UNORDERED_NODE_TYPE).singleNodeValue;
	}
};