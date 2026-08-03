// ============================================
// MEI KONG — Service Worker
// Offline Support + Caching
// ============================================

const CACHE_NAME = "meikong-menu-v1";

const ASSETS = [
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

// ============================================
// INSTALL — Cache core assets
// ============================================
self.addEventListener("install", (event) => {
  console.log("SW: Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("SW: Caching core assets");
      return cache.addAll(ASSETS);
    })
  );

  // Skip waiting — activate immediately
  self.skipWaiting();
});

// ============================================
// ACTIVATE — Clean old caches
// ============================================
self.addEventListener("activate", (event) => {
  console.log("SW: Activating...");

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("SW: Deleting old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );

  // Take control immediately
  self.clients.claim();
});

// ============================================
// FETCH — Network first, Cache fallback
// ============================================
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful, cache a clone
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If HTML request fails and no cache, show offline page
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("./index.html");
          }
        });
      })
  );
});