import { useEffect } from 'react';
import css from './login.css?inline';
import initLoginPage from './login.legacy.js';
import { redirectIfAuthenticated } from '../../auth';
//Static markup, created once so React never re-renders over what the page script builds.
const markup = (
  <>
    <div className="bloom"></div>
    <div className="drops" id="drops"></div>
    <div className="login-viewport">
      {/* =========================================================================
          LEFT SIDE: LOGO, OFFICIAL SLOGAN & BOTTOM PILLARS (AS IN IMAGE 2)
          ========================================================================= */}

      <div className="login-left-area">
        <div className="left-hero-branding">
          {/* Logo Lockup: Waterdrop House Icon + NEERAKSHAK */}
          <div className="brand-logo-lockup">
            <svg className="waterdrop-house-logo" viewBox="0 0 80 92" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer water droplet */}
              <path d="M40 4 C40 4, 8 46, 8 62 A32 32 0 0 0 72 62 C72 46, 40 4, 40 4 Z" fill="#0284c7" />
              {/* House roof & body inside droplet */}
              <path d="M40 26 L58 41 L53 41 L53 62 L27 62 L27 41 L22 41 Z" fill="#ffffff" />

              {/* House Door */}
              <rect x="36" y="48" width="8" height="14" fill="#0284c7" rx="1.5" />
              {/* House Window */}
              <rect x="46" y="44" width="4.5" height="4.5" fill="#0284c7" rx="0.8" />
              {/* Chimney */}
              <rect x="47" y="30" width="3.5" height="6" fill="#ffffff" />
              {/* Water ripples at bottom of drop */}
              
              <path d="M14 69 Q27 75 42 69 T70 71" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M20 77 Q32 83 48 77 T64 79" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
            <div className="brand-text-block">

              <h1 className="brand-main-title">NEERAKSHAK</h1>
              <div className="brand-sub-divider">
                <span className="dash"></span>
                <span className="sub-text">Flood Management System</span>
                <span className="dash"></span>
              </div>
            </div>
          </div>

          {/* Official Slogan */}
          <div className="brand-slogan-block">
            <h2 className="slogan-title">Together for a Safer Tomorrow</h2>
            <div className="slogan-tagline">
              <span>Monitor</span>
              <span className="dot">•</span>
              <span>Coordinate</span>
              <span className="dot">•</span>
              <span>Respond</span>
            </div>
          </div>
        </div>

        {/* Bottom 4 Feature Pillars (Sitting on the Blue Wave Curve) */}
        <div className="left-bottom-pillars">
          <div className="pillar-item">
            <i className="fas fa-shield-halved"></i>
            <span>Disaster Preparedness</span>
          </div>
          <span className="pillar-sep">|</span>
          <div className="pillar-item">
            <i className="fas fa-users-gear"></i>
            <span>Efficient Coordination</span>
          </div>
          <span className="pillar-sep">|</span>
          <div className="pillar-item">
            <i className="fas fa-handshake-angle"></i>
            <span>Timely Relief</span>
          </div>
          <span className="pillar-sep">|</span>
          <div className="pillar-item">
            <i className="fas fa-chart-line"></i>
            <span>Safer Community</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE: CLEAN FLOATING WHITE LOGIN CARD (EXACTLY AS IN IMAGE 2)
          ========================================================================= */}
      <div className="login-right-area">
        <div className="card-wrap" id="tilt">
          <div className="card">
            {/* Card Header */}
            <div className="card-head">
              <div className="lock-circle-icon">
                <i className="fas fa-lock"></i>
              </div>
              <h2 className="card-login-title">Login to NEERAKSHAK</h2>
              <p className="card-login-subtitle">Select your role to continue</p>
            </div>

            {/* Card Body */}
            <div className="card-body">
              {/* 5 ROLES IN ONE SINGLE LINE (BOX TYPE WITH ICON ON TOP) */}
              <div className="roles" id="roles">
                <button type="button" className="role active" data-role="admin" style={{ "--c": "#0066cc", "--c2": "#0284c7" }}>
                  <i className="fas fa-gear"></i>
                  <span>Admin</span>
                </button>
                <button type="button" className="role" data-role="authority" style={{ "--c": "#0066cc", "--c2": "#0284c7" }}>
                  <i className="fas fa-users"></i>
                  <span>Authority</span>
                </button>
                <button type="button" className="role" data-role="godown" style={{ "--c": "#0066cc", "--c2": "#0284c7" }}>
                  <i className="fas fa-warehouse"></i>
                  <span>Godown Manager</span>
                </button>
                <button type="button" className="role" data-role="ground" style={{ "--c": "#0066cc", "--c2": "#0284c7" }}>
                  <i className="fas fa-helmet-safety"></i>
                  <span>Ground Officer</span>
                </button>
                <button type="button" className="role" data-role="monitoring" style={{ "--c": "#0066cc", "--c2": "#0284c7" }}>
                  <i className="fas fa-chart-line"></i>
                  <span>Monitoring Officer</span>
                </button>
              </div>

              {/* Role description banner (required for JS logic) */}
              <div className="role-desc" id="roleDesc"></div>

              {/* Form Fields */}
              <form id="loginForm" noValidate autoComplete="off">
                {/* Username Input with User Icon */}
                <div className="form-input-group">
                  <div className="input-box">
                    <i className="fas fa-user input-leading-icon"></i>
                    <input id="uid" type="text" placeholder="Username" spellCheck="false" autoCapitalize="characters" />
                  </div>
                </div>

                {/* Password Input with Lock & Eye Icon */}
                <div className="form-input-group">
                  <div className="input-box">
                    <i className="fas fa-lock input-leading-icon"></i>
                    <input id="pwd" type="password" placeholder="Password" />
                    <button type="button" className="password-eye-btn" id="eye" aria-label="Show password">
                      <i className="fas fa-eye-slash"></i>
                    </button>
                  </div>
                  <div className="caps-alert" id="caps">
                    <i className="fas fa-triangle-exclamation"></i> Caps Lock is ON
                  </div>
                </div>

                {/* Compact Security Verification */}
                <div className="security-calc-row">
                  <div className="captcha">
                    <span id="capQ">7 + 5 = ?</span>
                    <button type="button" id="capRefresh" aria-label="New question">
                      <i className="fas fa-rotate"></i>
                    </button>
                  </div>
                  <div className="input-box cap-answer-box">
                    <input id="capA" type="text" inputMode="numeric" placeholder="Answer" />
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="remember-forgot-row">
                  <label className="remember-check">
                    <input type="checkbox" id="rem" />
                    <span>Remember Me</span>
                  </label>
                  <a href="#" id="forgot" className="forgot-pwd-link">Forgot Password?</a>
                </div>

                {/* Validation Messages */}
                <div className="msg" id="msg"></div>

                {/* Primary Login Button with Arrow */}
                <button type="submit" className="login-submit-btn" id="btn">
                  <i className="fas fa-arrow-right-to-bracket"></i>
                  <span>Login</span>
                </button>

                {/* 1-Click Demo Launcher */}
                <div className="demo-launcher-strip">
                  <span className="demo-label">Demo:</span>
                  <button type="button" className="demo-pill" id="demoFill" title="Auto-fill sample credentials">
                    <i className="fas fa-wand-magic-sparkles"></i> Auto-fill
                  </button>
                  <button type="button" className="demo-pill instant" id="demoGo" title="Instant 1-click bypass enter">
                    <i className="fas fa-bolt"></i> Instant Enter
                  </button>
                </div>
              </form>
            </div>

            {/* Card Sub-Footer */}
            <div className="card-subfooter">
              <span className="security-tagline">Secure • Reliable • Integrated</span>
              <a href="/" className="citizen-portal-link">
                <i className="fas fa-arrow-left"></i> Public Portal
              </a>
            </div>
          </div>
        </div>

        {/* Real-time Clock display required by JS */}
        <div className="clock-hidden-sync" style={{ display: "none" }}>
          <span id="clkTime"></span>
          <span id="clkDate"></span>
        </div>
      </div>
    </div>

    {/* Official Password Assistance & Helpline Modal */}
    <div className="forgot-modal-overlay" id="forgotModal">
      <div className="forgot-modal-card">
        <div className="forgot-modal-head">
          <div className="forgot-modal-title-wrap">
            <div className="forgot-modal-icon">
              <i className="fas fa-shield-halved"></i>
            </div>
            <div>
              <h3 className="forgot-title">Official Password Assistance</h3>
              <p className="forgot-subtitle">Assam SDMA • District Emergency Operation Centre (DEOC)</p>
            </div>
          </div>
          <button type="button" className="forgot-close-btn" id="forgotClose" aria-label="Close modal">
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        <div className="forgot-modal-body">
          <div className="forgot-notice-box">
            <i className="fas fa-circle-info"></i>
            <p>
              Official designated officer credentials are encrypted and centrally provisioned.
              For emergency access during flood response or operational drills, use the verified channels below:
            </p>
          </div>

          <div className="forgot-helpline-grid">
            <div className="forgot-helpline-card">
              <i className="fas fa-phone-volume"></i>
              <div>
                <strong>District DEOC Helpline</strong>
                <span>1077 (Kamrup District Toll-Free)</span>
              </div>
            </div>
            <div className="forgot-helpline-card">
              <i className="fas fa-tower-broadcast"></i>
              <div>
                <strong>National Emergency</strong>
                <span>112 (Police, SDRF &amp; NDRF)</span>
              </div>
            </div>
            <div className="forgot-helpline-card">
              <i className="fas fa-building-shield"></i>
              <div>
                <strong>State Control Room</strong>
                <span>0361-2237011 / 1070</span>
              </div>
            </div>
            <div className="forgot-helpline-card">
              <i className="fas fa-envelope"></i>
              <div>
                <strong>Official Email Support</strong>
                <span>deoc.kamrup@neerakshak.gov.in</span>
              </div>
            </div>
          </div>

          <div className="forgot-demo-action-box">
            <div className="forgot-demo-text">
              <strong>Need Immediate Evaluation / Drill Access?</strong>
              <p>You can automatically apply the official training passkey (<code>demo@1234</code>) to your selected role.</p>
            </div>
            <button type="button" className="btn-apply-demo-pin" id="forgotApplyDemo">
              <i className="fas fa-key"></i>
              <span>Apply demo@1234 &amp; Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Full Screen Portal Wipe Transition on Login */}
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
    if (redirectIfAuthenticated()) return;
    document.title = "Login to NEERAKSHAK – Official Portal";
    initLoginPage();

    const handlePageshow = () => {
      redirectIfAuthenticated();
    };
    window.addEventListener('pageshow', handlePageshow);
    return () => window.removeEventListener('pageshow', handlePageshow);
  }, []);

  return (
    <>
      <style>{css}</style>
      {markup}
    </>
  );
}
