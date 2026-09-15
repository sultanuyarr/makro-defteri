const C="makro-vmu2s9c2b";
const ON=["./","./index.html","./manifest.json","./icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(ON)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(
    fetch(e.request).then(r=>{const k=r.clone();caches.open(C).then(c=>c.put(e.request,k).catch(()=>{}));return r;})
      .catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html")))
  );
});
