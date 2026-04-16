const CACHE_NAME = 'rurallearn-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Cache First Strategy for GET requests, Network Fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache hit
        }
        return fetch(event.request).then(
          function(res) {
            if(!res || res.status !== 200 || res.type !== 'basic') {
              return res;
            }
            if(!event.request.url.includes('/api/')) {
               var responseToCache = res.clone();
               caches.open(CACHE_NAME)
                 .then(function(cache) {
                   cache.put(event.request, responseToCache);
                 });
            }
            return res;
          }
        );
      })
  );
});
