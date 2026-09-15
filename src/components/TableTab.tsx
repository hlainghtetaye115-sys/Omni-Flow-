import React, { useState } from 'react';
import {
  CalendarDays, Printer, ArrowUpDown, Info, RotateCw, Maximize2, Minimize2,
  ZoomIn, ZoomOut, X, ChevronDown, ChevronUp, Eye, EyeOff, CalendarCheck,
  ClipboardPaste, Check, QrCode, Download, Clock, Plus, Settings, Filter, Edit,
  Bell, BellOff, Volume2, MapPin, UserCheck, Video, ExternalLink
} from 'lucide-react';
import { TimetableChart, TimeSlot, DayCode, Preferences } from '../types';
import { TRANSLATIONS } from '../data/defaultData';
import { motion, AnimatePresence } from 'motion/react';
import { audioAlert } from '../utils/audioAlert';

function getContrastColor(hexColor: string) {
  if (!hexColor || typeof hexColor !== 'string') return '#000';
  let color = hexColor.trim().replace('#', '');
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  if (color.length !== 6) return '#000';
  const r = parseInt(color.slice(0, 2), 16) || 0;
  const g = parseInt(color.slice(2, 4), 16) || 0;
  const b = parseInt(color.slice(4, 6), 16) || 0;
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#000' : '#fff';
}

export interface CopiedSubjectData {
  name: string;
  color: string;
  category: 'work' | 'personal' | 'relationship';
  note?: string;
}

interface TableTabProps {
  preferences: Preferences;
  slots: TimeSlot[];
  chart: TimetableChart;
  notes: Record<string, string>;
  timeState: Date;
  onCellClick: (day: DayCode, slotIds: number[], name: string, color: string, category: 'work' | 'personal' | 'relationship') => void;
  onCellEdit: (day: DayCode, slotId: number) => void;
  onMoveActivity?: (sourceDay: DayCode, sourceSlotId: number, targetDay: DayCode, targetSlotId: number) => void;
  onSyncCalendar?: () => void;
  onOpenQrCode?: (tab?: 'share' | 'scan') => void;
  onPasteToSlot?: (day: DayCode, slotId: number, data: CopiedSubjectData) => void;
  onAddSlot?: () => void;
  onEditSlot?: (slot: TimeSlot) => void;
  onOpenManageSlots?: () => void;
  onDeleteActivity?: (day: DayCode, slotIds: number[], actName?: string) => void;
  onUpdatePreferences?: (prefs: Partial<Preferences>) => void;
  collapsible?: boolean;
  defaultOpen?: boolean;
  isOpenControlled?: boolean;
  onToggleOpen?: (isOpen: boolean) => void;
  titleOverride?: string;
}

export const TableTab: React.FC<TableTabProps> = ({
  preferences,
  slots,
  chart,
  notes,
  timeState,
  onCellClick,
  onCellEdit,
  onMoveActivity,
  onSyncCalendar,
  onOpenQrCode,
  onPasteToSlot,
  onAddSlot,
  onEditSlot,
  onOpenManageSlots,
  onDeleteActivity,
  onUpdatePreferences,
  collapsible = false,
  defaultOpen = true,
  isOpenControlled,
  onToggleOpen,
  titleOverride
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalOpen;

  const handleToggleOpenState = () => {
    const next = !isOpen;
    if (isOpenControlled === undefined) {
      setInternalOpen(next);
    }
    if (onToggleOpen) {
      onToggleOpen(next);
    }
  };
  const [isLandscapeModalOpen, setIsLandscapeModalOpen] = useState(false);
  const [isRotated90, setIsRotated90] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'work' | 'personal' | 'relationship'>('all');

  // Quick Copy-Paste Clipboard & Drag State
  const [clipboard, setClipboard] = useState<CopiedSubjectData | null>(null);
  const [draggedCell, setDraggedCell] = useState<{ day: DayCode; slotId: number; name: string } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ day: DayCode; slotId: number } | null>(null);

  const t = TRANSLATIONS[preferences.lang];
  const sortedSlots = [...slots].sort((a, b) => a.start.localeCompare(b.start));
  const days: DayCode[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const daysMap: DayCode[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const currentDay = daysMap[timeState.getDay()];
  const time24 = `${String(timeState.getHours()).padStart(2, '0')}:${String(timeState.getMinutes()).padStart(2, '0')}`;

  const isMM = preferences.lang === 'my';
  const todayClasses = chart[currentDay] || [];

  // Find current ongoing activity
  const currentActivity = todayClasses.find(c => c.start <= time24 && c.end > time24);

  // Find next upcoming activity today
  const nextActivity = todayClasses
    .filter(c => c.start > time24)
    .sort((a, b) => a.start.localeCompare(b.start))[0];

  // Calculate live minutes and progress
  const timeInfo = (() => {
    const nowMins = timeState.getHours() * 60 + timeState.getMinutes();
    if (currentActivity) {
      const [eh, em] = currentActivity.end.split(':').map(Number);
      const [sh, sm] = currentActivity.start.split(':').map(Number);
      const totalDur = (eh * 60 + em) - (sh * 60 + sm);
      const elapsed = nowMins - (sh * 60 + sm);
      const remaining = Math.max(0, (eh * 60 + em) - nowMins);
      const progressPercent = totalDur > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDur) * 100))) : 0;
      return {
        type: 'current' as const,
        activity: currentActivity,
        remainingMins: remaining,
        progressPercent
      };
    } else if (nextActivity) {
      const [sh, sm] = nextActivity.start.split(':').map(Number);
      const startMins = sh * 60 + sm;
      const untilStart = Math.max(0, startMins - nowMins);
      const hrs = Math.floor(untilStart / 60);
      const mins = untilStart % 60;
      return {
        type: 'next' as const,
        activity: nextActivity,
        untilStartMins: untilStart,
        formattedUntil: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`,
        formattedUntilMM: hrs > 0 ? `${hrs} နာရီ ${mins} မိနစ်` : `${mins} မိနစ်`
      };
    }
    return {
      type: 'free' as const
    };
  })();

  const formattedTime = timeState.toLocaleTimeString(isMM ? 'my-MM' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: preferences.timeFormat !== '24'
  });

  const formattedDate = timeState.toLocaleDateString(isMM ? 'my-MM' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const handleToggleSoundAlerts = () => {
    if (!onUpdatePreferences) return;
    const nextVal = !preferences.soundAlerts;
    audioAlert.triggerVibration('gentle');
    if (nextVal) {
      audioAlert.playSound(preferences.soundType || 'gentle_chime', preferences.soundVolume || 80);
    }
    onUpdatePreferences({ soundAlerts: nextVal });
  };

  const handleTestSound = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    audioAlert.triggerVibration('gentle');
    audioAlert.playSound(preferences.soundType || 'gentle_chime', preferences.soundVolume || 80);
  };

  const toggleNativeLandscape = async () => {
    setIsLandscapeModalOpen(true);
    try {
      if (screen.orientation && 'lock' in screen.orientation) {
        // @ts-ignore
        await screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) {
      // orientation lock not supported on all browsers/iFrames
    }
  };

  const closeLandscapeModal = () => {
    setIsLandscapeModalOpen(false);
    try {
      if (screen.orientation && 'unlock' in screen.orientation) {
        screen.orientation.unlock();
      }
    } catch (e) {}
  };

  const handleCellAction = (day: DayCode, slotId: number, existingAct?: any) => {
    if (clipboard && onPasteToSlot) {
      onPasteToSlot(day, slotId, clipboard);
      return;
    }

    if (existingAct) {
      const bg = existingAct.customBg || '#10b981';
      onCellClick(day, existingAct.slots, existingAct.name, bg, existingAct.category || 'work');
    } else {
      onCellClick(day, [slotId], '', '#10b981', 'work');
    }
  };

  // Category Icon helper
  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'personal':
        return { emoji: '💡', label: isMM ? 'ကိုယ်ပိုင်' : 'Personal' };
      case 'relationship':
        return { emoji: '🤝', label: isMM ? 'တွေ့ဆုံမှု' : 'Social' };
      case 'work':
      default:
        return { emoji: '📚', label: isMM ? 'စာသင်ချိန်' : 'Study' };
    }
  };

  const renderTableContent = (isFullScreen: boolean = false) => (
    <table className="w-full border-collapse min-w-[700px] text-xs bg-[var(--color-bg-card)]">
      <thead className="sticky top-0 z-20">
        <tr className="bg-[var(--color-bg-input)] text-[var(--color-text-primary)] border-b-2 border-[var(--color-border)]">
          <th className="sticky left-0 z-30 p-3 uppercase tracking-widest font-bold border-r-2 border-[var(--color-border)] whitespace-nowrap bg-[var(--color-bg-input)] text-[var(--color-text-primary)]">
            <div className="flex items-center justify-center gap-1.5">
              <span>{t.thDayTime}</span>
              {onAddSlot && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAddSlot(); }}
                  className="p-1 rounded-md bg-[var(--color-primary)] text-white hover:brightness-110 cursor-pointer shadow-xs"
                  title={isMM ? 'အချိန်အသစ် ထည့်မည်' : 'Add Time Slot'}
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          </th>
          {sortedSlots.map(s => {
            const isSlotActive = s.start <= time24 && s.end > time24;
            return (
              <th
                key={s.id}
                onClick={() => {
                  if (onEditSlot) {
                    audioAlert.triggerVibration('gentle');
                    onEditSlot(s);
                  }
                }}
                className={`p-3 font-mono font-bold border-r border-[var(--color-border)] whitespace-nowrap text-center text-[var(--color-text-primary)] transition-all group ${
                  onEditSlot ? 'cursor-pointer hover:bg-blue-500/10 active:bg-blue-500/20 touch-manipulation' : ''
                } ${
                  isSlotActive ? 'bg-[var(--color-primary)]/20 border-b-4 border-b-[var(--color-primary)] shadow-xs' : ''
                }`}
                title={isMM ? `အချိန် Slot ပြင်ဆင်ရန် သို့မဟုတ် ဖျက်ရန် နှိပ်ပါ (${s.label}: ${s.start} - ${s.end})` : `Click to edit or delete slot (${s.label}: ${s.start} - ${s.end})`}
              >
                <div className="text-sm font-semibold flex items-center justify-center gap-1">
                  <span>{s.label}</span>
                  {isSlotActive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--color-primary)] text-white font-sans animate-pulse">
                      {isMM ? '🔴 ယခု' : '🔴 Now'}
                    </span>
                  )}
                  {onEditSlot && (
                    <Edit className="w-3 h-3 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 text-blue-500 transition-opacity ml-0.5" />
                  )}
                </div>
                <div className="text-[11px] font-medium text-[var(--color-text-secondary)] mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
                  <span>{s.start} - {s.end}</span>
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {days.map(day => {
          const activities = chart[day] || [];
          const isToday = day === currentDay;

          return (
            <tr key={day} className={`border-b border-[var(--color-border)] ${isToday ? 'bg-[var(--color-primary-light)]/40' : ''}`}>
              <td className={`sticky left-0 z-10 p-3 font-bold uppercase tracking-widest text-center border-r-2 border-[var(--color-border)] ${isToday ? 'bg-[var(--color-primary)] text-white shadow-md' : 'bg-[var(--color-bg-input)] text-[var(--color-text-primary)]'}`}>
                {day}
              </td>
              {sortedSlots.map(slot => {
                const act = activities.find(c => c.slots && c.slots.includes(slot.id));
                let firstSlotId = null;
                if (act) {
                  firstSlotId = sortedSlots.find(s => act.slots.includes(s.id))?.id;
                }
                
                if (act && firstSlotId === slot.id) {
                  const spanCount = act.slots.filter(id => sortedSlots.some(s => s.id === id)).length || 1;
                  const hasNote = act.slots.some(id => notes[`${day}_slot${id}`]);
                  const accentColor = act.customBg || '#10b981';

                  const isOngoing = isToday && act.start <= time24 && act.end > time24;
                  const isBeingDragged = draggedCell?.day === day && draggedCell?.slotId === slot.id;
                  const isHoveredTarget = dragOverCell?.day === day && dragOverCell?.slotId === slot.id;
                  
                  const isCategoryMatch = activeCategoryFilter === 'all' || act.category === activeCategoryFilter;
                  const catBadge = getCategoryBadge(act.category);

                  return (
                    <td
                      key={slot.id}
                      colSpan={Math.max(spanCount, 1)}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', '');
                        setDraggedCell({ day, slotId: slot.id, name: act.name });
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverCell({ day, slotId: slot.id });
                      }}
                      onDragLeave={() => setDragOverCell(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedCell && onMoveActivity) {
                          onMoveActivity(draggedCell.day, draggedCell.slotId, day, slot.id);
                        }
                        setDraggedCell(null);
                        setDragOverCell(null);
                      }}
                      onClick={() => handleCellAction(day, slot.id, act)}
                      onDoubleClick={(e) => { e.stopPropagation(); onCellEdit(day, slot.id); }}
                      style={{
                        borderLeft: `4px solid ${accentColor}`,
                        backgroundColor: `${accentColor}18`,
                        opacity: isCategoryMatch ? 1 : 0.25
                      }}
                      title={isMM ? `${act.name} (${act.timeStr}) - ပြင်ဆင်ရန် သို့မဟုတ် ဖျက်ရန် နှိပ်ပါ` : `${act.name} (${act.timeStr}) - Tap to edit or delete`}
                      className={`p-3 text-center border-r border-[var(--color-border)] cursor-pointer font-bold relative transition-all group hover:brightness-105 hover:shadow-md text-[var(--color-text-primary)] ${
                        isBeingDragged ? 'opacity-30 border-2 border-dashed border-amber-500 scale-95' : ''
                      } ${
                        isHoveredTarget ? 'ring-2 ring-amber-400 bg-amber-500/20 scale-[1.03] z-20' : ''
                      } ${
                        isOngoing ? 'ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] z-10 scale-[1.01]' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        {isOngoing && (
                          <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.2 rounded-full bg-emerald-500 text-white animate-pulse shadow-xs">
                            🔴 Live Now
                          </span>
                        )}
                        <span className="font-mono font-bold text-sm flex items-center gap-1 text-[var(--color-text-primary)]">
                          <span>{act.name}</span>
                          <span className="text-[10px] opacity-75" title={catBadge.label}>{catBadge.emoji}</span>
                          {hasNote && <span className="w-2.5 h-2.5 rounded-full inline-block shadow-xs bg-amber-500" />}
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] font-mono">{act.timeStr}</span>
                        {(act.room || act.instructor || act.link) && (
                          <div className="flex flex-wrap items-center justify-center gap-1 mt-0.5 max-w-full">
                            {act.room && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-medium text-[var(--color-text-secondary)] max-w-full truncate" title={`Room: ${act.room}`}>
                                <MapPin className="w-2.5 h-2.5 text-red-500 flex-shrink-0" />
                                <span className="truncate">{act.room}</span>
                              </span>
                            )}
                            {act.instructor && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-medium text-[var(--color-text-secondary)] max-w-full truncate" title={`Instructor: ${act.instructor}`}>
                                <UserCheck className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
                                <span className="truncate">{act.instructor}</span>
                              </span>
                            )}
                            {act.link && (
                              <a
                                href={act.link.startsWith('http') ? act.link : `https://${act.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-bold hover:underline"
                                title={act.link}
                              >
                                <Video className="w-2.5 h-2.5 flex-shrink-0" />
                                <span>Join</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                } else if (!act) {
                  const isHoveredTarget = dragOverCell?.day === day && dragOverCell?.slotId === slot.id;

                  return (
                    <td
                      key={slot.id}
                      onClick={() => handleCellAction(day, slot.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverCell({ day, slotId: slot.id });
                      }}
                      onDragLeave={() => setDragOverCell(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedCell && onMoveActivity) {
                          onMoveActivity(draggedCell.day, draggedCell.slotId, day, slot.id);
                        }
                        setDraggedCell(null);
                        setDragOverCell(null);
                      }}
                      className={`p-3 text-center border-r border-[var(--color-border)] cursor-pointer text-[var(--color-text-muted)] opacity-60 hover:opacity-100 hover:bg-[var(--color-bg-input)] transition-all font-mono font-medium ${
                        isHoveredTarget ? 'bg-amber-500/20 border-2 border-dashed border-amber-500 text-amber-600 font-bold opacity-100' : ''
                      } ${clipboard ? 'hover:bg-emerald-500/20 hover:text-emerald-600' : ''}`}
                    >
                      {isHoveredTarget ? (
                        <span className="text-[10px] text-amber-600 font-bold">🚚 Move Here</span>
                      ) : clipboard ? (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <ClipboardPaste className="w-3 h-3" /> Paste
                        </span>
                      ) : '+'}
                    </td>
                  );
                }
                return null;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const exportTimetableAsPNG = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellWidth = 160;
    const cellHeight = 70;
    const headerHeight = 90;
    const dayColWidth = 100;

    const width = dayColWidth + sortedSlots.length * cellWidth;
    const height = headerHeight + days.length * cellHeight + 60;

    canvas.width = width * 2; // 2x HD scale
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Dark Metallic Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // App Header Banner
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, headerHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(titleOverride || 'OmniFlow Timetable', 24, 42);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('Generated with OmniFlow Smart Schedule Planner', 24, 65);

    // Column Headers (Time Slots)
    sortedSlots.forEach((slot, idx) => {
      const x = dayColWidth + idx * cellWidth;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, headerHeight - 28, cellWidth - 3, 26);
      ctx.fillStyle = '#00f2fe';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(slot.label, x + 10, headerHeight - 11);
    });

    // Rows (Days & Activities)
    days.forEach((day, dIdx) => {
      const y = headerHeight + dIdx * cellHeight;

      // Day Column
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, y + 4, dayColWidth - 14, cellHeight - 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(day, 24, y + 40);

      // Slots
      sortedSlots.forEach((slot, sIdx) => {
        const x = dayColWidth + sIdx * cellWidth;
        const acts = chart[day] || [];
        const act = acts.find(c => c.slots && c.slots.includes(slot.id));

        if (act) {
          ctx.fillStyle = act.customBg ? `${act.customBg}33` : '#0284c733';
          ctx.fillRect(x, y + 4, cellWidth - 4, cellHeight - 8);

          ctx.fillStyle = act.customBg || '#38bdf8';
          ctx.fillRect(x, y + 4, 4, cellHeight - 8);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.fillText(act.name.substring(0, 18), x + 12, y + 32);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px monospace';
          ctx.fillText(act.timeStr || slot.label, x + 12, y + 50);
        } else {
          ctx.fillStyle = '#1e293b44';
          ctx.fillRect(x, y + 4, cellWidth - 4, cellHeight - 8);
          ctx.fillStyle = '#475569';
          ctx.font = '12px monospace';
          ctx.fillText('-', x + cellWidth / 2 - 4, y + 40);
        }
      });
    });

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(`Exported on ${new Date().toLocaleDateString()}`, 24, height - 20);

    // Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `OmniFlow_Timetable_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const displayTitle = titleOverride || t.titleWeeklyChart;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] animate-in fade-in duration-300">
      {/* Header bar with controls and collapse toggle if applicable */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div 
          onClick={() => collapsible && handleToggleOpenState()}
          className={`flex items-center gap-2.5 ${collapsible ? 'cursor-pointer select-none group' : ''}`}
        >
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="font-bold text-sm sm:text-base text-[var(--color-text-primary)] flex items-center gap-2">
              <span>{displayTitle}</span>
              {collapsible && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                  {isOpen ? (isMM ? 'ဖွင့်ထားသည်' : 'Expanded') : (isMM ? 'ပိတ်ထားသည်' : 'Collapsed')}
                </span>
              )}
            </div>
            {collapsible && !isOpen && (
              <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
                {isMM ? 'ဇယားကွက်အပြည့်အစုံ ကြည့်ရန်/ပြင်ရန် ဤနေရာကို နှိပ်ပါ' : 'Click here to expand & view/edit timetable'}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {/* Calendar Sync Button */}
          {onSyncCalendar && (
            <button
              onClick={onSyncCalendar}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm"
              title={isMM ? 'Google Calendar & Phone Alarms သို့ ထည့်သွင်းမည်' : 'Sync to Google / Apple Calendar (.ics)'}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{isMM ? 'Google Calendar သို့ တင်မည်' : 'Sync to Google Calendar'}</span>
            </button>
          )}

          {/* PNG Image Wallpaper Export Button */}
          <button
            onClick={exportTimetableAsPNG}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-amber-700 transition-all flex items-center gap-1.5 shadow-sm"
            title={isMM ? 'အချိန်ဇယားကို PNG ပုံရိပ်အဖြစ် ဒေါင်းလုဒ်ဆွဲရန်' : 'Export Timetable as HD PNG Image'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isMM ? 'PNG ပုံရိပ် (Wallpaper)' : 'Export PNG'}</span>
          </button>

          {isOpen && (
            <>
              <button
                onClick={toggleNativeLandscape}
                className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[var(--color-primary-dark)] transition-all flex items-center gap-1.5 shadow-sm"
                title="Rotate View / Horizontal Screen Mode"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rotate / Horizontal (ဇယား လှည့်ကြည့်ရန်)</span>
                <span className="sm:hidden">Rotate</span>
              </button>
              <button 
                onClick={() => window.print()} 
                className="px-3 py-1.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-[10px] uppercase tracking-widest cursor-pointer hover:brightness-95 dark:hover:brightness-125 transition-all flex items-center gap-1.5 font-bold"
              >
                <Printer className="w-3.5 h-3.5 text-[var(--color-primary)]" /> 
                <span className="text-[var(--color-text-secondary)]">{t.btnPrint}</span>
              </button>
            </>
          )}

          {collapsible && (
            <button
              onClick={handleToggleOpenState}
              className="px-3 py-1.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] hover:border-[var(--color-primary)] rounded-xl text-xs font-bold text-[var(--color-text-primary)] cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
              title={isOpen ? (isMM ? 'ဇယားပိတ်သိမ်းရန်' : 'Collapse Schedule') : (isMM ? 'ဇယားဖွင့်ကြည့်ရန်' : 'Expand Schedule')}
            >
              {isOpen ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span className="text-[11px]">{isMM ? 'ဇယားခေါက်သိမ်းမည်' : 'Hide Table'}</span>
                  <ChevronUp className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span className="text-[11px] text-[var(--color-primary)]">{isMM ? 'ဇယားအပြည့် ဖွင့်ကြည့်မည်' : 'Show Table'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Schedule & Alarm Tracker Bar ("About Time") */}
      <div className="mb-3 p-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Live Digital Clock & Date */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-extrabold text-[var(--color-text-primary)] tracking-wider">
                {formattedTime}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Clock Active" />
              <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {currentDay}
              </span>
            </div>
            <p className="text-[11px] font-medium text-[var(--color-text-secondary)]">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Center: Current or Next Activity Tracker */}
        <div className="flex-1 md:mx-3">
          {timeInfo.type === 'current' && timeInfo.activity ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[var(--color-text-primary)]">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex-shrink-0">
                    {isMM ? '🔴 လက်ရှိအတန်းချိန်:' : '🔴 Current Class:'}
                  </span>
                  <span className="font-bold text-xs underline truncate">{timeInfo.activity.name}</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex-shrink-0">
                  {isMM ? `${timeInfo.remainingMins} မိနစ်ကျန်` : `${timeInfo.remainingMins}m left`}
                </span>
              </div>
              <div className="w-full bg-emerald-500/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${timeInfo.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)] font-mono mt-1">
                <span>{timeInfo.activity.start}</span>
                <span>{isMM ? `ပြီးဆုံးချိန် ${timeInfo.activity.end}` : `Ends at ${timeInfo.activity.end}`}</span>
              </div>
            </div>
          ) : timeInfo.type === 'next' && timeInfo.activity ? (
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-[var(--color-text-primary)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base flex-shrink-0">☕</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold flex items-center gap-1.5 truncate">
                    <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">
                      {isMM ? 'အားလပ်ချိန် • နောက်လာမည့်အတန်း:' : 'Free Time • Next Class:'}
                    </span>
                    <span className="font-bold truncate">{timeInfo.activity.name}</span>
                  </div>
                  <div className="text-[11px] text-[var(--color-text-secondary)] font-mono truncate">
                    {isMM
                      ? `စတင်ချိန် ${timeInfo.activity.start} (${timeInfo.formattedUntilMM} အကြာတွင် စတင်ပါမည်)`
                      : `Starts at ${timeInfo.activity.start} (in ${timeInfo.formattedUntil})`}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex-shrink-0">
                {timeInfo.activity.start}
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] flex items-center gap-2">
              <span className="text-base">🎉</span>
              <span className="text-xs font-semibold">
                {isMM
                  ? 'ဒီကနေ့အတွက် သတ်မှတ်ထားသော အတန်းများ အားလုံးပြီးဆုံးပါပြီ'
                  : 'All classes and activities completed for today'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Sound Alert Alarm Toggle & Test Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onUpdatePreferences && (
            <button
              type="button"
              onClick={handleToggleSoundAlerts}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleToggleSoundAlerts();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs touch-manipulation active:scale-95 border ${
                preferences.soundAlerts
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              title={isMM ? 'အတန်းချိန် အချက်ပေးသံ ဖွင့်/ပိတ်' : 'Toggle Class Sound Alert'}
            >
              {preferences.soundAlerts ? (
                <>
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                  <span>{isMM ? 'အချက်ပေးသံ: ဖွင့်' : 'Bell Alert: ON'}</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5" />
                  <span>{isMM ? 'အချက်ပေးသံ: ပိတ်' : 'Bell Alert: OFF'}</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleTestSound}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTestSound(e as any);
            }}
            className="px-2.5 py-2 rounded-xl bg-[var(--color-bg-card)] hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-bold cursor-pointer transition-all flex items-center gap-1 active:scale-95 touch-manipulation shadow-xs"
            title={isMM ? 'အချက်ပေးသံ စမ်းသပ်နားဆင်ရန်' : 'Test Reminder Chime Sound'}
          >
            <Volume2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span className="hidden sm:inline">{isMM ? 'စမ်းသပ်သံ' : 'Test'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter & Quick Actions Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3 p-2 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-[var(--color-text-secondary)] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            {isMM ? 'ကဏ္ဍစစ်ထုတ်မှု:' : 'Filter:'}
          </span>
          {[
            { id: 'all', labelMM: 'အားလုံး (All)', labelEN: 'All' },
            { id: 'work', labelMM: '📚 စာသင် / အလုပ်', labelEN: '📚 Academic & Work' },
            { id: 'personal', labelMM: '💡 ကိုယ်ပိုင်အချိန်', labelEN: '💡 Personal' },
            { id: 'relationship', labelMM: '🤝 တွေ့ဆုံမှု', labelEN: '🤝 Social' }
          ].map(cat => {
            const isSelected = activeCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryFilter(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-white shadow-xs scale-102'
                    : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {isMM ? cat.labelMM : cat.labelEN}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {onAddSlot && (
            <button
              type="button"
              onClick={onAddSlot}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shadow-xs"
              title={isMM ? 'အချိန်အသစ်ထည့်မည်' : 'Add Time Slot'}
            >
              <Plus className="w-3 h-3" />
              <span>{isMM ? 'အချိန်ကွက်အသစ်' : 'Add Slot'}</span>
            </button>
          )}
          {onOpenManageSlots && (
            <button
              type="button"
              onClick={onOpenManageSlots}
              className="px-2.5 py-1 bg-[var(--color-bg-card)] hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
              title={isMM ? 'အချိန်ဇယားများစီမံမည်' : 'Manage Slots'}
            >
              <Settings className="w-3 h-3" />
              <span>{isMM ? 'အချိန်များစီမံမည်' : 'Manage Slots'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Active Clipboard Bar */}
      {clipboard && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-2 text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: clipboard.color }} />
            <span className="font-bold text-[var(--color-text-primary)]">
              📋 Copied: <span className="underline">{clipboard.name}</span>
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] hidden sm:inline">
              (ဇယားရှိ အကွက်များကို နှိပ်၍ အလွယ်တကူ Paste ပြုလုပ်နိုင်ပါပြီ)
            </span>
          </div>
          <button
            onClick={() => setClipboard(null)}
            className="px-2 py-0.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md text-[11px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            Cancel (ပိတ်မည်)
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={collapsible ? { opacity: 0, height: 0 } : undefined}
            animate={collapsible ? { opacity: 1, height: 'auto' } : undefined}
            exit={collapsible ? { opacity: 0, height: 0 } : undefined}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-[var(--color-text-muted)] mb-3 flex items-center gap-1.5 font-mono">
              <Info className="w-3.5 h-3.5 text-[var(--color-primary)] flex-shrink-0" /> 
              <span>{t.tableGuideText} (ဖုန်းစခရင်တွင် ဇယားအပြည့်မြင်ရရန် <b>Rotate / Horizontal</b> ခလုတ်ကို နှိပ်ပါ)</span>
            </p>

            <div className="overflow-auto max-h-[70vh] rounded-xl border border-[var(--color-border)] relative">
              {renderTableContent(false)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Rotated / Landscape View Modal */}
      {isLandscapeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col p-2 md:p-4 animate-in fade-in duration-200 overflow-hidden">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between bg-[var(--color-bg-card)] border border-[var(--color-border)] p-2.5 rounded-xl mb-2 text-[var(--color-text-primary)] gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="font-bold text-sm">Full Schedule Landscape View (ဇယားကွက်)</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Rotate 90 deg Toggle */}
              <button
                onClick={() => setIsRotated90(!isRotated90)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isRotated90
                    ? 'bg-amber-600 text-white border-transparent'
                    : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isRotated90 ? 'Reset Rotation (ပုံမှန်အတိုင်း)' : 'Rotate 90° (ဖုန်းဒေါင်လိုက်လှည့်ရန်)'}</span>
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg p-0.5">
                <button
                  onClick={() => setZoomLevel(Math.max(0.7, zoomLevel - 0.1))}
                  className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-1 text-[10px] font-mono font-bold text-[var(--color-text-muted)]">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                  className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Close Modal */}
              <button
                onClick={closeLandscapeModal}
                className="p-1.5 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1 font-bold text-xs px-2.5"
              >
                <X className="w-4 h-4" /> Close
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] relative flex items-center justify-center p-2">
            <div
              style={{
                transform: `scale(${zoomLevel}) ${isRotated90 ? 'rotate(90deg)' : ''}`,
                transformOrigin: 'center center',
                transition: 'transform 0.3s ease-in-out'
              }}
              className="w-full h-full overflow-auto min-w-[750px]"
            >
              {renderTableContent(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
