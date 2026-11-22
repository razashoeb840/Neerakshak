import { useEffect } from 'react';
import css from './login.css?inline';
import initLoginPage from './login.legacy.js';

// Static markup, created once so React never re-renders over what the page script builds.
const markup = (
  <>
    <div className="bloom"></div>
    <div className="drops" id="drops"></div>

    <div className="portal-stage">
      {/* 1. LEFT PANEL: 1ST IMAGE (NDRF RESCUE OPERATION & RELIEF LOGISTICS) */}
      <aside className="stage-left">
        <div className="left-img-frame">
          <img src="/rescue_operation.png" alt="NDRF Rescue Team &amp; Relief Operations" className="left-img" />
          <div className="left-overlay-badge">
            <div className="badge-chip">
              <i className="fas fa-life-ring"></i>
              <span>NDRF &amp; District Evacuation</span>
            </div>
            <p>Field Rescue, Flood Inundation Response &amp; Relief Logistics</p>
          </div>
        </div>
      </aside>

      {/* 2. CENTER PANEL: 2ND IMAGE (RIVER & SKY) WITH FORM IN THE SKY AREA */}
      <section className="stage-center">
        <div className="center-bg-frame">
          <img src="/river_sky.jpg" alt="NEERAKSHAK River and Sky Landscape" className="center-bg-img" />
        </div>

        {/* FLOATING FROSTED GLASS LOGIN CARD */}
        <div className="card-wrap" id="tilt">
          <div className="card">
            {/* CARD HEAD */}
            <div className="card-head">
              <div className="head-inner">
                <div className="card-title-lockup">
                  <i className="fas fa-shield-halved head-icon"></i>
                  <div>
                    <h2>Official Portal Login</h2>
                    <span className="card-subhead">Select designated role &amp; authenticate</span>
                  </div>
                </div>
                <span className="live-chip">
                  <i></i>
                  Brahmaputra 18.2m ↑ High
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="card-body">
              {/* ROLES: BOX TYPE WITH ICON IN ONE SINGLE LINE */}
              <div className="roles" id="roles">
                <button type="button" className="role active" data-role="admin" style={{ "--c": "#0284c7", "--c2": "#0ea5e9" }}>
                  <i className="fas fa-water"></i>
                  <span>Admin</span>
                </button>
                <button type="button" className="role" data-role="authority" style={{ "--c": "#0f766e", "--c2": "#14b8a6" }}>
                  <i className="fas fa-user-tie"></i>
                  <span>Authority</span>
                </button>
                <button type="button" className="role" data-role="godown" style={{ "--c": "#ea580c", "--c2": "#fb923c" }}>
                  <i className="fas fa-warehouse"></i>
                  <span>Godown</span>
                </button>
                <button type="button" className="role" data-role="ground" style={{ "--c": "#15803d", "--c2": "#22c55e" }}>
                  <i className="fas fa-clipboard-check"></i>
                  <span>Ground</span>
                </button>
                <button type="button" className="role" data-role="monitoring" style={{ "--c": "#6d28d9", "--c2": "#8b5cf6" }}>
                  <i className="fas fa-chart-line"></i>
                  <span>Monitor</span>
                </button>
              </div>

              <div className="role-desc" id="roleDesc"></div>

              {/* 2-COLUMN BALANCED FORM */}
              <form id="loginForm" noValidate autoComplete="off">
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="uid">Designated Officer ID</label>
                    <div className="input-wrap">
                      <i className="fas fa-id-badge lead"></i>
                      <input id="uid" type="text" placeholder="e.g. KAMRUP_ADMIN_GIS" spellCheck="false" autoCapitalize="characters" />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="pwd">Security PIN / Password</label>
                    <div className="input-wrap">
                      <i className="fas fa-lock lead"></i>
                      <input id="pwd" type="password" placeholder="Enter password" />
                      <button type="button" className="eye" id="eye" aria-label="Show password">
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                    <div className="caps" id="caps">
                      <i className="fas fa-triangle-exclamation"></i> Caps Lock is ON
                    </div>
                  </div>

                  <div className="field cap-col">
                    <label>Security Math Verification</label>
                    <div className="cap-row">
                      <div className="captcha">
                        <span id="capQ">7 + 5 = ?</span>
                        <button type="button" id="capRefresh" aria-label="New question">
                          <i className="fas fa-rotate"></i>
                        </button>
                      </div>
                      <div className="input-wrap cap-input">
                        <input id="capA" type="text" inputMode="numeric" placeholder="Answer" />
                      </div>
                    </div>
                  </div>

                  <div className="field options-col">
                    <label className="options-label">&nbsp;</label>
                    <div className="options">
                      <label className="check">
                        <input type="checkbox" id="rem" />
                        <span>Keep me signed in</span>
                      </label>
                      <a href="#" id="forgot">Forgot PIN?</a>
                    </div>
                  </div>
                </div>

                <div className="msg" id="msg"></div>

                {/* ACTIONS: SUBMIT & DEMO BUTTONS */}
                <div className="actions-row">
                  <button type="submit" className="btn" id="btn">
                    <i className="fas fa-key"></i>
                    <span>Authenticate &amp; Enter Portal</span>
                  </button>
                  <div className="demo-group">
                    <button type="button" className="demo-btn" id="demoFill" title="Auto-fill sample credentials">
                      <i className="fas fa-wand-magic-sparkles"></i>
                      Fill Demo
                    </button>
                    <button type="button" className="demo-btn instant" id="demoGo" title="Instant 1-click enter">
                      <i className="fas fa-bolt"></i>
                      Instant
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* CARD FOOT */}
            <div className="card-foot">
              <span className="sec">
                <i className="fas fa-shield-halved"></i>
                256-bit Encrypted Government Session
              </span>
              <span className="zone-tag">Kamrup District DEOC</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RIGHT PANEL: OFFICIAL BRANDING, MISSION & EMERGENCY DIRECTORY */}
      <aside className="stage-right">
        <div className="right-top">
          <div className="gov-seal-pill">
            <svg className="gov-ashoka-seal" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="50" cy="52" r="46" fill="#fff"></circle>
              <path d="M22 25 C14 36 12 55 18 69 C24 81 36 91 50 92 C64 91 76 81 82 69 C88 55 86 36 78 25" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round"></path>
              <path d="M25 23 C33 13 41 10 50 10 C59 10 67 13 75 23" stroke="#f97316" strokeWidth="6" strokeLinecap="round"></path>
              <path d="M30 84 C36 89 43 91 50 91 C57 91 64 89 70 84" stroke="#16a34a" strokeWidth="6" strokeLinecap="round"></path>
              <circle cx="50" cy="50" r="32" fill="#0369a1"></circle>
              <circle cx="36" cy="34" r="5" fill="#fde047"></circle>
              <ellipse cx="64" cy="37" rx="8" ry="4" fill="#fff" opacity=".85"></ellipse>
              <path d="M22 56 L35 43 L46 53 L60 41 L78 56 Z" fill="#15803d"></path>
              <path d="M18 60 C28 56 38 62 50 58 C62 54 72 60 82 56 L82 78 C72 82 62 76 50 80 C38 84 28 78 18 82 Z" fill="#0284c7"></path>
              <path d="M20 68 C30 65 40 71 50 67 C60 63 70 69 80 65" stroke="#7dd3fc" strokeWidth="2.2" strokeLinecap="round"></path>
              <path d="M35 66 L65 66 C63 73 59 75 50 75 C41 75 37 73 35 66 Z" fill="#dc2626"></path>
              <path d="M39 66 L61 66 C59 70 56 71.5 50 71.5 C44 71.5 41 70 39 66 Z" fill="#fff"></path>
              <rect x="46" y="3" width="8" height="8" rx="2" fill="#072247"></rect>
            </svg>
            <div>
              <span className="gov-name">GOVERNMENT OF ASSAM</span>
              <span className="dept-name">Disaster Management Authority</span>
            </div>
          </div>

          <div className="right-brand">
            <h1 className="right-logo-title">
              NEERA<span>KSHAK</span>
            </h1>
            <p className="right-logo-subtitle">
              Integrated Flood Monitoring, Intelligence &amp; Resource Coordination
            </p>
            <div className="right-motto-row">
              <span>Monitor</span>
              <span className="motto-dot">•</span>
              <span>Coordinate</span>
              <span className="motto-dot">•</span>
              <span className="motto-cyan">Rescue</span>
            </div>
          </div>

          <div className="right-features-list">
            <div className="feat-tile">
              <i className="fas fa-satellite-dish"></i>
              <div>
                <strong>River Basin Telemetry</strong>
                <span>CWC River Gauges &amp; Inundation Risk</span>
              </div>
            </div>
            <div className="feat-tile">
              <i className="fas fa-helicopter"></i>
              <div>
                <strong>Tactical Rescue Command</strong>
                <span>NDRF 1st Battalion &amp; SDRF Units</span>
              </div>
            </div>
            <div className="feat-tile">
              <i className="fas fa-boxes-packing"></i>
              <div>
                <strong>Relief Supply Verification</strong>
                <span>Central Godown to Ground Receipt Audit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="right-bottom">
          <div className="helpline-card">
            <div className="hl-head">
              <i className="fas fa-phone-volume"></i>
              <span>24×7 Emergency Control Room</span>
            </div>
            <div className="hl-numbers">
              <span>District: <strong>1077</strong></span>
              <span className="hl-sep">|</span>
              <span>National: <strong>112</strong></span>
            </div>
          </div>

          <div className="right-actions-row">
            <a href="/" className="right-back-btn">
              <i className="fas fa-arrow-left"></i>
              <span>Citizen Public Portal</span>
            </a>
            <div className="clock-badge">
              <span id="clkTime">--:--:--</span>
              <span id="clkDate"></span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    {/* FULL SCREEN WIPE ON SUCCESS */}
    <div className="portal-wipe" id="wipe">
      <div>
        <span className="ring" style={{ display: "block" }}></span>
        <span id="wipeTxt">Entering portal…</span>
        <small>Establishing secure district session</small>
      </div>
    </div>
  </>
);

export default function Login() {
  useEffect(() => {
    document.title = "Official Login – NEERAKSHAK Flood Management System";
    initLoginPage();
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
