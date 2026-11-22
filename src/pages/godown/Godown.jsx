import { useEffect } from 'react';
import css from './godown.css?inline';
import initGodownPage from './godown.legacy.js';

// Static markup, created once so React never re-renders over what the page script builds.
const markup = (
  <>
      {/* 1. DIAGONAL SPLIT WAREHOUSE & LOGISTICS BANNER */}
      {" "}
      {/* COMMAND HERO BANNER (EXACT SAME IMAGE & APPEARANCE MATCHING 2ADMIN & SCREENSHOT) */}
      <header className="gd-hero-banner anim-card">
        {/* 1. Full Panoramic Artwork matching 2admin.html & image.png */}
        <div className="gd-banner-img-wrap">
          <img src="/image.png" alt={"NEERAKSHAK District Flood Relief Supply Central Godown & Logistics Hub"} className="gd-banner-img" />
        </div>
        <div className="gd-banner-vignette"></div>
        {/* 2. Single-Row Balanced Content Inner (Exact same appearance as Admin / Screenshot) */}
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
            {/* Right HUD Action Controls matching Screenshot & 2admin.html */}
            <div className="hero-action-controls">
              <div className="hero-ctrl-pill">
                <i className="fas fa-warehouse" style={{ color: "#38bdf8" }}></i>
                {" "}
                <select className="hero-district-select" id="warehouseSelector" onChange={(event) => window.renderAllGodownViews()}>
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
              <button className="hero-btn-action" id="dataModeBtn" onClick={(event) => window.toggleDataMode()} title="Toggle simulated drill data">
                <i className="fas fa-database"></i>
                {" Reference Drill "}
              </button>
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
        {/* LEFT 10-SECTION SIDEBAR */}
        {" "}
        {/* 70px VERTICAL ICON RAIL: MATCHED TO 2ADMIN.HTML & 3AUTHORITY.HTML */}
        <aside className="left-rail">
          <button className="rail-btn gd-nav-btn active" data-tab="dashboard" onClick={(event) => window.switchGodownTab('dashboard', event.currentTarget)} title="Depot Dashboard">
            <i className="fas fa-gauge-high"></i>
            {" "}
            <span>Dashboard</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="inventory" onClick={(event) => window.switchGodownTab('inventory', event.currentTarget)} title="Inventory Management">
            <i className="fas fa-boxes-stacked"></i>
            {" "}
            <span>Inventory</span>
            {" "}
            <span className="rail-badge-count" id="navInvCount">0</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="add-stock" onClick={(event) => window.switchGodownTab('add-stock', event.currentTarget)} title="Add New Stock">
            <i className="fas fa-plus-circle"></i>
            {" "}
            <span>Add Stock</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="approved-req" onClick={(event) => window.switchGodownTab('approved-req', event.currentTarget)} title="Approved Requests">
            <i className="fas fa-clipboard-check"></i>
            {" "}
            <span>Approved</span>
            {" "}
            <span className="rail-badge-count count-amber" id="navApprovedCount">0</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="verification" onClick={(event) => window.switchGodownTab('verification', event.currentTarget)} title="Verify Stock Quality">
            <i className="fas fa-magnifying-glass-check"></i>
            {" "}
            <span>Verify</span>
          </button>
          {" "}
          <button className="rail-btn gd-nav-btn" data-tab="dispatch" onClick={(event) => window.switchGodownTab('dispatch', event.currentTarget)} title="Dispatch Management">
            <i className="fas fa-truck-fast"></i>
            {" "}
            <span>Dispatch</span>
            {" "}
            <span className="rail-badge-count count-red" id="navPendingDispCount">0</span>
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
          {/* Bottom Tools & Telemetry Sync Anchor */}
          <div className="rail-bottom-cluster">
            <div className="rail-divider"></div>
            <button className="rail-btn" onClick={(event) => { window.renderAllGodownViews(); window.showToast('Warehouse stock & dispatch telemetry synced'); }} title="Sync All Records">
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
        <main className="main-content-col">
          {/* COLORFUL 6-KPI STOCK OVERVIEW STRIP */}
          <div className="kpi-grid-6 anim-card" id="stockOverviewKpis"></div>
          {/* ===============================================================
                 TAB 1: PORTAL DASHBOARD
                 =============================================================== */}
          <div className="gd-tab-pane active" id="tab-dashboard">
            {/* DISPATCH MANAGEMENT CARDS */}
            <div className="aqua-card anim-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-truck-fast" style={{ color: "var(--river-blue)" }}></i>
                  {" Dispatch Management – Authority-Approved Destination Allocations"}
                </h2>
                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                  <button className="btn-gd" onClick={(event) => window.switchGodownTab('verification', document.querySelector('[data-tab=verification]'))}>
                    <i className="fas fa-check-double"></i>
                    {" Verify Stock"}
                  </button>
                  {" "}
                  <button className="btn-gd primary" onClick={(event) => window.switchGodownTab('add-stock', document.querySelector('[data-tab=add-stock]'))}>
                    <i className="fas fa-plus"></i>
                    {" Add New Stock"}
                  </button>
                </div>
              </div>
              <div className="grid-2 switchable-collection" id="dashDispatchCardGrid"></div>
            </div>
            {/* WAREHOUSE INVENTORY CARDS */}
            <div className="aqua-card anim-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-boxes-stacked" style={{ color: "var(--navy-deep)" }}></i>
                  {" Warehouse Stock Overview (Available, Allocated & Dispatched)"}
                </h2>
                <button className="btn-gd" onClick={(event) => window.switchGodownTab('inventory', document.querySelector('[data-tab=inventory]'))}>Full Inventory →</button>
              </div>
              <div className="grid-3 switchable-collection" id="dashInventoryCardGrid"></div>
            </div>
            {/* LOW STOCK & RECENT MOVEMENTS */}
            <div className="grid-2">
              <div className="aqua-card anim-card">
                <div className="card-head">
                  <h2>
                    <i className="fas fa-triangle-exclamation" style={{ color: "#dc2626" }}></i>
                    {" Low Stock Alerts"}
                  </h2>
                  <button className="btn-gd" onClick={(event) => window.switchGodownTab('low-stock', document.querySelector('[data-tab=low-stock]'))}>Thresholds →</button>
                </div>
                <div className="grid-2 switchable-collection" id="dashLowStockGrid"></div>
              </div>
              <div className="aqua-card anim-card">
                <div className="card-head">
                  <h2>
                    <i className="fas fa-clock-rotate-left" style={{ color: "var(--river-blue)" }}></i>
                    {" Recent Stock Movements"}
                  </h2>
                </div>
                <div className="grid-2 switchable-collection" id="dashRecentActivityGrid"></div>
              </div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 2: INVENTORY MANAGEMENT & UPDATE INVENTORY
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-inventory">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-boxes-stacked" style={{ color: "var(--river-blue)" }}></i>
                  {" Complete Warehouse Inventory & Stock Corrections"}
                </h2>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <select id="invCategoryFilter" className="form-control" style={{ padding: "5px 10px", fontSize: "11.5px", width: "auto" }} onChange={(event) => window.renderAllGodownViews()}>
                    <option value="ALL">All Categories</option>
                    <option value="Rescue Boats">Rescue Boats</option>
                    <option value="Life Jackets">Life Jackets</option>
                    <option value="Food Packets">Food Packets</option>
                    <option value="Drinking Water">Drinking Water</option>
                    <option value="Medicines">Medicines</option>
                    <option value="First Aid Kits">First Aid Kits</option>
                    <option value="Rescue Equipment">Rescue Equipment</option>
                  </select>
                  {" "}
                  <button className="btn-gd primary" onClick={(event) => window.switchGodownTab('add-stock', document.querySelector('[data-tab=add-stock]'))}>
                    <i className="fas fa-plus"></i>
                    {" Add New Stock"}
                  </button>
                </div>
              </div>
              <div className="grid-3 switchable-collection" id="fullInventoryCardGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 3: ADD NEW STOCK
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-add-stock">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-plus-circle" style={{ color: "var(--foliage-mid)" }}></i>
                  {" Add New Emergency Stock to Warehouse Inventory"}
                </h2>
              </div>
              <form onSubmit={(event) => window.handleAddNewStock(event)}>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Resource Name *</label>
                    {" "}
                    <input type="text" id="newStockName" className="form-control" placeholder="e.g. Inflatable Motorized Rescue Boat" required />
                  </div>
                  <div className="form-group">
                    <label>Resource Category *</label>
                    {" "}
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
                    {" "}
                    <input type="number" id="newStockQty" className="form-control" min="1" placeholder="e.g. 50" required />
                  </div>
                </div>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Warehouse / Godown Location *</label>
                    {" "}
                    <select id="newStockWarehouse" className="form-control">
                      <option value="Central Relief Godown – Mirza">Central Relief Godown – Mirza</option>
                      <option value="North Sector Warehouse – Rangia">North Sector Warehouse – Rangia</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Received Date *</label>
                    {" "}
                    <input type="date" id="newStockDate" className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>Supplier / Government Source *</label>
                    {" "}
                    <input type="text" id="newStockSupplier" className="form-control" placeholder="e.g. State SDMA Central Supply" required />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Minimum Low-Stock Alert Limit *</label>
                    {" "}
                    <input type="number" id="newStockMin" className="form-control" min="1" defaultValue="20" required />
                  </div>
                  <div className="form-group">
                    <label>Batch / Equipment ID Notes</label>
                    {" "}
                    <input type="text" id="newStockNotes" className="form-control" placeholder={"e.g. Inspected & sealed in Bay B-4"} />
                  </div>
                </div>
                <button type="submit" className="btn-gd primary" style={{ padding: "10px 18px", fontSize: "12.5px" }}>
                  <i className="fas fa-check-circle"></i>
                  {" Record Stock Entry & Update Inventory "}
                </button>
              </form>
            </div>
          </div>
          {/* ===============================================================
                 TAB 4: APPROVED RESOURCE REQUESTS
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-approved-req">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-clipboard-check" style={{ color: "var(--river-blue)" }}></i>
                  {" Authority-Approved Resource Allocations by Village / Area"}
                </h2>
              </div>
              <div style={{ background: "#eef6fd", borderLeft: "3.5px solid var(--river-blue)", padding: "8px 12px", borderRadius: "8px", fontSize: "11.5px", color: "var(--navy-deep)", marginBottom: "12px" }}>
                <strong>Role Separation Rule:</strong>
                {" Only District Authority approves or rejects requests. Godown Manager verifies physical stock availability and dispatches approved quantities. "}
              </div>
              <div className="grid-2 switchable-collection" id="fullApprovedReqGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 5: STOCK VERIFICATION
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-verification">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-magnifying-glass-chart" style={{ color: "var(--river-blue)" }}></i>
                  {" Pre-Dispatch Physical Stock Verification & Shortage Alert"}
                </h2>
              </div>
              <div className="grid-2 switchable-collection" id="stockVerificationGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 6: DISPATCH MANAGEMENT
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-dispatch">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-truck-fast" style={{ color: "var(--river-blue)" }}></i>
                  {" Dispatch Management & Gate-Pass Receipts"}
                </h2>
              </div>
              <div className="grid-2 switchable-collection" id="fullDispatchCardGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 7: RETURN MANAGEMENT
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-returns">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-rotate-left" style={{ color: "var(--teal-water)" }}></i>
                  {" Post-Operation Returned Resources Inspection"}
                </h2>
                <button className="btn-gd primary" onClick={(event) => window.openReturnModal()}>
                  <i className="fas fa-plus"></i>
                  {" Log Returned Resources"}
                </button>
              </div>
              <div style={{ background: "#f0fdf4", borderLeft: "3.5px solid #16a34a", padding: "8px 12px", borderRadius: "8px", fontSize: "11.5px", color: "#14532d", marginBottom: "12px" }}>
                <strong>Inventory Integrity Rule:</strong>
                {" Only returned units verified in "}
                <strong>Good</strong>
                {" condition are added back to Available Stock. Damaged and Missing units are logged separately for audit. "}
              </div>
              <div className="grid-3 switchable-collection" id="returnsCardGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 8: LOW STOCK ALERTS
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
                 TAB 9: REPORTS & INVENTORY MOVEMENT HISTORY
                 =============================================================== */}
          <div className="gd-tab-pane" id="tab-reports">
            <div className="aqua-card">
              <div className="card-head">
                <h2>
                  <i className="fas fa-file-lines" style={{ color: "var(--river-blue)" }}></i>
                  {" Warehouse Reports & Stock Movement Audit"}
                </h2>
                <button className="btn-gd primary" onClick={(event) => window.showToast('Warehouse Stock, Dispatch & Damage Report exported.')}>
                  <i className="fas fa-download"></i>
                  {" Export Warehouse Report"}
                </button>
              </div>
              <div className="grid-3" id="reportSummaryCards" style={{ marginBottom: "14px" }}></div>
              <div className="grid-3 switchable-collection" id="movementLogsCardGrid"></div>
            </div>
          </div>
          {/* ===============================================================
                 TAB 10: PROFILE & SETTINGS
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
        </main>
      </div>
      {/* 3. RIPARIAN HILLS & RIVER FOOTER */}
      {" "}
      {/* RIPARIAN PANORAMIC FOOTER (MATCHED TO ADMIN, AUTHORITY & GROUND OFFICER) */}
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
              {"Workflow: DDMA Authority Approves → Godown Verifies & Dispatches → Field NDRF/SDRF Receives"}
            </span>
          </div>
        </div>
      </div>
      <div className="modal-overlay" id="dispatchModal" onClick={(event) => window.closeModal('dispatchModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>
              <i className="fas fa-truck-fast" style={{ color: "var(--river-blue)" }}></i>
              {" Prepare & Dispatch Approved Allocation"}
            </h3>
            <button onClick={(event) => window.closeModal('dispatchModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.confirmDispatchSubmission(event)}>
            <input type="hidden" id="dispAllocIndex" />
            <div id="dispAllocSummary" style={{ background: "#f0f7fe", padding: "9px 11px", borderRadius: "8px", fontSize: "12px", marginBottom: "10px" }}></div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Dispatch Quantity *</label>
                {" "}
                <input type="number" id="dispQtyInput" className="form-control" min="1" required />
              </div>
              <div className="form-group">
                <label>Transport Vehicle Number *</label>
                {" "}
                <input type="text" id="dispVehicleInput" className="form-control" placeholder="e.g. AS-01-GC-4821" required />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Destination Location *</label>
                {" "}
                <input type="text" id="dispDestInput" className="form-control" required />
              </div>
              <div className="form-group">
                <label>{"Dispatch Date & Time *"}</label>
                {" "}
                <input type="datetime-local" id="dispDateTimeInput" className="form-control" required />
              </div>
            </div>
            <button type="submit" className="btn-gd primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "12.5px" }}>
              <i className="fas fa-receipt"></i>
              {" Confirm Dispatch & Generate Reference No. "}
            </button>
          </form>
        </div>
      </div>
      <div className="modal-overlay" id="updateStockModal" onClick={(event) => window.closeModal('updateStockModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>{"Update Inventory & Condition"}</h3>
            <button onClick={(event) => window.closeModal('updateStockModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitStockCorrection(event)}>
            <input type="hidden" id="updInvIndex" />
            <div id="updInvTitle" style={{ fontWeight: "700", fontSize: "13px", color: "var(--navy-deep)", marginBottom: "10px" }}></div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Updated Available Quantity *</label>
                {" "}
                <input type="number" id="updAvailQty" className="form-control" min="0" required />
              </div>
              <div className="form-group">
                <label>Stock Condition *</label>
                {" "}
                <select id="updCondition" className="form-control">
                  <option value="Good">Good / Ready</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Damaged / Expired">Damaged / Expired</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Mandatory Stock Correction Reason *</label>
              {" "}
              <input type="text" id="updReason" className="form-control" placeholder="e.g. Physical audit adjustment / damaged seal removed" required />
            </div>
            <button type="submit" className="btn-gd primary" style={{ width: "100%", justifyContent: "center", padding: "10px" }}>Save Inventory Correction</button>
          </form>
        </div>
      </div>
      <div className="modal-overlay" id="returnModal" onClick={(event) => window.closeModal('returnModal')}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>Record Post-Operation Returned Resources</h3>
            <button onClick={(event) => window.closeModal('returnModal')} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(event) => window.submitReturnRecord(event)}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Resource Item *</label>
                {" "}
                <select id="retResourceSel" className="form-control"></select>
              </div>
              <div className="form-group">
                <label>Returned From (Village / Camp) *</label>
                {" "}
                <input type="text" id="retFromLoc" className="form-control" placeholder="e.g. Palashbari Ward 2" required />
              </div>
            </div>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Good Qty (Restock)</label>
                {" "}
                <input type="number" id="retGoodQty" className="form-control" min="0" defaultValue="2" required />
              </div>
              <div className="form-group">
                <label>Damaged Qty</label>
                {" "}
                <input type="number" id="retDamagedQty" className="form-control" min="0" defaultValue="0" required />
              </div>
              <div className="form-group">
                <label>Missing Qty</label>
                {" "}
                <input type="number" id="retMissingQty" className="form-control" min="0" defaultValue="0" required />
              </div>
            </div>
            <button type="submit" className="btn-gd primary" style={{ width: "100%", justifyContent: "center", padding: "10px" }}>{"Verify Condition & Update Stock"}</button>
          </form>
        </div>
      </div>
      <div id="toast"></div>
  </>
);

export default function Godown() {
  useEffect(() => {
    document.title = "NEERAKSHAK – Godown Manager Portal | Colorful Inventory & Dispatch";
    initGodownPage();
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
