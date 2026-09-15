import React, { useState, useEffect } from 'react';
import { Sparkles, PenTool, X, Check, BookOpen, Clock, Tag } from 'lucide-react';
import { DailyQuote } from '../data/motivationalQuotes';
import { Preferences } from '../types';
import { audioAlert } from '../utils/audioAlert';

interface CustomQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuote: (quote: DailyQuote) => void;
  quoteToEdit?: DailyQuote | null;
  preferences: Preferences;
}

export const CustomQuoteModal: React.FC<CustomQuoteModalProps> = ({
  isOpen,
  onClose,
  onSaveQuote,
  quoteToEdit,
  preferences
}) => {
  const isMM = preferences.lang === 'my';

  const [quoteText, setQuoteText] = useState('');
  const [authorText, setAuthorText] = useState('');
  const [category, setCategory] = useState<DailyQuote['category']>('motivation');
  const [timeOfDay, setTimeOfDay] = useState<'any' | 'morning' | 'afternoon' | 'evening'>('any');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (quoteToEdit) {
        setQuoteText(quoteToEdit.quote);
        setAuthorText(quoteToEdit.author);
        setCategory(quoteToEdit.category);
        setTimeOfDay(quoteToEdit.timeOfDay || 'any');
      } else {
        setQuoteText('');
        setAuthorText('');
        setCategory('motivation');
        setTimeOfDay('any');
      }
      setError('');
    }
  }, [isOpen, quoteToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim()) {
      setError(isMM ? 'စာသား ထည့်သွင်းပေးပါရန် လိုအပ်ပါသည်' : 'Quote text is required');
      return;
    }

    const newQuote: DailyQuote = {
      id: quoteToEdit ? quoteToEdit.id : Date.now(),
      quote: quoteText.trim(),
      author: authorText.trim() || (isMM ? 'ကိုယ့်မှတ်သားဖွယ်' : 'Personal Note'),
      category: category,
      timeOfDay: timeOfDay,
      isCustom: true
    };

    audioAlert.playSound('gentle_chime');
    audioAlert.triggerVibration('pulse');
    onSaveQuote(newQuote);
    onClose();
  };

  const categories: { key: DailyQuote['category']; label: { my: string; en: string } }[] = [
    { key: 'motivation', label: { my: '🌟 စိတ်ခွန်အား', en: 'Motivation' } },
    { key: 'study_tip', label: { my: '📚 စာကျက်နည်း', en: 'Study Tip' } },
    { key: 'discipline', label: { my: '⚡ စည်းကမ်း/ဇွဲ', en: 'Discipline' } },
    { key: 'mindset', label: { my: '🧠 အတွေးအခေါ်', en: 'Mindset' } },
    { key: 'knowledge', label: { my: '💡 ဗဟုသုတ', en: 'Knowledge' } },
    { key: 'exam', label: { my: '📝 စာမေးပွဲ', en: 'Exam' } },
    { key: 'workplace', label: { my: '💼 လုပ်ငန်းခွင်', en: 'Workplace' } },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <PenTool className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
              {quoteToEdit
                ? (isMM ? 'မှတ်သားဖွယ် စာသား ပြင်ဆင်မည်' : 'Edit Custom Quote')
                : (isMM ? 'ကိုယ်ပိုင် စာသား အသစ်ထည့်မည်' : 'Add Custom Quote')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Quote Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <span>{isMM ? 'စာသား / အဆိုအမိန့်' : 'Quote Text'}</span>
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              placeholder={isMM ? 'မိမိနှစ်သက်သော စာသား၊ ဆောင်ပုဒ် သို့မဟုတ် မှတ်သားဖွယ်ရာ ရေးပါ...' : 'Enter your inspiring quote or reminder...'}
              rows={3}
              className="w-full p-3 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all resize-none"
              required
            />
          </div>

          {/* Author */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)]">
              {isMM ? 'ရေးသားသူ / မူရင်းအရင်းအမြစ်' : 'Author / Source'}
            </label>
            <input
              type="text"
              value={authorText}
              onChange={(e) => setAuthorText(e.target.value)}
              placeholder={isMM ? 'ဥပမာ - ဆရာကြီး ဦးဖိုးကျား၊ Atomic Habits စာအုပ်' : 'e.g. James Clear, My Journal, Mentor'}
              className="w-full p-2.5 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>{isMM ? 'ကဏ္ဍ' : 'Category'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`p-2 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer ${
                    category === c.key
                      ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {isMM ? c.label.my : c.label.en}
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{isMM ? 'ပြသလိုသော အချိန်' : 'Preferred Time of Day'}</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'any', my: 'အားလုံး', en: 'Anytime' },
                { id: 'morning', my: 'မနက်', en: 'Morning' },
                { id: 'afternoon', my: 'နေ့လယ်', en: 'Afternoon' },
                { id: 'evening', my: 'ညနေ', en: 'Evening' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimeOfDay(t.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center border cursor-pointer transition-all ${
                    timeOfDay === t.id
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {isMM ? t.my : t.en}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)] cursor-pointer"
            >
              {isMM ? 'မလုပ်တော့ပါ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isMM ? 'သိမ်းဆည်းမည်' : 'Save Quote'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
