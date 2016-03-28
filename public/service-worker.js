var version = '2016-3-28-20:26:00';

self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Installed version', version);
  console.log('[ServiceWorker] Skip waiting on install');
  event.waitUntil(self.skipWaiting());
});

// `onactivate` is usually called after a worker was installed and the page
// got refreshed. Since we call `skipWaiting()` in `oninstall`, `onactivate` is
// called immediately.
self.addEventListener('activate', function(event) {
  // Just for debugging, list all controlled clients.
  self.clients.matchAll({
    includeUncontrolled: true
  }).then(function(clientList) {
    var urls = clientList.map(function(client) {
      return client.url;
    });
    console.log('[ServiceWorker] Matching clients:', urls.join(', '));
  });

  event.waitUntil(
    // Delete old cache entries that don't match the current version.
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== version) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      // `claim()` sets this worker as the active worker for all clients that
      // match the workers scope and triggers an `oncontrollerchange` event for
      // the clients.
      console.log('[ServiceWorker] Claiming clients for version', version);
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('[ServiceWorker] fetching', event.request.url);
  if (event.request.url.includes('/modules/')) {
    console.log('[ServiceWorker] Serving mymodule.js for', event.request.url);
    event.respondWith(
      caches.open(version).then(function(cache) {
        return cache.match(event.request).then(function(response) {
          if(response){
            return response;
          }

          console.warn('[ServiceWorker] Missing cache, fetching!');
          return cache.keys().then(keys => {
            var bf = new BloomFilter(256, 6);
            keys.forEach(k => bf.add(new URL(k.url).pathname));
            var bfs = JSON.stringify(bf.buckets);
            console.log('[ServiceWorker] keys:', keys.map(k => new URL(k.url).pathname), bfs);
            var fetchRequest = new Request(event.request.url, {
              headers: new Headers({
                'bloom-filter': bfs
              })
            });
            return fetch(fetchRequest)
            .then(function(response) {
              // Check if we received a valid response
              if(!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              var responseToCache = response.clone();
              cache.put(event.request, responseToCache);

              return response;
            }, e => console.error(e));
          }, e => console.error(e));
        });
      })
    );
  }
  if (event.request.url.includes('/version')) {
    event.respondWith(new Response(version, {
      headers: {
        'content-type': 'text/plain'
      }
    }));
  }
});

var BloomFilter = (function(exports) {
  // Creates a new bloom filter.  If *m* is an array-like object, with a length
  // property, then the bloom filter is loaded with data from the array, where
  // each element is a 32-bit integer.  Otherwise, *m* should specify the
  // number of bits.  Note that *m* is rounded up to the nearest multiple of
  // 32.  *k* specifies the number of hashing functions.
  function BloomFilter(m, k) {
    var a;
    if (typeof m !== "number") a = m, m = a.length * 32;

    var n = Math.ceil(m / 32),
        i = -1;
    this.m = m = n * 32;
    this.k = k;

    var buckets = this.buckets = [];
    if (a) while (++i < n) buckets[i] = a[i];
    else while (++i < n) buckets[i] = 0;
    this._locations = [];
  }

  // See http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
  BloomFilter.prototype.locations = function(v) {
    var k = this.k,
        m = this.m,
        r = this._locations,
        a = fnv_1a(v),
        b = fnv_1a_b(a),
        x = a % m;
    for (var i = 0; i < k; ++i) {
      r[i] = x < 0 ? (x + m) : x;
      x = (x + b) % m;
    }
    return r;
  };

  BloomFilter.prototype.add = function(v) {
    var l = this.locations(v + ""),
        k = this.k,
        buckets = this.buckets;
    for (var i = 0; i < k; ++i) buckets[Math.floor(l[i] / 32)] |= 1 << (l[i] % 32);
  };

  BloomFilter.prototype.test = function(v) {
    var l = this.locations(v + ""),
        k = this.k,
        buckets = this.buckets;
    for (var i = 0; i < k; ++i) {
      var b = l[i];
      if ((buckets[Math.floor(b / 32)] & (1 << (b % 32))) === 0) {
        return false;
      }
    }
    return true;
  };

  // Estimated cardinality.
  BloomFilter.prototype.size = function() {
    var buckets = this.buckets,
        bits = 0;
    for (var i = 0, n = buckets.length; i < n; ++i) bits += popcnt(buckets[i]);
    return -this.m * Math.log(1 - bits / this.m) / this.k;
  };

  // http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
  function popcnt(v) {
    v -= (v >> 1) & 0x55555555;
    v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
    return ((v + (v >> 4) & 0xf0f0f0f) * 0x1010101) >> 24;
  }

  // Fowler/Noll/Vo hashing.
  function fnv_1a(v) {
    var a = 2166136261;
    for (var i = 0, n = v.length; i < n; ++i) {
      var c = v.charCodeAt(i),
          d = c & 0xff00;
      if (d) a = fnv_multiply(a ^ d >> 8);
      a = fnv_multiply(a ^ c & 0xff);
    }
    return fnv_mix(a);
  }

  // a * 16777619 mod 2**32
  function fnv_multiply(a) {
    return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
  }

  // One additional iteration of FNV, given a hash.
  function fnv_1a_b(a) {
    return fnv_mix(fnv_multiply(a));
  }

  // See https://web.archive.org/web/20131019013225/http://home.comcast.net/~bretm/hash/6.html
  function fnv_mix(a) {
    a += a << 13;
    a ^= a >>> 7;
    a += a << 3;
    a ^= a >>> 17;
    a += a << 5;
    return a & 0xffffffff;
  }

  return BloomFilter;
})();
