var express = require('express');
var request = require('request');
var async = require('async');
var path = require('path');

var tj = require('togeojson');
var fs = require('fs');
var jsdom = require('jsdom').jsdom;

var GtfsRealtimeBindings = require('gtfs-realtime-bindings');

var requestSettings = {
  method: 'GET',
  url: 'https://gtfsrt.api.translink.com.au/Feed/SEQ',
  encoding: null
};

function serveRoute(req, res) {
	async.waterfall([
		function(callback) {
			var content = [];
			request(requestSettings, function parseGtfs(error, response, body) {
				if (!error && response.statusCode == 200) {
					var feed = GtfsRealtimeBindings.FeedMessage.decode(body);

					async.each(feed.entity, function(entity) {
						if (entity.trip_update) {
							if (entity.trip_update.trip.route_id.indexOf(req.params.name) === 0 && entity.trip_update.stop_time_update[0].departure) {
								content.push(entity.trip_update.stop_time_update[0].stop_id + " : " + entity.trip_update.stop_time_update[0].departure.delay);
							}
						}
					});
			  	}
			  	callback(null, content);
			});
		},
		function(content) {
			res.send(content);
		}
    ]);
}

function serveStop(req, res) {
	if (!json) {
		res.send("[]");
		return;
	}
	res.send(json.features.filter(function(feature) {
		if (feature.properties.hasOwnProperty("description")) {
			return (feature.properties.description.indexOf("Stop id: " + req.params.name) >= 0);
		} else {
			return false;
		}
	}));
}

var json = null;

// Minimal express app for serving HTML and providing REST API
var app = express();
app.get('/route/:name', serveRoute);
app.get('/stop/:name', serveStop);
app.get('/', function(req,res) {
	res.sendFile(path.join(__dirname, '/public', 'index.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(server_port, server_ip_address, function(){
  console.log("Listening on " + server_ip_address + ", server_port " + server_port)
});

// Parse the KML file and save as a JSON object
//var kml = jsdom(fs.readFileSync('public/SEQ.kml', 'utf8'));
//json = tj.kml(kml);
