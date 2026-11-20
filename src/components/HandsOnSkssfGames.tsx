import React, { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, CheckCircle2, Crop, PanelRightClose, PanelRightOpen, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { useGameFullscreen } from './GameFullscreenShell';

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
}> = ({ headline, note, onReplay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white border-2 border-amber-300 shadow-md flex flex-wrap items-center justify-between gap-2.5"
  >
    <div className="space-y-0.5 min-w-0 flex-1">
      <p className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>{headline}</span>
      </p>
      <p className="text-[11px] sm:text-xs text-emerald-100 font-semibold leading-snug break-words">
        {note}
      </p>
    </div>
    <button
      type="button"
      onClick={onReplay}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shrink-0"
    >
      <RotateCcw className="w-3.5 h-3.5" /> വീണ്ടും കളിക്കാം
    </button>
  </motion.div>
);

const FailOverlay: React.FC<{
  headline: string;
  note: string;
  onRetry: () => void;
}> = ({ headline, note, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.94 }}
    animate={{ opacity: 1, scale: 1 }}
    className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-900 via-red-900 to-rose-950 text-white border-2 border-rose-300 shadow-md flex flex-wrap items-center justify-between gap-2.5"
  >
    <div className="space-y-0.5 min-w-0 flex-1">
      <p className="text-xs sm:text-sm font-extrabold text-amber-300">
        ❌ {headline}
      </p>
      <p className="text-[11px] sm:text-xs text-rose-100 font-semibold leading-snug break-words">
        {note}
      </p>
    </div>
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shrink-0 shadow"
    >
      <RotateCcw className="w-3.5 h-3.5" /> വീണ്ടും ശ്രമിക്കാം
    </button>
  </motion.div>
);

const GameShellHeader: React.FC<{
  badge: string;
  title: string;
  subtitle: string;
  done: boolean;
  progressText: string;
}> = ({ badge, title, subtitle, done, progressText }) => (
  <div className="flex flex-wrap items-center justify-between gap-2">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-950 text-[11px] font-extrabold">
          {badge}
        </span>
        {done && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 text-[11px] font-extrabold">
            <CheckCircle2 className="w-3 h-3" /> ജയിച്ചു!
          </span>
        )}
      </div>
      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 leading-snug break-words">
        {title}
      </h4>
      <p className="text-xs text-slate-600 font-medium leading-snug break-words mt-0.5">
        {subtitle}
      </p>
    </div>
    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-emerald-900 tabular-nums shrink-0">
      {progressText}
    </span>
  </div>
);

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
        progressText={`❤️ ${lives}/3 · ${placed.length}/${POSTER_ITEMS.length}`}
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
                const dragged = e.dataTransfer.getData('text/plain') || draggingId || selectedId || item.id;
                snap(dragged, item.id);
              }}
              onClick={() => snap(selectedId || item.id, item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && snap(selectedId || item.id, item.id)}
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
                <div className="py-1">
                  <span className="text-lg block leading-none">{item.emoji}</span>
                  <span className="text-[10px] sm:text-xs font-extrabold text-slate-800 leading-tight block mt-0.5">
                    {item.slotLabel}
                  </span>
                  {isTarget && (
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
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

      <p className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
        🖌️ {hint}
      </p>

      {failed ? (
        <FailOverlay
          headline="ചുമർ അലങ്കാരം പരാജയപ്പെട്ടു!"
          note="തെറ്റായ സ്ഥലത്ത് 3 തവണ ഒട്ടിച്ചതിനാൽ മാർക്ക് നഷ്ടപ്പെട്ടു. കൃത്യമായ സ്ഥലത്ത് ഒട്ടിക്കാൻ വീണ്ടും ശ്രമിക്കാം!"
          onRetry={reset}
        />
      ) : !won ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  if (active) {
                    snap(item.id, item.id);
                  } else {
                    setSelectedId(item.id);
                  }
                }}
                className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                  done
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-65'
                    : active
                    ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-sm scale-[1.02]'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{item.emoji}</span>
                  {done ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : active && <span>👆</span>}
                </div>
                <p className="text-xs font-extrabold mt-1 leading-snug">{item.label}</p>
              </button>
            );
          })}
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
 * 2. SCRATCH & CLEAN MADRASA BOARD GAME (Real Canvas Rub/Wipe-to-Clean!)
 * ========================================================================== */
export const ScratchCleanBoardGame: React.FC<HandsOnGameProps> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const wipedCellsRef = useRef<Set<string>>(new Set());
  const [cleanPct, setCleanPct] = useState(isCompleted ? 100 : 0);
  const [won, setWon] = useState(isCompleted);
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [brushPos, setBrushPos] = useState<{ x: number; y: number } | null>(null);

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

  const initDustLayer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Chalk dust streaks & smudges
    for (let i = 0; i < 42; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(226,232,240,0.45)' : 'rgba(71,85,105,0.35)';
      ctx.beginPath();
      ctx.arc(
        (i * 47) % canvas.width,
        (i * 31) % canvas.height,
        14 + (i % 4) * 8,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧽 വിരൽ കൊണ്ട് ഉരച്ച് ബോർഡിലെ പൊടി തുടയ്ക്കൂ!', canvas.width / 2, canvas.height / 2);
  };

  useEffect(() => {
    if (!isCompleted) {
      initDustLayer();
    }
  }, [isCompleted]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || won || failed) return;
    if (!started) setStarted(true);
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    setBrushPos({ x: clientX - rect.left, y: clientY - rect.top });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 36, 0, Math.PI * 2);
    ctx.fill();

    // Track 10x5 coverage grid for instant accurate percentage
    const gx = Math.max(0, Math.min(9, Math.floor((x / canvas.width) * 10)));
    const gy = Math.max(0, Math.min(4, Math.floor((y / canvas.height) * 5)));
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx >= 0 && nx < 10 && ny >= 0 && ny < 5) {
          wipedCellsRef.current.add(`${nx}_${ny}`);
        }
      }
    }
    const pct = Math.min(100, Math.round((wipedCellsRef.current.size / 42) * 100));
    if (pct !== cleanPct) {
      setCleanPct(pct);
      if (pct >= 78 && !won) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCleanPct(100);
        setWon(true);
        sound.playHoist();
        onAwardXp(30, `hands_${xpKey}`);
        onComplete?.();
        narrator.speak('മനോഹരം! മദ്രസ ബോർഡ് മുഴുവൻ വൃത്തിയായി തിളങ്ങുന്നു!', title);
      }
    }
  };

  const reset = () => {
    sound.playClick();
    wipedCellsRef.current.clear();
    setCleanPct(0);
    setWon(false);
    setFailed(false);
    setStarted(false);
    setTimeLeft(20);
    setTimeout(initDustLayer, 30);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <GameShellHeader
        badge="🧽 സ്ക്രാച്ച് & ക്ലീൻ ഗെയിം"
        title={title}
        subtitle={subtitle}
        done={won}
        progressText={`വൃത്തി: ${cleanPct}% · ⏱️ ${timeLeft}s`}
      />

      <div className="relative rounded-2xl border-4 border-amber-700 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 overflow-hidden min-h-[215px] sm:min-h-[235px] select-none touch-none shadow-inner">
        {/* Sparkling Clean Revealed Madrasa Board Underneath */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center text-white space-y-2">
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="text-2xl sm:text-3xl"
          >
            🏫 ✨ 🚩
          </motion.div>
          <p className="text-base sm:text-xl font-extrabold text-amber-300">
            സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡ് (1951)
          </p>
          <p className="text-xs sm:text-sm font-bold text-emerald-100">
            11,000+ മദ്രസകൾ · 1989 SKSSF · 1993 SKSBV ബാലവേദി
          </p>
          <p className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-white/15 text-amber-200">
            “വിജ്ഞാനം · വിനയം · സേവനം”
          </p>
        </div>

        {/* Scratch-Off Dust Canvas */}
        {!won && (
          <canvas
            ref={canvasRef}
            width={620}
            height={230}
            onPointerDown={(e) => {
              if (failed) return;
              sound.unlockAudio();
              drawingRef.current = true;
              (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (!drawingRef.current || failed) return;
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              drawingRef.current = false;
              setBrushPos(null);
            }}
            onPointerCancel={() => {
              drawingRef.current = false;
              setBrushPos(null);
            }}
            className={`relative z-10 w-full h-[215px] sm:h-[235px] block ${failed ? 'cursor-not-allowed opacity-70' : 'cursor-crosshair'}`}
          />
        )}

        {brushPos && !won && !failed && (
          <div
            style={{ left: brushPos.x - 18, top: brushPos.y - 18 }}
            className="absolute z-20 pointer-events-none text-3xl drop-shadow"
          >
            🧽
          </div>
        )}
      </div>

      {/* Progress Bar + Quick Brush Helper for Accessibility */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex-1 min-w-[160px] h-3 rounded-full bg-slate-200 overflow-hidden">
          <div
            style={{ width: `${cleanPct}%` }}
            className={`h-full transition-all duration-150 ${
              failed ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-amber-400'
            }`}
          />
        </div>
        {!won && !failed && (
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              sound.playPop();
              if (!started) setStarted(true);
              const nextPct = Math.min(100, cleanPct + 25);
              setCleanPct(nextPct);
              const canvas = canvasRef.current;
              const ctx = canvas?.getContext('2d');
              if (canvas && ctx) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillRect(0, 0, (canvas.width * nextPct) / 100, canvas.height);
              }
              if (nextPct >= 100) {
                setWon(true);
                sound.playHoist();
                onAwardXp(30, `hands_${xpKey}`);
                onComplete?.();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-extrabold"
          >
            🧽 ഡസ്റ്റർ കൊണ്ട് തുടയ്ക്കൂ
          </button>
        )}
      </div>

      {failed && (
        <FailOverlay
          headline="സമയം കഴിഞ്ഞു — ബോർഡ് മുഴുവൻ വൃത്തിയായില്ല!"
          note="ക്ലാസ് തുടങ്ങുന്നതിന് മുൻപ് 20 സെക്കൻഡിനുള്ളിൽ പൊടി മുഴുവൻ തുടയ്ക്കണം — വീണ്ടും ശ്രമിക്കാം!"
          onRetry={reset}
        />
      )}

      {won && (
        <WinOverlay
          headline="✨ മദ്രസ ബോർഡ് തിളങ്ങി! (+30 XP)"
          note="പൊടി മുഴുവൻ തുടച്ച് മദ്രസ ബോർഡ് വൃത്തിയാക്കി!"
          onReplay={reset}
        />
      )}
    </div>
  );
};

/* ============================================================================
 * 3. SAMASTHA (1926) & SKSSF HERITAGE ARCH & EMBLEM COLORING STUDIO
 *    Realistic, creative sculpted SVG signboard with 6 distinct architectural
 *    and official organization emblem parts + 5 authentic paint pots!
 * ========================================================================== */
type EmblemPartId = 'arch' | 'pillars' | 'canton' | 'dome' | 'green_strip' | 'ribbon';

interface EmblemPaintColor {
  id: string;
  label: string;
  fill: string;
  stroke: string;
  swatchBg: string;
}

const PAINT_COLORS: EmblemPaintColor[] = [
  { id: 'sky', label: 'ആകാശനീല (SKSSF)', fill: '#0284C7', stroke: '#075985', swatchBg: '#E0F2FE' },
  { id: 'maroon', label: 'സമസ്ത മെറൂൺ', fill: '#8C1D40', stroke: '#5C1028', swatchBg: '#FCE7F3' },
  { id: 'emerald', label: 'ഇസ്‌ലാമിക് പച്ച', fill: '#059669', stroke: '#065F46', swatchBg: '#D1FAE5' },
  { id: 'gold', label: 'സ്വർണ്ണ മഞ്ഞ', fill: '#D97706', stroke: '#92400E', swatchBg: '#FEF3C7' },
  { id: 'pearl', label: 'തൂവെള്ള (പൈതൃക പ്രതലം)', fill: '#F8FAFC', stroke: '#94A3B8', swatchBg: '#F1F5F9' },
];

const EMBLEM_PARTS: {
  id: EmblemPartId;
  shortLabel: string;
  guideHint: string;
  officialFill: string;
}[] = [
  { id: 'arch', shortLabel: '1926 കമാനം', guideHint: 'സമസ്ത മെറൂൺ / പച്ച', officialFill: '#8C1D40' },
  { id: 'pillars', shortLabel: 'രണ്ട് തൂണുകൾ', guideHint: 'സ്വർണ്ണ മഞ്ഞ / തൂവെള്ള', officialFill: '#D97706' },
  { id: 'canton', shortLabel: 'പതാക & ചന്ദ്രക്കല', guideHint: 'ആകാശനീല / മെറൂൺ', officialFill: '#0284C7' },
  { id: 'dome', shortLabel: 'മസ്ജിദ് & മിനാരം', guideHint: 'തൂവെള്ള / സ്വർണ്ണ മഞ്ഞ', officialFill: '#F8FAFC' },
  { id: 'green_strip', shortLabel: 'പച്ച വരമ്പ് & SKSSF', guideHint: 'ഇസ്‌ലാമിക് പച്ച', officialFill: '#059669' },
  { id: 'ribbon', shortLabel: 'മുദ്രാവാക്യ റിബ്ബൺ', guideHint: 'സ്വർണ്ണ മഞ്ഞ / നീല', officialFill: '#D97706' },
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
  const archCrescentMaskId = `arch-crescent-${rawUid}`;

  const [selectedColor, setSelectedColor] = useState<EmblemPaintColor>(PAINT_COLORS[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paintedParts, setPaintedParts] = useState<Partial<Record<EmblemPartId, string>>>(
    isCompleted
      ? {
          arch: '#8C1D40',
          pillars: '#D97706',
          canton: '#0284C7',
          dome: '#F8FAFC',
          green_strip: '#059669',
          ribbon: '#D97706',
        }
      : {}
  );
  const [lastPaintedLabel, setLastPaintedLabel] = useState<string>(
    'വലതുവശത്തെ സൈഡ് ബാറിൽ നിന്ന് നിറവും ഭാഗവും തിരഞ്ഞെടുത്ത് കമാനത്തിൽ നിറം നൽകൂ!'
  );
  const [splashKey, setSplashKey] = useState(0);
  const [won, setWon] = useState(isCompleted);
  const [failedMsg, setFailedMsg] = useState<string | null>(null);

  const paintedCount = Object.keys(paintedParts).length;

  const evaluateCompletion = (next: Partial<Record<EmblemPartId, string>>) => {
    if (Object.keys(next).length < EMBLEM_PARTS.length) return;
    // Authentic flag accuracy check: Canton must be Sky Blue (SKSSF) or Maroon (Samastha), Green Strip must be Green!
    const validCanton = next.canton === '#0284C7' || next.canton === '#8C1D40';
    const validGreen = next.green_strip === '#059669';
    if (!validCanton || !validGreen) {
      sound.playError();
      setWon(false);
      setFailedMsg(
        !validCanton && !validGreen
          ? 'പതാകയുടെ ചന്ദ്രക്കല ഭാഗത്ത് ആകാശനീല/മെറൂണും താഴെ SKSSF വരമ്പിൽ ഇസ്‌ലാമിക് പച്ചയും നൽകണം!'
          : !validCanton
          ? 'പതാകയുടെ ചന്ദ്രക്കല ഭാഗത്ത് ഔദ്യോഗിക നിറം (ആകാശനീല അല്ലെങ്കിൽ സമസ്ത മെറൂൺ) നൽകണം!'
          : 'താഴെയുള്ള SKSSF വരമ്പിൽ ഔദ്യോഗിക ഇസ്‌ലാമിക് പച്ച നിറം നൽകണം!'
      );
      return;
    }
    setFailedMsg(null);
    if (!won) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `hands_${xpKey}`);
      onComplete?.();
      narrator.speak(
        'വിസ്മയം! സമസ്തയുടെയും എസ് കെ എസ് എസ് എഫിന്റെയും പൈതൃക കമാനവും ഔദ്യോഗിക പതാകയും അതിമനോഹരമായി നിറം നൽകി പൂർത്തിയാക്കി!',
        title
      );
    }
  };

  const paintRegion = (partId: EmblemPartId) => {
    sound.unlockAudio();
    const meta = EMBLEM_PARTS.find((p) => p.id === partId);
    sound.playPop();
    setSplashKey((k) => k + 1);
    const next: Partial<Record<EmblemPartId, string>> = {
      ...paintedParts,
      [partId]: selectedColor.fill,
    };
    setPaintedParts(next);
    setFailedMsg(null);
    if (meta) {
      setLastPaintedLabel(`🖌️ “${meta.shortLabel}” — ${selectedColor.label} നിറം നൽകി!`);
    }
    evaluateCompletion(next);
  };

  const applyOfficialPalette = () => {
    sound.unlockAudio();
    sound.playHoist();
    const official: Partial<Record<EmblemPartId, string>> = {};
    EMBLEM_PARTS.forEach((p) => {
      official[p.id] = p.officialFill;
    });
    setPaintedParts(official);
    setFailedMsg(null);
    setLastPaintedLabel('✨ സമസ്ത (1926) & SKSSF ഔദ്യോഗിക നിറങ്ങൾ മുഴുവൻ ബോർഡിലും തിളങ്ങി!');
    if (!won) {
      setWon(true);
      onAwardXp(30, `hands_${xpKey}`);
      onComplete?.();
    }
  };

  const reset = () => {
    sound.playClick();
    setPaintedParts({});
    setWon(false);
    setFailedMsg(null);
    setLastPaintedLabel('വീണ്ടും ഔദ്യോഗിക നിറങ്ങൾ നൽകി പൈതൃക കമാനവും പതാകയും ഒരുക്കാം!');
  };

  const getFill = (id: EmblemPartId, fallback: string) => paintedParts[id] ?? fallback;

  return (
    <div className={`bg-white rounded-2xl border-2 border-emerald-200 shadow-sm ${isFullscreen ? 'p-2.5 sm:p-3 space-y-2' : 'p-3.5 sm:p-4 space-y-3'}`}>
      {!isFullscreen && (
        <GameShellHeader
          badge="🎨 സമസ്ത & SKSSF ലോഗോ കളറിംഗ് സ്റ്റുഡിയോ"
          title={title}
          subtitle={subtitle}
          done={won}
          progressText={`${paintedCount}/6 ഭാഗങ്ങൾ`}
        />
      )}

      {/* Compact Live Status Strip + Fullscreen Sidebar Toggle */}
      <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] sm:text-xs font-extrabold text-emerald-950 flex flex-wrap items-center justify-between gap-2">
        <span className="leading-snug break-words flex-1 min-w-[140px]">{lastPaintedLabel}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-emerald-300 text-[11px]">
            <span className="w-3 h-3 rounded-full border border-slate-400" style={{ backgroundColor: selectedColor.fill }} />
            <span>{selectedColor.label}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setSidebarOpen((v) => !v);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-800 text-white text-[11px] font-extrabold"
          >
            {sidebarOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span>{sidebarOpen ? 'സൈഡ് ബാർ മറയ്ക്കാം' : '🎨 നിറങ്ങളും ഭാഗങ്ങളും'}</span>
          </button>
        </div>
      </div>

      {/* UNIFIED SIDE-BY-SIDE STUDIO: Arch Canvas + Tightly Coupled Paint & Part Descriptions Sidebar! */}
      <div
        className={`grid gap-2.5 items-stretch ${
          sidebarOpen
            ? isFullscreen
              ? 'grid-cols-1 sm:grid-cols-[1fr_265px]'
              : 'grid-cols-1 lg:grid-cols-[1fr_275px]'
            : 'grid-cols-1'
        }`}
      >
        {/* LEFT: Sculpted Samastha (1926) & Official SKSSF Emblem Arch Canvas */}
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-sky-100 via-amber-50/70 to-emerald-50 p-2 sm:p-3 shadow-inner flex flex-col justify-center overflow-hidden">
          <svg
            viewBox="0 0 640 370"
            className={`w-full h-auto select-none drop-shadow-sm mx-auto ${
              isFullscreen ? 'max-h-[68dvh]' : 'max-h-[370px]'
            }`}
            role="img"
            aria-label="സമസ്ത 1926 & SKSSF പൈതൃക കമാനവും ഔദ്യോഗിക ലോഗോയും കളറിംഗ് ബോർഡ്"
          >
            <defs>
              <linearGradient id="studioSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="55%" stopColor="#064E3B" />
                <stop offset="100%" stopColor="#022C22" />
              </linearGradient>
              {/* Exact Official Flag Crescent Mask: Thick Belly Right, Opening Upper-Left Toward Hoist */}
              <mask id={archCrescentMaskId} maskUnits="userSpaceOnUse" x="-30" y="-30" width="60" height="60">
                <rect x="-36" y="-36" width="72" height="72" fill="black" />
                <circle cx="0" cy="0" r="22" fill="white" />
                <circle cx="-7.5" cy="-6.5" r="18.2" fill="black" />
              </mask>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Warm Heritage Backdrop */}
            <rect x="8" y="8" width="624" height="354" rx="22" fill="url(#studioSky)" stroke="#F59E0B" strokeWidth="3" />
            <circle cx="56" cy="48" r="2.5" fill="#FDE047" opacity="0.8" />
            <circle cx="585" cy="44" r="3" fill="#FDE047" opacity="0.85" />
            <circle cx="102" cy="74" r="1.8" fill="#BAE6FD" opacity="0.7" />
            <circle cx="536" cy="72" r="2" fill="#BAE6FD" opacity="0.7" />
            <rect x="28" y="316" width="584" height="30" rx="8" fill="#1E293B" stroke="#FBBF24" strokeWidth="1.5" />

            {/* PART 1: OUTER 1926 HERITAGE ARCH */}
            <g onClick={() => paintRegion('arch')} className="cursor-pointer transition-opacity hover:opacity-95">
              <path
                d="M92 316 L92 146 Q92 42 320 28 Q548 42 548 146 L548 316 L496 316 L496 154 Q496 86 320 76 Q144 86 144 154 L144 316 Z"
                fill={getFill('arch', '#CBD5E1')}
                stroke={paintedParts.arch ? '#FDE047' : '#64748B'}
                strokeWidth={paintedParts.arch ? '3' : '2.5'}
                strokeDasharray={paintedParts.arch ? undefined : '6 4'}
              />
              <text
                x="320"
                y="58"
                textAnchor="middle"
                fill={paintedParts.arch === '#F8FAFC' ? '#0F172A' : '#FEF08A'}
                fontSize="14"
                fontWeight="800"
              >
                സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ · 1926
              </text>
            </g>

            {/* PART 2: TWIN CARVED PILLARS */}
            <g onClick={() => paintRegion('pillars')} className="cursor-pointer transition-opacity hover:opacity-95">
              <rect
                x="104"
                y="156"
                width="34"
                height="160"
                rx="6"
                fill={getFill('pillars', '#E2E8F0')}
                stroke={paintedParts.pillars ? '#FEF08A' : '#64748B'}
                strokeWidth="2.5"
                strokeDasharray={paintedParts.pillars ? undefined : '5 4'}
              />
              <rect
                x="502"
                y="156"
                width="34"
                height="160"
                rx="6"
                fill={getFill('pillars', '#E2E8F0')}
                stroke={paintedParts.pillars ? '#FEF08A' : '#64748B'}
                strokeWidth="2.5"
                strokeDasharray={paintedParts.pillars ? undefined : '5 4'}
              />
              <rect x="98" y="148" width="46" height="12" rx="4" fill={getFill('pillars', '#CBD5E1')} stroke="#92400E" strokeWidth="1.5" />
              <rect x="496" y="148" width="46" height="12" rx="4" fill={getFill('pillars', '#CBD5E1')} stroke="#92400E" strokeWidth="1.5" />
            </g>

            {/* CENTRAL EMBLEM FRAME (EXACT OFFICIAL SKSSF / SAMASTHA FLAG LAYOUT) */}
            <rect x="166" y="96" width="308" height="184" rx="14" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="3" />

            {/* PART 3: TOP-LEFT FLAG CANTON + EXACT OFFICIAL CRESCENT & STAR (Opening Upper-Left!) */}
            <g onClick={() => paintRegion('canton')} className="cursor-pointer transition-opacity hover:opacity-95">
              <path
                d="M168 110 Q168 98 180 98 L286 98 L286 224 L168 224 Z"
                fill={getFill('canton', '#CBD5E1')}
                stroke={paintedParts.canton ? '#FFFFFF' : '#64748B'}
                strokeWidth="2"
                strokeDasharray={paintedParts.canton ? undefined : '5 4'}
              />
              {/* Official Crescent (Belly Bottom-Right, Opening Upper-Left) + 5-Pointed Star Nestled Inside */}
              <g transform="translate(232, 164)">
                <circle
                  cx="0"
                  cy="0"
                  r="22"
                  fill={paintedParts.canton === '#F8FAFC' ? '#0284C7' : '#FFFFFF'}
                  mask={`url(#${archCrescentMaskId})`}
                  filter={won ? 'url(#softGlow)' : undefined}
                />
                <polygon
                  points="-9,-16 -6.8,-10.2 -0.5,-10 -5.4,-6.3 -3.6,-0.2 -9,-3.8 -14.4,-0.2 -12.6,-6.3 -17.5,-10 -11.2,-10.2"
                  fill={paintedParts.canton === '#F8FAFC' ? '#D97706' : '#FFFFFF'}
                />
              </g>
            </g>

            {/* PART 4: TOP-RIGHT WHITE FIELD + OFFICIAL LEFT MINARET & RIBBED ONION MOSQUE DOME */}
            <g onClick={() => paintRegion('dome')} className="cursor-pointer transition-opacity hover:opacity-95">
              <path
                d="M286 98 L460 98 Q472 98 472 110 L472 224 L286 224 Z"
                fill={getFill('dome', '#E2E8F0')}
                stroke={paintedParts.dome ? '#CBD5E1' : '#64748B'}
                strokeWidth="2"
                strokeDasharray={paintedParts.dome ? undefined : '5 4'}
              />
              {/* Exact Official Single Left Tall Minaret & Ribbed Onion Dome */}
              <g
                transform="translate(324, 114)"
                fill="none"
                stroke={paintedParts.dome === '#059669' || paintedParts.dome === '#8C1D40' ? '#FEF08A' : '#0F172A'}
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="6" y="18" width="10" height="76" fill="#FFFFFF" />
                <line x1="6" y1="34" x2="16" y2="34" />
                <line x1="6" y1="52" x2="16" y2="52" />
                <line x1="6" y1="70" x2="16" y2="70" />
                <path d="M 5,18 C 5,10 17,10 17,18 Z" fill="#0F172A" />
                <line x1="11" y1="4" x2="11" y2="11" />
                {/* Ribbed Onion Dome */}
                <path d="M 22,80 C 24,44 56,34 62,20 C 68,34 100,44 102,80 Z" fill="#FFFFFF" />
                <path d="M 62,20 L 62,80" />
                <path d="M 62,20 C 51,42 49,58 49,80" />
                <path d="M 62,20 C 73,42 75,58 75,80" />
                <path d="M 34,50 Q 62,56 90,50" />
                <path d="M 26,65 Q 62,71 98,65" />
                {/* Spire Crescent */}
                <line x1="62" y1="9" x2="62" y2="20" />
                <path d="M 59,6 A 5,5 0 1,0 65,6 A 3.8,3.8 0 1,1 59,6 Z" fill="#0F172A" />
                {/* Base */}
                <path d="M 18,80 L 106,80 L 110,94 L 14,94 Z" fill="#FFFFFF" />
              </g>
            </g>

            {/* PART 5: LOWER GREEN BAND & SKSSF 1989 BADGE */}
            <g onClick={() => paintRegion('green_strip')} className="cursor-pointer transition-opacity hover:opacity-95">
              <path
                d="M168 224 L472 224 L472 266 Q472 278 460 278 L180 278 Q168 278 168 266 Z"
                fill={getFill('green_strip', '#CBD5E1')}
                stroke={paintedParts.green_strip ? '#A7F3D0' : '#64748B'}
                strokeWidth="2"
                strokeDasharray={paintedParts.green_strip ? undefined : '5 4'}
              />
              <text
                x="320"
                y="257"
                textAnchor="middle"
                fill={paintedParts.green_strip === '#F8FAFC' ? '#065F46' : '#FFFFFF'}
                fontSize="19"
                fontWeight="900"
                letterSpacing="1.8"
              >
                SKSSF · EST. 1989
              </text>
            </g>

            {/* PART 6: MOTTO RIBBON */}
            <g onClick={() => paintRegion('ribbon')} className="cursor-pointer transition-opacity hover:opacity-95">
              <path
                d="M126 292 L514 292 L500 314 L514 336 L126 336 L140 314 Z"
                fill={getFill('ribbon', '#E2E8F0')}
                stroke={paintedParts.ribbon ? '#FEF08A' : '#64748B'}
                strokeWidth="2.5"
                strokeDasharray={paintedParts.ribbon ? undefined : '5 4'}
              />
              <text
                x="320"
                y="320"
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
                <circle cx="320" cy="184" r="6" fill="#FDE047" opacity="0.7" />
              </g>
            )}
          </svg>
        </div>

        {/* RIGHT SIDEBAR: Paint Pots + Part Descriptions Right Next to Each Other! */}
        {sidebarOpen && (
          <aside className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-2.5 flex flex-col gap-2.5 overflow-y-auto max-h-[68dvh]">
            {/* 1. Paint Colors right at top of sidebar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <p className="text-[11px] font-extrabold text-slate-900">🎨 1. നിറം തിരഞ്ഞെടുക്കൂ:</p>
                <button
                  type="button"
                  onClick={applyOfficialPalette}
                  className="px-2 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-extrabold whitespace-nowrap"
                >
                  ✨ ഔദ്യോഗിക നിറം
                </button>
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

            {/* 2. Part Descriptions & Direct Tap-to-Paint RIGHT BELOW Colors in same sidebar */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-extrabold text-slate-900">
                🖌️ 2. കമാനത്തിന്റെ ഭാഗങ്ങൾ ({paintedCount}/6):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5">
                {EMBLEM_PARTS.map((part) => {
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

      {failedMsg && (
        <FailOverlay
          headline="ഔദ്യോഗിക പതാകാ നിറങ്ങൾ ശരിയായില്ല!"
          note={failedMsg}
          onRetry={reset}
        />
      )}

      {won && (
        <WinOverlay
          headline="🎨 സമസ്ത (1926) & SKSSF പൈതൃക ലോഗോയും കമാനവും തിളങ്ങി! (+30 XP)"
          note="വിജ്ഞാനം · വിനയം · സേവനം — ഔദ്യോഗിക നിറങ്ങളോടെ പൈതൃക ബോർഡ് മനോഹരമായി!"
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
        badge="🧹 വിഖായ വൃത്തിയാക്കൽ ഗെയിം"
        title={title}
        subtitle={subtitle}
        done={won}
        progressText={`വൃത്തിയാക്കിയത്: ${cleaned.length}/${COURTYARD_LITTER.length} · ⏱️ ${timeLeft}s`}
      />

      <div className="relative rounded-2xl border-2 border-emerald-300 bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-50 min-h-[245px] overflow-hidden p-3 select-none">
        {/* Sunlit Mosque Header Silhouette */}
        <div className="text-center text-xs sm:text-sm font-extrabold text-emerald-950 pb-2">
          🕌 പള്ളി &amp; ഇസ്‌ലാമിക് സെന്റർ മുറ്റം — 18 സെക്കൻഡിനുള്ളിൽ മാലിന്യങ്ങൾ പച്ച ഡസ്റ്റ്ബിന്നിലേക്ക് മാറ്റൂ!
        </div>

        {/* Scattered Draggable / Tappable Trash Items */}
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
              style={{ left: item.left, top: item.top }}
              className="absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-white/95 border-2 border-amber-400 shadow-md hover:scale-110 active:scale-95 transition-transform flex items-center gap-1 cursor-grab animate-float-bob disabled:opacity-50"
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-800">{item.label}</span>
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
          className="absolute bottom-3 right-3 px-4 py-2.5 rounded-2xl bg-emerald-700 text-white border-2 border-amber-300 shadow-lg flex items-center gap-2"
        >
          <span className="text-2xl">🗑️</span>
          <div className="text-left">
            <p className="text-xs font-extrabold">വിഖായ ഗ്രീൻ ബിൻ</p>
            <p className="text-[10px] text-emerald-100">ഇവിടെ വലിച്ചിടൂ ({cleaned.length}/5)</p>
          </div>
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
        progressText={`${placed.length}/${STAGE_PARTS.length} · ${'❤️'.repeat(Math.max(0, 3 - mistakes))}${'💔'.repeat(mistakes)}`}
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
            <p className="text-xs sm:text-sm font-extrabold text-amber-200">
              🚩 SKSSF കൗൺസിൽ &amp; സമ്മേളന വേദി · വിജ്ഞാനം · വിനയം · സേവനം 🚩
            </p>
          ) : (
            <p className="text-xs font-bold text-amber-100">🏳️ ഇവിടെ സ്റ്റേജ് ബാനർ വലിച്ചിടൂ / തൊടൂ</p>
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
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-1">
                <p className="text-2xl tracking-widest">🪑 🪑 🪑 🪑 🪑</p>
                <p className="text-[11px] font-bold text-amber-200">അതിഥി കസേരകൾ വരിയായി അടുക്കി!</p>
              </motion.div>
            ) : (
              <p className="text-xs font-bold text-amber-100">🪑 ഇവിടെ കസേരകൾ അടുക്കി വെക്കൂ</p>
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
                <p className="text-[11px] font-bold text-emerald-200">മൈക്ക് ചെക്ക് OK!</p>
              </motion.div>
            ) : (
              <p className="text-xs font-bold text-amber-100">🎙️ പോഡിയം മൈക്ക് ഇവിടെ</p>
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
            <p className="text-xs font-bold text-amber-100">🪴 മുന്നിൽ പൂച്ചട്ടികൾ വെക്കൂ</p>
          )}
        </div>
      </div>

      {failed ? (
        <FailOverlay
          headline="3 തവണ തെറ്റായ സ്ഥാനത്ത് വെച്ചു — വേദി ഒരുക്കൽ തോറ്റു!"
          note="ഓരോ സാധനവും തിരഞ്ഞെടുത്ത് കൃത്യമായ സ്ഥാനത്ത് വലിച്ചിടുകയോ തൊടുകയോ ചെയ്യൂ!"
          onRetry={reset}
        />
      ) : !won ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                  done
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-65'
                    : active
                    ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-400'
                }`}
              >
                <span className="text-xl">{p.emoji}</span>
                <p className="text-xs font-extrabold mt-1">{p.label}</p>
              </button>
            );
          })}
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
        progressText={`${placed.length}/${ROOM_ITEMS.length} · ${'❤️'.repeat(Math.max(0, 3 - mistakes))}${'💔'.repeat(mistakes)}`}
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

      <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50 via-white to-amber-50 p-4 space-y-3 select-none">
        <div className="flex items-center justify-between text-xs font-extrabold text-emerald-950 border-b border-emerald-200 pb-2">
          <span>🏠 SKSSF യൂണിറ്റ് കാര്യാലയം (Unit Office Room)</span>
          <button
            type="button"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              placeItem(e.dataTransfer.getData('text/plain') || dragging || selected || '', 'clock');
            }}
            onClick={() => placeItem(selected || '', 'clock')}
            className={`px-2.5 py-1 rounded-lg border-2 text-xs font-extrabold ${
              placed.includes('clock')
                ? 'bg-amber-100 border-amber-400 text-amber-950'
                : selected === 'clock'
                ? 'border-dashed border-amber-500 bg-amber-50 animate-pulse'
                : 'border-dashed border-slate-300 bg-white'
            }`}
          >
            {placed.includes('clock') ? '🕰️ 10:00 AM കൃത്യനിഷ്ഠ' : '🕰️ ക്ലോക്ക് ഇവിടെ'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                className={`p-3.5 rounded-xl border-2 text-center cursor-pointer transition-all min-h-[92px] flex flex-col items-center justify-center ${
                  done
                    ? 'bg-emerald-700 text-white border-emerald-900 shadow-md'
                    : active
                    ? 'border-dashed border-amber-500 bg-amber-100/90 ring-2 ring-amber-300'
                    : 'border-dashed border-emerald-400/70 bg-white/80'
                }`}
              >
                <span className="text-2xl">{meta.emoji}</span>
                <p className="text-xs font-extrabold mt-1">
                  {done ? meta.label : meta.spot}
                </p>
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
          className={`p-3.5 rounded-xl border-2 text-center cursor-pointer transition-all ${
            placed.includes('desk')
              ? 'bg-amber-800 text-amber-100 border-amber-950 shadow-md'
              : selected === 'desk'
              ? 'border-dashed border-amber-500 bg-amber-100 ring-2 ring-amber-300'
              : 'border-dashed border-emerald-400/70 bg-white'
          }`}
        >
          {placed.includes('desk') ? (
            <p className="text-xs sm:text-sm font-extrabold">
              🪑💻 പ്രസിഡന്റ് · സെക്രട്ടറി · ട്രഷറർ മേശ &amp; മിനിറ്റ്സ് ബുക്ക് തയ്യാർ!
            </p>
          ) : (
            <p className="text-xs font-extrabold text-slate-700">🪑 നടുവിൽ ഓഫീസ് മേശ &amp; കസേര വെക്കൂ</p>
          )}
        </div>
      </div>

      {failed ? (
        <FailOverlay
          headline="3 തവണ തെറ്റായ സ്ഥാനത്ത് വെച്ചു — ഓഫീസ് ഒരുക്കൽ തോറ്റു!"
          note="ഓരോ സാധനവും തിരഞ്ഞെടുത്ത് കൃത്യമായ ഓഫീസ് ഇടത്ത് വെക്കൂ — വീണ്ടും ശ്രമിക്കാം!"
          onRetry={reset}
        />
      ) : !won ? (
        <div className="flex flex-wrap gap-2">
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
                className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  done
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-60'
                    : active
                    ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-400'
                }`}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            );
          })}
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
        badge="🍱 സഹചാരി ഭക്ഷണ പാക്കിംഗ് & വിതരണം"
        title={title}
        subtitle={subtitle}
        done={won}
        progressText={`വിതരണം: ${deliveredKits}/3 · ⏱️ ${timeLeft}s`}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-4 select-none">
        {/* Left: Food Tray */}
        <div className="md:col-span-4 space-y-2">
          <p className="text-[11px] font-extrabold text-amber-900">1. 24 സെക്കൻഡിനുള്ളിൽ 3 കിറ്റ് പാക്ക് ചെയ്യൂ:</p>
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
                className={`w-full p-2.5 rounded-xl border-2 text-left flex items-center gap-2 text-xs font-extrabold transition-all ${
                  inside
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-55'
                    : 'bg-white border-amber-300 hover:border-emerald-500 text-slate-900 cursor-grab disabled:opacity-45'
                }`}
              >
                <span className="text-xl">{item.emoji}</span>
                <span>{item.label}</span>
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
          className={`md:col-span-4 rounded-2xl border-2 border-dashed p-4 text-center space-y-2 transition-all ${
            boxReady
              ? 'border-emerald-600 bg-emerald-100 ring-4 ring-emerald-200'
              : 'border-amber-400 bg-white'
          }`}
        >
          <p className="text-3xl">{boxReady ? '🎁' : '📦'}</p>
          <p className="text-xs font-extrabold text-slate-900">
            സഹചാരി ഭക്ഷണ ബോക്സ് ({packedInBox.length}/3)
          </p>
          <div className="flex justify-center gap-1.5 text-xl min-h-[28px]">
            {packedInBox.map((id) => (
              <span key={id}>{MEAL_ITEMS.find((m) => m.id === id)?.emoji}</span>
            ))}
          </div>
          {boxReady && !won && !failed && (
            <motion.button
              type="button"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              onClick={deliverBox}
              className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow"
            >
              🚐 ആശുപത്രിയിലേക്ക് വിതരണം ചെയ്യൂ →
            </motion.button>
          )}
        </div>

        {/* Right: Delivery Van & Recipients */}
        <div className="md:col-span-4 rounded-2xl bg-emerald-900 text-white p-4 text-center space-y-2">
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-4xl"
          >
            🚐🏥
          </motion.div>
          <p className="text-xs font-extrabold text-amber-300">സഹചാരി വിതരണ വാഹനം</p>
          <div className="flex justify-center gap-1.5 text-xl">
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < deliveredKits ? 'opacity-100' : 'opacity-30'}>
                🍱
              </span>
            ))}
          </div>
          <p className="text-[11px] text-emerald-100 font-semibold">
            {deliveredKits}/3 കുടുംബങ്ങൾക്ക് എത്തിച്ചു!
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
            <div className="space-y-2.5">
              <label className="block text-xs font-extrabold text-slate-700">
                🎯 ക്യാമറ നടുവിലെ പച്ച ഫ്രെയിമിലേക്ക് നീക്കി ഷട്ടർ അമർത്തൂ (ബാക്കി ഫിലിം: {shotsLeft}/3):
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={aimX}
                  onChange={(e) => setAimX(Number(e.target.value))}
                  className="w-full mt-1 accent-emerald-700 cursor-pointer"
                />
              </label>
              <button
                type="button"
                onClick={takeShot}
                className={`w-full py-2.5 rounded-xl text-white text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 shadow transition-colors ${
                  inFocusZone ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-slate-700 hover:bg-slate-800'
                }`}
              >
                <Camera className="w-4 h-4" /> 📸 ഫോട്ടോ എടുക്കൂ!
              </button>
            </div>
          )}

          {step === 'crop' && (
            <div className="space-y-2.5">
              <label className="block text-xs font-extrabold text-slate-700">
                ✂️ ഫോട്ടോ കൃത്യമായി ക്രോപ്പ് / സൂം ചെയ്യൂ ({cropZoom}%):
                <input
                  type="range"
                  min={100}
                  max={135}
                  value={cropZoom}
                  onChange={(e) => setCropZoom(Number(e.target.value))}
                  className="w-full mt-1 accent-amber-500 cursor-pointer"
                />
              </label>
              <button
                type="button"
                onClick={confirmCrop}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 shadow"
              >
                <Crop className="w-4 h-4" /> ✂️ ക്രോപ്പ് ഉറപ്പാക്കൂ → എഡിറ്റ് ചെയ്യാം
              </button>
            </div>
          )}

          {step === 'edit' && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap gap-2">
                {PHOTO_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setFilter(f);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 ${
                      filter.id === f.id
                        ? 'bg-emerald-700 text-white border-emerald-900'
                        : 'bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={publishPhoto}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow"
              >
                ✨ എഡിറ്റ് പൂർത്തിയാക്കി മീഡിയയിൽ സേവ് ചെയ്യൂ!
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
 * 9. MADRASA TROPHY STICKER, GIFT PACKING & SCRATCH-TO-WIN GAME!
 * ========================================================================== */
const GIFT_TASKS = [
  { id: 'trophy_sticker', emoji: '🏷️', label: 'ട്രോഫിയിൽ SKSSF സ്റ്റിക്കർ ഒട്ടിക്കാം', target: '🏆 ഒന്നാം സമ്മാന ട്രോഫി' },
  { id: 'gift_ribbon', emoji: '🎀', label: 'സമ്മാനപ്പൊതിയിൽ റിബ്ബൺ കെട്ടാം', target: '🎁 കുട്ടികളുടെ സമ്മാന ബോക്സ്' },
  { id: 'cert_seal', emoji: '🌟', label: 'സർട്ടിഫിക്കറ്റിൽ സ്വർണ്ണ സീൽ വെക്കാം', target: '📜 മദ്രസ അഭിനന്ദന പത്രം' },
];

export const TrophyGiftPackGame: React.FC<HandsOnGameProps> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [doneIds, setDoneIds] = useState<string[]>(isCompleted ? GIFT_TASKS.map((t) => t.id) : []);
  const [selected, setSelected] = useState<string | null>(GIFT_TASKS[0].id);
  const [dragging, setDragging] = useState<string | null>(null);
  const [scratched, setScratched] = useState(isCompleted);
  const [scratchProgress, setScratchProgress] = useState(isCompleted ? 100 : 0);
  const [lives, setLives] = useState(3);
  const failed = lives === 0 && !scratched;
  const won = doneIds.length === 3 && scratched;

  const snapTask = (itemId: string, slotId: string) => {
    sound.unlockAudio();
    if (failed || won || doneIds.includes(slotId)) return;
    if (itemId !== slotId) {
      sound.playError();
      setLives((l) => Math.max(0, l - 1));
      return;
    }
    const next = [...doneIds, slotId];
    setDoneIds(next);
    setDragging(null);
    const rem = GIFT_TASKS.find((g) => !next.includes(g.id));
    setSelected(rem ? rem.id : null);
    sound.playSuccess(next.length);
  };

  const rubScratchCard = () => {
    if (scratched || doneIds.length < 3 || failed) return;
    sound.unlockAudio();
    const next = Math.min(100, scratchProgress + 35);
    setScratchProgress(next);
    sound.playPop();
    if (next >= 100) {
      setScratched(true);
      sound.playHoist();
      onAwardXp(35, `hands_${xpKey}`);
      onComplete?.();
      narrator.speak('അടിപൊളി! മദ്രസയിലെ കുട്ടികൾക്കുള്ള ട്രോഫിയും സമ്മാനങ്ങളും സ്ക്രാച്ച് കാർഡും തയ്യാറായി!', title);
    }
  };

  const reset = () => {
    sound.playClick();
    setDoneIds([]);
    setSelected(GIFT_TASKS[0].id);
    setScratched(false);
    setScratchProgress(0);
    setLives(3);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <GameShellHeader
        badge="🏆 ട്രോഫി സ്റ്റിക്കർ · സമ്മാന പാക്കിംഗ് · സ്ക്രാച്ച്"
        title={title}
        subtitle={subtitle}
        done={won}
        progressText={`❤️ ${lives}/3 · ${doneIds.length + (scratched ? 1 : 0)}/4`}
      />

      {/* Gift Table */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-3.5 select-none">
        {GIFT_TASKS.map((t) => {
          const isDone = doneIds.includes(t.id);
          const isTarget = selected === t.id || dragging === t.id;
          return (
            <div
              key={t.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                snapTask(e.dataTransfer.getData('text/plain') || dragging || selected || t.id, t.id);
              }}
              onClick={() => snapTask(selected || t.id, t.id)}
              className={`p-3.5 rounded-xl border-2 text-center cursor-pointer transition-all space-y-1.5 ${
                isDone
                  ? 'bg-emerald-700 text-white border-emerald-900 shadow-md'
                  : isTarget
                  ? 'border-dashed border-amber-500 bg-amber-100 ring-2 ring-amber-300'
                  : 'border-dashed border-emerald-400 bg-white'
              }`}
            >
              <motion.p
                animate={isDone ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl"
              >
                {t.target.split(' ')[0]} {isDone ? '✨' : ''}
              </motion.p>
              <p className="text-xs font-extrabold">{t.target}</p>
              <p className={`text-[11px] font-bold ${isDone ? 'text-amber-200' : 'text-slate-600'}`}>
                {isDone ? '✅ ഭംഗിയായി ഒരുങ്ങി!' : `${t.emoji} ഇവിടെ വലിച്ചിടൂ / തൊടൂ`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Draggable Stickers & Ribbons Tray */}
      {doneIds.length < 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {GIFT_TASKS.map((t) => {
            const done = doneIds.includes(t.id);
            const active = selected === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={done}
                draggable={!done}
                onDragStart={(e) => {
                  sound.unlockAudio();
                  setDragging(t.id);
                  setSelected(t.id);
                  e.dataTransfer.setData('text/plain', t.id);
                }}
                onClick={() => {
                  sound.playClick();
                  if (active) snapTask(t.id, t.id);
                  else setSelected(t.id);
                }}
                className={`p-2.5 rounded-xl border-2 text-left flex items-center gap-2 text-xs font-extrabold transition-all ${
                  done
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-60'
                    : active
                    ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-400'
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Bonus Scratch & Win Star Foil Card once gifts are packed! */}
      {doneIds.length === 3 && !scratched && (
        <button
          type="button"
          onPointerMove={(e) => {
            if (e.buttons > 0) rubScratchCard();
          }}
          onClick={rubScratchCard}
          className="w-full p-4 rounded-2xl border-2 border-amber-500 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 text-slate-950 text-center space-y-1 shadow-md cursor-pointer"
        >
          <p className="text-sm sm:text-base font-extrabold">
            ✨ സ്വർണ്ണ സ്ക്രാച്ച് &amp; വിൻ കാർഡ്! ({scratchProgress}%)
          </p>
          <p className="text-xs font-bold">
            👆 ഇവിടെ ഉരച്ചോ 3 തവണ തൊട്ടോ കുട്ടികളുടെ സർപ്രൈസ് സമ്മാനം തുറക്കൂ!
          </p>
        </button>
      )}

      {failed && (
        <FailOverlay
          headline="തെറ്റായ സമ്മാനപ്പൊതി! അവസരങ്ങൾ തീർന്നു"
          note="ഓരോ സ്റ്റിക്കറും റിബ്ബണും ശരിയായ ബോക്സിൽ തന്നെ ഒട്ടിക്കാൻ വീണ്ടും ശ്രമിക്കാം!"
          onRetry={reset}
        />
      )}

      {won && (
        <WinOverlay
          headline="🏆 മദ്രസ ട്രോഫികളും സമ്മാനങ്ങളും സ്ക്രാച്ച് നിധിയും വിജയം! (+35 XP)"
          note="മദ്രസയിലെ കൂട്ടുകാർക്കായി ട്രോഫി സ്റ്റിക്കറും സമ്മാനപ്പൊതിയും സ്നേഹത്തോടെ ഒരുങ്ങി!"
          onReplay={reset}
        />
      )}
    </div>
  );
};
