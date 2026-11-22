// Official NEERAKSHAK Route Guard & Session Security Module

export const PROTECTED_ROUTES = {
  '/admin': { role: 'admin', name: 'District Admin Portal' },
  '/authority': { role: 'authority', name: 'District Authority Portal' },
  '/godown': { role: 'godown', name: 'Central Relief Godown' },
  '/ground-officer': { role: 'ground', name: 'Ground Officer Portal' },
  '/monitoring': { role: 'monitoring', name: 'State DEOC Auditor' }
};

export const ROLE_PAGES = {
  admin: '/admin',
  authority: '/authority',
  godown: '/godown',
  ground: '/ground-officer',
  monitoring: '/monitoring'
};

/**
 * Validates whether the active session is genuinely logged in.
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  try {
    const isLogged = sessionStorage.getItem('neerakshak_logged_in');
    const role = sessionStorage.getItem('neerakshak_role');
    const user = sessionStorage.getItem('neerakshak_user');
    return isLogged === 'true' && Boolean(role) && Boolean(user);
  } catch (e) {
    return false;
  }
}

/**
 * Returns current authenticated user information.
 */
export function getCurrentUser() {
  if (!isAuthenticated()) return null;
  return {
    role: sessionStorage.getItem('neerakshak_role'),
    user: sessionStorage.getItem('neerakshak_user')
  };
}

/**
 * Universal secure logout: wipes all operational session tokens and redirects.
 * Uses window.location.replace so history stack cannot navigate back into the portal.
 */
export function logout() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.clear();
    sessionStorage.setItem('neerakshak_logged_out', '1');
  } catch (e) {}
  window.location.replace('/login?logout=1');
}

// Make logout globally available for legacy scripts and buttons
if (typeof window !== 'undefined') {
  window.neerakshakLogout = logout;
}

/**
 * Automatically redirects an already authenticated officer away from the login page
 * directly to their active role dashboard.
 */
export function redirectIfAuthenticated() {
  if (typeof window === 'undefined') return false;
  try {
    const isLogoutParam = window.location.search.includes('logout=1');
    if (isAuthenticated() && !isLogoutParam) {
      const currentRole = sessionStorage.getItem('neerakshak_role');
      const targetDashboard = ROLE_PAGES[currentRole] || '/admin';
      window.location.replace(targetDashboard);
      return true;
    }
  } catch (e) {}
  return false;
}

/**
 * Strict verification helper to protect specific dashboard roles.
 */
export function verifyPageAccess(expectedRole) {
  if (typeof window === 'undefined') return true;

  if (!isAuthenticated()) {
    window.location.replace('/login?auth_required=1');
    return false;
  }

  const currentRole = sessionStorage.getItem('neerakshak_role');
  if (expectedRole && currentRole !== expectedRole) {
    const targetPage = ROLE_PAGES[currentRole] || '/login?auth_required=1';
    window.location.replace(targetPage);
    return false;
  }

  return true;
}

/**
 * Guard against Browser bfcache (Back/Forward Cache) and PopState History Navigation.
 * If user presses Back button after logout, this immediately kicks them back to /login.
 */
export function setupRouteGuard(expectedRole) {
  if (typeof window === 'undefined') return () => {};

  const handleSecurityCheck = () => {
    if (!isAuthenticated()) {
      window.location.replace('/login?auth_required=1');
    } else if (expectedRole && sessionStorage.getItem('neerakshak_role') !== expectedRole) {
      const targetPage = ROLE_PAGES[sessionStorage.getItem('neerakshak_role')] || '/login';
      window.location.replace(targetPage);
    }
  };

  // Immediate check on mount
  if (!verifyPageAccess(expectedRole)) {
    return () => {};
  }

  window.addEventListener('pageshow', handleSecurityCheck);
  window.addEventListener('popstate', handleSecurityCheck);

  return () => {
    window.removeEventListener('pageshow', handleSecurityCheck);
    window.removeEventListener('popstate', handleSecurityCheck);
  };
}
