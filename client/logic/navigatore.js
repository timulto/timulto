var directionsDisplay;
var directionsService;
var currentLocation;
var selectedLocation;
var curmap;


function calcRoute() {
//{
//  origin: LatLng | String,
//  destination: LatLng | String,
//  travelMode: TravelMode,
//  transitOptions: TransitOptions,
//  unitSystem: UnitSystem,
//  durationInTraffic: Boolean,
//  waypoints[]: DirectionsWaypoint,
//  optimizeWaypoints: Boolean,
//  provideRouteAlternatives: Boolean,
//  avoidHighways: Boolean,
//  avoidTolls: Boolean,
//  region: String
//}

   var request = {
        origin: currentLocation,
        destination: selectedLocation,
        travelMode: google.maps.TravelMode.DRIVING
    };
    console.log("starting navigation");
    directionsService.route(request, function (response, status) {
        console.log("some response frome google. Status " + status);

        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });
}

Template.navigatore.helpers({
    navigatorMapOptions: function() {
        if (GoogleMaps.loaded()) {
            var lat = Session.get("selectedLat");
            var lng = Session.get("selectedLng");
            selectedLocation = new google.maps.LatLng(lat, lng);

            return {
                center: selectedLocation,
                zoom: 10
            };
        }
    }
});

Template.navigatore.events({
    "click #manualgeocode": function (event) {
        var coords = Geolocation.latLng();

        console.log("new position " + JSON.stringify(coords));
        currentLocation = new google.maps.LatLng(coords.lat, coords.lng);

        var markerCurrentPos = new google.maps.Marker({
            position: currentLocation,
            map:curmap.instance
        });
    },
    "click #naviga":function(event) {
        calcRoute();
    }
});

Template.navigatore.onCreated(function () {
    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('navigatorMap', function (map) {

        var coords = Geolocation.latLng();

        if (coords) {
            var lat = coords.lat;
            var lng = coords.lng;
            currentLocation = new google.maps.LatLng(lat, lng);

            var markerCurrentPos = new google.maps.Marker({
                position: currentLocation,
                map:map.instance
            });
        }

        var lat = Session.get("selectedLat");
        var lng = Session.get("selectedLng");
        var markerCurrentPos = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map:map.instance,
            icon: 'icon_20X20.png'
        });

        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map.instance);

        curmap = map;
    });
});
