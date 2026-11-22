// NEERAKSHAK District GIS Flood Map Engine (Leaflet Powered)
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let mapInstance = null;
let zonesLayerGroup = null;
let facilitiesLayerGroup = null;
let riverLayerGroup = null;
let activeSeverityFilter = 'ALL';
let pinFloodZoneMode = false;
let pinFacilityMode = false;

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
    maxZoom: 17,
    zoomControl: false // Using our custom HUD zoom controls
  });

  // High-clarity Voyager tile layer (clean riparian rendering with clear water bodies)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(mapInstance);

  // Layer Groups
  riverLayerGroup = L.layerGroup().addTo(mapInstance);
  zonesLayerGroup = L.layerGroup().addTo(mapInstance);
  facilitiesLayerGroup = L.layerGroup().addTo(mapInstance);

  // Render River Corridors
  renderRiverCorridors();

  // Map Click Handler for Interactive Pinning
  mapInstance.on('click', (e) => {
    const { lat, lng } = e.latlng;
    if (pinFloodZoneMode) {
      pinFloodZoneMode = false;
      document.body.style.cursor = 'default';
      if (window.openAreaModal) {
        window.openAreaModal();
        const latInput = document.getElementById('inpAreaLat');
        const lngInput = document.getElementById('inpAreaLng');
        if (latInput) latInput.value = lat.toFixed(4);
        if (lngInput) lngInput.value = lng.toFixed(4);
        if (window.showToast) window.showToast(`Pinned GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } else if (pinFacilityMode) {
      pinFacilityMode = false;
      document.body.style.cursor = 'default';
      if (window.openFacilityModal) {
        window.openFacilityModal();
        const distInput = document.getElementById('inpFacDist');
        if (distInput) distInput.value = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        if (window.showToast) window.showToast(`Pinned facility location on map.`);
      }
    }
  });

  // Invalidate size once rendered
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
    // Generate approximate nearby GPS offsets if not stored explicitly
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
  // Visual active pill state
  document.querySelectorAll('.map-legend-pill span').forEach(el => {
    if (el.textContent.trim() === sev || (sev === 'ALL' && el.textContent.includes('All'))) {
      el.style.opacity = '1';
      el.style.fontWeight = '800';
    } else {
      el.style.opacity = sev === 'ALL' ? '1' : '0.45';
      el.style.fontWeight = '600';
    }
  });
}

export function triggerPinZoneMode() {
  pinFloodZoneMode = true;
  pinFacilityMode = false;
  document.body.style.cursor = 'crosshair';
  if (window.showToast) window.showToast('Click anywhere on the map to pin Flood Zone GPS coordinates.');
}

export function triggerPinFacilityMode() {
  pinFacilityMode = true;
  pinFloodZoneMode = false;
  document.body.style.cursor = 'crosshair';
  if (window.showToast) window.showToast('Click anywhere on the map to pin Emergency Facility.');
}

export function searchMapLocation(query) {
  if (!query || !query.trim() || !mapInstance) return;
  const q = query.trim().toLowerCase();

  // Check seed areas
  const areas = (window.adminState && window.adminState.areas) || [];
  const found = areas.find(a => a.name.toLowerCase().includes(q) || (a.block || '').toLowerCase().includes(q));
  if (found && found.lat && found.lng) {
    mapInstance.setView([Number(found.lat), Number(found.lng)], 14, { animate: true });
    if (window.showToast) window.showToast(`Found flood sector: ${found.name}`);
    return;
  }

  // Check river names
  if (q.includes('brahmaputra')) {
    mapInstance.setView([26.18, 91.68], 12, { animate: true });
    if (window.showToast) window.showToast('Focused on Brahmaputra River Basin');
  } else {
    if (window.showToast) window.showToast(`No exact match for "${query}". Try searching "Palashbari" or "Chaygaon"`);
  }
}
