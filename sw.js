const CACHE_NAME='kapmaca-shell-v652-pixel-polished';
const APP_SHELL=[
  './',
  './index.html',
  './gokdelen-pixel.css?v=652',
  './kapisma-pixel.css?v=652-polished',
  './assets/gokdelen-pixel/window.svg',
  './assets/gokdelen-pixel/wall.svg',
  './assets/gokdelen-pixel/roof.svg',
  './assets/gokdelen-pixel/street.svg',
  './assets/gokdelen-pixel/door.svg',
  './assets/gokdelen-pixel/city.svg',

  './app.js?v=652-kapisma-pixel',
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
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith('kapmaca-shell-')&&key!==CACHE_NAME).map(key=>caches.delete(key))))
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
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('/word-data.js') ||
      /\/meanings\/[0-9a-f]+\.json$/.test(url.pathname) ||
      url.pathname.endsWith('/manifest.webmanifest') ||
      /\.(?:png|jpg|jpeg|svg|webp)$/.test(url.pathname)
    );

  // Pixel sprites are refreshed by each version's shell install, then read locally.
  const isPixelSprite=url.pathname.startsWith('/assets/gokdelen-pixel/')&&url.pathname.endsWith('.svg');
  if(isVersionedStatic||isPixelSprite){
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

