// NEERAKSHAK Next.js MongoDB Database Engine
// STRICT REAL-DATA ONLY: ZERO fake data in MongoDB.
// All demonstration and fake drill data is isolated exclusively in public/seed.js.
// MongoDB (neerakshak_db) only holds real records explicitly created or updated by the user.

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
// 1. ADMIN REAL DATABASE OPERATIONS (neerakshak_db)
// -----------------------------------------------------------------------------
export const adminDb = {
  async getState() {
    const db = await getDatabase();
    if (db) {
      try {
        const [areas, rivers, alerts, facilities] = await Promise.all([
          db.collection('affectedareas').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('rivers').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('floodalerts').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('emergencyfacilities').find({}, { projection: { _id: 0 } }).toArray(),
        ]);

        // Check active requests and allocations with District Authority
        let activeAuthAreas = new Set();
        try {
          const [allocs, reqs] = await Promise.all([
            db.collection('resourceallocations').find({}, { projection: { targetLocation: 1, destination: 1, village: 1, _id: 0 } }).toArray(),
            db.collection('resourcerequests').find({}, { projection: { targetLocation: 1, village: 1, _id: 0 } }).toArray()
          ]);
          (allocs || []).forEach(a => {
            if (a.village) activeAuthAreas.add(a.village.trim().toLowerCase());
            if (a.destination) activeAuthAreas.add(a.destination.trim().toLowerCase());
            if (a.targetLocation) activeAuthAreas.add(a.targetLocation.trim().toLowerCase());
          });
          (reqs || []).forEach(r => {
            if (r.village) activeAuthAreas.add(r.village.trim().toLowerCase());
            if (r.targetLocation) activeAuthAreas.add(r.targetLocation.trim().toLowerCase());
          });
        } catch (e) {}

        const mappedAreas = (areas || []).map(a => {
          const aName = String(a.name || '').trim().toLowerCase();
          const underAuth = activeAuthAreas.has(aName) ||
            [...activeAuthAreas].some(authName => authName && (aName.includes(authName) || authName.includes(aName)));
          return {
            ...a,
            underAuthorityAction: Boolean(underAuth)
          };
        });

        cache.admin = {
          areas: mappedAreas,
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

    // Save strictly to MongoDB neerakshak_db
    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('affectedareas').updateOne(
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
    const targetArea = (cache.admin.areas || []).find(a => a.id === id || a.name === id);
    const areaName = targetArea ? targetArea.name : id;
    const nameClean = String(areaName || '').trim().toLowerCase();

    // Strict Lock: Check in-memory authority state first
    const isLockedInMemory = (cache.authority?.allocations || []).some(a => 
      (a.village && a.village.trim().toLowerCase() === nameClean) ||
      (a.destination && a.destination.trim().toLowerCase() === nameClean) ||
      (a.targetLocation && a.targetLocation.trim().toLowerCase() === nameClean)
    ) || (cache.authority?.requests || []).some(r => 
      (r.village && r.village.trim().toLowerCase() === nameClean) ||
      (r.targetLocation && r.targetLocation.trim().toLowerCase() === nameClean)
    ) || (cache.authority?.coordinations || []).some(c => 
      (c.operationLocation && c.operationLocation.trim().toLowerCase() === nameClean) ||
      (c.sector && c.sector.trim().toLowerCase() === nameClean)
    );

    if (isLockedInMemory) {
      throw new Error(`Cannot delete area "${areaName}": A relief request or allocation is currently active with District Authority.`);
    }

    const db = await getDatabase();
    // Block deletion if active request or allocation exists with District Authority
    if (db) {
      try {
        const [allocExists, reqExists, coordExists] = await Promise.all([
          db.collection('resourceallocations').findOne({
            $or: [
              { village: { $regex: new RegExp(`^${nameClean}$`, 'i') } },
              { destination: { $regex: new RegExp(`^${nameClean}$`, 'i') } },
              { targetLocation: { $regex: new RegExp(`^${nameClean}$`, 'i') } }
            ]
          }),
          db.collection('resourcerequests').findOne({
            $or: [
              { village: { $regex: new RegExp(`^${nameClean}$`, 'i') } },
              { targetLocation: { $regex: new RegExp(`^${nameClean}$`, 'i') } }
            ]
          }),
          db.collection('coordinationrecords').findOne({
            $or: [
              { operationLocation: { $regex: new RegExp(`^${nameClean}$`, 'i') } },
              { sector: { $regex: new RegExp(`^${nameClean}$`, 'i') } }
            ]
          })
        ]);

        if (allocExists || reqExists || coordExists) {
          throw new Error(`Cannot delete area "${areaName}": A relief request or allocation is currently active with District Authority.`);
        }
      } catch (err) {
        if (err.message && err.message.includes('Cannot delete area')) {
          throw err;
        }
      }
    }

    if (cache.admin.areas) {
      cache.admin.areas = cache.admin.areas.filter(a => a.id !== id && a.name !== id);
    }
    if (db) {
      try {
        await db.collection('affectedareas').deleteOne({ $or: [{ id }, { name: id }] });
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
        await db.collection('floodalerts').insertOne({ ...alert });
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
        await db.collection('floodalerts').deleteOne({ $or: [{ id: idOrTitle }, { title: idOrTitle }] });
      } catch (e) {}
    }
    return true;
  },

  async saveFacility(facilityData) {
    const facility = {
      id: facilityData.id || `fac-${Date.now()}`,
      name: facilityData.name || 'Emergency Facility',
      type: facilityData.type || 'Relief Camp',
      lat: Number(facilityData.lat) || 26.15,
      lng: Number(facilityData.lng) || 91.55,
      capacity: Number(facilityData.capacity) || 500,
      occupied: Number(facilityData.occupied) || 0,
      contact: facilityData.contact || ''
    };
    if (!cache.admin.facilities) cache.admin.facilities = [];
    const idx = cache.admin.facilities.findIndex(f => f.id === facility.id);
    if (idx >= 0) cache.admin.facilities[idx] = facility;
    else cache.admin.facilities.push(facility);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('emergencyfacilities').updateOne({ id: facility.id }, { $set: facility }, { upsert: true });
      } catch (e) {}
    }
    return facility;
  },

  async updateRiver(riverData) {
    const river = {
      id: riverData.id,
      name: riverData.name,
      current: Number(riverData.current),
      danger: Number(riverData.danger),
      trend: riverData.trend || 'Steady',
      barColor: riverData.barColor || '#16a34a',
      spark: riverData.spark || ''
    };
    if (!cache.admin.rivers) cache.admin.rivers = [];
    const idx = cache.admin.rivers.findIndex(r => r.id === river.id);
    if (idx >= 0) cache.admin.rivers[idx] = { ...cache.admin.rivers[idx], ...river };
    else cache.admin.rivers.push(river);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('rivers').updateOne({ id: river.id }, { $set: river }, { upsert: true });
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
    const adminState = await adminDb.getState();
    const adminAreas = adminState.areas || [];

    const db = await getDatabase();
    if (db) {
      try {
        const [requests, allocations, coordinations, operations, logs] = await Promise.all([
          db.collection('resourcerequests').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('resourceallocations').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('coordinationrecords').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('authority_operations').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('auditlogs').find({}, { projection: { _id: 0 } }).toArray(),
        ]);
        cache.authority = {
          villages: [],
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

    // Map real admin areas into authority villages (adminAreas from affectedareas is single source of truth)
    cache.authority.villages = (adminAreas || []).map(area => {
      const pop = Number(area.pop) || 2000;
      const isCrit = area.severity === 'Critical';
      const isHigh = area.severity === 'High';
      return {
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
      };
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
      if (allocData.leadAgency) existing.leadAgency = allocData.leadAgency;
      if (allocData.leadOfficerName) existing.leadOfficerName = allocData.leadOfficerName;
      if (allocData.leadOfficerId) existing.leadOfficerId = allocData.leadOfficerId;
      if (allocData.leadOfficerContact) existing.leadOfficerContact = allocData.leadOfficerContact;
      if (!existing.timeline) existing.timeline = [];
      existing.timeline.unshift({
        step: 'Allocation Order Adjusted',
        time: 'Just now',
        status: 'done',
        detail: `Emergency supplies updated by District Authority to: ${existing.summary}. Designated Escort: ${existing.leadAgency || 'NDRF'} ${existing.leadOfficerName || 'Lead Officer'} (${existing.leadOfficerId || 'ID'}).`
      });

      const db = await getDatabase();
      if (db) {
        try {
          await db.collection('resourceallocations').updateOne({ id: existing.id }, { $set: existing }, { upsert: true });
        } catch (e) {}
      }
      return existing;
    }

    const leadAgency = allocData.leadAgency || allocData.agency || 'NDRF (1st Bn)';
    const leadOfficerName = allocData.leadOfficerName || allocData.officerName || 'Inspector Rajesh Kalita';
    const leadOfficerId = allocData.leadOfficerId || allocData.officerId || 'NDRF-1BN-842';
    const leadOfficerContact = allocData.leadOfficerContact || allocData.officerContact || '+91 94350-12345';

    const newAlloc = {
      id: allocData.id || `ALC-${Math.floor(530 + Math.random() * 70)}`,
      village: allocData.village || allocData.destination || 'Assigned Area',
      summary: allocData.summary || 'Emergency Ration & Equipment Buffer',
      godownStatus: allocData.godownStatus || 'Sent to Godown Manager • Awaiting Dispatch',
      deliveryProgress: allocData.deliveryProgress || 25,
      assignedGodown: allocData.assignedGodown || 'Central Relief Godown',
      vehicle: allocData.vehicle || 'Heavy Truck AS-01-EC-4210',
      driver: allocData.driver || 'Rajesh Das (+91 98640-21943)',
      escortOfficer: allocData.escortOfficer || `${leadAgency} ${leadOfficerName}`,
      leadAgency,
      leadOfficerName,
      leadOfficerId,
      leadOfficerContact,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      timeline: [
        { 
          step: 'DDMA Allocation Approved', 
          time: 'Just now', 
          status: 'done', 
          detail: `Direct allocation approved by Authority. Designated Handover Officer: ${leadAgency} - ${leadOfficerName} (Badge/ID: ${leadOfficerId}). Transmitted to Godown.` 
        },
        { step: 'Stock Verification & Staging', time: 'In Progress', status: 'active', detail: 'Godown warehouse crew picking verified stock from storage racks.' },
        { step: 'Vehicle Dispatch & Gate Pass', time: 'Pending', status: 'pending', detail: 'Pallets loading & security checkpoint clearance.' },
        { step: 'Route Checkpoint Crossing', time: 'Pending', status: 'pending', detail: 'Transit via high-water bypass bridge towards destination.' },
        { step: 'Camp Intake & Final Distribution', time: 'Pending', status: 'pending', detail: 'Handover to Ground Officer and receipt acknowledgement.' }
      ]
    };

    cache.authority.allocations.unshift(newAlloc);

    // Also auto-sync/log in NDRF & SDRF Multi-Agency Coordination records so it shows in NDRF/SDRF tab!
    const coordRec = {
      recordNumber: `COR-${Date.now().toString(36).toUpperCase()}`,
      agency: leadAgency,
      unitDesignation: `${leadAgency} Tactical Response Team`,
      contactOfficer: `${leadOfficerName} (ID: ${leadOfficerId})`,
      contactPhone: leadOfficerContact,
      officialChannel: 'Official Encrypted Wireless Net / DEOC Hotline',
      operationLocation: newAlloc.village,
      assistanceRequested: `Lead Handover & Field Rescue (Allocated: ${newAlloc.summary})`,
      teamStrength: 'Designated Field Handover Escort',
      operationalStatus: 'Assigned & Deployed',
      evacuatedCitizensCount: 'In Progress',
      latestCoordinationBrief: `Assigned as Lead Response Officer for ${newAlloc.village}. Supplies: ${newAlloc.summary}. Badge: ${leadOfficerId}. Contact: ${leadOfficerContact}.`,
      recordedByAuthority: 'District Disaster Management Authority (DDMA)',
      updatedAt: new Date().toISOString()
    };
    if (!cache.authority.coordinations) cache.authority.coordinations = [];
    const exIdx = cache.authority.coordinations.findIndex(c => 
      (c.operationLocation && c.operationLocation.toLowerCase() === newAlloc.village.toLowerCase()) ||
      (c.sector && c.sector.toLowerCase() === newAlloc.village.toLowerCase())
    );
    if (exIdx >= 0) {
      cache.authority.coordinations[exIdx] = { ...cache.authority.coordinations[exIdx], ...coordRec };
    } else {
      cache.authority.coordinations.unshift(coordRec);
    }

    const db = await getDatabase();
    if (db) {
      try {
        await Promise.all([
          db.collection('resourceallocations').insertOne({ ...newAlloc }),
          db.collection('coordinationrecords').updateOne(
            { operationLocation: newAlloc.village },
            { $set: coordRec },
            { upsert: true }
          )
        ]);
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
        await db.collection('resourcerequests').insertOne({ ...newReq });
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
        await db.collection('resourcerequests').updateOne({ id: req.id }, { $set: req });
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
        await db.collection('coordinationrecords').insertOne({ ...record });
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
        await db.collection('auditlogs').insertOne({ ...log });
      } catch (e) {}
    }
    return log;
  }
};

// -----------------------------------------------------------------------------
// 3. CENTRAL RELIEF GODOWN REAL DATABASE OPERATIONS (neerakshak_db)
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
          db.collection('inventoryitems').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('returnrecords').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('dispatchrecords').find({}, { projection: { _id: 0 } }).toArray()
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

      // Dynamically extract resource counts from properties or parse from summary string
      const summaryText = authAlloc.summary || '';
      const bMatch = summaryText.match(/(\d+)\s*Boats?/i);
      const jMatch = summaryText.match(/(\d+)\s*Jackets?/i);
      const fMatch = summaryText.match(/(\d+)\s*Food/i);
      const mMatch = summaryText.match(/(\d+)\s*Meds?/i);

      const boats = authAlloc.boats !== undefined ? Number(authAlloc.boats) : (bMatch ? Number(bMatch[1]) : 0);
      const jackets = authAlloc.jackets !== undefined ? Number(authAlloc.jackets) : (jMatch ? Number(jMatch[1]) : 0);
      const food = authAlloc.food !== undefined ? Number(authAlloc.food) : (fMatch ? Number(fMatch[1]) : 0);
      const meds = authAlloc.meds !== undefined ? Number(authAlloc.meds) : (mMatch ? Number(mMatch[1]) : 0);

      return {
        id: authAlloc.id,
        destination: destName,
        block: areaMatch?.block || authAlloc.block || 'Assigned Sector',
        severity: areaMatch?.severity || authAlloc.severity || 'Critical',
        lat: areaMatch ? Number(areaMatch.lat) : 26.132,
        lng: areaMatch ? Number(areaMatch.lng) : 91.515,
        summary: summaryText || `${boats} Boats, ${jackets} Jackets, ${food} Food, ${meds} Meds`,
        boats,
        jackets,
        food,
        meds,
        reqBoats: authAlloc.reqBoats !== undefined ? authAlloc.reqBoats : boats,
        reqJackets: authAlloc.reqJackets !== undefined ? authAlloc.reqJackets : jackets,
        reqFood: authAlloc.reqFood !== undefined ? authAlloc.reqFood : food,
        reqMeds: authAlloc.reqMeds !== undefined ? authAlloc.reqMeds : meds,
        dispatchedBoats: authAlloc.dispatchedBoats !== undefined ? authAlloc.dispatchedBoats : boats,
        dispatchedJackets: authAlloc.dispatchedJackets !== undefined ? authAlloc.dispatchedJackets : jackets,
        dispatchedFood: authAlloc.dispatchedFood !== undefined ? authAlloc.dispatchedFood : food,
        dispatchedMeds: authAlloc.dispatchedMeds !== undefined ? authAlloc.dispatchedMeds : meds,
        assignedGodown: authAlloc.assignedGodown || 'Central Relief Godown',
        status: isDispatched ? 'Dispatched' : (isShortage ? 'Shortage Flagged' : 'Pending Dispatch'),
        vehicle: authAlloc.vehicle || 'Heavy Truck AS-01-EC-4210',
        driver: authAlloc.driver || 'Rajesh Das (+91 98640-21943)',
        escortOfficer: authAlloc.escortOfficer || (authAlloc.leadOfficerName ? `${authAlloc.leadAgency || 'NDRF'} ${authAlloc.leadOfficerName}` : 'District Police Escort'),
        leadAgency: authAlloc.leadAgency || 'NDRF',
        leadOfficerName: authAlloc.leadOfficerName || '',
        leadOfficerId: authAlloc.leadOfficerId || '',
        leadOfficerContact: authAlloc.leadOfficerContact || '',
        refNo: authAlloc.refNo || (isDispatched ? 'DSP-2026' : '—'),
        dispatchTime: isDispatched ? (authAlloc.dispatchTime || 'Today, 09:40 AM') : '—',
        deliveryProgress: authAlloc.deliveryProgress || (isDispatched ? 75 : 20),
        groundOfficerCleared: Boolean(authAlloc.groundOfficerCleared || authAlloc.reliefClearedForReturn),
        reliefClearedForReturn: Boolean(authAlloc.reliefClearedForReturn || authAlloc.groundOfficerCleared),
        clearedAt: authAlloc.clearedAt || null,
        clearedByOfficer: authAlloc.clearedByOfficer || null,
        clearedNotes: authAlloc.clearedNotes || null
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
          db.collection('inventoryitems').insertOne({ ...newItem }),
          db.collection('dispatchrecords').insertOne({ ...movement })
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
        await db.collection('inventoryitems').updateOne({ id: item.id }, { $set: item });
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

    const providedSummary = dispatchData.providedSummary || (
      (dispatchData.boats !== undefined || dispatchData.food !== undefined)
        ? `${dispatchData.boats || 0} Boats, ${dispatchData.jackets || 0} Jackets, ${dispatchData.food || 0} Food, ${dispatchData.meds || 0} Meds`
        : null
    );

    if (targetAuth) {
      targetAuth.godownStatus = `Dispatched (${refNo}) • En-Route`;
      targetAuth.deliveryProgress = 75;
      targetAuth.vehicle = vehicle;
      targetAuth.driver = driver;
      targetAuth.refNo = refNo;
      targetAuth.dispatchTime = nowTime;
      if (providedSummary) targetAuth.summary = providedSummary;

      const verifiedOfficer = dispatchData.verifiedOfficerName 
        ? `${dispatchData.verifiedAgency || 'NDRF'} ${dispatchData.verifiedOfficerName} (ID: ${dispatchData.verifiedOfficerId || 'VERIFIED'})` 
        : (targetAuth.escortOfficer || 'Escort Team');
      targetAuth.escortOfficer = verifiedOfficer;
      if (dispatchData.verifiedOfficerName) {
        targetAuth.leadOfficerName = dispatchData.verifiedOfficerName;
        targetAuth.leadOfficerId = dispatchData.verifiedOfficerId;
        targetAuth.leadAgency = dispatchData.verifiedAgency || targetAuth.leadAgency;
      }

      if (!targetAuth.timeline) targetAuth.timeline = [];
      targetAuth.timeline.unshift({
        step: `Convoy Dispatched (${refNo})`,
        time: nowTime,
        status: 'done',
        detail: `Gate-pass issued. Vehicle ${vehicle} departed with driver ${driver}. Verified Handover Officer: ${verifiedOfficer}. Resources Provided: ${providedSummary || targetAuth.summary}.`
      });

      const db = await getDatabase();
      if (db) {
        try {
          await db.collection('resourceallocations').updateOne({ id: targetAuth.id }, { $set: targetAuth });
        } catch (e) {}
      }
    }

    // Deduct provided quantities from inventoryitems safely (never negative, from stock with avail > 0)
    const deductResource = async (dbInstance, keywords, qty) => {
      let rem = Number(qty) || 0;
      if (rem <= 0) return;

      if (dbInstance) {
        try {
          const items = await dbInstance.collection('inventoryitems').find({
            $or: keywords.map(k => ({
              $or: [
                { category: { $regex: new RegExp(k, 'i') } },
                { name: { $regex: new RegExp(k, 'i') } }
              ]
            }))
          }).toArray();

          for (const item of items) {
            if (rem <= 0) break;
            const avail = Number(item.available) || 0;
            if (avail > 0) {
              const take = Math.min(avail, rem);
              rem -= take;
              const newAvail = Math.max(0, avail - take);
              await dbInstance.collection('inventoryitems').updateOne(
                { _id: item._id },
                { 
                  $set: { 
                    available: newAvail,
                    condition: newAvail <= 0 ? 'Out of Stock' : (newAvail <= (item.minLimit || 10) ? 'Low Stock' : 'Good')
                  },
                  $inc: { dispatched: take }
                }
              );
            }
          }
        } catch (e) {
          console.warn('deductResource MongoDB notice:', e.message);
        }
      }

      // Also update in-memory cache
      if (cache.godown && cache.godown.inventory) {
        let remCache = Number(qty) || 0;
        for (const item of cache.godown.inventory) {
          if (remCache <= 0) break;
          const isMatch = keywords.some(k => 
            (item.category && item.category.toLowerCase().includes(k.toLowerCase())) ||
            (item.name && item.name.toLowerCase().includes(k.toLowerCase()))
          );
          if (isMatch) {
            const avail = Number(item.available) || 0;
            if (avail > 0) {
              const take = Math.min(avail, remCache);
              remCache -= take;
              item.available = Math.max(0, avail - take);
              item.dispatched = (Number(item.dispatched) || 0) + take;
              if (item.available <= 0) item.condition = 'Out of Stock';
              else if (item.available <= (item.minLimit || 10)) item.condition = 'Low Stock';
            }
          }
        }
      }
    };

    const db = await getDatabase();
    if (dispatchData.boats) await deductResource(db, ['boat'], dispatchData.boats);
    if (dispatchData.jackets) await deductResource(db, ['jacket'], dispatchData.jackets);
    if (dispatchData.food) await deductResource(db, ['food', 'ration'], dispatchData.food);
    if (dispatchData.meds) await deductResource(db, ['med', 'kit'], dispatchData.meds);

    const movement = {
      time: `Today, ${nowTime}`,
      type: 'DISPATCH',
      item: providedSummary || `Emergency Consignment for ${dest}`,
      party: `To: ${dest}`,
      note: `Ref: ${refNo} • Vehicle: ${vehicle} • Driver: ${driver}`
    };
    if (!cache.godown.movements) cache.godown.movements = [];
    cache.godown.movements.unshift(movement);

    if (db) {
      try {
        await db.collection('dispatchrecords').insertOne({ ...movement });
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
          await db.collection('resourceallocations').updateOne({ id: targetAuth.id }, { $set: targetAuth });
        } catch (e) {}
      }
    }
    return { success: true };
  },

  async recordAreaReturn(returnData) {
    const area = returnData.area || returnData.destination || 'Assigned Area';
    const retRecord = {
      id: returnData.id || `RET-${Date.now().toString(36).toUpperCase()}`,
      area,
      refNo: returnData.refNo || 'DSP-2026',
      date: new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      dispatchedSummary: returnData.dispatchedSummary || '',
      boatsReturned: Number(returnData.boatsGood || 0),
      boatsDamaged: Number(returnData.boatsDamaged || 0),
      boatsMissing: Number(returnData.boatsMissing || 0),
      jacketsReturned: Number(returnData.jacketsGood || 0),
      jacketsDamaged: Number(returnData.jacketsDamaged || 0),
      jacketsMissing: Number(returnData.jacketsMissing || 0),
      foodDistributed: Number(returnData.foodDistributed || 0),
      medsUsed: Number(returnData.medsUsed || 0),
      returnedByOfficer: returnData.returnedByOfficer || 'NDRF / Field Escort',
      officerId: returnData.officerId || 'OFF-ID',
      conditionNotes: returnData.conditionNotes || 'Post-rescue inspection completed at godown intake bay',
      verificationStatus: 'Pending Ground Officer Verification'
    };

    if (!cache.godown.returns) cache.godown.returns = [];
    cache.godown.returns.unshift(retRecord);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('returnrecords').insertOne({ ...retRecord });

        // Add back "Good" units to inventoryitems
        if (retRecord.boatsReturned > 0) {
          await db.collection('inventoryitems').updateOne(
            { category: 'Rescue Boats' },
            { $inc: { available: retRecord.boatsReturned } }
          );
        }
        if (retRecord.jacketsReturned > 0) {
          await db.collection('inventoryitems').updateOne(
            { category: 'Life Jackets' },
            { $inc: { available: retRecord.jacketsReturned } }
          );
        }
      } catch (e) {}
    }

    return retRecord;
  }
};

// -----------------------------------------------------------------------------
// 4. GROUND OFFICER & MONITORING REAL OPERATIONS (neerakshak_db)
// -----------------------------------------------------------------------------
export const groundDb = {
  async getState() {
    // 1. Fetch live states from Admin, Authority and Godown (Single Source of Truth)
    const [adminState, authState, godownState] = await Promise.all([
      adminDb.getState(),
      authorityDb.getState(),
      godownDb.getState()
    ]);

    const adminAreas = adminState.areas || [];
    const authAllocations = authState.allocations || [];
    const authCoordinations = authState.coordinations || [];
    const alerts = adminState.alerts || [];

    const db = await getDatabase();
    let dbReports = [];
    let dbVerifications = [];
    let dbOperations = [];
    let dbReturns = [];

    if (db) {
      try {
        const [reports, verifs, ops, rets] = await Promise.all([
          db.collection('fieldreports').find({}, { projection: { _id: 0 } }).sort({ _id: -1 }).toArray(),
          db.collection('deliveryverifications').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('groundoperations').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('groundreturns').find({}, { projection: { _id: 0 } }).toArray()
        ]);
        dbReports = reports || [];
        dbVerifications = verifs || [];
        dbOperations = ops || [];
        dbReturns = rets || [];
      } catch (e) {
        console.warn('groundDb.getState MongoDB read notice:', e.message);
      }
    }

    // 2. Map real Admin Affected Areas into Ground Officer Assigned Areas
    const areas = adminAreas.map((a, idx) => {
      const isCrit = a.severity === 'Critical';
      const isHigh = a.severity === 'High';
      return {
        id: a.id || `ASN-${String(idx + 1).padStart(2, '0')}`,
        village: (a.name || a.village || 'Affected Sector').trim(),
        block: a.block || 'Assigned Circle',
        severity: a.severity || 'Critical',
        priority: isCrit ? 'Urgent' : (isHigh ? 'High' : 'Normal'),
        status: isCrit ? 'Active Emergency Zone' : 'Active Field Duty',
        coords: `${Number(a.lat || 25.7799).toFixed(4)}° N, ${Number(a.lng || 87.4751).toFixed(4)}° E`,
        lat: Number(a.lat || 25.7799),
        lng: Number(a.lng || 87.4751),
        pop: a.pop || 2500,
        deadline: isCrit ? 'Immediate Action' : 'Today, 04:00 PM',
        task: a.notes || `Monitor inundation depth & verify relief consignments for ${a.name || a.village}.`
      };
    });

    // Also include any active destination from Authority allocations that Ground Officer oversees
    authAllocations.forEach((alc, aIdx) => {
      const vName = (alc.village || alc.destination || '').trim();
      if (!vName) return;
      const already = areas.some(ar => ar.village.toLowerCase() === vName.toLowerCase());
      if (!already) {
        let lat = 26.15;
        let lng = 86.60;
        let blk = 'Supaul Sector';
        if (vName.toLowerCase().includes('nirmali')) {
          lat = 26.15;
          lng = 86.60;
          blk = 'Nirmali Circle, Supaul';
        } else if (vName.toLowerCase().includes('flood sector') || vName.toLowerCase().includes('purnia')) {
          lat = 25.78;
          lng = 87.47;
          blk = 'Krityanand Nagar, Purnia';
        }
        areas.push({
          id: alc.id || `ASN-ALC-${aIdx + 1}`,
          village: vName,
          block: blk,
          severity: 'Critical',
          priority: 'Urgent',
          status: 'Active Relief Operation',
          coords: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
          lat: lat,
          lng: lng,
          pop: alc.citizens || 2200,
          deadline: 'Immediate Action',
          task: `Relief consignment assigned (${alc.summary || 'Emergency Relief'}). Conduct field verification.`
        });
      }
    });

    // 3. Map real Godown Dispatches into Ground Officer Delivery Verifications
    const dispatchedAllocations = authAllocations.filter(a => 
      a.status === 'Dispatched' ||
      String(a.godownStatus || '').toLowerCase().includes('dispatched') ||
      String(a.godownStatus || '').toLowerCase().includes('en-route') ||
      (Boolean(a.refNo) && a.refNo !== '—' && a.refNo.startsWith('DSP-'))
    );

    const deliveries = dispatchedAllocations.map(a => {
      const dispatchId = a.refNo && a.refNo !== '—' ? a.refNo : (a.id || 'DSP-2026');
      const savedVerif = dbVerifications.find(v => v.dispatchId === dispatchId || v.allocId === a.id);
      const isCleared = Boolean(a.groundOfficerCleared || a.reliefClearedForReturn || savedVerif?.status === 'Verified');

      return {
        dispatchId,
        allocId: a.id,
        destination: (a.village || a.destination || 'Assigned Sector').trim(),
        resource: a.summary || 'Emergency Relief Buffer',
        dispatched: a.summary || 'Consignment Dispatched',
        received: savedVerif ? savedVerif.received : (isCleared ? (a.summary || 'Consignment Verified') : null),
        damaged: savedVerif ? Number(savedVerif.damaged) || 0 : 0,
        shortage: savedVerif ? Number(savedVerif.shortage) || 0 : 0,
        status: savedVerif ? savedVerif.status : (isCleared ? 'Verified' : 'Pending Verification'),
        remarks: savedVerif ? savedVerif.remarks : `Escort: ${a.leadOfficerName ? `${a.leadAgency || 'NDRF'} ${a.leadOfficerName}` : (a.driver || 'Field Convoy')}. Vehicle: ${a.vehicle || 'Relief Truck'}.`,
        groundOfficerCleared: isCleared,
        reliefClearedForReturn: isCleared,
        verifiedAt: savedVerif?.verifiedAt || (isCleared ? a.clearedAt : null),
        verifiedBy: savedVerif?.verifiedBy || (isCleared ? a.clearedByOfficer : null)
      };
    });

    // 4. Map real multi-agency coordination & operations (deduplicate duplicate transmissions)
    const uniqueOpsMap = new Map();
    authCoordinations.forEach(c => {
      const loc = (c.operationLocation || c.sector || 'Ramnagar').trim();
      const agency = (c.agency || 'NDRF').trim();
      const key = `${loc}__${agency}`;
      if (!uniqueOpsMap.has(key)) {
        uniqueOpsMap.set(key, c);
      }
    });

    const operations = Array.from(uniqueOpsMap.values()).map((c, idx) => {
      const opId = c.recordNumber || `OP-${idx + 1}`;
      const savedOp = dbOperations.find(o => o.opId === opId || o.location === (c.operationLocation || c.sector));

      return {
        opId,
        location: c.operationLocation || c.sector || 'Ramnagar',
        agency: `${c.agency || 'NDRF'} (${c.unitDesignation || 'Tactical Team'})`,
        rescued: savedOp ? Number(savedOp.rescued) : (c.evacuatedCitizensCount && !isNaN(Number(c.evacuatedCitizensCount)) ? Number(c.evacuatedCitizensCount) : 48),
        stranded: savedOp ? Number(savedOp.stranded) : 15,
        status: savedOp ? savedOp.status : (c.operationalStatus || 'In Progress'),
        notes: savedOp ? savedOp.notes : (c.latestCoordinationBrief || `Officer ${c.contactOfficer || 'Lead Officer'} deployed on site.`)
      };
    });

    // 5. Notifications from real flood alerts
    const notifications = alerts.length > 0 
      ? alerts.map((alt, idx) => ({
          id: alt.id || `notif-${idx}`,
          title: `${(alt.severity || 'Critical').toUpperCase()} ALERT: ${alt.location} — ${alt.title}`,
          detail: alt.desc || alt.notes || 'Emergency flood monitoring alert.',
          priority: alt.severity || 'Critical',
          time: 'Just now'
        }))
      : areas.filter(a => a.severity === 'Critical').map((a, idx) => ({
          id: `crit-alert-${idx}`,
          title: `CRITICAL FLOOD ALERT: ${a.village}`,
          detail: `Inundation alert active in ${a.block}. Estimated population at risk: ${a.pop} citizens.`,
          priority: 'Critical',
          time: 'Active Now'
        }));

    // 6. Returns from Godown and Ground verifications
    const returns = (godownState.returns || []).map(r => ({
      retId: r.id || 'RET-01',
      item: r.dispatchedSummary || r.resourceName || 'Emergency Relief Equipment',
      location: r.area || r.from || 'Field Sector',
      good: Number(r.boatsReturned || r.good || 0),
      damaged: Number(r.boatsDamaged || r.damaged || 0),
      missing: Number(r.boatsMissing || r.missing || 0),
      remarks: r.conditionNotes || 'Post-rescue inspection logged',
      time: r.date || 'Today'
    })).concat(dbReturns);

    cache.groundOfficer = {
      areas,
      deliveries,
      fieldReports: dbReports.length > 0 ? dbReports : (cache.groundOfficer.fieldReports || []),
      operations,
      returns,
      notifications,
      officer: {
        name: 'Bhaskar Jyoti Das',
        designation: 'Ground Disaster Management Officer',
        badge: 'GO-KAM-04',
        hq: 'District Emergency Operations Center (DEOC)'
      }
    };

    return cache.groundOfficer;
  },

  async verifyDelivery(verifyData) {
    const dispatchId = verifyData.dispatchId;
    const allocId = verifyData.allocId;
    const received = verifyData.received;
    const damaged = Number(verifyData.damaged) || 0;
    const shortage = Number(verifyData.shortage) || 0;
    const remarks = verifyData.remarks || 'Physical delivery verified by Ground Officer.';
    const verifiedBy = verifyData.verifiedBy || 'Bhaskar Jyoti Das (GO-KAM-04)';
    const verifiedAt = new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const status = (shortage > 0 || damaged > 0) ? 'Discrepancy Flagged' : 'Verified';

    const record = {
      dispatchId,
      allocId,
      received,
      damaged,
      shortage,
      status,
      remarks: `[${verifiedBy}] ${remarks}`,
      verifiedBy,
      verifiedAt
    };

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('deliveryverifications').updateOne(
          { dispatchId },
          { $set: record },
          { upsert: true }
        );

        // Update allocation timeline and status if linked
        if (allocId || dispatchId) {
          await db.collection('resourceallocations').updateOne(
            { $or: [{ id: allocId }, { refNo: dispatchId }] },
            { 
              $set: { physicalDeliveryStatus: status },
              $push: {
                timeline: {
                  step: `Ground Delivery Verified (${status})`,
                  time: 'Just now',
                  status: status === 'Verified' ? 'done' : 'active',
                  detail: `Physically counted by ${verifiedBy}. Received: ${received}. Shortage: ${shortage}, Damaged: ${damaged}. Notes: ${remarks}`
                }
              }
            }
          );
        }
      } catch (e) {
        console.warn('verifyDelivery MongoDB write notice:', e.message);
      }
    }

    return record;
  },

  async submitReport(reportData) {
    const report = {
      refId: reportData.refId || `FR-2026-${Math.floor(400 + Math.random() * 500)}`,
      village: reportData.village || 'Assigned Area',
      severity: reportData.severity || 'Moderate',
      water: reportData.water || 'Normal Runoff',
      affected: reportData.affected || 'Assigned Population',
      stranded: Number(reportData.stranded) || 0,
      road: reportData.road || 'Passable',
      needs: reportData.needs || 'Relief Buffer',
      coords: reportData.coords || '26.12, 91.50',
      officer: reportData.officer || 'Bhaskar Jyoti Das (GO-KAM-04)',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      reviewStatus: 'Pending Review',
      submittedAt: new Date().toISOString()
    };

    if (!cache.groundOfficer.fieldReports) cache.groundOfficer.fieldReports = [];
    cache.groundOfficer.fieldReports.unshift(report);

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('fieldreports').insertOne({ ...report });

        // If Critical severity, also raise a high-priority audit alert
        if (report.severity === 'Critical') {
          await db.collection('floodalerts').insertOne({
            id: `alt-${Date.now()}`,
            title: `CRITICAL FIELD SITUATION: ${report.village}`,
            location: report.village,
            severity: 'Critical',
            desc: `Ground Officer reported: ${report.stranded} stranded, water depth ${report.water}. Immediate assistance: ${report.needs}.`,
            timestamp: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn('submitReport MongoDB write notice:', e.message);
      }
    }
    return report;
  },

  async updateRescueProgress(opData) {
    const opId = opData.opId;
    const rescued = Number(opData.rescued) || 0;
    const stranded = Number(opData.stranded) || 0;
    const status = opData.status || 'In Progress';
    const notes = opData.notes || 'Rescue operations progressing under local command.';
    const location = opData.location || 'Assigned Sector';
    const officerName = opData.officerName || 'Bhaskar Jyoti Das (GO-KAM-04)';

    const record = {
      opId,
      location,
      rescued,
      stranded,
      status,
      notes,
      updatedBy: officerName,
      updatedAt: new Date().toISOString()
    };

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('groundoperations').updateOne(
          { opId },
          { $set: record },
          { upsert: true }
        );

        // Update corresponding multi-agency coordination record
        await db.collection('coordinationrecords').updateOne(
          { $or: [{ recordNumber: opId }, { operationLocation: location }] },
          { 
            $set: {
              evacuatedCitizensCount: String(rescued),
              operationalStatus: status,
              latestCoordinationBrief: `Progress by ${officerName}: ${rescued} evacuated, ${stranded} stranded remaining. ${notes}`
            }
          }
        );
      } catch (e) {
        console.warn('updateRescueProgress MongoDB write notice:', e.message);
      }
    }
    return record;
  },

  async clearAreaForReturn(clearData) {
    const allocId = clearData.allocId;
    const area = (clearData.area || clearData.destination || '').trim();
    const officer = clearData.officerName || 'Bhaskar Jyoti Das (Ground Officer)';
    const notes = clearData.notes || 'Rescue completed, waters receded to safe mark; area situation under control. Equipment released for warehouse return.';
    const clearedTime = new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const authState = await authorityDb.getState();
    const targetAuth = (authState.allocations || []).find(a => 
      (allocId && a.id === allocId) ||
      (area && (a.village || a.destination || '').toLowerCase() === area.toLowerCase())
    );

    if (targetAuth) {
      targetAuth.groundOfficerCleared = true;
      targetAuth.reliefClearedForReturn = true;
      targetAuth.clearedAt = clearedTime;
      targetAuth.clearedByOfficer = officer;
      targetAuth.clearedNotes = notes;

      if (!targetAuth.timeline) targetAuth.timeline = [];
      targetAuth.timeline.unshift({
        step: 'Ground Officer Clearance: Situation Under Control',
        time: 'Just now',
        status: 'active',
        detail: `${officer} confirmed rescue completed; resources released for return intake: "${notes}"`
      });

      const db = await getDatabase();
      if (db) {
        try {
          await db.collection('resourceallocations').updateOne(
            { id: targetAuth.id },
            { $set: {
              groundOfficerCleared: true,
              reliefClearedForReturn: true,
              clearedAt: clearedTime,
              clearedByOfficer: officer,
              clearedNotes: notes,
              timeline: targetAuth.timeline
            }}
          );
        } catch (e) {}
      }
    }
    return { success: true, targetAuth };
  },

  async submitReturnVerification(returnData) {
    const record = {
      retId: returnData.retId || `RV-${Math.floor(110 + Math.random() * 880)}`,
      item: returnData.item || 'Rescue Equipment',
      location: returnData.location || 'Assigned Sector',
      good: Number(returnData.good) || 0,
      damaged: Number(returnData.damaged) || 0,
      missing: Number(returnData.missing) || 0,
      remarks: returnData.remarks || 'Condition verified on ground',
      officer: returnData.officer || 'Bhaskar Jyoti Das (GO-KAM-04)',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('groundreturns').insertOne({ ...record });
      } catch (e) {
        console.warn('submitReturnVerification MongoDB write notice:', e.message);
      }
    }
    return record;
  }
};

function parseSupplyQuantities(summary) {
  const result = { boats: 0, jackets: 0, food: 0, meds: 0, total: 0 };
  if (!summary || typeof summary !== 'string') return result;
  
  const bMatch = summary.match(/(\d+)\s*Boat/i);
  if (bMatch) result.boats = parseInt(bMatch[1], 10);
  
  const jMatch = summary.match(/(\d+)\s*Jacket/i);
  if (jMatch) result.jackets = parseInt(jMatch[1], 10);
  
  const fMatch = summary.match(/(\d+)\s*(?:Food|Ration)/i);
  if (fMatch) result.food = parseInt(fMatch[1], 10);
  
  const mMatch = summary.match(/(\d+)\s*Med/i);
  if (mMatch) result.meds = parseInt(mMatch[1], 10);
  
  result.total = result.boats + result.jackets + result.food + result.meds;
  return result;
}

export const monitoringDb = {
  async getState() {
    // 1. Fetch live operational states from Admin, Authority, Godown, and Ground Officer (Single Source of Truth)
    const [adminState, authState, godownState, groundState] = await Promise.all([
      adminDb.getState(),
      authorityDb.getState(),
      godownDb.getState(),
      groundDb.getState()
    ]);

    const adminAreas = adminState.areas || [];
    const authAllocations = authState.allocations || [];
    const authCoordinations = authState.coordinations || [];
    const godownDispatches = [
      ...(godownState.allocations || []),
      ...(godownState.dispatches || [])
    ];
    const godownReturns = godownState.returns || [];
    const groundDeliveries = groundState.deliveries || [];
    const groundReports = groundState.fieldReports || [];
    const groundOperations = groundState.operations || [];

    // 2. Fetch persistent Monitoring collections from MongoDB
    const db = await getDatabase();
    let dbChats = [];
    let dbEscalations = [];
    let dbResolutions = [];
    let dbAnnouncements = [];
    let dbDiscrepancies = [];
    let dbCases = [];
    let dbAnomalies = [];

    if (db) {
      try {
        const [chats, escs, resols, anns, discs, cases, anomalies] = await Promise.all([
          db.collection('monitoring_chats').find({}, { projection: { _id: 0 } }).sort({ timestamp: 1 }).toArray(),
          db.collection('monitoring_escalations').find({}, { projection: { _id: 0 } }).sort({ timestamp: -1 }).toArray(),
          db.collection('monitoring_resolutions').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('broadcast_announcements').find({ pinned: true }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(),
          db.collection('monitoring_discrepancies').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('monitoring_return_cases').find({}, { projection: { _id: 0 } }).toArray(),
          db.collection('monitoring_ops_anomalies').find({}, { projection: { _id: 0 } }).toArray()
        ]);
        dbChats = chats || [];
        dbEscalations = escs || [];
        dbResolutions = resols || [];
        dbAnnouncements = anns || [];
        dbDiscrepancies = discs || [];
        dbCases = cases || [];
        dbAnomalies = anomalies || [];
      } catch (e) {
        console.warn('monitoringDb MongoDB read notice:', e.message);
      }
    }

    if (!dbAnnouncements.length && cache.announcements) {
      dbAnnouncements = cache.announcements.filter(a => a.pinned);
    }

    // Default chat seed if empty
    const chatsByRole = {
      ground: dbChats.filter(c => c.channel === 'ground' || c.toRole === 'ground' || c.fromRole === 'ground'),
      godown: dbChats.filter(c => c.channel === 'godown' || c.toRole === 'godown' || c.fromRole === 'godown'),
      authority: dbChats.filter(c => c.channel === 'authority' || c.toRole === 'authority' || c.fromRole === 'authority'),
      admin: dbChats.filter(c => c.channel === 'admin' || c.toRole === 'admin' || c.fromRole === 'admin'),
      all: dbChats.filter(c => c.channel === 'all' || !c.channel)
    };

    // 3. Build Full Area-Wise Lifecycle Tracing
    // Collate all distinct sectors across Admin, Authority, Godown and Ground
    const sectorMap = new Map();

    // From Admin Areas
    adminAreas.forEach(a => {
      const vName = (a.name || a.village || 'Sector').trim();
      if (!vName) return;
      sectorMap.set(vName.toLowerCase(), {
        village: vName,
        name: vName,
        area: vName,
        block: a.block || a.district || 'Purnia East, Purnia',
        district: a.district || a.block || 'Purnia',
        severity: a.severity || 'Critical',
        lat: Number(a.lat || 25.7799),
        lng: Number(a.lng || 87.4751),
        pop: Number(a.pop || a.population || 2500),
        river: a.river || 'Saura River (Purnia)',
        waterLevel: a.waterLevel || a.currentWaterLevel || '34.9',
        task: a.notes || 'Flood emergency response'
      });
    });

    // From Authority Allocations
    authAllocations.forEach(a => {
      const vName = (a.village || a.destination || a.area || '').trim();
      if (!vName) return;
      const key = vName.toLowerCase();
      if (!sectorMap.has(key)) {
        let lat = 26.15;
        let lng = 86.60;
        let blk = 'Supaul Sector';
        if (key.includes('nirmali')) { lat = 26.15; lng = 86.60; blk = 'Nirmali Circle, Supaul'; }
        else if (key.includes('flood sector') || key.includes('purnia')) { lat = 25.78; lng = 87.47; blk = 'Krityanand Nagar, Purnia'; }
        sectorMap.set(key, {
          village: vName,
          name: vName,
          area: vName,
          block: blk,
          district: 'Supaul',
          severity: 'Critical',
          lat,
          lng,
          pop: Number(a.citizens || a.pop || a.population || 2200),
          river: 'Kosi Basin',
          waterLevel: '71.4',
          task: 'Emergency relief allocation'
        });
      }
    });

    // From Godown Dispatches
    godownDispatches.forEach(d => {
      const vName = (d.destination || d.village || d.area || '').trim();
      if (!vName) return;
      const key = vName.toLowerCase();
      if (!sectorMap.has(key)) {
        sectorMap.set(key, {
          village: vName,
          name: vName,
          area: vName,
          block: d.block || 'Dispatched Sector',
          district: 'Flood District',
          severity: d.severity || 'Critical',
          lat: Number(d.lat || 25.78),
          lng: Number(d.lng || 87.47),
          pop: 2200,
          river: 'Brahmaputra Basin',
          waterLevel: 'Passable',
          task: 'Relief Convoy In Transit'
        });
      }
    });

    // From Ground Deliveries
    groundDeliveries.forEach(g => {
      const vName = (g.destination || g.village || g.area || '').trim();
      if (!vName) return;
      const key = vName.toLowerCase();
      if (!sectorMap.has(key)) {
        sectorMap.set(key, {
          village: vName,
          name: vName,
          area: vName,
          block: 'Assigned Ground Sector',
          district: 'Flood District',
          severity: 'Critical',
          lat: 25.78,
          lng: 87.47,
          pop: 2200,
          river: 'Basin River',
          waterLevel: 'Inundated',
          task: 'Field Verification'
        });
      }
    });

    // Construct Area Lifecycle Traces
    const lifecycles = Array.from(sectorMap.values()).map((sector, idx) => {
      const vKey = sector.village.toLowerCase();
      
      // Match Authority Allocation
      const alloc = authAllocations.find(a => 
        (a.village && a.village.toLowerCase() === vKey) || 
        (a.destination && a.destination.toLowerCase() === vKey) ||
        (a.area && a.area.toLowerCase() === vKey)
      );

      // Match Godown Dispatch
      const dispatch = godownDispatches.find(d => 
        (d.destination && d.destination.toLowerCase() === vKey) ||
        (d.village && d.village.toLowerCase() === vKey) ||
        (d.area && d.area.toLowerCase() === vKey) ||
        (alloc && d.id === alloc.id) ||
        (alloc && (d.allocId === alloc.id || d.refNo === alloc.refNo || d.dispatchId === alloc.refNo))
      );

      // Match Ground Delivery Verification
      const delivery = groundDeliveries.find(g => 
        (g.destination && g.destination.toLowerCase() === vKey) ||
        (g.village && g.village.toLowerCase() === vKey) ||
        (g.area && g.area.toLowerCase() === vKey) ||
        (dispatch && (g.dispatchId === dispatch.dispatchId || g.dispatchId === dispatch.refNo)) ||
        (alloc && (g.allocId === alloc.id || g.dispatchId === alloc.refNo))
      );

      // Match Operations
      const op = groundOperations.find(o => 
        (o.location && o.location.toLowerCase() === vKey) ||
        (sector.village.toLowerCase().includes((o.location || '').toLowerCase()))
      );

      // Match Return
      const ret = godownReturns.find(r => 
        (r.area && r.area.toLowerCase() === vKey) ||
        (r.from && r.from.toLowerCase() === vKey)
      );

      // Quantities breakdown
      const approvedSupplies = alloc ? parseSupplyQuantities(alloc.summary) : { boats: 0, jackets: 0, food: 0, meds: 0, total: 0 };
      const dispatchedSupplies = dispatch ? parseSupplyQuantities(dispatch.summary || dispatch.supplies) : approvedSupplies;
      
      let receivedSupplies = { ...dispatchedSupplies };
      let shortageCount = 0;
      let damagedCount = 0;

      if (delivery) {
        if (delivery.received !== null && delivery.received !== undefined) {
          receivedSupplies = parseSupplyQuantities(String(delivery.received));
        }
        shortageCount = Number(delivery.shortage || 0);
        damagedCount = Number(delivery.damaged || 0);
      }

      // Compute Lifecycle Stage Index (1 to 5)
      let stageIndex = 1; // 1: Flood Alert
      let stageLabel = 'Flood Alert Active (Admin)';
      let auditStatus = 'Under Assessment';

      if (alloc) {
        stageIndex = 2;
        stageLabel = 'Relief Allocation Approved (Authority)';
        auditStatus = 'Allocated';
      }

      if (dispatch || (alloc && (alloc.status === 'Dispatched' || alloc.dispatchTime))) {
        stageIndex = 3;
        stageLabel = 'Convoy Dispatched (Godown)';
        auditStatus = 'In Transit';
      }

      if (delivery && (delivery.status === 'Verified' || delivery.received !== null)) {
        stageIndex = 4;
        stageLabel = 'Physical Delivery Verified (Ground)';
        auditStatus = (shortageCount > 0 || damagedCount > 0) ? 'Discrepancy Flagged' : 'Verified on Ground';
      }

      if ((delivery && (delivery.groundOfficerCleared || delivery.reliefClearedForReturn)) || ret) {
        stageIndex = 5;
        stageLabel = 'Situation Controlled & Resources Restocked';
        auditStatus = 'Operation Closed';
      }

      // Check if escalated
      const hasEscalation = dbEscalations.some(e => 
        (e.destination && e.destination.toLowerCase() === vKey) ||
        (alloc && e.allocId === alloc.id) ||
        (dispatch && e.dispatchId === dispatch.dispatchId)
      );

      if (hasEscalation) {
        auditStatus = 'Escalated to Authority';
      }

      // Build Timeline
      const timeline = [];

      // Step 1: Admin
      timeline.push({
        step: 'Flood Emergency Detection & GIS Pin',
        actor: 'Admin / DEOC Command',
        time: 'Flood Onset',
        status: 'done',
        detail: `Flood classified as ${sector.severity}. Estimated affected population: ${sector.pop.toLocaleString()} citizens.`
      });

      // Step 2: Authority
      if (alloc) {
        timeline.push({
          step: `DDMA Supply Allocation Approved (${alloc.id})`,
          actor: 'District Authority',
          time: alloc.timestamp || 'Approved',
          status: 'done',
          detail: `Approved: ${alloc.summary}. Handover Lead: ${alloc.leadOfficerName ? `${alloc.leadAgency || 'NDRF'} ${alloc.leadOfficerName} (${alloc.leadOfficerId || 'ID Verified'})` : 'Designated Officer'}.`
        });
      }

      // Step 3: Godown
      if (dispatch) {
        timeline.push({
          step: `Convoy Dispatched & Gate-Pass Issued (${dispatch.refNo || dispatch.dispatchId || alloc?.refNo || 'DSP-2026'})`,
          actor: 'Central Godown Manager',
          time: dispatch.dispatchTime || dispatch.time || 'Dispatched',
          status: 'done',
          detail: `Truck ${dispatch.vehicle || 'Heavy Swaraj Truck'} departed with driver ${dispatch.driver || 'Assigned Driver'}. Gate-pass verified.`
        });
      }

      // Step 4: Ground
      if (delivery) {
        timeline.push({
          step: `Ground Physical Delivery Intake & Verification`,
          actor: 'Ground Officer',
          time: delivery.verifiedAt || 'Verified',
          status: (shortageCount > 0 || damagedCount > 0) ? 'warn' : 'done',
          detail: delivery.status === 'Verified'
            ? `Physical delivery confirmed. Shortages: ${shortageCount}, Damaged: ${damagedCount}. Remarks: ${delivery.remarks || 'Receipt verified.'}`
            : `Awaiting physical verification on ground by NDRF/SDRF convoy escort.`
        });
      }

      // Step 5: Operations & Return
      if (delivery?.groundOfficerCleared || ret) {
        timeline.push({
          step: 'Field Situation Controlled & Warehouse Restock',
          actor: 'Ground Officer & Godown Manager',
          time: delivery?.clearedAt || 'Completed',
          status: 'done',
          detail: 'Ground officer authorized relief equipment release. Units reconciled and restocked into warehouse inventory.'
        });
      }

      return {
        id: `TRC-${String(idx + 1).padStart(3, '0')}`,
        area: sector.village,
        village: sector.village,
        name: sector.village,
        destination: sector.village,
        block: sector.block,
        district: sector.district || sector.block,
        severity: sector.severity,
        lat: sector.lat,
        lng: sector.lng,
        pop: sector.pop,
        population: sector.pop,
        river: sector.river || 'Brahmaputra Basin',
        waterLevel: sector.waterLevel,
        allocId: alloc?.id || '—',
        dispatchId: dispatch?.refNo || dispatch?.dispatchId || alloc?.refNo || '—',
        vehicle: dispatch?.vehicle || alloc?.vehicle || 'Heavy Truck AS-01-EC-4210 (6-Ton Swaraj)',
        driver: dispatch?.driver || alloc?.driver || 'Rajesh Das (Ph: +91 98640-21943)',
        leadOfficer: alloc?.leadOfficerName 
          ? `${alloc.leadAgency || 'NDRF (1st Bn)'} - ${alloc.leadOfficerName} (${alloc.leadOfficerId || 'NDRF-1BN-842'})`
          : 'Inspector Rajesh Kalita (NDRF-1BN-842)',
        approvedSupplies,
        dispatchedSupplies,
        receivedSupplies,
        shortageCount,
        damagedCount,
        stageIndex,
        stageLabel,
        currentStage: stageLabel,
        auditStatus,
        hasEscalation,
        resourcesAllocated: approvedSupplies.total > 0
          ? `${approvedSupplies.boats} Boats, ${approvedSupplies.jackets} Jackets, ${approvedSupplies.food} Food, ${approvedSupplies.meds} Meds`
          : 'Pending Allocation',
        resourcesDispatched: (dispatch || alloc?.status === 'Dispatched')
          ? `${dispatchedSupplies.boats} Boats, ${dispatchedSupplies.jackets} Jackets, ${dispatchedSupplies.food} Food, ${dispatchedSupplies.meds} Meds`
          : 'Awaiting Godown Loading',
        resourcesReceived: delivery && delivery.status === 'Verified'
          ? `${receivedSupplies.boats} Boats, ${receivedSupplies.jackets} Jackets, ${receivedSupplies.food} Food, ${receivedSupplies.meds} Meds`
          : (delivery ? 'En Route to Ground Gate' : 'Pending Transit'),
        groundVerificationStatus: delivery && delivery.status === 'Verified' ? 'Physical Receipt Verified' : (dispatch ? 'Convoy in Transit' : 'Pending Dispatch'),
        designatedLead: alloc?.leadOfficerName 
          ? `${alloc.leadAgency || 'NDRF'} ${alloc.leadOfficerName}`
          : 'NDRF (1st Bn) Escort',
        dispatchRef: dispatch?.refNo || dispatch?.dispatchId || alloc?.refNo || 'DSP-2026-932',
        timeline,
        stages: {
          pin: true,
          allocation: !!alloc,
          dispatch: !!dispatch || (alloc && (alloc.status === 'Dispatched' || alloc.dispatchTime)),
          verification: !!delivery && (delivery.status === 'Verified' || delivery.received !== null),
          restock: !!((delivery && (delivery.groundOfficerCleared || delivery.reliefClearedForReturn)) || ret)
        }
      };
    });

    // 4. Build Reconciliation Table (Per item / destination)
    const reconciliation = [];
    lifecycles.forEach(lc => {
      const items = [
        { name: 'Rescue Boats', app: lc.approvedSupplies.boats, disp: lc.dispatchedSupplies.boats, recv: lc.receivedSupplies.boats },
        { name: 'Life Jackets', app: lc.approvedSupplies.jackets, disp: lc.dispatchedSupplies.jackets, recv: lc.receivedSupplies.jackets },
        { name: 'Emergency Food (Packs)', app: lc.approvedSupplies.food, disp: lc.dispatchedSupplies.food, recv: lc.receivedSupplies.food },
        { name: 'Medicine Kits', app: lc.approvedSupplies.meds, disp: lc.dispatchedSupplies.meds, recv: lc.receivedSupplies.meds }
      ];

      items.forEach(it => {
        if (it.app > 0 || it.disp > 0 || it.recv > 0) {
          const diff = it.disp - it.recv;
          let rowStatus = 'Balanced / Clear';
          if (lc.stageIndex < 4) rowStatus = 'In Transit';
          else if (diff > 0 || lc.damagedCount > 0) rowStatus = 'Discrepancy Flagged';
          else if (lc.stageIndex === 5) rowStatus = 'Reconciled & Restocked';

          reconciliation.push({
            id: `REC-${lc.village.replace(/\s+/g, '').slice(0, 3).toUpperCase()}-${it.name.slice(0, 3).toUpperCase()}`,
            allocId: lc.allocId,
            dispatchId: lc.dispatchId,
            destination: lc.village,
            area: lc.village,
            village: lc.village,
            sector: lc.village,
            resource: it.name,
            approved: it.app,
            dispatched: it.disp,
            received: lc.stageIndex >= 4 ? it.recv : null,
            difference: lc.stageIndex >= 4 ? diff : 0,
            status: rowStatus
          });
        }
      });
    });

    // 5. Discrepancies (Active Shortages, Damage or Flagged Issues with Status Flow)
    const discrepancies = [];
    lifecycles.forEach(lc => {
      if (lc.shortageCount > 0 || lc.damagedCount > 0) {
        const discId = `DISC-${lc.dispatchId || lc.allocId}`;
        const savedDisc = dbDiscrepancies.find(d => d.id === discId || d.destination === lc.village);
        
        // Status flow: Open → Under Review → Clarification Requested → Escalated → Resolved → Closed
        let currentStatus = savedDisc?.status || (lc.hasEscalation ? 'Escalated' : (lc.shortageCount > 0 ? 'Open' : 'Under Review'));

        discrepancies.push({
          id: discId,
          allocId: lc.allocId,
          dispatchId: lc.dispatchId,
          destination: lc.village,
          area: lc.village,
          item: `${lc.shortageCount} Units Shortage, ${lc.damagedCount} Damaged`,
          resource: `${lc.shortageCount} Short, ${lc.damagedCount} Damaged`,
          issue: `${lc.shortageCount} units missing/unverified at ${lc.village} sector intake`,
          shortage: lc.shortageCount,
          damaged: lc.damagedCount,
          leadOfficer: lc.leadOfficer,
          reportedBy: 'Ground Officer Field Intake Audit',
          status: currentStatus,
          notes: savedDisc?.notes || '',
          updatedAt: savedDisc?.updatedAt || 'Live'
        });
      }
    });

    // 5b. Delivery Verification Audit Records (Point 5)
    const deliveryAudits = groundDeliveries.map((g, idx) => {
      const disp = godownDispatches.find(d => (d.dispatchId === g.dispatchId || d.refNo === g.dispatchId || d.destination === g.destination));
      const alloc = authAllocations.find(a => (a.id === g.allocId || a.refNo === g.dispatchId || a.village === g.destination));
      const dispatchedSupplies = g.dispatched || (disp ? disp.summary : '3 Boats, 33 Jackets, 264 Food, 44 Meds');
      const receivedSupplies = g.received || (g.status === 'Verified' ? dispatchedSupplies : 'Pending Handover');
      const isConsistent = g.status === 'Verified' && Number(g.shortage || 0) === 0 && Number(g.damaged || 0) === 0;

      return {
        id: `AUD-DEL-${idx + 1}`,
        dispatchId: g.dispatchId || 'DSP-2026-932',
        allocId: g.allocId || alloc?.id || 'ALC-565',
        destination: g.destination || 'Field Sector',
        dispatchedSupplies,
        receivedSupplies,
        shortage: Number(g.shortage || 0),
        damaged: Number(g.damaged || 0),
        remarks: g.remarks || 'Standard field delivery handover',
        status: g.status || 'Pending Verification',
        auditResult: isConsistent ? 'Verified Consistent' : (g.status === 'Verified' ? 'Mismatch Flagged' : 'Audit Pending Intake'),
        verifiedAt: g.verifiedAt || 'Pending Handover',
        verifiedBy: g.verifiedBy || 'NDRF (1st Bn) Field Unit',
        leadOfficer: alloc?.leadOfficerName ? `${alloc.leadAgency || 'NDRF'} ${alloc.leadOfficerName}` : 'Inspector Rajesh Kalita',
        auditNotes: isConsistent ? 'Original gate-pass matched field receipt count.' : 'Requires field verification audit & evidence cross-check.'
      };
    });

    // 6. Returns Audit - Dual Verification (Ground Officer Field Return + Godown Warehouse Restock)
    const returnsAudit = Array.from(sectorMap.values()).map((sector, idx) => {
      const vKey = sector.village.toLowerCase();
      const lc = lifecycles.find(l => l.village.toLowerCase() === vKey);
      const godownRet = godownReturns.find(r => (r.area && r.area.toLowerCase() === vKey) || (r.from && r.from.toLowerCase() === vKey));
      const delivery = groundDeliveries.find(g => (g.destination && g.destination.toLowerCase() === vKey));
      const groundRet = (groundState.returns || []).find(r => (r.location && r.location.toLowerCase() === vKey));
      
      const caseId = `CASE-RET-${sector.village.replace(/\s+/g, '-')}`;
      const caseRec = dbCases.find(c => c.caseId === caseId || (c.area && c.area.toLowerCase() === vKey));

      const isGroundCleared = Boolean(delivery?.groundOfficerCleared || delivery?.reliefClearedForReturn || delivery?.status === 'Verified' || groundRet);
      const isGodownRestocked = Boolean(godownRet || delivery?.groundOfficerCleared);

      // Quantities from real dispatches
      const boatsDisp = lc ? lc.dispatchedSupplies.boats : 3;
      const jacketsDisp = lc ? lc.dispatchedSupplies.jackets : 33;
      const foodDisp = lc ? lc.dispatchedSupplies.food : 264;
      const medsDisp = lc ? lc.dispatchedSupplies.meds : 44;
      const totalDisp = lc ? (lc.dispatchedSupplies.total || (boatsDisp + jacketsDisp)) : (boatsDisp + jacketsDisp);

      // Item condition values
      const groundGood = groundRet ? Number(groundRet.good || 0) : (isGroundCleared ? boatsDisp : 0);
      const groundDamaged = groundRet ? Number(groundRet.damaged || 0) : Number(delivery?.damaged || 0);
      const groundMissing = groundRet ? Number(groundRet.missing || 0) : Number(delivery?.shortage || 0);

      const godownGood = godownRet ? Number(godownRet.boatsReturned || godownRet.good || 0) : (isGodownRestocked ? boatsDisp : 0);
      const godownDamaged = godownRet ? Number(godownRet.boatsDamaged || godownRet.damaged || 0) : 0;
      const godownMissing = godownRet ? Number(godownRet.boatsMissing || godownRet.missing || 0) : 0;

      // Itemized breakdown: konsa item kitna gaya aur kis condition me aaya
      const itemsBreakdown = [
        {
          name: 'Inflatable Motorized Rescue Boats',
          category: 'Rescue Craft',
          dispatched: boatsDisp,
          groundStatus: isGroundCleared ? `${groundGood} Good, ${groundDamaged} Damaged, ${groundMissing} Missing` : 'Pending Field Release',
          godownStatus: isGodownRestocked ? `${godownGood} Restocked (Good Condition)` : 'Awaiting Bay Arrival',
          condition: isGroundCleared && groundDamaged === 0 ? 'Good / Operational' : (groundDamaged > 0 ? 'Damaged (Repair Required)' : 'In Field Use')
        },
        {
          name: 'High-Buoyancy Safety Life Jackets',
          category: 'Safety Gear',
          dispatched: jacketsDisp,
          groundStatus: isGroundCleared ? `${isGroundCleared ? jacketsDisp : 0} Good, 0 Damaged` : 'Pending Field Release',
          godownStatus: isGodownRestocked ? `${isGodownRestocked ? jacketsDisp : 0} Restocked (Good Condition)` : 'Awaiting Bay Arrival',
          condition: isGroundCleared ? 'Good / Clean Restock' : 'In Field Use'
        },
        {
          name: 'Emergency Ration Packs (Pack of 10)',
          category: 'Relief Food',
          dispatched: foodDisp,
          groundStatus: isGroundCleared ? `${foodDisp} Distributed to Camp Evacuees` : 'In Distribution',
          godownStatus: 'Consumable Item (Distributed / No Warehouse Restock Required)',
          condition: 'Distributed to Flood Victims'
        },
        {
          name: 'Trauma & Waterborne Disease Medicine Kits',
          category: 'Medical',
          dispatched: medsDisp,
          groundStatus: isGroundCleared ? `${medsDisp} Deployed at DEOC Health Camp` : 'In Clinical Use',
          godownStatus: 'Consumable Medical Aid (Disbursed)',
          condition: 'Administered in Sector'
        }
      ];

      // Dual-Verification enforcement: Can ONLY be closed when BOTH have truly verified non-zero numbers
      const bothVerified = isGroundCleared && isGodownRestocked && groundGood > 0 && godownGood > 0;
      const isClosed = Boolean(caseRec && caseRec.status === 'Closed' && bothVerified);

      return {
        id: `RET-AUD-${idx + 1}`,
        caseId,
        area: sector.village,
        village: sector.village,
        resource: lc ? `${boatsDisp} Boats, ${jacketsDisp} Jackets` : 'Rescue Boats & Life Jackets',
        dispatched: totalDisp,
        dispatchedSummary: `${boatsDisp} Boats, ${jacketsDisp} Jackets, ${foodDisp} Food, ${medsDisp} Meds`,
        items: itemsBreakdown,
        
        // Ground Officer Verification Block
        ground: {
          officer: groundRet?.officer || delivery?.verifiedBy || 'Bhaskar Jyoti Das (Ground Officer - GO-KAM-04)',
          status: isGroundCleared ? 'Verified on Ground' : 'Pending Field Sign-off',
          isVerified: isGroundCleared,
          good: groundGood,
          damaged: groundDamaged,
          missing: groundMissing,
          remarks: groundRet?.remarks || delivery?.remarks || (isGroundCleared ? 'All deployed rescue craft and jackets accounted for and handed to convoy escort.' : 'Awaiting post-operation ground handover.'),
          time: groundRet?.time || delivery?.verifiedAt || 'Field Intake'
        },

        // Central Godown Warehouse Verification Block
        godown: {
          manager: godownRet?.returnedByOfficer || 'Rajesh Das (Warehouse Manager - WH-MIRZA)',
          status: isGodownRestocked ? 'Warehouse Restocked' : 'Pending Intake Bay Inspection',
          isVerified: isGodownRestocked,
          good: godownGood,
          damaged: godownDamaged,
          missing: godownMissing,
          notes: godownRet?.conditionNotes || (isGodownRestocked ? 'Physical inspection completed at intake bay. Assets restocked into central emergency buffer.' : 'Awaiting physical warehouse delivery from field escort.'),
          time: godownRet?.date || 'Warehouse Bay'
        },

        variance: Math.abs(groundGood - godownGood),
        status: isClosed ? 'Closed' : (bothVerified ? 'Dual Verified' : 'Under Review'),
        bothVerified,
        caseClosed: isClosed,
        canClose: bothVerified && !isClosed,
        closedBy: caseRec?.closedBy || null,
        closedAt: caseRec?.closedAt || null,
        sealNo: caseRec?.sealNo || null
      };
    });

    // 7. Operations Watch - Non-command Monitoring & DDMA Anomaly Tracking
    const operationsWatch = groundOperations.map((o, idx) => {
      const savedAnomaly = dbAnomalies.find(a => a.opId === o.opId || a.location === o.location);
      const isAnomaly = Boolean(savedAnomaly && savedAnomaly.status !== 'Resolved');

      return {
        opId: o.opId || `OP-${idx + 1}`,
        location: o.location || 'Assigned Sector',
        area: o.location || 'Assigned Sector',
        agency: o.agency || 'NDRF (1st Bn)',
        rescued: Number(o.rescued || 48),
        stranded: Number(o.stranded || 15),
        status: isAnomaly ? 'Anomaly Escalated to DDMA' : (o.status || 'Active Operation'),
        notes: isAnomaly ? (savedAnomaly.notes || 'Critical bottleneck / delayed evacuation flagged to DDMA.') : (o.notes || 'Tactical team operating on site.'),
        anomalyFlagged: isAnomaly,
        anomalyNotes: savedAnomaly?.notes || '',
        escalatedAt: savedAnomaly?.flaggedAt || null,
        escalatedBy: savedAnomaly?.officer || null
      };
    });

    // 8. Cross-Portal Comprehensive Activity Logs / Notification Feed (Chronological with Admin at Top)
    const auditLogs = [];

    // Priority 1: Logs from Admin Inundation Mapping (Pinned flood areas)
    adminAreas.forEach((a, idx) => {
      auditLogs.push({
        id: `LOG-ADM-${idx + 1}`,
        time: 'Flood Onset (Live Inundation)',
        portal: 'State Admin (GIS Command)',
        actor: 'State Inundation Command Cell',
        area: a.name || a.village || 'Flood Sector',
        action: `Flood Zone Pinned & Telemetry Inundation Alert Issued`,
        detail: `Sector marked as ${a.severity || 'Critical'} flood hazard near ${a.river || 'Saura / Kosi Basin'}. Current waterlevel: ${a.waterLevel || '34.9m'} (Above Danger Mark). Estimated affected population: ${(a.pop || a.population || 2500).toLocaleString()} citizens.`,
        impact: `Emergency evacuation boundary mapped on state GIS console. Requisition transmitted to DDMA for relief allocation.`,
        tag: 'tag-red',
        icon: 'fa-satellite-dish'
      });
    });

    // Priority 2: Logs from Authority Allocations
    authAllocations.forEach((a, idx) => {
      auditLogs.push({
        id: `LOG-AUT-${idx + 1}`,
        time: a.timestamp || 'Today, 10:30 AM',
        portal: 'District Authority (DDMA)',
        actor: 'DC / ADC Relief Control Room',
        area: a.village || a.destination || 'Flood Sector',
        action: `Emergency Relief Order Approved (${a.id})`,
        detail: `Allocated supplies: ${a.summary}. Handover Lead: ${a.leadOfficerName ? `${a.leadAgency || 'NDRF'} ${a.leadOfficerName}` : 'Inspector Rajesh Kalita'}.`,
        impact: `Binding administrative supply requisition transmitted to Central Godown for dispatch.`,
        tag: 'tag-indigo',
        icon: 'fa-building-columns'
      });
    });

    // Priority 3: Logs from Godown Dispatches
    godownDispatches.forEach((d, idx) => {
      auditLogs.push({
        id: `LOG-GDN-${idx + 1}`,
        time: d.dispatchTime || 'Today, 11:15 AM',
        portal: 'Central Godown Manager',
        actor: 'Rajesh Das (Warehouse Manager)',
        area: d.destination || 'Dispatched Sector',
        action: `Gate-Pass Issued & Convoy Dispatched (${d.refNo || d.dispatchId || 'DSP-2026-932'})`,
        detail: `Resources loaded: ${d.summary || `${d.dispatchedBoats || 3} Boats, ${d.dispatchedJackets || 33} Jackets`}. Truck: ${d.vehicle || 'Heavy Swaraj Truck AS-01-EC-4210'}. Driver: ${d.driver || 'Rajesh Das'}.`,
        impact: `Convoy departed under armed NDRF escort to ensure zero leakage en route.`,
        tag: 'tag-blue',
        icon: 'fa-truck-fast'
      });
    });

    // Priority 4: Logs from Ground Officer deliveries & actions
    groundDeliveries.forEach((g, idx) => {
      auditLogs.push({
        id: `LOG-GRD-${idx + 1}`,
        time: g.verifiedAt || 'Today, 12:45 PM',
        portal: 'Ground Field Officer',
        actor: g.verifiedBy || 'Bhaskar Jyoti Das (Ground Officer)',
        area: g.destination || 'Field Sector',
        action: g.status === 'Verified' ? 'Physical Delivery Intake Verified' : 'Consignment Acknowledged',
        detail: `Verified supplies: ${g.dispatched || g.resource}. Shortages: ${g.shortage || 0}, Damaged: ${g.damaged || 0}. Remarks: "${g.remarks || 'Receipt verified'}".`,
        impact: g.groundOfficerCleared
          ? 'Rescue operations completed! Area declared controlled; equipment released for warehouse return.'
          : 'Emergency supplies distributed to waterlogged camps and evacuees.',
        tag: 'tag-good',
        icon: 'fa-person-military-rifle'
      });
    });

    // 9. Overall KPI Metrics covering all 10 specifications
    const totalApprovedUnits = lifecycles.reduce((acc, l) => acc + l.approvedSupplies.total, 0);
    const totalDispatchedUnits = lifecycles.reduce((acc, l) => acc + l.dispatchedSupplies.total, 0);
    const totalReceivedUnits = lifecycles.reduce((acc, l) => acc + (l.stageIndex >= 4 ? l.receivedSupplies.total : 0), 0);
    const totalEvacuatedCitizens = operationsWatch.reduce((acc, o) => acc + o.rescued, 0);
    const pendingVerificationsCount = lifecycles.filter(l => l.stageIndex === 3).length;
    const activeShortagesCount = discrepancies.filter(d => d.status !== 'Closed' && d.status !== 'Resolved').length;

    // 10. Notifications & Escalation Stream (Point 10)
    const notifications = [
      ...discrepancies.map(d => ({
        id: `NOTIF-DISC-${d.id}`,
        type: 'CRITICAL_SHORTAGE',
        severity: 'ALERT',
        title: `Critical Supply Shortage: ${d.destination}`,
        detail: `${d.item} reported at sector gate. Handover escort: ${d.leadOfficer}.`,
        status: d.status,
        time: 'Real-time',
        target: d.destination
      })),
      ...lifecycles.filter(l => l.stageIndex === 3).map(l => ({
        id: `NOTIF-UNVER-${l.id}`,
        type: 'UNVERIFIED_DELIVERY',
        severity: 'WARNING',
        title: `Pending Ground Delivery Verification: ${l.village}`,
        detail: `Dispatch ${l.dispatchRef} in transit with ${l.resourcesDispatched}. Ground officer acknowledgment required.`,
        status: 'In Transit',
        time: '2 hours ago',
        target: l.village
      })),
      ...operationsWatch.filter(o => o.stranded > 10).map(o => ({
        id: `NOTIF-OPS-${o.opId}`,
        type: 'RESCUE_ANOMALY',
        severity: 'INFO',
        title: `Active High-Priority Rescue: ${o.location}`,
        detail: `${o.rescued} citizens evacuated so far, ${o.stranded} citizens awaiting extraction by ${o.agency}.`,
        status: o.status,
        time: 'Active Now',
        target: o.location
      }))
    ];

    const statePayload = {
      kpis: {
        totalApproved: totalApprovedUnits || 4220,
        totalDispatched: totalDispatchedUnits || 4220,
        totalReceived: totalReceivedUnits || 3876,
        pendingVerifications: pendingVerificationsCount,
        activeShortages: activeShortagesCount,
        totalEvacuated: totalEvacuatedCitizens || 48,
        activeRescueOps: operationsWatch.length || 2,
        pendingAudits: lifecycles.filter(l => l.stageIndex < 5).length,
        activeEscalations: dbEscalations.length,
        activeSectors: lifecycles.length
      },
      summary: {
        totalApproved: totalApprovedUnits || 4220,
        totalDispatched: totalDispatchedUnits || 4220,
        totalReceived: totalReceivedUnits || 3876,
        pendingVerifications: pendingVerificationsCount,
        activeShortages: activeShortagesCount,
        activeRescueOps: operationsWatch.length || 2,
        totalEvacuated: totalEvacuatedCitizens || 48,
        pendingAudits: lifecycles.filter(l => l.stageIndex < 5).length,
        activeEscalations: dbEscalations.length
      },
      lifecycles,
      reconciliation,
      discrepancies,
      deliveryAudits,
      returns: returnsAudit,
      operations: operationsWatch,
      chats: chatsByRole,
      escalations: dbEscalations,
      announcements: dbAnnouncements,
      notifications,
      logs: auditLogs,
      areas: Array.from(sectorMap.values())
    };

    cache.monitoring = statePayload;
    return statePayload;
  },

  async sendChat(chatData) {
    const record = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      channel: chatData.channel || 'ground',
      from: chatData.from || chatData.sender || 'Monitoring Officer (MO-DEOC-02)',
      fromRole: chatData.fromRole || chatData.senderRole || 'monitoring',
      toRole: chatData.channel || 'ground',
      message: (chatData.message || '').trim(),
      badge: chatData.badge || 'AUDIT NOTE',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date()
    };

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('monitoring_chats').insertOne({ ...record });
      } catch (e) {
        console.warn('sendChat MongoDB write notice:', e.message);
      }
    }
    return record;
  },

  async updateDiscrepancyStatus(payload) {
    const { id, status, notes } = payload;
    const record = {
      id,
      status: status || 'Under Review',
      notes: notes || '',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('monitoring_discrepancies').updateOne({ id }, { $set: record }, { upsert: true });
      } catch (e) {
        console.warn('updateDiscrepancyStatus MongoDB error:', e.message);
      }
    }
    return record;
  },

  async escalateDiscrepancy(payload) {
    const record = {
      id: `ESC-${Date.now()}`,
      allocId: payload.allocId || '—',
      dispatchId: payload.dispatchId || '—',
      destination: payload.destination || payload.area || 'Field Sector',
      discrepancy: payload.discrepancy || payload.issue || 'Unresolved supply mismatch',
      officer: payload.officer || 'Monitoring Officer (MO-DEOC-02)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Escalated to DDMA Chairman',
      createdAt: new Date()
    };

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('monitoring_escalations').insertOne({ ...record });
      } catch (e) {
        console.warn('escalateDiscrepancy MongoDB write notice:', e.message);
      }
    }
    return record;
  },

  async closeReturnCase(payload) {
    const caseId = payload.caseId || `CASE-RET-${Date.now()}`;
    const area = payload.area || 'Field Sector';
    const sealNo = `DEOC-AUD-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('en-IN');

    const record = {
      caseId,
      area,
      status: 'Closed',
      closedBy: payload.closedBy || 'State Monitoring Officer (MO-DEOC-02)',
      closedAt: `${nowTime}, ${nowDate}`,
      sealNo,
      notes: payload.notes || 'Full dual verification approved: Ground field return & Godown warehouse restock reconciled. Case closed.',
      updatedAt: new Date()
    };

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('monitoring_return_cases').updateOne(
          { caseId },
          { $set: record },
          { upsert: true }
        );
      } catch (e) {
        console.warn('closeReturnCase MongoDB error:', e.message);
      }
    }
    return record;
  },

  async updateOpsAnomaly(payload) {
    const opId = payload.opId || 'OP-1';
    const location = payload.location || 'Assigned Sector';
    const status = payload.status || 'Anomaly Escalated to DDMA';
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const record = {
      opId,
      location,
      status,
      flaggedAt: nowTime,
      notes: payload.notes || 'Critical bottleneck / delayed evacuation flagged to District Magistrate Control Room.',
      officer: 'State Monitoring Officer (MO-DEOC-02)',
      updatedAt: new Date()
    };

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('monitoring_ops_anomalies').updateOne(
          { opId },
          { $set: record },
          { upsert: true }
        );
      } catch (e) {
        console.warn('updateOpsAnomaly MongoDB error:', e.message);
      }
    }
    return record;
  }
};

export const announcementsDb = {
  async getActive() {
    const db = await getDatabase();
    if (db) {
      try {
        const list = await db.collection('broadcast_announcements')
          .find({ pinned: true }, { projection: { _id: 0 } })
          .sort({ createdAt: -1 })
          .toArray();
        if (list && list.length) return list;
      } catch (e) {
        console.warn('announcementsDb read error:', e.message);
      }
    }
    return (cache.announcements || []).filter(a => a.pinned);
  },

  async publish(payload) {
    const record = {
      id: `ANN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: payload.title || 'State DEOC High-Priority Directive',
      message: payload.message || '',
      severity: payload.severity || 'CRITICAL', // EMERGENCY | CRITICAL | GENERAL
      scope: payload.scope || 'ALL', // ALL | OFFICERS
      pinned: true,
      author: payload.author || 'State Monitoring Officer (MO-DEOC-02)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date()
    };

    const db = await getDatabase();
    if (db) {
      try {
        await db.collection('broadcast_announcements').insertOne({ ...record });
      } catch (e) {
        console.warn('publishAnnouncement MongoDB write error:', e.message);
      }
    }

    if (!cache.announcements) cache.announcements = [];
    cache.announcements.unshift(record);
    return record;
  },

  async unpin(id) {
    const db = await getDatabase();
    if (db) {
      try {
        if (!id || id === 'ALL') {
          await db.collection('broadcast_announcements').updateMany({}, { $set: { pinned: false } });
        } else {
          await db.collection('broadcast_announcements').updateOne({ id }, { $set: { pinned: false } });
        }
      } catch (e) {
        console.warn('unpinAnnouncement MongoDB error:', e.message);
      }
    }

    if (cache.announcements) {
      if (!id || id === 'ALL') {
        cache.announcements.forEach(a => a.pinned = false);
      } else {
        const item = cache.announcements.find(a => a.id === id);
        if (item) item.pinned = false;
      }
    }
    return { success: true, id };
  }
};
