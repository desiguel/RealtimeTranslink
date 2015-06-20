define(function (require) {

	// JSON object with route_id : route_description
	var routeLookup = require("./res/routelookup");

	// Currently saved routes
	var currentRoutes = [];

	// The route being viewed currently
	var activeRoute = "";

	return {
		initialize: function(completedCallback) {
			completedCallback();
		},

		getStop: function(stop_id, stopCallback) {
			$.ajax({
				url: 'http://realtime-transrt.rhcloud.com/stop/' + stop_id,
				success: function(data) {
					stopCallback(data[0]);
      			}
    		});
		},

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

		getRealTimeData: function(route_id, newPositionCallback) {
			$.ajax({
				url: 'http://realtime-transrt.rhcloud.com/route/' + route_id,
				success: function(data) {
					newPositionCallback(data, route_id);
				}
    		});
		}
    };
});