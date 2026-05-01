const CACHE_NAME = 'yordam-tj-v3';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon.svg',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/favicon-32x32.png',
    '/icons/favicon-16x16.png'
];

// Install — pre-cache critical assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            cache.addAll(ASSETS).catch(err => console.warn('Pre-cache partial fail:', err))
        )
    );
    self.skipWaiting();
});

// Activate — cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch strategies:
// - API calls (POST/PATCH/DELETE/GET to backend) → network only (no cache)
// - Static (HTML/CSS/JS/images/fonts) → cache-first, update in background
self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);

    // Не кэшируем API и сторонние запросы
    if (req.method !== 'GET' || url.pathname.startsWith('/api/') || url.hostname.includes('onrender.com')) {
        return; // браузер обработает сам
    }

    // Cache-first for static
    event.respondWith(
        caches.match(req).then(cached => {
            const fetchPromise = fetch(req).then(response => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
                }
                return response;
            }).catch(() => cached); // если сети нет — отдать кэш

            return cached || fetchPromise;
        })
    );
});
