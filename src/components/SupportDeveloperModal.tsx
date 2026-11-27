import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, ExternalLink, X } from 'lucide-react';
import { sound } from '../utils/sound';

const DEVELOPER_UPI_ID = 'Saeed.anchangadi@okicici';
const DEVELOPER_UPI_LINK =
  'upi://pay?pa=Saeed.anchangadi@okicici&pn=Developer&cu=INR';

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to execCommand inside restricted iframes
    }
  }
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
  return false;
}

export interface SupportDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportDeveloperModal: React.FC<SupportDeveloperModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyUpi = async () => {
    sound.unlockAudio();
    sound.playPop();
    const ok = await copyTextToClipboard(DEVELOPER_UPI_ID);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-developer-heading"
          className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-emerald-200 bg-white shadow-2xl overflow-hidden"
          >
            {/* Header Band */}
            <div className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 px-6 pt-6 pb-5 text-white border-b-4 border-amber-400">
              <button
                type="button"
                onClick={() => {
                  sound.unlockAudio();
                  sound.playClick();
                  onClose();
                }}
                aria-label="Close popup"
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-2xl mb-3 shadow-xs">
                🎁
              </div>
              <h2
                id="support-developer-heading"
                className="text-xl sm:text-2xl font-black leading-snug text-white pr-8"
              >
                ഈ ഗെയിം നിങ്ങൾക്ക് ഇഷ്ടമായോ?
              </h2>
              <p className="mt-2 text-sm text-emerald-50/95 leading-relaxed">
                ഇതിന്റെ നിർമ്മാതാവിനെ പ്രോത്സാഹിപ്പിക്കാൻ നിങ്ങളുടെ സ്നേഹോപഹാരം നൽകാവുന്നതാണ്.
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* UPI ID Box */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2.5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  UPI ID
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <code className="notranslate select-all text-sm sm:text-base font-bold text-slate-900 bg-white border border-emerald-200 rounded-xl px-3 py-2 break-all flex-1">
                    {DEVELOPER_UPI_ID}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer border ${
                      copied
                        ? 'bg-emerald-700 text-white border-emerald-800'
                        : 'bg-white hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 shrink-0" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 shrink-0" />
                        <span>Copy UPI ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct GPay / UPI Link */}
              <a
                href={DEVELOPER_UPI_LINK}
                onClick={() => {
                  sound.unlockAudio();
                  sound.playClick();
                }}
                className="w-full min-h-[50px] px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-black text-sm sm:text-base border-b-4 border-emerald-950 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>GPay / UPI വഴി അയക്കാം</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>

              <button
                type="button"
                onClick={() => {
                  sound.unlockAudio();
                  sound.playClick();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-extrabold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                അടയ്ക്കുക
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
