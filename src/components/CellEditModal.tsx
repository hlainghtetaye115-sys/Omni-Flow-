
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
export interface CellEditModalProps {
  isOpen: boolean;
  day: DayCode;
  slotIds: number[];
  allSlots?: TimeSlot[];
  chart?: TimetableChart;
  initialName: string;
  initialColor: string;
  initialCategory: string;
  initialNote: string;
  initialRoom?: string;
  initialInstructor?: string;
  initialLink?: string;
  initialReminderOffset?: number;
  onClose: () => void;
  onSave: (data: {
    day: DayCode;
    slotIds: number[];
    name: string;
    color: string;
    category: 'work' | 'personal' | 'relationship';
    note: string;
    room?: string;
    instructor?: string;
    link?: string;
    reminderOffset?: number;
    relatedTaskTitle?: string;
    relatedTaskDueDate?: string;
  }) => void;
  onDelete?: (day: DayCode, slotIds: number[], name?: string) => void;
  onDuplicateToDays?: (
    sourceDay: string,
    targetDays: string[],
    slotIds: number[],
    data: {
      name: string;
      color: string;
      category: 'work' | 'personal' | 'relationship';
      note: string;
      room?: string;
      instructor?: string;
      link?: string;
      reminderOffset?: number;
    }
  ) => void;
  onMoveOrCopy?: any;
  onAddRelatedTask?: (taskTitle: string, dueDate?: string) => void;
  lang?: 'my' | 'en';
}

export const CellEditModal: React.FC<CellEditModalProps> = ({
  isOpen,
  day: initialDay,
  slotIds: initialSlotIds,
  allSlots = [],
  chart,
  initialName,
  initialColor,
  initialCategory,
  initialNote,
  initialRoom = '',
  initialInstructor = '',
  initialLink = '',
  initialReminderOffset = 10,
  onClose,
  onSave,
  onDelete,
  onDuplicateToDays,
  onAddRelatedTask,
  lang = 'my'
}) => {
  const isMM = lang === 'my';
  const [selectedDay, setSelectedDay] = useState<DayCode>(initialDay);
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>(initialSlotIds);
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor || '#3b82f6');
  const [category, setCategory] = useState<'work' | 'personal' | 'relationship'>((initialCategory as any) || 'work');
  const [note, setNote] = useState(initialNote);
  const [room, setRoom] = useState(initialRoom);
  const [instructor, setInstructor] = useState(initialInstructor);
  const [link, setLink] = useState(initialLink);
  const [reminderOffset, setReminderOffset] = useState<number>(initialReminderOffset);
  
  // Quick Task linking
  const [addQuickTask, setAddQuickTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [showDuplicateSection, setShowDuplicateSection] = useState(false);
  const [targetDays, setTargetDays] = useState<DayCode[]>([]);

  useEffect(() => {
    setSelectedDay(initialDay);
    setSelectedSlotIds(initialSlotIds);
    setName(initialName);
    setColor(initialColor || '#3b82f6');
    setCategory(((initialCategory as any) || 'work'));
    setNote(initialNote);
    setRoom(initialRoom || '');
    setInstructor(initialInstructor || '');
    setLink(initialLink || '');
    setReminderOffset(initialReminderOffset !== undefined ? initialReminderOffset : 10);
    setAddQuickTask(false);
    setTaskTitle(initialName ? `${initialName}: Assignment` : '');
    setShowDuplicateSection(false);
    setTargetDays([]);
  }, [isOpen, initialDay, initialSlotIds, initialName, initialColor, initialCategory, initialNote, initialRoom, initialInstructor, initialLink, initialReminderOffset]);

  const days: { code: DayCode; labelMM: string; labelEN: string }[] = [
    { code: 'MON', labelMM: 'တနင်္လာ (Mon)', labelEN: 'Mon' },
    { code: 'TUE', labelMM: 'အင်္ဂါ (Tue)', labelEN: 'Tue' },
    { code: 'WED', labelMM: 'ဗုဒ္ဓဟူး (Wed)', labelEN: 'Wed' },
    { code: 'THU', labelMM: 'ကြာသပတေး (Thu)', labelEN: 'Thu' },
    { code: 'FRI', labelMM: 'သောကြာ (Fri)', labelEN: 'Fri' },
    { code: 'SAT', labelMM: 'စနေ (Sat)', labelEN: 'Sat' },
    { code: 'SUN', labelMM: 'တနင်္ဂနွေ (Sun)', labelEN: 'Sun' }
  ];

  const sortedSlots = useMemo(() => {
    return [...allSlots].sort((a, b) => a.start.localeCompare(b.start));
  }, [allSlots]);

  // Check for live timetable conflicts
  const conflictingActivities = useMemo(() => {
    if (!chart || !selectedDay) return [];
    const dayActivities = chart[selectedDay] || [];
    return dayActivities.filter(act => {
      // Don't flag itself as conflict if on same day and same original slots
      const isOriginal = selectedDay === initialDay && act.slots.some(id => initialSlotIds.includes(id));
      if (isOriginal) return false;
      return act.slots.some(id => selectedSlotIds.includes(id));
    });
  }, [chart, selectedDay, selectedSlotIds, initialDay, initialSlotIds]);

  // Extract distinct subjects already configured in timetable with auto-fill metadata
  const existingSubjectHistory = useMemo(() => {
    const map = new Map<string, {
      name: string;
      color?: string;
      category?: 'work' | 'personal' | 'relationship';
      room?: string;
      instructor?: string;
      link?: string;
    }>();

    if (chart) {
      Object.values(chart).forEach(acts => {
        acts.forEach(a => {
          if (a.name && a.name.trim() && !map.has(a.name.trim().toLowerCase())) {
            map.set(a.name.trim().toLowerCase(), {
              name: a.name.trim(),
              color: a.customBg,
              category: a.category,
              room: a.room,
              instructor: a.instructor,
              link: a.link
            });
          }
        });
      });
    }

    const fromChart = Array.from(map.values());
    if (fromChart.length > 0) {
      return fromChart;
    }

    // Default fallback presets if timetable is brand new
    return [
      { name: 'Mathematics', color: '#3b82f6', category: 'work' },
      { name: 'English', color: '#10b981', category: 'work' },
      { name: 'Physics', color: '#8b5cf6', category: 'work' },
      { name: 'Chemistry', color: '#06b6d4', category: 'work' },
      { name: 'Biology', color: '#10b981', category: 'work' },
      { name: 'Programming', color: '#6366f1', category: 'work' },
      { name: 'Team Meeting', color: '#f59e0b', category: 'work' },
      { name: 'Deep Work', color: '#ec4899', category: 'personal' },
      { name: 'Gym & Workout', color: '#f97316', category: 'personal' },
      { name: 'Reading & Study', color: '#14b8a6', category: 'personal' },
    ];
  }, [chart]);

  const toggleSlotSelection = (id: number) => {
    if (selectedSlotIds.includes(id)) {
      if (selectedSlotIds.length === 1) return; // keep at least one
      setSelectedSlotIds(selectedSlotIds.filter(sId => sId !== id));
    } else {
      setSelectedSlotIds([...selectedSlotIds, id].sort((a, b) => a - b));
    }
  };

  // Consecutive slot selection helper (e.g. 1 slot, 2 slots, 3 slots)
  const handleSelectConsecutiveSlots = (count: number) => {
    if (sortedSlots.length === 0) return;
    const startSlotId = selectedSlotIds.length > 0 ? Math.min(...selectedSlotIds) : sortedSlots[0].id;
    const startIndex = sortedSlots.findIndex(s => s.id === startSlotId);
    if (startIndex === -1) return;
    const picked = sortedSlots.slice(startIndex, startIndex + count).map(s => s.id);
    if (picked.length > 0) {
      setSelectedSlotIds(picked);
    }
  };

  const selectedSlotsTimeRange = () => {
    if (selectedSlotIds.length === 0) return '';
    const relevantSlots = sortedSlots.filter(s => selectedSlotIds.includes(s.id));
    if (relevantSlots.length === 0) return '';
    const first = relevantSlots[0];
    const last = relevantSlots[relevantSlots.length - 1];
    
    // Calculate total duration
    const [sh, sm] = first.start.split(':').map(Number);
    const [eh, em] = last.end.split(':').map(Number);
    if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;
      const diffMins = Math.max(0, endMins - startMins);
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      let dur = '';
      if (hrs > 0 && mins > 0) {
        dur = isMM ? `${hrs} နာရီ ${mins} မိနစ်` : `${hrs}h ${mins}m`;
      } else if (hrs > 0) {
        dur = isMM ? `${hrs} နာရီ` : `${hrs} hr${hrs > 1 ? 's' : ''}`;
      } else if (mins > 0) {
        dur = isMM ? `${mins} မိနစ်` : `${mins} mins`;
      }
      return dur ? `${first.start} - ${last.end} (${dur})` : `${first.start} - ${last.end}`;
    }
    return `${first.start} - ${last.end}`;
  };

  const subjectEmojis = [
    '📐', '💻', '🧪', '📚', '🔬', '🗣️', '💼', '⚽', '🎨', '🎵', '📝', '⚡', '🌐', '🏥', '☕', '🎯'
  ];

  const handleSelectEmoji = (emoji: string) => {
    const trimmed = name.trim();
    // Check if starts with an emoji
    const emojiMatch = trimmed.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})\s*(.*)$/u);
    if (emojiMatch) {
      setName(`${emoji} ${emojiMatch[2]}`);
    } else if (trimmed) {
      setName(`${emoji} ${trimmed}`);
    } else {
      setName(`${emoji} `);
    }
  };

  const handleSelectExistingSubject = (item: {
    name: string;
    color?: string;
    category?: 'work' | 'personal' | 'relationship';
    room?: string;
    instructor?: string;
    link?: string;
  }) => {
    setName(item.name);
    if (item.color) setColor(item.color);
    if (item.category) setCategory(item.category);
    if (item.room) setRoom(item.room);
    if (item.instructor) setInstructor(item.instructor);
    if (item.link) setLink(item.link);
    setTaskTitle(`${item.name}: Assignment`);
  };

  const colorPresets = [
    { bg: '#3b82f6', label: isMM ? 'အပြာရောင်' : 'Blue' },
    { bg: '#10b981', label: isMM ? 'မြစိမ်းရောင်' : 'Emerald' },
    { bg: '#8b5cf6', label: isMM ? 'ခရမ်းရောင်' : 'Purple' },
    { bg: '#f59e0b', label: isMM ? 'ရွှေဝါရောင်' : 'Amber' },
    { bg: '#ef4444', label: isMM ? 'အနီရောင်' : 'Red' },
    { bg: '#ec4899', label: isMM ? 'ပန်းရောင်' : 'Pink' },
    { bg: '#06b6d4', label: isMM ? 'မိုးပြာရောင်' : 'Cyan' },
    { bg: '#f97316', label: isMM ? 'လိမ္မော်ရောင်' : 'Orange' },
    { bg: '#6366f1', label: isMM ? 'မဲနယ်ရောင်' : 'Indigo' },
  ];

  const reminderOptions = [
    { value: 10, labelMM: '၁၀ မိနစ်ကြို (ပုံမှန်)', labelEN: '10m before (Default)' },
    { value: 5, labelMM: '၅ မိနစ်ကြို', labelEN: '5m before' },
    { value: 15, labelMM: '၁၅ မိနစ်ကြို', labelEN: '15m before' },
    { value: 30, labelMM: '၃၀ မိနစ်ကြို', labelEN: '30m before' },
    { value: 0, labelMM: 'အတန်းစချိန်ကွက်တိ', labelEN: 'At start' },
    { value: -1, labelMM: '🔕 သတိပေးချက်ပိတ်', labelEN: '🔕 Mute' },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      day: selectedDay,
      slotIds: selectedSlotIds.length > 0 ? selectedSlotIds : initialSlotIds,
      name: name.trim(),
      color,
      category,
      note: note.trim(),
      room: room.trim() || undefined,
      instructor: instructor.trim() || undefined,
      link: link.trim() || undefined,
      reminderOffset,
      relatedTaskTitle: addQuickTask && taskTitle.trim() ? taskTitle.trim() : undefined,
      relatedTaskDueDate: addQuickTask && taskDueDate ? taskDueDate : undefined
    });

    if (showDuplicateSection && targetDays.length > 0 && onDuplicateToDays) {
      onDuplicateToDays(selectedDay, targetDays, selectedSlotIds, {
        name: name.trim(),
        color,
        category,
        note: note.trim(),
        room: room.trim() || undefined,
        instructor: instructor.trim() || undefined,
        link: link.trim() || undefined,
        reminderOffset
      });
    }

    if (addQuickTask && taskTitle.trim() && onAddRelatedTask) {
      onAddRelatedTask(taskTitle.trim(), taskDueDate);
    }

    onClose();
  };

  const handleSelectAllWeekdays = () => {
    setTargetDays(['MON', 'TUE', 'WED', 'THU', 'FRI'].filter(d => d !== selectedDay) as DayCode[]);
  };

  return (
    <MacWindowFrame
      isOpen={isOpen}
      onClose={onClose}
      title={isMM ? 'အချိန်ဇယား / အစီအစဉ် ပြင်ဆင်ထည့်သွင်းခြင်း' : 'Edit Schedule & Class Activity'}
      icon={<CalendarCheck className="w-4 h-4 text-blue-500" />}
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Day Selector Tabs */}
        <div>
          <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1.5">
            {isMM ? 'ရက်သတ္တပတ် နေ့ရက် (Day)' : 'Select Day'}
          </label>
          <div className="grid grid-cols-7 gap-1">
            {days.map(d => {
              const isSelected = selectedDay === d.code;
              return (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => setSelectedDay(d.code)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-white shadow-md scale-105'
                      : 'bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)]'
                  }`}
                >
                  {d.labelEN}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots Multi-select with Consecutive Slot Presets */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
            <label className="text-xs font-bold text-[var(--color-text-secondary)]">
              {isMM ? 'အချိန်ကွက် ရွေးချယ်မှု (Time Slots)' : 'Select Time Slots'}
            </label>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                ⏰ {selectedSlotsTimeRange() || (isMM ? 'အချိန်ကွက် ရွေးပါ' : 'No slot selected')}
              </span>
            </div>
          </div>

          {/* Quick Consecutive Presets */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
              {isMM ? 'အမြန်ကွက်ဆက်:' : 'Quick Presets:'}
            </span>
            <button
              type="button"
              onClick={() => handleSelectConsecutiveSlots(1)}
              className="text-[10px] px-2 py-1 rounded-md bg-[var(--color-bg-input)] hover:bg-blue-500/20 text-[var(--color-text-secondary)] border border-[var(--color-border)] cursor-pointer font-bold transition-colors"
            >
              {isMM ? '⚡ ၁ ချိန်' : '⚡ 1 Slot'}
            </button>
            <button
              type="button"
              onClick={() => handleSelectConsecutiveSlots(2)}
              className="text-[10px] px-2 py-1 rounded-md bg-[var(--color-bg-input)] hover:bg-blue-500/20 text-[var(--color-text-secondary)] border border-[var(--color-border)] cursor-pointer font-bold transition-colors"
            >
              {isMM ? '⚡ ၂ ချိန်ဆက်' : '⚡ 2 Slots (Double)'}
            </button>
            <button
              type="button"
              onClick={() => handleSelectConsecutiveSlots(3)}
              className="text-[10px] px-2 py-1 rounded-md bg-[var(--color-bg-input)] hover:bg-blue-500/20 text-[var(--color-text-secondary)] border border-[var(--color-border)] cursor-pointer font-bold transition-colors"
            >
              {isMM ? '⚡ ၃ ချိန်ဆက်' : '⚡ 3 Slots (Triple)'}
            </button>
          </div>

          {/* Slot Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
            {sortedSlots.map(s => {
              const isChecked = selectedSlotIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSlotSelection(s.id)}
                  className={`p-2 rounded-lg text-left text-xs font-mono transition-all cursor-pointer border ${
                    isChecked
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                      : 'bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Slot {s.id}</span>
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <div className="text-[10px] opacity-90 truncate">{s.start}-{s.end}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Conflict Warning Banner */}
        {conflictingActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <span className="font-bold">{isMM ? 'သတိပြုရန်: ' : 'Notice: '}</span>
              <span>
                {isMM
                  ? `${conflictingActivities.map(a => `Slot ${a.slots.join(',')} တွင် "${a.name}"`).join('၊ ')} ရှိနှင့်ပြီးဖြစ်ပါသည်။ သိမ်းဆည်းပါက ၎င်းနေရာတွင် အစားထိုးထည့်သွင်းပါမည်။`
                  : `Overlaps with ${conflictingActivities.map(a => `"${a.name}" (Slot ${a.slots.join(',')})`).join(', ')}. Saving will replace it.`}
              </span>
            </div>
          </motion.div>
        )}

        {/* Subject / Activity Name with Emoji Picker */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[var(--color-text-secondary)]">
              {isMM ? 'ဘာသာရပ် / အစီအစဉ် အမည် (Activity / Subject Name)' : 'Activity / Subject Name'}
            </label>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
              {isMM ? 'သင်္ကေတနှိပ်၍ ထည့်နိုင်ပါသည်' : 'Tap emoji to prefix'}
            </span>
          </div>

          {/* Quick Subject Emojis */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-1.5 scrollbar-none">
            {subjectEmojis.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelectEmoji(emoji)}
                className="w-7 h-7 shrink-0 text-sm rounded-lg bg-[var(--color-bg-input)] hover:bg-blue-500/20 border border-[var(--color-border)] cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                title={`Add ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isMM ? 'ဥပမာ- 📐 Mathematics, 💻 Programming, Team Standup...' : 'e.g. 📐 Mathematics, 💻 Programming, Team Standup...'}
            required
            className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-sm font-bold text-[var(--color-text-primary)] focus:ring-2 focus:ring-blue-500 outline-hidden"
          />

          {/* Dynamic History/Existing Subjects Chips */}
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] flex items-center gap-1 self-center mr-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {isMM ? 'ရှိနှင့်ပြီး ဘာသာရပ်များ:' : 'Existing Subjects:'}
            </span>
            {existingSubjectHistory.slice(0, 8).map(item => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelectExistingSubject(item)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--color-bg-input)] hover:bg-blue-500/20 text-[var(--color-text-secondary)] border border-[var(--color-border)] cursor-pointer transition-all flex items-center gap-1.5 hover:scale-105"
                title={isMM ? `"${item.name}" အချက်အလက်များ အလိုအလျောက် ဖြည့်မည်` : `Autofill ${item.name}`}
              >
                {item.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />}
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Room / Location & Lecturer / Instructor Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{isMM ? 'အခန်း / အဆောက်အအုံ (Room / Building)' : 'Room / Location'}</span>
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder={isMM ? 'ဥပမာ- Room 302, Lab 2...' : 'e.g. Room 302, Lab 2...'}
              className="w-full p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-xs text-[var(--color-text-primary)] focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-1 mb-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isMM ? 'ဆရာ / ဆရာမ အမည် (Instructor)' : 'Instructor / Lecturer'}</span>
            </label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder={isMM ? 'ဥပမာ- Prof. Aung, Tr. Sarah...' : 'e.g. Prof. Aung, Tr. Sarah...'}
              className="w-full p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-xs text-[var(--color-text-primary)] focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Online Class / Meeting Link */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-blue-500" />
              <span>{isMM ? 'အွန်လိုင်းအတန်း / အစည်းအဝေးလင့်ခ် (Online Link)' : 'Online Meeting / Class Link'}</span>
            </label>
            {link.trim() && (
              <a
                href={link.startsWith('http') ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{isMM ? 'လင့်ခ် စမ်းသပ်ဖွင့်မည်' : 'Test Link'}</span>
              </a>
            )}
          </div>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://meet.google.com/... or Zoom link"
            className="w-full p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-xs text-[var(--color-text-primary)] focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1.5">
            {isMM ? 'ကဏ္ဍ / အမျိုးအစား (Category)' : 'Category'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'work', labelMM: '📚 Academic', labelEN: '📚 Academic' },
              { id: 'work', alt: 'job', labelMM: '💼 Work / Job', labelEN: '💼 Work / Job' },
              { id: 'personal', labelMM: '💡 Personal', labelEN: '💡 Personal' },
              { id: 'relationship', labelMM: '🤝 Social', labelEN: '🤝 Social' }
            ].map((cat, idx) => {
              const isSelected = category === cat.id && (idx !== 1 || category === 'work');
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`p-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                    category === cat.id
                      ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold'
                      : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{isMM ? cat.labelMM : cat.labelEN}</span>
                  {category === cat.id && <Check className="w-3.5 h-3.5 text-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Presets & Custom Picker */}
        <div>
          <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1.5">
            {isMM ? 'အရောင် သတ်မှတ်ချက် (Accent Color)' : 'Accent Color'}
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {colorPresets.map(c => (
              <button
                key={c.bg}
                type="button"
                onClick={() => setColor(c.bg)}
                style={{ backgroundColor: c.bg }}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center text-white shadow-xs ${
                  color.toLowerCase() === c.bg.toLowerCase() ? 'scale-125 ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-110'
                }`}
                title={c.label}
              >
                {color.toLowerCase() === c.bg.toLowerCase() && <Check className="w-3.5 h-3.5 drop-shadow-sm" />}
              </button>
            ))}
            <div className="flex items-center gap-1 ml-auto">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-lg border-none bg-transparent cursor-pointer"
                title="Custom color"
              />
              <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{color}</span>
            </div>
          </div>
        </div>

        {/* Custom Class Reminder Lead Time */}
        <div>
          <label className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-1 mb-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>{isMM ? 'အတန်းစတင်ချိန် သတိပေးချက် (Alert Lead Time)' : 'Class Alert Lead Time'}</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {reminderOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setReminderOffset(opt.value)}
                className={`p-1.5 rounded-lg text-center text-[11px] font-bold border transition-all cursor-pointer truncate ${
                  reminderOffset === opt.value
                    ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold shadow-xs'
                    : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-amber-400'
                }`}
              >
                {isMM ? opt.labelMM : opt.labelEN}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Assignment / Task Checklist Attachment */}
        <div className="p-3 rounded-xl bg-[var(--color-bg-input)]/80 border border-[var(--color-border)] space-y-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addQuickTask}
              onChange={(e) => {
                setAddQuickTask(e.target.checked);
                if (e.target.checked && !taskTitle.trim() && name.trim()) {
                  setTaskTitle(`${name.trim()}: Assignment`);
                }
              }}
              className="w-4 h-4 rounded text-blue-600 cursor-pointer accent-blue-600"
            />
            <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>{isMM ? 'ဤအတန်းအတွက် အိမ်စာ / Task တပါတည်း မှတ်သားမည်' : 'Attach Assignment / Task to this class'}</span>
            </span>
          </label>

          {addQuickTask && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[var(--color-border)]/50"
            >
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder={isMM ? 'အိမ်စာခေါင်းစဉ် ရေးပါ...' : 'Assignment / Task Title...'}
                  className="w-full p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text-primary)] focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text-primary)] focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Notes & Description */}
        <div>
          <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">
            {isMM ? 'မှတ်ချက် / အသေးစိတ် (Notes & Instructions)' : 'Notes & Details'}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={isMM ? 'စာမေးပွဲ၊ သင်ရိုး သို့မဟုတ် အရေးကြီး မှတ်သားဖွယ်ရာများ...' : 'Requirements, syllabus or important study notes...'}
            className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-xs text-[var(--color-text-primary)] focus:ring-2 focus:ring-blue-500 outline-hidden"
          />
        </div>

        {/* Optional Duplicate to Multiple Days Toggle */}
        <div className="pt-2 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setShowDuplicateSection(!showDuplicateSection)}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isMM ? 'အခြားနေ့ရက်များသို့ တစ်ပြိုင်နက် ကူးယူမည် (Duplicate to Days)' : 'Duplicate to other days'}</span>
          </button>

          {showDuplicateSection && (
            <div className="mt-2.5 p-3 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  {isMM ? 'ထည့်သွင်းလိုသော နေ့ရက်များ ရွေးပါ' : 'Select Target Days'}
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllWeekdays}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  {isMM ? '⚡ Mon-Fri ရွေးမည်' : '⚡ Mon-Fri'}
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.filter(d => d.code !== selectedDay).map(d => {
                  const isChecked = targetDays.includes(d.code);
                  return (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => {
                        if (isChecked) setTargetDays(targetDays.filter(td => td !== d.code));
                        else setTargetDays([...targetDays, d.code]);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                        isChecked
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {d.labelEN}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] sticky bottom-0 bg-[var(--color-bg-card)] py-2">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  audioAlert.triggerVibration('gentle');
                  onDelete(selectedDay, selectedSlotIds, name);
                  onClose();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  audioAlert.triggerVibration('gentle');
                  onDelete(selectedDay, selectedSlotIds, name);
                  onClose();
                }}
                className="min-h-[40px] px-3.5 py-2 bg-red-500/15 hover:bg-red-600 hover:text-white active:bg-red-700 text-red-600 dark:text-red-400 border border-red-500/30 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 touch-manipulation select-none shadow-xs"
                title={isMM ? 'အချိန်ဇယားမှ ဖျက်မည်' : 'Delete from timetable'}
              >
                <Trash2 className="w-4 h-4" />
                <span>{isMM ? 'ဖျက်မည်' : 'Delete'}</span>
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
              className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md flex items-center gap-1.5 hover:brightness-110"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isMM ? 'သိမ်းဆည်းမည်' : 'Save'}</span>
            </motion.button>
          </div>
        </div>
      </form>
    </MacWindowFrame>
  );
};

