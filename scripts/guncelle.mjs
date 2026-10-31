// İchizo Terminal'in yayınlanmış Türkçe haberlerini son-haberler.json'a yazar (Node 20+, bağımlılık yok).
// kriptoanalizleri.com/haberler/ bu dosyayı GitHub'dan okur; site ziyaretçileri terminale (Replit) hiç istek atmaz.
// Kaynak: https://ichizoterminal.com/api/tweets. Yalnız status === "posted" kayıtlar alınır (uç başarısız denemeleri de döndürür).
// newsTitle (kaynağın İngilizce başlığı) alınmaz; tweetText terminalin kendi Türkçe metnidir.
import fs from 'node:fs';

const KAYNAK = 'https://ichizoterminal.com/api/tweets?limit=40';
const DOSYA = new URL('../son-haberler.json', import.meta.url);
const ADET = 20;
// Ağ kuralı: dış site adresi, kod ve referans izi taşıyan metin yayınlanmaz (adres içeren her metin elenir).
const YASAK = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|blog|io|net|org|app|xyz)\b|ref=|referral|davet kodu|invite|affiliate/i;

const r = await fetch(KAYNAK, { headers: { 'user-agent': 'ichizo-haberler-github-action' } });
if (!r.ok) { console.error('kaynak HTTP', r.status); process.exit(1); }
const veri = await r.json();
if (!Array.isArray(veri)) { console.error('beklenmeyen biçim'); process.exit(1); }

const haberler = veri
  .filter((x) => x && x.status === 'posted' && typeof x.tweetText === 'string' && x.tweetText.trim())
  .filter((x) => !YASAK.test(x.tweetText))
  .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  .slice(0, ADET)
  .map((x) => ({ id: x.id, metin: x.tweetText.trim(), tarih: x.createdAt }));

if (!haberler.length) { console.error('yayınlanmış haber yok, dosya değiştirilmedi'); process.exit(0); }

const yeni = { kaynak: 'https://ichizoterminal.com/tweets', haberler };
let eski = null;
try { eski = JSON.parse(fs.readFileSync(DOSYA, 'utf8')); } catch {}
// Haberler aynıysa dosyaya dokunma (gereksiz commit olmasın); "guncelleme" alanı yalnız içerik değişince yenilenir.
if (eski && JSON.stringify(eski.haberler) === JSON.stringify(haberler)) { console.log('değişiklik yok'); process.exit(0); }
fs.writeFileSync(DOSYA, JSON.stringify({ guncelleme: new Date().toISOString(), ...yeni }, null, 1) + '\n');
console.log('yazıldı:', haberler.length, 'haber, en yenisi', haberler[0].tarih);
