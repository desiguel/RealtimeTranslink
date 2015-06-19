define(function (require) {

	// JSON object with route_id : route_description
	var routeLookup = require("./res/routelookup");

	// Currently saved routes
	var currentRoutes = [];

	// The route being viewed currently
	var activeRoute = "";

	var stopData = "";

	var searchData = null;

	var kmlURL = 'http://realtime-transrt.rhcloud.com/SEQ.kml'

	return {
		initialize: function(completedCallback, stopsCallback) {
			$.ajax(kmlURL).done(function(xml) {
				var searchData = toGeoJSON.kml(xml).features;

				console.log(searchData);


				stopsCallback(_.filter(searchData, function(feature) {
					console.log(feature);
					if (feature.hasOwnProperty("properties")) {
						return feature.properties.description.indexOf("Stop id: 311609") > 0;
					} else {
						return false;
					}
				}));

				completedCallback();
			});
		},

		getStops: function(route, stopsCallback) {
			if(!searchData) return;

			stopsCallback(_.filter(searchData, function(feature) {
				return feature.properties.description.indexOf("Stop id: " + req) > 0;
			}));
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

		getRealTimeData: function(newPositionCallback, route_id) {
			$.ajax({
				url: 'http://realtime-transrt.rhcloud.com/route/' + route_id,
				success: function(data) {
					console.log("get rtd")
					newPositionCallback(data);
      			}
    		});
		}
    };
});