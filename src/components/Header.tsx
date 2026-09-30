import React from 'react';
import { Sun, Moon, Code2 } from 'lucide-react';
import { ApiMode, JobStatus } from '../types/scraper';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  apiMode: ApiMode;
  onToggleApiMode: () => void;
  onOpenApiConsole: () => void;
  jobStatus: JobStatus;
  currentJobId: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  apiMode,
  onToggleApiMode,
  onOpenApiConsole,
  jobStatus,
  currentJobId,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800/60 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-mono text-xs font-semibold shrink-0">
            M
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate tracking-tight font-mono">
              Google Maps Instagram Lead Scraper
            </h1>
          </div>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* API Mode toggle */}
          <button
            onClick={onToggleApiMode}
            className={`h-7 px-2.5 rounded-md text-[11px] font-mono transition-colors ${
              apiMode === 'mock'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}
            title="Mock və REST API arasında keçid"
          >
            {apiMode === 'mock' ? 'MOCK' : 'REST API'}
          </button>

          {/* API Docs Button */}
          <button
            onClick={onOpenApiConsole}
            title="API Sənədləri"
            className="w-7 h-7 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleDarkMode}
            className="w-7 h-7 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
            title={darkMode ? 'İşıqlı rejim' : 'Qaranlıq rejim'}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

