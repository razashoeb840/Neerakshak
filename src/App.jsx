import { Suspense, lazy } from 'react';

// One route per original HTML page. Each page is loaded only when it is opened.
const routes = {
  '/': lazy(() => import('./pages/home/Home.jsx')),                              // 1index.html
  '/admin': lazy(() => import('./pages/admin/Admin.jsx')),                       // 2admin.html
  '/authority': lazy(() => import('./pages/authority/Authority.jsx')),           // 3authority.html
  '/godown': lazy(() => import('./pages/godown/Godown.jsx')),                    // 4godown.html
  '/ground-officer': lazy(() => import('./pages/ground-officer/GroundOfficer.jsx')), // 5groundofficer.html
  '/monitoring': lazy(() => import('./pages/monitoring/Monitoring.jsx')),        // 6monitoring.html
  '/login': lazy(() => import('./pages/login/Login.jsx')),                       // login.html
};

// Old file names still work, e.g. /2admin.html -> /admin
const legacy = {
  '/1index.html': '/', '/index.html': '/', '/2admin.html': '/admin', '/3authority.html': '/authority',
  '/4godown.html': '/godown', '/5groundofficer.html': '/ground-officer', '/6monitoring.html': '/monitoring',
  '/login.html': '/login',
};

function currentPath() {
  const p = window.location.pathname.replace(/\/+$/, '') || '/';
  return legacy[p] || p;
}

export default function App() {
  const Page = routes[currentPath()];
  if (!Page) {
    window.location.replace('/');
    return null;
  }
  return (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  );
}
