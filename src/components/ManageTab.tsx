import React, { useState } from 'react';
import {
  Clock, Plus, Settings, Palette, Bell, Database, Copy,
  Trash2, Edit, Save, X, RotateCcw, Download, Upload, Sliders,
  FolderOpen, Layers, Check, Moon, Sun, Globe, Volume2, ShieldAlert,
  User as UserIcon, LogIn, LogOut, Cloud, ShieldCheck, Sparkles, Smartphone, CheckCircle2, Layout, ExternalLink, Calendar, QrCode,
  Briefcase, GraduationCap, Image, Eye, EyeOff, BellRing, Music, Radio, VolumeX,
  AlertTriangle, CalendarX, CheckSquare, FileText
} from 'lucide-react';
import { TimeSlot, TimetableChart, Preferences, DayCode, Template } from '../types';
import { THEME_PRESETS, PRESET_WALLPAPERS, TEMPLATES, TRANSLATIONS } from '../data/defaultData';
import { sendSystemNotification, requestNotificationPermission } from '../lib/notifications';
import { audioAlert } from '../utils/audioAlert';
import { downloadTimetableIcs } from '../utils/calendarExport';
import { EditSlotModal } from './Modals';

export interface UserAccount {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface ManageTabProps {
  preferences: Preferences;
  slots: TimeSlot[];
  chart: TimetableChart;
  lastSavedTime: string;
  installPrompt: any;
  user?: UserAccount | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onOpenCloudBackup?: () => void;
  onForceCloudBackup?: () => Promise<boolean>;
  onForceCloudRestore?: () => Promise<boolean>;
  isCloudSyncing?: boolean;
  lastCloudSyncTime?: string | null;
  onInstallClick: () => void;
  onSaveSlot: (slot: { id?: number; start: string; end: string; label: string }) => void;
  onDeleteSlot: (id: number) => void;
  onQuickAdjustSlotDuration?: (slotId: number, deltaMinutes: number) => void;
  onShiftAllSlots?: (deltaMinutes: number) => void;
  onDuplicateSlot: (id: number) => void;
  onResetSlots: () => void;
  onOpenBulkAdd: () => void;
  onInsertActivity: (day: DayCode, slotIds: number[], name: string, color: string, category: 'work' | 'personal' | 'relationship') => void;
  onDeleteActivity: (day: DayCode, slotIds: number[]) => void;
  onUpdatePreferences: (newPrefs: Partial<Preferences>) => void;
  onApplyTemplate: (templateKey: string) => void;
  onUndoTemplate: () => void;
  onShowHistory: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenQrCode?: (tab?: 'share' | 'scan') => void;
  onOpenCalendarModal?: () => void;
  onClearData: (type: 'tasks' | 'notes') => void;
  onClearChart?: () => void;
  onResetSystem: () => void;
  onToggleTheme: () => void;
}

export const ManageTab: React.FC<ManageTabProps> = ({
  preferences,
  slots,
  chart,
  lastSavedTime,
  installPrompt,
  user,
  onLogin,
  onLogout,
  onOpenCloudBackup,
  onForceCloudBackup,
  onForceCloudRestore,
  isCloudSyncing,
  lastCloudSyncTime,
  onInstallClick,
  onSaveSlot,
  onDeleteSlot,
  onQuickAdjustSlotDuration,
  onShiftAllSlots,
  onDuplicateSlot,
  onResetSlots,
  onOpenBulkAdd,
  onInsertActivity,
  onDeleteActivity,
  onUpdatePreferences,
  onApplyTemplate,
  onUndoTemplate,
  onShowHistory,
  onExportData,
  onImportData,
  onOpenQrCode,
  onOpenCalendarModal,
  onClearData,
  onClearChart,
  onResetSystem,
  onToggleTheme
}) => {
  const t = TRANSLATIONS[preferences.lang];
  const isMM = preferences.lang === 'my';
  const [activeCategory, setActiveCategory] = useState<'account' | 'lifemode' | 'install' | 'slots' | 'activity' | 'appearance' | 'notifications' | 'data' | 'widgets'>('account');

  const [editSlotModalData, setEditSlotModalData] = useState<{isOpen: boolean, slot: TimeSlot | null}>({ isOpen: false, slot: null });
  const [dangerConfirmModal, setDangerConfirmModal] = useState<'chart' | 'tasks' | 'notes' | 'reset' | null>(null);

  const handleExecuteDangerAction = () => {
    if (!dangerConfirmModal) return;
    audioAlert.triggerVibration('gentle');
    const action = dangerConfirmModal;
    setDangerConfirmModal(null);
    if (action === 'chart' && onClearChart) {
      onClearChart();
    } else if (action === 'tasks') {
      onClearData('tasks');
    } else if (action === 'notes') {
      onClearData('notes');
    } else if (action === 'reset') {
      onResetSystem();
    }
  };

  // Activity Form State
  const [actDay, setActDay] = useState<DayCode>('MON');
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [actName, setActName] = useState('');
  const [actCategory, setActCategory] = useState<'work' | 'personal' | 'relationship'>('work');
  const [actColor, setActColor] = useState('#E8F0FE');

  const sortedSlots = [...slots].sort((a, b) => a.start.localeCompare(b.start));

  // Calendar Sync State
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarSyncSuccess, setCalendarSyncSuccess] = useState(false);
  const [calendarNotice, setCalendarNotice] = useState<string | null>(null);

  const getNextDayOfWeek = (dayName: DayCode) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const target = days.indexOf(dayName);
    const now = new Date();
    const currentDay = now.getDay();
    const diff = (target - currentDay + 7) % 7;
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + diff); 
    return nextDate;
  };

  const handleDirectCalendarExport = () => {
    try {
      setIsSyncingCalendar(true);
      downloadTimetableIcs(chart, slots, {}, preferences, 'OmniFlow Class Timetable');
      setCalendarSyncSuccess(true);
      setCalendarNotice(
        isMM
          ? 'အချိန်ဇယား .ics ပြက္ခဒိန်ဖိုင် ဒေါင်းလုဒ်ပြီးပါပြီ! ဖုန်းတွင် Google Calendar ဖြင့် ဖွင့်၍ "Add all" ကို နှိပ်ပါ (သို့) အောက်ပါ "Google Calendar Web သို့ တင်မည်" ခလုတ်ကို နှိပ်ပါ။'
          : 'Timetable .ics calendar downloaded! Tap the file to add to Google Calendar, or click the Web Import button below.'
      );
      setTimeout(() => setCalendarSyncSuccess(false), 8000);
    } catch (e: any) {
      console.error('Calendar export error:', e);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const handleCheckboxToggle = (id: number) => {
    if (selectedSlots.includes(id)) {
      setSelectedSlots(selectedSlots.filter(s => s !== id));
    } else {
      setSelectedSlots([...selectedSlots, id].sort((a, b) => {
        const slotA = slots.find(s => s.id === a);
        const slotB = slots.find(s => s.id === b);
        return (slotA?.start || '').localeCompare(slotB?.start || '');
      }));
    }
  };

  const handleInsertClick = () => {
    if (selectedSlots.length === 0 || !actName.trim()) return;
    
    // Check for overlaps
    const existingActivities = chart[actDay] || [];
    const overlaps = existingActivities.filter(act => act.slots.some(id => selectedSlots.includes(id)));
    
    onInsertActivity(actDay, selectedSlots, actName.trim(), actColor, actCategory);
  };

  const handleDeleteActClick = () => {
    if (selectedSlots.length === 0) return;
    onDeleteActivity(actDay, selectedSlots);
  };

  const categoryTabs = [
    { id: 'account', label: isMM ? 'အကောင့်နှင့် ခ်ိတ်ဆက်မှု' : 'Account & Sync', icon: UserIcon },
    { id: 'lifemode', label: isMM ? 'ကျောင်းသား / အလုပ်ခွင် စနစ်' : 'Life Mode (Student / Work)', icon: Briefcase },
    { id: 'install', label: isMM ? 'ဖုန်းထဲ App အဖြစ် သွင်းနည်း' : 'Install App / APK', icon: Smartphone },
    { id: 'slots', label: isMM ? 'အချိန်ဇယား ကွက်များ' : 'Time Slots', icon: Clock },
    { id: 'activity', label: isMM ? 'ဘာသာရပ် ထည့်ရန်' : 'Activities', icon: FolderOpen },
    { id: 'appearance', label: isMM ? 'အသွင်အပြင် ဆက်တင်' : 'Appearance', icon: Palette },
    { id: 'notifications', label: isMM ? 'အသိပေးချက်များ' : 'Notifications', icon: Bell },
    { id: 'widgets', label: isMM ? 'ဝစ်ဂျက် (Widget)' : 'Widgets', icon: Layout },
    { id: 'data', label: isMM ? 'ဒေတာ သိမ်းဆည်းရန်' : 'Data & Backup', icon: Database },
  ] as const;

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-300">
      {/* Last Saved Bar */}
      <div className="flex items-center justify-between bg-[var(--color-bg-input)] px-4 py-2.5 rounded-2xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] flex-wrap gap-2 shadow-sm font-mono">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[var(--color-primary)] inline" />
          <span>Last Saved:</span>
          <strong className="text-[var(--color-text-primary)]">{lastSavedTime}</strong>
        </span>
        <span className="text-[var(--color-primary)] font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Synced
        </span>
      </div>

      {/* Main Category Navigation Bar */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-1.5 shadow-sm overflow-x-auto scrollbar-none">
        <div className="flex gap-1 min-w-max">
          {categoryTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-md scale-102'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: GOOGLE ACCOUNT & CLOUD SYNC */}
      {activeCategory === 'account' && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                  {isMM ? 'Google / Gmail အကောင့် ချိတ်ဆက်မှု' : 'Google Account & Cloud Sync'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {isMM ? 'သင့်အချိန်ဇယားများကို Google Account ဖြင့် သိမ်းဆည်းနိုင်ပါသည်' : 'Backup & sync your timetable across devices'}
                </p>
              </div>
            </div>
            {user && (
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isMM ? 'ချိတ်ဆက်ပြီး' : 'Connected'}</span>
              </span>
            )}
          </div>

          {user ? (
            <div className="space-y-3">
              <div className="bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border-2 border-[var(--color-primary)] object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-lg">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-[var(--color-text-primary)]">{user.displayName || 'Google User'}</div>
                    <div className="text-xs font-mono text-[var(--color-text-muted)]">{user.email}</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isMM ? 'Google Account ဖြင့် Firebase Cloud ပေါ်တွင် Auto-Sync လုပ်နေပါသည်' : 'Google Account synced securely in Firebase Cloud'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {onLogin && (
                    <button
                      onClick={onLogin}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      title={isMM ? 'Google အကောင့် ပြောင်းလဲရန်' : 'Switch Google Account'}
                    >
                      <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>{isMM ? 'အကောင့်ပြောင်းမည်' : 'Switch'}</span>
                    </button>
                  )}
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isMM ? 'ထွက်မည်' : 'Sign Out'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cloud Backup & Quick Actions Card */}
              <div className="p-4 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent border border-blue-500/25 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    <span className="font-extrabold text-xs text-[var(--color-text-primary)]">
                      {isMM ? 'Google Cloud Backup & Cross-Device Sync' : 'Google Cloud Backup & Device Sync'}
                    </span>
                  </div>
                  {lastCloudSyncTime && (
                    <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                      {isMM ? `နောက်ဆုံး Backup: ${lastCloudSyncTime}` : `Last Cloud Backup: ${lastCloudSyncTime}`}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {isMM
                    ? `ဖုန်းပြောင်းသုံးပါက ဖုန်းအသစ်တွင် ဤ Gmail (${user.email}) ကို ရိုက်ထည့်လိုက်ရုံဖြင့် အချိန်ဇယား၊ အလုပ်ဆိုင်းများနှင့် Tasks များအားလုံး အလိုအလျောက် ပြန်လည်ရောက်ရှိလာမည် ဖြစ်ပါသည်။`
                    : `All your schedules, work shifts, and tasks are bound to ${user.email}. Sign in on any phone or browser to restore automatically.`}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {onForceCloudBackup && (
                    <button
                      onClick={() => onForceCloudBackup()}
                      disabled={isCloudSyncing}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>{isMM ? '☁️ ယခု Cloud သို့ Backup သိမ်းမည်' : 'Backup to Cloud Now'}</span>
                    </button>
                  )}

                  {onForceCloudRestore && (
                    <button
                      onClick={() => {
                        onForceCloudRestore();
                      }}
                      disabled={isCloudSyncing}
                      className="px-3.5 py-2 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isMM ? '📥 Cloud မှ အချက်အလက်များ ပြန်ယူမည်' : 'Restore from Cloud'}</span>
                    </button>
                  )}

                  {onOpenCloudBackup && (
                    <button
                      onClick={onOpenCloudBackup}
                      className="px-3.5 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isMM ? 'Backup အပြည့်အစုံ စီမံမည်' : 'Manage Backups'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 border border-blue-500/20 rounded-2xl p-5 space-y-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                    {isMM ? 'Google / Gmail Account ဖြင့် တိုက်ရိုက်ချိတ်ဆက်ပါ' : 'Connect your Google / Gmail Account'}
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                    {isMM
                      ? 'Google အကောင့်ဖြင့် ချိတ်ဆက်ထားပါက သင့်အချိန်ဇယားများနှင့် မှတ်စုများကို ဖုန်း/ကွန်ပျူတာ မည်သည့်စက်ပစ္စည်းမှမဆို အလွယ်တကူ အလိုအလျောက် ရယူနိုင်ပါသည်'
                      : 'Sync your timetable, classes, and tasks securely to your Google Account across all devices.'}
                  </p>
                </div>
              </div>

              {onLogin && (
                <button
                  onClick={onLogin}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 mx-auto sm:mx-0"
                >
                  <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isMM ? 'Google Account ဖြင့် ချိတ်ဆက်မည်' : 'Connect Google Account'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION: LIFE MODE (STUDENT VS WORKPLACE) */}
      {activeCategory === 'lifemode' && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] pb-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                {isMM ? 'ကျောင်းသားဘဝ ↔ လုပ်ငန်းခွင်ဘဝ ပြောင်းလဲအသုံးပြုခြင်း' : 'Life Stage Mode (Student vs. Workplace)'}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                {isMM
                  ? 'ကျောင်းတက်နေချိန်တွင် အတန်းချိန်ဇယား၊ ကျောင်းပြီး၍ အလုပ်ခွင်ဝင်ချိန်တွင် Shift & Roster ဇယားအဖြစ် လိုသလို ပြောင်းသုံးနိုင်ပါသည်'
                  : 'Seamlessly transition from University class timetables to professional workplace shift management.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Mode Card */}
            <div
              onClick={() => onUpdatePreferences({ lifeMode: 'student' })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                preferences.lifeMode !== 'workplace'
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-input)] hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-sm text-[var(--color-text-primary)]">
                  <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span>{isMM ? '🎓 ကျောင်းသားဘဝ ပုံစံ (Student Mode)' : '🎓 University / Student Mode'}</span>
                </div>
                {preferences.lifeMode !== 'workplace' && (
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                    {isMM ? 'လက်ရှိသုံးနေသည်' : 'Active'}
                  </span>
                )}
              </div>
              <ul className="text-xs text-[var(--color-text-secondary)] space-y-1 pl-1 list-disc list-inside leading-relaxed">
                <li>{isMM ? 'တက္ကသိုလ် အတန်းချိန်ဇယား (Lecture & Lab Slots)' : 'Weekly Periods & Lecture timetable'}</li>
                <li>{isMM ? 'ဘာသာရပ်အလိုက် အချိန်ဇယားကွက်များ' : 'Subject activities & color coding'}</li>
                <li>{isMM ? 'Assignment, Exam Deadlines နှင့် GPA စာရင်း' : 'Exams, assignments countdown & GPA'}</li>
              </ul>
            </div>

            {/* Workplace Mode Card */}
            <div
              onClick={() => onUpdatePreferences({ lifeMode: 'workplace' })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                preferences.lifeMode === 'workplace'
                  ? 'border-blue-500 bg-blue-500/10 shadow-md ring-2 ring-blue-500/20'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-input)] hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-sm text-[var(--color-text-primary)]">
                  <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span>{isMM ? '💼 လုပ်ငန်းခွင်ဘဝ ပုံစံ (Workplace Mode)' : '💼 Professional Workplace Mode'}</span>
                </div>
                {preferences.lifeMode === 'workplace' && (
                  <span className="text-[10px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                    {isMM ? 'လက်ရှိသုံးနေသည်' : 'Active'}
                  </span>
                )}
              </div>
              <ul className="text-xs text-[var(--color-text-secondary)] space-y-1 pl-1 list-disc list-inside leading-relaxed">
                <li>{isMM ? 'လအလိုက် အလုပ်ဆင်းချိန် ဇယား (Monthly Shift Calendar)' : 'Interactive Monthly Shift & Roster grid'}</li>
                <li>{isMM ? 'Morning, Evening, Night Shifts, WFH နှင့် Day Off' : 'Day / Night shifts, WFH & Day off'}</li>
                <li>{isMM ? 'လစဉ် အလုပ်ချိန်ပေါင်း၊ OT နှင့် လစာ/လုပ်ခ တွက်ချက်မှု' : 'Monthly work hours, OT & earnings report'}</li>
                <li>{isMM ? 'Office Meetings, Standups နှင့် Sprint Plan များ' : 'Standup meetings & Zoom/Meet link launcher'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: INSTALL APP / APK */}
      {activeCategory === 'install' && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                  {isMM ? 'ဖုန်းထဲတွင် Native App ကဲ့သို့ ထည့်သွင်းအသုံးပြုနည်း' : 'Install Standalone Mobile App'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {isMM ? 'Browser မလိုဘဲ ဖုန်း Screen ပေါ်တွင် App အဖြစ် တိုက်ရိုက် အသုံးပြုနိုင်ပါသည်' : 'Run full screen on Android, iOS, or PC with offline capabilities'}
                </p>
              </div>
            </div>
            <button
              onClick={onInstallClick}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isMM ? 'Install စတင်မည်' : 'Install App'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Android Guide Card */}
            <div className="p-4 bg-[var(--color-bg-input)] rounded-2xl border border-[var(--color-border)] space-y-2">
              <div className="font-extrabold text-sm text-[var(--color-text-primary)] flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Smartphone className="w-4 h-4" />
                <span>{isMM ? 'Android ဖုန်းတွင် သွင်းနည်း' : 'Android Setup'}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[var(--color-text-secondary)] leading-relaxed">
                <li>{isMM ? 'Chrome Browser ညာဘက်အပေါ်ရှိ (⋮) ကို နှိပ်ပါ' : 'Open Chrome and tap 3 dots (⋮)'}</li>
                <li>{isMM ? '"Install app" သို့မဟုတ် "ပင်မစာမျက်နှာသို့ ထည့်သွင်းမည်" ကို နှိပ်ပါ' : 'Select "Install app" or "Add to Home screen"'}</li>
                <li>{isMM ? '"Install" ကို နှိပ်ပြီးပါက ဖုန်း Home Screen ပေါ်တွင် App icon ပေါ်လာပါပြီ' : 'Tap Install. OmniFlow icon appears on home screen!'}</li>
              </ol>
            </div>

            {/* iOS Guide Card */}
            <div className="p-4 bg-[var(--color-bg-input)] rounded-2xl border border-[var(--color-border)] space-y-2">
              <div className="font-extrabold text-sm text-[var(--color-text-primary)] flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Layout className="w-4 h-4" />
                <span>{isMM ? 'iPhone / iPad (Safari) တွင် သွင်းနည်း' : 'iPhone / iPad Setup'}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[var(--color-text-secondary)] leading-relaxed">
                <li>{isMM ? 'Safari အောက်ခြေရှိ Share ခလုတ် (📤) ကို နှိပ်ပါ' : 'Tap Share (📤) in Safari bottom bar'}</li>
                <li>{isMM ? 'အောက်ဆွဲချပြီး "Add to Home Screen (➕)" ကို ရွေးပါ' : 'Select "Add to Home Screen"'}</li>
                <li>{isMM ? 'ညာဘက်အပေါ်ရှိ "Add" ကို နှိပ်ပါ' : 'Tap "Add" in top right corner'}</li>
              </ol>
            </div>
          </div>

          {/* Real APK Export Box */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>{isMM ? 'တကယ့် Android .APK ဖိုင်အဖြစ် ပြောင်းလဲထုတ်ယူခြင်း (Play Store / Direct APK)' : 'Generate Real Android .APK Package'}</span>
              </div>
              <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">Easy 1-Min</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {isMM
                ? 'PWABuilder (pwabuilder.com) ကို အသုံးပြုပြီး လက်ရှိ App ကို Play Store တင်နိုင်သော .apk / .aab ဖိုင်အဖြစ် ကုဒ်ရေးရန်မလိုဘဲ ၁ မိနစ်အတွင်း အခမဲ့ ထုတ်ယူနိုင်ပါသည်။'
                : 'Use PWABuilder (pwabuilder.com) to convert this app into a signed .apk / .aab package for direct install or Google Play Store!'}
            </p>
            <div className="pt-1 flex gap-2">
              <a
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                <span>PWABuilder သို့ သွားမည်</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: TIME SLOTS MANAGEMENT */}
      {activeCategory === 'slots' && (
        <div className="space-y-4">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="font-bold text-base text-[var(--color-primary)] flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                <span>{t.titleManageSlots}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setEditSlotModalData({ isOpen: true, slot: null })}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5" /> {isMM ? 'အချိန်ကွက် အသစ်ထည့်မည်' : 'Add Time Slot'}
                </button>
                <button onClick={onOpenBulkAdd} className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm">
                  <Layers className="w-3.5 h-3.5" /> {isMM ? 'အမြောက်အမြား ဖန်တီးမည်' : 'Bulk Add'}
                </button>
                <button onClick={onResetSlots} className="px-3 py-1.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] text-red-600 rounded-xl text-xs font-semibold cursor-pointer hover:bg-red-500/10 transition-all flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" /> {isMM ? 'Reset ချမည်' : 'Reset All'}
                </button>
              </div>
            </div>

            {/* Batch Time Shifter Toolbar */}
            {onShiftAllSlots && sortedSlots.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isMM ? 'အချိန်ဇယား အားလုံးကို ရှေ့/နောက် ရွှေ့မည် (Shift All Time Slots)' : 'Batch Shift All Time Slots'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    {isMM ? `${sortedSlots.length} ခုလုံးကို တစ်ပြိုင်နက် ရွှေ့မည်` : `Applies to all ${sortedSlots.length} slots`}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onShiftAllSlots(-60)}
                    className="py-1.5 px-2 bg-[var(--color-bg-card)] hover:bg-blue-600 hover:text-white border border-[var(--color-border)] rounded-lg text-xs font-bold font-mono text-[var(--color-text-primary)] transition-all cursor-pointer text-center"
                    title={isMM ? 'အချိန်အားလုံး ၁ နာရီ စောရွှေ့မည်' : 'Shift all 1h earlier'}
                  >
                    ⏪ -1h {isMM ? 'စော' : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => onShiftAllSlots(-30)}
                    className="py-1.5 px-2 bg-[var(--color-bg-card)] hover:bg-blue-600 hover:text-white border border-[var(--color-border)] rounded-lg text-xs font-bold font-mono text-[var(--color-text-primary)] transition-all cursor-pointer text-center"
                    title={isMM ? 'အချိန်အားလုံး မိနစ် ၃၀ စောရွှေ့မည်' : 'Shift all 30m earlier'}
                  >
                    ◀️ -30m {isMM ? 'စော' : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => onShiftAllSlots(-15)}
                    className="py-1.5 px-2 bg-[var(--color-bg-card)] hover:bg-blue-600 hover:text-white border border-[var(--color-border)] rounded-lg text-xs font-bold font-mono text-[var(--color-text-primary)] transition-all cursor-pointer text-center"
                    title={isMM ? 'အချိန်အားလုံး ၁၅ မိနစ် စောရွှေ့မည်' : 'Shift all 15m earlier'}
                  >
                    ◀️ -15m {isMM ? 'စော' : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => onShiftAllSlots(15)}
                    className="py-1.5 px-2 bg-[var(--color-bg-card)] hover:bg-blue-600 hover:text-white border border-[var(--color-border)] rounded-lg text-xs font-bold font-mono text-[var(--color-text-primary)] transition-all cursor-pointer text-center"
                    title={isMM ? 'အချိန်အားလုံး ၁၅ မိနစ် နောက်ရွှေ့မည်' : 'Shift all 15m later'}
                  >
                    +15m {isMM ? 'နောက်' : ''} ▶️
                  </button>
                  <button
                    type="button"
                    onClick={() => onShiftAllSlots(30)}
                    className="py-1.5 px-2 bg-[var(--color-bg-card)] hover:bg-blue-600 hover:text-white border border-[var(--color-border)] rounded-lg text-xs font-bold font-mono text-[var(--color-text-primary)] transition-all cursor-pointer text-center"
                    title={isMM ? 'အချိန်အားလုံး မိနစ် ၃၀ နောက်ရွှေ့မည်' : 'Shift all 30m later'}
                  >
                    +30m {isMM ? 'နောက်' : ''} ▶️
                  </button>
                  <button
                    type="button"
                    onClick={() => onShiftAllSlots(60)}
                    className="py-1.5 px-2 bg-[var(--color-bg-card)] hover:bg-blue-600 hover:text-white border border-[var(--color-border)] rounded-lg text-xs font-bold font-mono text-[var(--color-text-primary)] transition-all cursor-pointer text-center"
                    title={isMM ? 'အချိန်အားလုံး ၁ နာရီ နောက်ရွှေ့မည်' : 'Shift all 1h later'}
                  >
                    +1h {isMM ? 'နောက်' : ''} ⏩
                  </button>
                </div>
              </div>
            )}

            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                {sortedSlots.map(s => {
                  const [sh, sm] = s.start.split(':').map(Number);
                  const [eh, em] = s.end.split(':').map(Number);
                  const durationMins = (eh * 60 + em) - (sh * 60 + sm);
                  const durFormatted = durationMins > 0 
                    ? (durationMins >= 60 
                        ? `${Math.floor(durationMins/60)}h ${durationMins%60 > 0 ? `${durationMins%60}m` : ''}` 
                        : `${durationMins}m`)
                    : '';

                  return (
                    <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[var(--color-bg-input)] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl border border-[var(--color-border)] border-l-4 border-l-blue-500 transition-all group gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          #{s.id}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                            <span>{s.label}</span>
                            {durFormatted && (
                              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                                ⏱️ {durFormatted}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span className="font-bold text-[var(--color-text-secondary)]">{s.start}</span>
                            <span>→</span>
                            <span className="font-bold text-[var(--color-text-secondary)]">{s.end}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Inline Quick Duration Adjusters & Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                        {/* Quick +/- Delta buttons */}
                        {onQuickAdjustSlotDuration && (
                          <div className="flex items-center bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-0.5 gap-0.5">
                            <button
                              type="button"
                              onClick={() => onQuickAdjustSlotDuration(s.id, -10)}
                              className="px-1.5 py-1 text-[11px] font-mono font-bold text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                              title={isMM ? '၁၀ မိနစ် လျော့မည်' : 'Reduce 10 mins'}
                            >
                              -10m
                            </button>
                            <button
                              type="button"
                              onClick={() => onQuickAdjustSlotDuration(s.id, -5)}
                              className="px-1.5 py-1 text-[11px] font-mono font-bold text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                              title={isMM ? '၅ မိနစ် လျော့မည်' : 'Reduce 5 mins'}
                            >
                              -5m
                            </button>
                            <span className="w-px h-3.5 bg-[var(--color-border)] mx-0.5" />
                            <button
                              type="button"
                              onClick={() => onQuickAdjustSlotDuration(s.id, 5)}
                              className="px-1.5 py-1 text-[11px] font-mono font-bold text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-colors cursor-pointer"
                              title={isMM ? '၅ မိနစ် တိုးမည်' : 'Add 5 mins'}
                            >
                              +5m
                            </button>
                            <button
                              type="button"
                              onClick={() => onQuickAdjustSlotDuration(s.id, 10)}
                              className="px-1.5 py-1 text-[11px] font-mono font-bold text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-colors cursor-pointer"
                              title={isMM ? '၁၀ မိနစ် တိုးမည်' : 'Add 10 mins'}
                            >
                              +10m
                            </button>
                          </div>
                        )}

                        <button 
                          onClick={() => setEditSlotModalData({ isOpen: true, slot: s })} 
                          className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-lg flex items-center justify-center cursor-pointer transition-all gap-1 text-xs font-bold"
                          title={isMM ? 'အချိန် ပြင်ဆင်မည်' : 'Edit Slot'}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isMM ? 'ပြင်မည်' : 'Edit'}</span>
                        </button>
                        <button 
                          onClick={() => onDuplicateSlot(s.id)} 
                          className="p-1.5 bg-[var(--color-bg-card)] hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg flex items-center justify-center cursor-pointer transition-all"
                          title={isMM ? 'ပွားမည်' : 'Duplicate Slot'}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            audioAlert.triggerVibration('gentle');
                            onDeleteSlot(s.id);
                          }} 
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 active:bg-red-600 active:text-white text-red-600 rounded-lg flex items-center justify-center cursor-pointer transition-all active:scale-95 touch-manipulation"
                          title={isMM ? 'အချိန်ကွက် ဖျက်မည်' : 'Delete Slot'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {sortedSlots.length === 0 && (
                  <div className="text-center p-6 text-[var(--color-text-muted)] text-sm border-2 border-dashed border-[var(--color-border)] rounded-xl">
                    {isMM ? 'အချိန်ဇယားများ မရှိသေးပါ။ အသစ်ထည့်သွင်းပါ။' : 'No time slots yet. Add a new one.'}
                  </div>
                )}
              </div>
            </div>
            
            <EditSlotModal
              isOpen={editSlotModalData.isOpen}
              onClose={() => setEditSlotModalData({ isOpen: false, slot: null })}
              slot={editSlotModalData.slot}
              allSlots={slots}
              onSave={onSaveSlot}
              onDelete={onDeleteSlot}
              lang={preferences.lang}
            />
          </div>
        </div>
      )}

      {/* SECTION 3: SUBJECT & ACTIVITY FORM */}
      {activeCategory === 'activity' && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
          <div className="font-bold text-base text-[var(--color-primary)] mb-3 flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            <span>{t.titleCustomActivity}</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">Day</label>
              <select value={actDay} onChange={e => setActDay(e.target.value as DayCode)} className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-sm">
                <option value="MON">Monday</option>
                <option value="TUE">Tuesday</option>
                <option value="WED">Wednesday</option>
                <option value="THU">Thursday</option>
                <option value="FRI">Friday</option>
                <option value="SAT">Saturday</option>
                <option value="SUN">Sunday</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">Select Slots</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-[var(--color-bg-input)] p-2.5 rounded-xl border border-[var(--color-border)] max-h-36 overflow-y-auto">
                {sortedSlots.map(s => (
                  <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer p-1 rounded hover:bg-[var(--color-primary)] hover:text-white transition-all">
                    <input
                      type="checkbox"
                      checked={selectedSlots.includes(s.id)}
                      onChange={() => handleCheckboxToggle(s.id)}
                      className="accent-[var(--color-primary)]"
                    />
                    <span>Slot {s.id} ({s.label})</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">Subject / Activity</label>
              <input type="text" value={actName} onChange={e => setActName(e.target.value)} placeholder={t.subjectPlaceholder} className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">Category</label>
                <select value={actCategory} onChange={e => setActCategory(e.target.value as any)} className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-sm">
                  <option value="work">{t.optStudyRepair}</option>
                  <option value="personal">{t.optPersonalCode}</option>
                  <option value="relationship">{t.optMayTime}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">Background Color</label>
                <input type="color" value={actColor} onChange={e => setActColor(e.target.value)} className="w-full h-10 p-1 rounded-xl border border-[var(--color-border)] bg-transparent cursor-pointer" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleInsertClick} className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-[var(--color-primary-dark)] transition-all flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Insert
              </button>
              <button onClick={handleDeleteActClick} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-red-700 transition-all flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: APPEARANCE & CUSTOMIZATION */}
      {activeCategory === 'appearance' && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-5">
          <div className="font-extrabold text-base text-[var(--color-primary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
            <Palette className="w-5 h-5" />
            <span>{isMM ? 'အသွင်အပြင်၊ Theme နှင့် အိမ်မက် Wallpaper ဆက်တင်များ' : 'Appearance, Themes & Custom Wallpapers'}</span>
          </div>

          {/* 1. Language */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <Globe className="w-4.5 h-4.5 text-[var(--color-primary)]" />
              <div>
                <div className="text-sm font-bold text-[var(--color-text-primary)]">{isMM ? 'ဘာသာစကား' : 'Language'}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{isMM ? 'အသုံးပြုလိုသော ဘာသာစကား ရွေးပါ' : 'Choose preferred app language'}</div>
              </div>
            </div>
            <select
              value={preferences.lang}
              onChange={e => onUpdatePreferences({ lang: e.target.value as 'my' | 'en' })}
              className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-xs font-bold text-[var(--color-text-primary)]"
            >
              <option value="my">🇲🇲 မြန်မာ</option>
              <option value="en">🇺🇸 English</option>
            </select>
          </div>

          {/* 2. Theme Presets */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <Palette className="w-4.5 h-4.5 text-[var(--color-primary)]" />
              <div>
                <div className="text-sm font-bold text-[var(--color-text-primary)]">{isMM ? 'Theme အရောင်ပုံစံများ (Theme Presets)' : 'Theme Presets'}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{isMM ? 'စာဖတ်ရလွယ်ကူသော စိတ်ကြိုက် Theme ကို ရွေးပါ' : 'Select color theme with high legibility'}</div>
              </div>
            </div>
            <select
              value={preferences.themePreset}
              onChange={e => onUpdatePreferences({ themePreset: e.target.value })}
              className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-xs font-bold text-[var(--color-text-primary)]"
            >
              <option value="default">🟢 Default Emerald</option>
              <option value="dark">🌙 Dark Slate Mode</option>
              <option value="oled_pure_black">🖤 OLED Pure Black</option>
              <option value="midnight_navy">🌌 Midnight Navy</option>
              <option value="cyber_neon">✨ Cyber Neon</option>
              <option value="high_contrast_light">☀️ Ultra High Contrast (Light)</option>
              <option value="high_contrast_dark">🖤 Ultra High Contrast (OLED Dark)</option>
              <option value="ocean">🌊 Deep Ocean</option>
              <option value="forest">🌲 Forest Green</option>
              <option value="sunset">🌅 Sunset Crimson</option>
              <option value="lavender">🌸 Royal Lavender</option>
            </select>
          </div>

          {/* 3. Ultra High Contrast Text Toggle */}
          <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)] bg-[var(--color-primary)]/5 p-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4.5 h-4.5 text-[var(--color-primary)] shrink-0" />
              <div>
                <div className="text-sm font-extrabold text-[var(--color-text-primary)]">
                  {isMM ? 'စာလုံးအရောင် တောက်ပမှုနှင့် စာဖတ်ရလွယ်ကူမှု အထူးစနစ် (Ultra Crisp Text Mode)' : 'Ultra Crisp Text Legibility Mode'}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {isMM ? 'Theme မည်မျှပင် ပြောင်းပါစေ စာသားများကို အထူးတောက်ပ ထင်ရှားစေပြီး မျက်စိမညောင်းဘဲ ဖတ်ရလွယ်ကူစေပါသည်' : 'Ensures maximum text legibility & crisp contrast across all theme backgrounds'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={!!preferences.highContrastText}
              onChange={e => onUpdatePreferences({ highContrastText: e.target.checked })}
              className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer rounded-lg shrink-0"
            />
          </div>

          {/* 4. Accent Color & Font Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[var(--color-text-primary)]">{isMM ? 'အဓိက ပေါ်လွင်ရောင် (Accent Color)' : 'Accent Color'}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{isMM ? 'ခလုတ်နှင့် အိုင်ကွန်အရောင်' : 'Button and icon accent'}</div>
              </div>
              <input
                type="color"
                value={preferences.accentColor}
                onChange={e => onUpdatePreferences({ accentColor: e.target.value })}
                className="w-10 h-10 p-1 rounded-xl border border-[var(--color-border)] bg-transparent cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[var(--color-text-primary)]">{isMM ? 'ဖောင့်အရွယ်အစား' : 'Font Size'}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{isMM ? 'စာသားများ၏ အရွယ်အစား' : 'Adjust text size'}</div>
              </div>
              <select
                value={preferences.fontSize || 16}
                onChange={e => onUpdatePreferences({ fontSize: Number(e.target.value) })}
                className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-xs font-bold text-[var(--color-text-primary)]"
              >
                <option value="12">{isMM ? 'အလွန်သေး (12px)' : 'Very Small (12px)'}</option>
                <option value="14">{isMM ? 'သေး (14px)' : 'Small (14px)'}</option>
                <option value="16">{isMM ? 'ပုံမှန် (16px)' : 'Normal (16px)'}</option>
                <option value="18">{isMM ? 'ကြီး (18px)' : 'Large (18px)'}</option>
                <option value="20">{isMM ? 'အလွန်ကြီး (20px)' : 'Extra Large (20px)'}</option>
                <option value="22">{isMM ? 'အကြီးဆုံး (22px)' : 'Huge (22px)'}</option>
              </select>
            </div>
          </div>

          {/* 5. PREMIUM BORDER STYLE PRESETS & CUSTOMIZATIONS */}
          <div className="p-4.5 bg-[var(--color-bg-input)]/40 border border-[var(--color-border)] rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
              <div>
                <div className="text-sm font-extrabold text-[var(--color-text-primary)]">
                  {isMM ? '💎 Premium ဘောင်ဒီဇိုင်းနှင့် စိတ်ကြိုက်ပြင်ဆင်မှု (Border Studio)' : '💎 Premium Border Studio'}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {isMM ? 'အက်ပ်၏ ဘောင်အထူ/အပါး၊ မျဉ်းဒီဇိုင်း၊ မီးရောင်နှင့် ရုပ်ထွက်ပုံစံများကို စိတ်ကြိုက်ဖန်တီးပါ' : 'Customize outline thickness, line textures, glow colors, and preset aesthetics'}
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">
                {isMM ? 'ဘောင်ပုံစံ သတ်မှတ်ချက် (Border Presets)' : 'Border Presets'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {[
                  { id: 'ios', name: isMM ? '🍎 iOS Native Glass' : '🍎 iOS Native Glass', desc: isMM ? 'Apple 0.5px Squircle' : '0.5px Retina Squircle' },
                  { id: 'sleek', name: isMM ? '✨ Sleek Hairline' : '✨ Sleek Hairline', desc: isMM ? 'ပါးလွှာသပ်ရပ်သောဘောင်' : 'Fine 1px border' },
                  { id: 'glass', name: isMM ? '💎 Glass Highlight' : '💎 Glass Highlight', desc: isMM ? '3D အလင်းပြန်မှန်ဘောင်' : 'Top sheen light border' },
                  { id: 'soft', name: isMM ? '☁️ Soft Squircle' : '☁️ Soft Squircle', desc: isMM ? 'ပျော့ပျောင်းဝိုင်းစက်သောဘောင်' : 'Rounded 24px organic' },
                  { id: 'sharp', name: isMM ? '📐 Modern Sharp' : '📐 Modern Sharp', desc: isMM ? 'ပြတ်သားတိကျသောဘောင်' : 'Architectural 8px' },
                  { id: 'glow', name: isMM ? '🌌 Ambient Glow' : '🌌 Ambient Glow', desc: isMM ? 'နီယွန်အလင်းဝန်းဘောင်' : 'Interactive primary glow' }
                ].map((styleItem) => {
                  const isSelected = (preferences.borderStyle || 'sleek') === styleItem.id;
                  return (
                    <button
                      key={styleItem.id}
                      onClick={() => onUpdatePreferences({ borderStyle: styleItem.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/30 font-bold scale-[1.02]'
                          : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className="text-xs font-bold text-[var(--color-text-primary)] truncate">{styleItem.name}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)] leading-tight">{styleItem.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Controls: Thickness & Texture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Thickness selector */}
              <div className="p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-2">
                <div className="text-xs font-bold text-[var(--color-text-primary)]">
                  {isMM ? '📏 ဘောင်အထူ/အပါး (Border Thickness)' : '📏 Border Thickness'}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { val: 0.5, label: '0.5px' },
                    { val: 1, label: '1px' },
                    { val: 1.5, label: '1.5px' },
                    { val: 2, label: '2px' },
                    { val: 3, label: '3px' }
                  ].map((item) => {
                    const isCur = (preferences.borderWidth ?? 1) === item.val;
                    return (
                      <button
                        key={item.val}
                        onClick={() => onUpdatePreferences({ borderWidth: item.val })}
                        className={`py-1.5 text-xs font-extrabold rounded-lg border transition-all ${
                          isCur
                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                            : 'bg-[var(--color-bg-input)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Texture style selector */}
              <div className="p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-2">
                <div className="text-xs font-bold text-[var(--color-text-primary)]">
                  {isMM ? '✏️ မျဉ်းဒီဇိုင်းပုံစံ (Line Texture)' : '✏️ Line Texture'}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 'solid', label: isMM ? 'ပြည့်မျဉ်း' : 'Solid' },
                    { val: 'dashed', label: isMM ? 'ပြတ်တောင်း' : 'Dashed' },
                    { val: 'dotted', label: isMM ? 'အစက်' : 'Dotted' },
                    { val: 'double', label: isMM ? 'နှစ်ထပ်' : 'Double' }
                  ].map((item) => {
                    const isCur = (preferences.borderTexture || 'solid') === item.val;
                    return (
                      <button
                        key={item.val}
                        onClick={() => onUpdatePreferences({ borderTexture: item.val as any })}
                        className={`py-1.5 text-xs font-extrabold rounded-lg border transition-all ${
                          isCur
                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                            : 'bg-[var(--color-bg-input)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Glow / Accent Color Customization */}
            <div className="p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[var(--color-text-primary)]">
                  {isMM ? '🔮 Active Glow/Highlight မီးရောင် (Border Glow Color)' : '🔮 Border Glow & Highlight Accent'}
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {isMM ? 'Hover သို့မဟုတ် Active ချိန်တွင် ထွက်ပေါ်မည်' : 'Applies on hover & active card states'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'var(--color-primary)', label: isMM ? 'အက်ပ်အရောင်' : 'Theme Primary', bg: 'bg-[var(--color-primary)]' },
                  { id: '#10b981', label: 'Emerald Green', bg: 'bg-emerald-500' },
                  { id: '#3b82f6', label: 'Royal Blue', bg: 'bg-blue-500' },
                  { id: '#8b5cf6', label: 'Purple Glow', bg: 'bg-purple-500' },
                  { id: '#ec4899', label: 'Neon Pink', bg: 'bg-pink-500' },
                  { id: '#f59e0b', label: 'Amber Gold', bg: 'bg-amber-500' },
                  { id: '#06b6d4', label: 'Cyan Electric', bg: 'bg-cyan-500' }
                ].map((colorItem) => {
                  const isCur = (preferences.borderGlowColor || 'var(--color-primary)') === colorItem.id;
                  return (
                    <button
                      key={colorItem.id}
                      onClick={() => onUpdatePreferences({ borderGlowColor: colorItem.id })}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        isCur
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/30'
                          : 'border-[var(--color-border)] bg-[var(--color-bg-input)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${colorItem.bg} ring-1 ring-black/10`} />
                      <span className="text-[11px] text-[var(--color-text-primary)]">{colorItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)]/20 space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)]">
                {isMM ? '👁️ တိုက်ရိုက် ရလဒ် ကြည့်ရှုရန် (Live Border Preview)' : '👁️ Live Border Preview'}
              </div>
              <div className="p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] transition-all flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm hover:scale-[1.01]">
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-[var(--color-text-primary)]">
                    {isMM ? 'စမ်းသပ်မှု ကတ်ပြား (Sample Preview Card)' : 'Sample Preview Card'}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    {isMM ? 'ရွေးချယ်ထားသော ဘောင်အထူ၊ မျဉ်းဒီဇိုင်းနှင့် မီးရောင်များကို တိုက်ရိုက် ကြည့်ပါ' : 'Hover over this card to see the custom border glow & outline'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={isMM ? 'စမ်းသပ် ရိုက်ကူးရန်...' : 'Type here...'}
                    className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-xs text-[var(--color-text-primary)] w-32 focus:outline-none"
                  />
                  <button className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-primary)] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all">
                    {isMM ? 'ခလုတ်' : 'Button'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5. APP-WIDE CUSTOM WALLPAPER SECTION */}
          <div className="p-4 bg-[var(--color-bg-input)]/50 border border-[var(--color-border)] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[var(--color-text-primary)]">
                    {isMM ? '🖼️ App တစ်ခုလုံးအတွက် နောက်ခံပုံ (App-Wide Wallpaper)' : '🖼️ App-Wide Custom Wallpaper'}
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {isMM ? 'မိမိကြိုက်နှစ်သက်ရာ ဓာတ်ပုံ သို့မဟုတ် Wallpaper ကို App တစ်ခုလုံး၏ နောက်ခံအဖြစ် ထားရှိပါ' : 'Upload your favorite photo or pick an HD wallpaper background for the whole app'}
                  </p>
                </div>
              </div>

              {preferences.customWallpaper && (
                <button
                  onClick={() => onUpdatePreferences({ customWallpaper: '' })}
                  className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isMM ? 'ပုံဖျက်မည်' : 'Remove'}</span>
                </button>
              )}
            </div>

            {/* Custom File Upload Input */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="px-4 py-2 bg-[var(--color-primary)] hover:brightness-110 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs">
                <Upload className="w-4 h-4" />
                <span>{isMM ? 'ဖုန်းထဲမှ ဓာတ်ပုံရွေးမည် (Upload Photo)' : 'Upload Your Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert(isMM ? 'ဓာတ်ပုံဖိုင်ပမာဏ 5MB ထက် မကြီးရပါခင်ဗျာ။' : 'Image file size must be under 5MB.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result as string;
                        if (result) {
                          onUpdatePreferences({ customWallpaper: result });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              <span className="text-xs text-[var(--color-text-muted)]">
                {isMM ? '(သို့မဟုတ် အောက်ပါ HD Preset အရုပ်ပုံများမှ ရွေးပါ)' : '(Or choose from HD Presets below)'}
              </span>
            </div>

            {/* Preset Wallpaper Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {PRESET_WALLPAPERS.map((wp) => {
                const isSelected = preferences.customWallpaper === wp.url;
                return (
                  <button
                    key={wp.id}
                    onClick={() => onUpdatePreferences({ customWallpaper: wp.url })}
                    className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group text-left ${
                      isSelected ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30 scale-[1.02]' : 'border-transparent hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 flex items-end justify-between">
                      <span className="text-[11px] font-bold text-white drop-shadow-sm truncate">{wp.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-[var(--color-primary)] bg-white rounded-full p-0.5 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Controls for Dim & Blur if Wallpaper Active */}
            {preferences.customWallpaper && (
              <div className="pt-2 border-t border-[var(--color-border)] space-y-3 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dimming Level */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[var(--color-text-primary)] mb-1">
                      <span>{isMM ? 'နောက်ခံပုံ မှောင်မှုအဆင့် (Dim Overlay)' : 'Background Dim Level'}</span>
                      <span className="text-[var(--color-primary)]">{preferences.wallpaperDim ?? 40}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="5"
                      value={preferences.wallpaperDim ?? 40}
                      onChange={e => onUpdatePreferences({ wallpaperDim: Number(e.target.value) })}
                      className="w-full accent-[var(--color-primary)] cursor-pointer"
                    />
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                      {isMM ? 'စာဖတ်ရ ပိုမိုလွယ်ကူစေရန် နောက်ခံကို မှောင်ပေးသည်' : 'Darkens background to maximize text legibility'}
                    </p>
                  </div>

                  {/* Blur Level */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[var(--color-text-primary)] mb-1">
                      <span>{isMM ? 'နောက်ခံပုံ ဝေဝါးမှုအဆင့် (Blur Level)' : 'Background Blur'}</span>
                      <span className="text-[var(--color-primary)]">{preferences.wallpaperBlur ?? 4}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={preferences.wallpaperBlur ?? 4}
                      onChange={e => onUpdatePreferences({ wallpaperBlur: Number(e.target.value) })}
                      className="w-full accent-[var(--color-primary)] cursor-pointer"
                    />
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                      {isMM ? 'နောက်ခံကို အနည်းငယ် ဝါးပေးခြင်းဖြင့် စာသားများကို ကြည်လင်စေသည်' : 'Smooth depth blur for extra contrast'}
                    </p>
                  </div>
                </div>

                {/* Glassmorphism Frosted Cards Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[var(--color-primary)]" />
                    <div>
                      <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                        {isMM ? 'မှန်ကြည့်မှန်ကြည်ကတ်များ (Frosted Glass Cards Effect)' : 'Frosted Glass Cards'}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {isMM ? 'ကတ်များ နောက်ကွယ်တွင် Wallpaper ကို ခပ်ရေးရေး မြင်တွေ့ရမည်' : 'Translucent cards over custom wallpaper'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!preferences.cardGlassmorphism}
                    onChange={e => onUpdatePreferences({ cardGlassmorphism: e.target.checked })}
                    className="w-4.5 h-4.5 accent-[var(--color-primary)] cursor-pointer rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: NOTIFICATIONS */}
      {activeCategory === 'notifications' && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[var(--color-text-primary)]">
                  {isMM ? 'သတိပေးချက်နှင့် အသံစနစ်များ (Notification & Alarm Hub)' : 'Notification & Alarm Hub'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {isMM ? 'ကြိုတင်သတိပေးချိန်၊ ဖုန်း Alarm၊ အသံ Preset နှင့် တုန်ခါမှုစနစ်များကို စိတ်ကြိုက်ပြင်ဆင်ပါ' : 'Configure lead times, native phone alarms, sound chimes & haptic vibration'}
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                await requestNotificationPermission();
                sendSystemNotification(
                  isMM ? '🔔 သတိပေးချက် စမ်းသပ်မှု' : '🔔 Notification Test',
                  isMM ? 'OmniFlow သတိပေးစနစ် ပုံမှန် အလုပ်လုပ်နေပါပြီခင်ဗျာ။' : 'OmniFlow notification engine is working perfectly!',
                  { sound: true }
                );
                if (preferences.soundAlerts) {
                  audioAlert.playSound(preferences.soundType || 'gentle_chime', preferences.soundVolume || 80);
                }
                if (preferences.vibrationAlerts !== false) {
                  audioAlert.triggerVibration(preferences.vibrationPattern || 'gentle');
                }
              }}
              className="px-3.5 py-2 bg-[var(--color-primary)] hover:brightness-110 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all shrink-0"
              title={isMM ? 'စနစ်၏ အသိပေးချက် အလုပ်လုပ်ပုံကို စမ်းသပ်မည်' : 'Send Test Notification'}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isMM ? 'သတိပေးချက် စမ်းသပ်မည်' : 'Test Alert'}</span>
            </button>
          </div>

          {/* Core Notification Controls */}
          <div className="space-y-3">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <BellRing className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-primary)]">
                    {isMM ? 'အသိပေးချက်စနစ် ဖွင့်မည် (Master Push Notifications)' : 'Enable Master Push Notifications'}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {isMM ? 'လာမည့် အတန်းချိန်များနှင့် အလုပ်ချိန်များအတွက် အသိပေးချက် ရယူမည်' : 'Get push reminders for upcoming classes & shifts'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={e => {
                  const checked = e.target.checked;
                  onUpdatePreferences({ notifications: checked });
                  if (checked) {
                    requestNotificationPermission();
                  }
                }}
                className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer rounded-lg"
              />
            </div>

            {/* Custom Notification Offset (Lead Time) */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <Clock className="w-4.5 h-4.5 text-blue-500" />
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-primary)]">
                    {isMM ? 'ကြိုတင်သတိပေးချိန် (In-App Lead Time)' : 'In-App Reminder Lead Time'}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {isMM ? 'အတန်း မစမီ မည်မျှအလိုတွင် browser/app သတိပေးချက် ပို့ပေးရမည်နည်း' : 'How early to send notification before class start'}
                  </div>
                </div>
              </div>
              <select
                value={preferences.reminderTime}
                onChange={e => onUpdatePreferences({ reminderTime: parseInt(e.target.value) || 10 })}
                className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none cursor-pointer"
              >
                <option value="0">{isMM ? 'အတန်းစချိန် အတိအကျ (0 min)' : 'Right on time (0 mins)'}</option>
                <option value="5">{isMM ? '၅ မိနစ် ကြိုတင် (5 mins before)' : '5 minutes before'}</option>
                <option value="10">{isMM ? '၁၀ မိနစ် ကြိုတင် (10 mins before)' : '10 minutes before'}</option>
                <option value="15">{isMM ? '၁၅ မိနစ် ကြိုတင် (15 mins before)' : '15 minutes before'}</option>
                <option value="20">{isMM ? 'မိနစ် ၂၀ ကြိုတင် (20 mins before)' : '20 minutes before'}</option>
                <option value="30">{isMM ? 'မိနစ် ၃၀ ကြိုတင် (30 mins before)' : '30 minutes before'}</option>
                <option value="45">{isMM ? '၄၅ မိနစ် ကြိုတင် (45 mins before)' : '45 minutes before'}</option>
                <option value="60">{isMM ? '၁ နာရီ ကြိုတင် (1 hour before)' : '1 hour before'}</option>
                <option value="120">{isMM ? '၂ နာရီ ကြိုတင် (2 hours before)' : '2 hours before'}</option>
              </select>
            </div>

            {/* Smart Silent / Do Not Disturb Mode (Feature 3) */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <span className="text-xl">📴</span>
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-primary)]">
                    {isMM ? 'အတန်းချိန် အလိုအလျောက် တိတ်ဆိတ်မုဒ် (Smart Auto-Silent / DND)' : 'Smart Auto-Silent / DND during Classes'}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {isMM ? 'သင်တန်းချိန်/အတန်းချိန်ရောက်လျှင် ဖုန်းကို အလိုအလျောက် Vibrate/Silent သို့ ပြောင်းပေးမည်' : 'Automatically sets phone to silent/vibrate during scheduled classes'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={!!preferences.autoSilentMode}
                onChange={e => onUpdatePreferences({ autoSilentMode: e.target.checked })}
                className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer rounded-lg"
              />
            </div>
          </div>

          {/* SECTION 4: Native Phone Alarms */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/25 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[var(--color-text-primary)] flex items-center gap-2">
                    <span>{isMM ? 'ဖုန်း Alarm ပြက္ခဒိန်ဖိုင် ထုတ်ယူခြင်း (.ics)' : 'Native Phone Alarm & Calendar Export (.ics)'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                      RFC-5545 VALARM
                    </span>
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {isMM ? 'အင်တာနက်မရှိချိန်တွင်ပါ ဖုန်း Alarm အလိုအလျောက် မြည်ပေးမည့် ပြက္ခဒိန်ဖိုင် (.ics) ထုတ်ယူရန်စနစ်' : 'Rings native device alarms even when offline using standard .ics calendar file'}
                  </div>
                </div>
              </div>
            </div>

            {/* Native Alarm Lead Time Options */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-[var(--color-text-primary)] flex items-center justify-between">
                <span>{isMM ? 'ဖုန်း Alarm မြည်မည့် ကြိုတင်အချိန်:' : 'Phone Alarm Ring Lead Time:'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {(preferences.calendarAlarmLeadTime !== undefined ? preferences.calendarAlarmLeadTime : 10) === 0
                    ? (isMM ? 'အတန်းစချိန် အတိအကျ' : '0m (On Time)')
                    : `${preferences.calendarAlarmLeadTime !== undefined ? preferences.calendarAlarmLeadTime : 10} mins before`}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {[0, 5, 10, 15, 20, 30, 45, 60].map(mins => {
                  const currentAlarmLead = preferences.calendarAlarmLeadTime !== undefined ? preferences.calendarAlarmLeadTime : 10;
                  const isSelected = currentAlarmLead === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => onUpdatePreferences({ calendarAlarmLeadTime: mins })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-emerald-400'
                      }`}
                    >
                      {mins === 0 ? (isMM ? 'အတန်းစချိန်' : '0m') : `${mins}m`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Download Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => downloadTimetableIcs(chart, slots, {}, preferences)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isMM ? 'ဖုန်း Alarm အချက်ပေး (.ics) ဖိုင် ဒေါင်းလုဒ်ဆွဲမည်' : 'Download Calendar (.ics) with Embedded Alarms'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 5: Sound Presets & Audio Synthesizer */}
          <div className="p-4 rounded-2xl bg-[var(--color-bg-input)] border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Volume2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[var(--color-text-primary)]">
                    {isMM ? 'အသံစနစ် ရွေးချယ်မှု (Sound Chimes & Synthesizer)' : 'Sound Chimes & Synthesizer'}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {isMM ? 'သတိပေးချက်အတွက် နှစ်သက်ရာ အသံအမျိုးအစားနှင့် အသံအတိုးအကျယ် ရွေးချယ်ပါ' : 'Select audio synthesizer chime preset and adjust volume'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.soundAlerts}
                onChange={e => onUpdatePreferences({ soundAlerts: e.target.checked })}
                className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer rounded-lg"
              />
            </div>

            {preferences.soundAlerts && (
              <>
                {/* Volume Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-indigo-500" />
                      {isMM ? 'အသံ အတိုး/အကျယ် (Sound Volume):' : 'Sound Volume:'}
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {preferences.soundVolume !== undefined ? preferences.soundVolume : 80}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VolumeX className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={preferences.soundVolume !== undefined ? preferences.soundVolume : 80}
                      onChange={e => onUpdatePreferences({ soundVolume: parseInt(e.target.value) || 80 })}
                      className="flex-1 accent-indigo-600 h-2 bg-[var(--color-bg-card)] rounded-lg cursor-pointer"
                    />
                    <Volume2 className="w-4 h-4 text-indigo-500" />
                  </div>
                </div>

                {/* Sound Presets Grid */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">
                    {isMM ? 'နှစ်သက်ရာ အသံ Preset ကို ရွေးချယ်ပါ:' : 'Select Sound Preset:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {[
                      { id: 'gentle_chime', icon: '🔔', nameMM: 'သာယာသော ခေါင်းလောင်းသံ', nameEN: 'Gentle Chime', desc: 'Harmonic E5 & B5 chord' },
                      { id: 'zen_bell', icon: '🧘', nameMM: 'ဇင် ဘုရားကျောင်း ခေါင်းလောင်းသံ', nameEN: 'Zen Tibetan Bell', desc: 'Deep warm resonant overtone' },
                      { id: 'crystal_drop', icon: '💧', nameMM: 'ကြည်လင်သော ရေစက်သံ', nameEN: 'Crystal Drop', desc: 'Pure crystal drop sweep' },
                      { id: 'digital_beep', icon: '📟', nameMM: 'ဒစ်ဂျစ်တယ် အချက်ပြသံ', nameEN: 'Digital Beep', desc: 'Crisp dual electronic beep' },
                      { id: 'classic_alarm', icon: '⏰', nameMM: 'ရိုးရာနှိုးစက်သံ', nameEN: 'Classic Alarm', desc: 'Urgent 3-tone wake pulse' },
                      { id: 'marimba', icon: '🪵', nameMM: 'မာရင်ဘာ တေးသွားသံ', nameEN: 'Marimba Melody', desc: 'Warm wooden marimba loop' }
                    ].map(preset => {
                      const isSelected = (preferences.soundType || 'gentle_chime') === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => {
                            onUpdatePreferences({ soundType: preset.id as any });
                            audioAlert.playSound(preset.id as any, preferences.soundVolume || 80);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-indigo-500/10 border-indigo-500 shadow-xs'
                              : 'bg-[var(--color-bg-card)] border-[var(--color-border)] hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg">{preset.icon}</span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                                {isMM ? preset.nameMM : preset.nameEN}
                              </div>
                              <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                                {preset.desc}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdatePreferences({ soundType: preset.id as any });
                              audioAlert.playSound(preset.id as any, preferences.soundVolume || 80);
                            }}
                            className="p-1.5 rounded-lg bg-[var(--color-bg-input)] hover:bg-indigo-500 hover:text-white text-[var(--color-text-primary)] transition-all shrink-0 cursor-pointer"
                            title={isMM ? 'အသံစမ်းသပ်မည်' : 'Play Sound'}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* SECTION 5 (Continued): Phone Vibration Engine */}
          <div className="p-4 rounded-2xl bg-[var(--color-bg-input)] border border-[var(--color-border)] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Smartphone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[var(--color-text-primary)]">
                    {isMM ? 'ဖုန်း တုန်ခါမှု စနစ် (Phone Vibration Feedback)' : 'Phone Vibration Feedback'}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {isMM ? 'သတိပေးချက် ရောက်ချိန်တွင် ဖုန်းကို တုန်ခါမှုဖြင့် အသိပေးမည် (Mobile Devices)' : 'Vibrate device when notification is triggered'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.vibrationAlerts !== false}
                onChange={e => onUpdatePreferences({ vibrationAlerts: e.target.checked })}
                className="w-5 h-5 accent-purple-600 cursor-pointer rounded-lg"
              />
            </div>

            {preferences.vibrationAlerts !== false && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[var(--color-text-primary)]">
                  {isMM ? 'တုန်ခါမှု ပုံစံ ရွေးချယ်ပါ:' : 'Select Vibration Pattern:'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'gentle', nameMM: '၁ ချက် ညင်သာ', nameEN: 'Gentle (100ms)' },
                    { id: 'double_buzz', nameMM: '၂ ချက် တွဲ', nameEN: 'Double Buzz' },
                    { id: 'pulse_wave', nameMM: 'လှိုင်းတုန်ခါမှု', nameEN: 'Pulse Wave' },
                    { id: 'strong_alarm', nameMM: 'အားကောင်းသော နှိုးစက်', nameEN: 'Strong Alarm' }
                  ].map(pat => {
                    const isSelected = (preferences.vibrationPattern || 'gentle') === pat.id;
                    return (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => {
                          onUpdatePreferences({ vibrationPattern: pat.id as any });
                          audioAlert.triggerVibration(pat.id as any);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-xs border-purple-600'
                            : 'bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-purple-400'
                        }`}
                      >
                        <div>{isMM ? pat.nameMM : pat.nameEN}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => audioAlert.triggerVibration(preferences.vibrationPattern || 'gentle')}
                    className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{isMM ? '📱 တုန်ခါမှု စမ်းသပ်မည်' : 'Test Vibration'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Voice Speech Reader */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4.5 h-4.5 text-[var(--color-primary)]" />
              <div>
                <div className="text-sm font-bold text-[var(--color-text-primary)]">
                  {isMM ? 'အသံဖြင့် စာဖတ်ပြစနစ် (Voice Speech Reader)' : 'Voice Speech Reader'}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {isMM ? 'အတန်းချိန်များကို အသံဖြင့် အော်ဖတ်ပြမည်' : 'Speaks schedule aloud via Web Speech AI engine'}
                </div>
              </div>
            </div>
            <button
              onClick={() => audioAlert.speak(
                isMM ? 'မင်္ဂလာပါ။ OmniFlow အသံဖြင့် အသိပေးစနစ် အဆင်သင့်ရှိနေပါပြီခင်ဗျာ။' : 'Hello! Voice notification reader is ready.',
                preferences.lang
              )}
              className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-xs"
            >
              🗣️ {isMM ? 'အသံစမ်းသပ်မည်' : 'Test Voice'}
            </button>
          </div>

          {/* Daily Summary */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <Bell className="w-4.5 h-4.5 text-[var(--color-primary)]" />
              <div>
                <div className="text-sm font-bold text-[var(--color-text-primary)]">
                  {isMM ? 'ညစဉ် စာရင်းအနှစ်ချုပ် (Daily Briefing Summary)' : 'Daily Briefing Summary'}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {isMM ? 'ည ၉ နာရီတွင် မနက်ဖြန် အတန်းများနှင့် အလုပ်ချိန်များကို အနှစ်ချုပ် အကြောင်းကြားမည်' : 'Receive daily schedule digest at 9:00 PM'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.dailySummary}
              onChange={e => onUpdatePreferences({ dailySummary: e.target.checked })}
              className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer rounded-lg"
            />
          </div>

          {/* Lock Screen & Offline Notification Tips Card */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/30 rounded-2xl space-y-2 mt-2">
            <div className="font-extrabold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{isMM ? '💡 ဖုန်း Lock Screen နှင့် အလိုအလျောက် သတိပေးမှု လမ်းညွှန်' : '💡 Lock Screen & Push Notification Tips'}</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {isMM
                ? '၁။ App ကို ဖုန်းထဲတွင် Install (PWA / APK) ပြုလုပ်ထားပါက ဖုန်းမျက်နှာပြင် ပိတ်ထားချိန် (Lock Screen) တွင်ပါ သတိပေးချက်များ ပေါ်လာပါမည်။\n၂။ Browser ၏ Notification Permission ကို "Allow" ပေးထားကြောင်း သေချာပါစေ။\n၃။ အင်တာနက်မရှိဘဲ ဖုန်း Alarm မြည်စေလိုပါက အထက်ပါ "ဖုန်း Alarm (.ics) ဒေါင်းလုဒ်" ခလုတ်ကို အသုံးပြုပါ။'
                : '1. Installing the app on your phone (PWA / APK) enables lock screen notifications.\n2. Ensure browser notification permissions are set to "Allow".\n3. For offline alarms, download the .ics file with native alarm triggers above.'}
            </p>
          </div>
        </div>
      )}

      {/* SECTION: WIDGETS */}
      {activeCategory === 'widgets' && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-4">
          <div className="font-bold text-base text-[var(--color-primary)] mb-3 flex items-center gap-2">
            <Layout className="w-5 h-5" />
            <span>{isMM ? 'ဖုန်း Home Screen ဝစ်ဂျက်' : 'Home Screen Widgets'}</span>
          </div>
          
          <div className="p-4 bg-[var(--color-primary-light)] rounded-xl border border-[var(--color-primary)]/30">
            <p className="text-sm font-semibold text-[var(--color-primary)] mb-2">
              {isMM ? 'Mini Glance Widget (ယခုအတန်း နှင့် နောက်လာမည့်အတန်းသာ ပြသပေးသော ပုံစံ)' : 'Mini Glance Widget (Shows current and next class only)'}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed">
              {isMM 
                ? 'App တစ်ခုလုံးကို မဖွင့်ဘဲ မိမိရဲ့ ယခုအတန်းနဲ့ နောက်လာမယ့်အတန်းကို အလွယ်တကူကြည့်နိုင်အောင် ဖုန်း Home Screen ပေါ်မှာ သီးသန့် Web Widget အနေနဲ့ ထည့်သွင်းနိုင်ပါတယ်။ အောက်ပါခလုတ်ကိုနှိပ်ပြီး ပွင့်လာသော စာမျက်နှာကို "Add to Home Screen" လုပ်ထားပါ။' 
                : 'You can add a mini web widget to your home screen that only shows your current and next class without opening the full app. Click the button below and add the resulting page to your home screen.'}
            </p>
            <button
              onClick={() => window.open(window.location.origin + window.location.pathname + '?widget=true', '_blank')}
              className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-sm active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              {isMM ? 'ဝစ်ဂျက် စာမျက်နှာ ဖွင့်မည်' : 'Open Widget View'}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 6: DATA & BACKUP */}
      {activeCategory === 'data' && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="font-bold text-base text-[var(--color-primary)] mb-3 flex items-center gap-2">
            <Database className="w-5 h-5" />
            <span>{isMM ? 'ဒေတာ သိမ်းဆည်း၊ ပြန်တင်နှင့် ရှင်းလင်းခြင်း' : 'Data, Backup & System Reset'}</span>
          </div>

          {installPrompt && (
            <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-[var(--color-primary)]" />
                <div>
                  <div className="text-sm font-medium">Install App</div>
                  <div className="text-xs text-[var(--color-text-muted)]">Add to Home Screen</div>
                </div>
              </div>
              <button onClick={onInstallClick} className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-xl text-xs font-semibold cursor-pointer">
                Install
              </button>
            </div>
          )}

          <div className="flex items-center justify-between py-2.5 px-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-xl mb-3">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
              <div>
                <div className="text-sm font-bold text-[var(--color-text-primary)]">
                  {isMM ? 'OmniFlow Source Code (.ZIP) ဒေါင်းလုဒ်လုပ်ရန်' : 'Download Source Code (.ZIP)'}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {isMM ? 'ပရောဂျက်၏ ရေးသားထားသော Source Code အားလုံးကို .zip ဖိုင်ဖြင့် ရယူမည်' : 'Get the entire React & TypeScript project archive (.zip)'}
                </div>
              </div>
            </div>
            <a
              href="/omniflow-source-code.zip"
              download="omniflow-source-code.zip"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{isMM ? 'ဒေါင်းလုဒ်' : 'Download ZIP'}</span>
            </a>
          </div>

          {/* QR Code & Barcode Mobile Share & Scan Card */}
          {onOpenQrCode && (
            <div className="p-3.5 bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-primary)]">
                    {isMM ? 'QR Code / Barcode ဖြင့် အချိန်ဇယား မျှဝေမည်' : 'QR Code Timetable Transfer'}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {isMM ? 'ဖုန်းအချင်းချင်း QR ဖတ်ပြီး အချိန်ဇယား ကူးယူ/ထည့်သွင်းရန်' : 'Share or scan timetable via Android phone camera'}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => onOpenQrCode('share')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  {isMM ? 'Share QR' : 'Share QR'}
                </button>
                <button
                  onClick={() => onOpenQrCode('scan')}
                  className="px-3 py-1.5 bg-[var(--color-bg-input)] hover:bg-indigo-600 hover:text-white border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-primary)] cursor-pointer transition-all shadow-xs"
                >
                  {isMM ? 'Scan QR' : 'Scan'}
                </button>
              </div>
            </div>
          )}

          {/* Google Cloud Auto-Sync & Backup Quick Card */}
          <div className="p-4 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/5 border border-blue-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-primary)]">
                    {isMM ? 'Google Cloud Backup (ဖုန်းပြောင်းသုံးရန်)' : 'Google Cloud Backup & Sync'}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {user?.email ? (
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{user.email}</span>
                    ) : (
                      <span>{isMM ? 'Gmail Account ဖြင့် ချိတ်ဆက်ပြီး သိမ်းဆည်းရန်' : 'Sign in with Gmail to sync'}</span>
                    )}
                  </div>
                </div>
              </div>

              {onOpenCloudBackup && (
                <button
                  onClick={onOpenCloudBackup}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1 shrink-0"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isMM ? 'Backup စီမံမည်' : 'Manage'}</span>
                </button>
              )}
            </div>

            {user && (
              <div className="flex flex-wrap gap-2 pt-1">
                {onForceCloudBackup && (
                  <button
                    onClick={() => onForceCloudBackup()}
                    disabled={isCloudSyncing}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{isMM ? 'Cloud သို့ Backup သိမ်းမည်' : 'Backup to Cloud'}</span>
                  </button>
                )}
                {onForceCloudRestore && (
                  <button
                    onClick={() => {
                      onForceCloudRestore();
                    }}
                    disabled={isCloudSyncing}
                    className="flex-1 py-2 px-3 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isMM ? 'Cloud မှ ပြန်ယူမည်' : 'Restore from Cloud'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-[var(--color-primary)]" />
              <div>
                <div className="text-sm font-medium">Backup Data</div>
                <div className="text-xs text-[var(--color-text-muted)]">Download all your data as JSON</div>
              </div>
            </div>
            <button onClick={onExportData} className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-xl text-xs font-semibold cursor-pointer">
              Backup
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <Upload className="w-4 h-4 text-[var(--color-primary)]" />
              <div>
                <div className="text-sm font-medium">Restore Data</div>
                <div className="text-xs text-[var(--color-text-muted)]">Upload a backup file</div>
              </div>
            </div>
            <label className="px-3 py-1.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-xs font-semibold cursor-pointer hover:bg-[var(--color-primary)] hover:text-white transition-all">
              Restore
              <input type="file" accept=".json" onChange={onImportData} className="hidden" />
            </label>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 p-5 border-2 border-red-500/40 rounded-3xl bg-red-500/[0.04] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2 text-sm">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span>{isMM ? 'သတိပြုရန် ကဏ္ဍ (Danger Zone)' : 'Danger Zone'}</span>
              </div>
              <span className="text-[11px] font-medium text-red-500/80 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                {isMM ? 'သတိထား၍ လုပ်ဆောင်ပါ' : 'Irreversible / With Undo'}
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {/* Item 1: Clear Timetable Classes */}
              {onClearChart && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-2xs hover:border-amber-500/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                      <CalendarX className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--color-text-primary)]">
                        {isMM ? 'ဇယားရှိ အတန်းများ အားလုံး ရှင်းလင်းမည်' : 'Clear Timetable Classes'}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                        {isMM ? 'တနင်္လာမှ တနင်္ဂနွေအထိ ထည့်ထားသော အတန်းအားလုံးကို ဖျက်မည် (အချိန် Slot များကို မဖျက်ပါ)' : 'Remove all subjects/classes from Mon to Sun (keeps time slots)'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      audioAlert.triggerVibration('gentle');
                      setDangerConfirmModal('chart');
                    }}
                    className="self-end sm:self-center px-3.5 py-2 bg-amber-500/15 hover:bg-amber-600 active:bg-amber-700 text-amber-700 dark:text-amber-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 touch-manipulation border border-amber-500/30 shrink-0 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isMM ? 'အတန်းများ ရှင်းမည်' : 'Clear Classes'}</span>
                  </button>
                </div>
              )}

              {/* Item 2: Clear All Tasks */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-2xs hover:border-red-500/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--color-text-primary)]">
                      {isMM ? 'လုပ်ငန်းတာဝန်များ အားလုံး ရှင်းလင်းမည်' : 'Clear All Tasks'}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                      {isMM ? 'မှတ်သားထားသော Tasks နှင့် Todo စာရင်းများ အားလုံးကို ဖျက်မည်' : 'Delete all to-do & task list entries'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audioAlert.triggerVibration('gentle');
                    setDangerConfirmModal('tasks');
                  }}
                  className="self-end sm:self-center px-3.5 py-2 bg-red-500/15 hover:bg-red-600 active:bg-red-700 text-red-600 dark:text-red-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 touch-manipulation border border-red-500/30 shrink-0 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isMM ? 'Tasks ရှင်းမည်' : 'Clear Tasks'}</span>
                </button>
              </div>

              {/* Item 3: Clear All Notes */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-2xs hover:border-red-500/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--color-text-primary)]">
                      {isMM ? 'ဘာသာရပ် မှတ်စုများ အားလုံး ရှင်းလင်းမည်' : 'Clear All Subject Notes'}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                      {isMM ? 'အတန်းချိန်များနှင့် ချိတ်ဆက်ရေးမှတ်ထားသော မှတ်စု (Notes) အားလုံးကို ဖျက်မည်' : 'Delete all custom notes attached to schedule slots'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audioAlert.triggerVibration('gentle');
                    setDangerConfirmModal('notes');
                  }}
                  className="self-end sm:self-center px-3.5 py-2 bg-red-500/15 hover:bg-red-600 active:bg-red-700 text-red-600 dark:text-red-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 touch-manipulation border border-red-500/30 shrink-0 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isMM ? 'Notes ရှင်းမည်' : 'Clear Notes'}</span>
                </button>
              </div>

              {/* Item 4: Reset All Data */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/40 shadow-2xs hover:border-red-600 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-600 dark:text-red-400">
                      {isMM ? 'စနစ်တစ်ခုလုံးကို မူလအတိုင်း ပြန်လည်သတ်မှတ်မည်' : 'Reset Entire System'}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                      {isMM ? 'အတန်းဇယား၊ အချိန်များ၊ Tasks၊ Notes၊ အလေ့အကျင့်များနှင့် ဆက်တင်များအားလုံးကို Default ပြန်ထားမည်' : 'Restore full timetable, slots, tasks, notes, habits, and preferences to initial state'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audioAlert.triggerVibration('gentle');
                    setDangerConfirmModal('reset');
                  }}
                  className="self-end sm:self-center px-3.5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 touch-manipulation shadow-xs shrink-0 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isMM ? 'အားလုံး Reset လုပ်မည်' : 'Reset All'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone In-App Confirmation Modal (Safe from iFrame confirm() blocks) */}
      {dangerConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[var(--color-bg-card)] border-2 border-red-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-600 dark:text-red-400">
                  {dangerConfirmModal === 'chart' && (isMM ? 'ဇယားရှိ အတန်းများ အားလုံး ရှင်းလင်းမည်' : 'Clear Timetable Classes')}
                  {dangerConfirmModal === 'tasks' && (isMM ? 'လုပ်ငန်းတာဝန်များ အားလုံး ရှင်းလင်းမည်' : 'Clear All Tasks')}
                  {dangerConfirmModal === 'notes' && (isMM ? 'ဘာသာရပ် မှတ်စုများ အားလုံး ရှင်းလင်းမည်' : 'Clear All Notes')}
                  {dangerConfirmModal === 'reset' && (isMM ? 'စနစ်တစ်ခုလုံးကို မူလအတိုင်း Reset ပြုလုပ်မည်' : 'Reset Entire System')}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {dangerConfirmModal === 'chart' && (isMM ? 'တနင်္လာမှ တနင်္ဂနွေအထိ ထည့်ထားသော အတန်းအားလုံး ဖျက်ပစ်ပါမည်' : 'All classes across MON-SUN will be removed')}
                  {dangerConfirmModal === 'tasks' && (isMM ? 'Tasks စာရင်းများအားလုံး ဖျက်ပစ်ပါမည်' : 'All to-do task items will be removed')}
                  {dangerConfirmModal === 'notes' && (isMM ? 'ရေးမှတ်ထားသော မှတ်စုများ အားလုံး ဖျက်ပစ်ပါမည်' : 'All subject notes will be deleted')}
                  {dangerConfirmModal === 'reset' && (isMM ? 'ဒေတာနှင့် ဆက်တင်များ အားလုံးကို Default အတိုင်း ပြန်ထားပါမည်' : 'All data will be reset to factory defaults')}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-[var(--color-text-primary)] leading-relaxed space-y-1">
              {dangerConfirmModal === 'chart' && (
                <>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    {isMM ? '⚠️ သတိပေးချက်:' : '⚠️ Warning:'}
                  </p>
                  <p>
                    {isMM
                      ? 'တနင်္လာမှ တနင်္ဂနွေအထိ ထည့်သွင်းထားသော အတန်း/ဘာသာရပ်များ အားလုံးကို ရှင်းလင်းပါမည်။ (အချိန်ကွက် Time Slots များကို မဖျက်ပါ)။ ဖျက်ပြီးပါကလည်း ချက်ချင်းပေါ်လာမည့် "↩ ပြန်ယူမည် (Undo)" ဖြင့် ပြန်လည်ရယူနိုင်ပါသည်။'
                      : 'This will remove all classes and subjects from your timetable (time slots will remain untouched). You can immediately undo this action if needed.'}
                  </p>
                </>
              )}
              {dangerConfirmModal === 'tasks' && (
                <>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    {isMM ? '⚠️ သတိပေးချက်:' : '⚠️ Warning:'}
                  </p>
                  <p>
                    {isMM
                      ? 'မှတ်သားထားသော Tasks နှင့် လုပ်ငန်းဆောင်တာများ အားလုံးကို ဖျက်ပစ်ပါမည်။ ဖျက်ပြီးပါကလည်း "↩ ပြန်ယူမည် (Undo)" ဖြင့် ပြန်လည်ရယူနိုင်ပါသည်။'
                      : 'This will delete all tasks and to-do entries. You can immediately undo this action if needed.'}
                  </p>
                </>
              )}
              {dangerConfirmModal === 'notes' && (
                <>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    {isMM ? '⚠️ သတိပေးချက်:' : '⚠️ Warning:'}
                  </p>
                  <p>
                    {isMM
                      ? 'အတန်းချိန်များနှင့် ချိတ်ဆက်ရေးမှတ်ထားသော မှတ်စု (Subject Notes) များ အားလုံးကို ဖျက်ပစ်ပါမည်။ ဖျက်ပြီးပါကလည်း "↩ ပြန်ယူမည် (Undo)" ဖြင့် ပြန်လည်ရယူနိုင်ပါသည်။'
                      : 'This will delete all saved subject notes from your timetable. You can immediately undo this action if needed.'}
                  </p>
                </>
              )}
              {dangerConfirmModal === 'reset' && (
                <>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    {isMM ? '⚠️ အရေးကြီးသတိပေးချက်:' : '⚠️ Critical Warning:'}
                  </p>
                  <p>
                    {isMM
                      ? 'အတန်းဇယား၊ အချိန်များ၊ Tasks၊ Notes၊ အလေ့အကျင့်များနှင့် ဆက်တင်များ အားလုံးကို စတင်အသုံးပြုချိန်ကအတိုင်း မူလ Default အခြေအနေသို့ ပြန်လည်သတ်မှတ်ပါမည်။ (မှားယွင်းနှိပ်မိပါကလည်း "↩ ပြန်ယူမည် (Undo)" ဖြင့် ပြန်လည်ရယူနိုင်ပါသည်)။'
                      : 'This will restore all timetable classes, time slots, tasks, notes, habits, and preferences to initial factory defaults. (An undo option is provided).'}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDangerConfirmModal(null)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold hover:bg-[var(--color-bg-card-hover)] cursor-pointer transition-all active:scale-95 touch-manipulation"
              >
                {isMM ? 'မလုပ်တော့ပါ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleExecuteDangerAction}
                className="px-4.5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95 touch-manipulation flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {dangerConfirmModal === 'reset'
                    ? (isMM ? 'သေချာပါသည်၊ Reset လုပ်မည်' : 'Confirm Reset')
                    : (isMM ? 'သေချာပါသည်၊ ရှင်းလင်းမည်' : 'Confirm Clear')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

