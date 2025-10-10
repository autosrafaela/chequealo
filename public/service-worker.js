const CACHE_NAME = 'chequealo-v3';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

// Install service worker and pre-cache app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

// Activate: clean old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => (name !== CACHE_NAME ? caches.delete(name) : undefined))
        )
      ),
      self.clients.claim(),
    ])
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Network-first for navigations to avoid serving an old bundle (fixes SPA 404 after deploy)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for static assets
  const dest = req.destination;
  if (['style', 'script', 'image', 'font'].includes(dest)) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
      )
    );
  }
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('Push notification received', event);
  
  let notificationData = {
    title: 'Chequealo',
    body: 'Nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'default',
    requireInteraction: false,
    data: {
      url: '/',
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'Ver'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  // If push event has data, parse and use it
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        vibrate: data.vibrate || notificationData.vibrate,
        tag: data.tag || 'notification-' + Date.now(),
        requireInteraction: data.requireInteraction || false,
        data: {
          url: data.url || data.action_url || '/',
          dateOfArrival: Date.now(),
          ...data.data
        },
        actions: data.actions || notificationData.actions
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData
    )
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);
  
  event.notification.close();

  // Handle action buttons
  if (event.action === 'close') {
    return;
  }

  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if found
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(client => {
              // Navigate to the URL if supported
              if ('navigate' in client) {
                return client.navigate(urlToOpen);
              }
              return client;
            });
          }
        }
        
        // Open new window if no existing window found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});