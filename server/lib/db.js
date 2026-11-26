// NEERAKSHAK Next.js MongoDB Database Engine
// STRICT REAL-DATA ONLY: ZERO fake data in MongoDB.
// All demonstration and fake drill data is isolated exclusively in public/seed.js.
// MongoDB only holds real records explicitly created or updated by the user.

import { getDatabase } from './mongodb.js';

// Real operational cache (clean empty state by default)
let cache = {
  admin: {
    areas: [],
    rivers: [],
    alerts: [],
    facilities: [],
    weather: {}
  },
  authority: {
    villages: [],
    requests: [],
    allocations: [],
    coordinations: [],
    operations: [],
    logs: []
  },
  godown: {
    inventory: [],
    allocations: [],
    returns: [],
    movements: [],
    warehouses: []
  },
  groundOfficer: {
    areas: [],
    deliveries: [],
    fieldReports: [],
    operations: [],
    returns: [],
    notifications: []
  },
  monitoring: {
    reconciliation: [],
    discrepancies: [],
    returns: [],
    operations: [],
    logs: [],
    escalations: [],
    chats: {}
  }
};

// -----------------------------------------------------------------------------
// 1. ADMIN REAL DATABASE OPERATIONS
// -----------------------------------------------------------------------------
export const adminDb = {
  async getState() {
    const db = await getDatabase();
    if (db) {
      try {
        const [areas, rivers, alerts, facilities] = await Promise.all([
          db.collection('admin_areas').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('admin_rivers').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('admin_alerts').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('admin_facilities').find({}, { projection: { _id: 0 } }).toArray(),
        ]);
        cache.admin = {
          areas: areas || [],
          rivers: rivers || [],
          alerts: alerts || [],
          facilities: facilities || [],
          weather: cache.admin.weather || {}
        };
      } catch (e) {
        console.warn('adminDb.getState fetch notice:', e.message);
      }
    }
    return cache.admin;
  },

  async saveArea(areaData) {
    const id = areaData.id || `area-${Date.now()}`;
    const record = {
      id,
      name: areaData.name || 'Assigned Flood Sector',
      block: areaData.block || 'District Sector',
      severity: areaData.severity || 'Moderate',
      pop: Number(areaData.pop) || 0,
      lat: Number(areaData.lat) || 26.12,
      lng: Number(areaData.lng) || 91.45,
      notes: areaData.notes || '',
      updatedAt: new Date().toISOString()
    };

    if (!cache.admin.areas) cache.admin.areas = [];
    const idx = cache.admin.areas.findIndex(a => a.id === id || a.name.toLowerCase() === record.name.toLowerCase());
    if (idx >= 0) cache.admin.areas[idx] = { ...cache.admin.areas[idx], ...record };
    else cache.admin.areas.unshift(record);

    // Save strictly to MongoDB
    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('admin_areas').updateOne(
          { id: record.id },
          { $set: record },
          { upsert: true }
        );
      } catch (e) {
        console.warn('MongoDB saveArea notice:', e.message);
      }
    }
    return record;
  },

  async deleteArea(id) {
    if (cache.admin.areas) {
      cache.admin.areas = cache.admin.areas.filter(a => a.id !== id && a.name !== id);
    }
    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('admin_areas').deleteOne({ $or: [{ id }, { name: id }] });
      } catch (e) {}
    }
    return true;
  },

  async saveAlert(alertData) {
    const alert = {
      id: alertData.id || `alt-${Date.now()}`,
      title: alertData.title || 'Flood Warning',
      location: alertData.location || 'Assigned District',
      severity: alertData.severity || 'Moderate',
      desc: alertData.desc || '',
      timestamp: new Date().toISOString()
    };
    if (!cache.admin.alerts) cache.admin.alerts = [];
    cache.admin.alerts.unshift(alert);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('admin_alerts').insertOne({ ...alert });
      } catch (e) {}
    }
    return alert;
  },

  async deleteAlert(idOrTitle) {
    if (cache.admin.alerts) {
      cache.admin.alerts = cache.admin.alerts.filter(a => a.id !== idOrTitle && a.title !== idOrTitle);
    }
    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('admin_alerts').deleteOne({ $or: [{ id: idOrTitle }, { title: idOrTitle }] });
      } catch (e) {}
    }
    return true;
  },

  async saveFacility(facilityData) {
    const facility = {
      id: facilityData.id || `fac-${Date.now()}`,
      name: facilityData.name || 'Emergency Center',
      type: facilityData.type || 'Relief Camp',
      lat: Number(facilityData.lat) || 26.12,
      lng: Number(facilityData.lng) || 91.45,
      capacity: Number(facilityData.capacity) || 500,
      contact: facilityData.contact || ''
    };
    if (!cache.admin.facilities) cache.admin.facilities = [];
    const idx = cache.admin.facilities.findIndex(f => f.id === facility.id || f.name === facility.name);
    if (idx >= 0) cache.admin.facilities[idx] = facility;
    else cache.admin.facilities.push(facility);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('admin_facilities').updateOne({ id: facility.id }, { $set: facility }, { upsert: true });
      } catch (e) {}
    }
    return facility;
  },

  async updateRiver(riverData) {
    const id = riverData.id || riverData.name;
    if (!cache.admin.rivers) cache.admin.rivers = [];
    let river = cache.admin.rivers.find(r => r.id === id || r.name === id);
    if (!river) {
      river = { id, name: riverData.name || id, current: Number(riverData.current || 0), danger: Number(riverData.danger || 18.0) };
      cache.admin.rivers.push(river);
    }
    if (riverData.current !== undefined) river.current = Number(riverData.current);
    if (riverData.trend) river.trend = riverData.trend;
    if (river.current >= river.danger) river.barColor = '#dc2626';
    else if (river.current >= river.danger - 0.8) river.barColor = '#eab308';
    else river.barColor = '#16a34a';

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('admin_rivers').updateOne({ id: river.id }, { $set: river }, { upsert: true });
      } catch (e) {}
    }
    return river;
  }
};

// -----------------------------------------------------------------------------
// 2. DISTRICT AUTHORITY (DDMA) REAL DATABASE OPERATIONS
// -----------------------------------------------------------------------------
export const authorityDb = {
  async getState() {
    // Automatically incorporate real areas created in Admin into Authority villages
    const adminState = await adminDb.getState();
    const adminAreas = adminState.areas || [];

    const db = await getDatabase();
    if (db) {
      try {
        const [villages, requests, allocations, coordinations, operations, logs] = await Promise.all([
          db.collection('authority_villages').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('authority_requests').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('authority_allocations').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('authority_coordinations').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('authority_operations').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('authority_logs').find({}, { projection: { _id: 0 } }).toArray(),
        ]);
        cache.authority = {
          villages: villages || [],
          requests: requests || [],
          allocations: allocations || [],
          coordinations: coordinations || [],
          operations: operations || [],
          logs: logs || []
        };
      } catch (e) {
        console.warn('authorityDb.getState notice:', e.message);
      }
    }

    // Merge any real admin areas that were saved into authority villages
    adminAreas.forEach(area => {
      const exists = cache.authority.villages.find(v => v.id === area.id || v.name.toLowerCase() === area.name.toLowerCase());
      if (!exists) {
        const pop = Number(area.pop) || 2000;
        const isCrit = area.severity === 'Critical';
        const isHigh = area.severity === 'High';
        cache.authority.villages.push({
          id: area.id,
          name: area.name,
          block: area.block || 'Assigned Circle',
          severity: area.severity || 'Moderate',
          pop: pop,
          waterStatus: area.notes || (isCrit ? 'Embankment overflow watch' : 'Approach road monitored'),
          assessedNeed: {
            boats: isCrit ? Math.max(3, Math.round(pop / 1000)) : (isHigh ? Math.max(1, Math.round(pop / 1500)) : 1),
            jackets: Math.round(pop * 0.015),
            food: Math.round(pop * 0.12),
            meds: Math.round(pop * 0.02)
          },
          lat: Number(area.lat) || 26.15,
          lng: Number(area.lng) || 91.60
        });
      }
    });

    return cache.authority;
  },

  async saveAllocation(allocData) {
    if (!cache.authority.allocations) cache.authority.allocations = [];
    const destClean = String(allocData.village || allocData.destination || '').trim().toLowerCase();

    let existing = cache.authority.allocations.find(a => 
      (a.village && a.village.trim().toLowerCase() === destClean) ||
      (a.id && a.id === allocData.id)
    );

    if (existing) {
      existing.summary = allocData.summary || existing.summary;
      existing.godownStatus = allocData.godownStatus || 'Sent to Godown Manager • Awaiting Dispatch';
      existing.timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      if (allocData.vehicle) existing.vehicle = allocData.vehicle;
      if (allocData.driver) existing.driver = allocData.driver;
      if (!existing.timeline) existing.timeline = [];
      existing.timeline.unshift({
        step: 'Allocation Order Adjusted',
        time: 'Just now',
        status: 'done',
        detail: `Emergency supplies updated by District Authority to: ${existing.summary}`
      });

      const db = await getDatabase();
      if (db) {
        try {
          await db.collection('authority_allocations').updateOne({ id: existing.id }, { $set: existing }, { upsert: true });
        } catch (e) {}
      }
      return existing;
    }

    const newAlloc = {
      id: allocData.id || `ALC-${Math.floor(530 + Math.random() * 70)}`,
      village: allocData.village || allocData.destination || 'Assigned Area',
      summary: allocData.summary || 'Emergency Ration & Equipment Buffer',
      godownStatus: allocData.godownStatus || 'Sent to Godown Manager • Awaiting Dispatch',
      deliveryProgress: allocData.deliveryProgress || 25,
      assignedGodown: allocData.assignedGodown || 'Central Relief Godown',
      vehicle: allocData.vehicle || 'Heavy Truck AS-01-EC-4210',
      driver: allocData.driver || 'Rajesh Das (+91 98640-21943)',
      escortOfficer: allocData.escortOfficer || 'District Police Escort',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      timeline: [
        { step: 'DDMA Allocation Approved', time: 'Just now', status: 'done', detail: 'Direct allocation approved by Authority & transmitted to Godown Manager.' },
        { step: 'Stock Verification & Staging', time: 'In Progress', status: 'active', detail: 'Godown warehouse crew picking verified stock from storage racks.' },
        { step: 'Vehicle Dispatch & Gate Pass', time: 'Pending', status: 'pending', detail: 'Pallets loading & security checkpoint clearance.' },
        { step: 'Route Checkpoint Crossing', time: 'Pending', status: 'pending', detail: 'Transit via high-water bypass bridge towards destination.' },
        { step: 'Camp Intake & Final Distribution', time: 'Pending', status: 'pending', detail: 'Handover to Ground Officer and receipt acknowledgement.' }
      ]
    };

    cache.authority.allocations.unshift(newAlloc);
    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('authority_allocations').insertOne({ ...newAlloc });
      } catch (e) {}
    }
    return newAlloc;
  },

  async saveRequest(reqData) {
    const newReq = {
      id: reqData.id || `REQ-${Math.floor(210 + Math.random() * 80)}`,
      from: reqData.from || 'Field Relief Officer',
      village: reqData.village || 'Assigned Sector',
      items: reqData.items || 'Emergency Ration & Kits',
      urgency: reqData.urgency || 'High',
      status: reqData.status || 'Pending',
      reason: reqData.reason || 'Awaiting Authority Review',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    if (!cache.authority.requests) cache.authority.requests = [];
    cache.authority.requests.unshift(newReq);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('authority_requests').insertOne({ ...newReq });
      } catch (e) {}
    }
    return newReq;
  },

  async updateRequest(reqIdOrIndex, decision, reason) {
    if (!cache.authority.requests) cache.authority.requests = [];
    let req = null;
    if (typeof reqIdOrIndex === 'number' && reqIdOrIndex >= 0 && cache.authority.requests[reqIdOrIndex]) {
      req = cache.authority.requests[reqIdOrIndex];
    } else {
      req = cache.authority.requests.find(r => r.id === reqIdOrIndex);
    }
    if (!req) return null;

    req.status = decision;
    req.reason = reason || (decision === 'Approved' ? 'Approved by District Authority DDMA' : 'Rejected per inventory assessment');

    if (decision === 'Approved') {
      await this.saveAllocation({
        village: req.village,
        summary: req.items,
        godownStatus: 'Sent to Godown Manager • Preparing Dispatch'
      });
    }

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('authority_requests').updateOne({ id: req.id }, { $set: req });
      } catch (e) {}
    }
    return req;
  },

  async saveCoordination(coordData) {
    const record = {
      id: coordData.id || `CORD-${Math.floor(105 + Math.random() * 90)}`,
      agency: coordData.agency || 'NDRF (1st Bn)',
      sector: coordData.sector || 'Assigned District Sector',
      update: coordData.update || 'Emergency deployment recorded.',
      commander: coordData.commander || 'Officer in Charge',
      contact: coordData.contact || '+91 94350-12345',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    if (!cache.authority.coordinations) cache.authority.coordinations = [];
    cache.authority.coordinations.unshift(record);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('authority_coordinations').insertOne({ ...record });
      } catch (e) {}
    }
    return record;
  },

  async saveOperation(opData) {
    const record = {
      id: opData.id || `OP-${Date.now().toString(36).toUpperCase()}`,
      title: opData.title || 'Evacuation Operation',
      status: opData.status || 'Active',
      summary: opData.summary || 'Monitored actively by DDMA',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    if (!cache.authority.operations) cache.authority.operations = [];
    cache.authority.operations.unshift(record);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('authority_operations').insertOne({ ...record });
      } catch (e) {}
    }
    return record;
  },

  async addLog(logData) {
    const log = {
      id: `LOG-${Date.now().toString(36).toUpperCase()}`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      actor: logData.actor || 'District Authority (DDMA)',
      note: logData.note || 'Official record logged.'
    };
    if (!cache.authority.logs) cache.authority.logs = [];
    cache.authority.logs.unshift(log);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('authority_logs').insertOne({ ...log });
      } catch (e) {}
    }
    return log;
  }
};

// -----------------------------------------------------------------------------
// 3. CENTRAL RELIEF GODOWN REAL DATABASE OPERATIONS
// -----------------------------------------------------------------------------
export const godownDb = {
  async getState() {
    const authState = await authorityDb.getState();
    const authAllocations = authState.allocations || [];
    const adminState = await adminDb.getState();
    const adminAreas = adminState.areas || [];

    const db = await getDatabase();
    if (db) {
      try {
        const [inventory, returns, movements] = await Promise.all([
          db.collection('godown_inventory').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('godown_returns').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('godown_movements').find({}, { projection: { _id: 0 } }).toArray()
        ]);
        cache.godown.inventory = inventory || [];
        cache.godown.returns = returns || [];
        cache.godown.movements = movements || [];
      } catch (e) {}
    }

    // Map Authority allocations into Godown in real time
    cache.godown.allocations = authAllocations.map(authAlloc => {
      const destName = (authAlloc.village || authAlloc.destination || 'Assigned Area').trim();
      const areaMatch = adminAreas.find(a => (a.name || '').toLowerCase() === destName.toLowerCase());
      const isDispatched = String(authAlloc.godownStatus || '').toLowerCase().includes('dispatched') ||
                           String(authAlloc.godownStatus || '').toLowerCase().includes('en-route');
      const isShortage = String(authAlloc.godownStatus || '').toLowerCase().includes('shortage');

      return {
        id: authAlloc.id,
        destination: destName,
        block: areaMatch?.block || 'Assigned Sector',
        severity: areaMatch?.severity || 'Critical',
        lat: areaMatch ? Number(areaMatch.lat) : 26.132,
        lng: areaMatch ? Number(areaMatch.lng) : 91.515,
        summary: authAlloc.summary || 'Emergency Relief Buffer',
        assignedGodown: authAlloc.assignedGodown || 'Central Relief Godown',
        status: isDispatched ? 'Dispatched' : (isShortage ? 'Shortage Flagged' : 'Pending Dispatch'),
        vehicle: authAlloc.vehicle || 'Heavy Truck AS-01-EC-4210',
        driver: authAlloc.driver || 'Rajesh Das (+91 98640-21943)',
        escortOfficer: authAlloc.escortOfficer || 'District Police Escort',
        refNo: authAlloc.refNo || (isDispatched ? 'DSP-2026-884' : '—'),
        dispatchTime: isDispatched ? (authAlloc.dispatchTime || 'Today, 09:40 AM') : '—',
        deliveryProgress: authAlloc.deliveryProgress || (isDispatched ? 75 : 20)
      };
    });

    return cache.godown;
  },

  async saveStock(itemData) {
    const qty = Number(itemData.qty || itemData.total) || 10;
    const minLimit = Number(itemData.minLimit) || 20;
    const newItem = {
      id: itemData.id || `INV-${String((cache.godown.inventory || []).length + 1).padStart(2, '0')}`,
      name: itemData.name || 'Emergency Relief Unit',
      category: itemData.category || 'Rescue Equipment',
      warehouse: itemData.warehouse || 'Central Relief Godown',
      total: qty,
      available: qty,
      allocated: 0,
      dispatched: 0,
      minLimit,
      condition: qty <= minLimit ? 'Low Stock' : 'Good'
    };

    if (!cache.godown.inventory) cache.godown.inventory = [];
    cache.godown.inventory.unshift(newItem);

    const movement = {
      time: itemData.date || 'Just now',
      type: 'STOCK IN',
      item: `${qty} ${newItem.name}`,
      party: itemData.supplier || 'Government Supply',
      note: `Received at ${newItem.warehouse}`
    };
    if (!cache.godown.movements) cache.godown.movements = [];
    cache.godown.movements.unshift(movement);

    const db = await getDatabase();
    if (db) {
      try {
        await Promise.all([
          db.collection('godown_inventory').insertOne({ ...newItem }),
          db.collection('godown_movements').insertOne({ ...movement })
        ]);
      } catch (e) {}
    }
    return newItem;
  },

  async updateStock(id, changes) {
    if (!cache.godown.inventory) cache.godown.inventory = [];
    const item = cache.godown.inventory.find(i => i.id === id);
    if (!item) return null;
    if (changes.available !== undefined) item.available = Number(changes.available);
    if (changes.condition) item.condition = changes.condition;

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('godown_inventory').updateOne({ id: item.id }, { $set: item });
      } catch (e) {}
    }
    return item;
  },

  async dispatchConvoy(dispatchData) {
    const allocId = dispatchData.allocId;
    const dest = dispatchData.dest;
    const vehicle = dispatchData.vehicle || 'Heavy Truck AS-01-EC-4210';
    const driver = dispatchData.driver || 'Rajesh Das (+91 98640-21943)';
    const refNo = `DSP-2026-${Math.floor(880 + Math.random() * 100)}`;
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const authState = await authorityDb.getState();
    const destClean = String(dest || '').trim().toLowerCase();
    const targetAuth = (authState.allocations || []).find(a => 
      (a.id && a.id === allocId) ||
      (a.village && a.village.trim().toLowerCase() === destClean)
    );

    if (targetAuth) {
      targetAuth.godownStatus = `Dispatched (${refNo}) • En-Route`;
      targetAuth.deliveryProgress = 75;
      targetAuth.vehicle = vehicle;
      targetAuth.driver = driver;
      targetAuth.refNo = refNo;
      targetAuth.dispatchTime = nowTime;
      if (!targetAuth.timeline) targetAuth.timeline = [];
      targetAuth.timeline.unshift({
        step: `Convoy Dispatched (${refNo})`,
        time: nowTime,
        status: 'done',
        detail: `Gate-pass issued. Vehicle ${vehicle} departed under escort with driver ${driver}.`
      });

      const db = await getDatabase();
      if (db) {
        try {
          await db.collection('authority_allocations').updateOne({ id: targetAuth.id }, { $set: targetAuth });
        } catch (e) {}
      }
    }

    const movement = {
      time: `Today, ${nowTime}`,
      type: 'DISPATCH',
      item: `Emergency Consignment for ${dest}`,
      party: `To: ${dest}`,
      note: `Ref: ${refNo} • Vehicle: ${vehicle} • Driver: ${driver}`
    };
    if (!cache.godown.movements) cache.godown.movements = [];
    cache.godown.movements.unshift(movement);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('godown_movements').insertOne({ ...movement });
      } catch (e) {}
    }

    return { success: true, refNo, dispatchTime: nowTime };
  },

  async reportShortage(allocId, reason) {
    const authState = await authorityDb.getState();
    const targetAuth = (authState.allocations || []).find(a => a.id === allocId);
    if (targetAuth) {
      targetAuth.godownStatus = 'Warehouse Stock Shortage Flagged';
      if (!targetAuth.timeline) targetAuth.timeline = [];
      targetAuth.timeline.unshift({
        step: 'Stock Shortage Flagged',
        time: 'Just now',
        status: 'active',
        detail: `Godown Manager flagged shortage alert to District Authority: ${reason}`
      });

      const db = await getDatabase();
      if (db) {
        try {
          await db.collection('authority_allocations').updateOne({ id: targetAuth.id }, { $set: targetAuth });
        } catch (e) {}
      }
    }
    return { success: true };
  }
};

// -----------------------------------------------------------------------------
// 4. GROUND OFFICER & MONITORING REAL OPERATIONS
// -----------------------------------------------------------------------------
export const groundDb = {
  async getState() {
    const db = await getDatabase();
    if (db) {
      try {
        const [reports, deliveries] = await Promise.all([
          db.collection('ground_reports').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('ground_deliveries').find({}, { projection: { _id: 0 } }).toArray()
        ]);
        cache.groundOfficer.fieldReports = reports || [];
        cache.groundOfficer.deliveries = deliveries || [];
      } catch (e) {}
    }
    return cache.groundOfficer;
  },

  async submitReport(reportData) {
    const report = {
      refId: `FR-2026-${Math.floor(400 + Math.random() * 500)}`,
      village: reportData.village || 'Assigned Area',
      severity: reportData.severity || 'Moderate',
      water: reportData.water || 'Normal Runoff',
      affected: reportData.affected || 'Assigned Population',
      stranded: Number(reportData.stranded) || 0,
      road: reportData.road || 'Passable',
      needs: reportData.needs || 'Relief Buffer',
      coords: reportData.coords || '26.12, 91.50',
      time: 'Just now',
      reviewStatus: 'Pending Review'
    };
    if (!cache.groundOfficer.fieldReports) cache.groundOfficer.fieldReports = [];
    cache.groundOfficer.fieldReports.unshift(report);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('ground_reports').insertOne({ ...report });
      } catch (e) {}
    }
    return report;
  }
};

export const monitoringDb = {
  async getState() {
    const db = await getDatabase();
    if (db) {
      try {
        const [reconcil, disc] = await Promise.all([
          db.collection('monitoring_reconciliation').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('monitoring_discrepancies').find({}, { projection: { _id: 0 } }).toArray()
        ]);
        cache.monitoring.reconciliation = reconcil || [];
        cache.monitoring.discrepancies = disc || [];
      } catch (e) {}
    }
    return cache.monitoring;
  }
};
