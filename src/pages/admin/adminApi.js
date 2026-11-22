// NEERAKSHAK Admin Real-Time API Client
// Connects to Next.js Backend (/api/admin/...) with local state fallback

const API_BASE = '/api/admin';

// Default initial state matching Kamrup, Assam flood telemetry
function getDefaultSeed() {
  const seed = (typeof window !== 'undefined' && window.NEERAKSHAK_SEED_DATA && window.NEERAKSHAK_SEED_DATA.admin) || {};
  return {
    areas: Array.isArray(seed.areas) ? JSON.parse(JSON.stringify(seed.areas)) : [
      { id: 'area-1', name: 'Palashbari Riverside Ward 2', block: 'Palashbari Circle', severity: 'Critical', pop: 4200, lat: 26.132, lng: 91.515, notes: 'Embankment seepage watch; low-lying homes evacuated to primary school camp.' },
      { id: 'area-2', name: 'Chaygaon Lowland Belt', block: 'Chaygaon Circle', severity: 'High', pop: 3650, lat: 26.052, lng: 91.225, notes: 'Approach road under 2.5 ft water; relief distribution point operational.' },
      { id: 'area-3', name: 'Goroimari Char Cluster', block: 'Goroimari Circle', severity: 'Moderate', pop: 2800, lat: 26.095, lng: 91.34, notes: 'Riverbank waterlogging watch; country boat transfer active at ghat.' },
      { id: 'area-4', name: 'Boko Upland Sector', block: 'Boko Circle', severity: 'Normal', pop: 1780, lat: 25.98, lng: 91.24, notes: 'Drainage channels normal; monitoring rainfall runoff from foothills.' }
    ],
    rivers: Array.isArray(seed.rivers) ? JSON.parse(JSON.stringify(seed.rivers)) : [
      { id: 'riv-1', name: 'Brahmaputra River', current: 18.2, danger: 18.0, trend: 'Rising', barColor: '#dc2626', spark: 'M2 16 L12 13 L22 14 L32 8 L42 6 L52 3' },
      { id: 'riv-2', name: 'Kolong River', current: 14.6, danger: 15.0, trend: 'Rising', barColor: '#eab308', spark: 'M2 15 L12 14 L22 11 L32 10 L42 7 L52 5' },
      { id: 'riv-3', name: 'Kakang River', current: 12.8, danger: 14.5, trend: 'Steady', barColor: '#16a34a', spark: 'M2 12 L12 13 L22 10 L32 11 L42 9 L52 9' }
    ],
    alerts: Array.isArray(seed.alerts) ? JSON.parse(JSON.stringify(seed.alerts)) : [
      { id: 'alt-1', title: 'Flood risk increasing', location: 'Chaygaon, North Kamrup', severity: 'High', desc: 'River water rising near northern embankment; low-lying residents advised to move to relief shelters.' },
      { id: 'alt-2', title: 'Water level rising', location: 'Palashbari, Kamrup', severity: 'Moderate', desc: 'Continuous upstream rainfall; waterlogging watch active across riverside wards.' }
    ],
    facilities: Array.isArray(seed.facilities) ? JSON.parse(JSON.stringify(seed.facilities)) : [
      { id: 'fac-1', name: 'District Civil Emergency Hospital', category: 'Hospital', distance: '2.4 km • Kamrup Sadar', contact: '108' },
      { id: 'fac-2', name: 'Palashbari Sadar Police Station', category: 'Police Station', distance: '1.8 km • Palashbari', contact: '112' },
      { id: 'fac-3', name: 'Chaygaon Higher Secondary Relief Camp', category: 'Relief Camp', distance: '3.1 km • Chaygaon Circle', contact: '1077' }
    ],
    weather: seed.weather ? JSON.parse(JSON.stringify(seed.weather)) : {
      rainfall: '142 mm / 24h',
      advisory: 'Orange Alert (Heavy Rain)',
      humidity: '94% Humidity • 18 km/h NW',
      forecast: 'Intense spells expected over upper catchment'
    }
  };
}

let cachedState = null;
let isBackendLive = false;
let syncListeners = [];

export function onSync(listener) {
  if (typeof listener === 'function') {
    syncListeners.push(listener);
  }
  return () => {
    syncListeners = syncListeners.filter(l => l !== listener);
  };
}

function notifySync(newState) {
  syncListeners.forEach(fn => {
    try { fn(newState, isBackendLive); } catch (e) { console.error('Sync listener error:', e); }
  });
}

function updatePulseIndicator(online) {
  isBackendLive = online;
  const pulseWrap = document.querySelector('.rail-pulse-wrap');
  const dot = document.querySelector('.rail-online-dot');
  const txt = document.querySelector('.rail-online-text');
  if (dot && txt) {
    if (online) {
      dot.style.background = '#22c55e';
      dot.style.boxShadow = '0 0 8px rgba(34, 197, 94, 0.7)';
      txt.textContent = 'API LIVE';
      txt.style.color = '#15803d';
    } else {
      dot.style.background = '#0284c7';
      dot.style.boxShadow = '0 0 6px rgba(2, 132, 199, 0.5)';
      txt.textContent = 'LOCAL OK';
      txt.style.color = '#0369a1';
    }
  }
}

export async function fetchFullAdminState() {
  try {
    const res = await fetch(API_BASE, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        cachedState = json.data;
        updatePulseIndicator(true);
        notifySync(cachedState);
        return cachedState;
      }
    }
  } catch (err) {
    // Backend offline or starting up
  }

  updatePulseIndicator(false);
  if (!cachedState) {
    cachedState = getDefaultSeed();
  }
  notifySync(cachedState);
  return cachedState;
}

export function getCurrentState() {
  if (!cachedState) cachedState = getDefaultSeed();
  return cachedState;
}

// --- AREA CRUD ---
export async function saveArea(areaData, index = -1) {
  if (!cachedState) cachedState = getDefaultSeed();

  // Optimistic local update
  if (index >= 0 && cachedState.areas[index]) {
    cachedState.areas[index] = { ...cachedState.areas[index], ...areaData };
  } else {
    cachedState.areas.unshift(areaData);
  }
  notifySync(cachedState);

  // Sync to Next.js backend
  try {
    const res = await fetch(`${API_BASE}/areas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(areaData)
    });
    if (res.ok) {
      updatePulseIndicator(true);
      const json = await res.json();
      if (json.data && index < 0) {
        cachedState.areas[0] = json.data;
      }
    }
  } catch (e) {
    updatePulseIndicator(false);
  }
  return cachedState;
}

export async function deleteArea(indexOrId) {
  if (!cachedState) cachedState = getDefaultSeed();

  let targetId = null;
  if (typeof indexOrId === 'number' && cachedState.areas[indexOrId]) {
    targetId = cachedState.areas[indexOrId].id;
    cachedState.areas.splice(indexOrId, 1);
  } else {
    targetId = indexOrId;
    cachedState.areas = cachedState.areas.filter(a => a.id !== indexOrId);
  }
  notifySync(cachedState);

  try {
    const param = targetId ? `id=${encodeURIComponent(targetId)}` : `index=${indexOrId}`;
    await fetch(`${API_BASE}/areas?${param}`, { method: 'DELETE' });
    updatePulseIndicator(true);
  } catch (e) {
    updatePulseIndicator(false);
  }
  return cachedState;
}

// --- ALERT CRUD ---
export async function addAlert(alertData) {
  if (!cachedState) cachedState = getDefaultSeed();
  cachedState.alerts.unshift(alertData);
  notifySync(cachedState);

  try {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData)
    });
    if (res.ok) {
      updatePulseIndicator(true);
      const json = await res.json();
      if (json.data) cachedState.alerts[0] = json.data;
    }
  } catch (e) {
    updatePulseIndicator(false);
  }
  return cachedState;
}

export async function deleteAlert(indexOrId) {
  if (!cachedState) cachedState = getDefaultSeed();
  let targetId = null;
  if (typeof indexOrId === 'number' && cachedState.alerts[indexOrId]) {
    targetId = cachedState.alerts[indexOrId].id;
    cachedState.alerts.splice(indexOrId, 1);
  } else {
    targetId = indexOrId;
    cachedState.alerts = cachedState.alerts.filter(a => a.id !== indexOrId);
  }
  notifySync(cachedState);

  try {
    const param = targetId ? `id=${encodeURIComponent(targetId)}` : `index=${indexOrId}`;
    await fetch(`${API_BASE}/alerts?${param}`, { method: 'DELETE' });
    updatePulseIndicator(true);
  } catch (e) {
    updatePulseIndicator(false);
  }
  return cachedState;
}

// --- RIVER UPDATE ---
export async function updateRiver(riverIndex, riverData) {
  if (!cachedState) cachedState = getDefaultSeed();
  if (cachedState.rivers[riverIndex]) {
    cachedState.rivers[riverIndex] = { ...cachedState.rivers[riverIndex], ...riverData };
  }
  notifySync(cachedState);

  try {
    const target = cachedState.rivers[riverIndex];
    await fetch(`${API_BASE}/rivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...target, ...riverData })
    });
    updatePulseIndicator(true);
  } catch (e) {
    updatePulseIndicator(false);
  }
  return cachedState;
}

// --- FACILITY CRUD ---
export async function addFacility(facData) {
  if (!cachedState) cachedState = getDefaultSeed();
  cachedState.facilities.unshift(facData);
  notifySync(cachedState);

  try {
    const res = await fetch(`${API_BASE}/facilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facData)
    });
    if (res.ok) {
      updatePulseIndicator(true);
      const json = await res.json();
      if (json.data) cachedState.facilities[0] = json.data;
    }
  } catch (e) {
    updatePulseIndicator(false);
  }
  return cachedState;
}

export async function deleteFacility(indexOrId) {
  if (!cachedState) cachedState = getDefaultSeed();
  let targetId = null;
  if (typeof indexOrId === 'number' && cachedState.facilities[indexOrId]) {
    targetId = cachedState.facilities[indexOrId].id;
    cachedState.facilities.splice(indexOrId, 1);
  } else {
    targetId = indexOrId;
    cachedState.facilities = cachedState.facilities.filter(f => f.id !== indexOrId);
  }
  notifySync(cachedState);

  try {
    const param = targetId ? `id=${encodeURIComponent(targetId)}` : `index=${indexOrId}`;
    await fetch(`${API_BASE}/facilities?${param}`, { method: 'DELETE' });
    updatePulseIndicator(true);
  } catch (e) {
    updatePulseIndicator(false);
  }
  return cachedState;
}

// --- WEATHER UPDATE ---
export async function updateWeather(weatherData) {
  if (!cachedState) cachedState = getDefaultSeed();
  cachedState.weather = { ...cachedState.weather, ...weatherData };
  notifySync(cachedState);

  try {
    await fetch(`${API_BASE}/weather`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weatherData)
    });
    updatePulseIndicator(true);
  } catch (e) {
    updatePulseIndicator(false);
  }
  return cachedState;
}

// Background auto-refresh / real-time synchronization every 8 seconds
let pollInterval = null;
export function startRealtimeSync() {
  if (pollInterval) clearInterval(pollInterval);
  fetchFullAdminState();
  pollInterval = setInterval(() => {
    fetchFullAdminState();
  }, 8000);
}

export function stopRealtimeSync() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
