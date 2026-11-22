// Official NEERAKSHAK Home Page Client Script
export default function initHomePage() {
  const __ready = [];
  const __onReady = (fn) => __ready.push(fn);

  /* =====================================================================
     1. Scroll Progress & Scroll Animations
     ===================================================================== */
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const b = document.body;
    const st = 'scrollTop';
    const sh = 'scrollHeight';
    const percent = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100;
    const bar = document.getElementById('scrollProgressBar');
    if (bar) bar.style.width = percent + '%';
  });

  function initScrollAnimations() {
    const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-pop');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });
    elements.forEach(el => observer.observe(el));
  }

  /* =====================================================================
     2. Dynamic Rendering from Seed Data
     ===================================================================== */
  function renderSeedData() {
    const data = window.NEERAKSHAK_SEED_DATA || {};

    // A. River Telemetry Card (Hero)
    const riverBox = document.getElementById('seedRiverList');
    if (riverBox) {
      if (data.riverTelemetry && data.riverTelemetry.length > 0) {
        riverBox.innerHTML = data.riverTelemetry.map(item => `
          <div class="river-stat-row">
            <div class="river-name-meta">
              ${item.iconType === 'waves' ? `
                <svg width="15" height="11" viewBox="0 0 15 11" fill="none" style="flex-shrink:0;">
                  <path d="M1 2.5C2.8 1 4.5 4 6.3 2.5C8.1 1 9.8 4 11.6 2.5C12.8 1.5 13.8 2 14.2 2.5" stroke="#0284c7" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M1 5.8C2.8 4.3 4.5 7.3 6.3 5.8C8.1 4.3 9.8 7.3 11.6 5.8C12.8 4.8 13.8 5.3 14.2 5.8" stroke="#0284c7" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M1 9.2C2.8 7.7 4.5 10.7 6.3 9.2C8.1 7.7 9.8 10.7 11.6 9.2C12.8 8.2 13.8 8.7 14.2 9.2" stroke="#0284c7" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              ` : `<span class="bar-icon bar-${item.barColor || 'amber'}"></span>`}
              <span class="river-name">${item.name}</span>
            </div>
            <div class="river-val-badge">
              <span class="river-level">${(item.level || '').replace(/\s+/g, '&nbsp;')}</span>
              <span class="status-chip chip-${item.severity || 'normal'}">${item.arrow || ''} ${item.status}</span>
            </div>
          </div>
        `).join('');
      } else {
        riverBox.innerHTML = `
          <div style="padding: 10px; text-align: center; color: #64748b; font-size: 11.5px; background: #f8fafc; border-radius: 8px;">
            <i class="fas fa-satellite-dish" style="color: #0284c7; margin-bottom: 4px;"></i><br>
            Awaiting telemetry feed from CWC gauge endpoints
          </div>
        `;
      }
    }

    // B. Live News Bulletin Ticker
    const tickerBox = document.getElementById('seedTickerTrack');
    if (tickerBox) {
      if (data.liveNewsTicker && data.liveNewsTicker.length > 0) {
        const dup = [...data.liveNewsTicker, ...data.liveNewsTicker];
        tickerBox.innerHTML = dup.map(text => `
          <span class="ticker-item">${text}</span>
          <span class="ticker-sep">|</span>
        `).join('');
      } else {
        tickerBox.innerHTML = `<span class="ticker-item">DEOC 24×7 Emergency Control: 1077 | National Emergency: 112</span>`;
      }
    }

    // C. 6 Stats Cards Below Live News
    const statsBox = document.getElementById('seedStatsGrid');
    if (statsBox) {
      if (data.districtStats && data.districtStats.length > 0) {
        statsBox.innerHTML = data.districtStats.map(stat => `
          <div class="stat-pill-card">
            <div class="stat-icon-wrap icon-${stat.theme || 'blue'}">
              <i class="${stat.icon}"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">${stat.value}</span>
              <span class="stat-title">${stat.label}</span>
            </div>
          </div>
        `).join('');
      } else {
        statsBox.innerHTML = '';
      }
    }

    // D. Latest Updates & News with Media Thumbnails
    const newsBox = document.getElementById('seedNewsStack');
    if (newsBox) {
      if (data.latestNewsUpdates && data.latestNewsUpdates.length > 0) {
        newsBox.innerHTML = data.latestNewsUpdates.map(news => `
          <article class="news-item-row" onclick="openCitizenModal('news')">
            <div class="news-thumb-wrap">
              <img src="${news.image}" alt="${news.headline}" class="news-thumb-img" onerror="this.src='/Gemini_Generated_Image_q9w16bq9w16bq9w1.png';" />
            </div>
            <div class="news-item-body">
              <span class="news-category-pill ${news.categoryClass || 'cat-river'}">${news.category}</span>
              <h4 class="news-item-headline">${news.headline}</h4>
              <div class="news-item-meta">
                <i class="far fa-clock"></i> ${news.timestamp}
              </div>
            </div>
          </article>
        `).join('');
      } else {
        newsBox.innerHTML = `
          <div style="padding: 14px; text-align: center; color: #64748b; font-size: 11.5px; background: #f8fafc; border-radius: 8px;">
            No unread press bulletins in queue
          </div>
        `;
      }
    }
  }

  /* =====================================================================
     3. Helper Utilities (Toasts, Copy, Font Size, Theme)
     ===================================================================== */
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.right = '20px';
    setTimeout(() => { t.style.right = '-380px'; }, 3200);
  }

  function copyNumber(num) {
    navigator.clipboard.writeText(num).then(() => {
      showToast('Copied helpline number: ' + num);
    }).catch(() => {
      showToast('Emergency helpline: ' + num);
    });
  }

  function adjustFontSize(delta) {
    const root = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(root).fontSize) || 16;
    if (delta === 0) root.style.fontSize = '16px';
    else root.style.fontSize = Math.min(20, Math.max(13, currentSize + delta)) + 'px';
    showToast('Display text size adjusted');
  }

  function toggleTheme() {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    if (icon.classList.contains('fa-moon')) {
      icon.classList.replace('fa-moon', 'fa-sun');
      showToast('High-contrast daytime view active');
    } else {
      icon.classList.replace('fa-sun', 'fa-moon');
      showToast('Standard government portal view active');
    }
  }

  /* =====================================================================
     4. Dynamic Navbar Auth State: Official Login vs Officer Profile
     ===================================================================== */
  const ROLE_CONFIG = {
    admin: {
      name: 'Admin',
      fullName: 'District Admin (GIS Command)',
      page: '/admin',
      icon: 'fa-shield-halved',
      color: '#0284c7',
      bg: '#e0f2fe'
    },
    authority: {
      name: 'Authority',
      fullName: 'District Authority (DDMA)',
      page: '/authority',
      icon: 'fa-user-tie',
      color: '#0f766e',
      bg: '#ccfbf1'
    },
    godown: {
      name: 'Godown Mgr',
      fullName: 'Central Relief Godown',
      page: '/godown',
      icon: 'fa-warehouse',
      color: '#ea580c',
      bg: '#ffedd5'
    },
    ground: {
      name: 'Ground Officer',
      fullName: 'Field Operations Desk',
      page: '/ground-officer',
      icon: 'fa-helmet-safety',
      color: '#15803d',
      bg: '#dcfce7'
    },
    monitoring: {
      name: 'Monitoring',
      fullName: 'State DEOC Auditor',
      page: '/monitoring',
      icon: 'fa-chart-line',
      color: '#6d28d9',
      bg: '#ede9fe'
    }
  };

  function checkNavAuthStatus() {
    const loginBtn = document.getElementById('navOfficialLogin');
    const profileWrap = document.getElementById('navOfficerProfile');
    if (!loginBtn || !profileWrap) return;

    let isLoggedIn = false;
    let roleKey = '';
    let officerUser = '';

    try {
      const loggedInFlag = sessionStorage.getItem('neerakshak_logged_in');
      const role = sessionStorage.getItem('neerakshak_role');
      const user = sessionStorage.getItem('neerakshak_user');

      if (loggedInFlag === 'true' && role && ROLE_CONFIG[role]) {
        isLoggedIn = true;
        roleKey = role;
        officerUser = user || '';
      }
    } catch (e) {}

    if (isLoggedIn && ROLE_CONFIG[roleKey]) {
      const conf = ROLE_CONFIG[roleKey];
      loginBtn.style.display = 'none';
      profileWrap.style.display = 'inline-flex';

      const nameEl = document.getElementById('navOfficerName');
      const roleBadge = document.getElementById('navOfficerRoleBadge');
      const avatarEl = document.getElementById('navOfficerAvatar');
      const dropId = document.getElementById('dropdownOfficerId');
      const dropRole = document.getElementById('dropdownRoleName');
      const dashLink = document.getElementById('dropdownDashboardLink');
      const dropAvatar = document.getElementById('dropdownAvatar');

      if (nameEl) nameEl.textContent = officerUser || conf.name;
      if (roleBadge) {
        roleBadge.textContent = conf.name;
        roleBadge.style.backgroundColor = conf.color;
      }
      if (avatarEl) {
        avatarEl.innerHTML = '<i class="fas ' + conf.icon + '"></i>';
        avatarEl.style.backgroundColor = conf.bg;
        avatarEl.style.color = conf.color;
      }
      if (dropId) dropId.textContent = officerUser || conf.name;
      if (dropRole) dropRole.textContent = conf.fullName;
      if (dashLink) dashLink.href = conf.page;
      if (dropAvatar) {
        dropAvatar.innerHTML = '<i class="fas ' + conf.icon + '"></i>';
        dropAvatar.style.backgroundColor = conf.bg;
        dropAvatar.style.color = conf.color;
      }
    } else {
      loginBtn.style.display = 'inline-flex';
      profileWrap.style.display = 'none';
    }
  }

  function toggleOfficerDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('officerDropdown');
    const caret = document.getElementById('navOfficerCaret');
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('show');
    if (isOpen) {
      dropdown.classList.remove('show');
      if (caret) caret.style.transform = 'rotate(0deg)';
    } else {
      dropdown.classList.add('show');
      if (caret) caret.style.transform = 'rotate(180deg)';
    }
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const profile = document.getElementById('navOfficerProfile');
    const dropdown = document.getElementById('officerDropdown');
    const caret = document.getElementById('navOfficerCaret');
    if (dropdown && dropdown.classList.contains('show')) {
      if (!profile || !profile.contains(e.target)) {
        dropdown.classList.remove('show');
        if (caret) caret.style.transform = 'rotate(0deg)';
      }
    }
  });

  // Global logout helper
  window.neerakshakLogout = function() {
    try {
      sessionStorage.clear();
      sessionStorage.setItem('neerakshak_logged_out', '1');
    } catch (e) {}
    window.location.href = '/login?logout=1';
  };

  /* =====================================================================
     5. Citizen Service & Information Modals
     ===================================================================== */
  function openCitizenModal(type) {
    const modal = document.getElementById('serviceModal');
    const title = document.getElementById('serviceModalTitle');
    const body = document.getElementById('serviceModalBody');
    if (!modal) return;

    if (type === 'alerts') {
      title.textContent = 'Official District Flood Alerts & Warnings';
      body.innerHTML = `
        <div style="background:#fee2e2; border-left:4px solid #dc2626; padding:10px; border-radius:6px; margin-bottom:10px;">
          <strong style="color:#b91c1c;">RED ALERT: Brahmaputra River Basin</strong>
          <p style="margin:4px 0 0 0; font-size:12px; color:#7f1d1d;">
            Water level in river Brahmaputra at Kamrup station stands at <strong>18.2 m</strong> (0.2 m above Danger Mark). Embankments in Palashbari and Chaygaon under 24×7 patrol.
          </p>
        </div>
        <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:10px; border-radius:6px;">
          <strong style="color:#92400e;">AMBER WARNING: Kolong Basin</strong>
          <p style="margin:4px 0 0 0; font-size:12px; color:#78350f;">
            Water level at 14.6 m, rising steadily. Low-lying residents advised to prepare emergency kits.
          </p>
        </div>
      `;
    } else if (type === 'camps') {
      title.textContent = 'Designated Active Relief Camps (Kamrup District)';
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
            <strong>Palashbari Higher Secondary School Relief Camp</strong>
            <div style="font-size:11.5px; color:#475569; margin-top:2px;">
              Capacity: 500 Persons • Drinking Water & Medical First Aid Available • Contact: 1077
            </div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
            <strong>Chaygaon Community Hall Relief Center</strong>
            <div style="font-size:11.5px; color:#475569; margin-top:2px;">
              Capacity: 350 Persons • Sanitation & Cooked Food Supply Active • Contact: 1077
            </div>
          </div>
        </div>
      `;
    } else if (type === 'contacts') {
      title.textContent = 'Emergency Assistance Helpline Directory';
      body.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px; border-radius:8px; text-align:center;">
            <strong style="font-size:18px; color:#15803d;">112</strong>
            <span style="display:block; font-size:11px; color:#14532d;">National Emergency Response</span>
          </div>
          <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:10px; border-radius:8px; text-align:center;">
            <strong style="font-size:18px; color:#1d4ed8;">1077</strong>
            <span style="display:block; font-size:11px; color:#1e40af;">District Emergency Operations Center</span>
          </div>
          <div style="background:#fef2f2; border:1px solid #fecaca; padding:10px; border-radius:8px; text-align:center;">
            <strong style="font-size:18px; color:#dc2626;">108</strong>
            <span style="display:block; font-size:11px; color:#991b1b;">24×7 Ambulance Service</span>
          </div>
          <div style="background:#faf5ff; border:1px solid #e9d5ff; padding:10px; border-radius:8px; text-align:center;">
            <strong style="font-size:18px; color:#7e22ce;">1070</strong>
            <span style="display:block; font-size:11px; color:#6b21a8;">State Disaster Control Room</span>
          </div>
        </div>
      `;
    } else if (type === 'weather') {
      title.textContent = 'District Meteorological & Rainfall Advisory';
      body.innerHTML = `
        <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:12px;">
          <strong>Regional Weather Warning (Next 24–48 Hours)</strong>
          <p style="margin:6px 0 0; font-size:12px; color:#0369a1; line-height:1.45;">
            Heavy to very heavy precipitation forecast across Upper Assam catchment basins. Estimated 65–90 mm rainfall expected. River Brahmaputra gauge expected to crest near 18.4 m.
          </p>
        </div>
      `;
    } else if (type === 'news') {
      title.textContent = 'District Flood Bulletins & News';
      const data = window.NEERAKSHAK_SEED_DATA || {};
      const list = data.latestNewsUpdates || [];
      body.innerHTML = list.map(n => `
        <div style="border-bottom:1px solid #e2e8f0; padding:8px 0;">
          <span style="font-size:10px; font-weight:800; background:#dbeafe; color:#0369a1; padding:2px 6px; border-radius:6px;">${n.category}</span>
          <h4 style="margin:4px 0 2px; font-size:12.5px;">${n.headline}</h4>
          <p style="margin:0; font-size:11.5px; color:#475569;">${n.details}</p>
        </div>
      `).join('') || '<p>No announcements.</p>';
    } else if (type === 'safety') {
      const el = document.getElementById('preparedness');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    } else if (type === 'support') {
      title.textContent = 'Relief Supplies & Public Support';
      body.innerHTML = `
        <p style="font-size:12px; color:#334155; line-height:1.5;">
          Emergency relief consignments (dry food packets, drinking water canisters, water purification drops, and baby food) are supplied free of cost at authorized relief camps. If your area requires air-dropped supplies, call District DEOC at 1077.
        </p>
      `;
    }
    modal.classList.add('open');
  }

  function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    if (modal) modal.classList.remove('open');
  }

  function openFeatureModal(feat) {
    const titleMap = {
      monitoring: 'Real-time River & Weather Monitoring',
      gis: 'Flood Risk & Affected Area Mapping',
      inventory: 'Resource & Inventory Management',
      coordination: 'Relief & Rescue Coordination (NDRF / SDRF)',
      tracking: 'Dispatch, Delivery & Return Tracking',
      reporting: 'Incident & Situation Reporting'
    };
    openCitizenModal('support');
    const t = document.getElementById('serviceModalTitle');
    if (t) t.textContent = titleMap[feat] || 'Platform Feature';
  }

  // Incident Form Modal
  function openIncidentReportModal() {
    const modal = document.getElementById('incidentModal');
    if (modal) modal.classList.add('open');
  }

  function closeIncidentModal() {
    const modal = document.getElementById('incidentModal');
    if (modal) modal.classList.remove('open');
  }

  function handleIncidentSubmit(e) {
    e.preventDefault();
    closeIncidentModal();
    showToast('Incident recorded! Dispatched to District Control Room.');
  }

  // GIS Map Modal
  function openLiveMapModal() {
    const modal = document.getElementById('mapModal');
    if (modal) modal.classList.add('open');
  }

  function closeMapModal() {
    const modal = document.getElementById('mapModal');
    if (modal) modal.classList.remove('open');
  }

  function toggleMapFullscreen() {
    const box = document.getElementById('mapModalContainer');
    const icon = document.getElementById('mapExpandIcon');
    if (!box || !icon) return;
    if (box.style.maxWidth === '98vw') {
      box.style.maxWidth = '960px';
      icon.classList.replace('fa-compress', 'fa-expand');
    } else {
      box.style.maxWidth = '98vw';
      icon.classList.replace('fa-expand', 'fa-compress');
    }
  }

  // Initialize on DOM load
  __onReady(() => {
    renderSeedData();
    initScrollAnimations();
    checkNavAuthStatus();
    window.addEventListener('pageshow', checkNavAuthStatus);
  });

  // Global window functions
  Object.assign(window, {
    adjustFontSize,
    checkNavAuthStatus,
    closeIncidentModal,
    closeLoginModal: () => {},
    closeMapModal,
    closeRolePortalModal: () => {},
    closeServiceModal,
    copyNumber,
    handleIncidentSubmit,
    initScrollAnimations,
    openCitizenModal,
    openFeatureModal,
    openIncidentReportModal,
    openLiveMapModal,
    openLoginModal: () => { window.location.href = '/login'; },
    renderSeedData,
    showToast,
    toggleMapFullscreen,
    toggleOfficerDropdown,
    toggleTheme
  });
  __ready.forEach((fn) => fn());
}
