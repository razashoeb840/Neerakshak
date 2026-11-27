import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { adminDb, authorityDb, godownDb } from './server/lib/db.js';

function adminBackendPlugin() {
  return {
    name: 'admin-backend-fallback',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/admin')) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120);
            const check = await fetch('http://localhost:5000/api/admin', { method: 'OPTIONS', signal: controller.signal });
            clearTimeout(timeoutId);
            if (check.ok || check.status === 200) {
              return next();
            }
          } catch (e) {}

          const parsedUrl = new URL(req.url, 'http://localhost:5173');
          const pathname = parsedUrl.pathname;
          const method = req.method;

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

          if (method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          const data = await adminDb.getState();

          // Full admin state
          if (pathname === '/api/admin' && method === 'GET') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data }));
            return;
          }

          let body = {};
          if (method === 'POST') {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            try { body = JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch (e) {}
          }

          // Areas CRUD
          if (pathname === '/api/admin/areas') {
            if (method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.areas || [] }));
              return;
            }
            if (method === 'POST') {
              const record = await adminDb.saveArea(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: record }));
              return;
            }
            if (method === 'DELETE') {
              const id = parsedUrl.searchParams.get('id');
              if (id) await adminDb.deleteArea(id);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
              return;
            }
          }

          // Alerts CRUD
          if (pathname === '/api/admin/alerts') {
            if (method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.alerts || [] }));
              return;
            }
            if (method === 'POST') {
              const alert = await adminDb.saveAlert(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: alert }));
              return;
            }
            if (method === 'DELETE') {
              const id = parsedUrl.searchParams.get('id');
              if (id) await adminDb.deleteAlert(id);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
              return;
            }
          }

          // Live River Telemetry
          if (pathname === '/api/admin/rivers/live') {
            const basin = parsedUrl.searchParams.get('basin') || 'bk';
            try {
              const { riverTelemetryService } = await import('./server/admin/riverTelemetryService.js');
              const liveData = await riverTelemetryService.getLiveBasinRivers(basin);
              res.statusCode = 200;
              res.end(JSON.stringify(liveData));
              return;
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
              return;
            }
          }

          // Rivers update
          if (pathname === '/api/admin/rivers') {
            if (method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.rivers || [] }));
              return;
            }
            if (method === 'POST') {
              const river = await adminDb.updateRiver(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: river }));
              return;
            }
          }

          // Facilities CRUD
          if (pathname === '/api/admin/facilities') {
            if (method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.facilities || [] }));
              return;
            }
            if (method === 'POST') {
              const facility = await adminDb.saveFacility(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: facility }));
              return;
            }
          }

          // Weather telemetry
          if (pathname === '/api/admin/weather') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: data.weather || {} }));
            return;
          }
        }
        next();
      });
    }
  };
}

function authorityBackendPlugin() {
  return {
    name: 'authority-backend-fallback',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/authority')) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120);
            const check = await fetch('http://localhost:5000/api/authority', { method: 'OPTIONS', signal: controller.signal });
            clearTimeout(timeoutId);
            if (check.ok || check.status === 200) {
              return next();
            }
          } catch (e) {}

          const parsedUrl = new URL(req.url, 'http://localhost:5173');
          const pathname = parsedUrl.pathname;
          const method = req.method;

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');

          if (method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          const data = await authorityDb.getState();

          // Full state
          if (pathname === '/api/authority' && method === 'GET') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data }));
            return;
          }

          let body = {};
          if (method === 'POST' || method === 'PATCH') {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            try { body = JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch (e) {}
          }

          // Requests
          if (pathname === '/api/authority/requests') {
            if (method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.requests || [] }));
              return;
            }
            if (method === 'POST') {
              const newReq = await authorityDb.saveRequest(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: newReq }));
              return;
            }
            if (method === 'PATCH') {
              const { index, id, decision, reason } = body;
              const reqItem = await authorityDb.updateRequest(id || index, decision, reason);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: reqItem }));
              return;
            }
          }

          // Allocations
          if (pathname === '/api/authority/allocations') {
            if (method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.allocations || [] }));
              return;
            }
            if (method === 'POST') {
              const newAlloc = await authorityDb.saveAllocation(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: newAlloc }));
              return;
            }
          }

          // Coordinations
          if (pathname === '/api/authority/coordinations') {
            if (method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.coordinations || [] }));
              return;
            }
            if (method === 'POST') {
              const record = await authorityDb.saveCoordination(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: record }));
              return;
            }
          }

          // Operations
          if (pathname === '/api/authority/operations') {
            if (method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.operations || [] }));
              return;
            }
            if (method === 'POST') {
              const op = await authorityDb.saveOperation(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: op }));
              return;
            }
          }

          // Logs
          if (pathname === '/api/authority/logs' && method === 'GET') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: data.logs || [] }));
            return;
          }
        }
        next();
      });
    }
  };
}

function godownBackendPlugin() {
  return {
    name: 'godown-backend-fallback',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/godown')) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120);
            const check = await fetch('http://localhost:5000/api/godown', { method: 'OPTIONS', signal: controller.signal });
            clearTimeout(timeoutId);
            if (check.ok || check.status === 200) {
              return next();
            }
          } catch (e) {}

          const parsedUrl = new URL(req.url, 'http://localhost:5173');
          const pathname = parsedUrl.pathname;
          const method = req.method;

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');

          if (method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          const data = await godownDb.getState();

          // Full state
          if (pathname === '/api/godown' && method === 'GET') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data }));
            return;
          }

          let body = {};
          if (method === 'POST' || method === 'PATCH') {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            try { body = JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch (e) {}
          }

          // Inventory
          if (pathname === '/api/godown/inventory') {
            if (method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.inventory || [] }));
              return;
            }
            if (method === 'POST') {
              const item = await godownDb.saveStock(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: item }));
              return;
            }
            if (method === 'PATCH') {
              const item = await godownDb.updateStock(body.id, body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: item }));
              return;
            }
          }

          // Allocations
          if (pathname === '/api/godown/allocations' && method === 'GET') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: data.allocations || [] }));
            return;
          }

          // Dispatch
          if (pathname === '/api/godown/dispatch' && method === 'POST') {
            const result = await godownDb.dispatchConvoy(body);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, refNo: result.refNo, data: result }));
            return;
          }

          // Shortage
          if (pathname === '/api/godown/shortage' && method === 'POST') {
            const result = await godownDb.reportShortage(body.allocId || body.id, body.reason);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
            return;
          }

          // Returns
          if (pathname === '/api/godown/returns/verify-restock' || (pathname === '/api/godown/returns' && (method === 'PATCH' || (method === 'POST' && body.action === 'verify-restock')))) {
            const result = await godownDb.verifyWarehouseRestock(body);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
            return;
          }

          if (pathname === '/api/godown/returns') {
            if (method === 'POST') {
              const result = await godownDb.recordAreaReturn(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: result }));
              return;
            }
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: data.returns || [] }));
            return;
          }

          // Movements
          if (pathname === '/api/godown/movements' && method === 'GET') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: data.movements || [] }));
            return;
          }

          // Rivers Telemetry
          if (pathname === '/api/godown/rivers') {
            const basin = parsedUrl.searchParams.get('basin') || 'ab';
            try {
              const { riverTelemetryService } = await import('./server/admin/riverTelemetryService.js');
              const liveData = await riverTelemetryService.getLiveBasinRivers(basin);
              res.statusCode = 200;
              res.end(JSON.stringify(liveData));
              return;
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
              return;
            }
          }
        }
        next();
      });
    }
  };
}

function groundBackendPlugin() {
  return {
    name: 'ground-backend-fallback',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url.startsWith('/api/ground') || req.url.startsWith('/api/ground-officer'))) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120);
            const check = await fetch('http://localhost:5000/api/ground-officer', { method: 'OPTIONS', signal: controller.signal });
            clearTimeout(timeoutId);
            if (check.ok || check.status === 200) {
              return next();
            }
          } catch (e) {}

          const parsedUrl = new URL(req.url, 'http://localhost:5173');
          const pathname = parsedUrl.pathname;
          const method = req.method;

          res.setHeader('Content-Type', 'application/json');

          const { groundDb } = await import('./server/lib/db.js');

          let body = {};
          if (method === 'POST') {
            try {
              const buffers = [];
              for await (const chunk of req) buffers.push(chunk);
              const raw = Buffer.concat(buffers).toString();
              if (raw) body = JSON.parse(raw);
            } catch (e) {
              body = {};
            }
          }

          if (pathname.endsWith('/clear-return') && method === 'POST') {
            const result = await groundDb.clearAreaForReturn(body);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
            return;
          }

          if (pathname.endsWith('/verify-delivery') && method === 'POST') {
            const result = await groundDb.verifyDelivery(body);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
            return;
          }

          if (pathname.endsWith('/ready-distribution') && method === 'POST') {
            const result = await groundDb.markReadyForDistribution(body);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
            return;
          }

          if (pathname.endsWith('/rescue-ops')) {
            if (method === 'POST') {
              const op = await groundDb.updateRescueProgress(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: op }));
              return;
            }
            const data = await groundDb.getState();
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: data.operations || [] }));
            return;
          }

          if (pathname.endsWith('/returns')) {
            if (method === 'POST') {
              const ret = await groundDb.submitReturnVerification(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: ret }));
              return;
            }
            const data = await groundDb.getState();
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: data.returns || [] }));
            return;
          }

          if (pathname.endsWith('/reports')) {
            if (method === 'POST') {
              const rep = await groundDb.submitReport(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: rep }));
              return;
            }
            const data = await groundDb.getState();
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: data.fieldReports || [] }));
            return;
          }

          if (pathname === '/api/ground' || pathname === '/api/ground/state' || pathname === '/api/ground-officer' || pathname === '/api/ground-officer/state') {
            const data = await groundDb.getState();
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data }));
            return;
          }
        }
        next();
      });
    }
  };
}

function monitoringBackendPlugin() {
  return {
    name: 'monitoring-backend-fallback',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url.startsWith('/api/monitoring') || req.url.startsWith('/api/announcements'))) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120);
            const check = await fetch('http://localhost:5000/api/monitoring', { method: 'OPTIONS', signal: controller.signal });
            clearTimeout(timeoutId);
            if (check.ok || check.status === 200) {
              return next();
            }
          } catch (e) {}

          const parsedUrl = new URL(req.url, 'http://localhost:5173');
          const pathname = parsedUrl.pathname;
          const method = req.method;

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

          if (method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          const { monitoringDb, announcementsDb } = await import('./server/lib/db.js');

          let body = {};
          if (method === 'POST') {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            try { body = JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch (e) {}
          }

          if (pathname === '/api/announcements') {
            if (method === 'GET') {
              const list = await announcementsDb.getActive();
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: list }));
              return;
            }
            if (method === 'POST') {
              const result = await announcementsDb.publish(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: result }));
              return;
            }
            if (method === 'DELETE') {
              const id = parsedUrl.searchParams.get('id');
              const result = await announcementsDb.unpin(id);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: result }));
              return;
            }
          }

          if (pathname === '/api/monitoring/chat') {
            if (method === 'POST') {
              const result = await monitoringDb.sendChat(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: result }));
              return;
            }
            const data = await monitoringDb.getState();
            const channel = parsedUrl.searchParams.get('channel');
            const chats = data.chats || [];
            const filtered = channel ? chats.filter(c => c.channel === channel) : chats;
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: filtered }));
            return;
          }

          if (pathname === '/api/monitoring/escalations') {
            if (method === 'POST') {
              const result = await monitoringDb.escalateDiscrepancy(body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: result }));
              return;
            }
          }

          if (pathname === '/api/monitoring/discrepancies/status' && method === 'POST') {
            const result = await monitoringDb.updateDiscrepancyStatus(body);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
            return;
          }

          if (pathname === '/api/monitoring/cases/close' && method === 'POST') {
            const result = await monitoringDb.closeReturnCase(body);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
            return;
          }

          if (pathname === '/api/monitoring/ops/anomaly' && method === 'POST') {
            const result = await monitoringDb.updateOpsAnomaly(body);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
            return;
          }

          if (pathname === '/api/monitoring' || pathname === '/api/monitoring/state') {
            const data = await monitoringDb.getState();
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data }));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), adminBackendPlugin(), authorityBackendPlugin(), godownBackendPlugin(), groundBackendPlugin(), monitoringBackendPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
