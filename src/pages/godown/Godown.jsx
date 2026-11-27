import { useEffect } from 'react';
import css from './godown.css?inline';
import '../../components/interportalChat.css';
import initGodownPage from './godown.legacy.js';
import { setupRouteGuard } from '../../auth';

// Static markup, created once so React never re-renders over what the page script builds.
const markup = (
  <>
      {/* 1. DIAGONAL SPLIT WAREHOUSE & LOGISTICS BANNER */}
      {/* COMMAND HERO BANNER (MATCHING ADMIN & AUTHORITY APPEARANCE) */}
      <header className="gd-hero-banner anim-card">
        <div className="gd-banner-img-wrap">
          <img src="/image.png" alt={"NEERAKSHAK District Flood Relief Supply Central Godown & Logistics Hub"} className="gd-banner-img" />
        </div>
        <div className="gd-banner-vignette"></div>
        <div className="gd-hero-inner">
          <div className="banner-top-bar">
            {/* Brand Lockup with Godown Manager badge */}
            <div className="hero-brand-lockup">
              <div className="hero-vertical-pillar"></div>
              <div className="hero-brand-content">
                <div className="hero-brand-title-wrap">
                  <h1 className="hero-brand-title">
                    NEERA
                    <span className="hero-brand-cyan">KSHAK</span>
                  </h1>
                  <span className="hero-admin-badge">Godown Manager</span>
                </div>
                <div className="hero-brand-subtitle">{"Flood Relief Central Godown & Logistics Hub"}</div>
                <div className="hero-brand-tagline">
                  <span className="tag-italic">Store</span>
                  {" "}
                  <span className="tag-dot">•</span>
                  {" "}
                  <span className="tag-italic">Verify</span>
                  {" "}
                  <span className="tag-dot">•</span>
                  {" "}
                  <span className="tag-italic tag-cyan">Dispatch</span>
                </div>
              </div>
            </div>
            {/* Right HUD Action Controls matching Admin & Authority */}
            <div className="hero-action-controls">
              <div className="hero-ctrl-pill">
                <i className="fas fa-warehouse" style={{ color: "#38bdf8" }}></i>
                {" "}
                <select className="hero-district-select" id="warehouseSelector" onChange={(event) => window.renderAllGodownViews && window.renderAllGodownViews()}>
                  <option value="ALL">All District Godowns (Kamrup)</option>
                  <option value="Central Relief Godown – Mirza">Central Relief Godown – Mirza</option>
                  <option value="North Sector Warehouse – Rangia">North Sector Warehouse – Rangia</option>
                </select>
              </div>
              <div className="hero-ctrl-pill">
                <span className="hero-live-dot"></span>
                {" "}
                <span id="telemetryStatusText">Depot Active</span>
              </div>
              {/* SMOOTH SLIDE SWITCH FOR GRID VIEW vs LIST VIEW */}
              <div className="view-slide-switch" id="viewSlideSwitch" onClick={(event) => window.toggleGridListView && window.toggleGridListView()} title="Toggle Grid vs List View">
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
        </div>
      </header>

      {/* 2. THREE-COLUMN WORKSPACE SHELL (MATCHING ADMIN & AUTHORITY) */}
      <div className="workspace-shell">
        {/* LEFT 70px VERTICAL ICON RAIL */}
        <aside className="left-rail">
          <button className="rail-btn gd-nav-btn active" data-tab="dashboard" onClick={(event) => window.switchGodownTab('dashboard', event.currentTarget)} title="Depot Dashboard & Convoy Map">
            <i className="fas fa-gauge-high"></i>
            {" "}
            <span>Dashboard</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="inventory" onClick={(event) => window.switchGodownTab('inventory', event.currentTarget)} title="Warehouse Inventory">
            <i className="fas fa-boxes-stacked"></i>
            {" "}
            <span>Inventory</span>
            {" "}
            <span className="rail-badge-count" id="navInvCount">0</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="approved-req" onClick={(event) => window.switchGodownTab('approved-req', event.currentTarget)} title="Authority-Approved Allocations, Stock Verification & Convoy Dispatch">
            <i className="fas fa-clipboard-check"></i>
            {" "}
            <span>Approved</span>
            {" "}
            <span className="rail-badge-count count-amber" id="navApprovedCount">0</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="returns" onClick={(event) => window.switchGodownTab('returns', event.currentTarget)} title="Relief Returns Log">
            <i className="fas fa-rotate-left"></i>
            {" "}
            <span>Returns</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="low-stock" onClick={(event) => window.switchGodownTab('low-stock', event.currentTarget)} title="Stock Shortage Alerts">
            <i className="fas fa-triangle-exclamation"></i>
            {" "}
            <span>Alerts</span>
            {" "}
            <span className="rail-badge-count count-red" id="navLowStockCount">0</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="reports" onClick={(event) => window.switchGodownTab('reports', event.currentTarget)} title={"Reports & History"}>
            <i className="fas fa-file-lines"></i>
            {" "}
            <span>Reports</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="profile" onClick={(event) => window.switchGodownTab('profile', event.currentTarget)} title={"Profile & Settings"}>
            <i className="fas fa-user-gear"></i>
            {" "}
            <span>Settings</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="interportal-comms" onClick={(event) => window.switchGodownTab('interportal-comms', event.currentTarget)} title="Live Inter-Portal Multi-Agency Comms & Direct Dispatch">
            <i className="fas fa-tower-broadcast"></i>
            {" "}
            <span>Live Comms</span>
            {" "}
            <span className="rail-badge-count" id="godownCommsBadge" style={{ display: 'none' }}>0</span>
          </button>
          {" "}
          {/* Bottom Tools & Telemetry Sync Anchor */}
          <div className="rail-bottom-cluster">
            <div className="rail-divider"></div>
            <button className="rail-btn" onClick={(event) => { if (window.renderAllGodownViews) window.renderAllGodownViews(); if (window.showToast) window.showToast('Warehouse stock & dispatch telemetry synced'); }} title="Sync All Records">
              <i className="fas fa-arrows-rotate"></i>
              {" "}
              <span>Sync</span>
            </button>
            <div className="rail-pulse-wrap" title="Depot Socket Online">
              <span className="rail-online-dot"></span>
              {" "}
              <span className="rail-online-text">SYS OK</span>
            </div>
          </div>
        </aside>

        {/* CENTER STAGE (MATCHING ADMIN & AUTHORITY) */}
        <main className="center-stage">
          {/* 4-KPI OVERVIEW STRIP */}
          <div className="kpi-grid-4 anim-card" id="stockOverviewKpis"></div>

          {/* ===============================================================
                 TAB 1: PORTAL DASHBOARD (MAP + DISPATCH MANAGEMENT)
                 =============================================================== */}
          <div className="gd-tab-pane active" id="tab-dashboard">
            {/* COMPACT MAP VIEWPORT (310px HEIGHT - EXACT MATCH TO AUTHORITY/ADMIN) */}
            <div className="aqua-card anim-card" style={{ padding: "12px 14px", marginBottom: "14px" }}>
              <div className="card-head" style={{ marginBottom: "10px" }}>
                <h2>
                  <i className="fas fa-map-location-dot" style={{ color: "var(--river-blue)" }}></i>
                  {" District Relief Logistics & Convoy Route GIS Map"}
                </h2>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button className="btn-card-action" onClick={() => window.filterGodownMap && window.filterGodownMap('ALL')}>All Zones</button>
                  {" "}
                  <button className="btn-card-action" style={{ color: "#b91c1c" }} onClick={() => window.filterGodownMap && window.filterGodownMap('PENDING')}>Pending Dispatch</button>
                  {" "}
                  <button className="btn-card-action" style={{ color: "#15803d" }} onClick={() => window.filterGodownMap && window.filterGodownMap('DISPATCHED')}>Dispatched Convoys</button>
                  {" "}
                  <button className="btn-card-action" style={{ color: "#c2410c" }} onClick={() => window.filterGodownMap && window.filterGodownMap('CRITICAL')}>Critical Needs</button>
                </div>
              </div>
              <div id="godownMapSlot" style={{ position: "relative", height: "480px", borderRadius: "12px", overflow: "hidden", border: "1.5px solid var(--border-aqua)" }}>
                <div id="godownLeafletMap" style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 }}></div>
                <div className="map-float-search" style={{ zIndex: 10 }}>
                  <i className="fas fa-search" style={{ color: "#64748b" }}></i>
                  {" "}
                  <input type="text" placeholder="Search destination village, convoy..." onKeyUp={(event) => { if(event.key==='Enter' && window.searchGodownMap) window.searchGodownMap(event.currentTarget.value); }} />
                </div>
                <div className="map-legend-overlay" style={{ zIndex: 10 }}>
                  <span>
                    <i className="l-dot" style={{ background: "#0284c7" }}></i>
                    Depot Hubs
                  </span>
                  {" "}
                  <span>
                    <i className="l-dot" style={{ background: "#16a34a" }}></i>
                    Dispatched Convoy
                  </span>
                  {" "}
                  <span>
                    <i className="l-dot" style={{ background: "#dc2626" }}></i>
                    Admin/Authority Area
                  </span>
                </div>
                <div className="map-zoom-controls" style={{ zIndex: 1000, pointerEvents: "auto" }}>
                  <button type="button" className="map-z-btn" onClick={() => window.godownMapZoomIn && window.godownMapZoomIn()} title="Zoom In">+</button>
                  {" "}
                  <button type="button" className="map-z-btn" onClick={() => window.godownMapZoomOut && window.godownMapZoomOut()} title="Zoom Out">−</button>
                  {" "}
                  <button type="button" className="map-z-btn" onClick={() => window.godownMapRecenter && window.godownMapRecenter()} title="Recenter">
                    <i className="fas fa-crosshairs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
                 TAB 2: INVENTORY MANAGEMENT & INLINE ADD STOCK
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-inventory">
            {/* INLINE COLLAPSIBLE ADD NEW STOCK CARD */}
            <div className="aqua-card anim-card" id="addNewStockCard" style={{ marginBottom: "14px", display: "none" }}>
              <div className="card-head">
                <h2>
                  <i className="fas fa-plus-circle" style={{ color: "var(--foliage-mid)" }}></i>
                  {" Add New Emergency Stock to Warehouse Inventory"}
                </h2>
                <button className="btn-gd" onClick={() => { const el = document.getElementById('addNewStockCard'); if (el) el.style.display = 'none'; }}>
                  <i className="fas fa-times"></i> Close Form
                </button>
              </div>
              <form onSubmit={(event) => window.handleAddNewStock && window.handleAddNewStock(event)}>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Resource Name *</label>
                    <input type="text" id="newStockName" className="form-control" placeholder="e.g. Inflatable Motorized Rescue Boat" required />
                  </div>
                  <div className="form-group">
                    <label>Resource Category *</label>
                    <select id="newStockCat" className="form-control">
                      <option value="Rescue Boats">Rescue Boats</option>
                      <option value="Life Jackets">Life Jackets</option>
                      <option value="Food Packets">Food Packets</option>
                      <option value="Drinking Water">Drinking Water</option>
                      <option value="Medicines">Medicines</option>
                      <option value="First Aid Kits">First Aid Kits</option>
                      <option value="Rescue Equipment">Rescue Equipment</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity Received *</label>
                    <input type="number" id="newStockQty" className="form-control" min="1" placeholder="e.g. 50" required />
                  </div>
                </div>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Warehouse / Godown Location *</label>
                    <select id="newStockWarehouse" className="form-control">
                      <option value="Central Relief Godown – Mirza">Central Relief Godown – Mirza</option>
                      <option value="North Sector Warehouse – Rangia">North Sector Warehouse – Rangia</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Received Date *</label>
                    <input type="date" id="newStockDate" className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>Supplier / Government Source *</label>
                    <input type="text" id="newStockSupplier" className="form-control" placeholder="e.g. State SDMA Central Supply" required />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Minimum Low-Stock Alert Limit *</label>
                    <input type="number" id="newStockMin" className="form-control" min="1" defaultValue="20" required />
                  </div>
                  <div className="form-group">
                    <label>Batch / Equipment ID Notes</label>
                    <input type="text" id="newStockNotes" className="form-control" placeholder="e.g. Inspected & sealed in Bay B-4" />
                  </div>
                </div>
                <button type="submit" className="btn-gd primary" style={{ padding: "10px 18px", fontSize: "12.5px" }}>
                  <i className="fas fa-check-circle"></i>
                  {" Record Stock Entry & Update Inventory"}
                </button>
              </form>
            </div>

            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-boxes-stacked" style={{ color: "var(--river-blue)" }}></i>
                  {" Complete Warehouse Inventory & Stock Corrections"}
                </h2>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <select id="invCategoryFilter" className="form-control" style={{ padding: "5px 10px", fontSize: "11.5px", width: "auto" }} onChange={(event) => window.renderAllGodownViews && window.renderAllGodownViews()}>
                    <option value="ALL">All Categories</option>
                    <option value="Rescue Boats">Rescue Boats</option>
                    <option value="Life Jackets">Life Jackets</option>
                    <option value="Food Packets">Food Packets</option>
                    <option value="Drinking Water">Drinking Water</option>
                    <option value="Medicines">Medicines</option>
                    <option value="First Aid Kits">First Aid Kits</option>
                    <option value="Rescue Equipment">Rescue Equipment</option>
                  </select>
                  <button className="btn-gd primary" onClick={() => window.toggleAddStockCard && window.toggleAddStockCard()}>
                    <i className="fas fa-plus"></i>
                    {" + Add New Stock"}
                  </button>
                </div>
              </div>
              <div className="grid-3 switchable-collection" id="fullInventoryCardGrid"></div>
            </div>
          </div>

          {/* ===============================================================
                 TAB 3: APPROVED ALLOCATIONS, VERIFICATION & DISPATCH (MERGED UNIFIED TAB)
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-approved-req">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-clipboard-check" style={{ color: "var(--river-blue)" }}></i>
                  {" Authority-Approved Allocations, Physical Verification & Convoy Dispatch"}
                </h2>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button className="btn-card-action" onClick={() => window.filterApprovedTab && window.filterApprovedTab('ALL')}>All Allocations</button>
                  <button className="btn-card-action" style={{ color: "#b91c1c" }} onClick={() => window.filterApprovedTab && window.filterApprovedTab('PENDING')}>Pending Dispatch</button>
                  <button className="btn-card-action" style={{ color: "#15803d" }} onClick={() => window.filterApprovedTab && window.filterApprovedTab('DISPATCHED')}>Dispatched Convoys</button>
                  <button className="btn-card-action" style={{ color: "#ea580c" }} onClick={() => window.filterApprovedTab && window.filterApprovedTab('SHORTAGE')}>Flagged Shortages</button>
                </div>
              </div>
              <div style={{ background: "#eef6fd", borderLeft: "3.5px solid var(--river-blue)", padding: "8px 12px", borderRadius: "8px", fontSize: "11.5px", color: "var(--navy-deep)", marginBottom: "12px" }}>
                <strong>Unified Lifecycle Flow:</strong>
                {" District Authority assesses and approves allocations for flood areas. Godown Manager verifies physical warehouse stock, reports shortages if supplies fall short, and dispatches convoys with gate-pass generation. "}
              </div>
              <div className="grid-2 switchable-collection" id="fullApprovedReqGrid"></div>
            </div>
          </div>

          {/* ===============================================================
                 TAB 6: RETURN MANAGEMENT (DISPATCHED AREA RECONCILIATION)
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-returns">
            <div className="aqua-card" style={{ marginBottom: "14px" }}>
              <div className="card-head">
                <h2>
                  <i className="fas fa-rotate-left" style={{ color: "var(--teal-water)" }}></i>
                  {" Post-Operation Relief Consignment Returns Intake"}
                </h2>
                <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                  Select an Area that received resources to reconcile and log returned units
                </span>
              </div>
              <div style={{ background: "#f0fdf4", borderLeft: "3.5px solid #16a34a", padding: "8px 12px", borderRadius: "8px", fontSize: "11.5px", color: "#14532d", marginBottom: "12px" }}>
                <strong>Intake & Verification Rule:</strong>
                {" Tap any dispatched area below. Units verified in "}
                <strong>Good</strong>
                {" condition automatically restock to Available inventory. Ground Officer will verify receipt acknowledgement."}
              </div>

              {/* LIST OF DISPATCHED AREAS */}
              <div id="returnsDispatchedAreasList" style={{ marginBottom: "12px" }}></div>

              {/* AREA RETURN INTAKE FORM (APPEARS ON TAPPING AN AREA) */}
              <div id="areaReturnIntakeCard" style={{ display: "none", background: "#f8fafc", border: "1.5px solid #93c5fd", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}></div>
            </div>

            {/* AUDITED RETURN RECORDS */}
            <div className="aqua-card">
              <div className="card-head" style={{ marginBottom: "10px" }}>
                <h3>
                  <i className="fas fa-clipboard-check" style={{ color: "var(--river-blue)" }}></i>
                  {" Recorded Post-Operation Returns Audit Trail"}
                </h3>
              </div>
              <div className="grid-3 switchable-collection" id="returnsCardGrid"></div>
            </div>
          </div>

          {/* ===============================================================
                 TAB 7: LOW STOCK ALERTS
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-low-stock">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-triangle-exclamation" style={{ color: "#dc2626" }}></i>
                  {" Low-Stock & Out-of-Stock Threshold Monitor"}
                </h2>
              </div>
              <div className="grid-3 switchable-collection" id="lowStockCardsGrid"></div>
            </div>
          </div>

          {/* ===============================================================
                 TAB 8: REPORTS & INVENTORY MOVEMENT HISTORY
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-reports">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-file-lines" style={{ color: "var(--river-blue)" }}></i>
                  {" Warehouse Reports & Stock Movement Audit"}
                </h2>
                <button className="btn-gd primary" onClick={(event) => window.showToast && window.showToast('Warehouse Stock, Dispatch & Damage Report exported.')}>
                  <i className="fas fa-download"></i>
                  {" Export Warehouse Report"}
                </button>
              </div>
              <div className="grid-3" id="reportSummaryCards" style={{ marginBottom: "14px" }}></div>
              {/* AREA-WISE RELIEF INVENTORY & RECONCILIATION REPORT */}
              <div id="areaWiseInventoryReportContainer" style={{ marginBottom: "20px" }}></div>
              <div className="grid-3 switchable-collection" id="movementLogsCardGrid"></div>
            </div>
          </div>

          {/* ===============================================================
                 TAB 9: PROFILE & SETTINGS
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-profile">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-user-gear" style={{ color: "var(--navy-deep)" }}></i>
                  {" Godown Manager Profile & Warehouse Permissions"}
                </h2>
              </div>
              <div className="grid-2">
                <div className="sub-card tone-purple">
                  <h4>Warehouse Custodian Profile</h4>
                  <div className="meta-box">
                    <span>
                      {"Role: "}
                      <strong>District Godown Manager</strong>
                    </span>
                    {" "}
                    <span>
                      {"Primary Hub: "}
                      <strong>Central Relief Godown – Mirza</strong>
                    </span>
                    {" "}
                    <span>
                      {"Stock & Dispatch: "}
                      <strong>Authorized</strong>
                    </span>
                    {" "}
                    <span>
                      {"Request Approval: "}
                      <strong>Restricted (Authority Only)</strong>
                    </span>
                  </div>
                </div>
                <div className="sub-card tone-good">
                  <h4>Delivery Verification Separation</h4>
                  <p style={{ margin: "0", fontSize: "11.5px", color: "var(--text-body)" }}>
                    {" Marking a consignment as "}
                    <strong>Dispatched</strong>
                    {" generates a gate-pass reference number. Physical receipt at the relief camp is independently verified by the "}
                    <strong>Ground Officer</strong>
                    {". "}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
                 TAB 10: INTER-PORTAL REAL-TIME COMMS & DISPATCH CHAT
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-interportal-comms">
            <div id="portalChatMount_godown"></div>
          </div>
        </main>

        {/* RIGHT PANEL (QUICK ACTIONS + SELECTED ALLOCATION INSPECTOR + RIVER TELEMETRY) */}
        <aside className="right-panel">
          {/* Quick Actions matching Admin & Authority */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-bolt" style={{ color: "#f59e0b" }}></i>
                {" Godown Quick Actions"}
              </h2>
            </div>
            <div className="qa-grid-2x2">
              <button className="qa-color-card qa-blue" onClick={() => window.openFirstPendingDispatch && window.openFirstPendingDispatch()}>
                <i className="fas fa-truck-fast"></i>
                <strong>Prepare Dispatch</strong>
                <span>Gate-pass & vehicle</span>
              </button>
              <button className="qa-color-card qa-green" onClick={() => window.toggleAddStockCard && window.toggleAddStockCard()}>
                <i className="fas fa-plus-circle"></i>
                <strong>+ Add Stock</strong>
                <span>New SDMA delivery</span>
              </button>
              <button className="qa-color-card qa-amber" onClick={() => window.switchGodownTab('approved-req', document.querySelector('[data-tab=approved-req]'))}>
                <i className="fas fa-magnifying-glass-check"></i>
                <strong>Verify & Dispatch</strong>
                <span>Check against orders</span>
              </button>
              <button className="qa-color-card qa-indigo" onClick={() => window.openReturnModal && window.openReturnModal()}>
                <i className="fas fa-rotate-left"></i>
                <strong>Log Return</strong>
                <span>Inspect field return</span>
              </button>
            </div>
          </div>

          {/* Selected Allocation & Convoy Inspector (Matching Authority's Selected Village Box) */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-location-crosshairs" style={{ color: "#dc2626" }}></i>
                {" Selected Allocation Order"}
              </h2>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--river-blue)", cursor: "pointer" }} onClick={() => window.switchGodownTab('approved-req', document.querySelector('[data-tab=approved-req]'))}>View All →</span>
            </div>
            <div id="rightSelectedAllocBox">
              <div style={{ textAlign: "center", padding: "18px", color: "var(--text-muted)", fontSize: "11.5px" }}>
                Tap any allocation card or map pin to inspect and dispatch.
              </div>
            </div>
          </div>

          {/* Logistics Corridor River Water-Level Gauge Card (CWC & GloFAS) */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-water" style={{ color: "var(--river-blue)" }}></i>
                {" Supply Route River Telemetry"}
              </h2>
            </div>
            <div id="rightCorridorRiverBox"></div>
          </div>

          {/* Depot System Status */}
          <div className="aqua-card anim-card">
            <div className="card-head">
              <h2>
                <i className="fas fa-warehouse" style={{ color: "var(--foliage-mid)" }}></i>
                {" Depot System Sync"}
              </h2>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-body)", lineHeight: "1.5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>DDMA Authority Sync:</span>
                <strong style={{ color: "#16a34a" }}>Connected (Live)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>Field Officer Verification:</span>
                <strong style={{ color: "#0284c7" }}>Active (VHF & Net)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Central Logistics Hub:</span>
                <strong>Mirza (Loading Bay 2)</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. RIPARIAN HILLS & RIVER FOOTER */}
      <div className="riparian-footer-wrap">
        <div className="footer-scenic-banner">
          <img src="/footer.jpg" alt="Misty Brahmaputra River Basin Landscape" className="footer-scenic-img" />
          <div className="footer-scenic-blend"></div>
        </div>
        <div className="riparian-footer-bar">
          <div className="footer-flex">
            <span>
              <strong>NEERAKSHAK Godown Manager Portal</strong>
              {" • Physical Relief Inventory, Stock Verification & Approved Resource Dispatches"}
            </span>
            {" "}
            <span>
              {"Workflow: Admin Marks Area → Authority Assesses & Allocates → Godown Verifies & Dispatches → Field Ground Officer Receives"}
            </span>
          </div>
        </div>
      </div>

      {/* DISPATCH MODAL */}
      <div className="modal-overlay" id="dispatchModal" onClick={(event) => window.closeModal && window.closeModal('dispatchModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>
              <i className="fas fa-truck-fast" style={{ color: "var(--river-blue)" }}></i>
              {" Prepare & Dispatch Approved Allocation"}
            </h3>
            <button onClick={() => window.closeModal && window.closeModal('dispatchModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.confirmDispatchSubmission && window.confirmDispatchSubmission(event)}>
            <input type="hidden" id="dispAllocIndex" />
            <input type="hidden" id="dispAllocId" />
            <div id="dispAllocSummary" style={{ background: "#f0f7fe", padding: "9px 11px", borderRadius: "8px", fontSize: "12px", marginBottom: "10px" }}></div>
            
            {/* AUTHORITY DESIGNATED LEAD OFFICER & VERIFICATION */}
            <div id="dispOfficerVerificationBox" style={{ background: "#ecfeff", border: "1.5px solid #a5f3fc", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#0e7490" }}>
                  <i className="fas fa-id-badge" style={{ marginRight: "5px" }}></i>
                  Authority Designated Escort / Receiving Officer:
                </span>
                <span className="pill p-good" id="dispOfficerAgencyPill" style={{ fontSize: "9.5px", padding: "2px 7px" }}>NDRF Verified</span>
              </div>
              <div id="dispOfficerDetailsText" style={{ fontSize: "11.5px", color: "#155e75", marginBottom: "6px" }}>
                Officer: <strong id="dispOfficerName">Insp. Rajesh Kalita</strong> • Service ID: <strong id="dispOfficerId">NDRF-1BN-842</strong>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#0e7490", cursor: "pointer", fontWeight: "600" }}>
                <input type="checkbox" id="dispOfficerVerifiedCheck" defaultChecked style={{ cursor: "pointer" }} />
                <span>Verified Handover: Authority designated officer confirmed present at depot loading gate</span>
              </label>
            </div>

            {/* CONFIRM LOADED RESOURCE QUANTITIES & INVENTORY STOCK VALIDATION */}
            <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--navy-deep)", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><i className="fas fa-boxes-stacked" style={{ color: "var(--river-blue)", marginRight: "5px" }}></i> Confirm Dispatched Resource Quantities *</span>
                <span style={{ fontSize: "10.5px", color: "#dc2626", fontWeight: "700" }} id="dispStockWarningMsg"></span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "2px" }}>
                    <span style={{ fontWeight: "700" }}>Boats</span>
                    <span id="dispBoatsStockLabel" style={{ color: "#0284c7", fontWeight: "600" }}>Avail: 30</span>
                  </div>
                  <input type="number" id="dispBoatsInput" className="form-control" min="0" required />
                  <div style={{ fontSize: "9.5px", color: "var(--text-muted)", marginTop: "2px" }} id="dispBoatsReqLabel">Req: 3</div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "2px" }}>
                    <span style={{ fontWeight: "700" }}>Life Jackets</span>
                    <span id="dispJacketsStockLabel" style={{ color: "#0284c7", fontWeight: "600" }}>Avail: 500</span>
                  </div>
                  <input type="number" id="dispJacketsInput" className="form-control" min="0" required />
                  <div style={{ fontSize: "9.5px", color: "var(--text-muted)", marginTop: "2px" }} id="dispJacketsReqLabel">Req: 33</div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "2px" }}>
                    <span style={{ fontWeight: "700" }}>Food Packets</span>
                    <span id="dispFoodStockLabel" style={{ color: "#0284c7", fontWeight: "600" }}>Avail: 3500</span>
                  </div>
                  <input type="number" id="dispFoodInput" className="form-control" min="0" required />
                  <div style={{ fontSize: "9.5px", color: "var(--text-muted)", marginTop: "2px" }} id="dispFoodReqLabel">Req: 264</div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "2px" }}>
                    <span style={{ fontWeight: "700" }}>Medicine Kits</span>
                    <span id="dispMedsStockLabel" style={{ color: "#0284c7", fontWeight: "600" }}>Avail: 750</span>
                  </div>
                  <input type="number" id="dispMedsInput" className="form-control" min="0" required />
                  <div style={{ fontSize: "9.5px", color: "var(--text-muted)", marginTop: "2px" }} id="dispMedsReqLabel">Req: 44</div>
                </div>
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Assigned Vehicle Number *</label>
                <input type="text" id="dispVehicleInput" className="form-control" placeholder="e.g. AS-01-GC-4821" required />
              </div>
              <div className="form-group">
                <label>Driver Name & Contact *</label>
                <input type="text" id="dispDriverInput" className="form-control" placeholder="e.g. Rajesh Das (+91 98640-21943)" required />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Destination Location *</label>
                <input type="text" id="dispDestInput" className="form-control" required />
              </div>
              <div className="form-group">
                <label>{"Dispatch Date & Time *"}</label>
                <input type="datetime-local" id="dispDateTimeInput" className="form-control" required />
              </div>
            </div>
            <button type="submit" className="btn-gd primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "12.5px" }}>
              <i className="fas fa-receipt"></i>
              {" Confirm Dispatch & Generate Reference No."}
            </button>
          </form>
        </div>
      </div>

      {/* UPDATE STOCK MODAL */}
      <div className="modal-overlay" id="updateStockModal" onClick={(event) => window.closeModal && window.closeModal('updateStockModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>{"Update Inventory & Condition"}</h3>
            <button onClick={() => window.closeModal && window.closeModal('updateStockModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitStockCorrection && window.submitStockCorrection(event)}>
            <input type="hidden" id="updInvIndex" />
            <div id="updInvTitle" style={{ fontWeight: "700", fontSize: "13px", color: "var(--navy-deep)", marginBottom: "10px" }}></div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Updated Available Quantity *</label>
                <input type="number" id="updAvailQty" className="form-control" min="0" required />
              </div>
              <div className="form-group">
                <label>Stock Condition *</label>
                <select id="updCondition" className="form-control">
                  <option value="Good">Good / Ready</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Damaged / Expired">Damaged / Expired</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Mandatory Stock Correction Reason *</label>
              <input type="text" id="updReason" className="form-control" placeholder="e.g. Physical audit adjustment / damaged seal removed" required />
            </div>
            <button type="submit" className="btn-gd primary" style={{ width: "100%", justifyContent: "center", padding: "10px" }}>Save Inventory Correction</button>
          </form>
        </div>
      </div>

      {/* RETURN INSPECTION MODAL */}
      <div className="modal-overlay" id="returnModal" onClick={(event) => window.closeModal && window.closeModal('returnModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>Record Post-Operation Returned Resources</h3>
            <button onClick={() => window.closeModal && window.closeModal('returnModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitReturnRecord && window.submitReturnRecord(event)}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Resource Item *</label>
                <select id="retResourceSel" className="form-control"></select>
              </div>
              <div className="form-group">
                <label>Returned From (Village / Camp) *</label>
                <input type="text" id="retFromLoc" className="form-control" placeholder="e.g. Palashbari Ward 2" required />
              </div>
            </div>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Good Qty (Restock)</label>
                <input type="number" id="retGoodQty" className="form-control" min="0" defaultValue="2" required />
              </div>
              <div className="form-group">
                <label>Damaged Qty</label>
                <input type="number" id="retDamagedQty" className="form-control" min="0" defaultValue="0" required />
              </div>
              <div className="form-group">
                <label>Missing Qty</label>
                <input type="number" id="retMissingQty" className="form-control" min="0" defaultValue="0" required />
              </div>
            </div>
            <button type="submit" className="btn-gd primary" style={{ width: "100%", justifyContent: "center", padding: "10px" }}>Verify Condition & Update Stock</button>
          </form>
        </div>
      </div>

      <div id="toast"></div>
  </>
);

export default function Godown() {
  useEffect(() => {
    const cleanup = setupRouteGuard('godown');
    document.title = "NEERAKSHAK – Godown Manager Portal | Logistics, Map & Real-Time Dispatch";
    initGodownPage();
    return cleanup;
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
