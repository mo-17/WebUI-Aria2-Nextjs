const CACHE_NAME = 'aria2-web-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// 处理请求
self.addEventListener('fetch', (event) => {
  // 跳过 WebSocket 请求
  if (event.request.url.startsWith('ws://') || event.request.url.startsWith('wss://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果在缓存中找到响应,则返回缓存的版本
      if (response) {
        return response;
      }

      // 否则发起网络请求
      return fetch(event.request).then((response) => {
        // 检查是否收到有效的响应
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 克隆响应,因为响应流只能使用一次
        const responseToCache = response.clone();

        // 将响应添加到缓存
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
}); 