import { TimeSlot, TimetableChart, Template } from '../types';

export const DEFAULT_SLOTS: TimeSlot[] = [
  { id: 1, label: '7:30-8:20', start: '07:30', end: '08:20' },
  { id: 2, label: '8:25-9:15', start: '08:25', end: '09:15' },
  { id: 3, label: '9:20-10:10', start: '09:20', end: '10:10' },
  { id: 4, label: '10:15-11:05', start: '10:15', end: '11:05' },
  { id: 5, label: '11:10-12:00', start: '11:10', end: '12:00' },
  { id: 6, label: '1:00-1:50', start: '13:00', end: '13:50' },
  { id: 7, label: '1:55-2:45', start: '13:55', end: '14:45' },
  { id: 8, label: '2:50-3:40', start: '14:50', end: '15:40' },
  { id: 9, label: '3:45-4:35', start: '15:45', end: '16:35' }
];

export const DEFAULT_DATA_CHART: TimetableChart = {
  'MON': [
    { slots: [2, 3], name: 'Phys-5201', start: '08:25', end: '10:10', timeStr: '8:25-10:10', customBg: '#E8F0FE', category: 'work' },
    { slots: [4, 5], name: 'Phys-5209', start: '10:15', end: '12:00', timeStr: '10:15-12:00', customBg: '#E6F4EA', category: 'work' },
    { slots: [6, 7], name: 'Phys-5209 (Pract)', start: '13:00', end: '14:45', timeStr: '1:00-2:45', customBg: '#FCE8E6', category: 'work' }
  ],
  'TUE': [
    { slots: [2], name: 'Phys-5207', start: '08:25', end: '09:15', timeStr: '8:25-09:15', customBg: '#FEF7E0', category: 'work' },
    { slots: [3], name: 'Phys-5203', start: '09:20', end: '10:10', timeStr: '9:20-10:10', customBg: '#F3E5F5', category: 'work' },
    { slots: [4, 5], name: 'Phys-5211', start: '10:15', end: '12:00', timeStr: '10:15-12:00', customBg: '#E2F1F8', category: 'work' },
    { slots: [6, 7], name: 'Phys-5211 (Pract)', start: '13:00', end: '14:45', timeStr: '1:00-2:45', customBg: '#FCE8E6', category: 'work' }
  ],
  'WED': [
    { slots: [2, 3], name: 'Phys-5207', start: '08:25', end: '10:10', timeStr: '8:25-10:10', customBg: '#FEF7E0', category: 'work' },
    { slots: [4], name: 'Phys-5205', start: '10:15', end: '11:05', timeStr: '10:15-11:05', customBg: '#E0F2F1', category: 'work' },
    { slots: [5], name: 'Phys-5211', start: '11:10', end: '12:00', timeStr: '11:10-12:00', customBg: '#E2F1F8', category: 'work' },
    { slots: [6, 7], name: 'Phys-5207 (Pract)', start: '13:00', end: '14:45', timeStr: '1:00-2:45', customBg: '#FCE8E6', category: 'work' },
    { slots: [8, 9], name: 'Phys-5201 (Pract)', start: '14:50', end: '16:35', timeStr: '2:50-4:35', customBg: '#FCE8E6', category: 'work' }
  ],
  'THU': [
    { slots: [3], name: 'Phys-5209', start: '09:20', end: '10:10', timeStr: '9:20-10:10', customBg: '#E6F4EA', category: 'work' },
    { slots: [4], name: 'Phys-5205', start: '10:15', end: '11:05', timeStr: '10:15-11:05', customBg: '#E0F2F1', category: 'work' },
    { slots: [5], name: 'Phys-5203', start: '11:10', end: '12:00', timeStr: '11:10-12:00', customBg: '#F3E5F5', category: 'work' },
    { slots: [6, 7], name: 'Phys-5205 (Pract)', start: '13:00', end: '14:45', timeStr: '1:00-2:45', customBg: '#FCE8E6', category: 'work' },
    { slots: [8, 9], name: 'Phys-5203 (Pract)', start: '14:50', end: '16:35', timeStr: '2:50-4:35', customBg: '#FCE8E6', category: 'work' }
  ],
  'FRI': [
    { slots: [3], name: 'Phys-5201', start: '09:20', end: '10:10', timeStr: '9:20-10:10', customBg: '#E8F0FE', category: 'work' },
    { slots: [4], name: 'Phys-5205', start: '10:15', end: '11:05', timeStr: '10:15-11:05', customBg: '#E0F2F1', category: 'work' },
    { slots: [5], name: 'Phys-5203', start: '11:10', end: '12:00', timeStr: '11:10-12:00', customBg: '#F3E5F5', category: 'work' },
    { slots: [6, 7], name: 'Library', start: '13:00', end: '14:45', timeStr: '1:00-2:45', customBg: '#EFEBE9', category: 'personal' }
  ],
  'SAT': [],
  'SUN': []
};

export const TEMPLATES: Record<string, Template> = {
  'school': {
    name: '🏫 School Timetable',
    slots: [
      { start: '08:00', end: '08:50', label: 'Period 1' },
      { start: '08:55', end: '09:45', label: 'Period 2' },
      { start: '09:50', end: '10:40', label: 'Period 3' },
      { start: '10:45', end: '11:35', label: 'Period 4' },
      { start: '11:40', end: '12:30', label: 'Period 5' },
      { start: '13:00', end: '13:50', label: 'Period 6' },
      { start: '13:55', end: '14:45', label: 'Period 7' },
      { start: '14:50', end: '15:40', label: 'Period 8' }
    ],
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI']
  },
  'work': {
    name: '💼 Work Schedule',
    slots: [
      { start: '09:00', end: '09:50', label: 'Stand-up' },
      { start: '10:00', end: '11:00', label: 'Focus Time' },
      { start: '11:00', end: '12:00', label: 'Meeting' },
      { start: '13:00', end: '15:00', label: 'Deep Work' },
      { start: '15:00', end: '16:00', label: 'Review' }
    ],
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI']
  },
  'workout': {
    name: '🏋️ Workout Routine',
    slots: [
      { start: '06:00', end: '06:30', label: 'Cardio' },
      { start: '06:30', end: '07:00', label: 'Strength' },
      { start: '07:00', end: '07:15', label: 'Cool Down' },
      { start: '18:00', end: '18:30', label: 'Evening Walk' }
    ],
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  },
  'sleep': {
    name: '😴 Sleep Schedule',
    slots: [
      { start: '22:00', end: '06:00', label: 'Sleep' },
      { start: '13:00', end: '13:30', label: 'Nap' }
    ],
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  }
};

export const TRANSLATIONS = {
  'en': {
    appMainTitle: 'OmniFlow',
    navToday: 'Today',
    navTable: 'Table',
    navTasks: 'Tasks',
    navStats: 'Stats',
    navManage: 'Manage',
    titleWeeklyChart: 'Weekly Timetable',
    btnPrint: 'Print',
    tableGuideText: 'Tap to edit · Double-click to rename · Drag to reorder',
    thDayTime: 'DAY / TIME',
    titleTasksReminders: 'Tasks & Reminders',
    taskInputPlaceholder: 'Example — Submit assignment...',
    btnAddTask: 'Add',
    titleAddNewSlot: 'Add Time Slot',
    lblStartTime: 'Start',
    lblEndTime: 'End',
    lblDisplayLabel: 'Display Label',
    slotLabelPlaceholder: 'e.g. 4:40–5:30',
    btnSaveSlot: 'Save Slot',
    btnCancelEdit: 'Cancel',
    titleManageSlots: 'Manage Slots',
    titleCustomActivity: 'Add Activity',
    lblSelectDay: 'Day',
    lblQuickRange: 'Quick Range',
    lblStartSlot: 'Start',
    lblEndSlot: 'End',
    lblSelectSlots: 'Select Slots',
    lblSubjectName: 'Subject / Activity',
    subjectPlaceholder: 'e.g. Phys-5201 or Workout',
    lblActivityCategory: 'Category',
    optStudyRepair: '🎓 Study / Work',
    optPersonalCode: '💻 Personal / Code',
    optMayTime: '❤️ Relationship',
    lblBgColor: 'Background Color',
    titleAdvancedSettings: 'Settings',
    msgNoActivity: 'No activity right now.',
    msgNoScheduleToday: 'No classes scheduled for today.',
    msgNoScheduleTomorrow: 'No classes scheduled for tomorrow.',
    msgFree: 'Free',
    msgInClass: 'In Class',
    titleCurrentStatus: 'CURRENT STATUS',
    titleNextUp: 'NEXT UP TODAY',
    msgNoMoreClass: 'No more classes today.',
    tomorrowHeader: 'Tomorrow\'s Preview',
    btnSave: 'Save',
    btnCancel: 'Cancel',
    btnClose: 'Close',
    allDoneTitle: 'All Classes Completed!',
    allDoneSubtitle: 'Great job today! Time to relax. 🌟',
    noClassTitle: 'No Classes Today',
    noClassSubtitle: 'Take a break or work on personal projects.',
    noClassQuote: '"Rest is also work." 😌',
    allDoneQuote: '"All done. Time to relax." ✨',
    titleImportantEvents: 'Important Events & Deadlines',
    lblAddEvent: 'Add Important Event / Deadline',
    lblEventTitle: 'Event Title (အကြောင်းအရာ)',
    lblEventDate: 'Date (ရက်စွဲ)',
    lblEventTime: 'Time (အချိန်)',
    lblEventCategory: 'Category (အမျိုးအစား)',
    lblPriority: 'Priority (ဦးစားပေး)',
    lblAdvanceAlert: 'Advance Reminder (ကြိုတင်သတိပေးချက်)',
    catExam: 'Exam (စာမေးပွဲ)',
    catAssignment: 'Assignment (အိမ်စာ/တန်းစီ)',
    catDeadline: 'Deadline (သတ်မှတ်ရက်)',
    catMeeting: 'Meeting (အစည်းအဝေး)',
    catOther: 'Other (အခြား)',
    prioHigh: 'High (အရေးကြီး)',
    prioMed: 'Medium (အလယ်အလတ်)',
    prioLow: 'Low (ပုံမှန်)',
    alertExact: 'At exact time',
    alert15m: '15 Mins Before',
    alert1h: '1 Hour Before',
    alert3h: '3 Hours Before',
    alert1d: '1 Day Before (၁ ရက် ကြို)',
    alert2d: '2 Days Before (၂ ရက် ကြို)'
  },
  'my': {
    appMainTitle: 'OmniFlow',
    navToday: 'ယနေ့',
    navTable: 'ဇယား',
    navTasks: 'လုပ်ငန်း',
    navStats: 'စာရင်း',
    navManage: 'စီမံ',
    titleWeeklyChart: 'အပတ်စဉ် ဇယား',
    btnPrint: 'ပုံနှိပ်',
    tableGuideText: 'နှိပ်၍ပြင်ဆင် · နှစ်ချက်နှိပ်၍အမည်ပြောင်း',
    thDayTime: 'နေ့ / အချိန်',
    titleTasksReminders: 'လုပ်ငန်းများနှင့် သတိပေးချက်',
    taskInputPlaceholder: 'ဥပမာ — Assignment တင်ရန်...',
    btnAddTask: 'ထည့်',
    titleAddNewSlot: 'အချိန် Slot အသစ်',
    lblStartTime: 'စတင်ချိန်',
    lblEndTime: 'ပြီးဆုံးချိန်',
    lblDisplayLabel: 'ပြသမည့်စာသား',
    slotLabelPlaceholder: 'ဥပမာ — 4:40–5:30',
    btnSaveSlot: 'သိမ်းမည်',
    btnCancelEdit: 'ပယ်ဖျက်',
    titleManageSlots: 'Slot များစီမံ',
    titleCustomActivity: 'ဘာသာရပ်ထည့်ရန်',
    lblSelectDay: 'နေ့ရက်',
    lblQuickRange: 'အမြန်ရွေးချယ်ရန်',
    lblStartSlot: 'စတင်',
    lblEndSlot: 'ပြီး',
    lblSelectSlots: 'Slot များရွေးရန်',
    lblSubjectName: 'ဘာသာရပ် / လှုပ်ရှားမှု',
    subjectPlaceholder: 'ဥပမာ — Phys-5201 သို့မဟုတ် လေ့ကျင့်ခန်း',
    lblActivityCategory: 'အမျိုးအစား',
    optStudyRepair: '🎓 စာကျက် / အလုပ်',
    optPersonalCode: '💻 ကိုယ်ပိုင် / Code',
    optMayTime: '❤️ ဆက်ဆံရေး',
    lblBgColor: 'နောက်ခံအရောင်',
    titleAdvancedSettings: 'ဆက်တင်များ',
    msgNoActivity: 'လက်ရှိလှုပ်ရှားမှုမရှိပါ။',
    msgNoScheduleToday: 'ယနေ့ အတန်းမရှိပါ။',
    msgNoScheduleTomorrow: 'မနက်ဖြန် အတန်းမရှိပါ။',
    msgFree: 'လွတ်ချိန်',
    msgInClass: 'အတန်းချိန်',
    titleCurrentStatus: 'လက်ရှိအခြေအနေ',
    titleNextUp: 'နောက်ထပ်လာမည့်အတန်း',
    msgNoMoreClass: 'ယနေ့ နောက်ထပ်အတန်းမရှိတော့ပါ။',
    tomorrowHeader: 'မနက်ဖြန် ကြိုကြည့်',
    btnSave: 'သိမ်းမည်',
    btnCancel: 'ပယ်ဖျက်',
    btnClose: 'ပိတ်',
    allDoneTitle: 'ဒီနေ့အတန်းအားလုံး ပြီးပါပြီ။',
    allDoneSubtitle: 'ဒီနေ့အတွက် ကောင်းမွန်စွာ လုပ်ဆောင်ခဲ့ပါတယ်။ အနားယူပါ။ 🌟',
    noClassTitle: 'ဒီနေ့အတန်းမရှိပါ။',
    noClassSubtitle: 'အနားယူပါ သို့မဟုတ် ကိုယ်ပိုင်အလုပ်လုပ်ပါ။',
    noClassQuote: '"အနားယူခြင်းသည်လည်း အလုပ်တစ်ခုပါ။" 😌',
    allDoneQuote: '"အားလုံးပြီးပြီ။ အနားယူပါ။" ✨',
    titleImportantEvents: 'အရေးကြီး လုပ်စရာများနှင့် ရက်စွဲအလိုက် သတိပေးချက်များ',
    lblAddEvent: 'အရေးကြီးရက်စွဲ/သတိပေးချက် အသစ်ထည့်မည်',
    lblEventTitle: 'အကြောင်းအရာ / ခေါင်းစဉ်',
    lblEventDate: 'ရက်စွဲ',
    lblEventTime: 'အချိန်',
    lblEventCategory: 'အမျိုးအစား',
    lblPriority: 'ဦးစားပေး အရေးကြီးမှု',
    lblAdvanceAlert: 'ကြိုတင် သတိပေးချက်',
    catExam: '🎓 စာမေးပွဲ (Exam)',
    catAssignment: '📝 အိမ်စာ (Assignment)',
    catDeadline: '⏰ သတ်မှတ်ရက် (Deadline)',
    catMeeting: '🤝 အစည်းအဝေး (Meeting)',
    catOther: '📌 အခြား (Other)',
    prioHigh: '🔴 High (အထူးအရေးကြီး)',
    prioMed: '🟡 Medium (အလယ်အလတ်)',
    prioLow: '🟢 Low (ပုံမှန်)',
    alertExact: '🔔 ကွက်တိ အချိန်ရောက်မှ',
    alert15m: '🔔 ၁၅ မိနစ် ကြိုပေးမည်',
    alert1h: '🔔 ၁ နာရီ ကြိုပေးမည်',
    alert3h: '🔔 ၃ နာရီ ကြိုပေးမည်',
    alert1d: '🔔 ၁ ရက် ကြိုပေးမည်',
    alert2d: '🔔 ၂ ရက် ကြိုပေးမည်'
  }
};

export const PRESET_WALLPAPERS = [
  {
    id: 'cyber',
    name: '🌌 Cyber Neon Grid',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'nature',
    name: '🌲 Misty Emerald Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'mountain',
    name: '🏔️ Serene Alpine Lake',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'galaxy',
    name: '🚀 Deep Space Cosmos',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'sunset',
    name: '🌅 Sunset Horizon',
    url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'minimal',
    name: '🎨 Minimalist Geometry',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80'
  }
];

export const THEME_PRESETS: Record<string, Record<string, string>> = {
  'default': {
    '--color-primary': '#10b981',
    '--color-primary-dark': '#059669',
    '--color-primary-light': 'rgba(16, 185, 129, 0.1)',
    '--color-bg-body': '#f8fafc',
    '--color-bg-card': '#ffffff',
    '--color-bg-input': '#f1f5f9',
    '--color-text-primary': '#0f172a',
    '--color-text-secondary': '#334155',
    '--color-text-muted': '#64748b',
    '--color-border': 'rgba(0, 0, 0, 0.12)',
    '--color-border-focus': '#10b981'
  },
  'dark': {
    '--color-primary': '#4ade80',
    '--color-primary-dark': '#22c55e',
    '--color-primary-light': 'rgba(74, 222, 128, 0.15)',
    '--color-bg-body': '#090d16',
    '--color-bg-card': '#131d31',
    '--color-bg-input': '#1e293b',
    '--color-text-primary': '#ffffff',
    '--color-text-secondary': '#f1f5f9',
    '--color-text-muted': '#cbd5e1',
    '--color-border': 'rgba(255, 255, 255, 0.22)',
    '--color-border-focus': '#4ade80'
  },
  'cyber_neon': {
    '--color-primary': '#00f2fe',
    '--color-primary-dark': '#00c6ff',
    '--color-primary-light': 'rgba(0, 242, 254, 0.15)',
    '--color-bg-body': '#030712',
    '--color-bg-card': '#0b1329',
    '--color-bg-input': '#111827',
    '--color-text-primary': '#ffffff',
    '--color-text-secondary': '#e0f2fe',
    '--color-text-muted': '#7dd3fc',
    '--color-border': 'rgba(0, 242, 254, 0.3)',
    '--color-border-focus': '#00f2fe'
  },
  'high_contrast_light': {
    '--color-primary': '#0284c7',
    '--color-primary-dark': '#0369a1',
    '--color-primary-light': 'rgba(2, 132, 199, 0.15)',
    '--color-bg-body': '#ffffff',
    '--color-bg-card': '#f8fafc',
    '--color-bg-input': '#e2e8f0',
    '--color-text-primary': '#000000',
    '--color-text-secondary': '#0f172a',
    '--color-text-muted': '#334155',
    '--color-border': '#000000',
    '--color-border-focus': '#0284c7'
  },
  'high_contrast_dark': {
    '--color-primary': '#38bdf8',
    '--color-primary-dark': '#0284c7',
    '--color-primary-light': 'rgba(56, 189, 248, 0.2)',
    '--color-bg-body': '#000000',
    '--color-bg-card': '#0f172a',
    '--color-bg-input': '#1e293b',
    '--color-text-primary': '#ffffff',
    '--color-text-secondary': '#f8fafc',
    '--color-text-muted': '#e2e8f0',
    '--color-border': '#ffffff',
    '--color-border-focus': '#38bdf8'
  },
  'oled_pure_black': {
    '--color-primary': '#10b981',
    '--color-primary-dark': '#059669',
    '--color-primary-light': 'rgba(16, 185, 129, 0.2)',
    '--color-bg-body': '#000000',
    '--color-bg-card': '#0a0a0a',
    '--color-bg-input': '#171717',
    '--color-text-primary': '#ffffff',
    '--color-text-secondary': '#f5f5f5',
    '--color-text-muted': '#a3a3a3',
    '--color-border': 'rgba(255, 255, 255, 0.25)',
    '--color-border-focus': '#10b981'
  },
  'midnight_navy': {
    '--color-primary': '#60a5fa',
    '--color-primary-dark': '#3b82f6',
    '--color-primary-light': 'rgba(96, 165, 250, 0.2)',
    '--color-bg-body': '#030712',
    '--color-bg-card': '#0f172a',
    '--color-bg-input': '#1e293b',
    '--color-text-primary': '#f8fafc',
    '--color-text-secondary': '#e2e8f0',
    '--color-text-muted': '#94a3b8',
    '--color-border': 'rgba(96, 165, 250, 0.3)',
    '--color-border-focus': '#60a5fa'
  },
  'ocean': {
    '--color-primary': '#00695c',
    '--color-primary-dark': '#004d40',
    '--color-primary-light': '#e0f2f1',
    '--color-bg-body': '#e8f5e9',
    '--color-bg-card': '#ffffff',
    '--color-bg-input': '#f5faf5',
    '--color-text-primary': '#051d1d',
    '--color-text-secondary': '#133e3e',
    '--color-text-muted': '#2c6363',
    '--color-border': '#80cbd2',
    '--color-border-focus': '#00695c'
  },
  'forest': {
    '--color-primary': '#1b5e20',
    '--color-primary-dark': '#0d3b11',
    '--color-primary-light': '#e8f5e9',
    '--color-bg-body': '#f1f8e9',
    '--color-bg-card': '#ffffff',
    '--color-bg-input': '#f5faf5',
    '--color-text-primary': '#0a220c',
    '--color-text-secondary': '#1f4e22',
    '--color-text-muted': '#3b7a3e',
    '--color-border': '#81c784',
    '--color-border-focus': '#1b5e20'
  },
  'sunset': {
    '--color-primary': '#c2410c',
    '--color-primary-dark': '#9a3412',
    '--color-primary-light': '#ffedd5',
    '--color-bg-body': '#fff7ed',
    '--color-bg-card': '#ffffff',
    '--color-bg-input': '#ffedd5',
    '--color-text-primary': '#2a0a00',
    '--color-text-secondary': '#431407',
    '--color-text-muted': '#7c2d12',
    '--color-border': '#fdba74',
    '--color-border-focus': '#c2410c'
  },
  'lavender': {
    '--color-primary': '#6b21a8',
    '--color-primary-dark': '#581c87',
    '--color-primary-light': '#f3e8ff',
    '--color-bg-body': '#faf5ff',
    '--color-bg-card': '#ffffff',
    '--color-bg-input': '#f3e8ff',
    '--color-text-primary': '#1e0533',
    '--color-text-secondary': '#3b0764',
    '--color-text-muted': '#6b21a8',
    '--color-border': '#d8b4fe',
    '--color-border-focus': '#6b21a8'
  }
};
