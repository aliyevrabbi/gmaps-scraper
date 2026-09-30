import React from 'react';
import { Play, Square, Download, RotateCcw } from 'lucide-react';
import { JobStatus } from '../types/scraper';

interface ScraperFormProps {
  query: string;
  setQuery: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  targetCount: number;
  setTargetCount: (val: number) => void;
  filename: string;
  setFilename: (val: string) => void;
  status: JobStatus;
  resultsCount: number;
  onStart: () => void;
  onStop: () => void;
  onExport: () => void;
  onReset: () => void;
}

export const ScraperForm: React.FC<ScraperFormProps> = ({
  query,
  setQuery,
  location,
  setLocation,
  targetCount,
  setTargetCount,
  filename,
  setFilename,
  status,
  resultsCount,
  onStart,
  onStop,
  onExport,
  onReset,
}) => {
  const isRunning = status === 'running';

  return (
    <div className="bg-white dark:bg-[#121215] rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 p-4 sm:p-5 shadow-xs transition-colors">
      {/* 4 Clean Inset Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Axtarış sorğusu */}
        <div>
          <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
            AXTARIŞ SORĞUSU
          </label>
          <input
            type="text"
            disabled={isRunning}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Məs: Baku dentists"
            className="w-full h-10 px-3 bg-neutral-50 dark:bg-[#18181c] border border-neutral-200/80 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 dark:focus:border-white transition-all disabled:opacity-50"
          />
        </div>

        {/* Şəhər/lokasiya */}
        <div>
          <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
            ŞƏHƏR / LOKASİYA
          </label>
          <input
            type="text"
            disabled={isRunning}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Məs: Bakı, Nəsimi"
            className="w-full h-10 px-3 bg-neutral-50 dark:bg-[#18181c] border border-neutral-200/80 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 dark:focus:border-white transition-all disabled:opacity-50"
          />
        </div>

        {/* Hədəf nəticə sayı */}
        <div>
          <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
            HƏDƏF SAYI
          </label>
          <input
            type="number"
            min={1}
            max={100}
            disabled={isRunning}
            value={targetCount || ''}
            onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
            placeholder="20"
            className="w-full h-10 px-3 font-mono bg-neutral-50 dark:bg-[#18181c] border border-neutral-200/80 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 dark:focus:border-white transition-all disabled:opacity-50"
          />
        </div>

        {/* Excel fayl adı */}
        <div>
          <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
            EXCEL FAYLI
          </label>
          <input
            type="text"
            disabled={isRunning}
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="leads.xlsx"
            className="w-full h-10 px-3 font-mono bg-neutral-50 dark:bg-[#18181c] border border-neutral-200/80 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 dark:focus:border-white transition-all disabled:opacity-50"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              type="button"
              onClick={onStart}
              className="h-10 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-medium text-xs sm:text-sm rounded-xl flex items-center gap-2 active:scale-[0.98] transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Scraper-i başlat</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStop}
              className="h-10 px-4 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs sm:text-sm rounded-xl flex items-center gap-2 active:scale-[0.98] transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Dayandır</span>
            </button>
          )}

          <button
            type="button"
            disabled={resultsCount === 0}
            onClick={onExport}
            className="h-10 px-3.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#16161a] hover:bg-neutral-50 dark:hover:bg-[#202026] text-neutral-800 dark:text-neutral-200 disabled:opacity-30 disabled:pointer-events-none font-medium text-xs sm:text-sm rounded-xl flex items-center gap-2 active:scale-[0.98] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span>Excel-i yüklə</span>
            {resultsCount > 0 && (
              <span className="font-mono text-xs opacity-60">({resultsCount})</span>
            )}
          </button>
        </div>

        {!isRunning && (query || location || resultsCount > 0) && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-mono text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1 transition-colors px-2 py-1"
            title="Formanı və nəticələri sıfırla"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Sıfırla</span>
          </button>
        )}
      </div>
    </div>
  );
};

