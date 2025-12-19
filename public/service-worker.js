const CACHE_NAME = 'chequealo-v5';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

// Install service worker and pre-cache app shell
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] 📦 Installing...');
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
  console.log('[ServiceWorker] ✅ Activating...');
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
  console.log('[ServiceWorker] 🔔 Push notification received!');
  console.log('[ServiceWorker] Push event:', event);
  
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
      const rawData = event.data.text();
      console.log('[ServiceWorker] Push raw data:', rawData.substring(0, 200));
      
      const data = JSON.parse(rawData);
      console.log('[ServiceWorker] Push parsed data:', JSON.stringify(data, null, 2));
      
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
      console.error('[ServiceWorker] ❌ Error parsing push data:', e);
      try {
        notificationData.body = event.data.text();
      } catch (textErr) {
        console.error('[ServiceWorker] ❌ Error reading push text:', textErr);
      }
    }
  } else {
    console.log('[ServiceWorker] ⚠️ No data in push event');
  }

  console.log('[ServiceWorker] 📤 Showing notification:', notificationData.title);
  console.log('[ServiceWorker] Notification details:', {
    body: notificationData.body,
    url: notificationData.data.url,
    tag: notificationData.tag
  });
  
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
    }).then(() => {
      console.log('[ServiceWorker] ✅ Notification shown successfully');
    }).catch((err) => {
      console.error('[ServiceWorker] ❌ Error showing notification:', err);
    })
  );
});

// ===== NOTIFICATION CLICK HANDLER =====
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] 👆 Notification clicked:', event.action);
  console.log('[ServiceWorker] Notification data:', event.notification.data);
  
  event.notification.close();

  // Handle close action
  if (event.action === 'close') {
    console.log('[ServiceWorker] User clicked close action');
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;
  console.log('[ServiceWorker] Opening URL:', fullUrl);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        console.log('[ServiceWorker] Found', windowClients.length, 'open window(s)');
        
        // Check if app is already open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          console.log('[ServiceWorker] Window URL:', client.url);
          
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('[ServiceWorker] Focusing existing window');
            return client.focus().then(focusedClient => {
              if ('navigate' in focusedClient) {
                console.log('[ServiceWorker] Navigating to:', fullUrl);
                return focusedClient.navigate(fullUrl);
              }
              return focusedClient;
            });
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          console.log('[ServiceWorker] Opening new window:', fullUrl);
          return clients.openWindow(fullUrl);
        }
      })
      .catch((err) => {
        console.error('[ServiceWorker] ❌ Error handling notification click:', err);
      })
  );
});

// ===== NOTIFICATION CLOSE HANDLER =====
self.addEventListener('notificationclose', (event) => {
  console.log('[ServiceWorker] ❌ Notification closed by user');
  console.log('[ServiceWorker] Notification tag:', event.notification.tag);
});

// ===== MESSAGE HANDLER (for communication with main thread) =====
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] 📨 Message received:', event.data);
  
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
  
  // Test push handling
  if (event.data && event.data.type === 'TEST_PUSH') {
    console.log('[ServiceWorker] 🧪 Test push requested');
    self.registration.showNotification('🧪 Test de Service Worker', {
      body: 'Las notificaciones del Service Worker funcionan correctamente!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'test-' + Date.now()
    });
  }
});

// ===== SYNC HANDLER (for background sync) =====
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] 🔄 Sync event:', event.tag);
});

// Log when service worker starts
console.log('[ServiceWorker] 🚀 Service Worker loaded and ready');
