define(function (require) {

	// JSON object with route_id : route_description
	var routeLookup = require("./res/routelookup");
	// For Parsing KML file
	var tj = require('./libs/togeojson');

	// Currently saved routes
	var currentRoutes = [];

	// The route being viewed currently
	var activeRoute = "";

	var stopData = "";

	var searchData = null;

	var kmlURL = 'http://realtime-transrt.rhcloud.com/SEQ.kml'

	function createMarkerKML(place) {
	    var loc=place.Point.coordinates.split(",")
	    var marker = new google.maps.Marker({
	        map: map,
	        position: new google.maps.LatLng(loc[1],loc[0])
	    });
	    google.maps.event.addListener(marker, 'click', function () {
	        infowindow.setContent(place.name);
	        infowindow.open(map, marker);
	    })
	};

	function searchKML(request,callback) {
	    var ret=[]
	    if(!searchData) return
	    for(var i=0;i<searchData.length;i++){
	        //insert distance search
	        if( searchData[i].description.indexOf(request.keyword)!=-1 ||   //currently case sensitive
	            searchData[i].name.indexOf(request.keyword)!=-1 ){
	            ret.push(searchData[i]);
	        }
	    }
	    callback(ret)
	};


	return {
		initialize: function() {
			$.ajax(kmlURL).done(function(xml) {
				console.log(tj.kml(xml));
			});
		},

		add: function(route) {
			if (!!!(_.contains(currentRoutes, route))) {
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

		getRealTimeData: function(newPositionCallback, route_id) {
			$.ajax({
				url: 'http://localhost:8080/route/' + route_id,
				success: function(data) {
					newPositionCallback(data);
      			} 
    		});
		}
    };
});