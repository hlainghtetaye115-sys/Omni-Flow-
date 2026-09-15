import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header, DeviceMode } from './components/Header';
import { LiveClock } from './components/LiveClock';
import { DailyQuoteCard } from './components/DailyQuoteCard';
import { HomeTab } from './components/HomeTab';
import { TableTab } from './components/TableTab';
import { TasksTab } from './components/TasksTab';
import { HabitsTab } from './components/HabitsTab';
import { StatsTab } from './components/StatsTab';
import { ManageTab } from './components/ManageTab';
import { BottomNav } from './components/BottomNav';
import { AlertBanner } from './components/AlertBanner';
import { WidgetView } from './components/WidgetView';
import { NotesModal, EditNameModal, BulkAddModal, NotificationModal, CellEditModal, EditSlotModal, LoginModal, CalendarSyncModal } from './components/Modals';
import { MotivationModal } from './components/MotivationModal';
import { InstallAppModal } from './components/InstallAppModal';
import { WorkplaceTab } from './components/WorkplaceTab';
import { CloudBackupModal } from './components/CloudBackupModal';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { DailyBriefing } from './components/DailyBriefing';
import { FloatingQuickAdd } from './components/FloatingQuickAdd';

import { TimeSlot, TimetableChart, Preferences, NotificationItem, DayCode, ImportantEvent, Habit, WorkShiftItem, Transaction, TransactionType, TransactionCategory } from './types';
import { CompleteAppData } from './utils/backupService';
import { DEFAULT_SLOTS, DEFAULT_DATA_CHART, TEMPLATES, THEME_PRESETS } from './data/defaultData';
import { auth, db, signInWithFirebaseEmail, logOut, handleFirestoreError, OperationType, signInWithGoogle } from './firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendSystemNotification, requestNotificationPermission } from './lib/notifications';
import { audioAlert } from './utils/audioAlert';
import { downloadTimetableIcs } from './utils/calendarExport';
import { getRandomQuote, DailyQuote } from './data/motivationalQuotes';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [customUser, setCustomUser] = useState<{ uid: string; email: string; displayName: string; photoURL?: string | null } | null>(() => {
    try {
      const saved = localStorage.getItem('physics_custom_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const firebaseUser = await signInWithGoogle();
      handleGoogleLoginSuccess({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL
      });
    } catch (err: any) {
      console.warn('Google login failed:', err);
      const errCode = err?.code || 'unknown-error';
      const errMsg = err?.message || String(err);
      showAlert(
        preferences.lang === 'my'
          ? `Google အကောင့် ချိတ်ဆက်၍ မရပါ။ [Error Code: ${errCode}] Firebase Auth နှင့် authorized domain ကို စစ်ဆေးပြီး ပြန်လည်ကြိုးစားပါ။ (${errMsg})`
          : `Google sign-in failed. [Error Code: ${errCode}] Check Firebase Auth and the authorized domain, then try again. (${errMsg})`,
        'danger'
      );
    }
  };

  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  const [xpToasts, setXpToasts] = useState<{ id: number, amount: number, label: string }[]>([]);

  const handleGainXp = (amount: number, label: string) => {
    setPreferences(prev => {
      const currentGamification = prev.gamification || { xp: 0, level: 1 };
      let newXp = currentGamification.xp + amount;
      let newLevel = currentGamification.level;
      
      const nextLevelXp = newLevel * 100;
      let leveledUp = false;
      if (newXp >= nextLevelXp) {
        newXp -= nextLevelXp;
        newLevel++;
        leveledUp = true;
      }
      
      if (leveledUp) {
        setXpToasts(t => [...t, { id: Date.now(), amount, label: 'Level Up!' }]);
      } else {
        setXpToasts(t => [...t, { id: Date.now(), amount, label }]);
      }
      return { ...prev, gamification: { xp: newXp, level: newLevel } };
    });
  };

  useEffect(() => {
    if (xpToasts.length > 0) {
      const timer = setTimeout(() => {
        setXpToasts(t => t.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [xpToasts]);

  const initialLoadDone = useRef(false);
  const quotaExceededRef = useRef(false);
  const syncTimerRef = useRef<any>(null);

  const activeUser = user
    ? { uid: user.uid, email: user.email, displayName: user.displayName || user.email?.split('@')[0] || 'User', photoURL: user.photoURL }
    : customUser;

  const showAlert = (
    message: string,
    type: 'success' | 'warning' | 'danger' | 'info' = 'info',
    action?: { label: string; onClick: () => void }
  ) => {
    if (alertTimeoutId) clearTimeout(alertTimeoutId);
    setAlert({
      message,
      type,
      actionLabel: action?.label,
      onAction: action?.onClick
    });

    // Add to notifications
    const now = new Date();
    const newNotif: NotificationItem = {
      id: Math.random().toString(),
      msg: message,
      type,
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
      read: false
    };
    setNotifications(prev => [...prev.slice(-49), newNotif]);

    const id = setTimeout(() => {
      setAlert({ message: null, type: 'info' });
    }, action ? 6500 : 3500);
    setAlertTimeoutId(id);
  };

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // State Initialization from localStorage or defaults
  const [slots, setSlots] = useState<TimeSlot[]>(() => {
    try {
      const saved = localStorage.getItem('physics_slots');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SLOTS;
  });

  const [chart, setChart] = useState<TimetableChart>(() => {
    try {
      const saved = localStorage.getItem('physics_timetable');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_DATA_CHART;
  });

  const [tasks, setTasks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('physics_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [events, setEvents] = useState<ImportantEvent[]>(() => {
    try {
      const saved = localStorage.getItem('physics_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('physics_habits');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  
  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('omniflow_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('omniflow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const [workShifts, setWorkShifts] = useState<WorkShiftItem[]>(() => {
    try {
      const saved = localStorage.getItem('omniflow_work_shifts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('physics_subject_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const [colors, setColors] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('physics_subject_colors');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const [userName, setUserName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('physics_user_name');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return 'May';
  });

  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    setIsInstallModalOpen(true);
  };

  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem('physics_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      lang: 'my',
      themePreset: 'default',
      accentColor: '#0d47a1',
      bgColor: '#f4f6fa',
      autoTheme: false,
      notifications: true,
      reminderTime: 10,
      soundAlerts: true,
      dailySummary: true,
      timeFormat: '24',
      fontSize: 16
    };
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('physics_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [lastSavedTime, setLastSavedTime] = useState<string>('00:00:00');

  // Device Mode View State (Auto, Mobile, Tablet, Laptop, Desktop)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('auto');
  const [windowWidth, setWindowWidth] = useState<number>(() => typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const detectedMode: 'mobile' | 'tablet' | 'laptop' | 'desktop' = useMemo(() => {
    if (windowWidth < 640) return 'mobile';
    if (windowWidth < 1024) return 'tablet';
    if (windowWidth < 1440) return 'laptop';
    return 'desktop';
  }, [windowWidth]);

  const activeMode = deviceMode === 'auto' ? detectedMode : deviceMode;

  // Alert Banner State
  const [alert, setAlert] = useState<{
    message: string | null;
    type: 'success' | 'warning' | 'danger' | 'info';
    actionLabel?: string;
    onAction?: () => void;
  }>({
    message: null,
    type: 'info'
  });
  const [alertTimeoutId, setAlertTimeoutId] = useState<any>(null);

  // Modals State
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [activeNoteKey, setActiveNoteKey] = useState<string | null>(null);
  const [activeNoteTitle, setActiveNoteTitle] = useState('');
  const [activeNoteDaySlot, setActiveNoteDaySlot] = useState('');
  const [noteTextVal, setNoteTextVal] = useState('');

  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [nameInputVal, setNameInputVal] = useState('');

  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({ startTime: '07:30', endTime: '16:35', duration: 50, count: 9, prefix: 'Slot' });

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isCloudBackupOpen, setIsCloudBackupOpen] = useState(false);
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; tab: 'share' | 'scan' }>({ isOpen: false, tab: 'share' });
  const [isHomeTableExpanded, setIsHomeTableExpanded] = useState(false);
  const [isMotivationModalOpen, setIsMotivationModalOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('physics_onboarding_done') === 'true';
  });
  const [showDailyBriefing, setShowDailyBriefing] = useState<boolean>(() => {
    const lastBriefingDate = localStorage.getItem('physics_last_briefing_date');
    const today = new Date().toISOString().split('T')[0];
    return lastBriefingDate !== today;
  });
  const [savedQuoteIds, setSavedQuoteIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('physics_saved_quote_ids');
      return saved ? JSON.parse(saved) : [1, 2, 46, 47];
    } catch {
      return [1, 2, 46, 47];
    }
  });

  const handleToggleSaveQuote = (id: number) => {
    setSavedQuoteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('physics_saved_quote_ids', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      showAlert(
        prev.includes(id)
          ? (preferences.lang === 'my' ? 'သိမ်းဆည်းထားသော စာစုမှ ပယ်ဖျက်လိုက်ပါပြီ' : 'Removed from favorites')
          : (preferences.lang === 'my' ? 'စိတ်ကြိုက်စာစုများထဲသို့ သိမ်းဆည်းပြီးပါပြီ ❤️' : 'Saved to favorites ❤️'),
        'success'
      );
      return next;
    });
  };

  const [customQuotes, setCustomQuotes] = useState<DailyQuote[]>(() => {
    try {
      const saved = localStorage.getItem('omniflow_user_custom_quotes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddCustomQuote = (newQuote: DailyQuote) => {
    setCustomQuotes((prev) => {
      const updated = [newQuote, ...prev.filter((q) => q.id !== newQuote.id)];
      try {
        localStorage.setItem('omniflow_user_custom_quotes', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showAlert(
      preferences.lang === 'my'
        ? 'ကိုယ်ပိုင် စာသား အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ ✨'
        : 'Custom quote saved successfully ✨',
      'success'
    );
  };

  const handleDeleteCustomQuote = (id: number) => {
    setCustomQuotes((prev) => {
      const updated = prev.filter((q) => q.id !== id);
      try {
        localStorage.setItem('omniflow_user_custom_quotes', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showAlert(
      preferences.lang === 'my'
        ? 'ကိုယ်ပိုင် စာသားကို ဖျက်လိုက်ပါပြီ'
        : 'Custom quote removed',
      'info'
    );
  };
  const [cellEditModal, setCellEditModal] = useState<{
    isOpen: boolean;
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
  } | null>(null);

  const [editSlotModalState, setEditSlotModalState] = useState<{
    isOpen: boolean;
    slot: TimeSlot | null;
  }>({ isOpen: false, slot: null });

  // Template backup/history
  const [templateBackup, setTemplateBackup] = useState<any>(null);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);

  // Save to localStorage when state changes and debounce cloud sync
  useEffect(() => {
    try {
      localStorage.setItem('physics_slots', JSON.stringify(slots));
      localStorage.setItem('physics_timetable', JSON.stringify(chart));
      localStorage.setItem('physics_tasks', JSON.stringify(tasks));
      localStorage.setItem('physics_events', JSON.stringify(events));
      localStorage.setItem('physics_habits', JSON.stringify(habits));
      localStorage.setItem('omniflow_work_shifts', JSON.stringify(workShifts));
      localStorage.setItem('physics_subject_notes', JSON.stringify(notes));
      localStorage.setItem('physics_subject_colors', JSON.stringify(colors));
      localStorage.setItem('physics_prefs', JSON.stringify(preferences));
      localStorage.setItem('physics_user_name', JSON.stringify(userName));
      localStorage.setItem('physics_notifications', JSON.stringify(notifications));
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLastSavedTime(timeStr);
      
      // Debounce Cloud Sync (3 seconds delay) to prevent quota exhaustion and loops
      if (activeUser && initialLoadDone.current && !isCloudSyncing && !quotaExceededRef.current) {
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        
        syncTimerRef.current = setTimeout(async () => {
          const targetUid = activeUser.uid;
          const path = `users/${targetUid}`;
          try {
            await setDoc(doc(db, 'users', targetUid), {
        slots,
        chart,
        tasks,
        events,
        habits,
        workShifts,
        transactions,
        notes,
        colors,
        preferences: { ...preferences, customWallpaper: null },
        userName,
        userEmail: activeUser.email,
        updatedAt: serverTimestamp()
      }, { merge: true });
            setLastCloudSyncTime(new Date().toLocaleTimeString('my-MM'));
          } catch (err: any) {
            if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota') || err?.message?.includes('resource-exhausted')) {
              quotaExceededRef.current = true;
              console.warn("Firestore write quota reached. LocalStorage mode active.");
            } else if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
              console.warn("Firestore offline. Local cache only for now.");
            } else {
              handleFirestoreError(err, OperationType.WRITE, path);
            }
          }
        }, 3000);
      }
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [slots, chart, tasks, events, habits, workShifts, notes, colors, preferences, userName, activeUser, isCloudSyncing]);

  // Offline Status Detector for PWA
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Manual Force Cloud Backup
  const handleForceCloudBackup = async (): Promise<boolean> => {
    if (!activeUser?.uid) {
      setIsLoginModalOpen(true);
      return false;
    }
    setIsCloudSyncing(true);
    const targetUid = activeUser.uid;
    const path = `users/${targetUid}`;
    try {
      await setDoc(doc(db, 'users', targetUid), {
        slots,
        chart,
        tasks,
        events,
        habits,
        workShifts,
        transactions,
        notes,
        colors,
        preferences: { ...preferences, customWallpaper: null },
        userName,
        userEmail: activeUser.email,
        updatedAt: serverTimestamp()
      }, { merge: true });
      const nowStr = new Date().toLocaleTimeString('my-MM');
      setLastCloudSyncTime(nowStr);
      showAlert(
        preferences.lang === 'my'
          ? `☁️ အချက်အလက်များအားလုံး (${activeUser.email || activeUser.displayName}) Google Cloud ပေါ်သို့ အောင်မြင်စွာ Backup သိမ်းဆည်းပြီးပါပြီ ✅`
          : `All data backed up to Google Cloud (${activeUser.email || activeUser.displayName}) ✅`,
        'success'
      );
      return true;
    } catch (err: any) {
      console.error('Manual Cloud Backup Error:', err);
      showAlert(
        preferences.lang === 'my'
          ? 'Cloud ပေါ်သို့ Backup သိမ်းဆည်းရာတွင် အဆင်မပြေဖြစ်သွားပါသည်။ ပြန်လည်ကြိုးစားပေးပါ။'
          : 'Failed to backup to cloud. Please retry.',
        'danger'
      );
      return false;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Manual Force Cloud Restore
  const handleForceCloudRestore = async (): Promise<boolean> => {
    if (!activeUser?.uid) {
      setIsLoginModalOpen(true);
      return false;
    }
    setIsCloudSyncing(true);
    const targetUid = activeUser.uid;
    const path = `users/${targetUid}`;
    try {
      const docRef = doc(db, 'users', targetUid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.slots) setSlots(data.slots);
        if (data.chart) setChart(data.chart);
        if (data.tasks) setTasks(data.tasks);
        if (data.events) setEvents(data.events);
        if (data.habits) setHabits(data.habits);
        if (data.workShifts) setWorkShifts(data.workShifts);
        if (data.transactions) setTransactions(data.transactions);
        if (data.notes) setNotes(data.notes);
        if (data.colors) setColors(data.colors);
        if (data.preferences) setPreferences(data.preferences);
        if (data.userName) setUserName(data.userName);
        if (data.notifications) setNotifications(data.notifications);

        showAlert(
          preferences.lang === 'my'
            ? `📥 Google Cloud (${activeUser.email}) မှ အချက်အလက်များ အားလုံး အောင်မြင်စွာ ပြန်လည်ရယူပြီးပါပြီ 🎉`
            : `All data successfully restored from Google Cloud (${activeUser.email}) 🎉`,
          'success'
        );
        return true;
      } else {
        showAlert(
          preferences.lang === 'my'
            ? 'Cloud ပေါ်တွင် ဤအကောင့်အတွက် ယခင် Backup မှတ်တမ်း မရှိသေးပါ။'
            : 'No cloud backup found for this account yet.',
          'warning'
        );
        return false;
      }
    } catch (err: any) {
      console.error('Manual Cloud Restore Error:', err);
      showAlert(
        preferences.lang === 'my'
          ? 'Cloud မှ အချက်အလက်များ ပြန်ယူရာတွင် အဆင်မပြေဖြစ်သွားပါသည်။'
          : 'Failed to restore from cloud.',
        'danger'
      );
      return false;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Sync Cloud Data when user changes
  useEffect(() => {
    if (!activeUser?.uid) {
      initialLoadDone.current = true;
      return;
    }

    let isMounted = true;
    const loadCloudData = async () => {
      setIsCloudSyncing(true);
      const targetUid = activeUser.uid;
      const path = `users/${targetUid}`;
      try {
        const docRef = doc(db, 'users', targetUid);
        const docSnap = await getDoc(docRef);
        if (!isMounted) return;

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.slots) setSlots(data.slots);
          if (data.chart) setChart(data.chart);
          if (data.tasks) setTasks(data.tasks);
          if (data.events) setEvents(data.events);
          if (data.habits) setHabits(data.habits);
          if (data.workShifts) setWorkShifts(data.workShifts);
          if (data.notes) setNotes(data.notes);
          if (data.colors) setColors(data.colors);
          if (data.preferences) setPreferences(data.preferences);
          if (data.userName) setUserName(data.userName);
          if (data.notifications) setNotifications(data.notifications);
          setLastCloudSyncTime(new Date().toLocaleTimeString('my-MM'));
        } else if (!quotaExceededRef.current) {
          // If no cloud document exists yet, save current local state to cloud so user never loses their data!
          const initUserName = activeUser.displayName || userName || 'User';
          const currentSlots = (slots && slots.length > 0) ? slots : DEFAULT_SLOTS;
          const currentChart = (chart && Object.keys(chart).length > 0) ? chart : DEFAULT_DATA_CHART;
          const currentTasks = tasks || [];
          const currentEvents = events || [];
          const currentHabits = habits || [];
          const currentWorkShifts = workShifts || [];
          const currentNotes = notes || {};
          const currentColors = colors || {};

          try {
            await setDoc(docRef, {
              slots: currentSlots,
              chart: currentChart,
              tasks: currentTasks,
              events: currentEvents,
              habits: currentHabits,
              workShifts: currentWorkShifts,
              notes: currentNotes,
              colors: currentColors,
              preferences,
              userName: initUserName,
              userEmail: activeUser.email,
              updatedAt: serverTimestamp()
            });
            setLastCloudSyncTime(new Date().toLocaleTimeString('my-MM'));
          } catch (e: any) {
            if (e?.code === 'resource-exhausted' || e?.message?.includes('Quota')) {
              quotaExceededRef.current = true;
            } else if (e?.code === 'unavailable' || e?.message?.includes('offline')) {
              console.warn('Firestore is offline or unavailable. Operating locally.');
            } else {
              handleFirestoreError(e, OperationType.WRITE, path);
            }
          }
        }
      } catch (error: any) {
        if (error?.code === 'resource-exhausted' || error?.message?.includes('Quota')) {
          quotaExceededRef.current = true;
          console.warn('Firestore quota reached during read. Local cache active.');
        } else if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
          console.warn('Firestore is offline or unavailable. Operating locally.');
        } else {
          handleFirestoreError(error, OperationType.GET, path);
        }
      } finally {
        if (isMounted) {
          setIsCloudSyncing(false);
          initialLoadDone.current = true;
        }
      }
    };

    loadCloudData();

    return () => {
      isMounted = false;
    };
  }, [activeUser?.uid]);

  // Apply Theme, CSS Variables & High Contrast Text Mode
  useEffect(() => {
    const root = document.documentElement;
    const preset = THEME_PRESETS[preferences.themePreset] || THEME_PRESETS['default'];

    Object.keys(preset).forEach(key => {
      root.style.setProperty(key, preset[key]);
    });

    const isDarkPreset = preferences.themePreset === 'dark' || preferences.themePreset === 'cyber_neon' || preferences.themePreset === 'high_contrast_dark';

    if (isDarkPreset) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      if (preferences.themePreset !== 'default') {
        root.setAttribute('data-theme', preferences.themePreset);
      }
    }

    if (preferences.accentColor) {
      root.style.setProperty('--color-primary', preferences.accentColor);
    }
    if (preferences.bgColor && !isDarkPreset) {
      root.style.setProperty('--color-bg-body', preferences.bgColor);
    }

    // High Contrast & Ultra Crisp Text Legibility Mode
    if (preferences.highContrastText) {
      root.style.setProperty('--color-text-primary', isDarkPreset ? '#ffffff' : '#000000');
      root.style.setProperty('--color-text-secondary', isDarkPreset ? '#f8fafc' : '#0f172a');
      root.style.setProperty('--color-text-muted', isDarkPreset ? '#cbd5e1' : '#334155');
      root.classList.add('ultra-crisp-text');
    } else {
      root.classList.remove('ultra-crisp-text');
    }

    // Dynamic Font Size Scaling across entire app (rem relative scaling)
    const size = preferences.fontSize || 16;
    root.style.fontSize = `${size}px`;
    root.style.setProperty('--app-font-size', `${size}px`);

    // Premium Border Styles & Customizations Handling
    ['border-style-sleek', 'border-style-glass', 'border-style-soft', 'border-style-sharp', 'border-style-glow', 'border-style-ios'].forEach(cls => {
      root.classList.remove(cls);
    });
    const currentBorderStyle = preferences.borderStyle || 'sleek';
    root.classList.add(`border-style-${currentBorderStyle}`);

    // Advanced Border Customization CSS Variables
    const borderWidthVal = preferences.borderWidth ?? 1;
    root.style.setProperty('--custom-border-width', `${borderWidthVal}px`);
    root.style.setProperty('--custom-border-style', preferences.borderTexture || 'solid');
    root.style.setProperty('--custom-border-opacity', `${(preferences.borderOpacity ?? 100) / 100}`);
    root.style.setProperty('--custom-border-glow-color', preferences.borderGlowColor || 'var(--color-primary)');
    root.classList.add('custom-border-apply');
  }, [preferences]);

  // Trigger Alert Helper
  
  // Live Timer & Status Engine
  const [timeState, setTimeState] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTimeState(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [alertedClasses, setAlertedClasses] = useState<Record<string, boolean>>({});
  const daysMap: DayCode[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const currentDay = daysMap[timeState.getDay()];

  // Request Notification Permission
  useEffect(() => {
    if (preferences.notifications) {
      requestNotificationPermission();
    }
  }, [preferences.notifications]);

  // Pre-class alerts
  useEffect(() => {
    if (!preferences.notifications) return;

    const todayClasses = chart[currentDay] || [];
    const reminderMins = preferences.reminderTime || 10;
    
    const nowMins = timeState.getHours() * 60 + timeState.getMinutes();
    const futureMins = nowMins + reminderMins;

    todayClasses.forEach(cls => {
      const alertKey = `${currentDay}-${cls.start}-${timeState.toLocaleDateString()}`;
      if (alertedClasses[alertKey]) return;

      const [cH, cM] = cls.start.split(':').map(Number);
      const clsMins = cH * 60 + cM;

      let isTrigger = false;
      if (futureMins >= 24 * 60) {
        // Handle midnight crossover
        isTrigger = clsMins > nowMins || clsMins <= (futureMins % (24 * 60));
      } else {
        isTrigger = clsMins > nowMins && clsMins <= futureMins;
      }

      if (isTrigger) {
        const msg = preferences.lang === 'my'
          ? `သတိပေးချက်: ${cls.name} အတန်းသည် ${cls.start} တွင် စတင်ပါမည်။`
          : `Reminder: ${cls.name} starts at ${cls.start}.`;
        
        showAlert(msg, 'info');
        
        if (preferences.soundAlerts) {
          audioAlert.playSound(preferences.soundType || 'gentle_chime', preferences.soundVolume || 80);
        }
        if (preferences.vibrationAlerts !== false) {
          audioAlert.triggerVibration(preferences.vibrationPattern || 'gentle');
        }

        // System / Service Worker Lock Screen Notification
        sendSystemNotification(
          preferences.lang === 'my' ? 'အတန်းစတော့မည်!' : 'Upcoming Class!',
          msg,
          { tag: alertKey, sound: preferences.soundAlerts }
        );
        
        setAlertedClasses(prev => ({ ...prev, [alertKey]: true }));
      }
    });
  }, [timeState, chart, preferences, currentDay, alertedClasses]);

  // Daily Summary at 9 PM
  useEffect(() => {
    if (!preferences.dailySummary) return;
    const nowHour = timeState.getHours();
    const nowMin = timeState.getMinutes();
    const summaryKey = `summary-${timeState.toLocaleDateString()}`;
    
    if (nowHour === 21 && nowMin === 0 && !alertedClasses[summaryKey]) {
      const tomorrowIdx = (timeState.getDay() + 1) % 7;
      const tomorrowDay = daysMap[tomorrowIdx];
      const tomorrowClasses = chart[tomorrowDay] || [];
      const msg = preferences.lang === 'my' 
        ? `မနက်ဖြန်အတွက် အတန်း ${tomorrowClasses.length} ခုရှိပါတယ်။` 
        : `You have ${tomorrowClasses.length} classes scheduled for tomorrow.`;
        
      showAlert(msg, 'info');
      sendSystemNotification(
        preferences.lang === 'my' ? 'နေ့စဉ်အကျဉ်းချုပ်' : 'Daily Summary',
        msg,
        { tag: summaryKey, sound: preferences.soundAlerts }
      );
      setAlertedClasses(prev => ({ ...prev, [summaryKey]: true }));
    }
  }, [timeState, preferences, chart, daysMap, alertedClasses]);

  // Advance Alert check for Important Events (Exams, Deadlines, Assignments)
  useEffect(() => {
    if (!preferences.notifications || events.length === 0) return;

    const now = timeState.getTime();

    events.forEach(evt => {
      if (evt.completed) return;
      const alertKey = `event-${evt.id}-${evt.date}-${evt.time}`;
      if (alertedClasses[alertKey]) return;

      const targetTime = new Date(`${evt.date}T${evt.time}`).getTime();
      if (isNaN(targetTime)) return;

      const alertTime = targetTime - (evt.alertOffset || 0) * 60 * 1000;

      if (now >= alertTime && now <= targetTime + 15 * 60 * 1000) {
        const catName = evt.category.toUpperCase();
        const msg = preferences.lang === 'my'
          ? `သတိပေးချက် (${catName}): "${evt.title}" - ${evt.date} အချိန် ${evt.time} တွင် ရှိပါသည်။`
          : `Reminder (${catName}): "${evt.title}" scheduled for ${evt.date} at ${evt.time}.`;

        showAlert(msg, evt.priority === 'high' ? 'danger' : 'warning');

        if (preferences.soundAlerts) {
          audioAlert.playSound(preferences.soundType || 'gentle_chime', preferences.soundVolume || 80);
        }
        if (preferences.vibrationAlerts !== false) {
          audioAlert.triggerVibration(preferences.vibrationPattern || 'gentle');
        }

        sendSystemNotification(
          preferences.lang === 'my' ? 'အရေးကြီး သတိပေးချက်!' : 'Important Event Reminder!',
          msg,
          { tag: alertKey, sound: preferences.soundAlerts }
        );

        setAlertedClasses(prev => ({ ...prev, [alertKey]: true }));
      }
    });
  }, [timeState, events, preferences, alertedClasses]);

  const time24 = `${String(timeState.getHours()).padStart(2, '0')}:${String(timeState.getMinutes()).padStart(2, '0')}`;
  const todayClasses = chart[currentDay] || [];
  const sortedToday = [...todayClasses].sort((a, b) => a.start.localeCompare(b.start));

  let currentActivity = null;
  let nextActivity = null;

  sortedToday.forEach(cls => {
    if (time24 >= cls.start && time24 <= cls.end) currentActivity = cls;
    else if (cls.start > time24 && !nextActivity) nextActivity = cls;
  });

  const tomorrowIdx = (timeState.getDay() + 1) % 7;
  const tomorrowDay = daysMap[tomorrowIdx];
  const tomorrowClasses = [...(chart[tomorrowDay] || [])].sort((a, b) => a.start.localeCompare(b.start));

  // Upcoming classes calculation
  const upcomingClasses: { day: DayCode; dayName: string; cls: any; order: number }[] = [];
  const dayOrder: DayCode[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const startIndex = dayOrder.indexOf(currentDay);

  for (let i = 0; i < 7; i++) {
    const dIdx = (startIndex + i) % 7;
    const d = dayOrder[dIdx];
    const clss = [...(chart[d] || [])].sort((a, b) => a.start.localeCompare(b.start));
    clss.forEach(cls => {
      if (i === 0 && time24 > cls.end) return;
      if (i === 0 && time24 > cls.start) return;
      upcomingClasses.push({
        day: d,
        dayName: d,
        cls,
        order: i
      });
    });
  }
  upcomingClasses.sort((a, b) => a.order !== b.order ? a.order - b.order : a.cls.start.localeCompare(b.cls.start));

  // Handlers for Slots & Activities
  const handleSaveSlot = (slotData: { id?: number; start: string; end: string; label: string }) => {
    if (slotData.start >= slotData.end) {
      showAlert(preferences.lang === 'my' ? 'စတင်ချိန်သည် ပြီးဆုံးချိန်ထက် စောရပါမည်။' : 'Start time must be before end time.', 'warning');
      return;
    }

    let updatedSlots: TimeSlot[];
    if (slotData.id) {
      updatedSlots = slots.map(s => s.id === slotData.id ? { ...s, start: slotData.start, end: slotData.end, label: slotData.label } : s);
      showAlert(preferences.lang === 'my' ? 'Slot အချိန် ပြင်ဆင်ပြီး အချိန်ဇယားတစ်ခုလုံး အလိုအလျောက် Update ပြုလုပ်ပြီးပါပြီ။' : 'Slot updated & schedule synced!', 'success');
    } else {
      const newId = slots.length > 0 ? Math.max(...slots.map(s => s.id)) + 1 : 1;
      updatedSlots = [...slots, { id: newId, start: slotData.start, end: slotData.end, label: slotData.label }];
      showAlert(preferences.lang === 'my' ? 'Slot အသစ်ထည့်သွင်းပြီးပါပြီ။' : 'New slot added successfully!', 'success');
    }
    
    updatedSlots.sort((a, b) => a.start.localeCompare(b.start));
    setSlots(updatedSlots);

    // Synchronize all chart activities that utilize updated slots
    const newChart = { ...chart };
    let chartChanged = false;
    Object.keys(newChart).forEach(d => {
      const dayCode = d as DayCode;
      newChart[dayCode] = (newChart[dayCode] || []).map(act => {
        if (act.slots && act.slots.length > 0) {
          const sorted = [...act.slots].sort((a, b) => {
            const slotA = updatedSlots.find(s => s.id === a);
            const slotB = updatedSlots.find(s => s.id === b);
            return (slotA?.start || '').localeCompare(slotB?.start || '');
          });
          const first = updatedSlots.find(s => s.id === sorted[0]);
          const last = updatedSlots.find(s => s.id === sorted[sorted.length - 1]);
          if (first && last) {
            const timeStr = sorted.length > 1 ? `${first.start}-${last.end}` : (first.label || `${first.start}-${first.end}`);
            chartChanged = true;
            return {
              ...act,
              slots: sorted,
              start: first.start,
              end: last.end,
              timeStr
            };
          }
        }
        return act;
      });
    });
    if (chartChanged) {
      setChart(newChart);
    }
  };

  const handleDeleteSlot = (id: number) => {
    const slotToDelete = slots.find(s => s.id === id);
    if (!slotToDelete) return;

    // Snapshot previous state for Undo restoration
    const prevSlots = [...slots];
    const prevChart = JSON.parse(JSON.stringify(chart));
    const prevNotes = { ...notes };

    const nextSlots = slots.filter(s => s.id !== id);
    setSlots(nextSlots);

    const nextChart = { ...chart };
    Object.keys(nextChart).forEach(d => {
      const dayCode = d as DayCode;
      nextChart[dayCode] = (nextChart[dayCode] || [])
        .map(act => ({
          ...act,
          slots: act.slots.filter(sid => sid !== id)
        }))
        .filter(act => act.slots.length > 0);
    });
    setChart(nextChart);

    const slotLabel = slotToDelete.label || `${slotToDelete.start}-${slotToDelete.end}`;
    const msg = preferences.lang === 'my'
      ? `Time Slot "${slotLabel}" ကို ဖျက်ပြီးပါပြီ။`
      : `Time slot "${slotLabel}" deleted.`;

    showAlert(msg, 'info', {
      label: preferences.lang === 'my' ? '↩ ပြန်ယူမည်' : '↩ Undo',
      onClick: () => {
        setSlots(prevSlots);
        setChart(prevChart);
        setNotes(prevNotes);
        showAlert(
          preferences.lang === 'my' ? `Time Slot "${slotLabel}" ကို ပြန်လည်ရယူပြီးပါပြီ။` : `Time slot "${slotLabel}" restored.`,
          'success'
        );
      }
    });
  };

  const handleQuickAdjustSlotDuration = (slotId: number, deltaMinutes: number) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;
    const [sh, sm] = slot.start.split(':').map(Number);
    const [eh, em] = slot.end.split(':').map(Number);
    const startMins = sh * 60 + sm;
    let endMins = eh * 60 + em + deltaMinutes;
    if (endMins <= startMins + 5) {
      endMins = startMins + 5;
    }
    if (endMins >= 1440) endMins = 1439;

    const newEh = String(Math.floor(endMins / 60)).padStart(2, '0');
    const newEm = String(endMins % 60).padStart(2, '0');
    const newEnd = `${newEh}:${newEm}`;
    const newLabel = (!slot.label || slot.label.includes('-') || slot.label.includes('–') || slot.label.includes(':'))
      ? `${slot.start}-${newEnd}`
      : slot.label;

    handleSaveSlot({
      id: slot.id,
      start: slot.start,
      end: newEnd,
      label: newLabel
    });
  };

  const handleShiftAllSlots = (deltaMinutes: number) => {
    if (slots.length === 0) return;
    const isMM = preferences.lang === 'my';
    const updated = slots.map(s => {
      const [sh, sm] = s.start.split(':').map(Number);
      const [eh, em] = s.end.split(':').map(Number);
      let sMins = (sh * 60 + sm + deltaMinutes);
      let eMins = (eh * 60 + em + deltaMinutes);
      if (sMins < 0) {
        eMins -= sMins;
        sMins = 0;
      }
      if (eMins >= 1440) {
        sMins -= (eMins - 1439);
        eMins = 1439;
      }
      const newSh = String(Math.floor(sMins / 60)).padStart(2, '0');
      const newSm = String(sMins % 60).padStart(2, '0');
      const newEh = String(Math.floor(eMins / 60)).padStart(2, '0');
      const newEm = String(eMins % 60).padStart(2, '0');
      const newStart = `${newSh}:${newSm}`;
      const newEnd = `${newEh}:${newEm}`;
      const newLabel = (!s.label || s.label.includes('-') || s.label.includes('–') || s.label.includes(':'))
        ? `${newStart}-${newEnd}`
        : s.label;
      return {
        ...s,
        start: newStart,
        end: newEnd,
        label: newLabel
      };
    });

    updated.sort((a, b) => a.start.localeCompare(b.start));
    setSlots(updated);

    // Sync chart items
    const newChart = { ...chart };
    let chartChanged = false;
    Object.keys(newChart).forEach(d => {
      const dayCode = d as DayCode;
      newChart[dayCode] = (newChart[dayCode] || []).map(act => {
        if (act.slots && act.slots.length > 0) {
          const sorted = [...act.slots].sort((a, b) => {
            const slotA = updated.find(s => s.id === a);
            const slotB = updated.find(s => s.id === b);
            return (slotA?.start || '').localeCompare(slotB?.start || '');
          });
          const first = updated.find(s => s.id === sorted[0]);
          const last = updated.find(s => s.id === sorted[sorted.length - 1]);
          if (first && last) {
            const timeStr = sorted.length > 1 ? `${first.start}-${last.end}` : (first.label || `${first.start}-${first.end}`);
            chartChanged = true;
            return {
              ...act,
              slots: sorted,
              start: first.start,
              end: last.end,
              timeStr
            };
          }
        }
        return act;
      });
    });
    if (chartChanged) {
      setChart(newChart);
    }
    showAlert(
      isMM
        ? `အချိန်အားလုံးကို ${deltaMinutes > 0 ? '+' : ''}${deltaMinutes} မိနစ် ရွှေ့ပေးလိုက်ပါပြီ။`
        : `Shifted all time slots by ${deltaMinutes > 0 ? '+' : ''}${deltaMinutes} minutes.`,
      'success'
    );
  };

  const handleDuplicateSlot = (id: number) => {
    const s = slots.find(item => item.id === id);
    if (!s) return;
    setBulkConfig({ startTime: s.start, endTime: s.end, duration: 50, count: 1, prefix: s.label });
    setIsBulkAddOpen(true);
  };

  const handleResetSlots = () => {
    if (!confirm('Reset time slots to default?')) return;
    setSlots(DEFAULT_SLOTS);
    showAlert('Slots reset to default.', 'success');
  };

  const handleExecuteBulkAdd = () => {
    const { startTime, endTime, duration, count, prefix } = bulkConfig;
    const cur = new Date(`2000-01-01T${startTime}:00`);
    const endD = new Date(`2000-01-01T${endTime}:00`);
    const newSlots: TimeSlot[] = [];
    let idCounter = slots.length > 0 ? Math.max(...slots.map(s => s.id)) + 1 : 1;

    for (let i = 0; i < count; i++) {
      const sStr = cur.toTimeString().substring(0, 5);
      const eTime = new Date(cur.getTime() + duration * 60000);
      if (eTime > endD) break;
      const eStr = eTime.toTimeString().substring(0, 5);
      const label = prefix ? `${prefix} ${i + 1}` : `${sStr}-${eStr}`;
      newSlots.push({ id: idCounter++, label, start: sStr, end: eStr });
      cur.setTime(eTime.getTime());
    }

    if (newSlots.length === 0) {
      showAlert('Cannot create slots in given range.', 'warning');
      return;
    }

    setSlots([...slots, ...newSlots].sort((a, b) => a.start.localeCompare(b.start)));
    setIsBulkAddOpen(false);
    showAlert(`${newSlots.length} slots added successfully.`, 'success');
  };

  const handleInsertActivity = (
    day: DayCode,
    slotIds: number[],
    name: string,
    color: string,
    category: 'work' | 'personal' | 'relationship',
    extra?: {
      room?: string;
      instructor?: string;
      link?: string;
      reminderOffset?: number;
    }
  ) => {
    const existing = chart[day] || [];
    const filtered = existing.filter(act => !act.slots.some(id => slotIds.includes(id)));
    const sorted = [...slotIds].sort((a, b) => {
      const slotA = slots.find(s => s.id === a);
      const slotB = slots.find(s => s.id === b);
      return (slotA?.start || '').localeCompare(slotB?.start || '');
    });
    const first = slots.find(s => s.id === sorted[0]);
    const last = slots.find(s => s.id === sorted[sorted.length - 1]);
    const timeStr = sorted.length > 1 && first && last ? `${first.start}-${last.end}` : (first?.label || '');

    const newAct = {
      slots: sorted,
      name,
      start: first?.start || '08:00',
      end: last?.end || '09:00',
      timeStr,
      customBg: color,
      category,
      room: extra?.room,
      instructor: extra?.instructor,
      link: extra?.link,
      reminderOffset: extra?.reminderOffset
    };

    setChart({
      ...chart,
      [day]: [...filtered, newAct]
    });
    setColors(prev => ({ ...prev, [name]: color }));
    showAlert(preferences.lang === 'my' ? 'ဘာသာရပ် သိမ်းဆည်းပြီး Cloud & Local သို့ အလိုအလျောက် Backup လုပ်ပြီးပါပြီ။' : 'Activity saved & auto-backed up to Cloud/Local!', 'success');
  };

  const handleDeleteActivity = (day: DayCode, slotIds: number[], actName?: string) => {
    const existing = chart[day] || [];
    const targetAct = existing.find(act => act.slots.some(id => slotIds.includes(id)));
    const filtered = existing.filter(act => {
      const overlaps = act.slots.some(id => slotIds.includes(id));
      return !overlaps;
    });
    const prevChart = { ...chart };
    const prevNotes = { ...notes };

    setChart({ ...chart, [day]: filtered });
    const newNotes = { ...notes };
    slotIds.forEach(id => {
      delete newNotes[`${day}_slot${id}`];
    });
    setNotes(newNotes);

    const deletedName = actName || targetAct?.name || (preferences.lang === 'my' ? 'ဘာသာရပ်' : 'Activity');
    showAlert(
      preferences.lang === 'my'
        ? `"${deletedName}" အား အချိန်ဇယားမှ ဖျက်လိုက်ပါပြီ။`
        : `Removed "${deletedName}" from timetable.`,
      'info',
      {
        label: preferences.lang === 'my' ? '↩ ပြန်ယူမည်' : '↩ Undo',
        onClick: () => {
          setChart(prevChart);
          setNotes(prevNotes);
          showAlert(
            preferences.lang === 'my' ? 'မူလအတိုင်း ပြန်လည်ထားရှိပြီးပါပြီ။' : 'Restored successfully.',
            'success'
          );
        }
      }
    );
  };

  // Quick Duplicate to Multiple Days
  const handleDuplicateToDays = (
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
  ) => {
    const newChart = { ...chart };
    const newNotes = { ...notes };

    const sorted = [...slotIds].sort((a, b) => {
      const slotA = slots.find(s => s.id === a);
      const slotB = slots.find(s => s.id === b);
      return (slotA?.start || '').localeCompare(slotB?.start || '');
    });
    const first = slots.find(s => s.id === sorted[0]);
    const last = slots.find(s => s.id === sorted[sorted.length - 1]);
    const timeStr = sorted.length > 1 && first && last ? `${first.start}-${last.end}` : (first?.label || '');

    const newAct = {
      slots: sorted,
      name: data.name,
      start: first?.start || '08:00',
      end: last?.end || '09:00',
      timeStr,
      customBg: data.color,
      category: data.category,
      room: data.room,
      instructor: data.instructor,
      link: data.link,
      reminderOffset: data.reminderOffset
    };

    targetDays.forEach(dayCode => {
      const day = dayCode as DayCode;
      const existing = newChart[day] || [];
      const filtered = existing.filter(act => !act.slots.some(id => slotIds.includes(id)));
      newChart[day] = [...filtered, newAct];

      if (data.note.trim()) {
        slotIds.forEach(id => {
          newNotes[`${day}_slot${id}`] = data.note.trim();
        });
      }
    });

    setChart(newChart);
    setNotes(newNotes);
    setColors(prev => ({ ...prev, [data.name]: data.color }));
    setCellEditModal(null);
    showAlert(preferences.lang === 'my' ? `ဘာသာရပ် "${data.name}" ကို နေ့ရက်ပေါင်း (${targetDays.length}) ရက်သို့ အောင်မြင်စွာ ကူးယူပြီးပါပြီ။` : `Copied "${data.name}" to ${targetDays.length} days!`, 'success');
  };

  // Quick Move or Copy to another Day/Slot
  const handleMoveOrCopy = (
    sourceDay: string,
    sourceSlotIds: number[],
    targetDay: string,
    targetSlotId: number,
    mode: 'move' | 'copy',
    data: { name: string; color: string; category: 'work' | 'personal' | 'relationship'; note: string }
  ) => {
    const newChart = { ...chart };
    const newNotes = { ...notes };

    // If move, delete from source
    if (mode === 'move') {
      const srcActivities = newChart[sourceDay as DayCode] || [];
      newChart[sourceDay as DayCode] = srcActivities.filter(act => !act.slots.some(id => sourceSlotIds.includes(id)));
      sourceSlotIds.forEach(id => {
        delete newNotes[`${sourceDay}_slot${id}`];
      });
    }

    // Insert into target
    const targetSlot = slots.find(s => s.id === targetSlotId);
    const targetActivities = newChart[targetDay as DayCode] || [];
    const filteredTarget = targetActivities.filter(act => !act.slots.includes(targetSlotId));

    const newAct = {
      slots: [targetSlotId],
      name: data.name,
      start: targetSlot?.start || '08:00',
      end: targetSlot?.end || '09:00',
      timeStr: targetSlot?.label || '',
      customBg: data.color,
      category: data.category
    };

    newChart[targetDay as DayCode] = [...filteredTarget, newAct];
    if (data.note.trim()) {
      newNotes[`${targetDay}_slot${targetSlotId}`] = data.note.trim();
    }

    setChart(newChart);
    setNotes(newNotes);
    setColors(prev => ({ ...prev, [data.name]: data.color }));
    setCellEditModal(null);
    showAlert(
      mode === 'move'
        ? (preferences.lang === 'my' ? `အတန်းကို ${targetDay} အချိန်ကွက်သို့ အောင်မြင်စွာ ရွှေ့ပြောင်းပြီးပါပြီ။` : `Moved class to ${targetDay} slot!`)
        : (preferences.lang === 'my' ? `အတန်းကို ${targetDay} အချိန်ကွက်သို့ အောင်မြင်စွာ ကူးယူပြီးပါပြီ။` : `Copied class to ${targetDay} slot!`),
      'success'
    );
  };

  // 1-Click Paste from Table Clipboard
  const handlePasteToSlot = (
    day: DayCode,
    slotId: number,
    data: { name: string; color: string; category: 'work' | 'personal' | 'relationship'; note?: string }
  ) => {
    const slot = slots.find(s => s.id === slotId);
    const existing = chart[day] || [];
    const filtered = existing.filter(act => !act.slots.includes(slotId));

    const newAct = {
      slots: [slotId],
      name: data.name,
      start: slot?.start || '08:00',
      end: slot?.end || '09:00',
      timeStr: slot?.label || '',
      customBg: data.color,
      category: data.category
    };

    setChart({
      ...chart,
      [day]: [...filtered, newAct]
    });
    setColors(prev => ({ ...prev, [data.name]: data.color }));

    if (data.note?.trim()) {
      setNotes({
        ...notes,
        [`${day}_slot${slotId}`]: data.note.trim()
      });
    }

    showAlert(`Pasted "${data.name}" to ${day} (${slot?.label || slotId})`, 'success');
  };

  // Drag and Drop Swap/Move Activity
  const handleSwapOrMoveActivity = (
    sourceDay: DayCode,
    sourceSlotId: number,
    targetDay: DayCode,
    targetSlotId: number
  ) => {
    if (sourceDay === targetDay && sourceSlotId === targetSlotId) return;

    setChart(prevChart => {
      const nextChart = { ...prevChart };
      const srcList = [...(nextChart[sourceDay] || [])];
      const targetList = sourceDay === targetDay ? srcList : [...(nextChart[targetDay] || [])];

      const srcActIdx = srcList.findIndex(c => c.slots && c.slots.includes(sourceSlotId));
      if (srcActIdx < 0) return prevChart;

      const srcAct = { ...srcList[srcActIdx] };
      const targetActIdx = targetList.findIndex(c => c.slots && c.slots.includes(targetSlotId));

      const targetSlot = slots.find(s => s.id === targetSlotId);

      // Target slot has an existing activity -> Swap them
      if (targetActIdx >= 0 && (sourceDay !== targetDay || srcActIdx !== targetActIdx)) {
        const targetAct = { ...targetList[targetActIdx] };

        // Swap slots
        const tempSlots = [...srcAct.slots];
        srcAct.slots = [...targetAct.slots];
        targetAct.slots = tempSlots;

        if (sourceDay === targetDay) {
          srcList[srcActIdx] = targetAct;
          srcList[targetActIdx] = srcAct;
          nextChart[sourceDay] = srcList;
        } else {
          srcList[srcActIdx] = targetAct;
          targetList[targetActIdx] = srcAct;
          nextChart[sourceDay] = srcList;
          nextChart[targetDay] = targetList;
        }

        showAlert(
          preferences.lang === 'my'
            ? `"${srcAct.name}" နှင့် "${targetAct.name}" တို့ကို နေရာချင်း လဲလှယ်လိုက်ပါပြီ 🔄`
            : `Swapped "${srcAct.name}" with "${targetAct.name}" 🔄`,
          'success'
        );
      } else {
        // Target slot is empty -> Move
        srcAct.slots = [targetSlotId];
        if (targetSlot) {
          srcAct.start = targetSlot.start;
          srcAct.end = targetSlot.end;
          srcAct.timeStr = targetSlot.label;
        }
        srcList.splice(srcActIdx, 1);
        targetList.push(srcAct);

        nextChart[sourceDay] = srcList;
        nextChart[targetDay] = targetList;

        showAlert(
          preferences.lang === 'my'
            ? `"${srcAct.name}" ကို ${targetDay} အချိန်ကွက်သို့ ရွှေ့လိုက်ပါပြီ 🚚`
            : `Moved "${srcAct.name}" to ${targetDay} 🚚`,
          'success'
        );
      }

      audioAlert.playChime('chime');
      return nextChart;
    });
  };

  // Download .ics Calendar File
  const handleDownloadIcs = () => {
    downloadTimetableIcs(
      chart,
      slots,
      notes,
      preferences,
      userName ? `${userName}'s Timetable` : 'University Timetable'
    );
    showAlert(preferences.lang === 'my' ? 'Calendar .ics ဖိုင်ကို ဒေါင်းလုဒ်ဆွဲပြီးပါပြီ။ Google/Apple Calendar တွင် ဖွင့်နိုင်ပါပြီ။' : 'Downloaded .ics! You can open in Google or Apple Calendar.', 'success');
  };

  const totalClassesCount = useMemo(() => {
    let count = 0;
    Object.values(chart).forEach(activities => {
      count += (activities || []).length;
    });
    return count;
  }, [chart]);

  // Tasks & Important Events Handlers
  const handleAddTask = (text: string) => {
    setTasks([...tasks, text]);
    showAlert('Task added.', 'success');
  };

  const handleDeleteTask = (index: number) => {
    setTasks(tasks.filter((_, idx) => idx !== index));
  };

  const handleAddEvent = (newEvent: Omit<ImportantEvent, 'id' | 'createdAt' | 'completed'>) => {
    const item: ImportantEvent = {
      ...newEvent,
      id: Math.random().toString(36).substring(2, 9),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setEvents(prev => [...prev, item]);
    showAlert(`Event "${item.title}" saved with reminder!`, 'success');
  };

  const handleToggleEvent = (id: string) => {
    setEvents(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e);
      const ev = updated.find(e => e.id === id);
      if (ev && ev.completed) {
        // Need to set timeout so it happens outside render loop
        setTimeout(() => handleGainXp(10, 'Task Completed'), 0);
      }
      return updated;
    });
  };

  const handleAddHabit = (habit: Habit) => {
    setHabits(prev => [...prev, habit]);
  };

  const handleToggleHabit = (id: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const hasCompleted = h.completedDates.includes(date);
        return {
          ...h,
          completedDates: (() => {
            if (!hasCompleted) {
              setTimeout(() => handleGainXp(15, 'Habit Completed'), 0);
              return [...h.completedDates, date];
            }
            return h.completedDates.filter(d => d !== date);
          })()
        };
      }
      return h;
    }));
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    showAlert('Event deleted.', 'info');
  };

  // Templates & Backup
  const handleApplyTemplate = (key: string) => {
    const tmpl = TEMPLATES[key];
    if (!tmpl) return;

    setTemplateBackup({ slots, chart, tasks, notes, colors });

    const newSlots: TimeSlot[] = tmpl.slots.map((s, idx) => ({
      id: idx + 1,
      label: `${s.label} (${s.start}-${s.end})`,
      start: s.start,
      end: s.end
    }));

    const newChart: TimetableChart = { 'MON': [], 'TUE': [], 'WED': [], 'THU': [], 'FRI': [], 'SAT': [], 'SUN': [] };
    tmpl.days.forEach(d => {
      newChart[d] = [];
    });

    setSlots(newSlots);
    setChart(newChart);
    showAlert(`Template "${tmpl.name}" applied successfully.`, 'success');
  };

  const handleUndoTemplate = () => {
    if (!templateBackup) {
      showAlert('No backup available to restore.', 'warning');
      return;
    }
    setSlots(templateBackup.slots);
    setChart(templateBackup.chart);
    setTasks(templateBackup.tasks);
    setNotes(templateBackup.notes);
    setColors(templateBackup.colors);
    setTemplateBackup(null);
    showAlert('Previous state restored.', 'success');
  };

  // Export / Import / Reset Data
  const handleExportData = () => {
    const pkg = {
      slots,
      timetable: chart,
      tasks,
      notes,
      colors,
      preferences,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable_backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAlert('Backup downloaded successfully.', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.slots && data.timetable) {
          setSlots(data.slots);
          setChart(data.timetable);
          if (data.tasks) setTasks(data.tasks);
          if (data.notes) setNotes(data.notes);
          if (data.colors) setColors(data.colors);
          if (data.preferences) setPreferences(data.preferences);
          showAlert('Data restored successfully.', 'success');
        } else {
          showAlert('Invalid backup file structure.', 'warning');
        }
      } catch (err) {
        showAlert('Failed to read backup file.', 'danger');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = (type: 'tasks' | 'notes') => {
    audioAlert.triggerVibration('gentle');
    if (type === 'tasks') {
      const prevTasks = [...tasks];
      setTasks([]);
      showAlert(
        preferences.lang === 'my' ? 'လုပ်ငန်းတာဝန်များ (Tasks) အားလုံး ရှင်းလင်းပြီးပါပြီ။' : 'All tasks cleared.',
        'info',
        {
          label: preferences.lang === 'my' ? '↩ ပြန်ယူမည်' : '↩ Undo',
          onClick: () => {
            setTasks(prevTasks);
            showAlert(
              preferences.lang === 'my' ? 'Tasks များကို ပြန်လည်ရယူပြီးပါပြီ။' : 'Tasks restored.',
              'success'
            );
          }
        }
      );
    } else {
      const prevNotes = { ...notes };
      setNotes({});
      showAlert(
        preferences.lang === 'my' ? 'ဘာသာရပ် မှတ်စုများ (Notes) အားလုံး ရှင်းလင်းပြီးပါပြီ။' : 'All notes cleared.',
        'info',
        {
          label: preferences.lang === 'my' ? '↩ ပြန်ယူမည်' : '↩ Undo',
          onClick: () => {
            setNotes(prevNotes);
            showAlert(
              preferences.lang === 'my' ? 'Notes များကို ပြန်လည်ရယူပြီးပါပြီ။' : 'Notes restored.',
              'success'
            );
          }
        }
      );
    }
  };

  const handleClearChart = () => {
    const prevChart = JSON.parse(JSON.stringify(chart));
    setChart({
      MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: []
    });
    audioAlert.triggerVibration('gentle');
    showAlert(
      preferences.lang === 'my'
        ? 'ဇယားရှိ အတန်းအားလုံးကို ရှင်းလင်းပြီးပါပြီ။'
        : 'Timetable cleared. You can now build your custom schedule!',
      'info',
      {
        label: preferences.lang === 'my' ? '↩ ပြန်ယူမည်' : '↩ Undo',
        onClick: () => {
          setChart(prevChart);
          showAlert(
            preferences.lang === 'my' ? 'ဇယားကွက်များကို ပြန်လည်ရယူပြီးပါပြီ။' : 'Timetable restored.',
            'success'
          );
        }
      }
    );
  };

  const handleResetSystem = () => {
    const prevSlots = [...slots];
    const prevChart = JSON.parse(JSON.stringify(chart));
    const prevTasks = [...tasks];
    const prevNotes = { ...notes };
    const prevColors = { ...colors };
    const prevPrefs = { ...preferences };
    const prevEvents = [...events];
    const prevHabits = [...habits];
    const prevShifts = [...workShifts];
    const prevName = userName;

    localStorage.removeItem('physics_slots');
    localStorage.removeItem('physics_timetable');
    localStorage.removeItem('physics_tasks');
    localStorage.removeItem('physics_events');
    localStorage.removeItem('physics_habits');
    localStorage.removeItem('omniflow_work_shifts');
    localStorage.removeItem('physics_subject_notes');
    localStorage.removeItem('physics_subject_colors');
    localStorage.removeItem('physics_user_name');
    localStorage.removeItem('physics_notifications');
    localStorage.removeItem('physics_prefs');

    setSlots(DEFAULT_SLOTS);
    setChart(DEFAULT_DATA_CHART);
    setTasks([]);
    setNotes({});
    setColors({});
    setEvents([]);
    setHabits([]);
    setWorkShifts([]);
    setUserName('May');
    setNotifications([]);
    setPreferences({
      lang: 'my',
      themePreset: 'default',
      accentColor: '#0d47a1',
      bgColor: '#f4f6fa',
      autoTheme: false,
      notifications: true,
      reminderTime: 10,
      soundAlerts: true,
      soundType: 'gentle_chime',
      soundVolume: 80,
      vibrationAlerts: true,
      vibrationPattern: 'gentle',
      calendarAlarmLeadTime: 10,
      dailySummary: true,
      timeFormat: '24',
      fontSize: 16
    });

    audioAlert.triggerVibration('double');
    audioAlert.playSound('gentle_chime', 80);

    showAlert(
      preferences.lang === 'my'
        ? 'စနစ်တစ်ခုလုံးကို မူလအခြေအနေအတိုင်း အောင်မြင်စွာ ပြန်လည်သတ်မှတ်ပြီးပါပြီ။'
        : 'System reset to default successfully.',
      'success',
      {
        label: preferences.lang === 'my' ? '↩ ပြန်ယူမည်' : '↩ Undo',
        onClick: () => {
          setSlots(prevSlots);
          setChart(prevChart);
          setTasks(prevTasks);
          setNotes(prevNotes);
          setColors(prevColors);
          setPreferences(prevPrefs);
          setEvents(prevEvents);
          setHabits(prevHabits);
          setWorkShifts(prevShifts);
          setUserName(prevName);
          showAlert(
            preferences.lang === 'my' ? 'မူလဒေတာများကို အောင်မြင်စွာ ပြန်လည်ရယူပြီးပါပြီ။' : 'System data restored.',
            'success'
          );
        }
      }
    );
  };

  const handleGoogleLoginSuccess = (googleUser: { uid: string; email: string; displayName: string; photoURL?: string | null }) => {
    setCustomUser(googleUser);
    localStorage.setItem('physics_custom_user', JSON.stringify(googleUser));
    setIsLoginModalOpen(false);
    showAlert(
      preferences.lang === 'my'
        ? `Google အကောင့် (${googleUser.displayName || googleUser.email}) ဖြင့် အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ 🎉`
        : `Signed in as ${googleUser.displayName || googleUser.email} 🎉`,
      'success'
    );
  };

  
  

  const handleEmailLogin = async (email: string, displayName?: string, password?: string, photoURL?: string | null) => {
    const cleanEmail = email.trim();
    if (!password) return;

    try {
      const firebaseUser = await signInWithFirebaseEmail(cleanEmail, password);
      const computedName = displayName || firebaseUser.displayName || cleanEmail.split('@')[0];
      const session = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || cleanEmail,
        displayName: computedName,
        photoURL: photoURL || firebaseUser.photoURL
      };
      setCustomUser(session);
      localStorage.setItem('physics_custom_user', JSON.stringify(session));
      setIsLoginModalOpen(false);
      showAlert(
        preferences.lang === 'my'
          ? `အကောင့် (${session.displayName}) ဖြင့် Firebase Cloud Sync ချိတ်ဆက်ပြီးပါပြီ 🎉`
          : `Connected ${session.email} to Firebase Cloud Sync 🎉`,
        'success'
      );
    } catch (firebaseErr: any) {
      console.warn('Firebase email authentication failed:', firebaseErr);
      showAlert(
        preferences.lang === 'my'
          ? 'အကောင့်ဝင်၍ မရပါ။ Email နှင့် စကားဝှက်ကို စစ်ဆေးပြီး ပြန်လည်ကြိုးစားပါ။'
          : 'Sign-in failed. Check your email and password, then try again.',
        'danger'
      );
      throw firebaseErr;
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await logOut();
      }
      setCustomUser(null);
      localStorage.removeItem('physics_custom_user');
      setSlots(DEFAULT_SLOTS);
      setChart(DEFAULT_DATA_CHART);
      setTasks([]);
      setEvents([]);
      setHabits([]);
      setWorkShifts([]);
      setNotes({});
      setColors({});
      setUserName('May');
      showAlert(
        preferences.lang === 'my'
          ? 'အကောင့်မှ အောင်မြင်စွာ ထွက်ပြီးပါပြီ။'
          : 'Signed out successfully.',
        'info'
      );
    } catch (e) {
      showAlert('Logout failed.', 'danger');
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const containerClass = useMemo(() => {
    switch (activeMode) {
      case 'mobile':
        return 'max-w-[440px] mx-auto p-3 sm:p-4 pb-28 shadow-2xl rounded-3xl border border-[var(--color-border)] my-2 bg-[var(--color-bg-card)]/30 transition-all duration-300';
      case 'tablet':
        return 'max-w-[780px] mx-auto p-4 sm:p-6 pb-28 md:pl-28 transition-all duration-300';
      case 'laptop':
        return 'max-w-[1180px] mx-auto p-4 md:p-6 pb-28 md:pl-28 transition-all duration-300';
      case 'desktop':
        return 'max-w-[1440px] xl:max-w-[1600px] mx-auto p-4 md:p-8 pb-28 md:pl-28 transition-all duration-300';
      default:
        return 'max-w-[1180px] mx-auto p-4 md:p-6 pb-28 md:pl-28 transition-all duration-300';
    }
  }, [activeMode]);

  const isWidgetMode = typeof window !== 'undefined' && window.location.search.includes('widget=true');

  if (isWidgetMode) {
    return (
      <WidgetView
        preferences={preferences}
        currentActivity={currentActivity}
        nextActivity={nextActivity}
        tasks={tasks}
        onAddTask={handleAddTask}
        onDeleteTask={handleDeleteTask}
        showAlert={showAlert}
      />
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* App-Wide Custom Wallpaper Layer */}
      {preferences.customWallpaper && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={preferences.customWallpaper}
            alt="App Wallpaper"
            className="w-full h-full object-cover"
            style={{
              filter: `blur(${preferences.wallpaperBlur ?? 4}px)`,
              transform: (preferences.wallpaperBlur ?? 4) > 0 ? 'scale(1.05)' : 'none'
            }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: (preferences.wallpaperDim ?? 40) / 100 }}
          />
        </div>
      )}

      <div
        className={`${containerClass} relative z-10 ${
          preferences.cardGlassmorphism ? 'backdrop-blur-md bg-[var(--color-bg-card)]/75 rounded-3xl' : ''
        }`}
        style={{ fontSize: `${preferences.fontSize || 16}px` }}
      >
      {/* Smart Onboarding Flow */}
      {!hasCompletedOnboarding && (
        <OnboardingOverlay
          preferences={preferences}
          onComplete={(name, lifeMode) => {
            setUserName(name);
            setPreferences({ ...preferences, lifeMode });
            setHasCompletedOnboarding(true);
            localStorage.setItem('physics_onboarding_done', 'true');
            showAlert(preferences.lang === 'my' ? `ကြိုဆိုပါတယ် ${name}!` : `Welcome ${name}!`, 'success');
          }}
        />
      )}

      {/* Daily Briefing (Morning / Evening) */}
      
      {/* XP Toasts */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {xpToasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-[var(--color-bg-card)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-bold text-sm">{toast.label}</span>
              <span className="bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-lg text-xs font-black">+{toast.amount} XP</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasCompletedOnboarding && showDailyBriefing && (
        <DailyBriefing
          preferences={preferences}
          userName={userName}
          tasks={tasks}
          eventsCount={events.filter(e => e.date === new Date().toISOString().split('T')[0]).length}
          onClose={() => {
            setShowDailyBriefing(false);
            localStorage.setItem('physics_last_briefing_date', new Date().toISOString().split('T')[0]);
          }}
        />
      )}

      {/* Floating Action Button (Universal Quick Add) */}
      <FloatingQuickAdd
        preferences={preferences}
        onAddTask={() => {
          setCurrentTab('tasks');
          // Give it a small delay to switch tabs before attempting to add
          setTimeout(() => {
            const btn = document.querySelector('button[title="Add Task"]');
            if (btn) (btn as HTMLButtonElement).click();
          }, 100);
        }}
        onAddEvent={() => {
          setCurrentTab('workplace');
          setTimeout(() => {
            handleAddEvent({
              title: preferences.lang === 'my' ? 'အစည်းအဝေးအသစ်' : 'New Meeting / Event',
              date: new Date().toISOString().split('T')[0],
              time: '10:00',
              category: 'meeting',
              priority: 'medium',
              alertOffset: 15
            });
          }, 100);
        }}
        onAddHabit={() => {
          setCurrentTab('habits');
          setTimeout(() => {
            const btn = document.querySelector('button[title="Add Habit"]');
            if (btn) (btn as HTMLButtonElement).click();
          }, 100);
        }}
      />

      {/* Alert Banner */}
      <AlertBanner
        message={alert.message}
        type={alert.type}
        actionLabel={alert.actionLabel}
        onAction={alert.onAction}
        onClose={() => setAlert({ message: null, type: 'info' })}
      />

      {/* Offline Mode Reassurance Banner */}
      {isOffline && (
        <div className="mb-3 px-4 py-2 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-2 text-xs font-mono text-amber-600 dark:text-amber-400 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="font-bold">
              {preferences.lang === 'my'
                ? '📶 Offline Mode အလုပ်လုပ်နေပါသည် (အင်တာနက် မလိုဘဲ အချိန်ဇယားနှင့် Noti ပုံမှန် ရပါမည်)'
                : '📶 Offline Mode Active (PWA cached - Schedule & Notifications work offline)'}
            </span>
          </div>
          <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">
            Offline
          </span>
        </div>
      )}

      {/* Header */}
      <Header
        preferences={preferences}
        user={activeUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onToggleTheme={() => {
          const nextTheme = preferences.themePreset === 'dark' ? 'default' : 'dark';
          setPreferences({ ...preferences, themePreset: nextTheme });
        }}
        onToggleLang={() => {
          const nextLang = preferences.lang === 'my' ? 'en' : 'my';
          setPreferences({ ...preferences, lang: nextLang });
          showAlert(nextLang === 'my' ? 'ဘာသာစကားကို မြန်မာသို့ ပြောင်းပြီ။' : 'Switched to English.', 'success');
        }}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenBackupModal={() => setIsCloudBackupOpen(true)}
        onToggleLifeMode={() => {
          const nextMode = preferences.lifeMode === 'workplace' ? 'student' : 'workplace';
          setPreferences({ ...preferences, lifeMode: nextMode });
          setCurrentTab('home');

          if (nextMode === 'workplace') {
            const q = getRandomQuote(preferences.lang, 'workplace');
            const motiMsg = preferences.lang === 'my'
              ? `💼 Work Mode သို့ ပြောင်းလဲလိုက်ပါပြီ - "${q.quote}" — ${q.author}`
              : `💼 Work Mode Activated - "${q.quote}" — ${q.author}`;
            showAlert(motiMsg, 'info');
          } else {
            const q = getRandomQuote(preferences.lang, 'motivation');
            const motiMsg = preferences.lang === 'my'
              ? `🎓 Student Mode သို့ ပြောင်းလဲလိုက်ပါပြီ - "${q.quote}" — ${q.author}`
              : `🎓 Student Mode Activated - "${q.quote}" — ${q.author}`;
            showAlert(motiMsg, 'info');
          }
        }}
        unreadCount={unreadNotificationsCount}
        deviceMode={deviceMode}
        detectedMode={detectedMode}
        onSelectDeviceMode={(mode) => {
          setDeviceMode(mode);
          const modeNames: Record<string, string> = {
            auto: 'အလိုအလျောက် ဗျူးစနစ် သို့ပြောင်းလဲပါပြီ (Auto View)',
            mobile: 'ဖုန်း ဗျူးစနစ် သို့ပြောင်းလဲပါပြီ (Mobile View)',
            tablet: 'တက်ဘလက် ဗျူးစနစ် သို့ပြောင်းလဲပါပြီ (Tablet View)',
            laptop: 'လက်ပ်တော့ပ် ဗျူးစနစ် သို့ပြောင်းလဲပါပြီ (Laptop View)',
            desktop: 'ကွန်ပျူတာ ဗျူးစနစ် သို့ပြောင်းလဲပါပြီ (Desktop View)'
          };
          showAlert(modeNames[mode] || 'Switched View', 'info');
        }}
      />

      {/* Tab Contents */}
      {currentTab === 'home' && (
        <>
          {/* Live Clock */}
          <LiveClock preferences={preferences} isInClass={!!currentActivity} />

          {/* Daily Motivational Quote */}
          <DailyQuoteCard
            preferences={preferences}
            savedQuoteIds={savedQuoteIds}
            onToggleSaveQuote={handleToggleSaveQuote}
            onOpenMotivationHub={() => setIsMotivationModalOpen(true)}
            customQuotes={customQuotes}
            onAddCustomQuote={handleAddCustomQuote}
            activeSubject={currentActivity?.name || nextActivity?.name || sortedToday[0]?.name}
          />

          {/* Primary Today Dashboard (Greeting, Live/Next Class, Counters, Timeline, Tomorrow) */}
          <HomeTab
            preferences={preferences}
            setPreferences={setPreferences}
            userName={userName}
            workShifts={workShifts}
            transactions={transactions}
            setTransactions={setTransactions}
            todayClasses={sortedToday}
            tomorrowClasses={tomorrowClasses}
            upcomingClasses={upcomingClasses}
            currentActivity={currentActivity}
            nextActivity={nextActivity}
            isTableExpanded={isHomeTableExpanded}
            tasks={tasks}
            events={events}
            onToggleTask={(text) => {
               showAlert(preferences.lang === 'my' ? `Task ဖျက်လိုက်ပါပြီ` : `Task removed`, 'success');
               handleDeleteTask(tasks.indexOf(text));
            }}
            onSwitchTab={setCurrentTab}
            onEditName={() => { setNameInputVal(userName); setIsEditNameOpen(true); }}
            onQuickAddTask={(taskText) => {
              setTasks(prev => [taskText, ...prev]);
              showAlert(preferences.lang === 'my' ? `လုပ်ဆောင်ချက် "${taskText}" ကို Tasks ထဲသို့ ထည့်ပြီးပါပြီ` : `Added "${taskText}" to tasks`, 'success');
            }}
            onExportCSV={() => {
              let csv = 'Day,Time,Subject,Category\n';
              (['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as DayCode[]).forEach(d => {
                (chart[d] || []).forEach(act => {
                  csv += `${d},${act.timeStr},"${act.name}",${act.category || ''}\n`;
                });
              });
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'timetable_export.csv';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              showAlert('CSV exported successfully.', 'success');
            }}
          />
        </>
      )}

      {currentTab === 'table' && (
        <div className="space-y-4">
          {preferences.lifeMode === 'workplace' ? (
            <WorkplaceTab
              transactions={transactions}
            setTransactions={setTransactions}
            workShifts={workShifts}
              onSaveWorkShift={(shift) => {
                setWorkShifts(prev => {
                  const existing = prev.findIndex(s => s.id === shift.id);
                  if (existing >= 0) {
                    const next = [...prev];
                    next[existing] = shift;
                    return next;
                  }
                  return [...prev, shift];
                });
                showAlert(preferences.lang === 'my' ? 'အချိန်ဇယား သိမ်းဆည်းပြီးပါပြီ' : 'Work shift saved successfully', 'success');
              }}
              onDeleteWorkShift={(id) => {
                setWorkShifts(prev => prev.filter(s => s.id !== id));
                showAlert(preferences.lang === 'my' ? 'ဖျက်လိုက်ပါပြီ' : 'Work shift deleted', 'info');
              }}
              onBatchUpdateShifts={(shifts) => {
                setWorkShifts(prev => {
                  const map = new Map();
                  prev.forEach(s => map.set(s.date, s));
                  shifts.forEach(s => map.set(s.date, s));
                  return Array.from(map.values());
                });
                showAlert(preferences.lang === 'my' ? 'လအလိုက် အချိန်ဇယားများ အလိုအလျောက် သတ်မှတ်ပြီးပါပြီ' : 'Monthly shifts auto-filled', 'success');
              }}
              events={events}
              onAddEvent={handleAddEvent}
              preferences={preferences}
              onSwitchLifeMode={(mode) => {
                setPreferences({ ...preferences, lifeMode: mode });
                setCurrentTab('home');
              }}
              onOpenMotivationHub={() => setIsMotivationModalOpen(true)}
            />
          ) : (
            <TableTab
              preferences={preferences}
              slots={slots}
              chart={chart}
              notes={notes}
              timeState={timeState}
              collapsible={false}
              titleOverride={preferences.lang === 'my' ? 'တစ်ပတ်စာ အချိန်ဇယားကွက် (Weekly Timetable)' : 'Weekly Schedule Table'}
              onOpenQrCode={(tab) => setQrModal({ isOpen: true, tab: tab || 'share' })}
              onSyncCalendar={() => setIsCalendarSyncOpen(true)}
              onPasteToSlot={handlePasteToSlot}
              onMoveActivity={handleSwapOrMoveActivity}
              onCellClick={(day, slotIds, name, color, category) => {
                const act = (chart[day] || []).find(c => c.slots && c.slots.some(id => slotIds.includes(id)));
                const noteKey = `${day}_slot${slotIds[0]}`;
                setCellEditModal({
                  isOpen: true,
                  day,
                  slotIds,
                  name: name || '',
                  color: color || '#E8F0FE',
                  category: category || 'work',
                  note: notes[noteKey] || '',
                  room: act?.room,
                  instructor: act?.instructor,
                  link: act?.link,
                  reminderOffset: act?.reminderOffset
                });
              }}
              onCellEdit={(day, slotId) => {
                const act = (chart[day] || []).find(c => c.slots && c.slots.includes(slotId));
                const noteKey = `${day}_slot${slotId}`;
                setCellEditModal({
                  isOpen: true,
                  day,
                  slotIds: act ? act.slots : [slotId],
                  name: act ? act.name : '',
                  color: act ? (act.customBg || '#E8F0FE') : '#E8F0FE',
                  category: act ? (act.category || 'work') : 'work',
                  note: notes[noteKey] || '',
                  room: act?.room,
                  instructor: act?.instructor,
                  link: act?.link,
                  reminderOffset: act?.reminderOffset
                });
              }}
              onAddSlot={() => setEditSlotModalState({ isOpen: true, slot: null })}
              onEditSlot={(s) => setEditSlotModalState({ isOpen: true, slot: s })}
              onOpenManageSlots={() => setCurrentTab('manage')}
              onDeleteActivity={handleDeleteActivity}
              onUpdatePreferences={(newPrefs) => setPreferences({ ...preferences, ...newPrefs })}
            />
          )}
        </div>
      )}

      {currentTab === 'tasks' && (
        <TasksTab
          preferences={preferences}
          tasks={tasks}
          events={events}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onAddEvent={handleAddEvent}
          onToggleEvent={handleToggleEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {currentTab === 'habits' && (
        <HabitsTab
          habits={habits}
          onAddHabit={handleAddHabit}
          onToggleHabit={handleToggleHabit}
          onDeleteHabit={handleDeleteHabit}
          preferences={preferences}
        />
      )}

      {currentTab === 'widget' && (
        <WidgetView
          preferences={preferences}
          currentActivity={currentActivity}
          nextActivity={nextActivity}
          tasks={tasks}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          showAlert={showAlert}
        />
      )}

      {currentTab === 'workplace' && (
        <>
          {/* Live Clock */}
          <LiveClock preferences={preferences} isInClass={false} />

          {/* Daily Motivational Quote */}
          <DailyQuoteCard
            preferences={preferences}
            savedQuoteIds={savedQuoteIds}
            onToggleSaveQuote={handleToggleSaveQuote}
            onOpenMotivationHub={() => setIsMotivationModalOpen(true)}
            customQuotes={customQuotes}
            onAddCustomQuote={handleAddCustomQuote}
            activeSubject={undefined}
          />

          <HomeTab
              preferences={preferences}
              setPreferences={setPreferences}
              userName={userName}
              workShifts={workShifts}
              transactions={transactions}
              setTransactions={setTransactions}
              todayClasses={sortedToday}
            tomorrowClasses={tomorrowClasses}
            upcomingClasses={upcomingClasses}
            currentActivity={currentActivity}
            nextActivity={nextActivity}
            isTableExpanded={false}
            tasks={tasks}
            events={events}
            onToggleTask={(text) => {
               showAlert(preferences.lang === 'my' ? `Task ဖျက်လိုက်ပါပြီ` : `Task removed`, 'success');
               handleDeleteTask(tasks.indexOf(text));
            }}
            onSwitchTab={setCurrentTab}
            onEditName={() => { setNameInputVal(userName); setIsEditNameOpen(true); }}
            onQuickAddTask={(taskText) => {
              setTasks(prev => [taskText, ...prev]);
              showAlert(preferences.lang === 'my' ? `လုပ်ဆောင်ချက် "${taskText}" ကို Tasks ထဲသို့ ထည့်ပြီးပါပြီ` : `Added "${taskText}" to tasks`, 'success');
            }}
            onExportCSV={() => {
              let csv = 'Day,Time,Subject,Category\n';
              (['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as DayCode[]).forEach(d => {
                (chart[d] || []).forEach(act => {
                  csv += `${d},${act.timeStr},"${act.name}",${act.category || ''}\n`;
                });
              });
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'timetable_export.csv';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              showAlert('CSV exported successfully.', 'success');
            }}
          />
        </>
      )}

      {currentTab === 'stats' && (
        <StatsTab preferences={preferences} chart={chart} workShifts={workShifts} />
      )}

      {currentTab === 'manage' && (
        <ManageTab
          user={activeUser}
          onLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onOpenCloudBackup={() => setIsCloudBackupOpen(true)}
          onForceCloudBackup={handleForceCloudBackup}
          onForceCloudRestore={handleForceCloudRestore}
          isCloudSyncing={isCloudSyncing}
          lastCloudSyncTime={lastCloudSyncTime}
          preferences={preferences}
          slots={slots}
          chart={chart}
          lastSavedTime={lastSavedTime}
          installPrompt={installPrompt}
          onInstallClick={handleInstallClick}
          onSaveSlot={handleSaveSlot}
          onDeleteSlot={handleDeleteSlot}
          onQuickAdjustSlotDuration={handleQuickAdjustSlotDuration}
          onShiftAllSlots={handleShiftAllSlots}
          onDuplicateSlot={handleDuplicateSlot}
          onResetSlots={handleResetSlots}
          onOpenBulkAdd={() => setIsBulkAddOpen(true)}
          onInsertActivity={handleInsertActivity}
          onDeleteActivity={handleDeleteActivity}
          onUpdatePreferences={(newPrefs) => setPreferences({ ...preferences, ...newPrefs })}
          onApplyTemplate={handleApplyTemplate}
          onUndoTemplate={handleUndoTemplate}
          onShowHistory={() => {}}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onOpenQrCode={(tab) => setQrModal({ isOpen: true, tab: tab || 'share' })}
          onOpenCalendarModal={() => setIsCalendarSyncOpen(true)}
          onClearData={handleClearData}
          onClearChart={handleClearChart}
          onResetSystem={handleResetSystem}
          onToggleTheme={() => {
            const nextTheme = preferences.themePreset === 'dark' ? 'default' : 'dark';
            setPreferences({ ...preferences, themePreset: nextTheme });
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        preferences={preferences}
        taskCount={tasks.length}
      />

      {/* Modals */}
      {cellEditModal && (
        <CellEditModal
          isOpen={cellEditModal.isOpen}
          day={cellEditModal.day}
          slotIds={cellEditModal.slotIds}
          allSlots={slots}
          chart={chart}
          initialName={cellEditModal.name}
          initialColor={cellEditModal.color}
          initialCategory={cellEditModal.category}
          initialNote={cellEditModal.note}
          initialRoom={cellEditModal.room}
          initialInstructor={cellEditModal.instructor}
          initialLink={cellEditModal.link}
          initialReminderOffset={cellEditModal.reminderOffset}
          lang={preferences.lang}
          onClose={() => setCellEditModal(null)}
          onDuplicateToDays={handleDuplicateToDays}
          onMoveOrCopy={handleMoveOrCopy}
          onAddRelatedTask={(taskTitle, dueDate) => {
            const taskStr = dueDate ? `${taskTitle} (Due: ${dueDate})` : taskTitle;
            setTasks(prev => [taskStr, ...prev]);
            showAlert(preferences.lang === 'my' ? `လုပ်ဆောင်ချက် "${taskTitle}" ကို Tasks စာရင်းထဲသို့ ထည့်သွင်းပြီးပါပြီ။` : `Task "${taskTitle}" added to task list.`, 'success');
          }}
          onDelete={(day, slotIds, actName) => {
            const targetDays = [day as DayCode, cellEditModal.day].filter(Boolean) as DayCode[];
            const uniqueDays = Array.from(new Set(targetDays));

            const newChart = { ...chart };
            uniqueDays.forEach(d => {
              const existing = newChart[d] || [];
              const filtered = existing.filter(act => {
                const overlaps = act.slots.some(id => slotIds.includes(id) || cellEditModal.slotIds.includes(id));
                return !overlaps;
              });
              newChart[d] = filtered;
            });
            setChart(newChart);

            const newNotes = { ...notes };
            uniqueDays.forEach(d => {
              slotIds.forEach(id => {
                delete newNotes[`${d}_slot${id}`];
              });
              cellEditModal.slotIds.forEach(id => {
                delete newNotes[`${d}_slot${id}`];
              });
            });
            setNotes(newNotes);
            setCellEditModal(null);
            showAlert(preferences.lang === 'my' ? 'အချိန်ဇယားမှ အချက်အလက်များကို ဖျက်လိုက်ပါပြီ။' : 'Activity removed from timetable.', 'info');
          }}
          onSave={({ day, slotIds, name, color, category, note, room, instructor, link, reminderOffset, relatedTaskTitle, relatedTaskDueDate }) => {
            handleInsertActivity(day as DayCode, slotIds, name, color, category, {
              room,
              instructor,
              link,
              reminderOffset
            });
            if (note.trim()) {
              const newNotes = { ...notes };
              slotIds.forEach(id => {
                newNotes[`${day}_slot${id}`] = note.trim();
              });
              setNotes(newNotes);
            } else {
              const newNotes = { ...notes };
              slotIds.forEach(id => {
                delete newNotes[`${day}_slot${id}`];
              });
              setNotes(newNotes);
            }
            if (relatedTaskTitle) {
              const taskStr = relatedTaskDueDate ? `${relatedTaskTitle} (Due: ${relatedTaskDueDate})` : relatedTaskTitle;
              setTasks(prev => [taskStr, ...prev]);
            }
            setCellEditModal(null);
            showAlert(preferences.lang === 'my' ? 'အချိန်ဇယား သိမ်းဆည်းပြီးပါပြီ။' : 'Timetable slot updated.', 'success');
          }}
        />
      )}

      {/* Edit Slot Modal */}
      <EditSlotModal
        isOpen={editSlotModalState.isOpen}
        slot={editSlotModalState.slot}
        allSlots={slots}
        onClose={() => setEditSlotModalState({ isOpen: false, slot: null })}
        onSave={handleSaveSlot}
        onDelete={handleDeleteSlot}
        lang={preferences.lang}
      />

      {/* Calendar Sync & Export Modal */}
      <CalendarSyncModal
        isOpen={isCalendarSyncOpen}
        onClose={() => setIsCalendarSyncOpen(false)}
        chart={chart}
        slots={slots}
        notes={notes}
        preferences={preferences}
        onUpdatePreferences={(newPrefs) => setPreferences({ ...preferences, ...newPrefs })}
        onDownloadIcs={handleDownloadIcs}
        totalClassesCount={totalClassesCount}
        lang={preferences.lang}
      />

      <NotesModal
        isOpen={isNotesOpen}
        subjectTitle={activeNoteTitle}
        daySlotText={activeNoteDaySlot}
        notesText={noteTextVal}
        onNotesChange={setNoteTextVal}
        onClose={() => setIsNotesOpen(false)}
        onSave={() => {
          if (activeNoteKey) {
            setNotes({ ...notes, [activeNoteKey]: noteTextVal });
            showAlert('Note saved.', 'success');
          }
          setIsNotesOpen(false);
        }}
      />

      <EditNameModal
        isOpen={isEditNameOpen}
        nameVal={nameInputVal}
        onNameChange={setNameInputVal}
        onClose={() => setIsEditNameOpen(false)}
        onSave={() => {
          if (nameInputVal.trim()) {
            setUserName(nameInputVal.trim());
            setIsEditNameOpen(false);
            showAlert('Name updated.', 'success');
          }
        }}
      />

      <BulkAddModal
        isOpen={isBulkAddOpen}
        startTime={bulkConfig.startTime}
        endTime={bulkConfig.endTime}
        duration={bulkConfig.duration}
        count={bulkConfig.count}
        prefix={bulkConfig.prefix}
        onChange={(field, val) => setBulkConfig({ ...bulkConfig, [field]: val })}
        onClose={() => setIsBulkAddOpen(false)}
        onGenerate={handleExecuteBulkAdd}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        notifications={notifications}
        onClose={() => setIsNotificationOpen(false)}
        onClear={() => {
          setNotifications([]);
          showAlert('All notifications cleared.', 'info');
        }}
      />

      <MotivationModal
        isOpen={isMotivationModalOpen}
        onClose={() => setIsMotivationModalOpen(false)}
        preferences={preferences}
        savedQuoteIds={savedQuoteIds}
        onToggleSaveQuote={handleToggleSaveQuote}
        customQuotes={customQuotes}
        onAddCustomQuote={handleAddCustomQuote}
        onDeleteCustomQuote={handleDeleteCustomQuote}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onGoogleLogin={() => handleGoogleLogin()}
        lang={preferences.lang}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        preferences={preferences}
        deferredPrompt={installPrompt}
        onInstallSuccess={() => {
          showAlert(preferences.lang === 'my' ? 'App ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ 🎉' : 'App installed successfully! 🎉', 'success');
        }}
      />

      <CloudBackupModal
        isOpen={isCloudBackupOpen}
        onClose={() => setIsCloudBackupOpen(false)}
        preferences={preferences}
        activeUser={activeUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onForceCloudBackup={handleForceCloudBackup}
        onForceCloudRestore={handleForceCloudRestore}
        lastCloudSyncTime={lastCloudSyncTime}
        isCloudSyncing={isCloudSyncing}
        fullAppData={{
          version: '1.0',
          timestamp: new Date().toISOString(),
          lifeMode: preferences.lifeMode || 'student',
          preferences,
          slots,
          dataChart: chart,
          events,
          habits,
          workShifts,
          transactions,
          notes
        }}
        onRestoreData={(restoredData) => {
          if (restoredData.slots) setSlots(restoredData.slots);
          if (restoredData.dataChart) setChart(restoredData.dataChart);
          if (restoredData.events) setEvents(restoredData.events);
          if (restoredData.habits) setHabits(restoredData.habits);
          if (restoredData.workShifts) setWorkShifts(restoredData.workShifts);
          if (restoredData.transactions) setTransactions(restoredData.transactions);
          if (restoredData.notes) setNotes(restoredData.notes);
          if (restoredData.preferences) setPreferences(restoredData.preferences);
        }}
        showAlert={showAlert}
      />
    </div>
    </div>
  );
}
