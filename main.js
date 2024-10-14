window.onload = () => {
    const scene = document.querySelector('a-scene');

    // Add cursor entity for raycasting
    // const cursor = document.createElement('a-entity');
    // cursor.setAttribute('cursor', 'rayOrigin: mouse; fuse: false;');
    // cursor.setAttribute('raycaster', 'objects: .clickable');
    // scene.camera.el.appendChild(cursor);
    const cursor = document.createElement('a-entity');
    cursor.setAttribute('cursor', 'rayOrigin: mouse; fuse: false;');
    cursor.setAttribute('raycaster', 'objects: a-box, a-image');
    cursor.setAttribute('raycaster', 'ignore: [canvas]');
    cursor.setAttribute('raycaster', 'objects: .clickable; showLine: true;');
    scene.camera.el.appendChild(cursor);

    console.log('Cursor entity added to scene');

    navigator.geolocation.getCurrentPosition((position) => {
        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;

        console.log('Current Location:', {
            latitude: currentLatitude,
            longitude: currentLongitude
        });

        const places = [
            {
                name: "Landmark 1",
                latitude: currentLatitude + 0.0001,
                longitude: currentLongitude + 0.0001,
                image: 'assets/cube-logo-100.png'
            }
        ];

        console.log('Places to render:', places);

        places.forEach((place, index) => {
            const placeEntity = document.createElement('a-entity');
            placeEntity.setAttribute('gps-entity-place', `latitude: ${place.latitude}; longitude: ${place.longitude};`);
            placeEntity.setAttribute('look-at', '[gps-camera]');
            placeEntity.setAttribute('scale', '5 5 5');
            placeEntity.setAttribute('class', 'clickable');
            placeEntity.setAttribute('id', `place-${index}`);

            console.log(`Creating place entity: ${place.name}`);

            // Create a visible hitbox
            const hitbox = document.createElement('a-box');
            hitbox.setAttribute('class', 'clickable');
            hitbox.setAttribute('material', 'color: red; opacity: 0.3');
            hitbox.setAttribute('scale', '1.2 1.2 0.1');
            hitbox.setAttribute('position', '0 0 -0.05');
            placeEntity.appendChild(hitbox);

            const placeImage = document.createElement('a-image');
            placeImage.setAttribute('src', place.image);
            placeImage.setAttribute('scale', '1 1 1');
            placeImage.setAttribute('position', '0 0 0'); // Center the image
            placeEntity.setAttribute('class', 'clickable');
            placeEntity.appendChild(placeImage);

            // Add click listener to the entity
            placeEntity.addEventListener('click', function (event) {
                console.log(`Clicked on ${place.name}`, event);
                alert(`You clicked on ${place.name}`);
                updateDebugText(`Clicked: ${place.name}`);
            });

            // Mouse enter and leave events for visual feedback
            placeEntity.addEventListener('mouseenter', function () {
                console.log(`Mouse entered ${place.name}`);
                hitbox.setAttribute('material', 'opacity', '0.5');
                updateDebugText(`Mouse entered: ${place.name}`);
            });
            placeEntity.addEventListener('mouseleave', function () {
                console.log(`Mouse left ${place.name}`);
                hitbox.setAttribute('material', 'opacity', '0.3');
                updateDebugText(`Mouse left: ${place.name}`);
            });

            placeEntity.addEventListener('loaded', () => {
                console.log(`Marker loaded: ${place.name}`);
                updateDebugText(`Marker loaded: ${place.name}`);
                window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'));
            });

            scene.appendChild(placeEntity);
            console.log(`Place entity added to scene: ${place.name}`);
        });

        // Add a static debug element
        const debugEl = document.createElement('a-text');
        debugEl.setAttribute('value', 'Debug: Waiting for interaction');
        debugEl.setAttribute('position', '0 -0.5 -1');
        debugEl.setAttribute('scale', '0.5 0.5 0.5');
        scene.camera.el.appendChild(debugEl);

        console.log('Debug element added to scene');

        // Function to update debug text
        function updateDebugText(message) {
            console.log('Debug:', message);
            debugEl.setAttribute('value', `Debug: ${message}`);
        }

        // Scene-wide click listener
        scene.addEventListener('click', function (event) {
            console.log('Scene clicked');
            console.log('Click event:', event);
            console.log('Clicked element:', event.target);
            updateDebugText(`Scene clicked: ${new Date().toLocaleTimeString()}`);
        });

        console.log('Scene click listener added');

    }, (err) => {
        console.error('Error retrieving location', err);
        updateDebugText(`GPS Error: ${err.message}`);
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 27000,
    });
};