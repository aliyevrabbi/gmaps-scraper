import React from 'react';
import { JobStatus } from '../types/scraper';

interface ProgressMetricsBarProps {
  status: JobStatus;
  inspected: number;
  found: number;
  skipped: number;
  errors: number;
  targetCount: number;
  statusMessage: string;
}

export const ProgressMetricsBar: React.FC<ProgressMetricsBarProps> = ({
  status,
  inspected,
  found,
  skipped,
  errors,
  targetCount,
  statusMessage,
}) => {
  const isRunning = status === 'running';
  const progressPercent = targetCount > 0 ? Math.min(100, Math.round((found / targetCount) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-[#121215] rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 p-4 sm:p-5 shadow-xs transition-colors space-y-4">
      {/* Top row: Status message & Progress percent */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning
                  ? 'bg-amber-500 animate-pulse'
                  : status === 'completed'
                  ? 'bg-emerald-500'
                  : status === 'cancelled'
                  ? 'bg-rose-500'
                  : 'bg-neutral-400'
              }`}
            />
            <span className="truncate">{statusMessage || 'Gözləmədədir'}</span>
          </div>

          <span className="tabular-nums font-medium text-neutral-900 dark:text-white">
            {progressPercent}% <span className="text-neutral-400 dark:text-neutral-500 font-normal">({found}/{targetCount})</span>
          </span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-900 dark:bg-white transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4 Zen Monospace Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/60 font-mono">
        {/* Yoxlanılan */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-neutral-50 dark:bg-[#18181c]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
            YOXLANILAN
          </div>
          <div className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white tabular-nums mt-0.5">
            {inspected}
          </div>
        </div>

        {/* Tapılan */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-neutral-50 dark:bg-[#18181c]">
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
            TAPILAN
          </div>
          <div className="text-lg sm:text-xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
            {found}
          </div>
        </div>

        {/* Keçilən */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-neutral-50 dark:bg-[#18181c]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
            KEÇİLƏN
          </div>
          <div className="text-lg sm:text-xl font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums mt-0.5">
            {skipped}
          </div>
        </div>

        {/* Xəta */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-neutral-50 dark:bg-[#18181c]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
            XƏTA
          </div>
          <div className={`text-lg sm:text-xl font-semibold tabular-nums mt-0.5 ${
            errors > 0 ? 'text-rose-500' : 'text-neutral-900 dark:text-white'
          }`}>
            {errors}
          </div>
        </div>
      </div>
    </div>
  );
};

