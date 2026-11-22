import { useEffect } from 'react';
import css from './monitoring.css?inline';
import initMonitoringPage from './monitoring.legacy.js';

// Static markup, created once so React never re-renders over what the page script builds.
const markup = (
  <>
      {/* 1. CLEAN SPLIT AUDIT BANNER */}
      {" "}
      {/* COMMAND HERO BANNER (MATCHED TO 2ADMIN, 3AUTHORITY, 4GODOWN & 5GROUNDOFFICER) */}
      <header className="mon-hero-banner anim-card">
        <div className="mon-banner-img-wrap">
          <img src="/monitoring_banner.jpg" alt={"NEERAKSHAK Monitoring & Audit Command Banner"} className="mon-banner-img" />
        </div>
        <div className="mon-banner-vignette"></div>
        <div className="mon-hero-inner">
          <div className="banner-top-bar">
            {/* Brand Lockup with Monitoring & Audit badge */}
            <div className="hero-brand-lockup">
              <div className="hero-vertical-pillar"></div>
              <div className="hero-brand-content">
                <div className="hero-brand-title-wrap">
                  <h1 className="hero-brand-title">
                    NEERA
                    <span className="hero-brand-cyan">KSHAK</span>
                  </h1>
                  <span className="hero-admin-badge">{"Monitoring & Audit"}</span>
                </div>
                <div className="hero-brand-subtitle">{"Resource Lifecycle, Delivery Audit & Accountability Control"}</div>
                <div className="hero-brand-tagline">
                  <span className="tag-italic">Audit</span>
                  {" "}
                  <span className="tag-dot">•</span>
                  {" "}
                  <span className="tag-italic">Reconcile</span>
                  {" "}
                  <span className="tag-dot">•</span>
                  {" "}
                  <span className="tag-italic tag-cyan">Accountability</span>
                </div>
              </div>
            </div>
            {/* Right HUD Action Controls matching 2admin.html */}
            <div className="hero-action-controls">
              <div className="hero-ctrl-pill">
                <i className="fas fa-location-dot" style={{ color: "#38bdf8" }}></i>
                {" "}
                <select className="hero-district-select" id="districtScopeFilter" onChange={(event) => { window.renderAllMonitoringViews(); window.showToast('Switched monitoring sector to ' + event.currentTarget.value); }}>
                  <option value="ALL">All District Sectors (Kamrup)</option>
                  <option value="Palashbari Ward 2">Palashbari Ward 2</option>
                  <option value="Chaygaon Lowland">Chaygaon Lowland</option>
                  <option value="Goroimari Char">Goroimari Char</option>
                </select>
              </div>
              <div className="hero-ctrl-pill">
                <span className="hero-live-dot"></span>
                {" "}
                <span id="telemetryStatusText">Audit Feed Online</span>
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
        </div>
      </header>
      <div className="workspace-shell">
        {/* LEFT 11-SECTION SIDEBAR */}
        {" "}
        {/* 70px VERTICAL ICON RAIL: MATCHED TO 2ADMIN.HTML, 3AUTHORITY.HTML, 4GODOWN.HTML & 5GROUNDOFFICER.HTML */}
        <aside className="left-rail">
          <button className="rail-btn mon-nav-btn active" data-tab="dashboard" onClick={(event) => window.switchMonitorTab('dashboard', event.currentTarget)} title="Executive Audit Dashboard">
            <i className="fas fa-gauge-high"></i>
            {" "}
            <span>Dashboard</span>
          </button>
          {" "}
          <button className="rail-btn mon-nav-btn" data-tab="lifecycle" onClick={(event) => window.switchMonitorTab('lifecycle', event.currentTarget)} title="Resource Lifecycle Chain">
            <i className="fas fa-route"></i>
            {" "}
            <span>Lifecycle</span>
          </button>
          {" "}
          <button className="rail-btn mon-nav-btn" data-tab="alloc-dispatch" onClick={(event) => window.switchMonitorTab('alloc-dispatch', event.currentTarget)} title={"Allocations & Dispatches"}>
            <i className="fas fa-truck-arrow-right"></i>
            {" "}
            <span>Dispatches</span>
          </button>
          {" "}
          <button className="rail-btn mon-nav-btn" data-tab="delivery-audit" onClick={(event) => window.switchMonitorTab('delivery-audit', event.currentTarget)} title="Delivery Physical Audits">
            <i className="fas fa-clipboard-check"></i>
            {" "}
            <span>Deliveries</span>
          </button>
          {" "}
          <button className="rail-btn mon-nav-btn" data-tab="discrepancies" onClick={(event) => window.switchMonitorTab('discrepancies', event.currentTarget)} title={"Shortages & Discrepancies"}>
            <i className="fas fa-triangle-exclamation"></i>
            {" "}
            <span>Shortages</span>
            {" "}
            <span className="rail-badge-count count-red" id="navDiscCount">2</span>
          </button>
          {" "}
          <button className="rail-btn mon-nav-btn" data-tab="return-audit" onClick={(event) => window.switchMonitorTab('return-audit', event.currentTarget)} title="Relief Asset Returns Audit">
            <i className="fas fa-rotate-left"></i>
            {" "}
            <span>Returns</span>
          </button>
          {" "}
          <button className="rail-btn mon-nav-btn" data-tab="ops-monitor" onClick={(event) => window.switchMonitorTab('ops-monitor', event.currentTarget)} title="Field Rescue Operations Watch">
            <i className="fas fa-shield-halved"></i>
            {" "}
            <span>Ops Watch</span>
          </button>
          {" "}
          <button className="rail-btn mon-nav-btn" data-tab="activity-logs" onClick={(event) => window.switchMonitorTab('activity-logs', event.currentTarget)} title="Live Audit Event Logs">
            <i className="fas fa-clock-rotate-left"></i>
            {" "}
            <span>Logs</span>
          </button>
          {" "}
          <button className="rail-btn mon-nav-btn" data-tab="reports" onClick={(event) => window.switchMonitorTab('reports', event.currentTarget)} title="Audit Summary Reports">
            <i className="fas fa-file-lines"></i>
            {" "}
            <span>Reports</span>
          </button>
          {" "}
          <button className="rail-btn mon-nav-btn" data-tab="escalations" onClick={(event) => window.switchMonitorTab('escalations', event.currentTarget)} title="Accountability Escalations">
            <i className="fas fa-bullhorn"></i>
            {" "}
            <span>Escalate</span>
            {" "}
            <span className="rail-badge-count count-amber" id="navEscCount">2</span>
          </button>
          {" "}
          <button className="rail-btn mon-nav-btn" data-tab="profile" onClick={(event) => window.switchMonitorTab('profile', event.currentTarget)} title={"Profile & Audit Security"}>
            <i className="fas fa-user-gear"></i>
            {" "}
            <span>Settings</span>
          </button>
          {" "}
          {/* Bottom Tools & Telemetry Sync Anchor */}
          <div className="rail-bottom-cluster">
            <div className="rail-divider"></div>
            <button className="rail-btn" onClick={(event) => { window.renderAllMonitoringViews(); window.showToast('Audit streams & lifecycle telemetry synced'); }} title="Sync All Records">
              <i className="fas fa-arrows-rotate"></i>
              {" "}
              <span>Sync</span>
            </button>
            <div className="rail-pulse-wrap" title="Audit Socket Online">
              <span className="rail-online-dot"></span>
              {" "}
              <span className="rail-online-text">SYS OK</span>
            </div>
          </div>
        </aside>
        <main className="main-content-col">
          {/* 4-KPI LIFECYCLE OVERVIEW */}
          <div className="kpi-grid-4 anim-card" id="monitorKpiGrid"></div>
          {/* ===============================================================
                 TAB 1: DASHBOARD (RECONCILIATION TABLE + DISCREPANCIES + AUDIT TIMELINE)
                 =============================================================== */}
          <div className="mo-tab-pane active" id="tab-dashboard">
            {/* 1. RESOURCE RECONCILIATION TABLE (Approved vs Dispatched vs Received) */}
            <div className="aqua-card anim-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-scale-balanced" style={{ color: "var(--indigo-audit)" }}></i>
                  {" Resource Lifecycle Reconciliation (Approved vs Dispatched vs Received)"}
                </h2>
                <button className="btn-mo" onClick={(event) => window.switchMonitorTab('lifecycle', document.querySelector('[data-tab=lifecycle]'))}>Full Lifecycle →</button>
              </div>
              <div className="table-wrap">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Resource Item</th>
                      <th>Destination</th>
                      <th>Approved</th>
                      <th>Dispatched</th>
                      <th>Received</th>
                      <th>Difference</th>
                      <th>Audit Status</th>
                    </tr>
                  </thead>
                  <tbody id="dashReconcileBody"></tbody>
                </table>
              </div>
            </div>
            {/* 2. DISCREPANCY ALERTS & CLARIFICATION CARDS */}
            <div className="aqua-card anim-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-triangle-exclamation" style={{ color: "#dc2626" }}></i>
                  {" Flagged Discrepancies & Unresolved Mismatches"}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button id="viewSlideSwitch" className="btn-mo" onClick={(event) => window.toggleGridListView()} title="Toggle Grid / List View" style={{ padding: "5px 12px", fontSize: "11.5px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <i className="fas fa-table-cells-large"></i>
                    {" "}
                    <span>Grid / List</span>
                  </button>
                  {" "}
                  <button className="btn-mo" onClick={(event) => window.switchMonitorTab('discrepancies', document.querySelector('[data-tab=discrepancies]'))}>Manage All →</button>
                </div>
              </div>
              <div className="grid-2 switchable-collection" id="dashDiscrepancyCards"></div>
            </div>
            {/* 3. RECENT USER AUDIT TIMELINE */}
            <div className="aqua-card anim-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-clock-rotate-left" style={{ color: "var(--river-blue)" }}></i>
                  {" Recent Cross-Portal Audit Activity"}
                </h2>
                <button className="btn-mo" onClick={(event) => window.switchMonitorTab('activity-logs', document.querySelector('[data-tab=activity-logs]'))}>Full Audit Trail →</button>
              </div>
              <div className="grid-2 switchable-collection" id="dashRecentLogsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 2: RESOURCE LIFECYCLE MONITORING
                 =============================================================== */}
          <div className="mo-tab-pane" id="tab-lifecycle">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-arrows-spin" style={{ color: "var(--indigo-audit)" }}></i>
                  {" Complete Resource Lifecycle Comparison"}
                </h2>
              </div>
              <div className="table-wrap">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Allocation ID</th>
                      <th>Resource</th>
                      <th>Destination</th>
                      <th>Approved</th>
                      <th>Dispatched</th>
                      <th>Received</th>
                      <th>Mismatch</th>
                      <th>Audit Action</th>
                    </tr>
                  </thead>
                  <tbody id="fullLifecycleBody"></tbody>
                </table>
              </div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 3: ALLOCATION & DISPATCH TRACKING
                 =============================================================== */}
          <div className="mo-tab-pane" id="tab-alloc-dispatch">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-truck-fast" style={{ color: "var(--river-blue)" }}></i>
                  {" Authority Allocations vs Godown Dispatch Records (Read-Only Monitor)"}
                </h2>
              </div>
              <div className="grid-2 switchable-collection" id="allocDispatchGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 4: DELIVERY VERIFICATION AUDIT
                 =============================================================== */}
          <div className="mo-tab-pane" id="tab-delivery-audit">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-clipboard-check" style={{ color: "var(--foliage-mid)" }}></i>
                  {" Ground Officer Delivery Verification Audit"}
                </h2>
              </div>
              <div className="grid-2 switchable-collection" id="deliveryAuditGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 5: DISCREPANCY MANAGEMENT
                 =============================================================== */}
          <div className="mo-tab-pane" id="tab-discrepancies">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-triangle-exclamation" style={{ color: "#dc2626" }}></i>
                  {" Discrepancy Resolution & Authority Escalation"}
                </h2>
              </div>
              <div className="grid-2 switchable-collection" id="fullDiscrepancyGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 6: RETURN & RESOURCE UTILIZATION AUDIT
                 =============================================================== */}
          <div className="mo-tab-pane" id="tab-return-audit">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-rotate-left" style={{ color: "var(--teal-water)" }}></i>
                  {" Post-Operation Return & Utilization Audit"}
                </h2>
              </div>
              <div className="table-wrap">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Resource</th>
                      <th>Dispatched</th>
                      <th>Returned (Good)</th>
                      <th>Damaged</th>
                      <th>Missing</th>
                      <th>Inventory Sync Status</th>
                    </tr>
                  </thead>
                  <tbody id="returnAuditBody"></tbody>
                </table>
              </div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 7: OPERATION MONITORING
                 =============================================================== */}
          <div className="mo-tab-pane" id="tab-ops-monitor">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-life-ring" style={{ color: "var(--river-blue)" }}></i>
                  {" Active Flood-Relief Operations Monitor (Non-Command)"}
                </h2>
              </div>
              <div className="grid-2 switchable-collection" id="opsMonitorGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 8: USER ACTIVITY & AUDIT LOGS
                 =============================================================== */}
          <div className="mo-tab-pane" id="tab-activity-logs">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-user-clock" style={{ color: "var(--navy-deep)" }}></i>
                  {" Immutable Cross-Portal User Activity & Audit Logs"}
                </h2>
              </div>
              <div className="grid-2 switchable-collection" id="fullActivityLogsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 9: REPORTS & AUDIT HISTORY
                 =============================================================== */}
          <div className="mo-tab-pane" id="tab-reports">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-file-contract" style={{ color: "var(--indigo-audit)" }}></i>
                  {" Accountability & Lifecycle Audit Reports"}
                </h2>
                <button className="btn-mo" onClick={(event) => window.showToast('Complete Resource Lifecycle Audit Report exported (PDF/CSV).')}>
                  <i className="fas fa-download"></i>
                  {" Export Audit Report"}
                </button>
              </div>
              <div className="grid-2" id="auditReportCards"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 10: NOTIFICATIONS & ESCALATIONS
                 =============================================================== */}
          <div className="mo-tab-pane" id="tab-escalations">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-bell" style={{ color: "#dc2626" }}></i>
                  {" Authority Escalations & Clarification Alerts"}
                </h2>
              </div>
              <div className="grid-2 switchable-collection" id="escalationsGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 11: PROFILE & SETTINGS
                 =============================================================== */}
          <div className="mo-tab-pane" id="tab-profile">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-user-gear" style={{ color: "var(--navy-deep)" }}></i>
                  {" Monitoring Officer Profile & Audit Scope"}
                </h2>
              </div>
              <div className="grid-2">
                <div className="audit-card tone-indigo">
                  <h4>Auditor Credentials</h4>
                  <div style={{ fontSize: "11.5px", color: "var(--text-body)", lineHeight: "1.6" }}>
                    {" Officer: "}
                    <strong>{"S. N. Bora (Monitoring & Audit Officer)"}</strong>
                    <br />
                    {" Officer ID: "}
                    <strong>MO-DEOC-02</strong>
                    {" • Scope: "}
                    <strong>Kamrup District</strong>
                  </div>
                </div>
                <div className="audit-card tone-ok">
                  <h4>Separation of Duties</h4>
                  <div style={{ fontSize: "11.5px", color: "var(--text-body)", lineHeight: "1.6" }}>
                    {" Read-only audit access across Admin, Authority, Godown & Ground portals. Cannot approve allocations, alter stock, or edit field receipts. "}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* =================================================================
             RIGHT INTER-PORTAL CLARIFICATION & ISSUE RESOLUTION CHAT DOCK
             ================================================================= */}
        <aside className="chat-dock-panel anim-card">
          <div className="chat-dock-header">
            <h3>
              <i className="fas fa-comments"></i>
              {" Inter-Portal Audit Chat"}
            </h3>
            <span className="chat-online-pill">Live Sync</span>
          </div>
          {/* Channel Switcher for Admin, Authority, Godown & Ground Officer */}
          <div className="chat-role-channels">
            <button className="channel-tab active" onClick={(event) => window.switchChatChannel('ground', event.currentTarget)}>Ground</button>
            {" "}
            <button className="channel-tab" onClick={(event) => window.switchChatChannel('godown', event.currentTarget)}>Godown</button>
            {" "}
            <button className="channel-tab" onClick={(event) => window.switchChatChannel('authority', event.currentTarget)}>Authority</button>
            {" "}
            <button className="channel-tab" onClick={(event) => window.switchChatChannel('admin', event.currentTarget)}>Admin</button>
          </div>
          <div className="chat-channel-context">
            <span id="chatChannelTitle">Channel: Ground Officer (GO-KAM-04)</span>
            {" "}
            <span style={{ fontSize: "9.5px", opacity: "0.85" }}>Audit Logged</span>
          </div>
          {/* Messages Feed */}
          <div className="chat-messages-feed" id="chatMessagesFeed"></div>
          {/* Quick Clarification Chips */}
          <div className="chat-quick-prompts">
            <button className="quick-chip-btn" onClick={(event) => window.insertQuickChat('Please clarify the 20-unit shortage on DSP-2026-884.')}>Ask Shortage</button>
            {" "}
            <button className="quick-chip-btn" onClick={(event) => window.insertQuickChat('Please upload physical receipt photo for audit verification.')}>Request Photo</button>
            {" "}
            <button className="quick-chip-btn" onClick={(event) => window.insertQuickChat('Escalating unresolved discrepancy to District Authority.')}>Escalate Notice</button>
          </div>
          {/* Chat Input */}
          <form className="chat-input-bar" onSubmit={(event) => window.sendChatMessage(event)}>
            <input type="text" id="chatMessageInput" placeholder="Message portal officer to resolve issue..." required />
            {" "}
            <button type="submit" className="chat-send-btn" title="Send Message">
              <i className="fas fa-paper-plane" style={{ fontSize: "12px" }}></i>
            </button>
          </form>
        </aside>
      </div>
      {/* RIPARIAN HILLS & RIVER FOOTER */}
      <div className="riparian-footer-wrap">
        <div className="footer-scenic-banner">
          <img src="/footer.jpg" alt="Misty Brahmaputra River Basin Landscape" className="footer-scenic-img" />
          <div className="footer-scenic-blend"></div>
        </div>
        <div className="riparian-footer-bar">
          <div className="footer-flex">
            <span>
              <strong>{"NEERAKSHAK Monitoring & Audit Portal"}</strong>
              {" • Independent Lifecycle Reconciliation & Accountability"}
            </span>
            {" "}
            <span>
              Audit Flow: Authority Approves → Godown Dispatches → Ground Verifies → Monitoring Officer Audits
            </span>
          </div>
        </div>
      </div>
      <div id="toast"></div>
  </>
);

export default function Monitoring() {
  useEffect(() => {
    document.title = "NEERAKSHAK – Monitoring & Audit Portal | Resource Lifecycle & Accountability";
    initMonitoringPage();
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
