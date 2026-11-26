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
  verifyDelivery(verifyData) {
    return groundDb.verifyDelivery(verifyData);
  },
  updateRescueProgress(opData) {
    return groundDb.updateRescueProgress(opData);
  },
  clearAreaForReturn(clearData) {
    return groundDb.clearAreaForReturn(clearData);
  },
  submitReturnVerification(returnData) {
    return groundDb.submitReturnVerification(returnData);
  },
  getSummary() {
    return groundDb.getState();
  }
};

export default groundOfficerService;
