// (2026-07-13) Bump cache v2 and network-first strategy; was cache-first
const CACHE_NAME = 'pikol-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/data.js',
  './js/auth.js',
  './js/booking.js',
  './js/community.js',
  './js/referee.js',
  './js/admin.js',
  './js/main.js',
  './assets/pikol-logo.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// (2026-07-13) Network-first strategy with cache fallback; was cache-first
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          try { cache.put(event.request, clone); } catch (_) {}
        });
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
