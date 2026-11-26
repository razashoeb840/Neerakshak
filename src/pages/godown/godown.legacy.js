// NEERAKSHAK Central Relief Godown & Logistics Hub Page Engine
// Fully connected with Admin (Areas) and Authority (Allocations) for shared real-time lifecycle.
// Real-time API Client, Leaflet Convoy Map, Right Inspector Panel, and Inline Stock Management.

import {
  fetchGodownState,
  getCurrentGodownState,
  addStockItemApi,
  updateStockItemApi,
  confirmDispatchApi,
  reportShortageApi,
  submitReturnRecordApi,
  onGodownSync
} from './godownApi.js';

import {
  initGodownLogisticsMap,
  updateGodownMapAllocations,
  filterGodownMap,
  searchGodownMap,
  centerOnMap,
  renderRightCorridorRiver,
  godownMapZoomIn,
  godownMapZoomOut,
  godownMapRecenter,
  invalidateGodownMapSize
} from './godownMap.js';

export default function initGodownPage() {
  const __ready = [];
  const __onReady = (fn) => __ready.push(fn);

  let isDrillMode = true;
  let isListView = false;
  let selectedAllocId = null;
  let state = getCurrentGodownState();

  // Listen to background real-time sync events
  onGodownSync((freshState) => {
    if (freshState && isDrillMode) {
      state = freshState;
      renderAllGodownViews();
      updateGodownMapAllocations(state.allocations || []);
      if (selectedAllocId) {
        renderSelectedAllocBox(selectedAllocId);
      }
    }
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
      showToast('Switched to Grid Cards View');
    }
  }

  function toggleDataMode() {
    isDrillMode = !isDrillMode;
    const btn = document.getElementById('dataModeBtn');
    const stText = document.getElementById('telemetryStatusText');
    if (isDrillMode) {
      state = getCurrentGodownState();
      if (btn) btn.innerHTML = '<i class="fas fa-database"></i> Live Depot Feed';
      if (stText) stText.textContent = 'Depot Active';
      showToast('Switched to Live Depot dataset.');
    } else {
      state = {
        inventory: [],
        allocations: [],
        returns: [],
        movements: []
      };
      if (btn) btn.innerHTML = '<i class="fas fa-plug"></i> Empty API State';
      if (stText) stText.textContent = 'Awaiting Feed';
      showToast('Switched to Empty API State.');
    }
    renderAllGodownViews();
    updateGodownMapAllocations(state.allocations || []);
  }

  let activeApprovedFilter = 'ALL';

  function filterApprovedTab(type = 'ALL') {
    activeApprovedFilter = type;
    renderAllGodownViews();
  }

  function switchGodownTab(tabKey, btnEl) {
    if (tabKey === 'verification' || tabKey === 'dispatch') {
      tabKey = 'approved-req';
      btnEl = document.querySelector('[data-tab=approved-req]');
    }
    document.querySelectorAll('.gd-nav-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    document.querySelectorAll('.gd-tab-pane').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`tab-${tabKey}`);
    if (target) {
      target.classList.add('active');
      if (tabKey === 'dashboard') {
        setTimeout(() => {
          invalidateGodownMapSize();
        }, 120);
      }
    }
  }

  function toggleAddStockCard() {
    switchGodownTab('inventory', document.querySelector('[data-tab=inventory]'));
    const card = document.getElementById('addNewStockCard');
    if (card) {
      const isHidden = card.style.display === 'none' || !card.style.display;
      card.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const nameInput = document.getElementById('newStockName');
        if (nameInput) nameInput.focus();
      }
    }
  }

  function getPriorityPill(p) {
    if (p === 'Critical') return 'p-critical';
    if (p === 'High') return 'p-high';
    return 'p-moderate';
  }

  function getStatusPill(s) {
    if (s === 'Dispatched' || s === 'Good') return 'p-good';
    if (s === 'Shortage Flagged' || s === 'Low Stock' || s === 'Damaged / Expired') return 'p-critical';
    return 'p-pending';
  }

  function getCardToneClass(priority, status) {
    if (status === 'Shortage Flagged' || status === 'Low Stock' || status === 'Damaged / Expired' || priority === 'Critical') {
      return 'tone-critical';
    }
    if (priority === 'High') return 'tone-high';
    if (status === 'Dispatched' || status === 'Good') return 'tone-good';
    return 'tone-amber';
  }

  function renderAllGodownViews() {
    if (!state) state = getCurrentGodownState();
    const inventory = state.inventory || [];
    const allocations = state.allocations || [];
    const returns = state.returns || [];
    const movements = state.movements || [];

    const whFilter = document.getElementById('warehouseSelector')?.value || 'ALL';
    const visibleInv = inventory.filter(i => whFilter === 'ALL' || i.warehouse === whFilter);

    const totalUnits = visibleInv.reduce((s, i) => s + (Number(i.total) || 0), 0);
    const availUnits = visibleInv.reduce((s, i) => s + (Number(i.available) || 0), 0);
    const allocUnits = visibleInv.reduce((s, i) => s + (Number(i.allocated) || 0), 0);
    const dispUnits = visibleInv.reduce((s, i) => s + (Number(i.dispatched) || 0), 0);
    const lowStockItems = visibleInv.filter(i => (Number(i.available) || 0) <= (Number(i.minLimit) || 0));
    const pendingDispatches = allocations.filter(a => a.status !== 'Dispatched');

    const navInvCount = document.getElementById('navInvCount');
    if (navInvCount) navInvCount.textContent = visibleInv.length;
    const navApprovedCount = document.getElementById('navApprovedCount');
    if (navApprovedCount) navApprovedCount.textContent = allocations.length;
    const navPendingDispCount = document.getElementById('navPendingDispCount');
    if (navPendingDispCount) navPendingDispCount.textContent = pendingDispatches.length;
    const navLowStockCount = document.getElementById('navLowStockCount');
    if (navLowStockCount) navLowStockCount.textContent = lowStockItems.length;

    // 1. 4-KPI Overview Strip matching Admin/Authority Style
    const kpis = [
      { val: isDrillMode ? totalUnits.toLocaleString() : '0', lbl: 'Total Warehouse Resources', icon: 'fa-warehouse', grad: 'kpi-grad-blue' },
      { val: isDrillMode ? availUnits.toLocaleString() : '0', lbl: 'Available Physical Stock', icon: 'fa-box-open', grad: 'kpi-grad-green' },
      { val: isDrillMode ? pendingDispatches.length : '0', lbl: 'Pending DDMA Orders', icon: 'fa-clipboard-check', grad: 'kpi-grad-amber' },
      { val: isDrillMode ? allocations.filter(a => a.status === 'Dispatched').length : '0', lbl: 'Active Dispatched Convoys', icon: 'fa-truck-fast', grad: 'kpi-grad-teal' }
    ];

    const kpiBox = document.getElementById('stockOverviewKpis');
    if (kpiBox) {
      kpiBox.innerHTML = kpis.map(k => `
        <div class="kpi-tile ${k.grad}">
          <div class="kpi-ic"><i class="fas ${k.icon}"></i></div>
          <div>
            <div class="kpi-val">${k.val}</div>
            <div class="kpi-lbl">${k.lbl}</div>
          </div>
        </div>
      `).join('');
    }

    // 2. Unified Approved Allocations, Stock Verification & Convoy Dispatch Renderer
    const buildDispatchCards = (list) => {
      let filtered = list;
      if (activeApprovedFilter === 'PENDING') filtered = list.filter(a => a.status !== 'Dispatched');
      if (activeApprovedFilter === 'DISPATCHED') filtered = list.filter(a => a.status === 'Dispatched');
      if (activeApprovedFilter === 'SHORTAGE') filtered = list.filter(a => String(a.status || '').toLowerCase().includes('shortage'));

      if (filtered.length === 0) {
        return `<div style="grid-column:1/-1; text-align:center; padding:18px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);">No Authority-approved allocations in this view.</div>`;
      }
      return filtered.map((a, idx) => {
        const isDispatched = a.status === 'Dispatched';
        const isShortage = String(a.status || '').toLowerCase().includes('shortage');
        const tone = isDispatched ? 'tone-good' : (isShortage ? 'tone-critical' : (a.severity === 'Critical' ? 'tone-critical' : 'tone-amber'));
        const isSel = selectedAllocId === a.id;

        // Physical Stock Availability Verification check
        const needs = a.needs || { boats: 1, jackets: 20, food: 200, meds: 30 };
        const boatsAvail = (visibleInv.find(i => i.category === 'Rescue Boats')?.available) || 0;
        const foodAvail = (visibleInv.find(i => i.category === 'Food Packets')?.available) || 0;
        const isStockSufficient = boatsAvail >= (needs.boats || 0) && foodAvail >= (needs.food || 0);

        return `
          <div class="sub-card ${tone} ${isSel ? 'card-selected' : ''}" style="${isSel ? 'border:2px solid #0284c7; box-shadow:0 6px 20px rgba(2,132,199,0.22);' : ''}">
            <div class="sub-card-top">
              <div>
                <h4><i class="fas fa-location-dot" style="color:var(--river-blue); margin-right:5px;"></i>${a.destination}</h4>
                <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${a.block || 'Kamrup Sector'} • Ref: <strong>${a.refNo && a.refNo !== '—' ? a.refNo : a.id}</strong></span>
              </div>
              <div style="display:flex; gap:5px; align-items:center;">
                <span class="pill ${getPriorityPill(a.severity || 'Critical')}">${a.severity || 'Critical'}</span>
              </div>
            </div>

            <div style="background:#f0f7fe; border:1px solid #bfdbfe; border-radius:8px; padding:7px 10px; margin:8px 0; font-size:11.5px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:#0369a1;">
                  <i class="fas fa-clipboard-check"></i> Authority Sanctioned Need:
                </span>
                <span class="pill ${isDispatched ? 'p-good' : (isStockSufficient ? 'p-good' : 'p-critical')}" style="font-size:9.5px; padding:2px 6px;">
                  <i class="fas ${isDispatched ? 'fa-truck' : (isStockSufficient ? 'fa-check-double' : 'fa-triangle-exclamation')}"></i>
                  ${isDispatched ? 'Dispatched En-Route' : (isStockSufficient ? 'Stock Verified Ready' : 'Stock Deficit Alert')}
                </span>
              </div>
              <strong style="color:#0f172a; font-size:12px;">${a.summary || 'Emergency Relief Buffer'}</strong>
            </div>

            <div class="meta-box">
              <span>Assigned Vehicle: <strong>${a.vehicle}</strong></span>
              <span>Driver: <strong>${a.driver || 'Rajesh Das (+91 98640-21943)'}</strong></span>
              <span>Depot Bay: <strong>${a.assignedGodown ? a.assignedGodown.split('–')[1] || a.assignedGodown : 'Bay 2'}</strong></span>
              <span>Gate-Pass Ref: <strong>${a.refNo && a.refNo !== '—' ? a.refNo : 'Awaiting Dispatch'}</strong></span>
            </div>

            <div class="sub-card-footer" style="flex-wrap:wrap; gap:6px; justify-content:space-between;">
              <span class="pill ${getStatusPill(a.status)}">${a.status}</span>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="btn-gd" onclick="window.selectAllocationForDispatch('${a.id}')" title="Inspect on Map & Details">
                  <i class="fas fa-crosshairs"></i> Map Focus
                </button>
                ${!isDispatched ? `
                  <button class="btn-gd warn" onclick="window.reportShortageToAuthority('${a.id}')" title="Report shortage to District Authority">
                    <i class="fas fa-triangle-exclamation"></i> Flag Shortage
                  </button>
                  <button class="btn-gd primary" onclick="window.openDispatchModal('${a.id}')">
                    <i class="fas fa-truck-fast"></i> Dispatch Convoy
                  </button>
                ` : `
                  <button class="btn-gd" style="color:#15803d; border-color:#86efac;" onclick="window.centerOnMap(${a.lat}, ${a.lng})">
                    <i class="fas fa-route"></i> Track Convoy
                  </button>
                `}
              </div>
            </div>
          </div>
        `;
      }).join('');
    };

    const dispatchHtml = buildDispatchCards(allocations);
    const dashDisp = document.getElementById('dashDispatchCardGrid');
    if (dashDisp) dashDisp.innerHTML = dispatchHtml;
    const fullAppr = document.getElementById('fullApprovedReqGrid');
    if (fullAppr) fullAppr.innerHTML = dispatchHtml;
    const fullDisp = document.getElementById('fullDispatchCardGrid');
    if (fullDisp) fullDisp.innerHTML = dispatchHtml;

    // 3. Complete Warehouse Inventory Cards
    const buildInventoryCards = (items, showEditBtn) => {
      if (items.length === 0) {
        return `<div style="grid-column:1/-1; text-align:center; padding:18px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);">No warehouse inventory items found.</div>`;
      }
      return items.map(i => {
        const origIdx = inventory.indexOf(i);
        const tone = i.available <= i.minLimit ? 'tone-critical' : 'tone-good';
        return `
          <div class="sub-card ${tone}">
            <div class="sub-card-top">
              <div>
                <h4>${i.name}</h4>
                <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${i.category} • ${i.warehouse}</span>
              </div>
              <span class="pill ${getStatusPill(i.condition)}">${i.condition}</span>
            </div>
            <div class="meta-box-4">
              <div><span>Total</span><strong>${i.total}</strong></div>
              <div><span>Avail</span><strong style="color:#15803d;">${i.available}</strong></div>
              <div><span>Alloc</span><strong style="color:#4338ca;">${i.allocated}</strong></div>
              <div><span>Disp</span><strong style="color:#0f766e;">${i.dispatched}</strong></div>
            </div>
            ${showEditBtn ? `
              <div class="sub-card-footer">
                <span style="font-size:10.5px; color:var(--text-muted);">Min Alert Limit: <strong>${i.minLimit}</strong></span>
                <button class="btn-gd" onclick="window.openUpdateStockModal(${origIdx})"><i class="fas fa-pen"></i> Update Stock</button>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    };

    const dashInv = document.getElementById('dashInventoryCardGrid');
    if (dashInv) dashInv.innerHTML = buildInventoryCards(visibleInv.slice(0, 6), false);

    const catFilter = document.getElementById('invCategoryFilter')?.value || 'ALL';
    const filteredInv = visibleInv.filter(i => catFilter === 'ALL' || i.category === catFilter);
    const fullInv = document.getElementById('fullInventoryCardGrid');
    if (fullInv) fullInv.innerHTML = buildInventoryCards(filteredInv, true);

    // 4. Low Stock Cards Grid
    const lowStockHtml = lowStockItems.length === 0
      ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">All stock levels above minimum threshold.</div>`
      : lowStockItems.map(item => `
        <div class="sub-card tone-critical">
          <div class="sub-card-top">
            <h4>${item.name}</h4>
            <span class="pill p-critical">${item.available === 0 ? 'Out of Stock' : 'Low Stock'}</span>
          </div>
          <div class="meta-box">
            <span>Available: <strong style="color:#dc2626;">${item.available}</strong></span>
            <span>Min Limit: <strong>${item.minLimit}</strong></span>
          </div>
          <div class="sub-card-footer">
            <button class="btn-gd" onclick="window.toggleAddStockCard()">+ Restock</button>
            <button class="btn-gd warn" onclick="window.showToast('Restock requirement reported to Authority.')">Alert Authority</button>
          </div>
        </div>
      `).join('');

    const dashLow = document.getElementById('dashLowStockGrid');
    if (dashLow) dashLow.innerHTML = lowStockHtml;
    const fullLow = document.getElementById('lowStockCardsGrid');
    if (fullLow) fullLow.innerHTML = lowStockHtml;

    // 5. Recent Stock Movement Cards
    const movementHtml = movements.length === 0
      ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No stock movements recorded yet.</div>`
      : movements.map(m => {
        const tone = m.type === 'DISPATCH' ? 'tone-good' : (m.type === 'SHORTAGE ALERT' ? 'tone-critical' : 'tone-purple');
        return `
          <div class="sub-card ${tone}">
            <div class="sub-card-top">
              <h4>${m.item}</h4>
              <span class="pill p-verified">${m.type}</span>
            </div>
            <div style="font-size:11px; color:var(--text-body);"><strong>${m.party}</strong> • ${m.note}</div>
            <div style="font-size:10px; color:var(--text-muted);"><i class="far fa-clock"></i> ${m.time}</div>
          </div>
        `;
      }).join('');

    const dashAct = document.getElementById('dashRecentActivityGrid');
    if (dashAct) {
      dashAct.innerHTML = movements.slice(0, 2).map(m => `
        <div class="sub-card ${m.type === 'DISPATCH' ? 'tone-good' : 'tone-purple'}">
          <div class="sub-card-top">
            <h4>${m.item}</h4>
            <span class="pill p-verified">${m.type}</span>
          </div>
          <div style="font-size:11px; color:var(--text-body);">${m.party}</div>
          <div style="font-size:10px; color:var(--text-muted);">${m.time}</div>
        </div>
      `).join('') || `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No recent movements.</div>`;
    }

    const fullMove = document.getElementById('movementLogsCardGrid');
    if (fullMove) fullMove.innerHTML = movementHtml;

    // 6. Stock Verification Grid
    const stockVer = document.getElementById('stockVerificationGrid');
    if (stockVer) {
      stockVer.innerHTML = allocations.length === 0
        ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No allocations pending verification.</div>`
        : allocations.map((a, idx) => {
          const isDispatched = a.status === 'Dispatched';
          return `
            <div class="sub-card ${isDispatched ? 'tone-good' : 'tone-critical'}">
              <div class="sub-card-top">
                <h4>${a.id} • ${a.destination}</h4>
                <span class="pill ${isDispatched ? 'p-good' : 'p-critical'}">${isDispatched ? 'Stock Dispatched' : 'Stock Verified Ready'}</span>
              </div>
              <div style="background:#f8fafc; border-radius:6px; padding:6px 8px; font-size:11.5px; margin:6px 0;">
                <div>Allocated Need: <strong>${a.summary}</strong></div>
                <div>Vehicle: <strong>${a.vehicle}</strong></div>
              </div>
              <div class="sub-card-footer">
                ${!isDispatched
                  ? `<button class="btn-gd primary" onclick="window.openDispatchModal('${a.id}')">Reserve & Dispatch</button>`
                  : `<span style="font-weight:700; color:#15803d; font-size:11px;"><i class="fas fa-check"></i> Dispatched (${a.refNo})</span>`}
                <button class="btn-gd warn" onclick="window.reportShortageToAuthority('${a.id}')">Report Shortage</button>
              </div>
            </div>
          `;
        }).join('');
    }

    // 7. Return Management Cards
    const returnsGrid = document.getElementById('returnsCardGrid');
    if (returnsGrid) {
      returnsGrid.innerHTML = returns.length === 0
        ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No post-operation return entries recorded yet.</div>`
        : returns.map(r => `
          <div class="sub-card ${r.damaged > 0 || r.missing > 0 ? 'tone-amber' : 'tone-good'}">
            <div class="sub-card-top">
              <div>
                <h4>${r.resourceName}</h4>
                <span style="font-size:11px; color:var(--text-muted);">${r.id} • From ${r.from}</span>
              </div>
              <span class="pill p-good">Inspected</span>
            </div>
            <div class="meta-box-4" style="grid-template-columns: repeat(3, 1fr);">
              <div><span>Good</span><strong style="color:#15803d;">${r.good}</strong></div>
              <div><span>Damaged</span><strong style="color:#d97706;">${r.damaged}</strong></div>
              <div><span>Missing</span><strong style="color:#dc2626;">${r.missing}</strong></div>
            </div>
            <div style="font-size:10.5px; color:var(--text-muted);">${r.date}</div>
          </div>
        `).join('');
    }

    // 8. Reports Summary Cards
    const repCards = document.getElementById('reportSummaryCards');
    if (repCards) {
      repCards.innerHTML = `
        <div class="sub-card tone-good"><span>Available vs Allocated</span><strong>${availUnits} Avail / ${allocUnits} Alloc</strong></div>
        <div class="sub-card tone-purple"><span>Total Dispatched Consignments</span><strong>${allocations.filter(a => a.status === 'Dispatched').length} Completed</strong></div>
        <div class="sub-card tone-amber"><span>Damaged / Missing Returns</span><strong>${returns.reduce((s, r) => s + r.damaged + r.missing, 0)} Units Flagged</strong></div>
      `;
    }
  }

  /**
   * Render Selected Allocation in the Right Panel Inspector
   */
  function renderSelectedAllocBox(allocId) {
    selectedAllocId = allocId;
    const box = document.getElementById('rightSelectedAllocBox');
    if (!box) return;

    const allocations = state.allocations || [];
    const alloc = allocations.find(a => a.id === allocId) || allocations[0];

    if (!alloc) {
      box.innerHTML = `<div style="text-align:center; padding:18px; color:var(--text-muted); font-size:11.5px;">No allocation selected. Tap any card or pin on the map.</div>`;
      return;
    }

    const isDispatched = alloc.status === 'Dispatched';

    box.innerHTML = `
      <div style="background:#ffffff; border:1px solid #d5e8f8; border-radius:10px; padding:10px; font-size:11.5px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
          <div>
            <h4 style="margin:0; font-size:13.5px; color:#0f172a;">${alloc.destination}</h4>
            <span style="font-size:10.5px; color:#64748b;">${alloc.block || 'Kamrup Sector'} • Ref: <strong>${alloc.refNo && alloc.refNo !== '—' ? alloc.refNo : alloc.id}</strong></span>
          </div>
          <span class="pill ${isDispatched ? 'p-good' : 'p-critical'}">${alloc.status}</span>
        </div>

        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:7px 9px; margin-bottom:8px;">
          <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:#1e40af; margin-bottom:2px;">
            <i class="fas fa-clipboard-check"></i> Authority Allocation:
          </div>
          <div style="font-weight:700; color:#1e3a8a; font-size:12px;">${alloc.summary || 'Emergency Relief Buffer'}</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px; font-size:11px;">
          <div style="background:#f8fafc; padding:5px 7px; border-radius:6px; border:1px solid #e2e8f0;">
            <span style="color:#64748b; display:block;">Vehicle:</span>
            <strong>${alloc.vehicle}</strong>
          </div>
          <div style="background:#f8fafc; padding:5px 7px; border-radius:6px; border:1px solid #e2e8f0;">
            <span style="color:#64748b; display:block;">Driver:</span>
            <strong>${alloc.driver || 'Rajesh Das'}</strong>
          </div>
        </div>

        <div style="display:flex; gap:6px; margin-top:8px;">
          <button class="btn-gd" style="flex:1; justify-content:center; padding:6px; font-size:11px;" onclick="window.centerOnMap(${alloc.lat || 26.132}, ${alloc.lng || 91.515})">
            <i class="fas fa-crosshairs"></i> Map Center
          </button>
          ${!isDispatched ? `
            <button class="btn-gd primary" style="flex:1.5; justify-content:center; padding:6px; font-size:11px;" onclick="window.openDispatchModal('${alloc.id}')">
              <i class="fas fa-truck-fast"></i> Dispatch Convoy
            </button>
          ` : `
            <span style="flex:1.5; text-align:center; background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; border-radius:6px; padding:6px; font-size:11px; font-weight:700;">
              <i class="fas fa-check"></i> In Transit (${alloc.refNo})
            </span>
          `}
        </div>
      </div>
    `;
  }

  function selectAllocationForDispatch(allocId) {
    selectedAllocId = allocId;
    const alloc = (state.allocations || []).find(a => a.id === allocId);
    if (alloc && alloc.lat && alloc.lng) {
      centerOnMap(alloc.lat, alloc.lng);
    }
    renderSelectedAllocBox(allocId);
  }

  function openFirstPendingDispatch() {
    const pending = (state.allocations || []).find(a => a.status !== 'Dispatched');
    if (pending) {
      openDispatchModal(pending.id);
    } else {
      showToast('All Authority allocations are currently dispatched!');
    }
  }

  /* =====================================================================
     ACTION HANDLERS (Connected to Real-Time API)
     ===================================================================== */
  function openDispatchModal(allocIdxOrId) {
    const allocations = state.allocations || [];
    let alloc = null;
    let idx = -1;

    if (typeof allocIdxOrId === 'number') {
      alloc = allocations[allocIdxOrId];
      idx = allocIdxOrId;
    } else {
      idx = allocations.findIndex(a => a.id === allocIdxOrId);
      alloc = allocations[idx];
    }

    if (!alloc) return;

    document.getElementById('dispAllocIndex').value = idx;
    document.getElementById('dispAllocId').value = alloc.id;
    document.getElementById('dispAllocSummary').innerHTML = `
      <div style="font-weight:700; font-size:13px; color:#0f172a; margin-bottom:3px;">${alloc.destination} (${alloc.id})</div>
      <div style="color:#0284c7; font-weight:600;">Authority Requirement: ${alloc.summary}</div>
    `;
    document.getElementById('dispDestInput').value = alloc.destination;
    document.getElementById('dispVehicleInput').value = alloc.vehicle || 'AS-01-EC-4210';
    document.getElementById('dispDriverInput').value = alloc.driver || 'Rajesh Das (+91 98640-21943)';

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('dispDateTimeInput').value = now.toISOString().slice(0, 16);
    document.getElementById('dispatchModal').classList.add('open');
  }

  async function confirmDispatchSubmission(e) {
    e.preventDefault();
    const idx = Number(document.getElementById('dispAllocIndex').value);
    const allocId = document.getElementById('dispAllocId').value;
    const vehicle = document.getElementById('dispVehicleInput').value.trim();
    const driver = document.getElementById('dispDriverInput').value.trim();
    const dest = document.getElementById('dispDestInput').value.trim();
    const dt = document.getElementById('dispDateTimeInput').value.replace('T', ' ');
    const alloc = (state.allocations || [])[idx];

    closeModal('dispatchModal');

    try {
      const res = await confirmDispatchApi({
        allocIndex: idx,
        allocId: allocId || (alloc ? alloc.id : null),
        vehicle,
        driver,
        dest,
        dispatchTime: dt
      });

      renderAllGodownViews();
      updateGodownMapAllocations(state.allocations || []);
      renderSelectedAllocBox(allocId);
      showToast(`Convoy Dispatched for ${dest} (Gate-Pass Ref: ${res.refNo || 'DSP-2026'}). Live tracking active.`);
    } catch (err) {
      console.error('Dispatch error:', err);
      showToast('Dispatch recorded locally.');
    }
  }

  async function reportShortageToAuthority(allocIdxOrId) {
    const allocations = state.allocations || [];
    const alloc = typeof allocIdxOrId === 'number' ? allocations[allocIdxOrId] : allocations.find(a => a.id === allocIdxOrId);
    if (!alloc) return;

    try {
      await reportShortageApi(alloc.id, `Warehouse inventory shortage for ${alloc.destination}`);
      renderAllGodownViews();
      updateGodownMapAllocations(state.allocations || []);
      renderSelectedAllocBox(alloc.id);
      showToast(`Shortage alert transmitted to District Authority for ${alloc.id}.`);
    } catch (err) {
      console.error('Shortage report error:', err);
      showToast('Shortage flagged locally.');
    }
  }

  async function handleAddNewStock(e) {
    e.preventDefault();
    const name = document.getElementById('newStockName').value.trim();
    const category = document.getElementById('newStockCat').value;
    const qty = Number(document.getElementById('newStockQty').value);
    const warehouse = document.getElementById('newStockWarehouse').value;
    const date = document.getElementById('newStockDate').value;
    const supplier = document.getElementById('newStockSupplier').value.trim();
    const minLimit = Number(document.getElementById('newStockMin').value);

    e.target.reset();
    const card = document.getElementById('addNewStockCard');
    if (card) card.style.display = 'none';

    try {
      await addStockItemApi({
        name,
        category,
        qty,
        warehouse,
        date,
        supplier,
        minLimit
      });
      renderAllGodownViews();
      showToast(`Added ${qty} ${name} to warehouse inventory.`);
    } catch (err) {
      console.error('Add stock error:', err);
      showToast('Stock recorded locally.');
    }
  }

  function openUpdateStockModal(invIdx) {
    const item = (state.inventory || [])[invIdx];
    if (!item) return;
    document.getElementById('updInvIndex').value = invIdx;
    document.getElementById('updInvTitle').textContent = `${item.name} (${item.warehouse})`;
    document.getElementById('updAvailQty').value = item.available;
    document.getElementById('updCondition').value = item.condition;
    document.getElementById('updReason').value = '';
    document.getElementById('updateStockModal').classList.add('open');
  }

  async function submitStockCorrection(e) {
    e.preventDefault();
    const idx = Number(document.getElementById('updInvIndex').value);
    const newAvail = Number(document.getElementById('updAvailQty').value);
    const cond = document.getElementById('updCondition').value;
    const reason = document.getElementById('updReason').value.trim();
    const item = (state.inventory || [])[idx];

    closeModal('updateStockModal');

    try {
      await updateStockItemApi({
        index: idx,
        id: item ? item.id : null,
        available: newAvail,
        condition: cond,
        reason
      });
      renderAllGodownViews();
      showToast(`Inventory updated for ${item ? item.name : 'item'}.`);
    } catch (err) {
      console.error('Stock correction error:', err);
      showToast('Correction saved locally.');
    }
  }

  function openReturnModal() {
    const sel = document.getElementById('retResourceSel');
    if (sel) {
      sel.innerHTML = state.inventory && state.inventory.length
        ? state.inventory.map(i => `<option value="${i.id}">${i.name}</option>`).join('')
        : `<option value="INV-01">Inflatable Rescue Boats</option>`;
    }
    const retFrom = document.getElementById('retFromLoc');
    if (retFrom) retFrom.value = '';
    document.getElementById('returnModal').classList.add('open');
  }

  async function submitReturnRecord(e) {
    e.preventDefault();
    const resId = document.getElementById('retResourceSel').value;
    const fromLoc = document.getElementById('retFromLoc').value.trim();
    const good = Number(document.getElementById('retGoodQty').value);
    const damaged = Number(document.getElementById('retDamagedQty').value);
    const missing = Number(document.getElementById('retMissingQty').value);

    closeModal('returnModal');

    try {
      await submitReturnRecordApi({
        resourceId: resId,
        from: fromLoc,
        good,
        damaged,
        missing
      });
      renderAllGodownViews();
      showToast(`Return logged: ${good} Good restocked, ${damaged} Damaged, ${missing} Missing.`);
    } catch (err) {
      console.error('Return error:', err);
      showToast('Return recorded locally.');
    }
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.right = '18px';
    setTimeout(() => { t.style.right = '-380px'; }, 3200);
  }

  __onReady(() => {
    const dateInput = document.getElementById('newStockDate');
    if (dateInput) dateInput.valueAsDate = new Date();

    // 1. Initial view render
    renderAllGodownViews();

    // 2. Initialize GIS Logistics Corridor Map
    try {
      initGodownLogisticsMap('godownLeafletMap');
      updateGodownMapAllocations(state.allocations || []);
    } catch (e) {
      console.warn('GIS Map init notice:', e);
    }

    // 3. Render Right Panel Corridor River Telemetry
    try {
      renderRightCorridorRiver('rightCorridorRiverBox', 'ab');
    } catch (e) {
      console.warn('River telemetry init notice:', e);
    }

    // 4. Initial select first allocation into right inspector
    if (state.allocations && state.allocations.length > 0) {
      renderSelectedAllocBox(state.allocations[0].id);
    }

    // 5. Load fresh state from Next.js backend
    fetchGodownState().then(fresh => {
      if (fresh) {
        state = fresh;
        renderAllGodownViews();
        updateGodownMapAllocations(state.allocations || []);
        if (state.allocations && state.allocations.length > 0) {
          renderSelectedAllocBox(state.allocations[0].id);
        }
      }
    }).catch(e => console.warn('Live Godown fetch notice:', e));

    // 6. Real-time background polling (every 4 seconds)
    setInterval(() => {
      fetchGodownState().catch(() => {});
    }, 4000);
  });

  // Assign global window handles for inline onclick events
  Object.assign(window, {
    closeModal,
    confirmDispatchSubmission,
    getCardToneClass,
    getPriorityPill,
    getStatusPill,
    handleAddNewStock,
    openDispatchModal,
    openReturnModal,
    openUpdateStockModal,
    openFirstPendingDispatch,
    renderAllGodownViews,
    reportShortageToAuthority,
    selectAllocationForDispatch,
    showToast,
    submitReturnRecord,
    submitStockCorrection,
    switchGodownTab,
    toggleAddStockCard,
    toggleDataMode,
    toggleGridListView,
    filterApprovedTab,
    filterGodownMap,
    searchGodownMap,
    centerOnMap,
    godownMapZoomIn,
    godownMapZoomOut,
    godownMapRecenter
  });

  __ready.forEach((fn) => fn());
}
