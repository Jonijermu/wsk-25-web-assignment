var marker


const  createMap  = async () => {
  var map = L.map('map').setView([60.186776, 24.822108], 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  return map;
}

const getRestaurantsLatLon = async (restaurants)  =>{
  var map = await createMap(); // Initialize the map once
  for (let rest of restaurants) {
    const lat = rest.location.coordinates[1];
    const lon = rest.location.coordinates[0];
    const name = rest.name;
    const address = rest.address
    restaurantMarker(lat, lon, name, address, map);
  }
}

const restaurantMarker = (lat, lon, name, address, map) =>  {
  marker = L.marker([lat, lon]).addTo(map);
  marker.bindPopup(`<h3>${name}</h3>
<p>${address}</p>`).openPopup();
}

const favoriteMarker = (restaurant) => {

}

const zoomRestaurant = (rest) => {
  map.setView([rest.location.coordinates[0], rest.location.coordinates[1] ], 14);
}



export {createMap, restaurantMarker, getRestaurantsLatLon, favoriteMarker, zoomRestaurant}
