/* Cache only this public connection screen and icons. Accounts, API calls and game
   pages always use the network, so installs cannot replay stale personal data. */
const APP_CACHE='mochi-app-v1';
const OFFLINE_PAGE='/offline.html';
const PUBLIC_FILES=[OFFLINE_PAGE,'/icons/mochi-192.png','/icons/mochi-512.png','/icons/mochi-180.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(APP_CACHE).then(cache=>cache.addAll(PUBLIC_FILES)));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(name=>name.startsWith('mochi-app-')&&name!==APP_CACHE).map(name=>caches.delete(name)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname==='/api'||url.pathname.startsWith('/api/'))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).catch(async()=>await caches.match(OFFLINE_PAGE,{cacheName:APP_CACHE})||Response.error()));
 }else if(PUBLIC_FILES.includes(url.pathname)&&!url.search){
  event.respondWith(fetch(request).catch(async()=>await caches.match(url.pathname,{cacheName:APP_CACHE})||Response.error()));
 }
});
