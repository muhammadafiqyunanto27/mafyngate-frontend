// MafynGate Service Worker (v1.4 - Force cache clear for iOS fixes)
const CACHE_VERSION = 'v1.4';
const CACHE_NAME = `mafyngate-${CACHE_VERSION}`;
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker Installing...', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker Activating...', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => clients.claim())
  );
});

// Fetch strategy: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request);
      })
  );
});

self.addEventListener('push', function(event) {
  console.log('[SW] Push Event Received.');
  if (!event.data) {
    console.warn('[SW] Push event had no data.');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Push Data:', data);
    const { title, body, icon, url, type } = data;

    const options = {
      body: body || 'You have a new notification',
      icon: icon || '/logo.png',
      badge: '/logo.png',
      vibrate: type === 'CALL' ? [1000, 500, 1000, 500, 1000, 500, 1000] : [100, 50, 100],
      priority: 'high',
      importance: 'high',
      requireInteraction: type === 'CALL' || type === 'ALARM',
      data: {
        url: url || '/',
        type: type || 'CHAT'
      },
      tag: type === 'CALL' ? 'incoming-call' : (type === 'ALARM' ? 'todo-alarm' : (url || 'general')),
      renotify: true,
      actions: type === 'CALL' ? [
        { action: 'answer', title: 'Answer Now' },
        { action: 'reject', title: 'Dismiss' }
      ] : []
    };

    event.waitUntil(
      self.registration.showNotification(title || 'MafynGate', options)
    );
  } catch (err) {
    console.error('[SW] Push parsing error:', err);
    event.waitUntil(
      self.registration.showNotification('MafynGate', {
        body: event.data.text() || 'New Notification Received',
        icon: '/logo.png'
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification Clicked. Action:', event.action);
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.url || '/';
  const action = event.action;

  if (action === 'answer') {
    targetUrl = '/messages?answerCall=true';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        const clientUrl = new URL(client.url).pathname;
        const targetPath = new URL(targetUrl, self.location.origin).pathname;
        
        if (clientUrl === targetPath && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clientList.length > 0) {
          return clientList[0].focus();
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Listen for version check messages from client
self.addEventListener('message', (event) => {
  if (event.data === 'check-version') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
  if (event.data === 'skip-waiting') {
    self.skipWaiting();
  }
});
