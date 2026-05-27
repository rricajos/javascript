// Service Worker for Super JavaScript Brain (SJSB)
const CACHE_NAME = 'sjsb-v5';

// Shell assets only — topic .js files are cached on-demand via fetch handler
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/btn.css',
  './css/banner.css',
  './css/search-box.css',
  './css/cubes.css',
  './css/sections.css',
  './js/banner.js',
  './js/sections.js'
];

// Install: cache all assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (name) {
          return name !== CACHE_NAME;
        }).map(function (name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function (event) {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request).then(function (response) {
      // Update cache with fresh response
      if (response.ok) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function () {
      // Offline: serve from cache
      return caches.match(event.request).then(function (cached) {
        return cached || new Response('Offline - content not cached', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});
