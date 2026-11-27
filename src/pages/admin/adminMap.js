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
let zoneMarkersList = [];
let hasAutoCenteredInitially = false;

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

  // Global window handles for admin map focusing and zoom actions
  window.adminLeafletMapInstance = mapInstance;
  window.zoomToCoords = zoomToCoords;
  window.focusAdminMap = zoomToCoords;
  window.flyToDistrictSector = flyToDistrictSector;
  window.autoCenterOnAffectedAreas = autoCenterOnAffectedAreas;

  // Render Live Indian River Corridors & CWC Stations on Map
  renderLiveRiversOnMap(null, basinKey);

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
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:10px; color:#475569;">Danger: ${detected.river.danger}m</span>
              ${statusBadge}
            </div>
            <div style="border-top:1px dashed #bae6fd; padding-top:4px;">
              <label style="font-size:10px; font-weight:700; color:#0369a1; display:block; margin-bottom:2px;">
                <i class="fas fa-users"></i> Est. Affected Pop:
              </label>
              <input type="number" id="popupQuickPop" value="2500" style="width:100%; padding:3px 6px; font-size:11px; border:1px solid #93c5fd; border-radius:4px; box-sizing:border-box;" />
            </div>
          </div>
          <button type="button" class="popup-btn-edit" style="width:100%; justify-content:center; padding:7px; font-size:11.5px;" onclick="const p = document.getElementById('popupQuickPop')?.value || 2500; window.openAreaModalWithCoords && window.openAreaModalWithCoords(${lat.toFixed(4)}, ${lng.toFixed(4)}, '${detected.name.replace(/'/g, "\\'")}', '${detected.block.replace(/'/g, "\\'")}', '${detected.river.name}', ${detected.river.current}, ${detected.river.danger}, p)">
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

// Render Major Indian River Basin Corridors & CWC Stations with Live Telemetry
export function renderLiveRiversOnMap(rivers = [], basinKey = null) {
  if (!riverLayerGroup || !mapInstance) return;
  try {
    riverLayerGroup.clearLayers();

    // Prefer live telemetry rivers from state, then passed rivers, then basin registry
    let riversToRender = [];
    if (rivers && Array.isArray(rivers) && rivers.length > 0) {
      riversToRender = rivers;
    } else if (window.adminState && Array.isArray(window.adminState.rivers) && window.adminState.rivers.length > 0) {
      riversToRender = window.adminState.rivers;
    } else if (window.activeUserBasin && Array.isArray(window.activeUserBasin.rivers) && window.activeUserBasin.rivers.length > 0) {
      riversToRender = window.activeUserBasin.rivers;
    } else {
      riversToRender = INDIA_RIVER_SYSTEMS || [];
    }

    riversToRender.forEach(r => {
      if (!r) return;
      const rId = String(r.id || '').trim().toLowerCase();
      const rName = String(r.name || r.station || 'River');
      const rNameLower = rName.toLowerCase();

      // 1. Locate geometry (path & station center) safely from INDIA_RIVER_SYSTEMS
      let geom = (INDIA_RIVER_SYSTEMS || []).find(gr => {
        if (!gr) return false;
        const grId = String(gr.id || '').trim().toLowerCase();
        const grName = String(gr.name || '').trim().toLowerCase();
        return (rId && grId && grId === rId) ||
               (rId && grName && grName.includes(rId)) ||
               (grId && rNameLower && rNameLower.includes(grId)) ||
               (grName && rNameLower && (grName.includes(rNameLower) || rNameLower.includes(grName)));
      });

      if (!geom) {
        geom = (INDIA_RIVER_SYSTEMS && INDIA_RIVER_SYSTEMS[0]) || {};
      }

      const currentVal = Number(r.current !== undefined ? r.current : (geom.current || 0)) || 0;
      const dangerVal = Number(r.danger !== undefined ? r.danger : (geom.danger || 0)) || 0;
      const warningVal = Number(r.warning !== undefined ? r.warning : (geom.warning || dangerVal - 0.8)) || 0;
      const isDanger = currentVal >= dangerVal;
      const isWarning = !isDanger && currentVal >= warningVal;

      const riverColor = isDanger ? '#dc2626' : (isWarning ? '#f97316' : '#0284c7');
      const glowColor = isDanger ? 'rgba(220, 38, 38, 0.45)' : (isWarning ? 'rgba(249, 115, 22, 0.4)' : 'rgba(56, 189, 248, 0.4)');

      // 2. Render River Polyline Corridor safely
      if (geom && Array.isArray(geom.path) && geom.path.length >= 2) {
        const validPath = geom.path.filter(pt => Array.isArray(pt) && pt.length === 2 && !isNaN(pt[0]) && !isNaN(pt[1]));
        if (validPath.length >= 2) {
          // Ambient glow polyline
          L.polyline(validPath, {
            color: glowColor,
            weight: 14,
            opacity: 0.55,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(riverLayerGroup);

          // River centerline polyline
          const riverLine = L.polyline(validPath, {
            color: riverColor,
            weight: 5.5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(riverLayerGroup);

          riverLine.bindTooltip(`
            <div style="font-size:11.5px; font-family:'Poppins',sans-serif; min-width:200px; padding:2px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <strong style="color:${riverColor}; font-size:12.5px;">🌊 ${rName}</strong>
                <span style="font-size:9.5px; background:#dcfce7; color:#15803d; padding:1px 5px; border-radius:3px; font-weight:800;">LIVE CWC</span>
              </div>
              <div style="font-size:10px; color:#64748b; margin-bottom:4px;">${r.station || geom.name || 'CWC Hydrology Site'} • ${r.stationCode || 'CWC Station'}</div>
              <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">
                <span>Current: <strong style="color:${isDanger ? '#dc2626' : '#0f172a'};">${currentVal.toFixed(2)} m</strong></span>
                <span>Danger Mark: <strong>${dangerVal.toFixed(2)} m</strong></span>
              </div>
              <div style="font-size:10.5px; color:#334155;">
                <span>Discharge: <strong style="color:#0284c7;">${r.dischargeFormatted || 'Live Flow'}</strong></span> • Trend: <strong>${r.trend || 'Steady'}</strong>
              </div>
              <div style="margin-top:4px; font-weight:800; font-size:10px; color:${isDanger ? '#dc2626' : (isWarning ? '#f97316' : '#16a34a')};">
                ${isDanger ? '⚠️ CRITICAL BREACH: Exceeded Danger Mark' : (isWarning ? '⚡ WARNING WATCH: Approaching Danger' : '✓ SAFE DISCHARGE: Normal River Flow')}
              </div>
            </div>
          `, { sticky: true, className: 'leaflet-river-tooltip' });
        }
      }

      // 3. Render Official CWC Gauge Telemetry Station Marker
      const stationCoords = (r.coords && Array.isArray(r.coords) && r.coords.length === 2 && !isNaN(r.coords[0]))
        ? r.coords
        : (geom && geom.center && Array.isArray(geom.center) && geom.center.length === 2
            ? geom.center
            : (geom && geom.path && Array.isArray(geom.path) && geom.path.length > 0 && Array.isArray(geom.path[0])
                ? geom.path[0]
                : null));

      if (stationCoords && !isNaN(stationCoords[0]) && !isNaN(stationCoords[1])) {
        const stLat = Number(stationCoords[0]);
        const stLng = Number(stationCoords[1]);
        const statusClass = isDanger ? 'crit' : (isWarning ? 'warn' : 'safe');
        const badgeText = isDanger ? 'CRITICAL BREACH' : (isWarning ? 'WARNING WATCH' : 'SAFE FLOW');

        const stIconHtml = `
          <div class="cwc-station-pin ${statusClass}">
            <span class="st-pulse" style="background:${riverColor};"></span>
            <div class="st-head" style="background:${riverColor};">
              <i class="fas fa-tower-broadcast"></i>
            </div>
            <div class="st-chip">
              <span class="st-chip-code">${r.stationCode || 'CWC'}</span>
              <span class="st-chip-val">${currentVal.toFixed(2)}m</span>
            </div>
          </div>
        `;

        const stIcon = L.divIcon({
          className: 'cwc-marker-div',
          html: stIconHtml,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          popupAnchor: [0, -24]
        });

        const stMarker = L.marker([stLat, stLng], { icon: stIcon }).addTo(riverLayerGroup);

        const diff = (currentVal - dangerVal).toFixed(2);
        const diffText = isDanger
          ? `<span style="color:#dc2626; font-weight:800;">⚠️ +${diff} m ABOVE CWC DANGER MARK</span>`
          : `<span style="color:#15803d; font-weight:700;">✓ ${Math.abs(diff)} m below Danger Mark (Safe Discharge)</span>`;

        const stationRaw = r.station || rName;
        const cleanStation = String(stationRaw).split(' (')[0].replace(/'/g, "\\'");
        const cleanRiverName = rName.replace(/'/g, "\\'");
        const cleanStationCode = String(r.stationCode || 'CWC Telemetry Station').replace(/'/g, "\\'");

        const stPopup = `
          <div class="map-rich-popup cwc-station-popup">
            <div class="popup-top">
              <div>
                <span style="font-size:9.5px; font-weight:800; background:#dcfce7; color:#15803d; padding:2px 7px; border-radius:4px; border:1px solid #86efac; display:inline-flex; align-items:center; gap:4px; margin-bottom:4px;">
                  <span style="width:6px; height:6px; border-radius:50%; background:#22c55e;"></span>LIVE CWC & GloFAS TELEMETRY
                </span>
                <h4 style="margin:2px 0 1px; font-size:13.5px; font-weight:800; color:#0f172a;">${r.station || rName}</h4>
                <span style="font-size:10.5px; color:#64748b; font-weight:600;">${r.stationCode || 'Central Water Commission'} • ${r.basin || 'Basin Site'}</span>
              </div>
              <span class="sev-pill ${isDanger ? 'sev-critical' : (isWarning ? 'sev-moderate' : 'sev-normal')}" style="font-size:9.5px; padding:2px 7px;">${badgeText}</span>
            </div>

            <div style="background:#f0f9ff; border:1.5px solid #bae6fd; border-radius:8px; padding:7px 10px; margin:8px 0;">
              <div style="display:flex; justify-content:space-between; align-items:baseline;">
                <span style="font-size:11px; color:#475569; font-weight:600;">Live Water Level:</span>
                <span style="font-size:16px; font-weight:800; color:${riverColor}; font-family:'Plus Jakarta Sans',sans-serif;">${currentVal.toFixed(2)} m</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b; margin-top:3px; border-top:1px dashed #cbd5e1; padding-top:4px;">
                <span>Danger Mark: <strong>${dangerVal.toFixed(2)} m</strong></span>
                <span>Warning Mark: <strong>${warningVal.toFixed(2)} m</strong></span>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px; font-size:10.5px;">
              <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:5px 8px; border-radius:6px;">
                <span style="color:#64748b; display:block; font-size:9.5px;">River Discharge:</span>
                <strong style="color:#0284c7; font-size:11.5px;">${r.dischargeFormatted || 'Live Flow'}</strong>
              </div>
              <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:5px 8px; border-radius:6px;">
                <span style="color:#64748b; display:block; font-size:9.5px;">Hydrological Trend:</span>
                <strong style="color:${r.trend === 'Rising' ? '#dc2626' : '#16a34a'}; font-size:11.5px;">${r.trend === 'Rising' ? '↑ Rising' : (r.trend === 'Falling' ? '↓ Falling' : '→ Steady')}</strong>
              </div>
            </div>

            <div style="font-size:10.5px; margin-bottom:8px; background:#fafafa; border:1px solid #f1f5f9; padding:5px 8px; border-radius:6px;">
              ${diffText}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; font-size:9.5px; color:#94a3b8; margin-bottom:8px;">
              <span>Source: ${r.source || 'Open-Meteo GloFAS & CWC'}</span>
              <span>Synced: ${r.lastUpdated || 'Just now'}</span>
            </div>

            <button type="button" class="popup-btn-edit" style="width:100%; justify-content:center; padding:7px; font-size:11px;" onclick="window.openAreaModalWithCoords && window.openAreaModalWithCoords(${stLat.toFixed(4)}, ${stLng.toFixed(4)}, '${cleanStation}', '${cleanStationCode}', '${cleanRiverName}', ${currentVal.toFixed(2)}, ${dangerVal.toFixed(2)})">
              <i class="fas fa-plus-circle"></i> Mark Flood Zone Near Station
            </button>
          </div>
        `;

        stMarker.bindPopup(stPopup, { minWidth: 250 });
      }
    });
  } catch (err) {
    console.error('renderLiveRiversOnMap error:', err);
  }
}

export function updateMapLayers(areas = [], facilities = [], rivers = []) {
  if (!mapInstance || !zonesLayerGroup || !facilitiesLayerGroup || !riverLayerGroup) return;

  try {
    zonesLayerGroup.clearLayers();
    facilitiesLayerGroup.clearLayers();
    zoneMarkersList = [];

    // 1. RENDER LIVE RIVER CORRIDORS & CWC TELEMETRY STATIONS ON MAP
    renderLiveRiversOnMap(rivers);

  // 1. RENDER FLOOD AFFECTED AREAS ACROSS INDIA
  areas.forEach((area, idx) => {
    const lat = Number(area.lat);
    const lng = Number(area.lng);
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

    if (activeSeverityFilter !== 'ALL' && area.severity !== activeSeverityFilter) {
      return;
    }

    // Check if river waterlevel is above danger or critical breach
    const nearest = detectNearestRiver(lat, lng);
    const riverName = area.river || nearest.name;
    const riverCur = area.riverCurrent !== undefined ? Number(area.riverCurrent) : (nearest.current || 18.2);
    const riverDang = area.riverDanger !== undefined ? Number(area.riverDanger) : (nearest.danger || 18.0);
    const isOver = (riverCur >= riverDang) ||
                   String(area.notes || '').toLowerCase().includes('above danger') ||
                   area.severity === 'Critical';

    const color = isOver ? '#dc2626' : getSeverityColor(area.severity);
    const radius = getSeverityRadius(isOver ? 'Critical' : area.severity);

    // Inundation Risk Buffer Circle (RED for above danger)
    L.circle([lat, lng], {
      color: color,
      fillColor: color,
      fillOpacity: isOver ? 0.32 : 0.18,
      weight: isOver ? 2.8 : 1.5,
      radius: radius
    }).addTo(zonesLayerGroup);

    // Custom HTML Marker Icon
    const iconHtml = `
      <div class="custom-flood-pin ${isOver ? 'critical' : area.severity.toLowerCase()}">
        <span class="pin-pulse" style="background:${color};"></span>
        <div class="pin-head" style="background:${color};">
          <i class="fas fa-triangle-exclamation"></i>
        </div>
        <div class="pin-title" style="${isOver ? 'background:#dc2626; color:#fff; border:1px solid #fee2e2;' : ''}">
          ${area.name} ${isOver ? '<span style="font-size:8px; display:block; color:#fef08a;">⚠️ ABOVE DANGER</span>' : ''}
        </div>
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
    zoneMarkersList.push({ id: area.id, name: area.name, lat, lng, marker });
  });

  // Auto-center map on affected areas so map is always centered on active flood sectors
  const validAreas = (areas || []).filter(a => Number(a.lat) && Number(a.lng));
  if (validAreas.length > 0 && !hasAutoCenteredInitially) {
    setTimeout(() => {
      autoCenterOnAffectedAreas(validAreas);
      hasAutoCenteredInitially = true;
    }, 150);
  }

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
  } catch (err) {
    console.error('updateMapLayers error:', err);
  }
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

  // If user was picking a facility location
  if (window.pickingFacilityLocation) {
    window.pickingFacilityLocation = false;
    const facLat = document.getElementById('inpFacLat');
    const facLng = document.getElementById('inpFacLng');
    const hint = document.getElementById('facPinStatusHint');
    if (facLat) facLat.value = Number(lat).toFixed(4);
    if (facLng) facLng.value = Number(lng).toFixed(4);
    if (hint) hint.textContent = `📍 Map Location Pinned: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
    const fModal = document.getElementById('facilityModal');
    if (fModal) fModal.classList.add('open');
    if (window.showToast) window.showToast(`Facility GPS set to ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`, 'success');
    return;
  }

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
export function openAreaModalWithCoords(lat, lng, name = '', block = '', river = '', cur = '', danger = '', pop = '') {
  if (tempPickLayer) tempPickLayer.closePopup();

  if (window.openAreaModal) {
    window.openAreaModal();
  }

  const nameInp = document.getElementById('inpAreaName');
  const blockInp = document.getElementById('inpAreaBlock');
  const latInp = document.getElementById('inpAreaLat');
  const lngInp = document.getElementById('inpAreaLng');
  const popInp = document.getElementById('inpAreaPop');
  const riverInp = document.getElementById('inpAreaRiver');
  const curInp = document.getElementById('inpRiverCur');
  const dangInp = document.getElementById('inpRiverDanger');
  const detectBadge = document.getElementById('geoDetectBadge');

  if (name && nameInp) nameInp.value = name;
  if (block && blockInp) blockInp.value = block;
  if (latInp) latInp.value = Number(lat).toFixed(4);
  if (lngInp) lngInp.value = Number(lng).toFixed(4);
  if (pop && popInp) popInp.value = pop;

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

export function autoCenterOnAffectedAreas(areas = null) {
  if (!mapInstance) return;
  const list = areas || (window.adminState && window.adminState.areas) || [];
  const validAreas = list.filter(a => Number(a.lat) && Number(a.lng));
  if (validAreas.length === 1) {
    mapInstance.flyTo([Number(validAreas[0].lat), Number(validAreas[0].lng)], 13, { duration: 1.2 });
  } else if (validAreas.length > 1) {
    const bounds = L.latLngBounds(validAreas.map(a => [Number(a.lat), Number(a.lng)]));
    mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true, duration: 1.2 });
  }
}

export function mapRecenter() {
  if (mapInstance) {
    const areas = (window.adminState && window.adminState.areas) || [];
    const validAreas = areas.filter(a => Number(a.lat) && Number(a.lng));
    if (validAreas.length > 0) {
      autoCenterOnAffectedAreas(validAreas);
      if (window.showToast) window.showToast('Recentered to Active Flood Affected Areas');
    } else {
      mapInstance.setView(INITIAL_CENTER, INITIAL_ZOOM, { animate: true });
      if (window.showToast) window.showToast('Recentered to Active Flood Command Sector');
    }
  }
}

export function zoomToCoords(lat, lng, zoom = 14, openPopup = true) {
  if (mapInstance && lat && lng) {
    mapInstance.flyTo([Number(lat), Number(lng)], zoom, { duration: 1.2 });
    if (openPopup) {
      const match = zoneMarkersList.find(m => 
        Math.abs(Number(m.lat) - Number(lat)) < 0.002 && Math.abs(Number(m.lng) - Number(lng)) < 0.002
      );
      if (match && match.marker) {
        setTimeout(() => {
          match.marker.openPopup();
        }, 500);
      }
    }
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
  const rivers = (window.adminState && window.adminState.rivers) || [];
  updateMapLayers(areas, facilities, rivers);
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
