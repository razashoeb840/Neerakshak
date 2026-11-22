import { useEffect } from 'react';
import css from './ground-officer.css?inline';
import initGroundOfficerPage from './ground-officer.legacy.js';

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
        {/* 70px VERTICAL ICON RAIL: MATCHED TO 2ADMIN.HTML & 3AUTHORITY.HTML */}
        <aside className="left-rail">
          <button className="rail-btn go-nav-btn active" data-tab="dashboard" onClick={(event) => window.switchGroundTab('dashboard', event.currentTarget)} title="Field Dashboard">
            <i className="fas fa-gauge-high"></i>
            {" "}
            <span>Dashboard</span>
          </button>
          {" "}
          <button className="rail-btn go-nav-btn" data-tab="assigned-areas" onClick={(event) => window.switchGroundTab('assigned-areas', event.currentTarget)} title="Assigned Locations">
            <i className="fas fa-map-pin"></i>
            {" "}
            <span>Assigned</span>
            {" "}
            <span className="rail-badge-count" id="navAreasCount">0</span>
          </button>
          {" "}
          <button className="rail-btn go-nav-btn" data-tab="delivery-verify" onClick={(event) => window.switchGroundTab('delivery-verify', event.currentTarget)} title="Physical Delivery Verification">
            <i className="fas fa-truck-ramp-box"></i>
            {" "}
            <span>Deliveries</span>
            {" "}
            <span className="rail-badge-count warn" id="navPendingDelivCount">0</span>
          </button>
          {" "}
          <button className="rail-btn go-nav-btn" data-tab="field-reports" onClick={(event) => window.switchGroundTab('field-reports', event.currentTarget)} title="File Village Field Report">
            <i className="fas fa-house-flood-water"></i>
            {" "}
            <span>Report SOS</span>
          </button>
          {" "}
          <button className="rail-btn go-nav-btn" data-tab="rescue-ops" onClick={(event) => window.switchGroundTab('rescue-ops', event.currentTarget)} title="Active Rescue Operations">
            <i className="fas fa-life-ring"></i>
            {" "}
            <span>Rescue Ops</span>
            {" "}
            <span className="rail-badge-count" id="navOpsCount">0</span>
          </button>
          {" "}
          <button className="rail-btn go-nav-btn" data-tab="return-verify" onClick={(event) => window.switchGroundTab('return-verify', event.currentTarget)} title="Verify Returned Resources">
            <i className="fas fa-rotate-left"></i>
            {" "}
            <span>Returns</span>
          </button>
          {" "}
          <button className="rail-btn go-nav-btn" data-tab="my-reports" onClick={(event) => window.switchGroundTab('my-reports', event.currentTarget)} title="My Submitted Reports Log">
            <i className="fas fa-file-signature"></i>
            {" "}
            <span>Filed Logs</span>
            {" "}
            <span className="rail-badge-count" id="navReportsCount">0</span>
          </button>
          {" "}
          <button className="rail-btn go-nav-btn" data-tab="notifications" onClick={(event) => window.switchGroundTab('notifications', event.currentTarget)} title={"Field Alerts & Directives"}>
            <i className="fas fa-bell"></i>
            {" "}
            <span>Alerts</span>
            {" "}
            <span className="rail-badge-count warn" id="navNotifCount">0</span>
          </button>
          {" "}
          <button className="rail-btn go-nav-btn" data-tab="profile" onClick={(event) => window.switchGroundTab('profile', event.currentTarget)} title={"Officer Profile & Settings"}>
            <i className="fas fa-user-gear"></i>
            {" "}
            <span>Settings</span>
          </button>
          {" "}
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
                 TAB 1: DASHBOARD (TASKS + DELIVERY VERIFICATION + FIELD OVERVIEW + RESCUE OPS)
                 =============================================================== */}
          <div className="go-tab-pane active" id="tab-dashboard">
            {/* MY ACTIVE TASKS & COMPACT ASSIGNED LOCATIONS MAP */}
            <div className="grid-2">
              {/* My Active Tasks */}
              <div className="aqua-card anim-card">
                <div className="card-head">
                  <h2>
                    <i className="fas fa-list-check" style={{ color: "var(--teal-field)" }}></i>
                    {" My Active Field Tasks & Deadlines"}
                  </h2>
                  <button className="btn-go primary" onClick={(event) => window.switchGroundTab('field-reports', document.querySelector('[data-tab=field-reports]'))}>+ Submit Field Report</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }} id="dashActiveTasksList"></div>
              </div>
              {/* Compact Assigned Locations Map (Orientation Only) */}
              <div className="aqua-card anim-card">
                <div className="card-head">
                  <h2>
                    <i className="fas fa-location-dot" style={{ color: "var(--river-blue)" }}></i>
                    {" Assigned Locations Orientation Map"}
                  </h2>
                  <button className="btn-go" onClick={(event) => window.switchGroundTab('assigned-areas', document.querySelector('[data-tab=assigned-areas]'))}>Area Details →</button>
                </div>
                <div className="compact-map-box">
                  <span className="map-pin-chip" style={{ top: "26px", left: "28px", borderColor: "#dc2626" }} onClick={(event) => window.switchGroundTab('assigned-areas', document.querySelector('[data-tab=assigned-areas]'))}>
                    <i className="fas fa-circle" style={{ color: "#dc2626", fontSize: "8px" }}></i>
                    {" Palashbari Ward 2 (Critical) "}
                  </span>
                  {" "}
                  <span className="map-pin-chip" style={{ top: "95px", right: "26px", borderColor: "#ea580c" }} onClick={(event) => window.switchGroundTab('assigned-areas', document.querySelector('[data-tab=assigned-areas]'))}>
                    <i className="fas fa-circle" style={{ color: "#ea580c", fontSize: "8px" }}></i>
                    {" Chaygaon Lowland (High) "}
                  </span>
                  {" "}
                  <span className="map-pin-chip" style={{ bottom: "24px", left: "95px", borderColor: "#d97706" }} onClick={(event) => window.switchGroundTab('assigned-areas', document.querySelector('[data-tab=assigned-areas]'))}>
                    <i className="fas fa-circle" style={{ color: "#d97706", fontSize: "8px" }}></i>
                    {" Goroimari Char (Moderate) "}
                  </span>
                </div>
              </div>
            </div>
            {/* DELIVERY VERIFICATION CARDS (Linked to Godown Dispatches) */}
            <div className="aqua-card anim-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-truck-ramp-box" style={{ color: "var(--river-blue)" }}></i>
                  {" Delivery Verification Queue (Godown Dispatched Consignments)"}
                </h2>
                <button className="btn-go" onClick={(event) => window.switchGroundTab('delivery-verify', document.querySelector('[data-tab=delivery-verify]'))}>Full Verification Desk →</button>
              </div>
              <div className="grid-2 switchable-collection" id="dashDeliveryCards"></div>
            </div>
            {/* FIELD SITUATION & RESCUE OPERATIONS OVERVIEW */}
            <div className="grid-2">
              <div className="aqua-card anim-card">
                <div className="card-head">
                  <h2>
                    <i className="fas fa-house-flood-water" style={{ color: "#dc2626" }}></i>
                    {" Latest Field Situation Observations"}
                  </h2>
                </div>
                <div className="grid-2 switchable-collection" id="dashFieldSitCards"></div>
              </div>
              <div className="aqua-card anim-card">
                <div className="card-head">
                  <h2>
                    <i className="fas fa-life-ring" style={{ color: "var(--foliage-mid)" }}></i>
                    {" Assigned Rescue Operations Progress"}
                  </h2>
                </div>
                <div className="grid-2 switchable-collection" id="dashRescueOpsCards"></div>
              </div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 2: MY ASSIGNED AREAS (READ-ONLY ASSIGNMENT SCOPE)
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-assigned-areas">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-map-pin" style={{ color: "var(--teal-field)" }}></i>
                  {" My Assigned Flood-Affected Areas & Navigation Coordinates"}
                </h2>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>Assigned by District Authority / Admin (Read-Only Scope)</span>
              </div>
              <div className="grid-3 switchable-collection" id="assignedAreasGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 3: DELIVERY VERIFICATION (AUTO SHORTAGE CALCULATION)
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-delivery-verify">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-truck-ramp-box" style={{ color: "var(--river-blue)" }}></i>
                  {" Physical Delivery Verification & Discrepancy Reporting"}
                </h2>
              </div>
              <div style={{ background: "#eef6fd", borderLeft: "3.5px solid var(--river-blue)", padding: "8px 12px", borderRadius: "8px", fontSize: "11.5px", color: "var(--navy-deep)", marginBottom: "12px" }}>
                <strong>Automated Shortage Audit:</strong>
                {" Enter actual received and damaged quantities. Any difference against Godown Dispatched Qty automatically flags a discrepancy report for the Monitoring Officer. "}
              </div>
              <div className="grid-2 switchable-collection" id="fullDeliveryVerifyGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 4: FIELD SITUATION REPORTS (GPS + IMMUTABLE SUBMISSION)
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-field-reports">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-house-flood-water" style={{ color: "var(--teal-field)" }}></i>
                  {" Submit Ground Flood Situation Report"}
                </h2>
              </div>
              <form onSubmit={(event) => window.submitFieldSituationReport(event)}>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Assigned Village / Location *</label>
                    {" "}
                    <select id="frVillageSel" className="form-control"></select>
                  </div>
                  <div className="form-group">
                    <label>Observed Flood Severity *</label>
                    {" "}
                    <select id="frSeveritySel" className="form-control">
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Water Level / Depth Observation *</label>
                    {" "}
                    <input type="text" id="frWaterLevel" className="form-control" placeholder="e.g. 4.2 ft in residential ward" required />
                  </div>
                </div>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Affected Households / Population *</label>
                    {" "}
                    <input type="text" id="frAffectedPop" className="form-control" placeholder="e.g. 320 households (~1,450 people)" required />
                  </div>
                  <div className="form-group">
                    <label>Stranded People Count *</label>
                    {" "}
                    <input type="number" id="frStrandedCount" className="form-control" min="0" defaultValue="45" required />
                  </div>
                  <div className="form-group">
                    <label>Road / Access Condition *</label>
                    {" "}
                    <select id="frRoadCond" className="form-control">
                      <option value="Blocked / Submerged (Boat Only)">Blocked / Submerged (Boat Only)</option>
                      <option value="Partially Accessible (Heavy Vehicles)">Partially Accessible (Heavy Vehicles)</option>
                      <option value="Accessible">Accessible</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Urgent Relief Needs (Food/Water/Med) *</label>
                    {" "}
                    <input type="text" id="frUrgentNeeds" className="form-control" placeholder={"e.g. 300 food packets, ORS & drinking water"} required />
                  </div>
                  <div className="form-group">
                    <label>GPS Coordinates (Auto-Captured) *</label>
                    {" "}
                    <input type="text" id="frGpsCoords" className="form-control" defaultValue="26.1320° N, 91.5150° E" required />
                  </div>
                  <div className="form-group">
                    <label>Field Photo Evidence Reference</label>
                    {" "}
                    <input type="file" id="frPhotoInput" className="form-control" accept="image/*" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Ground Officer Field Remarks *</label>
                  {" "}
                  <textarea id="frRemarks" className="form-control" rows="2" placeholder="Describe ground conditions, embankment status, or medical cases..." required />
                </div>
                <button type="submit" className="btn-go primary" style={{ padding: "10px 18px", fontSize: "12.5px" }}>
                  <i className="fas fa-paper-plane"></i>
                  {" Submit Immutable Field Report (With Timestamp & Officer ID) "}
                </button>
              </form>
            </div>
          </div>
          {/* ===============================================================
                 TAB 5: RESCUE OPERATIONS (PROGRESS REPORTING ONLY)
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-rescue-ops">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-life-ring" style={{ color: "var(--foliage-mid)" }}></i>
                  {" Assigned Rescue Operations – Progress & Evacuation Reporting"}
                </h2>
              </div>
              <div style={{ background: "#f0fdf4", borderLeft: "3.5px solid #16a34a", padding: "8px 12px", borderRadius: "8px", fontSize: "11.5px", color: "#14532d", marginBottom: "12px" }}>
                <strong>Command Boundary:</strong>
                {" NDRF & SDRF teams operate under their independent official command structures. Ground Officer reports rescued counts, remaining stranded citizens, and field assistance needs. "}
              </div>
              <div className="grid-2 switchable-collection" id="fullRescueOpsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 6: RETURN VERIFICATION (POST-OPERATION EQUIPMENT AUDIT)
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-return-verify">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-rotate-left" style={{ color: "var(--teal-field)" }}></i>
                  {" Post-Operation Physical Return Verification"}
                </h2>
                <button className="btn-go primary" onClick={(event) => window.openReturnVerifyModal()}>
                  <i className="fas fa-plus"></i>
                  {" Verify Returned Equipment"}
                </button>
              </div>
              <div className="grid-3 switchable-collection" id="returnVerifyGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 7: MY REPORTS (UNIQUE REF ID, STATUS & CORRECTION REQUESTS)
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-my-reports">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-file-signature" style={{ color: "var(--navy-deep)" }}></i>
                  {" My Submitted Reports & Verification Audit Ledger"}
                </h2>
                <select id="reportStatusFilter" className="form-control" style={{ padding: "4px 10px", fontSize: "11.5px", width: "auto" }} onChange={(event) => window.renderAllGroundViews()}>
                  <option value="ALL">All Reports</option>
                  <option value="Approved / Reviewed">Approved / Reviewed</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Correction Requested">Correction Requested</option>
                </select>
              </div>
              <div className="grid-2 switchable-collection" id="myReportsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 8: NOTIFICATIONS
                 =============================================================== */}
          <div className="go-tab-pane" id="tab-notifications">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-bell" style={{ color: "#dc2626" }}></i>
                  {" Field Assignments, Delivery Alerts & Authority Instructions"}
                </h2>
              </div>
              <div className="grid-2 switchable-collection" id="notificationsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 9: PROFILE & SETTINGS
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
                    <span>
                      {"Officer Name: "}
                      <strong>R. K. Kalita (Field Officer)</strong>
                    </span>
                    {" "}
                    <span>
                      {"Officer ID: "}
                      <strong>GO-KAM-04</strong>
                    </span>
                    {" "}
                    <span>
                      {"Assigned District: "}
                      <strong>Kamrup (Palashbari / Chaygaon)</strong>
                    </span>
                    {" "}
                    <span>
                      {"Contact: "}
                      <strong>+91-98640-XXXXX</strong>
                    </span>
                  </div>
                </div>
                <div className="sub-card tone-good">
                  <h4>{"Audit & Submission Integrity"}</h4>
                  <p style={{ margin: "0", fontSize: "11.5px", color: "var(--text-body)" }}>
                    {" Every delivery verification and field report is permanently stamped with Officer ID "}
                    <strong>GO-KAM-04</strong>
                    {", GPS coordinates, and timestamp. Submitted reports cannot be altered directly; revisions require a formal correction entry. "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* RIPARIAN PANORAMIC FOOTER (MATCHED TO 2ADMIN, 3AUTHORITY & 1INDEX) */}
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
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>
              <i className="fas fa-truck-ramp-box" style={{ color: "var(--teal-field)" }}></i>
              {" Physical Delivery Verification"}
            </h3>
            <button onClick={(event) => window.closeModal('verifyDeliveryModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitDeliveryVerification(event)}>
            <input type="hidden" id="verDelivIdx" />
            <div id="verDelivHeader" style={{ background: "#f0f9ff", padding: "9px 11px", borderRadius: "8px", fontSize: "12px", marginBottom: "10px" }}></div>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Dispatched Qty</label>
                {" "}
                <input type="number" id="verDispQty" className="form-control" readOnly style={{ background: "#f1f5f9" }} />
              </div>
              <div className="form-group">
                <label>Actual Received Qty *</label>
                {" "}
                <input type="number" id="verRecvQty" className="form-control" min="0" onInput={(event) => window.previewShortageCalc()} required />
              </div>
              <div className="form-group">
                <label>Damaged Items Qty</label>
                {" "}
                <input type="number" id="verDmgQty" className="form-control" min="0" defaultValue="0" onInput={(event) => window.previewShortageCalc()} required />
              </div>
            </div>
            <div id="shortagePreviewBox" style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "8px 10px", fontSize: "11.5px", color: "#14532d", marginBottom: "10px" }}>
              {" Calculated Shortage: "}
              <strong>0 Units</strong>
              {" (Exact Match) "}
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Delivery Photo Evidence</label>
                {" "}
                <input type="file" className="form-control" accept="image/*" />
              </div>
              <div className="form-group">
                <label>Verification Remarks *</label>
                {" "}
                <input type="text" id="verRemarks" className="form-control" placeholder="e.g. Counted at relief camp gate" required />
              </div>
            </div>
            <button type="submit" className="btn-go primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "12.5px" }}>
              <i className="fas fa-check-circle"></i>
              {" Submit Physical Delivery Verification "}
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
                {" "}
                <input type="number" id="opRescuedInput" className="form-control" min="0" required />
              </div>
              <div className="form-group">
                <label>Remaining Stranded *</label>
                {" "}
                <input type="number" id="opStrandedInput" className="form-control" min="0" required />
              </div>
              <div className="form-group">
                <label>Operation Status *</label>
                {" "}
                <select id="opStatusSel" className="form-control">
                  <option value="In Progress">In Progress</option>
                  <option value="Additional Boats Needed">Additional Boats Needed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Field Assistance / Delay Remarks *</label>
              {" "}
              <input type="text" id="opNotesInput" className="form-control" placeholder="e.g. Strong river current; 2 extra boats requested" required />
            </div>
            <button type="submit" className="btn-go primary" style={{ width: "100%", justifyContent: "center", padding: "10px" }}>Submit Rescue Progress Report</button>
          </form>
        </div>
      </div>
      {/* 3. Return Verification Modal */}
      <div className="modal-overlay" id="returnVerifyModal" onClick={(event) => window.closeModal('returnVerifyModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>Verify Post-Operation Returned Resources</h3>
            <button onClick={(event) => window.closeModal('returnVerifyModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitReturnVerification(event)}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Resource Item *</label>
                {" "}
                <input type="text" id="rvItemName" className="form-control" placeholder="e.g. Inflatable Rescue Boats" required />
              </div>
              <div className="form-group">
                <label>Operation / Location *</label>
                {" "}
                <input type="text" id="rvLocation" className="form-control" placeholder="e.g. Palashbari Ward 2" required />
              </div>
            </div>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Good Condition Qty</label>
                {" "}
                <input type="number" id="rvGoodQty" className="form-control" min="0" defaultValue="8" required />
              </div>
              <div className="form-group">
                <label>Damaged Qty</label>
                {" "}
                <input type="number" id="rvDmgQty" className="form-control" min="0" defaultValue="1" required />
              </div>
              <div className="form-group">
                <label>Missing Qty</label>
                {" "}
                <input type="number" id="rvMissQty" className="form-control" min="0" defaultValue="1" required />
              </div>
            </div>
            <div className="form-group">
              <label>Damage / Return Remarks *</label>
              {" "}
              <input type="text" id="rvRemarks" className="form-control" placeholder="e.g. 1 boat pontoon punctured; sent to Godown for repair" required />
            </div>
            <button type="submit" className="btn-go primary" style={{ width: "100%", justifyContent: "center", padding: "10px" }}>Submit Return Verification to Godown</button>
          </form>
        </div>
      </div>
      <div id="toast"></div>
  </>
);

export default function GroundOfficer() {
  useEffect(() => {
    document.title = "NEERAKSHAK – Ground Officer Portal | Field Operations & Delivery Verification";
    initGroundOfficerPage();
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
