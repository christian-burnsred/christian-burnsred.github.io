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
            { name: "Landmark 1", latitude: currentLatitude, longitude: currentLongitude, image: 'assets/cube-logo-100.png' }, // Example coordinates (San Francisco)
        ];

        console.log(places)

        // Add hardcoded places to the scene
        places.forEach((place) => {
            const placeImage = document.createElement('a-image');
            placeImage.setAttribute('gps-entity-place', `latitude: ${place.latitude}; longitude: ${place.longitude};`);
            placeImage.setAttribute('src', place.image); // Use the custom PNG image
            placeImage.setAttribute('scale', '1 1 1'); // Scale the image as needed
            placeImage.setAttribute('cursor', ''); // Enable cursor interaction

            // Event listener for clicking the marker
            placeImage.addEventListener('click', () => {
                console.log("Click")
            });

            // Event listener to notify when the image is loaded
            placeImage.addEventListener('loaded', () => {
                console.log('Marker loaded');
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
