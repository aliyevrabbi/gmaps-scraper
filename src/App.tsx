import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ScraperForm } from './components/ScraperForm';
import { ProgressMetricsBar } from './components/ProgressMetricsBar';
import { ResultsView } from './components/ResultsView';
import { EmptyState } from './components/EmptyState';
import { BackendWarningBanner } from './components/BackendWarningBanner';
import { ApiConsoleModal } from './components/ApiConsoleModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { scraperApi } from './api/scraperApi';
import { exportToExcel } from './utils/excelExport';
import {
  JobStatus,
  ScrapedBusiness,
  ApiMode,
  ViewMode,
} from './types/scraper';

// Polling interval in ms (contract: 1000–1500 ms)
const POLLING_INTERVAL_MS = 1200;
const STORAGE_KEY_JOB_ID = 'leadzen_active_job_id';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gm_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('gm_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('gm_theme', 'light');
    }
  }, [darkMode]);

  // Form Inputs
  const [query, setQuery] = useState<string>('Baku dentists');
  const [location, setLocation] = useState<string>('Bakı, Nəsimi');
  const [targetCount, setTargetCount] = useState<number>(20);
  const [filename, setFilename] = useState<string>('leads.xlsx');

  // App & Job State (Default mode is 'rest' per requirement)
  const [apiMode, setApiMode] = useState<ApiMode>(() => scraperApi.getMode());
  const [isBackendOffline, setIsBackendOffline] = useState<boolean>(false);
  const [isApiConsoleOpen, setIsApiConsoleOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus>('idle');
  const [inspected, setInspected] = useState<number>(0);
  const [found, setFound] = useState<number>(0);
  const [skipped, setSkipped] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Hazırdır');
  const [results, setResults] = useState<ScrapedBusiness[]>([]);

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Polling loop ref for active job
  const pollTimerRef = useRef<any>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // Poll status function
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const statusRes = await scraperApi.getJobStatus(jobId);
      setStatus(statusRes.status);
      setInspected(statusRes.inspected);
      setFound(statusRes.found);
      setSkipped(statusRes.skipped);
      setErrors(statusRes.errors);
      setStatusMessage(statusRes.message);

      // Fetch latest leads
      const items = await scraperApi.getJobResults(jobId);
      setResults(items);

      // Stop condition per contract
      if (statusRes.status === 'completed') {
        stopPolling();
        addToast('success', `Tamamlandı! ${items.length} biznes tapıldı.`);
      } else if (statusRes.status === 'cancelled') {
        stopPolling();
      } else if (statusRes.status === 'error') {
        stopPolling();
        addToast('error', statusRes.message || 'Scraper xətası baş verdi.');
      }
    } catch (err: any) {
      stopPolling();
      setStatus('error');
      setStatusMessage(err.message || 'Backend serverinə qoşulmaq mümkün olmadı.');
      addToast('error', err.message || 'Backend serverinə qoşulmaq mümkün olmadı.');
      if (apiMode === 'rest') {
        setIsBackendOffline(true);
      }
    }
  }, [apiMode, stopPolling]);

  const startPolling = useCallback((jobId: string) => {
    stopPolling();
    // Poll immediately, then every POLLING_INTERVAL_MS
    pollJobStatus(jobId);
    pollTimerRef.current = setInterval(() => {
      pollJobStatus(jobId);
    }, POLLING_INTERVAL_MS);
  }, [pollJobStatus, stopPolling]);

  // Initial backend health check & restore active jobId from localStorage
  useEffect(() => {
    let isMounted = true;

    // 1. Initial health check if in REST mode
    if (apiMode === 'rest') {
      scraperApi.testBackendHealth().then((health) => {
        if (!isMounted) return;
        if (!health.online) {
          setIsBackendOffline(true);
        } else {
          setIsBackendOffline(false);
        }
      });
    }

    // 2. Restore active jobId from localStorage if browser was refreshed
    const savedJobId = localStorage.getItem(STORAGE_KEY_JOB_ID);
    if (savedJobId) {
      setCurrentJobId(savedJobId);
      scraperApi.getJobStatus(savedJobId)
        .then(async (statusRes) => {
          if (!isMounted) return;
          setStatus(statusRes.status);
          setInspected(statusRes.inspected);
          setFound(statusRes.found);
          setSkipped(statusRes.skipped);
          setErrors(statusRes.errors);
          setStatusMessage(statusRes.message);

          const items = await scraperApi.getJobResults(savedJobId);
          if (isMounted) setResults(items);

          if (statusRes.status === 'running') {
            startPolling(savedJobId);
            addToast('info', 'Davam edən scraping işi bərpa olundu.');
          }
        })
        .catch(() => {
          // If saved jobId is invalid, clear it
          if (isMounted) {
            localStorage.removeItem(STORAGE_KEY_JOB_ID);
          }
        });
    }

    return () => {
      isMounted = false;
      stopPolling();
    };
  }, [apiMode, startPolling, stopPolling]);

  // Toggle API Mode (Mock <-> REST)
  const handleToggleApiMode = async () => {
    const nextMode: ApiMode = apiMode === 'mock' ? 'rest' : 'mock';
    setApiMode(nextMode);
    scraperApi.setMode(nextMode);

    if (nextMode === 'rest') {
      const check = await scraperApi.testBackendHealth();
      if (!check.online) {
        setIsBackendOffline(true);
        addToast('info', 'Real REST API seçildi, lakin backend offline-dir.');
      } else {
        setIsBackendOffline(false);
        addToast('success', 'Real REST API serverinə qoşuldu.');
      }
    } else {
      setIsBackendOffline(false);
      addToast('info', 'Mock rejimi aktivləşdirildi.');
    }
  };

  // Start Scraper with Form Validation
  const handleStartScraper = async () => {
    // Disallow concurrent scraping jobs
    if (status === 'running') {
      addToast('error', 'Hazırda aktiv scraping prosesi davam edir. Yeni iş başlatmazdan əvvəl onu dayandırın.');
      return;
    }

    // Validation: Query cannot be empty
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      addToast('error', 'Zəhmət olmasa axtarış sorğusunu daxil edin.');
      return;
    }

    // Validation: Location fallback
    const cleanLocation = location.trim() || 'Bakı';

    // Validation: Target count between 1 and 100
    const cleanTargetCount = Math.min(100, Math.max(1, Number(targetCount) || 20));

    // Validation: Filename safety normalization
    let cleanFilename = filename.trim().replace(/[/\\?%*:|"<>]/g, '_');
    if (!cleanFilename) cleanFilename = 'leads.xlsx';
    if (!cleanFilename.endsWith('.xlsx') && !cleanFilename.endsWith('.xls') && !cleanFilename.endsWith('.csv')) {
      cleanFilename = `${cleanFilename}.xlsx`;
    }

    try {
      setStatus('running');
      setStatusMessage('Google Maps axtarışı başladılır...');
      setResults([]);
      setInspected(0);
      setFound(0);
      setSkipped(0);
      setErrors(0);

      const jobResponse = await scraperApi.createJob({
        query: cleanQuery,
        location: cleanLocation,
        targetCount: cleanTargetCount,
        filename: cleanFilename,
      });

      setCurrentJobId(jobResponse.jobId);
      localStorage.setItem(STORAGE_KEY_JOB_ID, jobResponse.jobId);
      addToast('success', 'Scraper işi başladıldı.');

      // Start Polling (1000-1500 ms)
      startPolling(jobResponse.jobId);
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err.message || 'Backend serverinə qoşulmaq mümkün olmadı.');
      addToast('error', err.message || 'Backend serverinə qoşulmaq mümkün olmadı.');

      if (apiMode === 'rest') {
        setIsBackendOffline(true);
      }
    }
  };

  // Stop Scraper
  const handleStopScraper = async () => {
    if (!currentJobId) return;

    try {
      await scraperApi.cancelJob(currentJobId);
      stopPolling();
      setStatus('cancelled');
      setStatusMessage('İstifadəçi tərəfindən dayandırıldı.');
      addToast('info', 'Scraper dayandırıldı. Hazırkı nəticələr saxlanıldı.');
    } catch (err: any) {
      addToast('error', `Dayandırmaq olmadı: ${err.message}`);
    }
  };

  // Export to Excel (Server binary first, local fallback second)
  const handleExport = async () => {
    if (results.length === 0) {
      addToast('error', 'Yükləmək üçün nəticə yoxdur.');
      return;
    }

    // Try server binary export if in REST mode and currentJobId exists
    if (apiMode === 'rest' && currentJobId) {
      try {
        const blob = await scraperApi.exportJobFile(currentJobId);
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename || 'leads.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        addToast('success', 'Excel faylı serverdən endirildi.');
        return;
      } catch (err: any) {
        console.warn('Server export uğursuz oldu, lokal fallback işə salınır:', err);
        addToast('info', 'Server exportu əlçatmazdır, lokal Excel faylı endirilir...');
      }
    }

    // Local fallback export using exportToExcel
    try {
      exportToExcel(results, filename);
      addToast('success', `"${filename}" faylı lokal olaraq endirildi.`);
    } catch (err: any) {
      addToast('error', `Export xətası: ${err.message}`);
    }
  };

  // Reset form & leads
  const handleReset = () => {
    stopPolling();
    setCurrentJobId(null);
    localStorage.removeItem(STORAGE_KEY_JOB_ID);
    setStatus('idle');
    setInspected(0);
    setFound(0);
    setSkipped(0);
    setErrors(0);
    setStatusMessage('Hazırdır');
    setResults([]);
    addToast('info', 'Panel sıfırlandı.');
  };

  // Quick start preset helper
  const handleQuickStart = (q: string, loc: string) => {
    setQuery(q);
    setLocation(loc);
    setTimeout(() => {
      handleStartScraper();
    }, 100);
  };

  // Copy to clipboard helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast('success', `${label} kopyalandı!`);
  };

  return (
    <div className="min-h-full flex flex-col bg-[#fbfbfd] dark:bg-[#0c0c0e] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        apiMode={apiMode}
        onToggleApiMode={handleToggleApiMode}
        onOpenApiConsole={() => setIsApiConsoleOpen(true)}
        jobStatus={status}
        currentJobId={currentJobId}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 space-y-3.5">
        {/* Backend Warning Banner if in REST mode & disconnected */}
        <BackendWarningBanner
          apiMode={apiMode}
          isBackendOffline={isBackendOffline}
          backendUrl={scraperApi.getBaseUrl()}
          onSwitchToMock={() => {
            setApiMode('mock');
            scraperApi.setMode('mock');
            setIsBackendOffline(false);
            addToast('success', 'Mock Rejiminə keçildi.');
          }}
          onRetryConnection={async () => {
            const check = await scraperApi.testBackendHealth();
            if (check.online) {
              setIsBackendOffline(false);
              addToast('success', 'Backend serverinə uğurla qoşuldu.');
            } else {
              addToast('error', 'Backend serverinə qoşulmaq mümkün olmadı.');
            }
          }}
          onDismiss={() => setIsBackendOffline(false)}
        />

        {/* Input Parameters Form */}
        <ScraperForm
          query={query}
          setQuery={setQuery}
          location={location}
          setLocation={setLocation}
          targetCount={targetCount}
          setTargetCount={setTargetCount}
          filename={filename}
          setFilename={setFilename}
          status={status}
          resultsCount={results.length}
          onStart={handleStartScraper}
          onStop={handleStopScraper}
          onExport={handleExport}
          onReset={handleReset}
        />

        {/* Progress & 4 Zen Monospace Metric Counters */}
        <ProgressMetricsBar
          status={status}
          inspected={inspected}
          found={found}
          skipped={skipped}
          errors={errors}
          targetCount={targetCount}
          statusMessage={statusMessage}
        />

        {/* Results View or Empty State */}
        {results.length > 0 || status === 'running' ? (
          <ResultsView
            results={results}
            isLoading={status === 'running'}
            onCopyText={handleCopyText}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        ) : (
          <EmptyState onQuickStart={handleQuickStart} />
        )}
      </main>

      {/* API Console & Specification Drawer/Modal */}
      <ApiConsoleModal
        isOpen={isApiConsoleOpen}
        onClose={() => setIsApiConsoleOpen(false)}
        onCopyText={handleCopyText}
      />

      {/* Dynamic Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
