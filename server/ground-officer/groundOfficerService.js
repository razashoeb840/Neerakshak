// Ground Officer Portal Backend Service with Next.js MongoDB Engine
import { groundDb } from '../lib/db.js';

export const groundOfficerService = {
  status: 'ACTIVE',
  portal: 'Ground Officer Field Operations Portal',
  getFullState() {
    return groundDb.getState();
  },
  submitReport(reportData) {
    return groundDb.submitReport(reportData);
  },
  clearAreaForReturn(clearData) {
    return groundDb.clearAreaForReturn(clearData);
  },
  getSummary() {
    return groundDb.getState();
  }
};

export default groundOfficerService;
