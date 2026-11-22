import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// No <StrictMode>: the portal logic (moved over unchanged from the HTML files) must run exactly once per page.
createRoot(document.getElementById('root')).render(<App />);
