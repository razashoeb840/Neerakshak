// Original 5groundofficer.html logic, kept unchanged (only DOMContentLoaded -> __onReady, .html links -> routes).
export default function initGroundOfficerPage() {
const __ready = [];
const __onReady = (fn) => __ready.push(fn);

        /* =====================================================================
           NEERAKSHAK GROUND OFFICER STATE (Reference Drill vs Empty API State)
           ===================================================================== */
        function getSeedGroundOfficerData() {
            if (window.NEERAKSHAK_SEED_DATA && window.NEERAKSHAK_SEED_DATA.groundOfficer) {
                return JSON.parse(JSON.stringify(window.NEERAKSHAK_SEED_DATA.groundOfficer));
            }
            return {
                areas: [],
                deliveries: [],
                fieldReports: [],
                operations: [],
                returns: [],
                notifications: []
            };
        }

        let isDrillMode = true;
        let isListView = false;
        let state = getSeedGroundOfficerData();

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
                state = getSeedGroundOfficerData();
                if (btn) btn.innerHTML = '<i class="fas fa-database"></i> Reference Drill';
                showToast('Switched to Reference Drill dataset from seed.js.');
            } else {
                state = {
                    areas: [],
                    deliveries: [],
                    fieldReports: [],
                    operations: [],
                    returns: [],
                    notifications: []
                };
                if (btn) btn.innerHTML = '<i class="fas fa-plug"></i> Empty API State';
                showToast('Switched to Empty API State.');
            }
            renderAllGroundViews();
        }

        function switchGroundTab(tabKey, btnEl) {
            document.querySelectorAll('.go-nav-btn').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
            document.querySelectorAll('.go-tab-pane').forEach(p => p.classList.remove('active'));
            const target = document.getElementById(`tab-${tabKey}`);
            if (target) target.classList.add('active');
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

        function renderAllGroundViews() {
            const areaFilter = document.getElementById('assignedAreaFilter')?.value || 'ALL';
            const visAreas = state.areas.filter(a => areaFilter === 'ALL' || a.village === areaFilter);
            const visDeliv = state.deliveries.filter(d => areaFilter === 'ALL' || d.destination === areaFilter);
            const visReports = state.fieldReports.filter(r => areaFilter === 'ALL' || r.village === areaFilter);
            const visOps = state.operations.filter(o => areaFilter === 'ALL' || o.location === areaFilter);

            const pendingDelivs = visDeliv.filter(d => d.status === 'Pending Verification');
            const verifiedDelivs = visDeliv.filter(d => d.status !== 'Pending Verification');

            document.getElementById('navAreasCount').textContent = visAreas.length;
            document.getElementById('navPendingDelivCount').textContent = pendingDelivs.length;
            document.getElementById('navOpsCount').textContent = visOps.length;
            document.getElementById('navReportsCount').textContent = visReports.length;
            document.getElementById('navNotifCount').textContent = state.notifications.length;

            // Populate Field Report Village Select
            const frSel = document.getElementById('frVillageSel');
            if (frSel) {
                frSel.innerHTML = state.areas.length
                    ? state.areas.map(a => `<option value="${a.village}">${a.village} (${a.block})</option>`).join('')
                    : `<option value="Palashbari Riverside Ward 2">Palashbari Riverside Ward 2</option>`;
            }

            // 1. 6-KPI Summary Strip
            const kpis = [
                { val: isDrillMode ? visAreas.length : '0', lbl: 'Assigned Locations', icon: 'fa-map-pin', grad: 'kpi-grad-blue' },
                { val: isDrillMode ? pendingDelivs.length : '0', lbl: 'Pending Verifications', icon: 'fa-truck-ramp-box', grad: 'kpi-grad-amber' },
                { val: isDrillMode ? verifiedDelivs.length : '0', lbl: 'Completed Verifications', icon: 'fa-circle-check', grad: 'kpi-grad-green' },
                { val: isDrillMode ? visReports.length : '0', lbl: 'Field Reports Filed', icon: 'fa-house-flood-water', grad: 'kpi-grad-indigo' },
                { val: isDrillMode ? visOps.length : '0', lbl: 'Active Rescue Ops', icon: 'fa-life-ring', grad: 'kpi-grad-teal' },
                { val: isDrillMode ? state.notifications.length : '0', lbl: 'Critical Field Alerts', icon: 'fa-triangle-exclamation', grad: 'kpi-grad-red' }
            ];

            document.getElementById('groundKpiGrid').innerHTML = kpis.map(k => `
                <div class="kpi-tile ${k.grad}">
                    <div class="kpi-ic"><i class="fas ${k.icon}"></i></div>
                    <div>
                        <div class="kpi-val">${k.val}</div>
                        <div class="kpi-lbl">${k.lbl}</div>
                    </div>
                </div>
            `).join('');

            // 2. Dashboard Active Tasks
            document.getElementById('dashActiveTasksList').innerHTML = visAreas.length === 0
                ? `<div style="text-align:center; padding:16px; color:var(--text-muted);">No active field assignments loaded.</div>`
                : visAreas.map(a => `
                    <div class="sub-card ${getToneClass(a.severity)}" style="padding:10px 12px;">
                        <div class="sub-card-top">
                            <div>
                                <h4>${a.village}</h4>
                                <span style="font-size:10.5px; color:var(--text-muted);">${a.block} • Deadline: <strong>${a.deadline}</strong></span>
                            </div>
                            <span class="pill ${getPillClass(a.severity)}">${a.severity}</span>
                        </div>
                        <p style="margin:0; font-size:11.5px; color:var(--text-body);">${a.task}</p>
                    </div>
                `).join('');

            // 3. Delivery Verification Cards (Dashboard + Full Tab 3)
            const buildDeliveryCards = (list) => {
                if (list.length === 0) {
                    return `<div style="grid-column:1/-1; text-align:center; padding:18px; border:1.5px dashed #9cc3e6; border-radius:12px; color:var(--text-muted);">No dispatched consignments assigned to your locations.</div>`;
                }
                return list.map(d => {
                    const origIdx = state.deliveries.indexOf(d);
                    return `
                        <div class="sub-card ${getToneClass(d.status)}">
                            <div class="sub-card-top">
                                <div>
                                    <h4>${d.dispatchId} • ${d.resource}</h4>
                                    <span style="font-size:11px; color:var(--text-muted); font-weight:600;"><i class="fas fa-location-dot" style="color:var(--river-blue);"></i> ${d.destination}</span>
                                </div>
                                <span class="pill ${getPillClass(d.status)}">${d.status}</span>
                            </div>
                            <div class="meta-box-3">
                                <div><span>Dispatched</span><strong>${d.dispatched}</strong></div>
                                <div><span>Received</span><strong style="color:#15803d;">${d.received !== null ? d.received : '—'}</strong></div>
                                <div><span>Shortage / Dmg</span><strong style="color:${(d.shortage + d.damaged) > 0 ? '#dc2626' : '#072247'};">${d.shortage + d.damaged}</strong></div>
                            </div>
                            <p style="margin:0; font-size:11px; color:var(--text-body);">${d.remarks}</p>
                            <div class="sub-card-footer">
                                <span style="font-size:10.5px; color:var(--text-muted);">Linked to Godown Dispatch</span>
                                ${d.status === 'Pending Verification'
                                    ? `<button class="btn-go primary" onclick="openVerifyDeliveryModal(${origIdx})"><i class="fas fa-check-double"></i> Verify Physical Delivery</button>`
                                    : `<span style="font-size:11px; font-weight:700; color:#15803d;"><i class="fas fa-lock"></i> Verified & Locked</span>`}
                            </div>
                        </div>
                    `;
                }).join('');
            };

            const delivHtml = buildDeliveryCards(visDeliv);
            document.getElementById('dashDeliveryCards').innerHTML = delivHtml;
            document.getElementById('fullDeliveryVerifyGrid').innerHTML = delivHtml;

            // 4. Assigned Areas Cards (Tab 2)
            document.getElementById('assignedAreasGrid').innerHTML = visAreas.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--text-muted);">No assigned areas found.</div>`
                : visAreas.map(a => `
                    <div class="sub-card ${getToneClass(a.severity)}">
                        <div class="sub-card-top">
                            <div>
                                <h4>${a.village}</h4>
                                <span style="font-size:11px; color:var(--text-muted);">${a.id} • ${a.block}</span>
                            </div>
                            <span class="pill ${getPillClass(a.severity)}">${a.severity}</span>
                        </div>
                        <div class="meta-box">
                            <span>Priority: <strong>${a.priority}</strong></span>
                            <span>GPS: <strong>${a.coords}</strong></span>
                        </div>
                        <p style="margin:0; font-size:11.5px; color:var(--text-body);">${a.task}</p>
                        <div class="sub-card-footer">
                            <span style="font-size:10.5px; color:var(--text-muted);">Due: <strong>${a.deadline}</strong></span>
                            <button class="btn-go" onclick="switchGroundTab('field-reports', document.querySelector('[data-tab=field-reports]'))">File Field Report</button>
                        </div>
                    </div>
                `).join('');

            // 5. Field Situation Cards (Dashboard + My Reports)
            const buildFieldReportCards = (list) => {
                if (list.length === 0) {
                    return `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No field situation reports submitted yet.</div>`;
                }
                return list.map(r => `
                    <div class="sub-card ${getToneClass(r.severity)}">
                        <div class="sub-card-top">
                            <div>
                                <h4>${r.refId} • ${r.village}</h4>
                                <span style="font-size:10.5px; color:var(--text-muted);">${r.time} • GPS: ${r.coords}</span>
                            </div>
                            <span class="pill ${getPillClass(r.severity)}">${r.severity}</span>
                        </div>
                        <div class="meta-box">
                            <span>Water: <strong>${r.water}</strong></span>
                            <span>Stranded: <strong style="color:#dc2626;">${r.stranded} People</strong></span>
                            <span>Road: <strong>${r.road}</strong></span>
                            <span>Review: <strong>${r.reviewStatus}</strong></span>
                        </div>
                        <p style="margin:0; font-size:11px; color:var(--text-body);"><strong>Needs:</strong> ${r.needs}</p>
                    </div>
                `).join('');
            };

            document.getElementById('dashFieldSitCards').innerHTML = buildFieldReportCards(visReports);

            const repFilter = document.getElementById('reportStatusFilter')?.value || 'ALL';
            document.getElementById('myReportsGrid').innerHTML = buildFieldReportCards(
                visReports.filter(r => repFilter === 'ALL' || r.reviewStatus === repFilter)
            );

            // 6. Rescue Operations Cards (Dashboard + Tab 5)
            const buildOpsCards = (list) => {
                if (list.length === 0) {
                    return `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No active rescue operations assigned.</div>`;
                }
                return list.map(o => {
                    const origIdx = state.operations.indexOf(o);
                    return `
                        <div class="sub-card ${o.status === 'Completed' ? 'tone-good' : 'tone-purple'}">
                            <div class="sub-card-top">
                                <div>
                                    <h4>${o.opId} • ${o.location}</h4>
                                    <span style="font-size:10.5px; color:var(--text-muted);">${o.agency}</span>
                                </div>
                                <span class="pill p-info">${o.status}</span>
                            </div>
                            <div class="meta-box">
                                <span>Rescued: <strong style="color:#15803d;">${o.rescued} People</strong></span>
                                <span>Stranded: <strong style="color:#dc2626;">${o.stranded} People</strong></span>
                            </div>
                            <p style="margin:0; font-size:11px; color:var(--text-body);">${o.notes}</p>
                            <div class="sub-card-footer">
                                <button class="btn-go primary" onclick="openRescueUpdateModal(${origIdx})"><i class="fas fa-pen"></i> Report Progress</button>
                            </div>
                        </div>
                    `;
                }).join('');
            };

            const opsHtml = buildOpsCards(visOps);
            document.getElementById('dashRescueOpsCards').innerHTML = opsHtml;
            document.getElementById('fullRescueOpsGrid').innerHTML = opsHtml;

            // 7. Return Verification Cards (Tab 6)
            document.getElementById('returnVerifyGrid').innerHTML = state.returns.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No post-operation return verifications recorded yet.</div>`
                : state.returns.map(r => `
                    <div class="sub-card ${r.damaged > 0 || r.missing > 0 ? 'tone-amber' : 'tone-good'}">
                        <div class="sub-card-top">
                            <div>
                                <h4>${r.retId} • ${r.item}</h4>
                                <span style="font-size:10.5px; color:var(--text-muted);">${r.location} • ${r.time}</span>
                            </div>
                            <span class="pill p-good">Verified</span>
                        </div>
                        <div class="meta-box-3">
                            <div><span>Good</span><strong style="color:#15803d;">${r.good}</strong></div>
                            <div><span>Damaged</span><strong style="color:#d97706;">${r.damaged}</strong></div>
                            <div><span>Missing</span><strong style="color:#dc2626;">${r.missing}</strong></div>
                        </div>
                        <p style="margin:0; font-size:11px; color:var(--text-body);">${r.remarks}</p>
                    </div>
                `).join('');

            // 8. Notifications Grid (Tab 8)
            document.getElementById('notificationsGrid').innerHTML = state.notifications.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No unread notifications.</div>`
                : state.notifications.map(n => `
                    <div class="sub-card ${getToneClass(n.priority)}">
                        <div class="sub-card-top">
                            <h4>${n.title}</h4>
                            <span class="pill ${getPillClass(n.priority)}">${n.priority}</span>
                        </div>
                        <p style="margin:0; font-size:11.5px; color:var(--text-body);">${n.detail}</p>
                    </div>
                `).join('');
        }

        /* =====================================================================
           MODAL & SUBMISSION HANDLERS
           ===================================================================== */
        function openVerifyDeliveryModal(idx) {
            const d = state.deliveries[idx];
            if (!d) return;
            document.getElementById('verDelivIdx').value = idx;
            document.getElementById('verDelivHeader').innerHTML = `<strong>${d.dispatchId}</strong> • ${d.resource} → <strong>${d.destination}</strong>`;
            document.getElementById('verDispQty').value = d.dispatched;
            document.getElementById('verRecvQty').value = d.dispatched;
            document.getElementById('verDmgQty').value = 0;
            document.getElementById('verRemarks').value = '';
            previewShortageCalc();
            document.getElementById('verifyDeliveryModal').classList.add('open');
        }

        function previewShortageCalc() {
            const disp = Number(document.getElementById('verDispQty').value) || 0;
            const recv = Number(document.getElementById('verRecvQty').value) || 0;
            const dmg = Number(document.getElementById('verDmgQty').value) || 0;
            const shortage = Math.max(0, disp - recv);
            const box = document.getElementById('shortagePreviewBox');
            if (shortage > 0 || dmg > 0) {
                box.style.background = '#fef2f2';
                box.style.borderColor = '#fca5a5';
                box.style.color = '#991b1b';
                box.innerHTML = `Auto-Detected Discrepancy: <strong>${shortage} Shortage</strong>, <strong>${dmg} Damaged</strong> (Will flag for Monitoring Officer)`;
            } else {
                box.style.background = '#f0fdf4';
                box.style.borderColor = '#86efac';
                box.style.color = '#14532d';
                box.innerHTML = `Calculated Shortage: <strong>0 Units</strong> (Exact Physical Match)`;
            }
        }

        function submitDeliveryVerification(e) {
            e.preventDefault();
            const idx = Number(document.getElementById('verDelivIdx').value);
            const recv = Number(document.getElementById('verRecvQty').value);
            const dmg = Number(document.getElementById('verDmgQty').value);
            const remarks = document.getElementById('verRemarks').value.trim();
            const d = state.deliveries[idx];
            const shortage = Math.max(0, d.dispatched - recv);

            d.received = recv;
            d.damaged = dmg;
            d.shortage = shortage;
            d.status = (shortage > 0 || dmg > 0) ? 'Discrepancy Flagged' : 'Verified';
            d.remarks = `[GO-KAM-04] ${remarks}`;

            closeModal('verifyDeliveryModal');
            renderAllGroundViews();
            showToast(shortage > 0 || dmg > 0
                ? `Delivery verified with discrepancy (${shortage} missing, ${dmg} damaged) flagged to Audit.`
                : `Physical delivery ${d.dispatchId} verified (100% match).`);
        }

        function submitFieldSituationReport(e) {
            e.preventDefault();
            const village = document.getElementById('frVillageSel').value;
            const severity = document.getElementById('frSeveritySel').value;
            const water = document.getElementById('frWaterLevel').value.trim();
            const affected = document.getElementById('frAffectedPop').value.trim();
            const stranded = Number(document.getElementById('frStrandedCount').value);
            const road = document.getElementById('frRoadCond').value;
            const needs = document.getElementById('frUrgentNeeds').value.trim();
            const coords = document.getElementById('frGpsCoords').value.trim();

            const refId = 'FR-2026-' + Math.floor(420 + Math.random() * 500);
            state.fieldReports.unshift({
                refId,
                village,
                severity,
                water,
                affected,
                stranded,
                road,
                needs,
                coords,
                time: 'Just now (GO-KAM-04)',
                reviewStatus: 'Pending Review'
            });

            e.target.reset();
            renderAllGroundViews();
            showToast(`Immutable Field Report ${refId} submitted to Authority & Monitoring Portals.`);
            switchGroundTab('my-reports', document.querySelector('[data-tab=my-reports]'));
        }

        function openRescueUpdateModal(idx) {
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

        function submitRescueProgress(e) {
            e.preventDefault();
            const idx = Number(document.getElementById('opIdxInput').value);
            const op = state.operations[idx];
            op.rescued = Number(document.getElementById('opRescuedInput').value);
            op.stranded = Number(document.getElementById('opStrandedInput').value);
            op.status = document.getElementById('opStatusSel').value;
            op.notes = document.getElementById('opNotesInput').value.trim();
            closeModal('rescueUpdateModal');
            renderAllGroundViews();
            showToast(`Rescue operation progress updated for ${op.opId}.`);
        }

        function openReturnVerifyModal() {
            document.getElementById('rvItemName').value = '';
            document.getElementById('rvLocation').value = '';
            document.getElementById('rvRemarks').value = '';
            document.getElementById('returnVerifyModal').classList.add('open');
        }

        function submitReturnVerification(e) {
            e.preventDefault();
            state.returns.unshift({
                retId: 'RV-' + Math.floor(110 + Math.random() * 880),
                item: document.getElementById('rvItemName').value.trim(),
                location: document.getElementById('rvLocation').value.trim(),
                good: Number(document.getElementById('rvGoodQty').value),
                damaged: Number(document.getElementById('rvDmgQty').value),
                missing: Number(document.getElementById('rvMissQty').value),
                remarks: document.getElementById('rvRemarks').value.trim(),
                time: 'Just now (GO-KAM-04)'
            });
            closeModal('returnVerifyModal');
            renderAllGroundViews();
            showToast('Return condition verification submitted to Godown Manager.');
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

        __onReady( renderAllGroundViews);
    

// Inline handlers (onClick=...) and generated HTML call these on window, exactly like a classic script.
Object.assign(window, { closeModal, getPillClass, getSeedGroundOfficerData, getToneClass, openRescueUpdateModal, openReturnVerifyModal, openVerifyDeliveryModal, previewShortageCalc, renderAllGroundViews, showToast, submitDeliveryVerification, submitFieldSituationReport, submitRescueProgress, submitReturnVerification, switchGroundTab, toggleDataMode, toggleGridListView });
__ready.forEach((fn) => fn());
}
