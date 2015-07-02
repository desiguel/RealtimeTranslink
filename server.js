/*
server.js - Server for providing REST API and normal web server

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

/*  ================================================================  */
/*  3rd party libraries.                                              */
/*  ================================================================  */

var express = require('express');
var request = require('request');
var async = require('async');
var path = require('path');
var gtfs = require('gtfs-realtime-bindings');

/*  ================================================================  */
/*  Global variables.                                                 */
/*  ================================================================  */

// JS object with all stops
var stops = require('./public/app/res/stoplookup.js');

// Query for realtime GTFS data API
var requestSettings = {
  method: 'GET',
  url: 'https://gtfsrt.api.translink.com.au/Feed/SEQ',
  encoding: null
};

/**
 *  Define the application.
 */
var RealtimeBusApp = function() {

	//  Scope.
	var self = this;

	/*  ================================================================  */
	/*  Helper functions.                                                 */
	/*  ================================================================  */

	/**
	 *  Set up server IP address and port # using env variables/defaults.
	 */
	self.setupVariables = function() {
		//  Set the environment variables we need.
		self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
		self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

		if (typeof self.ipaddress === "undefined") {
			//  Log errors on OpenShift but continue w/ 127.0.0.1 - this
			//  allows us to run/test the app locally.
			console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
			self.ipaddress = "127.0.0.1";
		};
	};

	/*  ================================================================  */
	/*  App server functions.                 							  */
	/*  ================================================================  */

	/**
	 *  Serve the GTFS-realtime trip updates for all busses on the 
	 *  requested route. 
	 *
	 *  (This is quite ugly and probably not the best way to do this, should 
	 *	rewrite/refactor at some point)
	 */
	function serveRoute(req, res) {

		var requestedRoute = req.params.name;

		// Use waterfall to wait for request to complete before sending the list to 
		// the client
		async.waterfall([
			function(callback) {
				var trips = [];

				// Query the translink API for realtime info
				request(requestSettings, function parseGtfs(error, response, body) {
					if (!error && response.statusCode == 200) {
						var feed = gtfs.FeedMessage.decode(body);

						async.each(feed.entity, function(entity) {
							if (entity.trip_update) {
								if (entity.trip_update.trip.route_id.indexOf(requestedRoute) 
											=== 0 && entity.trip_update.stop_time_update[0].departure) {
									trips.push(entity.trip_update.stop_time_update[0].stop_id 
											+ " : " + entity.trip_update.stop_time_update[0].departure.delay);
								}
							}
						});
					}

					// Pass the trip updates to callback for serving to client
					callback(null, trips);
				});
			},
			function(trips) {
				res.send(trips);
			}
		]);
	}

	/**
	 *  Serve the location of the requested stop.
	 */
	function serveStop(req, res) {
		res.send(stops().filter(function(feature) {
			if (feature.properties.hasOwnProperty("description")) {
				return (feature.properties.description.indexOf("Stop id: " 
							+ req.params.name) >= 0);
			} else {
				return false;
			}
		}));
	}

	/**
	 *  Initialize the server (express) and create the routes and register
	 *  the handlers.
	 */
	self.initialize = function() {
		self.setupVariables();
		self.app = express();

		// APIs for realtime info
		self.app.get('/route/:name', serveRoute);
		self.app.get('/stop/:name', serveStop);

		// Serve html, css and js
		self.app.get('/', function(req, res) {
			res.sendFile(path.join(__dirname, '/public', 'index.html'));
		});
		self.app.use(express.static(path.join(__dirname, 'public')));
	};


	/**
	 *  Start the server (starts up the sample application).
	 */
	self.start = function() {
		//  Start the app on the specific interface (and port).
		self.app.listen(self.port, self.ipaddress, function() {
			console.log('%s: Node server started on %s:%d ...',
						Date(Date.now() ), self.ipaddress, self.port);
		});
	};

};   

/**
 *  main():  Main code.
 */
var zapp = new RealtimeBusApp();
zapp.initialize();
zapp.start();
