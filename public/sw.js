self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.content || data.message || 'You have a new notification',
    icon: '/globe.svg',
    badge: '/window.svg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      type: data.type,
      senderId: data.senderId
    }
  };

  if (data.type === 'FOLLOW') {
    options.actions = [
      { action: 'follback', title: 'Follow Back' }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'MafynGate', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  notification.close();

  if (action === 'follback') {
    // Redirect to profile and maybe handle auto-follow via query param or just show the profile
    event.waitUntil(
      clients.openWindow(`/profile/${data.senderId}?autofollow=true`)
    );
  } else {
    // Normal click
    let url = data.url;
    if (data.type === 'CHAT') {
      url = `/messages?userId=${data.senderId}`;
    } else if (data.type === 'FOLLOW') {
      url = `/profile/${data.senderId}`;
    }
    
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
