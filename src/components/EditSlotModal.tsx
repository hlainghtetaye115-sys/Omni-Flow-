
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
export interface EditSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: TimeSlot | null;
  allSlots: TimeSlot[];
  onSave: (slotData: { id?: number; start: string; end: string; label: string }) => void;
  onDelete?: (id: number) => void;
  lang?: 'my' | 'en';
}


export const EditSlotModal: React.FC<EditSlotModalProps> = ({
  isOpen,
  onClose,
  slot,
  allSlots,
  onSave,
  onDelete,
  lang = 'my'
}) => {
  const isMM = lang === 'my';
  const isEdit = !!slot;

  const [start, setStart] = useState<string>(slot?.start || '08:00');
  const [end, setEnd] = useState<string>(slot?.end || '08:50');
  const [label, setLabel] = useState<string>(slot?.label || '');

  // Reset state when slot prop changes
  React.useEffect(() => {
    if (slot) {
      setStart(slot.start);
      setEnd(slot.end);
      setLabel(slot.label);
    } else {
      // Default to next suggested slot
      const sorted = [...allSlots].sort((a, b) => a.start.localeCompare(b.start));
      if (sorted.length > 0) {
        const last = sorted[sorted.length - 1];
        setStart(last.end);
        const [h, m] = last.end.split(':').map(Number);
        const endMin = (h * 60 + m + 50) % 1440;
        const eh = String(Math.floor(endMin / 60)).padStart(2, '0');
        const em = String(endMin % 60).padStart(2, '0');
        setEnd(`${eh}:${em}`);
        setLabel(`${last.end}-${eh}:${em}`);
      } else {
        setStart('08:00');
        setEnd('08:50');
        setLabel('8:00-8:50');
      }
    }
  }, [slot, isOpen]);

  // Helper to add/subtract duration from end time
  const applyDuration = (mins: number) => {
    if (!start) return;
    const [h, m] = start.split(':').map(Number);
    const total = (h * 60 + m + mins) % 1440;
    const eh = String(Math.floor(total / 60)).padStart(2, '0');
    const em = String(total % 60).padStart(2, '0');
    const newEnd = `${eh}:${em}`;
    setEnd(newEnd);
    if (!label || label.includes('-') || label.includes('–') || label.includes(':')) {
      setLabel(`${start}-${newEnd}`);
    }
  };

  // Helper to adjust end time by delta minutes (+/-)
  const adjustEndDelta = (deltaMins: number) => {
    if (!start || !end) return;
    const [eh, em] = end.split(':').map(Number);
    const [sh, sm] = start.split(':').map(Number);
    const startMins = sh * 60 + sm;
    let endMins = eh * 60 + em + deltaMins;
    if (endMins <= startMins) endMins = startMins + 5; // minimum 5 mins
    if (endMins >= 1440) endMins = 1439;
    const newEh = String(Math.floor(endMins / 60)).padStart(2, '0');
    const newEm = String(endMins % 60).padStart(2, '0');
    const newEnd = `${newEh}:${newEm}`;
    setEnd(newEnd);
    if (!label || label.includes('-') || label.includes('–') || label.includes(':')) {
      setLabel(`${start}-${newEnd}`);
    }
  };

  // Helper to shift both start and end times together
  const shiftEntireSlot = (deltaMins: number) => {
    if (!start || !end) return;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let sMins = sh * 60 + sm + deltaMins;
    let eMins = eh * 60 + em + deltaMins;
    if (sMins < 0) {
      eMins -= sMins;
      sMins = 0;
    }
    if (eMins >= 1440) {
      sMins -= (eMins - 1439);
      eMins = 1439;
    }
    const newSh = String(Math.floor(sMins / 60)).padStart(2, '0');
    const newSm = String(sMins % 60).padStart(2, '0');
    const newEh = String(Math.floor(eMins / 60)).padStart(2, '0');
    const newEm = String(eMins % 60).padStart(2, '0');
    const newStart = `${newSh}:${newSm}`;
    const newEnd = `${newEh}:${newEm}`;
    setStart(newStart);
    setEnd(newEnd);
    if (!label || label.includes('-') || label.includes('–') || label.includes(':')) {
      setLabel(`${newStart}-${newEnd}`);
    }
  };

  // Helper to set start time preset
  const applyStartPreset = (newStart: string, defaultDur: number = 50) => {
    setStart(newStart);
    const [h, m] = newStart.split(':').map(Number);
    const total = (h * 60 + m + defaultDur) % 1440;
    const eh = String(Math.floor(total / 60)).padStart(2, '0');
    const em = String(total % 60).padStart(2, '0');
    const newEnd = `${eh}:${em}`;
    setEnd(newEnd);
    setLabel(`${newStart}-${newEnd}`);
  };

  // Calculate chronological position relative to other slots
  const otherSlots = allSlots.filter(s => !slot || s.id !== slot.id);
  const sortedOthers = [...otherSlots].sort((a, b) => a.start.localeCompare(b.start));

  let positionInfo = {
    type: 'middle', // 'first', 'last', 'middle'
    descMM: '',
    descEN: '',
    index: 0
  };

  if (sortedOthers.length === 0) {
    positionInfo = {
      type: 'first',
      descMM: 'ပထမဆုံး Time Slot ဖြစ်ပါသည်',
      descEN: 'This will be the first Time Slot',
      index: 1
    };
  } else {
    const insertIndex = sortedOthers.findIndex(s => start < s.start);
    if (insertIndex === 0) {
      const first = sortedOthers[0];
      positionInfo = {
        type: 'first',
        descMM: `လက်ရှိအချိန် (${first.start}) ထက် စောသဖြင့် ဇယား၏ ရှေ့ဆုံး (ထိပ်ဆုံး #1) နေရာတွင် အလိုအလျောက် ရောက်ရှိပါမည် 🌅`,
        descEN: `Earlier than ${first.start}. Will automatically be placed at the very front (#1) of the timetable 🌅`,
        index: 1
      };
    } else if (insertIndex === -1) {
      const last = sortedOthers[sortedOthers.length - 1];
      positionInfo = {
        type: 'last',
        descMM: `လက်ရှိအချိန် (${last.start}) ထက် နောက်ကျသဖြင့် ဇယား၏ နောက်ဆုံး (#${sortedOthers.length + 1}) နေရာတွင် ပြသပါမည် 🌙`,
        descEN: `Later than ${last.start}. Will appear at the end (#${sortedOthers.length + 1}) of the timetable 🌙`,
        index: sortedOthers.length + 1
      };
    } else {
      const prev = sortedOthers[insertIndex - 1];
      const next = sortedOthers[insertIndex];
      positionInfo = {
        type: 'middle',
        descMM: `အချိန်အစဉ်လိုက်အရ Slot (${prev.start}) နှင့် (${next.start}) ကြား (#${insertIndex + 1}) နေရာသို့ အလိုအလျောက် ဝင်ရောက်ပါမည် ↔️`,
        descEN: `Chronologically placed between (${prev.start}) and (${next.start}) at position #${insertIndex + 1} ↔️`,
        index: insertIndex + 1
      };
    }
  }

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end) return;
    const finalLabel = label.trim() || `${start}-${end}`;
    onSave({
      id: slot?.id,
      start,
      end,
      label: finalLabel
    });
    onClose();
  };

  return (
    <MacWindowFrame
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? (isMM ? `အချိန်ပြင်ဆင်ခြင်း (Slot #${slot.id})` : `Edit Time Slot #${slot.id}`) : (isMM ? 'အချိန်ကွက်အသစ် ထည့်သွင်းခြင်း' : 'Add New Time Slot')}
      icon={<Clock className="w-4 h-4 text-blue-500" />}
    >
      <form onSubmit={handleSaveClick} className="space-y-4">
        {/* Chronological Sorting Position Alert */}
        <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
          positionInfo.type === 'first'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            : positionInfo.type === 'last'
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
        }`}>
          <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <div className="font-extrabold flex items-center gap-1.5">
              <span>{isMM ? 'အချိန်အလိုက် ဇယားနေရာချထားမှု (Auto-Sorting)' : 'Chronological Position in Timetable'}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black/10 text-[10px] font-mono">
                #{positionInfo.index}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {isMM ? positionInfo.descMM : positionInfo.descEN}
            </p>
          </div>
        </div>

        {/* Start Time Presets */}
        <div>
          <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1.5">
            {isMM ? '⚡ အချိန် အမြန်ရွေးချယ်ရန် Presets' : '⚡ Quick Start Presets'}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { time: '06:00', label: isMM ? '🌅 06:00 မနက်စော' : '🌅 06:00 Early' },
              { time: '07:30', label: '07:30' },
              { time: '08:00', label: '☀️ 08:00' },
              { time: '09:00', label: '09:00' },
              { time: '10:15', label: '10:15' },
              { time: '13:00', label: isMM ? '🌤️ 13:00 နေ့ခင်း' : '🌤️ 13:00 Noon' },
              { time: '14:50', label: '14:50' },
              { time: '18:00', label: isMM ? '🌙 18:00 ညနေ' : '🌙 18:00 Eve' },
              { time: '20:00', label: isMM ? '🌙 20:00 ည' : '🌙 20:00 Night' }
            ].map(p => (
              <button
                key={p.time}
                type="button"
                onClick={() => applyStartPreset(p.time)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all border ${
                  start === p.time
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
                    : 'bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start & End Time Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">
              {isMM ? 'စတင်ချိန် (Start)' : 'Start Time'}
            </label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-sm font-mono font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">
              {isMM ? 'ပြီးဆုံးချိန် (End)' : 'End Time'}
            </label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-sm font-mono font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>
        </div>

        {/* Duration Adjustments: Extend / Reduce Time */}
        <div className="p-3 bg-[var(--color-bg-input)] rounded-2xl border border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{isMM ? 'အချိန်တိုး/လျော့ ပြုလုပ်ရန် (Increase / Decrease Time)' : 'Adjust Duration (+ / - Time)'}</span>
            </label>
            <span className="text-xs font-mono font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
              {(() => {
                if (!start || !end) return '';
                const [sh, sm] = start.split(':').map(Number);
                const [eh, em] = end.split(':').map(Number);
                const diff = (eh * 60 + em) - (sh * 60 + sm);
                if (diff <= 0) return isMM ? 'မမှန်ကန်သော အချိန်' : 'Invalid';
                const h = Math.floor(diff / 60);
                const m = diff % 60;
                if (h > 0 && m > 0) return `${diff} mins (${h} hr ${m} min)`;
                if (h > 0) return `${diff} mins (${h} hour)`;
                return `${diff} mins`;
              })()}
            </span>
          </div>

          {/* Quick Delta Adjusters: + and - */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              {isMM ? 'ပြီးဆုံးချိန် တိုးရန် / လျှော့ရန် (+ / - Minutes):' : 'Extend or reduce end time:'}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
              {[
                { delta: -15, label: '-15m', isRed: true },
                { delta: -10, label: '-10m', isRed: true },
                { delta: -5, label: '-5m', isRed: true },
                { delta: 5, label: '+5m', isGreen: true },
                { delta: 10, label: '+10m', isGreen: true },
                { delta: 15, label: '+15m', isGreen: true },
                { delta: 30, label: '+30m', isGreen: true },
                { delta: 60, label: '+1h', isGreen: true }
              ].map(item => (
                <button
                  key={item.delta}
                  type="button"
                  onClick={() => adjustEndDelta(item.delta)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center border shadow-xs ${
                    item.isRed
                      ? 'bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 border-rose-500/20'
                      : 'bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 border-emerald-500/20'
                  }`}
                  title={`${item.delta > 0 ? '+' : ''}${item.delta} mins`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Standard Period Lengths */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              {isMM ? 'အတန်းချိန် ကြာချိန် စံနှုန်းများ (Fixed Class Lengths):' : 'Fixed Duration Presets:'}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
              {[
                { m: 30, l: '30m' },
                { m: 45, l: '45m' },
                { m: 50, l: '50m (Std)' },
                { m: 60, l: '60m (1h)' },
                { m: 90, l: '90m (1.5h)' },
                { m: 120, l: '120m (2h)' }
              ].map(d => (
                <button
                  key={d.m}
                  type="button"
                  onClick={() => applyDuration(d.m)}
                  className="py-1 px-1 bg-[var(--color-bg-card)] hover:bg-blue-600 hover:text-white border border-[var(--color-border)] rounded-lg text-[11px] font-bold font-mono text-[var(--color-text-primary)] transition-all cursor-pointer text-center"
                >
                  {d.l}
                </button>
              ))}
            </div>
          </div>

          {/* Shift Slot Earlier or Later */}
          <div className="space-y-1.5 pt-1 border-t border-[var(--color-border)]">
            <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              {isMM ? 'အချိန်ကွက် တစ်ခုလုံးကို ရှေ့/နောက် ရွှေ့မည် (Shift Time Window):' : 'Shift entire slot earlier/later:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => shiftEntireSlot(-30)}
                className="py-1.5 px-2 bg-[var(--color-bg-card)] hover:bg-blue-500/20 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-primary)] transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>⏪ -30m {isMM ? 'စောရွှေ့' : 'Earlier'}</span>
              </button>
              <button
                type="button"
                onClick={() => shiftEntireSlot(-15)}
                className="py-1.5 px-2 bg-[var(--color-bg-card)] hover:bg-blue-500/20 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-primary)] transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>◀️ -15m {isMM ? 'စောရွှေ့' : 'Earlier'}</span>
              </button>
              <button
                type="button"
                onClick={() => shiftEntireSlot(15)}
                className="py-1.5 px-2 bg-[var(--color-bg-card)] hover:bg-blue-500/20 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-primary)] transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>+15m {isMM ? 'နောက်ရွှေ့' : 'Later'} ▶️</span>
              </button>
              <button
                type="button"
                onClick={() => shiftEntireSlot(30)}
                className="py-1.5 px-2 bg-[var(--color-bg-card)] hover:bg-blue-500/20 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-primary)] transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>+30m {isMM ? 'နောက်ရွှေ့' : 'Later'} ⏩</span>
              </button>
            </div>
          </div>
        </div>

        {/* Display Label */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[var(--color-text-secondary)]">
              {isMM ? 'ဇယားတွင်ပြသမည့် စာသား (Label)' : 'Display Label'}
            </label>
            <button
              type="button"
              onClick={() => setLabel(`${start}-${end}`)}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-semibold"
            >
              {isMM ? '⚡ Auto ဖြည့်မည်' : '⚡ Auto-fill'}
            </button>
          </div>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={`e.g. ${start}-${end} သို့မဟုတ် Period 1`}
            className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-blue-500 outline-hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <div>
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  audioAlert.triggerVibration('gentle');
                  onDelete(slot.id);
                  onClose();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  audioAlert.triggerVibration('gentle');
                  onDelete(slot.id);
                  onClose();
                }}
                className="min-h-[44px] px-4 py-2.5 bg-red-500/15 hover:bg-red-600 hover:text-white active:bg-red-700 text-red-600 dark:text-red-400 border border-red-500/30 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 touch-manipulation select-none shadow-xs"
                title={isMM ? 'အချိန်ကွက် ဖျက်မည်' : 'Delete Slot'}
              >
                <Trash2 className="w-4 h-4" />
                <span>{isMM ? 'အချိန်ကွက် ဖျက်မည်' : 'Delete Slot'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              {isMM ? 'ပိတ်မည်' : 'Cancel'}
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEdit ? (isMM ? 'အပြောင်းအလဲ သိမ်းမည်' : 'Save Changes') : (isMM ? 'Slot အသစ် ထည့်မည်' : 'Add Time Slot')}</span>
            </motion.button>
          </div>
        </div>
      </form>
    </MacWindowFrame>
  );
};


