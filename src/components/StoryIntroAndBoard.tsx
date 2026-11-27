import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  RotateCcw,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  AnimatedOceanLane,
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
import { AnnouncementVehicleActivity } from './InteractiveMiniGames';
import { MiniGameLessonKey, OptionalLessonMiniGame } from './OptionalLessonMiniGames';
import { QuizAnswerMap } from '../utils/gameStorage';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';

interface PrologueBeat {
  id: string;
  emoji: string;
  era: string;
  title: string;
  story: string;
  highlights: string[];
  speech: string;
  treasure: string;
}

const PROLOGUE_BEATS: PrologueBeat[] = [
  {
    id: 'p0_creator',
    emoji: '🌌',
    era: 'അദ്ധ്യായം 1 · പ്രപഞ്ചവും ഏക സൃഷ്ടാവും',
    title: 'ചെടിയും മഴയും ഹൃദയമിടിപ്പും: അല്ലാഹുവിനെ കണ്ടെത്താനുള്ള അനന്തമായ ദൃഷ്ടാന്തങ്ങൾ!',
    story:
      'നമ്മുടെ ചുറ്റുമുള്ള ലോകത്തേക്ക് സൂക്ഷ്മമായി നോക്കൂ — ഉദാഹരണമായി ഒരു ചെടി വളരണമെങ്കിൽ വിത്ത് വേണം, വിത്ത് രൂപപ്പെടാൻ സൂക്ഷ്മമായ ആറ്റങ്ങൾ വേണം! ഇത് വെറും ഒരു ഉദാഹരണം മാത്രമാണ്; അല്ലാഹുവിലേക്ക് എത്താനുള്ള വഴികളും ദൃഷ്ടാന്തങ്ങളും നമ്മുടെ ചുറ്റും അനന്തമാണ്! ഉപ്പുരസമുള്ള കടൽവെള്ളം ആകാശത്ത് മേഘമായി മാറി നമുക്ക് ശുദ്ധമായ മഴവെള്ളമായി പെയ്യുന്നത് നോക്കൂ; ആറു കോണുകൾ കൃത്യമായി അളന്നെടുത്തതുപോലെ തേനീച്ച കൂട് പണിയുന്നത് നോക്കൂ; നമ്മൾ ഉറങ്ങുമ്പോഴും ഒരു നിമിഷം പോലും വിശ്രമിക്കാതെ മിടിക്കുന്ന നമ്മുടെ ഹൃദയവും കൃത്യസമയത്ത് ഉദിക്കുന്ന സൂര്യനും ചന്ദ്രനും നോക്കൂ! ഇങ്ങനെ തുടർച്ചയായ മാറ്റത്തിന് വിധേയമായ പ്രപഞ്ചത്തിന് പിന്നിൽ, തുടക്കവും ഒടുക്കവുമില്ലാത്ത, ആരുടെയും സഹായം ആവശ്യമില്ലാത്ത ഏക സൃഷ്ടാവായ അല്ലാഹു ഉണ്ടെന്നത് കൊച്ചുകുട്ടികൾക്കും മുതിർന്നവർക്കും ഒരുപോലെ ബുദ്ധിക്ക് വ്യക്തമാണ്. ഇത്രയും കൃത്യമായ എൻജിനീയറിംഗും അനുപാതവും സന്തുലിതാവസ്ഥയുമുള്ള പ്രപഞ്ചം ഒരു സൃഷ്ടാവില്ലാതെ യാദൃച്ഛികമായി ഉണ്ടാകില്ല!',
    highlights: [
      'ചെടി ← വിത്ത് ← ആറ്റങ്ങൾ എന്നത് ഒരു ഉദാഹരണം മാത്രം — മഴയും മേഘങ്ങളും, തേനീച്ചക്കൂട്, ഹൃദയമിടിപ്പ്, സൂര്യൻ-ചന്ദ്രൻ, ഉമ്മയുടെ സ്നേഹം തുടങ്ങി ചുറ്റുമുള്ളതെല്ലാം അല്ലാഹുവിന്റെ ദൃഷ്ടാന്തങ്ങളാണ്',
      'തുടർച്ചയായി മാറിക്കൊണ്ടിരിക്കുന്ന ഈ പ്രപഞ്ചത്തിന്റെ കൃത്യമായ അനുപാതം തുടക്കവും ഒടുക്കവുമില്ലാത്ത ഏക സൃഷ്ടാവായ അല്ലാഹുവിനെ തെളിയിക്കുന്നു',
    ],
    speech:
      'പ്രപഞ്ചവും ഏക സൃഷ്ടാവും! ഒരു ചെടി വളരാൻ വിത്ത് വേണം, വിത്തിന് ആറ്റങ്ങൾ വേണം — ഇത് വെറും ഒരു ഉദാഹരണം മാത്രമാണ്! ഉപ്പുകടലിൽ നിന്ന് ശുദ്ധമായ മഴ പെയ്യുന്നതും, തേനീച്ച കൃത്യമായി കൂട് പണിയുന്നതും, ഉറങ്ങുമ്പോഴും നമ്മുടെ ഹൃദയം മിടിക്കുന്നതും, സൂര്യനും ചന്ദ്രനും കൃത്യസമയത്ത് ഉദിക്കുന്നതും എല്ലാം അല്ലാഹുവിലേക്കുള്ള ദൃഷ്ടാന്തങ്ങളാണ്. ഇത്ര കൃത്യമായ പ്രപഞ്ചത്തിന് പിന്നിൽ തുടക്കവും ഒടുക്കവുമില്ലാത്ത ഏക സൃഷ്ടാവായ അല്ലാഹു ഉണ്ടെന്നത് എല്ലാവർക്കും വ്യക്തമാണ്!',
    treasure: '✨ പ്രധാന പാഠം: തൗഹീദിന്റെ വെളിച്ചം',
  },
  {
    id: 'p0_prophet',
    emoji: '📖',
    era: 'അദ്ധ്യായം 2 · ഖുർആനും റസൂൽ ﷺ വഴികാട്ടിയും',
    title: 'മുഹമ്മദ് നബി ﷺ കാണിച്ചുതന്ന നന്മയുടെയും കാരുണ്യത്തിന്റെയും പാത!',
    story:
      'മനുഷ്യൻ എങ്ങനെ സത്യസന്ധമായും കരുണയോടെയും ജീവിക്കണം എന്ന് പഠിപ്പിക്കാനാണ് അല്ലാഹു വിശുദ്ധ ഖുർആൻ ഒരു പ്രായോഗിക ജീവിത വഴികാട്ടിയായി ഇറക്കിയത്; ലോകത്തിന് കാരുണ്യമായി അയക്കപ്പെട്ട മുഹമ്മദ് നബി ﷺ അതിന്റെ ഏറ്റവും ഉത്തമ മാതൃക ജീവിച്ചു കാണിച്ചു! ഓർക്കണം കൂട്ടുകാരേ: നമ്മൾ ചെയ്യുന്ന ഓരോ ചെറിയ നന്മയും മുഹമ്മദ് നബി ﷺ പഠിപ്പിച്ച സത്യപാതയും സുന്നത്തും പിന്തുടരലാണ്. നമ്മെ ഏറെ സ്നേഹിക്കുകയും ഉമ്മത്തിനുവേണ്ടി എന്നും കരുണ ചൊരിയുകയും ചെയ്ത തിരുനബി ﷺ-യുടെ ഉത്തമ മാതൃക മുറുകെ പിടിച്ച് തിന്മകളിൽ നിന്ന് അകന്നുനിൽക്കലാണ് ഒരു യഥാർത്ഥ വിശ്വാസിയുടെ ജീവിതം!',
    highlights: [
      'വിശുദ്ധ ഖുർആൻ ജീവിച്ചു കാണിച്ച ഏറ്റവും ഉത്തമ മാതൃകയാണ് അന്ത്യപ്രവാചകൻ മുഹമ്മദ് നബി ﷺ',
      'നമ്മൾ ചെയ്യുന്ന ഓരോ നന്മയും തിരുനബി ﷺ പഠിപ്പിച്ച സത്യപാതയും സുന്നത്തും പിന്തുടരലാണ്',
      'നമ്മെ ഏറെ സ്നേഹിച്ച മുഹമ്മദ് നബി ﷺ-യുടെ കാരുണ്യത്തിന്റെ പാത പിന്തുടർന്ന് തിന്മയുടെ വഴികളിൽ നിന്ന് അകന്നുനിൽക്കാം',
    ],
    speech:
      'ഖുർആനും തിരുനബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലമയുടെ ഉത്തമ മാതൃകയും! മനുഷ്യൻ എങ്ങനെ സത്യസന്ധമായും കരുണയോടെയും ജീവിക്കണം എന്ന് ജീവിച്ചു കാണിച്ചുതന്നത് മുഹമ്മദ് നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലമാണ്. നമ്മൾ ചെയ്യുന്ന ഓരോ ചെറിയ നന്മയും തിരുനബി പഠിപ്പിച്ച സത്യപാതയും സുന്നത്തും പിന്തുടരലാണ്. തിന്മകളിൽ നിന്ന് അകന്നുനിന്ന് നമുക്ക് എപ്പോഴും ആ നല്ല മാതൃക പിൻപറ്റാം!',
    treasure: '❤️ പ്രധാന പാഠം: തിരുനബി ﷺ-യുടെ ഉത്തമ മാതൃക',
  },
  {
    id: 'p1',
    emoji: '🕌',
    era: 'അദ്ധ്യായം 3 · 1926 സമസ്തയുടെ പിറവിയും ഔദ്യോഗിക സ്ഥാപക ലക്ഷ്യങ്ങളും',
    title: 'അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിനായി 1926-ൽ പിറന്ന സമസ്ത!',
    story:
      '1926 ജൂൺ 26-ന് കോഴിക്കോട് ടൗൺ ഹാളിൽ വരക്കൽ മുല്ലക്കോയ തങ്ങളുടെയും പാങ്ങിൽ അഹ്മദ് കുട്ടി മുസ്‌ലിയാരുടെയും നേതൃത്വത്തിൽ സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ രൂപീകരിക്കപ്പെട്ടു (1934 നവംബർ 14-ന് ഔദ്യോഗികമായി രജിസ്റ്റർ ചെയ്തു). സമസ്തയുടെ ഔദ്യോഗിക ഭരണഘടനയിലെ അഞ്ച് സ്ഥാപക ലക്ഷ്യങ്ങൾ ഇവയാണ്: 1) അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ യഥാർത്ഥ വിശ്വാസവും അനുഷ്ഠാനങ്ങളും പ്രചരിപ്പിക്കുക. 2) അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന് വിരുദ്ധമായ പ്രചാരണങ്ങളെയും സംഘടനകളെയും നിയമാനുസൃതം പ്രതിരോധിക്കുകയും തടയുകയും ചെയ്യുക. 3) മുസ്‌ലിം സമുദായത്തിന്റെ മതപരവും സാമൂഹികവുമായ അവകാശങ്ങളും അധികാരങ്ങളും സംരക്ഷിക്കുക. 4) മതവിദ്യാഭ്യാസം (മദ്രസ-ദർസ്) പ്രോത്സാഹിപ്പിക്കുകയും പ്രചരിപ്പിക്കുകയും ചെയ്യുക — ഒപ്പം മതവിശ്വാസത്തിന് ഹാനികരമല്ലാത്ത ഭൗതിക വിദ്യാഭ്യാസത്തെ പ്രോത്സാഹിപ്പിക്കുക. 5) അന്ധവിശ്വാസങ്ങളും തെറ്റായ രീതികളും നീക്കി സമുദായത്തെ സന്മാർഗ്ഗത്തിലും സാമൂഹിക സൗഹാർദ്ദത്തിലും വളർത്തുക!',
    highlights: [
      '1 & 2. അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ യഥാർത്ഥ വിശ്വാസവും അനുഷ്ഠാനങ്ങളും പ്രചരിപ്പിക്കുകയും വിരുദ്ധ പ്രചാരണങ്ങളെ നിയമാനുസൃതം പ്രതിരോധിക്കുകയും ചെയ്യുക',
      '3 & 4. മുസ്‌ലിം സമുദായത്തിന്റെ മത-സാമൂഹിക അവകാശങ്ങൾ സംരക്ഷിക്കുകയും, മതവിദ്യാഭ്യാസത്തോടൊപ്പം വിശ്വാസത്തിന് ഹാനികരമല്ലാത്ത ഭൗതിക വിദ്യാഭ്യാസത്തെ പ്രോത്സാഹിപ്പിക്കുകയും ചെയ്യുക',
      '5. അന്ധവിശ്വാസങ്ങളും തെറ്റായ രീതികളും ഒഴിവാക്കി സന്മാർഗ്ഗവും സാമൂഹിക സൗഹാർദ്ദവും വളർത്തുക (1926 ജൂൺ 26 സ്ഥാപനം · 1934 രജിസ്ട്രേഷൻ)',
    ],
    speech:
      '1926 ജൂൺ 26-ന് വരക്കൽ മുല്ലക്കോയ തങ്ങളുടെയും പാങ്ങിൽ അഹ്മദ് കുട്ടി മുസ്‌ലിയാരുടെയും നേതൃത്വത്തിൽ സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ പിറന്നു. സമസ്തയുടെ അഞ്ച് ഔദ്യോഗിക സ്ഥാപക ലക്ഷ്യങ്ങൾ ഇവയാണ്: ഒന്ന്, അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ യഥാർത്ഥ വിശ്വാസവും അനുഷ്ഠാനങ്ങളും പ്രചരിപ്പിക്കുക. രണ്ട്, അതിന് വിരുദ്ധമായ പ്രചാരണങ്ങളെയും സംഘടനകളെയും നിയമാനുസൃതം തടയുക. മൂന്ന്, മുസ്‌ലിം സമുദായത്തിന്റെ അവകാശങ്ങളും അധികാരങ്ങളും സംരക്ഷിക്കുക. നാല്, മതവിദ്യാഭ്യാസം പ്രചരിപ്പിക്കുകയും മതവിശ്വാസത്തിന് ഹാനികരമല്ലാത്ത ഭൗതിക വിദ്യാഭ്യാസത്തെ പ്രോത്സാഹിപ്പിക്കുകയും ചെയ്യുക. അഞ്ച്, അന്ധവിശ്വാസങ്ങളും തെറ്റായ രീതികളും നീക്കി സന്മാർഗ്ഗവും സാമൂഹിക സൗഹാർദ്ദവും വളർത്തുക!',
    treasure: '🚩 പ്രധാന പാഠം: 1926 സമസ്തയുടെ 5 ഔദ്യോഗിക ലക്ഷ്യങ്ങൾ',
  },
  {
    id: 'p3',
    emoji: '🏫',
    era: 'അദ്ധ്യായം 4 · നമ്മൾ ആരാണ്? (1951 & 1989 SKSSF)',
    title: 'വിജ്ഞാനം · വിനയം · സേവനം — 14+ വിദ്യാർത്ഥികളുടെയും യുവാക്കളുടെയും ദൗത്യം!',
    story:
      '1951-ൽ വെറും 7 മദ്രസകളുമായി തുടങ്ങിയ സമസ്ത വിദ്യാഭ്യാസ ബോർഡ് ഇന്ന് 11,000-ലധികം മദ്രസകളായി വളർന്നു. ഈ പൈതൃകവും ആദർശവും പുതിയ തലമുറയിലേക്ക് പകരാനാണ് 1989 ഫെബ്രുവരി 19-ന് കോഴിക്കോട് വെച്ച് SKSSF (സമസ്ത കേരള സുന്നി സ്റ്റുഡന്റ്സ് ഫെഡറേഷൻ) പിറന്നത്! 14 വയസ്സ് മുതലുള്ള വിദ്യാർത്ഥികൾക്കും യുവാക്കൾക്കും 17 സബ് വിങ്ങുകളിലൂടെ വിദ്യാഭ്യാസം, കാരുണ്യ സേവനം, ആദർശ പ്രബോധനം, ക്യാമ്പസ് മുന്നേറ്റം, ഡിജിറ്റൽ മീഡിയ എന്നിവയിൽ സജീവമാകാനുള്ള കർമ്മവേദിയാണ് SKSSF!',
    highlights: [
      '1951 വിദ്യാഭ്യാസ ബോർഡ് (11,000+ മദ്രസകൾ) · 1989 SKSSF (14–40 പ്രായക്കാർ) · 1993 SKSBV ബാലവേദി',
      'വിഖായ, ട്രെൻഡ്, ഇബാദ്, ക്യാമ്പസ്, സഹചാരി ഉൾപ്പെടെ 17 സബ് വിങ്ങുകളും 8 ഇസ്‌ലാമിക് സെന്ററുകളും',
    ],
    speech:
      'നമ്മൾ ആരാണ്, നമ്മുടെ ദൗത്യങ്ങൾ എന്ത്? 1951-ൽ തുടങ്ങിയ വിദ്യാഭ്യാസ ബോർഡ് ഇന്ന് പതിനൊന്നായിരത്തിലധികം മദ്രസകളായി വളർന്നു. 1989-ൽ പിറന്ന എസ് കെ എസ് എസ് എഫ്, പതിനാല് വയസ്സു മുതലുള്ള വിദ്യാർത്ഥികൾക്കും യുവാക്കൾക്കും പതിനേഴ് സബ് വിങ്ങുകളിലൂടെ വിജ്ഞാനവും വിനയവും സേവനവും സമൂഹത്തിൽ എത്തിക്കാനുള്ള പ്രസ്ഥാനമാണ്!',
    treasure: '🛡️ പ്രധാന പാഠം: 17 കർമ്മ വിങ്ങുകളുടെ ശക്തി',
  },
  {
    id: 'p4',
    emoji: '🏆',
    era: 'അദ്ധ്യായം 5 · SKSSF ഗൈഡ് ഗെയിം ദൗത്യം!',
    title: 'ഇനി കളിച്ചുകൊണ്ട് യൂണിറ്റും ദൗത്യങ്ങളും പഠിക്കാം!',
    story:
      'ഈ ഗെയിമിലൂടെ നമ്മൾ വെറും ചരിത്രം വായിക്കുകയല്ല — യൂണിറ്റ്, ക്ലസ്റ്റർ & മേഖല, ജില്ല, സ്റ്റേറ്റ് & ഗ്ലോബൽ എന്നീ നാല് സംഘടനാ തലങ്ങളിലൂടെ നമ്മൾ ആരാണ്, ഒരു യൂണിറ്റും കമ്മിറ്റികളും എങ്ങനെ പ്രവർത്തിക്കണം, 17 സബ് വിങ്ങുകളുടെ ദൗത്യങ്ങൾ എന്തെല്ലാം, ഓൺലൈൻ കാലത്ത് എങ്ങനെ മാന്യമായി ഇടപെടണം എന്നിവയെല്ലാം കളിച്ചു പഠിച്ച് ഔദ്യോഗിക സാക്ഷ്യപത്രം നേടാൻ പോവുകയാണ്!',
    highlights: [
      'ഘട്ടം 1 (യൂണിറ്റ് തലം): സമസ്തയുടെ ചരിത്രവും ഔദ്യോഗിക പതാക നിർമ്മാണവും · ഘട്ടം 2 (ക്ലസ്റ്റർ & മേഖല): കമ്മിറ്റി ഘടനയും 17 സബ് വിങ്ങുകളും',
      'ഘട്ടം 3 (ജില്ലാ തലം): പ്രവാചക മാതൃകയും സംഘാടക ചുമതലകളും · ഘട്ടം 4 (സ്റ്റേറ്റ് & ഗ്ലോബൽ): പ്രതിസന്ധി നേരിടൽ, സൈബർ മര്യാദ & സാക്ഷ്യപത്രം',
    ],
    speech:
      'ഇനി നമ്മുടെ എസ് കെ എസ് എസ് എഫ് ഗൈഡ് ഗെയിം തുടങ്ങാം! യൂണിറ്റ് തലം മുതൽ സ്റ്റേറ്റ് ഗ്ലോബൽ തലം വരെയുള്ള നാല് ഘട്ടങ്ങളിലൂടെ ചരിത്രവും കമ്മിറ്റി രൂപീകരണവും പതിനേഴ് സബ് വിങ്ങുകളുടെ ദൗത്യങ്ങളും കളിച്ചു പഠിച്ച് നിങ്ങളുടെ പേരിലുള്ള സാക്ഷ്യപത്രം നേടാം!',
    treasure: '👑 അന്തിമ ലക്ഷ്യം: SKSSF ഗൈഡ് സാക്ഷ്യപത്രം',
  },
];

interface StoryPrologueProps {
  xp: number;
  badgesCount: number;
  initialMode?: 'curiosity' | 'story';
  initialLessonId?: string;
  devUnlocked?: boolean;
  onStartAdventure: () => void;
  onOpenStoryboard: () => void;
  onOpenBadgeStudio?: (presetBadgeId: string) => void;
  onOpenPovGame?: () => void;
  onAwardXp: (amount: number, actionId: string) => void;
  awardedActions?: Record<string, boolean>;
  onActiveLessonChange?: (lessonId: string) => void;
  onMarkLessonCompleted?: (lessonId: string) => void;
  completedLessonIds?: string[];
  quizAnswers: QuizAnswerMap;
  onQuizAnswered: (lessonId: string, selectedIdx: number, isCorrect: boolean) => void;
  collectedEggs?: string[];
  onClaimEasterEgg?: (egg: EasterEggItem) => void;
}

const BEAT_SAVED_ACTION_KEYS: Record<string, string[]> = {
  p0_creator: ['scene_game_p0_creator'],
  p0_prophet: ['scene_game_p0_prophet'],
  p1: ['hands_p1_paint', 'scene_game_p1'],
  p3: ['hands_p3_scratch_board', 'scene_game_p3'],
  p4: ['scene_game_p4'],
};

const PROLOGUE_FLAT_IDS = [
  'prologue_curiosity',
  'prologue_ch1',
  'prologue_ch2',
  'prologue_ch3',
  'prologue_ch4',
  'prologue_story',
] as const;

type PrologueFlatId = (typeof PROLOGUE_FLAT_IDS)[number];

const PROLOGUE_TRACK_ITEMS: { id: PrologueFlatId; lessonId: PrologueFlatId; emoji: string; label: string }[] = [
  { id: 'prologue_curiosity', lessonId: 'prologue_curiosity', emoji: '🚐', label: 'പ്രചാരണ വാഹനം' },
  { id: 'prologue_ch1', lessonId: 'prologue_ch1', emoji: '🌌', label: 'പ്രപഞ്ചവും സൃഷ്ടാവും' },
  { id: 'prologue_ch2', lessonId: 'prologue_ch2', emoji: '📖', label: 'ഖുർആനും നബി ﷺ' },
  { id: 'prologue_ch3', lessonId: 'prologue_ch3', emoji: '🕌', label: '1926 സമസ്ത' },
  { id: 'prologue_ch4', lessonId: 'prologue_ch4', emoji: '🏫', label: '1951 & 1989 SKSSF' },
  { id: 'prologue_story', lessonId: 'prologue_story', emoji: '🏆', label: 'SKSSF ദൗത്യം' },
];

function resolvePrologueLessonId(initialLessonId?: string, initialMode?: 'curiosity' | 'story'): PrologueFlatId {
  if (initialLessonId && (PROLOGUE_FLAT_IDS as readonly string[]).includes(initialLessonId)) {
    return initialLessonId as PrologueFlatId;
  }
  return initialMode === 'story' ? 'prologue_ch1' : 'prologue_curiosity';
}

export const StoryPrologueTheater: React.FC<StoryPrologueProps> = ({
  initialMode = 'curiosity',
  initialLessonId,
  devUnlocked = false,
  onOpenStoryboard,
  onOpenBadgeStudio,
  onAwardXp,
  awardedActions = {},
  onActiveLessonChange,
  onMarkLessonCompleted,
  completedLessonIds = [],
  quizAnswers,
  onQuizAnswered,
  collectedEggs = [],
  onClaimEasterEgg,
}) => {
  const [activeLessonId, setActiveLessonId] = useState<PrologueFlatId>(() =>
    resolvePrologueLessonId(initialLessonId, initialMode)
  );
  const [jeepCompleted, setJeepCompleted] = useState<boolean>(() =>
    Boolean(awardedActions.opening_jeep_ready || completedLessonIds.includes('prologue_curiosity'))
  );
  const [completedBeatGames, setCompletedBeatGames] = useState<string[]>(() =>
    PROLOGUE_BEATS.filter((b) =>
      (BEAT_SAVED_ACTION_KEYS[b.id] || []).some((k) => Boolean(awardedActions[k]))
    ).map((b) => b.id)
  );
  const [glitterKey, setGlitterKey] = useState(0);
  const [glitterMsg, setGlitterMsg] = useState('');

  useEffect(() => {
    setActiveLessonId(resolvePrologueLessonId(initialLessonId, initialMode));
  }, [initialLessonId, initialMode]);

  useEffect(() => {
    onActiveLessonChange?.(activeLessonId);
  }, [activeLessonId, onActiveLessonChange]);

  const activeIndex = PROLOGUE_FLAT_IDS.indexOf(activeLessonId);
  const isCuriosity = activeLessonId === 'prologue_curiosity';
  const beatIdx = Math.max(0, activeIndex - 1);
  const beat = PROLOGUE_BEATS[beatIdx] ?? PROLOGUE_BEATS[0];

  const currentLessonAlreadyDone = completedLessonIds.includes(activeLessonId);
  const currentQuizDone = Boolean(quizAnswers[activeLessonId]);
  const canAdvance = devUnlocked || currentLessonAlreadyDone || currentQuizDone;

  const currentBeatGameDone =
    currentLessonAlreadyDone ||
    completedBeatGames.includes(beat.id) ||
    (BEAT_SAVED_ACTION_KEYS[beat.id] || []).some((k) => Boolean(awardedActions[k]));

  useEffect(() => {
    if (currentQuizDone && !currentLessonAlreadyDone) {
      onMarkLessonCompleted?.(activeLessonId);
    }
  }, [activeLessonId, currentQuizDone, currentLessonAlreadyDone, onMarkLessonCompleted]);

  useEffect(() => {
    if (!isCuriosity) {
      narrator.speak(beat.speech, `${beat.emoji} ${beat.title}`);
    }
  }, [isCuriosity, beat.id, beat.speech, beat.emoji, beat.title]);

  const goToPrologueLesson = (nextId: PrologueFlatId) => {
    sound.unlockAudio();
    sound.playPop();
    const nextIdx = PROLOGUE_FLAT_IDS.indexOf(nextId);
    if (nextIdx === 5) {
      sound.playSeagull();
      sound.playShipCreak();
    } else if (nextIdx === 3 || nextIdx === 4) {
      sound.playWriting();
    }
    setActiveLessonId(nextId);
    if (nextIdx > 0) {
      onAwardXp(5, `prologue_beat_${nextIdx - 1}`);
      setGlitterMsg(`${PROLOGUE_BEATS[nextIdx - 1].treasure} (+5 XP)`);
      setGlitterKey((k) => k + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdvance = () => {
    onMarkLessonCompleted?.(activeLessonId);
    if (activeIndex < PROLOGUE_FLAT_IDS.length - 1) {
      goToPrologueLesson(PROLOGUE_FLAT_IDS[activeIndex + 1]);
    } else {
      onOpenStoryboard();
    }
  };

  const nextLessonTitle =
    activeIndex < PROLOGUE_FLAT_IDS.length - 1
      ? PROLOGUE_TRACK_ITEMS[activeIndex + 1].label
      : 'സാഹചര്യ ബോർഡ്';

  return (
    <section className="space-y-4">
      <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />

      {isCuriosity ? (
        <div className="space-y-4">
          {/* 1. GAME FIRST */}
          <AnnouncementVehicleActivity
            onComplete={() => {
              setJeepCompleted(true);
              window.setTimeout(() => scrollToActiveQuiz(), 850);
            }}
            onAwardXp={onAwardXp}
            onOpenBadgeStudio={onOpenBadgeStudio}
          />

          {/* 2. LESSON OPEN BY DEFAULT RIGHT AFTER GAME LAUNCHER */}
          <CollapsibleLessonDrawer
            key="prologue-lesson-curiosity"
            emoji="🚐"
            title="ദൗത്യ പരിചയം · പാഠം"
            badgeText="1/6"
            onSpeak={() =>
              narrator.speak(
                'എസ് കെ എസ് എസ് എഫ് പ്രചാരണ വാഹനവും നമ്മുടെ ദൗത്യവും! വിജ്ഞാനം, വിനയം, സേവനം എന്നതാണ് നമ്മുടെ പ്രസ്ഥാനത്തിന്റെ ആദർശം. സമ്മേളനങ്ങളും പഠനക്ലാസുകളും സേവന പ്രവർത്തനങ്ങളും നാട്ടിൽ എത്തിക്കാൻ നമുക്ക് ഒരുമിച്ച് പ്രവർത്തിക്കാം!',
                '🚐 പ്രചാരണ വാഹനവും ദൗത്യവും'
              )
            }
          >
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white p-4 sm:p-5 space-y-3 border border-emerald-400/50">
              <h3 className="text-base sm:text-lg font-extrabold text-amber-300">
                🚐 പ്രചാരണ വാഹനവും നമ്മുടെ ദൗത്യവും
              </h3>
              <p className="text-sm text-emerald-50 leading-relaxed">
                1926-ൽ സ്ഥാപിതമായ സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമയുടെ വിദ്യാർത്ഥി പ്രസ്ഥാനമാണ് 1989 ഫെബ്രുവരി 19-ന് പിറന്ന <strong>SKSSF</strong>. “വിജ്ഞാനം · വിനയം · സേവനം” എന്ന മുദ്രാവാക്യവുമായി നാട്ടിലെ മദ്രസകളിലും മഹല്ലുകളിലും ക്യാമ്പസുകളിലും നന്മയുടെ സന്ദേശം എത്തിക്കലാണ് നമ്മുടെ ദൗത്യം.
              </p>
              {onOpenBadgeStudio && (
                <button
                  type="button"
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playPop();
                    onOpenBadgeStudio(jeepCompleted ? 'jeep_starter' : 'starter_member');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>📷</span>
                  <span>ഫോട്ടോ ബാഡ്ജ്</span>
                </button>
              )}
            </div>
          </CollapsibleLessonDrawer>

          {/* 3. STORYLINE (COLLAPSED) + MANDATORY QUIZ (UNLOCKS AFTER LESSON) */}
          <LessonCheckQuiz
            key="prologue-quiz-curiosity"
            lessonId="prologue_curiosity"
            title="പാഠം 1 · ക്വിസ്"
            savedAnswer={quizAnswers.prologue_curiosity}
            onAnswered={(lid, idx, ok) => {
              onQuizAnswered(lid, idx, ok);
              onMarkLessonCompleted?.('prologue_curiosity');
            }}
            onNextLesson={handleAdvance}
            nextLessonLabel={`അടുത്ത പാഠം: ${nextLessonTitle}`}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. GAME FIRST */}
          <OptionalLessonMiniGame
            key={`prologue-game-${beat.id}`}
            lessonKey={beat.id as MiniGameLessonKey}
            onAwardXp={onAwardXp}
            isCompleted={currentBeatGameDone}
            onComplete={() => {
              setCompletedBeatGames((prev) =>
                prev.includes(beat.id) ? prev : [...prev, beat.id]
              );
            }}
          />

          {/* 2. LESSON OPEN BY DEFAULT RIGHT AFTER GAME LAUNCHER */}
          <CollapsibleLessonDrawer
            key={`prologue-lesson-${beat.id}`}
            emoji={beat.emoji}
            title={`പാഠം ${activeIndex + 1} · ${PROLOGUE_TRACK_ITEMS[activeIndex]?.label ?? ''}`}
            badgeText={`${activeIndex + 1}/${PROLOGUE_FLAT_IDS.length}`}
            onSpeak={() => narrator.speak(beat.speech, `${beat.emoji} ${beat.title}`)}
          >
            <div className="relative rounded-2xl overflow-hidden border border-emerald-300 bg-slate-950">
              <div className="px-3.5 py-2 bg-emerald-950 border-b border-white/15 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>{beat.era}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(beat.id === 'p0_creator' || beat.id === 'p0_prophet') && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.unlockAudio();
                        sound.playQuran('fatiha');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-extrabold hover:bg-emerald-600"
                    >
                      <BookOpen className="w-3 h-3" /> ഖുറാൻ
                    </button>
                  )}
                  {beat.id === 'p1' && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.unlockAudio();
                        sound.playAdhanFull();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-extrabold hover:bg-emerald-600"
                    >
                      🕌 ബാങ്ക്
                    </button>
                  )}
                </div>
              </div>

              <div className="relative h-56 sm:h-72 w-full overflow-hidden">
                {beat.id === 'p0_creator' && (
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-emerald-950">
                    <svg viewBox="0 0 800 320" className="w-full h-full object-cover" aria-hidden="true">
                      <defs>
                        <radialGradient id="cosmosGlow" cx="50%" cy="35%" r="55%">
                          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.35" />
                          <stop offset="60%" stopColor="#0F766E" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <rect width="800" height="320" fill="url(#cosmosGlow)" />
                      <ellipse cx="400" cy="135" rx="220" ry="62" fill="none" stroke="#FDE047" strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="6 6" />
                      <ellipse cx="400" cy="135" rx="140" ry="40" fill="none" stroke="#38BDF8" strokeOpacity="0.35" strokeWidth="1.5" />
                      <circle cx="400" cy="96" r="24" fill="#FACC15" opacity="0.92" />
                      <circle cx="230" cy="118" r="10" fill="#38BDF8" />
                      <circle cx="575" cy="145" r="12" fill="#34D399" />
                      <path d="M290 290 Q400 235 510 290 Z" fill="#065F46" />
                      <path d="M400 265 Q400 205 400 165" stroke="#4ADE80" strokeWidth="6" strokeLinecap="round" fill="none" />
                      <path d="M400 208 Q355 182 342 204 Q366 226 400 208 Z" fill="#22C55E" />
                      <path d="M400 192 Q448 164 462 188 Q436 212 400 192 Z" fill="#10B981" />
                      <circle cx="400" cy="158" r="12" fill="#FDE047" />
                    </svg>
                  </div>
                )}

                {beat.id === 'p0_prophet' && (
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 via-emerald-950 to-slate-950">
                    <svg viewBox="0 0 800 320" className="w-full h-full object-cover" aria-hidden="true">
                      <path d="M180 320 L180 120 Q400 10 620 120 L620 320 Z" fill="#064E3B" stroke="#FBBF24" strokeWidth="3" opacity="0.85" />
                      <path d="M225 320 L225 138 Q400 48 575 138 L575 320 Z" fill="#022C22" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="5 4" />
                      <line x1="400" y1="42" x2="400" y2="96" stroke="#FDE047" strokeWidth="2.5" />
                      <polygon points="384,96 416,96 422,126 378,126" fill="#F59E0B" stroke="#FEF08A" strokeWidth="2" />
                      <circle cx="400" cy="112" r="24" fill="#FDE047" opacity="0.22" />
                      <path d="M325 224 Q362 206 400 220 Q438 206 475 224 L465 258 Q432 246 400 256 Q368 246 335 258 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="3" />
                      <line x1="400" y1="220" x2="400" y2="256" stroke="#B45309" strokeWidth="2" />
                      <path d="M352 256 L422 292 M448 256 L378 292" stroke="#92400E" strokeWidth="8" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                {beat.id === 'p1' && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#4C0D23] via-[#7A1838] to-slate-950">
                    <svg viewBox="0 0 800 320" className="w-full h-full object-cover" aria-hidden="true">
                      <rect x="130" y="135" width="540" height="150" rx="10" fill="#2A0814" stroke="#FBBF24" strokeWidth="2.5" />
                      <path d="M295 135 Q400 50 505 135 Z" fill="#8C1D40" stroke="#FDE047" strokeWidth="2.5" />
                      <circle cx="400" cy="64" r="10" fill="#FDE047" />
                      {[185, 265, 345, 425, 505, 585].map((x) => (
                        <path key={x} d={`M${x} 285 L${x} 185 Q${x + 22} 160 ${x + 44} 185 L${x + 44} 285 Z`} fill="#FDE68A" opacity="0.22" stroke="#FBBF24" strokeWidth="1.5" />
                      ))}
                      <text x="400" y="122" textAnchor="middle" fill="#FEF08A" fontSize="18" fontWeight="800">
                        1926 · സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ
                      </text>
                    </svg>
                  </div>
                )}

                {beat.id === 'p3' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-900 via-emerald-900 to-teal-950 flex flex-col items-center justify-center px-6 pb-16">
                    <div className="relative z-20 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                      <div className="p-3 rounded-2xl bg-white/95 shadow-lg text-center">
                        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800">1951</p>
                        <p className="text-[11px] font-extrabold text-slate-700 mt-0.5">11,000+ മദ്രസകൾ</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-300 shadow-lg text-center">
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-950">1989</p>
                        <p className="text-[11px] font-extrabold text-slate-900 mt-0.5">SKSSF (17 വിങ്ങുകൾ)</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-sky-100 shadow-lg text-center">
                        <p className="text-2xl sm:text-3xl font-extrabold text-sky-900">1993</p>
                        <p className="text-[11px] font-extrabold text-sky-950 mt-0.5">SKSBV ബാലവേദി</p>
                      </div>
                    </div>
                  </div>
                )}

                {beat.id === 'p4' && (
                  <img
                    src="./src/assets/images/intro_heritage_harbor_1794947412830.jpg"
                    alt="SKSSF ഗൈഡ് ഗെയിം ചരിത്ര കപ്പലും നിധി പെട്ടിയും"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/20" />
                <DriftingCloudsAndSun />
                <FloatingSparkleField />
                {onClaimEasterEgg && (
                  <EasterEggSpot
                    eggId="egg_harbor_moon"
                    collected={collectedEggs.includes('egg_harbor_moon')}
                    onClaim={onClaimEasterEgg}
                    className="absolute top-4 right-4 z-30"
                  />
                )}
                <div className="hidden sm:flex absolute bottom-20 left-4 z-20 items-end gap-2">
                  <FlutteringFlagPole variant="skju" />
                </div>
                <div className="hidden sm:flex absolute bottom-20 right-4 z-20 items-end gap-2">
                  <FlutteringFlagPole variant="skssf" />
                </div>
                <SwayingGardenPlants className="bottom-8" />
                <AnimatedOceanLane boatLeft={`${18 + beatIdx * 16}%`} />
              </div>

              <motion.div
                key={beat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 bg-gradient-to-b from-slate-950 to-emerald-950 text-white space-y-3"
              >
                <h2 className="text-base sm:text-xl font-extrabold text-amber-300">
                  {beat.emoji} {beat.title}
                </h2>

                <p className="text-sm text-emerald-50 leading-relaxed font-medium">
                  {beat.story}
                </p>

                {beat.id === 'p0_prophet' && (
                  <div className="p-3.5 rounded-xl bg-amber-400/15 border border-amber-300/60 space-y-1">
                    <p className="text-xs font-extrabold text-amber-300">
                      ❤️ പ്രവാചക സ്നേഹ പാഠം
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                      “നമ്മൾ ചെയ്യുന്ന ഓരോ നന്മയും ലോകത്തിന് കാരുണ്യമായി അയക്കപ്പെട്ട മുഹമ്മദ് നബി ﷺ പഠിപ്പിച്ച ഉത്തമ മാതൃകയും സുന്നത്തും പിന്തുടരലാണ്. നമ്മെ ഏറെ സ്നേഹിച്ച തിരുനബി ﷺ കാണിച്ചുതന്ന സൽസ്വഭാവത്തിന്റെ പാത മുറുകെ പിടിച്ച് തിന്മകളിൽ നിന്ന് നാം എപ്പോഴും അകന്നുനിൽക്കണം.”
                    </p>
                  </div>
                )}

                <ul className="space-y-1.5 pt-2 border-t border-white/10">
                  {beat.highlights.map((item) => (
                    <li key={item} className="text-xs sm:text-sm text-amber-100 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-white/10 text-xs font-bold text-amber-200">
                  {beat.treasure}
                </div>
              </motion.div>
            </div>
          </CollapsibleLessonDrawer>

          {/* 3. STORYLINE (COLLAPSED) + MANDATORY QUIZ (UNLOCKS AFTER LESSON) */}
          <LessonCheckQuiz
            key={`prologue-quiz-${activeLessonId}`}
            lessonId={activeLessonId}
            title={`പാഠം ${activeIndex + 1} · ക്വിസ്`}
            savedAnswer={quizAnswers[activeLessonId]}
            onAnswered={(lid, idx, ok) => {
              onQuizAnswered(lid, idx, ok);
              onMarkLessonCompleted?.(activeLessonId);
            }}
            onNextLesson={handleAdvance}
            nextLessonLabel={`അടുത്ത പാഠം: ${nextLessonTitle}`}
          />
        </div>
      )}

      {/* 4. NAVIGATION BELOW EVERYTHING */}
      <LessonStepperNav
        stepLabel={`ആമുഖം · ${activeIndex + 1}/${PROLOGUE_FLAT_IDS.length}`}
        currentStep={activeIndex}
        totalSteps={PROLOGUE_FLAT_IDS.length}
        prevLabel={activeIndex > 0 ? PROLOGUE_TRACK_ITEMS[activeIndex - 1].label : undefined}
        onPrev={
          activeIndex > 0
            ? () => goToPrologueLesson(PROLOGUE_FLAT_IDS[activeIndex - 1])
            : undefined
        }
        nextLabel={nextLessonTitle}
        nextIsWorldAdvance={activeIndex === PROLOGUE_FLAT_IDS.length - 1}
        nextDisabled={!canAdvance}
        onNext={handleAdvance}
      />

      <LessonProgressTrack
        stageTitle="ആമുഖ ഘട്ടം · 6 പാഠങ്ങൾ"
        stageSubtitle="ഓരോ പാഠത്തിലും ഗെയിമും ക്വിസും പൂർത്തിയാക്കി മുന്നേറാം"
        items={PROLOGUE_TRACK_ITEMS}
        activeId={activeLessonId}
        completedLessonIds={completedLessonIds}
        devUnlocked={devUnlocked}
        onSelectCompleted={(id) => goToPrologueLesson(id as PrologueFlatId)}
      />
    </section>
  );
};

/* ============================================================================
 * VISUAL STORYBOARD ENGINE:
 *  AI Scene Image + Kid-Friendly Story Below + Pre-generated Male Narration
 *  -> User Choice at Bottom -> Next AI Image showing Pros & Cons!
 * ========================================================================== */

interface StoryOutcomeBranch {
  id: string;
  choiceLabel: string;
  choiceEmoji: string;
  isPositive: boolean;
  outcomeImage: string;
  outcomeImageAlt: string;
  outcomeTitle: string;
  outcomeStory: string;
  prosText: string;
  consText: string;
  outcomeSpeech: string;
}

interface StoryboardChapter {
  id: string;
  emoji: string;
  tag: string;
  title: string;
  sceneImage: string;
  sceneImageAlt: string;
  storyText: string;
  questionPrompt: string;
  sceneSpeech: string;
  branches: [StoryOutcomeBranch, StoryOutcomeBranch];
}

const STORYBOARD_CHAPTERS: StoryboardChapter[] = [
  {
    id: 'sb0_roots',
    emoji: '🌱',
    tag: 'കഥ 01 · സൃഷ്ടാവും പ്രവാചക മാർഗ്ഗവും & വഖഫ് പള്ളികളും',
    title: 'വഖഫ് പള്ളികളും നബി ﷺ വഴിയും: നമ്മൾ ആരുടെ കൂടെ നിൽക്കും?',
    sceneImage: './src/assets/images/story4_mosque_heritage_1794948791130.jpg',
    sceneImageAlt: 'ഖുർആൻ റഹലും മുളച്ചുവരുന്ന വിത്തും ആറ്റങ്ങളും പൈതൃക പള്ളിയും',
    storyText:
      'കൂട്ടുകാരേ, വിത്തും മഴയും സൂര്യനും നമ്മുടെ ഹൃദയമിടിപ്പുമെല്ലാം സൃഷ്ടിച്ച അല്ലാഹു, നമുക്ക് ശരിയായ വഴി ജീവിച്ചു കാണിക്കാൻ മുഹമ്മദ് നബി ﷺ-യെ അയച്ചു. നബി ﷺ നമുക്ക് ഖുർആനും ഹദീസും ശരിയായ രീതിയിൽ പഠിപ്പിച്ചു തന്നു; സ്വഹാബികൾ പോലും പ്രവാചകർ ﷺ പഠിപ്പിച്ചതനുസരിച്ചാണ് ഖുർആൻ മനസ്സിലാക്കിയതും വ്യാഖ്യാനിച്ചതും. ആ ശുദ്ധമായ അറിവ് തലമുറകളിലൂടെ നമ്മുടെ പണ്ഡിതന്മാർ നമുക്ക് പഠിപ്പിച്ചു തന്നു. എന്നാൽ പിന്നീട് ചിലർ ഈ പണ്ഡിത പരമ്പരയെ മാറ്റിനിർത്തി ഖുർആനും ഹദീസും സ്വന്തം തോന്നൽപോലെ വ്യാഖ്യാനിക്കാൻ തുടങ്ങി! അതിന്റെ ഫലമായി, നമ്മുടെ പൂർവികന്മാർ നാടിനായി വഖഫ് ചെയ്ത പള്ളികളിലെ മൗലിദും ഹദ്ദാദ് റാതീബും ദിക്ർ സദസ്സുകളും ആരാധനാ പാരമ്പര്യങ്ങളും നിർത്താൻ ചിലർ ശ്രമിക്കുന്നു.',
    questionPrompt: 'ഈ സമയത്ത് നമ്മുടെ നാട്ടിലെ വഖഫ് പള്ളിയുടെയും വിശ്വാസ പൈതൃകത്തിന്റെയും കാര്യത്തിൽ നിങ്ങൾ എന്ത് തീരുമാനിക്കും?',
    sceneSpeech:
      'വഖഫ് പള്ളികളും നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലമയുടെ വഴിയും, നമ്മൾ ആരുടെ കൂടെ നിൽക്കും? കൂട്ടുകാരേ, വിത്തും മഴയും സൂര്യനും ഹൃദയമിടിപ്പുമെല്ലാം സൃഷ്ടിച്ച അല്ലാഹു നമുക്ക് ശരിയായ വഴി ജീവിച്ചു കാണിക്കാൻ മുഹമ്മദ് നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലമയെ അയച്ചു. നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലം നമുക്ക് ഖുർആനും ഹദീസും ശരിയായ രീതിയിൽ പഠിപ്പിച്ചു തന്നു. സ്വഹാബികൾ പോലും പ്രവാചകർ പഠിപ്പിച്ചതനുസരിച്ചാണ് ഖുർആൻ വ്യാഖ്യാനിച്ചത്. ആ ശുദ്ധമായ അറിവ് തലമുറകളിലൂടെ നമ്മുടെ പണ്ഡിതന്മാർ നമുക്ക് പഠിപ്പിച്ചു തന്നു. എന്നാൽ പിന്നീട് ചിലർ ഈ പണ്ഡിത പരമ്പരയെ മാറ്റിനിർത്തി ഖുർആനും ഹദീസും തോന്നിയപോലെ വ്യാഖ്യാനിക്കാൻ തുടങ്ങി. അതിന്റെ ഫലമായി നമ്മുടെ പൂർവികന്മാർ വഖഫ് ചെയ്ത പള്ളികളിലെ മൗലിദും ഹദ്ദാദ് റാതീബും ദിക്ർ സദസ്സുകളും നിർത്താൻ ചിലർ ശ്രമിക്കുന്നു. ഈ സമയത്ത് നിങ്ങൾ എന്ത് തീരുമാനിക്കും?',
    branches: [
      {
        id: 'sb0_pros',
        choiceEmoji: '🕌',
        choiceLabel:
          'പണ്ഡിതന്മാരോടൊപ്പം നിന്ന് ശരിയായ വിശ്വാസവും വഖഫ് പള്ളികളും മൗലിദ്-റാതീബ്-ദിക്ർ പാരമ്പര്യവും സംരക്ഷിക്കുക',
        isPositive: true,
        outcomeImage: './src/assets/images/story4_pros_mosque_clean_1794948809302.jpg',
        outcomeImageAlt: 'പ്രകാശമാനമായി സംരക്ഷിക്കപ്പെട്ട കേരള പള്ളിയും പൂന്തോട്ടവും',
        outcomeTitle: 'ഗുണഫലം: ശരിയായ വിശ്വാസവും ആത്മീയ പൈതൃകവും പൂത്തുലയുന്നു!',
        outcomeStory:
          'മിടുക്കൻ! സത്യപണ്ഡിതന്മാരോടൊപ്പം ഉറച്ചുനിന്നപ്പോൾ ശരിയായ വിശ്വാസവും (അഖീദ) ആരാധനാ ചിട്ടകളും പൂർവ്വികർ നൽകിയ വഖഫ് പള്ളികളും സുരക്ഷിതമായി! അറബി ഖുതുബയും മൗലിദും ഹദ്ദാദ് റാതീബും ദിക്ർ സദസ്സുകളും ഉൾപ്പെടെയുള്ള നല്ല പാരമ്പര്യം എല്ലാവർക്കും സന്തോഷവും വെളിച്ചവുമായി തുടർന്നു.',
        prosText:
          'ഗുണം: ശരിയായ വിശ്വാസവും ആരാധനകളും വഖഫ് സ്വത്തുക്കളും സംരക്ഷിക്കപ്പെടുന്നു; പ്രവാചകരിൽ ﷺ നിന്ന് പണ്ഡിതന്മാർ വഴി കിട്ടിയ നല്ല പാരമ്പര്യം നിലനിൽക്കുന്നു.',
        consText:
          'ശ്രദ്ധിക്കേണ്ടത്: ആരുടെയും പ്രലോഭനങ്ങളിൽ വീഴാതെ സത്യത്തിൽ ഉറച്ചുനിൽക്കാൻ നമ്മൾ എപ്പോഴും ജാഗ്രത പാലിക്കണം.',
        outcomeSpeech:
          'ഗുണഫലം: ശരിയായ വിശ്വാസവും ആത്മീയ പൈതൃകവും പൂത്തുലയുന്നു! മിടുക്കൻ! സത്യപണ്ഡിതന്മാരോടൊപ്പം ഉറച്ചുനിന്നപ്പോൾ ശരിയായ വിശ്വാസവും ആരാധനാ ചിട്ടകളും പൂർവ്വികർ നൽകിയ വഖഫ് പള്ളികളും സുരക്ഷിതമായി! അറബി ഖുതുബയും മൗലിദും ഹദ്ദാദ് റാതീബും ദിക്ർ സദസ്സുകളും ഉൾപ്പെടെയുള്ള നല്ല പാരമ്പര്യം എല്ലാവർക്കും സന്തോഷവും വെളിച്ചവുമായി തുടർന്നു.',
      },
      {
        id: 'sb0_cons',
        choiceEmoji: '⚠️',
        choiceLabel:
          'പണത്തിന്റെയോ സ്വയം-വ്യാഖ്യാനത്തിന്റെയോ പേരിൽ പണ്ഡിത പാരമ്പര്യവും സദസ്സുകളും നിർത്തലാക്കുക',
        isPositive: false,
        outcomeImage: './src/assets/images/story4_cons_divide_1794948792657.jpg',
        outcomeImageAlt: 'വിളക്കുകൾ അണഞ്ഞ ഇരുണ്ട പൈതൃക അങ്കണം',
        outcomeTitle: 'ദോഷഫലം: വിശ്വാസ തെളിമയും മുൻഗാമികളുടെ അമാനത്തും നഷ്ടപ്പെടുന്നു!',
        outcomeStory:
          'സൂക്ഷിക്കണം കൂട്ടുകാരേ! പണ്ഡിതന്മാരെ അവഗണിച്ച് സ്വന്തമായി വ്യാഖ്യാനിക്കാനും വഖഫ് ലക്ഷ്യങ്ങൾ മാറ്റാനും അനുവദിച്ചാൽ, ആരാധനകളിലെ കൃത്യതയും പള്ളികളിലെ ദിക്റും മൗലിദും നിലയ്ക്കുകയും ആളുകൾക്കിടയിൽ വലിയ ഭിന്നതയും സങ്കടവും ഉണ്ടാകുകയും ചെയ്യും!',
        prosText: 'താൽക്കാലിക നേട്ടം: ചിലർക്ക് സ്വാർത്ഥപരമായ ചെറിയ ലാഭം മാത്രമേ കിട്ടൂ.',
        consText:
          'ദോഷം: അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ നല്ല വിശ്വാസവും പാരമ്പര്യവും നഷ്ടപ്പെടുന്നു; സമുദായത്തിൽ ഐക്യമില്ലാതാകുന്നു.',
        outcomeSpeech:
          'ദോഷഫലം: വിശ്വാസ തെളിമയും മുൻഗാമികളുടെ അമാനത്തും നഷ്ടപ്പെടുന്നു! സൂക്ഷിക്കണം കൂട്ടുകാരേ! പണ്ഡിതന്മാരെ അവഗണിച്ച് വഖഫ് ലക്ഷ്യങ്ങൾ മാറ്റാൻ അനുവദിച്ചാൽ, പള്ളികളിലെ ദിക്റും മൗലിദും നിലയ്ക്കുകയും ആളുകൾക്കിടയിൽ വലിയ ഭിന്നതയും സങ്കടവും ഉണ്ടാകുകയും ചെയ്യും!',
      },
    ],
  },
  {
    id: 'sb1',
    emoji: '🕌',
    tag: 'കഥ 02 · 1995 ടാഗോർ ഹാൾ ചരിത്രം',
    title: 'രണ്ടു വഴികളുടെ കവല: ശാന്തതയോ ദേഷ്യത്തിന്റെ വഴിയോ?',
    sceneImage: './src/assets/images/story1_crossroads_1794947415371.jpg',
    sceneImageAlt: 'തീരുമാനത്തിന്റെ രണ്ട് വഴികൾ കാണിക്കുന്ന കഥാ ചിത്രം',
    storyText:
      '1992-ന് ശേഷമുള്ള പ്രയാസമുള്ള കാലം! “നാട്ടിൽ പള്ളികൾ തകർക്കും, നമുക്ക് ദേഷ്യത്തോടെ തിരിച്ചടിക്കാം” എന്ന് ചിലർ യുവാക്കളെ വിളിക്കുന്നു. പക്ഷേ ശംസുൽ ഉലമ ഇ.കെ. അബൂബക്കർ മുസ്‌ലിയാർ (نَوَّرَ اللهُ مَرْقَدَهُ) 1995-ൽ കോഴിക്കോട് ടാഗോർ ഹാളിൽ സമാധാനത്തിന്റെയും അറിവിന്റെയും വഴിയാണ് നബി ﷺ പഠിപ്പിച്ചതെന്ന് ഓർമ്മിപ്പിച്ചു!',
    questionPrompt: 'ഒരു നല്ല വിദ്യാർത്ഥി എന്ന നിലയിൽ നിങ്ങൾ ഏത് വഴി തിരഞ്ഞെടുക്കും?',
    sceneSpeech:
      'രണ്ടു വഴികളുടെ കവല: ശാന്തതയോ ദേഷ്യത്തിന്റെ വഴിയോ? 1992-ന് ശേഷമുള്ള പ്രയാസമുള്ള കാലം! നാട്ടിൽ പള്ളികൾ തകർക്കും, നമുക്ക് ദേഷ്യത്തോടെ തിരിച്ചടിക്കാം എന്ന് ചിലർ യുവാക്കളെ വിളിക്കുന്നു. പക്ഷേ ശംസുൽ ഉലമ ഇ കെ അബൂബക്കർ മുസ്‌ലിയാർ നവ്വറള്ളാഹു മർഖദഹു 1995-ൽ കോഴിക്കോട് ടാഗോർ ഹാളിൽ സമാധാനത്തിന്റെയും അറിവിന്റെയും വഴിയാണ് നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലം പഠിപ്പിച്ചതെന്ന് ഓർമ്മിപ്പിച്ചു! ഒരു നല്ല വിദ്യാർത്ഥി എന്ന നിലയിൽ നിങ്ങൾ ഏത് വഴി തിരഞ്ഞെടുക്കും?',
    branches: [
      {
        id: 'sb1_pros',
        choiceEmoji: '🌿',
        choiceLabel: 'വിജ്ഞാനത്തിന്റെയും ജനാധിപത്യ സമാധാനത്തിന്റെയും പാത തിരഞ്ഞെടുക്കുക',
        isPositive: true,
        outcomeImage: './src/assets/images/story1_pros_peace_1794947415950.jpg',
        outcomeImageAlt: 'സമാധാനവും വളർച്ചയും കാണിക്കുന്ന അനന്തരഫല ചിത്രം',
        outcomeTitle: 'ഗുണഫലം: സ്നേഹവും അറിവും എങ്ങും വളരുന്നു!',
        outcomeStory:
          'സൂപ്പർ കൂട്ടുകാരേ! 1995 ടാഗോർ ഹാൾ പ്രഖ്യാപനവും 1999 വാദിനൂർ സമ്മേളനവും പോലെ സമാധാനവും പഠനവും തിരഞ്ഞെടുത്തപ്പോൾ, ഇബാദ്-ട്രെൻഡ്-വിഖായ വിങ്ങുകളിലൂടെ ലക്ഷക്കണക്കിന് കൂട്ടുകാർക്ക് വെളിച്ചം പകരാനും സമൂഹത്തിൽ സ്നേഹം വളർത്താനും കഴിഞ്ഞു.',
        prosText:
          'ഗുണം: മതസൗഹാർദ്ദവും വിശ്വാസവും വളരുന്നു; വിദ്യാഭ്യാസ സ്ഥാപനങ്ങളും സേവന വിങ്ങുകളും എല്ലാവർക്കും തണലാകുന്നു.',
        consText:
          'ശ്രദ്ധിക്കേണ്ടത്: ശാന്തമായ വഴിക്ക് ക്ഷമ വേണം; ഉടനടി കയ്യടിയില്ലെങ്കിലും ദീർഘകാലം നന്മ നിലനിൽക്കും.',
        outcomeSpeech:
          'ഗുണഫലം: സ്നേഹവും അറിവും എങ്ങും വളരുന്നു! സൂപ്പർ കൂട്ടുകാരേ! 1995 ടാഗോർ ഹാൾ പ്രഖ്യാപനവും 1999 വാദിനൂർ സമ്മേളനവും പോലെ സമാധാനവും പഠനവും തിരഞ്ഞെടുത്തപ്പോൾ, ഇബാദ്, ട്രെൻഡ്, വിഖായ വിങ്ങുകളിലൂടെ ലക്ഷക്കണക്കിന് കൂട്ടുകാർക്ക് വെളിച്ചം പകരാനും സമൂഹത്തിൽ സ്നേഹം വളർത്താനും കഴിഞ്ഞു.',
      },
      {
        id: 'sb1_cons',
        choiceEmoji: '⚡',
        choiceLabel: 'വൈകാരിക ആവേശത്തിൽപ്പെട്ട് പ്രകോപന-തീവ്രവാദ വഴിയിൽ ചേരുക',
        isPositive: false,
        outcomeImage: './src/assets/images/story1_cons_storm_1794947415821.jpg',
        outcomeImageAlt: 'കൊടുങ്കാറ്റും പാലം തകർച്ചയും കാണിക്കുന്ന ദോഷഫല ചിത്രം',
        outcomeTitle: 'ദോഷഫലം: വിശ്വാസവും ഐക്യവും തകരുന്നു!',
        outcomeStory:
          'നോക്കൂ, കൊടുങ്കാറ്റ് വന്നു! ദേഷ്യത്തിനും തീവ്രവാദ ചിന്തകൾക്കും പിന്നാലെ പോയവർ സമൂഹത്തിന്റെ സ്നേഹപ്പാലങ്ങൾ തകർക്കുകയും നിരപരാധികളായ ചെറുപ്പക്കാരുടെ ഭാവി നശിപ്പിക്കുകയും ചെയ്തു. ഈ തെറ്റായ വഴിയിൽ പോകരുതെന്ന് ശംസുൽ ഉലമ മുന്നറിയിപ്പ് നൽകിയിരുന്നു.',
        prosText: 'താൽക്കാലിക തോന്നൽ: തുടക്കത്തിൽ വലിയ ആവേശം തോന്നുമെങ്കിലും നല്ല ഫലമുണ്ടാകില്ല.',
        consText:
          'ദോഷം: സമാധാനം നഷ്ടപ്പെടുന്നു, യുവതലമുറ വഴിതെറ്റുന്നു, സമൂഹത്തിൽ ഭയമുണ്ടാകുന്നു.',
        outcomeSpeech:
          'ദോഷഫലം: വിശ്വാസവും ഐക്യവും തകരുന്നു! നോക്കൂ, കൊടുങ്കാറ്റ് വന്നു! ദേഷ്യത്തിനും തീവ്രവാദ ചിന്തകൾക്കും പിന്നാലെ പോയവർ സമൂഹത്തിന്റെ സ്നേഹപ്പാലങ്ങൾ തകർക്കുകയും നിരപരാധികളായ ചെറുപ്പക്കാരുടെ ഭാവി നശിപ്പിക്കുകയും ചെയ്തു.',
      },
    ],
  },
  {
    id: 'sb2',
    emoji: '🌙',
    tag: 'കഥ 03 · ഉമർ رَضِيَ اللَّهُ عَنْهُ & ഇഖ്‌ലാസ്',
    title: 'രാത്രിയിലെ മൺകുടം: അല്ലാഹു അറിയാനോ ആളുകൾ പുകഴ്ത്താനോ?',
    sceneImage: './src/assets/images/story2_oasis_night_1794947416911.jpg',
    sceneImageAlt: 'നക്ഷത്രരാത്രിയിൽ മരുപ്പച്ചയും കുടിവെള്ള കുടവും',
    storyText:
      'ചൂടുള്ള പകലിൽ നടന്ന് ക്ഷീണിച്ച യാത്രക്കാർക്ക് രാത്രിയിൽ ആരും കാണാതെ തണുത്ത കുടിവെള്ളം കൊണ്ടുകൊടുത്ത ഉമർ ബ്ൻ ഖത്താബ് رَضِيَ اللَّهُ عَنْهُ-ന്റെ മനോഹരമായ കഥ കേട്ടിട്ടുണ്ടോ? പിറ്റേന്ന് “രാത്രി വെള്ളം തന്ന ആ നല്ല മനുഷ്യനെക്കുറിച്ച് നാളെ ഖലീഫ ഉമറിനോട് പറയാം” എന്ന് യാത്രക്കാർ സംസാരിക്കുന്നു.',
    questionPrompt: 'നിങ്ങളാണ് ആ സഹായം ചെയ്തതെങ്കിൽ അപ്പോൾ എന്ത് ചെയ്യും?',
    sceneSpeech:
      'രാത്രിയിലെ മൺകുടം: അല്ലാഹു അറിയാനോ ആളുകൾ പുകഴ്ത്താനോ? ചൂടുള്ള പകലിൽ നടന്ന് ക്ഷീണിച്ച യാത്രക്കാർക്ക് രാത്രിയിൽ ആരും കാണാതെ തണുത്ത കുടിവെള്ളം കൊണ്ടുകൊടുത്ത ഉമർ ബ്ൻ ഖത്താബ് റളിയള്ളാഹു അൻഹുവിന്റെ മനോഹരമായ കഥ കേട്ടിട്ടുണ്ടോ? പിറ്റേന്ന് രാത്രി വെള്ളം തന്ന ആ നല്ല മനുഷ്യനെക്കുറിച്ച് നാളെ ഖലീഫ ഉമറിനോട് പറയാം എന്ന് യാത്രക്കാർ സംസാരിക്കുന്നു. നിങ്ങളാണ് ആ സഹായം ചെയ്തതെങ്കിൽ അപ്പോൾ എന്ത് ചെയ്യും?',
    branches: [
      {
        id: 'sb2_pros',
        choiceEmoji: '💧',
        choiceLabel: 'പേര് പറയാതെ ഇഖ്‌ലാസോടെ (അല്ലാഹുവിനായി മാത്രം) മടങ്ങിപ്പോകുക',
        isPositive: true,
        outcomeImage: './src/assets/images/story2_pros_blessing_1794947433790.jpg',
        outcomeImageAlt: 'അനുഗ്രഹീതമായ സ്വർണ്ണ നീരുറവയും ബറകത്തും കാണിക്കുന്ന ചിത്രം',
        outcomeTitle: 'ഗുണഫലം: അറ്റമില്ലാത്ത ബറകത്തിന്റെ നീരുറവ!',
        outcomeStory:
          'അടിപൊളി കൂട്ടുകാരേ! വലിയ പദവിയിൽ ഇരുന്നിട്ടും കയ്യടി ആഗ്രഹിക്കാതെ ഇഖ്‌ലാസ് (നിഷ്കളങ്കത) കാത്തുസൂക്ഷിച്ചപ്പോൾ ആ നന്മ അല്ലാഹുവിന്റെ വലിയ പ്രതിഫലവും ബറകത്തുമായി പ്രകാശിച്ചു!',
        prosText:
          'ഗുണം: പ്രവർത്തിയിൽ അല്ലാഹുവിന്റെ തൃപ്തിയും ബറകത്തും കിട്ടുന്നു; നല്ല കൂട്ടുകാർ ഒപ്പം ചേരുന്നു.',
        consText:
          'ശ്രദ്ധിക്കേണ്ടത്: ആരും കയ്യടിച്ചില്ലെങ്കിലും വിഷമിക്കാതെ മനസ്സിനെ എപ്പോഴും അല്ലാഹുവിനായി വെക്കണം.',
        outcomeSpeech:
          'ഗുണഫലം: അറ്റമില്ലാത്ത ബറകത്തിന്റെ നീരുറവ! അടിപൊളി കൂട്ടുകാരേ! വലിയ പദവിയിൽ ഇരുന്നിട്ടും കയ്യടി ആഗ്രഹിക്കാതെ ഇഖ്‌ലാസ് കാത്തുസൂക്ഷിച്ചപ്പോൾ ആ നന്മ അല്ലാഹുവിന്റെ വലിയ പ്രതിഫലവും ബറകത്തുമായി പ്രകാശിച്ചു!',
      },
      {
        id: 'sb2_cons',
        choiceEmoji: '📣',
        choiceLabel: '“ഞാനാണ് ഖലീഫ!” എന്ന് വിളിച്ച് സ്വന്തം പേരും പുകഴ്ചയും വാങ്ങുക',
        isPositive: false,
        outcomeImage: './src/assets/images/story2_cons_mirage_1794947434405.jpg',
        outcomeImageAlt: 'വരണ്ട മരുഭൂമിയും വീണുപോയ മൺകുടവും കാണിക്കുന്ന ചിത്രം',
        outcomeTitle: 'ദോഷഫലം: രിയാഅ് എന്ന മരീചികയിൽ നന്മ വറ്റിപ്പോകുന്നു!',
        outcomeStory:
          'സൂക്ഷിക്കുക കൂട്ടുകാരേ! ആളുകൾ കാണാനും പുകഴ്ത്താനും (രിയാഅ്) വേണ്ടി മാത്രം നന്മ ചെയ്താൽ, ആ നല്ല പ്രവൃത്തി മരുഭൂമിയിലെ ഒഴിഞ്ഞ കുടം പോലെ ഫലമില്ലാതായി പോകും.',
        prosText: 'താൽക്കാലിക ഗുണം: ആളുകളുടെ മുന്നിൽ അല്പനേരം കയ്യടി കിട്ടിയേക്കാം.',
        consText:
          'ദോഷം: ഇഖ്‌ലാസ് നശിക്കുന്നു; പദവി ഇല്ലാതാകുമ്പോൾ സഹായവും നിന്നുപോകുന്നു.',
        outcomeSpeech:
          'ദോഷഫലം: രിയാഅ് എന്ന മരീചികയിൽ നന്മ വറ്റിപ്പോകുന്നു! സൂക്ഷിക്കുക കൂട്ടുകാരേ! ആളുകൾ കാണാനും പുകഴ്ത്താനും വേണ്ടി മാത്രം നന്മ ചെയ്താൽ, ആ നല്ല പ്രവൃത്തി മരുഭൂമിയിലെ ഒഴിഞ്ഞ കുടം പോലെ ഫലമില്ലാതായി പോകും.',
      },
    ],
  },
  {
    id: 'sb3',
    emoji: '📱',
    tag: 'കഥ 04 · ഫോണിലെ സൈബർ കെണി',
    title: 'കളിയാക്കുന്ന വീഡിയോ കണ്ടപ്പോൾ: കമന്റ് യുദ്ധമോ ഡിജിറ്റൽ കവചമോ?',
    sceneImage: './src/assets/images/story3_cyber_crossroads_1794947434980.jpg',
    sceneImageAlt: 'രണ്ട് ഡിജിറ്റൽ സ്ക്രീനുകൾ കാണിക്കുന്ന കഥാ ചിത്രം',
    storyText:
      'നമ്മുടെ വിശ്വാസത്തെ കളിയാക്കുന്ന ഒരു ദേഷ്യം പിടിപ്പിക്കുന്ന വീഡിയോ ഫോണിൽ വരുന്നു! താഴെ ആളുകൾ ചീത്തവിളിച്ചും തർക്കിച്ചും കമന്റിടുന്നു. എന്നാൽ ഫോണിലെ അൽഗോരിതം നമ്മൾ ദേഷ്യപ്പെട്ട് കമന്റ് ഇടാൻ കാത്തിരിക്കുകയാണ്!',
    questionPrompt: 'സോഷ്യൽ മീഡിയ മര്യാദ അനുസരിച്ച് നിങ്ങൾ ഏത് ബട്ടൺ അമർത്തും?',
    sceneSpeech:
      'കളിയാക്കുന്ന വീഡിയോ കണ്ടപ്പോൾ: കമന്റ് യുദ്ധമോ ഡിജിറ്റൽ കവചമോ? നമ്മുടെ വിശ്വാസത്തെ കളിയാക്കുന്ന ഒരു ദേഷ്യം പിടിപ്പിക്കുന്ന വീഡിയോ ഫോണിൽ വരുന്നു! താഴെ ആളുകൾ ചീത്തവിളിച്ചും തർക്കിച്ചും കമന്റിടുന്നു. എന്നാൽ ഫോണിലെ അൽഗോരിതം നമ്മൾ ദേഷ്യപ്പെട്ട് കമന്റ് ഇടാൻ കാത്തിരിക്കുകയാണ്! സോഷ്യൽ മീഡിയ മര്യാദ അനുസരിച്ച് നിങ്ങൾ ഏത് ബട്ടൺ അമർത്തും?',
    branches: [
      {
        id: 'sb3_pros',
        choiceEmoji: '🛡️',
        choiceLabel: 'തർക്കിക്കാതെ “Do Not Recommend” നൽകി, നമ്മുടെ പേജിൽ നല്ല കാര്യങ്ങൾ പങ്കുവെക്കുക',
        isPositive: true,
        outcomeImage: './src/assets/images/story3_pros_shield_1794947434982.jpg',
        outcomeImageAlt: 'പ്രകാശമാനമായ പച്ച ക്രിസ്റ്റൽ ഷീൽഡും ജ്ഞാന പൂന്തോട്ടവും',
        outcomeTitle: 'ഗുണഫലം: ഡിജിറ്റൽ കവചവും നല്ല സന്ദേശങ്ങളും!',
        outcomeStory:
          'സൂപ്പർ! വേണ്ടാത്ത കാര്യങ്ങളിൽ നിന്ന് ഒഴിഞ്ഞുനിൽക്കുന്ന (തർക്കുൽ മാലായഅ്നി) വഴി തിരഞ്ഞെടുത്തപ്പോൾ ആ മോശം വീഡിയോയ്ക്ക് ആളുകൾ കുറഞ്ഞു; പകരം നിങ്ങളുടെ നല്ല വീഡിയോകൾ ഒരുപാട് പേർക്ക് അറിവ് നൽകി!',
        prosText:
          'ഗുണം: മോശം വീഡിയോകൾ പ്രചരിക്കുന്നത് നിൽക്കുന്നു; മനസ്സമാധാനവും നല്ല അറിവുകളും വളരുന്നു.',
        consText:
          'ശ്രദ്ധിക്കേണ്ടത്: നല്ല റീലുകളും ചിത്രങ്ങളും ഉണ്ടാക്കാൻ അല്പം പഠനവും കഴിവും വളർത്തണം.',
        outcomeSpeech:
          'ഗുണഫലം: ഡിജിറ്റൽ കവചവും നല്ല സന്ദേശങ്ങളും! സൂപ്പർ! വേണ്ടാത്ത കാര്യങ്ങളിൽ നിന്ന് ഒഴിഞ്ഞുനിൽക്കുന്ന തർക്കുൽ മാലായഅ്നി വഴി തിരഞ്ഞെടുത്തപ്പോൾ ആ മോശം വീഡിയോയ്ക്ക് ആളുകൾ കുറഞ്ഞു; പകരം നിങ്ങളുടെ നല്ല വീഡിയോകൾ ഒരുപാട് പേർക്ക് അറിവ് നൽകി!',
      },
      {
        id: 'sb3_cons',
        choiceEmoji: '🌪️',
        choiceLabel: 'കമന്റ് ബോക്സിൽ കയറി ദേഷ്യത്തോടെ വഴക്കും തർക്കവും തുടങ്ങുക',
        isPositive: false,
        outcomeImage: './src/assets/images/story3_cons_whirlpool_1794947435150.jpg',
        outcomeImageAlt: 'ഇരുണ്ട ചുഴലിക്കാറ്റും തർക്ക കെണിയും കാണിക്കുന്ന ചിത്രം',
        outcomeTitle: 'ദോഷഫലം: അൽഗോരിതം ചുഴലിക്കാറ്റിൽ കുടുങ്ങി!',
        outcomeStory:
          'കണ്ടോ കൂട്ടുകാരേ! നമ്മൾ ഓരോ തവണ ദേഷ്യപ്പെട്ട് കമന്റ് ഇട്ടപ്പോഴും കമ്പ്യൂട്ടർ ആ മോശം വീഡിയോ കൂടുതൽ ആളുകൾക്ക് കാണിച്ചുകൊടുത്തു! വെറുതെ നമ്മുടെ സമയവും മനസ്സമാധാനവും പോയി.',
        prosText: 'താൽക്കാലിക തോന്നൽ: ദേഷ്യം തീർത്തു എന്നൊരു ചെറിയ തോന്നൽ മാത്രമേ ഉണ്ടാകൂ.',
        consText:
          'ദോഷം: തെറ്റായ വീഡിയോയ്ക്ക് സൗജന്യ പ്രചാരം കിട്ടുന്നു; സമയവും സ്വഭാവവും നഷ്ടപ്പെടുന്നു.',
        outcomeSpeech:
          'ദോഷഫലം: അൽഗോരിതം ചുഴലിക്കാറ്റിൽ കുടുങ്ങി! കണ്ടോ കൂട്ടുകാരേ! നമ്മൾ ഓരോ തവണ ദേഷ്യപ്പെട്ട് കമന്റ് ഇട്ടപ്പോഴും കമ്പ്യൂട്ടർ ആ മോശം വീഡിയോ കൂടുതൽ ആളുകൾക്ക് കാണിച്ചുകൊടുത്തു! വെറുതെ നമ്മുടെ സമയവും മനസ്സമാധാനവും പോയി.',
      },
    ],
  },
];

interface VisualStoryboardArenaProps {
  initialTab?: string;
  devUnlocked?: boolean;
  onAwardXp: (amount: number, actionId: string) => void;
  onUnlockBadge: (badge: string) => void;
  onGoToMission1: () => void;
  onActiveLessonChange?: (lessonId: string) => void;
  onMarkLessonCompleted?: (lessonId: string) => void;
  completedLessonIds?: string[];
  quizAnswers: QuizAnswerMap;
  onQuizAnswered: (lessonId: string, selectedIdx: number, isCorrect: boolean) => void;
  collectedEggs?: string[];
  onClaimEasterEgg?: (egg: EasterEggItem) => void;
}

export const VisualStoryboardArena: React.FC<VisualStoryboardArenaProps> = ({
  initialTab,
  devUnlocked = false,
  onAwardXp,
  onUnlockBadge,
  onGoToMission1,
  onActiveLessonChange,
  onMarkLessonCompleted,
  completedLessonIds = [],
  quizAnswers,
  onQuizAnswered,
  collectedEggs = [],
  onClaimEasterEgg,
}) => {
  const resolveInitialIdx = (tab?: string) => {
    if (!tab) return 0;
    const found = STORYBOARD_CHAPTERS.findIndex((c) => c.id === tab);
    return found >= 0 ? found : 0;
  };

  const [chapterIdx, setChapterIdx] = useState(() => resolveInitialIdx(initialTab));
  const [pickedBranchId, setPickedBranchId] = useState<string | null>(null);
  const [visitedBranches, setVisitedBranches] = useState<string[]>([]);
  const [completedSbGames, setCompletedSbGames] = useState<string[]>([]);
  const [glitterKey, setGlitterKey] = useState(0);
  const [glitterMsg, setGlitterMsg] = useState('');

  const sbGameKeys: MiniGameLessonKey[] = ['sb_ch1', 'sb_ch2', 'sb_ch3', 'storyboard'];
  const sbQuizIds = ['storyboard_ch1', 'storyboard_ch2', 'storyboard_ch3', 'storyboard'];

  useEffect(() => {
    if (initialTab) {
      const idx = resolveInitialIdx(initialTab);
      setChapterIdx(idx);
      setPickedBranchId(null);
    }
  }, [initialTab]);

  const chapter = STORYBOARD_CHAPTERS[chapterIdx];
  const activeSbGameKey = sbGameKeys[chapterIdx] ?? 'storyboard';
  const activeSbQuizId = sbQuizIds[chapterIdx] ?? 'storyboard';
  const activeBranch =
    chapter.branches.find((b) => b.id === pickedBranchId) || null;
  const currentChapterQuizDone = Boolean(quizAnswers[activeSbQuizId]);
  const currentChapterCompleted =
    completedLessonIds.includes(activeSbQuizId) || completedLessonIds.includes('storyboard');
  const isLastChapter = chapterIdx === STORYBOARD_CHAPTERS.length - 1;
  const currentSbGameDone =
    currentChapterCompleted || completedSbGames.includes(activeSbGameKey);
  const canAdvanceCurrentChapter =
    devUnlocked || currentChapterCompleted || currentChapterQuizDone;

  useEffect(() => {
    onActiveLessonChange?.(activeSbQuizId);
  }, [activeSbQuizId, onActiveLessonChange]);

  useEffect(() => {
    if (currentChapterQuizDone && !completedLessonIds.includes(activeSbQuizId)) {
      onMarkLessonCompleted?.(activeSbQuizId);
    }
  }, [activeSbQuizId, currentChapterQuizDone, completedLessonIds, onMarkLessonCompleted]);

  useEffect(() => {
    if (activeBranch) {
      narrator.speak(activeBranch.outcomeSpeech, activeBranch.outcomeTitle);
    } else {
      narrator.speak(chapter.sceneSpeech, `${chapter.emoji} ${chapter.title}`);
    }
  }, [chapterIdx, pickedBranchId, chapter, activeBranch]);

  const handleSelectChapter = (idx: number) => {
    sound.unlockAudio();
    sound.playClick();
    if (STORYBOARD_CHAPTERS[idx]?.id === 'sb0_roots') {
      sound.playAdhan();
    } else {
      sound.playWriting();
    }
    setChapterIdx(idx);
    setPickedBranchId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePickChoice = (branch: StoryOutcomeBranch) => {
    sound.unlockAudio();
    setPickedBranchId(branch.id);
    if (!visitedBranches.includes(branch.id)) {
      const nextVisited = [...visitedBranches, branch.id];
      setVisitedBranches(nextVisited);
      onAwardXp(branch.isPositive ? 30 : 15, `storyboard_${branch.id}`);
      if (nextVisited.length >= 4) {
        onUnlockBadge('SKSSF ചരിത്ര പഠിതാവ്');
      }
    }
    if (branch.isPositive) {
      sound.playSuccess();
      setGlitterMsg('✨ നന്മയുടെ പാത തിരഞ്ഞെടുത്തു! +30 XP');
      setGlitterKey((k) => k + 1);
    } else {
      sound.playError();
    }
  };

  const handleAdvanceStoryboard = () => {
    onMarkLessonCompleted?.(activeSbQuizId);
    if (!isLastChapter) {
      handleSelectChapter(chapterIdx + 1);
    } else {
      sound.playUnlock();
      onMarkLessonCompleted?.('storyboard');
      onGoToMission1();
    }
  };

  const oppositeBranch = activeBranch
    ? chapter.branches.find((b) => b.id !== activeBranch.id) || null
    : null;

  const nextSbLabel = !isLastChapter
    ? STORYBOARD_CHAPTERS[chapterIdx + 1].title
    : '🧭 എന്റെ SKSSF യാത്ര';

  return (
    <section className="space-y-4">
      {/* 1. GAME FIRST */}
      <OptionalLessonMiniGame
        key={`sb-game-${activeSbGameKey}`}
        lessonKey={activeSbGameKey}
        onAwardXp={onAwardXp}
        isCompleted={currentSbGameDone}
        onComplete={() =>
          setCompletedSbGames((prev) =>
            prev.includes(activeSbGameKey) ? prev : [...prev, activeSbGameKey]
          )
        }
      />

      {/* 2. LESSON OPEN BY DEFAULT RIGHT AFTER GAME LAUNCHER */}
      <CollapsibleLessonDrawer
        key={`sb-lesson-${chapter.id}`}
        emoji={chapter.emoji}
        title={`കഥ ${chapterIdx + 1} · പാഠം & തീരുമാനം`}
        badgeText={`${chapterIdx + 1}/${STORYBOARD_CHAPTERS.length}`}
        onSpeak={() =>
          narrator.speak(
            activeBranch ? activeBranch.outcomeSpeech : chapter.sceneSpeech,
            activeBranch ? activeBranch.outcomeTitle : chapter.title
          )
        }
      >
        <AnimatePresence mode="wait">
          {!activeBranch ? (
            <motion.div
              key={`scene-${chapter.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-white rounded-2xl border border-emerald-200 overflow-hidden"
            >
              <div className="relative h-56 sm:h-80 w-full bg-slate-950 overflow-hidden">
                <img
                  src={chapter.sceneImage}
                  alt={chapter.sceneImageAlt}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <FloatingSparkleField />
                <SwayingGardenPlants />
                {onClaimEasterEgg && (
                  <EasterEggSpot
                    eggId="egg_story_lantern"
                    collected={collectedEggs.includes('egg_story_lantern')}
                    onClaim={onClaimEasterEgg}
                    className="absolute top-3 left-3 z-30"
                  />
                )}
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-extrabold text-emerald-700">{chapter.tag}</p>
                  <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
                    {chapter.emoji} {chapter.title}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {chapter.storyText}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{chapter.questionPrompt}</span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {chapter.branches.map((branch) => (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => handlePickChoice(branch)}
                        className="p-3.5 rounded-2xl border-2 border-b-4 border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-600 text-left transition-all flex items-start gap-2.5"
                      >
                        <span className="text-xl leading-none shrink-0 mt-0.5">
                          {branch.choiceEmoji}
                        </span>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                          {branch.choiceLabel}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`outcome-${activeBranch.id}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden ${
                activeBranch.isPositive ? 'border-emerald-500' : 'border-red-400'
              }`}
            >
              <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />

              <div className="relative h-56 sm:h-80 w-full bg-slate-950 overflow-hidden">
                <img
                  src={activeBranch.outcomeImage}
                  alt={activeBranch.outcomeImageAlt}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {activeBranch.isPositive && <FloatingSparkleField />}
                <SwayingGardenPlants />
              </div>

              <div className="p-4 sm:p-5 space-y-3.5">
                <div>
                  <h3
                    className={`text-base sm:text-xl font-extrabold ${
                      activeBranch.isPositive ? 'text-emerald-900' : 'text-red-900'
                    }`}
                  >
                    {activeBranch.choiceEmoji} {activeBranch.outcomeTitle}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed mt-1.5">
                    {activeBranch.outcomeStory}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <p className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ഗുണവശം
                    </p>
                    <p className="text-xs text-emerald-950 leading-relaxed">
                      {activeBranch.prosText}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                    <p className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      ശ്രദ്ധിക്കേണ്ടത്
                    </p>
                    <p className="text-xs text-amber-950 leading-relaxed">
                      {activeBranch.consText}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setPickedBranchId(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold hover:bg-slate-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> തിരികെ
                  </button>

                  {oppositeBranch && (
                    <button
                      type="button"
                      onClick={() => handlePickChoice(oppositeBranch)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 text-xs font-extrabold hover:bg-amber-200"
                    >
                      🔄 മറ്റേ തീരുമാനം കാണൂ
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleLessonDrawer>

      {/* 3. STORYLINE (COLLAPSED) + MANDATORY QUIZ (UNLOCKS AFTER LESSON) */}
      <LessonCheckQuiz
        key={`sb-quiz-${activeSbQuizId}`}
        lessonId={activeSbQuizId}
        title={`കഥ ${chapterIdx + 1} · ക്വിസ്`}
        savedAnswer={quizAnswers[activeSbQuizId]}
        onAnswered={(lid, idx, ok) => {
          onQuizAnswered(lid, idx, ok);
          onMarkLessonCompleted?.(activeSbQuizId);
        }}
        onNextLesson={handleAdvanceStoryboard}
        nextLessonLabel={!isLastChapter ? 'അടുത്ത പാഠം' : 'എന്റെ SKSSF യാത്ര'}
      />

      {/* 4. NAVIGATION BELOW EVERYTHING */}
      <LessonStepperNav
        stepLabel={`സാഹചര്യ ബോർഡ് · ${chapterIdx + 1}/${STORYBOARD_CHAPTERS.length}`}
        currentStep={chapterIdx}
        totalSteps={STORYBOARD_CHAPTERS.length}
        prevLabel={
          chapterIdx > 0 ? STORYBOARD_CHAPTERS[chapterIdx - 1].title : undefined
        }
        onPrev={chapterIdx > 0 ? () => handleSelectChapter(chapterIdx - 1) : undefined}
        nextLabel={nextSbLabel}
        nextIsWorldAdvance={isLastChapter}
        nextDisabled={!canAdvanceCurrentChapter}
        onNext={handleAdvanceStoryboard}
      />

      <LessonProgressTrack
        stageTitle="📖 സാഹചര്യ ബോർഡ് · 4 പാഠങ്ങൾ"
        stageSubtitle="ഓരോ കഥയിലും ഗെയിമും ക്വിസും പൂർത്തിയാക്കി മുന്നേറാം"
        items={[
          { id: 'sb0_roots', lessonId: 'storyboard_ch1', emoji: '🕌', label: 'വഖഫ് & പണ്ഡിത പാരമ്പര്യം' },
          { id: 'sb1', lessonId: 'storyboard_ch2', emoji: '🌿', label: '1995 ടാഗോർ ഹാൾ & TREND' },
          { id: 'sb2', lessonId: 'storyboard_ch3', emoji: '🌙', label: 'ഇഖ്‌ലാസ് & സഹചാരി' },
          { id: 'sb3', lessonId: 'storyboard', emoji: '📱', label: 'സൈബർ മര്യാദ & സൈകോൺ' },
        ]}
        activeId={chapter.id}
        completedLessonIds={completedLessonIds}
        devUnlocked={devUnlocked}
        onSelectCompleted={(id) => {
          const nextIdx = STORYBOARD_CHAPTERS.findIndex((c) => c.id === id);
          if (nextIdx >= 0) handleSelectChapter(nextIdx);
        }}
      />
    </section>
  );
};
