import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { LESSON_QUIZZES } from '../data/lessonQuizzes';
import { QuizAnswerRecord } from '../utils/gameStorage';
import { useGameLives } from '../utils/gameLivesContext';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';

interface LessonCheckQuizProps {
  lessonId: string;
  savedAnswer?: QuizAnswerRecord;
  onAnswered: (lessonId: string, selectedIdx: number, isCorrect: boolean) => void;
  title?: string;
}

export const LessonCheckQuiz: React.FC<LessonCheckQuizProps> = ({
  lessonId,
  savedAnswer,
  onAnswered,
  title = 'ഈ പാഠത്തിൽ നിന്ന് നമ്മൾ എന്ത് പഠിച്ചു? ഒരു ചെറിയ ചോദ്യം',
}) => {
  const quiz = LESSON_QUIZZES[lessonId];
  const { lives, maxLives } = useGameLives();
  const [shakeTick, setShakeTick] = useState(0);

  if (!quiz) return null;

  const isAnswered = Boolean(savedAnswer);
  const isPassed = Boolean(savedAnswer?.isCorrect);
  const isWrongAnswered = isAnswered && !isPassed;
  const correctOptionText = quiz.options[quiz.correctIdx] ?? '';

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
      initial={{ opacity: 0, y: 12 }}
      animate={
        isWrongAnswered && shakeTick > 0
          ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, -3, 0] }
          : { opacity: 1, y: 0, x: 0 }
      }
      transition={{ duration: isWrongAnswered && shakeTick > 0 ? 0.45 : 0.3 }}
      className={`mt-6 rounded-3xl border-2 p-5 sm:p-6 shadow-md transition-colors ${
        isPassed
          ? 'bg-emerald-50/95 border-emerald-400'
          : isWrongAnswered
          ? 'bg-rose-50/95 border-rose-400'
          : 'bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/60 border-emerald-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-emerald-900">
          <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <HelpCircle className="w-4 h-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              പാഠം വിലയിരുത്തൽ · ശരിയുത്തരം തിരഞ്ഞെടുക്കൂ!
            </p>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
              {title}
            </h4>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Compact Hearts Indicator inside Quiz Header */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border ${
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> ശരിയാണ്! (+15 XP)
            </motion.span>
          ) : isWrongAnswered ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white">
              💔 ശരിയല്ല (-1 ഹൃദയം)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              ❤️ 3 തെറ്റ് = ഒന്നാമത്തെ പാഠം മുതൽ റീസെറ്റ്!
            </span>
          )}
        </div>
      </div>

      <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-4">
        {quiz.question}
      </p>

      <div className="grid gap-2.5">
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
              className={`w-full text-left rounded-2xl border-2 px-4 py-3.5 transition-all flex items-center justify-between gap-3 ${cardClass}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {badgeEl}
                <span className="text-sm sm:text-base font-bold leading-snug">
                  {opt}
                </span>
              </div>

              {isAnswered && isCorrectOption && (
                <span className="shrink-0 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-700 text-white">
                  ✅ ശരിയായ ഉത്തരം
                </span>
              )}
              {isUserWrongPick && (
                <span className="shrink-0 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-rose-600 text-white">
                  ❌ ശരിയല്ല (-1 💔)
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* PASSED FEEDBACK */}
      {isPassed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mt-4 rounded-2xl p-4 border-2 border-emerald-300 bg-white text-emerald-950 space-y-1"
        >
          <p className="text-sm sm:text-base font-extrabold text-emerald-800">
            🎉 ശരിയുത്തരം! നന്നായി മനസ്സിലാക്കിയിരിക്കുന്നു — ഇനി അടുത്ത പാഠത്തിലേക്ക് പോകാം!
          </p>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {quiz.explanation}
          </p>
        </motion.div>
      )}

      {/* WRONG ANSWER: TELL "ശരിയല്ല" + REVEAL & EXPLAIN THE CORRECT ANSWER + SHOW REMAINING HEARTS! */}
      {isWrongAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl p-4 border-2 border-rose-300 bg-white space-y-2 shadow-xs"
        >
          <p className="text-sm sm:text-base font-extrabold text-rose-700">
            ❌ തിരഞ്ഞെടുത്ത ഉത്തരം ശരിയല്ല! ഒരു ഹൃദയം പൊട്ടി (ബാക്കി: {lives}/{maxLives})
          </p>
          <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-3.5 py-2.5 space-y-1">
            <p className="text-xs sm:text-sm font-extrabold text-emerald-900">
              ✅ ശരിയായ ഉത്തരം: {correctOptionText}
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {quiz.explanation}
            </p>
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-rose-800">
            {lives > 0
              ? `ശ്രദ്ധിക്കൂ: ഇനി ${lives} ഹൃദയം കൂടിയേ ബാക്കിയുള്ളൂ! 3 ഹൃദയവും പൊട്ടിയാൽ ഒന്നാമത്തെ പാഠം മുതൽ വീണ്ടും തുടങ്ങേണ്ടി വരും.`
              : '💔 3 ഹൃദയങ്ങളും നഷ്ടമായി! ഇനി ഒന്നാമത്തെ പാഠം മുതൽ പുതിയ 3 ഹൃദയത്തോടെ വീണ്ടും തുടങ്ങാം.'}
          </p>
        </motion.div>
      )}
    </motion.section>
  );
};
