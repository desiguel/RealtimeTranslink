/*
view.js - View of MVC pattern, manages all DOM manipulation and UI/UX.

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
	var map = null;
	var activeLayer = null;
	var currentStops = [];

	// Get templates with require.js (Bit hacky but does the job)
	var tmplCurrentRoutes = _.template(require("./res/current-routes"));
	var tmplAllRoutes = _.template(require("./res/all-routes"));

	var showAddRouteDialog = function() {
		$('#dialog-box').css("visibility", "visible");
	}

	var hideAddRouteDialog = function() {
		$('#dialog-box').css("visibility", "hidden");
	}

    return {

    	showLoadingDialog: function() {
    		$('#dialog-box2').css("visibility", "visible");
    	},

    	hideLoadingDialog: function() {
    		$('#dialog-box2').css("visibility", "hidden");
    	},

    	renderTable: function(routes, activeRoute, activeRouteCallback, removeRouteCallback) {
			$('#route-table').html(tmplCurrentRoutes({routes:routes, activeRoute: activeRoute}));
			
			// This way of setting up callbacks isn't terribly efficient but will do for a 
			// small number of entries in the table < 20 with no troubles

			// Setup callback for switching active route
			$("#route-table tr").each(function() {
				$(this).click(function( event ) {
					activeRouteCallback($(event.target).html());
				});
			});

			// Setup callback for removing a route
			$("#route-table button").each(function() {
				$(this).click(function( event ) {
					removeRouteCallback($(event.target).parent().parent().find(">:first-child").html());
				});
			});

			$('#new-route-button').click(function() {
				showAddRouteDialog();
			});
		},

		renderDialogTable: function(routes, addRouteCallback) {
			$('#dialog-box-table').html(tmplAllRoutes({routes:routes}));

			$('#dialog-box-escape-button').click(function() {
				hideAddRouteDialog();
			});
			
			// Setup callback for adding a route
			$("#dialog-box-table tr").each(function() {
				$(this).click(function( event ) {
					addRouteCallback($(event.target).parent().find(">:first-child").html());
					hideAddRouteDialog();
				});
			});
		},

		renderActiveRoute: function(route) {
			activeLayer = new google.maps.FusionTablesLayer({
				query: {
					select: '\'name\'',
					from: '15ZTaO3_Ue2jsKyqTlwQJ5eku7e3v_cZKxZwqbZMP',
					where: 'name LIKE \'' + route +'0%\''
				},
				styles: [{
					polylineOptions: {
						strokeColor: "#2C64DE",
						strokeOpacity: 1,
						strokeWidth: 0.2
					}
				}],
				clickable: false
			});
			
			activeLayer.setMap(map);
		},

		eraseActiveRoute: function() {
			if (activeLayer) {
				activeLayer.setMap(null);
			}
		},

		renderStop: function(stop) {
			var loc = stop.geometry.coordinates;
			var marker = new google.maps.Marker({
				map: map,
				position: new google.maps.LatLng(loc[1],loc[0])
			});

			currentStops.push(marker);
		},

		eraseStops: function() {
			_.each(currentStops, function (stop) {
				stop.setMap(null);
			});
			currentStops = [];
		},

		initialize: function () {
			var brisbane = new google.maps.LatLng(-27.470, 153.023);
			var mapOptions = {
				zoom: 13,
				center: brisbane
			}

			map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		}
    };
});