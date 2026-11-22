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
  onSync
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
  searchMapLocation
} from './adminMap.js';

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

  function switchTab(tabId, btnEl) {
    document.querySelectorAll('.rail-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    document.querySelectorAll('.tab-view-pane').forEach(v => v.classList.remove('active'));
    const targetPane = document.getElementById(`tab-${tabId}`);
    if (targetPane) targetPane.classList.add('active');

    // Trigger map resize if switching to map tab
    if (tabId === 'map-hub') {
      setTimeout(() => {
        const mapContainer = document.getElementById('leafletMap');
        if (mapContainer && window.leafletMapInstance) {
          window.leafletMapInstance.invalidateSize();
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
      return list.map(a => `
        <div class="eco-data-card">
          <div class="eco-card-top">
            <div>
              <h4>${a.name}</h4>
              <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${a.block}</span>
            </div>
            <span class="sev-pill ${getSevClass(a.severity)}">${a.severity}</span>
          </div>
          <div class="eco-meta-grid">
            <span>Pop: <strong>${Number(a.pop).toLocaleString()}</strong></span>
            <span>GIS: <strong>${(Number(a.lat) || 0).toFixed(2)}, ${(Number(a.lng) || 0).toFixed(2)}</strong></span>
          </div>
          <p style="margin:0; font-size:11.5px; color:var(--text-body); line-height:1.4;">${a.notes || ''}</p>
          <div class="eco-card-footer">
            <button class="card-action-btn" onclick="window.zoomToCoords && window.zoomToCoords(${Number(a.lat)}, ${Number(a.lng)})"><i class="fas fa-crosshairs"></i> View Map</button>
            <button class="card-action-btn" onclick="window.editAreaRecord(${a.idx})"><i class="fas fa-edit"></i> Edit</button>
            <button class="card-action-btn del" onclick="window.deleteAreaRecord(${a.idx})"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `).join('');
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
          const sev = isDanger ? 'Danger' : (r.current >= r.danger - 0.8 ? 'Warning' : 'Normal');
          const badgeCls = isDanger ? 'sev-critical' : (sev === 'Warning' ? 'sev-moderate' : 'sev-normal');
          const arrow = r.trend === 'Rising' ? '↑' : (r.trend === 'Falling' ? '↓' : '→');
          return `
            <div class="river-stat-tile">
              <div style="display:flex; align-items:center; gap:7px;">
                <span style="width:4px; height:22px; border-radius:3px; background:${r.barColor || '#0284c7'};"></span>
                <div>
                  <strong style="display:block; font-size:12px; color:var(--navy-deep);">${r.name}</strong>
                  <span style="font-size:10.5px; color:var(--text-muted);">${arrow} ${Number(r.current).toFixed(1)} m</span>
                </div>
              </div>
              <span class="sev-pill ${badgeCls}">${sev}</span>
              <svg width="50" height="18" viewBox="0 0 54 20" fill="none">
                <path d="${r.spark || 'M2 10 L52 10'}" stroke="${r.barColor || '#0284c7'}" stroke-width="2.2" stroke-linecap="round" />
              </svg>
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
                <h4>${r.name}</h4>
                <span class="sev-pill ${getSevClass(sev)}">${r.trend}</span>
              </div>
              <div class="eco-meta-grid">
                <span>Current: <strong>${Number(r.current).toFixed(1)} m</strong></span>
                <span>Danger: <strong>${Number(r.danger).toFixed(1)} m</strong></span>
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

    // 7. SYNC LIVE LEAFLET GIS MAP MARKERS & RISK BUFFERS
    updateMapLayers(state.areas || [], state.facilities || []);
  }

  // --- AREA MODAL & CRUD ---
  function openAreaModal() {
    document.getElementById('editAreaIdx').value = '-1';
    document.getElementById('areaModalHeading').textContent = 'Mark Flood-Affected Area on GIS Map';
    document.getElementById('inpAreaName').value = '';
    document.getElementById('inpAreaBlock').value = '';
    document.getElementById('inpAreaNotes').value = '';
    // Sensible default coordinates for Kamrup if not already filled by map click
    if (!document.getElementById('inpAreaLat').value) document.getElementById('inpAreaLat').value = '26.1200';
    if (!document.getElementById('inpAreaLng').value) document.getElementById('inpAreaLng').value = '91.4500';
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
    document.getElementById('areaModal').classList.add('open');
  }

  async function saveAreaRecord(e) {
    e.preventDefault();
    const idx = Number(document.getElementById('editAreaIdx').value);
    const rec = {
      name: document.getElementById('inpAreaName').value.trim(),
      block: document.getElementById('inpAreaBlock').value.trim(),
      severity: document.getElementById('inpAreaSev').value,
      pop: Number(document.getElementById('inpAreaPop').value) || 0,
      lat: Number(document.getElementById('inpAreaLat').value),
      lng: Number(document.getElementById('inpAreaLng').value),
      notes: document.getElementById('inpAreaNotes').value.trim()
    };

    closeModal('areaModal');
    await saveAreaApi(rec, idx);
    renderAllCards();
    showToast(idx >= 0 ? `Updated GIS zone: ${rec.name}` : `Added ${rec.severity} flood zone to Next.js backend.`);
    
    // Smoothly fly map to updated zone
    zoomToCoords(rec.lat, rec.lng);
  }

  async function deleteAreaRecord(idx) {
    await deleteAreaApi(idx);
    renderAllCards();
    showToast('Removed flood zone marker from GIS map & database.');
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
    // 1. Initialize Leaflet Map
    const map = initAdminFloodMap('leafletMap');
    window.leafletMapInstance = map;

    // 2. Fetch full state from Next.js backend & render
    fetchFullAdminState().then(data => {
      if (data) {
        state = data;
        window.adminState = state;
        renderAllCards();
      }
    });

    // 3. Start real-time sync with backend
    startRealtimeSync();
    onSync((newState) => {
      state = newState;
      window.adminState = state;
      renderAllCards();
    });
  });

  // Attach all handlers to window for inline HTML & React calls
  Object.assign(window, {
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
    // GIS Map Controls
    mapZoomIn,
    mapZoomOut,
    mapRecenter,
    zoomToCoords,
    setSeverityFilter,
    triggerPinZoneMode,
    triggerPinFacilityMode,
    searchMapLocation
  });

  __ready.forEach((fn) => fn());
}
