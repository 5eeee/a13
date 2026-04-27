/* eslint-disable no-restricted-globals */
/**
 * База приложения должна совпадать с vite.config base (сейчас /a13/).
 * При смене пути деплоя обновите префикс и имя кэша.
 */
const BASE = "/a13/";
const CACHE_STATIC = "a13-static-v2";
const CACHE_MEDIA = "a13-media-v1";

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

  // API и прочее — только сеть
  if (url.pathname.startsWith("/api")) return;

  if (!url.pathname.startsWith(BASE)) return;

  // Навигация: сеть, при офлайне — сохранённый index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_STATIC);
        return (await cache.match(BASE + "index.html")) || (await cache.match(BASE)) || new Response("Offline", { status: 503 });
      })
    );
    return;
  }

  // Галерея /projects/*.webp и др. — кэш + фоновое обновление (повторные визиты быстрее)
  if (
    url.pathname.startsWith(BASE + "projects/") &&
    /\.(webp|png|jpe?g|gif|avif|svg)(\?.*)?$/i.test(url.pathname)
  ) {
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

  // Статика под /a13/assets/: сначала кэш, параллельно обновление
  if (url.pathname.startsWith(BASE + "assets/")) {
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
  }
});
