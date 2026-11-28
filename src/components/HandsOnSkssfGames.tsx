import React, { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Camera, CheckCircle2, Crop, Info, PanelRightClose, PanelRightOpen, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { useGameFullscreen, useGameStagePaused, useGameStagePortal } from './GameFullscreenShell';
import { scrollToActiveQuiz } from './LessonCheckQuiz';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import { OFFICIAL_WING_LOGOS } from '../data/officialLogos';

export interface HandsOnGameProps {
  xpKey: string;
  title: string;
  subtitle: string;
  onAwardXp: (amount: number, actionId: string) => void;
  onComplete?: () => void;
  isCompleted?: boolean;
}

const WinOverlay: React.FC<{
  headline: string;
  note: string;
  onReplay: () => void;
}> = ({ headline, note, onReplay }) => {
  const [showInfo, setShowInfo] = useState(false);
  const stagePortal = useGameStagePortal();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white border-2 border-amber-300 shadow-md space-y-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowInfo((v) => !v);
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-amber-300"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>🎉 +30 XP</span>
          <Info className="w-3.5 h-3.5 text-emerald-200" />
        </button>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onReplay}
            aria-label="വീണ്ടും കളിക്കാം"
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              sound.playClick();
              if (stagePortal?.hasLesson) {
                stagePortal.openLesson();
              } else {
                scrollToActiveQuiz();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shrink-0 shadow-xs cursor-pointer"
          >
            <span>{stagePortal?.hasLesson ? '📖 പാഠത്തിലേക്ക്' : 'അടുത്തത് · ക്വിസ്'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {showInfo && (
        <div className="text-[11px] text-emerald-100 font-semibold leading-snug border-t border-white/15 pt-1.5">
          <p className="font-extrabold text-amber-200">{headline}</p>
          <p>{note}</p>
        </div>
      )}
    </motion.div>
  );
};

const FailOverlay: React.FC<{
  headline: string;
  note: string;
  onRetry: () => void;
}> = ({ headline, note, onRetry }) => (
  <GameDefeatBurstOverlay
    title={headline}
    reason={note}
    onRetry={onRetry}
    overlay={false}
  />
);

const GameShellHeader: React.FC<{
  badge: string;
  title: string;
  subtitle: string;
  done: boolean;
  progressText: string;
  lives?: number;
  maxLives?: number;
  logos?: { src: string; alt: string }[];
}> = ({ badge, title, subtitle, done, progressText, lives, maxLives = 3, logos }) => {
  const [showInfo, setShowInfo] = useState(false);
  const iconOnly = badge.trim().split(/\s+/)[0] || '🎮';
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowInfo((v) => !v);
            }}
            aria-label={title}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-sm font-extrabold"
          >
            <span>{iconOnly}</span>
            <Info className="w-3.5 h-3.5 text-emerald-700" />
          </button>
          {logos && logos.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-0.5 shrink-0">
              {logos.map((lg) => (
                <img
                  key={lg.src}
                  src={lg.src}
                  alt={lg.alt}
                  className="h-6 w-auto max-w-[64px] object-contain"
                />
              ))}
            </div>
          )}
          {done && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 text-xs font-extrabold">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {typeof lives === 'number' && (
            <GameShatterLives lives={lives} maxLives={maxLives} dark={false} compact />
          )}
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-emerald-900 tabular-nums shrink-0">
            {progressText}
          </span>
        </div>
      </div>
      {showInfo && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 space-y-0.5">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">{title}</h4>
          <p className="text-[11px] text-slate-600 font-medium leading-snug">{subtitle}</p>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 1. POSTER & FESTON (തോരണം) WALL / MADRASA STICKING GAME (Drag & Drop + Tap!)
 * ========================================================================== */
interface WallItem {
  id: string;
  emoji: string;
  label: string;
  slotLabel: string;
  xClass: string;
  yClass: string;
  wClass: string;
}

const POSTER_ITEMS: WallItem[] = [
  {
    id: 'thoranam',
    emoji: '🎊',
    label: 'വർണ്ണ തോരണങ്ങൾ',
    slotLabel: 'മുകളിൽ തോരണം കെട്ടാം',
    xClass: 'left-[8%]',
    yClass: 'top-[8%]',
    wClass: 'w-[84%]',
  },
  {
    id: 'skssf_poster',
    emoji: '📜',
    label: 'SKSSF സമ്മേളന പോസ്റ്റർ',
    slotLabel: 'ഇടതു ചുമരിൽ പോസ്റ്റർ ഒട്ടിക്കാം',
    xClass: 'left-[10%]',
    yClass: 'top-[40%]',
    wClass: 'w-[37%]',
  },
  {
    id: 'flag_pair',
    emoji: '🚩',
    label: 'സമസ്ത & SKSSF കൊടികൾ',
    slotLabel: 'വലതു തൂണിൽ കൊടി വെക്കാം',
    xClass: 'left-[53%]',
    yClass: 'top-[40%]',
    wClass: 'w-[37%]',
  },
  {
    id: 'date_strip',
    emoji: '📢',
    label: 'തീയതി & സ്വാഗത ബാനർ',
    slotLabel: 'താഴെ സ്വാഗത ബാനർ ഒട്ടിക്കാം',
    xClass: 'left-[22%]',
    yClass: 'top-[74%]',
    wClass: 'w-[56%]',
  },
];

export const PosterWallStickGame: React.FC<HandsOnGameProps & { variant?: 'wall' | 'madrasa' }> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
  variant = 'wall',
}) => {
  const [placed, setPlaced] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(POSTER_ITEMS[0].id);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [won, setWon] = useState(isCompleted);
  const [lives, setLives] = useState<number>(3);
  const [failed, setFailed] = useState(false);
  const [hint, setHint] = useState<string>('താഴെയുള്ള പോസ്റ്ററും തോരണവും ചുമരിലെ തിളങ്ങുന്ന സ്ഥലത്തേക്ക് വലിച്ചിടൂ അല്ലെങ്കിൽ തൊടൂ! (3 തെറ്റുകൾ വരുത്തിയാൽ പരാജയപ്പെടും)');

  const snap = (itemId: string, slotId: string) => {
    sound.unlockAudio();
    if (placed.includes(slotId) || failed || won) return;
    if (itemId !== slotId) {
      sound.playError();
      const nextLives = Math.max(0, lives - 1);
      setLives(nextLives);
      const targetMeta = POSTER_ITEMS.find((p) => p.id === itemId);
      if (nextLives === 0) {
        setFailed(true);
        setHint('ചുമരിൽ തെറ്റായ സ്ഥലത്ത് 3 തവണ ഒട്ടിച്ചു! വീണ്ടും ശ്രമിക്കാം.');
      } else {
        setHint(`അവിടെയല്ല! (ബാക്കി അവസരം: ${nextLives}) "${targetMeta?.label}" → "${targetMeta?.slotLabel}" എന്ന സ്ഥലത്ത് ഒട്ടിക്കൂ.`);
      }
      return;
    }
    const next = [...placed, slotId];
    setPlaced(next);
    setDraggingId(null);
    const remaining = POSTER_ITEMS.find((p) => !next.includes(p.id));
    setSelectedId(remaining ? remaining.id : null);
    sound.playSuccess(next.length);
    const meta = POSTER_ITEMS.find((p) => p.id === slotId);
    setHint(`✨ "${meta?.label}" ഭംഗിയായി ഒട്ടിച്ചു!`);

    if (next.length === POSTER_ITEMS.length) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `hands_${xpKey}`);
      onComplete?.();
      narrator.speak('അടിപൊളി! തോരണങ്ങളും പോസ്റ്ററുകളും കൊടികളും ഭംഗിയായി ചുമരിൽ അലങ്കരിച്ചു!', title);
    }
  };

  const reset = () => {
    sound.playClick();
    setPlaced([]);
    setSelectedId(POSTER_ITEMS[0].id);
    setLives(3);
    setFailed(false);
    setWon(false);
    setHint('താഴെയുള്ള പോസ്റ്ററും തോരണവും ചുമരിലെ തിളങ്ങുന്ന സ്ഥലത്തേക്ക് വലിച്ചിടൂ അല്ലെങ്കിൽ തൊടൂ!');
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <GameShellHeader
        badge={variant === 'madrasa' ? '🎊 മദ്രസ അലങ്കാര ഗെയിം' : '📜 പോസ്റ്റർ & തോരണം ഒട്ടിക്കൽ'}
        title={title}
        subtitle={subtitle}
        done={won}
        lives={lives}
        progressText={`${placed.length}/${POSTER_ITEMS.length}`}
      />

      {/* Live Animated Brick Wall / Madrasa Gate Backdrop */}
      <div className="relative rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 via-orange-50/70 to-emerald-50 min-h-[250px] sm:min-h-[275px] overflow-hidden select-none p-3">
        {/* Subtle animated swaying clouds & brick wall lines */}
        <svg viewBox="0 0 600 260" className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" aria-hidden="true">
          <defs>
            <pattern id={`bricks_${xpKey}`} width="60" height="28" patternUnits="userSpaceOnUse">
              <rect width="60" height="28" fill="none" stroke="#D97706" strokeWidth="1" />
              <line x1="30" y1="0" x2="30" y2="14" stroke="#D97706" strokeWidth="1" />
              <line x1="0" y1="14" x2="60" y2="14" stroke="#D97706" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="600" height="260" fill={`url(#bricks_${xpKey})`} />
        </svg>

        {POSTER_ITEMS.map((item) => {
          const isPlaced = placed.includes(item.id);
          const isTarget = selectedId === item.id || draggingId === item.id;
          return (
            <div
              key={item.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dragged = e.dataTransfer.getData('text/plain') || draggingId || selectedId;
                if (dragged) snap(dragged, item.id);
              }}
              onClick={() => {
                if (selectedId) snap(selectedId, item.id);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && selectedId && snap(selectedId, item.id)}
              className={`absolute ${item.xClass} ${item.yClass} ${item.wClass} rounded-xl transition-all cursor-pointer p-2 text-center ${
                isPlaced
                  ? item.id === 'thoranam'
                    ? 'bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-400 text-white border-2 border-white shadow-md'
                    : item.id === 'skssf_poster'
                    ? 'bg-emerald-800 text-white border-2 border-amber-300 shadow-lg'
                    : item.id === 'flag_pair'
                    ? 'bg-sky-700 text-white border-2 border-emerald-200 shadow-lg'
                    : 'bg-amber-400 text-slate-950 border-2 border-amber-700 shadow-md'
                  : isTarget
                  ? 'border-2 border-dashed border-amber-500 bg-amber-100/90 ring-4 ring-amber-200/80 animate-pulse'
                  : 'border-2 border-dashed border-emerald-500/65 bg-white/80 hover:bg-emerald-50'
              }`}
            >
              {isPlaced ? (
                <motion.div
                  initial={{ scale: 0.65, rotate: -4 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="space-y-0.5"
                >
                  {item.id === 'thoranam' ? (
                    <motion.p
                      animate={{ y: [0, 2, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="text-xs sm:text-sm font-extrabold tracking-widest"
                    >
                      🚩🎉✨ 🟢⚪🔵 SKSSF വർണ്ണ തോരണങ്ങൾ 🔵⚪🟢 ✨🎉🚩
                    </motion.p>
                  ) : item.id === 'skssf_poster' ? (
                    <>
                      <p className="text-[10px] font-bold text-amber-300">📜 വിജ്ഞാനം · വിനയം · സേവനം</p>
                      <p className="text-xs sm:text-sm font-extrabold">SKSSF {variant === 'madrasa' ? 'മദ്രസ കൂട്ടായ്മ' : 'മഹാ സമ്മേളനം'}</p>
                    </>
                  ) : item.id === 'flag_pair' ? (
                    <motion.div
                      animate={{ rotate: [-1.5, 1.5, -1.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <p className="text-lg leading-none">🚩 🕌 🚩</p>
                      <p className="text-[11px] font-extrabold mt-0.5">സമസ്ത · SKSSF · SKSBV</p>
                    </motion.div>
                  ) : (
                    <p className="text-xs sm:text-sm font-extrabold">
                      📢 എല്ലാവർക്കും സ്നേഹപൂർവ്വം സ്വാഗതം!
                    </p>
                  )}
                </motion.div>
              ) : (
                <div className="py-1 flex items-center justify-center gap-1">
                  <span className="text-2xl leading-none">{item.emoji}</span>
                  {isTarget && (
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.75, repeat: Infinity }}
                      className="inline-block text-lg"
                    >
                      👇
                    </motion.span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {failed ? (
        <FailOverlay
          headline="ചുമർ അലങ്കാരം പരാജയപ്പെട്ടു!"
          note="തെറ്റായ സ്ഥലത്ത് 3 തവണ ഒട്ടിച്ചതിനാൽ മാർക്ക് നഷ്ടപ്പെട്ടു."
          onRetry={reset}
        />
      ) : !won ? (
        <div className="space-y-1.5">
          <div className="grid grid-cols-4 gap-2">
            {POSTER_ITEMS.map((item) => {
              const done = placed.includes(item.id);
              const active = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={done}
                  draggable={!done}
                  onDragStart={(e) => {
                    sound.unlockAudio();
                    setDraggingId(item.id);
                    setSelectedId(item.id);
                    e.dataTransfer.setData('text/plain', item.id);
                  }}
                  onClick={() => {
                    sound.playClick();
                    setSelectedId(item.id);
                  }}
                  aria-label={item.label}
                  title={item.label}
                  className={`p-2.5 rounded-xl border-2 flex items-center justify-center gap-1 transition-all ${
                    done
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-65'
                      : active
                      ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-sm scale-[1.03]'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-400'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  {done && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                </button>
              );
            })}
          </div>
          {selectedId && (
            <p className="text-[11px] font-bold text-emerald-900 text-center">
              {POSTER_ITEMS.find((p) => p.id === selectedId)?.emoji}{' '}
              {POSTER_ITEMS.find((p) => p.id === selectedId)?.label}
            </p>
          )}
        </div>
      ) : (
        <WinOverlay
          headline="🎉 പോസ്റ്ററും തോരണങ്ങളും ഭംഗിയായി ഒട്ടിച്ചു! (+30 XP)"
          note="നാട്ടിലെല്ലാവരും കാണുന്ന വിധം വൃത്തിയായി പ്രചാരണ ചുമർ ഒരുങ്ങി!"
          onReplay={reset}
        />
      )}
    </div>
  );
};

/* ============================================================================
 * 2. MADRASA CHALKBOARD DUST-BUSTER & WET-INK AVOIDANCE GAME
 *    Tap chalk dust clouds to clean the classroom board before the bell rings,
 *    while avoiding pulsing wet golden calligraphy ink drops!
 * ========================================================================== */
const DUST_SPOTS = [
  { id: 'd1', x: 18, y: 26, size: 'w-16 h-14' },
  { id: 'd2', x: 50, y: 22, size: 'w-20 h-14' },
  { id: 'd3', x: 82, y: 28, size: 'w-16 h-14' },
  { id: 'd4', x: 22, y: 74, size: 'w-18 h-14' },
  { id: 'd5', x: 52, y: 76, size: 'w-20 h-14' },
  { id: 'd6', x: 80, y: 72, size: 'w-16 h-14' },
];

const WET_INK_TRAPS = [
  { id: 'ink1', x: 34, y: 48 },
  { id: 'ink2', x: 66, y: 48 },
  { id: 'ink3', x: 50, y: 50 },
];

export const ScratchCleanBoardGame: React.FC<HandsOnGameProps> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [wipedIds, setWipedIds] = useState<string[]>(isCompleted ? DUST_SPOTS.map((d) => d.id) : []);
  const [shields, setShields] = useState(3);
  const [won, setWon] = useState(isCompleted);
  const [failed, setFailed] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(22);
  const [tick, setTick] = useState(0);
  const [alertText, setAlertText] = useState<string>('☁️ ചോക്ക് പൊടി മാത്രം തൊട്ട് തുടയ്ക്കൂ! 💧 നനഞ്ഞ സ്വർണ്ണ മഷിയിൽ തൊടരുത്!');

  useEffect(() => {
    if (!started || won || failed) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFailed(true);
          setFailReason('മദ്രസ ബെൽ അടിച്ചു! 22 സെക്കൻഡിനുള്ളിൽ ബോർഡിലെ 6 പൊടിപ്പാടുകളും തുടയ്ക്കണം.');
          sound.playError();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, won, failed]);

  useEffect(() => {
    if (won || failed) return;
    const moveId = window.setInterval(() => {
      setTick((t) => t + 1);
    }, 900);
    return () => window.clearInterval(moveId);
  }, [won, failed]);

  const wipeDust = (id: string) => {
    sound.unlockAudio();
    if (won || failed || wipedIds.includes(id)) return;
    if (!started) setStarted(true);
    const next = [...wipedIds, id];
    setWipedIds(next);
    sound.playSuccess(next.length);
    setAlertText(`🧽 നന്ന്! ${next.length}/${DUST_SPOTS.length} പൊടിപ്പാടുകൾ തുടച്ചു മാറ്റി!`);
    if (next.length >= DUST_SPOTS.length) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `hands_${xpKey}`);
      onComplete?.();
      narrator.speak('മനോഹരം! നനഞ്ഞ മഷി തട്ടാതെ മദ്രസ ബോർഡ് മുഴുവൻ വൃത്തിയായി തിളക്കി!', title);
    }
  };

  const hitWetInk = () => {
    sound.unlockAudio();
    if (won || failed) return;
    if (!started) setStarted(true);
    sound.playError();
    const nextShields = Math.max(0, shields - 1);
    setShields(nextShields);
    setAlertText('💧 അയ്യോ! നനഞ്ഞ കലിഗ്രഫി മഷിയിൽ തൊട്ടു — 1 കവചം പൊട്ടി!');
    if (nextShields <= 0) {
      setFailed(true);
      setFailReason('നനഞ്ഞ മഷിയിൽ 3 തവണ തൊട്ടതിനാൽ ബോർഡിലെ എഴുത്ത് മങ്ങി! വീണ്ടും ശ്രമിക്കാം.');
    }
  };

  const reset = () => {
    sound.playClick();
    setWipedIds([]);
    setShields(3);
    setWon(false);
    setFailed(false);
    setFailReason('');
    setStarted(false);
    setTimeLeft(22);
    setAlertText('☁️ ചോക്ക് പൊടി മാത്രം തൊട്ട് തുടയ്ക്കൂ! 💧 നനഞ്ഞ സ്വർണ്ണ മഷിയിൽ തൊടരുത്!');
  };

  const cleanPct = Math.round((wipedIds.length / DUST_SPOTS.length) * 100);

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 space-y-3 shadow-sm">
      <GameShellHeader
        badge="🧹"
        title={title}
        subtitle={subtitle}
        done={won}
        lives={shields}
        progressText={`🧽 ${wipedIds.length}/${DUST_SPOTS.length} · ⏱️ ${timeLeft}s`}
        logos={[
          { src: OFFICIAL_WING_LOGOS.skimvb.src, alt: OFFICIAL_WING_LOGOS.skimvb.label },
          { src: OFFICIAL_WING_LOGOS.snec.src, alt: OFFICIAL_WING_LOGOS.snec.label },
          { src: OFFICIAL_WING_LOGOS.skjmcc.src, alt: OFFICIAL_WING_LOGOS.skjmcc.label },
        ]}
      />

      <p className="text-[11px] sm:text-xs font-extrabold text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-center">
        {alertText}
      </p>

      <div className="relative rounded-2xl border-4 border-amber-700 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 overflow-hidden min-h-[225px] sm:min-h-[245px] select-none shadow-inner">
        {/* Sparkling Clean Revealed Madrasa Board Facts */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center text-white space-y-2 pointer-events-none">
          <div className="flex items-center justify-center gap-2">
            {[
              OFFICIAL_WING_LOGOS.skimvb,
              OFFICIAL_WING_LOGOS.snec,
              OFFICIAL_WING_LOGOS.albirr_preschool,
              OFFICIAL_WING_LOGOS.skjmcc,
            ].map((lg) => (
              <div
                key={lg.id}
                className="bg-white/95 rounded-lg px-1.5 py-1 shadow-sm flex items-center justify-center"
              >
                <img src={lg.src} alt={lg.label} className="h-7 sm:h-8 w-auto object-contain" />
              </div>
            ))}
          </div>
          <p className="text-sm sm:text-lg font-extrabold text-amber-300">
            1951 SKIMVB · സമസ്ത വിദ്യാഭ്യാസ ബോർഡ്
          </p>
          <p className="text-xs sm:text-sm font-bold text-emerald-100">
            1989 SKSSF · 1993 SKSBV · അൽബിർ · SNEC · 11,000+ മദ്രസകൾ
          </p>
          <p className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-white/15 text-amber-200">
            “വിജ്ഞാനം · വിനയം · സേവനം”
          </p>
        </div>

        {/* Chalk Dust Clouds to Tap & Wipe */}
        {!won &&
          DUST_SPOTS.map((spot) => {
            if (wipedIds.includes(spot.id)) return null;
            return (
              <motion.button
                key={spot.id}
                type="button"
                disabled={failed}
                initial={{ scale: 0.9 }}
                animate={{ scale: [0.96, 1.04, 0.96] }}
                transition={{ duration: 2.1, repeat: Infinity }}
                onClick={() => wipeDust(spot.id)}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                aria-label="ചോക്ക് പൊടി തുടയ്ക്കൂ"
                className={`absolute -translate-x-1/2 -translate-y-1/2 ${spot.size} rounded-full bg-slate-200/95 hover:bg-white border-2 border-slate-400 shadow-lg flex flex-col items-center justify-center cursor-pointer active:scale-90 z-10`}
              >
                <span className="text-xl leading-none">☁️</span>
                <span className="text-[9px] font-extrabold text-slate-700">തുടയ്ക്കൂ</span>
              </motion.button>
            );
          })}

        {/* Moving Wet Calligraphy Ink Drops — DO NOT TOUCH */}
        {!won &&
          !failed &&
          WET_INK_TRAPS.map((ink, idx) => {
            const offsetX = Math.sin((tick + idx * 2) * 0.9) * 10;
            const offsetY = Math.cos((tick + idx) * 0.8) * 14;
            return (
              <motion.button
                key={ink.id}
                type="button"
                animate={{
                  left: `${Math.max(14, Math.min(86, ink.x + offsetX))}%`,
                  top: `${Math.max(20, Math.min(82, ink.y + offsetY))}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                onClick={hitWetInk}
                aria-label="നനഞ്ഞ മഷി — തൊടരുത്"
                className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1.5 rounded-full bg-rose-600/95 hover:bg-rose-500 border-2 border-amber-300 text-white shadow-lg flex items-center gap-0.5 cursor-pointer z-20"
              >
                <span className="text-sm leading-none">💧</span>
                <span className="text-[9px] font-extrabold whitespace-nowrap">മഷി!</span>
              </motion.button>
            );
          })}
      </div>

      <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          style={{ width: `${cleanPct}%` }}
          className={`h-full transition-all duration-200 ${
            failed ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-amber-400'
          }`}
        />
      </div>

      {failed && (
        <FailOverlay
          headline="ബോർഡ് വൃത്തിയാക്കൽ പരാജയപ്പെട്ടു!"
          note={failReason || 'നനഞ്ഞ മഷിയിൽ തൊടാതെ 22 സെക്കൻഡിനുള്ളിൽ 6 പൊടിപ്പാടുകളും തുടയ്ക്കണം!'}
          onRetry={reset}
        />
      )}

      {won && (
        <WinOverlay
          headline="✨ മദ്രസ ബോർഡ് തിളങ്ങി! (+30 XP)"
          note="നനഞ്ഞ കലിഗ്രഫി മഷി തട്ടാതെ പൊടി മുഴുവൻ തുടച്ച് ബോർഡ് വൃത്തിയാക്കി!"
          onReplay={reset}
        />
      )}
    </div>
  );
};

/* ============================================================================
 * 3. WELCOME ARCH (സ്വാഗത കമാനം) PAINTING STUDIO
 *    Pure festive welcome arch painting game — NO inaccurate flag text or EST dates!
 * ========================================================================== */
type ArchPartId = 'arch' | 'pillars' | 'crown' | 'banner' | 'flowers' | 'ribbon';

interface ArchPaintColor {
  id: string;
  label: string;
  fill: string;
  stroke: string;
  swatchBg: string;
}

const PAINT_COLORS: ArchPaintColor[] = [
  { id: 'sky', label: 'ആകാശനീല', fill: '#0284C7', stroke: '#075985', swatchBg: '#E0F2FE' },
  { id: 'maroon', label: 'കടും മെറൂൺ', fill: '#8C1D40', stroke: '#5C1028', swatchBg: '#FCE7F3' },
  { id: 'emerald', label: 'ഇസ്‌ലാമിക് പച്ച', fill: '#059669', stroke: '#065F46', swatchBg: '#D1FAE5' },
  { id: 'gold', label: 'സ്വർണ്ണ മഞ്ഞ', fill: '#D97706', stroke: '#92400E', swatchBg: '#FEF3C7' },
  { id: 'pearl', label: 'തൂവെള്ള', fill: '#F8FAFC', stroke: '#94A3B8', swatchBg: '#F1F5F9' },
  { id: 'mud_spill', label: '⚠️ കരിയും ചെളിയും (വേണ്ട!)', fill: '#44403C', stroke: '#1C1917', swatchBg: '#FEE2E2' },
];

const ARCH_PARTS: {
  id: ArchPartId;
  shortLabel: string;
  guideHint: string;
  presetFill: string;
}[] = [
  { id: 'arch', shortLabel: 'പ്രധാന കമാനം', guideHint: 'കമാനത്തിന്റെ വലിയ വളവ്', presetFill: '#059669' },
  { id: 'pillars', shortLabel: 'രണ്ട് തൂണുകൾ', guideHint: 'ഇടതും വലതും തൂണുകൾ', presetFill: '#D97706' },
  { id: 'crown', shortLabel: 'മുകളിലെ താഴികക്കുടം', guideHint: 'കമാനത്തിന്റെ മുകൾ അലങ്കാരം', presetFill: '#8C1D40' },
  { id: 'banner', shortLabel: 'സ്വാഗത ബോർഡ്', guideHint: 'എല്ലാവർക്കും സ്വാഗതം ഫലകം', presetFill: '#F8FAFC' },
  { id: 'flowers', shortLabel: 'തോരണവും അലങ്കാരവും', guideHint: 'വർണ്ണ തോരണങ്ങൾ', presetFill: '#0284C7' },
  { id: 'ribbon', shortLabel: 'മുദ്രാവാക്യ റിബ്ബൺ', guideHint: 'വിജ്ഞാനം · വിനയം · സേവനം', presetFill: '#D97706' },
];

export const PaintRollerGame: React.FC<HandsOnGameProps> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const isFullscreen = useGameFullscreen();
  const rawUid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const archSkyId = `arch-sky-${rawUid}`;

  const [selectedColor, setSelectedColor] = useState<ArchPaintColor>(PAINT_COLORS[2]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paintedParts, setPaintedParts] = useState<Partial<Record<ArchPartId, string>>>(
    isCompleted
      ? {
          arch: '#059669',
          pillars: '#D97706',
          crown: '#8C1D40',
          banner: '#F8FAFC',
          flowers: '#0284C7',
          ribbon: '#D97706',
        }
      : {}
  );
  const [splashKey, setSplashKey] = useState(0);
  const [won, setWon] = useState(isCompleted);
  const [shields, setShields] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failNote, setFailNote] = useState('');
  const [warnMsg, setWarnMsg] = useState<string | null>(null);

  const paintedCount = Object.keys(paintedParts).length;

  useEffect(() => {
    if (!started || won || failed) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFailed(true);
          setFailNote('ഉദ്ഘാടന സമയം കഴിഞ്ഞു! 30 സെക്കൻഡിനുള്ളിൽ 6 കമാന ഭാഗങ്ങളും ഭംഗിയായി പെയിന്റ് ചെയ്യണം.');
          sound.playError();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, won, failed]);

  const completeArch = () => {
    if (!won) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `hands_${xpKey}`);
      onComplete?.();
      narrator.speak('അതിമനോഹരം! സമ്മേളന സ്വാഗത കമാനം ഭംഗിയായി പെയിന്റ് ചെയ്ത് ഒരുക്കി!', title);
      window.setTimeout(() => scrollToActiveQuiz(), 900);
    }
  };

  const paintRegion = (partId: ArchPartId) => {
    if (won || failed) return;
    sound.unlockAudio();
    if (!started) setStarted(true);
    if (selectedColor.id === 'mud_spill') {
      sound.playError();
      const nextShields = Math.max(0, shields - 1);
      setShields(nextShields);
      setWarnMsg('⚠️ ചെളി നിറം കമാനത്തിൽ അടിക്കരുത്! 1 കവചം പൊട്ടി — നല്ല നിറം തിരഞ്ഞെടുക്കൂ!');
      if (nextShields <= 0) {
        setFailed(true);
        setFailNote('ചെളി നിറം 3 തവണ അടിച്ചതിനാൽ സ്വാഗത കമാനം വൃത്തികേടായി! വീണ്ടും ശ്രമിക്കാം.');
      }
      return;
    }
    setWarnMsg(null);
    sound.playPop();
    setSplashKey((k) => k + 1);
    const next: Partial<Record<ArchPartId, string>> = {
      ...paintedParts,
      [partId]: selectedColor.fill,
    };
    setPaintedParts(next);
    if (Object.keys(next).length >= ARCH_PARTS.length) {
      completeArch();
    }
  };

  const reset = () => {
    sound.playClick();
    setPaintedParts({});
    setSelectedColor(PAINT_COLORS[2]);
    setShields(3);
    setTimeLeft(30);
    setStarted(false);
    setFailed(false);
    setFailNote('');
    setWarnMsg(null);
    setWon(false);
  };

  const getFill = (id: ArchPartId, fallback: string) => paintedParts[id] ?? fallback;

  return (
    <div className={`bg-white rounded-2xl border-2 border-emerald-200 shadow-sm ${isFullscreen ? 'p-2.5 sm:p-3 space-y-2' : 'p-3.5 sm:p-4 space-y-3'}`}>
      {!isFullscreen && (
        <GameShellHeader
          badge="🎨"
          title={title}
          subtitle={subtitle}
          done={won}
          lives={shields}
          progressText={`${paintedCount}/6 · ⏱️ ${timeLeft}s`}
        />
      )}

      {/* Compact Color Bar */}
      <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-950 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white border border-emerald-300 text-xs">
          <span className="w-3.5 h-3.5 rounded-full border border-slate-400" style={{ backgroundColor: selectedColor.fill }} />
          <span>{selectedColor.label}</span>
        </span>
        <div className="flex items-center gap-1.5">
          {isFullscreen && (
            <>
              <GameShatterLives lives={shields} maxLives={3} dark={false} compact />
              <span className="px-2 py-0.5 rounded-lg bg-white border border-emerald-200 text-[11px] tabular-nums">
                ⏱️ {timeLeft}s
              </span>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setSidebarOpen((v) => !v);
            }}
            aria-label="നിറങ്ങൾ"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-800 text-white text-xs font-extrabold"
          >
            {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            <span>🎨</span>
          </button>
        </div>
      </div>

      {warnMsg && !won && !failed && (
        <p className="text-xs font-extrabold text-rose-800 bg-rose-50 border border-rose-300 rounded-xl px-3 py-1.5 text-center">
          {warnMsg}
        </p>
      )}

      {/* UNIFIED SIDE-BY-SIDE STUDIO: Pure Welcome Arch Canvas + Color & Part Sidebar */}
      <div
        className={`grid gap-2.5 items-stretch ${
          sidebarOpen
            ? isFullscreen
              ? 'grid-cols-1 sm:grid-cols-[1fr_255px]'
              : 'grid-cols-1 lg:grid-cols-[1fr_265px]'
            : 'grid-cols-1'
        }`}
      >
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-sky-100 via-amber-50/70 to-emerald-50 p-2 sm:p-3 shadow-inner flex flex-col justify-center overflow-hidden">
          <svg
            viewBox="0 0 640 370"
            className={`w-full h-auto select-none drop-shadow-sm mx-auto ${
              isFullscreen ? 'max-h-[68dvh]' : 'max-h-[370px]'
            }`}
            role="img"
            aria-label="സ്വാഗത കമാനം പെയിന്റ് ചെയ്യാനുള്ള ബോർഡ്"
          >
            <defs>
              <linearGradient id={archSkyId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="55%" stopColor="#064E3B" />
                <stop offset="100%" stopColor="#022C22" />
              </linearGradient>
            </defs>

            {/* Evening Festival Backdrop */}
            <rect x="8" y="8" width="624" height="354" rx="22" fill={`url(#${archSkyId})`} stroke="#F59E0B" strokeWidth="3" />
            <circle cx="58" cy="48" r="2.5" fill="#FDE047" opacity="0.85" />
            <circle cx="582" cy="44" r="3" fill="#FDE047" opacity="0.85" />
            <circle cx="110" cy="72" r="2" fill="#BAE6FD" opacity="0.7" />
            <circle cx="530" cy="70" r="2" fill="#BAE6FD" opacity="0.7" />
            {/* Ground stage floor */}
            <rect x="28" y="318" width="584" height="28" rx="8" fill="#1E293B" stroke="#FBBF24" strokeWidth="1.5" />

            {/* PART 3: TOP CROWN / DOME FINIAL */}
            <g onClick={() => paintRegion('crown')} className="cursor-pointer transition-opacity hover:opacity-95">
              <path
                d="M270 64 Q320 12 370 64 Z"
                fill={getFill('crown', '#CBD5E1')}
                stroke={paintedParts.crown ? '#FDE047' : '#64748B'}
                strokeWidth="2.5"
                strokeDasharray={paintedParts.crown ? undefined : '5 4'}
              />
              <circle cx="320" cy="24" r="6" fill="#FDE047" />
            </g>

            {/* PART 1: OUTER WELCOME ARCH */}
            <g onClick={() => paintRegion('arch')} className="cursor-pointer transition-opacity hover:opacity-95">
              <path
                d="M92 318 L92 150 Q92 56 320 46 Q548 56 548 150 L548 318 L494 318 L494 158 Q494 94 320 86 Q146 94 146 158 L146 318 Z"
                fill={getFill('arch', '#CBD5E1')}
                stroke={paintedParts.arch ? '#FDE047' : '#64748B'}
                strokeWidth={paintedParts.arch ? '3' : '2.5'}
                strokeDasharray={paintedParts.arch ? undefined : '6 4'}
              />
              <text
                x="320"
                y="74"
                textAnchor="middle"
                fill={paintedParts.arch === '#F8FAFC' ? '#0F172A' : '#FEF08A'}
                fontSize="15"
                fontWeight="800"
              >
                ✨ സ്വാഗത കമാനം ✨
              </text>
            </g>

            {/* PART 2: TWIN CARVED PILLARS */}
            <g onClick={() => paintRegion('pillars')} className="cursor-pointer transition-opacity hover:opacity-95">
              <rect
                x="104"
                y="160"
                width="34"
                height="158"
                rx="6"
                fill={getFill('pillars', '#E2E8F0')}
                stroke={paintedParts.pillars ? '#FEF08A' : '#64748B'}
                strokeWidth="2.5"
                strokeDasharray={paintedParts.pillars ? undefined : '5 4'}
              />
              <rect
                x="502"
                y="160"
                width="34"
                height="158"
                rx="6"
                fill={getFill('pillars', '#E2E8F0')}
                stroke={paintedParts.pillars ? '#FEF08A' : '#64748B'}
                strokeWidth="2.5"
                strokeDasharray={paintedParts.pillars ? undefined : '5 4'}
              />
              <rect x="98" y="152" width="46" height="12" rx="4" fill={getFill('pillars', '#CBD5E1')} stroke="#92400E" strokeWidth="1.5" />
              <rect x="496" y="152" width="46" height="12" rx="4" fill={getFill('pillars', '#CBD5E1')} stroke="#92400E" strokeWidth="1.5" />
            </g>

            {/* PART 5: FESTIVE GARLAND / THORANAM */}
            <g onClick={() => paintRegion('flowers')} className="cursor-pointer transition-opacity hover:opacity-95">
              <path
                d="M150 132 Q235 170 320 132 Q405 170 490 132 L490 156 Q405 192 320 156 Q235 192 150 156 Z"
                fill={getFill('flowers', '#CBD5E1')}
                stroke={paintedParts.flowers ? '#FEF08A' : '#64748B'}
                strokeWidth="2"
                strokeDasharray={paintedParts.flowers ? undefined : '5 4'}
              />
              {[180, 225, 275, 365, 415, 460].map((cx) => (
                <circle key={cx} cx={cx} cy="156" r="5" fill="#FDE047" />
              ))}
            </g>

            {/* PART 4: CENTRAL WELCOME BANNER BOARD */}
            <g onClick={() => paintRegion('banner')} className="cursor-pointer transition-opacity hover:opacity-95">
              <rect
                x="182"
                y="186"
                width="276"
                height="90"
                rx="14"
                fill={getFill('banner', '#E2E8F0')}
                stroke={paintedParts.banner ? '#FBBF24' : '#64748B'}
                strokeWidth="3"
                strokeDasharray={paintedParts.banner ? undefined : '6 4'}
              />
              <text
                x="320"
                y="224"
                textAnchor="middle"
                fill={paintedParts.banner === '#F8FAFC' || !paintedParts.banner ? '#064E3B' : '#FFFFFF'}
                fontSize="20"
                fontWeight="900"
              >
                സമ്മേളന നഗരിയിലേക്ക്
              </text>
              <text
                x="320"
                y="255"
                textAnchor="middle"
                fill={paintedParts.banner === '#F8FAFC' || !paintedParts.banner ? '#0284C7' : '#FEF08A'}
                fontSize="17"
                fontWeight="800"
              >
                സ്നേഹപൂർവ്വം സ്വാഗതം!
              </text>
            </g>

            {/* PART 6: MOTTO RIBBON */}
            <g onClick={() => paintRegion('ribbon')} className="cursor-pointer transition-opacity hover:opacity-95">
              <path
                d="M130 294 L510 294 L496 316 L510 338 L130 338 L144 316 Z"
                fill={getFill('ribbon', '#E2E8F0')}
                stroke={paintedParts.ribbon ? '#FEF08A' : '#64748B'}
                strokeWidth="2.5"
                strokeDasharray={paintedParts.ribbon ? undefined : '5 4'}
              />
              <text
                x="320"
                y="322"
                textAnchor="middle"
                fill={paintedParts.ribbon === '#F8FAFC' || !paintedParts.ribbon ? '#0F172A' : '#FFFFFF'}
                fontSize="15"
                fontWeight="900"
              >
                വിജ്ഞാനം · വിനയം · സേവനം
              </text>
            </g>

            {splashKey > 0 && (
              <g key={splashKey}>
                <circle cx="320" cy="210" r="6" fill="#FDE047" opacity="0.7" />
              </g>
            )}
          </svg>
        </div>

        {/* RIGHT SIDEBAR */}
        {sidebarOpen && (
          <aside className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-2.5 flex flex-col gap-2.5 overflow-y-auto max-h-[68dvh]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <p className="text-[11px] font-extrabold text-slate-900">🎨 1. നിറം തിരഞ്ഞെടുക്കൂ:</p>
                <span className="text-[10px] font-bold text-rose-700">ചെളി ഒഴിവാക്കൂ!</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                {PAINT_COLORS.map((c) => {
                  const active = selectedColor.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedColor(c);
                      }}
                      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border-2 transition-all text-left ${
                        active
                          ? 'border-slate-900 shadow-xs ring-2 ring-amber-300'
                          : 'border-slate-200 opacity-90 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.swatchBg, color: '#0F172A' }}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-400 shrink-0 shadow-inner"
                        style={{ backgroundColor: c.fill }}
                      />
                      <span className="leading-tight">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200" />

            <div className="space-y-1.5">
              <p className="text-[11px] font-extrabold text-slate-900">
                🖌️ 2. കമാന ഭാഗങ്ങൾ ({paintedCount}/6):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5">
                {ARCH_PARTS.map((part) => {
                  const fill = paintedParts[part.id];
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => paintRegion(part.id)}
                      className={`px-2.5 py-1.5 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-2 ${
                        fill
                          ? 'bg-white border-emerald-500 shadow-xs'
                          : 'bg-white/95 border-dashed border-slate-400 hover:border-emerald-600'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold text-slate-900 leading-tight">
                          {fill ? '✅ ' : '🖌️ '}
                          {part.shortLabel}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-600 leading-tight mt-0.5">
                          {part.guideHint}
                        </p>
                      </div>
                      <span
                        className="w-4 h-4 rounded-full border border-slate-400 shrink-0"
                        style={{ backgroundColor: fill || '#E2E8F0' }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}
      </div>

      {failed && (
        <FailOverlay
          headline="സ്വാഗത കമാനം പെയിന്റ് ചെയ്യൽ പരാജയപ്പെട്ടു!"
          note={failNote || '30 സെക്കൻഡിനുള്ളിൽ ചെളി നിറം ഒഴിവാക്കി 6 ഭാഗങ്ങളും പെയിന്റ് ചെയ്യണം!'}
          onRetry={reset}
        />
      )}

      {won && (
        <WinOverlay
          headline="🎨 സ്വാഗത കമാനം ഭംഗിയായി പെയിന്റ് ചെയ്തു! (+30 XP)"
          note="സമ്മേളന നഗരിയിലേക്ക് ഏവരെയും വരവേൽക്കുന്ന വർണ്ണാഭമായ സ്വാഗത കമാനം തയ്യാറായി!"
          onReplay={reset}
        />
      )}
    </div>
  );
};

/* ============================================================================
 * 4. VIQAYA MASJID & COURTYARD CLEANING GAME (Drag Trash to Bin / Sweep!)
 * ========================================================================== */
const COURTYARD_LITTER = [
  { id: 'l1', emoji: '🍂', label: 'ഉണങ്ങിയ ഇലകൾ', left: '14%', top: '34%' },
  { id: 'l2', emoji: '🥤', label: 'പ്ലാസ്റ്റിക് കപ്പ്', left: '42%', top: '26%' },
  { id: 'l3', emoji: '📄', label: 'പഴയ കടലാസ്', left: '70%', top: '36%' },
  { id: 'l4', emoji: '🍃', label: 'ചില്ലകളും പൊടിയും', left: '26%', top: '66%' },
  { id: 'l5', emoji: '🧴', label: 'ഒഴിഞ്ഞ കുപ്പി', left: '58%', top: '64%' },
];

export const MasjidCleanSweepGame: React.FC<HandsOnGameProps> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [cleaned, setCleaned] = useState<string[]>(isCompleted ? COURTYARD_LITTER.map((l) => l.id) : []);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [won, setWon] = useState(isCompleted);
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(18);

  useEffect(() => {
    if (!started || won || failed) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFailed(true);
          sound.playError();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, won, failed]);

  const sweepItem = (id: string) => {
    sound.unlockAudio();
    if (won || failed || cleaned.includes(id)) return;
    if (!started) setStarted(true);
    const next = [...cleaned, id];
    setCleaned(next);
    setDraggingId(null);
    sound.playSuccess(next.length);
    if (next.length === COURTYARD_LITTER.length) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `hands_${xpKey}`);
      onComplete?.();
      narrator.speak('മാഷാ അല്ലാഹ്! പള്ളിയും മുറ്റവും വിഖായ കൂട്ടുകാർ വൃത്തിയാക്കി തിളക്കി!', title);
    }
  };

  const reset = () => {
    sound.playClick();
    setCleaned([]);
    setWon(false);
    setFailed(false);
    setStarted(false);
    setTimeLeft(18);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <GameShellHeader
        badge="🧹"
        title={title}
        subtitle={subtitle}
        done={won}
        progressText={`🧹 ${cleaned.length}/${COURTYARD_LITTER.length} · ⏱️ ${timeLeft}s`}
      />

      <div className="relative rounded-2xl border-2 border-emerald-300 bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-50 min-h-[245px] overflow-hidden p-3 select-none">
        <div className="text-center text-lg font-extrabold text-emerald-950 pb-1">
          🕌
        </div>

        {/* Scattered Draggable / Tappable Trash Icon Buttons */}
        {COURTYARD_LITTER.map((item) => {
          const isGone = cleaned.includes(item.id);
          if (isGone) return null;
          return (
            <button
              key={item.id}
              type="button"
              disabled={failed}
              draggable={!failed}
              onDragStart={(e) => {
                sound.unlockAudio();
                if (!started) setStarted(true);
                setDraggingId(item.id);
                e.dataTransfer.setData('text/plain', item.id);
              }}
              onClick={() => sweepItem(item.id)}
              aria-label={item.label}
              title={item.label}
              style={{ left: item.left, top: item.top }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/95 border-2 border-amber-400 shadow-md hover:scale-110 active:scale-95 transition-transform flex items-center justify-center cursor-grab animate-float-bob disabled:opacity-50"
            >
              <span className="text-2xl">{item.emoji}</span>
            </button>
          );
        })}

        {/* Green Viqaya Dustbin Drop Target */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain') || draggingId;
            if (id) sweepItem(id);
          }}
          className="absolute bottom-3 right-3 px-3.5 py-2 rounded-2xl bg-emerald-700 text-white border-2 border-amber-300 shadow-lg flex items-center gap-1.5"
        >
          <span className="text-2xl">🗑️</span>
          <span className="text-xs font-extrabold tabular-nums">{cleaned.length}/5</span>
        </div>

        {won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-emerald-900/20 flex items-center justify-center pointer-events-none"
          >
            <div className="px-4 py-2 rounded-2xl bg-white/95 border-2 border-emerald-500 text-emerald-950 text-sm font-extrabold shadow-lg">
              ✨ മുറ്റം മുഴുവൻ തിളങ്ങി വൃത്തിയായി! ✨
            </div>
          </motion.div>
        )}
      </div>

      {failed && (
        <FailOverlay
          headline="സമയം കഴിഞ്ഞു — മുറ്റത്ത് മാലിന്യം ബാക്കിയുണ്ട്!"
          note="18 സെക്കൻഡിനുള്ളിൽ എല്ലാ 5 മാലിന്യങ്ങളും വേഗം വിഖായ ഗ്രീൻ ബിന്നിലേക്ക് മാറ്റണം!"
          onRetry={reset}
        />
      )}

      {won && (
        <WinOverlay
          headline="🧹 വിഖായ ശുചീകരണ ദൗത്യം വിജയം! (+30 XP)"
          note="“വൃത്തി ഈമാനിന്റെ പകുതിയാണ്” — പള്ളിയും സെന്ററും മനോഹരമായി വൃത്തിയാക്കി!"
          onReplay={reset}
        />
      )}
    </div>
  );
};

/* ============================================================================
 * 5. STAGE SETUP DRAG GAME (Banner + Chairs + Podium Mic!)
 * ========================================================================== */
const STAGE_PARTS = [
  { id: 'banner', emoji: '🏳️', label: 'SKSSF വേദി ബാനർ', spot: 'വേദിയുടെ മുകളിൽ ബാനർ കെട്ടാം' },
  { id: 'chairs', emoji: '🪑', label: 'അതിഥി കസേരകൾ', spot: 'വേദിയിൽ കസേരകൾ അടുക്കി വെക്കാം' },
  { id: 'mic', emoji: '🎙️', label: 'പ്രസംഗ മൈക്ക് & സ്റ്റാൻഡ്', spot: 'പോഡിയത്തിൽ മൈക്ക് ശരിയാക്കാം' },
  { id: 'flowers', emoji: '🪴', label: 'വേദി അലങ്കാര ചെടികൾ', spot: 'മുന്നിൽ പൂച്ചട്ടികൾ വെക്കാം' },
];

export const StageSetupDragGame: React.FC<HandsOnGameProps> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [placed, setPlaced] = useState<string[]>(isCompleted ? STAGE_PARTS.map((p) => p.id) : []);
  const [selected, setSelected] = useState<string | null>(STAGE_PARTS[0].id);
  const [dragging, setDragging] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [won, setWon] = useState(isCompleted);
  const [failed, setFailed] = useState(false);

  const placeItem = (itemId: string, slotId: string) => {
    sound.unlockAudio();
    if (won || failed || placed.includes(slotId)) return;
    if (!itemId) {
      setWrongFlash('⚠️ താഴെ നിന്ന് ഒരു സാധനം ആദ്യം തിരഞ്ഞെടുക്കൂ!');
      return;
    }
    if (itemId !== slotId) {
      sound.playError();
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setWrongFlash('⚠️ തെറ്റായ സ്ഥാനം! തിരഞ്ഞെടുത്ത സാധനം ശരിയായ ഇടത്ത് വെക്കൂ!');
      if (nextMistakes >= 3) {
        setFailed(true);
      }
      return;
    }
    setWrongFlash(null);
    const next = [...placed, slotId];
    setPlaced(next);
    setDragging(null);
    const rem = STAGE_PARTS.find((p) => !next.includes(p.id));
    setSelected(rem ? rem.id : null);
    sound.playSuccess(next.length);
    if (next.length === STAGE_PARTS.length) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `hands_${xpKey}`);
      onComplete?.();
      narrator.speak('ഗംഭീരം! വേദിയിലെ ബാനറും കസേരകളും മൈക്കും ഭംഗിയായി ക്രമീകരിച്ചു!', title);
    }
  };

  const reset = () => {
    sound.playClick();
    setPlaced([]);
    setSelected(STAGE_PARTS[0].id);
    setMistakes(0);
    setWrongFlash(null);
    setWon(false);
    setFailed(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <GameShellHeader
        badge="🎙️ വേദി ക്രമീകരണ ഗെയിം"
        title={title}
        subtitle={subtitle}
        done={won}
        lives={Math.max(0, 3 - mistakes)}
        progressText={`${placed.length}/${STAGE_PARTS.length}`}
        logos={[{ src: OFFICIAL_WING_LOGOS.sargalayam.src, alt: OFFICIAL_WING_LOGOS.sargalayam.label }]}
      />

      {wrongFlash && !won && !failed && (
        <motion.p
          key={mistakes}
          initial={{ x: -8, opacity: 0 }}
          animate={{ x: [0, -6, 6, 0], opacity: 1 }}
          className="text-xs font-extrabold text-rose-800 bg-rose-50 border border-rose-300 rounded-xl px-3 py-2"
        >
          {wrongFlash}
        </motion.p>
      )}

      {/* Interactive Animated Auditorium Stage */}
      <div className="rounded-2xl border-2 border-emerald-800 bg-gradient-to-b from-slate-900 via-emerald-950 to-amber-950/90 p-4 space-y-3 text-white select-none">
        {/* Top Stage Banner Slot */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            placeItem(e.dataTransfer.getData('text/plain') || dragging || selected || '', 'banner');
          }}
          onClick={() => placeItem(selected || '', 'banner')}
          className={`w-full py-2.5 px-3 rounded-xl text-center transition-all cursor-pointer ${
            placed.includes('banner')
              ? 'bg-gradient-to-r from-sky-600 via-emerald-600 to-emerald-700 border-2 border-amber-300 shadow-lg'
              : selected === 'banner'
              ? 'border-2 border-dashed border-amber-400 bg-amber-400/20 ring-2 ring-amber-300'
              : 'border-2 border-dashed border-white/30 bg-white/10'
          }`}
        >
          {placed.includes('banner') ? (
            <div className="flex items-center justify-center gap-2.5">
              <div className="bg-white rounded-md px-1.5 py-0.5 flex items-center shrink-0">
                <img
                  src={OFFICIAL_WING_LOGOS.sargalayam.src}
                  alt={OFFICIAL_WING_LOGOS.sargalayam.label}
                  className="h-7 w-auto object-contain"
                />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-amber-200">
                🚩 SKSSF · സർഗലയ വേദി 🚩
              </p>
            </div>
          ) : (
            <p className="text-2xl">🏳️</p>
          )}
        </div>

        {/* Middle Stage Floor: Chairs + Podium Mic */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              placeItem(e.dataTransfer.getData('text/plain') || dragging || selected || '', 'chairs');
            }}
            onClick={() => placeItem(selected || '', 'chairs')}
            className={`sm:col-span-8 py-4 px-3 rounded-xl text-center transition-all cursor-pointer ${
              placed.includes('chairs')
                ? 'bg-amber-900/60 border-2 border-amber-300'
                : selected === 'chairs'
                ? 'border-2 border-dashed border-amber-400 bg-amber-400/20 ring-2 ring-amber-300'
                : 'border-2 border-dashed border-white/30 bg-white/10'
            }`}
          >
            {placed.includes('chairs') ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                <p className="text-2xl tracking-widest">🪑 🪑 🪑 🪑 🪑</p>
              </motion.div>
            ) : (
              <p className="text-2xl">🪑</p>
            )}
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              placeItem(e.dataTransfer.getData('text/plain') || dragging || selected || '', 'mic');
            }}
            onClick={() => placeItem(selected || '', 'mic')}
            className={`sm:col-span-4 py-4 px-3 rounded-xl text-center transition-all cursor-pointer ${
              placed.includes('mic')
                ? 'bg-emerald-800/80 border-2 border-emerald-300'
                : selected === 'mic'
                ? 'border-2 border-dashed border-amber-400 bg-amber-400/20 ring-2 ring-amber-300'
                : 'border-2 border-dashed border-white/30 bg-white/10'
            }`}
          >
            {placed.includes('mic') ? (
              <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <p className="text-2xl">🎙️🔊</p>
              </motion.div>
            ) : (
              <p className="text-2xl">🎙️</p>
            )}
          </div>
        </div>

        {/* Front Stage Decoration */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            placeItem(e.dataTransfer.getData('text/plain') || dragging || selected || '', 'flowers');
          }}
          onClick={() => placeItem(selected || '', 'flowers')}
          className={`w-full py-2 px-3 rounded-xl text-center transition-all cursor-pointer ${
            placed.includes('flowers')
              ? 'bg-emerald-900/70 border border-emerald-400'
              : selected === 'flowers'
              ? 'border-2 border-dashed border-amber-400 bg-amber-400/20'
              : 'border-2 border-dashed border-white/30 bg-white/10'
          }`}
        >
          {placed.includes('flowers') ? (
            <p className="text-base tracking-widest">🪴 🌸 🪴 🌼 🪴 🌺 🪴</p>
          ) : (
            <p className="text-2xl">🪴</p>
          )}
        </div>
      </div>

      {failed ? (
        <FailOverlay
          headline="വേദി ഒരുക്കൽ തോറ്റു!"
          note="ഓരോ സാധനവും തൊട്ട് തിരഞ്ഞെടുത്ത് കൃത്യമായ സ്ഥലത്ത് തൊടുക!"
          onRetry={reset}
        />
      ) : !won ? (
        <div className="space-y-1.5">
          <div className="grid grid-cols-4 gap-2">
            {STAGE_PARTS.map((p) => {
              const done = placed.includes(p.id);
              const active = selected === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={done}
                  draggable={!done}
                  onDragStart={(e) => {
                    sound.unlockAudio();
                    setDragging(p.id);
                    setSelected(p.id);
                    e.dataTransfer.setData('text/plain', p.id);
                  }}
                  onClick={() => {
                    sound.playClick();
                    setSelected(p.id);
                  }}
                  aria-label={p.label}
                  title={p.label}
                  className={`p-2.5 rounded-xl border-2 flex items-center justify-center transition-all ${
                    done
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-65'
                      : active
                      ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-400'
                  }`}
                >
                  <span className="text-2xl">{done ? '✅' : p.emoji}</span>
                </button>
              );
            })}
          </div>
          {selected && (
            <p className="text-[11px] font-bold text-emerald-900 text-center">
              {STAGE_PARTS.find((p) => p.id === selected)?.emoji}{' '}
              {STAGE_PARTS.find((p) => p.id === selected)?.label}
            </p>
          )}
        </div>
      ) : (
        <WinOverlay
          headline="🎙️ സമ്മേളന വേദി കൃത്യമായി സജ്ജമായി! (+30 XP)"
          note="ബാനറും കസേരകളും മൈക്കും അലങ്കാരവും ഒരുങ്ങി — പരിപാടി തുടങ്ങാം!"
          onReplay={reset}
        />
      )}
    </div>
  );
};

/* ============================================================================
 * 6. UNIT OFFICE ROOM BUILDER & DECORATOR GAME (Drag & Drop Room Items!)
 * ========================================================================== */
const ROOM_ITEMS = [
  { id: 'flag_stand', emoji: '🚩', label: 'SKSSF കൊടി സ്റ്റാൻഡ്', spot: 'ഇടതു മൂലയിൽ കൊടി' },
  { id: 'notice', emoji: '📋', label: 'യൂണിറ്റ് നോട്ടീസ് ബോർഡ്', spot: 'ചുമരിൽ അറിയിപ്പ് ബോർഡ്' },
  { id: 'books', emoji: '📚', label: 'സത്യധാര ലൈബ്രറി ഷെൽഫ്', spot: 'വലതുവശത്ത് പുസ്തക ഷെൽഫ്' },
  { id: 'desk', emoji: '🪑', label: 'ഭാരവാഹി മേശ & കസേര', spot: 'നടുവിൽ ഓഫീസ് മേശ' },
  { id: 'clock', emoji: '🕰️', label: 'ചുമർ ഘടികാരം', spot: 'മുകളിൽ ക്ലോക്ക് വെക്കാം' },
];

export const UnitRoomDecorGame: React.FC<HandsOnGameProps> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [placed, setPlaced] = useState<string[]>(isCompleted ? ROOM_ITEMS.map((r) => r.id) : []);
  const [selected, setSelected] = useState<string | null>(ROOM_ITEMS[0].id);
  const [dragging, setDragging] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [won, setWon] = useState(isCompleted);
  const [failed, setFailed] = useState(false);

  const placeItem = (itemId: string, slotId: string) => {
    sound.unlockAudio();
    if (won || failed || placed.includes(slotId)) return;
    if (!itemId) {
      setWrongFlash('⚠️ താഴെ നിന്ന് ഒരു സാധനം ആദ്യം തിരഞ്ഞെടുക്കൂ!');
      return;
    }
    if (itemId !== slotId) {
      sound.playError();
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setWrongFlash('⚠️ തെറ്റായ ഇടം! ഓഫീസിലെ ശരിയായ സ്ഥാനം നോക്കി വെക്കൂ!');
      if (nextMistakes >= 3) {
        setFailed(true);
      }
      return;
    }
    setWrongFlash(null);
    const next = [...placed, slotId];
    setPlaced(next);
    setDragging(null);
    const rem = ROOM_ITEMS.find((r) => !next.includes(r.id));
    setSelected(rem ? rem.id : null);
    sound.playSuccess(next.length);
    if (next.length === ROOM_ITEMS.length) {
      setWon(true);
      sound.playHoist();
      onAwardXp(35, `hands_${xpKey}`);
      onComplete?.();
      narrator.speak('മനോഹരം! നമ്മുടെ പുതിയ SKSSF യൂണിറ്റ് ഓഫീസ് റൂം പൂർണ്ണമായി ഒരുങ്ങി!', title);
    }
  };

  const reset = () => {
    sound.playClick();
    setPlaced([]);
    setSelected(ROOM_ITEMS[0].id);
    setMistakes(0);
    setWrongFlash(null);
    setWon(false);
    setFailed(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <GameShellHeader
        badge="🏠 യൂണിറ്റ് റൂം അലങ്കാര ഗെയിം"
        title={title}
        subtitle={subtitle}
        done={won}
        lives={Math.max(0, 3 - mistakes)}
        progressText={`${placed.length}/${ROOM_ITEMS.length}`}
      />

      {wrongFlash && !won && !failed && (
        <motion.p
          key={mistakes}
          initial={{ x: -8, opacity: 0 }}
          animate={{ x: [0, -6, 6, 0], opacity: 1 }}
          className="text-xs font-extrabold text-rose-800 bg-rose-50 border border-rose-300 rounded-xl px-3 py-2"
        >
          {wrongFlash}
        </motion.p>
      )}

      <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50 via-white to-amber-50 p-3.5 space-y-2.5 select-none">
        <div className="flex items-center justify-between text-sm font-extrabold text-emerald-950 border-b border-emerald-200 pb-2">
          <span>🏠 SKSSF</span>
          <button
            type="button"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              placeItem(e.dataTransfer.getData('text/plain') || dragging || selected || '', 'clock');
            }}
            onClick={() => placeItem(selected || '', 'clock')}
            className={`px-3 py-1 rounded-lg border-2 text-base font-extrabold ${
              placed.includes('clock')
                ? 'bg-amber-100 border-amber-400 text-amber-950'
                : selected === 'clock'
                ? 'border-dashed border-amber-500 bg-amber-50 animate-pulse'
                : 'border-dashed border-slate-300 bg-white'
            }`}
          >
            {placed.includes('clock') ? '🕰️ ✅' : '🕰️'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['flag_stand', 'notice', 'books'].map((slotId) => {
            const meta = ROOM_ITEMS.find((r) => r.id === slotId)!;
            const done = placed.includes(slotId);
            const active = selected === slotId;
            return (
              <div
                key={slotId}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  placeItem(e.dataTransfer.getData('text/plain') || dragging || selected || '', slotId);
                }}
                onClick={() => placeItem(selected || '', slotId)}
                className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all min-h-[74px] flex flex-col items-center justify-center ${
                  done
                    ? 'bg-emerald-700 text-white border-emerald-900 shadow-md'
                    : active
                    ? 'border-dashed border-amber-500 bg-amber-100/90 ring-2 ring-amber-300'
                    : 'border-dashed border-emerald-400/70 bg-white/80'
                }`}
              >
                <span className="text-2xl">{meta.emoji}</span>
                {done && <span className="text-xs mt-0.5">✅</span>}
              </div>
            );
          })}
        </div>

        {/* Center Office Desk */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            placeItem(e.dataTransfer.getData('text/plain') || dragging || selected || '', 'desk');
          }}
          onClick={() => placeItem(selected || '', 'desk')}
          className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${
            placed.includes('desk')
              ? 'bg-amber-800 text-amber-100 border-amber-950 shadow-md'
              : selected === 'desk'
              ? 'border-dashed border-amber-500 bg-amber-100 ring-2 ring-amber-300'
              : 'border-dashed border-emerald-400/70 bg-white'
          }`}
        >
          <span className="text-2xl">{placed.includes('desk') ? '🪑💻 ✅' : '🪑'}</span>
        </div>
      </div>

      {failed ? (
        <FailOverlay
          headline="ഓഫീസ് ഒരുക്കൽ തോറ്റു!"
          note="ഓരോ സാധനവും കൃത്യമായ ഇടത്ത് വെക്കൂ!"
          onRetry={reset}
        />
      ) : !won ? (
        <div className="space-y-1.5">
          <div className="grid grid-cols-5 gap-1.5">
            {ROOM_ITEMS.map((r) => {
              const done = placed.includes(r.id);
              const active = selected === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  disabled={done}
                  draggable={!done}
                  onDragStart={(e) => {
                    sound.unlockAudio();
                    setDragging(r.id);
                    setSelected(r.id);
                    e.dataTransfer.setData('text/plain', r.id);
                  }}
                  onClick={() => {
                    sound.playClick();
                    setSelected(r.id);
                  }}
                  aria-label={r.label}
                  title={r.label}
                  className={`py-2 rounded-xl border-2 text-2xl flex items-center justify-center transition-all ${
                    done
                      ? 'bg-emerald-50 border-emerald-300 opacity-55'
                      : active
                      ? 'bg-amber-400 border-amber-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  {done ? '✅' : r.emoji}
                </button>
              );
            })}
          </div>
          {selected && (
            <p className="text-[11px] font-bold text-emerald-900 text-center">
              {ROOM_ITEMS.find((r) => r.id === selected)?.emoji}{' '}
              {ROOM_ITEMS.find((r) => r.id === selected)?.label}
            </p>
          )}
        </div>
      ) : (
        <WinOverlay
          headline="🏠 പുതിയ SKSSF യൂണിറ്റ് റൂം ഒരുങ്ങി! (+35 XP)"
          note="കൊടി സ്റ്റാൻഡും സത്യധാര ലൈബ്രറിയും നോട്ടീസ് ബോർഡും ചേർന്ന് മനോഹരമായ ഓഫീസ്!"
          onReplay={reset}
        />
      )}
    </div>
  );
};

/* ============================================================================
 * 7. SAHACHARI / VIQAYA FOOD PACKING & DISTRIBUTION GAME (Drag & Deliver!)
 * ========================================================================== */
const MEAL_ITEMS = [
  { id: 'rice', emoji: '🍛', label: 'ചൂട് ഭക്ഷണപ്പൊതി' },
  { id: 'water', emoji: '💧', label: 'ശുദ്ധജല കുപ്പി' },
  { id: 'dates', emoji: '🌴', label: 'ഈത്തപ്പഴം & പഴം' },
];

export const FoodPackDeliverGame: React.FC<HandsOnGameProps> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [packedInBox, setPackedInBox] = useState<string[]>([]);
  const [deliveredKits, setDeliveredKits] = useState<number>(isCompleted ? 3 : 0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [won, setWon] = useState(isCompleted);
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24);

  useEffect(() => {
    if (!started || won || failed) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFailed(true);
          sound.playError();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, won, failed]);

  const addFoodToBox = (id: string) => {
    sound.unlockAudio();
    if (won || failed || packedInBox.includes(id)) return;
    if (!started) setStarted(true);
    const next = [...packedInBox, id];
    setPackedInBox(next);
    setDraggingId(null);
    sound.playPop();
  };

  const deliverBox = () => {
    if (packedInBox.length < 3 || won || failed) return;
    sound.unlockAudio();
    const nextDelivered = deliveredKits + 1;
    setDeliveredKits(nextDelivered);
    setPackedInBox([]);
    sound.playSuccess(nextDelivered);
    if (nextDelivered >= 3) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `hands_${xpKey}`);
      onComplete?.();
      narrator.speak('സൂപ്പർ! മൂന്ന് സഹചാരി ഭക്ഷണ കിറ്റുകളും പാക്ക് ചെയ്ത് രോഗികൾക്കും കുടുംബങ്ങൾക്കും വിതരണം ചെയ്തു!', title);
    }
  };

  const reset = () => {
    sound.playClick();
    setPackedInBox([]);
    setDeliveredKits(0);
    setWon(false);
    setFailed(false);
    setStarted(false);
    setTimeLeft(24);
  };

  const boxReady = packedInBox.length === 3;

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <GameShellHeader
        badge="🍱"
        title={title}
        subtitle={subtitle}
        done={won}
        progressText={`🍱 ${deliveredKits}/3 · ⏱️ ${timeLeft}s`}
      />

      <div className="grid grid-cols-3 gap-2.5 items-center rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-3 select-none">
        {/* Left: Food Tray */}
        <div className="space-y-2">
          {MEAL_ITEMS.map((item) => {
            const inside = packedInBox.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                disabled={inside || won || failed}
                draggable={!inside && !won && !failed}
                onDragStart={(e) => {
                  sound.unlockAudio();
                  if (!started) setStarted(true);
                  setDraggingId(item.id);
                  e.dataTransfer.setData('text/plain', item.id);
                }}
                onClick={() => addFoodToBox(item.id)}
                aria-label={item.label}
                title={item.label}
                className={`w-full py-2.5 rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                  inside
                    ? 'bg-emerald-50 border-emerald-300 opacity-50'
                    : 'bg-white border-amber-300 hover:border-emerald-500 cursor-grab disabled:opacity-45'
                }`}
              >
                {inside ? '✅' : item.emoji}
              </button>
            );
          })}
        </div>

        {/* Center: Packing Box Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain') || draggingId;
            if (id) addFoodToBox(id);
          }}
          className={`rounded-2xl border-2 border-dashed p-3 text-center space-y-2 transition-all ${
            boxReady
              ? 'border-emerald-600 bg-emerald-100 ring-4 ring-emerald-200'
              : 'border-amber-400 bg-white'
          }`}
        >
          <p className="text-3xl">{boxReady ? '🎁' : '📦'}</p>
          <p className="text-xs font-extrabold text-slate-900 tabular-nums">
            {packedInBox.length}/3
          </p>
          <div className="flex justify-center gap-1 text-lg min-h-[24px]">
            {packedInBox.map((id) => (
              <span key={id}>{MEAL_ITEMS.find((m) => m.id === id)?.emoji}</span>
            ))}
          </div>
          {boxReady && !won && !failed && (
            <motion.button
              type="button"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              onClick={deliverBox}
              aria-label="വിതരണം ചെയ്യൂ"
              className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-lg font-extrabold shadow"
            >
              🚐 ➡️
            </motion.button>
          )}
        </div>

        {/* Right: Delivery Van & Recipients */}
        <div className="rounded-2xl bg-emerald-900 text-white p-3 text-center space-y-2">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-3xl"
          >
            🚐🏥
          </motion.div>
          <div className="flex justify-center gap-1 text-lg">
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < deliveredKits ? 'opacity-100' : 'opacity-30'}>
                🍱
              </span>
            ))}
          </div>
          <p className="text-xs text-amber-300 font-extrabold tabular-nums">
            {deliveredKits}/3
          </p>
        </div>
      </div>

      {failed && (
        <FailOverlay
          headline="സമയം കഴിഞ്ഞു — ഭക്ഷണ കിറ്റുകൾ വൈകി!"
          note="24 സെക്കൻഡിനുള്ളിൽ 3 കിറ്റുകളും വേഗം പാക്ക് ചെയ്ത് വിതരണം ചെയ്യണം — വീണ്ടും ശ്രമിക്കാം!"
          onRetry={reset}
        />
      )}

      {won && (
        <WinOverlay
          headline="🍱 3 സഹചാരി ഭക്ഷണ കിറ്റുകൾ വിതരണം ചെയ്തു! (+30 XP)"
          note="ആശുപത്രിയിലെ കൂട്ടിരിപ്പുകാർക്കും കുടുംബങ്ങൾക്കും സ്നേഹപ്പൊതി എത്തി!"
          onReplay={reset}
        />
      )}
    </div>
  );
};

/* ============================================================================
 * 8. EVENT PHOTO CAPTURE, CROP & EDIT STUDIO GAME (Snap -> Crop -> Filter!)
 * ========================================================================== */
const PHOTO_FILTERS = [
  { id: 'bright', label: '☀️ തെളിഞ്ഞ വെളിച്ചം', css: 'brightness-110 contrast-105' },
  { id: 'warm', label: '🌅 സ്വർണ്ണ പ്രഭ', css: 'sepia-[0.22] saturate-125' },
  { id: 'vivid', label: '🌿 സമ്മേളന വർണ്ണം', css: 'saturate-150 contrast-110' },
];

export const PhotoCropEditGame: React.FC<HandsOnGameProps> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [step, setStep] = useState<'shoot' | 'crop' | 'edit' | 'done'>(isCompleted ? 'done' : 'shoot');
  const [aimX, setAimX] = useState(20);
  const [cropZoom, setCropZoom] = useState(100);
  const [filter, setFilter] = useState(PHOTO_FILTERS[0]);
  const [flash, setFlash] = useState(false);
  const [shotsLeft, setShotsLeft] = useState(3);
  const [shotWarning, setShotWarning] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const inFocusZone = aimX >= 38 && aimX <= 62;

  const takeShot = () => {
    if (failed) return;
    sound.unlockAudio();
    if (!inFocusZone) {
      sound.playError();
      const nextShots = shotsLeft - 1;
      setShotsLeft(nextShots);
      setShotWarning('📸 ഫ്രെയിം തെറ്റി! വേദി കൃത്യം നടുവിലെ പച്ച ഫ്രെയിമിൽ കൊണ്ടുവന്ന് ഫോട്ടോ എടുക്കൂ!');
      if (nextShots <= 0) {
        setFailed(true);
      }
      return;
    }
    setShotWarning(null);
    sound.playPop();
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      setStep('crop');
    }, 260);
  };

  const confirmCrop = () => {
    sound.playSuccess(2);
    setStep('edit');
  };

  const publishPhoto = () => {
    sound.playHoist();
    setStep('done');
    onAwardXp(30, `hands_${xpKey}`);
    onComplete?.();
    narrator.speak('അടിപൊളി! സമ്മേളന ഫോട്ടോ കൃത്യമായി എടുത്ത് ക്രോപ്പ് ചെയ്ത് എഡിറ്റ് ചെയ്തു!', title);
  };

  const reset = () => {
    sound.playClick();
    setStep('shoot');
    setAimX(20);
    setCropZoom(100);
    setFilter(PHOTO_FILTERS[0]);
    setShotsLeft(3);
    setShotWarning(null);
    setFailed(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <GameShellHeader
        badge="📸 ഫോട്ടോ ഷൂട്ട് · ക്രോപ്പ് · എഡിറ്റ്"
        title={title}
        subtitle={subtitle}
        done={step === 'done'}
        progressText={
          step === 'shoot'
            ? `ഘട്ടം 1/3 · 🎞️ ${shotsLeft}/3`
            : step === 'crop'
            ? 'ഘട്ടം 2/3: ക്രോപ്പ് ചെയ്യൂ'
            : step === 'edit'
            ? 'ഘട്ടം 3/3: എഡിറ്റ് ചെയ്യൂ'
            : 'പൂർത്തിയായി ✓'
        }
      />

      {/* Live Animated Camera Viewport */}
      <div className="relative rounded-2xl border-4 border-slate-800 bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 h-52 sm:h-60 overflow-hidden select-none">
        {/* Live Event Scene inside Viewfinder */}
        <div
          style={{
            transform: `scale(${cropZoom / 100}) translateX(${(50 - aimX) * 0.55}%)`,
          }}
          className={`w-full h-full flex flex-col items-center justify-center transition-transform duration-150 ${
            step === 'edit' || step === 'done' ? filter.css : ''
          }`}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center space-y-1.5"
          >
            <p className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-800 text-amber-200 inline-block">
              🚩 SKSSF സമ്മേളന വേദി &amp; അവാർഡ് ദാനം 🚩
            </p>
            <div className="text-4xl sm:text-5xl tracking-wider">🕌 🏆 🎤 💐</div>
            <p className="text-xs font-bold text-slate-800 bg-white/85 px-3 py-1 rounded-lg">
              വിജ്ഞാനം · വിനയം · സേവനം
            </p>
          </motion.div>
        </div>

        {/* Viewfinder / Crop Overlay Frame */}
        <div
          className={`absolute inset-4 rounded-xl pointer-events-none transition-all ${
            step === 'crop'
              ? 'border-4 border-dashed border-amber-400 shadow-[0_0_0_999px_rgba(15,23,42,0.45)]'
              : step === 'shoot' && inFocusZone
              ? 'border-4 border-emerald-500 shadow-[inset_0_0_24px_rgba(16,185,129,0.28)]'
              : 'border-2 border-rose-400/80'
          }`}
        />

        {step === 'shoot' && !failed && (
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow ${
              inFocusZone ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {inFocusZone ? '🎯 ഫ്രെയിം കൃത്യം! ഇപ്പോൾ ക്ലിക്ക് ചെയ്യൂ!' : '↔️ വേദി നടുവിലേക്ക് നീക്കൂ'}
          </div>
        )}

        {flash && <div className="absolute inset-0 bg-white z-20" />}
      </div>

      {shotWarning && !failed && step === 'shoot' && (
        <motion.p
          key={shotsLeft}
          initial={{ x: -8, opacity: 0 }}
          animate={{ x: [0, -6, 6, 0], opacity: 1 }}
          className="text-xs font-extrabold text-rose-800 bg-rose-50 border border-rose-300 rounded-xl px-3 py-2"
        >
          {shotWarning}
        </motion.p>
      )}

      {/* Step Controls */}
      {failed ? (
        <FailOverlay
          headline="3 ഫിലിം ഷോട്ടുകളും ഫ്രെയിം തെറ്റി പാഴായി!"
          note="സ്ലൈഡർ നീക്കി പച്ച 'ഫ്രെയിം കൃത്യം!' അടയാളം തെളിയുമ്പോൾ മാത്രം ഫോട്ടോ എടുക്കൂ!"
          onRetry={reset}
        />
      ) : (
        <>
          {step === 'shoot' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">↔️</span>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={aimX}
                  onChange={(e) => setAimX(Number(e.target.value))}
                  aria-label="ഫ്രെയിം"
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <span className="text-xs font-extrabold tabular-nums">🎞️{shotsLeft}</span>
              </div>
              <button
                type="button"
                onClick={takeShot}
                aria-label="ഫോട്ടോ എടുക്കൂ"
                className={`w-full py-2.5 rounded-xl text-white text-xl font-extrabold inline-flex items-center justify-center gap-2 shadow transition-colors ${
                  inFocusZone ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-slate-700 hover:bg-slate-800'
                }`}
              >
                <Camera className="w-5 h-5" /> 📸
              </button>
            </div>
          )}

          {step === 'crop' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🔍</span>
                <input
                  type="range"
                  min={100}
                  max={135}
                  value={cropZoom}
                  onChange={(e) => setCropZoom(Number(e.target.value))}
                  aria-label="സൂം"
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-extrabold tabular-nums">{cropZoom}%</span>
              </div>
              <button
                type="button"
                onClick={confirmCrop}
                aria-label="ക്രോപ്പ് ഉറപ്പാക്കൂ"
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xl font-extrabold inline-flex items-center justify-center gap-2 shadow"
              >
                <Crop className="w-5 h-5" /> ✂️ ➡️
              </button>
            </div>
          )}

          {step === 'edit' && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {PHOTO_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setFilter(f);
                    }}
                    aria-label={f.label}
                    title={f.label}
                    className={`py-2 rounded-xl text-xl font-extrabold border-2 ${
                      filter.id === f.id
                        ? 'bg-emerald-700 text-white border-emerald-900'
                        : 'bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    {f.label.split(' ')[0]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={publishPhoto}
                aria-label="സേവ് ചെയ്യൂ"
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xl font-extrabold shadow"
              >
                ✨ ✅
              </button>
            </div>
          )}

          {step === 'done' && (
            <WinOverlay
              headline="📸 പരിപാടി ഫോട്ടോ ഷൂട്ട് & എഡിറ്റ് പൂർത്തിയായി! (+30 XP)"
              note="കൃത്യമായി ഫ്രെയിം ചെയ്ത്, ക്രോപ്പ് ചെയ്ത്, തെളിച്ചത്തോടെ എഡിറ്റ് ചെയ്തു!"
              onReplay={reset}
            />
          )}
        </>
      )}
    </div>
  );
};

/* ============================================================================
 * 9. ALBIRR & SKSBV MAJLISUL MA'ARIF TROPHY, GIFT PACKING & REAL CANVAS SCRATCH!
 * ========================================================================== */
const GIFT_SLOTS = [
  { id: 'trophy_sticker', label: 'ഒന്നാം സമ്മാന ട്രോഫി', needHint: 'SKSSF സ്റ്റിക്കർ ഒട്ടിക്കൂ' },
  { id: 'gift_ribbon', label: 'കുട്ടികളുടെ സമ്മാന ബോക്സ്', needHint: 'സ്വർണ്ണ റിബ്ബൺ കെട്ടൂ' },
  { id: 'cert_seal', label: 'അഭിനന്ദന സർട്ടിഫിക്കറ്റ്', needHint: 'മെഴുക് സീൽ വെക്കൂ' },
] as const;

const GIFT_TRAY_ITEMS = [
  { id: 'gift_ribbon', emoji: '🎀', label: 'സ്വർണ്ണ റിബ്ബൺ', isDecoy: false },
  { id: 'decoy_broken', emoji: '🗑️', label: 'കീറിയ പേപ്പർ (വേണ്ട!)', isDecoy: true },
  { id: 'trophy_sticker', emoji: '🏷️', label: 'SKSSF സ്റ്റിക്കർ', isDecoy: false },
  { id: 'decoy_tape', emoji: '🧷', label: 'തുരുമ്പിച്ച പിൻ (വേണ്ട!)', isDecoy: true },
  { id: 'cert_seal', emoji: '🏅', label: 'സ്വർണ്ണ വാക്സ് സീൽ', isDecoy: false },
] as const;

const PrizeArtSvg: React.FC<{ slotId: string; done: boolean }> = ({ slotId, done }) => {
  if (slotId === 'trophy_sticker') {
    return (
      <svg viewBox="0 0 90 90" className="w-16 h-16 mx-auto drop-shadow-sm" aria-hidden="true">
        <path d="M24 18 H66 V38 C66 54 56 62 45 62 C34 62 24 54 24 38 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="2.5" />
        <path d="M24 24 H14 C14 38 18 46 25 46" fill="none" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
        <path d="M66 24 H76 C76 38 72 46 65 46" fill="none" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
        <rect x="40" y="61" width="10" height="12" fill="#B45309" />
        <rect x="26" y="72" width="38" height="10" rx="3" fill="#451A03" />
        {done ? (
          <g>
            <rect x="30" y="29" width="30" height="16" rx="3" fill="#065F46" stroke="#FEF08A" strokeWidth="1.5" />
            <text x="45" y="40" textAnchor="middle" fill="#FEF08A" fontSize="8" fontWeight="900">
              SKSSF
            </text>
          </g>
        ) : (
          <rect x="31" y="30" width="28" height="14" rx="3" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.5" strokeDasharray="3 2" />
        )}
      </svg>
    );
  }
  if (slotId === 'gift_ribbon') {
    return (
      <svg viewBox="0 0 90 90" className="w-16 h-16 mx-auto drop-shadow-sm" aria-hidden="true">
        <rect x="18" y="34" width="54" height="44" rx="6" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2.5" />
        <rect x="14" y="26" width="62" height="12" rx="4" fill="#0284C7" stroke="#075985" strokeWidth="2.2" />
        {done ? (
          <g>
            <rect x="40" y="26" width="10" height="52" fill="#FACC15" />
            <rect x="18" y="51" width="54" height="9" fill="#FACC15" />
            <ellipse cx="36" cy="21" rx="9" ry="6" fill="#F43F5E" />
            <ellipse cx="54" cy="21" rx="9" ry="6" fill="#F43F5E" />
            <circle cx="45" cy="22" r="4" fill="#FACC15" />
          </g>
        ) : (
          <rect x="40" y="26" width="10" height="52" fill="#E0F2FE" opacity="0.55" strokeDasharray="3 2" stroke="#0369A1" />
        )}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 90 90" className="w-16 h-16 mx-auto drop-shadow-sm" aria-hidden="true">
      <rect x="14" y="18" width="62" height="54" rx="5" fill="#FFFBEB" stroke="#065F46" strokeWidth="2.5" />
      <rect x="20" y="24" width="50" height="42" rx="2" fill="none" stroke="#D97706" strokeWidth="1.5" />
      <line x1="27" y1="35" x2="63" y2="35" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="44" x2="60" y2="44" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      {done ? (
        <g>
          <circle cx="56" cy="56" r="10" fill="#DC2626" stroke="#FDE047" strokeWidth="2" />
          <polygon points="56,50 58,54 62,54 59,57 60,61 56,58 52,61 53,57 50,54 54,54" fill="#FEF08A" />
        </g>
      ) : (
        <circle cx="56" cy="56" r="9" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 2" />
      )}
    </svg>
  );
};

const SCRATCH_COLS = 8;
const SCRATCH_ROWS = 4;
const SCRATCH_TARGET_CELLS = Math.ceil(SCRATCH_COLS * SCRATCH_ROWS * 0.65);

const MetallicScratchCard: React.FC<{
  revealed: boolean;
  onRevealed: () => void;
  onClaimVictory: () => void;
  claimed: boolean;
}> = ({ revealed, onRevealed, onClaimVictory, claimed }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const revealedRef = useRef(revealed);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const clearedCellsRef = useRef<Set<string>>(new Set());
  const [pct, setPct] = useState(revealed ? 100 : 0);

  useEffect(() => {
    revealedRef.current = revealed;
    if (revealed) setPct(100);
  }, [revealed]);

  useEffect(() => {
    if (revealed) return;
    clearedCellsRef.current.clear();
    lastPosRef.current = null;
    setPct(0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#B45309');
    grad.addColorStop(0.32, '#F59E0B');
    grad.addColorStop(0.55, '#FEF08A');
    grad.addColorStop(0.8, '#D97706');
    grad.addColorStop(1, '#92400E');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle diagonal foil sheen
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 3;
    for (let i = -120; i < canvas.width + 120; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 70, canvas.height);
      ctx.stroke();
    }

    // Crisp scratch prompt on gold foil
    ctx.fillStyle = '#451A03';
    ctx.font = 'bold 17px "Noto Sans Malayalam", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪙 വിരൽ ഉരച്ച് സ്വർണ്ണ ഫോയിൽ നീക്കൂ!', canvas.width / 2, canvas.height / 2 + 4);
    ctx.font = 'bold 11px "Noto Sans Malayalam", sans-serif';
    ctx.fillStyle = '#78350F';
    ctx.fillText('അടിയിലെ സമ്മാനം കാണാൻ മുഴുവൻ ഉരയ്ക്കൂ ✨', canvas.width / 2, canvas.height / 2 + 24);
  }, [revealed]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 42;
    ctx.beginPath();
    if (lastPosRef.current) {
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.arc(x, y, 21, 0, Math.PI * 2);
    ctx.fill();
    lastPosRef.current = { x, y };

    // Mark real spatial coverage across an 8x4 grid so fast swipes reveal what's underneath
    const cellW = canvas.width / SCRATCH_COLS;
    const cellH = canvas.height / SCRATCH_ROWS;
    const col = Math.floor(x / cellW);
    const row = Math.floor(y / cellH);
    const prevSize = clearedCellsRef.current.size;
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const nc = col + dc;
        const nr = row + dr;
        if (nc >= 0 && nc < SCRATCH_COLS && nr >= 0 && nr < SCRATCH_ROWS) {
          const cx = (nc + 0.5) * cellW;
          const cy = (nr + 0.5) * cellH;
          if (Math.hypot(cx - x, cy - y) <= 30) {
            clearedCellsRef.current.add(`${nc},${nr}`);
          }
        }
      }
    }

    const newSize = clearedCellsRef.current.size;
    if (newSize > prevSize) {
      if (newSize % 4 === 0) sound.playPop();
      const approx = Math.min(100, Math.round((newSize / SCRATCH_TARGET_CELLS) * 100));
      setPct(approx);

      if (approx >= 100 && !revealedRef.current) {
        revealedRef.current = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onRevealed();
      }
    }
  };

  return (
    <div className="space-y-2.5">
      <div
        className={`relative rounded-2xl overflow-hidden border-2 shadow-lg bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950 min-h-[140px] flex items-center justify-center p-4 select-none touch-none transition-all ${
          revealed
            ? 'border-amber-400 ring-4 ring-amber-300/50'
            : 'border-amber-500'
        }`}
      >
        {/* Underlying Golden Prize Certificate — stays permanently visible after scratching! */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 text-white pointer-events-none">
          <div className="bg-white rounded-xl p-1.5 shrink-0 shadow-md border border-amber-300">
            <img
              src={OFFICIAL_WING_LOGOS.albirr_preschool.src}
              alt={OFFICIAL_WING_LOGOS.albirr_preschool.label}
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </div>
          <div className="text-center space-y-1 flex-1 min-w-0">
            <p className="text-[11px] font-black text-amber-300 tracking-wide uppercase">
              🌟 അൽബിർ കിഡ്‌സ് ഫെസ്റ്റ് &amp; SKSBV മജ്‌ലിസുൽ മആരിഫ്
            </p>
            <p className="text-base sm:text-lg font-black text-white leading-snug drop-shadow-xs">
              🏆 മികച്ച വിദ്യാർത്ഥി പ്രതിഭ പുരസ്കാരം! ✨
            </p>
            <p className="text-[11px] font-bold text-emerald-100">
              സുവർണ്ണ സമ്മാന കാർഡ് വിജയകരമായി തുറന്നു · +35 XP
            </p>
          </div>
          <div className="bg-white rounded-xl p-1.5 shrink-0 shadow-md border border-amber-300">
            <img
              src={OFFICIAL_WING_LOGOS.skimvb.src}
              alt={OFFICIAL_WING_LOGOS.skimvb.label}
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </div>
        </div>

        {/* Interactive Gold Foil Scratch Canvas (fades away cleanly instead of hiding the card!) */}
        <canvas
          ref={canvasRef}
          width={420}
          height={144}
          onPointerDown={(e) => {
            if (revealed) return;
            drawingRef.current = true;
            lastPosRef.current = null;
            e.currentTarget.setPointerCapture(e.pointerId);
            scratchAt(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (drawingRef.current && !revealed) scratchAt(e.clientX, e.clientY);
          }}
          onPointerUp={() => {
            drawingRef.current = false;
            lastPosRef.current = null;
          }}
          className={`absolute inset-0 w-full h-full touch-none transition-opacity duration-500 ${
            revealed ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-crosshair'
          }`}
        />
      </div>

      {!revealed ? (
        <div className="flex items-center justify-between text-xs font-extrabold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
          <span>✨ സ്വർണ്ണ ഫോയിൽ വിരൽ കൊണ്ട് ഉരച്ച് അടിയിലെ സമ്മാനം കാണൂ!</span>
          <span className="tabular-nums text-emerald-800">{pct}%</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-emerald-50 border-2 border-emerald-400 p-3 flex flex-wrap items-center justify-between gap-2.5"
        >
          <p className="text-xs sm:text-sm font-extrabold text-emerald-950">
            🎉 സമ്മാനം തെളിഞ്ഞു! മുകളിലെ <span className="text-amber-800">മികച്ച വിദ്യാർത്ഥി പ്രതിഭ പുരസ്കാരം</span> കണ്ടില്ലേ?
          </p>
          {!claimed && (
            <button
              type="button"
              onClick={onClaimVictory}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border-b-4 border-amber-700 text-xs sm:text-sm font-black shadow-md cursor-pointer active:scale-95 transition-transform"
            >
              <span>🏆 സമ്മാനം സ്വീകരിക്കൂ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const TrophyGiftPackGame: React.FC<HandsOnGameProps> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
}) => {
  const stagePaused = useGameStagePaused();
  const stagePortal = useGameStagePortal();

  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [claimedWin, setClaimedWin] = useState(false);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(40);
  const [started, setStarted] = useState(false);
  const [msg, setMsg] = useState<string>(
    '👇 താഴെ നിന്ന് ശരിയായ സ്റ്റിക്കർ/റിബ്ബൺ/സീൽ തിരഞ്ഞെടുത്ത് ശരിയായ സമ്മാനത്തിൽ വെക്കൂ! (അനാവശ്യ സാധനങ്ങൾ ഒഴിവാക്കണം)'
  );

  const won = doneIds.length === 3 && cardRevealed && claimedWin;
  const failed = (lives <= 0 || timeLeft <= 0) && !cardRevealed && !won;

  useEffect(() => {
    if (!started || stagePaused || cardRevealed || won || failed) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          sound.playError();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, stagePaused, cardRevealed, won, failed]);

  const snapTask = (itemId: string | null, slotId: string) => {
    sound.unlockAudio();
    if (failed || won || cardRevealed || doneIds.includes(slotId)) return;
    if (!itemId) {
      setMsg('✨ ആദ്യം താഴത്തെ ട്രേയിൽ നിന്ന് ഒരു സാധനം തൊടൂ!');
      return;
    }
    if (!started) setStarted(true);

    const trayItem = GIFT_TRAY_ITEMS.find((i) => i.id === itemId);
    if (trayItem?.isDecoy || itemId !== slotId) {
      sound.playError();
      setLives((l) => Math.max(0, l - 1));
      setSelected(null);
      setMsg(
        trayItem?.isDecoy
          ? `❌ ${trayItem.label} — ഇത് സമ്മാനത്തിന് യോജിക്കില്ല! (1 കവചം പൊട്ടി)`
          : '❌ തെറ്റായ സ്ഥലത്താണ് വെച്ചത്! ശരിയായ ട്രോഫി/ബോക്സ്/സർട്ടിഫിക്കറ്റ് നോക്കി വെക്കൂ. (1 കവചം പൊട്ടി)'
      );
      return;
    }

    const next = [...doneIds, slotId];
    setDoneIds(next);
    setDragging(null);
    setSelected(null);
    sound.playSuccess(next.length);
    setMsg(
      next.length === 3
        ? '🎉 മൂന്ന് സമ്മാനങ്ങളും ഒരുങ്ങി! ഇനി താഴത്തെ സ്വർണ്ണ സ്ക്രാച്ച് കാർഡ് വിരൽ കൊണ്ട് ഉരച്ച് അടിയിലെ സമ്മാനം കാണൂ!'
        : `✅ മനോഹരം! ബാക്കി ${3 - next.length} എണ്ണം കൂടി പൂർത്തിയാക്കാം.`
    );
  };

  const handleScratchRevealed = () => {
    if (cardRevealed || failed) return;
    setCardRevealed(true);
    sound.playHoist();
    onAwardXp(35, `hands_${xpKey}`);
    narrator.speak(
      'അടിപൊളി! സ്ക്രാച്ച് കാർഡിൽ അൽബിർ കിഡ്‌സ് ഫെസ്റ്റിലെയും SKSBV മജ്‌ലിസുൽ മആരിഫിലെയും മികച്ച വിദ്യാർത്ഥി പ്രതിഭ പുരസ്കാരം തെളിഞ്ഞു!',
      title
    );
  };

  const handleClaimVictory = () => {
    if (claimedWin) return;
    sound.playSuccess(4);
    setClaimedWin(true);
    onComplete?.();
    stagePortal?.notifyStageWin(
      'സ്ക്രാച്ച് കാർഡിൽ തെളിഞ്ഞത്: 🏆 മികച്ച വിദ്യാർത്ഥി പ്രതിഭ പുരസ്കാരം (അൽബിർ കിഡ്‌സ് ഫെസ്റ്റ് & SKSBV മജ്‌ലിസുൽ മആരിഫ്)! (+35 XP)'
    );
  };

  const reset = () => {
    sound.playClick();
    setDoneIds([]);
    setSelected(null);
    setDragging(null);
    setCardRevealed(false);
    setClaimedWin(false);
    setLives(3);
    setTimeLeft(40);
    setStarted(false);
    setMsg('👇 താഴെ നിന്ന് ശരിയായ സ്റ്റിക്കർ/റിബ്ബൺ/സീൽ തിരഞ്ഞെടുത്ത് ശരിയായ സമ്മാനത്തിൽ വെക്കൂ!');
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <GameShellHeader
        badge="🏆 ട്രോഫി · സമ്മാന പാക്കിംഗ് · സ്ക്രാച്ച് കാർഡ്"
        title={title}
        subtitle={subtitle}
        done={cardRevealed}
        lives={lives}
        progressText={`⏱️ ${timeLeft}s · ${doneIds.length + (cardRevealed ? 1 : 0)}/4`}
        logos={[
          { src: OFFICIAL_WING_LOGOS.albirr_preschool.src, alt: OFFICIAL_WING_LOGOS.albirr_preschool.label },
          { src: OFFICIAL_WING_LOGOS.skimvb.src, alt: OFFICIAL_WING_LOGOS.skimvb.label },
        ]}
      />

      {/* Illustrated Gift & Trophy Stage */}
      <div className="grid grid-cols-3 gap-2.5 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-3 select-none">
        {GIFT_SLOTS.map((slot) => {
          const isDone = doneIds.includes(slot.id);
          return (
            <button
              key={slot.id}
              type="button"
              disabled={isDone || failed}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = e.dataTransfer.getData('text/plain') || dragging || selected;
                snapTask(dropped, slot.id);
              }}
              onClick={() => snapTask(selected, slot.id)}
              className={`p-2.5 rounded-xl border-2 text-center transition-all space-y-1 cursor-pointer ${
                isDone
                  ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                  : selected
                  ? 'border-dashed border-amber-500 bg-amber-50 hover:bg-amber-100'
                  : 'border-dashed border-slate-300 bg-white'
              }`}
            >
              <PrizeArtSvg slotId={slot.id} done={isDone} />
              <p className="text-[11px] font-extrabold text-slate-900 leading-tight">{slot.label}</p>
              <p className={`text-[10px] font-bold ${isDone ? 'text-emerald-700' : 'text-amber-800'}`}>
                {isDone ? '✅ തയ്യാർ!' : slot.needHint}
              </p>
            </button>
          );
        })}
      </div>

      {/* Item Tray WITH 2 Decoy Distractors (No auto-snap!) */}
      {doneIds.length < 3 && !failed && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {GIFT_TRAY_ITEMS.map((item) => {
              const done = !item.isDecoy && doneIds.includes(item.id);
              const active = selected === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={done}
                  draggable={!done}
                  onDragStart={(e) => {
                    sound.unlockAudio();
                    if (!started) setStarted(true);
                    setDragging(item.id);
                    setSelected(item.id);
                    e.dataTransfer.setData('text/plain', item.id);
                  }}
                  onClick={() => {
                    sound.playClick();
                    if (!started) setStarted(true);
                    if (item.isDecoy) {
                      sound.playError();
                      setLives((l) => Math.max(0, l - 1));
                      setMsg(`❌ ${item.label} — വേണ്ടാത്ത സാധനം തൊട്ടതിനാൽ 1 കവചം പൊട്ടി!`);
                      return;
                    }
                    setSelected(item.id);
                    setMsg(`✨ തിരഞ്ഞെടുത്തു: ${item.emoji} ${item.label} — ഇനി മുകളിലെ ശരിയായ സമ്മാനത്തിൽ തൊടൂ!`);
                  }}
                  className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    done
                      ? 'bg-emerald-50 border-emerald-300 opacity-45 cursor-default'
                      : active
                      ? 'bg-amber-400 border-amber-700 text-slate-950 scale-[1.03] shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-400 text-slate-800'
                  }`}
                >
                  <span className="text-2xl leading-none">{done ? '✅' : item.emoji}</span>
                  <span className="text-[10px] font-extrabold leading-tight text-center">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-center">
            {msg}
          </p>
        </div>
      )}

      {/* Real HTML5 Canvas Metallic Scratch Card — STAYS VISIBLE AFTER SCRATCHING so the player clearly sees the revealed prize! */}
      {doneIds.length === 3 && !failed && (
        <MetallicScratchCard
          revealed={cardRevealed}
          onRevealed={handleScratchRevealed}
          onClaimVictory={handleClaimVictory}
          claimed={claimedWin}
        />
      )}

      {failed && (
        <FailOverlay
          headline={timeLeft <= 0 ? '⏱️ സമയം തീർന്നു! പരാജയപ്പെട്ടു' : '💥 3 കവചങ്ങളും തകർന്നു! സമ്മാന ഒരുക്കം പരാജയപ്പെട്ടു'}
          note="വേണ്ടാത്ത സാധനങ്ങൾ (🗑️, 🧷) തൊടാതെയും ശരിയായ സമ്മാനത്തിൽ കൃത്യമായ സാധനം വെച്ചും സമയത്തിനുള്ളിൽ പൂർത്തിയാക്കൂ!"
          onRetry={reset}
        />
      )}

      {won && (
        <WinOverlay
          headline="🏆 അൽബിർ & SKSBV ട്രോഫികളും സമ്മാനങ്ങളും സ്ക്രാച്ച് കാർഡും വിജയം! (+35 XP)"
          note="സ്ക്രാച്ച് കാർഡിൽ മികച്ച വിദ്യാർത്ഥി പ്രതിഭ പുരസ്കാരം തെളിഞ്ഞു!"
          onReplay={reset}
        />
      )}
    </div>
  );
};
