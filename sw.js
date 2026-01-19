/* --- PoshuPakhi Golpo Service Worker v28.7 --- */
const CACHE_NAME = 'poshupakhi-static-v28.7';
const DYNAMIC_CACHE_NAME = 'poshupakhi-dynamic-v28.7';

// ক্যাশ করার জন্য ফাইলগুলোর লিস্ট (Root level logo.png ব্যবহার করা হয়েছে)
const ASSETS_TO_CACHE = [
    'index.html',
    'style.css',
    'app.js',
    'payment.html',
    'logo.png',
    'manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching essential assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
                    console.log('Removing old cache:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Supabase API নেটওয়ার্ক থেকে আসবে
    if (url.hostname.includes('supabase.co')) {
        return event.respondWith(fetch(event.request));
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then(networkResponse => {
                return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    if (event.request.method === 'GET' && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        }).catch(() => {
            if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('index.html');
            }
        })
    );
});
