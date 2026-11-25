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
  Gift,
  Info,
  Lock,
  Music,
  Play,
  RotateCcw,
  Settings,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { narrator, NarratorState } from '../utils/narrator';
import {
  BackgroundMode,
  QURAN_TRACKS,
  sound,
  SoundPreset,
  SoundStateSnapshot,
} from '../utils/sound';
import { RunHistoryEntry } from '../utils/gameStorage';
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
              className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl border-2 border-amber-200 bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg whitespace-nowrap"
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
    <div className="self-start mt-1 -ml-0.5 flag-wave shadow-md rounded overflow-hidden border border-white/40 bg-white">
      {variant === 'skju' ? (
        <OfficialSamasthaFlagImg className="w-12 h-8 sm:w-16 sm:h-11 object-cover" />
      ) : (
        <OfficialSkssfFlagImg className="w-12 h-8 sm:w-16 sm:h-11 object-cover" />
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

export const AnimatedGiraffeMascot: React.FC<{ className?: string }> = ({
  className = 'w-16 h-20',
}) => (
  <svg
    viewBox="0 0 90 110"
    className={`${className} animate-float-bob`}
    aria-hidden="true"
  >
    <path
      d="M36 96 L38 56 L50 56 L54 96 Z"
      fill="#FBBF24"
      stroke="#92400E"
      strokeWidth="2"
    />
    <circle cx="43" cy="68" r="3" fill="#78350F" />
    <circle cx="47" cy="80" r="3.5" fill="#78350F" />
    <circle cx="41" cy="88" r="2.5" fill="#78350F" />
    <path
      d="M42 58 L44 22 C44 16 58 16 62 22 C65 26 58 32 52 32 L50 58 Z"
      fill="#FBBF24"
      stroke="#92400E"
      strokeWidth="2"
    />
    <line x1="46" y1="18" x2="44" y2="9" stroke="#78350F" strokeWidth="2.5" />
    <circle cx="44" cy="9" r="2.5" fill="#78350F" />
    <line x1="52" y1="18" x2="53" y2="9" stroke="#78350F" strokeWidth="2.5" />
    <circle cx="53" cy="9" r="2.5" fill="#78350F" />
    <circle cx="53" cy="23" r="2" fill="#1E293B" />
    <line x1="68" y1="98" x2="76" y2="36" stroke="#B45309" strokeWidth="3" />
    <line x1="80" y1="98" x2="88" y2="36" stroke="#B45309" strokeWidth="3" />
    <line x1="70" y1="86" x2="82" y2="86" stroke="#D97706" strokeWidth="2.5" />
    <line x1="72" y1="70" x2="84" y2="70" stroke="#D97706" strokeWidth="2.5" />
    <line x1="74" y1="54" x2="86" y2="54" stroke="#D97706" strokeWidth="2.5" />
  </svg>
);

/* Dedicated Interactive Audio, Volume Verification & Share/Embed Settings Modal */
export const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onResetProgress?: () => void;
  onClearAllData?: () => Promise<void> | void;
}> = ({ isOpen, onClose, onResetProgress, onClearAllData }) => {
  const [snd, setSnd] = useState<SoundStateSnapshot>(sound.getSnapshot());
  const [nav, setNav] = useState<NarratorState>(narrator.getState());
  const [copiedMode, setCopiedMode] = useState<'link' | 'embed' | null>(null);
  const [confirmAction, setConfirmAction] = useState<'reset' | 'clear_all' | null>(null);
  const [actionDoneMsg, setActionDoneMsg] = useState<string | null>(null);

  useEffect(() => {
    const u1 = sound.subscribe(setSnd);
    const u2 = narrator.subscribe(setNav);
    return () => {
      u1();
      u2();
    };
  }, []);

  if (!isOpen) return null;

  const shareUrl =
    typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const embedCode = `<iframe src="${shareUrl}" title="SKSSF ഗൈഡ് ഗെയിം" width="100%" height="780" style="border:0;border-radius:16px;overflow:hidden;" allow="autoplay; clipboard-write" allowfullscreen></iframe>`;

  const copyText = async (text: string, mode: 'link' | 'embed') => {
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
    { id: 'birds', label: '🐦 പ്രഭാത പക്ഷികൾ' },
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

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                ⚙️ ശബ്ദ &amp; ഷെയർ സെറ്റിംഗ്സ്
              </h2>
              <p className="text-xs text-slate-600">
                ഓരോ ശബ്ദത്തിന്റെയും വോളിയം 0% (നിശബ്ദം) മുതൽ 100% വരെ തത്സമയം ക്രമീകരിക്കാം
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="അടയ്ക്കുക"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/92 text-amber-200 border border-amber-400/70 shadow-lg backdrop-blur-xs">
            <span
              className="w-3.5 h-3.5 rounded-full border-2 border-amber-300 border-t-transparent animate-spin shrink-0"
              aria-hidden="true"
            />
            <span className="text-[11px] font-extrabold whitespace-nowrap">
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
    confirmLesson,
    isLessonConfirmed,
    registerLessonDrawer,
  } = useLessonFlow();
  const [open, setOpen] = useState(defaultOpen);
  const [showInfo, setShowInfo] = useState(false);
  const [showFullNotes, setShowFullNotes] = useState(false);

  // Register presence of this lesson drawer on the page so LessonCheckQuiz enforces confirmation
  useEffect(() => {
    registerLessonDrawer(true);
    return () => registerLessonDrawer(false);
  }, [registerLessonDrawer]);

  // Reset closed whenever navigating to a new lesson
  useEffect(() => {
    setOpen(defaultOpen);
    setShowInfo(false);
    setShowFullNotes(false);
  }, [activeLessonId, defaultOpen]);

  // Allow other cards (e.g., locked Quiz or Skip Game) to automatically open this Lesson drawer
  useEffect(() => {
    const handleOpenLesson = () => {
      setOpen(true);
    };
    window.addEventListener('skssf:open-lesson', handleOpenLesson);
    return () => window.removeEventListener('skssf:open-lesson', handleOpenLesson);
  }, []);

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
      className={`rounded-2xl border-2 bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/60 shadow-sm overflow-hidden scroll-mt-20 transition-colors ${
        confirmed ? 'border-emerald-300' : 'border-amber-400 ring-2 ring-amber-100'
      }`}
    >
      {/* Unified 2-Row Lesson Header */}
      <div className="p-3.5 sm:p-4 space-y-3">
        {/* Row 1: Full-width Icon + Section Tag + Status + Complete Readable Title */}
        <div className="flex items-start gap-3 w-full">
          <span className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black tracking-wider uppercase text-teal-700">
                LESSON
              </span>
              {badgeText && (
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full tabular-nums">
                  {badgeText}
                </span>
              )}
              {confirmed ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> വായിച്ചു
                </span>
              ) : (
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.0 }}
                  className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full"
                >
                  👉 വായിക്കാം
                </motion.span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
              <span className="mr-1.5" aria-hidden="true">
                {emoji}
              </span>
              {title}
            </h3>
            {!confirmed && (
              <p className="text-xs font-bold text-amber-800 leading-snug">
                പാഠം തുറന്ന് താഴെ ഉറപ്പിച്ചാൽ ക്വിസ് തുറക്കും
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
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold border-b-2 shadow-xs transition-transform active:scale-95 cursor-pointer ${
              open
                ? 'bg-white hover:bg-slate-50 text-teal-950 border-teal-300 border'
                : 'bg-teal-700 hover:bg-teal-800 text-white border-teal-950'
            }`}
          >
            {open ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{open ? 'Close Lesson' : 'Open Lesson'}</span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            {onSpeak && (
              <button
                type="button"
                onClick={() => {
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
          ℹ️ ഗെയിം കളിച്ച് കഴിഞ്ഞാലോ നേരിട്ടോ <strong>“Open Lesson”</strong> അമർത്തി ഈ പാഠം ശ്രദ്ധയോടെ വായിക്കുകയോ കേൾക്കുകയോ ചെയ്യുക. എന്നിട്ട് താഴെയുള്ള <strong>“✅ പാഠം മനസ്സിലാക്കി — ക്വിസ് തുറക്കാം”</strong> അമർത്തിയാൽ ക്വിസ് തുറക്കും!
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

              {/* Mandatory Lesson Confirmation CTA to Unlock Quiz */}
              <div className="pt-3 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2.5">
                {confirmed ? (
                  <div className="w-full flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      പാഠം ഉറപ്പിച്ചു — ഇനി താഴത്തെ ക്വിസിന് ഉത്തരം നൽകാം!
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        window.dispatchEvent(new CustomEvent('skssf:open-quiz'));
                        window.setTimeout(() => scrollDirectToQuiz(), 120);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold cursor-pointer"
                    >
                      <span>Open Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmLesson}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-extrabold border-b-4 border-emerald-900 shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9 }}
                      className="text-base"
                    >
                      👆
                    </motion.span>
                    <span>✅ പാഠം മനസ്സിലാക്കി — ക്വിസ് തുറക്കാം</span>
                  </button>
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
  const [minimized, setMinimized] = useState(true);

  useEffect(() => {
    const unsubNav = narrator.subscribe(setState);
    return () => {
      unsubNav();
    };
  }, []);

  if (minimized) {
    return (
      <div className="mt-3 flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-950 text-white shadow-2xs">
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
            aria-label={state.speaking ? 'നിർത്താം' : 'കേൾക്കാം'}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 text-xs font-extrabold ${
              state.speaking
                ? 'bg-amber-400 text-slate-950'
                : 'bg-emerald-700 text-white hover:bg-emerald-600'
            }`}
          >
            {state.enabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{state.speaking ? '⏹️' : '🎙️'}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setMinimized(false);
          }}
          aria-label="ശബ്ദ വാചകം തുറക്കാം"
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white shadow-xs overflow-hidden">
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
            aria-label={state.speaking ? 'നിർത്താം' : 'കേൾക്കാം'}
            className={`p-2 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
              state.speaking || state.awaitingUnlock
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-emerald-700 text-white hover:bg-emerald-600'
            }`}
          >
            {state.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
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
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-amber-200 shrink-0"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
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
                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border transition-all ${
                  isCurrent
                    ? 'bg-emerald-700 text-white border-emerald-900 shadow-2xs scale-105'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : isReachable
                    ? 'bg-white text-slate-800 border-slate-300'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
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
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border-b-2 border-amber-700 text-xs font-extrabold whitespace-nowrap shrink-0 transition-colors"
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
    emoji: '🕊️',
    badge: '🕊️ സമാധാന പ്രാവ് സമ്മാനം',
    title: 'ദഅ്‌വത്ത് ഗ്രാമത്തിലെ സമാധാന പ്രാവ്!',
    giftNote: 'ദീനീ ദഅ്‌വത്തിന്റെ സന്ദേശവുമായി പറക്കുന്ന വെള്ളപ്രാവിനെ കണ്ടെത്തിയതിനാൽ പ്രത്യേക സമ്മാനം!',
    speech: 'സർപ്രൈസ് സമ്മാനം! ദഅ് വത്ത് ഗ്രാമത്തിലെ സമാധാന പ്രാവിനെ കണ്ടെത്തിയതിന് പ്രത്യേക സമ്മാനവും ബോണസ് പോയിന്റും ലഭിച്ചു!',
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
    emoji: '🦒',
    badge: '🦒 സ്വർണ്ണ ജിറാഫ് ചങ്ങാതി',
    title: 'ഗോപുരത്തിലെ സ്വർണ്ണ ജിറാഫ് സമ്മാനം!',
    giftNote: 'ദൂരക്കാഴ്ചയുള്ള ജിറാഫിന്റെ രഹസ്യ സമ്മാനം നേടിയതിനാൽ എല്ലാ ഘട്ടങ്ങളിലും തിളങ്ങാം!',
    speech: 'സർപ്രൈസ് സമ്മാനം! ആഗോള ഗോപുരത്തിലെ സ്വർണ്ണ ജിറാഫ് സമ്മാനം കണ്ടെത്തിയതിന് പ്രത്യേക ബാഡ്ജും ബോണസ് പോയിന്റും ലഭിച്ചു!',
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
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                സ്കോർ &amp; പുരോഗതി റിപ്പോർട്ട്
              </h2>
              <p className="text-xs text-emerald-800 font-bold">
                നിങ്ങളുടെ പുരോഗതി ഈ ബ്രൗസറിൽ തനിയെ സേവ് ആകുന്നുണ്ട് · ശ്രമം #{runNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="അടയ്ക്കുക"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Attempt Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <p className="text-[11px] font-bold text-emerald-800">ആകെ പോയിന്റ്</p>
            <p className="text-2xl font-extrabold text-emerald-950 tabular-nums mt-0.5">
              {xp} XP
            </p>
            <p className="text-[11px] font-bold text-slate-600 leading-snug break-words mt-0.5">{rank}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200">
            <p className="text-[11px] font-bold text-sky-800">പൂർത്തിയാക്കിയ പാഠങ്ങൾ</p>
            <p className="text-2xl font-extrabold text-sky-950 tabular-nums mt-0.5">
              {completedLessonsCount}/{totalLessonsCount}
            </p>
            <p className="text-[11px] font-bold text-slate-600 mt-0.5">
              {Math.round((completedLessonsCount / Math.max(1, totalLessonsCount)) * 100)}% പൂർത്തിയായി
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
            <p className="text-[11px] font-bold text-amber-800">ക്വിസ് കൃത്യത</p>
            <p className="text-2xl font-extrabold text-amber-950 tabular-nums mt-0.5">
              {quizzesAnswered > 0 ? `${currentAccuracy}%` : '—'}
            </p>
            <p className="text-[11px] font-bold text-slate-600 mt-0.5 tabular-nums">
              {quizzesCorrect} / {quizzesAnswered} ശരി
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
            <p className="text-[11px] font-bold text-purple-800">ബാഡ്ജുകൾ &amp; സമ്മാനം</p>
            <p className="text-2xl font-extrabold text-purple-950 tabular-nums mt-0.5">
              {badgesCount}
            </p>
            <p className="text-[11px] font-bold text-slate-600 mt-0.5 tabular-nums">
              🎁 {eggsCount}/{EASTER_EGG_ITEMS.length} സമ്മാനങ്ങൾ
            </p>
          </div>
        </div>

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

