import React from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  onQuickStart: (query: string, location: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onQuickStart }) => {
  const samples = [
    { title: 'Stomatologiya', query: 'Stomatologiya', location: 'Bakı, Nəsimi' },
    { title: 'Kofeşoplar', query: 'Specialty Coffee', location: 'Bakı, Səbail' },
    { title: 'Gözəllik salonu', query: 'Gözəllik salonu', location: 'Bakı, Nərimanov' },
  ];

  return (
    <div className="bg-white dark:bg-[#121215] rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 p-8 sm:p-12 text-center transition-colors">
      <div className="max-w-sm mx-auto space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center text-neutral-400">
          <Search className="w-4 h-4" />
        </div>

        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 tracking-tight font-mono">
          NƏTİCƏ YOXDUR
        </h3>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Google Maps-dən biznesləri və onların Instagram hesablarını toplamaq üçün parametrləri seçib scraper-i başladın.
        </p>

        {/* Minimal presets */}
        <div className="pt-2 flex flex-wrap justify-center gap-1.5">
          {samples.map((s) => (
            <button
              key={s.title}
              onClick={() => onQuickStart(s.query, s.location)}
              className="px-2.5 py-1 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-[#18181c] hover:border-neutral-400 dark:hover:border-neutral-600 text-[11px] font-mono text-neutral-600 dark:text-neutral-300 transition-colors"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

