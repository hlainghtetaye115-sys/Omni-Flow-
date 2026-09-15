import React, { useState, useMemo } from 'react';
import {
  Briefcase, Calendar, Clock, Plus, ChevronLeft, ChevronRight, CheckCircle2,
  DollarSign, TrendingUp, AlertCircle, Edit3, Trash2, Video, MapPin, Download,
  Sparkles, Coffee, Moon, Sun, Home as HomeIcon, Zap, Check, FileText, ChevronDown, ChevronUp,
  RefreshCw, Copy, Quote, Wallet, ArrowDownCircle, ArrowUpCircle, Minus, ShoppingBag, Utensils, Bus, Smartphone, MoreHorizontal, Coins, Receipt, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkShiftItem, ShiftType, Preferences, ImportantEvent, Transaction, TransactionType, TransactionCategory } from '../types';
import { MacWindowFrame } from './Modals';

import { getRandomQuote, getDailyQuote, DailyQuote } from '../data/motivationalQuotes';
import { audioAlert } from '../utils/audioAlert';

interface WorkplaceTabProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  workShifts: WorkShiftItem[];
  onSaveWorkShift: (shift: WorkShiftItem) => void;
  onDeleteWorkShift: (id: string) => void;
  onBatchUpdateShifts: (shifts: WorkShiftItem[]) => void;
  events: ImportantEvent[];
  onAddEvent: (event: ImportantEvent) => void;
  preferences: Preferences;
  onSwitchLifeMode: (mode: 'student' | 'workplace') => void;
  onOpenMotivationHub?: () => void;
}

const SHIFT_CONFIG: Record<ShiftType, { labelMM: string; labelEN: string; color: string; defaultStart: string; defaultEnd: string; hours: number; icon: any }> = {
  morning: { labelMM: 'မနက်ဆင်းချိန် (Morning)', labelEN: 'Morning Shift', color: '#10B981', defaultStart: '08:00', defaultEnd: '16:00', hours: 8, icon: Sun },
  evening: { labelMM: 'ညနေဆင်းချိန် (Evening)', labelEN: 'Evening Shift', color: '#F59E0B', defaultStart: '16:00', defaultEnd: '00:00', hours: 8, icon: Coffee },
  night: { labelMM: 'ညဆင်းချိန် (Night)', labelEN: 'Night Shift', color: '#8B5CF6', defaultStart: '00:00', defaultEnd: '08:00', hours: 8, icon: Moon },
  off: { labelMM: 'ပိတ်ရက် (Day Off)', labelEN: 'Day Off', color: '#6B7280', defaultStart: '00:00', defaultEnd: '00:00', hours: 0, icon: Coffee },
  wfh: { labelMM: 'အိမ်မှအလုပ်လုပ် (WFH)', labelEN: 'Work From Home', color: '#06B6D4', defaultStart: '09:00', defaultEnd: '17:00', hours: 8, icon: HomeIcon },
  custom: { labelMM: 'စိတ်ကြိုက်ဆင်းချိန် (Custom)', labelEN: 'Custom Shift', color: '#EC4899', defaultStart: '09:00', defaultEnd: '18:00', hours: 8, icon: Zap }
};

export const WorkplaceTab: React.FC<WorkplaceTabProps> = ({
  transactions,
  setTransactions,
  workShifts,
  onSaveWorkShift,
  onDeleteWorkShift,
  onBatchUpdateShifts,
  events,
  onAddEvent,
  preferences,
  onSwitchLifeMode,
  onOpenMotivationHub
}) => {
  const isMM = preferences.lang === 'my';
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);
  const [isGridExpanded, setIsGridExpanded] = useState(true);

  // Workplace Motivation Quote State
  const [workQuote, setWorkQuote] = useState<DailyQuote>(() => 
    getRandomQuote(preferences.lang, 'workplace')
  );
  const [copiedWorkQuote, setCopiedWorkQuote] = useState(false);

  const handleNextWorkQuote = () => {
    const nextQ = getRandomQuote(preferences.lang, 'workplace');
    setWorkQuote(nextQ);
  };

  const handleCopyWorkQuote = () => {
    navigator.clipboard.writeText(`"${workQuote.quote}" — ${workQuote.author}`);
    setCopiedWorkQuote(true);
    setTimeout(() => setCopiedWorkQuote(false), 2000);
  };

  
  const [salaryConfig, setSalaryConfig] = useState<{
    type: 'hourly' | 'monthly';
    amount: number;
    currency: string;
    taxRate: number;
    otMultiplier: number;
  }>(() => {
    try {
      const saved = localStorage.getItem('omniflow_salary_config');
      if (saved) return JSON.parse(saved);
      const oldRate = localStorage.getItem('omniflow_work_hourly_rate');
      return {
        type: 'hourly',
        amount: oldRate ? Number(oldRate) : 5000,
        currency: 'MMK',
        taxRate: 0,
        otMultiplier: 1.5
      };
    } catch {
      return { type: 'hourly', amount: 5000, currency: 'MMK', taxRate: 0, otMultiplier: 1.5 };
    }
  });

  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);


  const handleSaveSalaryConfig = (config: any) => {
    setSalaryConfig(config);
    localStorage.setItem('omniflow_salary_config', JSON.stringify(config));
  };// State for shift editor modal
  const [editingShift, setEditingShift] = useState<Partial<WorkShiftItem>>({
    date: selectedDate,
    shiftType: 'morning',
    title: 'Morning Regular Shift',
    startTime: '08:00',
    endTime: '16:00',
    otHours: 0,
    location: 'Office',
    notes: ''
  });

  // Calculate days in current month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  }, [currentYear, currentMonth]);

  const monthName = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    return isMM
      ? `${currentYear} ခုနှစ်၊ ${d.toLocaleDateString('my-MM', { month: 'long' })}`
      : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentYear, currentMonth, isMM]);

  // Filter shifts for current month
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthShifts = useMemo(() => {
    return workShifts.filter(s => s.date.startsWith(monthPrefix));
  }, [workShifts, monthPrefix]);

  const shiftsMap = useMemo(() => {
    const map = new Map<string, WorkShiftItem>();
    monthShifts.forEach(s => map.set(s.date, s));
    return map;
  }, [monthShifts]);

  // Statistics calculation for the month
  const stats = useMemo(() => {
    let totalWorkHours = 0;
    let totalOtHours = 0;
    let shiftsCount = 0;
    let offDaysCount = 0;
    let wfhCount = 0;

    monthShifts.forEach(s => {
      if (s.shiftType === 'off') {
        offDaysCount++;
      } else {
        shiftsCount++;
        const config = SHIFT_CONFIG[s.shiftType] || SHIFT_CONFIG.morning;
        totalWorkHours += config.hours;
        totalOtHours += (s.otHours || 0);
        if (s.shiftType === 'wfh') wfhCount++;
      }
    });

    let baseSalary = 0;
    let otSalary = 0;
    
    if (salaryConfig.type === 'hourly') {
      baseSalary = totalWorkHours * salaryConfig.amount;
      otSalary = totalOtHours * (salaryConfig.amount * salaryConfig.otMultiplier);
    } else {
      // Monthly
      baseSalary = salaryConfig.amount;
      // Estimate hourly rate for OT if monthly (assuming 160 hrs/month approx)
      const estimatedHourly = salaryConfig.amount / 160;
      otSalary = totalOtHours * (estimatedHourly * salaryConfig.otMultiplier);
    }
    
    const grossIncome = baseSalary + otSalary;
    const taxDeduction = grossIncome * (salaryConfig.taxRate / 100);
    const estimatedSalary = grossIncome - taxDeduction;

    return {
      totalWorkHours,
      totalOtHours,
      shiftsCount,
      offDaysCount,
      wfhCount,
      estimatedSalary,
      baseSalary,
      otSalary,
      grossIncome,
      taxDeduction
    };
  }, [monthShifts, salaryConfig]);


  // Finance Calculation
  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const isSalarySynced = useMemo(() => {
    return transactions.some(t => t.note && t.note.includes(`Estimated Salary (${currentMonthStr})`));
  }, [transactions, currentMonthStr]);

  const handleSyncSalaryToWallet = () => {
    const amount = Math.round(stats.estimatedSalary);
    if (amount <= 0) return;

    const noteStr = `Estimated Salary (${currentMonthStr})`;
    const existingIdx = transactions.findIndex(t => t.note && t.note.includes(`Estimated Salary (${currentMonthStr})`));

    if (existingIdx >= 0) {
      const updated = [...transactions];
      updated[existingIdx] = {
        ...updated[existingIdx],
        amount,
        date: new Date().toISOString().split('T')[0]
      };
      setTransactions(updated);
    } else {
      const newTx: Transaction = {
        id: 'tx_' + Date.now(),
        type: 'income',
        amount,
        category: 'extra_income',
        date: new Date().toISOString().split('T')[0],
        note: noteStr
      };
      setTransactions(prev => [...prev, newTx]);
    }
  };

  const financeStats = useMemo(() => {
    const currentMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    let totalExtraIncome = 0;
    let totalExpense = 0;

    currentMonthTransactions.forEach(t => {
      if (t.type === 'income') totalExtraIncome += t.amount;
      if (t.type === 'expense') totalExpense += t.amount;
    });

    const totalIncome = stats.estimatedSalary + totalExtraIncome;
    const netBalance = totalIncome - totalExpense;
    
    // Calculate percentage spent based on total income (prevent division by zero)
    const percentSpent = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;

    return { totalExtraIncome, totalExpense, totalIncome, netBalance, percentSpent, currentMonthTransactions };
  }, [transactions, stats.estimatedSalary, currentYear, currentMonth]);



  // Selected date shift
  const selectedShift = useMemo(() => {
    return workShifts.find(s => s.date === selectedDate);
  }, [workShifts, selectedDate]);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const openAddShiftModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = workShifts.find(s => s.date === dateStr);
    if (existing) {
      setEditingShift({ ...existing });
    } else {
      setEditingShift({
        id: 'shift_' + Date.now(),
        date: dateStr,
        shiftType: 'morning',
        title: 'Morning Shift',
        startTime: '08:00',
        endTime: '16:00',
        otHours: 0,
        location: 'Office',
        notes: ''
      });
    }
    setIsShiftModalOpen(true);
  };

  const handleSaveCurrentShift = () => {
    if (!editingShift.date) return;
    const shiftToSave: WorkShiftItem = {
      id: editingShift.id || 'shift_' + Date.now(),
      date: editingShift.date,
      shiftType: editingShift.shiftType || 'morning',
      title: editingShift.title || 'Work Shift',
      startTime: editingShift.startTime || '08:00',
      endTime: editingShift.endTime || '16:00',
      otHours: Number(editingShift.otHours) || 0,
      location: editingShift.location || '',
      meetingLink: editingShift.meetingLink || '',
      notes: editingShift.notes || '',
      color: SHIFT_CONFIG[editingShift.shiftType || 'morning'].color
    };
    onSaveWorkShift(shiftToSave);
    setIsShiftModalOpen(false);
  };

  // Export Monthly Summary as text
  const exportMonthlyReport = () => {
    const lines = [
      `=========================================`,
      `💼 OMNIFLOW WORKPLACE ATTENDANCE REPORT`,
      `📅 Month: ${monthName}`,
      `=========================================`,
      `Total Shifts Worked: ${stats.shiftsCount} days`,
      `Total Regular Hours: ${stats.totalWorkHours} hrs`,
      `Total Overtime (OT): ${stats.totalOtHours} hrs`,
      `Total Days Off: ${stats.offDaysCount} days`,
      `Work From Home (WFH): ${stats.wfhCount} days`,
      `Estimated Earnings: ${stats.estimatedSalary.toLocaleString()} (Rate: ${salaryConfig.amount}${salaryConfig.currency}/${salaryConfig.type === 'hourly' ? 'hr' : 'mo'})`,
      `-----------------------------------------`,
      `DAILY BREAKDOWN:`,
      ...monthShifts.map(s => `• ${s.date}: [${s.shiftType.toUpperCase()}] ${s.title} (${s.startTime}-${s.endTime}) ${s.otHours ? `+OT: ${s.otHours}h` : ''} ${s.notes ? `Note: ${s.notes}` : ''}`)
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Work_Report_${monthPrefix}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Apply Quick 5-day work / 2-day off pattern
  const applyWeeklyPattern = (patternType: 'mon_fri' | 'rotational') => {
    const newShifts: WorkShiftItem[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(currentYear, currentMonth, day);
      const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat

      if (patternType === 'mon_fri') {
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        newShifts.push({
          id: 'shift_' + dateStr,
          date: dateStr,
          shiftType: isWeekend ? 'off' : 'morning',
          title: isWeekend ? 'Day Off' : 'Regular Shift',
          startTime: isWeekend ? '00:00' : '09:00',
          endTime: isWeekend ? '00:00' : '17:00',
          otHours: 0,
          location: 'Office'
        });
      } else if (patternType === 'rotational') {
        // 4 on, 2 off rotational
        const cycle = day % 6;
        const isOff = cycle === 0 || cycle === 5;
        newShifts.push({
          id: 'shift_' + dateStr,
          date: dateStr,
          shiftType: isOff ? 'off' : (cycle % 2 === 0 ? 'morning' : 'evening'),
          title: isOff ? 'Day Off' : 'Rotation Shift',
          startTime: isOff ? '00:00' : '08:00',
          endTime: isOff ? '00:00' : '16:00',
          otHours: 0
        });
      }
    }
    onBatchUpdateShifts(newShifts);
    setIsPatternModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Life Mode Switcher & Greeting Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-transparent border border-blue-500/30 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base sm:text-lg text-[var(--color-text-primary)]">
                {isMM ? 'လုပ်ငန်းခွင် & ရုံးသုံး အချိန်ဇယားစနစ်' : 'Professional Workplace & Shift Manager'}
              </h2>
              <span className="text-[10px] bg-blue-600 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                Work Mode
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {isMM
                ? 'လအလိုက် Shift ဇယား၊ အစည်းအဝေးများ၊ OT နှင့် အလုပ်ဆင်းချိန် စာရင်းများ'
                : 'Monthly shift roster, standups, OT hours & attendance tracker'}
            </p>
          </div>
        </div>

        {/* Switch back to Student Mode Button */}
        <button
          onClick={() => onSwitchLifeMode('student')}
          className="px-4 py-2 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all"
        >
          <span>🎓 {isMM ? 'ကျောင်းသား ပုံစံသို့ ပြောင်းမည်' : 'Switch to Student Mode'}</span>
        </button>
      </div>

      {/* Dedicated Work Mode Motivation Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-500/10 via-[var(--color-bg-card)] to-indigo-500/10 border border-blue-500/20 rounded-2xl shadow-xs relative overflow-hidden group">
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={handleCopyWorkQuote}
            className="p-1.5 rounded-lg bg-[var(--color-bg-input)] hover:bg-blue-600 hover:text-white text-[var(--color-text-muted)] transition-all cursor-pointer"
            title={isMM ? 'ကူးယူမည်' : 'Copy Quote'}
          >
            {copiedWorkQuote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleNextWorkQuote}
            className="p-1.5 rounded-lg bg-[var(--color-bg-input)] hover:bg-blue-600 hover:text-white text-[var(--color-text-muted)] transition-all cursor-pointer"
            title={isMM ? 'အခြား စာသားကြည့်မည်' : 'Next Quote'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {onOpenMotivationHub && (
            <button
              onClick={onOpenMotivationHub}
              className="p-1.5 px-2 rounded-lg bg-[var(--color-bg-input)] hover:bg-blue-600 hover:text-white text-[var(--color-text-muted)] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              title={isMM ? 'စာကြည့်တိုက် အားလုံးကြည့်မည်' : 'Open Motivation Hub'}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isMM ? 'စာကြည့်တိုက်' : 'Library'}</span>
            </button>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-600 rounded-xl flex-shrink-0 mt-0.5">
            <Quote className="w-4 h-4" />
          </div>
          <div className="pr-20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {isMM ? '💼 လုပ်ငန်းခွင် စိတ်ဓာတ်ခွန်အား (Work Motivation)' : '💼 Work Mode Daily Motivation'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] leading-relaxed italic">
              "{workQuote.quote}"
            </p>
            <div className="text-[11px] font-bold text-[var(--color-text-muted)] mt-1">
              — {workQuote.author}
            </div>
          </div>
        </div>
      </div>

      {/* Stats KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1">
            <span>{isMM ? 'အလုပ်ဆင်းရက်' : 'Worked Days'}</span>
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[var(--color-text-primary)]">
            {stats.shiftsCount} <span className="text-xs font-normal text-[var(--color-text-muted)]">{isMM ? 'ရက်' : 'days'}</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            {stats.totalWorkHours} {isMM ? 'နာရီ ပေါင်း' : 'total hrs'}
          </div>
        </div>

        <div className="p-3.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1">
            <span>{isMM ? 'အချိန်ပို (OT)' : 'Overtime'}</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.totalOtHours} <span className="text-xs font-normal text-[var(--color-text-muted)]">{isMM ? 'နာရီ' : 'hrs'}</span>
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            1.5x Rate Multiplier
          </div>
        </div>

        <div className="p-3.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1">
            <span>{isMM ? 'ပိတ်ရက် / WFH' : 'Off / WFH'}</span>
            <Coffee className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-purple-600 dark:text-purple-400">
            {stats.offDaysCount} / {stats.wfhCount}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            {isMM ? 'အနားယူရက် / အိမ်မှအလုပ်' : 'Rest & Remote'}
          </div>
        </div>

        
        <div 
          onClick={() => setIsCalculatorModalOpen(true)}
          className="p-3.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-xs hover:border-[var(--color-primary)] cursor-pointer transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1">
            <span>{isMM ? 'ခန့်မှန်း ဝင်ငွေ' : 'Est. Earnings'}</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
            {stats.estimatedSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
            <span className="text-[10px] font-bold text-emerald-600/70">{salaryConfig.currency}</span>
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5 flex items-center justify-between">
            <span>
              {salaryConfig.type === 'hourly' 
                ? `${salaryConfig.amount}${salaryConfig.currency}/hr` 
                : `${salaryConfig.amount.toLocaleString()}${salaryConfig.currency}/mo`
              }
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleSyncSalaryToWallet(); }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                isSalarySynced
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Wallet className="w-3 h-3" />
              <span>{isSalarySynced ? (isMM ? 'ထည့်ပြီး' : 'Synced') : (isMM ? 'ထည့်မည်' : 'Sync')}</span>
            </button>
          </div>
        </div>

      </div>

      {/* MONTHLY CALENDAR GRID & ROSTER */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Calendar Header Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-[var(--color-bg-input)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-extrabold text-base sm:text-lg text-[var(--color-text-primary)] px-2">
              {monthName}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-[var(--color-bg-input)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] cursor-pointer transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions & Collapsible Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={() => setIsGridExpanded(!isGridExpanded)}
              className="px-3 py-1.5 bg-[var(--color-bg-input)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-[var(--color-border)]"
            >
              {isGridExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{isGridExpanded ? (isMM ? 'ဇယား ခေါက်သိမ်းမည်' : 'Collapse Grid') : (isMM ? 'ဇယား ကြည့်မည်' : 'Expand Grid')}</span>
            </button>

            <button
              onClick={() => setIsPatternModalOpen(true)}
              className="px-3 py-1.5 bg-[var(--color-bg-input)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isMM ? 'အလိုအလျောက် သတ်မှတ်ရန်' : 'Auto Fill'}</span>
            </button>

            <button
              onClick={exportMonthlyReport}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isMM ? 'Report ထုတ်မည်' : 'Export'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Monthly Grid */}
        {isGridExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-extrabold text-[var(--color-text-muted)] py-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="uppercase tracking-wider text-[11px]">{d}</div>
              ))}
            </div>

            {/* Monthly Calendar Cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Empty cells before 1st day */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={'empty_' + i} className="min-h-[72px] sm:min-h-[88px] rounded-xl bg-[var(--color-bg-input)]/20 border border-transparent" />
              ))}

              {/* Days in current month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const shift = shiftsMap.get(dateStr);
                const isToday = dateStr === today.toISOString().split('T')[0];
                const isSelected = dateStr === selectedDate;
                const config = shift ? SHIFT_CONFIG[shift.shiftType] : null;
                const IconComponent = config?.icon || Briefcase;

                return (
                  <motion.div
                    key={dateStr}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => openAddShiftModal(dateStr)}
                    className={`min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'ring-2 ring-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-bg-card)] shadow-xs'
                        : isToday
                        ? 'border-blue-500/60 bg-blue-500/10 shadow-xs'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-input)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-bg-card)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${
                        isToday 
                          ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shadow-xs' 
                          : 'text-[var(--color-text-primary)]'
                      }`}>
                        {dayNum}
                      </span>
                      
                      {shift?.otHours ? (
                        <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold px-1 py-0.2 rounded-md flex items-center gap-0.5 border border-amber-500/30">
                          <span>⚡</span>+{shift.otHours}h
                        </span>
                      ) : null}
                    </div>

                    {shift ? (
                      shift.shiftType === 'off' ? (
                        <div className="mt-1 px-1.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center justify-between gap-1">
                          <span className="truncate">{isMM ? 'ပိတ်ရက်' : 'OFF'}</span>
                          <Coffee className="w-3 h-3 flex-shrink-0 opacity-70" />
                        </div>
                      ) : (
                        <div
                          className="mt-1 p-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold truncate leading-tight flex flex-col justify-center space-y-0.5"
                          style={{
                            backgroundColor: `${config?.color}18`,
                            color: config?.color,
                            border: `1px solid ${config?.color}35`
                          }}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate font-black">
                              {shift.title || (isMM ? config?.labelMM.split(' ')[0] : config?.labelEN)}
                            </span>
                            {IconComponent && <IconComponent className="w-3 h-3 flex-shrink-0 opacity-80" />}
                          </div>

                          <div className="text-[8px] opacity-90 font-medium truncate">
                            {shift.startTime && shift.endTime 
                              ? `${shift.startTime} - ${shift.endTime}`
                              : (shift.workHours ? `${shift.workHours}h work` : '')}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="text-[9px] text-[var(--color-text-muted)] opacity-30 group-hover:opacity-100 flex items-center gap-0.5 justify-center py-1 transition-opacity">
                        <Plus className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Shift Type Color Legend Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] font-bold text-[var(--color-text-muted)] border-t border-[var(--color-border)]/50">
              <span className="text-[var(--color-text-primary)] font-extrabold">{isMM ? 'သင်္ကေတများ:' : 'Legend:'}</span>
              {(Object.keys(SHIFT_CONFIG) as ShiftType[]).map(key => {
                const cfg = SHIFT_CONFIG[key];
                return (
                  <div key={key} className="flex items-center gap-1 bg-[var(--color-bg-input)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span>{isMM ? cfg.labelMM.split(' ')[0] : cfg.labelEN}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Selected Day Shift Detail & Meeting Schedule */}
      {selectedShift ? (
        <div className="p-4 sm:p-5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: SHIFT_CONFIG[selectedShift.shiftType]?.color || '#10B981' }}
              >
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-[var(--color-text-primary)]">
                  {selectedShift.title} ({selectedShift.date})
                </h4>
                <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedShift.startTime} - {selectedShift.endTime}</span>
                  {selectedShift.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedShift.location}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openAddShiftModal(selectedShift.date)}
                className="p-2 bg-[var(--color-bg-input)] hover:bg-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteWorkShift(selectedShift.id)}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedShift.notes && (
            <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-input)] p-3 rounded-xl">
              📝 {selectedShift.notes}
            </p>
          )}

          {selectedShift.meetingLink && (
            <a
              href={selectedShift.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-all"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join Meeting Link</span>
            </a>
          )}
        </div>
      ) : null}

      {/* SHIFT EDIT MODAL */}
      <MacWindowFrame
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title={isMM ? `အချိန်ဇယား သတ်မှတ်ရန် (${editingShift.date})` : `Edit Shift (${editingShift.date})`}
        maxWidthClass="max-w-md"
        icon={<Briefcase className="w-4 h-4 text-blue-500" />}
      >
        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1.5">
              {isMM ? 'ဆင်းချိန် အမျိုးအစား (Shift Type)' : 'Shift Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SHIFT_CONFIG) as ShiftType[]).map(key => {
                const cfg = SHIFT_CONFIG[key];
                const isSelected = editingShift.shiftType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setEditingShift({
                        ...editingShift,
                        shiftType: key,
                        startTime: cfg.defaultStart,
                        endTime: cfg.defaultEnd,
                        title: isMM ? cfg.labelMM.split(' ')[0] : cfg.labelEN
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-input)] text-[var(--color-text-primary)]'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="truncate">{isMM ? cfg.labelMM.split(' ')[0] : cfg.labelEN}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isMM ? 'စတင်ချိန်' : 'Start Time'}
              </label>
              <input
                type="time"
                value={editingShift.startTime || '08:00'}
                onChange={e => setEditingShift({ ...editingShift, startTime: e.target.value })}
                className="w-full p-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isMM ? 'ပြီးဆုံးချိန်' : 'End Time'}
              </label>
              <input
                type="time"
                value={editingShift.endTime || '16:00'}
                onChange={e => setEditingShift({ ...editingShift, endTime: e.target.value })}
                className="w-full p-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isMM ? 'အချိန်ပို OT (နာရီ)' : 'Overtime (Hours)'}
              </label>
              <input
                type="number"
                min="0"
                max="12"
                step="0.5"
                value={editingShift.otHours ?? 0}
                onChange={e => setEditingShift({ ...editingShift, otHours: Number(e.target.value) })}
                className="w-full p-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                {isMM ? 'နေရာ / ရုံးခန်း' : 'Location'}
              </label>
              <input
                type="text"
                value={editingShift.location || ''}
                placeholder="Office / Home / Branch A"
                onChange={e => setEditingShift({ ...editingShift, location: e.target.value })}
                className="w-full p-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
              {isMM ? 'အစည်းအဝေး Link (Zoom / Meet)' : 'Meeting Link'}
            </label>
            <input
              type="text"
              value={editingShift.meetingLink || ''}
              placeholder="https://meet.google.com/..."
              onChange={e => setEditingShift({ ...editingShift, meetingLink: e.target.value })}
              className="w-full p-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
              {isMM ? 'မှတ်ချက် / တာဝန်များ' : 'Notes / Tasks'}
            </label>
            <textarea
              rows={2}
              value={editingShift.notes || ''}
              placeholder={isMM ? 'ဒီနေ့ လုပ်ဆောင်ရမည့် Tasks များနှင့် အစည်းအဝေးများ...' : 'Tasks, meetings, deadlines for this shift...'}
              onChange={e => setEditingShift({ ...editingShift, notes: e.target.value })}
              className="w-full p-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-primary)]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setIsShiftModalOpen(false)}
              className="flex-1 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl font-bold text-xs text-[var(--color-text-muted)] cursor-pointer"
            >
              {isMM ? 'မလုပ်တော့ပါ' : 'Cancel'}
            </button>
            <button
              onClick={handleSaveCurrentShift}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
            >
              {isMM ? 'သိမ်းဆည်းမည်' : 'Save Shift'}
            </button>
          </div>
        </div>
      </MacWindowFrame>

      {/* AUTO PATTERN MODAL */}
      <MacWindowFrame
        isOpen={isPatternModalOpen}
        onClose={() => setIsPatternModalOpen(false)}
        title={isMM ? 'တစ်လစာ အလိုအလျောက် သတ်မှတ်ခြင်း' : 'Auto Fill Monthly Roster'}
        maxWidthClass="max-w-md"
        icon={<Sparkles className="w-4 h-4 text-amber-500" />}
      >
        <div className="p-4 sm:p-5 space-y-3 text-xs">
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {isMM
              ? `${monthName} တစ်လလုံးအတွက် အလုပ်ဆင်းချိန် Pattern ကို တစ်ချက်နှိပ်ရုံဖြင့် အလိုအလျောက် သတ်မှတ်ပါမည်:`
              : 'Select a work shift template to auto-populate the entire month:'}
          </p>

          <button
            onClick={() => applyWeeklyPattern('mon_fri')}
            className="w-full p-3 bg-[var(--color-bg-input)] hover:border-blue-500 border border-[var(--color-border)] rounded-2xl text-left cursor-pointer transition-all space-y-1"
          >
            <div className="font-extrabold text-sm text-[var(--color-text-primary)] flex items-center justify-between">
              <span>{isMM ? '🏢 တနင်္လာ မှ သောကြာ (Regular Office 9 to 5)' : 'Mon - Fri Regular (9 AM - 5 PM)'}</span>
              <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">Standard</span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {isMM ? 'စနေ၊ တနင်္ဂနွေ ပိတ်ရက်၊ ကြားရက်များတွင် မနက် ၉ နာရီ မှ ညနေ ၅ နာရီ' : 'Sat & Sun Off, Mon-Fri 09:00 - 17:00'}
            </p>
          </button>

          <button
            onClick={() => applyWeeklyPattern('rotational')}
            className="w-full p-3 bg-[var(--color-bg-input)] hover:border-purple-500 border border-[var(--color-border)] rounded-2xl text-left cursor-pointer transition-all space-y-1"
          >
            <div className="font-extrabold text-sm text-[var(--color-text-primary)] flex items-center justify-between">
              <span>{isMM ? '🔄 အလှည့်ကျ ဇယား (4 Days Work, 2 Days Off Rotation)' : 'Rotational Shift (4-On, 2-Off)'}</span>
              <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold">Rotational</span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {isMM ? 'မနက်နှင့် ညနေ ဆင်းချိန်များ အလှည့်ကျ လည်ပတ်ခြင်း' : 'Alternating Morning and Evening shifts with 2 days off'}
            </p>
          </button>
              </div>
      </MacWindowFrame>


      <AnimatePresence>
        {isCalculatorModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--color-bg-card)] w-full max-w-md rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-input)]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[var(--color-text-primary)]">
                      {isMM ? 'ဝင်ငွေ နှင့် OT တွက်ချက်ခြင်း' : 'Income & OT Calculator'}
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {isMM ? 'လစာ၊ အချိန်ပို၊ နှင့် အခွန် တွက်ချက်မှု' : 'Calculate base, overtime, and taxes'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCalculatorModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-full hover:bg-[var(--color-bg-input)] transition-colors cursor-pointer"
                >
                  <span className="text-[var(--color-text-muted)]">✕</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-5 max-h-[85vh] overflow-y-auto scrollbar-none">
                
                {/* Result Dashboard */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <DollarSign className="w-24 h-24 transform rotate-12" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-emerald-100 text-[10px] font-extrabold uppercase tracking-widest mb-1">
                      {isMM ? 'စုစုပေါင်း ခန့်မှန်း ဝင်ငွေ' : 'Total Estimated Net Pay'}
                    </p>
                    <div className="text-3xl sm:text-4xl font-black tracking-tight mb-4 flex items-baseline gap-2">
                      {stats.estimatedSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      <span className="text-sm font-bold text-emerald-200">{salaryConfig.currency}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/20 rounded-xl p-2 border border-white/10">
                        <div className="text-[9px] text-emerald-200 mb-0.5">{isMM ? 'အခြေခံလစာ' : 'Base Pay'}</div>
                        <div className="font-bold text-xs">
                          {stats.baseSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-2 border border-white/10">
                        <div className="text-[9px] text-emerald-200 mb-0.5">{isMM ? 'အချိန်ပိုကြေး (OT)' : 'OT Pay'}</div>
                        <div className="font-bold text-xs">
                          +{stats.otSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-2 border border-white/10 col-span-2 flex items-center justify-between">
                        <div className="text-[9px] text-red-300">{isMM ? 'အခွန် / ဖြတ်တောက်မှု' : 'Tax Deduction'} ({salaryConfig.taxRate}%)</div>
                        <div className="font-bold text-xs text-red-200">
                          -{stats.taxDeduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <button
                        onClick={handleSyncSalaryToWallet}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all ${
                          isSalarySynced
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-white text-emerald-800 hover:bg-emerald-50'
                        }`}
                      >
                        <Wallet className="w-4 h-4" />
                        <span>
                          {isSalarySynced 
                            ? (isMM ? '✓ လစာ ဝင်ငွေ Wallet ထဲ ပေါင်းပြီးပြီ (ပြန်ပြင်ရန် နှိပ်ပါ)' : '✓ Salary Synced to Wallet (Click to update)')
                            : (isMM ? '💰 Wallet ထဲသို့ ဝင်ငွေအဖြစ် ထည့်သွင်းမည်' : 'Sync Salary & OT to Wallet')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Salary Type */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                        {isMM ? 'တွက်ချက်ပုံ' : 'Salary Type'}
                      </label>
                      <select
                        value={salaryConfig.type}
                        onChange={(e) => handleSaveSalaryConfig({...salaryConfig, type: e.target.value as any})}
                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[var(--color-text-primary)]"
                      >
                        <option value="hourly">{isMM ? 'နာရီအလိုက် (Hourly)' : 'Hourly'}</option>
                        <option value="monthly">{isMM ? 'လစာ (Monthly)' : 'Monthly'}</option>
                      </select>
                    </div>
                    {/* Currency */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                        {isMM ? 'ငွေကြေး' : 'Currency'}
                      </label>
                      <select
                        value={salaryConfig.currency}
                        onChange={(e) => handleSaveSalaryConfig({...salaryConfig, currency: e.target.value})}
                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[var(--color-text-primary)]"
                      >
                        <option value="MMK">MMK (Kyat)</option>
                        <option value="USD">USD ($)</option>
                        <option value="THB">THB (Baht)</option>
                        <option value="SGD">SGD (S$)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                      {salaryConfig.type === 'hourly' 
                        ? (isMM ? '၁ နာရီ လုပ်ခ (' + salaryConfig.currency + ')' : 'Hourly Rate (' + salaryConfig.currency + ')')
                        : (isMM ? 'အခြေခံ လစာ (' + salaryConfig.currency + ')' : 'Base Monthly Salary (' + salaryConfig.currency + ')')
                      }
                    </label>
                    <input
                      type="number"
                      value={salaryConfig.amount}
                      onChange={(e) => handleSaveSalaryConfig({...salaryConfig, amount: Number(e.target.value) || 0})}
                      className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[var(--color-text-primary)]"
                      placeholder="0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* OT Multiplier */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                        {isMM ? 'OT ဆတိုး' : 'OT Multiplier'}
                      </label>
                      <select
                        value={salaryConfig.otMultiplier}
                        onChange={(e) => handleSaveSalaryConfig({...salaryConfig, otMultiplier: Number(e.target.value)})}
                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[var(--color-text-primary)]"
                      >
                        <option value="1">1.0x (Normal)</option>
                        <option value="1.5">1.5x (Standard)</option>
                        <option value="2">2.0x (Double)</option>
                        <option value="3">3.0x (Triple/Holiday)</option>
                      </select>
                    </div>
                    {/* Tax Rate */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                        {isMM ? 'အခွန်ရာခိုင်နှုန်း (%)' : 'Tax Deduction (%)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={salaryConfig.taxRate}
                        onChange={(e) => handleSaveSalaryConfig({...salaryConfig, taxRate: Number(e.target.value) || 0})}
                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[var(--color-text-primary)]"
                        placeholder="0%"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsCalculatorModalOpen(false)}
                    className="w-full py-3 bg-[var(--color-primary)] hover:brightness-110 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {isMM ? 'အတည်ပြုသည်' : 'Done'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
