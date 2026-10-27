const CACHE='qr-iphone-v701-copyright-login-01';
const EXTRA=[
 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js'
];
const LOCAL=['./','./index.html','./manifest.webmanifest','./icon.png','./cloud-sync.js','./firebase-config.js','./hoc-sinh.html','./manifest-hoc-sinh.webmanifest','./qr-wire.js','./qrgen.js','./student-app.js','./teacher-group.js'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const c=await caches.open(CACHE);await c.addAll(LOCAL);
 for(const url of EXTRA){try{const r=await fetch(url,{mode:'no-cors'});await c.put(url,r)}catch(e){console.warn('Không tải ngoại tuyến',url,e)}}
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const k of await caches.keys())if(k.startsWith('qr')&&k!==CACHE)await caches.delete(k);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const u=new URL(event.request.url);
 if(u.origin===self.location.origin||EXTRA.includes(u.href))event.respondWith((async()=>{
  const hit=await caches.match(event.request);
  if(u.origin!==self.location.origin&&hit)return hit;
  try{const response=await fetch(event.request);if(response.ok){const c=await caches.open(CACHE);await c.put(event.request,response.clone());}return response}
  catch(e){return hit||new Response('Ứng dụng ngoại tuyến: thiếu tệp đã lưu',{status:503})}
 })());
});
