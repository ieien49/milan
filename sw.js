const CACHE='milano-v5',TILES='milano-tiles',MAXTILES=600;
const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-512.png','./leaflet.js','./leaflet.css'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE&&x!==TILES).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
async function trim(c){const k=await c.keys();if(k.length>MAXTILES)await Promise.all(k.slice(0,k.length-MAXTILES).map(r=>c.delete(r)))}
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(u.hostname==='tile.openstreetmap.org'){
    e.respondWith(caches.open(TILES).then(async c=>{
      const hit=await c.match(req);
      if(hit)return hit;
      const r=await fetch(req);
      if(r&&r.ok){c.put(req,r.clone()).then(()=>trim(c))}
      return r;
    }));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c))}return r}).catch(()=>hit);
    return hit||net;
  }));
});
