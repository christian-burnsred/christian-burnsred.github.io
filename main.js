window.onload = () => {
    // if you want to statically add places, de-comment the following line
    const method = 'static';

    if (method === 'static') {
        // Get the user's current location first
        navigator.geolocation.getCurrentPosition((position) => {
            const currentLatitude = position.coords.latitude;
            const currentLongitude = position.coords.longitude;

            // Now load the static places using the current location
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
                lat: currentLatitude + 0.001, // Example offset
                lng: currentLongitude + 0.001, // Example offset
            }
        },
        {
            name: 'Location 2',
            location: {
                lat: currentLatitude + 0.002, // Example offset
                lng: currentLongitude + 0.002, // Example offset
            }
        }
    ];
}

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        const latitude = place.location.lat;
        const longitude = place.location.lng;

        // Add place icon
        const icon = document.createElement('a-image');
        icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
        icon.setAttribute('name', place.name);
        icon.setAttribute('src', '../assets/map-marker.png'); // Update path as necessary

        // Scale for better visibility
        icon.setAttribute('scale', '20, 20');

        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));

        // Click event listener
        const clickListener = (ev) => {
            console.log(ev.detail)

            ev.stopPropagation();
            ev.preventDefault();

            const name = ev.target.getAttribute('name');
            const el = ev.detail.intersection && ev.detail.intersection.object.el;

            if (el && el === ev.target) {
                alert("Here")
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
            }
        };

        icon.addEventListener('click', clickListener);
        scene.appendChild(icon);
    });
}
