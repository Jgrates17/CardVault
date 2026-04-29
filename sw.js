const CACHE_NAME = 'cardvault-v6';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/router.js',
  './js/pages/collection.js',
  './js/pages/addcard.js',
  './js/pages/detail.js',
  './js/pages/portfolio.js',
  './js/pages/search.js',
  './js/services/pricing.js',
  './js/services/csv.js',
  './js/services/imageutil.js',
  './js/services/ocr.js',
  './manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
