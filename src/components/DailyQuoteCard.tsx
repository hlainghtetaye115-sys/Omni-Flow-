import React, { useState } from 'react';
import {
  Quote, RefreshCw, Copy, Check, Heart, Sparkles, BookOpen, Share2,
  Camera, Lightbulb, PenTool, Clock, Sun, Sunrise, Moon, Zap, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Preferences } from '../types';
import {
  getDailyQuote,
  DailyQuote,
  getCurrentTimeSlot,
  detectQuoteMicroAction,
  getSubjectSmartTip,
  MicroActionInfo
} from '../data/motivationalQuotes';
import { StoryCardModal } from './StoryCardModal';
import { DailyQuizModal } from './DailyQuizModal';
import { MicroActionOverlay } from './MicroActionOverlay';
import { CustomQuoteModal } from './CustomQuoteModal';

interface DailyQuoteCardProps {
  preferences: Preferences;
  savedQuoteIds?: number[];
  onToggleSaveQuote?: (id: number) => void;
  onOpenMotivationHub?: () => void;
  customQuotes?: DailyQuote[];
  onAddCustomQuote?: (quote: DailyQuote) => void;
  activeSubject?: string;
}

export const DailyQuoteCard: React.FC<DailyQuoteCardProps> = ({
  preferences,
  savedQuoteIds = [],
  onToggleSaveQuote,
  onOpenMotivationHub,
  customQuotes = [],
  onAddCustomQuote,
  activeSubject
}) => {
  // Randomize offset on every app entry / visit so a fresh quote appears each time
  const [offset, setOffset] = useState<number>(() => Math.floor(Math.random() * 145));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Modals state
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [activeMicroAction, setActiveMicroAction] = useState<MicroActionInfo | null>(null);

  const lang = preferences.lang;
  const isMM = lang === 'my';
  const currentTimeOfDay = getCurrentTimeSlot();

  // Smart subject tip if available
  const subjectTip = activeSubject ? getSubjectSmartTip(activeSubject, lang) : null;

  // Resolve current quote based on filters & custom quotes
  const currentQuote = getDailyQuote(
    lang,
    offset,
    selectedCategory,
    timeFilter === 'all' ? undefined : timeFilter,
    customQuotes
  );

  const isSaved = savedQuoteIds.includes(currentQuote.id);
  const microAction = detectQuoteMicroAction(currentQuote);

  const handleNextQuote = () => {
    setOffset((prev) => prev + 1);
  };

  const handleCopyQuote = () => {
    const textToCopy = `"${currentQuote.quote}" - ${currentQuote.author}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareQuote = async () => {
    const textToCopy = `"${currentQuote.quote}" - ${currentQuote.author}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Motivation - OmniFlow',
          text: textToCopy,
          url: window.location.href
        });
      } catch (e) {
        handleCopyQuote();
      }
    } else {
      handleCopyQuote();
    }
  };

  const handleApplySubjectTip = () => {
    if (subjectTip) {
      setSelectedCategory(subjectTip.category);
    }
  };

  return (
    <>
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 mb-4 shadow-sm relative overflow-hidden transition-all group">
        {/* Background Decorative Accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--color-primary)]/8 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Top Bar: Categories, Time-Aware Toggle & Hub */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {/* Auto Time Slot Filter */}
            <button
              onClick={() => {
                setTimeFilter(timeFilter === 'all' ? currentTimeOfDay : 'all');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 border ${
                timeFilter !== 'all'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
              title={isMM ? 'အချိန်အလိုက် စမတ်ကျကျ ရွေးချယ်ခြင်း' : 'Time-Aware Mode'}
            >
              {currentTimeOfDay === 'morning' ? (
                <Sunrise className="w-3 h-3 text-amber-300" />
              ) : currentTimeOfDay === 'afternoon' ? (
                <Sun className="w-3 h-3 text-amber-300" />
              ) : (
                <Moon className="w-3 h-3 text-indigo-300" />
              )}
              <span>
                {timeFilter !== 'all'
                  ? isMM
                    ? currentTimeOfDay === 'morning'
                      ? '🌅 မနက်ခင်း'
                      : currentTimeOfDay === 'afternoon'
                      ? '☀️ နေ့လယ်'
                      : '🌙 ညနေ'
                    : currentTimeOfDay.toUpperCase()
                  : isMM
                  ? '⏰ အချိန်အလိုက်'
                  : 'Auto Time'}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('all');
                setTimeFilter('all');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === 'all' && timeFilter === 'all'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {isMM ? '🌟 အားလုံး' : '🌟 All'}
            </button>
            <button
              onClick={() => setSelectedCategory('motivation')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === 'motivation'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {isMM ? 'ခွန်အား' : 'Motivation'}
            </button>
            <button
              onClick={() => setSelectedCategory('study_tip')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === 'study_tip'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {isMM ? 'စာကျက်နည်း' : 'Study Tips'}
            </button>
            <button
              onClick={() => setSelectedCategory('discipline')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === 'discipline'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {isMM ? 'စည်းကမ်း' : 'Discipline'}
            </button>
            <button
              onClick={() => setSelectedCategory('exam')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === 'exam'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {isMM ? 'စာမေးပွဲ' : 'Exam'}
            </button>
            <button
              onClick={() => setSelectedCategory('knowledge')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === 'knowledge'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {isMM ? '💡 ဗဟုသုတ' : '💡 Knowledge'}
            </button>
            <button
              onClick={() => setSelectedCategory('workplace')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === 'workplace'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {isMM ? '💼 လုပ်ငန်းခွင်' : '💼 Workplace'}
            </button>
            <button
              onClick={() => setSelectedCategory('mindset')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === 'mindset'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {isMM ? '🧠 စိတ်ထား' : '🧠 Mindset'}
            </button>
            {customQuotes.length > 0 && (
              <button
                onClick={() => setSelectedCategory('custom')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategory === 'custom'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {isMM ? '✍️ ကိုယ်ပိုင်' : '✍️ My Quotes'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Daily Quiz Trigger */}
            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-xs active:scale-95"
              title={isMM ? '၁ မိနစ် ဉာဏ်စမ်း ဖြေဆိုမည်' : 'Take Daily Quiz'}
            >
              <Lightbulb className="w-3 h-3 text-purple-500" />
              <span className="hidden xs:inline">{isMM ? 'ဉာဏ်စမ်း' : 'Quiz'}</span>
            </button>

            {/* Library Trigger */}
            {onOpenMotivationHub && (
              <button
                onClick={onOpenMotivationHub}
                className="px-2.5 py-1 bg-[var(--color-bg-input)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-border)] rounded-lg text-[11px] font-bold text-[var(--color-primary)] cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                title={isMM ? 'စာကြည့်တိုက် အားလုံးကြည့်မည်' : 'Open Motivation Hub'}
              >
                <BookOpen className="w-3 h-3" />
                <span className="hidden sm:inline">{isMM ? 'စာကြည့်တိုက်' : 'Library'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 7. Subject/Timetable-Linked Smart Tip Banner (if activeSubject matches) */}
        {activeSubject && subjectTip && (
          <div
            onClick={handleApplySubjectTip}
            className="mb-3 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-2 cursor-pointer hover:bg-indigo-500/15 transition-all text-xs"
          >
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold truncate">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {isMM
                  ? `📌 ယနေ့ "${activeSubject}" အတန်းချိန်အတွက် စမတ်အကြံပြုချက်`
                  : `📌 Smart Tip for today's "${activeSubject}" class`}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shrink-0">
              {isMM ? 'ကြည့်မည်' : 'View Tip'}
            </span>
          </div>
        )}

        {/* Quote Card Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentQuote.id}-${lang}-${offset}-${selectedCategory}-${timeFilter}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative px-5 py-4 bg-[var(--color-bg-input)]/50 border border-amber-500/25 rounded-2xl shadow-xs"
          >
            {/* Magazine Watermark Quote Icon */}
            <div className="absolute right-4 top-2 text-amber-500/10 pointer-events-none select-none">
              <Quote className="w-16 h-16 rotate-180" />
            </div>

            <div className="relative z-10">
              {/* Category tag badge & Time indicator */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    <Sparkles className="w-2.5 h-2.5" />
                    {currentQuote.isCustom ? (isMM ? 'ကိုယ်ပိုင်' : 'Custom') : currentQuote.category}
                  </span>
                  {timeFilter !== 'all' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {isMM ? 'အချိန်ကိုက်' : 'Time-Matched'}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                  #{currentQuote.id}
                </span>
              </div>

              {/* Editorial Serif Quote Text */}
              <p className="text-base sm:text-lg font-serif italic text-[var(--color-text-primary)] leading-relaxed tracking-wide my-1">
                "{currentQuote.quote}"
              </p>

              {/* 2. Actionable Micro-Tip Action Bar (if quote matches eye/water/breath/focus) */}
              {microAction && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2 flex-wrap animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-primary)]">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-semibold text-[11px] sm:text-xs">
                      {isMM ? microAction.description.my : microAction.description.en}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMicroAction(microAction)}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1 ml-auto"
                  >
                    <span>{isMM ? microAction.title.my : microAction.title.en}</span>
                  </button>
                </div>
              )}

              {/* Bottom Meta & Action Tools */}
              <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-[var(--color-border)]/60">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-serif font-bold text-xs">
                    {currentQuote.author.charAt(0)}
                  </div>
                  <div className="text-xs font-bold font-serif text-[var(--color-primary)]">
                    — {currentQuote.author}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-auto flex-wrap">
                  {/* 3. Story Card Generator Modal Trigger */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setIsStoryModalOpen(true)}
                    className="p-1.5 px-2 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-amber-500 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title={isMM ? 'Story Card ဓာတ်ပုံထုတ်မည်' : 'Generate Story Image'}
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] hidden xs:inline">{isMM ? 'Story Card' : 'Image'}</span>
                  </motion.button>

                  {/* 5. Custom Quote Trigger */}
                  {onAddCustomQuote && (
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setIsCustomModalOpen(true)}
                      className="p-1.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-emerald-500 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      title={isMM ? 'ကိုယ်ပိုင် စာသား အသစ်ထည့်မည်' : 'Add Custom Quote'}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                    </motion.button>
                  )}

                  {/* Bookmark Favorite Quote */}
                  {onToggleSaveQuote && (
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => onToggleSaveQuote(currentQuote.id)}
                      className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                        isSaved
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-rose-500'
                      }`}
                      title={isSaved ? (isMM ? 'သိမ်းဆည်းမှု ပယ်ဖျက်မည်' : 'Remove Favorite') : (isMM ? 'သိမ်းဆည်းမည်' : 'Save Favorite')}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    </motion.button>
                  )}

                  {/* Share Quote */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleShareQuote}
                    className="p-1.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title={isMM ? 'Share ပေးပို့မည်' : 'Share Quote'}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </motion.button>

                  {/* Copy Quote */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleCopyQuote}
                    className="p-1.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title={isMM ? 'စာသားကို ကူးယူမည်' : 'Copy Quote'}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-bold">{copied ? (isMM ? 'ကူးပြီးပြီ' : 'Copied') : (isMM ? 'ကူးမည်' : 'Copy')}</span>
                  </motion.button>

                  {/* Next Quote */}
                  <motion.button
                    whileHover={{ scale: 1.08, rotate: 180 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleNextQuote}
                    className="p-1.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title={isMM ? 'နောက်ထပ် စာသားအသစ်' : 'Next Quote'}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Story Card Generator Modal */}
      <StoryCardModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        quote={currentQuote}
        preferences={preferences}
      />

      {/* 6. Daily Quiz Modal */}
      <DailyQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        preferences={preferences}
      />

      {/* 2. Interactive Micro-Action Overlay */}
      {activeMicroAction && (
        <MicroActionOverlay
          action={activeMicroAction}
          isOpen={!!activeMicroAction}
          onClose={() => setActiveMicroAction(null)}
          preferences={preferences}
        />
      )}

      {/* 5. Custom Quote Modal */}
      {onAddCustomQuote && (
        <CustomQuoteModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onSaveQuote={onAddCustomQuote}
          preferences={preferences}
        />
      )}
    </>
  );
};
