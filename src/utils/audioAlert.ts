// Utility for Web Audio Synthesizer Sound Presets, Volume Control, and Phone Vibration Alerts

export type SoundPreset = 'gentle_chime' | 'zen_bell' | 'crystal_drop' | 'digital_beep' | 'classic_alarm' | 'marimba';
export type VibrationPattern = 'gentle' | 'double' | 'pulse' | 'strong';

class AudioAlertService {
  private audioCtx: AudioContext | null = null;
  private voicesLoaded = false;
  private currentAudioElement: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voicesLoaded = true;
      };
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch (e) {
      console.warn('AudioContext error:', e);
      return null;
    }
  }

  /**
   * Synthesize sound using rich presets and customizable volume
   */
  public playSound(
    preset: SoundPreset = 'gentle_chime',
    volumePercent: number = 80
  ) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      const vol = Math.max(0.05, Math.min(1, (volumePercent / 100) * 0.45));
      masterGain.gain.setValueAtTime(vol, now);
      masterGain.connect(ctx.destination);

      if (preset === 'gentle_chime') {
        // Soft bell chord (E5 & B5) with gentle envelope
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g1 = ctx.createGain();
        const g2 = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc2.frequency.setValueAtTime(987.77, now + 0.08); // B5

        g1.gain.setValueAtTime(0, now);
        g1.gain.linearRampToValueAtTime(1, now + 0.04);
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        g2.gain.setValueAtTime(0, now + 0.08);
        g2.gain.linearRampToValueAtTime(0.9, now + 0.12);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

        osc1.connect(g1);
        g1.connect(masterGain);
        osc2.connect(g2);
        g2.connect(masterGain);

        osc1.start(now);
        osc2.start(now + 0.08);
        osc1.stop(now + 0.9);
        osc2.stop(now + 1.0);
      } else if (preset === 'zen_bell') {
        // Deep Tibetan singing bowl harmonic chime
        const fundamental = 440; // A4
        const harmonics = [1, 2.76, 5.4, 8.9];
        harmonics.forEach((mult, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(fundamental * mult, now);
          
          const initialVol = 1 / (i + 1);
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(initialVol, now + 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

          osc.connect(g);
          g.connect(masterGain);

          osc.start(now);
          osc.stop(now + 1.45);
        });
      } else if (preset === 'crystal_drop') {
        // Pure high frequency water drop / crystal glissando
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now); // A6
        osc.frequency.exponentialRampToValueAtTime(2200, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.4);

        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(1, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(g);
        g.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.65);
      } else if (preset === 'digital_beep') {
        // Crisp dual digital pager beep
        [0, 0.14].forEach((delay) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200, now + delay);

          g.gain.setValueAtTime(0, now + delay);
          g.gain.linearRampToValueAtTime(0.9, now + delay + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);

          osc.connect(g);
          g.connect(masterGain);

          osc.start(now + delay);
          osc.stop(now + delay + 0.1);
        });
      } else if (preset === 'classic_alarm') {
        // Urgent 3-tone classic alarm pulse
        [0, 0.12, 0.24].forEach((delay) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(950, now + delay);

          g.gain.setValueAtTime(0, now + delay);
          g.gain.linearRampToValueAtTime(0.8, now + delay + 0.015);
          g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

          osc.connect(g);
          g.connect(masterGain);

          osc.start(now + delay);
          osc.stop(now + delay + 0.09);
        });
      } else if (preset === 'marimba') {
        // Warm wooden bar acoustic harmonic tones (C5, E5, G5, C6)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const delay = i * 0.08;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + delay);

          g.gain.setValueAtTime(0, now + delay);
          g.gain.linearRampToValueAtTime(0.95, now + delay + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);

          osc.connect(g);
          g.connect(masterGain);

          osc.start(now + delay);
          osc.stop(now + delay + 0.4);
        });
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Backward compatible chime caller
   */
  public playChime(type: 'chime' | 'alert' | 'success' | SoundPreset = 'chime') {
    if (type === 'alert') {
      this.playSound('digital_beep', 85);
    } else if (type === 'success') {
      this.playSound('marimba', 85);
    } else if (type === 'chime') {
      this.playSound('gentle_chime', 80);
    } else {
      this.playSound(type as SoundPreset, 80);
    }
  }

  /**
   * Trigger Phone Vibration via Web Vibration API
   */
  public triggerVibration(pattern: VibrationPattern = 'gentle'): boolean {
    if (typeof navigator === 'undefined' || !navigator.vibrate) {
      return false;
    }
    try {
      let vibrationPattern: number[] = [120];
      if (pattern === 'gentle') {
        vibrationPattern = [100];
      } else if (pattern === 'double') {
        vibrationPattern = [100, 80, 120];
      } else if (pattern === 'pulse') {
        vibrationPattern = [80, 50, 80, 50, 150];
      } else if (pattern === 'strong') {
        vibrationPattern = [250, 100, 250];
      }
      return navigator.vibrate(vibrationPattern);
    } catch (e) {
      console.warn('Vibration API error:', e);
      return false;
    }
  }

  /**
   * Speak text out loud - Voice TTS feature disabled per user request
   */
  public speak(_text: string, _lang: 'my' | 'en' = 'en', _rate = 0.85): boolean {
    this.stopSpeech();
    return false;
  }

  private speakWithWebSpeech(_text: string, _lang: 'my' | 'en', _rate = 0.85): boolean {
    return false;
  }

  /**
   * Announce active or upcoming class schedule
   */
  public announceSchedule(_currentActivity: { name: string; start: string; end: string } | null, _nextActivity: { name: string; start: string } | null, _isMM: boolean) {
    this.playChime('chime');
  }

  public stopSpeech() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioAlert = new AudioAlertService();

