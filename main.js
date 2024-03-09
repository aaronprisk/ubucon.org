// FIXME: this file is not actually used yet!
// Once we move this onto the Real(tm) UbuCon.org, the inline JS should be copied here
// and this file should be used instead

// Initialize Leaflet map
var map = L.map('map').setView([0, 0], 2);

// Add OpenStreet Maps base layer (optional)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define custom marker icon
var customIcon = L.icon({
    iconUrl: 'img/marker.png', // Path to custom marker icon
    iconSize: [32, 32], // Size of the icon
    iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -32] // Point from which the popup should open relative to the iconAnchor
});

// Function to add markers and events to the map and table
async function addMarkersAndEventsFromJSON() {
    try {
        // Fetch events.json file
        const response = await fetch('events.json');
        const eventsData = await response.json();
        var eventCoordinates = [];

        // Iterate over events
        eventsData.forEach(event => {
            // Extract data
            const coordinates = event.coordinates;
            const eventName = event.event;
            const address = event.address;
            const date = event.date;
            const url = event.url;

            eventCoordinates.push(coordinates);

            // Add marker to the map using custom icon
            L.marker(coordinates, { icon: customIcon }).addTo(map)
                .bindPopup(`<b>${eventName}</b><br/><a href="${url}" target="_blank">More info</a>`);

            // Add event to the table
            const eventRow = document.createElement('tr');
            eventRow.innerHTML = `
                <td>${eventName}</td>
                <td>${date}</td>
                <td>${address}</td>
                <td><a href="${url}" target="_blank">More info</a></td>
            `;
            document.getElementById('eventTable').getElementsByTagName('tbody')[0].appendChild(eventRow);
        });
        // Calculate bounds and set map view
        if(eventCoordinates.length > 0) {
            var bounds = L.latLngBounds(eventCoordinates);
            map.fitBounds(bounds);
        } else {
            map.setView([0, 0], 2); // Fallback view
        }
    } catch (error) {
        console.error('Error loading events.json:', error);
    }
}

// Call function to add markers and events from events.json
addMarkersAndEventsFromJSON();
