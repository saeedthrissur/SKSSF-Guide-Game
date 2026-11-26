import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import {
  ECOSYSTEM_GROUPS,
  HELPDESK_CASES,
  SKSSF_SUBWINGS,
  SubWingInfo,
  WingCategory,
} from '../data/level2Data';
import { OFFICIAL_WING_LOGOS, SUBWING_OFFICIAL_LOGO_MAP } from '../data/officialLogos';
import { getLinksForSubWing, getLinksForVault } from '../data/officialLinks';
import { InlineOfficialLinksStrip } from './OfficialResourceHubModal';
import {
  OfficialSamasthaFlagImg,
  OfficialSkimvbLogoImg,
  OfficialSksbvFlagImg,
  OfficialSkssfFlagImg,
} from './SvgArtwork';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import {
  CollapsibleLessonDrawer,
  EasterEggItem,
  EasterEggSpot,
  GlitterBurstOverlay,
  LessonProgressTrack,
  LessonStepperNav,
} from './GameEffects';
import { LessonCheckQuiz, scrollToActiveQuiz } from './LessonCheckQuiz';
import { GameFullscreenShell } from './GameFullscreenShell';
import { MadrasaBoardActivity } from './InteractiveMiniGames';
import { MiniGameLessonKey, OptionalLessonMiniGame } from './OptionalLessonMiniGames';
import { QuizAnswerMap } from '../utils/gameStorage';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';

export type L2GameTab =
  | 'memory'
  | 'madrasa_board'
  | 'tiers'
  | 'election_roles'
  | 'centres'
  | 'dispatch'
  | 'dawa_age'
  | 'dawa_lanterns'
  | 'vault';

interface Level2EcosystemProps {
  isCompleted: boolean;
  initialTab?: L2GameTab;
  onAwardXp: (amount: number, actionId: string) => void;
  onUnlockBadge: (badge: string) => void;
  onCompleteLevel: () => void;
  onActiveLessonChange?: (lessonId: string) => void;
  onMarkLessonCompleted?: (lessonId: string) => void;
  completedLessonIds?: string[];
  quizAnswers: QuizAnswerMap;
  onQuizAnswered: (lessonId: string, selectedIdx: number, isCorrect: boolean) => void;
  collectedEggs?: string[];
  onClaimEasterEgg?: (egg: EasterEggItem) => void;
  onOpenBadgeStudio?: (presetBadgeId: string) => void;
  devUnlocked?: boolean;
}

type FlagId = 'skju' | 'skimvb' | 'skssf' | 'sksbv';

interface MemoryCard {
  uid: string;
  pairId: FlagId;
  kind: 'image' | 'label';
  label: string;
  speech: string;
}

const MEMORY_DECK: MemoryCard[] = [
  {
    uid: 'm1',
    pairId: 'skju',
    kind: 'image',
    label: 'SKJU പതാക',
    speech: '1926 ജൂൺ 26-ന് കോഴിക്കോട് ടൗൺ ഹാളിൽ പിറന്ന നമ്മുടെ മാതൃസംഘടനയാണ് സമസ്ത!',
  },
  {
    uid: 'm2',
    pairId: 'skimvb',
    kind: 'label',
    label: '🏫 1951 വിദ്യാഭ്യാസ ബോർഡ് (11,000+ മദ്രസകൾ)',
    speech: '1951-ൽ തുടങ്ങിയ വിദ്യാഭ്യാസ ബോർഡിന് കീഴിൽ ഇന്ന് പതിനൊന്നായിരത്തിലധികം മദ്രസകളുണ്ട്!',
  },
  {
    uid: 'm3',
    pairId: 'skssf',
    kind: 'image',
    label: 'SKSSF പതാക',
    speech: 'വിജ്ഞാനം, വിനയം, സേവനം എന്ന മുദ്രാവാക്യവുമായി 1989 ഫെബ്രുവരി 19-ന് പിറന്ന വിദ്യാർത്ഥി പ്രസ്ഥാനം!',
  },
  {
    uid: 'm4',
    pairId: 'sksbv',
    kind: 'label',
    label: '👦 1993 ബാലവേദി (10,637+ യൂണിറ്റുകൾ)',
    speech: 'മദ്രസയിലെ കൂട്ടുകാർക്കായി 1993-ൽ തുടങ്ങിയ ബാലവേദിയാണ് എസ് കെ എസ് ബി വി!',
  },
  {
    uid: 'm5',
    pairId: 'skju',
    kind: 'label',
    label: '🕌 1926 ടൗൺ ഹാൾ മാതൃസംഘടന',
    speech: '1926 ജൂൺ 26-ന് കോഴിക്കോട് ടൗൺ ഹാളിൽ പിറന്ന നമ്മുടെ മാതൃസംഘടനയാണ് സമസ്ത!',
  },
  {
    uid: 'm6',
    pairId: 'skimvb',
    kind: 'image',
    label: 'SKIMVB മുദ്ര',
    speech: '1951-ൽ തുടങ്ങിയ വിദ്യാഭ്യാസ ബോർഡിന് കീഴിൽ ഇന്ന് പതിനൊന്നായിരത്തിലധികം മദ്രസകളുണ്ട്!',
  },
  {
    uid: 'm7',
    pairId: 'skssf',
    kind: 'label',
    label: '🚩 1989 വിജ്ഞാനം · വിനയം · സേവനം',
    speech: 'വിജ്ഞാനം, വിനയം, സേവനം എന്ന മുദ്രാവാക്യവുമായി 1989 ഫെബ്രുവരി 19-ന് പിറന്ന വിദ്യാർത്ഥി പ്രസ്ഥാനം!',
  },
  {
    uid: 'm8',
    pairId: 'sksbv',
    kind: 'image',
    label: 'SKSBV പതാക',
    speech: 'മദ്രസയിലെ കൂട്ടുകാർക്കായി 1993-ൽ തുടങ്ങിയ ബാലവേദിയാണ് എസ് കെ എസ് ബി വി!',
  },
];

interface CommitteeTierSpec {
  id: string;
  tier: string;
  emoji: string;
  totalMembers: number;
  councilRatio: string;
  scopeRule: string;
  positions: { role: string; count: string }[];
  workingCommitteeNote: string;
  speech: string;
}

const COMMITTEE_TIER_SPECS: CommitteeTierSpec[] = [
  {
    id: 'tier_shakha',
    tier: 'ശാഖ (യൂണിറ്റ്)',
    emoji: '🏡',
    totalMembers: 15,
    councilRatio: 'എല്ലാ മെമ്പർമാരും + SKSBV ഭാരവാഹികൾ',
    scopeRule: '14–40 പ്രായക്കാർ · 60% പുതുമുഖങ്ങൾ · കുറഞ്ഞത് 3 റെഗുലർ ക്യാമ്പസ് വിദ്യാർത്ഥികൾ',
    positions: [
      { role: 'പ്രസിഡന്റ്', count: '1' },
      { role: 'ജനറൽ സെക്രട്ടറി', count: '1' },
      { role: 'ട്രഷറർ', count: '1' },
      { role: 'വൈസ് പ്രസിഡന്റ്', count: '3' },
      { role: 'വർക്കിംഗ് സെക്രട്ടറി', count: '1' },
      { role: 'ജോയിന്റ് സെക്രട്ടറി', count: '3' },
      { role: 'ഓർഗനൈസിംഗ് സെക്രട്ടറി', count: 'NIL' },
      { role: 'എക്സിക്യൂട്ടീവ് / ഭാരവാഹികൾ', count: '10' },
      { role: 'അംഗങ്ങൾ (സെക്രട്ടറിയേറ്റ്/മെമ്പേഴ്സ്)', count: '5' },
    ],
    workingCommitteeNote:
      'ശാഖാ കമ്മിറ്റിയിലെ 15 പേരും + വിവിധ സബ് വിംഗ് കൺവീനർമാരും ചേർന്ന് ശാഖയുടെ പ്രതിമാസ പ്രവർത്തനങ്ങൾ ഏകോപിപ്പിക്കുന്നു.',
    speech:
      'ശാഖാ യൂണിറ്റ് കമ്മിറ്റിയിൽ പതിനഞ്ച് അംഗങ്ങളാണുള്ളത്! പ്രസിഡന്റ് ഒന്ന്, ജനറൽ സെക്രട്ടറി ഒന്ന്, ട്രഷറർ ഒന്ന്, വർക്കിംഗ് സെക്രട്ടറി ഒന്ന്, മൂന്ന് വൈസ് പ്രസിഡന്റുമാർ, മൂന്ന് ജോയിന്റ് സെക്രട്ടറിമാർ, അഞ്ച് അംഗങ്ങൾ! ഇതിൽ അറുപത് ശതമാനം പുതുമുഖങ്ങളും കുറഞ്ഞത് മൂന്ന് ക്യാമ്പസ് വിദ്യാർത്ഥികളും ഉണ്ടാകണം!',
  },
  {
    id: 'tier_cluster',
    tier: 'ക്ലസ്റ്റർ കമ്മിറ്റി',
    emoji: '🏘️',
    totalMembers: 19,
    councilRatio: '15 മെമ്പർഷിപ്പിന് 1 കൗൺസിലർ + ശാഖാ ഭാരവാഹികൾ',
    scopeRule: 'കുറഞ്ഞത് 5 മുതൽ പരമാവധി 10 വരെ ശാഖകൾ ചേർന്നതാണ് ഒരു ക്ലസ്റ്റർ',
    positions: [
      { role: 'പ്രസിഡന്റ്', count: '1' },
      { role: 'ജനറൽ സെക്രട്ടറി', count: '1' },
      { role: 'ട്രഷറർ', count: '1' },
      { role: 'വൈസ് പ്രസിഡന്റ്', count: '3' },
      { role: 'വർക്കിംഗ് സെക്രട്ടറി', count: '1' },
      { role: 'ജോയിന്റ് സെക്രട്ടറി', count: '3' },
      { role: 'ഓർഗനൈസിംഗ് സെക്രട്ടറി', count: 'NIL' },
      { role: 'എക്സിക്യൂട്ടീവ് / ഭാരവാഹികൾ', count: '10' },
      { role: 'അംഗങ്ങൾ (മെമ്പേഴ്സ്)', count: '9' },
    ],
    workingCommitteeNote:
      'ക്ലസ്റ്റർ ഭാരവാഹികളും പരിധിയിലെ ശാഖാ പ്രസിഡന്റ്-ജനറൽ സെക്രട്ടറിമാരും ചേർന്നതാണ് ക്ലസ്റ്റർ വർക്കിംഗ് കമ്മിറ്റി.',
    speech:
      'അഞ്ച് മുതൽ പത്ത് ശാഖകൾ ചേർന്ന ക്ലസ്റ്റർ കമ്മിറ്റിയിൽ പത്തൊൻപത് അംഗങ്ങളുണ്ട്! പതിനഞ്ച് മെമ്പർഷിപ്പിന് ഒരാൾ വീതമാണ് ക്ലസ്റ്റർ കൗൺസിലർ!',
  },
  {
    id: 'tier_mekhala',
    tier: 'മേഖലാ കമ്മിറ്റി',
    emoji: '🗺️',
    totalMembers: 21,
    councilRatio: '25 മെമ്പർഷിപ്പിന് 1 കൗൺസിലർ',
    scopeRule: 'കുറഞ്ഞത് 3 ക്ലസ്റ്ററുകൾ · പരമാവധി 35 ശാഖകൾ · സത്യധാര വരിക്കാരായിരിക്കണം',
    positions: [
      { role: 'പ്രസിഡന്റ്', count: '1' },
      { role: 'ജനറൽ സെക്രട്ടറി', count: '1' },
      { role: 'ട്രഷറർ', count: '1' },
      { role: 'വൈസ് പ്രസിഡന്റ്', count: '3' },
      { role: 'വർക്കിംഗ് സെക്രട്ടറി', count: '1' },
      { role: 'ജോയിന്റ് സെക്രട്ടറി', count: '3' },
      { role: 'ഓർഗനൈസിംഗ് സെക്രട്ടറി', count: 'NIL' },
      { role: 'എക്സിക്യൂട്ടീവ് / ഭാരവാഹികൾ', count: '10' },
      { role: 'അംഗങ്ങൾ (മെമ്പേഴ്സ്)', count: '11' },
    ],
    workingCommitteeNote:
      'മേഖലാ ഐ.ടി. കോർഡിനേറ്റർ ഓർഗാനെറ്റ് വഴി ശാഖാ ഡാറ്റ വെരിഫൈ ചെയ്യുന്നു; 17 സബ് വിംഗുകൾക്കും മേഖലയിൽ ചെയർമാൻ-കൺവീനർമാരുണ്ടാകും.',
    speech:
      'കുറഞ്ഞത് മൂന്ന് ക്ലസ്റ്ററുകളും പരമാവധി മുപ്പത്തിയഞ്ച് ശാഖകളും ചേരുന്ന മേഖലാ കമ്മിറ്റിയിൽ ഇരുപത്തിയൊന്ന് അംഗങ്ങളാണുള്ളത്! ഇരുപത്തിയഞ്ച് മെമ്പർഷിപ്പിന് ഒരാളാണ് മേഖലാ കൗൺസിലർ!',
  },
  {
    id: 'tier_district',
    tier: 'ജില്ലാ കമ്മിറ്റി',
    emoji: '🏛️',
    totalMembers: 25,
    councilRatio: '150 മെമ്പർഷിപ്പിന് 1 കൗൺസിലർ',
    scopeRule: 'ജില്ലാ കൗൺസിലർമാർ സുപ്രഭാതം വരിക്കാരായിരിക്കണം · സെക്രട്ടറിയേറ്റ് സംവിധാനം',
    positions: [
      { role: 'പ്രസിഡന്റ്', count: '1' },
      { role: 'ജനറൽ സെക്രട്ടറി', count: '1' },
      { role: 'ട്രഷറർ', count: '1' },
      { role: 'വൈസ് പ്രസിഡന്റ്', count: '5' },
      { role: 'വർക്കിംഗ് സെക്രട്ടറി', count: '1' },
      { role: 'ജോയിന്റ് സെക്രട്ടറി', count: '3' },
      { role: 'ഓർഗനൈസിംഗ് സെക്രട്ടറി', count: '3' },
      { role: 'സെക്രട്ടറിയേറ്റ് (ഭാരവാഹികൾ)', count: '15' },
      { role: 'അംഗങ്ങൾ (മെമ്പേഴ്സ്)', count: '10' },
    ],
    workingCommitteeNote:
      'ജില്ലാ സെക്രട്ടറിയേറ്റ് (15) + 10 അംഗങ്ങൾ = 25 അംഗ ജില്ലാ കമ്മിറ്റി! ജില്ലാ ഐ.ടി. കോർഡിനേറ്റർ ഓർഗാനെറ്റ് അപ്രൂവലുകൾ നിയന്ത്രിക്കുന്നു.',
    speech:
      'ജില്ലാ കമ്മിറ്റിയിൽ ഇരുപത്തിയഞ്ച് അംഗങ്ങളുണ്ട്! നൂറ്റമ്പത് മെമ്പർഷിപ്പിന് ഒരാൾ വീതമാണ് ജില്ലാ കൗൺസിലർ! അഞ്ച് വൈസ് പ്രസിഡന്റുമാരും മൂന്ന് ഓർഗനൈസിംഗ് സെക്രട്ടറിമാരും ഉൾപ്പെടെ പതിനഞ്ച് സെക്രട്ടറിയേറ്റ് ഭാരവാഹികളുണ്ട്!',
  },
  {
    id: 'tier_state',
    tier: 'സംസ്ഥാന കമ്മിറ്റി',
    emoji: '🌟',
    totalMembers: 31,
    councilRatio: '1500 മെമ്പർഷിപ്പിന് 1 കൗൺസിലർ',
    scopeRule: 'കേരളം, കർണാടക, തമിഴ്നാട്, ലക്ഷദ്വീപ്, ദേശീയ-പ്രവാസി ഘടകങ്ങളുടെ ഏകോപനം',
    positions: [
      { role: 'പ്രസിഡന്റ്', count: '1' },
      { role: 'ജനറൽ സെക്രട്ടറി', count: '1' },
      { role: 'ട്രഷറർ', count: '1' },
      { role: 'വൈസ് പ്രസിഡന്റ്', count: '4' },
      { role: 'വർക്കിംഗ് സെക്രട്ടറി', count: '1' },
      { role: 'ജോയിന്റ് സെക്രട്ടറി', count: '4' },
      { role: 'ഓർഗനൈസിംഗ് സെക്രട്ടറി', count: '3' },
      { role: 'സെക്രട്ടറിയേറ്റ് (ഭാരവാഹികൾ)', count: '15' },
      { role: 'സംസ്ഥാന സമിതി അംഗങ്ങൾ', count: '16' },
    ],
    workingCommitteeNote:
      'സംസ്ഥാന കൗൺസിലിൽ വെച്ച് തന്നെ 17 സബ് വിംഗുകളുടെ സംസ്ഥാന സമിതികളും രൂപീകരിച്ച് ആഗോള പ്രവർത്തനങ്ങൾ ഏകോപിപ്പിക്കുന്നു.',
    speech:
      'സംസ്ഥാന കമ്മിറ്റിയിൽ മുപ്പത്തിയൊന്ന് അംഗങ്ങളാണുള്ളത്! ആയിരത്തിയഞ്ഞൂറ് മെമ്പർഷിപ്പിന് ഒരാൾ വീതമാണ് സംസ്ഥാന കൗൺസിലർ! പതിനഞ്ച് സെക്രട്ടറിയേറ്റ് അംഗങ്ങളും പതിനാറ് സംസ്ഥാന സമിതി അംഗങ്ങളും ചേർന്ന് പ്രസ്ഥാനത്തെ നയിക്കുന്നു!',
  },
];

const ELECTION_OFFICIAL_ROLES = [
  {
    id: 'role_elec_comm',
    emoji: '⚖️',
    title: 'ഇലക്ഷൻ സമിതി (7 അംഗങ്ങൾ)',
    badge: 'നിഷ്പക്ഷ തിരഞ്ഞെടുപ്പ് മേൽനോട്ടം',
    summary:
      'പുതിയ കമ്മിറ്റി രൂപീകരണ സമയത്ത് ജനാധിപത്യപരവും സുതാര്യവുമായ തിരഞ്ഞെടുപ്പ് ഉറപ്പാക്കാൻ 7 അംഗ ഇലക്ഷൻ സമിതി പ്രവർത്തിക്കുന്നു. പരാതികളും അപ്പീലുകളും രമ്യമായി പരിഹരിക്കുകയാണ് പ്രധാന ചുമതല.',
    rules: [
      'ഭാരവാഹികളുടെ പ്രായപരിധി 14 മുതൽ 40 വയസ്സ് വരെ · ഒരേ പദവിയിൽ തുടർച്ചയായി പരമാവധി 2 ടേം',
      'മെന്ററിംഗ് കോഴ്സ് പൂർത്തിയാക്കിയവർക്കും സജീവ വിഖായ / TRB അംഗങ്ങൾക്കും ഭാരവാഹിത്വത്തിൽ മുൻഗണന',
      'കമ്മിറ്റിയിൽ 60% പുതുമുഖങ്ങളെ ഉൾപ്പെടുത്തി യുവത്വത്തിന് വഴിയൊരുക്കണം',
    ],
    speech:
      'ജനാധിപത്യപരമായ കമ്മിറ്റി രൂപീകരണത്തിന് ഏഴംഗ ഇലക്ഷൻ സമിതി നേതൃത്വം നൽകുന്നു! ഒരേ പദവിയിൽ തുടർച്ചയായി രണ്ട് ടേം പരിധിയും അറുപത് ശതമാനം പുതുമുഖ പങ്കാളിത്തവും ഉറപ്പാക്കുന്നു!',
  },
  {
    id: 'role_observer',
    emoji: '👁️',
    title: 'നിരീക്ഷകൻ (Observer)',
    badge: 'ഉപരിഘടക പ്രതിനിധി',
    summary:
      'ഓരോ ശാഖ-ക്ലസ്റ്റർ-മേഖല-ജില്ലാ കൗൺസിൽ യോഗങ്ങളിലും ഉപരിഘടകം നിയോഗിക്കുന്ന നിരീക്ഷകൻ പങ്കെടുക്കും. ഭരണഘടനാ ചട്ടങ്ങൾ പാലിക്കുന്നുണ്ടെന്ന് ഉറപ്പുവരുത്തലാണ് നിരീക്ഷകന്റെ ഉത്തരവാദിത്തം.',
    rules: [
      'കമ്മിറ്റി രൂപീകരണത്തിന് മുമ്പ് 3 മണിക്കൂർ ദൈർഘ്യമുള്ള കൗൺസിൽ ക്യാമ്പ് നിർബന്ധമായും നടത്തണം',
      'കൗൺസിൽ ക്യാമ്പിൽ സംഘടനയുടെ ആദർശവും നയനിലപാടുകളും പ്രവർത്തന രീതിയും പഠിപ്പിക്കണം',
      'ശാഖാ കൗൺസിലിൽ എല്ലാ മെമ്പർമാരോടൊപ്പം SKSBV പ്രസിഡന്റ്, സെക്രട്ടറി, ട്രഷറർ എന്നിവരും കൗൺസിലർമാരാണ്',
    ],
    speech:
      'ഉപരിഘടകം നിയോഗിക്കുന്ന നിരീക്ഷകന്റെ സാന്നിധ്യത്തിൽ, മൂന്ന് മണിക്കൂർ ദൈർഘ്യമുള്ള കൗൺസിൽ ക്യാമ്പ് നടത്തി ആദർശം പഠിപ്പിച്ച ശേഷമാണ് പുതിയ കമ്മിറ്റി രൂപീകരിക്കുക!',
  },
  {
    id: 'role_returning',
    emoji: '🗳️',
    title: 'റിട്ടേണിംഗ് ഓഫീസർ (Returning Officer)',
    badge: 'തിരഞ്ഞെടുപ്പ് നിയന്ത്രണം',
    summary:
      'കൗൺസിൽ യോഗത്തിൽ പുതിയ ഭാരവാഹികളെ തിരഞ്ഞെടുക്കുന്ന പ്രക്രിയ ഔദ്യോഗികമായി നിയന്ത്രിക്കുന്നത് റിട്ടേണിംഗ് ഓഫീസറാണ്. വോട്ടെണ്ണലും സബ് വിംഗ് രൂപീകരണവും രേഖപ്പെടുത്തലും ഇദ്ദേഹത്തിന്റെ മേൽനോട്ടത്തിൽ നടക്കും.',
    rules: [
      'കൗൺസിൽ യോഗത്തിൽ തന്നെ പ്രധാന കമ്മിറ്റിയോടൊപ്പം സബ് വിംഗുകളും രൂപീകരിക്കണം',
      'തിരഞ്ഞെടുപ്പ് മിനിറ്റ്സ് തയ്യാറാക്കി ഉപരിഘടകത്തിന് കൃത്യമായി സമർപ്പിക്കണം',
      'സ്ഥിരതാമസമുള്ള സ്വന്തം മഹല്ലിൽ മാത്രമേ അംഗത്വവും ഭാരവാഹിത്വവും പാടുള്ളൂ',
    ],
    speech:
      'റിട്ടേണിംഗ് ഓഫീസറാണ് കൗൺസിൽ യോഗത്തിലെ ഭാരവാഹി തിരഞ്ഞെടുപ്പും സബ് വിംഗ് രൂപീകരണവും ഔദ്യോഗികമായി നിയന്ത്രിച്ച് മിനിറ്റ്സ് തയ്യാറാക്കുന്നത്!',
  },
  {
    id: 'role_organet_it',
    emoji: '💻',
    title: 'ഐ.ടി. കോർഡിനേറ്റർ (Organet IT)',
    badge: 'ഡിജിറ്റൽ രജിസ്ട്രേഷൻ & വെരിഫിക്കേഷൻ',
    summary:
      'മേഖല, ജില്ലാ, സംസ്ഥാന തലങ്ങളിലെ ഐ.ടി. കോർഡിനേറ്റർമാരാണ് ഓർഗാനെറ്റ് (Organet) പോർട്ടൽ വഴി ശാഖാ-ഭാരവാഹി വിവരങ്ങൾ വെരിഫൈ ചെയ്യുകയും അപ്രൂവ് ചെയ്യുകയും ചെയ്യുന്നത്.',
    rules: [
      'ഓരോ ശാഖയുടെയും അംഗത്വ-ഭാരവാഹി വിവരങ്ങൾ ഓർഗാനെറ്റിൽ കൃത്യമായി അപ്‌ലോഡ് ചെയ്യണം',
      'മേഖലാ ഐ.ടി. കോർഡിനേറ്റർ പ്രാഥമിക വെരിഫിക്കേഷനും ജില്ലാ ഐ.ടി. കോർഡിനേറ്റർ അപ്രൂവലും നടത്തുന്നു',
      'പ്രവർത്തന റിപ്പോർട്ടുകളും അറിയിപ്പുകളും തത്സമയം ശാഖകളിലേക്ക് എത്തിക്കുന്നു',
    ],
    speech:
      'ഓർഗാനെറ്റ് ഐ ടി കോർഡിനേറ്റർമാരാണ് ശാഖാ ഭാരവാഹി വിവരങ്ങളും പ്രവർത്തന റിപ്പോർട്ടുകളും ഡിജിറ്റലായി വെരിഫൈ ചെയ്ത് അപ്രൂവ് ചെയ്യുന്നത്!',
  },
];

const ISLAMIC_CENTRES_LIST = [
  {
    id: 'ic_kozhikode',
    city: 'കോഴിക്കോട് ഇസ്‌ലാമിക് സെന്റർ',
    subtitle: 'SKSSF സംസ്ഥാന കമ്മിറ്റി ആസ്ഥാനം',
    items: 'മസ്ജിദ് · സത്യധാര ഓഫീസ് · ട്രെൻഡ് പ്രീ-സ്കൂൾ ഓഫീസ് · സ്റ്റുഡന്റ്സ് ഹോസ്റ്റൽ · ഇൻഫർമേഷൻ ലൈബ്രറി · ഇസ (ISA) ബുക്ക് സ്റ്റാൾ',
    speech: 'കോഴിക്കോട് ഇസ്‌ലാമിക് സെന്ററിലാണ് SKSSF സംസ്ഥാന കമ്മിറ്റി ഓഫീസും സത്യധാരയും ലൈബ്രറിയും ഇസ ബുക്ക് സ്റ്റാളും പ്രവർത്തിക്കുന്നത്!',
  },
  {
    id: 'ic_cochin',
    city: 'കൊച്ചിൻ ഇസ്‌ലാമിക് സെന്റർ',
    subtitle: 'വെസ്റ്റ് കച്ചേരിപ്പടി, എറണാകുളം',
    items: 'ഹയർ സെക്കന്ററി മദ്രസ · പഠന-സേവന കേന്ദ്രം · സാംസ്കാരിക വേദി',
    speech: 'കൊച്ചിൻ വെസ്റ്റ് കച്ചേരിപ്പടിയിൽ ഹയർ സെക്കന്ററി മദ്രസയുമായി ഇസ്‌ലാമിക് സെന്റർ പ്രവർത്തിക്കുന്നു!',
  },
  {
    id: 'ic_mannarkkad',
    city: 'മണ്ണാർക്കാട് ഇസ്‌ലാമിക് സെന്റർ',
    subtitle: 'പാലക്കാട് ജില്ല',
    items: 'ഹിഫ്ളുൽ ഖുർആൻ അക്കാദമി · ജുമാ മസ്ജിദ് · കോൺഫറൻസ് ഹാൾ',
    speech: 'പാലക്കാട് മണ്ണാർക്കാട് ഇസ്‌ലാമിക് സെന്ററിൽ ഹിഫ്ളുൽ ഖുർആൻ അക്കാദമിയും ജുമാ മസ്ജിദും കോൺഫറൻസ് ഹാളും പ്രവർത്തിക്കുന്നു!',
  },
  {
    id: 'ic_kottoppadam',
    city: 'കോട്ടോപ്പാടം ഇസ്‌ലാമിക് സെന്റർ',
    subtitle: 'പാലക്കാട് ജില്ല · വനിതാ & സാങ്കേതിക വിദ്യാഭ്യാസം',
    items: 'മഹ്ദിയ്യ വനിതാ അക്കാദമി · റോബോട്ടിക്സ് & സാങ്കേതിക ട്രെയിനിംഗ് സെന്റർ',
    speech: 'കോട്ടോപ്പാടം ഇസ്‌ലാമിക് സെന്ററിൽ മഹ്ദിയ്യ വനിതാ അക്കാദമിയും റോബോട്ടിക്സ് ട്രെയിനിംഗ് സെന്ററും പ്രവർത്തിക്കുന്നു!',
  },
  {
    id: 'ic_athavanad',
    city: 'ആതവനാട് ഇസ്‌ലാമിക് സെന്റർ',
    subtitle: 'മലപ്പുറം ജില്ല · മോഡൽ സ്കൂൾ',
    items: 'ഉമറലി ശിഹാബ് തങ്ങൾ മോഡൽ സ്കൂൾ · ആധുനിക-ധാർമ്മിക വിദ്യാഭ്യാസ കേന്ദ്രം',
    speech: 'ആതവനാട് ഇസ്‌ലാമിക് സെന്ററിൽ ഉമറലി ശിഹാബ് തങ്ങൾ മോഡൽ സ്കൂൾ പ്രവർത്തിക്കുന്നു!',
  },
  {
    id: 'ic_veliyankode',
    city: 'വെളിയങ്കോട് ഇസ്‌ലാമിക് സെന്റർ',
    subtitle: 'മലപ്പുറം ജില്ല · വനിതാ പഠന കേന്ദ്രം',
    items: 'മഹ്ദിയ്യ വനിതാ അക്കാദമി · മത-ഭൗതിക സമന്വയ വിദ്യാഭ്യാസം',
    speech: 'വെളിയങ്കോട് ഇസ്‌ലാമിക് സെന്ററിൽ മഹ്ദിയ്യ വനിതാ അക്കാദമി പ്രവർത്തിക്കുന്നു!',
  },
  {
    id: 'ic_ponnani',
    city: 'പൊന്നാനി ഇസ്‌ലാമിക് സെന്റർ & വാദിസകൻ',
    subtitle: 'മലപ്പുറം ജില്ല · ദഅ്‌വത്ത് & സാന്ത്വന കേന്ദ്രങ്ങൾ',
    items: 'പൊന്നാനി ഇബാദ് ഇൻഫർമേഷൻ & ദഅ്‌വത്ത് സെന്റർ · വാദിസകൻ (അരീക്കോട്) സാന്ത്വന കേന്ദ്രം',
    speech: 'പൊന്നാനിയിൽ ഇബാദ് ഇൻഫർമേഷൻ സെന്ററും അരീക്കോട് വാദിസകൻ സാന്ത്വന കേന്ദ്രവും പ്രവർത്തിക്കുന്നു!',
  },
  {
    id: 'ic_vannappuram',
    city: 'വണ്ണപ്പുറം ഇസ്‌ലാമിക് സെന്റർ',
    subtitle: 'ഇടുക്കി ജില്ല · റെസിഡൻഷ്യൽ സയൻസ് സ്കൂൾ',
    items: 'ദാറു റഹ്മ റെസിഡൻഷ്യൽ സയൻസ് സ്കൂൾ · മലയോര മേഖലയിലെ വിദ്യാഭ്യാസ വെളിച്ചം',
    speech: 'ഇടുക്കി വണ്ണപ്പുറം ഇസ്‌ലാമിക് സെന്ററിൽ ദാറു റഹ്മ റെസിഡൻഷ്യൽ സയൻസ് സ്കൂൾ പ്രവർത്തിക്കുന്നു!',
  },
  {
    id: 'ic_hostels',
    city: 'ഡൽഹി & ബെംഗളൂരു SKSSF ഹോസ്റ്റലുകൾ',
    subtitle: 'ദേശീയ സമിതി · ഉന്നത പഠന പിന്തുണ',
    items: 'ഡൽഹി ജാമിഅ നഗർ SKSSF ഹോസ്റ്റൽ · ബെംഗളൂരു ഹെബ്ബാൾ SKSSF ഹോസ്റ്റൽ · പ്രീമിയർ യൂണിവേഴ്സിറ്റി വിദ്യാർത്ഥി കൂട്ടായ്മ',
    speech: 'ദേശീയ സർവ്വകലാശാലകളിൽ പഠിക്കുന്ന വിദ്യാർത്ഥികൾക്കായി ഡൽഹി ജാമിഅ നഗറിലും ബെംഗളൂരു ഹെബ്ബാളിലും എസ് കെ എസ് എസ് എഫ് ഹോസ്റ്റലുകൾ പ്രവർത്തിക്കുന്നു!',
  },
];

const WING_CATEGORY_TABS: { id: 'all' | WingCategory; label: string }[] = [
  { id: 'all', label: '🌟 എല്ലാം (17)' },
  { id: 'service', label: '🩸 സേവനം & കാരുണ്യം' },
  { id: 'education', label: '🎓 വിദ്യാഭ്യാസം & ക്യാമ്പസ്' },
  { id: 'ideology', label: '🕌 ആദർശം & ആത്മീയം' },
  { id: 'media_org', label: '📱 മീഡിയ & സംഘടന' },
];

const WING_EMOJIS: Record<string, string> = {
  ibad: '🕌',
  trend: '🎓',
  viqaya: '🩸',
  campus: '🏛️',
  thwalaba: '📖',
  sargalayam: '🎤',
  maneesha: '✍️',
  cyber: '📱',
  isthiqama: '🛡️',
  sahachari: '🏥',
  organet: '🗂️',
  ifc: '🏠',
  meem: '🩺',
  sathyadhara: '📰',
  imt: '🤝',
  national_committee: '🇮🇳',
  forward_isa: '📚',
};

const SHORT_WING_CUES: Record<string, string> = {
  ibad: 'ദഅ്‌വത്ത് · ഖാഫില · ITC',
  trend: 'കരിയർ · CDP · AISER · പ്രീ-സ്കൂൾ',
  viqaya: 'രക്തദാനം · ALERT · ആംബുലൻസ് · ഹജ്ജ്',
  campus: 'ക്യാമ്പസ് കോൾ · കയാക്ക് · +2 വിംഗ്',
  thwalaba: 'ദർസ് & അറബിക് കോളേജ്',
  sargalayam: 'കലാ-സാഹിത്യ പ്രതിഭാ വേദി',
  maneesha: 'ബൗദ്ധിക-സാംസ്കാരിക ഇടപെടൽ',
  cyber: 'മീഡിയ · SKICR · സൈബർ കവചം',
  isthiqama: 'ആദർശ സംരക്ഷണ സംവാദം',
  sahachari: 'ആശുപത്രി സാന്ത്വനം · ചികിത്സാ സഹായം',
  organet: 'യൂണിറ്റ് അപ്‌ഡേറ്റ് & അച്ചടക്കം',
  ifc: '20 വീടുകളുടെ ഫാമിലി ക്ലസ്റ്റർ',
  meem: 'മെഡിക്കൽ ക്ലിനിക് & ഹെൽത്ത് ക്യാമ്പ്',
  sathyadhara: '1997 ഔദ്യോഗിക ദ്വൈവാരിക',
  imt: 'ഇസ്‌ലാമിക് മീറ്റ് & സ്നേഹസംഗമം',
  national_committee: 'ഡൽഹി/ബെംഗളൂരു ഹോസ്റ്റൽ & പ്രവാസി',
  forward_isa: 'ഫോർവേഡ് ഫൗണ്ടേഷൻ & ISA പുസ്തകങ്ങൾ',
};

const OFFICIAL_LOGOS_VAULT = [
  { id: 'skju', title: '📰 SKJU · അൽ ബയാൻ · സുപ്രഭാതം', img: './assets/official/logo_samastha.png' },
  { id: 'skimvb', title: '🏫 SKIMVB · ജാമിഅ നൂരിയ്യ · SNEC', img: './assets/aistudio/image_e03981e1.png' },
  { id: 'sys_smf', title: '🕌 SMF & SYS · സുന്നി അഫ്കാർ', img: './assets/official/logo_smf.png' },
  { id: 'sksbv', title: '🌟 SKSBV · മജ്‌ലിസുൽ മആരിഫ്', img: './assets/official/logo_sksbv.png' },
  { id: 'special_cells', title: '🌍 SKJQ · SEA · SLC · SPC · SIC', img: './assets/official/logo_sic.png' },
];

const DAWA_AGE_PATHS = [
  {
    id: 'age_kids',
    emoji: '🌱',
    ageBadge: 'കുട്ടികൾ (മദ്രസ പ്രായം)',
    wing: 'SKSBV (സുന്നി ബാല വേദി)',
    title: 'മദ്രസയിലെ ഉസ്താദുമാരോട് സംസാരിച്ച് SKSBV-യിൽ ചേരാം!',
    detail:
      'നമ്മുടെ നാട്ടിലെ മദ്രസകളിലെ ഉസ്താദുമാരുമായി സ്നേഹത്തോടെ സംസാരിച്ച് ചെറിയ കുട്ടികൾക്കെല്ലാം SKSBV (എസ്.കെ.എസ്.ബി.വി) ബാലവേദിയിൽ ഉഷാറായി പ്രവർത്തിക്കാം!',
    speech:
      'ചെറിയ കൂട്ടുകാരേ! നമ്മുടെ നാടുകളിലെ മദ്രസകളിലെ ഉസ്താദുമാരുമായി സംസാരിച്ച് ചെറിയ കുട്ടികൾക്കെല്ലാം എസ് കെ എസ് ബി വി എന്ന സംഘടനയിൽ സന്തോഷത്തോടെ പ്രവർത്തിക്കാം!',
  },
  {
    id: 'age_14',
    emoji: '🎓',
    ageBadge: '14 മുതൽ 40 വയസ്സ് വരെ',
    wing: 'SKSSF (സുന്നി സ്റ്റുഡന്റ്സ് ഫെഡറേഷൻ)',
    title: '40 വയസ്സ് വരെയും SKSSF-ൽ തന്നെ പ്രവർത്തിക്കാം!',
    detail:
      'SKSSF-ൽ 14 മുതൽ 40 വയസ്സ് വരെയാണ് പ്രായപരിധി. 40 വയസ്സ് വരെയും SKSSF-ൽ തന്നെ സജീവമായി പ്രവർത്തിക്കാം! കൂടാതെ SKSSF-ൽ പ്രവർത്തിക്കുന്നവർക്കും SYS-ൽ പ്രവർത്തിക്കാം.',
    speech:
      'എസ് കെ എസ് എസ് എഫിൽ പതിനാല് മുതൽ നാൽപ്പത് വയസ്സ് വരെയാണ് പ്രായപരിധി. നാൽപ്പത് വയസ്സ് വരെയും എസ് കെ എസ് എസ് എഫിൽ തന്നെ പ്രവർത്തിക്കാം. കൂടാതെ എസ് കെ എസ് എസ് എഫിൽ പ്രവർത്തിക്കുന്നവർക്കും എസ് വൈ എസ്സിൽ പ്രവർത്തിക്കാം!',
  },
  {
    id: 'age_18',
    emoji: '🧔',
    ageBadge: '18 വയസ്സിന് മുകളിൽ (18+)',
    wing: 'SYS (സുന്നി യുവജന സംഘം)',
    title: '18 വയസ്സ് കഴിഞ്ഞാൽ SYS-ലും പ്രവർത്തിക്കാം!',
    detail:
      '18 വയസ്സിന് മുകളിലുള്ളവർക്ക് SYS (എസ്.വൈ.എസ്)-ൽ അംഗത്വം എടുത്ത് നാട്ടിലെ മഹല്ലിലും സേവന പ്രവർത്തനങ്ങളിലും പങ്കാളിയാകാം. SKSSF-ൽ പ്രവർത്തിക്കുന്നവർക്കും SYS-ൽ ഒരുമിച്ച് പ്രവർത്തിക്കാൻ സാധിക്കും!',
    speech:
      'പതിനെട്ട് വയസ്സിന് മുകളിലുള്ളവർക്ക് എസ് വൈ എസ്സിൽ അംഗത്വം എടുത്ത് പ്രവർത്തിക്കാം. എസ് കെ എസ് എസ് എഫിൽ പ്രവർത്തിക്കുന്നവർക്കും എസ് വൈ എസ്സിൽ പ്രവർത്തിക്കാം!',
  },
  {
    id: 'age_all',
    emoji: '🌍',
    ageBadge: 'കുട്ടിയായാലും മുതിർന്നവനായാലും',
    wing: 'സമസ്തയുടെ എല്ലാ സംവിധാനങ്ങളും',
    title: 'എല്ലാവർക്കും പ്രായത്തിനനുസരിച്ച് ദീനീ ദഅ്‌വത്ത് ചെയ്യാം!',
    detail:
      'മദ്‌റസാ പ്രായത്തിൽ SKSBV, 14 മുതൽ 40 വയസ്സ് വരെ SKSSF, 18 വയസ്സിന് മുകളിൽ SYS എന്നിങ്ങനെ സമസ്തയുടെ സംഘടനകളിൽ പ്രവർത്തിച്ച് നാട്ടിൽ ദീനീ ദഅ്‌വത്ത് സജീവമാക്കാം.',
    speech:
      'കുട്ടികൾക്ക് എസ് കെ എസ് ബി വി, പതിനാല് മുതൽ നാൽപ്പത് വയസ്സ് വരെ എസ് കെ എസ് എസ് എഫ്, പതിനെട്ടിന് മുകളിൽ എസ് വൈ എസ് എന്നിങ്ങനെ എല്ലാവർക്കും സമസ്തയുടെ സംവിധാനങ്ങളിൽ ദീനീ ദഅ് വത്ത് ചെയ്യാം!',
  },
];

const DAWA_TOWN_MISSIONS = [
  {
    id: 'dm1',
    emoji: '💡',
    title: '1. സമസ്ത സംവിധാനങ്ങൾ ബോധപൂർവ്വം വളർത്തുക',
    desc: 'സമസ്തയുടെ സംവിധാനങ്ങൾ വെറുതെ നോക്കിയിരിക്കാതെ, അറിഞ്ഞ് ബോധപൂർവ്വം വളർത്തിക്കൊടുക്കുകയും ശക്തിപ്പെടുത്തുകയും വേണം!',
    speech: 'ഒന്നാമത്തെ വഴി: സമസ്തയുടെ സംവിധാനങ്ങൾ അറിഞ്ഞ് നമ്മൾ ബോധപൂർവ്വം വളർത്തിക്കൊടുക്കുകയും സജീവമാക്കുകയും വേണം!',
  },
  {
    id: 'dm2',
    emoji: '🤝',
    title: '2. യൂണിറ്റ് മുതൽ ജില്ലാ കമ്മിറ്റിയുമായി ബന്ധപ്പെടുക',
    desc: 'നമ്മുടെ നാട്ടിലുള്ള യൂണിറ്റ് കമ്മിറ്റി, ക്ലസ്റ്റർ കമ്മിറ്റി, മേഖലാ കമ്മിറ്റി, ജില്ലാ കമ്മിറ്റി തുടങ്ങിയ കമ്മിറ്റികളുമായി പോയി ബന്ധപ്പെടുക!',
    speech: 'രണ്ടാമത്തെ വഴി: നാട്ടിലുള്ള യൂണിറ്റ് കമ്മിറ്റി, ക്ലസ്റ്റർ കമ്മിറ്റി, മേഖലാ കമ്മിറ്റി, ജില്ലാ കമ്മിറ്റി തുടങ്ങിയ കമ്മിറ്റികളുമായി ബന്ധപ്പെടുക!',
  },
  {
    id: 'dm3',
    emoji: '🔍',
    title: '3. നാട്ടിലുള്ള മറ്റു സമസ്ത സംഘടനകൾ കണ്ടെത്തുക',
    desc: 'നമ്മുടെ നാട്ടിൽ സമസ്തയുടെ ഏതൊക്കെ സംഘടനകളും ഉപസംഘടനകളുമാണ് നിലവിലുള്ളത് എന്ന് അന്വേഷിച്ച് കണ്ടുപിടിക്കുക!',
    speech: 'മൂന്നാമത്തെ വഴി: സമസ്തയുടെ മറ്റു സംഘടനകൾ ഏതൊക്കെയാണ് നമ്മുടെ നാട്ടിലുള്ളത് എന്ന് അന്വേഷിച്ച് കണ്ടുപിടിക്കുക!',
  },
  {
    id: 'dm4',
    emoji: '🏗️',
    title: '4. ഇല്ലാത്ത ഉപസംഘടനകൾ ഉണ്ടാക്കിയെടുക്കുക',
    desc: 'നമ്മുടെ നാട്ടിൽ ഇതുവരെ തുടങ്ങാത്ത സമസ്തയുടെ സംഘടനകളും ഉപസംഘടനകളും മുതിർന്നവരുടെ സഹായത്തോടെ പുതുതായി ഉണ്ടാക്കിയെടുക്കുക!',
    speech: 'നാലാമത്തെ വഴി: നാട്ടിൽ ഇല്ലാത്ത സമസ്തയുടെ സംഘടനകളും ഉപസംഘടനകളും പുതുതായി ഉണ്ടാക്കിയെടുക്കുക!',
  },
  {
    id: 'dm5',
    emoji: '📢',
    title: '5. മീറ്റിംഗുകളും നല്ല പരിപാടികളും സംഘടിപ്പിക്കുക',
    desc: 'കൂട്ടുകാരെയും നാട്ടുകാരെയും ഉൾപ്പെടുത്തി പഠന ക്ലാസുകളും നല്ല മീറ്റിംഗുകളും ദീനീ പരിപാടികളും സന്തോഷത്തോടെ സംഘടിപ്പിക്കുക!',
    speech: 'അഞ്ചാമത്തെ വഴി: മീറ്റിംഗുകളും നല്ല പരിപാടികളും സംഘടിപ്പിച്ച് നാട്ടിൽ ദീനീ ദഅ് വത്ത് എത്തിക്കുക!',
  },
];

export const Level2Ecosystem: React.FC<Level2EcosystemProps> = ({
  isCompleted,
  initialTab = 'memory',
  onAwardXp,
  onUnlockBadge,
  onCompleteLevel,
  onActiveLessonChange,
  onMarkLessonCompleted,
  completedLessonIds = [],
  quizAnswers,
  onQuizAnswered,
  collectedEggs = [],
  onClaimEasterEgg,
  onOpenBadgeStudio,
  devUnlocked = false,
}) => {
  const [activeTab, setActiveTab] = useState<L2GameTab>(initialTab);
  const [glitterKey, setGlitterKey] = useState(0);
  const [glitterMsg, setGlitterMsg] = useState('');

  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<FlagId[]>([]);
  const [memoryToast, setMemoryToast] = useState<string | null>(null);
  const [memoryMistakes, setMemoryMistakes] = useState<number>(0);

  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(0);
  const [exploredTiers, setExploredTiers] = useState<string[]>(['tier_shakha']);
  const [roleIdx, setRoleIdx] = useState<number>(0);
  const [exploredRoles, setExploredRoles] = useState<number[]>([0]);
  const [centreIdx, setCentreIdx] = useState<number>(0);
  const [exploredCentres, setExploredCentres] = useState<number[]>([0]);

  const [caseIdx, setCaseIdx] = useState(0);
  const [solvedCases, setSolvedCases] = useState<string[]>([]);
  const [wingFilter, setWingFilter] = useState<'all' | WingCategory>('all');
  const [combo, setCombo] = useState(0);
  const [dispatchMistakes, setDispatchMistakes] = useState<number>(0);
  const [dispatchToast, setDispatchToast] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const [selectedAgeId, setSelectedAgeId] = useState<string>(DAWA_AGE_PATHS[0].id);
  const [exploredAges, setExploredAges] = useState<string[]>([DAWA_AGE_PATHS[0].id]);
  const [litDawaMissions, setLitDawaMissions] = useState<string[]>([]);

  const [selectedVaultId, setSelectedVaultId] = useState<string>('skju');
  const [exploredVaults, setExploredVaults] = useState<string[]>(['skju']);
  const [wingPopup, setWingPopup] = useState<SubWingInfo | null>(null);
  const [completedSceneGames, setCompletedSceneGames] = useState<string[]>([]);

  const activeCase = HELPDESK_CASES[caseIdx];
  const filteredWings =
    wingFilter === 'all'
      ? SKSSF_SUBWINGS
      : SKSSF_SUBWINGS.filter((w) => w.category === wingFilter);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    onActiveLessonChange?.(`l2_${activeTab}`);
  }, [activeTab, onActiveLessonChange]);

  useEffect(() => {
    if (activeTab === 'memory') {
      narrator.speak(
        'രണ്ട് കാർഡുകൾ മറിച്ചുനോക്കി പതാകയും അതിന്റെ വിവരണവും ജോഡി ചേർക്കൂ!',
        '🃏 പതാക മെമ്മറി'
      );
    } else if (activeTab === 'madrasa_board') {
      narrator.speak(
        'മദ്രസാ ബോർഡ് ആക്ടിവിറ്റി! ബോർഡിലെ പൊടി തുടച്ച് മനോഹരമായി അലങ്കരിക്കൂ!',
        '🏫 മദ്രസാ ബോർഡ് അലങ്കാരം'
      );
    } else if (activeTab === 'tiers') {
      narrator.speak(
        'ശാഖ മുതൽ സംസ്ഥാനം വരെയുള്ള അഞ്ച് ഘടകങ്ങളുടെ കൃത്യമായ ഭാരവാഹി ഘടന ഓരോ കാർഡിലും തൊട്ട് അവിടെത്തന്നെ പഠിക്കാം!',
        '📊 5 ഘടക ഘടന'
      );
    } else if (activeTab === 'election_roles') {
      narrator.speak(
        'കമ്മിറ്റി രൂപീകരണത്തിലെ ഔദ്യോഗിക തിരഞ്ഞെടുപ്പ് സ്ഥാനങ്ങളും ഭരണഘടനാ ചട്ടങ്ങളും പരിചയപ്പെടാം!',
        '🗳️ തിരഞ്ഞെടുപ്പ് സ്ഥാനങ്ങൾ'
      );
    } else if (activeTab === 'centres') {
      narrator.speak(
        'എസ് കെ എസ് എസ് എഫിന്റെ എട്ട് ഇസ്‌ലാമിക് സെന്ററുകളും ഡൽഹി ബെംഗളൂരു ഹോസ്റ്റലുകളും പരിചയപ്പെടാം!',
        '🕌 8 ഇസ്‌ലാമിക് സെന്ററുകൾ'
      );
    } else if (activeTab === 'dispatch') {
      narrator.speak(`${activeCase.title}. ${activeCase.scenario}`, activeCase.title);
    } else if (activeTab === 'dawa_age') {
      narrator.speak(
        'നിങ്ങളുടെ പ്രായം തിരഞ്ഞെടുക്കൂ — ഏത് സംഘടനയിൽ പ്രവർത്തിക്കാം എന്ന് അവിടെത്തന്നെ കാണാം!',
        '🎯 പ്രായവും സംഘടനയും'
      );
    } else if (activeTab === 'dawa_lanterns') {
      narrator.speak(
        'നാട്ടിൽ ദീനീ ദഅ്‌വത്ത് വളർത്താൻ അഞ്ച് കർമ്മ വിളക്കുകൾ ഓരോന്നായി തെളിയിക്കൂ!',
        '🏮 5 ദഅ്‌വത്ത് വിളക്കുകൾ'
      );
    } else {
      narrator.speak(
        'സമസ്തയുടെ പത്രങ്ങളും വിദ്യാഭ്യാസ സ്ഥാപനങ്ങളും ആഗോള സെല്ലുകളും ഓരോ കാർഡിലും തൊട്ട് അവിടെത്തന്നെ വായിക്കാം!',
        '📚 പത്രങ്ങളും സ്ഥാപനങ്ങളും'
      );
    }
  }, [activeTab]);

  const triggerGlitter = (msg: string) => {
    setGlitterMsg(msg);
    setGlitterKey((k) => k + 1);
  };

  const renderRealAsset = (id: FlagId, sizeClass = 'w-20 h-20') => {
    switch (id) {
      case 'skju':
        return <OfficialSamasthaFlagImg className={sizeClass} />;
      case 'skimvb':
        return <OfficialSkimvbLogoImg className={sizeClass} />;
      case 'skssf':
        return <OfficialSkssfFlagImg className={sizeClass} />;
      case 'sksbv':
        return <OfficialSksbvFlagImg className={sizeClass} />;
    }
  };

  const memoryFailed = memoryMistakes >= 6 && matchedPairs.length < 4;
  const dispatchFailed = dispatchMistakes >= 3 && solvedCases.length < HELPDESK_CASES.length;

  const handleFlipMemory = (card: MemoryCard) => {
    if (memoryFailed) return;
    if (matchedPairs.includes(card.pairId) || flippedUids.includes(card.uid)) return;
    if (flippedUids.length >= 2) return;

    sound.playPop();
    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      const first = MEMORY_DECK.find((c) => c.uid === nextFlipped[0])!;
      if (first.pairId === card.pairId) {
        sound.playSuccess(matchedPairs.length + 1);
        const nextMatched = [...matchedPairs, first.pairId];
        setMatchedPairs(nextMatched);
        onAwardXp(25, `l2_mem_${first.pairId}`);
        setMemoryToast(`🎉 ജോഡി ചേർന്നു! ${first.pairId.toUpperCase()} (+25 XP)`);
        triggerGlitter(`✨ ${first.pairId.toUpperCase()} ജോഡി ചേർന്നു!`);
        narrator.speak(card.speech, `${first.pairId.toUpperCase()} · ${card.speech}`);
        setTimeout(() => setFlippedUids([]), 400);
        if (nextMatched.length >= 4) {
          window.setTimeout(() => scrollToActiveQuiz(), 950);
        }
      } else {
        sound.playError();
        const nextM = memoryMistakes + 1;
        setMemoryMistakes(nextM);
        setMemoryToast(
          nextM >= 6
            ? '💥 6 തെറ്റുകൾ! മെമ്മറി ചലഞ്ച് പരാജയപ്പെട്ടു — വീണ്ടും ശ്രമിക്കാം!'
            : `ചേരുന്നില്ല 😅 (${6 - nextM} അവസരം ബാക്കി) — വീണ്ടും മറിച്ചുനോക്കൂ!`
        );
        setTimeout(() => setFlippedUids([]), 850);
      }
    }
  };

  const handleInspectTier = (idx: number) => {
    const spec = COMMITTEE_TIER_SPECS[idx];
    if (!spec) return;
    sound.playSuccess(exploredTiers.length + 1);
    setSelectedTierIdx(idx);
    if (!exploredTiers.includes(spec.id)) {
      const next = [...exploredTiers, spec.id];
      setExploredTiers(next);
      onAwardXp(15, `l2_${spec.id}`);
      triggerGlitter(`🏛️ ${spec.tier}: ${spec.totalMembers} അംഗ ഘടന പഠിച്ചു! (+15 XP)`);
      if (next.length === COMMITTEE_TIER_SPECS.length) {
        onUnlockBadge('🏛️ കമ്മിറ്റി കൂട്ടുകാരൻ');
      }
    }
    narrator.speak(spec.speech, `${spec.emoji} ${spec.tier} (${spec.totalMembers} അംഗങ്ങൾ)`);
  };

  const handleRouteMissionToWing = (wingId: string) => {
    if (dispatchFailed) return;
    if (wingId === activeCase.correctWingId) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      sound.playSuccess(nextCombo);
      if (!solvedCases.includes(activeCase.id)) {
        const nextSolved = [...solvedCases, activeCase.id];
        setSolvedCases(nextSolved);
        onAwardXp(30 + nextCombo * 5, `l2_dispatch_${activeCase.id}`);
        if (nextSolved.length >= HELPDESK_CASES.length) {
          window.setTimeout(() => scrollToActiveQuiz(), 950);
        }
      }
      setDispatchToast({
        ok: true,
        text: `🔥 കോംബോ x${nextCombo}! ${activeCase.explanation}`,
      });
      triggerGlitter(`🚑 സഹായ വണ്ടി എത്തി! +${30 + nextCombo * 5} XP`);
      narrator.speak(activeCase.explanation, activeCase.title);
    } else {
      setCombo(0);
      sound.playError();
      const nextM = dispatchMistakes + 1;
      setDispatchMistakes(nextM);
      const picked = SKSSF_SUBWINGS.find((w) => w.id === wingId);
      setDispatchToast({
        ok: false,
        text:
          nextM >= 3
            ? '💥 3 തവണ തെറ്റായ വിംഗിലേക്ക് അയച്ചു! സഹായ ദൗത്യം പരാജയപ്പെട്ടു — വീണ്ടും ശ്രമിക്കാം!'
            : `“${picked?.name}” അല്ല 😅 (${3 - nextM} അവസരം ബാക്കി) — ഓരോ കാർഡിലുമുള്ള വിവരണം നോക്കി തിരഞ്ഞെടുക്കൂ!`,
      });
    }
  };

  const handleFinishLevel2 = () => {
    sound.playUnlock();
    onAwardXp(60, 'l2_complete');
    onUnlockBadge('🏛️ മേഖലാ താരം');
    narrator.speak(
      'മികച്ച പ്രകടനം! ക്ലസ്റ്റർ, മേഖലാ തലം പൂർത്തിയായി. ഇനി ജില്ലാ തലത്തിലേക്ക് കടക്കാം!'
    );
    onCompleteLevel();
  };

  const isSceneDone = (lessonId: string) =>
    completedSceneGames.includes(lessonId) || completedLessonIds.includes(lessonId);

  const l2Tabs: { id: L2GameTab; label: string }[] = [
    { id: 'memory', label: '1. പതാക മെമ്മറി' },
    { id: 'madrasa_board', label: '2. മദ്രസാ ബോർഡ് അലങ്കാരം' },
    { id: 'tiers', label: '3. 5 ഘടക ഘടന' },
    { id: 'election_roles', label: '4. കമ്മിറ്റി സ്ഥാനങ്ങൾ' },
    { id: 'centres', label: '5. 8 ഇസ്‌ലാമിക് സെന്ററുകൾ' },
    { id: 'dispatch', label: '6. 17 വിങ്ങുകൾ & സേവന ദൗത്യം' },
    { id: 'dawa_age', label: '7. പ്രായപരിധിയും സംഘടനയും' },
    { id: 'dawa_lanterns', label: '8. 5 ദഅ്‌വത്ത് വിളക്കുകൾ' },
    { id: 'vault', label: '9. പത്രങ്ങളും സ്ഥാപനങ്ങളും' },
  ];
  const activeTabIdx = l2Tabs.findIndex((t) => t.id === activeTab);
  const isLastL2Tab = activeTabIdx === l2Tabs.length - 1;
  const currentTabDone =
    devUnlocked ||
    isCompleted ||
    completedLessonIds.includes(`l2_${activeTab}`) ||
    Boolean(quizAnswers[`l2_${activeTab}`]);

  const handleAdvanceL2Tab = () => {
    onMarkLessonCompleted?.(`l2_${activeTab}`);
    if (!isLastL2Tab) {
      setActiveTab(l2Tabs[activeTabIdx + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinishLevel2();
    }
  };

  const getTabRequirementHint = (tab: L2GameTab): string => {
    const quizDone = Boolean(quizAnswers[`l2_${tab}`]) || completedLessonIds.includes(`l2_${tab}`);
    if (quizDone) {
      return tab === 'vault'
        ? 'ക്ലസ്റ്റർ & മേഖലാ തലം പൂർത്തിയായി — ഇനി ഘട്ടം 3 (ജില്ലാ തലം) കടക്കാം!'
        : 'ഈ പാഠം പൂർത്തിയായി — ഇനി അടുത്ത പാഠത്തിലേക്ക് കടക്കാം!';
    }
    return 'മുകളിലെ ക്വിസിന് ഉത്തരം നൽകിയാൽ അടുത്ത പാഠം തുറക്കും!';
  };

  return (
    <section className="space-y-4">
      {/* 1. GAME FIRST FOR ALL LESSON TABS */}
      {(activeTab === 'tiers' ||
        activeTab === 'election_roles' ||
        activeTab === 'centres' ||
        activeTab === 'dawa_age' ||
        activeTab === 'dawa_lanterns' ||
        activeTab === 'vault') && (
        <OptionalLessonMiniGame
          key={`l2_${activeTab}`}
          lessonKey={`l2_${activeTab}` as MiniGameLessonKey}
          onAwardXp={onAwardXp}
          isCompleted={isSceneDone(`l2_${activeTab}`)}
          onComplete={() => {
            const lid = `l2_${activeTab}`;
            setCompletedSceneGames((prev) => (prev.includes(lid) ? prev : [...prev, lid]));
            if (quizAnswers[lid]) onMarkLessonCompleted?.(lid);
          }}
        />
      )}

      {/* GAME 2A: GOLDEN TILE MEMORY PAIR BOARD (Visually Distinct from Level 1 Flip Cards) */}
      {activeTab === 'memory' && (
        <GameFullscreenShell
          title="🃏 പതാക മെമ്മറി ഗെയിം"
          subtitle="രണ്ട് സ്വർണ്ണ ടൈലുകൾ തുറന്ന് പതാകയും അതിന്റെ പേരും ജോഡി ചേർക്കൂ!"
        >
          <div className="relative bg-amber-50/50 rounded-2xl border-2 border-amber-200 p-4 sm:p-5 space-y-4 overflow-hidden">
            <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
            <div className="flex items-center justify-between gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-extrabold tabular-nums">
              <span className="text-amber-950">
                🃏 {matchedPairs.length}/4
              </span>
              {memoryToast && (
                <span className="text-[11px] font-bold text-emerald-900 break-words">
                  {memoryToast}
                </span>
              )}
              <GameShatterLives
                lives={Math.max(0, 6 - memoryMistakes)}
                maxLives={6}
                dark={false}
                compact
              />
            </div>

            {memoryFailed && (
              <GameDefeatBurstOverlay
                title="പതാക മെമ്മറി തോറ്റു!"
                reason="6 കവചങ്ങളും തകർന്നു — പതാകകളും പേരുകളും ഓർത്തുവെച്ച് വീണ്ടും കളിക്കാം!"
                onRetry={() => {
                  sound.playClick();
                  setMemoryMistakes(0);
                  setFlippedUids([]);
                  setMatchedPairs([]);
                  setMemoryToast(null);
                }}
                overlay={false}
              />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MEMORY_DECK.map((card, tileIdx) => {
                const isOpen =
                  matchedPairs.includes(card.pairId) || flippedUids.includes(card.uid);
                const isMatched = matchedPairs.includes(card.pairId);
                return (
                  <button
                    key={card.uid}
                    type="button"
                    onClick={() => handleFlipMemory(card)}
                    className={`h-32 sm:h-36 rounded-2xl border-2 p-3 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      isMatched
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                        : isOpen
                        ? 'bg-white border-amber-500 shadow-md scale-[1.02]'
                        : 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 border-amber-800 text-white hover:brightness-105 shadow-sm'
                    }`}
                  >
                    {!isOpen ? (
                      <>
                        <span className="text-2xl font-extrabold text-amber-100 tabular-nums">
                          #{tileIdx + 1}
                        </span>
                        <span className="text-lg mt-1">✨</span>
                      </>
                    ) : card.kind === 'image' ? (
                      renderRealAsset(card.pairId, 'w-20 h-20')
                    ) : (
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                        {card.label}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            {matchedPairs.length === 4 && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    scrollToActiveQuiz();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-b-4 border-amber-700 text-xs sm:text-sm font-extrabold shadow-sm"
                >
                  അടുത്തത് · ക്വിസ് ➡️
                </button>
              </div>
            )}
          </div>
        </GameFullscreenShell>
      )}

      {/* GAME 2A-2: DEDICATED MADRASA BOARD SCRATCH & DECORATE GAME */}
      {activeTab === 'madrasa_board' && (
        <div className="space-y-4">
          <MadrasaBoardActivity
            onAwardXp={onAwardXp}
            onUnlockBadge={onUnlockBadge}
            onOpenBadgeStudio={onOpenBadgeStudio}
            onComplete={() => {
              setCompletedSceneGames((prev) =>
                prev.includes('l2_madrasa_board') ? prev : [...prev, 'l2_madrasa_board']
              );
              if (quizAnswers.l2_madrasa_board) onMarkLessonCompleted?.('l2_madrasa_board');
              window.setTimeout(() => scrollToActiveQuiz(), 850);
            }}
          />
        </div>
      )}

      {/* GAME 2C: GUIDED 2D HELP-EXPRESS WING DISPATCH */}
      {activeTab === 'dispatch' && (
        <GameFullscreenShell
          title="🚑 17 സബ് വിങ്ങുകൾ · സഹായ ദൗത്യം"
          subtitle="ഓരോ സഹായ ദൗത്യവും ശരിയായ സബ് വിംഗിലേക്ക് അയക്കൂ"
        >
        <div className="relative space-y-4">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold text-slate-600">
                  🚑 സഹായ ദൗത്യം {caseIdx + 1} / {HELPDESK_CASES.length}
                </span>
                <GameShatterLives
                  lives={Math.max(0, 3 - dispatchMistakes)}
                  maxLives={3}
                  dark={false}
                  compact
                />
                {combo > 1 && (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-red-700">
                    <Flame className="w-4 h-4 text-orange-500" /> Combo x{combo} 🔥
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {HELPDESK_CASES.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCaseIdx(idx);
                      setDispatchToast(null);
                      narrator.speak(c.scenario, c.title);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-bold border ${
                      idx === caseIdx
                        ? 'bg-red-900 text-white border-red-900'
                        : solvedCases.includes(c.id)
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {dispatchFailed && (
              <GameDefeatBurstOverlay
                title="സഹായ ദൗത്യം പരാജയപ്പെട്ടു!"
                reason="3 തവണ തെറ്റായ വിംഗിലേക്ക് അയച്ചു. കൃത്യമായ സബ് വിംഗിലേക്ക് സഹായം എത്തിക്കാൻ വീണ്ടും ശ്രമിക്കാം!"
                onRetry={() => {
                  sound.playClick();
                  setDispatchMistakes(0);
                  setCombo(0);
                  setDispatchToast(null);
                }}
                overlay={false}
              />
            )}

            <div
              draggable
              onDragStart={() => sound.playClick()}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-amber-50/70 border-2 border-emerald-300 cursor-grab flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-base font-extrabold text-slate-900">
                  {WING_EMOJIS[activeCase.correctWingId] || '✨'} {activeCase.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                  {activeCase.scenario}
                </p>
              </div>
              <button
                type="button"
                onClick={() => narrator.speak(activeCase.scenario, activeCase.title)}
                className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" /> കേൾക്കാം
              </button>
            </div>

            <AnimatePresence>
              {dispatchToast && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-wrap items-center justify-between gap-2 ${
                    dispatchToast.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <span>{dispatchToast.text}</span>
                  {dispatchToast.ok && caseIdx < HELPDESK_CASES.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        const nextIdx = caseIdx + 1;
                        setCaseIdx(nextIdx);
                        setDispatchToast(null);
                        narrator.speak(
                          HELPDESK_CASES[nextIdx].scenario,
                          HELPDESK_CASES[nextIdx].title
                        );
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold whitespace-nowrap shrink-0"
                    >
                      അടുത്ത ദൗത്യം →
                    </button>
                  ) : dispatchToast.ok && solvedCases.length >= 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        scrollToActiveQuiz();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold whitespace-nowrap shrink-0"
                    >
                      അടുത്തത് · ക്വിസ് ➡️
                    </button>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-xl border border-slate-200 p-2.5">
            <div className="flex flex-wrap gap-1.5">
              {WING_CATEGORY_TABS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setWingFilter(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-colors ${
                    wingFilter === cat.id
                      ? 'bg-emerald-700 text-white border-emerald-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-600">
              ℹ️ ഐക്കണിൽ തൊട്ടാൽ പൂർണ്ണ പ്രവർത്തനങ്ങളും സീറ്റ് ഘടനയും കാണാം
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {filteredWings.map((wing) => {
              const isSolvedTarget =
                solvedCases.includes(activeCase.id) &&
                wing.id === activeCase.correctWingId;
              const officialLogo = SUBWING_OFFICIAL_LOGO_MAP[wing.id];
              return (
                <div
                  key={wing.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleRouteMissionToWing(wing.id)}
                  className={`rounded-2xl border border-b-4 p-3 transition-all flex flex-col justify-between card-3d-tilt ${
                    isSolvedTarget
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300'
                      : 'bg-white border-slate-200 hover:border-emerald-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRouteMissionToWing(wing.id)}
                      className="text-left flex-1 space-y-1.5"
                    >
                      {officialLogo && (
                        <div className="h-10 w-full rounded-lg bg-slate-50 border border-slate-100 px-1.5 py-1 flex items-center justify-center">
                          <img
                            src={officialLogo.src}
                            alt={officialLogo.label}
                            className="max-h-8 w-auto max-w-full object-contain"
                          />
                        </div>
                      )}
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {!officialLogo && `${WING_EMOJIS[wing.id] || '✨'} `}{wing.name}
                      </p>
                      <p className="text-[11px] font-semibold text-emerald-800">
                        {SHORT_WING_CUES[wing.id]}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setWingPopup(wing);
                        narrator.speak(wing.roleSummary, wing.name);
                      }}
                      title="വിംഗിന്റെ പ്രവർത്തനങ്ങളും ഘടനയും കാണുക"
                      className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-100 shrink-0"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </GameFullscreenShell>
      )}

      {/* 2. LESSON DRAWERS OPEN BY DEFAULT RIGHT BELOW GAME LAUNCHER */}
      {activeTab === 'memory' && (
        <CollapsibleLessonDrawer
          key="l2-drawer-memory"
          emoji="🃏"
          title="പതാകകളും അടയാളങ്ങളും · പാഠം"
          badgeText={`${matchedPairs.length}/4`}
          onSpeak={() =>
            narrator.speak(
              'സമസ്തയുടെയും പോഷക സംഘടനകളുടെയും ഔദ്യോഗിക പതാകകളും അടയാളങ്ങളും നമ്മുടെ കൂട്ടായ്മയുടെയും പൈതൃകത്തിന്റെയും പ്രതീകങ്ങളാണ്. ഇവയെ ബഹുമാനത്തോടെയും ഉത്തരവാദിത്തത്തോടെയും ഉയർത്തിപ്പിടിക്കാം.',
              '🃏 പതാകകളും അടയാളങ്ങളും'
            )
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <p className="text-xs sm:text-sm font-extrabold text-emerald-950">🚩 പോഷക സംഘടനകളുടെ ഐക്യം</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമയുടെ കീഴിൽ SKSSF, SKSBV, SYS, SKJM തുടങ്ങിയ പോഷക സംഘടനകൾ ഒരൊറ്റ ആദർശത്തിലും പണ്ഡിത നേതൃത്വത്തിലും അണിനിരക്കുന്നു.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <p className="text-xs sm:text-sm font-extrabold text-amber-950">🌟 പതാകയുടെ മര്യാദ</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                ഓരോ സമ്മേളനത്തിലും യൂണിറ്റ് പരിപാടിയിലും പതാക വൃത്തിയായി സൂക്ഷിക്കുകയും കൃത്യമായ അച്ചടക്കത്തോടെ ഉയർത്തുകയും ചെയ്യുന്നത് സംഘടനാ മര്യാദയാണ്.
              </p>
            </div>
          </div>
        </CollapsibleLessonDrawer>
      )}

      {activeTab === 'madrasa_board' && (
        <CollapsibleLessonDrawer
          key="l2-drawer-madrasa-board"
          emoji="🏫"
          title="1951 സമസ്ത വിദ്യാഭ്യാസ ബോർഡ് (SKIMVB) · പാഠം"
          badgeText="SKIMVB"
          onSpeak={() =>
            narrator.speak(
              '1951 സെപ്റ്റംബർ 17-ന് രൂപീകൃതമായ സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡ് ഇന്ന് പതിനൊന്നായിരത്തിലധികം മദ്രസകളിലായി ലക്ഷക്കണക്കിന് വിദ്യാർത്ഥികൾക്ക് ഏകീകൃത സിലബസും പൊതുപരീക്ഷയും നൽകുന്നു.',
              '🏫 സമസ്ത വിദ്യാഭ്യാസ ബോർഡ്'
            )
          }
        >
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-2">
              <p className="text-[11px] font-black text-emerald-900">
                🏫 സമസ്ത വിദ്യാഭ്യാസ ശൃംഖല · ഔദ്യോഗിക ലോഗോകൾ
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  OFFICIAL_WING_LOGOS.skimvb,
                  OFFICIAL_WING_LOGOS.skjmcc,
                  OFFICIAL_WING_LOGOS.snec,
                  OFFICIAL_WING_LOGOS.albirr_preschool,
                  OFFICIAL_WING_LOGOS.skicr,
                ].map((logo) => (
                  <div
                    key={logo.id}
                    className="rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex flex-col items-center justify-center gap-1"
                    title={logo.label}
                  >
                    <img
                      src={logo.src}
                      alt={logo.label}
                      className="h-10 sm:h-12 w-full object-contain"
                    />
                    <span className="text-[9px] font-extrabold text-slate-700 text-center leading-tight truncate w-full">
                      {logo.shortLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <p className="text-xs sm:text-sm font-extrabold text-emerald-950">📚 ഏകീകൃത പാഠ്യപദ്ധതിയും പൊതുപരീക്ഷയും</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  1 മുതൽ 12 വരെ ക്ലാസുകളിലേക്കുള്ള കൃത്യമായ പാഠപുസ്തകങ്ങളും പൊതുപരീക്ഷകളും പരിശീലനം നേടിയ മുഅല്ലിമീങ്ങളുടെ (SKJMCC) സേവനവും SKIMVB-യെ ലോകോത്തര മാതൃകയാക്കുന്നു.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
                <p className="text-xs sm:text-sm font-extrabold text-sky-950">🌱 അൽബിർ · SNEC · സമസ്ത ആഗോള മദ്രസകൾ</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  കേരളത്തിന് പുറമേ ഇന്ത്യയിലെ വിവിധ സംസ്ഥാനങ്ങളിലും ഗൾഫ്-വിദേശ രാജ്യങ്ങളിലും സമസ്ത മദ്രസകളും അൽബിർ (Al-Birr) പ്രീ-സ്കൂളുകളും SNEC സമന്വയ വിദ്യാഭ്യാസ സ്ഥാപനങ്ങളും പ്രവർത്തിക്കുന്നു.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleLessonDrawer>
      )}

      {activeTab === 'dispatch' && (
        <CollapsibleLessonDrawer
          key="l2-drawer-dispatch"
          emoji="🚑"
          title="SKSSF-ന്റെ 17 സബ് വിങ്ങുകളും സേവന ദൗത്യവും · പാഠം"
          badgeText={`${solvedCases.length}/${HELPDESK_CASES.length}`}
          onSpeak={() =>
            narrator.speak(
              'വിദ്യാഭ്യാസം, ആതുരസേവനം, ദുരന്തനിവാരണം, പ്രബോധനം, മാധ്യമം, കല, ക്യാമ്പസ് എന്നിങ്ങനെ സമൂഹത്തിന്റെ എല്ലാ മേഖലകളിലും സേവനം എത്തിക്കാൻ SKSSF-ന് പതിനേഴോളം സബ് വിങ്ങുകളുണ്ട്. സഹചാരി, വിഖായ, ട്രെൻഡ്, ഇബാദ്, സൈകോൺ, സർഗ്ഗലയം എന്നിവ ഇതിൽ പ്രധാനമാണ്.',
              '🚑 17 സബ് വിങ്ങുകൾ'
            )
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <p className="text-xs sm:text-sm font-extrabold text-emerald-950">🚑 വിഖായ & സഹചാരി</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                ദുരന്തമുഖത്തെ സന്നദ്ധ സേവനം, ആംബുലൻസ്, രക്തദാനം, ആശുപത്രി-ചികിത്സാ സഹായം എന്നിവ ഏകോപിപ്പിക്കുന്നു.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
              <p className="text-xs sm:text-sm font-extrabold text-sky-950">🎓 ട്രെൻഡ് · ക്യാമ്പസ് · സൈകോൺ</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                കരിയർ ഗൈഡൻസ്, സിവിൽ സർവീസ് പരിശീലനം, കോളേജ് ക്യാമ്പസ് പ്രവർത്തനം, സൈബർ ബോധവൽക്കരണം എന്നിവ നയിക്കുന്നു.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <p className="text-xs sm:text-sm font-extrabold text-amber-950">🕌 ഇബാദ് · ത്വലബ · സർഗ്ഗലയം</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                ആത്മീയ-ദഅ്‌വത്ത് പ്രബോധനം, ദർസ്-അറബിക് കോളേജ് വിദ്യാർത്ഥി കൂട്ടായ്മ, കലാ-സാഹിത്യ വേദികൾ എന്നിവ സജീവമാക്കുന്നു.
              </p>
            </div>
          </div>
        </CollapsibleLessonDrawer>
      )}

      {activeTab === 'tiers' && (
        <CollapsibleLessonDrawer
          key="l2-drawer-tiers"
          emoji="🏛️"
          title="5 ഘടക ഘടന · പാഠം"
          badgeText={`${exploredTiers.length}/5`}
        >
        <div className="relative space-y-4">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                🏛️ 5 ഘടകങ്ങളുടെ കൃത്യമായ ഭാരവാഹി ഘടന ({exploredTiers.length}/5 പരിശോധിച്ചു)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                ഓരോ ഘടകത്തിലും തൊട്ടാൽ അവിടെത്തന്നെ അംഗസംഖ്യയും ഭാരവാഹി തസ്തികകളും തുറന്നുവരും:
              </p>
            </div>

            <div className="space-y-2.5">
              {COMMITTEE_TIER_SPECS.map((t, idx) => {
                const isOpen = idx === selectedTierIdx;
                const seen = exploredTiers.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className={`rounded-2xl border-2 overflow-hidden transition-colors ${
                      isOpen
                        ? 'border-emerald-600 bg-emerald-50/60'
                        : seen
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleInspectTier(idx)}
                      className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{t.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{t.tier}</span>
                            {seen && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </p>
                          <p className="text-[11px] font-semibold text-emerald-800">
                            ആകെ {t.totalMembers} അംഗങ്ങൾ · കൗൺസിൽ: {t.councilRatio}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 border-t border-emerald-200 bg-white space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                                {t.scopeRule}
                              </p>
                              <button
                                type="button"
                                onClick={() => narrator.speak(t.speech, t.tier)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold shrink-0"
                              >
                                <Volume2 className="w-3.5 h-3.5" /> കേൾക്കാം
                              </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {t.positions.map((pos) => (
                                <div
                                  key={pos.role}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                                    pos.count === 'NIL'
                                      ? 'bg-slate-100 border-slate-200 text-slate-500'
                                      : 'bg-emerald-50/40 border-emerald-200 text-slate-900'
                                  }`}
                                >
                                  <span className="text-xs font-bold">{pos.role}</span>
                                  <span
                                    className={`text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-md ${
                                      pos.count === 'NIL'
                                        ? 'bg-slate-200 text-slate-600'
                                        : 'bg-emerald-700 text-white'
                                    }`}
                                  >
                                    {pos.count}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-semibold leading-relaxed">
                              💡 {t.workingCommitteeNote}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </CollapsibleLessonDrawer>
      )}

      {/* 2. COLLAPSIBLE LESSON: ELECTION ROLES */}
      {activeTab === 'election_roles' && (
        <CollapsibleLessonDrawer
          key="l2-drawer-election"
          emoji="🗳️"
          title="കമ്മിറ്റി സ്ഥാനങ്ങൾ · പാഠം"
          badgeText={`${exploredRoles.length}/${ELECTION_OFFICIAL_ROLES.length}`}
        >
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
              🗳️ കമ്മിറ്റി രൂപീകരണ സ്ഥാനങ്ങളും ചട്ടങ്ങളും ({exploredRoles.length}/{ELECTION_OFFICIAL_ROLES.length} പരിശോധിച്ചു)
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              ഓരോ സ്ഥാനത്തിലും തൊട്ടാൽ അവിടെത്തന്നെ വിശദാംശങ്ങളും ചട്ടങ്ങളും തുറന്നുവരും:
            </p>
          </div>

          <div className="space-y-2">
            {ELECTION_OFFICIAL_ROLES.map((r, i) => {
              const isOpen = i === roleIdx;
              const seen = exploredRoles.includes(i);
              return (
                <div
                  key={r.id}
                  className={`rounded-2xl border-2 overflow-hidden transition-colors ${
                    isOpen
                      ? 'border-emerald-600 bg-emerald-50/60'
                      : seen
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRoleIdx(i);
                      setExploredRoles((prev) => (prev.includes(i) ? prev : [...prev, i]));
                      onAwardXp(5, `l2_${r.id}`);
                      narrator.speak(r.speech, r.title);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{r.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{r.title}</span>
                          {seen && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-700">{r.badge}</p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-800 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-emerald-200 bg-white space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed flex-1">
                              {r.summary}
                            </p>
                            <button
                              type="button"
                              onClick={() => narrator.speak(r.speech, r.title)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-950 text-xs font-bold shrink-0"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> കേൾക്കാം
                            </button>
                          </div>
                          <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                            {r.rules.map((rule) => (
                              <li
                                key={rule}
                                className="text-xs font-semibold text-emerald-950 flex items-start gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{rule}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
        </CollapsibleLessonDrawer>
      )}

      {/* 2. COLLAPSIBLE LESSON: 8 ISLAMIC CENTRES */}
      {activeTab === 'centres' && (
        <CollapsibleLessonDrawer
          key="l2-drawer-centres"
          emoji="🕌"
          title="8 ഇസ്‌ലാമിക് സെന്ററുകൾ · പാഠം"
          badgeText={`${exploredCentres.length}/${ISLAMIC_CENTRES_LIST.length}`}
        >
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
              🕌 SKSSF 8 ഇസ്‌ലാമിക് സെന്ററുകളും ഹോസ്റ്റലുകളും ({exploredCentres.length}/{ISLAMIC_CENTRES_LIST.length} പരിശോധിച്ചു)
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              ഓരോ നഗരത്തിലും തൊട്ടാൽ അവിടെത്തന്നെ സെന്ററിന്റെ വിവരങ്ങൾ തുറന്നുവരും:
            </p>
          </div>

          <div className="space-y-2">
            {ISLAMIC_CENTRES_LIST.map((c, i) => {
              const isOpen = i === centreIdx;
              const seen = exploredCentres.includes(i);
              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border-2 overflow-hidden transition-colors ${
                    isOpen
                      ? 'border-amber-500 bg-amber-50/70'
                      : seen
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCentreIdx(i);
                      setExploredCentres((prev) => (prev.includes(i) ? prev : [...prev, i]));
                      onAwardXp(5, `l2_centre_${c.id}`);
                      narrator.speak(c.speech, c.city);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>📍 {i + 1}. {c.city}</span>
                        {seen && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </p>
                      <p className="text-[11px] font-bold text-amber-900">{c.subtitle}</p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-900 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-amber-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {c.items}
                          </p>
                          <button
                            type="button"
                            onClick={() => narrator.speak(c.speech, c.city)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold shrink-0 self-start sm:self-center"
                          >
                            <Volume2 className="w-3.5 h-3.5" /> കേൾക്കാം
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
        </CollapsibleLessonDrawer>
      )}

      {/* 3. COLLAPSIBLE LESSON: PUBLICATIONS & INSTITUTIONS */}

      {/* 2. COLLAPSIBLE LESSON: PUBLICATIONS & INSTITUTIONS */}
      {activeTab === 'vault' && (
        <CollapsibleLessonDrawer
          key="l2-drawer-vault"
          emoji="📰"
          title="പത്രങ്ങളും സ്ഥാപനങ്ങളും · പാഠം"
          badgeText={`${exploredVaults.length}/${OFFICIAL_LOGOS_VAULT.length}`}
        >
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                📰 സമസ്തയുടെ പത്രങ്ങളും വിദ്യാഭ്യാസ സ്ഥാപനങ്ങളും ({exploredVaults.length}/{OFFICIAL_LOGOS_VAULT.length})
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                ഓരോ സ്ഥാപനത്തിലും തൊട്ടാൽ അവിടെത്തന്നെ പൂർണ്ണ വിവരങ്ങൾ തുറന്നുവരും:
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {OFFICIAL_LOGOS_VAULT.map((item) => {
              const eco = ECOSYSTEM_GROUPS.find((g) => g.id === item.id) || ECOSYSTEM_GROUPS[0];
              const isOpen = selectedVaultId === item.id;
              const seen = exploredVaults.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border-2 overflow-hidden transition-colors ${
                    isOpen
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : seen
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setSelectedVaultId(item.id);
                      setExploredVaults((prev) =>
                        prev.includes(item.id) ? prev : [...prev, item.id]
                      );
                      onAwardXp(5, `l2_vault_${item.id}`);
                      narrator.speak(eco.summary, eco.name);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-11 h-11 object-contain rounded-lg bg-white p-1 border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{eco.name}</span>
                          {seen && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </p>
                        <p className="text-[11px] font-bold text-red-900">{eco.established}</p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-800 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-emerald-200 bg-white space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed flex-1">
                              {eco.summary}
                            </p>
                            <button
                              type="button"
                              onClick={() => narrator.speak(eco.summary, eco.name)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-950 text-xs font-bold shrink-0"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> കേൾക്കാം
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            {eco.details.map((d) => (
                              <div
                                key={d}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed"
                              >
                                {d}
                              </div>
                            ))}
                          </div>
                          {item.id === 'skimvb' && (
                            <div className="grid grid-cols-4 gap-2 pt-1">
                              {[
                                OFFICIAL_WING_LOGOS.snec,
                                OFFICIAL_WING_LOGOS.skjmcc,
                                OFFICIAL_WING_LOGOS.albirr_preschool,
                                OFFICIAL_WING_LOGOS.skicr,
                              ].map((logo) => (
                                <div
                                  key={logo.id}
                                  className="rounded-xl bg-emerald-50/50 border border-emerald-200 p-1.5 flex flex-col items-center justify-center gap-1"
                                  title={logo.label}
                                >
                                  <img
                                    src={logo.src}
                                    alt={logo.label}
                                    className="h-9 w-full object-contain"
                                  />
                                  <span className="text-[9px] font-extrabold text-emerald-950 text-center leading-tight truncate w-full">
                                    {logo.shortLabel}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {item.id === 'special_cells' && (
                            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-3">
                              <img
                                src={OFFICIAL_WING_LOGOS.skicr.src}
                                alt={OFFICIAL_WING_LOGOS.skicr.label}
                                className="h-11 w-auto rounded-lg bg-white p-1 border border-sky-200 object-contain shrink-0"
                              />
                              <p className="text-xs font-bold text-sky-950">
                                SKICR (സമസ്ത കേരള ഇസ്‌ലാമിക് ക്ലാസ് റൂം) ലോകമെമ്പാടുമുള്ള പഠിതാക്കൾക്ക് തത്സമയ ഇസ്‌ലാമിക പഠനം എത്തിക്കുന്നു.
                              </p>
                            </div>
                          )}
                          <InlineOfficialLinksStrip
                            links={getLinksForVault(item.id)}
                            heading="🔗 ഔദ്യോഗിക പോർട്ടലുകളും യൂട്യൂബ് ചാനലുകളും (തുറക്കാം / കോപ്പി ചെയ്യാം)"
                            compact
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
        </CollapsibleLessonDrawer>
      )}

      {/* 2. COLLAPSIBLE LESSON: AGE DIAL DAWA GUIDE */}
      {activeTab === 'dawa_age' && (
        <CollapsibleLessonDrawer
          key="l2-drawer-dawa-age"
          emoji="🎯"
          title="പ്രായപരിധിയും സംഘടനയും · പാഠം"
        >
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3.5">
          <div>
            <p className="text-xs font-extrabold text-emerald-700">
              🧭 കുട്ടിയായാലും മുതിർന്നവനായാലും നാട്ടിൽ ദീനീ ദഅ്‌വത്ത് ചെയ്യാം!
            </p>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
              🎯 നിങ്ങളുടെ പ്രായം തൊടൂ — അവിടെത്തന്നെ ഏത് സംഘടനയിൽ പ്രവർത്തിക്കാം എന്ന് കാണാം:
            </h4>
          </div>

          <div className="space-y-2">
            {DAWA_AGE_PATHS.map((ap) => {
              const isOpen = ap.id === selectedAgeId;
              const seen = exploredAges.includes(ap.id);
              return (
                <div
                  key={ap.id}
                  className={`rounded-2xl border-2 overflow-hidden transition-colors ${
                    isOpen
                      ? 'border-emerald-600 bg-emerald-50/60'
                      : seen
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setSelectedAgeId(ap.id);
                      setExploredAges((prev) => (prev.includes(ap.id) ? prev : [...prev, ap.id]));
                      onAwardXp(10, `l2_age_${ap.id}`);
                      narrator.speak(ap.speech, ap.wing);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{ap.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{ap.wing}</span>
                          {seen && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-700">{ap.ageBadge}</p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-800 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-emerald-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm font-extrabold text-emerald-950">
                              {ap.title}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                              {ap.detail}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => narrator.speak(ap.speech, ap.title)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-950 text-xs font-bold shrink-0 self-start sm:self-center"
                          >
                            <Volume2 className="w-3.5 h-3.5" /> കേൾക്കാം
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
            📌 പ്രധാന വിവരം: <strong>SKSSF-ൽ 40 വയസ്സ് വരെ പ്രായപരിധിയുണ്ട്</strong> — 40 വയസ്സ് വരെയും SKSSF-ൽ തന്നെ പ്രവർത്തിക്കാം. കൂടാതെ <strong>SKSSF-ൽ പ്രവർത്തിക്കുന്നവർക്കും SYS-ൽ പ്രവർത്തിക്കാം.</strong>
          </div>
        </div>
        </CollapsibleLessonDrawer>
      )}

      {/* 2. COLLAPSIBLE LESSON: 5 TOWN DAWA MISSION LANTERNS */}
      {activeTab === 'dawa_lanterns' && (
        <CollapsibleLessonDrawer
          key="l2-drawer-dawa-lanterns"
          emoji="🏮"
          title="5 ദഅ്‌വത്ത് വിളക്കുകൾ · പാഠം"
          badgeText={`${litDawaMissions.length}/5`}
        >
        <div className="relative space-y-4">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-emerald-950 text-white shadow-md">
            <img
              src="./src/assets/images/dawa_community_lanterns_1794953898121.jpg"
              alt="നാട്ടിലെ ദീനീ ദഅ്‌വത്ത് ഗ്രാമവും വിളക്കുകളും"
              className="w-full h-40 sm:h-48 object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
            {onClaimEasterEgg && (
              <EasterEggSpot
                eggId="egg_dawa_dove"
                collected={collectedEggs.includes('egg_dawa_dove')}
                onClaim={onClaimEasterEgg}
                className="absolute top-3 right-3 z-30"
              />
            )}
            <div className="relative z-10 p-4 -mt-16 space-y-1">
              <p className="text-xs font-extrabold text-amber-300">
                🏮 നാട്ടിൽ ദീനീ ദഅ്‌വത്ത് വളർത്താൻ 5 വിളക്കുകൾ തെളിയിക്കൂ ({litDawaMissions.length}/5)
              </p>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                ഓരോ വിളക്കിലും ടാപ്പ് ചെയ്ത് കർമ്മവഴി അറിയൂ ✨
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DAWA_TOWN_MISSIONS.map((m) => {
              const lit = litDawaMissions.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    sound.playSuccess(litDawaMissions.length + 1);
                    if (!lit) {
                      const nextLit = [...litDawaMissions, m.id];
                      setLitDawaMissions(nextLit);
                      onAwardXp(15, `l2_dawa_${m.id}`);
                      triggerGlitter(`🏮 ${m.emoji} വിളക്ക് തെളിഞ്ഞു! +15 XP`);
                      if (nextLit.length === DAWA_TOWN_MISSIONS.length) {
                        onUnlockBadge('🌟 ദഅ്‌വത്ത് പ്രകാശം');
                      }
                    }
                    narrator.speak(m.speech, m.title);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-2 card-3d-tilt ${
                    lit
                      ? 'bg-gradient-to-br from-amber-50 to-emerald-50 border-amber-400 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{m.emoji}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        lit ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {lit ? 'തെളിഞ്ഞു 🌟' : 'ടാപ്പ് ചെയ്യൂ'}
                    </span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">{m.title}</h5>
                  <p className="text-xs text-slate-700 leading-relaxed">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
        </CollapsibleLessonDrawer>
      )}

      {/* 3. STORYLINE (COLLAPSED) + MANDATORY QUIZ (UNLOCKS AFTER LESSON) */}
      <LessonCheckQuiz
        lessonId={`l2_${activeTab}`}
        savedAnswer={quizAnswers[`l2_${activeTab}`]}
        onAnswered={(lid, idx, ok) => {
          onQuizAnswered(lid, idx, ok);
          onMarkLessonCompleted?.(`l2_${activeTab}`);
        }}
        onNextLesson={handleAdvanceL2Tab}
        nextLessonLabel={!isLastL2Tab ? 'അടുത്ത പാഠം ➡️' : 'ഘട്ടം 3 · ജില്ലാ തലം ➡️'}
      />

      {/* 4. NAVIGATION & PROGRESS TRACK STRICTLY BELOW LESSON */}
      <LessonStepperNav
        stepLabel={`ക്ലസ്റ്റർ & മേഖലാ തലം · പാഠം ${activeTabIdx + 1} / ${l2Tabs.length}: ${l2Tabs[activeTabIdx]?.label || ''}`}
        currentStep={activeTabIdx}
        totalSteps={l2Tabs.length}
        statusHint={getTabRequirementHint(activeTab)}
        prevLabel={activeTabIdx > 0 ? l2Tabs[activeTabIdx - 1].label : undefined}
        onPrev={activeTabIdx > 0 ? () => setActiveTab(l2Tabs[activeTabIdx - 1].id) : undefined}
        nextLabel={!isLastL2Tab ? l2Tabs[activeTabIdx + 1].label : 'ഘട്ടം 3 · ജില്ലാ തലം'}
        nextIsWorldAdvance={isLastL2Tab}
        nextDisabled={!currentTabDone}
        onNext={handleAdvanceL2Tab}
      />

      <LessonProgressTrack
        stageTitle="ഘട്ടം 2 · ക്ലസ്റ്റർ & മേഖലാ തലം"
        stageSubtitle="ഘടക ഘടന, തിരഞ്ഞെടുപ്പ് സ്ഥാനങ്ങൾ, 17 സബ് വിങ്ങുകൾ, ദഅ്‌വത്ത് & സ്ഥാപനങ്ങൾ"
        items={[
          { id: 'memory', lessonId: 'l2_memory', emoji: '🃏', label: `പതാക മെമ്മറി (${matchedPairs.length}/4)` },
          { id: 'madrasa_board', lessonId: 'l2_madrasa_board', emoji: '🏫', label: 'മദ്രസാ ബോർഡ് അലങ്കാരം' },
          { id: 'tiers', lessonId: 'l2_tiers', emoji: '🏛️', label: `5 ഘടക ഘടന (${exploredTiers.length}/5)` },
          { id: 'election_roles', lessonId: 'l2_election_roles', emoji: '🗳️', label: 'കമ്മിറ്റി സ്ഥാനങ്ങൾ' },
          { id: 'centres', lessonId: 'l2_centres', emoji: '🕌', label: '8 ഇസ്‌ലാമിക് സെന്ററുകൾ' },
          { id: 'dispatch', lessonId: 'l2_dispatch', emoji: '🚑', label: `17 വിങ്ങുകൾ (${solvedCases.length}/${HELPDESK_CASES.length})` },
          { id: 'dawa_age', lessonId: 'l2_dawa_age', emoji: '🎯', label: 'പ്രായപരിധിയും സംഘടനയും' },
          { id: 'dawa_lanterns', lessonId: 'l2_dawa_lanterns', emoji: '🏮', label: `ദഅ്‌വത്ത് (${litDawaMissions.length}/5)` },
          { id: 'vault', lessonId: 'l2_vault', emoji: '📰', label: 'പത്രങ്ങളും സ്ഥാപനങ്ങളും' },
        ]}
        activeId={activeTab}
        completedLessonIds={completedLessonIds}
        devUnlocked={devUnlocked}
        onSelectCompleted={(id) => setActiveTab(id as L2GameTab)}
      />

      {/* Sub-Wing Full Mission & Committee Strength Modal */}
      {wingPopup && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setWingPopup(null)}
        >
          <div
            className="bg-white rounded-2xl border-2 border-emerald-200 max-w-lg w-full max-h-[88vh] overflow-y-auto p-5 shadow-xl space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {SUBWING_OFFICIAL_LOGO_MAP[wingPopup.id] && (
                  <div className="h-12 px-2 py-1 rounded-xl bg-slate-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <img
                      src={SUBWING_OFFICIAL_LOGO_MAP[wingPopup.id]!.src}
                      alt={SUBWING_OFFICIAL_LOGO_MAP[wingPopup.id]!.label}
                      className="max-h-10 w-auto max-w-[96px] object-contain"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-700">
                    {wingPopup.englishName}
                  </p>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    {WING_EMOJIS[wingPopup.id] || '✨'} {wingPopup.name}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWingPopup(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {wingPopup.id === 'ibad' && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                <img
                  src={OFFICIAL_WING_LOGOS.majlisunnoor.src}
                  alt={OFFICIAL_WING_LOGOS.majlisunnoor.label}
                  className="h-12 w-auto rounded-lg bg-white p-1 border border-amber-200 object-contain shrink-0"
                />
                <p className="text-xs font-bold text-amber-950">
                  മജ്‌ലിസുന്നൂർ ആത്മീയ സംഗമങ്ങൾക്ക് ഇബാദ് നേതൃത്വം നൽകുന്നു.
                </p>
              </div>
            )}
            {wingPopup.id === 'cyber' && (
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-3">
                <img
                  src={OFFICIAL_WING_LOGOS.skicr.src}
                  alt={OFFICIAL_WING_LOGOS.skicr.label}
                  className="h-12 w-auto rounded-lg bg-white p-1 border border-sky-200 object-contain shrink-0"
                />
                <p className="text-xs font-bold text-sky-950">
                  SKICR (@SKICRTV) ഓൺലൈൻ ഇസ്‌ലാമിക് ക്ലാസ് റൂം ലോകമെമ്പാടും തത്സമയ പഠന ക്ലാസുകൾ എത്തിക്കുന്നു.
                </p>
              </div>
            )}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <p className="font-arabic text-xl font-bold text-emerald-950">
                {wingPopup.arabicRoot}
              </p>
              <p className="text-xs font-semibold text-emerald-800 mt-1">
                {wingPopup.arabicMeaning}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {wingPopup.roleSummary}
            </p>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <p className="text-[11px] font-extrabold text-amber-950">
                🏛️ കമ്മിറ്റി സീറ്റ് ഘടന (മാന്വൽ പേജ് 10):
              </p>
              <p className="text-xs font-bold text-slate-800">{wingPopup.committeeSeats}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-extrabold text-emerald-950">
                🌟 യഥാർത്ഥ പ്രവർത്തനങ്ങളും പദ്ധതികളും:
              </p>
              <ul className="space-y-1.5">
                {wingPopup.realActivities.map((act) => (
                  <li
                    key={act}
                    className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
            <InlineOfficialLinksStrip
              links={getLinksForSubWing(wingPopup.id)}
              heading="🔗 ഈ വിംഗിന്റെ ഔദ്യോഗിക പോർട്ടലും യൂട്യൂബ് ചാനലും"
              compact
            />
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => narrator.speak(wingPopup.roleSummary, wingPopup.name)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-950 text-xs font-bold"
              >
                <Volume2 className="w-3.5 h-3.5" /> കേൾക്കാം
              </button>
              <button
                type="button"
                onClick={() => setWingPopup(null)}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                ശരി
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
