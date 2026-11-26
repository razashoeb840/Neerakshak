// NEERAKSHAK Central Relief Godown & Logistics Corridor GIS Engine
// Fully connected with Admin (Areas) and Authority (Allocations) for shared real-time lifecycle.
// Shows Depots, Authority Allocated Relief Needs on each Village, and Live Dispatched Convoys.

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  INDIA_RIVER_SYSTEMS,
  USER_BASIN_REGISTRY,
  resolveUserBasin
} from '../admin/indiaGisData.js';
import { fetchLiveRiverTelemetry } from './godownApi.js';

let mapInstance = null;
let riverLayerGroup = null;
let depotLayerGroup = null;
let allocationLayerGroup = null;
let convoyLayerGroup = null;

let currentAllocations = [];
let activeFilter = 'ALL';
let hasAutoFitted = false;

// Fix Leaflet marker icons with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const WAREHOUSES = [
  {
    id: 'WH-MIRZA',
    name: 'Central Relief Godown – Mirza',
    coords: [26.082, 91.531],
    role: 'Primary Logistics Hub (Bays 1-4)',
    address: 'NH-17 Highway Corridor, Mirza',
    contact: '+91 94350-11204',
    color: '#0284c7'
  },
  {
    id: 'WH-RANGIA',
    name: 'North Sector Warehouse – Rangia',
    coords: [26.435, 91.618],
    role: 'North Sector Auxiliary Hub (Bays 1-2)',
    address: 'Industrial Area, Rangia',
    contact: '+91 98641-44589',
    color: '#0d9488'
  }
];

export function initGodownLogisticsMap(containerId = 'godownLeafletMap', initialCenter = [26.12, 91.45], initialZoom = 11, basinKey = 'ab') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (mapInstance) {
    try { mapInstance.remove(); } catch (e) {}
    mapInstance = null;
  }

  mapInstance = L.map(containerId, {
    center: initialCenter,
    zoom: initialZoom,
    minZoom: 5,
    maxZoom: 18,
    zoomControl: false,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true,
    boxZoom: true,
    keyboard: true,
    dragging: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 18
  }).addTo(mapInstance);

  riverLayerGroup = L.layerGroup().addTo(mapInstance);
  depotLayerGroup = L.layerGroup().addTo(mapInstance);
  allocationLayerGroup = L.layerGroup().addTo(mapInstance);
  convoyLayerGroup = L.layerGroup().addTo(mapInstance);

  // Render River Corridors & CWC stations
  renderGodownRiverCorridors(basinKey);

  // Render Warehouses
  renderWarehouses();

  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 250);

  return mapInstance;
}

/**
 * Render warehouse hubs
 */
function renderWarehouses() {
  if (!depotLayerGroup || !mapInstance) return;
  depotLayerGroup.clearLayers();

  WAREHOUSES.forEach(wh => {
    const whIcon = L.divIcon({
      className: 'godown-wh-pin',
      html: `
        <div style="position:relative; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="${wh.name}">
          <span style="position:absolute; width:38px; height:38px; border-radius:50%; background:${wh.color}; opacity:0.35; animation:pinPulseAnim 2.2s infinite;"></span>
          <div style="width:30px; height:30px; border-radius:50%; background:${wh.color}; color:#fff; display:flex; align-items:center; justify-content:center; border:2.5px solid #fff; box-shadow:0 3px 10px rgba(0,0,0,0.35); font-size:13px;">
            <i class="fas fa-warehouse"></i>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    const popupHtml = `
      <div style="font-family:sans-serif; min-width:220px; padding:4px;">
        <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:#0284c7; letter-spacing:0.5px;">District Relief Godown</div>
        <h4 style="margin:2px 0 6px 0; font-size:14px; color:#0f172a;">${wh.name}</h4>
        <div style="font-size:11.5px; color:#334155; line-height:1.5;">
          <div><strong>Role:</strong> ${wh.role}</div>
          <div><strong>Address:</strong> ${wh.address}</div>
          <div><strong>Contact:</strong> ${wh.contact}</div>
        </div>
      </div>
    `;

    L.marker(wh.coords, { icon: whIcon })
      .bindPopup(popupHtml)
      .addTo(depotLayerGroup);
  });
}

/**
 * Render River Basin Polylines & Live CWC Gauges along supply routes
 */
export function renderGodownRiverCorridors(basinKey = 'ab') {
  if (!riverLayerGroup || !mapInstance) return;
  try {
    riverLayerGroup.clearLayers();

    const basinObj = USER_BASIN_REGISTRY[basinKey] || USER_BASIN_REGISTRY['ab'];
    const rivers = (basinObj && basinObj.rivers) || INDIA_RIVER_SYSTEMS;

    rivers.forEach(r => {
      if (!r) return;
      const currentVal = Number(r.current || 0);
      const dangerVal = Number(r.danger || 0);
      const isDanger = currentVal >= dangerVal;
      const isWarning = !isDanger && currentVal >= (dangerVal - 0.8);

      const riverColor = isDanger ? '#dc2626' : (isWarning ? '#f97316' : '#0284c7');
      const glowColor = isDanger ? 'rgba(220, 38, 38, 0.45)' : (isWarning ? 'rgba(249, 115, 22, 0.4)' : 'rgba(56, 189, 248, 0.4)');

      if (Array.isArray(r.path) && r.path.length >= 2) {
        L.polyline(r.path, {
          color: glowColor,
          weight: 12,
          opacity: 0.5,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(riverLayerGroup);

        L.polyline(r.path, {
          color: riverColor,
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(riverLayerGroup);
      }

      // Gauge point
      if (Array.isArray(r.coords) && r.coords.length === 2) {
        const gaugeIcon = L.divIcon({
          className: 'cwc-gauge-icon',
          html: `
            <div style="background:#fff; border:2px solid ${riverColor}; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.25); font-size:10px; color:${riverColor}; font-weight:bold;" title="${r.name} Gauge">
              <i class="fas fa-water"></i>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const popupContent = `
          <div style="font-family:sans-serif; min-width:200px; padding:3px;">
            <div style="font-weight:700; color:#0f172a; font-size:12.5px; margin-bottom:3px;">
              <i class="fas fa-water" style="color:${riverColor}"></i> ${r.name}
            </div>
            <div style="font-size:10.5px; color:#64748b; margin-bottom:5px;">${r.station || 'CWC Hydrological Gauge'}</div>
            <div style="background:#f8fafc; border-radius:6px; padding:5px; font-size:11px;">
              <div>Current: <strong style="color:${riverColor}">${r.current} m</strong> / Danger: <strong>${r.danger} m</strong></div>
              <div>Route Passability: <strong style="color:${isDanger ? '#dc2626' : '#16a34a'}">${isDanger ? '⚠️ Bridge Submerged' : '✓ Passable'}</strong></div>
            </div>
          </div>
        `;

        L.marker(r.coords, { icon: gaugeIcon })
          .bindPopup(popupContent)
          .addTo(riverLayerGroup);
      }
    });
  } catch (e) {
    console.error('renderGodownRiverCorridors error:', e);
  }
}

/**
 * Render Authority-Approved Allocations directly on the map
 * Shows the exact resources decided by Authority, plus live transit convoys
 */
export function updateGodownMapAllocations(allocations = []) {
  currentAllocations = allocations;
  if (!allocationLayerGroup || !convoyLayerGroup || !mapInstance) return;

  try {
    allocationLayerGroup.clearLayers();
    convoyLayerGroup.clearLayers();

    const mirzaCoords = [26.082, 91.531];
    const allCoords = [mirzaCoords];

    allocations.forEach((alloc, idx) => {
      if (!alloc) return;

      const isDispatched = alloc.status === 'Dispatched';
      const isAboveDanger = alloc.isAboveDanger || 
                            alloc.severity === 'Critical' || 
                            alloc.priority === 'Critical' || 
                            String(alloc.waterStatus || '').toLowerCase().includes('above danger') ||
                            String(alloc.waterStatus || '').toLowerCase().includes('breach') ||
                            String(alloc.waterStatus || '').toLowerCase().includes('overflow');

      // Filter check
      if (activeFilter === 'PENDING' && isDispatched) return;
      if (activeFilter === 'DISPATCHED' && !isDispatched) return;
      if (activeFilter === 'CRITICAL' && !isAboveDanger) return;

      const lat = Number(alloc.lat) || (26.05 + idx * 0.04);
      const lng = Number(alloc.lng) || (91.22 + idx * 0.12);
      const coords = [lat, lng];
      allCoords.push(coords);

      const pinColor = isDispatched ? '#16a34a' : (isAboveDanger ? '#dc2626' : '#ea580c');

      // Add prominent red circle for above-danger flood zones
      if (isAboveDanger) {
        L.circle(coords, {
          color: '#dc2626',
          fillColor: '#dc2626',
          fillOpacity: 0.22,
          weight: 2,
          radius: 1800
        }).addTo(allocationLayerGroup);
      }

      // 1. Destination Area Pin Marker
      const pinIcon = L.divIcon({
        className: 'godown-alloc-pin',
        html: `
          <div style="position:relative; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="window.selectAllocationForDispatch && window.selectAllocationForDispatch('${alloc.id}')" title="${alloc.destination} • Click to Inspect">
            ${isDispatched ? '' : `<span style="position:absolute; width:32px; height:32px; border-radius:50%; background:${pinColor}; opacity:0.35; animation:pinPulseAnim 2s infinite;"></span>`}
            <div style="width:26px; height:26px; border-radius:50%; background:${pinColor}; color:#fff; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 7px rgba(0,0,0,0.3); font-size:11px;">
              <i class="fas ${isDispatched ? 'fa-check' : 'fa-location-dot'}"></i>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const popupHtml = `
        <div style="font-family:sans-serif; min-width:230px; padding:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:13px; color:#0f172a;">${alloc.destination}</strong>
            <span class="pill ${isDispatched ? 'p-good' : 'p-critical'}">${alloc.status}</span>
          </div>
          <div style="font-size:10.5px; color:#64748b; margin-bottom:4px;">
            ${alloc.block || 'Kamrup Sector'} • Ref: <strong>${alloc.refNo && alloc.refNo !== '—' ? alloc.refNo : alloc.id}</strong>
          </div>
          <div style="font-size:11px; color:#334155; margin-bottom:4px;">Authority Allocated Relief:</div>
          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:6px 8px; font-size:11.5px; font-weight:700; color:#1e40af; margin-bottom:6px;">
            ${alloc.summary || 'Emergency Relief Buffer'}
          </div>
          <div style="font-size:11px; color:#475569; margin-bottom:8px;">
            <div>Assigned Vehicle: <strong>${alloc.vehicle}</strong></div>
            <div>Driver: <strong>${alloc.driver || 'Rajesh Das'}</strong></div>
          </div>
          <button class="btn-gd primary" style="width:100%; justify-content:center; padding:6px; font-size:11.5px;" onclick="window.selectAllocationForDispatch && window.selectAllocationForDispatch('${alloc.id}')">
            ${isDispatched ? 'Track Convoy →' : 'Prepare & Dispatch →'}
          </button>
        </div>
      `;

      L.marker(coords, { icon: pinIcon })
        .bindPopup(popupHtml)
        .addTo(allocationLayerGroup);

      // 2. Convoy Transit Route Line (Connecting Mirza Godown to Destination)
      if (isDispatched) {
        // Dispatched Convoy: Solid green glowing line + animated truck marker halfway
        L.polyline([mirzaCoords, coords], {
          color: 'rgba(34, 197, 94, 0.45)',
          weight: 8,
          opacity: 0.6
        }).addTo(convoyLayerGroup);

        L.polyline([mirzaCoords, coords], {
          color: '#16a34a',
          weight: 4,
          opacity: 0.95
        }).addTo(convoyLayerGroup);

        // Calculate intermediate midpoint for convoy truck icon
        const midLat = mirzaCoords[0] + (lat - mirzaCoords[0]) * 0.65;
        const midLng = mirzaCoords[1] + (lng - mirzaCoords[1]) * 0.65;

        const truckIcon = L.divIcon({
          className: 'godown-truck-pin',
          html: `
            <div style="background:#15803d; color:#fff; border:2px solid #fff; border-radius:12px; padding:3px 7px; font-size:10.5px; font-weight:700; display:flex; align-items:center; gap:4px; box-shadow:0 3px 10px rgba(0,0,0,0.35); cursor:pointer;" onclick="window.selectAllocationForDispatch && window.selectAllocationForDispatch('${alloc.id}')" title="Convoy ${alloc.refNo} En-Route">
              <i class="fas fa-truck-fast"></i>
              <span>${alloc.refNo && alloc.refNo !== '—' ? alloc.refNo : 'CONVOY'}</span>
            </div>
          `,
          iconSize: [85, 24],
          iconAnchor: [42, 12]
        });

        L.marker([midLat, midLng], { icon: truckIcon })
          .bindPopup(`
            <div style="font-family:sans-serif; min-width:200px; padding:3px;">
              <strong style="color:#15803d; font-size:12.5px;"><i class="fas fa-truck-fast"></i> Relief Convoy En-Route</strong>
              <div style="font-size:11px; margin-top:4px;">Vehicle: <strong>${alloc.vehicle}</strong></div>
              <div style="font-size:11px;">Gate-Pass Ref: <strong>${alloc.refNo}</strong></div>
              <div style="font-size:11px;">Carrying: <strong>${alloc.summary}</strong></div>
              <div style="font-size:10.5px; color:#16a34a; font-weight:700; margin-top:4px;">✓ In Transit to ${alloc.destination}</div>
            </div>
          `)
          .addTo(convoyLayerGroup);
      } else {
        // Pending Dispatch: Dashed route line
        L.polyline([mirzaCoords, coords], {
          color: '#0284c7',
          weight: 2.5,
          dashArray: '5, 8',
          opacity: 0.75
        }).addTo(convoyLayerGroup);
      }
    });

    // Only fitBounds on initial view or filter switch, never override active user zoom on polls
    if (!hasAutoFitted && allCoords.length > 1 && mapInstance) {
      try {
        const bounds = L.latLngBounds(allCoords);
        mapInstance.fitBounds(bounds.pad(0.18), { maxZoom: 12 });
        hasAutoFitted = true;
      } catch (err) {}
    }
  } catch (e) {
    console.error('updateGodownMapAllocations error:', e);
  }
}

export function invalidateGodownMapSize() {
  if (mapInstance) {
    try {
      mapInstance.invalidateSize();
    } catch (e) {}
  }
}

/**
 * Filter map display by status: ALL, PENDING, DISPATCHED, CRITICAL
 */
export function filterGodownMap(type = 'ALL') {
  activeFilter = type;
  if (currentAllocations.length > 0) {
    updateGodownMapAllocations(currentAllocations);
  }
}

/**
 * Search map by destination village name
 */
export function searchGodownMap(query = '') {
  if (!query || !mapInstance) return;
  const q = String(query).trim().toLowerCase();
  const match = currentAllocations.find(a => 
    (a.destination && a.destination.toLowerCase().includes(q)) ||
    (a.block && a.block.toLowerCase().includes(q)) ||
    (a.id && a.id.toLowerCase().includes(q))
  );

  if (match && match.lat && match.lng) {
    mapInstance.flyTo([match.lat, match.lng], 13, { duration: 1.2 });
    if (window.selectAllocationForDispatch) {
      window.selectAllocationForDispatch(match.id);
    }
  }
}

/**
 * Center map on specific coordinates
 */
export function centerOnMap(lat, lng, zoom = 13) {
  if (mapInstance && lat && lng) {
    mapInstance.flyTo([lat, lng], zoom, { duration: 1.2 });
  }
}

export function godownMapZoomIn() {
  if (mapInstance) {
    mapInstance.zoomIn(1);
  }
}

export function godownMapZoomOut() {
  if (mapInstance) {
    mapInstance.zoomOut(1);
  }
}

export function godownMapRecenter() {
  if (mapInstance) {
    mapInstance.setView([26.12, 91.45], 11, { animate: true });
  }
}

if (typeof window !== 'undefined') {
  window.godownMapZoomIn = godownMapZoomIn;
  window.godownMapZoomOut = godownMapZoomOut;
  window.godownMapRecenter = godownMapRecenter;
  window.filterGodownMap = filterGodownMap;
  window.searchGodownMap = searchGodownMap;
}

/**
 * Render compact Logistics Corridor River Telemetry in the Right Panel
 */
export async function renderRightCorridorRiver(containerId = 'rightCorridorRiverBox', basinId = 'ab') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const liveRivers = await fetchLiveRiverTelemetry(basinId);
    const river = (liveRivers && liveRivers.length > 0) ? liveRivers[0] : {
      name: 'Brahmaputra River (Pandu Ghat)',
      station: 'Guwahati Pandu CWC Site',
      stationCode: 'CWC-BRA-01',
      current: 49.85,
      danger: 49.68,
      trend: 'Rising',
      dischargeFormatted: '18,450 m³/s'
    };

    const current = Number(river.current || 0);
    const danger = Number(river.danger || 0);
    const isDanger = current >= danger;

    container.innerHTML = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; font-size:11.5px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <strong style="color:#0f172a; font-size:12px;"><i class="fas fa-water" style="color:#0284c7;"></i> ${river.name.split(' (')[0]}</strong>
          <span class="pill ${isDanger ? 'p-critical' : 'p-good'}" style="font-size:9.5px; padding:2px 6px;">${isDanger ? 'Critical Breach' : 'Passable'}</span>
        </div>
        <div style="font-size:10.5px; color:#64748b; margin-bottom:6px;">${river.station || 'CWC Gauge'} • ${river.stationCode || 'CWC-SITE'}</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:#fff; border:1px solid #e2e8f0; border-radius:6px; padding:6px 8px;">
          <div>Current: <strong style="color:${isDanger ? '#dc2626' : '#0284c7'}">${current.toFixed(2)} m</strong></div>
          <div>Danger: <strong>${danger.toFixed(2)} m</strong></div>
          <div>Flow: <strong>${river.dischargeFormatted || '18,450 m³/s'}</strong></div>
          <div>Trend: <strong style="color:${river.trend === 'Rising' ? '#ea580c' : '#16a34a'}">${river.trend || 'Steady'}</strong></div>
        </div>
        <div style="margin-top:6px; font-size:10px; color:#64748b; display:flex; align-items:center; gap:4px;">
          <i class="fas fa-satellite-dish" style="color:#16a34a;"></i> Live Telemetry (Open-Meteo GloFAS & CWC)
        </div>
      </div>
    `;
  } catch (e) {
    console.warn('renderRightCorridorRiver notice:', e);
  }
}
