const CACHE_NAME = "find-my-tube-v267";
const isLocalPreview = () => (
  self.location.hostname === "127.0.0.1"
  || self.location.hostname === "localhost"
);
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./about.html",
  "./privacy-policy.html",
  "./terms-of-use.html",
  "./disclaimer.html",
  "./contact-feedback.html",
  "./find-my-test.html",
  "./order-stock.html",
  "./track-orders.html",
  "./stock-dashboard.html",
  "./tube-plan.html",
  "./robots.txt",
  "./sitemap.xml",
  "./manifest.webmanifest?v=20260316b",
  "./assets/css/style.css?v=20260729a",
  "./assets/css/modern.css?v=20260814d",
  "./assets/js/script.js?v=20260814c",
  "./assets/js/premium-home.js?v=20260813a",
  "./assets/js/order-stock-catalog.js?v=20260803a",
  "./assets/js/track-orders.js?v=20260803a",
  "./assets/js/stock-dashboard.js?v=20260617a",
  "./assets/js/find-my-test.js?v=20260728b",
  "./assets/data/data.js?v=20260812a",
  "./assets/data/find-my-test-map.json?v=20260728p",
  "./assets/data/find-my-test-dictionary.json?v=20260728p",
  "./favicon.svg",
  "./favicon-16.png",
  "./favicon-32.png",
  "./assets/images/lab-bg.svg",
  "./assets/images/find-my-tube-lab-overview.jpg",
  "./assets/images/find-my-tube-departments-v1.jpg",
  "./assets/images/hero-lab-analyser.jpg",
  "./assets/images/hero-lab-collection.jpg",
  "./assets/images/hero-lab-logistics.jpg",
  "./assets/images/hero-lab-tubes.jpg",
  "./assets/images/stock-tubes/realistic-empty-tube-yellow-v3.png",
  "./assets/images/stock-tubes/realistic-empty-tube-grey-v3.png",
  "./assets/images/stock-tubes/realistic-empty-tube-purple-v3.png",
  "./assets/images/stock-tubes/realistic-empty-tube-green-v3.png",
  "./assets/images/stock-tubes/realistic-empty-tube-blue-v3.png",
  "./assets/images/stock-tubes/realistic-empty-tube-pearl-v3.png",
  "./assets/images/stock-tubes/realistic-empty-tube-tan-v3.png",
  "./assets/images/stock-tubes/realistic-empty-tube-pink-v3.png",
  "./assets/images/stock-tubes/realistic-empty-paediatric-microtainer-yellow-v1.png",
  "./assets/images/stock-tubes/realistic-empty-paediatric-microtainer-purple-v1.png",
  "./assets/images/stock-tubes/realistic-empty-paediatric-microtainer-grey-v1.png",
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
        .catch(() => caches.match("./index.html"));
    })
  );
});
