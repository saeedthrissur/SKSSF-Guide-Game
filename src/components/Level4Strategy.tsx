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
import { LessonCheckQuiz } from './LessonCheckQuiz';
import { GameFullscreenShell } from './GameFullscreenShell';
import { ViqayaRescueVehicleActivity } from './InteractiveMiniGames';
import { MiniGameLessonKey, OptionalLessonMiniGame } from './OptionalLessonMiniGames';
import { QuizAnswerMap } from '../utils/gameStorage';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';

export type L4Tab =
  | 'climb'
  | 'viqaya_van'
  | 'compass'
  | 'bag'
  | 'crisis'
  | 'cyber_shield'
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

  // Cyber Shield Single-Phone Feed Simulator
  const [activeSocialIdx, setActiveSocialIdx] = useState(0);
  const [solvedSocial, setSolvedSocial] = useState<string[]>([]);
  const [socialFb, setSocialFb] = useState<Record<string, { ok: boolean; text: string }>>({});
  const [cyberToast, setCyberToast] = useState<{ ok: boolean; text: string } | null>(null);
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
      onActiveLessonChange?.('l4_cyber_shield');
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
        setPackedGear((prev) => [...prev, gear.id]);
        onAwardXp(20, `l4_gear_${gear.id}`);
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

  const trackItems: { id: L4Tab; lessonId: string; label: string; emoji: string }[] = [
    { id: 'climb', lessonId: 'l4_climb', label: 'ആഗോള ഘടന', emoji: '🗼' },
    { id: 'viqaya_van', lessonId: 'l4_viqaya_van', label: 'വിഖായ വാഹനം', emoji: '🚑' },
    { id: 'compass', lessonId: 'l4_compass', label: 'സംഘാടന സൂത്രങ്ങൾ', emoji: '🧭' },
    { id: 'bag', lessonId: 'l4_bag', label: 'സമ്മേളന ബാഗ്', emoji: '🎒' },
    { id: 'crisis', lessonId: 'l4_crisis', label: 'പ്രതിസന്ധി പരിഹാരം', emoji: '🎭' },
    { id: 'cyber_shield', lessonId: 'l4_cyber_shield', label: 'സൈബർ ഷീൽഡ്', emoji: '📱' },
    { id: 'certificate', lessonId: 'l4_certificate_done', label: 'സാക്ഷ്യപത്രം', emoji: '🏆' },
  ];

  const trackCompletedIds = isCompleted
    ? [...completedLessonIds, 'l4_certificate_done']
    : completedLessonIds;

  return (
    <section className="space-y-4">
      {/* Tower Sky Header with Always-On Scenic Animations */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-200 bg-emerald-950 text-white p-4 sm:p-5">
        <img
          src="/src/assets/images/world_tower_sky_1794946534081.jpg"
          alt="ജിറാഫും ഏണിയും സ്വർണ്ണ ഗോപുരവും"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          referrerPolicy="no-referrer"
        />
        <DriftingCloudsAndSun className="opacity-35" />
        <SwayingGardenPlants side="right" className="opacity-70" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-amber-300">
              🦒 ഘട്ടം 4 · സ്റ്റേറ്റ് &amp; ഗ്ലോബൽ തലം · ശാഖ മുതൽ SIC വരെ · സൈബർ ഷീൽഡ് · സാക്ഷ്യപത്രം
            </p>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              ആഗോള ഗോപുരാരോഹണവും വിജയ സാക്ഷ്യപത്രവും
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-emerald-100 tabular-nums">
              ഭൂപടം: {exploredTiers.length}/7 · ബാഗ്: {packedGear.length}/4 · സാഹസികത:{' '}
              {solvedCrisis.length}/3 · ഷീൽഡ്: {solvedSocial.length}/3
            </div>
            <FlutteringFlagPole variant="skssf" className="hidden sm:flex scale-90 origin-bottom" />
          </div>
        </div>
      </div>

      <LessonProgressTrack
        stageTitle="ഘട്ടം 4 · സ്റ്റേറ്റ് & ഗ്ലോബൽ തലം"
        stageSubtitle="ഓരോ പാഠവും താഴെയുള്ള ചോദ്യവും പൂർത്തിയാക്കി അവസാനം നിങ്ങളുടെ സാക്ഷ്യപത്രം സ്വന്തമാക്കാം"
        items={trackItems}
        activeId={activeTab}
        completedLessonIds={trackCompletedIds}
        onSelectCompleted={(id) => {
          if (id === 'certificate' && !isCompleted) {
            handleUnlockCertificate();
          } else {
            setActiveTab(id as L4Tab);
          }
        }}
      />

      {/* GAME 4A: 2D ANIMATED SPIRAL TOWER CLIMB */}
      {activeTab === 'climb' && (
        <GameFullscreenShell
          title="🗼 ആഗോള ഘടനാ ഗോപുരം"
          subtitle="യൂണിറ്റ് മുതൽ ഗ്ലോബൽ / SIC വരെയുള്ള 7 പടികൾ ചവിട്ടിക്കയറൂ"
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
      )}

      {/* GAME 4A-2: DEDICATED VIQAYA RESCUE VEHICLE MISSION */}
      {activeTab === 'viqaya_van' && (
        <div className="space-y-4">
          <ViqayaRescueVehicleActivity
            onAwardXp={onAwardXp}
            onUnlockBadge={onUnlockBadge}
            onOpenBadgeStudio={onOpenBadgeStudio}
            onComplete={() =>
              setCompletedSceneGames((prev) =>
                prev.includes('l4_viqaya_van') ? prev : [...prev, 'l4_viqaya_van']
              )
            }
          />
        </div>
      )}

      {/* GAME 4B-1: LEADERSHIP COMPASS SPOTLIGHT (INLINE STEPPER — ZERO TOP-BOTTOM DISCONNECT) */}
      {activeTab === 'compass' && (
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
      )}

      {/* GAME 4B-2: EVENT BACKPACK PACKING (STRICT SINGLE-FOCUS) */}
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
                <span className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-extrabold text-rose-900">
                  {'❤️'.repeat(Math.max(0, 2 - bagMistakes))}
                  {'💔'.repeat(Math.min(2, bagMistakes))}
                </span>
                <span className="text-xs font-bold text-emerald-800 tabular-nums">
                  {packedGear.length}/4
                </span>
              </div>
            </div>

            {bagFailed && (
              <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-rose-900">💥 സമ്മേളന ബാഗ് പാക്ക് പരാജയപ്പെട്ടു!</p>
                  <p className="text-xs font-semibold text-rose-800">
                    2 തെറ്റായ കാര്യങ്ങൾ ബാഗിലിട്ടു. ശരിയായ 4 സമ്മേളന സാമഗ്രികൾ മാത്രം തിരഞ്ഞെടുത്ത് വീണ്ടും ശ്രമിക്കാം!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setBagMistakes(0);
                    setPackedGear([]);
                    setGearMsg(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold border-b-4 border-amber-700"
                >
                  🔄 വീണ്ടും ശ്രമിക്കാം
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {gearMsg && (
                <motion.div
                  key={gearMsg.text}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-bold ${
                    gearMsg.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  {gearMsg.text}
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

      {/* GAME 4B-3: SINGLE-CARD ADVENTURE CRISIS STEPPER (STRICT SINGLE-FOCUS) */}
      {activeTab === 'crisis' && (
        <GameFullscreenShell
          title="🎭 പ്രതിസന്ധി പരിഹാര വെല്ലുവിളി"
          subtitle="ഓരോ സാഹസിക സാഹചര്യത്തിലും ശരിയായ തീരുമാനം തിരഞ്ഞെടുക്കൂ"
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

            <AnimatePresence mode="wait">
              {crisisFb && (
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
          </div>
        </div>
        </GameFullscreenShell>
      )}

      {/* GAME 4C: SINGLE-PHONE CYBER SHIELD FEED SIMULATOR */}
      {activeTab === 'cyber_shield' && (
        <GameFullscreenShell
          title="📱 സൈബർ ഷീൽഡ് സിമുലേറ്റർ"
          subtitle="ഓൺലൈൻ സാഹചര്യങ്ങളിൽ വിവേകപൂർണ്ണമായ തീരുമാനം തിരഞ്ഞെടുക്കൂ"
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

          {/* Compact 4-Rule Shield Strip */}
          <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 px-3.5 py-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-bold text-emerald-950">
            {CYBER_RULES.map((rule) => (
              <span key={rule}>{rule}</span>
            ))}
          </div>

          {/* Single Smartphone Viewport + Defense Controls */}
          {(() => {
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
      )}

      {/* TAB 6: CERTIFICATE STUDIO + UNSEEN-ONLY RE-SURFACING */}
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
        </div>
      )}

      {(activeTab === 'climb' ||
        activeTab === 'compass' ||
        activeTab === 'crisis' ||
        activeTab === 'cyber_shield') && (
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

      {activeTab !== 'certificate' && (
        <LessonCheckQuiz
          lessonId={`l4_${activeTab}`}
          savedAnswer={quizAnswers[`l4_${activeTab}`]}
          onAnswered={(lessonId, selectedIdx, isCorrect) => {
            onQuizAnswered(lessonId, selectedIdx, isCorrect);
            onMarkLessonCompleted?.(lessonId);
          }}
        />
      )}

      {/* Prominent Sequential Lesson Stepper (Single Bottom Navigation Bar) */}
      {(() => {
        const tabs: {
          id: L4Tab;
          label: string;
        }[] = [
          { id: 'climb', label: '1. ആഗോള ഘടന' },
          { id: 'viqaya_van', label: '2. വിഖായ വാഹനം' },
          { id: 'compass', label: '3. സംഘാടന സൂത്രങ്ങൾ' },
          { id: 'bag', label: '4. സമ്മേളന ബാഗ്' },
          { id: 'crisis', label: '5. പ്രതിസന്ധി പരിഹാരം' },
          { id: 'cyber_shield', label: '6. സൈബർ ഷീൽഡ്' },
          { id: 'certificate', label: '7. സാക്ഷ്യപത്രം' },
        ];
        const idx = tabs.findIndex((t) => t.id === activeTab);
        const nextTab = idx < tabs.length - 1 ? tabs[idx + 1] : undefined;
        const currentLessonId = `l4_${activeTab}`;
        const alreadyDone = isCompleted || completedLessonIds.includes(currentLessonId);
        const quizDone = Boolean(quizAnswers[currentLessonId]);

        const stepUnlocked =
          activeTab === 'certificate' ? true : alreadyDone || quizDone;
        const statusHint =
          activeTab !== 'certificate' && !stepUnlocked
            ? nextTab?.id === 'certificate'
              ? 'ഈ പാഠം മനസ്സിലാക്കി മുകളിലുള്ള ചോദ്യത്തിന് ഉത്തരം നൽകിയാൽ സാക്ഷ്യപത്രം തുറക്കും! (ഗെയിം സ്കിപ്പ് ചെയ്യാനും സൗകര്യമുണ്ട്)'
              : 'ഈ പാഠം മനസ്സിലാക്കി മുകളിലുള്ള ചോദ്യത്തിന് ഉത്തരം നൽകിയാൽ അടുത്ത പാഠവും പുതിയ ഗെയിമും തുറക്കും! (ഗെയിം സ്കിപ്പ് ചെയ്യാനും സൗകര്യമുണ്ട്)'
            : undefined;

        return (
          <LessonStepperNav
            stepLabel={`ഘട്ടം 4 · സ്റ്റേറ്റ് & ഗ്ലോബൽ തലം · പാഠം ${idx + 1} / ${tabs.length}: ${tabs[idx]?.label || ''}`}
            statusHint={statusHint}
            currentStep={idx}
            totalSteps={tabs.length}
            prevLabel={idx > 0 ? tabs[idx - 1].label : undefined}
            onPrev={idx > 0 ? () => setActiveTab(tabs[idx - 1].id) : undefined}
            nextLabel={
              nextTab
                ? nextTab.id === 'certificate'
                  ? 'സാക്ഷ്യപത്രം നേടാം 🏆'
                  : nextTab.label
                : undefined
            }
            nextIsWorldAdvance={nextTab?.id === 'certificate'}
            nextDisabled={!stepUnlocked}
            onNext={
              nextTab
                ? () => {
                    onMarkLessonCompleted?.(currentLessonId);
                    if (nextTab.id === 'certificate' && !isCompleted) {
                      handleUnlockCertificate();
                    } else {
                      setActiveTab(nextTab.id);
                    }
                  }
                : undefined
            }
          />
        );
      })()}
    </section>
  );
};
