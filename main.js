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
            return markersList;  // Optionally return the list if needed
        } catch (error) {
            console.error("Error reading document: ", error);
            return [];
        }
    }

    const scene = document.querySelector('a-scene');

    const cursor = document.createElement('a-entity');
    cursor.setAttribute('cursor', 'rayOrigin: mouse; fuse: false;');
    cursor.setAttribute('raycaster', 'objects: a-box, a-image');
    cursor.setAttribute('raycaster', 'ignore: [canvas]');
    cursor.setAttribute('raycaster', 'objects: .clickable; showLine: true;');
    scene.camera.el.appendChild(cursor);

    console.log('Cursor entity added to scene');

    const colours = ['red', 'green', 'yellow', 'blue', 'orange', ];

    navigator.geolocation.getCurrentPosition(async () => {
        const markers = await fetchMarkers(); // Wait for the markers to be fetched
        markers.forEach((marker, index) => {
            const placeEntity = document.createElement('a-entity');
            placeEntity.setAttribute('gps-entity-place', `latitude: ${marker.location.lat}; longitude: ${marker.location.lng};`);
            placeEntity.setAttribute('look-at', '[gps-camera]');
            placeEntity.setAttribute('scale', '6 6 6');
            placeEntity.setAttribute('class', 'clickable');
            placeEntity.setAttribute('id', `place-${index}`);

            const placeImage = document.createElement('a-image');
            placeImage.setAttribute('src', 'cube-logo-100.png');
            placeImage.setAttribute('scale', '1 1 1');
            placeImage.setAttribute('position', '0 0 0');
            placeEntity.appendChild(placeImage);

            // Invisible hitbox for better click detection
            const hitbox = document.createElement('a-box');
            hitbox.setAttribute('class', 'clickable');
            hitbox.setAttribute('material', `color: ${colours[index % colours.length]}; opacity: 0.2`);
            hitbox.setAttribute('scale', '2 2 0.1');
            hitbox.setAttribute('position', '0 0 0');
            placeEntity.appendChild(hitbox);

            // Add click listener
            placeEntity.addEventListener('click', function () {
                console.log(`Clicked on ${marker.equipment}`);
                showModal(marker);
            });

            scene.appendChild(placeEntity);
        });

        // Function to show the modal with landmark details
        function showModal(marker) {
            // Create a modal container
            const modal = document.createElement('div');
            modal.setAttribute('id', 'landmark-modal');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'; // Semi-transparent background
            modal.style.zIndex = '9999';
            modal.style.display = 'flex';
            modal.style.flexDirection = 'column';
            modal.style.alignItems = 'left';
            modal.style.justifyContent = 'center';
            modal.style.padding = '20px';
            modal.style.boxSizing = 'border-box'; // Ensure padding doesn't affect overall size

            // Create an 'X' icon for closing the modal
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

            // Landmark name
            const title = document.createElement('h2');
            title.innerText = marker.equipment;
            modal.appendChild(title);

            // Landmark description
            const description = document.createElement('p');
            description.innerHTML = `
                <strong>Operation:</strong> ${marker.operation}<br>
                <strong>Control:</strong> ${marker.control}<br>
                <strong>Control Framework:</strong> ${marker.framework}<br>
                <strong>Operating Context:</strong> ${marker.context}<br>
                <strong>Equipment:</strong> ${marker.equipment}<br>
                <strong>Location:</strong> ${marker.location.lat}, ${marker.location.lng}<br>
            `;
            modal.appendChild(description);


            // Button to open URL in new tab
            const openUrlButton = document.createElement('button');
            openUrlButton.innerText = 'Perform CCC';
            openUrlButton.style.marginTop = '10px';
            openUrlButton.style.padding = '10px 20px';
            openUrlButton.style.cursor = 'pointer';
            openUrlButton.onclick = () => {
                window.open(marker.url, '_blank');
            };
            modal.appendChild(openUrlButton);

            // Add modal to the body
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
