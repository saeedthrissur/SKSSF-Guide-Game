import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronUp,
  HelpCircle,
  Info,
  Lock,
  Play,
  XCircle,
} from 'lucide-react';
import { LESSON_QUIZZES } from '../data/lessonQuizzes';
import { LessonStorylineCard } from '../data/lessonStorylines';
import { QuizAnswerRecord } from '../utils/gameStorage';
import { useGameLives } from '../utils/gameLivesContext';
import { useLessonFlow } from '../utils/lessonFlowContext';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';

/**
 * Smart scroll: if the current page has an unconfirmed Lesson Drawer, guide the user
 * to the Lesson first so they read & confirm it before opening the Quiz.
 * Otherwise scroll smoothly to the Quiz itself.
 */
export function scrollToActiveQuiz(): void {
  if (typeof document === 'undefined') return;
  const unconfirmedLesson = document.querySelector<HTMLElement>(
    '[data-lesson-drawer="true"][data-lesson-drawer-confirmed="false"]'
  );
  if (unconfirmedLesson) {
    unconfirmedLesson.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const el = document.querySelector<HTMLElement>('[data-lesson-quiz="true"]');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/** Smoothly scrolls directly to the quiz box (used right after confirming the lesson). */
export function scrollDirectToQuiz(): void {
  if (typeof document === 'undefined') return;
  const el = document.querySelector<HTMLElement>('[data-lesson-quiz="true"]');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/** Smoothly scrolls to the lesson drawer. */
export function scrollToLessonDrawer(): void {
  if (typeof document === 'undefined') return;
  const el = document.querySelector<HTMLElement>('[data-lesson-drawer="true"]');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

interface LessonCheckQuizProps {
  lessonId: string;
  savedAnswer?: QuizAnswerRecord;
  onAnswered: (lessonId: string, selectedIdx: number, isCorrect: boolean) => void;
  title?: string;
  onNextLesson?: () => void;
  nextLessonLabel?: string;
}

export const LessonCheckQuiz: React.FC<LessonCheckQuizProps> = ({
  lessonId,
  savedAnswer,
  onAnswered,
  title = 'ക്വിസ് പ്രോഗ്രാം',
  onNextLesson,
  nextLessonLabel = 'അടുത്ത പാഠം',
}) => {
  const quiz = LESSON_QUIZZES[lessonId];
  const { lives, maxLives } = useGameLives();
  const { isLessonConfirmed, hasLessonDrawerOnPage } = useLessonFlow();
  const [shakeTick, setShakeTick] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setIsOpen(false);
    setShowInfo(false);
  }, [lessonId]);

  // Automatically open the quiz when the user confirms the lesson drawer
  useEffect(() => {
    const onAutoOpenQuiz = () => {
      setIsOpen(true);
    };
    window.addEventListener('skssf:open-quiz', onAutoOpenQuiz);
    return () => window.removeEventListener('skssf:open-quiz', onAutoOpenQuiz);
  }, []);

  if (!quiz) return null;

  const isAnswered = Boolean(savedAnswer);
  const isPassed = Boolean(savedAnswer?.isCorrect);
  const isWrongAnswered = isAnswered && !isPassed;
  const correctOptionText = quiz.options[quiz.correctIdx] ?? '';

  // Mandatory lesson check: quiz stays locked until user confirms the lesson drawer (unless already answered or no drawer exists)
  const lessonUnlocked = isAnswered || !hasLessonDrawerOnPage || isLessonConfirmed(lessonId);

  const handleChoose = (idx: number) => {
    if (!lessonUnlocked || isAnswered || lives <= 0) return;
    sound.unlockAudio();
    const isCorrect = idx === quiz.correctIdx;

    if (isCorrect) {
      sound.playSuccess();
      onAnswered(lessonId, idx, true);
      narrator.speak(`ശരിയാണ്! ${quiz.explanation}`);
    } else {
      sound.playError();
      setShakeTick((k) => k + 1);
      onAnswered(lessonId, idx, false);
      const nextLives = Math.max(0, lives - 1);
      if (nextLives > 0) {
        narrator.speak(
          `തിരഞ്ഞെടുത്ത ഉത്തരം ശരിയല്ല! ഒരു ഹൃദയം പൊട്ടി. ശരിയായ ഉത്തരം ഇതാണ്: ${correctOptionText}. ${quiz.explanation}`
        );
      } else {
        narrator.speak(
          `തിരഞ്ഞെടുത്ത ഉത്തരം ശരിയല്ല! ശരിയായ ഉത്തരം: ${correctOptionText}. 3 ഹൃദയങ്ങളും നഷ്ടമായി — ഇനി ഒന്നാമത്തെ പാഠം മുതൽ വീണ്ടും തുടങ്ങാം!`
        );
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Truthful Imaginative Storyline Card (Collapsed by default) */}
      <LessonStorylineCard lessonId={lessonId} />

      <motion.section
        key={`quiz_box_${lessonId}_${shakeTick}`}
        data-lesson-quiz="true"
        initial={{ opacity: 0, y: 10 }}
        animate={
          isWrongAnswered && shakeTick > 0
            ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, -3, 0] }
            : { opacity: 1, y: 0, x: 0 }
        }
        transition={{ duration: isWrongAnswered && shakeTick > 0 ? 0.45 : 0.25 }}
        className={`rounded-2xl border-2 shadow-sm overflow-hidden transition-colors scroll-mt-20 ${
          !lessonUnlocked
            ? 'bg-slate-50 border-amber-300'
            : isPassed
            ? 'bg-emerald-50/95 border-emerald-400'
            : isWrongAnswered
            ? 'bg-rose-50/95 border-rose-400'
            : 'bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/60 border-emerald-300'
        }`}
      >
        {/* Unified 2-Row Quiz Header */}
        <div className="p-3.5 sm:p-4 space-y-3">
          {/* Row 1: Full-width Icon + Section Tag + Status + Complete Readable Title */}
          <div className="flex items-start gap-3 w-full">
            <span
              className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs ${
                lessonUnlocked ? 'bg-emerald-700' : 'bg-amber-600'
              }`}
            >
              {lessonUnlocked ? <HelpCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black tracking-wider uppercase text-emerald-700">
                  QUIZ
                </span>
                {isPassed ? (
                  <motion.span
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="w-3 h-3" /> +15 XP
                  </motion.span>
                ) : isWrongAnswered ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white">
                    പൂർത്തിയായി 💔
                  </span>
                ) : !lessonUnlocked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    🔒 പാഠം ആദ്യം
                  </span>
                ) : null}
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-emerald-950 leading-snug">
                {title}
              </h3>
              {!lessonUnlocked && (
                <p className="text-xs font-bold text-amber-800 leading-snug">
                  പാഠം തുറന്ന് ഉറപ്പിച്ച ശേഷം ക്വിസ് തുറക്കും
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Uniform Action Bar Below Title */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-emerald-200/70">
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playClick();
                setIsOpen((v) => !v);
              }}
              aria-expanded={isOpen}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold border-b-2 shadow-xs transition-transform active:scale-95 cursor-pointer ${
                isOpen
                  ? 'bg-white hover:bg-slate-50 text-emerald-950 border-emerald-300 border'
                  : lessonUnlocked
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-950'
                  : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-700'
              }`}
            >
              {isOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : lessonUnlocked ? (
                <Play className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>{isOpen ? 'Close Quiz' : 'Open Quiz'}</span>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`inline-flex items-center gap-0.5 px-2.5 h-9 rounded-xl text-xs font-extrabold border ${
                  lives <= 1
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : 'bg-white text-rose-800 border-rose-200'
                }`}
              >
                {Array.from({ length: maxLives })
                  .map((_, i) => (i < lives ? '❤️' : '💔'))
                  .join('')}
              </span>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowInfo((v) => !v);
                }}
                aria-label="ക്വിസ് വിവരണം"
                title="ക്വിസ് വിവരണം"
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {showInfo && (
          <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-200 text-xs font-bold text-amber-950 leading-relaxed">
            ℹ️ ആദ്യം മുകളിലെ 📖 പാഠം വായിച്ച് <strong>“പാഠം മനസ്സിലാക്കി — ക്വിസ് തുറക്കാം”</strong> എന്ന ബട്ടൺ അമർത്തുക. അതിന് ശേഷമേ ക്വിസ് തുറക്കൂ. ക്വിസിന് ഉത്തരം നൽകിയാലേ അടുത്ത പാഠത്തിലേക്കും ഗെയിമിലേക്കും കടക്കാൻ കഴിയൂ!
          </div>
        )}

        {/* Quiz Body */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-emerald-200/80"
            >
              {!lessonUnlocked ? (
                /* LOCKED STATE — Guides user with animated pointing hand to Lesson above */
                <div className="p-4 sm:p-5 text-center space-y-3 bg-gradient-to-b from-amber-50/60 to-white">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-700 mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm sm:text-base font-extrabold text-slate-900">
                      ആദ്യം മുകളിലെ പാഠം തുറന്ന് പൂർത്തിയാക്കാം!
                    </p>
                    <p className="text-xs font-semibold text-slate-600 max-w-md mx-auto leading-relaxed">
                      പാഠം എന്താണോ പറയുന്നത് അത് വായിച്ച് <strong>“✅ പാഠം മനസ്സിലാക്കി — ക്വിസ് തുറക്കാം”</strong> അമർത്തിയാലുടൻ ഈ ക്വിസ് തുറക്കും.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      window.dispatchEvent(new CustomEvent('skssf:open-lesson'));
                      window.setTimeout(() => scrollToLessonDrawer(), 80);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-extrabold border-b-4 border-amber-700 shadow-sm cursor-pointer transition-transform active:scale-95"
                  >
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9 }}
                      className="text-base"
                    >
                      👆
                    </motion.span>
                    <BookOpen className="w-4 h-4" />
                    <span>Open Lesson</span>
                  </button>
                </div>
              ) : (
                /* UNLOCKED QUIZ */
                <div className="p-4 sm:p-5 space-y-3.5">
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                    {quiz.question}
                  </p>

                  <div className="grid gap-2">
                    {quiz.options.map((opt, idx) => {
                      const isCorrectOption = idx === quiz.correctIdx;
                      const isUserWrongPick = isWrongAnswered && savedAnswer?.selectedIdx === idx;

                      let cardClass =
                        'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-800 cursor-pointer';
                      let badgeEl: React.ReactNode = (
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                      );

                      if (isAnswered) {
                        if (isCorrectOption) {
                          cardClass =
                            'bg-emerald-100/95 border-emerald-600 text-emerald-950 ring-2 ring-emerald-300 cursor-default';
                          badgeEl = <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />;
                        } else if (isUserWrongPick) {
                          cardClass =
                            'bg-rose-100/95 border-rose-500 text-rose-950 ring-2 ring-rose-300 cursor-default';
                          badgeEl = <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
                        } else {
                          cardClass =
                            'bg-white/60 border-slate-200/80 text-slate-500 opacity-70 cursor-default';
                        }
                      }

                      return (
                        <motion.button
                          key={idx}
                          type="button"
                          disabled={isAnswered || lives <= 0}
                          whileHover={!isAnswered ? { scale: 1.01 } : {}}
                          whileTap={!isAnswered ? { scale: 0.98 } : {}}
                          onClick={() => handleChoose(idx)}
                          className={`w-full text-left rounded-2xl border-2 px-3.5 py-3 transition-all flex items-center justify-between gap-2.5 ${cardClass}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {badgeEl}
                            <span className="text-xs sm:text-sm font-bold leading-snug break-words">
                              {opt}
                            </span>
                          </div>

                          {isAnswered && isCorrectOption && (
                            <span className="shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                              ✅
                            </span>
                          )}
                          {isUserWrongPick && (
                            <span className="shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                              ❌ 💔
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Quick link back to Lesson above */}
                  {!isAnswered && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        scrollToLessonDrawer();
                      }}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-50/90 hover:bg-amber-100/80 border border-amber-200 text-left text-xs font-bold text-amber-950 transition-colors cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>സംശയമുണ്ടെങ്കിൽ മുകളിലെ പാഠം ഒരിക്കൽ കൂടി നോക്കാം</span>
                      </span>
                      <ChevronUp className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    </button>
                  )}

                  {/* PASSED FEEDBACK + NEXT LESSON BUTTON */}
                  {isPassed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="rounded-2xl p-3.5 border-2 border-emerald-300 bg-white text-emerald-950 space-y-2.5"
                    >
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-extrabold text-emerald-800">
                          🎉 ശരിയുത്തരം! (+15 XP)
                        </p>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                          {quiz.explanation}
                        </p>
                      </div>

                      {onNextLesson && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.unlockAudio();
                            sound.playPop();
                            onNextLesson();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold border-b-4 border-emerald-950 shadow-sm transition-transform active:scale-98 cursor-pointer"
                        >
                          <span>{nextLessonLabel}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* WRONG ANSWER */}
                  {isWrongAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-3.5 border-2 border-rose-300 bg-white space-y-2.5 shadow-xs"
                    >
                      <p className="text-xs sm:text-sm font-extrabold text-rose-700">
                        ❌ ശരിയല്ല! 💔 ({lives}/{maxLives})
                      </p>
                      <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-2 space-y-1">
                        <p className="text-xs sm:text-sm font-extrabold text-emerald-900">
                          ✅ {correctOptionText}
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {quiz.explanation}
                        </p>
                      </div>
                      {onNextLesson && lives > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.unlockAudio();
                            sound.playClick();
                            onNextLesson();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold border-b-4 border-emerald-950 shadow-sm cursor-pointer"
                        >
                          <span>{nextLessonLabel}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
};
