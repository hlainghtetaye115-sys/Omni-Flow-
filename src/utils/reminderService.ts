// Smart Notification & Reminder Engine for Classes & Work Shifts
import { audioAlert } from './audioAlert';
import { scheduleNativeBackgroundAlarm } from '../lib/notifications';

export interface UpcomingItem {
  id: string;
  name: string;
  timeStr: string;
  start: string;
  end: string;
  type: 'class' | 'shift';
}

class ReminderService {
  private notifiedSet = new Set<string>();

  constructor() {
    this.loadNotifiedSet();
  }

  private loadNotifiedSet() {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`omniflow_notified_${todayStr}`);
      if (saved) {
        this.notifiedSet = new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error loading notified set', e);
    }
  }

  private markNotified(key: string) {
    this.notifiedSet.add(key);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem(`omniflow_notified_${todayStr}`, JSON.stringify(Array.from(this.notifiedSet)));
    } catch (e) {}
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Schedule native background alarms for items so they trigger even when app is closed and screen is off
   */
  public async scheduleAllNativeAlarms(items: UpcomingItem[], lang: 'en' | 'my' = 'my') {
    if (!items || items.length === 0) return;
    const now = new Date();
    const isMM = lang === 'my';

    for (const item of items) {
      if (!item.start) continue;
      const [sh, sm] = item.start.split(':').map(Number);
      const startTime = new Date(now);
      startTime.setHours(sh, sm, 0, 0);

      // If class is in the future today
      if (startTime.getTime() > now.getTime()) {
        // Schedule 10 minutes before start
        const alarmTime = new Date(startTime.getTime() - 10 * 60 * 1000);
        if (alarmTime.getTime() > now.getTime()) {
          const title = isMM ? '🔔 အချိန်ဇယား သတိပေးချက်' : '🔔 Class Reminder';
          const body = isMM
            ? `"${item.name}" အတန်း ၁၀ မိနစ်အတွင်း စတင်ပါတော့မည် (${item.start})`
            : `"${item.name}" starts in 10 minutes (${item.start})`;
          
          // Generate a numeric ID from item id string
          const numericId = Math.abs(hashCode(item.id + item.start));
          await scheduleNativeBackgroundAlarm(numericId, title, body, alarmTime, true);
        }
      }
    }
  }

  /**
   * Check upcoming class/shift and fire a reminder if it's starting within 10 minutes
   */
  public checkAndFireReminders(
    item: UpcomingItem | null,
    lang: 'en' | 'my' = 'my',
    showAlert?: (msg: string, type?: any) => void
  ) {
    if (!item || !item.start) return;

    const now = new Date();
    const [sh, sm] = item.start.split(':').map(Number);
    const startTime = new Date(now);
    startTime.setHours(sh, sm, 0, 0);

    const diffSeconds = Math.floor((startTime.getTime() - now.getTime()) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    // Notify if starting within 10 minutes (between 0 and 10 mins)
    if (diffMinutes >= 0 && diffMinutes <= 10) {
      const notifyKey = `${item.id}_${item.start}_10m`;
      if (!this.notifiedSet.has(notifyKey)) {
        this.markNotified(notifyKey);

        const isMM = lang === 'my';
        const title = isMM ? '🔔 အချိန်ဇယား သတိပေးချက်' : '🔔 Schedule Reminder';
        const body = isMM
          ? `"${item.name}" စတင်ရန် ${diffMinutes === 0 ? 'အဆင်သင့်ဖြစ်ပါပြီ' : `${diffMinutes} မိနစ်ခန့်လိုပါသေးသည်`} (${item.start})`
          : `"${item.name}" is starting in ${diffMinutes === 0 ? 'now' : `${diffMinutes} minutes`} (${item.start})`;

        // 1. Play Audio Chime
        audioAlert.playChime('alert');

        // 2. Browser Native Notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(title, {
              body,
              icon: '/favicon.png',
              tag: notifyKey
            });
          } catch (e) {
            console.warn('Native notification error:', e);
          }
        }

        // 3. In-App Toast Alert
        if (showAlert) {
          showAlert(body, 'info');
        }

        // 4. TTS Voice
        audioAlert.speak(body, lang);
      }
    }
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const reminderService = new ReminderService();

