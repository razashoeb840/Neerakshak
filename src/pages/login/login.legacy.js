// Official NEERAKSHAK District Portal Authentication Script
// Supports Structured Basin-Specific User IDs (<role><id><state><basin>) & Strict Access Control
import { USER_BASIN_REGISTRY, resolveUserBasin } from '../admin/indiaGisData.js';

export default function initLoginPage() {
  const __ready = [];
  const __onReady = (fn) => __ready.push(fn);

  // Immediately redirect if user already has an active authenticated session
  try {
    const isLogged = sessionStorage.getItem('neerakshak_logged_in') === 'true';
    const hasRole = sessionStorage.getItem('neerakshak_role');
    const hasUser = sessionStorage.getItem('neerakshak_user');
    const isLogout = window.location.search.includes('logout=1');
    if (isLogged && hasRole && hasUser && !isLogout) {
      const roleMap = {
        admin: '/admin',
        authority: '/authority',
        godown: '/godown',
        ground: '/ground-officer',
        monitoring: '/monitoring'
      };
      window.location.replace(roleMap[hasRole] || '/admin');
      return;
    }
  } catch (e) {}

  (function() {
    const ROLES = {
      admin: {
        prefix: 'ad',
        name: 'Admin',
        fullName: 'District Admin Portal (GIS & Telemetry)',
        validPwds: ['demo@1234', 'admin123', 'admin', 'admin@neerakshak'],
        page: '/admin',
        c: '#0066cc',
        c2: '#0284c7',
        desc: '<b>District Admin</b> · Flood monitoring map, river gauges &amp; GIS zone marking'
      },
      authority: {
        prefix: 'au',
        name: 'Authority',
        fullName: 'District Disaster Management Authority (DDMA)',
        validPwds: ['demo@1234', 'authority123', 'dc123', 'ddma123'],
        page: '/authority',
        c: '#0066cc',
        c2: '#0284c7',
        desc: '<b>Authority</b> · Resource allocation &amp; NDRF/SDRF coordination records'
      },
      godown: {
        prefix: 'gd',
        name: 'Godown Manager',
        fullName: 'Central Relief Godown & Inventory Command',
        validPwds: ['demo@1234', 'godown123', 'mgr123', 'relief123'],
        page: '/godown',
        c: '#0066cc',
        c2: '#0284c7',
        desc: '<b>Godown Manager</b> · Inventory, stock &amp; relief dispatch control'
      },
      ground: {
        prefix: 'go',
        name: 'Ground Officer',
        fullName: 'Field Operations & Ground Verification Desk',
        validPwds: ['demo@1234', 'ground123', 'officer123', 'field123'],
        page: '/ground-officer',
        c: '#0066cc',
        c2: '#0284c7',
        desc: '<b>Ground Officer</b> · Delivery &amp; return verification in the field'
      },
      monitoring: {
        prefix: 'mo',
        name: 'Monitoring Officer',
        fullName: 'State DEOC Auditor Portal',
        validPwds: ['demo@1234', 'monitoring123', 'audit123', 'deoc123'],
        page: '/monitoring',
        c: '#0066cc',
        c2: '#0284c7',
        desc: '<b>Monitoring Officer</b> · Common audit dashboard &amp; oversight'
      }
    };

    let role = 'admin';
    let currentBasinKey = 'bk'; // Default to Bihar Kosi Basin
    let capAns = 0;
    const $ = id => document.getElementById(id);
    const root = document.documentElement;

    /* Get Structured Default Officer ID for current Role & Basin */
    function getExpectedUid(rKey, bKey) {
      const bObj = USER_BASIN_REGISTRY[bKey] || USER_BASIN_REGISTRY['bk'];
      return (bObj.demoUser && bObj.demoUser[rKey]) || `${ROLES[rKey].prefix}1558${bKey}`;
    }

    /* Update Format Hint under UID input */
    function updateFormatHint() {
      const hint = $('uidFormatHint');
      const bObj = USER_BASIN_REGISTRY[currentBasinKey] || USER_BASIN_REGISTRY['bk'];
      if (hint) {
        hint.innerHTML = `<i class="fas fa-id-card-clip"></i> Format: <strong>${ROLES[role].prefix}</strong>(${ROLES[role].name.slice(0,5)}) + <strong>uniqueID</strong> + <strong>${bObj.stateCode}</strong>(${bObj.stateName.slice(0,4)}) + <strong>${bObj.basinCode}</strong>(${bObj.basinName.split(' ')[0]}) &rarr; e.g. <code>${getExpectedUid(role, currentBasinKey)}</code>`;
      }
    }

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
      
      const expected = getExpectedUid(role, currentBasinKey);
      if ($('uid')) {
        $('uid').placeholder = `Officer ID (e.g. ${expected})`;
        if (fill) $('uid').value = expected;
      }
      updateFormatHint();
    }

    /* Basin selection logic */
    function setBasin(basinKey, fill) {
      if (!USER_BASIN_REGISTRY[basinKey]) return;
      currentBasinKey = basinKey;
      const basinSel = $('basinSelect');
      if (basinSel && basinSel.value !== basinKey) {
        basinSel.value = basinKey;
      }
      const expected = getExpectedUid(role, currentBasinKey);
      if ($('uid')) {
        $('uid').placeholder = `Officer ID (e.g. ${expected})`;
        if (fill) $('uid').value = expected;
      }
      updateFormatHint();
    }

    /* Basin dropdown event listener */
    if ($('basinSelect')) {
      $('basinSelect').addEventListener('change', (e) => {
        setBasin(e.target.value, true);
        const b = USER_BASIN_REGISTRY[e.target.value];
        if (b) {
          msg(`Switched operational jurisdiction to ${b.stateName} (${b.basinName}).`, 'info');
        }
      });
    }

    /* Role tab button click events */
    document.querySelectorAll('.role').forEach(b => {
      b.addEventListener('click', () => {
        const currentVal = $('uid') ? $('uid').value.trim() : '';
        const isDefaultOrEmpty = !currentVal || Object.keys(ROLES).some(rk => {
          return Object.keys(USER_BASIN_REGISTRY).some(bk => getExpectedUid(rk, bk).toLowerCase() === currentVal.toLowerCase());
        });
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
        if ($('uid') && !$('uid').value.trim()) $('uid').value = getExpectedUid(role, currentBasinKey);
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
          // Sync basin dropdown with remembered user
          const parsed = resolveUserBasin(savedUser);
          if (parsed && $('basinSelect')) {
            $('basinSelect').value = parsed.id;
            currentBasinKey = parsed.id;
          }
          msg('Welcome back! Restored saved credentials for ' + ROLES[savedRole].name + '.', 'info');
        }
      } else {
        setRole('admin', true);
      }
    } catch(e) {
      setRole('admin', true);
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
      const cleanUser = (username || getExpectedUid(activeKey, currentBasinKey)).toLowerCase();
      const basinObj = resolveUserBasin(cleanUser);

      const btn = $('btn');
      if (btn) {
        btn.disabled = true;
        btn.classList.add('loading');
        const steps = [
          `Verifying Officer ID (${cleanUser})…`,
          `Synchronizing ${basinObj.shortName} Telemetry…`,
          `District Clearance Granted ✓`
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

            // Save Session State with Basin Information
            try {
              const sessionPayload = {
                token: 'NEER-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-' + Date.now().toString(36).toUpperCase(),
                user: cleanUser,
                role: activeKey,
                roleName: r.name,
                department: r.fullName,
                basinId: basinObj.id,
                basinName: basinObj.basinName,
                stateName: basinObj.stateName,
                loginTime: new Date().toISOString(),
                status: 'VERIFIED'
              };
              sessionStorage.setItem('neerakshak_session', JSON.stringify(sessionPayload));
              sessionStorage.setItem('neerakshak_role', activeKey);
              sessionStorage.setItem('neerakshak_user', cleanUser);
              sessionStorage.setItem('neerakshak_basin', basinObj.id);
              sessionStorage.setItem('neerakshak_logged_in', 'true');

              // Remember Me Checkbox Handling
              if ($('rem') && $('rem').checked) {
                localStorage.setItem('neerakshak_remembered_uid', cleanUser);
                localStorage.setItem('neerakshak_remembered_role', activeKey);
              } else {
                localStorage.removeItem('neerakshak_remembered_uid');
                localStorage.removeItem('neerakshak_remembered_role');
              }
            } catch (err) {}

            // Fullscreen Wipe Transition to Portal
            setTimeout(() => {
              if ($('wipeTxt')) $('wipeTxt').textContent = `Entering ${r.name} (${basinObj.shortName})…`;
              if ($('wipe')) $('wipe').classList.add('go');
              setTimeout(() => {
                window.location.replace(r.page);
              }, 1100);
            }, 400);
          }
        }, 450);
      }
    }

    /* Form Submit Authentication - STRICT BASIN & ROLE VALIDATION */
    if ($('loginForm')) {
      $('loginForm').addEventListener('submit', e => {
        e.preventDefault();
        const u = $('uid') ? $('uid').value.trim() : '';
        const p = $('pwd') ? $('pwd').value : '';
        const a = $('capA') ? $('capA').value.trim() : '';

        // 1. Mandatory input checks
        if (!u) {
          msg('Please enter your Designated Officer ID (e.g. ' + getExpectedUid(role, currentBasinKey) + ').', 'err');
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

        // 3. Strict Check: Structured UID Format (<role><id><state><basin>)
        const structuredMatch = cleanUid.match(/^([a-z]{2})(\d{1,6})([a-z])([a-z])$/);

        if (structuredMatch) {
          const prefix = structuredMatch[1];
          const basinKey = structuredMatch[3] + structuredMatch[4];

          // Check prefix vs active role
          if (prefix !== currentRoleObj.prefix) {
            // Check if prefix belongs to another role
            const expectedRoleKey = Object.keys(ROLES).find(k => ROLES[k].prefix === prefix);
            if (expectedRoleKey) {
              msg(`Role Mismatch: Prefix "${prefix}" is for ${ROLES[expectedRoleKey].name}. Please select the ${ROLES[expectedRoleKey].name} tab above.`, 'err');
            } else {
              msg(`Invalid Role Prefix "${prefix}". Expected "${currentRoleObj.prefix}" for ${currentRoleObj.name}.`, 'err');
            }
            shake();
            if ($('uid')) $('uid').focus();
            return;
          }

          // Check basinKey
          if (!USER_BASIN_REGISTRY[basinKey]) {
            msg(`Unknown Basin Code "${basinKey}". Valid basin codes: bk (Bihar Kosi), ab (Assam Brahmaputra), bg (Bihar Ganga), ug (UP Ganga), om (Odisha Mahanadi), mp (Maharashtra Panchganga).`, 'err');
            shake();
            if ($('uid')) $('uid').focus();
            return;
          }

          // Automatically sync basin dropdown
          currentBasinKey = basinKey;
          if ($('basinSelect')) $('basinSelect').value = basinKey;
        } else {
          // Check for legacy UID support or general match
          const isLegacyAdmin = cleanUid === 'admin' || cleanUid === 'kamrup_admin_gis';
          const isLegacyAuth = cleanUid === 'authority' || cleanUid === 'kamrup_dc_authority';
          const isLegacyGodown = cleanUid === 'godown' || cleanUid === 'kamrup_godown_mgr';
          const isLegacyGround = cleanUid === 'ground' || cleanUid === 'field_officer_chaygaon';
          const isLegacyMon = cleanUid === 'monitoring' || cleanUid === 'state_deoc_auditor';

          let matchedLegacy = false;
          if (role === 'admin' && isLegacyAdmin) matchedLegacy = true;
          if (role === 'authority' && isLegacyAuth) matchedLegacy = true;
          if (role === 'godown' && isLegacyGodown) matchedLegacy = true;
          if (role === 'ground' && isLegacyGround) matchedLegacy = true;
          if (role === 'monitoring' && isLegacyMon) matchedLegacy = true;

          if (!matchedLegacy) {
            msg(`Access Denied: Officer ID "${u}" must follow format <role><id><state><basin> (e.g. ${getExpectedUid(role, currentBasinKey)}).`, 'err');
            shake();
            if ($('uid')) $('uid').focus();
            return;
          }
        }

        // 4. Strict Check: Password validation
        const isPasswordValid = currentRoleObj.validPwds.includes(p) || p === 'demo@1234';

        if (!isPasswordValid) {
          msg('Access Denied: Incorrect Security PIN / Password for ' + currentRoleObj.name + '. (Default: demo@1234)', 'err');
          shake();
          if ($('pwd')) {
            $('pwd').value = '';
            $('pwd').focus();
          }
          return;
        }

        // 5. Success: Authorized credentials verified
        const basinObj = resolveUserBasin(cleanUid);
        msg(`Credentials verified for ${currentRoleObj.name} • ${basinObj.shortName}. Establishing session…`, 'ok');
        enter(role, cleanUid);
      });
    }

    /* 1-Click Demo Fill & Instant Enter */
    function fillDemo() {
      const expected = getExpectedUid(role, currentBasinKey);
      if ($('uid')) $('uid').value = expected;
      if ($('pwd')) $('pwd').value = 'demo@1234';
      if ($('capA')) $('capA').value = capAns;
    }

    if ($('demoFill')) {
      $('demoFill').onclick = () => {
        fillDemo();
        const b = USER_BASIN_REGISTRY[currentBasinKey];
        msg(`Demo credentials filled for ${ROLES[role].name} • ${b.shortName} (PIN: demo@1234). Click Login.`, 'ok');
      };
    }

    if ($('demoGo')) {
      $('demoGo').onclick = () => {
        fillDemo();
        const expected = getExpectedUid(role, currentBasinKey);
        const b = USER_BASIN_REGISTRY[currentBasinKey];
        msg(`Launching ${ROLES[role].name} (${b.shortName}) demo…`, 'ok');
        enter(role, expected);
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

    /* Global Logout Helper */
    window.neerakshakLogout = function() {
      try {
        sessionStorage.clear();
        sessionStorage.setItem('neerakshak_logged_out', '1');
      } catch(e) {}
      window.location.href = '/login?logout=1';
    };
  })();

  Object.assign(window, {});
  __ready.forEach((fn) => fn());
}
