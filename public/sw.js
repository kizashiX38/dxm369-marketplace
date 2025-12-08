// DXM369 Service Worker - PWA Functionality
// Offline support, caching, and push notifications

const CACHE_NAME = 'dxm369-v1.0.0';
const STATIC_CACHE = 'dxm369-static-v1.0.0';
const DYNAMIC_CACHE = 'dxm369-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/gpus',
  '/cpus',
  '/laptops',
  '/deals',
  '/trending',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/dxm\/analytics/,
  /\/api\/amazon/,
  /\/api\/ai-summary/,
  /\/api\/seo/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (except for specific domains)
  if (!url.origin.includes('dxm369.com') && 
      !url.origin.includes('localhost') && 
      !url.origin.includes('amazon.com') &&
      !url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Handle different types of requests
    if (isStaticAsset(url.pathname)) {
      return await handleStaticAsset(request);
    } else if (isAPIRequest(url.pathname)) {
      return await handleAPIRequest(request);
    } else if (isPageRequest(request)) {
      return await handlePageRequest(request);
    } else {
      return await handleDynamicRequest(request);
    }
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    return await handleFallback(request);
  }
}

// Handle static assets (images, icons, etc.)
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static asset not available offline:', request.url);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Handle API requests with cache-first strategy for analytics
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(DYNAMIC_CACHE);
  
  // For analytics and non-critical APIs, try cache first
  if (url.pathname.includes('/analytics') || url.pathname.includes('/seo')) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Serve from cache and update in background
      fetchAndCache(request, cache);
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API requests
    return new Response(JSON.stringify({
      success: false,
      error: 'Offline - cached data not available',
      offline: true,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return await handleOfflinePage();
  }
}

// Handle dynamic requests (images, etc.)
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Only cache successful responses
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Resource not available offline', { status: 404 });
  }
}

// Background fetch and cache update
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    console.log('[SW] Background fetch failed:', error);
  }
}

// Handle fallback responses
async function handleFallback(request) {
  const url = new URL(request.url);
  
  if (isPageRequest(request)) {
    return await handleOfflinePage();
  }
  
  if (url.pathname.includes('/api/')) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Service temporarily unavailable',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Resource not available', { status: 404 });
}

// Generate offline page
async function handleOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - DXM369</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #080c12 0%, #0a0f18 100%);
          color: #e2e8f0;
          margin: 0;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          text-align: center;
          max-width: 400px;
          padding: 40px 20px;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 16px;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        .logo {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-weight: bold;
          color: white;
        }
        h1 {
          color: #06b6d4;
          margin-bottom: 10px;
        }
        p {
          color: #94a3b8;
          margin-bottom: 30px;
        }
        .retry-btn {
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        .retry-btn:hover {
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">DX</div>
        <h1>You're Offline</h1>
        <p>Check your internet connection and try again. Some cached content may still be available.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Utility functions
function isStaticAsset(pathname) {
  return pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf)$/);
}

function isAPIRequest(pathname) {
  return pathname.startsWith('/api/');
}

function isPageRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'New hardware deals available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'dxm-deals',
    data: {
      url: '/deals'
    },
    actions: [
      {
        action: 'view',
        title: 'View Deals',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('DXM369 - Hardware Deals', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'view' || !action) {
    const url = data?.url || '/deals';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(url) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-deals') {
    event.waitUntil(syncDeals());
  }
});

async function syncDeals() {
  try {
    // Sync cached deal data when back online
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/')) {
        await fetchAndCache(request, cache);
      }
    }
    
    console.log('[SW] Deal sync completed');
  } catch (error) {
    console.error('[SW] Deal sync failed:', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'deals-update') {
    event.waitUntil(syncDeals());
  }
});

console.log('[SW] Service worker loaded successfully');
