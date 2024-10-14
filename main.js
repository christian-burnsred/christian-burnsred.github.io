window.onload = () => {
    const method = 'static';

    if (method === 'static') {
        navigator.geolocation.getCurrentPosition((position) => {
            const currentLatitude = position.coords.latitude;
            const currentLongitude = position.coords.longitude;

            let places = staticLoadPlaces(currentLatitude, currentLongitude);
            renderPlaces(places);
        }, (err) => {
            console.error('Error in retrieving position', err);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        });
    }
};

function staticLoadPlaces(currentLatitude, currentLongitude) {
    return [
        {
            name: "Location 1",
            location: {
                lat: currentLatitude + 0.001,
                lng: currentLongitude + 0.001,
            }
        },
        {
            name: 'Location 2',
            location: {
                lat: currentLatitude + 0.002,
                lng: currentLongitude + 0.002,
            }
        }
    ];
}

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        const latitude = place.location.lat;
        const longitude = place.location.lng;

        const icon = document.createElement('a-image');
        icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
        icon.setAttribute('name', place.name);
        icon.setAttribute('src', '../assets/map-marker.png');
        icon.setAttribute('scale', '20, 20');
        icon.setAttribute('class', 'clickable');

        icon.addEventListener('loaded', () => {
            window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'));

            icon.addEventListener('click', (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                const name = icon.getAttribute('name');
                console.log("Clicked on:", name);

                // Show an alert when the marker is clicked
                alert(`You clicked on ${name}`);

                // Create and show the label
                const label = document.createElement('span');
                const container = document.createElement('div');
                container.setAttribute('id', 'place-label');
                label.innerText = name;
                container.appendChild(label);
                document.body.appendChild(container);

                // Remove the label after 1.5 seconds
                setTimeout(() => {
                    container.parentElement.removeChild(container);
                }, 1500);
            });
        });
        scene.appendChild(icon);
    });
}