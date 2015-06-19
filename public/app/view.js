define(function (require) {

	var map;
	var activeLayer;
	var inactiveLayer;
	var stopLayer;

	var currentStops = [];

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
		$('#dialog-box').css("visibility", "visible");
	}

	var hideDialog = function() {
		$('#dialog-box').css("visibility", "hidden");
	}

    return {
    	renderTable: function(routes, activeRoute, activeRouteCallback, removeRouteCallback) {
			$('#route-table').html(tmplCurrentRoutes({routes:routes, activeRoute: activeRoute}));
			
			// This way of setting up callbacks isn't terribly efficient but will do for a 
			// small number of entries in the table < 10 with no troubles

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
				showDialog();
			});
		},

		renderDialogTable: function(routes, addRouteCallback) {
			$('#dialog-box-table').html(tmplAllRoutes({routes:routes}));

			$('#dialog-box-escape-button').click(function() {
				hideDialog();
			});
			
			// Setup callback for adding a route
			$("#dialog-box-table tr").each(function() {
				$(this).click(function( event ) {
					addRouteCallback($(event.target).parent().find(">:first-child").html());
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

		renderStop: function(stop) {
			console.log(stop)
			var loc = stop.geometry.coordinates;
			var marker = new google.maps.Marker({
				map: map,
				position: new google.maps.LatLng(loc[1],loc[0])
			});

			currentStops.push(marker);
			console.log(marker);
		},

		eraseStops: function() {
			stopLayer.setMap(null);
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