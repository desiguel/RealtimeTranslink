define(function (require) {

	var map = null;
	var activeLayer = null;
	var currentStops = [];
	
	var tmplCurrentRoutes = null;
	var tmplAllRoutes = null;

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

			// maybe color code inbound/outbound

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

			// Download the templates for dynamic table generation
			$.ajax({
				url: 'http://realtime-transrt.rhcloud.com/all-routes.html',
				success: function(data) {
					tmplAllRoutes = _.template(data);
				}
    		});
    		$.ajax({
				url: 'http://realtime-transrt.rhcloud.com/current-routes.html',
				success: function(data) {
					tmplCurrentRoutes = _.template(data);
				}
    		});
			
		}
    };
});