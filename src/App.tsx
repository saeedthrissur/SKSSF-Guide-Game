import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  Gift,
  Link2,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { L1Tab, Level1Story } from './components/Level1Story';
import { L2GameTab, Level2Ecosystem } from './components/Level2Ecosystem';
import { L3Tab, Level3Organizer } from './components/Level3Organizer';
import { L4Tab, Level4Strategy } from './components/Level4Strategy';
import {
  StoryPrologueTheater,
  VisualStoryboardArena,
} from './components/StoryIntroAndBoard';
import { SkssfPovJourneyGame } from './components/SkssfPovJourneyGame';
import { AllLessonsMapPage } from './components/AllLessonsMapPage';
import { ShareableBadgeStudio } from './components/ShareableBadgeStudio';
import {
  AudioLoadingFloatBadge,
  EASTER_EGG_ITEMS,
  EasterEggItem,
  ScoreComparisonModal,
  SettingsModal,
  StoryNarrationStrip,
  SurpriseGiftChestModal,
  UnseenLessonBanner,
} from './components/GameEffects';
import {
  ALL_LESSONS,
  getAllUnseenLessons,
  getSkippedUnseenLessonsBefore,
  loadCompletedLessonIds,
  saveCompletedLessonIds,
} from './utils/lessonTracker';
import {
  archiveRunToHistory,
  clearAllAppStorage,
  clearSavedGameState,
  loadRunHistory,
  loadSavedGameState,
  QuizAnswerMap,
  RunHistoryEntry,
  saveGameState,
} from './utils/gameStorage';
import { sound } from './utils/sound';
import { narrator } from './utils/narrator';
import {
  GameLivesProvider,
  GameOverResetModal,
  HeaderHeartsBar,
  HeartBreakEvent,
  HeartBreakFlightOverlay,
} from './utils/gameLivesContext';
import {
  FloatingPageNavigator,
  LessonFlowProvider,
} from './utils/lessonFlowContext';
import { GuideGameAboutModal, GuideGameBrandLogo } from './components/GameLivesHud';
import { OfficialResourceHubModal } from './components/OfficialResourceHubModal';

type LevelNumber = 1 | 2 | 3 | 4;
type AppStage = 'prologue' | 'storyboard' | 'world' | 'pov';

const LEVEL_META: { id: LevelNumber; short: string; full: string; introSpeech: string }[] = [
  {
    id: 1,
    short: '⛵ 1. യൂണിറ്റ് തലം',
    full: 'ഘട്ടം 1 · യൂണിറ്റ് തലം — ചരിത്ര വേരുകളും ഔദ്യോഗിക പതാകകളും',
    introSpeech:
      'യൂണിറ്റ് തലത്തിലേക്ക് സ്വാഗതം! ചരിത്ര യാത്രയിലെ 5 വ്യത്യസ്ത ഗെയിമുകളിലൂടെ സമസ്തയുടെ പാരമ്പര്യവും ഔദ്യോഗിക പതാകകളും പഠിക്കാം!',
  },
  {
    id: 2,
    short: '🏛️ 2. ക്ലസ്റ്റർ & മേഖല',
    full: 'ഘട്ടം 2 · ക്ലസ്റ്റർ & മേഖലാ തലം — യൂണിറ്റ്–കമ്മിറ്റി രൂപീകരണവും 17 വിങ്ങുകളും',
    introSpeech:
      'ക്ലസ്റ്റർ, മേഖലാ തലത്തിലേക്ക് സ്വാഗതം! ഇവിടെ യൂണിറ്റ് എങ്ങനെ കൊണ്ടുനടക്കണം, കമ്മിറ്റിയിലെ സ്ഥാനങ്ങൾ എന്തെല്ലാം, 17 വിങ്ങുകളുടെ ദൗത്യങ്ങൾ എന്തെല്ലാം എന്ന് പരിചയപ്പെടാം!',
  },
  {
    id: 3,
    short: '🎈 3. ജില്ലാ തലം',
    full: 'ഘട്ടം 3 · ജില്ലാ തലം — ആദർശ കവചം, ജ്ഞാനച്ചുരുൾ, ഓഫീസ് ഡെസ്ക് & ന്യൂസ്‌റൂം',
    introSpeech:
      'ജില്ലാ തലത്തിലേക്ക് സ്വാഗതം! നല്ല ഗുണങ്ങൾ പിടിച്ചെടുക്കാം, ഒരു യൂണിറ്റ് ഓഫീസ് ഡെസ്കിലെ ഉത്തരവാദിത്തങ്ങളും ന്യൂസ്‌റൂം കലയും പഠിക്കാം!',
  },
  {
    id: 4,
    short: '🦒 4. സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    full: 'ഘട്ടം 4 · സ്റ്റേറ്റ് & ഗ്ലോബൽ തലം — ശാഖ മുതൽ SIC വരെ, സൈബർ ഷീൽഡ് & സാക്ഷ്യപത്രം',
    introSpeech:
      'സ്റ്റേറ്റ് & ഗ്ലോബൽ തലത്തിലേക്ക് സ്വാഗതം! ശാഖ മുതൽ ഗ്ലോബൽ വരെയുള്ള ഘടന കയറി നിങ്ങളുടെ പേരിലുള്ള SKSSF ഗൈഡ് സാക്ഷ്യപത്രം സ്വന്തമാക്കൂ!',
  },
];

function getInitialTabForLesson<T extends string>(
  lessonId: string | undefined,
  stage: AppStage,
  level?: LevelNumber
): T | undefined {
  if (!lessonId) return undefined;
  const match = ALL_LESSONS.find((l) => l.id === lessonId);
  if (!match || match.stage !== stage) return undefined;
  if (level && match.level !== level) return undefined;
  return match.tab as T | undefined;
}

export default function App() {
  const [savedInit] = useState(() => loadSavedGameState());

  const [stage, setStage] = useState<AppStage>(() => savedInit?.stage ?? 'prologue');
  const [currentLevel, setCurrentLevel] = useState<LevelNumber>(
    () => savedInit?.currentLevel ?? 1
  );
  const [unlockedLevels, setUnlockedLevels] = useState<LevelNumber[]>(() =>
    savedInit?.unlockedLevels?.length
      ? (savedInit.unlockedLevels.filter((n) => n >= 1 && n <= 4) as LevelNumber[])
      : [1]
  );
  const [completedLevels, setCompletedLevels] = useState<LevelNumber[]>(() =>
    savedInit?.completedLevels?.length
      ? (savedInit.completedLevels.filter((n) => n >= 1 && n <= 4) as LevelNumber[])
      : []
  );
  const [xp, setXp] = useState<number>(() => savedInit?.xp ?? 0);
  const [awardedActions, setAwardedActions] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    savedInit?.awardedActions?.forEach((k) => {
      map[k] = true;
    });
    return map;
  });
  const [badges, setBadges] = useState<string[]>(() => savedInit?.badges ?? []);
  const [muted, setMuted] = useState<boolean>(() => sound.getSnapshot().muted);
  const [ambiencePlaying, setAmbiencePlaying] = useState<boolean>(
    () => sound.getSnapshot().ambiencePlaying
  );
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [scoreModalOpen, setScoreModalOpen] = useState<boolean>(false);
  const [badgeStudioOpen, setBadgeStudioOpen] = useState<boolean>(false);
  const [badgeStudioPreset, setBadgeStudioPreset] = useState<string>('starter_member');
  const [collectedEggs, setCollectedEggs] = useState<string[]>(
    () => savedInit?.collectedEggs ?? []
  );
  const [giftChestOpen, setGiftChestOpen] = useState<boolean>(false);
  const [celebrationEgg, setCelebrationEgg] = useState<EasterEggItem | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswerMap>(
    () => savedInit?.quizAnswers ?? {}
  );
  const [lives, setLives] = useState<number>(() =>
    typeof savedInit?.lives === 'number' ? Math.max(0, Math.min(3, savedInit.lives)) : 3
  );
  const [heartBreakEvent, setHeartBreakEvent] = useState<HeartBreakEvent | null>(null);
  const [activeFlightEvent, setActiveFlightEvent] = useState<HeartBreakEvent | null>(null);
  const [gameOverOpen, setGameOverOpen] = useState<boolean>(() =>
    typeof savedInit?.lives === 'number' ? savedInit.lives <= 0 : false
  );
  const [runNumber, setRunNumber] = useState<number>(() => savedInit?.runNumber ?? 1);
  const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>(() => loadRunHistory());
  const [attemptKey, setAttemptKey] = useState<number>(0);
  const [showResumeToast, setShowResumeToast] = useState<boolean>(() =>
    Boolean(
      savedInit &&
        (savedInit.xp > 0 ||
          savedInit.completedLessonIds.length > 0 ||
          Object.keys(savedInit.quizAnswers || {}).length > 0)
    )
  );

  const [devUnlocked, setDevUnlocked] = useState<boolean>(false);
  const [lessonsMapOpen, setLessonsMapOpen] = useState<boolean>(false);
  const [resourceHubOpen, setResourceHubOpen] = useState<boolean>(false);

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() =>
    savedInit?.completedLessonIds?.length ? savedInit.completedLessonIds : loadCompletedLessonIds()
  );
  const [activeLessonId, setActiveLessonId] = useState<string>(
    () => savedInit?.activeLessonId ?? 'prologue_curiosity'
  );
  const [prologueInitialLessonId, setPrologueInitialLessonId] = useState<string | undefined>(() =>
    savedInit?.stage === 'prologue' ? savedInit?.activeLessonId : undefined
  );
  const [storyboardInitialTab, setStoryboardInitialTab] = useState<string | undefined>(() =>
    getInitialTabForLesson<string>(savedInit?.activeLessonId, 'storyboard')
  );
  const [povInitialTab, setPovInitialTab] = useState<string | undefined>(() =>
    getInitialTabForLesson<string>(savedInit?.activeLessonId, 'pov')
  );
  const [l1InitialTab, setL1InitialTab] = useState<L1Tab | undefined>(() =>
    getInitialTabForLesson<L1Tab>(savedInit?.activeLessonId, 'world', 1)
  );
  const [l2InitialTab, setL2InitialTab] = useState<L2GameTab | undefined>(() =>
    getInitialTabForLesson<L2GameTab>(savedInit?.activeLessonId, 'world', 2)
  );
  const [l3InitialTab, setL3InitialTab] = useState<L3Tab | undefined>(() =>
    getInitialTabForLesson<L3Tab>(savedInit?.activeLessonId, 'world', 3)
  );
  const [l4InitialTab, setL4InitialTab] = useState<L4Tab | undefined>(() =>
    getInitialTabForLesson<L4Tab>(savedInit?.activeLessonId, 'world', 4)
  );

  // Sync completed lessons to legacy key & auto-save full progress to browser localStorage
  useEffect(() => {
    saveCompletedLessonIds(completedLessonIds);
  }, [completedLessonIds]);

  useEffect(() => {
    saveGameState({
      version: 2,
      stage,
      currentLevel,
      activeLessonId,
      xp,
      awardedActions: Object.keys(awardedActions).filter((k) => awardedActions[k]),
      badges,
      unlockedLevels,
      completedLevels,
      completedLessonIds,
      collectedEggs,
      quizAnswers,
      lives,
      runNumber,
      savedAt: Date.now(),
    });
  }, [
    stage,
    currentLevel,
    activeLessonId,
    xp,
    awardedActions,
    badges,
    unlockedLevels,
    completedLevels,
    completedLessonIds,
    collectedEggs,
    quizAnswers,
    lives,
    runNumber,
  ]);

  const handleMarkLessonCompleted = useCallback((lessonId: string) => {
    setCompletedLessonIds((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
  }, []);

  const skippedUnseenBefore = useMemo(
    () => getSkippedUnseenLessonsBefore(activeLessonId, completedLessonIds),
    [activeLessonId, completedLessonIds]
  );

  const allUnseenLessons = useMemo(
    () => getAllUnseenLessons(completedLessonIds),
    [completedLessonIds]
  );

  const quizStats = useMemo(() => {
    const entries = Object.values(quizAnswers);
    return {
      answered: entries.length,
      correct: entries.filter((e) => e.isCorrect).length,
    };
  }, [quizAnswers]);

  const storyboardUnlocked =
    devUnlocked ||
    stage === 'storyboard' ||
    stage === 'pov' ||
    stage === 'world' ||
    completedLessonIds.includes('prologue_story') ||
    completedLessonIds.includes('storyboard') ||
    completedLessonIds.includes('pov_journey') ||
    unlockedLevels.length > 1;

  const povUnlocked =
    devUnlocked ||
    stage === 'pov' ||
    stage === 'world' ||
    completedLessonIds.includes('storyboard') ||
    completedLessonIds.includes('pov_journey') ||
    completedLevels.length > 0 ||
    unlockedLevels.length > 1;

  const world1Unlocked =
    devUnlocked ||
    stage === 'world' ||
    completedLessonIds.includes('pov_journey') ||
    completedLevels.length > 0 ||
    unlockedLevels.length > 1;

  const handleJumpToLesson = useCallback((lessonId: string) => {
    const target = ALL_LESSONS.find((l) => l.id === lessonId);
    if (!target) return;
    sound.unlockAudio();
    sound.playClick();
    if (target.stage === 'prologue') {
      setPrologueInitialLessonId(target.id);
      setStage('prologue');
    } else if (target.stage === 'storyboard') {
      setStoryboardInitialTab(target.tab);
      setStage('storyboard');
    } else if (target.stage === 'pov') {
      setPovInitialTab(target.tab ?? target.id);
      setStage('pov');
    } else if (target.stage === 'world' && target.level) {
      const lvl = target.level;
      setUnlockedLevels((prev) => (prev.includes(lvl) ? prev : [...prev, lvl]));
      if (lvl === 1 && target.tab) setL1InitialTab(target.tab as L1Tab);
      if (lvl === 2 && target.tab) setL2InitialTab(target.tab as L2GameTab);
      if (lvl === 3 && target.tab) setL3InitialTab(target.tab as L3Tab);
      if (lvl === 4 && target.tab) setL4InitialTab(target.tab as L4Tab);
      setStage('world');
      setCurrentLevel(lvl);
    }
    setActiveLessonId(target.id);
    setLessonsMapOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const currentRank = useMemo(() => {
    if (xp >= 550 || completedLevels.includes(4)) return '🏆 SKSSF ഗൈഡ് താരം';
    if (xp >= 340 || completedLevels.includes(3)) return '🛡️ നല്ല പ്രവർത്തകൻ';
    if (xp >= 150 || completedLevels.includes(2)) return '🧭 സജീവ കൂട്ടുകാരൻ';
    return '🌱 പുതിയ കൂട്ടുകാരൻ';
  }, [xp, completedLevels]);

  const handleAwardXp = useCallback((amount: number, actionId: string) => {
    setAwardedActions((prev) => {
      if (prev[actionId]) return prev;
      setXp((curr) => curr + amount);
      return { ...prev, [actionId]: true };
    });
  }, []);

  const handleQuizAnswered = useCallback(
    (lessonId: string, selectedIdx: number, isCorrect: boolean) => {
      setQuizAnswers((prev) => {
        if (prev[lessonId]) return prev;
        return {
          ...prev,
          [lessonId]: {
            selectedIdx,
            isCorrect,
            answeredAt: Date.now(),
          },
        };
      });

      if (isCorrect) {
        handleAwardXp(15, `quiz_${lessonId}`);
      } else {
        // Deduct 1 global heart, play dramatic heartbreak-to-header flight animation!
        // On 3rd mistake (lives === 0), reset ALL lessons back to Lesson 1 from the beginning!
        setLives((prevLives) => {
          const nextLives = Math.max(0, prevLives - 1);
          const ev: HeartBreakEvent = {
            id: Date.now(),
            brokenIndex: nextLives, // 2 -> 1 -> 0 (rightmost intact heart breaks first!)
            remaining: nextLives,
          };
          setHeartBreakEvent(ev);
          setActiveFlightEvent(ev);
          if (nextLives <= 0) {
            window.setTimeout(() => {
              setGameOverOpen(true);
            }, 1450);
          }
          return nextLives;
        });
      }
    },
    [handleAwardXp]
  );

  const handleUnlockBadge = (badge: string) => {
    setBadges((prev) => (prev.includes(badge) ? prev : [...prev, badge]));
  };

  const handleClaimEasterEgg = (egg: EasterEggItem) => {
    sound.unlockAudio();
    sound.playUnlock();
    if (!collectedEggs.includes(egg.id)) {
      setCollectedEggs((prev) => [...prev, egg.id]);
      handleAwardXp(25, `easter_${egg.id}`);
      handleUnlockBadge(egg.badge);
    }
    setCelebrationEgg(egg);
    setGiftChestOpen(true);
    narrator.speak(egg.speech, `${egg.emoji} ${egg.title}`);
  };

  const handleCompleteLevel = (level: LevelNumber) => {
    setCompletedLevels((prev) => (prev.includes(level) ? prev : [...prev, level]));
    if (level < 4) {
      const next = (level + 1) as LevelNumber;
      setUnlockedLevels((prev) => (prev.includes(next) ? prev : [...prev, next]));
      setStage('world');
      setCurrentLevel(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSwitchLevel = (lvlId: LevelNumber) => {
    if (!devUnlocked && lvlId === 1 && !world1Unlocked) return;
    if (!devUnlocked && lvlId > 1 && !unlockedLevels.includes(lvlId)) return;
    sound.unlockAudio();
    sound.playClick();
    setLessonsMapOpen(false);
    setStage('world');
    setCurrentLevel(lvlId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartNewAttempt = () => {
    const highestLevel = Math.max(1, ...unlockedLevels);
    const updatedHistory = archiveRunToHistory({
      runNumber,
      finishedAt: Date.now(),
      xp,
      completedLessons: completedLessonIds.length,
      totalLessons: ALL_LESSONS.length,
      quizzesAnswered: quizStats.answered,
      quizzesCorrect: quizStats.correct,
      badgesCount: badges.length,
      eggsCount: collectedEggs.length,
      highestLevel,
      reachedCertificate: completedLevels.includes(4),
    });
    setRunHistory(updatedHistory);
    clearSavedGameState();
    saveCompletedLessonIds([]);

    const nextRun = runNumber + 1;
    setRunNumber(nextRun);
    setStage('prologue');
    setCurrentLevel(1);
    setUnlockedLevels([1]);
    setCompletedLevels([]);
    setXp(0);
    setAwardedActions({});
    setBadges([]);
    setCollectedEggs([]);
    setCompletedLessonIds([]);
    setQuizAnswers({});
    setLives(3);
    setHeartBreakEvent(null);
    setActiveFlightEvent(null);
    setGameOverOpen(false);
    setActiveLessonId('prologue_curiosity');
    setPrologueInitialLessonId('prologue_curiosity');
    setStoryboardInitialTab(undefined);
    setPovInitialTab(undefined);
    setL1InitialTab(undefined);
    setL2InitialTab(undefined);
    setL3InitialTab(undefined);
    setL4InitialTab(undefined);
    setLessonsMapOpen(false);
    setShowResumeToast(false);
    setAttemptKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetCurrentGame = () => {
    clearSavedGameState();
    saveCompletedLessonIds([]);
    setStage('prologue');
    setCurrentLevel(1);
    setUnlockedLevels([1]);
    setCompletedLevels([]);
    setXp(0);
    setAwardedActions({});
    setBadges([]);
    setCollectedEggs([]);
    setCompletedLessonIds([]);
    setQuizAnswers({});
    setLives(3);
    setHeartBreakEvent(null);
    setActiveFlightEvent(null);
    setGameOverOpen(false);
    setActiveLessonId('prologue_curiosity');
    setPrologueInitialLessonId('prologue_curiosity');
    setStoryboardInitialTab(undefined);
    setPovInitialTab(undefined);
    setL1InitialTab(undefined);
    setL2InitialTab(undefined);
    setL3InitialTab(undefined);
    setL4InitialTab(undefined);
    setLessonsMapOpen(false);
    setShowResumeToast(false);
    setAttemptKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAllSavedData = async () => {
    clearAllAppStorage();
    sound.resetToDefaults();
    await narrator.clearVoiceCache();
    setRunHistory([]);
    setRunNumber(1);
    setStage('prologue');
    setCurrentLevel(1);
    setUnlockedLevels([1]);
    setCompletedLevels([]);
    setXp(0);
    setAwardedActions({});
    setBadges([]);
    setCollectedEggs([]);
    setCompletedLessonIds([]);
    setQuizAnswers({});
    setLives(3);
    setHeartBreakEvent(null);
    setActiveFlightEvent(null);
    setGameOverOpen(false);
    setActiveLessonId('prologue_curiosity');
    setPrologueInitialLessonId('prologue_curiosity');
    setStoryboardInitialTab(undefined);
    setPovInitialTab(undefined);
    setL1InitialTab(undefined);
    setL2InitialTab(undefined);
    setL3InitialTab(undefined);
    setL4InitialTab(undefined);
    setLessonsMapOpen(false);
    setShowResumeToast(false);
    setAttemptKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    return sound.subscribe((snap) => {
      setMuted(snap.muted);
      setAmbiencePlaying(snap.ambiencePlaying);
    });
  }, []);

  useEffect(() => {
    if (stage === 'prologue' || (stage === 'world' && currentLevel === 1)) {
      sound.setAmbienceScene('harbor');
    } else if (stage === 'world' && currentLevel === 2) {
      sound.setAmbienceScene('conference');
    } else if (stage === 'world' && currentLevel === 3) {
      sound.setAmbienceScene('study');
    } else {
      sound.setAmbienceScene('heritage');
    }
  }, [stage, currentLevel]);

  const handleStartAdventure = () => {
    sound.unlockAudio();
    sound.playShipCreak();
    setStage('world');
    setCurrentLevel(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStoryboard = () => {
    sound.unlockAudio();
    setStage('storyboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSound = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    sound.setMuted(nextMuted);
    if (nextMuted) {
      setAmbiencePlaying(false);
      narrator.stop();
    } else {
      sound.unlockAudio();
      sound.playClick();
    }
  };

  const toggleAmbience = () => {
    if (muted) {
      setMuted(false);
      sound.setMuted(false);
    }
    sound.unlockAudio();
    const playing = sound.toggleAmbience();
    setAmbiencePlaying(playing);
  };

  const [touchedNavLabel, setTouchedNavLabel] = useState<string | null>(null);

  const quizDoneMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    Object.keys(quizAnswers).forEach((k) => {
      if (quizAnswers[k]) map[k] = true;
    });
    return map;
  }, [quizAnswers]);

  // Automatically scroll to the top whenever the user moves to a different lesson or stage
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeLessonId, stage, currentLevel]);

  return (
    <GameLivesProvider lives={lives} maxLives={3} lastBreakEvent={heartBreakEvent}>
    <LessonFlowProvider
      activeLessonId={activeLessonId}
      quizDoneLessons={quizDoneMap}
      devUnlocked={devUnlocked}
      onOpenAllLessons={() => {
        setLessonsMapOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Slim Sticky Top Bar — Single Settings Icon Only + Icon-First Status */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              sound.playClick();
              setAboutModalOpen(true);
            }}
            aria-label="ഗൈഡ് ഗെയിം — ഹോം & വിവരണം"
            title="ഗൈഡ് ഗെയിം (Guide Game)"
            className="inline-flex items-center gap-2 text-left shrink-0 rounded-xl hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
          >
            <GuideGameBrandLogo size="sm" />
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* ALWAYS-VISIBLE TOP 3 HEARTS (❤️ ❤️ ❤️) */}
            <HeaderHeartsBar />

            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playClick();
                setScoreModalOpen(true);
              }}
              aria-label="സ്കോർ & പുരോഗതി റിപ്പോർട്ട്"
              title="സ്കോർ"
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-sky-300 bg-sky-50 text-sky-950 text-[11px] sm:text-xs font-extrabold hover:bg-sky-100 tabular-nums whitespace-nowrap"
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-700 shrink-0" />
              <span>{xp}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playPop();
                setBadgeStudioPreset('starter_member');
                setBadgeStudioOpen(true);
              }}
              aria-label="എന്റെ ഫോട്ടോ ബാഡ്ജ്"
              title="ബാഡ്ജ്"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-amber-400 bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-xs"
            >
              <Award className="w-4 h-4 shrink-0" />
            </button>

            {/* Surprise Gift Badge: ONLY shown after the user discovers at least 1 gift! */}
            {collectedEggs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  sound.unlockAudio();
                  sound.playClick();
                  setCelebrationEgg(null);
                  setGiftChestOpen(true);
                }}
                aria-label="കണ്ടെത്തിയ സർപ്രൈസ് സമ്മാനങ്ങൾ"
                title="സമ്മാനങ്ങൾ"
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 text-xs font-extrabold hover:bg-amber-100 tabular-nums whitespace-nowrap"
              >
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>{collectedEggs.length}</span>
              </button>
            )}

            {/* OFFICIAL LINKS & PDF STUDY LIBRARY BUTTON */}
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playClick();
                setResourceHubOpen(true);
              }}
              aria-label="ഔദ്യോഗിക ലിങ്കുകളും PDF ഗൈഡുകളും"
              title="ഔദ്യോഗിക ലിങ്കുകളും PDF ഗൈഡുകളും"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100 cursor-pointer"
            >
              <Link2 className="w-4 h-4" />
            </button>

            {/* SINGLE SETTINGS BUTTON AT THE TOP */}
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playClick();
                setSettingsOpen(true);
              }}
              aria-label="സെറ്റിംഗ്സ്"
              title="സെറ്റിംഗ്സ്"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? 'ശബ്ദം ഓൺ ചെയ്യുക' : 'ശബ്ദം മ്യൂട്ട് ചെയ്യുക'}
              title={muted ? 'ശബ്ദം ഓൺ' : 'മ്യൂട്ട്'}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Non-blocking Floating Top-Right Audio Loader */}
      <AudioLoadingFloatBadge />

      {/* Main Game Workspace — GAME STARTS IMMEDIATELY AT TOP! */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-5">
        {showResumeToast && (
          <div className="mb-2.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 flex items-center justify-between gap-2 text-xs font-bold text-emerald-950">
            <span className="tabular-nums">
              💾 #{runNumber} · {xp} XP · {completedLessonIds.length}/{ALL_LESSONS.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setScoreModalOpen(true)}
                aria-label="സ്കോർ കാണാം"
                className="px-2 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 font-extrabold"
              >
                📊
              </button>
              <button
                type="button"
                onClick={() => setShowResumeToast(false)}
                aria-label="അടയ്ക്കുക"
                className="px-2 py-1 rounded-lg text-emerald-700 hover:bg-emerald-100 font-extrabold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {lessonsMapOpen ? (
          <AllLessonsMapPage
            activeLessonId={activeLessonId}
            completedLessonIds={completedLessonIds}
            devUnlocked={devUnlocked}
            onSetDevUnlocked={setDevUnlocked}
            onSelectLesson={handleJumpToLesson}
            onClose={() => setLessonsMapOpen(false)}
          />
        ) : (
          <>
            <UnseenLessonBanner
              unseenLessons={skippedUnseenBefore}
              onJumpToLesson={handleJumpToLesson}
            />

            {stage === 'prologue' && (
              <StoryPrologueTheater
                key={`prologue_${attemptKey}`}
                xp={xp}
                badgesCount={badges.length}
                onStartAdventure={handleStartAdventure}
                onOpenStoryboard={handleOpenStoryboard}
                onOpenBadgeStudio={(presetId) => {
                  setBadgeStudioPreset(presetId);
                  setBadgeStudioOpen(true);
                }}
                onAwardXp={handleAwardXp}
                awardedActions={awardedActions}
                collectedEggs={collectedEggs}
                onClaimEasterEgg={handleClaimEasterEgg}
                initialLessonId={prologueInitialLessonId}
                devUnlocked={devUnlocked}
                onActiveLessonChange={setActiveLessonId}
                onMarkLessonCompleted={handleMarkLessonCompleted}
                completedLessonIds={completedLessonIds}
                quizAnswers={quizAnswers}
                onQuizAnswered={handleQuizAnswered}
              />
            )}

            {stage === 'pov' && (
              <SkssfPovJourneyGame
                key={`pov_${attemptKey}`}
                initialTab={povInitialTab}
                devUnlocked={devUnlocked}
                onAwardXp={handleAwardXp}
                awardedActions={awardedActions}
                completedLessonIds={completedLessonIds}
                onUnlockBadge={handleUnlockBadge}
                onOpenBadgeStudio={(presetId) => {
                  setBadgeStudioPreset(presetId);
                  setBadgeStudioOpen(true);
                }}
                onActiveLessonChange={setActiveLessonId}
                onMarkLessonCompleted={handleMarkLessonCompleted}
                quizAnswers={quizAnswers}
                onQuizAnswered={handleQuizAnswered}
                onCompletePovStage={() => {
                  handleMarkLessonCompleted('pov_journey');
                  handleStartAdventure();
                }}
              />
            )}

            {stage === 'storyboard' && (
              <VisualStoryboardArena
                key={`storyboard_${attemptKey}`}
                initialTab={storyboardInitialTab}
                devUnlocked={devUnlocked}
                onAwardXp={handleAwardXp}
                onUnlockBadge={handleUnlockBadge}
                onGoToMission1={() => {
                  handleMarkLessonCompleted('storyboard');
                  setStage('pov');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                collectedEggs={collectedEggs}
                onClaimEasterEgg={handleClaimEasterEgg}
                onActiveLessonChange={setActiveLessonId}
                onMarkLessonCompleted={handleMarkLessonCompleted}
                completedLessonIds={completedLessonIds}
                quizAnswers={quizAnswers}
                onQuizAnswered={handleQuizAnswered}
              />
            )}

            {stage === 'world' && (
              <>
                {currentLevel === 1 && (
                  <Level1Story
                    key={`l1_${attemptKey}`}
                    isCompleted={completedLevels.includes(1)}
                    onAwardXp={handleAwardXp}
                    onUnlockBadge={handleUnlockBadge}
                    onCompleteLevel={() => handleCompleteLevel(1)}
                    collectedEggs={collectedEggs}
                    onClaimEasterEgg={handleClaimEasterEgg}
                    initialTab={l1InitialTab}
                    devUnlocked={devUnlocked}
                    onActiveLessonChange={setActiveLessonId}
                    onMarkLessonCompleted={handleMarkLessonCompleted}
                    completedLessonIds={completedLessonIds}
                    quizAnswers={quizAnswers}
                    onQuizAnswered={handleQuizAnswered}
                  />
                )}

                {currentLevel === 2 && (
                  <Level2Ecosystem
                    key={`l2_${attemptKey}`}
                    isCompleted={completedLevels.includes(2)}
                    onAwardXp={handleAwardXp}
                    onUnlockBadge={handleUnlockBadge}
                    onCompleteLevel={() => handleCompleteLevel(2)}
                    collectedEggs={collectedEggs}
                    onClaimEasterEgg={handleClaimEasterEgg}
                    initialTab={l2InitialTab}
                    devUnlocked={devUnlocked}
                    onActiveLessonChange={setActiveLessonId}
                    onMarkLessonCompleted={handleMarkLessonCompleted}
                    completedLessonIds={completedLessonIds}
                    quizAnswers={quizAnswers}
                    onQuizAnswered={handleQuizAnswered}
                    onOpenBadgeStudio={(presetId) => {
                      setBadgeStudioPreset(presetId);
                      setBadgeStudioOpen(true);
                    }}
                  />
                )}

                {currentLevel === 3 && (
                  <Level3Organizer
                    key={`l3_${attemptKey}`}
                    isCompleted={completedLevels.includes(3)}
                    onAwardXp={handleAwardXp}
                    onUnlockBadge={handleUnlockBadge}
                    onCompleteLevel={() => handleCompleteLevel(3)}
                    collectedEggs={collectedEggs}
                    onClaimEasterEgg={handleClaimEasterEgg}
                    initialTab={l3InitialTab}
                    devUnlocked={devUnlocked}
                    onActiveLessonChange={setActiveLessonId}
                    onMarkLessonCompleted={handleMarkLessonCompleted}
                    completedLessonIds={completedLessonIds}
                    quizAnswers={quizAnswers}
                    onQuizAnswered={handleQuizAnswered}
                  />
                )}

                {currentLevel === 4 && (
                  <Level4Strategy
                    key={`l4_${attemptKey}`}
                    xp={xp}
                    rank={currentRank}
                    badges={badges}
                    isCompleted={completedLevels.includes(4)}
                    onAwardXp={handleAwardXp}
                    onUnlockBadge={handleUnlockBadge}
                    onCompleteLevel={() => handleCompleteLevel(4)}
                    collectedEggs={collectedEggs}
                    onClaimEasterEgg={handleClaimEasterEgg}
                    initialTab={l4InitialTab}
                    devUnlocked={devUnlocked}
                    unseenLessons={allUnseenLessons}
                    onJumpToLesson={handleJumpToLesson}
                    onActiveLessonChange={setActiveLessonId}
                    onMarkLessonCompleted={handleMarkLessonCompleted}
                    completedLessonIds={completedLessonIds}
                    quizAnswers={quizAnswers}
                    onQuizAnswered={handleQuizAnswered}
                    onOpenBadgeStudio={(presetId) => {
                      setBadgeStudioPreset(presetId);
                      setBadgeStudioOpen(true);
                    }}
                  />
                )}
              </>
            )}

            {/* Narration Bar (Default Collapsed, No Duplicate Settings!) — Below Game */}
            <StoryNarrationStrip
              ambiencePlaying={ambiencePlaying}
              ambienceLabel={sound.getSceneLabel()}
              onToggleAmbience={toggleAmbience}
            />

            {/* NAVIGATION MAP & ALL-LESSONS OVERVIEW TRIGGER STRICTLY BELOW THE GAME & LESSON */}
            <nav
              aria-label="സംഘടനാ ഘട്ടങ്ങൾ"
              className="mt-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xs space-y-2"
            >
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                    setLessonsMapOpen(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  aria-label="എല്ലാ പാഠങ്ങളുടെയും പട്ടിക കാണാം"
                  className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-xs sm:text-sm font-extrabold shadow-xs transition-all tabular-nums"
                >
                  <span>🗺️</span>
                  <span>
                    പാഠങ്ങൾ ({completedLessonIds.filter((id) => ALL_LESSONS.some((l) => l.id === id)).length}/{ALL_LESSONS.length})
                  </span>
                </button>

                {(storyboardUnlocked || povUnlocked || world1Unlocked) && (
                  <>
                    <button
                      type="button"
                      aria-label="ആമുഖം"
                      title="ആമുഖം"
                      onClick={() => {
                        sound.unlockAudio();
                        sound.playClick();
                        setTouchedNavLabel('🚐 ആമുഖം');
                        setStage('prologue');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                        stage === 'prologue'
                          ? 'bg-emerald-700 text-white shadow-sm scale-105'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      <Compass className="w-5 h-5" />
                    </button>

                    {storyboardUnlocked && (
                      <button
                        type="button"
                        aria-label="സാഹചര്യങ്ങൾ"
                        title="സാഹചര്യങ്ങൾ"
                        onClick={() => {
                          sound.unlockAudio();
                          sound.playClick();
                          setTouchedNavLabel('📖 സാഹചര്യ ബോർഡ്');
                          setStage('storyboard');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all relative ${
                          stage === 'storyboard'
                            ? 'bg-amber-400 text-slate-950 shadow-sm scale-105'
                            : 'bg-slate-100 text-slate-700 hover:bg-amber-50'
                        }`}
                      >
                        <BookOpen className="w-5 h-5" />
                        {completedLessonIds.includes('storyboard') && stage !== 'storyboard' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 absolute -top-1 -right-1 bg-white rounded-full" />
                        )}
                      </button>
                    )}

                    {povUnlocked && (
                      <button
                        type="button"
                        aria-label="POV യാത്ര"
                        title="POV യാത്ര"
                        onClick={() => {
                          sound.unlockAudio();
                          sound.playClick();
                          setTouchedNavLabel('🧭 POV യാത്ര');
                          setStage('pov');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all relative ${
                          stage === 'pov'
                            ? 'bg-emerald-700 text-white shadow-sm scale-105'
                            : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                        }`}
                      >
                        <span>🧭</span>
                        {completedLessonIds.includes('pov_journey') && stage !== 'pov' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 absolute -top-1 -right-1 bg-white rounded-full" />
                        )}
                      </button>
                    )}

                    {LEVEL_META.map((lvl) => {
                      const unlocked =
                        devUnlocked || (lvl.id === 1 ? world1Unlocked : unlockedLevels.includes(lvl.id));
                      if (!unlocked) return null;
                      const completed = completedLevels.includes(lvl.id);
                      const active = stage === 'world' && currentLevel === lvl.id;
                      const lvlEmoji = lvl.id === 1 ? '⛵' : lvl.id === 2 ? '🏛️' : lvl.id === 3 ? '🎈' : '🦒';
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          aria-label={lvl.full}
                          title={lvl.short}
                          onClick={() => {
                            setTouchedNavLabel(lvl.short);
                            handleSwitchLevel(lvl.id);
                          }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all relative ${
                            active
                              ? 'bg-emerald-700 text-white shadow-sm scale-105'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
                          }`}
                        >
                          <span>{lvlEmoji}</span>
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 text-amber-300 text-[9px] font-extrabold flex items-center justify-center">
                            {lvl.id}
                          </span>
                          {completed && !active && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 absolute -top-1 -right-1 bg-white rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>

              {touchedNavLabel && (
                <div className="flex items-center justify-between gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-950">
                  <span>{touchedNavLabel}</span>
                  <button
                    type="button"
                    onClick={() => setTouchedNavLabel(null)}
                    className="text-emerald-700 px-1"
                    aria-label="അടയ്ക്കുക"
                  >
                    ✕
                  </button>
                </div>
              )}
            </nav>
          </>
        )}
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onResetProgress={handleResetCurrentGame}
        onClearAllData={handleClearAllSavedData}
      />
      <ScoreComparisonModal
        isOpen={scoreModalOpen}
        onClose={() => setScoreModalOpen(false)}
        runNumber={runNumber}
        xp={xp}
        rank={currentRank}
        completedLessonsCount={completedLessonIds.length}
        totalLessonsCount={ALL_LESSONS.length}
        quizzesAnswered={quizStats.answered}
        quizzesCorrect={quizStats.correct}
        badgesCount={badges.length}
        eggsCount={collectedEggs.length}
        runHistory={runHistory}
        onStartNewAttempt={handleStartNewAttempt}
      />
      <ShareableBadgeStudio
        isOpen={badgeStudioOpen}
        onClose={() => setBadgeStudioOpen(false)}
        xp={xp}
        rank={currentRank}
        initialBadgeId={badgeStudioPreset}
        completedLessonIds={completedLessonIds}
        completedLevels={completedLevels}
        awardedActions={awardedActions}
      />
      <SurpriseGiftChestModal
        isOpen={giftChestOpen}
        onClose={() => setGiftChestOpen(false)}
        collectedEggIds={collectedEggs}
        activeCelebrationEgg={celebrationEgg}
      />

      {/* DRAMATIC CENTER-TO-HEADER HEART-BREAK FLIGHT ANIMATION */}
      <HeartBreakFlightOverlay
        event={activeFlightEvent}
        onComplete={() => setActiveFlightEvent(null)}
      />

      {/* 3-HEART LOSS FULL GAME RESET MODAL */}
      <GameOverResetModal
        isOpen={gameOverOpen}
        onRestartFromStart={handleResetCurrentGame}
      />

      <GuideGameAboutModal
        open={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        onGoHome={() => {
          setLessonsMapOpen(false);
          setPrologueInitialLessonId('prologue_curiosity');
          setStage('prologue');
          setActiveLessonId('prologue_curiosity');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAllLessons={() => {
          setLessonsMapOpen(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenResourceHub={() => setResourceHubOpen(true)}
        completedCount={completedLessonIds.length}
        totalLessons={ALL_LESSONS.length}
        xp={xp}
      />

      <OfficialResourceHubModal
        isOpen={resourceHubOpen}
        onClose={() => setResourceHubOpen(false)}
        onAwardXp={handleAwardXp}
      />

      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <p>
          ഗൈഡ് ഗെയിം (Guide Game) · SKSSF · “വിജ്ഞാനം, വിനയം, സേവനം”
        </p>
      </footer>
      <FloatingPageNavigator visible={!lessonsMapOpen} />
    </div>
    </LessonFlowProvider>
    </GameLivesProvider>
  );
}
