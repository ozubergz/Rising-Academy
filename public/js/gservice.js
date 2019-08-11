var academy;
var map;

function initMap() {
  
  academy = new google.maps.LatLng(40.782360, -73.842085);

  // The map, centered at point
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 17,
    center: academy,
    mapTypeControl: false,
    streetViewControl: false,
    scrollwheel: true,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.LARGE,
      position: google.maps.ControlPosition.RIGHT_CENTER
    }
  });

  const infowindow = new google.maps.InfoWindow({
    content: `<div id="info-window">
                <h5>Rising Academy</h5>
                <p>18-25 126th St, College Point, NY 11356</p>
              </div>`
  });

  const marker = new google.maps.Marker({
    position: academy,
    map: map,
    draggable: false,
    label: {text: "B", color: "white", fontSize: "16px"},
    animation: google.maps.Animation.DROP
  });

  marker.addListener('click', function() {
    infowindow.open(map, marker)
  });

  AutocompleteDirectionsHandler();
}

function AutocompleteDirectionsHandler() {
  const originInput = document.getElementById('origin-input');
  const originAutocomplete = new google.maps.places.Autocomplete(originInput, {
    types: ['address'],
    componentRestrictions: {country: 'us'}
  });
  
  originAutocomplete.setFields(['place_id']);

  originAutocomplete.bindTo('bounds', map);
  
  originAutocomplete.addListener('place_changed', function() {
    const originPlaceId = originAutocomplete.getPlace();
    calculateRoute(originPlaceId)
  });
}

function calculateRoute(place) {
  const directionsService = new google.maps.DirectionsService();
  const directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
  directionsDisplay.setMap(map);
  const originPlaceId  = place.place_id;

  const request = {
    origin: { "placeId": originPlaceId },
    destination: academy,
    travelMode: google.maps.TravelMode['DRIVING']
  };
  
  directionsService.route(request, function(response, status) {
    if(status === 'OK') {
      const route = response.routes[0];
      const location = route.legs[0].start_location;
      const address = route.legs[0].start_address;
      addMarker(location, address);
      directionsDisplay.setDirections(response);
      
    } else {
      alert('Directions request failed due to ' + status);
    }
  });
}

function addMarker(pos, address) {
  const infowindow = new google.maps.InfoWindow({
    content: `<div id="info-window">
                <p>${address}</p>
              </div>`
  });

  const marker = new google.maps.Marker({
    position: pos,
    map: map,
    label: {text: "A", color: "white", fontSize: "16px"},
    visible: true,
  });

  marker.addListener('click', function () {
    infowindow.open(map, marker)
  });
}


