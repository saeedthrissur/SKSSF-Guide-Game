import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  Gamepad2,
  Gift,
  Link2,
  Settings,
  Share2,
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
  useLessonFlow,
} from './utils/lessonFlowContext';
import { GuideGameAboutModal, GuideGameBrandLogo } from './components/GameLivesHud';
import { OfficialResourceHubModal } from './components/OfficialResourceHubModal';
import { LessonStorylineCard } from './data/lessonStorylines';
import { copyAppShareLink, getAppShareUrl } from './utils/shareLink';
import heroBannerImg from './assets/images/skssf_guide_og_banner_1795723645643.jpg';

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

interface WelcomeIntroScreenProps {
  xp: number;
  completedCount: number;
  totalLessons: number;
  activeLessonTitle?: string;
  onStartJourney: () => void;
  onOpenAllLessons: () => void;
  onOpenBadgeStudio: () => void;
}

const WelcomeIntroScreen: React.FC<WelcomeIntroScreenProps> = ({
  xp,
  completedCount,
  totalLessons,
  activeLessonTitle,
  onStartJourney,
  onOpenAllLessons,
  onOpenBadgeStudio,
}) => {
  const hasSavedProgress = xp > 0 || completedCount > 0;
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleQuickShare = async () => {
    sound.unlockAudio();
    sound.playClick();
    const shareUrl = getAppShareUrl();
    const shareText =
      'SKSSF ഗൈഡ് ഗെയിം — നമ്മൾ ആരാണ്? നമ്മുടെ ദൗത്യങ്ങൾ എന്ത്? 52 പാഠങ്ങളും ഗെയിമുകളും കളിച്ച് സാക്ഷ്യപത്രം നേടാം!';
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'SKSSF ഗൈഡ് ഗെയിം',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or native share unsupported — fall back to clipboard copy
      }
    }
    const ok = await copyAppShareLink();
    if (ok) {
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2600);
    }
  };

  return (
    <section className="max-w-3xl mx-auto py-3 sm:py-6">
      <div className="rounded-3xl border border-emerald-200 bg-white shadow-sm overflow-hidden">
        {/* Top Hero Band — Unified Emerald Green + Warm Amber with Measured Scrim */}
        <div className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 px-5 sm:px-8 py-6 sm:py-8 text-white border-b-4 border-amber-400 overflow-hidden">
          {!heroImgFailed && (
            <img
              src={heroBannerImg}
              alt="SKSSF ഗൈഡ് ഗെയിം പഠന ബാനർ"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-28 mix-blend-luminosity"
            />
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-950/92 via-emerald-950/82 to-emerald-900/75"
          />
          <div className="relative z-10">
            <p className="text-xs font-extrabold tracking-wide text-amber-300 mb-2">
              വിജ്ഞാനം · വിനയം · സേവനം
            </p>
            <h1
              className="text-xl sm:text-3xl font-black leading-snug text-white"
              style={{ textWrap: 'balance' }}
            >
              SKSSF ഗൈഡ് ഗെയിം — നമ്മൾ ആരാണ്? നമ്മുടെ ദൗത്യങ്ങൾ എന്ത്?
            </h1>
            <p className="mt-3 text-sm sm:text-base text-emerald-50/95 leading-relaxed">
              സമസ്ത കേരള സുന്നി സ്റ്റുഡന്റ്‌സ് ഫെഡറേഷന്റെ (SKSSF) ചരിത്രവും ഘടനയും 17 ഉപവിഭാഗങ്ങളുടെ ദൗത്യങ്ങളും ചെറു ഗെയിമുകളിലൂടെയും ക്വിസ്സുകളിലൂടെയും ലളിതമായി പഠിക്കാനുള്ള ഇന്ററാക്ടീവ് പോർട്ടലാണിത്. യൂണിറ്റ് തലം മുതൽ ഗ്ലോബൽ തലം വരെയുള്ള 52 പാഠങ്ങൾ പൂർത്തിയാക്കി നിങ്ങളുടെ പേരിലുള്ള SKSSF ഗൈഡ് സാക്ഷ്യപത്രം നേടാം.
            </p>
          </div>
        </div>

        {/* Visual 2-Step Flow Preview + Primary CTA */}
        <div className="p-5 sm:p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-extrabold text-slate-500 tracking-wide">
              ഓരോ പാഠത്തിന്റെയും പഠനരീതി
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
              {/* Step 1 Preview */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Gamepad2 className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-emerald-950">
                    1. സ്റ്റോറി ലൈൻ + ഗെയിം
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                    പാഠത്തിന്റെ ചെറു കഥ മനസ്സിലാക്കി രസകരമായ ഗെയിം കളിക്കാം.
                  </p>
                </div>
              </div>

              {/* Connector Arrow */}
              <div className="flex items-center justify-center text-emerald-700">
                <ArrowRight className="w-5 h-5 rotate-90 sm:rotate-0" />
              </div>

              {/* Step 2 Preview */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900">
                    2. പാഠം + ക്വിസ്
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                    പാഠക്കുറിപ്പ് വായിച്ച് ക്വിസ്സിൽ ഉത്തരം നൽകി അടുത്ത പാഠം തുറക്കാം.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Returning User Progress Notice */}
          {hasSavedProgress && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-emerald-950 tabular-nums">
              <span>
                നിലവിലെ പുരോഗതി: {completedCount}/{totalLessons} പാഠങ്ങൾ
                {activeLessonTitle ? ` · അടുത്തത്: ${activeLessonTitle}` : ''}
              </span>
              <span className="text-emerald-700">{xp} XP</span>
            </div>
          )}

          {/* Primary CTA */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={onStartJourney}
              className="w-full min-h-[54px] px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-black text-base sm:text-lg shadow-sm border-b-4 border-emerald-950 flex items-center justify-center gap-2.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <span>പഠനം തുടങ്ങാം (Start Journey)</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-bold text-slate-600">
              <span>{totalLessons} പാഠങ്ങൾ · 3 ഹൃദയങ്ങൾ · 17 ഉപവിഭാഗങ്ങൾ · സാക്ഷ്യപത്രം</span>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onOpenAllLessons}
                  className="text-emerald-800 hover:text-emerald-950 underline underline-offset-4 font-extrabold cursor-pointer"
                >
                  എല്ലാ പാഠങ്ങളും കാണാം
                </button>
                <button
                  type="button"
                  onClick={onOpenBadgeStudio}
                  className="text-amber-700 hover:text-amber-900 underline underline-offset-4 font-extrabold cursor-pointer"
                >
                  ഫോട്ടോ ബാഡ്ജ്
                </button>
                <button
                  type="button"
                  onClick={handleQuickShare}
                  className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-900 underline underline-offset-4 font-extrabold cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{shareCopied ? 'ലിങ്ക് കോപ്പി ചെയ്തു!' : 'ലിങ്ക് ഷെയർ ചെയ്യാം'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface LessonWorkspaceFrameProps {
  children: React.ReactNode;
}

const LessonWorkspaceFrame: React.FC<LessonWorkspaceFrameProps> = ({ children }) => {
  const { activeLessonId, lessonViewStep, goToStudyStep, hasGameOnPage, isGameDone } =
    useLessonFlow();
  const currentGameDone = isGameDone(activeLessonId);

  return (
    <div className="space-y-4">
      {/* Screen 1 ('play'): Item 1 — Compact Storyline Card at the top */}
      {lessonViewStep === 'play' && hasGameOnPage && (
        <LessonStorylineCard lessonId={activeLessonId} />
      )}

      {/* Active View Content:
          - On 'play': Renders ONLY the Game (Item 2)
          - On 'study': Renders ONLY Lesson (Item 1) + Quiz (Item 2) */}
      {children}

      {/* Screen 1 ('play'): Clean Bottom Bar strictly OUTSIDE the Game container */}
      {lessonViewStep === 'play' && hasGameOnPage && (
        <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xs">
          <p className="text-xs font-bold text-slate-600 text-center sm:text-left">
            {currentGameDone
              ? 'ഗെയിം പൂർത്തിയായി! ഇനി പാഠവും ക്വിസ്സും വായിച്ച് മുന്നോട്ട് പോകാം.'
              : 'കളി കഴിഞ്ഞോ, അല്ലെങ്കിൽ നേരിട്ട് പാഠവും ക്വിസ്സും വായിക്കണോ?'}
          </p>
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              sound.playClick();
              goToStudyStep();
            }}
            className={`w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0 ${
              currentGameDone
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>ഗെയിം ഒഴിവാക്കി പാഠത്തിലേക്ക് പോകാം (Skip Game → Lesson)</span>
          </button>
        </div>
      )}
    </div>
  );
};

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

  const [showIntro, setShowIntro] = useState<boolean>(true);
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

  const canonicalCompletedCount = useMemo(
    () => completedLessonIds.filter((id) => ALL_LESSONS.some((l) => l.id === id)).length,
    [completedLessonIds]
  );

  const activeLessonTitle = useMemo(
    () => ALL_LESSONS.find((l) => l.id === activeLessonId)?.title,
    [activeLessonId]
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
    setShowIntro(false);
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
      resetSignal={attemptKey}
      onOpenAllLessons={() => {
        setShowIntro(false);
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
              className="inline-flex items-center gap-1 h-9 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-950 text-[11px] sm:text-xs font-extrabold hover:bg-emerald-100 tabular-nums whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
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
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-amber-400 bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
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
                className="inline-flex items-center gap-1 h-9 px-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 text-xs font-extrabold hover:bg-amber-100 tabular-nums whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
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
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
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
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? 'ശബ്ദം ഓൺ ചെയ്യുക' : 'ശബ്ദം മ്യൂട്ട് ചെയ്യുക'}
              title={muted ? 'ശബ്ദം ഓൺ' : 'മ്യൂട്ട്'}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
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

      {/* Main Game Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-5">
        {!showIntro && showResumeToast && (
          <div className="mb-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 flex items-center justify-between gap-2 text-xs font-bold text-emerald-950">
            <span className="tabular-nums">
              💾 #{runNumber} · {xp} XP · {canonicalCompletedCount}/{ALL_LESSONS.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setScoreModalOpen(true)}
                aria-label="സ്കോർ കാണാം"
                className="px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100 font-extrabold"
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
        ) : showIntro ? (
          <WelcomeIntroScreen
            xp={xp}
            completedCount={canonicalCompletedCount}
            totalLessons={ALL_LESSONS.length}
            activeLessonTitle={activeLessonTitle}
            onStartJourney={() => {
              sound.unlockAudio();
              sound.playClick();
              setShowIntro(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAllLessons={() => {
              sound.unlockAudio();
              sound.playClick();
              setShowIntro(false);
              setLessonsMapOpen(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenBadgeStudio={() => {
              sound.unlockAudio();
              sound.playPop();
              setBadgeStudioPreset('starter_member');
              setBadgeStudioOpen(true);
            }}
          />
        ) : (
          <>
            <UnseenLessonBanner
              unseenLessons={skippedUnseenBefore}
              onJumpToLesson={handleJumpToLesson}
            />

            <LessonWorkspaceFrame>
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
            </LessonWorkspaceFrame>

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
                    പാഠങ്ങൾ ({canonicalCompletedCount}/{ALL_LESSONS.length})
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
        completedLessonsCount={canonicalCompletedCount}
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
          setShowIntro(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAllLessons={() => {
          setShowIntro(false);
          setLessonsMapOpen(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenResourceHub={() => setResourceHubOpen(true)}
        completedCount={canonicalCompletedCount}
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
      <FloatingPageNavigator visible={!lessonsMapOpen && !showIntro} />
    </div>
    </LessonFlowProvider>
    </GameLivesProvider>
  );
}
