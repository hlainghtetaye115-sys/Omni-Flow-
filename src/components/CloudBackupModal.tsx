import React, { useState, useEffect } from 'react';
import {
  Cloud, Download, Upload, Trash2, CheckCircle2, RotateCcw,
  Sparkles, ShieldCheck, Database, HardDrive, Bell, Volume2, RefreshCw, FileText,
  Smartphone, User, ArrowRight, Shield, AlertCircle
} from 'lucide-react';
import { MacWindowFrame } from './Modals';
import { Preferences, CloudBackupSnapshot } from '../types';
import { backupService, CompleteAppData } from '../utils/backupService';
import { notificationService } from '../utils/notificationService';

interface CloudBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: Preferences;
  fullAppData: CompleteAppData;
  activeUser?: { uid: string; email?: string; displayName?: string; photoURL?: string | null } | null;
  onOpenLoginModal?: () => void;
  onForceCloudBackup?: () => Promise<boolean>;
  onForceCloudRestore?: () => Promise<boolean>;
  lastCloudSyncTime?: string | null;
  isCloudSyncing?: boolean;
  onRestoreData: (restoredData: CompleteAppData) => void;
  showAlert: (msg: string, type: 'success' | 'warning' | 'danger') => void;
}

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({
  isOpen,
  onClose,
  preferences,
  fullAppData,
  activeUser,
  onOpenLoginModal,
  onForceCloudBackup,
  onForceCloudRestore,
  lastCloudSyncTime,
  isCloudSyncing = false,
  onRestoreData,
  showAlert
}) => {
  const isMM = preferences.lang === 'my';
  const [snapshots, setSnapshots] = useState<CloudBackupSnapshot[]>([]);
  const [isLocalSyncing, setIsLocalSyncing] = useState(false);
  const [isBackingUpCloud, setIsBackingUpCloud] = useState(false);
  const [isRestoringCloud, setIsRestoringCloud] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>('default');

  useEffect(() => {
    if (isOpen) {
      setSnapshots(backupService.getSnapshots());
      if ('Notification' in window) {
        setNotifPermission(Notification.permission);
      }
    }
  }, [isOpen]);

  const handleManualCloudBackup = async () => {
    if (!activeUser) {
      if (onOpenLoginModal) {
        onClose();
        onOpenLoginModal();
      }
      return;
    }
    if (onForceCloudBackup) {
      setIsBackingUpCloud(true);
      await onForceCloudBackup();
      setIsBackingUpCloud(false);
    }
  };

  const handleManualCloudRestore = async () => {
    if (!activeUser) {
      if (onOpenLoginModal) {
        onClose();
        onOpenLoginModal();
      }
      return;
    }
    if (onForceCloudRestore) {
      setIsRestoringCloud(true);
      const success = await onForceCloudRestore();
      setIsRestoringCloud(false);
      if (success) {
        onClose();
      }
    }
  };

  const handleCreateSnapshot = () => {
    setIsLocalSyncing(true);
    setTimeout(() => {
      const snap = backupService.createSnapshot(fullAppData, isMM ? `Manual Backup (${new Date().toLocaleTimeString('my-MM')})` : undefined);
      setSnapshots(backupService.getSnapshots());
      setIsLocalSyncing(false);
      showAlert(isMM ? 'Data များကို Backup Snapshot အဖြစ် သိမ်းဆည်းပြီးပါပြီ ✅' : 'Backup snapshot created successfully! ✅', 'success');
      notificationService.playChime('success');
    }, 600);
  };

  const handleDownloadFile = () => {
    backupService.downloadBackupJSON(fullAppData);
    showAlert(isMM ? 'Backup JSON ဖိုင်ကို Download ပြုလုပ်ပြီးပါပြီ 📥' : 'Backup JSON file downloaded! 📥', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          onRestoreData(parsed);
          showAlert(isMM ? 'Backup ဖိုင်မှ အချက်အလက်များ အောင်မြင်စွာ ပြန်လည်ရယူပြီးပါပြီ 🎉' : 'Data restored successfully from backup file! 🎉', 'success');
          notificationService.playChime('success');
          onClose();
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        showAlert(isMM ? 'ဖိုင်ပုံစံ မှားယွင်းနေပါသည်။ တရားဝင် OmniFlow JSON ဖိုင်သာ ရွေးပါ' : 'Invalid backup JSON file format!', 'danger');
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreSnapshot = (snap: CloudBackupSnapshot) => {
    try {
      const parsed = JSON.parse(snap.rawData);
      onRestoreData(parsed);
      showAlert(isMM ? 'အချက်အလက်များ အောင်မြင်စွာ Restore လုပ်ပြီးပါပြီ ✅' : 'Snapshot restored successfully! ✅', 'success');
      notificationService.playChime('success');
      onClose();
    } catch {
      showAlert(isMM ? 'Restore လုပ်ရာတွင် အမှားဖြစ်ပွားပါသည်' : 'Failed to restore snapshot', 'danger');
    }
  };

  const handleDeleteSnapshot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    backupService.deleteSnapshot(id);
    setSnapshots(backupService.getSnapshots());
    showAlert(isMM ? 'Snapshot ဖျက်ပြီးပါပြီ' : 'Snapshot deleted', 'warning');
  };

  // Count summary
  const classCount = fullAppData?.dataChart ? Object.values(fullAppData.dataChart).reduce((acc, row) => acc + Object.keys(row || {}).length, 0) : 0;
  const shiftCount = fullAppData?.workShifts?.length || 0;
  const habitCount = fullAppData?.habits?.length || 0;
  const eventCount = fullAppData?.events?.length || 0;
  const txCount = fullAppData?.transactions?.length || 0;

  return (
    <MacWindowFrame
      isOpen={isOpen}
      onClose={onClose}
      title={isMM ? 'Google Cloud Backup & အချက်အလက်များ ပြန်လည်ရယူခြင်း' : 'Google Cloud Backup & Data Sync'}
      maxWidthClass="max-w-2xl"
      icon={<Cloud className="w-4 h-4 text-blue-500" />}
    >
      <div className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">
        {/* SECTION 1: GOOGLE CLOUD SYNC CARD */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-purple-600/10 border border-blue-500/30 rounded-2xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#4285F4] text-white flex items-center justify-center shadow-md flex-shrink-0">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-[var(--color-text-primary)]">
                    {isMM ? 'Google Account Cloud Backup' : 'Google Cloud Backup & Sync'}
                  </h4>
                  {activeUser ? (
                    <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isMM ? 'ချိတ်ဆက်ထားသည်' : 'Connected'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
                      {isMM ? 'Account ချိတ်ရန်လို' : 'Not Connected'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {activeUser ? (
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{activeUser.email}</span>
                  ) : (
                    <span>{isMM ? 'Gmail Account ထည့်သွင်းထားပါက ဖုန်းပြောင်းလျှင် အချက်အလက်များ အလိုအလျောက် ပြန်ပါလာပါမည်' : 'Sign in with Gmail to sync timetable across all devices automatically.'}</span>
                  )}
                </p>
              </div>
            </div>

            {!activeUser && onOpenLoginModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLoginModal();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all flex-shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>{isMM ? 'Google အကောင့် ချိတ်မည်' : 'Connect Account'}</span>
              </button>
            )}
          </div>

          {/* Backup Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            <div className="p-2.5 bg-[var(--color-bg-card)]/80 border border-[var(--color-border)] rounded-xl text-center">
              <div className="text-[10px] text-[var(--color-text-muted)]">{isMM ? 'အတန်းချိန်များ' : 'Classes'}</div>
              <div className="text-sm font-black text-[var(--color-primary)]">{classCount}</div>
            </div>
            <div className="p-2.5 bg-[var(--color-bg-card)]/80 border border-[var(--color-border)] rounded-xl text-center">
              <div className="text-[10px] text-[var(--color-text-muted)]">{isMM ? 'အလုပ်ဆိုင်းများ' : 'Work Shifts'}</div>
              <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">{shiftCount}</div>
            </div>
            <div className="p-2.5 bg-[var(--color-bg-card)]/80 border border-[var(--color-border)] rounded-xl text-center">
              <div className="text-[10px] text-[var(--color-text-muted)]">{isMM ? 'ငွေစာရင်းများ' : 'Transactions'}</div>
              <div className="text-sm font-black text-amber-500">{txCount}</div>
            </div>
            <div className="p-2.5 bg-[var(--color-bg-card)]/80 border border-[var(--color-border)] rounded-xl text-center">
              <div className="text-[10px] text-[var(--color-text-muted)]">{isMM ? 'အလေ့အကျင့်များ' : 'Habits'}</div>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">{habitCount}</div>
            </div>
            <div className="p-2.5 bg-[var(--color-bg-card)]/80 border border-[var(--color-border)] rounded-xl text-center">
              <div className="text-[10px] text-[var(--color-text-muted)]">{isMM ? 'အစီအစဉ်များ' : 'Events'}</div>
              <div className="text-sm font-black text-purple-600 dark:text-purple-400">{eventCount}</div>
            </div>
          </div>

          {/* Action Buttons for Cloud Backup and Cloud Restore */}
          {activeUser && (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleManualCloudBackup}
                disabled={isBackingUpCloud || isCloudSyncing}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
              >
                <Cloud className={`w-4 h-4 ${isBackingUpCloud ? 'animate-bounce' : ''}`} />
                <span>{isBackingUpCloud ? (isMM ? 'Cloud သို့ သိမ်းဆည်းနေပါသည်...' : 'Backing up to Cloud...') : (isMM ? '☁️ Cloud သို့ ချက်ချင်း Backup သိမ်းမည်' : 'Backup to Cloud Now')}</span>
              </button>

              <button
                onClick={handleManualCloudRestore}
                disabled={isRestoringCloud || isCloudSyncing}
                className="flex-1 py-2.5 px-4 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-input)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 text-emerald-500 ${isRestoringCloud ? 'animate-spin' : ''}`} />
                <span>{isRestoringCloud ? (isMM ? 'Cloud မှ ပြန်လည်ရယူနေသည်...' : 'Restoring from Cloud...') : (isMM ? '📥 Cloud မှ အချက်အလက်များ ပြန်ယူမည်' : 'Restore from Cloud')}</span>
              </button>
            </div>
          )}

          {/* How to Switch Phones Guidance */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-[var(--color-text-secondary)] space-y-1.5 leading-relaxed">
            <div className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 text-xs">
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              <span>{isMM ? '📱 ဖုန်းပြောင်းလျှင် အချက်အလက်များ ပြန်လည်ရယူနည်း:' : '📱 Switching Phones or Devices:'}</span>
            </div>
            <p className="text-[11px]">
              {isMM
                ? `ဖုန်းအသစ် (သို့) အခြားကွန်ပျူတာတွင် ဤအက်ပ်ကို ဖွင့်ပြီး သင့် Gmail (${activeUser?.email || 'မိမိ Gmail အကောင့်'}) ကို ရိုက်ထည့်လိုက်ရုံဖြင့် သင်၏ အချိန်ဇယား၊ အလုပ်ဆိုင်းများနှင့် Tasks များအားလုံး မပျောက်မပျက် ချက်ချင်း ပြန်လည်ရောက်ရှိလာမည် ဖြစ်ပါသည်။`
                : 'When moving to a new phone or browser, simply log in with the same Gmail account to automatically restore all schedules and shifts.'}
            </p>
          </div>
        </div>

        {/* SECTION 2: EXPORT / IMPORT BACKUP FILE (.JSON) */}
        <div className="space-y-2">
          <div className="text-xs font-extrabold text-[var(--color-text-primary)] flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isMM ? 'အော့ဖ်လိုင်း ဖိုင်အဖြစ် Backup သိမ်းရန် (.JSON)' : 'Offline File Backup (.JSON)'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <button
              onClick={handleDownloadFile}
              className="p-3 bg-[var(--color-bg-card)] hover:border-blue-500 border border-[var(--color-border)] rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-blue-500" />
                <div className="text-left">
                  <div className="font-bold text-[var(--color-text-primary)]">{isMM ? 'JSON Backup ဖိုင် ဒေါင်းလုဒ်ယူမည်' : 'Download Backup File'}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{isMM ? 'ဖုန်း/ကွန်ပျူတာထဲ သိမ်းဆည်းရန်' : 'Save .json to storage'}</div>
                </div>
              </div>
            </button>

            <label className="p-3 bg-[var(--color-bg-card)] hover:border-emerald-500 border border-[var(--color-border)] rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-xs">
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4 text-emerald-500" />
                <div className="text-left">
                  <div className="font-bold text-[var(--color-text-primary)]">{isMM ? 'JSON ဖိုင်မှ ပြန်လည်ရယူမည်' : 'Restore from JSON File'}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{isMM ? 'ဖိုင်ရွေးချယ်ပြီး Restore လုပ်ရန်' : 'Select .json file'}</div>
                </div>
              </div>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* SECTION 3: SAVED SNAPSHOT RESTORE POINTS */}
        <div className="space-y-2">
          <div className="text-xs font-extrabold text-[var(--color-text-primary)] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-500" />
              <span>{isMM ? 'စက်တွင်း Backup မှတ်တမ်းများ (Local Snapshots)' : 'Local Restore Points'}</span>
            </div>
            <button
              onClick={handleCreateSnapshot}
              disabled={isLocalSyncing}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLocalSyncing ? 'animate-spin' : ''}`} />
              <span>{isMM ? '+ Snapshot အသစ်သိမ်းမည်' : '+ New Snapshot'}</span>
            </button>
          </div>

          {snapshots.length === 0 ? (
            <div className="p-3 bg-[var(--color-bg-input)] rounded-xl text-center text-xs text-[var(--color-text-muted)]">
              {isMM ? 'စက်တွင်း Snapshot မှတ်တမ်း မရှိသေးပါ။' : 'No local snapshots yet.'}
            </div>
          ) : (
            <div className="space-y-2">
              {snapshots.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleRestoreSnapshot(s)}
                  className="p-3 bg-[var(--color-bg-input)] hover:border-[var(--color-primary)] border border-[var(--color-border)] rounded-xl flex items-center justify-between cursor-pointer transition-all text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                      <span>{s.label}</span>
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">
                      {new Date(s.timestamp).toLocaleString('my-MM')} • {s.dataSummary}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                      {isMM ? 'ပြန်ယူမည်' : 'Restore'}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSnapshot(s.id, e)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MacWindowFrame>
  );
};

