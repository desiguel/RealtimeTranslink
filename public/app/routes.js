define(function (require) {

	// JSON object with route_id : route_description
	var routeLookup = require("./res/routelookup");

	// Currently saved routes
	var currentRoutes = [];

	// The route being viewed currently
	var activeRoute = "";

	var stopData = "";

    return {
		add: function(route) {
			if (!!!(_.contains(currentRoutes, route))) {
				currentRoutes.push(route);
			}
		},

		get: function() {
			return currentRoutes;
		},

		drop: function(route) {
			if (activeRoute === route) {
				activeRoute = "";
			}

			currentRoutes = currentRoutes.filter(function (x) {
				return x !== route;
			})
		},

		setActive: function(route) {
			activeRoute = route;
		},

		getActive: function() {
			return activeRoute;
		},

		getAllRoutes: function() {
			return routeLookup;
		},

		getRealTimeData: function(newPositionCallback, route_id) {
			$.ajax({
				url: 'http://localhost:8080/route/' + route_id,
				success: function(data) {
					newPositionCallback(data);
      			} 
    		});
		}
    };
});