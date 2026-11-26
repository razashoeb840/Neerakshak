// District Admin Portal Telemetry Service with Next.js MongoDB Engine
import { adminDb } from '../lib/db.js';

export const adminService = {
  getFullState() {
    return adminDb.getState();
  },

  getAreas() {
    return adminDb.getState().then(s => s.areas || []);
  },

  saveArea(areaData) {
    return adminDb.saveArea(areaData);
  },

  deleteArea(id) {
    return adminDb.deleteArea(id);
  },

  getAlerts() {
    return adminDb.getState().then(s => s.alerts || []);
  },

  saveAlert(alertData) {
    return adminDb.saveAlert(alertData);
  },

  deleteAlert(idOrTitle) {
    return adminDb.deleteAlert(idOrTitle);
  },

  getFacilities() {
    return adminDb.getState().then(s => s.facilities || []);
  },

  saveFacility(facilityData) {
    return adminDb.saveFacility(facilityData);
  },

  getRivers() {
    return adminDb.getState().then(s => s.rivers || []);
  },

  updateRiver(riverData) {
    return adminDb.updateRiver(riverData);
  },

  getWeather() {
    return adminDb.getState().then(s => s.weather || {});
  }
};

export default adminService;
