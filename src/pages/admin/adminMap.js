// NEERAKSHAK District GIS Flood Map Engine (Leaflet Powered)
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let mapInstance = null;
let zonesLayerGroup = null;
let facilitiesLayerGroup = null;
let riverLayerGroup = null;
let tempPickLayer = null;
let activeSeverityFilter = 'ALL';
let isMapPickActive = false;

// Fix Leaflet's default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Kamrup District Geographic Center
const KAMRUP_CENTER = [26.11, 91.44];
const DEFAULT_ZOOM = 11;

// Brahmaputra River Basin Corridor Coordinates (Kamrup Segment)
const BRAHMAPUTRA_PATH = [
  [26.24, 91.92],
  [26.20, 91.80],
  [26.18, 91.73],
  [26.15, 91.60],
  [26.13, 91.48],
  [26.09, 91.35],
  [26.04, 91.22],
  [26.00, 91.06],
  [25.96, 90.92]
];

// Kolong / Kulsi Tributary Paths
const KULSI_PATH = [
  [25.98, 91.24],
  [26.03, 91.23],
  [26.06, 91.26],
  [26.08, 91.32]
];

function getSeverityColor(sev) {
  switch (sev) {
    case 'Critical': return '#dc2626';
    case 'High': return '#f97316';
    case 'Moderate': return '#eab308';
    case 'Normal': return '#16a34a';
    default: return '#0284c7';
  }
}

function getSeverityRadius(sev) {
  switch (sev) {
    case 'Critical': return 1800;
    case 'High': return 1400;
    case 'Moderate': return 1000;
    case 'Normal': return 650;
    default: return 800;
  }
}

export function initAdminFloodMap(containerId = 'leafletMap') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Clean up if an instance already exists
  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (e) {}
    mapInstance = null;
  }

  // Create Leaflet Map
  mapInstance = L.map(containerId, {
    center: KAMRUP_CENTER,
    zoom: DEFAULT_ZOOM,
    minZoom: 9,
    maxZoom: 18,
    zoomControl: false // Using custom HUD zoom controls
  });

  // Standard OpenStreetMap Tile Layer (100% Free, NO API Key Required, Clean Geographic Details)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19
  }).addTo(mapInstance);

  // Layer Groups
  riverLayerGroup = L.layerGroup().addTo(mapInstance);
  zonesLayerGroup = L.layerGroup().addTo(mapInstance);
  facilitiesLayerGroup = L.layerGroup().addTo(mapInstance);
  tempPickLayer = L.layerGroup().addTo(mapInstance);

  // Render River Corridors
  renderRiverCorridors();

  // Map Click Handler
  mapInstance.on('click', (e) => {
    const { lat, lng } = e.latlng;

    if (isMapPickActive) {
      // Complete location picking mode
      completeMapPick(lat, lng);
    } else {
      // General map click: offer quick action to mark this point
      tempPickLayer.clearLayers();

      const pulsePinIcon = L.divIcon({
        className: 'temp-pin-div',
        html: `
          <div style="position:relative; display:flex; align-items:center; justify-content:center;">
            <span style="position:absolute; width:34px; height:34px; border-radius:50%; background:#0284c7; animation:pinPulseAnim 1.8s infinite; opacity:0.5;"></span>
            <div style="width:24px; height:24px; border-radius:50%; background:#0284c7; color:#fff; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-size:11px;">
              <i class="fas fa-location-crosshairs"></i>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16]
      });

      const tempMarker = L.marker([lat, lng], { icon: pulsePinIcon }).addTo(tempPickLayer);

      const clickPopup = `
        <div style="text-align:center; padding:6px 4px; min-width:190px;">
          <div style="font-size:11px; font-weight:800; color:#0f172a; margin-bottom:2px;">
            <i class="fas fa-location-dot" style="color:#0284c7;"></i> Pinned GPS Point
          </div>
          <div style="font-size:11.5px; font-weight:700; color:#0369a1; background:#f0f9ff; padding:3px 6px; border-radius:4px; margin-bottom:8px; border:1px solid #bae6fd;">
            ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
          <button type="button" class="popup-btn-edit" style="width:100%; justify-content:center; padding:6px;" onclick="window.openAreaModalWithCoords && window.openAreaModalWithCoords(${lat.toFixed(4)}, ${lng.toFixed(4)})">
            <i class="fas fa-plus-circle"></i> Mark Flood Zone Here
          </button>
        </div>
      `;

      tempMarker.bindPopup(clickPopup).openPopup();
    }
  });

  // Ensure Leaflet tiles render completely on mount
  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 250);

  return mapInstance;
}

function renderRiverCorridors() {
  if (!riverLayerGroup) return;
  riverLayerGroup.clearLayers();

  // Outer ambient river glow
  L.polyline(BRAHMAPUTRA_PATH, {
    color: '#38bdf8',
    weight: 14,
    opacity: 0.35,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(riverLayerGroup);

  // Core Brahmaputra stream line
  const mainRiver = L.polyline(BRAHMAPUTRA_PATH, {
    color: '#0284c7',
    weight: 6.5,
    opacity: 0.85,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(riverLayerGroup);

  mainRiver.bindTooltip('<b>Brahmaputra River Basin (Kamrup Sector)</b><br><span style="color:#0284c7;">Active Water Level: 18.2 m (Danger: 18.0 m)</span>', {
    sticky: true,
    className: 'leaflet-river-tooltip'
  });

  // Tributary stream
  L.polyline(KULSI_PATH, {
    color: '#0ea5e9',
    weight: 3.5,
    opacity: 0.75,
    dashArray: '6, 6'
  }).addTo(riverLayerGroup);
}

export function updateMapLayers(areas = [], facilities = []) {
  if (!mapInstance || !zonesLayerGroup || !facilitiesLayerGroup) return;

  zonesLayerGroup.clearLayers();
  facilitiesLayerGroup.clearLayers();

  // 1. RENDER FLOOD AFFECTED AREAS
  areas.forEach((area, idx) => {
    const lat = Number(area.lat);
    const lng = Number(area.lng);
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

    // Filter check
    if (activeSeverityFilter !== 'ALL' && area.severity !== activeSeverityFilter) {
      return;
    }

    const color = getSeverityColor(area.severity);
    const radius = getSeverityRadius(area.severity);

    // Inundation Risk Buffer Circle
    L.circle([lat, lng], {
      color: color,
      fillColor: color,
      fillOpacity: area.severity === 'Critical' ? 0.28 : 0.18,
      weight: area.severity === 'Critical' ? 2.5 : 1.5,
      radius: radius
    }).addTo(zonesLayerGroup);

    // Custom HTML Marker Icon
    const iconHtml = `
      <div class="custom-flood-pin ${area.severity.toLowerCase()}">
        <span class="pin-pulse" style="background:${color};"></span>
        <div class="pin-head" style="background:${color};">
          <i class="fas fa-triangle-exclamation"></i>
        </div>
        <div class="pin-title">${area.name}</div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'flood-marker-div',
      html: iconHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 26],
      popupAnchor: [0, -28]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(zonesLayerGroup);

    // Rich Interactive Popup
    const popupContent = `
      <div class="map-rich-popup">
        <div class="popup-top">
          <div>
            <h4 style="margin:0 0 2px; font-size:13px; font-weight:800; color:#0f172a;">${area.name}</h4>
            <span style="font-size:10.5px; color:#64748b; font-weight:600;">${area.block || 'Kamrup'}</span>
          </div>
          <span class="sev-pill" style="background:${color}15; color:${color}; font-weight:800; border:1px solid ${color}30; padding:2px 8px; border-radius:12px; font-size:10px;">${area.severity}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin:8px 0; font-size:11px; background:#f8fafc; padding:6px 8px; border-radius:6px; border:1px solid #e2e8f0;">
          <span>Pop: <strong style="color:#0369a1;">${Number(area.pop || 0).toLocaleString()}</strong></span>
          <span>GPS: <strong style="color:#334155;">${lat.toFixed(3)}, ${lng.toFixed(3)}</strong></span>
        </div>
        <p style="margin:0 0 8px; font-size:11px; color:#475569; line-height:1.35;">${area.notes || 'Inundation telemetry active.'}</p>
        <div style="display:flex; gap:6px;">
          <button type="button" class="popup-btn-edit" onclick="window.editAreaRecord && window.editAreaRecord(${idx})">
            <i class="fas fa-edit"></i> Edit Zone
          </button>
          <button type="button" class="popup-btn-zoom" onclick="window.zoomToCoords && window.zoomToCoords(${lat}, ${lng})">
            <i class="fas fa-crosshairs"></i> Focus
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, { minWidth: 220 });
  });

  // 2. RENDER EMERGENCY FACILITIES
  facilities.forEach((fac, idx) => {
    let fLat = 26.125 + (idx * 0.02 - 0.03);
    let fLng = 91.46 + (idx * 0.025 - 0.03);

    let catIcon = 'fa-hospital';
    let catColor = '#dc2626';
    const cat = (fac.category || '').toLowerCase();
    if (cat.includes('police')) {
      catIcon = 'fa-shield-halved';
      catColor = '#0284c7';
    } else if (cat.includes('camp') || cat.includes('shelter')) {
      catIcon = 'fa-campground';
      catColor = '#16a34a';
    }

    const facIconHtml = `
      <div class="custom-fac-pin" style="background:${catColor};">
        <i class="fas ${catIcon}"></i>
      </div>
    `;

    const facIcon = L.divIcon({
      className: 'fac-marker-div',
      html: facIconHtml,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -16]
    });

    const facMarker = L.marker([fLat, fLng], { icon: facIcon }).addTo(facilitiesLayerGroup);

    facMarker.bindPopup(`
      <div class="map-rich-popup">
        <h4 style="margin:0 0 3px; font-size:12.5px; color:#0f172a;">${fac.name}</h4>
        <div style="font-size:11px; color:#64748b; margin-bottom:6px;">${fac.category} • ${fac.distance}</div>
        <div style="font-size:11px; font-weight:700; color:#16a34a; margin-bottom:6px;">Helpline: ${fac.contact}</div>
        <button type="button" class="popup-btn-edit" onclick="window.copyHelpline && window.copyHelpline('${fac.contact}')">
          <i class="fas fa-phone"></i> Call / Copy
        </button>
      </div>
    `, { minWidth: 200 });
  });
}

// =========================================================================
// INTERACTIVE MAP LOCATION PICKING MODE
// =========================================================================

export function startMapPickMode() {
  isMapPickActive = true;
  document.body.style.cursor = 'crosshair';

  // Show top banner inside map viewport
  const banner = document.getElementById('mapPickBanner');
  if (banner) banner.style.display = 'flex';

  // Ensure map is visible (switch to map-hub tab if on another tab)
  if (window.switchTab) {
    const mapBtn = document.querySelectorAll('.rail-btn')[0];
    window.switchTab('map-hub', mapBtn);
  }

  // Close the modal so user can see the map clearly
  if (window.closeModal) {
    window.closeModal('areaModal');
  }

  if (window.showToast) {
    window.showToast('🎯 Map Pinning Active: Click anywhere on the map to place the flood zone marker.');
  }
}

export function cancelMapPick() {
  isMapPickActive = false;
  document.body.style.cursor = 'default';

  const banner = document.getElementById('mapPickBanner');
  if (banner) banner.style.display = 'none';

  if (window.showToast) {
    window.showToast('Map location picking cancelled.');
  }

  // Re-open area modal
  const modal = document.getElementById('areaModal');
  if (modal) modal.classList.add('open');
}

function completeMapPick(lat, lng) {
  isMapPickActive = false;
  document.body.style.cursor = 'default';

  const banner = document.getElementById('mapPickBanner');
  if (banner) banner.style.display = 'none';

  // Drop temporary highlight marker
  if (tempPickLayer) {
    tempPickLayer.clearLayers();
    const tempIcon = L.divIcon({
      className: 'temp-pin-div',
      html: `
        <div style="position:relative; display:flex; align-items:center; justify-content:center;">
          <span style="position:absolute; width:40px; height:40px; border-radius:50%; background:#dc2626; animation:pinPulseAnim 1.8s infinite; opacity:0.6;"></span>
          <div style="width:26px; height:26px; border-radius:50%; background:#dc2626; color:#fff; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.4); font-size:12px;">
            <i class="fas fa-map-pin"></i>
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker([lat, lng], { icon: tempIcon }).addTo(tempPickLayer);
  }

  // Update input fields in areaModal
  const latInp = document.getElementById('inpAreaLat');
  const lngInp = document.getElementById('inpAreaLng');
  const statusLbl = document.getElementById('lblMapPickStatus');

  if (latInp) {
    latInp.value = lat.toFixed(4);
    latInp.style.borderColor = '#16a34a';
    latInp.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.2)';
  }
  if (lngInp) {
    lngInp.value = lng.toFixed(4);
    lngInp.style.borderColor = '#16a34a';
    lngInp.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.2)';
  }
  if (statusLbl) {
    statusLbl.innerHTML = `<span style="color:#16a34a; font-weight:700;"><i class="fas fa-circle-check"></i> GPS Captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}</span>`;
  }

  // Re-open area modal
  const modal = document.getElementById('areaModal');
  if (modal) modal.classList.add('open');

  if (window.showToast) {
    window.showToast(`✓ Coordinates captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  }
}

// Quick action from general map click
export function openAreaModalWithCoords(lat, lng) {
  if (tempPickLayer) tempPickLayer.closePopup();

  if (window.openAreaModal) {
    window.openAreaModal();
  }

  const latInp = document.getElementById('inpAreaLat');
  const lngInp = document.getElementById('inpAreaLng');
  const statusLbl = document.getElementById('lblMapPickStatus');

  if (latInp) latInp.value = Number(lat).toFixed(4);
  if (lngInp) lngInp.value = Number(lng).toFixed(4);
  if (statusLbl) {
    statusLbl.innerHTML = `<span style="color:#16a34a; font-weight:700;"><i class="fas fa-circle-check"></i> GPS Captured: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}</span>`;
  }
}

// Map Action Helpers for Window Interface
export function mapZoomIn() {
  if (mapInstance) mapInstance.zoomIn();
}

export function mapZoomOut() {
  if (mapInstance) mapInstance.zoomOut();
}

export function mapRecenter() {
  if (mapInstance) {
    mapInstance.setView(KAMRUP_CENTER, DEFAULT_ZOOM, { animate: true });
    if (window.showToast) window.showToast('Recentered to Kamrup District GIS View');
  }
}

export function zoomToCoords(lat, lng) {
  if (mapInstance) {
    mapInstance.setView([lat, lng], 14, { animate: true });
  }
}

export function setSeverityFilter(sev) {
  activeSeverityFilter = sev;
  document.querySelectorAll('.map-legend-pill span').forEach(el => {
    if (el.textContent.trim() === sev || (sev === 'ALL' && el.textContent.includes('All'))) {
      el.style.opacity = '1';
      el.style.fontWeight = '800';
    } else {
      el.style.opacity = sev === 'ALL' ? '1' : '0.45';
      el.style.fontWeight = '600';
    }
  });

  const areas = (window.adminState && window.adminState.areas) || [];
  const facilities = (window.adminState && window.adminState.facilities) || [];
  updateMapLayers(areas, facilities);
}

export function triggerPinZoneMode() {
  startMapPickMode();
}

export function triggerPinFacilityMode() {
  startMapPickMode();
}

export function searchMapLocation(query) {
  if (!query || !query.trim() || !mapInstance) return;
  const q = query.trim().toLowerCase();

  const areas = (window.adminState && window.adminState.areas) || [];
  const found = areas.find(a => a.name.toLowerCase().includes(q) || (a.block || '').toLowerCase().includes(q));
  if (found && found.lat && found.lng) {
    mapInstance.setView([Number(found.lat), Number(found.lng)], 14, { animate: true });
    if (window.showToast) window.showToast(`Found flood sector: ${found.name}`);
    return;
  }

  if (q.includes('brahmaputra')) {
    mapInstance.setView([26.18, 91.68], 12, { animate: true });
    if (window.showToast) window.showToast('Focused on Brahmaputra River Basin');
  } else {
    if (window.showToast) window.showToast(`No exact match for "${query}". Try "Palashbari" or "Chaygaon"`);
  }
}
