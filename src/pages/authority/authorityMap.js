// NEERAKSHAK District Authority GIS Flood Map Engine
// Reusable Leaflet map rendering flood villages, river corridors & live CWC telemetry

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
let villageLayerGroup = null;
let activeSeverityFilter = 'ALL';
let currentCenter = [26.15, 91.60];
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

export function initAuthorityFloodMap(containerId = 'authorityLeafletMap', initialCoords = null, initialZoom = null, basinKey = 'ab') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (mapInstance) {
    try { mapInstance.remove(); } catch (e) {}
    mapInstance = null;
  }

  currentCenter = initialCoords || [26.15, 91.60];
  currentZoom = initialZoom || 11;

  mapInstance = L.map(containerId, {
    center: currentCenter,
    zoom: currentZoom,
    minZoom: 4,
    maxZoom: 18,
    zoomControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 18
  }).addTo(mapInstance);

  riverLayerGroup = L.layerGroup().addTo(mapInstance);
  villageLayerGroup = L.layerGroup().addTo(mapInstance);

  // Render basin river corridors & CWC stations
  renderAuthorityRivers(basinKey);

  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 250);

  return mapInstance;
}

// Render River Basin Polylines & Live CWC Gauges (Reused from Admin)
export function renderAuthorityRivers(basinKey = 'ab') {
  if (!riverLayerGroup || !mapInstance) return;
  try {
    riverLayerGroup.clearLayers();

    const basinObj = USER_BASIN_REGISTRY[basinKey] || USER_BASIN_REGISTRY['ab'];
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
            <span style="position:absolute; width:36px; height:36px; border-radius:50%; background:${riverColor}; opacity:0.5; animation:pinPulseAnim 2s infinite ease-out;"></span>
            <div style="width:24px; height:24px; border-radius:50%; background:${riverColor}; color:#fff; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-size:10px; cursor:pointer;">
              <i class="fas fa-tower-broadcast"></i>
            </div>
            <div style="position:absolute; top:24px; background:rgba(7,34,71,0.92); color:#fff; padding:1px 5px; border-radius:6px; font-size:8.5px; font-weight:700; white-space:nowrap; border:1px solid #38bdf8;">
              ${r.stationCode || 'CWC'} • ${currentVal.toFixed(1)}m
            </div>
          </div>
        `;
        const icon = L.divIcon({
          className: 'cwc-auth-pin',
          html: iconHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        L.marker(coords, { icon }).addTo(riverLayerGroup);
      }
    });
  } catch (err) {
    console.error('renderAuthorityRivers error:', err);
  }
}

// Render Flood-Affected Villages on Map
export function updateAuthorityVillageMarkers(villages = []) {
  if (!villageLayerGroup || !mapInstance) return;
  try {
    villageLayerGroup.clearLayers();

    villages.forEach(v => {
      if (!v) return;
      if (activeSeverityFilter !== 'ALL' && v.severity !== activeSeverityFilter) {
        return;
      }

      const lat = Number(v.lat) || (26.05 + Math.random() * 0.15);
      const lng = Number(v.lng) || (91.20 + Math.random() * 0.40);
      const isAboveDanger = String(v.waterStatus || '').toLowerCase().includes('above danger') ||
                            String(v.waterStatus || '').toLowerCase().includes('overflow') ||
                            String(v.waterStatus || '').toLowerCase().includes('breach') ||
                            v.severity === 'Critical';

      const color = isAboveDanger ? '#dc2626' : getSeverityColor(v.severity);

      // Inundation buffer circle (RED if waterlevel above danger)
      L.circle([lat, lng], {
        color: color,
        fillColor: color,
        fillOpacity: isAboveDanger ? 0.32 : 0.18,
        weight: isAboveDanger ? 2.8 : 1.5,
        radius: isAboveDanger ? 2400 : 1500
      }).addTo(villageLayerGroup);

      // Custom Pin Marker
      const iconHtml = `
        <div style="position:relative; display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <span style="position:absolute; width:34px; height:34px; border-radius:50%; background:${color}; opacity:0.6; animation:pinPulseAnim 2s infinite;"></span>
          <div style="width:26px; height:26px; border-radius:50%; background:${color}; color:#fff; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 7px rgba(0,0,0,0.3); font-size:11px;">
            <i class="fas fa-house-flood-water"></i>
          </div>
          <div style="position:absolute; top:28px; background:${isAboveDanger ? '#dc2626' : 'rgba(15,23,42,0.9)'}; color:#fff; font-size:9.5px; font-weight:700; padding:1.5px 6px; border-radius:6px; white-space:nowrap; border:1px solid ${isAboveDanger ? '#fecaca' : 'rgba(255,255,255,0.2)'};">
            ${v.name} ${isAboveDanger ? '<span style="color:#fef08a; margin-left:3px;">● DANGER</span>' : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'auth-village-div',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(villageLayerGroup);

      const boats = v.assessedNeed ? v.assessedNeed.boats : 2;
      const food = v.assessedNeed ? v.assessedNeed.food : 300;

      const popupHtml = `
        <div style="min-width:210px; font-family:'Poppins',sans-serif; padding:2px;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
            <strong style="font-size:13px; color:#0f172a;">${v.name}</strong>
            <span style="font-size:9.5px; font-weight:800; color:${color}; background:${color}15; padding:2px 6px; border-radius:4px; border:1px solid ${color}35;">${v.severity}</span>
          </div>
          <div style="font-size:10.5px; color:#64748b; margin-bottom:6px;">${v.block} • Pop: <strong>${(v.pop || 0).toLocaleString()}</strong></div>
          <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px; font-size:11px; margin-bottom:8px;">
            <span style="color:#0369a1; font-weight:700;">Assessed Need:</span><br/>
            <strong>${boats} Rescue Boats, ${food} Food Packets</strong>
          </div>
          <button type="button" style="width:100%; background:#0284c7; color:#fff; border:none; padding:6px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;" onclick="window.selectVillageForAssessment && window.selectVillageForAssessment('${v.id}', true)">
            <i class="fas fa-clipboard-check"></i> Inspect & Allocate Resources
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (window.selectVillageForAssessment) {
          window.selectVillageForAssessment(v.id, false);
        }
      });
    });
  } catch (err) {
    console.error('updateAuthorityVillageMarkers error:', err);
  }
}

// Map Controls
export function authMapZoomIn() {
  if (mapInstance) mapInstance.zoomIn();
}

export function authMapZoomOut() {
  if (mapInstance) mapInstance.zoomOut();
}

export function authMapRecenter() {
  if (mapInstance) {
    mapInstance.setView(currentCenter, currentZoom, { animate: true });
    if (window.showToast) window.showToast('Recentered to active District Command Sector');
  }
}

export function filterAuthorityMapSeverity(sev) {
  activeSeverityFilter = sev;
  const villages = (window.authorityState && window.authorityState.villages) || [];
  updateAuthorityVillageMarkers(villages);
  if (window.showToast) window.showToast(`Map filtered: ${sev === 'ALL' ? 'All Zones' : `${sev} Zones`}`);
}

export function searchAuthorityMap(query) {
  if (!query || !query.trim() || !mapInstance) return;
  const q = query.trim().toLowerCase();

  const villages = (window.authorityState && window.authorityState.villages) || [];
  const found = villages.find(v => v.name.toLowerCase().includes(q) || (v.block && v.block.toLowerCase().includes(q)));
  if (found) {
    const lat = Number(found.lat) || currentCenter[0];
    const lng = Number(found.lng) || currentCenter[1];
    mapInstance.setView([lat, lng], 14, { animate: true });
    if (window.selectVillageForAssessment) window.selectVillageForAssessment(found.id, false);
    if (window.showToast) window.showToast(`Focused on ${found.name}`);
    return;
  }

  // Check sectors in India GIS
  const foundSec = INDIA_DISTRICT_SECTORS.find(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  if (foundSec) {
    mapInstance.flyTo(foundSec.coords, foundSec.zoom, { duration: 1.5 });
    if (window.showToast) window.showToast(`Navigated to ${foundSec.name}`);
  }
}

export function flyToSector(coords, zoom = 12) {
  if (mapInstance && coords && coords.length === 2) {
    currentCenter = coords;
    currentZoom = zoom;
    mapInstance.flyTo(coords, zoom, { duration: 1.5 });
  }
}

export const flyToAuthoritySector = flyToSector;
export const zoomInAuthorityMap = authMapZoomIn;
export const zoomOutAuthorityMap = authMapZoomOut;
export const recenterAuthorityMap = authMapRecenter;

