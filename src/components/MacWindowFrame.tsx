import React from 'react';
import { X, Minus, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface MacWindowFrameProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const MacWindowFrame: React.FC<MacWindowFrameProps> = ({ isOpen, onClose, title, icon, children, maxWidthClass = 'max-w-md' }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className={`relative w-full ${maxWidthClass} bg-[var(--color-bg-card)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)] flex flex-col max-h-[90vh]`}>
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-input)] border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-2">
                <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center group"><X className="w-2 h-2 text-white opacity-0 group-hover:opacity-100" /></button>
                <div className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center group"><Minus className="w-2 h-2 text-amber-900 opacity-0 group-hover:opacity-100" /></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center group"><Maximize2 className="w-2 h-2 text-emerald-900 opacity-0 group-hover:opacity-100" /></div>
              </div>
              {icon}
              <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{title}</h3>
            </div>
            <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 overflow-y-auto no-scrollbar">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
