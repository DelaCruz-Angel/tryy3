const mobileBtn = document.getElementById('mobileBtn');
const navLinks = document.getElementById('navLinks');
mobileBtn.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  mobileBtn.textContent = navLinks.classList.contains('open') ? '✖' : '☰';
});

const dropdown = document.querySelector(".dropdown");
const dropdownMenu = document.querySelector(".dropdown-menu");
dropdown.addEventListener("click", () => dropdownMenu.classList.toggle("show"));
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) dropdownMenu.classList.remove("show");
});

document.querySelector('.dropdown-item.logout').addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});


document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;
  const fullName = `${user.firstName?.toUpperCase() || ''} ${user.mi ? user.mi[0].toUpperCase()+'.' : ''} ${user.lastName?.toUpperCase() || ''}`;
  const display = document.getElementById("displayUsername");
  if (display) display.textContent = fullName.trim();
});


const STORAGE_KEY = 'markers';
function loadMarkers() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch(e){ return []; } }
function saveMarkers(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }


const map = L.map('map', { center:[8.3695,124.8643], zoom:16, zoomControl:false });
L.control.zoom({ position:'topright' }).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ maxZoom:19 }).addTo(map);

let leafletMarkers = {};
let markersList = loadMarkers();

function renderMarkers() {
  Object.values(leafletMarkers).forEach(m => map.removeLayer(m));
  leafletMarkers = {};

  markersList.forEach(item => {
    let iconUrl = '';
    switch(item.severity) {
      case 'high': iconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'; break;
      case 'medium': iconUrl = 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'; break;
      case 'low': iconUrl = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'; break;
      default: iconUrl = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }

    const icon = L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    const m = L.marker([item.lat, item.lng], { icon }).addTo(map);
    m.on('click', () => showPost(item));
    leafletMarkers[item.id.toString()] = m;
  });
}

renderMarkers();


const infoBox = document.getElementById('infoBox');
const infoEmpty = document.getElementById('infoEmpty');
function clearInfoBox() { infoBox.innerHTML = ''; }


function showComposer(prefill = {}) {
  clearInfoBox();

  const form = document.createElement('div');
  form.className = 'composer';
  form.innerHTML = `
    <div class="small-muted">Creating post at selected location</div>
    <input id="postTitle" type="text" placeholder="Title (eg. Fallen tree, Unsafe road...)"/>
    <textarea id="postDesc" rows="4" placeholder="Write details..."></textarea>
    <div class="coords">
      <div class="small-muted">Lat: <span id="coordLat">${prefill.lat ?? ''}</span></div>
      <div class="small-muted">Lng: <span id="coordLng">${prefill.lng ?? ''}</span></div>
    </div>
    <div>
      <label class="custom-file">Choose images <input id="postImages" type="file" accept="image/*" multiple style="display:none;" /></label>
      <span class="small-muted" id="imgCount" style="margin-left:8px">0 images</span>
    </div>
    <div>
      <label class="small-muted">Severity:</label>
      <select id="postSeverity">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
    <div id="galleryWrap"></div>
    <div class="controls">
      <button class="btn add" id="btnAdd">Add Post</button>
      <button class="btn cancel" id="btnCancel">Cancel</button>
      <div style="flex:1"></
      <div class="small-muted" id="timeHint"></div>
    </div>
  `;
  infoBox.appendChild(form);

  if (prefill.title) document.getElementById('postTitle').value = prefill.title;
  if (prefill.desc) document.getElementById('postDesc').value = prefill.desc;
  if (prefill.severity) document.getElementById('postSeverity').value = prefill.severity;

  const fileInput = document.getElementById('postImages');
  const imgCount = document.getElementById('imgCount');
  const galleryWrap = document.getElementById('galleryWrap');
  let imagesBase64 = prefill.images ? prefill.images.slice() : [];

  if (imagesBase64.length) renderGallery(imagesBase64, galleryWrap);

  fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    imgCount.textContent = files.length + (files.length === 1 ? ' image' : ' images');
    imagesBase64 = [];
    for (const file of files) {
      try { 
        const base64 = await fileToBase64(file);
        imagesBase64.push(base64);
      } catch(e){ console.warn('Skipping image', file.name); }
    }
    renderGallery(imagesBase64, galleryWrap);
  });

  document.getElementById('btnCancel').addEventListener('click', () => {
    clearInfoBox();
    infoBox.appendChild(infoEmpty);
  });

  document.getElementById('btnAdd').onclick = async () => {
    const title = document.getElementById('postTitle').value.trim();
    const desc = document.getElementById('postDesc').value.trim();
    const lat = Number(document.getElementById('coordLat').textContent);
    const lng = Number(document.getElementById('coordLng').textContent);
    const severity = document.getElementById('postSeverity').value;

    if (!title) { alert('Please add a title for the post.'); return; }

    const files = Array.from(fileInput.files || []);
    let finalImages = [];
    for (const file of files) {
      try { 
        const base64 = await fileToBase64(file, 1024, 1024, 500);
        finalImages.push(base64);
      } catch(e){ console.warn('Skipping image', file.name); }
    }

    const createdAt = new Date().toISOString();
    const post = { 
      id: Date.now().toString(), 
      title, 
      desc, 
      lat, 
      lng, 
      images: finalImages.length ? finalImages : imagesBase64, 
      severity, 
      createdAt 
    };

    markersList.unshift(post); 
    saveMarkers(markersList);

    renderMarkers();
    showPost(post);
    map.setView([lat, lng], map.getZoom());
    window.dispatchEvent(new Event('storage'));
  };
}


function showPost(post) {
  clearInfoBox();

  const wrap = document.createElement('div');
  wrap.className = 'post-card';
  const dt = new Date(post.createdAt);
  wrap.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div class="post-title">${escapeHtml(post.title)}</div>
        <div class="post-meta">${dt.toLocaleString()}</div>
      </div>
      <div class="post-actions">
        <button class="btn delete">Delete</button>
      </div>
    </div>
    <div class="post-desc">${escapeHtml(post.desc)}</div>
    <div class="post-coords">Location: ${post.lat.toFixed(6)}, ${post.lng.toFixed(6)}</div>
    <div class="postGalleryWrap"></div>
  `;
  infoBox.appendChild(wrap);

  renderGallery(post.images, wrap.querySelector('.postGalleryWrap'));


  wrap.querySelector('.delete').addEventListener('click', () => {
    if (!confirm('Are you sure you want to delete this post permanently?')) return;

    const idToDelete = post.id.toString();

    markersList = markersList.filter(m => m.id.toString() !== idToDelete);


    if (leafletMarkers[idToDelete]) {
      map.removeLayer(leafletMarkers[idToDelete]);
      delete leafletMarkers[idToDelete];
    }

  
    saveMarkers(markersList);

    clearInfoBox();
    infoBox.appendChild(infoEmpty);

    renderMarkers();

    window.dispatchEvent(new Event('storage'));
  });
}


map.on('click', (ev) => { 
  showComposer({ lat: ev.latlng.lat.toFixed(6), lng: ev.latlng.lng.toFixed(6) }); 
});


function fileToBase64(file, maxW=1024, maxH=1024, maxKB=500){ 
  return new Promise((resolve,reject)=>{
    if(!file.type.startsWith('image/')) return reject('Not an image');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let {width,height}=img;
        if(width>maxW||height>maxH){ const ratio=Math.min(maxW/width,maxH/height); width*=ratio;height*=ratio; }
        const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
        canvas.getContext('2d').drawImage(img,0,0,width,height);
        let quality=0.9; let base64=canvas.toDataURL('image/jpeg',quality);
        while(base64.length/1024>maxKB && quality>0.1){ quality-=0.05; base64=canvas.toDataURL('image/jpeg',quality); }
        resolve(base64);
      };
      img.onerror=reject; img.src=reader.result;
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

function escapeHtml(s){ return s ? s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]) : ''; }


function renderGallery(images, container) {
  container.innerHTML = '';
  if (!images || !images.length) return;

  const gallery = document.createElement('div');
  gallery.className = `gallery ${images.length === 1 ? 'one' : images.length === 2 ? 'two' : images.length === 3 ? 'three' : 'more'}`;

  images.forEach(imgSrc => {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.onclick = () => {
      const popup = document.getElementById('imagePopup');
      const popupImg = document.getElementById('popupImg');
      popupImg.src = imgSrc;
      popup.classList.add('show');
      popup.onclick = () => popup.classList.remove('show');
    };
    gallery.appendChild(img);
  });

  container.appendChild(gallery);
}
