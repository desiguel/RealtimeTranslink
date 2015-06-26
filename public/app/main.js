/*
main.js - Controller of MVC pattern, glues together routes (model) and view.

The MIT License (MIT)

Copyright (c) 2015 Julian Fell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

define(function (require) {
	var routes = require("./routes");
	var view = require("./view");

	var timer = null;

	// Plot the new positions of the vehicles on the active route
	var newPositionCallback = function(newPositions, route) {

		// Ignore old route data
		if (route !== routes.getActive()) return;

		view.hideLoadingDialog();
		view.eraseStops();
		
		var activeStops = [];
		_.each(newPositions, function(pos) {

			// Ugly regex to strip stop number out of string. Needs to be replaced
			var stopId = pos.replace(/(^\d+)(.+$)/i,'$1').replace(/^[0]+/g,"");

			if (!!!(_.contains(activeStops, stopId))) {
				routes.getStop(stopId, view.renderStop);
				activeStops.push(stopId);
			}
		})
	}

	// Change the route being shown on the map
	var activeRouteCallback = function(newRoute) {
		if (timer) {
			window.clearInterval(timer);
		}

		routes.getRealTimeData(newRoute, newPositionCallback);

		// Remove the current route
		view.eraseActiveRoute();
		view.eraseStops();
		view.showLoadingDialog();
		
		// Render the new route
		routes.setActive(newRoute);
		view.renderActiveRoute(routes.getActive());
		view.renderTable(routes.get(), routes.getActive(), activeRouteCallback, removeRouteCallback);

		// Continuously update bus positions
		timer = window.setInterval(updatePositions, 10000, newRoute);
	}

	// Remove a route from the list on the right
	var removeRouteCallback = function(oldRoute) {
		view.eraseActiveRoute();
		routes.drop(oldRoute);
		view.renderActiveRoute(routes.getActive());
		view.renderTable(routes.get(), routes.getActive(), activeRouteCallback, removeRouteCallback);
	}

	// Add a route to the list on the right
	var addRouteCallback = function(route) {
		view.eraseActiveRoute();
		routes.add(route);
		view.renderTable(routes.get(), routes.getActive(), activeRouteCallback, removeRouteCallback);
	}

	// Need to init the map better
	//google.maps.event.addDomListener(window, 'load', initialize);
	view.initialize();
	view.renderDialogTable(routes.getAllRoutes(), addRouteCallback);

	// Example routes for testing
	routes.add('209');
	routes.add('210');
	routes.add('120');
	routes.add('302');
	routes.add('222');

	view.renderTable(routes.get(), routes.getActive(), activeRouteCallback, removeRouteCallback);

	// Update bus positions every 10s
	var updatePositions = function(newRoute) {
		routes.getRealTimeData(newRoute, newPositionCallback);
	}
});