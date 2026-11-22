// NEERAKSHAK District Authority Portal – Real-Time & GIS Controller
// Connects DDMA assessment with Next.js Backend, Live River Telemetry, and Leaflet GIS Map

import {
  fetchFullAuthorityState,
  getCurrentAuthorityState,
  confirmRequestDecisionApi,
  allocateDirectResourcesApi,
  logCoordinationApi,
  saveOperationApi,
  startAuthorityRealtimeSync,
  stopAuthorityRealtimeSync,
  onAuthoritySync
} from './authorityApi.js';

import {
  initAuthorityFloodMap,
  renderAuthorityRivers,
  updateAuthorityVillageMarkers,
  filterAuthorityMapSeverity,
  searchAuthorityMap,
  authMapZoomIn,
  authMapZoomOut,
  authMapRecenter,
  flyToAuthoritySector
} from './authorityMap.js';

import {
  USER_BASIN_REGISTRY,
  resolveUserBasin
} from '../admin/indiaGisData.js';

import {
  fetchLiveRiverTelemetry
} from '../admin/adminApi.js';

export default function initAuthorityPage() {
  const __ready = [];
  const __onReady = (fn) => __ready.push(fn);

  /* =====================================================================
     AUTHORITY STATE & BACKEND INTEGRATION
     ===================================================================== */
  let state = getCurrentAuthorityState();
  window.authorityState = state;
  let isDrillMode = true;
  let selectedVillageId = state.villages && state.villages.length ? state.villages[0].id : null;

  function toggleDataMode() {
    isDrillMode = !isDrillMode;
    const btn = document.getElementById('dataModeBtn');
    const stText = document.getElementById('telemetryStatusText') || document.getElementById('headerStatusLabel');
    if (isDrillMode) {
      state = getCurrentAuthorityState();
      selectedVillageId = state.villages && state.villages.length ? state.villages[0].id : null;
      if (btn) btn.innerHTML = '<i class="fas fa-database"></i> Reference Drill';
      if (stText) stText.textContent = 'Command Active';
      showToast('Switched to live backend & telemetry dataset.');
    } else {
      state = {
        villages: [],
        requests: [],
        allocations: [],
        coordinations: [],
        operations: [],
        logs: []
      };
      selectedVillageId = null;
      if (btn) btn.innerHTML = '<i class="fas fa-plug"></i> Empty API State';
      if (stText) stText.textContent = 'Awaiting API Sync';
      showToast('Switched to Empty API State for mock drill.');
    }
    window.authorityState = state;
    renderAllAuthorityViews();
  }

  function switchAuthTab(tabKey, btnEl) {
    try {
      if (tabKey === 'approval') tabKey = 'requests';
      document.querySelectorAll('.auth-nav-btn').forEach(b => b.classList.remove('active'));
      if (btnEl) {
        btnEl.classList.add('active');
      } else {
        const found = document.querySelector(`[data-tab="${tabKey}"]`);
        if (found) found.classList.add('active');
      }

      document.querySelectorAll('.tab-view-pane').forEach(p => p.classList.remove('active'));
      const target = document.getElementById(`tab-${tabKey}`);
      if (target) target.classList.add('active');

      if (tabKey === 'dashboard') {
        setTimeout(() => {
          if (window.authorityLeafletMapInstance) {
            window.authorityLeafletMapInstance.invalidateSize();
          }
        }, 150);
      }
    } catch (e) {
      console.warn('switchAuthTab notice:', e);
    }
  }

  function getSevPill(val) {
    if (val === 'Critical' || val === 'Rejected') return 'st-critical';
    if (val === 'High') return 'st-high';
    if (val === 'Moderate' || val === 'Pending' || val === 'Ongoing') return 'st-moderate';
    if (val === 'Approved' || val === 'Completed' || val === 'Normal') return 'st-normal';
    return 'st-dispatched';
  }

  function selectVillageForAssessment(villageId, openDetailsTab = false) {
    selectedVillageId = villageId;
    renderAllAuthorityViews();
    if (openDetailsTab) {
      switchAuthTab('area-details', document.querySelector('[data-tab=area-details]'));
    }
  }

  /* =====================================================================
     RENDER ALL AUTHORITY VIEWS & SYNCHRONIZE UI
     ===================================================================== */
  function renderAllAuthorityViews() {
    try {
      const villages = state.villages || [];
      const requests = state.requests || [];
      const allocations = state.allocations || [];
      const coordinations = state.coordinations || [];
      const operations = state.operations || [];
      const logs = state.logs || [];

      const critHighCount = villages.filter(v => v.severity === 'Critical' || v.severity === 'High').length;
      const pendingReqs = requests.filter(r => r.status === 'Pending').length;

      // Update Header Badges
      const navCrit = document.getElementById('navCriticalBadge');
      if (navCrit) navCrit.textContent = critHighCount;
      const navReq = document.getElementById('navReqBadge');
      if (navReq) navReq.textContent = pendingReqs;
      const navTrack = document.getElementById('navTrackBadge');
      if (navTrack) navTrack.textContent = allocations.length;

      // 1. 4-KPI Overview Strip
      const kpis = [
        { val: isDrillMode ? critHighCount : '0', lbl: 'Critical & High Villages', icon: 'fa-triangle-exclamation', bg: '#fee2e2', color: '#dc2626' },
        { val: isDrillMode ? pendingReqs : '0', lbl: 'Pending Approvals', icon: 'fa-clipboard-check', bg: '#fef3c7', color: '#d97706' },
        { val: isDrillMode ? allocations.length : '0', lbl: 'Sent to Godown Manager', icon: 'fa-warehouse', bg: '#e0f2fe', color: '#0284c7' },
        { val: isDrillMode ? operations.length : '0', lbl: 'Active Rescue Operations', icon: 'fa-life-ring', bg: '#dcfce7', color: '#15803d' }
      ];

      const kpiGrid = document.getElementById('authorityKpiGrid');
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

      // 2. Village Cards Helper
      const renderVillageCards = (list) => {
        if (!list || list.length === 0) {
          return `<div style="grid-column:1/-1; text-align:center; padding:18px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);">No flood-affected villages loaded from Admin telemetry.</div>`;
        }
        return list.map(v => {
          const boats = (v.assessedNeed && v.assessedNeed.boats) || 2;
          const food = (v.assessedNeed && v.assessedNeed.food) || 300;
          return `
            <div class="decision-card" style="${v.id === selectedVillageId ? 'border-color:#0284c7; background:#ffffff; box-shadow:0 4px 14px rgba(2,132,199,0.15);' : ''}">
              <div class="dc-top">
                <div>
                  <h4>${v.name}</h4>
                  <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${v.block || 'Revenue Circle'}</span>
                </div>
                <span class="status-pill ${getSevPill(v.severity)}">${v.severity}</span>
              </div>
              <div class="dc-meta-box">
                <span>Affected Pop: <strong>${(v.pop || 0).toLocaleString()}</strong></span>
                <span>Need: <strong>${boats} Boats, ${food} Food</strong></span>
              </div>
              <p style="margin:0; font-size:11.5px; color:var(--text-body);">${v.waterStatus || 'Water level monitoring in progress'}</p>
              <div class="dc-actions">
                <button type="button" class="btn-card-action" onclick="window.selectVillageForAssessment('${v.id}', true)"><i class="fas fa-eye"></i> Area Details & Assess</button>
                <button type="button" class="btn-card-action approve" onclick="window.quickSendVillageToGodown('${v.id}')"><i class="fas fa-paper-plane"></i> Allocate to Godown</button>
              </div>
            </div>
          `;
        }).join('');
      };

      const dashCritGrid = document.getElementById('dashCriticalVillagesGrid');
      if (dashCritGrid) {
        dashCritGrid.innerHTML = renderVillageCards(
          villages.filter(v => v.severity === 'Critical' || v.severity === 'High')
        );
      }

      const mapSev = document.getElementById('mapSevSelect')?.value || 'ALL';
      const fullCritGrid = document.getElementById('fullCriticalAreasGrid');
      if (fullCritGrid) {
        fullCritGrid.innerHTML = renderVillageCards(
          villages.filter(v => mapSev === 'ALL' || v.severity === mapSev)
        );
      }

      // 3. Area Details & Resource Assessment Calculator
      const selectedV = villages.find(v => v.id === selectedVillageId) || villages[0];
      const areaBox = document.getElementById('areaDetailsPanel');
      if (areaBox) {
        if (!selectedV) {
          areaBox.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-muted);">Select an affected village to inspect population, severity, and resource requirements.</div>`;
        } else {
          const b = (selectedV.assessedNeed && selectedV.assessedNeed.boats) || 2;
          const j = (selectedV.assessedNeed && selectedV.assessedNeed.jackets) || 30;
          const f = (selectedV.assessedNeed && selectedV.assessedNeed.food) || 300;
          const m = (selectedV.assessedNeed && selectedV.assessedNeed.meds) || 50;

          areaBox.innerHTML = `
            <div class="card-head">
              <h2><i class="fas fa-house-flood-water" style="color: var(--river-blue);"></i> Area Details & Resource Assessment – ${selectedV.name}</h2>
              <span class="status-pill ${getSevPill(selectedV.severity)}">${selectedV.severity} Severity</span>
            </div>
            <div class="cards-grid-3" style="margin-bottom:12px;">
              <div class="decision-card"><span>Revenue Circle</span><strong>${selectedV.block || 'District Sector'}</strong></div>
              <div class="decision-card"><span>Affected Population</span><strong>${(selectedV.pop || 0).toLocaleString()} Citizens</strong></div>
              <div class="decision-card"><span>Hydrological Status</span><strong>${selectedV.waterStatus || 'River gauge elevated'}</strong></div>
            </div>
            <div style="background:#f4fafe; border:1.5px solid #bde0f7; border-radius:12px; padding:12px;">
              <strong style="font-size:13px; color:var(--navy-deep);"><i class="fas fa-calculator" style="color:var(--river-blue); margin-right:6px;"></i> Resource Assessment & Godown Dispatch Allocation</strong>
              <p style="margin:3px 0 10px; font-size:11.5px; color:var(--text-muted);">Adjust required quantities below and transmit approved allocation directly to the Godown Manager:</p>
              <div class="assessment-form-grid">
                <div class="res-qty-card"><label>Rescue Boats</label><input type="number" id="assessBoats" value="${b}" min="0" /></div>
                <div class="res-qty-card"><label>Life Jackets</label><input type="number" id="assessJackets" value="${j}" min="0" /></div>
                <div class="res-qty-card"><label>Food Packets</label><input type="number" id="assessFood" value="${f}" min="0" /></div>
                <div class="res-qty-card"><label>Medicine Kits</label><input type="number" id="assessMeds" value="${m}" min="0" /></div>
              </div>
              <div style="margin-top:12px; display:flex; justify-content:flex-end;">
                <button type="button" class="btn-card-action approve" style="padding:8px 16px; font-size:12px;" onclick="window.confirmAssessedAllocation('${selectedV.name.replace(/'/g, "\\'")}')">
                  <i class="fas fa-paper-plane"></i> Approve & Send Allocation to Godown Manager
                </button>
              </div>
            </div>
          `;
        }
      }

      // 4. Resource Requests & Approval Desk (Merged)
      const reqFilter = document.getElementById('requestStatusFilter')?.value || 'ALL';
      const indexedRequests = (requests || []).map((item, idx) => ({ ...item, idx }));
      const filteredRequests = indexedRequests.filter(r => reqFilter === 'ALL' || r.status === reqFilter);

      const renderMergedReqCards = (list) => {
        if (!list || list.length === 0) {
          return `<div style="grid-column:1/-1; text-align:center; padding:24px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);"><i class="fas fa-inbox" style="font-size:24px; color:#94a3b8; margin-bottom:8px; display:block;"></i>No resource requests found for this filter.</div>`;
        }
        return list.map(r => `
          <div class="decision-card">
            <div class="dc-top">
              <div>
                <h4>${r.id} • ${r.village}</h4>
                <span style="font-size:11px; color:var(--text-muted); font-weight:600;">From: ${r.from || 'Field Relief Officer'}</span>
              </div>
              <span class="status-pill ${getSevPill(r.status)}">${r.status}</span>
            </div>
            <div class="dc-meta-box">
              <span>Requested: <strong>${r.items}</strong></span>
              <span>Urgency: <strong>${r.urgency || 'High'}</strong></span>
            </div>
            <p style="margin:0; font-size:11.5px; color:var(--text-body);"><strong>Decision Note:</strong> ${r.reason || 'Pending verification'}</p>
            ${r.status === 'Pending' ? `
              <div class="dc-actions">
                <button type="button" class="btn-card-action approve" onclick="window.openDecisionModal(${r.idx}, 'Approved')"><i class="fas fa-check"></i> Approve & Send to Godown</button>
                <button type="button" class="btn-card-action reject" onclick="window.openDecisionModal(${r.idx}, 'Rejected')"><i class="fas fa-xmark"></i> Reject with Reason</button>
              </div>
            ` : `
              <div style="margin-top:8px; padding-top:6px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted);">
                <span>Status: <strong style="color:${r.status === 'Approved' ? '#16a34a' : '#dc2626'}">${r.status}</strong></span>
                <span><i class="fas fa-shield-halved"></i> DDMA Recorded</span>
              </div>
            `}
          </div>
        `).join('');
      };

      const allReqsGrid = document.getElementById('allRequestsGrid');
      if (allReqsGrid) allReqsGrid.innerHTML = renderMergedReqCards(filteredRequests);

      const appDeskGrid = document.getElementById('approvalDeskGrid');
      if (appDeskGrid) appDeskGrid.innerHTML = renderMergedReqCards(filteredRequests);

      // 5. Resource Allocation & Allocation Tracking
      const allocHtml = (!allocations || allocations.length === 0)
        ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No allocations dispatched to Godown Manager yet.</div>`
        : allocations.map(a => `
          <div class="decision-card">
            <div class="dc-top">
              <div>
                <h4>${a.id} • ${a.village}</h4>
                <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${a.summary}</span>
              </div>
              <span class="status-pill st-dispatched">${a.godownStatus || 'Sent to Godown'}</span>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${a.deliveryProgress || 35}%;"></div></div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted);">
              <span>Godown Coordination: <strong>Transmitted</strong></span>
              <span>Delivery Progress: <strong>${a.deliveryProgress || 35}%</strong></span>
            </div>
          </div>
        `).join('');

      const allocGrid = document.getElementById('allocatedVillagesGrid');
      if (allocGrid) allocGrid.innerHTML = allocHtml;

      const trackGrid = document.getElementById('trackingGrid');
      if (trackGrid) trackGrid.innerHTML = allocHtml;

      // 6. NDRF / SDRF Coordination
      const coordGrid = document.getElementById('coordRecordsGrid');
      if (coordGrid) {
        coordGrid.innerHTML = (!coordinations || coordinations.length === 0)
          ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No NDRF/SDRF coordination updates recorded.</div>`
          : coordinations.map(c => `
            <div class="decision-card">
              <div class="dc-top">
                <h4>${c.agency} • ${c.sector}</h4>
                <span class="status-pill st-approved">Official Channel</span>
              </div>
              <p style="margin:0; font-size:12px; color:var(--text-body);">${c.update}</p>
            </div>
          `).join('');
      }

      // 7. Operation Management
      const opsGrid = document.getElementById('operationsGrid');
      if (opsGrid) {
        opsGrid.innerHTML = (!operations || operations.length === 0)
          ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No operations recorded yet.</div>`
          : operations.map(op => `
            <div class="decision-card">
              <div class="dc-top">
                <h4>${op.title}</h4>
                <span class="status-pill ${getSevPill(op.status)}">${op.status}</span>
              </div>
              <p style="margin:0; font-size:12px; color:var(--text-body);">${op.summary}</p>
            </div>
          `).join('');
      }

      // 8. Reports & Activity Logs
      const reportBox = document.getElementById('reportSummaryCards');
      if (reportBox) {
        reportBox.innerHTML = `
          <div class="decision-card"><span>Villages Assessed</span><strong style="font-size:20px; color:var(--river-blue);">${villages.length}</strong></div>
          <div class="decision-card"><span>Approved Allocations</span><strong style="font-size:20px; color:var(--foliage-mid);">${allocations.length}</strong></div>
          <div class="decision-card"><span>Pending Requests</span><strong style="font-size:20px; color:#d97706;">${pendingReqs}</strong></div>
        `;
      }

      const auditBox = document.getElementById('auditLogsGrid');
      if (auditBox) {
        auditBox.innerHTML = (!logs || logs.length === 0)
          ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No activity logs recorded yet.</div>`
          : logs.map(l => `
            <div class="decision-card">
              <div class="dc-top"><strong>${l.actor}</strong><span style="font-size:11px; color:var(--text-muted);">${l.time}</span></div>
              <p style="margin:0; font-size:12px; color:var(--text-body);">${l.note}</p>
            </div>
          `).join('');
      }

      // 9. Right Panel Selected Village Inspector & Godown Sync
      const rightVBox = document.getElementById('rightSelectedVillageBox');
      if (rightVBox) {
        if (!selectedV) {
          rightVBox.innerHTML = `<div style="font-size:11.5px; color:var(--text-muted); text-align:center; padding:10px;">No village selected.</div>`;
        } else {
          const b = (selectedV.assessedNeed && selectedV.assessedNeed.boats) || 2;
          const f = (selectedV.assessedNeed && selectedV.assessedNeed.food) || 300;
          rightVBox.innerHTML = `
            <div class="decision-card" style="padding:10px 12px;">
              <div class="dc-top">
                <h4>${selectedV.name}</h4>
                <span class="status-pill ${getSevPill(selectedV.severity)}">${selectedV.severity}</span>
              </div>
              <div style="font-size:11px; color:var(--text-body);">
                Pop: <strong>${(selectedV.pop || 0).toLocaleString()}</strong> • Need: <strong>${b} Boats, ${f} Food</strong>
              </div>
              <button type="button" class="btn-card-action approve" style="justify-content:center; margin-top:8px;" onclick="window.selectVillageForAssessment('${selectedV.id}', true)">
                Open Area Details & Allocate
              </button>
            </div>
          `;
        }
      }

      const rightGodown = document.getElementById('rightGodownSyncBox');
      if (rightGodown) {
        rightGodown.innerHTML = (!allocations || allocations.length === 0)
          ? `<div style="font-size:11.5px; color:var(--text-muted); text-align:center; padding:10px;">No dispatches queued at Godown.</div>`
          : allocations.slice(0, 2).map(a => `
            <div class="mini-status-tile" style="flex-direction:column; align-items:stretch;">
              <div style="display:flex; justify-content:space-between;">
                <strong style="font-size:11.5px; color:var(--navy-deep);">${a.village}</strong>
                <span style="font-size:10.5px; font-weight:700; color:var(--river-blue);">${a.deliveryProgress || 35}%</span>
              </div>
              <div class="progress-track"><div class="progress-fill" style="width:${a.deliveryProgress || 35}%;"></div></div>
            </div>
          `).join('');
      }

      // Synchronize GIS Map Markers
      updateAuthorityVillageMarkers(villages);
    } catch (err) {
      console.error('renderAllAuthorityViews error:', err);
    }
  }

  /* =====================================================================
     ACTIONS & BACKEND SYNCHRONIZATION
     ===================================================================== */
  async function quickSendVillageToGodown(vId) {
    const v = (state.villages || []).find(item => item.id === vId);
    if (!v) return;
    const boats = (v.assessedNeed && v.assessedNeed.boats) || 2;
    const jackets = (v.assessedNeed && v.assessedNeed.jackets) || 30;
    const food = (v.assessedNeed && v.assessedNeed.food) || 300;
    const meds = (v.assessedNeed && v.assessedNeed.meds) || 50;
    const summary = `${boats} Boats, ${jackets} Jackets, ${food} Food, ${meds} Meds`;

    showToast(`Transmitting allocation for ${v.name} to Godown Manager...`);
    await allocateDirectResourcesApi(v.name, summary);
    renderAllAuthorityViews();
    showToast(`Approved resources sent to Godown Manager for ${v.name}.`);
  }

  async function confirmAssessedAllocation(villageName) {
    const b = document.getElementById('assessBoats')?.value || 2;
    const j = document.getElementById('assessJackets')?.value || 30;
    const f = document.getElementById('assessFood')?.value || 300;
    const m = document.getElementById('assessMeds')?.value || 50;
    const summary = `${b} Boats, ${j} Jackets, ${f} Food, ${m} Meds`;

    showToast(`Forwarding assessed allocation to Godown Manager...`);
    await allocateDirectResourcesApi(villageName, summary);
    renderAllAuthorityViews();
    showToast(`Allocation for ${villageName} sent to Godown Manager.`);
  }

  function openDecisionModal(idx, type) {
    const req = (state.requests || [])[idx];
    if (!req) return;
    const idxInput = document.getElementById('decReqIdx');
    if (idxInput) idxInput.value = idx;
    const typeInput = document.getElementById('decType');
    if (typeInput) typeInput.value = type;
    const heading = document.getElementById('decModalHeading');
    if (heading) heading.textContent = `${type === 'Approved' ? 'Approve' : 'Reject'} Request (${req.id})`;
    const summary = document.getElementById('decSummaryBox');
    if (summary) summary.innerHTML = `<strong>${req.village}</strong> — ${req.items}`;
    const reasonInput = document.getElementById('decReasonTxt');
    if (reasonInput) reasonInput.value = type === 'Approved' ? 'Approved per flood severity assessment; forwarded to Godown Manager.' : '';
    const btn = document.getElementById('decSubmitBtn');
    if (btn) {
      btn.textContent = `Confirm ${type}`;
      btn.style.background = type === 'Approved' ? '#16a34a' : '#dc2626';
    }
    const modal = document.getElementById('decisionModal');
    if (modal) modal.classList.add('open');
  }

  async function confirmRequestDecision(e) {
    if (e && e.preventDefault) e.preventDefault();
    const idx = Number(document.getElementById('decReqIdx')?.value || 0);
    const type = document.getElementById('decType')?.value || 'Approved';
    const reason = (document.getElementById('decReasonTxt')?.value || '').trim();

    closeModal('decisionModal');
    showToast(`Processing decision for Request...`);
    await confirmRequestDecisionApi(idx, type, reason);
    renderAllAuthorityViews();
    showToast(`Request marked as ${type} and synced with Godown.`);
  }

  function openDirectAllocModal() {
    const sel = document.getElementById('allocVillageSel');
    if (sel) {
      const villages = state.villages || [];
      sel.innerHTML = villages.length
        ? villages.map(v => `<option value="${v.name}">${v.name} (${v.severity})</option>`).join('')
        : `<option value="Palashbari Ward 2">Palashbari Ward 2</option>`;
    }
    const modal = document.getElementById('directAllocModal');
    if (modal) modal.classList.add('open');
  }

  async function submitDirectAllocation(e) {
    if (e && e.preventDefault) e.preventDefault();
    const village = document.getElementById('allocVillageSel')?.value || 'Sector Village';
    const b = document.getElementById('allocBoats')?.value || 0;
    const j = document.getElementById('allocJackets')?.value || 0;
    const f = document.getElementById('allocFood')?.value || 0;
    const m = document.getElementById('allocMeds')?.value || 0;
    const summary = `${b} Boats, ${j} Jackets, ${f} Food, ${m} Meds`;

    closeModal('directAllocModal');
    await allocateDirectResourcesApi(village, summary);
    renderAllAuthorityViews();
    showToast(`Allocation transmitted to Godown Manager for ${village}.`);
  }

  function openCoordModal() {
    const s = document.getElementById('coordSector');
    if (s) s.value = '';
    const u = document.getElementById('coordUpdate');
    if (u) u.value = '';
    const modal = document.getElementById('coordModal');
    if (modal) modal.classList.add('open');
  }

  async function submitCoordRecord(e) {
    if (e && e.preventDefault) e.preventDefault();
    const agency = document.getElementById('coordAgency')?.value || 'NDRF';
    const sector = (document.getElementById('coordSector')?.value || '').trim() || 'Assigned Sector';
    const update = (document.getElementById('coordUpdate')?.value || '').trim() || 'Coordinating relief deployment';

    closeModal('coordModal');
    await logCoordinationApi(agency, sector, update);
    renderAllAuthorityViews();
    showToast(`Recorded ${agency} coordination update.`);
  }

  function openOperationModal() {
    const t = document.getElementById('opTitle');
    if (t) t.value = '';
    const s = document.getElementById('opSummary');
    if (s) s.value = '';
    const modal = document.getElementById('opModal');
    if (modal) modal.classList.add('open');
  }

  async function submitOperationRecord(e) {
    if (e && e.preventDefault) e.preventDefault();
    const title = (document.getElementById('opTitle')?.value || '').trim() || 'Flood Evacuation Operation';
    const status = document.getElementById('opStatus')?.value || 'Ongoing';
    const summary = (document.getElementById('opSummary')?.value || '').trim() || 'Operation actively monitored by DDMA';

    closeModal('opModal');
    await saveOperationApi(title, status, summary);
    renderAllAuthorityViews();
    showToast(`Operation "${title}" logged.`);
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

  window.neerakshakLogout = function() {
    try {
      sessionStorage.clear();
      sessionStorage.setItem('neerakshak_logged_out', '1');
    } catch(e) {}
    window.location.href = '/login?logout=1';
  };

  /* =====================================================================
     INITIALIZATION & JURISDICTION SETUP
     ===================================================================== */
  __onReady(() => {
    try {
      // 1. Resolve logged-in officer basin and jurisdiction
      let loggedUser = 'au2381bk'; // Default Authority (Bihar Kosi Basin)
      try {
        const stored = sessionStorage.getItem('neerakshak_user');
        if (stored) loggedUser = stored;
      } catch (e) {}

      const userBasin = resolveUserBasin(loggedUser);
      window.activeAuthorityBasin = userBasin;

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
        basinBadge.textContent = `Authority • ${userBasin.shortName}`;
        basinBadge.title = `Officer ID: ${loggedUser} | Division: ${userBasin.tagline}`;
      }

      // 4. Initialize Leaflet Map centered on user's primary assigned sector
      const initialSector = (userBasin && userBasin.sectors && userBasin.sectors[0]) || { coords: [26.15, 91.60], zoom: 11, id: 'default' };
      const map = initAuthorityFloodMap('authorityLeafletMap', initialSector.coords, initialSector.zoom, userBasin ? userBasin.id : 'bk');
      window.authorityLeafletMapInstance = map;

      // 5. Setup Sector Switcher Handler
      window.switchAuthoritySector = function(sectorId) {
        if (!userBasin || !Array.isArray(userBasin.sectors)) return;
        const target = userBasin.sectors.find(s => s.id === sectorId);
        if (target) {
          flyToAuthoritySector(target.coords, target.zoom);
          showToast(`Map relocated to ${target.name} (${target.river})`);
        }
      };

      // 6. Map Navigation Controls
      window.authMapZoomIn = authMapZoomIn;
      window.authMapZoomOut = authMapZoomOut;
      window.authMapRecenter = authMapRecenter;
      window.filterAuthorityMapSeverity = filterAuthorityMapSeverity;
      window.searchAuthorityMap = searchAuthorityMap;

      // 7. Initial render from local state
      renderAllAuthorityViews();

      // 8. Fetch complete state from Next.js backend & re-render
      fetchFullAuthorityState().then(data => {
        if (data) {
          state = data;
          window.authorityState = state;
          renderAllAuthorityViews();
        }
      }).catch(err => console.warn('Authority state fetch notice:', err));

      // 9. Start continuous real-time sync with backend
      startAuthorityRealtimeSync(12000);
      onAuthoritySync((newState) => {
        state = newState;
        window.authorityState = state;
        renderAllAuthorityViews();
      });

      // 10. Fetch real-time river telemetry for the basin
      if (userBasin && userBasin.id) {
        fetchLiveRiverTelemetry(userBasin.id).then(live => {
          if (live && live.length > 0) {
            renderAuthorityRivers(userBasin.id);
          }
        }).catch(e => console.warn('Telemetry load notice:', e));
      }
    } catch (err) {
      console.error('initAuthorityPage initialization error:', err);
    }
  });

  // Assign global window handles for onclick events
  Object.assign(window, {
    closeModal,
    confirmAssessedAllocation,
    confirmRequestDecision,
    getSevPill,
    openCoordModal,
    openDecisionModal,
    openDirectAllocModal,
    openOperationModal,
    quickSendVillageToGodown,
    renderAllAuthorityViews,
    selectVillageForAssessment,
    showToast,
    submitCoordRecord,
    submitDirectAllocation,
    submitOperationRecord,
    switchAuthTab,
    toggleDataMode,
    authMapZoomIn,
    authMapZoomOut,
    authMapRecenter,
    filterAuthorityMapSeverity,
    searchAuthorityMap
  });

  __ready.forEach((fn) => fn());
}
