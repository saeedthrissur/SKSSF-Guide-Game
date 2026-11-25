import React, { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Gamepad2,
  Info,
  Play,
  RotateCcw,
  SkipForward,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { smoothScrollToSelector, useLessonFlow } from '../utils/lessonFlowContext';

const GameFullscreenContext = createContext<boolean>(false);

export function useGameFullscreen(): boolean {
  return useContext(GameFullscreenContext);
}

/* Video-player style 4-corner Fullscreen & Exit-Fullscreen SVG icons */
const VideoFullscreenEnterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 9V5a1 1 0 0 1 1-1h4" />
    <path d="M15 4h4a1 1 0 0 1 1 1v4" />
    <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
    <path d="M9 20H5a1 1 0 0 1-1-1v-4" />
  </svg>
);

const VideoFullscreenExitIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 4v4a1 1 0 0 1-1 1H4" />
    <path d="M20 9h-4a1 1 0 0 1-1-1V4" />
    <path d="M15 20v-4a1 1 0 0 1 1-1h4" />
    <path d="M4 15h4a1 1 0 0 1 1 1v4" />
  </svg>
);

let lastActiveGameShellId: string | null = null;
const visibleShellRatios = new Map<string, number>();

function isMobileLandscapeViewport(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isTouchOrSmall =
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
    navigator.maxTouchPoints > 0 ||
    Math.min(w, h) <= 560;
  return isTouchOrSmall && w > h && h <= 560;
}

function getBestAutoFullscreenShellId(): string | null {
  if (lastActiveGameShellId && (visibleShellRatios.get(lastActiveGameShellId) ?? 0) > 0.12) {
    return lastActiveGameShellId;
  }
  let bestId: string | null = null;
  let bestRatio = 0.18;
  visibleShellRatios.forEach((ratio, id) => {
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestId = id;
    }
  });
  return bestId;
}

export interface GameFullscreenShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onSkipGame?: () => void;
  isGameDone?: boolean;
  allowSkip?: boolean;
  defaultExpanded?: boolean;
}

export const GameFullscreenShell: React.FC<GameFullscreenShellProps> = ({
  title,
  subtitle,
  children,
  className = '',
  onSkipGame,
  isGameDone = false,
  allowSkip = true,
  defaultExpanded = false,
}) => {
  const shellId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { activeLessonId, markGameDone, registerFullscreen } = useLessonFlow();

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoFullscreenActive, setAutoFullscreenActive] = useState(false);
  const [dismissedLandscapeFs, setDismissedLandscapeFs] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  // Sync game completion with LessonFlowContext
  useEffect(() => {
    if (isGameDone && activeLessonId) {
      markGameDone(activeLessonId);
    }
  }, [isGameDone, activeLessonId, markGameDone]);

  // Collapse cleanly when switching to a brand-new lesson
  useEffect(() => {
    setIsExpanded(defaultExpanded);
    setShowInfo(false);
  }, [activeLessonId, defaultExpanded]);

  // Sync fullscreen status with LessonFlowContext so FloatingPageNavigator hides in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    registerFullscreen(true);
    return () => registerFullscreen(false);
  }, [isFullscreen, registerFullscreen]);

  // Track visibility of this game shell when expanded
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !isExpanded || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleShellRatios.set(shellId, entry.intersectionRatio);
          } else {
            visibleShellRatios.delete(shellId);
          }
        });
      },
      { threshold: [0, 0.2, 0.45, 0.7, 1] }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      visibleShellRatios.delete(shellId);
    };
  }, [shellId, isFullscreen, isExpanded]);

  // Auto-enter fullscreen on mobile landscape only when user has expanded the game
  useEffect(() => {
    if (!isExpanded) return;

    const evaluateOrientation = () => {
      const mobileLandscape = isMobileLandscapeViewport();
      if (mobileLandscape) {
        if (!dismissedLandscapeFs && !isFullscreen) {
          const bestId = getBestAutoFullscreenShellId();
          if (bestId === shellId) {
            setIsFullscreen(true);
            setAutoFullscreenActive(true);
            try {
              const el = document.documentElement;
              if (el.requestFullscreen && !document.fullscreenElement) {
                el.requestFullscreen().catch(() => {});
              }
            } catch {
              // Overlay fullscreen works cleanly
            }
          }
        }
      } else {
        setDismissedLandscapeFs(false);
        if (autoFullscreenActive) {
          setIsFullscreen(false);
          setAutoFullscreenActive(false);
          try {
            if (document.fullscreenElement && document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            }
          } catch {
            // Ignore
          }
        }
      }
    };

    window.addEventListener('resize', evaluateOrientation);
    window.addEventListener('orientationchange', evaluateOrientation);
    return () => {
      window.removeEventListener('resize', evaluateOrientation);
      window.removeEventListener('orientationchange', evaluateOrientation);
    };
  }, [shellId, isFullscreen, autoFullscreenActive, dismissedLandscapeFs, isExpanded]);

  useEffect(() => {
    if (!isFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setAutoFullscreenActive(false);
        setDismissedLandscapeFs(true);
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const enterFullscreen = () => {
    sound.unlockAudio();
    sound.playPop();
    lastActiveGameShellId = shellId;
    setIsExpanded(true);
    setDismissedLandscapeFs(false);
    setAutoFullscreenActive(false);
    setIsFullscreen(true);
    try {
      const el = document.documentElement;
      if (el.requestFullscreen && !document.fullscreenElement) {
        el.requestFullscreen().catch(() => {});
      }
    } catch {
      // Overlay fullscreen works cleanly
    }
  };

  const exitFullscreen = () => {
    sound.playClick();
    setIsFullscreen(false);
    setAutoFullscreenActive(false);
    setDismissedLandscapeFs(true);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Ignore
    }
  };

  const handleSkipToLesson = () => {
    sound.unlockAudio();
    sound.playClick();
    if (isFullscreen) {
      setIsFullscreen(false);
      setAutoFullscreenActive(false);
      setDismissedLandscapeFs(true);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {
        // Ignore
      }
    }
    setIsExpanded(false);
    onSkipGame?.();
    setTimeout(() => {
      smoothScrollToSelector('[data-lesson-drawer="true"]');
    }, 80);
  };

  const handleReplay = () => {
    sound.unlockAudio();
    sound.playPop();
    lastActiveGameShellId = shellId;
    setIsExpanded(true);
    setReplayKey((k) => k + 1);
  };

  const handleGoToLesson = () => {
    sound.playClick();
    if (isFullscreen) {
      exitFullscreen();
    }
    setTimeout(() => {
      smoothScrollToSelector('[data-lesson-drawer="true"]');
    }, 80);
  };

  // COLLAPSED LAUNCHER CARD (Default State!)
  if (!isExpanded && !isFullscreen) {
    return (
      <div
        ref={containerRef}
        data-lesson-game="true"
        className={`rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-amber-50/70 p-3.5 sm:p-4 shadow-sm scroll-mt-20 ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playPop();
                lastActiveGameShellId = shellId;
                setIsExpanded(true);
              }}
              aria-label="ഗെയിം തുറക്കാം"
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md border-b-4 border-emerald-900 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <Gamepad2 className="w-6 h-6" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-extrabold text-emerald-700">
                  🎮 ഗെയിം കളിക്കാം
                </span>
                {isGameDone && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3" /> പൂർത്തിയാക്കി
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug break-words">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] font-semibold text-slate-600 leading-snug mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowInfo((v) => !v);
              }}
              aria-label="ഗെയിം വിവരണം"
              title="വിവരണം"
              className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>

            {isGameDone ? (
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold border-b-2 border-amber-600 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>വീണ്ടും കളിക്കാം</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.unlockAudio();
                  sound.playPop();
                  lastActiveGameShellId = shellId;
                  setIsExpanded(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold border-b-2 border-emerald-950 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>തുറന്ന് കളിക്കാം</span>
              </button>
            )}

            <button
              type="button"
              onClick={enterFullscreen}
              title="ഫുൾ സ്ക്രീൻ"
              aria-label="ഫുൾ സ്ക്രീനിൽ കളിക്കാം"
              className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 transition-colors cursor-pointer"
            >
              <VideoFullscreenEnterIcon className="w-4 h-4" />
            </button>

            {allowSkip && !isGameDone && (
              <button
                type="button"
                onClick={handleSkipToLesson}
                title="ഗെയിം ഒഴിവാക്കി പാഠത്തിലേക്ക്"
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 border border-slate-300 text-slate-700 text-[11px] font-extrabold transition-colors cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>പാഠത്തിലേക്ക്</span>
              </button>
            )}
          </div>
        </div>

        {showInfo && (
          <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-950 leading-relaxed">
            ℹ️ ഈ പാഠം രസകരമായി മനസ്സിലാക്കാൻ <strong>“തുറന്ന് കളിക്കാം”</strong> അമർത്തുക. ഗെയിം ഒഴിവാക്കി നേരിട്ട് താഴത്തെ പാഠം വായിക്കാനും കഴിയും. ജയിച്ച ഗെയിമുകൾ എപ്പോൾ വേണമെങ്കിലും വീണ്ടും കളിക്കാം (അധിക XP ചേരില്ല).
          </div>
        )}
      </div>
    );
  }

  // FULLSCREEN MODE
  if (isFullscreen) {
    return (
      <GameFullscreenContext.Provider value={true}>
        <div
          className="fixed inset-0 z-[90] h-[100dvh] w-[100dvw] bg-slate-950/98 backdrop-blur-xs flex flex-col p-1.5 sm:p-3 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — ഫുൾ സ്ക്രീൻ`}
          onPointerDown={() => {
            lastActiveGameShellId = shellId;
          }}
        >
          <div className="max-w-6xl w-full mx-auto flex flex-col gap-1.5 sm:gap-2 flex-1 min-h-0">
            <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-950/95 border border-emerald-700/70 text-white shadow-md shrink-0">
              <div className="flex items-center gap-1.5 min-w-0 text-left">
                <span className="text-base shrink-0">🎮</span>
                <span className="text-xs font-extrabold text-amber-300 leading-tight truncate">
                  {title}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleReplay}
                  title="വീണ്ടും കളിക്കാം (XP ആവർത്തിക്കില്ല)"
                  aria-label="വീണ്ടും കളിക്കാം"
                  className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white text-[11px] font-extrabold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">വീണ്ടും</span>
                </button>
                {allowSkip && !isGameDone && (
                  <button
                    type="button"
                    onClick={handleSkipToLesson}
                    aria-label="ഗെയിം സ്കിപ്പ് ചെയ്യുക"
                    title="പാഠത്തിലേക്ക്"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-amber-300 transition-colors cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={exitFullscreen}
                  title="ചെറുതാക്കാം"
                  aria-label="ഫുൾ സ്ക്രീനിൽ നിന്ന് പുറത്തുകടക്കാം"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <VideoFullscreenExitIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full flex-1 min-h-0 flex flex-col justify-center">
              <React.Fragment key={replayKey}>{children}</React.Fragment>
            </div>
          </div>
        </div>
      </GameFullscreenContext.Provider>
    );
  }

  // EXPANDED INLINE MODE
  return (
    <GameFullscreenContext.Provider value={false}>
      <div
        ref={containerRef}
        data-lesson-game="true"
        onPointerDown={() => {
          lastActiveGameShellId = shellId;
        }}
        className={`space-y-2 scroll-mt-20 ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50/90 border border-emerald-200 rounded-xl px-2.5 py-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm">🎮</span>
            <span className="text-xs font-extrabold text-emerald-950 leading-snug truncate">
              {title}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5 ml-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowInfo((v) => !v);
              }}
              title="വിവരണം"
              aria-label="ഗെയിം വിവരണം"
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleReplay}
              title="വീണ്ടും കളിക്കാം (XP ആവർത്തിക്കില്ല)"
              aria-label="വീണ്ടും കളിക്കാം"
              className="inline-flex items-center gap-1 px-2 h-7 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-[11px] font-extrabold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>വീണ്ടും</span>
            </button>

            {allowSkip && !isGameDone && (
              <button
                type="button"
                onClick={handleSkipToLesson}
                title="പാഠത്തിലേക്ക് പോകാം"
                aria-label="ഗെയിം സ്കിപ്പ് ചെയ്യാം"
                className="inline-flex items-center gap-1 px-2 h-7 rounded-lg bg-white hover:bg-amber-50 border border-slate-300 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
              >
                <SkipForward className="w-3 h-3" />
                <span className="hidden sm:inline">സ്കിപ്പ്</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsExpanded(false);
              }}
              title="ചുരുക്കാം"
              aria-label="ഗെയിം ചുരുക്കാം"
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 cursor-pointer"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={enterFullscreen}
              title="ഫുൾ സ്ക്രീൻ"
              aria-label="ഫുൾ സ്ക്രീൻ"
              className="inline-flex items-center justify-center w-8 h-7 rounded-lg bg-slate-900 hover:bg-emerald-800 text-amber-300 transition-colors cursor-pointer"
            >
              <VideoFullscreenEnterIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showInfo && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-950 leading-relaxed">
            ℹ️ ഗെയിം കളിച്ച് കഴിഞ്ഞാൽ താഴെയുള്ള 📖 പാഠം വായിച്ച് ഉറപ്പിക്കാം, തുടർന്ന് ക്വിസ് തുറക്കാം. “വീണ്ടും” ബട്ടൺ അമർത്തി ഗെയിം വീണ്ടും കളിക്കാം (അധിക XP ആവർത്തിക്കില്ല).
          </div>
        )}

        {/* Game Viewport with Corner Fullscreen Icon */}
        <div className="relative">
          <React.Fragment key={replayKey}>{children}</React.Fragment>
          <button
            type="button"
            onClick={enterFullscreen}
            title="ഫുൾ സ്ക്രീൻ"
            aria-label="ഫുൾ സ്ക്രീനിൽ തുറക്കാം"
            className="absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-lg bg-slate-950/75 hover:bg-slate-950 text-white border border-white/30 shadow-md flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
          >
            <VideoFullscreenEnterIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Post-Win Guidance Strip with Animated Hand + Replay */}
        {isGameDone && (
          <div className="rounded-xl bg-emerald-50 border-2 border-emerald-300 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-950">
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.0 }}
                className="text-base"
              >
                👇
              </motion.span>
              <span>ഗെയിം ജയിച്ചു! ഇനി താഴത്തെ പാഠം വായിച്ച് ക്വിസ് തുറക്കാം.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-amber-300 text-amber-950 text-[11px] font-extrabold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> വീണ്ടും കളിക്കാം
              </button>
              <button
                type="button"
                onClick={handleGoToLesson}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-extrabold cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" /> പാഠത്തിലേക്ക്
              </button>
            </div>
          </div>
        )}
      </div>
    </GameFullscreenContext.Provider>
  );
};

// Re-export ChevronDown if needed elsewhere
export { ChevronDown };
