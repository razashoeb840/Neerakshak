/**
 * Inter-Portal Live Real-Time Chat & Communications Controller (Neerakshak)
 * Powers real-time messaging between State Monitoring, Admin GIS, District Authority, Central Godown & Ground Officer.
 * Explicitly separates [🔒 PERSONAL / DIRECT TO YOU] vs [📢 COMMON BROADCAST] vs [↗️ SENT BY YOU].
 */

const ROLE_PROFILES = {
  monitoring: {
    role: 'monitoring',
    label: 'State DEOC Monitoring',
    name: 'S. N. Bora (State Monitoring Officer - DEOC)',
    avatarClass: 'avatar-monitoring',
    roleTagClass: 'role-tag-monitoring'
  },
  authority: {
    role: 'authority',
    label: 'District Authority / DDMA',
    name: 'Dr. A. K. Sharma (DM / DDMA Chairman)',
    avatarClass: 'avatar-authority',
    roleTagClass: 'role-tag-authority'
  },
  godown: {
    role: 'godown',
    label: 'Central Godown Manager',
    name: 'Rajesh Das (Warehouse Manager - WH-MIRZA)',
    avatarClass: 'avatar-godown',
    roleTagClass: 'role-tag-godown'
  },
  ground: {
    role: 'ground',
    label: 'Ground Field Officer',
    name: 'Bhaskar Jyoti Das (Ground Officer - GO-KAM-04)',
    avatarClass: 'avatar-ground',
    roleTagClass: 'role-tag-ground'
  },
  admin: {
    role: 'admin',
    label: 'State Admin GIS Command',
    name: 'State Admin GIS Command Desk',
    avatarClass: 'avatar-admin',
    roleTagClass: 'role-tag-admin'
  }
};

const DEFAULT_QUICK_CHIPS = {
  admin: [
    'Flood hazard polygon updated on GIS map',
    'Saura & Kosi water gauge breach telemetry logged',
    'Rainfall radar shows 85mm precipitation in next 6h',
    'Please verify road accessibility for relief trucks'
  ],
  authority: [
    'DDMA emergency supply allocation approved',
    'High-alert evacuation declared for circle',
    'NDRF 1st Bn escort assigned to convoy',
    'Replacement buffer stock sanctioned for ward'
  ],
  godown: [
    'Truck convoy dispatched with armed escort & gate-pass',
    'Emergency buffer prepped for secondary dispatch',
    'Warehouse intake bay inspection completed',
    'Boats and jackets restocked into inventory buffer'
  ],
  ground: [
    'Physical delivery verified & count confirmed at gate',
    'Requesting 2 additional motorized boats for rescue',
    'All evacuated citizens housed in relief shelter',
    'Situation controlled; equipment released for warehouse return'
  ]
};

export function initInterPortalChat({
  portalRole,
  portalName,
  officerName,
  mountSelector,
  badgeSelector = '#navCommsBadge'
}) {
  const mountEl = document.querySelector(mountSelector);
  if (!mountEl) {
    console.warn(`initInterPortalChat: Mount container "${mountSelector}" not found.`);
    return null;
  }

  const currentRole = (portalRole || 'admin').toLowerCase();
  const currentProfile = ROLE_PROFILES[currentRole] || {
    role: currentRole,
    label: portalName || 'Authorized Officer',
    name: officerName || portalName || 'Officer',
    avatarClass: `avatar-${currentRole}`,
    roleTagClass: `role-tag-${currentRole}`
  };

  let allMessages = [];
  let activeFilter = 'all'; // 'all', 'direct', 'common', 'outgoing'
  let pollTimer = null;
  let isSending = false;

  // 1. Render Workspace HTML Skeleton
  mountEl.innerHTML = `
    <div class="intercomms-container">
      <!-- 1. Header Bar -->
      <div class="intercomms-header">
        <div class="intercomms-title-block">
          <div class="intercomms-radio-icon">
            <i class="fas fa-tower-broadcast"></i>
          </div>
          <div class="intercomms-title-text">
            <h3>
              Multi-Agency Live Comms & Direct Dispatch Channel
              <span class="intercomms-live-badge">
                <span class="intercomms-pulse-dot"></span> Real-Time Connected
              </span>
            </h3>
            <p>
              Direct personal messaging & common broadcasts between State Monitoring, Authority, Godown, Ground Units & Admin GIS.
            </p>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:11.5px; color:#475569; background:#ffffff; padding:5px 12px; border-radius:8px; border:1px solid #cbd5e1; font-weight:600;">
            <i class="fas fa-id-badge" style="color:#0284c7;"></i> Logged as: <strong>${currentProfile.name}</strong>
          </span>
          <button type="button" class="btn-mo" id="btnCommsManualSync" style="padding:6px 14px; font-size:11.5px; background:#ffffff; color:#0f172a; border:1px solid #cbd5e1; border-radius:8px; cursor:pointer; font-weight:600;">
            <i class="fas fa-arrows-rotate"></i> Sync
          </button>
        </div>
      </div>

      <!-- 2. Filter Strip -->
      <div class="intercomms-filter-strip">
        <div class="intercomms-pills">
          <button type="button" class="comms-filter-pill active" data-filter="all">
            <i class="fas fa-inbox"></i> All Comms (<span id="commsCountAll">0</span>)
          </button>
          <button type="button" class="comms-filter-pill pill-direct" data-filter="direct">
            <i class="fas fa-lock"></i> 🔒 Direct to You (<span id="commsCountDirect">0</span>)
          </button>
          <button type="button" class="comms-filter-pill pill-common" data-filter="common">
            <i class="fas fa-bullhorn"></i> 📢 Common Broadcasts (<span id="commsCountCommon">0</span>)
          </button>
          <button type="button" class="comms-filter-pill" data-filter="outgoing">
            <i class="fas fa-paper-plane"></i> ↗️ Sent by You (<span id="commsCountOutgoing">0</span>)
          </button>
        </div>

        <div class="intercomms-stats-pill" id="commsStatusFeedback">
          Auto-polling real-time updates (every 2.8s)
        </div>
      </div>

      <!-- 3. Messages Feed -->
      <div class="intercomms-feed" id="commsFeedArea">
        <div class="intercomms-empty">
          <i class="fas fa-circle-notch fa-spin"></i>
          <div>Connecting to multi-agency inter-portal channel...</div>
        </div>
      </div>

      <!-- 4. Comms Composer -->
      <div class="intercomms-composer">
        <form id="commsComposerForm">
          <div class="composer-meta-row">
            <div class="composer-recipient-select-wrap">
              <label class="composer-recipient-label" for="commsRecipientSelect">
                <i class="fas fa-paper-plane"></i> Send Official Communication To:
              </label>
              <select class="composer-recipient-select" id="commsRecipientSelect">
                <option value="all">📢 All Portals (Common Broadcast / सार्वजनिक निर्देश)</option>
                <option value="monitoring">🛡️ State Monitoring Officer (DEOC Command)</option>
                <option value="authority">🏛️ District Magistrate / DDMA Head (Dr. A. K. Sharma)</option>
                <option value="godown">🏭 Central Godown Manager (Rajesh Das - WH-MIRZA)</option>
                <option value="ground">🦺 Ground Field Officer (Bhaskar Jyoti Das - GO-KAM-04)</option>
                <option value="admin">🛰️ State Admin GIS Desk</option>
              </select>
            </div>

            <div>
              <span class="composer-mode-indicator mode-common" id="composerModeBadge">
                <i class="fas fa-bullhorn"></i> Mode: Common Broadcast
              </span>
            </div>
          </div>

          <!-- Quick Response Chips -->
          <div class="composer-quick-chips" id="commsQuickChips"></div>

          <!-- Message Input Row -->
          <div class="composer-input-row">
            <textarea
              class="composer-textarea"
              id="commsTextInput"
              rows="2"
              placeholder="Type your official direct directive or common message..."
              required
            ></textarea>
            <button type="submit" class="composer-btn-send" id="btnCommsSend">
              <i class="fas fa-paper-plane"></i> Send Dispatch
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // 2. Populate Quick Chips
  const quickChipsContainer = mountEl.querySelector('#commsQuickChips');
  const chips = DEFAULT_QUICK_CHIPS[currentRole] || [
    'Coordination update confirmed',
    'Requesting clarification on consignment',
    'Situation report logged'
  ];
  if (quickChipsContainer) {
    quickChipsContainer.innerHTML = chips.map(chip => `
      <button type="button" class="quick-chip" data-chip="${encodeURIComponent(chip)}">
        + ${chip}
      </button>
    `).join('');

    quickChipsContainer.querySelectorAll('.quick-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = decodeURIComponent(e.currentTarget.getAttribute('data-chip') || '');
        const input = mountEl.querySelector('#commsTextInput');
        if (input) {
          input.value = text;
          input.focus();
        }
      });
    });
  }

  // 3. Recipient Selector Handler
  const recipientSel = mountEl.querySelector('#commsRecipientSelect');
  const modeBadge = mountEl.querySelector('#composerModeBadge');

  function updateModeIndicator() {
    if (!recipientSel || !modeBadge) return;
    const val = recipientSel.value;
    if (val === 'all') {
      modeBadge.className = 'composer-mode-indicator mode-common';
      modeBadge.innerHTML = '<i class="fas fa-bullhorn"></i> Mode: Common Broadcast (सार्वजनिक)';
    } else {
      const targetName = ROLE_PROFILES[val]?.label || val.toUpperCase();
      modeBadge.className = 'composer-mode-indicator mode-direct';
      modeBadge.innerHTML = `<i class="fas fa-lock"></i> Mode: Direct to ${targetName}`;
    }
  }

  if (recipientSel) {
    recipientSel.addEventListener('change', updateModeIndicator);
    updateModeIndicator();
  }

  // 4. Filter Button Handlers
  mountEl.querySelectorAll('.comms-filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      mountEl.querySelectorAll('.comms-filter-pill').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeFilter = e.currentTarget.getAttribute('data-filter') || 'all';
      renderMessagesFeed();
    });
  });

  // Manual Sync Button
  const btnSync = mountEl.querySelector('#btnCommsManualSync');
  if (btnSync) {
    btnSync.addEventListener('click', () => {
      fetchMessages(true);
    });
  }

  // 5. Fetch Messages from API
  async function fetchMessages(showToastNotice = false) {
    try {
      const res = await fetch(`/api/monitoring/chat?portal=${encodeURIComponent(currentRole)}`, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      const messages = (json && (json.data || json.chats)) || (Array.isArray(json) ? json : []);

      if (Array.isArray(messages)) {
        allMessages = messages;
        updateCountsAndBadges();
        renderMessagesFeed();
        if (showToastNotice && typeof window.showToast === 'function') {
          window.showToast('Inter-portal communications synchronized.');
        }
      }
    } catch (err) {
      console.warn('Inter-portal chat fetch error:', err);
    }
  }

  // 6. Update Header Filter Counts & Left-Rail Navigation Badge
  function updateCountsAndBadges() {
    let directCount = 0;
    let commonCount = 0;
    let outgoingCount = 0;

    allMessages.forEach(m => {
      const fromRole = (m.fromRole || '').toLowerCase();
      const toRole = (m.toRole || m.channel || 'all').toLowerCase();

      if (fromRole === currentRole) {
        outgoingCount++;
      } else if (toRole === currentRole || m.isDirect) {
        directCount++;
      } else if (toRole === 'all' || m.channel === 'all') {
        commonCount++;
      }
    });

    const setTxt = (id, val) => {
      const el = mountEl.querySelector(id);
      if (el) el.textContent = val;
    };

    setTxt('#commsCountAll', allMessages.length);
    setTxt('#commsCountDirect', directCount);
    setTxt('#commsCountCommon', commonCount);
    setTxt('#commsCountOutgoing', outgoingCount);

    // Update left rail badge
    const railBadge = document.querySelector(badgeSelector);
    if (railBadge) {
      if (directCount > 0) {
        railBadge.textContent = directCount;
        railBadge.style.display = 'inline-block';
        railBadge.title = `${directCount} Direct messages to you`;
      } else if (allMessages.length > 0) {
        railBadge.textContent = allMessages.length;
        railBadge.style.display = 'inline-block';
      }
    }
  }

  // 7. Render Messages Feed with Bold Distinction (Personal vs Common vs Outgoing)
  function renderMessagesFeed() {
    const feed = mountEl.querySelector('#commsFeedArea');
    if (!feed) return;

    let filtered = [...allMessages];
    if (activeFilter === 'direct') {
      filtered = filtered.filter(m => {
        const fromRole = (m.fromRole || '').toLowerCase();
        const toRole = (m.toRole || m.channel || 'all').toLowerCase();
        return fromRole !== currentRole && (toRole === currentRole || m.isDirect);
      });
    } else if (activeFilter === 'common') {
      filtered = filtered.filter(m => {
        const toRole = (m.toRole || m.channel || 'all').toLowerCase();
        return toRole === 'all' || m.channel === 'all';
      });
    } else if (activeFilter === 'outgoing') {
      filtered = filtered.filter(m => (m.fromRole || '').toLowerCase() === currentRole);
    }

    if (filtered.length === 0) {
      feed.innerHTML = `
        <div class="intercomms-empty">
          <i class="fas fa-comment-slash"></i>
          <div style="font-weight:700; color:#475569; margin-bottom:4px;">No messages found in this view</div>
          <div style="font-size:11.5px;">Choose another tab or dispatch a message using the composer below.</div>
        </div>
      `;
      return;
    }

    feed.innerHTML = filtered.map(m => {
      const fromRole = (m.fromRole || 'monitoring').toLowerCase();
      const toRole = (m.toRole || m.channel || 'all').toLowerCase();
      const isOutgoing = fromRole === currentRole;
      const isDirectToMe = !isOutgoing && (toRole === currentRole || m.isDirect);
      const isCommon = toRole === 'all' || m.channel === 'all';

      // Card class
      let cardModifier = 'comms-card-common';
      if (isOutgoing) cardModifier = 'comms-card-outgoing';
      else if (isDirectToMe) cardModifier = 'comms-card-direct';

      // Sender Profile
      const senderProfile = ROLE_PROFILES[fromRole] || {
        name: m.from || 'Officer',
        label: fromRole.toUpperCase(),
        avatarClass: `avatar-${fromRole}`,
        roleTagClass: `role-tag-${fromRole}`
      };

      // Destination Label
      const targetLabel = toRole === 'all'
        ? 'All Portals (Common Broadcast)'
        : (ROLE_PROFILES[toRole]?.label || toRole.toUpperCase());

      // Distinct Badge HTML
      let badgeHtml = '';
      if (isOutgoing) {
        badgeHtml = `
          <span class="comms-badge-pill comms-badge-outgoing">
            <i class="fas fa-paper-plane"></i> ↗️ SENT BY YOU (आपके द्वारा भेजा गया)
          </span>
        `;
      } else if (isDirectToMe) {
        badgeHtml = `
          <span class="comms-badge-pill comms-badge-direct">
            <i class="fas fa-lock"></i> 🔒 DIRECT TO YOU (व्यक्तिगत संदेश)
          </span>
        `;
      } else {
        badgeHtml = `
          <span class="comms-badge-pill comms-badge-common">
            <i class="fas fa-bullhorn"></i> 📢 COMMON BROADCAST (सार्वजनिक निर्देश)
          </span>
        `;
      }

      // Reply Button
      const replyBtn = !isOutgoing
        ? `<button type="button" class="btn-reply-direct" data-reply-role="${fromRole}" data-reply-name="${encodeURIComponent(senderProfile.name)}">
             <i class="fas fa-reply"></i> Reply Directly (व्यक्तिगत उत्तर दें)
           </button>`
        : `<span style="font-size:10px; color:#10b981; font-weight:700;"><i class="fas fa-check-double"></i> Delivered</span>`;

      return `
        <div class="comms-card ${cardModifier}">
          <div class="comms-card-meta">
            <div class="comms-sender-info">
              <div class="comms-sender-avatar ${senderProfile.avatarClass}">
                <i class="fas fa-user-shield"></i>
              </div>
              <div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span class="comms-sender-name">${m.from || senderProfile.name}</span>
                  <span class="comms-role-tag ${senderProfile.roleTagClass}">[${senderProfile.label}]</span>
                </div>
                <div class="comms-target-hint">
                  <i class="fas fa-arrow-right"></i> Addressed To: <strong>${targetLabel}</strong>
                </div>
              </div>
            </div>

            <div>
              ${badgeHtml}
            </div>
          </div>

          <div class="comms-card-text">
            ${m.message || m.text || ''}
          </div>

          <div class="comms-card-footer">
            <span class="comms-time">
              <i class="far fa-clock"></i> ${m.timestamp || 'Live'}
            </span>
            ${replyBtn}
          </div>
        </div>
      `;
    }).join('');

    // Attach Reply Button Click Handlers
    feed.querySelectorAll('.btn-reply-direct').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const replyRole = e.currentTarget.getAttribute('data-reply-role');
        const replyName = decodeURIComponent(e.currentTarget.getAttribute('data-reply-name') || '');
        if (replyRole && recipientSel) {
          recipientSel.value = replyRole;
          updateModeIndicator();
          const input = mountEl.querySelector('#commsTextInput');
          if (input) {
            input.value = `@${replyName.split(' ')[0]}: `;
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    });
  }

  // 8. Handle Message Submission
  const composerForm = mountEl.querySelector('#commsComposerForm');
  if (composerForm) {
    composerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSending) return;

      const input = mountEl.querySelector('#commsTextInput');
      if (!input || !input.value.trim()) return;

      const messageText = input.value.trim();
      const targetRole = recipientSel ? recipientSel.value : 'all';
      const isDirect = targetRole !== 'all';

      isSending = true;
      const btnSend = mountEl.querySelector('#btnCommsSend');
      if (btnSend) btnSend.disabled = true;

      // Optimistic record
      const optimisticRecord = {
        id: `chat-opt-${Date.now()}`,
        channel: isDirect ? targetRole : 'all',
        from: currentProfile.name,
        fromRole: currentRole,
        toRole: targetRole,
        isDirect,
        message: messageText,
        badge: isDirect ? 'PERSONAL DIRECT' : 'COMMON BROADCAST',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };

      allMessages.push(optimisticRecord);
      updateCountsAndBadges();
      renderMessagesFeed();
      input.value = '';

      // Scroll to bottom
      const feed = mountEl.querySelector('#commsFeedArea');
      if (feed) feed.scrollTop = feed.scrollHeight;

      try {
        const res = await fetch('/api/monitoring/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: isDirect ? targetRole : 'all',
            toRole: targetRole,
            from: currentProfile.name,
            fromRole: currentRole,
            sender: currentProfile.name,
            senderRole: currentRole,
            message: messageText,
            badge: isDirect ? 'PERSONAL DIRECT' : 'COMMON BROADCAST'
          })
        });

        if (res.ok) {
          if (typeof window.showToast === 'function') {
            window.showToast(`Official ${isDirect ? 'Direct Message' : 'Common Broadcast'} dispatched.`);
          }
        }
      } catch (err) {
        console.error('Failed to send inter-portal chat:', err);
      } finally {
        isSending = false;
        if (btnSend) btnSend.disabled = false;
        fetchMessages(false);
      }
    });
  }

  // 9. Initial Fetch & Interval Polling (every 2800ms)
  fetchMessages(false);
  pollTimer = setInterval(() => {
    fetchMessages(false);
  }, 2800);

  // Return cleanup function
  return () => {
    if (pollTimer) clearInterval(pollTimer);
  };
}
