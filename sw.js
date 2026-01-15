const CACHE_NAME = 'poshupakhi-static-v1';
const DYNAMIC_CACHE_NAME = 'poshupakhi-dynamic-v1';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/assets/logo.svg'
];

// 1. Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// 2. Activate Event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// 3. Fetch Event (Caching Strategy)
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Supabase API রিকোয়েস্ট ক্যাশ করা হবে না (সবসময় নেটওয়ার্ক থেকে আসবে)
    if (url.hostname.includes('supabase.co')) {
        return event.respondWith(fetch(event.request));
    }

    // স্ট্যাটিক ফাইলের জন্য Cache-first, then Network
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then(networkResponse => {
                return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    if (event.request.method === 'GET') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        }).catch(() => {
            // যদি অফলাইন থাকে এবং ক্যাশে না থাকে
            if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/index.html');
            }
        })
    );
});
