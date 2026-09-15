/* index.html (artifact kaynağı) -> makro-defteri.html (tek dosya) + docs/ (GitHub Pages PWA) */
const fs=require("fs"),path=require("path");

const src=fs.readFileSync("index.html","utf8");
const kes=src.indexOf('<div class="app">');
if(kes<0){console.error("gövde bulunamadı");process.exit(1);}
const kafa=src.slice(0,kes).trim(), govde=src.slice(kes).trim();

const ARKA="#F1F3ED", ARKA_KOYU="#121512";
const oku=f=>fs.readFileSync(path.join("assets",f));
const uri=(f,t)=>"data:"+t+";base64,"+oku(f).toString("base64");

/* ikonlar assets/ içinde hazır duruyor; docs/ için kopyalanır */
fs.mkdirSync("docs",{recursive:true});
const IKONLAR=["icon-180.png","icon-192.png","icon-512.jpg","icon-512m.jpg"];
IKONLAR.forEach(f=>fs.writeFileSync(path.join("docs",f),oku(f)));

function belge(o){
  const ikonlar=o.dosyali
    ? '<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">\n'+
      '<link rel="apple-touch-icon" href="icon-180.png">\n'+
      '<link rel="manifest" href="manifest.json">\n'
    : '<link rel="icon" href="'+uri("icon-192.png","image/png")+'">\n'+
      '<link rel="apple-touch-icon" href="'+uri("icon-180.jpg","image/jpeg")+'">\n';
  const sw=o.sw?'\n<script>if("serviceWorker" in navigator&&location.protocol==="https:")window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});<\/script>':"";
  return '<!doctype html>\n<html lang="tr">\n<head>\n'+
  '<meta charset="utf-8">\n'+
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+
  '<meta name="description" content="Boy ve kilona göre günlük kalori ve makro hedefini hesaplayan, yediklerini yazdıkça kalan protein, yağ ve karbonhidratı gösteren diyet defteri.">\n'+
  '<meta name="apple-mobile-web-app-capable" content="yes">\n'+
  '<meta name="mobile-web-app-capable" content="yes">\n'+
  '<meta name="apple-mobile-web-app-title" content="Makro">\n'+
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n'+
  '<meta name="theme-color" content="'+ARKA+'" media="(prefers-color-scheme: light)">\n'+
  '<meta name="theme-color" content="'+ARKA_KOYU+'" media="(prefers-color-scheme: dark)">\n'+
  ikonlar+
  '<style>\n:root{color-scheme:light dark}\nhtml{-webkit-text-size-adjust:100%}\n'+
  'body{margin:0;font:14px/1.5 "IBM Plex Sans",system-ui,-apple-system,sans-serif;background:'+ARKA+'}\n'+
  '@media (prefers-color-scheme:dark){body{background:'+ARKA_KOYU+'}}\n'+
  'img{max-width:100%}\n[hidden]{display:none!important}\n</style>\n'+
  kafa+'\n</head>\n<body>\n'+govde+sw+'\n</body>\n</html>\n';
}

fs.writeFileSync("makro-defteri.html",belge({dosyali:false,sw:false}));
fs.writeFileSync(path.join("docs","index.html"),belge({dosyali:true,sw:true}));

fs.writeFileSync(path.join("docs","manifest.json"),JSON.stringify({
  name:"Makro Defteri",short_name:"Makro",lang:"tr",dir:"ltr",
  description:"Günlük kalori ve makro hedefini hesaplayan, yediklerinin protein, yağ ve karbonhidratını takip eden diyet defteri.",
  start_url:"./",scope:"./",display:"standalone",orientation:"portrait",
  background_color:ARKA,theme_color:ARKA,
  icons:[
    {src:"icon-192.png",sizes:"192x192",type:"image/png",purpose:"any"},
    {src:"icon-512.jpg",sizes:"512x512",type:"image/jpeg",purpose:"any"},
    {src:"icon-512m.jpg",sizes:"512x512",type:"image/jpeg",purpose:"maskable"}
  ]
},null,2)+"\n");

const SURUM="makro-v"+Date.now().toString(36);
fs.writeFileSync(path.join("docs","sw.js"),
`const C=${JSON.stringify(SURUM)};
const ON=["./","./index.html","./manifest.json","./icon-192.png","./icon-180.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(ON)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(
    fetch(e.request).then(r=>{const k=r.clone();caches.open(C).then(c=>c.put(e.request,k).catch(()=>{}));return r;})
      .catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html")))
  );
});
`);
fs.writeFileSync(path.join("docs",".nojekyll"),"");
console.log("makro-defteri.html + docs/ hazır ("+SURUM+")");
