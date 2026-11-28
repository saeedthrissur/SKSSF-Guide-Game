import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Download,
  Flame,
  Gamepad2,
  Gift,
  Scale,
  Settings,
  Share2,
  Trophy,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from 'lucide-react';
import type { L1Tab } from './components/Level1Story';
import type { L2GameTab } from './components/Level2Ecosystem';
import type { L3Tab } from './components/Level3Organizer';
import type { L4Tab } from './components/Level4Strategy';

const Level1Story = lazy(() =>
  import('./components/Level1Story').then((m) => ({ default: m.Level1Story }))
);
const Level2Ecosystem = lazy(() =>
  import('./components/Level2Ecosystem').then((m) => ({ default: m.Level2Ecosystem }))
);
const Level3Organizer = lazy(() =>
  import('./components/Level3Organizer').then((m) => ({ default: m.Level3Organizer }))
);
const Level4Strategy = lazy(() =>
  import('./components/Level4Strategy').then((m) => ({ default: m.Level4Strategy }))
);
const StoryPrologueTheater = lazy(() =>
  import('./components/StoryIntroAndBoard').then((m) => ({ default: m.StoryPrologueTheater }))
);
const VisualStoryboardArena = lazy(() =>
  import('./components/StoryIntroAndBoard').then((m) => ({ default: m.VisualStoryboardArena }))
);
const SkssfPovJourneyGame = lazy(() =>
  import('./components/SkssfPovJourneyGame').then((m) => ({ default: m.SkssfPovJourneyGame }))
);
const AllLessonsMapPage = lazy(() =>
  import('./components/AllLessonsMapPage').then((m) => ({ default: m.AllLessonsMapPage }))
);
const ShareableBadgeStudio = lazy(() =>
  import('./components/ShareableBadgeStudio').then((m) => ({ default: m.ShareableBadgeStudio }))
);
const OfficialResourceHubModal = lazy(() =>
  import('./components/OfficialResourceHubModal').then((m) => ({
    default: m.OfficialResourceHubModal,
  }))
);
const DailyChallengeModal = lazy(() =>
  import('./components/DailyChallengeModal').then((m) => ({
    default: m.DailyChallengeModal,
  }))
);
import { getTodaySpecialGame } from './components/DailyChallengeModal';
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
import { SupportDeveloperModal } from './components/SupportDeveloperModal';
import { LegalPrivacyModal } from './components/LegalPrivacyModal';
import {
  ALL_LESSONS,
  getAllUnseenLessons,
  getSequentialFrontierIndex,
  getSkippedUnseenLessonsBefore,
  isLessonSequentiallyUnlocked,
  loadCompletedLessonIds,
  saveCompletedLessonIds,
} from './utils/lessonTracker';
import {
  archiveRunToHistory,
  clearAllAppStorage,
  clearSavedGameState,
  DailyAndProfileState,
  loadDailyAndProfileState,
  loadRunHistory,
  loadSavedGameState,
  QuizAnswerMap,
  recordGenuineDailyActivity,
  RunHistoryEntry,
  saveDailyAndProfileState,
  saveGameState,
  UnitProfile,
} from './utils/gameStorage';
import { useOnlineStatus, usePWAInstall } from './utils/usePWAInstall';
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
import { LessonStorylineCard } from './data/lessonStorylines';
import {
  copyAppShareLink,
  copyLessonShareLink,
  getAppShareUrl,
  getLessonShareUrl,
  getWhatsAppShareHref,
  resolveLessonFromUrl,
  syncLessonUrl,
} from './utils/shareLink';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { displayPrefs } from './utils/displayPrefs';

const StageLoadingFallback: React.FC = () => (
  <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-10 text-center shadow-2xs space-y-3">
    <div className="w-9 h-9 rounded-full border-3 border-emerald-200 border-t-emerald-700 animate-spin mx-auto" />
    <p className="text-xs sm:text-sm font-extrabold text-emerald-950">
      പാഠവും ഗെയിമും തയ്യാറാക്കുന്നു...
    </p>
  </div>
);

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
    short: '🗼 4. സ്റ്റേറ്റ് & ഗ്ലോബൽ',
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
  streakDays: number;
  todaySpecialGameDone: boolean;
  onStartJourney: () => void;
  onOpenAllLessons: () => void;
  onOpenBadgeStudio: () => void;
  onOpenDailyChallenge: () => void;
  onOpenSupport: () => void;
}

const WelcomeIntroScreen: React.FC<WelcomeIntroScreenProps> = ({
  xp,
  completedCount,
  totalLessons,
  activeLessonTitle,
  streakDays,
  todaySpecialGameDone,
  onStartJourney,
  onOpenAllLessons,
  onOpenBadgeStudio,
  onOpenDailyChallenge,
  onOpenSupport,
}) => {
  const hasSavedProgress = xp > 0 || completedCount > 0;
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const todaySpecial = getTodaySpecialGame();

  const handleQuickShare = async () => {
    sound.unlockAudio();
    sound.playClick();
    const shareUrl = getAppShareUrl();
    const shareText = `SKSSF ഗൈഡ് ഗെയിം — നമ്മൾ ആരാണ്? നമ്മുടെ ദൗത്യങ്ങൾ എന്ത്? ${ALL_LESSONS.length} പാഠങ്ങളും ഗെയിമുകളും കളിച്ച് സാക്ഷ്യപത്രം നേടാം!`;
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
              src="./assets/og-guide-game.jpg"
              alt="SKSSF ഗൈഡ് ഗെയിം പഠന ബാനർ"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-25"
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
              സമസ്ത കേരള സുന്നി സ്റ്റുഡന്റ്‌സ് ഫെഡറേഷന്റെ (SKSSF) ചരിത്രവും ഘടനയും 17 ഉപവിഭാഗങ്ങളുടെ ദൗത്യങ്ങളും ചെറു ഗെയിമുകളിലൂടെയും ക്വിസ്സുകളിലൂടെയും ലളിതമായി പഠിക്കാനുള്ള ഇന്ററാക്ടീവ് പോർട്ടലാണിത്. യൂണിറ്റ് തലം മുതൽ ഗ്ലോബൽ തലം വരെയുള്ള {totalLessons} പാഠങ്ങൾ പൂർത്തിയാക്കി നിങ്ങളുടെ പേരിലുള്ള ആദർശ വിജ്ഞാന പ്രതിഭ പ്രശംസാപത്രം നേടാം.
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
              <span>പഠനം തുടങ്ങാം</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>

            {/* Daily Streak & Today's Special Game Strip */}
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50/60 to-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 leading-snug">
                    🔥 {streakDays} ദിവസം സ്ട്രീക്ക് · {todaySpecial.dayName} സ്പെഷ്യൽ: {todaySpecial.emoji} {todaySpecial.title}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-600 leading-snug">
                    {todaySpecialGameDone
                      ? '✅ ഇന്നത്തെ സ്പെഷ്യൽ ഗെയിം പൂർത്തിയാക്കി · മറ്റു ദിവസത്തെ ഗെയിമുകളും പരിശീലിക്കാം'
                      : 'ഓരോ ദിവസവും പുതിയ സ്പെഷ്യൽ ഗെയിം കളിച്ച് +35 ബോണസ് XP നേടാം!'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenDailyChallenge}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shrink-0 cursor-pointer transition-colors"
              >
                {todaySpecialGameDone ? 'സ്ട്രീക്ക് കാണാം' : 'ഇന്നത്തെ ഗെയിം കളിക്കാം'}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-bold text-slate-600">
              <span>{totalLessons} പാഠങ്ങൾ · 3 ഹൃദയങ്ങൾ · 17 ഉപവിഭാഗങ്ങൾ · സാക്ഷ്യപത്രം</span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
                <button
                  type="button"
                  onClick={onOpenSupport}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-extrabold transition-colors cursor-pointer"
                >
                  <span>🎁 ഒരു ഹദിയ നൽകാം</span>
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
  completedCount: number;
  totalLessons: number;
  isPreviewMode?: boolean;
  nextSequentialLesson?: { number: number; id: string; title: string; emoji: string } | null;
  onReturnToMyProgress?: () => void;
  children: React.ReactNode;
}

const LessonWorkspaceFrame: React.FC<LessonWorkspaceFrameProps> = ({
  completedCount,
  totalLessons,
  isPreviewMode = false,
  nextSequentialLesson = null,
  onReturnToMyProgress,
  children,
}) => {
  const {
    activeLessonId,
    lessonViewStep,
    goToPlayStep,
    goToStudyStep,
    hasGameOnPage,
    isGameDone,
  } = useLessonFlow();
  const currentGameDone = isGameDone(activeLessonId);
  const [lessonCopied, setLessonCopied] = useState(false);
  const [shareBoxOpen, setShareBoxOpen] = useState(false);
  const lessonIdx = ALL_LESSONS.findIndex((l) => l.id === activeLessonId);
  const activeLesson = lessonIdx >= 0 ? ALL_LESSONS[lessonIdx] : null;
  const progressPct = Math.round((completedCount / Math.max(1, totalLessons)) * 100);
  const lessonShareUrl = activeLesson ? getLessonShareUrl(activeLesson.id) : '';

  useEffect(() => {
    setShareBoxOpen(false);
    setLessonCopied(false);
  }, [activeLessonId]);

  const handleShareLesson = async () => {
    if (!activeLesson) return;
    sound.unlockAudio();
    sound.playClick();
    const url = getLessonShareUrl(activeLesson.id);
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `SKSSF ഗൈഡ് ഗെയിം — ${activeLesson.title}`,
          text: `പാഠം ${lessonIdx + 1}: ${activeLesson.title} — SKSSF ഗൈഡ് ഗെയിമിൽ കളിച്ചു പഠിക്കൂ!`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard copy + inline share bar
      }
    }
    const ok = await copyLessonShareLink(activeLesson.id);
    if (ok) {
      setLessonCopied(true);
      window.setTimeout(() => setLessonCopied(false), 2400);
    } else {
      setShareBoxOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Guest Preview Banner when viewing a locked lesson via a shared direct link */}
      {isPreviewMode && activeLesson && (
        <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-white to-emerald-50 px-4 py-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0 space-y-0.5">
            <p className="text-xs font-black text-amber-900">
              🔗 ഷെയർ ലിങ്ക് പ്രിവ്യൂ · പാഠം {lessonIdx + 1}/{totalLessons}
            </p>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
              ഈ പാഠം മാത്രം നിങ്ങൾക്ക് ഇപ്പോൾ കാണാനും കളിക്കാനും സാധിക്കും. ബാക്കി പാഠങ്ങളും സാക്ഷ്യപത്രവും തുറക്കാൻ
              {nextSequentialLesson
                ? ` പാഠം ${nextSequentialLesson.number} (${nextSequentialLesson.title}) മുതൽ ക്രമമായി കളിച്ച് മുന്നോട്ട് പോകൂ!`
                : ' ക്രമമായി കളിച്ച് മുന്നോട്ട് പോകൂ!'}
            </p>
          </div>
          {onReturnToMyProgress && nextSequentialLesson && (
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playClick();
                onReturnToMyProgress();
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black text-center sm:whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              {nextSequentialLesson.emoji} പാഠം {nextSequentialLesson.number} മുതൽ തുടരാം →
            </button>
          )}
        </div>
      )}

      {/* Compact Lesson Progress & 2-Step Indicator Strip */}
      {activeLesson && (
        <div className="relative isolate rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-2xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 tabular-nums min-w-0">
                <span className="font-extrabold text-emerald-700 shrink-0">
                  പാഠം {lessonIdx + 1}/{totalLessons}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{activeLesson.title}</span>
              </div>
              <button
                type="button"
                onClick={handleShareLesson}
                aria-label="ഈ പാഠത്തിന്റെ ലിങ്ക് ഷെയർ ചെയ്യാം"
                title={lessonCopied ? 'ലിങ്ക് കോപ്പി ചെയ്തു!' : 'ഈ പാഠം ഷെയർ ചെയ്യാം'}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-[10px] font-extrabold text-slate-600 hover:text-emerald-800 transition-colors shrink-0 cursor-pointer"
              >
                {lessonCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span className="text-emerald-800">കോപ്പി ചെയ്തു</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3 h-3" />
                    <span className="hidden sm:inline">ഷെയർ</span>
                  </>
                )}
              </button>
            </div>

            {/* Interactive 2-Step Segmented Switcher */}
            {hasGameOnPage && (
              <div
                className="inline-flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                role="tablist"
                aria-label="പാഠത്തിന്റെ ഘട്ടങ്ങൾ"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={lessonViewStep === 'play'}
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                    goToPlayStep();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    lessonViewStep === 'play'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1. ഗെയിം
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={lessonViewStep === 'study'}
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                    goToStudyStep();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    lessonViewStep === 'study'
                      ? 'bg-amber-400 text-slate-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2. പാഠം + ക്വിസ്
                </button>
              </div>
            )}
          </div>

          {shareBoxOpen && lessonShareUrl && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
              <input
                type="text"
                readOnly
                value={lessonShareUrl}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="പാഠത്തിന്റെ ഡയറക്ട് ലിങ്ക്"
                className="flex-1 min-w-[180px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700"
              />
              <a
                href={getWhatsAppShareHref(
                  `പാഠം ${lessonIdx + 1}: ${activeLesson.title} — SKSSF ഗൈഡ് ഗെയിമിൽ പഠിക്കൂ!`,
                  lessonShareUrl
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-extrabold whitespace-nowrap"
              >
                WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setShareBoxOpen(false)}
                aria-label="അടയ്ക്കുക"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              style={{ width: `${Math.max(progressPct, isPreviewMode ? 0 : Math.round(((lessonIdx + 1) / Math.max(1, totalLessons)) * 100) * 0.25)}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-amber-400 transition-all duration-300"
            />
          </div>
        </div>
      )}

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
            <span>നേരിട്ട് പാഠത്തിലേക്ക് പോകാം</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [savedInit] = useState(() => loadSavedGameState());
  const [initialDeepLink] = useState(() => resolveLessonFromUrl(ALL_LESSONS));
  const [initialCompleted] = useState<string[]>(() =>
    savedInit?.completedLessonIds?.length ? savedInit.completedLessonIds : loadCompletedLessonIds()
  );
  const initialIsPreview = Boolean(
    initialDeepLink &&
      ALL_LESSONS.findIndex((l) => l.id === initialDeepLink.id) >
        getSequentialFrontierIndex(initialCompleted)
  );

  const [stage, setStage] = useState<AppStage>(
    () => initialDeepLink?.stage ?? savedInit?.stage ?? 'prologue'
  );
  const [currentLevel, setCurrentLevel] = useState<LevelNumber>(
    () => initialDeepLink?.level ?? savedInit?.currentLevel ?? 1
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
  const [dailyModalOpen, setDailyModalOpen] = useState<boolean>(false);
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
    !initialDeepLink && typeof savedInit?.lives === 'number' ? savedInit.lives <= 0 : false
  );
  const [runNumber, setRunNumber] = useState<number>(() => savedInit?.runNumber ?? 1);
  const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>(() => loadRunHistory());
  const [dailyState, setDailyState] = useState<DailyAndProfileState>(() => loadDailyAndProfileState());
  const [attemptKey, setAttemptKey] = useState<number>(0);
  const [lessonJumpSeq, setLessonJumpSeq] = useState<number>(0);
  const [showResumeToast, setShowResumeToast] = useState<boolean>(() =>
    Boolean(
      !initialDeepLink &&
        savedInit &&
        (savedInit.xp > 0 ||
          savedInit.completedLessonIds.length > 0 ||
          Object.keys(savedInit.quizAnswers || {}).length > 0)
    )
  );

  const [showIntro, setShowIntro] = useState<boolean>(() => !initialDeepLink);
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(() =>
    initialIsPreview && initialDeepLink ? initialDeepLink.id : null
  );
  const [devUnlocked, setDevUnlocked] = useState<boolean>(false);
  const [lessonsMapOpen, setLessonsMapOpen] = useState<boolean>(false);
  const [resourceHubOpen, setResourceHubOpen] = useState<boolean>(false);
  const [supportModalOpen, setSupportModalOpen] = useState<boolean>(false);
  const [legalModalOpen, setLegalModalOpen] = useState<boolean>(false);
  const [footerIosHint, setFooterIosHint] = useState<boolean>(false);
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const isAnyModalOpen =
    settingsOpen ||
    scoreModalOpen ||
    dailyModalOpen ||
    badgeStudioOpen ||
    giftChestOpen ||
    gameOverOpen ||
    supportModalOpen ||
    aboutModalOpen ||
    resourceHubOpen ||
    legalModalOpen;

  useEffect(() => {
    if (typeof document === 'undefined' || !isAnyModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isAnyModalOpen]);

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => initialCompleted);
  const [activeLessonId, setActiveLessonId] = useState<string>(
    () => initialDeepLink?.id ?? savedInit?.activeLessonId ?? 'prologue_curiosity'
  );
  const [prologueInitialLessonId, setPrologueInitialLessonId] = useState<string | undefined>(() =>
    initialDeepLink?.stage === 'prologue'
      ? initialDeepLink.id
      : savedInit?.stage === 'prologue'
      ? savedInit?.activeLessonId
      : undefined
  );
  const [storyboardInitialTab, setStoryboardInitialTab] = useState<string | undefined>(() =>
    initialDeepLink?.stage === 'storyboard'
      ? initialDeepLink.tab
      : getInitialTabForLesson<string>(savedInit?.activeLessonId, 'storyboard')
  );
  const [povInitialTab, setPovInitialTab] = useState<string | undefined>(() =>
    initialDeepLink?.stage === 'pov'
      ? initialDeepLink.tab ?? initialDeepLink.id
      : getInitialTabForLesson<string>(savedInit?.activeLessonId, 'pov')
  );
  const [l1InitialTab, setL1InitialTab] = useState<L1Tab | undefined>(() =>
    initialDeepLink?.stage === 'world' && initialDeepLink.level === 1
      ? (initialDeepLink.tab as L1Tab)
      : getInitialTabForLesson<L1Tab>(savedInit?.activeLessonId, 'world', 1)
  );
  const [l2InitialTab, setL2InitialTab] = useState<L2GameTab | undefined>(() =>
    initialDeepLink?.stage === 'world' && initialDeepLink.level === 2
      ? (initialDeepLink.tab as L2GameTab)
      : getInitialTabForLesson<L2GameTab>(savedInit?.activeLessonId, 'world', 2)
  );
  const [l3InitialTab, setL3InitialTab] = useState<L3Tab | undefined>(() =>
    initialDeepLink?.stage === 'world' && initialDeepLink.level === 3
      ? (initialDeepLink.tab as L3Tab)
      : getInitialTabForLesson<L3Tab>(savedInit?.activeLessonId, 'world', 3)
  );
  const [l4InitialTab, setL4InitialTab] = useState<L4Tab | undefined>(() =>
    initialDeepLink?.stage === 'world' && initialDeepLink.level === 4
      ? (initialDeepLink.tab as L4Tab)
      : getInitialTabForLesson<L4Tab>(savedInit?.activeLessonId, 'world', 4)
  );

  // Sync completed lessons to legacy key & auto-save full progress to browser localStorage
  useEffect(() => {
    saveCompletedLessonIds(completedLessonIds);
  }, [completedLessonIds]);

  const isPreviewMode = Boolean(
    previewLessonId &&
      !devUnlocked &&
      ALL_LESSONS.findIndex((l) => l.id === activeLessonId) >
        getSequentialFrontierIndex(completedLessonIds)
  );

  useEffect(() => {
    const frontierIdx = getSequentialFrontierIndex(completedLessonIds);
    const frontierLesson = ALL_LESSONS[frontierIdx] ?? ALL_LESSONS[0];
    // Never overwrite the learner's real saved stage/lesson position while previewing a locked shared link
    const persistedStage = isPreviewMode
      ? savedInit?.stage ?? frontierLesson.stage
      : stage;
    const persistedLevel = isPreviewMode
      ? savedInit?.currentLevel ?? frontierLesson.level ?? 1
      : currentLevel;
    const persistedLessonId = isPreviewMode
      ? savedInit?.activeLessonId ?? frontierLesson.id
      : activeLessonId;

    saveGameState({
      version: 2,
      stage: persistedStage,
      currentLevel: persistedLevel,
      activeLessonId: persistedLessonId,
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
    isPreviewMode,
    savedInit,
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

  useEffect(() => {
    saveDailyAndProfileState(dailyState);
  }, [dailyState]);

  const handleMarkLessonCompleted = useCallback(
    (lessonId: string) => {
      if (devUnlocked) return;
      setCompletedLessonIds((prev) => {
        if (prev.includes(lessonId)) return prev;
        setDailyState((d) =>
          recordGenuineDailyActivity({
            ...d,
            todayLessonsCount: d.todayLessonsCount + 1,
          })
        );
        return [...prev, lessonId];
      });
    },
    [devUnlocked]
  );

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

  // Stage-aligned milestone celebrations (Prologue 6, Practical 18, Unit 26, Cluster/Zone 35, District 40, Full)
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const [milestoneShareCopied, setMilestoneShareCopied] = useState(false);

  const STAGE_MILESTONE_LABELS: Record<number, { title: string; badgePreset: string }> = {
    6: { title: 'ആമുഖ ഘട്ടം പൂർത്തിയാക്കി!', badgePreset: 'starter_member' },
    18: { title: 'പ്രായോഗിക യാത്ര പൂർത്തിയാക്കി!', badgePreset: 'jeep_starter' },
    26: { title: 'യൂണിറ്റ് തലം പൂർത്തിയാക്കി!', badgePreset: 'flag_keeper' },
    35: { title: 'ക്ലസ്റ്റർ & മേഖലാ തലം പൂർത്തിയാക്കി!', badgePreset: 'madrasa_guardian' },
    40: { title: 'ജില്ലാ തലം പൂർത്തിയാക്കി!', badgePreset: 'viqaya_hero' },
    [ALL_LESSONS.length]: { title: `എല്ലാ ${ALL_LESSONS.length} പാഠങ്ങളും പൂർത്തിയാക്കി!`, badgePreset: 'master_guide' },
  };

  useEffect(() => {
    const milestones = [6, 18, 26, 35, 40, ALL_LESSONS.length];
    const reached = milestones.filter((m) => canonicalCompletedCount >= m).pop();
    if (!reached) return;
    try {
      const raw = localStorage.getItem('skssf_milestones_seen_v1');
      const seen: number[] = raw ? JSON.parse(raw) : [];
      if (!seen.includes(reached)) {
        const next = [...seen, reached];
        localStorage.setItem('skssf_milestones_seen_v1', JSON.stringify(next));
        setActiveMilestone(reached);
        sound.playSuccess(3);
      }
    } catch {
      // Ignore storage errors
    }
  }, [canonicalCompletedCount]);

  const quizStats = useMemo(() => {
    const entries = Object.values(quizAnswers);
    return {
      answered: entries.length,
      correct: entries.filter((e) => e.isCorrect).length,
    };
  }, [quizAnswers]);

  const nextSequentialIdx = useMemo(
    () => getSequentialFrontierIndex(completedLessonIds),
    [completedLessonIds]
  );

  const nextSequentialLesson = useMemo(() => {
    const desc = ALL_LESSONS[nextSequentialIdx] ?? ALL_LESSONS[0];
    return {
      number: nextSequentialIdx + 1,
      id: desc.id,
      title: desc.title,
      emoji: desc.emoji,
    };
  }, [nextSequentialIdx]);

  const storyboardUnlocked =
    devUnlocked ||
    (!isPreviewMode && (stage === 'storyboard' || stage === 'pov' || stage === 'world')) ||
    completedLessonIds.includes('prologue_story') ||
    completedLessonIds.includes('storyboard') ||
    completedLessonIds.includes('pov_journey') ||
    unlockedLevels.length > 1;

  const povUnlocked =
    devUnlocked ||
    (!isPreviewMode && (stage === 'pov' || stage === 'world')) ||
    completedLessonIds.includes('storyboard') ||
    completedLessonIds.includes('pov_journey') ||
    completedLevels.length > 0 ||
    unlockedLevels.length > 1;

  const world1Unlocked =
    devUnlocked ||
    (!isPreviewMode && stage === 'world') ||
    completedLessonIds.includes('pov_journey') ||
    completedLevels.length > 0 ||
    unlockedLevels.length > 1;

  const handleJumpToLesson = useCallback(
    (lessonId: string, options?: { isDirectLink?: boolean }) => {
      const target = ALL_LESSONS.find((l) => l.id === lessonId);
      if (!target) return;
      const unlocked = isLessonSequentiallyUnlocked(target.id, completedLessonIds, devUnlocked);
      // Direct links to locked lessons open in isolated Guest Preview mode without unlocking earlier lessons
      const enteringPreview = Boolean(options?.isDirectLink && !unlocked);
      if (!options?.isDirectLink && !unlocked) return;

      sound.unlockAudio();
      sound.playClick();
      setPreviewLessonId(enteringPreview ? target.id : null);

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
        if (!enteringPreview) {
          setUnlockedLevels((prev) => (prev.includes(lvl) ? prev : [...prev, lvl]));
        }
        if (lvl === 1 && target.tab) setL1InitialTab(target.tab as L1Tab);
        if (lvl === 2 && target.tab) setL2InitialTab(target.tab as L2GameTab);
        if (lvl === 3 && target.tab) setL3InitialTab(target.tab as L3Tab);
        if (lvl === 4 && target.tab) setL4InitialTab(target.tab as L4Tab);
        setStage('world');
        setCurrentLevel(lvl);
      }
      setActiveLessonId(target.id);
      setLessonJumpSeq((s) => s + 1);
      setShowIntro(false);
      setLessonsMapOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [completedLessonIds, devUnlocked]
  );

  // Keep browser URL cleanly synced with the active lesson so copying/reloading always works
  useEffect(() => {
    syncLessonUrl(showIntro ? null : activeLessonId);
  }, [showIntro, activeLessonId]);

  // Always start at the very top of the page whenever navigating between views, stages, levels, or lessons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const rafId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [showIntro, lessonsMapOpen, stage, currentLevel, activeLessonId]);

  // Listen to browser hash/history changes (?lesson=... or #lesson=...) for instant direct-link jumps
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleLocationChange = () => {
      const target = resolveLessonFromUrl(ALL_LESSONS);
      if (target && target.id !== activeLessonId) {
        handleJumpToLesson(target.id, { isDirectLink: true });
      }
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [activeLessonId, handleJumpToLesson]);

  // Gently prefetch the active stage chunk while the user reads the Welcome Intro screen
  useEffect(() => {
    if (!showIntro) return;
    const timer = window.setTimeout(() => {
      if (stage === 'prologue' || stage === 'storyboard') {
        void import('./components/StoryIntroAndBoard');
      } else if (stage === 'pov') {
        void import('./components/SkssfPovJourneyGame');
      } else if (currentLevel === 1) {
        void import('./components/Level1Story');
      } else if (currentLevel === 2) {
        void import('./components/Level2Ecosystem');
      } else if (currentLevel === 3) {
        void import('./components/Level3Organizer');
      } else {
        void import('./components/Level4Strategy');
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [showIntro, stage, currentLevel]);

  const currentRank = useMemo(() => {
    if (canonicalCompletedCount >= ALL_LESSONS.length) return 'വിജ്ഞാനസാരഥി';
    if (canonicalCompletedCount >= 40 || xp >= 450) return 'ആദർശരക്ഷാധികാരി';
    if (canonicalCompletedCount >= 30 || xp >= 320) return 'ചരിത്രാന്വേഷി';
    if (canonicalCompletedCount >= 18 || xp >= 180) return 'ആദർശാനുഭാവി';
    if (canonicalCompletedCount >= 6 || xp >= 60) return 'ആശയാഭിലാഷി';
    return 'വിജ്ഞാനാന്വേഷി';
  }, [xp, canonicalCompletedCount]);

  const handleAwardXp = useCallback(
    (amount: number, actionId: string) => {
      if (devUnlocked) return;
      setAwardedActions((prev) => {
        if (prev[actionId]) return prev;
        setXp((curr) => curr + amount);
        return { ...prev, [actionId]: true };
      });
    },
    [devUnlocked]
  );

  const handleQuizAnswered = useCallback(
    (lessonId: string, selectedIdx: number, isCorrect: boolean) => {
      if (devUnlocked) return;
      let isFirstTimeAnswer = false;
      setQuizAnswers((prev) => {
        if (prev[lessonId]) return prev;
        isFirstTimeAnswer = true;
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
        if (isFirstTimeAnswer) {
          setDailyState((d) =>
            recordGenuineDailyActivity({
              ...d,
              todayQuizzesCorrect: d.todayQuizzesCorrect + 1,
            })
          );
        }
      } else {
        // Deduct 1 global heart, play gentle heartbreak-to-header flight animation!
        // On 3rd mistake (lives === 0), open fair Heart Recovery revision challenge (restores 2 hearts)!
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
            }, 1300);
          }
          return nextLives;
        });
      }
    },
    [devUnlocked, handleAwardXp]
  );

  const handleUnlockBadge = (badge: string) => {
    if (devUnlocked) return;
    setBadges((prev) => (prev.includes(badge) ? prev : [...prev, badge]));
  };

  const handleClaimEasterEgg = (egg: EasterEggItem) => {
    sound.unlockAudio();
    sound.playUnlock();
    if (!devUnlocked && !collectedEggs.includes(egg.id)) {
      setCollectedEggs((prev) => [...prev, egg.id]);
      handleAwardXp(25, `easter_${egg.id}`);
      handleUnlockBadge(egg.badge);
    }
    setCelebrationEgg(egg);
    setGiftChestOpen(true);
    narrator.speak(egg.speech, `${egg.emoji} ${egg.title}`);
  };

  const handleCompleteLevel = (level: LevelNumber) => {
    // Secret map preview mode is strictly read-only: allows navigation without awarding completions/unlocks
    if (devUnlocked) {
      if (level < 4) {
        const next = (level + 1) as LevelNumber;
        setStage('world');
        setCurrentLevel(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    // Do not unlock subsequent levels or mark Level 4 complete when viewing via Guest Preview link
    if (isPreviewMode) return;
    if (level === 4 && canonicalCompletedCount < ALL_LESSONS.length) return;
    setCompletedLevels((prev) => (prev.includes(level) ? prev : [...prev, level]));
    if (level < 4) {
      const next = (level + 1) as LevelNumber;
      setUnlockedLevels((prev) => (prev.includes(next) ? prev : [...prev, next]));
      setStage('world');
      setCurrentLevel(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRecoverHearts = useCallback(() => {
    setLives(2);
    setHeartBreakEvent(null);
    setActiveFlightEvent(null);
    setGameOverOpen(false);
    sound.playSuccess(2);
  }, []);

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
    setActiveMilestone(null);
    try {
      localStorage.removeItem('skssf_milestones_seen_v1');
    } catch {
      // Ignore
    }
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
    setPreviewLessonId(null);
    setPrologueInitialLessonId('prologue_curiosity');
    setStoryboardInitialTab(undefined);
    setPovInitialTab(undefined);
    setL1InitialTab(undefined);
    setL2InitialTab(undefined);
    setL3InitialTab(undefined);
    setL4InitialTab(undefined);
    setLessonsMapOpen(false);
    setShowResumeToast(false);
    setActiveMilestone(null);
    try {
      localStorage.removeItem('skssf_milestones_seen_v1');
    } catch {
      // Ignore
    }
    setAttemptKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAllSavedData = async () => {
    clearAllAppStorage();
    displayPrefs.resetToDefaults();
    sound.resetToDefaults();
    await narrator.clearVoiceCache();
    setRunHistory([]);
    setRunNumber(1);
    setDailyState(loadDailyAndProfileState());
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

  const handleClaimDailyMission = useCallback(
    (missionId: string, rewardXp: number) => {
      setDailyState((prev) => {
        if (prev.claimedMissionsToday.includes(missionId)) return prev;
        handleAwardXp(rewardXp, `daily_${prev.todayDate}_${missionId}`);
        return {
          ...prev,
          claimedMissionsToday: [...prev.claimedMissionsToday, missionId],
        };
      });
    },
    [handleAwardXp]
  );

  const handleCompleteDailySpecialGame = useCallback(
    (gameScore: number, _maxScore: number, isTodayOfficial: boolean) => {
      setDailyState((prev) => {
        const bestScore = Math.max(prev.dailyGameBestScore ?? 0, gameScore);
        if (!isTodayOfficial) {
          return { ...prev, dailyGameBestScore: bestScore };
        }
        const alreadyDone = Boolean(
          prev.todaySpecialGameDone || prev.completedDailyGameDates?.includes(prev.todayDate)
        );
        if (!alreadyDone) {
          handleAwardXp(35, `daily_special_game_${prev.todayDate}`);
        }
        const nextCompletedDates = prev.completedDailyGameDates?.includes(prev.todayDate)
          ? prev.completedDailyGameDates
          : [...(prev.completedDailyGameDates || []), prev.todayDate].slice(-60);
        return recordGenuineDailyActivity({
          ...prev,
          todaySpecialGameDone: true,
          completedDailyGameDates: nextCompletedDates,
          dailyGameBestScore: bestScore,
        });
      });
    },
    [handleAwardXp]
  );

  const handleUpdateUnitProfile = useCallback((patch: Partial<UnitProfile>) => {
    setDailyState((prev) => {
      const lockedCert = prev.profile.lockedCertificateName?.trim();
      return {
        ...prev,
        profile: {
          ...prev.profile,
          playerName: lockedCert
            ? lockedCert
            : patch.playerName !== undefined
            ? patch.playerName.slice(0, 60)
            : prev.profile.playerName,
          unitName: patch.unitName !== undefined ? patch.unitName.slice(0, 60) : prev.profile.unitName,
          mekhalaName:
            patch.mekhalaName !== undefined ? patch.mekhalaName.slice(0, 60) : prev.profile.mekhalaName,
          ...(lockedCert ? { lockedCertificateName: lockedCert } : {}),
        },
      };
    });
  }, []);

  const handleRestoreFromBackup = useCallback(() => {
    const restored = loadSavedGameState();
    setRunHistory(loadRunHistory());
    setDailyState(loadDailyAndProfileState());
    if (restored) {
      const targetLesson = ALL_LESSONS.find((l) => l.id === restored.activeLessonId);
      if (targetLesson) {
        if (targetLesson.stage === 'prologue') {
          setPrologueInitialLessonId(targetLesson.id);
        } else if (targetLesson.stage === 'storyboard') {
          setStoryboardInitialTab(targetLesson.tab);
        } else if (targetLesson.stage === 'pov') {
          setPovInitialTab(targetLesson.tab ?? targetLesson.id);
        } else if (targetLesson.stage === 'world' && targetLesson.level && targetLesson.tab) {
          if (targetLesson.level === 1) setL1InitialTab(targetLesson.tab as L1Tab);
          if (targetLesson.level === 2) setL2InitialTab(targetLesson.tab as L2GameTab);
          if (targetLesson.level === 3) setL3InitialTab(targetLesson.tab as L3Tab);
          if (targetLesson.level === 4) setL4InitialTab(targetLesson.tab as L4Tab);
        }
      }
      setStage(restored.stage);
      setCurrentLevel(restored.currentLevel);
      setActiveLessonId(restored.activeLessonId);
      setXp(restored.xp);
      const actionMap: Record<string, boolean> = {};
      restored.awardedActions.forEach((a) => {
        actionMap[a] = true;
      });
      setAwardedActions(actionMap);
      setBadges(restored.badges);
      setUnlockedLevels(restored.unlockedLevels as LevelNumber[]);
      setCompletedLevels(restored.completedLevels as LevelNumber[]);
      setCompletedLessonIds(restored.completedLessonIds);
      setCollectedEggs(restored.collectedEggs);
      setQuizAnswers(restored.quizAnswers);
      setLives(restored.lives);
      setRunNumber(restored.runNumber);
      setPreviewLessonId(null);
      setShowIntro(false);
      setLessonJumpSeq((s) => s + 1);
      setAttemptKey((k) => k + 1);
    }
  }, []);

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
      <header className="sticky top-0 z-40 bg-white [transform:translateZ(0)] border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 py-1.5 sm:py-2 flex flex-nowrap items-center justify-between gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              sound.playClick();
              setAboutModalOpen(true);
            }}
            aria-label="ഗൈഡ് ഗെയിം — ഹോം & വിവരണം"
            title="ഗൈഡ് ഗെയിം (Guide Game)"
            className="inline-flex items-center gap-2 text-left shrink-0 min-h-[40px] rounded-xl hover:opacity-90 active:scale-95 transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <GuideGameBrandLogo size="sm" />
          </button>

          <div className="flex flex-nowrap items-center justify-end gap-1 sm:gap-1.5 min-w-0 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* ALWAYS-VISIBLE TOP 3 HEARTS (❤️ ❤️ ❤️) */}
            <div className="shrink-0">
              <HeaderHeartsBar />
            </div>

            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playPop();
                setDailyModalOpen(true);
              }}
              aria-label="ദിന സ്ട്രീക്കും ഇന്നത്തെ സ്പെഷ്യൽ ഗെയിമും"
              title="ദിന സ്ട്രീക്കും സ്പെഷ്യൽ ഗെയിമും"
              className={`inline-flex items-center justify-center gap-1 h-10 min-w-[40px] px-2 sm:px-2.5 rounded-lg border text-[11px] sm:text-xs font-extrabold tabular-nums whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 notranslate ${
                dailyState.todaySpecialGameDone
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
                  : 'border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>{dailyState.streakDays}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playClick();
                setScoreModalOpen(true);
              }}
              aria-label="എന്റെ പഠന പുരോഗതി"
              title="എന്റെ പഠന പുരോഗതി"
              className="inline-flex items-center justify-center gap-1 h-10 min-w-[40px] px-2 sm:px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-950 text-[11px] sm:text-xs font-extrabold hover:bg-emerald-100 tabular-nums whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 notranslate"
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
              title="എന്റെ ഫോട്ടോ ബാഡ്ജ്"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-amber-400 bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-xs shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
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
                title="കണ്ടെത്തിയ സർപ്രൈസ് സമ്മാനങ്ങൾ"
                className="inline-flex items-center justify-center gap-1 h-10 min-w-[40px] px-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 text-xs font-extrabold hover:bg-amber-100 tabular-nums whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>{collectedEggs.length}</span>
              </button>
            )}

            {/* OFFICIAL LOGOS, WINGS & LINKS REFERENCE HUB BUTTON */}
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playClick();
                setResourceHubOpen(true);
              }}
              aria-label="ലോഗോ ഗൈഡും ഔദ്യോഗിക ലിങ്കുകളും"
              title="ലോഗോ ഗൈഡും ഔദ്യോഗിക ലിങ്കുകളും"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <BookOpen className="w-4 h-4" />
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
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? 'ശബ്ദം ഓൺ ചെയ്യുക' : 'ശബ്ദം മ്യൂട്ട് ചെയ്യുക'}
              title={muted ? 'ശബ്ദം ഓൺ ചെയ്യുക' : 'ശബ്ദം മ്യൂട്ട് ചെയ്യുക'}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
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

      {/* Offline Mode Indicator Banner */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="bg-amber-50 border-b border-amber-300 px-3 py-1.5 text-center text-[11px] sm:text-xs font-extrabold text-amber-950 flex items-center justify-center gap-1.5"
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>ഓഫ്‌ലൈൻ മോഡ് — സേവ് ചെയ്ത പാഠങ്ങളും ഗെയിമുകളും ഇന്റർനെറ്റില്ലാതെ തുടരാം</span>
        </div>
      )}

      {/* Non-blocking Floating Top-Right Audio Loader */}
      <AudioLoadingFloatBadge />

      {/* Main Game Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-24 sm:pb-20">
        {!showIntro && showResumeToast && (
          <div className="mb-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 flex items-center justify-between gap-2 text-xs font-bold text-emerald-950">
            <span className="tabular-nums notranslate min-w-0 break-words">
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
          <AppErrorBoundary onReset={() => setLessonsMapOpen(false)}>
            <Suspense fallback={<StageLoadingFallback />}>
              <AllLessonsMapPage
                activeLessonId={activeLessonId}
                completedLessonIds={completedLessonIds}
                devUnlocked={devUnlocked}
                onSetDevUnlocked={setDevUnlocked}
                onSelectLesson={handleJumpToLesson}
                onClose={() => setLessonsMapOpen(false)}
              />
            </Suspense>
          </AppErrorBoundary>
        ) : showIntro ? (
          <WelcomeIntroScreen
            xp={xp}
            completedCount={canonicalCompletedCount}
            totalLessons={ALL_LESSONS.length}
            activeLessonTitle={activeLessonTitle}
            streakDays={dailyState.streakDays}
            todaySpecialGameDone={Boolean(dailyState.todaySpecialGameDone)}
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
            onOpenDailyChallenge={() => {
              sound.unlockAudio();
              sound.playPop();
              setDailyModalOpen(true);
            }}
            onOpenSupport={() => {
              sound.unlockAudio();
              sound.playClick();
              setSupportModalOpen(true);
            }}
          />
        ) : (
          <>
            {activeMilestone && (() => {
              const meta = STAGE_MILESTONE_LABELS[activeMilestone] ?? {
                title: `${activeMilestone} പാഠങ്ങൾ പൂർത്തിയാക്കി!`,
                badgePreset: 'starter_member',
              };
              const shareText = `🏆 SKSSF ഗൈഡ് ഗെയിമിൽ ഞാൻ "${meta.title}" (${activeMilestone}/${ALL_LESSONS.length} പാഠങ്ങൾ · ${xp} XP · ${currentRank})! നിങ്ങളും കളിച്ചു പഠിക്കൂ 👉`;
              const whatsappHref = getWhatsAppShareHref(shareText, getAppShareUrl());
              return (
                <div className="mb-3 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 text-white p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-amber-300 leading-snug break-words">
                        അഭിനന്ദനങ്ങൾ! {meta.title} ({activeMilestone}/{ALL_LESSONS.length})
                      </p>
                      <p className="text-xs text-emerald-50 font-medium leading-snug mt-0.5 break-words">
                        നിങ്ങളുടെ നേട്ടം ({xp} XP · {currentRank}) വാട്സ്ആപ്പിൽ ഷെയർ ചെയ്യാം അല്ലെങ്കിൽ ഫോട്ടോ ബാഡ്ജ് നിർമ്മിക്കാം.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sound.playPop()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer"
                    >
                      WhatsApp ഷെയർ
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        sound.unlockAudio();
                        sound.playPop();
                        setBadgeStudioPreset(meta.badgePreset);
                        setBadgeStudioOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
                    >
                      ഫോട്ടോ ബാഡ്ജ്
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        sound.playClick();
                        const ok = await copyAppShareLink();
                        if (ok) {
                          setMilestoneShareCopied(true);
                          window.setTimeout(() => setMilestoneShareCopied(false), 2200);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold cursor-pointer"
                    >
                      {milestoneShareCopied ? 'കോപ്പി ചെയ്തു!' : 'ലിങ്ക്'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMilestone(null)}
                      aria-label="അടയ്ക്കുക"
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {!isPreviewMode && (
              <UnseenLessonBanner
                unseenLessons={skippedUnseenBefore}
                onJumpToLesson={handleJumpToLesson}
              />
            )}

            <LessonWorkspaceFrame
              completedCount={canonicalCompletedCount}
              totalLessons={ALL_LESSONS.length}
              isPreviewMode={isPreviewMode}
              nextSequentialLesson={nextSequentialLesson}
              onReturnToMyProgress={() => handleJumpToLesson(nextSequentialLesson.id)}
            >
            <AppErrorBoundary onReset={() => setAttemptKey((k) => k + 1)}>
            <Suspense fallback={<StageLoadingFallback />}>
            {stage === 'prologue' && (
              <StoryPrologueTheater
                key={`prologue_${attemptKey}_${lessonJumpSeq}`}
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
                key={`pov_${attemptKey}_${lessonJumpSeq}`}
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
                key={`storyboard_${attemptKey}_${lessonJumpSeq}`}
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
                    key={`l1_${attemptKey}_${lessonJumpSeq}`}
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
                    key={`l2_${attemptKey}_${lessonJumpSeq}`}
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
                    key={`l3_${attemptKey}_${lessonJumpSeq}`}
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
                    key={`l4_${attemptKey}_${lessonJumpSeq}`}
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
                    onOpenSupport={() => setSupportModalOpen(true)}
                  />
                )}
              </>
            )}
            </Suspense>
            </AppErrorBoundary>
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
                      const lvlEmoji = lvl.id === 1 ? '⛵' : lvl.id === 2 ? '🏛️' : lvl.id === 3 ? '🎈' : '🗼';
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
        xp={xp}
        onResetProgress={handleResetCurrentGame}
        onClearAllData={handleClearAllSavedData}
        onRestoreBackup={handleRestoreFromBackup}
        onOpenSupport={() => setSupportModalOpen(true)}
        onOpenLegal={() => setLegalModalOpen(true)}
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
        dailyState={dailyState}
        onClaimMission={handleClaimDailyMission}
        onUpdateUnitProfile={handleUpdateUnitProfile}
      />
      {dailyModalOpen && (
        <Suspense fallback={null}>
          <DailyChallengeModal
            isOpen={dailyModalOpen}
            onClose={() => setDailyModalOpen(false)}
            dailyState={dailyState}
            onCompleteSpecialGame={handleCompleteDailySpecialGame}
            onClaimMission={handleClaimDailyMission}
          />
        </Suspense>
      )}
      {badgeStudioOpen && (
        <Suspense fallback={null}>
          <ShareableBadgeStudio
            isOpen={badgeStudioOpen}
            onClose={() => setBadgeStudioOpen(false)}
            xp={xp}
            rank={currentRank}
            streakDays={dailyState.streakDays}
            initialBadgeId={badgeStudioPreset}
            completedLessonIds={completedLessonIds}
            completedLevels={completedLevels}
            awardedActions={awardedActions}
            profile={dailyState.profile}
            onUpdateUnitProfile={handleUpdateUnitProfile}
            onOpenSupport={() => setSupportModalOpen(true)}
          />
        </Suspense>
      )}
      <SurpriseGiftChestModal
        isOpen={giftChestOpen}
        onClose={() => setGiftChestOpen(false)}
        collectedEggIds={collectedEggs}
        activeCelebrationEgg={celebrationEgg}
      />

      {/* CENTER-TO-HEADER HEART-BREAK FLIGHT ANIMATION */}
      <HeartBreakFlightOverlay
        event={activeFlightEvent}
        onComplete={() => setActiveFlightEvent(null)}
      />

      {/* FAIR HEART RECOVERY MODAL (2-Question Revision Restores 2 Hearts!) */}
      <GameOverResetModal
        isOpen={gameOverOpen}
        onRestartFromStart={handleResetCurrentGame}
        onRecoverHearts={handleRecoverHearts}
        onOpenSupport={() => setSupportModalOpen(true)}
      />

      <SupportDeveloperModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />

      <LegalPrivacyModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
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
        onOpenSupport={() => setSupportModalOpen(true)}
        completedCount={canonicalCompletedCount}
        totalLessons={ALL_LESSONS.length}
        xp={xp}
      />

      {resourceHubOpen && (
        <Suspense fallback={null}>
          <OfficialResourceHubModal
            isOpen={resourceHubOpen}
            onClose={() => setResourceHubOpen(false)}
            onAwardXp={handleAwardXp}
          />
        </Suspense>
      )}

      <footer className="border-t border-slate-200 bg-white pt-4 pb-20 sm:py-5 px-4 sm:px-6 text-center text-xs text-slate-500 space-y-2">
        <p className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
          <span>ഗൈഡ് ഗെയിം (Guide Game) · SKSSF · “വിജ്ഞാനം, വിനയം, സേവനം”</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              sound.playClick();
              setLegalModalOpen(true);
            }}
            className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold underline underline-offset-4 transition-colors cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>സ്വകാര്യത, നിബന്ധനകൾ &amp; കോപ്പിറൈറ്റ്</span>
          </button>
          {!isInstalled && (isInstallable || isIOS) && (
            <>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={async () => {
                  sound.unlockAudio();
                  sound.playPop();
                  if (isInstallable) {
                    await install();
                  } else if (isIOS) {
                    setFooterIosHint((v) => !v);
                  }
                }}
                className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-extrabold underline underline-offset-4 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ആപ്പ് ഇൻസ്റ്റാൾ</span>
              </button>
            </>
          )}
          {!(showIntro && !lessonsMapOpen) && (
            <>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => {
                  sound.unlockAudio();
                  sound.playClick();
                  setSupportModalOpen(true);
                }}
                className="text-amber-800 hover:text-emerald-900 font-bold underline underline-offset-4 transition-colors cursor-pointer"
              >
                🎁 ഒരു ഹദിയ നൽകാം
              </button>
            </>
          )}
        </p>
        {footerIosHint && isIOS && !isInstalled && (
          <p className="max-w-md mx-auto text-[11px] font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            Safari-യിൽ താഴെയുള്ള <strong>Share (↑)</strong> തൊട്ട്{' '}
            <strong>“Add to Home Screen”</strong> തിരഞ്ഞെടുത്താൽ ഓഫ്‌ലൈൻ ആപ്പായി ഇൻസ്റ്റാൾ ആകും.
          </p>
        )}
      </footer>
      <FloatingPageNavigator visible={!lessonsMapOpen && !showIntro && !isAnyModalOpen} />
    </div>
    </LessonFlowProvider>
    </GameLivesProvider>
  );
}
