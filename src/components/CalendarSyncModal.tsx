
import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Save, Check, Play, Trash2, Bell, Clock, Calendar, Tags, User, Layers,
  Minus, Maximize2, Smartphone, Copy, ArrowRightLeft, CalendarCheck, Download,
  ExternalLink, Sparkles, CheckCircle2, ChevronDown, ChevronUp, Share2, Loader2, AlertCircle, ShieldCheck, Plus, RotateCcw,
  MapPin, UserCheck, Video, Link2, AlertTriangle, CheckSquare, Zap, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationItem, TimeSlot, DayCode, TimetableChart } from '../types';
import { sendSystemNotification, requestNotificationPermission } from '../lib/notifications';
import { downloadTimetableIcs } from '../utils/calendarExport';
import { uploadTimetableToGoogleCalendar, SyncProgressInfo, GoogleCalendarItem } from '../utils/googleCalendarSync';
import { audioAlert } from '../utils/audioAlert';
import { MacWindowFrame } from './MacWindowFrame';
export interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  chart?: any;
  slots?: TimeSlot[];
  notes?: Record<string, string>;
  preferences?: any;
  onUpdatePreferences?: (prefs: any) => void;
  onDownloadIcs?: () => void;
  totalClassesCount?: number;
  lang?: 'my' | 'en';
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  chart = {},
  slots = [],
  notes = {},
  preferences = { lang: 'my', reminderTime: 10, calendarAlarmLeadTime: 10 },
  onUpdatePreferences,
  onDownloadIcs,
  totalClassesCount = 0,
  lang = 'my'
}) => {
  const isMM = lang === 'my';
  const [activeTab, setActiveTab] = useState<'google_direct_sync' | 'download_ics'>('google_direct_sync');
  const [alarmLead, setAlarmLead] = useState<number>(
    preferences.calendarAlarmLeadTime !== undefined ? preferences.calendarAlarmLeadTime : (preferences.reminderTime || 10)
  );
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [selectedAccountEmail, setSelectedAccountEmail] = useState<string>(preferences.syncAccountEmail || '');
  const [targetCalendarId, setTargetCalendarId] = useState<string>(preferences.syncCalendarId || 'primary');
  const [availableCalendars, setAvailableCalendars] = useState<GoogleCalendarItem[]>([]);
  const [isCustomCalendarMode, setIsCustomCalendarMode] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgressInfo>({
    status: 'idle',
    current: 0,
    total: 0,
    syncedAccountEmail: preferences.syncAccountEmail
  });

  const handleAlarmLeadChange = (mins: number) => {
    setAlarmLead(mins);
    if (onUpdatePreferences) {
      onUpdatePreferences({ calendarAlarmLeadTime: mins });
    }
  };

  const handleDirectGoogleUpload = async (forceAccountSelect: boolean = false) => {
    try {
      setSyncProgress({
        status: 'authorizing',
        current: 0,
        total: 0
      });

      const result = await uploadTimetableToGoogleCalendar(
        chart,
        notes,
        { ...preferences, calendarAlarmLeadTime: alarmLead },
        (info) => setSyncProgress(info),
        {
          promptSelectAccount: forceAccountSelect,
          loginHint: !forceAccountSelect && selectedAccountEmail ? selectedAccountEmail : undefined,
          targetCalendarId: targetCalendarId || 'primary'
        }
      );

      if (result.success && result.userEmail) {
        setSelectedAccountEmail(result.userEmail);
        if (onUpdatePreferences) {
          onUpdatePreferences({
            syncAccountEmail: result.userEmail,
            syncCalendarId: targetCalendarId
          });
        }
      }

      if (!result.success && result.error) {
        setSyncProgress({
          status: 'error',
          current: 0,
          total: 0,
          errorMessage: result.error
        });
      }
    } catch (err: any) {
      setSyncProgress({
        status: 'error',
        current: 0,
        total: 0,
        errorMessage: err?.message || 'Google Calendar upload failed'
      });
    }
  };

  const handleTriggerDownload = () => {
    if (onDownloadIcs) {
      onDownloadIcs();
    } else {
      downloadTimetableIcs(chart, slots, notes, { ...preferences, calendarAlarmLeadTime: alarmLead });
    }
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  // Count total classes
  let computedTotalClasses = 0;
  Object.values(chart).forEach(acts => {
    if (Array.isArray(acts)) {
      computedTotalClasses += acts.filter(a => a.name && a.start && a.end).length;
    }
  });
  const totalClasses = totalClassesCount || computedTotalClasses;

  return (
    <MacWindowFrame
      isOpen={isOpen}
      onClose={onClose}
      title={isMM ? 'Google Calendar တိုက်ရိုက် Upload နှင့် အချိန်ဇယား ချိတ်ဆက်မှု' : 'Google Calendar Direct Upload & Timetable Sync'}
      icon={<CalendarCheck className="w-4 h-4 text-blue-500" />}
      maxWidthClass="max-w-xl"
    >
      <div className="space-y-4">
        {/* Header Hero Banner */}
        <div className="p-4 bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-teal-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[var(--color-text-primary)] flex items-center gap-2">
                <span>{isMM ? 'Google Calendar သို့ တိုက်ရိုက် Upload ပြုလုပ်ခြင်း' : 'Direct Upload to Google Calendar'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                  {totalClasses} {isMM ? 'အတန်းချိန်' : 'Classes'}
                </span>
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {isMM
                  ? 'အပတ်စဉ် အတန်းချိန်များကို သင့် Google Calendar ထဲသို့ ၁ ချက်နှိပ်ရုံဖြင့် တိုက်ရိုက်ထည့်သွင်းပါမည်'
                  : 'Sync all recurring weekly class schedules into your Google Calendar in 1-click'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--color-border)] gap-2">
          {[
            { id: 'google_direct_sync', labelMM: '⚡ Google Calendar တိုက်ရိုက် Upload', labelEN: '⚡ Direct Google Sync' },
            { id: 'download_ics', labelMM: '📱 Apple / Phone Alarm (.ics)', labelEN: '📱 Apple / Phone Alarm (.ics)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {isMM ? tab.labelMM : tab.labelEN}
            </button>
          ))}
        </div>

        {/* TAB 1: 1-CLICK DIRECT GOOGLE CALENDAR UPLOAD */}
        {activeTab === 'google_direct_sync' && (
          <div className="space-y-4">
            {/* Account & Calendar Custom Selection Card */}
            <div className="p-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-extrabold">
                    @
                  </div>
                  <span>{isMM ? 'ချိတ်ဆက်မည့် Google / Gmail Account:' : 'Connected Google / Gmail Account:'}</span>
                </div>
                {selectedAccountEmail ? (
                  <button
                    type="button"
                    onClick={() => handleDirectGoogleUpload(true)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    title={isMM ? 'အခြား Google Account သို့ ပြောင်းလဲမည်' : 'Switch Google Account'}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isMM ? 'Account ပြောင်းမည်' : 'Switch Account'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    {isMM ? 'မည်သည့် Account မဆို ရွေးချယ်နိုင်ပါသည်' : 'Choose any account'}
                  </span>
                )}
              </div>

              {selectedAccountEmail ? (
                <div className="p-3 bg-[var(--color-bg-card)] border border-blue-500/30 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                      {selectedAccountEmail.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-[var(--color-text-primary)] truncate font-mono">
                        {selectedAccountEmail}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isMM ? 'ချိတ်ဆက်ထားပြီးဖြစ်သည်' : 'Connected'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDirectGoogleUpload(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold transition-all cursor-pointer shrink-0"
                  >
                    {isMM ? 'အခြား Account သုံးမည်' : 'Switch'}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl flex items-center justify-between">
                  <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isMM ? 'Upload နှိပ်သည့်အခါ မိမိကြိုက်နှစ်သက်ရာ Gmail/Google Account ကို ရွေးချယ်နိုင်ပါသည်' : 'You will be prompted to choose your desired Gmail / Google Account'}</span>
                  </div>
                </div>
              )}

              {/* Target Calendar Selector */}
              <div className="pt-1 flex items-center justify-between text-xs border-t border-[var(--color-border)]/50">
                <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isMM ? 'ထည့်သွင်းမည့် Calendar:' : 'Target Calendar:'}</span>
                </span>
                <span className="font-bold text-[var(--color-text-primary)] bg-[var(--color-bg-card)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[11px]">
                  {isMM ? 'Primary Calendar (အဓိကပြက္ခဒိန်)' : 'Primary Calendar (Default)'}
                </span>
              </div>
            </div>

            {/* Alarm Lead Selector Card */}
            <div className="p-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-blue-500" />
                  <span>{isMM ? 'အတန်းမစမီ အချက်ပေး Reminder မြည်စေလိုသော အချိန်:' : 'Reminder alert lead time:'}</span>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {alarmLead === 0 ? (isMM ? 'အတန်းစချိန်' : '0m (On Time)') : `${alarmLead}m before`}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {[0, 5, 10, 15, 20, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleAlarmLeadChange(mins)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                      alarmLead === mins
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-blue-400'
                    }`}
                  >
                    {mins === 0 ? (isMM ? 'စချိန်' : '0m') : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Action Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/30 space-y-4 text-center">
              <div className="space-y-1.5">
                <div className="text-sm font-extrabold text-[var(--color-text-primary)]">
                  {isMM ? 'အချိန်ဇယားအားလုံးကို Google Calendar သို့ တိုက်ရိုက် Upload လုပ်မည်' : 'Direct 1-Click Upload to Google Calendar'}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
                  {isMM
                    ? 'Google Login တစ်ချက်ဝင်ပေးရုံဖြင့် အတန်းချိန်ဇယားအားလုံးကို မိမိရွေးချယ်ထားသော Google Account ထဲသို့ အပတ်စဉ် ထပ်တလဲလဲဖြစ်သော Weekly Recurring Events အဖြစ် အလိုအလျောက် တင်ပေးပါမည်။'
                    : 'Authenticates with your selected Google Account and automatically creates all weekly recurring class schedules in your calendar.'}
                </p>
              </div>

              {/* Status Display Card */}
              {syncProgress.status !== 'idle' && (
                <div className="p-3.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-xs space-y-2 text-left">
                  {syncProgress.status === 'authorizing' && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>{isMM ? 'Google Account အတည်ပြုခွင့် တောင်းခံနေသည်...' : 'Requesting Google authorization...'}</span>
                    </div>
                  )}

                  {syncProgress.status === 'syncing' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-bold text-[var(--color-text-primary)]">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          <span>{isMM ? 'Google Calendar သို့ တင်သွင်းနေသည်...' : 'Uploading to Google Calendar...'}</span>
                        </div>
                        <span className="font-mono text-xs">{syncProgress.current} / {syncProgress.total}</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                          style={{ width: `${(syncProgress.current / (syncProgress.total || 1)) * 100}%` }}
                        />
                      </div>
                      {syncProgress.currentSubject && (
                        <div className="text-[11px] text-[var(--color-text-secondary)] truncate">
                          {isMM ? 'တင်သွင်းနေသည့် ဘာသာရပ်:' : 'Current Subject:'} <span className="font-bold text-[var(--color-text-primary)]">{syncProgress.currentSubject}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {syncProgress.status === 'completed' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          {isMM
                            ? `အတန်းချိန် ${syncProgress.current} ခုလုံး ${syncProgress.syncedAccountEmail ? `(${syncProgress.syncedAccountEmail}) ` : ''}Google Calendar သို့ အောင်မြင်စွာ တင်ပြီးပါပြီ!`
                            : `Successfully uploaded ${syncProgress.current} classes to ${syncProgress.syncedAccountEmail || 'Google'} Calendar!`}
                        </span>
                      </div>
                      <a
                        href="https://calendar.google.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isMM ? 'Google Calendar ဖွင့်ကြည့်မည်' : 'Open Google Calendar App'}</span>
                      </a>
                    </div>
                  )}

                  {syncProgress.status === 'error' && (
                    <div className="space-y-1 text-rose-600 dark:text-rose-400">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{isMM ? 'Upload မအောင်မြင်ပါ' : 'Upload Failed'}</span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-secondary)] pl-6">
                        {syncProgress.errorMessage || 'Unknown error occurred'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDirectGoogleUpload(false)}
                  disabled={syncProgress.status === 'authorizing' || syncProgress.status === 'syncing' || totalClasses === 0}
                  className="w-full sm:w-auto px-6 py-3 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {syncProgress.status === 'authorizing' || syncProgress.status === 'syncing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isMM ? 'Upload လုပ်နေသည်...' : 'Uploading...'}</span>
                    </>
                  ) : syncProgress.status === 'completed' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isMM ? 'ထပ်မံ Upload ပြုလုပ်မည်' : 'Upload Again'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isMM ? 'Google Calendar သို့ တိုက်ရိုက် Upload လုပ်မည်' : 'Upload to Google Calendar'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectGoogleUpload(true)}
                  disabled={syncProgress.status === 'authorizing' || syncProgress.status === 'syncing'}
                  className="w-full sm:w-auto px-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-blue-500 text-[var(--color-text-primary)] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  title={isMM ? 'အခြား Account ရွေးပြီး Upload တင်မည်' : 'Choose different account to upload'}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isMM ? 'Account ရွေးချယ်တင်မည်' : 'Choose Account'}</span>
                </button>

                <a
                  href="https://calendar.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-blue-500 text-[var(--color-text-primary)] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isMM ? 'Google Calendar ဖွင့်မည်' : 'Open Calendar'}</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOWNLOAD .ICS & OFFLINE ALARMS */}
        {activeTab === 'download_ics' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--color-bg-input)] border border-[var(--color-border)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-[var(--color-text-primary)] flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-500" />
                    <span>{isMM ? 'Universal Calendar (.ics) ဖိုင် ဒေါင်းလုဒ်' : 'Universal Calendar (.ics) Download'}</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                    {isMM
                      ? 'iPhone / Apple Calendar, Samsung Calendar နှင့် အခြား Calendar app များတွင် အသုံးပြုနိုင်ပါသည်'
                      : 'Compatible with iPhone / Apple Calendar, Samsung Calendar, Outlook and offline alarms'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTriggerDownload}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>{isMM ? 'ဒေါင်းလုဒ် ရယူပြီးပါပြီ!' : 'Downloaded (.ics)!'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{isMM ? 'အချိန်ဇယား (.ics) ဖိုင် ဒေါင်းလုဒ်ဆွဲမည်' : 'Download .ics File'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick guide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[var(--color-text-secondary)]">
              <div className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] space-y-1">
                <div className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <span>📱</span>
                  <span>iPhone / iPad (Apple Calendar)</span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {isMM
                    ? 'ဒေါင်းလုဒ်ဖိုင်ကို နှိပ်ပြီး Apple Calendar ဖြင့်ဖွင့်ကာ "Add All" နှိပ်ပါ။'
                    : 'Open downloaded .ics in Apple Calendar and tap "Add All".'}
                </p>
              </div>

              <div className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] space-y-1">
                <div className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <span>🤖</span>
                  <span>Android (Samsung / Xiaomi)</span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {isMM
                    ? 'ဒေါင်းလုဒ်ဖိုင်ကို Calendar App ဖြင့် ဖွင့်၍ အလွယ်တကူ ထည့်သွင်းနိုင်ပါသည်။'
                    : 'Open file directly in your Samsung / Google Calendar app to import.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-[var(--color-border)]">
          <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
            Google Calendar API & RFC-5545
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold cursor-pointer transition-all"
          >
            {isMM ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </div>
    </MacWindowFrame>
  );
};

