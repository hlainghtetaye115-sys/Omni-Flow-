import React, { useState } from 'react';
import { Plus, X, CircleDot, PenSquare, CheckCircle, Calendar, Clock, Bell, AlertTriangle, Filter, Tag, Check, Trash2 } from 'lucide-react';
import { Preferences, ImportantEvent } from '../types';
import { TRANSLATIONS } from '../data/defaultData';
import confetti from 'canvas-confetti';

interface TasksTabProps {
  preferences: Preferences;
  tasks: string[];
  events?: ImportantEvent[];
  onAddTask: (text: string) => void;
  onDeleteTask: (index: number) => void;
  onAddEvent?: (event: Omit<ImportantEvent, 'id' | 'createdAt' | 'completed'>) => void;
  onToggleEvent?: (id: string) => void;
  onDeleteEvent?: (id: string) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  preferences,
  tasks,
  events = [],
  onAddTask,
  onDeleteTask,
  onAddEvent,
  onToggleEvent,
  onDeleteEvent
}) => {
  const t = TRANSLATIONS[preferences.lang];
  const [quickInputVal, setQuickInputVal] = useState('');

  // Important Event Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(todayStr);
  const [eventTime, setEventTime] = useState('09:00');
  const [eventCategory, setEventCategory] = useState<'exam' | 'assignment' | 'deadline' | 'meeting' | 'other'>('exam');
  const [eventPriority, setEventPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [eventAlertOffset, setEventAlertOffset] = useState<number>(1440); // default 1 day before
  const [eventNote, setEventNote] = useState('');

  // Filter tab state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'upcoming' | 'completed' | 'all'>('upcoming');

  const handleQuickAdd = () => {
    if (!quickInputVal.trim()) return;
    onAddTask(quickInputVal.trim());
    setQuickInputVal('');
  };

  const handleQuickComplete = (idx: number) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#f59e0b']
    });
    onDeleteTask(idx);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    if (onAddEvent) {
      onAddEvent({
        title: eventTitle.trim(),
        date: eventDate,
        time: eventTime,
        category: eventCategory,
        priority: eventPriority,
        alertOffset: Number(eventAlertOffset),
        note: eventNote.trim()
      });
    }
    setEventTitle('');
    setEventNote('');
    setIsAddingEvent(false);
  };

  // Calculate time remaining / countdown
  const getCountdownLabel = (dateStr: string, timeStr: string) => {
    const target = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();

    if (diffMs < 0) {
      const pastMins = Math.abs(Math.floor(diffMs / (1000 * 60)));
      if (pastMins < 60) return { text: `Overdue by ${pastMins}m`, color: 'bg-red-500/20 text-red-600 border-red-500/30' };
      const pastHours = Math.floor(pastMins / 60);
      if (pastHours < 24) return { text: `Overdue by ${pastHours}h`, color: 'bg-red-500/20 text-red-600 border-red-500/30' };
      const pastDays = Math.floor(pastHours / 24);
      return { text: `Overdue by ${pastDays}d`, color: 'bg-red-500/20 text-red-600 border-red-500/30' };
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return { text: `Due in ${diffMins}m`, color: 'bg-amber-500/20 text-amber-600 border-amber-500/30 font-bold' };
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return { text: `Due in ${diffHours}h`, color: 'bg-amber-500/20 text-amber-600 border-amber-500/30 font-bold' };

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return { text: `Tomorrow at ${timeStr}`, color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' };
    return { text: `In ${diffDays} days (${dateStr})`, color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' };
  };

  const getAlertLabel = (offset: number) => {
    switch (offset) {
      case 0: return t.alertExact;
      case 15: return t.alert15m;
      case 60: return t.alert1h;
      case 180: return t.alert3h;
      case 1440: return t.alert1d;
      case 2880: return t.alert2d;
      default: return `${offset}m before`;
    }
  };

  const filteredEvents = events.filter(e => {
    if (filterStatus === 'upcoming' && e.completed) return false;
    if (filterStatus === 'completed' && !e.completed) return false;
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    return true;
  }).sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time}`).getTime();
    const timeB = new Date(`${b.date}T${b.time}`).getTime();
    return timeA - timeB;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Important Events & Deadlines Section */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4 border-b border-[var(--color-border)] pb-3">
          <div className="font-bold text-base text-[var(--color-primary)] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
            <span>{t.titleImportantEvents}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingEvent(!isAddingEvent)}
            className="px-3.5 py-2 bg-[var(--color-primary)] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[var(--color-primary-dark)] transition-all flex items-center gap-1.5 shadow-sm"
          >
            {isAddingEvent ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddingEvent ? t.btnCancel : t.lblAddEvent}</span>
          </button>
        </div>

        {/* Add Event Form Modal / Expandable */}
        {isAddingEvent && (
          <form onSubmit={handleSaveEvent} className="bg-[var(--color-bg-input)] p-4 rounded-xl border border-[var(--color-border)] mb-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{t.lblAddEvent}</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">{t.lblEventTitle}</label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Physics Final Exam, Assignment 2, Project Due..."
                className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm font-semibold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">{t.lblEventDate}</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs font-mono text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">{t.lblEventTime}</label>
                <input
                  type="time"
                  required
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs font-mono text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">{t.lblEventCategory}</label>
                <select
                  value={eventCategory}
                  onChange={(e: any) => setEventCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="exam">{t.catExam}</option>
                  <option value="assignment">{t.catAssignment}</option>
                  <option value="deadline">{t.catDeadline}</option>
                  <option value="meeting">{t.catMeeting}</option>
                  <option value="other">{t.catOther}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">{t.lblPriority}</label>
                <select
                  value={eventPriority}
                  onChange={(e: any) => setEventPriority(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-bold"
                >
                  <option value="high">{t.prioHigh}</option>
                  <option value="medium">{t.prioMed}</option>
                  <option value="low">{t.prioLow}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">{t.lblAdvanceAlert}</label>
                <select
                  value={eventAlertOffset}
                  onChange={(e) => setEventAlertOffset(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                >
                  <option value={0}>{t.alertExact}</option>
                  <option value={15}>{t.alert15m}</option>
                  <option value={60}>{t.alert1h}</option>
                  <option value={180}>{t.alert3h}</option>
                  <option value={1440}>{t.alert1d}</option>
                  <option value={2880}>{t.alert2d}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Notes / Room Location (မှတ်စု/အခန်းအမှတ်)</label>
              <input
                type="text"
                value={eventNote}
                onChange={(e) => setEventNote(e.target.value)}
                placeholder="e.g. Room 102, Online Zoom, Bring scientific calculator..."
                className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingEvent(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
              >
                {t.btnCancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-dark)]"
              >
                {t.btnSave}
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-[var(--color-bg-input)] p-1 rounded-xl border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setFilterStatus('upcoming')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterStatus === 'upcoming'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Upcoming ({events.filter(e => !e.completed).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterStatus === 'completed'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Completed ({events.filter(e => e.completed).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              All ({events.length})
            </button>
          </div>

          <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg p-1 text-xs focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="exam">Exams</option>
              <option value="assignment">Assignments</option>
              <option value="deadline">Deadlines</option>
              <option value="meeting">Meetings</option>
              <option value="other">Others</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-2.5">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-input)]/50 rounded-xl border border-dashed border-[var(--color-border)]">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--color-text-muted)]" />
              <p className="font-semibold">No important events found.</p>
              <p className="text-[10px] mt-0.5">Click "+ {t.lblAddEvent}" to add exam dates or assignment deadlines with advance alerts.</p>
            </div>
          ) : (
            filteredEvents.map(evt => {
              const countdown = getCountdownLabel(evt.date, evt.time);
              const priorityBorder = evt.priority === 'high' ? 'border-l-red-500' : evt.priority === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500';

              return (
                <div
                  key={evt.id}
                  className={`p-3.5 bg-[var(--color-bg-input)] rounded-xl border-l-4 ${priorityBorder} border-y border-r border-[var(--color-border)] transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    evt.completed ? 'opacity-50 line-through' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[var(--color-text-primary)]">{evt.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border font-bold ${countdown.color}`}>
                        {countdown.text}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] uppercase">
                        {evt.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] font-mono flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        {evt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        {evt.time}
                      </span>
                      <span className="flex items-center gap-1 text-[var(--color-primary)] font-semibold">
                        <Bell className="w-3.5 h-3.5" />
                        {getAlertLabel(evt.alertOffset)}
                      </span>
                    </div>

                    {evt.note && (
                      <p className="text-xs text-[var(--color-text-secondary)] italic pt-0.5">
                        📝 {evt.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {onToggleEvent && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!evt.completed) {
                            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
                          }
                          onToggleEvent(evt.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          evt.completed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>{evt.completed ? 'Done' : 'Mark Done'}</span>
                      </button>
                    )}

                    {onDeleteEvent && (
                      <button
                        type="button"
                        onClick={() => onDeleteEvent(evt.id)}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg cursor-pointer transition-all"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Daily Tasks Section */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="font-bold text-base text-[var(--color-primary)] mb-3 flex items-center gap-2">
          <PenSquare className="w-5 h-5" />
          <span>{t.titleTasksReminders} (နေ့စဉ် ရိုးရှင်း လုပ်ငန်းစဉ်များ)</span>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={quickInputVal}
            onChange={(e) => setQuickInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            placeholder={t.taskInputPlaceholder}
            className="flex-1 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder-[var(--color-text-muted)] font-mono"
          />
          <button
            onClick={handleQuickAdd}
            className="px-4 py-3 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-[var(--color-primary-dark)] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> {t.btnAddTask}
          </button>
        </div>

        <ul className="list-none space-y-2">
          {tasks.length === 0 ? (
            <li className="text-center py-4 text-xs text-[var(--color-text-muted)]">No quick daily tasks added yet.</li>
          ) : (
            tasks.map((task, idx) => (
              <li key={idx} className="flex items-center justify-between p-3 bg-[var(--color-bg-input)] rounded-xl border-l-4 border-[var(--color-primary)] text-sm transition-all hover:translate-x-1 shadow-sm">
                <span className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium font-mono">
                  <CircleDot className="w-4 h-4 text-[var(--color-primary)]" />
                  {task}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleQuickComplete(idx)}
                    className="bg-transparent border border-transparent text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 p-1.5 rounded-full cursor-pointer transition-all"
                    title="Mark as Done"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(idx)}
                    className="bg-transparent border border-transparent text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-500/30 p-1.5 rounded-full cursor-pointer transition-all"
                    title="Delete"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};
