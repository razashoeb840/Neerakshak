// NEERAKSHAK District Authority Portal (DDMA) Backend Service with Next.js MongoDB Engine
import { authorityDb } from '../lib/db.js';

export const authorityService = {
  getFullState() {
    return authorityDb.getState();
  },

  getVillages() {
    return authorityDb.getState().then(s => s.villages || []);
  },

  getRequests() {
    return authorityDb.getState().then(s => s.requests || []);
  },

  addRequest(reqData) {
    return authorityDb.saveRequest(reqData);
  },

  updateRequestDecision(reqIdOrIndex, decision, reason) {
    return authorityDb.updateRequest(reqIdOrIndex, decision, reason);
  },

  getAllocations() {
    return authorityDb.getState().then(s => s.allocations || []);
  },

  createAllocation(allocData) {
    return authorityDb.saveAllocation(allocData);
  },

  getCoordinations() {
    return authorityDb.getState().then(s => s.coordinations || []);
  },

  addCoordination(coordData) {
    return authorityDb.saveCoordination(coordData);
  },

  getOperations() {
    return authorityDb.getState().then(s => s.operations || []);
  },

  addOperation(opData) {
    return authorityDb.saveOperation(opData);
  },

  getLogs() {
    return authorityDb.getState().then(s => s.logs || []);
  },

  addLog(logData) {
    return authorityDb.addLog(logData);
  }
};

export default authorityService;
