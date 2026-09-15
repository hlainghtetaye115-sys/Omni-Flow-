import React from 'react';
import { Home, CalendarDays, PlusCircle, PieChart, Menu, Flame, Clock, Briefcase } from 'lucide-react';
import { Preferences } from '../types';
import { TRANSLATIONS } from '../data/defaultData';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  preferences: Preferences;
  taskCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, preferences, taskCount }) => {
  const t = TRANSLATIONS[preferences.lang];
  const isMM = preferences.lang === 'my';
  const isWork = preferences.lifeMode === 'workplace';

  const tabs = [
    {
      id: isWork ? 'workplace' : 'home',
      label: t.navToday,
      icon: isWork ? Briefcase : Home
    },
    {
      id: 'table',
      label: isMM ? 'အချိန်ဇယား' : 'Timetable',
      icon: CalendarDays
    },
    {
      id: 'tasks',
      label: isWork ? (isMM ? 'လုပ်ငန်းတာဝန်' : 'Tasks') : t.navTasks,
      icon: PlusCircle,
      badge: taskCount,
      isCenter: true
    },
    {
      id: 'stats',
      label: t.navStats || (isMM ? 'စစ်တမ်း' : 'Stats'),
      icon: PieChart
    },
    {
      id: 'manage',
      label: isMM ? 'မီနူး' : 'Menu',
      icon: Menu
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 md:h-screen md:w-20 md:right-auto md:top-0 bg-[var(--color-bg-card)]/90 backdrop-blur-xl border-t md:border-t-0 md:border-r border-[var(--color-border)] flex md:flex-col items-stretch justify-around md:justify-center md:gap-8 z-20 px-1 md:py-8 pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        if (tab.isCenter) {
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 md:flex-none flex flex-col items-center justify-center gap-1.5 bg-transparent border-none text-[9px] uppercase tracking-widest cursor-pointer transition-all px-1 relative rounded-xl min-h-[48px] md:min-h-[64px] ${isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'}`}
            >
              <div className="relative md:-mt-0 -mt-4">
                <Icon className="w-10 h-10 bg-[var(--color-primary)] text-white p-2 rounded-full shadow-[0_0_20px_var(--color-primary-light)] transition-all hover:scale-105" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 h-4 text-center leading-4 animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 md:hidden">{tab.label}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex-1 md:flex-none flex flex-col items-center justify-center gap-1.5 bg-transparent border-none text-[9px] uppercase tracking-widest cursor-pointer transition-all px-1 relative rounded-xl min-h-[48px] md:min-h-[64px] overflow-hidden ${isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]/70'}`}
          >
            {isActive && (
              <>
                <div className="md:hidden absolute top-0 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 rounded-b-full shadow-[0_0_15px_rgba(217,70,239,0.8)] z-10" />
                <div className="md:hidden absolute top-0 left-[15%] right-[15%] h-16 bg-gradient-to-b from-fuchsia-500/40 via-cyan-400/20 to-transparent blur-md pointer-events-none animate-in fade-in slide-in-from-top-4 duration-500" />
                
                <div className="hidden md:block absolute left-0 top-[20%] bottom-[20%] w-0.5 bg-gradient-to-b from-cyan-400 via-fuchsia-500 to-amber-400 rounded-r-full shadow-[0_0_15px_rgba(217,70,239,0.8)] z-10" />
                <div className="hidden md:block absolute left-0 top-[15%] bottom-[15%] w-16 bg-gradient-to-r from-fuchsia-500/40 via-cyan-400/20 to-transparent blur-md pointer-events-none animate-in fade-in slide-in-from-left-4 duration-500" />
              </>
            )}
            <Icon className={`w-5 h-5 transition-transform z-10 ${isActive ? 'scale-110 text-[var(--color-primary)]' : ''}`} />
            {tab.label ? <span className="z-10 md:hidden">{tab.label}</span> : null}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute top-1 right-1/4 md:right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 h-4 text-center leading-4 z-10">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
