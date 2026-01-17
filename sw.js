// ১. ভার্সন কন্ট্রোল (ফাইল আপডেট করলে এই ভ্যালু পরিবর্তন করবেন, যেমন v1 থেকে v2)
const CACHE_NAME = 'poshupakhi-static-v1.1';
const DYNAMIC_CACHE_NAME = 'poshupakhi-dynamic-v1.1';

// ২. যে ফাইলগুলো অফলাইনেও কাজ করার জন্য সেভ রাখা প্রয়োজন
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/assets/logo.svg',
    // আপনার আইকনগুলো এখানে যোগ করুন
    '/assets/icon-192.png', 
    '/assets/icon-512.png'
];

// ৩. সার্ভিস ওয়ার্কার ইনস্টল ইভেন্ট
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Static assets caching...');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// ৪. অ্যাক্টিভেট ইভেন্ট (পুরনো ক্যাশ ডিলিট করা)
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

// ৫. ফেচ (Fetch) ইveন্ট - ডাটা লোড করার লজিক
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // ক) Supabase API রিকোয়েস্ট সবসময় নেটওয়ার্ক থেকে আসবে (ক্যাশ হবে না)
    if (url.hostname.includes('supabase.co')) {
        return event.respondWith(fetch(event.request));
    }

    // খ) স্ট্যাটিক ও ডাইনামিক ফাইলের জন্য ক্যাশিং স্ট্র্যাটেজি
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // যদি ক্যাশে ফাইল থাকে তবে সেটি দাও
            if (cachedResponse) return cachedResponse;

            // ক্যাশে না থাকলে নেটওয়ার্ক থেকে আনো এবং ডাইনামিক ক্যাশে সেভ করো
            return fetch(event.request).then(networkResponse => {
                return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    // শুধুমাত্র সফল GET রিকোয়েস্ট ক্যাশ করো
                    if (event.request.method === 'GET' && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        }).catch(() => {
            // যদি অফলাইন থাকে এবং ফাইলটি HTML হয়, তবে index.html দেখাও
            if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/index.html');
            }
        })
    );
});
