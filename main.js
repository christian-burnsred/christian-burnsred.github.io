import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"
import {getFirestore, collection, getDocs} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"

window.onload = () => {
    // See: https://support.google.com/firebase/answer/7015592
    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: "ccc-data-store.firebaseapp.com",
        projectId: "ccc-data-store",
        storageBucket: "ccc-data-store.appspot.com",
        messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASURE_ID
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const userDoc = collection(db, "markers");

    async function fetchMarkers() {
        try {
            const snapshot = await getDocs(userDoc);
            const markersList = [];

            snapshot.forEach(doc => {
                markersList.push({
                    id: doc.id,  // Storing the document ID
                    ...doc.data()  // Merging the document data
                });
            });

            console.log("Markers List:", markersList);
            console.log("Marker:", markersList[0].equipment);
            return markersList;
        } catch (error) {
            console.error("Error reading document: ", error);
            return [];
        }
    }

    const scene = document.querySelector('a-scene');

    const cursor = document.createElement('a-entity');
    cursor.setAttribute('cursor', 'rayOrigin: mouse; fuse: false;');
    cursor.setAttribute('raycaster', 'objects: a-box, a-gltf-model');
    cursor.setAttribute('raycaster', 'ignore: [canvas]');
    cursor.setAttribute('raycaster', 'objects: .clickable; showLine: true;');
    scene.camera.el.appendChild(cursor);

    function haversineDistance(coords1, coords2) {
        function toRad(x) {
            return x * Math.PI / 180;
        }

        const lon1 = coords1[0];
        const lat1 = coords1[1];

        const lon2 = coords2[0];
        const lat2 = coords2[1];

        const R = 6371; // km

        const x1 = lat2 - lat1;
        const dLat = toRad(x1);
        const x2 = lon2 - lon1;
        const dLon = toRad(x2)
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    navigator.geolocation.getCurrentPosition(async (userLocation) => {
        const markers = await fetchMarkers(); // Wait for the markers to be fetched
        markers.forEach((marker, index) => {
            const placeEntity = document.createElement('a-entity');
            placeEntity.setAttribute('gps-entity-place', `latitude: ${marker.location.lat}; longitude: ${marker.location.lng};`);
            placeEntity.setAttribute('look-at', '[gps-camera]');
            placeEntity.setAttribute('scale', '6 6 6');
            placeEntity.setAttribute('class', 'clickable');
            placeEntity.setAttribute('id', `place-${index}`);

            // 3D model that always faces the camera
            const placeModel = document.createElement('a-gltf-model');
            placeModel.setAttribute('src', 'Shiny Amberis-Amur.glb');
            placeModel.setAttribute('scale', '0.1 0.1 0.1');
            placeModel.setAttribute('look-at', '[gps-camera]');
            placeModel.setAttribute('class', 'clickable');
            placeEntity.appendChild(placeModel);

            // Text for Equipment and Distance
            const textEntity = document.createElement('a-text');
            const distance = haversineDistance([marker.location.lng, marker.location.lat], [userLocation.coords.longitude, userLocation.coords.latitude]).toFixed(2);
            textEntity.setAttribute('value', `${marker.equipment}\n${distance} km`);
            textEntity.setAttribute('align', 'center');
            textEntity.setAttribute('position', '0 1.5 0');
            textEntity.setAttribute('scale', '1.5 1.5 1.5');
            textEntity.setAttribute('look-at', '[gps-camera]');
            placeEntity.appendChild(textEntity);

            // Invisible hitbox for better click detection
            const hitbox = document.createElement('a-box');
            hitbox.setAttribute('class', 'clickable');
            hitbox.setAttribute('material', `color: transparent; opacity: 0.0`);
            hitbox.setAttribute('scale', '2 2 0');
            hitbox.setAttribute('position', '0 0 0');
            placeEntity.appendChild(hitbox);

            // Add click listener
            placeEntity.addEventListener('click', function () {
                console.log(`Clicked on ${marker.equipment}`);
                showModal(marker);
            });

            scene.appendChild(placeEntity);
        });

        function showModal(marker) {
            const modal = document.createElement('div');
            modal.setAttribute('id', 'landmark-modal');
            Object.assign(modal.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                zIndex: '9999',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                padding: '20px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif',
                color: '#333'
            });

            const closeIcon = document.createElement('div');
            closeIcon.innerHTML = '&times;';
            Object.assign(closeIcon.style, {
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '30px',
                cursor: 'pointer',
                color: '#666',
                zIndex: '1'
            });
            closeIcon.onclick = () => document.body.removeChild(modal);
            modal.appendChild(closeIcon);

            const title = document.createElement('h2');
            title.innerText = marker.equipment;
            Object.assign(title.style, {
                margin: '0',
                padding: '20px 0',
                color: '#2c3e50',
                fontSize: '24px',
                borderBottom: '2px solid #3498db',
                position: 'sticky',
                top: '0',
            });
            modal.appendChild(title);

            const contentWrapper = document.createElement('div');
            Object.assign(contentWrapper.style, {
                flex: '1',
                overflowY: 'auto',
                padding: '20px 0'
            });
            modal.appendChild(contentWrapper);

            const description = document.createElement('div');
            description.innerHTML = `
            <p><strong>Operation:</strong> ${marker.operation}</p>
            <p><strong>Control:</strong> ${marker.control}</p>
            <p><strong>Control Framework:</strong> ${marker.framework}</p>
            <p><strong>Operating Context:</strong> ${marker.context}</p>
            <p><strong>Equipment:</strong> ${marker.equipment}</p>
            <p><strong>Location</strong></br>
                &emsp;<strong>Lat:</strong> ${marker.location.lat}</br>
                &emsp;<strong>Lng:</strong> ${marker.location.lng}</p>
            <p><strong>Distance:</strong> ${haversineDistance([marker.location.lng, marker.location.lat], [userLocation.coords.longitude, userLocation.coords.latitude]).toFixed(2)} km</p>
        `;
            Object.assign(description.style, {
                marginBottom: '20px',
                lineHeight: '1.6',
                fontSize: '16px'
            });
            contentWrapper.appendChild(description);

            const openUrlButton = document.createElement('button');
            openUrlButton.innerText = 'Perform CCC';
            Object.assign(openUrlButton.style, {
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.3s',
                width: '100%',
                marginBottom: '20px'
            });
            openUrlButton.onmouseover = () => openUrlButton.style.backgroundColor = '#2980b9';
            openUrlButton.onmouseout = () => openUrlButton.style.backgroundColor = '#3498db';
            openUrlButton.onclick = () => window.open(marker.url, '_blank');
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