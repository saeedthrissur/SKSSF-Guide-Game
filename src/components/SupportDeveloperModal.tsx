import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, X } from 'lucide-react';
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

const GPayMark: React.FC<{ className?: string }> = ({ className = 'h-4 w-auto' }) => (
  <svg viewBox="0 0 64 24" className={className} aria-hidden="true">
    <path
      d="M19.8 12.2c0-.6-.1-1.2-.2-1.8H11v3.4h4.9c-.2 1.1-.9 2.1-1.8 2.7v2.2h3c1.7-1.6 2.7-3.9 2.7-6.5z"
      fill="#4285F4"
    />
    <path
      d="M11 21c2.5 0 4.6-.8 6.1-2.3l-3-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.2-3.8H2.7v2.3C4.2 19 7.4 21 11 21z"
      fill="#34A853"
    />
    <path
      d="M5.8 13.6c-.2-.6-.3-1.1-.3-1.6s.1-1.1.3-1.6V8.1H2.7C2.1 9.3 1.8 10.6 1.8 12s.3 2.7.9 3.9l3.1-2.3z"
      fill="#FBBC05"
    />
    <path
      d="M11 6.6c1.4 0 2.6.5 3.5 1.4l2.6-2.6C15.6 3.9 13.5 3 11 3 7.4 3 4.2 5 2.7 8.1l3.1 2.3C6.6 8.2 8.6 6.6 11 6.6z"
      fill="#EA4335"
    />
    <text
      x="24"
      y="16.5"
      fill="#3C4043"
      fontSize="13.5"
      fontWeight="700"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      Pay
    </text>
  </svg>
);

const UpiMark: React.FC<{ className?: string }> = ({ className = 'h-4 w-auto' }) => (
  <svg viewBox="0 0 58 22" className={className} aria-hidden="true">
    <text
      x="1"
      y="16.5"
      fill="#475569"
      fontSize="14"
      fontWeight="900"
      fontStyle="italic"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="0.5"
    >
      UPI
    </text>
    <polygon points="37,4 44,11 37,18 39.8,11" fill="#F97316" />
    <polygon points="44,4 51,11 44,18 46.8,11" fill="#16A34A" />
  </svg>
);

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
      window.setTimeout(() => setCopied(false), 2400);
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
          className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.94, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl p-5 space-y-4"
          >
            {/* Compact Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  aria-hidden="true"
                  className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg shrink-0"
                >
                  🎁
                </span>
                <h2
                  id="support-developer-heading"
                  className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug"
                >
                  ഈ ഗെയിം നിങ്ങൾക്ക് ഇഷ്ടമായോ?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.unlockAudio();
                  sound.playClick();
                  onClose();
                }}
                aria-label="അടയ്ക്കുക"
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ഇതിന്റെ നിർമ്മാതാവിനെ പ്രോത്സാഹിപ്പിക്കാൻ നിങ്ങളുടെ സ്നേഹോപഹാരം നൽകാവുന്നതാണ്.
            </p>

            {/* Compact UPI ID Row */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  UPI ID
                </span>
                <code className="notranslate select-all text-xs sm:text-sm font-bold text-slate-900 break-all">
                  {DEVELOPER_UPI_ID}
                </code>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  copied
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white hover:bg-emerald-50 text-emerald-900 border-slate-300'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>Copy UPI ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct GPay / UPI Action */}
            <div className="space-y-2">
              <a
                href={DEVELOPER_UPI_LINK}
                onClick={() => {
                  sound.unlockAudio();
                  sound.playClick();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>GPay / UPI വഴി അയക്കാം</span>
              </a>

              {/* Subtle Payment Logos Row */}
              <div className="flex items-center justify-center gap-3 pt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">
                  <GPayMark className="h-3.5 w-auto" />
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">
                  <UpiMark className="h-3.5 w-auto" />
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  PhonePe · Paytm
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
