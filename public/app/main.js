define(function (require) {
    var routes = require("./routes");
    var view = require("./view");
    
    // Plot the new positions of the vehicles on the active route
    var newPositionCallback = function(newPositions) {

    	// Hide "finding busses."
		view.hideLoadingDialog();

		_.each(newPositions, function(pos) {
			var stopId = pos.replace(/(^\d+)(.+$)/i,'$1').replace(/^[0]+/g,"");
			routes.getStop(stopId, view.renderStop);
		})
	}

	// Change the route being shown on the map
    var activeRouteCallback = function(newRoute) {
    	// Do this before erase as it takes a while
    	routes.getRealTimeData(newRoute, newPositionCallback);

    	// Remove the current route
    	view.eraseStops();
    	view.eraseActiveRoute();

    	// Display "finding busses."
    	view.showLoadingDialog();

    	// Render the new route
		routes.setActive(newRoute);
		view.renderActiveRoute(routes.getActive());
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
});