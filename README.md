# Makro Defteri

Türkçe kalori ve makro takip uygulaması. Boy, kilo, yaş ve hareket düzeyine göre
günlük kalori hedefini Mifflin-St Jeor formülüyle hesaplar; yediklerini
ekledikçe kalan protein, yağ ve karbonhidratı gösterir.

**Uygulama:** `docs/` klasöründe yayınlanır (GitHub Pages).

## Özellikler

- Kalori ve makro hedefi hesabı (BMR → günlük yakım → hedef açık)
- 161 Türk yemeği ve temel gıdadan oluşan gömülü veritabanı, porsiyon bazlı
- Öğün öğün günlük kayıt, kalan makro göstergeleri, su takibi
- Son 14 günün kalori geçmişi ve kilo eğilim grafiği
- Çevrimdışı çalışır, veriler tarayıcıda saklanır, ana ekrana eklenebilir

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Kaynak sürüm (Claude artifact olarak yayınlanan hâli) |
| `build.js` | Kaynaktan yayın sürümlerini üretir |
| `docs/` | GitHub Pages'in yayınladığı klasör |
| `makro-defteri.html` | Tek dosyalık, sunucusuz sürüm |

Kaynağı değiştirdikten sonra `node build.js` çalıştır, sonra commit'le.

## Not

Besin değerleri ortalama tahminlerdir; marka ve pişirme yöntemine göre değişir.
Tıbbi tavsiye değildir.
