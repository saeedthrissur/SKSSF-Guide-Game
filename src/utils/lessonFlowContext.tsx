import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  X,
  Gamepad2,
  BookOpen,
  Sparkles,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Map as MapIcon,
  CheckCircle2,
  Info,
} from 'lucide-react';

export interface LessonFlowContextValue {
  activeLessonId: string;
  confirmedLessons: Record<string, boolean>;
  confirmLesson: (lessonId?: string) => void;
  isLessonConfirmed: (lessonId?: string) => boolean;
  gameDoneLessons: Record<string, boolean>;
  markGameDone: (lessonId?: string) => void;
  isGameDone: (lessonId?: string) => boolean;
  quizDoneLessons: Record<string, boolean>;
  devUnlocked: boolean;
  isAnyFullscreen: boolean;
  registerFullscreen: (active: boolean) => void;
  onOpenAllLessons?: () => void;
  hasLessonDrawerOnPage: boolean;
  registerLessonDrawer: (mounted: boolean) => void;
}

const CONFIRMED_STORAGE_KEY = 'skssf_confirmed_lessons_v1';

const defaultContext: LessonFlowContextValue = {
  activeLessonId: '',
  confirmedLessons: {},
  confirmLesson: () => {},
  isLessonConfirmed: () => true,
  gameDoneLessons: {},
  markGameDone: () => {},
  isGameDone: () => false,
  quizDoneLessons: {},
  devUnlocked: false,
  isAnyFullscreen: false,
  registerFullscreen: () => {},
  hasLessonDrawerOnPage: false,
  registerLessonDrawer: () => {},
};

const LessonFlowContext = createContext<LessonFlowContextValue>(defaultContext);

export const useLessonFlow = () => useContext(LessonFlowContext);

export const smoothScrollToSelector = (selector: string): boolean => {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector(selector);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  }
  return false;
};

export const LessonFlowProvider: React.FC<{
  activeLessonId: string;
  quizDoneLessons: Record<string, boolean>;
  devUnlocked: boolean;
  onOpenAllLessons?: () => void;
  children: React.ReactNode;
}> = ({ activeLessonId, quizDoneLessons, devUnlocked, onOpenAllLessons, children }) => {
  const [confirmedLessons, setConfirmedLessons] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(CONFIRMED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [gameDoneLessons, setGameDoneLessons] = useState<Record<string, boolean>>({});
  const [fullscreenCount, setFullscreenCount] = useState(0);
  const [drawerCount, setDrawerCount] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(CONFIRMED_STORAGE_KEY, JSON.stringify(confirmedLessons));
    } catch {
      // ignore storage errors
    }
  }, [confirmedLessons]);

  // CollapsibleLessonDrawer instances self-register on mount and clean up on unmount.

  const confirmLesson = useCallback(
    (lessonId?: string) => {
      const id = lessonId || activeLessonId;
      if (!id) return;
      setConfirmedLessons((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    },
    [activeLessonId]
  );

  const isLessonConfirmed = useCallback(
    (lessonId?: string) => {
      const id = lessonId || activeLessonId;
      if (devUnlocked) return true;
      if (!id) return true;
      if (quizDoneLessons[id]) return true;
      return Boolean(confirmedLessons[id]);
    },
    [activeLessonId, confirmedLessons, devUnlocked, quizDoneLessons]
  );

  const markGameDone = useCallback(
    (lessonId?: string) => {
      const id = lessonId || activeLessonId;
      if (!id) return;
      setGameDoneLessons((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    },
    [activeLessonId]
  );

  const isGameDone = useCallback(
    (lessonId?: string) => {
      const id = lessonId || activeLessonId;
      if (!id) return false;
      return Boolean(gameDoneLessons[id]);
    },
    [activeLessonId, gameDoneLessons]
  );

  const registerFullscreen = useCallback((active: boolean) => {
    setFullscreenCount((c) => Math.max(0, c + (active ? 1 : -1)));
  }, []);

  const registerLessonDrawer = useCallback((mounted: boolean) => {
    setDrawerCount((c) => Math.max(0, c + (mounted ? 1 : -1)));
  }, []);

  return (
    <LessonFlowContext.Provider
      value={{
        activeLessonId,
        confirmedLessons,
        confirmLesson,
        isLessonConfirmed,
        gameDoneLessons,
        markGameDone,
        isGameDone,
        quizDoneLessons,
        devUnlocked,
        isAnyFullscreen: fullscreenCount > 0,
        registerFullscreen,
        onOpenAllLessons,
        hasLessonDrawerOnPage: drawerCount > 0,
        registerLessonDrawer,
      }}
    >
      {children}
    </LessonFlowContext.Provider>
  );
};

export const FloatingPageNavigator: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const {
    activeLessonId,
    isLessonConfirmed,
    isGameDone,
    quizDoneLessons,
    isAnyFullscreen,
    onOpenAllLessons,
    hasLessonDrawerOnPage,
  } = useLessonFlow();

  const [open, setOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Close drawer whenever lesson changes
  useEffect(() => {
    setOpen(false);
    setShowInfo(false);
  }, [activeLessonId]);

  if (!visible || isAnyFullscreen || !activeLessonId) return null;

  const lessonDone = isLessonConfirmed(activeLessonId) || !hasLessonDrawerOnPage;
  const gameDone = isGameDone(activeLessonId);
  const quizDone = Boolean(quizDoneLessons[activeLessonId]);

  // Determine the single clearest NEXT action for the user
  let nextTarget: 'game' | 'lesson' | 'quiz' | 'next' = 'lesson';
  let nextLabel = 'അടുത്തത്: 📖 പാഠം തുറന്ന് ഉറപ്പിക്കാം';
  if (quizDone) {
    nextTarget = 'next';
    nextLabel = 'പൂർത്തിയായി! 🚀 അടുത്ത പാഠത്തിലേക്ക് പോകാം';
  } else if (lessonDone) {
    nextTarget = 'quiz';
    nextLabel = 'അടുത്തത്: ❓ ക്വിസിന് ഉത്തരം നൽകാം';
  } else if (gameDone) {
    nextTarget = 'lesson';
    nextLabel = 'ഗെയിം കഴിഞ്ഞു! 📖 ഇനി പാഠം ഉറപ്പിക്കാം';
  } else {
    nextTarget = 'lesson';
    nextLabel = 'ആദ്യം 🎮 ഗെയിം കളിക്കാം അല്ലെങ്കിൽ 📖 പാഠം വായിക്കാം';
  }

  const jumpTo = (selector: string) => {
    setOpen(false);
    setTimeout(() => {
      const found = smoothScrollToSelector(selector);
      if (!found) {
        if (selector === '[data-lesson-game="true"]') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (selector === '[data-lesson-quiz="true"]') {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      }
    }, 60);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto w-[275px] sm:w-[300px] bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-200 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-3.5 py-2.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-extrabold">പേജ് നാവിഗേഷൻ</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowInfo((v) => !v)}
                  aria-label="നാവിഗേഷൻ വിവരണം"
                  className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="അടയ്ക്കുക"
                  className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {showInfo && (
              <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2 text-[11px] font-bold text-amber-900 leading-relaxed">
                ഈ പേജിലെ ഗെയിം, പാഠം, സ്റ്റോറി ലൈൻ, ക്വിസ് എന്നിവയിലേക്ക് വേഗത്തിൽ എത്താൻ ഇവിടെ തൊടുക. 👉 വിരൽ കാണിക്കുന്നത് ഇനി അടുത്തതായി ചെയ്യേണ്ട കാര്യമാണ്.
              </div>
            )}

            {/* Next Step Banner */}
            <div className="px-3.5 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.1 }}
                className="text-sm shrink-0"
              >
                👉
              </motion.span>
              <span className="text-[11px] font-extrabold text-emerald-900 leading-snug">
                {nextLabel}
              </span>
            </div>

            {/* Section Jump Links */}
            <div className="p-2.5 space-y-1.5">
              <button
                type="button"
                onClick={() => jumpTo('[data-lesson-game="true"]')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  !gameDone && !lessonDone
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-emerald-600" />
                  ഗെയിം കളിക്കാം
                </span>
                {gameDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-[10px] text-slate-500">തുറക്കാം</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => jumpTo('[data-lesson-drawer="true"]')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  nextTarget === 'lesson'
                    ? 'bg-amber-100 text-amber-950 border-2 border-amber-400 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  പാഠം വായിക്കാം
                </span>
                {lessonDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <motion.span
                    animate={{ x: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.9 }}
                    className="text-xs font-black text-amber-700"
                  >
                    👈 ഇനി ഇത്
                  </motion.span>
                )}
              </button>

              <button
                type="button"
                onClick={() => jumpTo('[data-lesson-storyline="true"]')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold bg-slate-50 hover:bg-purple-50 text-slate-800 border border-slate-200/80 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  സ്റ്റോറി ലൈൻ മനസ്സിലാക്കാം
                </span>
                <span className="text-[10px] text-purple-600">കഥ</span>
              </button>

              <button
                type="button"
                onClick={() => jumpTo('[data-lesson-quiz="true"]')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  nextTarget === 'quiz'
                    ? 'bg-amber-100 text-amber-950 border-2 border-amber-400 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80'
                }`}
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  ക്വിസ് പ്രോഗ്രാം
                </span>
                {quizDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : nextTarget === 'quiz' ? (
                  <motion.span
                    animate={{ x: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.9 }}
                    className="text-xs font-black text-amber-700"
                  >
                    👈 ഇനി ഇത്
                  </motion.span>
                ) : (
                  <span className="text-[10px] text-slate-400">🔒 പാഠത്തിന് ശേഷം</span>
                )}
              </button>

              {/* Quick Top / Bottom / All Lessons */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" /> മുകളിലേക്ക്
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" /> താഴേക്ക്
                </button>
              </div>

              {onOpenAllLessons && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onOpenAllLessons();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors cursor-pointer"
                >
                  <MapIcon className="w-3.5 h-3.5" /> എല്ലാ പാഠങ്ങളും (50)
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Floating Toggle Button */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        {!open && gameDone && !lessonDone && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: [0, -4, 0] }}
            transition={{ x: { repeat: Infinity, duration: 1.1 } }}
            onClick={() => setOpen(true)}
            className="cursor-pointer bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-full shadow-lg border border-amber-300 flex items-center gap-1"
          >
            <span>അടുത്തത് ഇവിടെ</span>
            <span>👉</span>
          </motion.div>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="പേജ് നാവിഗേഷൻ തുറക്കുക"
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full font-extrabold text-xs shadow-xl border-2 transition-all active:scale-95 cursor-pointer ${
            open
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-300 hover:from-emerald-700 hover:to-teal-700'
          }`}
        >
          {open ? <X className="w-4 h-4" /> : <Compass className="w-4 h-4 text-amber-200" />}
          <span className="hidden sm:inline">{open ? 'അടയ്ക്കുക' : 'നാവിഗേഷൻ'}</span>
        </button>
      </div>
    </div>
  );
};
