// Offline-capable Sound & Web Notification Engine
class SoundAndNotificationService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  // Play pleasant harmonic chime (Web Audio API)
  playChime(type: 'success' | 'alert' | 'reminder' | 'work' = 'reminder') {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.connect(ctx.destination);
      osc1.connect(gain);
      osc2.connect(gain);

      if (type === 'success') {
        // C5 -> G5 -> C6 melody
        osc1.frequency.setValueAtTime(523.25, now);
        osc1.frequency.setValueAtTime(783.99, now + 0.1);
        osc1.frequency.setValueAtTime(1046.50, now + 0.2);
        osc2.frequency.setValueAtTime(659.25, now);
        osc2.frequency.setValueAtTime(987.77, now + 0.1);
        osc2.frequency.setValueAtTime(1318.51, now + 0.2);
      } else if (type === 'alert') {
        // Urgent alert
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.setValueAtTime(440, now + 0.15);
        osc1.frequency.setValueAtTime(880, now + 0.3);
      } else {
        // Soft, elegant double chime (E5 -> A5)
        osc1.frequency.setValueAtTime(659.25, now);
        osc1.frequency.setValueAtTime(880, now + 0.15);
        osc2.frequency.setValueAtTime(329.63, now);
        osc2.frequency.setValueAtTime(440, now + 0.15);
      }

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);

      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (e) {
      console.warn('Audio chime playback failed:', e);
    }
  }

  // Request browser notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    const perm = await Notification.requestPermission();
    return perm;
  }

  // Check if notifications are granted
  hasPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Send Push Notification
  sendNotification(title: string, options?: { body?: string; icon?: string; tag?: string; playSound?: boolean }) {
    if (options?.playSound !== false) {
      this.playChime('reminder');
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notif = new Notification(title, {
        body: options?.body || 'OmniFlow Schedule Reminder',
        icon: options?.icon || '/app-icon.jpg',
        badge: '/app-icon.jpg',
        tag: options?.tag || 'omniflow-alert',
        silent: false,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch {
      // Fallback for Service Worker notification if available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body: options?.body,
        });
      }
    }
  }
}

export const notificationService = new SoundAndNotificationService();
