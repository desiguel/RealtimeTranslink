/*
routes.js - Model of MVC pattern, keeps track of user selected routes,
            has a list of ALL the possible routes and queries the REST
            API on the server for realtime data.

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
			if (!!!(_.contains(currentRoutes, route)) && currentRoutes.length < 11) {
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