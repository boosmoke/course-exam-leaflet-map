/**
 * App for navigating a food market
 * Author: BooSmoke
 *
 * @requires jQuery
 * @version 0.0.1
 */
var MapApp = ( function() {
    // Properties
    var mymap = L.map('map').setView([37.4334, -122.1709], 13);
    var userCoords;
    var geoDataLocations=[];
    // Methods

    //intialize the map
    function startMap(){
        mymap.locate({setView: true, maxZoom: 13});
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'your.mapbox.access.token'
        }).addTo(mymap);
    }

    //populate map with icons, pass true or false for location depending on if user data available
    function populateMap(location){
        //get all items from geojson and set them as "marker"
        geoDataLocations.forEach(function(marker){
            var userDistance;
            //calculate user distance
            if(location){
                userDistance = getDistance(userCoords, L.polygon(marker.geometry.coordinates).getBounds().getCenter());
            }else{
                userDistance = "Not available"
            }
            //take each marker coordinates and add them to map
            L.polygon(marker.geometry.coordinates).addTo(mymap)
            //chain bindpopup to add properties
            .bindPopup("<h3>"+marker.properties.name+"</h3><p style='margin:10px 0'>"+marker.properties.slogan+"</p><img src='../logotypes/"+marker.properties.logo+"' alt='bears'><p class='user-distance'>Distance: "+userDistance+"</p>"); 
        })
    }

    //if user wont give location
    function userDenyLocation(e) {     
        alert(e.message);
        populateMap(false);
    } 

    //if user accepts to share location create custom icon and place on map
    function userAllowLocation(e) {
        var userLocationIcon = L.icon({     
            iconUrl: '../img/userPosition.png', 
            iconSize:  [64, 64],
            iconAnchor:   [64, 64], // point of the icon which will correspond to marker's location
          });
        userCoords = [e.latitude, e.longitude];
        var userLocation = L.marker(e.latlng, {icon: userLocationIcon}).addTo(mymap);
        populateMap(true);
    }
    //calculate distance between two latlng
    function getDistance(userLatLong, markerLatLong ){
        var distance = L.latLng(userLatLong).distanceTo(markerLatLong).toFixed() +" meters";
        return distance;
    }
    //fetch data from external file, this is not neccessary but more flexible and cleaner
    function fetchGeoData(){
        $.ajax({
            dataType: "json",
            url: "data/map.geojson",
            success: function(data) {
                $(data.features).each(function(key, data) {
                    geoDataLocations.push(data);
                });
                startMap();
            },
            error: function(error){
                console.log(error);
                return error;
            }
        });
    }

    function init() {
        // Application init code
        //start map
        fetchGeoData();
        //bind location sharing
        mymap.on('locationerror', userDenyLocation);
        mymap.on('locationfound', userAllowLocation);
    }

    return {
        init : init
    };
  
} )();

MapApp.init(); // Run application