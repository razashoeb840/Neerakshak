// NEERAKSHAK Pan-India GIS Flood Map Engine (Leaflet Powered)
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  INDIA_DISTRICT_SECTORS,
  INDIA_RIVER_SYSTEMS,
  detectNearestRiver,
  autoDetectLocation,
  getRiversForDistrict
} from './indiaGisData.js';

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

// Default to India Flood Command Center / Kamrup Sector
const INITIAL_CENTER = [26.15, 91.60];
const INITIAL_ZOOM = 11;

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
    case 'Critical': return 2200;
    case 'High': return 1600;
    case 'Moderate': return 1100;
    case 'Normal': return 750;
    default: return 900;
  }
}

export function initAdminFloodMap(containerId = 'leafletMap', initialCoords, initialZoom, basinKey) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Clean up if an instance already exists
  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (e) {}
    mapInstance = null;
  }

  const center = initialCoords || INITIAL_CENTER;
  const zoom = initialZoom || INITIAL_ZOOM;

  // Create Leaflet Map Covering Whole India (minZoom 4 to 19)
  mapInstance = L.map(containerId, {
    center: center,
    zoom: zoom,
    minZoom: 4,
    maxZoom: 19,
    zoomControl: false // Using custom HUD zoom controls
  });

  // Standard OpenStreetMap Tile Layer (100% Free, NO API Key Required, Clean India & Global Geo Data)
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

  // Render Major Indian River Basin Corridors (scoped or pan-India)
  renderAllIndianRiverCorridors(basinKey);

  // Map Click Handler with Automatic Location & River Detection
  mapInstance.on('click', async (e) => {
    const { lat, lng } = e.latlng;

    if (isMapPickActive) {
      await completeMapPick(lat, lng);
    } else {
      tempPickLayer.clearLayers();

      const pulsePinIcon = L.divIcon({
        className: 'temp-pin-div',
        html: `
          <div style="position:relative; display:flex; align-items:center; justify-content:center;">
            <span style="position:absolute; width:34px; height:34px; border-radius:50%; background:#0284c7; animation:pinPulseAnim 1.8s infinite; opacity:0.5;"></span>
            <div style="width:24px; height:24px; border-radius:50%; background:#0284c7; color:#fff; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-size:11px;">
              <i class="fas fa-crosshairs"></i>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16]
      });

      const tempMarker = L.marker([lat, lng], { icon: pulsePinIcon }).addTo(tempPickLayer);

      // Instant reverse geocode & river fetch for popup
      tempMarker.bindPopup(`
        <div style="text-align:center; padding:6px; min-width:180px;">
          <div style="font-size:11px; color:#64748b;"><i class="fas fa-spinner fa-spin"></i> Detecting location & river…</div>
        </div>
      `).openPopup();

      const detected = await autoDetectLocation(lat, lng);
      const isBreach = detected.river.isDanger;
      const statusBadge = isBreach
        ? `<span style="background:#fee2e2; color:#dc2626; padding:2px 6px; border-radius:4px; font-weight:800; font-size:9.5px;">⚠️ ABOVE DANGER (${detected.river.current}m)</span>`
        : `<span style="background:#dcfce7; color:#15803d; padding:2px 6px; border-radius:4px; font-weight:700; font-size:9.5px;">✓ Safe Level (${detected.river.current}m)</span>`;

      const clickPopup = `
        <div style="text-align:center; padding:6px 4px; min-width:220px;">
          <div style="font-size:12.5px; font-weight:800; color:#0f172a; margin-bottom:2px;">
            <i class="fas fa-location-dot" style="color:#0284c7;"></i> ${detected.name}
          </div>
          <div style="font-size:10.5px; color:#64748b; font-weight:600; margin-bottom:6px;">
            ${detected.block}
          </div>
          <div style="font-size:11px; background:#f0f9ff; padding:5px 8px; border-radius:6px; margin-bottom:8px; border:1px solid #bae6fd; text-align:left;">
            <div style="font-weight:700; color:#0369a1; margin-bottom:2px;">🌊 ${detected.river.name}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:10px; color:#475569;">Danger: ${detected.river.danger}m</span>
              ${statusBadge}
            </div>
          </div>
          <button type="button" class="popup-btn-edit" style="width:100%; justify-content:center; padding:7px; font-size:11.5px;" onclick="window.openAreaModalWithCoords && window.openAreaModalWithCoords(${lat.toFixed(4)}, ${lng.toFixed(4)}, '${detected.name.replace(/'/g, "\\'")}', '${detected.block.replace(/'/g, "\\'")}', '${detected.river.name}', ${detected.river.current}, ${detected.river.danger})">
            <i class="fas fa-plus-circle"></i> Mark Flood Zone Here
          </button>
        </div>
      `;

      tempMarker.setPopupContent(clickPopup);
    }
  });

  // Invalidate size once rendered
  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 250);

  return mapInstance;
}

// Render Major Indian River Basin Corridors with glowing polylines and hover status
function renderAllIndianRiverCorridors() {
  if (!riverLayerGroup) return;
  riverLayerGroup.clearLayers();

  INDIA_RIVER_SYSTEMS.forEach(riv => {
    if (!riv.path || riv.path.length < 2) return;

    const isDanger = Number(riv.current) >= Number(riv.danger);
    const color = isDanger ? '#dc2626' : '#0284c7';
    const glowColor = isDanger ? 'rgba(220, 38, 38, 0.35)' : 'rgba(56, 189, 248, 0.35)';

    // Ambient glow polyline
    L.polyline(riv.path, {
      color: glowColor,
      weight: 12,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(riverLayerGroup);

    // River centerline
    const riverLine = L.polyline(riv.path, {
      color: color,
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(riverLayerGroup);

    riverLine.bindTooltip(`
      <div style="font-size:11px;">
        <strong style="color:${color}; font-size:12px;">${riv.name}</strong> (${riv.basin})<br>
        <span>Current Level: <b>${riv.current} m</b></span> | <span>Danger Mark: <b>${riv.danger} m</b></span><br>
        <span style="font-weight:700; color:${isDanger ? '#dc2626' : '#16a34a'};">${isDanger ? '⚠️ CRITICAL: Exceeded Danger Mark' : '✓ Normal Hydrological Flow'}</span>
      </div>
    `, { sticky: true, className: 'leaflet-river-tooltip' });
  });
}

export function updateMapLayers(areas = [], facilities = []) {
  if (!mapInstance || !zonesLayerGroup || !facilitiesLayerGroup) return;

  zonesLayerGroup.clearLayers();
  facilitiesLayerGroup.clearLayers();

  // 1. RENDER FLOOD AFFECTED AREAS ACROSS INDIA
  areas.forEach((area, idx) => {
    const lat = Number(area.lat);
    const lng = Number(area.lng);
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

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

    // River danger detail
    const riverName = area.river || detectNearestRiver(lat, lng).name;
    const riverCur = area.riverCurrent !== undefined ? area.riverCurrent : '18.2';
    const riverDang = area.riverDanger !== undefined ? area.riverDanger : '18.0';
    const isOver = Number(riverCur) >= Number(riverDang);

    const popupContent = `
      <div class="map-rich-popup">
        <div class="popup-top">
          <div>
            <h4 style="margin:0 0 2px; font-size:13px; font-weight:800; color:#0f172a;">${area.name}</h4>
            <span style="font-size:10.5px; color:#64748b; font-weight:600;">${area.block || 'District Sector'}</span>
          </div>
          <span class="sev-pill" style="background:${color}15; color:${color}; font-weight:800; border:1px solid ${color}30; padding:2px 8px; border-radius:12px; font-size:10px;">${area.severity}</span>
        </div>

        <div style="background:#f0f9ff; border:1px solid #bae6fd; padding:6px 8px; border-radius:6px; margin:7px 0; font-size:10.5px;">
          <div style="font-weight:700; color:#0369a1; margin-bottom:2px;"><i class="fas fa-water"></i> ${riverName}</div>
          <div style="display:flex; justify-content:space-between;">
            <span>Level: <strong>${riverCur} m</strong></span>
            <span style="color:${isOver ? '#dc2626' : '#16a34a'}; font-weight:700;">Danger: ${riverDang} m (${isOver ? 'BREACHED' : 'SAFE'})</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:7px; font-size:11px; background:#f8fafc; padding:5px 8px; border-radius:6px; border:1px solid #e2e8f0;">
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

    marker.bindPopup(popupContent, { minWidth: 230 });
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
// FLY TO DISTRICT / SECTOR FROM TOP DROPDOWN (ALL INDIA)
// =========================================================================

export function flyToDistrictSector(districtId) {
  if (!mapInstance) return;

  const sector = INDIA_DISTRICT_SECTORS.find(s => s.id === districtId);
  if (!sector) return;

  mapInstance.flyTo(sector.coords, sector.zoom, {
    duration: 1.6,
    easeLinearity: 0.25
  });

  if (window.showToast) {
    window.showToast(`🛰️ Switched to ${sector.name} (${sector.basin})`);
  }
}

// =========================================================================
// INTERACTIVE MAP LOCATION PICKING & AUTO-DETECTION
// =========================================================================

export function startMapPickMode() {
  isMapPickActive = true;
  document.body.style.cursor = 'crosshair';

  const banner = document.getElementById('mapPickBanner');
  if (banner) banner.style.display = 'flex';

  if (window.switchTab) {
    const mapBtn = document.querySelectorAll('.rail-btn')[0];
    window.switchTab('map-hub', mapBtn);
  }

  if (window.closeModal) {
    window.closeModal('areaModal');
  }

  if (window.showToast) {
    window.showToast('🎯 Click anywhere on the map to automatically detect village, block & river level.');
  }
}

export function cancelMapPick() {
  isMapPickActive = false;
  document.body.style.cursor = 'default';

  const banner = document.getElementById('mapPickBanner');
  if (banner) banner.style.display = 'none';

  const modal = document.getElementById('areaModal');
  if (modal) modal.classList.add('open');
}

async function completeMapPick(lat, lng) {
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

  if (window.showToast) {
    window.showToast('🔍 Auto-detecting Village, Block & River Telemetry…');
  }

  // AUTO-DETECT LOCATION & RIVER TELEMETRY (SCOPED TO ACTIVE BASIN)
  const activeBasinKey = (window.activeUserBasin && window.activeUserBasin.id) || 'bk';
  const detected = await autoDetectLocation(lat, lng, activeBasinKey);

  // Auto-fill all inputs in areaModal
  const nameInp = document.getElementById('inpAreaName');
  const blockInp = document.getElementById('inpAreaBlock');
  const latInp = document.getElementById('inpAreaLat');
  const lngInp = document.getElementById('inpAreaLng');
  const riverInp = document.getElementById('inpAreaRiver');
  const curInp = document.getElementById('inpRiverCur');
  const dangInp = document.getElementById('inpRiverDanger');
  const detectBadge = document.getElementById('geoDetectBadge');

  if (nameInp) nameInp.value = detected.name;
  if (blockInp) blockInp.value = detected.block;
  if (latInp) {
    latInp.value = Number(lat).toFixed(4);
    latInp.style.borderColor = '#16a34a';
  }
  if (lngInp) {
    lngInp.value = Number(lng).toFixed(4);
    lngInp.style.borderColor = '#16a34a';
  }

  if (riverInp) riverInp.value = detected.river.name;
  if (curInp) curInp.value = detected.river.current;
  if (dangInp) dangInp.value = detected.river.danger;

  if (window.calcRiverDangerStatus) {
    window.calcRiverDangerStatus();
  }

  if (detectBadge) {
    detectBadge.style.display = 'flex';
    detectBadge.innerHTML = `
      <i class="fas fa-circle-check" style="color:#10b981;"></i>
      <span>Auto-detected: <strong>${detected.name}</strong> (${detected.block}) • Nearest River: <strong>${detected.river.name}</strong></span>
    `;
  }

  // Re-open area modal with everything prefilled!
  const modal = document.getElementById('areaModal');
  if (modal) modal.classList.add('open');

  if (window.showToast) {
    window.showToast(`✓ Auto-detected: ${detected.name}, ${detected.district}`);
  }
}

// Quick action from general map click
export function openAreaModalWithCoords(lat, lng, name = '', block = '', river = '', cur = '', danger = '') {
  if (tempPickLayer) tempPickLayer.closePopup();

  if (window.openAreaModal) {
    window.openAreaModal();
  }

  const nameInp = document.getElementById('inpAreaName');
  const blockInp = document.getElementById('inpAreaBlock');
  const latInp = document.getElementById('inpAreaLat');
  const lngInp = document.getElementById('inpAreaLng');
  const riverInp = document.getElementById('inpAreaRiver');
  const curInp = document.getElementById('inpRiverCur');
  const dangInp = document.getElementById('inpRiverDanger');
  const detectBadge = document.getElementById('geoDetectBadge');

  if (name && nameInp) nameInp.value = name;
  if (block && blockInp) blockInp.value = block;
  if (latInp) latInp.value = Number(lat).toFixed(4);
  if (lngInp) lngInp.value = Number(lng).toFixed(4);

  if (river && riverInp) riverInp.value = river;
  if (cur && curInp) curInp.value = cur;
  if (danger && dangInp) dangInp.value = danger;

  if (window.calcRiverDangerStatus) {
    window.calcRiverDangerStatus();
  }

  if (detectBadge && name) {
    detectBadge.style.display = 'flex';
    detectBadge.innerHTML = `
      <i class="fas fa-circle-check" style="color:#10b981;"></i>
      <span>Auto-detected: <strong>${name}</strong> (${block}) • River: <strong>${river}</strong></span>
    `;
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
    mapInstance.setView(INITIAL_CENTER, INITIAL_ZOOM, { animate: true });
    if (window.showToast) window.showToast('Recentered to Active Flood Command Sector');
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
  const userBasin = window.activeUserBasin;

  // 1. Check if user typed an assigned sector within their river basin
  const basinSectors = (userBasin && userBasin.sectors) || INDIA_DISTRICT_SECTORS;
  const foundSector = basinSectors.find(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || (s.block && s.block.toLowerCase().includes(q)));
  if (foundSector) {
    flyToDistrictSector(foundSector.id);
    const sel = document.getElementById('heroDistrictSelect');
    if (sel) sel.value = foundSector.id;
    if (window.showToast) window.showToast(`Navigated to ${foundSector.name}`);
    return;
  }

  // 2. Strict Isolation: Check if they are trying to search an outside sector
  const isOutsideSector = INDIA_DISTRICT_SECTORS.some(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  if (isOutsideSector && userBasin) {
    if (window.showToast) window.showToast(`⚠️ Sector outside your assigned ${userBasin.basinName} jurisdiction. Access restricted.`);
    return;
  }

  // 3. Check if user typed an assigned basin river name
  const basinRivers = (userBasin && userBasin.rivers) || INDIA_RIVER_SYSTEMS;
  const foundRiver = basinRivers.find(r => r.name.toLowerCase().includes(q) || r.basin.toLowerCase().includes(q));
  if (foundRiver && foundRiver.center) {
    mapInstance.setView(foundRiver.center, 12, { animate: true });
    if (window.showToast) window.showToast(`Focused on ${foundRiver.name} (${foundRiver.basin})`);
    return;
  }

  // 4. Check active flood zone records
  const areas = (window.adminState && window.adminState.areas) || [];
  const found = areas.find(a => a.name.toLowerCase().includes(q) || (a.block || '').toLowerCase().includes(q));
  if (found && found.lat && found.lng) {
    mapInstance.setView([Number(found.lat), Number(found.lng)], 14, { animate: true });
    if (window.showToast) window.showToast(`Found flood sector: ${found.name}`);
    return;
  }

  if (window.showToast) window.showToast(`No matching locations within your assigned operational basin.`);
}
