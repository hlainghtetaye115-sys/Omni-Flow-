
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
  onGoogleLoginSuccess?: (user: any) => void;
  onGoogleLogin?: () => void;
  onEmailLogin: (email: string, displayName?: string, password?: string, photoURL?: string | null) => void;
  lang: 'my' | 'en';
}> = ({ isOpen, onClose, onGoogleLogin, onEmailLogin, lang }) => {
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setLoginNotice(lang === 'my' ? 'ကျေးဇူးပြု၍ မှန်ကန်သော Gmail (သို့) Email ထည့်သွင်းပါ' : 'Please enter a valid Gmail or email address.');
      return;
    }
    if (passwordInput.length < 6) {
      setLoginNotice(lang === 'my' ? 'စကားဝှက်သည် အနည်းဆုံး အက္ခရာ ၆ လုံး ရှိရပါမည်။' : 'Password must be at least 6 characters.');
      return;
    }
    onEmailLogin(emailInput, nameInput || emailInput.split('@')[0], passwordInput, null);
    setEmailInput('');
    setNameInput('');
    setPasswordInput('');
    onClose();
  };
  
  return (
    <MacWindowFrame isOpen={isOpen} onClose={onClose} title={lang === 'my' ? 'Google Account ချိတ်ဆက်မည်' : 'Connect Google Account'}>
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/25 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center p-2 flex-shrink-0">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                {lang === 'my' ? 'Google Account ဖြင့် ဝင်ရောက်မည်' : 'Sign in with Google'}
              </h4>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                {lang === 'my' ? 'သင်၏ကိုယ်ပိုင် Gmail အကောင့်ဖြင့် cloud backup သိမ်းဆည်းရန် ချိတ်ဆက်ပါ' : 'Connect with your personal Gmail account for cloud backup.'}
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={() => onGoogleLogin && onGoogleLogin()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 px-4 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mb-4"
          >
            <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{lang === 'my' ? 'Google Popup ဖြင့် ချိတ်ဆက်မည်' : 'Continue with Google Popup'}</span>
          </motion.button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[var(--color-border)]"></div>
            <span className="flex-shrink mx-4 text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{lang === 'my' ? 'သို့မဟုတ် ကိုယ်ပိုင် Gmail ဖြင့်' : 'Or with Personal Gmail'}</span>
            <div className="flex-grow border-t border-[var(--color-border)]"></div>
          </div>

          <form onSubmit={handleManualLogin} className="mt-3 space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-primary)] mb-1">
                {lang === 'my' ? 'သင်၏ Gmail လိပ်စာ' : 'Your Gmail Address'}
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-3 py-2 text-xs bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-primary)] mb-1">
                {lang === 'my' ? 'အမည် (သို့) နာမည်ပြေ' : 'Display Name (Optional)'}
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Mg Mg"
                className="w-full px-3 py-2 text-xs bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-primary)] mb-1">
                {lang === 'my' ? 'စကားဝှက်' : 'Password'}
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={lang === 'my' ? 'အနည်းဆုံး ၆ လုံး' : 'At least 6 characters'}
                minLength={6}
                autoComplete="current-password"
                className="w-full px-3 py-2 text-xs bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{lang === 'my' ? 'ဒီ Gmail ဖြင့် Cloud Backup ချိတ်မည်' : 'Connect this Gmail for Cloud Backup'}</span>
            </button>
          </form>
        </div>

        {loginNotice && (
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-2 leading-tight">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{loginNotice}</span>
          </div>
        )}
      </div>
    </MacWindowFrame>
  );
};

