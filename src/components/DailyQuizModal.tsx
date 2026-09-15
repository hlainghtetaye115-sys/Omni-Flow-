import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, RefreshCw, Flame, ArrowRight, X, BookOpen, Lightbulb } from 'lucide-react';
import { DAILY_QUIZZES, DailyQuiz } from '../data/motivationalQuotes';
import { Preferences } from '../types';
import { audioAlert } from '../utils/audioAlert';

interface DailyQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: Preferences;
}

export const DailyQuizModal: React.FC<DailyQuizModalProps> = ({
  isOpen,
  onClose,
  preferences
}) => {
  const isMM = preferences.lang === 'my';

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  
  // Streak state
  const [streak, setStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('omniflow_quiz_streak');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Pick today's quiz on load
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const startYear = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - startYear.getTime();
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
      const idx = Math.abs(dayOfYear % DAILY_QUIZZES.length);
      setCurrentQuizIndex(idx);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quiz: DailyQuiz = DAILY_QUIZZES[currentQuizIndex] || DAILY_QUIZZES[0];
  const langKey = isMM ? 'my' : 'en';

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const correct = idx === quiz.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      audioAlert.playSound('crystal_drop');
      audioAlert.triggerVibration('pulse');
      const newStreak = streak + 1;
      setStreak(newStreak);
      try {
        localStorage.setItem('omniflow_quiz_streak', newStreak.toString());
      } catch (e) {
        // ignore
      }
    } else {
      audioAlert.triggerVibration('double');
    }
  };

  const handleNextRandomQuestion = () => {
    let nextIdx = Math.floor(Math.random() * DAILY_QUIZZES.length);
    if (nextIdx === currentQuizIndex) {
      nextIdx = (nextIdx + 1) % DAILY_QUIZZES.length;
    }
    setCurrentQuizIndex(nextIdx);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    audioAlert.triggerVibration('gentle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-input)]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
                {isMM ? 'နေ့စဉ် ဗဟုသုတ ဉာဏ်စမ်း' : 'Daily Brain Teaser & Quiz'}
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {isMM ? '၁ မိနစ် အသိပညာစမ်းသပ်မှု' : '1-Minute Knowledge & Study Science Challenge'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold" title={isMM ? 'ဖြေဆိုပြီးမြောက်မှု Streak' : 'Quiz Streak'}>
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{streak}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[75vh]">
          
          {/* Question Tag */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              {quiz.category}
            </span>
            <span className="text-[11px] font-bold text-[var(--color-text-muted)]">
              #{quiz.id} of {DAILY_QUIZZES.length}
            </span>
          </div>

          {/* Question Text */}
          <div className="p-4 rounded-2xl bg-[var(--color-bg-input)]/60 border border-[var(--color-border)]">
            <h4 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] leading-relaxed">
              {quiz.question[langKey]}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {quiz.options[langKey].map((optionText, idx) => {
              const isSelected = selectedOption === idx;
              const isRightAnswer = isAnswered && idx === quiz.correctIndex;
              const isWrongSelection = isAnswered && isSelected && !isRightAnswer;

              let optionStyle = 'bg-[var(--color-bg-card)] border-[var(--color-border)] hover:bg-[var(--color-bg-input)] text-[var(--color-text-primary)]';
              if (isRightAnswer) {
                optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs';
              } else if (isWrongSelection) {
                optionStyle = 'bg-red-500/15 border-red-500 text-red-600 dark:text-red-400 font-bold shadow-xs';
              } else if (isAnswered) {
                optionStyle = 'bg-[var(--color-bg-input)]/40 border-transparent text-[var(--color-text-muted)] opacity-60';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                >
                  <span className="flex-1 leading-snug">{optionText}</span>
                  {isRightAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                  {isWrongSelection && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box (Reveals after answer) */}
          {isAnswered && (
            <div className={`p-4 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-200 ${
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                {isCorrect ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {isMM ? 'အဖြေမှန်ကန်ပါသည်! 🎉' : 'Correct! Outstanding! 🎉'}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    {isMM ? 'လေ့လာမှတ်သားဖွယ် အဖြေမှန်:' : 'Knowledge Insight:'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">
                {quiz.explanation[langKey]}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-input)]/40">
          <button
            type="button"
            onClick={handleNextRandomQuestion}
            className="px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)] text-xs font-bold text-[var(--color-text-primary)] cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isMM ? 'အခြား မေးခွန်း စမ်းမည်' : 'Next Question'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white text-xs font-bold cursor-pointer transition-all active:scale-95"
          >
            {isMM ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
