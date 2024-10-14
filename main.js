window.onload = () => {
    const scene = document.querySelector('a-scene');

    const cursor = document.createElement('a-entity');
    cursor.setAttribute('cursor', 'rayOrigin: mouse; fuse: false;');
    cursor.setAttribute('raycaster', 'objects: a-box, a-gltf-model');
    cursor.setAttribute('raycaster', 'ignore: [canvas]');
    cursor.setAttribute('raycaster', 'objects: .clickable; showLine: true;');
    scene.camera.el.appendChild(cursor);

    console.log('Cursor entity added to scene');

    navigator.geolocation.getCurrentPosition((position) => {
        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;

        const places = [
            {
                name: "Equipment",
                description: "Equipment Description",
                latitude: currentLatitude + 0.0001,
                longitude: currentLongitude + 0.0001,
                model: 'assets/Shiny Amberis-Amur.glb',  // Path to your 3D model
                infoUrl: "http://bhp-qr-code-evolve-platform-prototype1.burnsred.com.au/"
            }
        ];

        places.forEach((place, index) => {
            const placeEntity = document.createElement('a-entity');
            placeEntity.setAttribute('gps-entity-place', `latitude: ${place.latitude}; longitude: ${place.longitude};`);
            placeEntity.setAttribute('look-at', '[gps-camera]');
            placeEntity.setAttribute('scale', '6 6 6');
            placeEntity.setAttribute('class', 'clickable');
            placeEntity.setAttribute('id', `place-${index}`);

            // 3D model that always faces the camera
            const placeModel = document.createElement('a-gltf-model');
            placeModel.setAttribute('src', place.model);  // Path to the 3D model
            placeModel.setAttribute('scale', '1 1 1');    // Adjust scale as necessary
            placeModel.setAttribute('look-at', '[gps-camera]');  // Always face the camera
            placeModel.setAttribute('class', 'clickable');  // Ensure the model is clickable
            placeEntity.appendChild(placeModel);

            // Invisible hitbox for better click detection
            const hitbox = document.createElement('a-box');
            hitbox.setAttribute('class', 'clickable');
            hitbox.setAttribute('material', 'color: transparent; opacity: 0.0');
            hitbox.setAttribute('scale', '1.5 1.5 0.1');
            hitbox.setAttribute('position', '0 0 0');
            placeEntity.appendChild(hitbox);

            // Add click listener
            placeEntity.addEventListener('click', function () {
                console.log(`Clicked on ${place.name}`);
                showModal(place);
            });

            scene.appendChild(placeEntity);
        });

        function showModal(place) {
            const modal = document.createElement('div');
            modal.setAttribute('id', 'landmark-modal');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            modal.style.zIndex = '9999';
            modal.style.display = 'flex';
            modal.style.flexDirection = 'column';
            modal.style.alignItems = 'left';
            modal.style.justifyContent = 'center';
            modal.style.padding = '20px';
            modal.style.boxSizing = 'border-box';

            const closeIcon = document.createElement('div');
            closeIcon.innerHTML = '&times;';
            closeIcon.style.position = 'absolute';
            closeIcon.style.top = '20px';
            closeIcon.style.right = '20px';
            closeIcon.style.fontSize = '30px';
            closeIcon.style.cursor = 'pointer';
            closeIcon.onclick = () => {
                document.body.removeChild(modal);
            };
            modal.appendChild(closeIcon);

            const title = document.createElement('h2');
            title.innerText = place.name;
            modal.appendChild(title);

            const description = document.createElement('p');
            description.innerText = place.description;
            modal.appendChild(description);

            const openUrlButton = document.createElement('button');
            openUrlButton.innerText = 'Perform CCC';
            openUrlButton.style.marginTop = '10px';
            openUrlButton.style.padding = '10px 20px';
            openUrlButton.style.cursor = 'pointer';
            openUrlButton.onclick = () => {
                window.open(place.infoUrl, '_blank');
            };
            modal.appendChild(openUrlButton);

            document.body.appendChild(modal);
        }

    }, (err) => {
        console.error('Error retrieving location', err);
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 27000,
    });
};
