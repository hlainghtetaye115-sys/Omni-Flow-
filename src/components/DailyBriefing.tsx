import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sunrise, Moon, CheckSquare, Target, X, Check, ArrowRight } from 'lucide-react';
import { Preferences } from '../types';

interface DailyBriefingProps {
  preferences: Preferences;
  userName: string;
  tasks: string[];
  eventsCount: number;
  onClose: () => void;
}

export const DailyBriefing: React.FC<DailyBriefingProps> = ({ preferences, userName, tasks, eventsCount, onClose }) => {
  const isMM = preferences.lang === 'my';
  const hour = new Date().getHours();
  
  // Determine if it's morning (5 AM to 11 AM) or evening (5 PM to 11 PM)
  const isMorning = hour >= 5 && hour < 12;
  const isEvening = hour >= 17 && hour < 24;
  
  const [step, setStep] = useState(1);

  if (!isMorning && !isEvening) return null; // Shouldn't be rendered, but safe check

  const greeting = isMorning 
    ? (isMM ? `မင်္ဂလာနံနက်ခင်းပါ၊ ${userName} 🌅` : `Good Morning, ${userName} 🌅`)
    : (isMM ? `မင်္ဂလာညချမ်းပါ၊ ${userName} 🌙` : `Good Evening, ${userName} 🌙`);

  const title = isMorning
    ? (isMM ? 'ဒီနေ့အတွက် အရေးကြီးဆုံး လုပ်စရာတွေက ဘာတွေလဲ?' : "Let's plan your day")
    : (isMM ? 'ဒီနေ့ ဘယ်လောက် ပြီးမြောက်ခဲ့လဲ?' : "Let's review your day");

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[var(--color-bg-body)]/60 backdrop-blur-md sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full sm:max-w-md bg-[var(--color-bg-card)] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className={`p-6 relative overflow-hidden ${isMorning ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20' : 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-20">
            {isMorning ? <Sunrise className="w-32 h-32" /> : <Moon className="w-32 h-32" />}
          </div>
          <div className="relative z-10">
            <button onClick={onClose} className="absolute top-0 right-0 p-1 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors">
              <X className="w-4 h-4 text-[var(--color-text-primary)]" />
            </button>
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">{greeting}</h2>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text-primary)] leading-tight w-[85%]">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isMorning ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-secondary)]">
                  <Target className="w-4 h-4 text-amber-500" />
                  <span>{isMM ? 'ဒီနေ့ ပြီးအောင်လုပ်ရမည့် Tasks' : 'Top priority tasks today'}</span>
                </div>
                {tasks.length > 0 ? (
                  <ul className="space-y-2">
                    {tasks.slice(0, 3).map((task, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                        <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-amber-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">{task}</span>
                      </li>
                    ))}
                    {tasks.length > 3 && (
                      <div className="text-xs text-center text-[var(--color-text-muted)] mt-2">
                        {isMM ? `နောက်ထပ် ${tasks.length - 3} ခု ကျန်သေးသည်` : `+ ${tasks.length - 3} more tasks`}
                      </div>
                    )}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-sm text-[var(--color-text-muted)] italic bg-[var(--color-bg-input)] rounded-xl border border-dashed border-[var(--color-border)]">
                    {isMM ? 'ဒီနေ့အတွက် Task မရှိသေးပါ' : 'No tasks planned for today.'}
                  </div>
                )}
              </div>
              
              {eventsCount > 0 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">{eventsCount}</div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {isMM ? 'ဒီနေ့အတွက် အစီအစဉ်/အစည်းအဝေး ရှိပါတယ်' : 'Scheduled events/meetings today.'}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Evening Review */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--color-text-primary)]">
                    {isMM ? 'တစ်နေ့တာ ပြီးဆုံးပါပြီ' : 'Day Complete!'}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {isMM ? 'အနားယူဖို့ အချိန်ရောက်ပါပြီ။ မနက်ဖြန်အတွက် အသင့်ဖြစ်အောင် အိပ်ရေးဝဝအိပ်ပါ။' : "Time to disconnect and recharge. Get a good night's rest."}
                  </p>
                </div>
                
                <div className="bg-[var(--color-bg-input)] border border-[var(--color-border)] p-4 rounded-xl flex items-center justify-around mt-4">
                  <div className="text-center">
                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold mb-1">{isMM ? 'ကျန်ရှိသော Task' : 'Remaining Tasks'}</div>
                    <div className="text-2xl font-extrabold text-[var(--color-text-primary)]">{tasks.length}</div>
                  </div>
                  <div className="w-px h-10 bg-[var(--color-border)]" />
                  <div className="text-center">
                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold mb-1">{isMM ? 'မှတ်ချက်' : 'Status'}</div>
                    <div className="text-sm font-bold text-indigo-500">
                      {tasks.length === 0 ? (isMM ? 'ပြီးပြည့်စုံတယ်' : 'Perfect') : (isMM ? 'ဆက်လုပ်ရန်' : 'Pending')}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            onClick={onClose}
            className={`w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all ${isMorning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}
          >
            <span>{isMorning ? (isMM ? 'တစ်နေ့တာ စတင်မည်' : 'Start My Day') : (isMM ? 'အနားယူမည်' : 'Take a rest')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
