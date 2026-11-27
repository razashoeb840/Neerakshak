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
      <!-- 1. Header with Slider Toggle (All vs For You) -->
      <div class="intercomms-header-chat">
        <div class="comms-slider-track">
          <button type="button" class="comms-slide-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
            <i class="fas fa-bullhorn"></i> All Messages (<span id="commsCountAll">0</span>)
          </button>
          <button type="button" class="comms-slide-btn ${activeFilter === 'direct' ? 'active' : ''}" data-filter="direct">
            <i class="fas fa-lock"></i> 🔒 For You / Direct (<span id="commsCountDirect">0</span>)
          </button>
        </div>

        <div class="comms-header-right-meta">
          <span class="comms-role-badge-current">
            <span class="comms-status-pulse"></span>
            <strong>${currentProfile.name}</strong>
          </span>
          <button type="button" class="comms-sync-btn" id="btnCommsManualSync" title="Sync Live Messages">
            <i class="fas fa-arrows-rotate"></i>
          </button>
        </div>
      </div>

      <!-- 2. Messenger Bubble Feed -->
      <div class="intercomms-bubble-feed" id="commsFeedArea">
        <div class="intercomms-empty">
          <i class="fas fa-comments"></i>
          <div style="font-weight:700; color:#475569; margin: 4px 0;">No communications yet.</div>
          <div style="font-size:12px; color:#64748b;">Send a direct message or broadcast to coordinate below.</div>
        </div>
      </div>

      <!-- 3. Rectangular Bottom Input Field -->
      <div class="intercomms-bottom-bar">
        <form id="commsComposerForm" class="comms-bottom-form">
          <div class="comms-target-selector-box">
            <span class="comms-to-label">To:</span>
            <select class="comms-select-recipient" id="commsRecipientSelect">
              <option value="all">📢 All Portals (Common Broadcast)</option>
              <option value="monitoring">🛡️ State Monitoring (DEOC Command)</option>
              <option value="authority">🏛️ District Authority (DDMA / DM)</option>
              <option value="godown">🏭 Central Godown Manager (WH-MIRZA)</option>
              <option value="ground">🦺 Ground Field Officer (GO-KAM-04)</option>
              <option value="admin">🛰️ State Admin GIS Command</option>
            </select>
          </div>

          <div class="comms-input-action-box">
            <input
              type="text"
              class="comms-chat-input"
              id="commsTextInput"
              placeholder="Type official message or dispatch instruction..."
              autocomplete="off"
              required
            />
            <button type="submit" class="comms-btn-send" id="btnCommsSend">
              <i class="fas fa-paper-plane"></i> Send
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

  // 4. Slider Toggle Button Handlers (All vs For You)
  mountEl.querySelectorAll('.comms-slide-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      mountEl.querySelectorAll('.comms-slide-btn').forEach(p => p.classList.remove('active'));
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

  // 7. Render Messages as Classic Messenger Chat Bubbles (Left for Incoming, Right for Outgoing)
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
    }

    if (filtered.length === 0) {
      feed.innerHTML = `
        <div class="intercomms-empty">
          <i class="fas fa-comments"></i>
          <div style="font-weight:700; color:#475569; margin-bottom:4px;">No messages in this view</div>
          <div style="font-size:11.5px; color:#64748b;">Type your message in the rectangular box below and click Send.</div>
        </div>
      `;
      return;
    }

    feed.innerHTML = filtered.map(m => {
      const fromRole = (m.fromRole || 'monitoring').toLowerCase();
      const toRole = (m.toRole || m.channel || 'all').toLowerCase();
      const isOutgoing = fromRole === currentRole;
      const isDirectToMe = !isOutgoing && (toRole === currentRole || m.isDirect);

      // Sender Profile
      const senderProfile = ROLE_PROFILES[fromRole] || {
        name: m.from || 'Officer',
        label: fromRole.toUpperCase(),
        avatarClass: `avatar-${fromRole}`,
        roleTagClass: `role-tag-${fromRole}`
      };

      // Destination Label
      const targetLabel = toRole === 'all'
        ? 'All Portals (Broadcast)'
        : (ROLE_PROFILES[toRole]?.label || toRole.toUpperCase());

      if (isOutgoing) {
        return `
          <div class="comms-bubble-row comms-outgoing-row">
            <div class="comms-bubble comms-bubble-outgoing">
              <div class="comms-bubble-header outgoing-header">
                <span class="comms-bubble-sender">You → <strong>${targetLabel}</strong></span>
                <span class="comms-bubble-badge-outgoing">${m.badge || (toRole === 'all' ? 'BROADCAST' : 'DIRECT')}</span>
              </div>
              <div class="comms-bubble-body">${m.message || m.text || ''}</div>
              <div class="comms-bubble-meta outgoing-meta">
                <span class="comms-bubble-time">${m.timestamp || 'Live'}</span>
                <span class="comms-bubble-ticks" title="Delivered"><i class="fas fa-check-double"></i></span>
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="comms-bubble-row comms-incoming-row">
          <div class="comms-bubble-avatar ${senderProfile.avatarClass}">
            <i class="fas fa-user-shield"></i>
          </div>
          <div class="comms-bubble comms-bubble-incoming ${isDirectToMe ? 'bubble-direct-border' : ''}">
            <div class="comms-bubble-header">
              <span class="comms-bubble-sender">${m.from || senderProfile.name}</span>
              <span class="comms-bubble-role-pill ${senderProfile.roleTagClass}">${senderProfile.label}</span>
              ${isDirectToMe
                ? `<span class="comms-bubble-type-tag tag-direct"><i class="fas fa-lock"></i> PERSONAL DIRECT</span>`
                : `<span class="comms-bubble-type-tag tag-common"><i class="fas fa-bullhorn"></i> COMMON BROADCAST</span>`
              }
            </div>
            <div class="comms-bubble-body">${m.message || m.text || ''}</div>
            <div class="comms-bubble-meta">
              <span class="comms-bubble-time"><i class="far fa-clock"></i> ${m.timestamp || 'Live'}</span>
              <button type="button" class="btn-reply-direct" data-reply-role="${fromRole}" data-reply-name="${encodeURIComponent(senderProfile.name)}">
                <i class="fas fa-reply"></i> Reply Direct
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    feed.scrollTop = feed.scrollHeight;
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
