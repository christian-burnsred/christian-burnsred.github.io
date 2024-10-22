import{initializeApp as N}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";import{getFirestore as F,collection as O,getDocs as D,doc as H,getDoc as R}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";(function(){const f=document.createElement("link").relList;if(f&&f.supports&&f.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))A(l);new MutationObserver(l=>{for(const d of l)if(d.type==="childList")for(const h of d.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&A(h)}).observe(document,{childList:!0,subtree:!0});function b(l){const d={};return l.integrity&&(d.integrity=l.integrity),l.referrerPolicy&&(d.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?d.credentials="include":l.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function A(l){if(l.ep)return;l.ep=!0;const d=b(l);fetch(l.href,d)}})();let y=null,I=null;window.onload=async()=>{const f=N({apiKey:"AIzaSyAKJ_MIyMk1dIgJYVYP25A2HSFQySsB04g",authDomain:"ccc-data-store.firebaseapp.com",projectId:"ccc-data-store",storageBucket:"ccc-data-store.appspot.com",messagingSenderId:"1084448372624",appId:"1:1084448372624:web:7461eb99124e29f9346515",measurementId:"G-YYC20JLCP7"}),b=F(f),A=O(b,"markers"),l=O(b,"assignees");I=await h();async function d(){try{const e=await D(l),t=[];return e.forEach(o=>{t.push({id:o.id,...o.data()})}),console.log("User List:",t),t}catch(e){return console.error("Error reading document: ",e),[]}}async function h(){try{const e=await D(A),t=[];return e.forEach(o=>{t.push({id:o.id,...o.data()})}),console.log("Markers List:",t),t}catch(e){return console.error("Error reading document: ",e),[]}}document.getElementById("loginButton").addEventListener("click",function(){const e=document.getElementById("login-container");e&&(e.style.display="block")}),document.getElementById("assignedToMeButton").addEventListener("click",function(e){e.preventDefault(),j()}),document.getElementById("closeAssignedModal").addEventListener("click",function(){document.getElementById("assigned-modal").style.display="none"});function x(e,t){const o=document.getElementById("toast-container"),n=document.createElement("div");n.textContent=e,n.style.background=t,n.style.color="#fff",n.style.padding="10px 20px",n.style.marginTop="65px",n.style.borderRadius="5px",n.style.fontSize="16px",n.style.textAlign="center",n.style.minWidth="200px",o.appendChild(n),setTimeout(()=>{n.remove()},3e3)}async function T(e,t){try{const n=(await d()).find(s=>s.username===e);n?await z(n.id,t)?(console.log("Login successful"),x("Logged in as "+n.name,"green"),q(n)):x("Invalid password","red"):x("User not found","red")}catch(o){x("An error occurred during login","red"),console.error("Login error:",o)}}function B(){const e=document.getElementById("userMenu");e.querySelector(".dropdown-menu").classList.toggle("active"),e.classList.toggle("active")}let m=null;function q(e){m=e;const t=document.getElementById("userMenu"),o=document.getElementById("userName"),n=document.getElementById("loginButton"),s=document.getElementById("login-container");s.style.display="none",o.textContent=e.name,t.style.display="block",n.style.display="none",t.addEventListener("click",B),M();const a=I.filter(g=>g.assignee&&g.assignee.username===m.username).length,i=document.createElement("span");i.setAttribute("id","notificationCircle"),i.textContent=a,i.style.position="absolute",i.style.top="0px",i.style.left="-23px",i.style.backgroundColor="#ff0000",i.style.color="#fff",i.style.borderRadius="50%",i.style.width="20px",i.style.height="20px",i.style.display="flex",i.style.justifyContent="center",i.style.alignItems="center",i.style.fontSize="12px",o.style.position="relative",o.appendChild(i);const r=document.createElement("span");r.setAttribute("id","assignedNotification"),r.textContent=a,r.style.position="absolute",r.style.top="18px",r.style.right="4px",r.style.backgroundColor="#ff0000",r.style.color="#fff",r.style.borderRadius="50%",r.style.width="20px",r.style.height="20px",r.style.display="flex",r.style.justifyContent="center",r.style.alignItems="center",r.style.fontSize="12px",assignedToMeButton.style.position="relative",assignedToMeButton.appendChild(r)}async function j(){if(!m){console.error("No user logged in");return}const e=document.getElementById("assigned-modal"),t=document.getElementById("assignedItemsList");t.innerHTML="";try{const n=I.filter(s=>s.assignee).filter(s=>s.assignee.username===m.username);n.length===0?t.innerHTML="<p>No assigned actions.</p>":(n.forEach(s=>{const c=document.createElement("div");c.className="assigned-item",c.innerHTML=`
                    <h3>${s.equipment} - ${s.form}</h3>
                    <p><strong>Operation:</strong> ${s.operation}</p>
                    <p><strong>Control:</strong> ${s.control}</p>
                    <p><strong>Location</strong></br>
                        &emsp;<strong>Lat:</strong> ${s.location.lat}</br>
                        &emsp;<strong>Lng:</strong> ${s.location.lng}</p>
                    <p><strong>Distance:</strong> ${L([s.location.lng,s.location.lat],[y.coords.longitude,y.coords.latitude]).toFixed(2)} km</p>
                    <button class="view-details-btn" data-marker-id="${s.id}">View Details</button>
                `,t.appendChild(c)}),t.querySelectorAll(".view-details-btn").forEach(s=>{s.addEventListener("click",c=>{const a=c.target.getAttribute("data-marker-id");console.log(a);const i=n.find(r=>r.id===a);i&&$(i)})})),e.style.display="flex",console.log(e.style.zIndex)}catch(o){console.error("Error fetching assigned markers:",o),t.innerHTML="<p>Error loading assigned actions. Please try again later.</p>"}}document.getElementById("signOutButton").addEventListener("click",e=>{e.preventDefault();const t=document.getElementById("userMenu"),o=document.getElementById("loginButton");t.style.display="none",o.style.display="block",document.getElementById("assigned-modal").style.display="none",t.removeEventListener("click",B),m=null,M(),x("Signed out","green"),console.log("User signed out")});async function z(e,t){try{const o=H(b,"assignees",e);return(await R(o)).data().password===t}catch(o){return console.log(o),!1}}document.getElementById("login-form").addEventListener("submit",function(e){e.preventDefault();const t=e.target.username.value,o=e.target.password.value;T(t,o)}),document.getElementById("loginButton").addEventListener("click",function(){document.getElementById("login-container").style.display="block"}),document.getElementById("closeLogin").addEventListener("click",function(){document.getElementById("login-container").style.display="none"});const S=document.querySelector("a-scene"),E=document.createElement("a-entity");E.setAttribute("cursor","rayOrigin: mouse; fuse: false;"),E.setAttribute("raycaster","objects: a-box, a-gltf-model"),E.setAttribute("raycaster","ignore: [canvas]"),E.setAttribute("raycaster","objects: .clickable; showLine: true;"),S.camera.el.appendChild(E);function L(e,t){function o(p){return p*Math.PI/180}const n=e[0],s=e[1],c=t[0],a=t[1],i=6371,r=a-s,g=o(r),v=c-n,C=o(v),u=Math.sin(g/2)*Math.sin(g/2)+Math.cos(o(s))*Math.cos(o(a))*Math.sin(C/2)*Math.sin(C/2),w=2*Math.atan2(Math.sqrt(u),Math.sqrt(1-u));return i*w}function $(e){const t=document.createElement("div");t.setAttribute("id","landmark-modal"),Object.assign(t.style,{position:"fixed",top:"60px",bottom:"60px",left:"0",backgroundColor:"rgba(255, 255, 255, 1)",zIndex:"1000",display:"flex",flexDirection:"column",alignItems:"stretch",justifyContent:"flex-start",padding:"20px",boxSizing:"border-box",fontFamily:"Arial, sans-serif",color:"#333"});const o=document.createElement("div");o.innerHTML="&times;",Object.assign(o.style,{position:"absolute",top:"20px",right:"20px",fontSize:"30px",cursor:"pointer",color:"#666",zIndex:"1"}),o.onclick=()=>document.body.removeChild(t),t.appendChild(o);const n=document.createElement("h2");n.innerText=`${e.equipment} - ${e.form}`,Object.assign(n.style,{margin:"0",padding:"20px 0",color:"#e55400",fontSize:"24px",borderBottom:"2px solid #e55400",position:"sticky",top:"0"}),t.appendChild(n);const s=document.createElement("div");Object.assign(s.style,{flex:"1",overflowY:"auto",padding:"20px 0"}),t.appendChild(s);const c=document.createElement("div");c.innerHTML=`
            <p><strong>Operation:</strong> ${e.operation}</p>
            <p><strong>Form:</strong> ${e.form}</p>
            <p><strong>Control:</strong> ${e.control}</p>
            <p><strong>Control Framework:</strong> ${e.framework}</p>
            <p><strong>Operating Context:</strong> ${e.context}</p>
            <p><strong>Equipment:</strong> ${e.equipment}</p>
            <p><strong>Assignee:</strong> ${e.assignee?e.assignee.name:""}</p>
            <p><strong>Location</strong></br>
                &emsp;<strong>Lat:</strong> ${e.location.lat}</br>
                &emsp;<strong>Lng:</strong> ${e.location.lng}</p>
            <p><strong>Distance:</strong> ${L([e.location.lng,e.location.lat],[y.coords.longitude,y.coords.latitude]).toFixed(2)} km</p>
        `,Object.assign(c.style,{marginBottom:"20px",lineHeight:"1.6",fontSize:"16px"}),s.appendChild(c);const a=document.createElement("button");a.innerText=`Perform ${e.form}`,Object.assign(a.style,{backgroundColor:"#e55400",color:"white",border:"none",padding:"12px 24px",borderRadius:"5px",cursor:"pointer",fontSize:"16px",transition:"background-color 0.3s",width:"100%",marginBottom:"20px"}),a.onmouseover=()=>a.style.backgroundColor="#aa3f00",a.onmouseout=()=>a.style.backgroundColor="#e55400",a.onclick=()=>window.open(e.url,"_blank"),t.appendChild(a),document.body.appendChild(t)}async function M(){document.querySelectorAll('a-entity[id^="place-"]').forEach(t=>{t.parentNode.removeChild(t)}),I.forEach((t,o)=>{const n=document.createElement("a-entity");n.setAttribute("gps-entity-place",`latitude: ${t.location.lat}; longitude: ${t.location.lng};`),n.setAttribute("look-at","[gps-camera]"),n.setAttribute("scale","6 6 6"),n.setAttribute("class","clickable"),n.setAttribute("id",`place-${o}`);let s,c;m?t.assignee&&t.assignee.username===m.username?(s="#e55400",c="Shiny Amberis-Amur.glb"):(s="white",c="Greyed Shiny Amberis-Amur.glb"):(s="white",c="Shiny Amberis-Amur.glb");const a=document.createElement("a-entity");a.setAttribute("animation__bob",{property:"position",dir:"alternate",dur:2e3,from:"0 0 0",to:"0 0.3 0",loop:!0,easing:"easeInOutSine"});const i=document.createElement("a-gltf-model");i.setAttribute("src",c),i.setAttribute("scale","0.1 0.1 0.1"),i.setAttribute("class","clickable");let r=0,g=1;const v=Math.PI/16,C=.005;i.addEventListener("model-loaded",()=>{function k(){r+=C*g,Math.abs(r)>=v&&(g*=-1),i.object3D.rotation.y=r,requestAnimationFrame(k)}k()}),a.appendChild(i),n.appendChild(a);const u=document.createElement("a-text"),w=L([t.location.lng,t.location.lat],[y.coords.longitude,y.coords.latitude]).toFixed(2);u.setAttribute("value",`${t.form}
${t.equipment}
${w} km`),u.setAttribute("color",s),u.setAttribute("align","center"),u.setAttribute("position","0 1.5 0"),u.setAttribute("scale","1.5 1.5 1.5"),u.setAttribute("look-at","[gps-camera]"),u.setAttribute("animation__bob",{property:"position",dir:"alternate",dur:2e3,from:"0 1.5 0",to:"0 1.8 0",loop:!0,easing:"easeInOutSine"}),n.appendChild(u);const p=document.createElement("a-box");p.setAttribute("class","clickable"),p.setAttribute("material","opacity: 0.0"),p.setAttribute("scale","2 2 0"),p.setAttribute("position","0 0 0"),p.setAttribute("animation__bob",{property:"position",dir:"alternate",dur:2e3,from:"0 0 0",to:"0 0.15 0",loop:!0,easing:"easeInOutSine"}),n.appendChild(p),n.addEventListener("click",function(){console.log(`Clicked on ${t.equipment}`),$(t)}),S.appendChild(n)})}navigator.geolocation.getCurrentPosition(async e=>{y=e,M()},e=>{console.error("Error retrieving location",e)},{enableHighAccuracy:!0,maximumAge:0,timeout:27e3})};
