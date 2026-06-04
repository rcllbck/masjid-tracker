// ── Storage ──
const Storage = {
  get: (key) => {
    try { const v = localStorage.getItem(key); return v ? { value: v } : null; }
    catch (e) { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); return true; }
    catch (e) { return false; }
  }
};

// ── Data ──
let masjids = [];
let landmarks = [];

function loadData() {
  try { const r1 = Storage.get('masjids-data'); if (r1?.value) masjids = JSON.parse(r1.value); } catch (e) { masjids = []; }
  try { const r2 = Storage.get('landmarks-data'); if (r2?.value) landmarks = JSON.parse(r2.value); } catch (e) { landmarks = []; }
  renderMarkers();
  renderLandmarkMarkers();
  updateStats();
  renderListItems();
}

function persistData() {
  try {
    Storage.set('masjids-data', JSON.stringify(masjids));
    Storage.set('landmarks-data', JSON.stringify(landmarks));
  } catch (e) { console.warn('Storage save failed:', e); }
}

// ── Inisialisasi Peta ──
const map = L.map("map", {
  doubleClickZoom: false,
  rotate: true,
  rotateControl: { closeOnZeroBearing: false },
  touchRotate: true,
  bearing: 0
}).setView([-6.2, 106.8], 12);

navigator.geolocation.getCurrentPosition(
  (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { animate: true, duration: 1 }),
  () => {},
  { enableHighAccuracy: true, timeout: 5000 }
);

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "© CartoDB"
}).addTo(map);

const masjidIcon = L.divIcon({
  html: `<span class="iconify" data-icon="emojione:mosque" data-width="32" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.8))"></span>`,
  className: "", iconSize: [32, 32], iconAnchor: [16, 16]
});

function makeLandmarkIcon(iconName) {
  return L.divIcon({
    html: `<span class="iconify" data-icon="${iconName}" data-width="28" style="filter:drop-shadow(0 1px 4px rgba(0,0,0,.7))"></span>`,
    className: "", iconSize: [28, 28], iconAnchor: [14, 14]
  });
}

// ── User location ──
const userIcon = L.divIcon({
  html: `<div style="
    width: 16px;
    height: 16px;
    background: #4a9eff;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(74,158,255,0.6);
  "></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

let userMarker = null;

function updateUserLocation(pos) {
  const { latitude, longitude } = pos.coords;
  if (userMarker) {
    userMarker.setLatLng([latitude, longitude]);
  } else {
    userMarker = L.marker([latitude, longitude], {
      icon: userIcon,
      zIndexOffset: 1000
    }).addTo(map);
  }
}

navigator.geolocation.watchPosition(
  updateUserLocation,
  () => {},
  { enableHighAccuracy: true }
);

// ── Masjid Markers ──
let masjidMarkers = [];
let markerJustTapped = false;

function renderMarkers() {
  masjidMarkers.forEach(mk => map.removeLayer(mk));
  masjidMarkers = [];
  masjids.forEach(m => {
    const mk = L.marker([m.lat, m.lng], { icon: masjidIcon })
      .addTo(map)
      .on("click", () => {
        markerJustTapped = true;
        openDetail(m.id);
      });
    masjidMarkers.push(mk);
  });
  setTimeout(() => { if (typeof Iconify !== "undefined") Iconify.scan(); }, 100);
}

// ── Landmark Markers ──
let landmarkMarkers = [];

function renderLandmarkMarkers() {
  landmarkMarkers.forEach(mk => map.removeLayer(mk));
  landmarkMarkers = [];
  landmarks.forEach(lm => {
    const mk = L.marker([lm.lat, lm.lng], { icon: makeLandmarkIcon(lm.icon) })
      .addTo(map)
      .bindTooltip(lm.label, { permanent: false, direction: "top", offset: [0, -12], className: "landmark-tooltip" })
      .on("contextmenu", () => {
        if (confirm(`Hapus patokan "${lm.label}"?`)) {
          landmarks = landmarks.filter(x => x.id !== lm.id);
          persistData();
          renderLandmarkMarkers();
        }
      });
    landmarkMarkers.push(mk);
  });
  setTimeout(() => { if (typeof Iconify !== "undefined") Iconify.scan(); }, 100);
}

// ── Stats ──
function updateStats() {
  document.getElementById("totalMasjid").textContent = `${masjids.length} Masjid`;
  const totalSholat = masjids.reduce((acc, m) => acc + (m.sholat?.length || 0), 0);
  document.getElementById("totalSholat").textContent = `${totalSholat} Sholat`;
}

function save() {
  persistData();
  renderMarkers();
  updateStats();
  renderListItems();
}

// ── Panel refs ──
const panel = document.getElementById("panel");
const panelName = document.getElementById("panelName");
const panelPhoto = document.getElementById("panelPhoto");
const panelImg = document.getElementById("panelImg");
const panelSholat = document.getElementById("panelSholat");
const panelDate = document.getElementById("panelDate");
const sholatHistory = document.getElementById("sholatHistory");
const closePanel = document.getElementById("closePanel");
const editPanelBtn = document.getElementById("editPanelBtn");
const viewMode = document.getElementById("viewMode");
const editMode = document.getElementById("editMode");
const viewDesc = document.getElementById("viewDesc");
const panelPhotos = document.getElementById("panelPhotos");
const editPhotos = document.getElementById("editPhotos");
const panelDesc = document.getElementById("panelDesc");
const saveDescBtn = document.getElementById("saveDescBtn");
const addPhotoBtn = document.getElementById("addPhotoBtn");
const addPhotoFile = document.getElementById("addPhotoFile");
const sholatTimeForm = document.getElementById("sholatTimeForm");
const sholatTimeName = document.getElementById("sholatTimeName");
const sholatTimeInput = document.getElementById("sholatTimeInput");
const closeSholatTime = document.getElementById("closeSholatTime");
const cancelSholatTime = document.getElementById("cancelSholatTime");
const confirmSholatTime = document.getElementById("confirmSholatTime");
const photoModal = document.getElementById("photoModal");
const photoModalImg = document.getElementById("photoModalImg");

function openPhotoModal(src) {
  photoModalImg.src = src;
  photoModal.classList.add("visible");
}

photoModal.onclick = () => photoModal.classList.remove("visible");

let activeMasjidId = null;
let pendingSholatName = null;

function openDetail(id) {
  const m = masjids.find(m => m.id === id);
  if (!m) return;
  activeMasjidId = id;
  panelName.textContent = m.name;
  panelSholat.textContent = `${m.sholat.length} Sholat`;
  panelDate.textContent = new Date(m.createdAt).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });
  if (m.photo) { panelImg.src = m.photo; panelPhoto.style.display = "block"; }
  else panelPhoto.style.display = "none";
  setViewMode();
  updateSholatButtons(m);
  renderSholatHistory(m);
  renderStars(m.rating || 0);
  viewDesc.textContent = m.desc || "";
  renderPanelPhotos(m);
  panel.classList.add("visible");
  listPanel.classList.remove("visible");
}

function setViewMode() {
  viewMode.style.display = "block";
  editMode.style.display = "none";
  editPanelBtn.classList.remove("active");
  sholatTimeForm.style.display = "none";
}

function setEditMode() {
  const m = masjids.find(m => m.id === activeMasjidId);
  if (!m) return;
  viewMode.style.display = "none";
  editMode.style.display = "flex";
  editPanelBtn.classList.add("active");
  panelDesc.value = m.desc || "";
  renderStarsEdit(m.rating || 0);
  renderEditPhotos(m);
  sholatTimeForm.style.display = "none";
}

editPanelBtn.onclick = () => editMode.style.display === "none" ? setEditMode() : setViewMode();

function updateSholatButtons(m) {
  const today = new Date().toDateString();
  const todaySholat = m.sholat.filter(s => new Date(s.time).toDateString() === today).map(s => s.name);
  document.querySelectorAll(".btn-sholat").forEach(btn => btn.classList.toggle("done", todaySholat.includes(btn.dataset.sholat)));
}

document.querySelectorAll(".btn-sholat").forEach(btn => {
  btn.onclick = () => {
    const m = masjids.find(m => m.id === activeMasjidId);
    if (!m) return;
    const name = btn.dataset.sholat;
    const today = new Date().toDateString();
    const sudah = m.sholat.some(s => s.name === name && new Date(s.time).toDateString() === today);
    const idx = masjids.findIndex(m => m.id === activeMasjidId);
    if (sudah) masjids[idx].sholat = masjids[idx].sholat.filter(s => !(s.name === name && new Date(s.time).toDateString() === today));
    else masjids[idx].sholat.push({ name, time: new Date().toISOString() });
    save();
    openDetail(activeMasjidId);
  };
});

document.querySelectorAll(".btn-sholat-edit").forEach(btn => {
  btn.onclick = () => {
    pendingSholatName = btn.dataset.sholat;
    sholatTimeName.textContent = `${btn.textContent.trim()} — pilih waktu`;
    const now = new Date();
    sholatTimeInput.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    sholatTimeForm.style.display = "block";
    sholatTimeForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
});

function closeSholatTimeForm() { sholatTimeForm.style.display = "none"; pendingSholatName = null; }
closeSholatTime.onclick = closeSholatTimeForm;
cancelSholatTime.onclick = closeSholatTimeForm;

confirmSholatTime.onclick = () => {
  if (!pendingSholatName || !sholatTimeInput.value) return;
  const idx = masjids.findIndex(m => m.id === activeMasjidId);
  masjids[idx].sholat.push({ name: pendingSholatName, time: new Date(sholatTimeInput.value).toISOString() });
  save();
  closeSholatTimeForm();
  openDetail(activeMasjidId);
};

function renderSholatHistory(m) {
  sholatHistory.innerHTML = "";
  [...m.sholat].reverse().forEach(s => {
    const div = document.createElement("div");
    div.className = "sholat-item";
    const t = new Date(s.time);
    div.innerHTML = `<span>🙏 ${s.name}</span><span>${t.toLocaleDateString("id-ID",{day:"numeric",month:"short"})} · ${t.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}</span>`;
    sholatHistory.appendChild(div);
  });
}

function renderStars(r) {
  document.querySelectorAll("#starsDisplay .star").forEach(s => {
    const v = parseFloat(s.dataset.val);
    s.classList.remove("active","half");
    if (r >= v) s.classList.add("active");
    else if (r >= v - 0.5) s.classList.add("half");
  });
}

function renderStarsEdit(r) {
  document.querySelectorAll("#starsEdit .star-edit").forEach(s => {
    const v = parseFloat(s.dataset.val);
    s.classList.remove("active","half");
    if (r >= v) s.classList.add("active");
    else if (r >= v - 0.5) s.classList.add("half");
  });
}

document.getElementById("starsEdit").addEventListener("click", e => {
  const star = e.target.closest(".star-edit");
  if (!star) return;
  const val = parseInt(star.dataset.val);
  const rect = star.getBoundingClientRect();
  const newRating = e.clientX - rect.left < rect.width / 2 ? val - 0.5 : val;
  const idx = masjids.findIndex(m => m.id === activeMasjidId);
  masjids[idx].rating = masjids[idx].rating === newRating ? 0 : newRating;
  save();
  renderStarsEdit(masjids[idx].rating);
  renderStars(masjids[idx].rating);
});

saveDescBtn.onclick = () => {
  const idx = masjids.findIndex(m => m.id === activeMasjidId);
  masjids[idx].desc = panelDesc.value.trim();
  viewDesc.textContent = masjids[idx].desc;
  save();
  saveDescBtn.textContent = "✓ Tersimpan!";
  setTimeout(() => { saveDescBtn.textContent = "Simpan Catatan"; setViewMode(); }, 1000);
};

function renderPanelPhotos(m) {
  panelPhotos.innerHTML = "";
  (m.photos || []).forEach(photo => {
    const img = document.createElement("img");
    img.src = photo;
    img.classList.add("panel-photo-item");
    img.onclick = () => openPhotoModal(photo); // ⬅️ tambah ini
    panelPhotos.appendChild(img);
  });
}

function renderEditPhotos(m) {
  editPhotos.innerHTML = "";
  (m.photos || []).forEach((photo, i) => {
    const img = document.createElement("img");
    img.src = photo; img.className = "panel-photo-item"; img.title = "Klik untuk hapus";
    img.onclick = () => {
      if (!confirm("Hapus foto ini?")) return;
      const idx = masjids.findIndex(x => x.id === activeMasjidId);
      masjids[idx].photos.splice(i, 1);
      save(); renderEditPhotos(masjids[idx]); renderPanelPhotos(masjids[idx]);
    };
    editPhotos.appendChild(img);
  });
}

addPhotoBtn.onclick = () => addPhotoFile.click();
addPhotoFile.onchange = e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const idx = masjids.findIndex(m => m.id === activeMasjidId);
    if (!masjids[idx].photos) masjids[idx].photos = [];
    masjids[idx].photos.push(ev.target.result);
    save(); renderEditPhotos(masjids[idx]); renderPanelPhotos(masjids[idx]);
  };
  reader.readAsDataURL(file); addPhotoFile.value = "";
};

const addGalleryBtn = document.getElementById("addGalleryBtn");
const addGalleryFile = document.getElementById("addGalleryFile");

addGalleryBtn.onclick = () => addGalleryFile.click();
addGalleryFile.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const idx = masjids.findIndex(m => m.id === activeMasjidId);
    if (!masjids[idx].photos) masjids[idx].photos = [];
    masjids[idx].photos.push(e.target.result);
    save();
    renderEditPhotos(masjids[idx]);
    renderPanelPhotos(masjids[idx]);
  };
  reader.readAsDataURL(file);
  addGalleryFile.value = "";
};

document.getElementById("hapusBtn").onclick = () => {
  if (!confirm("Hapus masjid ini?")) return;
  masjids = masjids.filter(m => m.id !== activeMasjidId);
  save(); panel.classList.remove("visible");
};

closePanel.onclick = () => panel.classList.remove("visible");

// ── List Panel ──
const listPanel = document.getElementById("listPanel");
const listItems = document.getElementById("listItems");
const listSearch = document.getElementById("listSearch");

document.getElementById("listBtn").onclick = () => { listPanel.classList.toggle("visible"); renderListItems(); };
document.getElementById("closeListPanel").onclick = () => listPanel.classList.remove("visible");
listSearch.addEventListener("input", () => renderListItems(listSearch.value.trim()));

function renderListItems(query = "") {
  listItems.innerHTML = "";
  const filtered = masjids.filter(m => m.name.toLowerCase().includes(query.toLowerCase()));
  if (filtered.length === 0) {
    listItems.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px 20px;font-size:13px;">${query ? "Masjid tidak ditemukan 🔍" : "Belum ada masjid tersimpan 🕌"}</div>`;
    return;
  }
  [...filtered].sort((a, b) => b.id - a.id).forEach(m => {
    const today = new Date().toDateString();
    const hari = m.sholat.filter(s => new Date(s.time).toDateString() === today).length;
    const stars = [1,2,3,4,5].map(i => {
      const r = m.rating || 0;
      if (r >= i) return `<span style="color:#f5a623">★</span>`;
      if (r >= i - 0.5) return `<span style="color:#f5a623;opacity:.5">★</span>`;
      return `<span style="color:var(--border)">★</span>`;
    }).join("");
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      ${m.photo ? `<img src="${m.photo}" class="list-item-photo">` : `<div class="list-item-icon">🕌</div>`}
      <div class="list-item-info">
        <div class="list-item-name">${m.name}</div>
        <div class="list-item-meta">
          <span>🙏 ${m.sholat.length} total</span>
          ${hari > 0 ? `<span style="color:var(--accent)">✓ ${hari} hari ini</span>` : ""}
          ${m.rating > 0 ? `<span>${stars}</span>` : ""}
        </div>
      </div>
      <div style="font-size:18px;color:var(--text-muted)">›</div>`;
    div.onclick = () => { openDetail(m.id); map.setView([m.lat, m.lng], 16); listPanel.classList.remove("visible"); };
    listItems.appendChild(div);
  });
}

// ── Modal Masjid ──
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const masjidName = document.getElementById("masjidName");
const locationText = document.getElementById("locationText");
const photoPreview = document.getElementById("photoPreview");
const photoFile = document.getElementById("photoFile");
const cameraFile = document.getElementById("cameraFile");
const cameraBtn = document.getElementById("cameraBtn");
const galleryBtn = document.getElementById("galleryBtn");
const suggestions = document.getElementById("suggestions");
const adjustMapBtn = document.getElementById("adjustMapBtn");
const modalContent = document.querySelector("#modal .modal-content");

let currentLat = null, currentLng = null, currentPhoto = null;
let searchTimeout = null, isMinimized = false;

function openModal(lat, lng) {
  modal.classList.add("visible");
  masjidName.value = ""; photoPreview.style.display = "none";
  currentPhoto = null; suggestions.style.display = "none";
  isMinimized = false; modalContent.classList.remove("minimized");
  adjustMapBtn.textContent = "🗺️ Sesuaikan";
  if (window.previewMarker) { map.removeLayer(window.previewMarker); window.previewMarker = null; }

  if (lat && lng) {
    currentLat = lat; currentLng = lng;
    locationText.textContent = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    locationText.style.color = "var(--accent)";
    adjustMapBtn.style.display = "block";
    window.previewMarker = L.marker([lat, lng], { icon: masjidIcon, draggable: true }).addTo(map);
    window.previewMarker.on("dragend", e => {
      const p = e.target.getLatLng(); currentLat = p.lat; currentLng = p.lng;
      locationText.textContent = `📍 ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;
    });
  } else {
    currentLat = null; currentLng = null;
    locationText.textContent = "Mengambil lokasi...";
    locationText.style.color = "var(--text-muted)";
    adjustMapBtn.style.display = "none";
    navigator.geolocation.getCurrentPosition(
      pos => {
        currentLat = pos.coords.latitude; currentLng = pos.coords.longitude;
        locationText.textContent = `📍 ${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`;
        locationText.style.color = "var(--accent)";
      },
      () => { locationText.textContent = "❌ Gagal ambil lokasi"; locationText.style.color = "var(--danger)"; }
    );
  }
}

closeModal.onclick = () => {
  modal.classList.remove("visible"); modalContent.classList.remove("minimized"); isMinimized = false;
  if (window.previewMarker) { map.removeLayer(window.previewMarker); window.previewMarker = null; }
};

adjustMapBtn.onclick = () => {
  if (!isMinimized) { modalContent.classList.add("minimized"); adjustMapBtn.textContent = "✓ Gunakan Lokasi Ini"; isMinimized = true; }
  else { modalContent.classList.remove("minimized"); adjustMapBtn.textContent = "🗺️ Sesuaikan"; isMinimized = false; }
};

masjidName.addEventListener("input", () => {
  const query = masjidName.value.trim();
  if (query.length < 3) { suggestions.style.display = "none"; return; }
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=id&addressdetails=1`, { headers: { "Accept-Language":"id" } });
      const data = await r.json();
      suggestions.innerHTML = "";
      if (!data.length) { suggestions.style.display = "none"; return; }
      suggestions.style.display = "flex";
      data.forEach(place => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        const name = place.namedetails?.name || place.display_name.split(",")[0];
        div.innerHTML = `<div class="suggestion-name">${name}</div><div class="suggestion-address">${place.display_name}</div>`;
        div.onclick = () => {
          masjidName.value = name;
          currentLat = parseFloat(place.lat); currentLng = parseFloat(place.lon);
          locationText.textContent = `📍 ${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`;
          locationText.style.color = "var(--accent)";
          map.setView([currentLat, currentLng], 17);
          if (window.previewMarker) map.removeLayer(window.previewMarker);
          window.previewMarker = L.marker([currentLat, currentLng], { icon: masjidIcon, draggable: true }).addTo(map);
          window.previewMarker.on("dragend", e => {
            const p = e.target.getLatLng(); currentLat = p.lat; currentLng = p.lng;
            locationText.textContent = `📍 ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;
          });
          adjustMapBtn.style.display = "block"; suggestions.style.display = "none";
        };
        suggestions.appendChild(div);
      });
    } catch { suggestions.style.display = "none"; }
  }, 500);
});

document.addEventListener("click", e => {
  if (!suggestions.contains(e.target) && e.target !== masjidName) suggestions.style.display = "none";
});

function handlePhoto(file) {
  const reader = new FileReader();
  reader.onload = e => { currentPhoto = e.target.result; photoPreview.src = currentPhoto; photoPreview.style.display = "block"; };
  reader.readAsDataURL(file);
}

cameraBtn.onclick = () => cameraFile.click();
galleryBtn.onclick = () => photoFile.click();
cameraFile.onchange = e => { if (e.target.files[0]) handlePhoto(e.target.files[0]); };
photoFile.onchange = e => { if (e.target.files[0]) handlePhoto(e.target.files[0]); };

document.getElementById("simpanBtn").onclick = () => {
  const name = masjidName.value.trim();
  if (!name) { alert("Nama masjid harus diisi!"); return; }
  if (!currentLat || !currentLng) { alert("Lokasi belum didapat!"); return; }
  masjids.push({ id: Date.now(), name, lat: currentLat, lng: currentLng, photo: currentPhoto, sholat: [], photos: [], desc: "", rating: 0, createdAt: new Date().toISOString() });
  if (window.previewMarker) { map.removeLayer(window.previewMarker); window.previewMarker = null; }
  modal.classList.remove("visible"); modalContent.classList.remove("minimized"); isMinimized = false;
  map.setView([currentLat, currentLng], 16);
  save();
};

// ── Action Sheet ──
const actionSheet = document.getElementById("actionSheet");

document.getElementById("addBtn").onclick = () => {
  actionSheet.classList.add("visible");
  if (typeof Iconify !== "undefined") setTimeout(() => Iconify.scan(), 50);
};

document.getElementById("actionCancel").onclick = () => actionSheet.classList.remove("visible");

actionSheet.addEventListener("click", e => {
  if (e.target === actionSheet) actionSheet.classList.remove("visible");
});

document.getElementById("actionMasjid").onclick = () => {
  actionSheet.classList.remove("visible");
  openModal(null, null);
};

document.getElementById("actionLandmark").onclick = () => {
  actionSheet.classList.remove("visible");
  navigator.geolocation.getCurrentPosition(
    pos => {
      pendingLandmarkLat = pos.coords.latitude;
      pendingLandmarkLng = pos.coords.longitude;
      map.setView([pendingLandmarkLat, pendingLandmarkLng], 17);
      landmarkModal.classList.add("visible");
      if (typeof Iconify !== "undefined") setTimeout(() => Iconify.scan(), 50);
    },
    () => {
      const center = map.getCenter();
      pendingLandmarkLat = center.lat;
      pendingLandmarkLng = center.lng;
      landmarkModal.classList.add("visible");
      if (typeof Iconify !== "undefined") setTimeout(() => Iconify.scan(), 50);
    }
  );
};

// ── Landmark Modal ──
const landmarkModal = document.getElementById("landmarkModal");
let pendingLandmarkLat = null, pendingLandmarkLng = null;

// ════════════════════════════════════════════
// UNIFIED TOUCH HANDLER — satu set listener
// ════════════════════════════════════════════
let touchStartX = 0, touchStartY = 0;
let isTouchMulti = false;
let isTouchMoved = false;
let lastTapTime = 0;
let longPressTimer = null;
let longPressLatLng = null;

const container = map.getContainer();

container.addEventListener("touchstart", e => {
  if (e.touches.length > 1) {
    isTouchMulti = true;
    clearTimeout(longPressTimer);
    return;
  }
  isTouchMulti = false;
  isTouchMoved = false;
  markerJustTapped = false;

  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;

  const rect = container.getBoundingClientRect();
  longPressLatLng = map.containerPointToLatLng(
    L.point(touch.clientX - rect.left, touch.clientY - rect.top)
  );

  // Long press 600ms → tambah patokan
  longPressTimer = setTimeout(() => {
    if (isTouchMoved || isTouchMulti || markerJustTapped) return;
    if (modal.classList.contains("visible") || panel.classList.contains("visible") || landmarkModal.classList.contains("visible")) return;
    pendingLandmarkLat = longPressLatLng.lat;
    pendingLandmarkLng = longPressLatLng.lng;
    landmarkModal.classList.add("visible");
    if (navigator.vibrate) navigator.vibrate(50);
    if (typeof Iconify !== "undefined") setTimeout(() => Iconify.scan(), 50);
    lastTapTime = 0;
  }, 600);

}, { passive: true });

container.addEventListener("touchmove", e => {
  if (e.touches.length > 1) { isTouchMulti = true; return; }
  const dx = Math.abs(e.touches[0].clientX - touchStartX);
  const dy = Math.abs(e.touches[0].clientY - touchStartY);
  if (dx > 8 || dy > 8) {
    isTouchMoved = true;
    clearTimeout(longPressTimer);
  }
}, { passive: true });

container.addEventListener("touchend", e => {
  clearTimeout(longPressTimer);

  if (isTouchMulti) {
    isTouchMulti = false;
    lastTapTime = 0;
    return;
  }

  if (isTouchMoved) {
    lastTapTime = 0;
    return;
  }

  // Marker ditap → Leaflet handle via click event, kita skip
  if (markerJustTapped) {
    markerJustTapped = false;
    lastTapTime = 0;
    return;
  }

  // Double tap → tambah masjid
  const now = Date.now();
  const diff = now - lastTapTime;
  if (diff < 300 && diff > 0) {
    lastTapTime = 0;
    if (modal.classList.contains("visible") || panel.classList.contains("visible") || landmarkModal.classList.contains("visible")) return;
    const touch = e.changedTouches[0];
    const rect = container.getBoundingClientRect();
    const point = map.containerPointToLatLng(
      L.point(touch.clientX - rect.left, touch.clientY - rect.top)
    );
    openModal(point.lat, point.lng);
  } else {
    lastTapTime = now;
  }
}, { passive: true });

// ── Landmark Handlers ──
document.querySelectorAll(".landmark-opt").forEach(btn => {
  btn.onclick = () => {
    if (!pendingLandmarkLat || !pendingLandmarkLng) return;
    if (btn.dataset.label === "__custom__") {
      document.getElementById("landmarkGrid").style.display = "none";
      const wrap = document.getElementById("customLabelWrap");
      wrap.style.display = "block";
      const inp = document.getElementById("customLabelInput");
      inp.value = "";
      setTimeout(() => inp.focus(), 100);
      wrap._pendingIcon = btn.dataset.icon;
    } else {
      saveLandmark(btn.dataset.icon, btn.dataset.label);
    }
  };
});

function saveLandmark(icon, label) {
  landmarks.push({ id: Date.now(), icon, label, lat: pendingLandmarkLat, lng: pendingLandmarkLng });
  persistData();
  renderLandmarkMarkers();
  closeLandmarkPicker();
}

function closeLandmarkPicker() {
  landmarkModal.classList.remove("visible");
  pendingLandmarkLat = null; pendingLandmarkLng = null;
  document.getElementById("landmarkGrid").style.display = "grid";
  document.getElementById("customLabelWrap").style.display = "none";
  document.getElementById("customLabelInput").value = "";
}

document.getElementById("confirmCustomLabel").onclick = () => {
  const inp = document.getElementById("customLabelInput");
  const label = inp.value.trim();
  if (!label) { inp.focus(); return; }
  const wrap = document.getElementById("customLabelWrap");
  saveLandmark(wrap._pendingIcon || "📍", label);
};

document.getElementById("customLabelInput").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("confirmCustomLabel").click();
});

document.getElementById("cancelCustomLabel").onclick = () => {
  document.getElementById("landmarkGrid").style.display = "grid";
  document.getElementById("customLabelWrap").style.display = "none";
};

document.getElementById("closeLandmarkModal").onclick = closeLandmarkPicker;

// ── Init ──
loadData();
