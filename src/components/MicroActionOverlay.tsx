import React, { useState, useEffect } from 'react';
import { Eye, Droplet, Wind, Target, X, Check, Play, Pause, RotateCcw } from 'lucide-react';
import { MicroActionInfo } from '../data/motivationalQuotes';
import { Preferences } from '../types';
import { audioAlert } from '../utils/audioAlert';

interface MicroActionOverlayProps {
  action: MicroActionInfo;
  isOpen: boolean;
  onClose: () => void;
  preferences: Preferences;
}

export const MicroActionOverlay: React.FC<MicroActionOverlayProps> = ({
  action,
  isOpen,
  onClose,
  preferences
}) => {
  const isMM = preferences.lang === 'my';
  const initialSeconds = action.duration || 20;

  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Breathing state: 'inhale' (4s), 'hold' (7s), 'exhale' (8s)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseSeconds, setPhaseSeconds] = useState<number>(4);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(action.duration || 20);
      setIsRunning(true);
      setIsCompleted(false);
      setBreathPhase('inhale');
      setPhaseSeconds(4);
      audioAlert.triggerVibration('gentle');
    }
  }, [isOpen, action]);

  // Main countdown timer
  useEffect(() => {
    if (!isOpen || !isRunning || isCompleted || action.type === 'drink_water') return;

    if (timeLeft <= 0) {
      setIsCompleted(true);
      audioAlert.playSound('crystal_drop');
      audioAlert.triggerVibration('pulse');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isRunning, timeLeft, isCompleted, action.type]);

  // 4-7-8 Breathing loop
  useEffect(() => {
    if (!isOpen || !isRunning || isCompleted || action.type !== 'deep_breath') return;

    const interval = setInterval(() => {
      setPhaseSeconds((prev) => {
        if (prev <= 1) {
          if (breathPhase === 'inhale') {
            setBreathPhase('hold');
            return 7;
          } else if (breathPhase === 'hold') {
            setBreathPhase('exhale');
            return 8;
          } else {
            setBreathPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning, isCompleted, action.type, breathPhase]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    // 1. Water Drink Logged
    if (action.type === 'drink_water') {
      return (
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-blue-400 animate-bounce">
            <Droplet className="w-10 h-10 fill-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              {isMM ? '💧 ရေတစ်ဖန်ခွက် သောက်ပြီးပါပြီ!' : '💧 Hydration Logged!'}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto mt-1">
              {isMM
                ? 'သင့်ခန္ဓာကိုယ်နှင့် ဦးနှောက်ကို ရေဓာတ်ဖြည့်တင်းပြီးပါပြီ။ စိတ်ကြည်လင်စွာဖြင့် ရှေ့ဆက်ကြိုးစားပါ။'
                : 'Great job! Rehydrating replenishes neural energy and cleanses brain fog.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {isMM ? 'ကျေးဇူးတင်ပါသည်' : 'Done & Close'}
          </button>
        </div>
      );
    }

    // 2. 20-Sec Eye Rest Timer
    if (action.type === 'eye_timer') {
      const percent = ((20 - timeLeft) / 20) * 100;
      return (
        <div className="text-center py-4 space-y-4">
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                className="text-[var(--color-bg-input)]"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="#10B981"
                strokeWidth="8"
                strokeDasharray={377}
                strokeDashoffset={377 - (377 * percent) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-[var(--color-text-primary)]">
                {timeLeft}s
              </span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                {isCompleted ? (isMM ? 'ပြီးပါပြီ' : 'Done') : (isMM ? 'စက္ကန့်' : 'Seconds')}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
              {isCompleted
                ? (isMM ? '🎉 မျက်စိအနားရသွားပါပြီ!' : '🎉 Eye Break Complete!')
                : (isMM ? '👀 ပေ ၂၀ အကွာကို ကြည့်ပေးပါ' : '👀 Focus 20 Feet Away')}
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto mt-1">
              {isCompleted
                ? (isMM ? 'မျက်စိကြွက်သားများ ပြေလျော့သွားပါပြီ။ စာဆက်လက်လေ့လာနိုင်ပါပြီ။' : 'Your eye muscles have relaxed. Ready to study!')
                : (isMM ? 'စကရင်မှ အကြည့်လွှဲပြီး အဝေးတစ်နေရာကို ညင်သာစွာ စူးစိုက်ကြည့်ပါ' : 'Shift your gaze to a distant object or outside a window')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            {isCompleted ? (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {isMM ? 'ပြီးဆုံးပါပြီ' : 'Done & Close'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className="p-2.5 rounded-xl bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-primary)] text-xs font-bold border border-[var(--color-border)] cursor-pointer"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimeLeft(20);
                    setIsRunning(true);
                    setIsCompleted(false);
                  }}
                  className="p-2.5 rounded-xl bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-primary)] text-xs font-bold border border-[var(--color-border)] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    // 3. 4-7-8 Breathing Guide
    if (action.type === 'deep_breath') {
      const phaseColor = breathPhase === 'inhale' ? 'text-sky-400 bg-sky-500/20 border-sky-400' : breathPhase === 'hold' ? 'text-amber-400 bg-amber-500/20 border-amber-400' : 'text-emerald-400 bg-emerald-500/20 border-emerald-400';
      const phaseLabel = {
        inhale: isMM ? 'ရှူသွင်းပါ (Inhale)' : 'Inhale Gently',
        hold: isMM ? 'အောင့်ထားပါ (Hold)' : 'Hold Calmly',
        exhale: isMM ? 'ရှူထုတ်ပါ (Exhale)' : 'Exhale Slowly'
      };

      return (
        <div className="text-center py-4 space-y-4">
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            {/* Animated breathing orb */}
            <div
              className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ${phaseColor} ${
                breathPhase === 'inhale' ? 'scale-110 shadow-lg' : breathPhase === 'hold' ? 'scale-105' : 'scale-90'
              }`}
            >
              <span className="text-3xl font-extrabold">{phaseSeconds}s</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{breathPhase}</span>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-[var(--color-text-primary)]">
              {phaseLabel[breathPhase]}
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto mt-1">
              {isMM
                ? 'နှာခေါင်းမှ ၄ စက္ကန့် ရှူသွင်းပါ၊ ၇ စက္ကန့် အောင့်ထားပါ၊ ၈ စက္ကန့်ကြာ ပါးစပ်မှ ဖြည်းညင်းစွာ လေထုတ်ပါ'
                : 'Inhale 4s through nose, hold 7s, exhale 8s through mouth to soothe anxiety'}
            </p>
            <div className="mt-2 text-[11px] font-bold text-[var(--color-text-muted)]">
              {isMM ? `ကျန်ရှိချိန်: ${formatTime(timeLeft)}` : `Time Left: ${formatTime(timeLeft)}`}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className="p-2.5 rounded-xl bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-primary)] text-xs font-bold border border-[var(--color-border)] cursor-pointer"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {isMM ? 'ရပ်နားမည်' : 'End Exercise'}
            </button>
          </div>
        </div>
      );
    }

    // 4. 15-Min Quick Sprint
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-32 h-32 mx-auto rounded-full bg-amber-500/15 border-4 border-amber-500 flex flex-col items-center justify-center shadow-lg">
          <span className="text-3xl font-extrabold text-[var(--color-text-primary)] font-mono">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">
            Focus Sprint
          </span>
        </div>

        <div>
          <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
            {isCompleted
              ? (isMM ? '🎉 ၁၅ မိနစ် အာရုံစူးစိုက်ချိန် ပြီးမြောက်ပါပြီ!' : '🎉 15-Min Sprint Complete!')
              : (isMM ? '🎯 အာရုံမပျံ့လွင့်စေဘဲ စာကျက်ပါ' : '🎯 Deep Work Mode Active')}
          </h4>
          <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto mt-1">
            {isCompleted
              ? (isMM ? 'အလွန်ကောင်းမွန်သော ကြိုးစားမှုဖြစ်ပါသည်။ ၅ မိနစ် အနားယူနိုင်ပါပြီ။' : 'Outstanding discipline! Take a well-earned 5-minute break.')
              : (isMM ? 'ဖုန်းနှင့် အခြားအာရုံနှောင့်ယှက်မှုများကို ဖယ်ရှားပြီး လက်ရှိတာဝန်ကို အာရုံစိုက်ပါ' : 'Mute notifications and lock in on your top study task')}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {isCompleted ? (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {isMM ? 'ပြီးဆုံးပါပြီ' : 'Done & Close'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className="px-4 py-2.5 rounded-xl bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-primary)] text-xs font-bold border border-[var(--color-border)] cursor-pointer flex items-center gap-1.5"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? (isMM ? 'ခေတ္တရပ်မည်' : 'Pause') : (isMM ? 'ဆက်လုပ်မည်' : 'Resume')}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold border border-red-500/20 cursor-pointer"
              >
                {isMM ? 'ထွက်မည်' : 'Quit'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
            <span>{isMM ? action.title.my : action.title.en}</span>
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {renderContent()}
        </div>

      </div>
    </div>
  );
};
