import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Lock, Play, Search, Unlock, X } from 'lucide-react';
import {
  ALL_LESSONS,
  getSequentialFrontierIndex,
  LessonDescriptor,
} from '../utils/lessonTracker';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'remaining'>('all');
  const keyBufferRef = useRef('');

  const totalCount = ALL_LESSONS.length;
  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);
  const completedCount = useMemo(
    () => ALL_LESSONS.filter((l) => completedSet.has(l.id)).length,
    [completedSet]
  );
  const remainingCount = Math.max(0, totalCount - completedCount);
  const progressPct = Math.round((completedCount / Math.max(1, totalCount)) * 100);

  const nextSequentialIdx = useMemo(
    () => getSequentialFrontierIndex(completedLessonIds),
    [completedLessonIds]
  );
  const activeIdx = Math.max(
    0,
    ALL_LESSONS.findIndex((l) => l.id === activeLessonId)
  );
  const resumeIdx = devUnlocked || activeIdx <= nextSequentialIdx ? activeIdx : nextSequentialIdx;
  const activeLesson = ALL_LESSONS[resumeIdx];

  // Group lessons by groupLabel preserving curriculum order + applying search & filter
  const groups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const map = new Map<string, { label: string; items: { lesson: LessonDescriptor; globalIdx: number }[] }>();
    ALL_LESSONS.forEach((lesson, idx) => {
      const isDone = completedSet.has(lesson.id);
      if (statusFilter === 'done' && !isDone) return;
      if (statusFilter === 'remaining' && isDone) return;
      if (
        q &&
        !lesson.title.toLowerCase().includes(q) &&
        !lesson.groupLabel.toLowerCase().includes(q) &&
        !String(idx + 1).includes(q)
      ) {
        return;
      }
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
  }, [searchQuery, statusFilter, completedSet]);

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
      <div className="rounded-3xl border-2 border-emerald-200 bg-white p-3.5 sm:p-5 shadow-sm space-y-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleIconTap}
              aria-label="പാഠങ്ങളുടെ ഭൂപടം"
              className="w-11 h-11 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center text-xl shadow-xs shrink-0 select-none"
            >
              🗺️
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-extrabold text-emerald-950 leading-tight break-words">
                എല്ലാ പാഠങ്ങളും ({totalCount})
              </h2>
              <p className="text-xs font-semibold text-slate-600 mt-0.5 leading-snug break-words">
                പൂർത്തിയായവയും ഇനി ബാക്കിയുള്ളവയും
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

        {/* 3 Clear Stat Tiles (Overflow-Safe on Narrow Mobile & Font Level 5) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-center">
          <div className="min-w-0 overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 px-1.5 sm:px-3 py-2.5 sm:py-3 flex flex-col items-center justify-center">
            <p className="text-[10px] sm:text-xs font-bold text-slate-600 leading-tight break-words max-w-full">
              ആകെ പാഠങ്ങൾ
            </p>
            <p className="text-lg sm:text-2xl font-extrabold text-slate-900 tabular-nums mt-1 notranslate">
              {totalCount}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-2xl bg-emerald-50 border border-emerald-200 px-1.5 sm:px-3 py-2.5 sm:py-3 flex flex-col items-center justify-center">
            <p className="text-[10px] sm:text-xs font-bold text-emerald-800 leading-tight break-words max-w-full">
              പൂർത്തിയായവ
            </p>
            <p className="text-lg sm:text-2xl font-extrabold text-emerald-700 tabular-nums mt-1 notranslate">
              {completedCount}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-2xl bg-amber-50 border border-amber-200 px-1.5 sm:px-3 py-2.5 sm:py-3 flex flex-col items-center justify-center">
            <p className="text-[10px] sm:text-xs font-bold text-amber-900 leading-tight break-words max-w-full">
              ബാക്കിയുള്ളവ
            </p>
            <p className="text-lg sm:text-2xl font-extrabold text-amber-700 tabular-nums mt-1 notranslate">
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
              className="h-full bg-gradient-to-r from-emerald-600 to-amber-400 transition-all duration-300"
            />
          </div>
        </div>

        {/* Quick Resume Active Lesson + Search & Status Filter Controls */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          {activeLesson && (
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playClick();
                onSelectLesson(activeLesson.id);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
            >
              <span className="text-xs font-extrabold text-emerald-950 truncate">
                നിലവിലെ പാഠം തുടരാം: {resumeIdx + 1}. {activeLesson.title}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 shrink-0 whitespace-nowrap">
                <Play className="w-3.5 h-3.5 fill-current" /> തുടരാം
              </span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="പാഠം തിരയുക (ഉദാ: വിഖായ, പതാക, ട്രെൻഡ്)..."
                aria-label="പാഠം തിരയുക"
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 text-xs sm:text-sm font-semibold text-slate-900 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="തിരയൽ മായ്ക്കുക"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:inline-flex items-stretch gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 w-full sm:w-auto shrink-0">
              {(
                [
                  { id: 'all', label: `എല്ലാം (${totalCount})` },
                  { id: 'done', label: `പൂർത്തിയായവ (${completedCount})` },
                  { id: 'remaining', label: `ബാക്കി (${remainingCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStatusFilter(tab.id);
                  }}
                  className={`min-w-0 px-1.5 sm:px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold leading-tight text-center break-words transition-colors cursor-pointer tabular-nums ${
                    statusFilter === tab.id
                      ? 'bg-white text-emerald-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Complete List of All Lessons */}
      <div className="space-y-4">
        {groups.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-2">
            <p className="text-sm font-extrabold text-slate-800">
              ഈ തിരയലിൽ പാഠങ്ങളൊന്നും കണ്ടെത്തിയില്ല.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold cursor-pointer"
            >
              എല്ലാ പാഠങ്ങളും കാണിക്കാം
            </button>
          </div>
        )}
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
                  const canOpen = devUnlocked || isDone || globalIdx <= nextSequentialIdx;
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
                      className={`w-full min-w-0 overflow-hidden text-left px-3 sm:px-3.5 py-2.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-emerald-700 text-white border-emerald-900 shadow-sm'
                          : isDone
                          ? 'bg-emerald-50/90 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                          : canOpen
                          ? 'bg-white text-slate-900 border-amber-300 hover:bg-amber-50'
                          : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                        <span
                          className={`w-7 h-7 rounded-xl text-xs font-extrabold flex items-center justify-center shrink-0 tabular-nums notranslate ${
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
                        <span className="text-lg shrink-0 notranslate" aria-hidden="true">
                          {lesson.emoji}
                        </span>
                        <span className="min-w-0 flex-1 text-xs sm:text-sm font-extrabold leading-snug break-words">
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

      {/* More Lessons Coming Soon Banner */}
      <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-4 sm:p-5 text-center shadow-2xs space-y-1.5">
        <p className="text-lg" aria-hidden="true">
          ✨🚀📚
        </p>
        <h3 className="text-sm sm:text-base font-extrabold text-emerald-950">
          കൂടുതൽ പാഠങ്ങളും പുതിയ ഗെയിമുകളും ഉടൻ വരുന്നു!
        </h3>
        <p className="text-xs font-semibold text-slate-600 tabular-nums">
          നിലവിൽ {totalCount} സംവേദനാത്മക പാഠങ്ങളും ചെറു ഗെയിമുകളും ലഭ്യമാണ്.
        </p>
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
