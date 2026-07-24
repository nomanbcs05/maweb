const CACHE_NAME = 'mab-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/admin.html',
  '/track.html',
  '/css/admin.css',
  '/css/checkout.css',
  '/js/api.js',
  '/js/cart.js',
  '/js/checkout.js',
  '/js/admin.js',
  '/js/track.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Failed to cache some assets on install:', err);
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests and bypass Supabase API calls
  if (e.request.method !== 'GET' || e.request.url.includes('supabase.co') || e.request.url.includes('chrome-extension')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((response) => {
        // Cache new local assets dynamically if they are successful
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      }).catch((err) => {
        console.log('Fetch failed, offline fallback:', err);
      });
    })
  );
});
