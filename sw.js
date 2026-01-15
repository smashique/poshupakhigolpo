// sw.js

// ক্যাশের নাম ভার্সন অনুযায়ী পরিবর্তন করবেন যখন বড় কোনো আপডেট দেবেন।
const CACHE_NAME = 'poshupakhi-static-v1';
const DYNAMIC_CACHE_NAME = 'poshupakhi-dynamic-v1';

// অ্যাপ শেলের জন্য প্রয়োজনীয় ফাইলগুলো এখানে লিস্ট করুন।
// এগুলো প্রথমবার লোড হওয়ার সময় সেভ হয়ে যাবে।
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/assets/logo.svg',
    // সুপাবেস JS লাইব্রেরি CDN থেকে লোড হচ্ছে, তাই ওটা এখানে ক্যাশ করছি না।
    // অফলাইন সাপোর্টের জন্য ওটা লোকালি ডাউনলোড করে ব্যবহার করা ভালো।
    // আপাতত CDN-ই থাকুক, নিচের লজিকে ওটা হ্যান্ডেল হবে।
];

// 1. Install Event (ফাইল ক্যাশ করা)
self.addEventListener('install', event => {
    // console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Precaching App Shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting()) // নতুন SW সাথে সাথে অ্যাক্টিভ হবে
    );
});

// 2. Activate Event (পুরোনো ক্যাশ ডিলিট করা)
self.addEventListener('activate', event => {
    // console.log('[Service Worker] Activating Service Worker ....', event);
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache.', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// 3. Fetch Event (নেটওয়ার্ক রিকোয়েস্ট হ্যান্ডেল করা)
self.addEventListener('fetch', event => {
