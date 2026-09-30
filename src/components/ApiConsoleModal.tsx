import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { scraperApi } from '../api/scraperApi';

interface ApiConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyText: (text: string, label: string) => void;
}

export const ApiConsoleModal: React.FC<ApiConsoleModalProps> = ({
  isOpen,
  onClose,
  onCopyText,
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const baseUrl = scraperApi.getBaseUrl();

  const endpoints = [
    {
      method: 'POST',
      path: '/jobs',
      title: '1. Yeni iş başlat (Create Job)',
      description: 'Google Maps axtarış sorğusu üçün yeni scraping tapşırığı yaradır.',
      requestBody: JSON.stringify(
        {
          query: 'Baku dentists',
          location: 'Bakı, Nəsimi',
          targetCount: 20,
          filename: 'leads.xlsx',
        },
        null,
        2
      ),
      responseBody: JSON.stringify(
        {
          jobId: 'job_abc123',
          status: 'running',
          message: 'Scraper başladıldı',
        },
        null,
        2
      ),
    },
    {
      method: 'GET',
      path: '/jobs/:jobId',
      title: '2. İş statusunu al (Get Job Status)',
      description: 'Cari işin gedişatını, yoxlanılan, keçilən, tapılan və xəta sayını qaytarır.',
      requestBody: '// URL parametri: jobId (məs: job_abc123)',
      responseBody: JSON.stringify(
        {
          jobId: 'job_abc123',
          status: 'running',
          inspected: 34,
          skipped: 20,
          found: 5,
          errors: 1,
          message: 'Bizneslər yoxlanılır',
        },
        null,
        2
      ),
    },
    {
      method: 'GET',
      path: '/jobs/:jobId/results',
      title: '3. Nəticələri al (Get Results)',
      description: 'Aşkar edilmiş və Instagram profilləri tapılmış bizneslərin tam siyahısı.',
      requestBody: '// URL parametri: jobId',
      responseBody: JSON.stringify(
        [
          {
            businessName: 'Example Dental Studio',
            rating: 4.8,
            reviewsCount: 145,
            phoneNumber: '+994 50 123 45 67',
            instagram: 'https://instagram.com/exampledental',
            address: 'Bakı, Azərbaycan',
            googleMapsUrl: 'https://maps.google.com/?q=Example+Dental',
            category: 'Stomatologiya',
            scrapedAt: '2026-09-30 02:00:00',
          },
        ],
        null,
        2
      ),
    },
    {
      method: 'POST',
      path: '/jobs/:jobId/cancel',
      title: '4. İşi dayandır (Cancel Job)',
      description: 'Davam edən scraping prosesini dərhal saxlayır.',
      requestBody: '// URL parametri: jobId',
      responseBody: JSON.stringify(
        {
          success: true,
          message: 'Scraper dayandırıldı',
        },
        null,
        2
      ),
    },
    {
      method: 'GET',
      path: '/jobs/:jobId/export',
      title: '5. Excel faylını yüklə (Export File)',
      description: 'Server tərəfindən generasiya edilmiş binar .xlsx faylını endirir.',
      requestBody: '// URL parametri: jobId',
      responseBody: '// Binary stream: Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\n// Content-Disposition: attachment; filename="leads.xlsx"',
    },
    {
      method: 'GET',
      path: '/health',
      title: '6. Sağlamlıq yoxlaması (Health Check)',
      description: 'Backend REST API-nin işlək olub olmadığını yoxlayır.',
      requestBody: '// Request body yoxdur',
      responseBody: JSON.stringify(
        {
          status: 'ok',
        },
        null,
        2
      ),
    },
  ];

  const current = endpoints[selectedEndpoint];

  const handleCopy = (content: string) => {
    onCopyText(content, 'API Kodu');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#121215] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-mono text-xs font-semibold">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-white">
                Python Playwright REST API Müqaviləsi
              </h3>
              <p className="text-xs text-neutral-500 font-mono">
                Base URL: <span className="text-neutral-700 dark:text-neutral-300 font-semibold">{baseUrl}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Endpoint Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
            {endpoints.map((ep, idx) => (
              <button
                key={ep.path}
                onClick={() => setSelectedEndpoint(idx)}
                className={`px-2.5 py-2 rounded-lg text-xs font-mono font-medium transition-all text-left truncate ${
                  selectedEndpoint === idx
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <span
                  className={
                    ep.method === 'POST' ? 'text-amber-500 font-bold mr-1' : 'text-emerald-500 font-bold mr-1'
                  }
                >
                  {ep.method}
                </span>
                <span className="truncate">{ep.path}</span>
              </button>
            ))}
          </div>

          {/* Endpoint Details Card */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#18181c] border border-neutral-200 dark:border-neutral-800 space-y-3 font-mono">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    current.method === 'POST'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {current.method}
                </span>
                <span className="font-semibold text-neutral-900 dark:text-white">{baseUrl}{current.path}</span>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    `${current.method} ${baseUrl}${current.path}\n\nRequest:\n${current.requestBody}\n\nResponse:\n${current.responseBody}`
                  )
                }
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>

            <p className="text-xs font-sans text-neutral-600 dark:text-neutral-400">{current.description}</p>

            {/* Request */}
            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                Request nümunəsi:
              </div>
              <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-100 text-xs overflow-x-auto">
                {current.requestBody}
              </pre>
            </div>

            {/* Response */}
            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                Response nümunəsi:
              </div>
              <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-100 text-xs overflow-x-auto max-h-52">
                {current.responseBody}
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-[#121215] flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>Python Playwright REST API 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
