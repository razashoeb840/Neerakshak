// NEERAKSHAK Ground Officer Portal API Client
// Connects Ground Officer UI with Next.js Backend & MongoDB Live Persistence Engine

const API_BASE = '/api/ground-officer';
const API_FALLBACK = '/api/ground';

let cachedState = null;
let syncListeners = [];

function notifySync(state) {
  syncListeners.forEach(fn => {
    try { fn(state); } catch (e) { console.error('Ground Officer sync error:', e); }
  });
}

export function onGroundSync(callback) {
  if (typeof callback === 'function') {
    syncListeners.push(callback);
  }
}

export function getCurrentGroundState() {
  if (!cachedState) {
    cachedState = getDefaultGroundSeed();
  }
  return cachedState;
}

export function getDefaultGroundSeed() {
  const seed = (typeof window !== 'undefined' && window.NEERAKSHAK_SEED_DATA && window.NEERAKSHAK_SEED_DATA.groundOfficer) || {};
  return {
    areas: Array.isArray(seed.areas) ? JSON.parse(JSON.stringify(seed.areas)) : [],
    deliveries: Array.isArray(seed.deliveries) ? JSON.parse(JSON.stringify(seed.deliveries)) : [],
    fieldReports: Array.isArray(seed.fieldReports) ? JSON.parse(JSON.stringify(seed.fieldReports)) : [],
    operations: Array.isArray(seed.operations) ? JSON.parse(JSON.stringify(seed.operations)) : [],
    returns: Array.isArray(seed.returns) ? JSON.parse(JSON.stringify(seed.returns)) : [],
    notifications: Array.isArray(seed.notifications) ? JSON.parse(JSON.stringify(seed.notifications)) : []
  };
}

/**
 * Fetch complete ground officer state from backend
 */
export async function fetchFullGroundState() {
  const endpoints = [API_BASE, API_FALLBACK];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          cachedState = json.data;
          notifySync(cachedState);
          return cachedState;
        }
      }
    } catch (err) {
      // try fallback
    }
  }

  if (!cachedState) {
    cachedState = getDefaultGroundSeed();
  }
  return cachedState;
}

/**
 * Submit Immutable Field Situation Report
 */
export async function submitFieldReportApi(reportData) {
  if (!cachedState) cachedState = getDefaultGroundSeed();
  if (!cachedState.fieldReports) cachedState.fieldReports = [];

  const refId = reportData.refId || `FR-2026-${Math.floor(400 + Math.random() * 500)}`;
  const localReport = {
    ...reportData,
    refId,
    time: 'Just now',
    reviewStatus: 'Pending Review'
  };

  cachedState.fieldReports.unshift(localReport);
  notifySync(cachedState);

  const endpoints = [`${API_BASE}/reports`, `${API_FALLBACK}/reports`];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localReport)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // fallback
    }
  }

  return localReport;
}

/**
 * Submit Physical Delivery Verification
 */
export async function verifyPhysicalDeliveryApi(verificationData) {
  if (!cachedState) cachedState = getDefaultGroundSeed();

  const d = (cachedState.deliveries || []).find(item => 
    item.dispatchId === verificationData.dispatchId || item.allocId === verificationData.allocId
  );

  const shortage = Number(verificationData.shortage) || 0;
  const damaged = Number(verificationData.damaged) || 0;
  const status = (shortage > 0 || damaged > 0) ? 'Discrepancy Flagged' : 'Verified';

  if (d) {
    d.received = verificationData.received;
    d.damaged = damaged;
    d.shortage = shortage;
    d.status = status;
    d.remarks = `[GO-KAM-04] ${verificationData.remarks || 'Physical delivery verified'}`;
    notifySync(cachedState);
  }

  const endpoints = [`${API_BASE}/verify-delivery`, `${API_FALLBACK}/verify-delivery`];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...verificationData, status })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
  }

  return { success: true, status };
}

/**
 * Update Rescue Operation Progress
 */
export async function updateRescueProgressApi(opData) {
  if (!cachedState) cachedState = getDefaultGroundSeed();

  const op = (cachedState.operations || []).find(o => o.opId === opData.opId);
  if (op) {
    op.rescued = Number(opData.rescued) || op.rescued;
    op.stranded = Number(opData.stranded) || op.stranded;
    op.status = opData.status || op.status;
    op.notes = opData.notes || op.notes;
    notifySync(cachedState);
  }

  const endpoints = [`${API_BASE}/rescue-ops`, `${API_FALLBACK}/rescue-ops`];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opData)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
  }

  return { success: true };
}

/**
 * Confirm Situation Controlled & Release for Return
 */
export async function confirmSituationControlledApi(allocId, area, notes) {
  if (!cachedState) cachedState = getDefaultGroundSeed();

  const d = (cachedState.deliveries || []).find(item => 
    item.dispatchId === allocId || item.allocId === allocId || (area && item.destination === area)
  );
  if (d) {
    d.groundOfficerCleared = true;
    d.reliefClearedForReturn = true;
    notifySync(cachedState);
  }

  const payload = {
    allocId,
    area,
    officerName: 'Bhaskar Jyoti Das (Ground Officer)',
    notes: notes || 'Ground rescue operations completed. Area flood waters receded and situation under control. Resources released for warehouse return.'
  };

  const endpoints = [`${API_BASE}/clear-return`, `${API_FALLBACK}/clear-return`];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
  }

  return { success: true };
}

/**
 * Mark Delivery Verified and Ready for Citizen Distribution / Field Deployed
 */
export async function markReadyForDistributionApi(dispatchId, area) {
  if (!cachedState) cachedState = getDefaultGroundSeed();
  const d = (cachedState.deliveries || []).find(item => 
    item.dispatchId === dispatchId || (area && item.destination === area)
  );
  if (d) {
    d.readyForDistribution = true;
    d.distributionStatus = 'Ready for Citizen Distribution & Field Deployed';
    notifySync(cachedState);
  }

  const payload = { dispatchId, area };
  const endpoints = [`${API_BASE}/ready-distribution`, `${API_FALLBACK}/ready-distribution`];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
  }

  return { success: true };
}

/**
 * Submit Post-Operation Return Verification
 */
export async function submitReturnVerificationApi(returnData) {
  if (!cachedState) cachedState = getDefaultGroundSeed();
  if (!cachedState.returns) cachedState.returns = [];

  const boatsGood = Number(returnData.boatsGood ?? 2);
  const boatsDamaged = Number(returnData.boatsDamaged ?? 1);
  const boatsMissing = Number(returnData.boatsMissing ?? 0);
  const jacketsGood = Number(returnData.jacketsGood ?? 31);
  const jacketsDamaged = Number(returnData.jacketsDamaged ?? 1);
  const jacketsMissing = Number(returnData.jacketsMissing ?? 1);
  const tentsGood = Number(returnData.tentsGood ?? 11);
  const tentsDamaged = Number(returnData.tentsDamaged ?? 1);
  const tentsMissing = Number(returnData.tentsMissing ?? 0);

  const totalGood = boatsGood + jacketsGood + tentsGood;
  const totalDamaged = boatsDamaged + jacketsDamaged + tentsDamaged;
  const totalMissing = boatsMissing + jacketsMissing + tentsMissing;

  const localRet = {
    retId: 'RV-' + Math.floor(110 + Math.random() * 880),
    item: returnData.item || `Relief Consignment Equipment (${returnData.location})`,
    location: returnData.location,
    area: returnData.location,
    good: totalGood,
    damaged: totalDamaged,
    missing: totalMissing,
    boatsGood,
    boatsDamaged,
    boatsMissing,
    jacketsGood,
    jacketsDamaged,
    jacketsMissing,
    tentsGood,
    tentsDamaged,
    tentsMissing,
    remarks: returnData.remarks || 'Condition verified on ground',
    time: 'Just now (GO-KAM-04)',
    canReturnInput: true,
    groundVerified: true
  };

  const existingIdx = cachedState.returns.findIndex(r => r.location === returnData.location || r.area === returnData.location);
  if (existingIdx !== -1) {
    cachedState.returns[existingIdx] = { ...cachedState.returns[existingIdx], ...localRet };
  } else {
    cachedState.returns.unshift(localRet);
  }
  notifySync(cachedState);

  const endpoints = [`${API_BASE}/returns`, `${API_FALLBACK}/returns`];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localRet)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
  }

  return localRet;
}

/**
 * Background Polling Sync Listener
 */
let pollTimer = null;
export function startGroundOfficerSync(intervalMs = 12000) {
  if (pollTimer) clearInterval(pollTimer);
  fetchFullGroundState();
  pollTimer = setInterval(() => {
    fetchFullGroundState();
  }, intervalMs);
}
