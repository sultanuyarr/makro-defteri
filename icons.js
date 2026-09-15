/* Makro Defteri ikonu — üç makro renginden oluşan halka.
   Bağımlılık yok: PNG'yi doğrudan kodluyoruz (zlib yerleşik). */
const zlib=require("zlib");

const ZEMIN=[0xF1,0xF3,0xED];
const DILIM=[                      // [renk, oran]  protein / yağ / karbonhidrat
  [[0x33,0x64,0x8C],0.32],
  [[0xD2,0x95,0x2A],0.28],
  [[0x5D,0x8F,0x44],0.40]
];

/* --- PNG kodlayıcı --- */
const CRC=(()=>{const t=new Int32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c;}return t;})();
function crc32(b){let c=~0;for(let i=0;i<b.length;i++)c=CRC[(c^b[i])&0xFF]^(c>>>8);return ~c>>>0;}
function parca(tip,veri){
  const u=Buffer.alloc(4);u.writeUInt32BE(veri.length,0);
  const t=Buffer.from(tip,"latin1"), g=Buffer.concat([t,veri]);
  const c=Buffer.alloc(4);c.writeUInt32BE(crc32(g),0);
  return Buffer.concat([u,g,c]);
}
function png(en,boy,rgba){
  const satir=Buffer.alloc((en*4+1)*boy);
  for(let y=0;y<boy;y++){satir[y*(en*4+1)]=0;rgba.copy(satir,y*(en*4+1)+1,y*en*4,(y+1)*en*4);}
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(en,0);ihdr.writeUInt32BE(boy,4);
  ihdr[8]=8;ihdr[9]=6;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    parca("IHDR",ihdr),
    parca("IDAT",zlib.deflateSync(satir,{level:9})),
    parca("IEND",Buffer.alloc(0))
  ]);
}

/* --- halkanın geometrisi --- */
function dilimler(kalinlik,cevre){
  const bosluk=kalinlik*0.40;                 // dilimler arası görsel boşluk
  const kullanilir=cevre-3*bosluk-3*kalinlik; // yuvarlak uçlar her dilimi kalınlık kadar uzatır
  let imlec=kalinlik/2, cikti=[];
  for(const [renk,oran] of DILIM){
    const boy=kullanilir*oran;
    cikti.push({renk,bas:imlec/cevre*2*Math.PI,son:(imlec+boy)/cevre*2*Math.PI});
    imlec+=boy+kalinlik+bosluk;
  }
  return cikti;
}

/* --- çizim: 3x3 örnekleme ile yumuşatma --- */
function ciz(boyut,olcek){
  const m=boyut/2, yaricap=boyut*0.315*olcek, kalinlik=boyut*0.134*olcek;
  const ic=yaricap-kalinlik/2, dis=yaricap+kalinlik/2;
  const cevre=2*Math.PI*yaricap;
  const segs=dilimler(kalinlik,cevre).map(s=>({
    renk:s.renk,bas:s.bas,son:s.son,
    ucA:[m+yaricap*Math.sin(s.bas),m-yaricap*Math.cos(s.bas)],
    ucB:[m+yaricap*Math.sin(s.son),m-yaricap*Math.cos(s.son)]
  }));
  const rgba=Buffer.alloc(boyut*boyut*4);
  const N=3, uc=kalinlik/2;
  for(let y=0;y<boyut;y++)for(let x=0;x<boyut;x++){
    let r=ZEMIN[0],g=ZEMIN[1],b=ZEMIN[2];
    let top=[0,0,0], sayac=0;
    for(let sy=0;sy<N;sy++)for(let sx=0;sx<N;sx++){
      const px=x+(sx+0.5)/N, py=y+(sy+0.5)/N;
      const dx=px-m, dy=py-m, d=Math.hypot(dx,dy);
      let bulundu=null;
      if(d>=ic&&d<=dis){
        let a=Math.atan2(dx,-dy); if(a<0)a+=2*Math.PI;
        for(const s of segs)if(a>=s.bas&&a<=s.son){bulundu=s.renk;break;}
      }
      if(!bulundu)for(const s of segs){
        if(Math.hypot(px-s.ucA[0],py-s.ucA[1])<=uc||Math.hypot(px-s.ucB[0],py-s.ucB[1])<=uc){bulundu=s.renk;break;}
      }
      if(bulundu){top[0]+=bulundu[0];top[1]+=bulundu[1];top[2]+=bulundu[2];sayac++;}
    }
    if(sayac){
      const k=sayac/(N*N);
      r=Math.round(top[0]/sayac*k+ZEMIN[0]*(1-k));
      g=Math.round(top[1]/sayac*k+ZEMIN[1]*(1-k));
      b=Math.round(top[2]/sayac*k+ZEMIN[2]*(1-k));
    }
    const i=(y*boyut+x)*4;
    rgba[i]=r;rgba[i+1]=g;rgba[i+2]=b;rgba[i+3]=255;
  }
  return png(boyut,boyut,rgba);
}

/* --- aynı çizimin vektör hâli (tarayıcı sekmesi için) --- */
function svg(olcek){
  const m=90, yaricap=180*0.315*olcek, kalinlik=180*0.134*olcek;
  const cevre=2*Math.PI*yaricap;
  const yollar=dilimler(kalinlik,cevre).map(s=>{
    const boy=(s.son-s.bas)/(2*Math.PI)*cevre, kayma=s.bas/(2*Math.PI)*cevre;
    const renk="#"+s.renk.map(v=>v.toString(16).padStart(2,"0")).join("");
    return '<circle cx="90" cy="90" r="'+yaricap.toFixed(2)+'" fill="none" stroke="'+renk+
      '" stroke-width="'+kalinlik.toFixed(2)+'" stroke-linecap="round" stroke-dasharray="'+
      boy.toFixed(2)+' '+cevre.toFixed(2)+'" stroke-dashoffset="'+(-kayma).toFixed(2)+
      '" transform="rotate(-90 90 90)"/>';
  }).join("");
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">'+
    '<rect width="180" height="180" fill="#F1F3ED"/>'+yollar+'</svg>';
}

module.exports={ciz,svg};
