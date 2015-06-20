var tj = require('togeojson');
var fs = require('fs');
var jsdom = require('jsdom').jsdom;

// Parse the KML file and save as a JSON object
var kml = jsdom(fs.readFileSync('public/SEQ.kml', 'utf8'));
var json = tj.kml(kml);

var stopJson = json.features.filter(function(feature) {
	if (feature.properties.hasOwnProperty("description")) {
		return (feature.properties.description.indexOf("Stop id:") >= 0);
	} else {
		return false;
	}
})

console.log(JSON.stringify(stopJson));