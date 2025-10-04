// Service Worker para GEB PWA
const CACHE_NAME = 'geb-pwa-v1';
const STATIC_CACHE = 'geb-static-v1';
const DYNAMIC_CACHE = 'geb-dynamic-v1';

// Assets críticos para cachear inmediatamente
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  '/favicon.svg',
  '/logo.svg'
];

// Rutas de la aplicación para cachear
const APP_ROUTES = [
  '/',
  '/dashboard',
  '/products',
  '/customers', 
  '/sales',
  '/finances',
  '/marketing-analytics',
  '/dynamic-pricing',
  '/business-intelligence',
  '/reports'
];

// Install Event - Cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching critical assets');
      return cache.addAll(CRITICAL_ASSETS);
    }).then(() => {
      console.log('[SW] Critical assets cached successfully');
      return self.skipWaiting(); // Activate immediately
    }).catch((error) => {
      console.error('[SW] Failed to cache critical assets:', error);
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('geb-') && 
                   cacheName !== STATIC_CACHE && 
                   cacheName !== DYNAMIC_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[SW] Service worker activated successfully');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch Event - Network-first with fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests (network-first)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets (cache-first)
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  
  // Handle navigation requests (app shell)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }
  
  // Default: network with cache fallback
  event.respondWith(handleDefault(request));
});

// API Request Handler - Network first, cache as backup
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses for offline use
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API request failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API failures
    return new Response(
      JSON.stringify({ 
        error: 'Offline',
        message: 'Esta función requiere conexión a internet',
        offline: true 
      }), 
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Static Asset Handler - Cache first
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to load static asset:', request.url);
    // Return a placeholder or error response
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Navigation Handler - App shell pattern
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation offline, serving cached app shell');
    
    // Try to serve cached version of the route
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to app shell (index.html)
    const appShell = await caches.match('/');
    if (appShell) {
      return appShell;
    }
    
    // Ultimate fallback - offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GEB - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
            }
            .offline-icon { 
              font-size: 4rem; 
              margin-bottom: 1rem; 
            }
            .offline-title { 
              font-size: 2rem; 
              margin-bottom: 1rem; 
            }
            .offline-message { 
              font-size: 1.1rem; 
              opacity: 0.9;
              max-width: 400px;
            }
            .retry-button {
              margin-top: 2rem;
              padding: 12px 24px;
              background: rgba(255,255,255,0.2);
              border: 2px solid white;
              color: white;
              border-radius: 8px;
              cursor: pointer;
              font-size: 1rem;
            }
            .retry-button:hover {
              background: rgba(255,255,255,0.3);
            }
          </style>
        </head>
        <body>
          <div class="offline-icon">📵</div>
          <h1 class="offline-title">Sin Conexión</h1>
          <p class="offline-message">
            GEB funciona mejor con conexión a internet. 
            Algunas funciones están disponibles offline.
          </p>
          <button class="retry-button" onclick="window.location.reload()">
            Reintentar
          </button>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Default Handler
async function handleDefault(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Not available offline', { status: 404 });
  }
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync-forms') {
    event.waitUntil(syncOfflineForms());
  }
});

// Sync offline form submissions
async function syncOfflineForms() {
  try {
    // Get pending form data from IndexedDB
    const pendingForms = await getPendingForms();
    
    for (const formData of pendingForms) {
      try {
        await fetch(formData.url, {
          method: formData.method,
          headers: formData.headers,
          body: formData.body
        });
        
        // Remove from pending after successful sync
        await removePendingForm(formData.id);
        console.log('[SW] Synced offline form:', formData.id);
      } catch (error) {
        console.error('[SW] Failed to sync form:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Helper functions for IndexedDB (simplified)
async function getPendingForms() {
  // Implementation would use IndexedDB to store/retrieve offline form data
  return [];
}

async function removePendingForm(id) {
  // Implementation would remove synced form from IndexedDB
}

// Push notifications handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de GEB',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver en GEB',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/logo192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('GEB Sistema', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker script loaded successfully');