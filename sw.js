const CACHE_NAME = 'multi-sheet-checker-v1';
const urlsToCache = [
    '/',
    '/index.html', // Assuming the HTML file is named index.html
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap',
    'https://fonts.gstatic.com/s/sarabun/v15/DtVjJx26T-Uz-FKzZB_H9xL8dC1JzD_hJ-8.woff2', // Sarabun font WOFF2
    '/icons/icon-192x192.png', // Placeholder, replace with actual icon paths
    '/icons/icon-512x512.png',
    '/icons/apple-touch-icon-180x180.png',
    '/icons/favicon-32x32.png',
    '/icons/favicon-16x16.png'
    // Add other assets you want to cache (e.g., images, other JS files)
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache during install:', error);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Check if the request is for the Google Apps Script URL.
    // We should not cache API responses directly as they change frequently.
    if (event.request.url.includes('script.google.com/macros/s/')) {
        event.respondWith(fetch(event.request)); // Always go to network for API calls
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and can only be consumed once. We must clone it so that
                        // the browser can consume the original response and the cache
                        // can consume the cloned one.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
            .catch(error => {
                console.error('Error in fetch handler:', error);
                // You could return a custom offline page here if needed
                // return caches.match('/offline.html'); 
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
