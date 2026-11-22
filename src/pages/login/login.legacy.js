// Official NEERAKSHAK District Portal Authentication Script
export default function initLoginPage() {
  const __ready = [];
  const __onReady = (fn) => __ready.push(fn);

  (function() {
    const ROLES = {
      admin: {
        name: 'Admin',
        fullName: 'District Admin Portal (GIS & Telemetry)',
        uid: 'KAMRUP_ADMIN_GIS',
        validUids: ['kamrup_admin_gis', 'admin', 'admin@neerakshak.gov.in', 'gis_admin'],
        validPwds: ['demo@1234', 'admin123', 'admin', 'admin@neerakshak'],
        page: '/admin',
        c: '#0066cc',
        c2: '#0284c7',
        desc: '<b>District Admin</b> · Flood monitoring map, river gauges &amp; GIS zone marking'
      },
      authority: {
        name: 'Authority',
        fullName: 'District Disaster Management Authority (DDMA)',
        uid: 'KAMRUP_DC_AUTHORITY',
        validUids: ['kamrup_dc_authority', 'authority', 'dc_kamrup', 'dc', 'authority@neerakshak.gov.in'],
        validPwds: ['demo@1234', 'authority123', 'dc123'],
        page: '/authority',
        c: '#0066cc',
        c2: '#0284c7',
        desc: '<b>Authority</b> · Resource allocation &amp; NDRF/SDRF coordination records'
      },
      godown: {
        name: 'Godown Manager',
        fullName: 'Central Relief Godown & Inventory Command',
        uid: 'KAMRUP_GODOWN_MGR',
        validUids: ['kamrup_godown_mgr', 'godown', 'godown_mgr', 'godown@neerakshak.gov.in', 'relief_godown'],
        validPwds: ['demo@1234', 'godown123', 'mgr123'],
        page: '/godown',
        c: '#0066cc',
        c2: '#0284c7',
        desc: '<b>Godown Manager</b> · Inventory, stock &amp; relief dispatch control'
      },
      ground: {
        name: 'Ground Officer',
        fullName: 'Field Operations & Ground Verification Desk',
        uid: 'FIELD_OFFICER_CHAYGAON',
        validUids: ['field_officer_chaygaon', 'ground', 'ground_officer', 'field_officer', 'ground@neerakshak.gov.in', 'go-kam-04'],
        validPwds: ['demo@1234', 'ground123', 'officer123'],
        page: '/ground-officer',
        c: '#0066cc',
        c2: '#0284c7',
        desc: '<b>Ground Officer</b> · Delivery &amp; return verification in the field'
      },
      monitoring: {
        name: 'Monitoring Officer',
        fullName: 'State DEOC Auditor Portal',
        uid: 'STATE_DEOC_AUDITOR',
        validUids: ['state_deoc_auditor', 'monitoring', 'monitor', 'auditor', 'monitoring@neerakshak.gov.in'],
        validPwds: ['demo@1234', 'monitoring123', 'audit123'],
        page: '/monitoring',
        c: '#0066cc',
        c2: '#0284c7',
        desc: '<b>Monitoring Officer</b> · Common audit dashboard &amp; oversight'
      }
    };

    let role = 'admin', capAns = 0;
    const $ = id => document.getElementById(id);
    const root = document.documentElement;

    /* Role selection logic */
    function setRole(key, fill) {
      if (!ROLES[key]) return;
      role = key;
      const r = ROLES[key];
      document.querySelectorAll('.role').forEach(b => {
        b.classList.toggle('active', b.dataset.role === key);
      });
      root.style.setProperty('--accent', r.c);
      root.style.setProperty('--accent-2', r.c2);
      if ($('roleDesc')) $('roleDesc').innerHTML = r.desc;
      if ($('uid')) {
        $('uid').placeholder = 'Officer ID (e.g. ' + r.uid + ')';
        if (fill) $('uid').value = r.uid;
      }
    }

    /* Role tab button click events */
    document.querySelectorAll('.role').forEach(b => {
      b.addEventListener('click', () => {
        const currentVal = $('uid') ? $('uid').value.trim() : '';
        const isDefaultOrEmpty = !currentVal || Object.values(ROLES).some(x => x.uid === currentVal || x.validUids.includes(currentVal.toLowerCase()));
        setRole(b.dataset.role, isDefaultOrEmpty);
      });
    });

    /* Eye toggle for password visibility */
    if ($('eye')) {
      $('eye').onclick = () => {
        const p = $('pwd');
        if (!p) return;
        const isPass = p.type === 'password';
        p.type = isPass ? 'text' : 'password';
        $('eye').innerHTML = '<i class="fas fa-' + (isPass ? 'eye' : 'eye-slash') + '"></i>';
      };
    }

    /* Caps Lock indicator */
    if ($('pwd') && $('caps')) {
      ['keydown', 'keyup'].forEach(ev => {
        $('pwd').addEventListener(ev, e => {
          const isCaps = e.getModifierState && e.getModifierState('CapsLock');
          $('caps').classList.toggle('on', Boolean(isCaps));
        });
      });
    }

    /* Security Math Verification (Anti-bot Captcha) */
    function newCap() {
      const isAdd = Math.random() > 0.35;
      let a, b;
      if (isAdd) {
        a = 2 + Math.floor(Math.random() * 8);
        b = 2 + Math.floor(Math.random() * 8);
        capAns = a + b;
        if ($('capQ')) $('capQ').textContent = a + ' + ' + b + ' = ?';
      } else {
        a = 8 + Math.floor(Math.random() * 9);
        b = 2 + Math.floor(Math.random() * 5);
        capAns = a - b;
        if ($('capQ')) $('capQ').textContent = a + ' - ' + b + ' = ?';
      }
      if ($('capA')) $('capA').value = '';
    }
    if ($('capRefresh')) $('capRefresh').onclick = newCap;
    newCap();

    /* Feedback Messages & Shake Animation */
    function msg(text, type) {
      const m = $('msg');
      if (!m) return;
      m.className = 'msg show ' + (type || 'ok');
      const icon = type === 'err' ? 'circle-exclamation' : (type === 'info' ? 'circle-info' : 'circle-check');
      m.innerHTML = '<i class="fas fa-' + icon + '"></i> ' + text;
    }

    function shake() {
      const w = document.querySelector('.card');
      if (w) {
        w.classList.remove('shake');
        void w.offsetWidth;
        w.classList.add('shake');
      }
    }

    /* Forgot Password Modal logic */
    function openForgotModal() {
      const modal = $('forgotModal');
      if (modal) modal.classList.add('open');
    }
    function closeForgotModal() {
      const modal = $('forgotModal');
      if (modal) modal.classList.remove('open');
    }

    if ($('forgot')) {
      $('forgot').onclick = e => {
        e.preventDefault();
        openForgotModal();
      };
    }
    if ($('forgotClose')) {
      $('forgotClose').onclick = closeForgotModal;
    }
    if ($('forgotModal')) {
      $('forgotModal').addEventListener('click', e => {
        if (e.target === $('forgotModal')) closeForgotModal();
      });
    }
    if ($('forgotApplyDemo')) {
      $('forgotApplyDemo').onclick = () => {
        if ($('pwd')) $('pwd').value = 'demo@1234';
        if ($('uid') && !$('uid').value.trim()) $('uid').value = ROLES[role].uid;
        if ($('capA')) $('capA').value = capAns;
        closeForgotModal();
        msg('Official demo PIN (demo@1234) applied. Click Login to authenticate.', 'ok');
      };
    }

    /* Restore remembered credentials */
    try {
      const savedRole = localStorage.getItem('neerakshak_remembered_role');
      const savedUser = localStorage.getItem('neerakshak_remembered_uid');
      if (savedRole && ROLES[savedRole]) {
        setRole(savedRole, false);
        if (savedUser) {
          if ($('uid')) $('uid').value = savedUser;
          if ($('rem')) $('rem').checked = true;
          msg('Welcome back! Restored saved credentials for ' + ROLES[savedRole].name + '.', 'info');
        }
      } else {
        setRole('admin', false);
      }
    } catch(e) {
      setRole('admin', false);
    }

    /* Detect logout notification */
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth_required') === '1') {
        msg('Access Denied: Please log in with authorized credentials to access this portal.', 'err');
        shake();
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else if (params.get('logout') === '1' || sessionStorage.getItem('neerakshak_logged_out') === '1') {
        sessionStorage.removeItem('neerakshak_logged_out');
        msg('You have been securely logged out from the operational session.', 'ok');
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch(e) {}

    /* Smooth Portal Entry Sequence */
    function enter(targetRole, username) {
      const activeKey = targetRole || role;
      const r = ROLES[activeKey] || ROLES.admin;
      const btn = $('btn');
      if (btn) {
        btn.disabled = true;
        btn.classList.add('loading');
        const steps = [
          'Verifying Officer ID…',
          'Validating DEOC clearance…',
          'District Clearance Granted ✓'
        ];
        let i = 0;
        if (btn.querySelector('span')) btn.querySelector('span').textContent = steps[0];
        if (btn.querySelector('i')) btn.querySelector('i').className = 'fas fa-circle-notch fa-spin';

        const t = setInterval(() => {
          i++;
          if (i < steps.length && btn.querySelector('span')) {
            btn.querySelector('span').textContent = steps[i];
          }
          if (i === steps.length - 1) {
            btn.classList.add('done');
            if (btn.querySelector('i')) btn.querySelector('i').className = 'fas fa-circle-check';
            clearInterval(t);

            // Save Session State
            try {
              const sessionPayload = {
                token: 'NEER-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-' + Date.now().toString(36).toUpperCase(),
                user: username || r.uid,
                role: activeKey,
                roleName: r.name,
                department: r.fullName,
                loginTime: new Date().toISOString(),
                status: 'VERIFIED'
              };
              sessionStorage.setItem('neerakshak_session', JSON.stringify(sessionPayload));
              sessionStorage.setItem('neerakshak_role', activeKey);
              sessionStorage.setItem('neerakshak_user', username || r.uid);
              sessionStorage.setItem('neerakshak_logged_in', 'true');

              // Remember Me Checkbox Handling
              if ($('rem') && $('rem').checked) {
                localStorage.setItem('neerakshak_remembered_uid', username || r.uid);
                localStorage.setItem('neerakshak_remembered_role', activeKey);
              } else {
                localStorage.removeItem('neerakshak_remembered_uid');
                localStorage.removeItem('neerakshak_remembered_role');
              }
            } catch (err) {}

            // Fullscreen Wipe Transition to Portal
            setTimeout(() => {
              if ($('wipeTxt')) $('wipeTxt').textContent = 'Entering ' + r.fullName + '…';
              if ($('wipe')) $('wipe').classList.add('go');
              setTimeout(() => {
                window.location.replace(r.page);
              }, 1100);
            }, 400);
          }
        }, 500);
      }
    }

    /* Form Submit Authentication - STRICT VALIDATION */
    if ($('loginForm')) {
      $('loginForm').addEventListener('submit', e => {
        e.preventDefault();
        const u = $('uid') ? $('uid').value.trim() : '';
        const p = $('pwd') ? $('pwd').value : '';
        const a = $('capA') ? $('capA').value.trim() : '';

        // 1. Mandatory input checks
        if (!u) {
          msg('Please enter your Designated Officer ID.', 'err');
          shake();
          if ($('uid')) $('uid').focus();
          return;
        }

        if (!p) {
          msg('Please enter your Official Security PIN / Password.', 'err');
          shake();
          if ($('pwd')) $('pwd').focus();
          return;
        }

        // 2. Captcha verification
        if (!a || parseInt(a, 10) !== capAns) {
          msg('Security verification answer is incorrect. Try again.', 'err');
          shake();
          newCap();
          if ($('capA')) $('capA').focus();
          return;
        }

        const currentRoleObj = ROLES[role];
        const cleanUid = u.toLowerCase();

        // 3. Strict Check: Does UID match the currently selected role?
        const isUidValid = currentRoleObj.validUids.includes(cleanUid) || cleanUid === currentRoleObj.uid.toLowerCase();

        if (!isUidValid) {
          // Check if it belongs to a different role
          const otherRoleKey = Object.keys(ROLES).find(k => {
            const ro = ROLES[k];
            return ro.validUids.includes(cleanUid) || cleanUid === ro.uid.toLowerCase();
          });

          if (otherRoleKey) {
            msg('Role Mismatch: Officer ID "' + u + '" belongs to "' + ROLES[otherRoleKey].name + '". Please select the ' + ROLES[otherRoleKey].name + ' tab above.', 'err');
          } else {
            msg('Access Denied: Officer ID "' + u + '" is not recognized for ' + currentRoleObj.name + '. (e.g. ' + currentRoleObj.uid + ')', 'err');
          }
          shake();
          if ($('uid')) $('uid').focus();
          return;
        }

        // 4. Strict Check: Does Password match the authorized passwords for this role?
        const isPasswordValid = currentRoleObj.validPwds.includes(p);

        if (!isPasswordValid) {
          msg('Access Denied: Incorrect Security PIN / Password for ' + currentRoleObj.name + '. (Default: demo@1234)', 'err');
          shake();
          if ($('pwd')) {
            $('pwd').value = '';
            $('pwd').focus();
          }
          return;
        }

        // 5. Success: Authorized credentials
        msg('Credentials verified. Establishing secure district session…', 'ok');
        enter(role, u);
      });
    }

    /* 1-Click Demo Fill & Instant Enter */
    function fillDemo() {
      if ($('uid')) $('uid').value = ROLES[role].uid;
      if ($('pwd')) $('pwd').value = 'demo@1234';
      if ($('capA')) $('capA').value = capAns;
    }

    if ($('demoFill')) {
      $('demoFill').onclick = () => {
        fillDemo();
        msg('Demo credentials filled for ' + ROLES[role].name + ' (PIN: demo@1234). Click Login.', 'ok');
      };
    }

    if ($('demoGo')) {
      $('demoGo').onclick = () => {
        fillDemo();
        msg('Launching ' + ROLES[role].fullName + ' demo…', 'ok');
        enter(role, ROLES[role].uid);
      };
    }

    /* Real-time IST Clock display */
    function tick() {
      const d = new Date();
      if ($('clkTime')) $('clkTime').textContent = d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
      if ($('clkDate')) $('clkDate').textContent = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) + ' IST';
    }
    tick();
    setInterval(tick, 1000);

    /* Rainfall Particle Effect */
    const dr = $('drops');
    if (dr && dr.children.length === 0) {
      for (let i = 0; i < 35; i++) {
        const s = document.createElement('span');
        s.className = 'drop';
        s.style.left = (Math.random() * 100) + 'vw';
        s.style.animationDuration = (1.2 + Math.random() * 1.6) + 's';
        s.style.animationDelay = (-Math.random() * 3) + 's';
        s.style.opacity = (0.25 + Math.random() * 0.5);
        dr.appendChild(s);
      }
    }

    /* 3D Tilt on Desktop */
    const tilt = $('tilt');
    if (tilt && window.matchMedia('(min-width:1101px) and (pointer:fine)').matches) {
      window.addEventListener('mousemove', e => {
        const r = tilt.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / window.innerWidth, dy = (e.clientY - cy) / window.innerHeight;
        tilt.style.transform = 'perspective(1100px) rotateY(' + (dx * 5).toFixed(2) + 'deg) rotateX(' + (-dy * 5).toFixed(2) + 'deg)';
      });
    }

    /* Global Logout Helper */
    window.neerakshakLogout = function() {
      try {
        sessionStorage.clear();
        sessionStorage.setItem('neerakshak_logged_out', '1');
      } catch(e) {}
      window.location.href = '/login?logout=1';
    };
  })();

  // Inline handlers support
  Object.assign(window, {});
  __ready.forEach((fn) => fn());
}
