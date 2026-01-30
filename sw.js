const CACHE_NAME = 'electrotest-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png'
          // добавьте CSS, JS файлы
        ]);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );

});
// sw.js - простой Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker установлен');
  // Принудительно активируем сразу
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker активирован');
  // Возьмём контроль над всеми клиентами
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Просто пропускаем все запросы к сети
  event.respondWith(fetch(event.request));
});
