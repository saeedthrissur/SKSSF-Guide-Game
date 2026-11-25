import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Info,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { scrollToActiveQuiz } from './LessonCheckQuiz';
import { OfficialSkssfFlagImg } from './SvgArtwork';

export interface PracticalGameProps {
  xpKey: string;
  onAwardXp: (amount: number, actionId: string) => void;
  onComplete?: () => void;
  isCompleted?: boolean;
}

const CompactGameBar: React.FC<{
  icon: string;
  progress: string;
  title: string;
  subtitle: string;
  done: boolean;
  onReset: () => void;
}> = ({ icon, progress, title, subtitle, done, onReset }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-950 text-white">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setInfoOpen((v) => !v);
            }}
            aria-label={title}
            className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center text-sm"
          >
            {icon}
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setInfoOpen((v) => !v);
            }}
            aria-label="വിവരം"
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              infoOpen ? 'bg-white text-emerald-950' : 'bg-white/15 text-amber-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 py-0.5 rounded-md bg-white/15 text-amber-200 text-xs font-extrabold tabular-nums">
            {progress}
          </span>
          {done && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-extrabold">
              <CheckCircle2 className="w-3.5 h-3.5" /> +30
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          aria-label="വീണ്ടും"
          className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
      {infoOpen && (
        <div className="px-3 py-2 rounded-xl bg-emerald-900 text-emerald-50 text-xs space-y-0.5">
          <p className="font-extrabold text-amber-300">{title}</p>
          <p className="font-semibold text-[11px]">{subtitle}</p>
        </div>
      )}
    </div>
  );
};

const GameDoneNextBar: React.FC<{ label?: string; onReplay: () => void }> = ({
  label = 'അടുത്തത് · ക്വിസ്',
  onReplay,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex items-center justify-between gap-2"
  >
    <div className="flex items-center gap-2">
      <span className="text-xl">🎉</span>
      <span className="text-xs sm:text-sm font-extrabold text-emerald-950">+30 XP</span>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onReplay}
        aria-label="വീണ്ടും"
        className="w-9 h-9 rounded-xl bg-white border border-emerald-300 text-emerald-900 flex items-center justify-center"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          sound.playClick();
          scrollToActiveQuiz();
        }}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold border-b-4 border-emerald-950 shadow-sm"
      >
        <span>{label}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

/* ============================================================================
 * 1. WALL WRITING PAINT GAME (ചുമരിലെഴുത്ത്) — Stencil-Clipped Painting + Zoom!
 * ========================================================================== */
const WALL_PALETTE = [
  { id: 'sky', color: '#0284C7', label: 'SKSSF നീല' },
  { id: 'maroon', color: '#8C1D40', label: 'സമസ്ത മെറൂൺ' },
  { id: 'emerald', color: '#059669', label: 'പച്ച' },
  { id: 'gold', color: '#D97706', label: 'സ്വർണ്ണ മഞ്ഞ' },
];

export const WallWritingPaintGame: React.FC<PracticalGameProps> = ({
  xpKey,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const paintingRef = useRef(false);
  const [brushColor, setBrushColor] = useState(WALL_PALETTE[0].color);
  const [zoom, setZoom] = useState<number>(1);
  const [fillPct, setFillPct] = useState(isCompleted ? 100 : 0);
  const [outsideWarn, setOutsideWarn] = useState(false);
  const [won, setWon] = useState(isCompleted);
  const totalMaskPixelsRef = useRef(1);
  const paintedSetRef = useRef<Set<number>>(new Set());

  const W = 640;
  const H = 300;

  const initCanvases = () => {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = W;
    maskCanvas.height = H;
    const mctx = maskCanvas.getContext('2d');
    if (mctx) {
      mctx.clearRect(0, 0, W, H);
      mctx.fillStyle = '#000000';
      mctx.textAlign = 'center';
      mctx.textBaseline = 'middle';
      mctx.font = '900 84px sans-serif';
      mctx.fillText('SKSSF', W / 2, 115);
      mctx.font = '900 54px sans-serif';
      mctx.fillText('സമ്മേളനം', W / 2, 215);

      const img = mctx.getImageData(0, 0, W, H).data;
      let count = 0;
      for (let y = 0; y < H; y += 4) {
        for (let x = 0; x < W; x += 4) {
          if (img[(y * W + x) * 4 + 3] > 80) count += 1;
        }
      }
      totalMaskPixelsRef.current = Math.max(1, count);
    }
    maskCanvasRef.current = maskCanvas;
    paintedSetRef.current = new Set();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    // Whitewashed compound wall with faint bricks
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.2;
    for (let y = 30; y < H; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    // Stencil outline letters on wall
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#475569';
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '900 84px sans-serif';
    ctx.fillText('SKSSF', W / 2, 115);
    ctx.strokeText('SKSSF', W / 2, 115);
    ctx.font = '900 54px sans-serif';
    ctx.fillText('സമ്മേളനം', W / 2, 215);
    ctx.strokeText('സമ്മേളനം', W / 2, 215);
  };

  useEffect(() => {
    initCanvases();
  }, []);

  const paintAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    const y = ((clientY - rect.top) / rect.height) * H;
    const ctx = canvas.getContext('2d');
    const mctx = maskCanvas.getContext('2d');
    if (!ctx || !mctx) return;

    // Check if cursor is inside stencil letter
    const px = Math.max(0, Math.min(W - 1, Math.round(x)));
    const py = Math.max(0, Math.min(H - 1, Math.round(y)));
    const alpha = mctx.getImageData(px, py, 1, 1).data[3];
    if (alpha < 40) {
      setOutsideWarn(true);
      return;
    }
    setOutsideWarn(false);

    // Paint neatly clipped strictly inside stencil pixels
    const radius = 24;
    const minX = Math.max(0, Math.floor(x - radius));
    const maxX = Math.min(W - 1, Math.ceil(x + radius));
    const minY = Math.max(0, Math.floor(y - radius));
    const maxY = Math.min(H - 1, Math.ceil(y + radius));
    const maskData = mctx.getImageData(minX, minY, maxX - minX + 1, maxY - minY + 1).data;
    const bw = maxX - minX + 1;

    ctx.fillStyle = brushColor;
    for (let gy = minY; gy <= maxY; gy += 2) {
      for (let gx = minX; gx <= maxX; gx += 2) {
        const dx = gx - x;
        const dy = gy - y;
        if (dx * dx + dy * dy <= radius * radius) {
          const idx = ((gy - minY) * bw + (gx - minX)) * 4 + 3;
          if (maskData[idx] > 80) {
            ctx.fillRect(gx, gy, 3, 3);
            if (gx % 4 === 0 && gy % 4 === 0) {
              paintedSetRef.current.add(gy * W + gx);
            }
          }
        }
      }
    }

    const pct = Math.min(100, Math.round((paintedSetRef.current.size / totalMaskPixelsRef.current) * 115));
    setFillPct(pct);
    if (pct >= 72 && !won) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `wall_write_${xpKey}`);
      onComplete?.();
      narrator.speak('മനോഹരം! സമ്മേളന ചുമരിലെഴുത്ത് വൃത്തിയായി പൂർത്തിയാക്കി!');
      window.setTimeout(() => scrollToActiveQuiz(), 900);
    }
  };

  const reset = () => {
    sound.playClick();
    setWon(false);
    setFillPct(0);
    setOutsideWarn(false);
    initCanvases();
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-2.5 shadow-sm">
      <CompactGameBar
        icon="🖌️"
        progress={`${fillPct}%`}
        title="🖌️ സമ്മേളന ചുമരിലെഴുത്ത്"
        subtitle="അക്ഷരങ്ങൾക്ക് പുറത്തുപോകാതെ വിരൽ കൊണ്ട് പെയിന്റ് അടിക്കൂ. സൂം ബട്ടൺ ഉപയോഗിച്ച് അടുത്തുനിന്നും എഴുതാം!"
        done={won}
        onReset={reset}
      />

      {/* Brush Colors + Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {WALL_PALETTE.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setBrushColor(c.color);
              }}
              aria-label={c.label}
              title={c.label}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                brushColor === c.color ? 'border-slate-950 scale-110 ring-2 ring-amber-400' : 'border-white shadow-xs'
              }`}
              style={{ backgroundColor: c.color }}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setZoom((z) => Math.max(1, Number((z - 0.35).toFixed(2))));
            }}
            aria-label="സൂം കുറയ്ക്കാം"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-extrabold text-slate-700 tabular-nums w-11 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setZoom((z) => Math.min(2.05, Number((z + 0.35).toFixed(2))));
            }}
            aria-label="സൂം കൂട്ടാം"
            className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Zoomable Compound Wall Canvas */}
      <div className="rounded-2xl border-2 border-slate-300 bg-slate-100 overflow-auto max-h-[300px]">
        <div style={{ width: `${zoom * 100}%`, minWidth: '100%' }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerDown={(e) => {
              sound.unlockAudio();
              paintingRef.current = true;
              (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
              paintAt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (!paintingRef.current) return;
              paintAt(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              paintingRef.current = false;
            }}
            className="w-full h-auto block touch-none cursor-crosshair"
          />
        </div>
      </div>

      {outsideWarn && !won && (
        <p className="text-[11px] font-extrabold text-amber-900 bg-amber-50 border border-amber-300 rounded-xl px-3 py-1">
          ⚠️ അക്ഷരത്തിന് ഉള്ളിൽ മാത്രം വിരൽ ഓടിക്കൂ!
        </p>
      )}

      {won && <GameDoneNextBar onReplay={reset} />}
    </div>
  );
};

/* ============================================================================
 * 2. STAGE BUILD SEQUENCE GAME (സ്റ്റേജ് നിർമ്മാണം — 7 Authentic Steps!)
 * ========================================================================== */
const STAGE_STEPS = [
  { id: 'floor', emoji: '🪵', label: '1. തറ ഒരുക്കൽ' },
  { id: 'cloth', emoji: '🧵', label: '2. തുണി കെട്ടൽ' },
  { id: 'roof', emoji: '⛺', label: '3. മുകളിൽ മറയ്ക്കൽ' },
  { id: 'flex', emoji: '🖼️', label: '4. പിന്നിൽ ഫ്ലെക്സ്' },
  { id: 'flowers', emoji: '🌸', label: '5. മുന്നിൽ പൂക്കൾ' },
  { id: 'chairs', emoji: '🪑', label: '6. കസേരകൾ നിരത്തൽ' },
  { id: 'podium', emoji: '🎙️', label: '7. പ്രസംഗപീഠം' },
] as const;

type StageStepId = (typeof STAGE_STEPS)[number]['id'];

export const StageBuildSequenceGame: React.FC<PracticalGameProps> = ({
  xpKey,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [placed, setPlaced] = useState<StageStepId[]>(
    isCompleted ? STAGE_STEPS.map((s) => s.id) : []
  );
  const [touchedTip, setTouchedTip] = useState<string | null>(null);
  const [won, setWon] = useState(isCompleted);

  const handleStep = (step: (typeof STAGE_STEPS)[number], idx: number) => {
    sound.unlockAudio();
    if (placed.includes(step.id)) return;
    if (idx !== placed.length) {
      sound.playError();
      const needed = STAGE_STEPS[placed.length];
      setTouchedTip(`⚠️ ആദ്യം ${needed.emoji} ${needed.label}`);
      return;
    }
    sound.playPop();
    const next = [...placed, step.id];
    setPlaced(next);
    setTouchedTip(`✅ ${step.emoji} ${step.label}`);
    if (next.length === STAGE_STEPS.length && !won) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `stage_build_${xpKey}`);
      onComplete?.();
      narrator.speak('ഗംഭീരം! തറ മുതൽ പ്രസംഗപീഠം വരെ പരിപാടി സ്റ്റേജ് പൂർണ്ണമായി ഒരുക്കി!');
      window.setTimeout(() => scrollToActiveQuiz(), 900);
    }
  };

  const reset = () => {
    sound.playClick();
    setPlaced([]);
    setWon(false);
    setTouchedTip(null);
  };

  const has = (id: StageStepId) => placed.includes(id);

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-2.5 shadow-sm">
      <CompactGameBar
        icon="🏗️"
        progress={`${placed.length}/${STAGE_STEPS.length}`}
        title="🏗️ പരിപാടി സ്റ്റേജ് നിർമ്മാണം"
        subtitle="തറ → തുണി → മേൽക്കൂര → ഫ്ലെക്സ് → പൂക്കൾ → കസേരകൾ → പ്രസംഗപീഠം എന്ന ക്രമത്തിൽ സ്റ്റേജ് ഒരുക്കൂ!"
        done={won}
        onReset={reset}
      />

      {/* Live Progressive Stage SVG */}
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-sky-900 via-emerald-950 to-slate-900 p-2 overflow-hidden">
        <svg viewBox="0 0 600 240" className="w-full h-auto max-h-[230px]">
          <rect x="0" y="198" width="600" height="42" fill="#1E293B" />
          {/* 3. Overhead Canopy Roof */}
          {has('roof') && (
            <g>
              <path d="M55 42 L545 42 L565 62 L35 62 Z" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2.5" />
              <line x1="72" y1="62" x2="72" y2="198" stroke="#CBD5E1" strokeWidth="6" />
              <line x1="528" y1="62" x2="528" y2="198" stroke="#CBD5E1" strokeWidth="6" />
            </g>
          )}
          {/* 4. Back Flex Banner */}
          {has('flex') && (
            <g>
              <rect x="100" y="70" width="400" height="92" rx="8" fill="#065F46" stroke="#FDE047" strokeWidth="3" />
              <text x="300" y="106" textAnchor="middle" fill="#FEF08A" fontSize="18" fontWeight="900">
                SKSSF സമ്മേളന വേദി
              </text>
              <text x="300" y="136" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800">
                വിജ്ഞാനം · വിനയം · സേവനം
              </text>
            </g>
          )}
          {/* 1. Stage Platform Floor */}
          {has('floor') && (
            <rect x="65" y="168" width="470" height="32" rx="4" fill="#92400E" stroke="#FDE68A" strokeWidth="2" />
          )}
          {/* 2. Cloth Draping */}
          {has('cloth') && (
            <g>
              <rect x="65" y="172" width="470" height="28" fill="#0284C7" />
              <path d="M65 172 Q125 194 185 172 T305 172 T425 172 T535 172" fill="none" stroke="#FEF08A" strokeWidth="3" />
            </g>
          )}
          {/* 6. Chairs */}
          {has('chairs') && (
            <g>
              {[150, 215, 280, 345, 410].map((cx) => (
                <g key={cx} transform={`translate(${cx}, 136)`}>
                  <rect x="0" y="0" width="28" height="24" rx="5" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
                  <rect x="-2" y="20" width="32" height="12" rx="3" fill="#CBD5E1" />
                </g>
              ))}
            </g>
          )}
          {/* 7. Podium & Mic */}
          {has('podium') && (
            <g transform="translate(462, 128)">
              <rect x="0" y="12" width="34" height="32" rx="4" fill="#78350F" stroke="#FBBF24" strokeWidth="2" />
              <line x1="17" y1="12" x2="17" y2="-2" stroke="#E2E8F0" strokeWidth="2.5" />
              <circle cx="17" cy="-5" r="4" fill="#FACC15" />
            </g>
          )}
          {/* 5. Front Flowers */}
          {has('flowers') && (
            <g>
              {[105, 170, 235, 300, 365, 430, 495].map((fx) => (
                <g key={fx} transform={`translate(${fx}, 172)`}>
                  <circle cx="0" cy="0" r="8" fill="#FB7185" />
                  <circle cx="0" cy="0" r="3.5" fill="#FDE047" />
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Ordered Step Buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
        {STAGE_STEPS.map((step, idx) => {
          const done = has(step.id);
          const isNext = idx === placed.length;
          return (
            <button
              key={step.id}
              type="button"
              disabled={done}
              onClick={() => handleStep(step, idx)}
              title={step.label}
              aria-label={step.label}
              className={`py-2 px-1.5 rounded-xl border-2 border-b-4 text-center transition-all flex flex-col items-center gap-0.5 ${
                done
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700 opacity-65'
                  : isNext
                  ? 'bg-amber-100 border-amber-500 text-slate-950 scale-[1.03]'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xl leading-none">{done ? '✅' : step.emoji}</span>
              <span className="text-[10px] font-extrabold tabular-nums">{idx + 1}</span>
            </button>
          );
        })}
      </div>

      {touchedTip && (
        <p className="text-xs font-extrabold text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
          {touchedTip}
        </p>
      )}

      {won && <GameDoneNextBar onReplay={reset} />}
    </div>
  );
};

/* ============================================================================
 * 3. STADIUM CLEANUP & VIQAYA DISPOSAL GAME (സ്റ്റേഡിയം ശുചീകരണം & ഡിസ്പോസൽ)
 * ========================================================================== */
const STADIUM_WASTE = [
  { id: 'w1', emoji: '🧴', label: 'വെള്ളക്കുപ്പി', left: '14%', top: '34%' },
  { id: 'w2', emoji: '📄', label: 'നോട്ടീസ് കടലാസ്', left: '34%', top: '58%' },
  { id: 'w3', emoji: '🥤', label: 'പേപ്പർ കപ്പ്', left: '54%', top: '36%' },
  { id: 'w4', emoji: '🧴', label: 'ബോട്ടിൽ', left: '72%', top: '62%' },
  { id: 'w5', emoji: '📦', label: 'കാർഡ്ബോർഡ്', left: '26%', top: '74%' },
  { id: 'w6', emoji: '📄', label: 'കടലാസ് കഷ്ണം', left: '66%', top: '28%' },
];

export const StadiumCleanupViqayaGame: React.FC<PracticalGameProps> = ({
  xpKey,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [collected, setCollected] = useState<string[]>(
    isCompleted ? STADIUM_WASTE.map((w) => w.id) : []
  );
  const [disposed, setDisposed] = useState(isCompleted);
  const [truckDrive, setTruckDrive] = useState(isCompleted);

  const allLoaded = collected.length === STADIUM_WASTE.length;

  const pickWaste = (id: string) => {
    sound.unlockAudio();
    if (collected.includes(id)) return;
    sound.playPop();
    setCollected((prev) => [...prev, id]);
  };

  const handleDispose = () => {
    if (!allLoaded || disposed) return;
    sound.unlockAudio();
    sound.playHoist();
    setTruckDrive(true);
    window.setTimeout(() => {
      setDisposed(true);
      onAwardXp(30, `stadium_clean_${xpKey}`);
      onComplete?.();
      narrator.speak('അടിപൊളി! പരിപാടിക്ക് ശേഷം സ്റ്റേഡിയം വൃത്തിയാക്കി വിഖായ വാഹനത്തിൽ സുരക്ഷിതമായി ഡിസ്പോസ് ചെയ്തു!');
      window.setTimeout(() => scrollToActiveQuiz(), 850);
    }, 650);
  };

  const reset = () => {
    sound.playClick();
    setCollected([]);
    setDisposed(false);
    setTruckDrive(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-2.5 shadow-sm">
      <CompactGameBar
        icon="🏟️"
        progress={`${collected.length}/${STADIUM_WASTE.length}`}
        title="🏟️ പരിപാടി ഗ്രൗണ്ട് / സ്റ്റേഡിയം ശുചീകരണം"
        subtitle="പരിപാടിക്ക് ശേഷം ഗ്രൗണ്ടിൽ കിടക്കുന്ന കുപ്പികളും കടലാസുകളും വിഖായ വാഹനത്തിലേക്ക് ശേഖരിച്ച് ♻️ ഡിസ്പോസ് ചെയ്യൂ!"
        done={disposed}
        onReset={reset}
      />

      <div className="relative h-56 rounded-2xl border-2 border-emerald-400 bg-gradient-to-b from-sky-200 via-emerald-200 to-emerald-500 overflow-hidden">
        {/* Stadium Stands Backdrop */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-slate-800 to-slate-700/80 flex items-center justify-between px-4 text-xs font-extrabold text-amber-300">
          <span>🏟️ {disposed ? '✨ വൃത്തിയായി!' : `${collected.length}/${STADIUM_WASTE.length}`}</span>
          <span>♻️</span>
        </div>

        {/* Scattered Waste Items */}
        {STADIUM_WASTE.map((item) => {
          const picked = collected.includes(item.id);
          if (picked) return null;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => pickWaste(item.id)}
              style={{ left: item.left, top: item.top }}
              title={item.label}
              aria-label={item.label}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-white/95 border-2 border-amber-400 shadow-md flex items-center justify-center text-2xl cursor-pointer"
            >
              {item.emoji}
            </motion.button>
          );
        })}

        {/* Viqaya Pickup Vehicle */}
        <motion.div
          animate={{ x: truckDrive ? 260 : 0 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          className="absolute bottom-2 left-3 px-3 py-2 rounded-2xl bg-emerald-950 text-white border-2 border-amber-300 shadow-lg flex items-center gap-2 text-xs font-extrabold"
        >
          <span className="text-2xl">🚛</span>
          <span className="tabular-nums">🗑️ {collected.length}/{STADIUM_WASTE.length}</span>
        </motion.div>

        {/* Disposal Station */}
        <div className="absolute bottom-2 right-3 px-2.5 py-2 rounded-2xl bg-white/95 border-2 border-emerald-600 text-emerald-950 text-xs font-extrabold">
          ♻️
        </div>
      </div>

      {allLoaded && !disposed && (
        <button
          type="button"
          onClick={handleDispose}
          className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold border-b-4 border-amber-700 shadow-sm"
        >
          🚛 ♻️ ഡിസ്പോസ് ചെയ്യാം!
        </button>
      )}

      {disposed && <GameDoneNextBar onReplay={reset} />}
    </div>
  );
};

/* ============================================================================
 * 4. ISLAMIC LIBRARY BOOK ADAB SHELF GAME (തടി അലമാര / മേശയുടെ തട്ടുകൾ & കിതാബുകൾ)
 * ========================================================================== */
const LIBRARY_SHELVES = [
  {
    rank: 1,
    id: 'quran',
    emoji: '📗',
    label: 'വിശുദ്ധ ഖുർആൻ (മുസ്ഹഫ്)',
    shortTitle: 'അൽ-ഖുർആൻ',
    shelfHint: 'ഏറ്റവും മുകളിലെ തട്ട്',
    coverColor: '#065F46',
    spineColor: '#047857',
    goldTrim: '#FBBF24',
  },
  {
    rank: 2,
    id: 'tafseer',
    emoji: '📖',
    label: 'തഫ്സീർ (ഖുർആൻ വ്യാഖ്യാനം)',
    shortTitle: 'തഫ്സീർ',
    shelfHint: 'രണ്ടാം തട്ട്',
    coverColor: '#0F766E',
    spineColor: '#115E59',
    goldTrim: '#FDE68A',
  },
  {
    rank: 3,
    id: 'hadith',
    emoji: '📜',
    label: 'ഹദീസ് ഗ്രന്ഥങ്ങൾ',
    shortTitle: 'സ്വഹീഹ് ഹദീസ്',
    shelfHint: 'മൂന്നാം തട്ട്',
    coverColor: '#7C2D12',
    spineColor: '#9A3412',
    goldTrim: '#FCD34D',
  },
  {
    rank: 4,
    id: 'fiqh',
    emoji: '⚖️',
    label: 'ഫിഖ്ഹ് (കർമ്മശാസ്ത്രം)',
    shortTitle: 'ഫിഖ്ഹ് കിതാബ്',
    shelfHint: 'നാലാം തട്ട്',
    coverColor: '#1E3A8A',
    spineColor: '#1D4ED8',
    goldTrim: '#93C5FD',
  },
  {
    rank: 5,
    id: 'history',
    emoji: '🕌',
    label: 'അഖീദ & സമസ്ത ചരിത്രം',
    shortTitle: 'സമസ്ത ചരിത്രം',
    shelfHint: 'അഞ്ചാം തട്ട്',
    coverColor: '#581C87',
    spineColor: '#6B21A8',
    goldTrim: '#E9D5FF',
  },
  {
    rank: 6,
    id: 'general',
    emoji: '📓',
    label: 'പൊതുവിജ്ഞാനം & സത്യധാര',
    shortTitle: 'സത്യധാര / മാസിക',
    shelfHint: 'ഏറ്റവും താഴത്തെ തട്ട്',
    coverColor: '#334155',
    spineColor: '#475569',
    goldTrim: '#CBD5E1',
  },
] as const;

const BOX_ORDER = ['fiqh', 'quran', 'general', 'hadith', 'history', 'tafseer'] as const;

const KitabMiniSvg: React.FC<{
  id: string;
  coverColor: string;
  goldTrim: string;
}> = ({ id, coverColor, goldTrim }) => (
  <svg viewBox="0 0 64 44" className="w-12 h-9 shrink-0 drop-shadow-xs" aria-hidden="true">
    {id === 'quran' ? (
      /* Open Mushaf resting respectfully on wooden Rehal stand */
      <g>
        <path d="M14 40 L32 28 L50 40" stroke="#92400E" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <path d="M22 40 L32 33 L42 40" stroke="#B45309" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M10 14 Q22 10 32 18 Q42 10 54 14 L52 30 Q42 26 32 32 Q22 26 12 30 Z" fill="#FFFBEB" stroke="#065F46" strokeWidth="2.2" />
        <line x1="32" y1="18" x2="32" y2="32" stroke="#D97706" strokeWidth="1.5" />
        <line x1="16" y1="19" x2="27" y2="21" stroke="#059669" strokeWidth="1.4" />
        <line x1="16" y1="24" x2="27" y2="26" stroke="#059669" strokeWidth="1.4" />
        <line x1="37" y1="21" x2="48" y2="19" stroke="#059669" strokeWidth="1.4" />
        <line x1="37" y1="26" x2="48" y2="24" stroke="#059669" strokeWidth="1.4" />
        <circle cx="32" cy="9" r="3" fill="#FBBF24" />
      </g>
    ) : (
      /* Hardbound Kitab stack on desk shelf */
      <g>
        <rect x="8" y="10" width="48" height="28" rx="4" fill={coverColor} stroke="#0F172A" strokeWidth="1.6" />
        <rect x="13" y="14" width="38" height="20" rx="2" fill="none" stroke={goldTrim} strokeWidth="1.5" />
        <rect x="8" y="10" width="7" height="28" rx="2" fill="#0F172A" opacity="0.25" />
        <line x1="11" y1="35" x2="53" y2="35" stroke="#FEF3C7" strokeWidth="2.2" />
        <circle cx="32" cy="24" r="5" fill={goldTrim} opacity="0.9" />
      </g>
    )}
  </svg>
);

export const IslamicLibraryShelfGame: React.FC<PracticalGameProps> = ({
  xpKey,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string[]>(
    isCompleted ? LIBRARY_SHELVES.map((s) => s.id) : []
  );
  const [lives, setLives] = useState<number>(3);
  const [feedback, setFeedback] = useState<string | null>(
    isCompleted ? null : '👇 താഴെ മേശയിൽ കിടക്കുന്ന ഒരു കിതാബ് തൊട്ട്, മുകളിലെ തടി അലമാരയിലെ ശരിയായ തട്ടിൽ വെക്കൂ!'
  );
  const [won, setWon] = useState(isCompleted);
  const failed = lives <= 0 && !won;

  const handlePlaceOnShelf = (shelfId: string) => {
    sound.unlockAudio();
    if (failed || won || placed.includes(shelfId)) return;
    if (!selectedBookId) {
      setFeedback('👆 ആദ്യം താഴത്തെ മേശയിൽ നിന്ന് ഒരു കിതാബ് തിരഞ്ഞെടുക്കൂ!');
      return;
    }
    if (selectedBookId !== shelfId) {
      sound.playError();
      const chosen = LIBRARY_SHELVES.find((s) => s.id === selectedBookId);
      setLives((l) => Math.max(0, l - 1));
      setFeedback(
        shelfId === 'quran'
          ? '❌ തെറ്റി! ഏറ്റവും മുകളിലെ തട്ട് വിശുദ്ധ ഖുർആനിന് (മുസ്ഹഫ്) മാത്രമുള്ളതാണ്! (1 ഹൃദയം നഷ്ടമായി)'
          : `❌ തെറ്റി! ${chosen?.label} — അദബ് ക്രമപ്രകാരം ശരിയായ തട്ടിൽ വെക്കൂ! (1 ഹൃദയം നഷ്ടമായി)`
      );
      return;
    }
    sound.playPop();
    const next = [...placed, shelfId];
    const placedBook = LIBRARY_SHELVES.find((s) => s.id === shelfId);
    setPlaced(next);
    setSelectedBookId(null);
    setFeedback(`✅ മനോഹരം! ${placedBook?.label} ശരിയായ തട്ടിൽ അദബോടെ വെച്ചു.`);
    if (next.length === LIBRARY_SHELVES.length && !won) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `library_adab_${xpKey}`);
      onComplete?.();
      narrator.speak('മനോഹരം! വിശുദ്ധ ഖുർആൻ ഏറ്റവും മുകളിലായി ഇസ്‌ലാമിക അദബോടെ കിതാബ് അലമാര ഒരുക്കി!');
      window.setTimeout(() => scrollToActiveQuiz(), 900);
    }
  };

  const reset = () => {
    sound.playClick();
    setPlaced([]);
    setSelectedBookId(null);
    setLives(3);
    setFeedback('👇 താഴെ മേശയിൽ കിടക്കുന്ന ഒരു കിതാബ് തൊട്ട്, മുകളിലെ തടി അലമാരയിലെ ശരിയായ തട്ടിൽ വെക്കൂ!');
    setWon(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3 sm:p-4 space-y-3 shadow-sm">
      <CompactGameBar
        icon="📚"
        progress={`❤️ ${lives}/3 · ${placed.length}/${LIBRARY_SHELVES.length}`}
        title="📚 മദ്രസാ കിതാബ് അലമാര — അദബ് ക്രമം"
        subtitle="ഖുർആൻ ഏറ്റവും മുകളിൽ, തുടർന്ന് തഫ്സീർ, ഹദീസ്, ഫിഖ്ഹ്, ചരിത്രം, സത്യധാര എന്ന ക്രമത്തിൽ തടി അലമാരയുടെ തട്ടുകളിൽ അടുക്കിവെക്കൂ!"
        done={won}
        onReset={reset}
      />

      {/* Realistic Wooden Bookcase / Table Shelf Structure */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#6B3A18] via-[#4A250E] to-[#361A09] p-2.5 sm:p-3.5 border-4 border-[#8B4E23] shadow-lg">
        {/* Top Wooden Cornice Molding */}
        <div className="h-3 rounded-t-lg bg-gradient-to-r from-[#9A5B2C] via-[#C27D38] to-[#9A5B2C] border-b-2 border-[#3E1E0B] mb-2 flex items-center justify-center">
          <span className="text-[9px] font-black tracking-widest text-amber-100 uppercase">
            🕌 മദ്രസാ കിതാബ് അലമാര · മുകളിൽ നിന്ന് താഴേക്ക്
          </span>
        </div>

        {/* Side Pillars + 6 Shelf Compartments */}
        <div className="border-x-4 border-[#8B4E23] bg-[#2B1508]/90 px-2 py-2 space-y-2 rounded-b-lg">
          {LIBRARY_SHELVES.map((shelf) => {
            const isPlaced = placed.includes(shelf.id);
            const isNextHint = selectedBookId === shelf.id;
            return (
              <div key={shelf.id} className="space-y-1">
                <button
                  type="button"
                  disabled={isPlaced || failed}
                  onClick={() => handlePlaceOnShelf(shelf.id)}
                  className={`w-full px-3 py-2 rounded-lg border-2 text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                    isPlaced
                      ? 'bg-gradient-to-r from-amber-50 via-white to-emerald-50 border-emerald-400 text-slate-900 shadow-inner'
                      : selectedBookId
                      ? 'bg-amber-950/60 border-dashed border-amber-400 text-amber-100 hover:bg-amber-900/70'
                      : 'bg-[#3A1E0D]/80 border-amber-800/70 text-amber-200/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-amber-900/90 border border-amber-600/70 text-amber-200 text-xs font-black flex items-center justify-center shrink-0">
                      {shelf.rank}
                    </span>
                    {isPlaced ? (
                      <KitabMiniSvg
                        id={shelf.id}
                        coverColor={shelf.coverColor}
                        goldTrim={shelf.goldTrim}
                      />
                    ) : (
                      <div className="w-12 h-9 rounded-md border border-dashed border-amber-500/50 bg-black/25 flex items-center justify-center text-base shrink-0">
                        {isNextHint ? '👇' : '📥'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className={`text-[10px] font-bold ${isPlaced ? 'text-emerald-700' : 'text-amber-300'}`}>
                        {shelf.shelfHint}
                      </p>
                      <p className={`text-xs sm:text-sm font-extrabold leading-tight break-words ${isPlaced ? 'text-slate-900' : 'text-amber-100'}`}>
                        {isPlaced ? `${shelf.label} ✅` : 'ഇവിടെ കിതാബ് വെക്കാം'}
                      </p>
                    </div>
                  </div>
                  {isPlaced && (
                    <span className="text-lg shrink-0">{shelf.emoji}</span>
                  )}
                </button>
                {/* Solid Teak Wood Shelf Plank */}
                <div className="h-2 rounded-sm bg-gradient-to-r from-[#7C441E] via-[#B46E36] to-[#7C441E] shadow-sm border-b border-[#2C1406]" />
              </div>
            );
          })}
        </div>

        {/* Wooden Bookcase Feet */}
        <div className="flex items-center justify-between px-4 pt-1">
          <div className="w-6 h-2.5 rounded-b-md bg-[#7C441E] border border-[#3E1E0B]" />
          <div className="w-6 h-2.5 rounded-b-md bg-[#7C441E] border border-[#3E1E0B]" />
        </div>
      </div>

      {/* Fail State */}
      {failed && (
        <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-400 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-rose-900">💔 3 തെറ്റുകൾ സംഭവിച്ചു!</p>
            <p className="text-xs font-bold text-rose-700">
              ഖുർആൻ → തഫ്സീർ → ഹദീസ് → ഫിഖ്ഹ് → ചരിത്രം → പൊതുപുസ്തകങ്ങൾ എന്ന ക്രമത്തിൽ വീണ്ടും അടുക്കിവെക്കൂ.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold border-b-4 border-amber-600 cursor-pointer"
          >
            🔄 വീണ്ടും ശ്രമിക്കാം
          </button>
        </div>
      )}

      {/* Wooden Study Desk Tray Holding Books to Pick */}
      {!won && !failed && (
        <div className="rounded-2xl bg-amber-50/90 border-2 border-amber-300 p-2.5 space-y-2">
          <p className="text-[11px] font-extrabold text-amber-950">
            🪑 മേശയിലുള്ള കിതാബുകൾ (ഒന്ന് തൊട്ട് മുകളിലെ ശരിയായ തട്ടിൽ വെക്കൂ):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BOX_ORDER.map((bookId) => {
              const book = LIBRARY_SHELVES.find((s) => s.id === bookId)!;
              const done = placed.includes(book.id);
              const active = selectedBookId === book.id;
              return (
                <button
                  key={book.id}
                  type="button"
                  disabled={done}
                  onClick={() => {
                    sound.playClick();
                    setSelectedBookId(book.id);
                    setFeedback(`👆 തിരഞ്ഞെടുത്തു: ${book.label} — ഇനി മുകളിലെ ശരിയായ തട്ടിൽ തൊടൂ!`);
                  }}
                  className={`px-2.5 py-2 rounded-xl border-2 text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                    done
                      ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-45 cursor-default'
                      : active
                      ? 'bg-emerald-700 text-white border-emerald-950 ring-2 ring-emerald-300 scale-[1.01]'
                      : 'bg-white text-slate-900 border-amber-300 hover:border-emerald-500 hover:bg-emerald-50/40'
                  }`}
                >
                  <KitabMiniSvg
                    id={book.id}
                    coverColor={book.coverColor}
                    goldTrim={book.goldTrim}
                  />
                  <span className="text-left leading-tight break-words">{book.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {feedback && !failed && (
        <p className="text-xs font-extrabold text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
          {feedback}
        </p>
      )}

      {won && <GameDoneNextBar onReplay={reset} />}
    </div>
  );
};

/* ============================================================================
 * 5. MAJLISUNNOOR AGENDA & NOTICE BUILDER GAME (അജണ്ട & മജ്‌ലിസുന്നൂർ നോട്ടീസ്)
 * ========================================================================== */
const AGENDA_SLOTS = [
  { id: 'qiraath', emoji: '📖', role: '1. ഖിറാഅത്ത്', expectedPerson: 'hafiz' },
  { id: 'dua', emoji: '🤲', role: '2. പ്രാർത്ഥന (ദുആ)', expectedPerson: 'khateeb' },
  { id: 'welcome', emoji: '👋', role: '3. സ്വാഗതം', expectedPerson: 'secretary' },
  { id: 'chair', emoji: '👑', role: '4. അധ്യക്ഷൻ', expectedPerson: 'president' },
  { id: 'inaug', emoji: '🎤', role: '5. ഉദ്ഘാടനം / മജ്‌ലിസുന്നൂർ', expectedPerson: 'ustad' },
  { id: 'felic', emoji: '🤝', role: '6. ആശംസ', expectedPerson: 'mahallu' },
  { id: 'thanks', emoji: '🙏', role: '7. നന്ദി', expectedPerson: 'treasurer' },
] as const;

const AGENDA_PEOPLE = [
  { id: 'khateeb', emoji: '👳', label: 'ഖത്തീബ് ഉസ്താദ്' },
  { id: 'secretary', emoji: '📝', label: 'യൂണിറ്റ് സെക്രട്ടറി' },
  { id: 'president', emoji: '👑', label: 'യൂണിറ്റ് പ്രസിഡന്റ്' },
  { id: 'ustad', emoji: '🌙', label: 'മേഖലാ / സമസ്ത ഉസ്താദ്' },
  { id: 'mahallu', emoji: '🤝', label: 'മഹല്ല് പ്രതിനിധി' },
  { id: 'hafiz', emoji: '📖', label: 'ഹാഫിള് വിദ്യാർത്ഥി' },
  { id: 'treasurer', emoji: '💰', label: 'യൂണിറ്റ് ട്രഷറർ' },
] as const;

const NOTICE_STAMPS = [
  { id: 'flag', emoji: '🚩', label: 'SKSSF കൊടി & മജ്‌ലിസുന്നൂർ ലോഗോ' },
  { id: 'venue', emoji: '📍', label: 'സ്ഥലം & തീയതി (മസ്ജിദ് അങ്കണം · വെള്ളി 7 PM)' },
  { id: 'invite', emoji: '✨', label: 'എല്ലാവർക്കും സ്വാഗതം · പങ്കെടുക്കുക, പുണ്യം നേടുക!' },
] as const;

export const MajlisAgendaNoticeGame: React.FC<PracticalGameProps> = ({
  xpKey,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<Record<string, string>>(
    isCompleted
      ? Object.fromEntries(AGENDA_SLOTS.map((s) => [s.id, s.expectedPerson]))
      : {}
  );
  const [stamps, setStamps] = useState<string[]>(
    isCompleted ? NOTICE_STAMPS.map((n) => n.id) : []
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [won, setWon] = useState(isCompleted);

  const agendaDone = Object.keys(assigned).length === AGENDA_SLOTS.length;

  const assignSlot = (slot: (typeof AGENDA_SLOTS)[number]) => {
    sound.unlockAudio();
    if (assigned[slot.id]) return;
    if (!selectedPerson) {
      setMsg('👆 ആദ്യം താഴെ നിന്ന് ഒരു വ്യക്തിയെ തിരഞ്ഞെടുക്കൂ!');
      return;
    }
    if (selectedPerson !== slot.expectedPerson) {
      sound.playError();
      setMsg(`⚠️ ${slot.role} — അനുയോജ്യമായ സ്ഥാനമുള്ളയാളെ തിരഞ്ഞെടുക്കൂ!`);
      return;
    }
    sound.playPop();
    const next = { ...assigned, [slot.id]: selectedPerson };
    setAssigned(next);
    setSelectedPerson(null);
    setMsg(`✅ ${slot.role}`);
  };

  const toggleNoticeStamp = (id: string) => {
    sound.unlockAudio();
    if (stamps.includes(id)) return;
    sound.playPop();
    const next = [...stamps, id];
    setStamps(next);
    if (next.length === NOTICE_STAMPS.length && !won) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `majlis_notice_${xpKey}`);
      onComplete?.();
      narrator.speak('മനോഹരം! മജ്‌ലിസുന്നൂർ അജണ്ടയും ഔദ്യോഗിക നോട്ടീസും തയ്യാറായി!');
      window.setTimeout(() => scrollToActiveQuiz(), 900);
    }
  };

  const reset = () => {
    sound.playClick();
    setAssigned({});
    setStamps([]);
    setSelectedPerson(null);
    setMsg(null);
    setWon(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-2.5 shadow-sm">
      <CompactGameBar
        icon="📜"
        progress={agendaDone ? `നോട്ടീസ് ${stamps.length}/3` : `അജണ്ട ${Object.keys(assigned).length}/7`}
        title="📜 മജ്‌ലിസുന്നൂർ അജണ്ട & നോട്ടീസ്"
        subtitle="ഘട്ടം 1: ഓരോ പരിപാടിക്കും അനുയോജ്യരായവരെ ചുമതലപ്പെടുത്തൂ. ഘട്ടം 2: SKSSF കൊടിയും മജ്‌ലിസുന്നൂർ ലോഗോയും ചേർത്ത് നോട്ടീസ് തയ്യാറാക്കൂ!"
        done={won}
        onReset={reset}
      />

      {!agendaDone ? (
        <div className="space-y-2.5">
          {/* People Picker */}
          <div className="flex flex-wrap gap-1.5">
            {AGENDA_PEOPLE.map((p) => {
              const used = Object.values(assigned).includes(p.id);
              const active = selectedPerson === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={used}
                  onClick={() => {
                    sound.playClick();
                    setSelectedPerson(p.id);
                    setMsg(`${p.emoji} ${p.label}`);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border-2 text-xs font-extrabold flex items-center gap-1 transition-all ${
                    used
                      ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-45'
                      : active
                      ? 'bg-emerald-700 text-white border-emerald-950 scale-105'
                      : 'bg-amber-50 border-amber-300 text-slate-900 hover:bg-amber-100'
                  }`}
                >
                  <span>{p.emoji}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Agenda Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {AGENDA_SLOTS.map((slot) => {
              const pid = assigned[slot.id];
              const person = AGENDA_PEOPLE.find((p) => p.id === pid);
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={Boolean(pid)}
                  onClick={() => assignSlot(slot)}
                  className={`px-3 py-2 rounded-xl border-2 text-left flex items-center justify-between gap-2 text-xs font-extrabold ${
                    pid
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : selectedPerson
                      ? 'bg-white border-amber-400 text-slate-900 hover:bg-amber-50'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>
                    {slot.emoji} {slot.role}
                  </span>
                  <span className="text-[11px]">
                    {person ? `${person.emoji} ${person.label} ✅` : '➕'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Step 2: Live Majlisunnoor Notice Preview + Stamp Buttons */
        <div className="space-y-2.5">
          <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-emerald-950 via-teal-950 to-emerald-900 text-white p-4 text-center space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between gap-2">
              {stamps.includes('flag') ? (
                <OfficialSkssfFlagImg className="w-12 h-8 rounded border border-white/40 bg-white" />
              ) : (
                <span className="w-12 h-8 rounded border border-dashed border-amber-300/60 flex items-center justify-center text-xs">
                  🚩
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-extrabold">
                🌙 മജ്‌ലിസുന്നൂർ · ഇബാദ്
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-extrabold text-amber-300">
              🌙 SKSSF യൂണിറ്റ് മജ്‌ലിസുന്നൂർ ആത്മീയ സംഗമം
            </h4>

            <p className="text-xs font-bold text-emerald-100">
              {stamps.includes('venue')
                ? '📍 മഹല്ല് മസ്ജിദ് അങ്കണം · 📅 വെള്ളിയാഴ്ച മഗ്‌രിബിന് ശേഷം'
                : '📍 സ്ഥലം & തീയതി ചേർക്കൂ...'}
            </p>

            <div className="text-[11px] text-emerald-100/90 bg-white/10 rounded-xl p-2 grid grid-cols-2 gap-1 text-left">
              <span>🤲 പ്രാർത്ഥന: ഖത്തീബ് ഉസ്താദ്</span>
              <span>👋 സ്വാഗതം: യൂണിറ്റ് സെക്രട്ടറി</span>
              <span>👑 അധ്യക്ഷൻ: യൂണിറ്റ് പ്രസിഡന്റ്</span>
              <span>🎤 പ്രഭാഷണം: സമസ്ത ഉസ്താദ്</span>
            </div>

            {stamps.includes('invite') && (
              <p className="text-xs font-extrabold text-amber-300 pt-1">
                ✨ എല്ലാവർക്കും സ്വാഗതം · പങ്കെടുക്കുക, പുണ്യം നേടുക! ✨
              </p>
            )}
          </div>

          {!won && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {NOTICE_STAMPS.map((st) => {
                const done = stamps.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    disabled={done}
                    onClick={() => toggleNoticeStamp(st.id)}
                    className={`px-3 py-2 rounded-xl border-2 text-xs font-extrabold flex items-center gap-1.5 ${
                      done
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-amber-100 border-amber-500 text-slate-950 hover:bg-amber-200'
                    }`}
                  >
                    <span>{done ? '✅' : st.emoji}</span>
                    <span className="text-left leading-tight">{st.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {msg && !won && (
        <p className="text-xs font-extrabold text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
          {msg}
        </p>
      )}

      {won && <GameDoneNextBar onReplay={reset} />}
    </div>
  );
};

/* ============================================================================
 * 6. PROGRAM ACCOUNTS & CHEERANI LEDGER GAME (വരവ്–ചെലവ്–നീക്കിയിരിപ്പ് & ചീരണി)
 * ========================================================================== */
const INCOME_ITEMS = [
  { id: 'dua_fund', emoji: '🤲', label: 'ദുആ സംഭാവന', amount: 2500 },
  { id: 'hadiya', emoji: '🤝', label: 'യൂണിറ്റ് ഹദിയ', amount: 3000 },
  { id: 'public', emoji: '🕌', label: 'നാട്ടുകാരുടെ സംഭാവന', amount: 4500 },
];

const EXPENSE_ITEMS = [
  { id: 'stage', emoji: '🏗️', label: 'സ്റ്റേജ് & പന്തൽ', amount: 2000 },
  { id: 'chairs', emoji: '🪑', label: 'കസേര വാടക', amount: 800 },
  { id: 'mic', emoji: '🎙️', label: 'മൈക്ക് സെറ്റ്', amount: 1200 },
  { id: 'guests', emoji: '🍽️', label: 'അതിഥി ഭക്ഷണം', amount: 1500 },
  { id: 'cheerani', emoji: '🍬', label: 'ചീരണി (ബറക്കത്തിന് നൽകുന്ന ഭക്ഷണം)', amount: 2500 },
];

export const ProgramBudgetCheeraniGame: React.FC<PracticalGameProps> = ({
  xpKey,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [checkedInc, setCheckedInc] = useState<string[]>(
    isCompleted ? INCOME_ITEMS.map((i) => i.id) : []
  );
  const [checkedExp, setCheckedExp] = useState<string[]>(
    isCompleted ? EXPENSE_ITEMS.map((e) => e.id) : []
  );
  const [balanceErr, setBalanceErr] = useState(false);
  const [won, setWon] = useState(isCompleted);

  const totalIncome = INCOME_ITEMS.filter((i) => checkedInc.includes(i.id)).reduce(
    (sum, i) => sum + i.amount,
    0
  );
  const totalExpense = EXPENSE_ITEMS.filter((e) => checkedExp.includes(e.id)).reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const readyForBalance =
    checkedInc.length === INCOME_ITEMS.length && checkedExp.length === EXPENSE_ITEMS.length;

  const pickBalance = (val: number) => {
    sound.unlockAudio();
    if (val === 2000) {
      setBalanceErr(false);
      if (!won) {
        setWon(true);
        sound.playHoist();
        onAwardXp(30, `budget_cheerani_${xpKey}`);
        onComplete?.();
        narrator.speak('കൃത്യമായ കണക്ക്! വരവ് പതിനായിരം, ചെലവ് എട്ടായിരം, നീക്കിയിരിപ്പ് രണ്ടായിരം രൂപ!');
        window.setTimeout(() => scrollToActiveQuiz(), 900);
      }
    } else {
      sound.playError();
      setBalanceErr(true);
    }
  };

  const reset = () => {
    sound.playClick();
    setCheckedInc([]);
    setCheckedExp([]);
    setBalanceErr(false);
    setWon(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-2.5 shadow-sm">
      <CompactGameBar
        icon="💰"
        progress={won ? '₹2,000 ✅' : `${checkedInc.length + checkedExp.length}/8`}
        title="💰 വരവ് – ചെലവ് – നീക്കിയിരിപ്പ് & ചീരണി"
        subtitle="സംഭാവനകളും (വരവ്) സ്റ്റേജ്-മൈക്ക്-ഭക്ഷണ-ചീരണി ചെലവുകളും രേഖപ്പെടുത്തി ശരിയായ നീക്കിയിരിപ്പ് കണ്ടെത്തൂ!"
        done={won}
        onReset={reset}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Income Column */}
        <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-extrabold text-emerald-950">
            <span>📥 വരവ്</span>
            <span className="tabular-nums text-emerald-700">₹{totalIncome.toLocaleString()}</span>
          </div>
          {INCOME_ITEMS.map((item) => {
            const done = checkedInc.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                disabled={done}
                onClick={() => {
                  sound.playPop();
                  setCheckedInc((p) => [...p, item.id]);
                }}
                className={`w-full px-2.5 py-2 rounded-xl border text-xs font-extrabold flex items-center justify-between gap-2 ${
                  done
                    ? 'bg-white border-emerald-400 text-emerald-900'
                    : 'bg-white/90 border-dashed border-emerald-400 text-slate-800 hover:bg-emerald-100'
                }`}
              >
                <span>
                  {item.emoji} {item.label}
                </span>
                <span className="tabular-nums">
                  {done ? `✅ ₹${item.amount}` : `+ ₹${item.amount}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expense Column */}
        <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-extrabold text-amber-950">
            <span>📤 ചെലവ്</span>
            <span className="tabular-nums text-rose-700">₹{totalExpense.toLocaleString()}</span>
          </div>
          {EXPENSE_ITEMS.map((item) => {
            const done = checkedExp.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                disabled={done}
                onClick={() => {
                  sound.playPop();
                  setCheckedExp((p) => [...p, item.id]);
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-extrabold flex items-center justify-between gap-2 ${
                  done
                    ? 'bg-white border-amber-400 text-amber-950'
                    : 'bg-white/90 border-dashed border-amber-400 text-slate-800 hover:bg-amber-100'
                }`}
              >
                <span className="text-left leading-tight">
                  {item.emoji} {item.label}
                </span>
                <span className="tabular-nums shrink-0">
                  {done ? `✅ ₹${item.amount}` : `− ₹${item.amount}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Balance Check */}
      {readyForBalance && !won && (
        <div className="rounded-2xl bg-slate-900 text-white p-3 space-y-2">
          <p className="text-xs font-extrabold text-amber-300 tabular-nums">
            🧮 നീക്കിയിരിപ്പ്: ₹10,000 − ₹8,000 = ?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[1500, 2000, 3000].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => pickBalance(opt)}
                className="py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold tabular-nums"
              >
                ₹{opt.toLocaleString()}
              </button>
            ))}
          </div>
          {balanceErr && (
            <p className="text-[11px] font-bold text-rose-300">❌ ഒരിക്കൽ കൂടി കണക്കുകൂട്ടൂ!</p>
          )}
        </div>
      )}

      {won && <GameDoneNextBar onReplay={reset} />}
    </div>
  );
};

/* ============================================================================
 * 7. POST-EVENT REVIEW REPORT GAME (പരിപാടി അവലോകന റിപ്പോർട്ട്)
 * ========================================================================== */
const REVIEW_SECTIONS = [
  { id: 'attendance', emoji: '👥', label: '1. പങ്കാളിത്തവും സംഘാടന വിലയിരുത്തലും' },
  { id: 'accounts', emoji: '💰', label: '2. വരവ്–ചെലവ്–നീക്കിയിരിപ്പ് അവതരണം' },
  { id: 'cleanup', emoji: '🏟️', label: '3. ചീരണി & വിഖായ ശുചീകരണ അവലോകനം' },
  { id: 'minutes', emoji: '📝', label: '4. മിനിറ്റ്സ് ഒപ്പും മേൽഘടക റിപ്പോർട്ടും' },
];

export const ProgramReviewReportGame: React.FC<PracticalGameProps> = ({
  xpKey,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [doneIds, setDoneIds] = useState<string[]>(
    isCompleted ? REVIEW_SECTIONS.map((s) => s.id) : []
  );
  const [won, setWon] = useState(isCompleted);

  const toggleSection = (id: string) => {
    sound.unlockAudio();
    if (doneIds.includes(id)) return;
    sound.playPop();
    const next = [...doneIds, id];
    setDoneIds(next);
    if (next.length === REVIEW_SECTIONS.length && !won) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `review_report_${xpKey}`);
      onComplete?.();
      narrator.speak('മനോഹരം! പരിപാടിയുടെ അവലോകന റിപ്പോർട്ട് പൂർണ്ണമായി തയ്യാറാക്കി മേൽഘടകത്തിന് സമർപ്പിച്ചു!');
      window.setTimeout(() => scrollToActiveQuiz(), 900);
    }
  };

  const reset = () => {
    sound.playClick();
    setDoneIds([]);
    setWon(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-2.5 shadow-sm">
      <CompactGameBar
        icon="📋"
        progress={`${doneIds.length}/${REVIEW_SECTIONS.length}`}
        title="📋 പരിപാടി അവലോകന റിപ്പോർട്ട്"
        subtitle="പരിപാടി കഴിഞ്ഞാൽ 4 പ്രധാന ഭാഗങ്ങളും ചേർത്ത് ഔദ്യോഗിക അവലോകന റിപ്പോർട്ട് പൂർത്തിയാക്കൂ!"
        done={won}
        onReset={reset}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {REVIEW_SECTIONS.map((sec) => {
          const done = doneIds.includes(sec.id);
          return (
            <button
              key={sec.id}
              type="button"
              disabled={done}
              onClick={() => toggleSection(sec.id)}
              className={`p-3 rounded-2xl border-2 text-left flex items-center justify-between gap-2 transition-all ${
                done
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                  : 'bg-amber-50/70 border-dashed border-amber-400 text-slate-900 hover:bg-amber-100'
              }`}
            >
              <span className="text-xs sm:text-sm font-extrabold">
                {sec.emoji} {sec.label}
              </span>
              <span className="text-base shrink-0">{done ? '✅' : '✍️'}</span>
            </button>
          );
        })}
      </div>

      {won && <GameDoneNextBar onReplay={reset} />}
    </div>
  );
};
