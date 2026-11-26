// State DEOC Monitoring & Audit Portal Backend Service with Next.js MongoDB Engine
import { monitoringDb } from '../lib/db.js';

export const monitoringService = {
  status: 'ACTIVE',
  portal: 'State DEOC Monitoring & Audit Portal',
  getFullState() {
    return monitoringDb.getState();
  },
  getSummary() {
    return monitoringDb.getState();
  }
};

export default monitoringService;
