import { TIME } from '../constants';

interface ServiceWorkerState {
  currentSW: ServiceWorker | null;
  waitingSW: ServiceWorker | null;
  updateCallback: (() => void) | null;
}

class ServiceWorkerManager {
  private state: ServiceWorkerState = {
    currentSW: null,
    waitingSW: null,
    updateCallback: null
  };

  public setUpdateCallback(callback: () => void): void {
    this.state.updateCallback = callback;
  }

  public async refreshApp(): Promise<void> {
    if (this.state.waitingSW) {
      // Tell the waiting SW to skip waiting and become active
      this.state.waitingSW.postMessage({ type: 'SKIP_WAITING' });
    }

    // Reload the page when user requests update
    setTimeout(() => {
      window.location.reload();
    }, TIME.APP_REFRESH_DELAY);
  }

  private checkForUpdates(): void {
    if (!navigator.onLine) return; // Only check when online

    if (this.state.waitingSW && this.state.updateCallback) {
      this.state.updateCallback();
    }
  }

  public register(): void {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator &&
        !window.location.hostname.includes('webcontainer-api.io')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW: Registered successfully');

            // Store current active service worker
            this.state.currentSW = registration.active;

            // Check for waiting service worker (update ready)
            if (registration.waiting) {
              this.state.waitingSW = registration.waiting;
              this.checkForUpdates();
            }

            // Listen for new service worker installing
            registration.addEventListener('updatefound', () => {
              console.log('SW: Update found');
              const newWorker = registration.installing;

              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  console.log('SW: State changed to', newWorker.state);

                  if (newWorker.state === 'installed') {
                    if (this.state.currentSW) {
                      // New service worker is waiting
                      console.log('SW: New version waiting');
                      this.state.waitingSW = newWorker;
                      this.checkForUpdates();
                    } else {
                      // First install
                      console.log('SW: First install');
                      this.state.currentSW = newWorker;
                    }
                  } else if (newWorker.state === 'activated') {
                    console.log('SW: Activated');
                    this.state.currentSW = newWorker;
                    this.state.waitingSW = null;
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
  }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Export convenience methods
export const setUpdateCallback = (callback: () => void) =>
  serviceWorkerManager.setUpdateCallback(callback);

export const refreshApp = () =>
  serviceWorkerManager.refreshApp();