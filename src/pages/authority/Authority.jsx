import { useEffect } from 'react';
import css from './authority.css?inline';
import '../../components/interportalChat.css';
import initAuthorityPage from './authority.legacy.js';
import { setupRouteGuard } from '../../auth';

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
                  <span className="hero-admin-badge" id="heroBasinBadge" style={{ background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)" }}>Authority</span>
                </div>
              </div>
            </div>
            {/* HUD Action Controls (Matching 2admin.html) */}
            <div className="hero-action-controls">
              <div className="hero-ctrl-pill">
                <i className="fas fa-location-dot" style={{ color: "#38bdf8" }}></i>
                {" "}
                <select
                  className="hero-district-select"
                  id="heroDistrictSelect"
                  defaultValue=""
                  onChange={(event) => window.switchAuthoritySector && window.switchAuthoritySector(event.currentTarget.value)}
                >
                  <optgroup id="heroDistrictOptgroup" label="Assigned District Command Sectors">
                    <option value="kamrup">Kamrup District, Assam</option>
                  </optgroup>
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
          <button className="rail-btn auth-nav-btn active" data-tab="dashboard" onClick={(event) => window.switchAuthTab('dashboard', event.currentTarget)} title="District Flood Map & Live Resource Assessment">
            <i className="fas fa-map-location-dot"></i>
            {" "}
            <span>Flood Map</span>
          </button>
          {" "}
          <button className="rail-btn auth-nav-btn" data-tab="map-critical" onClick={(event) => window.switchAuthTab('map-critical', event.currentTarget)} title="Village Flood Severity Assessment Matrix">
            <i className="fas fa-table-cells"></i>
            {" "}
            <span>Assess</span>
            {" "}
            <span className="rail-badge-count" id="navCriticalBadge">0</span>
          </button>
          {" "}
          <button className="rail-btn auth-nav-btn" data-tab="requests" onClick={(event) => window.switchAuthTab('requests', event.currentTarget)} title="Field Resource Requests & Approval Desk">
            <i className="fas fa-clipboard-check"></i>
            {" "}
            <span>Requests</span>
            {" "}
            <span className="rail-badge-count" id="navReqBadge">0</span>
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
          <button className="rail-btn auth-nav-btn" data-tab="interportal-comms" onClick={(event) => window.switchAuthTab('interportal-comms', event.currentTarget)} title="Live Inter-Portal Multi-Agency Comms & Direct Dispatch">
            <i className="fas fa-tower-broadcast"></i>
            {" "}
            <span>Live Comms</span>
            {" "}
            <span className="rail-badge-count" id="authCommsBadge" style={{ display: 'none' }}>0</span>
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
                  <button className="btn-card-action" onClick={() => window.filterAuthorityMapSeverity && window.filterAuthorityMapSeverity('ALL')}>All Zones</button>
                  {" "}
                  <button className="btn-card-action" style={{ color: "#b91c1c" }} onClick={() => window.filterAuthorityMapSeverity && window.filterAuthorityMapSeverity('Critical')}>Critical Only</button>
                  {" "}
                  <button className="btn-card-action" style={{ color: "#c2410c" }} onClick={() => window.filterAuthorityMapSeverity && window.filterAuthorityMapSeverity('High')}>High Only</button>
                </div>
              </div>
              <div id="authorityMapSlot" style={{ position: "relative", height: "480px" }}>
                <div id="authorityLeafletMap" style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 1, borderRadius: "12px" }}></div>
                <div className="map-float-search" style={{ zIndex: 10 }}>
                  <i className="fas fa-search" style={{ color: "#64748b" }}></i>
                  {" "}
                  <input type="text" placeholder="Search village, river basin..." onKeyUp={(event) => { if(event.key==='Enter') window.searchAuthorityMap && window.searchAuthorityMap(event.currentTarget.value); }} />
                </div>
                <div className="map-legend-overlay" style={{ zIndex: 10 }}>
                  <span>
                    <i className="l-dot" style={{ background: "#dc2626" }}></i>
                    Critical / Above Danger
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
                <div className="map-zoom-controls" style={{ zIndex: 10 }}>
                  <button className="map-z-btn" onClick={() => window.authMapZoomIn && window.authMapZoomIn()} title="Zoom In">+</button>
                  {" "}
                  <button className="map-z-btn" onClick={() => window.authMapZoomOut && window.authMapZoomOut()} title="Zoom Out">−</button>
                  {" "}
                  <button className="map-z-btn" onClick={() => window.authMapRecenter && window.authMapRecenter()} title="Recenter">
                    <i className="fas fa-crosshairs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* ===============================================================
                 SECTION 2: VILLAGE FLOOD SEVERITY MATRIX (ASSESS MATRIX & DIRECT ALLOCATION)
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-map-critical">
            {/* INTEGRATED AREA DETAILS & RESOURCE ASSESSMENT CALCULATOR (DIRECT GODOWN ALLOCATION - 4TH IMAGE) */}
            <div className="aqua-card anim-card" id="areaDetailsPanel" style={{ marginBottom: "14px" }}></div>

            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-table-cells" style={{ color: "var(--river-blue)" }}></i>
                  {" Village Flood Severity Assessment Matrix (Recent & Critical First)"}
                </h2>
                <select id="mapSevSelect" className="form-control" style={{ padding: "4px 10px", fontSize: "11.5px", width: "auto" }} onChange={(event) => window.renderAllAuthorityViews && window.renderAllAuthorityViews()}>
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
                 SECTION 3: FIELD RESOURCE REQUESTS & APPROVAL DESK (MERGED)
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-requests">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-clipboard-check" style={{ color: "var(--foliage-mid)" }}></i>
                  {" Field Resource Requests & Approval Desk"}
                </h2>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <select id="requestStatusFilter" className="form-control" style={{ padding: "4px 10px", fontSize: "11.5px", width: "auto" }} onChange={() => window.renderAllAuthorityViews && window.renderAllAuthorityViews()}>
                    <option value="ALL">All Requests</option>
                    <option value="Pending">Pending Approvals Only</option>
                    <option value="Approved">Approved Requests</option>
                    <option value="Rejected">Rejected Requests</option>
                  </select>
                </div>
              </div>
              <div className="cards-grid-2" id="allRequestsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 SECTION 4: ALLOCATION TRACKING (GODOWN DISPATCH & DELIVERY MONITOR)
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-tracking">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-truck-fast" style={{ color: "var(--river-blue)" }}></i>
                  {" Allocation, Godown Dispatch & Ground Delivery Tracking"}
                </h2>
                <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Tap any area card to view step-by-step convoy transit & checkpoints</span>
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
          {/* ===============================================================
                 SECTION 11: INTER-PORTAL LIVE COMMS & DIRECT CHAT
                 =============================================================== */}
          <div className="tab-view-pane" id="tab-interportal-comms">
            <div id="portalChatMount_authority"></div>
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
              <button className="qa-color-card qa-green" onClick={(event) => window.switchAuthTab('requests', document.querySelector('[data-tab=requests]'))}>
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
        <div className="modal-box" style={{ maxWidth: "560px" }} onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>
              <i className="fas fa-life-ring" style={{ color: "var(--river-blue)", marginRight: "6px" }}></i>
              {"Record NDRF / SDRF Official Coordination & SITREP"}
            </h3>
            <button onClick={(event) => window.closeModal('coordModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitCoordRecord(event)}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Response Force Agency *</label>
                {" "}
                <select id="coordAgency" className="form-control">
                  <option value="NDRF (1st Battalion, Patgaon)">NDRF (1st Battalion, Patgaon)</option>
                  <option value="SDRF District Unit (Guwahati Central)">SDRF District Unit (Guwahati Central)</option>
                  <option value="Indian Army (Red Horns Division)">Indian Army (Red Horns Division)</option>
                  <option value={"River Police & Civil Defence"}>{"River Police & Civil Defence"}</option>
                </select>
              </div>
              <div className="form-group">
                <label>Affected Sector / Location *</label>
                {" "}
                <input type="text" id="coordSector" className="form-control" placeholder="e.g. Palashbari Riverside Ward 2" required />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Incident Commander / Officer Name *</label>
                {" "}
                <input type="text" id="coordCommander" className="form-control" placeholder="e.g. Inspector Vikram Rathore" required />
              </div>
              <div className="form-group">
                <label>Officer Designation / Role *</label>
                {" "}
                <input type="text" id="coordDesignation" className="form-control" placeholder="e.g. Team Alpha Commander" required />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Communication Channel / Contact *</label>
                {" "}
                <input type="text" id="coordContact" className="form-control" placeholder="e.g. VHF Ch-07 / +91 94350-11234" required />
              </div>
              <div className="form-group">
                <label>Operational Status *</label>
                {" "}
                <select id="coordStatus" className="form-control">
                  <option value="Deployed On Water">Deployed On Water</option>
                  <option value="Active Rescue Sortie">Active Rescue Sortie</option>
                  <option value="On Standby at Staging Area">On Standby at Staging Area</option>
                  <option value="Mission Successful">Mission Successful</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Force Strength & Assets Deployed</label>
              {" "}
              <input type="text" id="coordStrength" className="form-control" placeholder="e.g. 28 Deep-Water Personnel • 4 Zodiacs • 2 OBMs" />
            </div>
            <div className="form-group">
              <label>Official Call / SITREP Dialogue & Tactical Action Taken *</label>
              {" "}
              <textarea id="coordUpdate" className="form-control" rows="3" placeholder="e.g. Spoke with Insp. Rathore on VHF. Agreed to deploy 2 boat teams immediately behind primary school..." required />
            </div>
            <button type="submit" className="btn-save-primary">Save Multi-Agency Coordination Record</button>
          </form>
        </div>
      </div>
      {/* INTERACTIVE TRACKING DOSSIER MODAL */}
      <div className="modal-overlay" id="trackingDetailModal" onClick={() => window.closeModal('trackingDetailModal')}>
        <div className="modal-box" style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }} onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
            <div>
              <h3 id="trackModalHeading" style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>Allocation Dispatch Live Journey</h3>
              <span id="trackModalSub" style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}></span>
            </div>
            <button onClick={() => window.closeModal('trackingDetailModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div id="trackModalBody"></div>
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
    let cleanup = () => {};
    try {
      cleanup = setupRouteGuard('authority') || (() => {});
    } catch (e) {
      console.warn('setupRouteGuard notice:', e);
    }
    document.title = "NEERAKSHAK – District Authority Portal | Flood Assessment, Approvals & Godown Coordination";
    try {
      initAuthorityPage();
    } catch (err) {
      console.error('initAuthorityPage error:', err);
    }
    return () => {
      try { cleanup(); } catch (e) {}
    };
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
