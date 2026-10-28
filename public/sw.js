/* Munchly service worker: precaches the built app so it works offline.
   The two placeholders below are filled in at build time (see vite.config.ts). */
const VERSION = '__CACHE_VERSION__'
const FILES = __PRECACHE_FILES__
const CACHE = `munchly-${VERSION}`
const scope = self.registration.scope

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['./', ...FILES].map((file) => new URL(file, scope).href)))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith('munchly-') && key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(scope)) return

  // Single-screen app: any navigation is answered with the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(new URL('./', scope).href).then((cached) => cached ?? fetch(request)),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        }),
    ),
  )
})
