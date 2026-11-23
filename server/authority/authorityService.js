// NEERAKSHAK District Authority Portal (DDMA) Backend Service
// Handles Flood Village Assessments, Resource Requests, Direct Allocations,
// NDRF/SDRF Multi-Agency Coordination, and Godown Manager Dispatch Directives.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, 'authorityData.json');
const adminDataPath = path.join(__dirname, '..', 'admin', 'adminData.json');

function readData() {
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read authority data file:', e);
  }
  return {
    villages: [],
    requests: [],
    allocations: [],
    coordinations: [],
    operations: [],
    logs: []
  };
}

function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to write authority data file:', e);
    return false;
  }
}

// In-memory store
let store = readData();

// Helper: merge admin flood areas into authority villages list
function syncFromAdminAreas(currentVillages) {
  try {
    if (fs.existsSync(adminDataPath)) {
      const adminRaw = fs.readFileSync(adminDataPath, 'utf-8');
      const adminData = JSON.parse(adminRaw);
      if (adminData && Array.isArray(adminData.areas) && adminData.areas.length > 0) {
        adminData.areas.forEach(area => {
          const exists = currentVillages.find(v => v.id === area.id || v.name.toLowerCase() === area.name.toLowerCase());
          if (!exists) {
            // Assess required emergency relief based on severity & population
            const pop = Number(area.pop) || 2000;
            const isCrit = area.severity === 'Critical';
            const isHigh = area.severity === 'High';
            currentVillages.push({
              id: area.id,
              name: area.name,
              block: area.block || 'District Sector',
              severity: area.severity || 'Moderate',
              pop: pop,
              waterStatus: area.notes || (isCrit ? 'Embankment overflow watch' : 'Approach road waterlogged'),
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
      }
    }
  } catch (e) {
    // Admin file optional
  }
  return currentVillages;
}

export const authorityService = {
  getFullState() {
    if (!store.villages || store.villages.length === 0) {
      store = readData();
    }
    // Sync with any newly added Admin zones
    store.villages = syncFromAdminAreas(store.villages || []);
    return store;
  },

  // --- FLOOD VILLAGES ASSESSMENT ---
  getVillages() {
    return this.getFullState().villages || [];
  },

  saveVillageAssessment(villageId, assessedNeed) {
    if (!store.villages) store.villages = [];
    const v = store.villages.find(item => item.id === villageId || item.name.toLowerCase() === villageId.toLowerCase());
    if (v) {
      v.assessedNeed = { ...v.assessedNeed, ...assessedNeed };
      writeData(store);
      return v;
    }
    return null;
  },

  // --- RESOURCE REQUESTS & APPROVAL DESK ---
  getRequests() {
    return store.requests || [];
  },

  addRequest(reqData) {
    if (!store.requests) store.requests = [];
    const newReq = {
      id: reqData.id || `REQ-${Math.floor(210 + Math.random() * 80)}`,
      from: reqData.from || 'Field Relief Desk',
      village: reqData.village || 'Sector Lowland',
      items: reqData.items || 'Food & Medicine Buffer',
      urgency: reqData.urgency || 'High',
      status: reqData.status || 'Pending',
      reason: reqData.reason || 'Awaiting Authority Review',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    store.requests.unshift(newReq);
    this.addLog({
      actor: 'Ground / Relief Desk',
      note: `Filed resource request ${newReq.id} for ${newReq.village} (${newReq.items}).`
    });
    writeData(store);
    return newReq;
  },

  updateRequestDecision(reqIdOrIndex, decision, reason) {
    if (!store.requests) store.requests = [];
    let req = null;
    if (typeof reqIdOrIndex === 'number' && reqIdOrIndex >= 0 && store.requests[reqIdOrIndex]) {
      req = store.requests[reqIdOrIndex];
    } else {
      req = store.requests.find(r => r.id === reqIdOrIndex);
    }

    if (!req) return null;

    req.status = decision; // 'Approved' or 'Rejected'
    req.reason = reason || (decision === 'Approved' ? 'Approved by District Authority DDMA' : 'Rejected per inventory assessment');

    // If Approved, automatically generate dispatch allocation for Godown Manager
    if (decision === 'Approved') {
      const newAlloc = {
        id: `ALC-${Math.floor(520 + Math.random() * 80)}`,
        village: req.village,
        summary: req.items,
        godownStatus: 'Sent to Godown Manager • Preparing Dispatch',
        deliveryProgress: 35,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      if (!store.allocations) store.allocations = [];
      store.allocations.unshift(newAlloc);
    }

    this.addLog({
      actor: 'District Authority (DDMA)',
      note: `${decision} request ${req.id} for ${req.village}. Reason: ${req.reason}`
    });

    writeData(store);
    return req;
  },

  // --- DIRECT ALLOCATIONS & GODOWN MANAGER DISPATCH DIRECTIVES ---
  getAllocations() {
    return store.allocations || [];
  },

  createAllocation(allocData) {
    if (!store.allocations) store.allocations = [];
    const newAlloc = {
      id: allocData.id || `ALC-${Math.floor(530 + Math.random() * 70)}`,
      village: allocData.village || 'Sector Village',
      summary: allocData.summary || 'Emergency Ration & Equipment Buffer',
      godownStatus: allocData.godownStatus || 'Sent to Godown Manager • Awaiting Dispatch',
      deliveryProgress: allocData.deliveryProgress || 35,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    store.allocations.unshift(newAlloc);

    this.addLog({
      actor: 'District Authority (DDMA)',
      note: `Direct allocation (${newAlloc.summary}) assigned to ${newAlloc.village}; sent to Godown Manager.`
    });

    writeData(store);
    return newAlloc;
  },

  // --- NDRF / SDRF COORDINATION ---
  getCoordinations() {
    return store.coordinations || [];
  },

  addCoordination(coordData) {
    if (!store.coordinations) store.coordinations = [];
    const record = {
      id: coordData.id || `CORD-${Math.floor(105 + Math.random() * 90)}`,
      agency: coordData.agency || 'NDRF (1st Bn)',
      sector: coordData.sector || 'District Lowland',
      update: coordData.update || 'Coordinated emergency deployment.',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    store.coordinations.unshift(record);

    this.addLog({
      actor: 'District Authority (DDMA)',
      note: `Logged ${record.agency} deployment update for ${record.sector}.`
    });

    writeData(store);
    return record;
  },

  // --- RESCUE OPERATIONS MANAGEMENT ---
  getOperations() {
    return store.operations || [];
  },

  saveOperation(opData) {
    if (!store.operations) store.operations = [];
    const record = {
      id: opData.id || `OP-${Math.floor(310 + Math.random() * 90)}`,
      title: opData.title || 'Evacuation Operation',
      status: opData.status || 'Ongoing',
      summary: opData.summary || 'Field personnel deployed.',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    store.operations.unshift(record);

    this.addLog({
      actor: 'District Authority (DDMA)',
      note: `Updated rescue operation "${record.title}" (${record.status}).`
    });

    writeData(store);
    return record;
  },

  // --- AUDIT & DECISION LOGS ---
  getLogs() {
    return store.logs || [];
  },

  addLog(logData) {
    if (!store.logs) store.logs = [];
    const log = {
      id: `LOG-${Date.now().toString(36).toUpperCase()}`,
      time: logData.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      actor: logData.actor || 'District Authority (DDMA)',
      note: logData.note || 'Authority record updated.'
    };
    store.logs.unshift(log);
    if (store.logs.length > 50) store.logs.pop();
    writeData(store);
    return log;
  }
};
