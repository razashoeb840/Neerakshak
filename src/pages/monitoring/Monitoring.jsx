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
                <span className="tag-italic">Reconciliation</span> <span className="tag-dot">•</span> <span className="tag-italic">Pinned Directives</span> <span className="tag-dot">•</span> <span className="tag-italic tag-cyan">Area Lifecycle Tracing</span>
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
      {/* LEFT 6-SECTION STREAMLINED RAIL */}
      <aside className="left-rail">
        <button className="rail-btn mon-nav-btn active" data-tab="dashboard" onClick={(e) => window.switchMonitorTab('dashboard', e.currentTarget)} title="Audit & Communication Command Center">
          <i className="fas fa-comments"></i>
          <span>Comms & Hub</span>
        </button>
        <button className="rail-btn mon-nav-btn" data-tab="tracing" onClick={(e) => window.switchMonitorTab('tracing', e.currentTarget)} title="Area-Wise Lifecycle Tracing">
          <i className="fas fa-route"></i>
          <span>Tracing</span>
          <span className="rail-badge-count count-cyan" id="navTracingCount">0</span>
        </button>
        <button className="rail-btn mon-nav-btn" data-tab="reconciliation" onClick={(e) => window.switchMonitorTab('reconciliation', e.currentTarget)} title="Resource Reconciliation">
          <i className="fas fa-scale-balanced"></i>
          <span>Reconcile</span>
        </button>
        <button className="rail-btn mon-nav-btn" data-tab="discrepancies" onClick={(e) => window.switchMonitorTab('discrepancies', e.currentTarget)} title="Shortages & Discrepancies">
          <i className="fas fa-triangle-exclamation"></i>
          <span>Shortages</span>
          <span className="rail-badge-count count-red" id="navDiscCount">0</span>
        </button>
        <button className="rail-btn mon-nav-btn" data-tab="returns" onClick={(e) => window.switchMonitorTab('returns', e.currentTarget)} title="Asset Returns Audit">
          <i className="fas fa-rotate-left"></i>
          <span>Returns</span>
        </button>
        <button className="rail-btn mon-nav-btn" data-tab="logs" onClick={(e) => window.switchMonitorTab('logs', e.currentTarget)} title="Cross-Portal Member Logs">
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
        {/* 4-KPI SUMMARY STRIP */}
        <div className="kpi-grid-4 anim-card" id="monitorKpiGrid"></div>

        {/* ===============================================================
            TAB 1: COMMUNICATION & BROADCAST COMMAND CENTER (REPLACES MAP)
            =============================================================== */}
        <div className="mo-tab-pane active" id="tab-dashboard">
          <div className="aqua-card anim-card" style={{ padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-tower-broadcast" style={{ color: "var(--river-blue)" }}></i>
                  State Inter-Portal Communication & Pinned Announcement Center
                </h2>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Direct chat with individual member portals OR publish pinned state emergency directives across all 5 portals + public.
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
              {/* Target Portal Channel Selector */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button className="channel-tab active" style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', borderRadius: '8px' }} onClick={(e) => window.switchChatChannel('ground', e.currentTarget)}>
                  <i className="fas fa-person-military-rifle"></i> Ground Officer (Field Units)
                </button>
                <button className="channel-tab" style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', borderRadius: '8px' }} onClick={(e) => window.switchChatChannel('godown', e.currentTarget)}>
                  <i className="fas fa-warehouse"></i> Central Godown Manager
                </button>
                <button className="channel-tab" style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', borderRadius: '8px' }} onClick={(e) => window.switchChatChannel('authority', e.currentTarget)}>
                  <i className="fas fa-building-columns"></i> District Authority (DDMA)
                </button>
                <button className="channel-tab" style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', borderRadius: '8px' }} onClick={(e) => window.switchChatChannel('admin', e.currentTarget)}>
                  <i className="fas fa-satellite-dish"></i> State Admin (GIS Command)
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
                    <i className="fas fa-circle" style={{ fontSize: '8px' }}></i> Encrypted Official Channel
                  </span>
                </div>

                {/* Message Feed Container */}
                <div id="centerChatFeed" style={{ minHeight: '220px', maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px' }}></div>

                {/* Quick Directive Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <button type="button" className="quick-chip-btn" onClick={() => window.insertQuickChat('Verify delivery headcount and supply count on site.')}>Verify Delivery</button>
                  <button type="button" className="quick-chip-btn" onClick={() => window.insertQuickChat('Clarify warehouse gate shortage before departure.')}>Check Shortage</button>
                  <button type="button" className="quick-chip-btn" onClick={() => window.insertQuickChat('Requesting NDRF escort confirmation for convoy.')}>Confirm Escort</button>
                  <button type="button" className="quick-chip-btn" onClick={() => window.insertQuickChat('Confirm post-rescue return restock status in warehouse.')}>Confirm Restock</button>
                </div>

                {/* Chat Send Form */}
                <form onSubmit={(e) => window.sendChatMessage(e)} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    id="centerChatMessageInput"
                    placeholder="Type official directive / message to selected portal officer..."
                    style={{ flex: 1, padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    required
                  />
                  <button type="submit" className="btn-mo" style={{ padding: '0 20px', background: '#0284c7', color: '#fff', borderColor: '#0284c7' }}>
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
                    Announcements published here will be permanently PINNED to the top of Admin, Authority, Godown, Ground Officer, and Public Citizen portals until you unpin them.
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

              {/* Active Pinned Announcements List */}
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
            TAB 2: AREA-WISE FULL LIFECYCLE TRACING
            =============================================================== */}
        <div className="mo-tab-pane" id="tab-tracing">
          <div className="aqua-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-timeline" style={{ color: "var(--river-cyan)" }}></i>
                {" End-to-End Area Lifecycle Audit Tracing"}
              </h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Filter Area:</span>
                <select id="tracingAreaSelect" className="hero-district-select" style={{ background: '#0284c7', color: '#fff', padding: '4px 10px', borderRadius: '6px' }} onChange={(e) => { if (window.filterTracingArea) window.filterTracingArea(e.currentTarget.value); }}>
                  <option value="ALL">All Flood Sectors</option>
                </select>
              </div>
            </div>
            <div id="areaTracingContainer"></div>
          </div>
        </div>

        {/* ===============================================================
            TAB 3: RECONCILIATION TABLE
            =============================================================== */}
        <div className="mo-tab-pane" id="tab-reconciliation">
          <div className="aqua-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-scale-balanced" style={{ color: "var(--indigo-audit)" }}></i>
                {" Resource Lifecycle Reconciliation (Approved vs Dispatched vs Received)"}
              </h2>
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
            TAB 4: DISCREPANCIES & SHORTAGES
            =============================================================== */}
        <div className="mo-tab-pane" id="tab-discrepancies">
          <div className="aqua-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-triangle-exclamation" style={{ color: "#dc2626" }}></i>
                {" Active Shortages, Mismatches & Authority Escalations"}
              </h2>
            </div>
            <div className="grid-2 switchable-collection" id="fullDiscrepancyGrid"></div>
          </div>
        </div>

        {/* ===============================================================
            TAB 5: ASSET RETURNS & RESTOCK
            =============================================================== */}
        <div className="mo-tab-pane" id="tab-returns">
          <div className="aqua-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-rotate-left" style={{ color: "var(--teal-water)" }}></i>
                {" Post-Operation Relief Consignment Returns Audit"}
              </h2>
            </div>
            <div className="table-wrap">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Resource Item</th>
                    <th>Dispatched Unit</th>
                    <th>Returned (Good)</th>
                    <th>Damaged</th>
                    <th>Missing</th>
                    <th>Restock Status</th>
                  </tr>
                </thead>
                <tbody id="returnAuditBody"></tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===============================================================
            TAB 6: MULTI-AGENCY CROSS-PORTAL ACTIVITY LOGS
            =============================================================== */}
        <div className="mo-tab-pane" id="tab-logs">
          <div className="aqua-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-clock-rotate-left" style={{ color: "var(--navy-deep)" }}></i>
                {" Cross-Portal Member Activity Logs & Area Impact Trace"}
              </h2>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Chronological actions of Admin, Authority, Godown, and Ground Officer with affected Area & Impact
              </div>
            </div>
            <div className="grid-2 switchable-collection" id="fullActivityLogsGrid"></div>
          </div>
        </div>
      </main>

      {/* RIGHT PANEL: ACTIONS, INSPECTOR & TELEMETRY */}
      <aside className="right-panel">
        {/* Quick Actions with Real, Functioning Buttons */}
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
              <strong>Escalate</strong>
              <span>Flag Shortage</span>
            </button>
            <button type="button" className="qa-color-card qa-indigo" onClick={() => window.exportAuditSitrepReport()}>
              <i className="fas fa-file-csv"></i>
              <strong>Export SITREP</strong>
              <span>Download CSV</span>
            </button>
          </div>
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
            <strong>NEERAKSHAK State DEOC Monitoring & Audit Portal</strong> • Full Resource Lifecycle Tracing & Accountability
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
    document.title = "NEERAKSHAK – State Monitoring & Audit Portal | Communication & Lifecycle Tracing";
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
