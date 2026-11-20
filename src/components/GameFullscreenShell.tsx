import React, { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { Gamepad2, SkipForward } from 'lucide-react';
import { sound } from '../utils/sound';

const GameFullscreenContext = createContext<boolean>(false);

export function useGameFullscreen(): boolean {
  return useContext(GameFullscreenContext);
}

/* Video-player style 4-corner Fullscreen & Exit-Fullscreen SVG icons */
const VideoFullscreenEnterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M4 9V5a1 1 0 0 1 1-1h4" />
    <path d="M15 4h4a1 1 0 0 1 1 1v4" />
    <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
    <path d="M9 20H5a1 1 0 0 1-1-1v-4" />
  </svg>
);

const VideoFullscreenExitIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M9 4v4a1 1 0 0 1-1 1H4" />
    <path d="M20 9h-4a1 1 0 0 1-1-1V4" />
    <path d="M15 20v-4a1 1 0 0 1 1-1h4" />
    <path d="M4 15h4a1 1 0 0 1 1 1v4" />
  </svg>
);

/* Track which GameFullscreenShell is currently focused / most visible on screen
   so mobile landscape auto-fullscreen opens ONLY the active game (never overlapping two!). */
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
}

export const GameFullscreenShell: React.FC<GameFullscreenShellProps> = ({
  title,
  subtitle,
  children,
  className = '',
  onSkipGame,
  isGameDone = false,
  allowSkip = true,
}) => {
  const shellId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoFullscreenActive, setAutoFullscreenActive] = useState(false);
  const [dismissedLandscapeFs, setDismissedLandscapeFs] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  // Track visibility of this game shell in the viewport for smart landscape auto-fullscreen
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
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
  }, [shellId, isFullscreen, isSkipped]);

  // Auto-enter fullscreen when phone rotates to landscape; auto-exit when rotated back to portrait
  useEffect(() => {
    if (isSkipped) return;

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
              // Overlay fullscreen still works cleanly inside iframes & mobile Safari
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
  }, [shellId, isFullscreen, autoFullscreenActive, dismissedLandscapeFs, isSkipped]);

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
    setIsSkipped(false);
    setDismissedLandscapeFs(false);
    setAutoFullscreenActive(false);
    setIsFullscreen(true);
    try {
      const el = document.documentElement;
      if (el.requestFullscreen && !document.fullscreenElement) {
        el.requestFullscreen().catch(() => {});
      }
    } catch {
      // Embedded iframe overlay mode works cleanly
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

  const handleSkip = () => {
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
    setIsSkipped(true);
    onSkipGame?.();
  };

  if (isSkipped && !isFullscreen) {
    return (
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 shadow-xs">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug break-words">
            ⏭️ ഗെയിം സ്കിപ്പ് ചെയ്തു: {title}
          </p>
          <p className="text-[11px] font-semibold text-slate-600 mt-0.5 leading-snug">
            ഗെയിം കളിക്കൽ നിർബന്ധമില്ല — പാഠം മനസ്സിലാക്കി താഴെയുള്ള ചോദ്യത്തിന് മറുപടി നൽകിയാൽ അടുത്ത പാഠവും പുതിയ ഗെയിമും തുറക്കും!
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.unlockAudio();
            sound.playPop();
            lastActiveGameShellId = shellId;
            setIsSkipped(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold whitespace-nowrap shrink-0"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>ഗെയിം തുറക്കാം</span>
        </button>
      </div>
    );
  }

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
            {/* Compact Video-Player Top Control Strip */}
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/95 border border-emerald-700/70 text-white shadow-md shrink-0">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-extrabold text-amber-300 leading-tight break-words">
                  {title}
                </p>
                {subtitle && (
                  <p className="hidden sm:block text-[11px] font-semibold text-emerald-100 leading-tight break-words mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {allowSkip && !isGameDone && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white text-[11px] sm:text-xs font-extrabold transition-colors whitespace-nowrap"
                  >
                    <SkipForward className="w-3.5 h-3.5 text-amber-300" />
                    <span>ഗെയിം സ്കിപ്പ് ചെയ്യുക</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={exitFullscreen}
                  title="ഫുൾ സ്ക്രീനിൽ നിന്ന് പുറത്തുകടക്കാം"
                  aria-label="ഫുൾ സ്ക്രീനിൽ നിന്ന് പുറത്തുകടക്കാം"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] sm:text-xs font-extrabold shadow-xs transition-transform active:scale-95 whitespace-nowrap"
                >
                  <VideoFullscreenExitIcon className="w-4 h-4" />
                  <span>ചെറുതാക്കാം</span>
                </button>
              </div>
            </div>

            <div className="w-full flex-1 min-h-0 flex flex-col justify-center">
              {children}
            </div>
          </div>
        </div>
      </GameFullscreenContext.Provider>
    );
  }

  return (
    <GameFullscreenContext.Provider value={false}>
      <div
        ref={containerRef}
        onPointerDown={() => {
          lastActiveGameShellId = shellId;
        }}
        className={`space-y-1.5 ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-500">
            🎮 രസകരമായ ഗെയിം · ഫോൺ തിരിച്ചുപിടിച്ചാൽ ഓട്ടോ ഫുൾ സ്ക്രീൻ ആകും
          </span>
          <div className="flex flex-wrap items-center justify-end gap-1.5 ml-auto">
            {allowSkip && !isGameDone && (
              <button
                type="button"
                onClick={handleSkip}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 border border-slate-300 text-slate-800 text-xs font-extrabold shadow-xs transition-colors whitespace-nowrap"
              >
                <SkipForward className="w-3.5 h-3.5 text-slate-600" />
                <span>ഗെയിം സ്കിപ്പ് ചെയ്യുക</span>
              </button>
            )}
            <button
              type="button"
              onClick={enterFullscreen}
              title="ഫുൾ സ്ക്രീനിൽ കളിക്കാം"
              aria-label="ഫുൾ സ്ക്രീനിൽ കളിക്കാം"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-xs transition-colors whitespace-nowrap"
            >
              <VideoFullscreenEnterIcon className="w-4 h-4 text-amber-300" />
              <span>ഫുൾ സ്ക്രീൻ</span>
            </button>
          </div>
        </div>

        {/* Game Viewport with Video-Player Style Bottom-Right Fullscreen Corner Button */}
        <div className="relative">
          {children}
          <button
            type="button"
            onClick={enterFullscreen}
            title="ഫുൾ സ്ക്രീനിൽ തുറക്കാം"
            aria-label="ഫുൾ സ്ക്രീനിൽ തുറക്കാം"
            className="absolute top-2.5 right-2.5 z-30 w-9 h-9 rounded-lg bg-slate-950/75 hover:bg-slate-950 text-white border border-white/30 shadow-md flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95"
          >
            <VideoFullscreenEnterIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </GameFullscreenContext.Provider>
  );
};
