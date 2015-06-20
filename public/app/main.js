define(function (require) {
	var routes = require("./routes");
	var view = require("./view");

	var timer = null;

	// Plot the new positions of the vehicles on the active route
	var newPositionCallback = function(newPositions) {
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
			console.log("go away timer");
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
		timer = window.setInterval(updatePositions, 10000, newroute);
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
		console.log(newRoute);
		routes.getRealTimeData(newroute, newPositionCallback);
	}
});