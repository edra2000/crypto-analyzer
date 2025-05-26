// Service Worker للعمل في الخلفية
const CACHE_NAME = 'crypto-patterns-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// التعامل مع التنبيهات في الخلفية
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'BACKGROUND_SYNC') {
        // تنفيذ مهام في الخلفية
        performBackgroundTasks();
    }
});

function performBackgroundTasks() {
    // مهام تحديث البيانات في الخلفية
    console.log('تنفيذ مهام الخلفية...');
}
