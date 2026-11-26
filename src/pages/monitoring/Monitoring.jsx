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
              <div className="hero-brand-subtitle">State DEOC Lifecycle Verification, End-to-End Tracing & Accountability</div>
              <div className="hero-brand-tagline">
                <span className="tag-italic">Audit</span> <span className="tag-dot">•</span> <span className="tag-italic">Reconcile</span> <span className="tag-dot">•</span> <span className="tag-italic tag-cyan">Area-Wise Tracing</span>
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
              <span id="telemetryStatusText">DEOC Audit Stream Live</span>
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
        <button className="rail-btn mon-nav-btn active" data-tab="dashboard" onClick={(e) => window.switchMonitorTab('dashboard', e.currentTarget)} title="Audit Dashboard">
          <i className="fas fa-gauge-high"></i>
          <span>Dashboard</span>
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
        <button className="rail-btn mon-nav-btn" data-tab="logs" onClick={(e) => window.switchMonitorTab('logs', e.currentTarget)} title="Audit Logs">
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
            TAB 1: DASHBOARD (GIS MAP HUB + SECTOR SURVEILLANCE)
            =============================================================== */}
        <div className="mo-tab-pane active" id="tab-dashboard">
          <div className="aqua-card anim-card" style={{ padding: '14px 14px 12px', marginBottom: '14px' }}>
            <div className="mo-map-header-bar">
              <h2>
                <i className="fas fa-map-location-dot" style={{ color: "var(--river-blue)" }}></i>
                {" State Flood Monitoring GIS Map – Live Sector Surveillance"}
              </h2>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="btn-mo" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => { if (window.filterMapSeverity) window.filterMapSeverity('ALL'); }}>All Sectors</button>
                <button type="button" className="btn-mo" style={{ padding: '4px 10px', fontSize: '11px', background: '#dc2626', color: '#fff', borderColor: '#b91c1c' }} onClick={() => { if (window.filterMapSeverity) window.filterMapSeverity('Critical'); }}>Critical Only</button>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div className="mo-map-search-wrap">
                <i className="fas fa-search" style={{ color: '#64748b', fontSize: '11px' }}></i>
                <input type="text" id="mapSearchInput" placeholder="Search sector, village, river..." onInput={(e) => { if (window.searchMapSector) window.searchMapSector(e.currentTarget.value); }} />
              </div>

              <div id="monitoringMapSlot"></div>

              <div className="mo-map-legend">
                <span><span className="legend-dot" style={{ background: '#dc2626' }}></span>Critical / Submerged</span>
                <span><span className="legend-dot" style={{ background: '#ea580c' }}></span>High Risk</span>
                <span><span className="legend-dot" style={{ background: '#eab308' }}></span>Moderate</span>
                <span><span className="legend-dot" style={{ background: '#16a34a' }}></span>Normal Access</span>
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
            TAB 6: AUDIT ACTIVITY LOGS
            =============================================================== */}
        <div className="mo-tab-pane" id="tab-logs">
          <div className="aqua-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-clock-rotate-left" style={{ color: "var(--navy-deep)" }}></i>
                {" Immutable Cross-Portal Lifecycle Activity Stream"}
              </h2>
            </div>
            <div className="grid-2 switchable-collection" id="fullActivityLogsGrid"></div>
          </div>
        </div>
      </main>

      {/* RIGHT PANEL: ACTIONS, INSPECTOR, TELEMETRY & AUDIT CHAT DOCK */}
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
            <button type="button" className="qa-color-card qa-blue" onClick={() => window.switchMonitorTab('tracing', document.querySelector('[data-tab=tracing]'))}>
              <i className="fas fa-route"></i>
              <strong>Trace Area</strong>
              <span>5-Stage Lifecycle</span>
            </button>
            <button type="button" className="qa-color-card qa-amber" onClick={() => window.switchMonitorTab('discrepancies', document.querySelector('[data-tab=discrepancies]'))}>
              <i className="fas fa-triangle-exclamation"></i>
              <strong>Escalate</strong>
              <span>Flag Shortage</span>
            </button>
            <button type="button" className="qa-color-card qa-green" onClick={() => { if (window.refreshMonitoringData) window.refreshMonitoringData(); }}>
              <i className="fas fa-arrows-rotate"></i>
              <strong>Sync DB</strong>
              <span>Live Re-Audit</span>
            </button>
            <button type="button" className="qa-color-card qa-indigo" onClick={() => { if (window.exportAuditReport) window.exportAuditReport(); }}>
              <i className="fas fa-file-pdf"></i>
              <strong>Audit SITREP</strong>
              <span>Export PDF/CSV</span>
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
              Tap any sector on the map or tracing card to inspect its full lifecycle telemetry.
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

        {/* INTER-PORTAL AUDIT CHAT DOCK */}
        <div className="chat-dock-panel anim-card">
          <div className="chat-dock-header">
            <h3>
              <i className="fas fa-comments"></i>
              {" Inter-Portal Audit Chat"}
            </h3>
            <span className="chat-online-pill">Live Sync</span>
          </div>

          <div className="chat-role-channels">
            <button className="channel-tab active" onClick={(e) => window.switchChatChannel('ground', e.currentTarget)}>Ground</button>
            <button className="channel-tab" onClick={(e) => window.switchChatChannel('godown', e.currentTarget)}>Godown</button>
            <button className="channel-tab" onClick={(e) => window.switchChatChannel('authority', e.currentTarget)}>Authority</button>
            <button className="channel-tab" onClick={(e) => window.switchChatChannel('admin', e.currentTarget)}>Admin</button>
          </div>

          <div className="chat-channel-context">
            <span id="chatChannelTitle">Channel: Ground Officer</span>
            <span style={{ fontSize: "9.5px", opacity: "0.85" }}>Audit Logged</span>
          </div>

          <div className="chat-messages-feed" id="chatMessagesFeed"></div>

          <div className="chat-quick-prompts">
            <button type="button" className="quick-chip-btn" onClick={() => window.insertQuickChat('Please verify the physical consignment receipt on ground.')}>Verify Delivery</button>
            <button type="button" className="quick-chip-btn" onClick={() => window.insertQuickChat('Clarify resource shortage recorded at sector gate.')}>Ask Shortage</button>
            <button type="button" className="quick-chip-btn" onClick={() => window.insertQuickChat('Confirm post-rescue return restock status.')}>Confirm Return</button>
          </div>

          <form className="chat-input-bar" onSubmit={(e) => window.sendChatMessage(e)}>
            <input type="text" id="chatMessageInput" placeholder="Message portal officer..." required />
            <button type="submit" className="chat-send-btn" title="Send Message">
              <i className="fas fa-paper-plane" style={{ fontSize: "12px" }}></i>
            </button>
          </form>
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
            Chain: Inundation Pin → Authority Allocation → Godown Dispatch → Ground Verification → Post-Rescue Restock
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
    document.title = "NEERAKSHAK – State Monitoring & Audit Portal | Area-Wise Lifecycle Tracing";
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
