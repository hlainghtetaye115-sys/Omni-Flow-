import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle, Clock, Printer, Download, Calendar, CalendarCheck,
  CheckCircle, Hourglass, Activity, ChevronRight, User, Sparkles, X,
  Play, Pause, RotateCcw, Flame, Check, Bookmark, Plus, BellRing, Target,
  MapPin, UserCheck, Video, Wallet, Minus, ArrowUpCircle, ArrowDownCircle, Receipt, Utensils, Bus, ShoppingBag, Smartphone, MoreHorizontal, Coins, BarChart3, AlertTriangle, Briefcase, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClassActivity, Preferences, TimeSlot, DayCode, Transaction, TransactionType, TransactionCategory, WorkShiftItem } from '../types';
import { TRANSLATIONS } from '../data/defaultData';
import { audioAlert } from '../utils/audioAlert';
import { MacWindowFrame } from './MacWindowFrame';
import { FinanceAnalyticsModal } from './FinanceAnalyticsModal';
import confetti from 'canvas-confetti';

interface HomeTabProps {
  workShifts?: WorkShiftItem[];
  transactions?: Transaction[];
  setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>>;
  preferences: Preferences;
  setPreferences?: React.Dispatch<React.SetStateAction<Preferences>>;
  userName: string;
  todayClasses: ClassActivity[];
  tomorrowClasses: ClassActivity[];
  upcomingClasses: { day: DayCode; dayName: string; cls: ClassActivity; order: number }[];
  currentActivity: ClassActivity | null;
  nextActivity: ClassActivity | null;
  onSwitchTab: (tab: string) => void;
  onEditName: () => void;
  onExportCSV: () => void;
  onQuickAddTask?: (taskText: string) => void;
  isTableExpanded?: boolean;
  tasks?: string[];
  events?: any[];
  onToggleTask?: (taskText: string) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  workShifts = [],
  transactions = [],
  setTransactions = () => {},
  preferences,
  setPreferences = () => {},
  userName,
  todayClasses,
  tomorrowClasses,
  upcomingClasses,
  currentActivity,
  nextActivity,
  onSwitchTab,
  onEditName,
  onExportCSV,
  onQuickAddTask,
  isTableExpanded = false,
  tasks = [],
  events = [],
  onToggleTask
}) => {
  const t = TRANSLATIONS[preferences.lang];
  const isMM = preferences.lang === 'my';

  const [countdown, setCountdown] = useState({ mins: 0, secs: 0, status: 'normal', text: '' });

  // Class Attendance State (stored in localStorage for today)
  const todayKey = `attendance_${new Date().toISOString().split('T')[0]}`;
  const [attendedMap, setAttendedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Quick Note State for Workplace Dashboard
  const quickNoteKey = `quicknote_${new Date().toISOString().split('T')[0]}`;
  const [quickNote, setQuickNote] = useState<string>(() => {
    try {
      return localStorage.getItem(quickNoteKey) || '';
    } catch {
      return '';
    }
  });

  const handleQuickNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setQuickNote(val);
    try {
      localStorage.setItem(quickNoteKey, val);
    } catch (e) {}
  };

  const toggleAttendance = (className: string, timeStr: string) => {
    const key = `${className}_${timeStr}`;
    setAttendedMap((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(todayKey, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      if (next[key]) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#f59e0b']
        });
        audioAlert.playChime('success');
      }
      return next;
    });
  };

  // Practical Focus / Study Pomodoro Timer
  const [focusTimeLeft, setFocusTimeLeft] = useState<number>(25 * 60);
  const [focusRunning, setFocusRunning] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<'study' | 'short_break' | 'long_break'>('study');
  const [isFocusExpanded, setIsFocusExpanded] = useState<boolean>(false);

  // Collapsible Sections State for Home Tab
  const [isTxListOpen, setIsTxListOpen] = useState<boolean>(false);
  const [isTasksOpen, setIsTasksOpen] = useState<boolean>(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (focusRunning && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (focusRunning && focusTimeLeft === 0) {
      setFocusRunning(false);
      audioAlert.playChime('alert');
      confetti({ particleCount: 120, spread: 80 });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusRunning, focusTimeLeft, isMM, preferences.lang]);

  const startFocusPreset = (mins: number, mode: 'study' | 'short_break' | 'long_break') => {
    setFocusMode(mode);
    setFocusTimeLeft(mins * 60);
    setFocusRunning(true);
    setIsFocusExpanded(true);
    audioAlert.playChime('chime');
  };

  // Calculate stats for today
  const totalToday = todayClasses.length;
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const doneToday = todayClasses.filter(c => currentTimeStr > c.end).length;
  const attendedCount = todayClasses.filter(c => attendedMap[`${c.name}_${c.timeStr}`]).length;
  const remainingToday = totalToday - doneToday;

  // Countdown timer for next activity
  useEffect(() => {
    if (!nextActivity) return;

    const updateCd = () => {
      const now = new Date();
      const [sh, sm] = nextActivity.start.split(':').map(Number);
      const [eh, em] = nextActivity.end.split(':').map(Number);
      const startTime = new Date(now);
      startTime.setHours(sh, sm, 0, 0);
      const endTime = new Date(now);
      endTime.setHours(eh, em, 0, 0);

      const diff = Math.floor((startTime.getTime() - now.getTime()) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;

      if (now > endTime) {
        setCountdown({ mins: 0, secs: 0, status: 'success', text: isMM ? 'အတန်းပြီးပါပြီ' : 'Class completed' });
      } else if (now > startTime) {
        setCountdown({ mins: 0, secs: 0, status: 'urgent', text: isMM ? 'အတန်းစတင်နေပါပြီ' : 'In progress' });
      } else if (diff > 0) {
        setCountdown({ mins, secs, status: mins < 5 ? 'urgent' : 'normal', text: mins < 5 ? (isMM ? 'မကြာမီစတင်မည်' : 'Starting soon!') : `in ${mins}m ${secs}s` });
      }
    };

    updateCd();
    const timer = setInterval(updateCd, 1000);
    return () => clearInterval(timer);
  }, [nextActivity, isMM]);

  // Temporary Auto-Hiding Greeting Banner State (Shows for ~4.5 seconds on app load)
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Greeting logic
  const hr = new Date().getHours();
  let emoji = '🌅';
  let greetingMsg = isMM ? `မင်္ဂလာနံနက်ခင်းပါ၊ ${userName}!` : `Good morning, ${userName}!`;
  if (hr >= 12 && hr < 17) { emoji = '☀️'; greetingMsg = isMM ? `မင်္ဂလာနေ့လယ်ခင်းပါ၊ ${userName}!` : `Good afternoon, ${userName}!`; }
  else if (hr >= 17 && hr < 20) { emoji = '🌇'; greetingMsg = isMM ? `မင်္ဂလာညနေခင်းပါ၊ ${userName}!` : `Good evening, ${userName}!`; }
  else if (hr >= 20 || hr < 5) { emoji = '🌙'; greetingMsg = isMM ? `မင်္ဂလာညချမ်းပါ၊ ${userName}!` : `Good night, ${userName}!`; }

  const isAllDone = totalToday > 0 && doneToday === totalToday;
  const isNoClass = totalToday === 0;

  const isStudent = preferences.lifeMode !== 'workplace';

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [transactionFormType, setTransactionFormType] = useState<TransactionType>('expense');
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    category: 'food' as TransactionCategory,
    note: ''
  });

  const financeStats = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const thisMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const todaysTransactions = transactions.filter(t => t.date === todayStr);

    let totalIncome = 0;
    let totalExpense = 0;
    let totalExtraIncome = 0;
    let totalTodayExpense = 0;
    let thisMonthExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      if (t.type === 'expense') {
        totalExpense += t.amount;
        if (t.date.startsWith(thisMonthStr)) {
          thisMonthExpense += t.amount;
        }
      }
    });

    todaysTransactions.forEach(t => {
      if (t.type === 'income') totalExtraIncome += t.amount;
      if (t.type === 'expense') totalTodayExpense += t.amount;
    });

    const netBalance = totalIncome - totalExpense;
    const monthlyBudget = preferences.monthlyBudget || 0;
    const budgetUsagePercent = monthlyBudget > 0 ? Math.min(100, (thisMonthExpense / monthlyBudget) * 100) : 0;

    return { 
      netBalance, 
      totalIncome, 
      totalExpense, 
      totalExtraIncome, 
      totalTodayExpense, 
      thisMonthExpense,
      monthlyBudget,
      budgetUsagePercent,
      todaysTransactions 
    };
  }, [transactions, preferences.monthlyBudget]);

  const handleSaveTransaction = () => {
    if (!transactionForm.amount || isNaN(Number(transactionForm.amount))) return;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: transactionFormType,
      amount: Number(transactionForm.amount),
      category: transactionForm.category,
      date: todayStr,
      note: transactionForm.note
    };
    
    setTransactions(prev => [...prev, newTx]);
    setIsTransactionModalOpen(false);
    setTransactionForm({ amount: '', category: transactionFormType === 'income' ? 'extra_income' : 'food', note: '' });
  };

  return (
    <>
    <AnimatePresence>
      {!isTableExpanded && (
        <motion.div
          key="home-dashboard-content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.3 }}
          className="space-y-3 pb-2 overflow-hidden"
        >
          {/* Temporary Greeting Banner */}
          <AnimatePresence>
            {showGreeting && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl text-[var(--color-text-primary)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-[var(--color-primary)]/40 relative overflow-hidden bg-[var(--color-bg-card)]"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--color-primary)]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative w-12 h-12 sm:w-13 sm:h-13 flex-shrink-0 z-10">
                  <div className={`w-full h-full rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-xl font-bold border-2 border-[var(--color-bg-card)] shadow-[0_0_15px_var(--color-primary-light)] text-white ${isStudent && isAllDone ? 'animate-bounce' : ''}`}>
                    {isStudent ? (isAllDone ? '🎉' : isNoClass ? '🌴' : userName.charAt(0).toUpperCase()) : userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[var(--color-primary)] rounded-full border-2 border-[var(--color-bg-card)]" />
                </div>

                <div className="flex-1 z-10">
                  <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <span>{emoji}</span>
                    <span>{greetingMsg}</span>
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mt-0.5 font-mono">
                    {isStudent 
                      ? (isAllDone ? t.allDoneTitle : isNoClass ? t.noClassTitle : (isMM ? `ယနေ့ အတန်း ${totalToday} ခုရှိသည်။` : `You have ${totalToday} classes today.`))
                      : (isMM ? 'ကောင်းသောနေ့လေးဖြစ်ပါစေ' : 'Have a productive day')}
                  </p>
                </div>

                <div className="flex items-center gap-1 z-10">
                  <button
                    onClick={onEditName}
                    className="bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] p-2 rounded-xl cursor-pointer hover:brightness-95 dark:hover:brightness-125 transition-all"
                    title={isMM ? 'အမည်ပြင်မည်' : 'Edit Name'}
                  >
                    <User className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowGreeting(false)}
                    className="bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-2 rounded-xl cursor-pointer transition-all"
                    title={isMM ? 'ပိတ်မည်' : 'Close'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Countdown Auto-Dismiss Progress Bar */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 4.5, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-1 bg-[var(--color-primary)] opacity-70"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Active Class, Next Class, or Workplace Shift Banner */}
          {isStudent ? (
            currentActivity ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border-2 border-emerald-500/50 shadow-md relative overflow-hidden space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    {isMM ? 'ယခု သင်ကြားနေသော အတန်း' : 'Current Active Class'}
                  </span>
                  <span className="text-xs font-mono font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                    {currentActivity.start} - {currentActivity.end}
                  </span>
                </div>
                <div className="text-base sm:text-lg font-extrabold text-[var(--color-text-primary)]">
                  {currentActivity.name}
                </div>
                {(currentActivity.room || currentActivity.instructor || currentActivity.link) && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                    {currentActivity.room && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>{currentActivity.room}</span>
                      </span>
                    )}
                    {currentActivity.instructor && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>{currentActivity.instructor}</span>
                      </span>
                    )}
                    {currentActivity.link && (
                      <a
                        href={currentActivity.link.startsWith('http') ? currentActivity.link : `https://${currentActivity.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                      >
                        <Video className="w-3 h-3" />
                        <span>{isMM ? 'အွန်လိုင်းအတန်း တက်မည်' : 'Join Class'}</span>
                      </a>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-emerald-500/20 text-xs">
                  <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{currentActivity.timeStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startFocusPreset(25, 'study')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Start 25m Focus Timer for this class"
                    >
                      <Target className="w-3 h-3" />
                      <span>{isMM ? 'အာရုံစူးစိုက်မည် (25m Focus)' : '25m Focus'}</span>
                    </button>
                    {onQuickAddTask && (
                      <button
                        onClick={() => onQuickAddTask(`Homework: ${currentActivity.name}`)}
                        className="px-2.5 py-1 bg-[var(--color-bg-input)] hover:bg-emerald-600 hover:text-white border border-[var(--color-border)] rounded-lg font-bold text-[11px] text-[var(--color-text-primary)] cursor-pointer flex items-center gap-1 transition-all"
                        title="Add Homework for this class"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isMM ? '+ အိမ်စာထည့်မည်' : '+ Homework'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : nextActivity ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-2 border-amber-500/50 shadow-md relative overflow-hidden space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    <Hourglass className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                    {isMM ? 'နောက်လာမည့် အတန်း' : 'Next Upcoming Class'}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full text-white shadow-sm ${countdown.status === 'urgent' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}>
                    {countdown.text || `${nextActivity.start}`}
                  </span>
                </div>
                <div className="text-base sm:text-lg font-extrabold text-[var(--color-text-primary)]">
                  {nextActivity.name}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-amber-500/20 text-xs">
                  <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{nextActivity.timeStr} ({nextActivity.start} - {nextActivity.end})</span>
                  </div>
                  {onQuickAddTask && (
                    <button
                      onClick={() => onQuickAddTask(`Prepare: ${nextActivity.name}`)}
                      className="px-2 py-1 bg-[var(--color-bg-input)] hover:bg-amber-500 hover:text-white border border-[var(--color-border)] rounded-lg font-bold text-[11px] text-[var(--color-text-primary)] cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isMM ? '+ ပြင်ဆင်ရန် ထည့်မည်' : '+ Add Prep'}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--color-text-primary)]">
                      {totalToday > 0 ? (isMM ? 'ယနေ့ အတန်းများ အားလုံးပြီးဆုံးပါပြီ' : 'All classes for today completed!') : (isMM ? 'ယနေ့ အတန်းမရှိပါ (အားလပ်ရက်)' : 'No classes today (Free Day)')}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {totalToday > 0 ? (isMM ? 'အနားယူနိုင်ပါပြီ' : 'Well done for today!') : (isMM ? 'တစ်နေ့တာကို စိတ်ချမ်းသာစွာ ဖြတ်သန်းပါ' : 'Enjoy your free time!')}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Workplace Mode Today Duty Banner */
            (() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const todayShift = workShifts.find(s => s.date === todayStr);

              if (!todayShift) {
                return (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                        💼
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[var(--color-text-primary)]">
                          {isMM ? 'ယနေ့ အလုပ်ဆင်းချိန် မသတ်မှတ်ရသေးပါ' : 'No Duty Shift Assigned For Today'}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {isMM ? 'အလုပ်ဇယားတွင် ဂျူတီအချိန်ဆင်း သတ်မှတ်နိုင်ပါသည်' : 'Set your shift schedule in workplace tab'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onSwitchTab('workplace')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex-shrink-0"
                    >
                      {isMM ? '+ Shift ထည့်မည်' : '+ Add Shift'}
                    </button>
                  </div>
                );
              }

              if (todayShift.shiftType === 'off') {
                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border-2 border-indigo-500/30 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xl shadow-xs">
                        🌴
                      </div>
                      <div>
                        <div className="font-black text-sm sm:text-base text-[var(--color-text-primary)] flex items-center gap-2">
                          <span>{isMM ? 'ယနေ့ ပိတ်ရက်ဖြစ်ပါသည် (Day Off)' : 'Today is your Day Off!'}</span>
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {isMM ? 'ယနေ့ အလုပ်ဆင်းချိန်မရှိပါ - စိတ်ချမ်းသာစွာ အနားယူပါ သို့မဟုတ် ကိုယ်ပိုင်အစီအစဉ်များ ပြုလုပ်နိုင်ပါသည်' : 'Enjoy your day off and rest well!'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onSwitchTab('workplace')}
                      className="px-3 py-1.5 bg-[var(--color-bg-input)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
                    >
                      {isMM ? 'ဇယားကြည့်မည်' : 'View Roster'}
                    </button>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border-2 border-emerald-500/40 shadow-md relative overflow-hidden space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      {isMM ? 'ယနေ့ အလုပ်ဆင်းချိန် (Today Shift)' : 'Today Active Shift'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {todayShift.otHours > 0 && (
                        <span className="text-xs font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                          ⚡ +{todayShift.otHours}h OT
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                        {todayShift.startTime || '08:00'} - {todayShift.endTime || '16:00'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="text-base sm:text-lg font-black text-[var(--color-text-primary)] flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-emerald-500" />
                        <span>{todayShift.title || (isMM ? 'ဓမ္မတာ အလုပ်ဆင်းချိန်' : 'Work Shift')}</span>
                      </div>
                      {todayShift.notes && (
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-medium">
                          📝 {todayShift.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startFocusPreset(25, 'study')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>{isMM ? '25m Focus' : 'Start Focus'}</span>
                      </button>
                      <button
                        onClick={() => onSwitchTab('workplace')}
                        className="px-3 py-1.5 bg-[var(--color-bg-input)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        {isMM ? 'အလုပ်ဇယား' : 'Roster'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })()
          )}

          {/* Practical Pomodoro Focus Timer Box */}
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-xs sm:text-sm font-extrabold text-[var(--color-text-primary)]">
                  {isStudent 
                    ? (isMM ? 'စာကျက် အာရုံစူးစိုက်မှု နာရီ (Pomodoro Timer)' : 'Focus Study Timer (Pomodoro)')
                    : (isMM ? 'အလုပ် အာရုံစူးစိုက်မှု နာရီ (Focus Timer)' : 'Focus Work Timer (Pomodoro)')
                  }
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsFocusExpanded(!isFocusExpanded)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-primary)] cursor-pointer"
                >
                  {isFocusExpanded ? (isMM ? 'ကျုံ့မည်' : 'Hide') : (isMM ? 'ဖွင့်မည်' : 'Open')}
                </button>
              </div>
            </div>

            {/* Expanded Timer Controls */}
            {isFocusExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 pt-1 border-t border-[var(--color-border)]/50"
              >
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--color-primary)] tracking-wider">
                    {String(Math.floor(focusTimeLeft / 60)).padStart(2, '0')}:{String(focusTimeLeft % 60).padStart(2, '0')}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setFocusRunning(!focusRunning)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all ${
                      focusRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {focusRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{focusRunning ? (isMM ? 'ခေတ္တရပ်မည်' : 'Pause') : (isMM ? 'စတင်မည်' : 'Start Focus')}</span>
                  </button>

                  <button
                    onClick={() => { setFocusRunning(false); setFocusTimeLeft(25 * 60); }}
                    className="p-2 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex justify-center gap-1.5 pt-1">
                  <button
                    onClick={() => startFocusPreset(25, 'study')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      focusMode === 'study' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {isStudent ? (isMM ? '၂၅ မိနစ် စာကျက်' : '25m Study') : (isMM ? '၂၅ မိနစ် အလုပ်လုပ်မည်' : '25m Work')}
                  </button>
                  <button
                    onClick={() => startFocusPreset(5, 'short_break')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      focusMode === 'short_break' ? 'bg-indigo-600 text-white border-transparent' : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {isMM ? '၅ မိနစ် အနား' : '5m Break'}
                  </button>
                  <button
                    onClick={() => startFocusPreset(50, 'study')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      focusMode === 'study' && focusTimeLeft === 50 * 60 ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {isStudent ? (isMM ? '၅၀ မိနစ် အပြင်းအထန်' : '50m Deep') : (isMM ? '၅၀ မိနစ် အပြင်းအထန် အလုပ်လုပ်မည်' : '50m Deep Work')}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Stats Counters */}
          {isStudent && (
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-2 sm:p-2.5 rounded-xl text-center shadow-xs">
                <div className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                  {isMM ? 'စုစုပေါင်း' : 'Total'}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-[var(--color-primary)] mt-0.5">
                  {totalToday}
                </div>
                <div className="text-[9px] text-[var(--color-text-muted)]">{isMM ? 'အတန်း' : 'classes'}</div>
              </div>

              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-2 sm:p-2.5 rounded-xl text-center shadow-xs">
                <div className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                  {isMM ? 'တက်ရောက်' : 'Attended'}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {attendedCount}
                </div>
                <div className="text-[9px] text-[var(--color-text-muted)]">{isMM ? 'ပြီး' : 'marked'}</div>
              </div>

              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-2 sm:p-2.5 rounded-xl text-center shadow-xs">
                <div className="text-[9px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                  {isMM ? 'ပြီးစီး' : 'Done'}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                  {doneToday}
                </div>
                <div className="text-[9px] text-[var(--color-text-muted)]">{isMM ? 'အတန်း' : 'done'}</div>
              </div>

              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-2 sm:p-2.5 rounded-xl text-center shadow-xs">
                <div className="text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
                  {isMM ? 'ကျန်ရှိ' : 'Remaining'}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  {remainingToday}
                </div>
                <div className="text-[9px] text-[var(--color-text-muted)]">{isMM ? 'အတန်း' : 'left'}</div>
              </div>
            </div>
          )}

          {/* Today Timeline with Attendance Checkbox & Quick Homework Adder */}
          {isStudent && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
            {/* Left Column: Full Today Timeline with Interactive Attendance Checkboxes */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-border)]">
                  <div className="font-bold text-sm text-[var(--color-primary)] flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>{isMM ? 'ယနေ့ အချိန်ဇယားနှင့် တက်ရောက်မှု' : "Today's Schedule & Attendance"}</span>
                  </div>
                </div>

                <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border)]">
                  {todayClasses.length === 0 ? (
                    <div className="text-xs text-[var(--color-text-muted)] py-4">
                      {isMM ? 'ယနေ့အတွက် သတ်မှတ်ထားသော အတန်း မရှိပါ။' : 'No classes scheduled for today.'}
                    </div>
                  ) : (
                    todayClasses.map((cls, idx) => {
                      const isDone = currentTimeStr > cls.end;
                      const isOngoing = currentTimeStr >= cls.start && currentTimeStr <= cls.end;
                      const attendanceKey = `${cls.name}_${cls.timeStr}`;
                      const isAttended = !!attendedMap[attendanceKey];

                      return (
                        <div key={idx} className={`relative flex items-start gap-3 ${isDone && !isOngoing ? 'opacity-80' : ''}`}>
                          <span className={`absolute -left-6 top-2 w-3 h-3 rounded-full border-2 border-white ${isOngoing ? 'bg-emerald-500' : isAttended ? 'bg-emerald-500' : isDone ? 'bg-gray-400' : 'bg-amber-500'}`} />
                          <span className="font-mono text-xs font-bold text-[var(--color-primary)] min-w-[44px] pt-1">{cls.start}</span>
                          <div className={`flex-1 p-2.5 rounded-xl transition-all ${
                            isAttended
                              ? 'bg-emerald-500/10 border border-emerald-500/30'
                              : 'bg-[var(--color-bg-input)]/60 hover:bg-[var(--color-bg-input)]'
                          }`}>
                            <div className="font-extrabold text-xs text-[var(--color-text-primary)] font-sans flex items-center justify-between">
                              <span className={isAttended ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>{cls.name}</span>
                              <div className="flex items-center gap-1.5">
                                {isOngoing && <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">● Live</span>}
                                {/* Attendance Checkbox Button */}
                                <button
                                  onClick={() => toggleAttendance(cls.name, cls.timeStr)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                    isAttended
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-emerald-600'
                                  }`}
                                  title={isMM ? 'အတန်းတက်ရောက်မှု အမှတ်အသား' : 'Mark Attended'}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{isAttended ? (isMM ? 'တက်ပြီး' : 'Attended') : (isMM ? 'တက်မည်' : 'Check')}</span>
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mt-1.5 pt-1.5 border-t border-[var(--color-border)]/20 font-mono">
                              <span>{cls.timeStr}</span>
                              {onQuickAddTask && (
                                <button
                                  onClick={() => onQuickAddTask(`${cls.name}: Assignment / Note`)}
                                  className="text-[var(--color-primary)] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>{isMM ? 'အိမ်စာထည့်' : 'Add Task'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Full Tomorrow Preview & Quick Actions */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
                <div className="font-bold text-sm text-[var(--color-primary)] flex items-center gap-2 mb-3 pb-2 border-b border-[var(--color-border)]">
                  <Sparkles className="w-4 h-4" />
                  <span>{isMM ? 'မနက်ဖြန်အတွက် အချိန်ဇယား' : "Tomorrow's Schedule"}</span>
                </div>
                <div className="space-y-2">
                  {tomorrowClasses.length === 0 ? (
                    <div className="text-xs text-[var(--color-text-muted)] py-3 text-center">
                      {isMM ? 'မနက်ဖြန် အတန်းမရှိပါ (အားလပ်ရက်ဖြစ်ပါသည်)' : 'No classes scheduled for tomorrow.'}
                    </div>
                  ) : (
                    tomorrowClasses.map((cls, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-[var(--color-bg-input)]/60 hover:bg-[var(--color-bg-input)] rounded-xl text-xs transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                          <span className="font-bold font-sans text-[var(--color-text-primary)]">{cls.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[var(--color-text-muted)]">{cls.timeStr}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Workplace Mode Dashboard */}
          {!isStudent && (
            <div className="space-y-4">
              {/* Workplace Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-3 sm:p-4 rounded-2xl flex flex-col items-center text-center">
                  <div className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold mb-1">
                    {isMM ? 'ကျန်ရှိသော လုပ်ငန်း' : 'Tasks Left'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
                    <span className="text-blue-500">{tasks.length}</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-3 sm:p-4 rounded-2xl flex flex-col items-center text-center">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                    {isMM ? 'Focus နာရီ' : 'Focus Hours'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
                    <span className="text-emerald-500">0.0</span>
                    <span className="text-sm text-[var(--color-text-muted)]">h</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-3 sm:p-4 rounded-2xl flex flex-col items-center text-center sm:col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold mb-1">
                    {isMM ? 'အမြန်မှတ်စု' : 'Quick Note'}
                  </div>
                  <div className="w-full relative mt-1">
                    <textarea 
                      placeholder={isMM ? "မှတ်စရာရှိတာ မှတ်ထားပါ..." : "Jot down something quick..."}
                      value={quickNote}
                      onChange={handleQuickNoteChange}
                      className="w-full bg-[var(--color-bg-input)] text-xs border-none rounded-xl p-2 resize-none outline-none text-[var(--color-text-primary)] h-12 focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Daily Finances Widget (Net Balance, Income, Expense, Transactions) */}
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden space-y-0">
                <div className="p-3 sm:p-4 border-b border-[var(--color-border)] flex flex-wrap items-center justify-between bg-[var(--color-bg-input)] gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl shadow-xs">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[var(--color-text-primary)]">
                        {isMM ? "ယနေ့ ငွေစာရင်းနှင့် လက်ကျန်ငွေ" : "Today's Finances & Net Balance"}
                      </h3>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {isMM ? "ဝင်ငွေ၊ ထွက်ငွေ၊ လက်ကျန်ငွေ ခြေရာခံစနစ်" : "Income, Expense & Balance Tracker"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setIsAnalyticsOpen(true)}
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title={isMM ? 'ငွေစာရင်း အကျဉ်းချုပ်နှင့် သုံးသပ်ချက်' : 'Finance Analytics & Budget'}
                    >
                      <BarChart3 className="w-3 h-3 text-indigo-500" />
                      <span>{isMM ? 'အသေးစိတ်' : 'Analytics'}</span>
                    </button>
                    <button 
                      onClick={() => { setTransactionFormType('expense'); setTransactionForm({ amount: '', category: 'food', note: '' }); setIsTransactionModalOpen(true); }}
                      className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" /> {isMM ? 'ထွက်ငွေ' : 'Expense'}
                    </button>
                    <button 
                      onClick={() => { setTransactionFormType('income'); setTransactionForm({ amount: '', category: 'extra_income', note: '' }); setIsTransactionModalOpen(true); }}
                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> {isMM ? 'ဝင်ငွေ' : 'Income'}
                    </button>
                  </div>
                </div>

                {/* Quick Add Shortcuts Bar */}
                <div className="px-3 py-2 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px] font-bold">
                  <span className="text-[var(--color-text-muted)] flex-shrink-0 mr-1">
                    {isMM ? 'အမြန်ထည့်မည်:' : 'Quick Add:'}
                  </span>
                  <button
                    onClick={() => { setTransactionFormType('expense'); setTransactionForm({ amount: '', category: 'food', note: 'မနက်စာ/အစားအသောက်' }); setIsTransactionModalOpen(true); }}
                    className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Utensils className="w-3 h-3" /> {isMM ? 'အစားအသောက်' : 'Food'}
                  </button>
                  <button
                    onClick={() => { setTransactionFormType('expense'); setTransactionForm({ amount: '', category: 'transport', note: 'သွားလာစရိတ်' }); setIsTransactionModalOpen(true); }}
                    className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Bus className="w-3 h-3" /> {isMM ? 'သွားလာစရိတ်' : 'Transport'}
                  </button>
                  <button
                    onClick={() => { setTransactionFormType('expense'); setTransactionForm({ amount: '', category: 'shopping', note: 'စျေးဝယ်ခြင်း' }); setIsTransactionModalOpen(true); }}
                    className="px-2 py-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-lg flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <ShoppingBag className="w-3 h-3" /> {isMM ? 'စျေးဝယ်' : 'Shopping'}
                  </button>
                  <button
                    onClick={() => { setTransactionFormType('expense'); setTransactionForm({ amount: '', category: 'bills', note: 'ဖုန်း/ဘေလ်များ' }); setIsTransactionModalOpen(true); }}
                    className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Smartphone className="w-3 h-3" /> {isMM ? 'ဘေလ်' : 'Bills'}
                  </button>
                  <button
                    onClick={() => { setTransactionFormType('income'); setTransactionForm({ amount: '', category: 'extra_income', note: 'အပိုဝင်ငွေ' }); setIsTransactionModalOpen(true); }}
                    className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Coins className="w-3 h-3" /> {isMM ? 'ဝင်ငွေ' : 'Income'}
                  </button>
                </div>

                {/* Net Balance & Breakdown */}
                <div className="p-3 sm:p-4 grid grid-cols-3 gap-3 bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">
                  <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1">
                      {isMM ? 'လက်ကျန်ငွေ' : 'Net Balance'}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[var(--color-text-primary)]">
                      {financeStats.netBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1 flex items-center gap-1 justify-center">
                      <ArrowUpCircle className="w-3 h-3 text-emerald-500" />
                      {isMM ? 'ဝင်ငွေ' : 'Income'}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{financeStats.totalIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1 flex items-center gap-1 justify-center">
                      <ArrowDownCircle className="w-3 h-3 text-red-500" />
                      {isMM ? 'ထွက်ငွေ' : 'Expenses'}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-red-600 dark:text-red-400">
                      -{financeStats.totalExpense.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Monthly Budget Bar (If budget is set) */}
                {financeStats.monthlyBudget > 0 && (
                  <div className="px-3 sm:px-4 py-2 bg-[var(--color-bg-input)] border-b border-[var(--color-border)] space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[var(--color-text-muted)] flex items-center gap-1">
                        <Target className="w-3 h-3 text-indigo-500" />
                        {isMM ? 'လစဉ် ဘတ်ဂျက်:' : 'Monthly Budget:'}
                      </span>
                      <span className="text-[var(--color-text-primary)]">
                        {financeStats.thisMonthExpense.toLocaleString()} / {financeStats.monthlyBudget.toLocaleString()} Ks ({financeStats.budgetUsagePercent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--color-bg-card)] rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${financeStats.budgetUsagePercent}%` }}
                        className={`h-full rounded-full transition-all ${
                          financeStats.budgetUsagePercent >= 100 ? 'bg-red-500' : financeStats.budgetUsagePercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                )}
                
                {/* Transaction List for Today - Collapsible Section */}
                <div className="p-3 sm:p-4 space-y-2">
                  <div 
                    onClick={() => setIsTxListOpen(!isTxListOpen)}
                    className="flex items-center justify-between cursor-pointer group py-1 border-t border-[var(--color-border)]/40 pt-2"
                  >
                    <div className="text-[11px] font-extrabold text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                      <span>{isMM ? 'ယနေ့ စာရင်းမှတ်တမ်း' : "Today's Log"}</span>
                      <span className="text-[9px] bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] font-mono px-1.5 py-0.2 rounded-full border border-[var(--color-border)]">
                        {financeStats.todaysTransactions.length}
                      </span>
                    </div>

                    <button className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] font-bold flex items-center gap-1 transition-colors">
                      <span>{isTxListOpen ? (isMM ? 'ခေါက်သိမ်းမည်' : 'Collapse') : (isMM ? 'အပြည့်အစုံကြည့်မည်' : 'Expand')}</span>
                      {isTxListOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isTxListOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2 pt-1"
                    >
                      {financeStats.todaysTransactions.length === 0 ? (
                        <div className="text-center py-4 text-[10px] text-[var(--color-text-muted)] font-medium border-2 border-dashed border-[var(--color-border)] rounded-xl">
                          {isMM ? 'ယနေ့အတွက် ငွေစာရင်း မှတ်တမ်း မရှိသေးပါ။' : 'No transactions recorded today.'}
                        </div>
                      ) : (
                        financeStats.todaysTransactions.map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-1.5 rounded-lg ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                                {tx.category === 'food' && <Utensils className="w-3.5 h-3.5" />}
                                {tx.category === 'transport' && <Bus className="w-3.5 h-3.5" />}
                                {tx.category === 'shopping' && <ShoppingBag className="w-3.5 h-3.5" />}
                                {tx.category === 'bills' && <Smartphone className="w-3.5 h-3.5" />}
                                {tx.category === 'extra_income' && <Coins className="w-3.5 h-3.5" />}
                                {tx.category === 'others' && <MoreHorizontal className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-[var(--color-text-primary)]">
                                  {isMM ? 
                                    (tx.category === 'food' ? 'စားသောက်' : tx.category === 'transport' ? 'သွားလာ' : tx.category === 'shopping' ? 'စျေးဝယ်' : tx.category === 'bills' ? 'ဘေလ်/ဖုန်း' : tx.category === 'extra_income' ? 'အပိုဝင်ငွေ' : 'အခြား') 
                                    : (tx.category.charAt(0).toUpperCase() + tx.category.slice(1).replace('_', ' '))
                                  }
                                </span>
                                {tx.note && <span className="text-[9px] text-[var(--color-text-muted)]">{tx.note}</span>}
                              </div>
                            </div>
                            <div className={`font-extrabold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                              {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </div>
              </div>


              {/* Task Priorities and Upcoming Meetings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
                  <div 
                    onClick={() => setIsTasksOpen(!isTasksOpen)}
                    className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-3 cursor-pointer group"
                  >
                    <div className="font-bold text-sm text-[var(--color-primary)] flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>{isMM ? 'အရေးကြီး လုပ်ငန်းများ (High Priority)' : 'High Priority Tasks'}</span>
                      <span className="text-xs bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] font-mono px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                        {tasks.length}
                      </span>
                    </div>
                    <button className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] font-bold flex items-center gap-1 transition-colors">
                      {isTasksOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isTasksOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      {tasks.length > 0 ? (
                        tasks.slice(0, 5).map((task, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2.5 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]/50 group">
                            <button
                              onClick={() => onToggleTask && onToggleTask(task)}
                              className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
                            >
                            </button>
                            <span className="text-sm text-[var(--color-text-primary)] flex-1">{task}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-[var(--color-text-muted)] text-center py-4 border border-dashed border-[var(--color-border)] rounded-xl">
                          {isMM ? 'လုပ်ငန်းများ ပြီးစီးပါပြီ သို့မဟုတ် မရှိသေးပါ။' : 'No priority tasks right now.'}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-3">
                    <div className="font-bold text-sm text-[var(--color-primary)] flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4" />
                      <span>{isMM ? 'ချိန်းဆိုမှုများ (Meetings & Appts)' : 'Meetings & Appts'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {events.filter(e => e.date === new Date().toISOString().split('T')[0] && !e.completed).length > 0 ? (
                      events.filter(e => e.date === new Date().toISOString().split('T')[0] && !e.completed).map((evt, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 bg-[var(--color-bg-input)] rounded-xl border-l-4 border-indigo-500 text-xs">
                          <div className="flex-1">
                            <div className="font-semibold text-[var(--color-text-primary)]">{evt.title}</div>
                            <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{evt.time} • {evt.category}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[var(--color-text-muted)] italic text-center py-4 border-2 border-dashed border-[var(--color-border)] rounded-xl">
                        {isMM ? 'ယနေ့ အစည်းအဝေးများ မရှိပါ။' : 'No meetings scheduled for today.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADD TRANSACTION MODAL */}
          <MacWindowFrame
            isOpen={isTransactionModalOpen}
            onClose={() => setIsTransactionModalOpen(false)}
            title={transactionFormType === 'income' ? (isMM ? 'ဝင်ငွေ စာရင်းထည့်မည်' : 'Add Income') : (isMM ? 'ထွက်ငွေ စာရင်းထည့်မည်' : 'Add Expense')}
            maxWidthClass="max-w-md"
            icon={<Wallet className="w-4 h-4 text-indigo-500" />}
          >
            <div className="space-y-4 p-1">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isMM ? 'အမျိုးအစား' : 'Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setTransactionFormType('expense'); setTransactionForm(f => ({ ...f, category: 'food' })); }}
                    className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                      transactionFormType === 'expense' ? 'bg-red-500 text-white border-transparent' : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>{isMM ? 'ထွက်ငွေ (Expense)' : 'Expense'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTransactionFormType('income'); setTransactionForm(f => ({ ...f, category: 'extra_income' })); }}
                    className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                      transactionFormType === 'income' ? 'bg-emerald-600 text-white border-transparent' : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isMM ? 'ဝင်ငွေ (Income)' : 'Income'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isMM ? 'ပမာဏ' : 'Amount'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={transactionForm.amount}
                  onChange={e => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  className="w-full p-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm font-bold text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isMM ? 'အမျိုးအစား ခေါင်းစဉ်' : 'Category'}
                </label>
                <select
                  value={transactionForm.category}
                  onChange={e => setTransactionForm({ ...transactionForm, category: e.target.value as TransactionCategory })}
                  className="w-full p-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-primary)]"
                >
                  {transactionFormType === 'expense' ? (
                    <>
                      <option value="food">{isMM ? 'စားသောက်စရိတ်' : 'Food & Dining'}</option>
                      <option value="transport">{isMM ? 'သွားလာစရိတ်' : 'Transport'}</option>
                      <option value="shopping">{isMM ? 'စျေးဝယ်ခြင်း' : 'Shopping'}</option>
                      <option value="bills">{isMM ? 'ဖုန်း/ဘေလ်များ' : 'Bills & Utilities'}</option>
                      <option value="others">{isMM ? 'အခြား' : 'Others'}</option>
                    </>
                  ) : (
                    <>
                      <option value="extra_income">{isMM ? 'အပိုဝင်ငွေ / OT' : 'Extra Income / Bonus'}</option>
                      <option value="others">{isMM ? 'အခြား ဝင်ငွေ' : 'Other Income'}</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isMM ? 'မှတ်ချက် (စိတ်ကြိုက်)' : 'Note (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isMM ? 'မှတ်ချက်ရေးရန်...' : 'Add a short note...'}
                  value={transactionForm.note}
                  onChange={e => setTransactionForm({ ...transactionForm, note: e.target.value })}
                  className="w-full p-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-primary)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="px-4 py-2 bg-[var(--color-bg-input)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] rounded-xl font-bold text-xs cursor-pointer"
                >
                  {isMM ? 'မလုပ်တော့ပါ' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveTransaction}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isMM ? 'သိမ်းဆည်းမည်' : 'Save Transaction'}
                </button>
              </div>
            </div>
          </MacWindowFrame>
        </motion.div>
      )}
    </AnimatePresence>

    <FinanceAnalyticsModal
      isOpen={isAnalyticsOpen}
      onClose={() => setIsAnalyticsOpen(false)}
      transactions={transactions}
      preferences={preferences}
      setPreferences={setPreferences}
      onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))}
    />
    </>
  );
};
