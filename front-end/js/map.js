const  createMap  = async () => {
  var map = L.map('map').setView([60.186776, 24.822108], 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  return map;
}

const restaurantMarker = (lat, lon, name, address, map) =>  {
  var marker = L.marker([lat, lon]).addTo(map);
  marker.bindPopup(`<h3>${name}</h3>
<p>${address}</p>`).openPopup();
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

export {createMap, restaurantMarker, getRestaurantsLatLon}
