const CACHE_NAME='kapmaca-shell-v612-maintenance';
const APP_SHELL=[
  './',
  './index.html',
  './app.js?v=612-maintenance',
  './manifest.webmanifest?v=593',
  './favicon-32.png?v=593',
  './apple-touch-icon.png?v=593',
  './icon-192.png?v=593',
  './icon-512.png?v=593',
  './icon-maskable-512.png?v=593'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(APP_SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

function cacheFirst(request){
  return caches.match(request).then(cached=>{
    if(cached)return cached;
    return fetch(request).then(response=>{
      if(response&&response.ok){
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
      }
      return response;
    });
  });
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  if(url.pathname.startsWith('/__/')) return;

  const isNavigation =
    event.request.mode==='navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname==='/';

  if(isNavigation){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>{
          if(response&&response.ok){
            const copy=response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
          }
          return response;
        })
        .catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }

  const isVersionedStatic =
    url.searchParams.has('v') &&
    (
      url.pathname.endsWith('/app.js') ||
      url.pathname.endsWith('/word-data.js') ||
      url.pathname.endsWith('/manifest.webmanifest') ||
      /\.(?:png|jpg|jpeg|svg|webp)$/.test(url.pathname)
    );

  if(isVersionedStatic){
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response=>{
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});
