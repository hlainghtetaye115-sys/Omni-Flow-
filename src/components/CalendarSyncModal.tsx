
import React, { useState } from 'react';
import {
  Bell, Calendar, CalendarCheck, Download, CheckCircle2
} from 'lucide-react';
import { TimeSlot } from '../types';
import { downloadTimetableIcs } from '../utils/calendarExport';
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
  const [alarmLead, setAlarmLead] = useState<number>(
    preferences.calendarAlarmLeadTime !== undefined ? preferences.calendarAlarmLeadTime : (preferences.reminderTime || 10)
  );
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleAlarmLeadChange = (mins: number) => {
    setAlarmLead(mins);
    if (onUpdatePreferences) {
      onUpdatePreferences({ calendarAlarmLeadTime: mins });
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
      title={isMM ? 'ဖုန်း Alarm & ပြက္ခဒိန် (.ics) ဒေါင်းလုဒ်' : 'Phone Alarm & Calendar (.ics) Export'}
      icon={<CalendarCheck className="w-4 h-4 text-emerald-500" />}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4">
        {/* Header Hero Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-600/10 via-teal-500/10 to-transparent border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[var(--color-text-primary)] flex items-center gap-2">
                <span>{isMM ? 'အချိန်ဇယား ဖုန်း Alarm စနစ်' : 'Offline Phone Alarm Export'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                  {totalClasses} {isMM ? 'အတန်းချိန်' : 'Classes'}
                </span>
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {isMM
                  ? 'အပတ်စဉ် အတန်းချိန်များကို သင့်ဖုန်း Alarm နှင့် အလိုအလျောက်ချိတ်ဆက်ပါမည်'
                  : 'Sync all recurring weekly class schedules offline to your native alarms'}
              </div>
            </div>
          </div>
        </div>

        {/* Alarm Lead Selector Card */}
        <div className="p-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-emerald-500" />
              <span>{isMM ? 'အတန်းမစမီ အချက်ပေး Reminder မြည်စေလိုသော အချိန်:' : 'Reminder alert lead time:'}</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {alarmLead === 0 ? (isMM ? 'အတန်းစချိန်' : '0m (On Time)') : `${alarmLead}m before`}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 5, 10, 15, 20, 30, 45, 60].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => handleAlarmLeadChange(mins)}
                className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                  alarmLead === mins
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-emerald-400'
                }`}
              >
                {mins === 0 ? (isMM ? 'စချိန်' : '0m') : `${mins}m`}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 2: DOWNLOAD .ICS & OFFLINE ALARMS */}
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

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-[var(--color-border)]">
          <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
            RFC-5545 VALARM
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

