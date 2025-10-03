const CACHE_NAME = 'tempo-v2.0.2';
const STATIC_CACHE = 'tempo-static-v2.0.2';
const DYNAMIC_CACHE = 'tempo-dynamic-v2.0.2';

// Static assets that should be cached immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png'
];

// Install event - cache static resources immediately
self.addEventListener('install', (event) => {
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Don't skip waiting on install - let the old SW handle current clients
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Cache addAll failed:', error);
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Don't automatically claim - let user decide when to update
      Promise.resolve()
    ]).then(() => {
      
      // Service worker activated successfully
    })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip dashboard and API routes - don't cache them
  if (url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/health') ||
      url.pathname === '/dashboard.html') {
    return;
  }

  event.respondWith(
    // For HTML documents (pages), check if it's root or a 404
    (request.destination === 'document' || request.url.endsWith('.html') || request.mode === 'navigate')
      ? url.pathname === '/'
        // Root path: use cache-first strategy
        ? caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                // Background update check for root
                fetch(request)
                  .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                      const responseClone = networkResponse.clone();
                      caches.open(STATIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                      });
                    }
                  })
                  .catch(() => {});

                return cachedResponse;
              }

              // Not cached, fetch from network
              return fetch(request)
                .then((networkResponse) => {
                  if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(STATIC_CACHE).then((cache) => {
                      cache.put(request, responseClone);
                    });
                  }
                  return networkResponse;
                })
                .catch(() => {
                  throw new Error('Network failed and no cache available');
                });
            })
        // Non-root path: always fetch from network to get 404 response
        : fetch(request)
            .catch(() => {
              // If offline, serve cached index.html with 404 detection in the app
              return caches.match('/index.html');
            })
      : caches.match(request)
          .then((cachedResponse) => {
            // If we have a cached version, serve it immediately
            if (cachedResponse) {

              // For HTML files (like root), also check for updates in the background
              if (request.destination === 'document' || request.url.endsWith('.html') || request.mode === 'navigate') {
                // Background update check
                fetch(request)
                  .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                      // Update cache with new version
                      const responseClone = networkResponse.clone();
                      caches.open(STATIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                      });
                    }
                  })
                  .catch(() => {
                    // Network failed, but we have cache - that's fine
                  });
              }

              return cachedResponse;
            }
        
        // No cached version, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response before caching
            const responseToCache = networkResponse.clone();

            // Determine which cache to use
            const cacheToUse = STATIC_ASSETS.some(asset =>
              request.url.endsWith(asset) || request.url === self.location.origin + asset
            ) ? STATIC_CACHE : DYNAMIC_CACHE;

            // Cache the response
            caches.open(cacheToUse).then((cache) => {
              cache.put(request, responseToCache);
            });

            return networkResponse;
          })
          .catch(() => {
            // Network failed and no cache - return offline page or error
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            throw new Error('Network failed and no cache available');
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  // Handle push notifications if needed in the future
});