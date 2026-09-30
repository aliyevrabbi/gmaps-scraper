import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-[90vw] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto px-4 py-2.5 rounded-full ios-glass border border-neutral-200/90 dark:border-neutral-800 shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium text-neutral-900 dark:text-white animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
          {t.type === 'info' && <Info className="w-4 h-4 text-sky-500 shrink-0" />}
          <span className="truncate">{t.text}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-0.5 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
