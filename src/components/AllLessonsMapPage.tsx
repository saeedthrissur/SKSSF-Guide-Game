import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Lock, Play, Unlock } from 'lucide-react';
import { ALL_LESSONS, LessonDescriptor } from '../utils/lessonTracker';
import { sound } from '../utils/sound';

interface AllLessonsMapPageProps {
  activeLessonId: string;
  completedLessonIds: string[];
  devUnlocked: boolean;
  onSetDevUnlocked: (val: boolean) => void;
  onSelectLesson: (lessonId: string) => void;
  onClose: () => void;
}

const SECRET_CODES = ['1989', 'skssf1989', 'dev1989'];

export const AllLessonsMapPage: React.FC<AllLessonsMapPageProps> = ({
  activeLessonId,
  completedLessonIds,
  devUnlocked,
  onSetDevUnlocked,
  onSelectLesson,
  onClose,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const tapTimerRef = useRef<number | null>(null);
  const [codePromptOpen, setCodePromptOpen] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [codeError, setCodeError] = useState(false);
  const keyBufferRef = useRef('');

  const totalCount = ALL_LESSONS.length;
  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);
  const completedCount = useMemo(
    () => ALL_LESSONS.filter((l) => completedSet.has(l.id)).length,
    [completedSet]
  );
  const remainingCount = Math.max(0, totalCount - completedCount);
  const progressPct = Math.round((completedCount / Math.max(1, totalCount)) * 100);

  const activeIdx = Math.max(
    0,
    ALL_LESSONS.findIndex((l) => l.id === activeLessonId)
  );

  // Group lessons by groupLabel preserving curriculum order
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: { lesson: LessonDescriptor; globalIdx: number }[] }>();
    ALL_LESSONS.forEach((lesson, idx) => {
      const existing = map.get(lesson.groupLabel);
      if (existing) {
        existing.items.push({ lesson, globalIdx: idx });
      } else {
        map.set(lesson.groupLabel, {
          label: lesson.groupLabel,
          items: [{ lesson, globalIdx: idx }],
        });
      }
    });
    return Array.from(map.values());
  }, []);

  // Silent keyboard cheat code listener ("dev1989") — zero visible hint in UI
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (codePromptOpen) return;
      if (e.key.length === 1) {
        keyBufferRef.current = (keyBufferRef.current + e.key.toLowerCase()).slice(-12);
        if (keyBufferRef.current.endsWith('dev1989')) {
          keyBufferRef.current = '';
          sound.unlockAudio();
          sound.playUnlock();
          onSetDevUnlocked(!devUnlocked);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [codePromptOpen, devUnlocked, onSetDevUnlocked]);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current !== null) {
        window.clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  // Silent 7-tap trigger on the decorative map icon
  const handleIconTap = () => {
    const next = tapCount + 1;
    if (tapTimerRef.current !== null) {
      window.clearTimeout(tapTimerRef.current);
    }
    if (next >= 7) {
      setTapCount(0);
      setCodeValue('');
      setCodeError(false);
      setCodePromptOpen(true);
    } else {
      setTapCount(next);
      tapTimerRef.current = window.setTimeout(() => {
        setTapCount(0);
      }, 3200);
    }
  };

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = codeValue.trim().toLowerCase();
    if (SECRET_CODES.includes(cleaned)) {
      sound.unlockAudio();
      sound.playUnlock();
      onSetDevUnlocked(true);
      setCodePromptOpen(false);
      setCodeValue('');
      setCodeError(false);
    } else {
      sound.playError();
      setCodeError(true);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Top Overview Header Card */}
      <div className="rounded-3xl border-2 border-emerald-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={handleIconTap}
              aria-label="പാഠങ്ങളുടെ ഭൂപടം"
              className="w-11 h-11 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center text-xl shadow-xs shrink-0 select-none"
            >
              🗺️
            </button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-extrabold text-emerald-950 leading-tight">
                എല്ലാ പാഠങ്ങളും ({totalCount})
              </h2>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                പൂർത്തിയാക്കിയവയും ഇനി ബാക്കിയുള്ളവയും
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {devUnlocked && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSetDevUnlocked(false);
                }}
                aria-label="Lock"
                className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-400 text-amber-900 flex items-center justify-center"
              >
                <Unlock className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>തിരികെ</span>
            </button>
          </div>
        </div>

        {/* 3 Clear Stat Tiles */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-[11px] font-bold text-slate-600">ആകെ പാഠങ്ങൾ</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
              {totalCount}
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-[11px] font-bold text-emerald-800">പൂർത്തിയാക്കിയവ</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 tabular-nums mt-0.5">
              {completedCount}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-[11px] font-bold text-amber-900">ഇനി ബാക്കിയുള്ളവ</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-700 tabular-nums mt-0.5">
              {remainingCount}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-extrabold text-emerald-900 tabular-nums">
            <span>പുരോഗതി</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Grouped Complete List of All Lessons */}
      <div className="space-y-4">
        {groups.map((grp) => {
          const grpDone = grp.items.filter((x) => completedSet.has(x.lesson.id)).length;
          return (
            <div
              key={grp.label}
              className="rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 px-1">
                <h3 className="text-sm sm:text-base font-extrabold text-emerald-950">
                  {grp.label}
                </h3>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-800 tabular-nums">
                  {grpDone}/{grp.items.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grp.items.map(({ lesson, globalIdx }) => {
                  const isDone = completedSet.has(lesson.id);
                  const isCurrent = lesson.id === activeLessonId;
                  const canOpen = devUnlocked || isDone || isCurrent || globalIdx <= activeIdx;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      disabled={!canOpen}
                      onClick={() => {
                        if (!canOpen) return;
                        sound.unlockAudio();
                        sound.playClick();
                        onSelectLesson(lesson.id);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-2.5 ${
                        isCurrent
                          ? 'bg-emerald-700 text-white border-emerald-900 shadow-sm'
                          : isDone
                          ? 'bg-emerald-50/90 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                          : canOpen
                          ? 'bg-white text-slate-900 border-amber-300 hover:bg-amber-50'
                          : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-xl text-xs font-extrabold flex items-center justify-center shrink-0 tabular-nums ${
                            isCurrent
                              ? 'bg-amber-400 text-slate-950'
                              : isDone
                              ? 'bg-emerald-700 text-white'
                              : canOpen
                              ? 'bg-amber-100 text-amber-950'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {globalIdx + 1}
                        </span>
                        <span className="text-lg shrink-0" aria-hidden="true">
                          {lesson.emoji}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold leading-snug break-words">
                          {lesson.title}
                        </span>
                      </div>

                      <span className="shrink-0">
                        {isDone ? (
                          <CheckCircle2
                            className={`w-4 h-4 ${isCurrent ? 'text-amber-300' : 'text-emerald-600'}`}
                          />
                        ) : isCurrent || devUnlocked ? (
                          <Play
                            className={`w-4 h-4 ${isCurrent ? 'text-amber-300' : 'text-emerald-700'}`}
                          />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Silent Unmarked Access Modal — ONLY opens after 7 rapid taps on the corner icon */}
      {codePromptOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setCodePromptOpen(false)}
        >
          <form
            onSubmit={handleSubmitCode}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border-2 border-slate-300 p-4 w-full max-w-xs space-y-3 shadow-xl"
          >
            <input
              type="password"
              autoFocus
              value={codeValue}
              onChange={(e) => {
                setCodeValue(e.target.value);
                setCodeError(false);
              }}
              placeholder="••••"
              className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-center text-base font-extrabold tracking-widest outline-none ${
                codeError
                  ? 'border-rose-500 bg-rose-50 text-rose-900'
                  : 'border-slate-300 focus:border-emerald-600 text-slate-900'
              }`}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCodePromptOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-extrabold"
              >
                ✓
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.section>
  );
};
