/**
 * Scraper REST API Client & Realistic Mock Engine
 *
 * Designed for seamless integration with Python Playwright backend REST API:
 * - Base URL configured via VITE_API_BASE_URL (defaults to /api)
 * - POST /jobs
 * - GET /jobs/:jobId
 * - GET /jobs/:jobId/results
 * - POST /jobs/:jobId/cancel
 * - GET /jobs/:jobId/export (binary .xlsx)
 * - GET /health
 */

import {
  CreateJobPayload,
  CreateJobResponse,
  ScraperJobStatusResponse,
  ScrapedBusiness,
  CancelJobResponse,
  HealthResponse,
  ApiMode,
} from '../types/scraper';

// Configurable fetch timeout in milliseconds
const FETCH_TIMEOUT_MS = 10000;

/**
 * Realistic mock business templates for Baku and Azerbaijan locations
 */
interface SeedBusiness {
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  phone: string;
  insta: string;
  address: string;
}

const BAKU_BUSINESS_SEEDS: SeedBusiness[] = [
  {
    name: 'Baku White Dental Clinic',
    category: 'Stomatologiya',
    rating: 4.9,
    reviewsCount: 312,
    phone: '+994 12 498 72 10',
    insta: 'https://instagram.com/bakuwhitedental',
    address: 'Nizami küç. 142, Səbail r., Bakı',
  },
  {
    name: 'Caspian Smile Orthodontics',
    category: 'Stomatologiya',
    rating: 4.8,
    reviewsCount: 184,
    phone: '+994 50 234 56 78',
    insta: 'https://instagram.com/caspiansmile',
    address: 'Fəvvarələr meydanı 8, Səbail, Bakı',
  },
  {
    name: 'Dr. Əliyev Dental Studio',
    category: 'Stomatologiya',
    rating: 4.7,
    reviewsCount: 96,
    phone: '+994 55 810 44 22',
    insta: 'https://instagram.com/dr_aliyev_dental',
    address: 'Təbriz küç. 45, Nərimanov, Bakı',
  },
  {
    name: 'DentaLux Estetik Mərkəzi',
    category: 'Stomatologiya',
    rating: 4.9,
    reviewsCount: 420,
    phone: '+994 12 564 33 11',
    insta: 'https://instagram.com/dentalux_baku',
    address: 'Azadlıq pr. 102, Nəsimi, Bakı',
  },
  {
    name: 'Nizami Dental Art',
    category: 'Stomatologiya',
    rating: 4.6,
    reviewsCount: 145,
    phone: '+994 70 312 90 80',
    insta: 'https://instagram.com/nizami_dental_art',
    address: 'Bəşir Səfəroğlu küç. 122, Yasamal, Bakı',
  },
  {
    name: 'Entrée Cafe & Artisan Bakery',
    category: 'Kofeşop və Kafe',
    rating: 4.7,
    reviewsCount: 890,
    phone: '+994 12 497 00 23',
    insta: 'https://instagram.com/entree_azerbaijan',
    address: 'Dilarə Əliyeva küç. 251A, Nəsimi, Bakı',
  },
  {
    name: 'Coffee Moffie Roastery',
    category: 'Kofeşop',
    rating: 4.8,
    reviewsCount: 520,
    phone: '+994 50 334 11 99',
    insta: 'https://instagram.com/coffeemoffie',
    address: 'Yusif Məmmədəliyev küç. 15, Səbail, Bakı',
  },
  {
    name: 'Chado Tea & Specialty Bar',
    category: 'Kafe',
    rating: 4.5,
    reviewsCount: 168,
    phone: '+994 12 598 44 55',
    insta: 'https://instagram.com/chado_baku',
    address: 'Hüsü Hacıyev küç. 19, Yasamal, Bakı',
  },
  {
    name: 'Deniz Beauty Lounge & Spa',
    category: 'Gözəllik Salonu',
    rating: 4.8,
    reviewsCount: 275,
    phone: '+994 50 771 88 00',
    insta: 'https://instagram.com/deniz_beautylounge',
    address: 'Neftçilər pr. 67, Port Baku yaxınlığı, Bakı',
  },
  {
    name: 'Studio 11 Hair & Aesthetics',
    category: 'Gözəllik Salonu',
    rating: 4.7,
    reviewsCount: 198,
    phone: '+994 55 901 32 44',
    insta: 'https://instagram.com/studio11_baku',
    address: 'Koroğlu Rəhimov küç. 28, Nərimanov, Bakı',
  },
  {
    name: 'Aura Laser & Aesthetic Center',
    category: 'Estetik Klinika',
    rating: 4.9,
    reviewsCount: 380,
    phone: '+994 12 465 77 90',
    insta: 'https://instagram.com/aura_aesthetic_baku',
    address: 'Həsən Əliyev küç. 84, Nəsimi, Bakı',
  },
  {
    name: 'Baku Prime Fitness Club',
    category: 'Fitness & Gym',
    rating: 4.6,
    reviewsCount: 310,
    phone: '+994 12 510 66 55',
    insta: 'https://instagram.com/bakuprimefitness',
    address: 'Mətbuat pr. 23A, Yasamal, Bakı',
  },
  {
    name: 'Paul Bakery & Restaurant Baku',
    category: 'Restoran & Kafe',
    rating: 4.5,
    reviewsCount: 640,
    phone: '+994 12 499 87 00',
    insta: 'https://instagram.com/paul_baku',
    address: '28 May küç. 18, 28 Mall, Bakı',
  },
  {
    name: 'Mangal Steak House Bayil',
    category: 'Restoran',
    rating: 4.7,
    reviewsCount: 920,
    phone: '+994 50 255 11 00',
    insta: 'https://instagram.com/mangalsteakhouse',
    address: 'Qurban Abbasov küç. 34, Bayıl, Bakı',
  },
  {
    name: 'AutoStyle Detailing & Tuning',
    category: 'Avto Xidmət',
    rating: 4.8,
    reviewsCount: 155,
    phone: '+994 77 444 33 22',
    insta: 'https://instagram.com/autostyle_baku',
    address: 'Babək pr. 10, Xətai, Bakı',
  },
  {
    name: 'Grand Dental Studio',
    category: 'Stomatologiya',
    rating: 4.8,
    reviewsCount: 160,
    phone: '+994 12 596 11 88',
    insta: 'https://instagram.com/grand_dental_baku',
    address: 'Zərifə Əliyeva küç. 33, Səbail, Bakı',
  },
  {
    name: 'Caspian Art Gallery & Frame',
    category: 'İncəsənət & Qalereya',
    rating: 4.9,
    reviewsCount: 88,
    phone: '+994 12 493 55 12',
    insta: 'https://instagram.com/caspian_art_gallery',
    address: 'İçərişəhər, Qüllə küç. 14, Bakı',
  },
  {
    name: 'Barista Station Coffee Roasters',
    category: 'Kofeşop',
    rating: 4.9,
    reviewsCount: 430,
    phone: '+994 50 990 00 11',
    insta: 'https://instagram.com/baristastation_baku',
    address: 'Zərifə Əliyeva küç. 55, Səbail, Bakı',
  },
  {
    name: 'Lotos Çiçək və Hədiyyə Butiki',
    category: 'Gül Salonu',
    rating: 4.7,
    reviewsCount: 210,
    phone: '+994 55 330 22 11',
    insta: 'https://instagram.com/lotos_flowers_baku',
    address: 'İstiqlaliyyət küç. 27, Səbail, Bakı',
  },
  {
    name: 'Baku Real Estate Advisory',
    category: 'Daşınmaz Əmlak',
    rating: 4.6,
    reviewsCount: 115,
    phone: '+994 12 404 88 00',
    insta: 'https://instagram.com/baku_real_estate',
    address: 'Xocalı pr. 37, Demirchi Tower, Bakı',
  },
];

// Helper to generate a realistic Azerbaijani lead
function createLeadForQuery(query: string, location: string, index: number): ScrapedBusiness {
  const seedIndex = (index + Math.floor(Math.random() * 3)) % BAKU_BUSINESS_SEEDS.length;
  const seed = BAKU_BUSINESS_SEEDS[seedIndex];
  const querySlug = query.trim().split(' ')[0] || 'Biznes';

  const businessName =
    index < BAKU_BUSINESS_SEEDS.length && seed.category.toLowerCase().includes(querySlug.toLowerCase())
      ? seed.name
      : `${seed.name.split(' ')[0]} ${querySlug} #${index + 1}`;

  const handle = businessName
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
    2,
    '0'
  )}:${String(now.getSeconds()).padStart(2, '0')}`;

  return {
    businessName,
    rating: Number((4.3 + Math.random() * 0.7).toFixed(1)),
    reviewsCount: Math.floor(30 + Math.random() * 450),
    phoneNumber: seed.phone || '+994 50 123 45 67',
    instagram: `https://instagram.com/${handle}`,
    address: `${seed.address.split(',')[0]}, ${location || 'Bakı'}`,
    googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(businessName + ' ' + (location || 'Bakı'))}`,
    category: seed.category,
    scrapedAt: dateStr,
  };
}

// In-memory store for mock simulation
interface MockJobState {
  payload: CreateJobPayload;
  status: ScraperJobStatusResponse;
  results: ScrapedBusiness[];
  timerId: any;
}

const mockJobsStore = new Map<string, MockJobState>();

export class ScraperApiClient {
  private baseUrl: string;
  private apiMode: ApiMode = 'rest'; // Default is 'rest' per requirement

  constructor() {
    // Read from env or default to /api for local development
    const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
    this.baseUrl = envUrl ? envUrl.replace(/\/+$/, '') : '/api';

    // Check if user previously saved mode in localStorage
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('gm_scraper_mode') as ApiMode;
      if (savedMode === 'mock' || savedMode === 'rest') {
        this.apiMode = savedMode;
      }
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getMode(): ApiMode {
    return this.apiMode;
  }

  public setMode(mode: ApiMode) {
    this.apiMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gm_scraper_mode', mode);
    }
  }

  /**
   * Helper to build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  /**
   * Safe fetch with AbortController timeout & Azerbaijani error messages
   */
  private async safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Sorğu vaxtı bitdi (Timeout - backend cavab vermədi).');
      }
      // Typical network / CORS / connection refused error
      throw new Error('Backend serverinə qoşulmaq mümkün olmadı.');
    }
  }

  /**
   * Parse JSON safely with detailed error handling
   */
  private async parseJsonResponse<T>(response: Response): Promise<T> {
    let text = '';
    try {
      text = await response.text();
    } catch {
      throw new Error('Serverdən cavab oxunarkən xəta baş verdi.');
    }

    if (!response.ok) {
      let serverMsg = '';
      try {
        const errorJson = JSON.parse(text);
        serverMsg = errorJson.message || errorJson.detail || errorJson.error;
      } catch {
        // text is not JSON
      }
      throw new Error(
        serverMsg || `Server xətası: HTTP ${response.status} (${response.statusText || 'Uğursuz'})`
      );
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error('Məlumat formatı düzgün deyil (JSON parse xətası).');
    }
  }

  /**
   * 1. POST /jobs
   * Initiates a new scraping job
   */
  async createJob(payload: CreateJobPayload): Promise<CreateJobResponse> {
    if (this.apiMode === 'rest') {
      const url = this.buildUrl('/jobs');
      const response = await this.safeFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return await this.parseJsonResponse<CreateJobResponse>(response);
    }

    // --- MOCK SIMULATION ENGINE ---
    const jobId = `job_${Math.random().toString(36).substring(2, 9)}`;
    const target = Math.max(1, Math.min(100, payload.targetCount || 20));

    const initialStatus: ScraperJobStatusResponse = {
      jobId,
      status: 'running',
      inspected: 0,
      skipped: 0,
      found: 0,
      errors: 0,
      message: 'Google Maps xəritə koordinatları və bizneslər axtarılır...',
    };

    const jobState: MockJobState = {
      payload,
      status: initialStatus,
      results: [],
      timerId: null,
    };

    mockJobsStore.set(jobId, jobState);

    // Run realistic simulation step
    this.startMockSimulation(jobId, target, payload.query, payload.location || 'Bakı');

    return {
      jobId,
      status: 'running',
      message: 'Scraper başladıldı',
    };
  }

  /**
   * Internal simulation cycle for Mock mode
   */
  private startMockSimulation(jobId: string, targetCount: number, query: string, location: string) {
    const interval = setInterval(() => {
      const job = mockJobsStore.get(jobId);
      if (!job || job.status.status !== 'running') {
        clearInterval(interval);
        return;
      }

      const roll = Math.random();
      const inspectedIncrement = 1 + Math.floor(Math.random() * 2);
      job.status.inspected += inspectedIncrement;

      if (roll < 0.04) {
        // Minor bypassable error
        job.status.errors += 1;
        job.status.message = `Keçici geo-sorğu xətası aradan qaldırıldı (${job.status.errors})`;
      } else if (roll < 0.35) {
        // Business on maps without Instagram profile
        job.status.skipped += 1;
        job.status.message = `Biznes aşkar edildi, lakin Instagram profili tapılmadı (keçildi)`;
      } else {
        // Valid business found with Instagram profile
        const newLead = createLeadForQuery(query, location, job.results.length);
        job.results.unshift(newLead);
        job.status.found += 1;
        job.status.message = `Yeni lead tapıldı: ${newLead.businessName}`;
      }

      // Check completion
      if (job.status.found >= targetCount) {
        job.status.status = 'completed';
        job.status.message = `Tamamlandı! Hədəflənən ${targetCount} uyğun biznes Instagram linkləri ilə birgə toplandı.`;
        clearInterval(interval);
      }
    }, 1100);

    const job = mockJobsStore.get(jobId);
    if (job) {
      job.timerId = interval;
    }
  }

  /**
   * 2. GET /jobs/:jobId
   * Fetches real-time status and metric counters
   */
  async getJobStatus(jobId: string): Promise<ScraperJobStatusResponse> {
    if (this.apiMode === 'rest') {
      const url = this.buildUrl(`/jobs/${encodeURIComponent(jobId)}`);
      const response = await this.safeFetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      return await this.parseJsonResponse<ScraperJobStatusResponse>(response);
    }

    const job = mockJobsStore.get(jobId);
    if (!job) {
      // Return a completed/safe structure if not in memory
      return {
        jobId,
        status: 'completed',
        inspected: 20,
        skipped: 5,
        found: 15,
        errors: 0,
        message: 'Əvvəlki axtarış nəticələri bərpa olundu.',
      };
    }

    return { ...job.status };
  }

  /**
   * 3. GET /jobs/:jobId/results
   * Returns list of scraped business leads
   */
  async getJobResults(jobId: string): Promise<ScrapedBusiness[]> {
    if (this.apiMode === 'rest') {
      const url = this.buildUrl(`/jobs/${encodeURIComponent(jobId)}/results`);
      const response = await this.safeFetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      return await this.parseJsonResponse<ScrapedBusiness[]>(response);
    }

    const job = mockJobsStore.get(jobId);
    if (!job) return [];
    return [...job.results];
  }

  /**
   * 4. POST /jobs/:jobId/cancel
   * Cancels active scraper job
   */
  async cancelJob(jobId: string): Promise<CancelJobResponse> {
    if (this.apiMode === 'rest') {
      const url = this.buildUrl(`/jobs/${encodeURIComponent(jobId)}/cancel`);
      const response = await this.safeFetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });

      return await this.parseJsonResponse<CancelJobResponse>(response);
    }

    const job = mockJobsStore.get(jobId);
    if (job) {
      if (job.timerId) {
        clearInterval(job.timerId);
        job.timerId = null;
      }
      job.status.status = 'cancelled';
      job.status.message = 'İstifadəçi tərəfindən dayandırıldı.';
      return { success: true, message: 'Scraper dayandırıldı' };
    }

    return { success: true, message: 'İş dayandırıldı.' };
  }

  /**
   * 5. GET /jobs/:jobId/export
   * Downloads binary .xlsx file from server
   */
  async exportJobFile(jobId: string): Promise<Blob> {
    if (this.apiMode === 'rest') {
      const url = this.buildUrl(`/jobs/${encodeURIComponent(jobId)}/export`);
      const response = await this.safeFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Server export xətası: HTTP ${response.status}`);
      }

      return await response.blob();
    }

    throw new Error('Mock rejimində server faylı mövcud deyil, lokal export istifadə olunur.');
  }

  /**
   * 6. GET /health
   * Verifies backend connectivity
   */
  async testBackendHealth(): Promise<{ online: boolean; message: string }> {
    try {
      const url = this.buildUrl('/health');
      const response = await this.safeFetch(url, { method: 'GET' });
      if (response.ok) {
        const data = await response.json().catch(() => ({ status: 'ok' }));
        return {
          online: true,
          message: data.status === 'ok' ? 'Backend server aktivdir (status: ok)' : 'Backend aktivdir',
        };
      }
      return { online: false, message: `Backend xətası: HTTP ${response.status}` };
    } catch (err: any) {
      return {
        online: false,
        message: err.message || 'Backend serverinə qoşulmaq mümkün olmadı.',
      };
    }
  }
}

export const scraperApi = new ScraperApiClient();
