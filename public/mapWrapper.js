var MapWrapper = function(container, center, zoomLevel){
    this.googleMap = new google.maps.Map(container, {
        center: center,
        zoom: zoomLevel
    });
    this.markers = [];
};

MapWrapper.prototype.addMarker = function(coords, map){
    var marker = new google.maps.Marker({
        position: coords,
        map: this.googleMap
    });

    marker.addListener('click', this.handleMarkerClick);
    this.markers.push(marker);
}

MapWrapper.prototype.addClickEvent = function(){
    google.maps.event.addListener(this.googleMap, 'click', function(event){
        console.log(event.latLng.lng());
        console.log(event.latLng.lat());

        var coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };

        this.addMarker(coords, this.googleMap);
    }.bind(this));
};

MapWrapper.prototype.handleMarkerClick = function(){
}