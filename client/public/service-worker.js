const CACHE_NAME = 'bustan-v1';
const RUNTIME_CACHE = 'bustan-runtime-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.png',
  '/logo.png',
  '/bustan-logo.png',
  '/og-image.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        console.log('Some files failed to cache during installation');
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip WebSocket upgrades
  if (request.headers.get('upgrade') === 'websocket') {
    return;
  }

  // Network first strategy for API calls and dynamic content
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = request.url.includes('/api/')
              ? RUNTIME_CACHE
              : CACHE_NAME;
            const clonedResponse = response.clone();
            caches.open(cache).then((c) => c.put(request, clonedResponse));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Return offline page for HTML requests
            if (request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/');
            }
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
        })
    );
  }
});

// Background sync for important actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncUserProgress());
  }
});

async function syncUserProgress() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    // Sync any pending updates when connection returns
    console.log('Syncing user progress...');
  } catch (error) {
    console.error('Error syncing progress:', error);
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});