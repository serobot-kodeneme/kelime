const CACHE_NAME='kapmaca-shell-v667-maintenance';
const APP_SHELL=[
  './',
  './index.html',
  './gokdelen-menu.css?v=667',
  // GÖKDELEN game CSS, network code and pixel scenery load on demand from the page;
  // do not duplicate them in the install-time shell cache.
  './app.js?v=667-gokdelen-maintenance',
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

function storeResponse(event,key,response){
  if(!response||!response.ok)return;
  const copy=response.clone();
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache=>cache.put(key,copy))
    .catch(()=>{}));
}

function cacheFirst(event){
  const request=event.request;
  return caches.match(request).then(cached=>{
    if(cached)return cached;
    return fetch(request).then(response=>{
      storeResponse(event,request,response);
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
        .then(async response=>{
          if(response&&response.status>=500){
            const cached=await caches.match('./index.html');
            if(cached)return cached;
          }
          // All room links use the same app shell; don't cache one HTML copy per room.
          storeResponse(event,'./index.html',response);
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
      url.pathname.endsWith('/gokdelen-network.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('/word-data.js') ||
      /\/meanings\/[0-9a-f]+\.json$/.test(url.pathname) ||
      url.pathname.endsWith('/manifest.webmanifest') ||
      /\.(?:png|jpg|jpeg|svg|webp)$/.test(url.pathname)
    );

  // Pixel sprites are refreshed by each version's shell install, then read locally.
  const isPixelSprite=url.pathname.startsWith('/assets/gokdelen-pixel/')&&url.pathname.endsWith('.svg');
  if(isVersionedStatic||isPixelSprite){
    event.respondWith(cacheFirst(event));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response=>{
        storeResponse(event,event.request,response);
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});

