var customIcon = L.icon({
  iconUrl: 'img/marker.png', // Path to custom marker icon
  iconSize: [32, 32],        // Size of the icon
  iconAnchor: [16, 32],      // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -32]      // Point from which the popup should open relative to the iconAnchor
});

async function addMarkersAndEventsFromJSON(map) {
  try {
    const response = await fetch('events.json');
    const eventsData = await response.json();

    const now = new Date();
    const currentYear = now.getFullYear();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    let upcomingEvents = [];
    let previousEvents = [];
    let eventCoordinates = [];

    eventsData.forEach(event => {
      const coordinates = event.coordinates;
      const eventName = event.event;
      const address = event.address;
      const dateStr = event.date;
      const url = event.url;
      const eventDate = new Date(dateStr);
      // Skip bad dates
      if (isNaN(eventDate.getTime())) return; 
    
      // Classify events
      if (eventDate >= startOfToday) {
        upcomingEvents.push({ eventName, dateStr, address, url, coordinates });
      } else {
        previousEvents.push({ eventName, dateStr, address, url, coordinates });
      }
    
      // Add pins on map
      if (eventDate.getFullYear() === currentYear) {
        // Check for bad lat long coords
        if (Array.isArray(coordinates) && coordinates.length === 2) {
          const lat = Number(coordinates[0]);
          const lng = Number(coordinates[1]);
          if (
            Number.isFinite(lat) && Number.isFinite(lng) &&
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
          ) {
            L.marker([lat, lng], { icon: customIcon })
              .addTo(map)
              .bindPopup(
                `<b>${eventName}</b><br/>${address}<br/><a href="${url}" target="_blank" rel="noopener">More info</a>`
              );
          }
        }
      }
    });

    // Sort events by date
    const sortByDate = (a, b) => new Date(a.dateStr) - new Date(b.dateStr);
    upcomingEvents.sort(sortByDate);
    previousEvents.sort(sortByDate).reverse();

    // Render into tables
    const upcomingTable = document.getElementById('upcomingEvents').getElementsByTagName('tbody')[0];
    const previousTable = document.getElementById('previousEvents').getElementsByTagName('tbody')[0];
    upcomingTable.innerHTML = "";
    previousTable.innerHTML = "";

    function populateTable(table, events) {
      events.forEach(event => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${event.eventName}</td>
          <td>${event.dateStr}</td>
          <td>${event.address}</td>
          <td><a href="${event.url}" target="_blank" rel="noopener">More info</a></td>
        `;
        table.appendChild(row);
      });
    }

    populateTable(upcomingTable, upcomingEvents);
    populateTable(previousTable, previousEvents);

    // Adjust map to global view
    map.setView([0, 0], 2);

  } catch (error) {
    console.error('Error loading events.json:', error);
  }
}

window.onload = function () {
  // Initialize Leaflet map
  var map = L.map('map').setView([0, 0], 2);
  // Add OpenStreet Maps base layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  // Call function to add markers and events from events.json, passing in the map
  addMarkersAndEventsFromJSON(map);
};
