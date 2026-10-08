const CACHE_NAME = "find-my-tube-v340";
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
  "./assets/css/modern.css?v=20261008b",
  "./assets/css/discovery.css?v=20261007n",
  "./assets/js/stock-catalog-data.js?v=20261006d",
  "./assets/js/script.js?v=20261008a",
  "./assets/data/data.js?v=20260812a",
  "./favicon.svg",
  "./assets/images/find-my-tube-lab-overview.jpg",
  "./assets/images/hero-lab-tubes-sunrays-v2.jpg"
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
