// MafynGate Service Worker (v1.2 - Updated branding assets)
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker Activating...');
  event.waitUntil(clients.claim());
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
      icon: icon || '/logo.png', // Ensure this exists in public/
      badge: '/logo.png', // Fallback to icon for badge
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
