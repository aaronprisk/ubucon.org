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

        const today = new Date();
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

            // Classify event
            if (eventDate >= today.setHours(0, 0, 0, 0)) {
                upcomingEvents.push({ eventName, dateStr, address, url, coordinates });
            } else {
                previousEvents.push({ eventName, dateStr, address, url, coordinates });
            }

            // Add marker to map
            eventCoordinates.push(coordinates);
            L.marker(coordinates, { icon: customIcon }).addTo(map)
            .bindPopup(`<b>${eventName}</b><br/>${address}</b><br/><a href="${url}" target="_blank">More info</a>`);
        });

        // Sort events by date
        const sortByDate = (a, b) => new Date(a.dateStr) - new Date(b.dateStr);
        upcomingEvents.sort(sortByDate);
        previousEvents.sort(sortByDate).reverse(); // Most recent past first

        // Render into tables
        const upcomingTable = document.getElementById('upcomingEvents').getElementsByTagName('tbody')[0];
        const previousTable = document.getElementById('previousEvents').getElementsByTagName('tbody')[0];

        function populateTable(table, events) {
            events.forEach(event => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${event.eventName}</td>
                <td>${event.dateStr}</td>
                <td>${event.address}</td>
                <td><a href="${event.url}" target="_blank">More info</a></td>
                `;
                table.appendChild(row);
            });
        }

        populateTable(upcomingTable, upcomingEvents);
        populateTable(previousTable, previousEvents);

        // Adjust map view
        if (eventCoordinates.length > 0) {
            const bounds = L.latLngBounds(eventCoordinates);
            map.fitBounds(bounds);
        } else {
            map.setView([0, 0], 2);
        }

    } catch (error) {
        console.error('Error loading events.json:', error);
    }
}


// Only execute these functions once the window has fully loaded
window.onload = function() {
    // Initialize Leaflet map
    var map = L.map('map').setView([0, 0], 2);

    // Add OpenStreet Maps base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Call function to add markers and events from events.json, passing in the map
    addMarkersAndEventsFromJSON(map);
};
