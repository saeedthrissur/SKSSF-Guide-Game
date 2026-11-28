import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUp,
  BarChart2,
  BookOpen,
  CheckCircle2,
  ChevronUp,
  Clock,
  HelpCircle,
  Info,
  Lock,
  PhoneCall,
  Play,
  RefreshCw,
  Scissors,
  Sparkles,
  XCircle,
  Zap,
} from 'lucide-react';
import { LESSON_QUIZZES } from '../data/lessonQuizzes';
import { QuizAnswerRecord } from '../utils/gameStorage';
import { useGameLives } from '../utils/gameLivesContext';
import { useLessonFlow } from '../utils/lessonFlowContext';
import { useEcosystem } from '../utils/ecosystemStore';
import { getAppShareUrl, getWhatsAppShareHref } from '../utils/shareLink';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { CrownStarSvg, DiamondGemSvg, GoldCoinSvg, SilverCoinSvg } from './CurrencyIcons';

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
    unconfirmedLesson.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  const el = document.querySelector<HTMLElement>('[data-lesson-quiz="true"]');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('skssf:go-to-study'));
  }
}

/** Smoothly scrolls directly to the quiz box (used right after confirming the lesson). */
export function scrollDirectToQuiz(): void {
  if (typeof document === 'undefined') return;
  const el = document.querySelector<HTMLElement>('[data-lesson-quiz="true"]');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/** Smoothly scrolls to the lesson drawer. */
export function scrollToLessonDrawer(): void {
  if (typeof document === 'undefined') return;
  const el = document.querySelector<HTMLElement>('[data-lesson-drawer="true"]');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/** Fisher-Yates shuffle returning a randomized permutation of [0, 1, ..., n-1] */
function createShuffledOrder(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Deterministic plausible 4th distractor pool so every 3-option lesson quiz
 * upgrades cleanly to a tight 4-option A/B/C/D KBC format without altering saved 0..2 indices.
 */
const TIGHT_FOURTH_DISTRACTORS: string[] = [
  'ഇത് ജില്ലാ കമ്മിറ്റിയുടെ വാർഷിക യോഗത്തിൽ മാത്രം തീരുമാനിക്കുന്ന വിഷയമാണ്',
  'ഇതിന് ഔദ്യോഗിക സംഘടനാ മാർഗ്ഗരേഖയോ രേഖാമൂലമുള്ള നടപടിക്രമമോ ആവശ്യമില്ല',
  'പ്രാദേശിക ക്ലബ്ബ് തലത്തിൽ മാത്രം ഒതുങ്ങുന്ന താൽക്കാലിക സംവിധാനമാണിത്',
  'യൂണിറ്റ് സെക്രട്ടറിയുടെ മാത്രം അനുമതിയോടെ പൂർത്തിയാക്കാവുന്ന കാര്യമാണിത്',
  'സോഷ്യൽ മീഡിയ പോസ്റ്റിലൂടെ മാത്രം പ്രഖ്യാപിക്കുന്ന അനൗപചാരിക രീതിയാണിത്',
  'ഈ വിഷയം സംസ്ഥാന സമ്മേളന കാലയളവിൽ മാത്രം ബാധകമാകുന്നതാണ്',
  'സാധാരണ അംഗത്വം എടുക്കാതെ തന്നെ ആർക്കും സ്വമേധയാ നടപ്പാക്കാവുന്നതാണ്',
  'മുകളിലെ വിവരങ്ങളിൽ നിന്ന് വ്യത്യസ്തമായ അനൗദ്യോഗിക കീഴ്വഴക്കമാണിത്',
];

/** Curated alternate questions for KBC "Flip the Question" lifeline */
const FLIP_QUESTION_BANK: {
  question: string;
  options: [string, string, string, string];
  correctIdx: 0 | 1 | 2 | 3;
  explanation: string;
}[] = [
  {
    question: 'SKSSF-ന്റെ ഔദ്യോഗിക മുദ്രാവാക്യത്തിലെ മൂന്ന് മഹത്തായ ആദർശങ്ങൾ ഏവയാണ്?',
    options: [
      'വിജ്ഞാനം, വിനയം, സേവനം',
      'വേഗത, ശക്തി, വിജയം',
      'സമ്പത്ത്, പ്രശസ്തി, അധികാരം',
      'വ്യാപാരം, കല, വിനോദം',
    ],
    correctIdx: 0,
    explanation: 'വിജ്ഞാനം, വിനയം, സേവനം എന്നിവയാണ് SKSSF-ന്റെ അടിസ്ഥാന ആദർശങ്ങൾ.',
  },
  {
    question: 'സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമയുടെ പണ്ഡിത നേതൃത്വം ഔദ്യോഗികമായി നിലവിൽ വന്ന വർഷം?',
    options: ['1926', '1947', '1965', '1989'],
    correctIdx: 0,
    explanation: '1926 ജൂൺ 26-നാണ് സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ രൂപീകൃതമായത്.',
  },
  {
    question: 'SKSSF-ന്റെ ഔദ്യോഗിക പതാകയിൽ മുകളിൽ നിന്ന് താഴേക്കുള്ള നിറങ്ങളുടെ ശരിയായ ക്രമം?',
    options: ['നീല, വെള്ള, പച്ച', 'പച്ച, വെള്ള, ചുവപ്പ്', 'നീല, മഞ്ഞ, പച്ച', 'വെള്ള, നീല, പച്ച'],
    correctIdx: 0,
    explanation: 'നീല (വിജ്ഞാനം), വെള്ള (വിനയം), പച്ച (സേവനം) എന്ന ക്രമത്തിലാണ് SKSSF പതാക.',
  },
  {
    question: 'ദുരന്തനിവാരണത്തിനും സന്നദ്ധ സേവനത്തിനുമായി SKSSF രൂപീകരിച്ച യൂണിഫോം വളണ്ടിയർ വിംഗ്?',
    options: ['വിഖായ (Viqaya)', 'ട്രെൻഡ് (TREND)', 'സർഗ്ഗലയം', 'ത്വലബ'],
    correctIdx: 0,
    explanation: 'വിഖായ (Viqaya) ആണ് SKSSF-ന്റെ ദുരന്തനിവാരണവും സന്നദ്ധ സേവനവും നിർവ്വഹിക്കുന്ന വിംഗ്.',
  },
  {
    question: 'വിദ്യാർത്ഥികൾക്ക് കരിയർ ഗൈഡൻസും ഉന്നത വിദ്യാഭ്യാസ മാർഗ്ഗനിർദ്ദേശവും നൽകുന്ന വിംഗ്?',
    options: ['ട്രെൻഡ് (TREND)', 'സഹചാരി', 'ഇബാദ്', 'മനീഷ'],
    correctIdx: 0,
    explanation: 'TREND വിംഗ് വിദ്യാർത്ഥികൾക്ക് കരിയർ, സിവിൽ സർവീസ്, ഉന്നത പഠന വഴികാട്ടിയായി പ്രവർത്തിക്കുന്നു.',
  },
  {
    question: 'പാവപ്പെട്ട രോഗികൾക്ക് ചികിത്സാ സഹായം എത്തിക്കുന്ന SKSSF-ന്റെ കാരുണ്യ പദ്ധതി?',
    options: ['സഹചാരി റിലീഫ് സെൽ', 'ഓർഗാനെറ്റ്', 'സത്യധാര', 'കാംപസ് വിംഗ്'],
    correctIdx: 0,
    explanation: 'സഹചാരി റിലീഫ് സെൽ വഴിയാണ് ആയിരക്കണക്കിന് രോഗികൾക്ക് ചികിത്സാ സഹായം ലഭിക്കുന്നത്.',
  },
];

/** Curated Free One-Shot Mastery Bonus Challenges (Zero Penalty, +30 Gold + 1 Diamond) */
const MASTERY_BONUS_CHALLENGES: {
  question: string;
  options: [string, string, string, string];
  correctIdx: 0 | 1 | 2 | 3;
  fact: string;
}[] = [
  {
    question: 'SKSSF ഔദ്യോഗികമായി സ്ഥാപിതമായ ചരിത്ര തീയതി ഏതാണ്?',
    options: ['1989 ഫെബ്രുവരി 19', '1989 ആഗസ്റ്റ് 15', '1951 സെപ്റ്റംബർ 17', '1926 ജൂൺ 26'],
    correctIdx: 0,
    fact: '1989 ഫെബ്രുവരി 19-ന് കോഴിക്കോട് സാമൂതിരി ഹൈസ്കൂളിലാണ് SKSSF പിറവിയെടുത്തത്.',
  },
  {
    question: 'സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡ് (SKIMVB) സ്ഥാപിതമായ വർഷം?',
    options: ['1951', '1926', '1976', '1989'],
    correctIdx: 0,
    fact: '1951 സെപ്റ്റംബർ 17-ന് സ്ഥാപിതമായ SKIMVB ലോകത്തെ ഏറ്റവും വലിയ മദ്റസാ വിദ്യാഭ്യാസ ശൃംഖലയാണ്.',
  },
  {
    question: 'SKSSF-ന്റെ ഔദ്യോഗിക മുഖപത്രമായ മാസികയുടെ പേര് എന്താണ്?',
    options: ['സത്യധാര', 'സുപ്രഭാതം', 'സുന്നി അഫ്കാർ', 'കുരുന്നുകൾ'],
    correctIdx: 0,
    fact: 'സത്യധാരയാണ് SKSSF-ന്റെ ആദർശവും സാംസ്കാരിക നിലപാടുകളും പങ്കുവെക്കുന്ന ഔദ്യോഗിക മുഖപത്രം.',
  },
  {
    question: 'പള്ളി ദർസുകളിലെയും അറബിക് കോളേജുകളിലെയും വിദ്യാർത്ഥികളെ ഏകോപിപ്പിക്കുന്ന SKSSF വിംഗ്?',
    options: ['ത്വലബ (Twalaba)', 'ട്രെൻഡ് (TREND)', 'കാംപസ് വിംഗ്', 'ഇബാദ് (IBAD)'],
    correctIdx: 0,
    fact: 'ത്വലബ വിംഗ് ദർസ്-അറബിക് കോളേജ് വിദ്യാർത്ഥികളുടെ വൈജ്ഞാനിക വളർച്ചയ്ക്ക് നേതൃത്വം നൽകുന്നു.',
  },
  {
    question: 'ലഹരിവിരുദ്ധ ബോധവൽക്കരണവും ധാർമ്മിക ക്യാമ്പുകളും നടത്തുന്ന SKSSF പ്രബോധന വിംഗ്?',
    options: ['ഇബാദ് (IBAD)', 'ഓർഗാനെറ്റ്', 'സർഗ്ഗലയം', 'ഹയർ എജ്യുക്കേഷൻ'],
    correctIdx: 0,
    fact: 'ഇബാദ് (IBAD) വിംഗ് യുവതലമുറയ്ക്ക് ആത്മീയ പ്രബോധനവും ധാർമ്മിക മൂല്യബോധവും പകരുന്നു.',
  },
  {
    question: 'SKSSF-ന്റെ സംഘടനാ ഘടനയിലെ ഏറ്റവും അടിസ്ഥാന തലം ഏതാണ്?',
    options: ['യൂണിറ്റ് കമ്മിറ്റി', 'ക്ലസ്റ്റർ കമ്മിറ്റി', 'മേഖലാ കമ്മിറ്റി', 'ജില്ലാ കമ്മിറ്റി'],
    correctIdx: 0,
    fact: 'മഹല്ല്/പ്രദേശ തലത്തിലുള്ള യൂണിറ്റ് കമ്മിറ്റിയാണ് SKSSF സംഘടനയുടെ അടിത്തറ.',
  },
];

function hashLessonSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

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
  const baseQuiz = LESSON_QUIZZES[lessonId];
  const { lives, maxLives } = useGameLives();
  const { lessonViewStep, isLessonConfirmed, hasLessonDrawerOnPage } = useLessonFlow();
  const {
    state: ecoState,
    transactCurrency,
    consumeQuizHint,
    recordLessonMastery,
  } = useEcosystem();

  const [shakeTick, setShakeTick] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // KBC Lifelines & Timer State
  const [elapsedSec, setElapsedSec] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timeBoostBonusSec, setTimeBoostBonusSec] = useState(0);
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [phoneFriendOpen, setPhoneFriendOpen] = useState(false);
  const [pollResult, setPollResult] = useState<Record<number, number> | null>(null);
  const [flippedQuestion, setFlippedQuestion] = useState<(typeof FLIP_QUESTION_BANK)[number] | null>(
    null
  );
  const [lifelineNotice, setLifelineNotice] = useState<string | null>(null);

  // Speed Mastery Mode Replay state (for already-completed lessons)
  const [speedReplayActive, setSpeedReplayActive] = useState(false);
  const [speedReplayStartTs, setSpeedReplayStartTs] = useState(0);
  const [speedReplayMsg, setSpeedReplayMsg] = useState<string | null>(null);

  // Free One-Shot Mastery Bonus Question state
  const [bonusOpen, setBonusOpen] = useState(false);
  const [bonusAttempted, setBonusAttempted] = useState(false);
  const [bonusResult, setBonusResult] = useState<{ won: boolean; text: string } | null>(null);
  const [coinRewardBanner, setCoinRewardBanner] = useState<string | null>(null);

  // Build 4-option KBC active quiz cleanly (preserving original correctIdx 0..2)
  const activeQuiz = useMemo(() => {
    if (flippedQuestion) {
      return {
        question: flippedQuestion.question,
        options: flippedQuestion.options as string[],
        correctIdx: flippedQuestion.correctIdx as number,
        explanation: flippedQuestion.explanation,
      };
    }
    if (!baseQuiz) return null;
    const opts = [...baseQuiz.options];
    if (opts.length === 3) {
      const seed = hashLessonSeed(lessonId);
      let distractor = TIGHT_FOURTH_DISTRACTORS[seed % TIGHT_FOURTH_DISTRACTORS.length];
      if (opts.includes(distractor)) {
        distractor = TIGHT_FOURTH_DISTRACTORS[(seed + 3) % TIGHT_FOURTH_DISTRACTORS.length];
      }
      opts.push(distractor);
    }
    return {
      question: baseQuiz.question,
      options: opts,
      correctIdx: baseQuiz.correctIdx,
      explanation: baseQuiz.explanation,
    };
  }, [baseQuiz, flippedQuestion, lessonId]);

  const bonusChallenge = useMemo(() => {
    const seed = hashLessonSeed(`${lessonId}_bonus`);
    return MASTERY_BONUS_CHALLENGES[seed % MASTERY_BONUS_CHALLENGES.length];
  }, [lessonId]);

  const [optionOrder, setOptionOrder] = useState<number[]>(() =>
    createShuffledOrder(activeQuiz?.options.length ?? 4)
  );

  useEffect(() => {
    setIsOpen(true);
    setShowInfo(false);
    setElapsedSec(0);
    setTimerPaused(false);
    setTimeBoostBonusSec(0);
    setEliminatedIndices([]);
    setPhoneFriendOpen(false);
    setPollResult(null);
    setFlippedQuestion(null);
    setLifelineNotice(null);
    setSpeedReplayActive(false);
    setSpeedReplayMsg(null);
    setBonusOpen(false);
    setBonusAttempted(false);
    setBonusResult(null);
    setCoinRewardBanner(null);
    setOptionOrder(createShuffledOrder(4));
  }, [lessonId]);

  useEffect(() => {
    if (activeQuiz) {
      setOptionOrder(createShuffledOrder(activeQuiz.options.length));
    }
  }, [flippedQuestion, activeQuiz?.options.length]);

  useEffect(() => {
    const onAutoOpenQuiz = () => {
      setIsOpen(true);
    };
    window.addEventListener('skssf:open-quiz', onAutoOpenQuiz);
    return () => window.removeEventListener('skssf:open-quiz', onAutoOpenQuiz);
  }, []);

  const isAnswered = Boolean(savedAnswer) && !speedReplayActive;
  const isPassed = Boolean(savedAnswer?.isCorrect) && !speedReplayActive;
  const isWrongAnswered = isAnswered && !isPassed;
  const lessonUnlocked = isAnswered || !hasLessonDrawerOnPage || isLessonConfirmed(lessonId);

  // Live timer while quiz is active & unlocked
  useEffect(() => {
    if (lessonViewStep !== 'study' || !lessonUnlocked || isAnswered || timerPaused || !isOpen) {
      return;
    }
    const id = window.setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [lessonViewStep, lessonUnlocked, isAnswered, timerPaused, isOpen]);

  // Show Quiz strictly on Screen 2 ('study': Lesson + Quiz)
  if (!activeQuiz || lessonViewStep !== 'study') return null;

  const correctOptionText = activeQuiz.options[activeQuiz.correctIdx] ?? '';
  const finalNextLabel = nextLessonLabel.includes('സാക്ഷ്യപത്രം')
    ? nextLessonLabel
    : 'അടുത്ത പാഠത്തിലേക്ക്';
  const savedStars = ecoState.progression.lessonStars[lessonId] ?? 0;

  // ---- KBC LIFELINE HANDLERS ----
  const handleLifeline5050 = () => {
    if (eliminatedIndices.length > 0 || isAnswered) return;
    sound.unlockAudio();
    const hadFree = consumeQuizHint('5050');
    if (!hadFree) {
      const paid = transactCurrency({
        action: 'lifeline_5050',
        deltaSilver: -50,
        meta: lessonId,
      });
      if (!paid.ok) {
        sound.playError();
        setLifelineNotice('50:50 ഉപയോഗിക്കാൻ 50 വെള്ളി നാണയമോ ഹിന്റ് പാസോ വേണം.');
        return;
      }
    }
    const wrongIndices = optionOrder.filter((idx) => idx !== activeQuiz.correctIdx);
    const toRemove = wrongIndices.slice(0, 2);
    setEliminatedIndices(toRemove);
    sound.playPop();
    setLifelineNotice('✂️ 50:50 സജീവം! രണ്ട് തെറ്റായ ഓപ്ഷനുകൾ നീക്കം ചെയ്തു.');
  };

  const handleLifelinePhoneFriend = () => {
    if (phoneFriendOpen || isAnswered) return;
    sound.unlockAudio();
    const paid = transactCurrency({
      action: 'lifeline_phone_friend',
      deltaDiamond: -1,
      meta: lessonId,
    });
    if (!paid.ok) {
      sound.playError();
      setLifelineNotice('ഫോൺ-എ-ഫ്രണ്ട് ലൈഫ്‌ലൈനിന് 1 വജ്രം ആവശ്യമാണ്.');
      return;
    }
    setTimerPaused(true);
    setPhoneFriendOpen(true);
    sound.playUnlock();
    setLifelineNotice('📞 ടൈമർ താൽക്കാലികമായി നിർത്തി! കൂട്ടുകാരോട് വാട്സ്ആപ്പിൽ ചോദിക്കാം.');
  };

  const handleLifelineAudiencePoll = () => {
    if (pollResult || isAnswered) return;
    sound.unlockAudio();
    let paid = transactCurrency({
      action: 'lifeline_audience_poll',
      deltaSilver: -40,
      meta: lessonId,
    });
    if (!paid.ok) {
      paid = transactCurrency({
        action: 'lifeline_audience_poll_d',
        deltaDiamond: -1,
        meta: lessonId,
      });
    }
    if (!paid.ok) {
      sound.playError();
      setLifelineNotice('ഓഡിയൻസ് പോളിന് 40 വെള്ളി നാണയമോ 1 വജ്രമോ ആവശ്യമാണ്.');
      return;
    }
    const correctPct = 58 + (hashLessonSeed(lessonId) % 21); // 58–78%
    let rem = 100 - correctPct;
    const wrongIdxs = activeQuiz.options
      .map((_, i) => i)
      .filter((i) => i !== activeQuiz.correctIdx && !eliminatedIndices.includes(i));
    const dist: Record<number, number> = { [activeQuiz.correctIdx]: correctPct };
    wrongIdxs.forEach((idx, pos) => {
      if (pos === wrongIdxs.length - 1) {
        dist[idx] = rem;
      } else {
        const share = Math.max(2, Math.floor(rem / (wrongIdxs.length - pos)));
        dist[idx] = share;
        rem -= share;
      }
    });
    setPollResult(dist);
    sound.playPop();
    setLifelineNotice('📊 കമ്മ്യൂണിറ്റി പോൾ ഫലം തയ്യാറായി! ചുവടെ ശതമാനം പരിശോധിക്കൂ.');
  };

  const handleLifelineFlipQuestion = () => {
    if (flippedQuestion || isAnswered) return;
    sound.unlockAudio();
    const paid = transactCurrency({
      action: 'lifeline_flip_question',
      deltaDiamond: -1,
      meta: lessonId,
    });
    if (!paid.ok) {
      sound.playError();
      setLifelineNotice('ചോദ്യം മാറ്റാൻ (Flip) 1 വജ്രം ആവശ്യമാണ്.');
      return;
    }
    const pick = FLIP_QUESTION_BANK[hashLessonSeed(`${lessonId}_flip`) % FLIP_QUESTION_BANK.length];
    setFlippedQuestion(pick);
    setEliminatedIndices([]);
    setPollResult(null);
    setElapsedSec(0);
    sound.playUnlock();
    setLifelineNotice('🔄 ചോദ്യം മാറ്റി! പുതിയ KBC ചോദ്യത്തിന് ഉത്തരം നൽകൂ.');
  };

  const handleUseTimeBoost = () => {
    if (timeBoostBonusSec > 0 || isAnswered) return;
    if (consumeQuizHint('time')) {
      setTimeBoostBonusSec(15);
      sound.playPop();
      setLifelineNotice('⏱️ +15 സെക്കൻഡ് ടൈം ബൂസ്റ്റ് ചേർത്തു! 3-സ്റ്റാർ നേടാൻ എളുപ്പമായി.');
    }
  };

  const handleChoose = (origIdx: number) => {
    if (!lessonUnlocked || isAnswered || lives <= 0) return;
    if (eliminatedIndices.includes(origIdx)) return;
    sound.unlockAudio();
    const isCorrect = origIdx === activeQuiz.correctIdx;

    // Speed Mastery Mode Replay branch (does not penalize lives or alter original saved answer)
    if (speedReplayActive) {
      const sec = Math.max(1, Math.round((Date.now() - speedReplayStartTs) / 1000));
      setSpeedReplayActive(false);
      if (isCorrect) {
        const stars: 1 | 2 | 3 = sec <= 15 ? 3 : sec <= 25 ? 2 : 1;
        const mastery = recordLessonMastery(lessonId, stars, true);
        sound.playSuccess(2);
        setSpeedReplayMsg(
          mastery.silverEarned > 0
            ? `⚡ സ്പീഡ് മാസ്റ്ററി വിജയം (${sec}s · ${stars}★)! +${mastery.silverEarned} വെള്ളി നാണയം ലഭിച്ചു.`
            : `⚡ സ്പീഡ് മാസ്റ്ററി വിജയം (${sec}s · ${stars}★)! ഇന്നത്തെ റിപ്ലേ നാണയ പരിധി പൂർത്തിയായി.`
        );
      } else {
        sound.playError();
        setSpeedReplayMsg(`സാരമില്ല! ശരിയായ ഉത്തരം: ${correctOptionText}. വീണ്ടും സ്പീഡ് മാസ്റ്ററി പരീക്ഷിക്കാം.`);
      }
      return;
    }

    if (isCorrect) {
      const effectiveSec = Math.max(1, elapsedSec - timeBoostBonusSec);
      const earnedStars: 1 | 2 | 3 = effectiveSec <= 18 ? 3 : effectiveSec <= 30 ? 2 : 1;
      const mastery = recordLessonMastery(lessonId, earnedStars, false);
      sound.playSuccess();
      onAnswered(lessonId, origIdx, true);
      if (mastery.silverEarned > 0) {
        setCoinRewardBanner(`+${mastery.silverEarned} വെള്ളി നാണയം · ${earnedStars} ക്രൗൺ സ്റ്റാർ`);
      }
      narrator.speak(`ശരിയാണ്! ${activeQuiz.explanation}`);
    } else {
      sound.playError();
      setShakeTick((k) => k + 1);
      onAnswered(lessonId, origIdx, false);
      const nextLives = Math.max(0, lives - 1);
      if (nextLives > 0) {
        narrator.speak(
          `സാരമില്ല! ശരിയായ ഉത്തരം ഇതാണ്: ${correctOptionText}. ${activeQuiz.explanation}`
        );
      } else {
        narrator.speak(
          `സാരമില്ല! ശരിയായ ഉത്തരം: ${correctOptionText}. ചെറിയൊരു ആവർത്തനത്തിലൂടെ ഹൃദയം തിരിച്ചുപിടിച്ച് നമുക്ക് മുന്നേറാം!`
        );
      }
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  };

  const handleAnswerBonusChallenge = (optIdx: number) => {
    if (bonusAttempted) return;
    sound.unlockAudio();
    setBonusAttempted(true);
    if (optIdx === bonusChallenge.correctIdx) {
      sound.playSuccess(3);
      transactCurrency({
        action: `mastery_bonus_${lessonId}`,
        deltaGold: 30,
        deltaDiamond: 1,
        meta: 'free_one_shot_bonus',
      });
      setBonusResult({
        won: true,
        text: `🎉 ഗംഭീരം! +30 സ്വർണ്ണ നാണയവും +1 വജ്രവും സ്വന്തമാക്കി! (${bonusChallenge.fact})`,
      });
    } else {
      sound.playClick();
      setBonusResult({
        won: false,
        text: `💛 നഷ്ടമൊന്നുമില്ല! ശരിയായ ഉത്തരം: “${bonusChallenge.options[bonusChallenge.correctIdx]}”. ${bonusChallenge.fact}`,
      });
    }
  };

  const phoneHelpShareHref = getWhatsAppShareHref(
    `📞 SKSSF ഗൈഡ് ഗെയിം — ഫോൺ-എ-ഫ്രണ്ട് സഹായം!\nചോദ്യം: ${activeQuiz.question}\nA) ${activeQuiz.options[0]}\nB) ${activeQuiz.options[1]}\nC) ${activeQuiz.options[2]}\nD) ${activeQuiz.options[3]}\nശരിയായ ഉത്തരം ഏതാണെന്ന് സഹായിക്കാമോ?`,
    getAppShareUrl()
  );

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
      className={`rounded-2xl border-2 shadow-2xs overflow-hidden transition-colors scroll-mt-20 ${
        !lessonUnlocked
          ? 'bg-white border-amber-300'
          : isPassed
          ? 'bg-emerald-50 border-emerald-400'
          : isWrongAnswered
          ? 'bg-rose-50/95 border-rose-400'
          : 'bg-white border-emerald-300'
      }`}
    >
      {/* Unified 2-Row Quiz Header */}
      <div className="p-3.5 sm:p-4 space-y-3">
        <div className="flex items-start gap-3 w-full">
          <span
            className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs ${
              lessonUnlocked ? 'bg-emerald-700' : 'bg-amber-600'
            }`}
          >
            {lessonUnlocked ? <HelpCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
              <span className="font-extrabold text-emerald-700">KBC ക്വിസ് (A/B/C/D)</span>
              {savedStars > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 border border-amber-300">
                  {[1, 2, 3].map((n) => (
                    <CrownStarSvg key={n} filled={n <= savedStars} className="w-3 h-3" />
                  ))}
                </span>
              )}
              {isPassed ? (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <motion.span
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260 }}
                    className="inline-flex items-center gap-1 text-emerald-700 font-extrabold tabular-nums"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> ശരിയുത്തരം (+15 XP)
                  </motion.span>
                </>
              ) : isWrongAnswered ? (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-rose-700 font-extrabold">പൂർത്തിയായി 💔</span>
                </>
              ) : !lessonUnlocked ? (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-amber-800 font-extrabold">🔒 ആദ്യം പാഠം വായിക്കാം</span>
                </>
              ) : null}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-emerald-950 leading-snug">
              {title}
            </h3>
            {!lessonUnlocked && (
              <p className="text-xs font-bold text-amber-800 leading-snug">
                പാഠം മനസ്സിലാക്കി കഴിഞ്ഞാൽ ക്വിസിലേക്ക് കടക്കാം
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
            <span>{isOpen ? 'ക്വിസ് ചുരുക്കാം' : 'ക്വിസ് തുറക്കാം'}</span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            {lessonUnlocked && !isAnswered && (
              <span
                title="വേഗത്തിൽ ഉത്തരം നൽകിയാൽ 3 ക്രൗൺ സ്റ്റാർ ലഭിക്കും"
                className={`inline-flex items-center gap-1 px-2.5 h-9 rounded-xl text-xs font-extrabold border tabular-nums ${
                  timerPaused
                    ? 'bg-sky-50 text-sky-900 border-sky-300'
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>{elapsedSec}s</span>
                {timerPaused && <span className="text-[10px]">⏸</span>}
              </span>
            )}

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
              className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showInfo && (
        <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-200 text-xs font-bold text-amber-950 leading-relaxed">
          ℹ️ ആദ്യം മുകളിലെ 📖 പാഠം വായിച്ച് താഴത്തെ മഞ്ഞ <strong>“🔓 ഇവിടെ അമർത്തൂ — ക്വിസ് തുറക്കാം!”</strong> ബട്ടൺ അമർത്തുക. 18 സെക്കൻഡിനുള്ളിൽ ശരിയുത്തരം നൽകിയാൽ <strong>3 ക്രൗൺ സ്റ്റാറുകളും</strong> വെള്ളി നാണയങ്ങളും ലഭിക്കും. സംശയമുണ്ടെങ്കിൽ 4 KBC ലൈഫ്‌ലൈനുകൾ ഉപയോഗിക്കാം!
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
              /* LOCKED STATE — Geometric ArrowUp icon (strictly zero human figures) */
              <div className="p-4 sm:p-5 text-center space-y-3 bg-gradient-to-b from-amber-50/60 to-white">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-700 mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-extrabold text-slate-900">
                    ആദ്യം മുകളിലെ പാഠം തുറന്ന് പൂർത്തിയാക്കാം!
                  </p>
                  <p className="text-xs font-semibold text-slate-600 max-w-md mx-auto leading-relaxed">
                    പാഠം തുറന്ന് വായിച്ച ശേഷം താഴത്തെ മഞ്ഞ <strong>“🔓 ഇവിടെ അമർത്തൂ — ക്വിസ് തുറക്കാം!”</strong> ബട്ടൺ ഞെക്കിയാലുടൻ ഈ ക്വിസ് തുറക്കും.
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
                    className="inline-flex items-center"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </motion.span>
                  <BookOpen className="w-4 h-4" />
                  <span>പാഠം തുറക്കാം</span>
                </button>
              </div>
            ) : (
              /* UNLOCKED 4-OPTION KBC QUIZ */
              <div className="p-4 sm:p-5 space-y-3.5">
                {speedReplayActive && (
                  <div className="rounded-xl bg-amber-50 border border-amber-300 px-3 py-2 text-xs font-extrabold text-amber-950 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-600" />
                      സ്പീഡ് മാസ്റ്ററി റിപ്ലേ! 15 സെക്കൻഡിനുള്ളിൽ ശരിയുത്തരം നൽകൂ!
                    </span>
                  </div>
                )}

                <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                  {activeQuiz.question}
                </p>

                {/* 4 KBC LIFELINES BAR (Visible while unanswered) */}
                {!isAnswered && !speedReplayActive && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        disabled={eliminatedIndices.length > 0}
                        onClick={handleLifeline5050}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold transition-colors cursor-pointer ${
                          eliminatedIndices.length > 0
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-50 hover:bg-emerald-50 border-slate-300 text-slate-800'
                        }`}
                      >
                        <Scissors className="w-3.5 h-3.5 text-emerald-700" />
                        <span>50:50</span>
                        <span className="text-[10px] text-slate-500">
                          {ecoState.inventory.quizHint5050 > 0
                            ? `(${ecoState.inventory.quizHint5050} സൗജന്യം)`
                            : '(50 വെള്ളി)'}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={phoneFriendOpen}
                        onClick={handleLifelinePhoneFriend}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold transition-colors cursor-pointer ${
                          phoneFriendOpen
                            ? 'bg-sky-50 border-sky-300 text-sky-900'
                            : 'bg-slate-50 hover:bg-sky-50 border-slate-300 text-slate-800'
                        }`}
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-sky-700" />
                        <span>ഫോൺ-എ-ഫ്രണ്ട്</span>
                        <DiamondGemSvg className="w-3 h-3" />
                        <span className="text-[10px]">1</span>
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(pollResult)}
                        onClick={handleLifelineAudiencePoll}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold transition-colors cursor-pointer ${
                          pollResult
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-slate-50 hover:bg-amber-50 border-slate-300 text-slate-800'
                        }`}
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>പോൾ</span>
                        <SilverCoinSvg className="w-3 h-3" />
                        <span className="text-[10px]">40</span>
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(flippedQuestion)}
                        onClick={handleLifelineFlipQuestion}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold transition-colors cursor-pointer ${
                          flippedQuestion
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-50 hover:bg-indigo-50 border-slate-300 text-slate-800'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-700" />
                        <span>ചോദ്യം മാറ്റുക</span>
                        <DiamondGemSvg className="w-3 h-3" />
                        <span className="text-[10px]">1</span>
                      </button>

                      {ecoState.inventory.quizHintTime > 0 && timeBoostBonusSec === 0 && (
                        <button
                          type="button"
                          onClick={handleUseTimeBoost}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-extrabold text-emerald-900 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>+15s ബൂസ്റ്റ് ({ecoState.inventory.quizHintTime})</span>
                        </button>
                      )}
                    </div>

                    {lifelineNotice && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[11px] font-bold text-emerald-950 flex items-center justify-between gap-2">
                        <span>{lifelineNotice}</span>
                        {phoneFriendOpen && (
                          <a
                            href={phoneHelpShareHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[10px] font-black shrink-0"
                          >
                            WhatsApp ചോദിക്കാം
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 4 OPTIONS A/B/C/D */}
                <div className="grid gap-2">
                  {optionOrder.map((origIdx, displayIdx) => {
                    const opt = activeQuiz.options[origIdx];
                    const isEliminated = eliminatedIndices.includes(origIdx);
                    const isCorrectOption = origIdx === activeQuiz.correctIdx;
                    const isUserWrongPick = isWrongAnswered && savedAnswer?.selectedIdx === origIdx;
                    const pollPct = pollResult ? pollResult[origIdx] : undefined;

                    let cardClass =
                      'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-800 cursor-pointer';
                    let badgeEl: React.ReactNode = (
                      <span className="w-6 h-6 rounded-lg bg-emerald-900/10 text-emerald-950 font-black text-xs flex items-center justify-center shrink-0">
                        {OPTION_LETTERS[displayIdx] ?? displayIdx + 1}
                      </span>
                    );

                    if (isEliminated && !isAnswered) {
                      cardClass =
                        'bg-slate-100 border-slate-200 text-slate-400 line-through opacity-45 cursor-not-allowed';
                    } else if (isAnswered) {
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
                        key={`${lessonId}-${origIdx}`}
                        type="button"
                        disabled={isAnswered || lives <= 0 || isEliminated}
                        whileHover={!isAnswered && !isEliminated ? { scale: 1.01 } : {}}
                        whileTap={!isAnswered && !isEliminated ? { scale: 0.98 } : {}}
                        onClick={() => handleChoose(origIdx)}
                        className={`w-full text-left rounded-2xl border-2 px-3.5 py-3 transition-all space-y-1.5 ${cardClass}`}
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {badgeEl}
                            <span className="text-xs sm:text-sm font-bold leading-snug break-words">
                              {opt}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {typeof pollPct === 'number' && !isAnswered && (
                              <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-950 tabular-nums">
                                {pollPct}%
                              </span>
                            )}
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
                          </div>
                        </div>

                        {typeof pollPct === 'number' && !isAnswered && (
                          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              style={{ width: `${pollPct}%` }}
                              className="h-full bg-amber-500 rounded-full"
                            />
                          </div>
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

                {speedReplayMsg && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-extrabold text-amber-950">
                    {speedReplayMsg}
                  </div>
                )}

                {/* PASSED FEEDBACK + CROWN STARS + SPEED REPLAY + FREE ONE-SHOT BONUS */}
                {isPassed && (
                  <motion.div
                    ref={resultRef}
                    initial={{ opacity: 0, scale: 0.96, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="rounded-2xl p-3.5 border-2 border-emerald-300 bg-white text-emerald-950 space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs sm:text-sm font-extrabold text-emerald-800">
                          🎉 ശരിയുത്തരം! (+15 XP)
                        </p>
                        {coinRewardBanner && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-300 text-[11px] font-black text-amber-950">
                            <SilverCoinSvg className="w-3.5 h-3.5" />
                            <span>{coinRewardBanner}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {activeQuiz.explanation}
                      </p>
                    </div>

                    {/* FREE ONE-SHOT MASTERY BONUS QUESTION (Zero Deduction, +30 Gold + 1 Diamond!) */}
                    {!bonusAttempted && !bonusOpen && (
                      <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-emerald-950 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            🌟 വിജ്ഞാന വെല്ലുവിളി ചോദ്യം (സൗജന്യം!)
                          </p>
                          <p className="text-[11px] font-semibold text-slate-600">
                            ശരിയുത്തരത്തിന് +30 സ്വർണ്ണവും +1 വജ്രവും! തെറ്റിയാൽ ഒരു നഷ്ടവുമില്ല.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playPop();
                            setBonusOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer inline-flex items-center gap-1"
                        >
                          <GoldCoinSvg className="w-3.5 h-3.5" />
                          <span>ചോദ്യം കാണാം</span>
                        </button>
                      </div>
                    )}

                    {bonusOpen && !bonusResult && (
                      <div className="rounded-xl border-2 border-amber-300 bg-amber-50/70 p-3 space-y-2">
                        <p className="text-xs font-black text-amber-950">
                          🌟 ബോണസ് വെല്ലുവിളി (+30 സ്വർണ്ണം + 1 വജ്രം · നഷ്ടഭയമില്ല):
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {bonusChallenge.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {bonusChallenge.options.map((bOpt, bIdx) => (
                            <button
                              key={bIdx}
                              type="button"
                              onClick={() => handleAnswerBonusChallenge(bIdx)}
                              className="px-3 py-2 rounded-xl border border-amber-300 bg-white hover:bg-emerald-50 text-left text-xs font-bold text-slate-800 cursor-pointer"
                            >
                              {OPTION_LETTERS[bIdx]}. {bOpt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {bonusResult && (
                      <div
                        className={`rounded-xl border px-3 py-2 text-xs font-extrabold ${
                          bonusResult.won
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-amber-50 border-amber-300 text-amber-950'
                        }`}
                      >
                        {bonusResult.text}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {onNextLesson && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.unlockAudio();
                            sound.playPop();
                            onNextLesson();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold border-b-4 border-emerald-950 shadow-sm transition-transform active:scale-98 cursor-pointer"
                        >
                          <span>{finalNextLabel}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setSpeedReplayActive(true);
                          setSpeedReplayStartTs(Date.now());
                          setSpeedReplayMsg(null);
                          setOptionOrder(createShuffledOrder(activeQuiz.options.length));
                        }}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-extrabold cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>സ്പീഡ് മാസ്റ്ററി റിപ്ലേ (+വെള്ളി)</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* WRONG ANSWER */}
                {isWrongAnswered && (
                  <motion.div
                    ref={resultRef}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-3.5 border-2 border-amber-300 bg-white space-y-2.5 shadow-xs"
                  >
                    <p className="text-xs sm:text-sm font-extrabold text-amber-900">
                      💛 സാരമില്ല! ശരിയായ ഉത്തരം നോക്കാം ({lives}/{maxLives})
                    </p>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-2 space-y-1">
                      <p className="text-xs sm:text-sm font-extrabold text-emerald-900">
                        ✅ {correctOptionText}
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {activeQuiz.explanation}
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
                        className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold border-b-4 border-emerald-950 shadow-sm cursor-pointer"
                      >
                        <span>{finalNextLabel}</span>
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
  );
};
