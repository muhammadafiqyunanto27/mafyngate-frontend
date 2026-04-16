// MafynGate Service Worker for Web Push Notifications

self.addEventListener('push', function(event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, icon, url, type } = data;

    const options = {
      body: body || 'You have a new notification',
      icon: icon || '/logo.png', // Fallback to a default icon
      badge: '/badge.png',
      vibrate: type === 'CALL' ? [200, 100, 200, 100, 200, 100, 200] : [100, 50, 100],
      data: {
        url: url || '/messages',
        type: type || 'CHAT'
      },
      tag: type === 'CALL' ? 'incoming-call' : 'new-chat',
      renotify: true,
      actions: type === 'CALL' ? [
        { action: 'answer', title: 'Answer' },
        { action: 'reject', title: 'Reject' }
      ] : []
    };

    event.waitUntil(
      self.registration.showNotification(title || 'MafynGate', options)
    );
  } catch (err) {
    console.error('[SW] Push error:', err);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url;
  const action = event.action;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Logic for Answer action
      let targetUrl = urlToOpen;
      if (action === 'answer') {
        targetUrl = '/messages?answerCall=true';
      }

      // If a window is already open with the URL, focus it
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
