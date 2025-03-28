// กำหนดชื่อแคชและไฟล์ที่ต้องการแคช
const CACHE_NAME = 'food-counter-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/menu.js',
  '/js/storage.js',
  '/js/export.js',
  'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;700&display=swap'
];

// ขั้นตอนการติดตั้ง Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// ขั้นตอนการเปิดใช้งาน Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// การรับคำขอและตอบกลับ
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // คืนค่าจากแคชถ้ามี
        if (response) {
          return response;
        }
        
        // ไม่มีในแคช ทำการร้องขอปกติ
        return fetch(event.request).then(
          response => {
            // ตรวจสอบว่าเป็นคำตอบที่ถูกต้องและไม่ใช่ OPAQUE_RESPONSE
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // โคลนคำตอบเพื่อใส่แคช (คำตอบใช้ได้ครั้งเดียว)
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      })
      .catch(error => {
        console.log('Fetch failed:', error);
        // สามารถส่งฝั่ง fallback content ในกรณีที่ไม่สามารถต่อเน็ตได้
      })
  );
});
