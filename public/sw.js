/* eslint-disable no-restricted-globals */
/**
 * База приложения должна совпадать с vite.config base (сейчас /).
 */
const BASE = "/";
const CACHE_STATIC = "a13-static-v3";
const CACHE_MEDIA = "a13-media-v3";

const PRECACHE = [BASE, BASE + "index.html", BASE + "logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_STATIC && k !== CACHE_MEDIA).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;

  if (path.startsWith("/api/")) return;

  if (/\.(webp|png|jpg|jpeg|gif|svg|woff2?|ttf|eot)$/i.test(path)) {
    event.respondWith(
      caches.open(CACHE_MEDIA).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  if (path.startsWith("/assets/")) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then((r) => r || caches.match(BASE + "index.html"))
    )
  );
});
