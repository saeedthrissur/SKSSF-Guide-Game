import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, Compass, Home, Info, Map as MapIcon, RotateCcw, Sparkles, X } from 'lucide-react';
import { sound } from '../utils/sound';
import { useGameStagePortal } from './GameFullscreenShell';
import guideLogoUrl from '../assets/images/guide_game_logo_1795638356373.jpg';

/* ============================================================================
 * 1. SHATTERABLE CRYSTAL SHIELD / GLASS ORB LIVES (Replaces ❤️ Hearts in Games)
 *    Hearts (❤️) are reserved strictly for Quiz! Games use shatterable crystal orbs
 *    that visibly crack and burst into flying glass shards when a mistake happens.
 * ========================================================================== */
export const formatShatterLives = (lives: number, maxLives = 3): string => {
  const safeLives = Math.max(0, Math.min(maxLives, lives));
  return `${'🛡️'.repeat(safeLives)}${'💥'.repeat(Math.max(0, maxLives - safeLives))}`;
};

const SHARD_VECTORS = [
  { x: -16, y: -14, r: -45 },
  { x: 16, y: -12, r: 52 },
  { x: -12, y: 14, r: -120 },
  { x: 15, y: 12, r: 95 },
  { x: 0, y: -19, r: 24 },
];

export const GameShatterLives: React.FC<{
  lives: number;
  maxLives?: number;
  dark?: boolean;
  compact?: boolean;
  label?: string;
}> = ({ lives, maxLives = 3, dark = true, compact = false, label }) => {
  const safeLives = Math.max(0, Math.min(maxLives, lives));
  const prevLivesRef = useRef(safeLives);
  const [shatterIdx, setShatterIdx] = useState<number | null>(null);

  useEffect(() => {
    if (safeLives < prevLivesRef.current) {
      setShatterIdx(safeLives);
      const t = window.setTimeout(() => setShatterIdx(null), 650);
      prevLivesRef.current = safeLives;
      return () => window.clearTimeout(t);
    }
    prevLivesRef.current = safeLives;
  }, [safeLives]);

  return (
    <motion.div
      animate={shatterIdx !== null ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.36 }}
      className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 border ${
        dark
          ? 'bg-slate-950/85 border-amber-400/35 text-amber-200'
          : 'bg-white border-emerald-200 text-slate-900 shadow-2xs'
      }`}
      aria-label={`ബാക്കി കവചങ്ങൾ ${safeLives} / ${maxLives}`}
      title={`കവചം: ${safeLives}/${maxLives}`}
    >
      {label && !compact && (
        <span className="text-[10px] font-extrabold opacity-80 mr-0.5">{label}</span>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxLives }).map((_, i) => {
          const intact = i < safeLives;
          const justShattered = shatterIdx === i;
          return (
            <div
              key={i}
              className="relative w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
            >
              {intact ? (
                <motion.svg
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  viewBox="0 0 28 28"
                  className="w-full h-full drop-shadow-xs"
                  aria-hidden="true"
                >
                  <path
                    d="M14 2 L24 6.5 V14.2 C24 20.2 19.6 24.4 14 26.2 C8.4 24.4 4 20.2 4 14.2 V6.5 Z"
                    fill="#10B981"
                    stroke="#FDE047"
                    strokeWidth="2"
                  />
                  <path
                    d="M14 5.5 L20.5 8.5 V14 C20.5 18.2 17.6 21.2 14 22.6 Z"
                    fill="#34D399"
                    opacity="0.55"
                  />
                  <polygon
                    points="14,8.5 15.6,12.2 19.5,12.5 16.5,15 17.4,18.8 14,16.7 10.6,18.8 11.5,15 8.5,12.5 12.4,12.2"
                    fill="#FEF08A"
                  />
                </motion.svg>
              ) : (
                <motion.svg
                  initial={justShattered ? { scale: 1.35, rotate: -10 } : { scale: 0.9 }}
                  animate={{ scale: 0.88, rotate: 0 }}
                  viewBox="0 0 28 28"
                  className="w-full h-full opacity-55"
                  aria-hidden="true"
                >
                  <path
                    d="M14 3 L23 7 V14 C23 19.5 19 23.4 14 25 C9 23.4 5 19.5 5 14 V7 Z"
                    fill="#334155"
                    stroke="#F43F5E"
                    strokeWidth="1.6"
                    strokeDasharray="3 2"
                  />
                  <path
                    d="M11 6 L15 13 L12 17 L16 23"
                    fill="none"
                    stroke="#FB7185"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </motion.svg>
              )}

              {/* Shattering Crystal Shard Particle Burst when lost */}
              {justShattered &&
                SHARD_VECTORS.map((sv, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                    animate={{ x: sv.x, y: sv.y, opacity: 0, scale: 0.4, rotate: sv.r }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="absolute w-2 h-2 bg-amber-300 border border-rose-500 rotate-45 pointer-events-none"
                  />
                ))}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

/* ============================================================================
 * 2. ANIMATED DEFEAT OVERLAY WITH SHATTERED SHIELD & EXPLOSION PARTICLES
 * ========================================================================== */
const DEFEAT_SHARDS = [
  { x: -75, y: -55, rot: -120, color: '#FDE047' },
  { x: 78, y: -48, rot: 145, color: '#FB7185' },
  { x: -64, y: 42, rot: -90, color: '#34D399' },
  { x: 68, y: 46, rot: 110, color: '#38BDF8' },
  { x: -24, y: -74, rot: -65, color: '#F97316' },
  { x: 26, y: -72, rot: 85, color: '#FACC15' },
  { x: -85, y: 4, rot: -155, color: '#F43F5E' },
  { x: 86, y: -4, rot: 135, color: '#A7F3D0' },
];

export const GameDefeatBurstOverlay: React.FC<{
  title?: string;
  reason: string;
  scoreText?: string;
  onRetry: () => void;
  overlay?: boolean;
}> = ({
  title = 'കവചം തകർന്നു — പരാജയപ്പെട്ടു!',
  reason,
  scoreText,
  onRetry,
  overlay = true,
}) => {
  const stagePortal = useGameStagePortal();

  // Whenever a defeat overlay mounts inside GameFullscreenShell, blur the entire game screen & center it over the stage!
  useEffect(() => {
    if (!stagePortal) return;
    stagePortal.setPortalOverlayActive(true);
    return () => {
      stagePortal.setPortalOverlayActive(false);
    };
  }, [stagePortal]);

  const card = (
    <motion.div
      initial={{ scale: 0.82, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className="relative max-w-sm w-full rounded-2xl border-2 border-rose-400 bg-slate-900/95 text-white p-5 text-center shadow-2xl space-y-3 overflow-hidden"
    >
      {/* Animated Shatter Shockwave Ring + Flying Shards */}
      <div className="relative h-16 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: 2.3, opacity: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="absolute w-14 h-14 rounded-full border-4 border-rose-400 pointer-events-none"
        />
        {DEFEAT_SHARDS.map((shard, idx) => (
          <motion.span
            key={idx}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1.1, rotate: 0 }}
            animate={{ x: shard.x, y: shard.y, opacity: 0, scale: 0.35, rotate: shard.rot }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            style={{ backgroundColor: shard.color }}
            className="absolute w-3 h-3 rounded-xs pointer-events-none"
          />
        ))}
        <motion.div
          animate={{ rotate: [0, -10, 10, -6, 6, 0], scale: [1.15, 0.95, 1] }}
          transition={{ duration: 0.55 }}
          className="relative z-10 w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-400/70 flex items-center justify-center"
        >
          <svg viewBox="0 0 40 40" className="w-10 h-10" aria-hidden="true">
            <path
              d="M20 4 L33 10 V20 C33 28 27 33.5 20 36 C13 33.5 7 28 7 20 V10 Z"
              fill="#881337"
              stroke="#FDA4AF"
              strokeWidth="2.4"
            />
            <path
              d="M17 8 L22 18 L16 23 L23 33"
              fill="none"
              stroke="#FEF08A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>

      <div className="space-y-1">
        <p className="text-sm sm:text-base font-extrabold text-amber-300 leading-snug">
          {title}
        </p>
        <p className="text-xs font-semibold text-slate-200 leading-relaxed">{reason}</p>
      </div>

      {scoreText && (
        <p className="text-xs font-extrabold text-rose-200 bg-rose-950/80 border border-rose-500/40 rounded-lg px-3 py-1 inline-block tabular-nums">
          {scoreText}
        </p>
      )}

      <div className="pt-1 flex justify-center">
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            sound.unlockAudio();
            sound.playClick();
            onRetry();
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-b-4 border-amber-700 text-xs sm:text-sm font-extrabold shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>വീണ്ടും കളിക്കാം</span>
        </motion.button>
      </div>
    </motion.div>
  );

  // If mounted inside GameFullscreenShell, ALWAYS portal dead-center over the blurred game screen!
  if (stagePortal?.overlayHostEl) {
    return createPortal(card, stagePortal.overlayHostEl);
  }

  if (!overlay) {
    return <div className="flex justify-center py-2">{card}</div>;
  }

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      {card}
    </div>
  );
};

/* ============================================================================
 * 3. GUIDE GAME (ഗൈഡ് ഗെയിം) BRAND LOGO + HOME & ABOUT HUB MODAL
 * ========================================================================== */
export const GuideGameBrandLogo: React.FC<{
  size?: 'sm' | 'lg';
  className?: string;
}> = ({ size = 'sm', className = '' }) => {
  const [imgErr, setImgErr] = useState(false);
  const dim = size === 'lg' ? 'w-20 h-20 rounded-2xl' : 'w-9 h-9 rounded-xl';

  if (imgErr) {
    return (
      <div
        className={`${dim} bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-950 border-2 border-amber-400 flex items-center justify-center shadow-sm shrink-0 ${className}`}
      >
        <Compass className={size === 'lg' ? 'w-10 h-10 text-amber-300' : 'w-5 h-5 text-amber-300'} />
      </div>
    );
  }

  return (
    <div
      className={`${dim} overflow-hidden border-2 border-emerald-600/30 bg-white shadow-xs shrink-0 flex items-center justify-center ${className}`}
    >
      <img
        src={guideLogoUrl}
        alt="ഗൈഡ് ഗെയിം (Guide Game) ലോഗോ"
        referrerPolicy="no-referrer"
        onError={() => setImgErr(true)}
        className="w-full h-full object-cover scale-110"
      />
    </div>
  );
};

export const GuideGameAboutModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onGoHome: () => void;
  onOpenAllLessons: () => void;
  onOpenResourceHub?: () => void;
  completedCount: number;
  totalLessons: number;
  xp: number;
}> = ({
  open,
  onClose,
  onGoHome,
  onOpenAllLessons,
  onOpenResourceHub,
  completedCount,
  totalLessons,
  xp,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="ഗൈഡ് ഗെയിം വിവരണം"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full rounded-3xl bg-white border-2 border-emerald-300 shadow-2xl overflow-hidden"
          >
            {/* Brand Header Banner */}
            <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 text-center space-y-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                aria-label="അടയ്ക്കുക"
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-center">
                <GuideGameBrandLogo size="lg" className="ring-4 ring-amber-400/50" />
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-wide text-amber-300">
                  SKSSF · വിജ്ഞാനം · വിനയം · സേവനം
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  ഗൈഡ് ഗെയിം (Guide Game)
                </h2>
                <p className="text-xs font-semibold text-emerald-100">
                  സമസ്ത &amp; SKSSF ഇന്ററാക്ടീവ് പഠന–സാഹസിക ഗെയിം
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs font-extrabold text-amber-200 pt-1 tabular-nums">
                <span>⭐ {xp} XP</span>
                <span aria-hidden="true">·</span>
                <span>📚 {completedCount}/{totalLessons} പാഠങ്ങൾ</span>
              </div>
            </div>

            {/* Direct Home & Map Actions + About Section */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playPop();
                    onGoHome();
                    onClose();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-extrabold border-b-4 border-emerald-950 shadow-sm cursor-pointer transition-transform active:scale-95"
                >
                  <Home className="w-4 h-4" />
                  <span>ഹോം പേജിലേക്ക്</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                    onOpenAllLessons();
                    onClose();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold border-b-4 border-amber-600 shadow-sm cursor-pointer transition-transform active:scale-95"
                >
                  <MapIcon className="w-4 h-4" />
                  <span>{totalLessons} പാഠങ്ങൾ കാണാം</span>
                </button>
              </div>

              {onOpenResourceHub && (
                <button
                  type="button"
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                    onClose();
                    onOpenResourceHub();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-extrabold border-b-4 border-sky-950 shadow-sm cursor-pointer transition-transform active:scale-95"
                >
                  <span>🔗 സമസ്ത &amp; SKSSF ഔദ്യോഗിക ലിങ്കുകളും PDF ഗൈഡുകളും</span>
                </button>
              )}

              {/* About Guide Game */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-left">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>ഗൈഡ് ഗെയിമിനെക്കുറിച്ച് (About Guide Game)</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>ഗൈഡ് ഗെയിം (Guide Game)</strong> എന്നത് സമസ്തയുടെയും SKSSF-ന്റെയും ചരിത്രം, ആദർശം, സംഘടനാ ഘടന, വിങ്ങുകൾ, പ്രായോഗിക പ്രവർത്തനങ്ങൾ എന്നിവ രസകരമായ ഗെയിമുകളിലൂടെയും ചെറുപാഠങ്ങളിലൂടെയും ക്വിസുകളിലൂടെയും പഠിക്കാനുള്ള സമ്പൂർണ്ണ പഠന ഗെയിമാണ്.
                </p>
                <div className="pt-1.5 border-t border-slate-200 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    {totalLessons} സംവേദനാത്മക പാഠങ്ങൾ
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                    ഗെയിം → പാഠം → ക്വിസ്
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
