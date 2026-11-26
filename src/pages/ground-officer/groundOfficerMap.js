// NEERAKSHAK Ground Officer GIS Flood Operations Map Engine
// Real Leaflet GIS Map for field sectors, river corridors, inundation perimeters & CWC gauges

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  INDIA_DISTRICT_SECTORS,
  INDIA_RIVER_SYSTEMS,
  USER_BASIN_REGISTRY,
  resolveUserBasin
} from '../admin/indiaGisData.js';

let mapInstance = null;
let riverLayerGroup = null;
let areaLayerGroup = null;
let markerMap = new Map();
let activeSeverityFilter = 'ALL';
let currentCenter = [26.15, 91.55];
let currentZoom = 11;

// Fix Leaflet marker icons with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function getSeverityColor(sev) {
  switch (sev) {
    case 'Critical': return '#dc2626';
    case 'High': return '#ea580c';
    case 'Moderate': return '#eab308';
    case 'Normal': return '#16a34a';
    default: return '#0284c7';
  }
}

export function parseAreaCoordinates(area) {
  if (!area) return [26.15, 91.55];
  if (area.lat !== undefined && area.lng !== undefined) {
    const lat = Number(area.lat);
    const lng = Number(area.lng);
    if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) return [lat, lng];
  }
  if (typeof area.coords === 'string') {
    // Matches "26.1320° N, 91.5150° E" or "26.132, 91.515"
    const cleaned = area.coords.replace(/[^\d.,-]/g, ' ').trim();
    const parts = cleaned.split(/[\s,]+/).filter(Boolean);
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) return [lat, lng];
    }
  }
  return [26.15, 91.55];
}

export function initGroundFloodMap(containerId = 'groundLeafletMap', initialCoords = null, initialZoom = null, basinKey = 'bk') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (mapInstance) {
    try { mapInstance.remove(); } catch (e) {}
    mapInstance = null;
  }

  // Ensure initial coordinates are strictly valid finite numbers
  let safeCoords = [26.15, 91.55];
  if (Array.isArray(initialCoords) && initialCoords.length >= 2) {
    const lat = Number(initialCoords[0]);
    const lng = Number(initialCoords[1]);
    if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
      safeCoords = [lat, lng];
    }
  }
  currentCenter = safeCoords;
  currentZoom = (initialZoom && !isNaN(Number(initialZoom))) ? Number(initialZoom) : 11;

  mapInstance = L.map(containerId, {
    center: currentCenter,
    zoom: currentZoom,
    minZoom: 4,
    maxZoom: 18,
    zoomControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 18
  }).addTo(mapInstance);

  riverLayerGroup = L.layerGroup().addTo(mapInstance);
  areaLayerGroup = L.layerGroup().addTo(mapInstance);

  window.groundLeafletMapInstance = mapInstance;
  window.focusGroundMap = focusGroundMap;

  // Render basin river corridors & CWC stations
  renderGroundRivers(basinKey);

  // Invalidate size immediately and after layout paint
  requestAnimationFrame(() => {
    if (mapInstance) mapInstance.invalidateSize();
  });
  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 120);
  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 400);
  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 900);

  return mapInstance;
}

export function focusGroundMap(lat, lng, zoom = 14, villageName = null) {
  if (mapInstance && lat && lng) {
    mapInstance.flyTo([Number(lat), Number(lng)], zoom, { duration: 1.2 });
    if (villageName) {
      setTimeout(() => {
        const m = markerMap.get(villageName.toLowerCase());
        if (m) m.openPopup();
      }, 700);
    }
  }
}

export function autoCenterGroundMapOnAreas(areas = []) {
  if (!mapInstance || !Array.isArray(areas) || areas.length === 0) return;
  
  if (areas.length === 1) {
    const [lat, lng] = parseAreaCoordinates(areas[0]);
    if (!isNaN(lat) && !isNaN(lng)) {
      focusGroundMap(lat, lng, 13, areas[0].village);
      return;
    }
  }

  const bounds = L.latLngBounds();
  let validCount = 0;
  areas.forEach(a => {
    const [lat, lng] = parseAreaCoordinates(a);
    if (!isNaN(lat) && !isNaN(lng)) {
      bounds.extend([lat, lng]);
      validCount++;
    }
  });

  if (validCount > 0 && bounds.isValid()) {
    mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }
}

// Render River Basin Polylines & Live CWC Gauges
export function renderGroundRivers(basinKey = 'bk') {
  if (!riverLayerGroup || !mapInstance) return;
  try {
    riverLayerGroup.clearLayers();

    const basinObj = USER_BASIN_REGISTRY[basinKey] || USER_BASIN_REGISTRY['bk'];
    const rivers = (basinObj && basinObj.rivers) || INDIA_RIVER_SYSTEMS;

    rivers.forEach(r => {
      if (!r) return;
      const rName = String(r.name || 'River');
      const currentVal = Number(r.current || 0);
      const dangerVal = Number(r.danger || 0);
      const isDanger = currentVal >= dangerVal;
      const isWarning = !isDanger && currentVal >= (dangerVal - 0.8);

      const riverColor = isDanger ? '#dc2626' : (isWarning ? '#f97316' : '#0284c7');
      const glowColor = isDanger ? 'rgba(220, 38, 38, 0.45)' : (isWarning ? 'rgba(249, 115, 22, 0.4)' : 'rgba(56, 189, 248, 0.4)');

      // Polyline Corridor
      if (Array.isArray(r.path) && r.path.length >= 2) {
        L.polyline(r.path, {
          color: glowColor,
          weight: 12,
          opacity: 0.5,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(riverLayerGroup);

        const line = L.polyline(r.path, {
          color: riverColor,
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(riverLayerGroup);

        line.bindTooltip(`
          <div style="font-size:11px; font-family:'Poppins',sans-serif;">
            <strong style="color:${riverColor};">🌊 ${rName}</strong><br/>
            <span>Current: <strong>${currentVal.toFixed(2)} m</strong> (Danger: ${dangerVal.toFixed(2)} m)</span>
          </div>
        `, { sticky: true });
      }

      // Station Marker
      const coords = r.center || (r.path && r.path[0]);
      if (coords && Array.isArray(coords) && coords.length === 2) {
        const iconHtml = `
          <div style="position:relative; display:flex; align-items:center; justify-content:center;">
            <span style="position:absolute; width:34px; height:34px; border-radius:50%; background:${riverColor}; opacity:0.5; animation:pinPulseAnim 2s infinite ease-out;"></span>
            <div style="width:22px; height:22px; border-radius:50%; background:${riverColor}; color:#fff; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-size:10px; cursor:pointer;">
              <i class="fas fa-tower-broadcast"></i>
            </div>
            <div style="position:absolute; top:24px; background:rgba(7,34,71,0.92); color:#fff; padding:1px 5px; border-radius:6px; font-size:8.5px; font-weight:700; white-space:nowrap; border:1px solid #38bdf8;">
              ${r.stationCode || 'CWC'} • ${currentVal.toFixed(1)}m
            </div>
          </div>
        `;
        const icon = L.divIcon({
          className: 'cwc-ground-pin',
          html: iconHtml,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });
        L.marker(coords, { icon }).addTo(riverLayerGroup);
      }
    });
  } catch (err) {
    console.error('renderGroundRivers error:', err);
  }
}

// Render Assigned Flood-Affected Areas on Ground Map
export function updateGroundAreaMarkers(areas = []) {
  if (!areaLayerGroup || !mapInstance) return;
  try {
    areaLayerGroup.clearLayers();
    markerMap.clear();

    areas.forEach(a => {
      if (!a) return;
      if (activeSeverityFilter !== 'ALL' && a.severity !== activeSeverityFilter) {
        return;
      }

      const [lat, lng] = parseAreaCoordinates(a);
      const isCrit = a.severity === 'Critical';
      const color = getSeverityColor(a.severity);

      // Inundation buffer circle
      L.circle([lat, lng], {
        color: color,
        fillColor: color,
        fillOpacity: isCrit ? 0.32 : 0.18,
        weight: isCrit ? 2.5 : 1.5,
        radius: isCrit ? 2200 : 1400
      }).addTo(areaLayerGroup);

      // Custom Pin Marker
      const iconHtml = `
        <div style="position:relative; display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <span style="position:absolute; width:34px; height:34px; border-radius:50%; background:${color}; opacity:0.6; animation:pinPulseAnim 2s infinite;"></span>
          <div style="width:26px; height:26px; border-radius:50%; background:${color}; color:#fff; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 7px rgba(0,0,0,0.3); font-size:11px;">
            <i class="fas fa-location-dot"></i>
          </div>
          <div style="position:absolute; top:28px; background:${isCrit ? '#dc2626' : 'rgba(15,23,42,0.9)'}; color:#fff; font-size:9.5px; font-weight:700; padding:1.5px 6px; border-radius:6px; white-space:nowrap; border:1px solid ${isCrit ? '#fecaca' : 'rgba(255,255,255,0.2)'};">
            ${a.village} ${isCrit ? '<span style="color:#fef08a; margin-left:3px;">● CRITICAL</span>' : ''}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'ground-area-pin',
        html: iconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([lat, lng], { icon }).addTo(areaLayerGroup);
      if (a.village) {
        markerMap.set(a.village.toLowerCase(), marker);
      }

      // Popup with Live Actions
      const popupHtml = `
        <div style="font-family:'Poppins',sans-serif; min-width:240px; padding:2px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; border-bottom:1px solid #e2e8f0; padding-bottom:5px;">
            <strong style="color:#0f172a; font-size:13px;"><i class="fas fa-location-dot" style="color:${color}; margin-right:4px;"></i>${a.village}</strong>
            <span style="background:${color}; color:#fff; font-size:9.5px; padding:2px 6px; border-radius:6px; font-weight:700;">${a.severity}</span>
          </div>
          <div style="font-size:11px; color:#475569; margin-bottom:8px; line-height:1.4;">
            <div>Block: <strong>${a.block}</strong></div>
            <div>Status: <strong style="color:${color};">${a.status}</strong></div>
            <div>Task: <em>${a.task || 'Active ground surveillance'}</em></div>
          </div>
          <div style="display:flex; gap:6px;">
            <button onclick="window.selectGroundVillageForInspection && window.selectGroundVillageForInspection('${(a.village || '').replace(/'/g, "\\'")}')" style="flex:1; background:#0284c7; color:#fff; border:none; padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer;">
              Inspect Area
            </button>
            <button onclick="window.switchGroundTab && window.switchGroundTab('field-reports', document.querySelector('[data-tab=field-reports]'))" style="flex:1; background:#0d9488; color:#fff; border:none; padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer;">
              File SITREP
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });
      marker.on('click', () => {
        if (window.selectGroundVillageForInspection) {
          window.selectGroundVillageForInspection(a.village);
        }
      });
    });
  } catch (err) {
    console.error('updateGroundAreaMarkers error:', err);
  }
}

export function filterGroundMapSeverity(sev) {
  activeSeverityFilter = sev;
  const areas = (window.groundState && window.groundState.areas) || [];
  updateGroundAreaMarkers(areas);
  if (window.showToast) window.showToast(`Map filtered: ${sev} flood sectors`);
}

export function searchGroundMap(query) {
  if (!query || !mapInstance) return;
  const qClean = query.trim().toLowerCase();
  const areas = (window.groundState && window.groundState.areas) || [];
  const found = areas.find(a => 
    a.village.toLowerCase().includes(qClean) || (a.block && a.block.toLowerCase().includes(qClean))
  );
  if (found) {
    const [fLat, fLng] = parseAreaCoordinates(found);
    focusGroundMap(fLat, fLng, 14);
    if (window.showToast) window.showToast(`Found sector: ${found.village}`);
  } else {
    if (window.showToast) window.showToast(`No sector matching "${query}"`);
  }
}

export function groundMapZoomIn() {
  if (mapInstance) mapInstance.zoomIn();
}

export function groundMapZoomOut() {
  if (mapInstance) mapInstance.zoomOut();
}

export function groundMapRecenter() {
  if (mapInstance) {
    mapInstance.flyTo(currentCenter, currentZoom, { duration: 1 });
    if (window.showToast) window.showToast('Map recentered to operational command view');
  }
}

// Attach helpers to window
Object.assign(window, {
  initGroundFloodMap,
  focusGroundMap,
  autoCenterGroundMapOnAreas,
  updateGroundAreaMarkers,
  filterGroundMapSeverity,
  searchGroundMap,
  groundMapZoomIn,
  groundMapZoomOut,
  groundMapRecenter
});
