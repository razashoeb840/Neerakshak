import { useEffect } from 'react';
import css from './admin.css?inline';
import initAdminPage from './admin.legacy.js';
import { setupRouteGuard } from '../../auth';

// Static markup, created once so React never re-renders over what the page script builds.
const markup = (
  <>
      {/* COMPACT HIGH-DEFINITION COMMAND HERO BANNER (IMAGE 2 BRANDING + IMAGE 1 CONTROLS) */}
      <header className="admin-hero-banner">
        <div className="admin-banner-img-wrap">
          <img src="/img.png" alt="NEERAKSHAK Flood Relief Management System Admin Banner" className="admin-banner-img" />
        </div>
        <div className="admin-banner-vignette"></div>
        <div className="admin-hero-inner">
          <div className="banner-top-bar">
            {/* Image 2 Lockup with "Admin" badge */}
            <div className="hero-brand-lockup">
              <div className="hero-vertical-pillar"></div>
              <div className="hero-brand-content">
                <div className="hero-brand-title-wrap">
                  <h1 className="hero-brand-title">
                    NEERA
                    <span className="hero-brand-cyan">KSHAK</span>
                  </h1>
                  <span className="hero-admin-badge" id="heroBasinBadge">Admin • Bihar (Kosi Basin)</span>
                </div>
                <div className="hero-brand-subtitle">Flood Relief Management System</div>
                <div className="hero-brand-tagline">
                  <span className="tag-italic">Monitor</span>
                  {" "}
                  <span className="tag-dot">•</span>
                  {" "}
                  <span className="tag-italic">Coordinate</span>
                  {" "}
                  <span className="tag-dot">•</span>
                  {" "}
                  <span className="tag-italic tag-cyan">Rescue</span>
                </div>
              </div>
            </div>
            {/* Blended Options from Image 1: Frosted Glass HUD Controls */}
            <div className="hero-action-controls">
              <div className="hero-ctrl-pill">
                <i className="fas fa-location-dot" style={{ color: "#38bdf8" }}></i>
                {" "}
                <select
                  className="hero-district-select"
                  id="heroDistrictSelect"
                  defaultValue="katihar-sadar"
                  onChange={(event) => window.switchMonitoringDistrict && window.switchMonitoringDistrict(event.currentTarget.value)}
                >
                  <optgroup id="heroDistrictOptgroup" label="Bihar — Kosi River Basin (6 Sectors Assigned)">
                    <option value="katihar-sadar">Katihar Sadar Sector (Kosi River)</option>
                    <option value="kursela-sangam">Kursela Confluence (Kosi &amp; Ganga)</option>
                    <option value="purnia-east">Purnia East Lowland (Saura &amp; Kosi)</option>
                    <option value="birpur-barrage">Birpur Barrage Sector (Kosi Main Barrage)</option>
                    <option value="saharsa-basin">Saharsa Lowland Belt (Tilyuga &amp; Kosi)</option>
                    <option value="supaul-embankment">Supaul Embankment Sector (Kosi Western Embankment)</option>
                  </optgroup>
                </select>
              </div>
              <div className="hero-ctrl-pill">
                <span className="hero-live-dot"></span>
                {" "}
                <span id="telemetryStatusText">Live Monitoring</span>
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
      {/* 3. MAIN WORKSPACE (LEFT ICON RAIL | CENTER MAP + GRID CARDS | RIGHT PANEL) */}
      <div className="workspace-shell">
        {/* LEFT VERTICAL RAIL: EXTENDED HEIGHT & FLUSH ALIGNMENT */}
        <aside className="left-rail">
          <button className="rail-btn active" onClick={(event) => window.switchTab('map-hub', event.currentTarget)} title="GIS Command Map Viewport">
            <i className="fas fa-map-location-dot"></i>
            {" "}
            <span>{"Map & GIS"}</span>
          </button>
          {" "}
          <button className="rail-btn" onClick={(event) => window.switchTab('areas-grid', event.currentTarget)} title={"Marked Flood Zones & Villages"}>
            <i className="fas fa-draw-polygon"></i>
            {" "}
            <span>Flood Zones</span>
          </button>
          {" "}
          <button className="rail-btn" onClick={(event) => window.switchTab('rivers-weather', event.currentTarget)} title={"River Gauges & Rain Radar"}>
            <i className="fas fa-water"></i>
            {" "}
            <span>Rivers/Rain</span>
          </button>
          {" "}
          <button className="rail-btn" onClick={(event) => window.switchTab('alerts-grid', event.currentTarget)} title="Public Alert Broadcasts">
            <i className="fas fa-bell"></i>
            {" "}
            <span>Alerts</span>
          </button>
          {" "}
          <button className="rail-btn" onClick={(event) => window.switchTab('facilities-grid', event.currentTarget)} title={"Emergency Camps & Facilities"}>
            <i className="fas fa-hospital-user"></i>
            {" "}
            <span>Facilities</span>
          </button>
          {" "}
          {/* Bottom Tools & Telemetry Sync Anchor */}
          <div className="rail-bottom-cluster">
            <div className="rail-divider"></div>
            <button className="rail-btn" onClick={(event) => { window.renderAllCards(); window.showToast('Telemetry & map layers refreshed'); }} title="Sync All Records">
              <i className="fas fa-arrows-rotate"></i>
              {" "}
              <span>Sync</span>
            </button>
            <div className="rail-pulse-wrap" title="GIS Socket Online">
              <span className="rail-online-dot"></span>
              {" "}
              <span className="rail-online-text">API LIVE</span>
            </div>
          </div>
        </aside>
        {/* CENTER STAGE */}
        <main className="center-stage">
          {/* 4-KPI CARDS GRID */}
          <div className="kpi-grid-4 anim-card" id="adminKpiGrid"></div>
          {/* TAB 1: COMPACT MAP VIEWPORT + MAP DATA MAINTENANCE CARDS */}
          <div className="tab-view-pane active" id="tab-map-hub">
            <div className="aqua-card anim-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-map-location-dot" style={{ color: "var(--river-blue)" }}></i>
                  {" District GIS Flood Map Viewport"}
                </h2>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button className="card-action-btn" onClick={(event) => window.openAreaModal()}>
                    <i className="fas fa-plus"></i>
                    {" Add Map Marker"}
                  </button>
                  {" "}
                  <button className="card-action-btn" onClick={(event) => window.switchTab('areas-grid', document.querySelectorAll('.rail-btn')[1])}>
                    <i className="fas fa-sliders"></i>
                    {" Maintain Map Data"}
                  </button>
                </div>
              </div>
              {/* LIVE LEAFLET GIS FLOOD MAP VIEWPORT */}
              <div id="mapViewportSlot">
                <div id="leafletMap" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}></div>

                {/* Interactive Map Location Pick Banner */}
                <div id="mapPickBanner" className="map-pick-banner" style={{ display: "none" }}>
                  <i className="fas fa-crosshairs fa-spin" style={{ color: "#ef4444", fontSize: "16px" }}></i>
                  <span><strong>Pinning Mode Active:</strong> Click anywhere on the map to set zone GPS coordinates</span>
                  <button type="button" className="btn-cancel-pick" onClick={() => window.cancelMapPick && window.cancelMapPick()}>Cancel</button>
                </div>

                <div className="map-float-search" style={{ zIndex: 500 }}>
                  <i className="fas fa-search" style={{ color: "#64748b" }}></i>
                  {" "}
                  <input
                    type="text"
                    id="mapFloatSearch"
                    placeholder="Search village, river, basin..."
                    onKeyUp={(event) => {
                      if (window.searchMapLocation) {
                        window.searchMapLocation(event.currentTarget.value);
                      }
                    }}
                  />
                </div>
                <div className="map-float-tools" style={{ zIndex: 500 }}>
                  <button className="map-tool-pill" onClick={() => window.triggerPinZoneMode ? window.triggerPinZoneMode() : window.openAreaModal()} title="Pin flood zone coordinates on GIS map">
                    <i className="fas fa-map-pin" style={{ color: "#dc2626" }}></i>
                    {" Pin Flood Zone"}
                  </button>
                  {" "}
                  <button className="map-tool-pill" onClick={() => window.triggerPinFacilityMode ? window.triggerPinFacilityMode() : window.openFacilityModal()} title="Pin emergency hospital/camp on map">
                    <i className="fas fa-hospital" style={{ color: "#16a34a" }}></i>
                    {" Pin Facility"}
                  </button>
                </div>

                <div className="map-legend-pill" style={{ zIndex: 500 }}>
                  <span style={{ cursor: "pointer" }} onClick={() => window.setSeverityFilter && window.setSeverityFilter('ALL')} title="Show All Zones">
                    All
                  </span>
                  {" "}
                  <span style={{ cursor: "pointer" }} onClick={() => window.setSeverityFilter && window.setSeverityFilter('Critical')} title="Filter Critical Risk Zones">
                    <i className="l-dot" style={{ background: "#dc2626" }}></i>
                    Critical
                  </span>
                  {" "}
                  <span style={{ cursor: "pointer" }} onClick={() => window.setSeverityFilter && window.setSeverityFilter('High')} title="Filter High Risk Zones">
                    <i className="l-dot" style={{ background: "#f97316" }}></i>
                    High
                  </span>
                  {" "}
                  <span style={{ cursor: "pointer" }} onClick={() => window.setSeverityFilter && window.setSeverityFilter('Moderate')} title="Filter Moderate Risk Zones">
                    <i className="l-dot" style={{ background: "#eab308" }}></i>
                    Moderate
                  </span>
                  {" "}
                  <span style={{ cursor: "pointer" }} onClick={() => window.setSeverityFilter && window.setSeverityFilter('Normal')} title="Filter Normal Risk Zones">
                    <i className="l-dot" style={{ background: "#16a34a" }}></i>
                    Normal
                  </span>
                </div>
                <div className="map-zoom-group" style={{ zIndex: 500 }}>
                  <button className="z-mini-btn" onClick={() => window.mapZoomIn && window.mapZoomIn()} title="Zoom In">+</button>
                  {" "}
                  <button className="z-mini-btn" onClick={() => window.mapZoomOut && window.mapZoomOut()} title="Zoom Out">−</button>
                  {" "}
                  <button className="z-mini-btn" onClick={() => window.mapRecenter && window.mapRecenter()} title="Recenter District View">
                    <i className="fas fa-crosshairs"></i>
                  </button>
                </div>
              </div>
            </div>
            {/* MAP DATA MAINTENANCE GRID CARDS */}
            <div className="aqua-card anim-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-layer-group" style={{ color: "var(--foliage-mid)" }}></i>
                  {" Map Data Maintenance – Marked Flood Zones & Severity"}
                </h2>
                <button className="card-action-btn" onClick={(event) => window.openAreaModal()}>
                  <i className="fas fa-plus-circle"></i>
                  {" Mark New Area"}
                </button>
              </div>
              <div className="cards-grid-2" id="mapZonesCardGrid"></div>
            </div>
          </div>
          {/* TAB 2: ALL FLOOD ZONES & SEVERITY GRID */}
          <div className="tab-view-pane" id="tab-areas-grid">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-draw-polygon" style={{ color: "var(--river-blue)" }}></i>
                  {" Flood-Affected Villages & Severity Classification"}
                </h2>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <select id="sevFilter" className="form-control" style={{ padding: "4px 10px", fontSize: "11.5px", width: "auto" }} onChange={(event) => window.renderAllCards()}>
                    <option value="ALL">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Normal">Normal</option>
                  </select>
                  {" "}
                  <button className="card-action-btn" onClick={(event) => window.openAreaModal()}>
                    <i className="fas fa-plus"></i>
                    {" Add Flood Zone"}
                  </button>
                </div>
              </div>
              <div className="cards-grid-2" id="fullAreasCardGrid"></div>
            </div>
          </div>
          {/* TAB 3: RIVERS & WEATHER GRID */}
          <div className="tab-view-pane" id="tab-rivers-weather">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-water" style={{ color: "var(--river-blue)" }}></i>
                  {" River Water-Level vs Danger Level Cards"}
                </h2>
                <button className="card-action-btn" onClick={(event) => window.openRiverModal()}>
                  <i className="fas fa-pen"></i>
                  {" Log River Reading"}
                </button>
              </div>
              <div className="cards-grid-3" id="fullRiversCardGrid"></div>
            </div>
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-cloud-showers-heavy" style={{ color: "var(--river-blue)" }}></i>
                  {" District Weather & Rainfall Telemetry"}
                </h2>
                <button className="card-action-btn" onClick={(event) => window.openWeatherModal()}>
                  <i className="fas fa-sliders"></i>
                  {" Update Weather"}
                </button>
              </div>
              <div className="kpi-grid-4" id="weatherCardGrid"></div>
            </div>
          </div>
          {/* TAB 4: FLOOD ALERTS GRID */}
          <div className="tab-view-pane" id="tab-alerts-grid">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-bullhorn" style={{ color: "#dc2626" }}></i>
                  {" Published Public Flood Alerts & Warnings"}
                </h2>
                <button className="card-action-btn" style={{ background: "#dc2626", color: "#fff", borderColor: "#dc2626" }} onClick={(event) => window.openAlertModal()}>
                  <i className="fas fa-plus"></i>
                  {" Publish Warning"}
                </button>
              </div>
              <div className="cards-grid-2" id="fullAlertsCardGrid"></div>
            </div>
          </div>
          {/* TAB 5: EMERGENCY FACILITIES GRID */}
          <div className="tab-view-pane" id="tab-facilities-grid">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-hospital" style={{ color: "var(--foliage-mid)" }}></i>
                  {" Hospitals, Police Stations & Relief Camps"}
                </h2>
                <button className="card-action-btn" onClick={(event) => window.openFacilityModal()}>
                  <i className="fas fa-plus"></i>
                  {" Add Facility Marker"}
                </button>
              </div>
              <div className="cards-grid-3" id="fullFacilitiesCardGrid"></div>
            </div>
          </div>
        </main>
        {/* 4. RIGHT PANEL (NAVIGATION REMOVED + COLORFUL QUICK ACTIONS + LIVE TELEMETRY) */}
        <aside className="right-panel">
          {/* COLORFUL QUICK ACTIONS 2x2 GRID */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-bolt" style={{ color: "#f59e0b" }}></i>
                {" Admin Quick Actions"}
              </h2>
            </div>
            <div className="qa-grid-2x2">
              <button className="qa-color-card qa-river" onClick={(event) => window.openAreaModal()}>
                <i className="fas fa-map-pin"></i>
                {" "}
                <strong>Mark Flood Area</strong>
                {" "}
                <span>Add / update map zone</span>
              </button>
              {" "}
              <button className="qa-color-card qa-alert" onClick={(event) => window.openAlertModal()}>
                <i className="fas fa-bullhorn"></i>
                {" "}
                <strong>Publish Alert</strong>
                {" "}
                <span>Issue citizen warning</span>
              </button>
              {" "}
              <button className="qa-color-card qa-green" onClick={(event) => window.openRiverModal()}>
                <i className="fas fa-water"></i>
                {" "}
                <strong>Log River Level</strong>
                {" "}
                <span>Update gauge telemetry</span>
              </button>
              {" "}
              <button className="qa-color-card qa-amber" onClick={(event) => window.openFacilityModal()}>
                <i className="fas fa-hospital"></i>
                {" "}
                <strong>Add Facility</strong>
                {" "}
                <span>Hospital / Camp / Police</span>
              </button>
            </div>
          </div>
          {/* RIVER ACTIVITY CARDS */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-water" style={{ color: "var(--river-blue)" }}></i>
                {" River Activity"}
              </h2>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--river-blue)", cursor: "pointer" }} onClick={(event) => window.switchTab('rivers-weather', document.querySelectorAll('.rail-btn')[2])}>All Gauges →</span>
            </div>
            <div className="right-cards-grid" id="rightRiverCards"></div>
          </div>
          {/* ACTIVE ALERTS CARDS */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-triangle-exclamation" style={{ color: "#dc2626" }}></i>
                {" Active Alerts ("}
                <span id="rightAlertCount">0</span>
                )
              </h2>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--river-blue)", cursor: "pointer" }} onClick={(event) => window.switchTab('alerts-grid', document.querySelectorAll('.rail-btn')[3])}>Manage →</span>
            </div>
            <div className="right-cards-grid" id="rightAlertsCards"></div>
          </div>
          {/* NEARBY PUBLIC HELP 2x2 GRID */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-tree" style={{ color: "var(--foliage-mid)" }}></i>
                {" Nearby Public Help"}
              </h2>
            </div>
            <div className="help-grid-2x2">
              <div className="help-tile-box" onClick={(event) => window.switchTab('facilities-grid', document.querySelectorAll('.rail-btn')[4])}>
                <div className="help-badge-ic" style={{ background: "#dc2626" }}>
                  <i className="fas fa-hospital"></i>
                </div>
                <div>
                  <strong style={{ display: "block", fontSize: "11.5px", color: "var(--navy-deep)" }}>Hospital</strong>
                  {" "}
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }} id="rDistHosp">—</span>
                </div>
              </div>
              <div className="help-tile-box" onClick={(event) => window.switchTab('facilities-grid', document.querySelectorAll('.rail-btn')[4])}>
                <div className="help-badge-ic" style={{ background: "#0284c7" }}>
                  <i className="fas fa-shield"></i>
                </div>
                <div>
                  <strong style={{ display: "block", fontSize: "11.5px", color: "var(--navy-deep)" }}>Police Post</strong>
                  {" "}
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }} id="rDistPol">—</span>
                </div>
              </div>
              <div className="help-tile-box" onClick={(event) => window.switchTab('facilities-grid', document.querySelectorAll('.rail-btn')[4])}>
                <div className="help-badge-ic" style={{ background: "#16a34a" }}>
                  <i className="fas fa-campground"></i>
                </div>
                <div>
                  <strong style={{ display: "block", fontSize: "11.5px", color: "var(--navy-deep)" }}>Relief Camp</strong>
                  {" "}
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }} id="rDistCamp">—</span>
                </div>
              </div>
              <div className="help-tile-box" onClick={(event) => window.copyHelpline('112')}>
                <div className="help-badge-ic" style={{ background: "#f59e0b" }}>
                  <i className="fas fa-phone"></i>
                </div>
                <div>
                  <strong style={{ display: "block", fontSize: "11.5px", color: "var(--navy-deep)" }}>Helpline</strong>
                  {" "}
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>112 / 1077</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
      {/* 5. RIPARIAN HILLS, TREES & FLOWING RIVER FOOTER */}
      <div className="riparian-footer-wrap">
        <div className="footer-scenic-banner">
          <img src="/footer.jpg" alt="Misty Brahmaputra River Basin Landscape" className="footer-scenic-img" />
          <div className="footer-scenic-blend"></div>
        </div>
        <div className="riparian-footer-bar">
          <div className="footer-flex">
            <span>
              <strong>NEERAKSHAK Admin Portal</strong>
              {" • Flood Situational Awareness & GIS Data Management"}
            </span>
            {" "}
            <span>
              {"Admin Scope: Flood Maps, River Gauges, Weather & Warnings (Resource Allocation handled by District Authority)"}
            </span>
          </div>
        </div>
      </div>
      {/* =====================================================================
         MODALS FOR MAP DATA & TELEMETRY MAINTENANCE
         ===================================================================== */}
      <div className="modal-overlay" id="areaModal" onClick={(event) => window.closeModal('areaModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 id="areaModalHeading" style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>Mark / Update Flood Area on Map</h3>
            <button onClick={(event) => window.closeModal('areaModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.saveAreaRecord(event)}>
            <input type="hidden" id="editAreaIdx" value="-1" />

            {/* Auto-Detection Indicator Pill */}
            <div id="geoDetectBadge" style={{ display: "none", alignItems: "center", gap: "8px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "6px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", marginBottom: "12px" }}>
              <i className="fas fa-circle-check" style={{ color: "#10b981" }}></i>
              <span>Auto-detected from GIS coordinates.</span>
            </div>

            <div className="form-group" style={{ marginBottom: "14px", marginTop: "4px" }}>
              <button
                type="button"
                className="btn-pick-map-coords"
                id="btnPickOnMap"
                onClick={() => window.startMapPickMode && window.startMapPickMode()}
              >
                <i className="fas fa-location-crosshairs" style={{ color: "#0284c7", fontSize: "14px" }}></i>
                {" 📍 Click Map to Auto-Detect Location & River"}
              </button>
              <div id="lblMapPickStatus" style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", fontWeight: "600" }}>
                Click anywhere on the map: Village, Block, Coordinates & River Danger Level will be auto-filled!
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Village / Town / Sector Name *</label>
                {" "}
                <input type="text" id="inpAreaName" className="form-control" placeholder="Auto-detected or custom name" required />
              </div>
              <div className="form-group">
                <label>Block / District / Circle *</label>
                {" "}
                <input type="text" id="inpAreaBlock" className="form-control" placeholder="Auto-detected or custom circle" required />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Flood Severity *</label>
                {" "}
                <select id="inpAreaSev" className="form-control">
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
              <div className="form-group">
                <label>Est. Affected Population</label>
                {" "}
                <input type="number" id="inpAreaPop" className="form-control" defaultValue="2200" required />
              </div>
            </div>

            {/* River Basin & Danger Level Telemetry Box */}
            <div className="river-telemetry-box" style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: "10px", padding: "12px", marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ margin: 0, fontWeight: "800", color: "var(--navy-deep)", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <i className="fas fa-water" style={{ color: "#0284c7" }}></i>
                  <span>River Basin & Danger Level Telemetry</span>
                </label>
                <span id="lblRiverDangerStatus" className="sev-pill sev-critical" style={{ fontSize: "10px", padding: "2px 8px" }}>
                  Danger Breach
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "11px" }}>Associated River / Basin</label>
                <input type="text" id="inpAreaRiver" className="form-control" placeholder="e.g. Brahmaputra River / Ganga" defaultValue="Brahmaputra River" />
              </div>

              <div className="form-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: "11px" }}>Current Water Level (m) *</label>
                  <input type="number" step="0.1" id="inpRiverCur" className="form-control" defaultValue="18.2" onChange={() => window.calcRiverDangerStatus && window.calcRiverDangerStatus()} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: "11px" }}>Danger Mark Level (m) *</label>
                  <input type="number" step="0.1" id="inpRiverDanger" className="form-control" defaultValue="18.0" onChange={() => window.calcRiverDangerStatus && window.calcRiverDangerStatus()} required />
                </div>
              </div>

              <div id="lblDangerDiff" style={{ fontSize: "11px", color: "#dc2626", fontWeight: "700", marginTop: "6px" }}>
                ⚠️ River is +0.2 m ABOVE Danger Mark! Inundation risk active.
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Latitude</label>
                {" "}
                <input type="number" step="0.0001" id="inpAreaLat" className="form-control" defaultValue="26.1250" required />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                {" "}
                <input type="number" step="0.0001" id="inpAreaLng" className="form-control" defaultValue="91.5180" required />
              </div>
            </div>
            <div className="form-group">
              <label>{"Situation & Map Marker Notes *"}</label>
              {" "}
              <input type="text" id="inpAreaNotes" className="form-control" placeholder="e.g. Embankment waterlogging; boat access only" required />
            </div>
            <button type="submit" className="btn-save-primary">
              <i className="fas fa-check-circle"></i>
              {" Save Map Zone Record"}
            </button>
          </form>
        </div>
      </div>
      <div className="modal-overlay" id="alertModal" onClick={(event) => window.closeModal('alertModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "#b91c1c" }}>
              <i className="fas fa-bullhorn"></i>
              {" Publish Public Flood Warning"}
            </h3>
            <button onClick={(event) => window.closeModal('alertModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.saveAlertRecord(event)}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Target Location *</label>
                {" "}
                <input type="text" id="inpAlertLoc" className="form-control" placeholder="e.g. Chaygaon, North Kamrup" required />
              </div>
              <div className="form-group">
                <label>Severity Level *</label>
                {" "}
                <select id="inpAlertSev" className="form-control">
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Warning Headline *</label>
              {" "}
              <input type="text" id="inpAlertTitle" className="form-control" placeholder="e.g. River level approaching danger mark" required />
            </div>
            <div className="form-group">
              <label>Detailed Citizen Advisory *</label>
              {" "}
              <textarea id="inpAlertDesc" className="form-control" rows="3" placeholder="Safety instructions and relief shelter guidance..." required />
            </div>
            <button type="submit" className="btn-save-primary" style={{ background: "#dc2626" }}>Publish Flood Warning</button>
          </form>
        </div>
      </div>
      <div className="modal-overlay" id="riverModal" onClick={(event) => window.closeModal('riverModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>Log River Gauge Reading</h3>
            <button onClick={(event) => window.closeModal('riverModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.saveRiverReading(event)}>
            <div className="form-group">
              <label>River Station</label>
              {" "}
              <select id="inpRiverSelect" className="form-control"></select>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Current Water Level (m) *</label>
                {" "}
                <input type="number" step="0.1" id="inpRiverLevel" className="form-control" required />
              </div>
              <div className="form-group">
                <label>Flow Trend</label>
                {" "}
                <select id="inpRiverTrend" className="form-control">
                  <option value="Rising">Rising (↑)</option>
                  <option value="Steady">Steady (→)</option>
                  <option value="Falling">Falling (↓)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-save-primary">Update River Telemetry</button>
          </form>
        </div>
      </div>
      <div className="modal-overlay" id="weatherModal" onClick={(event) => window.closeModal('weatherModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>{"Update Rainfall & Weather Advisory"}</h3>
            <button onClick={(event) => window.closeModal('weatherModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.saveWeatherRecord(event)}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>24-Hr Rainfall</label>
                {" "}
                <input type="text" id="inpWeatherRain" className="form-control" defaultValue="78 mm (Heavy)" required />
              </div>
              <div className="form-group">
                <label>Weather Warning</label>
                {" "}
                <input type="text" id="inpWeatherAdv" className="form-control" defaultValue="Orange Alert – Heavy Rain" required />
              </div>
            </div>
            <button type="submit" className="btn-save-primary">Update Weather Telemetry</button>
          </form>
        </div>
      </div>
      <div className="modal-overlay" id="facilityModal" onClick={(event) => window.closeModal('facilityModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>Add Emergency Facility Marker</h3>
            <button onClick={(event) => window.closeModal('facilityModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.saveFacilityRecord(event)}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Facility Name *</label>
                {" "}
                <input type="text" id="inpFacName" className="form-control" placeholder="e.g. Chaygaon PHC" required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                {" "}
                <select id="inpFacCat" className="form-control">
                  <option value="Relief Camp">Relief Camp</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Police Station">Police Station</option>
                </select>
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Sector / Distance *</label>
                {" "}
                <input type="text" id="inpFacDist" className="form-control" placeholder="e.g. 2.1 km • Chaygaon" required />
              </div>
              <div className="form-group">
                <label>Helpline / Contact *</label>
                {" "}
                <input type="text" id="inpFacPhone" className="form-control" defaultValue="1077 / 108" required />
              </div>
            </div>
            <button type="submit" className="btn-save-primary">Save Facility Marker</button>
          </form>
        </div>
      </div>
      <div id="toast"></div>
  </>
);

export default function Admin() {
  useEffect(() => {
    const cleanup = setupRouteGuard('admin');
    document.title = "NEERAKSHAK – Admin Portal | River & Flood Ecological Command";
    initAdminPage();
    return cleanup;
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
