var express = require('express');
var request = require('request');
var async = require('async');
var path = require('path');
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

// Minimal express app for serving HTML and providing REST API
var app = express();
app.get('/route/:name', serveRoute);
app.get('/', function(req,res) {
	res.sendFile(path.join(__dirname, '/public', 'index.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

app.listen(8080);
