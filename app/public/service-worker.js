// Service worker — network-first, auto-update strategy
// Ensures the installed PWA always gets the latest content from the server

// Skip waiting immediately so new SW version takes over right away
self.addEventListener('install', () => {
    self.skipWaiting();
});

// Claim all open clients so the new SW controls them without a manual reload
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            // Clear all old caches to avoid stale content
            return Promise.all(
                cacheNames.map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Network-first strategy: always try the server, never serve stale cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and chrome-extension URLs
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            // Only fall back to cached index.html for navigation requests (SPA routing)
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
        })
    );
});

// Listen for messages from the app to force reload all clients
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
