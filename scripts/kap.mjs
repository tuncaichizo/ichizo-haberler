// Günün öne çıkan KAP bildirimlerini kap-radari.json'a yazar (Node 20+, bağımlılık yok).
// Uç yoksa, hata verirse ya da boş dönerse dosyaya dokunulmaz ve çıkış kodu 0 olur (Action başarısız sayılmaz).
import fs from 'node:fs';

const KAYNAK = 'https://ichizoterminal.com/api/kap/acik?adet=30';
const DOSYA = new URL('../kap-radari.json', import.meta.url);
const ADET = 30;
// Haberlerdeki kural: adres, kod ve referans izi taşıyan metin yayınlanmaz.
const YASAK = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|blog|io|net|org|app|xyz)\b|ref=|referral|davet kodu|invite|affiliate/i;

class Atla extends Error {}
const atla = (neden) => { console.log("kap: " + neden + ", dosya değiştirilmedi"); throw new Atla(); };

async function ana() {
let veri;
try {
  const r = await fetch(KAYNAK, { headers: { 'user-agent': 'ichizo-haberler-github-action' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) atla('kaynak HTTP ' + r.status);
  veri = await r.json();
} catch (e) {
  if (e instanceof Atla) throw e;
  atla("kaynak okunamadı (" + (e && e.name) + ")");
}
const dizi = Array.isArray(veri) ? veri : veri && Array.isArray(veri.kayitlar) ? veri.kayitlar : veri && Array.isArray(veri.items) ? veri.items : null;
if (!dizi) atla('beklenmeyen biçim');

const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const kayitlar = dizi
  .filter((x) => x && typeof x.metin === 'string' && x.metin.trim())
  .filter((x) => !YASAK.test(x.metin))
  .map((x) => ({ gun: str(x.gun), metin: x.metin.trim(), posted_at: str(x.posted_at), tweet_id: str(x.tweet_id) }))
  .sort((a, b) => b.posted_at.localeCompare(a.posted_at))
  .slice(0, ADET);

let eski = null;
try { eski = JSON.parse(fs.readFileSync(DOSYA, 'utf8')); } catch {}
if (eski && JSON.stringify(eski.kayitlar) === JSON.stringify(kayitlar)) atla('değişiklik yok');
fs.writeFileSync(DOSYA, JSON.stringify({ guncelleme: new Date().toISOString(), kayitlar }, null, 1) + '\n');
console.log('kap: yazıldı,', kayitlar.length, 'kayıt');
}
ana().catch((e) => { if (!(e instanceof Atla)) console.log("kap: beklenmeyen hata, dosya değiştirilmedi"); });
