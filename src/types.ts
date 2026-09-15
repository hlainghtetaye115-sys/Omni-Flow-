export interface Habit {
  id: string;
  name: string;
  color: string;
  completedDates: string[];
  createdAt: string;
}

export type DayCode = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface TimeSlot {
  id: number;
  label: string;
  start: string; // e.g. "07:30"
  end: string;   // e.g. "08:20"
}

export interface ClassActivity {
  slots: number[];
  name: string;
  start: string;
  end: string;
  timeStr: string;
  customBg?: string;
  category?: 'work' | 'personal' | 'relationship';
  notes?: string;
  homeworkChecklist?: { id: string; text: string; completed: boolean }[];
  room?: string;
  instructor?: string;
  link?: string;
  reminderOffset?: number;
}

export type TimetableChart = Record<DayCode, ClassActivity[]>;

export type ShiftType = 'morning' | 'evening' | 'night' | 'off' | 'wfh' | 'custom';

export interface WorkShiftItem {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  title: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  otHours: number;   // Overtime hours
  workHours?: number; // Total scheduled work hours
  location?: string;
  meetingLink?: string;
  notes?: string;
  color?: string;
  isCompleted?: boolean;
}

export interface MonthlyWorkReport {
  month: string; // YYYY-MM
  hourlyRate: number;
  currency: string;
  targetHours: number;
  notes?: string;
}

export interface CloudBackupSnapshot {
  id: string;
  timestamp: string;
  label: string;
  dataSummary: string;
  rawData: string;
}

export interface Gamification {
  xp: number;
  level: number;
}

export interface Preferences {
  lang: 'my' | 'en';
  gamification?: Gamification;
  themePreset: string;
  accentColor: string;
  bgColor: string;
  autoTheme: boolean;
  notifications: boolean;
  reminderTime: number;
  soundAlerts: boolean;
  soundType?: 'gentle_chime' | 'zen_bell' | 'crystal_drop' | 'digital_beep' | 'classic_alarm' | 'marimba';
  soundVolume?: number; // 0 to 100
  vibrationAlerts?: boolean;
  vibrationPattern?: 'gentle' | 'double' | 'pulse' | 'strong';
  calendarAlarmLeadTime?: number; // Minutes before class for native phone calendar alarm (e.g. 10)
  dailySummary: boolean;
  timeFormat: '12' | '24';
  fontSize: number;
  autoDark?: boolean;
  autoGoogleSync?: boolean;
  syncAccountEmail?: string;
  syncCalendarId?: string;
  lifeMode?: 'student' | 'workplace'; // Switch between Student life and Workplace/Job life
  customWallpaper?: string; // Image base64 or URL for app-wide background
  wallpaperDim?: number; // Overlay dim level 0 to 90 %
  wallpaperBlur?: number; // Blur level 0 to 20 px
  cardGlassmorphism?: boolean; // Translucent frosted glass effect
  highContrastText?: boolean; // Ultra-crisp text contrast mode
  borderStyle?: 'sleek' | 'glass' | 'soft' | 'sharp' | 'glow' | 'ios'; // Premium border design styles
  borderWidth?: number; // Border thickness in px (0.5, 1, 1.5, 2, 3)
  borderOpacity?: number; // Border opacity % (10 to 100)
  borderTexture?: 'solid' | 'dashed' | 'dotted' | 'double'; // Line style
  borderGlowColor?: string; // Accent color for glow/highlight
  autoSilentMode?: boolean; // Smart Silent / Do Not Disturb Mode during classes
  monthlyBudget?: number; // Target monthly budget for expenses
}

export interface NotificationItem {
  id: string;
  msg: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  time: string;
  date: string;
  read: boolean;
}

export interface Template {
  name: string;
  slots: { start: string; end: string; label: string }[];
  days: DayCode[];
}

export interface ImportantEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  category: 'exam' | 'assignment' | 'deadline' | 'meeting' | 'other';
  priority: 'high' | 'medium' | 'low';
  alertOffset: number; // minutes before event to alert: 0, 15, 60, 180, 1440, 2880
  completed: boolean;
  note?: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'food' | 'transport' | 'bills' | 'shopping' | 'others' | 'extra_income';
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: string;
  note: string;
}
