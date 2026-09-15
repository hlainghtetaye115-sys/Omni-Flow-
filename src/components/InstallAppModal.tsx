import React, { useState, useEffect } from 'react';
import {
  Download, Smartphone, Apple, Monitor, Sparkles, Check, Share2,
  ExternalLink, ShieldCheck, Zap, WifiOff, BellRing, Copy, ChevronRight, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MacWindowFrame } from './Modals';
import { Preferences } from '../types';
import logoImage from '../assets/images/omniflow_app_logo_1789482391460.jpg';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: Preferences;
  deferredPrompt: any;
  onInstallSuccess?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  preferences,
  deferredPrompt,
  onInstallSuccess
}) => {
  const isMM = preferences.lang === 'my';
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'pc' | 'apk'>('android');
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        if (onInstallSuccess) onInstallSuccess();
        onClose();
      }
    } else {
      // If native prompt not available, direct user to Android/iOS steps
      setActiveTab('android');
    }
  };

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <MacWindowFrame
      isOpen={isOpen}
      onClose={onClose}
      title={isMM ? 'ဖုန်းထဲတွင် Native App ကဲ့သို့ ထည့်သွင်းအသုံးပြုနည်း (Install App)' : 'Install as Standalone Mobile App'}
      maxWidthClass="max-w-2xl"
      icon={<Download className="w-4 h-4 text-emerald-500" />}
    >
      <div className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">
        {/* App Info Banner with Direct Install Button */}
        <div className="p-4 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-md flex-shrink-0 border-2 border-emerald-500/30">
              <img src={logoImage} alt="App Icon" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[var(--color-text-primary)]">
                  OmniFlow Schedule App
                </h3>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">PWA</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {isMM
                  ? 'Browser လိပ်စာတန်း မပါဘဲ ဖုန်းထဲတွင် App စစ်စစ်ကဲ့သို့ အသုံးပြုနိုင်ပါသည်'
                  : 'Install on Home Screen with 100% full screen & offline support.'}
              </p>
            </div>
          </div>

          {/* Direct Install Button if supported */}
          {deferredPrompt && !isInstalled ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNativeInstall}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer flex-shrink-0 transition-all"
            >
              <Download className="w-4 h-4 animate-bounce" />
              <span>{isMM ? 'ယခုချက်ချင်း ထည့်သွင်းမည်' : 'Install App Now'}</span>
            </motion.button>
          ) : isInstalled ? (
            <div className="w-full sm:w-auto px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 flex-shrink-0">
              <Check className="w-4 h-4" />
              <span>{isMM ? 'App အဖြစ် ထည့်သွင်းထားပြီးပါပြီ' : 'Already Installed as App'}</span>
            </div>
          ) : null}
        </div>

        {/* Benefits Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl text-center shadow-xs">
            <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-[var(--color-text-primary)]">{isMM ? 'မြန်ဆန်သော နှုန်း' : 'Fast & Smooth'}</div>
            <div className="text-[9px] text-[var(--color-text-muted)]">{isMM ? 'တစ်ချက်နှိပ် ဖွင့်နိုင်' : 'Instant Launch'}</div>
          </div>

          <div className="p-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl text-center shadow-xs">
            <WifiOff className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-[var(--color-text-primary)]">{isMM ? 'အင်တာနက် မလို' : 'Offline Ready'}</div>
            <div className="text-[9px] text-[var(--color-text-muted)]">{isMM ? 'အင်တာနက်မရှိလည်းရ' : 'Works without WiFi'}</div>
          </div>

          <div className="p-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl text-center shadow-xs">
            <BellRing className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-[var(--color-text-primary)]">{isMM ? 'အချိန်မှန် သတိပေး' : 'Alerts & Push'}</div>
            <div className="text-[9px] text-[var(--color-text-muted)]">{isMM ? 'အတန်းချိန် အသိပေး' : 'Class Reminders'}</div>
          </div>

          <div className="p-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl text-center shadow-xs">
            <Smartphone className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-[var(--color-text-primary)]">{isMM ? 'Full Screen' : 'Standalone'}</div>
            <div className="text-[9px] text-[var(--color-text-muted)]">{isMM ? 'Address Bar မပါ' : 'No Browser UI'}</div>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex bg-[var(--color-bg-input)] p-1 rounded-xl border border-[var(--color-border)] gap-1">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'android'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>

          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'pc'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC / Mac</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>APK File</span>
          </button>
        </div>

        {/* Tab Contents: Step-by-Step Installation Guides */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-sm">
          {activeTab === 'android' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>{isMM ? 'Android ဖုန်းတွင် App အဖြစ် ထည့်သွင်းနည်း (၃ ဆင့်)' : 'Install on Android Phone (Chrome Browser)'}</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-xs">1</div>
                  <div>
                    <div className="font-bold text-[var(--color-text-primary)]">
                      {isMM ? 'Chrome Browser ညာဘက်အပေါ်ရှိ အစက် ၃ စက် (⋮) ကို နှိပ်ပါ' : 'Tap the 3 vertical dots (⋮) menu in Chrome at top right'}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {isMM ? 'ဖုန်း Chrome browser ၏ Menu options များကို ဖွင့်ပါ' : 'Opens browser options'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-xs">2</div>
                  <div>
                    <div className="font-bold text-[var(--color-text-primary)]">
                      {isMM ? '"Install app" သို့မဟုတ် "Add to Home screen" ကို ရွေးချယ်ပါ' : 'Select "Install app" or "Add to Home screen"'}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {isMM ? '(မြန်မာလိုဖြစ်ပါက "ပင်မစာမျက်နှာသို့ ထည့်သွင်းမည်" ဟု ပေါ်ပါမည်)' : 'This registers the app directly into your Android OS.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-xs">3</div>
                  <div>
                    <div className="font-bold text-[var(--color-text-primary)]">
                      {isMM ? '"Install" ကို နှိပ်ပြီး ပြီးဆုံးပါပြီ' : 'Tap "Install" to complete'}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {isMM
                        ? 'ဖုန်း App စာရင်းနှင့် Home Screen ပေါ်တွင် OmniFlow icon ပေါ်လာမည်ဖြစ်ပြီး Play Store မှ ဒေါင်းလုဒ်လုပ်ထားသော App ကဲ့သို့ Full-Screen အသုံးပြုနိုင်ပါပြီ!'
                        : 'The OmniFlow icon will now be on your Home Screen and App Drawer like a native app!'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                <Apple className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                <span>{isMM ? 'iPhone / iPad (Safari) တွင် App အဖြစ် ထည့်သွင်းနည်း' : 'Install on iPhone / iPad (Safari Browser)'}</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-xs">1</div>
                  <div>
                    <div className="font-bold text-[var(--color-text-primary)]">
                      {isMM ? 'Safari Browser ၏ အောက်ခြေရှိ Share ခလုတ် (📤) ကို နှိပ်ပါ' : 'Tap the Share icon (📤) at the bottom bar of Safari'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-xs">2</div>
                  <div>
                    <div className="font-bold text-[var(--color-text-primary)]">
                      {isMM ? 'အောက်သို့ဆွဲချပြီး "Add to Home Screen (➕ ပင်မမျက်နှာပြင်သို့ ထည့်ရန်)" ကို ရွေးပါ' : 'Scroll down and tap "Add to Home Screen"'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-xs">3</div>
                  <div>
                    <div className="font-bold text-[var(--color-text-primary)]">
                      {isMM ? 'ညာဘက်အပေါ်ရှိ "Add" ကို နှိပ်ပါ' : 'Tap "Add" in the top right corner'}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {isMM ? 'iPhone မျက်နှာပြင်ပေါ်တွင် App Icon ရောက်ရှိသွားပါပြီ' : 'The app icon is now pinned to your iOS home screen!'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pc' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-500" />
                <span>{isMM ? 'Windows / Mac ကွန်ပျူတာတွင် Desktop App အဖြစ် သွင်းနည်း' : 'Install as Desktop App on PC / Mac'}</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-xs">1</div>
                  <div>
                    <div className="font-bold text-[var(--color-text-primary)]">
                      {isMM ? 'Chrome သို့မဟုတ် Edge Browser ၏ Address bar ညာဘက်ရှိ "Install" icon (🖥️ သို့ ⬇️) ကို နှိပ်ပါ' : 'Look at the address bar in Chrome or Edge and click the "Install" icon (🖥️)'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)]">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-xs">2</div>
                  <div>
                    <div className="font-bold text-[var(--color-text-primary)]">
                      {isMM ? '"Install" ကို နှိပ်ပါက သီးသန့် Desktop Window ဖြင့် ပွင့်လာပါမည်' : 'Click "Install" to open in a dedicated standalone desktop window'}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {isMM ? 'Desktop Shortcut အနေဖြင့်လည်း အလွယ်တကူ ဖွင့်သုံးနိုင်ပါသည်' : 'A desktop shortcut is created automatically.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>{isMM ? 'တကယ့် Android .APK ဖိုင်အဖြစ် ပြောင်းလဲထုတ်ယူနည်း (Real APK Builder)' : 'Build Standalone Android APK File'}</span>
              </h4>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                {isMM
                  ? 'အကယ်၍ ဖုန်းထဲသို့ .apk ဖိုင်တိုက်ရိုက်သွင်းချင်ပါက သို့မဟုတ် Google Play Store တင်လိုပါက အောက်ပါ အလွယ်ကူဆုံး နည်းလမ်း (၂) ခုဖြင့် ပြုလုပ်နိုင်ပါသည်:'
                  : 'To export a real installable .APK file or publish to Google Play Store, use one of the following methods:'}
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-[var(--color-bg-input)] rounded-xl border border-amber-500/30 space-y-2">
                  <div className="font-extrabold text-[var(--color-primary)] flex items-center justify-between">
                    <span>{isMM ? '🌟 နည်းလမ်း (၁) - PWABuilder (ကုဒ်ရေးရန်မလို၊ ၁ မိနစ်အတွင်း APK ရရှိနိုင်)' : 'Method 1: PWABuilder (Zero Code - 1 Minute APK)'}</span>
                    <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">အလွယ်ဆုံး</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[var(--color-text-secondary)]">
                    <li>{isMM ? 'PWABuilder ဝဘ်ဆိုက် (' : 'Visit '} <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-[var(--color-primary)] underline font-bold">pwabuilder.com</a> {isMM ? ') သို့ သွားပါ' : ''}</li>
                    <li>{isMM ? 'လက်ရှိ App ၏ URL လိပ်စာကို ထည့်ပါ' : 'Paste your deployed app URL'}</li>
                    <li>{isMM ? '"Package for Android" ကို နှိပ်ပါက အသင့်သုံး .apk နှင့် Play Store တင်ရန် .aab ဖိုင်ကို ချက်ချင်း Download ရရှိပါမည်!' : 'Click "Package for Android" and download your signed .apk & .aab!'}</li>
                  </ol>
                </div>

                <div className="p-3.5 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)] space-y-2">
                  <div className="font-extrabold text-[var(--color-text-primary)]">
                    {isMM ? '💻 နည်းလမ်း (၂) - Capacitor ဖြင့် Android Studio တွင် Build လုပ်ခြင်း' : 'Method 2: Capacitor with Android Studio'}
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
                    npm install @capacitor/core @capacitor/cli @capacitor/android<br/>
                    npx cap init OmniFlow com.omniflow.app<br/>
                    npm run build && npx cap add android && npx cap open android
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Copy App Link Action */}
        <div className="flex items-center justify-between p-3 bg-[var(--color-bg-input)] rounded-xl border border-[var(--color-border)] text-xs">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)] truncate mr-2">
            <Share2 className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-primary)]" />
            <span className="truncate">{window.location.href}</span>
          </div>

          <button
            onClick={handleCopyAppUrl}
            className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer flex-shrink-0 hover:opacity-90 transition-all shadow-xs"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? (isMM ? 'ကူးပြီးပြီ' : 'Copied') : (isMM ? 'Link ကူးမည်' : 'Copy Link')}</span>
          </button>
        </div>
      </div>
    </MacWindowFrame>
  );
};
