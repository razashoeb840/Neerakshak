// Original 6monitoring.html logic, kept unchanged (only DOMContentLoaded -> __onReady, .html links -> routes).
export default function initMonitoringPage() {
const __ready = [];
const __onReady = (fn) => __ready.push(fn);

        /* =====================================================================
           NEERAKSHAK MONITORING OFFICER STATE (Reference Drill vs Empty API)
           ===================================================================== */
        /* =====================================================================
           NEERAKSHAK MONITORING SEED DATA LOADER (CONNECTED TO seed.js)
           ===================================================================== */
        function getSeedMonitoringData() {
            if (window.NEERAKSHAK_SEED_DATA && window.NEERAKSHAK_SEED_DATA.monitoring) {
                return JSON.parse(JSON.stringify(window.NEERAKSHAK_SEED_DATA.monitoring));
            }
            return {
                reconciliation: [],
                discrepancies: [],
                returns: [],
                operations: [],
                logs: [],
                escalations: [],
                chats: { ground: [], godown: [], authority: [], admin: [] }
            };
        }

        const CHANNEL_LABELS = {
            ground: 'Ground Officer (GO-KAM-04)',
            godown: 'Godown Manager (Mirza Hub)',
            authority: 'District Authority (DDMA)',
            admin: 'Admin GIS Control'
        };

        let isDrillMode = true;
        let isListView = false;
        let activeChatRole = 'ground';
        let state = getSeedMonitoringData();

        function toggleGridListView() {
            isListView = !isListView;
            const sw = document.getElementById('viewSlideSwitch');
            if (isListView) {
                document.body.classList.add('list-mode');
                sw.classList.add('is-list');
                showToast('Switched to List View');
            } else {
                document.body.classList.remove('list-mode');
                sw.classList.remove('is-list');
                showToast('Switched to Grid Card View');
            }
        }

        function toggleDataMode() {
            isDrillMode = !isDrillMode;
            const btn = document.getElementById('dataModeBtn');
            if (isDrillMode) {
                state = getSeedMonitoringData();
                btn.innerHTML = '<i class="fas fa-database"></i> Reference Drill';
                showToast('Switched to Reference Drill dataset.');
            } else {
                state = {
                    reconciliation: [],
                    discrepancies: [],
                    returns: [],
                    operations: [],
                    logs: [],
                    escalations: [],
                    chats: { ground: [], godown: [], authority: [], admin: [] }
                };
                btn.innerHTML = '<i class="fas fa-plug"></i> Empty API State';
                showToast('Switched to Empty API State.');
            }
            renderAllMonitoringViews();
            renderChatFeed();
        }

        function switchMonitorTab(tabKey, btnEl) {
            document.querySelectorAll('.mo-nav-btn').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
            document.querySelectorAll('.mo-tab-pane').forEach(p => p.classList.remove('active'));
            const target = document.getElementById(`tab-${tabKey}`);
            if (target) target.classList.add('active');
        }

        function renderAllMonitoringViews() {
            const locFilter = document.getElementById('districtScopeFilter')?.value || 'ALL';
            const visRec = state.reconciliation.filter(r => locFilter === 'ALL' || r.destination === locFilter);
            const visDisc = state.discrepancies.filter(d => locFilter === 'ALL' || d.destination === locFilter);

            const totalApproved = visRec.reduce((s, r) => s + r.approved, 0);
            const totalDispatched = visRec.reduce((s, r) => s + r.dispatched, 0);
            const totalReceived = visRec.reduce((s, r) => s + (r.received || 0), 0);

            const elDisc = document.getElementById('navDiscCount'); if (elDisc) elDisc.textContent = visDisc.length;
            const elEsc = document.getElementById('navEscCount'); if (elEsc) elEsc.textContent = state.escalations.length;

            // 1. 4-KPI Primary Overview
            const kpis = [
                { val: isDrillMode ? totalApproved.toLocaleString() : '0', lbl: 'Approved Units', icon: 'fa-clipboard-check', cls: 'kpi-indigo' },
                { val: isDrillMode ? totalDispatched.toLocaleString() : '0', lbl: 'Dispatched Units', icon: 'fa-truck-fast', cls: 'kpi-blue' },
                { val: isDrillMode ? totalReceived.toLocaleString() : '0', lbl: 'Ground Verified Units', icon: 'fa-circle-check', cls: 'kpi-green' },
                { val: isDrillMode ? visDisc.length : '0', lbl: 'Active Discrepancies', icon: 'fa-triangle-exclamation', cls: 'kpi-red' }
            ];

            const kpiGrid = document.getElementById('monitorKpiGrid');
            if (kpiGrid) {
                kpiGrid.innerHTML = kpis.map(k => `
                    <div class="kpi-tile ${k.cls}">
                        <div class="kpi-ic"><i class="fas ${k.icon}"></i></div>
                        <div>
                            <div class="kpi-val">${k.val}</div>
                            <div class="kpi-lbl">${k.lbl}</div>
                        </div>
                    </div>
                `).join('');
            }

            // 2. Reconciliation Table (Dashboard & Lifecycle Tab)
            const buildReconcileRows = (showAction) => {
                if (visRec.length === 0) {
                    return `<tr><td colspan="${showAction ? 8 : 7}" style="text-align:center; padding:16px; color:var(--text-muted);">No lifecycle records loaded.</td></tr>`;
                }
                return visRec.map((r, idx) => {
                    const diff = r.received !== null ? (r.dispatched - r.received) : 0;
                    const pillCls = r.status === 'Matched' ? 'p-green' : (r.status === 'Shortage' ? 'p-red' : 'p-amber');
                    return `
                        <tr>
                            ${showAction ? `<td><strong>${r.allocId}</strong></td>` : ''}
                            <td><strong>${r.resource}</strong></td>
                            <td>${r.destination}</td>
                            <td>${r.approved}</td>
                            <td>${r.dispatched}</td>
                            <td><strong>${r.received !== null ? r.received : 'Pending'}</strong></td>
                            <td><strong style="color:${diff > 0 ? '#dc2626' : '#15803d'};">${r.received !== null ? diff : '—'}</strong></td>
                            <td><span class="pill ${pillCls}">${r.status}</span></td>
                            ${showAction ? `<td>${diff > 0 ? `<button class="btn-mo escalate" onclick="flagMismatchToChat('${r.dispatchId}', '${r.resource}', ${diff})">Clarify in Chat</button>` : '<span style="font-size:11px; color:#15803d;">Verified</span>'}</td>` : ''}
                        </tr>
                    `;
                }).join('');
            };

            const dashRec = document.getElementById('dashReconcileBody');
            if (dashRec) dashRec.innerHTML = buildReconcileRows(false);
            const fullLife = document.getElementById('fullLifecycleBody');
            if (fullLife) fullLife.innerHTML = buildReconcileRows(true);

            // 3. Discrepancy Cards (Dashboard + Tab 5)
            const discHtml = visDisc.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No discrepancies flagged.</div>`
                : visDisc.map((d, idx) => `
                    <div class="audit-card ${d.status === 'Resolved' ? 'tone-ok' : 'tone-crit'}">
                        <div class="ac-top">
                            <div>
                                <h4>${d.id} • ${d.ref} (${d.destination})</h4>
                                <span style="font-size:10.5px; color:var(--text-muted);">Audit Observation</span>
                            </div>
                            <span class="pill ${d.status === 'Resolved' ? 'p-green' : 'p-red'}">${d.status}</span>
                        </div>
                        <p style="margin:0; font-size:11.5px; color:var(--text-body);">${d.issue}</p>
                        <div class="ac-footer">
                            <button class="btn-mo" onclick="openChatForRole('${d.targetRole}', 'Regarding ${d.id} (${d.ref}): ${d.issue}')"><i class="fas fa-comments"></i> Ask Clarification</button>
                            ${d.status !== 'Resolved'
                                ? `<button class="btn-mo escalate" onclick="escalateDiscrepancy(${idx})"><i class="fas fa-arrow-up-right-from-square"></i> Escalate to Authority</button>`
                                : `<span style="font-size:11px; font-weight:700; color:#15803d;">Resolved</span>`}
                        </div>
                    </div>
                `).join('');

            const dashDisc = document.getElementById('dashDiscrepancyCards');
            if (dashDisc) dashDisc.innerHTML = discHtml;
            const fullDisc = document.getElementById('fullDiscrepancyGrid');
            if (fullDisc) fullDisc.innerHTML = discHtml;

            // 4. Allocation & Dispatch Cards + Delivery Audit Cards
            const lifecycleCardsHtml = visRec.map(r => `
                <div class="audit-card ${r.status === 'Matched' ? 'tone-ok' : (r.status === 'Shortage' ? 'tone-crit' : 'tone-warn')}">
                    <div class="ac-top">
                        <h4>${r.allocId} → ${r.dispatchId} • ${r.resource}</h4>
                        <span class="pill ${r.status === 'Matched' ? 'p-green' : (r.status === 'Shortage' ? 'p-red' : 'p-amber')}">${r.status}</span>
                    </div>
                    <div class="ac-meta">
                        <div><span>Approved</span><strong>${r.approved}</strong></div>
                        <div><span>Dispatched</span><strong>${r.dispatched}</strong></div>
                        <div><span>Received</span><strong>${r.received !== null ? r.received : 'Pending'}</strong></div>
                    </div>
                    <div style="font-size:11px; color:var(--text-muted);">Destination: <strong>${r.destination}</strong></div>
                </div>
            `).join('') || `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No records found.</div>`;

            const allocGrid = document.getElementById('allocDispatchGrid');
            if (allocGrid) allocGrid.innerHTML = lifecycleCardsHtml;
            const delivAudit = document.getElementById('deliveryAuditGrid');
            if (delivAudit) delivAudit.innerHTML = lifecycleCardsHtml;

            // 5. Return & Utilization Audit Table
            const retBody = document.getElementById('returnAuditBody');
            if (retBody) {
                retBody.innerHTML = state.returns.length === 0
                    ? `<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-muted);">No return records synced.</td></tr>`
                    : state.returns.map(ret => `
                        <tr>
                            <td><strong>${ret.resource}</strong></td>
                            <td>${ret.dispatched}</td>
                            <td><strong style="color:#15803d;">${ret.returnedGood}</strong></td>
                            <td><strong style="color:#d97706;">${ret.damaged}</strong></td>
                            <td><strong style="color:#dc2626;">${ret.missing}</strong></td>
                            <td><span class="pill p-blue">${ret.syncStatus}</span></td>
                        </tr>
                    `).join('');
            }

            // 6. Operation Monitoring Cards
            const opsGrid = document.getElementById('opsMonitorGrid');
            if (opsGrid) {
                opsGrid.innerHTML = state.operations.length === 0
                    ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No active operations under monitoring.</div>`
                    : state.operations.map(op => `
                        <div class="audit-card tone-indigo">
                            <div class="ac-top">
                                <h4>${op.opId} • ${op.location}</h4>
                                <span class="pill p-indigo">${op.status}</span>
                            </div>
                            <div style="font-size:11px; color:var(--text-muted);">Field Officer: <strong>${op.officer}</strong></div>
                            <p style="margin:0; font-size:11.5px; color:var(--text-body);">${op.notes}</p>
                        </div>
                    `).join('');
            }

            // 7. User Activity Logs
            const logsHtml = state.logs.length === 0
                ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No activity logs recorded.</div>`
                : state.logs.map(l => `
                    <div class="audit-card">
                        <div class="ac-top">
                            <h4>${l.user}</h4>
                            <span style="font-size:10.5px; color:var(--text-muted);">${l.time}</span>
                        </div>
                        <p style="margin:0; font-size:11.5px; color:var(--text-body);">${l.action}</p>
                    </div>
                `).join('');

            const dashLogs = document.getElementById('dashRecentLogsGrid');
            if (dashLogs) dashLogs.innerHTML = logsHtml;
            const fullLogs = document.getElementById('fullActivityLogsGrid');
            if (fullLogs) fullLogs.innerHTML = logsHtml;

            // 8. Reports Summary Cards & Escalations
            const repCards = document.getElementById('auditReportCards');
            if (repCards) {
                repCards.innerHTML = `
                    <div class="audit-card tone-ok"><h4>Reconciliation Accuracy</h4><strong style="font-size:20px; color:#15803d;">${isDrillMode ? '97.7%' : '0%'}</strong><span style="font-size:11px; color:var(--text-muted);">Matched across Approved → Dispatched → Received</span></div>
                    <div class="audit-card tone-crit"><h4>Total Shortage / Missing</h4><strong style="font-size:20px; color:#dc2626;">${isDrillMode ? '41 Units' : '0 Units'}</strong><span style="font-size:11px; color:var(--text-muted);">Flagged for clarification & Authority review</span></div>
                `;
            }

            const escGrid = document.getElementById('escalationsGrid');
            if (escGrid) {
                escGrid.innerHTML = state.escalations.length === 0
                    ? `<div style="grid-column:1/-1; text-align:center; padding:16px; color:var(--text-muted);">No escalations raised yet.</div>`
                    : state.escalations.map(e => `
                        <div class="audit-card tone-crit">
                            <div class="ac-top">
                                <h4>${e.id} • ${e.title}</h4>
                                <span class="pill p-red">${e.status}</span>
                            </div>
                            <p style="margin:0; font-size:11.5px; color:var(--text-body);">${e.detail}</p>
                        </div>
                    `).join('');
            }
        }

        /* =====================================================================
           INTER-PORTAL CLARIFICATION CHAT LOGIC
           ===================================================================== */
        function switchChatChannel(roleKey, btnEl) {
            activeChatRole = roleKey;
            document.querySelectorAll('.channel-tab').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
            document.getElementById('chatChannelTitle').textContent = `Channel: ${CHANNEL_LABELS[roleKey]}`;
            renderChatFeed();
        }

        function renderChatFeed() {
            const feed = document.getElementById('chatMessagesFeed');
            const msgs = state.chats[activeChatRole] || [];
            if (msgs.length === 0) {
                feed.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:11px; margin:auto 0;">No messages in this portal channel yet. Start an audit clarification below.</div>`;
                return;
            }
            feed.innerHTML = msgs.map(m => `
                <div class="chat-bubble ${m.sender}">
                    ${m.text}
                    <span class="chat-meta">${m.sender === 'outgoing' ? 'Monitoring Officer' : CHANNEL_LABELS[activeChatRole]} • ${m.time}</span>
                </div>
            `).join('');
            feed.scrollTop = feed.scrollHeight;
        }

        function insertQuickChat(text) {
            const inp = document.getElementById('chatMessageInput');
            inp.value = text;
            inp.focus();
        }

        function sendChatMessage(e) {
            e.preventDefault();
            const inp = document.getElementById('chatMessageInput');
            const msg = inp.value.trim();
            if (!msg) return;

            if (!state.chats[activeChatRole]) state.chats[activeChatRole] = [];
            state.chats[activeChatRole].push({
                sender: 'outgoing',
                text: msg,
                time: 'Just now'
            });

            state.logs.unshift({
                user: 'MO-DEOC-02 (Monitoring Officer)',
                action: `Sent audit clarification message to ${CHANNEL_LABELS[activeChatRole]}`,
                time: 'Just now'
            });

            inp.value = '';
            renderChatFeed();
            renderAllMonitoringViews();
        }

        function openChatForRole(roleKey, prefillText) {
            const tabBtns = document.querySelectorAll('.channel-tab');
            const idxMap = { ground: 0, godown: 1, authority: 2, admin: 3 };
            switchChatChannel(roleKey, tabBtns[idxMap[roleKey] || 0]);
            insertQuickChat(prefillText);
        }

        function flagMismatchToChat(dispId, resName, diff) {
            openChatForRole('ground', `Audit Query (${dispId}): Dispatched vs Received mismatch of ${diff} units for ${resName}. Please verify.`);
        }

        function escalateDiscrepancy(idx) {
            const d = state.discrepancies[idx];
            if (!d) return;
            d.status = 'Escalated to Authority';
            state.escalations.unshift({
                id: 'ESC-' + Math.floor(20 + Math.random() * 75),
                title: `Escalated Mismatch (${d.ref})`,
                detail: d.issue,
                status: 'Escalated to Authority'
            });
            openChatForRole('authority', `ESCALATION (${d.id} / ${d.ref}): ${d.issue}`);
            renderAllMonitoringViews();
            showToast(`Discrepancy ${d.id} escalated to District Authority.`);
        }

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.style.right = '18px';
            setTimeout(() => { t.style.right = '-380px'; }, 3200);
        }

        __onReady( () => {
            renderAllMonitoringViews();
            renderChatFeed();
        });
    

// Inline handlers (onClick=...) and generated HTML call these on window, exactly like a classic script.
Object.assign(window, { escalateDiscrepancy, flagMismatchToChat, getSeedMonitoringData, insertQuickChat, openChatForRole, renderAllMonitoringViews, renderChatFeed, sendChatMessage, showToast, switchChatChannel, switchMonitorTab, toggleDataMode, toggleGridListView });
__ready.forEach((fn) => fn());
}
