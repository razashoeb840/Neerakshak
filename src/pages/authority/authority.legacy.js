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
      if (tabKey === 'area-details' || tabKey === 'allocation') {
        tabKey = 'dashboard';
        const panel = document.getElementById('areaDetailsPanel');
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

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

    const panel = document.getElementById('areaDetailsPanel');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      panel.style.boxShadow = '0 0 0 3px #38bdf8';
      setTimeout(() => { panel.style.boxShadow = ''; }, 1400);
    }

    const v = (state.villages || []).find(item => item.id === villageId);
    if (v && v.lat && v.lng && window.authorityLeafletMapInstance) {
      window.authorityLeafletMapInstance.setView([Number(v.lat), Number(v.lng)], 13, { animate: true });
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

      // 2. Village Cards Helper (with Embedded 4-Resource Number Allocation & Deduplication)
      // Sort villages: Recent & Critical First
      const severityRank = { 'Critical': 4, 'High': 3, 'Moderate': 2, 'Normal': 1 };
      const sortedVillages = [...villages].sort((a, b) => {
        const isDangerA = String(a.waterStatus || '').toLowerCase().includes('above danger') ||
                          String(a.waterStatus || '').toLowerCase().includes('overflow') ||
                          String(a.waterStatus || '').toLowerCase().includes('breach') ||
                          a.severity === 'Critical';
        const isDangerB = String(b.waterStatus || '').toLowerCase().includes('above danger') ||
                          String(b.waterStatus || '').toLowerCase().includes('overflow') ||
                          String(b.waterStatus || '').toLowerCase().includes('breach') ||
                          b.severity === 'Critical';

        if (isDangerA && !isDangerB) return -1;
        if (!isDangerA && isDangerB) return 1;

        const rankA = severityRank[a.severity] || 0;
        const rankB = severityRank[b.severity] || 0;
        if (rankA !== rankB) return rankB - rankA;

        // Numeric timestamp in ID if created via Admin (area-1795...)
        const timeA = String(a.id || '').startsWith('area-') ? Number(a.id.replace('area-', '')) : 0;
        const timeB = String(b.id || '').startsWith('area-') ? Number(b.id.replace('area-', '')) : 0;
        if (timeA !== timeB) return timeB - timeA;

        return String(b.id || '').localeCompare(String(a.id || ''));
      });

      if (!selectedVillageId || !sortedVillages.find(v => v.id === selectedVillageId)) {
        selectedVillageId = sortedVillages[0]?.id;
      }

      const renderVillageCards = (list) => {
        if (!list || list.length === 0) {
          return `<div style="grid-column:1/-1; text-align:center; padding:18px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);">No flood-affected villages loaded from Admin telemetry.</div>`;
        }
        return list.map(v => {
          const boats = (v.assessedNeed && v.assessedNeed.boats) !== undefined ? v.assessedNeed.boats : 2;
          const jackets = (v.assessedNeed && v.assessedNeed.jackets) !== undefined ? v.assessedNeed.jackets : 30;
          const food = (v.assessedNeed && v.assessedNeed.food) !== undefined ? v.assessedNeed.food : 300;
          const meds = (v.assessedNeed && v.assessedNeed.meds) !== undefined ? v.assessedNeed.meds : 50;

          // Check if this village already has an allocation in state
          const vClean = String(v.name || '').trim().toLowerCase();
          const existingAlloc = (allocations || []).find(a => a.village && a.village.trim().toLowerCase() === vClean);
          const isAllocated = !!existingAlloc;
          const isVOver = String(v.waterStatus || '').toLowerCase().includes('above danger') ||
                          String(v.waterStatus || '').toLowerCase().includes('overflow') ||
                          String(v.waterStatus || '').toLowerCase().includes('breach') ||
                          v.severity === 'Critical';

          return `
            <div class="decision-card" style="${v.id === selectedVillageId ? 'border-color:#0284c7; background:#ffffff; box-shadow:0 4px 14px rgba(2,132,199,0.15);' : ''}">
              <div class="dc-top">
                <div>
                  <h4>${v.name}</h4>
                  <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${v.block || 'Revenue Circle'}</span>
                </div>
                <div style="display:flex; gap:5px; align-items:center;">
                  ${isVOver ? `<span class="status-pill st-critical" style="font-size:9.5px; padding:2px 7px;"><i class="fas fa-triangle-exclamation"></i> ABOVE DANGER</span>` : ''}
                  ${isAllocated ? `<span class="status-pill st-normal" style="font-size:9.5px; padding:2px 7px;"><i class="fas fa-check"></i> ${existingAlloc.id} Allocated</span>` : ''}
                  <span class="status-pill ${getSevPill(v.severity)}">${v.severity}</span>
                </div>
              </div>
              <div class="dc-meta-box">
                <span>Affected Pop: <strong>${(v.pop || 0).toLocaleString()}</strong></span>
                <span>Hydrology: <strong style="${isVOver ? 'color:#dc2626; font-weight:800;' : ''}">${v.waterStatus ? v.waterStatus.split(' (')[0] : 'Monitoring'}</strong></span>
                ${isAllocated ? `<span>Allocated: <strong style="color:#0369a1;">${existingAlloc.summary || 'Emergency Relief'}</strong></span>` : ''}
              </div>

              <div class="dc-actions" style="margin-top:8px;">
                <button type="button" class="btn-card-action" onclick="window.selectVillageForAssessment('${v.id}', true)">
                  <i class="fas fa-crosshairs"></i> Tap to Assess on Map
                </button>
                ${isAllocated ? `
                  <button type="button" class="btn-card-action" style="background:#f0fdf4; color:#15803d; border-color:#86efac; font-weight:700;" onclick="window.switchAuthTab('tracking'); window.openTrackingDetail('${existingAlloc.id}');">
                    <i class="fas fa-check-circle"></i> Allocated (${existingAlloc.id}) • Track →
                  </button>
                  <button type="button" class="btn-card-action" style="padding:4px 8px; font-size:11px;" title="Inspect & Update in Calculator" onclick="window.selectVillageForAssessment('${v.id}', false); document.getElementById('areaDetailsPanel')?.scrollIntoView({behavior:'smooth'});">
                    <i class="fas fa-pen"></i> Update
                  </button>
                ` : `
                  <button type="button" class="btn-card-action approve" onclick="window.selectVillageForAssessment('${v.id}', false); document.getElementById('areaDetailsPanel')?.scrollIntoView({behavior:'smooth'});">
                    <i class="fas fa-calculator"></i> Assess & Allocate
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('');
      };

      const dashCritGrid = document.getElementById('dashCriticalVillagesGrid');
      if (dashCritGrid) {
        dashCritGrid.innerHTML = renderVillageCards(
          sortedVillages.filter(v => v.severity === 'Critical' || v.severity === 'High')
        );
      }

      const mapSev = document.getElementById('mapSevSelect')?.value || 'ALL';
      const fullCritGrid = document.getElementById('fullCriticalAreasGrid');
      if (fullCritGrid) {
        fullCritGrid.innerHTML = renderVillageCards(
          sortedVillages.filter(v => mapSev === 'ALL' || v.severity === mapSev)
        );
      }

      // 3. Integrated Area Details & Resource Assessment Calculator (4th Image - Assess View)
      const selectedV = sortedVillages.find(v => v.id === selectedVillageId) || sortedVillages[0];
      const areaBox = document.getElementById('areaDetailsPanel');
      if (areaBox) {
        if (!selectedV) {
          areaBox.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-muted);">Select or tap any affected village on the Flood Map to calculate and allocate required emergency supplies.</div>`;
        } else {
          const b = (selectedV.assessedNeed && selectedV.assessedNeed.boats) !== undefined ? selectedV.assessedNeed.boats : 2;
          const j = (selectedV.assessedNeed && selectedV.assessedNeed.jackets) !== undefined ? selectedV.assessedNeed.jackets : 30;
          const f = (selectedV.assessedNeed && selectedV.assessedNeed.food) !== undefined ? selectedV.assessedNeed.food : 300;
          const m = (selectedV.assessedNeed && selectedV.assessedNeed.meds) !== undefined ? selectedV.assessedNeed.meds : 50;

          const isAboveDanger = String(selectedV.waterStatus || '').toLowerCase().includes('above danger') ||
                                String(selectedV.waterStatus || '').toLowerCase().includes('overflow') ||
                                String(selectedV.waterStatus || '').toLowerCase().includes('breach') ||
                                selectedV.severity === 'Critical';

          const vClean = String(selectedV.name || '').trim().toLowerCase();
          const existingAlloc = (allocations || []).find(a => a.village && a.village.trim().toLowerCase() === vClean);

          areaBox.innerHTML = `
            <div class="card-head">
              <h2><i class="fas fa-house-flood-water" style="color: var(--river-blue);"></i> Selected Area Assessment & Direct Godown Allocation – ${selectedV.name}</h2>
              <div style="display:flex; gap:6px; align-items:center;">
                ${isAboveDanger ? `<span class="status-pill st-critical" style="font-size:10.5px; padding:3px 9px;"><i class="fas fa-triangle-exclamation"></i> ABOVE DANGER MARK</span>` : ''}
                <span class="status-pill ${getSevPill(selectedV.severity)}">${selectedV.severity} Severity</span>
              </div>
            </div>

            ${isAboveDanger ? `
              <div style="background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; padding:10px 14px; border-radius:8px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:12px; color:#991b1b; font-weight:700;">
                  <i class="fas fa-triangle-exclamation" style="margin-right:6px; color:#dc2626;"></i>
                  CRITICAL HYDROLOGY ALERT: River waterlevel exceeds danger threshold! Immediate emergency priority allocation required.
                </div>
                <span class="status-pill st-critical" style="font-size:10px; padding:3px 8px;">DANGER THRESHOLD EXCEEDED</span>
              </div>
            ` : ''}

            <div class="cards-grid-3" style="margin-bottom:12px;">
              <div class="decision-card">
                <span>Revenue Circle / District</span>
                <strong>${selectedV.block || 'District Sector'}</strong>
              </div>
              <div class="decision-card">
                <span>Affected Citizens</span>
                <strong>${(selectedV.pop || 0).toLocaleString()} Pop.</strong>
              </div>
              <div class="decision-card" style="${isAboveDanger ? 'border:1.5px solid #dc2626; background:#fff5f5;' : ''}">
                <span style="${isAboveDanger ? 'color:#dc2626; font-weight:700;' : ''}">
                  <i class="fas ${isAboveDanger ? 'fa-triangle-exclamation' : 'fa-water'}"></i> River Hydrological Status
                </span>
                <strong style="${isAboveDanger ? 'color:#b91c1c; font-size:12.5px;' : ''}">
                  ${isAboveDanger ? `<span style="background:#dc2626; color:#fff; font-size:9px; padding:2px 5px; border-radius:4px; margin-right:4px;">ABOVE DANGER</span>` : ''}
                  ${selectedV.waterStatus || 'River gauge elevated'}
                </strong>
              </div>
            </div>

            <div style="background:#f4fafe; border:1.5px solid #bde0f7; border-radius:12px; padding:14px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <strong style="font-size:13px; color:var(--navy-deep);"><i class="fas fa-calculator" style="color:var(--river-blue); margin-right:6px;"></i> Emergency Relief Supply Calculator:</strong>
                <span style="font-size:11px; color:var(--text-muted);">Adjust quantities below and transmit directly to Central Godown</span>
              </div>
              <div class="assessment-form-grid" style="margin-top:10px;">
                <div class="res-qty-card"><label><i class="fas fa-sailboat" style="color:#0284c7;"></i> Rescue Boats</label><input type="number" id="assessBoats" value="${b}" min="0" /></div>
                <div class="res-qty-card"><label><i class="fas fa-vest-patches" style="color:#f97316;"></i> Life Jackets</label><input type="number" id="assessJackets" value="${j}" min="0" /></div>
                <div class="res-qty-card"><label><i class="fas fa-box-open" style="color:#16a34a;"></i> Food Packets</label><input type="number" id="assessFood" value="${f}" min="0" /></div>
                <div class="res-qty-card"><label><i class="fas fa-kit-medical" style="color:#dc2626;"></i> Medicine Kits</label><input type="number" id="assessMeds" value="${m}" min="0" /></div>
              </div>
              <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <span style="font-size:11.5px; color:#0369a1;">
                  <i class="fas fa-paper-plane"></i>
                  ${existingAlloc ? `Allocation order <strong>${existingAlloc.id}</strong> active at Godown Manager. Any adjustments sync in real time.` : `Allocation order will immediately dispatch to Godown Manager & generate live tracking dossier.`}
                </span>
                <button type="button" class="btn-card-action approve" style="padding:9px 18px; font-size:12.5px;" onclick="window.confirmAssessedAllocation('${selectedV.name.replace(/'/g, "\\'")}')">
                  <i class="fas fa-paper-plane"></i> ${existingAlloc ? `Update & Transmit Allocation (${existingAlloc.id})` : `Approve & Send Allocation to Godown Manager`}
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

      // 5. Enhanced Interactive Godown Dispatch & Ground Delivery Tracking
      const trackGrid = document.getElementById('trackingGrid');
      if (trackGrid) {
        if (!allocations || allocations.length === 0) {
          trackGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);"><i class="fas fa-truck" style="font-size:24px; color:#94a3b8; margin-bottom:8px; display:block;"></i>No allocations dispatched to Godown Manager yet. Tap an area on the Flood Map to allocate.</div>`;
        } else {
          trackGrid.innerHTML = allocations.map(a => {
            const timeline = a.timeline || [];
            const latestStep = timeline.find(t => t.status === 'active' || t.status === 'in_progress') || timeline[timeline.length - 1] || { step: 'Dispatch in transit', time: 'Active' };
            const vehicleTag = a.vehicle ? a.vehicle.split(' (')[0] : 'Relief Truck';
            return `
              <div class="decision-card" style="cursor:pointer;" onclick="window.openTrackingDetail('${a.id}')">
                <div class="dc-top">
                  <div>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <h4>${a.id} • ${a.village}</h4>
                      <span class="transit-badge"><i class="fas fa-truck"></i> ${vehicleTag}</span>
                    </div>
                    <span style="font-size:11px; color:var(--text-muted); font-weight:600;">Depot: ${a.assignedGodown || 'Central Relief Godown – Mirza'}</span>
                  </div>
                  <span class="status-pill ${a.deliveryProgress >= 100 ? 'st-normal' : 'st-dispatched'}">${a.godownStatus || 'Sent to Godown'}</span>
                </div>
                <div class="dc-meta-box">
                  <span>Supplies: <strong>${a.summary}</strong></span>
                  <span>Driver: <strong>${a.driver || 'Rajesh Das (+91 98640-21943)'}</strong></span>
                </div>
                <div class="progress-track" style="margin:8px 0 4px;"><div class="progress-fill" style="width:${a.deliveryProgress || 35}%;"></div></div>
                <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted);">
                  <span><i class="fas fa-route"></i> Current Stage: <strong style="color:var(--river-blue);">${latestStep.step}</strong></span>
                  <span>Progress: <strong>${a.deliveryProgress || 35}%</strong></span>
                </div>
                <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:10.5px; color:#64748b;"><i class="fas fa-shield"></i> Escort: ${a.escortOfficer || 'District Police Escort'}</span>
                  <button type="button" class="btn-card-action" style="font-size:11px; padding:4px 10px;" onclick="event.stopPropagation(); window.openTrackingDetail('${a.id}')">
                    <i class="fas fa-timeline"></i> View Full Convoy Transit →
                  </button>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      // 6. Upgraded Multi-Agency NDRF / SDRF Tactical Coordination & SITREP
      const coordGrid = document.getElementById('coordRecordsGrid');
      if (coordGrid) {
        coordGrid.innerHTML = (!coordinations || coordinations.length === 0)
          ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No NDRF/SDRF coordination updates recorded.</div>`
          : coordinations.map(c => `
            <div class="decision-card">
              <div class="dc-top">
                <div>
                  <h4>${c.agency}</h4>
                  <span style="font-size:11px; color:var(--text-muted); font-weight:600;"><i class="fas fa-location-dot" style="color:#ef4444;"></i> Sector: ${c.sector}</span>
                </div>
                <span class="status-pill ${c.status === 'Mission Successful' ? 'st-normal' : (c.status === 'On Standby at Staging Area' ? 'st-moderate' : 'st-approved')}">${c.status || 'Active Deployment'}</span>
              </div>
              <div class="dc-meta-box">
                <span>Commander: <strong>${c.commander || 'Incident Commander'}</strong> (${c.designation || 'Lead'})</span>
                <span>Contact: <strong>${c.contact || 'VHF Ch-07'}</strong></span>
              </div>
              <div style="font-size:11px; color:var(--text-body); margin-top:4px;">
                Tactical Assets: <strong>${c.strength || 'Rescue Boats & Deep-Water Personnel'}</strong>
              </div>
              <div class="officer-call-box">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                  <strong style="color:var(--navy-deep); font-size:11px;"><i class="fas fa-headset" style="color:var(--river-blue);"></i> Official Radio / SITREP Log:</strong>
                  <span style="font-size:10px; color:#64748b; font-weight:700;">${c.timestamp || 'Live'}</span>
                </div>
                <p style="margin:0; font-size:11.5px; color:var(--text-body); line-height:1.45;">${c.callLog || c.update}</p>
              </div>
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
                <div>
                  <h4>${op.title}</h4>
                  ${op.officer ? `<span style="font-size:10.5px; color:var(--text-muted); font-weight:600;"><i class="fas fa-user-shield"></i> Lead: ${op.officer}</span>` : ''}
                </div>
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
                Inspect & Allocate on Map
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
            <div class="mini-status-tile" style="flex-direction:column; align-items:stretch; cursor:pointer;" onclick="window.switchAuthTab('tracking'); window.openTrackingDetail('${a.id}');">
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
  function openTrackingDetail(allocId) {
    const a = (state.allocations || []).find(item => item.id === allocId);
    if (!a) return;

    const heading = document.getElementById('trackModalHeading');
    if (heading) heading.innerHTML = `<i class="fas fa-truck-moving" style="color:var(--river-blue); margin-right:6px;"></i> ${a.id} • ${a.village}`;

    const sub = document.getElementById('trackModalSub');
    if (sub) sub.textContent = `Assigned Depot: ${a.assignedGodown || 'Central Relief Godown – Mirza'} | Status: ${a.godownStatus}`;

    const body = document.getElementById('trackModalBody');
    if (body) {
      const timeline = a.timeline && a.timeline.length ? a.timeline : [
        { step: 'DDMA Allocation Approved', time: '08:50 AM', status: 'done', detail: 'Allocation approved by Authority & transmitted to Godown.' },
        { step: 'Stock Verified & Staged', time: '09:20 AM', status: 'done', detail: 'Godown crew verified and loaded pallets.' },
        { step: 'Vehicle Dispatched', time: '09:45 AM', status: 'done', detail: 'Gatepass issued; vehicle departed with security escort.' },
        { step: 'Sector Transit & Checkpoint', time: '10:20 AM', status: 'active', detail: 'Crossed bypass bridge towards destination.' },
        { step: 'Camp Intake & Handover', time: '10:55 AM (ETA)', status: 'pending', detail: 'Relief camp receiving team verification.' }
      ];

      const timelineHtml = timeline.map(t => {
        const dotClass = t.status === 'done' || t.status === 'completed' ? 'done' : (t.status === 'active' || t.status === 'in_progress' ? 'active' : 'pending');
        return `
          <div class="track-step-item">
            <div class="track-step-dot ${dotClass}"></div>
            <div>
              <div style="display:flex; justify-content:space-between; align-items:baseline;">
                <strong style="font-size:12.5px; color:${dotClass === 'active' ? '#0284c7' : '#0f172a'};">${t.step}</strong>
                <span style="font-size:10.5px; font-weight:700; color:${dotClass === 'active' ? '#0284c7' : '#64748b'};">${t.time}</span>
              </div>
              <p style="margin:2px 0 0; font-size:11.5px; color:var(--text-muted); line-height:1.4;">${t.detail || ''}</p>
            </div>
          </div>
        `;
      }).join('');

      body.innerHTML = `
        <div class="cards-grid-3" style="margin-bottom:12px;">
          <div class="decision-card"><span>Vehicle Assigned</span><strong>${a.vehicle || 'Heavy Truck AS-01-EC-4210'}</strong></div>
          <div class="decision-card"><span>Driver & Contact</span><strong>${a.driver || 'Rajesh Das (+91 98640-21943)'}</strong></div>
          <div class="decision-card"><span>Police Escort</span><strong>${a.escortOfficer || 'ASI D. Kalita'}</strong></div>
        </div>
        <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:10px; padding:10px; margin-bottom:14px;">
          <strong style="font-size:12px; color:#0369a1;"><i class="fas fa-boxes-stacked"></i> Dispatched Emergency Supplies Manifest:</strong>
          <div style="margin-top:4px; font-size:12px; font-weight:600; color:var(--navy-deep);">${a.summary}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="font-size:13px; color:var(--navy-deep);"><i class="fas fa-route" style="color:var(--river-blue);"></i> Step-by-Step Dispatch Transit Timeline:</strong>
          <span style="font-size:11px; font-weight:700; color:var(--river-blue);">${a.deliveryProgress || 35}% Completed</span>
        </div>
        <div class="progress-track" style="margin-bottom:14px;"><div class="progress-fill" style="width:${a.deliveryProgress || 35}%;"></div></div>
        <div class="track-timeline">
          ${timelineHtml}
        </div>
      `;
    }

    const modal = document.getElementById('trackingDetailModal');
    if (modal) modal.classList.add('open');
  }

  function updateVillageResourceNeed(villageId, field, val) {
    const v = (state.villages || []).find(item => item.id === villageId);
    if (!v) return;
    if (!v.assessedNeed) v.assessedNeed = {};
    v.assessedNeed[field] = Math.max(0, Number(val) || 0);
  }

  async function allocateVillageFromCard(vId) {
    const v = (state.villages || []).find(item => item.id === vId);
    if (!v) return;

    const b = Number(document.getElementById(`cardBoats_${vId}`)?.value || v.assessedNeed?.boats || 0);
    const j = Number(document.getElementById(`cardJackets_${vId}`)?.value || v.assessedNeed?.jackets || 0);
    const f = Number(document.getElementById(`cardFood_${vId}`)?.value || v.assessedNeed?.food || 0);
    const m = Number(document.getElementById(`cardMeds_${vId}`)?.value || v.assessedNeed?.meds || 0);

    v.assessedNeed = { boats: b, jackets: j, food: f, meds: m };
    const summary = `${b} Boats, ${j} Jackets, ${f} Food, ${m} Meds`;

    const vClean = String(v.name || '').trim().toLowerCase();
    const existing = (state.allocations || []).find(a => a.village && a.village.trim().toLowerCase() === vClean);

    if (existing) {
      showToast(`Updating supplies for ${v.name} (${existing.id})...`);
    } else {
      showToast(`Transmitting direct allocation for ${v.name} to Godown Manager...`);
    }

    await allocateDirectResourcesApi(v.name, summary);
    renderAllAuthorityViews();

    if (existing) {
      showToast(`Allocation ${existing.id} updated & synced with Godown Manager.`);
    } else {
      showToast(`Approved supplies sent to Godown Manager for ${v.name}.`);
    }
  }

  async function quickSendVillageToGodown(vId) {
    return allocateVillageFromCard(vId);
  }

  async function confirmAssessedAllocation(villageName) {
    const b = Number(document.getElementById('assessBoats')?.value || 2);
    const j = Number(document.getElementById('assessJackets')?.value || 30);
    const f = Number(document.getElementById('assessFood')?.value || 300);
    const m = Number(document.getElementById('assessMeds')?.value || 50);
    const summary = `${b} Boats, ${j} Jackets, ${f} Food, ${m} Meds`;

    const vClean = String(villageName || '').trim().toLowerCase();
    const vObj = (state.villages || []).find(v => v.name && v.name.trim().toLowerCase() === vClean);
    if (vObj) {
      vObj.assessedNeed = { boats: b, jackets: j, food: f, meds: m };
    }

    const existing = (state.allocations || []).find(a => a.village && a.village.trim().toLowerCase() === vClean);

    showToast(`Forwarding assessed allocation to Godown Manager...`);
    await allocateDirectResourcesApi(villageName, summary);
    renderAllAuthorityViews();

    if (existing) {
      showToast(`Allocation ${existing.id} updated to (${summary}) for ${villageName}.`);
    } else {
      showToast(`Allocation for ${villageName} sent to Godown Manager.`);
    }
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
    const c = document.getElementById('coordCommander');
    if (c) c.value = '';
    const des = document.getElementById('coordDesignation');
    if (des) des.value = '';
    const con = document.getElementById('coordContact');
    if (con) con.value = '';
    const str = document.getElementById('coordStrength');
    if (str) str.value = '';
    const u = document.getElementById('coordUpdate');
    if (u) u.value = '';
    const modal = document.getElementById('coordModal');
    if (modal) modal.classList.add('open');
  }

  async function submitCoordRecord(e) {
    if (e && e.preventDefault) e.preventDefault();
    const agency = document.getElementById('coordAgency')?.value || 'NDRF (1st Battalion, Patgaon)';
    const sector = (document.getElementById('coordSector')?.value || '').trim() || 'Assigned District Sector';
    const commander = (document.getElementById('coordCommander')?.value || '').trim() || 'Incident Officer';
    const designation = (document.getElementById('coordDesignation')?.value || '').trim() || 'Unit Commander';
    const contact = (document.getElementById('coordContact')?.value || '').trim() || 'VHF Ch-07 / Radio';
    const status = document.getElementById('coordStatus')?.value || 'Deployed On Water';
    const strength = (document.getElementById('coordStrength')?.value || '').trim() || 'Deep-Water Rescue Personnel';
    const update = (document.getElementById('coordUpdate')?.value || '').trim() || 'Radio SITREP logged.';

    closeModal('coordModal');
    showToast(`Logging multi-agency update with ${agency}...`);
    await logCoordinationApi(agency, sector, update, commander, contact, strength, status);
    renderAllAuthorityViews();
    showToast(`Recorded official SITREP with ${commander} (${agency}).`);
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
      window.openTrackingDetail = openTrackingDetail;

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
    openTrackingDetail,
    quickSendVillageToGodown,
    allocateVillageFromCard,
    updateVillageResourceNeed,
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
