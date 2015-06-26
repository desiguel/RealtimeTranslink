/*
kmltojson.js - Very simple tool for converting KML file into easy to use JSON format.

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