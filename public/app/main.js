define(function (require) {
    var routes = require("./routes");
    var view = require("./view");

    var kmlLoadedCallback = function() {
    	routes.getStops('209', stopsCallback);
    }

    var stopsCallback = function(stops) {
    	console.log(stops);
	    _.each(stops, function(stop) {
			view.renderStop(stop);
		})
	}
    
    var addRouteCallback = function(route) {
    	view.eraseActiveRoute();
    	routes.add(route);
    	renderAll();
	}

    var activeRouteCallback = function(newRoute) {
    	//view.eraseStops();
    	view.eraseActiveRoute();
		routes.setActive(newRoute);
		routes.getRealTimeData(newPositionCallback, newRoute);
		renderAll();
	}

	var removeRouteCallback = function(oldRoute) {
    	view.eraseActiveRoute();
		routes.drop(oldRoute);
		renderAll();
	}

	var newPositionCallback = function(newPositions) {
		_.each(newPositions, function(pos) {
			//view.eraseStops();
			console.log(pos.replace(/(^\d+)(.+$)/i,'$1').replace(/^[0]+/g,""));
			//view.renderStop(pos.replace(/(^\d+)(.+$)/i,'$1').replace(/^[0]+/g,""));
		})
	}

	function renderAll() {
		view.renderActiveRoute(routes.getActive());
		view.renderTable(routes.get(), routes.getActive(), activeRouteCallback, removeRouteCallback);
	}

	// Example routes for testing
	routes.add('209');
	routes.add('210');
	routes.add('120');
	routes.add('302');
	routes.add('222');
	//view.renderStop('6291');

	// Need to init the map better
	//google.maps.event.addDomListener(window, 'load', initialize);
	view.initialize();
	renderAll();
	view.renderDialogTable(routes.getAllRoutes(), addRouteCallback);
	routes.initialize(kmlLoadedCallback);
});