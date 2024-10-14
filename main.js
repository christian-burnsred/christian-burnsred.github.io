window.onload = () => {
    const scene = document.querySelector('a-scene');

    // Get current user location and log it to the console
    navigator.geolocation.getCurrentPosition((position) => {
        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;

        // Log the current location
        console.log('Current Location:', {
            latitude: currentLatitude,
            longitude: currentLongitude
        });

        // Hardcoded places data
        const places = [
            {
                name: "Landmark 1",
                latitude: currentLatitude + 0.1,
                longitude: currentLongitude + 0.1,
                image: 'assets/cube-logo-100.png'
            }
        ];

        console.log(places)

        // Add hardcoded places to the scene
        places.forEach((place) => {
            const placeImage = document.createElement('a-image');
            placeImage.setAttribute('gps-entity-place', `latitude: ${place.latitude}; longitude: ${place.longitude};`);
            placeImage.setAttribute('src', place.image); // Use the custom PNG image
            placeImage.setAttribute('position', '0 4 0'); // Raise the marker above the ground
            placeImage.setAttribute('scale', '2 2 2'); // Adjust the scale for visibility
            placeImage.setAttribute('cursor', 'rayOrigin: mouse'); // Enable cursor interaction via mouse clicks
            placeImage.setAttribute('class', 'clickable'); // Optional: Add a class to the marker for easier reference

            // Add click event listener for the marker
            placeImage.addEventListener('click', () => {
                console.log("Marker clicked:", place.name);
                // Add any further actions you want to trigger on click here
                alert(`You clicked on ${place.name}`);
            });

            // Log marker loading event
            placeImage.addEventListener('loaded', () => {
                console.log('Marker loaded:', place.name);
                window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'));
            });

            scene.appendChild(placeImage);
        });
    }, (err) => {
        console.error('Error retrieving location', err);
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 27000,
    });
};
