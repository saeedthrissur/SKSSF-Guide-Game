import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { LESSON_QUIZZES } from '../data/lessonQuizzes';
import { QuizAnswerRecord } from '../utils/gameStorage';
import { useGameLives } from '../utils/gameLivesContext';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';

/** Smoothly scrolls the active quiz into the exact vertical center of the viewport. */
export function scrollToActiveQuiz(): void {
  if (typeof document === 'undefined') return;
  const el = document.querySelector<HTMLElement>('[data-lesson-quiz="true"]');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/** Smoothly scrolls to the collapsed lesson drawer right below the quiz. */
export function scrollToLessonDrawer(): void {
  if (typeof document === 'undefined') return;
  const el = document.querySelector<HTMLElement>('[data-lesson-drawer="true"]');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

const LESSON_HINT_PHRASES = [
  'സൂചന വേണോ? താഴത്തെ പാഠത്തിൽ ഉത്തരം ഒളിഞ്ഞിരിപ്പുണ്ട്.',
  'ഉത്തരം ഉറപ്പിക്കാൻ താഴെ കൊടുത്ത പാഠം തുറന്നു നോക്കാം.',
  'സംശയമുണ്ടെങ്കിൽ താഴത്തെ പാഠഭാഗം വായിച്ചാൽ ഉത്തരം എളുപ്പം കിട്ടും.',
  'ശരിയായ ഉത്തരം കണ്ടെത്താൻ താഴത്തെ പാഠം പരിശോധിക്കാം.',
];

function getVariedLessonHint(lessonId: string): string {
  let hash = 0;
  for (let i = 0; i < lessonId.length; i += 1) {
    hash = (hash * 31 + lessonId.charCodeAt(i)) | 0;
  }
  return LESSON_HINT_PHRASES[Math.abs(hash) % LESSON_HINT_PHRASES.length];
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
  title = 'ക്വിസ്',
  onNextLesson,
  nextLessonLabel = 'അടുത്ത പാഠം',
}) => {
  const quiz = LESSON_QUIZZES[lessonId];
  const { lives, maxLives } = useGameLives();
  const [shakeTick, setShakeTick] = useState(0);
  // Quiz is OPEN by default right below the Game!
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, [lessonId]);

  if (!quiz) return null;

  const isAnswered = Boolean(savedAnswer);
  const isPassed = Boolean(savedAnswer?.isCorrect);
  const isWrongAnswered = isAnswered && !isPassed;
  const correctOptionText = quiz.options[quiz.correctIdx] ?? '';
  const hintLine = getVariedLessonHint(lessonId);

  const handleChoose = (idx: number) => {
    if (isAnswered || lives <= 0) return;
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
      className={`mt-3 rounded-2xl border-2 shadow-sm overflow-hidden transition-colors scroll-mt-20 ${
        isPassed
          ? 'bg-emerald-50/95 border-emerald-400'
          : isWrongAnswered
          ? 'bg-rose-50/95 border-rose-400'
          : 'bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/60 border-emerald-300'
      }`}
    >
      {/* Quiz Header Bar (Open by default, still collapsible if user wishes) */}
      <button
        type="button"
        onClick={() => {
          sound.unlockAudio();
          sound.playClick();
          setIsOpen((v) => !v);
        }}
        aria-expanded={isOpen}
        aria-label={title}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-emerald-100/40 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <HelpCircle className="w-4 h-4" />
          </span>
          <span className="text-base leading-none" aria-hidden="true">
            ❓
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-emerald-950 leading-snug break-words">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-extrabold border ${
              lives <= 1
                ? 'bg-rose-100 text-rose-900 border-rose-300'
                : 'bg-white text-rose-800 border-rose-200'
            }`}
          >
            {Array.from({ length: maxLives })
              .map((_, i) => (i < lives ? '❤️' : '💔'))
              .join('')}
          </span>

          {isPassed ? (
            <motion.span
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-extrabold bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> +15
            </motion.span>
          ) : isWrongAnswered ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-extrabold bg-rose-600 text-white">
              💔
            </span>
          ) : null}

          <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {/* Open Quiz Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-emerald-200/80"
          >
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

              {/* Concise Varied Hint pointing to Collapsed Lesson Below */}
              {!isAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    scrollToLessonDrawer();
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-50/90 hover:bg-amber-100/80 border border-amber-200 text-left text-xs font-bold text-amber-950 transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{hintLine}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                </button>
              )}

              {/* PASSED FEEDBACK + SIMPLE NEXT LESSON BUTTON */}
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
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold border-b-4 border-emerald-950 shadow-sm transition-transform active:scale-98"
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
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold border-b-4 border-emerald-950 shadow-sm"
                    >
                      <span>{nextLessonLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
