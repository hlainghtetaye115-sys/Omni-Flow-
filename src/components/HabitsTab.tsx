import React, { useState } from 'react';
import { Habit, Preferences } from '../types';
import { Plus, Check, Flame, Trophy, Trash2, TrendingUp } from 'lucide-react';

interface HabitsTabProps {
  habits: Habit[];
  onAddHabit: (habit: Habit) => void;
  onToggleHabit: (id: string, date: string) => void;
  onDeleteHabit: (id: string) => void;
  preferences: Preferences;
}

export const HabitsTab: React.FC<HabitsTabProps> = ({ habits, onAddHabit, onToggleHabit, onDeleteHabit, preferences }) => {
  const isMM = preferences.lang === 'my';
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#3b82f6'); // Default blue

  const today = new Date().toISOString().split('T')[0];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    onAddHabit({
      id: Date.now().toString(),
      name: newHabitName.trim(),
      color: newHabitColor,
      completedDates: [],
      createdAt: today
    });
    setNewHabitName('');
  };

  const calculateStreak = (completedDates: string[]) => {
    if (completedDates.length === 0) return 0;
    
    // Sort descending
    const sorted = [...completedDates].sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let currentDate = new Date();
    
    // Check if missed today, but maybe did yesterday.
    // If not done today AND not done yesterday, streak is 0.
    const todayStr = currentDate.toISOString().split('T')[0];
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdayStr = currentDate.toISOString().split('T')[0];
    
    if (!sorted.includes(todayStr) && !sorted.includes(yesterdayStr)) {
      return 0;
    }
    
    currentDate = new Date(); // start from today
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (sorted.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // If today is missed but we already passed the yesterday check, we just skip today and continue checking yesterday
        if (dateStr === todayStr) {
           currentDate.setDate(currentDate.getDate() - 1);
        } else {
           break;
        }
      }
    }
    return streak;
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[var(--color-text-primary)]">
            {isMM ? 'အလေ့အကျင့်များ' : 'Habit Tracker'}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {isMM ? 'နေ့စဉ်အလေ့အကျင့်ကောင်းများ တည်ဆောက်ပါ' : 'Build good daily habits & streaks'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500" />
        </div>
      </div>

      {/* Add Habit Form */}
      <form onSubmit={handleAdd} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--color-primary)]" />
          {isMM ? 'အလေ့အကျင့်အသစ် ထည့်ရန်' : 'Create New Habit'}
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder={isMM ? 'ဥပမာ - စာဖတ်ရန်၊ ရေသောက်ရန်...' : 'e.g. Read 10 pages, Drink water...'}
            className="flex-1 bg-[var(--color-bg-input)] border-2 border-[var(--color-border)] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <input
            type="color"
            value={newHabitColor}
            onChange={(e) => setNewHabitColor(e.target.value)}
            className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
          />
          <button
            type="submit"
            disabled={!newHabitName.trim()}
            className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-md shadow-[var(--color-primary-light)]"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </form>

      {/* Habit List */}
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl">
            <Trophy className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--color-text-muted)] font-medium">
              {isMM ? 'အလေ့အကျင့်များ မရှိသေးပါ။' : 'No habits created yet.'}
            </p>
          </div>
        ) : (
          habits.map((habit) => {
            const isDoneToday = habit.completedDates.includes(today);
            const streak = calculateStreak(habit.completedDates);

            return (
              <div key={habit.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-4 shadow-sm flex items-center justify-between gap-4 transition-all hover:border-[var(--color-primary)]/30">
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => onToggleHabit(habit.id, today)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isDoneToday 
                        ? 'text-white shadow-lg scale-105'
                        : 'bg-[var(--color-bg-input)] border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] text-transparent'
                    }`}
                    style={{ backgroundColor: isDoneToday ? habit.color : '', boxShadow: isDoneToday ? `0 4px 15px ${habit.color}80` : '' }}
                  >
                    <Check className={`w-7 h-7 ${isDoneToday ? 'text-white' : 'text-transparent'}`} strokeWidth={3} />
                  </button>
                  
                  <div>
                    <h4 className={`font-bold text-lg transition-colors ${isDoneToday ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                      {habit.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        <Flame className="w-3.5 h-3.5" />
                        {streak} {isMM ? 'ရက်' : 'Day Streak'}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {habit.completedDates.length} {isMM ? 'ကြိမ် ပြီးမြောက်ခဲ့သည်' : 'Total completed'}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onDeleteHabit(habit.id)}
                  className="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
