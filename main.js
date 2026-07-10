var customIcon = L.icon({
  iconUrl: 'img/marker.png', // Path to custom marker icon
  iconSize: [32, 32],        // Size of the icon
  iconAnchor: [16, 32],      // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -32]      // Point from which the popup should open relative to the iconAnchor
});

async function addMarkersAndEventsFromJSON(map) {
  try {
    // Determine path based on page location to handle sub-pages properly
    const isSubPage = window.location.pathname.includes('/india/') || window.location.pathname.includes('/scale/');
    const jsonPath = isSubPage ? '../events.json' : 'events.json';

    const response = await fetch(jsonPath);
    const eventsData = await response.json();

    const now = new Date();
    const currentYear = now.getFullYear();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    let upcomingEvents = [];
    let previousEvents = [];

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
    
      // Add pins on map (only if map is initialized)
      if (map && eventDate.getFullYear() === currentYear) {
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

    // Render into tables (only if table elements exist)
    const upcomingTableEl = document.getElementById('upcomingEvents');
    const previousTableEl = document.getElementById('previousEvents');
    const upcomingTable = upcomingTableEl ? upcomingTableEl.getElementsByTagName('tbody')[0] : null;
    const previousTable = previousTableEl ? previousTableEl.getElementsByTagName('tbody')[0] : null;

    if (upcomingTable) upcomingTable.innerHTML = "";
    if (previousTable) previousTable.innerHTML = "";

    function populateTable(table, events) {
      events.forEach(event => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${event.eventName}</td>
          <td>${event.dateStr}</td>
          <td>${event.address}</td>
          <td><a href="${event.url}" target="_blank" rel="noopener" class="event-more-info-link">More info</a></td>
        `;
        table.appendChild(row);
      });
    }

    if (upcomingTable) populateTable(upcomingTable, upcomingEvents);
    if (previousTable) populateTable(previousTable, previousEvents);

    // Adjust map to global view (only if map is initialized)
    if (map) map.setView([0, 0], 2);

  } catch (error) {
    console.error('Error loading events.json:', error);
  }
}

window.onload = function () {
  const mapElement = document.getElementById('map');
  if (mapElement && typeof L !== 'undefined') {
    // Initialize Leaflet map
    var map = L.map('map').setView([0, 0], 2);
    // Add OpenStreet Maps base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    // Call function to add markers and events from events.json, passing in the map
    addMarkersAndEventsFromJSON(map);
  } else {
    // Call function without map
    addMarkersAndEventsFromJSON(null);
  }

  // Toggle previous events table visibility
  const btnTogglePrevious = document.getElementById('btn-toggle-previous');
  const wrapperPrevious = document.getElementById('wrapper-previous-events');
  if (btnTogglePrevious && wrapperPrevious) {
    btnTogglePrevious.onclick = function () {
      if (wrapperPrevious.style.display === 'none') {
        wrapperPrevious.style.display = 'block';
        btnTogglePrevious.textContent = 'Hide Previous Events';
      } else {
        wrapperPrevious.style.display = 'none';
        btnTogglePrevious.textContent = 'Show Previous Events';
      }
    };
  }
};
