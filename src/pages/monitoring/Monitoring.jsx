import { useEffect } from 'react';
import css from './monitoring.css?inline';
import initMonitoringPage from './monitoring.legacy.js';
import { setupRouteGuard } from '../../auth';

const markup = (
  <>
    {/* COMMAND HERO BANNER */}
    <header className="mon-hero-banner anim-card">
      <div className="mon-banner-img-wrap">
        <img src="/monitoring_banner.jpg" alt="NEERAKSHAK Monitoring & Audit Command Banner" className="mon-banner-img" />
      </div>
      <div className="mon-banner-vignette"></div>
      <div className="mon-hero-inner">
        <div className="banner-top-bar">
          <div className="hero-brand-lockup">
            <div className="hero-vertical-pillar"></div>
            <div className="hero-brand-content">
              <div className="hero-brand-title-wrap">
                <h1 className="hero-brand-title">
                  NEERA<span className="hero-brand-cyan">KSHAK</span>
                </h1>
                <span className="hero-admin-badge">State Monitoring & Audit</span>
              </div>
              <div className="hero-brand-subtitle">State DEOC Lifecycle Verification, Multi-Portal Directives & Accountability Control</div>
              <div className="hero-brand-tagline">
                <span className="tag-italic">Reconciliation</span> <span className="tag-dot">•</span> <span className="tag-italic">Directives</span> <span className="tag-dot">•</span> <span className="tag-italic tag-cyan">Complete 10-Function Audit</span>
              </div>
            </div>
          </div>

          <div className="hero-action-controls">
            <div className="hero-ctrl-pill">
              <i className="fas fa-location-dot" style={{ color: "#38bdf8" }}></i>
              <select className="hero-district-select" id="districtScopeFilter" onChange={(e) => { if (window.filterMonitoringSector) window.filterMonitoringSector(e.currentTarget.value); }}>
                <option value="ALL">All District Sectors</option>
              </select>
            </div>
            <div className="hero-ctrl-pill">
              <span className="hero-live-dot"></span>
              <span id="telemetryStatusText">State DEOC Live Audit Feed</span>
            </div>
            <a href="/" className="hero-btn-action hero-btn-public" title="Public Citizen Portal">
              <i className="fas fa-arrow-left"></i> Public Portal
            </a>
            <a href="/login?logout=1" onClick={(e) => { e.preventDefault(); if (window.neerakshakLogout) window.neerakshakLogout(); else { try{sessionStorage.clear(); sessionStorage.setItem('neerakshak_logged_out', '1');}catch(err){} window.location.href = '/login?logout=1'; } }} className="hero-btn-action hero-btn-logout" title="Sign out">
              <i className="fas fa-right-from-bracket"></i> Logout
            </a>
          </div>
        </div>
      </div>
    </header>

    <div className="workspace-shell">
      {/* LEFT 9-SECTION ICON RAIL (6 CORE + 3 REQUESTED ADDITIONS) */}
      <aside className="left-rail">
        <button className="rail-btn mon-nav-btn active" data-tab="dashboard" onClick={(e) => window.switchMonitorTab('dashboard', e.currentTarget)} title="Dashboard & Communication Command Center">
          <i className="fas fa-gauge-high"></i>
          <span>Dashboard</span>
        </button>
        <button className="rail-btn mon-nav-btn" data-tab="tracing" onClick={(e) => window.switchMonitorTab('tracing', e.currentTarget)} title="Resource Lifecycle Tracing (5 Stages)">
          <i className="fas fa-route"></i>
          <span>Tracing</span>
          <span className="rail-badge-count count-cyan" id="navTracingCount">0</span>
        </button>
        <button className="rail-btn mon-nav-btn" data-tab="reconciliation" onClick={(e) => window.switchMonitorTab('reconciliation', e.currentTarget)} title="Reconciliation & Cross-Verification">
          <i className="fas fa-scale-balanced"></i>
          <span>Reconcile</span>
        </button>
        <button className="rail-btn mon-nav-btn" data-tab="discrepancies" onClick={(e) => window.switchMonitorTab('discrepancies', e.currentTarget)} title="Discrepancy Lifecycle & Status Flow">
          <i className="fas fa-triangle-exclamation"></i>
          <span>Shortages</span>
          <span className="rail-badge-count count-red" id="navDiscCount">0</span>
        </button>
        <button className="rail-btn mon-nav-btn" data-tab="returns" onClick={(e) => window.switchMonitorTab('returns', e.currentTarget)} title="Return & Resource Restock Audit">
          <i className="fas fa-rotate-left"></i>
          <span>Returns</span>
        </button>
        <button className="rail-btn mon-nav-btn" data-tab="logs" onClick={(e) => window.switchMonitorTab('logs', e.currentTarget)} title="User Activity & Multi-Agency Audit Logs">
          <i className="fas fa-clock-rotate-left"></i>
          <span>Logs</span>
        </button>

        <div className="rail-bottom-cluster">
          <div className="rail-divider"></div>
          <button className="rail-btn" onClick={() => { if (window.refreshMonitoringData) window.refreshMonitoringData(); }} title="Sync All Records">
            <i className="fas fa-arrows-rotate"></i>
            <span>Sync</span>
          </button>
          <div className="rail-pulse-wrap" title="Audit Socket Online">
            <span className="rail-online-dot"></span>
            <span className="rail-online-text">SYS OK</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT STAGE */}
      <main className="main-content-col">
        {/* 7-KPI COMPREHENSIVE OVERVIEW STRIP (FUNCTION 1) */}
        <div className="kpi-grid-7 anim-card" id="monitorKpiGrid"></div>

        {/* ===============================================================
            TAB 1: DASHBOARD & INTER-PORTAL COMMUNICATION COMMAND CENTER
            =============================================================== */}
        <div className="mo-tab-pane active" id="tab-dashboard">
          <div className="aqua-card anim-card mo-chat-hub-card" style={{ padding: '16px', marginBottom: '14px', maxWidth: '780px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-tower-broadcast" style={{ color: "var(--river-blue)" }}></i>
                  State Inter-Portal Communication & Pinned Announcement Hub
                </h2>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Send targeted messages to any portal or pin an urgent state directive across all 5 portals + citizen public.
                </div>
              </div>

              {/* Mode Toggle Buttons */}
              <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <button
                  type="button"
                  id="btnCommsModeDirect"
                  className="btn-mo"
                  style={{ padding: '5px 12px', fontSize: '11px', background: '#0284c7', color: '#fff', borderColor: '#0284c7' }}
                  onClick={() => window.toggleCommsMode('direct')}
                >
                  <i className="fas fa-comments"></i> Direct Portal Chat
                </button>
                <button
                  type="button"
                  id="btnCommsModeBroadcast"
                  className="btn-mo"
                  style={{ padding: '5px 12px', fontSize: '11px', background: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
                  onClick={() => window.toggleCommsMode('broadcast')}
                >
                  <i className="fas fa-thumbtack" style={{ color: '#dc2626' }}></i> Pinned Announcement
                </button>
              </div>
            </div>

            {/* SUB-VIEW 1: DIRECT PORTAL MESSAGING */}
            <div id="commsDirectView" style={{ display: 'block' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button className="channel-tab active" style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', borderRadius: '8px' }} onClick={(e) => window.switchChatChannel('ground', e.currentTarget)}>
                  <i className="fas fa-person-military-rifle"></i> Ground Officer
                </button>
                <button className="channel-tab" style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', borderRadius: '8px' }} onClick={(e) => window.switchChatChannel('godown', e.currentTarget)}>
                  <i className="fas fa-warehouse"></i> Central Godown
                </button>
                <button className="channel-tab" style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', borderRadius: '8px' }} onClick={(e) => window.switchChatChannel('authority', e.currentTarget)}>
                  <i className="fas fa-building-columns"></i> District Authority
                </button>
                <button className="channel-tab" style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', borderRadius: '8px' }} onClick={(e) => window.switchChatChannel('admin', e.currentTarget)}>
                  <i className="fas fa-satellite-dish"></i> State Admin GIS
                </button>
                <button className="channel-tab" style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', borderRadius: '8px' }} onClick={(e) => window.switchChatChannel('all', e.currentTarget)}>
                  <i className="fas fa-bullhorn"></i> Common Broadcast
                </button>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '12px', color: '#0f172a' }} id="centerChatChannelTitle">
                    Active Channel: Ground Officer (Field Units)
                  </strong>
                  <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>
                    <i className="fas fa-circle" style={{ fontSize: '8px' }}></i> Real-Time Cross-Portal Channel
                  </span>
                </div>

                <div id="centerChatFeed" style={{ minHeight: '220px', maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px' }}></div>

                <form onSubmit={(e) => window.sendChatMessage(e)} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    id="centerChatMessageInput"
                    placeholder="Type official directive / message to selected portal officer..."
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    required
                  />
                  <button type="submit" className="btn-mo" style={{ padding: '0 22px', background: '#0284c7', color: '#fff', borderColor: '#0284c7', fontWeight: 700 }}>
                    <i className="fas fa-paper-plane"></i> Send
                  </button>
                </form>
              </div>
            </div>

            {/* SUB-VIEW 2: PINNED EMERGENCY BROADCAST COMPOSER */}
            <div id="commsBroadcastView" style={{ display: 'none' }}>
              <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                    HIGH PRIORITY DIRECTIVE
                  </span>
                  <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600 }}>
                    Announcements published here are permanently PINNED to the top of Admin, Authority, Godown, Ground Officer, and Public Citizen portals until unpinned.
                  </span>
                </div>

                <form onSubmit={(e) => window.publishPinnedAnnouncement(e)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>Directive Title *</label>
                      <input
                        type="text"
                        id="announcementTitleInput"
                        placeholder="e.g. Critical Hydrology Breach Alert – Saura & Kosi River Basin"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>Severity Level</label>
                      <select id="announcementSeverityInput" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                        <option value="EMERGENCY">🚨 Emergency Red (Danger Breach)</option>
                        <option value="CRITICAL">⚠️ Critical Warning</option>
                        <option value="GENERAL">ℹ️ General State Directive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>Directive Order & Instructions *</label>
                    <textarea
                      id="announcementMessageInput"
                      rows="3"
                      placeholder="e.g. All field response teams must evacuate low-lying sectors immediately. Central Godown to hold 100 extra life jackets on high-alert standby."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'inherit' }}
                      required
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button type="submit" className="btn-mo" style={{ background: '#dc2626', color: '#fff', borderColor: '#b91c1c', padding: '8px 18px', fontWeight: 700 }}>
                      <i className="fas fa-thumbtack"></i> Pin Announcement Across All Portals
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>Currently Pinned Active Announcements</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Remains active until unpinned</span>
                </div>
                <div id="activeAnnouncementsList"></div>
              </div>
            </div>
          </div>

          {/* Quick Tracing Snapshot */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-route" style={{ color: "var(--indigo-audit)" }}></i>
                {" Active Area Relief Lifecycle Status"}
              </h2>
              <button className="btn-mo" onClick={() => window.switchMonitorTab('tracing', document.querySelector('[data-tab=tracing]'))}>View Full Area Tracing →</button>
            </div>
            <div id="dashTracingPreview" className="grid-2"></div>
          </div>
        </div>

        {/* ===============================================================
            TAB 2: RESOURCE LIFECYCLE TRACING (FUNCTION 2)
            Approved → Dispatched → Received → Audited → Returned
            =============================================================== */}
        <div className="mo-tab-pane" id="tab-tracing">
          <div className="aqua-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-route" style={{ color: "var(--river-cyan)" }}></i>
                {" Complete Resource Lifecycle Journey Tracing"}
              </h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Filter Sector:</span>
                <select id="tracingAreaSelect" className="hero-district-select" style={{ background: '#0284c7', color: '#fff', padding: '4px 10px', borderRadius: '6px' }} onChange={(e) => { if (window.filterTracingArea) window.filterTracingArea(e.currentTarget.value); }}>
                  <option value="ALL">All Flood Sectors</option>
                </select>
              </div>
            </div>
            <div id="areaTracingContainer"></div>
          </div>
        </div>

        {/* ===============================================================
            TAB 3: RECONCILIATION & CROSS-VERIFICATION (FUNCTION 3)
            Approved vs Dispatched vs Received vs Returned vs Variance
            =============================================================== */}
        <div className="mo-tab-pane" id="tab-reconciliation">
          <div className="aqua-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-scale-balanced" style={{ color: "var(--indigo-audit)" }}></i>
                {" Resource Lifecycle Reconciliation & Variance Ledger"}
              </h2>
              <button className="btn-mo" onClick={() => window.exportAuditSitrepReport()}>
                <i className="fas fa-download"></i> Export Ledger (CSV)
              </button>
            </div>
            <div className="table-wrap">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Resource Item</th>
                    <th>Destination Sector</th>
                    <th>Authority Approved</th>
                    <th>Godown Dispatched</th>
                    <th>Ground Received</th>
                    <th>Variance / Difference</th>
                    <th>Audit Status</th>
                  </tr>
                </thead>
                <tbody id="reconcileTableBody"></tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===============================================================
            TAB 4: DISCREPANCY MANAGEMENT (FUNCTION 4)
            Status Flow: Open → Under Review → Clarification Requested → Escalated → Resolved → Closed
            =============================================================== */}
        <div className="mo-tab-pane" id="tab-discrepancies">
          <div className="aqua-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-triangle-exclamation" style={{ color: "#dc2626" }}></i>
                {" Discrepancy Investigation & Resolution Hub"}
              </h2>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                Status Flow: Open → Under Review → Clarification Requested → Escalated → Resolved → Closed
              </div>
            </div>
            <div className="grid-2 switchable-collection" id="fullDiscrepancyGrid"></div>
          </div>
        </div>

        {/* ===============================================================
            TAB 5: RETURN & RESOURCE AUDIT (FUNCTION 6)
            Individual Ground Officer & Godown Verifications + Case Closure
            =============================================================== */}
        <div className="mo-tab-pane" id="tab-returns">
          <div className="aqua-card">
            <div className="card-head">
              <div>
                <h2>
                  <i className="fas fa-rotate-left" style={{ color: "var(--teal-water)" }}></i>
                  {" Post-Operation Return & Physical Restock Dual-Audit"}
                </h2>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Individual verifications by Ground Officer (field release) & Central Godown (warehouse intake). Itemized condition breakdown & sign-off.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Filter Sector:</span>
                <select id="returnSectorSelect" className="hero-district-select" style={{ background: '#0284c7', color: '#fff', padding: '4px 10px', borderRadius: '6px' }} onChange={(e) => { if (window.filterReturnSector) window.filterReturnSector(e.currentTarget.value); }}>
                  <option value="ALL">All Return Sectors</option>
                </select>
              </div>
            </div>

            {/* DUAL-VERIFICATION RETURN CASE CARDS */}
            <div className="switchable-collection" id="returnAuditCardsGrid"></div>

            {/* Summary Reconcile Table */}
            <div className="table-wrap" style={{ marginTop: '14px' }}>
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Sector / Case ID</th>
                    <th>Dispatched Equipment</th>
                    <th>Ground Officer Sign-off</th>
                    <th>Godown Restock (Good)</th>
                    <th>Damaged / Missing</th>
                    <th>Dual-Audit Status</th>
                  </tr>
                </thead>
                <tbody id="returnAuditBody"></tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===============================================================
            TAB 6: STATE MULTI-AGENCY NOTIFICATION FEED & AUDIT LOGS
            =============================================================== */}
        <div className="mo-tab-pane" id="tab-logs">
          <div className="aqua-card">
            <div className="card-head">
              <div>
                <h2>
                  <i className="fas fa-bell" style={{ color: "var(--navy-deep)" }}></i>
                  {" Multi-Agency Operational Activity Stream & Notification Feed"}
                </h2>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Live chronological stream of State Admin GIS pins, DDMA allocations, warehouse dispatches, and field verification impacts.
                </div>
              </div>

              {/* Agency Filter Chips */}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <button type="button" className="btn-mo" style={{ padding: '4px 9px', fontSize: '10.5px' }} onClick={() => window.filterLogsByAgency('ALL')}>All (सभी)</button>
                <button type="button" className="btn-mo" style={{ padding: '4px 9px', fontSize: '10.5px', background: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => window.filterLogsByAgency('Admin')}>Admin GIS</button>
                <button type="button" className="btn-mo" style={{ padding: '4px 9px', fontSize: '10.5px', background: '#eef2ff', color: '#4338ca', borderColor: '#c7d2fe' }} onClick={() => window.filterLogsByAgency('Authority')}>DDMA Authority</button>
                <button type="button" className="btn-mo" style={{ padding: '4px 9px', fontSize: '10.5px', background: '#f0f9ff', color: '#0284c7', borderColor: '#bae6fd' }} onClick={() => window.filterLogsByAgency('Godown')}>Central Godown</button>
                <button type="button" className="btn-mo" style={{ padding: '4px 9px', fontSize: '10.5px', background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }} onClick={() => window.filterLogsByAgency('Ground')}>Ground Units</button>
              </div>
            </div>

            <div id="fullActivityLogsGrid" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}></div>
          </div>
        </div>
      </main>

      {/* RIGHT PANEL: ACTIONS, INSPECTOR, NOTIFICATIONS (FUNCTION 10) & TELEMETRY */}
      <aside className="right-panel">
        {/* Quick Actions */}
        <div className="aqua-card anim-card">
          <div className="card-head">
            <h2>
              <i className="fas fa-bolt" style={{ color: "#f59e0b" }}></i>
              {" Audit Quick Actions"}
            </h2>
          </div>
          <div className="qa-grid-2x2">
            <button type="button" className="qa-color-card qa-amber" onClick={() => window.openPinnedBroadcastComposer()}>
              <i className="fas fa-thumbtack"></i>
              <strong>Pin Broadcast</strong>
              <span>State Directive</span>
            </button>
            <button type="button" className="qa-color-card qa-green" onClick={() => window.refreshMonitoringData()}>
              <i className="fas fa-arrows-rotate"></i>
              <strong>Re-Audit Sync</strong>
              <span>Recalculate DB</span>
            </button>
            <button type="button" className="qa-color-card qa-blue" onClick={() => window.switchMonitorTab('discrepancies', document.querySelector('[data-tab=discrepancies]'))}>
              <i className="fas fa-triangle-exclamation"></i>
              <strong>Discrepancies</strong>
              <span>Status Flow</span>
            </button>
            <button type="button" className="qa-color-card qa-indigo" onClick={() => window.exportAuditSitrepReport()}>
              <i className="fas fa-file-csv"></i>
              <strong>Export SITREP</strong>
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* FUNCTION 10: NOTIFICATIONS & ESCALATIONS STREAM */}
        <div className="aqua-card anim-card" id="notificationsPanel">
          <div className="card-head">
            <h2>
              <i className="fas fa-bell" style={{ color: "#dc2626" }}></i>
              {" Audit Notifications & Escalations"}
            </h2>
            <span style={{ fontSize: '10px', background: '#fee2e2', color: '#b91c1c', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }} id="notifBadgeCount">
              Live
            </span>
          </div>
          <div id="notificationsFeed" style={{ maxHeight: '200px', overflowY: 'auto' }}></div>
        </div>

        {/* Selected Sector Inspector */}
        <div className="aqua-card anim-card" id="selectedSectorCard">
          <div className="card-head">
            <h2>
              <i className="fas fa-crosshairs" style={{ color: "#0284c7" }}></i>
              {" Selected Sector Inspector"}
            </h2>
          </div>
          <div id="inspectorContent" style={{ fontSize: '12px' }}>
            <div style={{ color: '#64748b', textAlign: 'center', padding: '16px' }}>
              Tap any sector to inspect its full lifecycle telemetry.
            </div>
          </div>
        </div>

        {/* River Hydrology Telemetry */}
        <div className="aqua-card anim-card" id="supplyRouteRiverCard">
          <div className="card-head">
            <h2>
              <i className="fas fa-water" style={{ color: "var(--river-blue)" }}></i>
              {" River Basin Telemetry"}
            </h2>
          </div>
          <div id="riverTelemetryList"></div>
        </div>
      </aside>
    </div>

    {/* RIPARIAN FOOTER */}
    <div className="riparian-footer-wrap">
      <div className="footer-scenic-banner">
        <img src="/footer.jpg" alt="Misty Brahmaputra River Basin" className="footer-scenic-img" />
        <div className="footer-scenic-blend"></div>
      </div>
      <div className="riparian-footer-bar">
        <div className="footer-flex">
          <span>
            <strong>NEERAKSHAK State DEOC Monitoring & Audit Portal</strong> • Complete 10-Function Lifecycle Verification & Accountability Control
          </span>
          <span>
            Chain: Inundation Pin (Admin) → Allocation (Authority) → Dispatch (Godown) → Verification (Ground) → Post-Rescue Restock
          </span>
        </div>
      </div>
    </div>
    <div id="toast"></div>
  </>
);

export default function Monitoring() {
  useEffect(() => {
    const cleanup = setupRouteGuard('monitoring');
    document.title = "NEERAKSHAK – State Monitoring & Audit Portal | Complete 10-Function Audit Hub";
    initMonitoringPage();
    return cleanup;
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
