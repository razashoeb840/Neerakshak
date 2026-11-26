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
              const villageClean = String(body.village || '').trim().toLowerCase();
              if (!data.allocations) data.allocations = [];
              let existing = data.allocations.find(a => 
                (a.village && a.village.trim().toLowerCase() === villageClean) ||
                (body.id && a.id === body.id)
              );

              if (existing) {
                existing.summary = body.summary || existing.summary;
                existing.godownStatus = body.godownStatus || 'Sent to Godown Manager • Awaiting Dispatch';
                existing.timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                if (body.vehicle) existing.vehicle = body.vehicle;
                if (body.driver) existing.driver = body.driver;
                if (!existing.timeline) existing.timeline = [];
                existing.timeline.unshift({
                  step: 'Allocation Order Adjusted',
                  time: 'Just now',
                  status: 'done',
                  detail: `Emergency supplies updated by District Authority to: ${existing.summary}`
                });

                if (!data.logs) data.logs = [];
                data.logs.unshift({
                  id: `LOG-${Date.now().toString(36).toUpperCase()}`,
                  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                  actor: 'District Authority (DDMA)',
                  note: `Updated allocation (${existing.summary}) for ${existing.village} (${existing.id}).`
                });

                writeData(data);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, data: existing }));
                return;
              }

              const newAlloc = {
                id: body.id || `ALC-${Math.floor(530 + Math.random() * 70)}`,
                village: body.village || 'Sector Village',
                summary: body.summary || 'Emergency Ration & Equipment Buffer',
                godownStatus: body.godownStatus || 'Sent to Godown Manager • Awaiting Dispatch',
                deliveryProgress: body.deliveryProgress || 35,
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              };
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

function godownBackendPlugin() {
  const dataPath = path.resolve(__dirname, 'server/godown/godownData.json');
  const authorityDataPath = path.resolve(__dirname, 'server/authority/authorityData.json');
  const adminDataPath = path.resolve(__dirname, 'server/admin/adminData.json');

  function readData() {
    try {
      if (fs.existsSync(dataPath)) {
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      }
    } catch (e) {}
    return { inventory: [], allocations: [], returns: [], movements: [], warehouses: [] };
  }

  function writeData(data) {
    try {
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {}
  }

  function syncAuthorityAllocationsToGodown(data) {
    try {
      let adminAreas = [];
      if (fs.existsSync(adminDataPath)) {
        try {
          const adm = JSON.parse(fs.readFileSync(adminDataPath, 'utf-8'));
          if (adm && Array.isArray(adm.areas)) adminAreas = adm.areas;
        } catch (e) {}
      }

      let authVillages = [];
      let authAllocations = [];
      if (fs.existsSync(authorityDataPath)) {
        try {
          const auth = JSON.parse(fs.readFileSync(authorityDataPath, 'utf-8'));
          if (auth && Array.isArray(auth.villages)) authVillages = auth.villages;
          if (auth && Array.isArray(auth.allocations)) authAllocations = auth.allocations;
        } catch (e) {}
      }

      function parseResourceSummary(summary) {
        const result = { boats: 2, jackets: 40, food: 350, meds: 50 };
        if (!summary) return result;
        const b = summary.match(/(\d+)\s*(?:Rescue\s*)?Boat/i);
        if (b) result.boats = Number(b[1]);
        const j = summary.match(/(\d+)\s*(?:Life\s*)?Jacket/i);
        if (j) result.jackets = Number(j[1]);
        const f = summary.match(/(\d+)\s*(?:Dry\s*Ration\s*)?Food/i);
        if (f) result.food = Number(f[1]);
        const m = summary.match(/(\d+)\s*(?:Essential\s*)?Med/i);
        if (m) result.meds = Number(m[1]);
        return result;
      }

      const syncedAllocations = [];

      authAllocations.forEach((authAlloc, idx) => {
        const destName = (authAlloc.village || authAlloc.villageName || 'Sector Village').trim();
        const key = destName.toLowerCase();

        const areaMatch = adminAreas.find(a => (a.name || '').trim().toLowerCase() === key) ||
          authVillages.find(v => (v.name || '').trim().toLowerCase() === key);

        const lat = areaMatch ? Number(areaMatch.lat) : 26.132;
        const lng = areaMatch ? Number(areaMatch.lng) : 91.515;
        const severity = areaMatch ? (areaMatch.severity || 'Critical') : 'Critical';
        const block = areaMatch ? (areaMatch.block || 'Kamrup Circle') : 'Kamrup Circle';

        const isDispatched = String(authAlloc.godownStatus || '').toLowerCase().includes('in transit') ||
          String(authAlloc.godownStatus || '').toLowerCase().includes('departed') ||
          String(authAlloc.godownStatus || '').toLowerCase().includes('delivered') ||
          String(authAlloc.godownStatus || '').toLowerCase().includes('dispatched');

        const isShortage = String(authAlloc.godownStatus || '').toLowerCase().includes('shortage');

        const needs = parseResourceSummary(authAlloc.summary);

        const existing = (data.allocations || []).find(a => 
          (a.id && a.id === authAlloc.id) ||
          (a.destination && a.destination.trim().toLowerCase() === key)
        );

        const status = isDispatched ? 'Dispatched' : (isShortage ? 'Shortage Flagged' : (existing?.status === 'Dispatched' ? 'Dispatched' : 'Pending Dispatch'));

        syncedAllocations.push({
          id: authAlloc.id || `ALC-${501 + idx}`,
          destination: destName,
          block: block,
          severity: severity,
          lat: lat,
          lng: lng,
          summary: authAlloc.summary || `${needs.boats} Boats, ${needs.jackets} Jackets, ${needs.food} Food, ${needs.meds} Meds`,
          needs: needs,
          assignedGodown: authAlloc.assignedGodown || existing?.assignedGodown || 'Central Relief Godown – Mirza',
          status: status,
          vehicle: existing?.vehicle || authAlloc.vehicle || 'Heavy Truck AS-01-EC-4210',
          driver: existing?.driver || authAlloc.driver || 'Rajesh Das (+91 98640-21943)',
          escortOfficer: existing?.escortOfficer || authAlloc.escortOfficer || 'ASI D. Kalita (District Police)',
          refNo: (status === 'Dispatched') ? (existing?.refNo && existing.refNo !== '—' ? existing.refNo : (authAlloc.refNo || 'DSP-2026-884')) : '—',
          dispatchTime: (status === 'Dispatched') ? (existing?.dispatchTime && existing.dispatchTime !== '—' ? existing.dispatchTime : (authAlloc.timestamp || 'Today, 09:45 AM')) : '—',
          progress: (status === 'Dispatched') ? 75 : 20
        });
      });

      data.allocations = syncedAllocations;
      writeData(data);
    } catch (e) {}
    return data;
  }

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
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

          if (method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          let data = readData();
          data = syncAuthorityAllocationsToGodown(data);

          // Full Godown state
          if (pathname === '/api/godown' && method === 'GET') {
            const inventory = data.inventory || [];
            const allocations = data.allocations || [];
            const totalUnits = inventory.reduce((s, i) => s + (Number(i.total) || 0), 0);
            const availUnits = inventory.reduce((s, i) => s + (Number(i.available) || 0), 0);
            const allocUnits = inventory.reduce((s, i) => s + (Number(i.allocated) || 0), 0);
            const dispUnits = inventory.reduce((s, i) => s + (Number(i.dispatched) || 0), 0);
            const lowStockItems = inventory.filter(i => (Number(i.available) || 0) <= (Number(i.minLimit) || 0));
            const pendingDispatches = allocations.filter(a => a.status !== 'Dispatched');

            const result = {
              portal: 'Central Relief Godown & Logistics Hub',
              status: 'active',
              kpis: {
                totalResources: totalUnits,
                availableStock: availUnits,
                allocatedStock: allocUnits,
                dispatchedStock: dispUnits,
                lowStockCount: lowStockItems.length,
                pendingDispatchCount: pendingDispatches.length
              },
              ...data
            };
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: result }));
            return;
          }

          let body = {};
          if (method === 'POST' || method === 'PUT') {
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
              const qty = Number(body.qty || body.total) || 10;
              const minLimit = Number(body.minLimit) || 20;
              const newItem = {
                id: body.id || `INV-${String((data.inventory || []).length + 1).padStart(2, '0')}`,
                name: body.name || 'Emergency Relief Unit',
                category: body.category || 'Rescue Equipment',
                warehouse: body.warehouse || 'Central Relief Godown – Mirza',
                total: qty,
                available: qty,
                allocated: 0,
                dispatched: 0,
                minLimit,
                condition: qty <= minLimit ? 'Low Stock' : 'Good'
              };
              if (!data.inventory) data.inventory = [];
              data.inventory.unshift(newItem);
              if (!data.movements) data.movements = [];
              data.movements.unshift({
                time: body.date || 'Just now',
                type: 'STOCK IN',
                item: `${qty} ${newItem.name}`,
                party: `From: ${body.supplier || 'State SDMA Supply'}`,
                note: `Added to ${newItem.warehouse}`
              });
              writeData(data);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: newItem }));
              return;
            }
            if (method === 'PUT') {
              const idx = (typeof body.index === 'number' && body.index >= 0)
                ? body.index
                : (data.inventory || []).findIndex(i => i.id === body.id || i.name === body.name);
              if (idx >= 0 && data.inventory && data.inventory[idx]) {
                const item = data.inventory[idx];
                if (body.available !== undefined) item.available = Number(body.available);
                if (body.condition) item.condition = body.condition;
                if (!data.movements) data.movements = [];
                data.movements.unshift({
                  time: 'Just now',
                  type: 'CORRECTION',
                  item: `${item.name} (Avail: ${item.available})`,
                  party: item.warehouse,
                  note: `Condition: ${item.condition} • Reason: ${body.reason || 'Physical audit'}`
                });
                writeData(data);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, data: item }));
                return;
              }
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
            const idx = (typeof body.allocIndex === 'number' && body.allocIndex >= 0)
              ? body.allocIndex
              : (data.allocations || []).findIndex(a => a.id === body.allocId);

            if (idx >= 0 && data.allocations && data.allocations[idx]) {
              const alloc = data.allocations[idx];
              const qty = Number(body.qty) || alloc.qty;
              const refNo = body.refNo || `DSP-2026-${Math.floor(880 + Math.random() * 90)}`;
              const vehicle = body.vehicle || alloc.vehicle || 'AS-01-GC-4821';

              alloc.status = 'Dispatched';
              alloc.vehicle = vehicle;
              alloc.dispatchTime = body.dispatchTime || 'Just now';
              alloc.refNo = refNo;

              const invItem = (data.inventory || []).find(i => i.id === alloc.resourceId);
              if (invItem) {
                invItem.available = Math.max(0, invItem.available - qty);
                invItem.allocated = Math.max(0, invItem.allocated - qty);
                invItem.dispatched = (invItem.dispatched || 0) + qty;
              }

              if (!data.movements) data.movements = [];
              data.movements.unshift({
                time: 'Just now',
                type: 'DISPATCH',
                item: `${qty} ${alloc.resourceName}`,
                party: `To: ${body.dest || alloc.destination}`,
                note: `Ref: ${refNo} • Vehicle ${vehicle}`
              });

              writeData(data);

              // Update authorityData.json
              try {
                if (fs.existsSync(authorityDataPath)) {
                  const auth = JSON.parse(fs.readFileSync(authorityDataPath, 'utf-8'));
                  const targetAuth = (auth.allocations || []).find(a => 
                    (a.id && a.id === alloc.id.split('-')[0]) ||
                    (a.village && a.village.toLowerCase() === String(alloc.destination || '').toLowerCase())
                  );
                  if (targetAuth) {
                    targetAuth.godownStatus = `Dispatched (${refNo}) • En-Route`;
                    targetAuth.deliveryProgress = 75;
                    if (!targetAuth.timeline) targetAuth.timeline = [];
                    targetAuth.timeline.unshift({
                      step: 'Departed Central Godown',
                      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                      status: 'done',
                      detail: `Gate-pass #${refNo} issued; vehicle ${vehicle} departed Central Godown.`
                    });
                    fs.writeFileSync(authorityDataPath, JSON.stringify(auth, null, 2), 'utf-8');
                  }
                }
              } catch (e) {}

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: { allocation: alloc, refNo } }));
              return;
            }
          }

          // Shortage
          if (pathname === '/api/godown/shortage' && method === 'POST') {
            const idx = (typeof body.index === 'number' && body.index >= 0)
              ? body.index
              : (data.allocations || []).findIndex(a => a.id === body.id);
            if (idx >= 0 && data.allocations && data.allocations[idx]) {
              const alloc = data.allocations[idx];
              alloc.status = 'Shortage Flagged';
              if (!data.movements) data.movements = [];
              data.movements.unshift({
                time: 'Just now',
                type: 'SHORTAGE ALERT',
                item: `${alloc.resourceName} (Req: ${alloc.qty})`,
                party: `For: ${alloc.destination}`,
                note: `Shortage flagged to DDMA: ${body.reason || 'Physical deficit'}`
              });
              writeData(data);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: alloc }));
              return;
            }
          }

          // Returns
          if (pathname === '/api/godown/returns') {
            if (method === 'GET') {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: data.returns || [] }));
              return;
            }
            if (method === 'POST') {
              const { resourceId, from, good, damaged, missing } = body;
              const goodQty = Number(good) || 0;
              const invItem = (data.inventory || []).find(i => i.id === resourceId);
              if (invItem && goodQty > 0) {
                invItem.available += goodQty;
              }
              const ret = {
                id: `RET-${Math.floor(305 + Math.random() * 90)}`,
                resourceId,
                resourceName: invItem ? invItem.name : 'Rescue Resource',
                from: from || 'Field Sector',
                good: goodQty,
                damaged: Number(damaged) || 0,
                missing: Number(missing) || 0,
                date: 'Just now'
              };
              if (!data.returns) data.returns = [];
              data.returns.unshift(ret);
              writeData(data);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: ret }));
              return;
            }
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

export default defineConfig({
  plugins: [react(), adminBackendPlugin(), authorityBackendPlugin(), godownBackendPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
