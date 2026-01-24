// Service Worker for Push Notifications
const CACHE_NAME = 'tangle-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(clients.claim());
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: 'Tangle',
    body: 'You have a new notification!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {}
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [
      { action: 'open', title: 'Open Tangle' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    tag: data.tag || 'tangle-notification',
    renotify: true
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already an open window
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            // Navigate to the appropriate page based on notification data
            if (event.notification.data?.path) {
              client.navigate(event.notification.data.path);
            }
            return;
          }
        }
        // Open a new window if none exists
        if (clients.openWindow) {
          const url = event.notification.data?.path || '/';
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync for sending notifications
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
});
