import { useEffect } from 'react';
import css from './ground-officer.css?inline';
import '../../components/interportalChat.css';
import initGroundOfficerPage from './ground-officer.legacy.js';
import { setupRouteGuard } from '../../auth';

// Static markup, created once so React never re-renders over what the page script builds.
const markup = (
  <>
      {/* SPACIOUS HIGH-DEFINITION COMMAND HERO BANNER (MATCHED TO 2ADMIN, 3AUTHORITY & RESCUE BOAT IMAGE) */}
      <header className="go-hero-banner anim-card">
        {/* 1. High-definition NDRF rescue boat team on the right */}
        <div className="go-banner-img-wrap">
          <img src="/groundofficer_banner.jpg" alt={"Field Operations, NDRF Rescue Boat & Ground Reporting"} className="go-banner-img" />
        </div>
        {/* 2. Curved Wave Swooshes merging left crisp panel into right photo */}
        {" "}
        <svg className="go-banner-swoosh-svg" viewBox="0 0 1200 210" preserveAspectRatio="none">
          <defs>
            <linearGradient id="goLeftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff"></stop>
              <stop offset="68%" stopColor="#f2f9ff"></stop>
              <stop offset="92%" stopColor="#e0f2fe"></stop>
              <stop offset="100%" stopColor="#d6edfc"></stop>
            </linearGradient>
          </defs>
          {/* Left solid backdrop filling from x=0 to curved boundary */}
          <path d="M0,0 L610,0 C560,55 500,120 420,210 L0,210 Z" fill="url(#goLeftGrad)"></path>
          {/* Blue Outer Wave Accent */}
          <path d="M610,0 C560,55 500,120 420,210" stroke="#0ea5e9" strokeWidth="8" fill="none" opacity="0.95"></path>
          {/* Cyan Highlight Accent */}
          <path d="M620,0 C570,55 510,120 430,210" stroke="#38bdf8" strokeWidth="3" fill="none" opacity="0.8"></path>
          {/* Emerald Field Rescue Accent matching rescue operations & foliage */}
          <path d="M600,0 C550,55 490,120 410,210" stroke="#10b981" strokeWidth="5.5" fill="none" opacity="0.95"></path>
        </svg>
        {" "}
        {/* 3. Ground Officer Banner Inner Content */}
        <div className="go-hero-inner">
          {/* Top Row: Brand Lockup & HUD Action Controls (Matching 2admin.html & 3authority.html) */}
          <div className="go-banner-top-row">
            <div className="hero-brand-lockup">
              <div className="hero-vertical-pillar"></div>
              <div className="hero-brand-content">
                <div className="hero-brand-title-wrap">
                  <h1 className="hero-brand-title">
                    NEERA
                    <span className="hero-brand-cyan">KSHAK</span>
                  </h1>
                  <span className="hero-admin-badge" style={{ background: "linear-gradient(135deg, #0d9488 0%, #0284c7 100%)" }}>Ground Officer</span>
                </div>
              </div>
            </div>
            {/* HUD Action Controls (Matching 2admin.html) */}
            <div className="hero-action-controls">
              <div className="hero-ctrl-pill">
                <i className="fas fa-location-dot" style={{ color: "#38bdf8" }}></i>
                {" "}
                <select className="hero-district-select" id="assignedAreaFilter" onChange={(event) => window.renderAllGroundViews()}>
                  <option value="ALL">All My Assigned Areas (3 Sectors)</option>
                  <option value="Palashbari Riverside Ward 2">Palashbari Riverside Ward 2</option>
                  <option value="Chaygaon Lowland Belt">Chaygaon Lowland Belt</option>
                  <option value="Goroimari Char Cluster">Goroimari Char Cluster</option>
                </select>
              </div>
              <div className="hero-ctrl-pill">
                <span className="hero-live-dot"></span>
                {" "}
                <span id="fieldActiveText">Field Active</span>
              </div>
              {/* SMOOTH SLIDE SWITCH FOR GRID VIEW vs LIST VIEW */}
              <div className="view-slide-switch" id="viewSlideSwitch" onClick={(event) => window.toggleGridListView()} title="Toggle Grid vs List View">
                <div className="slide-thumb"></div>
                <span className="slide-option opt-grid">
                  <i className="fas fa-grip"></i>
                  {" Grid"}
                </span>
                {" "}
                <span className="slide-option opt-list">
                  <i className="fas fa-list"></i>
                  {" List"}
                </span>
              </div>
              {" "}
              <a href="/" className="hero-btn-action hero-btn-public" title="Return to citizen portal">
                <i className="fas fa-arrow-left"></i>
                {" Public Portal "}
              </a>
              {" "}
              <a href="/login?logout=1" onClick={(event) => { event.preventDefault(); if (window.neerakshakLogout) window.neerakshakLogout(); else { try{sessionStorage.clear(); sessionStorage.setItem('neerakshak_logged_out', '1');}catch(e){} window.location.href = '/login?logout=1'; } }} className="hero-btn-action hero-btn-logout" title="Sign out of district session">
                <i className="fas fa-right-from-bracket"></i>
                {" Logout "}
              </a>
            </div>
          </div>
          {/* Main Banner Headline & Eyebrow Pill */}
          <div className="go-banner-main-content">
            <div className="go-banner-text-block">
              <span className="auth-eyebrow-pill">
                <i className="fas fa-person-walking-luggage" style={{ color: "#0d9488" }}></i>
                {" FIELD OPERATIONS & DISASTER RESPONSE COMMAND "}
              </span>
              <h2 className="auth-banner-headline">
                {"Field Operations, Physical Delivery Verification & Ground Reporting"}
              </h2>
              <p className="auth-banner-description">
                {"Verify physical relief deliveries dispatched by Godown Manager, report live village flood depth & stranded populations, submit SOS escalations, and coordinate NDRF/SDRF rescue operations."}
              </p>
            </div>
          </div>
        </div>
      </header>
      {/* 2. MAIN WORKSPACE (9-SECTION SIDEBAR | TASK & FIELD WORKSPACE) */}
      <div className="workspace-shell">
        {/* LEFT 9-SECTION SIDEBAR */}
        {" "}
        {/* 70px VERTICAL ICON RAIL */}
        <aside className="left-rail">
          <button className="rail-btn go-nav-btn active" data-tab="dashboard" onClick={(event) => window.switchGroundTab('dashboard', event.currentTarget)} title="Field Dashboard">
            <i className="fas fa-gauge-high"></i>
            <span>Dashboard</span>
          </button>
          <button className="rail-btn go-nav-btn" data-tab="assigned-deliveries" onClick={(event) => window.switchGroundTab('assigned-deliveries', event.currentTarget)} title="Assigned Sectors & Physical Deliveries">
            <i className="fas fa-truck-ramp-box"></i>
            <span>Deliveries</span>
            <span className="rail-badge-count warn" id="navPendingDelivCount">0</span>
          </button>
          <button className="rail-btn go-nav-btn" data-tab="field-reports" onClick={(event) => window.switchGroundTab('field-reports', event.currentTarget)} title="File Village Field Report & SOS Verification">
            <i className="fas fa-house-flood-water"></i>
            <span>Report SOS</span>
          </button>
          <button className="rail-btn go-nav-btn" data-tab="rescue-ops" onClick={(event) => window.switchGroundTab('rescue-ops', event.currentTarget)} title="Return Ops & Situation Control Clearance">
            <i className="fas fa-shield-heart"></i>
            <span>Return Ops</span>
            <span className="rail-badge-count" id="navOpsCount">0</span>
          </button>
          <button className="rail-btn go-nav-btn" data-tab="return-verify" onClick={(event) => window.switchGroundTab('return-verify', event.currentTarget)} title="Verify Returned Resources">
            <i className="fas fa-rotate-left"></i>
            <span>Returns</span>
          </button>
          <button className="rail-btn go-nav-btn" data-tab="notifications" onClick={(event) => window.switchGroundTab('notifications', event.currentTarget)} title="Field Alerts & Multi-Agency Directives">
            <i className="fas fa-bell"></i>
            <span>Alerts</span>
            <span className="rail-badge-count warn" id="navNotifCount">0</span>
          </button>
          <button className="rail-btn go-nav-btn" data-tab="profile" onClick={(event) => window.switchGroundTab('profile', event.currentTarget)} title="Officer Profile & Settings">
            <i className="fas fa-user-gear"></i>
            <span>Settings</span>
          </button>
          <button className="rail-btn go-nav-btn" data-tab="interportal-comms" onClick={(event) => window.switchGroundTab('interportal-comms', event.currentTarget)} title="Live Inter-Portal Multi-Agency Comms & Direct Dispatch">
            <i className="fas fa-tower-broadcast"></i>
            <span>Live Comms</span>
            <span className="rail-badge-count" id="groundCommsBadge" style={{ display: 'none' }}>0</span>
          </button>
          {/* Bottom Tools & Telemetry Sync Anchor (Matching 2admin.html & 3authority.html) */}
          <div className="rail-bottom-cluster">
            <div className="rail-divider"></div>
            <button className="rail-btn" onClick={(event) => { window.renderAllGroundViews(); window.showToast('Field operations & telemetry synced'); }} title="Sync All Records">
              <i className="fas fa-arrows-rotate"></i>
              {" "}
              <span>Sync</span>
            </button>
            <div className="rail-pulse-wrap" title="Field Unit Radio Active">
              <span className="rail-online-dot"></span>
              {" "}
              <span className="rail-online-text">SYS OK</span>
            </div>
          </div>
        </aside>
        {/* MAIN CONTENT STAGE */}
        <main className="main-content-col">
          {/* COLORFUL 6-KPI FIELD SUMMARY STRIP */}
          <div className="kpi-grid-6 anim-card" id="groundKpiGrid"></div>
          {/* ===============================================================
                 TAB 1: DASHBOARD (REAL LEAFLET GIS MAP HUB)
                 =============================================================== */}
          <div className="go-tab-pane active" id="tab-dashboard">
            {/* REAL LEAFLET GIS FLOOD MAP VIEWPORT */}
            <div className="aqua-card anim-card" style={{ marginBottom: "0", padding: "14px 14px 12px" }}>
              <div className="card-head" style={{ marginBottom: "10px" }}>
                <h2>
                  <i className="fas fa-map-location-dot" style={{ color: "var(--river-blue)" }}></i>
                  {" Ground Flood Command GIS Map – Live Sector Surveillance"}
                </h2>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button type="button" className="btn-card-action" onClick={() => window.filterGroundMapSeverity && window.filterGroundMapSeverity('ALL')}>All Zones</button>
                  <button type="button" className="btn-card-action" style={{ color: "#b91c1c" }} onClick={() => window.filterGroundMapSeverity && window.filterGroundMapSeverity('Critical')}>Critical Only</button>
                  <button type="button" className="btn-card-action" style={{ color: "#c2410c" }} onClick={() => window.filterGroundMapSeverity && window.filterGroundMapSeverity('High')}>High Only</button>
                </div>
              </div>
              <div id="groundMapSlot" style={{ position: "relative", width: "100%", height: "360px", minHeight: "320px", borderRadius: "14px", overflow: "hidden", border: "1.5px solid #93c5fd", background: "#e2e8f0", boxShadow: "0 4px 18px rgba(2, 132, 199, 0.08)" }}>
                <div id="groundLeafletMap" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}></div>
                <div className="map-float-search" style={{ zIndex: 500 }}>
                  <i className="fas fa-search" style={{ color: "#64748b" }}></i>
                  <input type="text" placeholder="Search assigned village, sector, river basin..." onKeyUp={(event) => { if(event.key==='Enter') window.searchGroundMap && window.searchGroundMap(event.currentTarget.value); }} />
                </div>
                <div className="map-legend-overlay" style={{ zIndex: 500 }}>
                  <span><i className="l-dot" style={{ background: "#dc2626" }}></i> Critical / Submerged</span>
                  <span><i className="l-dot" style={{ background: "#ea580c" }}></i> High Risk</span>
                  <span><i className="l-dot" style={{ background: "#eab308" }}></i> Moderate</span>
                  <span><i className="l-dot" style={{ background: "#16a34a" }}></i> Normal Access</span>
                </div>
                <div className="map-zoom-controls" style={{ zIndex: 500 }}>
                  <button type="button" className="map-z-btn" onClick={() => window.groundMapZoomIn && window.groundMapZoomIn()} title="Zoom In">+</button>
                  <button type="button" className="map-z-btn" onClick={() => window.groundMapZoomOut && window.groundMapZoomOut()} title="Zoom Out">−</button>
                  <button type="button" className="map-z-btn" onClick={() => window.groundMapRecenter && window.groundMapRecenter()} title="Recenter">
                    <i className="fas fa-crosshairs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 2: ASSIGNED DELIVERIES (MERGED ASSIGNED SECTORS & DELIVERIES)
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-assigned-deliveries">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-truck-ramp-box" style={{ color: "var(--river-blue)" }}></i>
                  {" Assigned Flood Sectors & Physical Delivery Cross-Audit"}
                </h2>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>Filter Sector:</span>
                  <select id="delivSectorFilter" className="form-control" style={{ padding: "4px 10px", fontSize: "11.5px", width: "auto" }} onChange={() => window.renderAllGroundViews && window.renderAllGroundViews()}>
                    <option value="ALL">All Affected Sectors</option>
                  </select>
                </div>
              </div>
              <div style={{ background: "#eef6fd", borderLeft: "3.5px solid var(--river-blue)", padding: "9px 13px", borderRadius: "8px", fontSize: "11.5px", color: "var(--navy-deep)", marginBottom: "14px", lineHeight: "1.5" }}>
                <strong>Multi-Agency Chain of Custody Audit:</strong>
                {" Compare approved quota vs dispatched quantity vs actual physical receipts on ground. Details include convoy driver, escort officers, vehicle telemetry, gate-pass reference, and required evidence uploads. "}
              </div>
              <div className="grid-1 switchable-collection" id="assignedDeliveriesGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 3: REPORT SOS (SECTOR-WISE INSTANT VERIFICATION FORM)
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-field-reports">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-house-flood-water" style={{ color: "var(--teal-field)" }}></i>
                  {" Submit Ground Flood SITREP & Verification"}
                </h2>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>Tap any sector below to auto-load verification form</span>
              </div>
              {/* Interactive Sector Selector Chips */}
              <div className="sector-chips-bar" id="sosSectorChipsBar"></div>
              <form onSubmit={(event) => window.submitFieldSituationReport(event)}>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Selected Affected Sector *</label>
                    <select id="frVillageSel" className="form-control" required></select>
                  </div>
                  <div className="form-group">
                    <label>Observed Flood Severity *</label>
                    <select id="frSeveritySel" className="form-control">
                      <option value="Critical">Critical (Inundation Danger)</option>
                      <option value="High">High Risk</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Water Level / Inundation Observation *</label>
                    <input type="text" id="frWaterLevel" className="form-control" placeholder="e.g. 4.2 ft in residential ward, river rising" required />
                  </div>
                </div>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Affected Population *</label>
                    <input type="text" id="frAffectedPop" className="form-control" placeholder="e.g. 320 households (~1,450 citizens)" required />
                  </div>
                  <div className="form-group">
                    <label>Stranded Citizens Count *</label>
                    <input type="number" id="frStrandedCount" className="form-control" min="0" defaultValue="45" required />
                  </div>
                  <div className="form-group">
                    <label>Road / Access Condition *</label>
                    <select id="frRoadCond" className="form-control">
                      <option value="Blocked / Submerged (Boat Only)">Blocked / Submerged (Boat Only)</option>
                      <option value="Partially Accessible (Heavy Vehicles)">Partially Accessible (Heavy Vehicles)</option>
                      <option value="Accessible">Accessible</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Urgent Needs (Food/Water/Boats/Meds) *</label>
                    <input type="text" id="frUrgentNeeds" className="form-control" placeholder="e.g. 2 Inflatable boats, 300 food packets, ORS" required />
                  </div>
                  <div className="form-group">
                    <label>GPS Coordinates (Auto-Captured) *</label>
                    <input type="text" id="frGpsCoords" className="form-control" defaultValue="26.1320° N, 91.5150° E" required />
                  </div>
                  <div className="form-group">
                    <label>Evidence Reference ID / Receipt Ref</label>
                    <input type="text" id="frEvidenceRef" className="form-control" placeholder="e.g. EVD-KAM-2026-881 / Photo ID" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Field Photo / Document Attachment</label>
                  <input type="file" id="frPhotoInput" className="form-control" accept="image/*,.pdf" />
                </div>
                <div className="form-group">
                  <label>Ground Officer Field Verification Comments *</label>
                  <textarea id="frRemarks" className="form-control" rows="3" placeholder="Detailed ground observation, embankment conditions, breach telemetry, or medical emergency cases..." required></textarea>
                </div>
                <button type="submit" className="btn-go primary" style={{ padding: "11px 22px", fontSize: "13px" }}>
                  <i className="fas fa-paper-plane"></i>
                  {" Submit Ground Field Verification & SOS Alert"}
                </button>
              </form>
              <div style={{ marginTop: "18px", borderTop: "1px dashed #cbd5e1", paddingTop: "14px" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "var(--navy-deep)" }}><i className="fas fa-clock-rotate-left"></i> Recent Ground Field Reports & Audit History</h4>
                <div className="grid-2 switchable-collection" id="recentSosReportsList"></div>
              </div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 4: RETURN OPS & FIELD SITUATION CONTROL CLEARANCE
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-rescue-ops">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-shield-heart" style={{ color: "var(--teal-field)" }}></i>
                  {" Return Ops – Situation Control, Evacuation Audit & Return Clearance"}
                </h2>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>Sector:</span>
                  <select id="rescueSectorFilter" className="form-control" style={{ padding: "4px 10px", fontSize: "11.5px", width: "auto" }} onChange={() => window.renderAllGroundViews && window.renderAllGroundViews()}>
                    <option value="ALL">All Return Ops Sectors</option>
                  </select>
                </div>
              </div>
              <div style={{ background: "#f0fdf4", borderLeft: "3.5px solid #16a34a", padding: "8px 12px", borderRadius: "8px", fontSize: "11.5px", color: "#14532d", marginBottom: "12px" }}>
                <strong>Situation Control & Clearance Protocol:</strong>
                {" Confirm evacuation progress, count remaining stranded citizens (safe / 0), and declare situation controlled to clear and unlock equipment for warehouse return. "}
              </div>
              <div className="grid-2 switchable-collection" id="fullRescueOpsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 5: RETURNS (SECTOR-WISE DETAILED ITEM-WISE AUDIT WITH GUARD)
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-return-verify">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-rotate-left" style={{ color: "var(--teal-field)" }}></i>
                  {" Post-Operation Return & Physical Restock Audit"}
                </h2>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>Sector:</span>
                  <select id="returnSectorFilter" className="form-control" style={{ padding: "4px 10px", fontSize: "11.5px", width: "auto" }} onChange={() => window.renderAllGroundViews && window.renderAllGroundViews()}>
                    <option value="ALL">All Return Sectors</option>
                  </select>
                </div>
              </div>
              <div style={{ background: "#f0fdf4", borderLeft: "3.5px solid var(--teal-field)", padding: "8px 12px", borderRadius: "8px", fontSize: "11.5px", color: "#065f46", marginBottom: "12px" }}>
                <strong>Strict Dual-Verification Protocol:</strong>
                {" The return intake portal for each sector activates only after physical delivery is verified and the ground officer confirms the situation is under control. Itemize returned vs damaged vs missing equipment before warehouse handover. "}
              </div>
              <div className="grid-1 switchable-collection" id="returnVerifyGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 6: NOTIFICATIONS & FIELD DIRECTIVES STREAM
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-notifications">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-bell" style={{ color: "#dc2626" }}></i>
                  {" Field Operations Notification Stream & Multi-Agency Directives"}
                </h2>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button type="button" className="btn-card-action active" id="notifFilterAll" onClick={() => window.filterNotifs && window.filterNotifs('ALL')}>All</button>
                  <button type="button" className="btn-card-action" id="notifFilterCrit" style={{ color: "#b91c1c" }} onClick={() => window.filterNotifs && window.filterNotifs('Critical')}>Critical Alerts</button>
                  <button type="button" className="btn-card-action" id="notifFilterConvoys" style={{ color: "#0369a1" }} onClick={() => window.filterNotifs && window.filterNotifs('Convoys')}>Convoys & Dispatches</button>
                </div>
              </div>
              <div className="alert-feed-list" id="notificationsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 7: PROFILE & SETTINGS
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-profile">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-user-gear" style={{ color: "var(--navy-deep)" }}></i>
                  {" Ground Officer Profile & Security Audit"}
                </h2>
              </div>
              <div className="grid-2">
                <div className="sub-card tone-purple">
                  <h4>Field Officer Identity</h4>
                  <div className="meta-box">
                    <span>Officer Name: <strong>Bhaskar Jyoti Das</strong></span>
                    <span>Officer ID: <strong>GO-KAM-04</strong></span>
                    <span>Assigned District: <strong>Kamrup (Palashbari / Chaygaon)</strong></span>
                    <span>Direct Hotline: <strong>+91-98640-21943</strong></span>
                  </div>
                </div>
                <div className="sub-card tone-good">
                  <h4>Audit & Submission Integrity</h4>
                  <p style={{ margin: "0", fontSize: "11.5px", color: "var(--text-body)" }}>
                    {"Every delivery verification and field SITREP report is permanently stamped with Officer ID "}
                    <strong>GO-KAM-04</strong>
                    {", GPS coordinates, and timestamp. All records are cross-audited against Central Godown gate-passes and DEOC monitoring logs."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 8: INTER-PORTAL REAL-TIME COMMS & DISPATCH CHAT
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-interportal-comms">
            <div id="portalChatMount_ground"></div>
          </div>
        </main>
        {/* 4. RIGHT PANEL (QUICK ACTIONS + SELECTED SECTOR + RIVER TELEMETRY + GODOWN SYNC) */}
        <aside className="right-panel">
          {/* Quick Actions */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-bolt" style={{ color: "#f59e0b" }}></i>
                {" Ground Quick Actions"}
              </h2>
            </div>
            <div className="qa-grid-2x2">
              <button type="button" className="qa-color-card qa-blue" onClick={() => window.quickFileSos && window.quickFileSos()} title="Submit field flood SITREP">
                <i className="fas fa-house-flood-water"></i>
                <strong>File SOS SITREP</strong>
                <span>Instant sector report</span>
              </button>
              <button type="button" className="qa-color-card qa-green" onClick={() => window.quickVerifyFirstPending && window.quickVerifyFirstPending()} title="Audit physical arrival">
                <i className="fas fa-truck-ramp-box"></i>
                <strong>Verify Delivery</strong>
                <span>Physical gate check</span>
              </button>
              <button type="button" className="qa-color-card qa-amber" onClick={() => window.quickClearFirstActive && window.quickClearFirstActive()} title="Confirm situation controlled">
                <i className="fas fa-shield-check"></i>
                <strong>Clear for Return</strong>
                <span>Unlock return intake</span>
              </button>
              <button type="button" className="qa-color-card qa-indigo" onClick={() => window.quickOpenRescueModal && window.quickOpenRescueModal()} title="Report rescue progress">
                <i className="fas fa-life-ring"></i>
                <strong>Rescue Progress</strong>
                <span>Evacuation telemetry</span>
              </button>
            </div>
          </div>

          {/* Selected Sector Inspector */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-location-crosshairs" style={{ color: "#dc2626" }}></i>
                {" Selected Flood Sector"}
              </h2>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--river-blue)", cursor: "pointer" }} onClick={() => window.switchGroundTab('assigned-deliveries', document.querySelector('[data-tab=assigned-deliveries]'))}>Details →</span>
            </div>
            <div id="rightSelectedGroundVillageBox"></div>
          </div>

          {/* Live River Basin Hydrological Telemetry */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-water" style={{ color: "var(--river-blue)" }}></i>
                {" River Hydrology Telemetry"}
              </h2>
            </div>
            <div id="rightGroundRiverTelemetryBox" style={{ display: "flex", flexDirection: "column", gap: "8px" }}></div>
          </div>

          {/* Central Godown Dispatch Sync */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-warehouse" style={{ color: "var(--foliage-mid)" }}></i>
                {" Central Godown Dispatch Sync"}
              </h2>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--river-blue)", cursor: "pointer" }} onClick={() => window.switchGroundTab('assigned-deliveries', document.querySelector('[data-tab=assigned-deliveries]'))}>Audit →</span>
            </div>
            <div className="right-mini-grid" id="rightGroundGodownSyncBox"></div>
          </div>
        </aside>
      </div>
      {/* RIPARIAN PANORAMIC FOOTER */}
      <div className="riparian-footer-wrap">
        <div className="footer-scenic-banner">
          <img src="/footer.jpg" alt="Riparian Landscape" className="footer-scenic-img" />
          <div className="footer-scenic-blend"></div>
        </div>
        <div className="riparian-footer-bar">
          <div className="footer-flex">
            <span>
              <strong>NEERAKSHAK Ground Officer Portal</strong>
              {" • Physical Delivery Verification, Field SOS Reports & Rescue Operations"}
            </span>
            {" "}
            <span>
              {"Workflow: Godown Dispatches → Ground Officer Verifies Receipt & Field Reality → Authority Reviews & Coordinates NDRF"}
            </span>
          </div>
        </div>
      </div>
      {/* 1. Verify Physical Delivery Modal */}
      <div className="modal-overlay" id="verifyDeliveryModal" onClick={(event) => window.closeModal('verifyDeliveryModal')}>
        <div className="modal-box" style={{ maxWidth: "620px" }} onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>
              <i className="fas fa-truck-ramp-box" style={{ color: "var(--teal-field)" }}></i>
              {" Physical Delivery Intake & Item-Wise Cross Audit"}
            </h3>
            <button onClick={(event) => window.closeModal('verifyDeliveryModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitDeliveryVerification(event)}>
            <input type="hidden" id="verDelivIdx" />
            <div id="verDelivHeader" style={{ background: "#f0f9ff", border: "1px solid #bae6fd", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "12px" }}></div>
            
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>Item-Wise Physical Verification (Received vs Damaged):</div>
            <div className="form-grid-2" style={{ gap: "10px", marginBottom: "10px" }}>
              <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#0369a1" }}>1. Inflatable Rescue Boats</span>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <div style={{ flex: 1 }}><label style={{ fontSize: "10px" }}>Received *</label><input type="number" id="verBoatsRecv" className="form-control" min="0" onInput={() => window.previewShortageCalc()} required /></div>
                  <div style={{ flex: 1 }}><label style={{ fontSize: "10px" }}>Damaged</label><input type="number" id="verBoatsDmg" className="form-control" min="0" defaultValue="0" onInput={() => window.previewShortageCalc()} /></div>
                </div>
              </div>
              <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#0369a1" }}>2. Life Jackets (SOLAS)</span>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <div style={{ flex: 1 }}><label style={{ fontSize: "10px" }}>Received *</label><input type="number" id="verJacketsRecv" className="form-control" min="0" onInput={() => window.previewShortageCalc()} required /></div>
                  <div style={{ flex: 1 }}><label style={{ fontSize: "10px" }}>Damaged</label><input type="number" id="verJacketsDmg" className="form-control" min="0" defaultValue="0" onInput={() => window.previewShortageCalc()} /></div>
                </div>
              </div>
              <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#0369a1" }}>3. Food Rations Packets</span>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <div style={{ flex: 1 }}><label style={{ fontSize: "10px" }}>Received *</label><input type="number" id="verFoodRecv" className="form-control" min="0" onInput={() => window.previewShortageCalc()} required /></div>
                  <div style={{ flex: 1 }}><label style={{ fontSize: "10px" }}>Damaged</label><input type="number" id="verFoodDmg" className="form-control" min="0" defaultValue="0" onInput={() => window.previewShortageCalc()} /></div>
                </div>
              </div>
              <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#0369a1" }}>4. Medical & First Aid Kits</span>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <div style={{ flex: 1 }}><label style={{ fontSize: "10px" }}>Received *</label><input type="number" id="verMedsRecv" className="form-control" min="0" onInput={() => window.previewShortageCalc()} required /></div>
                  <div style={{ flex: 1 }}><label style={{ fontSize: "10px" }}>Damaged</label><input type="number" id="verMedsDmg" className="form-control" min="0" defaultValue="0" onInput={() => window.previewShortageCalc()} /></div>
                </div>
              </div>
            </div>

            <div id="shortagePreviewBox" style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "8px 10px", fontSize: "11.5px", color: "#14532d", marginBottom: "10px" }}>
              {" Calculated Shortage: "}
              <strong>0 Units</strong>
              {" (Exact Match) "}
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Gate-Pass / Physical Waybill Ref *</label>
                <input type="text" id="verEvidenceRef" className="form-control" placeholder="e.g. WAYBILL-2026-932 / Slip ID" required />
              </div>
              <div className="form-group">
                <label>Verification Remarks / Condition *</label>
                <input type="text" id="verRemarks" className="form-control" placeholder="e.g. Inspected at relief distribution depot" required />
              </div>
            </div>
            <button type="submit" className="btn-go primary" style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: "12.5px" }}>
              <i className="fas fa-check-circle"></i>
              {" Submit Physical Delivery Verification & Sign Digital Receipt"}
            </button>
          </form>
        </div>
      </div>
      {/* 2. Update Rescue Operation Progress Modal */}
      <div className="modal-overlay" id="rescueUpdateModal" onClick={(event) => window.closeModal('rescueUpdateModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>Report Rescue Operation Progress</h3>
            <button onClick={(event) => window.closeModal('rescueUpdateModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitRescueProgress(event)}>
            <input type="hidden" id="opIdxInput" />
            <div id="opModalTitle" style={{ fontWeight: "700", fontSize: "13px", color: "var(--navy-deep)", marginBottom: "10px" }}></div>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Rescued People *</label>
                <input type="number" id="opRescuedInput" className="form-control" min="0" required />
              </div>
              <div className="form-group">
                <label>Remaining Stranded *</label>
                <input type="number" id="opStrandedInput" className="form-control" min="0" required />
              </div>
              <div className="form-group">
                <label>Operation Status *</label>
                <select id="opStatusSel" className="form-control">
                  <option value="In Progress">In Progress</option>
                  <option value="Additional Boats Needed">Additional Boats Needed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Field Assistance / Delay Remarks *</label>
              <input type="text" id="opNotesInput" className="form-control" placeholder="e.g. Strong river current; 2 extra boats requested" required />
            </div>
            <button type="submit" className="btn-go primary" style={{ width: "100%", justifyContent: "center", padding: "10px" }}>Submit Rescue Progress Report</button>
          </form>
        </div>
      </div>
      {/* 3. Return Verification Modal */}
      <div className="modal-overlay" id="returnVerifyModal" onClick={(event) => window.closeModal('returnVerifyModal')}>
        <div className="modal-box" style={{ maxWidth: "580px" }} onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>
              <i className="fas fa-rotate-left" style={{ color: "var(--teal-field)" }}></i>
              {" Post-Operation Return & Physical Restock Audit"}
            </h3>
            <button onClick={(event) => window.closeModal('returnVerifyModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitReturnVerification(event)}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Affected Sector / Location *</label>
                <select id="rvLocationSel" className="form-control" required></select>
              </div>
              <div className="form-group">
                <label>Resource Consignment *</label>
                <input type="text" id="rvItemName" className="form-control" defaultValue="Relief Consignment Rescue Craft & Equipment" required />
              </div>
            </div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#334155", margin: "6px 0", textTransform: "uppercase" }}>Itemized Condition Breakdown (Handover to Central Godown):</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
              {/* Boats */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#0369a1", display: "block", marginBottom: "4px" }}>
                  <i className="fas fa-ship"></i> 1. Inflatable Rescue Boats (Rescue Craft)
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <div><label style={{ fontSize: "10px", color: "#166534", fontWeight: "700" }}>Good Condition *</label><input type="number" id="rvBoatsGood" className="form-control" min="0" defaultValue="2" required /></div>
                  <div><label style={{ fontSize: "10px", color: "#b45309", fontWeight: "700" }}>Damaged</label><input type="number" id="rvBoatsDmg" className="form-control" min="0" defaultValue="1" /></div>
                  <div><label style={{ fontSize: "10px", color: "#991b1b", fontWeight: "700" }}>Missing</label><input type="number" id="rvBoatsMiss" className="form-control" min="0" defaultValue="0" /></div>
                </div>
              </div>
              {/* Life Jackets */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#0369a1", display: "block", marginBottom: "4px" }}>
                  <i className="fas fa-vest"></i> 2. Life Jackets (SOLAS Standard)
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <div><label style={{ fontSize: "10px", color: "#166534", fontWeight: "700" }}>Good Condition *</label><input type="number" id="rvJacketsGood" className="form-control" min="0" defaultValue="31" required /></div>
                  <div><label style={{ fontSize: "10px", color: "#b45309", fontWeight: "700" }}>Damaged</label><input type="number" id="rvJacketsDmg" className="form-control" min="0" defaultValue="1" /></div>
                  <div><label style={{ fontSize: "10px", color: "#991b1b", fontWeight: "700" }}>Missing</label><input type="number" id="rvJacketsMiss" className="form-control" min="0" defaultValue="1" /></div>
                </div>
              </div>
              {/* Tents */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#0369a1", display: "block", marginBottom: "4px" }}>
                  <i className="fas fa-campground"></i> 3. Relief Tents & Stretchers
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <div><label style={{ fontSize: "10px", color: "#166534", fontWeight: "700" }}>Good Condition *</label><input type="number" id="rvTentsGood" className="form-control" min="0" defaultValue="11" required /></div>
                  <div><label style={{ fontSize: "10px", color: "#b45309", fontWeight: "700" }}>Damaged</label><input type="number" id="rvTentsDmg" className="form-control" min="0" defaultValue="1" /></div>
                  <div><label style={{ fontSize: "10px", color: "#991b1b", fontWeight: "700" }}>Missing</label><input type="number" id="rvTentsMiss" className="form-control" min="0" defaultValue="0" /></div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Officer Field Inspection Feedback & Damage Notes *</label>
              <textarea id="rvRemarks" className="form-control" rows="2" placeholder="e.g. 1 boat pontoon punctured during rescue near Ramnagar; cleaned and packed for Godown intake..." required></textarea>
            </div>
            <button type="submit" className="btn-go primary" style={{ width: "100%", justifyContent: "center", padding: "11px" }}>
              <i className="fas fa-paper-plane"></i>
              {" Submit Return Audit to Central Godown"}
            </button>
          </form>
        </div>
      </div>
      <div id="toast"></div>
      <div id="toast"></div>
  </>
);

export default function GroundOfficer() {
  useEffect(() => {
    const cleanup = setupRouteGuard('ground');
    document.title = "NEERAKSHAK – Ground Officer Portal | Field Operations & Delivery Verification";
    initGroundOfficerPage();
    return cleanup;
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
