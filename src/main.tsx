import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TIME } from './constants';

// Track service worker state
let currentSW: ServiceWorker | null = null;
let waitingSW: ServiceWorker | null = null;
let updateCallback: (() => void) | null = null;

// Function to set the update callback
export const setUpdateCallback = (callback: () => void) => {
  updateCallback = callback;
};

// Function to manually refresh
export const refreshApp = () => {
  if (waitingSW) {
    // Tell the waiting SW to skip waiting and become active
    waitingSW.postMessage({ type: 'SKIP_WAITING' });
  }
  
  // Reload the page when user requests update
  setTimeout(() => {
    window.location.reload();
  }, TIME.APP_REFRESH_DELAY);
};

// Function to check for updates when online
const checkForUpdates = () => {
  if (!navigator.onLine) return; // Only check when online
  
  if (waitingSW && updateCallback) {
    updateCallback();
  }
};

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && 
    !window.location.hostname.includes('webcontainer-api.io')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW: Registered successfully');
        
        // Store current active service worker
        currentSW = registration.active;
        
        // Check for waiting service worker (update ready)
        if (registration.waiting) {
          waitingSW = registration.waiting;
          checkForUpdates();
        }
        
        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          console.log('SW: Update found');
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('SW: State changed to', newWorker.state);
              
              if (newWorker.state === 'installed') {
                if (currentSW) {
                  // New service worker is waiting
                  console.log('SW: New version waiting');
                  waitingSW = newWorker;
                  checkForUpdates();
                } else {
                  // First install
                  console.log('SW: First install');
                  currentSW = newWorker;
                }
              } else if (newWorker.state === 'activated') {
                console.log('SW: Activated');
                currentSW = newWorker;
                waitingSW = null;
              }
            });
          }
        });
        
      })
      .catch((error) => {
        console.error('SW: Registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
