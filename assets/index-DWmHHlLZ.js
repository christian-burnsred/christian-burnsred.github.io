import{initializeApp as U}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";import{getFirestore as Y,collection as F,getDocs as R,doc as _,getDoc as V}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";(function(){const g=document.createElement("link").relList;if(g&&g.supports&&g.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))x(l);new MutationObserver(l=>{for(const u of l)if(u.type==="childList")for(const m of u.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&x(m)}).observe(document,{childList:!0,subtree:!0});function y(l){const u={};return l.integrity&&(u.integrity=l.integrity),l.referrerPolicy&&(u.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?u.credentials="include":l.crossOrigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function x(l){if(l.ep)return;l.ep=!0;const u=y(l);fetch(l.href,u)}})();let f=null,C=null,E=null,L;function P(c,g){function y(q){return q*Math.PI/180}const x=c[0],l=c[1],u=g[0],m=g[1],T=6371,A=m-l,O=y(A),k=u-x,h=y(k),S=Math.sin(O/2)*Math.sin(O/2)+Math.cos(y(l))*Math.cos(y(m))*Math.sin(h/2)*Math.sin(h/2),D=2*Math.atan2(Math.sqrt(S),Math.sqrt(1-S));return T*D}window.showModal=function(c){const g=document.createElement("div");g.setAttribute("id","landmark-modal"),Object.assign(g.style,{position:"fixed",top:"60px",bottom:"60px",left:"0",backgroundColor:"rgba(255, 255, 255, 1)",zIndex:"9000",display:"flex",flexDirection:"column",alignItems:"stretch",justifyContent:"flex-start",padding:"20px",boxSizing:"border-box",fontFamily:"Arial, sans-serif",width:"100vw",color:"#333"});const y=document.createElement("div");y.innerHTML="&times;",Object.assign(y.style,{position:"absolute",top:"20px",right:"20px",fontSize:"30px",cursor:"pointer",color:"#666",zIndex:"1"}),y.onclick=()=>document.body.removeChild(g),g.appendChild(y);const x=document.createElement("h2");x.innerText=`${c.equipment} - ${c.form}`,Object.assign(x.style,{margin:"0",padding:"20px 0",color:"#e55400",fontSize:"24px",borderBottom:"2px solid #e55400",position:"sticky",top:"0"}),g.appendChild(x);const l=document.createElement("div");Object.assign(l.style,{flex:"1",overflowY:"auto",padding:"20px 0"}),g.appendChild(l);const u=document.createElement("div");u.innerHTML=`
            <p><strong>Operation:</strong> ${c.operation}</p>
            <p><strong>Form:</strong> ${c.form}</p>
            <p><strong>Control:</strong> ${c.control}</p>
            <p><strong>Control Framework:</strong> ${c.framework}</p>
            <p><strong>Operating Context:</strong> ${c.context}</p>
            <p><strong>Equipment:</strong> ${c.equipment}</p>
            <p><strong>Assignee:</strong> ${c.assignee?c.assignee.name:""}</p>
            <p><strong>Location</strong></br>
                &emsp;<strong>Lat:</strong> ${c.location.lat}</br>
                &emsp;<strong>Lng:</strong> ${c.location.lng}</p>
            <p><strong>Distance:</strong> ${P([c.location.lng,c.location.lat],[f.coords.longitude,f.coords.latitude]).toFixed(2)} km</p>
        `,Object.assign(u.style,{marginBottom:"20px",lineHeight:"1.6",fontSize:"16px"}),l.appendChild(u);const m=document.createElement("button");m.innerText=`Perform ${c.form}`,Object.assign(m.style,{backgroundColor:"#e55400",color:"white",border:"none",padding:"12px 24px",borderRadius:"5px",cursor:"pointer",fontSize:"16px",transition:"background-color 0.3s",width:"100%",marginBottom:"20px"}),m.onmouseover=()=>m.style.backgroundColor="#aa3f00",m.onmouseout=()=>m.style.backgroundColor="#e55400",m.onclick=()=>window.open(c.url,"_blank"),g.appendChild(m),document.body.appendChild(g)};window.onload=async()=>{const g=U({apiKey:"AIzaSyAKJ_MIyMk1dIgJYVYP25A2HSFQySsB04g",authDomain:"ccc-data-store.firebaseapp.com",projectId:"ccc-data-store",storageBucket:"ccc-data-store.appspot.com",messagingSenderId:"1084448372624",appId:"1:1084448372624:web:7461eb99124e29f9346515",measurementId:"G-YYC20JLCP7"}),y=Y(g),x=F(y,"markers"),l=F(y,"assignees");C=await T();function u(){const n=document.getElementById("compass"),e=n.getContext("2d");let i=0;function t(a){const s=n.width,o=n.height,p={x:s/2,y:o/2},w=Math.min(s,o)/2-10;e.clearRect(0,0,s,o),e.save(),e.translate(p.x,p.y),e.rotate(-a*Math.PI/180),e.beginPath(),e.moveTo(0,-w+15),e.lineTo(-8,0),e.lineTo(8,0),e.closePath(),e.fillStyle="#e55400",e.fill(),e.beginPath(),e.moveTo(0,w-15),e.lineTo(-6,0),e.lineTo(6,0),e.closePath(),e.fillStyle="white",e.fill(),e.fillStyle="white",e.font="16px Arial",e.textAlign="center",e.textBaseline="middle",e.fillStyle="#e55400",e.fillText("N",0,-w+5),e.restore()}function r(a){i=a.alpha||0,t(i)}function d(a){a.webkitCompassHeading?i=a.webkitCompassHeading:i=360-a.alpha,t(i)}t(0),window.testCompassRotation=function(a){i=(i+a)%360,i<0&&(i+=360),t(i)},window.DeviceOrientationEvent?("ondeviceorientationabsolute"in window?(console.log("Absolute orientation is supported"),window.addEventListener("deviceorientationabsolute",r)):(console.log("Using relative orientation"),window.addEventListener("deviceorientation",d)),typeof DeviceOrientationEvent.requestPermission=="function"&&document.getElementById("compass-container").addEventListener("click",async()=>{try{await DeviceOrientationEvent.requestPermission()==="granted"&&("ondeviceorientationabsolute"in window?window.addEventListener("deviceorientationabsolute",r):window.addEventListener("deviceorientation",d))}catch(a){console.error("Error requesting device orientation permission:",a)}})):(console.log("Device orientation not supported"),document.getElementById("compass-container").style.display="none"),window.addEventListener("resize",()=>{t(i)})}u();async function m(){try{const n=await R(l),e=[];return n.forEach(i=>{e.push({id:i.id,...i.data()})}),console.log("User List:",e),e}catch(n){return console.error("Error reading document: ",n),[]}}async function T(){try{const n=await R(x),e=[];return n.forEach(i=>{e.push({id:i.id,...i.data()})}),console.log("Markers List:",e),e}catch(n){return console.error("Error reading document: ",n),[]}}document.getElementById("loginButton").addEventListener("click",function(){const n=document.getElementById("login-container");n&&(n.style.display="block")}),document.getElementById("assignedToMeButton").addEventListener("click",function(n){const e=document.getElementById("landmark-modal");e!==null&&e.style.display!=="none"&&(e.style.display="none"),n.preventDefault(),D()}),document.getElementById("closeAssignedModal").addEventListener("click",function(){document.getElementById("assigned-modal").style.display="none",window.DeviceOrientationEvent&&(window.removeEventListener("deviceorientationabsolute",handleOrientation),window.removeEventListener("deviceorientation",handleOrientation))});function A(n,e){const i=document.getElementById("toast-container"),t=document.createElement("div");t.textContent=n,t.style.background=e,t.style.color="#fff",t.style.padding="10px 20px",t.style.marginTop="65px",t.style.borderRadius="5px",t.style.fontSize="16px",t.style.textAlign="center",t.style.minWidth="200px",i.appendChild(t),setTimeout(()=>{t.remove()},3e3)}async function O(n,e){try{const t=(await m()).find(r=>r.username===n);t?await q(t.id,e)?(console.log("Login successful"),A("Logged in as "+t.name,"green"),S(t)):A("Invalid password","red"):A("User not found","red")}catch(i){A("An error occurred during login","red"),console.error("Login error:",i)}}function k(){const n=document.getElementById("userMenu");n.querySelector(".dropdown-menu").classList.toggle("active"),n.classList.toggle("active")}let h=null;function S(n){h=n;const e=document.getElementById("userMenu"),i=document.getElementById("userName"),t=document.getElementById("loginButton"),r=document.getElementById("login-container");r.style.display="none",i.textContent=n.name,e.style.display="block",t.style.display="none",e.addEventListener("click",k),z();const a=C.filter(p=>p.assignee&&p.assignee.username===h.username).length;j();const s=document.createElement("span");s.setAttribute("id","notificationCircle"),s.textContent=a,s.style.position="absolute",s.style.top="0px",s.style.left="-23px",s.style.backgroundColor="#ff0000",s.style.color="#fff",s.style.borderRadius="50%",s.style.width="20px",s.style.height="20px",s.style.display="flex",s.style.justifyContent="center",s.style.alignItems="center",s.style.fontSize="12px",i.style.position="relative",i.appendChild(s);const o=document.createElement("span");o.setAttribute("id","assignedNotification"),o.textContent=a,o.style.position="absolute",o.style.top="50%",o.style.transform="translateY(-50%)",o.style.right="10px",o.style.backgroundColor="#ff0000",o.style.color="#fff",o.style.borderRadius="50%",o.style.width="20px",o.style.height="20px",o.style.display="flex",o.style.justifyContent="center",o.style.alignItems="center",o.style.fontSize="12px",assignedToMeButton.style.position="relative",assignedToMeButton.appendChild(o)}async function D(){if(!h){console.error("No user logged in");return}const n=document.getElementById("assigned-modal"),e=document.getElementById("assignedItemsList");e.innerHTML="";function i(){return`
            <svg viewBox="0 0 24 24">
                <path d="M12 2L18 8H6L12 2Z" 
                      fill="#e55400" 
                      stroke="#e55400" 
                      stroke-width="2"/>
            </svg>
        `}function t(d,a,s,o){const p=H=>H*Math.PI/180,w=H=>H*180/Math.PI,I=p(o-a),b=p(d),M=p(s),v=Math.sin(I)*Math.cos(M),$=Math.cos(b)*Math.sin(M)-Math.sin(b)*Math.cos(M)*Math.cos(I);return(w(Math.atan2(v,$))+360)%360}function r(){document.querySelectorAll(".direction-arrow").forEach(a=>{var b,M,v;const s=parseFloat(a.dataset.targetLat),o=parseFloat(a.dataset.targetLng),p=t(f.coords.latitude,f.coords.longitude,s,o);let w=((b=window.deviceOrientation)==null?void 0:b.alpha)||0;((M=window.deviceOrientation)==null?void 0:M.webkitCompassHeading)!==void 0?w=window.deviceOrientation.webkitCompassHeading:((v=window.deviceOrientation)==null?void 0:v.alpha)!==void 0&&(w=360-window.deviceOrientation.alpha);const I=(p-w+360)%360;a.style.transform=`rotate(${I}deg)`})}try{const a=C.filter(s=>s.assignee).filter(s=>s.assignee.username===h.username);if(a.length===0)e.innerHTML="<p>No assigned actions.</p>";else{let s=function(o){window.deviceOrientation=o,r()};a.forEach(o=>{const p=document.createElement("div");p.className="assigned-item",p.innerHTML=`
                    <div style="display: flex; align-items: start; justify-content: space-between;">
                        <div style="flex-grow: 1;">
                            <h3>${o.equipment} - ${o.form}</h3>
                            <p><strong>Operation:</strong> ${o.operation}</p>
                            <p><strong>Control:</strong> ${o.control}</p>
                            <p><strong>Location</strong></br>
                                &emsp;<strong>Lat:</strong> ${o.location.lat}</br>
                                &emsp;<strong>Lng:</strong> ${o.location.lng}</p>
                            <p><strong>Distance:</strong> ${P([o.location.lng,o.location.lat],[f.coords.longitude,f.coords.latitude]).toFixed(2)} km</p>
                            <button class="view-details-btn" data-marker-id="${o.id}">View Details</button>
                        </div>
                        <div class="direction-arrow" 
                             data-target-lat="${o.location.lat}"
                             data-target-lng="${o.location.lng}">
                            ${i()}
                        </div>
                    </div>
                `,e.appendChild(p)}),window.deviceOrientation={},window.DeviceOrientationEvent&&("ondeviceorientationabsolute"in window?window.addEventListener("deviceorientationabsolute",s):window.addEventListener("deviceorientation",s),typeof DeviceOrientationEvent.requestPermission=="function"&&DeviceOrientationEvent.requestPermission().then(o=>{o==="granted"&&window.addEventListener("deviceorientation",s)}).catch(console.error)),r()}n.style.display="flex"}catch(d){console.error("Error fetching assigned markers:",d),e.innerHTML="<p>Error loading assigned actions. Please try again later.</p>"}}document.addEventListener("click",n=>{if(n.target&&n.target.classList.contains("view-details-btn")){const e=n.target.getAttribute("data-marker-id"),i=C.find(t=>t.id===e);showModal(i)}}),document.getElementById("signOutButton").addEventListener("click",n=>{n.preventDefault();const e=document.getElementById("userMenu"),i=document.getElementById("loginButton");e.style.display="none",i.style.display="block",document.getElementById("assigned-modal").style.display="none",e.removeEventListener("click",k),h=null,z(),j(),A("Signed out","green"),console.log("User signed out")});async function q(n,e){try{const i=_(y,"assignees",n);return(await V(i)).data().password===e}catch(i){return console.log(i),!1}}document.getElementById("login-form").addEventListener("submit",function(n){n.preventDefault();const e=n.target.username.value,i=n.target.password.value;O(e,i)}),document.getElementById("loginButton").addEventListener("click",function(){document.getElementById("login-container").style.display="block"}),document.getElementById("closeLogin").addEventListener("click",function(){document.getElementById("login-container").style.display="none"});const N=document.querySelector("a-scene"),B=document.createElement("a-entity");B.setAttribute("cursor","rayOrigin: mouse; fuse: false;"),B.setAttribute("raycaster","objects: a-box, a-gltf-model"),B.setAttribute("raycaster","ignore: [canvas]"),B.setAttribute("raycaster","objects: .clickable; showLine: true;"),N.camera.el.appendChild(B);async function z(){document.querySelectorAll('a-entity[id^="place-"]').forEach(e=>{e.parentNode.removeChild(e)}),C.forEach((e,i)=>{const t=document.createElement("a-entity");t.setAttribute("gps-entity-place",`latitude: ${e.location.lat}; longitude: ${e.location.lng};`),t.setAttribute("look-at","[gps-camera]"),t.setAttribute("scale","6 6 6"),t.setAttribute("class","clickable"),t.setAttribute("id",`place-${i}`);let r,d;h?e.assignee&&e.assignee.username===h.username?(r="#e55400",d="Shiny Amberis-Amur.glb"):(r="white",d="Greyed Shiny Amberis-Amur.glb"):(r="white",d="Shiny Amberis-Amur.glb");const a=document.createElement("a-entity");a.setAttribute("animation__bob",{property:"position",dir:"alternate",dur:2e3,from:"0 0 0",to:"0 0.3 0",loop:!0,easing:"easeInOutSine"});const s=document.createElement("a-gltf-model");s.setAttribute("src",d),s.setAttribute("scale","0.1 0.1 0.1"),s.setAttribute("class","clickable");let o=0,p=1;const w=Math.PI/16,I=.005;s.addEventListener("model-loaded",()=>{function $(){o+=I*p,Math.abs(o)>=w&&(p*=-1),s.object3D.rotation.y=o,requestAnimationFrame($)}$()}),a.appendChild(s),t.appendChild(a);const b=document.createElement("a-text"),M=P([e.location.lng,e.location.lat],[f.coords.longitude,f.coords.latitude]).toFixed(2);b.setAttribute("value",`${e.form}
${e.equipment}
${M} km`),b.setAttribute("color",r),b.setAttribute("align","center"),b.setAttribute("position","0 1.5 0"),b.setAttribute("scale","1.5 1.5 1.5"),b.setAttribute("look-at","[gps-camera]"),b.setAttribute("animation__bob",{property:"position",dir:"alternate",dur:2e3,from:"0 1.5 0",to:"0 1.8 0",loop:!0,easing:"easeInOutSine"}),t.appendChild(b);const v=document.createElement("a-box");v.setAttribute("class","clickable"),v.setAttribute("material","opacity: 0.0"),v.setAttribute("scale","2 2 0"),v.setAttribute("position","0 0 0"),v.setAttribute("animation__bob",{property:"position",dir:"alternate",dur:2e3,from:"0 0 0",to:"0 0.15 0",loop:!0,easing:"easeInOutSine"}),t.appendChild(v),t.addEventListener("click",function(){showModal(e)}),N.appendChild(t)})}async function j(){let n=!1,e=null;E&&E.remove(),E=document.createElement("div"),E.className="user-marker",E.style.backgroundColor="blue",E.style.width="15px",E.style.height="15px",E.style.borderRadius="50%",E.style.boxShadow="0 0 10px rgba(0, 0, 255, 0.9)",new mapboxgl.Marker(E).setLngLat([f.coords.longitude,f.coords.latitude]).addTo(L),C.forEach(r=>{const d=new mapboxgl.Popup({closeButton:!1,closeOnClick:!0}).setHTML(`
            <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0;">${r.equipment} - ${r.form}</h3>
                <p style="margin: 0;"><strong>Distance:</strong> 
                    ${P([r.location.lng,r.location.lat],[f.coords.longitude,f.coords.latitude]).toFixed(2)} km
                </p>
                <button class="view-details-btn" data-marker-id="${r.id}">View Details</button>
            </div>
        `);let a;h?r.assignee&&r.assignee.username===h.username?a=new mapboxgl.Marker({color:"orange"}).setLngLat([r.location.lng,r.location.lat]).setPopup(d).addTo(L):a=new mapboxgl.Marker({color:"grey"}).setLngLat([r.location.lng,r.location.lat]).setPopup(d).addTo(L):a=new mapboxgl.Marker({color:"orange"}).setLngLat([r.location.lng,r.location.lat]).setPopup(d).addTo(L),a.getElement().addEventListener("click",o=>{if(!n){o.stopPropagation(),i.classList.add("expanded"),t.style.display="block",n=!0,L.resize();return}e&&e.remove(),e=d,d.addTo(L)})});const i=document.getElementById("map"),t=document.getElementById("close-map");t.style.position="absolute",t.style.top="calc(100vh - 60px - 40vh)",t.style.right="2vw",t.style.padding="8px",t.style.border="none",t.style.borderRadius="4px",t.style.cursor="pointer",t.style.display="none",t.innerHTML='<i class="bi bi-arrows-angle-contract"></i>',i.addEventListener("click",()=>{n||(i.classList.add("expanded"),t.style.display="block",n=!0,L.resize())}),t.addEventListener("click",r=>{r.stopPropagation(),i.classList.remove("expanded"),t.style.display="none",n=!1,e&&(e.remove(),e=null),L.resize()})}navigator.geolocation.getCurrentPosition(async n=>{f=n,z(),mapboxgl.accessToken="pk.eyJ1IjoiY2hyaXN0aWFuLWJ1cm5zcmVkIiwiYSI6ImNtMjltczVwajA3Z2IyaXBzZGlqNXhtaWkifQ.9FC3d6uBtpOL5sn-LlRoaw",L=new mapboxgl.Map({container:"map",style:"mapbox://styles/mapbox/streets-v12",center:[f.coords.longitude,f.coords.latitude],zoom:15}),j()},n=>{console.error("Error retrieving location",n)},{enableHighAccuracy:!0,maximumAge:0,timeout:27e3})};