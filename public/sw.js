const CACHE_NAME = "kalios-v2";
const STATIC_CACHE = "kalios-static-v2";
const HTML_PRECACHE = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(HTML_PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) =>
        Promise.all(
          names
            .filter((n) => n !== CACHE_NAME && n !== STATIC_CACHE)
            .map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip API and tRPC — always network
  if (url.pathname.startsWith("/api/") || url.pathname.includes("trpc")) return;

  // HTML → network-first, fall back to cache
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/index.html"))),
    );
    return;
  }

  // JS / CSS / fonts → stale-while-revalidate
  if (/\.(js|css|woff2?|ttf)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request).then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        });
        return cached || networkFetch;
      }),
    );
    return;
  }

  // Images → cache-first
  if (/\.(png|jpg|jpeg|svg|gif|webp|ico)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        });
      }),
    );
    return;
  }

  // Everything else → network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request)),
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "Kali WebOS", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-72.png",
      tag: data.tag || "default",
      requireInteraction: false,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/"));
});
