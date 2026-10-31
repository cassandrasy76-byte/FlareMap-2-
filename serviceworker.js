
const CACHE_NAME = "flaremap-pink-v6";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache app files, but don't let a missing optional icon
      // prevent the service worker from installing.
      for (const file of FILES_TO_CACHE) {
        try {
          await cache.add(file);
        } catch (error) {
          console.warn("Could not cache:", file, error);
        }
      }
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) =>
            name.startsWith("flaremap-") &&
            name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        return (await caches.match("./index.html")) ||
          Response.error();
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

// Push notifications received from a push service.
// This handler requires a push subscription and a server
// that actually sends push messages.
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "FlareMap Alert",
      body: event.data ? event.data.text() : "New sensor alert."
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "FlareMap Alert",
      {
        body: data.body || "A sensor alert needs attention.",
        icon: "./icon-192.png",
        badge: "./icon-192.png"
      }
    )
  );
});
