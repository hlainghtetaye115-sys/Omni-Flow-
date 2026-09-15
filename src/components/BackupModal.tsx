import React, { useState } from 'react';
import {
  Cloud, Download, Upload, Bell, CheckCircle2, AlertCircle,
  Copy, RefreshCw, ShieldCheck, X, FileText, Key, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { Preferences } from '../types';
import { reminderService } from '../utils/reminderService';
import {
  downloadBackupJSON,
  generateBackupBase64,
  importAppBackup,
  restoreFromBase64
} from '../utils/cloudBackup';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: Preferences;
  showAlert: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onReloadState: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  preferences,
  showAlert,
  onReloadState
}) => {
  const isMM = preferences.lang === 'my';
  const [notificationStatus, setNotificationStatus] = useState(reminderService.getPermissionStatus());
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleRequestNotification = async () => {
    const granted = await reminderService.requestPermission();
    setNotificationStatus(reminderService.getPermissionStatus());
    if (granted) {
      showAlert(isMM ? 'သတိပေးချက်စနစ် ဖွင့်လှစ်ပြီးပါပြီ' : 'Notifications enabled successfully!', 'success');
    } else {
      showAlert(isMM ? 'သတိပေးချက် ဖွင့်ခွင့် မရရှိပါ' : 'Notification permission was denied.', 'warning');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const payload = JSON.parse(content);
        const success = importAppBackup(payload);
        if (success) {
          showAlert(isMM ? 'အချက်အလက်များ ပြန်လည် ထည့်သွင်းပြီးပါပြီ (Restore Success)' : 'Data restored successfully!', 'success');
          onReloadState();
          onClose();
        } else {
          showAlert(isMM ? 'Backup ဖိုင် ပုံစံ မမှန်ကန်ပါ' : 'Invalid backup file structure.', 'error');
        }
      } catch (err) {
        showAlert(isMM ? 'ဖိုင်ဖတ်ရာတွင် အမှားအယွင်းရှိပါသည်' : 'Error reading backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreFromCode = () => {
    if (!syncCodeInput.trim()) return;
    const success = restoreFromBase64(syncCodeInput);
    if (success) {
      showAlert(isMM ? 'Code ဖြင့် အချက်အလက်များ ပြန်လည် ရရှိပါပြီ!' : 'Restored from Sync Code successfully!', 'success');
      onReloadState();
      onClose();
    } else {
      showAlert(isMM ? 'Sync Code မမှန်ကန်ပါ' : 'Invalid Sync Code provided.', 'error');
    }
  };

  const handleCopyCode = () => {
    const code = generateBackupBase64();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showAlert(isMM ? 'Sync Code ကို Copy ကူးလိုက်ပါပြီ' : 'Copied Sync Code to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative overflow-hidden"
      >
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[var(--color-text-primary)] flex items-center gap-2">
                <span>{isMM ? 'Cloud Sync & သတိပေးချက်စနစ်' : 'Cloud Backup & Notifications'}</span>
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-mono">
                {isMM ? '၁၀ မိနစ်ကြို သတိပေးချက်နှင့် အချက်အလက် Backup စနစ်' : 'Smart 10-min reminders & Data sync'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--color-bg-input)] hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-xs">
          {/* 1. Smart Notification Permission Box */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/30 rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                    {isMM ? '၁၀ မိနစ်ကြို သတိပေးချက် (Push Reminder)' : '10-Min Pre-Class & Shift Alert'}
                  </h4>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                    {isMM
                      ? 'အတန်း သို့မဟုတ် အလုပ်ဆင်းချိန် မစတင်မီ ၁၀ မိနစ်အလိုတွင် ဘရောက်ဇာမှ အလိုအလျောက် သတိပေးမည်။'
                      : 'Automatically notifies you 10 minutes before class or work shift starts.'}
                  </p>
                </div>
              </div>

              {notificationStatus === 'granted' ? (
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] rounded-full flex items-center gap-1 flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                </span>
              ) : (
                <button
                  onClick={handleRequestNotification}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all flex items-center gap-1 flex-shrink-0 shadow-sm"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isMM ? 'ဖွင့်မည်' : 'Enable'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Cloud Export / Import File Section */}
          <div className="p-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl space-y-3">
            <h4 className="font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>{isMM ? '၁-ချက်နှိပ် အချက်အလက် Backup ဖိုင်ယူမည်' : '1-Click JSON Backup File'}</span>
            </h4>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={downloadBackupJSON}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{isMM ? 'Backup JSON ဖိုင် ဒေါင်းလုဒ်ဆွဲမည်' : 'Download Backup (.json)'}</span>
              </button>

              <label className="flex-1 py-2.5 px-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-emerald-500 text-[var(--color-text-primary)] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>{isMM ? 'Backup ဖိုင် ပြန်ထည့်မည် (Restore)' : 'Upload Backup (.json)'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 3. Base64 Sync Code Transfer Section */}
          <div className="p-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl space-y-3">
            <h4 className="font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-500" />
              <span>{isMM ? 'Sync Code ဖြင့် ဖုန်း/ကွန်ပျူတာ အချင်းချင်း ကူးပြောင်းမည်' : 'Transfer via Sync Code'}</span>
            </h4>

            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="px-3 py-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? (isMM ? 'ကူးပြီးပါပြီ!' : 'Copied!') : (isMM ? 'Sync Code ကူးမည်' : 'Copy Sync Code')}</span>
              </button>

              <input
                type="text"
                placeholder={isMM ? 'Sync Code ကို ဤနေရာတွင် Paste လုပ်ပါ...' : 'Paste Sync Code here...'}
                value={syncCodeInput}
                onChange={(e) => setSyncCodeInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500 font-mono"
              />

              <button
                onClick={handleRestoreFromCode}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isMM ? 'Restore' : 'Restore'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            {isMM ? 'အချက်အလက်များကို မိမိစက်ထဲတွင်သာ လုံခြုံစွာ သိမ်းဆည်းထားပါသည်' : 'Your data stays encrypted & local'}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[var(--color-bg-input)] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-[var(--color-text-primary)] font-bold cursor-pointer"
          >
            {isMM ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
