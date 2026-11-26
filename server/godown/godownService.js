// NEERAKSHAK Central Relief Godown & Logistics Hub Backend Service with Next.js MongoDB Engine
import { godownDb } from '../lib/db.js';

export const godownService = {
  getFullState() {
    return godownDb.getState();
  },

  getInventory() {
    return godownDb.getState().then(s => s.inventory || []);
  },

  addStockItem(itemData) {
    return godownDb.saveStock(itemData);
  },

  updateStockItem(invIdOrIndex, changes) {
    return godownDb.updateStock(invIdOrIndex, changes);
  },

  getAllocations() {
    return godownDb.getState().then(s => s.allocations || []);
  },

  confirmDispatch(dispatchData) {
    return godownDb.dispatchConvoy(dispatchData);
  },

  dispatchConsignment(dispatchData) {
    return godownDb.dispatchConvoy(dispatchData);
  },

  flagShortage(allocId, reason) {
    return godownDb.reportShortage(allocId, reason);
  },

  getMovements() {
    return godownDb.getState().then(s => s.movements || []);
  },

  getReturns() {
    return godownDb.getState().then(s => s.returns || []);
  },

  logReturn(returnData) {
    return godownDb.recordAreaReturn(returnData);
  }
};

export default godownService;
