// OmniFlow Offline Service Worker (PWA Offline Cache + Offline Notification Engine)

const CACHE_NAME = 'omniflow-offline-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/app-icon.jpg'
];

// 1. Install & Cache Critical App Assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Pre-cache partial fallback:', err);
      });
    })
  );
});

// 2. Activate & Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Strategy: Network First with Cache Fallback for Offline Use
self.addEventListener('fetch', (event) => {
  // Ignore non-GET or chrome-extension requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache valid response
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Network failed (Offline mode) -> Serve from Cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback for HTML navigation in SPA
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
        return new Response('Offline Content Unavailable', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});

// 4. Offline Background & Local Notification Handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_OFFLINE_NOTIFICATION') {
    const { title, body, tag } = event.data;
    const options = {
      body: body || 'Upcoming activity starting soon!',
      icon: '/app-icon.jpg',
      badge: '/app-icon.jpg',
      tag: tag || 'offline-alert',
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 300],
      data: { url: '/' }
    };
    self.registration.showNotification(title, options);
  }
});

// 5. Handle Notification Tap (Opens app even when offline)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// 6. Push Notification Event
self.addEventListener('push', (event) => {
  let payload = { title: 'Timetable Reminder', body: 'Upcoming activity starting soon!' };
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (e) {}

  const options = {
    body: payload.body,
    icon: '/app-icon.jpg',
    badge: '/app-icon.jpg',
    tag: 'timetable-alert',
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 400],
    data: { url: '/' }
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});
