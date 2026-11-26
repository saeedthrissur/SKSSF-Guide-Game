import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Info,
  RotateCcw,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { scrollToActiveQuiz } from './LessonCheckQuiz';
import { OfficialSkssfFlagImg } from './SvgArtwork';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import { useGameStagePaused, useGameStagePortal } from './GameFullscreenShell';
import { OFFICIAL_WING_LOGOS } from '../data/officialLogos';

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
  shields?: number;
  logoSrc?: string;
  logoAlt?: string;
  onReset: () => void;
}> = ({ icon, progress, title, subtitle, done, shields, logoSrc, logoAlt, onReset }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-950 text-white">
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
          {logoSrc && (
            <div className="h-7 px-1.5 rounded-lg bg-white flex items-center justify-center shrink-0">
              <img
                src={logoSrc}
                alt={logoAlt || title}
                className="h-5 w-auto max-w-[74px] object-contain"
              />
            </div>
          )}
          <span className="px-2 py-0.5 rounded-md bg-white/15 text-amber-200 text-xs font-extrabold tabular-nums">
            {progress}
          </span>
          {done && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-extrabold">
              <CheckCircle2 className="w-3.5 h-3.5" /> +30
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {typeof shields === 'number' && (
            <GameShatterLives lives={shields} maxLives={3} compact />
          )}
          <button
            type="button"
            onClick={onReset}
            aria-label="വീണ്ടും"
            className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
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
 * 1. WALL WRITING MURAL STUDIO (സമ്മേളന ചുമരിലെഴുത്ത്)
 *    Zero-Flicker Layered Canvas Mural + Color Matching + Private Pillar Rule + Timer
 * ========================================================================== */
type WallColorId = 'emerald' | 'sky' | 'gold' | 'crimson';

const WALL_PALETTE: { id: WallColorId; color: string; label: string; emoji: string }[] = [
  { id: 'emerald', color: '#059669', label: 'SKSSF പച്ച', emoji: '🟢' },
  { id: 'sky', color: '#0284C7', label: 'SKSSF നീല', emoji: '🔵' },
  { id: 'gold', color: '#D97706', label: 'സ്വർണ്ണ മഞ്ഞ', emoji: '🟡' },
  { id: 'crimson', color: '#DC2626', label: 'മെറൂൺ ചുവപ്പ്', emoji: '🔴' },
];

interface MuralZone {
  id: 'flag' | 'skssf' | 'conference' | 'motto' | 'arches';
  label: string;
  requiredColor: WallColorId;
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
}

const WALL_W = 680;
const WALL_H = 340;
const PRIVATE_PILLAR_W = 64; // Far-left & far-right private gate pillars (DO NOT PAINT!)
const WALL_TIME_LIMIT = 55;

const MURAL_ZONES: MuralZone[] = [
  {
    id: 'flag',
    label: '🚩 SKSSF പതാക',
    requiredColor: 'sky',
    x: 245,
    y: 44,
    w: 190,
    h: 50,
    cols: 6,
    rows: 2,
  },
  {
    id: 'skssf',
    label: '✨ "SKSSF" തലക്കെട്ട്',
    requiredColor: 'emerald',
    x: 165,
    y: 100,
    w: 350,
    h: 72,
    cols: 8,
    rows: 2,
  },
  {
    id: 'conference',
    label: '✍️ "സമ്മേളനം" എഴുത്ത്',
    requiredColor: 'sky',
    x: 175,
    y: 178,
    w: 330,
    h: 62,
    cols: 8,
    rows: 2,
  },
  {
    id: 'motto',
    label: '📜 "വിജ്ഞാനം · വിനയം · സേവനം"',
    requiredColor: 'crimson',
    x: 150,
    y: 248,
    w: 380,
    h: 46,
    cols: 8,
    rows: 2,
  },
  {
    id: 'arches',
    label: '🕌 മിനാരം & കമാനം',
    requiredColor: 'gold',
    x: 78,
    y: 62,
    w: 72,
    h: 224,
    cols: 2,
    rows: 6,
  },
];

interface PaintParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  life: number;
}

export const WallWritingPaintGame: React.FC<PracticalGameProps> = ({
  xpKey,
  onAwardXp,
  onComplete,
}) => {
  const stagePaused = useGameStagePaused();
  const stagePortal = useGameStagePortal();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paintingRef = useRef(false);
  const pointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const particlesRef = useRef<PaintParticle[]>([]);
  const zoneCellsRef = useRef<Record<MuralZone['id'], Set<string>>>({
    flag: new Set(),
    skssf: new Set(),
    conference: new Set(),
    motto: new Set(),
    arches: new Set(),
  });
  const zoneDoneRef = useRef<Record<MuralZone['id'], boolean>>({
    flag: false,
    skssf: false,
    conference: false,
    motto: false,
    arches: false,
  });
  const lastPenaltyTsRef = useRef(0);

  const [selectedColor, setSelectedColor] = useState<WallColorId>('sky');
  const [completedZones, setCompletedZones] = useState<MuralZone['id'][]>([]);
  const [shields, setShields] = useState(3);
  const [timeLeft, setTimeLeft] = useState(WALL_TIME_LIMIT);
  const [won, setWon] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; tone: 'info' | 'ok' | 'err' }>({
    text: '🖌️ തിളങ്ങുന്ന ഭാഗത്തിന് ചേരുന്ന നിറം തിരഞ്ഞെടുത്ത് വിരൽ ഓടിച്ച് പെയിന്റ് ചെയ്യൂ! (സ്വകാര്യ ഗേറ്റിൽ തട്ടരുത്!)',
    tone: 'info',
  });

  const failed = (shields <= 0 || timeLeft <= 0) && !won;
  const activeZone = useMemo(
    () => MURAL_ZONES.find((z) => !completedZones.includes(z.id)) || null,
    [completedZones]
  );

  // Sync Refs for 60fps canvas loop (zero React re-renders during painting = zero flicker!)
  const selectedColorRef = useRef<WallColorId>(selectedColor);
  selectedColorRef.current = selectedColor;
  const activeZoneRef = useRef<MuralZone | null>(activeZone);
  activeZoneRef.current = activeZone;
  const wonRef = useRef(won);
  wonRef.current = won;
  const failedRef = useRef(failed);
  failedRef.current = failed;

  // Countdown timer (pauses cleanly while blurred briefing / defeat / win overlay is up)
  useEffect(() => {
    if (won || failed || stagePaused) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setFailReason('⏱️ സമ്മേളന ഘോഷയാത്ര എത്തി! സമയം തീരുന്നതിന് മുമ്പ് ചുമരെഴുത്ത് പൂർത്തിയാക്കാനായില്ല.');
          sound.playError();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [won, failed, stagePaused]);

  // Smooth 60fps Canvas Renderer (pure canvas drawing, zero DOM layout thrash!)
  useEffect(() => {
    let rafId = 0;

    const drawMinaretPair = (ctx: CanvasRenderingContext2D, progress: number) => {
      const drawOne = (cx: number) => {
        ctx.save();
        // Outline stencil
        ctx.strokeStyle = progress >= 1 ? '#B45309' : '#94A3B8';
        ctx.lineWidth = 2;
        ctx.fillStyle = progress >= 1 ? '#F59E0B' : `rgba(217, 119, 6, ${0.14 + progress * 0.86})`;

        // Minaret Tower
        ctx.beginPath();
        ctx.roundRect(cx - 18, 128, 36, 152, 4);
        ctx.fill();
        ctx.stroke();

        // Dome
        ctx.beginPath();
        ctx.moveTo(cx - 24, 128);
        ctx.quadraticCurveTo(cx, 74, cx + 24, 128);
        ctx.closePath();
        ctx.fillStyle = progress >= 1 ? '#D97706' : `rgba(245, 158, 11, ${0.16 + progress * 0.84})`;
        ctx.fill();
        ctx.stroke();

        // Crescent Spire
        ctx.beginPath();
        ctx.arc(cx, 84, 8, 0.3, Math.PI * 1.85);
        ctx.strokeStyle = progress >= 1 ? '#FEF08A' : '#CBD5E1';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Decorative arch window
        ctx.beginPath();
        ctx.roundRect(cx - 8, 152, 16, 28, [8, 8, 2, 2]);
        ctx.fillStyle = progress >= 1 ? '#FEF3C7' : '#E2E8F0';
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(cx - 8, 200, 16, 28, [8, 8, 2, 2]);
        ctx.fill();
        ctx.restore();
      };
      drawOne(114);
      drawOne(WALL_W - 114);
    };

    const renderFrame = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafId = requestAnimationFrame(renderFrame);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      // 1. Warm plastered Kerala compound wall backdrop
      const wallGrad = ctx.createLinearGradient(0, 0, 0, WALL_H);
      wallGrad.addColorStop(0, '#FFFDF7');
      wallGrad.addColorStop(0.86, '#FEF9EC');
      wallGrad.addColorStop(1, '#DCFCE7');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, WALL_W, WALL_H);

      // Subtle brickwork texture (static, crisp)
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.12)';
      ctx.lineWidth = 1;
      for (let row = 0; row < 10; row++) {
        const y = 32 + row * 28;
        ctx.beginPath();
        ctx.moveTo(PRIVATE_PILLAR_W, y);
        ctx.lineTo(WALL_W - PRIVATE_PILLAR_W, y);
        ctx.stroke();
        const offset = row % 2 === 0 ? 0 : 28;
        for (let x = PRIVATE_PILLAR_W + offset; x < WALL_W - PRIVATE_PILLAR_W; x += 56) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 28);
          ctx.stroke();
        }
      }

      // Festive conference bunting (തോരണങ്ങൾ) at the top
      const buntingColors = ['#0284C7', '#059669', '#F59E0B', '#FFFFFF', '#0284C7', '#059669'];
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(PRIVATE_PILLAR_W, 10);
      ctx.quadraticCurveTo(WALL_W / 2, 28, WALL_W - PRIVATE_PILLAR_W, 10);
      ctx.stroke();
      for (let i = 0; i < 16; i++) {
        const bx = PRIVATE_PILLAR_W + 16 + i * 34;
        const by = 14 + Math.sin((i / 15) * Math.PI) * 9;
        ctx.fillStyle = buntingColors[i % buntingColors.length];
        ctx.beginPath();
        ctx.moveTo(bx - 10, by);
        ctx.lineTo(bx + 10, by);
        ctx.lineTo(bx, by + 16);
        ctx.closePath();
        ctx.fill();
      }

      // 2. Far-left & far-right UNPERMITTED PRIVATE GATE PILLARS (Hazard Zone!)
      const drawPrivatePillar = (px: number) => {
        ctx.save();
        ctx.fillStyle = '#FEE2E2';
        ctx.fillRect(px, 0, PRIVATE_PILLAR_W, WALL_H);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, 1, PRIVATE_PILLAR_W - 2, WALL_H - 2);
        // Hazard diagonal stripes
        ctx.beginPath();
        ctx.rect(px, 0, PRIVATE_PILLAR_W, WALL_H);
        ctx.clip();
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.22)';
        ctx.lineWidth = 8;
        for (let sy = -60; sy < WALL_H + 80; sy += 26) {
          ctx.beginPath();
          ctx.moveTo(px - 10, sy);
          ctx.lineTo(px + PRIVATE_PILLAR_W + 10, sy + 44);
          ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#991B1B';
        ctx.font = '800 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚫', px + PRIVATE_PILLAR_W / 2, 136);
        ctx.font = '800 10px sans-serif';
        ctx.fillText('സ്വകാര്യ', px + PRIVATE_PILLAR_W / 2, 160);
        ctx.fillText('ചുമർ', px + PRIVATE_PILLAR_W / 2, 175);
        ctx.fillText('അനുവാദം', px + PRIVATE_PILLAR_W / 2, 198);
        ctx.fillText('ഇല്ല!', px + PRIVATE_PILLAR_W / 2, 213);
        ctx.restore();
      };
      drawPrivatePillar(0);
      drawPrivatePillar(WALL_W - PRIVATE_PILLAR_W);

      // Decorative green grass strip along wall base
      ctx.fillStyle = '#15803D';
      ctx.fillRect(PRIVATE_PILLAR_W, WALL_H - 22, WALL_W - PRIVATE_PILLAR_W * 2, 22);
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(PRIVATE_PILLAR_W, WALL_H - 24, WALL_W - PRIVATE_PILLAR_W * 2, 6);

      // Ornamental Golden Outer Mural Frame
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3;
      ctx.strokeRect(PRIVATE_PILLAR_W + 8, 34, WALL_W - PRIVATE_PILLAR_W * 2 - 16, WALL_H - 64);

      // Helper to compute smooth progress per zone
      const getProgress = (z: MuralZone) => {
        if (zoneDoneRef.current[z.id]) return 1;
        const total = z.cols * z.rows;
        return Math.min(1, zoneCellsRef.current[z.id].size / Math.max(1, total * 0.72));
      };

      // 3. Draw all 5 Artistic Mural Zones with Progressive Paint Reveal!
      // Zone 5: Minarets & Arches (left + right mirror)
      const archZone = MURAL_ZONES.find((z) => z.id === 'arches')!;
      drawMinaretPair(ctx, getProgress(archZone));

      // Zone 1: Authentic SKSSF Flag Banner (Top-Left Blue Canton + Crescent & Star, Top-Right White + Mosque Dome & Minaret, Bottom Green Strip with SKSSF)
      const flagZone = MURAL_ZONES.find((z) => z.id === 'flag')!;
      const flagProg = getProgress(flagZone);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(flagZone.x, flagZone.y, flagZone.w, flagZone.h, 10);
      ctx.fillStyle = '#F1F5F9';
      ctx.fill();
      ctx.strokeStyle = flagProg >= 1 ? '#0369A1' : '#94A3B8';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Reveal clip width
      ctx.beginPath();
      ctx.roundRect(flagZone.x, flagZone.y, flagZone.w * Math.max(0.08, flagProg), flagZone.h, 10);
      ctx.clip();

      const upperH = flagZone.h * 0.67;
      const greenH = flagZone.h - upperH;
      const cantonW = flagZone.w * 0.36;
      const painted = flagProg > 0.05;

      // Top-right white field
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(flagZone.x, flagZone.y, flagZone.w, upperH);

      // Top-left Royal/Sky Blue Canton
      ctx.fillStyle = painted ? '#0284C7' : '#CBD5E1';
      ctx.fillRect(flagZone.x, flagZone.y, cantonW, upperH);

      // White Crescent Moon + 5-Pointed Star inside Canton
      const crescentX = flagZone.x + cantonW * 0.52;
      const crescentY = flagZone.y + upperH * 0.52;
      const cr = Math.min(cantonW, upperH) * 0.32;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(crescentX, crescentY, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = painted ? '#0284C7' : '#CBD5E1';
      ctx.beginPath();
      ctx.arc(crescentX - cr * 0.36, crescentY - cr * 0.28, cr * 0.82, 0, Math.PI * 2);
      ctx.fill();

      // 5-pointed star nestled cleanly inside crescent opening
      const starCx = crescentX - cr * 0.42;
      const starCy = crescentY - cr * 0.32;
      const outerR = cr * 0.34;
      const innerR = outerR * 0.44;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? outerR : innerR;
        const sxPt = starCx + Math.cos(angle) * r;
        const syPt = starCy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(sxPt, syPt);
        else ctx.lineTo(sxPt, syPt);
      }
      ctx.closePath();
      ctx.fill();

      // Mosque Dome + Left Minaret Line Art on Right White Field
      const mx = flagZone.x + cantonW + (flagZone.w - cantonW) * 0.5;
      const my = flagZone.y + upperH * 0.86;
      ctx.strokeStyle = painted ? '#0F172A' : '#94A3B8';
      ctx.lineWidth = 1.25;
      // Base platform
      ctx.beginPath();
      ctx.moveTo(mx - 20, my);
      ctx.lineTo(mx + 22, my);
      ctx.stroke();
      // Left tall minaret
      ctx.strokeRect(mx - 17, my - 24, 5, 24);
      ctx.beginPath();
      ctx.moveTo(mx - 18, my - 24);
      ctx.quadraticCurveTo(mx - 14.5, my - 30, mx - 11, my - 24);
      ctx.stroke();
      // Ribbed dome
      ctx.beginPath();
      ctx.moveTo(mx - 10, my);
      ctx.quadraticCurveTo(mx - 10, my - 18, mx + 4, my - 24);
      ctx.quadraticCurveTo(mx + 18, my - 18, mx + 18, my);
      ctx.stroke();
      // Dome center rib & spire
      ctx.beginPath();
      ctx.moveTo(mx + 4, my - 28);
      ctx.lineTo(mx + 4, my);
      ctx.stroke();

      // Bottom Official Green Strip with crisp white SKSSF
      ctx.fillStyle = painted ? '#15803D' : '#CBD5E1';
      ctx.fillRect(flagZone.x, flagZone.y + upperH, flagZone.w, greenH + 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 13px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S K S S F', flagZone.x + flagZone.w / 2, flagZone.y + upperH + greenH / 2 + 0.5);
      ctx.restore();

      // Zone 2: Bold 3D "SKSSF" Heading
      const skssfZone = MURAL_ZONES.find((z) => z.id === 'skssf')!;
      const skssfProg = getProgress(skssfZone);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 66px system-ui, -apple-system, sans-serif';
      const sx = WALL_W / 2;
      const sy = skssfZone.y + skssfZone.h / 2 + 2;
      // Stencil outline
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 3;
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText('SKSSF', sx, sy);
      ctx.strokeText('SKSSF', sx, sy);
      // Painted vibrant overlay clipped smoothly
      if (skssfProg > 0) {
        ctx.beginPath();
        ctx.rect(skssfZone.x, skssfZone.y, skssfZone.w * skssfProg, skssfZone.h);
        ctx.clip();
        ctx.fillStyle = '#FDE047';
        ctx.fillText('SKSSF', sx + 3, sy + 3);
        ctx.fillStyle = '#059669';
        ctx.fillText('SKSSF', sx, sy);
        ctx.strokeStyle = '#064E3B';
        ctx.lineWidth = 2;
        ctx.strokeText('SKSSF', sx, sy);
      }
      ctx.restore();

      // Zone 3: Crisp Malayalam "സമ്മേളനം" Calligraphy
      const confZone = MURAL_ZONES.find((z) => z.id === 'conference')!;
      const confProg = getProgress(confZone);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 44px "Noto Sans Malayalam", system-ui, sans-serif';
      const cx = WALL_W / 2;
      const cy = confZone.y + confZone.h / 2 + 2;
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText('സമ്മേളനം', cx, cy);
      ctx.strokeText('സമ്മേളനം', cx, cy);
      if (confProg > 0) {
        ctx.beginPath();
        ctx.rect(confZone.x, confZone.y, confZone.w * confProg, confZone.h);
        ctx.clip();
        ctx.fillStyle = '#BAE6FD';
        ctx.fillText('സമ്മേളനം', cx + 2.5, cy + 2.5);
        ctx.fillStyle = '#0284C7';
        ctx.fillText('സമ്മേളനം', cx, cy);
        ctx.strokeStyle = '#0C4A6E';
        ctx.lineWidth = 1.6;
        ctx.strokeText('സമ്മേളനം', cx, cy);
      }
      ctx.restore();

      // Zone 4: Motto Ribbon "വിജ്ഞാനം · വിനയം · സേവനം"
      const mottoZone = MURAL_ZONES.find((z) => z.id === 'motto')!;
      const mottoProg = getProgress(mottoZone);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(mottoZone.x, mottoZone.y + 4, mottoZone.w, mottoZone.h - 8, 18);
      ctx.fillStyle = '#F1F5F9';
      ctx.fill();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (mottoProg > 0) {
        ctx.beginPath();
        ctx.roundRect(
          mottoZone.x,
          mottoZone.y + 4,
          mottoZone.w * mottoProg,
          mottoZone.h - 8,
          18
        );
        ctx.fillStyle = '#DC2626';
        ctx.fill();
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 18px "Noto Sans Malayalam", system-ui, sans-serif';
      ctx.fillStyle = mottoProg > 0.35 ? '#FEF08A' : '#64748B';
      ctx.fillText('✨ വിജ്ഞാനം · വിനയം · സേവനം ✨', WALL_W / 2, mottoZone.y + mottoZone.h / 2 + 1);
      ctx.restore();

      // 4. Gently pulsing guide outline on the current active zone (zero DOM shift!)
      const active = activeZoneRef.current;
      if (active && !wonRef.current && !failedRef.current) {
        const pulse = 0.55 + 0.45 * Math.sin(time / 240);
        const col = WALL_PALETTE.find((p) => p.id === active.requiredColor)?.color || '#059669';
        ctx.save();
        ctx.setLineDash([8, 5]);
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.5 + pulse * 0.5;
        ctx.lineWidth = 3;
        ctx.strokeRect(active.x - 4, active.y - 4, active.w + 8, active.h + 8);
        if (active.id === 'arches') {
          ctx.strokeRect(WALL_W - active.x - active.w - 4, active.y - 4, active.w + 8, active.h + 8);
        }
        ctx.restore();
      }

      // 5. Juicy paint splatter particles
      const alive: PaintParticle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14;
        p.life -= 0.04;
        if (p.life > 0) {
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          alive.push(p);
        }
      }
      particlesRef.current = alive;

      // 6. Live Paintbrush indicator while dragging
      const ptr = pointerPosRef.current;
      if (ptr && paintingRef.current && !wonRef.current && !failedRef.current) {
        const brushHex =
          WALL_PALETTE.find((c) => c.id === selectedColorRef.current)?.color || '#0284C7';
        ctx.save();
        ctx.beginPath();
        ctx.arc(ptr.x, ptr.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = `${brushHex}55`;
        ctx.fill();
        ctx.strokeStyle = brushHex;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const spawnSplash = (x: number, y: number, color: string, count = 6) => {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 2.8;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1.2,
        r: 2.5 + Math.random() * 3.5,
        color,
        life: 1,
      });
    }
  };

  const penalize = useCallback((msg: string) => {
    const now = Date.now();
    if (now - lastPenaltyTsRef.current < 950) return;
    lastPenaltyTsRef.current = now;
    sound.playError();
    setStatusMsg({ text: msg, tone: 'err' });
    setShields((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0) {
        setFailReason(msg);
      }
      return next;
    });
  }, []);

  const handleBrushAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || wonRef.current || failedRef.current || stagePaused) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * WALL_W;
    const y = ((clientY - rect.top) / rect.height) * WALL_H;
    pointerPosRef.current = { x, y };

    // 1. Check Unpermitted Private Gate Pillars (Far left / Far right)
    if (x <= PRIVATE_PILLAR_W || x >= WALL_W - PRIVATE_PILLAR_W) {
      spawnSplash(x, y, '#EF4444', 8);
      penalize('🚫 അനുവാദമില്ലാത്ത സ്വകാര്യ ചുമരിൽ പെയിന്റ് തട്ടി! (-1 കവചം)');
      return;
    }

    // 2. Hit-test any unpainted Mural Zone (arches matches both left & right minaret!)
    const hitZone = MURAL_ZONES.find((z) => {
      if (zoneDoneRef.current[z.id]) return false;
      const inPrimary = x >= z.x - 10 && x <= z.x + z.w + 10 && y >= z.y - 10 && y <= z.y + z.h + 10;
      if (inPrimary) return true;
      if (z.id === 'arches') {
        const rx = WALL_W - z.x - z.w;
        return x >= rx - 10 && x <= rx + z.w + 10 && y >= z.y - 10 && y <= z.y + z.h + 10;
      }
      return false;
    });

    if (!hitZone) return;

    const brushColorId = selectedColorRef.current;
    const requiredMeta = WALL_PALETTE.find((c) => c.id === hitZone.requiredColor)!;
    const brushMeta = WALL_PALETTE.find((c) => c.id === brushColorId)!;

    // 3. Color Match Check
    if (brushColorId !== hitZone.requiredColor) {
      spawnSplash(x, y, '#F43F5E', 7);
      penalize(
        `🎨 തെറ്റായ നിറം! "${hitZone.label}" പെയിന്റ് ചെയ്യാൻ ${requiredMeta.emoji} ${requiredMeta.label} തിരഞ്ഞെടുക്കൂ!`
      );
      return;
    }

    // 4. Valid Smooth Brush Stroke! Mark grid cells covered by brush radius
    spawnSplash(x, y, brushMeta.color, 4);
    const localX =
      hitZone.id === 'arches' && x > WALL_W / 2 ? x - (WALL_W - hitZone.x - hitZone.w) : x - hitZone.x;
    const localY = y - hitZone.y;
    const col = Math.max(0, Math.min(hitZone.cols - 1, Math.floor((localX / hitZone.w) * hitZone.cols)));
    const row = Math.max(0, Math.min(hitZone.rows - 1, Math.floor((localY / hitZone.h) * hitZone.rows)));

    const cellSet = zoneCellsRef.current[hitZone.id];
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const cc = col + dc;
        const rr = row + dr;
        if (cc >= 0 && cc < hitZone.cols && rr >= 0 && rr < hitZone.rows) {
          cellSet.add(`${cc},${rr}`);
        }
      }
    }

    const totalCells = hitZone.cols * hitZone.rows;
    if (cellSet.size >= Math.ceil(totalCells * 0.72) && !zoneDoneRef.current[hitZone.id]) {
      zoneDoneRef.current[hitZone.id] = true;
      spawnSplash(x, y, '#FACC15', 14);
      sound.playSuccess(completedZones.length + 1);
      setCompletedZones((prev) => {
        const next = prev.includes(hitZone.id) ? prev : [...prev, hitZone.id];
        const remaining = MURAL_ZONES.find((m) => !next.includes(m.id));
        if (remaining) {
          const nextCol = WALL_PALETTE.find((c) => c.id === remaining.requiredColor)!;
          setStatusMsg({
            text: `✨ "${hitZone.label}" മനോഹരമായി! ഇനി ${nextCol.emoji} ${nextCol.label} എടുത്ത് "${remaining.label}" പെയിന്റ് ചെയ്യൂ!`,
            tone: 'ok',
          });
        } else {
          setWon(true);
          sound.playHoist();
          onAwardXp(35, `wall_write_${xpKey}`);
          onComplete?.();
          stagePortal?.notifyStageWin(
            'അനുവാദമുള്ള ചുമരിൽ 5 ഭാഗങ്ങളും മനോഹരമായി പെയിന്റ് ചെയ്ത് സമ്മേളന ചുമരെഴുത്ത് പൂർത്തിയാക്കി!'
          );
          narrator.speak('മനോഹരം! സമ്മേളന ചുമരിലെഴുത്ത് വൃത്തിയായും ഭംഗിയായും പൂർത്തിയാക്കി!');
        }
        return next;
      });
    }
  };

  const reset = () => {
    sound.playClick();
    zoneCellsRef.current = {
      flag: new Set(),
      skssf: new Set(),
      conference: new Set(),
      motto: new Set(),
      arches: new Set(),
    };
    zoneDoneRef.current = {
      flag: false,
      skssf: false,
      conference: false,
      motto: false,
      arches: false,
    };
    particlesRef.current = [];
    lastPenaltyTsRef.current = 0;
    setCompletedZones([]);
    setShields(3);
    setTimeLeft(WALL_TIME_LIMIT);
    setSelectedColor('sky');
    setWon(false);
    setFailReason('');
    setStatusMsg({
      text: '🖌️ തിളങ്ങുന്ന ഭാഗത്തിന് ചേരുന്ന നിറം തിരഞ്ഞെടുത്ത് വിരൽ ഓടിച്ച് പെയിന്റ് ചെയ്യൂ! (സ്വകാര്യ ഗേറ്റിൽ തട്ടരുത്!)',
      tone: 'info',
    });
  };

  const requiredColorMeta = activeZone
    ? WALL_PALETTE.find((c) => c.id === activeZone.requiredColor)
    : null;

  return (
    <div className="relative bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-2.5 shadow-sm overflow-hidden select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-emerald-950 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center text-sm shrink-0">
            🖌️
          </span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-extrabold text-amber-300 truncate">
              സമ്മേളന ചുമരിലെഴുത്ത് സ്റ്റുഡിയോ
            </p>
            <p className="text-[10px] font-bold text-emerald-200 truncate">
              {activeZone && requiredColorMeta
                ? `അടുത്തത്: ${activeZone.label} → ${requiredColorMeta.emoji} ${requiredColorMeta.label}`
                : '🎉 ചുമരെഴുത്ത് 100% പൂർത്തിയായി!'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-lg text-xs font-black tabular-nums border ${
              timeLeft <= 12
                ? 'bg-rose-600/80 border-rose-300 text-white animate-pulse'
                : 'bg-white/10 border-white/20 text-amber-300'
            }`}
          >
            ⏱️ {timeLeft}s
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white/10 text-emerald-200 text-xs font-black tabular-nums">
            {completedZones.length}/{MURAL_ZONES.length}
          </span>
          <GameShatterLives lives={shields} maxLives={3} dark compact />
          <button
            type="button"
            onClick={reset}
            aria-label="വീണ്ടും തുടങ്ങാം"
            className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Paint Bucket Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {WALL_PALETTE.map((bucket) => {
          const isSelected = selectedColor === bucket.id;
          const isNeeded = activeZone?.requiredColor === bucket.id && !won && !failed;
          return (
            <button
              key={bucket.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedColor(bucket.id);
              }}
              className={`min-w-0 px-2 py-2 rounded-xl border-2 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-slate-950 bg-slate-900 text-white shadow-md scale-[1.02]'
                  : isNeeded
                  ? 'border-amber-400 bg-amber-50 text-slate-900 ring-2 ring-amber-200'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-white shadow-xs shrink-0"
                style={{ backgroundColor: bucket.color }}
              />
              <span className="leading-tight break-words text-left">{bucket.label}</span>
            </button>
          );
        })}
      </div>

      {/* Fixed-Aspect Zero-Flicker Compound Wall Canvas */}
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={WALL_W}
          height={WALL_H}
          onPointerDown={(e) => {
            sound.unlockAudio();
            paintingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            handleBrushAt(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!paintingRef.current) return;
            handleBrushAt(e.clientX, e.clientY);
          }}
          onPointerUp={() => {
            paintingRef.current = false;
            pointerPosRef.current = null;
          }}
          onPointerCancel={() => {
            paintingRef.current = false;
            pointerPosRef.current = null;
          }}
          className="w-full aspect-[2/1] block touch-none cursor-crosshair"
        />
      </div>

      {/* Fixed-Height Status Strip (NEVER mounts/unmounts — zero layout jump!) */}
      <div
        className={`rounded-xl px-3 py-2 text-xs font-extrabold border min-h-[38px] flex items-center transition-colors ${
          statusMsg.tone === 'err'
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : statusMsg.tone === 'ok'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}
      >
        {statusMsg.text}
      </div>

      {failed && (
        <GameDefeatBurstOverlay
          title="🖌️ ചുമരെഴുത്ത് ദൗത്യം പരാജയപ്പെട്ടു!"
          reason={
            failReason ||
            'തെറ്റായ നിറം / അനുവാദമില്ലാത്ത സ്വകാര്യ ചുമരിൽ പെയിന്റ് തട്ടിയതിനാൽ കവചം തകർന്നു!'
          }
          scoreText={`പൂർത്തിയാക്കിയ ഭാഗങ്ങൾ: ${completedZones.length}/${MURAL_ZONES.length}`}
          onRetry={reset}
        />
      )}

      {won && <GameDoneNextBar onReplay={reset} />}
    </div>
  );
};

/* ============================================================================
 * 2. STAGE BUILD SEQUENCE GAME (സമ്മേളന സ്റ്റേജ് നിർമ്മാണം — 7 ഘട്ടങ്ങൾ!)
 *    Shuffled Stage Parts + 2 Unsafe Distractors + 30s Countdown + 3 Shields!
 * ========================================================================== */
interface StageStepItem {
  id: 'floor' | 'cloth' | 'roof' | 'flex' | 'flowers' | 'chairs' | 'podium' | 'bad_wire' | 'bad_trash';
  emoji: string;
  label: string;
  clue?: string;
  unsafe?: boolean;
}

const STAGE_CORRECT_ORDER: StageStepItem[] = [
  { id: 'floor', emoji: '🪵', label: 'തറ ഒരുക്കൽ', clue: 'ആദ്യം സ്റ്റേജിന്റെ ബലമുള്ള അടിത്തറ (തറ) സ്ഥാപിക്കൂ!' },
  { id: 'cloth', emoji: '🧵', label: 'തുണി കെട്ടൽ', clue: 'തറയ്ക്ക് ചുറ്റും ഭംഗിയായി നീല തുണി കെട്ടൂ!' },
  { id: 'roof', emoji: '⛺', label: 'മേൽക്കൂര മറയ്ക്കൽ', clue: 'വെയിലും മഴയും തടയാൻ തൂണുകളും മേൽക്കൂരയും ഉയർത്തൂ!' },
  { id: 'flex', emoji: '🖼️', label: 'പിന്നിൽ ഫ്ലെക്സ്', clue: 'വേദിയുടെ പിന്നിൽ SKSSF സമ്മേളന ഫ്ലെക്സ് ബാനർ കെട്ടൂ!' },
  { id: 'flowers', emoji: '🌸', label: 'മുന്നിൽ പൂക്കൾ', clue: 'സ്റ്റേജിന്റെ മുൻവശം പൂക്കൾ കൊണ്ട് അലങ്കരിക്കൂ!' },
  { id: 'chairs', emoji: '🪑', label: 'കസേരകൾ നിരത്തൽ', clue: 'അതിഥികൾക്ക് ഇരിക്കാൻ കസേരകൾ വരിയായി നിരത്തൂ!' },
  { id: 'podium', emoji: '🎙️', label: 'പ്രസംഗപീഠം & മൈക്ക്', clue: 'അവസാനമായി പ്രസംഗപീഠവും മൈക്കും സജ്ജമാക്കൂ!' },
];

const STAGE_UNSAFE_DISTRACTORS: StageStepItem[] = [
  { id: 'bad_wire', emoji: '⚡', label: 'പൊട്ടിയ വയർ', unsafe: true },
  { id: 'bad_trash', emoji: '🗑️', label: 'പഴയ പെട്ടികൾ', unsafe: true },
];

type StageStepId = StageStepItem['id'];
const STAGE_TIME_LIMIT = 30;

function shuffleStageParts(): StageStepItem[] {
  const all = [...STAGE_CORRECT_ORDER, ...STAGE_UNSAFE_DISTRACTORS];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

export const StageBuildSequenceGame: React.FC<PracticalGameProps> = ({
  xpKey,
  onAwardXp,
  onComplete,
}) => {
  const stagePaused = useGameStagePaused();
  const stagePortal = useGameStagePortal();
  const [deck, setDeck] = useState<StageStepItem[]>(() => shuffleStageParts());
  const [placed, setPlaced] = useState<StageStepId[]>([]);
  const [shields, setShields] = useState(3);
  const [timeLeft, setTimeLeft] = useState(STAGE_TIME_LIMIT);
  const [touchedTip, setTouchedTip] = useState<{ text: string; tone: 'info' | 'ok' | 'err' }>({
    text: `📋 ഘട്ടം 1/7: ${STAGE_CORRECT_ORDER[0].clue}`,
    tone: 'info',
  });
  const [failReason, setFailReason] = useState('');
  const [won, setWon] = useState(false);

  const failed = (shields <= 0 || timeLeft <= 0) && !won;

  // Countdown timer (pauses cleanly during blurred briefing / defeat / win overlays)
  useEffect(() => {
    if (won || failed || stagePaused) return;
    const t = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(t);
          setFailReason('⏱️ സമയം തീർന്നു! സമ്മേളനം തുടങ്ങുന്നതിന് മുമ്പ് സ്റ്റേജ് ഒരുക്കാൻ കഴിഞ്ഞില്ല.');
          sound.playError();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [won, failed, stagePaused]);

  const handleStep = (step: StageStepItem) => {
    sound.unlockAudio();
    if (failed || won || placed.includes(step.id)) return;

    if (step.unsafe) {
      sound.playError();
      const msg =
        step.id === 'bad_wire'
          ? '⚡ അപകടം! പൊട്ടിയ വൈദ്യുതി വയർ വേദിയിൽ വെക്കരുത്! (-1 കവചം)'
          : '🗑️ അശ്രദ്ധ! പഴയ പെട്ടികൾ വേദിയിൽ വെച്ചാൽ വൃത്തികേടാകും! (-1 കവചം)';
      setTouchedTip({ text: msg, tone: 'err' });
      setShields((prev) => {
        const rem = Math.max(0, prev - 1);
        if (rem === 0) setFailReason(msg);
        return rem;
      });
      return;
    }

    const expected = STAGE_CORRECT_ORDER[placed.length];
    if (step.id !== expected.id) {
      sound.playError();
      const msg = `⚠️ ക്രമം തെറ്റി! "${step.label}" ഇപ്പോഴല്ല — ${expected.clue}`;
      setTouchedTip({ text: msg, tone: 'err' });
      setShields((prev) => {
        const rem = Math.max(0, prev - 1);
        if (rem === 0) setFailReason('3 തവണ തെറ്റായ ക്രമത്തിൽ സ്റ്റേജ് ഒരുക്കിയതിനാൽ നിർമ്മാണം തകർന്നു!');
        return rem;
      });
      return;
    }

    sound.playPop();
    const next = [...placed, step.id];
    setPlaced(next);

    if (next.length === STAGE_CORRECT_ORDER.length && !won) {
      setWon(true);
      sound.playHoist();
      onAwardXp(30, `stage_build_${xpKey}`);
      onComplete?.();
      stagePortal?.notifyStageWin(
        'തറ മുതൽ പ്രസംഗപീഠം വരെ 7 ഘട്ടങ്ങളും സുരക്ഷിതമായി പൂർത്തിയാക്കി സമ്മേളന വേദി ഒരുക്കി!'
      );
      narrator.speak('ഗംഭീരം! തറ മുതൽ പ്രസംഗപീഠം വരെ പരിപാടി സ്റ്റേജ് പൂർണ്ണമായി ഒരുക്കി!');
    } else {
      const nextStep = STAGE_CORRECT_ORDER[next.length];
      setTouchedTip({
        text: `✅ ${step.emoji} ${step.label} പൂർത്തിയായി! ഇനി ഘട്ടം ${next.length + 1}/7: ${nextStep.clue}`,
        tone: 'ok',
      });
    }
  };

  const reset = () => {
    sound.playClick();
    setDeck(shuffleStageParts());
    setPlaced([]);
    setShields(3);
    setTimeLeft(STAGE_TIME_LIMIT);
    setWon(false);
    setFailReason('');
    setTouchedTip({
      text: `📋 ഘട്ടം 1/7: ${STAGE_CORRECT_ORDER[0].clue}`,
      tone: 'info',
    });
  };

  const has = (id: StageStepId) => placed.includes(id);

  return (
    <div className="relative bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-2.5 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-emerald-950 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center text-sm shrink-0">
            🏗️
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-amber-300 truncate">
            സമ്മേളന സ്റ്റേജ് നിർമ്മാണം ({placed.length}/7)
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-lg text-xs font-black tabular-nums border ${
              timeLeft <= 8
                ? 'bg-rose-600/80 border-rose-300 text-white animate-pulse'
                : 'bg-white/10 border-white/20 text-amber-300'
            }`}
          >
            ⏱️ {timeLeft}s
          </span>
          <GameShatterLives lives={shields} maxLives={3} dark compact />
          <button
            type="button"
            onClick={reset}
            aria-label="വീണ്ടും തുടങ്ങാം"
            className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Progressive Stage SVG */}
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-sky-900 via-emerald-950 to-slate-900 p-2 overflow-hidden">
        <svg viewBox="0 0 600 240" className="w-full h-auto max-h-[215px]">
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

      {/* Logical Construction Clue Strip */}
      <div
        className={`rounded-xl px-3 py-2 text-xs font-extrabold border min-h-[38px] flex items-center ${
          touchedTip.tone === 'err'
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : touchedTip.tone === 'ok'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}
      >
        {touchedTip.text}
      </div>

      {/* Shuffled Stage Parts + Unsafe Distractors (NO spoiler numbers or yellow highlights!) */}
      <div className="grid grid-cols-3 gap-1.5">
        {deck.map((step) => {
          const done = has(step.id);
          return (
            <button
              key={step.id}
              type="button"
              disabled={done || failed || won}
              onClick={() => handleStep(step)}
              className={`py-2 px-2 rounded-xl border-2 border-b-4 text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                done
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700 opacity-55 cursor-default'
                  : 'bg-slate-50 hover:bg-emerald-50 border-slate-300 hover:border-emerald-500 text-slate-900'
              }`}
            >
              <span className="text-lg leading-none shrink-0">{done ? '✅' : step.emoji}</span>
              <span className="text-[11px] font-extrabold leading-tight truncate">{step.label}</span>
            </button>
          );
        })}
      </div>

      {failed && (
        <GameDefeatBurstOverlay
          title="🏗️ സ്റ്റേജ് നിർമ്മാണം പരാജയപ്പെട്ടു!"
          reason={
            failReason ||
            'ശരിയായ ക്രമത്തിലല്ലാതെ തിരഞ്ഞെടുത്തതോ സമയം തീർന്നതോ കാരണം വേദി നിർമ്മാണം തകർന്നു!'
          }
          scoreText={`പൂർത്തിയാക്കിയ ഘട്ടങ്ങൾ: ${placed.length}/${STAGE_CORRECT_ORDER.length}`}
          onRetry={reset}
        />
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

const STADIUM_GOOD_GEAR = [
  { id: 'g1', emoji: '🎙️', label: 'സ്റ്റേജ് മൈക്ക് (കളയരുത്!)', left: '44%', top: '44%' },
  { id: 'g2', emoji: '🚩', label: 'SKSSF കൊടി (കളയരുത്!)', left: '84%', top: '42%' },
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
  const [shields, setShields] = useState(3);
  const [timeLeft, setTimeLeft] = useState(25);
  const [started, setStarted] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);

  const allLoaded = collected.length === STADIUM_WASTE.length;
  const failed = (shields <= 0 || timeLeft <= 0) && !disposed;

  useEffect(() => {
    if (!started || disposed || failed) return;
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
  }, [started, disposed, failed]);

  const pickWaste = (id: string) => {
    sound.unlockAudio();
    if (failed || disposed || collected.includes(id)) return;
    if (!started) setStarted(true);
    sound.playPop();
    setWarn(null);
    setCollected((prev) => [...prev, id]);
  };

  const hitGoodGear = (label: string) => {
    sound.unlockAudio();
    if (failed || disposed) return;
    if (!started) setStarted(true);
    sound.playError();
    const rem = Math.max(0, shields - 1);
    setShields(rem);
    setWarn(`⚠️ അത് മാലിന്യമല്ല! ${label} — 1 ഷീൽഡ് പൊട്ടി!`);
  };

  const handleDispose = () => {
    if (!allLoaded || disposed || failed) return;
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
    setShields(3);
    setTimeLeft(25);
    setStarted(false);
    setWarn(null);
  };

  return (
    <div className="relative bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-2.5 shadow-sm overflow-hidden">
      <CompactGameBar
        icon="🏟️"
        progress={`${collected.length}/${STADIUM_WASTE.length} · ⏱️${timeLeft}s`}
        title="🏟️ പരിപാടി ഗ്രൗണ്ട് / സ്റ്റേഡിയം ശുചീകരണം"
        subtitle="25 സെക്കൻഡിനുള്ളിൽ മാലിന്യങ്ങൾ മാത്രം വിഖായ വാഹനത്തിലേക്ക് ശേഖരിച്ച് ഡിസ്പോസ് ചെയ്യൂ! 🎙️ മൈക്കും 🚩 കൊടിയും കളയരുത്!"
        done={disposed}
        shields={shields}
        logoSrc={OFFICIAL_WING_LOGOS.viqaya.src}
        logoAlt={OFFICIAL_WING_LOGOS.viqaya.label}
        onReset={reset}
      />

      <div className="relative h-56 rounded-2xl border-2 border-emerald-400 bg-gradient-to-b from-sky-200 via-emerald-200 to-emerald-500 overflow-hidden">
        {/* Stadium Stands Backdrop */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-slate-800 to-slate-700/85 flex items-center justify-between px-4 text-xs font-extrabold text-amber-300">
          <span>🏟️ {disposed ? '✨ വൃത്തിയായി!' : `മാലിന്യം: ${collected.length}/${STADIUM_WASTE.length}`}</span>
          <span className={timeLeft <= 6 ? 'text-rose-300 animate-pulse' : 'text-emerald-200'}>⏱️ {timeLeft}s</span>
        </div>

        {/* Good Equipment Decoys (DO NOT THROW!) */}
        {STADIUM_GOOD_GEAR.map((g) => (
          <motion.button
            key={g.id}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => hitGoodGear(g.label)}
            style={{ left: g.left, top: g.top }}
            title={g.label}
            aria-label={g.label}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-emerald-950/90 border-2 border-emerald-300 shadow-md flex items-center justify-center text-xl cursor-pointer"
          >
            {g.emoji}
          </motion.button>
        ))}

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

      {warn && !failed && (
        <p className="text-xs font-extrabold text-rose-800 bg-rose-50 border border-rose-300 rounded-xl px-3 py-1.5">
          {warn}
        </p>
      )}

      {allLoaded && !disposed && !failed && (
        <button
          type="button"
          onClick={handleDispose}
          className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold border-b-4 border-amber-700 shadow-sm cursor-pointer"
        >
          🚛 ♻️ ഡിസ്പോസ് ചെയ്യാം!
        </button>
      )}

      {failed && (
        <GameDefeatBurstOverlay
          title={timeLeft <= 0 ? '⏱️ ശുചീകരണ സമയം കഴിഞ്ഞു!' : '⚠️ നല്ല സാധനങ്ങൾ മാലിന്യത്തിൽ ഇട്ടു!'}
          reason="🎙️ മൈക്കും 🚩 കൊടിയും തൊടാതെ മാലിന്യങ്ങൾ മാത്രം വേഗത്തിൽ ശേഖരിച്ച് ഡിസ്പോസ് ചെയ്യൂ!"
          scoreText={`🗑️ ${collected.length}/${STADIUM_WASTE.length}`}
          onRetry={reset}
        />
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
          ? '❌ തെറ്റി! ഏറ്റവും മുകളിലെ തട്ട് വിശുദ്ധ ഖുർആനിന് (മുസ്ഹഫ്) മാത്രമുള്ളതാണ്! (1 ഷീൽഡ് പൊട്ടി)'
          : `❌ തെറ്റി! ${chosen?.label} — അദബ് ക്രമപ്രകാരം ശരിയായ തട്ടിൽ വെക്കൂ! (1 ഷീൽഡ് പൊട്ടി)`
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
    <div className="relative bg-white rounded-2xl border-2 border-emerald-200 p-3 sm:p-4 space-y-3 shadow-sm overflow-hidden">
      <CompactGameBar
        icon="📚"
        progress={`${placed.length}/${LIBRARY_SHELVES.length}`}
        title="📚 മദ്രസാ കിതാബ് അലമാര — അദബ് ക്രമം"
        subtitle="ഖുർആൻ ഏറ്റവും മുകളിൽ, തുടർന്ന് തഫ്സീർ, ഹദീസ്, ഫിഖ്ഹ്, ചരിത്രം, സത്യധാര എന്ന ക്രമത്തിൽ തടി അലമാരയുടെ തട്ടുകളിൽ അടുക്കിവെക്കൂ!"
        done={won}
        shields={lives}
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

      {/* Animated Shatter Defeat Overlay */}
      {failed && (
        <GameDefeatBurstOverlay
          title="📚 കിതാബ് അദബ് ക്രമം തെറ്റി!"
          reason="ഖുർആൻ → തഫ്സീർ → ഹദീസ് → ഫിഖ്ഹ് → ചരിത്രം → പൊതുപുസ്തകങ്ങൾ എന്ന ക്രമത്തിൽ വീണ്ടും അടുക്കിവെക്കൂ."
          scoreText={`📚 ${placed.length}/${LIBRARY_SHELVES.length}`}
          onRetry={reset}
        />
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
  const [shields, setShields] = useState(3);
  const [msg, setMsg] = useState<string | null>(null);
  const [won, setWon] = useState(isCompleted);
  const failed = shields <= 0 && !won;

  const agendaDone = Object.keys(assigned).length === AGENDA_SLOTS.length;

  const assignSlot = (slot: (typeof AGENDA_SLOTS)[number]) => {
    sound.unlockAudio();
    if (failed || won || assigned[slot.id]) return;
    if (!selectedPerson) {
      setMsg('👆 ആദ്യം താഴെ നിന്ന് ഒരു വ്യക്തിയെ തിരഞ്ഞെടുക്കൂ!');
      return;
    }
    if (selectedPerson !== slot.expectedPerson) {
      sound.playError();
      const rem = Math.max(0, shields - 1);
      setShields(rem);
      setMsg(`⚠️ ${slot.role} — അനുയോജ്യമായ സ്ഥാനമുള്ളയാളെ തിരഞ്ഞെടുക്കൂ! (ബാക്കി ഷീൽഡ്: ${rem})`);
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
    if (failed || stamps.includes(id)) return;
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
    setShields(3);
    setMsg(null);
    setWon(false);
  };

  return (
    <div className="relative bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-2.5 shadow-sm overflow-hidden">
      <CompactGameBar
        icon="📜"
        progress={agendaDone ? `നോട്ടീസ് ${stamps.length}/3` : `അജണ്ട ${Object.keys(assigned).length}/7`}
        title="📜 മജ്‌ലിസുന്നൂർ അജണ്ട & നോട്ടീസ്"
        subtitle="ഘട്ടം 1: ഓരോ പരിപാടിക്കും അനുയോജ്യരായവരെ ചുമതലപ്പെടുത്തൂ (3 തവണ തെറ്റിയാൽ ഷീൽഡുകൾ പൊട്ടും). ഘട്ടം 2: നോട്ടീസ് തയ്യാറാക്കൂ!"
        done={won}
        shields={shields}
        logoSrc={OFFICIAL_WING_LOGOS.majlisunnoor.src}
        logoAlt={OFFICIAL_WING_LOGOS.majlisunnoor.label}
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
              <div className="flex items-center gap-1.5">
                <img
                  src={OFFICIAL_WING_LOGOS.majlisunnoor.src}
                  alt={OFFICIAL_WING_LOGOS.majlisunnoor.label}
                  className="h-9 w-auto rounded-lg bg-white p-0.5 border border-amber-300 object-contain"
                />
                <img
                  src={OFFICIAL_WING_LOGOS.ibad.src}
                  alt={OFFICIAL_WING_LOGOS.ibad.label}
                  className="h-7 w-auto rounded-lg bg-white px-1.5 py-0.5 border border-amber-300 object-contain"
                />
              </div>
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

      {msg && !won && !failed && (
        <p className="text-xs font-extrabold text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
          {msg}
        </p>
      )}

      {failed && (
        <GameDefeatBurstOverlay
          title="📜 അജണ്ട ചുമതലകൾ തെറ്റി!"
          reason="ഖിറാഅത്ത് (ഹാഫിള്), പ്രാർത്ഥന (ഖത്തീബ്), സ്വാഗതം (സെക്രട്ടറി), അധ്യക്ഷൻ (പ്രസിഡന്റ്) എന്നിങ്ങനെ കൃത്യമായി തിരഞ്ഞെടുക്കൂ!"
          scoreText={`📜 ${Object.keys(assigned).length}/7`}
          onRetry={reset}
        />
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
  const [incInput, setIncInput] = useState(isCompleted ? '10000' : '');
  const [expInput, setExpInput] = useState(isCompleted ? '8000' : '');
  const [balInput, setBalInput] = useState(isCompleted ? '2000' : '');
  const [activeField, setActiveField] = useState<'inc' | 'exp' | 'bal'>('inc');
  const [calcExpr, setCalcExpr] = useState('0');
  const [shields, setShields] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(
    isCompleted
      ? null
      : '🧮 വരവും ചെലവും ടൈപ്പ് ചെയ്തോ അടുത്തുള്ള കാൽക്കുലേറ്റർ ഉപയോഗിച്ചോ കൂട്ടി “ആകെ വരവ്”, “ആകെ ചെലവ്”, “നീക്കിയിരിപ്പ്” എന്നിവ നൽകൂ!'
  );
  const [won, setWon] = useState(isCompleted);

  const failed = shields <= 0 && !won;
  const expectedInc = INCOME_ITEMS.reduce((s, i) => s + i.amount, 0); // 10000
  const expectedExp = EXPENSE_ITEMS.reduce((s, e) => s + e.amount, 0); // 8000
  const expectedBal = expectedInc - expectedExp; // 2000

  const evalCalcSafe = (expr: string): number | null => {
    const cleaned = expr.replace(/[^0-9+\-*/.]/g, '');
    if (!cleaned) return null;
    try {
      // Safe arithmetic tokenizer (+, -, *, /) without eval
      const tokens = cleaned.match(/(\d+(\.\d+)?|[+\-*/])/g);
      if (!tokens || tokens.length === 0) return null;
      let acc = Number(tokens[0]);
      if (Number.isNaN(acc)) return null;
      for (let i = 1; i < tokens.length; i += 2) {
        const op = tokens[i];
        const nextNum = Number(tokens[i + 1]);
        if (Number.isNaN(nextNum)) break;
        if (op === '+') acc += nextNum;
        else if (op === '-') acc -= nextNum;
        else if (op === '*') acc *= nextNum;
        else if (op === '/') acc = nextNum === 0 ? 0 : acc / nextNum;
      }
      return Math.round(acc);
    } catch {
      return null;
    }
  };

  const handleCalcPress = (key: string) => {
    sound.playClick();
    if (key === 'C') {
      setCalcExpr('0');
      return;
    }
    if (key === '⌫') {
      setCalcExpr((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
      return;
    }
    if (key === '=') {
      const res = evalCalcSafe(calcExpr);
      if (res !== null) setCalcExpr(String(res));
      return;
    }
    setCalcExpr((prev) => {
      if (prev === '0' && /^[0-9]$/.test(key)) return key;
      if (/[+\-*/]$/.test(prev) && /[+\-*/]/.test(key)) {
        return prev.slice(0, -1) + key;
      }
      return prev + key;
    });
  };

  const copyCalcToActiveField = () => {
    sound.playPop();
    const res = evalCalcSafe(calcExpr);
    const valStr = res !== null ? String(res) : calcExpr.replace(/[^0-9]/g, '');
    if (activeField === 'inc') setIncInput(valStr);
    else if (activeField === 'exp') setExpInput(valStr);
    else setBalInput(valStr);
    setCalcExpr(valStr || '0');
  };

  const handleVerifyLedger = () => {
    sound.unlockAudio();
    if (failed || won) return;
    const vInc = Number(incInput.replace(/[^0-9-]/g, ''));
    const vExp = Number(expInput.replace(/[^0-9-]/g, ''));
    const vBal = Number(balInput.replace(/[^0-9-]/g, ''));

    if (vInc === expectedInc && vExp === expectedExp && vBal === expectedBal) {
      setWon(true);
      setFeedback('🎉 കൃത്യമായ കണക്ക്! വരവ് ₹10,000 − ചെലവ് ₹8,000 = നീക്കിയിരിപ്പ് ₹2,000!');
      sound.playHoist();
      onAwardXp(30, `budget_cheerani_${xpKey}`);
      onComplete?.();
      narrator.speak('കൃത്യമായ കണക്ക്! വരവ് പതിനായിരം, ചെലവ് എട്ടായിരം, നീക്കിയിരിപ്പ് രണ്ടായിരം രൂപ!');
      window.setTimeout(() => scrollToActiveQuiz(), 900);
      return;
    }

    sound.playError();
    const rem = Math.max(0, shields - 1);
    setShields(rem);
    const wrongParts: string[] = [];
    if (vInc !== expectedInc) wrongParts.push('ആകെ വരവ്');
    if (vExp !== expectedExp) wrongParts.push('ആകെ ചെലവ്');
    if (vBal !== expectedBal) wrongParts.push('നീക്കിയിരിപ്പ്');
    setFeedback(
      `❌ കണക്ക് തെറ്റി! (${wrongParts.join(', ')}) വീണ്ടും കാൽക്കുലേറ്റർ ഉപയോഗിച്ച് പരിശോധിക്കൂ — ബാക്കി ഷീൽഡ്: ${rem}`
    );
  };

  const reset = () => {
    sound.playClick();
    setIncInput('');
    setExpInput('');
    setBalInput('');
    setActiveField('inc');
    setCalcExpr('0');
    setShields(3);
    setWon(false);
    setFeedback(
      '🧮 വരവും ചെലവും ടൈപ്പ് ചെയ്തോ അടുത്തുള്ള കാൽക്കുലേറ്റർ ഉപയോഗിച്ചോ കൂട്ടി “ആകെ വരവ്”, “ആകെ ചെലവ്”, “നീക്കിയിരിപ്പ്” എന്നിവ നൽകൂ!'
    );
  };

  const calcButtons = ['7', '8', '9', '+', '4', '5', '6', '-', '1', '2', '3', '*', 'C', '0', '⌫', '='];

  return (
    <div className="relative bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-3 shadow-sm overflow-hidden">
      <CompactGameBar
        icon="💰"
        progress={won ? '₹2,000 ✅' : 'കണക്ക് പരിശോധിക്കൂ'}
        title="💰 വരവ് – ചെലവ് – നീക്കിയിരിപ്പ് & കാൽക്കുലേറ്റർ"
        subtitle="വരവ് തുകകളും ചെലവ് തുകകളും കൂട്ടി താഴത്തെ ടോട്ടൽ കോളങ്ങളിൽ ടൈപ്പ് ചെയ്യുകയോ കാൽക്കുലേറ്റർ ഉപയോഗിച്ച് നൽകുകയോ ചെയ്യൂ. തെറ്റിയാൽ ഷീൽഡ് പൊട്ടും!"
        done={won}
        shields={shields}
        onReset={reset}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* LEFT: Clear Income & Expense Ledger + Total Inputs */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Income Table */}
            <div className="rounded-2xl bg-emerald-50/85 border border-emerald-200 p-2.5 space-y-1.5">
              <p className="text-xs font-extrabold text-emerald-950 border-b border-emerald-200 pb-1">
                📥 വരവ് (Income)
              </p>
              {INCOME_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 text-xs font-bold text-slate-800 bg-white rounded-lg px-2 py-1 border border-emerald-100"
                >
                  <span>{item.emoji} {item.label}</span>
                  <span className="tabular-nums font-extrabold text-emerald-800">₹{item.amount}</span>
                </div>
              ))}
              <div className="pt-1">
                <label className="block text-[11px] font-extrabold text-emerald-950 mb-1">
                  ആകെ വരവ് (Total Income):
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  disabled={won || failed}
                  value={incInput}
                  onFocus={() => setActiveField('inc')}
                  onChange={(e) => setIncInput(e.target.value)}
                  placeholder="തുക ടൈപ്പ് ചെയ്യൂ..."
                  className={`w-full px-2.5 py-1.5 rounded-xl border-2 text-sm font-black tabular-nums bg-white ${
                    activeField === 'inc'
                      ? 'border-emerald-600 ring-2 ring-emerald-200'
                      : 'border-emerald-300'
                  }`}
                />
              </div>
            </div>

            {/* Expense Table */}
            <div className="rounded-2xl bg-amber-50/85 border border-amber-200 p-2.5 space-y-1.5">
              <p className="text-xs font-extrabold text-amber-950 border-b border-amber-200 pb-1">
                📤 ചെലവ് (Expense)
              </p>
              {EXPENSE_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-800 bg-white rounded-lg px-2 py-1 border border-amber-100"
                >
                  <span className="leading-tight">{item.emoji} {item.label}</span>
                  <span className="tabular-nums font-extrabold text-rose-700 shrink-0">₹{item.amount}</span>
                </div>
              ))}
              <div className="pt-1">
                <label className="block text-[11px] font-extrabold text-amber-950 mb-1">
                  ആകെ ചെലവ് (Total Expense):
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  disabled={won || failed}
                  value={expInput}
                  onFocus={() => setActiveField('exp')}
                  onChange={(e) => setExpInput(e.target.value)}
                  placeholder="തുക ടൈപ്പ് ചെയ്യൂ..."
                  className={`w-full px-2.5 py-1.5 rounded-xl border-2 text-sm font-black tabular-nums bg-white ${
                    activeField === 'exp'
                      ? 'border-amber-600 ring-2 ring-amber-200'
                      : 'border-amber-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Final Balance Input + Verify Button */}
          <div className="rounded-2xl bg-slate-900 text-white p-3 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs font-extrabold text-amber-300 shrink-0">
                ⚖️ നീക്കിയിരിപ്പ് (വരവ് − ചെലവ്):
              </label>
              <input
                type="number"
                inputMode="numeric"
                disabled={won || failed}
                value={balInput}
                onFocus={() => setActiveField('bal')}
                onChange={(e) => setBalInput(e.target.value)}
                placeholder="ബാക്കി തുക (₹)..."
                className={`flex-1 px-3 py-1.5 rounded-xl border-2 text-sm font-black tabular-nums text-slate-950 bg-white ${
                  activeField === 'bal'
                    ? 'border-amber-400 ring-2 ring-amber-300'
                    : 'border-slate-600'
                }`}
              />
            </div>

            {!won && !failed && (
              <button
                type="button"
                onClick={handleVerifyLedger}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black border-b-4 border-emerald-800 shadow-sm cursor-pointer"
              >
                ✅ കണക്ക് പരിശോധിക്കാം (Verify Total)
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Built-In Interactive Calculator right beside the Ledger! */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-950 border-2 border-slate-700 p-3 text-white space-y-2 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-300">
            <span>🧮 കാൽക്കുലേറ്റർ</span>
            <span className="text-emerald-300">
              ലക്ഷ്യം:{' '}
              {activeField === 'inc'
                ? 'ആകെ വരവ്'
                : activeField === 'exp'
                ? 'ആകെ ചെലവ്'
                : 'നീക്കിയിരിപ്പ്'}
            </span>
          </div>
          <div className="rounded-xl bg-emerald-950/90 border border-emerald-600/60 px-3 py-2 text-right font-mono text-lg font-black text-emerald-100 tabular-nums overflow-x-auto notranslate">
            {calcExpr}
          </div>
          <div className="grid grid-cols-4 gap-1.5 notranslate">
            {calcButtons.map((btn) => {
              const isOp = ['+', '-', '*', '='].includes(btn);
              const isClear = btn === 'C' || btn === '⌫';
              return (
                <button
                  key={btn}
                  type="button"
                  disabled={won || failed}
                  onClick={() => handleCalcPress(btn)}
                  className={`h-10 rounded-xl font-black text-sm border-b-2 transition-transform active:scale-95 cursor-pointer ${
                    btn === '='
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-800'
                      : isOp
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-700'
                      : isClear
                      ? 'bg-rose-700 hover:bg-rose-600 text-white border-rose-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-950'
                  }`}
                >
                  {btn === '*' ? '×' : btn === '-' ? '−' : btn}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={won || failed}
            onClick={copyCalcToActiveField}
            className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black border-b-3 border-sky-800 cursor-pointer"
          >
            ⬇️ ഈ സംഖ്യ “
            {activeField === 'inc'
              ? 'ആകെ വരവ്'
              : activeField === 'exp'
              ? 'ആകെ ചെലവ്'
              : 'നീക്കിയിരിപ്പ്'}
            ” കോളത്തിലേക്ക് ഇടൂ
          </button>
        </div>
      </div>

      {feedback && !failed && (
        <p
          className={`text-xs font-extrabold rounded-xl px-3 py-2 border ${
            won
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          {feedback}
        </p>
      )}

      {failed && (
        <GameDefeatBurstOverlay
          title="🧮 കണക്ക് 3 തവണ തെറ്റി!"
          reason="കാൽക്കുലേറ്റർ ഉപയോഗിച്ച് വരവ് (2500+3000+4500), ചെലവ് (2000+800+1200+1500+2500), നീക്കിയിരിപ്പ് (വരവ്−ചെലവ്) എന്നിവ കൃത്യമായി കണക്കുകൂട്ടൂ!"
          onRetry={reset}
        />
      )}

      {won && <GameDoneNextBar onReplay={reset} />}
    </div>
  );
};

/* ============================================================================
 * 7. POST-EVENT REVIEW REPORT GAME (പരിപാടി അവലോകന റിപ്പോർട്ട്)
 * ========================================================================== */
const REVIEW_OPTIONS = [
  { id: 'attendance', emoji: '👥', label: 'പങ്കാളിത്തവും സംഘാടന വിലയിരുത്തലും', valid: true },
  { id: 'bad_hide', emoji: '🙈', label: 'കണക്കുകൾ രഹസ്യമായി ഒളിപ്പിച്ചുവെക്കൽ', valid: false },
  { id: 'accounts', emoji: '💰', label: 'വരവ്–ചെലവ്–നീക്കിയിരിപ്പ് സുതാര്യ അവതരണം', valid: true },
  { id: 'cleanup', emoji: '🏟️', label: 'ചീരണി & വിഖായ ശുചീകരണ അവലോകനം', valid: true },
  { id: 'bad_litter', emoji: '🗑️', label: 'മാലിന്യം ഗ്രൗണ്ടിൽ ഉപേക്ഷിച്ച് മടങ്ങൽ', valid: false },
  { id: 'minutes', emoji: '📝', label: 'മിനിറ്റ്സ് ഒപ്പും മേൽഘടക റിപ്പോർട്ടും', valid: true },
];

export const ProgramReviewReportGame: React.FC<PracticalGameProps> = ({
  xpKey,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const validTotal = REVIEW_OPTIONS.filter((s) => s.valid).length;
  const [doneIds, setDoneIds] = useState<string[]>(
    isCompleted ? REVIEW_OPTIONS.filter((s) => s.valid).map((s) => s.id) : []
  );
  const [shields, setShields] = useState(3);
  const [warn, setWarn] = useState<string | null>(null);
  const [won, setWon] = useState(isCompleted);
  const failed = shields <= 0 && !won;

  const toggleSection = (sec: (typeof REVIEW_OPTIONS)[number]) => {
    sound.unlockAudio();
    if (failed || won || doneIds.includes(sec.id)) return;
    if (!sec.valid) {
      sound.playError();
      const rem = Math.max(0, shields - 1);
      setShields(rem);
      setWarn(`❌ “${sec.label}” നല്ല സംഘടനാ രീതിയല്ല! 1 ഷീൽഡ് പൊട്ടി (ബാക്കി: ${rem})`);
      return;
    }
    sound.playPop();
    setWarn(null);
    const next = [...doneIds, sec.id];
    setDoneIds(next);
    if (next.length === validTotal && !won) {
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
    setShields(3);
    setWarn(null);
    setWon(false);
  };

  return (
    <div className="relative bg-white rounded-2xl border-2 border-emerald-200 p-3 space-y-2.5 shadow-sm overflow-hidden">
      <CompactGameBar
        icon="📋"
        progress={`${doneIds.length}/${validTotal}`}
        title="📋 പരിപാടി അവലോകന റിപ്പോർട്ട്"
        subtitle="അവലോകന റിപ്പോർട്ടിൽ ഉൾപ്പെടുത്തേണ്ട 4 ശരിയായ ഭാഗങ്ങൾ മാത്രം തിരഞ്ഞെടുക്കൂ — തെറ്റായവ തിരഞ്ഞെടുത്താൽ ഷീൽഡ് പൊട്ടും!"
        done={won}
        shields={shields}
        onReset={reset}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {REVIEW_OPTIONS.map((sec) => {
          const done = doneIds.includes(sec.id);
          return (
            <button
              key={sec.id}
              type="button"
              disabled={done || failed}
              onClick={() => toggleSection(sec)}
              className={`p-3 rounded-2xl border-2 text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
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

      {warn && !failed && (
        <p className="text-xs font-extrabold text-rose-800 bg-rose-50 border border-rose-300 rounded-xl px-3 py-1.5">
          {warn}
        </p>
      )}

      {failed && (
        <GameDefeatBurstOverlay
          title="📋 അവലോകന റിപ്പോർട്ട് നിരസിച്ചു!"
          reason="സുതാര്യമായ കണക്ക്, പങ്കാളിത്തം, ശുചീകരണം, മിനിറ്റ്സ് എന്നീ 4 ശരിയായ കാര്യങ്ങൾ മാത്രം തിരഞ്ഞെടുക്കൂ!"
          scoreText={`📋 ${doneIds.length}/${validTotal}`}
          onRetry={reset}
        />
      )}

      {won && <GameDoneNextBar onReplay={reset} />}
    </div>
  );
};
