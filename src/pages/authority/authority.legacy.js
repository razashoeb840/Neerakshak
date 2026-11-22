// Original 3authority.html logic, kept unchanged (only DOMContentLoaded -> __onReady, .html links -> routes).
export default function initAuthorityPage() {
const __ready = [];
const __onReady = (fn) => __ready.push(fn);

        /* =====================================================================
           NEERAKSHAK AUTHORITY DATA STATE (Reference Drill vs Empty API State)
           ===================================================================== */
        /* =====================================================================
           NEERAKSHAK AUTHORITY SEED DATA LOADER (DECOUPLED FROM seed.js)
           All initial seed records are loaded from seed.js.
           Deleting records in seed.js cleanly cascades to empty portal states.
           ===================================================================== */
        function getSeedAuthorityData() {
            const seed = (window.NEERAKSHAK_SEED_DATA && window.NEERAKSHAK_SEED_DATA.authority) || {};
            return {
                villages: Array.isArray(seed.villages) ? JSON.parse(JSON.stringify(seed.villages)) : [],
                requests: Array.isArray(seed.requests) ? JSON.parse(JSON.stringify(seed.requests)) : [],
                allocations: Array.isArray(seed.allocations) ? JSON.parse(JSON.stringify(seed.allocations)) : [],
                coordinations: Array.isArray(seed.coordinations) ? JSON.parse(JSON.stringify(seed.coordinations)) : [],
                operations: Array.isArray(seed.operations) ? JSON.parse(JSON.stringify(seed.operations)) : [],
                logs: Array.isArray(seed.logs) ? JSON.parse(JSON.stringify(seed.logs)) : []
            };
        }

        let isDrillMode = true;
        let state = getSeedAuthorityData();
        let selectedVillageId = state.villages.length ? state.villages[0].id : null;

        function toggleDataMode() {
            isDrillMode = !isDrillMode;
            const btn = document.getElementById('dataModeBtn');
            const stText = document.getElementById('telemetryStatusText') || document.getElementById('headerStatusLabel');
            if (isDrillMode) {
                state = getSeedAuthorityData();
                selectedVillageId = state.villages.length ? state.villages[0].id : null;
                if (btn) btn.innerHTML = '<i class="fas fa-database"></i> Reference Drill';
                if (stText) stText.textContent = 'Command Active';
                showToast('Switched to Reference Drill dataset from seed telemetry.');
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
                showToast('Switched to Empty API State.');
            }
            renderAllAuthorityViews();
        }

        function switchAuthTab(tabKey, btnEl) {
            document.querySelectorAll('.auth-nav-btn').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
            document.querySelectorAll('.tab-view-pane').forEach(p => p.classList.remove('active'));
            const target = document.getElementById(`tab-${tabKey}`);
            if (target) target.classList.add('active');
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

        function renderAllAuthorityViews() {
            const critHighCount = state.villages.filter(v => v.severity === 'Critical' || v.severity === 'High').length;
            const pendingReqs = state.requests.filter(r => r.status === 'Pending').length;

            document.getElementById('navCriticalBadge').textContent = critHighCount;
            document.getElementById('navReqBadge').textContent = pendingReqs;
            document.getElementById('navTrackBadge').textContent = state.allocations.length;

            // 1. 4-KPI Strip
            const kpis = [
                { val: isDrillMode ? critHighCount : '0', lbl: 'Critical & High Villages', icon: 'fa-triangle-exclamation', bg: '#fee2e2', color: '#dc2626' },
                { val: isDrillMode ? pendingReqs : '0', lbl: 'Pending Approvals', icon: 'fa-clipboard-check', bg: '#fef3c7', color: '#d97706' },
                { val: isDrillMode ? state.allocations.length : '0', lbl: 'Sent to Godown Manager', icon: 'fa-warehouse', bg: '#e0f2fe', color: '#0284c7' },
                { val: isDrillMode ? state.operations.length : '0', lbl: 'Active Rescue Operations', icon: 'fa-life-ring', bg: '#dcfce7', color: '#15803d' }
            ];

            document.getElementById('authorityKpiGrid').innerHTML = kpis.map(k => `
                <div class="kpi-card-box">
                    <div class="kpi-icon-sq" style="background:${k.bg}; color:${k.color};"><i class="fas ${k.icon}"></i></div>
                    <div>
                        <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:17px; font-weight:800; color:var(--navy-deep); line-height:1.1;">${k.val}</div>
                        <div style="font-size:10.5px; font-weight:600; color:var(--text-muted); margin-top:2px;">${k.lbl}</div>
                    </div>
                </div>
            `).join('');

            // 2. Village Cards Helper
            const renderVillageCards = (list) => {
                if (list.length === 0) {
                    return `<div style="grid-column:1/-1; text-align:center; padding:18px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);">No flood-affected villages loaded from Admin telemetry.</div>`;
                }
                return list.map(v => `
                    <div class="decision-card" style="${v.id === selectedVillageId ? 'border-color:#0284c7; background:#ffffff;' : ''}">
                        <div class="dc-top">
                            <div>
                                <h4>${v.name}</h4>
                                <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${v.block}</span>
                            </div>
                            <span class="status-pill ${getSevPill(v.severity)}">${v.severity}</span>
                        </div>
                        <div class="dc-meta-box">
                            <span>Affected Pop: <strong>${v.pop.toLocaleString()}</strong></span>
                            <span>Need: <strong>${v.assessedNeed.boats} Boats, ${v.assessedNeed.food} Food</strong></span>
                        </div>
                        <p style="margin:0; font-size:11.5px; color:var(--text-body);">${v.waterStatus}</p>
                        <div class="dc-actions">
                            <button class="btn-card-action" onclick="selectVillageForAssessment('${v.id}', true)"><i class="fas fa-eye"></i> Area Details & Assess</button>
                            <button class="btn-card-action approve" onclick="quickSendVillageToGodown('${v.id}')"><i class="fas fa-paper-plane"></i> Allocate to Godown</button>
                        </div>
                    </div>
                `).join('');
            };

            document.getElementById('dashCriticalVillagesGrid').innerHTML = renderVillageCards(
                state.villages.filter(v => v.severity === 'Critical' || v.severity === 'High')
            );

            const mapSev = document.getElementById('mapSevSelect')?.value || 'ALL';
            document.getElementById('fullCriticalAreasGrid').innerHTML = renderVillageCards(
                state.villages.filter(v => mapSev === 'ALL' || v.severity === mapSev)
            );

            // 3. Area Details & Resource Assessment Calculator
            const selectedV = state.villages.find(v => v.id === selectedVillageId) || state.villages[0];
            const areaBox = document.getElementById('areaDetailsPanel');
            if (!selectedV) {
                areaBox.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-muted);">Select an affected village to inspect population, severity, and resource requirements.</div>`;
            } else {
                areaBox.innerHTML = `
                    <div class="card-head">
                        <h2><i class="fas fa-house-flood-water" style="color: var(--river-blue);"></i> Area Details & Resource Assessment – ${selectedV.name}</h2>
                        <span class="status-pill ${getSevPill(selectedV.severity)}">${selectedV.severity} Severity</span>
                    </div>
                    <div class="cards-grid-3" style="margin-bottom:12px;">
                        <div class="decision-card"><span>Revenue Circle</span><strong>${selectedV.block}</strong></div>
                        <div class="decision-card"><span>Affected Population</span><strong>${selectedV.pop.toLocaleString()} Citizens</strong></div>
                        <div class="decision-card"><span>Hydrological Status</span><strong>${selectedV.waterStatus}</strong></div>
                    </div>
                    <div style="background:#f4fafe; border:1.5px solid #bde0f7; border-radius:12px; padding:12px;">
                        <strong style="font-size:13px; color:var(--navy-deep);"><i class="fas fa-calculator" style="color:var(--river-blue); margin-right:6px;"></i> Resource Assessment & Godown Dispatch Allocation</strong>
                        <p style="margin:3px 0 10px; font-size:11.5px; color:var(--text-muted);">Adjust required quantities below and transmit approved allocation directly to the Godown Manager:</p>
                        <div class="assessment-form-grid">
                            <div class="res-qty-card"><label>Rescue Boats</label><input type="number" id="assessBoats" value="${selectedV.assessedNeed.boats}" min="0" /></div>
                            <div class="res-qty-card"><label>Life Jackets</label><input type="number" id="assessJackets" value="${selectedV.assessedNeed.jackets}" min="0" /></div>
                            <div class="res-qty-card"><label>Food Packets</label><input type="number" id="assessFood" value="${selectedV.assessedNeed.food}" min="0" /></div>
                            <div class="res-qty-card"><label>Medicine Kits</label><input type="number" id="assessMeds" value="${selectedV.assessedNeed.meds}" min="0" /></div>
                        </div>
                        <div style="margin-top:12px; display:flex; justify-content:flex-end;">
                            <button class="btn-card-action approve" style="padding:8px 16px; font-size:12px;" onclick="confirmAssessedAllocation('${selectedV.name.replace(/'/g, "\\'")}')">
                                <i class="fas fa-paper-plane"></i> Approve & Send Allocation to Godown Manager
                            </button>
                        </div>
                    </div>
                `;
            }

            // 4. Resource Requests & Approval Desk
            const renderReqCards = (showActions) => {
                if (state.requests.length === 0) {
                    return `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No resource requests available.</div>`;
                }
                return state.requests.map((r, idx) => `
                    <div class="decision-card">
                        <div class="dc-top">
                            <div>
                                <h4>${r.id} • ${r.village}</h4>
                                <span style="font-size:11px; color:var(--text-muted); font-weight:600;">From: ${r.from}</span>
                            </div>
                            <span class="status-pill ${getSevPill(r.status)}">${r.status}</span>
                        </div>
                        <div class="dc-meta-box">
                            <span>Requested: <strong>${r.items}</strong></span>
                            <span>Urgency: <strong>${r.urgency}</strong></span>
                        </div>
                        <p style="margin:0; font-size:11.5px; color:var(--text-body);"><strong>Decision Note:</strong> ${r.reason}</p>
                        ${showActions && r.status === 'Pending' ? `
                            <div class="dc-actions">
                                <button class="btn-card-action approve" onclick="openDecisionModal(${idx}, 'Approved')"><i class="fas fa-check"></i> Approve & Send to Godown</button>
                                <button class="btn-card-action reject" onclick="openDecisionModal(${idx}, 'Rejected')"><i class="fas fa-xmark"></i> Reject with Reason</button>
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            };

            document.getElementById('allRequestsGrid').innerHTML = renderReqCards(false);
            document.getElementById('approvalDeskGrid').innerHTML = renderReqCards(true);

            // 5. Resource Allocation & Allocation Tracking
            const allocHtml = state.allocations.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No allocations dispatched to Godown Manager yet.</div>`
                : state.allocations.map(a => `
                    <div class="decision-card">
                        <div class="dc-top">
                            <div>
                                <h4>${a.id} • ${a.village}</h4>
                                <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${a.summary}</span>
                            </div>
                            <span class="status-pill st-dispatched">${a.godownStatus}</span>
                        </div>
                        <div class="progress-track"><div class="progress-fill" style="width:${a.deliveryProgress}%;"></div></div>
                        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted);">
                            <span>Godown Coordination: <strong>Transmitted</strong></span>
                            <span>Delivery Progress: <strong>${a.deliveryProgress}%</strong></span>
                        </div>
                    </div>
                `).join('');

            document.getElementById('allocatedVillagesGrid').innerHTML = allocHtml;
            document.getElementById('trackingGrid').innerHTML = allocHtml;

            // 6. NDRF / SDRF Coordination
            document.getElementById('coordRecordsGrid').innerHTML = state.coordinations.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No NDRF/SDRF coordination updates recorded.</div>`
                : state.coordinations.map(c => `
                    <div class="decision-card">
                        <div class="dc-top">
                            <h4>${c.agency} • ${c.sector}</h4>
                            <span class="status-pill st-approved">Official Channel</span>
                        </div>
                        <p style="margin:0; font-size:12px; color:var(--text-body);">${c.update}</p>
                    </div>
                `).join('');

            // 7. Operation Management
            document.getElementById('operationsGrid').innerHTML = state.operations.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No operations recorded yet.</div>`
                : state.operations.map(op => `
                    <div class="decision-card">
                        <div class="dc-top">
                            <h4>${op.title}</h4>
                            <span class="status-pill ${getSevPill(op.status)}">${op.status}</span>
                        </div>
                        <p style="margin:0; font-size:12px; color:var(--text-body);">${op.summary}</p>
                    </div>
                `).join('');

            // 8. Reports & Activity Logs
            document.getElementById('reportSummaryCards').innerHTML = `
                <div class="decision-card"><span>Villages Assessed</span><strong style="font-size:20px; color:var(--river-blue);">${state.villages.length}</strong></div>
                <div class="decision-card"><span>Approved Allocations</span><strong style="font-size:20px; color:var(--foliage-mid);">${state.allocations.length}</strong></div>
                <div class="decision-card"><span>Pending Requests</span><strong style="font-size:20px; color:#d97706;">${pendingReqs}</strong></div>
            `;

            document.getElementById('auditLogsGrid').innerHTML = state.logs.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No activity logs recorded yet.</div>`
                : state.logs.map(l => `
                    <div class="decision-card">
                        <div class="dc-top"><strong>${l.actor}</strong><span style="font-size:11px; color:var(--text-muted);">${l.time}</span></div>
                        <p style="margin:0; font-size:12px; color:var(--text-body);">${l.note}</p>
                    </div>
                `).join('');

            // 9. Right Panel Selected Village Inspector & Godown Sync
            const rightVBox = document.getElementById('rightSelectedVillageBox');
            if (!selectedV) {
                rightVBox.innerHTML = `<div style="font-size:11.5px; color:var(--text-muted); text-align:center; padding:10px;">No village selected.</div>`;
            } else {
                rightVBox.innerHTML = `
                    <div class="decision-card" style="padding:10px 12px;">
                        <div class="dc-top">
                            <h4>${selectedV.name}</h4>
                            <span class="status-pill ${getSevPill(selectedV.severity)}">${selectedV.severity}</span>
                        </div>
                        <div style="font-size:11px; color:var(--text-body);">
                            Pop: <strong>${selectedV.pop.toLocaleString()}</strong> • Need: <strong>${selectedV.assessedNeed.boats} Boats, ${selectedV.assessedNeed.food} Food</strong>
                        </div>
                        <button class="btn-card-action approve" style="justify-content:center;" onclick="selectVillageForAssessment('${selectedV.id}', true)">
                            Open Area Details & Allocate
                        </button>
                    </div>
                `;
            }

            document.getElementById('rightGodownSyncBox').innerHTML = state.allocations.length === 0
                ? `<div style="font-size:11.5px; color:var(--text-muted); text-align:center; padding:10px;">No dispatches queued at Godown.</div>`
                : state.allocations.slice(0, 2).map(a => `
                    <div class="mini-status-tile" style="flex-direction:column; align-items:stretch;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong style="font-size:11.5px; color:var(--navy-deep);">${a.village}</strong>
                            <span style="font-size:10.5px; font-weight:700; color:var(--river-blue);">${a.deliveryProgress}%</span>
                        </div>
                        <div class="progress-track"><div class="progress-fill" style="width:${a.deliveryProgress}%;"></div></div>
                    </div>
                `).join('');
        }

        function quickSendVillageToGodown(vId) {
            const v = state.villages.find(item => item.id === vId);
            if (!v) return;
            const summary = `${v.assessedNeed.boats} Boats, ${v.assessedNeed.jackets} Jackets, ${v.assessedNeed.food} Food, ${v.assessedNeed.meds} Meds`;
            state.allocations.unshift({
                id: 'ALC-' + Math.floor(505 + Math.random() * 90),
                village: v.name,
                summary,
                godownStatus: 'Sent to Godown Manager • Awaiting Dispatch',
                deliveryProgress: 35
            });
            state.logs.unshift({
                time: 'Just now',
                actor: 'District Authority (DDMA)',
                note: `Approved & transmitted allocation (${summary}) for ${v.name} to Godown Manager.`
            });
            renderAllAuthorityViews();
            showToast(`Approved resources sent to Godown Manager for ${v.name}.`);
        }

        function confirmAssessedAllocation(villageName) {
            const b = document.getElementById('assessBoats').value;
            const j = document.getElementById('assessJackets').value;
            const f = document.getElementById('assessFood').value;
            const m = document.getElementById('assessMeds').value;
            const summary = `${b} Boats, ${j} Jackets, ${f} Food, ${m} Meds`;

            state.allocations.unshift({
                id: 'ALC-' + Math.floor(510 + Math.random() * 85),
                village: villageName,
                summary,
                godownStatus: 'Sent to Godown Manager • Preparing Dispatch',
                deliveryProgress: 40
            });
            state.logs.unshift({
                time: 'Just now',
                actor: 'District Authority (DDMA)',
                note: `Assessed & allocated (${summary}) to ${villageName}; sent to Godown Manager.`
            });
            renderAllAuthorityViews();
            showToast(`Allocation for ${villageName} sent to Godown Manager.`);
        }

        function openDecisionModal(idx, type) {
            const req = state.requests[idx];
            document.getElementById('decReqIdx').value = idx;
            document.getElementById('decType').value = type;
            document.getElementById('decModalHeading').textContent = `${type === 'Approved' ? 'Approve' : 'Reject'} Request (${req.id})`;
            document.getElementById('decSummaryBox').innerHTML = `<strong>${req.village}</strong> — ${req.items}`;
            document.getElementById('decReasonTxt').value = type === 'Approved' ? 'Approved per flood severity assessment; forwarded to Godown Manager.' : '';
            const btn = document.getElementById('decSubmitBtn');
            btn.textContent = `Confirm ${type}`;
            btn.style.background = type === 'Approved' ? '#16a34a' : '#dc2626';
            document.getElementById('decisionModal').classList.add('open');
        }

        function confirmRequestDecision(e) {
            e.preventDefault();
            const idx = Number(document.getElementById('decReqIdx').value);
            const type = document.getElementById('decType').value;
            const reason = document.getElementById('decReasonTxt').value.trim();
            const req = state.requests[idx];
            req.status = type;
            req.reason = reason;

            if (type === 'Approved') {
                state.allocations.unshift({
                    id: 'ALC-' + Math.floor(520 + Math.random() * 75),
                    village: req.village,
                    summary: req.items,
                    godownStatus: 'Sent to Godown Manager • Preparing Dispatch',
                    deliveryProgress: 35
                });
            }
            state.logs.unshift({
                time: 'Just now',
                actor: 'District Authority (DDMA)',
                note: `${type} ${req.id} (${req.village}) — Reason: ${reason}`
            });
            closeModal('decisionModal');
            renderAllAuthorityViews();
            showToast(`Request ${req.id} ${type.toLowerCase()}.`);
        }

        function openDirectAllocModal() {
            const sel = document.getElementById('allocVillageSel');
            sel.innerHTML = state.villages.length
                ? state.villages.map(v => `<option value="${v.name}">${v.name} (${v.severity})</option>`).join('')
                : `<option value="Palashbari Ward 2">Palashbari Ward 2</option>`;
            document.getElementById('directAllocModal').classList.add('open');
        }

        function submitDirectAllocation(e) {
            e.preventDefault();
            const village = document.getElementById('allocVillageSel').value;
            const b = document.getElementById('allocBoats').value;
            const j = document.getElementById('allocJackets').value;
            const f = document.getElementById('allocFood').value;
            const m = document.getElementById('allocMeds').value;
            const summary = `${b} Boats, ${j} Jackets, ${f} Food, ${m} Meds`;

            state.allocations.unshift({
                id: 'ALC-' + Math.floor(530 + Math.random() * 65),
                village,
                summary,
                godownStatus: 'Sent to Godown Manager • Awaiting Dispatch',
                deliveryProgress: 35
            });
            state.logs.unshift({
                time: 'Just now',
                actor: 'District Authority (DDMA)',
                note: `Direct allocation (${summary}) assigned to ${village} and sent to Godown Manager.`
            });
            closeModal('directAllocModal');
            renderAllAuthorityViews();
            showToast(`Allocation transmitted to Godown Manager for ${village}.`);
        }

        function openCoordModal() {
            document.getElementById('coordSector').value = '';
            document.getElementById('coordUpdate').value = '';
            document.getElementById('coordModal').classList.add('open');
        }

        function submitCoordRecord(e) {
            e.preventDefault();
            const agency = document.getElementById('coordAgency').value;
            const sector = document.getElementById('coordSector').value.trim();
            const update = document.getElementById('coordUpdate').value.trim();
            state.coordinations.unshift({ agency, sector, update });
            state.logs.unshift({
                time: 'Just now',
                actor: 'District Authority (DDMA)',
                note: `Logged ${agency} coordination update for ${sector}.`
            });
            closeModal('coordModal');
            renderAllAuthorityViews();
            showToast(`Recorded ${agency} coordination.`);
        }

        function openOperationModal() {
            document.getElementById('opTitle').value = '';
            document.getElementById('opSummary').value = '';
            document.getElementById('opModal').classList.add('open');
        }

        function submitOperationRecord(e) {
            e.preventDefault();
            const title = document.getElementById('opTitle').value.trim();
            const status = document.getElementById('opStatus').value;
            const summary = document.getElementById('opSummary').value.trim();
            state.operations.unshift({ title, status, summary });
            state.logs.unshift({
                time: 'Just now',
                actor: 'District Authority (DDMA)',
                note: `Updated rescue operation "${title}" (${status}).`
            });
            closeModal('opModal');
            renderAllAuthorityViews();
            showToast(`Operation "${title}" logged.`);
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

        __onReady( renderAllAuthorityViews);
    

// Inline handlers (onClick=...) and generated HTML call these on window, exactly like a classic script.
Object.assign(window, { closeModal, confirmAssessedAllocation, confirmRequestDecision, getSeedAuthorityData, getSevPill, openCoordModal, openDecisionModal, openDirectAllocModal, openOperationModal, quickSendVillageToGodown, renderAllAuthorityViews, selectVillageForAssessment, showToast, submitCoordRecord, submitDirectAllocation, submitOperationRecord, switchAuthTab, toggleDataMode });
__ready.forEach((fn) => fn());
}
