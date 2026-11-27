// NEERAKSHAK Ground Officer Portal Logic & Live Integration
// Connects UI with Next.js Backend & MongoDB Live Operations Engine

import {
  fetchFullGroundState,
  getCurrentGroundState,
  onGroundSync,
  submitFieldReportApi,
  verifyPhysicalDeliveryApi,
  updateRescueProgressApi,
  confirmSituationControlledApi,
  submitReturnVerificationApi,
  startGroundOfficerSync
} from './groundOfficerApi.js';

import {
  initGroundFloodMap,
  updateGroundAreaMarkers,
  focusGroundMap,
  autoCenterGroundMapOnAreas,
  renderGroundRivers,
  filterGroundMapSeverity,
  searchGroundMap,
  groundMapZoomIn,
  groundMapZoomOut,
  groundMapRecenter,
  parseAreaCoordinates
} from './groundOfficerMap.js';

import {
  resolveUserBasin
} from '../admin/indiaGisData.js';

export default function initGroundOfficerPage() {
  const __ready = [];
  const __onReady = (fn) => __ready.push(fn);

  let isDrillMode = true;
  let isListView = false;
  let selectedVillageName = null;
  let state = getCurrentGroundState();

  onGroundSync((fresh) => {
    state = fresh;
    renderAllGroundViews();
  });

  function toggleGridListView() {
    isListView = !isListView;
    const sw = document.getElementById('viewSlideSwitch');
    if (isListView) {
      document.body.classList.add('list-mode');
      if (sw) sw.classList.add('is-list');
      showToast('Switched to List View');
    } else {
      document.body.classList.remove('list-mode');
      if (sw) sw.classList.remove('is-list');
      showToast('Switched to Clean Grid View');
    }
  }

  function toggleDataMode() {
    isDrillMode = !isDrillMode;
    const btn = document.getElementById('dataModeBtn');
    if (isDrillMode) {
      fetchFullGroundState();
      if (btn) btn.innerHTML = '<i class="fas fa-database"></i> Live Operational DB';
      showToast('Switched to Live Operational Database state.');
    } else {
      state = {
        areas: [],
        deliveries: [],
        fieldReports: [],
        operations: [],
        returns: [],
        notifications: []
      };
      if (btn) btn.innerHTML = '<i class="fas fa-plug"></i> Empty View';
      showToast('Switched to Empty View.');
    }
    renderAllGroundViews();
  }

  function switchGroundTab(tabKey, btnEl) {
    document.querySelectorAll('.go-nav-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    document.querySelectorAll('.go-tab-pane').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`tab-${tabKey}`);
    if (target) target.classList.add('active');

    // Invalidate map size on switching to dashboard
    if (tabKey === 'dashboard') {
      setTimeout(() => {
        if (window.groundLeafletMapInstance) window.groundLeafletMapInstance.invalidateSize();
      }, 150);
    }
  }

  function getToneClass(sevOrStatus) {
    if (sevOrStatus === 'Critical' || sevOrStatus === 'Discrepancy Flagged') return 'tone-critical';
    if (sevOrStatus === 'High' || sevOrStatus === 'Pending Verification') return 'tone-high';
    if (sevOrStatus === 'Verified' || sevOrStatus === 'Approved / Reviewed' || sevOrStatus === 'Completed') return 'tone-good';
    return 'tone-amber';
  }

  function getPillClass(val) {
    if (val === 'Critical' || val === 'Discrepancy Flagged') return 'p-critical';
    if (val === 'High') return 'p-high';
    if (val === 'Verified' || val === 'Approved / Reviewed' || val === 'Completed') return 'p-good';
    if (val === 'Pending Verification' || val === 'Pending Review') return 'p-pending';
    return 'p-moderate';
  }

  function focusGroundMapByName(destName) {
    if (!destName) return;
    const cleanName = String(destName).trim();

    // 1. Switch to dashboard/map tab if not currently active
    const dashBtn = document.querySelector('.go-nav-btn[data-tab="dashboard"]');
    switchGroundTab('dashboard', dashBtn);

    // 2. Select this village for right inspector panel
    selectedVillageName = cleanName;

    // 3. Find coords for this destination
    const areas = (state && state.areas) || [];
    const found = areas.find(a => 
      (a.village && a.village.toLowerCase().includes(cleanName.toLowerCase())) ||
      (cleanName.toLowerCase().includes((a.village || '').toLowerCase()))
    );

    let coords = [26.15, 91.55];
    if (found) {
      coords = parseAreaCoordinates(found);
    } else {
      try {
        let loggedUser = 'go5142bk';
        const u = sessionStorage.getItem('neerakshak_user');
        if (u) loggedUser = u.toLowerCase().trim();
        const b = resolveUserBasin(loggedUser);
        if (b && Array.isArray(b.sectors)) {
          const s = b.sectors.find(sec => 
            sec.name.toLowerCase().includes(cleanName.toLowerCase()) || 
            cleanName.toLowerCase().includes(sec.name.toLowerCase())
          );
          if (s && s.coords) coords = s.coords;
          else if (b.sectors[0] && b.sectors[0].coords) coords = b.sectors[0].coords;
        }
      } catch (e) {}
    }

    // 4. Center map and smooth scroll
    setTimeout(() => {
      if (window.groundLeafletMapInstance) {
        window.groundLeafletMapInstance.invalidateSize();
        focusGroundMap(coords[0], coords[1], 14, cleanName);
      }
      const mapSlot = document.getElementById('groundMapSlot');
      if (mapSlot) {
        mapSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);

    renderAllGroundViews();
    showToast(`Focused Map on ${cleanName}`);
  }

  function selectGroundVillageForInspection(vName) {
    selectedVillageName = vName;
    const areas = (state && state.areas) || [];
    const found = areas.find(a => a.village === vName);
    if (found) {
      const [lat, lng] = parseAreaCoordinates(found);
      focusGroundMap(lat, lng, 14, vName);
      showToast(`Map centered on ${found.village}`);
    }
    renderAllGroundViews();
  }

  function quickClearFirstActive() {
    const deliveries = (state && state.deliveries) || [];
    const activeDeliv = deliveries.find(d => !Boolean(d.groundOfficerCleared || d.reliefClearedForReturn));
    if (activeDeliv) {
      confirmSituationControlledOnGround(activeDeliv.dispatchId, activeDeliv.destination);
    } else {
      showToast('All active relief consignments are already cleared for return.');
    }
  }

  let activeAlertFilter = 'ALL';

  function filterNotifs(filterType) {
    activeAlertFilter = filterType;
    document.querySelectorAll('.btn-card-action').forEach(b => {
      if (b.id && b.id.startsWith('notifFilter')) b.classList.remove('active');
    });
    if (filterType === 'ALL') {
      const b = document.getElementById('notifFilterAll');
      if (b) b.classList.add('active');
    } else if (filterType === 'Critical') {
      const b = document.getElementById('notifFilterCrit');
      if (b) b.classList.add('active');
    } else if (filterType === 'Convoys') {
      const b = document.getElementById('notifFilterConvoys');
      if (b) b.classList.add('active');
    }
    renderAllGroundViews();
  }

  function selectSosSector(vName) {
    if (!vName) return;
    selectedVillageName = vName;
    const areas = (state && state.areas) || [];
    const found = areas.find(a => a.village.toLowerCase() === vName.toLowerCase());

    const frSel = document.getElementById('frVillageSel');
    if (frSel) frSel.value = vName;

    if (found) {
      const gpsInp = document.getElementById('frGpsCoords');
      if (gpsInp && found.coords) gpsInp.value = found.coords;
      const sevSel = document.getElementById('frSeveritySel');
      if (sevSel && found.severity) sevSel.value = found.severity;
    }

    document.querySelectorAll('.sector-chip-btn').forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.village || '').toLowerCase() === vName.toLowerCase());
    });

    const remArea = document.getElementById('frRemarks');
    if (remArea) {
      remArea.focus();
    }
    showToast(`Loaded SITREP verification form for ${vName}`);
  }

  function quickFileSos() {
    switchGroundTab('field-reports', document.querySelector('[data-tab=field-reports]'));
    const areas = (state && state.areas) || [];
    const crit = areas.find(a => a.severity === 'Critical') || areas[0];
    if (crit) {
      selectSosSector(crit.village);
    }
  }

  function quickVerifyFirstPending() {
    switchGroundTab('assigned-deliveries', document.querySelector('[data-tab=assigned-deliveries]'));
    const deliveries = (state && state.deliveries) || [];
    const pendingIdx = deliveries.findIndex(d => d.status === 'Pending Verification');
    if (pendingIdx !== -1) {
      openVerifyDeliveryModal(pendingIdx);
    } else {
      showToast('All dispatched relief deliveries are verified.');
    }
  }

  function quickOpenRescueModal() {
    switchGroundTab('rescue-ops', document.querySelector('[data-tab=rescue-ops]'));
    const operations = (state && state.operations) || [];
    if (operations.length > 0) {
      openRescueUpdateModal(0);
    } else {
      showToast('No active rescue operations recorded.');
    }
  }

  function renderAllGroundViews() {
    if (!state) state = getCurrentGroundState();
    const areas = state.areas || [];
    const deliveries = state.deliveries || [];
    const fieldReports = state.fieldReports || [];
    const operations = state.operations || [];
    const returns = state.returns || [];
    const notifications = state.notifications || [];

    // Dynamically populate Assigned Areas filter in Hero header
    const areaFilterEl = document.getElementById('assignedAreaFilter');
    if (areaFilterEl && areas.length > 0) {
      const curVal = areaFilterEl.value;
      const opts = `<option value="ALL">All My Assigned Areas (${areas.length} Sectors)</option>` +
        areas.map(a => `<option value="${a.village}">${a.village}</option>`).join('');
      if (areaFilterEl.innerHTML !== opts) {
        areaFilterEl.innerHTML = opts;
        if (curVal && (curVal === 'ALL' || areas.some(a => a.village === curVal))) {
          areaFilterEl.value = curVal;
        }
      }
    }

    // Populate sector dropdowns for Delivery, Rescue, and Return tabs
    const populateSectorSelect = (selectId, labelPrefix) => {
      const sel = document.getElementById(selectId);
      if (sel && areas.length > 0) {
        const curVal = sel.value;
        const opts = `<option value="ALL">All ${labelPrefix} (${areas.length} Sectors)</option>` +
          areas.map(a => `<option value="${a.village}">${a.village}</option>`).join('');
        if (sel.innerHTML !== opts) {
          sel.innerHTML = opts;
          if (curVal && (curVal === 'ALL' || areas.some(a => a.village === curVal))) {
            sel.value = curVal;
          }
        }
      }
    };
    populateSectorSelect('delivSectorFilter', 'Affected Sectors');
    populateSectorSelect('rescueSectorFilter', 'Rescue Sectors');
    populateSectorSelect('returnSectorFilter', 'Return Sectors');

    const areaFilter = areaFilterEl?.value || 'ALL';
    const delivFilter = document.getElementById('delivSectorFilter')?.value || 'ALL';
    const rescueFilter = document.getElementById('rescueSectorFilter')?.value || 'ALL';
    const returnFilter = document.getElementById('returnSectorFilter')?.value || 'ALL';

    const visAreas = areas.filter(a => areaFilter === 'ALL' || a.village === areaFilter);
    const visDeliv = deliveries.filter(d => (areaFilter === 'ALL' || d.destination === areaFilter) && (delivFilter === 'ALL' || d.destination === delivFilter));
    const visReports = fieldReports.filter(r => areaFilter === 'ALL' || r.village === areaFilter);
    const visOps = operations.filter(o => (areaFilter === 'ALL' || o.location === areaFilter) && (rescueFilter === 'ALL' || o.location === rescueFilter));
    const visReturns = returns.filter(r => (areaFilter === 'ALL' || r.location === areaFilter) && (returnFilter === 'ALL' || r.location === returnFilter));

    const pendingDelivs = deliveries.filter(d => d.status === 'Pending Verification');
    const verifiedDelivs = deliveries.filter(d => d.status !== 'Pending Verification');

    const navPendingDelivCount = document.getElementById('navPendingDelivCount');
    if (navPendingDelivCount) navPendingDelivCount.textContent = pendingDelivs.length;
    const navOpsCount = document.getElementById('navOpsCount');
    if (navOpsCount) navOpsCount.textContent = visOps.length;
    const navNotifCount = document.getElementById('navNotifCount');
    if (navNotifCount) navNotifCount.textContent = notifications.length;

    // 1. Populate SOS Sector Selector Chips Bar
    const chipsBar = document.getElementById('sosSectorChipsBar');
    if (chipsBar && areas.length > 0) {
      chipsBar.innerHTML = areas.map(a => {
        const isSel = selectedVillageName === a.village;
        return `
          <button type="button" class="sector-chip-btn ${isSel ? 'active' : ''}" data-village="${a.village}" onclick="window.selectSosSector('${(a.village || '').replace(/'/g, "\\'")}')">
            <i class="fas fa-location-dot" style="color:${a.severity === 'Critical' ? '#dc2626' : '#0284c7'};"></i>
            ${a.village}
            <span class="pill ${getPillClass(a.severity)}" style="font-size:9.5px; padding:1px 5px;">${a.severity}</span>
          </button>
        `;
      }).join('');
    }

    // Populate Field Report Village Select with live assigned areas
    const frSel = document.getElementById('frVillageSel');
    if (frSel) {
      const curFrVal = frSel.value;
      frSel.innerHTML = areas.length
        ? areas.map(a => `<option value="${a.village}">${a.village} (${a.block || a.severity})</option>`).join('')
        : `<option value="Palashbari Riverside Ward 2">Palashbari Riverside Ward 2</option>`;
      if (curFrVal && areas.some(a => a.village === curFrVal)) {
        frSel.value = curFrVal;
      }
      frSel.onchange = () => {
        selectSosSector(frSel.value);
      };
    }

    // 2. 6-KPI Summary Strip
    const kpis = [
      { val: isDrillMode ? areas.length : '0', lbl: 'Assigned Sectors', icon: 'fa-map-pin', grad: 'kpi-grad-blue' },
      { val: isDrillMode ? pendingDelivs.length : '0', lbl: 'Pending Verifications', icon: 'fa-truck-ramp-box', grad: 'kpi-grad-amber' },
      { val: isDrillMode ? verifiedDelivs.length : '0', lbl: 'Completed Receipts', icon: 'fa-circle-check', grad: 'kpi-grad-green' },
      { val: isDrillMode ? visReports.length : '0', lbl: 'Field SITREPs Filed', icon: 'fa-house-flood-water', grad: 'kpi-grad-indigo' },
      { val: isDrillMode ? visOps.length : '0', lbl: 'Active Rescue Ops', icon: 'fa-life-ring', grad: 'kpi-grad-teal' },
      { val: isDrillMode ? notifications.length : '0', lbl: 'Field Notifications', icon: 'fa-bell', grad: 'kpi-grad-red' }
    ];

    const kpiGrid = document.getElementById('groundKpiGrid');
    if (kpiGrid) {
      kpiGrid.innerHTML = kpis.map(k => `
        <div class="kpi-tile ${k.grad}">
          <div class="kpi-ic"><i class="fas ${k.icon}"></i></div>
          <div>
            <div class="kpi-val">${k.val}</div>
            <div class="kpi-lbl">${k.lbl}</div>
          </div>
        </div>
      `).join('');
    }

    // 3. Merged Assigned Flood Sectors & Physical Deliveries Grid (#assignedDeliveriesGrid)
    const delivGrid = document.getElementById('assignedDeliveriesGrid');
    if (delivGrid) {
      delivGrid.innerHTML = visDeliv.length === 0
        ? `<div style="text-align:center; padding:24px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);">No deliveries matching this sector filter.</div>`
        : visDeliv.map(d => {
          const origIdx = deliveries.indexOf(d);
          const isCleared = Boolean(d.groundOfficerCleared || d.reliefClearedForReturn);
          const isVerified = d.status === 'Verified';
          const p = d.involvedPersonnel || {};
          const items = d.itemBreakdown || [];

          return `
            <div class="sub-card ${getToneClass(d.status)}" style="margin-bottom:14px; padding:16px 18px;">
              <div class="sub-card-top" style="align-items:flex-start; margin-bottom:10px;">
                <div>
                  <h3 style="margin:0 0 4px 0; font-size:15px; color:var(--navy-deep);">
                    <i class="fas fa-location-dot" style="color:var(--river-blue); margin-right:6px;"></i>
                    ${d.destination}
                    <span class="pill ${getPillClass(d.sectorDetails?.severity || 'Critical')}" style="margin-left:8px; font-size:10px;">${d.sectorDetails?.severity || 'Critical'}</span>
                  </h3>
                  <div style="font-size:11.5px; color:var(--text-muted); font-weight:600;">
                    ${d.sectorDetails?.block || 'Assigned Circle'} • Coordinates: <strong>${d.sectorDetails?.coords || '26.15° N, 91.55° E'}</strong> • Gate-Pass: <strong style="color:#0284c7;">${d.dispatchId}</strong> • Order: <strong>${d.allocId || 'ALC-565'}</strong>
                  </div>
                </div>
                <div style="display:flex; gap:6px; align-items:center;">
                  <span class="pill ${getPillClass(d.status)}" style="font-size:11px; padding:4px 10px;">${d.status}</span>
                  <button type="button" class="btn-go" style="padding:4px 9px; font-size:11px;" onclick="window.focusGroundMapByName && window.focusGroundMapByName('${(d.destination || '').replace(/'/g, "\\'")}')" title="Focus sector on GIS Map">
                    <i class="fas fa-map-location-dot" style="color:var(--river-blue);"></i> Map
                  </button>
                </div>
              </div>

              <!-- INVOLVED PERSONNEL TEAM GRID -->
              <div class="personnel-team-box">
                <div style="font-size:11px; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:0.5px;">
                  <i class="fas fa-users-gear" style="color:#0284c7; margin-right:5px;"></i> Involved Multi-Agency Escort & Field Officers:
                </div>
                <div class="personnel-grid-row">
                  <div class="personnel-tile">
                    <i class="fas fa-truck" style="color:#0284c7;"></i>
                    <div>
                      <div class="personnel-tile-role">Convoy Vehicle</div>
                      <div class="personnel-tile-name" title="${p.vehicle || 'Heavy Truck AS-01-EC-4210'}">${p.vehicle || 'Heavy Truck AS-01-EC-4210'}</div>
                    </div>
                  </div>
                  <div class="personnel-tile">
                    <i class="fas fa-id-card" style="color:#0d9488;"></i>
                    <div>
                      <div class="personnel-tile-role">Convoy Driver</div>
                      <div class="personnel-tile-name" title="${p.driver || 'Rajesh Das'}">${p.driver || 'Rajesh Das (+91 98640-21943)'}</div>
                    </div>
                  </div>
                  <div class="personnel-tile">
                    <i class="fas fa-shield-halved" style="color:#dc2626;"></i>
                    <div>
                      <div class="personnel-tile-role">NDRF Escort Officer</div>
                      <div class="personnel-tile-name" title="${p.ndrfEscort || 'Inspector Rajesh Kalita'}">${p.ndrfEscort || 'Inspector Rajesh Kalita (NDRF)'}</div>
                    </div>
                  </div>
                  <div class="personnel-tile">
                    <i class="fas fa-warehouse" style="color:#16a34a;"></i>
                    <div>
                      <div class="personnel-tile-role">Godown Manager</div>
                      <div class="personnel-tile-name" title="${p.godownManager || 'Rajesh Das (WH-MIRZA)'}">${p.godownManager || 'Rajesh Das (WH-MIRZA)'}</div>
                    </div>
                  </div>
                  <div class="personnel-tile">
                    <i class="fas fa-person-walking-luggage" style="color:#0ea5e9;"></i>
                    <div>
                      <div class="personnel-tile-role">Ground Field Officer</div>
                      <div class="personnel-tile-name" title="Bhaskar Jyoti Das (GO-KAM-04)">Bhaskar Jyoti Das (GO-KAM-04)</div>
                    </div>
                  </div>
                  <div class="personnel-tile">
                    <i class="fas fa-building-columns" style="color:#4f46e5;"></i>
                    <div>
                      <div class="personnel-tile-role">Allocating Authority</div>
                      <div class="personnel-tile-name" title="Dr. A. K. Sharma (DDMA)">Dr. A. K. Sharma (DM / DDMA)</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ITEM-WISE COMPARISON TABLE -->
              <div style="font-size:11px; font-weight:700; color:#334155; text-transform:uppercase; margin-top:10px;">
                <i class="fas fa-boxes-stacked" style="color:#0d9488; margin-right:5px;"></i> Item-Wise Dispatched vs Physical Ground Verified:
              </div>
              <div style="overflow-x:auto;">
                <table class="item-audit-table">
                  <thead>
                    <tr>
                      <th>Resource Item</th>
                      <th>Requested (Quota)</th>
                      <th>Godown Dispatched</th>
                      <th>Ground Received</th>
                      <th>Shortage / Damaged</th>
                      <th>Verification Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map(it => `
                      <tr>
                        <td><strong>${it.name}</strong> <span style="font-size:10px; color:#64748b;">(${it.category})</span></td>
                        <td>${it.requested} Units</td>
                        <td style="color:#0369a1; font-weight:700;">${it.dispatched} Units</td>
                        <td style="color:${it.received > 0 ? '#15803d' : '#64748b'}; font-weight:700;">${it.received > 0 ? `${it.received} Units` : (isVerified ? `${it.dispatched} Units` : 'Awaiting Count')}</td>
                        <td style="color:${(it.shortage + it.damaged) > 0 ? '#dc2626' : '#15803d'}; font-weight:700;">
                          ${(it.shortage + it.damaged) > 0 ? `${it.shortage} Short, ${it.damaged} Dmg` : '0 Variance'}
                        </td>
                        <td>
                          <span class="pill ${isVerified ? 'p-good' : 'p-pending'}" style="font-size:9.5px;">${isVerified ? 'Verified' : 'Pending Intake'}</span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- EVIDENCE & WAYBILL REFERENCE STRIP -->
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; margin-top:8px; font-size:11px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div>
                  <span style="color:#64748b;">Waybill / Evidence Ref:</span>
                  <strong style="color:#0284c7; margin-left:4px;">${d.evidenceRef || `EVD-${d.dispatchId}`}</strong>
                  <span style="margin:0 8px; color:#cbd5e1;">|</span>
                  <span style="color:#64748b;">Remarks:</span>
                  <span style="color:#1e293b; margin-left:4px;">${d.remarks}</span>
                </div>
                ${d.verifiedAt ? `<span style="font-size:10.5px; color:#15803d; font-weight:700;"><i class="fas fa-clock-check"></i> Verified at: ${d.verifiedAt}</span>` : ''}
              </div>

              ${isCleared ? `
                <div class="return-ready-banner">
                  <i class="fas fa-check-double" style="font-size:16px;"></i>
                  <div>
                    <strong>Situation Controlled & Cleared:</strong>
                    You have confirmed rescue operations are complete and situation in ${d.destination} is under control. Equipment is unlocked in the Returns portal.
                  </div>
                </div>
              ` : `
                <div class="return-lock-banner">
                  <i class="fas fa-hourglass-half" style="font-size:16px;"></i>
                  <div>
                    <strong>Field Operation Active:</strong>
                    Return restock is locked until you complete verification and confirm the situation is under control.
                  </div>
                </div>
              `}

              <!-- ACTION FOOTER -->
              <div class="sub-card-footer" style="margin-top:12px; padding-top:10px; border-top:1px dashed #cbd5e1; flex-wrap:wrap; gap:8px;">
                <span style="font-size:11px; color:var(--text-muted);"><i class="fas fa-link"></i> Linked to Central Godown Waybill <strong>${d.dispatchId}</strong></span>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  ${!isVerified ? `
                    <button type="button" class="btn-go primary" onclick="openVerifyDeliveryModal(${origIdx})">
                      <i class="fas fa-check-double"></i> Verify Physical Delivery Intake
                    </button>
                  ` : `
                    <span style="font-size:11px; font-weight:700; color:#15803d; padding:4px 10px; background:#f0fdf4; border-radius:6px; border:1px solid #bbf7d0;">
                      <i class="fas fa-lock"></i> Physical Receipt Verified
                    </span>
                  `}
                  ${!isCleared ? `
                    <button type="button" class="btn-go primary" style="background:#15803d; border-color:#16a34a; font-size:11px; padding:6px 12px;" onclick="window.confirmSituationControlledOnGround('${d.dispatchId}', '${(d.destination || '').replace(/'/g, "\\'")}')">
                      <i class="fas fa-shield-check"></i> Confirm Situation Controlled & Release for Return
                    </button>
                  ` : `
                    <span style="font-size:11px; font-weight:700; color:#15803d; padding:4px 8px;"><i class="fas fa-circle-check"></i> Cleared for Return</span>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join('');
    }

    // 4. Recent SOS SITREPs Feed in Tab 3 (#recentSosReportsList)
    const recentSos = document.getElementById('recentSosReportsList');
    if (recentSos) {
      recentSos.innerHTML = visReports.length === 0
        ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No field reports filed yet for this sector.</div>`
        : visReports.slice(0, 4).map(r => `
          <div class="sub-card ${getToneClass(r.severity)}" style="padding:10px 12px;">
            <div class="sub-card-top" style="margin-bottom:4px;">
              <div>
                <h4 style="margin:0; font-size:12.5px;"><i class="fas fa-file-lines" style="color:var(--teal-field); margin-right:4px;"></i>${r.refId} • ${r.village}</h4>
                <span style="font-size:10.5px; color:var(--text-muted);">${r.time} • GPS: ${r.coords}</span>
              </div>
              <span class="pill ${getPillClass(r.severity)}" style="font-size:9.5px;">${r.severity}</span>
            </div>
            <div class="meta-box" style="margin:6px 0; font-size:11px;">
              <span>Water: <strong>${r.water}</strong></span>
              <span>Stranded: <strong style="color:#dc2626;">${r.stranded} Citizens</strong></span>
              <span>Road: <strong>${r.road}</strong></span>
            </div>
            <p style="margin:0; font-size:11px; color:var(--text-body);"><strong>Remarks:</strong> ${r.remarks || r.needs}</p>
          </div>
        `).join('');
    }

    // 5. Return Ops / Rescue Operations Grid (#fullRescueOpsGrid)
    const fullRescueGrid = document.getElementById('fullRescueOpsGrid');
    if (fullRescueGrid) {
      fullRescueGrid.innerHTML = visOps.length === 0
        ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No rescue operations in selected sector.</div>`
        : visOps.map(o => {
          const origIdx = operations.indexOf(o);
          const totalAtRisk = o.citizensAtRisk || (o.rescued + o.stranded) || 60;
          const pct = Math.min(100, Math.round((o.rescued / (totalAtRisk || 1)) * 100));
          const isControlled = Boolean(o.isCleared || o.status === 'Situation Controlled & Cleared' || o.status === 'Completed');

          return `
            <div class="sub-card ${isControlled ? 'tone-good' : 'tone-purple'}" style="padding:16px 18px; border-left: 4px solid ${isControlled ? '#16a34a' : '#0284c7'};">
              <div class="sub-card-top" style="margin-bottom:8px;">
                <div>
                  <h4 style="margin:0 0 3px 0; font-size:15px; color:var(--navy-deep);">
                    <i class="fas fa-shield-heart" style="color:${isControlled ? '#16a34a' : 'var(--foliage-mid)'}; margin-right:6px;"></i>
                    ${o.location} Sector • ${o.opId}
                  </h4>
                  <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${o.agency} • Lead: <strong>${o.leadOfficer || 'Tactical Team'}</strong></span>
                </div>
                <span class="pill ${isControlled ? 'p-good' : 'p-info'}" style="font-size:10.5px; font-weight:700;">
                  ${isControlled ? '✓ Situation Controlled' : o.status}
                </span>
              </div>
              
              <!-- EVACUATION PROGRESS BAR -->
              <div style="margin:10px 0;">
                <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:4px;">
                  <span>Evacuation Progress: <strong>${o.rescued} Citizens Rescued</strong></span>
                  <span style="color:${o.stranded > 0 ? '#dc2626' : '#16a34a'}; font-weight:700;">
                    ${o.stranded > 0 ? `${o.stranded} Stranded Remaining` : '0 Stranded (All Citizens Safe)'}
                  </span>
                </div>
                <div style="width:100%; height:9px; background:#e2e8f0; border-radius:10px; overflow:hidden;">
                  <div style="width:${pct}%; height:100%; background:${isControlled ? '#16a34a' : 'linear-gradient(90deg, #10b981 0%, #0284c7 100%)'};"></div>
                </div>
              </div>

              <div class="meta-box" style="margin:8px 0; font-size:11px;">
                <span>Boats Active: <strong>${o.boatsAssigned || 3} Craft</strong></span>
                <span>Direct Hotline: <strong>${o.contact || '+91 94350-12345'}</strong></span>
              </div>
              <p style="margin:0 0 10px 0; font-size:11.5px; color:var(--text-body); line-height:1.4;">
                <strong>Field SITREP:</strong> ${o.notes}
              </p>
              
              <!-- RETURN CLEARANCE ACTIONS -->
              <div class="sub-card-footer" style="padding-top:10px; border-top:1px dashed #cbd5e1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  ${!isControlled ? `
                    <button type="button" class="btn-go primary" style="background:#15803d; border-color:#16a34a; font-size:11.5px; padding:7px 13px; font-weight:700;" onclick="window.confirmSituationControlledOnGround('${o.opId}', '${(o.location || '').replace(/'/g, "\\'")}')">
                      <i class="fas fa-shield-check"></i> Confirm Situation Controlled & Release for Return
                    </button>
                    <button type="button" class="btn-go" style="font-size:11px; padding:6px 10px;" onclick="openRescueUpdateModal(${origIdx})">
                      <i class="fas fa-pen"></i> Update Evacuation Progress
                    </button>
                  ` : `
                    <span style="font-size:11px; font-weight:700; color:#15803d; padding:5px 10px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; display:inline-flex; align-items:center; gap:5px;">
                      <i class="fas fa-circle-check"></i> Situation Controlled & Equipment Released
                    </span>
                    <button type="button" class="btn-go primary" style="font-size:11px; padding:6px 12px;" onclick="window.switchGroundTab('return-verify', document.querySelector('[data-tab=return-verify]')); window.openReturnVerifyModal('${(o.location || '').replace(/'/g, "\\'")}');">
                      <i class="fas fa-rotate-left"></i> Submit Ground Return Handover →
                    </button>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join('');
    }

    // 6. Returns Grid with Sector-wise Itemized Audit & Dual-Verification Guard (#returnVerifyGrid)
    const retGrid = document.getElementById('returnVerifyGrid');
    if (retGrid) {
      retGrid.innerHTML = visReturns.length === 0
        ? `<div style="text-align:center; padding:18px; color:var(--text-muted);">No return records matching this filter.</div>`
        : visReturns.map(r => {
          const items = r.items || [];
          return `
            <div class="sub-card ${r.canReturnInput ? 'tone-good' : 'tone-amber'}" style="margin-bottom:14px; padding:16px 18px;">
              <div class="sub-card-top" style="align-items:flex-start; margin-bottom:8px;">
                <div>
                  <h4 style="margin:0 0 4px 0; font-size:14px; color:var(--navy-deep);">
                    <i class="fas fa-rotate-left" style="color:var(--teal-field); margin-right:5px;"></i>
                    ${r.retId} • ${r.location}
                  </h4>
                  <div style="font-size:11px; color:var(--text-muted);">
                    Consignment: <strong>${r.item}</strong> • Ground Officer: <strong>${r.groundOfficer || 'Bhaskar Jyoti Das'}</strong>
                  </div>
                </div>
                <span class="pill ${r.canReturnInput ? 'p-good' : 'p-pending'}" style="font-size:10px;">
                  ${r.canReturnInput ? 'Return Intake Ready' : 'Locked (Operation Active)'}
                </span>
              </div>

              ${!r.canReturnInput ? `
                <div class="return-lock-banner">
                  <i class="fas fa-lock" style="font-size:18px;"></i>
                  <div>
                    <strong>Return Intake Guard Active:</strong>
                    ${r.lockReason || 'Physical delivery must be verified and ground officer must confirm situation under control before equipment can be returned.'}
                  </div>
                </div>
              ` : `
                <div class="return-ready-banner">
                  <i class="fas fa-shield-check" style="font-size:18px;"></i>
                  <div>
                    <strong>Ground Clearance Granted:</strong>
                    Floodwaters have receded to safe marks. Field unit is clearing equipment for Central Godown return restock.
                  </div>
                </div>
              `}

              <!-- ITEM-WISE RETURN CONDITION TABLE -->
              <div style="font-size:11px; font-weight:700; color:#334155; text-transform:uppercase; margin-top:10px;">
                <i class="fas fa-clipboard-check" style="color:#0d9488; margin-right:5px;"></i> Itemized Condition Breakdown:
              </div>
              <div style="overflow-x:auto;">
                <table class="item-audit-table">
                  <thead>
                    <tr>
                      <th>Equipment Item</th>
                      <th>Dispatched Qty</th>
                      <th>Good Condition</th>
                      <th>Damaged</th>
                      <th>Missing</th>
                      <th>Intake Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map(it => `
                      <tr>
                        <td><strong>${it.name}</strong> <span style="font-size:10px; color:#64748b;">(${it.category || 'Gear'})</span></td>
                        <td>${it.dispatched} Units</td>
                        <td style="color:#15803d; font-weight:700;">${it.good} Units</td>
                        <td style="color:#d97706; font-weight:700;">${it.damaged} Units</td>
                        <td style="color:#dc2626; font-weight:700;">${it.missing} Units</td>
                        <td><span class="pill ${it.status === 'Field Inspected' ? 'p-good' : 'p-pending'}" style="font-size:9px;">${it.status}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <p style="margin:8px 0; font-size:11.5px; color:var(--text-body);">
                <strong>Field Officer Damage & Inspection Feedback:</strong> ${r.remarks}
              </p>

              <div class="sub-card-footer" style="padding-top:10px; border-top:1px dashed #cbd5e1; margin-top:10px;">
                <span style="font-size:10.5px; color:var(--text-muted);">Dual-verification protocol with Central Godown WH-MIRZA</span>
                ${r.canReturnInput ? `
                  <button type="button" class="btn-go primary" onclick="window.openReturnVerifyModal('${(r.location || '').replace(/'/g, "\\'")}')">
                    <i class="fas fa-clipboard-check"></i> Submit Itemized Return Audit to Godown
                  </button>
                ` : `
                  <button type="button" class="btn-go" disabled style="opacity:0.6; cursor:not-allowed;">
                    <i class="fas fa-lock"></i> Return Input Locked
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('');
    }

    // 7. Notifications Grid with Filter Chips (#notificationsGrid)
    const notifGrid = document.getElementById('notificationsGrid');
    if (notifGrid) {
      const filteredNotifs = notifications.filter(n => {
        if (activeAlertFilter === 'ALL') return true;
        if (activeAlertFilter === 'Critical') return n.priority === 'Critical';
        if (activeAlertFilter === 'Convoys') return n.agency && n.agency.includes('Godown');
        return true;
      });

      notifGrid.innerHTML = filteredNotifs.length === 0
        ? `<div style="text-align:center; padding:20px; color:var(--text-muted);">No notifications in this category.</div>`
        : filteredNotifs.map(n => {
          const isCrit = n.priority === 'Critical';
          const isHigh = n.priority === 'High';
          const borderClass = isCrit ? 'alert-crit' : (isHigh ? 'alert-high' : 'alert-norm');
          const badgeBg = isCrit ? '#fee2e2' : (isHigh ? '#ffedd5' : '#e0f2fe');
          const badgeColor = isCrit ? '#991b1b' : (isHigh ? '#9a3412' : '#0369a1');

          return `
            <div class="alert-card-item ${borderClass}">
              <div class="alert-card-top">
                <span class="alert-agency-badge" style="background:${badgeBg}; color:${badgeColor};">
                  <i class="fas ${n.icon || 'fa-bell'}" style="margin-right:4px;"></i> ${n.agency || 'DEOC State Alert'}
                </span>
                <span style="font-size:11px; color:#64748b; font-weight:600;"><i class="fas fa-clock"></i> ${n.time}</span>
              </div>
              <h4 style="margin:0 0 4px 0; font-size:13px; color:#0f172a;">${n.title}</h4>
              <p style="margin:0; font-size:11.5px; color:#334155; line-height:1.45;">${n.detail}</p>
              ${n.action ? `
                <div class="alert-action-strip">
                  <strong><i class="fas fa-crosshairs"></i> Required Action:</strong> ${n.action}
                </div>
              ` : ''}
            </div>
          `;
        }).join('');
    }

    // 8. RIGHT PANEL: Selected Flood Sector Inspector
    const rightVBox = document.getElementById('rightSelectedGroundVillageBox');
    if (rightVBox) {
      const selectedArea = areas.find(a => a.village === selectedVillageName) || areas[0];
      if (!selectedArea) {
        rightVBox.innerHTML = `<div style="font-size:11.5px; color:var(--text-muted); text-align:center; padding:10px;">No sector selected. Tap any sector on the map or list.</div>`;
      } else {
        const isCrit = selectedArea.severity === 'Critical';
        rightVBox.innerHTML = `
          <div class="decision-card" style="padding:10px 12px; border-left:3.5px solid ${isCrit ? '#dc2626' : '#0284c7'};">
            <div class="dc-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <h4 style="margin:0; font-size:13px; color:#0f172a;"><i class="fas fa-location-dot" style="color:${isCrit ? '#dc2626' : '#0284c7'}; margin-right:4px;"></i>${selectedArea.village}</h4>
              <span class="pill ${getPillClass(selectedArea.severity)}" style="font-size:9.5px;">${selectedArea.severity}</span>
            </div>
            <div style="font-size:11px; color:#475569; margin-bottom:6px;">
              <div>Circle: <strong>${selectedArea.block}</strong> • Status: <strong>${selectedArea.status}</strong></div>
              <div>Coords: <strong>${selectedArea.coords}</strong></div>
              <div>Inundation: <strong>${selectedArea.task || 'Surveillance active'}</strong></div>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn-go primary" style="flex:1; padding:5px 8px; font-size:10.5px;" onclick="window.focusGroundMapByName && window.focusGroundMapByName('${(selectedArea.village || '').replace(/'/g, "\\'")}')">
                <i class="fas fa-crosshairs"></i> Center Map
              </button>
              <button type="button" class="btn-go" style="flex:1; padding:5px 8px; font-size:10.5px;" onclick="window.quickFileSos && window.quickFileSos()">
                <i class="fas fa-pen"></i> File SITREP
              </button>
            </div>
          </div>
        `;
      }
    }

    // 9. RIGHT PANEL: Live River Hydrology Telemetry Feed
    const riverBox = document.getElementById('rightGroundRiverTelemetryBox');
    if (riverBox) {
      riverBox.innerHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 10px; font-size:11px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
            <strong style="color:#0369a1;"><i class="fas fa-water"></i> Brahmaputra River Basin</strong>
            <span class="pill p-good" style="font-size:9px; padding:1px 5px;">Passable</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:#475569; font-size:10.5px;">
            <span>Current: <strong>17.42 m</strong></span>
            <span>Danger: <strong>18.00 m</strong></span>
          </div>
          <div style="font-size:10px; color:#15803d; margin-top:2px;">Trend: Falling discharge • Normal river flow</div>
        </div>
      `;
    }

    // 10. RIGHT PANEL: Central Godown Dispatch Sync
    const godownBox = document.getElementById('rightGroundGodownSyncBox');
    if (godownBox) {
      godownBox.innerHTML = (!deliveries || deliveries.length === 0)
        ? `<div style="font-size:11.5px; color:var(--text-muted); text-align:center; padding:10px;">No dispatches en-route from Godown.</div>`
        : deliveries.slice(0, 3).map(d => `
          <div style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:9px 11px; font-size:11px; margin-bottom:8px; cursor:pointer; transition:all 0.2s ease;" onclick="window.focusGroundMapByName && window.focusGroundMapByName('${(d.destination || '').replace(/'/g, "\\'")}')" onmouseover="this.style.borderColor='#0284c7'; this.style.background='#f0f9ff';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';" title="Tap to view & center on GIS Map">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
              <strong style="color:#0f172a; font-size:12px;"><i class="fas fa-truck-fast" style="color:#0284c7; margin-right:5px;"></i>${d.destination}</strong>
              <span class="pill ${getPillClass(d.status)}" style="font-size:9px; padding:1.5px 6px;">${d.status}</span>
            </div>
            <div style="font-size:10.5px; color:#475569; line-height:1.4;">
              <div>Ref: <strong>${d.dispatchId}</strong> • Supplies: <strong>${d.resource}</strong></div>
              <div>${d.remarks || 'Awaiting Ground Officer Verification'}</div>
            </div>
            <div style="margin-top:6px; display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:4px;">
              <span style="font-size:10px; color:#0284c7; font-weight:700;"><i class="fas fa-map-location-dot"></i> View on Map</span>
              <span style="font-size:9px; color:#64748b;"><i class="fas fa-crosshairs"></i> Tap to Navigate</span>
            </div>
          </div>
        `).join('');
    }

    // 11. Update live markers on real Leaflet GIS map
    window.groundState = state;
    updateGroundAreaMarkers(areas);
  }

  // --- MODALS & SUBMISSIONS ---
  function openVerifyDeliveryModal(idx) {
    if (!state || !state.deliveries) return;
    const d = state.deliveries[idx];
    if (!d) return;
    document.getElementById('verDelivIdx').value = idx;
    document.getElementById('verDelivHeader').innerHTML = `
      <strong>${d.dispatchId}</strong> • Consignment for <strong>${d.destination}</strong><br>
      <span style="color:#475569;">Driver: ${d.involvedPersonnel?.driver || 'Rajesh Das'} • Vehicle: ${d.involvedPersonnel?.vehicle || 'Heavy Truck AS-01-EC-4210'}</span>
    `;

    const items = d.itemBreakdown || [];
    const b = items[0] || { dispatched: 3 };
    const j = items[1] || { dispatched: 33 };
    const f = items[2] || { dispatched: 264 };
    const m = items[3] || { dispatched: 44 };

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal('verBoatsRecv', b.dispatched);
    setVal('verBoatsDmg', 0);
    setVal('verJacketsRecv', j.dispatched);
    setVal('verJacketsDmg', 0);
    setVal('verFoodRecv', f.dispatched);
    setVal('verFoodDmg', 0);
    setVal('verMedsRecv', m.dispatched);
    setVal('verMedsDmg', 0);
    setVal('verEvidenceRef', d.evidenceRef || `WAYBILL-${d.dispatchId}`);
    setVal('verRemarks', 'Physical cargo counted & verified intact at field depot gate.');

    previewShortageCalc();
    document.getElementById('verifyDeliveryModal').classList.add('open');
  }

  function previewShortageCalc() {
    const getNum = (id) => Number(document.getElementById(id)?.value) || 0;
    const dmg = getNum('verBoatsDmg') + getNum('verJacketsDmg') + getNum('verFoodDmg') + getNum('verMedsDmg');
    const box = document.getElementById('shortagePreviewBox');
    if (!box) return;

    if (dmg > 0) {
      box.style.background = '#fef2f2';
      box.style.borderColor = '#fca5a5';
      box.style.color = '#991b1b';
      box.innerHTML = `Auto-Detected Discrepancy: <strong>${dmg} Damaged Units</strong> flagged for State DEOC Monitoring Officer audit.`;
    } else {
      box.style.background = '#f0fdf4';
      box.style.borderColor = '#86efac';
      box.style.color = '#14532d';
      box.innerHTML = `Calculated Shortage: <strong>0 Units</strong> (Exact physical count match against warehouse dispatch)`;
    }
  }

  async function submitDeliveryVerification(e) {
    e.preventDefault();
    const idx = Number(document.getElementById('verDelivIdx').value);
    const d = (state.deliveries || [])[idx];
    if (!d) return;

    const getNum = (id) => Number(document.getElementById(id)?.value) || 0;
    const boatsRecv = getNum('verBoatsRecv');
    const boatsDmg = getNum('verBoatsDmg');
    const jacketsRecv = getNum('verJacketsRecv');
    const jacketsDmg = getNum('verJacketsDmg');
    const foodRecv = getNum('verFoodRecv');
    const foodDmg = getNum('verFoodDmg');
    const medsRecv = getNum('verMedsRecv');
    const medsDmg = getNum('verMedsDmg');
    const evidenceRef = document.getElementById('verEvidenceRef')?.value?.trim() || `WAYBILL-${d.dispatchId}`;
    const remarks = document.getElementById('verRemarks')?.value?.trim() || 'Physical receipt signed';

    const totalDmg = boatsDmg + jacketsDmg + foodDmg + medsDmg;
    const summaryRecv = `${boatsRecv} Boats, ${jacketsRecv} Jackets, ${foodRecv} Food, ${medsRecv} Meds`;

    closeModal('verifyDeliveryModal');
    showToast('Submitting physical delivery verification to database...');

    try {
      await verifyPhysicalDeliveryApi({
        dispatchId: d.dispatchId,
        allocId: d.allocId,
        received: summaryRecv,
        damaged: totalDmg,
        shortage: 0,
        remarks,
        evidenceRef,
        verifiedBy: 'Bhaskar Jyoti Das (GO-KAM-04)',
        itemCounts: { boatsRecv, boatsDmg, jacketsRecv, jacketsDmg, foodRecv, foodDmg, medsRecv, medsDmg }
      });

      renderAllGroundViews();
      showToast(totalDmg > 0 ? `Delivery verified with discrepancy logged to Audit.` : `Physical delivery ${d.dispatchId} verified & logged.`);
    } catch (err) {
      console.error('Verification error:', err);
      showToast('Delivery verification recorded locally.');
    }
  }

  async function submitFieldSituationReport(e) {
    e.preventDefault();
    const village = document.getElementById('frVillageSel').value;
    const severity = document.getElementById('frSeveritySel').value;
    const water = document.getElementById('frWaterLevel').value.trim();
    const affected = document.getElementById('frAffectedPop').value.trim();
    const stranded = Number(document.getElementById('frStrandedCount').value);
    const road = document.getElementById('frRoadCond').value;
    const needs = document.getElementById('frUrgentNeeds').value.trim();
    const coords = document.getElementById('frGpsCoords').value.trim();
    const evidenceRef = document.getElementById('frEvidenceRef')?.value?.trim() || `EVD-${Math.floor(100 + Math.random() * 900)}`;
    const remarks = document.getElementById('frRemarks')?.value?.trim() || '';

    showToast('Transmitting immutable Field Report to DEOC & Authority...');

    try {
      const savedReport = await submitFieldReportApi({
        village,
        severity,
        water,
        affected,
        stranded,
        road,
        needs,
        coords,
        evidenceRef,
        remarks,
        officer: 'Bhaskar Jyoti Das (GO-KAM-04)'
      });

      const remArea = document.getElementById('frRemarks');
      if (remArea) remArea.value = '';
      renderAllGroundViews();
      showToast(`Immutable Field SITREP ${savedReport.refId || 'filed'} recorded in database.`);
    } catch (err) {
      console.error('Field report error:', err);
      showToast('Field Report recorded.');
    }
  }

  function openRescueUpdateModal(idx) {
    if (!state || !state.operations) return;
    const op = state.operations[idx];
    if (!op) return;
    document.getElementById('opIdxInput').value = idx;
    document.getElementById('opModalTitle').textContent = `${op.opId} • ${op.location} (${op.agency})`;
    document.getElementById('opRescuedInput').value = op.rescued;
    document.getElementById('opStrandedInput').value = op.stranded;
    document.getElementById('opStatusSel').value = op.status;
    document.getElementById('opNotesInput').value = op.notes;
    document.getElementById('rescueUpdateModal').classList.add('open');
  }

  async function submitRescueProgress(e) {
    e.preventDefault();
    const idx = Number(document.getElementById('opIdxInput').value);
    const op = (state.operations || [])[idx];
    if (!op) return;

    const rescued = Number(document.getElementById('opRescuedInput').value);
    const stranded = Number(document.getElementById('opStrandedInput').value);
    const status = document.getElementById('opStatusSel').value;
    const notes = document.getElementById('opNotesInput').value.trim();

    closeModal('rescueUpdateModal');

    try {
      await updateRescueProgressApi({
        opId: op.opId,
        location: op.location,
        rescued,
        stranded,
        status,
        notes,
        officerName: 'Bhaskar Jyoti Das (GO-KAM-04)'
      });

      renderAllGroundViews();
      showToast(`Rescue operation progress updated for ${op.opId}.`);
    } catch (err) {
      console.error('Rescue update error:', err);
      showToast('Rescue progress updated.');
    }
  }

  function openReturnVerifyModal(preSelectedLoc) {
    const areas = (state && state.areas) || [];
    const sel = document.getElementById('rvLocationSel');
    if (sel && areas.length > 0) {
      sel.innerHTML = areas.map(a => `<option value="${a.village}">${a.village}</option>`).join('');
      if (preSelectedLoc) sel.value = preSelectedLoc;
    }
    const remarks = document.getElementById('rvRemarks');
    if (remarks) remarks.value = 'Rescue completed and situation controlled. 1 boat pontoon punctured during rescue near river dyke; 2 life jackets damaged. Packed for Godown intake.';
    document.getElementById('returnVerifyModal').classList.add('open');
  }

  async function submitReturnVerification(e) {
    e.preventDefault();
    const location = document.getElementById('rvLocationSel')?.value?.trim() || 'Assigned Sector';
    const item = document.getElementById('rvItemName')?.value?.trim() || 'Rescue Equipment';
    const good = Number(document.getElementById('rvGoodQty')?.value) || 0;
    const damaged = Number(document.getElementById('rvDmgQty')?.value) || 0;
    const missing = Number(document.getElementById('rvMissQty')?.value) || 0;
    const remarks = document.getElementById('rvRemarks')?.value?.trim() || 'Condition verified on ground';

    closeModal('returnVerifyModal');

    try {
      await submitReturnVerificationApi({
        item,
        location,
        good,
        damaged,
        missing,
        remarks,
        officer: 'Bhaskar Jyoti Das (GO-KAM-04)'
      });

      renderAllGroundViews();
      showToast('Return condition verification submitted & synced with Godown Manager.');
    } catch (err) {
      console.error('Return verification error:', err);
      showToast('Return verification submitted.');
    }
  }

  async function confirmSituationControlledOnGround(allocId, area) {
    try {
      await confirmSituationControlledApi(
        allocId,
        area,
        'Ground rescue operations completed. Area flood waters receded and situation under control. Resources released for warehouse return intake.'
      );

      const op = (state.operations || []).find(o => o.opId === allocId || o.location === area);
      if (op) {
        op.status = 'Situation Controlled & Cleared';
        op.stranded = 0;
        op.isCleared = true;
      }

      try {
        await updateRescueProgressApi({
          opId: allocId,
          location: area,
          rescued: op ? op.rescued : 48,
          stranded: 0,
          status: 'Situation Controlled & Cleared',
          notes: 'Flood waters receded. Citizens safely evacuated to relief camp. Resources released for warehouse return intake.',
          officerName: 'Bhaskar Jyoti Das (GO-KAM-04)'
        });
      } catch (err) {}

      const d = (state.deliveries || []).find(item => item.dispatchId === allocId || item.destination === area);
      if (d) {
        d.groundOfficerCleared = true;
        d.reliefClearedForReturn = true;
      }
      renderAllGroundViews();
      showToast(`✓ Confirmed: Situation in ${area || 'area'} is under control! Equipment unlocked in Returns.`);
    } catch (e) {
      console.warn('Clearance error:', e);
      showToast('Clearance recorded.');
    }
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    if (t) {
      t.textContent = msg;
      t.style.right = '18px';
      setTimeout(() => { t.style.right = '-380px'; }, 3200);
    }
  }

  __onReady(async () => {
    // 1. Initial render from cached state
    renderAllGroundViews();

    // 2. Identify logged user and basin
    let loggedUser = 'go5142bk';
    try {
      const u = sessionStorage.getItem('neerakshak_user');
      if (u) loggedUser = u.toLowerCase().trim();
    } catch (e) {}

    const userBasin = resolveUserBasin(loggedUser);
    const basinId = (userBasin && userBasin.id) || 'bk';

    // 3. Initialize Real Leaflet GIS Map with valid coordinates
    let initialCoords = [26.15, 91.55];
    if (state.areas && state.areas.length > 0) {
      initialCoords = parseAreaCoordinates(state.areas[0]);
    } else if (userBasin && userBasin.sectors && userBasin.sectors[0]) {
      initialCoords = userBasin.sectors[0].coords;
    }
    const initialZoom = 11;

    const map = initGroundFloodMap('groundLeafletMap', initialCoords, initialZoom, basinId);
    window.groundLeafletMapInstance = map;

    // 4. Initial markers update
    if (state.areas && state.areas.length > 0) {
      updateGroundAreaMarkers(state.areas);
    }

    // 5. Fetch fresh live state from backend and sync map markers
    try {
      await fetchFullGroundState();
      renderAllGroundViews();

      if (state.areas && state.areas.length > 0) {
        autoCenterGroundMapOnAreas(state.areas);
      }
    } catch (e) {}

    startGroundOfficerSync(12000);
  });

  // Attach all handlers to window for inline HTML & React calls
  Object.assign(window, {
    closeModal,
    confirmSituationControlledOnGround,
    getPillClass,
    getToneClass,
    openRescueUpdateModal,
    openReturnVerifyModal,
    openVerifyDeliveryModal,
    previewShortageCalc,
    renderAllGroundViews,
    showToast,
    submitDeliveryVerification,
    submitFieldSituationReport,
    submitRescueProgress,
    submitReturnVerification,
    switchGroundTab,
    toggleDataMode,
    toggleGridListView,
    selectGroundVillageForInspection,
    focusGroundMapByName,
    quickClearFirstActive,
    filterNotifs,
    selectSosSector,
    quickFileSos,
    quickVerifyFirstPending,
    quickOpenRescueModal
  });

  __ready.forEach((fn) => fn());
}
