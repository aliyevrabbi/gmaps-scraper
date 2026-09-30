
## 5. Render Free deploy

Bu repo üçün `Dockerfile`, `render.yaml` və `.dockerignore` hazırdır. Ən asan yol:

1. Layihəni GitHub repository-yə yükləyin.
2. Render-də **New → Web Service** seçin.
3. GitHub repository-ni qoşun.
4. Render `render.yaml` faylını oxuyacaq və Docker runtime seçəcək.
5. Planı **Free** saxlayın və deploy edin.
6. Yaranan `https://...onrender.com` ünvanını telefonda açın.

Render Free xidmətləri 15 dəqiqə trafik olmadıqda yuxuya gedir və növbəti açılış təxminən bir dəqiqə çəkə bilər. Aylıq 750 pulsuz instance saatı var; lokal fayllar restart/redeploy zamanı silinir. Bu səbəbdən Excel faylları yalnız həmin işin müddətində serverdə saxlanır və dərhal telefona endirilməlidir.

Qeyd: Playwright/Chromium pulsuz 512 MB instansiyada ağır ola bilər. Kiçik testlər işləyə bilər, lakin uzun scraping üçün servis RAM səbəbilə dayana bilər.
