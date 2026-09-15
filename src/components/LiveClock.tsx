import React, { useState, useEffect } from 'react';
import { Clock, Coffee, Play } from 'lucide-react';
import { Preferences } from '../types';
import { TRANSLATIONS } from '../data/defaultData';

interface LiveClockProps {
  preferences: Preferences;
  isInClass: boolean;
}

export const LiveClock: React.FC<LiveClockProps> = ({ preferences, isInClass }) => {
  const [time, setTime] = useState(new Date());
  const t = TRANSLATIONS[preferences.lang];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    if (preferences.timeFormat === '12') {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`;
    }
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(preferences.lang === 'my' ? 'my-MM' : 'en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl p-4 mb-4 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-mono text-3xl font-bold tracking-tight flex items-center gap-2 text-[var(--color-primary)]">
            <Clock className="w-6 h-6 opacity-90 text-[var(--color-primary)]" />
            <span>{formatTime(time)}</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1">{formatDate(time)}</div>
        </div>
        <div>
          <span className={`px-4 py-1.5 rounded-md text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 backdrop-blur-md ${isInClass ? 'bg-[var(--color-primary-light)] border border-[var(--color-primary)]/50 text-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary-light)]' : 'bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
            {isInClass ? <Play className="w-3.5 h-3.5 fill-current" /> : <Coffee className="w-3.5 h-3.5" />}
            {isInClass ? t.msgInClass : t.msgFree}
          </span>
        </div>
      </div>
    </div>
  );
};
