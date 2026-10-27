const CACHE_NAME = "find-my-tube-v380";
const isLocalPreview = () => (
  self.location.hostname === "127.0.0.1"
  || self.location.hostname === "localhost"
);
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./find-my-tube.html",
  "./manifest.webmanifest?v=20260316b",
  "./assets/css/style.css?v=20260729a",
  "./assets/css/modern.css?v=20261027d",
  "./assets/css/discovery.css?v=20261027d",
  "./assets/css/scenes.css?v=20261013c",
  "./assets/css/workflows.css?v=20261027g",
  "./assets/js/stock-catalog-data.js?v=20261019b",
  "./assets/js/script.js?v=20261027e",
  "./assets/js/premium-home.js?v=20261019b",
  "./assets/js/quick-guide.js?v=20261019b",
  "./assets/data/data.js?v=20261012o",
  "./favicon.svg",
  "./assets/images/scene-tube-20261013.webp"
];

// Page-specific scripts, reference pages, icons, and photography are cached by
// the runtime fetch handler when first used. Keeping them out of the blocking
// app-shell install lets visual releases take control quickly instead of leaving
// returning users on stale UI.

// Pre-caches the core app shell as soon as the service worker installs.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Lets the page tell a waiting service worker to activate immediately.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

// Clears old caches and takes control of open clients after activation.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => isLocalPreview() || key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Serves fresh versioned assets when possible and falls back to cache offline.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  // Session-protected API data must never survive logout in an offline cache.
  if (requestUrl.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isLocalPreview()) {
    event.respondWith(fetch(event.request));
    return;
  }

  const isNavigationRequest = event.request.mode === "navigate";
  const isVersionedAsset = requestUrl.searchParams.has("v");
  const isFreshnessSensitiveRequest =
    isNavigationRequest
    || requestUrl.pathname.endsWith("/index.html")
    || requestUrl.pathname.endsWith("/manifest.webmanifest")
    || isVersionedAsset;

  if (isFreshnessSensitiveRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          if (isNavigationRequest) return caches.match("./index.html");
          return undefined;
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => Response.error());
    })
  );
});

// Push messages contain no requester/contact details. Opening a notification
// always navigates within this application's scope, never to a payload URL.
self.addEventListener("push", event => {
  let payload = {};
  try { payload = event.data?.json() || {}; } catch { /* Show a generic alert for malformed payloads. */ }
  const kind = payload.kind === "lab" ? "lab" : payload.kind === "client" ? "client" : "home";
  const target = new URL(kind === "lab" ? "stock-dashboard.html" : kind === "client" ? "track-orders.html" : "index.html", self.registration.scope);
  if (kind === "client" && typeof payload.orderId === "string" && payload.orderId.length <= 80) { target.searchParams.set("requestId", payload.orderId); target.searchParams.set("openOrder", "1"); }
  const title = typeof payload.title === "string" ? payload.title.slice(0, 80) : "Find My Tube update";
  const body = typeof payload.body === "string" ? payload.body.slice(0, 240) : "Open Find My Tube to see the latest update.";
  const tag = kind === "client" && typeof payload.orderId === "string" ? `fmt-order-${payload.orderId.slice(0, 80)}` : `fmt-push-${String(payload.eventId || "update").slice(0, 100)}`;
  event.waitUntil(self.registration.showNotification(title, { body, tag, renotify: false,
    icon: new URL("assets/icons/icon-192.png", self.registration.scope).href,
    badge: new URL("assets/icons/icon-192.png", self.registration.scope).href,
    data: { url: target.href }
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil((async () => {
    const scope = new URL(self.registration.scope);
    let target;
    try { target = new URL(event.notification.data?.url || "index.html", scope); } catch { target = new URL("index.html", scope); }
    const allowed = ["index.html", "stock-dashboard.html", "track-orders.html"].map(path => new URL(path, scope).pathname);
    if (target.origin !== scope.origin || !allowed.includes(target.pathname)) target = new URL("index.html", scope);
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find(client => { try { const url = new URL(client.url); return url.origin === target.origin && url.pathname === target.pathname; } catch { return false; } });
    if (existing) { try { if (existing.url !== target.href) await existing.navigate(target.href); return await existing.focus(); } catch { /* Open a fresh window if the previous one closed. */ } }
    return self.clients.openWindow(target.href);
  })());
});
