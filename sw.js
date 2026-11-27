const CACHE='elcuquet-pwa-0.1.25';
const ASSETS=['./index.html','./app.js?v=0.1.25','./style.css?v=0.1.25','./manifest.webmanifest','./logo.jpeg','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.allSettled(ASSETS.map(async path=>{
   const response=await fetch(new Request(path,{cache:'reload'}));
   if(response.ok)await cache.put(path,response);
  }));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith('/elcuquet-pwa/'))return;
 const version=url.pathname.endsWith('/version.json'),catalog=url.pathname.endsWith('/catalog.json');
 const key=request.mode==='navigate'?'./index.html':catalog?'./catalog.json':request;
 event.respondWith((async()=>{
  try{
   const response=await fetch(new Request(request,{cache:'no-store'}));
   if(response.ok){
    if(!version){try{await (await caches.open(CACHE)).put(key,response.clone())}catch{}}
    return response;
   }
   if(version)return response;
  }catch{}
  if(!version){
   const current=await caches.open(CACHE);
   const cached=await current.match(key)||await caches.match(key);
   if(cached)return cached;
  }
  if(request.mode==='navigate')return new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><h1>El Cuquet</h1><p>No se pudo cargar la aplicación. Comprueba la conexión.</p><a href="./index.html">Volver a intentar</a>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
  return new Response('Sin conexión',{status:503});
 })());
});
