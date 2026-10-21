// v2: la v1 servía siempre la copia guardada y los usuarios nunca recibían versiones nuevas
const CACHE_NAME = 'radiant-ris-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/ris_logo.png',
  '/ris_logo.svg',
  '/favicon.svg',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Solo GET y nada de la API
  if (e.request.method !== 'GET' || e.request.url.includes('/api/')) {
    return;
  }
  // Primero la red (así siempre llega la versión nueva); la copia guardada solo sin conexión
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && e.request.url.startsWith(self.location.origin)) {
          const copia = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copia));
        }
        return networkResponse;
      })
      .catch(() =>
        caches.match(e.request).then((guardada) => guardada || (e.request.mode === 'navigate' ? caches.match('/index.html') : undefined))
      )
  );
});
