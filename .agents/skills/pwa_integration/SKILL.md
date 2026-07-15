---
name: pwa-integration
description: 웹 프로젝트에 네트워크 우선(Network-First) 서비스 워커 캐싱, PWA 매니페스트 설정 및 브라우저 호환 설치 유도를 위한 PWA 기술을 이식합니다.
---

이 스킬은 기존의 일반 웹사이트(HTML/JS/CSS)를 모바일 및 데스크톱에서 앱처럼 설치하고 오프라인에서도 기동 가능한 프로그레시브 웹 앱(PWA)으로 업그레이드하기 위한 가이드라인과 템플릿 코드셋을 제공합니다.

---

## 1. 파일 구조 구성

PWA를 연동하려면 프로젝트 루트 디렉토리에 다음 파일들을 생성 및 매핑해야 합니다:

```text
├── index.html            # PWA 메타 태그 정의, 서비스 워커 등록 및 모달 구현
├── manifest.json         # PWA 앱 명세서 설정 (이름, 아이콘, 런처 색상 등)
├── service-worker.js     # 네트워크 우선(Network-First) 오프라인 캐싱 로직
├── app.js                # 설치 버튼 및 가이드 모달 이벤트 바인딩
└── assets/
    └── images/
        ├── icon-192.png  # PWA 표준 192x192 PNG 아이콘
        └── icon-512.png  # PWA 표준 512x512 PNG 아이콘
```

---

## 2. PWA 설정 코드 템플릿

### 2.1. manifest.json 설정
PWA의 실행 정보와 런처 아이콘을 정의합니다. **반드시 알파 채널(투명도)을 지원하는 PNG 파일**을 아이콘으로 사용해야 크롬/삼성 인터넷의 설치 요건을 충족합니다. `start_url`은 서브 디렉토리 배포 시에도 호환되도록 `"./"`로 지정합니다.

```json
{
  "short_name": "사유와 토론",
  "name": "지혜의 서재 | 철학 & 문학 토론 워크스페이스",
  "icons": [
    {
      "src": "assets/images/icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "assets/images/icon-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "./",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "display": "standalone",
  "orientation": "portrait"
}
```

### 2.2. service-worker.js 설정 (네트워크 우선 전략)
삼성 인터넷, 크롬, 사파리 등 다양한 모바일 브라우저의 캐시 꼬임 오류("사이트에 연결할 수 없음")를 원천 방지하기 위해 **네트워크 우선(Network-First)** 전략을 적용합니다. 또한 확장 기능이나 분석 도구로 인한 붕괴를 막기 위해 **GET 및 http/https 가드 필터**를 구현합니다.

```javascript
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
```

### 2.3. index.html 설정
PWA 구동을 위한 메타 태그, 모바일 호환용 설명서 모달, 그리고 **배포 즉시 새로운 서비스 워커를 기기에 적용하고 캐시를 갱신시키는 오토 리로드(Auto-Reload)** 기능이 내장된 등록 스크립트를 배치합니다.

```html
<head>
  <!-- PWA 메타 태그 -->
  <link rel="manifest" href="manifest.json">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="사유와 토론">
  <link rel="apple-touch-icon" href="assets/images/icon-192.png">
</head>
<body>

  <!-- 홈화면 추가 버튼 예시 -->
  <button id="pwa-install-btn" style="display: none;">📲 홈화면 추가</button>

  <!-- 미지원 기기용 설명서 모달 예시 -->
  <div id="pwa-modal" class="pwa-modal-backdrop" style="display: none;">
    <div class="pwa-modal-card">
      <div class="pwa-modal-header">
        <h4>📲 홈화면 추가 안내</h4>
        <button id="pwa-modal-close">&times;</button>
      </div>
      <div class="pwa-modal-body">
        <p><b>안드로이드(크롬/삼성):</b> 주소창 옆 (⬇️) 아이콘 또는 메뉴의 [홈화면에 추가]</p>
        <p><b>아이폰(사파리):</b> 하단 공유 아이콘 ➡️ [홈화면에 추가]</p>
        <p><b>PC(크롬/엣지):</b> 주소창 끝 (🖥️+⬇) 아이콘 클릭</p>
      </div>
      <div class="pwa-modal-footer">
        <button id="pwa-modal-btn-action">알겠습니다</button>
      </div>
    </div>
  </div>

  <!-- 서비스 워커 즉시 갱신(Auto-Reload)이 지원되는 등록 스크립트 -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then(reg => {
            console.log('SW Registered:', reg.scope);
            // 새로운 서비스 워커(배포) 발견 시 자동 페이지 새로고침하여 즉각 반영
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('New update available. Reloading page...');
                      window.location.reload();
                    }
                  }
                };
              }
            };
          })
          .catch(err => console.log('SW Registration failed:', err));
      });
    }
  </script>
</body>
```

### 2.4. app.js 설정
사용자가 `📲 홈화면 추가` 버튼을 클릭했을 때 작동하는 스크립트입니다. 브라우저의 PWA 이벤트를 감지하여 가능한 경우 네이티브 앱 설치 창을 띄우고, 미지원 브라우저인 경우 가이드 모달창을 띄워줍니다.

```javascript
document.addEventListener('DOMContentLoaded', () => {
  let deferredPrompt = null;
  const installBtn = document.getElementById('pwa-install-btn');
  const pwaModal = document.getElementById('pwa-modal');
  const pwaModalClose = document.getElementById('pwa-modal-close');
  const pwaModalBtnAction = document.getElementById('pwa-modal-btn-action');

  // 이미 독립 실행(App Mode) 중인 경우 설치 버튼 자동 숨김
  if (window.matchMedia('(display-mode: standalone)').matches) {
    if (installBtn) installBtn.style.display = 'none';
  }

  // PWA 설치 가능 상태 도출 시 설치 단추 활성화
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
    }
  });

  // 버튼 클릭 핸들러
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User choice result: ${outcome}`);
        deferredPrompt = null;
      } else {
        // PWA 네이티브 설치가 미준비된 경우 가이드 모달 노출
        if (pwaModal) pwaModal.style.display = 'flex';
      }
    });
  }

  // 모달 닫기 제어
  function closePwaModal() {
    if (pwaModal) pwaModal.style.display = 'none';
  }

  if (pwaModalClose) pwaModalClose.addEventListener('click', closePwaModal);
  if (pwaModalBtnAction) pwaModalBtnAction.addEventListener('click', closePwaModal);
  if (pwaModal) {
    pwaModal.addEventListener('click', (e) => {
      if (e.target === pwaModal) closePwaModal();
    });
  }

  // 설치 완료 시 버튼 제거 및 마무리
  window.addEventListener('appinstalled', () => {
    console.log('App successfully installed!');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
    closePwaModal();
  });
});
```

---

## 3. PWA 이식 체크리스트

1. [ ] **무손실 PNG 아이콘 배치**: `icon-192.png` 및 `icon-512.png` 준비
2. [ ] **메타 태그 결합**: `index.html` 헤더에 `manifest` 주소 및 `apple-touch-icon` 경로 삽입
3. [ ] **스타트 루트 설정**: `manifest.json` 내 `start_url`이 `"./"`인지 확인
4. [ ] **네트워크 우선 서비스 워커**: `service-worker.js` 내 페치 이벤트가 `Network-First` 구조인지 점검
5. [ ] **비-GET 가드 코드 확인**: `GET` 통신 외의 요청에 대한 리턴 처리 확인
6. [ ] **자동 새로고침 스크립트 탑재**: `index.html` 하단에 `onupdatefound` -> `reload()` 탑재 여부 점검
7. [ ] **동작 테스트**: 크롬/삼성 인터넷의 주소창 설치 아이콘 및 아이폰 사파리 설명 모달 정상 기동 여부 검증
