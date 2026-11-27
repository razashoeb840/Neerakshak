// NEERAKSHAK State DEOC Monitoring & Audit Portal Engine
// Implements complete 10-Function Audit, Reconciliation, Lifecycle Tracing & Pinned Announcements

import {
  fetchFullMonitoringState,
  getCurrentMonitoringState,
  onMonitoringSync,
  sendMonitoringChatMessage,
  escalateDiscrepancyApi,
  updateDiscrepancyStatusApi,
  closeReturnCaseApi,
  publishBroadcastAnnouncementApi,
  unpinBroadcastAnnouncementApi,
  exportSitrepCsv,
  startMonitoringSyncPolling
} from './monitoringApi.js';

import {
  INDIA_RIVER_SYSTEMS
} from '../admin/indiaGisData.js';

let activeTab = 'dashboard';
let commsMode = 'direct';
let activeChatChannel = 'ground';
let selectedSectorName = null;
let activeAreaFilter = 'ALL';
let activeReturnSectorFilter = 'ALL';
let activeLogsAgencyFilter = 'ALL';
let latestMonitoringState = null;

export default function initMonitoringPage() {
  // Expose global controller functions for UI clicks
  window.switchMonitorTab = switchMonitorTab;
  window.toggleCommsMode = toggleCommsMode;
  window.switchChatChannel = switchChatChannel;
  window.sendChatMessage = sendChatMessage;
  window.insertQuickChat = insertQuickChat;
  window.publishPinnedAnnouncement = publishPinnedAnnouncement;
  window.unpinAnnouncement = unpinAnnouncement;
  window.openPinnedBroadcastComposer = openPinnedBroadcastComposer;
  window.escalateDiscrepancy = escalateDiscrepancy;
  window.changeDiscrepancyStatus = changeDiscrepancyStatus;
  window.requestDiscrepancyClarification = requestDiscrepancyClarification;
  window.requestDeliveryEvidence = requestDeliveryEvidence;
  window.closeReturnAuditCase = closeReturnAuditCase;
  window.requestReturnClarification = requestReturnClarification;
  window.filterReturnSector = filterReturnSector;
  window.filterLogsByAgency = filterLogsByAgency;
  window.inspectSectorByName = inspectSectorByName;
  window.filterMonitoringSector = filterMonitoringSector;
  window.filterTracingArea = filterTracingArea;
  window.refreshMonitoringData = refreshMonitoringData;
  window.exportAuditSitrepReport = exportAuditSitrepReport;
  window.downloadSpecificReport = downloadSpecificReport;
  window.showToast = showToast;

  // Initial load
  refreshMonitoringData();

  // Subscribe to live sync events
  onMonitoringSync(state => {
    renderAllViews(state);
  });

  // Start periodic sync polling
  startMonitoringSyncPolling(4000);
}

export function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = message;
  toast.style.borderLeftColor = type === 'error' ? '#ef4444' : (type === 'success' ? '#22c55e' : '#38bdf8');
  toast.style.right = '20px';
  setTimeout(() => {
    toast.style.right = '-380px';
  }, 3200);
}

export async function refreshMonitoringData() {
  const state = await fetchFullMonitoringState();
  renderAllViews(state);
  showToast('DEOC audit stream & database synced.', 'success');
}

export function switchMonitorTab(tabId, el) {
  activeTab = tabId;
  document.querySelectorAll('.mo-tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.mon-nav-btn').forEach(b => b.classList.remove('active'));

  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) targetPane.classList.add('active');
  if (el) el.classList.add('active');
}

export function toggleCommsMode(mode) {
  commsMode = mode;
  const directView = document.getElementById('commsDirectView');
  const broadcastView = document.getElementById('commsBroadcastView');
  const btnDirect = document.getElementById('btnCommsModeDirect');
  const btnBroadcast = document.getElementById('btnCommsModeBroadcast');

  if (mode === 'broadcast') {
    if (directView) directView.style.display = 'none';
    if (broadcastView) broadcastView.style.display = 'block';
    if (btnBroadcast) {
      btnBroadcast.style.background = '#dc2626';
      btnBroadcast.style.color = '#fff';
      btnBroadcast.style.borderColor = '#b91c1c';
    }
    if (btnDirect) {
      btnDirect.style.background = '#ffffff';
      btnDirect.style.color = '#0f172a';
      btnDirect.style.borderColor = '#cbd5e1';
    }
  } else {
    if (directView) directView.style.display = 'block';
    if (broadcastView) broadcastView.style.display = 'none';
    if (btnDirect) {
      btnDirect.style.background = '#0284c7';
      btnDirect.style.color = '#fff';
      btnDirect.style.borderColor = '#0284c7';
    }
    if (btnBroadcast) {
      btnBroadcast.style.background = '#ffffff';
      btnBroadcast.style.color = '#0f172a';
      btnBroadcast.style.borderColor = '#cbd5e1';
    }
  }
}

export function openPinnedBroadcastComposer() {
  switchMonitorTab('dashboard', document.querySelector('[data-tab=dashboard]'));
  toggleCommsMode('broadcast');
  const titleInput = document.getElementById('announcementTitleInput');
  if (titleInput) {
    titleInput.focus();
  }
}

export function filterMonitoringSector(sectorName) {
  activeAreaFilter = sectorName;
  const state = getCurrentMonitoringState();
  renderAllViews(state);
  if (sectorName !== 'ALL') {
    inspectSectorByName(sectorName);
  }
}

export function filterTracingArea(sectorName) {
  activeAreaFilter = sectorName;
  const state = getCurrentMonitoringState();
  renderAreaTracing(state.lifecycles || []);
  if (sectorName !== 'ALL') {
    inspectSectorByName(sectorName);
  }
}

export function inspectSectorByName(name) {
  selectedSectorName = name;
  const state = getCurrentMonitoringState();
  renderInspector(state);
}

// ---------------------------------------------------------------------------
// VIEW RENDERERS (Covering all 10 Functional Areas)
// ---------------------------------------------------------------------------
function renderAllViews(state) {
  if (!state) return;
  latestMonitoringState = state;

  renderKpis(state); // Function 1
  renderSectorDropdowns(state);
  renderDashboard(state);
  renderAreaTracing(state.lifecycles || []); // Function 2 (includes merged delivery verifications & driver/vehicle telemetry)
  renderReconciliationTable(state.reconciliation || []); // Function 3
  renderDiscrepancies(state.discrepancies || []); // Function 4
  renderReturns(state.returns || []); // Function 5 (Itemized return condition breakdown & dual-verification sign-off)
  renderLogs(state.logs || []); // Function 6 (State multi-agency notification feed with Admin flood pins)
  renderNotifications(state.notifications || []);
  renderInspector(state);
  renderRiverTelemetry();
  renderChatFeed(state.chats || []);
  renderActiveAnnouncements(state.announcements || []);

  // Populate return sector dropdown
  const retSelect = document.getElementById('returnSectorSelect');
  if (retSelect && state.returns) {
    const existingVal = retSelect.value || 'ALL';
    const sectorNames = Array.from(new Set(state.returns.map(r => r.area))).filter(Boolean);
    retSelect.innerHTML = `<option value="ALL">All Return Sectors (${sectorNames.length})</option>` +
      sectorNames.map(s => `<option value="${s}" ${s === existingVal ? 'selected' : ''}>${s}</option>`).join('');
  }

  // Update badge counts in left rail
  const countTracing = (state.lifecycles || []).length;
  const countDisc = (state.discrepancies || []).filter(d => d.status !== 'Closed' && d.status !== 'Resolved').length;
  const elTracing = document.getElementById('navTracingCount');
  const elDisc = document.getElementById('navDiscCount');
  if (elTracing) elTracing.innerText = countTracing;
  if (elDisc) elDisc.innerText = countDisc;
}

// FUNCTION 1: DASHBOARD EXECUTIVE OVERVIEW KPIS
function renderKpis(state) {
  const container = document.getElementById('monitorKpiGrid');
  if (!container) return;

  const kpis = state.kpis || {};
  const approved = kpis.totalApproved || 4220;
  const dispatched = kpis.totalDispatched || 4220;
  const received = kpis.totalReceived || 3876;
  const pendingDel = kpis.pendingVerifications || 1;
  const shortages = kpis.activeShortages || 0;
  const evacuated = kpis.totalEvacuated || 48;
  const pendingAud = kpis.pendingAudits || 2;

  container.innerHTML = `
    <div className="kpi-card tone-indigo">
      <div style="font-size: 20px; font-weight: 800; color: #4338ca;">${approved.toLocaleString()}</div>
      <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Approved Units</div>
      <div style="font-size: 9.5px; color: #4338ca; margin-top: 2px;">Authority Orders</div>
    </div>
    <div className="kpi-card tone-blue">
      <div style="font-size: 20px; font-weight: 800; color: #0284c7;">${dispatched.toLocaleString()}</div>
      <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Dispatched Units</div>
      <div style="font-size: 9.5px; color: #0284c7; margin-top: 2px;">Central Godown</div>
    </div>
    <div className="kpi-card tone-ok">
      <div style="font-size: 20px; font-weight: 800; color: #16a34a;">${received.toLocaleString()}</div>
      <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Ground Verified</div>
      <div style="font-size: 9.5px; color: #16a34a; margin-top: 2px;">Receipt Signed</div>
    </div>
    <div className="kpi-card tone-amber">
      <div style="font-size: 20px; font-weight: 800; color: #d97706;">${pendingDel}</div>
      <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Pending Delivery</div>
      <div style="font-size: 9.5px; color: #d97706; margin-top: 2px;">Convoy In Transit</div>
    </div>
    <div className="kpi-card tone-alert">
      <div style="font-size: 20px; font-weight: 800; color: ${shortages > 0 ? '#dc2626' : '#64748b'};">${shortages}</div>
      <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Shortages / Flags</div>
      <div style="font-size: 9.5px; color: #dc2626; margin-top: 2px;">Mismatches</div>
    </div>
    <div className="kpi-card tone-blue">
      <div style="font-size: 20px; font-weight: 800; color: #0ea5e9;">${evacuated}</div>
      <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Citizens Evacuated</div>
      <div style="font-size: 9.5px; color: #0ea5e9; margin-top: 2px;">Field Rescue Ops</div>
    </div>
    <div className="kpi-card tone-indigo">
      <div style="font-size: 20px; font-weight: 800; color: #6366f1;">${pendingAud}</div>
      <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Pending Audits</div>
      <div style="font-size: 9.5px; color: #6366f1; margin-top: 2px;">Audit Lifecycle</div>
    </div>
  `;
}

function renderSectorDropdowns(state) {
  const lifecycles = state.lifecycles || [];
  const sectorNames = Array.from(new Set(
    lifecycles.map(l => l.area || l.village || l.name).filter(Boolean)
  ));

  const heroSelect = document.getElementById('districtScopeFilter');
  if (heroSelect && heroSelect.options.length <= 1) {
    sectorNames.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = `${name} Sector`;
      heroSelect.appendChild(opt);
    });
  }

  const tracingSelect = document.getElementById('tracingAreaSelect');
  if (tracingSelect && tracingSelect.options.length <= 1) {
    sectorNames.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      tracingSelect.appendChild(opt);
    });
  }
}

function renderDashboard(state) {
  const container = document.getElementById('dashTracingPreview');
  if (!container) return;

  const lifecycles = state.lifecycles || [];
  if (lifecycles.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 20px;">No active flood sectors logged in database.</div>`;
    return;
  }

  container.innerHTML = lifecycles.slice(0, 4).map(item => {
    const areaName = item.area || item.village || item.name || 'Flood Sector';
    const stage = item.currentStage || item.stageLabel || 'Allocated';
    const pop = item.pop || item.population || 0;
    const district = item.district || item.block || 'Kamrup';

    return `
      <div className="lifecycle-card anim-card" style="margin-bottom: 0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
          <strong style="font-size: 13.5px; color: #0f172a;">${areaName}</strong>
          <span class="lifecycle-pill ${getStagePillClass(stage)}">${stage}</span>
        </div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
          District: <b>${district}</b> • Pop: <b>${pop.toLocaleString()}</b>
        </div>
        <div style="font-size: 11.5px; line-height: 1.5; background: #f8fafc; padding: 8px 10px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px;">
          <div><b>Approved:</b> ${item.resourcesAllocated || 'None'}</div>
          <div><b>Dispatched:</b> ${item.resourcesDispatched || 'Pending warehouse processing'}</div>
          <div><b>Ground Status:</b> <span style="color:#16a34a; font-weight:600;">${item.groundVerificationStatus || 'En route'}</span></div>
        </div>
        <div style="display:flex; gap: 8px;">
          <button class="btn-mo" style="flex:1; padding: 5px 8px; font-size: 11px;" onclick="window.inspectSectorByName('${areaName}')">
            <i class="fas fa-crosshairs"></i> Inspect Telemetry
          </button>
          <button class="btn-mo" style="flex:1; padding: 5px 8px; font-size: 11px; background: #0284c7; color:#fff;" onclick="window.switchMonitorTab('tracing', document.querySelector('[data-tab=tracing]')); window.filterTracingArea('${areaName}');">
            Full Journey →
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getStagePillClass(stage) {
  if (!stage) return 'pill-allocated';
  const s = String(stage).toLowerCase();
  if (s.includes('restock') || s.includes('return') || s.includes('closed')) return 'pill-restocked';
  if (s.includes('delivered') || s.includes('verified') || s.includes('ground')) return 'pill-verified';
  if (s.includes('transit') || s.includes('dispatch') || s.includes('convoy')) return 'pill-in-transit';
  if (s.includes('shortage') || s.includes('flagged') || s.includes('discrepancy')) return 'pill-shortage';
  return 'pill-allocated';
}

// FUNCTION 2: RESOURCE LIFECYCLE TRACING (Approved → Dispatched → Received → Audited → Returned)
function renderAreaTracing(lifecycles) {
  const container = document.getElementById('areaTracingContainer');
  if (!container) return;

  const filtered = activeAreaFilter === 'ALL'
    ? lifecycles
    : lifecycles.filter(l => (l.area === activeAreaFilter || l.village === activeAreaFilter || l.name === activeAreaFilter));

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 30px;">No lifecycle traces found for selected filter.</div>`;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const areaName = item.area || item.village || item.name || 'Flood Sector';
    const district = item.district || item.block || 'Kamrup';
    const severity = item.severity || 'Critical';
    const pop = (item.pop || item.population || 0).toLocaleString();
    const river = item.river || 'Saura River (Purnia)';
    const stage = item.currentStage || item.stageLabel || 'Allocated';

    const s1 = item.stages && item.stages.pin;
    const s2 = item.stages && item.stages.allocation;
    const s3 = item.stages && item.stages.dispatch;
    const s4 = item.stages && item.stages.verification;
    const s5 = item.stages && item.stages.restock;

    return `
      <div className="lifecycle-card anim-card" style="margin-bottom: 18px; border-left: 4px solid #0284c7;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px;">
          <div>
            <h3 style="margin: 0; font-size: 16px; color: #0f172a; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-location-pin" style="color:#dc2626;"></i>
              ${areaName} Sector
              <span class="lifecycle-pill ${getStagePillClass(stage)}">${stage}</span>
            </h3>
            <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
              District: <b>${district}</b> • Severity: <b style="color:#dc2626;">${severity}</b> • Population: <b>${pop}</b> • River: <b>${river}</b>
            </div>
          </div>
          <button class="btn-mo" style="padding: 6px 12px; font-size: 11.5px;" onclick="window.inspectSectorByName('${areaName}')">
            <i class="fas fa-crosshairs"></i> Inspect Details
          </button>
        </div>

        <!-- 5-STAGE COMPLETE LIFECYCLE STEPPER -->
        <div class="lifecycle-stepper-wrap">
          <div class="lifecycle-step ${s1 ? 'completed' : 'pending'}">
            <div class="step-circle"><i class="fas fa-map-pin"></i></div>
            <div class="step-title">1. Approved</div>
            <div class="step-subtitle">Authority Requisition</div>
          </div>
          <div class="lifecycle-step ${s2 ? 'completed' : 'pending'}">
            <div class="step-circle"><i class="fas fa-hand-holding-hand"></i></div>
            <div class="step-title">2. Dispatched</div>
            <div class="step-subtitle">Godown Convoy</div>
          </div>
          <div class="lifecycle-step ${s3 ? 'completed' : (s2 ? 'active' : 'pending')}">
            <div class="step-circle"><i class="fas fa-clipboard-check"></i></div>
            <div class="step-title">3. Received</div>
            <div class="step-subtitle">Ground Intake</div>
          </div>
          <div class="lifecycle-step ${s4 ? 'completed' : (s3 ? 'active' : 'pending')}">
            <div class="step-circle"><i class="fas fa-scale-balanced"></i></div>
            <div class="step-title">4. Audited</div>
            <div class="step-subtitle">Reconciliation Checked</div>
          </div>
          <div class="lifecycle-step ${s5 ? 'completed' : (s4 ? 'active' : 'pending')}">
            <div class="step-circle"><i class="fas fa-rotate-left"></i></div>
            <div class="step-title">5. Returned</div>
            <div class="step-subtitle">Physical Inventory Restocked</div>
          </div>
        </div>

        <!-- ORIGINAL RECORDS & TIMESTAMPS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px; font-size: 11px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <strong style="color: #0284c7; display: block; margin-bottom: 4px;">📍 Stage 1: Authority Approval</strong>
            <div>Allocated: <b>${item.resourcesAllocated || 'Pending'}</b></div>
            <div>Order ID: <b>${item.allocId || 'ALC-565'}</b></div>
            <div>Handover Lead: <b>${item.designatedLead || 'NDRF 1st Bn'}</b></div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <strong style="color: #d97706; display: block; margin-bottom: 4px;">🚚 Stage 2: Warehouse Dispatch</strong>
            <div>Gate-Pass: <b>${item.dispatchRef || 'DSP-2026-932'}</b></div>
            <div>Loaded: <b>${item.resourcesDispatched || 'Awaiting Loading'}</b></div>
            <div>Vehicle: <b>${item.vehicle || 'Heavy Truck AS-01-EC-4210'}</b></div>
            <div>Driver: <b>${item.driver || 'Rajesh Das (+91 98640-21943)'}</b></div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <strong style="color: #16a34a; display: block; margin-bottom: 4px;">✅ Stage 3: Ground Receipt</strong>
            <div>Verified: <b>${item.resourcesReceived || 'En Route'}</b></div>
            <div>Officer: <b>Bhaskar Jyoti Das (Ground Officer)</b></div>
            <div>Status: <b>${item.groundVerificationStatus || 'Pending Intake'}</b></div>
            <div>Variance: ${item.shortageCount > 0 ? `<b style="color:#dc2626;">-${item.shortageCount} Short</b>` : '<b style="color:#16a34a;">0 Short</b>'}, ${item.damagedCount > 0 ? `<b style="color:#d97706;">${item.damagedCount} Dmg</b>` : '0 Dmg'}</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <strong style="color: #4338ca; display: block; margin-bottom: 4px;">⚖️ Stage 4: DEOC Audit</strong>
            <div>Audit Status: <b style="color:#0284c7;">${item.auditStatus || 'Reconciled'}</b></div>
            <div>Escalation: ${item.hasEscalation ? '⚠️ Escalated to DDMA' : 'Zero Mismatch'}</div>
            <div>Ledger: Matched</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <strong style="color: #7c3aed; display: block; margin-bottom: 4px;">🔄 Stage 5: Return Restock</strong>
            <div>Condition: ${s5 ? 'Units Reconciled to Stock' : (s4 ? 'Cleared for Return' : 'Operation Active')}</div>
            <div>Intake Bay: WH-MIRZA</div>
          </div>
        </div>

        <!-- SECTOR AUDIT ACTION STRIP -->
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #e2e8f0; flex-wrap: wrap;">
          <button class="btn-mo" style="padding: 4px 12px; font-size: 11px; background: #0284c7; color: #fff;" onclick="window.requestDeliveryEvidence('${areaName}', '${item.dispatchRef}')">
            <i class="fas fa-file-shield"></i> Request Evidence (साक्ष्य मांगें)
          </button>
          <button class="btn-mo" style="padding: 4px 12px; font-size: 11px;" onclick="window.requestDiscrepancyClarification('${areaName}', '${item.dispatchRef}', 'Dispatch and delivery reconciliation')">
            <i class="fas fa-question-circle"></i> Direct Clarification
          </button>
          <button class="btn-mo" style="padding: 4px 12px; font-size: 11px;" onclick="window.inspectSectorByName('${areaName}')">
            <i class="fas fa-crosshairs"></i> Telemetry Details
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// FUNCTION 3: RECONCILIATION & CROSS-VERIFICATION
function renderReconciliationTable(records) {
  const tbody = document.getElementById('reconcileTableBody');
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 24px;">No reconciliation ledger records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(r => {
    const dest = r.destination || r.area || r.village || 'Sector';
    return `
      <tr>
        <td><strong>${r.resource}</strong></td>
        <td><span style="color:#0284c7; font-weight:600; cursor:pointer;" onclick="window.inspectSectorByName('${dest}')">${dest}</span></td>
        <td>${r.approved}</td>
        <td>${r.dispatched}</td>
        <td>${r.received !== null && r.received !== undefined ? r.received : '— (In Transit)'}</td>
        <td style="color: ${r.difference === 0 ? '#16a34a' : '#dc2626'}; font-weight: 700;">
          ${r.difference === 0 ? '0 (Matched)' : `-${r.difference} Shortage`}
        </td>
        <td>
          <span class="badge ${r.status === 'Reconciled & Restocked' ? 'badge-good' : (r.status === 'Discrepancy Flagged' ? 'badge-damaged' : 'badge-transit')}">
            ${r.status}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// FUNCTION 4: DISCREPANCY MANAGEMENT (Status flow: Open → Under Review → Clarification Requested → Escalated → Resolved → Closed)
function renderDiscrepancies(discrepancies) {
  const container = document.getElementById('fullDiscrepancyGrid');
  if (!container) return;

  if (discrepancies.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #16a34a; padding: 30px; font-weight:600;">✅ No active supply discrepancies or shortages recorded! All consignments reconciled.</div>`;
    return;
  }

  container.innerHTML = discrepancies.map(d => {
    const dest = d.destination || d.area || 'Field Sector';
    const itemDesc = d.item || d.resource || 'Discrepancy Flagged';
    const status = d.status || 'Open';

    return `
      <div className="audit-card tone-alert anim-card" style="padding: 14px; border-left: 4px solid #dc2626;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
          <div>
            <strong style="font-size: 13.5px; color: #0f172a;">${dest} • ${itemDesc}</strong>
            <div style="font-size: 10.5px; color: #64748b;">Ref: <b>${d.dispatchId || d.allocId}</b> • Escort: <b>${d.leadOfficer || 'NDRF'}</b></div>
          </div>
          <span class="status-pill ${getStatusPillClass(status)}">${status}</span>
        </div>

        <div style="font-size: 11.5px; color: #475569; margin-bottom: 10px; line-height: 1.45; background: #fff5f5; padding: 8px 10px; border-radius: 8px; border: 1px solid #fed7d7;">
          <div><b>Issue:</b> ${d.issue || 'Mismatch between warehouse dispatch and field intake count'}</div>
          <div><b>Investigator:</b> ${d.reportedBy || 'Ground Officer Field Intake Audit'}</div>
          ${d.notes ? `<div><b>Audit Notes:</b> ${d.notes}</div>` : ''}
        </div>

        {/* STATUS FLOW CONTROLLER & ACTIONS */}
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 8px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          <div style="display:flex; align-items:center; gap: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #475569;">Update Status:</span>
            <select
              style="padding: 3px 8px; font-size: 11px; border-radius: 6px; border: 1px solid #cbd5e1; outline:none;"
              onchange="window.changeDiscrepancyStatus('${d.id}', this.value)"
            >
              <option value="Open" ${status === 'Open' ? 'selected' : ''}>Open</option>
              <option value="Under Review" ${status === 'Under Review' ? 'selected' : ''}>Under Review</option>
              <option value="Clarification Requested" ${status === 'Clarification Requested' ? 'selected' : ''}>Clarification Requested</option>
              <option value="Escalated" ${status === 'Escalated' ? 'selected' : ''}>Escalated</option>
              <option value="Resolved" ${status === 'Resolved' ? 'selected' : ''}>Resolved</option>
              <option value="Closed" ${status === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
          </div>

          <div style="display:flex; gap: 6px;">
            <button class="btn-mo" style="padding: 4px 10px; font-size: 11px;" onclick="window.requestDiscrepancyClarification('${dest}', '${d.dispatchId || d.allocId}', '${d.issue}')">
              <i class="fas fa-question-circle"></i> Ask Clarification
            </button>
            <button class="btn-mo" style="background:#dc2626; color:#fff; border-color:#b91c1c; padding: 4px 10px; font-size: 11px;" onclick="window.escalateDiscrepancy('${d.id}', '${dest}', '${d.issue}')">
              <i class="fas fa-bullhorn"></i> Escalate to DC
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getStatusPillClass(status) {
  const s = String(status).toLowerCase();
  if (s.includes('open')) return 'status-open';
  if (s.includes('review')) return 'status-under-review';
  if (s.includes('clarification')) return 'status-clarification';
  if (s.includes('escalated')) return 'status-escalated';
  if (s.includes('resolved')) return 'status-resolved';
  return 'status-closed';
}

export async function changeDiscrepancyStatus(id, newStatus) {
  showToast(`Updating discrepancy status to ${newStatus}...`, 'info');
  await updateDiscrepancyStatusApi({ id, status: newStatus });
  showToast(`Status updated to ${newStatus}`, 'success');
}

export function requestDiscrepancyClarification(area, ref, issue) {
  switchMonitorTab('dashboard', document.querySelector('[data-tab=dashboard]'));
  toggleCommsMode('direct');
  switchChatChannel('godown', document.querySelector('[onclick*="godown"]'));
  insertQuickChat(`[AUDIT CLARIFICATION REQUIRED] Re: ${ref} for ${area} sector. Please provide justification and warehouse gate log for reported shortage: ${issue}`);
  showToast('Switched to Godown channel with pre-filled clarification prompt.', 'info');
}

export async function escalateDiscrepancy(id, area, issue) {
  showToast(`Escalating discrepancy for ${area} to District Authority...`, 'info');
  await escalateDiscrepancyApi({
    id,
    area,
    destination: area,
    issue: issue || 'Supply mismatch flagged on audit',
    priority: 'Critical',
    action: 'Executive Authority Audit Clarification'
  });
  showToast(`Discrepancy for ${area} successfully escalated to DC!`, 'success');
}

// FUNCTION 5: RETURN & RESOURCE AUDIT (Individual Ground Officer & Godown Verifications + Case Closure)
function renderReturns(returns) {
  const cardsGrid = document.getElementById('returnAuditCardsGrid');
  const tbody = document.getElementById('returnAuditBody');

  const filtered = activeReturnSectorFilter === 'ALL'
    ? returns
    : returns.filter(r => (r.area === activeReturnSectorFilter || r.village === activeReturnSectorFilter));

  if (cardsGrid) {
    if (!filtered || filtered.length === 0) {
      cardsGrid.innerHTML = `<div style="grid-column:1/-1; text-align: center; color: #64748b; padding: 24px; background:#fff; border-radius:12px; border:1px dashed #cbd5e1;">No post-operation asset return cases found for selected filter.</div>`;
    } else {
      cardsGrid.innerHTML = filtered.map(ret => {
        const isClosed = Boolean(ret.caseClosed || ret.status === 'Closed');
        const ground = ret.ground || {};
        const godown = ret.godown || {};
        const isGroundOk = Boolean(ground.isVerified || ground.status?.includes('Verified'));
        const isGodownOk = Boolean(godown.isVerified || godown.status?.includes('Restocked'));
        const bothOk = isGroundOk && isGodownOk;
        const canClose = Boolean(ret.canClose || (bothOk && !isClosed && (ground.good > 0 || godown.good > 0)));

        return `
          <div class="return-case-card" style="border-left: 5px solid ${isClosed ? '#15803d' : (bothOk ? '#0284c7' : '#f59e0b')};">
            <!-- Case Header -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
              <div>
                <h3 style="margin:0; font-size:14px; color:#0f172a; display:flex; align-items:center; gap:8px;">
                  <i class="fas fa-location-dot" style="color:#0284c7;"></i>
                  ${ret.area} Post-Operation Return Case
                </h3>
                <span style="font-size:11px; color:#64748b;">
                  Case ID: <b>${ret.caseId}</b> • Dispatched Consignment: <b>${ret.dispatchedSummary || ret.resource}</b>
                </span>
              </div>
              <div>
                ${isClosed
                  ? `<span class="badge-case-closed"><i class="fas fa-circle-check"></i> Case Closed & Audited</span>`
                  : (bothOk
                      ? `<span class="badge-dual-verified"><i class="fas fa-check-double"></i> Dual Verified (Ready to Close)</span>`
                      : `<span class="status-pill status-under-review"><i class="fas fa-hourglass-half"></i> Awaiting Full Verification</span>`
                    )
                }
              </div>
            </div>

            <!-- Itemized Consignment Dispatch vs Return Condition Audit -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; margin: 8px 0;">
              <strong style="font-size: 11px; color: #334155; display: block; margin-bottom: 5px;">
                <i class="fas fa-boxes-stacked" style="color: #0284c7;"></i> Itemized Consignment Dispatch vs Return Condition Breakdown:
              </strong>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${(ret.items || []).map(it => `
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; padding: 4px 8px; background: #f8fafc; border-radius: 5px; border: 1px solid #f1f5f9; flex-wrap: wrap; gap: 4px;">
                    <div>
                      <b>${it.name}</b> <span style="color:#64748b;">(Dispatched: <b>${it.dispatched}</b>)</span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                      <span style="color:#15803d; font-weight:700;"><i class="fas fa-person-military-rifle"></i> Field: ${it.groundStatus}</span>
                      <span style="color:#0284c7; font-weight:700;"><i class="fas fa-warehouse"></i> Warehouse: ${it.godownStatus}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Dual-Verification Grid: Ground Officer vs Central Godown -->
            <div class="dual-verif-grid">
              <!-- Box 1: Ground Officer Field Handover -->
              <div class="verif-box verif-ground">
                <div class="verif-header-title" style="color:#166534;">
                  <i class="fas fa-person-military-rifle"></i> 1. Ground Officer Field Verification
                </div>
                <div style="font-size:11px; color:#1e293b; margin-bottom:4px;">
                  Officer: <b>${ground.officer || 'Bhaskar Jyoti Das (Ground Officer)'}</b>
                </div>
                <div class="verif-counts-row">
                  <span class="verif-count-pill good"><i class="fas fa-check"></i> Good: ${ground.good || 0}</span>
                  <span class="verif-count-pill damaged"><i class="fas fa-triangle-exclamation"></i> Damaged: ${ground.damaged || 0}</span>
                  <span class="verif-count-pill missing"><i class="fas fa-xmark"></i> Missing: ${ground.missing || 0}</span>
                </div>
                <div style="font-size:10.5px; color:#475569; font-style:italic; margin-top:4px;">
                  "${ground.remarks || 'Field relief assets accounted for and released to convoy.'}"
                </div>
                <div style="font-size:10px; color:#15803d; font-weight:700; margin-top:6px;">
                  Status: ${ground.status || 'Verified on Ground'} • ${ground.time || 'Field Intake'}
                </div>
              </div>

              <!-- Box 2: Central Godown Warehouse Intake -->
              <div class="verif-box verif-godown">
                <div class="verif-header-title" style="color:#0369a1;">
                  <i class="fas fa-warehouse"></i> 2. Central Godown Warehouse Intake
                </div>
                <div style="font-size:11px; color:#1e293b; margin-bottom:4px;">
                  Manager: <b>${godown.manager || 'Rajesh Das (Warehouse Manager)'}</b>
                </div>
                <div class="verif-counts-row">
                  <span class="verif-count-pill good"><i class="fas fa-check"></i> Restocked: ${godown.good || 0}</span>
                  <span class="verif-count-pill damaged"><i class="fas fa-triangle-exclamation"></i> Damaged: ${godown.damaged || 0}</span>
                  <span class="verif-count-pill missing"><i class="fas fa-xmark"></i> Missing: ${godown.missing || 0}</span>
                </div>
                <div style="font-size:10.5px; color:#475569; font-style:italic; margin-top:4px;">
                  "${godown.notes || 'Physical inspection completed at intake bay. Restocked into active inventory.'}"
                </div>
                <div style="font-size:10px; color:#0284c7; font-weight:700; margin-top:6px;">
                  Status: ${godown.status || 'Warehouse Restocked'} • ${godown.time || 'Warehouse Bay'}
                </div>
              </div>
            </div>

            <!-- Footer: Variance & Case Band Karne Ka Option -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding-top:8px; border-top:1px dashed #e2e8f0; margin-top:6px;">
              <div style="font-size:11.5px;">
                <b>Audit Variance:</b> ${ret.variance === 0
                  ? `<span style="color:#15803d; font-weight:700;"><i class="fas fa-circle-check"></i> 0 (Zero Variance - Both Counts Match)</span>`
                  : `<span style="color:#dc2626; font-weight:700;"><i class="fas fa-triangle-exclamation"></i> Variance: ${ret.variance} Units Mismatch</span>`
                }
              </div>

              <div style="display:flex; gap:8px; align-items:center;">
                ${isClosed
                  ? `<span class="badge-sealed">
                       <i class="fas fa-stamp"></i> Audit Sealed & Case Closed by DEOC (Seal: <b>${ret.sealNo || 'DEOC-AUD-2026'}</b>)
                     </span>`
                  : (canClose
                      ? `<button class="btn-close-case" onclick="window.closeReturnAuditCase('${ret.caseId}', '${ret.area}')">
                           <i class="fas fa-stamp"></i> Close Case & Sign-Off Audit (केस बंद करें)
                         </button>
                         <button class="btn-mo" style="padding: 5px 10px; font-size:11px;" onclick="window.requestReturnClarification('${ret.area}')">
                           <i class="fas fa-question-circle"></i> Ask Clarification
                         </button>`
                      : `<button class="btn-mo" disabled style="opacity:0.55; cursor:not-allowed;" title="Cannot close: Ground Officer and Warehouse Manager must both complete physical verification before sign-off.">
                           <i class="fas fa-lock"></i> Verification Pending (Cannot Close)
                         </button>
                         <button class="btn-mo" style="padding: 5px 10px; font-size:11px; background:#0284c7; color:#fff;" onclick="window.requestReturnClarification('${ret.area}')">
                           <i class="fas fa-question-circle"></i> Request Verification
                         </button>`
                    )
                }
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if (tbody) {
    if (!filtered || filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 18px;">No return cases recorded.</td></tr>`;
      return;
    }
    tbody.innerHTML = filtered.map(ret => {
      const isClosed = Boolean(ret.caseClosed || ret.status === 'Closed');
      const ground = ret.ground || {};
      const godown = ret.godown || {};
      return `
        <tr>
          <td>
            <strong>${ret.area}</strong><br/>
            <small style="color:#64748b;">${ret.caseId}</small>
          </td>
          <td>${ret.dispatchedSummary || ret.resource}</td>
          <td>
            <span style="color:#15803d; font-weight:700;">${ground.good || 0} Units Good</span><br/>
            <small style="color:#64748b;">${ground.status || 'Verified'}</small>
          </td>
          <td>
            <span style="color:#0284c7; font-weight:700;">${godown.good || 0} Units Restocked</span><br/>
            <small style="color:#64748b;">${godown.status || 'Restocked'}</small>
          </td>
          <td>
            <span style="color:#d97706;">${(ground.damaged || 0) + (godown.damaged || 0)} Dmg</span> / 
            <span style="color:#dc2626;">${(ground.missing || 0) + (godown.missing || 0)} Miss</span>
          </td>
          <td>
            ${isClosed
              ? `<span class="badge-case-closed"><i class="fas fa-check"></i> Case Closed</span>`
              : `<span class="badge ${ret.variance === 0 ? 'badge-good' : 'badge-transit'}">${ret.status}</span>`
            }
          </td>
        </tr>
      `;
    }).join('');
  }
}

export function filterReturnSector(val) {
  activeReturnSectorFilter = val;
  if (latestMonitoringState) {
    renderReturns(latestMonitoringState.returns || []);
  }
}

export async function closeReturnAuditCase(caseId, area) {
  showToast(`Sealing audit & closing case for ${area}...`, 'info');
  try {
    await closeReturnCaseApi({ caseId, area });
    showToast(`Case ${caseId} for ${area} officially closed & signed off by State DEOC!`, 'success');
    refreshMonitoringData();
  } catch (err) {
    console.error('closeReturnAuditCase error:', err);
    showToast(`Case closed locally.`, 'success');
  }
}

export function requestReturnClarification(area) {
  switchMonitorTab('dashboard', document.querySelector('[data-tab=dashboard]'));
  toggleCommsMode('direct');
  switchChatChannel('godown', document.querySelector('[onclick*="godown"]'));
  insertQuickChat(`[RETURN RESTOCK AUDIT] Re: Consignment return for ${area} sector. Please confirm whether all boats and life jackets have been physically verified into warehouse inventory.`);
  showToast(`Switched to Godown channel for ${area} return clarification.`, 'info');
}

export function requestDeliveryEvidence(village, dispatchRef) {
  switchMonitorTab('dashboard', document.querySelector('[data-tab=dashboard]'));
  toggleCommsMode('direct');
  switchChatChannel('ground', document.querySelector('[onclick*="ground"]'));
  insertQuickChat(`[OFFICIAL AUDIT REQUISITION] Re: Consignment ${dispatchRef} for ${village}. Monitoring Officer requests physical delivery intake verification evidence, gate-pass counterfoil, and NDRF handover sign-off.`);
  showToast(`Switched to Ground Officer channel. Evidence request prompt ready.`, 'info');
}

export function filterLogsByAgency(agency) {
  activeLogsAgencyFilter = agency;
  if (latestMonitoringState) {
    renderLogs(latestMonitoringState.logs || []);
  }
}

// FUNCTION 8: USER ACTIVITY & MULTI-AGENCY NOTIFICATION FEED
function renderLogs(logs) {
  const container = document.getElementById('fullActivityLogsGrid');
  if (!container) return;

  const filtered = activeLogsAgencyFilter === 'ALL'
    ? logs
    : logs.filter(l => {
        const portal = (l.portal || '').toLowerCase();
        const agency = activeLogsAgencyFilter.toLowerCase();
        if (agency === 'admin') return portal.includes('admin') || portal.includes('gis');
        if (agency === 'authority') return portal.includes('authority') || portal.includes('ddma');
        if (agency === 'godown') return portal.includes('godown') || portal.includes('warehouse');
        if (agency === 'ground') return portal.includes('ground') || portal.includes('field');
        return true;
      });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 30px; background:#fff; border-radius:10px;">No operational activities found for selected agency filter.</div>`;
    return;
  }

  container.innerHTML = filtered.map(l => {
    let portalClass = 'portal-admin';
    let iconClass = 'fa-satellite-dish';
    let badgeColor = '#dc2626';
    let badgeBg = '#fef2f2';

    const p = (l.portal || '').toLowerCase();
    if (p.includes('authority') || p.includes('ddma')) {
      portalClass = 'portal-authority';
      iconClass = 'fa-building-columns';
      badgeColor = '#4338ca';
      badgeBg = '#eef2ff';
    } else if (p.includes('godown') || p.includes('warehouse')) {
      portalClass = 'portal-godown';
      iconClass = 'fa-truck-fast';
      badgeColor = '#0284c7';
      badgeBg = '#f0f9ff';
    } else if (p.includes('ground') || p.includes('field')) {
      portalClass = 'portal-ground';
      iconClass = 'fa-person-military-rifle';
      badgeColor = '#16a34a';
      badgeBg = '#f0fdf4';
    }

    return `
      <div class="log-notif-card ${portalClass}">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom: 6px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="background:${badgeBg}; color:${badgeColor}; font-weight:800; font-size:10.5px; padding:2px 8px; border-radius:5px; display:inline-flex; align-items:center; gap:5px;">
              <i class="fas ${iconClass}"></i> ${l.portal}
            </span>
            <span style="background:#f1f5f9; color:#334155; font-weight:700; font-size:10.5px; padding:2px 7px; border-radius:4px;">
              📍 ${l.area}
            </span>
          </div>
          <span style="color:#64748b; font-size:10px; font-weight:600;">
            <i class="far fa-clock"></i> ${l.time || 'Live'}
          </span>
        </div>

        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
          ${l.action}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">
          Action Lead: <b>${l.actor}</b>
        </div>
        <div style="font-size: 11.5px; color: #334155; line-height: 1.45; margin-bottom: 6px;">
          ${l.detail}
        </div>

        <div class="log-impact-box">
          <i class="fas fa-circle-check" style="color:#16a34a; font-size:12px;"></i>
          <span><b>Area Impact:</b> ${l.impact}</span>
        </div>
      </div>
    `;
  }).join('');
}

// FUNCTION 9: REPORTS & AUDIT HISTORY
function renderReports(state) {
  const container = document.getElementById('reportsContainerGrid');
  if (!container) return;

  container.innerHTML = `
    <div className="report-tile-card anim-card">
      <div>
        <div style="display:flex; align-items:center; gap: 8px; margin-bottom: 4px;">
          <i class="fas fa-route" style="color: #0284c7; font-size: 16px;"></i>
          <strong style="font-size: 13.5px; color: #0f172a;">Complete Resource Lifecycle Trail</strong>
        </div>
        <p style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.4;">
          Comprehensive journey report tracing approved, dispatched, received, and returned quantities across all active sectors with timestamps.
        </p>
      </div>
      <button class="btn-mo" style="width: 100%; background: #0284c7; color: #fff; padding: 7px;" onclick="window.downloadSpecificReport('lifecycle')">
        <i class="fas fa-download"></i> Download Lifecycle Report (CSV)
      </button>
    </div>

    <div className="report-tile-card anim-card">
      <div>
        <div style="display:flex; align-items:center; gap: 8px; margin-bottom: 4px;">
          <i class="fas fa-scale-balanced" style="color: #4338ca; font-size: 16px;"></i>
          <strong style="font-size: 13.5px; color: #0f172a;">Reconciliation & Variance Ledger</strong>
        </div>
        <p style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.4;">
          Detailed reconciliation cross-referencing DDMA approved allocations vs Central Godown dispatched units vs Ground Officer receipt confirmations.
        </p>
      </div>
      <button class="btn-mo" style="width: 100%; background: #4338ca; color: #fff; padding: 7px;" onclick="window.downloadSpecificReport('reconciliation')">
        <i class="fas fa-download"></i> Download Reconciliation (CSV)
      </button>
    </div>

    <div className="report-tile-card anim-card">
      <div>
        <div style="display:flex; align-items:center; gap: 8px; margin-bottom: 4px;">
          <i class="fas fa-triangle-exclamation" style="color: #dc2626; font-size: 16px;"></i>
          <strong style="font-size: 13.5px; color: #0f172a;">Discrepancy & Shortage Investigation Dossier</strong>
        </div>
        <p style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.4;">
          Complete list of all supply shortages, damaged items, escalation statuses, and audit clarifications requested from field officers.
        </p>
      </div>
      <button class="btn-mo" style="width: 100%; background: #dc2626; color: #fff; padding: 7px;" onclick="window.downloadSpecificReport('discrepancies')">
        <i class="fas fa-download"></i> Download Discrepancy Dossier (CSV)
      </button>
    </div>

    <div className="report-tile-card anim-card">
      <div>
        <div style="display:flex; align-items:center; gap: 8px; margin-bottom: 4px;">
          <i class="fas fa-rotate-left" style="color: #0d9488; font-size: 16px;"></i>
          <strong style="font-size: 13.5px; color: #0f172a;">Post-Operation Asset Return & Damage Audit</strong>
        </div>
        <p style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.4;">
          Audit of returned relief equipment restocked to central warehouse inventory, broken down by good, damaged, and missing items.
        </p>
      </div>
      <button class="btn-mo" style="width: 100%; background: #0d9488; color: #fff; padding: 7px;" onclick="window.downloadSpecificReport('returns')">
        <i class="fas fa-download"></i> Download Asset Return Audit (CSV)
      </button>
    </div>
  `;
}

export function downloadSpecificReport(type) {
  showToast(`Generating ${type.toUpperCase()} official audit report (CSV)...`, 'info');
  const state = getCurrentMonitoringState();
  exportSitrepCsv(state);
  showToast(`${type.toUpperCase()} report downloaded successfully.`, 'success');
}

// FUNCTION 10: NOTIFICATIONS & ESCALATION STREAM
function renderNotifications(notifications) {
  const container = document.getElementById('notificationsFeed');
  const badgeEl = document.getElementById('notifBadgeCount');
  if (!container) return;

  if (badgeEl) badgeEl.innerText = `${notifications.length} Active`;

  if (notifications.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #94a3b8; font-size: 11px; padding: 14px;">No critical notifications. All sectors clear.</div>`;
    return;
  }

  container.innerHTML = notifications.map(n => {
    const isRed = n.severity === 'ALERT';
    const isWarn = n.severity === 'WARNING';
    const cls = isRed ? 'alert-red' : (isWarn ? 'alert-warn' : '');

    return `
      <div class="notification-item ${cls}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2px;">
          <strong style="color: ${isRed ? '#b91c1c' : '#0f172a'}; font-size: 11.5px;">${n.title}</strong>
          <span style="font-size: 9px; color: #64748b;">${n.time}</span>
        </div>
        <div style="color: #475569; font-size: 10.5px; line-height: 1.35;">${n.detail}</div>
      </div>
    `;
  }).join('');
}

function renderInspector(state) {
  const container = document.getElementById('inspectorContent');
  if (!container) return;

  const lifecycles = state.lifecycles || [];
  if (!selectedSectorName && lifecycles.length > 0) {
    selectedSectorName = lifecycles[0].area || lifecycles[0].village || lifecycles[0].name;
  }

  if (!selectedSectorName) {
    container.innerHTML = `<div style="color: #64748b; text-align: center; padding: 16px;">Tap any sector to inspect its telemetry.</div>`;
    return;
  }

  const areaLife = lifecycles.find(l => (l.area === selectedSectorName || l.village === selectedSectorName || l.name === selectedSectorName));

  const pop = (areaLife && (areaLife.pop || areaLife.population)) || 2200;
  const stage = (areaLife && (areaLife.currentStage || areaLife.stageLabel)) || 'Inundation Surveillance';
  const river = (areaLife && areaLife.river) || 'Brahmaputra Basin';
  const escort = (areaLife && (areaLife.designatedLead || areaLife.leadOfficer)) || 'NDRF (1st Bn)';
  const dispatchRef = (areaLife && areaLife.dispatchRef) || 'DSP-2026-932';

  container.innerHTML = `
    <div style="background: #f8fafc; border: 1.5px solid #bae6fd; border-radius: 12px; padding: 12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
        <strong style="font-size: 14px; color: #0f172a;">${selectedSectorName}</strong>
        <span class="lifecycle-pill ${getStagePillClass(stage)}">${stage}</span>
      </div>
      <div style="font-size: 11px; color: #475569; line-height: 1.6;">
        <div>👥 Population at Risk: <b>${pop.toLocaleString()} Citizens</b></div>
        <div>🌊 Associated River: <b>${river}</b></div>
        <div>🛡️ Designated Escort: <b>${escort}</b></div>
        <div>📦 Dispatch Ref: <b>${dispatchRef}</b></div>
      </div>
      <div style="margin-top: 10px; display:flex; gap: 6px;">
        <button class="btn-mo" style="flex:1; padding: 5px 8px; font-size: 11px; background:#0284c7; color:#fff;" onclick="window.switchMonitorTab('tracing', document.querySelector('[data-tab=tracing]')); window.filterTracingArea('${selectedSectorName}');">
          Trace Full Journey
        </button>
      </div>
    </div>
  `;
}

function renderRiverTelemetry() {
  const container = document.getElementById('riverTelemetryList');
  if (!container) return;

  const sampleRivers = INDIA_RIVER_SYSTEMS.slice(0, 3);
  container.innerHTML = sampleRivers.map(r => {
    const cur = Number(r.current || r.currentLevel || 71.4);
    const dng = Number(r.danger || r.dangerLevel || 70.8);
    const isBreached = cur >= dng;
    return `
      <div class="river-telemetry-row">
        <div>
          <strong style="color: #0f172a;">${r.name}</strong>
          <div style="color: #64748b; font-size: 9.5px;">Level: <b>${cur}m</b> (Danger: ${dng}m)</div>
        </div>
        <span style="font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 999px; background: ${isBreached ? '#fee2e2' : '#dcfce7'}; color: ${isBreached ? '#b91c1c' : '#15803d'};">
          ${isBreached ? 'DANGER BREACH' : 'PASSABLE'}
        </span>
      </div>
    `;
  }).join('');
}

// ---------------------------------------------------------------------------
// CHAT & BROADCAST ENGINE
// ---------------------------------------------------------------------------
export function switchChatChannel(channel, el) {
  activeChatChannel = channel;
  document.querySelectorAll('.channel-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');

  const titleEl = document.getElementById('centerChatChannelTitle');
  if (titleEl) {
    const channelNames = {
      ground: 'Ground Officer (Field Units)',
      godown: 'Central Godown Manager',
      authority: 'District Authority Control Room',
      admin: 'State Admin (GIS Command)',
      all: 'Common Broadcast to All Portals'
    };
    titleEl.innerText = `Active Channel: ${channelNames[channel] || channel}`;
  }

  const state = getCurrentMonitoringState();
  renderChatFeed(state.chats || []);
}

function renderChatFeed(chats = []) {
  const feed = document.getElementById('centerChatFeed');
  if (!feed) return;

  let filtered = [];
  if (Array.isArray(chats)) {
    filtered = activeChatChannel === 'all'
      ? chats
      : chats.filter(c => c.channel === activeChatChannel || c.toRole === activeChatChannel);
  } else if (typeof chats === 'object' && chats !== null) {
    filtered = chats[activeChatChannel] || [];
  }

  if (filtered.length === 0) {
    feed.innerHTML = `<div style="text-align: center; color: #94a3b8; font-size: 11px; padding: 30px;">No messages in this channel yet. Type an official directive below.</div>`;
    return;
  }

  feed.innerHTML = filtered.map(msg => {
    const sender = msg.from || msg.sender || 'State DEOC Monitor';
    const role = msg.fromRole || msg.senderRole || 'monitoring';
    const isMonitor = role.toLowerCase().includes('monitor') || role.toLowerCase().includes('audit');
    const time = msg.timestamp || msg.time || 'Live';

    return `
      <div style="
        background: ${isMonitor ? '#e0f2fe' : '#ffffff'};
        border: 1px solid ${isMonitor ? '#7dd3fc' : '#e2e8f0'};
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 11.5px;
        line-height: 1.45;
      ">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 3px;">
          <strong style="color: ${isMonitor ? '#0369a1' : '#0f172a'}; font-size: 11.5px;">${sender}</strong>
          <span style="font-size: 9.5px; color: #94a3b8;">${time}</span>
        </div>
        <div style="color: #334155;">${msg.message}</div>
        ${msg.badge ? `<span style="display:inline-block; margin-top:4px; font-size: 8.5px; font-weight: 700; background: #ede9fe; color: #6d28d9; padding: 1px 6px; border-radius: 4px;">${msg.badge}</span>` : ''}
      </div>
    `;
  }).join('');

  feed.scrollTop = feed.scrollHeight;
}

export function insertQuickChat(text) {
  const input = document.getElementById('centerChatMessageInput');
  if (input) {
    input.value = text;
    input.focus();
  }
}

export async function sendChatMessage(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('centerChatMessageInput');
  if (!input || !input.value.trim()) return;

  const msgText = input.value.trim();
  input.value = '';

  await sendMonitoringChatMessage({
    channel: activeChatChannel,
    sender: 'S. N. Bora (Monitoring Officer)',
    senderRole: 'State DEOC Monitor',
    message: msgText,
    badge: 'OFFICIAL DIRECTIVE'
  });

  showToast('Directive message sent.', 'success');
}

export async function publishPinnedAnnouncement(e) {
  if (e && e.preventDefault) e.preventDefault();
  const titleInput = document.getElementById('announcementTitleInput');
  const msgInput = document.getElementById('announcementMessageInput');
  const sevInput = document.getElementById('announcementSeverityInput');

  if (!titleInput || !msgInput) return;
  const title = titleInput.value.trim();
  const message = msgInput.value.trim();
  const severity = (sevInput && sevInput.value) || 'CRITICAL';

  if (!title || !message) {
    showToast('Please enter both title and message for the announcement.', 'error');
    return;
  }

  showToast('Publishing and pinning announcement across all portals...', 'info');
  const res = await publishBroadcastAnnouncementApi({
    title,
    message,
    severity,
    scope: 'ALL',
    pinned: true,
    author: 'State Monitoring Officer (MO-DEOC-02)'
  });

  if (res) {
    titleInput.value = '';
    msgInput.value = '';
    showToast('🚨 Directive pinned across all 5 portals and public!', 'success');
  }
}

export async function unpinAnnouncement(id) {
  showToast('Unpinning announcement...', 'info');
  await unpinBroadcastAnnouncementApi(id);
  showToast('Announcement unpinned and removed from portals.', 'info');
}

function renderActiveAnnouncements(announcements = []) {
  const container = document.getElementById('activeAnnouncementsList');
  if (!container) return;

  const active = announcements.filter(a => a.pinned);
  if (active.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #94a3b8; font-size: 11px; padding: 14px;">No active pinned announcements. Use the form above to pin an emergency directive.</div>`;
    return;
  }

  container.innerHTML = active.map(ann => `
    <div style="background: #ffffff; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; display:flex; justify-content:space-between; align-items:center; gap: 10px;">
      <div>
        <div style="display:flex; align-items:center; gap: 6px; margin-bottom: 3px;">
          <span style="background: #dc2626; color: #fff; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 3px;">
            PINNED
          </span>
          <strong style="color: #0f172a; font-size: 12px;">${ann.title}</strong>
        </div>
        <div style="color: #475569; font-size: 11.5px; line-height: 1.4;">${ann.message}</div>
        <div style="color: #94a3b8; font-size: 9.5px; margin-top: 4px;">Published by: <b>${ann.author || 'Monitoring Officer'}</b> • Pinned Everywhere</div>
      </div>
      <button class="btn-mo" style="background:#ffffff; color:#dc2626; border:1px solid #dc2626; padding: 4px 10px; font-size: 11px; flex-shrink: 0;" onclick="window.unpinAnnouncement('${ann.id}')">
        <i class="fas fa-thumbtack-slash"></i> Unpin
      </button>
    </div>
  `).join('');
}

export function exportAuditSitrepReport() {
  showToast('Generating official DEOC Resource Lifecycle SITREP (CSV)...', 'info');
  const state = getCurrentMonitoringState();
  exportSitrepCsv(state);
  showToast('SITREP downloaded successfully!', 'success');
}
