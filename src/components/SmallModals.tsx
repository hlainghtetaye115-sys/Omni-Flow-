
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
export const NotesModal: React.FC<{isOpen: boolean; subjectTitle: string; daySlotText: string; notesText: string; onClose: () => void; onNotesChange: any; onSave: () => void}> = ({ isOpen, subjectTitle, daySlotText, notesText, onClose, onNotesChange, onSave }) => (
  <MacWindowFrame isOpen={isOpen} onClose={onClose} title={'Notes: ' + subjectTitle}>
    <textarea value={notesText} onChange={(e) => onNotesChange(e.target.value)} className="w-full min-h-[150px] p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type here..." />
    <div className="mt-3 flex justify-end"><button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Save</button></div>
  </MacWindowFrame>
);

export const EditNameModal: React.FC<{isOpen: boolean; onClose: () => void; nameVal: string; onNameChange: any; onSave: () => void}> = ({ isOpen, onClose, nameVal, onNameChange, onSave }) => (
  <MacWindowFrame isOpen={isOpen} onClose={onClose} title="Edit User Name">
    <input type="text" value={nameVal} onChange={(e) => onNameChange(e.target.value)} className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)]" />
    <div className="mt-3 flex justify-end"><button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Save</button></div>
  </MacWindowFrame>
);

export const BulkAddModal: React.FC<{isOpen: boolean; onClose: () => void; startTime: string; endTime: string; duration: number; count: number; prefix: string; onChange: any; onGenerate: () => void}> = ({ isOpen, onClose, startTime, endTime, duration, count, prefix, onChange, onGenerate }) => {
  return (
    <MacWindowFrame isOpen={isOpen} onClose={onClose} title="Bulk Add Slots">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="text-xs">Start Time</label><input type="text" value={startTime} onChange={(e)=>onChange('startTime', e.target.value)} className="w-full p-2 rounded bg-[var(--color-bg-input)]"/></div>
        <div><label className="text-xs">Duration (m)</label><input type="number" value={duration} onChange={(e)=>onChange('duration', Number(e.target.value))} className="w-full p-2 rounded bg-[var(--color-bg-input)]"/></div>
        <div><label className="text-xs">Count</label><input type="number" value={count} onChange={(e)=>onChange('count', Number(e.target.value))} className="w-full p-2 rounded bg-[var(--color-bg-input)]"/></div>
      </div>
      <button onClick={() => { onGenerate(); onClose(); }} className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold">Generate</button>
    </MacWindowFrame>
  );
};

export const NotificationModal: React.FC<{isOpen: boolean; onClose: () => void; notifications: any[]; onClear: () => void}> = ({ isOpen, onClose, notifications, onClear }) => (
  <MacWindowFrame isOpen={isOpen} onClose={onClose} title="Notifications">
    {notifications.length === 0 ? <p className="text-center py-4 text-sm text-[var(--color-text-muted)]">No notifications</p> : 
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {notifications.map((n, i) => <div key={i} className="p-2 bg-[var(--color-bg-input)] rounded-lg text-sm">{n.message}</div>)}
      </div>
    }
    {notifications.length > 0 && <button onClick={onClear} className="mt-4 w-full py-2 bg-red-500 text-white rounded-xl font-bold">Clear All</button>}
  </MacWindowFrame>
);
