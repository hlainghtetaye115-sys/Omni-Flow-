import React from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

interface AlertBannerProps {
  message: string | null;
  type: 'success' | 'warning' | 'danger' | 'info';
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ message, type, onClose, actionLabel, onAction }) => {
  if (!message) return null;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-l-4 border-amber-600 dark:bg-amber-950/60 dark:text-amber-200';
      case 'danger':
        return 'bg-red-50 text-red-800 border-l-4 border-red-600 dark:bg-red-950/60 dark:text-red-200';
      default:
        return 'bg-blue-50 text-blue-800 border-l-4 border-blue-600 dark:bg-blue-950/60 dark:text-blue-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />;
      case 'danger': return <AlertOctagon className="w-4 h-4 text-red-600 flex-shrink-0" />;
      default: return <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    }
  };

  return (
    <div className={`p-3 rounded-xl mb-3 flex items-center justify-between gap-2 font-semibold text-sm shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${getStyle()}`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getIcon()}
        <span className="truncate">{message}</span>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className="ml-2 px-3 py-1 rounded-lg bg-black/15 dark:bg-white/20 hover:bg-black/25 dark:hover:bg-white/30 text-current text-xs font-bold transition-all active:scale-95 cursor-pointer flex-shrink-0 shadow-xs touch-manipulation"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <button onClick={onClose} className="bg-transparent border-none text-current cursor-pointer opacity-60 hover:opacity-100 p-1 rounded-full transition-all flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
