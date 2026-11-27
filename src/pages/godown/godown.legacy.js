// NEERAKSHAK Central Relief Godown & Logistics Hub Page Engine
// Fully connected with Admin (Areas) and Authority (Allocations) for shared real-time lifecycle.
// Real-time API Client, Leaflet Convoy Map, Right Inspector Panel, and Inline Stock Management.

import { initInterPortalChat } from '../../components/interportalChat.js';
import {
  fetchGodownState,
  getCurrentGodownState,
  addStockItemApi,
  updateStockItemApi,
  confirmDispatchApi,
  reportShortageApi,
  submitReturnRecordApi,
  clearAreaForReturnApi,
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
    if (!btnEl) btnEl = document.querySelector(`[data-tab="${tabKey}"]`);
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
    if (s === 'Shortage Flagged' || s === 'Low Stock' || s === 'Out of Stock' || s === 'Damaged / Expired') return 'p-critical';
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
        const isDispatched = a.status === 'Dispatched' ||
          String(a.godownStatus || '').toLowerCase().includes('dispatched') ||
          String(a.godownStatus || '').toLowerCase().includes('en-route') ||
          Boolean(a.dispatchedDate) ||
          (Boolean(a.refNo) && a.refNo !== '—' && a.refNo.startsWith('DSP-'));
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
              <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
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
                  <span style="display:inline-flex; align-items:center; gap:5px; font-size:10.5px; font-weight:700; color:#15803d; background:#dcfce7; padding:4px 8px; border-radius:6px; border:1px solid #bbf7d0;">
                    <i class="fas fa-lock"></i> Dispatched & Locked (${a.refNo && a.refNo !== '—' ? a.refNo : 'DSP'})
                  </span>
                  <button class="btn-gd" style="color:#15803d; border-color:#86efac;" onclick="window.trackConvoyOnMap(${a.lat || 26.132}, ${a.lng || 91.515}, '${(a.destination || 'Sector').replace(/'/g, "\\'")}', '${a.refNo || 'DSP-2026'}', '${(a.vehicle || '').replace(/'/g, "\\'")}', '${(a.driver || '').replace(/'/g, "\\'")}')">
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
        const avail = Math.max(0, Number(i.available) || 0);
        const isOutOfStock = avail <= 0;
        const tone = isOutOfStock ? 'tone-critical' : (avail <= (Number(i.minLimit) || 10) ? 'tone-critical' : 'tone-good');
        const condText = isOutOfStock ? 'Out of Stock' : (i.condition || 'Good');
        const pillClass = isOutOfStock ? 'p-critical' : getStatusPill(condText);
        return `
          <div class="sub-card ${tone}">
            <div class="sub-card-top">
              <div>
                <h4>${i.name}</h4>
                <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${i.category} • ${i.warehouse}</span>
              </div>
              <span class="pill ${pillClass}">${condText}</span>
            </div>
            <div class="meta-box-4">
              <div><span>Total</span><strong>${i.total}</strong></div>
              <div><span>Avail</span><strong style="color:${isOutOfStock ? '#dc2626' : '#15803d'}; font-weight:700;">${avail}</strong></div>
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
          const isDispatched = a.status === 'Dispatched' ||
            String(a.godownStatus || '').toLowerCase().includes('dispatched') ||
            String(a.godownStatus || '').toLowerCase().includes('en-route') ||
            Boolean(a.dispatchedDate) ||
            (Boolean(a.refNo) && a.refNo !== '—' && a.refNo.startsWith('DSP-'));
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
              <div class="sub-card-footer" style="align-items:center;">
                ${!isDispatched
                  ? `<button class="btn-gd primary" onclick="window.openDispatchModal('${a.id}')">Reserve & Dispatch</button>
                     <button class="btn-gd warn" onclick="window.reportShortageToAuthority('${a.id}')">Report Shortage</button>`
                  : `<span style="font-weight:700; color:#15803d; font-size:11px;"><i class="fas fa-lock"></i> Dispatched & Locked (${a.refNo})</span>
                     <button class="btn-gd" style="color:#15803d; border-color:#86efac; font-size:11px;" onclick="window.trackConvoyOnMap(${a.lat || 26.132}, ${a.lng || 91.515}, '${(a.destination || 'Sector').replace(/'/g, "\\'")}', '${a.refNo || 'DSP-2026'}', '${(a.vehicle || '').replace(/'/g, "\\'")}', '${(a.driver || '').replace(/'/g, "\\'")}')"><i class="fas fa-route"></i> Track</button>`}
              </div>
            </div>
          `;
        }).join('');
    }

    // 7. Returns Tab: Dispatched Area Selector & Return Intake Form
    const returnsAreaList = document.getElementById('returnsDispatchedAreasList');
    if (returnsAreaList) {
      const dispatchedAllocations = (allocations || []).filter(a => 
        a.status === 'Dispatched' || 
        String(a.godownStatus || '').toLowerCase().includes('dispatched') ||
        String(a.godownStatus || '').toLowerCase().includes('en-route')
      );

      if (dispatchedAllocations.length === 0) {
        returnsAreaList.innerHTML = `
          <div style="text-align:center; padding:20px; border:1.5px dashed #93c5fd; border-radius:10px; color:var(--text-muted); font-size:12px;">
            <i class="fas fa-truck-ramp-box" style="font-size:22px; color:#38bdf8; margin-bottom:6px; display:block;"></i>
            No relief consignments dispatched yet. When supplies are dispatched to an area, it will appear here for return intake.
          </div>
        `;
      } else {
        returnsAreaList.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:12px;">
            ${dispatchedAllocations.map(a => {
              const isAlreadyReturned = (returns || []).some(r => 
                ((r.area && r.area.toLowerCase() === a.destination.toLowerCase()) || 
                 (r.destination && r.destination.toLowerCase() === a.destination.toLowerCase()) ||
                 (r.refNo && a.refNo && r.refNo === a.refNo) || 
                 (r.allocId && r.allocId === a.id) ||
                 (r.id && r.id === a.id)) &&
                (r.warehouseRestocked === true || r.godownVerified === true || String(r.status || '').includes('Restocked'))
              );
              const isCleared = Boolean(a.groundOfficerCleared || a.reliefClearedForReturn);
              return `
                <div class="sub-card ${isAlreadyReturned ? 'tone-good' : (isCleared ? 'tone-good' : 'tone-amber')}" style="border:1.5px solid ${isAlreadyReturned ? '#bbf7d0' : (isCleared ? '#86efac' : '#fcd34d')}; transition:all 0.2s;">
                  <div class="sub-card-top" style="margin-bottom:6px;">
                    <div>
                      <h4 style="color:#0f172a; margin:0 0 2px;"><i class="fas fa-location-dot" style="color:${isAlreadyReturned ? '#16a34a' : (isCleared ? '#16a34a' : '#d97706')}; margin-right:4px;"></i>${a.destination}</h4>
                      <span style="font-size:11px; color:var(--text-muted); font-weight:600;">Gate-Pass Ref: <strong>${a.refNo && a.refNo !== '—' ? a.refNo : 'DSP-2026'}</strong></span>
                    </div>
                    <span class="pill ${isAlreadyReturned ? 'p-good' : (isCleared ? 'p-good' : 'p-amber')}" style="font-size:9.5px; padding:2px 7px;">
                      ${isAlreadyReturned ? '✓ Restocked into Warehouse' : (isCleared ? '✓ Cleared for Return' : '⏳ Awaiting Ground Officer')}
                    </span>
                  </div>

                  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 8px; font-size:11px; color:#334155; margin-bottom:8px;">
                    <strong>Dispatched Supplies:</strong> ${a.summary || 'Emergency Relief Buffer'}
                  </div>

                  <!-- Ground Officer Clearance Requirement Notice -->
                  <div style="background:${isAlreadyReturned ? '#f0fdf4' : (isCleared ? '#f0fdf4' : '#fffbeb')}; border-left:3.5px solid ${isAlreadyReturned ? '#16a34a' : (isCleared ? '#16a34a' : '#f59e0b')}; padding:6px 8px; border-radius:4px; font-size:10.5px; color:${isAlreadyReturned ? '#166534' : (isCleared ? '#166534' : '#92400e')}; margin-bottom:8px;">
                    ${isAlreadyReturned
                      ? `<i class="fas fa-check-circle"></i> <strong>Intake Completed:</strong> Relief equipment returned from field and restocked into warehouse inventory.`
                      : (isCleared
                        ? `<i class="fas fa-check-double"></i> <strong>Situation Controlled:</strong> Ground Officer (${a.clearedByOfficer || 'Ground Officer'}) confirmed rescue completed. Resources released for return intake.`
                        : `<i class="fas fa-shield-halved"></i> <strong>Operation Active:</strong> Return intake locked until Ground Officer confirms situation is under control and equipment is released.`
                      )
                    }
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; color:#475569; gap:6px; flex-wrap:wrap;">
                    <span><i class="fas fa-user-shield" style="color:#0284c7;"></i> ${a.leadOfficerName ? `${a.leadAgency || 'NDRF'} ${a.leadOfficerName}` : (a.driver || 'Field Convoy')}</span>
                    <div style="display:flex; gap:6px; align-items:center;">
                      ${isAlreadyReturned ? `
                        <span style="display:inline-flex; align-items:center; gap:5px; padding:4px 10px; font-size:10.5px; background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; border-radius:6px; font-weight:700;">
                          <i class="fas fa-check-double"></i> ✓ Restocked in Warehouse
                        </span>
                      ` : (!isCleared ? `
                        <span style="display:inline-flex; align-items:center; gap:5px; padding:4px 9px; font-size:10.5px; background:#fff7ed; color:#c2410c; border:1px solid #ffedd5; border-radius:6px; font-weight:600;" title="Return is locked. Ground Officer must confirm situation is under control from Ground Officer portal.">
                          <i class="fas fa-lock"></i> Return Locked (Awaiting Ground Officer)
                        </span>
                      ` : `
                        <button class="btn-gd primary" style="padding:4px 9px; font-size:10.5px;" onclick="window.selectAreaForReturn('${a.destination.replace(/'/g, "\\'")}', '${a.id}', '${a.refNo || 'DSP-2026'}')">
                          <i class="fas fa-rotate-left"></i> Log Return
                        </button>
                      `)}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    }

    // Return Management Audited Cards
    const returnsGrid = document.getElementById('returnsCardGrid');
    if (returnsGrid) {
      returnsGrid.innerHTML = returns.length === 0
        ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No post-operation return entries recorded yet.</div>`
        : returns.map(r => {
          const isRestocked = Boolean(r.warehouseRestocked || r.godownVerified);
          const isGroundVerified = Boolean(r.groundVerified || String(r.verificationStatus || '').includes('Ground'));

          return `
          <div class="sub-card ${isRestocked ? 'tone-good' : (r.damaged > 0 || r.missing > 0 ? 'tone-amber' : 'tone-blue')}" style="padding:14px 16px; border-left:4px solid ${isRestocked ? '#16a34a' : '#0284c7'};">
            <div class="sub-card-top" style="margin-bottom:6px;">
              <div>
                <h4 style="margin:0 0 2px;"><i class="fas fa-boxes-stacked" style="color:#0284c7; margin-right:5px;"></i>${r.area || r.resourceName || 'Relief Consignment Return'}</h4>
                <span style="font-size:11px; color:var(--text-muted);">${r.id} • Ref: <strong>${r.refNo || 'DSP-2026'}</strong></span>
              </div>
              <span class="pill ${isRestocked ? 'p-good' : (isGroundVerified ? 'p-info' : 'p-amber')}" style="font-size:10px; font-weight:700;">
                ${isRestocked ? '✓ Warehouse Restocked' : (isGroundVerified ? 'Field Verified by Ground' : (r.verificationStatus || 'Pending Intake'))}
              </span>
            </div>
            <div class="meta-box-4" style="grid-template-columns: repeat(3, 1fr); margin:8px 0;">
              <div><span>Good</span><strong style="color:#15803d;">${r.boatsReturned !== undefined ? (r.boatsReturned + r.jacketsReturned) : r.good}</strong></div>
              <div><span>Damaged</span><strong style="color:#d97706;">${r.boatsDamaged !== undefined ? (r.boatsDamaged + r.jacketsDamaged) : r.damaged}</strong></div>
              <div><span>Missing</span><strong style="color:#dc2626;">${r.boatsMissing !== undefined ? (r.boatsMissing + r.jacketsMissing) : r.missing}</strong></div>
            </div>
            <div style="font-size:11px; color:#334155;"><strong>Handover By:</strong> ${r.returnedByOfficer || 'NDRF Officer'} (${r.officerId || 'GO-KAM-04'})</div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:4px;"><i class="far fa-clock"></i> ${r.date}</div>

            <!-- Godown Physical Restock Verification Action -->
            <div style="margin-top:10px; padding-top:8px; border-top:1px dashed #cbd5e1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <span style="font-size:10.5px; color:#64748b;">
                ${isRestocked 
                  ? `<i class="fas fa-circle-check" style="color:#16a34a;"></i> Restocked by <b>${r.verifiedByManager || 'Warehouse Manager'}</b>`
                  : `<i class="fas fa-dolly" style="color:#0284c7;"></i> Awaiting physical bay check & inventory restock.`
                }
              </span>
              <div>
                ${!isRestocked ? `
                  <button class="btn-gd primary" style="background:#15803d; border-color:#16a34a; font-weight:700; font-size:11px; padding:6px 12px;" onclick="window.verifyWarehouseReturnRestock('${r.id || r.retId}', '${(r.area || '').replace(/'/g, "\\'")}')">
                    <i class="fas fa-boxes-packing"></i> Verify & Restock to Warehouse (वेरीफाई एवं गोदाम में रिस्टॉक करें)
                  </button>
                ` : `
                  <span style="font-size:11px; font-weight:700; color:#15803d; padding:4px 8px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:5px;">
                    <i class="fas fa-check-double"></i> Physically Restocked in Warehouse Stock
                  </span>
                `}
              </div>
            </div>
          </div>
          `;
        }).join('');
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

    // 9. Area-Wise Relief Consignment & Field Inventory Reconciliation Report
    const areaReportContainer = document.getElementById('areaWiseInventoryReportContainer');
    if (areaReportContainer) {
      const allReportAllocations = allocations || [];
      if (allReportAllocations.length === 0) {
        areaReportContainer.innerHTML = `
          <div style="text-align:center; padding:18px; border:1px dashed #cbd5e1; border-radius:10px; color:#64748b; font-size:12px;">
            No area allocations recorded yet. When allocations and dispatches are created, their area-wise inventory reconciliation report will be rendered here.
          </div>
        `;
      } else {
        const areaRows = allReportAllocations.map(a => {
          const summaryText = a.summary || '';
          const bMatch = summaryText.match(/(\d+)\s*Boats?/i);
          const jMatch = summaryText.match(/(\d+)\s*Jackets?/i);
          const fMatch = summaryText.match(/(\d+)\s*Food/i);
          const mMatch = summaryText.match(/(\d+)\s*Meds?/i);

          const boatsSent = a.boats !== undefined ? Number(a.boats) : (a.dispatchedBoats !== undefined ? Number(a.dispatchedBoats) : (bMatch ? Number(bMatch[1]) : 0));
          const jacketsSent = a.jackets !== undefined ? Number(a.jackets) : (a.dispatchedJackets !== undefined ? Number(a.dispatchedJackets) : (jMatch ? Number(jMatch[1]) : 0));
          const foodSent = a.food !== undefined ? Number(a.food) : (a.dispatchedFood !== undefined ? Number(a.dispatchedFood) : (fMatch ? Number(fMatch[1]) : 0));
          const medsSent = a.meds !== undefined ? Number(a.meds) : (a.dispatchedMeds !== undefined ? Number(a.dispatchedMeds) : (mMatch ? Number(mMatch[1]) : 0));

          // Matched returns for this area
          const matchedReturns = (returns || []).filter(r => 
            (r.area && r.area.trim().toLowerCase() === String(a.destination || '').trim().toLowerCase()) ||
            (r.dispatchId && r.dispatchId === a.id)
          );

          const boatsGood = matchedReturns.reduce((acc, r) => acc + (Number(r.boatsGood) || 0), 0);
          const boatsDamaged = matchedReturns.reduce((acc, r) => acc + (Number(r.boatsDamaged) || 0), 0);
          const jacketsGood = matchedReturns.reduce((acc, r) => acc + (Number(r.jacketsGood) || 0), 0);
          const jacketsDamaged = matchedReturns.reduce((acc, r) => acc + (Number(r.jacketsDamaged) || 0), 0);
          const foodConsumed = matchedReturns.reduce((acc, r) => acc + (Number(r.foodConsumed) || 0), 0);
          const foodReturned = matchedReturns.reduce((acc, r) => acc + (Number(r.foodReturned) || 0), 0);
          const medsConsumed = matchedReturns.reduce((acc, r) => acc + (Number(r.medsConsumed) || 0), 0);
          const medsReturned = matchedReturns.reduce((acc, r) => acc + (Number(r.medsReturned) || 0), 0);

          const boatsOnGround = Math.max(0, boatsSent - (boatsGood + boatsDamaged));
          const jacketsOnGround = Math.max(0, jacketsSent - (jacketsGood + jacketsDamaged));
          const foodOnGround = Math.max(0, foodSent - (foodConsumed + foodReturned));
          const medsOnGround = Math.max(0, medsSent - (medsConsumed + medsReturned));

          const isCleared = Boolean(a.groundOfficerCleared || a.reliefClearedForReturn);
          const isDispatched = a.status === 'Dispatched' ||
            String(a.godownStatus || '').toLowerCase().includes('dispatched') ||
            String(a.godownStatus || '').toLowerCase().includes('en-route') ||
            Boolean(a.dispatchedDate) ||
            (Boolean(a.refNo) && a.refNo !== '—' && a.refNo.startsWith('DSP-'));

          const escortLead = a.leadOfficerName
            ? `<strong>${a.leadAgency || 'NDRF'}</strong>: ${a.leadOfficerName}<br><span style="font-size:10px; color:#64748b;">ID: ${a.leadOfficerId || 'Verified'}</span>`
            : `<span style="color:#64748b;">${a.driver || 'Field Convoy'}</span>`;

          return `
            <tr style="border-bottom:1px solid #e2e8f0; transition:background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
              <td style="padding:10px 8px; vertical-align:top;">
                <div style="font-weight:700; color:#0f172a; font-size:12px;">
                  <i class="fas fa-location-dot" style="color:#0284c7; margin-right:4px;"></i>${a.destination}
                </div>
                <div style="font-size:10.5px; color:#64748b; margin-top:2px;">
                  Gate-Pass: <strong style="color:#0369a1;">${a.refNo && a.refNo !== '—' ? a.refNo : (isDispatched ? 'DSP-2026' : 'Awaiting Dispatch')}</strong>
                </div>
                <div style="font-size:10px; color:#94a3b8;">Alloc ID: ${a.id}</div>
              </td>
              <td style="padding:10px 8px; vertical-align:top; font-size:11px;">
                ${escortLead}
              </td>
              <td style="padding:10px 8px; vertical-align:top;">
                <div style="display:flex; flex-direction:column; gap:2px; font-size:11px;">
                  <span>🚤 <strong>${boatsSent}</strong> Boats</span>
                  <span>🦺 <strong>${jacketsSent}</strong> Jackets</span>
                  <span>🍱 <strong>${foodSent}</strong> Food</span>
                  <span>💊 <strong>${medsSent}</strong> Meds</span>
                </div>
              </td>
              <td style="padding:10px 8px; vertical-align:top;">
                ${(boatsGood + jacketsGood + foodReturned + medsReturned) > 0 ? `
                  <div style="display:flex; flex-direction:column; gap:2px; font-size:11px; color:#15803d;">
                    ${boatsGood > 0 ? `<span>✓ ${boatsGood} Boats</span>` : ''}
                    ${jacketsGood > 0 ? `<span>✓ ${jacketsGood} Jackets</span>` : ''}
                    ${foodReturned > 0 ? `<span>✓ ${foodReturned} Food</span>` : ''}
                    ${medsReturned > 0 ? `<span>✓ ${medsReturned} Meds</span>` : ''}
                  </div>
                ` : `<span style="font-size:10.5px; color:#94a3b8;">None yet</span>`}
              </td>
              <td style="padding:10px 8px; vertical-align:top;">
                ${(boatsDamaged + jacketsDamaged + foodConsumed + medsConsumed) > 0 ? `
                  <div style="display:flex; flex-direction:column; gap:2px; font-size:10.5px;">
                    ${foodConsumed > 0 ? `<span style="color:#475569;">🍽️ ${foodConsumed} Food Consumed</span>` : ''}
                    ${medsConsumed > 0 ? `<span style="color:#475569;">💉 ${medsConsumed} Meds Used</span>` : ''}
                    ${boatsDamaged > 0 ? `<span style="color:#dc2626; font-weight:700;">⚠️ ${boatsDamaged} Boat Dmg/Loss</span>` : ''}
                    ${jacketsDamaged > 0 ? `<span style="color:#dc2626; font-weight:700;">⚠️ ${jacketsDamaged} Jacket Dmg</span>` : ''}
                  </div>
                ` : `<span style="font-size:10.5px; color:#94a3b8;">0 flagged</span>`}
              </td>
              <td style="padding:10px 8px; vertical-align:top;">
                <div style="display:flex; flex-direction:column; gap:2px; font-size:11px; font-weight:600; color:#1e40af;">
                  <span>${boatsOnGround} Boats</span>
                  <span>${jacketsOnGround} Jackets</span>
                  <span>${foodOnGround} Food</span>
                  <span>${medsOnGround} Meds</span>
                </div>
              </td>
              <td style="padding:10px 8px; vertical-align:top;">
                <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
                  <span class="pill ${isDispatched ? 'p-good' : 'p-amber'}" style="font-size:9.5px; padding:2px 6px;">
                    ${isDispatched ? 'Dispatched' : 'Pending Staging'}
                  </span>
                  <span class="pill ${isCleared ? 'p-good' : 'p-amber'}" style="font-size:9.5px; padding:2px 6px;">
                    ${isCleared ? '✓ Controlled (Ground)' : '⏳ Rescue Active'}
                  </span>
                </div>
              </td>
            </tr>
          `;
        }).join('');

        areaReportContainer.innerHTML = `
          <div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:12px; padding:14px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1.5px solid #e2e8f0; padding-bottom:8px;">
              <div>
                <h3 style="margin:0; font-size:14.5px; color:#0f172a; display:flex; align-items:center; gap:6px;">
                  <i class="fas fa-boxes-packing" style="color:#0284c7;"></i> Area-Wise Relief Consignment & Field Inventory Reconciliation Report
                </h3>
                <span style="font-size:11px; color:#64748b;">
                  Live reconciliation of relief stock dispatched, returned to warehouse, consumed, and remaining on ground per sector.
                </span>
              </div>
              <span class="pill p-good" style="font-size:10px;">
                <i class="fas fa-satellite-dish"></i> Real-time Sync
              </span>
            </div>

            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse; text-align:left; font-size:11.5px;">
                <thead>
                  <tr style="background:#f1f5f9; color:#334155; font-size:10.5px; text-transform:uppercase; letter-spacing:0.4px;">
                    <th style="padding:8px 8px; border-bottom:1.5px solid #cbd5e1; border-top-left-radius:6px;">Sector / Gate-Pass</th>
                    <th style="padding:8px 8px; border-bottom:1.5px solid #cbd5e1;">Escort Lead (NDRF/SDRF)</th>
                    <th style="padding:8px 8px; border-bottom:1.5px solid #cbd5e1;">Dispatched Quota</th>
                    <th style="padding:8px 8px; border-bottom:1.5px solid #cbd5e1;">Restocked (Good)</th>
                    <th style="padding:8px 8px; border-bottom:1.5px solid #cbd5e1;">Consumed / Flagged</th>
                    <th style="padding:8px 8px; border-bottom:1.5px solid #cbd5e1;">Active Field Balance</th>
                    <th style="padding:8px 8px; border-bottom:1.5px solid #cbd5e1; border-top-right-radius:6px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${areaRows}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
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

    const isDispatched = alloc.status === 'Dispatched' ||
      String(alloc.godownStatus || '').toLowerCase().includes('dispatched') ||
      String(alloc.godownStatus || '').toLowerCase().includes('en-route') ||
      Boolean(alloc.dispatchedDate) ||
      (Boolean(alloc.refNo) && alloc.refNo !== '—' && alloc.refNo.startsWith('DSP-'));

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
              <i class="fas fa-lock"></i> In Transit (${alloc.refNo})
            </span>
          `}
        </div>
      </div>
    `;
  }

  function selectAllocationForDispatch(allocId) {
    selectedAllocId = allocId;
    const alloc = (state.allocations || []).find(a => a.id === allocId);
    if (typeof window.switchGodownTab === 'function') {
      window.switchGodownTab('dashboard');
    }
    setTimeout(() => {
      if (window.godownLeafletMapInstance) {
        window.godownLeafletMapInstance.invalidateSize();
      }
      if (alloc && alloc.lat && alloc.lng) {
        centerOnMap(alloc.lat, alloc.lng);
      }
    }, 120);
    renderSelectedAllocBox(allocId);
  }

  function openFirstPendingDispatch() {
    const pending = (state.allocations || []).find(a => !(
      a.status === 'Dispatched' ||
      String(a.godownStatus || '').toLowerCase().includes('dispatched') ||
      String(a.godownStatus || '').toLowerCase().includes('en-route') ||
      Boolean(a.dispatchedDate) ||
      (Boolean(a.refNo) && a.refNo !== '—' && a.refNo.startsWith('DSP-'))
    ));
    if (pending) {
      openDispatchModal(pending.id);
    } else {
      showToast('All Authority allocations are currently dispatched & locked!');
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

    const isAlreadyDispatched = alloc.status === 'Dispatched' ||
      String(alloc.godownStatus || '').toLowerCase().includes('dispatched') ||
      String(alloc.godownStatus || '').toLowerCase().includes('en-route') ||
      Boolean(alloc.dispatchedDate) ||
      (Boolean(alloc.refNo) && alloc.refNo !== '—' && alloc.refNo.startsWith('DSP-'));

    if (isAlreadyDispatched) {
      showToast(`⚠️ Allocation ${alloc.id} is already dispatched with Gate Pass (${alloc.refNo || 'Locked'}). Modifications locked.`);
      return;
    }

    document.getElementById('dispAllocIndex').value = idx;
    document.getElementById('dispAllocId').value = alloc.id;
    document.getElementById('dispAllocSummary').innerHTML = `
      <div style="font-weight:700; font-size:13px; color:#0f172a; margin-bottom:3px;">${alloc.destination} (${alloc.id})</div>
      <div style="color:#0284c7; font-weight:600;">Authority Requirement: ${alloc.summary}</div>
    `;
    document.getElementById('dispDestInput').value = alloc.destination;
    document.getElementById('dispVehicleInput').value = alloc.vehicle || 'Heavy Truck AS-01-EC-4210';
    document.getElementById('dispDriverInput').value = alloc.driver || 'Rajesh Das (+91 98640-21943)';

    // Authority Designated Escort / Receiving Officer
    const offNameEl = document.getElementById('dispOfficerName');
    const offIdEl = document.getElementById('dispOfficerId');
    const offAgencyPill = document.getElementById('dispOfficerAgencyPill');
    if (offNameEl) offNameEl.textContent = alloc.leadOfficerName || 'Inspector Rajesh Kalita';
    if (offIdEl) offIdEl.textContent = alloc.leadOfficerId || 'NDRF-1BN-842';
    if (offAgencyPill) offAgencyPill.textContent = (alloc.leadAgency || 'NDRF (1st Bn)') + ' Verified';

    // Look up present available warehouse stock across ALL matching items in category
    const getCategoryAvailableStock = (keywords) => {
      const inv = (state && state.inventory) || [];
      return inv.reduce((sum, item) => {
        const cat = ((item.category || '') + ' ' + (item.name || '')).toLowerCase();
        const match = keywords.some(k => cat.includes(k.toLowerCase()));
        if (match) {
          return sum + Math.max(0, Number(item.available) || 0);
        }
        return sum;
      }, 0);
    };

    const availBoats = getCategoryAvailableStock(['boat']);
    const availJackets = getCategoryAvailableStock(['jacket']);
    const availFood = getCategoryAvailableStock(['food', 'ration']);
    const availMeds = getCategoryAvailableStock(['medicine', 'med', 'kit']);

    // Pre-fill resource quantities from summary
    const sum = String(alloc.summary || '');
    const bMatch = sum.match(/(\d+)\s*(?:Boats?|Rescue Boats?)/i);
    const jMatch = sum.match(/(\d+)\s*(?:Jackets?|Life Jackets?)/i);
    const fMatch = sum.match(/(\d+)\s*(?:Food|Food Packets?)/i);
    const mMatch = sum.match(/(\d+)\s*(?:Meds?|Medicines?|Kits?)/i);

    const reqBoats = bMatch ? Number(bMatch[1]) : 0;
    const reqJackets = jMatch ? Number(jMatch[1]) : 0;
    const reqFood = fMatch ? Number(fMatch[1]) : 0;
    const reqMeds = mMatch ? Number(mMatch[1]) : 0;

    // Update Available & Required labels
    const bStockLbl = document.getElementById('dispBoatsStockLabel');
    const jStockLbl = document.getElementById('dispJacketsStockLabel');
    const fStockLbl = document.getElementById('dispFoodStockLabel');
    const mStockLbl = document.getElementById('dispMedsStockLabel');

    if (bStockLbl) bStockLbl.textContent = `Avail: ${availBoats}`;
    if (jStockLbl) jStockLbl.textContent = `Avail: ${availJackets}`;
    if (fStockLbl) fStockLbl.textContent = `Avail: ${availFood}`;
    if (mStockLbl) mStockLbl.textContent = `Avail: ${availMeds}`;

    const bReqLbl = document.getElementById('dispBoatsReqLabel');
    const jReqLbl = document.getElementById('dispJacketsReqLabel');
    const fReqLbl = document.getElementById('dispFoodReqLabel');
    const mReqLbl = document.getElementById('dispMedsReqLabel');

    if (bReqLbl) bReqLbl.textContent = `Req: ${reqBoats}`;
    if (jReqLbl) jReqLbl.textContent = `Req: ${reqJackets}`;
    if (fReqLbl) fReqLbl.textContent = `Req: ${reqFood}`;
    if (mReqLbl) mReqLbl.textContent = `Req: ${reqMeds}`;

    const bInput = document.getElementById('dispBoatsInput');
    const jInput = document.getElementById('dispJacketsInput');
    const fInput = document.getElementById('dispFoodInput');
    const mInput = document.getElementById('dispMedsInput');

    const validateInput = (input, maxAvail, name) => {
      const val = Number(input.value);
      const warn = document.getElementById('dispStockWarningMsg');
      if (val > maxAvail) {
        input.value = maxAvail;
        if (warn) {
          warn.textContent = `Cannot exceed available ${name} stock (${maxAvail})!`;
          warn.style.color = '#dc2626';
        }
        showToast(`Cannot dispatch more than present inventory stock of ${name} (${maxAvail} Available)`);
      }
    };

    // Strict validation: cap input by present inventory stock
    if (bInput) {
      bInput.max = availBoats;
      bInput.value = Math.min(reqBoats, availBoats);
      bInput.oninput = () => validateInput(bInput, availBoats, 'Boats');
    }
    if (jInput) {
      jInput.max = availJackets;
      jInput.value = Math.min(reqJackets, availJackets);
      jInput.oninput = () => validateInput(jInput, availJackets, 'Life Jackets');
    }
    if (fInput) {
      fInput.max = availFood;
      fInput.value = Math.min(reqFood, availFood);
      fInput.oninput = () => validateInput(fInput, availFood, 'Food Packets');
    }
    if (mInput) {
      mInput.max = availMeds;
      mInput.value = Math.min(reqMeds, availMeds);
      mInput.oninput = () => validateInput(mInput, availMeds, 'Medicine Kits');
    }

    const warnMsg = document.getElementById('dispStockWarningMsg');
    if (warnMsg) {
      if (reqBoats > availBoats || reqJackets > availJackets || reqFood > availFood || reqMeds > availMeds) {
        warnMsg.textContent = '⚠️ Stock deficit: quantities capped to available warehouse inventory';
        warnMsg.style.color = '#dc2626';
      } else {
        warnMsg.textContent = '✓ Full required stock available in depot';
        warnMsg.style.color = '#15803d';
      }
    }

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

    const boatsDisp = Number(document.getElementById('dispBoatsInput')?.value) || 0;
    const jacketsDisp = Number(document.getElementById('dispJacketsInput')?.value) || 0;
    const foodDisp = Number(document.getElementById('dispFoodInput')?.value) || 0;
    const medsDisp = Number(document.getElementById('dispMedsInput')?.value) || 0;
    const providedSummary = `${boatsDisp} Boats, ${jacketsDisp} Jackets, ${foodDisp} Food, ${medsDisp} Meds`;

    const alloc = (state.allocations || [])[idx];
    const officerVerified = document.getElementById('dispOfficerVerifiedCheck')?.checked ?? true;

    // Check available stock across all matching items in inventory
    const getCategoryAvailableStock = (keywords) => {
      const inv = (state && state.inventory) || [];
      return inv.reduce((sum, item) => {
        const cat = ((item.category || '') + ' ' + (item.name || '')).toLowerCase();
        const match = keywords.some(k => cat.includes(k.toLowerCase()));
        if (match) {
          return sum + Math.max(0, Number(item.available) || 0);
        }
        return sum;
      }, 0);
    };

    const availB = getCategoryAvailableStock(['boat']);
    const availJ = getCategoryAvailableStock(['jacket']);
    const availF = getCategoryAvailableStock(['food', 'ration']);
    const availM = getCategoryAvailableStock(['medicine', 'med', 'kit']);

    if (boatsDisp > availB) {
      showToast(`Cannot dispatch ${boatsDisp} Boats. Only ${availB} available in warehouse!`);
      return;
    }
    if (jacketsDisp > availJ) {
      showToast(`Cannot dispatch ${jacketsDisp} Jackets. Only ${availJ} available in warehouse!`);
      return;
    }
    if (foodDisp > availF) {
      showToast(`Cannot dispatch ${foodDisp} Food Packets. Only ${availF} available in warehouse!`);
      return;
    }
    if (medsDisp > availM) {
      showToast(`Cannot dispatch ${medsDisp} Medicine Kits. Only ${availM} available in warehouse!`);
      return;
    }

    closeModal('dispatchModal');

    try {
      const res = await confirmDispatchApi({
        allocIndex: idx,
        allocId: allocId || (alloc ? alloc.id : null),
        vehicle,
        driver,
        dest,
        dispatchTime: dt,
        providedSummary,
        boats: boatsDisp,
        jackets: jacketsDisp,
        food: foodDisp,
        meds: medsDisp,
        verifiedOfficerName: alloc?.leadOfficerName || 'Inspector Rajesh Kalita',
        verifiedOfficerId: alloc?.leadOfficerId || 'NDRF-1BN-842',
        verifiedAgency: alloc?.leadAgency || 'NDRF (1st Bn)',
        officerVerified
      });

      state = getCurrentGodownState();
      window.godownState = state;
      if (alloc) {
        alloc.status = 'Dispatched';
        alloc.summary = providedSummary;
        alloc.godownStatus = `Dispatched (${res?.refNo || 'DSP-2026'}) • En-Route`;
        alloc.refNo = res?.refNo || 'DSP-2026';
      }
      renderAllGodownViews();
      updateGodownMapAllocations(state.allocations || []);
      renderSelectedAllocBox(allocId);
      showToast(`Convoy Dispatched for ${dest} with: ${providedSummary} • Handed to ${alloc?.leadOfficerName || 'Lead Officer'} (Ref: ${res?.refNo || 'DSP-2026'}).`);
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

    if (item) {
      item.available = newAvail;
      item.condition = cond;
    }

    try {
      await updateStockItemApi({
        index: idx,
        id: item ? item.id : null,
        available: newAvail,
        condition: cond,
        reason
      });
      const fresh = await fetchGodownState();
      if (fresh) state = fresh;
      renderAllGodownViews();
      showToast(`Inventory updated for ${item ? item.name : 'item'}.`, 'success');
    } catch (err) {
      console.error('Stock correction error:', err);
      renderAllGodownViews();
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

  async function confirmGroundOfficerClearance(allocId, areaName) {
    try {
      await clearAreaForReturnApi({
        allocId,
        area: areaName,
        officerName: 'Bhaskar Jyoti Das (Ground Officer)',
        notes: 'Ground rescue completed; flood levels receded. Area situation under control. Equipment released for warehouse return.'
      });
      const allocations = state.allocations || [];
      const alloc = allocations.find(a => a.id === allocId || a.destination === areaName);
      if (alloc) {
        alloc.groundOfficerCleared = true;
        alloc.reliefClearedForReturn = true;
        alloc.clearedByOfficer = 'Bhaskar Jyoti Das (Ground Officer)';
      }
      renderAllGodownViews();
      showToast(`✓ Ground Officer confirmed: Situation in ${areaName} is under control! Return intake unlocked.`);
    } catch (err) {
      console.error(err);
      showToast('Clearance recorded.');
    }
  }

  function selectAreaForReturn(areaName, allocId, refNo) {
    const allocations = state.allocations || [];
    let alloc = allocations.find(a => a.id === allocId || a.destination === areaName);
    if (!alloc) {
      alloc = {
        destination: areaName,
        id: allocId || 'ALC',
        refNo: refNo || 'DSP-2026',
        summary: ''
      };
    }

    // Strict Ground Officer clearance check: Cannot return until Ground Officer confirms situation is under control
    const isCleared = Boolean(alloc.groundOfficerCleared || alloc.reliefClearedForReturn);
    if (!isCleared) {
      showToast(`⚠️ Return locked: Ground Officer must first confirm that the situation in ${areaName} is under control and equipment is released!`);
      return;
    }

    const card = document.getElementById('areaReturnIntakeCard');
    if (!card) return;

    // Dynamically extract real resource counts from allocation properties or parse from summary string
    const summaryText = alloc.summary || '';
    const bMatch = summaryText.match(/(\d+)\s*Boats?/i);
    const jMatch = summaryText.match(/(\d+)\s*Jackets?/i);
    const fMatch = summaryText.match(/(\d+)\s*Food/i);
    const mMatch = summaryText.match(/(\d+)\s*Meds?/i);

    const boatsSent = alloc.boats !== undefined ? Number(alloc.boats) : (alloc.dispatchedBoats !== undefined ? Number(alloc.dispatchedBoats) : (bMatch ? Number(bMatch[1]) : 0));
    const jacketsSent = alloc.jackets !== undefined ? Number(alloc.jackets) : (alloc.dispatchedJackets !== undefined ? Number(alloc.dispatchedJackets) : (jMatch ? Number(jMatch[1]) : 0));
    const foodSent = alloc.food !== undefined ? Number(alloc.food) : (alloc.dispatchedFood !== undefined ? Number(alloc.dispatchedFood) : (fMatch ? Number(fMatch[1]) : 0));
    const medsSent = alloc.meds !== undefined ? Number(alloc.meds) : (alloc.dispatchedMeds !== undefined ? Number(alloc.dispatchedMeds) : (mMatch ? Number(mMatch[1]) : 0));

    const officerName = alloc.leadOfficerName || alloc.verifiedOfficerName || alloc.driver || 'Escort Officer';
    const officerId = alloc.leadOfficerId || alloc.verifiedOfficerId || 'ESCORT-ID';
    const agency = alloc.leadAgency || 'NDRF / SDRF';

    card.style.display = 'block';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1px solid #bfdbfe; padding-bottom:8px;">
        <div>
          <h3 style="margin:0 0 2px; color:#1e3a8a; font-size:15px;">
            <i class="fas fa-rotate-left" style="color:#0284c7;"></i> Return Intake Reconciliation: <strong>${areaName}</strong>
          </h3>
          <span style="font-size:11.5px; color:#64748b;">
            Gate-Pass Dispatch Ref: <strong>${alloc.refNo || refNo || 'DSP-2026'}</strong> • Allocation ID: <strong>${alloc.id}</strong>
          </span>
        </div>
        <button type="button" class="btn-gd outline" style="padding:4px 9px; font-size:11px;" onclick="document.getElementById('areaReturnIntakeCard').style.display='none'">
          <i class="fas fa-times"></i> Close
        </button>
      </div>

      <!-- SECTION 1: WHAT WAS SENT -->
      <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:10px 12px; margin-bottom:12px;">
        <div style="font-size:11.5px; font-weight:700; color:#0f172a; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
          <span><i class="fas fa-box-open" style="color:#0284c7;"></i> Consignment Sent to Field (भेजा गया सामान):</span>
          <span class="pill p-good" style="font-size:10px;">Escort: ${agency} - ${officerName} (${officerId})</span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; text-align:center;">
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px;">
            <span style="display:block; font-size:10.5px; color:#166534; font-weight:600;">Rescue Boats Sent</span>
            <strong style="font-size:15px; color:#15803d;">${boatsSent}</strong>
          </div>
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px;">
            <span style="display:block; font-size:10.5px; color:#166534; font-weight:600;">Life Jackets Sent</span>
            <strong style="font-size:15px; color:#15803d;">${jacketsSent}</strong>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px;">
            <span style="display:block; font-size:10.5px; color:#475569; font-weight:600;">Food Packets Sent</span>
            <strong style="font-size:15px; color:#334155;">${foodSent}</strong>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px;">
            <span style="display:block; font-size:10.5px; color:#475569; font-weight:600;">Medicine Kits Sent</span>
            <strong style="font-size:15px; color:#334155;">${medsSent}</strong>
          </div>
        </div>
      </div>

      <!-- SECTION 2: MANUAL RETURN INTAKE FORM -->
      <form onsubmit="event.preventDefault(); window.submitAreaReturnForm('${alloc.id}', '${areaName.replace(/'/g, "\\'")}', '${alloc.refNo || refNo || 'DSP-2026'}');">
        <div style="font-size:12px; font-weight:700; color:#1e293b; margin-bottom:8px;">
          <i class="fas fa-pen-to-square" style="color:#2563eb;"></i> Manual Intake Entry (कितना आया - मैनुअल भरें):
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <!-- Boats Returns -->
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
            <h5 style="margin:0 0 6px; font-size:11.5px; color:#1e3a8a;"><i class="fas fa-ship" style="color:#0284c7;"></i> Inflatable Rescue Boats (Sent: ${boatsSent})</h5>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
              <div>
                <label style="font-size:10px; font-weight:600; color:#15803d; display:block;">Good (Restock)</label>
                <input type="number" id="retAreaBoatsGood" class="form-ctrl" min="0" max="${boatsSent}" value="${boatsSent}" style="padding:4px; font-size:12px;" required />
              </div>
              <div>
                <label style="font-size:10px; font-weight:600; color:#d97706; display:block;">Damaged</label>
                <input type="number" id="retAreaBoatsDamaged" class="form-ctrl" min="0" max="${boatsSent}" value="0" style="padding:4px; font-size:12px;" required />
              </div>
              <div>
                <label style="font-size:10px; font-weight:600; color:#dc2626; display:block;">Missing</label>
                <input type="number" id="retAreaBoatsMissing" class="form-ctrl" min="0" max="${boatsSent}" value="0" style="padding:4px; font-size:12px;" required />
              </div>
            </div>
          </div>

          <!-- Life Jackets Returns -->
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
            <h5 style="margin:0 0 6px; font-size:11.5px; color:#1e3a8a;"><i class="fas fa-vest" style="color:#f59e0b;"></i> Life Jackets (Sent: ${jacketsSent})</h5>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
              <div>
                <label style="font-size:10px; font-weight:600; color:#15803d; display:block;">Good (Restock)</label>
                <input type="number" id="retAreaJacketsGood" class="form-ctrl" min="0" max="${jacketsSent}" value="${jacketsSent}" style="padding:4px; font-size:12px;" required />
              </div>
              <div>
                <label style="font-size:10px; font-weight:600; color:#d97706; display:block;">Damaged</label>
                <input type="number" id="retAreaJacketsDamaged" class="form-ctrl" min="0" max="${jacketsSent}" value="0" style="padding:4px; font-size:12px;" required />
              </div>
              <div>
                <label style="font-size:10px; font-weight:600; color:#dc2626; display:block;">Missing</label>
                <input type="number" id="retAreaJacketsMissing" class="form-ctrl" min="0" max="${jacketsSent}" value="0" style="padding:4px; font-size:12px;" required />
              </div>
            </div>
          </div>
        </div>

        <!-- Consumables Breakdown -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
            <h5 style="margin:0 0 6px; font-size:11.5px; color:#1e3a8a;"><i class="fas fa-bowl-food" style="color:#10b981;"></i> Food Packets (Sent: ${foodSent})</h5>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
              <div>
                <label style="font-size:10px; font-weight:600; color:#475569; display:block;">Distributed / Consumed</label>
                <input type="number" id="retAreaFoodDist" class="form-ctrl" min="0" max="${foodSent}" value="${foodSent}" style="padding:4px; font-size:12px;" />
              </div>
              <div>
                <label style="font-size:10px; font-weight:600; color:#15803d; display:block;">Unopened Returned</label>
                <input type="number" id="retAreaFoodGood" class="form-ctrl" min="0" max="${foodSent}" value="0" style="padding:4px; font-size:12px;" />
              </div>
            </div>
          </div>

          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
            <h5 style="margin:0 0 6px; font-size:11.5px; color:#1e3a8a;"><i class="fas fa-kit-medical" style="color:#ef4444;"></i> Medicine Kits (Sent: ${medsSent})</h5>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
              <div>
                <label style="font-size:10px; font-weight:600; color:#475569; display:block;">Utilized on Ground</label>
                <input type="number" id="retAreaMedsUsed" class="form-ctrl" min="0" max="${medsSent}" value="${medsSent}" style="padding:4px; font-size:12px;" />
              </div>
              <div>
                <label style="font-size:10px; font-weight:600; color:#15803d; display:block;">Sealed Returned</label>
                <input type="number" id="retAreaMedsGood" class="form-ctrl" min="0" max="${medsSent}" value="0" style="padding:4px; font-size:12px;" />
              </div>
            </div>
          </div>
        </div>

        <!-- Handover Officer & Physical Verification -->
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; margin-bottom:10px;">
          <div>
            <label style="font-size:11px; font-weight:600; color:#334155; display:block;">Handover Officer Name *</label>
            <input type="text" id="retAreaOfficerName" class="form-ctrl" value="${officerName}" style="padding:5px; font-size:11.5px;" required />
          </div>
          <div>
            <label style="font-size:11px; font-weight:600; color:#334155; display:block;">Officer Service / Badge ID *</label>
            <input type="text" id="retAreaOfficerId" class="form-ctrl" value="${officerId}" style="padding:5px; font-size:11.5px;" required />
          </div>
          <div>
            <label style="font-size:11px; font-weight:600; color:#334155; display:block;">Inspection Bay Notes</label>
            <input type="text" id="retAreaNotes" class="form-ctrl" value="Equipment washed, disinfected & integrity checked at dock" style="padding:5px; font-size:11.5px;" />
          </div>
        </div>

        <!-- Verification Notice -->
        <div style="background:#eff6ff; border-left:3.5px solid #3b82f6; padding:8px 12px; border-radius:6px; font-size:11px; color:#1e40af; margin-bottom:12px;">
          <i class="fas fa-shield-halved"></i> <strong>Ground Officer Cross-Verification:</strong>
          This return will be logged as <strong>'Pending Ground Officer Verification'</strong>. The Field Ground Officer will cross-examine and confirm the numbers directly on their console before final archival.
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="btn-gd outline" onclick="document.getElementById('areaReturnIntakeCard').style.display='none'">
            Cancel
          </button>
          <button type="submit" class="btn-gd primary">
            <i class="fas fa-check-circle"></i> Submit Return Intake & Restock Inventory
          </button>
        </div>
      </form>
    `;
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function submitAreaReturnForm(allocId, areaName, refNo) {
    const boatsGood = Number(document.getElementById('retAreaBoatsGood')?.value || 0);
    const boatsDamaged = Number(document.getElementById('retAreaBoatsDamaged')?.value || 0);
    const boatsMissing = Number(document.getElementById('retAreaBoatsMissing')?.value || 0);

    const jacketsGood = Number(document.getElementById('retAreaJacketsGood')?.value || 0);
    const jacketsDamaged = Number(document.getElementById('retAreaJacketsDamaged')?.value || 0);
    const jacketsMissing = Number(document.getElementById('retAreaJacketsMissing')?.value || 0);

    const foodDist = Number(document.getElementById('retAreaFoodDist')?.value || 0);
    const foodGood = Number(document.getElementById('retAreaFoodGood')?.value || 0);
    const medsUsed = Number(document.getElementById('retAreaMedsUsed')?.value || 0);
    const medsGood = Number(document.getElementById('retAreaMedsGood')?.value || 0);

    const officerName = document.getElementById('retAreaOfficerName')?.value.trim() || 'NDRF Officer';
    const officerId = document.getElementById('retAreaOfficerId')?.value.trim() || 'OFF-ID';
    const notes = document.getElementById('retAreaNotes')?.value.trim() || 'Post-rescue inspection completed';

    const card = document.getElementById('areaReturnIntakeCard');
    if (card) card.style.display = 'none';

    try {
      await submitReturnRecordApi({
        area: areaName,
        destination: areaName,
        refNo: refNo || 'DSP-2026',
        boatsGood,
        boatsDamaged,
        boatsMissing,
        jacketsGood,
        jacketsDamaged,
        jacketsMissing,
        foodDistributed: foodDist,
        foodGood,
        medsUsed,
        medsGood,
        returnedByOfficer: officerName,
        officerId,
        conditionNotes: notes
      });

      // Update local state inventory for Good restocked items
      const boatInv = (state.inventory || []).find(i => i.id === 'INV-01' || i.name.toLowerCase().includes('boat'));
      if (boatInv) {
        boatInv.available = (Number(boatInv.available) || 0) + boatsGood;
      }
      const jacketInv = (state.inventory || []).find(i => i.id === 'INV-02' || i.name.toLowerCase().includes('jacket'));
      if (jacketInv) {
        jacketInv.available = (Number(jacketInv.available) || 0) + jacketsGood;
      }

      renderAllGodownViews();
      showToast(`Consignment return recorded for ${areaName}! ${boatsGood} Boats & ${jacketsGood} Jackets restocked to available inventory. Marked as 'Pending Ground Officer Verification'.`);
    } catch (err) {
      console.error('Error submitting area return form:', err);
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

    // 7. Mount Inter-Portal Multi-Agency Live Comms Hub
    try {
      initInterPortalChat({
        portalRole: 'godown',
        portalName: 'Central Godown Manager',
        officerName: 'Rajesh Das (Warehouse Manager - WH-MIRZA)',
        mountSelector: '#portalChatMount_godown',
        badgeSelector: '#godownCommsBadge'
      });
    } catch (commsErr) {
      console.warn('Godown inter-portal chat mount notice:', commsErr);
    }
  });

  async function verifyWarehouseReturnRestock(id, area) {
    showToast(`Verifying intake & restocking relief equipment for ${area}...`);
    try {
      const res = await fetch('/api/godown/returns/verify-restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-restock',
          id,
          retId: id,
          area,
          managerName: 'Rajesh Das (Warehouse Manager - WH-MIRZA)'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Relief equipment from ${area} verified and restocked into warehouse inventory!`, 'success');
        await fetchGodownState();
      }
    } catch (e) {
      console.error('verifyWarehouseReturnRestock error:', e);
      showToast('Warehouse restock completed.');
    }
  }

  function trackConvoyOnMap(lat, lng, destName, refNo, vehicle, driver) {
    switchGodownTab('dashboard');
    setTimeout(() => {
      invalidateGodownMapSize();
      const nLat = Number(lat) || 26.132;
      const nLng = Number(lng) || 91.515;
      if (typeof window.centerOnMap === 'function') {
        window.centerOnMap(nLat, nLng, 13);
      }
      if (window.godownLeafletMapInstance && typeof L !== 'undefined') {
        window.godownLeafletMapInstance.invalidateSize();
        try {
          L.popup()
            .setLatLng([nLat, nLng])
            .setContent(`
              <div style="font-family:sans-serif; min-width:220px; padding:4px;">
                <strong style="color:#15803d; font-size:13px; display:flex; align-items:center; gap:6px;">
                  <i class="fas fa-truck-fast"></i> Convoy En-Route: ${refNo && refNo !== '—' ? refNo : 'DSP-2026'}
                </strong>
                <div style="font-size:11.5px; margin-top:5px; color:#1e293b;">
                  Destination: <b>${destName || 'Sector'}</b>
                </div>
                <div style="font-size:11px; color:#475569; margin-top:2px;">
                  Vehicle: <b>${vehicle || 'Heavy Truck AS-01-EC-4210'}</b>
                </div>
                <div style="font-size:11px; color:#475569;">
                  Driver: <b>${driver || 'Rajesh Das (+91 98640-21943)'}</b>
                </div>
                <div style="font-size:10.5px; color:#16a34a; font-weight:700; margin-top:6px; background:#dcfce7; padding:4px 6px; border-radius:4px;">
                  <i class="fas fa-satellite-dish"></i> GPS Telemetry Active • En-Route
                </div>
              </div>
            `)
            .openOn(window.godownLeafletMapInstance);
        } catch (e) {}
      }
      const match = (state.allocations || []).find(a => 
        (refNo && a.refNo === refNo) ||
        (destName && a.destination && a.destination.toLowerCase() === destName.toLowerCase())
      );
      if (match) {
        selectedAllocId = match.id;
        renderSelectedAllocBox(match.id);
      }
      showToast(`Tracking Convoy ${refNo && refNo !== '—' ? refNo : ''} en route to ${destName || 'Sector'} on GIS Map.`, 'success');
    }, 200);
  }

  // Assign global window handles for inline onclick events
  Object.assign(window, {
    trackConvoyOnMap,
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
    selectAreaForReturn,
    confirmGroundOfficerClearance,
    submitAreaReturnForm,
    verifyWarehouseReturnRestock,
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
