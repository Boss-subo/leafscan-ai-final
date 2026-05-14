const CACHE_NAME = 'leafscan-sovereign-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/src/main.js',
  '/src/style.css',
  '/libs/lucide.min.js',
  // AI Models are cached dynamically to save initial bandwidth
];

// 1. Install Phase: Cache Core UI
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activation: Purge Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 3. Fetch Strategy: Cache-First for UI, Network-First for Data
self.addEventListener('fetch', (event) => {
  // Skip API calls and Firebase
  if (event.request.url.includes('api') || event.request.url.includes('firebase')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        // Cache new assets (like models) as they are downloaded
        if (event.request.url.includes('.json') || event.request.url.includes('.bin')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
