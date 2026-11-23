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

export default defineConfig({
  plugins: [react(), adminBackendPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
