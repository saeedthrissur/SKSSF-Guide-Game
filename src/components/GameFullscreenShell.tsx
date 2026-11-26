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
import { smoothScrollToSelector, useLessonFlow } from '../utils/lessonFlowContext';
import { getLessonThemeBrief } from './LessonAnimatedBanner';

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
    markGameDone,
    registerFullscreen,
    hasLessonDrawerOnPage,
    isLessonConfirmed,
  } = useLessonFlow();

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoFullscreenActive, setAutoFullscreenActive] = useState(false);
  const [dismissedLandscapeFs, setDismissedLandscapeFs] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  // Unified blurred start-theme & victory/defeat stage overlays
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [winSummary, setWinSummary] = useState<string | null>(null);
  const [portalOverlayActive, setPortalOverlayActive] = useState(false);
  const [overlayHostEl, setOverlayHostEl] = useState<HTMLDivElement | null>(null);

  const prevDoneRef = useRef(isGameDone);
  const prevWinTriggerRef = useRef(winTrigger);

  // Sync game completion with LessonFlowContext + trigger blurred Victory overlay on win
  useEffect(() => {
    if (isGameDone && activeLessonId) {
      markGameDone(activeLessonId);
    }
    if (!prevDoneRef.current && isGameDone && (isExpanded || isFullscreen)) {
      setBriefingOpen(false);
      setShowWinOverlay(true);
    }
    prevDoneRef.current = isGameDone;
  }, [isGameDone, activeLessonId, markGameDone, isExpanded, isFullscreen]);

  // Also trigger Victory overlay when explicit winTrigger increments (handles replays of completed games!)
  useEffect(() => {
    if (winTrigger > prevWinTriggerRef.current && (isExpanded || isFullscreen)) {
      setBriefingOpen(false);
      setShowWinOverlay(true);
    }
    prevWinTriggerRef.current = winTrigger;
  }, [winTrigger, isExpanded, isFullscreen]);

  // Collapse & reset overlays cleanly when switching to a brand-new lesson
  useEffect(() => {
    setIsExpanded(defaultExpanded);
    setShowInfo(false);
    setBriefingOpen(true);
    setShowWinOverlay(false);
    setWinSummary(null);
    setPortalOverlayActive(false);
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

  const notifyStageWin = useCallback((summary?: string) => {
    setBriefingOpen(false);
    setWinSummary(summary ?? null);
    setShowWinOverlay(true);
  }, []);

  const enterFullscreen = () => {
    sound.unlockAudio();
    sound.playPop();
    lastActiveGameShellId = shellId;
    if (!isExpanded) {
      setBriefingOpen(true);
      setShowWinOverlay(false);
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
    setShowWinOverlay(false);
    setBriefingOpen(false);
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
    window.dispatchEvent(new CustomEvent('skssf:open-lesson'));
    window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>('[data-lesson-drawer="true"]');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        smoothScrollToSelector('[data-lesson-drawer="true"]');
      }
    }, 120);
  }, [isFullscreen, isGameDone, allowSkip, onSkipGame]);

  const handleReplay = () => {
    sound.unlockAudio();
    sound.playPop();
    lastActiveGameShellId = shellId;
    setIsExpanded(true);
    setShowWinOverlay(false);
    setWinSummary(null);
    setPortalOverlayActive(false);
    setBriefingOpen(false);
    setReplayKey((k) => k + 1);
  };

  const handleStartFromBriefing = () => {
    sound.unlockAudio();
    sound.playPop();
    setBriefingOpen(false);
    setShowWinOverlay(false);
    setPortalOverlayActive(false);
    // Remount fresh so any timer-based game starts with 100% full countdown
    setReplayKey((k) => k + 1);
  };

  const lessonAlreadyRead = isLessonConfirmed(activeLessonId);

  const themeLine =
    subtitle?.trim() ||
    getLessonThemeBrief(activeLessonId) ||
    'ലക്ഷ്യം കൃത്യമായി പൂർത്തിയാക്കി കവചം സംരക്ഷിച്ച് ദൗത്യം വിജയിക്കൂ!';

  const shouldBlurGame = briefingOpen || showWinOverlay || portalOverlayActive;

  const portalContextValue: GameStagePortalContextValue = {
    overlayHostEl,
    setPortalOverlayActive,
    isStagePaused: shouldBlurGame,
    notifyStageWin,
    openLesson: handleOpenLessonFromGame,
    hasLesson: hasLessonDrawerOnPage,
  };

  // Shared game viewport with blurred background + Start Theme / Victory / Defeat Portal overlays
  const renderGameViewport = (fullscreenLayout: boolean) => (
    <div
      className={`relative rounded-2xl overflow-hidden ${
        fullscreenLayout ? 'w-full flex-1 min-h-0 flex flex-col justify-center' : ''
      }`}
    >
      {/* Underlying live game screen (blurs smoothly behind Start / Victory / Defeat overlays) */}
      <div
        className={`transition-all duration-300 ${
          shouldBlurGame ? 'blur-[6px] scale-[0.99] pointer-events-none select-none opacity-85' : ''
        }`}
      >
        <React.Fragment key={replayKey}>{children}</React.Fragment>
      </div>

      {/* Portal Host for GameDefeatBurstOverlay (ALWAYS centered over the SAME blurred screen!) */}
      <div
        ref={setOverlayHostEl}
        className={`absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 transition-all ${
          portalOverlayActive
            ? 'bg-slate-950/65 backdrop-blur-sm pointer-events-auto'
            : 'pointer-events-none'
        }`}
      />

      {/* BLURRED START-OF-GAME THEME OVERLAY */}
      <AnimatePresence>
        {briefingOpen && !portalOverlayActive && !showWinOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
          >
            <motion.div
              initial={{ scale: 0.9, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="max-w-md w-full rounded-2xl border-2 border-emerald-400/75 bg-slate-900/95 text-white p-4 sm:p-5 text-center shadow-2xl space-y-3"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-[11px] font-black tracking-wide">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
                <span>ഗെയിം തീം · MISSION BRIEF</span>
              </div>

              <h4 className="text-sm sm:text-base font-black text-amber-300 leading-snug">
                {title}
              </h4>

              <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed bg-slate-950/65 border border-white/10 rounded-xl px-3.5 py-2.5">
                {themeLine}
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartFromBriefing}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border-b-4 border-emerald-800 text-xs sm:text-sm font-black shadow-lg cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>കളിക്കാം! (Start Game)</span>
                </motion.button>
                {hasLessonDrawerOnPage && (
                  <button
                    type="button"
                    onClick={handleOpenLessonFromGame}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs sm:text-sm font-extrabold cursor-pointer active:scale-95 transition-transform"
                  >
                    <BookOpen className="w-4 h-4 text-amber-300" />
                    <span>പാഠം വായിക്കാം</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
  );

  // COLLAPSED LAUNCHER CARD (Default State — Unified 2-Row Layout)
  if (!isExpanded && !isFullscreen) {
    return (
      <div
        ref={containerRef}
        data-lesson-game="true"
        className={`rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 p-3.5 sm:p-4 shadow-sm scroll-mt-20 space-y-3 ${className}`}
      >
        {/* Row 1: Full-width Icon + Section Tag + Complete Readable Title */}
        <div className="flex items-start gap-3 w-full">
          <span className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Gamepad2 className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black tracking-wider uppercase text-emerald-700">
                GAME
              </span>
              {isGameDone && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> പൂർത്തിയാക്കി
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs font-semibold text-slate-600 leading-snug">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Uniform Action Bar Below Title */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-emerald-200/70">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playPop();
                lastActiveGameShellId = shellId;
                setShowWinOverlay(false);
                setPortalOverlayActive(false);
                setBriefingOpen(true);
                setIsExpanded(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold border-b-2 border-emerald-950 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              {isGameDone ? (
                <RotateCcw className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isGameDone ? 'Open Game (Replay)' : 'Open Game'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowInfo((v) => !v);
              }}
              aria-label="ഗെയിം വിവരണം"
              title="വിവരണം"
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={enterFullscreen}
              title="ഫുൾ സ്ക്രീൻ"
              aria-label="ഫുൾ സ്ക്രീനിൽ കളിക്കാം"
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 transition-colors cursor-pointer"
            >
              <VideoFullscreenEnterIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showInfo && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-bold text-emerald-950 leading-relaxed">
            ℹ️ ഈ പാഠം രസകരമായി കളിച്ചു പഠിക്കാൻ <strong>“Open Game”</strong> അമർത്തുക. ഗെയിം ഒഴിവാക്കി നേരിട്ട് താഴത്തെ <strong>“Open Lesson”</strong> തുറന്ന് വായിക്കാനും കഴിയും. ജയിച്ച ഗെയിമുകൾ എപ്പോൾ വേണമെങ്കിലും വീണ്ടും കളിക്കാം (അധിക XP ചേരില്ല).
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
                  {hasLessonDrawerOnPage && (
                    <button
                      type="button"
                      onClick={handleOpenLessonFromGame}
                      aria-label="പാഠം തുറക്കാം"
                      title="പാഠം തുറക്കാം"
                      className={`inline-flex items-center gap-1 px-2.5 h-8 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                        isGameDone && !lessonAlreadyRead
                          ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 border border-amber-300 shadow-sm'
                          : 'bg-teal-600/90 hover:bg-teal-500 border border-teal-300/60 text-white'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>പാഠം</span>
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
                  setIsExpanded(false);
                }}
                aria-label="ഗെയിം അടയ്ക്കാം"
                className="inline-flex items-center gap-1 px-3 h-8 rounded-lg bg-white hover:bg-slate-100 border border-emerald-300 text-emerald-950 text-xs font-extrabold cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Close Game</span>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowInfo((v) => !v);
                  }}
                  title="വിവരണം"
                  aria-label="ഗെയിം വിവരണം"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleReplay}
                  title="വീണ്ടും കളിക്കാം (XP ആവർത്തിക്കില്ല)"
                  aria-label="വീണ്ടും കളിക്കാം"
                  className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-extrabold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay</span>
                </button>

                {hasLessonDrawerOnPage && (
                  <button
                    type="button"
                    onClick={handleOpenLessonFromGame}
                    title="പാഠം തുറക്കാം"
                    aria-label="പാഠം തുറക്കാം"
                    className={`inline-flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer active:scale-95 ${
                      isGameDone && !lessonAlreadyRead
                        ? 'bg-teal-700 hover:bg-teal-800 text-white border-b-2 border-teal-950 ring-2 ring-amber-300 shadow-xs'
                        : 'bg-teal-700 hover:bg-teal-800 text-white border-b-2 border-teal-950 shadow-2xs'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{lessonAlreadyRead ? 'പാഠം ✓' : 'പാഠം'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={enterFullscreen}
                  title="ഫുൾ സ്ക്രീൻ"
                  aria-label="ഫുൾ സ്ക്രീൻ"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 hover:bg-emerald-800 text-amber-300 transition-colors cursor-pointer"
                >
                  <VideoFullscreenEnterIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {showInfo && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-950 leading-relaxed">
              ℹ️ ഗെയിം കളിക്കുമ്പോഴോ പൂർത്തിയാക്കിയാലോ മുകളിലെ <strong>“📖 പാഠം”</strong> ബട്ടൺ അമർത്തി നേരിട്ട് പാഠം വായിച്ച് ക്വിസ് തുറക്കാം. “Replay” അമർത്തി എപ്പോൾ വേണമെങ്കിലും വീണ്ടും കളിക്കാം.
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
