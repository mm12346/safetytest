// Service Worker for FixFlow PWA

const CACHE_NAME = 'fixflow-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png', // Make sure you have this icon file
  // Add other critical assets you want to cache for offline use
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;700&display=swap',
  'https://fonts.gstatic.com/s/kanit/v15/nKKX-Go_rpPzWzF.woff2', // Example font file
  'https://unpkg.com/lucide@latest'
];

// Install event: caches essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serves cached content when offline, or fetches from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).catch(() => {
          // If network fails, and it's a navigation request,
          // you might want to return an offline page.
          // For simplicity, we'll just let it fail for now.
          console.log('Network request failed and no cache match for:', event.request.url);
        });
      })
  );
});

// Activate event: cleans up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event (optional, if you implement push notifications)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  console.log('Push received:', data);

  const title = data.title || 'FixFlow Notification';
  const options = {
    body: data.body || 'You have a new update.',
    icon: './icon-192.png', // Icon for the notification
    badge: './icon-72.png' // Badge icon (for Android)
    // You can add more options like vibrate, data, actions etc.
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event (optional, if you implement push notifications)
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification

  // Open a specific URL when the notification is clicked
  event.waitUntil(
    clients.openWindow(event.notification.data.url || './index.html')
  );
});
