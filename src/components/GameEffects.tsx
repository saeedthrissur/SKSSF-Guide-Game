import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Flame,
  Gift,
  Info,
  Languages,
  Lock,
  Moon,
  MousePointerClick,
  Music,
  Play,
  RotateCcw,
  Settings,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trash2,
  Trophy,
  Type,
  Unlock,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { narrator, NarratorState } from '../utils/narrator';
import {
  BackgroundMode,
  QURAN_TRACKS,
  sound,
  SOUND_PACKS,
  SoundPreset,
  SoundStateSnapshot,
} from '../utils/sound';
import {
  displayPrefs,
  DisplayPrefsSnapshot,
  FONT_LEVEL_META,
  TRANSLATE_LANGUAGES,
} from '../utils/displayPrefs';
import {
  DAILY_MISSIONS,
  DailyAndProfileState,
  exportProgressBackupCode,
  importProgressBackupCode,
  loadDailyAndProfileState,
  RunHistoryEntry,
  UnitProfile,
} from '../utils/gameStorage';
import { getAppShareUrl, getWhatsAppShareHref } from '../utils/shareLink';
import { OfficialSamasthaFlagImg, OfficialSkssfFlagImg } from './SvgArtwork';
import { useLessonFlow } from '../utils/lessonFlowContext';
import { scrollDirectToQuiz } from './LessonCheckQuiz';
import { LessonAnimatedBanner } from './LessonAnimatedBanner';
import { GuideGameBrandLogo } from './GameLivesHud';

interface GlitterBurstProps {
  triggerKey: number;
  label?: string;
}

const SPARKLE_PARTICLES = [
  { id: 1, x: '12%', delay: 0, icon: '✨', color: 'text-amber-400' },
  { id: 2, x: '24%', delay: 0.06, icon: '🌟', color: 'text-yellow-400' },
  { id: 3, x: '36%', delay: 0.02, icon: '✦', color: 'text-emerald-400' },
  { id: 4, x: '48%', delay: 0.08, icon: '⭐', color: 'text-amber-300' },
  { id: 5, x: '60%', delay: 0.03, icon: '🪙', color: 'text-yellow-500' },
  { id: 6, x: '72%', delay: 0.07, icon: '✨', color: 'text-sky-400' },
  { id: 7, x: '84%', delay: 0.04, icon: '🎉', color: 'text-amber-400' },
  { id: 8, x: '91%', delay: 0.09, icon: '✦', color: 'text-emerald-300' },
];

export const GlitterBurstOverlay: React.FC<GlitterBurstProps> = ({
  triggerKey,
  label,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (triggerKey <= 0) return;
    setVisible(true);
    sound.playGlitter();
    const timer = window.setTimeout(() => setVisible(false), 1250);
    return () => window.clearTimeout(timer);
  }, [triggerKey]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={triggerKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
        >
          {SPARKLE_PARTICLES.map((p) => (
            <span
              key={p.id}
              style={{ left: p.x, animationDelay: `${p.delay}s` }}
              className={`absolute top-2 text-xl sm:text-2xl animate-glitter-drop ${p.color}`}
            >
              {p.icon}
            </span>
          ))}
          {label && (
            <motion.div
              initial={{ scale: 0.75, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 max-w-[92%] px-3.5 py-1.5 rounded-xl border-2 border-amber-200 bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg text-center break-words"
            >
              {label}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const FloatingSparkleField: React.FC = () => {
  const stars = [
    { top: '12%', left: '8%', delay: '0s' },
    { top: '20%', left: '88%', delay: '0.7s' },
    { top: '60%', left: '12%', delay: '1.3s' },
    { top: '70%', left: '92%', delay: '0.4s' },
    { top: '38%', left: '50%', delay: '1.1s' },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {stars.map((s, idx) => (
        <span
          key={idx}
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          className="absolute text-amber-300 text-sm sm:text-base animate-twinkle drop-shadow"
        >
          ✦
        </span>
      ))}
    </div>
  );
};

/* Always-On Drifting Clouds + Sun */
export const DriftingCloudsAndSun: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div className={`pointer-events-none absolute inset-x-0 top-2 z-10 overflow-hidden ${className}`}>
    <div className="flex items-start justify-between px-4 sm:px-8">
      <svg viewBox="0 0 110 48" className="w-20 sm:w-28 h-10 animate-drift-cloud opacity-85" aria-hidden="true">
        <path
          d="M20,38 Q12,38 12,30 Q12,22 22,22 Q26,10 40,10 Q52,10 58,20 Q68,18 74,26 Q82,26 82,34 Q82,38 72,38 Z"
          fill="#FFFFFF"
        />
      </svg>
      <svg viewBox="0 0 60 60" className="w-10 sm:w-12 h-10 sm:h-12 animate-twinkle" aria-hidden="true">
        <circle cx="30" cy="30" r="14" fill="#FDE047" />
        <circle cx="30" cy="30" r="20" fill="#FACC15" opacity="0.35" />
      </svg>
      <svg
        viewBox="0 0 110 48"
        style={{ animationDelay: '-3.5s' }}
        className="w-20 sm:w-28 h-10 animate-drift-cloud opacity-80"
        aria-hidden="true"
      >
        <path
          d="M20,38 Q12,38 12,30 Q12,22 22,22 Q26,10 40,10 Q52,10 58,20 Q68,18 74,26 Q82,26 82,34 Q82,38 72,38 Z"
          fill="#F8FAFC"
        />
      </svg>
    </div>
  </div>
);

/* Always-On Swaying Trees & Flowers Garden Accent */
export const SwayingGardenPlants: React.FC<{
  side?: 'left' | 'right' | 'both';
  className?: string;
}> = ({ side = 'both', className = '' }) => (
  <div
    className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-2 sm:px-4 ${className}`}
    aria-hidden="true"
  >
    {(side === 'left' || side === 'both') && (
      <svg viewBox="0 0 90 95" className="w-16 sm:w-20 h-16 sm:h-20 drop-shadow-md">
        <g className="animate-sway-plant">
          <path d="M24,92 Q28,55 34,26" stroke="#78350F" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M34,26 Q10,18 6,34 Q22,32 34,26 Z" fill="#16A34A" />
          <path d="M34,26 Q24,6 44,6 Q42,20 34,26 Z" fill="#22C55E" />
          <path d="M34,26 Q58,14 64,30 Q46,32 34,26 Z" fill="#15803D" />
          <path d="M34,26 Q56,36 52,50 Q42,38 34,26 Z" fill="#16A34A" />
        </g>
        <g className="animate-sway-plant-slow">
          <path d="M58,92 Q56,74 52,62" stroke="#15803D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="52" cy="59" r="5" fill="#FACC15" />
          <circle cx="52" cy="59" r="2" fill="#B45309" />
          <path d="M68,92 Q72,76 76,66" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="76" cy="64" r="4" fill="#FB7185" />
        </g>
      </svg>
    )}
    {side === 'right' && <span />}
    {(side === 'right' || side === 'both') && (
      <svg viewBox="0 0 90 95" className="w-16 sm:w-20 h-16 sm:h-20 drop-shadow-md">
        <g className="animate-sway-plant-slow">
          <path d="M66,92 Q62,55 56,26" stroke="#78350F" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M56,26 Q80,18 84,34 Q68,32 56,26 Z" fill="#16A34A" />
          <path d="M56,26 Q66,6 46,6 Q48,20 56,26 Z" fill="#22C55E" />
          <path d="M56,26 Q32,14 26,30 Q44,32 56,26 Z" fill="#15803D" />
          <path d="M56,26 Q34,36 38,50 Q48,38 56,26 Z" fill="#16A34A" />
        </g>
        <g className="animate-sway-plant">
          <path d="M30,92 Q32,74 36,62" stroke="#15803D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="59" r="5" fill="#FDE047" />
          <path d="M18,92 Q14,76 12,66" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="64" r="4" fill="#38BDF8" />
        </g>
      </svg>
    )}
  </div>
);

/* Always-On Fluttering Official Flag on Golden Pole */
export const FlutteringFlagPole: React.FC<{
  variant: 'skju' | 'skssf';
  className?: string;
}> = ({ variant, className = '' }) => (
  <div className={`pointer-events-none flex items-end gap-0.5 ${className}`} aria-hidden="true">
    <div className="flex flex-col items-center">
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-700 shadow" />
      <div className="w-1.5 h-16 sm:h-20 bg-gradient-to-b from-amber-500 to-amber-800 rounded-b" />
    </div>
    <div className="self-start mt-1 -ml-0.5 flag-wave shadow-md rounded-lg overflow-hidden border border-emerald-200 bg-white p-0.5">
      {variant === 'skju' ? (
        <OfficialSamasthaFlagImg className="w-14 h-10 sm:w-16 sm:h-12 object-contain" />
      ) : (
        <OfficialSkssfFlagImg className="w-14 h-10 sm:w-16 sm:h-12 object-contain" />
      )}
    </div>
  </div>
);

export const AnimatedDhowBoat: React.FC<{ className?: string }> = ({
  className = 'w-20 h-16',
}) => (
  <svg
    viewBox="0 0 120 90"
    className={`${className} animate-float-bob`}
    aria-hidden="true"
  >
    <circle cx="96" cy="48" r="5" fill="#FDE047" opacity="0.85" />
    <path d="M56 12 L24 52 L56 52 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
    <path d="M62 18 L92 52 L62 52 Z" fill="#10B981" stroke="#064E3B" strokeWidth="2" />
    <path d="M58 6 L74 10 L58 14 Z" fill="#8C1D40" />
    <line x1="58" y1="6" x2="58" y2="58" stroke="#78350F" strokeWidth="3.5" />
    <path
      d="M14 54 L106 54 L92 72 C70 76 42 76 26 72 Z"
      fill="#92400E"
      stroke="#451A03"
      strokeWidth="2.5"
    />
    <path
      d="M6 76 Q25 68 45 76 T85 76 T116 74"
      fill="none"
      stroke="#E0F2FE"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

/* Unobstructed Animated Ocean Wave Lane with Gliding Boat */
export const AnimatedOceanLane: React.FC<{ boatLeft: string }> = ({ boatLeft }) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-28 z-10 overflow-hidden">
    <div className="absolute inset-x-0 bottom-0 h-14 sm:h-16 bg-gradient-to-t from-sky-900/90 via-sky-700/65 to-transparent" />
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      className="absolute bottom-1 left-0 w-[115%] -ml-[7%] h-7 animate-wave-glide opacity-80"
      aria-hidden="true"
    >
      <path
        d="M0,20 Q25,8 50,20 T100,20 T150,20 T200,20 T250,20 T300,20 T350,20 T400,20"
        fill="none"
        stroke="#BAE6FD"
        strokeWidth="3"
      />
    </svg>
    <div
      style={{ left: boatLeft }}
      className="absolute bottom-3 -translate-x-1/2 z-20 transition-all duration-700"
    >
      <AnimatedDhowBoat className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-xl" />
    </div>
  </div>
);

export const AnimatedVisionTowerEmblem: React.FC<{ className?: string }> = ({
  className = 'w-16 h-20',
}) => (
  <svg
    viewBox="0 0 90 110"
    className={`${className} animate-float-bob`}
    aria-hidden="true"
  >
    {/* Subtle glowing halo behind beacon */}
    <circle cx="45" cy="24" r="16" fill="#FDE68A" fillOpacity="0.22" />
    {/* Golden 8-pointed Islamic geometric star beacon */}
    <polygon
      points="45,10 49,19 58,19 51,25 54,34 45,29 36,34 39,25 32,19 41,19"
      fill="#FBBF24"
      stroke="#92400E"
      strokeWidth="1.5"
    />
    {/* Watchtower cupola & spire */}
    <path
      d="M32 46 Q45 30 58 46 Z"
      fill="#10B981"
      stroke="#065F46"
      strokeWidth="2"
    />
    {/* Tower shaft with arched window */}
    <rect
      x="34"
      y="46"
      width="22"
      height="46"
      rx="3"
      fill="#F8FAFC"
      stroke="#065F46"
      strokeWidth="2"
    />
    <path
      d="M40 70 L40 60 Q45 53 50 60 L50 70 Z"
      fill="#065F46"
    />
    <line x1="34" y1="78" x2="56" y2="78" stroke="#D97706" strokeWidth="2.5" />
    {/* Stepped base representing 7 organizational tiers */}
    <rect x="26" y="92" width="38" height="7" rx="2" fill="#047857" />
    <rect x="20" y="99" width="50" height="6" rx="2" fill="#064E3B" />
    {/* Ascending golden ladder beside tower */}
    <line x1="68" y1="98" x2="75" y2="40" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="78" y1="98" x2="85" y2="40" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="69" y1="86" x2="80" y2="86" stroke="#FBBF24" strokeWidth="2" />
    <line x1="71" y1="72" x2="82" y2="72" stroke="#FBBF24" strokeWidth="2" />
    <line x1="73" y1="58" x2="84" y2="58" stroke="#FBBF24" strokeWidth="2" />
  </svg>
);

export const AnimatedGiraffeMascot = AnimatedVisionTowerEmblem;

/* Dedicated Interactive Audio, Volume Verification & Share/Embed Settings Modal */
export const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  xp?: number;
  onResetProgress?: () => void;
  onClearAllData?: () => Promise<void> | void;
  onRestoreBackup?: () => void;
}> = ({ isOpen, onClose, xp = 0, onResetProgress, onClearAllData, onRestoreBackup }) => {
  const [snd, setSnd] = useState<SoundStateSnapshot>(sound.getSnapshot());
  const [nav, setNav] = useState<NarratorState>(narrator.getState());
  const [disp, setDisp] = useState<DisplayPrefsSnapshot>(displayPrefs.getSnapshot());
  const [copiedMode, setCopiedMode] = useState<'link' | 'embed' | 'backup' | null>(null);
  const [confirmAction, setConfirmAction] = useState<'reset' | 'clear_all' | null>(null);
  const [actionDoneMsg, setActionDoneMsg] = useState<string | null>(null);
  const [backupName, setBackupName] = useState('');
  const [lockedOwnerName, setLockedOwnerName] = useState('');
  const [exportPin, setExportPin] = useState('');
  const [backupInput, setBackupInput] = useState('');
  const [restorePin, setRestorePin] = useState('');
  const [backupFeedback, setBackupFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const u1 = sound.subscribe(setSnd);
    const u2 = narrator.subscribe(setNav);
    const u3 = displayPrefs.subscribe(setDisp);
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const daily = loadDailyAndProfileState();
    const locked = daily.profile.lockedCertificateName?.trim() || '';
    setLockedOwnerName(locked);
    setBackupName((prev) => locked || prev || daily.profile.playerName || '');
  }, [isOpen]);

  if (!isOpen) return null;

  const shareUrl =
    typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const embedCode = `<iframe src="${shareUrl}" title="SKSSF ഗൈഡ് ഗെയിം" width="100%" height="780" style="border:0;border-radius:16px;overflow:hidden;" allow="autoplay; clipboard-write" allowfullscreen></iframe>`;

  const copyText = async (text: string, mode: 'link' | 'embed' | 'backup') => {
    sound.unlockAudio();
    sound.playPop();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedMode(mode);
    window.setTimeout(() => setCopiedMode(null), 2200);
  };

  const bgModes: { id: BackgroundMode; label: string }[] = [
    { id: 'off', label: '🔇 നിശബ്ദം (OFF)' },
    { id: 'birds', label: '🌅 പ്രഭാത പ്രകൃതി' },
    { id: 'ocean', label: '🌊 ശാന്തമായ കടൽ' },
  ];

  const adjustPct = (
    key: 'narratorPct' | 'ambiencePct' | 'spiritualPct' | 'sfxPct',
    current: number,
    delta: number
  ) => {
    sound.unlockAudio();
    const next = Math.max(0, Math.min(100, current + delta));
    sound.setBalance({ [key]: next });
  };

  const fontMeta = FONT_LEVEL_META[disp.fontLevel];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight break-words">
                ⚙️ സെറ്റിംഗ്സ് · ഡിസ്പ്ലേ, ഭാഷ &amp; ശബ്ദം
              </h2>
              <p className="text-xs text-slate-600 leading-snug">
                ഡാർക്ക് മോഡ്, അക്ഷരവലുപ്പം (5 ലെവൽ), ഭാഷ, ശബ്ദം എന്നിവ ഇവിടെ ക്രമീകരിക്കാം
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="അടയ്ക്കുക"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display, 5-Level Font Size (+ / -) & Language (Google Translate) */}
        <div className="space-y-3 rounded-2xl bg-slate-50 border border-slate-200 p-3.5 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Dark Mode Toggle */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2.5">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  {disp.darkMode ? (
                    <Moon className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span className="truncate">ഡാർക്ക് മോഡ്</span>
                </p>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {disp.darkMode ? 'രാത്രി വായനയ്ക്ക് സുഖകരം' : 'ലൈറ്റ് തീം സജീവമാണ്'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.unlockAudio();
                  sound.playClick();
                  displayPrefs.toggleDarkMode();
                }}
                aria-pressed={disp.darkMode}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 cursor-pointer transition-colors ${
                  disp.darkMode
                    ? 'bg-amber-400 text-slate-950 border border-amber-500'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {disp.darkMode ? '🌙 ON' : '☀️ OFF'}
              </button>
            </div>

            {/* 5-Level Font Size (- / +) */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5 min-w-0">
                  <Type className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="truncate">അക്ഷരവലുപ്പം</span>
                </p>
                <span className="text-[11px] font-extrabold text-emerald-700 tabular-nums shrink-0">
                  {fontMeta.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={disp.fontLevel <= 1}
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                    displayPrefs.stepFontLevel(-1);
                  }}
                  aria-label="അക്ഷരവലുപ്പം കുറയ്ക്കുക"
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-black text-base text-slate-900 flex items-center justify-center shrink-0 cursor-pointer notranslate"
                >
                  A−
                </button>
                <div className="flex-1 flex items-center gap-1" aria-label="അക്ഷരവലുപ്പം ലെവൽ">
                  {([1, 2, 3, 4, 5] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        sound.unlockAudio();
                        sound.playClick();
                        displayPrefs.setFontLevel(lvl);
                      }}
                      aria-label={`ലെവൽ ${lvl}`}
                      className={`flex-1 h-2.5 rounded-full transition-colors cursor-pointer ${
                        lvl <= disp.fontLevel ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  disabled={disp.fontLevel >= 5}
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                    displayPrefs.stepFontLevel(1);
                  }}
                  aria-label="അക്ഷരവലുപ്പം കൂട്ടുക"
                  className="w-9 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed font-black text-base text-white flex items-center justify-center shrink-0 cursor-pointer notranslate"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Language Change (Google Translate) */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-900">
                <Languages className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>ഭാഷ മാറ്റാം (Google Translate)</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                ഇഷ്ട ഭാഷയിൽ വായിക്കാം
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 notranslate">
              {TRANSLATE_LANGUAGES.map((lang) => {
                const active = disp.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      sound.unlockAudio();
                      sound.playClick();
                      displayPrefs.setLanguage(lang.code);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    {lang.nativeLabel}
                  </button>
                );
              })}
            </div>
            {disp.language !== 'ml' && (
              <p className="text-[11px] font-semibold text-emerald-800 leading-snug">
                Google Translate വഴി പേജ് വിവർത്തനം ചെയ്യുന്നു. പഴയ മലയാളത്തിലേക്ക് മടങ്ങാൻ ‘മലയാളം (Original)’ തൊടുക.
              </p>
            )}
          </div>
        </div>

        {/* Master Audio & Auto Voice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-extrabold text-slate-900">🔊 ആകെ ശബ്ദം (Master)</p>
              <p className="text-[11px] text-slate-600">എല്ലാ ശബ്ദങ്ങളും ഒരുമിച്ച് ഓൺ / മ്യൂട്ട്</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextMuted = !snd.muted;
                sound.setMuted(nextMuted);
                if (nextMuted) narrator.stop();
                else sound.playClick();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold ${
                snd.muted
                  ? 'bg-red-100 text-red-900 border border-red-300'
                  : 'bg-emerald-700 text-white'
              }`}
            >
              {snd.muted ? '🔇 മ്യൂട്ട്' : '🔊 ON'}
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-extrabold text-slate-900">🎙️ ഓട്ടോ കഥാകാരൻ</p>
              <p className="text-[11px] text-slate-600">ഓരോ പാഠത്തിലും തനിയെ വായിക്കാൻ</p>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                const next = !nav.enabled;
                sound.setAutoNarrate(next);
                if (next) narrator.replayLast();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold ${
                nav.enabled
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {nav.enabled ? '✅ ON' : '⏸️ OFF'}
            </button>
          </div>
        </div>

        {/* Live Volume Sliders with - / + Steppers & Live Test Buttons */}
        <div className="space-y-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Narrator Volume */}
            <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-slate-900">
                <span>🎙️ കഥാകാരൻ</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-800 tabular-nums">
                    {snd.narratorPct === 0 ? '0% (നിശബ്ദം)' : `${snd.narratorPct}%`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.unlockAudio();
                      narrator.replayLast();
                    }}
                    className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-extrabold"
                  >
                    🔊 ടെസ്റ്റ്
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustPct('narratorPct', snd.narratorPct, -10)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-extrabold text-slate-800 shrink-0"
                  aria-label="കുറയ്ക്കുക"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={snd.narratorPct}
                  onChange={(e) => sound.setBalance({ narratorPct: Number(e.target.value) })}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => adjustPct('narratorPct', snd.narratorPct, 10)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-extrabold text-slate-800 shrink-0"
                  aria-label="കൂട്ടുക"
                >
                  +
                </button>
              </div>
            </div>

            {/* Background Ambience Volume */}
            <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-slate-900">
                <span>🌿 പശ്ചാത്തല ശബ്ദം</span>
                <span className="text-emerald-800 tabular-nums">
                  {snd.ambiencePct === 0 ? '0% (നിശബ്ദം)' : `${snd.ambiencePct}%`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustPct('ambiencePct', snd.ambiencePct, -10)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-extrabold text-slate-800 shrink-0"
                  aria-label="കുറയ്ക്കുക"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={snd.ambiencePct}
                  onChange={(e) => sound.setBalance({ ambiencePct: Number(e.target.value) })}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => adjustPct('ambiencePct', snd.ambiencePct, 10)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-extrabold text-slate-800 shrink-0"
                  aria-label="കൂട്ടുക"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quran & Adhan Volume */}
            <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-slate-900">
                <span>📖 ഖുർആൻ &amp; 🕌 ബാങ്ക്</span>
                <span className="text-amber-700 tabular-nums">
                  {snd.spiritualPct === 0 ? '0% (നിശബ്ദം)' : `${snd.spiritualPct}%`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustPct('spiritualPct', snd.spiritualPct, -10)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-extrabold text-slate-800 shrink-0"
                  aria-label="കുറയ്ക്കുക"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={snd.spiritualPct}
                  onChange={(e) => sound.setBalance({ spiritualPct: Number(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => adjustPct('spiritualPct', snd.spiritualPct, 10)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-extrabold text-slate-800 shrink-0"
                  aria-label="കൂട്ടുക"
                >
                  +
                </button>
              </div>
            </div>

            {/* Game SFX Volume */}
            <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-slate-900">
                <span>✨ ഗെയിം SFX</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => sound.setBalance({ sfxEnabled: !snd.sfxEnabled })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                      snd.sfxEnabled && snd.sfxPct > 0
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {snd.sfxEnabled && snd.sfxPct > 0 ? `${snd.sfxPct}% ON` : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.unlockAudio();
                      sound.playSuccess(2);
                    }}
                    className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-extrabold"
                  >
                    🔊 ടെസ്റ്റ്
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustPct('sfxPct', snd.sfxPct, -10)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-extrabold text-slate-800 shrink-0"
                  aria-label="കുറയ്ക്കുക"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={snd.sfxPct}
                  onChange={(e) => sound.setBalance({ sfxPct: Number(e.target.value) })}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => adjustPct('sfxPct', snd.sfxPct, 10)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-extrabold text-slate-800 shrink-0"
                  aria-label="കൂട്ടുക"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* XP-Unlocked Synthesized Web Audio Sound Packs (0 KB extra assets) */}
          <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-900">
                🎵 ഗെയിം ടോൺ പാക്കുകൾ (XP അൺലോക്ക്)
              </span>
              <span className="text-[10px] font-bold text-emerald-800 tabular-nums notranslate">
                നിങ്ങളുടെ XP: {xp}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SOUND_PACKS.map((pack) => {
                const unlocked = xp >= pack.minXp;
                const active = snd.soundPack === pack.id;
                return (
                  <button
                    key={pack.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      if (!unlocked) return;
                      sound.unlockAudio();
                      sound.setSoundPack(pack.id);
                      sound.playSuccess(2);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      active
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs cursor-pointer'
                        : unlocked
                        ? 'bg-slate-50 hover:bg-emerald-50 text-slate-900 border-slate-200 hover:border-emerald-400 cursor-pointer'
                        : 'bg-slate-50 text-slate-400 border-slate-200 opacity-75 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold leading-tight">{pack.label}</span>
                      {!unlocked && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md shrink-0 notranslate">
                          <Lock className="w-2.5 h-2.5" /> {pack.minXp} XP
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[10px] leading-snug mt-1 ${
                        active ? 'text-emerald-100' : 'text-slate-500'
                      }`}
                    >
                      {pack.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Sound Mode */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-emerald-950">🌿 പശ്ചാത്തല മോഡ്:</span>
            <div className="flex flex-wrap gap-1.5">
              {bgModes.map((m) => {
                const active =
                  m.id === 'off'
                    ? !snd.ambiencePlaying || snd.backgroundMode === 'off'
                    : snd.ambiencePlaying && snd.backgroundMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      sound.unlockAudio();
                      sound.playClick();
                      sound.setBackgroundMode(m.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-colors ${
                      active
                        ? 'bg-emerald-700 text-white border-emerald-900'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Background Quran & Adhan Controls (Settings Only — Plays Continuously in Background!) */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-extrabold text-amber-950">
                📖 ബാക്ക്ഗ്രൗണ്ട് ഖുർആൻ &amp; 🕌 ബാങ്ക് വിളി
              </p>
              <p className="text-[11px] font-semibold text-amber-900/80">
                ഗെയിം കളിക്കുമ്പോഴും പാഠം വായിക്കുമ്പോഴും പശ്ചാത്തലത്തിൽ മൃദുവായി കേൾക്കാം.
              </p>
            </div>
            {(snd.quranPlaying || snd.adhanPlaying) && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  sound.stopSpiritualAudio();
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-[11px] font-extrabold"
              >
                ⏹️ നിർത്തുക
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QURAN_TRACKS.map((tr) => {
              const active = snd.quranPlaying && snd.quranTrack === tr.id;
              return (
                <button
                  key={tr.id}
                  type="button"
                  onClick={() => {
                    sound.unlockAudio();
                    if (active) sound.stopQuran();
                    else sound.selectQuranTrack(tr.id, true);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                    active
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  {active ? '⏸️ ' : '▶️ '}
                  {tr.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.toggleAdhan();
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                snd.adhanPlaying
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-500'
              }`}
            >
              {snd.adhanPlaying ? '⏸️ ബാങ്ക് നിർത്തുക' : '🕌 ബാങ്ക് വിളി'}
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-1">
            <div className="flex items-center justify-between text-xs font-extrabold text-amber-950">
              <span>🔊 ഖുർആൻ &amp; ബാങ്ക് വോളിയം</span>
              <span className="tabular-nums text-amber-800">{snd.spiritualPct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustPct('spiritualPct', snd.spiritualPct, -10)}
                className="w-7 h-7 rounded-lg bg-amber-100 hover:bg-amber-200 font-extrabold text-amber-950 shrink-0"
                aria-label="കുറയ്ക്കുക"
              >
                −
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={snd.spiritualPct}
                onChange={(e) => sound.setBalance({ spiritualPct: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => adjustPct('spiritualPct', snd.spiritualPct, 10)}
                className="w-7 h-7 rounded-lg bg-amber-100 hover:bg-amber-200 font-extrabold text-amber-950 shrink-0"
                aria-label="കൂട്ടുക"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Share & Google Sites / GitHub Embed Section */}
        <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-sky-950">
            <Share2 className="w-4 h-4 text-sky-700" />
            <span>🔗 ഗെയിം ഷെയർ ചെയ്യാം · Google Sites &amp; GitHub എംബെഡ്</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            മൊബൈലിലും കമ്പ്യൂട്ടറിലും എല്ലാവർക്കും കളിക്കാൻ ഈ ലിങ്ക് ഷെയർ ചെയ്യാം; അല്ലെങ്കിൽ Google Sites-ൽ <strong>Embed → Embed code</strong> വഴി താഴെ കൊടുത്ത കോഡ് ഒട്ടിക്കാം.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(shareUrl, 'link')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-extrabold"
            >
              {copiedMode === 'link' ? (
                <>
                  <Check className="w-3.5 h-3.5" /> ലിങ്ക് കോപ്പി ചെയ്തു!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> ഗെയിം ലിങ്ക് കോപ്പി ചെയ്യുക
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => copyText(embedCode, 'embed')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-sky-100 border border-sky-300 text-sky-950 text-xs font-extrabold"
            >
              {copiedMode === 'embed' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" /> Google Sites കോഡ് കോപ്പി ചെയ്തു!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Google Sites / HTML എംബെഡ് കോഡ്
                </>
              )}
            </button>
          </div>
        </div>

        {/* PIN + Name Protected Progress Backup & Restore Code (SKSSF-BK2) */}
        <div className="p-4 rounded-2xl bg-emerald-50/75 border border-emerald-200 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>🔐 സുരക്ഷിത പ്രോഗ്രസ് ബാക്കപ്പ് (പേര് + 4 അക്ക PIN)</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            ഫോൺ മാറുമ്പോൾ നിങ്ങളുടെ പാഠങ്ങളും സ്കോറും തുടർച്ചയും നഷ്ടപ്പെടാതിരിക്കാൻ <strong>പേരും 4 അക്ക രഹസ്യ PIN-ഉം</strong> നൽകി സ്വകാര്യ ബാക്കപ്പ് കോഡ് ഉണ്ടാക്കാം.
          </p>

          {/* Step 1: Create Protected Backup */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-7">
                <input
                  type="text"
                  value={lockedOwnerName || backupName}
                  readOnly={Boolean(lockedOwnerName)}
                  onChange={(e) => {
                    if (!lockedOwnerName) {
                      setBackupName(e.target.value);
                      setBackupFeedback(null);
                    }
                  }}
                  placeholder="നിങ്ങളുടെ പേര് (സർട്ടിഫിക്കറ്റിൽ ലോക്ക് ആകും)"
                  aria-label="ബാക്കപ്പ് ഉടമയുടെ പേര്"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none ${
                    lockedOwnerName
                      ? 'border-emerald-300 bg-emerald-100/70 text-emerald-950 cursor-not-allowed'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-600'
                  }`}
                />
              </div>
              <div className="sm:col-span-5">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={exportPin}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setExportPin(digits);
                    setBackupFeedback(null);
                  }}
                  placeholder="4 അക്ക PIN (ഉദാ: 4829)"
                  aria-label="ബാക്കപ്പ് 4 അക്ക പിൻ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-extrabold tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600 tabular-nums"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                const res = exportProgressBackupCode(lockedOwnerName || backupName, exportPin);
                if (res.ok && res.code) {
                  copyText(res.code, 'backup');
                  setBackupFeedback({
                    ok: true,
                    text: `“${res.ownerName}” എന്ന പേരിൽ PIN സുരക്ഷിത ബാക്കപ്പ് കോഡ് കോപ്പി ചെയ്തു! കോഡും 4 അക്ക PIN-ഉം സ്വകാര്യമായി സൂക്ഷിക്കുക.`,
                  });
                } else {
                  sound.playError();
                  setBackupFeedback({
                    ok: false,
                    text: res.error || 'ബാക്കപ്പ് കോഡ് ഉണ്ടാക്കാൻ കഴിഞ്ഞില്ല.',
                  });
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold cursor-pointer"
            >
              {copiedMode === 'backup' ? (
                <>
                  <Check className="w-3.5 h-3.5" /> സുരക്ഷിത ബാക്കപ്പ് കോഡ് കോപ്പി ചെയ്തു!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> PIN സുരക്ഷിത ബാക്കപ്പ് കോഡ് കോപ്പി ചെയ്യുക
                </>
              )}
            </button>
          </div>

          {/* Step 2: Restore Protected Backup */}
          <div className="pt-2.5 border-t border-emerald-200/80 space-y-2">
            <label className="block text-[11px] font-extrabold text-slate-800">
              മുമ്പ് സൂക്ഷിച്ച ബാക്കപ്പ് കോഡും 4 അക്ക PIN-ഉം നൽകി പ്രോഗ്രസ് തിരിച്ചെടുക്കാം:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                value={backupInput}
                onChange={(e) => {
                  setBackupInput(e.target.value);
                  setBackupFeedback(null);
                }}
                placeholder="SKSSF-BK2:... കോഡ് ഒട്ടിക്കുക"
                aria-label="ബാക്കപ്പ് കോഡ് ഒട്ടിക്കുക"
                className="sm:col-span-6 min-w-0 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={restorePin}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setRestorePin(digits);
                  setBackupFeedback(null);
                }}
                placeholder="4 അക്ക PIN"
                aria-label="തിരിച്ചെടുക്കാനുള്ള 4 അക്ക പിൻ"
                className="sm:col-span-3 min-w-0 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-extrabold tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600 tabular-nums"
              />
              <button
                type="button"
                onClick={() => {
                  sound.unlockAudio();
                  const res = importProgressBackupCode(backupInput, restorePin);
                  if (res.ok) {
                    sound.reloadPrefsFromStorage();
                    sound.playUnlock();
                    onRestoreBackup?.();
                    if (res.restoredName) {
                      setLockedOwnerName(res.restoredName);
                      setBackupName(res.restoredName);
                    }
                    setBackupInput('');
                    setRestorePin('');
                    setBackupFeedback({
                      ok: true,
                      text: `“${res.restoredName}” എന്ന പ്രൊഫൈൽ തിരിച്ചെടുത്തു! (${res.restoredLessons ?? 0} പാഠങ്ങൾ · ${res.restoredXp ?? 0} XP · 🔥 ${res.restoredStreak ?? 1} ദിവസം · സർട്ടിഫിക്കറ്റ് പേര് ലോക്ക് ചെയ്തു)`,
                    });
                  } else {
                    sound.playError();
                    setBackupFeedback({
                      ok: false,
                      text: res.error || 'ബാക്കപ്പ് കോഡ് തിരിച്ചെടുക്കാൻ കഴിഞ്ഞില്ല.',
                    });
                  }
                }}
                disabled={!backupInput.trim() || restorePin.length !== 4}
                className="sm:col-span-3 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-extrabold shrink-0 cursor-pointer"
              >
                തിരിച്ചെടുക്കുക
              </button>
            </div>
            {backupFeedback && (
              <p
                className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg border ${
                  backupFeedback.ok
                    ? 'bg-emerald-100/80 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {backupFeedback.ok ? '✅ ' : '⚠️ '}
                {backupFeedback.text}
              </p>
            )}
          </div>

          <p className="text-[11px] font-bold text-emerald-900 bg-white/80 border border-emerald-200 rounded-xl px-3 py-2 leading-snug">
            🔒 സർട്ടിഫിക്കറ്റ് സുരക്ഷ: ബാക്കപ്പ് തിരിച്ചെടുത്താൽ സർട്ടിഫിക്കറ്റിൽ ആ ഉടമയുടെ പേര് ലോക്ക് ആകും — മറ്റൊരാൾക്ക് ആ കോഡ് വെച്ച് സ്വന്തം പേരിൽ സർട്ടിഫിക്കറ്റ് എടുക്കാനാകില്ല. എല്ലാ വിവരങ്ങളും ഫോണിൽ മാത്രം സുരക്ഷിതം.
          </p>
        </div>

        {/* Game Reset & Clear Saved Browser Data Section */}
        {(onResetProgress || onClearAllData) && (
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-rose-950">
              <RotateCcw className="w-4 h-4 text-rose-700" />
              <span>🔄 ഗെയിം റീസെറ്റ് &amp; സേവ് ചെയ്ത ഡാറ്റ ക്ലിയർ</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              തുടക്കം മുതൽ പുതുതായി കളിക്കണമെങ്കിൽ <strong>ഗെയിം റീസെറ്റ്</strong> ചെയ്യാം. മുൻ സ്കോറുകളും ശബ്ദ ക്രമീകരണങ്ങളും ഉൾപ്പെടെ ഈ ബ്രൗസറിൽ സേവ് ചെയ്ത മുഴുവൻ വിവരങ്ങളും മായ്ക്കാൻ <strong>എല്ലാ ഡാറ്റയും ക്ലിയർ ചെയ്യുക</strong> ഉപയോഗിക്കാം.
            </p>

            {actionDoneMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-extrabold text-emerald-900">
                ✅ {actionDoneMsg}
              </div>
            )}

            {confirmAction === 'reset' ? (
              <div className="p-3 rounded-xl bg-white border-2 border-amber-400 space-y-2.5">
                <p className="text-xs font-extrabold text-amber-950">
                  ഇതുവരെ കളിച്ച പുരോഗതി (നിലവിലെ പാഠം, XP, ക്വിസ് ഉത്തരങ്ങൾ) മുഴുവൻ റീസെറ്റ് ചെയ്ത് ആദ്യം മുതൽ തുടങ്ങട്ടെ?
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.unlockAudio();
                      sound.playClick();
                      onResetProgress?.();
                      setConfirmAction(null);
                      setActionDoneMsg('ഗെയിം പുരോഗതി റീസെറ്റ് ചെയ്തു — ആദ്യം മുതൽ കളിക്കാം!');
                      window.setTimeout(() => {
                        setActionDoneMsg(null);
                        onClose();
                      }, 900);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold"
                  >
                    അതെ, റീസെറ്റ് ചെയ്യുക
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                  >
                    വേണ്ട, റദ്ദാക്കുക
                  </button>
                </div>
              </div>
            ) : confirmAction === 'clear_all' ? (
              <div className="p-3 rounded-xl bg-white border-2 border-rose-400 space-y-2.5">
                <p className="text-xs font-extrabold text-rose-950">
                  സേവ് ചെയ്ത എല്ലാ വിവരങ്ങളും (ഗെയിം പുരോഗതി, മുൻ ശ്രമങ്ങളുടെ സ്കോറുകൾ, ശബ്ദ സെറ്റിംഗ്സ്, കാഷ് ചെയ്ത വോയിസുകൾ) പൂർണ്ണമായി മായ്ക്കട്ടെ?
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      sound.unlockAudio();
                      sound.playClick();
                      await onClearAllData?.();
                      setConfirmAction(null);
                      setActionDoneMsg('സേവ് ചെയ്ത എല്ലാ വിവരങ്ങളും പൂർണ്ണമായി ക്ലിയർ ചെയ്തു!');
                      window.setTimeout(() => {
                        setActionDoneMsg(null);
                        onClose();
                      }, 900);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-extrabold"
                  >
                    അതെ, എല്ലാം ക്ലിയർ ചെയ്യുക
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                  >
                    വേണ്ട, റദ്ദാക്കുക
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {onResetProgress && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setActionDoneMsg(null);
                      setConfirmAction('reset');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-400 text-amber-950 text-xs font-extrabold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ഇതുവരെ കളിച്ചത് റീസെറ്റ് ചെയ്യുക</span>
                  </button>
                )}
                {onClearAllData && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setActionDoneMsg(null);
                      setConfirmAction('clear_all');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-100 border border-rose-300 text-rose-900 text-xs font-extrabold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>സേവ് ചെയ്ത എല്ലാ വിവരങ്ങളും ക്ലിയർ ചെയ്യുക</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* About This App */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
          <div className="flex items-center gap-3">
            <GuideGameBrandLogo size="sm" />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950">
                <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>ആപ്പിനെക്കുറിച്ച് (About)</span>
              </div>
              <p className="text-sm font-black text-emerald-950">
                ഗൈഡ് ഗെയിം · Guide Game
              </p>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed">
            കുട്ടികൾ മുതൽ മുതിർന്നവർ വരെ എല്ലാവർക്കും ലളിതമായ ഭാഷയിലും കളികളിലൂടെയും സമസ്തയുടെ ചരിത്രവും SKSSF-ന്റെ ദൗത്യങ്ങളും പഠിക്കാനുള്ള സംവേദനാത്മക പഠന വേദിയാണ് <strong>ഗൈഡ് ഗെയിം (Guide Game)</strong>.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-extrabold"
          >
            <CheckCircle2 className="w-4 h-4" /> ശരി, കളിക്കാം!
          </button>
        </div>
      </div>
    </div>
  );
};

/* Non-blocking Top-Side Floating Audio Loader (Never blocks or hangs gameplay!) */
export const AudioLoadingFloatBadge: React.FC = () => {
  const [state, setState] = useState<NarratorState>(narrator.getState());

  useEffect(() => narrator.subscribe(setState), []);

  return (
    <AnimatePresence>
      {state.loading && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.92 }}
          transition={{ duration: 0.18 }}
          className="fixed top-[66px] sm:top-[70px] right-3 z-40 pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/92 text-amber-200 border border-amber-400/70 shadow-lg backdrop-blur-xs max-w-[88vw]">
            <span
              className="w-3.5 h-3.5 rounded-full border-2 border-amber-300 border-t-transparent animate-spin shrink-0"
              aria-hidden="true"
            />
            <span className="text-[11px] font-extrabold leading-tight sm:whitespace-nowrap break-words">
              സംസാരം ലോഡ് ചെയ്യുന്നു...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* Reusable Default-CLOSED Lesson Drawer with Mandatory Confirm CTA to Unlock Quiz */
export const CollapsibleLessonDrawer: React.FC<{
  title?: string;
  emoji?: string;
  badgeText?: string;
  defaultOpen?: boolean;
  onSpeak?: () => void;
  children: React.ReactNode;
}> = ({
  title = 'പാഠം വായിക്കാം',
  emoji = '📖',
  badgeText,
  defaultOpen = false,
  onSpeak,
  children,
}) => {
  const {
    activeLessonId,
    lessonViewStep,
    goToPlayStep,
    hasGameOnPage,
    confirmLesson,
    isLessonConfirmed,
    registerLessonDrawer,
  } = useLessonFlow();
  const [open, setOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showFullNotes, setShowFullNotes] = useState(false);

  // Register presence of this lesson drawer on the page so LessonCheckQuiz enforces confirmation
  useEffect(() => {
    registerLessonDrawer(true);
    return () => registerLessonDrawer(false);
  }, [registerLessonDrawer]);

  // Auto-open Lesson cleanly whenever switching to Screen 2 ('study') or a new lesson
  useEffect(() => {
    setOpen(lessonViewStep === 'study' ? true : defaultOpen);
    setShowInfo(false);
    setShowFullNotes(false);
  }, [activeLessonId, lessonViewStep, defaultOpen]);

  // Allow other cards (e.g., locked Quiz or Skip Game) to automatically open this Lesson drawer
  useEffect(() => {
    const handleOpenLesson = () => {
      setOpen(true);
    };
    window.addEventListener('skssf:open-lesson', handleOpenLesson);
    return () => window.removeEventListener('skssf:open-lesson', handleOpenLesson);
  }, []);

  // Show Lesson strictly on Screen 2 ('study': Lesson + Quiz)
  if (lessonViewStep !== 'study') {
    return null;
  }

  const confirmed = isLessonConfirmed(activeLessonId);

  const handleConfirmLesson = () => {
    sound.unlockAudio();
    sound.playSuccess();
    confirmLesson(activeLessonId);
    window.dispatchEvent(new CustomEvent('skssf:open-quiz'));
    window.setTimeout(() => {
      scrollDirectToQuiz();
    }, 160);
  };

  return (
    <div
      data-lesson-drawer="true"
      data-lesson-drawer-confirmed={confirmed ? 'true' : 'false'}
      className={`rounded-2xl border-2 bg-white shadow-2xs overflow-hidden scroll-mt-20 transition-colors ${
        confirmed ? 'border-emerald-300' : 'border-amber-400'
      }`}
    >
      {/* Top Return Link back to Screen 1 ('play': Storyline + Game) */}
      {hasGameOnPage && (
        <div className="px-3.5 sm:px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              goToPlayStep();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>ഗെയിമിലേക്ക് തിരികെ പോകാം</span>
          </button>
          <span className="text-[11px] font-bold text-slate-500">
            ഘട്ടം 2 · പാഠം + ക്വിസ്
          </span>
        </div>
      )}

      {/* Unified 2-Row Lesson Header */}
      <div className="p-3.5 sm:p-4 space-y-3 bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/40">
        {/* Row 1: Full-width Icon + Section Tag + Status + Complete Readable Title */}
        <div className="flex items-start gap-3 w-full">
          <span className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
              <span className="text-emerald-700 font-extrabold">പാഠം</span>
              {badgeText && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-600 tabular-nums">{badgeText}</span>
                </>
              )}
              <span aria-hidden="true" className="text-slate-300">·</span>
              {confirmed ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> വായിച്ചു കഴിഞ്ഞു
                </span>
              ) : (
                <span className="text-amber-800 font-extrabold">
                  വായിച്ചു മനസ്സിലാക്കാം
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
              <span className="mr-1.5" aria-hidden="true">
                {emoji}
              </span>
              {title}
            </h3>
            {!confirmed && (
              <p className="text-xs font-semibold text-amber-800 leading-snug">
                പാഠം മനസ്സിലാക്കി കഴിഞ്ഞാൽ ക്വിസിലേക്ക് കടക്കാം
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Uniform Action Bar Below Title */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-emerald-200/70">
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              sound.playClick();
              setOpen((v) => !v);
            }}
            aria-expanded={open}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold border-b-2 shadow-2xs transition-transform active:scale-95 cursor-pointer ${
              open
                ? 'bg-white hover:bg-slate-50 text-emerald-950 border-emerald-300 border'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-950'
            }`}
          >
            {open ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{open ? 'പാഠം ചുരുക്കാം' : 'പാഠം തുറക്കാം'}</span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            {onSpeak && (
              <button
                type="button"
                onClick={() => {
                  if (sound.isMuted()) {
                    sound.setMuted(false);
                  }
                  sound.unlockAudio();
                  onSpeak();
                }}
                aria-label="പാഠം കേൾക്കാം"
                title="പാഠം കേൾക്കാം"
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-2xs transition-transform active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowInfo((v) => !v);
              }}
              aria-label="പാഠം വിവരണം"
              title="വിവരണം"
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showInfo && (
        <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-200 text-xs font-bold text-amber-950 leading-relaxed">
          ℹ️ ഗെയിം കളിച്ച് കഴിഞ്ഞാലോ നേരിട്ടോ <strong>“പാഠം തുറക്കാം”</strong> അമർത്തി ഈ പാഠം ശ്രദ്ധയോടെ വായിക്കുകയോ കേൾക്കുകയോ ചെയ്യുക. എന്നിട്ട് താഴെയുള്ള മഞ്ഞ <strong>“🔓 ഇവിടെ അമർത്തൂ — ക്വിസ് തുറക്കാം!”</strong> ബട്ടൺ ഞെക്കിയാൽ അടുത്ത ക്വിസ് തുറക്കും!
        </div>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-emerald-100 bg-white"
          >
            <div className="p-3.5 sm:p-5 space-y-4">
              {/* Relevant Animated Visual Banner + Concise Quiz-Ready Summary for EVERY Lesson */}
              <LessonAnimatedBanner
                lessonId={activeLessonId}
                title={title}
                emoji={emoji}
              />

              {/* Toggleable Detailed Lesson Notes so Learners Never Face Walls of Text */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowFullNotes((v) => !v);
                  }}
                  aria-expanded={showFullNotes}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-extrabold text-emerald-950 transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    {showFullNotes
                      ? 'വിശദമായ കുറിപ്പുകൾ ചുരുക്കാം'
                      : 'കൂടുതൽ വിശദമായി വായിക്കാം (വിശദ കുറിപ്പുകൾ)'}
                  </span>
                  {showFullNotes ? (
                    <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-emerald-700 shrink-0" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {showFullNotes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1 space-y-3">{children}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mandatory Lesson Confirmation CTA — Unmistakable 3D Tactile Unlock-Quiz Push-Button */}
              <div className="pt-3 border-t border-emerald-100">
                {confirmed ? (
                  <div className="w-full flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-emerald-50 border-2 border-emerald-300 px-3.5 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      പാഠം വായിച്ചു കഴിഞ്ഞു — ഇനി ക്വിസിലേക്ക് കടക്കാം!
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        window.dispatchEvent(new CustomEvent('skssf:open-quiz'));
                        window.setTimeout(() => scrollDirectToQuiz(), 120);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-b-4 border-amber-700 text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-transform"
                    >
                      <span>ക്വിസിലേക്ക് പോകാം</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50/90 to-emerald-50 p-3.5 sm:p-4 shadow-md space-y-3">
                    {/* Crystal-Clear Next-Step Instruction Above Button */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/30 border border-amber-500/60 flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-4 h-4 text-amber-900" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <p className="text-[11px] font-black uppercase tracking-wide text-amber-800">
                          അടുത്ത ഘട്ടം · ക്വിസ് തുറക്കാൻ ഇവിടെ ഞെക്കൂ 👇
                        </p>
                        <p className="text-xs font-bold text-slate-800 leading-snug">
                          പാഠം വായിച്ചു കഴിഞ്ഞോ? താഴത്തെ <strong>മഞ്ഞ ബട്ടൺ അമർത്തിയാലേ</strong> അടുത്ത ക്വിസ് അൺലോക്ക് ആയി തുടങ്ങൂ!
                        </p>
                      </div>
                    </div>

                    {/* High-Contrast 3D Tactile Push-Button with Animated Tap Hand & Shine */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.97, y: 2 }}
                      onClick={handleConfirmLesson}
                      className="relative overflow-hidden w-full py-3.5 px-4 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:via-amber-300 hover:to-amber-400 text-slate-950 border-2 border-amber-600 border-b-[6px] border-b-amber-800 shadow-lg flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      {/* Subtle Animated Shine Sweep */}
                      <motion.span
                        aria-hidden="true"
                        animate={{ x: ['-120%', '220%'] }}
                        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', repeatDelay: 1.4 }}
                        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent -skew-x-12"
                      />

                      <div className="relative z-10 flex items-center gap-2.5 text-left">
                        <span className="w-9 h-9 rounded-xl bg-slate-950 text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
                          <Unlock className="w-5 h-5" />
                        </span>
                        <div className="leading-tight">
                          <span className="block text-sm sm:text-base font-black text-slate-950">
                            ഇവിടെ അമർത്തൂ — ക്വിസ് തുറക്കാം!
                          </span>
                          <span className="block text-[11px] font-extrabold text-amber-950/90 mt-0.5">
                            പാഠം മനസ്സിലാക്കി · അടുത്ത ക്വിസ് തുടങ്ങാൻ തൊടുക
                          </span>
                        </div>
                      </div>

                      <motion.div
                        animate={{ scale: [1, 1.15, 1], x: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.1 }}
                        className="relative z-10 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950 text-amber-300 text-[11px] font-black shrink-0 shadow-sm"
                      >
                        <MousePointerClick className="w-4 h-4" />
                        <span className="hidden sm:inline">തൊടുക</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </motion.div>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const StoryNarrationStrip: React.FC<{
  ambiencePlaying: boolean;
  ambienceLabel: string;
  onToggleAmbience: () => void;
  onOpenSettings?: () => void;
}> = () => {
  const [state, setState] = useState<NarratorState>(narrator.getState());
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted());
  const [minimized, setMinimized] = useState(true);

  useEffect(() => {
    const unsubNav = narrator.subscribe(setState);
    const unsubSound = sound.subscribe((snap) => setIsMuted(snap.muted));
    return () => {
      unsubNav();
      unsubSound();
    };
  }, []);

  const isAudible = state.enabled && !isMuted;

  if (minimized) {
    return (
      <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-950 text-white shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              if (state.speaking || state.loading) {
                narrator.stop();
              } else {
                narrator.replayLast();
              }
            }}
            aria-label={state.speaking ? 'ശബ്ദ വിവരണം നിർത്താം' : 'ശബ്ദ വിവരണം കേൾക്കാം'}
            className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 min-w-0 max-w-full text-xs font-extrabold leading-tight text-left transition-colors cursor-pointer ${
              state.speaking
                ? 'bg-amber-400 text-slate-950'
                : 'bg-emerald-700 text-white hover:bg-emerald-600'
            }`}
          >
            {isAudible ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-amber-300" />}
            <span>
              {state.speaking
                ? 'നിർത്താം'
                : isMuted
                ? 'ശബ്ദം കേൾക്കാം (മ്യൂട്ട്)'
                : 'ശബ്ദ വിവരണം കേൾക്കാം'}
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setMinimized(false);
          }}
          aria-label="ശബ്ദ വാചകം തുറക്കാം"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white cursor-pointer shrink-0"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 text-white shadow-xs overflow-hidden">
      <div className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              if (state.speaking || state.loading) {
                narrator.stop();
              } else {
                narrator.replayLast();
              }
            }}
            aria-label={state.speaking ? 'ശബ്ദ വിവരണം നിർത്താം' : 'ശബ്ദ വിവരണം കേൾക്കാം'}
            className={`p-2 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
              state.speaking || state.awaitingUnlock
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-emerald-700 text-white hover:bg-emerald-600'
            }`}
          >
            {isAudible ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-amber-300" />}
          </button>

          <p className="text-xs sm:text-sm font-semibold text-emerald-50 leading-snug break-words min-w-0 flex-1">
            {state.currentText}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setMinimized(true);
          }}
          aria-label="ചുരുക്കാം"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-amber-200 shrink-0 cursor-pointer"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
      {state.unavailableNotice && (
        <div className="px-3.5 py-1.5 bg-emerald-950/80 border-t border-emerald-800/80 text-[11px] font-semibold text-amber-200/95 leading-snug">
          🔇 ഈ വരിയുടെ ശബ്ദം ഓഫ്‌ലൈനിൽ ലഭ്യമല്ല — പ്രധാന പാഠങ്ങളിൽ ശബ്ദ വിവരണം പ്രവർത്തിക്കും.
        </div>
      )}
    </div>
  );
};

export interface QuickTabArrowsProps {
  currentIndex: number;
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
  prevTitle?: string;
  nextTitle?: string;
}

export const QuickTabArrows: React.FC<QuickTabArrowsProps> = ({
  currentIndex,
  total,
  onPrev,
  onNext,
  prevTitle = 'മുൻ ഭാഗം',
  nextTitle = 'അടുത്ത ഭാഗം',
}) => (
  <div className="inline-flex items-center gap-1.5 shrink-0">
    <button
      type="button"
      disabled={currentIndex <= 0 || !onPrev}
      onClick={() => {
        if (!onPrev) return;
        sound.unlockAudio();
        sound.playClick();
        onPrev();
      }}
      title={prevTitle}
      aria-label={prevTitle}
      className="w-8 h-8 rounded-lg border border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
    <span className="text-[11px] font-extrabold text-emerald-900 bg-emerald-100 px-2 py-1 rounded-md tabular-nums">
      {currentIndex + 1}/{total}
    </span>
    <button
      type="button"
      disabled={currentIndex >= total - 1 || !onNext}
      onClick={() => {
        if (!onNext) return;
        sound.unlockAudio();
        sound.playClick();
        onNext();
      }}
      title={nextTitle}
      aria-label={nextTitle}
      className="w-8 h-8 rounded-lg border border-emerald-600 bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
    >
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

export interface LessonProgressStepItem {
  id: string;
  lessonId: string;
  label: string;
  emoji?: string;
}

/* Icon-Only Tap-to-Reveal Lesson Map (Placed BELOW Game!) */
export const LessonProgressTrack: React.FC<{
  stageTitle: string;
  stageSubtitle?: string;
  items: LessonProgressStepItem[];
  activeId: string;
  completedLessonIds: string[];
  onSelectCompleted: (id: string) => void;
  devUnlocked?: boolean;
}> = ({
  stageTitle,
  items,
  activeId,
  completedLessonIds,
  onSelectCompleted,
  devUnlocked = false,
}) => {
  const [touchedNotice, setTouchedNotice] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const activeIdx = Math.max(
    0,
    items.findIndex((item) => item.id === activeId)
  );
  const activeItem = items[activeIdx];
  const completedCount = items.filter((item) =>
    completedLessonIds.includes(item.lessonId)
  ).length;
  const pct = Math.max(
    Math.round(((activeIdx + 1) / Math.max(1, items.length)) * 100),
    Math.round((completedCount / Math.max(1, items.length)) * 100)
  );

  return (
    <div className="mt-3 rounded-2xl border border-emerald-200 bg-white px-3 py-2 shadow-2xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setExpanded((v) => !v);
            setTouchedNotice(activeItem ? `${activeItem.emoji || '📘'} ${activeItem.label}` : stageTitle);
          }}
          aria-expanded={expanded}
          aria-label={stageTitle}
          className="inline-flex items-center gap-1.5 text-left min-w-0"
        >
          <span className="text-base shrink-0">🗺️</span>
          <span className="text-[11px] font-extrabold text-emerald-900 tabular-nums">
            {activeIdx + 1}/{items.length}
          </span>
        </button>

        {/* Icon-Only Quick Step Dots (Tap any icon to reveal its label & jump if unlocked!) */}
        <div className="flex flex-wrap items-center gap-1">
          {items.map((item, idx) => {
            const isCurrent = item.id === activeId;
            const isDone = completedLessonIds.includes(item.lessonId);
            const isReachable = devUnlocked || isCurrent || isDone || idx < activeIdx;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                title={item.label}
                onClick={() => {
                  sound.unlockAudio();
                  if (isReachable) {
                    sound.playClick();
                    setTouchedNotice(`${item.emoji || '📘'} ${idx + 1}. ${item.label}`);
                    onSelectCompleted(item.id);
                  } else {
                    sound.playError();
                    setTouchedNotice(`🔒 ${item.label}`);
                  }
                }}
                className={`lesson-card-lift w-8 h-8 rounded-lg text-sm flex items-center justify-center border ${
                  isCurrent
                    ? 'bg-emerald-700 text-white border-emerald-900 shadow-2xs scale-105 cursor-pointer'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
                    : isReachable
                    ? 'bg-white text-slate-800 border-slate-300 hover:border-emerald-400 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                {isDone ? '✅' : isCurrent ? item.emoji || '▶️' : isReachable ? item.emoji || '📘' : '🔒'}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setExpanded((v) => !v);
          }}
          aria-expanded={expanded}
          aria-label="മാപ്പ് തുറക്കാം"
          className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center justify-center shrink-0"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          style={{ width: `${Math.min(100, pct)}%` }}
          className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400 transition-all duration-300"
        />
      </div>

      {/* Label shown ONLY when an icon is touched or expanded */}
      {(touchedNotice || expanded) && (
        <div className="rounded-xl bg-emerald-50/90 border border-emerald-200 px-3 py-1.5 text-[11px] font-extrabold text-emerald-950 flex items-center justify-between gap-2">
          <span className="leading-snug break-words">
            {touchedNotice || `${stageTitle} · ${activeItem?.label ?? ''}`}
          </span>
          <button
            type="button"
            onClick={() => {
              setTouchedNotice(null);
              setExpanded(false);
            }}
            aria-label="അടയ്ക്കുക"
            className="text-emerald-800 font-extrabold px-1 shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export interface LessonStepperNavProps {
  stepLabel: string;
  currentStep?: number;
  totalSteps?: number;
  prevLabel?: string;
  onPrev?: () => void;
  nextLabel?: string;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextIsWorldAdvance?: boolean;
  statusHint?: string;
  missingActionLabel?: string;
  onMissingAction?: () => void;
}

export const LessonStepperNav: React.FC<LessonStepperNavProps> = ({
  currentStep,
  totalSteps,
  prevLabel,
  onPrev,
  nextLabel,
  onNext,
  nextDisabled = false,
  nextIsWorldAdvance = false,
  missingActionLabel,
  onMissingAction,
}) => {
  const [tipText, setTipText] = useState<string | null>(null);

  const scrollAndRun = (fn?: () => void) => {
    if (!fn) return;
    sound.unlockAudio();
    sound.playClick();
    fn();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-3 rounded-2xl border border-emerald-200 bg-white px-3 py-2.5 shadow-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {prevLabel && onPrev && (
            <button
              type="button"
              onClick={() => scrollAndRun(onPrev)}
              title={prevLabel}
              aria-label={prevLabel}
              className="w-10 h-9 rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title="മുകളിലേക്ക്"
            aria-label="മുകളിലേക്ക്"
            className="w-9 h-9 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 flex items-center justify-center transition-colors shrink-0"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {typeof currentStep === 'number' && typeof totalSteps === 'number' && totalSteps > 1 && (
            <span className="text-[11px] font-extrabold text-slate-500 tabular-nums px-1">
              {currentStep + 1}/{totalSteps}
            </span>
          )}
        </div>

        {nextLabel && onNext && !nextDisabled ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            type="button"
            onClick={() => scrollAndRun(onNext)}
            title={nextLabel}
            aria-label={`അടുത്തത്: ${nextLabel}`}
            className={`inline-flex items-center justify-center gap-1 px-4 h-9 rounded-xl border-b-2 text-sm font-extrabold shadow-sm transition-all ${
              nextIsWorldAdvance
                ? 'border-amber-600 bg-amber-400 hover:bg-amber-300 text-slate-950'
                : 'border-emerald-950 bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            <span>{nextIsWorldAdvance ? '🏆' : '▶'}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </motion.button>
        ) : (
          nextLabel && (
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playClick();
                setTipText(`🔒 ${missingActionLabel || 'ക്വിസ് ഉത്തരം നൽകൂ'}`);
                if (onMissingAction) {
                  onMissingAction();
                }
              }}
              aria-label={missingActionLabel || 'ക്വിസ് ഉത്തരം നൽകൂ'}
              title={missingActionLabel || 'ക്വിസ് ഉത്തരം നൽകൂ'}
              className="inline-flex items-center justify-center gap-1 px-3 h-9 rounded-xl border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-extrabold transition-colors"
            >
              <span>🔒</span>
              <span>❓</span>
            </button>
          )
        )}
      </div>

      {tipText && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 px-3 py-1.5 text-[11px] font-bold text-amber-950 flex items-center justify-between gap-2">
          <span>{tipText}</span>
          <button
            type="button"
            onClick={() => setTipText(null)}
            className="text-amber-800 font-extrabold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export interface UnseenLessonBannerItem {
  id: string;
  emoji: string;
  groupLabel: string;
  title: string;
}

export const UnseenLessonBanner: React.FC<{
  unseenLessons: UnseenLessonBannerItem[];
  onJumpToLesson: (lessonId: string) => void;
}> = ({ unseenLessons, onJumpToLesson }) => {
  if (unseenLessons.length === 0) return null;
  const firstUnseen = unseenLessons[0];
  return (
    <div className="mb-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 px-4 py-3 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
      <div className="min-w-0">
        <p className="text-xs font-extrabold text-amber-900">
          📌 നിങ്ങൾ കാണാതെ വിട്ടുപോയ {unseenLessons.length} പാഠം വീണ്ടും എത്തിയിട്ടുണ്ട് (കണ്ട പാഠങ്ങൾ ആവർത്തിക്കില്ല!)
        </p>
        <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 leading-snug break-words">
          {firstUnseen.emoji} {firstUnseen.groupLabel}: {firstUnseen.title}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          sound.unlockAudio();
          sound.playPop();
          onJumpToLesson(firstUnseen.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border-b-2 border-amber-700 text-xs font-extrabold text-center leading-tight sm:whitespace-nowrap shrink-0 transition-colors max-w-full"
      >
        <span>▶ വിട്ടുപോയ പാഠം പഠിക്കാം</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

/* ============================================================================
 * EASTER EGG SURPRISE GIFTS & MYSTERY BADGE CHEST
 * ========================================================================== */

export interface EasterEggItem {
  id: string;
  emoji: string;
  badge: string;
  title: string;
  giftNote: string;
  speech: string;
  locationHint: string;
}

export const EASTER_EGG_ITEMS: EasterEggItem[] = [
  {
    id: 'egg_harbor_moon',
    emoji: '🌙',
    badge: '🌙 ചന്ദ്രക്കല സമ്മാന ബാഡ്ജ്',
    title: 'രഹസ്യ ചന്ദ്രക്കല സമ്മാനം!',
    giftNote: 'കപ്പൽ തീരത്തെ തിളങ്ങുന്ന ചന്ദ്രക്കല കണ്ടെത്തിയതിനാൽ +25 XP ബോണസും രഹസ്യ ബാഡ്ജും ലഭിച്ചു!',
    speech: 'സർപ്രൈസ് സമ്മാനം! കപ്പൽ തീരത്തെ തിളങ്ങുന്ന ചന്ദ്രക്കല കണ്ടെത്തിയതിന് രഹസ്യ സമ്മാനവും ഇരുപത്തിയഞ്ച് പോയിന്റും ലഭിച്ചു!',
    locationHint: 'തുടക്കം: ചരിത്ര കപ്പൽ തീരം',
  },
  {
    id: 'egg_story_lantern',
    emoji: '🏮',
    badge: '🏮 വെളിച്ച വിളക്ക് ബാഡ്ജ്',
    title: 'കഥാപുരയിലെ പ്രകാശ വിളക്ക്!',
    giftNote: 'കഥാ-ചിത്ര ബോർഡിലെ സ്വർണ്ണ വിളക്ക് തൊട്ടതിന് +25 XP സന്തോഷ സമ്മാനം ലഭിച്ചു!',
    speech: 'സർപ്രൈസ് സമ്മാനം! കഥാ ചിത്ര ബോർഡിലെ പ്രകാശ വിളക്ക് കണ്ടെത്തിയതിന് രഹസ്യ ബാഡ്ജും ഇരുപത്തിയഞ്ച് പോയിന്റും ലഭിച്ചു!',
    locationHint: 'കഥാ-ചിത്ര ബോർഡ്',
  },
  {
    id: 'egg_captain_compass',
    emoji: '🧭',
    badge: '🧭 ക്യാപ്റ്റൻ കോമ്പസ് ബാഡ്ജ്',
    title: 'കപ്പൽ ക്യാപ്റ്റന്റെ രഹസ്യ കോമ്പസ്!',
    giftNote: 'ചരിത്ര കപ്പലിന്റെ ചക്രവാളത്തിൽ ഒളിഞ്ഞിരുന്ന കോമ്പസ് കണ്ടെത്തി — മിടുക്കൻ!',
    speech: 'സർപ്രൈസ് സമ്മാനം! ചരിത്ര കപ്പൽ ക്യാപ്റ്റന്റെ രഹസ്യ കോമ്പസ് കണ്ടെത്തിയതിന് രഹസ്യ ബാഡ്ജും ബോണസ് പോയിന്റും ലഭിച്ചു!',
    locationHint: 'യൂണിറ്റ് തലം: ചരിത്ര യാത്ര',
  },
  {
    id: 'egg_dawa_dove',
    emoji: '🌿',
    badge: '🌿 സമാധാന ദീപം സമ്മാനം',
    title: 'ദഅ്‌വത്ത് ഗ്രാമത്തിലെ സമാധാന ദീപം!',
    giftNote: 'ദീനീ ദഅ്‌വത്തിന്റെ സന്ദേശവുമായി തിളങ്ങുന്ന സമാധാന ദീപം കണ്ടെത്തിയതിനാൽ പ്രത്യേക സമ്മാനം!',
    speech: 'സർപ്രൈസ് സമ്മാനം! ദഅ് വത്ത് ഗ്രാമത്തിലെ സമാധാന ദീപം കണ്ടെത്തിയതിന് പ്രത്യേക സമ്മാനവും ബോണസ് പോയിന്റും ലഭിച്ചു!',
    locationHint: 'ക്ലസ്റ്റർ & മേഖല: സേവന ദൗത്യം',
  },
  {
    id: 'egg_garden_flower',
    emoji: '🌺',
    badge: '🌺 ഹൃദയ തോട്ടം പുഷ്പം ബാഡ്ജ്',
    title: 'ഹൃദയ തോട്ടത്തിലെ സുവർണ്ണ പൂവ്!',
    giftNote: 'ഹൃദയ തോട്ടത്തിലെ സുവർണ്ണ പുഷ്പം തൊട്ടതിന് ഇഖ്‌ലാസിന്റെ സൗരഭ്യം സമ്മാനമായി കിട്ടി!',
    speech: 'സർപ്രൈസ് സമ്മാനം! ഹൃദയ തോട്ടത്തിലെ സുവർണ്ണ പൂവ് കണ്ടെത്തിയതിന് പ്രത്യേക പുഷ്പ സമ്മാനവും ഇരുപത്തിയഞ്ച് പോയിന്റും ലഭിച്ചു!',
    locationHint: 'ജില്ലാ തലം: പ്രവാചക മാതൃക',
  },
  {
    id: 'egg_giraffe_star',
    emoji: '🗼',
    badge: '🗼 സുവർണ്ണ ഗോപുര നക്ഷത്രം',
    title: 'ഗോപുരത്തിലെ സുവർണ്ണ ദൂരക്കാഴ്ച സമ്മാനം!',
    giftNote: 'ഉയരമുള്ള ദൂരക്കാഴ്ചയുടെ ഗോപുര നക്ഷത്രം നേടിയതിനാൽ എല്ലാ ഘട്ടങ്ങളിലും തിളങ്ങാം!',
    speech: 'സർപ്രൈസ് സമ്മാനം! ആഗോള ഗോപുരത്തിലെ സുവർണ്ണ നക്ഷത്ര സമ്മാനം കണ്ടെത്തിയതിന് പ്രത്യേക ബാഡ്ജും ബോണസ് പോയിന്റും ലഭിച്ചു!',
    locationHint: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ തലം',
  },
];

export interface EasterEggTriggerProps {
  eggId: string;
  collected: boolean;
  onClaim: (egg: EasterEggItem) => void;
  className?: string;
}

export const EasterEggSpot: React.FC<EasterEggTriggerProps> = ({
  eggId,
  collected,
  onClaim,
  className = '',
}) => {
  const egg = EASTER_EGG_ITEMS.find((e) => e.id === eggId);
  if (!egg) return null;

  return (
    <button
      type="button"
      onClick={() => onClaim(egg)}
      title={collected ? `${egg.title} ✓` : '🎁 രഹസ്യ സർപ്രൈസ് സമ്മാനം! ടാപ്പ് ചെയ്യൂ'}
      aria-label={collected ? egg.title : 'രഹസ്യ സർപ്രൈസ് സമ്മാനം'}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl border text-xs font-extrabold shadow-md transition-transform hover:scale-110 active:scale-95 ${
        collected
          ? 'bg-emerald-100/95 border-emerald-400 text-emerald-900'
          : 'bg-amber-300/95 border-amber-500 text-slate-950 animate-float-bob ring-2 ring-amber-200/80'
      } ${className}`}
    >
      <span className="text-sm leading-none">{collected ? '✓' : '🎁'}</span>
      <span className="text-sm leading-none">{egg.emoji}</span>
    </button>
  );
};

export interface SurpriseGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectedEggIds: string[];
  activeCelebrationEgg: EasterEggItem | null;
}

export const SurpriseGiftChestModal: React.FC<SurpriseGiftModalProps> = ({
  isOpen,
  onClose,
  collectedEggIds,
  activeCelebrationEgg,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl border-2 border-amber-400 max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                🎁 രഹസ്യ സർപ്രൈസ് സമ്മാനപ്പെട്ടി ({collectedEggIds.length}/{EASTER_EGG_ITEMS.length})
              </h3>
              <p className="text-xs text-slate-600">
                ഓരോ ഘട്ടത്തിലും ഒളിഞ്ഞിരിക്കുന്ന 🎁 ചിഹ്നങ്ങൾ കണ്ടെത്തി രഹസ്യ ബാഡ്ജുകൾ നേടാം
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            aria-label="അടയ്ക്കുക"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeCelebrationEgg && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100 via-yellow-50 to-emerald-50 border-2 border-amber-400 space-y-1.5">
            <p className="text-xs font-extrabold text-amber-900">🎉 പുതിയ സർപ്രൈസ് തുറന്നു!</p>
            <h4 className="text-base font-extrabold text-slate-900">
              {activeCelebrationEgg.emoji} {activeCelebrationEgg.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {activeCelebrationEgg.giftNote}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {EASTER_EGG_ITEMS.map((egg) => {
            const found = collectedEggIds.includes(egg.id);
            return (
              <div
                key={egg.id}
                className={`p-3 rounded-2xl border-2 space-y-1 ${
                  found
                    ? 'bg-emerald-50 border-emerald-400'
                    : 'bg-slate-50 border-dashed border-slate-300 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{found ? egg.emoji : '❓'}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      found ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {found ? 'ലഭിച്ചു ✓' : 'കണ്ടെത്തൂ'}
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-900">
                  {found ? egg.badge : `📍 ${egg.locationHint}`}
                </p>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {found ? egg.giftNote : 'ഈ സ്ക്രീനിൽ ഒളിഞ്ഞിരിക്കുന്ന 🎁 സമ്മാനം തിരയൂ!'}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-extrabold"
          >
            ശരി ✓
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export interface ScoreComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  runNumber: number;
  xp: number;
  rank: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  quizzesAnswered: number;
  quizzesCorrect: number;
  badgesCount: number;
  eggsCount: number;
  runHistory: RunHistoryEntry[];
  onStartNewAttempt: () => void;
  dailyState?: DailyAndProfileState;
  onClaimMission?: (missionId: string, rewardXp: number) => void;
  onUpdateUnitProfile?: (patch: Partial<UnitProfile>) => void;
}

export const ScoreComparisonModal: React.FC<ScoreComparisonModalProps> = ({
  isOpen,
  onClose,
  runNumber,
  xp,
  rank,
  completedLessonsCount,
  totalLessonsCount,
  quizzesAnswered,
  quizzesCorrect,
  badgesCount,
  eggsCount,
  runHistory,
  onStartNewAttempt,
  dailyState,
  onClaimMission,
  onUpdateUnitProfile,
}) => {
  if (!isOpen) return null;

  const currentAccuracy =
    quizzesAnswered > 0 ? Math.round((quizzesCorrect / quizzesAnswered) * 100) : 0;
  const previousRun = runHistory.length > 0 ? runHistory[runHistory.length - 1] : null;
  const prevAccuracy =
    previousRun && previousRun.quizzesAnswered > 0
      ? Math.round((previousRun.quizzesCorrect / previousRun.quizzesAnswered) * 100)
      : 0;
  const xpDiff = previousRun ? xp - previousRun.xp : 0;
  const bestXp = Math.max(xp, ...runHistory.map((r) => r.xp));
  const bestLessons = Math.max(completedLessonsCount, ...runHistory.map((r) => r.completedLessons));

  const profile = dailyState?.profile ?? { playerName: '', unitName: '', mekhalaName: '' };
  const unitLine = [profile.unitName.trim(), profile.mekhalaName.trim()].filter(Boolean).join(' · ');
  const challengeShareText = [
    `🏆 SKSSF ഗൈഡ് ഗെയിം — യൂണിറ്റ് & മേഖലാ സ്കോർ കാർഡ്`,
    profile.playerName.trim() ? `👤 പേര്: ${profile.playerName.trim()}` : null,
    unitLine ? `🏛️ യൂണിറ്റ് / മേഖല: ${unitLine}` : null,
    `📚 പാഠങ്ങൾ: ${completedLessonsCount}/${totalLessonsCount} · ⭐ ${xp} XP (${rank})`,
    dailyState ? `🔥 തുടർച്ച: ${dailyState.streakDays} ദിവസം` : null,
    `നിങ്ങളുടെ യൂണിറ്റിലെ സ്കോറും ഇവിടെ കളിച്ചു നോക്കൂ 👉`,
  ]
    .filter(Boolean)
    .join('\n');
  const challengeWhatsappHref = getWhatsAppShareHref(challengeShareText, getAppShareUrl());

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                സ്കോർ &amp; പുരോഗതി റിപ്പോർട്ട്
              </h2>
              <p className="text-xs text-emerald-800 font-bold">
                ഈ ബ്രൗസറിൽ തനിയെ സേവ് ആകുന്നു · ശ്രമം #{runNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="അടയ്ക്കുക"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Attempt Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          <div className="min-w-0 overflow-hidden p-3 sm:p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <p className="text-[11px] font-bold text-emerald-800 leading-tight break-words">ആകെ പോയിന്റ്</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-950 tabular-nums mt-0.5 notranslate">
              {xp} XP
            </p>
            <p className="text-[11px] font-bold text-slate-600 leading-snug break-words mt-0.5">{rank}</p>
          </div>

          <div className="min-w-0 overflow-hidden p-3 sm:p-3.5 rounded-2xl bg-sky-50 border border-sky-200">
            <p className="text-[11px] font-bold text-sky-800 leading-tight break-words">പൂർത്തിയായ പാഠങ്ങൾ</p>
            <p className="text-xl sm:text-2xl font-extrabold text-sky-950 tabular-nums mt-0.5 notranslate">
              {completedLessonsCount}/{totalLessonsCount}
            </p>
            <p className="text-[11px] font-bold text-slate-600 leading-snug break-words mt-0.5">
              {Math.round((completedLessonsCount / Math.max(1, totalLessonsCount)) * 100)}% പൂർത്തിയായി
            </p>
          </div>

          <div className="min-w-0 overflow-hidden p-3 sm:p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
            <p className="text-[11px] font-bold text-amber-800 leading-tight break-words">ക്വിസ് കൃത്യത</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-950 tabular-nums mt-0.5 notranslate">
              {quizzesAnswered > 0 ? `${currentAccuracy}%` : '—'}
            </p>
            <p className="text-[11px] font-bold text-slate-600 leading-snug break-words mt-0.5 tabular-nums">
              {quizzesCorrect} / {quizzesAnswered} ശരി
            </p>
          </div>

          <div className="min-w-0 overflow-hidden p-3 sm:p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
            <p className="text-[11px] font-bold text-amber-800 leading-tight break-words">ബാഡ്ജുകൾ &amp; സമ്മാനം</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-950 tabular-nums mt-0.5 notranslate">
              {badgesCount}
            </p>
            <p className="text-[11px] font-bold text-slate-600 leading-snug break-words mt-0.5 tabular-nums">
              🎁 {eggsCount}/{EASTER_EGG_ITEMS.length} സമ്മാനങ്ങൾ
            </p>
          </div>
        </div>

        {/* Daily Streak & Daily Missions */}
        {dailyState && (
          <div className="p-4 rounded-2xl bg-amber-50/75 border-2 border-amber-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    പ്രതിദിന തുടർച്ച &amp; ഇന്നത്തെ ദൗത്യങ്ങൾ
                  </h3>
                  <p className="text-[11px] font-bold text-amber-900 tabular-nums">
                    🔥 {dailyState.streakDays} ദിവസം തുടർച്ച · മികച്ചത്: {dailyState.bestStreak} ദിവസം
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {DAILY_MISSIONS.map((mission) => {
                const progress =
                  mission.id === 'daily_checkin'
                    ? 1
                    : mission.id === 'daily_lesson'
                    ? Math.min(1, dailyState.todayLessonsCount)
                    : Math.min(1, dailyState.todayQuizzesCorrect);
                const ready = progress >= mission.target;
                const claimed = dailyState.claimedMissionsToday.includes(mission.id);
                return (
                  <div
                    key={mission.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-amber-200"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-base shrink-0">{mission.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 leading-snug break-words">
                          {mission.title}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 tabular-nums">
                          പുരോഗതി: {progress}/{mission.target} · സമ്മാനം: +{mission.rewardXp} XP
                        </p>
                      </div>
                    </div>
                    {claimed ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-[11px] font-extrabold shrink-0">
                        ✅ നേടി
                      </span>
                    ) : ready ? (
                      <button
                        type="button"
                        onClick={() => {
                          sound.unlockAudio();
                          sound.playSuccess(3);
                          onClaimMission?.(mission.id, mission.rewardXp);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-extrabold shrink-0 cursor-pointer"
                      >
                        +{mission.rewardXp} XP നേടാം
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold shrink-0">
                        ബാക്കി
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Honest Client-Side Unit & Mekhala Score Card + WhatsApp Challenge Share */}
        {dailyState && onUpdateUnitProfile && (
          <div className="p-4 rounded-2xl bg-emerald-50/75 border-2 border-emerald-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                <span>🏛️ യൂണിറ്റ് &amp; മേഖലാ സ്കോർ കാർഡ്</span>
              </h3>
              <span className="text-[11px] font-extrabold text-emerald-900 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-lg tabular-nums notranslate">
                മികച്ച സ്കോർ: {bestXp} XP · {bestLessons}/{totalLessonsCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              നിങ്ങളുടെ യൂണിറ്റും മേഖലയും രേഖപ്പെടുത്തി സ്വന്തം സ്കോർ കാർഡ് വാട്‌സ്ആപ്പ് ഗ്രൂപ്പിൽ പങ്കുവെച്ച് കൂട്ടുകാരുമായി സ്കോർ താരതമ്യം ചെയ്യാം. (വിവരങ്ങൾ ഈ ഫോണിൽ മാത്രമേ സൂക്ഷിക്കൂ.)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={profile.playerName}
                onChange={(e) => onUpdateUnitProfile({ playerName: e.target.value })}
                placeholder="നിങ്ങളുടെ പേര്"
                className="px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <input
                type="text"
                value={profile.unitName}
                onChange={(e) => onUpdateUnitProfile({ unitName: e.target.value })}
                placeholder="യൂണിറ്റ് (ഉദാ: അഞ്ചങ്ങാടി)"
                className="px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <input
                type="text"
                value={profile.mekhalaName}
                onChange={(e) => onUpdateUnitProfile({ mekhalaName: e.target.value })}
                placeholder="മേഖല / ജില്ല"
                className="px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <a
                href={challengeWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>വാട്‌സ്ആപ്പിൽ യൂണിറ്റ്/മേഖലാ സ്കോർ ഷെയർ ചെയ്യാം</span>
              </a>
            </div>
          </div>
        )}

        {/* Comparison with Previous Run */}
        {previousRun ? (
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-emerald-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-600" />
                മുൻ ശ്രമവുമായി താരതമ്യം (ശ്രമം #{previousRun.runNumber} vs ശ്രമം #{runNumber})
              </h3>
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                  xpDiff >= 0
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {xpDiff > 0
                  ? `+${xpDiff} XP മെച്ചപ്പെട്ടു`
                  : xpDiff === 0
                  ? 'തുല്യ സ്കോർ'
                  : `മുൻ ശ്രമത്തേക്കാൾ ${Math.abs(xpDiff)} XP കുറവ്`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <p className="text-xs font-extrabold text-slate-500">
                  മുൻ ശ്രമം (#{previousRun.runNumber})
                </p>
                <p className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {previousRun.xp} XP
                </p>
                <p className="text-xs text-slate-600">
                  പാഠങ്ങൾ: {previousRun.completedLessons}/{previousRun.totalLessons} · ക്വിസ്: {previousRun.quizzesCorrect}/{previousRun.quizzesAnswered} ({prevAccuracy}%)
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-1">
                <p className="text-xs font-extrabold text-emerald-800">
                  ഇപ്പോഴത്തെ ശ്രമം (#{runNumber})
                </p>
                <p className="text-lg font-extrabold text-emerald-950 tabular-nums">
                  {xp} XP
                </p>
                <p className="text-xs text-emerald-900">
                  പാഠങ്ങൾ: {completedLessonsCount}/{totalLessonsCount} · ക്വിസ്: {quizzesCorrect}/{quizzesAnswered} ({currentAccuracy}%)
                </p>
              </div>
            </div>

            {runHistory.length > 1 && (
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <p className="text-[11px] font-extrabold text-slate-600">
                  മുൻപത്തെ എല്ലാ ശ്രമങ്ങളും:
                </p>
                <div className="space-y-1">
                  {runHistory.map((r) => (
                    <div
                      key={r.runNumber}
                      className="flex items-center justify-between text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                    >
                      <span className="font-bold text-slate-800">ശ്രമം #{r.runNumber}</span>
                      <span className="font-extrabold text-emerald-800 tabular-nums">
                        {r.xp} XP · പാഠങ്ങൾ {r.completedLessons}/{r.totalLessons} · ക്വിസ് {r.quizzesCorrect}/{r.quizzesAnswered}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
            ഇത് നിങ്ങളുടെ ആദ്യ ശ്രമമാണ്. ഗെയിം പൂർത്തിയാക്കിയ ശേഷമോ എപ്പോൾ വേണമെങ്കിലുമോ താഴെയുള്ള ബട്ടൺ വഴി <strong>പുതിയ ശ്രമം</strong> തുടങ്ങിയാൽ, ആദ്യ ശ്രമത്തിലെ സ്കോറും പുതിയ സ്കോറും ഇവിടെ താരതമ്യം ചെയ്ത് കാണാനാകും.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              sound.playClick();
              onStartNewAttempt();
              onClose();
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-400 text-amber-950 text-xs sm:text-sm font-extrabold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>വീണ്ടും പുതുതായി കളിക്കാം (പുതിയ ശ്രമം)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-extrabold"
          >
            <CheckCircle2 className="w-4 h-4" /> തുടരാം
          </button>
        </div>
      </motion.div>
    </div>
  );
};

