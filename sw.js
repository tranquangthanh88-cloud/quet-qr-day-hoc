const CACHE='qr48-iphone-v3-01';
const EXT='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
const LOCAL=['./','./index.html','./manifest.webmanifest','./icon.png'];
self.addEventListener('install',ev=>{ev.waitUntil((async()=>{
 const c=await caches.open(CACHE);await c.addAll(LOCAL);
 // Lưu bản jsQR tải về ở lần thiết lập ban đầu, để dùng trên lớp khi không có mạng.
 try{const r=await fetch(EXT,{mode:'no-cors'});await c.put(EXT,r)}catch(e){}
 await self.skipWaiting();
})())});
self.addEventListener('activate',ev=>{ev.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',ev=>{const url=new URL(ev.request.url);
 if(ev.request.method!=='GET')return;
 if(url.origin===self.location.origin || url.href===EXT){ev.respondWith((async()=>{
  const cached=await caches.match(ev.request);if(cached)return cached;
  try{const r=await fetch(ev.request);const c=await caches.open(CACHE);await c.put(ev.request,r.clone());return r}
  catch(e){return new Response('Ngoại tuyến: tài nguyên chưa được tải trước',{status:503})}
 })())}
});
