define(function (require) {
    var routes = require("./routes");
    var view = require("./view");

    // Plot the new positions of the vehicles on the active route
    var newPositionCallback = function(newPositions) {
		view.hideLoadingDialog();
		view.eraseStops();

		var activeStops = [];
		_.each(newPositions, function(pos) {
			var stopId = pos.replace(/(^\d+)(.+$)/i,'$1').replace(/^[0]+/g,"");

			if (!!!(_.contains(activeStops, stopId))) {
				routes.getStop(stopId, view.renderStop);
				activeStops.push(stopId);
			}
		})
	}

	// Change the route being shown on the map
    var activeRouteCallback = function(newRoute) {
    	routes.getRealTimeData(newRoute, newPositionCallback);

    	// Remove the current route
    	view.eraseActiveRoute();
    	view.eraseStops();
    	view.showLoadingDialog();

    	// Render the new route
		routes.setActive(newRoute);
		view.renderActiveRoute(routes.getActive());
		view.renderTable(routes.get(), routes.getActive(), activeRouteCallback, removeRouteCallback);
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

	// Example routes for testing
	routes.add('209');
	routes.add('210');
	routes.add('120');
	routes.add('302');
	routes.add('222');

	// Need to init the map better
	//google.maps.event.addDomListener(window, 'load', initialize);
	view.initialize();
	view.renderDialogTable(routes.getAllRoutes(), addRouteCallback);
	view.renderTable(routes.get(), routes.getActive(), activeRouteCallback, removeRouteCallback);

	// Update bus positions every 10s
	var updatePositions = function() {
    	routes.getRealTimeData(routes.getActive(), newPositionCallback);
    }
	window.setInterval(updatePositions, 10000);
});