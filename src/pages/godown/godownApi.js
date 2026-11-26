// NEERAKSHAK Central Relief Godown & Logistics Hub API Client
// Connects UI with Next.js Backend (/api/godown) & Real-time Live Telemetry Sync

const API_BASE = '/api/godown';

let cachedState = null;
let syncListeners = [];

function notifySync(state) {
  syncListeners.forEach(fn => {
    try { fn(state); } catch (e) { console.error('Godown sync error:', e); }
  });
}

export function onGodownSync(callback) {
  if (typeof callback === 'function') {
    syncListeners.push(callback);
  }
}

export function getCurrentGodownState() {
  if (!cachedState) {
    cachedState = getDefaultGodownSeed();
  }
  return cachedState;
}

function getDefaultGodownSeed() {
  const seed = (typeof window !== 'undefined' && window.NEERAKSHAK_SEED_DATA && window.NEERAKSHAK_SEED_DATA.godown) || {};
  return {
    portal: 'Central Relief Godown & Logistics Hub',
    status: 'active',
    kpis: {
      totalResources: 5387,
      availableStock: 3035,
      allocatedStock: 858,
      dispatchedStock: 1494,
      lowStockCount: 2,
      pendingDispatchCount: 3
    },
    inventory: Array.isArray(seed.inventory) ? JSON.parse(JSON.stringify(seed.inventory)) : [
      { id: 'INV-01', name: 'Inflatable Rescue Boats with OBM', category: 'Rescue Boats', warehouse: 'Central Relief Godown – Mirza', total: 18, available: 11, allocated: 4, dispatched: 3, minLimit: 5, condition: 'Good' },
      { id: 'INV-02', name: 'High-Buoyancy Life Jackets', category: 'Life Jackets', warehouse: 'Central Relief Godown – Mirza', total: 420, available: 290, allocated: 60, dispatched: 70, minLimit: 100, condition: 'Good' },
      { id: 'INV-03', name: 'Dry Ration Food Packets', category: 'Food Packets', warehouse: 'Central Relief Godown – Mirza', total: 3500, available: 2150, allocated: 500, dispatched: 850, minLimit: 800, condition: 'Good' },
      { id: 'INV-04', name: '20L Drinking Water Canisters', category: 'Drinking Water', warehouse: 'North Sector Warehouse – Rangia', total: 600, available: 110, allocated: 150, dispatched: 340, minLimit: 150, condition: 'Low Stock' },
      { id: 'INV-05', name: 'Essential Flood Medicine Kits', category: 'Medicines', warehouse: 'Central Relief Godown – Mirza', total: 450, available: 280, allocated: 80, dispatched: 90, minLimit: 100, condition: 'Good' },
      { id: 'INV-06', name: 'Trauma First-Aid Kits', category: 'First Aid Kits', warehouse: 'North Sector Warehouse – Rangia', total: 160, available: 28, allocated: 30, dispatched: 102, minLimit: 40, condition: 'Low Stock' },
      { id: 'INV-07', name: 'Solar Searchlights & Rope Kits', category: 'Rescue Equipment', warehouse: 'Central Relief Godown – Mirza', total: 95, available: 65, allocated: 10, dispatched: 20, minLimit: 25, condition: 'Good' },
      { id: 'INV-08', name: 'Heavy Dewatering Submersible Pumps', category: 'Rescue Equipment', warehouse: 'North Sector Warehouse – Rangia', total: 24, available: 16, allocated: 4, dispatched: 4, minLimit: 6, condition: 'Good' },
      { id: 'INV-09', name: 'Family Relief Tarpaulin Tents', category: 'Rescue Equipment', warehouse: 'Central Relief Godown – Mirza', total: 120, available: 85, allocated: 20, dispatched: 15, minLimit: 30, condition: 'Good' }
    ],
    allocations: [
      {
        id: 'ALC-501',
        destination: 'Palashbari Riverside Ward 2',
        block: 'Palashbari Circle',
        severity: 'Critical',
        lat: 26.132,
        lng: 91.515,
        summary: '4 Boats, 60 Jackets, 500 Food, 80 Meds',
        needs: { boats: 4, jackets: 60, food: 500, meds: 80 },
        assignedGodown: 'Central Relief Godown – Mirza',
        status: 'Pending Dispatch',
        vehicle: 'Heavy Truck AS-01-EC-4210',
        driver: 'Rajesh Das (+91 98640-21943)',
        escortOfficer: 'ASI D. Kalita (District Police)',
        refNo: '—',
        dispatchTime: '—'
      },
      {
        id: 'ALC-502',
        destination: 'Chaygaon Lowland Belt',
        block: 'Chaygaon Circle',
        severity: 'High',
        lat: 26.052,
        lng: 91.225,
        summary: '2 Boats, 30 Jackets, 450 Food, 65 Meds',
        needs: { boats: 2, jackets: 30, food: 450, meds: 65 },
        assignedGodown: 'Central Relief Godown – Mirza',
        status: 'Dispatched',
        vehicle: 'Medium Truck AS-01-GC-4821',
        driver: 'Biren Barman (+91 94351-78201)',
        escortOfficer: 'Constable N. Sarma',
        refNo: 'DSP-2026-884',
        dispatchTime: 'Today, 09:40 AM'
      },
      {
        id: 'ALC-503',
        destination: 'Goroimari Char Cluster',
        block: 'Goroimari Circle',
        severity: 'Moderate',
        lat: 26.095,
        lng: 91.340,
        summary: '1 Boat, 15 Jackets, 250 Food, 40 Meds',
        needs: { boats: 1, jackets: 15, food: 250, meds: 40 },
        assignedGodown: 'Central Relief Godown – Mirza',
        status: 'Pending Dispatch',
        vehicle: 'Pickup AS-14-B-9912 & Motorized Barge',
        driver: 'Abdul Munnaf (+91 97060-44129)',
        escortOfficer: 'Home Guard J. Medhi',
        refNo: '—',
        dispatchTime: '—'
      }
    ],
    returns: Array.isArray(seed.returns) ? JSON.parse(JSON.stringify(seed.returns)) : [
      { id: 'RET-301', resourceId: 'INV-01', resourceName: 'Inflatable Rescue Boats', from: 'Boko Relief Sector', good: 2, damaged: 0, missing: 0, date: 'Yesterday, 06:15 PM' }
    ],
    movements: Array.isArray(seed.movements) ? JSON.parse(JSON.stringify(seed.movements)) : [
      { time: 'Today, 09:40 AM', type: 'DISPATCH', item: '450 Dry Ration Food Packets', party: 'To: Chaygaon Lowland Belt', note: 'Ref: DSP-2026-884 • Vehicle AS-01-GC-4821' },
      { time: 'Today, 08:30 AM', type: 'STOCK IN', item: '150 Essential Flood Medicine Kits', party: 'From: State SDMA Supply', note: 'Received at Central Relief Godown – Mirza' },
      { time: 'Yesterday, 06:15 PM', type: 'RETURN', item: '2 Inflatable Rescue Boats (Good)', party: 'From: Boko Relief Sector', note: 'Condition verified Good; restocked to Available' }
    ],
    warehouses: [
      { id: 'WH-MIRZA', name: 'Central Relief Godown – Mirza', manager: 'Kamal Sarma', phone: '+91 94350-11204', address: 'NH-17 Logistics Corridor, Mirza', coords: [26.082, 91.531], bays: 4 },
      { id: 'WH-RANGIA', name: 'North Sector Warehouse – Rangia', manager: 'Pranjal Deka', phone: '+91 98641-44589', address: 'Industrial Area, Rangia', coords: [26.435, 91.618], bays: 2 }
    ]
  };
}

/**
 * Fetch full godown state from Next.js backend
 */
export async function fetchGodownState() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      cachedState = json.data;
      notifySync(cachedState);
      return cachedState;
    }
  } catch (err) {
    console.warn('Godown API live fetch note (using cached/fallback):', err.message);
  }

  if (!cachedState) {
    cachedState = getDefaultGodownSeed();
  }
  return cachedState;
}

/**
 * Add new stock item to warehouse
 */
export async function addStockItemApi(itemData) {
  if (!cachedState) cachedState = getDefaultGodownSeed();
  if (!cachedState.inventory) cachedState.inventory = [];
  if (!cachedState.movements) cachedState.movements = [];

  const qty = Number(itemData.qty || itemData.total) || 10;
  const minLimit = Number(itemData.minLimit) || 20;

  const newItem = {
    id: itemData.id || `INV-${String(cachedState.inventory.length + 1).padStart(2, '0')}`,
    name: itemData.name || 'Emergency Relief Unit',
    category: itemData.category || 'Rescue Equipment',
    warehouse: itemData.warehouse || 'Central Relief Godown – Mirza',
    total: qty,
    available: qty,
    allocated: 0,
    dispatched: 0,
    minLimit,
    condition: qty <= minLimit ? 'Low Stock' : 'Good'
  };

  cachedState.inventory.unshift(newItem);
  cachedState.movements.unshift({
    time: itemData.date || 'Just now',
    type: 'STOCK IN',
    item: `${qty} ${newItem.name}`,
    party: `From: ${itemData.supplier || 'State SDMA Supply'}`,
    note: `Added to ${newItem.warehouse}`
  });

  notifySync(cachedState);

  try {
    const res = await fetch(`${API_BASE}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {
    console.warn('Backend inventory sync caught:', e.message);
  }

  return newItem;
}

/**
 * Update stock item quantity / condition
 */
export async function updateStockItemApi(itemData) {
  if (!cachedState) cachedState = getDefaultGodownSeed();
  const idx = Number(itemData.index);
  const newAvail = Number(itemData.available);
  const cond = itemData.condition;
  const reason = itemData.reason || 'Physical count audit';

  if (cachedState.inventory && cachedState.inventory[idx]) {
    const item = cachedState.inventory[idx];
    item.available = newAvail;
    item.condition = cond;

    if (!cachedState.movements) cachedState.movements = [];
    cachedState.movements.unshift({
      time: 'Just now',
      type: 'CORRECTION',
      item: `${item.name} (Avail: ${newAvail})`,
      party: item.warehouse,
      note: `Condition: ${cond} • Reason: ${reason}`
    });

    notifySync(cachedState);
  }

  try {
    const res = await fetch(`${API_BASE}/inventory`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {
    console.warn('Backend stock correction sync caught:', e.message);
  }
}

/**
 * Confirm and dispatch consignment to field sector
 */
export async function confirmDispatchApi(dispatchData) {
  if (!cachedState) cachedState = getDefaultGodownSeed();

  const idx = Number(dispatchData.allocIndex);
  const vehicle = dispatchData.vehicle;
  const dest = dispatchData.dest;
  const dt = dispatchData.dispatchTime || 'Just now';
  const refNo = dispatchData.refNo || `DSP-2026-${Math.floor(880 + Math.random() * 90)}`;

  let alloc = null;
  if (!isNaN(idx) && idx >= 0 && cachedState.allocations && cachedState.allocations[idx]) {
    alloc = cachedState.allocations[idx];
  } else if (dispatchData.allocId && cachedState.allocations) {
    alloc = cachedState.allocations.find(a => a.id === dispatchData.allocId);
  }

  if (alloc) {
    alloc.status = 'Dispatched';
    alloc.vehicle = vehicle;
    alloc.driver = dispatchData.driver || alloc.driver;
    alloc.dispatchTime = dt;
    alloc.refNo = refNo;
    alloc.progress = 65;

    // Deduct stock for all allocated supplies
    const needs = alloc.needs || { boats: 2, jackets: 40, food: 350, meds: 50 };
    const deductions = [
      { cat: 'Rescue Boats', qty: needs.boats || 0 },
      { cat: 'Life Jackets', qty: needs.jackets || 0 },
      { cat: 'Food Packets', qty: needs.food || 0 },
      { cat: 'Medicines', qty: needs.meds || 0 }
    ];

    deductions.forEach(d => {
      const invItem = (cachedState.inventory || []).find(i => i.category.toLowerCase().includes(d.cat.toLowerCase().slice(0, 5)));
      if (invItem && d.qty > 0) {
        invItem.available = Math.max(0, invItem.available - d.qty);
        invItem.allocated = Math.max(0, invItem.allocated - d.qty);
        invItem.dispatched = (invItem.dispatched || 0) + d.qty;
        if (invItem.available <= invItem.minLimit) invItem.condition = 'Low Stock';
      }
    });

    if (!cachedState.movements) cachedState.movements = [];
    cachedState.movements.unshift({
      time: 'Just now',
      type: 'DISPATCH',
      item: alloc.summary || 'Emergency Relief Supplies',
      party: `To: ${dest || alloc.destination}`,
      note: `Ref: ${refNo} • Vehicle: ${vehicle} (Awaiting Ground Officer Verification)`
    });

    notifySync(cachedState);
  }

  try {
    const res = await fetch(`${API_BASE}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...dispatchData, refNo })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {
    console.warn('Backend dispatch sync caught:', e.message);
  }

  return { success: true, refNo, allocation: alloc };
}

/**
 * Report resource shortage to District Authority
 */
export async function reportShortageApi(allocIndexOrId, reason = '') {
  if (!cachedState) cachedState = getDefaultGodownSeed();

  let alloc = null;
  if (typeof allocIndexOrId === 'number' && cachedState.allocations && cachedState.allocations[allocIndexOrId]) {
    alloc = cachedState.allocations[allocIndexOrId];
  } else if (cachedState.allocations) {
    alloc = cachedState.allocations.find(a => a.id === allocIndexOrId);
  }

  if (alloc) {
    alloc.status = 'Shortage Flagged';

    if (!cachedState.movements) cachedState.movements = [];
    cachedState.movements.unshift({
      time: 'Just now',
      type: 'SHORTAGE ALERT',
      item: `${alloc.destination} (${alloc.summary || 'Relief Goods'})`,
      party: `For: ${alloc.destination}`,
      note: `Shortage reported to District Authority for reallocation: ${reason || 'Physical deficit'}`
    });

    notifySync(cachedState);
  }

  try {
    await fetch(`${API_BASE}/shortage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: alloc ? alloc.id : allocIndexOrId, reason })
    });
  } catch (e) {
    console.warn('Backend shortage report sync caught:', e.message);
  }
}

/**
 * Log returned resources from rescue sectors
 */
export async function submitReturnRecordApi(returnData) {
  if (!cachedState) cachedState = getDefaultGodownSeed();

  const { resourceId, from, good, damaged, missing } = returnData;
  const goodQty = Number(good) || 0;
  const damagedQty = Number(damaged) || 0;
  const missingQty = Number(missing) || 0;

  const invItem = (cachedState.inventory || []).find(i => i.id === resourceId);
  const resName = invItem ? invItem.name : 'Rescue Resource';

  if (invItem && goodQty > 0) {
    invItem.available += goodQty;
    invItem.dispatched = Math.max(0, (invItem.dispatched || 0) - (goodQty + damagedQty + missingQty));
  }

  const retRecord = {
    id: `RET-${Math.floor(305 + Math.random() * 90)}`,
    resourceId,
    resourceName: resName,
    from,
    good: goodQty,
    damaged: damagedQty,
    missing: missingQty,
    date: 'Just now'
  };

  if (!cachedState.returns) cachedState.returns = [];
  cachedState.returns.unshift(retRecord);

  if (!cachedState.movements) cachedState.movements = [];
  cachedState.movements.unshift({
    time: 'Just now',
    type: 'RETURN AUDIT',
    item: `${resName} (Good: ${goodQty}, Damaged: ${damagedQty}, Missing: ${missingQty})`,
    party: `From: ${from}`,
    note: 'Only verified Good items added back to Available Stock'
  });

  notifySync(cachedState);

  try {
    const res = await fetch(`${API_BASE}/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (e) {
    console.warn('Backend return record sync caught:', e.message);
  }

  return retRecord;
}

/**
 * Fetch real-time river telemetry for the river corridor
 */
export async function fetchLiveRiverTelemetry(basinId = 'ab') {
  try {
    const res = await fetch(`${API_BASE}/rivers?basin=${encodeURIComponent(basinId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.rivers && json.rivers.length > 0) {
        return json.rivers;
      }
    }
  } catch (e) {
    console.warn('Godown river telemetry notice:', e.message);
  }
  return null;
}
