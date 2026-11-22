// Original 1index.html logic, kept unchanged (only DOMContentLoaded -> __onReady, .html links -> routes).
export default function initHomePage() {
const __ready = [];
const __onReady = (fn) => __ready.push(fn);

        /* =====================================================================
           CLIENT SCRIPTS & DYNAMIC DATA BINDINGS
           ===================================================================== */
        let currentSelectedRole = 'admin';

        // 1. Scroll Progress & Scroll Animations
        window.addEventListener('scroll', () => {
            const h = document.documentElement;
            const b = document.body;
            const st = 'scrollTop';
            const sh = 'scrollHeight';
            const percent = (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100;
            const bar = document.getElementById('scrollProgressBar');
            if (bar) bar.style.width = percent + '%';
        });

        function initScrollAnimations() {
            const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-pop');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-active');
                    }
                });
            }, { 
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px'
            });
            elements.forEach(el => observer.observe(el));
        }

        // 2. Dynamic Rendering from seed.js
        function renderSeedData() {
            const data = window.NEERAKSHAK_SEED_DATA || {};

            // A. River Telemetry Card (Hero)
            const riverBox = document.getElementById('seedRiverList');
            if (riverBox) {
                if (data.riverTelemetry && data.riverTelemetry.length > 0) {
                    riverBox.innerHTML = data.riverTelemetry.map(item => `
                        <div class="river-stat-row">
                            <div class="river-name-meta">
                                ${item.iconType === 'waves' ? `
                                    <svg width="15" height="11" viewBox="0 0 15 11" fill="none" style="flex-shrink:0;">
                                        <path d="M1 2.5C2.8 1 4.5 4 6.3 2.5C8.1 1 9.8 4 11.6 2.5C12.8 1.5 13.8 2 14.2 2.5" stroke="#0284c7" stroke-width="1.6" stroke-linecap="round"/>
                                        <path d="M1 5.8C2.8 4.3 4.5 7.3 6.3 5.8C8.1 4.3 9.8 7.3 11.6 5.8C12.8 4.8 13.8 5.3 14.2 5.8" stroke="#0284c7" stroke-width="1.6" stroke-linecap="round"/>
                                        <path d="M1 9.2C2.8 7.7 4.5 10.7 6.3 9.2C8.1 7.7 9.8 10.7 11.6 9.2C12.8 8.2 13.8 8.7 14.2 9.2" stroke="#0284c7" stroke-width="1.6" stroke-linecap="round"/>
                                    </svg>
                                ` : `<span class="bar-icon bar-${item.barColor || 'amber'}"></span>`}
                                <span class="river-name">${item.name}</span>
                            </div>
                            <div class="river-val-badge">
                                <span class="river-level">${(item.level || '').replace(/\s+/g, '&nbsp;')}</span>
                                <span class="status-chip chip-${item.severity || 'normal'}">${item.arrow || ''} ${item.status}</span>
                            </div>
                        </div>
                    `).join('');
                } else {
                    riverBox.innerHTML = `
                        <div style="padding: 10px; text-align: center; color: #64748b; font-size: 11.5px; background: #f8fafc; border-radius: 8px;">
                            <i class="fas fa-satellite-dish" style="color: #0284c7; margin-bottom: 4px;"></i><br>
                            Awaiting telemetry feed from CWC gauge endpoints
                        </div>
                    `;
                }
            }

            // B. Live News Bulletin Ticker
            const tickerBox = document.getElementById('seedTickerTrack');
            if (tickerBox) {
                if (data.liveNewsTicker && data.liveNewsTicker.length > 0) {
                    const dup = [...data.liveNewsTicker, ...data.liveNewsTicker];
                    tickerBox.innerHTML = dup.map(text => `
                        <span class="ticker-item">${text}</span>
                        <span class="ticker-sep">|</span>
                    `).join('');
                } else {
                    tickerBox.innerHTML = `<span class="ticker-item">DEOC 24×7 Emergency Control: 1077 | National Emergency: 112</span>`;
                }
            }

            // C. 6 Stats Cards Below Live News
            const statsBox = document.getElementById('seedStatsGrid');
            if (statsBox) {
                if (data.districtStats && data.districtStats.length > 0) {
                    statsBox.innerHTML = data.districtStats.map(stat => `
                        <div class="stat-pill-card">
                            <div class="stat-icon-wrap icon-${stat.theme || 'blue'}">
                                <i class="${stat.icon}"></i>
                            </div>
                            <div class="stat-content">
                                <span class="stat-number">${stat.value}</span>
                                <span class="stat-title">${stat.label}</span>
                            </div>
                        </div>
                    `).join('');
                } else {
                    statsBox.innerHTML = '';
                }
            }

            // D. Column 1: Latest Updates & News with Media Thumbnails
            const newsBox = document.getElementById('seedNewsStack');
            if (newsBox) {
                if (data.latestNewsUpdates && data.latestNewsUpdates.length > 0) {
                    newsBox.innerHTML = data.latestNewsUpdates.map(news => `
                        <article class="news-item-row" onclick="openCitizenModal('news')">
                            <div class="news-thumb-wrap">
                                <img src="${news.image}" alt="${news.headline}" class="news-thumb-img" onerror="this.src='/Gemini_Generated_Image_q9w16bq9w16bq9w1.png';" />
                            </div>
                            <div class="news-item-body">
                                <span class="news-category-pill ${news.categoryClass || 'cat-river'}">${news.category}</span>
                                <h4 class="news-item-headline">${news.headline}</h4>
                                <div class="news-item-meta">
                                    <i class="far fa-clock"></i> ${news.timestamp}
                                </div>
                            </div>
                        </article>
                    `).join('');
                } else {
                    newsBox.innerHTML = `
                        <div style="padding: 14px; text-align: center; color: #64748b; font-size: 11.5px; background: #f8fafc; border-radius: 8px;">
                            No unread press bulletins in queue
                        </div>
                    `;
                }
            }
        }

        // 3. Modals & Actions
        function showToast(msg) {
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.style.right = '20px';
            setTimeout(() => { t.style.right = '-380px'; }, 3200);
        }

        function copyNumber(num) {
            navigator.clipboard.writeText(num).then(() => {
                showToast('Copied helpline number: ' + num);
            }).catch(() => {
                showToast('Emergency helpline: ' + num);
            });
        }

        function adjustFontSize(delta) {
            const root = document.documentElement;
            const currentSize = parseFloat(getComputedStyle(root).fontSize) || 16;
            if (delta === 0) root.style.fontSize = '16px';
            else root.style.fontSize = Math.min(20, Math.max(13, currentSize + delta)) + 'px';
            showToast('Display text size adjusted');
        }

        function toggleTheme() {
            const icon = document.getElementById('themeIcon');
            if (icon.classList.contains('fa-moon')) {
                icon.classList.replace('fa-moon', 'fa-sun');
                showToast('High-contrast daytime view active');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                showToast('Standard government portal view active');
            }
        }

        // Login Modal Logic
        function openLoginModal() {
            document.getElementById('loginModal').classList.add('open');
        }

        function closeLoginModal() {
            document.getElementById('loginModal').classList.remove('open');
        }

        function selectLoginRole(role, el) {
            currentSelectedRole = role;
            document.querySelectorAll('.login-role-pill').forEach(p => p.classList.remove('active'));
            if (el) el.classList.add('active');
            const userBox = document.getElementById('loginUserId');
            if (role === 'admin') userBox.value = 'KAMRUP_ADMIN_GIS';
            else if (role === 'authority') userBox.value = 'KAMRUP_DC_AUTHORITY';
            else if (role === 'godown') userBox.value = 'KAMRUP_GODOWN_MGR';
            else if (role === 'ground') userBox.value = 'FIELD_OFFICER_CHAYGAON';
            else if (role === 'monitoring') userBox.value = 'STATE_DEOC_AUDITOR';
        }

        const ROLE_PAGES = {
            admin: '/admin',
            authority: '/authority',
            godown: '/godown',
            ground: '/ground-officer',
            monitoring: '/monitoring'
        };

        function enterFullRoleDashboard() {
            closeRolePortalModal();
            if (ROLE_PAGES[currentSelectedRole]) {
                window.location.href = ROLE_PAGES[currentSelectedRole];
            }
        }

        const ROLE_CREDENTIALS = {
            admin: {
                name: 'Admin',
                validUids: ['kamrup_admin_gis', 'admin', 'admin@neerakshak.gov.in', 'gis_admin'],
                validPwds: ['demo@1234', 'admin123', 'admin', 'admin@neerakshak'],
                defaultUid: 'KAMRUP_ADMIN_GIS'
            },
            authority: {
                name: 'Authority',
                validUids: ['kamrup_dc_authority', 'authority', 'dc_kamrup', 'dc', 'authority@neerakshak.gov.in'],
                validPwds: ['demo@1234', 'authority123', 'dc123'],
                defaultUid: 'KAMRUP_DC_AUTHORITY'
            },
            godown: {
                name: 'Godown Manager',
                validUids: ['kamrup_godown_mgr', 'godown', 'godown_mgr', 'godown@neerakshak.gov.in'],
                validPwds: ['demo@1234', 'godown123', 'mgr123'],
                defaultUid: 'KAMRUP_GODOWN_MGR'
            },
            ground: {
                name: 'Ground Officer',
                validUids: ['field_officer_chaygaon', 'ground', 'ground_officer', 'field_officer', 'go-kam-04'],
                validPwds: ['demo@1234', 'ground123', 'officer123'],
                defaultUid: 'FIELD_OFFICER_CHAYGAON'
            },
            monitoring: {
                name: 'Monitoring Officer',
                validUids: ['state_deoc_auditor', 'monitoring', 'monitor', 'auditor', 'monitoring@neerakshak.gov.in'],
                validPwds: ['demo@1234', 'monitoring123', 'audit123'],
                defaultUid: 'STATE_DEOC_AUDITOR'
            }
        };

        function handleFormLogin(e) {
            e.preventDefault();
            const userBox = document.getElementById('loginUserId');
            const passBox = document.getElementById('loginPassword');
            const u = userBox ? userBox.value.trim() : '';
            const p = passBox ? passBox.value : '';

            const cred = ROLE_CREDENTIALS[currentSelectedRole];
            if (!cred || !cred.validUids.includes(u.toLowerCase())) {
                const toastMsg = 'Access Denied: Invalid Officer ID for ' + (cred ? cred.name : currentSelectedRole) + '. (e.g. ' + (cred ? cred.defaultUid : '') + ')';
                if (window.showToast) window.showToast(toastMsg);
                else alert(toastMsg);
                if (userBox) userBox.focus();
                return;
            }

            if (!cred.validPwds.includes(p)) {
                const toastMsg = 'Access Denied: Incorrect PIN / Password for ' + cred.name + '. (Default: demo@1234)';
                if (window.showToast) window.showToast(toastMsg);
                else alert(toastMsg);
                if (passBox) {
                    passBox.value = '';
                    passBox.focus();
                }
                return;
            }

            closeLoginModal();
            try {
                sessionStorage.setItem('neerakshak_role', currentSelectedRole);
                sessionStorage.setItem('neerakshak_user', u);
                sessionStorage.setItem('neerakshak_logged_in', 'true');
            } catch(e) {}

            if (ROLE_PAGES[currentSelectedRole]) {
                window.location.href = ROLE_PAGES[currentSelectedRole];
            } else {
                launchRolePortal(currentSelectedRole);
            }
        }

        // Role Portals Live View Generator
        function launchRolePortal(role) {
            closeLoginModal();
            const modal = document.getElementById('rolePortalModal');
            const title = document.getElementById('rolePortalTitle');
            const sub = document.getElementById('rolePortalSubtitle');
            const iconWrap = document.getElementById('rolePortalIconWrap');
            const body = document.getElementById('rolePortalBody');

            if (role === 'admin') {
                title.textContent = 'District Admin Portal – Flood Monitoring & GIS Data';
                sub.textContent = 'Operational Domain: Inundation Identification, River Gauges & Zone Marking';
                iconWrap.innerHTML = '<i class="fas fa-water"></i>';
                body.innerHTML = `
                    <div class="portal-metric-strip">
                        <div class="portal-stat-box"><strong>3 Stations</strong><span>Active Gauges</span></div>
                        <div class="portal-stat-box"><strong>18.2 m</strong><span style="color:#dc2626;">Brahmaputra (Dangerous)</span></div>
                        <div class="portal-stat-box"><strong>4 Villages</strong><span>Critical Inundation</span></div>
                        <div class="portal-stat-box"><strong>2 Alerts</strong><span>Active Warnings</span></div>
                    </div>
                    <div style="background:#fff; border:1px solid #dce8f5; border-radius:8px; padding:12px; margin-bottom:12px;">
                        <h4 style="margin:0 0 8px 0; font-size:13px; color:#072247;">Mark / Update Flood-Affected Area on GIS Map</h4>
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:8px;">
                            <input type="text" class="form-input" placeholder="Village Name (e.g. Rampur)" value="Chaygaon Ward 3" />
                            <select class="form-input">
                                <option>Severity: Critical</option>
                                <option>Severity: High</option>
                                <option>Severity: Moderate</option>
                            </select>
                            <input type="number" class="form-input" placeholder="Est. Affected Pop" value="4200" />
                            <button class="btn-table-action" onclick="showToast('Area marked on GIS Map successfully!')">Update Map</button>
                        </div>
                    </div>
                    <table class="portal-table">
                        <thead>
                            <tr><th>River Station</th><th>Current Reading</th><th>Danger Level</th><th>Trend</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Brahmaputra (Kamrup)</td><td><strong>18.2 m</strong></td><td>18.0 m</td><td><span style="color:#dc2626;">↑ Rising</span></td><td><button class="btn-table-action" onclick="showToast('Alert broadcast triggered!')">Broadcast Warning</button></td></tr>
                            <tr><td>Kolong (Kamrup)</td><td><strong>14.6 m</strong></td><td>15.0 m</td><td><span style="color:#d97706;">↑ Rising</span></td><td><button class="btn-table-action" onclick="showToast('Advisory issued')">Issue Advisory</button></td></tr>
                            <tr><td>Kakang (Kamrup)</td><td><strong>12.8 m</strong></td><td>14.0 m</td><td><span style="color:#16a34a;">→ Steady</span></td><td><button class="btn-table-action" onclick="showToast('Reading logged')">Log Status</button></td></tr>
                        </tbody>
                    </table>
                `;
            } else if (role === 'authority') {
                title.textContent = 'District Authority Portal – Decision-Making & Allocations';
                sub.textContent = 'Operational Domain: Resource Approvals, Priorities & NDRF Coordination Records';
                iconWrap.innerHTML = '<i class="fas fa-user-tie"></i>';
                body.innerHTML = `
                    <div class="portal-metric-strip">
                        <div class="portal-stat-box"><strong>6 Teams</strong><span>NDRF/SDRF Deployed</span></div>
                        <div class="portal-stat-box"><strong>2 Pending</strong><span>Resource Requests</span></div>
                        <div class="portal-stat-box"><strong>1,250 Kits</strong><span>Total Dispatched</span></div>
                        <div class="portal-stat-box"><strong>18 Camps</strong><span>Relief Shelters</span></div>
                    </div>
                    <table class="portal-table" style="margin-bottom:12px;">
                        <thead>
                            <tr><th>Request ID</th><th>Affected Block</th><th>Requested Supplies</th><th>Priority</th><th>Decision Action</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>REQ-2026-081</td>
                                <td>Palashbari Riverside</td>
                                <td>4 Inflatable Motorboats, 60 Life Jackets</td>
                                <td><span style="color:#dc2626; font-weight:800;">CRITICAL</span></td>
                                <td>
                                    <button class="btn-table-action" style="background:#15803d;" onclick="this.parentElement.innerHTML='<span style=\\'color:#15803d;font-weight:700;\\'>Approved → Sent to Godown</span>'">Approve</button>
                                    <button class="btn-table-action" style="background:#dc2626;" onclick="showToast('Request rejected with reason')">Reject</button>
                                </td>
                            </tr>
                            <tr>
                                <td>REQ-2026-082</td>
                                <td>Chaygaon Relief Camp 2</td>
                                <td>500 Dry Ration Packets, 120 Tarpaulins</td>
                                <td><span style="color:#d97706; font-weight:800;">HIGH</span></td>
                                <td>
                                    <button class="btn-table-action" style="background:#15803d;" onclick="this.parentElement.innerHTML='<span style=\\'color:#15803d;font-weight:700;\\'>Approved → Sent to Godown</span>'">Approve</button>
                                    <button class="btn-table-action" style="background:#dc2626;" onclick="showToast('Request rejected')">Reject</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px; font-size:11.5px; color:#14532d;">
                        <i class="fas fa-phone-volume"></i> <strong>Official NDRF 1st Battalion Coordination Log:</strong> 2 rescue teams operational in Palashbari; 4 zodiac boats evacuating stranded families.
                    </div>
                `;
            } else if (role === 'godown') {
                title.textContent = 'Godown Manager Portal – Physical Stock & Dispatch';
                sub.textContent = 'Operational Domain: Inventory Levels, Packing, Dispatch Logs & Stock Audit';
                iconWrap.innerHTML = '<i class="fas fa-warehouse"></i>';
                body.innerHTML = `
                    <div class="portal-metric-strip">
                        <div class="portal-stat-box"><strong>14 Boats</strong><span>In Stock (Central Godown)</span></div>
                        <div class="portal-stat-box"><strong>320 Jackets</strong><span>Available Life Jackets</span></div>
                        <div class="portal-stat-box"><strong>2,400 Kits</strong><span>Food & Water Rations</span></div>
                        <div class="portal-stat-box"><strong>1 Dispatch</strong><span>Awaiting Departure</span></div>
                    </div>
                    <table class="portal-table">
                        <thead>
                            <tr><th>Dispatch ID</th><th>Destination</th><th>Approved Items</th><th>Vehicle No.</th><th>Status / Dispatch</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>DSP-904</td>
                                <td>Chaygaon Shelter #1</td>
                                <td>400 Ration Kits, 40 Life Jackets</td>
                                <td>AS-01-EC-4412</td>
                                <td><button class="btn-table-action" onclick="this.parentElement.innerHTML='<span style=\\'color:#15803d;font-weight:700;\\'>In-Transit (Dispatched)</span>'">Mark Dispatched</button></td>
                            </tr>
                            <tr>
                                <td>DSP-903</td>
                                <td>Palashbari Ghat</td>
                                <td>2 Rescue Boats, 30 Life Jackets</td>
                                <td>AS-01-GC-8190</td>
                                <td><span style="color:#15803d; font-weight:700;">Delivered & Verified</span></td>
                            </tr>
                        </tbody>
                    </table>
                `;
            } else if (role === 'ground') {
                title.textContent = 'Ground Officer Portal – Field Delivery Verification';
                sub.textContent = 'Operational Domain: Physical Verification, Shortage/Damage Reporting & Return Inspection';
                iconWrap.innerHTML = '<i class="fas fa-clipboard-check"></i>';
                body.innerHTML = `
                    <div class="portal-metric-strip">
                        <div class="portal-stat-box"><strong>3 Shipments</strong><span>Received Today</span></div>
                        <div class="portal-stat-box"><strong>100%</strong><span>Delivery Accuracy</span></div>
                        <div class="portal-stat-box"><strong>0 Damaged</strong><span>Reported in Field</span></div>
                        <div class="portal-stat-box"><strong>1 Return</strong><span>Scheduled for Godown</span></div>
                    </div>
                    <table class="portal-table">
                        <thead>
                            <tr><th>Consignment</th><th>Dispatched Qty</th><th>Physically Verified</th><th>Discrepancy / Damaged</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>DSP-904 (Chaygaon)</td>
                                <td>400 Rations, 40 Jackets</td>
                                <td><input type="text" value="400 Rations, 40 Jackets" style="width:140px; font-size:11px;" /></td>
                                <td><span style="color:#15803d;">Zero Discrepancy</span></td>
                                <td><button class="btn-table-action" onclick="showToast('Physical Delivery Verified and Signed!')">Verify Receipt</button></td>
                            </tr>
                        </tbody>
                    </table>
                `;
            } else if (role === 'monitoring') {
                title.textContent = 'Monitoring Officer Portal – Operational Audit & Integrity';
                sub.textContent = 'Operational Domain: End-to-End Resource Tracking, Discrepancy Detection & Reports';
                iconWrap.innerHTML = '<i class="fas fa-chart-line"></i>';
                body.innerHTML = `
                    <div class="portal-metric-strip">
                        <div class="portal-stat-box"><strong>1,250 Dispatched</strong><span>Total Supplies</span></div>
                        <div class="portal-stat-box"><strong>1,250 Verified</strong><span>Ground Confirmed</span></div>
                        <div class="portal-stat-box"><strong>0 Missing</strong><span>Zero Discrepancy</span></div>
                        <div class="portal-stat-box"><strong style="color:#15803d;">99.8%</strong><span>Operational Score</span></div>
                    </div>
                    <div style="background:#fff; border:1px solid #dce8f5; border-radius:8px; padding:12px; margin-bottom:12px;">
                        <h4 style="margin:0 0 6px 0; font-size:13px; color:#072247;">Automated Reconciliation Audit</h4>
                        <p style="margin:0; font-size:11.5px; color:#334155;">
                            All dispatches from Central Godown match physical ground verification receipts at Chaygaon and Palashbari. No damaged or unaccounted resources detected in the last 48 hours.
                        </p>
                    </div>
                    <button class="btn-table-action" style="padding:6px 14px; font-size:12px;" onclick="showToast('Official District Audit Report generated (PDF)')">
                        <i class="fas fa-download"></i> Download Audit Certificate
                    </button>
                `;
            }
            modal.classList.add('open');
        }

        function closeRolePortalModal() {
            document.getElementById('rolePortalModal').classList.remove('open');
        }

        // Citizen Modals
        function openCitizenModal(type) {
            const modal = document.getElementById('serviceModal');
            const title = document.getElementById('serviceModalTitle');
            const body = document.getElementById('serviceModalBody');

            if (type === 'alerts') {
                title.textContent = 'Official District Flood Alerts & Warnings';
                body.innerHTML = `
                    <div style="background:#fee2e2; border-left:4px solid #dc2626; padding:10px; border-radius:6px; margin-bottom:10px;">
                        <strong style="color:#b91c1c;">RED ALERT: Brahmaputra River Basin</strong>
                        <p style="margin:4px 0 0 0; font-size:12px; color:#7f1d1d;">
                            Water level in river Brahmaputra at Kamrup station stands at <strong>18.2 m</strong> (0.2 m above Danger Mark). Embankments in Palashbari and Chaygaon under 24×7 patrol.
                        </p>
                    </div>
                    <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:10px; border-radius:6px;">
                        <strong style="color:#92400e;">AMBER WARNING: Kolong Basin</strong>
                        <p style="margin:4px 0 0 0; font-size:12px; color:#78350f;">
                            Water level at 14.6 m, rising steadily. Low-lying residents advised to prepare emergency kits.
                        </p>
                    </div>
                `;
            } else if (type === 'camps') {
                title.textContent = 'Designated Active Relief Camps (Kamrup District)';
                body.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                            <strong>Palashbari Higher Secondary School Relief Camp</strong>
                            <div style="font-size:11.5px; color:#475569; margin-top:2px;">
                                Capacity: 500 Persons • Drinking Water & Medical First Aid Available • Contact: 1077
                            </div>
                        </div>
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                            <strong>Chaygaon Community Hall Relief Center</strong>
                            <div style="font-size:11.5px; color:#475569; margin-top:2px;">
                                Capacity: 350 Persons • Sanitation & Cooked Food Supply Active • Contact: 1077
                            </div>
                        </div>
                    </div>
                `;
            } else if (type === 'contacts') {
                title.textContent = 'Emergency Assistance Helpline Directory';
                body.innerHTML = `
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px; border-radius:8px; text-align:center;">
                            <strong style="font-size:18px; color:#15803d;">112</strong>
                            <span style="display:block; font-size:11px; color:#14532d;">National Emergency Response</span>
                        </div>
                        <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:10px; border-radius:8px; text-align:center;">
                            <strong style="font-size:18px; color:#1d4ed8;">1077</strong>
                            <span style="display:block; font-size:11px; color:#1e40af;">District Emergency Operations Center</span>
                        </div>
                        <div style="background:#fef2f2; border:1px solid #fecaca; padding:10px; border-radius:8px; text-align:center;">
                            <strong style="font-size:18px; color:#dc2626;">108</strong>
                            <span style="display:block; font-size:11px; color:#991b1b;">24×7 Ambulance Service</span>
                        </div>
                        <div style="background:#faf5ff; border:1px solid #e9d5ff; padding:10px; border-radius:8px; text-align:center;">
                            <strong style="font-size:18px; color:#7e22ce;">1070</strong>
                            <span style="display:block; font-size:11px; color:#6b21a8;">State Disaster Control Room</span>
                        </div>
                    </div>
                `;
            } else if (type === 'weather') {
                title.textContent = 'District Meteorological & Rainfall Advisory';
                body.innerHTML = `
                    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:12px;">
                        <strong>Regional Weather Warning (Next 24–48 Hours)</strong>
                        <p style="margin:6px 0 0; font-size:12px; color:#0369a1; line-height:1.45;">
                            Heavy to very heavy precipitation forecast across Upper Assam catchment basins. Estimated 65–90 mm rainfall expected. River Brahmaputra gauge expected to crest near 18.4 m.
                        </p>
                    </div>
                `;
            } else if (type === 'news') {
                title.textContent = 'District Flood Bulletins & News';
                const data = window.NEERAKSHAK_SEED_DATA || {};
                const list = data.latestNewsUpdates || [];
                body.innerHTML = list.map(n => `
                    <div style="border-bottom:1px solid #e2e8f0; padding:8px 0;">
                        <span style="font-size:10px; font-weight:800; background:#dbeafe; color:#0369a1; padding:2px 6px; border-radius:6px;">${n.category}</span>
                        <h4 style="margin:4px 0 2px; font-size:12.5px;">${n.headline}</h4>
                        <p style="margin:0; font-size:11.5px; color:#475569;">${n.details}</p>
                    </div>
                `).join('') || '<p>No announcements.</p>';
            } else if (type === 'safety') {
                document.getElementById('preparedness').scrollIntoView({ behavior: 'smooth' });
                return;
            } else if (type === 'support') {
                title.textContent = 'Relief Supplies & Public Support';
                body.innerHTML = `
                    <p style="font-size:12px; color:#334155; line-height:1.5;">
                        Emergency relief consignments (dry food packets, drinking water canisters, water purification drops, and baby food) are supplied free of cost at authorized relief camps. If your area requires air-dropped supplies, call District DEOC at 1077.
                    </p>
                `;
            }
            modal.classList.add('open');
        }

        function closeServiceModal() {
            document.getElementById('serviceModal').classList.remove('open');
        }

        function openFeatureModal(feat) {
            const titleMap = {
                monitoring: 'Real-time River & Weather Monitoring',
                gis: 'Flood Risk & Affected Area Mapping',
                inventory: 'Resource & Inventory Management',
                coordination: 'Relief & Rescue Coordination (NDRF / SDRF)',
                tracking: 'Dispatch, Delivery & Return Tracking',
                reporting: 'Incident & Situation Reporting'
            };
            openCitizenModal('support');
            document.getElementById('serviceModalTitle').textContent = titleMap[feat] || 'Platform Feature';
        }

        // Incident Form Modal
        function openIncidentReportModal() {
            document.getElementById('incidentModal').classList.add('open');
        }

        function closeIncidentModal() {
            document.getElementById('incidentModal').classList.remove('open');
        }

        function handleIncidentSubmit(e) {
            e.preventDefault();
            closeIncidentModal();
            showToast('Incident recorded! Dispatched to District Control Room.');
        }

        // GIS Map Modal
        function openLiveMapModal() {
            document.getElementById('mapModal').classList.add('open');
        }

        function closeMapModal() {
            document.getElementById('mapModal').classList.remove('open');
        }

        function toggleMapFullscreen() {
            const box = document.getElementById('mapModalContainer');
            const icon = document.getElementById('mapExpandIcon');
            if (box.style.maxWidth === '98vw') {
                box.style.maxWidth = '960px';
                icon.classList.replace('fa-compress', 'fa-expand');
            } else {
                box.style.maxWidth = '98vw';
                icon.classList.replace('fa-expand', 'fa-compress');
            }
        }

        // Initialize on DOM load
        
        __onReady( () => {
            renderSeedData();
            initScrollAnimations();
        });
    

// Inline handlers (onClick=...) and generated HTML call these on window, exactly like a classic script.
Object.assign(window, { adjustFontSize, closeIncidentModal, closeLoginModal, closeMapModal, closeRolePortalModal, closeServiceModal, copyNumber, enterFullRoleDashboard, handleFormLogin, handleIncidentSubmit, initScrollAnimations, launchRolePortal, openCitizenModal, openFeatureModal, openIncidentReportModal, openLiveMapModal, openLoginModal, renderSeedData, selectLoginRole, showToast, toggleMapFullscreen, toggleTheme });
__ready.forEach((fn) => fn());
}
