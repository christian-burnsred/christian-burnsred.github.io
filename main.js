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
let map;

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

window.showModal = function (marker) {
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
};

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

    function initCompass() {
        const canvas = document.getElementById('compass');
        const ctx = canvas.getContext('2d')
        // const debugElement = document.getElementById('compass-debug');
        let heading = 0;

        function drawCompass(heading) {
            const width = canvas.width;
            const height = canvas.height;
            const center = {x: width / 2, y: height / 2};
            const radius = Math.min(width, height) / 2 - 10;

            // // Update debug info
            // debugElement.innerHTML = `
            //     Heading: ${heading.toFixed(1)}°
            //     <br>Sensor: ${window.DeviceOrientationEvent ? 'Available' : 'Not Available'}
            //     <br>Absolute: ${'ondeviceorientationabsolute' in window ? 'Yes' : 'No'}
            // `;


            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Draw cardinal points
            ctx.save();
            ctx.translate(center.x, center.y);
            ctx.rotate(-heading * Math.PI / 180);

            // North pointer (red)
            ctx.beginPath();
            ctx.moveTo(0, -radius + 15);
            ctx.lineTo(-8, 0);
            ctx.lineTo(8, 0);
            ctx.closePath();
            ctx.fillStyle = '#e55400';
            ctx.fill();

            // South pointer (white)
            ctx.beginPath();
            ctx.moveTo(0, radius - 15);
            ctx.lineTo(-6, 0);
            ctx.lineTo(6, 0);
            ctx.closePath();
            ctx.fillStyle = 'white';
            ctx.fill();

            // Draw cardinal letters
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // N
            ctx.fillStyle = '#e55400';
            ctx.fillText('N', 0, -radius + 5);

            ctx.restore();
        }

        function handleOrientationAbsolute(event) {
            heading = event.alpha || 0;
            drawCompass(heading);
        }

        function handleOrientation(event) {
            if (event.webkitCompassHeading) {
                // iOS devices
                heading = event.webkitCompassHeading;
            } else {
                // Android devices
                heading = 360 - event.alpha;
            }
            drawCompass(heading);
        }

        // Initial draw
        drawCompass(0);

        // // Add manual controls for testing
        // // TODO - manual testing controls
        // const testControls = document.createElement('div');
        // testControls.innerHTML = `
        //     <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 4px; z-index: 1000;">
        //         <button onclick="window.testCompassRotation(-10)">←</button>
        //         <button onclick="window.testCompassRotation(10)">→</button>
        //     </div>
        // `;
        // document.body.appendChild(testControls);

        // Add test rotation function to window
        window.testCompassRotation = function (degrees) {
            heading = (heading + degrees) % 360;
            if (heading < 0) heading += 360;
            drawCompass(heading);
        };

        // Check if device orientation is supported
        if (window.DeviceOrientationEvent) {
            if ('ondeviceorientationabsolute' in window) {
                console.log('Absolute orientation is supported');
                window.addEventListener('deviceorientationabsolute', handleOrientationAbsolute);
            } else {
                console.log('Using relative orientation');
                window.addEventListener('deviceorientation', handleOrientation);
            }

            // Request permission for iOS devices
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                document.getElementById('compass-container').addEventListener('click', async () => {
                    try {
                        const permission = await DeviceOrientationEvent.requestPermission();
                        if (permission === 'granted') {
                            if ('ondeviceorientationabsolute' in window) {
                                window.addEventListener('deviceorientationabsolute', handleOrientationAbsolute);
                            } else {
                                window.addEventListener('deviceorientation', handleOrientation);
                            }
                        }
                    } catch (error) {
                        console.error('Error requesting device orientation permission:', error);
                    }
                });
            }
        } else {
            console.log('Device orientation not supported');
            document.getElementById('compass-container').style.display = 'none';
        }

        // Add resize handler
        window.addEventListener('resize', () => {
            drawCompass(heading);
        });
    }

    initCompass();

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
        const checkModal = document.getElementById('landmark-modal')
        if (checkModal !== null && checkModal.style.display !== 'none') {
            checkModal.style.display = 'none'
        }

        event.preventDefault();
        showAssignedModal();
    });

    document.getElementById('closeAssignedModal').addEventListener('click', function () {
        document.getElementById('assigned-modal').style.display = 'none';

        // Remove orientation event listeners
        if (window.DeviceOrientationEvent) {
            window.removeEventListener('deviceorientationabsolute', handleOrientation);
            window.removeEventListener('deviceorientation', handleOrientation);
        }
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

        updateMap()

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

        // Center align notification vertically on the right side of the button
        assignedNotification.style.top = '50%';
        assignedNotification.style.transform = 'translateY(-50%)';
        assignedNotification.style.right = '10px';
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
        assignedItemsList.innerHTML = '';

        function createArrowSVG() {
            return `
            <svg viewBox="0 0 24 24">
                <path d="M12 2L18 8H6L12 2Z" 
                      fill="#e55400" 
                      stroke="#e55400" 
                      stroke-width="2"/>
            </svg>
        `;
        }

        function calculateBearing(userLat, userLng, targetLat, targetLng) {
            const toRad = deg => deg * Math.PI / 180;
            const toDeg = rad => rad * 180 / Math.PI;

            const dLon = toRad(targetLng - userLng);
            const lat1 = toRad(userLat);
            const lat2 = toRad(targetLat);

            const y = Math.sin(dLon) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

            return (toDeg(Math.atan2(y, x)) + 360) % 360;
        }

        function updateArrows() {
            const arrows = document.querySelectorAll('.direction-arrow');
            arrows.forEach(arrow => {
                const targetLat = parseFloat(arrow.dataset.targetLat);
                const targetLng = parseFloat(arrow.dataset.targetLng);
                const bearing = calculateBearing(
                    userLocation.coords.latitude,
                    userLocation.coords.longitude,
                    targetLat,
                    targetLng
                );

                // Get device heading
                let heading = window.deviceOrientation?.alpha || 0;
                if (window.deviceOrientation?.webkitCompassHeading !== undefined) {
                    heading = window.deviceOrientation.webkitCompassHeading;
                } else if (window.deviceOrientation?.alpha !== undefined) {
                    heading = 360 - window.deviceOrientation.alpha;
                }

                // Calculate final rotation
                const rotation = (bearing - heading + 360) % 360;
                arrow.style.transform = `rotate(${rotation}deg)`;
            });
        }

        try {
            const isAssignedMarkers = markers.filter(marker => marker.assignee);
            const assignedMarkers = isAssignedMarkers.filter(marker =>
                marker.assignee.username === currentUser.username
            );

            if (assignedMarkers.length === 0) {
                assignedItemsList.innerHTML = '<p>No assigned actions.</p>';
            } else {
                assignedMarkers.forEach(marker => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'assigned-item';

                    // Create flex container for content and arrow
                    itemElement.innerHTML = `
                    <div style="display: flex; align-items: start; justify-content: space-between;">
                        <div style="flex-grow: 1;">
                            <h3>${marker.equipment} - ${marker.form}</h3>
                            <p><strong>Operation:</strong> ${marker.operation}</p>
                            <p><strong>Control:</strong> ${marker.control}</p>
                            <p><strong>Location</strong></br>
                                &emsp;<strong>Lat:</strong> ${marker.location.lat}</br>
                                &emsp;<strong>Lng:</strong> ${marker.location.lng}</p>
                            <p><strong>Distance:</strong> ${haversineDistance(
                        [marker.location.lng, marker.location.lat],
                        [userLocation.coords.longitude, userLocation.coords.latitude]
                    ).toFixed(2)} km</p>
                            <button class="view-details-btn" data-marker-id="${marker.id}">View Details</button>
                        </div>
                        <div class="direction-arrow" 
                             data-target-lat="${marker.location.lat}"
                             data-target-lng="${marker.location.lng}">
                            ${createArrowSVG()}
                        </div>
                    </div>
                `;

                    assignedItemsList.appendChild(itemElement);
                });

                // Set up device orientation handling
                window.deviceOrientation = {};

                function handleOrientation(event) {
                    window.deviceOrientation = event;
                    updateArrows();
                }

                if (window.DeviceOrientationEvent) {
                    if ('ondeviceorientationabsolute' in window) {
                        window.addEventListener('deviceorientationabsolute', handleOrientation);
                    } else {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }

                    // Request permission for iOS devices
                    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                        DeviceOrientationEvent.requestPermission()
                            .then(permission => {
                                if (permission === 'granted') {
                                    window.addEventListener('deviceorientation', handleOrientation);
                                }
                            })
                            .catch(console.error);
                    }
                }

                // Initial arrow update
                updateArrows();
            }

            assignedModal.style.display = 'flex';
        } catch (error) {
            console.error('Error fetching assigned markers:', error);
            assignedItemsList.innerHTML = '<p>Error loading assigned actions. Please try again later.</p>';
        }
    }

    document.addEventListener('click', (event) => {
        if (event.target && event.target.classList.contains('view-details-btn')) {
            const markerId = event.target.getAttribute('data-marker-id');
            const markerData = markers.find(m => m.id === markerId);
            showModal(markerData); // Pass the marker data to the showModal function
        }
    });

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
        updateMap()
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

    async function updateMarkers() {
        // Remove all existing markers
        const existingMarkers = document.querySelectorAll('a-entity[id^="place-"]');
        existingMarkers.forEach(marker => {
            marker.parentNode.removeChild(marker);
        });

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

            // Create container for bobbing animation
            const modelContainer = document.createElement('a-entity');
            modelContainer.setAttribute('animation__bob', {
                property: 'position',
                dir: 'alternate',
                dur: 2000,
                from: '0 0 0',
                to: '0 0.3 0',
                loop: true,
                easing: 'easeInOutSine'
            });

            // 3D model that always faces the camera
            const placeModel = document.createElement('a-gltf-model');
            placeModel.setAttribute('src', markerType);
            placeModel.setAttribute('scale', '0.1 0.1 0.1');
            placeModel.setAttribute('class', 'clickable');

            // Set up rotation animation using JavaScript
            let rotationAngle = 0;
            let rotationDirection = 1;
            const maxRotation = Math.PI / 16; // About 11.25 degrees
            const rotationSpeed = 0.005;

            // Wait for model to load before starting rotation
            placeModel.addEventListener('model-loaded', () => {
                function animateRotation() {
                    rotationAngle += rotationSpeed * rotationDirection;

                    // Change direction when reaching limits
                    if (Math.abs(rotationAngle) >= maxRotation) {
                        rotationDirection *= -1;
                    }

                    // Apply rotation
                    placeModel.object3D.rotation.y = rotationAngle;

                    // Continue animation loop
                    requestAnimationFrame(animateRotation);
                }

                // Start the animation loop
                animateRotation();
            });

            modelContainer.appendChild(placeModel);
            placeEntity.appendChild(modelContainer);

            // Text for Equipment and Distance
            const textEntity = document.createElement('a-text');
            const distance = haversineDistance([marker.location.lng, marker.location.lat], [userLocation.coords.longitude, userLocation.coords.latitude]).toFixed(2);
            textEntity.setAttribute('value', `${marker.form}\n${marker.equipment}\n${distance} km`);
            textEntity.setAttribute('color', textColour);
            textEntity.setAttribute('align', 'center');
            textEntity.setAttribute('position', '0 1.5 0');
            textEntity.setAttribute('scale', '1.5 1.5 1.5');
            textEntity.setAttribute('look-at', '[gps-camera]');
            textEntity.setAttribute('animation__bob', {
                property: 'position',
                dir: 'alternate',
                dur: 2000,
                from: '0 1.5 0',
                to: '0 1.8 0',
                loop: true,
                easing: 'easeInOutSine'
            });
            placeEntity.appendChild(textEntity);

            // Invisible hitbox for better click detection
            const hitbox = document.createElement('a-box');
            hitbox.setAttribute('class', 'clickable');
            hitbox.setAttribute('material', `opacity: 0.0`);
            hitbox.setAttribute('scale', '2 2 0');
            hitbox.setAttribute('position', '0 0 0');
            hitbox.setAttribute('animation__bob', {
                property: 'position',
                dir: 'alternate',
                dur: 2000,
                from: '0 0 0',
                to: '0 0.15 0',
                loop: true,
                easing: 'easeInOutSine'
            });
            placeEntity.appendChild(hitbox);

            // Add click listener
            placeEntity.addEventListener('click', function () {
                // console.log(`Clicked on ${marker.equipment}`);
                showModal(marker);
            });
            scene.appendChild(placeEntity);
        });
    }

    async function updateMap() {
        let isMapExpanded = false;
        let currentPopup = null;

        // Add a solid blue dot for the user's location
        const userMarkerElement = document.createElement('div');
        userMarkerElement.className = 'user-marker';
        userMarkerElement.style.backgroundColor = 'blue'; // Solid blue color
        userMarkerElement.style.width = '15px'; // Adjust size
        userMarkerElement.style.height = '15px'; // Adjust size
        userMarkerElement.style.borderRadius = '50%'; // Make it circular
        userMarkerElement.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.9)';

        // Create the user marker and add it to the map
        new mapboxgl.Marker(userMarkerElement)
            .setLngLat([userLocation.coords.longitude, userLocation.coords.latitude])
            .addTo(map);

        // Add markers to the map with popups
        markers.forEach(marker => {
            // Create popup
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: true
            }).setHTML(`
            <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0;">${marker.equipment} - ${marker.form}</h3>
                <p style="margin: 0;"><strong>Distance:</strong> 
                    ${haversineDistance(
                [marker.location.lng, marker.location.lat],
                [userLocation.coords.longitude, userLocation.coords.latitude]
            ).toFixed(2)} km
                </p>
                <button class="view-details-btn" data-marker-id="${marker.id}">View Details</button>
            </div>
        `);

            // Create marker
            let mapMarker;

            if (!currentUser) {
                mapMarker = new mapboxgl.Marker({color: 'orange'})
                    .setLngLat([marker.location.lng, marker.location.lat])
                    .setPopup(popup)
                    .addTo(map);
            } else {
                if (!(marker.assignee && marker.assignee.username === currentUser.username)) {
                    mapMarker = new mapboxgl.Marker({color: 'grey'})
                        .setLngLat([marker.location.lng, marker.location.lat])
                        .setPopup(popup)
                        .addTo(map);
                } else {
                    mapMarker = new mapboxgl.Marker({color: 'orange'})
                        .setLngLat([marker.location.lng, marker.location.lat])
                        .setPopup(popup)
                        .addTo(map);
                }
            }

            // Add click event listener that only works when map is expanded
            const markerElement = mapMarker.getElement();
            markerElement.addEventListener('click', (e) => {
                if (!isMapExpanded) {
                    e.stopPropagation();
                    mapDiv.classList.add('expanded');
                    closeButton.style.display = 'block';
                    isMapExpanded = true;
                    map.resize();
                    return;
                }
                // Show the popup and trigger the modal
                if (currentPopup){
                    currentPopup.remove();
                }
                currentPopup = popup;
                popup.addTo(map);
            });
        });

        // Handle click to expand the map
        const mapDiv = document.getElementById('map');
        const closeButton = document.getElementById('close-map');

        // Style the close button
        closeButton.style.position = 'absolute';
        closeButton.style.top = 'calc(100vh - 60px - 40vh)';
        closeButton.style.right = '2vw';
        closeButton.style.padding = '8px';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '4px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.display = 'none';
        closeButton.innerHTML = '<i class="bi bi-arrows-angle-contract"></i>';

        // Toggle map expansion
        mapDiv.addEventListener('click', () => {
            if (!isMapExpanded) {
                mapDiv.classList.add('expanded');
                closeButton.style.display = 'block';
                isMapExpanded = true;
                map.resize(); // Ensure map renders correctly at new size
            }
        });

        // Close map when clicking the close button
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            mapDiv.classList.remove('expanded');
            closeButton.style.display = 'none';
            isMapExpanded = false;

            if (currentPopup) {
                currentPopup.remove();
                currentPopup = null; // Reset the popup reference
            }

            map.resize();
        });
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        userLocation = position;
        updateMarkers()

        // Initialize Mapbox map
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [userLocation.coords.longitude, userLocation.coords.latitude], // Initial map center
            zoom: 15 // Initial zoom level
        });

        updateMap()

    }, (err) => {
        console.error('Error retrieving location', err);
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 27000,
    });
};