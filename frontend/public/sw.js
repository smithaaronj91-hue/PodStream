const CACHE_NAME = 'podstream-v1';
const STATIC_ASSETS = [
    '/',
    '/discover',
    '/manifest.json',
    '/offline.html',
];

// Video cache - limited to prevent storage bloat
const VIDEO_CACHE_NAME = 'podstream-videos-v1';
const MAX_VIDEO_CACHE_SIZE = 50; // MB

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== VIDEO_CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // API requests - network only
    if (url.pathname.startsWith('/api')) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(JSON.stringify({ error: 'Offline' }), {
                    headers: { 'Content-Type': 'application/json' },
                });
            })
        );
        return;
    }

    // Video requests - cache with size limit
    if (request.destination === 'video') {
        event.respondWith(
            caches.open(VIDEO_CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(request);
                if (cachedResponse) return cachedResponse;

                const networkResponse = await fetch(request);
                // Only cache small preview videos
                const contentLength = networkResponse.headers.get('content-length');
                if (contentLength && parseInt(contentLength) < 10 * 1024 * 1024) {
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            })
        );
        return;
    }

    // Static assets - cache first
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(request)
                .then((networkResponse) => {
                    // Cache successful responses
                    if (networkResponse.ok) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Offline fallback for navigation requests
                    if (request.mode === 'navigate') {
                        return caches.match('/offline.html');
                    }
                });
        })
    );
});

// Background sync for likes/follows when back online
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-interactions') {
        event.waitUntil(syncInteractions());
    }
});

async function syncInteractions() {
    // Get pending interactions from IndexedDB and sync them
    console.log('Syncing interactions...');
}

// Push notifications
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};

    const options = {
        body: data.body || 'New activity on PodStream',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
        },
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'dismiss', title: 'Dismiss' },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'PodStream', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Focus existing window or open new one
            for (const client of clientList) {
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
