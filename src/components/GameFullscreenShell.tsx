import React, { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Gamepad2,
  Info,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { useLessonFlow } from '../utils/lessonFlowContext';
import { getLessonThemeBrief } from './LessonAnimatedBanner';
import {
  GeometricOnboardingOverlay,
  OnboardingHintReplayButton,
} from './VisualOnboardingHint';

const GameFullscreenContext = createContext<boolean>(false);

export function useGameFullscreen(): boolean {
  return useContext(GameFullscreenContext);
}

export interface GameStagePortalContextValue {
  overlayHostEl: HTMLDivElement | null;
  setPortalOverlayActive: (active: boolean) => void;
  isStagePaused: boolean;
  notifyStageWin: (summary?: string) => void;
  openLesson: () => void;
  hasLesson: boolean;
}

const GameStagePortalContext = createContext<GameStagePortalContextValue | null>(null);

export function useGameStagePortal(): GameStagePortalContextValue | null {
  return useContext(GameStagePortalContext);
}

export function useGameStagePaused(): boolean {
  const ctx = useContext(GameStagePortalContext);
  return ctx ? ctx.isStagePaused : false;
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
  winTrigger?: number;
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
  winTrigger = 0,
  allowSkip = true,
  defaultExpanded = false,
}) => {
  const shellId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    activeLessonId,
    lessonViewStep,
    goToStudyStep,
    markGameDone,
    registerFullscreen,
    registerGameShell,
    hasLessonDrawerOnPage,
    isLessonConfirmed,
  } = useLessonFlow();

  // Register presence of a game shell on this lesson so App.tsx knows whether to show the Storyline + Skip bar
  useEffect(() => {
    registerGameShell(true);
    return () => registerGameShell(false);
  }, [registerGameShell]);

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoFullscreenActive, setAutoFullscreenActive] = useState(false);
  const [dismissedLandscapeFs, setDismissedLandscapeFs] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [showGeoHint, setShowGeoHint] = useState(false);
  const geoHintTimerRef = useRef<number | null>(null);

  const triggerGeoHint = useCallback(() => {
    if (geoHintTimerRef.current !== null) {
      window.clearTimeout(geoHintTimerRef.current);
    }
    setShowGeoHint(true);
    geoHintTimerRef.current = window.setTimeout(() => {
      geoHintTimerRef.current = null;
      setShowGeoHint(false);
    }, 3200);
  }, []);

  const dismissGeoHint = useCallback(() => {
    if (geoHintTimerRef.current !== null) {
      window.clearTimeout(geoHintTimerRef.current);
      geoHintTimerRef.current = null;
    }
    setShowGeoHint(false);
  }, []);

  useEffect(() => {
    return () => {
      if (geoHintTimerRef.current !== null) {
        window.clearTimeout(geoHintTimerRef.current);
      }
    };
  }, []);

  // Trigger a clean 3-second pure-geometric visual cue whenever a game opens/replays (skip for Lesson 1 which has its own tailored tray-to-slot geometric demo)
  useEffect(() => {
    if (!isExpanded && !isFullscreen) {
      dismissGeoHint();
      return;
    }
    if (activeLessonId === 'prologue_curiosity' || isGameDone) return;
    triggerGeoHint();
  }, [isExpanded, isFullscreen, replayKey, activeLessonId, isGameDone, triggerGeoHint, dismissGeoHint]);

  // Unified 1-click launch + 1.5s win-grace hold & victory/defeat stage overlays
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [winGracePending, setWinGracePending] = useState(false);
  const [winSummary, setWinSummary] = useState<string | null>(null);
  const [portalOverlayActive, setPortalOverlayActive] = useState(false);
  const [overlayHostEl, setOverlayHostEl] = useState<HTMLDivElement | null>(null);

  const prevDoneRef = useRef(isGameDone);
  const prevWinTriggerRef = useRef(winTrigger);
  const winGraceTimerRef = useRef<number | null>(null);

  const clearWinGraceTimer = useCallback(() => {
    if (winGraceTimerRef.current !== null) {
      window.clearTimeout(winGraceTimerRef.current);
      winGraceTimerRef.current = null;
    }
    setWinGracePending(false);
  }, []);

  const scheduleWinOverlay = useCallback(
    (summary?: string) => {
      if (summary !== undefined) {
        setWinSummary(summary);
      }
      if (showWinOverlay) return;
      if (winGraceTimerRef.current !== null) {
        window.clearTimeout(winGraceTimerRef.current);
      }
      setWinGracePending(true);
      setPortalOverlayActive(false);
      winGraceTimerRef.current = window.setTimeout(() => {
        winGraceTimerRef.current = null;
        setWinGracePending(false);
        setShowWinOverlay(true);
      }, 1500);
    },
    [showWinOverlay]
  );

  // Clean up win-grace timer on unmount
  useEffect(() => {
    return () => {
      if (winGraceTimerRef.current !== null) {
        window.clearTimeout(winGraceTimerRef.current);
      }
    };
  }, []);

  // Sync game completion with LessonFlowContext + trigger 1.5s win-grace hold before Victory overlay
  useEffect(() => {
    if (isGameDone && activeLessonId) {
      markGameDone(activeLessonId);
    }
    if (!prevDoneRef.current && isGameDone && (isExpanded || isFullscreen)) {
      scheduleWinOverlay();
    }
    prevDoneRef.current = isGameDone;
  }, [isGameDone, activeLessonId, markGameDone, isExpanded, isFullscreen, scheduleWinOverlay]);

  // Also trigger Victory overlay when explicit winTrigger increments (handles replays of completed games!)
  useEffect(() => {
    if (winTrigger > prevWinTriggerRef.current && (isExpanded || isFullscreen)) {
      scheduleWinOverlay();
    }
    prevWinTriggerRef.current = winTrigger;
  }, [winTrigger, isExpanded, isFullscreen, scheduleWinOverlay]);

  // Collapse & reset overlays cleanly when switching to a brand-new lesson
  useEffect(() => {
    clearWinGraceTimer();
    setIsExpanded(defaultExpanded);
    setShowInfo(false);
    setShowWinOverlay(false);
    setWinSummary(null);
    setPortalOverlayActive(false);
  }, [activeLessonId, defaultExpanded, clearWinGraceTimer]);

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

  const notifyStageWin = useCallback(
    (summary?: string) => {
      scheduleWinOverlay(summary);
    },
    [scheduleWinOverlay]
  );

  const safeSetPortalOverlayActive = useCallback(
    (active: boolean) => {
      if (active && (winGracePending || showWinOverlay)) return;
      setPortalOverlayActive(active);
    },
    [winGracePending, showWinOverlay]
  );

  const enterFullscreen = () => {
    sound.unlockAudio();
    sound.playPop();
    lastActiveGameShellId = shellId;
    if (!isExpanded) {
      clearWinGraceTimer();
      setShowWinOverlay(false);
      setReplayKey((k) => k + 1);
    }
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

  const handleOpenLessonFromGame = useCallback(() => {
    sound.unlockAudio();
    sound.playClick();
    clearWinGraceTimer();
    setShowWinOverlay(false);
    setPortalOverlayActive(false);
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
    if (!isGameDone && allowSkip) {
      onSkipGame?.();
    }
    goToStudyStep();
  }, [isFullscreen, isGameDone, allowSkip, onSkipGame, goToStudyStep, clearWinGraceTimer]);

  const handleReplay = () => {
    sound.unlockAudio();
    sound.playPop();
    lastActiveGameShellId = shellId;
    clearWinGraceTimer();
    setIsExpanded(true);
    setShowWinOverlay(false);
    setWinSummary(null);
    setPortalOverlayActive(false);
    setReplayKey((k) => k + 1);
  };

  const lessonAlreadyRead = isLessonConfirmed(activeLessonId);

  const themeLine =
    subtitle?.trim() ||
    getLessonThemeBrief(activeLessonId) ||
    'ലക്ഷ്യം കൃത്യമായി പൂർത്തിയാക്കി കവചം സംരക്ഷിച്ച് ദൗത്യം വിജയിക്കൂ!';

  const shouldBlurGame = showWinOverlay || portalOverlayActive;

  const portalContextValue: GameStagePortalContextValue = {
    overlayHostEl,
    setPortalOverlayActive: safeSetPortalOverlayActive,
    isStagePaused: shouldBlurGame || winGracePending,
    notifyStageWin,
    openLesson: handleOpenLessonFromGame,
    hasLesson: hasLessonDrawerOnPage,
  };

  // Shared game viewport with 1-line inline Malayalam instruction strip + smooth Victory / Defeat overlays
  const renderGameViewport = (fullscreenLayout: boolean) => (
    <div
      className={`relative rounded-2xl overflow-hidden flex flex-col gap-1.5 ${
        fullscreenLayout ? 'w-full flex-1 min-h-0 justify-center' : ''
      }`}
    >
      {/* Crisp 1-line Malayalam "How to Play" Strip — replaces blocking blurred Mission Brief modal */}
      {!showWinOverlay && !portalOverlayActive && (
        <div
          className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold leading-snug shrink-0 ${
            winGracePending
              ? 'bg-emerald-600 text-white border border-emerald-400'
              : fullscreenLayout
              ? 'bg-emerald-950/90 text-emerald-100 border border-emerald-700/70'
              : 'bg-amber-50 text-amber-950 border border-amber-200'
          }`}
        >
          <span className="truncate">
            {winGracePending
              ? '🎉 മനോഹരം! ദൗത്യം വിജയിച്ചു...'
              : `🎯 എങ്ങനെ കളിക്കാം: ${themeLine}`}
          </span>
        </div>
      )}

      <div
        onPointerDown={dismissGeoHint}
        className={`relative rounded-2xl overflow-hidden ${fullscreenLayout ? 'flex-1 min-h-0' : ''}`}
      >
        {/* Underlying live game screen (blurs smoothly behind Victory / Defeat overlays) */}
        <div
          className={`transition-all duration-300 ${
            shouldBlurGame ? 'blur-[6px] scale-[0.99] pointer-events-none select-none opacity-85' : ''
          }`}
        >
          <React.Fragment key={replayKey}>{children}</React.Fragment>
        </div>

        {/* Non-blocking 3-Second Pure-Geometric Visual Onboarding Hint (Zero Human/Hand Figures) */}
        {!shouldBlurGame && !winGracePending && (
          <GeometricOnboardingOverlay
            visible={showGeoHint}
            variant="stage"
            cueLabel="തൊട്ട് കളിക്കാം"
          />
        )}

        {/* Portal Host for GameDefeatBurstOverlay (ALWAYS centered over the SAME blurred screen!) */}
        <div
          ref={setOverlayHostEl}
          className={`absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 transition-all ${
            portalOverlayActive
              ? 'bg-slate-950/65 backdrop-blur-sm pointer-events-auto'
              : 'pointer-events-none'
          }`}
        />

      {/* BLURRED SAME-SCREEN VICTORY OVERLAY */}
      <AnimatePresence>
        {showWinOverlay && !portalOverlayActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 z-40 bg-slate-950/68 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
          >
            <motion.div
              initial={{ scale: 0.84, y: 14, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="max-w-md w-full rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-emerald-950/95 via-slate-900/95 to-slate-950/95 text-white p-5 text-center shadow-2xl space-y-3"
            >
              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: [-6, 6, -4, 4, 0], scale: [1, 1.12, 1] }}
                  transition={{ duration: 0.7 }}
                  className="w-14 h-14 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center shadow-lg"
                >
                  <Trophy className="w-8 h-8 text-amber-300" />
                </motion.div>
              </div>

              <div className="space-y-1">
                <p className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-300 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  ദൗത്യം വിജയകരം!
                </p>
                <h4 className="text-lg sm:text-xl font-black text-amber-300 leading-tight">
                  🏆 ജയിച്ചു! അഭിനന്ദനങ്ങൾ!
                </h4>
                <p className="text-xs font-bold text-slate-200 leading-relaxed">
                  {winSummary || `${title} വിജയകരമായി പൂർത്തിയാക്കി! ഇനി പാഠം വായിച്ച് ക്വിസ് തുറക്കാം.`}
                </p>
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                {hasLessonDrawerOnPage && (
                  <button
                    type="button"
                    onClick={handleOpenLessonFromGame}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-b-4 border-emerald-800 text-xs sm:text-sm font-black shadow-md cursor-pointer active:scale-95 transition-transform"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>പാഠത്തിലേക്ക്</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleReplay}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-b-4 border-amber-700 text-xs sm:text-sm font-black shadow-md cursor-pointer active:scale-95 transition-transform"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>വീണ്ടും കളിക്കാം</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowWinOverlay(false);
                  }}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-extrabold cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>കാണാം</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );

  // Hide Game entirely on Screen 2 ('study': Lesson + Quiz) so max 2 focused items render per screen
  if (lessonViewStep !== 'play') {
    return null;
  }

  // COLLAPSED LAUNCHER CARD (1-Click Direct Launch — Natural Kerala Malayalam)
  if (!isExpanded && !isFullscreen) {
    const openGameCard = () => {
      sound.unlockAudio();
      sound.playPop();
      lastActiveGameShellId = shellId;
      clearWinGraceTimer();
      setShowWinOverlay(false);
      setPortalOverlayActive(false);
      setReplayKey((k) => k + 1);
      setIsExpanded(true);
      window.requestAnimationFrame(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };

    return (
      <div
        ref={containerRef}
        data-lesson-game="true"
        className={`relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-4 sm:p-5 shadow-md scroll-mt-20 space-y-3.5 text-white ${className}`}
      >
        {/* Subtle Decorative Arcade Glow & Floating Sparkles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full bg-amber-400/20 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -left-8 w-32 h-32 rounded-full bg-emerald-400/20 blur-2xl"
        />

        {/* Row 1: Playful Animated Game Controller Emblem + Clear Malayalam Game Tag & Title */}
        <div className="relative z-10 flex items-start gap-3.5 w-full">
          <motion.button
            type="button"
            onClick={openGameCard}
            aria-label="കളി തുടങ്ങാം"
            animate={{ rotate: [-3, 3, -3], y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 text-slate-950 border-2 border-amber-100 border-b-4 border-b-amber-700 flex items-center justify-center shrink-0 shadow-lg cursor-pointer"
          >
            <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.3]" />
          </motion.button>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-black tracking-wide shadow-2xs">
                <Sparkles className="w-3 h-3" />
                <span>രസകരമായ കളി</span>
              </span>
              {isGameDone ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-400/25 text-emerald-200 border border-emerald-300/60">
                  <CheckCircle2 className="w-3 h-3 text-amber-300" /> ജയിച്ച കളി 🏆
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/15 text-amber-200 border border-white/20">
                  ⭐ കളിച്ചു പഠിക്കാം!
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-black text-white leading-snug drop-shadow-xs">
              {title}
            </h3>
            <p className="text-xs font-semibold text-emerald-100/90 leading-snug">
              {subtitle || 'തൊട്ട് കളിച്ച് പോയിന്റും ബാഡ്ജും നേടാം!'}
            </p>
          </div>
        </div>

        {/* Row 2: Big Tactile 3D Golden Play Button + Fullscreen & Info */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-white/15">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96, y: 2 }}
            onClick={openGameCard}
            className="relative overflow-hidden flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:via-amber-300 hover:to-amber-400 text-slate-950 text-sm font-black border-2 border-amber-100 border-b-[5px] border-b-amber-700 shadow-lg cursor-pointer"
          >
            {/* Animated Shine Sweep */}
            <motion.span
              aria-hidden="true"
              animate={{ x: ['-130%', '230%'] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', repeatDelay: 1.5 }}
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12"
            />
            {isGameDone ? (
              <RotateCcw className="w-4 h-4 relative z-10 stroke-[2.6]" />
            ) : (
              <Play className="w-4 h-4 fill-current relative z-10" />
            )}
            <span className="relative z-10">
              {isGameDone ? 'വീണ്ടും കളിക്കാം!' : 'കളി തുടങ്ങാം!'}
            </span>
          </motion.button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowInfo((v) => !v);
              }}
              aria-label="കളിയുടെ വിവരണം"
              title="വിവരണം"
              className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={enterFullscreen}
              title="വലിയ സ്ക്രീനിൽ കളിക്കാം"
              aria-label="വലിയ സ്ക്രീനിൽ കളിക്കാം"
              className="inline-flex items-center justify-center gap-1 px-3 min-w-[40px] min-h-[40px] rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-amber-400/50 text-amber-300 text-xs font-extrabold transition-colors cursor-pointer"
            >
              <VideoFullscreenEnterIcon className="w-4 h-4" />
              <span className="hidden sm:inline">വലിയ സ്ക്രീൻ</span>
            </button>
          </div>
        </div>

        {showInfo && (
          <div className="relative z-10 rounded-xl bg-slate-950/75 border border-amber-400/40 px-3.5 py-2.5 text-xs font-bold text-emerald-100 leading-relaxed">
            ℹ️ ഈ പാഠം രസകരമായി കളിച്ചു പഠിക്കാൻ മഞ്ഞ <strong>“കളി തുടങ്ങാം!”</strong> ബട്ടൺ അമർത്തുക. നേരിട്ട് താഴത്തെ <strong>“പാഠം തുറക്കാം”</strong> അമർത്തി വായിക്കാനും കഴിയും.
          </div>
        )}
      </div>
    );
  }

  // FULLSCREEN MODE
  if (isFullscreen) {
    return (
      <GameFullscreenContext.Provider value={true}>
        <GameStagePortalContext.Provider value={portalContextValue}>
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
                  {activeLessonId !== 'prologue_curiosity' && (
                    <OnboardingHintReplayButton
                      dark
                      onClick={() => {
                        sound.playClick();
                        triggerGeoHint();
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleReplay}
                    title="വീണ്ടും കളിക്കാം (XP ആവർത്തിക്കില്ല)"
                    aria-label="വീണ്ടും കളിക്കാം"
                    className="inline-flex items-center justify-center gap-1 px-2.5 min-w-[40px] min-h-[40px] rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white text-[11px] font-extrabold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">വീണ്ടും</span>
                  </button>
                  {hasLessonDrawerOnPage && (
                    <button
                      type="button"
                      onClick={handleOpenLessonFromGame}
                      aria-label="പാഠം തുറക്കാം"
                      title="പാഠം തുറക്കാം"
                      className={`inline-flex items-center justify-center gap-1 px-3 min-h-[40px] rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                        isGameDone && !lessonAlreadyRead
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-200 shadow-sm'
                          : 'bg-emerald-700 hover:bg-emerald-600 border border-emerald-400/60 text-white'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <span>പാഠം</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={exitFullscreen}
                    title="ചെറുതാക്കാം"
                    aria-label="വലിയ സ്ക്രീനിൽ നിന്ന് പുറത്തുകടക്കാം"
                    className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <VideoFullscreenExitIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {renderGameViewport(true)}
            </div>
          </div>
        </GameStagePortalContext.Provider>
      </GameFullscreenContext.Provider>
    );
  }

  // EXPANDED INLINE MODE (Single Fullscreen Button in Top Action Bar — NO duplicate floating icon over game UI!)
  return (
    <GameFullscreenContext.Provider value={false}>
      <GameStagePortalContext.Provider value={portalContextValue}>
        <div
          ref={containerRef}
          data-lesson-game="true"
          onPointerDown={() => {
            lastActiveGameShellId = shellId;
          }}
          className={`space-y-2 scroll-mt-20 ${className}`}
        >
          <div className="flex flex-col gap-2 bg-emerald-50/90 border border-emerald-200 rounded-xl px-3 py-2.5">
            {/* Row 1: Full-width Game Title */}
            <div className="flex items-start gap-2 w-full">
              <span className="text-base shrink-0 leading-snug">🎮</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-950 leading-snug flex-1">
                {title}
              </span>
            </div>

            {/* Row 2: Action Controls Below Title */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-emerald-200/70">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  clearWinGraceTimer();
                  setIsExpanded(false);
                }}
                aria-label="കളി നിർത്താം"
                className="inline-flex items-center justify-center gap-1 px-3 min-h-[40px] rounded-lg bg-white hover:bg-slate-100 border border-emerald-300 text-emerald-950 text-xs font-extrabold cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" />
                <span>കളി നിർത്താം</span>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                {activeLessonId !== 'prologue_curiosity' && (
                  <OnboardingHintReplayButton
                    onClick={() => {
                      sound.playClick();
                      triggerGeoHint();
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowInfo((v) => !v);
                  }}
                  title="വിവരണം"
                  aria-label="കളിയുടെ വിവരണം"
                  className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 cursor-pointer"
                >
                  <Info className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleReplay}
                  title="വീണ്ടും കളിക്കാം (XP ആവർത്തിക്കില്ല)"
                  aria-label="വീണ്ടും കളിക്കാം"
                  className="inline-flex items-center justify-center gap-1 px-3 min-h-[40px] rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-extrabold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>വീണ്ടും</span>
                </button>

                {hasLessonDrawerOnPage && (
                  <button
                    type="button"
                    onClick={handleOpenLessonFromGame}
                    title="പാഠം തുറക്കാം"
                    aria-label="പാഠം തുറക്കാം"
                    className={`inline-flex items-center justify-center gap-1 px-3 min-h-[40px] rounded-lg text-xs font-extrabold transition-all cursor-pointer active:scale-95 ${
                      isGameDone && !lessonAlreadyRead
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-b-2 border-emerald-950 ring-2 ring-amber-300 shadow-xs'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white border-b-2 border-emerald-950 shadow-2xs'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>{lessonAlreadyRead ? 'പാഠം ✓' : 'പാഠം'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={enterFullscreen}
                  title="വലിയ സ്ക്രീൻ"
                  aria-label="വലിയ സ്ക്രീൻ"
                  className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg bg-emerald-800 hover:bg-emerald-900 text-amber-300 transition-colors cursor-pointer"
                >
                  <VideoFullscreenEnterIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {showInfo && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-950 leading-relaxed">
              ℹ️ കളി പൂർത്തിയാക്കിയാലോ ഇടയ്ക്ക് വെച്ചോ മുകളിലെ <strong>“📖 പാഠം”</strong> ബട്ടൺ അമർത്തി നേരിട്ട് പാഠം വായിച്ച് ക്വിസ് തുറക്കാം. “വീണ്ടും” അമർത്തി എപ്പോൾ വേണമെങ്കിലും വീണ്ടും കളിക്കാം.
            </div>
          )}

          {/* Game Viewport (NO duplicate inner fullscreen icon, NO hidden below-screen lesson strip!) */}
          {renderGameViewport(false)}
        </div>
      </GameStagePortalContext.Provider>
    </GameFullscreenContext.Provider>
  );
};

// Re-export ChevronDown if needed elsewhere
export { ChevronDown };
