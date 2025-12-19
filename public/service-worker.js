const CACHE_NAME = 'chequealo-v4';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

// Install service worker and pre-cache app shell
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(APP_SHELL);
    })
  );
});

// Activate: clean old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log('[ServiceWorker] Deleting old cache:', name);
              return caches.delete(name);
            }
          })
        )
      ),
      self.clients.claim(),
    ])
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Network-first for navigations to avoid serving an old bundle
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

// ===== PUSH NOTIFICATION HANDLER =====
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');
  
  let notificationData = {
    title: 'Chequealo',
    body: 'Nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'default-' + Date.now(),
    requireInteraction: false,
    renotify: true,
    data: {
      url: '/',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'view', title: 'Ver' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  // Parse push event data
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[ServiceWorker] Push data received:', JSON.stringify(data));
      
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        vibrate: data.vibrate || notificationData.vibrate,
        tag: data.tag || 'notification-' + Date.now(),
        requireInteraction: data.requireInteraction || false,
        renotify: true,
        data: {
          url: data.url || data.action_url || data.data?.url || '/',
          dateOfArrival: Date.now(),
          ...data.data
        },
        actions: data.actions || notificationData.actions
      };
    } catch (e) {
      console.error('[ServiceWorker] Error parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  console.log('[ServiceWorker] Showing notification:', notificationData.title);
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      renotify: notificationData.renotify,
      data: notificationData.data,
      actions: notificationData.actions
    })
  );
});

// ===== NOTIFICATION CLICK HANDLER =====
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event.action);
  
  event.notification.close();

  // Handle close action
  if (event.action === 'close') {
    return;
  }

  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;
  console.log('[ServiceWorker] Opening URL:', urlToOpen);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if app is already open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('[ServiceWorker] Focusing existing window');
            return client.focus().then(focusedClient => {
              if ('navigate' in focusedClient) {
                return focusedClient.navigate(urlToOpen);
              }
              return focusedClient;
            });
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          console.log('[ServiceWorker] Opening new window');
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ===== NOTIFICATION CLOSE HANDLER =====
self.addEventListener('notificationclose', (event) => {
  console.log('[ServiceWorker] Notification closed by user');
});

// ===== MESSAGE HANDLER (for communication with main thread) =====
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[ServiceWorker] Processing SKIP_WAITING, activating new version...');
    self.skipWaiting().then(() => {
      console.log('[ServiceWorker] skipWaiting completed');
      // Notify all clients that the new version is active
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED' });
        });
      });
    });
  }
});
