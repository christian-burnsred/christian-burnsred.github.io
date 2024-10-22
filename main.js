import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"

let userLocation = null;
let markers = null

window.onload = async () => {
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
    const assignees = collection(db, "assignees");
    markers = await fetchMarkers()

    async function fetchUsers() {
        try {
            const users = await getDocs(assignees);
            const userList = [];

            users.forEach(doc => {
                userList.push({
                    id: doc.id,  // Storing the document ID
                    ...doc.data()  // Merging the document data
                });
            });

            console.log("User List:", userList);
            return userList;
        } catch (error) {
            console.error("Error reading document: ", error);
            return [];
        }
    }


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
            return markersList;
        } catch (error) {
            console.error("Error reading document: ", error);
            return [];
        }
    }


    // Login Function
    document.getElementById('loginButton').addEventListener('click', function () {
        // Show the login container
        const loginContainer = document.getElementById("login-container");
        if (loginContainer) {
            loginContainer.style.display = "block"; // Show the login form
        }
    });

    // Update the existing event listener for the assigned to me button
    document.getElementById('assignedToMeButton').addEventListener('click', function (event) {
        event.preventDefault();
        showAssignedModal();
    });

    // Event listener for closing the assigned items modal
    document.getElementById('closeAssignedModal').addEventListener('click', function () {
        document.getElementById('assigned-modal').style.display = 'none';
    });

    function showToast(message, colour) {
        const toastContainer = document.getElementById('toast-container');

        // Create the toast element
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.background = colour;
        toast.style.color = '#fff';
        toast.style.padding = '10px 20px';
        toast.style.marginTop = '65px';
        toast.style.borderRadius = '5px';
        toast.style.fontSize = '16px';
        toast.style.textAlign = 'center';
        toast.style.minWidth = '200px';

        // Add the toast to the container
        toastContainer.appendChild(toast);

        // Remove the toast after the duration
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    async function loginUser(username, password) {
        try {
            const users = await fetchUsers();
            const user = users.find(user => user.username === username);

            if (user) {
                const validPassword = await validatePassword(user.id, password);
                if (validPassword) {
                    console.log("Login successful");
                    showToast("Logged in as " + user.name, 'green');
                    // Update UI after login
                    updateUIAfterLogin(user);
                } else {
                    showToast("Invalid password", "red");
                }
            } else {
                showToast("User not found", "red");
            }
        } catch (error) {
            showToast("An error occurred during login", "red");
            console.error("Login error:", error);
        }
    }

    // Update UI After Login
    function toggleDropdown() {
        const userMenu = document.getElementById('userMenu');
        const dropdownMenu = userMenu.querySelector('.dropdown-menu');
        dropdownMenu.classList.toggle('active');
        userMenu.classList.toggle('active');
    }

    let currentUser = null;

    function updateUIAfterLogin(user) {
        currentUser = user;
        const userMenu = document.getElementById('userMenu');
        const userNameSpan = document.getElementById('userName');
        const loginButton = document.getElementById('loginButton');
        const loginPopup = document.getElementById('login-container')

        loginPopup.style.display = 'none';
        userNameSpan.textContent = user.name
        userMenu.style.display = 'block';
        loginButton.style.display = 'none';

        // Add click event listener to the user menu
        userMenu.addEventListener('click', toggleDropdown);
        updateMarkers();


        // Fetch the assigned actions count
        const assignedMarkers = markers.filter(marker => marker.assignee && marker.assignee.username === currentUser.username);
        const noAssignedActions = assignedMarkers.length;

        // Add notification bubble next to the user's name
        const notificationCircle = document.createElement('span');
        notificationCircle.setAttribute('id', 'notificationCircle');
        notificationCircle.textContent = noAssignedActions;
        notificationCircle.style.position = 'absolute';
        notificationCircle.style.top = '0px';
        notificationCircle.style.left = '-23px';
        notificationCircle.style.backgroundColor = '#ff0000';
        notificationCircle.style.color = '#fff';
        notificationCircle.style.borderRadius = '50%';
        notificationCircle.style.width = '20px';
        notificationCircle.style.height = '20px';
        notificationCircle.style.display = 'flex';
        notificationCircle.style.justifyContent = 'center';
        notificationCircle.style.alignItems = 'center';
        notificationCircle.style.fontSize = '12px';

        // Append the notification circle to the username
        userNameSpan.style.position = 'relative';
        userNameSpan.appendChild(notificationCircle);

        // Update the notification for the "My Assigned Actions" button
        const assignedNotification = document.createElement('span');
        assignedNotification.setAttribute('id', 'assignedNotification');
        assignedNotification.textContent = noAssignedActions;
        assignedNotification.style.position = 'absolute';
        assignedNotification.style.top = '18px';
        assignedNotification.style.right = '4px';
        assignedNotification.style.backgroundColor = '#ff0000';
        assignedNotification.style.color = '#fff';
        assignedNotification.style.borderRadius = '50%';
        assignedNotification.style.width = '20px';
        assignedNotification.style.height = '20px';
        assignedNotification.style.display = 'flex';
        assignedNotification.style.justifyContent = 'center';
        assignedNotification.style.alignItems = 'center';
        assignedNotification.style.fontSize = '12px';

        // Ensure the button has relative positioning to place the notification
        assignedToMeButton.style.position = 'relative';
        assignedToMeButton.appendChild(assignedNotification);
    }

    async function showAssignedModal() {
        if (!currentUser) {
            console.error('No user logged in');
            return;
        }

        const assignedModal = document.getElementById('assigned-modal');
        const assignedItemsList = document.getElementById('assignedItemsList');
        assignedItemsList.innerHTML = ''; // Clear previous content

        try {
            const isAssignedMarkers = markers.filter(marker => marker.assignee)
            const assignedMarkers = isAssignedMarkers.filter(marker => marker.assignee.username === currentUser.username);

            if (assignedMarkers.length === 0) {
                assignedItemsList.innerHTML = '<p>No assigned actions.</p>';
            } else {
                assignedMarkers.forEach(marker => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'assigned-item';
                    itemElement.innerHTML = `
                    <h3>${marker.equipment} - ${marker.form}</h3>
                    <p><strong>Operation:</strong> ${marker.operation}</p>
                    <p><strong>Control:</strong> ${marker.control}</p>
                    <p><strong>Location</strong></br>
                        &emsp;<strong>Lat:</strong> ${marker.location.lat}</br>
                        &emsp;<strong>Lng:</strong> ${marker.location.lng}</p>
                    <p><strong>Distance:</strong> ${haversineDistance([marker.location.lng, marker.location.lat], [userLocation.coords.longitude, userLocation.coords.latitude]).toFixed(2)} km</p>
                    <button class="view-details-btn" data-marker-id="${marker.id}">View Details</button>
                `;
                    assignedItemsList.appendChild(itemElement);
                });

                // Add event listeners to "View Details" buttons
                assignedItemsList.querySelectorAll('.view-details-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const markerId = event.target.getAttribute('data-marker-id');
                        console.log(markerId)
                        const marker = assignedMarkers.find(m => m.id === markerId);
                        if (marker) {
                            showModal(marker);
                        }
                    });
                });
            }

            assignedModal.style.display = 'flex';
            console.log(assignedModal.style.zIndex);
        } catch (error) {
            console.error('Error fetching assigned markers:', error);
            assignedItemsList.innerHTML = '<p>Error loading assigned actions. Please try again later.</p>';
        }
    }

    // Event listener for sign out button
    document.getElementById('signOutButton').addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the default link behavior
        const userMenu = document.getElementById('userMenu');
        const loginButton = document.getElementById('loginButton');

        userMenu.style.display = 'none';
        loginButton.style.display = 'block';
        document.getElementById('assigned-modal').style.display = 'none';

        // Remove the click event listener from the user menu
        userMenu.removeEventListener('click', toggleDropdown);

        // Optionally, clear user session data here if any
        currentUser = null
        updateMarkers()
        showToast('Signed out', "green")
        console.log('User signed out');
    });

    async function validatePassword(userId, password) {
        try {
            const docRef = doc(db, "assignees", userId);
            const docSnap = await getDoc(docRef);
            return docSnap.data().password === password
        } catch (error) {
            console.log(error)
            return false
        }
    }

    // Event listener for the login form
    document.getElementById("login-form").addEventListener("submit", function (event) {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;
        loginUser(username, password);
    });

    // Function to show the login container
    document.getElementById('loginButton').addEventListener('click', function () {
        document.getElementById('login-container').style.display = 'block';
    });

    // Function to close the login container
    document.getElementById('closeLogin').addEventListener('click', function () {
        document.getElementById('login-container').style.display = 'none';
    });

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

    function showModal(marker) {
        const modal = document.createElement('div');
        modal.setAttribute('id', 'landmark-modal');
        Object.assign(modal.style, {
            position: 'fixed',
            top: '60px',
            bottom: '60px',
            left: '0',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            zIndex: '1000',
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
        title.innerText = `${marker.equipment} - ${marker.form}`;
        Object.assign(title.style, {
            margin: '0',
            padding: '20px 0',
            color: '#e55400',
            fontSize: '24px',
            borderBottom: '2px solid #e55400',
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
            <p><strong>Form:</strong> ${marker.form}</p>
            <p><strong>Control:</strong> ${marker.control}</p>
            <p><strong>Control Framework:</strong> ${marker.framework}</p>
            <p><strong>Operating Context:</strong> ${marker.context}</p>
            <p><strong>Equipment:</strong> ${marker.equipment}</p>
            <p><strong>Assignee:</strong> ${marker.assignee ? marker.assignee.name : ''}</p>
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
        openUrlButton.innerText = `Perform ${marker.form}`;
        Object.assign(openUrlButton.style, {
            backgroundColor: '#e55400',
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
        openUrlButton.onmouseover = () => openUrlButton.style.backgroundColor = '#aa3f00';
        openUrlButton.onmouseout = () => openUrlButton.style.backgroundColor = '#e55400';
        openUrlButton.onclick = () => window.open(marker.url, '_blank');
        modal.appendChild(openUrlButton);

        document.body.appendChild(modal);
    }

    async function updateMarkers() {
        markers.forEach((marker, index) => {
            const placeEntity = document.createElement('a-entity');
            placeEntity.setAttribute('gps-entity-place', `latitude: ${marker.location.lat}; longitude: ${marker.location.lng};`);
            placeEntity.setAttribute('look-at', '[gps-camera]');
            placeEntity.setAttribute('scale', '6 6 6');
            placeEntity.setAttribute('class', 'clickable');
            placeEntity.setAttribute('id', `place-${index}`);

            // Changed marker type if assigned
            let textColour
            let markerType

            if (!currentUser) {
                textColour = 'white'
                markerType = 'Shiny Amberis-Amur.glb'
            } else {
                if (marker.assignee && marker.assignee.username === currentUser.username) {
                    textColour = '#e55400'
                    markerType = 'Shiny Amberis-Amur.glb'
                } else {
                    textColour = 'white'
                    markerType = 'Greyed Shiny Amberis-Amur.glb'
                }
            }

            // 3D model that always faces the camera
            const placeModel = document.createElement('a-gltf-model');
            placeModel.setAttribute('src', markerType);
            placeModel.setAttribute('scale', '0.1 0.1 0.1');
            placeModel.setAttribute('look-at', '[gps-camera]');
            placeModel.setAttribute('class', 'clickable');
            placeEntity.appendChild(placeModel);

            // Text for Equipment and Distance
            const textEntity = document.createElement('a-text');
            const distance = haversineDistance([marker.location.lng, marker.location.lat], [userLocation.coords.longitude, userLocation.coords.latitude]).toFixed(2);
            textEntity.setAttribute('value', `${marker.equipment}\n${distance} km`);
            textEntity.setAttribute('color', textColour);
            textEntity.setAttribute('align', 'center');
            textEntity.setAttribute('position', '0 1.5 0');
            textEntity.setAttribute('scale', '1.5 1.5 1.5');
            textEntity.setAttribute('look-at', '[gps-camera]');
            placeEntity.appendChild(textEntity);

            // Invisible hitbox for better click detection
            const hitbox = document.createElement('a-box');
            hitbox.setAttribute('class', 'clickable');
            hitbox.setAttribute('material', `opacity: 0.0`);
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
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        userLocation = position;
        updateMarkers()

    }, (err) => {
        console.error('Error retrieving location', err);
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 27000,
    });
};