var map;
const markers = {}

// Create the map
const createMap = async () => {
  map = L.map('map').setView([60.186776, 24.822108], 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
}

//Gets  data from the restaurants and pass them to the restaurantMarker (saves the markers in  markers object)
const getRestaurantsLatLon = async (restaurants) => {
  for (let rest of restaurants) {
    const lat = rest.location.coordinates[1];
    const lon = rest.location.coordinates[0];
    const name = rest.name;
    const address = rest.address
    const marker = restaurantMarker(lat, lon, name, address, map);
    markers[rest._id] = marker;
  }
}

//Adds the marker to the map
const restaurantMarker = (lat, lon, name, address, map) => {
  const marker = L.marker([lat, lon]).addTo(map);
  marker.bindPopup(`<h3>${name}</h3>
<p>${address}</p>`).openPopup();
  return marker
}

//Zooming effect and opens up the marker that  gets zoomed  on
const zoomRestaurant = (rest) => {
  map.flyTo([rest.location.coordinates[1], rest.location.coordinates[0]], 15,
    {animate: true, duration: 1.5, easeLinearity: 0.25});

  const marker = markers[rest._id];
  if (marker) {
    marker.openPopup();
  }
}

//marker for the user
const userMarker = (user) => {
  const marker = L.marker([user.coords.latitude, user.coords.longitude,]).addTo(map);
  marker.bindPopup('cockSucker')

}


export {
  createMap,
  restaurantMarker,
  getRestaurantsLatLon,
  zoomRestaurant,
  userMarker
}
