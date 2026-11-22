import { useEffect } from 'react';
import css from './authority.css?inline';
import initAuthorityPage from './authority.legacy.js';

// Static markup, created once so React never re-renders over what the page script builds.
const markup = (
  <>
      {/* SPACIOUS HIGH-DEFINITION COMMAND HERO BANNER (MATCHED TO 2ADMIN & IMAGE 2) */}
      <header className="authority-hero-banner anim-card">
        {/* 1. High-definition panoramic photo on the right */}
        <div className="auth-banner-img-wrap">
          <img src="/authority_banner.jpg" alt="District Disaster Management Authority Flood Assessment" className="auth-banner-img" />
        </div>
        {/* 2. Curved Wave Swooshes merging left crisp panel into right photo (Image 2 Alignment) */}
        {" "}
        <svg className="auth-banner-swoosh-svg" viewBox="0 0 1200 210" preserveAspectRatio="none">
          <defs>
            <linearGradient id="authLeftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff"></stop>
              <stop offset="68%" stopColor="#f2f9ff"></stop>
              <stop offset="92%" stopColor="#e0f2fe"></stop>
              <stop offset="100%" stopColor="#d6edfc"></stop>
            </linearGradient>
          </defs>
          {/* Left solid backdrop filling from x=0 to curved boundary */}
          <path d="M0,0 L570,0 C520,55 460,120 390,210 L0,210 Z" fill="url(#authLeftGrad)"></path>
          {/* Blue Outer Wave Accent */}
          <path d="M570,0 C520,55 460,120 390,210" stroke="#0ea5e9" strokeWidth="8" fill="none" opacity="0.95"></path>
          {/* Cyan Highlight Accent */}
          <path d="M580,0 C530,55 470,120 400,210" stroke="#38bdf8" strokeWidth="3" fill="none" opacity="0.8"></path>
          {/* Green Fresh Accent matching India tricolour & Assam foliage */}
          <path d="M560,0 C510,55 450,120 380,210" stroke="#22c55e" strokeWidth="5.5" fill="none" opacity="0.95"></path>
        </svg>
        {" "}
        {/* 3. Authority Banner Inner Content */}
        <div className="auth-hero-inner">
          {/* Top Row: Brand Lockup & HUD Action Controls (Matching 2admin.html) */}
          <div className="auth-banner-top-row">
            <div className="hero-brand-lockup">
              <div className="hero-vertical-pillar"></div>
              <div className="hero-brand-content">
                <div className="hero-brand-title-wrap">
                  <h1 className="hero-brand-title">
                    NEERA
                    <span className="hero-brand-cyan">KSHAK</span>
                  </h1>
                  <span className="hero-admin-badge" style={{ background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)" }}>Authority</span>
                </div>
              </div>
            </div>
            {/* HUD Action Controls (Matching 2admin.html) */}
            <div className="hero-action-controls">
              <div className="hero-ctrl-pill">
                <i className="fas fa-location-dot" style={{ color: "#38bdf8" }}></i>
                {" "}
                <select className="hero-district-select" onChange={(event) => window.showToast('Switched district command to ' + event.currentTarget.value)}>
                  <option>Kamrup District, Assam</option>
                  <option>Majuli District, Assam</option>
                  <option>Barpeta District, Assam</option>
                </select>
              </div>
              <div className="hero-ctrl-pill">
                <span className="hero-live-dot"></span>
                {" "}
                <span id="telemetryStatusText">Command Active</span>
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
          {/* Main Banner Headline & Eyebrow Pill (Exact Image 2 Alignment) */}
          <div className="auth-banner-main-content">
            <div className="auth-banner-text-block">
              <span className="auth-eyebrow-pill">
                <i className="fas fa-location-dot" style={{ color: "#0284c7" }}></i>
                {" DISTRICT DISASTER MANAGEMENT AUTHORITY "}
              </span>
              <h2 className="auth-banner-headline">{"Map-Led Flood Assessment, Approvals & Godown Coordination"}</h2>
              <p className="auth-banner-description">
                {"Inspect critical flood-affected villages, determine required boats, food packets, medicines & life jackets, approve requests, and route allocations to the Godown Manager."}
              </p>
            </div>
          </div>
        </div>
      </header>
      {/* 3. MAIN WORKSPACE (UPGRADED SIDEBAR | CENTER | RIGHT ACTION PANEL) */}
      <div className="workspace-shell">
        {/* UPGRADED AUTHORITY SIDEBAR */}
        {" "}
        {/* LEFT VERTICAL ICON RAIL: MATCHED TO 2ADMIN.HTML (70px, EXTENDED HEIGHT & FLUSH ALIGNMENT) */}
        <aside className="left-rail">
          <button className="rail-btn auth-nav-btn active" data-tab="dashboard" onClick={(event) => window.switchAuthTab('dashboard', event.currentTarget)} title="DDMA Authority Dashboard">
            <i className="fas fa-gauge-high"></i>
            {" "}
            <span>Dashboard</span>
          </button>
          {" "}
          <button className="rail-btn auth-nav-btn" data-tab="map-critical" onClick={(event) => window.switchAuthTab('map-critical', event.currentTarget)} title={"Flood Map & Critical Villages"}>
            <i className="fas fa-map-location-dot"></i>
            {" "}
            <span>Flood Map</span>
            {" "}
            <span className="rail-badge-count" id="navCriticalBadge">0</span>
          </button>
          {" "}
          <button className="rail-btn auth-nav-btn" data-tab="area-details" onClick={(event) => window.switchAuthTab('area-details', event.currentTarget)} title={"Area Details & Resource Assessment"}>
            <i className="fas fa-house-flood-water"></i>
            {" "}
            <span>Assess</span>
          </button>
          {" "}
          <button className="rail-btn auth-nav-btn" data-tab="requests" onClick={(event) => window.switchAuthTab('requests', event.currentTarget)} title="Incoming Field Resource Requests">
            <i className="fas fa-inbox"></i>
            {" "}
            <span>Requests</span>
            {" "}
            <span className="rail-badge-count" id="navReqBadge">0</span>
          </button>
          {" "}
          <button className="rail-btn auth-nav-btn" data-tab="approval" onClick={(event) => window.switchAuthTab('approval', event.currentTarget)} title="Request Approval Desk">
            <i className="fas fa-clipboard-check"></i>
            {" "}
            <span>Approve</span>
          </button>
          {" "}
          <button className="rail-btn auth-nav-btn" data-tab="allocation" onClick={(event) => window.switchAuthTab('allocation', event.currentTarget)} title="Resource Allocation to Godown">
            <i className="fas fa-boxes-packing"></i>
            {" "}
            <span>Allocate</span>
          </button>
          {" "}
          <button className="rail-btn auth-nav-btn" data-tab="tracking" onClick={(event) => window.switchAuthTab('tracking', event.currentTarget)} title="Godown Delivery Tracking">
            <i className="fas fa-truck-fast"></i>
            {" "}
            <span>Tracking</span>
            {" "}
            <span className="rail-badge-count" id="navTrackBadge">0</span>
          </button>
          {" "}
          <button className="rail-btn auth-nav-btn" data-tab="ndrf-coord" onClick={(event) => window.switchAuthTab('ndrf-coord', event.currentTarget)} title={"NDRF & SDRF Coordination"}>
            <i className="fas fa-life-ring"></i>
            {" "}
            <span>NDRF/SDRF</span>
          </button>
          {" "}
          <button className="rail-btn auth-nav-btn" data-tab="operations" onClick={(event) => window.switchAuthTab('operations', event.currentTarget)} title="Active Rescue Operations">
            <i className="fas fa-person-military-pointing"></i>
            {" "}
            <span>Ops Mgmt</span>
          </button>
          {" "}
          <button className="rail-btn auth-nav-btn" data-tab="reports-logs" onClick={(event) => window.switchAuthTab('reports-logs', event.currentTarget)} title={"DDMA Reports & Audit Logs"}>
            <i className="fas fa-file-contract"></i>
            {" "}
            <span>Logs</span>
          </button>
          {" "}
          {/* Bottom Tools & Telemetry Sync Anchor (Matching 2admin.html) */}
          <div className="rail-bottom-cluster">
            <div className="rail-divider"></div>
            <button className="rail-btn" onClick={(event) => { window.renderAllAuthorityViews(); window.showToast('Telemetry & allocation sync refreshed'); }} title="Sync All Records">
              <i className="fas fa-arrows-rotate"></i>
              {" "}
              <span>Sync</span>
            </button>
            <button className="rail-btn rail-btn-logout" onClick={() => { try{sessionStorage.clear(); sessionStorage.setItem('neerakshak_logged_out', '1');}catch(e){} window.location.href = '/login?logout=1'; }} title="Sign out of district session" style={{ color: "#f87171" }}>
              <i className="fas fa-right-from-bracket"></i>
              {" "}
              <span>Logout</span>
            </button>
            <div className="rail-pulse-wrap" title="DDMA Socket Online">
              <span className="rail-online-dot"></span>
              {" "}
              <span className="rail-online-text">SYS OK</span>
            </div>
          </div>
        </aside>
        {/* CENTER STAGE */}
        <main className="center-stage">
          {/* 4-KPI DISTRICT OVERVIEW STRIP */}
          <div className="kpi-grid-4 anim-card" id="authorityKpiGrid"></div>
          {/* ===============================================================
                 SECTION 1: DASHBOARD (EMPTY MAP SLOT + CRITICAL VILLAGES)
                 =============================================================== */}
          <div className="tab-view-pane active" id="tab-dashboard">
            {/* Same-Size Empty Map Viewport Div (310px height - Ready for Your Map Later) */}
            <div className="aqua-card anim-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-map-location-dot" style={{ color: "var(--river-blue)" }}></i>
                  {" District Flood Map Viewport – Inspect Critical Areas"}
                </h2>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button className="btn-card-action" onClick={(event) => window.showToast('Map layer hook: All Zones')}>All Zones</button>
                  {" "}
                  <button className="btn-card-action" style={{ color: "#b91c1c" }} onClick={(event) => window.showToast('Map layer hook: Critical Only')}>Critical Only</button>
                  {" "}
                  <button className="btn-card-action" style={{ color: "#c2410c" }} onClick={(event) => window.showToast('Map layer hook: High Only')}>High Only</button>
                </div>
              </div>
              <div id="authorityMapSlot">
                <div className="map-float-search">
                  <i className="fas fa-search" style={{ color: "#64748b" }}></i>
                  {" "}
                  <input type="text" placeholder="Search village, river basin..." onKeyUp={(event) => { if(event.key==='Enter') window.showToast('Map search hook ready for: ' + event.currentTarget.value); }} />
                </div>
                <div className="map-slot-center-info">
                  <i className="far fa-map"></i>
                  {" "}
                  <strong>DISTRICT FLOOD MAP VIEWPORT</strong>
                  {" "}
                  <span>
                    GIS Map Container (
                    <code>#authorityMapSlot</code>
                    ) — Mount your interactive map here later to click villages and allocate resources.
                  </span>
                </div>
                <div className="map-legend-overlay">
                  <span>
                    <i className="l-dot" style={{ background: "#dc2626" }}></i>
                    Critical
                  </span>
                  {" "}
                  <span>
                    <i className="l-dot" style={{ background: "#ea580c" }}></i>
                    High
                  </span>
                  {" "}
                  <span>
                    <i className="l-dot" style={{ background: "#eab308" }}></i>
                    Moderate
                  </span>
                  {" "}
                  <span>
                    <i className="l-dot" style={{ background: "#16a34a" }}></i>
                    Normal
                  </span>
                </div>
                <div className="map-zoom-controls">
                  <button className="map-z-btn" onClick={(event) => window.showToast('Map Zoom In hook')} title="Zoom In">+</button>
                  {" "}
                  <button className="map-z-btn" onClick={(event) => window.showToast('Map Zoom Out hook')} title="Zoom Out">−</button>
                  {" "}
                  <button className="map-z-btn" onClick={(event) => window.showToast('Recenter District Map hook')} title="Recenter">
                    <i className="fas fa-crosshairs"></i>
                  </button>
                </div>
              </div>
            </div>
            {/* Critical Affected Villages Grid */}
            <div className="aqua-card anim-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-triangle-exclamation" style={{ color: "#dc2626" }}></i>
                  {" Critical & High Affected Villages (Click to Open Area Details)"}
                </h2>
                <button className="btn-card-action" onClick={(event) => window.switchAuthTab('map-critical', document.querySelector('[data-tab=map-critical]'))}>Full Area Matrix →</button>
              </div>
              <div className="cards-grid-2" id="dashCriticalVillagesGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 SECTION 2: FLOOD MAP & CRITICAL AREAS
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-map-critical">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-map-marked-alt" style={{ color: "var(--river-blue)" }}></i>
                  {" Flood Map & Critical Village Identification"}
                </h2>
                <select id="mapSevSelect" className="form-control" style={{ padding: "4px 10px", fontSize: "11.5px", width: "auto" }} onChange={(event) => window.renderAllAuthorityViews()}>
                  <option value="ALL">All Severity Zones</option>
                  <option value="Critical">Critical Zones</option>
                  <option value="High">High Risk Zones</option>
                  <option value="Moderate">Moderate Zones</option>
                </select>
              </div>
              <div className="cards-grid-2" id="fullCriticalAreasGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 SECTION 3: AREA DETAILS & RESOURCE ASSESSMENT CALCULATOR
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-area-details">
            <div className="aqua-card" id="areaDetailsPanel"></div>
          </div>
          {/* ===============================================================
                 SECTION 4: RESOURCE REQUESTS
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-requests">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-inbox" style={{ color: "var(--river-blue)" }}></i>
                  {" Incoming Field & Relief Camp Resource Requests"}
                </h2>
                <button className="btn-card-action" onClick={(event) => window.switchAuthTab('approval', document.querySelector('[data-tab=approval]'))}>Open Approval Queue →</button>
              </div>
              <div className="cards-grid-2" id="allRequestsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 SECTION 5: REQUEST APPROVAL (APPROVE OR REJECT WITH REASON)
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-approval">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-clipboard-check" style={{ color: "var(--foliage-mid)" }}></i>
                  {" Request Approval Desk (Approve or Reject with Official Reason)"}
                </h2>
              </div>
              <div className="cards-grid-2" id="approvalDeskGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 SECTION 6: RESOURCE ALLOCATION & GODOWN COORDINATION
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-allocation">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-boxes-packing" style={{ color: "var(--river-blue)" }}></i>
                  {" Direct Resource Allocation & Godown Manager Dispatch Directive"}
                </h2>
                <button className="btn-card-action approve" onClick={(event) => window.openDirectAllocModal()}>
                  <i className="fas fa-plus"></i>
                  {" Allocate to Village"}
                </button>
              </div>
              <div style={{ background: "#eef6fd", borderLeft: "3.5px solid var(--river-blue)", padding: "8px 12px", borderRadius: "8px", fontSize: "11.5px", color: "var(--navy-deep)", marginBottom: "12px" }}>
                <strong>Godown Coordination Protocol:</strong>
                {" Approved allocations are automatically transmitted to the "}
                <strong>Godown Manager Portal</strong>
                {" for physical stock verification, packing, and vehicle dispatch. "}
              </div>
              <div className="cards-grid-2" id="allocatedVillagesGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 SECTION 7: ALLOCATION TRACKING (DISPATCH & DELIVERY MONITOR)
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-tracking">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-truck-fast" style={{ color: "var(--river-blue)" }}></i>
                  {" Allocation, Godown Dispatch & Ground Delivery Tracking"}
                </h2>
              </div>
              <div className="cards-grid-2" id="trackingGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 SECTION 8: NDRF / SDRF COORDINATION
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-ndrf-coord">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-life-ring" style={{ color: "var(--river-blue)" }}></i>
                  {" NDRF / SDRF Official Channel Coordination Records"}
                </h2>
                <button className="btn-card-action" onClick={(event) => window.openCoordModal()}>
                  <i className="fas fa-plus"></i>
                  {" Log Official Coordination"}
                </button>
              </div>
              <div className="cards-grid-2" id="coordRecordsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 SECTION 9: OPERATION MANAGEMENT
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-operations">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-person-military-pointing" style={{ color: "var(--foliage-mid)" }}></i>
                  {" Ongoing & Completed District Rescue Operations"}
                </h2>
                <button className="btn-card-action" onClick={(event) => window.openOperationModal()}>
                  <i className="fas fa-plus"></i>
                  {" Record Operation Update"}
                </button>
              </div>
              <div className="cards-grid-2" id="operationsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 SECTION 10: REPORTS & ACTIVITY LOGS
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-reports-logs">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-chart-pie" style={{ color: "var(--river-blue)" }}></i>
                  {" District Resource Allocation & Operations Reports"}
                </h2>
                <button className="btn-card-action approve" onClick={(event) => window.showToast('District Authority Report generated and downloaded.')}>
                  <i className="fas fa-download"></i>
                  {" Export Report"}
                </button>
              </div>
              <div className="cards-grid-3" id="reportSummaryCards"></div>
            </div>
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-clock-rotate-left" style={{ color: "var(--navy-deep)" }}></i>
                  {" Authority Decision & Audit Activity Logs"}
                </h2>
              </div>
              <div className="cards-grid-2" id="auditLogsGrid"></div>
            </div>
          </div>
        </main>
        {/* 4. RIGHT PANEL (QUICK ACTIONS + SELECTED VILLAGE INSPECTOR + GODOWN SYNC) */}
        <aside className="right-panel">
          {/* Quick Actions */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-bolt" style={{ color: "#f59e0b" }}></i>
                {" Authority Quick Actions"}
              </h2>
            </div>
            <div className="qa-grid-2x2">
              <button className="qa-color-card qa-blue" onClick={(event) => window.openDirectAllocModal()}>
                <i className="fas fa-boxes-packing"></i>
                {" "}
                <strong>Allocate Supplies</strong>
                {" "}
                <span>{"Assign boats, food & kits"}</span>
              </button>
              {" "}
              <button className="qa-color-card qa-green" onClick={(event) => window.switchAuthTab('approval', document.querySelector('[data-tab=approval]'))}>
                <i className="fas fa-clipboard-check"></i>
                {" "}
                <strong>Approve Requests</strong>
                {" "}
                <span>{"Review & send to Godown"}</span>
              </button>
              {" "}
              <button className="qa-color-card qa-amber" onClick={(event) => window.openCoordModal()}>
                <i className="fas fa-life-ring"></i>
                {" "}
                <strong>NDRF / SDRF Log</strong>
                {" "}
                <span>Official channel update</span>
              </button>
              {" "}
              <button className="qa-color-card qa-indigo" onClick={(event) => window.switchAuthTab('reports-logs', document.querySelector('[data-tab=reports-logs]'))}>
                <i className="fas fa-file-contract"></i>
                {" "}
                <strong>{"Reports & Logs"}</strong>
                {" "}
                <span>District audit summary</span>
              </button>
            </div>
          </div>
          {/* Selected Map Village Inspector */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-location-crosshairs" style={{ color: "#dc2626" }}></i>
                {" Selected Village"}
              </h2>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--river-blue)", cursor: "pointer" }} onClick={(event) => window.switchAuthTab('area-details', document.querySelector('[data-tab=area-details]'))}>Assess →</span>
            </div>
            <div id="rightSelectedVillageBox"></div>
          </div>
          {/* Godown Coordination & Dispatch Status */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-warehouse" style={{ color: "var(--foliage-mid)" }}></i>
                {" Godown Dispatch Sync"}
              </h2>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--river-blue)", cursor: "pointer" }} onClick={(event) => window.switchAuthTab('tracking', document.querySelector('[data-tab=tracking]'))}>Track →</span>
            </div>
            <div className="right-mini-grid" id="rightGodownSyncBox"></div>
          </div>
        </aside>
      </div>
      {/* RIPARIAN PANORAMIC FOOTER (MATCHED TO 2ADMIN & 1INDEX) */}
      <div className="riparian-footer-wrap">
        <div className="footer-scenic-banner">
          <img src="/footer.jpg" alt="Misty Brahmaputra River Basin Landscape" className="footer-scenic-img" />
          <div className="footer-scenic-blend"></div>
        </div>
        <div className="riparian-footer-bar">
          <div className="footer-flex">
            <span>
              <strong>NEERAKSHAK Authority Portal</strong>
              {" • District Disaster Management Authority (DDMA) & Godown Logistics Coordination"}
            </span>
            {" "}
            <span>Government of Assam • Kamrup District Command Desk</span>
          </div>
        </div>
      </div>
      {/* =====================================================================
         MODALS FOR APPROVAL, ALLOCATION, NDRF COORDINATION & OPERATIONS
         ===================================================================== */}
      <div className="modal-overlay" id="decisionModal" onClick={(event) => window.closeModal('decisionModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 id="decModalHeading" style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>Review Resource Request</h3>
            <button onClick={(event) => window.closeModal('decisionModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.confirmRequestDecision(event)}>
            <input type="hidden" id="decReqIdx" />
            {" "}
            <input type="hidden" id="decType" />
            <div id="decSummaryBox" style={{ background: "#f0f7fe", padding: "10px", borderRadius: "8px", fontSize: "12px", marginBottom: "10px" }}></div>
            <div className="form-group">
              <label id="decReasonLbl">Official Approval Note / Rejection Reason *</label>
              {" "}
              <textarea id="decReasonTxt" className="form-control" rows="3" required />
            </div>
            <button type="submit" id="decSubmitBtn" className="btn-save-primary">Submit Decision</button>
          </form>
        </div>
      </div>
      <div className="modal-overlay" id="directAllocModal" onClick={(event) => window.closeModal('directAllocModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>{"Allocate Resources & Notify Godown Manager"}</h3>
            <button onClick={(event) => window.closeModal('directAllocModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitDirectAllocation(event)}>
            <div className="form-group">
              <label>Select Affected Village *</label>
              {" "}
              <select id="allocVillageSel" className="form-control"></select>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Rescue Boats</label>
                {" "}
                <input type="number" id="allocBoats" className="form-control" min="0" defaultValue="3" required />
              </div>
              <div className="form-group">
                <label>Life Jackets</label>
                {" "}
                <input type="number" id="allocJackets" className="form-control" min="0" defaultValue="45" required />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Food Packets</label>
                {" "}
                <input type="number" id="allocFood" className="form-control" min="0" defaultValue="400" required />
              </div>
              <div className="form-group">
                <label>Medicine Kits</label>
                {" "}
                <input type="number" id="allocMeds" className="form-control" min="0" defaultValue="60" required />
              </div>
            </div>
            <button type="submit" className="btn-save-primary">
              <i className="fas fa-paper-plane"></i>
              {" Approve & Send to Godown Manager"}
            </button>
          </form>
        </div>
      </div>
      <div className="modal-overlay" id="coordModal" onClick={(event) => window.closeModal('coordModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>Record NDRF / SDRF Official Coordination</h3>
            <button onClick={(event) => window.closeModal('coordModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitCoordRecord(event)}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Response Force *</label>
                {" "}
                <select id="coordAgency" className="form-control">
                  <option value="NDRF (1st Bn)">NDRF (1st Bn)</option>
                  <option value="SDRF District Unit">SDRF District Unit</option>
                  <option value={"River Police & Civil Defence"}>{"River Police & Civil Defence"}</option>
                </select>
              </div>
              <div className="form-group">
                <label>Affected Sector *</label>
                {" "}
                <input type="text" id="coordSector" className="form-control" placeholder="e.g. Palashbari Ward 2" required />
              </div>
            </div>
            <div className="form-group">
              <label>{"Official Channel & Status Update *"}</label>
              {" "}
              <input type="text" id="coordUpdate" className="form-control" placeholder="e.g. Coordinated via DEOC Hotline; 2 boat teams active" required />
            </div>
            <button type="submit" className="btn-save-primary">Save Official Coordination Record</button>
          </form>
        </div>
      </div>
      <div className="modal-overlay" id="opModal" onClick={(event) => window.closeModal('opModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>Log District Rescue / Relief Operation</h3>
            <button onClick={(event) => window.closeModal('opModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitOperationRecord(event)}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Operation Title *</label>
                {" "}
                <input type="text" id="opTitle" className="form-control" placeholder="e.g. Ward 2 Riverbank Evacuation" required />
              </div>
              <div className="form-group">
                <label>Operation Status *</label>
                {" "}
                <select id="opStatus" className="form-control">
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Field Progress Summary *</label>
              {" "}
              <input type="text" id="opSummary" className="form-control" placeholder="e.g. 120 residents shifted to Palashbari HS Camp" required />
            </div>
            <button type="submit" className="btn-save-primary">Save Operation Update</button>
          </form>
        </div>
      </div>
      <div id="toast"></div>
  </>
);

export default function Authority() {
  useEffect(() => {
    document.title = "NEERAKSHAK – District Authority Portal | Flood Assessment, Approvals & Godown Coordination";
    initAuthorityPage();
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
