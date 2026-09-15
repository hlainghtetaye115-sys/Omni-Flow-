import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, Coffee, CheckSquare, Square, Plus, Sparkles, BookOpen, Bell } from 'lucide-react';
import { Preferences, ClassActivity } from '../types';
import { audioAlert } from '../utils/audioAlert';

interface WidgetViewProps {
  preferences: Preferences;
  currentActivity: ClassActivity | null;
  nextActivity: ClassActivity | null;
  tasks: string[];
  onAddTask: (task: string) => void;
  onDeleteTask: (index: number) => void;
  showAlert: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const WidgetView: React.FC<WidgetViewProps> = ({
  preferences,
  currentActivity,
  nextActivity,
  tasks,
  onAddTask,
  onDeleteTask,
  showAlert
}) => {
  const [time, setTime] = useState(new Date());
  const isMM = preferences.lang === 'my';

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  // Pomodoro Interactive Timer State inside Widget
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');
  const [quickTaskInput, setQuickTaskInput] = useState('');

  useEffect(() => {
    let interval: any = null;
    if (isPomodoroActive && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds(prev => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isPomodoroActive) {
      setIsPomodoroActive(false);
      if (preferences.soundAlerts) audioAlert.playChime('success');
      showAlert(isMM ? 'Pomodoro အချိန်ပြည့်ပါပြီ!' : 'Pomodoro session completed!', 'success');
    }
    return () => clearInterval(interval);
  }, [isPomodoroActive, pomodoroSeconds, isMM, preferences.soundAlerts, showAlert]);

  const formatPomodoroTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleTogglePomodoro = () => {
    setIsPomodoroActive(!isPomodoroActive);
  };

  const handleResetPomodoro = (mode: 'work' | 'break') => {
    setPomodoroMode(mode);
    setIsPomodoroActive(false);
    setPomodoroSeconds(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskInput.trim()) return;
    onAddTask(quickTaskInput.trim());
    setQuickTaskInput('');
    showAlert(isMM ? 'တာဝန်အသစ် ထည့်သွင်းပြီးပါပြီ' : 'Task added successfully', 'success');
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-20 animate-in fade-in duration-300">
      {/* Widget Header Card */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <div className="font-mono text-3xl font-extrabold tracking-tight flex items-center gap-3 text-[var(--color-primary)]">
            <Clock className="w-7 h-7" />
            <span>{formatTime(time)}</span>
          </div>
          <span className={`px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 shadow-sm ${currentActivity ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]'}`}>
            {currentActivity ? <Play className="w-3.5 h-3.5 fill-current animate-pulse" /> : <Coffee className="w-3.5 h-3.5" />}
            {currentActivity ? (isMM ? 'အတန်းတက်နေသည်' : 'IN CLASS') : (isMM ? 'အားလပ်ချိန်' : 'FREE TIME')}
          </span>
        </div>

        {/* Current / Next Class Status Card */}
        {currentActivity ? (
          <div className="bg-[var(--color-bg-input)] rounded-2xl p-5 border border-[var(--color-primary)]/40 mb-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wider font-bold text-[var(--color-primary)] mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {isMM ? 'လက်ရှိအတန်း' : 'CURRENT CLASS'}
            </div>
            <div className="text-xl font-bold text-[var(--color-text-primary)] leading-snug mb-1">
              {currentActivity.name}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] font-mono font-medium">
              ⏰ {currentActivity.timeStr}
            </div>
          </div>
        ) : (
          <div className="bg-[var(--color-bg-input)] rounded-2xl p-5 border border-[var(--color-border)] mb-4">
            <div className="text-[11px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-1">
              {isMM ? 'နောက်လာမည့်အတန်း' : 'NEXT UP'}
            </div>
            {nextActivity ? (
              <>
                <div className="text-lg font-bold text-[var(--color-text-primary)] leading-snug mb-1">
                  {nextActivity.name}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] font-mono font-medium">
                  ⏰ {nextActivity.timeStr}
                </div>
              </>
            ) : (
              <div className="text-sm text-[var(--color-text-muted)] py-2 font-medium">
                {isMM ? 'ဒီနေ့အတွက် အတန်းမရှိတော့ပါ။' : 'No more classes scheduled today.'}
              </div>
            )}
          </div>
        )}

        {/* Interactive Pomodoro Widget */}
        <div className="bg-[var(--color-bg-input)] rounded-2xl p-5 border border-[var(--color-border)] mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {isMM ? 'ဖိုမိုဒိုရို အာရုံစူးစိုက်ချိန်' : 'Interactive Pomodoro Timer'}
            </span>
            <div className="flex items-center gap-1 bg-[var(--color-bg-card)] p-1 rounded-xl border border-[var(--color-border)]">
              <button
                onClick={() => handleResetPomodoro('work')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${pomodoroMode === 'work' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
              >
                {isMM ? 'စာကျက်ချိန်' : 'Study'}
              </button>
              <button
                onClick={() => handleResetPomodoro('break')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${pomodoroMode === 'break' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
              >
                {isMM ? 'အနားယူ' : 'Break'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-mono text-4xl font-extrabold text-[var(--color-text-primary)] tracking-wider">
              {formatPomodoroTime(pomodoroSeconds)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePomodoro}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md ${isPomodoroActive ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-[var(--color-primary)] hover:opacity-90 text-white'}`}
              >
                {isPomodoroActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                {isPomodoroActive ? (isMM ? 'ခဏရပ်မည်' : 'Pause') : (isMM ? 'စတင်မည်' : 'Start')}
              </button>
              <button
                onClick={() => handleResetPomodoro(pomodoroMode)}
                className="p-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer transition-all"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Task Widget */}
        <div className="bg-[var(--color-bg-input)] rounded-2xl p-5 border border-[var(--color-border)]">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              {isMM ? 'အမြန်တာဝန်များ (Quick Tasks)' : 'Quick Tasks'}
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
              {tasks.length} {isMM ? 'ခု' : 'items'}
            </span>
          </div>

          <form onSubmit={handleAddQuickTask} className="flex gap-2 mb-3">
            <input
              type="text"
              value={quickTaskInput}
              onChange={e => setQuickTaskInput(e.target.value)}
              placeholder={isMM ? 'တာဝန်အသစ် ရိုက်ထည့်ပါ...' : 'Add a quick task...'}
              className="flex-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-[var(--color-primary)] text-white rounded-xl text-xs font-bold cursor-pointer hover:opacity-90 transition-all flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {isMM ? 'ထည့်' : 'Add'}
            </button>
          </form>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <div className="text-center py-3 text-xs text-[var(--color-text-muted)]">
                {isMM ? 'တာဝန်များ မရှိသေးပါ။' : 'No quick tasks yet.'}
              </div>
            ) : (
              tasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs">
                  <span className="font-medium text-[var(--color-text-primary)] truncate mr-2">
                    • {task}
                  </span>
                  <button
                    onClick={() => onDeleteTask(idx)}
                    className="text-[var(--color-text-muted)] hover:text-red-500 text-xs font-bold cursor-pointer p-1"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
