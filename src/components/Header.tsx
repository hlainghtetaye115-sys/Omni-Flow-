import React, { useState } from 'react';
import { Moon, Sun, Languages, Bell, Smartphone, Tablet, Laptop, Monitor, Sparkles, ChevronDown, Download, Cloud, Briefcase, GraduationCap, User } from 'lucide-react';
import { Preferences } from '../types';
import { TRANSLATIONS } from '../data/defaultData';
import { OmniFlowLogo } from './OmniFlowLogo';

export type DeviceMode = 'auto' | 'mobile' | 'tablet' | 'laptop' | 'desktop';

interface HeaderProps {
  preferences: Preferences;
  user?: { uid: string; email?: string; displayName?: string; photoURL?: string | null } | null;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  deviceMode: DeviceMode;
  detectedMode: 'mobile' | 'tablet' | 'laptop' | 'desktop';
  onSelectDeviceMode: (mode: DeviceMode) => void;
  onOpenInstallModal?: () => void;
  onOpenBackupModal?: () => void;
  onToggleLifeMode?: () => void;
  onOpenLoginModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  preferences,
  user,
  onToggleTheme,
  onToggleLang,
  onOpenNotifications,
  unreadCount,
  deviceMode,
  detectedMode,
  onSelectDeviceMode,
  onOpenInstallModal,
  onOpenBackupModal,
  onToggleLifeMode,
  onOpenLoginModal
}) => {
  const t = TRANSLATIONS[preferences.lang];
  const isDark = preferences.themePreset === 'dark';
  const isMM = preferences.lang === 'my';
  const isWork = preferences.lifeMode === 'workplace';
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);

  const activeDisplayMode = deviceMode === 'auto' ? detectedMode : deviceMode;

  const modeLabels: Record<DeviceMode, { nameMM: string; nameEN: string; icon: React.ReactNode }> = {
    auto: { nameMM: 'အလိုအလျောက် (Auto)', nameEN: 'Auto View', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
    mobile: { nameMM: 'ဖုန်း ဗျူး (Mobile)', nameEN: 'Mobile View', icon: <Smartphone className="w-3.5 h-3.5 text-blue-500" /> },
    tablet: { nameMM: 'တက်ဘလက် ဗျူး (Tablet)', nameEN: 'Tablet View', icon: <Tablet className="w-3.5 h-3.5 text-purple-500" /> },
    laptop: { nameMM: 'လက်ပ်တော့ပ် ဗျူး (Laptop)', nameEN: 'Laptop View', icon: <Laptop className="w-3.5 h-3.5 text-emerald-500" /> },
    desktop: { nameMM: 'ကွန်ပျူတာ ဗျူး (Desktop)', nameEN: 'Desktop View', icon: <Monitor className="w-3.5 h-3.5 text-cyan-500" /> }
  };

  return (
    <header className="py-3 border-b border-[var(--color-border)] flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 sm:px-6 bg-[var(--color-bg-card)]/80 backdrop-blur-md rounded-2xl mb-4 gap-3 shadow-sm transition-all">
      {/* Brand Logo & Title */}
      <div className="flex items-center justify-between md:justify-start gap-2.5 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0">
            <OmniFlowLogo size={38} themePreset={preferences.themePreset} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap py-0.5">
              <h1 className="text-sm sm:text-lg tracking-tight leading-tight flex items-center gap-1 font-semibold text-[var(--color-text-secondary)] shrink-0">
                <span>Omni</span>
                <span className="font-extrabold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">Flow</span>
              </h1>
              {onToggleLifeMode && (
                <button
                  onClick={onToggleLifeMode}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-1 cursor-pointer transition-all shrink-0 ${
                    isWork
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-600 dark:text-blue-400'
                      : 'bg-emerald-600/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  }`}
                  title={isMM ? 'ကျောင်းသား / လုပ်ငန်းခွင် ပုံစံ ပြောင်းလဲရန်' : 'Switch Student / Work Mode'}
                >
                  {isWork ? <Briefcase className="w-2.5 h-2.5" /> : <GraduationCap className="w-2.5 h-2.5" />}
                  <span>{isWork ? (isMM ? 'လုပ်ငန်းခွင်' : 'Work') : (isMM ? 'ကျောင်းသား' : 'Student')}</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-[var(--color-primary)]">
                <span className="text-[8px] uppercase tracking-wider">Lv</span>
                {preferences.gamification?.level || 1}
              </div>
              <div className="w-16 sm:w-24 h-1.5 bg-[var(--color-bg-input)] rounded-full overflow-hidden border border-[var(--color-border)] shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all duration-500" 
                  style={{ width: `${((preferences.gamification?.xp || 0) / ((preferences.gamification?.level || 1) * 100)) * 100}%` }}
                />
              </div>
              <span className="text-[8px] font-mono text-[var(--color-text-muted)]">
                {preferences.gamification?.xp || 0}/{((preferences.gamification?.level || 1) * 100)} XP
              </span>
            </div>

          </div>
        </div>

        {/* Device Mode Switcher Pill for Mobile */}
        <div className="md:hidden relative">
          <button
            onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
            className="px-2.5 py-1 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-[10px] font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 shadow-sm"
          >
            {modeLabels[activeDisplayMode].icon}
            <span className="capitalize">{activeDisplayMode}</span>
            <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)]" />
          </button>

          {isDeviceMenuOpen && (
            <div className="absolute right-0 top-8 z-50 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl p-1.5 min-w-[170px] space-y-0.5 animate-in fade-in duration-150">
              {(['auto', 'mobile', 'tablet', 'laptop', 'desktop'] as DeviceMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    onSelectDeviceMode(m);
                    setIsDeviceMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                    deviceMode === m ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold' : 'hover:bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {modeLabels[m].icon}
                  <span>{isMM ? modeLabels[m].nameMM : modeLabels[m].nameEN}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls Bar */}
      <div className="flex gap-2 items-center flex-wrap justify-between md:justify-end w-full md:w-auto">
        {/* Responsive Device Mode Segmented Controls for Desktop/Tablet */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
          {(['auto', 'mobile', 'tablet', 'laptop', 'desktop'] as DeviceMode[]).map((m) => {
            const isSelected = deviceMode === m;
            return (
              <button
                key={m}
                onClick={() => onSelectDeviceMode(m)}
                title={isMM ? modeLabels[m].nameMM : modeLabels[m].nameEN}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-white shadow-sm scale-105'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {modeLabels[m].icon}
                <span className="capitalize">{m === 'auto' ? (m + (deviceMode === 'auto' ? ` (${detectedMode[0].toUpperCase()})` : '')) : m}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Google Account / User Status Button */}
          {onOpenLoginModal && (
            <button
              onClick={onOpenLoginModal}
              className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-extrabold tracking-wider cursor-pointer flex items-center gap-1.5 transition-all shadow-xs ${
                user
                  ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500'
              }`}
              title={user ? (isMM ? `ချိတ်ဆက်ထားသည်: ${user.email}` : `Connected: ${user.email}`) : (isMM ? 'Google အကောင့် ချိတ်ဆက်ရန်' : 'Connect Google Account')}
            >
              {user ? (
                <>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-3.5 h-3.5 rounded-full object-cover" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-[var(--color-primary)] text-white text-[8px] flex items-center justify-center font-bold">
                      {(user.displayName || user.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[70px] sm:max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0] || 'Account'}
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isMM ? 'Google ချိတ်မည်' : 'Google'}</span>
                </>
              )}
            </button>
          )}

          {onOpenBackupModal && (
            <button
              onClick={onOpenBackupModal}
              className="px-2.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-xl text-[10px] font-extrabold tracking-wider cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
              title={isMM ? 'Cloud Backup & Sync' : 'Backup & Sync'}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isMM ? 'Backup' : 'Backup'}</span>
            </button>
          )}

          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 rounded-xl text-[10px] font-extrabold tracking-wider cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
              title="Install as App"
            >
              <Download className="w-3.5 h-3.5 animate-pulse" />
              <span>{isMM ? 'App သွင်းမည်' : 'Install'}</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            className="px-2.5 py-1.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl hover:brightness-95 dark:hover:brightness-125 text-[var(--color-text-secondary)] text-[10px] uppercase tracking-widest cursor-pointer flex items-center gap-1.5 transition-all"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
            <span className="hidden lg:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          <button
            onClick={onToggleLang}
            className="px-2.5 py-1.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl hover:brightness-95 dark:hover:brightness-125 text-[var(--color-text-secondary)] text-[10px] font-bold tracking-widest cursor-pointer flex items-center gap-1.5 transition-all"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>{preferences.lang === 'my' ? 'EN' : 'MY'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};


