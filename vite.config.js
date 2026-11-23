import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function adminBackendPlugin() {
  const dataPath = path.resolve(__dirname, 'server/admin/adminData.json');

  function readData() {
    try {
      if (fs.existsSync(dataPath)) {
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      }
    } catch (e) {}
    return { areas: [], rivers: [], alerts: [], facilities: [], weather: {} };
  }

  function writeData(data) {
    try {
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {}
  }

  return {
    name: 'admin-backend-fallback',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Handle /api/admin requests
        if (req.url && req.url.startsWith('/api/admin')) {
          // If Next.js server on port 5000 is running, let Vite proxy handle it
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120);
            const check = await fetch('http://localhost:5000/api/admin', { method: 'OPTIONS', signal: controller.signal });
            clearTimeout(timeoutId);
            if (check.ok || check.status === 200) {
              return next();
            }
          } catch (e) {
            // Next.js on port 5000 is not running; serve directly from server/admin/adminData.json!
          }

          const parsedUrl = new URL(req.url, 'http://localhost:5173');
          const pathname = parsedUrl.pathname;
          const method = req.method;

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          let data = readData();

          // Full admin state
          if (pathname === '/api/admin' && method === 'GET') {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data }));
            return;
          }

          // Parse POST body
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
              const id = body.id || `area-${Date.now()}`;
              const idx = (data.areas || []).findIndex(a => a.id === id || (a.name === body.name && a.block === body.block));
              const record = {
                id,
                name: body.name || 'Unnamed Sector',
                block: body.block || 'Kamrup',
                severity: body.severity || 'Moderate',
                pop: Number(body.pop) || 0,
                lat: Number(body.lat) || 26.12,
                lng: Number(body.lng) || 91.45,
                notes: body.notes || ''
              };
              if (!data.areas) data.areas = [];
              if (idx >= 0) data.areas[idx] = { ...data.areas[idx], ...record };
              else data.areas.unshift(record);
              writeData(data);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: record }));
              return;
            }
            if (method === 'DELETE') {
              const id = parsedUrl.searchParams.get('id');
              const index = parsedUrl.searchParams.get('index');
              if (index !== null && !isNaN(Number(index))) {
                data.areas.splice(Number(index), 1);
              } else if (id) {
                data.areas = (data.areas || []).filter(a => a.id !== id && a.name !== id);
              }
              writeData(data);
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
              const alert = {
                id: body.id || `alt-${Date.now()}`,
                title: body.title || 'Flood Warning',
                location: body.location || 'Kamrup District',
                severity: body.severity || 'Moderate',
                desc: body.desc || ''
              };
              if (!data.alerts) data.alerts = [];
              data.alerts.unshift(alert);
              writeData(data);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: alert }));
              return;
            }
            if (method === 'DELETE') {
              const id = parsedUrl.searchParams.get('id');
              const index = parsedUrl.searchParams.get('index');
              if (index !== null && !isNaN(Number(index))) {
                data.alerts.splice(Number(index), 1);
              } else if (id) {
                data.alerts = (data.alerts || []).filter(a => a.id !== id && a.title !== id);
              }
              writeData(data);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
              return;
            }
          }

          // Live River Telemetry (Open-Meteo GloFAS & CWC)
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
              const river = (data.rivers || []).find(r => r.id === (body.id || body.name) || r.name === (body.id || body.name));
              if (river) {
                if (body.current !== undefined) river.current = Number(body.current);
                if (body.trend) river.trend = body.trend;
                if (river.current >= river.danger) river.barColor = '#dc2626';
                else if (river.current >= river.danger - 0.8) river.barColor = '#eab308';
                else river.barColor = '#16a34a';
                writeData(data);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, data: river }));
                return;
              }
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
              const fac = {
                id: body.id || `fac-${Date.now()}`,
                name: body.name || 'Emergency Facility',
                category: body.category || 'Relief Camp',
                distance: body.distance || 'Kamrup',
                contact: body.contact || '1077'
              };
              if (!data.facilities) data.facilities = [];
              data.facilities.unshift(fac);
              writeData(data);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: fac }));
              return;
            }
            if (method === 'DELETE') {
              const id = parsedUrl.searchParams.get('id');
              const index = parsedUrl.searchParams.get('index');
              if (index !== null && !isNaN(Number(index))) {
                data.facilities.splice(Number(index), 1);
              } else if (id) {
                data.facilities = (data.facilities || []).filter(f => f.id !== id && f.name !== id);
              }
              writeData(data);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
              return;
            }
          }

          // Weather
          if (pathname === '/api/admin/weather') {
            if (method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.weather || {} }));
              return;
            }
            if (method === 'POST') {
              data.weather = { ...data.weather, ...body };
              writeData(data);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.weather }));
              return;
            }
          }
        }
        next();
      });
    }
  };
}

function authorityBackendPlugin() {
  const dataPath = path.resolve(__dirname, 'server/authority/authorityData.json');
  const adminDataPath = path.resolve(__dirname, 'server/admin/adminData.json');

  function readData() {
    try {
      if (fs.existsSync(dataPath)) {
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      }
    } catch (e) {}
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
    } catch (e) {}
  }

  function syncFromAdminAreas(currentVillages) {
    try {
      if (fs.existsSync(adminDataPath)) {
        const adminData = JSON.parse(fs.readFileSync(adminDataPath, 'utf-8'));
        if (adminData && Array.isArray(adminData.areas)) {
          adminData.areas.forEach(area => {
            const exists = currentVillages.find(v => v.id === area.id || v.name.toLowerCase() === area.name.toLowerCase());
            if (!exists) {
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
    } catch (e) {}
    return currentVillages;
  }

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

          let data = readData();
          data.villages = syncFromAdminAreas(data.villages || []);

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
              const newReq = {
                id: body.id || `REQ-${Math.floor(210 + Math.random() * 80)}`,
                from: body.from || 'Field Relief Desk',
                village: body.village || 'Sector Lowland',
                items: body.items || 'Food & Medicine Buffer',
                urgency: body.urgency || 'High',
                status: body.status || 'Pending',
                reason: body.reason || 'Awaiting Authority Review',
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              };
              if (!data.requests) data.requests = [];
              data.requests.unshift(newReq);
              if (!data.logs) data.logs = [];
              data.logs.unshift({
                id: `LOG-${Date.now().toString(36).toUpperCase()}`,
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                actor: 'Ground / Relief Desk',
                note: `Filed resource request ${newReq.id} for ${newReq.village}.`
              });
              writeData(data);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: newReq }));
              return;
            }
            if (method === 'PATCH') {
              const { index, id, decision, reason } = body;
              const idx = (typeof index === 'number' && index >= 0)
                ? index
                : (data.requests || []).findIndex(r => r.id === id);

              if (idx >= 0 && data.requests && data.requests[idx]) {
                const reqItem = data.requests[idx];
                reqItem.status = decision || 'Approved';
                reqItem.reason = reason || 'Decision confirmed by District Authority (DDMA)';

                if (decision === 'Approved') {
                  const newAlloc = {
                    id: `ALC-${Math.floor(520 + Math.random() * 80)}`,
                    village: reqItem.village,
                    summary: reqItem.items,
                    godownStatus: 'Sent to Godown Manager • Preparing Dispatch',
                    deliveryProgress: 35,
                    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                  };
                  if (!data.allocations) data.allocations = [];
                  data.allocations.unshift(newAlloc);
                }

                if (!data.logs) data.logs = [];
                data.logs.unshift({
                  id: `LOG-${Date.now().toString(36).toUpperCase()}`,
                  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                  actor: 'District Authority (DDMA)',
                  note: `${decision} request ${reqItem.id} for ${reqItem.village}.`
                });

                writeData(data);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, data: reqItem }));
                return;
              }
              res.statusCode = 404;
              res.end(JSON.stringify({ success: false, error: 'Request not found' }));
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
              const newAlloc = {
                id: body.id || `ALC-${Math.floor(530 + Math.random() * 70)}`,
                village: body.village || 'Sector Village',
                summary: body.summary || 'Emergency Ration & Equipment Buffer',
                godownStatus: body.godownStatus || 'Sent to Godown Manager • Awaiting Dispatch',
                deliveryProgress: body.deliveryProgress || 35,
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              };
              if (!data.allocations) data.allocations = [];
              data.allocations.unshift(newAlloc);

              if (!data.logs) data.logs = [];
              data.logs.unshift({
                id: `LOG-${Date.now().toString(36).toUpperCase()}`,
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                actor: 'District Authority (DDMA)',
                note: `Direct allocation (${newAlloc.summary}) assigned to ${newAlloc.village}.`
              });

              writeData(data);
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
              const record = {
                id: `CORD-${Math.floor(105 + Math.random() * 90)}`,
                agency: body.agency || 'NDRF (1st Bn)',
                sector: body.sector || 'District Lowland',
                update: body.update || 'Emergency deployment recorded.',
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              };
              if (!data.coordinations) data.coordinations = [];
              data.coordinations.unshift(record);

              if (!data.logs) data.logs = [];
              data.logs.unshift({
                id: `LOG-${Date.now().toString(36).toUpperCase()}`,
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                actor: 'District Authority (DDMA)',
                note: `Logged ${record.agency} deployment update for ${record.sector}.`
              });

              writeData(data);
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
              const op = {
                id: `OP-${Math.floor(310 + Math.random() * 90)}`,
                title: body.title || 'Rescue Operation Update',
                status: body.status || 'Ongoing',
                summary: body.summary || 'Field personnel deployed.',
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              };
              if (!data.operations) data.operations = [];
              data.operations.unshift(op);

              if (!data.logs) data.logs = [];
              data.logs.unshift({
                id: `LOG-${Date.now().toString(36).toUpperCase()}`,
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                actor: 'District Authority (DDMA)',
                note: `Recorded rescue operation "${op.title}" (${op.status}).`
              });

              writeData(data);
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

export default defineConfig({
  plugins: [react(), adminBackendPlugin(), authorityBackendPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
