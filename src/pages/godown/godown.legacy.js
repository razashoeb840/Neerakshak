// Original 4godown.html logic, kept unchanged (only DOMContentLoaded -> __onReady, .html links -> routes).
export default function initGodownPage() {
const __ready = [];
const __onReady = (fn) => __ready.push(fn);

        /* =====================================================================
           NEERAKSHAK GODOWN MANAGER DATA STATE (Reference Drill vs Empty API State)
           ===================================================================== */
        /* =====================================================================
           NEERAKSHAK GODOWN SEED DATA LOADER (CONNECTED TO seed.js)
           ===================================================================== */
        function getSeedGodownData() {
            if (window.NEERAKSHAK_SEED_DATA && window.NEERAKSHAK_SEED_DATA.godown) {
                return JSON.parse(JSON.stringify(window.NEERAKSHAK_SEED_DATA.godown));
            }
            return {
                inventory: [],
                allocations: [],
                returns: [],
                movements: []
            };
        }

        let isDrillMode = true;
        let isListView = false;
        let state = getSeedGodownData();

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
                state = getSeedGodownData();
                if (btn) btn.innerHTML = '<i class="fas fa-database"></i> Reference Drill';
                if (stText) stText.textContent = 'Depot Active';
                showToast('Switched to Reference Drill dataset from seed.js.');
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
        }

        function switchGodownTab(tabKey, btnEl) {
            document.querySelectorAll('.gd-nav-btn').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
            document.querySelectorAll('.gd-tab-pane').forEach(p => p.classList.remove('active'));
            const target = document.getElementById(`tab-${tabKey}`);
            if (target) target.classList.add('active');
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
            const whFilter = document.getElementById('warehouseSelector')?.value || 'ALL';
            const visibleInv = state.inventory.filter(i => whFilter === 'ALL' || i.warehouse === whFilter);

            const totalUnits = visibleInv.reduce((s, i) => s + i.total, 0);
            const availUnits = visibleInv.reduce((s, i) => s + i.available, 0);
            const allocUnits = visibleInv.reduce((s, i) => s + i.allocated, 0);
            const dispUnits = visibleInv.reduce((s, i) => s + i.dispatched, 0);
            const lowStockItems = visibleInv.filter(i => i.available <= i.minLimit);
            const pendingDispatches = state.allocations.filter(a => a.status !== 'Dispatched');

            document.getElementById('navInvCount').textContent = visibleInv.length;
            document.getElementById('navApprovedCount').textContent = state.allocations.length;
            document.getElementById('navPendingDispCount').textContent = pendingDispatches.length;
            document.getElementById('navLowStockCount').textContent = lowStockItems.length;

            // 1. Vibrant Gradient 6-KPI Stock Overview Strip
            const kpis = [
                { val: isDrillMode ? totalUnits.toLocaleString() : '0', lbl: 'Total Resources', icon: 'fa-warehouse', grad: 'kpi-grad-blue' },
                { val: isDrillMode ? availUnits.toLocaleString() : '0', lbl: 'Available Stock', icon: 'fa-box-open', grad: 'kpi-grad-green' },
                { val: isDrillMode ? allocUnits.toLocaleString() : '0', lbl: 'Allocated Stock', icon: 'fa-clipboard-check', grad: 'kpi-grad-indigo' },
                { val: isDrillMode ? dispUnits.toLocaleString() : '0', lbl: 'Dispatched Stock', icon: 'fa-truck-fast', grad: 'kpi-grad-teal' },
                { val: isDrillMode ? lowStockItems.length : '0', lbl: 'Low Stock Items', icon: 'fa-triangle-exclamation', grad: 'kpi-grad-red' },
                { val: isDrillMode ? pendingDispatches.length : '0', lbl: 'Pending Dispatches', icon: 'fa-hourglass-half', grad: 'kpi-grad-amber' }
            ];

            document.getElementById('stockOverviewKpis').innerHTML = kpis.map(k => `
                <div class="kpi-tile ${k.grad}">
                    <div class="kpi-ic"><i class="fas ${k.icon}"></i></div>
                    <div>
                        <div class="kpi-val">${k.val}</div>
                        <div class="kpi-lbl">${k.lbl}</div>
                    </div>
                </div>
            `).join('');

            // 2. Colorful Dispatch Cards Renderer
            const buildDispatchCards = (list) => {
                if (list.length === 0) {
                    return `<div style="grid-column:1/-1; text-align:center; padding:18px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);">No Authority-approved allocations in queue.</div>`;
                }
                return list.map((a, idx) => {
                    const invItem = state.inventory.find(i => i.id === a.resourceId);
                    const avail = invItem ? invItem.available : 0;
                    const hasEnough = avail >= a.qty;
                    const tone = !hasEnough ? 'tone-critical' : getCardToneClass(a.priority, a.status);
                    return `
                        <div class="sub-card ${tone}">
                            <div class="sub-card-top">
                                <div>
                                    <h4><i class="fas fa-location-dot" style="color:var(--river-blue); margin-right:5px;"></i>${a.destination}</h4>
                                    <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${a.id} • ${a.resourceName}</span>
                                </div>
                                <span class="pill ${getPriorityPill(a.priority)}">${a.priority}</span>
                            </div>
                            <div class="meta-box">
                                <span>Approved Qty: <strong>${a.qty}</strong></span>
                                <span>Warehouse Stock: <strong style="color:${hasEnough ? '#15803d' : '#dc2626'};">${avail} (${hasEnough ? 'Ready' : 'Shortage'})</strong></span>
                                <span>Vehicle: <strong>${a.vehicle}</strong></span>
                                <span>Ref / Time: <strong>${a.refNo}</strong></span>
                            </div>
                            <div class="sub-card-footer">
                                <span class="pill ${getStatusPill(a.status)}">${a.status}</span>
                                ${a.status !== 'Dispatched' ? (
                                    hasEnough
                                        ? `<button class="btn-gd primary" onclick="openDispatchModal(${idx})"><i class="fas fa-truck"></i> Prepare & Dispatch</button>`
                                        : `<button class="btn-gd warn" onclick="reportShortageToAuthority(${idx})"><i class="fas fa-bell"></i> Report Shortage</button>`
                                ) : `<span style="font-size:11px; font-weight:700; color:#15803d;"><i class="fas fa-check-circle"></i> Dispatched (${a.dispatchTime})</span>`}
                            </div>
                        </div>
                    `;
                }).join('');
            };

            const dispatchHtml = buildDispatchCards(state.allocations);
            document.getElementById('dashDispatchCardGrid').innerHTML = dispatchHtml;
            document.getElementById('fullApprovedReqGrid').innerHTML = dispatchHtml;
            document.getElementById('fullDispatchCardGrid').innerHTML = dispatchHtml;

            // 3. Colorful Inventory Cards Renderer
            const buildInventoryCards = (items, showEditBtn) => {
                if (items.length === 0) {
                    return `<div style="grid-column:1/-1; text-align:center; padding:18px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);">No warehouse inventory items found.</div>`;
                }
                return items.map(i => {
                    const origIdx = state.inventory.indexOf(i);
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
                                    <button class="btn-gd" onclick="openUpdateStockModal(${origIdx})"><i class="fas fa-pen"></i> Update Stock</button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
            };

            document.getElementById('dashInventoryCardGrid').innerHTML = buildInventoryCards(visibleInv.slice(0, 6), false);

            const catFilter = document.getElementById('invCategoryFilter')?.value || 'ALL';
            const filteredInv = visibleInv.filter(i => catFilter === 'ALL' || i.category === catFilter);
            document.getElementById('fullInventoryCardGrid').innerHTML = buildInventoryCards(filteredInv, true);

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
                            <button class="btn-gd" onclick="switchGodownTab('add-stock', document.querySelector('[data-tab=add-stock]'))">+ Restock</button>
                            <button class="btn-gd warn" onclick="showToast('Restock requirement reported to Authority.')">Alert Authority</button>
                        </div>
                    </div>
                `).join('');

            document.getElementById('dashLowStockGrid').innerHTML = lowStockHtml;
            document.getElementById('lowStockCardsGrid').innerHTML = lowStockHtml;

            // 5. Recent Stock Movement Cards
            const movementHtml = state.movements.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No stock movements recorded yet.</div>`
                : state.movements.map(m => {
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

            document.getElementById('dashRecentActivityGrid').innerHTML = state.movements.slice(0, 2).map(m => `
                <div class="sub-card ${m.type === 'DISPATCH' ? 'tone-good' : 'tone-purple'}">
                    <div class="sub-card-top">
                        <h4>${m.item}</h4>
                        <span class="pill p-verified">${m.type}</span>
                    </div>
                    <div style="font-size:11px; color:var(--text-body);">${m.party}</div>
                    <div style="font-size:10px; color:var(--text-muted);">${m.time}</div>
                </div>
            `).join('') || `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No recent movements.</div>`;

            document.getElementById('movementLogsCardGrid').innerHTML = movementHtml;

            // 6. Stock Verification Grid
            document.getElementById('stockVerificationGrid').innerHTML = state.allocations.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No allocations pending verification.</div>`
                : state.allocations.map((a, idx) => {
                    const inv = state.inventory.find(i => i.id === a.resourceId);
                    const avail = inv ? inv.available : 0;
                    const ok = avail >= a.qty;
                    return `
                        <div class="sub-card ${ok ? 'tone-good' : 'tone-critical'}">
                            <div class="sub-card-top">
                                <h4>${a.id} • ${a.destination}</h4>
                                <span class="pill ${ok ? 'p-good' : 'p-critical'}">${ok ? 'Stock Verified Ready' : 'Shortage Detected'}</span>
                            </div>
                            <div class="meta-box">
                                <span>Required: <strong>${a.qty} ${a.resourceName}</strong></span>
                                <span>Physical Available: <strong>${avail}</strong></span>
                            </div>
                            <div class="sub-card-footer">
                                ${ok
                                    ? `<button class="btn-gd primary" onclick="openDispatchModal(${idx})">Reserve & Dispatch</button>`
                                    : `<button class="btn-gd warn" onclick="reportShortageToAuthority(${idx})">Report Shortage to Authority</button>`}
                            </div>
                        </div>
                    `;
                }).join('');

            // 7. Return Management Cards
            document.getElementById('returnsCardGrid').innerHTML = state.returns.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No post-operation return entries recorded yet.</div>`
                : state.returns.map(r => `
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

            // 8. Reports Summary Cards
            document.getElementById('reportSummaryCards').innerHTML = `
                <div class="sub-card tone-good"><span>Available vs Allocated</span><strong>${availUnits} Avail / ${allocUnits} Alloc</strong></div>
                <div class="sub-card tone-purple"><span>Total Dispatched Consignments</span><strong>${state.allocations.filter(a => a.status === 'Dispatched').length} Completed</strong></div>
                <div class="sub-card tone-amber"><span>Damaged / Missing Returns</span><strong>${state.returns.reduce((s, r) => s + r.damaged + r.missing, 0)} Units Flagged</strong></div>
            `;
        }

        /* =====================================================================
           ACTION HANDLERS
           ===================================================================== */
        function openDispatchModal(allocIdx) {
            const alloc = state.allocations[allocIdx];
            if (!alloc) return;
            document.getElementById('dispAllocIndex').value = allocIdx;
            document.getElementById('dispAllocSummary').innerHTML = `<strong>${alloc.id}</strong> • ${alloc.resourceName} (Approved Qty: <strong>${alloc.qty}</strong>)`;
            document.getElementById('dispQtyInput').value = alloc.qty;
            document.getElementById('dispDestInput').value = alloc.destination;
            document.getElementById('dispVehicleInput').value = '';
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            document.getElementById('dispDateTimeInput').value = now.toISOString().slice(0, 16);
            document.getElementById('dispatchModal').classList.add('open');
        }

        function confirmDispatchSubmission(e) {
            e.preventDefault();
            const idx = Number(document.getElementById('dispAllocIndex').value);
            const qty = Number(document.getElementById('dispQtyInput').value);
            const vehicle = document.getElementById('dispVehicleInput').value.trim();
            const dest = document.getElementById('dispDestInput').value.trim();
            const dt = document.getElementById('dispDateTimeInput').value.replace('T', ' ');
            const alloc = state.allocations[idx];

            const invItem = state.inventory.find(i => i.id === alloc.resourceId);
            if (invItem) {
                invItem.available = Math.max(0, invItem.available - qty);
                invItem.allocated = Math.max(0, invItem.allocated - qty);
                invItem.dispatched += qty;
                if (invItem.available <= invItem.minLimit) {
                    invItem.condition = 'Low Stock';
                }
            }

            const refNo = 'DSP-2026-' + Math.floor(100 + Math.random() * 899);
            alloc.status = 'Dispatched';
            alloc.vehicle = vehicle;
            alloc.dispatchTime = dt;
            alloc.refNo = refNo;

            state.movements.unshift({
                time: 'Just now',
                type: 'DISPATCH',
                item: `${qty} ${alloc.resourceName}`,
                party: `To: ${dest}`,
                note: `Ref: ${refNo} • Vehicle ${vehicle} (Awaiting Ground Officer Verification)`
            });

            closeModal('dispatchModal');
            renderAllGodownViews();
            showToast(`Dispatched ${qty} ${alloc.resourceName} (Ref: ${refNo}). Available stock updated.`);
        }

        function reportShortageToAuthority(idx) {
            const alloc = state.allocations[idx];
            alloc.status = 'Shortage Flagged';
            state.movements.unshift({
                time: 'Just now',
                type: 'SHORTAGE ALERT',
                item: `${alloc.resourceName} (Req: ${alloc.qty})`,
                party: `For: ${alloc.destination}`,
                note: 'Shortage reported to District Authority for reallocation/restock'
            });
            renderAllGodownViews();
            showToast(`Shortage alert transmitted to District Authority for ${alloc.id}.`);
        }

        function handleAddNewStock(e) {
            e.preventDefault();
            const name = document.getElementById('newStockName').value.trim();
            const category = document.getElementById('newStockCat').value;
            const qty = Number(document.getElementById('newStockQty').value);
            const warehouse = document.getElementById('newStockWarehouse').value;
            const date = document.getElementById('newStockDate').value;
            const supplier = document.getElementById('newStockSupplier').value.trim();
            const minLimit = Number(document.getElementById('newStockMin').value);

            state.inventory.unshift({
                id: 'INV-' + Math.floor(10 + Math.random() * 89),
                name,
                category,
                warehouse,
                total: qty,
                available: qty,
                allocated: 0,
                dispatched: 0,
                minLimit,
                condition: qty <= minLimit ? 'Low Stock' : 'Good'
            });

            state.movements.unshift({
                time: date || 'Just now',
                type: 'STOCK IN',
                item: `${qty} ${name}`,
                party: `From: ${supplier}`,
                note: `Added to ${warehouse}`
            });

            e.target.reset();
            renderAllGodownViews();
            showToast(`Added ${qty} ${name} to warehouse inventory.`);
            switchGodownTab('inventory', document.querySelector('[data-tab=inventory]'));
        }

        function openUpdateStockModal(invIdx) {
            const item = state.inventory[invIdx];
            if (!item) return;
            document.getElementById('updInvIndex').value = invIdx;
            document.getElementById('updInvTitle').textContent = `${item.name} (${item.warehouse})`;
            document.getElementById('updAvailQty').value = item.available;
            document.getElementById('updCondition').value = item.condition;
            document.getElementById('updReason').value = '';
            document.getElementById('updateStockModal').classList.add('open');
        }

        function submitStockCorrection(e) {
            e.preventDefault();
            const idx = Number(document.getElementById('updInvIndex').value);
            const newAvail = Number(document.getElementById('updAvailQty').value);
            const cond = document.getElementById('updCondition').value;
            const reason = document.getElementById('updReason').value.trim();
            const item = state.inventory[idx];

            item.available = newAvail;
            item.condition = cond;
            state.movements.unshift({
                time: 'Just now',
                type: 'CORRECTION',
                item: `${item.name} (Avail: ${newAvail})`,
                party: item.warehouse,
                note: `Condition: ${cond} • Reason: ${reason}`
            });

            closeModal('updateStockModal');
            renderAllGodownViews();
            showToast(`Inventory updated for ${item.name}.`);
        }

        function openReturnModal() {
            const sel = document.getElementById('retResourceSel');
            sel.innerHTML = state.inventory.length
                ? state.inventory.map(i => `<option value="${i.id}">${i.name}</option>`).join('')
                : `<option value="INV-01">Inflatable Rescue Boats</option>`;
            document.getElementById('retFromLoc').value = '';
            document.getElementById('returnModal').classList.add('open');
        }

        function submitReturnRecord(e) {
            e.preventDefault();
            const resId = document.getElementById('retResourceSel').value;
            const fromLoc = document.getElementById('retFromLoc').value.trim();
            const good = Number(document.getElementById('retGoodQty').value);
            const damaged = Number(document.getElementById('retDamagedQty').value);
            const missing = Number(document.getElementById('retMissingQty').value);

            const invItem = state.inventory.find(i => i.id === resId);
            const resName = invItem ? invItem.name : 'Rescue Resource';

            if (invItem && good > 0) {
                invItem.available += good;
                invItem.dispatched = Math.max(0, invItem.dispatched - (good + damaged + missing));
            }

            state.returns.unshift({
                id: 'RET-' + Math.floor(305 + Math.random() * 90),
                resourceId: resId,
                resourceName: resName,
                from: fromLoc,
                good,
                damaged,
                missing,
                date: 'Just now'
            });

            state.movements.unshift({
                time: 'Just now',
                type: 'RETURN AUDIT',
                item: `${resName} (Good: ${good}, Damaged: ${damaged}, Missing: ${missing})`,
                party: `From: ${fromLoc}`,
                note: 'Only verified Good items added back to Available Stock'
            });

            closeModal('returnModal');
            renderAllGodownViews();
            showToast(`Return logged: ${good} Good restocked, ${damaged} Damaged, ${missing} Missing.`);
        }

        function closeModal(id) {
            document.getElementById(id).classList.remove('open');
        }

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.style.right = '18px';
            setTimeout(() => { t.style.right = '-380px'; }, 3200);
        }

        __onReady( () => {
            const dateInput = document.getElementById('newStockDate');
            if (dateInput) dateInput.valueAsDate = new Date();
            renderAllGodownViews();
        });
    

// Inline handlers (onClick=...) and generated HTML call these on window, exactly like a classic script.
Object.assign(window, { closeModal, confirmDispatchSubmission, getCardToneClass, getPriorityPill, getSeedGodownData, getStatusPill, handleAddNewStock, openDispatchModal, openReturnModal, openUpdateStockModal, renderAllGodownViews, reportShortageToAuthority, showToast, submitReturnRecord, submitStockCorrection, switchGodownTab, toggleDataMode, toggleGridListView });
__ready.forEach((fn) => fn());
}
