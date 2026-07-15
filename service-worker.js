const CACHE_NAME = 'discussion-pwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data.js',
  './manifest.json',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png'
];

// 1. 설치 이벤트 - 필수 리소스 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Essential assets caching completed');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. 페치 이벤트 - 네트워크 우선 (오프라인 시 캐시 반환)
self.addEventListener('fetch', event => {
  // GET 및 http/https 요청만 필터링하여 웹뷰 크래시 방지
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // 성공 시 로컬 캐시 자동 업데이트
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          }).catch(err => console.warn('[SW] Cache put failed:', err));
        }
        return networkResponse;
      })
      .catch(() => {
        // 네트워크 단절 시 캐시에서 파일 반환
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // 오프라인 상태에서 페이지 이동 시 기본 index.html 반환
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
