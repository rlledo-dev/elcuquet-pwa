const CACHE='elcuquet-pwa-0.1.13';
const ASSETS=['./index.html','./app.js','./style.css','./manifest.webmanifest','./logo.jpeg','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(async cache=>{
  await Promise.all(ASSETS.map(async path=>{
   const response=await fetch(new Request(path,{cache:'reload'}));
   if(!response.ok)throw Error('Recurso no disponible: '+path);
   await cache.put(path,response);
  }));
 }));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('elcuquet-pwa-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 const url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith('/elcuquet-pwa/'))return;
 // Version y catálogo: red primero, copia local únicamente para uso sin conexión.
 if(url.pathname.endsWith('/version.json')||url.pathname.endsWith('/catalog.json')){
  event.respondWith(fetch(new Request(request,{cache:'no-store'})).then(response=>{
   if(response.ok&&!url.pathname.endsWith('/version.json')){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./catalog.json',copy)))}
   return response;
  }).catch(async()=>url.pathname.endsWith('/catalog.json')?(await caches.match('./catalog.json')||new Response('Sin conexión',{status:503})):new Response('Sin conexión',{status:503})));
  return;
 }
 // Red primero para HTML/JS/CSS. Cache solo para funcionar sin conexión.
 event.respondWith(fetch(new Request(request,{cache:'no-store'})).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request.mode==='navigate'?'./index.html':request,copy)))}
  return response;
 }).catch(async()=>{
  const cached=await caches.match(request.mode==='navigate'?'./index.html':request);
  return cached||new Response('Sin conexión',{status:503});
 }));
});
