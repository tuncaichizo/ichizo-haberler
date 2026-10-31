# ichizo-haberler

İchizo Terminal'in (https://ichizoterminal.com) yayınlanmış son Türkçe haberleri, tek bir JSON dosyası olarak.

- `son-haberler.json`: en yeni 20 haber (`id`, `metin`, `tarih`) ve kaynak sayfası.
- `scripts/guncelle.mjs`: dosyayı terminalin `/api/tweets` ucundan üretir. Yalnız yayınlanmış (`posted`) kayıtları alır.
- `.github/workflows/guncelle.yml`: her 30 dakikada bir çalışır. Haberler değiştiyse commit eder.

kriptoanalizleri.com/haberler/ bu dosyayı `raw.githubusercontent.com` üzerinden okur. Böylece site ziyaretçileri terminalin sunucusuna istek atmaz ve ek maliyet doğmaz.
