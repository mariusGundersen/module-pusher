var version = '<% VERSION %>';

self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Installed version', version);
  console.log('[ServiceWorker] Skip waiting on install');
  event.waitUntil(self.skipWaiting());
});

// `onactivate` is usually called after a worker was installed and the page
// got refreshed. Since we call `skipWaiting()` in `oninstall`, `onactivate` is
// called immediately.
self.addEventListener('activate', function(event) {
  event.waitUntil((async () => {
    await deleteAllCachesExcept(version);

    // `claim()` sets this worker as the active worker for all clients that
    // match the workers scope and triggers an `oncontrollerchange` event for
    // the clients.
    console.log('[ServiceWorker] Claiming clients for version', version);
    await self.clients.claim();
    console.log('[ServiceWorker] Claimed clients for version', version);
  })());
});

self.addEventListener('fetch', function(event) {
  console.log('[ServiceWorker] fetching', event.request.url);
  if (event.request.url.includes('/modules/')) {
    console.log('[ServiceWorker] Serving', event.request.url);
    event.respondWith((async () => {
      try{
        const cache = await caches.open(version);
        let response = await cache.match(event.request);
        if(response){
          return response;
        }

        console.warn(`[ServiceWorker] Cache is missing ${event.request.url}, fetching!`);
        const keys = await cache.keys();
        const paths = keys.map(k => new URL(k.url).pathname)
        const bfs = BloomFilter.fromKeys(256, 6, paths).toHex();
        console.log('[ServiceWorker] keys:', paths, bfs);
        const fetchRequest = new Request(event.request.url, {
          headers: new Headers({
            'bloom-filter': bfs
          })
        });

        response = await fetch(fetchRequest);
        if(response && response.status === 200 && response.type === 'basic') {
          cache.put(event.request, response.clone());
        }

        return response;
      }catch(e){
        console.error(e);
      }
    })());
  }
});

self.addEventListener('message', function(event) {
  if(event.data.command === 'clearCache'){
    deleteAllCachesExcept('');
  }
});

async function deleteAllCachesExcept(cacheToKeep) {
  try{
    // Delete old cache entries that don't match the current version.
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.filter(name => name !== cacheToKeep).map(function(cacheName) {
          console.log('[ServiceWorker] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
      })
    );
  }catch(e){
    console.error(e);
  }
}
