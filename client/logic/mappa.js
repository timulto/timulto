
var map;
var cluster;
var markers = {};

var myIcon;

var defaultZoomLevel = 16;
var defaultIconUrl = 'icon_30X30.png';
var defaultIconH = 30;
var defaultIconW = 30;


Template.mappa.events({
    'click a[target=_blank]': function (event) {
        event.preventDefault();
        window.open(event.target.href, '_blank');
    },
    "click #manualgeocode": function(event) {
        event.preventDefault();
//        console.log("clicked manual");
        var result = geoLocalization.getLatLng();
        var lat;
        var lng;

        if(result) {
            lat = result.lat;
            lng = result.lng;
        } else {
            lat = Session.get("lat");
            lng = Session.get("lng");
        }

//        console.log("pan to lat: "+ lat + ",lng: " + lng);

        map.panTo(new L.LatLng(lat, lng));
        map.setZoom(defaultZoomLevel);

        return false;
    },
    "click #clickableMapElement":function(event) {
        event.preventDefault();

        var selectedId = $('input[type=\'hidden\']').attr("id");
        var fine = Fines.findOne({_id:selectedId});

        if(fine) {
            Session.set("_id",fine._id);
            Session.set("createdAt", fine.createdAt);
            Session.set("detailUsername", fine.username);
            Session.set("detailText",fine.text);
            Session.set("detailAddress",fine.address);
            Session.set("detailCategory",fine.category);
            Session.set("detailImageData",fine.imageData);
            Session.set("version",fine.version);
            Session.set("isapproved", (fine.approved==1?true:false));

            Router.go('/dettaglio');
        }
    },
    "click #shoot": function (event) {
        Router.go('/crea');
    }
});

var rendered = false;

function init() {
    if (!rendered){
        // run my code only once
        rendered = true;

        myIcon = L.icon({
            iconUrl: defaultIconUrl,
            iconSize: [defaultIconW, defaultIconH]
        });
    }
    cluster = new L.MarkerClusterGroup();

    Fines.find({ approved:true }).observe({
        added: function(fine) {
            var lat = fine.loc.coordinates[1];
            var lng = fine.loc.coordinates[0];
            var googleMapsUrl = 'http://maps.google.com/maps/?q='+lat+','+lng+'&ll='+lat+','+lng+'&z=17';
            //var mapQuestUrl = 'http://mapq.st/map?q='+lat+','+lng+'&zoom=16&maptype=map';
            var popupContent = Blaze.toHTMLWithData(
                                        Template.popupContent,
                                        {
                                            fine: fine,
                                            googleMapsUrl:googleMapsUrl
                                        });

            var marker = L.marker([lat, lng], {
                _id: fine._id,
                icon: myIcon,
                clickable: true
            });

            marker.bindPopup(popupContent).openPopup();
            markers[marker.options._id] = marker;
            //map.addLayer(marker);
            cluster.addLayer(marker);
        },
//        changed: function(fine) {
//          var marker = markers[fine._id];
//          if (marker) {
//              marker.setIcon(myIcon);
//          }
//        },
        removed: function(fine) {
            var marker = markers[fine._id];

            if (cluster.hasLayer(marker)) {
                cluster.removeLayer(marker);
                delete markers[fine._id];
            }
        }
    });
}

Template.mappa.created = function () {
    depth = 1;
}

Template.mappa.rendered = function () {

    init();

    var now = moment();
//    console.log("resetting last used to " + now.toString());
    Session.set("lastUsed", now.toString());

    $(function () {
        $(window).resize(function () {
            $('.map').css('height', window.innerHeight - 82 - 45);
        });
        $(window).resize(); // trigger resize event
    });

    L.Icon.Default.imagePath = '/images';

    var lat;
    var lng;
    var zoom = Session.get("zoom");

    if(Session.get("selectedLat") && Session.get("selectedLng")) {
        lat = Session.get("selectedLat");
        lng = Session.get("selectedLng");

        Session.set("selectedLat","");
        Session.set("selectedLng","");
        Session.set("zoom","");
    } else {
        lat = Session.get("lat");
        lng = Session.get("lng");
    }

    if(!zoom)
        zoom = defaultZoomLevel;


    if(!lat || !lng || lat==0 || lng==0) {
        geoLocalization.getLatLng();

        if(!Session.get("lat") || !Session.get("lng")) {
            //In extremis
            //Default termini
            lat = 41.901091;
            lng = 12.501991;
        }
    }

    map = L.map('finesMap', {
        doubleClickZoom: true,
        touchZoom: true
    }).setView([lat, lng], zoom);

    L.tileLayer.provider('MapQuestOpen').addTo(map);

    map.addLayer(cluster);
};
