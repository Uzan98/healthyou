const CACHE_NAME = 'healthplus-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-512.png',
];

// Install — cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache (for a data-driven app)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET and Supabase API calls (always need fresh data)
  if (request.method !== 'GET') return;
  if (request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response.ok && (request.url.includes('/assets/') || request.destination === 'document')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
