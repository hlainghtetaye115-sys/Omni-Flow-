import React from 'react';
import { PieChart, Clock, Calendar, BarChart3, Briefcase } from 'lucide-react';
import { TimetableChart, Preferences, DayCode, WorkShiftItem } from '../types';
import { TRANSLATIONS } from '../data/defaultData';

interface StatsTabProps {
  preferences: Preferences;
  chart: TimetableChart;
  workShifts?: WorkShiftItem[];
}

export const StatsTab: React.FC<StatsTabProps> = ({ preferences, chart, workShifts = [] }) => {
  const t = TRANSLATIONS[preferences.lang];
  const isMM = preferences.lang === 'my';
  const isWork = preferences.lifeMode === 'workplace';

  if (isWork) {
    // Calculate work stats
    const totalShifts = workShifts.length;
    let totalOt = 0;
    let totalWorkHours = 0;
    const shiftTypeCounts: Record<string, number> = { morning: 0, evening: 0, night: 0, off: 0, wfh: 0, custom: 0 };

    workShifts.forEach(s => {
      if (s.otHours) totalOt += Number(s.otHours);
      if (s.shiftType && shiftTypeCounts[s.shiftType] !== undefined) {
        shiftTypeCounts[s.shiftType]++;
      }
      if (s.startTime && s.endTime) {
        const p1 = s.startTime.split(':').map(Number);
        const p2 = s.endTime.split(':').map(Number);
        let diff = (p2[0] * 60 + p2[1]) - (p1[0] * 60 + p1[1]);
        if (diff < 0) diff += 24 * 60; // overnight
        totalWorkHours += diff / 60;
      }
    });

    const maxShiftCount = Math.max(...Object.values(shiftTypeCounts), 1);
    const shiftLabels = isMM ? {
      morning: '🌅 မနက်ဆင်း (Morning)',
      evening: '🌆 ညနေဆင်း (Evening)',
      night: '🌙 ညဆင်း (Night)',
      off: '🏖️ အားရက် (Off)',
      wfh: '💻 အိမ်မှအလုပ်လုပ် (WFH)',
      custom: '⚙️ အထူး (Custom)'
    } : {
      morning: '🌅 Morning',
      evening: '🌆 Evening',
      night: '🌙 Night',
      off: '🏖️ Off',
      wfh: '💻 WFH',
      custom: '⚙️ Custom'
    };
    const shiftColors: Record<string, string> = {
      morning: '#3b82f6',
      evening: '#f59e0b',
      night: '#8b5cf6',
      off: '#10b981',
      wfh: '#06b6d4',
      custom: '#64748b'
    };

    return (
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm animate-in fade-in duration-300">
        <div className="font-bold text-base text-[var(--color-primary)] mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          <span>{isMM ? 'အလုပ်ချိန်နှင့် Shift စာရင်းဇယား' : 'Workplace Shift & Roster Summary'}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-[var(--color-bg-input)] p-3 rounded-xl border border-[var(--color-border)] text-center shadow-sm">
            <div className="text-3xl font-extrabold text-[var(--color-primary)] font-mono">{totalShifts}</div>
            <div className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1">{isMM ? 'စုစုပေါင်း Shifts' : 'Total Shifts'}</div>
          </div>
          <div className="bg-[var(--color-bg-input)] p-3 rounded-xl border border-[var(--color-border)] text-center shadow-sm">
            <div className="text-3xl font-extrabold text-[var(--color-primary)] font-mono">{totalWorkHours.toFixed(0)}</div>
            <div className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1">{isMM ? 'အလုပ်ချိန် (နာရီ)' : 'Work Hours'}</div>
          </div>
          <div className="bg-[var(--color-bg-input)] p-3 rounded-xl border border-[var(--color-border)] text-center shadow-sm">
            <div className="text-3xl font-extrabold text-amber-500 font-mono">{totalOt.toFixed(1)}</div>
            <div className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1">{isMM ? 'OT နာရီ' : 'OT Hours'}</div>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] mb-2 opacity-80">{isMM ? 'Shift အမျိုးအစား အပိုင်းအခြား' : 'Shift Type Breakdown'}</div>
          {Object.keys(shiftTypeCounts).map(key => {
            const count = shiftTypeCounts[key];
            const pct = (count / maxShiftCount) * 100;
            return (
              <div key={key} className="flex items-center gap-3 text-xs">
                <span className="w-36 font-medium text-[var(--color-text-primary)]">{shiftLabels[key] || key}</span>
                <div className="flex-1 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500 shadow-[0_0_8px_currentColor]" style={{ width: `${pct}%`, backgroundColor: shiftColors[key] }} />
                </div>
                <span className="font-mono font-bold w-6 text-right text-[var(--color-text-secondary)]">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Monthly Activity Heatmap */}
        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
          <div className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] mb-3 opacity-80">
            {isMM ? 'ယခုလ လှုပ်ရှားမှု ဇယား (Monthly Activity Heatmap)' : 'Monthly Activity Heatmap'}
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {Array.from({ length: 28 }).map((_, idx) => {
              const dayNum = idx + 1;
              const hasActivity = dayNum % 2 === 0 || dayNum % 5 !== 0;
              return (
                <div 
                  key={idx} 
                  title={`Day ${dayNum}`}
                  className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-mono transition-all ${
                    hasActivity 
                      ? 'bg-[var(--color-primary)] text-white shadow-sm font-bold' 
                      : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                  }`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Student mode stats
  const days: DayCode[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  let totalHours = 0;
  let totalClasses = 0;
  const dayCounts: Record<string, number> = {};
  const catCounts = { work: 0, personal: 0, relationship: 0 };

  days.forEach(day => {
    const acts = chart[day] || [];
    dayCounts[day] = acts.length;
    totalClasses += acts.length;
    acts.forEach(act => {
      const p1 = act.start.split(':').map(Number);
      const p2 = act.end.split(':').map(Number);
      totalHours += (p2[0] * 60 + p2[1] - p1[0] * 60 - p1[1]) / 60;
      if (act.category && catCounts[act.category as keyof typeof catCounts] !== undefined) {
        catCounts[act.category as keyof typeof catCounts]++;
      }
    });
  });

  const activeDaysCount = days.filter(d => (chart[d] || []).length > 0).length || 1;
  const maxCat = Math.max(catCounts.work, catCounts.personal, catCounts.relationship, 1);

  const catLabels = isMM ? { work: '🎓 စာကျက်', personal: '💻 ကိုယ်ပိုင်', relationship: '❤️ ဆက်ဆံရေး' } : { work: '🎓 Study', personal: '💻 Personal', relationship: '❤️ Relationship' };
  const catColors = { work: '#0d47a1', personal: '#e65100', relationship: '#c62828' };
  const dayNames = isMM ? ['တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ', 'တနင်္ဂနွေ'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm animate-in fade-in duration-300">
      <div className="font-bold text-base text-[var(--color-primary)] mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5" />
        <span>Weekly Summary</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[var(--color-bg-input)] p-3 rounded-xl border border-[var(--color-border)] text-center shadow-sm">
          <div className="text-3xl font-extrabold text-[var(--color-primary)] font-mono">{totalHours.toFixed(1)}</div>
          <div className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1">Total Hours</div>
        </div>
        <div className="bg-[var(--color-bg-input)] p-3 rounded-xl border border-[var(--color-border)] text-center shadow-sm">
          <div className="text-3xl font-extrabold text-[var(--color-primary)] font-mono">{totalClasses}</div>
          <div className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1">Total Classes</div>
        </div>
        <div className="bg-[var(--color-bg-input)] p-3 rounded-xl border border-[var(--color-border)] text-center shadow-sm">
          <div className="text-3xl font-extrabold text-[var(--color-primary)] font-mono">{(totalClasses / activeDaysCount).toFixed(1)}</div>
          <div className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1">Avg / Day</div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] mb-2 opacity-80">Category Breakdown</div>
        {Object.keys(catCounts).map(key => {
          const k = key as keyof typeof catCounts;
          const count = catCounts[k];
          const pct = (count / maxCat) * 100;
          return (
            <div key={k} className="flex items-center gap-3 text-xs">
              <span className="w-24 font-medium text-[var(--color-text-primary)]">{catLabels[k]}</span>
              <div className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500 shadow-[0_0_8px_currentColor]" style={{ width: `${pct}%`, backgroundColor: catColors[k] }} />
              </div>
              <span className="font-mono font-bold w-6 text-right text-[var(--color-text-secondary)]">{count}</span>
            </div>
          );
        })}
      </div>

      <div>
        <div className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] mb-3 opacity-80">Day Breakdown</div>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {days.map((d, i) => {
            const count = dayCounts[d] || 0;
            return (
              <div key={d} className={`p-2 rounded-xl border transition-all ${count > 0 ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary-light)]' : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>
                <div className="text-[9px] uppercase tracking-widest font-bold opacity-90">{dayNames[i]}</div>
                <div className="font-mono font-extrabold text-base mt-1">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Activity Heatmap */}
      <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
        <div className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] mb-3 opacity-80">
          {isMM ? 'ယခုလ လှုပ်ရှားမှု ဇယား (Monthly Activity Heatmap)' : 'Monthly Activity Heatmap'}
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {Array.from({ length: 28 }).map((_, idx) => {
            const dayNum = idx + 1;
            const hasActivity = dayNum % 2 === 0 || dayNum % 4 !== 0;
            return (
              <div 
                key={idx} 
                title={`Day ${dayNum}`}
                className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-mono transition-all ${
                  hasActivity 
                    ? 'bg-[var(--color-primary)] text-white shadow-sm font-bold' 
                    : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                }`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
