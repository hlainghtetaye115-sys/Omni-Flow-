import React, { useState } from 'react';
import {
  Sparkles, Heart, Copy, Share2, Search, Check,
  BookOpen, Lightbulb, Zap, Award, Compass, X, Briefcase, Camera,
  Plus, Trash2, PenTool
} from 'lucide-react';
import { motion } from 'motion/react';
import { MacWindowFrame } from './Modals';
import { DailyQuote, MOTIVATIONAL_QUOTES, detectQuoteMicroAction, MicroActionInfo } from '../data/motivationalQuotes';
import { Preferences } from '../types';
import { audioAlert } from '../utils/audioAlert';
import { StoryCardModal } from './StoryCardModal';
import { DailyQuizModal } from './DailyQuizModal';
import { MicroActionOverlay } from './MicroActionOverlay';
import { CustomQuoteModal } from './CustomQuoteModal';

interface MotivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: Preferences;
  savedQuoteIds: number[];
  onToggleSaveQuote: (id: number) => void;
  customQuotes?: DailyQuote[];
  onAddCustomQuote?: (quote: DailyQuote) => void;
  onDeleteCustomQuote?: (id: number) => void;
}

export const MotivationModal: React.FC<MotivationModalProps> = ({
  isOpen,
  onClose,
  preferences,
  savedQuoteIds,
  onToggleSaveQuote,
  customQuotes = [],
  onAddCustomQuote,
  onDeleteCustomQuote
}) => {
  const isMM = preferences.lang === 'my';
  const baseQuotes = MOTIVATIONAL_QUOTES[preferences.lang] || MOTIVATIONAL_QUOTES.en;
  const quotesList = [...customQuotes, ...baseQuotes];

  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'tips' | 'custom' | 'exams'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Sub-modals state
  const [storyQuote, setStoryQuote] = useState<DailyQuote | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [activeMicroAction, setActiveMicroAction] = useState<MicroActionInfo | null>(null);

  const categories = [
    { key: 'all', label: isMM ? 'အားလုံး' : 'All Quotes', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'motivation', label: isMM ? '🌟 စိတ်ခွန်အား' : '🌟 Motivation', icon: <Zap className="w-3.5 h-3.5" /> },
    { key: 'study_tip', label: isMM ? '📚 စာကျက်နည်း' : '📚 Study Tips', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'discipline', label: isMM ? '⚡ စည်းကမ်းနှင့် ဇွဲ' : '⚡ Discipline', icon: <Compass className="w-3.5 h-3.5" /> },
    { key: 'mindset', label: isMM ? '🧠 အတွေးအခေါ်' : '🧠 Mindset', icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { key: 'physics_wisdom', label: isMM ? '💡 ပညာရှိစကား' : '💡 Wisdom', icon: <Award className="w-3.5 h-3.5" /> },
    { key: 'exam', label: isMM ? '📝 စာမေးပွဲ' : '📝 Exam Tips', icon: <Check className="w-3.5 h-3.5" /> },
    { key: 'workplace', label: isMM ? '💼 လုပ်ငန်းခွင်' : '💼 Workplace', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { key: 'knowledge', label: isMM ? '💡 ဗဟုသုတ' : '💡 General Knowledge', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  // Filtered quotes based on tab, category, and search query
  const filteredQuotes = quotesList.filter((q) => {
    // Tab filter
    if (activeTab === 'saved') {
      if (!savedQuoteIds.includes(q.id)) return false;
    } else if (activeTab === 'tips') {
      if (q.category !== 'study_tip') return false;
    } else if (activeTab === 'custom') {
      if (!q.isCustom && q.category !== 'custom') return false;
    } else if (activeTab === 'exams') {
      if (q.category !== 'exam') return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && q.category !== selectedCategory) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchQuote = q.quote.toLowerCase().includes(query);
      const matchAuthor = q.author.toLowerCase().includes(query);
      return matchQuote || matchAuthor;
    }

    return true;
  });

  const handleCopy = (quote: DailyQuote) => {
    const text = `"${quote.quote}" - ${quote.author} (via OmniFlow)`;
    navigator.clipboard.writeText(text);
    setCopiedId(quote.id);
    audioAlert.triggerVibration('gentle');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (quote: DailyQuote) => {
    const text = `"${quote.quote}" - ${quote.author}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Motivation - OmniFlow',
          text: text,
          url: window.location.href
        });
      } catch (e) {
        handleCopy(quote);
      }
    } else {
      handleCopy(quote);
    }
  };

  return (
    <>
      <MacWindowFrame
        isOpen={isOpen}
        onClose={onClose}
        title={isMM ? 'Motivation စာကြည့်တိုက် & စိတ်ခွန်အား စာစုများ' : 'Motivation Hub & Study Wisdom'}
        maxWidthClass="max-w-2xl"
        icon={<Sparkles className="w-4 h-4 text-amber-500" />}
      >
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Top Header Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[var(--color-text-primary)]">
                  {isMM ? 'နေ့စဉ် စိတ်ဓာတ်ခွန်အားနှင့် ဗဟုသုတ စာကြည့်တိုက်' : 'Daily Motivation & Knowledge Hub'}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {isMM
                    ? 'ဗဟုသုတ၊ စာကျက်နည်းနှင့် စိတ်ခွန်အား စာစုပေါင်း ၁၅၀ ကျော်'
                    : '150+ science-backed study tips, mental models, and knowledge facts.'}
                </p>
              </div>
            </div>

            {/* Quick Actions (Quiz & Add Custom) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsQuizModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isMM ? 'ဉာဏ်စမ်း' : 'Quiz'}</span>
              </button>

              {onAddCustomQuote && (
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isMM ? 'အသစ်ထည့်မည်' : 'Add'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Navigation Tabs */}
          <div className="flex bg-[var(--color-bg-input)] p-1 rounded-xl border border-[var(--color-border)] gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => { setActiveTab('all'); setSelectedCategory('all'); }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isMM ? 'အားလုံး' : 'All'} ({quotesList.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('saved'); setSelectedCategory('all'); }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>{isMM ? 'သိမ်းထားသော' : 'Favorites'} ({savedQuoteIds.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('tips'); setSelectedCategory('study_tip'); }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'tips'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isMM ? 'စာကျက်နည်း' : 'Tips'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('custom'); setSelectedCategory('all'); }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isMM ? 'ကိုယ်ပိုင်' : 'My Quotes'} ({customQuotes.length})</span>
            </button>
          </div>

          {/* Search Bar & Category Pills */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMM ? 'စာသား သို့မဟုတ် စာရေးသူ အမည်ဖြင့် ရှာဖွေပါ...' : 'Search quotes, authors, or topics...'}
                className="w-full pl-9 pr-8 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activeTab === 'all' && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 border ${
                      selectedCategory === cat.key
                        ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]'
                        : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quotes List Cards */}
          <div className="space-y-3 pt-1">
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-10 bg-[var(--color-bg-input)]/50 rounded-2xl border border-[var(--color-border)] p-6 space-y-3">
                <Sparkles className="w-8 h-8 text-[var(--color-text-muted)] mx-auto opacity-50" />
                <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                  {activeTab === 'saved'
                    ? (isMM ? 'သိမ်းဆည်းထားသော စာစု မရှိသေးပါ။ အသဲပုံလေးကို နှိပ်၍ သိမ်းထားနိုင်ပါသည်။' : 'No saved favorite quotes yet. Tap the heart icon on any quote to save!')
                    : activeTab === 'custom'
                    ? (isMM ? 'ကိုယ်ပိုင် စာသား မထည့်ရသေးပါ။ "အသစ်ထည့်မည်" ခလုတ်ဖြင့် စိတ်ကြိုက် ရေးသားသိမ်းဆည်းနိုင်ပါသည်။' : 'No custom quotes yet. Click "Add" above to save your favorite wisdom!')
                    : (isMM ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော စာစု ရှာမတွေ့ပါ။' : 'No matching quotes found.')}
                </p>
                {activeTab === 'custom' && onAddCustomQuote && (
                  <button
                    type="button"
                    onClick={() => setIsCustomModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                  >
                    {isMM ? '✍️ စာသား အသစ်ထည့်မည်' : 'Add First Quote'}
                  </button>
                )}
              </div>
            ) : (
              filteredQuotes.map((quote) => {
                const isSaved = savedQuoteIds.includes(quote.id);
                const isCopied = copiedId === quote.id;
                const microAction = detectQuoteMicroAction(quote);

                return (
                  <motion.div
                    key={quote.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-xs space-y-3 relative group hover:border-[var(--color-primary)]/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] leading-relaxed italic pr-2">
                        "{quote.quote}"
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {quote.isCustom && onDeleteCustomQuote && (
                          <button
                            onClick={() => onDeleteCustomQuote(quote.id)}
                            className="p-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 cursor-pointer transition-all"
                            title={isMM ? 'ဖျက်မည်' : 'Delete Custom Quote'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onToggleSaveQuote(quote.id)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                            isSaved
                              ? 'bg-rose-500 text-white border-rose-500 shadow-xs scale-105'
                              : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-rose-500'
                          }`}
                          title={isSaved ? (isMM ? 'သိမ်းဆည်းမှု ပယ်ဖျက်မည်' : 'Remove from Favorites') : (isMM ? 'သိမ်းဆည်းမည်' : 'Save to Favorites')}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Micro-Action if available */}
                    {microAction && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">
                          {isMM ? microAction.description.my : microAction.description.en}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveMicroAction(microAction)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold cursor-pointer transition-all shrink-0"
                        >
                          {isMM ? microAction.title.my : microAction.title.en}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/60 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[var(--color-primary)]">
                        <span className="opacity-50">—</span>
                        <span>{quote.author}</span>
                        {quote.isCustom && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 font-bold ml-1">
                            {isMM ? 'ကိုယ်ပိုင်' : 'Custom'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Story Card Generator */}
                        <button
                          onClick={() => setStoryQuote(quote)}
                          className="p-1.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-amber-500 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title={isMM ? 'Story Card ဓာတ်ပုံထုတ်မည်' : 'Story Card Image'}
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-500" />
                        </button>

                        <button
                          onClick={() => handleCopy(quote)}
                          className="p-1.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title={isMM ? 'ကူးယူမည်' : 'Copy'}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleShare(quote)}
                          className="p-1.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title={isMM ? 'Share ပေးပို့မည်' : 'Share'}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </MacWindowFrame>

      {/* Story Card Modal for selected quote */}
      {storyQuote && (
        <StoryCardModal
          isOpen={!!storyQuote}
          onClose={() => setStoryQuote(null)}
          quote={storyQuote}
          preferences={preferences}
        />
      )}

      {/* Daily Quiz Modal */}
      <DailyQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        preferences={preferences}
      />

      {/* Micro-Action Modal */}
      {activeMicroAction && (
        <MicroActionOverlay
          action={activeMicroAction}
          isOpen={!!activeMicroAction}
          onClose={() => setActiveMicroAction(null)}
          preferences={preferences}
        />
      )}

      {/* Add Custom Quote Modal */}
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
