const CACHE_NAME = 'chequealo-v6';
const STATIC_CACHE = 'chequealo-static-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

// Static assets to cache aggressively (cache-first, long-lived)
const STATIC_ASSETS = [
  '/favicon.ico',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
];

// Install service worker and pre-cache app shell + static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] 📦 Installing...');
  self.skipWaiting();
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
    ])
  );
});

// Activate: clean old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] ✅ Activating...');
  const KEEP = [CACHE_NAME, STATIC_CACHE];
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(names.filter((n) => !KEEP.includes(n)).map((n) => caches.delete(n)))
      ),
      self.clients.claim(),
    ])
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET
  if (req.method !== 'GET') return;

  // Skip Supabase / API calls
  if (url.hostname.includes('supabase') || url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/')) return;

  // Network-first for navigations
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

  // Cache-first for fonts (Google Fonts, etc.)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
          return res;
        })
      )
    );
    return;
  }

  // Cache-first for static assets (styles, scripts, images, fonts)
  const dest = req.destination;
  if (['style', 'script', 'image', 'font'].includes(dest)) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
          }
          return res;
        }).catch(() => {
          // Fallback for images
          if (dest === 'image') return caches.match('/placeholder.svg');
          return new Response('', { status: 408 });
        })
      )
    );
    return;
  }
});

// ===== PUSH NOTIFICATION HANDLER =====
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Chequealo',
    body: 'Nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'default-' + Date.now(),
    requireInteraction: false,
    renotify: true,
    data: { url: '/', dateOfArrival: Date.now() },
    actions: [
      { action: 'view', title: 'Ver' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  if (event.data) {
    try {
      const data = JSON.parse(event.data.text());
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
      try { notificationData.body = event.data.text(); } catch (_) {}
    }
  }

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
  event.notification.close();
  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then((c) => 'navigate' in c ? c.navigate(fullUrl) : c);
        }
      }
      if (clients.openWindow) return clients.openWindow(fullUrl);
    })
  );
});

// ===== NOTIFICATION CLOSE HANDLER =====
self.addEventListener('notificationclose', () => {});

// ===== MESSAGE HANDLER =====
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting().then(() => {
      self.clients.matchAll().then((cls) => cls.forEach((c) => c.postMessage({ type: 'SW_UPDATED' })));
    });
  }
  if (event.data?.type === 'TEST_PUSH') {
    self.registration.showNotification('🧪 Test de Service Worker', {
      body: 'Las notificaciones funcionan correctamente!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'test-' + Date.now()
    });
  }
});

// ===== SYNC HANDLER =====
self.addEventListener('sync', () => {});
