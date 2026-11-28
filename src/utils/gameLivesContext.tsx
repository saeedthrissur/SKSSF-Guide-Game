import React, { createContext, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Heart, RotateCcw, Sparkles } from 'lucide-react';
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
      title={`ക്വിസ് ജീവൻ: ${lives}/${maxLives} (3 ഹൃദയവും കഴിഞ്ഞാൽ 2 റിവിഷൻ ചോദ്യങ്ങളിലൂടെ ഹൃദയം തിരിച്ചുപിടിക്കാം)`}
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

interface RecoveryQuestion {
  q: string;
  options: string[];
  correctIdx: number;
  note: string;
}

const HEART_RECOVERY_POOL: RecoveryQuestion[] = [
  {
    q: 'SKSSF-ന്റെ ആപ്തവാക്യം (Motto) ഏതാണ്?',
    options: [
      'വിജ്ഞാനം · വിനയം · സേവനം',
      'വേഗത · ശക്തി · വിജയം',
      'സമ്പത്ത് · പ്രശസ്തി · അധികാരം',
    ],
    correctIdx: 0,
    note: 'വിജ്ഞാനം, വിനയം, സേവനം എന്നിവയാണ് SKSSF-ന്റെ അടിസ്ഥാന മുദ്രാവാക്യം.',
  },
  {
    q: 'സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ രൂപീകൃതമായ വർഷം ഏതാണ്?',
    options: ['1926', '1951', '1989'],
    correctIdx: 0,
    note: '1926 ജൂൺ 26-ന് കോഴിക്കോട് വെച്ചാണ് സമസ്ത രൂപീകൃതമായത്.',
  },
  {
    q: 'SKSSF രൂപീകൃതമായത് എന്നാണ്?',
    options: ['1989 ഫെബ്രുവരി 19', '1926 ജൂൺ 26', '1995 ഡിസംബർ 10'],
    correctIdx: 0,
    note: '1989 ഫെബ്രുവരി 19-ന് കോഴിക്കോട് സാമൂതിരി ഹൈസ്കൂളിൽ വെച്ച് SKSSF പിറവിയെടുത്തു.',
  },
  {
    q: 'ദുരന്തനിവാരണത്തിനും സന്നദ്ധ സേവനത്തിനുമായുള്ള SKSSF-ന്റെ വിംഗ് ഏതാണ്?',
    options: ['വിഖായ (Viqaya)', 'സത്യധാര', 'ട്രെൻഡ്'],
    correctIdx: 0,
    note: 'നിസ്വാർത്ഥ സന്നദ്ധ സേവനത്തിനും ദുരന്തനിവാരണത്തിനും വിഖായ സദാ സജ്ജമാണ്.',
  },
  {
    q: 'സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡ് (SKIMVB) രൂപീകരിച്ച വർഷം?',
    options: ['1951', '1970', '1989'],
    correctIdx: 0,
    note: '1951 സെപ്റ്റംബർ 17-ന് വളാഞ്ചേരിയിൽ വെച്ച് വിദ്യാഭ്യാസ ബോർഡ് നിലവിൽ വന്നു.',
  },
  {
    q: 'സമസ്തയുടെയും SKSSF-ന്റെയും ഏറ്റവും അടിസ്ഥാന സംഘടനാ ഘടകം ഏതാണ്?',
    options: ['യൂണിറ്റ് (Unit)', 'സ്റ്റേറ്റ് കമ്മിറ്റി', 'ജില്ലാ കമ്മിറ്റി'],
    correctIdx: 0,
    note: 'ഓരോ മഹല്ലിലെയും ശാഖ / യൂണിറ്റ് ആണ് സംഘടനയുടെ ശക്തമായ അടിത്തറ.',
  },
];

/* FAIR HEART RECOVERY MODAL (2-Question Revision Restores 2 Hearts Without Wiping Progress!) */
export const GameOverResetModal: React.FC<{
  isOpen: boolean;
  onRestartFromStart: () => void;
  onRecoverHearts?: () => void;
  onOpenSupport?: () => void;
}> = ({ isOpen, onRestartFromStart, onRecoverHearts, onOpenSupport }) => {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [seedOffset, setSeedOffset] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSeedOffset((prev) => (prev + 2) % HEART_RECOVERY_POOL.length);
      setQuestionIdx(0);
      setSolvedCount(0);
      setFeedback(null);
      setShowRestartConfirm(false);
    }
  }, [isOpen]);

  const activeQuestion =
    HEART_RECOVERY_POOL[(seedOffset + questionIdx) % HEART_RECOVERY_POOL.length];
  const recovered = solvedCount >= 2;

  const handleAnswer = (optIdx: number) => {
    if (recovered) return;
    sound.unlockAudio();
    if (optIdx === activeQuestion.correctIdx) {
      sound.playSuccess(2);
      const nextSolved = solvedCount + 1;
      setSolvedCount(nextSolved);
      setFeedback({ ok: true, text: `ശരിയാണ്! ${activeQuestion.note}` });
      if (nextSolved < 2) {
        window.setTimeout(() => {
          setQuestionIdx((q) => q + 1);
          setFeedback(null);
        }, 900);
      }
    } else {
      sound.playError();
      setFeedback({
        ok: false,
        text: 'സാരമില്ല, നമുക്ക് ഒന്നുകൂടി ശ്രമിക്കാം — ശരിയായ ഉത്തരം തൊടൂ!',
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-label="ഹൃദയം തിരിച്ചുപിടിക്കാം"
        >
          <motion.div
            initial={{ scale: 0.9, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="max-w-md w-full max-h-[85vh] overflow-y-auto overscroll-contain my-auto rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-slate-900 via-emerald-950/95 to-slate-950 text-white p-5 sm:p-6 text-center shadow-2xl space-y-4"
          >
            {/* Visual Hearts Status */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {[0, 1, 2].map((i) => {
                const healed = i < solvedCount;
                return (
                  <motion.div
                    key={`${i}_${healed ? 'healed' : 'broken'}`}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: healed ? [1.2, 1] : 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    {healed ? (
                      <WholeHeartSvg className="w-11 h-11 drop-shadow-lg" />
                    ) : (
                      <BrokenHeartSvg className="w-11 h-11 opacity-75" large />
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-200 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ഹൃദയം തിരിച്ചുപിടിക്കാം (Heart Recovery)</span>
              </p>
              <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                {recovered
                  ? 'അഭിനന്ദനങ്ങൾ! 2 ഹൃദയങ്ങൾ തിരിച്ചുകിട്ടി!'
                  : 'സാരമില്ല, നമുക്ക് ഒന്നുകൂടി ശ്രമിക്കാം!'}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-emerald-100/90 leading-relaxed">
                {recovered
                  ? 'നിങ്ങളുടെ പാഠപുരോഗതി സുരക്ഷിതമാണ് — ഇതേ പാഠത്തിൽ നിന്ന് തന്നെ സന്തോഷത്തോടെ തുടരാം.'
                  : 'നിങ്ങളുടെ ഇതുവരെയുള്ള പാഠങ്ങൾ നഷ്ടപ്പെടില്ല! 2 ചെറിയ റിവിഷൻ ചോദ്യങ്ങൾക്ക് ശരിയുത്തരം നൽകിയാൽ ❤️❤️ 2 ഹൃദയങ്ങൾ തിരിച്ചുകിട്ടും.'}
              </p>
            </div>

            {onRecoverHearts ? (
              recovered ? (
                <div className="space-y-3 pt-1">
                  <div className="rounded-2xl bg-emerald-900/60 border border-emerald-400/50 p-3 text-xs font-bold text-emerald-100 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>റിവിഷൻ പൂർത്തിയായി · ❤️❤️ 2 ഹൃദയങ്ങൾ തയ്യാറാണ്!</span>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      sound.unlockAudio();
                      sound.playUnlock();
                      onRecoverHearts();
                    }}
                    className="w-full min-h-[46px] py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-b-4 border-emerald-800 text-sm sm:text-base font-black shadow-xl inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-5 h-5 fill-rose-600 text-rose-700" />
                    <span>ഇതേ പാഠത്തിൽ തുടരാം (❤️❤️)</span>
                  </motion.button>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/95 text-slate-900 border-2 border-emerald-300 p-4 text-left space-y-3">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold text-emerald-800">
                    <span>റിവിഷൻ ചോദ്യം {solvedCount + 1} / 2</span>
                    <span className="tabular-nums">❤️❤️ തിരിച്ചുപിടിക്കാം</span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 leading-snug">
                    {activeQuestion.q}
                  </p>
                  <div className="space-y-2">
                    {activeQuestion.options.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswer(idx)}
                        className="w-full min-h-[42px] px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-500 text-left text-xs sm:text-sm font-extrabold text-slate-900 transition-colors cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {feedback && (
                    <p
                      className={`text-xs font-extrabold rounded-xl px-3 py-2 border ${
                        feedback.ok
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-amber-50 border-amber-300 text-amber-950'
                      }`}
                    >
                      {feedback.ok ? '✅ ' : '💡 '}
                      {feedback.text}
                    </p>
                  )}
                </div>
              )
            ) : null}

            <div className="pt-2 border-t border-white/10 space-y-2">
              {!showRestartConfirm ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowRestartConfirm(true);
                    }}
                    className="min-h-[36px] py-1.5 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ഒന്നാമത്തെ പാഠം മുതൽ പുതുതായി തുടങ്ങാം</span>
                  </button>
                  {onOpenSupport && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.unlockAudio();
                        sound.playClick();
                        onOpenSupport();
                      }}
                      className="min-h-[36px] py-1.5 px-3 rounded-lg text-amber-200/90 hover:text-amber-200 hover:bg-white/10 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>🎁 ഒരു ഹദിയ നൽകാം</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-rose-950/70 border border-rose-400/50 p-3 space-y-2">
                  <p className="text-xs font-bold text-rose-100">
                    നിലവിലെ പാഠപുരോഗതി റീസെറ്റ് ചെയ്ത് ആദ്യം മുതൽ തുടങ്ങട്ടെ?
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.unlockAudio();
                        sound.playPop();
                        onRestartFromStart();
                      }}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold cursor-pointer"
                    >
                      അതെ, ആദ്യം മുതൽ തുടങ്ങാം
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRestartConfirm(false)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold cursor-pointer"
                    >
                      വേണ്ട
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
