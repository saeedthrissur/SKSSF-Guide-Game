import React, { createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { sound } from './sound';

export interface HeartBreakEvent {
  id: number;
  brokenIndex: number; // 0, 1, or 2 (which heart slot in the top header broke)
  remaining: number;
}

interface GameLivesContextValue {
  lives: number;
  maxLives: number;
  lastBreakEvent: HeartBreakEvent | null;
}

const GameLivesContext = createContext<GameLivesContextValue>({
  lives: 3,
  maxLives: 3,
  lastBreakEvent: null,
});

export const GameLivesProvider: React.FC<{
  lives: number;
  maxLives?: number;
  lastBreakEvent: HeartBreakEvent | null;
  children: React.ReactNode;
}> = ({ lives, maxLives = 3, lastBreakEvent, children }) => (
  <GameLivesContext.Provider value={{ lives, maxLives, lastBreakEvent }}>
    {children}
  </GameLivesContext.Provider>
);

export function useGameLives(): GameLivesContextValue {
  return useContext(GameLivesContext);
}

/* Glossy Whole Red Heart SVG */
const WholeHeartSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="wholeHeartGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="50%" stopColor="#E11D48" />
        <stop offset="100%" stopColor="#9F1239" />
      </linearGradient>
    </defs>
    <path
      d="M16 28.2 C16 28.2 3.2 19.9 3.2 11.4 C3.2 6.8 6.8 3.6 11 3.6 C13.5 3.6 15.1 4.9 16 6.5 C16.9 4.9 18.5 3.6 21 3.6 C25.2 3.6 28.8 6.8 28.8 11.4 C28.8 19.9 16 28.2 16 28.2 Z"
      fill="url(#wholeHeartGrad)"
      stroke="#881337"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <ellipse cx="10.2" cy="9.4" rx="2.6" ry="1.4" fill="#FFE4E6" opacity="0.7" transform="rotate(-28 10.2 9.4)" />
  </svg>
);

/* Cracked / Broken Heart SVG (Stays visibly cracked in the top bar!) */
const BrokenHeartSvg: React.FC<{ className?: string; large?: boolean }> = ({
  className = 'w-5 h-5',
  large = false,
}) => (
  <svg viewBox="0 0 36 32" className={className} aria-hidden="true">
    {/* Left cracked half */}
    <path
      d="M17.2 28 C17.2 28 4.4 19.8 4.4 11.4 C4.4 6.9 8 3.8 12.1 3.8 C14.5 3.8 16.1 5 17 6.6 L14.8 11.8 L18.2 15.5 L15.2 20.6 L17.2 28 Z"
      fill={large ? '#E11D48' : '#64748B'}
      stroke={large ? '#881337' : '#334155'}
      strokeWidth="1.3"
      strokeLinejoin="round"
      transform="translate(-1.3, 0.5) rotate(-7 14 16)"
    />
    {/* Right cracked half */}
    <path
      d="M18.8 28 C18.8 28 31.6 19.8 31.6 11.4 C31.6 6.9 28 3.8 23.9 3.8 C21.5 3.8 19.9 5 19 6.6 L16.8 11.8 L20.2 15.5 L17.2 20.6 L18.8 28 Z"
      fill={large ? '#BE123C' : '#475569'}
      stroke={large ? '#881337' : '#334155'}
      strokeWidth="1.3"
      strokeLinejoin="round"
      transform="translate(1.4, -0.4) rotate(7 22 16)"
    />
    {/* Jagged bright crack flash */}
    {large && (
      <path
        d="M18 6 L15.2 12 L19.4 15.8 L16.2 21.2 L18.2 27.6"
        fill="none"
        stroke="#FDE047"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

/* TOP STICKY HEADER 3-HEARTS BAR (Shows live hearts + cracked hearts permanently at top!) */
export const HeaderHeartsBar: React.FC = () => {
  const { lives, maxLives, lastBreakEvent } = useGameLives();

  return (
    <div
      aria-label={`ബാക്കി ജീവൻ: ${lives}/${maxLives}`}
      title={`ക്വിസ് ജീവൻ: ${lives}/${maxLives} (3 തവണ തെറ്റിച്ചാൽ പാഠം ആദ്യം മുതൽ തുടങ്ങും)`}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl border-2 transition-colors shrink-0 ${
        lives <= 1
          ? 'bg-rose-100 border-rose-400 shadow-xs'
          : 'bg-rose-50/90 border-rose-200'
      }`}
    >
      {Array.from({ length: maxLives }).map((_, idx) => {
        const isAlive = idx < lives;
        const justBroke = lastBreakEvent && lastBreakEvent.brokenIndex === idx && !isAlive;
        return (
          <motion.div
            key={`${idx}_${isAlive ? 'alive' : 'broken'}_${justBroke ? lastBreakEvent.id : 0}`}
            initial={
              justBroke
                ? { scale: 1.9, rotate: -18 }
                : isAlive
                ? { scale: 0.7 }
                : { scale: 1 }
            }
            animate={
              justBroke
                ? {
                    scale: [1.9, 1.35, 0.9, 1.15, 1],
                    rotate: [-18, 16, -12, 8, 0],
                  }
                : isAlive
                ? { scale: [1, 1.07, 1] }
                : { scale: 1, rotate: 0 }
            }
            transition={
              justBroke
                ? { duration: 0.7, ease: 'easeOut' }
                : isAlive
                ? { duration: 2.2, repeat: Infinity, delay: idx * 0.28 }
                : { duration: 0.2 }
            }
            className="relative flex items-center justify-center"
          >
            {isAlive ? (
              <WholeHeartSvg className="w-5 h-5 sm:w-5.5 sm:h-5.5 drop-shadow-xs" />
            ) : (
              <BrokenHeartSvg className="w-5 h-5 sm:w-5.5 sm:h-5.5 opacity-85" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

/* DRAMATIC CENTER-TO-HEADER HEART-BREAK ANIMATION OVERLAY */
export const HeartBreakFlightOverlay: React.FC<{
  event: HeartBreakEvent | null;
  onComplete: () => void;
}> = ({ event, onComplete }) => {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] pointer-events-none flex items-center justify-center overflow-hidden"
        >
          {/* Brief soft crimson flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.24, 0] }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 bg-rose-600"
          />

          {/* Heart cracks in center -> flies straight up into the Top Header! */}
          <motion.div
            initial={{ y: 20, scale: 0.4, opacity: 0 }}
            animate={{
              y: [20, 0, -14, -360],
              scale: [0.4, 1.35, 1.2, 0.35],
              opacity: [0, 1, 1, 0],
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 1.15,
              times: [0, 0.28, 0.62, 1],
              ease: 'easeInOut',
            }}
            onAnimationComplete={onComplete}
            className="relative flex flex-col items-center justify-center"
          >
            {/* Shockwave ring */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 2.3, opacity: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="absolute w-24 h-24 rounded-full border-4 border-rose-400"
            />

            {/* Flying ruby crack shards */}
            {[
              { x: -56, y: -38, r: -45 },
              { x: 58, y: -32, r: 40 },
              { x: -48, y: 40, r: -30 },
              { x: 52, y: 36, r: 50 },
            ].map((sh, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: sh.x, y: sh.y, scale: 0.2, opacity: 0, rotate: sh.r }}
                transition={{ duration: 0.65, delay: 0.18, ease: 'easeOut' }}
                className="absolute w-3.5 h-3.5 rounded-xs bg-rose-500 border border-amber-200 shadow"
              />
            ))}

            {/* Large Splitting Heart Graphic */}
            <div className="relative w-28 h-24 flex items-center justify-center drop-shadow-2xl">
              <BrokenHeartSvg className="w-28 h-24" large />
            </div>

            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [0.7, 1.1, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="mt-2 px-4 py-1.5 rounded-2xl bg-rose-700 text-white border-2 border-amber-300 text-xs sm:text-sm font-extrabold shadow-xl max-w-[92vw] text-center leading-snug break-words"
            >
              💔 ഒരു ജീവൻ പൊട്ടി! (ബാക്കി: <span className="notranslate tabular-nums">{event.remaining}/3</span>)
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* FULL RESET GAME OVER MODAL WHEN ALL 3 HEARTS BREAK */
export const GameOverResetModal: React.FC<{
  isOpen: boolean;
  onRestartFromStart: () => void;
  onOpenSupport?: () => void;
}> = ({ isOpen, onRestartFromStart, onOpenSupport }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="max-w-md w-full rounded-3xl border-4 border-rose-500 bg-gradient-to-b from-slate-900 via-rose-950/90 to-slate-950 text-white p-6 sm:p-7 text-center shadow-2xl space-y-4"
          >
            {/* 3 Animated Broken Hearts */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.5, rotate: -18 }}
                  animate={{
                    scale: [1, 1.12, 1],
                    rotate: [-6, 6, -4, 0],
                  }}
                  transition={{ duration: 0.9, delay: i * 0.14 }}
                >
                  <BrokenHeartSvg className="w-12 h-12 drop-shadow-lg" large />
                </motion.div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="inline-block px-3 py-1 rounded-full bg-rose-600/30 border border-rose-400/50 text-amber-300 text-xs font-extrabold">
                💔 3 അവസരവും കഴിഞ്ഞു!
              </p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                3 ഹൃദയങ്ങളും നഷ്ടമായി!
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-rose-100 leading-relaxed">
                3 ക്വിസ് ഉത്തരങ്ങൾ തെറ്റിച്ചതിനാൽ മുകളിലെ 3 ഹൃദയങ്ങളും (💔 💔 💔) പൊട്ടിപ്പോയി! ഇനി എല്ലാ പാഠങ്ങളും ഒന്നാമത്തെ പാഠം മുതൽ പുതിയ 3 ഹൃദയത്തോടെ വീണ്ടും തുടങ്ങാം.
              </p>
            </div>

            <div className="space-y-2.5">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  sound.unlockAudio();
                  sound.playPop();
                  onRestartFromStart();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-b-4 border-amber-600 text-sm sm:text-base font-extrabold shadow-xl inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>🔄 ഒന്നാമത്തെ പാഠം മുതൽ വീണ്ടും തുടങ്ങാം (❤️❤️❤️)</span>
              </motion.button>

              {onOpenSupport && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                    onOpenSupport();
                  }}
                  className="w-full py-3 px-5 rounded-2xl bg-emerald-800/80 hover:bg-emerald-700 text-amber-200 border border-emerald-500/50 text-sm font-extrabold shadow-md inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>🎁 ഒരു ഹദിയ നൽകാം</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
