import React from 'react';
import { AlertCircle, RefreshCw, X, ArrowRight } from 'lucide-react';
import { ApiMode } from '../types/scraper';

interface BackendWarningBannerProps {
  apiMode: ApiMode;
  isBackendOffline: boolean;
  onSwitchToMock: () => void;
  onRetryConnection: () => void;
  onDismiss: () => void;
  backendUrl?: string;
}

export const BackendWarningBanner: React.FC<BackendWarningBannerProps> = ({
  apiMode,
  isBackendOffline,
  onSwitchToMock,
  onRetryConnection,
  onDismiss,
  backendUrl,
}) => {
  // Only show when in REST mode and backend is offline / disconnected
  if (apiMode !== 'rest' || !isBackendOffline) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 text-xs text-neutral-800 dark:text-neutral-200 transition-colors flex items-start justify-between gap-3 font-mono">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <div>
            <div className="font-semibold text-amber-700 dark:text-amber-400">
              Backend serverinə qoşulmaq mümkün olmadı.
            </div>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
              Python Playwright REST API ({backendUrl || '/api'}) hazırda əlçatmazdır və ya CORS sorğusuna cavab vermir.
              Sınaq üçün Mock rejimindən istifadə edə bilərsiniz.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={onSwitchToMock}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-[11px] font-medium transition-opacity flex items-center gap-1 active:scale-[0.98]"
            >
              <span>Mock rejiminə keç</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={onRetryConnection}
              className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-[11px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 active:scale-[0.98]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Yenidən yoxla</span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1"
        aria-label="Bağla"
        title="Bağla"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
