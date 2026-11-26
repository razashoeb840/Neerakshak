// NEERAKSHAK District Admin Portal – Real-Time & GIS Map Controller
import {
  fetchFullAdminState,
  getCurrentState,
  saveArea as saveAreaApi,
  deleteArea as deleteAreaApi,
  addAlert as addAlertApi,
  deleteAlert as deleteAlertApi,
  updateRiver as updateRiverApi,
  addFacility as addFacilityApi,
  deleteFacility as deleteFacilityApi,
  updateWeather as updateWeatherApi,
  startRealtimeSync,
  stopRealtimeSync,
  onSync,
  fetchLiveRiverTelemetry,
  startLiveRiverPolling,
  stopLiveRiverPolling
} from './adminApi.js';

import {
  initAdminFloodMap,
  updateMapLayers,
  mapZoomIn,
  mapZoomOut,
  mapRecenter,
  zoomToCoords,
  setSeverityFilter,
  triggerPinZoneMode,
  triggerPinFacilityMode,
  searchMapLocation,
  startMapPickMode,
  cancelMapPick,
  openAreaModalWithCoords,
  flyToDistrictSector
} from './adminMap.js';

import {
  USER_BASIN_REGISTRY,
  resolveUserBasin,
  INDIA_DISTRICT_SECTORS,
  getRiversForDistrict,
  detectNearestRiver
} from './indiaGisData.js';

export default function initAdminPage() {
  const __ready = [];
  const __onReady = (fn) => __ready.push(fn);

  /* =====================================================================
     DYNAMIC TELEMETRY STATE & NEXT.JS BACKEND REAL-TIME SYNC
     ===================================================================== */
  let state = getCurrentState();
  window.adminState = state;
  let isDrillMode = true;

  function toggleDataMode() {
    isDrillMode = !isDrillMode;
    const btn = document.getElementById('dataModeBtn');
    const stText = document.getElementById('telemetryStatusText');
    if (isDrillMode) {
      state = getCurrentState();
      if (btn) btn.innerHTML = '<i class="fas fa-database"></i> Live Telemetry';
      if (stText) stText.textContent = 'Live Monitoring';
      showToast('Synchronized with live district telemetry.');
    } else {
      state = {
        areas: [],
        rivers: [],
        alerts: [],
        facilities: [],
        weather: { rainfall: '—', advisory: 'Awaiting IMD Feed', humidity: '—', forecast: 'No live feed' }
      };
      if (btn) btn.innerHTML = '<i class="fas fa-plug"></i> Standby';
      if (stText) stText.textContent = 'Standby Mode';
      showToast('Switched to clean Standby state.');
    }
    window.adminState = state;
    renderAllCards();
  }

  const TAB_MAP = {
    'overview': 'tab-map-hub',
    'map': 'tab-map-hub',
    'map-hub': 'tab-map-hub',
    'zones-hub': 'tab-areas-grid',
    'areas-grid': 'tab-areas-grid',
    'flood-zones': 'tab-areas-grid',
    'gauges-hub': 'tab-rivers-weather',
    'rivers-weather': 'tab-rivers-weather',
    'rivers-rain': 'tab-rivers-weather',
    'alerts-hub': 'tab-alerts-grid',
    'alerts-grid': 'tab-alerts-grid',
    'facilities-hub': 'tab-facilities-grid',
    'facilities-grid': 'tab-facilities-grid'
  };

  function switchTab(tabId, btnEl) {
    document.querySelectorAll('.rail-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) {
      btnEl.classList.add('active');
    } else {
      const activeRail = document.querySelectorAll('.rail-btn')[0];
      if (tabId === 'map-hub' || tabId === 'overview') {
        if (activeRail) activeRail.classList.add('active');
      }
    }
    document.querySelectorAll('.tab-view-pane').forEach(v => v.classList.remove('active'));
    const resolvedId = TAB_MAP[tabId] || (tabId.startsWith('tab-') ? tabId : `tab-${tabId}`);
    const targetPane = document.getElementById(resolvedId) || document.getElementById('tab-map-hub');
    if (targetPane) targetPane.classList.add('active');

    // Trigger map resize if switching to map tab
    if (tabId === 'map-hub' || resolvedId === 'tab-map-hub' || tabId === 'overview') {
      setTimeout(() => {
        const mapContainer = document.getElementById('leafletMap');
        if (mapContainer) {
          if (window.adminLeafletMapInstance) window.adminLeafletMapInstance.invalidateSize();
          if (window.leafletMapInstance) window.leafletMapInstance.invalidateSize();
        }
      }, 150);
    }
  }

  function getSevClass(sev) {
    if (sev === 'Critical') return 'sev-critical';
    if (sev === 'High') return 'sev-high';
    if (sev === 'Moderate') return 'sev-moderate';
    return 'sev-normal';
  }

  function renderAllCards() {
    const totalPop = (state.areas || []).reduce((s, a) => s + (Number(a.pop) || 0), 0);
    const highCritCount = (state.areas || []).filter(a => a.severity === 'Critical' || a.severity === 'High').length;

    // 1. 4-KPI Cards Grid
    const kpis = [
      { val: (state.areas || []).length, lbl: 'Marked Flood Zones', icon: 'fa-map-pin', bg: '#e0f2fe', color: '#0284c7' },
      { val: highCritCount, lbl: 'Critical & High Risk', icon: 'fa-triangle-exclamation', bg: '#fee2e2', color: '#dc2626' },
      { val: (state.alerts || []).length, lbl: 'Active Warnings', icon: 'fa-bullhorn', bg: '#fef3c7', color: '#d97706' },
      { val: totalPop.toLocaleString(), lbl: 'Est. Zone Population', icon: 'fa-users', bg: '#dcfce7', color: '#15803d' }
    ];

    const kpiGrid = document.getElementById('adminKpiGrid');
    if (kpiGrid) {
      kpiGrid.innerHTML = kpis.map(k => `
        <div class="kpi-card-box">
          <div class="kpi-icon-sq" style="background:${k.bg}; color:${k.color};"><i class="fas ${k.icon}"></i></div>
          <div>
            <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:17px; font-weight:800; color:var(--navy-deep); line-height:1.1;">${k.val}</div>
            <div style="font-size:10.5px; font-weight:600; color:var(--text-muted); margin-top:2px;">${k.lbl}</div>
          </div>
        </div>
      `).join('');
    }

    // 2. Map Zones Maintenance Cards Grid
    const renderZoneCards = (list) => {
      if (!list || list.length === 0) {
        return `<div style="grid-column:1/-1; text-align:center; padding:18px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);">No flood-affected village markers recorded. Click <strong>Add Map Marker</strong> to add GIS data.</div>`;
      }
      return list.map(a => {
        const isUnderAuth = Boolean(a.underAuthorityAction);
        return `
          <div class="eco-data-card" style="${isUnderAuth ? 'border-top:3.5px solid #0284c7;' : ''}">
            <div class="eco-card-top">
              <div>
                <h4 style="margin:0 0 2px;"><i class="fas fa-location-dot" style="color:#0284c7; margin-right:4px;"></i>${a.name}</h4>
                <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${a.block}</span>
              </div>
              <div style="display:flex; gap:4px; align-items:center;">
                ${isUnderAuth ? `<span class="sev-pill" style="background:#eff6ff; color:#0284c7; border:1px solid #bfdbfe; font-size:9.5px; padding:2px 6px;" title="Active relief request/allocation with District Authority"><i class="fas fa-shield"></i> Authority Active</span>` : ''}
                <span class="sev-pill ${getSevClass(a.severity)}">${a.severity}</span>
              </div>
            </div>
            <div class="eco-meta-grid">
              <span>Pop: <strong>${Number(a.pop).toLocaleString()}</strong></span>
              <span>GIS: <strong>${(Number(a.lat) || 0).toFixed(2)}, ${(Number(a.lng) || 0).toFixed(2)}</strong></span>
            </div>
            <p style="margin:0; font-size:11.5px; color:var(--text-body); line-height:1.4;">${a.notes || ''}</p>
            <div class="eco-card-footer" style="flex-wrap:wrap; gap:6px; align-items:center;">
              <button class="card-action-btn" style="background:#eff6ff; color:#0284c7; border-color:#93c5fd; font-weight:700;" onclick="window.focusAdminMapOnCoords && window.focusAdminMapOnCoords(${Number(a.lat)}, ${Number(a.lng)}, '${(a.name || '').replace(/'/g, "\\'")}', '${a.id || ''}')"><i class="fas fa-crosshairs"></i> Focus on Map</button>
              <button class="card-action-btn" onclick="window.editAreaRecord(${a.idx})"><i class="fas fa-edit"></i> Edit</button>
              ${!isUnderAuth ? `
                <button class="card-action-btn del" onclick="window.deleteAreaRecord(${a.idx})" title="Delete Area Record"><i class="fas fa-trash"></i></button>
              ` : `
                <span style="font-size:10px; font-weight:700; color:#0369a1; background:#e0f2fe; padding:4px 8px; border-radius:6px; border:1px solid #bae6fd; display:inline-flex; align-items:center; gap:4px;" title="Locked: Active request/allocation forwarded to District Authority. Cannot be deleted.">
                  <i class="fas fa-lock"></i> Deletion Locked
                </span>
              `}
            </div>
          </div>
        `;
      }).join('');
    };

    const indexedAreas = (state.areas || []).map((item, idx) => ({ ...item, idx }));
    const mapZonesGrid = document.getElementById('mapZonesCardGrid');
    if (mapZonesGrid) mapZonesGrid.innerHTML = renderZoneCards(indexedAreas);

    const sevFilter = document.getElementById('sevFilter')?.value || 'ALL';
    const filteredAreas = indexedAreas.filter(a => sevFilter === 'ALL' || a.severity === sevFilter);
    const fullAreasGrid = document.getElementById('fullAreasCardGrid');
    if (fullAreasGrid) fullAreasGrid.innerHTML = renderZoneCards(filteredAreas);

    // 3. Right Panel River Activity Cards + Full Rivers Grid
    const rightRiverBox = document.getElementById('rightRiverCards');
    const fullRiverBox = document.getElementById('fullRiversCardGrid');
    if (!state.rivers || state.rivers.length === 0) {
      if (rightRiverBox) rightRiverBox.innerHTML = `<div style="text-align:center; padding:12px; color:var(--text-muted); font-size:11.5px;">Awaiting river gauge telemetry.</div>`;
      if (fullRiverBox) fullRiverBox.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No river gauge readings connected.</div>`;
    } else {
      if (rightRiverBox) {
        rightRiverBox.innerHTML = state.rivers.map(r => {
          const isDanger = r.current >= r.danger;
          const sev = isDanger ? 'Critical Breach' : (r.current >= r.danger - 0.8 ? 'Warning Watch' : 'Normal Flow');
          const badgeCls = isDanger ? 'sev-critical' : (sev === 'Warning Watch' ? 'sev-moderate' : 'sev-normal');
          const arrow = r.trend === 'Rising' ? '↑' : (r.trend === 'Falling' ? '↓' : '→');
          const dischargeTag = r.dischargeFormatted ? `<span style="font-size:9px; background:#e0f2fe; color:#0369a1; padding:1px 5px; border-radius:4px; font-weight:700; margin-left:4px; border:1px solid #bae6fd;" title="Real-time River Discharge (GloFAS)"><i class="fas fa-water"></i> ${r.dischargeFormatted}</span>` : '';
          const stationTag = r.stationCode ? `<span style="font-size:9.5px; color:#64748b; display:block; margin-top:1px;">${r.stationCode} • ${r.lastUpdated || 'Live'}</span>` : '';

          return `
            <div class="river-stat-tile" title="${r.station || r.name} | CWC Danger Level: ${Number(r.danger).toFixed(2)}m">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:4px; height:28px; border-radius:3px; background:${r.barColor || '#0284c7'};"></span>
                <div>
                  <div style="display:flex; align-items:center;">
                    <strong style="font-size:11.5px; color:var(--navy-deep);">${(r.name || '').split(' (')[0]}</strong>
                    ${dischargeTag}
                  </div>
                  <div style="font-size:10px; color:var(--text-muted); margin-top:1px;">
                    <strong style="color:${isDanger ? '#dc2626' : 'var(--navy-deep)'}; font-size:11px;">${arrow} ${Number(r.current).toFixed(2)} m</strong> / Danger: ${Number(r.danger).toFixed(2)} m
                  </div>
                  ${stationTag}
                </div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:3px;">
                <span class="sev-pill ${badgeCls}" style="font-size:9px; padding:2px 5px;">${sev}</span>
                <svg width="48" height="16" viewBox="0 0 54 20" fill="none">
                  <path d="${r.spark || 'M2 10 L52 10'}" stroke="${r.barColor || '#0284c7'}" stroke-width="2.2" stroke-linecap="round" />
                </svg>
              </div>
            </div>
          `;
        }).join('');
      }

      if (fullRiverBox) {
        fullRiverBox.innerHTML = state.rivers.map(r => {
          const isDanger = r.current >= r.danger;
          const sev = isDanger ? 'Critical' : (r.current >= r.danger - 0.8 ? 'Moderate' : 'Normal');
          return `
            <div class="eco-data-card">
              <div class="eco-card-top">
                <div>
                  <h4>${r.name}</h4>
                  <span style="font-size:10.5px; color:var(--text-muted); font-weight:600;">${r.station || r.basin} • ${r.stationCode || 'CWC Hydrology Site'}</span>
                </div>
                <span class="sev-pill ${getSevClass(sev)}">${r.trend}</span>
              </div>
              <div class="eco-meta-grid">
                <span>Current Level: <strong>${Number(r.current).toFixed(2)} m</strong></span>
                <span>Danger Mark: <strong>${Number(r.danger).toFixed(2)} m</strong></span>
                <span>River Discharge: <strong>${r.dischargeFormatted || 'Live Flow'}</strong></span>
                <span>Telemetry Feed: <strong>${r.source || 'Open-Meteo GloFAS & CWC'}</strong></span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 4. Weather Cards Grid
    const w = state.weather || { rainfall: '—', advisory: 'Standby', humidity: '—', forecast: '—' };
    const weatherGrid = document.getElementById('weatherCardGrid');
    if (weatherGrid) {
      weatherGrid.innerHTML = `
        <div class="kpi-card-box"><div class="kpi-icon-sq" style="background:#e0f2fe; color:#0284c7;"><i class="fas fa-cloud-rain"></i></div><div><strong style="font-size:14px;">${w.rainfall || '—'}</strong><div style="font-size:10.5px; color:var(--text-muted);">24-Hr Rainfall</div></div></div>
        <div class="kpi-card-box"><div class="kpi-icon-sq" style="background:#ffedd5; color:#c2410c;"><i class="fas fa-triangle-exclamation"></i></div><div><strong style="font-size:13px;">${w.advisory || '—'}</strong><div style="font-size:10.5px; color:var(--text-muted);">Weather Status</div></div></div>
        <div class="kpi-card-box"><div class="kpi-icon-sq" style="background:#dcfce7; color:#15803d;"><i class="fas fa-wind"></i></div><div><strong style="font-size:13.5px;">${w.humidity || '—'}</strong><div style="font-size:10.5px; color:var(--text-muted);">Wind & Humidity</div></div></div>
        <div class="kpi-card-box"><div class="kpi-icon-sq" style="background:#e0e7ff; color:#4338ca;"><i class="fas fa-clock"></i></div><div><strong style="font-size:13.5px;">${w.forecast || '—'}</strong><div style="font-size:10.5px; color:var(--text-muted);">Catchment Outlook</div></div></div>
      `;
    }

    // 5. Right Panel Alerts + Full Alerts Grid
    const rightAlertCountEl = document.getElementById('rightAlertCount');
    if (rightAlertCountEl) rightAlertCountEl.textContent = (state.alerts || []).length;
    const rightAlertBox = document.getElementById('rightAlertsCards');
    const fullAlertBox = document.getElementById('fullAlertsCardGrid');
    if (!state.alerts || state.alerts.length === 0) {
      if (rightAlertBox) rightAlertBox.innerHTML = `<div style="text-align:center; padding:12px; color:var(--text-muted); font-size:11.5px;">No active warnings published.</div>`;
      if (fullAlertBox) fullAlertBox.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No active flood alerts published.</div>`;
    } else {
      if (rightAlertBox) {
        rightAlertBox.innerHTML = state.alerts.map(a => {
          const isCrit = a.severity === 'Critical' || a.severity === 'High';
          return `
            <div class="alert-stat-tile ${isCrit ? 'crit' : 'warn'}">
              <i class="fas fa-triangle-exclamation" style="color:${isCrit ? '#dc2626' : '#d97706'}; font-size:15px;"></i>
              <div>
                <strong style="display:block; font-size:11.5px; color:var(--navy-deep);">${a.title}</strong>
                <span style="display:block; font-size:10px; color:var(--text-muted);">${a.location}</span>
              </div>
              <span class="sev-pill ${getSevClass(a.severity)}">${a.severity}</span>
            </div>
          `;
        }).join('');
      }

      if (fullAlertBox) {
        fullAlertBox.innerHTML = state.alerts.map((a, idx) => `
          <div class="eco-data-card">
            <div class="eco-card-top">
              <div>
                <h4>${a.title}</h4>
                <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${a.location}</span>
              </div>
              <span class="sev-pill ${getSevClass(a.severity)}">${a.severity}</span>
            </div>
            <p style="margin:0; font-size:12px; color:var(--text-body);">${a.desc}</p>
            <div class="eco-card-footer">
              <button class="card-action-btn del" onclick="window.deleteAlertRecord(${idx})"><i class="fas fa-trash"></i> Revoke Warning</button>
            </div>
          </div>
        `).join('');
      }
    }

    // 6. Facilities Grid & Nearby Public Help
    const facBox = document.getElementById('fullFacilitiesCardGrid');
    if (facBox) {
      facBox.innerHTML = (!state.facilities || state.facilities.length === 0)
        ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No emergency facilities pinned yet.</div>`
        : state.facilities.map((f, idx) => `
          <div class="eco-data-card">
            <div class="eco-card-top">
              <h4>${f.name}</h4>
              <span class="sev-pill sev-normal">${f.category}</span>
            </div>
            <div class="eco-meta-grid">
              <span>Sector: <strong>${f.distance}</strong></span>
              <span>Helpline: <strong>${f.contact}</strong></span>
            </div>
            <div class="eco-card-footer">
              <button class="card-action-btn del" onclick="window.deleteFacilityRecord(${idx})"><i class="fas fa-trash"></i> Remove</button>
            </div>
          </div>
        `).join('');
    }

    // Dynamically resolve nearby public help distances from facilities
    const hosp = (state.facilities || []).find(f => (f.category || '').toLowerCase().includes('hospital'));
    const pol = (state.facilities || []).find(f => (f.category || '').toLowerCase().includes('police'));
    const camp = (state.facilities || []).find(f => (f.category || '').toLowerCase().includes('camp'));

    const rDistHospEl = document.getElementById('rDistHosp');
    const rDistPolEl = document.getElementById('rDistPol');
    const rDistCampEl = document.getElementById('rDistCamp');

    if (rDistHospEl) rDistHospEl.textContent = hosp ? (hosp.distance.split('•')[0].trim() || hosp.distance) : '—';
    if (rDistPolEl) rDistPolEl.textContent = pol ? (pol.distance.split('•')[0].trim() || pol.distance) : '—';
    if (rDistCampEl) rDistCampEl.textContent = camp ? (camp.distance.split('•')[0].trim() || camp.distance) : '—';

    // 7. SYNC LIVE LEAFLET GIS MAP MARKERS, LIVE RIVERS & RISK BUFFERS
    updateMapLayers(state.areas || [], state.facilities || [], state.rivers || []);
  }

  // --- RIVER DANGER LEVEL CALCULATOR & MONITORING SWITCHER ---
  function calcRiverDangerStatus() {
    const curInp = document.getElementById('inpRiverCur');
    const dangInp = document.getElementById('inpRiverDanger');
    const statusBadge = document.getElementById('lblRiverDangerStatus');
    const diffText = document.getElementById('lblDangerDiff');
    if (!curInp || !dangInp || !statusBadge || !diffText) return;

    const cur = parseFloat(curInp.value) || 0;
    const dang = parseFloat(dangInp.value) || 0;
    const diff = (cur - dang).toFixed(1);

    if (cur >= dang) {
      statusBadge.className = 'sev-pill sev-critical';
      statusBadge.textContent = 'DANGER BREACH';
      diffText.style.color = '#dc2626';
      diffText.innerHTML = `⚠️ River level is +${diff} m ABOVE Danger Mark! Critical inundation risk active.`;
    } else if (cur >= dang - 0.8) {
      statusBadge.className = 'sev-pill sev-moderate';
      statusBadge.textContent = 'WARNING LEVEL';
      diffText.style.color = '#d97706';
      diffText.innerHTML = `⚡ River level is approaching Danger Mark (${Math.abs(diff)}m below). Embankment watch active.`;
    } else {
      statusBadge.className = 'sev-pill sev-normal';
      statusBadge.textContent = 'SAFE LEVEL';
      diffText.style.color = '#15803d';
      diffText.innerHTML = `✓ Water level is ${Math.abs(diff)} m below Danger Mark. Normal river discharge.`;
    }
  }

  function switchMonitoringDistrict(districtId) {
    const userBasin = window.activeUserBasin || resolveUserBasin(sessionStorage.getItem('neerakshak_user') || 'ad1558bk');
    
    // STRICT ISOLATION: User can ONLY view sectors that belong to their assigned river basin!
    let sector = userBasin.sectors.find(s => s.id === districtId);
    if (!sector) {
      sector = userBasin.sectors[0];
      const sel = document.getElementById('heroDistrictSelect');
      if (sel) sel.value = sector.id;
    }

    flyToDistrictSector(sector.id);

    // Update real river telemetry strictly for this officer's basin
    state.rivers = userBasin.rivers;
    renderAllCards();

    // Fetch latest live gauge readings asynchronously
    fetchLiveRiverTelemetry(userBasin.id).then(live => {
      if (live && live.length > 0) {
        state.rivers = live;
        renderAllCards();
      }
    });

    const statusText = document.getElementById('telemetryStatusText');
    if (statusText) statusText.textContent = `${sector.name.split(' ')[0]} Active`;

    showToast(`🛰️ Telemetry loaded for ${sector.name} (${userBasin.basinName})`);
  }

  // --- MANUAL TELEMETRY REFRESH ---
  async function refreshLiveRiverTelemetry() {
    const userBasin = window.activeUserBasin || resolveUserBasin(sessionStorage.getItem('neerakshak_user') || 'ad1558bk');
    const icon = document.getElementById('riverRefreshIcon');
    if (icon) icon.classList.add('fa-spin');

    try {
      const liveRivers = await fetchLiveRiverTelemetry(userBasin.id);
      if (liveRivers && liveRivers.length > 0) {
        state.rivers = liveRivers;
        window.adminState = state;
        renderAllCards();
        showToast(`🟢 Telemetry refreshed for ${userBasin.shortName} via Open-Meteo GloFAS & CWC`);
      }
    } catch (e) {}

    if (icon) {
      setTimeout(() => icon.classList.remove('fa-spin'), 650);
    }
  }

  // --- AREA MODAL & CRUD ---
  function openAreaModal() {
    document.getElementById('editAreaIdx').value = '-1';
    document.getElementById('areaModalHeading').textContent = 'Mark Flood-Affected Area on GIS Map';
    document.getElementById('inpAreaName').value = '';
    document.getElementById('inpAreaBlock').value = '';
    document.getElementById('inpAreaNotes').value = '';

    const detectBadge = document.getElementById('geoDetectBadge');
    if (detectBadge) detectBadge.style.display = 'none';

    const userBasin = window.activeUserBasin || resolveUserBasin(sessionStorage.getItem('neerakshak_user') || 'ad1558bk');
    const curSectorId = document.getElementById('heroDistrictSelect')?.value;
    const curSector = userBasin.sectors.find(s => s.id === curSectorId) || userBasin.sectors[0];

    const lat = parseFloat(document.getElementById('inpAreaLat')?.value) || curSector.coords[0];
    const lng = parseFloat(document.getElementById('inpAreaLng')?.value) || curSector.coords[1];

    if (document.getElementById('inpAreaLat')) document.getElementById('inpAreaLat').value = lat.toFixed(4);
    if (document.getElementById('inpAreaLng')) document.getElementById('inpAreaLng').value = lng.toFixed(4);

    const riv = detectNearestRiver(lat, lng, userBasin.id);
    if (document.getElementById('inpAreaRiver')) document.getElementById('inpAreaRiver').value = riv.name;
    if (document.getElementById('inpRiverCur')) document.getElementById('inpRiverCur').value = riv.current;
    if (document.getElementById('inpRiverDanger')) document.getElementById('inpRiverDanger').value = riv.danger;

    calcRiverDangerStatus();
    document.getElementById('areaModal').classList.add('open');
  }

  function editAreaRecord(idx) {
    const item = state.areas[idx];
    if (!item) return;
    document.getElementById('editAreaIdx').value = idx;
    document.getElementById('areaModalHeading').textContent = 'Update Flood Area & Severity';
    document.getElementById('inpAreaName').value = item.name;
    document.getElementById('inpAreaBlock').value = item.block;
    document.getElementById('inpAreaSev').value = item.severity;
    document.getElementById('inpAreaPop').value = item.pop;
    document.getElementById('inpAreaLat').value = item.lat;
    document.getElementById('inpAreaLng').value = item.lng;
    document.getElementById('inpAreaNotes').value = item.notes;

    const lat = Number(item.lat) || 26.15;
    const lng = Number(item.lng) || 91.60;
    const riv = item.river ? { name: item.river, current: item.riverCurrent || 18.2, danger: item.riverDanger || 18.0 } : detectNearestRiver(lat, lng);

    if (document.getElementById('inpAreaRiver')) document.getElementById('inpAreaRiver').value = item.river || riv.name;
    if (document.getElementById('inpRiverCur')) document.getElementById('inpRiverCur').value = item.riverCurrent !== undefined ? item.riverCurrent : riv.current;
    if (document.getElementById('inpRiverDanger')) document.getElementById('inpRiverDanger').value = item.riverDanger !== undefined ? item.riverDanger : riv.danger;

    calcRiverDangerStatus();
    document.getElementById('areaModal').classList.add('open');
  }

  async function saveAreaRecord(e) {
    e.preventDefault();
    const idx = Number(document.getElementById('editAreaIdx').value);
    const riverName = document.getElementById('inpAreaRiver')?.value?.trim() || 'Brahmaputra River';
    const riverCur = parseFloat(document.getElementById('inpRiverCur')?.value) || 18.2;
    const riverDang = parseFloat(document.getElementById('inpRiverDanger')?.value) || 18.0;

    const rec = {
      name: document.getElementById('inpAreaName').value.trim() || 'Sector',
      block: document.getElementById('inpAreaBlock').value.trim() || 'District Block',
      severity: document.getElementById('inpAreaSev').value,
      pop: Number(document.getElementById('inpAreaPop').value) || 0,
      lat: Number(document.getElementById('inpAreaLat').value),
      lng: Number(document.getElementById('inpAreaLng').value),
      notes: document.getElementById('inpAreaNotes').value.trim(),
      river: riverName,
      riverCurrent: riverCur,
      riverDanger: riverDang
    };

    // Update active river list with this river's reading
    if (!state.rivers) state.rivers = [];
    const existingRiver = state.rivers.find(r => r.name.toLowerCase() === riverName.toLowerCase());
    if (existingRiver) {
      existingRiver.current = riverCur;
      existingRiver.danger = riverDang;
      existingRiver.trend = riverCur >= riverDang ? 'Rising' : 'Steady';
      existingRiver.barColor = riverCur >= riverDang ? '#dc2626' : (riverCur >= riverDang - 0.8 ? '#eab308' : '#16a34a');
    } else {
      state.rivers.unshift({
        id: `riv-${Date.now()}`,
        name: riverName,
        current: riverCur,
        danger: riverDang,
        trend: riverCur >= riverDang ? 'Rising' : 'Steady',
        barColor: riverCur >= riverDang ? '#dc2626' : '#0284c7',
        spark: 'M2 15 L12 13 L22 11 L32 8 L42 6 L52 3'
      });
    }

    closeModal('areaModal');
    await saveAreaApi(rec, idx);
    renderAllCards();
    showToast(idx >= 0 ? `Updated GIS zone & river telemetry: ${rec.name}` : `Added ${rec.severity} flood zone (${riverName}: ${riverCur}m) to Next.js backend.`);
    
    // Smoothly fly map to updated zone
    zoomToCoords(rec.lat, rec.lng);
  }

  async function deleteAreaRecord(idx) {
    const targetArea = (state.areas || [])[idx];
    if (targetArea && targetArea.underAuthorityAction) {
      showToast(`🔒 Cannot delete: "${targetArea.name}" is under active District Authority operation.`);
      return;
    }
    try {
      await deleteAreaApi(idx);
      renderAllCards();
      showToast('Removed flood zone marker from GIS map & database.');
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    }
  }

  // --- ALERT MODAL & CRUD ---
  function openAlertModal() {
    document.getElementById('inpAlertLoc').value = '';
    document.getElementById('inpAlertTitle').value = '';
    document.getElementById('inpAlertDesc').value = '';
    document.getElementById('alertModal').classList.add('open');
  }

  async function saveAlertRecord(e) {
    e.preventDefault();
    const newAlert = {
      location: document.getElementById('inpAlertLoc').value.trim(),
      severity: document.getElementById('inpAlertSev').value,
      title: document.getElementById('inpAlertTitle').value.trim(),
      desc: document.getElementById('inpAlertDesc').value.trim()
    };
    closeModal('alertModal');
    await addAlertApi(newAlert);
    renderAllCards();
    showToast('Public flood warning broadcasted to portal network.');
  }

  async function deleteAlertRecord(idx) {
    await deleteAlertApi(idx);
    renderAllCards();
    showToast('Flood warning alert revoked.');
  }

  // --- RIVER GAUGE UPDATE ---
  function openRiverModal() {
    const sel = document.getElementById('inpRiverSelect');
    if (!state.rivers || state.rivers.length === 0) {
      sel.innerHTML = '<option value="" disabled selected>No rivers connected</option>';
      document.getElementById('inpRiverLevel').value = '';
    } else {
      sel.innerHTML = state.rivers.map((r, i) => `<option value="${i}">${r.name}</option>`).join('');
      document.getElementById('inpRiverLevel').value = state.rivers[0].current;
    }
    document.getElementById('riverModal').classList.add('open');
  }

  async function saveRiverReading(e) {
    e.preventDefault();
    const sel = document.getElementById('inpRiverSelect');
    if (!sel || sel.value === '' || isNaN(Number(sel.value))) {
      showToast('No river selected.');
      closeModal('riverModal');
      return;
    }
    const i = Number(sel.value);
    if (!state.rivers[i]) return;
    const current = Number(document.getElementById('inpRiverLevel').value);
    const trend = document.getElementById('inpRiverTrend').value;
    
    closeModal('riverModal');
    await updateRiverApi(i, { current, trend });
    renderAllCards();
    showToast(`Updated ${state.rivers[i].name} reading in database.`);
  }

  // --- WEATHER UPDATE ---
  function openWeatherModal() {
    document.getElementById('weatherModal').classList.add('open');
  }

  async function saveWeatherRecord(e) {
    e.preventDefault();
    const w = {
      rainfall: document.getElementById('inpWeatherRain').value.trim(),
      advisory: document.getElementById('inpWeatherAdv').value.trim()
    };
    closeModal('weatherModal');
    await updateWeatherApi(w);
    renderAllCards();
    showToast('Weather telemetry synchronized with backend.');
  }

  // --- FACILITY MODAL & CRUD ---
  function openFacilityModal() {
    document.getElementById('inpFacName').value = '';
    document.getElementById('inpFacDist').value = '';
    document.getElementById('facilityModal').classList.add('open');
  }

  async function saveFacilityRecord(e) {
    e.preventDefault();
    const fac = {
      name: document.getElementById('inpFacName').value.trim(),
      category: document.getElementById('inpFacCat').value,
      distance: document.getElementById('inpFacDist').value.trim(),
      contact: document.getElementById('inpFacPhone').value.trim()
    };
    closeModal('facilityModal');
    await addFacilityApi(fac);
    renderAllCards();
    showToast('Emergency facility pinned on GIS map & registered.');
  }

  async function deleteFacilityRecord(idx) {
    await deleteFacilityApi(idx);
    renderAllCards();
    showToast('Emergency facility removed.');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  function copyHelpline(num) {
    navigator.clipboard?.writeText(num);
    showToast(`Copied emergency helpline ${num}.`);
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    if (t) {
      t.textContent = msg;
      t.style.right = '18px';
      setTimeout(() => { t.style.right = '-380px'; }, 3000);
    }
  }

  // INITIALIZE ON DOM READY
  __onReady(() => {
    try {
      // 1. Resolve logged-in officer's jurisdiction & river basin
      let loggedUser = '';
      try {
        loggedUser = sessionStorage.getItem('neerakshak_user') || 'ad1558bk';
      } catch (e) {
        loggedUser = 'ad1558bk';
      }
      const userBasin = resolveUserBasin(loggedUser);
      window.activeUserBasin = userBasin;

      // 2. Strict Sector Isolation: Populate Dropdown with EXACT 5-6 sectors belonging to this basin
      const sel = document.getElementById('heroDistrictSelect');
      if (sel && userBasin && Array.isArray(userBasin.sectors)) {
        sel.innerHTML = `
          <optgroup label="${userBasin.stateName} — ${userBasin.basinName} (${userBasin.sectors.length} Sectors Assigned)">
            ${userBasin.sectors.map(sec => `
              <option value="${sec.id}">${sec.name} (${sec.river})</option>
            `).join('')}
          </optgroup>
        `;
        if (userBasin.sectors[0]) sel.value = userBasin.sectors[0].id;
      }

      // 3. Update Hero Badge & Window title
      const basinBadge = document.getElementById('heroBasinBadge');
      if (basinBadge && userBasin) {
        basinBadge.textContent = `Admin • ${userBasin.shortName}`;
        basinBadge.title = `Officer ID: ${loggedUser} | Division: ${userBasin.tagline}`;
      }

      // 4. Initialize Leaflet Map centered on user's primary assigned sector
      const initialSector = (userBasin && userBasin.sectors && userBasin.sectors[0]) || { coords: [26.15, 91.60], zoom: 11, id: 'default' };
      const map = initAdminFloodMap('leafletMap', initialSector.coords, initialSector.zoom, userBasin ? userBasin.id : 'bk');
      window.leafletMapInstance = map;

      // 5. Initialize state with user's real river telemetry
      if (userBasin && userBasin.rivers) {
        state.rivers = userBasin.rivers;
      }
      window.adminState = state;
      renderAllCards();

      // 6. Fetch full state from Next.js backend & render
      fetchFullAdminState().then(data => {
        if (data) {
          state = {
            ...data,
            rivers: (userBasin && userBasin.rivers) || state.rivers // Preserve real basin river gauges
          };
          window.adminState = state;
          renderAllCards();
        }
      }).catch(err => console.warn('Backend state fetch notice:', err));

      // 7. Start real-time sync with backend
      startRealtimeSync();
      onSync((newState) => {
        state = {
          ...newState,
          rivers: state.rivers && state.rivers.length > 0 ? state.rivers : ((userBasin && userBasin.rivers) || [])
        };
        window.adminState = state;
        renderAllCards();
      });

      // 8. Start Live River Telemetry Polling (every 35 seconds)
      if (userBasin && userBasin.id) {
        startLiveRiverPolling(userBasin.id, 35000);
        fetchLiveRiverTelemetry(userBasin.id).then(live => {
          if (live && live.length > 0) {
            state.rivers = live;
            window.adminState = state;
            renderAllCards();
          }
        }).catch(err => console.warn('Telemetry poll notice:', err));
      }

      // 9. Focus on the primary sector
      if (initialSector && initialSector.id) {
        switchMonitoringDistrict(initialSector.id);
      }
    } catch (initErr) {
      console.error('Fatal admin initialization caught:', initErr);
    }
  });

  function focusAdminMapOnCoords(lat, lng, areaName, areaId) {
    if (typeof switchTab === 'function') {
      const railBtn = document.querySelectorAll('.rail-btn')[0];
      switchTab('map-hub', railBtn);
    }
    setTimeout(() => {
      if (window.adminLeafletMapInstance) {
        window.adminLeafletMapInstance.invalidateSize();
      }
      if (typeof window.zoomToCoords === 'function') {
        window.zoomToCoords(lat, lng, 14, true);
      }
      if (areaName && typeof showToast === 'function') {
        showToast(`Map focused on ${areaName}`);
      }
    }, 120);
  }

  // Attach all handlers to window for inline HTML & React calls
  Object.assign(window, {
    focusAdminMapOnCoords,
    closeModal,
    copyHelpline,
    deleteAlertRecord,
    deleteAreaRecord,
    deleteFacilityRecord,
    editAreaRecord,
    getSevClass,
    openAlertModal,
    openAreaModal,
    openFacilityModal,
    openRiverModal,
    openWeatherModal,
    renderAllCards,
    saveAlertRecord,
    saveAreaRecord,
    saveFacilityRecord,
    saveRiverReading,
    saveWeatherRecord,
    showToast,
    switchTab,
    toggleDataMode,
    refreshLiveRiverTelemetry,
    // GIS Map Controls
    mapZoomIn,
    mapZoomOut,
    mapRecenter,
    zoomToCoords,
    setSeverityFilter,
    triggerPinZoneMode,
    triggerPinFacilityMode,
    searchMapLocation,
    startMapPickMode,
    cancelMapPick,
    openAreaModalWithCoords,
    calcRiverDangerStatus,
    switchMonitoringDistrict,
    flyToDistrictSector
  });

  __ready.forEach((fn) => fn());
}
