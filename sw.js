// Service Worker for Super JavaScript Brain (SJSB)
const CACHE_NAME = 'sjsb-v2';

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
  './js/sections.js',
  './js/variables_and_types.js',
  './js/operator_aritmetical.js',
  './js/operator_assignative.js',
  './js/operator_logical.js',
  './js/operator_conditional.js',
  './js/control_flow.js',
  './js/closures_and_scope.js',
  './js/functions.js',
  './js/strings.js',
  './js/regex.js',
  './js/json_and_dates.js',
  './js/destructuring_and_spread.js',
  './js/dom_manipulation.js',
  './js/data_collections_arrays.js',
  './js/data_collections_objects.js',
  './js/error_handling.js',
  './js/promises_and_async.js',
  './js/fetch_api.js',
  './js/modules.js',
  './js/web_storage.js',
  './js/web_apis.js',
  './js/dom_events.js',
  './js/web_components.js',
  './js/event_loop.js',
  './js/iterators_generators.js',
  './js/classes_and_oop.js',
  './js/proxy_and_reflect.js',
  './js/memory_and_performance.js',
  './js/testing_basics.js'
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
