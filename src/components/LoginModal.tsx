
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
export const LoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin?: () => void;
  lang: 'my' | 'en';
}> = ({ isOpen, onClose, onGoogleLogin, lang }) => {
  return (
    <MacWindowFrame isOpen={isOpen} onClose={onClose} title={lang === 'my' ? 'Google Account ချိတ်ဆက်မည်' : 'Connect Google Account'}>
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/25 rounded-2xl p-5 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center p-2 shrink-0">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                {lang === 'my' ? 'Google Account ဖြင့် ဝင်ရောက်ရန်' : 'Sign in with Google'}
              </h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-normal">
                {lang === 'my' 
                  ? 'သင့် Gmail အကောင့်ကို အသုံးပြုပြီး Cloud Backup သိမ်းဆည်းရန် တိုက်ရိုက်ချိတ်ဆက်ပါ။ စကားဝှက် ထပ်မံမှတ်သားထားစရာ မလိုဘဲ တစ်ချက်နှိပ်ရုံဖြင့် လုံခြုံစွာ အကောင့်ဝင်ရောက်နိုင်ပါသည်။' 
                  : 'Connect with your Google account. We will securely synchronize your schedules. Fast, secure, and no custom passwords to memorize.'}
              </p>
            </div>
          </div>
          
          <motion.button
            type="button"
            onClick={() => onGoogleLogin && onGoogleLogin()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 px-4 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2.5"
          >
            <svg className="w-4.5 h-4.5 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{lang === 'my' ? 'Google Account ဖြင့် တစ်ချက်နှိပ်ချိတ်ဆက်မည်' : 'Continue with Google Account'}</span>
          </motion.button>
        </div>
      </div>
    </MacWindowFrame>
  );
};

