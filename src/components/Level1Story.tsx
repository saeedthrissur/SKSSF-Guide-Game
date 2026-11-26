import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Flag,
  Globe,
  Landmark,
  Phone,
  RotateCw,
  Ship,
  Trophy,
  Volume2,
} from 'lucide-react';
import {
  AuthenticFlagCanvas,
  OfficialSamasthaFlagImg,
  OfficialSkimvbLogoImg,
  OfficialSksbvFlagImg,
  OfficialSkssfFlagImg,
} from './SvgArtwork';
import {
  CollapsibleLessonDrawer,
  EasterEggItem,
  EasterEggSpot,
  GlitterBurstOverlay,
  LessonProgressTrack,
  LessonStepperNav,
} from './GameEffects';
import { EraInteractiveStage } from './EraInteractiveActivities';
import { GameFullscreenShell } from './GameFullscreenShell';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import { LessonCheckQuiz, scrollToActiveQuiz } from './LessonCheckQuiz';
import { OptionalLessonMiniGame } from './OptionalLessonMiniGames';
import { QuizAnswerMap } from '../utils/gameStorage';
import { OFFICIAL_WING_LOGOS } from '../data/officialLogos';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';

export type L1Tab =
  | 'era_1'
  | 'era_2'
  | 'era_3'
  | 'era_4'
  | 'era_5'
  | 'flags'
  | 'cosmic'
  | 'roots';

interface Level1StoryProps {
  isCompleted: boolean;
  initialTab?: L1Tab | 'timeline';
  devUnlocked?: boolean;
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
}

interface FlipRootCard {
  id: string;
  emoji: string;
  frontTag: string;
  frontTitle: string;
  backStory: string;
  speech: string;
  arabic?: string;
}

const COSMIC_CHAIN = [
  {
    id: 'c1',
    emoji: '🌿',
    step: '1. ചെടി',
    desc: 'നമ്മുടെ മുറ്റത്തെ ഓരോ കുഞ്ഞു ചെടിക്കും ഒരു തുടക്കം വേണം — ഒരു ഉദാഹരണമായി ചെടിയിൽ നിന്ന് തുടങ്ങാം.',
  },
  {
    id: 'c2',
    emoji: '🌱',
    step: '2. വിത്ത്',
    desc: 'ചെടി വളരണമെങ്കിൽ അതിന് ഒരു നല്ല വിത്ത് വേണം! വിത്തിന് ഉള്ളിൽ ഒരു വലിയ മരമാകാനുള്ള മുഴുവൻ അറിവും ഒളിഞ്ഞിരിപ്പുണ്ട്.',
  },
  {
    id: 'c3',
    emoji: '⚛️',
    step: '3. ആറ്റങ്ങൾ',
    desc: 'വിത്തും മണ്ണും വെള്ളവുമെല്ലാം കണ്ണിന് കാണാൻ കഴിയാത്ത കുഞ്ഞു ആറ്റങ്ങൾ ചേർന്നതാണ്.',
  },
  {
    id: 'c4',
    emoji: '📐',
    step: '4. കൃത്യമായ സംവിധാനം',
    desc: 'ഒരു വാച്ച് പോലും ഉണ്ടാക്കുന്ന ആളില്ലാതെ തനിയെ ഉണ്ടാകില്ലല്ലോ! അപ്പോൾ ഇത്ര കൃത്യമായ അളവിലും ഭംഗിയിലുമുള്ള ലോകം ഒരു സൃഷ്ടാവില്ലാതെ തനിയെ ഉണ്ടാകുമോ? ഒരിക്കലുമില്ല!',
  },
  {
    id: 'c5',
    emoji: '✨',
    step: '5. അല്ലാഹു (ഏക സൃഷ്ടാവ്)',
    desc: 'തുടക്കവും ഒടുക്കവുമില്ലാത്ത, എല്ലാവരെയും പടച്ച് പരിപാലിക്കുന്ന ഏക സൃഷ്ടാവാണ് അല്ലാഹു! ചെടിയും വിത്തും ഒരു ഉദാഹരണം മാത്രം — താഴെ കാണുന്ന മറ്റു ദൃഷ്ടാന്തങ്ങളും നോക്കൂ!',
  },
];

const OTHER_COSMIC_EXAMPLES = [
  {
    id: 'ex_rain',
    emoji: '🌧️',
    title: 'മഴയും മേഘങ്ങളും',
    summary: 'ഉപ്പുകടലിൽ നിന്ന് ശുദ്ധമായ കുടിവെള്ളം!',
    desc: 'കടലിലെ വെള്ളത്തിന് വലിയ ഉപ്പുരസമാണ് — കുടിക്കാൻ പറ്റില്ല! എന്നാൽ സൂര്യന്റെ ചൂടിൽ അത് നീരാവിയായി മേഘമായി മാറി, ഉപ്പെല്ലാം താഴെ ഉപേക്ഷിച്ച് മധുരമുള്ള ശുദ്ധജലമായി മഴയായി പെയ്യുന്നു. ഈ അത്ഭുത ശുദ്ധീകരണ യന്ത്രം ഒരുക്കിയത് ആരാണ്? സർവ്വശക്തനായ അല്ലാഹു!',
  },
  {
    id: 'ex_bee',
    emoji: '🐝',
    title: 'തേനീച്ചയും തേൻകൂടും',
    summary: 'സ്കൂളിൽ പോകാത്ത കൊച്ചു എൻജിനീയർ!',
    desc: 'കുഞ്ഞു തേനീച്ച ഒരിക്കലും ഗണിതശാസ്ത്രം പഠിക്കാൻ സ്കൂളിൽ പോയിട്ടില്ല. എന്നിട്ടും ഏറ്റവും കുറച്ച് മെഴുക് ഉപയോഗിച്ച് ഏറ്റവും കൂടുതൽ തേൻ നിറയ്ക്കാൻ കഴിയുന്ന കൃത്യമായ ആറുകോൺ (Hexagon) അറകളാണ് അത് പണിയുന്നത്! ആ അറിവ് അതിന്റെ ഉള്ളിൽ നൽകിയത് അല്ലാഹുവാണ്.',
  },
  {
    id: 'ex_heart',
    emoji: '❤️',
    title: 'വിശ്രമിക്കാത്ത ഹൃദയവും കണ്ണുകളും',
    summary: 'ഉറങ്ങുമ്പോഴും പ്രവർത്തിക്കുന്ന ശരീരം!',
    desc: 'നമ്മൾ രാത്രി സുഖമായി ഉറങ്ങുമ്പോഴും നമ്മുടെ ഹൃദയം ഒരു ദിവസം ഏകദേശം ഒരു ലക്ഷം തവണ വിശ്രമമില്ലാതെ മിടിച്ചുകൊണ്ടിരിക്കുന്നു! ഒരു ക്യാമറയ്ക്കും എത്തിപ്പിടിക്കാനാകാത്ത കൃത്യതയോടെ നമ്മുടെ കണ്ണുകൾ നിറങ്ങൾ കാണുന്നു. ഇതിന്റെയെല്ലാം സൃഷ്ടാവ് അല്ലാഹുവാണ്!',
  },
  {
    id: 'ex_sun',
    emoji: '☀️',
    title: 'സൂര്യനും ചന്ദ്രനും രാവും പകലും',
    summary: 'ഒരു സെക്കൻഡ് പോലും തെറ്റാത്ത സമയം!',
    desc: 'സൂര്യൻ ഇത്തിരി കൂടി അടുത്തുവന്നാൽ ഭൂമി ചുട്ടുപൊള്ളും; ഇത്തിരി കൂടി അകന്നുപോയാൽ ഭൂമി മുഴുവൻ മഞ്ഞുകട്ടയാകും! കൃത്യമായ അകലത്തിൽ സൂര്യനെയും ചന്ദ്രനെയും നിർത്തി രാവും പകലും മാറിമാറി കൊണ്ടുവരുന്നത് ഏക സൃഷ്ടാവായ അല്ലാഹുവാണ്.',
  },
  {
    id: 'ex_mother',
    emoji: '🤱',
    title: 'ഉമ്മയുടെ സ്നേഹവും കരുണയും',
    summary: 'കുഞ്ഞു പിറക്കുമ്പോൾ തന്നെ കരുതൽ!',
    desc: 'ഒരു കുഞ്ഞു ജനിക്കുമ്പോൾ സംസാരിക്കാനോ ഭക്ഷണം തേടാനോ അറിയില്ല. എന്നാൽ ആ കുഞ്ഞിന് ഏറ്റവും ഇണങ്ങുന്ന പാൽ ഉമ്മയുടെ ഉള്ളിൽ നേരത്തെ ഒരുക്കി വെച്ചതും, ഉറക്കമിളച്ച് കുഞ്ഞിനെ കരുതാനുള്ള സ്നേഹം ഉമ്മയുടെ മനസ്സിൽ നിറച്ചതും കാരുണ്യവാനായ അല്ലാഹുവാണ്!',
  },
];

const ROOT_FLIP_CARDS: FlipRootCard[] = [
  {
    id: 'r0_creator',
    emoji: '🌌',
    frontTag: 'പൈതൃകം 01',
    frontTitle: 'പ്രപഞ്ച സൃഷ്ടാവും തൗഹീദും',
    arabic: 'اللَّهُ خَالِقُ كُلِّ شَيْءٍ',
    backStory:
      'കൂട്ടുകാരേ! ചെടി, വിത്ത്, ആറ്റങ്ങൾ എന്നിവ ഒരു ഉദാഹരണം മാത്രമാണ് — ഉപ്പുകടലിൽ നിന്ന് ശുദ്ധമായ മഴ പെയ്യുന്നതും, തേനീച്ച കൂട് കെട്ടുന്നതും, നമ്മുടെ ഹൃദയം മിടിക്കുന്നതും, സൂര്യനും ചന്ദ്രനും കൃത്യമായി ചലിക്കുന്നതുമെല്ലാം തുടക്കമില്ലാത്ത ഏക സൃഷ്ടാവായ അല്ലാഹുവിനെ തെളിയിക്കുന്നു!',
    speech:
      'കൂട്ടുകാരേ! ചെടി, വിത്ത്, ആറ്റങ്ങൾ എന്നിവ ഒരു ഉദാഹരണം മാത്രമാണ്. ഉപ്പുകടലിൽ നിന്ന് ശുദ്ധമായ മഴ പെയ്യുന്നതും, തേനീച്ച കൂട് കെട്ടുന്നതും, നമ്മുടെ ഹൃദയം മിടിക്കുന്നതും, സൂര്യനും ചന്ദ്രനും കൃത്യമായി ചലിക്കുന്നതുമെല്ലാം ഏക സൃഷ്ടാവായ അല്ലാഹുവിനെ തെളിയിക്കുന്നു!',
  },
  {
    id: 'r0_prophet',
    emoji: '📖',
    frontTag: 'പൈതൃകം 02',
    frontTitle: 'ഖുർആനും റസൂൽ ﷺ വഴികാട്ടിയും',
    arabic: 'لَقَدْ مَنَّ اللَّهُ عَلَى الْمُؤْمِنِينَ',
    backStory:
      'ഖുർആൻ വെറുമൊരു മലക്കിന്റെ കയ്യിലല്ല, ജീവിച്ചു കാണിക്കാൻ മനുഷ്യരിൽ നിന്ന് തന്നെ മുഹമ്മദ് നബി ﷺ-യെ അയച്ചു! ഉദാഹരണത്തിന്, ഖുർആനിൽ "നിസ്കരിക്കുക" എന്ന് പറഞ്ഞിട്ടുണ്ട്; എങ്ങനെ നിസ്കരിക്കണമെന്ന് ജീവിച്ചു കാണിച്ചത് നബി ﷺ ആണ്. നന്നായി അറബി സംസാരിച്ചിരുന്ന അന്നത്തെ അറബികൾ പോലും ഖുർആനിന്റെ ശരിയായ അർത്ഥം പഠിച്ചത് നബി ﷺ-യിൽ നിന്നാണ്.',
    speech:
      'ഖുർആൻ വെറുമൊരു മലക്കിന്റെ കയ്യിലല്ല, ജീവിച്ചു കാണിക്കാൻ മനുഷ്യരിൽ നിന്ന് തന്നെ മുഹമ്മദ് നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലമയെ അയച്ചു! ഉദാഹരണത്തിന് എങ്ങനെ നിസ്കരിക്കണമെന്ന് ജീവിച്ചു കാണിച്ചത് നബി തങ്ങളാണ്. അന്നത്തെ അറബികൾ പോലും ഖുർആനിന്റെ ശരിയായ അർത്ഥം പഠിച്ചത് പ്രവാചകരിൽ നിന്നാണ്.',
  },
  {
    id: 'r1',
    emoji: '🕌',
    frontTag: 'പൈതൃകം 03',
    frontTitle: 'അമ്പിയാക്കളുടെ നല്ല മാതൃക',
    arabic: 'إِنَّ إِبْرَاهِيمَ كَانَ أُمَّةً',
    backStory:
      'മനുഷ്യ സ്വാതന്ത്ര്യത്തിന് വേണ്ടി നിന്ന മൂസാ നബി عليه السلام, ദഅ്‌വത്തിന് ഏറ്റവും കൂടുതൽ നടന്ന ഇബ്‌റാഹീം നബി عليه السلام, ക്ഷമയുടെ മാതൃകയായ യഅ്ഖൂബ് നബി عليه السلام, ചികിത്സാ രംഗത്തെ ഈസാ നബി عليه السلام, ലോകത്തിന് കാരുണ്യമായ മുഹമ്മദ് നബി ﷺ എന്നിവരിലാണ് നമുക്ക് എല്ലാ പ്രായക്കാർക്കും ഉള്ള യഥാർത്ഥ മാതൃക!',
    speech:
      'മനുഷ്യ സ്വാതന്ത്ര്യത്തിന് വേണ്ടി നിന്ന മൂസാ നബി അലൈഹിസ്സലാം, ദഅ്‌വത്തിന് ഏറ്റവും കൂടുതൽ നടന്ന ഇബ്‌റാഹീം നബി അലൈഹിസ്സലാം, യഅ്ഖൂബ് നബി അലൈഹിസ്സലാം, ചികിത്സാ രംഗത്തെ ഈസാ നബി അലൈഹിസ്സലാം, കാരുണ്യത്തിന്റെ നബി മുഹമ്മദ് നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലം എന്നിവരിലാണ് യഥാർത്ഥ മാതൃക!',
  },
  {
    id: 'r2',
    emoji: '⚖️',
    frontTag: 'പൈതൃകം 04',
    frontTitle: '73 കൂട്ടങ്ങളും 4 മദ്ഹബുകളും',
    arabic: 'مَا أَنَا عَلَيْهِ وَأَصْحَابِي',
    backStory:
      '73 കൂട്ടങ്ങളിൽ “ഞാനും എന്റെ സ്വഹാബികളും നടന്ന വഴി” പിന്തുടരുന്ന അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅഃ ആണ് ശരിയായ പാത. ഉദാഹരണത്തിന്, ഒരു കുട്ടിക്ക് രോഗം വന്നാൽ സ്വയം മരുന്ന് കഴിക്കാതെ നല്ല ഡോക്ടറോട് ചോദിക്കുന്നതുപോലെ, ഖുർആനും ഹദീസും തെറ്റാതെ മനസ്സിലാക്കി നിസ്കാരവും നോമ്പുമൊക്കെ കൃത്യമായി അനുഷ്ഠിക്കാൻ വലിയ പണ്ഡിതന്മാർ തയ്യാറാക്കിയ 4 വഴികാട്ടികളാണ് ഹനഫി, മാലിക്, ശാഫിഈ, ഹൻബലി എന്നീ 4 മദ്ഹബുകൾ.',
    speech:
      '73 കൂട്ടങ്ങളിൽ ഞാനും എന്റെ സ്വഹാബികളും നടന്ന വഴി പിന്തുടരുന്ന അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅഃ ആണ് ശരിയായ പാത. അസുഖം വന്നാൽ നല്ല ഡോക്ടറോട് ചോദിക്കുന്നതുപോലെ, ഖുർആനും ഹദീസും തെറ്റാതെ മനസ്സിലാക്കി ആരാധനകൾ കൃത്യമായി ചെയ്യാൻ വലിയ പണ്ഡിതന്മാർ തയ്യാറാക്കിയ വഴികാട്ടികളാണ് ഹനഫി, മാലിക്, ശാഫിഈ, ഹൻബലി എന്നീ നാല് മദ്ഹബുകൾ.',
  },
  {
    id: 'r3',
    emoji: '⛵',
    frontTag: 'പൈതൃകം 05',
    frontTitle: 'കേരളത്തിലെ അറബ്-ശാഫിഈ പൈതൃകം',
    arabic: 'أَهْلُ السُّنَّةِ وَالْجَمَاعَةِ',
    backStory:
      'കപ്പലിൽ വന്ന സ്വഹാബികളും അറബ് കച്ചവടക്കാരും സ്നേഹവും സത്യസന്ധതയും കാണിച്ചാണ് കേരളത്തിൽ ഇസ്‌ലാമും ശാഫിഈ മദ്‌ഹബും എത്തിച്ചത്. ശൈഖ് ജീലാനി قدس الله سره العزيز, മമ്പുറം തങ്ങൾ, ഉമർ ഖാളി തുടങ്ങിയ മഹാന്മാരുടെ സ്നേഹപാതയാണ് സമസ്തയുടെ വഴി!',
    speech:
      'കപ്പലിൽ വന്ന സ്വഹാബികളും അറബ് കച്ചവടക്കാരും സ്നേഹവും സത്യസന്ധതയും കാണിച്ചാണ് കേരളത്തിൽ ശാഫിഈ മദ്ഹബ് എത്തിച്ചത്. ശൈഖ് ജീലാനി ഖദ്ദസള്ളാഹു സിർറഹുൽ അസീസ്, മമ്പുറം തങ്ങൾ, ഉമർ ഖാളി തുടങ്ങിയ മഹാന്മാരുടെ സ്നേഹപാതയാണ് സമസ്തയുടെ വഴി!',
  },
  {
    id: 'r4',
    emoji: '🛡️',
    frontTag: 'പൈതൃകം 06',
    frontTitle: 'സമസ്തയുടെ സമ്പൂർണ്ണ ആദർശ കാവൽ',
    backStory:
      'കുരിശുയുദ്ധങ്ങളും ബ്രിട്ടീഷുകാരും ലോബികളും മുസ്‌ലിംകളെ ഭിന്നിപ്പിക്കാൻ തെറ്റായ അർത്ഥങ്ങൾ പ്രചരിപ്പിച്ചു. അറബി ഖുതുബയും ഔലിയാക്കളുടെ കറാമത്തും വഖഫ് പള്ളികളും ഹദ്ദാദ് റാതീബും മൗലിദും ദിക്റും മാറ്റാനുള്ള നീക്കങ്ങൾക്കെതിരെ സമസ്ത കാവലായി നിന്നു — എന്നാൽ ഇവ ചില ഉദാഹരണങ്ങൾ മാത്രമാണ്! യഥാർത്ഥ വിശ്വാസം (അഖീദ), നിസ്കാരം-നോമ്പ് തുടങ്ങിയ ആരാധനകളുടെ കൃത്യത (ഫിഖ്ഹ്), 4 മദ്ഹബുകൾ, പ്രവാചക ﷺ സ്നേഹം, ദർസ്-മദ്രസാ വിദ്യാഭ്യാസം എന്നിങ്ങനെ അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ മുഴുവൻ ആശയങ്ങളും സംരക്ഷിക്കലാണ് സമസ്തയുടെ വലിയ ദൗത്യം!',
    speech:
      'കുരിശുയുദ്ധങ്ങളും ബ്രിട്ടീഷുകാരും ലോബികളും മുസ്‌ലിംകളെ ഭിന്നിപ്പിക്കാൻ തെറ്റായ അർത്ഥങ്ങൾ പ്രചരിപ്പിച്ചു. അറബി ഖുതുബയും ഔലിയാക്കളുടെ കറാമത്തും വഖഫ് പള്ളികളും ഹദ്ദാദ് റാതീബും മൗലിദും ദിക്റും മാറ്റാനുള്ള നീക്കങ്ങൾക്കെതിരെ സമസ്ത കാവലായി നിന്നു. എന്നാൽ ഇവ ചില ഉദാഹരണങ്ങൾ മാത്രമാണ്! ശരിയായ വിശ്വാസവും ആരാധനകളുടെ കൃത്യതയും നാല് മദ്ഹബുകളും ദർസ് മദ്രസാ വിദ്യാഭ്യാസവും ഉൾപ്പെടെ അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ മുഴുവൻ സത്യമാർഗ്ഗവും സംരക്ഷിക്കലാണ് സമസ്തയുടെ വലിയ ദൗത്യം!',
  },
];

interface ArtifactHotspot {
  id: string;
  emoji: string;
  label: string;
  x: string;
  y: string;
  discovery: string;
  speech: string;
}

interface EraBoard {
  id: number;
  emoji: string;
  year: string;
  title: string;
  boatX: string;
  missionCue: string;
  hasFlagBuilder?: 'skju' | 'skssf';
  showSksbvFlag?: boolean;
  artifacts: ArtifactHotspot[];
}

const ERA_BOARDS: EraBoard[] = [
  {
    id: 1,
    emoji: '⛵',
    year: '1921–1924',
    title: '1921-ന് ശേഷമുള്ള പഴയ കഥയും വെല്ലുവിളികളും',
    boatX: '16%',
    missionCue: '🗝️ താക്കോൽ തിരിച്ച് ചരിത്ര പെട്ടി തുറന്ന് രേഖകൾ വായിക്കൂ!',
    artifacts: [
      {
        id: 'e1_a1',
        emoji: '📜',
        label: '1921 മലബാർ & പുതിയ വാദങ്ങൾ',
        x: '21%',
        y: '26%',
        discovery:
          'കൂട്ടുകാരേ, പഴയകാലത്ത് ശത്രു ലോബികൾ തെറ്റായ അർത്ഥങ്ങൾ പ്രചരിപ്പിച്ചപ്പോൾ 1921-ന് ശേഷം വഹാബിസം-സലഫിസം-മോഡേണിസം എന്നീ പുതിയ വാദങ്ങൾ കേരളത്തിലുമെത്തി; നമ്മുടെ പള്ളികളെയും മൗലിദ്-റാതീബുകളെയും കാക്കേണ്ടിവന്നു.',
        speech:
          'കൂട്ടുകാരേ, പഴയകാലത്ത് ശത്രു ലോബികൾ തെറ്റായ അർത്ഥങ്ങൾ പ്രചരിപ്പിച്ചപ്പോൾ 1921-ന് ശേഷം വഹാബിസം, സലഫിസം, മോഡേണിസം എന്നീ പുതിയ വാദങ്ങൾ കേരളത്തിലുമെത്തി; നമ്മുടെ പള്ളികളെയും മൗലിദ് റാതീബുകളെയും കാക്കേണ്ടിവന്നു.',
      },
      {
        id: 'e1_a2',
        emoji: '🤝',
        label: '1922 കൊടുങ്ങല്ലൂർ ഐക്യ സംഘം',
        x: '50%',
        y: '40%',
        discovery:
          '1922-ൽ കൊടുങ്ങല്ലൂരിൽ കെ.എം. സീതി സാഹിബ്, കെ.എം. മൗലവി, ഇ.കെ. മൗലവി എന്നിവരുടെ നേതൃത്വത്തിൽ "കേരള മുസ്‌ലിം ഐക്യ സംഘം" രൂപീകരിച്ചു.',
        speech:
          '1922-ൽ കൊടുങ്ങല്ലൂരിൽ കെ എം സീതി സാഹിബ്, കെ എം മൗലവി, ഇ കെ മൗലവി എന്നിവരുടെ നേതൃത്വത്തിൽ കേരള മുസ്‌ലിം ഐക്യ സംഘം രൂപീകരിച്ചു.',
      },
      {
        id: 'e1_a3',
        emoji: '🏛️',
        label: '1924 ആലുവ സമ്മേളനം',
        x: '79%',
        y: '26%',
        discovery:
          '1924 ആലുവ സമ്മേളനത്തിൽ പൊന്നാനി മഖ്ദൂമുമാരുടെ നല്ല സുന്നത്ത് പാരമ്പര്യങ്ങളെ തെറ്റായി ചിത്രീകരിച്ചപ്പോൾ, സത്യം പഠിപ്പിക്കാൻ പണ്ഡിതന്മാർക്ക് ഒരുമിച്ച് നിൽക്കേണ്ടിവന്നു!',
        speech:
          '1924 ആലുവ സമ്മേളനത്തിൽ പൊന്നാനി മഖ്ദൂമുമാരുടെ നല്ല സുന്നത്ത് പാരമ്പര്യങ്ങളെ തെറ്റായി ചിത്രീകരിച്ചപ്പോൾ, സത്യം പഠിപ്പിക്കാൻ പണ്ഡിതന്മാർക്ക് ഒരുമിച്ച് നിൽക്കേണ്ടിവന്നു!',
      },
    ],
  },
  {
    id: 2,
    emoji: '🕌',
    year: '1925–1934',
    title: 'സമസ്തയുടെ പിറവിയും ഔദ്യോഗിക സീലും',
    boatX: '34%',
    missionCue: '🔖 ഓരോ ചരിത്ര രേഖയിലും 1926 സമസ്ത സീൽ പതിക്കൂ!',
    hasFlagBuilder: 'skju',
    artifacts: [
      {
        id: 'e2_a1',
        emoji: '🕌',
        label: '1925 വലിയ ജുമാഅത്ത് പള്ളി',
        x: '21%',
        y: '26%',
        discovery:
          'പാങ്ങിൽ അഹ്മദ് കുട്ടി മുസ്‌ലിയാർ വരക്കൽ മുല്ലക്കോയ തങ്ങളെ കണ്ടു. 1925-ൽ കെ.പി. മുഹമ്മദ് മീരാൻ മുസ്‌ലിയാർ പ്രസിഡന്റും പാറോളിൽ ഹുസൈൻ മൗലവി സെക്രട്ടറിയുമായി ആദ്യ സമിതി തുടങ്ങി!',
        speech:
          'പാങ്ങിൽ അഹ്മദ് കുട്ടി മുസ്‌ലിയാർ വരക്കൽ മുല്ലക്കോയ തങ്ങളെ കണ്ടു. 1925-ൽ കെ പി മുഹമ്മദ് മീരാൻ മുസ്‌ലിയാർ പ്രസിഡന്റും പാറോളിൽ ഹുസൈൻ മൗലവി സെക്രട്ടറിയുമായി ആദ്യ സമിതി തുടങ്ങി!',
      },
      {
        id: 'e2_a2',
        emoji: '🌟',
        label: '1926 ജൂൺ 26 ടൗൺ ഹാൾ',
        x: '50%',
        y: '40%',
        discovery:
          'സയ്യിദ് ശിഹാബുദ്ധീൻ ചെറു കുഞ്ഞിക്കോയ തങ്ങളുടെ അധ്യക്ഷതയിൽ കോഴിക്കോട് ടൗൺഹാളിൽ സമസ്ത (SKJU) പിറന്നു! വരക്കൽ മുല്ലക്കോയ തങ്ങൾ പ്രഥമ പ്രസിഡന്റായി. അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ വിശ്വാസ സംരക്ഷണം, സമുദായ അവകാശ സംരക്ഷണം, മത-ഭൗതിക വിദ്യാഭ്യാസ പ്രോത്സാഹനം, അന്ധവിശ്വാസ നിർമ്മാർജ്ജനം എന്നിവയാണ് ഔദ്യോഗിക സ്ഥാപക ലക്ഷ്യങ്ങൾ.',
        speech:
          'സയ്യിദ് ശിഹാബുദ്ധീൻ ചെറു കുഞ്ഞിക്കോയ തങ്ങളുടെ അധ്യക്ഷതയിൽ കോഴിക്കോട് ടൗൺഹാളിൽ സമസ്ത പിറന്നു! വരക്കൽ മുല്ലക്കോയ തങ്ങൾ പ്രഥമ പ്രസിഡന്റായി. അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ വിശ്വാസ സംരക്ഷണം, സമുദായ അവകാശ സംരക്ഷണം, മത ഭൗതിക വിദ്യാഭ്യാസ പ്രോത്സാഹനം, സാമൂഹിക സൗഹാർദ്ദം എന്നിവയാണ് സമസ്തയുടെ ഔദ്യോഗിക ലക്ഷ്യങ്ങൾ.',
      },
      {
        id: 'e2_a3',
        emoji: '📰',
        label: '1929 അൽ ബയാൻ & 1934 രജി.',
        x: '79%',
        y: '26%',
        discovery:
          '1929-ൽ അറബി മലയാളത്തിലും പിന്നീട് മലയാളത്തിലും "അൽ ബയാൻ" പത്രം തുടങ്ങി; 1934 നവംബർ 14-ന് സമസ്ത ഔദ്യോഗികമായി രജിസ്റ്റർ ചെയ്തു!',
        speech:
          '1929-ൽ അറബി മലയാളത്തിലും പിന്നീട് മലയാളത്തിലും അൽ ബയാൻ പത്രം തുടങ്ങി; 1934 നവംബർ 14-ന് സമസ്ത ഔദ്യോഗികമായി രജിസ്റ്റർ ചെയ്തു!',
      },
    ],
  },
  {
    id: 3,
    emoji: '🚩',
    year: '1947–1989',
    title: 'മദ്രസകളുടെയും SKSSF-ന്റെയും പിറവി',
    boatX: '52%',
    missionCue: '🏮 വിളക്ക് നീക്കി 3 ചരിത്ര വിളക്കുകൾ തെളിയിക്കൂ!',
    hasFlagBuilder: 'skssf',
    artifacts: [
      {
        id: 'e3_a1',
        emoji: '🏫',
        label: '1947–1951 വിദ്യാഭ്യാസ ബോർഡ്',
        x: '21%',
        y: '26%',
        discovery:
          'കുട്ടികൾക്ക് നല്ല മതപഠനം കിട്ടാൻ 1949/1951 സെപ്റ്റംബർ 17-ന് SKIMVB തുടങ്ങി — 7 മദ്രസകളിൽ നിന്ന് ഇന്ന് 11,000+ മദ്രസകൾ! SYS (1954), SMF (1976) എന്നിവയും വളർന്നു.',
        speech:
          'കുട്ടികൾക്ക് നല്ല മതപഠനം കിട്ടാൻ 1951 സെപ്റ്റംബർ 17-ന് വിദ്യാഭ്യാസ ബോർഡ് തുടങ്ങി. ഏഴ് മദ്രസകളിൽ നിന്ന് ഇന്ന് പതിനൊന്നായിരത്തിലധികം മദ്രസകളുണ്ട്! എസ് വൈ എസും എസ് എം എഫും കൂടെ വളർന്നു.',
      },
      {
        id: 'e3_a2',
        emoji: '✨',
        label: '1989 ഫെബ്രുവരി 19 കോഴിക്കോട്',
        x: '50%',
        y: '40%',
        discovery:
          '1989 ഫെബ്രുവരി 19-ന് കോഴിക്കോട് സാമൂതിരി ഹൈസ്‌കൂളിൽ സി.എച്ച്. ഹൈദറോസ് മുസ്‌ലിയാർ പേര് പ്രഖ്യാപിച്ച് കെ.വി. മുഹമ്മദ് മുസ്‌ലിയാർ കൂറ്റനാട് SKSSF ഉദ്ഘാടനം ചെയ്തു!',
        speech:
          '1989 ഫെബ്രുവരി 19-ന് കോഴിക്കോട് സാമൂതിരി ഹൈസ്‌കൂളിൽ സി എച്ച് ഹൈദറോസ് മുസ്‌ലിയാർ പേര് പ്രഖ്യാപിച്ച് കെ വി മുഹമ്മദ് മുസ്‌ലിയാർ കൂറ്റനാട് എസ് കെ എസ് എസ് എഫ് ഉദ്ഘാടനം ചെയ്തു!',
      },
      {
        id: 'e3_a3',
        emoji: '🎓',
        label: 'വിജ്ഞാനം · വിനയം · സേവനം',
        x: '79%',
        y: '26%',
        discovery:
          'കെ.കെ. അബൂബക്കർ ഹസ്രത്ത് അധ്യക്ഷനായ സമ്മേളനത്തിൽ നാട്ടിക വി. മൂസ മുസ്‌ലിയാർ, കെ.ടി. മാനു മുസ്‌ലിയാർ, എം.പി. അബ്ദുസ്സമദ് സമദാനി, സെയ്തു മുഹമ്മദ് നിസാമി തുടങ്ങിയവർ പങ്കെടുത്തു!',
        speech:
          'കെ കെ അബൂബക്കർ ഹസ്രത്ത് അധ്യക്ഷനായ സമ്മേളനത്തിൽ നാട്ടിക വി മൂസ മുസ്‌ലിയാർ, കെ ടി മാനു മുസ്‌ലിയാർ, എം പി അബ്ദുസ്സമദ് സമദാനി, സെയ്തു മുഹമ്മദ് നിസാമി തുടങ്ങിയവർ പങ്കെടുത്തു!',
      },
    ],
  },
  {
    id: 4,
    emoji: '☎️',
    year: '1989–1995',
    title: 'ക്യാമ്പുകളും സമാധാന പ്രഖ്യാപനവും',
    boatX: '70%',
    missionCue: 'പഴയ റോട്ടറി ഫോൺ ഡയൽ കറക്കി 1989, 1992, 1995 വർഷങ്ങൾ വിളിക്കൂ!',
    artifacts: [
      {
        id: 'e4_a1',
        emoji: '📞',
        label: 'ലാൻഡ്‌ഫോൺ ക്യാമ്പുകൾ',
        x: '21%',
        y: '26%',
        discovery:
          'മൊബൈൽ ഫോണില്ലാത്ത കാലത്ത് ക്യാമ്പിലെ ലാൻഡ്‌ഫോൺ നമ്പർ മാത്രം വീട്ടിൽ നൽകി നടന്ന 2 ദിവസത്തെ ക്യാമ്പുകളിൽ നാട്ടിക ഉസ്താദും (نَوَّرَ اللهُ مَرْقَدَهُ) കെ.വി. ഉസ്താദും (نَوَّرَ اللهُ مَرْقَدَهُ) ക്ലാസുകൾ നയിച്ചു!',
        speech:
          'മൊബൈൽ ഫോണില്ലാത്ത കാലത്ത് ക്യാമ്പിലെ ലാൻഡ്‌ഫോൺ നമ്പർ മാത്രം വീട്ടിൽ നൽകി നടന്ന രണ്ട് ദിവസത്തെ ക്യാമ്പുകളിൽ നാട്ടിക ഉസ്താദും കെ വി ഉസ്താദും നവ്വറള്ളാഹു മർഖദഹു ക്ലാസുകൾ നയിച്ചു!',
      },
      {
        id: 'e4_a2',
        emoji: '🛡️',
        label: '1992 ബാബരി പശ്ചാത്തലം',
        x: '50%',
        y: '40%',
        discovery:
          '1992 ഡിസംബർ 6-ന് ശേഷം ചിലർ യുവാക്കളെ അക്രമത്തിലേക്ക് വിളിച്ചപ്പോൾ, SKSSF സമാധാനത്തിന്റെയും ജനാധിപത്യത്തിന്റെയും നല്ല വഴിയിൽ ഉറച്ചുനിന്നു.',
        speech:
          '1992 ഡിസംബർ ആറിന് ശേഷം ചിലർ യുവാക്കളെ അക്രമത്തിലേക്ക് വിളിച്ചപ്പോൾ, എസ് കെ എസ് എസ് എഫ് സമാധാനത്തിന്റെയും ജനാധിപത്യത്തിന്റെയും നല്ല വഴിയിൽ ഉറച്ചുനിന്നു.',
      },
      {
        id: 'e4_a3',
        emoji: '🎤',
        label: '1995 ടാഗോർ ഹാൾ പ്രഖ്യാപനം',
        x: '79%',
        y: '26%',
        discovery:
          '1995 ഡിസംബറിൽ കോഴിക്കോട് ടാഗോർ ഹാളിൽ ശംസുൽ ഉലമ ഇ.കെ. അബൂബക്കർ മുസ്‌ലിയാർ (نَوَّرَ اللهُ مَرْقَدَهُ) “തീവ്രവാദം തെറ്റും ശരിയും” ചരിത്ര പ്രഖ്യാപനം നടത്തി; 1995-ലെ NDF റാലിയിൽ നിന്ന് സമസ്ത വിട്ടുനിന്നു.',
        speech:
          '1995 ഡിസംബറിൽ കോഴിക്കോട് ടാഗോർ ഹാളിൽ ശംസുൽ ഉലമ ഇ കെ അബൂബക്കർ മുസ്‌ലിയാർ നവ്വറള്ളാഹു മർഖദഹു തീവ്രവാദം തെറ്റും ശരിയും എന്ന ചരിത്ര പ്രഖ്യാപനം നടത്തി; 1995-ലെ എൻ ഡി എഫ് റാലിയിൽ നിന്ന് സമസ്ത വിട്ടുനിന്നു.',
      },
    ],
  },
  {
    id: 5,
    emoji: '🌍',
    year: '1993–ആഗോളം',
    title: 'SKSBV, 1999 വാദിനൂർ & ലോകമെങ്ങും പ്രകാശം',
    boatX: '84%',
    missionCue: 'കേരളത്തിൽ നിന്ന് ലോകമെങ്ങും പടർന്ന പ്രകാശം കാണൂ!',
    showSksbvFlag: true,
    artifacts: [
      {
        id: 'e5_a1',
        emoji: '👧🏽',
        label: '1993 SKSBV & 1999 വാദിനൂർ',
        x: '21%',
        y: '26%',
        discovery:
          '1993 ഡിസംബർ 26-ന് പാണക്കാട് സയ്യിദ് ഉമർ അലി ശിഹാബ് തങ്ങളും കെ.ടി. മാനു മുസ്‌ലിയാരും SKSBV തുടങ്ങി (ആദ്യ പ്രസിഡന്റ്: സയ്യിദ് ഹമീദലി ശിഹാബ് തങ്ങൾ). 1999 വാദിനൂർ സമ്മേളനം വിങ്ങുകൾക്ക് തുടക്കമിട്ടു!',
        speech:
          '1993 ഡിസംബർ 26-ന് പാണക്കാട് സയ്യിദ് ഉമർ അലി ശിഹാബ് തങ്ങളും കെ ടി മാനു മുസ്‌ലിയാരും എസ് കെ എസ് ബി വി തുടങ്ങി. ആദ്യ പ്രസിഡന്റ് സയ്യിദ് ഹമീദലി ശിഹാബ് തങ്ങൾ ആയിരുന്നു. 1999 വാദിനൂർ സമ്മേളനം വിങ്ങുകൾക്ക് തുടക്കമിട്ടു!',
      },
      {
        id: 'e5_a2',
        emoji: '✈️',
        label: 'SIC · SPC · മക്ക ഹജ്ജ് വിഖായ',
        x: '50%',
        y: '40%',
        discovery:
          'വിദേശ രാജ്യങ്ങളിലെ SIC, പ്രവാസി ക്ഷേമത്തിനുള്ള SPC, മക്കയിലും മദീനയിലും ഹാജിമാരെ സഹായിക്കുന്ന വിഖായ എന്നിവ ലോകമെങ്ങും സേവനം ചെയ്യുന്നു!',
        speech:
          'വിദേശ രാജ്യങ്ങളിലെ എസ് ഐ സി, പ്രവാസി ക്ഷേമത്തിനുള്ള എസ് പി സി, മക്കയിലും മദീനയിലും ഹാജിമാരെ സഹായിക്കുന്ന വിഖായ എന്നിവ ലോകമെങ്ങും സേവനം ചെയ്യുന്നു!',
      },
      {
        id: 'e5_a3',
        emoji: '💻',
        label: 'ഇ-ലേണിംഗ് & SKICR പ്രക്ഷേപണം',
        x: '79%',
        y: '26%',
        discovery:
          'ലോകത്തെമ്പാടുമുള്ള കുട്ടികൾക്കായി Samastha E-Learning, ലൈവ് പ്രബോധനത്തിനായി SKICR, കൂടാതെ സയ്യിദുൽ ഉലമാ സയ്യിദ് മുഹമ്മദ് ജിഫ്രി മുത്തുക്കോയ തങ്ങൾ വരെയുള്ള പണ്ഡിത നേതൃത്വം!',
        speech:
          'ലോകത്തെമ്പാടുമുള്ള കുട്ടികൾക്കായി സമസ്ത ഇ ലേണിംഗ്, ലൈവ് പ്രബോധനത്തിനായി എസ് കെ ഐ സി ആർ, കൂടാതെ സയ്യിദുൽ ഉലമാ സയ്യിദ് മുഹമ്മദ് ജിഫ്രി മുത്തുക്കോയ തങ്ങൾ വരെയുള്ള പണ്ഡിത നേതൃത്വം!',
      },
    ],
  },
];

type FlagSlot = 'canton' | 'mosque' | 'green';

const L1_FLAT_ORDER: {
  tab: L1Tab;
  lessonId: string;
  emoji: string;
  label: string;
  eraIdx?: number;
}[] = [
  { tab: 'era_1', lessonId: 'l1_era_1', emoji: '⛵', label: '1921–1924 ചരിത്രം', eraIdx: 0 },
  { tab: 'era_2', lessonId: 'l1_era_2', emoji: '🕌', label: '1926 സമസ്ത പിറവി', eraIdx: 1 },
  { tab: 'era_3', lessonId: 'l1_era_3', emoji: '🏫', label: '1951 & 1989 SKSSF', eraIdx: 2 },
  { tab: 'era_4', lessonId: 'l1_era_4', emoji: '☎️', label: '1989–1995 ടാഗോർ ഹാൾ', eraIdx: 3 },
  { tab: 'era_5', lessonId: 'l1_timeline', emoji: '🌍', label: '1993 SKSBV & ആഗോളം', eraIdx: 4 },
  { tab: 'flags', lessonId: 'l1_flags', emoji: '🚩', label: 'പതാക നിർമ്മാണം' },
  { tab: 'cosmic', lessonId: 'l1_cosmic', emoji: '🌱', label: 'വിശ്വാസ ശൃംഖല' },
  { tab: 'roots', lessonId: 'l1_roots', emoji: '📚', label: 'സമസ്തയുടെ വേരുകൾ' },
];

function normalizeL1Tab(tab?: L1Tab | 'timeline'): L1Tab {
  if (!tab || tab === 'timeline') return 'era_1';
  return tab;
}

export const Level1Story: React.FC<Level1StoryProps> = ({
  isCompleted,
  initialTab = 'era_1',
  devUnlocked = false,
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
}) => {
  const [phase, setPhase] = useState<L1Tab>(() => normalizeL1Tab(initialTab));
  const [activeFlagTab, setActiveFlagTab] = useState<'skju' | 'skssf'>('skju');
  const [flippedRoots, setFlippedRoots] = useState<string[]>([]);
  const [cosmicIdx, setCosmicIdx] = useState<number>(0);
  const [selectedOtherExampleIdx, setSelectedOtherExampleIdx] = useState<number>(0);
  const [visitedCosmicIds, setVisitedCosmicIds] = useState<string[]>(['c1']);

  const [collectedArtifacts, setCollectedArtifacts] = useState<string[]>([]);
  const [glitterKey, setGlitterKey] = useState(0);
  const [glitterMsg, setGlitterMsg] = useState<string>('');

  const [skjuSlots, setSkjuSlots] = useState<Record<FlagSlot, boolean>>({
    canton: false,
    mosque: false,
    green: false,
  });
  const [skssfSlots, setSkssfSlots] = useState<Record<FlagSlot, boolean>>({
    canton: false,
    mosque: false,
    green: false,
  });
  const [selectedPiece, setSelectedPiece] = useState<FlagSlot | null>(null);
  const [flagAlert, setFlagAlert] = useState<string | null>(null);
  const [flagMistakes, setFlagMistakes] = useState<number>(0);
  const [completedSceneGames, setCompletedSceneGames] = useState<string[]>([]);

  const phaseIndex = Math.max(0, L1_FLAT_ORDER.findIndex((x) => x.tab === phase));
  const currentMeta = L1_FLAT_ORDER[phaseIndex] ?? L1_FLAT_ORDER[0];
  const isEraPhase = typeof currentMeta.eraIdx === 'number';
  const boardIdx = currentMeta.eraIdx ?? 0;
  const board = ERA_BOARDS[boardIdx] ?? ERA_BOARDS[0];
  const activeLessonId = currentMeta.lessonId;

  const skjuBuilt = skjuSlots.canton && skjuSlots.mosque && skjuSlots.green;
  const skssfBuilt = skssfSlots.canton && skssfSlots.mosque && skssfSlots.green;
  const flagFailed = flagMistakes >= 3 && !(skjuBuilt && skssfBuilt);

  const cosmicQuizDone = Boolean(quizAnswers.l1_cosmic);
  const rootsQuizDone = Boolean(quizAnswers.l1_roots);
  const cosmicGameDone =
    completedLessonIds.includes('l1_cosmic') || completedSceneGames.includes('l1_cosmic');
  const rootsGameDone =
    completedLessonIds.includes('l1_roots') || completedSceneGames.includes('l1_roots');

  const currentQuizDone = Boolean(quizAnswers[activeLessonId]);
  const currentLessonSaved = isCompleted || completedLessonIds.includes(activeLessonId);
  const canAdvanceCurrent = devUnlocked || currentLessonSaved || currentQuizDone;

  useEffect(() => {
    setPhase(normalizeL1Tab(initialTab));
  }, [initialTab]);

  useEffect(() => {
    onActiveLessonChange?.(activeLessonId);
  }, [activeLessonId, onActiveLessonChange]);

  useEffect(() => {
    if (currentQuizDone && !completedLessonIds.includes(activeLessonId)) {
      onMarkLessonCompleted?.(activeLessonId);
    }
  }, [activeLessonId, currentQuizDone, completedLessonIds, onMarkLessonCompleted]);

  useEffect(() => {
    if (phase === 'roots') {
      narrator.speak(
        'സമസ്തയുടെ വേരുകൾ! ഈ ആറ് ത്രീഡി പൈതൃക കാർഡുകളിൽ ടാപ്പ് ചെയ്ത് കഥ കേൾക്കൂ.',
        '📚 3D പൈതൃക കാർഡുകൾ'
      );
    } else if (phase === 'cosmic') {
      narrator.speak(
        'അല്ലാഹുവിനെ കണ്ടെത്താനുള്ള ദൃഷ്ടാന്തങ്ങൾ! ചെടിയും വിത്തും ആറ്റവും ഒരു ഉദാഹരണം മാത്രമാണ് — മഴയും തേനീച്ചക്കൂടും ഹൃദയമിടിപ്പും സൂര്യനും ചന്ദ്രനുമെല്ലാം അല്ലാഹുവിന്റെ ദൃഷ്ടാന്തങ്ങളാണ്. ഓരോ കാർഡിലും തൊട്ട് അവിടെത്തന്നെ വായിക്കൂ!',
        '🌱 അല്ലാഹുവിലേക്കുള്ള ദൃഷ്ടാന്തങ്ങൾ'
      );
    } else if (phase === 'flags') {
      narrator.speak(
        'ത്രീഡി പതാക നിർമ്മാണശാല! സമസ്തയുടെയും എസ് കെ എസ് എസ് എഫിന്റെയും യഥാർത്ഥ പതാകകൾ കൂട്ടിച്ചേർക്കൂ.',
        '🚩 3D പതാക നിർമ്മാണശാല'
      );
    } else {
      narrator.speak(`${board.title}. ${board.missionCue}`, `${board.emoji} ${board.title}`);
    }
  }, [phase, board.title, board.missionCue, board.emoji]);

  const triggerGlitter = (msg: string) => {
    setGlitterMsg(msg);
    setGlitterKey((k) => k + 1);
  };

  const handleFlipRoot = (card: FlipRootCard) => {
    sound.playPop();
    const isNowFlippingOpen = !flippedRoots.includes(card.id);
    setFlippedRoots((prev) =>
      prev.includes(card.id) ? prev.filter((x) => x !== card.id) : [...prev, card.id]
    );
    if (isNowFlippingOpen) {
      sound.playWriting();
      onAwardXp(15, `l1_root_${card.id}`);
      triggerGlitter('✨ പൈതൃക കാർഡ് തുറന്നു! +15 XP');
      narrator.speak(card.speech, `${card.emoji} ${card.frontTitle}`);
    }
  };

  const handleCollectArtifact = (art: { id: string; emoji: string; label: string; speech: string }) => {
    narrator.speak(art.speech, `${art.emoji} ${art.label}`);
    if (!collectedArtifacts.includes(art.id)) {
      sound.playSuccess();
      if (art.id.startsWith('e1') || art.id.startsWith('e5')) {
        sound.playSeagull();
      } else {
        sound.playWriting();
      }
      const next = [...collectedArtifacts, art.id];
      setCollectedArtifacts(next);
      onAwardXp(15, `l1_art_${art.id}`);
      triggerGlitter(`✨ ${art.label} (+15 XP)`);
      const boardAllDone = board.artifacts.every((a) => next.includes(a.id));
      if (boardAllDone) {
        window.setTimeout(() => scrollToActiveQuiz(), 900);
      }
    } else {
      sound.playClick();
    }
  };

  const handlePlaceFlagPiece = (
    variant: 'skju' | 'skssf',
    targetSlot: FlagSlot,
    pieceSlot: FlagSlot | null,
    fromCanvasTap = false
  ) => {
    const current = variant === 'skju' ? skjuSlots : skssfSlots;
    const effectiveSlot: FlagSlot | null =
      pieceSlot && !current[pieceSlot]
        ? fromCanvasTap && pieceSlot !== targetSlot
          ? pieceSlot
          : targetSlot
        : fromCanvasTap && !current[targetSlot]
        ? targetSlot
        : null;

    if (flagFailed) return;
    if (!effectiveSlot) return;

    if (!fromCanvasTap && pieceSlot && pieceSlot !== targetSlot) {
      sound.playError();
      const nextM = flagMistakes + 1;
      setFlagMistakes(nextM);
      setFlagAlert(
        nextM >= 3
          ? '💥 3 തവണ തെറ്റായ സ്ഥാനത്ത് വെച്ചു! പതാക നിർമ്മാണം പരാജയപ്പെട്ടു — വീണ്ടും ശ്രമിക്കാം!'
          : `ഈ ഭാഗം മറ്റൊരു സ്ഥാനത്താണ് ചേരുക (${3 - nextM} അവസരം ബാക്കി) — ശരിയായ സ്ഥാനം തിരഞ്ഞെടുക്കൂ.`
      );
      return;
    }

    setFlagAlert(null);
    const updater = variant === 'skju' ? setSkjuSlots : setSkssfSlots;
    const nextState = { ...current, [effectiveSlot]: true };
    updater(nextState);
    setSelectedPiece(null);

    if (nextState.canton && nextState.mosque && nextState.green) {
      sound.playHoist();
      onAwardXp(40, `l1_flag_craft_${variant}`);
      const flagSpeech =
        variant === 'skju'
          ? 'മനോഹരം! സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമയുടെ പതാക ഉയർന്നു!'
          : 'മനോഹരം! ആകാശനീലയും വെള്ളയും പച്ചയും ചേർന്ന എസ് കെ എസ് എസ് എഫ് പതാക ഉയർന്നു!';
      triggerGlitter('🎉 ഔദ്യോഗിക പതാക ഉയർന്നു! +40 XP');
      narrator.speak(flagSpeech);
      if (variant === 'skju' && !skssfBuilt) {
        window.setTimeout(() => {
          setActiveFlagTab('skssf');
          setSelectedPiece(null);
        }, 1200);
      } else {
        window.setTimeout(() => scrollToActiveQuiz(), 1000);
      }
    } else {
      sound.playDrop();
    }
  };

  const handleFinishLevel1 = () => {
    sound.playUnlock();
    onAwardXp(50, 'l1_complete');
    onUnlockBadge('⛵ യൂണിറ്റ് താരം');
    narrator.speak(
      'മികച്ച പ്രകടനം! യൂണിറ്റ് തലം പൂർത്തിയായി. ഇനി ക്ലസ്റ്റർ, മേഖലാ തലത്തിലേക്ക് കടക്കാം!'
    );
    onCompleteLevel();
  };

  const renderEraIcon = (id: number) => {
    switch (id) {
      case 1:
        return <Ship className="w-5 h-5 text-amber-300" />;
      case 2:
        return <Landmark className="w-5 h-5 text-amber-300" />;
      case 3:
        return <Flag className="w-5 h-5 text-sky-300" />;
      case 4:
        return <Phone className="w-5 h-5 text-emerald-300" />;
      default:
        return <Globe className="w-5 h-5 text-amber-300" />;
    }
  };

  const renderFlagWorkshop = (variant: 'skju' | 'skssf') => {
    const slots = variant === 'skju' ? skjuSlots : skssfSlots;
    const isBuilt = variant === 'skju' ? skjuBuilt : skssfBuilt;
    const pieces: { slot: FlagSlot; label: string; colorClass: string }[] =
      variant === 'skju'
        ? [
            {
              slot: 'canton',
              label: '🌙 1. മെറൂൺ കന്റോൺ + ചന്ദ്രക്കല',
              colorClass: 'bg-[#8C1D40] text-white border-[#6B1330]',
            },
            {
              slot: 'mosque',
              label: '🕌 2. വെള്ള പ്രതലം + മസ്ജിദ്',
              colorClass: 'bg-white text-slate-900 border-slate-300',
            },
            {
              slot: 'green',
              label: '🌿 3. താഴെ പച്ച വരമ്പ്',
              colorClass: 'bg-emerald-600 text-white border-emerald-800',
            },
          ]
        : [
            {
              slot: 'canton',
              label: '🌙 1. ആകാശനീല + ചന്ദ്രക്കല',
              colorClass: 'bg-sky-500 text-white border-sky-700',
            },
            {
              slot: 'mosque',
              label: '🕌 2. വെള്ള പ്രതലം + മസ്ജിദ്',
              colorClass: 'bg-white text-slate-900 border-slate-300',
            },
            {
              slot: 'green',
              label: '🌿 3. താഴെ പച്ച വരമ്പ് + SKSSF',
              colorClass: 'bg-emerald-600 text-white border-emerald-800',
            },
          ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 shadow-sm space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
            🚩 3D പതാക നിർമ്മാണശാല:{' '}
            {variant === 'skju' ? 'സമസ്ത (SKJU) പതാക' : 'SKSSF പതാക'} കൂട്ടിച്ചേർക്കൂ!
          </h4>
          <div className="flex items-center gap-2">
            {!isBuilt && (
              <GameShatterLives
                lives={Math.max(0, 3 - flagMistakes)}
                maxLives={3}
                dark={false}
                compact
              />
            )}
            {isBuilt && (
              <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500" /> പതാക ഉയർന്നു! (+40 XP)
              </span>
            )}
          </div>
        </div>

        {flagFailed && (
          <GameDefeatBurstOverlay
            title="പതാക നിർമ്മാണം പരാജയപ്പെട്ടു!"
            reason="3 തവണ തെറ്റായ സ്ഥാനത്ത് വെച്ചതിനാൽ കവചങ്ങൾ തകർന്നു. ശ്രദ്ധയോടെ വീണ്ടും കൂട്ടിച്ചേർക്കാം!"
            onRetry={() => {
              sound.playClick();
              setFlagMistakes(0);
              setFlagAlert(null);
              setSelectedPiece(null);
              if (variant === 'skju') {
                setSkjuSlots({ canton: false, mosque: false, green: false });
              } else {
                setSkssfSlots({ canton: false, mosque: false, green: false });
              }
            }}
            overlay={false}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 space-y-2">
            {pieces.map((p) => {
              const placed = slots[p.slot];
              const isSelected = selectedPiece === p.slot;
              return (
                <button
                  key={p.slot}
                  type="button"
                  draggable={!placed}
                  disabled={placed}
                  onDragStart={() => {
                    sound.playClick();
                    setSelectedPiece(p.slot);
                  }}
                  onClick={() => {
                    if (!placed) {
                      sound.playClick();
                      setSelectedPiece(p.slot);
                    }
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl border border-b-4 text-xs font-extrabold flex items-center justify-between transition-all ${
                    placed
                      ? 'opacity-40 bg-slate-100 text-slate-500 border-slate-200 cursor-default'
                      : isSelected
                      ? `${p.colorClass} ring-2 ring-amber-400 scale-[1.02]`
                      : `${p.colorClass} active:translate-y-0.5 cursor-grab card-3d-tilt`
                  }`}
                >
                  <span className="text-base leading-none">
                    {p.slot === 'canton' ? '🌙' : p.slot === 'mosque' ? '🕌' : '🟩'}
                  </span>
                  <span className="text-xs font-extrabold">
                    {isSelected ? p.label : placed ? '✓' : '👆'}
                  </span>
                </button>
              );
            })}

            {!isBuilt && (
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['canton', 'mosque', 'green'] as FlagSlot[]).map((target) => (
                  <button
                    key={target}
                    type="button"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handlePlaceFlagPiece(variant, target, selectedPiece)}
                    onClick={() => handlePlaceFlagPiece(variant, target, selectedPiece)}
                    disabled={slots[target]}
                    aria-label={target}
                    className={`py-2 px-1.5 rounded-lg border-2 border-dashed text-sm font-extrabold ${
                      slots[target]
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : selectedPiece
                        ? 'bg-amber-50 border-amber-500 text-amber-900 animate-pulse'
                        : 'bg-slate-50 border-slate-300 text-slate-500'
                    }`}
                  >
                    {slots[target] ? '✅' : target === 'canton' ? '↖️' : target === 'mosque' ? '⬜' : '⬇️'}
                  </button>
                ))}
              </div>
            )}

            {flagAlert && (
              <p className="text-xs font-bold text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                {flagAlert}
              </p>
            )}
          </div>

          <div
            onClick={() => {
              if (!isBuilt && selectedPiece) {
                handlePlaceFlagPiece(variant, selectedPiece, selectedPiece, true);
              }
            }}
            className={`md:col-span-7 bg-gradient-to-br from-sky-50 via-white to-emerald-50 rounded-xl border-2 p-4 flex flex-col items-center justify-center min-h-[210px] transition-colors ${
              !isBuilt && selectedPiece
                ? 'border-amber-400 cursor-pointer ring-2 ring-amber-200'
                : 'border-slate-200'
            }`}
          >
            {isBuilt ? (
              <motion.div
                initial={{ scale: 0.7, rotateY: -20 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                className="text-center space-y-1.5"
              >
                {variant === 'skju' ? (
                  <OfficialSamasthaFlagImg className="w-40 h-40 mx-auto flag-wave" />
                ) : (
                  <OfficialSkssfFlagImg className="w-40 h-40 mx-auto flag-wave" />
                )}
                <p className="text-xs font-extrabold text-emerald-800">
                  🎉 യഥാർത്ഥ ഔദ്യോഗിക പതാക ഉയർന്നു!
                </p>
              </motion.div>
            ) : (
              <AuthenticFlagCanvas
                variant={variant}
                hasCanton={slots.canton}
                hasMosqueField={slots.mosque}
                hasGreenStrip={slots.green}
                animated={true}
                selectedPiece={selectedPiece}
                onSlotClick={(slot) => handlePlaceFlagPiece(variant, slot, selectedPiece, true)}
                onSlotDrop={(slot) => handlePlaceFlagPiece(variant, slot, selectedPiece, true)}
                className="w-full max-w-xs"
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const handleAdvanceL1 = () => {
    onMarkLessonCompleted?.(activeLessonId);
    if (phaseIndex < L1_FLAT_ORDER.length - 1) {
      setPhase(L1_FLAT_ORDER[phaseIndex + 1].tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinishLevel1();
    }
  };

  const nextL1Label =
    phaseIndex < L1_FLAT_ORDER.length - 1
      ? L1_FLAT_ORDER[phaseIndex + 1].label
      : 'ഘട്ടം 2 · ക്ലസ്റ്റർ & മേഖലാ തലം';

  const currentBoardFoundCount = board.artifacts.filter((a) =>
    collectedArtifacts.includes(a.id)
  ).length;

  return (
    <section className="space-y-4">
      {/* FLAT ERA LESSONS (5 STANDALONE LESSONS: era_1 .. era_5) */}
      {isEraPhase && (
        <div className="space-y-4">
          {/* 1. GAME FIRST */}
          <GameFullscreenShell
            title={`${board.emoji} ${board.title}`}
            subtitle={`${board.year} · ${board.missionCue}`}
            isGameDone={currentBoardFoundCount >= board.artifacts.length}
          >
            <div className="relative rounded-2xl border-2 border-emerald-300 overflow-hidden shadow-md bg-slate-950">
              <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
              <div className="px-3 py-2 bg-slate-950 border-b border-white/15 flex items-center justify-between gap-2 text-white">
                <div className="flex items-center gap-2 text-xs font-extrabold tabular-nums">
                  <Compass className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{board.emoji} {board.year}</span>
                  <span className="text-amber-300">📜 {currentBoardFoundCount}/{board.artifacts.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  {onClaimEasterEgg && (
                    <EasterEggSpot
                      eggId="egg_captain_compass"
                      collected={collectedEggs.includes('egg_captain_compass')}
                      onClaim={onClaimEasterEgg}
                    />
                  )}
                  {renderEraIcon(board.id)}
                </div>
              </div>

              <EraInteractiveStage
                key={board.id}
                boardId={board.id}
                artifacts={board.artifacts}
                collectedIds={collectedArtifacts}
                onCollect={handleCollectArtifact}
              />
            </div>
          </GameFullscreenShell>

          {/* 2. LESSON OPEN BY DEFAULT RIGHT AFTER GAME LAUNCHER */}
          <CollapsibleLessonDrawer
            key={`l1-era-info-${board.id}`}
            emoji={board.emoji}
            title={`${board.year} · ${board.title}`}
            badgeText={`${boardIdx + 1}/5`}
            onSpeak={() => narrator.speak(`${board.title}. ${board.artifacts.map((a) => a.discovery).join(' ')}`, board.title)}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2.5">
                {board.artifacts.map((art) => (
                  <div
                    key={art.id}
                    className="bg-white rounded-xl border border-emerald-200 p-3.5 flex items-start gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-extrabold text-emerald-950">
                        {art.emoji} {art.label}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {art.discovery}
                      </p>
                    </div>
                    {art.label.includes('SKICR') && (
                      <img
                        src={OFFICIAL_WING_LOGOS.skicr.src}
                        alt={OFFICIAL_WING_LOGOS.skicr.label}
                        className="h-12 w-12 object-contain rounded-lg bg-slate-50 p-1 border border-slate-200 shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>

              {board.id === 3 && (
                <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <OfficialSkimvbLogoImg className="w-12 h-12 shrink-0" />
                    <p className="text-xs sm:text-sm text-slate-700">
                      <strong>🏫 SKIMVB (1951):</strong> നമ്മുടെ കുട്ടികൾക്ക് നല്ല മതപഠനം നൽകാൻ തുടങ്ങിയ ബോർഡ് — ഇന്ന് 11,000+ മദ്രസകളും ജാമിഅ നൂരിയ്യയും SNEC/CSWC/Albirr ഉം മുഅല്ലിമീൻ (SKJMCC) സേവനവും നയിക്കുന്നു!
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      OFFICIAL_WING_LOGOS.snec,
                      OFFICIAL_WING_LOGOS.skjmcc,
                      OFFICIAL_WING_LOGOS.albirr_preschool,
                      OFFICIAL_WING_LOGOS.thwalaba,
                    ].map((logo) => (
                      <div
                        key={logo.id}
                        className="rounded-lg bg-slate-50 border border-slate-200 p-1.5 flex flex-col items-center justify-center gap-0.5"
                        title={logo.label}
                      >
                        <img
                          src={logo.src}
                          alt={logo.label}
                          className="h-9 w-full object-contain"
                        />
                        <span className="text-[9px] font-extrabold text-slate-700 truncate w-full text-center">
                          {logo.shortLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {board.showSksbvFlag && (
                <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col sm:flex-row items-center gap-4">
                  <OfficialSksbvFlagImg className="w-28 h-28 shrink-0 flag-wave" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-sky-700">
                      1993 ഡിസംബർ 26 · 10,637+ മദ്രസാ യൂണിറ്റുകൾ · 17 ജില്ലകൾ
                    </p>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      🚩 SKSBV ഔദ്യോഗിക പതാകയും ആഗോള ശൃംഖലയും
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      മജ്‌ലിസുൽ മആരിഫ്, ജ്ഞാനതീരം, ബാല ഇന്ത്യ എന്നീ പരിപാടികളോടൊപ്പം വിദേശ രാജ്യങ്ങളിലും (SIC &amp; SPC) മക്ക-മദീന ഹജ്ജ് സേവനങ്ങളിലും (വിഖായ) സമസ്ത സജീവമാണ്.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleLessonDrawer>

          {/* 3. STORYLINE (COLLAPSED) + MANDATORY QUIZ */}
          <LessonCheckQuiz
            key={`l1-quiz-${activeLessonId}`}
            lessonId={activeLessonId}
            title={`${board.year} · ക്വിസ്`}
            savedAnswer={quizAnswers[activeLessonId]}
            onAnswered={(lid, idx, ok) => {
              onQuizAnswered(lid, idx, ok);
              onMarkLessonCompleted?.(activeLessonId);
            }}
            onNextLesson={handleAdvanceL1}
            nextLessonLabel={`അടുത്ത പാഠം: ${nextL1Label}`}
          />
        </div>
      )}

      {/* PHASE: FLAG WORKSHOP */}
      {phase === 'flags' && (
        <div className="space-y-4 relative">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
          {/* 1. GAME FIRST */}
          <GameFullscreenShell
            title="🚩 3D പതാക നിർമ്മാണ ശാല"
            subtitle="സമസ്ത (SKJU) & SKSSF ഔദ്യോഗിക പതാകകൾ കൂട്ടിച്ചേർത്ത് ഉയർത്തൂ"
          >
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-amber-950">
                  🚩 {[skjuBuilt, skssfBuilt].filter(Boolean).length}/2
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setActiveFlagTab('skju');
                      setSelectedPiece(null);
                      setFlagAlert(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border ${
                      activeFlagTab === 'skju'
                        ? 'bg-[#8C1D40] text-white border-[#6B1330]'
                        : 'bg-white text-slate-800 border-slate-300'
                    }`}
                  >
                    🌙 സമസ്ത (SKJU) പതാക {skjuBuilt ? '✓' : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setActiveFlagTab('skssf');
                      setSelectedPiece(null);
                      setFlagAlert(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border ${
                      activeFlagTab === 'skssf'
                        ? 'bg-sky-600 text-white border-sky-800'
                        : 'bg-white text-slate-800 border-slate-300'
                    }`}
                  >
                    🚩 SKSSF പതാക {skssfBuilt ? '✓' : ''}
                  </button>
                </div>
              </div>

              {renderFlagWorkshop(activeFlagTab)}
            </div>
          </GameFullscreenShell>

          {/* 2. LESSON OPEN BY DEFAULT RIGHT AFTER GAME LAUNCHER */}
          <CollapsibleLessonDrawer
            key="l1-flags-lesson"
            emoji="🚩"
            title="സമസ്ത & SKSSF ഔദ്യോഗിക പതാകകൾ · പാഠം"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-1.5">
                <p className="text-xs font-extrabold text-[#8C1D40]">🌙 സമസ്ത (SKJU) പതാക</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  മുകളിൽ ഇടതുവശത്ത് മെറൂൺ നിറത്തിൽ ചന്ദ്രക്കലയും നക്ഷത്രവും, വലതുവശത്ത് വെള്ള പ്രതലത്തിൽ മസ്ജിദും മിനാരവും, താഴെ ഇസ്‌ലാമിക് പച്ച വരമ്പും.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-1.5">
                <p className="text-xs font-extrabold text-sky-700">🚩 SKSSF പതാക</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  ആകാശനീല, തൂവെള്ള, പച്ച നിറങ്ങളോടെ വിജ്ഞാനം · വിനയം · സേവനം എന്ന ആദർശം വിളിച്ചോതുന്ന വിദ്യാർത്ഥി പ്രസ്ഥാനത്തിന്റെ ഔദ്യോഗിക പതാക.
                </p>
              </div>
            </div>
          </CollapsibleLessonDrawer>

          {/* 3. STORYLINE (COLLAPSED) + MANDATORY QUIZ */}
          <LessonCheckQuiz
            lessonId="l1_flags"
            title="പതാക നിർമ്മാണം · ക്വിസ്"
            savedAnswer={quizAnswers.l1_flags}
            onAnswered={(lid, idx, ok) => {
              onQuizAnswered(lid, idx, ok);
              onMarkLessonCompleted?.('l1_flags');
            }}
            onNextLesson={handleAdvanceL1}
            nextLessonLabel={`അടുത്ത പാഠം: ${nextL1Label}`}
          />
        </div>
      )}

      {/* PHASE: COSMIC */}
      {phase === 'cosmic' && (
        <div className="space-y-4 relative">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />

          {/* 1. GAME FIRST */}
          <OptionalLessonMiniGame
            lessonKey="l1_cosmic"
            onAwardXp={onAwardXp}
            isCompleted={cosmicGameDone}
            onComplete={() => {
              setCompletedSceneGames((prev) =>
                prev.includes('l1_cosmic') ? prev : [...prev, 'l1_cosmic']
              );
              if (cosmicQuizDone) onMarkLessonCompleted?.('l1_cosmic');
            }}
          />

          {/* 2. LESSON OPEN BY DEFAULT RIGHT AFTER GAME LAUNCHER */}
          <CollapsibleLessonDrawer
            key="l1-cosmic-lesson"
            emoji="🌱"
            title="വിശ്വാസ ശൃംഖല · പാഠം"
            badgeText={`${visitedCosmicIds.length}/${COSMIC_CHAIN.length + OTHER_COSMIC_EXAMPLES.length}`}
            onSpeak={() => sound.playQuran('ikhlas')}
          >
            <div className="space-y-3">
              <div className="bg-white rounded-xl border border-emerald-200 p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    🌱 ചെടി മുതൽ ഏക സൃഷ്ടാവായ അല്ലാഹു വരെ
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      sound.unlockAudio();
                      sound.playQuran('ikhlas');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold hover:bg-amber-300"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> ഖുറാൻ
                  </button>
                </div>

                <div className="space-y-2">
                  {COSMIC_CHAIN.map((item, idx) => {
                    const isOpen = cosmicIdx === idx;
                    const seen = visitedCosmicIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border-2 overflow-hidden transition-colors ${
                          isOpen
                            ? 'border-emerald-600 bg-emerald-50/70'
                            : seen
                            ? 'border-emerald-200 bg-emerald-50/30'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            sound.playPop();
                            setCosmicIdx(idx);
                            setVisitedCosmicIds((prev) =>
                              prev.includes(item.id) ? prev : [...prev, item.id]
                            );
                            onAwardXp(5, `l1_cosmic_${item.id}`);
                            narrator.speak(`${item.step}: ${item.desc}`, item.step);
                          }}
                          className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left"
                        >
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <span className="text-base">{item.emoji}</span>
                            <span>{item.step}</span>
                            {seen && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-emerald-800 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-emerald-800 shrink-0" />
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
                              <div className="px-3.5 pb-3 pt-2 border-t border-emerald-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                                  {item.desc}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => narrator.speak(`${item.step}: ${item.desc}`, item.step)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-extrabold shrink-0 self-start sm:self-center"
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

              <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-3.5 space-y-2">
                <h4 className="text-xs sm:text-sm font-extrabold text-amber-950">
                  ✨ മറ്റു ദൃഷ്ടാന്തങ്ങൾ
                </h4>
                <div className="space-y-2">
                  {OTHER_COSMIC_EXAMPLES.map((ex, idx) => {
                    const isOpen = selectedOtherExampleIdx === idx;
                    const seen = visitedCosmicIds.includes(ex.id);
                    return (
                      <div
                        key={ex.id}
                        className={`rounded-xl border-2 overflow-hidden transition-colors ${
                          isOpen
                            ? 'border-amber-500 bg-amber-50/70'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            sound.playPop();
                            setSelectedOtherExampleIdx(idx);
                            setVisitedCosmicIds((prev) =>
                              prev.includes(ex.id) ? prev : [...prev, ex.id]
                            );
                            onAwardXp(5, `l1_cosmic_${ex.id}`);
                            narrator.speak(`${ex.title}. ${ex.desc}`, `${ex.emoji} ${ex.title}`);
                          }}
                          className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left"
                        >
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <span className="text-base">{ex.emoji}</span>
                            <span>{ex.title}</span>
                            {seen && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-amber-800 shrink-0" />
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
                              <div className="px-3.5 pb-3 pt-2 border-t border-amber-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                                  {ex.desc}
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    narrator.speak(`${ex.title}. ${ex.desc}`, `${ex.emoji} ${ex.title}`)
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-extrabold shrink-0 self-start sm:self-center"
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
            </div>
          </CollapsibleLessonDrawer>

          {/* 3. STORYLINE (COLLAPSED) + MANDATORY QUIZ */}
          <LessonCheckQuiz
            lessonId="l1_cosmic"
            title="വിശ്വാസ ശൃംഖല · ക്വിസ്"
            savedAnswer={quizAnswers.l1_cosmic}
            onAnswered={(lid, idx, ok) => {
              onQuizAnswered(lid, idx, ok);
              onMarkLessonCompleted?.('l1_cosmic');
            }}
            onNextLesson={handleAdvanceL1}
            nextLessonLabel={`അടുത്ത പാഠം: ${nextL1Label}`}
          />
        </div>
      )}

      {/* PHASE: ROOTS */}
      {phase === 'roots' && (
        <div className="space-y-4 relative">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />

          {/* 1. GAME FIRST */}
          <OptionalLessonMiniGame
            lessonKey="l1_roots"
            onAwardXp={onAwardXp}
            isCompleted={rootsGameDone}
            onComplete={() => {
              setCompletedSceneGames((prev) =>
                prev.includes('l1_roots') ? prev : [...prev, 'l1_roots']
              );
              if (rootsQuizDone) onMarkLessonCompleted?.('l1_roots');
            }}
          />

          {/* 2. LESSON OPEN BY DEFAULT RIGHT AFTER GAME LAUNCHER */}
          <CollapsibleLessonDrawer
            key="l1-roots-lesson"
            emoji="📚"
            title="സമസ്തയുടെ വേരുകൾ · പാഠം"
            badgeText={`${flippedRoots.length}/${ROOT_FLIP_CARDS.length}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {ROOT_FLIP_CARDS.map((card) => {
                const isFlipped = flippedRoots.includes(card.id);
                return (
                  <div key={card.id} className="perspective-1000 h-60 sm:h-64">
                    <button
                      type="button"
                      onClick={() => handleFlipRoot(card)}
                      className={`relative w-full h-full text-left preserve-3d transition-transform duration-500 cursor-pointer ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      <div className="absolute inset-0 backface-hidden rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-white via-emerald-50/50 to-amber-50/70 p-4 flex flex-col justify-between shadow-sm hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-red-900">
                            {card.emoji} {card.frontTag}
                          </span>
                          <RotateCw className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div className="text-center space-y-1.5">
                          {card.arabic && (
                            <p className="font-arabic text-xl font-bold text-emerald-900">
                              {card.arabic}
                            </p>
                          )}
                          <h3 className="text-base font-extrabold text-slate-900">
                            {card.frontTitle}
                          </h3>
                        </div>
                        <p className="text-xs text-center font-bold text-emerald-800">
                          👆 ടാപ്പ് ചെയ്യൂ ✨
                        </p>
                      </div>

                      <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 border-emerald-600 bg-emerald-950 text-white p-4 flex flex-col justify-between shadow-md">
                        <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                          <span>
                            {card.emoji} {card.frontTitle}
                          </span>
                          <span>↻</span>
                        </div>
                        <p className="text-xs leading-relaxed text-emerald-50 overflow-y-auto">
                          {card.backStory}
                        </p>
                        <p className="text-[11px] font-bold text-amber-300">✓</p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </CollapsibleLessonDrawer>

          {/* 3. STORYLINE (COLLAPSED) + MANDATORY QUIZ */}
          <LessonCheckQuiz
            lessonId="l1_roots"
            title="സമസ്തയുടെ വേരുകൾ · ക്വിസ്"
            savedAnswer={quizAnswers.l1_roots}
            onAnswered={(lid, idx, ok) => {
              onQuizAnswered(lid, idx, ok);
              onMarkLessonCompleted?.('l1_roots');
            }}
            onNextLesson={handleAdvanceL1}
            nextLessonLabel="ഘട്ടം 2 · ക്ലസ്റ്റർ & മേഖലാ തലം"
          />
        </div>
      )}

      {/* 4. NAVIGATION BELOW EVERYTHING */}
      <LessonStepperNav
        stepLabel={`യൂണിറ്റ് തലം · ${phaseIndex + 1}/${L1_FLAT_ORDER.length}: ${currentMeta.label}`}
        currentStep={phaseIndex}
        totalSteps={L1_FLAT_ORDER.length}
        prevLabel={phaseIndex > 0 ? L1_FLAT_ORDER[phaseIndex - 1].label : undefined}
        onPrev={
          phaseIndex > 0
            ? () => setPhase(L1_FLAT_ORDER[phaseIndex - 1].tab)
            : undefined
        }
        nextLabel={nextL1Label}
        nextIsWorldAdvance={phaseIndex === L1_FLAT_ORDER.length - 1}
        nextDisabled={!canAdvanceCurrent}
        onNext={handleAdvanceL1}
      />

      <LessonProgressTrack
        stageTitle="ഘട്ടം 1 · യൂണിറ്റ് തലം · 8 പാഠങ്ങൾ"
        stageSubtitle="ചരിത്രവും പതാകകളും വിശ്വാസ അടിത്തറയും"
        items={L1_FLAT_ORDER.map((x) => ({
          id: x.tab,
          lessonId: x.lessonId,
          emoji: x.emoji,
          label: x.label,
        }))}
        activeId={phase}
        completedLessonIds={completedLessonIds}
        devUnlocked={devUnlocked}
        onSelectCompleted={(id) => setPhase(id as L1Tab)}
      />
    </section>
  );
};
