import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

export interface GeometricOnboardingOverlayProps {
  visible: boolean;
  /** 'stage' = compact center-bottom directional guide for generic games; 'vehicle' = Lesson 1 tray-to-slot guide */
  variant?: 'stage' | 'vehicle';
  /** Optional short Malayalam micro-cue (kept <= 4 words) */
  cueLabel?: string;
}

/**
 * Pure-geometric 3-second visual onboarding cue (strictly zero human/hand/animal figures).
 * Uses pulsing concentric emerald/gold target rings, animated dashed paths, and chevron arrows.
 * Always pointer-events-none so the player's very first tap goes straight through to the game.
 */
export const GeometricOnboardingOverlay: React.FC<GeometricOnboardingOverlayProps> = ({
  visible,
  variant = 'stage',
  cueLabel,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 overflow-hidden select-none"
        >
          {variant === 'vehicle' ? (
            /* Lesson 1: Animated geometric arc + concentric target rings pointing from bottom tray -> vehicle slot */
            <svg
              viewBox="0 0 460 250"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <defs>
                <filter id="geo-hint-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Pulsing Source Ring near bottom center-left (pointing up from the part tray) */}
              <motion.circle
                cx="228"
                cy="232"
                r="14"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="3"
                filter="url(#geo-hint-glow)"
                animate={{ r: [10, 22, 10], opacity: [0.95, 0.2, 0.95] }}
                transition={{ duration: 1.25, repeat: Infinity, ease: 'easeInOut' }}
              />
              <circle cx="228" cy="232" r="6" fill="#FDE047" stroke="#064E3B" strokeWidth="2" />

              {/* Animated Dashed Glowing Curved Path from Tray Up to Target Slot */}
              <motion.path
                d="M 228 224 C 228 165, 295 148, 336 62"
                fill="none"
                stroke="#34D399"
                strokeWidth="3.5"
                strokeDasharray="8 6"
                strokeLinecap="round"
                filter="url(#geo-hint-glow)"
                animate={{ strokeDashoffset: [28, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              />

              {/* Moving Glowing Geometric Orb Traveling Along Path */}
              <motion.circle
                r="5.5"
                fill="#FEF08A"
                stroke="#059669"
                strokeWidth="2"
                animate={{
                  cx: [228, 252, 292, 336],
                  cy: [224, 174, 126, 62],
                  opacity: [0.4, 1, 1, 0.3],
                }}
                transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Geometric Directional Chevron Arrowhead Near Target */}
              <motion.polygon
                points="338,54 326,68 336,66 344,74"
                fill="#FBBF24"
                stroke="#064E3B"
                strokeWidth="1.4"
                animate={{ y: [4, -2, 4] }}
                transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Target Concentric Pulsing Rings over Vehicle Flagpole / Slot */}
              <motion.circle
                cx="340"
                cy="48"
                r="18"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="3"
                filter="url(#geo-hint-glow)"
                animate={{ r: [14, 30, 14], opacity: [1, 0.15, 1] }}
                transition={{ duration: 1.15, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.circle
                cx="340"
                cy="48"
                r="11"
                fill="rgba(16,185,129,0.22)"
                stroke="#34D399"
                strokeWidth="2.5"
                animate={{ scale: [0.92, 1.12, 0.92] }}
                transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '340px 48px' }}
              />
              {/* Crisp Crosshair Target Lines */}
              <line x1="340" y1="36" x2="340" y2="43" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
              <line x1="340" y1="53" x2="340" y2="60" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
              <line x1="328" y1="48" x2="335" y2="48" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
              <line x1="345" y1="48" x2="352" y2="48" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            /* Generic Stage: Clean Geometric Pulsing Target Ring + Directional Chevrons */
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative flex flex-col items-center gap-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [0.75, 1.35, 0.75], opacity: [0.9, 0.15, 0.9] }}
                    transition={{ duration: 1.25, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-4 border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.75)]"
                  />
                  <motion.div
                    animate={{ scale: [0.85, 1.12, 0.85], opacity: [0.95, 0.55, 0.95] }}
                    transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-12 h-12 rounded-full border-[3px] border-emerald-400 bg-emerald-500/25 shadow-[0_0_14px_rgba(16,185,129,0.75)] flex items-center justify-center"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" fill="#FDE047" />
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    </svg>
                  </motion.div>
                </div>

                {/* Animated Geometric Chevrons (Left <-> Right / Tap Cue) */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/85 border border-amber-400/80 shadow-lg">
                  <motion.span
                    animate={{ x: [-3, 0, -3], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    className="text-emerald-300 text-xs font-black"
                  >
                    ◀
                  </motion.span>
                  <span className="text-[11px] font-black text-amber-200 tracking-wide">
                    {cueLabel || 'തൊട്ട് കളിക്കാം'}
                  </span>
                  <motion.span
                    animate={{ x: [3, 0, 3], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    className="text-emerald-300 text-xs font-black"
                  >
                    ▶
                  </motion.span>
                </div>
              </div>
            </div>
          )}

          {/* Compact Geometric Cue Pill (only for vehicle variant) */}
          {variant === 'vehicle' && cueLabel && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/85 border border-amber-400/85 text-amber-200 text-[11px] font-black shadow-lg flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{cueLabel}</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export interface OnboardingHintReplayButtonProps {
  onClick: () => void;
  dark?: boolean;
  className?: string;
}

export const OnboardingHintReplayButton: React.FC<OnboardingHintReplayButtonProps> = ({
  onClick,
  dark = false,
  className = '',
}) => (
  <button
    type="button"
    onClick={onClick}
    title="കളിക്കുന്ന വിധം കാണാം"
    aria-label="കളിക്കുന്ന വിധം വീണ്ടും കാണാം"
    className={`inline-flex items-center justify-center min-w-[36px] min-h-[36px] rounded-lg border text-sm font-black transition-transform active:scale-95 cursor-pointer ${
      dark
        ? 'bg-amber-400/20 hover:bg-amber-400/35 border-amber-300/60 text-amber-200'
        : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
    } ${className}`}
  >
    💡
  </button>
);
