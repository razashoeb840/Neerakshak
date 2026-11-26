// NEERAKSHAK District Authority Portal API Client
// Connects UI with Next.js Backend & Local Data Persistence with Real-time Telemetry Sync

const API_BASE = '/api/authority';

let cachedState = null;
let syncListeners = [];

function notifySync(state) {
  syncListeners.forEach(fn => {
    try { fn(state); } catch (e) { console.error('Authority sync error:', e); }
  });
}

export function onAuthoritySync(callback) {
  if (typeof callback === 'function') {
    syncListeners.push(callback);
  }
}

export function getCurrentAuthorityState() {
  if (!cachedState) {
    cachedState = getDefaultAuthoritySeed();
  }
  return cachedState;
}

function getDefaultAuthoritySeed() {
  const seed = (typeof window !== 'undefined' && window.NEERAKSHAK_SEED_DATA && window.NEERAKSHAK_SEED_DATA.authority) || {};
  return {
    villages: Array.isArray(seed.villages) ? JSON.parse(JSON.stringify(seed.villages)) : [
      {
        id: 'V-01',
        name: 'Palashbari Riverside Ward 2',
        block: 'Palashbari Circle',
        severity: 'Critical',
        pop: 4200,
        waterStatus: 'Brahmaputra at 18.2 m (Above Danger Level)',
        assessedNeed: { boats: 4, jackets: 60, food: 500, meds: 80 },
        lat: 26.132,
        lng: 91.515
      },
      {
        id: 'V-02',
        name: 'Chaygaon Lowland Belt',
        block: 'Chaygaon Circle',
        severity: 'High',
        pop: 3650,
        waterStatus: 'Kolong Basin at 14.6 m (Rising)',
        assessedNeed: { boats: 2, jackets: 30, food: 450, meds: 65 },
        lat: 26.052,
        lng: 91.225
      },
      {
        id: 'V-03',
        name: 'Goroimari Char Cluster',
        block: 'Goroimari Circle',
        severity: 'Moderate',
        pop: 2800,
        waterStatus: 'Waterlogging watch on approach road',
        assessedNeed: { boats: 1, jackets: 15, food: 250, meds: 40 },
        lat: 26.095,
        lng: 91.34
      },
      {
        id: 'V-04',
        name: 'Boko Upland Sector',
        block: 'Boko Circle',
        severity: 'Normal',
        pop: 1780,
        waterStatus: 'Drainage normal; monitoring runoff',
        assessedNeed: { boats: 0, jackets: 0, food: 100, meds: 20 },
        lat: 25.98,
        lng: 91.24
      }
    ],
    requests: Array.isArray(seed.requests) ? JSON.parse(JSON.stringify(seed.requests)) : [
      {
        id: 'REQ-204',
        from: 'Ground Officer – Palashbari',
        village: 'Palashbari Riverside Ward 2',
        items: '4 Rescue Boats, 60 Life Jackets',
        urgency: 'Critical',
        status: 'Pending',
        reason: 'Awaiting Authority review',
        timestamp: '10:30 AM'
      },
      {
        id: 'REQ-205',
        from: 'Relief Camp Desk – Chaygaon',
        village: 'Chaygaon Lowland Belt',
        items: '450 Food Packets, 65 Medicine Kits',
        urgency: 'High',
        status: 'Pending',
        reason: 'Awaiting Authority review',
        timestamp: '09:45 AM'
      }
    ],
    allocations: Array.isArray(seed.allocations) ? JSON.parse(JSON.stringify(seed.allocations)) : [
      {
        id: 'ALC-501',
        village: 'Palashbari Riverside Ward 2',
        summary: '4 Boats, 60 Jackets, 500 Food, 80 Meds',
        godownStatus: 'Sent to Godown Manager • Preparing Dispatch',
        deliveryProgress: 65,
        timestamp: '11:00 AM'
      }
    ],
    coordinations: Array.isArray(seed.coordinations) ? JSON.parse(JSON.stringify(seed.coordinations)) : [
      {
        id: 'CORD-101',
        agency: 'NDRF (1st Bn)',
        sector: 'Palashbari Riverside Ward 2',
        update: 'Coordinated via DEOC Control Room; 2 NDRF boat teams evacuating stranded families under independent command.',
        timestamp: '10:15 AM'
      }
    ],
    operations: Array.isArray(seed.operations) ? JSON.parse(JSON.stringify(seed.operations)) : [
      {
        id: 'OP-301',
        title: 'Palashbari Embankment Evacuation',
        status: 'Ongoing',
        summary: '140 residents evacuated to Palashbari Govt. HS Relief Camp; boat shuttle active.',
        timestamp: 'Active'
      }
    ],
    logs: Array.isArray(seed.logs) ? JSON.parse(JSON.stringify(seed.logs)) : [
      {
        id: 'LOG-01',
        time: '10:35 AM',
        actor: 'District Authority (DDMA)',
        note: 'Authority operational dashboard initialized and synchronized with CWC telemetry.'
      }
    ]
  };
}

// Fetch complete state from backend
export async function fetchFullAuthorityState() {
  try {
    const res = await fetch(`${API_BASE}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        cachedState = json.data;
        notifySync(cachedState);
        return cachedState;
      }
    }
  } catch (err) {
    // Offline / fallback to local cache
  }
  if (!cachedState) cachedState = getDefaultAuthoritySeed();
  return cachedState;
}

// Request Decision (Approve / Reject)
export async function confirmRequestDecisionApi(index, decision, reason) {
  if (!cachedState) cachedState = getDefaultAuthoritySeed();

  // Optimistic local update
  if (cachedState.requests && cachedState.requests[index]) {
    const req = cachedState.requests[index];
    req.status = decision;
    req.reason = reason || `${decision} by DDMA`;

    if (decision === 'Approved') {
      const newAlloc = {
        id: `ALC-${Math.floor(520 + Math.random() * 80)}`,
        village: req.village,
        summary: req.items,
        godownStatus: 'Sent to Godown Manager • Preparing Dispatch',
        deliveryProgress: 25,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        assignedGodown: 'Central Relief Godown – Mirza (Bay 1)',
        vehicle: 'Heavy Relief Truck AS-01-EC-4210',
        driver: 'Rajesh Das (+91 98640-21943)',
        escortOfficer: 'District Police Escort Assigned',
        timeline: [
          { step: 'Field Request Approved', time: 'Just now', status: 'done', detail: `Request ${req.id} for ${req.village} approved per flood assessment.` },
          { step: 'Godown Stock Picking', time: 'Pending', status: 'active', detail: 'Picking verified relief inventory at Central Godown.' },
          { step: 'Vehicle Loading & Gatepass', time: 'Pending', status: 'pending', detail: 'Pallets loading & weighbridge inspection.' },
          { step: 'Route Transit', time: 'Pending', status: 'pending', detail: 'Moving towards destination sector.' },
          { step: 'Camp Delivery Receipt', time: 'Pending', status: 'pending', detail: 'Handover to Ground Officer.' }
        ]
      };
      if (!cachedState.allocations) cachedState.allocations = [];
      cachedState.allocations.unshift(newAlloc);
    }

    if (!cachedState.logs) cachedState.logs = [];
    cachedState.logs.unshift({
      id: `LOG-${Date.now().toString(36).toUpperCase()}`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      actor: 'District Authority (DDMA)',
      note: `${decision} request ${req.id} for ${req.village}. Reason: ${req.reason}`
    });

    notifySync(cachedState);
  }

  try {
    const targetReq = cachedState.requests && cachedState.requests[index];
    await fetch(`${API_BASE}/requests`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        index,
        id: targetReq ? targetReq.id : undefined,
        decision,
        reason
      })
    });
  } catch (e) {
    console.warn('Backend request decision sync error:', e);
  }

  return cachedState;
}

// Direct Allocation to Godown (with Deduplication & Update)
export async function allocateDirectResourcesApi(village, summary, officerDetails = {}) {
  if (!cachedState) cachedState = getDefaultAuthoritySeed();
  if (!cachedState.allocations) cachedState.allocations = [];

  const villageClean = String(village || '').trim().toLowerCase();
  const existing = cachedState.allocations.find(a => a.village && a.village.trim().toLowerCase() === villageClean);

  const leadAgency = officerDetails.leadAgency || officerDetails.agency || 'NDRF (1st Bn)';
  const leadOfficerName = officerDetails.leadOfficerName || officerDetails.officerName || 'Inspector Rajesh Kalita';
  const leadOfficerId = officerDetails.leadOfficerId || officerDetails.officerId || 'NDRF-1BN-842';
  const leadOfficerContact = officerDetails.leadOfficerContact || officerDetails.officerContact || '+91 94350-12345';

  if (existing) {
    existing.summary = summary;
    existing.godownStatus = 'Updated by Authority • Preparing Dispatch';
    existing.timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    existing.leadAgency = leadAgency;
    existing.leadOfficerName = leadOfficerName;
    existing.leadOfficerId = leadOfficerId;
    existing.leadOfficerContact = leadOfficerContact;
    existing.escortOfficer = `${leadAgency} ${leadOfficerName}`;
    if (!existing.timeline) existing.timeline = [];
    existing.timeline.unshift({
      step: 'Allocation Order Adjusted',
      time: 'Just now',
      status: 'done',
      detail: `Emergency supplies updated by District Authority to: ${summary}. Assigned Escort: ${leadAgency} - ${leadOfficerName} (ID: ${leadOfficerId}).`
    });

    if (!cachedState.logs) cachedState.logs = [];
    cachedState.logs.unshift({
      id: `LOG-${Date.now().toString(36).toUpperCase()}`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      actor: 'District Authority (DDMA)',
      note: `Updated allocation (${summary}) for ${existing.village} (${existing.id}) with lead officer ${leadOfficerName}; notified Godown Manager.`
    });

    notifySync(cachedState);

    try {
      await fetch(`${API_BASE}/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(existing)
      });
    } catch (e) {
      console.warn('Backend allocation sync notice:', e);
    }

    return existing;
  }

  const newAlloc = {
    id: `ALC-${Math.floor(530 + Math.random() * 70)}`,
    village,
    summary,
    godownStatus: 'Sent to Godown Manager • Awaiting Dispatch',
    deliveryProgress: 25,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    assignedGodown: 'Central Relief Godown – Mirza (Bay 2)',
    vehicle: 'Heavy Truck AS-01-EC-4210 (6-Ton Swaraj)',
    driver: 'Rajesh Das (Ph: +91 98640-21943)',
    escortOfficer: `${leadAgency} ${leadOfficerName}`,
    leadAgency,
    leadOfficerName,
    leadOfficerId,
    leadOfficerContact,
    timeline: [
      { step: 'DDMA Allocation Approved', time: 'Just now', status: 'done', detail: `Direct allocation (${summary}) approved by Authority. Designated lead officer: ${leadAgency} - ${leadOfficerName} (Badge/ID: ${leadOfficerId}). Transmitted to Godown.` },
      { step: 'Stock Verification & Staging', time: 'In Progress', status: 'active', detail: 'Godown warehouse crew picking verified stock from storage racks.' },
      { step: 'Vehicle Dispatch & Gate Pass', time: 'Pending', status: 'pending', detail: 'Pallets loading & security checkpoint clearance.' },
      { step: 'Route Checkpoint Crossing', time: 'Pending', status: 'pending', detail: 'Transit via high-water bypass bridge towards destination.' },
      { step: 'Camp Intake & Final Distribution', time: 'Pending', status: 'pending', detail: 'Handover to Ground Officer and receipt acknowledgement.' }
    ]
  };

  cachedState.allocations.unshift(newAlloc);

  if (!cachedState.logs) cachedState.logs = [];
  cachedState.logs.unshift({
    id: `LOG-${Date.now().toString(36).toUpperCase()}`,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    actor: 'District Authority (DDMA)',
    note: `Direct allocation (${summary}) assigned to ${village} and forwarded to Godown.`
  });

  notifySync(cachedState);

  try {
    await fetch(`${API_BASE}/allocations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAlloc)
    });
  } catch (e) {
    console.warn('Backend allocation sync error:', e);
  }

  return newAlloc;
}

// NDRF / SDRF Multi-Agency Coordination Log
export async function logCoordinationApi(agency, sector, update, commander = '', contact = '', strength = '', status = 'Deployed On Water') {
  if (!cachedState) cachedState = getDefaultAuthoritySeed();

  const record = {
    id: `CORD-${Math.floor(105 + Math.random() * 90)}`,
    agency,
    sector,
    update,
    commander: commander || 'Field Incident Commander',
    contact: contact || 'VHF Ch-07 / DEOC Hotline',
    strength: strength || 'Tactical Personnel Unit',
    status: status || 'Deployed On Water',
    callLog: update,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };

  if (!cachedState.coordinations) cachedState.coordinations = [];
  cachedState.coordinations.unshift(record);

  if (!cachedState.logs) cachedState.logs = [];
  cachedState.logs.unshift({
    id: `LOG-${Date.now().toString(36).toUpperCase()}`,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    actor: 'District Authority (DDMA)',
    note: `Logged ${agency} (${record.commander}) coordination update for ${sector}.`
  });

  notifySync(cachedState);

  try {
    await fetch(`${API_BASE}/coordinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (e) {
    console.warn('Backend coordination sync error:', e);
  }

  return record;
}

// Operations Management
export async function saveOperationApi(title, status, summary) {
  if (!cachedState) cachedState = getDefaultAuthoritySeed();

  const op = {
    id: `OP-${Math.floor(310 + Math.random() * 90)}`,
    title,
    status,
    summary,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };

  if (!cachedState.operations) cachedState.operations = [];
  cachedState.operations.unshift(op);

  if (!cachedState.logs) cachedState.logs = [];
  cachedState.logs.unshift({
    id: `LOG-${Date.now().toString(36).toUpperCase()}`,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    actor: 'District Authority (DDMA)',
    note: `Updated rescue operation "${title}" (${status}).`
  });

  notifySync(cachedState);

  try {
    await fetch(`${API_BASE}/operations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(op)
    });
  } catch (e) {
    console.warn('Backend operation sync error:', e);
  }

  return op;
}

// Real-Time Background Synchronization
let pollTimer = null;
export function startAuthorityRealtimeSync(intervalMs = 15000, callback = null) {
  if (pollTimer) clearInterval(pollTimer);
  fetchFullAuthorityState();
  if (typeof callback === 'function') {
    onAuthoritySync(callback);
  }
  pollTimer = setInterval(() => {
    fetchFullAuthorityState();
  }, intervalMs);
}

export function stopAuthorityRealtimeSync() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
