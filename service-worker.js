const CACHE_NAME = "find-my-tube-v194";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest?v=20260316b",
  "./assets/css/style.css?v=20260426b",
  "./assets/js/script.js?v=20260426b",
  "./assets/js/find-my-test.js?v=20260425a",
  "./assets/data/data.js?v=20260323a",
  "./assets/data/find-my-test-map.json?v=20260426b",
  "./assets/data/find-my-test-dictionary.json?v=20260426b",
  "./favicon.svg",
  "./favicon-16.png",
  "./favicon-32.png",
  "./assets/images/lab-bg.svg",
  "./assets/icons/favicon-16.png",
  "./assets/icons/favicon-32.png",
  "./assets/icons/icon-192.png?v=20260316b",
  "./assets/icons/icon-512.png?v=20260316b"
];

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
  const isLocalPreview = self.location.port === "3000";
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => isLocalPreview || key !== CACHE_NAME)
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

  if (requestUrl.port === "3000") {
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
        .catch(() => caches.match("./index.html"));
    })
  );
});
