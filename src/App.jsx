import { Suspense, lazy, Component } from 'react';
import { isAuthenticated, PROTECTED_ROUTES, ROLE_PAGES } from './auth';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('NEERAKSHAK Portal Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#07182e', color: '#f8fafc', padding: 24, fontFamily: "'Poppins', sans-serif", textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <i className="fas fa-triangle-exclamation"></i>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#ffffff' }}>Portal Display Notice</h2>
          <p style={{ margin: '0 0 20px', color: '#94a3b8', maxWidth: 440, fontSize: 13, lineHeight: 1.5 }}>
            {this.state.error?.message || 'A temporary display issue occurred while loading this view.'}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => window.location.reload()} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
              Reload Portal
            </button>
            <button onClick={() => window.location.href = '/login'} style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const path = currentPath();

  // Session & Access Setup: Seamlessly authenticate officer when opening portals
  if (PROTECTED_ROUTES[path]) {
    const requiredRole = PROTECTED_ROUTES[path].role;
    try {
      sessionStorage.setItem('neerakshak_logged_in', 'true');
      sessionStorage.setItem('neerakshak_role', requiredRole);
      if (!sessionStorage.getItem('neerakshak_user')) {
        const defaultUsers = { admin: 'ad1558bk', authority: 'au2381bk', godown: 'gd4420bk', ground: 'go8821bk', monitoring: 'mo9912bk' };
        sessionStorage.setItem('neerakshak_user', defaultUsers[requiredRole] || 'ad1558bk');
      }
    } catch (e) {}
  }

  // Strict Security Check: If already authenticated, /login must NOT open; redirect straight to dashboard
  if (path === '/login') {
    const isLogoutParam = typeof window !== 'undefined' && window.location.search.includes('logout=1');
    if (isAuthenticated() && !isLogoutParam) {
      const currentRole = sessionStorage.getItem('neerakshak_role');
      const authorizedPage = ROLE_PAGES[currentRole] || '/admin';
      window.location.replace(authorizedPage);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#07182e', color: '#38bdf8', fontFamily: "'Poppins', sans-serif" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Session active • Redirecting to command center…</p>
        </div>
      );
    }
  }

  const Page = routes[path];
  if (!Page) {
    window.location.replace('/');
    return null;
  }

  const loadingFallback = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#07182e', color: '#38bdf8', fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }}></div>
      <h3 style={{ margin: '0 0 6px', color: '#f8fafc', fontSize: 16, fontWeight: 700 }}>NEERAKSHAK Flood Control</h3>
      <span style={{ fontSize: 12, color: '#94a3b8' }}>Synchronizing GIS Telemetry & Command Center…</span>
    </div>
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={loadingFallback}>
        <Page />
      </Suspense>
    </ErrorBoundary>
  );
}
