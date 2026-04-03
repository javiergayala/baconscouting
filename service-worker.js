const APP_VERSION = '2026-04-03-v3';
const SHELL_CACHE = `exploding-bacon-shell-${APP_VERSION}`;
const RUNTIME_CACHE = `exploding-bacon-runtime-${APP_VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-32.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

async function putInCache(cacheName, request, response) {
  if (!response || !response.ok) return response;
  const cache = await caches.open(cacheName);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    await putInCache(RUNTIME_CACHE, request, response);
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return caches.match('./index.html');
    }
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request)
    .then(response => putInCache(RUNTIME_CACHE, request, response))
    .catch(() => cached);
  return cached || networkPromise;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (!sameOrigin) {
    if (request.destination === 'style' || request.destination === 'font') {
      event.respondWith(staleWhileRevalidate(request));
    }
    return;
  }

  if (/\.(?:html|js|css|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (/\/(?:icons)\//.test(url.pathname) || ['image', 'font'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
