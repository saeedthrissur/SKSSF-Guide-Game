import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Backpack,
  CheckCircle2,
  MapPin,
  Shield,
  Smartphone,
  Volume2,
} from 'lucide-react';
import { LessonDescriptor } from '../utils/lessonTracker';
import {
  HIERARCHY_NODES,
  SOCIAL_ETHICS_CASES,
  STRATEGY_SCENARIOS,
} from '../data/level4Data';
import { CertificateGenerator } from './CertificateGenerator';
import {
  AnimatedGiraffeMascot,
  CollapsibleLessonDrawer,
  DriftingCloudsAndSun,
  EasterEggItem,
  EasterEggSpot,
  FloatingSparkleField,
  FlutteringFlagPole,
  GlitterBurstOverlay,
  LessonProgressTrack,
  LessonStepperNav,
  SwayingGardenPlants,
} from './GameEffects';
import { LessonCheckQuiz, scrollToActiveQuiz } from './LessonCheckQuiz';
import { GameFullscreenShell } from './GameFullscreenShell';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import { ViqayaRescueVehicleActivity } from './InteractiveMiniGames';
import { MiniGameLessonKey, OptionalLessonMiniGame } from './OptionalLessonMiniGames';
import { QuizAnswerMap } from '../utils/gameStorage';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { OFFICIAL_WING_LOGOS } from '../data/officialLogos';
import { OFFICIAL_PDF_GUIDES, getLinksForLesson } from '../data/officialLinks';
import { InlineOfficialLinksStrip } from './OfficialResourceHubModal';
import { SamasthaMediaStudioGame, SamasthaPortalRouterGame } from './PortalAndMediaGames';

export type L4Tab =
  | 'climb'
  | 'viqaya_van'
  | 'compass'
  | 'bag'
  | 'crisis'
  | 'cyber_shield'
  | 'sahachari'
  | 'trend_career'
  | 'sargalayam'
  | 'green_earth'
  | 'samastha_portals'
  | 'media_youtube_hub'
  | 'certificate';

interface Level4StrategyProps {
  xp: number;
  rank: string;
  badges: string[];
  isCompleted: boolean;
  onAwardXp: (amount: number, actionId: string) => void;
  onUnlockBadge: (badge: string) => void;
  onCompleteLevel: () => void;
  collectedEggs?: string[];
  onClaimEasterEgg?: (egg: EasterEggItem) => void;
  initialTab?: L4Tab;
  unseenLessons?: LessonDescriptor[];
  onJumpToLesson?: (lessonId: string) => void;
  onActiveLessonChange?: (lessonId: string) => void;
  onMarkLessonCompleted?: (lessonId: string) => void;
  completedLessonIds?: string[];
  quizAnswers: QuizAnswerMap;
  onQuizAnswered: (lessonId: string, selectedIdx: number, isCorrect: boolean) => void;
  onOpenBadgeStudio?: (presetBadgeId: string) => void;
  devUnlocked?: boolean;
}

const EVENT_GEAR: {
  id: string;
  emoji: string;
  label: string;
  isGood: boolean;
  reason: string;
  speech: string;
}[] = [
  {
    id: 'g1',
    emoji: '💰',
    label: '10–15% കരുതൽ തുക (Buffer Fund)',
    isGood: true,
    reason: 'പെട്ടെന്ന് വരുന്ന ചെലവുകൾക്കായി 10–15% കരുതൽ തുക ബാഗിൽ വെക്കണം!',
    speech: 'കരുതൽ തുക! പെട്ടെന്ന് വരുന്ന ചെലവുകൾക്കായി പത്ത് മുതൽ പതിനഞ്ച് ശതമാനം വരെ കരുതൽ തുക ബാഗിൽ വെക്കണം!',
  },
  {
    id: 'g2',
    emoji: '🚒',
    label: 'പോലീസ് & ഫയർ NOC അനുമതി',
    isGood: true,
    reason: 'മൈക്ക് വെക്കാൻ പോലീസ് അനുമതിയും വലിയ പന്തലിന് ഫയർ & റെസ്ക്യൂ NOC-യും നിർബന്ധമാണ്!',
    speech: 'പോലീസ് ഫയർ എൻ ഓ സി! മൈക്ക് വെക്കാൻ പോലീസ് അനുമതിയും പന്തലിന് ഫയർ ആൻഡ് റെസ്ക്യൂ എൻ ഓ സിയും നിർബന്ധമാണ്!',
  },
  {
    id: 'g3',
    emoji: '⏰',
    label: 'അവസാന നിമിഷ പ്ലാനിംഗ്',
    isGood: false,
    reason:
      'സൂക്ഷിക്കണേ! അവസാന നിമിഷത്തേക്ക് വെക്കരുത്! മുൻപേ എന്ത്, എന്തിന്, എപ്പോൾ, എവിടെ, ആര് എന്നീ 5 കാര്യങ്ങൾ തയ്യാറാക്കണം!',
    speech:
      'അവസാന നിമിഷത്തേക്ക് വെക്കരുത് കൂട്ടുകാരേ! മുൻപേ എന്ത്, എന്തിന്, എപ്പോൾ, എവിടെ, ആര് എന്നീ അഞ്ച് ചോദ്യങ്ങളും കൃത്യമായി പ്ലാൻ ചെയ്യണം!',
  },
  {
    id: 'g4',
    emoji: '🌱',
    label: 'ഗ്രീൻ പ്രോട്ടോക്കോൾ & ജനറേറ്റർ',
    isGood: true,
    reason: 'വൃത്തിയും പ്ലാസ്റ്റിക് ഇല്ലാത്ത ഗ്രീൻ പ്രോട്ടോക്കോളും കറന്റ് പോയാൽ ജനറേറ്ററും പ്രധാനമാണ്!',
    speech: 'ഗ്രീൻ പ്രോട്ടോക്കോളും ജനറേറ്ററും! വൃത്തിയും പ്ലാസ്റ്റിക് ഇല്ലാത്ത പരിസരവും കറന്റ് പോയാൽ ജനറേറ്ററും പ്രധാനമാണ്!',
  },
  {
    id: 'g5',
    emoji: '🎙️',
    label: 'പ്രഭാഷകനെ ലക്ഷ്യം മുൻകൂട്ടി അറിയിക്കൽ',
    isGood: true,
    reason: 'പ്രസംഗിക്കുന്ന ഉസ്താദിനോടും പ്രഭാഷകനോടും വിഷയവും സമയവും നേരത്തെ പറയണം!',
    speech: 'പ്രഭാഷകനെ നേരത്തെ അറിയിക്കണം! വിഷയവും സമയവും മുൻകൂട്ടി പറഞ്ഞാലേ പരിപാടി ലക്ഷ്യത്തിലെത്തൂ!',
  },
];

const STRATEGY_FLASH_CARDS = [
  {
    id: 'sf1',
    emoji: '📋',
    tag: 'ഇവന്റ് സൂത്രം',
    title: '5 ചോദ്യങ്ങൾ + കരുതൽ തുക',
    front: 'എന്ത് · എന്തിന് · എപ്പോൾ · എവിടെ · ആര്',
    back: 'പരിപാടി തുടങ്ങുന്നതിന് മുൻപ് ഈ 5 ചോദ്യങ്ങൾക്ക് ഉത്തരം കണ്ടെത്തണം! ചെലവിനൊപ്പം 10–15% കരുതൽ തുക (Buffer Fund), പോലീസ്-ഫയർ NOC, പ്ലാസ്റ്റിക് ഇല്ലാത്ത ഗ്രീൻ പ്രോട്ടോക്കോൾ എന്നിവയും ഉറപ്പാക്കണം.',
    speech:
      'ഇവന്റ് സൂത്രം! എന്ത്, എന്തിന്, എപ്പോൾ, എവിടെ, ആര് എന്നീ അഞ്ച് ചോദ്യങ്ങൾക്ക് മുൻപേ ഉത്തരം കണ്ടെത്തണം. പത്ത് മുതൽ പതിനഞ്ച് ശതമാനം കരുതൽ തുകയും പോലീസ് ഫയർ അനുമതിയും ഗ്രീൻ പ്രോട്ടോക്കോളും ഉറപ്പാക്കണം!',
  },
  {
    id: 'sf2',
    emoji: '🤝',
    tag: 'പ്രതിസന്ധി സൂത്രം',
    title: 'നേതാവ്–പദ്ധതി–ആശയവിനിമയം (LPC)',
    front: 'സ്നേഹബന്ധങ്ങൾക്ക് പ്രശസ്തിയേക്കാൾ മുൻഗണന',
    back: 'ഒരു പ്രശ്നം വന്നാൽ ഫോൺ സ്വിച്ച് ഓഫ് ചെയ്തു ഓടരുത്! പേടിക്കാതെ, വ്യക്തമായ നേതാവ് (Leader), പദ്ധതി (Plan), ടീം ആശയവിനിമയം (Communicate) എന്നിവ വഴി ഉടനെ പരിഹരിക്കുക. കൂട്ടുകാരെ കുറ്റപ്പെടുത്താതെ ഒന്നിച്ചു നിൽക്കുക!',
    speech:
      'പ്രതിസന്ധി സൂത്രം, എൽ പി സി! ഒരു പ്രശ്നം വന്നാൽ ഫോൺ സ്വിച്ച് ഓഫ് ചെയ്യരുത്. പതറാതെ നേതാവ്, പദ്ധതി, ആശയവിനിമയം എന്ന വഴിയിലൂടെ ഉടനെ പരിഹാരം കാണണം. കൂട്ടുകാരെ കുറ്റപ്പെടുത്താതെ സ്നേഹത്തോടെ ഒന്നിച്ചു നിൽക്കണം!',
  },
  {
    id: 'sf3',
    emoji: '🦒',
    tag: 'ടീം & പുതിയ തലമുറ',
    title: 'ജിറാഫ് & ഏണി + 10 ടീം തത്വങ്ങൾ',
    front: 'ഉപകാരപ്രദം · അർത്ഥപൂർണ്ണം · ഫലപ്രദം',
    back: 'ജിറാഫിനെപ്പോലെ ദൂരക്കാഴ്ചയോടെ നോക്കുകയും താഴേക്കിറങ്ങി കൂട്ടുകാരുടെ കൂടെ നിൽക്കുകയും ചെയ്യുക! മറ്റുള്ളവരെ ഉയർത്തുന്ന ഏണിയാകുക (Ladder). ചെറിയ വിജയങ്ങൾ ആഘോഷിക്കുകയും നീറ്റ് സമര മാതൃകയിൽ Gen Z കൂട്ടുകാരെ ചേർത്തുനിർത്തുകയും ചെയ്യുക!',
    speech:
      'ജിറാഫും ഏണിയും! ജിറാഫിനെപ്പോലെ ദൂരക്കാഴ്ചയോടെ കാണുകയും താഴേക്കിറങ്ങി കൂട്ടുകാരോട് സ്നേഹത്തോടെ സംസാരിക്കുകയും ചെയ്യുക. കൂടെയുള്ളവരെ മുകളിലേക്ക് കയറ്റുന്ന ഏണിയാകുക. നീറ്റ് സമരത്തിലെ പോലെ പുതിയ തലമുറയെ ചേർത്തുനിർത്തുക!',
  },
];

const CYBER_RULES = [
  '👥 1. ഓഡിയൻസ് ആദ്യം (ആരോടാണ് പറയുന്നത് എന്ന് അറിയുക)',
  '🏠 2. സ്വന്തം പ്ലാറ്റ്‌ഫോം ആദ്യം (വഴക്കുള്ള കമന്റിൽ പോകരുത്)',
  '🎬 3. നല്ല കണ്ടന്റ് (രസകരമായ റീലുകൾ, ഇൻഫോഗ്രാഫിക്സ്)',
  '📦 4. തർക്കുൽ മാലായഅ്നി (പിണങ്ങാതെ ഗ്രൂപ്പ് Archive ചെയ്യുക)',
];

const TIER_EMOJIS = ['🏡', '🏘️', '🗺️', '🌴', '🏛️', '🇮🇳', '🌍'];

export const Level4Strategy: React.FC<Level4StrategyProps> = ({
  xp,
  rank,
  badges,
  isCompleted,
  onAwardXp,
  onUnlockBadge,
  onCompleteLevel,
  collectedEggs = [],
  onClaimEasterEgg,
  initialTab,
  unseenLessons = [],
  onJumpToLesson,
  onActiveLessonChange,
  onMarkLessonCompleted,
  completedLessonIds = [],
  quizAnswers,
  onQuizAnswered,
  onOpenBadgeStudio,
  devUnlocked = false,
}) => {
  const [activeTab, setActiveTab] = useState<L4Tab>(initialTab || 'climb');
  const [selectedTierId, setSelectedTierId] = useState(HIERARCHY_NODES[0].id);
  const [exploredTiers, setExploredTiers] = useState<string[]>(['unit']);
  const [glitterKey, setGlitterKey] = useState(0);
  const [glitterMsg, setGlitterMsg] = useState('');

  // Single-Spotlight Leadership Compass
  const [activeCompassIdx, setActiveCompassIdx] = useState<number>(0);
  const [exploredCompassIds, setExploredCompassIds] = useState<string[]>(['sf1']);

  // Event Backpack Drag & Drop
  const [packedGear, setPackedGear] = useState<string[]>([]);
  const [gearMsg, setGearMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [draggedGearId, setDraggedGearId] = useState<string | null>(null);

  // Crisis Stepper
  const [crisisIdx, setCrisisIdx] = useState(0);
  const [solvedCrisis, setSolvedCrisis] = useState<string[]>([]);
  const [crisisFb, setCrisisFb] = useState<{ ok: boolean; text: string } | null>(null);
  const [crisisMistakes, setCrisisMistakes] = useState(0);
  const crisisFailed = crisisMistakes >= 3 && solvedCrisis.length < STRATEGY_SCENARIOS.length;

  // Cyber Shield Single-Phone Feed Simulator
  const [activeSocialIdx, setActiveSocialIdx] = useState(0);
  const [solvedSocial, setSolvedSocial] = useState<string[]>([]);
  const [socialFb, setSocialFb] = useState<Record<string, { ok: boolean; text: string }>>({});
  const [cyberToast, setCyberToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [cyberMistakes, setCyberMistakes] = useState(0);
  const cyberFailed = cyberMistakes >= 3 && solvedSocial.length < SOCIAL_ETHICS_CASES.length;
  const [completedSceneGames, setCompletedSceneGames] = useState<string[]>([]);

  const selectedTierIndex = Math.max(
    0,
    HIERARCHY_NODES.findIndex((n) => n.id === selectedTierId)
  );
  const selectedTier = HIERARCHY_NODES[selectedTierIndex] || HIERARCHY_NODES[0];
  const activeCrisis = STRATEGY_SCENARIOS[crisisIdx];
  const activeCompass = STRATEGY_FLASH_CARDS[activeCompassIdx] || STRATEGY_FLASH_CARDS[0];
  const activeSocial = SOCIAL_ETHICS_CASES[activeSocialIdx] || SOCIAL_ETHICS_CASES[0];

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab !== 'certificate') {
      onActiveLessonChange?.(`l4_${activeTab}`);
    } else {
      onActiveLessonChange?.('l4_green_earth');
    }
  }, [activeTab, onActiveLessonChange]);

  useEffect(() => {
    if (exploredTiers.length >= 3 && Boolean(quizAnswers.l4_climb)) {
      onMarkLessonCompleted?.('l4_climb');
    }
  }, [exploredTiers.length, quizAnswers.l4_climb, onMarkLessonCompleted]);

  useEffect(() => {
    if (completedSceneGames.includes('l4_viqaya_van') && Boolean(quizAnswers.l4_viqaya_van)) {
      onMarkLessonCompleted?.('l4_viqaya_van');
    }
  }, [completedSceneGames, quizAnswers.l4_viqaya_van, onMarkLessonCompleted]);

  useEffect(() => {
    if (
      exploredCompassIds.length >= 2 &&
      completedSceneGames.includes('l4_compass') &&
      Boolean(quizAnswers.l4_compass)
    ) {
      onMarkLessonCompleted?.('l4_compass');
    }
  }, [exploredCompassIds.length, completedSceneGames, quizAnswers.l4_compass, onMarkLessonCompleted]);

  useEffect(() => {
    if (packedGear.length >= 4 && Boolean(quizAnswers.l4_bag)) {
      onMarkLessonCompleted?.('l4_bag');
    }
  }, [packedGear.length, quizAnswers.l4_bag, onMarkLessonCompleted]);

  useEffect(() => {
    if (
      solvedCrisis.length >= 2 &&
      completedSceneGames.includes('l4_crisis') &&
      Boolean(quizAnswers.l4_crisis)
    ) {
      onMarkLessonCompleted?.('l4_crisis');
    }
  }, [solvedCrisis.length, completedSceneGames, quizAnswers.l4_crisis, onMarkLessonCompleted]);

  useEffect(() => {
    if (
      solvedSocial.length >= 3 &&
      completedSceneGames.includes('l4_cyber_shield') &&
      Boolean(quizAnswers.l4_cyber_shield)
    ) {
      onMarkLessonCompleted?.('l4_cyber_shield');
    }
  }, [solvedSocial.length, completedSceneGames, quizAnswers.l4_cyber_shield, onMarkLessonCompleted]);

  useEffect(() => {
    ([
      'l4_sahachari',
      'l4_trend_career',
      'l4_sargalayam',
      'l4_green_earth',
      'l4_samastha_portals',
      'l4_media_youtube_hub',
    ] as const).forEach((lid) => {
      if (quizAnswers[lid]) {
        onMarkLessonCompleted?.(lid);
      }
    });
  }, [quizAnswers, onMarkLessonCompleted]);

  useEffect(() => {
    if (activeTab === 'climb') {
      narrator.speak(
        'ആഗോള ഗോപുരം! യൂണിറ്റ് മുതൽ ഗ്ലോബൽ, എസ് ഐ സി വരെയുള്ള ഏഴ് പടികളും ചവിട്ടിക്കയറൂ കൂട്ടുകാരേ!',
        '🗼 ആഗോള ഗോപുരം'
      );
    } else if (activeTab === 'viqaya_van') {
      narrator.speak(
        'വിഖായ ആഗോള സേവന വാഹനം! ദുരന്തമുഖങ്ങളിലും മക്കയിലും മദീനയിലും ഹാജിമാർക്കും സഹായം എത്തിക്കുന്ന വിഖായ വാഹനം ഒരുക്കൂ!',
        '🚑 വിഖായ വാഹനം'
      );
    } else if (activeTab === 'compass') {
      narrator.speak(
        'നേതൃത്വ കോമ്പസ് സൂത്രങ്ങൾ! ഇവന്റ് സൂത്രം, പ്രതിസന്ധി സൂത്രം, ജിറാഫും ഏണിയും എന്നിവ ഓരോന്നായി പഠിക്കാം!',
        '🧭 നേതൃത്വ കോമ്പസ്'
      );
    } else if (activeTab === 'bag') {
      narrator.speak(
        'സമ്മേളന ബാഗ് ഗെയിം! ഒരു നല്ല പരിപാടിക്ക് ആവശ്യമായ ശരിയായ നാല് സാമഗ്രികൾ ബാഗിലേക്ക് ഇടൂ!',
        '🎒 സമ്മേളന ബാഗ്'
      );
    } else if (activeTab === 'crisis') {
      narrator.speak(
        'സാഹസിക നേതൃത്വ വെല്ലുവിളി! പ്രതിസന്ധി വരുമ്പോൾ ശരിയായ തീരുമാനം എടുത്ത് വിജയിക്കൂ!',
        '🎭 സാഹസിക വെല്ലുവിളി'
      );
    } else if (activeTab === 'cyber_shield') {
      narrator.speak(
        'സൈബർ ഷീൽഡ് ഡിഫൻസ്! സോഷ്യൽ മീഡിയയിലെ പ്രകോപന കെണികളിൽ നിന്ന് രക്ഷപ്പെടാൻ ശരിയായ കവചം തിരഞ്ഞെടുക്കൂ!',
        '📱 സൈബർ ഷീൽഡ്'
      );
    } else if (activeTab === 'sahachari') {
      narrator.speak(
        'സഹചാരി റിലീഫ് സെൽ! രോഗികൾക്കും നിർധനർക്കും ജാതി-മത ഭേദമന്യേ കാരുണ്യ സേവനം എത്തിക്കുന്ന സഹചാരിയെ അടുത്തറിയാം!',
        '🤝 സഹചാരി റിലീഫ് സെൽ'
      );
    } else if (activeTab === 'trend_career') {
      narrator.speak(
        'ട്രെൻഡ് കരിയർ വഴികാട്ടി! ഉന്നത വിദ്യാഭ്യാസത്തിനും സിവിൽ സർവീസ് സ്വപ്നങ്ങൾക്കും കൈത്താങ്ങാകുന്ന ട്രെൻഡിനെ പരിചയപ്പെടാം!',
        '🎓 ട്രെൻഡ് & കരിയർ'
      );
    } else if (activeTab === 'sargalayam') {
      narrator.speak(
        'സർഗ്ഗലയം കലാവേദി! ധാർമ്മിക മൂല്യങ്ങളോടെ എഴുത്തും പ്രസംഗവും ഇസ്‌ലാമിക കലകളും വളർത്തുന്ന സർഗ്ഗലയത്തിലേക്ക് സ്വാഗതം!',
        '🎨 സർഗ്ഗലയം'
      );
    } else if (activeTab === 'green_earth') {
      narrator.speak(
        'ഹരിത ക്യാമ്പസും പരിസ്ഥിതി സംരക്ഷണവും! മരങ്ങൾ നട്ടും പ്ലാസ്റ്റിക് ഒഴിവാക്കിയും പ്രവാചക മാതൃക ജീവിതത്തിൽ പകർത്താം!',
        '🌿 ഹരിത ക്യാമ്പസ്'
      );
    } else if (activeTab === 'samastha_portals') {
      narrator.speak(
        'സമസ്തയുടെ വിദ്യാഭ്യാസ ശൃംഖലയും ഔദ്യോഗിക പോർട്ടലുകളും! SNEC, CSWC, അൽബിർ, സമസ്ത ഇ-ലേണിംഗ്, ജാമിഅ നൂരിയ്യ എന്നിവയുടെ ഔദ്യോഗിക സൈറ്റുകളിലേക്ക് വിദ്യാർത്ഥികളെ നയിക്കൂ!',
        '🌐 സമസ്ത വിദ്യാഭ്യാസ പോർട്ടലുകൾ'
      );
    } else if (activeTab === 'media_youtube_hub') {
      narrator.speak(
        'സമസ്ത മീഡിയ, മാസികകൾ & യൂട്യൂബ് സ്റ്റുഡിയോ! സുപ്രഭാതം ഇ-പേപ്പർ, കുരുന്നുകൾ, അൽ-മുഅല്ലിം, SKICR, ബാലവേദി ചാനലുകൾ പരിചയപ്പെടാം!',
        '📺 മീഡിയ & യൂട്യൂബ് സ്റ്റുഡിയോ'
      );
    } else {
      narrator.speak(
        'വലിയ അഭിനന്ദനങ്ങൾ കൂട്ടുകാരേ! നിങ്ങളുടെ പേര് നൽകി യഥാർത്ഥ പതാകകളോടുകൂടിയ സാക്ഷ്യപത്രം ഡൗൺലോഡ് ചെയ്യാം!',
        '🏆 സർട്ടിഫിക്കറ്റ് സ്റ്റുഡിയോ'
      );
    }
  }, [activeTab]);

  const triggerGlitter = (msg: string) => {
    setGlitterMsg(msg);
    setGlitterKey((k) => k + 1);
  };

  const handleSelectCompass = (idx: number) => {
    const card = STRATEGY_FLASH_CARDS[idx];
    if (!card) return;
    sound.playPop();
    setActiveCompassIdx(idx);
    if (!exploredCompassIds.includes(card.id)) {
      setExploredCompassIds((prev) => [...prev, card.id]);
      onAwardXp(10, `l4_flash_${card.id}`);
      triggerGlitter(`${card.emoji} ${card.title} +10 XP`);
    }
    narrator.speak(card.speech, `${card.emoji} ${card.title}`);
  };

  const [bagMistakes, setBagMistakes] = useState(0);
  const bagFailed = bagMistakes >= 2 && packedGear.length < 4;

  const handlePackGear = (gearId: string | null) => {
    if (!gearId || bagFailed) return;
    const gear = EVENT_GEAR.find((g) => g.id === gearId);
    if (!gear) return;
    setDraggedGearId(null);

    if (gear.isGood) {
      sound.playDrop();
      if (!packedGear.includes(gear.id)) {
        const nextPacked = [...packedGear, gear.id];
        setPackedGear(nextPacked);
        onAwardXp(20, `l4_gear_${gear.id}`);
        if (nextPacked.length >= 4) {
          window.setTimeout(() => scrollToActiveQuiz(), 950);
        }
      }
      setGearMsg({ ok: true, text: `${gear.emoji} ബാഗിൽ വെച്ചു! ${gear.reason}` });
      triggerGlitter(`${gear.emoji} ബാഗിൽ വെച്ചു! +20 XP`);
      narrator.speak(gear.speech, `${gear.emoji} ${gear.label}`);
    } else {
      sound.playError();
      const nextM = bagMistakes + 1;
      setBagMistakes(nextM);
      setGearMsg({
        ok: false,
        text:
          nextM >= 2
            ? '💥 2 തെറ്റായ സാധനങ്ങൾ ബാഗിൽ വെച്ചു! സമ്മേളന ബാഗ് ടാസ്ക് പരാജയപ്പെട്ടു — വീണ്ടും ശ്രമിക്കാം!'
            : 'വേണ്ട കൂട്ടുകാരേ 😅! അവസാന നിമിഷത്തേക്ക് വെക്കാതെ എന്ത്, എന്തിന്, എപ്പോൾ, എവിടെ, ആര് എന്നീ 5 കാര്യങ്ങൾ മുൻപേ പ്ലാൻ ചെയ്യണം!',
      });
      narrator.speak(gear.speech, `${gear.emoji} ${gear.label}`);
    }
  };

  const handleUnlockCertificate = () => {
    sound.playUnlock();
    onAwardXp(100, 'l4_complete');
    onUnlockBadge('🏆 SKSSF ഗൈഡ് താരം');
    onCompleteLevel();
    triggerGlitter('🎉 SKSSF ഗൈഡ് താരം! സാക്ഷ്യപത്രം തുറന്നു!');
    narrator.speak(
      'ആശംസകൾ! നിങ്ങൾ എല്ലാ ഘട്ടങ്ങളും വിജയകരമായി പൂർത്തിയാക്കി! ഇനി നിങ്ങളുടെ പേരിലുള്ള സാക്ഷ്യപത്രം ഡൗൺലോഡ് ചെയ്യാം!'
    );
    setActiveTab('certificate');
  };

  const l4Tabs: { id: L4Tab; label: string }[] = [
    { id: 'climb', label: '1. ആഗോള ഘടന' },
    { id: 'viqaya_van', label: '2. വിഖായ വാഹനം' },
    { id: 'compass', label: '3. സംഘാടന സൂത്രങ്ങൾ' },
    { id: 'bag', label: '4. സമ്മേളന ബാഗ്' },
    { id: 'crisis', label: '5. പ്രതിസന്ധി പരിഹാരം' },
    { id: 'cyber_shield', label: '6. സൈബർ ഷീൽഡ്' },
    { id: 'sahachari', label: '7. സഹചാരി റിലീഫ്' },
    { id: 'trend_career', label: '8. ട്രെൻഡ് കരിയർ' },
    { id: 'sargalayam', label: '9. സർഗ്ഗലയം' },
    { id: 'green_earth', label: '10. ഹരിത ക്യാമ്പസ്' },
    { id: 'samastha_portals', label: '11. വിദ്യാഭ്യാസ പോർട്ടലുകൾ' },
    { id: 'media_youtube_hub', label: '12. മീഡിയ & യൂട്യൂബ്' },
    { id: 'certificate', label: '13. സാക്ഷ്യപത്രം' },
  ];
  const activeL4Idx = l4Tabs.findIndex((t) => t.id === activeTab);
  const nextL4Tab = activeL4Idx < l4Tabs.length - 1 ? l4Tabs[activeL4Idx + 1] : undefined;
  const currentL4LessonId = `l4_${activeTab}`;
  const l4StepUnlocked =
    activeTab === 'certificate'
      ? true
      : devUnlocked ||
        isCompleted ||
        completedLessonIds.includes(currentL4LessonId) ||
        Boolean(quizAnswers[currentL4LessonId]);

  const handleAdvanceL4Tab = () => {
    if (!nextL4Tab) return;
    onMarkLessonCompleted?.(currentL4LessonId);
    if (nextL4Tab.id === 'certificate' && !isCompleted) {
      handleUnlockCertificate();
    } else {
      setActiveTab(nextL4Tab.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const trackItems: { id: L4Tab; lessonId: string; label: string; emoji: string }[] = [
    { id: 'climb', lessonId: 'l4_climb', label: 'ആഗോള ഘടന', emoji: '🗼' },
    { id: 'viqaya_van', lessonId: 'l4_viqaya_van', label: 'വിഖായ വാഹനം', emoji: '🚑' },
    { id: 'compass', lessonId: 'l4_compass', label: 'സംഘാടന സൂത്രങ്ങൾ', emoji: '🧭' },
    { id: 'bag', lessonId: 'l4_bag', label: 'സമ്മേളന ബാഗ്', emoji: '🎒' },
    { id: 'crisis', lessonId: 'l4_crisis', label: 'പ്രതിസന്ധി പരിഹാരം', emoji: '🎭' },
    { id: 'cyber_shield', lessonId: 'l4_cyber_shield', label: 'സൈബർ ഷീൽഡ്', emoji: '📱' },
    { id: 'sahachari', lessonId: 'l4_sahachari', label: 'സഹചാരി റിലീഫ്', emoji: '🤝' },
    { id: 'trend_career', lessonId: 'l4_trend_career', label: 'ട്രെൻഡ് കരിയർ', emoji: '🎓' },
    { id: 'sargalayam', lessonId: 'l4_sargalayam', label: 'സർഗ്ഗലയം', emoji: '🎨' },
    { id: 'green_earth', lessonId: 'l4_green_earth', label: 'ഹരിത ക്യാമ്പസ്', emoji: '🌿' },
    { id: 'samastha_portals', lessonId: 'l4_samastha_portals', label: 'വിദ്യാഭ്യാസ പോർട്ടലുകൾ', emoji: '🌐' },
    { id: 'media_youtube_hub', lessonId: 'l4_media_youtube_hub', label: 'മീഡിയ & യൂട്യൂബ്', emoji: '📺' },
    { id: 'certificate', lessonId: 'l4_certificate_done', label: 'സാക്ഷ്യപത്രം', emoji: '🏆' },
  ];

  const trackCompletedIds = isCompleted
    ? [...completedLessonIds, 'l4_certificate_done']
    : completedLessonIds;

  return (
    <section className="space-y-4">
      {/* 1. GAME FIRST FOR LESSON TABS (Collapsed launcher by default) */}
      {(activeTab === 'climb' ||
        activeTab === 'compass' ||
        activeTab === 'crisis' ||
        activeTab === 'cyber_shield' ||
        activeTab === 'sahachari' ||
        activeTab === 'trend_career' ||
        activeTab === 'sargalayam' ||
        activeTab === 'green_earth') && (
        <OptionalLessonMiniGame
          key={`l4_${activeTab}`}
          lessonKey={`l4_${activeTab}` as MiniGameLessonKey}
          onAwardXp={onAwardXp}
          isCompleted={
            isCompleted ||
            completedLessonIds.includes(`l4_${activeTab}`) ||
            completedSceneGames.includes(`l4_${activeTab}`)
          }
          onComplete={() =>
            setCompletedSceneGames((prev) =>
              prev.includes(`l4_${activeTab}`) ? prev : [...prev, `l4_${activeTab}`]
            )
          }
        />
      )}

      {/* GAME 4A-2: DEDICATED VIQAYA RESCUE VEHICLE MISSION */}
      {activeTab === 'viqaya_van' && (
        <div className="space-y-4">
          <ViqayaRescueVehicleActivity
            onAwardXp={onAwardXp}
            onUnlockBadge={onUnlockBadge}
            onOpenBadgeStudio={onOpenBadgeStudio}
            onComplete={() => {
              setCompletedSceneGames((prev) =>
                prev.includes('l4_viqaya_van') ? prev : [...prev, 'l4_viqaya_van']
              );
              window.setTimeout(() => scrollToActiveQuiz(), 850);
            }}
          />
        </div>
      )}

      {/* GAME 4B-2: EVENT BACKPACK PACKING */}
      {activeTab === 'bag' && (
        <GameFullscreenShell
          title="🎒 സമ്മേളന ബാഗ് പാക്ക് ഗെയിം"
          subtitle="ശരിയായ 4 സമ്മേളന സാമഗ്രികൾ ബാഗിലേക്ക് വലിച്ചിടൂ"
        >
        <div className="relative space-y-4">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Backpack className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  🎒 സമ്മേളന ബാഗ് പാക്ക് ചെയ്യൂ! (ശരിയായ 4 സാമഗ്രികൾ ബാഗിലേക്ക് ഇടൂ)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <GameShatterLives
                  lives={Math.max(0, 2 - bagMistakes)}
                  maxLives={2}
                  dark={false}
                  compact
                />
                <span className="text-xs font-bold text-emerald-800 tabular-nums">
                  {packedGear.length}/4
                </span>
              </div>
            </div>

            {bagFailed && (
              <GameDefeatBurstOverlay
                title="സമ്മേളന ബാഗ് പാക്ക് പരാജയപ്പെട്ടു!"
                reason="2 തെറ്റായ കാര്യങ്ങൾ ബാഗിലിട്ടു. ശരിയായ 4 സമ്മേളന സാമഗ്രികൾ മാത്രം തിരഞ്ഞെടുത്ത് വീണ്ടും ശ്രമിക്കാം!"
                onRetry={() => {
                  sound.playClick();
                  setBagMistakes(0);
                  setPackedGear([]);
                  setGearMsg(null);
                }}
                overlay={false}
              />
            )}

            <AnimatePresence mode="wait">
              {gearMsg && (
                <motion.div
                  key={gearMsg.text}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-wrap items-center justify-between gap-2 ${
                    gearMsg.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <span>{gearMsg.text}</span>
                  {packedGear.length >= 4 && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        scrollToActiveQuiz();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold shrink-0"
                    >
                      അടുത്തത് · ക്വിസ് ➡️
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-7 flex flex-wrap gap-2">
                {EVENT_GEAR.map((g) => {
                  const packed = packedGear.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      draggable={!packed}
                      disabled={packed}
                      onDragStart={() => {
                        sound.playClick();
                        setDraggedGearId(g.id);
                      }}
                      onClick={() => handlePackGear(g.id)}
                      className={`px-3.5 py-2.5 rounded-xl border border-b-2 text-xs font-bold transition-all ${
                        packed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-50'
                          : 'bg-slate-50 border-slate-300 text-slate-900 hover:border-emerald-600 cursor-grab card-3d-tilt'
                      }`}
                    >
                      {g.emoji} {g.label} {packed ? '✓' : ''}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handlePackGear(draggedGearId)}
                onClick={() => draggedGearId && handlePackGear(draggedGearId)}
                className="md:col-span-5 p-5 rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50/75 text-center card-3d-tilt"
              >
                <Backpack className="w-9 h-9 text-emerald-700 mx-auto mb-1 animate-float-bob" />
                <p className="text-sm font-extrabold text-emerald-950">
                  🎒 ഇവന്റ് ബാഗ് ({packedGear.length}/4)
                </p>
                <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                  എന്ത്–എന്തിന്–എപ്പോൾ–എവിടെ–ആര് · NOC · കരുതൽ തുക
                </p>
              </button>
            </div>
          </div>
        </div>
        </GameFullscreenShell>
      )}

      {/* 2. LESSONS (OPEN BY DEFAULT RIGHT BELOW GAME LAUNCHER) */}
      {activeTab === 'viqaya_van' && (
        <CollapsibleLessonDrawer
          key="l4-drawer-viqaya-van"
          emoji="🚑"
          title="വിഖായ & അലേർട്ട് (ALERT) ആഗോള സേവനം · പാഠം"
          badgeText="സേവന പാഠം"
          onSpeak={() =>
            narrator.speak(
              'വിഖായ സന്നദ്ധ സേനയും അലേർട്ട് ടീമും പ്രളയം, അപകടം, മഹാമാരി ഘട്ടങ്ങളിൽ ജാതിമത ഭേദമന്യേ രക്ഷാപ്രവർത്തനം നടത്തുന്നു. കൂടാതെ മക്കയിലും മദീനയിലും പ്രവാസി എസ് ഐ സി ഹജ്ജ് വിഖായ വളണ്ടിയർമാർ ഹാജിമാർക്ക് നിസ്വാർത്ഥ സേവനം നൽകുന്നു.',
              '🚑 വിഖായ & അലേർട്ട്'
            )
          }
        >
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white border border-rose-200 flex items-center gap-3 shadow-xs">
              <img
                src={OFFICIAL_WING_LOGOS.viqaya.src}
                alt={OFFICIAL_WING_LOGOS.viqaya.label}
                className="h-12 sm:h-14 w-auto object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-black text-rose-800">SKSSF VIQAYA · ALERT</p>
                <p className="text-[11px] font-bold text-slate-600">
                  Acute Life Emergency Rescue Team — സന്നദ്ധ സേവനത്തിന് യുവജാഗ്രത
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <p className="text-sm font-extrabold text-emerald-950">🌊 പ്രളയ & ദുരന്ത രക്ഷാപ്രവർത്തനം</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  കേരളത്തിലെ പ്രളയങ്ങളിലും പ്രകൃതിദുരന്തങ്ങളിലും ആദ്യം ഓടിയെത്തുന്ന അച്ചടക്കമുള്ള പരിശീലനം നേടിയ വളണ്ടിയർ നിരയാണ് SKSSF വിഖായയും അലേർട്ട് (ALERT) റെസ്ക്യൂ ടീമും.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1.5">
                <p className="text-sm font-extrabold text-sky-950">🏥 ആംബുലൻസ് & ആതുരസേവനം</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  അപകടങ്ങളിലും അടിയന്തര ചികിത്സാ ഘട്ടങ്ങളിലും സൗജന്യ ആംബുലൻസ് സേവനവും പ്രഥമശുശ്രൂഷയും രക്തദാനവും ഏകോപിപ്പിക്കുന്നു.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <p className="text-sm font-extrabold text-amber-950">🕋 മക്ക–മദീന ഹജ്ജ് വിഖായ & SIC</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  പ്രവാസി സമസ്ത ഇസ്‌ലാമിക് സെന്റർ (SIC) വഴി മക്കയിലും മദീനയിലും ഹാജിമാർക്കും ഉംറ തീർത്ഥാടകർക്കും വഴികാട്ടിയും സഹായികളുമായ ഹജ്ജ് വിഖായ സേവനം ലോകശ്രദ്ധ നേടിയിട്ടുണ്ട്.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleLessonDrawer>
      )}

      {activeTab === 'bag' && (
        <CollapsibleLessonDrawer
          key="l4-drawer-bag"
          emoji="🎒"
          title="സമ്മേളന ഒരുക്കവും 5 ആസൂത്രണ സൂത്രങ്ങളും · പാഠം"
          badgeText={`${packedGear.length}/4`}
          onSpeak={() =>
            narrator.speak(
              'ഒരു സമ്മേളനമോ പൊതുപരിപാടിയോ വിജയിപ്പിക്കാൻ എന്ത്, എന്തിന്, എപ്പോൾ, എവിടെ, ആര് എന്നീ അഞ്ച് ചോദ്യങ്ങൾ മുൻകൂട്ടി ആസൂത്രണം ചെയ്യണം. പത്ത് മുതൽ പതിനഞ്ച് ശതമാനം കരുതൽ തുക, പോലീസ് ഫയർ അനുമതി, ഗ്രീൻ പ്രോട്ടോക്കോൾ, ജനറേറ്റർ എന്നിവയും ഉറപ്പാക്കണം.',
              '🎒 സമ്മേളന ഒരുക്കം'
            )
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
              <p className="text-sm font-extrabold text-emerald-950">📋 5W ആസൂത്രണം (എന്ത്–എന്തിന്–എപ്പോൾ–എവിടെ–ആര്)</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                അവസാന നിമിഷത്തെ തിരക്ക് ഒഴിവാക്കി, പരിപാടിയുടെ ലക്ഷ്യം, വേദി, സമയം, ചുമതലക്കാർ, പ്രഭാഷകരുമായുള്ള ആശയവിനിമയം എന്നിവ ദിവസങ്ങൾക്ക് മുമ്പേ ഉറപ്പാക്കണം.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
              <p className="text-sm font-extrabold text-amber-950">🚒 സുരക്ഷ, NOC & ഗ്രീൻ പ്രോട്ടോക്കോൾ</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                10–15% കരുതൽ തുക (Buffer Fund), മൈക്കിന് പോലീസ് അനുമതി, വലിയ പന്തലിന് ഫയർ NOC, വൈദ്യുതിക്ക് ബാക്കപ്പ് ജനറേറ്റർ, പ്ലാസ്റ്റിക് രഹിത ശുചിത്വം എന്നിവ നിർബന്ധമാണ്.
              </p>
            </div>
          </div>
        </CollapsibleLessonDrawer>
      )}

      {/* 3. INTERACTIVE EXPLORER + LESSON: SPIRAL TOWER CLIMB */}
      {activeTab === 'climb' && (
        <div className="space-y-4">
        <GameFullscreenShell
          title="🗼 ആഗോള ഘടനാ ഗോപുരം (7 പടികൾ)"
          subtitle="യൂണിറ്റ് മുതൽ ഗ്ലോബൽ / SIC വരെ"
        >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="relative lg:col-span-7 rounded-2xl border-2 border-emerald-300 overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-sky-950 p-4 sm:p-5">
            <DriftingCloudsAndSun className="opacity-40" />
            <FloatingSparkleField />
            <SwayingGardenPlants side="left" className="opacity-75" />
            <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />

            <div className="relative z-20 flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-5 h-5 text-amber-300 shrink-0" />
                <h3 className="text-sm sm:text-base font-extrabold">
                  യൂണിറ്റ് മുതൽ ഗ്ലോബൽ / SIC വരെ — ഓരോ പടിയും ചവിട്ടിക്കയറൂ!
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onClaimEasterEgg && (
                  <EasterEggSpot
                    eggId="egg_giraffe_star"
                    collected={collectedEggs.includes('egg_giraffe_star')}
                    onClaim={onClaimEasterEgg}
                  />
                )}
                <FlutteringFlagPole variant="skju" className="hidden sm:flex scale-75 origin-bottom" />
                <AnimatedGiraffeMascot className="w-12 h-14 shrink-0" />
              </div>
            </div>

            <svg
              viewBox="0 0 600 410"
              className="relative z-20 w-full h-auto bg-white/90 backdrop-blur-xs rounded-xl border border-emerald-200 shadow-inner"
              role="img"
              aria-label="സംഘടനാ ഘടനാ ഭൂപടം"
            >
              <path
                d="M 75,358 L 150,306 L 225,254 L 300,202 L 375,150 L 450,98 L 525,46"
                fill="none"
                stroke="#047857"
                strokeWidth="5"
                strokeDasharray="7 5"
              />
              {HIERARCHY_NODES.map((node, idx) => {
                const cx = 75 + idx * 75;
                const cy = 358 - idx * 52;
                const active = node.id === selectedTier.id;
                const visited = exploredTiers.includes(node.id);
                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => {
                      sound.playSuccess(idx + 1);
                      setSelectedTierId(node.id);
                      if (!exploredTiers.includes(node.id)) {
                        setExploredTiers((prev) => [...prev, node.id]);
                        onAwardXp(10, `l4_tier_${node.id}`);
                        triggerGlitter(`${TIER_EMOJIS[idx]} ${node.malayalam.split(' ')[0]} +10 XP`);
                      }
                      narrator.speak(node.speech, node.malayalam);
                    }}
                  >
                    {active && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={32}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="3"
                        strokeDasharray="4 3"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={active ? 25 : 21}
                      fill={active ? '#7F1D1D' : visited ? '#047857' : '#FFFFFF'}
                      stroke={active ? '#FDE68A' : '#065F46'}
                      strokeWidth="2.5"
                    />
                    <text
                      x={cx}
                      y={cy + 5}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="800"
                      fill={active || visited ? '#FFFFFF' : '#0F172A'}
                    >
                      {active ? '🌟' : node.tier}
                    </text>
                    <rect
                      x={cx - 46}
                      y={cy + 25}
                      width="92"
                      height="21"
                      rx="6"
                      fill={active ? '#7F1D1D' : '#FFFFFF'}
                      stroke="#CBD5E1"
                    />
                    <text
                      x={cx}
                      y={cy + 39}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill={active ? '#FFFFFF' : '#1E293B'}
                    >
                      {node.malayalam.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <motion.div
            key={selectedTier.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 order-first lg:order-last bg-white rounded-2xl border-2 border-emerald-200 p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-red-900">
                  {TIER_EMOJIS[selectedTierIndex]} പടി {selectedTier.tier} / 07 · കണ്ടത്: {exploredTiers.length}/7
                </p>
                <h4 className="text-xl font-extrabold text-slate-900 mt-1">
                  {selectedTier.malayalam}
                </h4>
                <p className="text-xs font-semibold text-emerald-800 mt-1">
                  {selectedTier.scope}
                </p>
              </div>
              <button
                type="button"
                onClick={() => narrator.speak(selectedTier.speech, selectedTier.malayalam)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-950 text-xs font-bold shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" /> കേൾക്കാം
              </button>
            </div>
            <p className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedTier.keyRole}
            </p>
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                disabled={selectedTierIndex === 0}
                onClick={() => {
                  const prevNode = HIERARCHY_NODES[selectedTierIndex - 1];
                  if (!prevNode) return;
                  sound.playSuccess(selectedTierIndex);
                  setSelectedTierId(prevNode.id);
                  if (!exploredTiers.includes(prevNode.id)) {
                    setExploredTiers((prev) => [...prev, prevNode.id]);
                    onAwardXp(10, `l4_tier_${prevNode.id}`);
                  }
                  narrator.speak(prevNode.speech, prevNode.malayalam);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs font-extrabold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← താഴത്തെ പടി
              </button>
              <button
                type="button"
                disabled={selectedTierIndex === HIERARCHY_NODES.length - 1}
                onClick={() => {
                  const nextNode = HIERARCHY_NODES[selectedTierIndex + 1];
                  if (!nextNode) return;
                  sound.playSuccess(selectedTierIndex + 2);
                  setSelectedTierId(nextNode.id);
                  if (!exploredTiers.includes(nextNode.id)) {
                    setExploredTiers((prev) => [...prev, nextNode.id]);
                    onAwardXp(10, `l4_tier_${nextNode.id}`);
                    triggerGlitter(`${TIER_EMOJIS[selectedTierIndex + 1]} ${nextNode.malayalam.split(' ')[0]} +10 XP`);
                  }
                  narrator.speak(nextNode.speech, nextNode.malayalam);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-extrabold hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                മുകളിലെ പടി →
              </button>
            </div>
          </motion.div>
        </div>
        </GameFullscreenShell>
        <CollapsibleLessonDrawer
          key="l4-drawer-climb"
          emoji="🗼"
          title="ആഗോള ഘടന · 7 പടികൾ · പാഠം"
          badgeText={`${exploredTiers.length}/7`}
          onSpeak={() =>
            narrator.speak(
              'SKSSF സംഘടന യൂണിറ്റ്, ക്ലസ്റ്റർ, മേഖല, ജില്ല, സംസ്ഥാനം, ദേശീയം, പ്രവാസി എസ് ഐ സി എന്നിങ്ങനെ ഏഴ് പടികളിലൂടെ ലോകമെമ്പാടും വ്യാപിച്ചു കിടക്കുന്നു.',
              '🗼 ആഗോള ഘടന'
            )
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {HIERARCHY_NODES.map((node, idx) => (
              <div key={node.id} className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <p className="text-xs font-extrabold text-emerald-950">
                  {TIER_EMOJIS[idx]} {node.tier}. {node.malayalam}
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed">{node.keyRole}</p>
              </div>
            ))}
          </div>
        </CollapsibleLessonDrawer>
        </div>
      )}

      {/* 3. COLLAPSIBLE LESSON: LEADERSHIP COMPASS */}
      {activeTab === 'compass' && (
        <CollapsibleLessonDrawer
          key="l4-drawer-compass"
          emoji="🧭"
          title="സംഘാടന സൂത്രങ്ങൾ · പാഠം"
          badgeText={`${exploredCompassIds.length}/${STRATEGY_FLASH_CARDS.length}`}
          onSpeak={() =>
            narrator.speak(activeCompass.speech, `${activeCompass.emoji} ${activeCompass.title}`)
          }
        >
        <div className="relative space-y-4">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />

          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-4 sm:p-5 space-y-3.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-extrabold text-amber-300">
                🧭 സംഘാടന കോമ്പസ് സൂത്രങ്ങൾ — കാർഡിനകത്തെ ബട്ടൺ തൊട്ട് അടുത്ത സൂത്രം വായിക്കാം
              </p>
              <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/20 text-xs font-extrabold text-amber-200 tabular-nums">
                സൂത്രം {activeCompassIdx + 1} / {STRATEGY_FLASH_CARDS.length} · വായിച്ചത് {exploredCompassIds.length}/{STRATEGY_FLASH_CARDS.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCompass.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="rounded-xl bg-white/10 border border-white/15 p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-extrabold">
                        {activeCompass.tag}
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-white">
                        {activeCompass.emoji} {activeCompass.title}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-amber-300">
                      ✨ {activeCompass.front}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      narrator.speak(activeCompass.speech, `${activeCompass.emoji} ${activeCompass.title}`)
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-extrabold shrink-0 self-start sm:self-center"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> കേൾക്കാം
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">
                  {activeCompass.back}
                </p>

                <div className="pt-2.5 border-t border-white/15 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={activeCompassIdx === 0}
                    onClick={() => handleSelectCompass(activeCompassIdx - 1)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/15 text-white text-xs font-extrabold hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← മുൻ സൂത്രം
                  </button>
                  <button
                    type="button"
                    disabled={activeCompassIdx === STRATEGY_FLASH_CARDS.length - 1}
                    onClick={() => handleSelectCompass(activeCompassIdx + 1)}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    അടുത്ത സൂത്രം →
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </CollapsibleLessonDrawer>
      )}

      {/* 3. INTERACTIVE SIMULATOR + LESSON: CRISIS SIMULATOR */}
      {activeTab === 'crisis' && (
        <div className="space-y-4">
        <GameFullscreenShell
          title="🎭 പ്രതിസന്ധി പരിഹാരം സിമുലേറ്റർ"
          subtitle="ശരിയായ നേതൃത്വ തീരുമാനം തിരഞ്ഞെടുക്കൂ (3 കവചങ്ങൾ)"
          isGameDone={solvedCrisis.length === STRATEGY_SCENARIOS.length}
        >
        <div className="relative space-y-4">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  🎭 സാഹസിക നേതൃത്വ വെല്ലുവിളി ({solvedCrisis.length}/3)
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <GameShatterLives
                  lives={Math.max(0, 3 - crisisMistakes)}
                  maxLives={3}
                  dark={false}
                  compact
                />
                <div className="flex gap-1.5">
                  {STRATEGY_SCENARIOS.map((sc, i) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setCrisisIdx(i);
                        setCrisisFb(null);
                        narrator.speak(sc.speech, sc.title);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        i === crisisIdx
                          ? 'bg-red-900 text-white border-red-900'
                          : solvedCrisis.includes(sc.id)
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      സാഹസികത {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {crisisFailed && (
              <GameDefeatBurstOverlay
                title="പ്രതിസന്ധി പരിഹാരം പരാജയപ്പെട്ടു!"
                reason="3 തെറ്റായ തീരുമാനങ്ങൾ എടുത്തതിനാൽ കവചങ്ങൾ തകർന്നു — LPC (നേതാവ്–പദ്ധതി–ആശയവിനിമയം) പാലിച്ച് വീണ്ടും ശ്രമിക്കാം!"
                onRetry={() => {
                  sound.playClick();
                  setCrisisMistakes(0);
                  setSolvedCrisis([]);
                  setCrisisIdx(0);
                  setCrisisFb(null);
                }}
                overlay={false}
              />
            )}

            <AnimatePresence mode="wait">
              {crisisFb && !crisisFailed && (
                <motion.div
                  key={crisisFb.text}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex flex-wrap items-center justify-between gap-2 ${
                    crisisFb.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <span>{crisisFb.text}</span>
                  {crisisFb.ok && crisisIdx < STRATEGY_SCENARIOS.length - 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        const nextIdx = crisisIdx + 1;
                        setCrisisIdx(nextIdx);
                        setCrisisFb(null);
                        narrator.speak(
                          STRATEGY_SCENARIOS[nextIdx].speech,
                          STRATEGY_SCENARIOS[nextIdx].title
                        );
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold shrink-0"
                    >
                      അടുത്ത സാഹസികത →
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!crisisFailed && (
              <motion.div
                key={activeCrisis.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-red-900">{activeCrisis.category}</p>
                  <button
                    type="button"
                    onClick={() => narrator.speak(activeCrisis.speech, activeCrisis.title)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 text-[11px] font-bold"
                  >
                    <Volume2 className="w-3 h-3" /> കേൾക്കാം
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-900 leading-relaxed">
                  {activeCrisis.scenario}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeCrisis.options.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        if (opt.isCorrect) {
                          sound.playSuccess();
                          if (!solvedCrisis.includes(activeCrisis.id)) {
                            setSolvedCrisis((prev) => [...prev, activeCrisis.id]);
                            onAwardXp(35, `l4_crisis_${activeCrisis.id}`);
                          }
                          triggerGlitter('🎉 കൃത്യമായ തീരുമാനം! +35 XP');
                        } else {
                          sound.playError();
                          setCrisisMistakes((m) => Math.min(3, m + 1));
                        }
                        narrator.speak(opt.feedbackSpeech, activeCrisis.title);
                        setCrisisFb({ ok: opt.isCorrect, text: opt.feedback });
                      }}
                      className="text-left p-3.5 rounded-xl bg-white border border-b-2 border-slate-200 hover:border-emerald-600 text-xs sm:text-sm font-semibold text-slate-800 card-3d-tilt"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
        </GameFullscreenShell>

        <CollapsibleLessonDrawer
          key="l4-drawer-crisis"
          emoji="🎭"
          title="പ്രതിസന്ധി പരിഹാരം (LPC) · പാഠം"
          badgeText={`${solvedCrisis.length}/3`}
          onSpeak={() =>
            narrator.speak(
              'പ്രതിസന്ധി ഘട്ടങ്ങളിൽ ഫോൺ സ്വിച്ച് ഓഫ് ചെയ്യാതെ, നേതാവ്, പദ്ധതി, ആശയവിനിമയം (LPC) എന്നീ മൂന്ന് തൂണുകളിലൂടെ ശാന്തമായി പ്രശ്നം പരിഹരിക്കണം.',
              '🎭 പ്രതിസന്ധി പരിഹാരം'
            )
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <p className="text-xs font-extrabold text-emerald-950">🧭 Leader (നേതാവ്)</p>
              <p className="text-[11px] text-slate-700">പതറാതെ ഉത്തരവാദിത്തം ഏറ്റെടുത്ത് ടീമിനെ നയിക്കുക.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <p className="text-xs font-extrabold text-amber-950">📋 Plan (പദ്ധതി)</p>
              <p className="text-[11px] text-slate-700">വസ്തുതകൾ പരിശോധിച്ചു ഉടൻ പ്രായോഗിക പരിഹാരം തയ്യാറാക്കുക.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
              <p className="text-xs font-extrabold text-sky-950">🤝 Communicate (ആശയവിനിമയം)</p>
              <p className="text-[11px] text-slate-700">കുറ്റപ്പെടുത്താതെ കൃത്യമായ വിവരം ടീമുമായി പങ്കുവെക്കുക.</p>
            </div>
          </div>
        </CollapsibleLessonDrawer>
        </div>
      )}

      {/* 2. INTERACTIVE SIMULATOR + LESSON: CYBER SHIELD */}
      {activeTab === 'cyber_shield' && (
        <div className="space-y-4">
        <GameFullscreenShell
          title="📱 സൈബർ ഷീൽഡ് സിമുലേറ്റർ"
          subtitle="തർക്കുൽ മാലായഅ്നി (3 കവചങ്ങൾ)"
          isGameDone={solvedSocial.length === SOCIAL_ETHICS_CASES.length}
        >
        <div className="relative bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-5 overflow-hidden">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                📱 സൈബർ ഷീൽഡ് സിമുലേറ്റർ — “തർക്കുൽ മാലായഅ്നി”
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <GameShatterLives
                lives={Math.max(0, 3 - cyberMistakes)}
                maxLives={3}
                dark={false}
                compact
              />
              <div className="flex items-center gap-1.5">
                {SOCIAL_ETHICS_CASES.map((sc, idx) => {
                  const isDone = solvedSocial.includes(sc.id);
                  const isActive = idx === activeSocialIdx;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveSocialIdx(idx);
                        setCyberToast(null);
                        narrator.speak(sc.speech, sc.title);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition-all ${
                        isActive
                          ? 'bg-emerald-800 text-white border-emerald-950'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      കേസ് {idx + 1} {isDone ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {cyberFailed && (
            <GameDefeatBurstOverlay
              title="സൈബർ ഷീൽഡ് തകർന്നു!"
              reason="3 തെറ്റായ സൈബർ പ്രതികരണങ്ങൾ എടുത്തു — തർക്കുൽ മാലായഅ്നി പാലിച്ച് വീണ്ടും ശ്രമിക്കാം!"
              onRetry={() => {
                sound.playClick();
                setCyberMistakes(0);
                setSolvedSocial([]);
                setSocialFb({});
                setActiveSocialIdx(0);
                setCyberToast(null);
              }}
              overlay={false}
            />
          )}

          {/* Compact 4-Rule Shield Strip */}
          <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 px-3.5 py-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-bold text-emerald-950">
            {CYBER_RULES.map((rule) => (
              <span key={rule}>{rule}</span>
            ))}
          </div>

          {/* Single Smartphone Viewport + Defense Controls */}
          {!cyberFailed && (() => {
            const sc = activeSocial;
            const fb = socialFb[sc.id];
            const solved = solvedSocial.includes(sc.id);
            const emojis = ['🚫', '📦', '🎬'];
            const feedTags = ['@cyber_troll_alert', 'WhatsApp ഗ്രൂപ്പ് നോട്ടിഫിക്കേഷൻ', 'ഇൻസ്റ്റാഗ്രാം റീൽ സ്റ്റുഡിയോ'];

            return (
              <AnimatePresence mode="wait">
                <motion.div
                  key={sc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
                >
                  {/* Realistic Single Phone Frame */}
                  <div className="lg:col-span-5 mx-auto w-full max-w-sm rounded-[2rem] border-4 border-slate-800 bg-slate-950 p-3.5 shadow-xl text-white space-y-3">
                    <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-400">
                      <span>9:41 AM</span>
                      <span className="w-16 h-1.5 rounded-full bg-slate-800" />
                      <span>🛡️ {solved ? 'SAFE' : 'ALERT'}</span>
                    </div>

                    <div className="rounded-2xl bg-slate-900 border border-slate-700 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-lg">
                            {emojis[activeSocialIdx] || '🛡️'}
                          </span>
                          <div>
                            <p className="text-[10px] font-bold text-amber-300">
                              {feedTags[activeSocialIdx] || 'സോഷ്യൽ ഫീഡ്'}
                            </p>
                            <h4 className="text-xs sm:text-sm font-extrabold text-white">
                              {sc.title}
                            </h4>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => narrator.speak(sc.speech, sc.title)}
                          className="p-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 shrink-0"
                          aria-label="കേൾക്കാം"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-slate-100 leading-relaxed">
                        {sc.situation}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={solved ? 'text-emerald-400' : 'text-amber-300'}>
                          {solved ? '✅ ഷീൽഡ് വിജയിച്ചു!' : '⚡ ശരിയായ പ്രതികരണം തിരഞ്ഞെടുക്കൂ'}
                        </span>
                        <span className="text-slate-400 tabular-nums">
                          {activeSocialIdx + 1} / {SOCIAL_ETHICS_CASES.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Defense Action Panel */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        {solved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <Shield className="w-4 h-4 text-emerald-700" />
                        )}
                        നിങ്ങളുടെ സൈബർ ഷീൽഡ് തീരുമാനം തിരഞ്ഞെടുക്കൂ:
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {sc.options.map((opt, oIdx) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => {
                            if (opt.isCorrect) {
                              sound.playPop();
                              if (!solvedSocial.includes(sc.id)) {
                                setSolvedSocial((prev) => [...prev, sc.id]);
                                onAwardXp(40, `l4_sm_${sc.id}`);
                              }
                              triggerGlitter('🛡️ സൈബർ ഷീൽഡ് വിജയം! +40 XP');
                            } else {
                              sound.playError();
                              setCyberMistakes((m) => Math.min(3, m + 1));
                            }
                            narrator.speak(opt.feedbackSpeech, sc.title);
                            setSocialFb((prev) => ({
                              ...prev,
                              [sc.id]: { ok: opt.isCorrect, text: opt.feedback },
                            }));
                            setCyberToast({ ok: opt.isCorrect, text: opt.feedback });
                          }}
                          className="w-full text-left p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 hover:border-emerald-700 hover:bg-emerald-50/40 text-xs sm:text-sm font-bold text-slate-900 transition-all flex items-start gap-2.5"
                        >
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-xs font-extrabold text-emerald-800 flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {(fb || cyberToast) && (
                        <motion.div
                          key={(fb || cyberToast)?.text}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`p-3.5 rounded-xl border-2 text-xs sm:text-sm font-bold flex flex-wrap items-center justify-between gap-2 ${
                            (fb || cyberToast)?.ok
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                              : 'bg-amber-50 border-amber-400 text-amber-950'
                          }`}
                        >
                          <span>{(fb || cyberToast)?.text}</span>
                          {(fb || cyberToast)?.ok && activeSocialIdx < SOCIAL_ETHICS_CASES.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                const next = activeSocialIdx + 1;
                                setActiveSocialIdx(next);
                                setCyberToast(null);
                                narrator.speak(
                                  SOCIAL_ETHICS_CASES[next].speech,
                                  SOCIAL_ETHICS_CASES[next].title
                                );
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-extrabold shrink-0"
                            >
                              അടുത്ത കേസ് →
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          })()}
        </div>
        </GameFullscreenShell>

        <CollapsibleLessonDrawer
          key="l4-drawer-cyber"
          emoji="📱"
          title="സൈബർ ഷീൽഡും ഡിജിറ്റൽ മര്യാദയും · പാഠം"
          badgeText={`${solvedSocial.length}/${SOCIAL_ETHICS_CASES.length}`}
          onSpeak={() =>
            narrator.speak(
              'സോഷ്യൽ മീഡിയയിൽ വ്യാജ വാർത്തകളും അനാവശ്യ തർക്കങ്ങളും ഒഴിവാക്കുന്ന തർക്കുൽ മാലായഅ്നി ആണ് യഥാർത്ഥ സൈബർ ഷീൽഡ്.',
              '📱 സൈബർ ഷീൽഡ്'
            )
          }
        >
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white border border-sky-200 flex flex-wrap items-center gap-3 shadow-xs">
              <img
                src={OFFICIAL_WING_LOGOS.cyber.src}
                alt={OFFICIAL_WING_LOGOS.cyber.label}
                className="h-12 sm:h-14 w-auto object-contain shrink-0"
              />
              <img
                src={OFFICIAL_WING_LOGOS.skicr.src}
                alt={OFFICIAL_WING_LOGOS.skicr.label}
                className="h-12 sm:h-14 w-auto object-contain shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-sky-900">CYBER WING @SKSSF · SKICR</p>
                <p className="text-[11px] font-bold text-slate-600">
                  സൈബർ വിംഗ്, SKICR ഇസ്‌ലാമിക് ക്ലാസ് റൂം &amp; ധാർമ്മിക ഡിജിറ്റൽ പ്രബോധനം — തർക്കുൽ മാലായഅ്നി
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CYBER_RULES.map((rule) => (
                <div key={rule} className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-950">
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </CollapsibleLessonDrawer>
        </div>
      )}

      {/* LESSON 47: SAHACHARI RELIEF CELL */}
      {activeTab === 'sahachari' && (
        <CollapsibleLessonDrawer
          key="l4-drawer-sahachari"
          emoji="🤝"
          title="സഹചാരി റിലീഫ് സെല്ലും ജീവകാരുണ്യവും · പാഠം 47"
          badgeText="പാഠം 47/52"
          onSpeak={() =>
            narrator.speak(
              'SKSSF സഹചാരി റിലീഫ് സെൽ രോഗികൾക്കും നിർധനർക്കും ജാതിമത ഭേദമന്യേ ചികിത്സാ സഹായം, ഡയാലിസിസ് പിന്തുണ, രക്തദാനം, ഭക്ഷ്യ-ഭവന സഹായങ്ങൾ എത്തിക്കുന്ന കാരുണ്യ വിഭാഗമാണ്.',
              '🤝 സഹചാരി റിലീഫ് സെൽ'
            )
          }
        >
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white border border-emerald-200 flex flex-wrap items-center gap-3 shadow-xs">
              <img
                src={OFFICIAL_WING_LOGOS.meem.src}
                alt={OFFICIAL_WING_LOGOS.meem.label}
                className="h-12 sm:h-14 w-auto object-contain shrink-0"
              />
              <img
                src={OFFICIAL_WING_LOGOS.viqaya.src}
                alt={OFFICIAL_WING_LOGOS.viqaya.label}
                className="h-10 sm:h-12 w-auto object-contain shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-emerald-900">സഹചാരി · MEEM മെഡിക്കൽ വിംഗ് · വിഖായ</p>
                <p className="text-[11px] font-bold text-slate-600">
                  Medical Eminence for Ethical Movement — ആതുരസേവനവും ആരോഗ്യ പരിരക്ഷയും
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5">
                <p className="text-sm font-extrabold text-rose-950">🩸 രക്തദാന & ചികിത്സാ സഹായം</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  അടിയന്തര ശസ്ത്രക്രിയകൾക്കും ഡയാലിസിസ് രോഗികൾക്കും കൃത്യസമയത്ത് രക്തവും മരുന്നുകളും ചികിത്സാ സഹായവും സഹചാരി വളണ്ടിയർമാർ എത്തിക്കുന്നു.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <p className="text-sm font-extrabold text-emerald-950">🏥 ആശുപത്രികളിൽ സാന്ത്വന സാന്നിധ്യം</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  മെഡിക്കൽ കോളേജുകളിലും പ്രധാന ആശുപത്രികളിലും സഹചാരി ഹെൽപ്പ് ഡെസ്ക്കുകളും MEEM മെഡിക്കൽ ക്യാമ്പുകളും ആയിരങ്ങൾക്ക് ആശ്വാസമാകുന്നു.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <p className="text-sm font-extrabold text-amber-950">🤲 ആത്മാഭിമാനം കാത്തുള്ള കാരുണ്യം</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  സഹായം സ്വീകരിക്കുന്നവരുടെ ആത്മാഭിമാനത്തിന് മുറിവേൽപ്പിക്കാതെ, പരസ്യ പ്രദർശനം ഒഴിവാക്കി, അല്ലാഹുവിന്റെ പ്രീതിക്കായി മാത്രം (ഇഖ്‌ലാസ്) സേവനം ചെയ്യലാണ് സഹചാരിയുടെ മാതൃക.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleLessonDrawer>
      )}

      {/* LESSON 48: TREND & CAREER GUIDANCE */}
      {activeTab === 'trend_career' && (
        <CollapsibleLessonDrawer
          key="l4-drawer-trend-career"
          emoji="🎓"
          title="ട്രെൻഡ് (TREND) & കരിയർ വഴികാട്ടി · പാഠം 48"
          badgeText="പാഠം 48/52"
          onSpeak={() =>
            narrator.speak(
              'വിദ്യാർത്ഥികളെ ഉന്നത വിദ്യാഭ്യാസത്തിലേക്കും സിവിൽ സർവീസ് ഉൾപ്പെടെയുള്ള മികച്ച കരിയറുകളിലേക്കും കൈപിടിച്ചുയർത്തുന്ന SKSSF-ന്റെ വിദ്യാഭ്യാസ വിംഗാണ് ട്രെൻഡ്. സ്കോളർഷിപ്പുകൾ, കരിയർ ക്ലാസ്സുകൾ, ടേസ്റ്റ്, എജ്യൂകെയർ പദ്ധതികൾ ട്രെൻഡ് ഒരുക്കുന്നു.',
              '🎓 ട്രെൻഡ് & കരിയർ'
            )
          }
        >
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white border border-indigo-200 flex items-center gap-3 shadow-xs">
              <img
                src={OFFICIAL_WING_LOGOS.trend.src}
                alt={OFFICIAL_WING_LOGOS.trend.label}
                className="h-14 w-auto object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-black text-indigo-900">SKSSF TREND</p>
                <p className="text-[11px] font-bold text-slate-600">
                  Team Resource for Education and National Development
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1.5">
                <p className="text-sm font-extrabold text-sky-950">🧭 ശാസ്ത്രീയ കരിയർ ഗൈഡൻസ്</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  ഓരോ വിദ്യാർത്ഥിയുടെയും അഭിരുചിയും കഴിവും തിരിച്ചറിഞ്ഞ് പ്ലസ് ടുവിനും ബിരുദത്തിനും ശേഷം അനുയോജ്യമായ കോഴ്സുകൾ തിരഞ്ഞെടുക്കാൻ TREND വഴികാട്ടുന്നു.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1.5">
                <p className="text-sm font-extrabold text-indigo-950">🏛️ സിവിൽ സർവീസ് & ഉന്നത പഠനം</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  IAS, IPS, കേന്ദ്ര സർവകലാശാലകൾ, IIT, IIM, സ്കോളർഷിപ്പ് പരീക്ഷകൾ എന്നിവയ്ക്കായി TASTE, Educare തുടങ്ങിയ പദ്ധതികളിലൂടെ മികച്ച പരിശീലനം നൽകുന്നു.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <p className="text-sm font-extrabold text-emerald-950">📚 അറിവും വിനയവും ഒരുമിച്ച്</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  ഭൗതിക വിദ്യാഭ്യാസത്തിൽ ഉന്നത സ്ഥാനങ്ങളിൽ എത്തുമ്പോഴും ധാർമ്മിക മൂല്യങ്ങളും സമൂഹത്തോടുള്ള കടപ്പാടും മുറുകെ പിടിക്കുന്ന തലമുറയെ വാർത്തെടുക്കുകയാണ് ട്രെൻഡിന്റെ ലക്ഷ്യം.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleLessonDrawer>
      )}

      {/* LESSON 49: SARGALAYAM */}
      {activeTab === 'sargalayam' && (
        <CollapsibleLessonDrawer
          key="l4-drawer-sargalayam"
          emoji="🎨"
          title="സർഗ്ഗലയം & ഇസ്‌ലാമിക കലാവേദി · പാഠം 49"
          badgeText="പാഠം 49/52"
          onSpeak={() =>
            narrator.speak(
              'സർഗ്ഗലയം വിദ്യാർത്ഥികളുടെ പ്രസംഗം, എഴുത്ത്, ഖിറാഅത്ത്, മാപ്പിളപ്പാട്ട്, ബുർദ, കലിഗ്രഫി തുടങ്ങിയ സർഗ്ഗാത്മക കഴിവുകളെ ധാർമ്മിക ബോധത്തോടെ വളർത്തുന്ന ഇസ്‌ലാമിക കലാവേദിയാണ്.',
              '🎨 സർഗ്ഗലയം കലാവേദി'
            )
          }
        >
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white border border-purple-200 flex items-center gap-3 shadow-xs">
              <img
                src={OFFICIAL_WING_LOGOS.sargalayam.src}
                alt={OFFICIAL_WING_LOGOS.sargalayam.label}
                className="h-14 sm:h-16 w-auto object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-black text-purple-900">സർഗലയ (SARGALAYAM) · SKSSF STATE COMMITTEE</p>
                <p className="text-[11px] font-bold text-slate-600">
                  വിദ്യാർത്ഥികളുടെ കലാ-സാഹിത്യ-പ്രഭാഷണ പ്രതിഭകളെ വളർത്തുന്ന ഇസ്‌ലാമിക കലാവേദി
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5">
                <p className="text-sm font-extrabold text-purple-950">🎤 പ്രസംഗം, ഖിറാഅത്ത് & സാഹിത്യം</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  ഖുർആൻ പാരായണം, അറബി-മലയാളം-ഇംഗ്ലീഷ്-ഉറുദു പ്രസംഗങ്ങൾ, കഥ, കവിത, പ്രബന്ധ രചന എന്നിവയിലൂടെ മികച്ച പ്രഭാഷകരെയും എഴുത്തുകാരെയും വളർത്തുന്നു.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <p className="text-sm font-extrabold text-amber-950">🖌️ പൈതൃക കലകളും കലിഗ്രഫിയും</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  മാപ്പിളപ്പാട്ട്, ദഫ്‌മുട്ട്, അറബനമുട്ട്, ബുർദ ആലാപനം, അറബിക് കലിഗ്രഫി തുടങ്ങിയ സമ്പന്നമായ ഇസ്‌ലാമിക-കേരളീയ പൈതൃക കലകളെ പുതുതലമുറയ്ക്ക് പകർന്നുനൽകുന്നു.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <p className="text-sm font-extrabold text-emerald-950">🌟 മത്സരമല്ല, സൗഹൃദവും വളർച്ചയും</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  ജയപരാജയങ്ങളെക്കാൾ പരസ്പര സ്നേഹവും ആത്മവിശ്വാസവും നല്ല സന്ദേശങ്ങൾ കലയിലൂടെ സമൂഹത്തിലേക്ക് എത്തിക്കലുമാണ് സർഗ്ഗലയത്തിന്റെ യഥാർത്ഥ വിജയം.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleLessonDrawer>
      )}

      {/* LESSON 50: GREEN CAMPUS & ENVIRONMENT */}
      {activeTab === 'green_earth' && (
        <CollapsibleLessonDrawer
          key="l4-drawer-green-earth"
          emoji="🌿"
          title="ഹരിത ക്യാമ്പസും പരിസ്ഥിതി സംരക്ഷണവും · പാഠം 50"
          badgeText="പാഠം 50/52"
          onSpeak={() =>
            narrator.speak(
              'അന്ത്യദിനം അടുത്താലും കയ്യിലൊരു ചെറിയ തൈ ഉണ്ടെങ്കിൽ അത് നടുക എന്നത് മുഹമ്മദ് നബി സ്വല്ലല്ലാഹു അലൈഹിവസല്ലമയുടെ ഉത്തമ സന്ദേശമാണ്. മരങ്ങൾ നട്ടും ജലം പാഴാക്കാതെയും പ്ലാസ്റ്റിക് ഒഴിവാക്കിയും ഹരിത ക്യാമ്പസും വൃത്തിയുള്ള നാടും പടുത്തുയർത്താം.',
              '🌿 ഹരിത ക്യാമ്പസ്'
            )
          }
        >
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white border border-emerald-200 flex items-center gap-3 shadow-xs">
              <img
                src={OFFICIAL_WING_LOGOS.campus.src}
                alt={OFFICIAL_WING_LOGOS.campus.label}
                className="h-14 w-auto object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-black text-emerald-900">SKSSF CAMPUS WING</p>
                <p className="text-[11px] font-bold text-slate-600">
                  Struggle for a dream generation — ഹരിത ക്യാമ്പസും പരിസ്ഥിതി സംരക്ഷണവും
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <p className="text-sm font-extrabold text-emerald-950">🌱 മരം നടൽ ഒരു സ്വദഖയാണ്</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  ഒരു വിശ്വാസി ഒരു മരം നട്ട് അതിൽ നിന്ന് മനുഷ്യരോ പക്ഷികളോ മൃഗങ്ങളോ ഭക്ഷിച്ചാൽ അത് അവന് തുടരുന്ന ദാനധർമ്മമായി (സ്വദഖ) രേഖപ്പെടുത്തുമെന്ന് തിരുനബി ﷺ പഠിപ്പിച്ചു.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1.5">
                <p className="text-sm font-extrabold text-sky-950">💧 ജലസംരക്ഷണവും മിതവ്യയവും</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  ഒഴുകുന്ന പുഴയുടെ കരയിൽ നിന്നാണെങ്കിൽ പോലും വുളൂഅ് ചെയ്യുമ്പോൾ വെള്ളം അമിതമായി പാഴാക്കരുത് എന്ന പ്രവാചക മാതൃക ക്യാമ്പസിലും വീട്ടിലും പാലിക്കണം.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <p className="text-sm font-extrabold text-amber-950">♻️ പ്ലാസ്റ്റിക് മുക്ത ഗ്രീൻ പ്രോട്ടോക്കോൾ</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  സമ്മേളനങ്ങളിലും മദ്‌റസ-കോളേജ് പരിപാടികളിലും സ്റ്റീൽ ഗ്ലാസുകളും തുണി ബാനറുകളും ഉപയോഗിച്ച് പരിസരം വൃത്തിയായി സൂക്ഷിക്കുക എന്നത് ശുചിത്വ വിശ്വാസത്തിന്റെ ഭാഗമാണ്.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/80 px-4 py-3 text-center">
              <p className="text-xs sm:text-sm font-extrabold text-emerald-950">
                ✨ അടുത്തത് പാഠം 51: സമസ്തയുടെ എല്ലാ ഔദ്യോഗിക വിദ്യാഭ്യാസ പോർട്ടലുകളും ലിങ്കുകളും!
              </p>
            </div>
          </div>
        </CollapsibleLessonDrawer>
      )}

      {/* LESSON 51: SAMASTHA DIGITAL PORTALS & EDUCATION NETWORK */}
      {activeTab === 'samastha_portals' && (
        <div className="space-y-4">
          <SamasthaPortalRouterGame
            onAwardXp={onAwardXp}
            isCompleted={
              isCompleted ||
              completedLessonIds.includes('l4_samastha_portals') ||
              completedSceneGames.includes('l4_samastha_portals')
            }
            onComplete={() => {
              setCompletedSceneGames((prev) =>
                prev.includes('l4_samastha_portals') ? prev : [...prev, 'l4_samastha_portals']
              );
              if (quizAnswers.l4_samastha_portals) onMarkLessonCompleted?.('l4_samastha_portals');
            }}
          />
          <CollapsibleLessonDrawer
            key="l4-drawer-samastha-portals"
            emoji="🌐"
            title="സമസ്ത വിദ്യാഭ്യാസ ശൃംഖല & ഔദ്യോഗിക പോർട്ടലുകൾ · പാഠം 51"
            badgeText="പാഠം 51/52"
            onSpeak={() =>
              narrator.speak(
                'സമസ്തയുടെ വിദ്യാഭ്യാസ ശൃംഖലയിൽ SKIMVB, ഒരു ലക്ഷം അധ്യാപകരുള്ള SKJMCC, SNEC സമന്വയ കൗൺസിൽ, 114 വനിതാ കോളേജുകളുള്ള CSWC, 350-ലധികം ശാഖകളുള്ള അൽബിർ പ്രീ-സ്കൂൾ, സമസ്ത ഇ-ലേണിംഗ്, ജാമിഅ നൂരിയ്യ, MEAEC എന്നിവ ഉൾപ്പെടുന്നു. ഇവയുടെ ഔദ്യോഗിക വെബ്സൈറ്റുകളും PDF ഗൈഡുകളും ഇവിടെ നേരിട്ട് ഉപയോഗിക്കാം.',
                '🌐 സമസ്ത വിദ്യാഭ്യാസ പോർട്ടലുകൾ'
              )
            }
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <p className="text-sm font-extrabold text-emerald-950">🏫 SKIMVB · SKJMCC · SNEC</p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    1951-ൽ സ്ഥാപിതമായ SKIMVB 10,000+ മദ്രസകൾക്ക് നേതൃത്വം നൽകുന്നു. SKJMCC-യ്ക്ക് കീഴിൽ 1 ലക്ഷം അധ്യാപകരും 12 ലക്ഷം വിദ്യാർത്ഥികളുമുണ്ട്. SNEC ശരീഅഃ/ഷീ/ലൈഫ് (+2, ഡിഗ്രി, പി.ജി) പ്രോഗ്രാമുകൾ നയിക്കുന്നു.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1.5">
                  <p className="text-sm font-extrabold text-sky-950">👩‍🎓 CSWC · അൽബിർ · ASMI · E-Learning</p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    CSWC-ക്ക് 93 ഡേ &amp; 21 റെസിഡൻഷ്യൽ വനിതാ കോളേജുകളുണ്ട് (ഫളീല-ഫാദീല). അൽബിർ 350+ പ്രീ-സ്കൂളുകളും, സമസ്ത ഇ-ലേണിംഗ് 26+ രാജ്യങ്ങളിലേക്കുള്ള ഓൺലൈൻ മദ്രസയും നൽകുന്നു.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                  <p className="text-sm font-extrabold text-amber-950">🏛️ ജാമിഅ നൂരിയ്യ · ജലാലിയ്യ · MEAEC</p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    പട്ടിക്കാട് ജാമിഅ നൂരിയ്യ (1963), മുണ്ടക്കുളം ജാമിഅ ജലാലിയ്യ എന്നിവ ഉന്നത മതപഠനവും, MEA എഞ്ചിനീയറിംഗ് കോളേജ് (B.Tech/BCA/MCA) പ്രൊഫഷണൽ സാങ്കേതിക പഠനവും നൽകുന്നു.
                  </p>
                </div>
              </div>

              <InlineOfficialLinksStrip
                links={getLinksForLesson('l4_samastha_portals')}
                heading="🔗 വിദ്യാർത്ഥികൾക്ക് നേരിട്ട് ഉപയോഗിക്കാവുന്ന ഔദ്യോഗിക വിദ്യാഭ്യാസ പോർട്ടലുകൾ"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {OFFICIAL_PDF_GUIDES.map((pdf) => (
                  <a
                    key={pdf.id}
                    href={pdf.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white border-2 border-emerald-200 hover:border-emerald-500 flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-emerald-950 truncate">📄 {pdf.title}</p>
                      <p className="text-[11px] font-semibold text-slate-600">{pdf.pagesLabel} · തുറന്ന് വായിക്കാം</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-extrabold shrink-0">
                      തുറക്കാം
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </CollapsibleLessonDrawer>
        </div>
      )}

      {/* LESSON 52: SAMASTHA MEDIA, MAGAZINES & YOUTUBE STUDIO */}
      {activeTab === 'media_youtube_hub' && (
        <div className="space-y-4">
          <SamasthaMediaStudioGame
            onAwardXp={onAwardXp}
            isCompleted={
              isCompleted ||
              completedLessonIds.includes('l4_media_youtube_hub') ||
              completedSceneGames.includes('l4_media_youtube_hub')
            }
            onComplete={() => {
              setCompletedSceneGames((prev) =>
                prev.includes('l4_media_youtube_hub') ? prev : [...prev, 'l4_media_youtube_hub']
              );
              if (quizAnswers.l4_media_youtube_hub) onMarkLessonCompleted?.('l4_media_youtube_hub');
            }}
          />
          <CollapsibleLessonDrawer
            key="l4-drawer-media-youtube-hub"
            emoji="📺"
            title="സമസ്ത മീഡിയ, മാസികകൾ & യൂട്യൂബ് സ്റ്റുഡിയോ · പാഠം 52"
            badgeText="പാഠം 52/52"
            onSpeak={() =>
              narrator.speak(
                'സുപ്രഭാതം ദിനപത്രവും ഇ-പേപ്പറും, 1959 മുതലുള്ള അൽ-മുഅല്ലിം, സന്തുഷ്ട കുടുംബം, കുട്ടികൾക്കായുള്ള കുരുന്നുകൾ, സത്യധാര ദ്വൈവാരിക എന്നിവ സമസ്തയുടെ പ്രമുഖ പ്രസിദ്ധീകരണങ്ങളാണ്. @SAMASTHAONLINEOFFICAL, @SKICROfficial, @balavedhi, @trendkerala, @skssfsargalaya എന്നീ യൂട്യൂബ് ചാനലുകളും വിദ്യാർത്ഥികൾക്ക് പഠനത്തിനായി ഉപയോഗിക്കാം.',
                '📺 മീഡിയ & യൂട്യൂബ് സ്റ്റുഡിയോ'
              )
            }
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1.5">
                  <p className="text-sm font-extrabold text-sky-950">📰 സുപ്രഭാതം &amp; സത്യധാര</p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    കേരളം, ഇന്ത്യ, ഗൾഫ് (2024 ദുബായ് എഡിഷൻ) വാർത്തകളുമായി സുപ്രഭാതം ദിനപത്രവും ഇ-പേപ്പറും. 1997 മുതൽ SKSSF മുഖപത്രമായ സത്യധാര ദ്വൈവാരികയും പുറത്തിറങ്ങുന്നു.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5">
                  <p className="text-sm font-extrabold text-purple-950">📖 അൽ-മുഅല്ലിം · സന്തുഷ്ട കുടുംബം · കുരുന്നുകൾ</p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    SKJMCC പുറത്തിറക്കുന്ന അൽ-മുഅല്ലിം (1959) അധ്യാപകർക്കും, സന്തുഷ്ട കുടുംബം രക്ഷിതാക്കൾക്കും, കുരുന്നുകൾ മദ്രസാ കൂട്ടുകാർക്കും വിജ്ഞാനവും കഥകളും പകരുന്നു.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5">
                  <p className="text-sm font-extrabold text-rose-950">▶ ഔദ്യോഗിക യൂട്യൂബ് ചാനലുകൾ</p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    ഖുർആൻ പാരായണത്തിനും ഥിലാവയ്ക്കും @SAMASTHAONLINEOFFICAL, ലൈവ് ക്ലാസുകൾക്ക് @SKICROfficial, കുട്ടികൾക്ക് @balavedhi, കരിയറിന് @trendkerala, കലയ്ക്ക് @skssfsargalaya!
                  </p>
                </div>
              </div>

              <InlineOfficialLinksStrip
                links={getLinksForLesson('l4_media_youtube_hub')}
                heading="📺 നേരെ തുറന്ന് വായിക്കാനും കാണാനുമുള്ള ഔദ്യോഗിക മാധ്യമ ലിങ്കുകൾ"
              />
            </div>
          </CollapsibleLessonDrawer>
        </div>
      )}

      {/* 3. STORYLINE (COLLAPSED) + MANDATORY QUIZ (UNLOCKS AFTER CONFIRMING LESSON) */}
      {activeTab !== 'certificate' && (
        <LessonCheckQuiz
          lessonId={`l4_${activeTab}`}
          savedAnswer={quizAnswers[`l4_${activeTab}`]}
          onAnswered={(lessonId, selectedIdx, isCorrect) => {
            onQuizAnswered(lessonId, selectedIdx, isCorrect);
            onMarkLessonCompleted?.(lessonId);
          }}
          onNextLesson={nextL4Tab ? handleAdvanceL4Tab : undefined}
          nextLessonLabel={
            nextL4Tab?.id === 'certificate' ? 'സാക്ഷ്യപത്രം നേടാം 🏆' : 'അടുത്ത പാഠം ➡️'
          }
        />
      )}

      {/* TAB 11: CERTIFICATE STUDIO + UNSEEN-ONLY RE-SURFACING */}
      {activeTab === 'certificate' && (
        <div className="relative space-y-4">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />

          {unseenLessons.length > 0 && onJumpToLesson && (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 sm:p-5 space-y-3">
              <div>
                <p className="text-xs font-extrabold text-red-900">
                  📌 നിങ്ങൾ ഇതുവരെ കാണാതെ വിട്ടുപോയ {unseenLessons.length} പാഠങ്ങൾ ഇവിടെയുണ്ട് (കണ്ട പാഠങ്ങൾ ആവർത്തിക്കില്ല!)
                </p>
                <p className="text-xs text-slate-700 mt-0.5">
                  താഴെയുള്ള ഏതെങ്കിലും വിട്ടുപോയ പാഠത്തിൽ ക്ലിക്ക് ചെയ്ത് എപ്പോൾ വേണമെങ്കിലും അത് പൂർത്തിയാക്കാം:
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {unseenLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onJumpToLesson(lesson.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:border-emerald-600 hover:bg-emerald-50 text-xs font-extrabold text-slate-900 transition-colors"
                  >
                    <span>{lesson.emoji}</span>
                    <span>
                      {lesson.groupLabel}: {lesson.title}
                    </span>
                    <span className="text-emerald-700">▶</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <CertificateGenerator xp={xp} rank={rank} badges={badges} />

          <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-5 text-center space-y-1.5">
            <p className="text-xl" aria-hidden="true">
              ✨🚀📚
            </p>
            <h3 className="text-sm sm:text-base font-extrabold text-emerald-950">
              കൂടുതൽ പാഠങ്ങളും പുതിയ ഗെയിമുകളും ഉടൻ വരുന്നു!
            </h3>
            <p className="text-xs font-semibold text-slate-600">
              More Lessons &amp; Challenges Coming Soon! · 52 പാഠങ്ങൾ പൂർത്തിയാക്കിയ നിങ്ങൾക്ക് അഭിനന്ദനങ്ങൾ!
            </p>
          </div>
        </div>
      )}

      {/* 4. NAVIGATION & PROGRESS TRACK STRICTLY BELOW LESSON */}
      <LessonStepperNav
        stepLabel={`ഘട്ടം 4 · സ്റ്റേറ്റ് & ഗ്ലോബൽ തലം · പാഠം ${activeL4Idx + 1} / ${l4Tabs.length}: ${l4Tabs[activeL4Idx]?.label || ''}`}
        statusHint={
          activeTab !== 'certificate' && !l4StepUnlocked
            ? nextL4Tab?.id === 'certificate'
              ? 'മുകളിലെ ക്വിസിന് ഉത്തരം നൽകിയാൽ സാക്ഷ്യപത്രം തുറക്കും!'
              : 'മുകളിലെ ക്വിസിന് ഉത്തരം നൽകിയാൽ അടുത്ത പാഠം തുറക്കും!'
            : undefined
        }
        currentStep={activeL4Idx}
        totalSteps={l4Tabs.length}
        prevLabel={activeL4Idx > 0 ? l4Tabs[activeL4Idx - 1].label : undefined}
        onPrev={activeL4Idx > 0 ? () => setActiveTab(l4Tabs[activeL4Idx - 1].id) : undefined}
        nextLabel={
          nextL4Tab
            ? nextL4Tab.id === 'certificate'
              ? 'സാക്ഷ്യപത്രം നേടാം 🏆'
              : nextL4Tab.label
            : undefined
        }
        nextIsWorldAdvance={nextL4Tab?.id === 'certificate'}
        nextDisabled={!l4StepUnlocked}
        onNext={nextL4Tab ? handleAdvanceL4Tab : undefined}
      />

      <LessonProgressTrack
        stageTitle="ഘട്ടം 4 · സ്റ്റേറ്റ് & ഗ്ലോബൽ തലം"
        stageSubtitle="ആഗോള ഘടന, വിഖായ, സൈബർ ഷീൽഡ് & സാക്ഷ്യപത്രം"
        items={trackItems}
        activeId={activeTab}
        completedLessonIds={trackCompletedIds}
        devUnlocked={devUnlocked}
        onSelectCompleted={(id) => {
          if (id === 'certificate' && !isCompleted && !devUnlocked) {
            handleUnlockCertificate();
          } else {
            setActiveTab(id as L4Tab);
          }
        }}
      />
    </section>
  );
};
