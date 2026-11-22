// District Admin Portal Telemetry Service
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'admin', 'adminData.json');

function readData() {
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read admin data file:', e);
  }
  return { areas: [], rivers: [], alerts: [], facilities: [], weather: {} };
}

function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to write admin data file:', e);
    return false;
  }
}

// In-memory cache for fast read/write with file persistence
let store = readData();

export const adminService = {
  getFullState() {
    return store;
  },

  // --- FLOOD ZONES (AREAS) ---
  getAreas() {
    return store.areas || [];
  },

  saveArea(areaData) {
    if (!store.areas) store.areas = [];
    const id = areaData.id || `area-${Date.now()}`;
    const index = store.areas.findIndex(a => a.id === id || (a.name === areaData.name && a.block === areaData.block));
    
    const record = {
      id,
      name: areaData.name || 'Unnamed Sector',
      block: areaData.block || 'Kamrup',
      severity: areaData.severity || 'Moderate',
      pop: Number(areaData.pop) || 0,
      lat: Number(areaData.lat) || 26.12,
      lng: Number(areaData.lng) || 91.45,
      notes: areaData.notes || ''
    };

    if (index >= 0) {
      store.areas[index] = { ...store.areas[index], ...record };
    } else {
      store.areas.unshift(record);
    }
    writeData(store);
    return record;
  },

  deleteArea(idOrIndex) {
    if (!store.areas) return false;
    if (typeof idOrIndex === 'number' && idOrIndex >= 0) {
      const removed = store.areas.splice(idOrIndex, 1);
      writeData(store);
      return removed.length > 0;
    }
    const initialLen = store.areas.length;
    store.areas = store.areas.filter(a => a.id !== idOrIndex && a.name !== idOrIndex);
    writeData(store);
    return store.areas.length < initialLen;
  },

  // --- RIVER GAUGES ---
  getRivers() {
    return store.rivers || [];
  },

  updateRiver(riverIdOrName, updateData) {
    if (!store.rivers) store.rivers = [];
    const river = store.rivers.find(r => r.id === riverIdOrName || r.name === riverIdOrName);
    if (!river) return null;

    if (updateData.current !== undefined) river.current = Number(updateData.current);
    if (updateData.trend) river.trend = updateData.trend;
    if (river.current >= river.danger) {
      river.barColor = '#dc2626';
    } else if (river.current >= river.danger - 0.8) {
      river.barColor = '#eab308';
    } else {
      river.barColor = '#16a34a';
    }
    writeData(store);
    return river;
  },

  // --- ALERTS ---
  getAlerts() {
    return store.alerts || [];
  },

  addAlert(alertData) {
    if (!store.alerts) store.alerts = [];
    const alert = {
      id: alertData.id || `alt-${Date.now()}`,
      title: alertData.title || 'Flood Warning',
      location: alertData.location || 'Kamrup District',
      severity: alertData.severity || 'Moderate',
      desc: alertData.desc || 'Water level monitoring in effect.'
    };
    store.alerts.unshift(alert);
    writeData(store);
    return alert;
  },

  deleteAlert(idOrIndex) {
    if (!store.alerts) return false;
    if (typeof idOrIndex === 'number' && idOrIndex >= 0) {
      const removed = store.alerts.splice(idOrIndex, 1);
      writeData(store);
      return removed.length > 0;
    }
    const initialLen = store.alerts.length;
    store.alerts = store.alerts.filter(a => a.id !== idOrIndex && a.title !== idOrIndex);
    writeData(store);
    return store.alerts.length < initialLen;
  },

  // --- FACILITIES ---
  getFacilities() {
    return store.facilities || [];
  },

  addFacility(facData) {
    if (!store.facilities) store.facilities = [];
    const fac = {
      id: facData.id || `fac-${Date.now()}`,
      name: facData.name || 'Emergency Facility',
      category: facData.category || 'Relief Camp',
      distance: facData.distance || 'Kamrup',
      contact: facData.contact || '1077'
    };
    store.facilities.unshift(fac);
    writeData(store);
    return fac;
  },

  deleteFacility(idOrIndex) {
    if (!store.facilities) return false;
    if (typeof idOrIndex === 'number' && idOrIndex >= 0) {
      const removed = store.facilities.splice(idOrIndex, 1);
      writeData(store);
      return removed.length > 0;
    }
    const initialLen = store.facilities.length;
    store.facilities = store.facilities.filter(f => f.id !== idOrIndex && f.name !== idOrIndex);
    writeData(store);
    return store.facilities.length < initialLen;
  },

  // --- WEATHER ---
  getWeather() {
    return store.weather || {};
  },

  updateWeather(weatherData) {
    store.weather = { ...store.weather, ...weatherData };
    writeData(store);
    return store.weather;
  }
};
