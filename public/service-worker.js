// const CACHE_NAME = "static-cache-v2";
// const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/styles.css",
  "/index.js",
  "/load.js",
  "icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

const RUNTIME = 'runtime';
const PRECACHE = 'precache-v1';

// install
self.addEventListener("install", function (evt) {
  // pre cache image data
  evt.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  );


});

// activate
self.addEventListener("activate", function (evt) {
  const currentCaches = [PRECACHE, RUNTIME];
  evt.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })

      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );

      })
      .then(() => self.clients.claim())
  );
})




// fetch
self.addEventListener("fetch", function (evt) {
  if (evt.request.url.startsWith(self.location.origin)) {
    evt.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then((cache) => {
          return fetch(event.request).then((response) => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;

            });
          });
        });
      })
    );
  }
});

