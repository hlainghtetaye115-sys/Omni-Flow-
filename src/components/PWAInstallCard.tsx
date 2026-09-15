import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, Info, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallCardProps {
  isMM: boolean;
}

export const PWAInstallCard: React.FC<PWAInstallCardProps> = ({ isMM }) => {
  const { isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('physics_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [showGuide, setShowGuide] = useState(false);
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    // Check if running inside AI Studio preview iframe
    try {
      setInIframe(window.self !== window.top);
    } catch (e) {
      setInIframe(true);
    }
  }, []);

  if (dismissed || isInstalled) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('physics_pwa_dismissed', 'true'); } catch (e) {}
  };

  const handleInstallClick = async () => {
    if (inIframe) {
      // In iframe, direct prompt is blocked by browser security. Open in new tab or show guide!
      setShowGuide(true);
      return;
    }

    if (isIOS) {
      setShowGuide(true);
    } else {
      const installed = await promptInstall();
      if (!installed) {
        setShowGuide(true);
      } else {
        handleDismiss();
      }
    }
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 text-white p-4 sm:p-5 shadow-lg border border-emerald-400/30 my-3 transition-all">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-inner flex-shrink-0 mt-0.5">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
              <span>📱</span>
              <span>{isMM ? 'App ကို ဖုန်းထဲသို့ PWA Install ပြုလုပ်ပါ' : 'Install PWA App on Home Screen'}</span>
            </h3>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
              {isMM
                ? 'အင်တာနက်မရှိဘဲ အော့ဖ်လိုင်းအသုံးပြုနိုင်ခြင်း၊ Lock Screen သတိပေးချက်များနှင့် App ကဲ့သို့ ဖုန်း ပင်မစခရင်တွင် ထားရှိရန် Install လုပ်ပါ။'
                : 'Install as a native PWA for offline access, lock screen notifications, and quick home screen launch.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          title={isMM ? 'ပိတ်မည်' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-emerald-400/30 relative z-10">
        <div className="flex items-center gap-2">
          {inIframe && (
            <button
              onClick={handleOpenNewTab}
              className="flex items-center gap-1 bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-100 border border-cyan-300/40 px-2.5 py-1.5 rounded-xl font-medium text-[11px] transition-all cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{isMM ? 'New Tab တွင်ဖွင့်မည်' : 'Open in New Tab'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs text-emerald-100 underline hover:text-white px-1 py-1"
          >
            {isMM ? (showGuide ? 'လမ်းညွှန်ပိတ်မည်' : 'Install နည်းလမ်း') : (showGuide ? 'Hide Guide' : 'How to Install')}
          </button>

          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 bg-white text-emerald-900 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isMM ? 'Install လုပ်မည်' : 'Install Now'}</span>
          </button>
        </div>
      </div>

      {/* Installation Guide Banner / Modal */}
      {showGuide && (
        <div className="mt-3 p-3.5 bg-black/30 rounded-xl backdrop-blur-md text-xs space-y-2 border border-white/20 animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-amber-200">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-300" />
              <span>{isMM ? 'PWA App ဖုန်းထဲသို့ ထည့်သွင်းနည်း (Install Guide):' : 'PWA Installation Guide:'}</span>
            </span>
            <button onClick={() => setShowGuide(false)} className="text-white hover:underline text-[11px]">
              {isMM ? 'ပိတ်မည်' : 'Close'}
            </button>
          </div>

          {inIframe && (
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-100 text-[11px] leading-relaxed">
              ⚠️ <b>Preview iFrame အတွင်းဖြစ်သောကြောင့်:</b> PWA Install ပြုလုပ်ရန်နှင့် အသံစနစ်များ အပြည့်အဝ အသုံးပြုနိုင်ရန် အထက်ပါ <b>"New Tab တွင်ဖွင့်မည်"</b> ကိုနှိပ်၍ သီးသန့် Tab တွင် ဖွင့်ပါ!
            </div>
          )}

          <div className="space-y-1.5 text-emerald-50 leading-relaxed text-[11px]">
            <p className="font-semibold text-white">1. Android / Chrome တွင်:</p>
            <p className="pl-3">
              - Chrome ညာဘက်အပေါ်ထောင့်ရှိ <b>Three Dots (⋮) Menu</b> ကိုနှိပ်ပါ။<br />
              - <b>"Add to Home screen"</b> သို့မဟုတ် <b>"Install app"</b> ကို ရွေးချယ်ပါ။
            </p>

            <p className="font-semibold text-white mt-1">2. iOS / iPhone (Safari) တွင်:</p>
            <p className="pl-3">
              - Safari အောက်ခြေရှိ <Share className="w-3 h-3 inline mx-0.5" /> <b>Share button</b> ကိုနှိပ်ပါ။<br />
              - <b>"Add to Home Screen"</b> (ပင်မစခရင်သို့ ထည့်ရန်) ကိုနှိပ်ပါ။
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
