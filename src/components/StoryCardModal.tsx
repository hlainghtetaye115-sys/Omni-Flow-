import React, { useState, useEffect, useRef } from 'react';
import { Download, Share2, Sparkles, X, Check, Eye, Palette, Layout, Sparkle } from 'lucide-react';
import { DailyQuote } from '../data/motivationalQuotes';
import { Preferences } from '../types';
import { audioAlert } from '../utils/audioAlert';

interface StoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: DailyQuote;
  preferences: Preferences;
}

type CardTheme = 'midnight' | 'sunset' | 'indigo' | 'emerald' | 'minimal';
type CardRatio = 'story' | 'square';

const THEMES: { id: CardTheme; name: { my: string; en: string }; bg: string[]; textColor: string; accentColor: string; quoteColor: string }[] = [
  {
    id: 'midnight',
    name: { my: 'Midnight OLED', en: 'Midnight OLED' },
    bg: ['#090D16', '#111827', '#030712'],
    textColor: '#F9FAFB',
    accentColor: '#F59E0B',
    quoteColor: '#FCD34D'
  },
  {
    id: 'sunset',
    name: { my: 'Sunset Aurora', en: 'Sunset Aurora' },
    bg: ['#4C1D95', '#831843', '#B45309'],
    textColor: '#FFFBEB',
    accentColor: '#FBBF24',
    quoteColor: '#FDE68A'
  },
  {
    id: 'indigo',
    name: { my: 'Deep Ocean', en: 'Deep Ocean' },
    bg: ['#0B132B', '#1C2541', '#3A506B'],
    textColor: '#F0F9FF',
    accentColor: '#38BDF8',
    quoteColor: '#7DD3FC'
  },
  {
    id: 'emerald',
    name: { my: 'Emerald Zen', en: 'Emerald Zen' },
    bg: ['#064E3B', '#047857', '#065F46'],
    textColor: '#ECFDF5',
    accentColor: '#34D399',
    quoteColor: '#A7F3D0'
  },
  {
    id: 'minimal',
    name: { my: 'Classic Paper', en: 'Classic Paper' },
    bg: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
    textColor: '#0F172A',
    accentColor: '#6366F1',
    quoteColor: '#4338CA'
  }
];

export const StoryCardModal: React.FC<StoryCardModalProps> = ({
  isOpen,
  onClose,
  quote,
  preferences
}) => {
  const isMM = preferences.lang === 'my';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('midnight');
  const [aspectRatio, setAspectRatio] = useState<CardRatio>('story');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Redraw canvas whenever theme, ratio, or quote changes
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = THEMES.find(t => t.id === selectedTheme) || THEMES[0];

    // High resolution dimensions (2x scaling for crisp mobile rendering)
    const width = aspectRatio === 'story' ? 1080 : 1080;
    const height = aspectRatio === 'story' ? 1920 : 1080;

    canvas.width = width;
    canvas.height = height;

    // 1. Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, theme.bg[0]);
    gradient.addColorStop(0.5, theme.bg[1] || theme.bg[0]);
    gradient.addColorStop(1, theme.bg[2] || theme.bg[1] || theme.bg[0]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle aesthetic mesh circles
    ctx.save();
    ctx.globalAlpha = 0.15;
    const radG1 = ctx.createRadialGradient(width * 0.8, height * 0.15, 20, width * 0.8, height * 0.15, 400);
    radG1.addColorStop(0, theme.accentColor);
    radG1.addColorStop(1, 'transparent');
    ctx.fillStyle = radG1;
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.15, 400, 0, Math.PI * 2);
    ctx.fill();

    const radG2 = ctx.createRadialGradient(width * 0.2, height * 0.85, 20, width * 0.2, height * 0.85, 500);
    radG2.addColorStop(0, theme.quoteColor);
    radG2.addColorStop(1, 'transparent');
    ctx.fillStyle = radG2;
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.85, 500, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Inner border frame
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.3;
    const margin = 50;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    ctx.globalAlpha = 1.0;

    // 4. Header Badge / Category
    const topY = aspectRatio === 'story' ? 240 : 150;
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = theme.accentColor;
    ctx.textAlign = 'center';
    const catLabel = (quote.category || 'INSPIRATION').toUpperCase();
    ctx.fillText(`✦  ${catLabel}  ✦`, width / 2, topY);

    // 5. Giant Decorative Quotation Mark
    ctx.font = 'bold 180px Georgia, serif';
    ctx.fillStyle = theme.quoteColor;
    ctx.globalAlpha = 0.25;
    ctx.textAlign = 'center';
    const quoteMarkY = aspectRatio === 'story' ? 440 : 280;
    ctx.fillText('“', width / 2, quoteMarkY);
    ctx.globalAlpha = 1.0;

    // 6. Wrapped Quote Text
    const quoteFontSize = aspectRatio === 'story' ? 52 : 46;
    ctx.font = `600 ${quoteFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Pyidaungsu", sans-serif`;
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';

    const maxTextWidth = width - 220;
    const words = quote.quote.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + (currentLine ? ' ' : '') + words[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = words[n];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = quoteFontSize * 1.5;
    const totalTextHeight = lines.length * lineHeight;
    let startTextY = (height / 2) - (totalTextHeight / 2) + (aspectRatio === 'story' ? 20 : 0);

    lines.forEach((line) => {
      ctx.fillText(line, width / 2, startTextY);
      startTextY += lineHeight;
    });

    // 7. Divider line
    startTextY += 40;
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 60, startTextY);
    ctx.lineTo(width / 2 + 60, startTextY);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 8. Author
    startTextY += 50;
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = theme.accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(`— ${quote.author || 'Unknown'}`, width / 2, startTextY);

    // 9. OmniFlow Footer Branding
    const footerY = height - (aspectRatio === 'story' ? 140 : 90);
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.6;
    ctx.textAlign = 'center';
    ctx.fillText('OmniFlow • Daily Inspiration & Study Habit', width / 2, footerY);
    ctx.globalAlpha = 1.0;

  }, [isOpen, selectedTheme, aspectRatio, quote]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    audioAlert.triggerVibration('gentle');

    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        setIsExporting(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OmniFlow-Story-${quote.id || 'quote'}-${aspectRatio}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }, 'image/png');
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    audioAlert.triggerVibration('gentle');

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `OmniFlow-Quote-${quote.id}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'OmniFlow Daily Inspiration',
            text: `"${quote.quote}" — ${quote.author}`,
            files: [file]
          });
        } catch (e) {
          // User cancelled or error -> fallback to download
          handleDownload();
        }
      } else {
        handleDownload();
      }
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[95vh] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
                {isMM ? 'Story Card ပုံထုတ်ယူခြင်း' : 'Story Card Generator'}
              </h2>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {isMM ? 'Instagram, Facebook, Telegram သို့ တိုက်ရိုက်တင်နိုင်သော ဒီဇိုင်း' : 'Export high-res aesthetic image for social stories'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Controls & Canvas Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Aspect Ratio Toggle */}
            <div className="p-3 bg-[var(--color-bg-input)] rounded-2xl border border-[var(--color-border)] space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5" />
                <span>{isMM ? 'ပုံအရွယ်အစား' : 'Format Ratio'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('story')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aspectRatio === 'story'
                      ? 'bg-[var(--color-primary)] text-white shadow-xs'
                      : 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)]'
                  }`}
                >
                  9:16 Story / Status
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('square')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aspectRatio === 'square'
                      ? 'bg-[var(--color-primary)] text-white shadow-xs'
                      : 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)]'
                  }`}
                >
                  1:1 Post / Square
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="p-3 bg-[var(--color-bg-input)] rounded-2xl border border-[var(--color-border)] space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>{isMM ? 'အရောင်စတိုင်' : 'Color Preset'}</span>
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(theme.id);
                      audioAlert.triggerVibration('gentle');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 border ${
                      selectedTheme === theme.id
                        ? 'border-amber-500 bg-[var(--color-primary)]/15 text-[var(--color-text-primary)] shadow-xs'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                      style={{ background: `linear-gradient(135deg, ${theme.bg[0]}, ${theme.bg[1] || theme.bg[0]})` }}
                    />
                    <span>{isMM ? theme.name.my : theme.name.en}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Live Preview Container */}
          <div className="flex items-center justify-center p-4 bg-black/30 rounded-2xl border border-[var(--color-border)] overflow-hidden min-h-[300px]">
            <div className="relative shadow-2xl rounded-xl overflow-hidden border border-white/10 max-h-[50vh] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-h-[50vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-input)]/50 gap-2">
          <div className="text-[11px] text-[var(--color-text-muted)] hidden sm:block">
            {isMM ? '✨ HD အရည်အသွေးမြင့် PNG ဓာတ်ပုံအဖြစ် သိမ်းဆည်းပါမည်' : '✨ High-resolution crisp PNG export'}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)] text-xs font-bold text-[var(--color-text-primary)] cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-blue-500" />
              <span>{isMM ? 'Story သို့ Share မည်' : 'Share Story'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{isMM ? 'ဒေါင်းလုဒ်ပြီးပါပြီ!' : 'Downloaded!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isMM ? 'ပုံသိမ်းဆည်းမည် (Download)' : 'Download PNG'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
