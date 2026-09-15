// Utility for Lock Screen & Background Notifications using Web Notifications, Service Worker API, and Capacitor Local Notifications
import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // Request Capacitor Local Notifications permission if running natively
    const capPerm = await LocalNotifications.requestPermissions();
    if (capPerm.display === 'granted') {
      return true;
    }
  } catch (e) {
    // Not running under Capacitor or unsupported
  }

  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser.');
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

/**
 * Schedule a native background alarm/notification that fires even when the app is closed and screen is off
 */
export async function scheduleNativeBackgroundAlarm(
  id: number,
  title: string,
  body: string,
  scheduleDate: Date,
  sound: boolean = true
) {
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id,
          schedule: { at: scheduleDate },
          sound: sound ? 'default' : undefined,
          smallIcon: 'ic_stat_icon_config_sample',
          iconColor: '#4F46E5',
          channelId: 'omniflow_reminders'
        }
      ]
    });
    console.log(`Scheduled native background notification ID ${id} at ${scheduleDate.toLocaleString()}`);
  } catch (e) {
    console.warn('Capacitor LocalNotifications schedule warning (fallback to web/app state):', e);
  }
}

export async function sendSystemNotification(
  title: string,
  body: string,
  options?: {
    tag?: string;
    icon?: string;
    vibrate?: number[];
    sound?: boolean;
    url?: string;
  }
) {
  // Vibration for lockscreen feel
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(options?.vibrate || [300, 100, 300, 100, 400]);
    } catch (e) {}
  }

  // Audio beep
  if (options?.sound !== false) {
    try {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.play().catch(() => {});
    } catch (e) {}
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notificationOptions: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: options?.icon || '/app-icon.jpg',
    badge: '/app-icon.jpg',
    tag: options?.tag || 'timetable-alert',
    renotify: true,
    requireInteraction: true, // Key for staying on screen until dismissed or tapped
    data: {
      url: options?.url || window.location.href,
      dateOfArrival: Date.now()
    }
  };

  // Primary method: Service Worker showNotification (Works when app is in background / locked screen)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, notificationOptions);
        return;
      }
    } catch (err) {
      console.warn('Service Worker showNotification warning, fallback to Notification API', err);
    }
  }

  // Fallback method: Standard Window Notification (Works when tab is active or minimized)
  try {
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (e) {
    console.error('Window Notification error:', e);
  }
}

