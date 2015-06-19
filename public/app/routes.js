define(function (require) {

	// JSON object with route_id : route_description
	var routeLookup = require("./res/routelookup");

	// Currently saved routes
	var currentRoutes = [];

	// The route being viewed currently
	var activeRoute = "";

	var stopData = "";

	var searchData = null;

	var kmlURL = 'http://http://realtime-transrt.rhcloud.com/SEQ.kml'


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
			$.ajax("http://pipes.yahoo.com/pipes/pipe.run?_id=10a81555228e77349570df1cc6823ed2&_render=json&urlinput1=" + kmlURL).done(function (data) {
				console.log('here')
				searchData=data.value.items[0].Document.Placemark
			})
		}

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