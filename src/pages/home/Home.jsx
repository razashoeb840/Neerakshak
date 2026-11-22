import { useEffect } from 'react';
import css from './home.css?inline';
import initHomePage from './home.legacy.js';

// Static markup, created once so React never re-renders over what the page script builds.
const markup = (
  <>
      <div className="scroll-progress-bar" id="scrollProgressBar"></div>
      {/* NAVBAR (CLEAN WHITE GOVERNMENT BAR + IMAGE 1 LOGO) */}
      <nav className="navbar">
        <div className="nav-inner">
          <a href="#home" className="brand-logo" aria-label="NEERAKSHAK Home">
            {/* Circular Indian Emblem Seal from Image 1: Crest Lion, Saffron Arch, Sky, Hills, River Waves, Rescue Boat & Golden Laurel Wreath */}
            {" "}
            <svg className="brand-seal-svg" width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Ashoka Lion Crest on Top (Navy on White) */}
              <g fill="#072247" stroke="#072247" strokeWidth="0.5">
                <path d="M47 3 C47 1, 53 1, 53 3 L52 7 L48 7 Z"></path>
                <circle cx="50" cy="5" r="2.8"></circle>
                <rect x="46" y="7" width="8" height="2" rx="0.5" fill="#072247"></rect>
              </g>
              {/* Golden Laurel / Wheat Garland Outer Ring */}
              <path d="M22 25 C14 36 12 55 18 69 C24 81 36 91 50 92 C64 91 76 81 82 69 C88 55 86 36 78 25" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round"></path>
              <circle cx="21" cy="40" r="2.5" fill="#fbbf24"></circle>
              <circle cx="18" cy="55" r="2.5" fill="#fbbf24"></circle>
              <circle cx="22" cy="70" r="2.5" fill="#fbbf24"></circle>
              <circle cx="79" cy="40" r="2.5" fill="#fbbf24"></circle>
              <circle cx="82" cy="55" r="2.5" fill="#fbbf24"></circle>
              <circle cx="78" cy="70" r="2.5" fill="#fbbf24"></circle>
              {/* Saffron Arc Top Half */}
              <path d="M25 23 C33 13 41 10 50 10 C59 10 67 13 75 23" stroke="#f97316" strokeWidth="6" strokeLinecap="round"></path>
              {/* India Green Arc Bottom Half */}
              <path d="M30 84 C36 89 43 91 50 91 C57 91 64 89 70 84" stroke="#16a34a" strokeWidth="6" strokeLinecap="round"></path>
              {/* Inner Scenic Blue Sky */}
              <circle cx="50" cy="50" r="32" fill="#0369a1"></circle>
              {/* Sun & Clouds in Sky */}
              <circle cx="36" cy="34" r="5" fill="#fde047" opacity="0.95"></circle>
              <ellipse cx="64" cy="37" rx="8" ry="4" fill="#ffffff" opacity="0.85"></ellipse>
              <ellipse cx="58" cy="39" rx="5" ry="3" fill="#ffffff" opacity="0.7"></ellipse>
              {/* Lush Green Hills */}
              <path d="M22 56 L35 43 L46 53 L60 41 L78 56 Z" fill="#15803d"></path>
              <path d="M35 43 L40 48 L46 53 L60 41 L66 46 Z" fill="#22c55e" opacity="0.45"></path>
              {/* Flowing River Water Layers */}
              <path d="M18 60 C28 56 38 62 50 58 C62 54 72 60 82 56 L82 78 C72 82 62 76 50 80 C38 84 28 78 18 82 Z" fill="#0284c7"></path>
              <path d="M20 68 C30 65 40 71 50 67 C60 63 70 69 80 65" stroke="#7dd3fc" strokeWidth="2.2" strokeLinecap="round"></path>
              {/* Red Rescue Boat with Rescuers */}
              <path d="M35 66 L65 66 C63 73 59 75 50 75 C41 75 37 73 35 66 Z" fill="#dc2626"></path>
              <path d="M39 66 L61 66 C59 70 56 71.5 50 71.5 C44 71.5 41 70 39 66 Z" fill="#ffffff"></path>
              {/* Rescuers in Boat with Orange Safety Vests */}
              <circle cx="44" cy="62" r="2.2" fill="#f97316"></circle>
              <circle cx="50" cy="61.5" r="2.2" fill="#f97316"></circle>
              <circle cx="56" cy="62.5" r="2.2" fill="#f97316"></circle>
            </svg>
            {" "}
            {/* Wordmark from Image 1: Bold Italic Title in Navy + Flowing Dual Wave Swoosh */}
            <div className="brand-text-block">
              <div className="brand-wordmark-wrap">
                <span className="brand-title-text">NEERAKSHAK</span>
                {" "}
                {/* Dual Wave Swoosh: Cyan & Orange curved underlines */}
                {" "}
                <svg className="brand-swoosh-svg" viewBox="0 0 170 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Upper Sky Blue / Cyan Wave Swoosh */}
                  <path d="M2 4 C35 -2, 75 12, 120 5 C140 2, 155 6, 168 9" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round"></path>
                  {/* Lower Saffron / Amber Wave Swoosh */}
                  <path d="M48 10 C80 15, 118 12, 148 6 C156 4, 163 6, 168 9" stroke="#f97316" strokeWidth="2.6" strokeLinecap="round"></path>
                </svg>
              </div>
              <span className="brand-tagline-text">{"Integrated Flood Monitoring & Disaster Coordination Platform"}</span>
            </div>
          </a>
          {" "}
          {/* EXACT EXISTING NAVBAR OPTIONS (UNTOUCHED) */}
          <ul className="nav-links">
            <li>
              <a href="#home" className="active">
                <i className="fas fa-home"></i>
                {" Home"}
              </a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#flood-updates">Flood Updates</a>
            </li>
            <li>
              <a href="#preparedness">Safety Guide</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
          {/* Official Login Button (Image 3 Style: Dark Navy Button with Shield) */}
          {" "}
          <button className="btn-official-login" onClick={(event) => window.openLoginModal()}>
            <i className="fas fa-shield-alt"></i>
            {" Official Login "}
          </button>
        </div>
      </nav>
      {/* =====================================================================
         HERO SECTION WITH VIVID SCENIC BANNER & SITUATION CARD
         ===================================================================== */}
      <section className="hero-section" id="home">
        <div className="hero-banner-wrap">
          <img src="/Gemini_Generated_Image_q9w16bq9w16bq9w1.png" alt="NEERAKSHAK District Flood Monitoring Scenic Banner" className="hero-banner-img" />
        </div>
        <div className="hero-left-fade"></div>
        <div className="hero-inner">
          <div className="hero-copy reveal-left">
            <div className="tricolour-pillar"></div>
            <div>
              <h1>NEERAKSHAK</h1>
              <div className="hero-subtitle">
                {"District Flood Monitoring &"}
                <br />
                Disaster Coordination Platform
              </div>
              <p>
                {" Real-time river and weather monitoring, early warnings, resource coordination and citizen support — for safer, more resilient communities. "}
              </p>
              <div className="hero-buttons">
                <a href="#about" className="btn-hero-white">
                  <i className="fas fa-play" style={{ fontSize: "9px", color: "#072247" }}></i>
                  {" How It Works "}
                </a>
                {" "}
                <a href="#" onClick={(event) => { event.preventDefault(); window.openLiveMapModal(); }} className="btn-hero-navy">
                  {" Live Dashboard "}
                  <i className="fas fa-arrow-right" style={{ fontSize: "11px" }}></i>
                </a>
              </div>
            </div>
          </div>
          {/* Right Floating Card: Current Situation (Populated from seed.js) */}
          <div className="situation-card reveal-right">
            <div className="situation-header">
              <h3>
                <i className="far fa-user-circle" style={{ color: "#072247" }}></i>
                {" Current Situation"}
              </h3>
              <span className="status-live-solid">
                <span className="solid-dot"></span>
                {" Live"}
              </span>
            </div>
            {/* Dynamic River Telemetry List populated from seed.js */}
            <div className="situation-rivers-list" id="seedRiverList"></div>
          </div>
        </div>
      </section>
      {/* =====================================================================
         MAIN DASHBOARD WRAPPER
         ===================================================================== */}
      <main className="main-wrap" id="flood-updates">
        {/* CONTINUOUS SCROLLING LIVE NEWS BULLETIN TICKER */}
        <div className="news-ticker-bar reveal-up">
          <div className="ticker-badge-live">
            <i className="fas fa-satellite-dish"></i>
            {" Live News "}
          </div>
          <div className="ticker-viewport">
            {/* Dynamic Live News Ticker populated from seed.js */}
            <div className="ticker-track" id="seedTickerTrack"></div>
          </div>
          <a href="#" onClick={(event) => { event.preventDefault(); window.openCitizenModal('news'); }} className="ticker-action-link">
            {" View All News "}
            <i className="fas fa-arrow-right"></i>
          </a>
        </div>
        {/* 6 STATS CARDS DIRECTLY BELOW LIVE NEWS - populated from seed.js */}
        <div className="stats-overview-grid reveal-up" id="seedStatsGrid"></div>
        {/* THREE-COLUMN MAIN PORTAL GRID */}
        <div className="three-col-grid">
          {/* COLUMN 1: Latest Updates & News */}
          <section className="panel-card reveal-left delay-1">
            <div className="panel-head">
              <h2>
                <span style={{ color: "#0284c7", marginRight: "4px" }}>
                  <i className="fas fa-tower-broadcast"></i>
                </span>
                {" Latest Updates & News "}
              </h2>
              <a href="#" onClick={(event) => { event.preventDefault(); window.openCitizenModal('news'); }} className="panel-view-all">
                {" View All "}
                <i className="fas fa-arrow-right" style={{ fontSize: "11px" }}></i>
              </a>
            </div>
            {/* Dynamic News Feed Stack populated from seed.js */}
            <div className="news-feed-stack" id="seedNewsStack"></div>
          </section>
          {/* COLUMN 2: For Citizens (8 Action Tiles & Red Emergency Helpline Bar) */}
          <section className="panel-card reveal-up delay-2">
            <div className="panel-head">
              <h2>
                <i className="fas fa-users" style={{ color: "var(--navy-deep)" }}></i>
                {" For Citizens"}
              </h2>
            </div>
            <div className="citizen-tiles-grid">
              <div className="citizen-tile" onClick={(event) => window.openCitizenModal('alerts')}>
                <div className="ct-icon-wrap">
                  <i className="far fa-bell" style={{ color: "#0284c7" }}></i>
                </div>
                <span>Check Flood Alerts</span>
              </div>
              <div className="citizen-tile" onClick={(event) => window.openCitizenModal('camps')}>
                <div className="ct-icon-wrap">
                  <i className="fas fa-location-dot" style={{ color: "#0284c7" }}></i>
                </div>
                <span>Nearby Relief Camps</span>
              </div>
              <div className="citizen-tile" onClick={(event) => window.openCitizenModal('contacts')}>
                <div className="ct-icon-wrap">
                  <i className="fas fa-phone-volume" style={{ color: "#16a34a" }}></i>
                </div>
                <span>Emergency Contacts</span>
              </div>
              <div className="citizen-tile" onClick={(event) => window.openIncidentReportModal()}>
                <div className="ct-icon-wrap">
                  <i className="fas fa-triangle-exclamation" style={{ color: "#dc2626" }}></i>
                </div>
                <span style={{ color: "#b91c1c" }}>Report an Incident</span>
              </div>
              <div className="citizen-tile" onClick={(event) => window.openCitizenModal('safety')}>
                <div className="ct-icon-wrap">
                  <i className="far fa-file-alt" style={{ color: "#4f46e5" }}></i>
                </div>
                <span>Safety Guidelines</span>
              </div>
              <div className="citizen-tile" onClick={(event) => window.openCitizenModal('support')}>
                <div className="ct-icon-wrap">
                  <i className="fas fa-users" style={{ color: "#0284c7" }}></i>
                </div>
                <span>{"Relief & Support"}</span>
              </div>
              <div className="citizen-tile" onClick={(event) => window.openCitizenModal('weather')}>
                <div className="ct-icon-wrap">
                  <i className="fas fa-cloud-showers-heavy" style={{ color: "#0369a1" }}></i>
                </div>
                <span>Weather Update</span>
              </div>
              <div className="citizen-tile" onClick={(event) => window.openCitizenModal('news')}>
                <div className="ct-icon-wrap">
                  <i className="far fa-newspaper" style={{ color: "#7c3aed" }}></i>
                </div>
                <span>{"News & Updates"}</span>
              </div>
            </div>
            {/* Red Emergency Helpline (24×7) Bar */}
            <div className="helpline-banner">
              <div className="helpline-red-pill">
                <i className="fas fa-phone-alt"></i>
                {" Emergency Helpline (24×7) "}
              </div>
              <div className="helpline-numbers">
                <div className="hl-num-box" onClick={(event) => window.copyNumber('112')} title="Click to copy 112">
                  <strong>112</strong>
                  {" "}
                  <span>(Emergency)</span>
                </div>
                <div className="hl-num-box" onClick={(event) => window.copyNumber('1070')} title="Click to copy 1070">
                  <strong>1070</strong>
                  {" "}
                  <span>(State Control Room)</span>
                </div>
                <div className="hl-num-box" onClick={(event) => window.copyNumber('1077')} title="Click to copy 1077">
                  <strong>1077</strong>
                  {" "}
                  <span>(Disaster Helpline)</span>
                </div>
                <div className="hl-num-box" onClick={(event) => window.copyNumber('108')} title="Click to copy 108">
                  <strong>108</strong>
                  {" "}
                  <span>(Ambulance)</span>
                </div>
              </div>
            </div>
          </section>
          {/* COLUMN 3: Key Features */}
          <section className="panel-card reveal-right delay-3" id="features">
            <div className="panel-head">
              <h2>
                <i className="fas fa-layer-group" style={{ color: "var(--navy-deep)" }}></i>
                {" Key Features"}
              </h2>
            </div>
            <div className="features-stack">
              <a href="#" onClick={(event) => { event.preventDefault(); window.openFeatureModal('monitoring'); }} className="feature-row">
                <span className="feature-row-left">
                  <svg width="15" height="11" viewBox="0 0 15 11" fill="none" style={{ flexShrink: "0" }}>
                    <path d="M1 2.5C2.8 1 4.5 4 6.3 2.5C8.1 1 9.8 4 11.6 2.5C12.8 1.5 13.8 2 14.2 2.5" stroke="#0284c7" strokeWidth="1.6" strokeLinecap="round"></path>
                    <path d="M1 5.8C2.8 4.3 4.5 7.3 6.3 5.8C8.1 4.3 9.8 7.3 11.6 5.8C12.8 4.8 13.8 5.3 14.2 5.8" stroke="#0284c7" strokeWidth="1.6" strokeLinecap="round"></path>
                    <path d="M1 9.2C2.8 7.7 4.5 10.7 6.3 9.2C8.1 7.7 9.8 10.7 11.6 9.2C12.8 8.2 13.8 8.7 14.2 9.2" stroke="#0284c7" strokeWidth="1.6" strokeLinecap="round"></path>
                  </svg>
                  {" Real-time River & Weather Monitoring "}
                </span>
                {" "}
                <i className="fas fa-chevron-right feature-chevron"></i>
              </a>
              {" "}
              <a href="#" onClick={(event) => { event.preventDefault(); window.openFeatureModal('gis'); }} className="feature-row">
                <span className="feature-row-left">
                  <i className="fas fa-location-dot" style={{ color: "#0284c7" }}></i>
                  {" Flood Risk & Affected Area Mapping"}
                </span>
                {" "}
                <i className="fas fa-chevron-right feature-chevron"></i>
              </a>
              {" "}
              <a href="#" onClick={(event) => { event.preventDefault(); window.openFeatureModal('inventory'); }} className="feature-row">
                <span className="feature-row-left">
                  <i className="fas fa-boxes-stacked" style={{ color: "#16a34a" }}></i>
                  {" Resource & Inventory Management"}
                </span>
                {" "}
                <i className="fas fa-chevron-right feature-chevron"></i>
              </a>
              {" "}
              <a href="#" onClick={(event) => { event.preventDefault(); window.openFeatureModal('coordination'); }} className="feature-row">
                <span className="feature-row-left">
                  <i className="fas fa-people-group" style={{ color: "#0284c7" }}></i>
                  {" Relief & Rescue Coordination (NDRF / SDRF)"}
                </span>
                {" "}
                <i className="fas fa-chevron-right feature-chevron"></i>
              </a>
              {" "}
              <a href="#" onClick={(event) => { event.preventDefault(); window.openFeatureModal('tracking'); }} className="feature-row">
                <span className="feature-row-left">
                  <i className="fas fa-truck-fast" style={{ color: "#0369a1" }}></i>
                  {" Dispatch, Delivery & Return Tracking"}
                </span>
                {" "}
                <i className="fas fa-chevron-right feature-chevron"></i>
              </a>
              {" "}
              <a href="#" onClick={(event) => { event.preventDefault(); window.openFeatureModal('reporting'); }} className="feature-row">
                <span className="feature-row-left">
                  <i className="far fa-file-lines" style={{ color: "#4f46e5" }}></i>
                  {" Incident & Situation Reporting"}
                </span>
                {" "}
                <i className="fas fa-chevron-right feature-chevron"></i>
              </a>
            </div>
          </section>
        </div>
        {/* SCROLL SECTION 1: ABOUT NEERAKSHAK & COORDINATION LIFECYCLE */}
        <section className="info-section-block" id="about">
          <div className="section-heading-row reveal-up">
            <span className="eyebrow-pill">About NEERAKSHAK</span>
            <h2>From Flood Intelligence to Coordinated Disaster Response</h2>
            <p>
              {" NEERAKSHAK is a district-level flood situational awareness and emergency resource accountability platform built to support disaster management authorities and keep citizens informed. "}
            </p>
          </div>
          <div className="workflow-grid">
            <div className="step-card reveal-up delay-1">
              <div className="step-num">01</div>
              <h3>Situational Monitoring</h3>
              <p>
                District monitoring teams track river water levels, rainfall advisories, and vulnerable village zones to issue timely public warnings.
              </p>
            </div>
            <div className="step-card reveal-up delay-2">
              <div className="step-num">02</div>
              <h3>Resource Assessment</h3>
              <p>
                District authorities evaluate affected areas, approve relief supply allocations, and coordinate with NDRF/SDRF through official channels.
              </p>
            </div>
            <div className="step-card reveal-up delay-3">
              <div className="step-num">03</div>
              <h3>{"Dispatch & Ground Verification"}</h3>
              <p>
                Emergency boats, life jackets, medicines, and food packets are dispatched from district godowns and physically verified upon field delivery.
              </p>
            </div>
            <div className="step-card reveal-up delay-4">
              <div className="step-num">04</div>
              <h3>Transparent Audit Trail</h3>
              <p>
                Every dispatched, delivered, and returned resource is logged to ensure zero discrepancy and complete operational accountability.
              </p>
            </div>
          </div>
          <div className="authority-note reveal-up">
            <i className="fas fa-info-circle" style={{ color: "var(--sky-rich)", fontSize: "17px", flexShrink: "0" }}></i>
            {" "}
            <span>
              <strong>Operational Mandate:</strong>
              {" NEERAKSHAK assists district authorities with situational monitoring, resource tracking, and coordination records. NDRF and SDRF remain independent rescue forces operating under their own official command structures. "}
            </span>
          </div>
        </section>
        {/* SCROLL SECTION: CITIZEN EMERGENCY GUIDELINES & ACTION PROTOCOLS */}
        <section className="info-section-block" id="preparedness">
          <div className="section-heading-row reveal-up">
            <span className="eyebrow-pill">
              <i className="fas fa-shield-halved"></i>
              {" Citizen Disaster Action Manual"}
            </span>
            <h2>{"Flood Emergency Guidelines & Action Protocols"}</h2>
            <p>
              Crucial disaster readiness, evacuation rules, and rehabilitation protocols for residents of Kamrup District.
            </p>
          </div>
          {/* =========================================================================
                 STAGE 01: BEFORE THE FLOOD (EARLY WARNING & PREPAREDNESS)
                 ========================================================================= */}
          <div className="guideline-stage-block">
            <div className="stage-header-flex reveal-left">
              <div className="stage-title-wrap">
                <span className="stage-badge stage-badge-1">
                  <i className="fas fa-box-archive"></i>
                  {" Stage 01 • Early Readiness"}
                </span>
                <h3 className="stage-title">{"Before the Flood: Family Preparation & Early Warnings"}</h3>
                <p className="stage-desc">
                  When upstream rain increases and water levels approach warning levels.
                </p>
              </div>
              <div>
                <a href="tel:1077" className="stage-action-pill pill-blue">
                  <i className="fas fa-phone"></i>
                  {" DEOC Kamrup: 1077"}
                </a>
              </div>
            </div>
            <div className="spacious-guide-grid">
              {/* Card 1: Emergency Go-Bag Essentials */}
              <div className="spacious-card reveal-up delay-1">
                <div>
                  <div className="spacious-card-header">
                    <div className="card-icon-circle" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                      <i className="fas fa-suitcase-medical"></i>
                    </div>
                    <h4 className="card-title-text">Essential Go-Bag (Quick Pack)</h4>
                  </div>
                  <ul className="spacious-list">
                    <li>
                      <strong>{"Documents & Cash:"}</strong>
                      {" Aadhaar, land deeds, voter IDs & emergency cash in a waterproof pouch."}
                    </li>
                    <li>
                      <strong>{"Water & Rations:"}</strong>
                      {" 3-day sealed water bottles + dry food (Chira, Gur, biscuits, ORS)."}
                    </li>
                    <li>
                      <strong>{"Lighting & Battery:"}</strong>
                      {" Heavy-duty LED torch, extra batteries & charged power bank."}
                    </li>
                    <li>
                      <strong>Family Medicines:</strong>
                      {" Daily prescriptions (BP, diabetes) + basic first-aid kit."}
                    </li>
                  </ul>
                </div>
                <div className="card-callout-box callout-blue">
                  <strong>Tip:</strong>
                  {" Keep the bag by the door where anyone can grab it in 30 seconds. "}
                </div>
              </div>
              {/* Card 2: River Warning Alert Levels */}
              <div className="spacious-card reveal-up delay-2">
                <div>
                  <div className="spacious-card-header">
                    <div className="card-icon-circle" style={{ background: "#fef3c7", color: "#d97706" }}>
                      <i className="fas fa-gauge-high"></i>
                    </div>
                    <h4 className="card-title-text">River Gauge Alert Levels</h4>
                  </div>
                  <ul className="spacious-list">
                    <li>
                      <strong>🟡 Yellow Watch (17.0 m):</strong>
                      {" Monitor river updates. Charge mobiles & verify nearest shelter route."}
                    </li>
                    <li>
                      <strong>🟠 Orange Alert (17.5 m):</strong>
                      {" Embankment risk. Relocate elderly, children & cattle to high ground."}
                    </li>
                    <li>
                      <strong>🔴 Red Warning (18.2 m):</strong>
                      {" Danger mark crossed! Siren sounds — immediate mandatory evacuation."}
                    </li>
                  </ul>
                </div>
                <div className="card-callout-box callout-amber">
                  <strong>Official Gauge:</strong>
                  {" Brahmaputra danger level is "}
                  <strong>18.0 m</strong>
                  {" at Kamrup station. "}
                </div>
              </div>
              {/* Card 3: Home & Livestock Protection */}
              <div className="spacious-card reveal-up delay-3">
                <div>
                  <div className="spacious-card-header">
                    <div className="card-icon-circle" style={{ background: "#dcfce7", color: "#15803d" }}>
                      <i className="fas fa-house-chimney-crack"></i>
                    </div>
                    <h4 className="card-title-text">{"Home & Livestock Safety"}</h4>
                  </div>
                  <ul className="spacious-list">
                    <li>
                      <strong>Cut Power:</strong>
                      {" Turn off main electricity meter and close LPG cylinder valves before leaving."}
                    </li>
                    <li>
                      <strong>Elevate Belongings:</strong>
                      {" Shift paddy sacks, seeds, and electronics to high lofts (*chang-ghar*)."}
                    </li>
                    <li>
                      <strong>Untie All Cattle:</strong>
                      {" Never leave cows, goats, or buffaloes tied — allow them to swim to highland mounds."}
                    </li>
                  </ul>
                </div>
                <div className="card-callout-box callout-green">
                  <strong>Livestock:</strong>
                  {" Local veterinary highland camps provide free fodder and emergency vaccines. "}
                </div>
              </div>
            </div>
          </div>
          {/* =========================================================================
                 STAGE 02: DURING THE FLOOD (EVACUATION & RESCUE SOS)
                 ========================================================================= */}
          <div className="guideline-stage-block">
            <div className="stage-header-flex reveal-left">
              <div className="stage-title-wrap">
                <span className="stage-badge stage-badge-2">
                  <i className="fas fa-life-ring"></i>
                  {" Stage 02 • Active Disaster"}
                </span>
                <h3 className="stage-title">{"During the Flood: Safe Evacuation & Rescue SOS"}</h3>
                <p className="stage-desc">When water enters residential areas and rapid evacuation is underway.</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <a href="tel:112" className="stage-action-pill pill-red">
                  <i className="fas fa-shield"></i>
                  {" Unified Police / NDRF: 112"}
                </a>
                {" "}
                <button className="stage-action-pill pill-red" style={{ cursor: "pointer" }} onClick={(event) => window.openIncidentReportModal()}>
                  <i className="fas fa-ship"></i>
                  {" Request Boat Evacuation"}
                </button>
              </div>
            </div>
            <div className="spacious-guide-grid">
              {/* Card 1: Safe Wading & Movement */}
              <div className="spacious-card reveal-up delay-1">
                <div>
                  <div className="spacious-card-header">
                    <div className="card-icon-circle" style={{ background: "#fee2e2", color: "#dc2626" }}>
                      <i className="fas fa-person-walking-dashed-line-arrow-right"></i>
                    </div>
                    <h4 className="card-title-text">Safe Wading Rules</h4>
                  </div>
                  <ul className="spacious-list">
                    <li>
                      <strong>6-Inch Rule:</strong>
                      {" Just 6 inches of fast-flowing water can knock an adult down. Never walk in swift currents."}
                    </li>
                    <li>
                      <strong>Probe Ahead:</strong>
                      {" Always carry a long bamboo pole to test depth and check for washed-out road edges."}
                    </li>
                    <li>
                      <strong>Vehicle Caution:</strong>
                      {" Never drive across flooded roads. If your vehicle stalls in rising water, abandon it immediately."}
                    </li>
                  </ul>
                </div>
                <div className="card-callout-box callout-red">
                  <strong>Danger:</strong>
                  {" Most flood fatalities occur when vehicles are washed off submerged bridges. "}
                </div>
              </div>
              {/* Card 2: Rescue SOS Signals */}
              <div className="spacious-card reveal-up delay-2">
                <div>
                  <div className="spacious-card-header">
                    <div className="card-icon-circle" style={{ background: "#ffedd5", color: "#ea580c" }}>
                      <i className="fas fa-flag"></i>
                    </div>
                    <h4 className="card-title-text">Rescue Signals (Chopper / Boat)</h4>
                  </div>
                  <ul className="spacious-list">
                    <li>
                      <strong>Daytime Signal:</strong>
                      {" Wave a bright orange/red cloth or sari from rooftop to signal aerial rescue teams."}
                    </li>
                    <li>
                      <strong>Nighttime Torch Code:</strong>
                      {" Flash torch in 3 short, 3 long, 3 short bursts (international SOS signal)."}
                    </li>
                    <li>
                      <strong>Sound Beacon:</strong>
                      {" Blow a whistle in 3 repeated sharp blasts to guide NDRF rescue boats through fog."}
                    </li>
                  </ul>
                </div>
                <div className="card-callout-box callout-amber">
                  <strong>Rescue Contact:</strong>
                  {" 1st Battalion NDRF Control: "}
                  <strong>0361-2840284</strong>
                  {". "}
                </div>
              </div>
              {/* Card 3: Snakebite & Wire Hazards */}
              <div className="spacious-card reveal-up delay-3">
                <div>
                  <div className="spacious-card-header">
                    <div className="card-icon-circle" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                      <i className="fas fa-biohazard"></i>
                    </div>
                    <h4 className="card-title-text">{"Snakebite & Power Hazards"}</h4>
                  </div>
                  <ul className="spacious-list">
                    <li>
                      <strong>Snake Watch:</strong>
                      {" Rising water pushes Cobras and Vipers onto trees and rafters. Inspect lofts with a torch."}
                    </li>
                    <li>
                      <strong>Fallen Wires:</strong>
                      {" Stay at least 30 feet away from downed electric poles and submerged transformers."}
                    </li>
                    <li>
                      <strong>Snakebite Care:</strong>
                      {" Keep victim completely calm and immobile. "}
                      <strong>Never cut or tourniquet.</strong>
                      {" Rush to PHC."}
                    </li>
                  </ul>
                </div>
                <div className="card-callout-box callout-blue">
                  <strong>Emergency Helpline:</strong>
                  {" Ambulance: "}
                  <strong>108</strong>
                  {" | APDCL Power: "}
                  <strong>1912</strong>
                  {". "}
                </div>
              </div>
            </div>
          </div>
          {/* =========================================================================
                 STAGE 03: AFTER THE FLOOD (RELIEF & REHABILITATION)
                 ========================================================================= */}
          <div className="guideline-stage-block">
            <div className="stage-header-flex reveal-left">
              <div className="stage-title-wrap">
                <span className="stage-badge stage-badge-3">
                  <i className="fas fa-hand-holding-medical"></i>
                  {" Stage 03 • Post-Flood Relief"}
                </span>
                <h3 className="stage-title">{"After the Flood: Relief Camps, Health & Safe Return"}</h3>
                <p className="stage-desc">
                  Guidelines for shelter rights, epidemic prevention, and home rehabilitation.
                </p>
              </div>
              <div>
                <a href="tel:1070" className="stage-action-pill pill-green">
                  <i className="fas fa-building-ngo"></i>
                  {" State SDRF: 1070"}
                </a>
              </div>
            </div>
            <div className="spacious-guide-grid">
              {/* Card 1: Relief Camp Rights */}
              <div className="spacious-card reveal-up delay-1">
                <div>
                  <div className="spacious-card-header">
                    <div className="card-icon-circle" style={{ background: "#dcfce7", color: "#15803d" }}>
                      <i className="fas fa-campground"></i>
                    </div>
                    <h4 className="card-title-text">Relief Camp Entitlements</h4>
                  </div>
                  <ul className="spacious-list">
                    <li>
                      <strong>Clean Drinking Water:</strong>
                      {" Guaranteed free supply of clean, chlorinated drinking water daily."}
                    </li>
                    <li>
                      <strong>Hot Cooked Meals:</strong>
                      {" Two hygienic cooked meals per day + baby milk and fortified biscuits."}
                    </li>
                    <li>
                      <strong>{"Medical Aid & Hygiene:"}</strong>
                      {" Free doctor visits, ORS, chlorine drops, sanitary napkins & baby care booths."}
                    </li>
                  </ul>
                </div>
                <div className="card-callout-box callout-green">
                  <strong>Official Standard:</strong>
                  {" Relief supplies at authorized district camps are completely free of cost. "}
                </div>
              </div>
              {/* Card 2: Safe Water & Health Rules */}
              <div className="spacious-card reveal-up delay-2">
                <div>
                  <div className="spacious-card-header">
                    <div className="card-icon-circle" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                      <i className="fas fa-faucet-drip"></i>
                    </div>
                    <h4 className="card-title-text">{"Water Purification & Health"}</h4>
                  </div>
                  <ul className="spacious-list">
                    <li>
                      <strong>3-Minute Boil:</strong>
                      {" Always boil all drinking water for at least 3 full minutes to destroy flood pathogens."}
                    </li>
                    <li>
                      <strong>Home ORS Recipe:</strong>
                      {" 6 level tsp sugar + 1/2 tsp salt in 1 Litre boiled water for dehydration/diarrhea."}
                    </li>
                    <li>
                      <strong>Bleach Tubewells:</strong>
                      {" Disinfect flooded tubewells with bleaching powder solution before drinking."}
                    </li>
                  </ul>
                </div>
                <div className="card-callout-box callout-blue">
                  <strong>Health Advisory:</strong>
                  {" Prevent waterborne cholera and leptospirosis by avoiding raw water. "}
                </div>
              </div>
              {/* Card 3: Safe Home Return & Claims */}
              <div className="spacious-card reveal-up delay-3">
                <div>
                  <div className="spacious-card-header">
                    <div className="card-icon-circle" style={{ background: "#fef3c7", color: "#d97706" }}>
                      <i className="fas fa-file-invoice-dollar"></i>
                    </div>
                    <h4 className="card-title-text">{"Home Return & Loss Claims"}</h4>
                  </div>
                  <ul className="spacious-list">
                    <li>
                      <strong>{"Wall & Roof Check:"}</strong>
                      {" Inspect bamboo stilts and mud foundations for tilt or cracks before entering."}
                    </li>
                    <li>
                      <strong>Dry Before Power:</strong>
                      {" Never turn on electrical breakers until sockets and walls have dried for 48 hours."}
                    </li>
                    <li>
                      <strong>SDRF Relief Claim:</strong>
                      {" Take clear photos of collapsed walls and silted fields for government compensation."}
                    </li>
                  </ul>
                </div>
                <div className="card-callout-box callout-amber">
                  <strong>Compensation:</strong>
                  {" Submit damage claims endorsed by Gaonburah to the Circle Officer within 15 days. "}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* SCENIC FOOTER */}
      <div className="scenic-footer-wrap" id="contact">
        <div className="footer-scenic-banner">
          <img src="/footer.jpg" alt="Misty Brahmaputra River Basin Landscape" className="footer-scenic-img" />
          <div className="footer-scenic-blend"></div>
        </div>
        <footer className="calm-footer">
          <div className="footer-inner">
            <div>
              <strong style={{ fontSize: "14px", color: "#ffffff" }}>{"NEERAKSHAK – District Flood Monitoring & Response Platform"}</strong>
              <div style={{ fontSize: "11.5px", color: "#dbeafe", marginTop: "2px" }}>
                {" District Emergency Operations Center (DEOC) • Citizen Information & Coordination Portal "}
              </div>
            </div>
            <div className="footer-links-inline">
              <a href="#home">Home</a>
              {" "}
              <a href="#flood-updates">Flood Updates</a>
              {" "}
              <a href="#about">About</a>
              {" "}
              <a href="#preparedness">Safety Guide</a>
            </div>
            <div style={{ textAlign: "right", fontSize: "12px", color: "#ffffff" }}>
              {" Control Room: "}
              <strong>1077 / 112</strong>
              {"  |  "}
              <strong>deoc-flood@district.gov.in</strong>
            </div>
          </div>
        </footer>
      </div>
      {/* =====================================================================
         MODAL 1: OFFICIAL SECURE LOGIN & ROLE SWITCHER
         ===================================================================== */}
      <div className="modal-overlay" id="loginModal" onClick={(event) => window.closeLoginModal()}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: "0", fontSize: "17px", color: "var(--navy-deep)" }}>
              <i className="fas fa-shield-halved" style={{ color: "var(--sky-rich)", marginRight: "6px" }}></i>
              {" Official Portal Login "}
            </h3>
            <button onClick={(event) => window.closeLoginModal()} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-body)", margin: "6px 0 12px 0" }}>
            {" Select your designated district authority role to access the operational portal: "}
          </p>
          {/* Role Selector Pills */}
          <div className="login-role-tabs">
            <div className="login-role-pill active" onClick={(event) => window.selectLoginRole('admin', event.currentTarget)}>
              <i className="fas fa-water"></i>
              {" "}
              <span>
                Admin
                <br />
                {"(GIS & Flood)"}
              </span>
            </div>
            <div className="login-role-pill" onClick={(event) => window.selectLoginRole('authority', event.currentTarget)}>
              <i className="fas fa-user-tie"></i>
              {" "}
              <span>
                Authority
                <br />
                (Decisions)
              </span>
            </div>
            <div className="login-role-pill" onClick={(event) => window.selectLoginRole('godown', event.currentTarget)}>
              <i className="fas fa-warehouse"></i>
              {" "}
              <span>
                Godown
                <br />
                (Inventory)
              </span>
            </div>
            <div className="login-role-pill" onClick={(event) => window.selectLoginRole('ground', event.currentTarget)}>
              <i className="fas fa-clipboard-check"></i>
              {" "}
              <span>
                Ground
                <br />
                (Field Officer)
              </span>
            </div>
            <div className="login-role-pill" onClick={(event) => window.selectLoginRole('monitoring', event.currentTarget)}>
              <i className="fas fa-chart-line"></i>
              {" "}
              <span>
                Monitoring
                <br />
                (Audit)
              </span>
            </div>
          </div>
          {/* Credential Login Form */}
          <form onSubmit={(event) => window.handleFormLogin(event)}>
            <div className="form-group">
              <label>Designated Officer ID</label>
              {" "}
              <input type="text" id="loginUserId" className="form-input" defaultValue="KAMRUP_DEOC_01" required />
            </div>
            <div className="form-group">
              <label>Official Security PIN / Password</label>
              {" "}
              <input type="password" id="loginPassword" className="form-input" defaultValue="••••••••" required />
            </div>
            <button type="submit" className="btn-submit-login">
              <i className="fas fa-key"></i>
              {" Authenticate & Enter Portal "}
            </button>
          </form>
          <div className="quick-persona-divider">
            <span>OR 1-CLICK INSTANT DEMO LAUNCH</span>
          </div>
          {/* Quick 1-Click Launch Persona Grid */}
          <div className="persona-quick-grid">
            <div className="persona-quick-card" onClick={(event) => window.launchRolePortal('admin')}>
              <i className="fas fa-water" style={{ color: "#0284c7" }}></i>
              {" "}
              <strong>Admin</strong>
              {" "}
              <small>Flood Data</small>
            </div>
            <div className="persona-quick-card" onClick={(event) => window.launchRolePortal('authority')}>
              <i className="fas fa-user-tie" style={{ color: "#1d4ed8" }}></i>
              {" "}
              <strong>Authority</strong>
              {" "}
              <small>Allocations</small>
            </div>
            <div className="persona-quick-card" onClick={(event) => window.launchRolePortal('godown')}>
              <i className="fas fa-warehouse" style={{ color: "#d97706" }}></i>
              {" "}
              <strong>Godown</strong>
              {" "}
              <small>Dispatch</small>
            </div>
            <div className="persona-quick-card" onClick={(event) => window.launchRolePortal('ground')}>
              <i className="fas fa-clipboard-check" style={{ color: "#16a34a" }}></i>
              {" "}
              <strong>Ground</strong>
              {" "}
              <small>Delivery</small>
            </div>
            <div className="persona-quick-card" onClick={(event) => window.launchRolePortal('monitoring')}>
              <i className="fas fa-chart-line" style={{ color: "#7c3aed" }}></i>
              {" "}
              <strong>Audit</strong>
              {" "}
              <small>Integrity</small>
            </div>
          </div>
        </div>
      </div>
      {/* =====================================================================
         MODAL 2: INTERACTIVE ROLE DASHBOARD (LIVE PORTAL VIEW)
         ===================================================================== */}
      <div className="modal-overlay" id="rolePortalModal" onClick={(event) => window.closeRolePortalModal()}>
        <div className="modal-box modal-wide-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #dce8f5", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div id="rolePortalIconWrap" style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}></div>
              <div>
                <h3 id="rolePortalTitle" style={{ margin: "0", fontSize: "17px", color: "var(--navy-deep)" }}>Role Portal</h3>
                <span id="rolePortalSubtitle" style={{ fontSize: "11px", color: "#64748b" }}>Operational Dashboard</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", background: "#dcfce7", color: "#15803d", fontWeight: "700", padding: "3px 8px", borderRadius: "12px" }}>● Session Active</span>
              {" "}
              <button onClick={(event) => window.closeRolePortalModal()} style={{ border: "1px solid #cbd5e1", background: "#ffffff", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11.5px", fontWeight: "700" }}>
                <i className="fas fa-arrow-left"></i>
                {" Sign Out to Public "}
              </button>
            </div>
          </div>
          {/* Dynamic Role Content Container */}
          <div id="rolePortalBody"></div>
        </div>
      </div>
      {/* =====================================================================
         MODAL 3: CITIZEN SERVICE & FEATURE DETAILS MODAL
         ===================================================================== */}
      <div className="modal-overlay" id="serviceModal" onClick={(event) => window.closeServiceModal()}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 id="serviceModalTitle" style={{ margin: "0", fontSize: "16.5px", color: "var(--navy-deep)" }}>Details</h3>
            <button onClick={(event) => window.closeServiceModal()} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div id="serviceModalBody" style={{ margin: "12px 0" }}></div>
          <div style={{ background: "#e8f4fd", border: "1.5px solid #9cc3e6", borderRadius: "8px", padding: "9px 12px", fontSize: "12px", color: "var(--navy-deep)" }}>
            <i className="fas fa-phone-volume" style={{ color: "var(--red-alert)", marginRight: "6px" }}></i>
            {" Emergency Assistance: "}
            <strong>112</strong>
            {" (National) • "}
            <strong>1077</strong>
            {" (District Control Room) "}
          </div>
        </div>
      </div>
      {/* =====================================================================
         MODAL 4: REPORT AN INCIDENT FORM
         ===================================================================== */}
      <div className="modal-overlay" id="incidentModal" onClick={(event) => window.closeIncidentModal()}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: "0", fontSize: "16.5px", color: "#b91c1c" }}>
              <i className="fas fa-triangle-exclamation" style={{ color: "#dc2626", marginRight: "6px" }}></i>
              {" Report Waterlogging / Flood Incident "}
            </h3>
            <button onClick={(event) => window.closeIncidentModal()} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#475569", margin: "6px 0 12px" }}>
            {" Direct citizen submission to Kamrup District Disaster Control Room: "}
          </p>
          <form onSubmit={(event) => window.handleIncidentSubmit(event)}>
            <div className="form-group">
              <label>Affected Village / Ward / Location *</label>
              {" "}
              <input type="text" className="form-input" placeholder="e.g. Chaygaon Ward 4 near river embankment" required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="form-group">
                <label>Water Depth (Approx in ft)</label>
                {" "}
                <input type="number" step="0.5" className="form-input" placeholder="e.g. 3.5 ft" />
              </div>
              <div className="form-group">
                <label>Stranded Persons Count</label>
                {" "}
                <input type="number" className="form-input" placeholder="e.g. 15" />
              </div>
            </div>
            <div className="form-group">
              <label>Citizen Contact Number *</label>
              {" "}
              <input type="tel" className="form-input" placeholder="e.g. 9876543210" required />
            </div>
            <div className="form-group">
              <label>Situation Details / Urgent Needs</label>
              {" "}
              <textarea className="form-input" rows="3" placeholder="Describe current situation, medical emergency, food/water needs..." />
            </div>
            <button type="submit" className="btn-submit-login" style={{ background: "#dc2626" }}>
              <i className="fas fa-paper-plane"></i>
              {" Submit Incident to Emergency Control "}
            </button>
          </form>
        </div>
      </div>
      {/* =====================================================================
         MODAL 5: INTERACTIVE GIS FLOOD MAP (WITH 1/4 VIEW & EXPAND TOGGLE)
         ===================================================================== */}
      <div className="modal-overlay" id="mapModal" onClick={(event) => window.closeMapModal()}>
        <div className="modal-box modal-wide-box" id="mapModalContainer" onClick={(event) => event.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="fas fa-map-location-dot" style={{ color: "#0284c7", fontSize: "18px" }}></i>
              <h3 style={{ margin: "0", fontSize: "16px", color: "var(--navy-deep)" }}>{"GIS Flood Risk & River Gauge Map"}</h3>
              <span style={{ fontSize: "10.5px", background: "#e0f2fe", color: "#0284c7", padding: "2px 7px", borderRadius: "10px", fontWeight: "700" }}>Kamrup District</span>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={(event) => window.toggleMapFullscreen()} style={{ border: "1px solid #cbd5e1", background: "#f8fafc", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}>
                <i className="fas fa-expand" id="mapExpandIcon"></i>
                {" Expand / Reset "}
              </button>
              {" "}
              <button onClick={(event) => window.closeMapModal()} style={{ border: "none", background: "#e2e8f0", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          {/* Interactive SVG GIS Map Viewport */}
          <div style={{ position: "relative", height: "380px", background: "#dceefb", borderRadius: "10px", overflow: "hidden", border: "1.5px solid #b5d5f2" }}>
            <svg width="100%" height="100%" viewBox="0 0 800 380" xmlns="http://www.w3.org/2000/svg">
              {/* River Brahmaputra Basin */}
              <path d="M-20 180 Q 200 120 400 190 T 820 160" fill="none" stroke="#38bdf8" strokeWidth="44" strokeLinecap="round" opacity="0.6"></path>
              <path d="M-20 180 Q 200 120 400 190 T 820 160" fill="none" stroke="#0284c7" strokeWidth="26" strokeLinecap="round"></path>
              <path d="M380 185 Q 460 260 520 380" fill="none" stroke="#0284c7" strokeWidth="14" strokeLinecap="round"></path>
              {/* Flood Warning Zones */}
              <circle cx="280" cy="150" r="50" fill="#fee2e2" fillOpacity="0.65" stroke="#ef4444" strokeDasharray="4 4" strokeWidth="2"></circle>
              <text x="280" y="155" textAnchor="middle" fontSize="11" fontWeight="800" fill="#dc2626">Kamrup Sadar (Critical 18.2m)</text>
              <circle cx="530" cy="220" r="42" fill="#fef3c7" fillOpacity="0.65" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth="2"></circle>
              <text x="530" y="225" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#b45309">Chaygaon (Warning 14.6m)</text>
              {" "}
              {/* Relief Shelters & Facilities */}
              <g transform="translate(160, 90)">
                <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#15803d"></rect>
                <text x="0" y="4" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">H</text>
                {" "}
                <text x="0" y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#072247">Civil Hospital</text>
              </g>
              <g transform="translate(420, 80)">
                <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#0f766e"></rect>
                <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">⛺</text>
                {" "}
                <text x="0" y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#072247">Palashbari Camp (500 cap)</text>
              </g>
              <g transform="translate(640, 240)">
                <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#0f766e"></rect>
                <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">⛺</text>
                {" "}
                <text x="0" y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#072247">Goroimari Camp (350 cap)</text>
              </g>
            </svg>
            <div style={{ position: "absolute", bottom: "10px", left: "10px", background: "rgba(255,255,255,0.92)", padding: "8px 12px", borderRadius: "8px", fontSize: "11px", border: "1px solid #cbd5e1", display: "flex", gap: "14px" }}>
              <span>
                <strong style={{ color: "#dc2626" }}>● Critical Inundation:</strong>
                {" Brahmaputra"}
              </span>
              {" "}
              <span>
                <strong style={{ color: "#d97706" }}>● Warning Level:</strong>
                {" Kolong Basin"}
              </span>
              {" "}
              <span>
                <strong style={{ color: "#15803d" }}>⛺ 18 Active Shelters</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* TOAST NOTIFICATION */}
      <div id="toast"></div>
      {/* EXTERNAL SEED / TELEMETRY CONFIGURATION */}
      {" "}
      {" "}
  </>
);

export default function Home() {
  useEffect(() => {
    document.title = "NEERAKSHAK – District Flood Monitoring & Disaster Coordination Platform";
    initHomePage();
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
