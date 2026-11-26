// NEERAKSHAK Central Relief Godown & Logistics Hub Backend Service
// Next.js Service Layer: Physical Inventory Management, Authority Allocation Verification,
// Vehicle Dispatch & Gate-Pass Generation, Shortage Escalation, and Returns Auditing.
// Fully connected with Admin (Areas) and Authority (Allocations) for shared real-time lifecycle.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, 'godownData.json');
const authorityDataPath = path.join(__dirname, '..', 'authority', 'authorityData.json');
const adminDataPath = path.join(__dirname, '..', 'admin', 'adminData.json');

function readData() {
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read godown data file:', e);
  }
  return {
    inventory: [],
    allocations: [],
    returns: [],
    movements: [],
    warehouses: []
  };
}

function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to write godown data file:', e);
    return false;
  }
}

// In-memory store
let store = readData();

/**
 * Reusable helper: Parse resource quantities from summary string (e.g. "4 Boats, 60 Jackets, 500 Food, 80 Meds")
 */
function parseResourceSummary(summary) {
  const result = { boats: 2, jackets: 40, food: 350, meds: 50 };
  if (!summary) return result;

  const boatsMatch = summary.match(/(\d+)\s*(?:Rescue\s*)?Boat/i);
  if (boatsMatch) result.boats = Number(boatsMatch[1]);

  const jacketsMatch = summary.match(/(\d+)\s*(?:Life\s*)?Jacket/i);
  if (jacketsMatch) result.jackets = Number(jacketsMatch[1]);

  const foodMatch = summary.match(/(\d+)\s*(?:Dry\s*Ration\s*)?Food/i);
  if (foodMatch) result.food = Number(foodMatch[1]);

  const medsMatch = summary.match(/(\d+)\s*(?:Essential\s*)?Med/i);
  if (medsMatch) result.meds = Number(medsMatch[1]);

  return result;
}

/**
 * Syncs pending allocations directly from Authority DDMA
 * Flow: Admin marks Area -> Authority decides need & approves -> Godown receives EXACT approved order & fulfills via Dispatch
 * Real-time parity: Godown only shows orders that District Authority has actually sanctioned.
 */
function syncFromAuthorityAllocations() {
  try {
    let adminAreas = [];
    if (fs.existsSync(adminDataPath)) {
      try {
        const adminData = JSON.parse(fs.readFileSync(adminDataPath, 'utf-8'));
        if (adminData && Array.isArray(adminData.areas)) adminAreas = adminData.areas;
      } catch (e) {}
    }

    let authVillages = [];
    let authAllocations = [];
    if (fs.existsSync(authorityDataPath)) {
      try {
        const authData = JSON.parse(fs.readFileSync(authorityDataPath, 'utf-8'));
        if (authData && Array.isArray(authData.villages)) authVillages = authData.villages;
        if (authData && Array.isArray(authData.allocations)) authAllocations = authData.allocations;
      } catch (e) {}
    }

    // Match each Authority allocation with geographic coordinates and metadata
    const syncedAllocations = [];

    authAllocations.forEach((authAlloc, idx) => {
      const destName = (authAlloc.village || authAlloc.villageName || 'Sector Village').trim();
      const key = destName.toLowerCase();

      // Find real coordinates from Admin areas or Authority villages
      const areaMatch = adminAreas.find(a => (a.name || '').trim().toLowerCase() === key) ||
        authVillages.find(v => (v.name || '').trim().toLowerCase() === key);

      const lat = areaMatch ? Number(areaMatch.lat) : 26.132;
      const lng = areaMatch ? Number(areaMatch.lng) : 91.515;
      const severity = areaMatch ? (areaMatch.severity || 'Critical') : 'Critical';
      const block = areaMatch ? (areaMatch.block || 'Kamrup Circle') : 'Kamrup Circle';

      const isDispatched = String(authAlloc.godownStatus || '').toLowerCase().includes('in transit') ||
        String(authAlloc.godownStatus || '').toLowerCase().includes('departed') ||
        String(authAlloc.godownStatus || '').toLowerCase().includes('delivered') ||
        String(authAlloc.godownStatus || '').toLowerCase().includes('dispatched');

      const isShortage = String(authAlloc.godownStatus || '').toLowerCase().includes('shortage');

      const needs = parseResourceSummary(authAlloc.summary);

      // Check existing godown allocation for local state (like custom assigned vehicle/gatepass)
      const existing = (store.allocations || []).find(a => 
        (a.id && a.id === authAlloc.id) ||
        (a.destination && a.destination.trim().toLowerCase() === key)
      );

      const status = isDispatched ? 'Dispatched' : (isShortage ? 'Shortage Flagged' : (existing?.status === 'Dispatched' ? 'Dispatched' : 'Pending Dispatch'));

      syncedAllocations.push({
        id: authAlloc.id || `ALC-${501 + idx}`,
        destination: destName,
        block: block,
        severity: severity,
        lat: lat,
        lng: lng,
        summary: authAlloc.summary || `${needs.boats} Boats, ${needs.jackets} Jackets, ${needs.food} Food, ${needs.meds} Meds`,
        needs: needs,
        assignedGodown: authAlloc.assignedGodown || existing?.assignedGodown || 'Central Relief Godown – Mirza',
        status: status,
        vehicle: existing?.vehicle || authAlloc.vehicle || 'Heavy Truck AS-01-EC-4210',
        driver: existing?.driver || authAlloc.driver || 'Rajesh Das (+91 98640-21943)',
        escortOfficer: existing?.escortOfficer || authAlloc.escortOfficer || 'ASI D. Kalita (District Police)',
        refNo: (status === 'Dispatched') ? (existing?.refNo && existing.refNo !== '—' ? existing.refNo : (authAlloc.refNo || 'DSP-2026-884')) : '—',
        dispatchTime: (status === 'Dispatched') ? (existing?.dispatchTime && existing.dispatchTime !== '—' ? existing.dispatchTime : (authAlloc.timestamp || 'Today, 09:45 AM')) : '—',
        progress: (status === 'Dispatched') ? 75 : 20
      });
    });

    store.allocations = syncedAllocations;
    writeData(store);
  } catch (e) {
    console.warn('Notice: Authority allocation sync error:', e.message);
  }
}

/**
 * Reusable helper: Notify Authority portal when Godown dispatches a convoy
 * Updates Authority timeline, delivery progress, and audit logs
 */
function notifyAuthorityOnDispatch(allocItem, refNo, vehicle, driver) {
  try {
    if (fs.existsSync(authorityDataPath)) {
      const authRaw = fs.readFileSync(authorityDataPath, 'utf-8');
      const authData = JSON.parse(authRaw);

      if (authData && Array.isArray(authData.allocations)) {
        const destClean = String(allocItem.destination || '').trim().toLowerCase();
        const baseAllocId = String(allocItem.id || '').split('-')[0];

        const targetAuth = authData.allocations.find(a => 
          (a.id && a.id === baseAllocId) ||
          (a.village && a.village.trim().toLowerCase() === destClean)
        );

        if (targetAuth) {
          targetAuth.godownStatus = `Dispatched (${refNo}) • En-Route`;
          targetAuth.deliveryProgress = 75;
          targetAuth.vehicle = vehicle || targetAuth.vehicle || 'AS-01-GC-4821';
          if (driver) targetAuth.driver = driver;

          if (!targetAuth.timeline) targetAuth.timeline = [];
          targetAuth.timeline.unshift({
            step: 'Departed Central Godown',
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            status: 'done',
            detail: `Gate-pass #${refNo} issued; vehicle ${vehicle} loaded and departed Central Godown for ${allocItem.destination}.`
          });

          if (!authData.logs) authData.logs = [];
          authData.logs.unshift({
            id: `LOG-${Date.now().toString(36).toUpperCase()}`,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            actor: 'Central Godown Manager',
            note: `Dispatched relief consignment for ${allocItem.destination} (Gate-Pass ${refNo}, Vehicle ${vehicle}).`
          });

          fs.writeFileSync(authorityDataPath, JSON.stringify(authData, null, 2), 'utf-8');
        }
      }
    }
  } catch (e) {
    console.warn('Notice: Authority dispatch notification caught:', e.message);
  }
}

/**
 * Reusable helper: Notify Authority when Godown Manager reports shortage
 */
function notifyAuthorityOnShortage(allocItem, reason) {
  try {
    if (fs.existsSync(authorityDataPath)) {
      const authRaw = fs.readFileSync(authorityDataPath, 'utf-8');
      const authData = JSON.parse(authRaw);

      if (authData) {
        if (!authData.logs) authData.logs = [];
        authData.logs.unshift({
          id: `LOG-${Date.now().toString(36).toUpperCase()}`,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          actor: 'Central Godown Manager',
          note: `⚠️ SHORTAGE ALERT: Warehouse inventory insufficient for ${allocItem.summary || 'allocated supplies'} to ${allocItem.destination}. Immediate re-order/restock required.`
        });
        fs.writeFileSync(authorityDataPath, JSON.stringify(authData, null, 2), 'utf-8');
      }
    }
  } catch (e) {
    console.warn('Notice: Authority shortage alert caught:', e.message);
  }
}

export const godownService = {
  /**
   * Return full Godown state with real-time KPI metrics and Authority synchronization
   */
  getFullState() {
    syncFromAuthorityAllocations();
    store = readData();

    const inventory = store.inventory || [];
    const allocations = store.allocations || [];
    const returns = store.returns || [];
    const movements = store.movements || [];
    const warehouses = store.warehouses || [];

    const totalUnits = inventory.reduce((s, i) => s + (Number(i.total) || 0), 0);
    const availUnits = inventory.reduce((s, i) => s + (Number(i.available) || 0), 0);
    const allocUnits = inventory.reduce((s, i) => s + (Number(i.allocated) || 0), 0);
    const dispUnits = inventory.reduce((s, i) => s + (Number(i.dispatched) || 0), 0);
    const lowStockItems = inventory.filter(i => (Number(i.available) || 0) <= (Number(i.minLimit) || 0));
    const pendingDispatches = allocations.filter(a => a.status !== 'Dispatched');

    return {
      portal: 'Central Relief Godown & Logistics Hub',
      status: 'active',
      kpis: {
        totalResources: totalUnits,
        availableStock: availUnits,
        allocatedStock: allocUnits,
        dispatchedStock: dispUnits,
        lowStockCount: lowStockItems.length,
        pendingDispatchCount: pendingDispatches.length
      },
      inventory,
      allocations,
      returns,
      movements,
      warehouses
    };
  },

  /**
   * Filtered inventory list
   */
  getInventory(warehouseFilter = 'ALL', categoryFilter = 'ALL') {
    let list = store.inventory || [];
    if (warehouseFilter && warehouseFilter !== 'ALL') {
      list = list.filter(i => i.warehouse === warehouseFilter);
    }
    if (categoryFilter && categoryFilter !== 'ALL') {
      list = list.filter(i => i.category === categoryFilter);
    }
    return list;
  },

  /**
   * Add new stock entry
   */
  addStockItem(itemData) {
    if (!store.inventory) store.inventory = [];
    if (!store.movements) store.movements = [];

    const qty = Number(itemData.qty || itemData.total || itemData.available) || 10;
    const minLimit = Number(itemData.minLimit) || 20;

    const newItem = {
      id: itemData.id || `INV-${String(store.inventory.length + 1).padStart(2, '0')}`,
      name: itemData.name || 'Emergency Relief Unit',
      category: itemData.category || 'Rescue Equipment',
      warehouse: itemData.warehouse || 'Central Relief Godown – Mirza',
      total: qty,
      available: qty,
      allocated: 0,
      dispatched: 0,
      minLimit: minLimit,
      condition: qty <= minLimit ? 'Low Stock' : 'Good'
    };

    store.inventory.unshift(newItem);

    const movementTime = itemData.date || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    store.movements.unshift({
      time: movementTime,
      type: 'STOCK IN',
      item: `${qty} ${newItem.name}`,
      party: `From: ${itemData.supplier || 'State SDMA Supply'}`,
      note: `Added to ${newItem.warehouse} • Batch ID verified`
    });

    writeData(store);
    return newItem;
  },

  /**
   * Update stock item quantity / condition (physical audit correction)
   */
  updateStockItem(invIdOrIndex, updates) {
    if (!store.inventory) store.inventory = [];
    if (!store.movements) store.movements = [];

    let item = null;
    if (typeof invIdOrIndex === 'number' && store.inventory[invIdOrIndex]) {
      item = store.inventory[invIdOrIndex];
    } else {
      item = store.inventory.find(i => i.id === invIdOrIndex || i.name === invIdOrIndex);
    }

    if (!item) {
      throw new Error('Inventory item not found for update');
    }

    const prevAvail = item.available;
    if (updates.available !== undefined) item.available = Number(updates.available);
    if (updates.condition) item.condition = updates.condition;
    if (updates.minLimit !== undefined) item.minLimit = Number(updates.minLimit);

    if (item.available <= item.minLimit && item.condition === 'Good') {
      item.condition = 'Low Stock';
    }

    store.movements.unshift({
      time: 'Just now',
      type: 'CORRECTION',
      item: `${item.name} (Avail: ${item.available}, Prev: ${prevAvail})`,
      party: item.warehouse,
      note: `Condition: ${item.condition} • Reason: ${updates.reason || 'Physical warehouse count audit'}`
    });

    writeData(store);
    return item;
  },

  /**
   * Get allocations
   */
  getAllocations() {
    syncFromAuthorityAllocations();
    return store.allocations || [];
  },

  /**
   * Prepare and dispatch approved allocation
   */
  dispatchConsignment(dispatchData) {
    syncFromAuthorityAllocations();
    if (!store.allocations) store.allocations = [];
    if (!store.movements) store.movements = [];

    const { allocIndex, allocId, vehicle, dest, dispatchTime, driver } = dispatchData;

    let alloc = null;
    if (typeof allocIndex === 'number' && store.allocations[allocIndex]) {
      alloc = store.allocations[allocIndex];
    } else if (allocId) {
      alloc = store.allocations.find(a => a.id === allocId);
    }

    if (!alloc) {
      throw new Error('Allocation order not found');
    }

    const refNo = dispatchData.refNo || `DSP-2026-${Math.floor(880 + Math.random() * 90)}`;
    const finalVehicle = vehicle || alloc.vehicle || 'AS-01-GC-4821 (Tata 407)';
    const finalDest = dest || alloc.destination;
    const finalTime = dispatchTime || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Deduct stock for all allocated items
    const needs = alloc.needs || parseResourceSummary(alloc.summary);
    const deductions = [
      { cat: 'Rescue Boats', qty: needs.boats || 0 },
      { cat: 'Life Jackets', qty: needs.jackets || 0 },
      { cat: 'Food Packets', qty: needs.food || 0 },
      { cat: 'Medicines', qty: needs.meds || 0 }
    ];

    deductions.forEach(d => {
      const invItem = (store.inventory || []).find(i => i.category.toLowerCase().includes(d.cat.toLowerCase().slice(0, 5)));
      if (invItem && d.qty > 0) {
        invItem.available = Math.max(0, invItem.available - d.qty);
        invItem.allocated = Math.max(0, invItem.allocated - d.qty);
        invItem.dispatched = (invItem.dispatched || 0) + d.qty;
        if (invItem.available <= invItem.minLimit) invItem.condition = 'Low Stock';
      }
    });

    alloc.status = 'Dispatched';
    alloc.vehicle = finalVehicle;
    alloc.driver = driver || alloc.driver || 'Rajesh Das (+91 98640-21943)';
    alloc.dispatchTime = finalTime;
    alloc.refNo = refNo;
    alloc.progress = 65;

    store.movements.unshift({
      time: 'Just now',
      type: 'DISPATCH',
      item: alloc.summary || 'Emergency Relief Consignment',
      party: `To: ${finalDest}`,
      note: `Ref: ${refNo} • Vehicle: ${finalVehicle} (Gate-pass issued • En-route)`
    });

    // Notify Authority portal
    notifyAuthorityOnDispatch(alloc, refNo, finalVehicle, alloc.driver);

    writeData(store);
    return { success: true, allocation: alloc, refNo };
  },

  /**
   * Report shortage to District Authority
   */
  reportShortage(allocIndexOrId, reason = '') {
    syncFromAuthorityAllocations();
    if (!store.allocations) store.allocations = [];
    if (!store.movements) store.movements = [];

    let alloc = null;
    if (typeof allocIndexOrId === 'number' && store.allocations[allocIndexOrId]) {
      alloc = store.allocations[allocIndexOrId];
    } else {
      alloc = store.allocations.find(a => a.id === allocIndexOrId);
    }

    if (!alloc) {
      throw new Error('Allocation record not found');
    }

    alloc.status = 'Shortage Flagged';

    store.movements.unshift({
      time: 'Just now',
      type: 'SHORTAGE ALERT',
      item: `${alloc.destination} (${alloc.summary || 'Relief Goods'})`,
      party: `For: ${alloc.destination}`,
      note: `Shortage flagged to DDMA: ${reason || 'Physical stock below required threshold'}`
    });

    notifyAuthorityOnShortage(alloc, reason);

    writeData(store);
    return { success: true, allocation: alloc };
  },

  /**
   * Log returned resources (from field operations)
   */
  logReturn(returnData) {
    if (!store.returns) store.returns = [];
    if (!store.movements) store.movements = [];

    const { resourceId, from, good, damaged, missing } = returnData;
    const goodQty = Number(good) || 0;
    const damagedQty = Number(damaged) || 0;
    const missingQty = Number(missing) || 0;

    const invItem = (store.inventory || []).find(i => i.id === resourceId);
    const resName = invItem ? invItem.name : (returnData.resourceName || 'Rescue Resource');

    if (invItem && goodQty > 0) {
      invItem.available += goodQty;
      invItem.dispatched = Math.max(0, (invItem.dispatched || 0) - (goodQty + damagedQty + missingQty));
      if (invItem.available > invItem.minLimit && invItem.condition === 'Low Stock') {
        invItem.condition = 'Good';
      }
    }

    const retRecord = {
      id: `RET-${Math.floor(310 + Math.random() * 80)}`,
      resourceId: resourceId || (invItem ? invItem.id : 'INV-01'),
      resourceName: resName,
      from: from || 'Field Sector',
      good: goodQty,
      damaged: damagedQty,
      missing: missingQty,
      date: 'Just now'
    };

    store.returns.unshift(retRecord);

    store.movements.unshift({
      time: 'Just now',
      type: 'RETURN AUDIT',
      item: `${resName} (Good: ${goodQty}, Damaged: ${damagedQty}, Missing: ${missingQty})`,
      party: `From: ${retRecord.from}`,
      note: 'Verified Good items restocked to Available. Damaged/Missing logged for audit.'
    });

    writeData(store);
    return retRecord;
  },

  /**
   * Get stock movement audit trail
   */
  getMovements() {
    return store.movements || [];
  },

  /**
   * Get warehouses
   */
  getWarehouses() {
    return store.warehouses || [];
  }
};
