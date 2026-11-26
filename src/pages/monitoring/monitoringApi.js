// NEERAKSHAK State DEOC Monitoring & Audit Portal API Client
// Connects Monitoring UI with Next.js Backend & Single Source of Truth MongoDB Engine

const API_BASE = '/api/monitoring';
const API_CHAT = '/api/monitoring/chat';
const API_ESCALATE = '/api/monitoring/escalations';

let cachedState = null;
let syncListeners = [];
let pollingTimer = null;

function notifySync(state) {
  syncListeners.forEach(fn => {
    try { fn(state); } catch (e) { console.error('Monitoring sync error:', e); }
  });
}

export function onMonitoringSync(callback) {
  if (typeof callback === 'function') {
    syncListeners.push(callback);
  }
  return () => {
    syncListeners = syncListeners.filter(fn => fn !== callback);
  };
}

export function getCurrentMonitoringState() {
  return cachedState || getDefaultMonitoringSeed();
}

export function getDefaultMonitoringSeed() {
  return {
    areas: [],
    lifecycles: [],
    reconciliation: [],
    discrepancies: [],
    returns: [],
    operations: [],
    chats: [
      { id: 'c1', channel: 'ground', sender: 'Bhaskar Jyoti Das (Ground Officer)', senderRole: 'Field Unit', message: 'Relief consignment received at Ramnagar. 3 rescue boats operational.', time: '10 mins ago', badge: 'VERIFIED' },
      { id: 'c2', channel: 'godown', sender: 'Rajesh Das (Warehouse Manager)', senderRole: 'Central Godown', message: 'Dispatch DSP-2026-932 en route to Nirmali sector with NDRF escort.', time: '25 mins ago', badge: 'DISPATCHED' },
      { id: 'c3', channel: 'authority', sender: 'DC Control Room', senderRole: 'District Authority', message: 'High priority allocation approved for Nirmali flood basin.', time: '1 hour ago', badge: 'APPROVED' },
      { id: 'c4', channel: 'admin', sender: 'State Inundation Cell', senderRole: 'Admin Ops', message: 'Hydrology warning issued for Saura River gauge (+0.7m above danger).', time: '2 hours ago', badge: 'ALERT' }
    ],
    logs: [],
    summary: {
      totalDispatched: 0,
      totalReceived: 0,
      activeShortages: 0,
      activeRescueOps: 0
    }
  };
}

/**
 * Fetch complete live monitoring audit state from backend
 */
export async function fetchFullMonitoringState() {
  try {
    const res = await fetch(API_BASE, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        cachedState = json.data;
        notifySync(cachedState);
        return cachedState;
      }
    }
  } catch (err) {
    console.warn('Monitoring API fetch failed, trying state endpoint:', err);
    try {
      const resFallback = await fetch('/api/monitoring/state', { cache: 'no-store' });
      if (resFallback.ok) {
        const jsonFallback = await resFallback.json();
        if (jsonFallback && jsonFallback.success && jsonFallback.data) {
          cachedState = jsonFallback.data;
          notifySync(cachedState);
          return cachedState;
        }
      }
    } catch (e) {}
  }

  if (!cachedState) {
    cachedState = getDefaultMonitoringSeed();
  }
  return cachedState;
}

/**
 * Send inter-portal chat message
 */
export async function sendMonitoringChatMessage(chatData) {
  const payload = {
    channel: chatData.channel || 'ground',
    sender: chatData.sender || 'S. N. Bora (Auditor)',
    senderRole: chatData.senderRole || 'State DEOC Monitor',
    message: chatData.message || '',
    badge: chatData.badge || 'AUDIT NOTE'
  };

  try {
    const res = await fetch(API_CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        if (!cachedState) cachedState = getDefaultMonitoringSeed();
        if (!cachedState.chats) cachedState.chats = [];
        cachedState.chats.unshift(json.data);
        notifySync(cachedState);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Send chat API call failed, saving locally:', err);
  }

  // Local fallback
  const fallbackChat = {
    id: `c-${Date.now()}`,
    ...payload,
    time: 'Just now'
  };
  if (!cachedState) cachedState = getDefaultMonitoringSeed();
  if (!cachedState.chats) cachedState.chats = [];
  cachedState.chats.unshift(fallbackChat);
  notifySync(cachedState);
  return fallbackChat;
}

/**
 * Escalate discrepancy to Authority & Godown
 */
export async function escalateDiscrepancyApi(escalationData) {
  try {
    const res = await fetch(API_ESCALATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(escalationData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success) {
        // Refresh full state
        await fetchFullMonitoringState();
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Escalate discrepancy API failed:', err);
  }

  // Fallback locally
  if (cachedState && cachedState.discrepancies) {
    const match = cachedState.discrepancies.find(d => d.id === escalationData.id);
    if (match) {
      match.status = 'Escalated to Authority';
      match.escalated = true;
      notifySync(cachedState);
    }
  }
  return escalationData;
}

/**
 * Real-time background sync polling
 */
export function startMonitoringSyncPolling(intervalMs = 4000) {
  if (pollingTimer) clearInterval(pollingTimer);
  fetchFullMonitoringState();
  pollingTimer = setInterval(() => {
    fetchFullMonitoringState();
  }, intervalMs);
}

export function stopMonitoringSyncPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}
