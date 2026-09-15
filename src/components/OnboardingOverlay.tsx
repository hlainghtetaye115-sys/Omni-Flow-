import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Briefcase, ArrowRight, User } from 'lucide-react';
import { Preferences } from '../types';

interface OnboardingOverlayProps {
  preferences: Preferences;
  onComplete: (name: string, lifeMode: 'student' | 'workplace') => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ preferences, onComplete }) => {
  const isMM = preferences.lang === 'my';
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [lifeMode, setLifeMode] = useState<'student' | 'workplace'>('student');

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2) {
      onComplete(name.trim(), lifeMode);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-bg-body)]/90 backdrop-blur-xl p-4">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-2xl rounded-3xl p-8 max-w-md w-full"
          >
            <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-primary)] mb-6 mx-auto">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-center text-[var(--color-text-primary)] mb-2">
              {isMM ? 'ကြိုဆိုပါတယ်!' : 'Welcome!'}
            </h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-8">
              {isMM ? 'ပထမဆုံးအနေနဲ့ နာမည်လေး သိပါရစေ' : 'First, what should we call you?'}
            </p>
            
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isMM ? 'သင့်အမည် (ဥပမာ - မေ)' : 'Your name (e.g. May)'}
              className="w-full bg-[var(--color-bg-input)] border-2 border-[var(--color-border)] rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors text-center"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) handleNext();
              }}
            />
            
            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="w-full mt-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>{isMM ? 'ရှေ့ဆက်မည်' : 'Continue'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-2xl rounded-3xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-center text-[var(--color-text-primary)] mb-2">
              {isMM ? 'လက်ရှိ ဘာလုပ်နေပါသလဲ?' : 'What describes you best?'}
            </h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-8 text-sm">
              {isMM ? 'သင့်နဲ့ကိုက်ညီမယ့် လုပ်ဆောင်ချက်တွေကို ပြင်ဆင်ပေးပါမယ်' : 'We will customize your experience based on this.'}
            </p>
            
            <div className="space-y-4 mb-8">
              <button
                onClick={() => setLifeMode('student')}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${lifeMode === 'student' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-bg-input)]'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center ${lifeMode === 'student' ? 'bg-[var(--color-primary)] text-white' : 'bg-emerald-500/10 text-emerald-600'}`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-[var(--color-text-primary)] text-lg">
                    {isMM ? 'ကျောင်းသား' : 'Student'}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">
                    {isMM ? 'အချိန်ဇယားများ၊ အိမ်စာများ၊ စာကျက်ချိန်များ စီမံမည်' : 'Manage classes, assignments, and study sessions'}
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setLifeMode('workplace')}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${lifeMode === 'workplace' ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--color-border)] hover:border-blue-500/50 bg-[var(--color-bg-input)]'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center ${lifeMode === 'workplace' ? 'bg-blue-600 text-white' : 'bg-blue-500/10 text-blue-600'}`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-[var(--color-text-primary)] text-lg">
                    {isMM ? 'လုပ်ငန်းခွင်' : 'Workplace'}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">
                    {isMM ? 'အလုပ်ချိန်များ၊ အစည်းအဝေးများ၊ Task များ စီမံမည်' : 'Manage work shifts, meetings, and daily tasks'}
                  </div>
                </div>
              </button>
            </div>
            
            <button
              onClick={handleNext}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <span>{isMM ? 'စတင်အသုံးပြုမည်' : 'Get Started'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
