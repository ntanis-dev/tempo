import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { serviceWorkerManager } from './services/serviceWorker';

// Re-export for components that were using these
export { setUpdateCallback, refreshApp } from './services/serviceWorker';

// Register service worker
serviceWorkerManager.register();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
