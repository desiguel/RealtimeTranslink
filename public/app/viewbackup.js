define(function (require) {

	var $ = require("jquery");

	var map;
	var activeLayer;
	var inactiveLayer;
	var tmplCurrentRoutes = _.template("<tbody>\
	<% _.each(routes, function(route){ \
		var cssClass = 'inactive-route-row';\
		if (route === activeRoute) {\
			cssClass = 'active-route-row';\
		}\
		 %>\
		<tr class='<%= cssClass %>'>\
		<td><%= route %></td><td> <button>&times</button> </td>\
		</tr>\
	<% }); %>\
</tbody>");

	var tmplAllRoutes = _.template("<tbody>\
	<% _.each(_.keys(routes), function(route){ %>\
	<tr><td><%= route %></td><td><%= routes[route] %></td></tr>\
	<% }); %>\
	</tbody>");

	var showDialog = function() {
		document.getElementById('dialog-box').style.visibility = "visible";
	}

	var hideDialog = function() {
		document.getElementById('dialog-box').style.visibility = "hidden";
	}

    return {
    	renderTable: function(routes, activeRoute, activeRouteCallback, removeRouteCallback) {
			var table = document.getElementById('route-table');
			table.innerHTML = tmplCurrentRoutes({routes:routes, activeRoute: activeRoute});
			
			// This way of setting up callbacks isn't terribly efficient but will do for a 
			// small number of entries in the table < 10 with no troubles

			// Setup callback for switching active route
			_.each(table.querySelectorAll('tr'), function(row) {
				row.addEventListener("click", function( event ) {
					activeRouteCallback(event.target.innerHTML);
				});
			});

			// Setup callback for removing a route
			_.each(table.querySelectorAll('button'), function(row) {
				row.addEventListener("click", function( event ) {
					removeRouteCallback(event.target.parentNode.parentNode.querySelector('td').innerHTML);
				});
			});

			document.getElementById('new-route-button').addEventListener("click", function() {
				showDialog();
			});
		},

		renderDialogTable: function(routes, addRouteCallback) {
			var table = document.getElementById('dialog-box-table');
			table.innerHTML = tmplAllRoutes({routes:routes});

			// Setup callback for adding a route
			_.each(table.querySelectorAll('tr'), function(row) {
				row.addEventListener("click", function( event ) {
					addRouteCallback(event.target.parentNode.querySelector("td").innerHTML);
				});
			});

			document.getElementById('dialog-box-escape-button').addEventListener("click", function() {
				hideDialog();
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
			activeLayer.setMap(null);
		},

		// Unusable at the moment
		renderInactiveRoutes: function(routes) {

			// Seems like it might not be possible to do the right
			// query here as Google Fusion tables don't allow 'OR'
			// in their queries
			var whereQuery = routes.reduce(function(string, route) {
				return string.concat('(name LIKE \'' + route +'0%\') OR ');
			}, '');
			whereQuery = whereQuery.substring(0, whereQuery.length - 3);

			inactiveLayer = new google.maps.FusionTablesLayer({
				query: {
					select: '\'name\'',
					from: '15ZTaO3_Ue2jsKyqTlwQJ5eku7e3v_cZKxZwqbZMP',
					where: whereQuery
				},
				clickable: false
			});
			
			inactiveLayer.setMap(map);
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