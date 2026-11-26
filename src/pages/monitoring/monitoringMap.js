// NEERAKSHAK State Monitoring Officer GIS Flood Lifecycle Map Engine
// Real Leaflet GIS Map for district flood sectors, CWC gauge waterlevels, and river corridors

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

export function initMonitoringMap(containerId = 'monitoringLeafletMap', initialCoords = null, initialZoom = null, basinKey = 'bk') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (mapInstance) {
    try { mapInstance.remove(); } catch (e) {}
    mapInstance = null;
  }

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
    maxZoom: 19
  }).addTo(mapInstance);

  L.control.zoom({ position: 'topright' }).addTo(mapInstance);

  riverLayerGroup = L.layerGroup().addTo(mapInstance);
  areaLayerGroup = L.layerGroup().addTo(mapInstance);

  renderRiversForBasin(basinKey);

  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 250);

  return mapInstance;
}

export function renderRiversForBasin(basinKey = 'bk') {
  if (!mapInstance || !riverLayerGroup) return;
  riverLayerGroup.clearLayers();

  const basinInfo = USER_BASIN_REGISTRY[basinKey] || USER_BASIN_REGISTRY['bk'];
  const basinRivers = INDIA_RIVER_SYSTEMS.filter(r => r.basinId === basinKey || r.basin === basinInfo.name);

  basinRivers.forEach(river => {
    if (Array.isArray(river.coordinates) && river.coordinates.length > 1) {
      const isBreached = river.currentLevel >= river.dangerLevel;
      const polyline = L.polyline(river.coordinates, {
        color: isBreached ? '#dc2626' : '#0284c7',
        weight: isBreached ? 4 : 3,
        opacity: 0.85,
        dashArray: isBreached ? '6, 6' : null
      });

      polyline.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.5; padding: 4px;">
          <strong style="font-size: 13px; color: #0f172a;">${river.name}</strong><br/>
          <span style="color: #64748b;">Basin: ${river.basin}</span><br/>
          <span>Current Level: <b>${river.currentLevel} m</b> (Danger: ${river.dangerLevel} m)</span><br/>
          <span style="font-weight: 600; color: ${isBreached ? '#dc2626' : '#16a34a'};">
            ${isBreached ? '⚠️ DANGER LEVEL BREACHED' : '✅ Below Danger Mark'}
          </span>
        </div>
      `);
      polyline.addTo(riverLayerGroup);
    }
  });
}

export function autoCenterMonitoringMap(areas) {
  if (!mapInstance || !Array.isArray(areas) || areas.length === 0) return;
  const validPoints = [];

  for (const a of areas) {
    const coords = parseAreaCoordinates(a);
    if (coords && coords.length === 2) {
      const lat = Number(coords[0]);
      const lng = Number(coords[1]);
      if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) && (lat !== 26.15 || lng !== 91.55)) {
        validPoints.push([lat, lng]);
      }
    }
  }

  if (validPoints.length === 1) {
    mapInstance.setView(validPoints[0], 13, { animate: true });
  } else if (validPoints.length > 1) {
    const bounds = L.latLngBounds(validPoints);
    mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }
}

export function renderMonitoringAreas(areas = []) {
  if (!mapInstance || !areaLayerGroup) return;
  areaLayerGroup.clearLayers();
  markerMap.clear();

  areas.forEach(area => {
    if (activeSeverityFilter !== 'ALL' && area.severity !== activeSeverityFilter) {
      return;
    }

    const [lat, lng] = parseAreaCoordinates(area);
    const color = getSeverityColor(area.severity);
    const pulseAnim = area.severity === 'Critical' ? 'animation: pulse 1.5s infinite;' : '';

    const customIcon = L.divIcon({
      className: 'mo-map-marker',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${color};
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
          ${pulseAnim}
        ">
          <i class="fas fa-tower-broadcast"></i>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });

    const marker = L.marker([lat, lng], { icon: customIcon });

    const popupHtml = `
      <div style="font-family: inherit; font-size: 12px; line-height: 1.5; min-width: 180px; padding: 4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="font-size: 13px; color: #0f172a;">${area.name || area.village || 'Flood Sector'}</strong>
          <span style="background:${color}; color:#fff; font-size:9px; font-weight:700; padding:2px 6px; border-radius:999px;">
            ${area.severity || 'Critical'}
          </span>
        </div>
        <div style="color: #64748b; font-size: 11px;">District: ${area.district || area.circle || 'Kamrup'}</div>
        <div style="margin-top:4px;">👥 Population: <b>${(area.pop || area.population || 0).toLocaleString()}</b></div>
        <div>🌊 Associated River: <b>${area.river || 'Brahmaputra Basin'}</b></div>
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 11px;">
          <span style="color:#0284c7; font-weight:600;">Status:</span> ${area.lifecycleStage || 'Inundation Surveillance'}
        </div>
        <div style="margin-top: 8px;">
          <button style="width: 100%; background: #0284c7; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;"
                  onclick="if(window.inspectSectorByName) window.inspectSectorByName('${area.name || area.village}')">
            Audit Lifecycle Tracing →
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    marker.addTo(areaLayerGroup);
    markerMap.set(area.name || area.village, marker);
  });
}

export function focusMonitoringMap(lat, lng, zoom = 14, name = null) {
  if (!mapInstance) return;
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (!isNaN(numLat) && !isNaN(numLng) && isFinite(numLat) && isFinite(numLng)) {
    mapInstance.flyTo([numLat, numLng], zoom, { duration: 1.2 });
    if (name && markerMap.has(name)) {
      setTimeout(() => {
        const marker = markerMap.get(name);
        if (marker) marker.openPopup();
      }, 1250);
    }
  }
}

export function focusMonitoringMapByName(name) {
  if (!mapInstance || !name) return;
  for (const [key, marker] of markerMap.entries()) {
    if (key && key.toLowerCase().includes(name.toLowerCase())) {
      const latlng = marker.getLatLng();
      mapInstance.flyTo([latlng.lat, latlng.lng], 14, { duration: 1.2 });
      setTimeout(() => marker.openPopup(), 1250);
      return;
    }
  }
}

export function filterMonitoringMapBySeverity(severity) {
  activeSeverityFilter = severity;
}

export function invalidateMonitoringMapSize() {
  if (mapInstance) {
    setTimeout(() => {
      try { mapInstance.invalidateSize(); } catch (e) {}
    }, 150);
  }
}
