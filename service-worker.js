// Service Worker for SQL Job Monitor PWA
const CACHE_NAME = 'sql-job-monitor-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/api.js',
    '/js/config.js',
    '/js/notifications.js',
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Installed successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Clearing old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip cross-origin requests
    if (!request.url.startsWith(self.location.origin)) {
        // For API requests, use network-first strategy
        event.respondWith(
            fetch(request)
                .catch(() => {
                    console.log('Service Worker: Network request failed, no cache available');
                    return new Response(JSON.stringify({ error: 'Offline' }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // Cache-first strategy for local resources
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', request.url);
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Add to cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed', error);
                        
                        // Return offline page or error response
                        return new Response('Offline - Please check your connection', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background Sync event (for future implementation)
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'sync-jobs') {
        event.waitUntil(
            syncJobs()
        );
    }
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    let data = { title: 'SQL Job Monitor', body: 'New notification', icon: '/assets/icons/icon-192x192.png' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-96x96.png',
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: [
            {
                action: 'view',
                title: 'View Details'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event.action);
    
    event.notification.close();

    if (event.action === 'view') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message event - handle messages from the app
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

// Helper function for background sync
async function syncJobs() {
    try {
        // This would fetch jobs and update the cache
        // Implementation depends on your API structure
        console.log('Service Worker: Syncing jobs in background');
        
        // Example: fetch and cache jobs
        const response = await fetch('/api/jobs');
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put('/api/jobs', response);
            console.log('Service Worker: Jobs synced successfully');
        }
    } catch (error) {
        console.error('Service Worker: Sync failed', error);
    }
}

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic sync', event.tag);
    
    if (event.tag === 'update-jobs') {
        event.waitUntil(syncJobs());
    }
});

console.log('Service Worker: Loaded successfully');
