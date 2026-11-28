import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';
import { sound } from '../utils/sound';

const DEVELOPER_UPI_ID = 'Saeed.anchangadi@okicici';
const DEFAULT_UPI_NOTE = 'SKSSF Guide Game Hadiya';

function detectIsAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  const uaPlatform = (
    navigator as Navigator & { userAgentData?: { platform?: string } }
  ).userAgentData?.platform;
  if (uaPlatform && /android/i.test(uaPlatform)) return true;
  return /Android/i.test(navigator.userAgent || '');
}

function buildUpiAppLinks(note: string) {
  const cleanNote = note.trim() || DEFAULT_UPI_NOTE;
  const upiQuery = `pa=${DEVELOPER_UPI_ID}&pn=Developer&cu=INR&tn=${encodeURIComponent(cleanNote)}`;
  const genericUpiLink = `upi://pay?${upiQuery}`;
  const isAndroid = detectIsAndroid();

  if (isAndroid) {
    return {
      gpay: `intent://pay?${upiQuery}#Intent;scheme=upi;action=android.intent.action.VIEW;package=com.google.android.apps.nbu.paisa.user;end;`,
      phonepe: `intent://pay?${upiQuery}#Intent;scheme=upi;action=android.intent.action.VIEW;package=com.phonepe.app;end;`,
      paytm: `intent://pay?${upiQuery}#Intent;scheme=upi;action=android.intent.action.VIEW;package=net.one97.paytm;end;`,
      other: genericUpiLink,
      qrPayload: genericUpiLink,
    };
  }

  return {
    gpay: `gpay://upi/pay?${upiQuery}`,
    phonepe: `phonepe://pay?${upiQuery}`,
    paytm: `paytmmp://pay?${upiQuery}`,
    other: genericUpiLink,
    qrPayload: genericUpiLink,
  };
}

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

const GPayMark: React.FC<{ className?: string; light?: boolean }> = ({
  className = 'h-4 w-auto',
  light = false,
}) => (
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
      fill={light ? '#FFFFFF' : '#3C4043'}
      fontSize="13.5"
      fontWeight="700"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      Pay
    </text>
  </svg>
);

const PhonePeMark: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#5F259F" />
    <text
      x="12"
      y="16.2"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="13"
      fontWeight="800"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      Pe
    </text>
  </svg>
);

const PaytmMark: React.FC<{ className?: string }> = ({ className = 'h-3.5 w-auto' }) => (
  <svg viewBox="0 0 60 20" className={className} aria-hidden="true">
    <text
      x="1"
      y="15"
      fill="#002970"
      fontSize="13"
      fontWeight="800"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      Pay
    </text>
    <text
      x="26"
      y="15"
      fill="#00BAF2"
      fontSize="13"
      fontWeight="800"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      tm
    </text>
  </svg>
);

const UpiMark: React.FC<{ className?: string }> = ({ className = 'h-3.5 w-auto' }) => (
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
  const [paymentNote, setPaymentNote] = useState(DEFAULT_UPI_NOTE);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const upiLinks = useMemo(() => buildUpiAppLinks(paymentNote), [paymentNote]);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setShowQr(false);
      setPaymentNote(DEFAULT_UPI_NOTE);
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

  useEffect(() => {
    if (!isOpen || !showQr) return;
    let cancelled = false;
    void QRCode.toDataURL(upiLinks.qrPayload, {
      width: 200,
      margin: 1,
      color: { dark: '#064E3B', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, showQr, upiLinks.qrPayload]);

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
          className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
        >
          <motion.div
            initial={{ scale: 0.94, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto overscroll-contain my-auto rounded-2xl border border-slate-200 bg-white shadow-2xl p-5 space-y-3.5"
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
                className="min-w-[40px] min-h-[40px] rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
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

            {/* Compact Pre-filled Receipt Note (passed as UPI tn= parameter) */}
            <div className="space-y-1">
              <label
                htmlFor="hadiya-upi-note"
                className="block text-[11px] font-bold text-slate-600"
              >
                നോട്ട് (GPay / UPI രസീതിൽ കാണാൻ)
              </label>
              <input
                id="hadiya-upi-note"
                type="text"
                maxLength={50}
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder={DEFAULT_UPI_NOTE}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>

            {/* Direct App-Specific Payment Buttons (Google Pay First, PhonePe & Paytm Next, Generic UPI Last) */}
            <div className="space-y-2">
              <a
                href={upiLinks.gpay}
                target="_top"
                onClick={() => {
                  sound.unlockAudio();
                  sound.playClick();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="bg-white rounded-md px-1.5 py-0.5 inline-flex items-center">
                  <GPayMark className="h-3.5 w-auto" />
                </span>
                <span>GPay വഴി അയക്കാം</span>
              </a>

              <div className="grid grid-cols-3 gap-1.5">
                <a
                  href={upiLinks.phonepe}
                  target="_top"
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                  }}
                  className="py-2 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhonePeMark className="h-4 w-4 shrink-0" />
                  <span>PhonePe</span>
                </a>
                <a
                  href={upiLinks.paytm}
                  target="_top"
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                  }}
                  className="py-2 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Paytm വഴി അയക്കാം"
                >
                  <PaytmMark className="h-3.5 w-auto" />
                </a>
                <a
                  href={upiLinks.other}
                  target="_top"
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                  }}
                  className="py-2 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <UpiMark className="h-3 w-auto shrink-0" />
                  <span>മറ്റുള്ളവ</span>
                </a>
              </div>

              {/* Optional Scannable QR Toggle */}
              <div className="pt-0.5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                    setShowQr((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showQr ? 'QR കോഡ് മറയ്ക്കുക' : 'QR കോഡ് സ്കാൻ ചെയ്യാൻ കാണിക്കുക'}</span>
                </button>
              </div>

              {showQr && qrDataUrl && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 flex flex-col items-center gap-1.5">
                  <img
                    src={qrDataUrl}
                    alt="UPI QR കോഡ്"
                    className="w-36 h-36 rounded-lg bg-white p-1.5 border border-emerald-200"
                  />
                  <p className="text-[11px] font-semibold text-slate-600 text-center">
                    GPay / PhonePe / Paytm ഉപയോഗിച്ച് സ്കാൻ ചെയ്യാം
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
