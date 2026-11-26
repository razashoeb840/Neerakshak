// NEERAKSHAK State DEOC Monitoring & Audit Portal Engine
// Connects with Single Source of Truth MongoDB Engine, Leaflet GIS Map & Next.js Endpoints

import {
  fetchFullMonitoringState,
  getCurrentMonitoringState,
  onMonitoringSync,
  sendMonitoringChatMessage,
  escalateDiscrepancyApi,
  startMonitoringSyncPolling
} from './monitoringApi.js';

import {
  initMonitoringMap,
  renderMonitoringAreas,
  autoCenterMonitoringMap,
  focusMonitoringMapByName,
  filterMonitoringMapBySeverity,
  invalidateMonitoringMapSize
} from './monitoringMap.js';

import {
  INDIA_RIVER_SYSTEMS
} from '../admin/indiaGisData.js';

let activeTab = 'dashboard';
let activeChatChannel = 'ground';
let selectedSectorName = null;
let activeAreaFilter = 'ALL';

export default function initMonitoringPage() {
  // Expose global controller functions for UI clicks
  window.switchMonitorTab = switchMonitorTab;
  window.switchChatChannel = switchChatChannel;
  window.sendChatMessage = sendChatMessage;
  window.insertQuickChat = insertQuickChat;
  window.escalateDiscrepancy = escalateDiscrepancy;
  window.inspectSectorByName = inspectSectorByName;
  window.focusMapOnSector = focusMapOnSector;
  window.filterMonitoringSector = filterMonitoringSector;
  window.filterTracingArea = filterTracingArea;
  window.filterMapSeverity = filterMapSeverity;
  window.searchMapSector = searchMapSector;
  window.refreshMonitoringData = refreshMonitoringData;
  window.exportAuditReport = exportAuditReport;
  window.showToast = showToast;

  // Initialize Map
  setTimeout(() => {
    initMonitoringMap('monitoringMapSlot');
    refreshMonitoringData();
  }, 100);

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
  showToast('Syncing DEOC audit ledger with database...', 'info');
  const state = await fetchFullMonitoringState();
  renderAllViews(state);
  showToast('DEOC audit stream synced.', 'success');
}

export function switchMonitorTab(tabId, el) {
  activeTab = tabId;
  document.querySelectorAll('.mo-tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.mon-nav-btn').forEach(b => b.classList.remove('active'));

  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) targetPane.classList.add('active');
  if (el) el.classList.add('active');

  if (tabId === 'dashboard') {
    invalidateMonitoringMapSize();
  }
}

export function filterMapSeverity(sev) {
  filterMonitoringMapBySeverity(sev);
  const state = getCurrentMonitoringState();
  renderMonitoringAreas(state.areas || []);
  showToast(`Filtered map by severity: ${sev}`);
}

export function searchMapSector(query) {
  if (!query) return;
  focusMonitoringMapByName(query.trim());
}

export function filterMonitoringSector(sectorName) {
  activeAreaFilter = sectorName;
  const state = getCurrentMonitoringState();
  renderAllViews(state);
  if (sectorName !== 'ALL') {
    focusMapOnSector(sectorName);
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

export function focusMapOnSector(name) {
  switchMonitorTab('dashboard', document.querySelector('[data-tab=dashboard]'));
  setTimeout(() => {
    focusMonitoringMapByName(name);
    inspectSectorByName(name);
  }, 200);
}

export function inspectSectorByName(name) {
  selectedSectorName = name;
  const state = getCurrentMonitoringState();
  renderInspector(state);
}

// ---------------------------------------------------------------------------
// VIEW RENDERERS
// ---------------------------------------------------------------------------
function renderAllViews(state) {
  if (!state) return;

  renderKpis(state);
  renderSectorDropdowns(state);
  renderDashboard(state);
  renderAreaTracing(state.lifecycles || []);
  renderReconciliationTable(state.reconciliation || []);
  renderDiscrepancies(state.discrepancies || []);
  renderReturns(state.returns || []);
  renderLogs(state.logs || []);
  renderInspector(state);
  renderRiverTelemetry();
  renderChatFeed(state.chats || []);

  // Update map
  if (Array.isArray(state.areas) && state.areas.length > 0) {
    renderMonitoringAreas(state.areas);
    if (!selectedSectorName) {
      autoCenterMonitoringMap(state.areas);
    }
  }

  // Update badge counts in left rail
  const countTracing = (state.lifecycles || []).length;
  const countDisc = (state.discrepancies || []).filter(d => !d.escalated).length;
  const elTracing = document.getElementById('navTracingCount');
  const elDisc = document.getElementById('navDiscCount');
  if (elTracing) elTracing.innerText = countTracing;
  if (elDisc) elDisc.innerText = countDisc;
}

function renderKpis(state) {
  const container = document.getElementById('monitorKpiGrid');
  if (!container) return;

  const summary = state.summary || {};
  const dispatched = summary.totalDispatched || 0;
  const received = summary.totalReceived || 0;
  const shortages = summary.activeShortages || 0;
  const ops = summary.activeRescueOps || 0;

  container.innerHTML = `
    <div className="kpi-card tone-indigo">
      <div style="font-size: 26px; font-weight: 800; color: #4338ca;">${dispatched.toLocaleString()}</div>
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Dispatched Units</div>
      <div style="font-size: 10px; color: #0284c7; margin-top: 4px;">🚚 Released from Central Godown</div>
    </div>
    <div className="kpi-card tone-ok">
      <div style="font-size: 26px; font-weight: 800; color: #16a34a;">${received.toLocaleString()}</div>
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Ground Verified Units</div>
      <div style="font-size: 10px; color: #16a34a; margin-top: 4px;">✅ Confirmed by Field Officers</div>
    </div>
    <div className="kpi-card tone-alert">
      <div style="font-size: 26px; font-weight: 800; color: ${shortages > 0 ? '#dc2626' : '#64748b'};">${shortages}</div>
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Shortages / Flags</div>
      <div style="font-size: 10px; color: #dc2626; margin-top: 4px;">⚠️ Discrepancy Escalations</div>
    </div>
    <div className="kpi-card tone-blue">
      <div style="font-size: 26px; font-weight: 800; color: #0284c7;">${ops}</div>
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Field Rescue Ops</div>
      <div style="font-size: 10px; color: #0ea5e9; margin-top: 4px;">🛡️ Multi-Agency NDRF/SDRF</div>
    </div>
  `;
}

function renderSectorDropdowns(state) {
  const lifecycles = state.lifecycles || [];
  const areas = state.areas || [];
  const sectorNames = Array.from(new Set([
    ...lifecycles.map(l => l.area),
    ...areas.map(a => a.name || a.village)
  ])).filter(Boolean);

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

  container.innerHTML = lifecycles.slice(0, 4).map(item => `
    <div className="lifecycle-card anim-card" style="margin-bottom: 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
        <strong style="font-size: 13.5px; color: #0f172a;">${item.area}</strong>
        <span class="lifecycle-pill ${getStagePillClass(item.currentStage)}">${item.currentStage}</span>
      </div>
      <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
        District: <b>${item.district || 'Kamrup'}</b> • Pop: <b>${(item.population || 0).toLocaleString()}</b>
      </div>
      <div style="font-size: 11.5px; line-height: 1.5; background: #f8fafc; padding: 8px 10px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px;">
        <div><b>Allocated:</b> ${item.resourcesAllocated || 'None'}</div>
        <div><b>Dispatched:</b> ${item.resourcesDispatched || 'Pending warehouse processing'}</div>
        <div><b>Ground Status:</b> <span style="color:#16a34a; font-weight:600;">${item.groundVerificationStatus || 'En route'}</span></div>
      </div>
      <div style="display:flex; gap: 8px;">
        <button class="btn-mo" style="flex:1; padding: 5px 8px; font-size: 11px;" onclick="window.focusMapOnSector('${item.area}')">
          <i class="fas fa-crosshairs"></i> Focus on Map
        </button>
        <button class="btn-mo" style="flex:1; padding: 5px 8px; font-size: 11px; background: #0284c7; color:#fff;" onclick="window.switchMonitorTab('tracing', document.querySelector('[data-tab=tracing]')); window.filterTracingArea('${item.area}');">
          Full Tracing →
        </button>
      </div>
    </div>
  `).join('');
}

function getStagePillClass(stage) {
  if (!stage) return 'pill-allocated';
  const s = stage.toLowerCase();
  if (s.includes('restock') || s.includes('return')) return 'pill-restocked';
  if (s.includes('delivered') || s.includes('verified')) return 'pill-verified';
  if (s.includes('transit') || s.includes('dispatch')) return 'pill-in-transit';
  if (s.includes('shortage')) return 'pill-shortage';
  return 'pill-allocated';
}

function renderAreaTracing(lifecycles) {
  const container = document.getElementById('areaTracingContainer');
  if (!container) return;

  const filtered = activeAreaFilter === 'ALL'
    ? lifecycles
    : lifecycles.filter(l => l.area === activeAreaFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 30px;">No lifecycle traces found for selected filter.</div>`;
    return;
  }

  container.innerHTML = filtered.map(item => {
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
              ${item.area} Sector
              <span class="lifecycle-pill ${getStagePillClass(item.currentStage)}">${item.currentStage}</span>
            </h3>
            <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
              District: <b>${item.district || 'Kamrup'}</b> • Severity: <b style="color:#dc2626;">${item.severity || 'Critical'}</b> • Population: <b>${(item.population || 0).toLocaleString()}</b> • River: <b>${item.river || 'Brahmaputra Basin'}</b>
            </div>
          </div>
          <button class="btn-mo" style="padding: 6px 12px; font-size: 11.5px;" onclick="window.focusMapOnSector('${item.area}')">
            <i class="fas fa-map-location-dot"></i> View on GIS Map
          </button>
        </div>

        <!-- 5-STAGE STEPPER -->
        <div class="lifecycle-stepper-wrap">
          <div class="lifecycle-step ${s1 ? 'completed' : 'pending'}">
            <div class="step-circle"><i class="fas fa-map-pin"></i></div>
            <div class="step-title">1. Inundation Pin</div>
            <div class="step-subtitle">Admin Portal</div>
          </div>
          <div class="lifecycle-step ${s2 ? 'completed' : 'pending'}">
            <div class="step-circle"><i class="fas fa-hand-holding-hand"></i></div>
            <div class="step-title">2. DDMA Allocation</div>
            <div class="step-subtitle">Authority Portal</div>
          </div>
          <div class="lifecycle-step ${s3 ? 'completed' : (s2 ? 'active' : 'pending')}">
            <div class="step-circle"><i class="fas fa-truck-fast"></i></div>
            <div class="step-title">3. Godown Dispatch</div>
            <div class="step-subtitle">Central Godown</div>
          </div>
          <div class="lifecycle-step ${s4 ? 'completed' : (s3 ? 'active' : 'pending')}">
            <div class="step-circle"><i class="fas fa-clipboard-check"></i></div>
            <div class="step-title">4. Ground Verified</div>
            <div class="step-subtitle">Ground Officer</div>
          </div>
          <div class="lifecycle-step ${s5 ? 'completed' : (s4 ? 'active' : 'pending')}">
            <div class="step-circle"><i class="fas fa-rotate-left"></i></div>
            <div class="step-title">5. Return Restock</div>
            <div class="step-subtitle">Inventory Restocked</div>
          </div>
        </div>

        <!-- STAGE METADATA CARDS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px; font-size: 11px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <strong style="color: #0284c7; display: block; margin-bottom: 4px;">📍 Step 1: Inundation Alert</strong>
            <div>Status: ${s1 ? 'Active Inundation Pin' : 'Pending'}</div>
            <div>Waterlevel: ${item.waterLevel ? `${item.waterLevel} m` : 'Above Danger'}</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <strong style="color: #d97706; display: block; margin-bottom: 4px;">📋 Step 2: Authority Order</strong>
            <div>Allocated: <b>${item.resourcesAllocated || 'Pending'}</b></div>
            <div>Escort Lead: ${item.designatedLead || 'NDRF 1st Bn'}</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <strong style="color: #0ea5e9; display: block; margin-bottom: 4px;">🚚 Step 3: Warehouse Dispatch</strong>
            <div>Ref: <b>${item.dispatchRef || 'Pending Gate-Pass'}</b></div>
            <div>Supplies: ${item.resourcesDispatched || 'Awaiting Loading'}</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <strong style="color: #16a34a; display: block; margin-bottom: 4px;">✅ Step 4: Field Receipt</strong>
            <div>Status: <b>${item.groundVerificationStatus || 'Pending Intake'}</b></div>
            <div>Sign-off: Field Unit Confirmed</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <strong style="color: #7c3aed; display: block; margin-bottom: 4px;">🔄 Step 5: Post-Op Restock</strong>
            <div>Condition: ${s5 ? 'Units Reconciled to Stock' : (s4 ? 'Cleared for Return' : 'Operation Active')}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderReconciliationTable(records) {
  const tbody = document.getElementById('reconcileTableBody');
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 24px;">No reconciliation ledger records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(r => `
    <tr>
      <td><strong>${r.resource}</strong></td>
      <td><span style="color:#0284c7; font-weight:600; cursor:pointer;" onclick="window.focusMapOnSector('${r.area}')">${r.area}</span></td>
      <td>${r.approved}</td>
      <td>${r.dispatched}</td>
      <td>${r.received}</td>
      <td style="color: ${r.difference === 0 ? '#16a34a' : '#dc2626'}; font-weight: 700;">
        ${r.difference === 0 ? '0 (Matched)' : `-${r.difference} Shortage`}
      </td>
      <td>
        <span class="badge ${r.status === 'Reconciled' ? 'badge-good' : (r.status === 'Shortage Flagged' ? 'badge-damaged' : 'badge-transit')}">
          ${r.status}
        </span>
      </td>
    </tr>
  `).join('');
}

function renderDiscrepancies(discrepancies) {
  const container = document.getElementById('fullDiscrepancyGrid');
  if (!container) return;

  if (discrepancies.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #16a34a; padding: 30px; font-weight:600;">✅ No active supply discrepancies or shortages recorded! All consignments reconciled.</div>`;
    return;
  }

  container.innerHTML = discrepancies.map(d => `
    <div className="audit-card tone-alert anim-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
        <strong style="font-size: 13px; color: #0f172a;">${d.area} • ${d.item}</strong>
        <span class="badge badge-damaged">${d.status}</span>
      </div>
      <div style="font-size: 11.5px; color: #475569; margin-bottom: 8px; line-height: 1.4;">
        <div><b>Issue:</b> ${d.issue}</div>
        <div><b>Priority:</b> <span style="color:#dc2626; font-weight:700;">${d.priority || 'High'}</span></div>
        ${d.notes ? `<div><b>Notes:</b> ${d.notes}</div>` : ''}
      </div>
      <div style="display:flex; justify-content:flex-end; gap: 8px;">
        <button class="btn-mo" style="padding: 4px 10px; font-size: 11px;" onclick="window.focusMapOnSector('${d.area}')">
          <i class="fas fa-location-crosshairs"></i> Sector Map
        </button>
        ${!d.escalated ? `
          <button class="btn-mo" style="background:#dc2626; color:#fff; border-color:#b91c1c; padding: 4px 10px; font-size: 11px;" onclick="window.escalateDiscrepancy('${d.id}', '${d.area}', '${d.issue}')">
            <i class="fas fa-bullhorn"></i> Escalate to Authority
          </button>
        ` : `
          <span style="font-size: 11px; color: #d97706; font-weight: 700; align-self: center;">
            <i class="fas fa-check-circle"></i> Escalated to DC
          </span>
        `}
      </div>
    </div>
  `).join('');
}

export async function escalateDiscrepancy(id, area, issue) {
  showToast(`Escalating discrepancy for ${area} to District Authority...`, 'info');
  await escalateDiscrepancyApi({
    id,
    area,
    issue,
    priority: 'Critical',
    action: 'Executive Authority Audit Clarification'
  });
  showToast(`Discrepancy for ${area} successfully escalated!`, 'success');
}

function renderReturns(returns) {
  const tbody = document.getElementById('returnAuditBody');
  if (!tbody) return;

  if (returns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 24px;">No asset return records logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = returns.map(ret => `
    <tr>
      <td><strong>${ret.resource || ret.item}</strong><br/><small style="color:#64748b;">${ret.area || 'All Sectors'}</small></td>
      <td>${ret.dispatched || 0}</td>
      <td style="color:#16a34a; font-weight:700;">${ret.good || 0} Units</td>
      <td style="color:#d97706; font-weight:700;">${ret.damaged || 0} Units</td>
      <td style="color:#dc2626; font-weight:700;">${ret.missing || 0} Units</td>
      <td>
        <span class="badge ${ret.status === 'Restocked to Physical Stock' ? 'badge-good' : 'badge-transit'}">
          ${ret.status || 'Verified Good Restocked'}
        </span>
      </td>
    </tr>
  `).join('');
}

function renderLogs(logs) {
  const container = document.getElementById('fullActivityLogsGrid');
  if (!container) return;

  if (logs.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 30px;">No activity logs recorded.</div>`;
    return;
  }

  container.innerHTML = logs.map(l => `
    <div className="audit-card tone-indigo anim-card" style="font-size: 11.5px; padding: 10px 14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
        <strong style="color:#0f172a; font-size: 12px;">${l.portal}</strong>
        <span style="color:#64748b; font-size: 10px;">${l.time || 'Live'}</span>
      </div>
      <div style="color: #334155; margin-bottom: 4px;">${l.action}</div>
      <div style="color: #0284c7; font-size: 10.5px;">User: <b>${l.user}</b></div>
    </div>
  `).join('');
}

function renderInspector(state) {
  const container = document.getElementById('inspectorContent');
  if (!container) return;

  if (!selectedSectorName) {
    const lifecycles = state.lifecycles || [];
    if (lifecycles.length > 0) {
      selectedSectorName = lifecycles[0].area;
    }
  }

  if (!selectedSectorName) {
    container.innerHTML = `<div style="color: #64748b; text-align: center; padding: 16px;">Tap any sector to inspect its telemetry.</div>`;
    return;
  }

  const lifecycles = state.lifecycles || [];
  const areaLife = lifecycles.find(l => l.area === selectedSectorName);
  const areas = state.areas || [];
  const areaGeo = areas.find(a => (a.name || a.village) === selectedSectorName);

  const pop = (areaLife && areaLife.population) || (areaGeo && areaGeo.pop) || 0;
  const stage = (areaLife && areaLife.currentStage) || 'Inundation Surveillance';
  const river = (areaGeo && areaGeo.river) || (areaLife && areaLife.river) || 'Brahmaputra Basin';

  container.innerHTML = `
    <div style="background: #f8fafc; border: 1.5px solid #bae6fd; border-radius: 12px; padding: 12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
        <strong style="font-size: 14px; color: #0f172a;">${selectedSectorName}</strong>
        <span class="lifecycle-pill ${getStagePillClass(stage)}">${stage}</span>
      </div>
      <div style="font-size: 11px; color: #475569; line-height: 1.6;">
        <div>👥 Population at Risk: <b>${pop.toLocaleString()} Citizens</b></div>
        <div>🌊 Associated River: <b>${river}</b></div>
        <div>🛡️ Designated Escort: <b>${(areaLife && areaLife.designatedLead) || 'NDRF (1st Bn)'}</b></div>
        <div>📦 Dispatch Ref: <b>${(areaLife && areaLife.dispatchRef) || 'DSP-2026-932'}</b></div>
      </div>
      <div style="margin-top: 10px; display:flex; gap: 6px;">
        <button class="btn-mo" style="flex:1; padding: 5px 8px; font-size: 11px;" onclick="window.focusMapOnSector('${selectedSectorName}')">
          <i class="fas fa-crosshairs"></i> Fly to Map
        </button>
        <button class="btn-mo" style="flex:1; padding: 5px 8px; font-size: 11px; background:#0284c7; color:#fff;" onclick="window.switchMonitorTab('tracing', document.querySelector('[data-tab=tracing]')); window.filterTracingArea('${selectedSectorName}');">
          Trace Lifecycle
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
    const isBreached = r.currentLevel >= r.dangerLevel;
    return `
      <div class="river-telemetry-row">
        <div>
          <strong style="color: #0f172a;">${r.name}</strong>
          <div style="color: #64748b; font-size: 9.5px;">Level: <b>${r.currentLevel}m</b> (Danger: ${r.dangerLevel}m)</div>
        </div>
        <span style="font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 999px; background: ${isBreached ? '#fee2e2' : '#dcfce7'}; color: ${isBreached ? '#b91c1c' : '#15803d'};">
          ${isBreached ? 'DANGER BREACH' : 'PASSABLE'}
        </span>
      </div>
    `;
  }).join('');
}

// ---------------------------------------------------------------------------
// CHAT ENGINE
// ---------------------------------------------------------------------------
export function switchChatChannel(channel, el) {
  activeChatChannel = channel;
  document.querySelectorAll('.channel-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');

  const titleEl = document.getElementById('chatChannelTitle');
  if (titleEl) {
    const channelNames = {
      ground: 'Ground Officer (Field Units)',
      godown: 'Central Godown Manager',
      authority: 'District Authority Control Room',
      admin: 'State Inundation Cell (Admin)'
    };
    titleEl.innerText = `Channel: ${channelNames[channel] || channel}`;
  }

  const state = getCurrentMonitoringState();
  renderChatFeed(state.chats || []);
}

function renderChatFeed(chats = []) {
  const feed = document.getElementById('chatMessagesFeed');
  if (!feed) return;

  const filtered = chats.filter(c => c.channel === activeChatChannel);

  if (filtered.length === 0) {
    feed.innerHTML = `<div style="text-align: center; color: #94a3b8; font-size: 11px; padding: 20px;">No messages in this channel yet. Send an audit clarification note below.</div>`;
    return;
  }

  feed.innerHTML = filtered.map(msg => {
    const isMonitor = (msg.senderRole || '').toLowerCase().includes('monitor') || (msg.senderRole || '').toLowerCase().includes('audit');
    return `
      <div style="
        background: ${isMonitor ? '#e0f2fe' : '#ffffff'};
        border: 1px solid ${isMonitor ? '#7dd3fc' : '#e2e8f0'};
        border-radius: 10px;
        padding: 8px 10px;
        font-size: 11px;
        line-height: 1.4;
      ">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 3px;">
          <strong style="color: ${isMonitor ? '#0369a1' : '#0f172a'}; font-size: 11px;">${msg.sender}</strong>
          <span style="font-size: 9px; color: #94a3b8;">${msg.time || 'Just now'}</span>
        </div>
        <div style="color: #334155; margin-bottom: 4px;">${msg.message}</div>
        ${msg.badge ? `<span style="font-size: 8.5px; font-weight: 700; background: #ede9fe; color: #6d28d9; padding: 1px 5px; border-radius: 4px;">${msg.badge}</span>` : ''}
      </div>
    `;
  }).join('');

  feed.scrollTop = feed.scrollHeight;
}

export function insertQuickChat(text) {
  const input = document.getElementById('chatMessageInput');
  if (input) {
    input.value = text;
    input.focus();
  }
}

export async function sendChatMessage(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('chatMessageInput');
  if (!input || !input.value.trim()) return;

  const msgText = input.value.trim();
  input.value = '';

  await sendMonitoringChatMessage({
    channel: activeChatChannel,
    sender: 'S. N. Bora (Auditor)',
    senderRole: 'State DEOC Monitor',
    message: msgText,
    badge: 'AUDIT NOTE'
  });

  showToast('Audit message sent & logged.', 'success');
}

export function exportAuditReport() {
  showToast('Generating official DEOC Resource Lifecycle Audit Report (PDF/CSV)...', 'info');
  setTimeout(() => {
    showToast('Audit report ready! Complete lifecycle trail exported.', 'success');
  }, 1200);
}
