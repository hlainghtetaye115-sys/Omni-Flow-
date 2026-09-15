import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckSquare, Calendar, Activity, X } from 'lucide-react';
import { Preferences } from '../types';

interface FloatingQuickAddProps {
  preferences: Preferences;
  onAddTask: () => void;
  onAddEvent: () => void;
  onAddHabit: () => void;
}

export const FloatingQuickAdd: React.FC<FloatingQuickAddProps> = ({ preferences, onAddTask, onAddEvent, onAddHabit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMM = preferences.lang === 'my';

  const actions = [
    { id: 'task', icon: CheckSquare, label: isMM ? 'Task အသစ်' : 'New Task', onClick: onAddTask, color: 'bg-blue-500' },
    { id: 'event', icon: Calendar, label: isMM ? 'အချိန်ဇယား/Event' : 'New Event', onClick: onAddEvent, color: 'bg-amber-500' },
    { id: 'habit', icon: Activity, label: isMM ? 'အလေ့အကျင့်' : 'New Habit', onClick: onAddHabit, color: 'bg-emerald-500' },
  ];

  return (
    <div className="fixed bottom-24 right-4 md:right-8 md:bottom-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-3 mb-4 items-end"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 group"
                >
                  <span className="bg-[var(--color-bg-card)] border border-[var(--color-border)] px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-text-primary)] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {action.label}
                  </span>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${action.color} transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_var(--color-primary-light)] transition-transform duration-300 ${isOpen ? 'bg-[var(--color-bg-input)] rotate-45 border-2 border-[var(--color-border)] text-[var(--color-text-primary)] shadow-none' : 'bg-[var(--color-primary)] hover:scale-105'}`}
      >
        {isOpen ? <Plus className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
      </button>
      
      {/* Optional overlay to close when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1] bg-black/5 dark:bg-white/5 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
