import { useEffect } from 'react';
import css from './login.css?inline';
import initLoginPage from './login.legacy.js';

// Static markup, created once so React never re-renders over what the page script builds.
const markup = (
  <>
      <div className="bloom"></div>
      <div className="drops" id="drops"></div>
      <div className="card-wrap" id="tilt">
        <div className="card">
          {/* HEADER */}
          <div className="card-head">
            <span className="live-chip">
              <i></i>
              Brahmaputra 18.2 m ↑ Dangerous
            </span>
            <div className="brand">
              <svg className="seal" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
                <h1>
                  <span>NEERAKSHAK</span>
                </h1>
                <p>{"Integrated Flood Monitoring, Intelligence & Resource Coordination"}</p>
              </div>
            </div>
          </div>
          {/* BODY */}
          <div className="card-body">
            <div className="title-row">
              <h2>
                <i className="fas fa-shield-halved"></i>
                Official Portal Login
              </h2>
              <div className="clock">
                <span id="clkTime">--:--:--</span>
                <br />
                <span id="clkDate"></span>
              </div>
            </div>
            <p className="sub">
              Select your designated district role to access the operational portal.
            </p>
            <div className="roles" id="roles">
              <button type="button" className="role active" data-role="admin" style={{ "--c": "#0284c7", "--c2": "#0ea5e9" }}>
                <i className="fas fa-water"></i>
                <span>Admin</span>
              </button>
              {" "}
              <button type="button" className="role" data-role="authority" style={{ "--c": "#0f766e", "--c2": "#14b8a6" }}>
                <i className="fas fa-user-tie"></i>
                <span>Authority</span>
              </button>
              {" "}
              <button type="button" className="role" data-role="godown" style={{ "--c": "#ea580c", "--c2": "#fb923c" }}>
                <i className="fas fa-warehouse"></i>
                <span>Godown</span>
              </button>
              {" "}
              <button type="button" className="role" data-role="ground" style={{ "--c": "#15803d", "--c2": "#22c55e" }}>
                <i className="fas fa-clipboard-check"></i>
                <span>Ground</span>
              </button>
              {" "}
              <button type="button" className="role" data-role="monitoring" style={{ "--c": "#6d28d9", "--c2": "#8b5cf6" }}>
                <i className="fas fa-chart-line"></i>
                <span>Monitor</span>
              </button>
            </div>
            <div className="role-desc" id="roleDesc"></div>
            <form id="loginForm" noValidate autoComplete="off">
              <div className="field">
                <label htmlFor="uid">Designated Officer ID</label>
                <div className="input-wrap">
                  <i className="fas fa-id-badge lead"></i>
                  {" "}
                  <input id="uid" type="text" placeholder="e.g. KAMRUP_ADMIN_GIS" spellCheck="false" autoCapitalize="characters" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="pwd">Official Security PIN / Password</label>
                <div className="input-wrap">
                  <i className="fas fa-lock lead"></i>
                  {" "}
                  <input id="pwd" type="password" placeholder="Enter your secure password" />
                  {" "}
                  <button type="button" className="eye" id="eye" aria-label="Show password">
                    <i className="fas fa-eye"></i>
                  </button>
                </div>
                <div className="caps" id="caps">
                  <i className="fas fa-triangle-exclamation"></i>
                  {" Caps Lock is ON"}
                </div>
              </div>
              <div className="cap-row">
                <div className="captcha">
                  <span id="capQ">7 + 5 = ?</span>
                  <button type="button" id="capRefresh" aria-label="New question">
                    <i className="fas fa-rotate"></i>
                  </button>
                </div>
                <div className="input-wrap">
                  <input id="capA" type="text" inputMode="numeric" placeholder="Answer" />
                </div>
              </div>
              <div className="options">
                <label className="check">
                  <input type="checkbox" id="rem" />
                  {" Keep me signed in"}
                </label>
                {" "}
                <a href="#" id="forgot">Forgot password?</a>
              </div>
              <div className="msg" id="msg"></div>
              <button type="submit" className="btn" id="btn">
                <i className="fas fa-key"></i>
                <span>{"Authenticate & Enter Portal"}</span>
              </button>
            </form>
            <div className="divider">OR 1-CLICK DEMO LAUNCH</div>
            <div className="demo-row">
              <button type="button" className="demo-btn" id="demoFill">
                <i className="fas fa-wand-magic-sparkles"></i>
                Fill demo login
              </button>
              {" "}
              <button type="button" className="demo-btn" id="demoGo">
                <i className="fas fa-bolt"></i>
                Instant enter
              </button>
            </div>
          </div>
          <div className="card-foot">
            <span className="sec">
              <i className="fas fa-lock"></i>
              256-bit secured session
            </span>
            {" "}
            <a href="/">
              <i className="fas fa-arrow-left"></i>
              {" Public portal"}
            </a>
          </div>
        </div>
      </div>
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
