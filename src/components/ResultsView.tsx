import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Phone,
  MapPin,
  Star,
  Copy,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Instagram,
  Check,
} from 'lucide-react';
import { ScrapedBusiness, ViewMode } from '../types/scraper';

interface ResultsViewProps {
  results: ScrapedBusiness[];
  isLoading: boolean;
  onCopyText: (text: string, label: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  results,
  isLoading,
  onCopyText,
  viewMode,
  setViewMode,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhone = (phone: string, id: string) => {
    onCopyText(phone, 'Telefon');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredResults = useMemo(() => {
    if (!searchFilter.trim()) return results;
    const q = searchFilter.toLowerCase();
    return results.filter(
      (b) =>
        b.businessName.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.phoneNumber.toLowerCase().includes(q) ||
        b.instagram.toLowerCase().includes(q)
    );
  }, [results, searchFilter]);

  return (
    <div className="space-y-3">
      {/* Calm Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#121215] p-3 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
            NƏTİCƏLƏR
          </span>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            {filteredResults.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Axtar (ad, telefon)..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-neutral-50 dark:bg-[#18181c] border border-neutral-200/80 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-[#18181c] text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title="Kart görünüşü"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#18181c] text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title="Cədvəl görünüşü"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* No matching search results */}
      {filteredResults.length === 0 && results.length > 0 && (
        <div className="p-8 text-center bg-white dark:bg-[#121215] rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 text-xs text-neutral-500 font-mono">
          Axtarışa uyğun biznes tapılmadı.{' '}
          <button
            onClick={() => setSearchFilter('')}
            className="underline text-neutral-800 dark:text-neutral-200 cursor-pointer ml-1"
          >
            Təmizlə
          </button>
        </div>
      )}

      {/* 1. Mobile & Tablet Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredResults.map((business, index) => {
            const rowKey = `${business.businessName}-${index}`;
            const cleanPhone = business.phoneNumber.replace(/\s+/g, '');

            return (
              <div
                key={rowKey}
                className="bg-white dark:bg-[#121215] rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 p-4 flex flex-col justify-between transition-colors space-y-3"
              >
                <div>
                  {/* Top: Name & Rating */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm text-neutral-900 dark:text-white leading-snug">
                      {business.businessName}
                    </h3>
                    <div className="shrink-0 flex items-center gap-1 font-mono text-xs text-amber-600 dark:text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{business.rating.toFixed(1)}</span>
                      <span className="text-neutral-400 text-[10px]">({business.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-1.5 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{business.address}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-neutral-700 dark:text-neutral-300">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      <a href={`tel:${cleanPhone}`} className="hover:underline">
                        {business.phoneNumber}
                      </a>
                    </div>
                    <button
                      onClick={() => handleCopyPhone(business.phoneNumber, rowKey)}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      title="Nömrəni kopyala"
                    >
                      {copiedId === rowKey ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                  <a
                    href={business.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-[#18181c] text-neutral-600 dark:text-neutral-300 text-xs font-mono flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {business.instagram ? (
                    <a
                      href={business.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram-ı aç</span>
                    </a>
                  ) : (
                    <div className="flex-1 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 text-neutral-400 text-xs font-mono flex items-center justify-center">
                      IG yoxdur
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Desktop Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#121215] rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 dark:bg-[#18181c] border-b border-neutral-200/80 dark:border-neutral-800 text-neutral-500 font-mono">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 font-medium">Biznes Adı</th>
                  <th className="py-2.5 px-3 font-medium">Reytinq</th>
                  <th className="py-2.5 px-3 font-medium">Telefon</th>
                  <th className="py-2.5 px-3 font-medium">Ünvan</th>
                  <th className="py-2.5 px-3 font-medium text-right">Keçidlər</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredResults.map((business, index) => {
                  const cleanPhone = business.phoneNumber.replace(/\s+/g, '');
                  return (
                    <tr
                      key={`t-${index}`}
                      className="hover:bg-neutral-50 dark:hover:bg-[#16161a] transition-colors"
                    >
                      <td className="py-3 px-3 font-mono text-neutral-400 text-center">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 font-medium text-neutral-900 dark:text-neutral-100">
                        {business.businessName}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          ★ {business.rating.toFixed(1)}
                        </span>{' '}
                        <span className="text-neutral-400 text-[11px]">({business.reviewsCount})</span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <a href={`tel:${cleanPhone}`} className="hover:underline">
                          {business.phoneNumber}
                        </a>
                      </td>
                      <td className="py-3 px-3 text-neutral-500 max-w-xs truncate">
                        {business.address}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={business.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            title="Google Maps"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          {business.instagram && (
                            <a
                              href={business.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-medium text-[11px] flex items-center gap-1"
                            >
                              <Instagram className="w-3 h-3" />
                              <span>Instagram</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
