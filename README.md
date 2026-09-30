# LeadZen - Google Maps Instagram Lead Scraper

Google Maps üzərindən biznesləri axtaran, onların Google reytinqlərini, əlaqə nömrələrini və Instagram profillərini toplayan mobil-adaptiv, iOS estetikasında və zen minimalist monospace üslubunda hazırlanmış frontend idarəetmə paneli.

Layihə **Python Playwright REST API** backend-i ilə asanlıqla inteqrasiya olunmaq üçün tam hazırdır. Real scraping kodu frontend-də icra olunmur; bütün məlumat axını standart REST API müqaviləsi ilə tənzimlənir.

---

## 🚀 Texnoloji Yığın

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide Icons**
- **LocalStorage State Persistence**
- **Bilingual & Azerbaijani Interface**

---

## 🛠️ Quraşdırma və İşə Salma

### 1. Asılılıqların quraşdırılması
```bash
npm install
```

### 2. Ətraf mühit dəyişənləri (`.env.local`)
Lokal development üçün `.env.local` faylı yaradın və backend serverinizin ünvanını daxil edin:

```bash
# .env.local
VITE_API_BASE_URL=https://example-backend.com/api
```
> **Qeyd:** Əgər `VITE_API_BASE_URL` boş buraxılarsa və ya təyin edilməzsə, sistem avtomatik olaraq eyni host üzərindəki `/api` endpoint-lərini istifadə edir.

### 3. Development serverini işə salmaq
```bash
npm run dev
```
Tətbiq `http://localhost:3000` ünvanında açılacaq.

### 4. Production üçün build etmək
```bash
npm run build
```

### 5. TypeScript yoxlaması (Lint)
```bash
npm run lint
```

---

## 🔄 Mock və Real REST Rejimlərinin Fərqi

Tətbiq iki rejimdə işləyə bilir (sağ yuxarı başlıqdakı düymə ilə asanlıqla dəyişdirilə bilər):

| Xüsusiyyət | Real REST Rejimi (Default) | Mock Rejimi |
| :--- | :--- | :--- |
| **Məqsəd** | Canlı Python Playwright backend serverinə qoşulur | Server olmadan frontend və UI sınaqları aparmaq |
| **Məlumat Mənbəyi** | Real backend REST API cavabları | Realistik Bakı biznes toxumları (seeds) və simulyasiya |
| **Server əlçatmaz olduqda** | İstifadəçiyə aydın bildiriş və Mock-a keçid təklif edir | Müstəqil işləyir, server tələb etmir |
| **Excel Yükləmə** | Əvvəlcə serverin binar `.xlsx` faylını endirir; əlçatmazsa lokal fallback işləyir | Birbaşa brauzerdə XML Spreadsheet 2003 / UTF-8 ilə generasiya olunur |

---

## 📡 Python Playwright Backend REST API Müqaviləsi

Backend serveri aşağıdakı 6 standart endpoint-i təmin etməlidir:

### 1. Yeni scraping işi başlatmaq
- **Method:** `POST /jobs`
- **Request Body:**
  ```json
  {
    "query": "Baku dentists",
    "location": "Bakı, Nəsimi",
    "targetCount": 20,
    "filename": "leads.xlsx"
  }
  ```
- **Response:**
  ```json
  {
    "jobId": "job_abc123",
    "status": "running",
    "message": "Scraper başladıldı"
  }
  ```

### 2. İş statusunu və canlı metrikləri almaq
- **Method:** `GET /jobs/:jobId`
- **Response:**
  ```json
  {
    "jobId": "job_abc123",
    "status": "running",
    "inspected": 34,
    "skipped": 20,
    "found": 5,
    "errors": 1,
    "message": "Bizneslər yoxlanılır"
  }
  ```
- **Dəstəklənən statuslar:** `idle` | `running` | `completed` | `cancelled` | `error`

### 3. Nəticələri (Lead-ləri) almaq
- **Method:** `GET /jobs/:jobId/results`
- **Response:**
  ```json
  [
    {
      "businessName": "Baku Dental Art",
      "rating": 4.8,
      "reviewsCount": 145,
      "phoneNumber": "+994 50 123 45 67",
      "instagram": "https://instagram.com/bakudentalart",
      "address": "Nizami küç. 14, Səbail, Bakı",
      "googleMapsUrl": "https://maps.google.com/?q=Baku+Dental+Art",
      "category": "Stomatologiya",
      "scrapedAt": "2026-09-30 02:00:00"
    }
  ]
  ```

### 4. Davam edən işi dayandırmaq
- **Method:** `POST /jobs/:jobId/cancel`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Scraper dayandırıldı"
  }
  ```

### 5. Excel faylını serverdən yükləmək
- **Method:** `GET /jobs/:jobId/export`
- **Response:** Binar `.xlsx` axını (`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

### 6. Backend sağlamlıq yoxlaması
- **Method:** `GET /health`
- **Response:**
  ```json
  {
    "status": "ok"
  }
  ```

---

## 📱 Əsas Funksiyalar və Davranış

1. **Gözlənilməz Səhifə Yenilənməsi:** Aktiv `jobId` brauzerin `localStorage`-da saxlanılır. İstifadəçi səhifəni yenilədikdə scraping gedişatı və nəticələri itmir.
2. **Paralel Sorğu Qorunması:** Eyni vaxtda ikinci bir scraping işinin başladılmasına icazə verilmir.
3. **İkiqat Görünüş:** Nəticələr həm mobil toxunma kartları, həm də masaüstü cədvəl şəklində baxıla bilər.
4. **İkiqat Excel Export:** Server faylı endirilə bilmədikdə avtomatik olaraq brauzerdəki nəticələrdən UTF-8 dəstəkli lokal Excel `.xlsx` faylı yaradılır.
5. **Axtarış və Süzgəc:** Toplanan lead-lər içərisində biznes adı, telefon və ya ünvan üzrə canlı axtarış imkanı.
