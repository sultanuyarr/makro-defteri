/* index.html (artifact kaynağı) -> makro-defteri.html (tek dosya) + site/ (GitHub Pages PWA) */
const fs=require("fs"),path=require("path");

const src=fs.readFileSync("index.html","utf8");
const kes=src.indexOf('<div class="app">');
if(kes<0){console.error("gövde bulunamadı");process.exit(1);}
const kafa=src.slice(0,kes).trim(), govde=src.slice(kes).trim();

const ARKA="#F1F3ED", ARKA_KOYU="#121512", VURGU="#C8452B", MUREKKEP="#151A17";

function ikonSvg(maskable){
  const pad=maskable?26:0, r=maskable?0:40, kr=58-(maskable?10:0);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">'+
    '<rect width="180" height="180" rx="'+r+'" fill="'+ARKA+'"/>'+
    '<g transform="translate(90 90) scale('+(maskable?0.72:1)+') translate(-90 -90)">'+
    '<circle cx="90" cy="90" r="58" fill="none" stroke="#E2E6DB" stroke-width="13"/>'+
    '<circle cx="90" cy="90" r="58" fill="none" stroke="'+VURGU+'" stroke-width="13" stroke-linecap="round" stroke-dasharray="268 365" transform="rotate(-90 90 90)"/>'+
    '<text x="90" y="91" text-anchor="middle" dominant-baseline="central" font-family="Helvetica,Arial,sans-serif" font-weight="700" font-size="62" fill="'+MUREKKEP+'">M</text>'+
    '</g></svg>';
}

function belge(opts){
  const ekBas=opts.manifest?'<link rel="manifest" href="manifest.json">\n<link rel="apple-touch-icon" href="icon.svg">\n':"";
  const ikonHref=opts.manifest?"icon.svg":"data:image/svg+xml,"+encodeURIComponent(ikonSvg(false));
  const sw=opts.sw?'\n<script>if("serviceWorker" in navigator&&location.protocol==="https:")window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});<\/script>':"";
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
  '<link rel="icon" href="'+ikonHref+'">\n'+ekBas+
  '<style>\n:root{color-scheme:light dark}\nhtml{-webkit-text-size-adjust:100%}\n'+
  'body{margin:0;font:14px/1.5 "IBM Plex Sans",system-ui,-apple-system,sans-serif;background:'+ARKA+'}\n'+
  '@media (prefers-color-scheme:dark){body{background:'+ARKA_KOYU+'}}\n'+
  'img{max-width:100%}\n[hidden]{display:none!important}\n</style>\n'+
  kafa+'\n</head>\n<body>\n'+govde+sw+'\n</body>\n</html>\n';
}

/* tek dosya sürümü */
fs.writeFileSync("makro-defteri.html",belge({manifest:false,sw:false}));

/* GitHub Pages sürümü */
fs.mkdirSync("docs",{recursive:true});
fs.writeFileSync(path.join("docs","index.html"),belge({manifest:true,sw:true}));
fs.writeFileSync(path.join("docs","icon.svg"),ikonSvg(false));
fs.writeFileSync(path.join("docs","icon-maskable.svg"),ikonSvg(true));
fs.writeFileSync(path.join("docs","manifest.json"),JSON.stringify({
  name:"Makro Defteri",short_name:"Makro",lang:"tr",dir:"ltr",
  description:"Günlük kalori ve makro hedefini hesaplayan, yediklerinin protein, yağ ve karbonhidratını takip eden diyet defteri.",
  start_url:"./",scope:"./",display:"standalone",orientation:"portrait",
  background_color:ARKA,theme_color:ARKA,
  icons:[{src:"icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any"},
         {src:"icon-maskable.svg",sizes:"any",type:"image/svg+xml",purpose:"maskable"}]
},null,2)+"\n");

/* çevrimdışı çalışsın: ağ önce, olmazsa önbellek */
const SURUM="makro-v"+Date.now().toString(36);
fs.writeFileSync(path.join("docs","sw.js"),
`const C=${JSON.stringify(SURUM)};
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
`);
fs.writeFileSync(path.join("docs",".nojekyll"),"");
console.log("makro-defteri.html + docs/ hazır ("+SURUM+")");
