import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Eraser,
  Flame,
  RotateCcw,
  Users,
  Volume2,
} from 'lucide-react';
import {
  AI_WORKFLOW_CORRECT,
  MINUTES_ORDER_CORRECT,
  PRESS_RELEASE_ORDER_CORRECT,
  UNIT_STEPS,
} from '../data/level3Data';
import {
  CollapsibleLessonDrawer,
  DriftingCloudsAndSun,
  EasterEggItem,
  EasterEggSpot,
  FloatingSparkleField,
  GlitterBurstOverlay,
  LessonProgressTrack,
  LessonStepperNav,
  SwayingGardenPlants,
} from './GameEffects';
import { LessonCheckQuiz, scrollToActiveQuiz } from './LessonCheckQuiz';
import { GameFullscreenShell } from './GameFullscreenShell';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import { MiniGameLessonKey, OptionalLessonMiniGame } from './OptionalLessonMiniGames';
import { QuizAnswerMap } from '../utils/gameStorage';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import worldSkyRainbowImg from '../assets/images/world_sky_rainbow_1794953897546.jpg';
import worldNewsroomDeskImg from '../assets/images/world_newsroom_desk_1794953899783.jpg';

export type L3Tab = 'sky_catcher' | 'scrolls' | 'mind_chain' | 'unit_desks' | 'newsroom';

interface Level3OrganizerProps {
  isCompleted: boolean;
  onAwardXp: (amount: number, actionId: string) => void;
  onUnlockBadge: (badge: string) => void;
  onCompleteLevel: () => void;
  collectedEggs?: string[];
  onClaimEasterEgg?: (egg: EasterEggItem) => void;
  initialTab?: L3Tab;
  onActiveLessonChange?: (lessonId: string) => void;
  onMarkLessonCompleted?: (lessonId: string) => void;
  completedLessonIds?: string[];
  quizAnswers: QuizAnswerMap;
  onQuizAnswered: (lessonId: string, selectedIdx: number, isCorrect: boolean) => void;
  devUnlocked?: boolean;
}

interface SkyBubble {
  id: string;
  emoji: string;
  label: string;
  arabic?: string;
  target: 'shield' | 'trap';
  x: string;
  y: string;
  insight: string;
  speech: string;
}

const SKY_BUBBLES: SkyBubble[] = [
  {
    id: 'v1',
    emoji: '💧',
    label: 'നിയ്യത്ത് & ഇഖ്‌ലാസ്',
    arabic: 'نِيَّة · إِخْلَاص',
    target: 'shield',
    x: '20%',
    y: '22%',
    insight:
      'രാത്രി കുടിവെള്ളമെത്തിച്ച ഉമർ رَضِيَ اللَّهُ عَنْهُ പോലെ, ആരും കാണാതെയും അല്ലാഹുവിന് വേണ്ടി നന്മ ചെയ്യണം!',
    speech:
      'രാത്രി കുടിവെള്ളമെത്തിച്ച ഉമർ റളിയള്ളാഹു അൻഹുവിനെ പോലെ, ആരും കാണാതെയും അല്ലാഹുവിന് വേണ്ടി നന്മ ചെയ്യണം!',
  },
  {
    id: 'v2',
    emoji: '🎭',
    label: 'രിയാഅ് & അഹങ്കാരം',
    arabic: 'رِيَاء · اِسْتِكْبَار',
    target: 'trap',
    x: '50%',
    y: '18%',
    insight:
      'പൊങ്ങച്ചവും അഹങ്കാരവും (ഇബ്‌ലീസ് ചെയ്തതുപോലെ) നല്ല കാര്യങ്ങളുടെ പുണ്യം ഇല്ലാതാക്കും!',
    speech:
      'പൊങ്ങച്ചവും അഹങ്കാരവും ഇബ്‌ലീസ് ചെയ്തതുപോലെ നല്ല കാര്യങ്ങളുടെ പുണ്യം ഇല്ലാതാക്കും!',
  },
  {
    id: 'v3',
    emoji: '❤️',
    label: 'റഹ്‌മത്ത് & സ്നേഹം',
    arabic: 'رَحْمَة',
    target: 'shield',
    x: '80%',
    y: '22%',
    insight:
      'നല്ല സ്വഭാവത്തിൽ ഒന്നാമത്തേത് സ്നേഹമാണ്! നമുക്കായി കാത്തുനിൽക്കുന്ന നബി ﷺ-യുടെ കാരുണ്യം മനസ്സിൽ വെക്കാം.',
    speech:
      'നല്ല സ്വഭാവത്തിൽ ഒന്നാമത്തേത് സ്നേഹമാണ്! നമുക്കായി കാത്തുനിൽക്കുന്ന നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലമയുടെ കാരുണ്യം മനസ്സിൽ വെക്കാം.',
  },
  {
    id: 'v4',
    emoji: '😠',
    label: 'ദേഷ്യവും കളിയാക്കലും',
    arabic: 'اِسْتِهْزَاء',
    target: 'trap',
    x: '20%',
    y: '50%',
    insight:
      'ഏറ്റവും മോശം സ്വഭാവമാണ് ദേഷ്യം! കൂട്ടുകാരെ കളിയാക്കുന്നതും ട്രോളുന്നതും നല്ല മര്യാദയല്ല.',
    speech:
      'ഏറ്റവും മോശം സ്വഭാവമാണ് ദേഷ്യം! കൂട്ടുകാരെ കളിയാക്കുന്നതും ട്രോളുന്നതും നല്ല മര്യാദയല്ല.',
  },
  {
    id: 'v5',
    emoji: '🍎',
    label: 'പ്രഭാതഭക്ഷണം & ആരോഗ്യം',
    arabic: 'رُبُوبِيَّة · قُوَّة',
    target: 'shield',
    x: '50%',
    y: '46%',
    insight:
      'രാവിലെ നല്ല ഭക്ഷണം കഴിച്ചിട്ടേ പുറത്തിറങ്ങാവൂ! ശരീരത്തിന് കരുത്തുണ്ടെങ്കിലേ നന്നായി പഠിക്കാൻ പറ്റൂ.',
    speech:
      'രാവിലെ നല്ല ഭക്ഷണം കഴിച്ചിട്ടേ പുറത്തിറങ്ങാവൂ! ശരീരത്തിന് കരുത്തുണ്ടെങ്കിലേ നന്നായി പഠിക്കാൻ പറ്റൂ.',
  },
  {
    id: 'v6',
    emoji: '⚠️',
    label: 'വഴിതെറ്റിക്കുന്ന ചിന്തകൾ',
    arabic: 'الأَئِمَّةُ الْمُضِلُّونَ',
    target: 'trap',
    x: '80%',
    y: '50%',
    insight:
      'തെറ്റായ ചിന്തകളിലേക്കും വിശ്വാസക്കേടിലേക്കും നയിക്കുന്ന കെണികളിൽ നിന്ന് അകന്നുനിൽക്കണം!',
    speech:
      'തെറ്റായ ചിന്തകളിലേക്കും വിശ്വാസക്കേടിലേക്കും നയിക്കുന്ന കെണികളിൽ നിന്ന് അകന്നുനിൽക്കണം!',
  },
  {
    id: 'v7',
    emoji: '🤝',
    label: 'ഖിദ്മത്ത് & അനുസരണം',
    arabic: 'خِدْمَة · اِسْتِسْلَام',
    target: 'shield',
    x: '30%',
    y: '74%',
    insight:
      'മറ്റുള്ളവരെ സഹായിക്കുന്നവരാണ് നല്ല നേതൃത്വം! നല്ല വിദ്യാർത്ഥികൾ എപ്പോഴും ഉമ്മ-ഉപ്പയെയും ഉസ്താദുമാരെയും അനുസരിക്കും.',
    speech:
      'മറ്റുള്ളവരെ സഹായിക്കുന്നവരാണ് നല്ല നേതൃത്വം! നല്ല വിദ്യാർത്ഥികൾ എപ്പോഴും ഉമ്മ ഉപ്പയെയും ഉസ്താദുമാരെയും അനുസരിക്കും.',
  },
  {
    id: 'v8',
    emoji: '🏡',
    label: 'കുടുംബവും ഉമ്മയും',
    target: 'shield',
    x: '70%',
    y: '74%',
    insight:
      'ഖദീജ ബീവി رَضِيَ اللَّهُ عَنْهَا യുടെയും ഉമ്മുസലമ ബീവി رَضِيَ اللَّهُ عَنْهَا യുടെയും മാതൃക പോലെ കുടുംബത്തെയും സ്നേഹത്തോടെ കൂടെ ചേർക്കാം!',
    speech:
      'ഖദീജ ബീവി റളിയള്ളാഹു അൻഹയുടെയും ഉമ്മുസലമ ബീവി റളിയള്ളാഹു അൻഹയുടെയും മാതൃക പോലെ കുടുംബത്തെയും സ്നേഹത്തോടെ കൂടെ ചേർക്കാം!',
  },
];

interface LessonFlipCard {
  id: string;
  emoji: string;
  tag: string;
  title: string;
  arabic?: string;
  summary: string;
  detail: string;
  speech: string;
}

const LESSON_FLIP_CARDS: LessonFlipCard[] = [
  {
    id: 'l3c0',
    emoji: '❤️',
    tag: 'പാഠം 01 · തിരുനബി ﷺ-യുടെ ഉത്തമ മാതൃക',
    title: 'നന്മയുടെ പാതയും തിരുനബി ﷺ-യുടെ കാരുണ്യവും',
    arabic: 'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ',
    summary:
      'നമ്മൾ ചെയ്യുന്ന ഓരോ നന്മയും മുഹമ്മദ് നബി ﷺ പഠിപ്പിച്ച സൽസ്വഭാവത്തിന്റെയും സുന്നത്തിന്റെയും പാത പിന്തുടരലാണ്.',
    detail:
      'ഉമ്മത്തിനെ ഏറെ സ്നേഹിക്കുകയും നമുക്കുവേണ്ടി എന്നും കരുണ ചൊരിയുകയും ചെയ്ത മുഹമ്മദ് നബി ﷺ-യുടെ ഉത്തമ മാതൃകയാണ് നാം ജീവിതത്തിൽ പിൻപറ്റേണ്ടത്. ഓരോ ചെറിയ നന്മയും, നല്ല വാക്കും, മാതാപിതാക്കളോടുള്ള അനുസരണവും അല്ലാഹുവിന്റെ പ്രീതിയും തിരുനബി ﷺ-യുടെ സുന്നത്തും നേടിത്തരുന്നു — തിന്മയുടെ കെണികളിൽ നിന്ന് നാം എപ്പോഴും അകന്നുനിൽക്കണം!',
    speech:
      'നമ്മൾ ചെയ്യുന്ന ഓരോ നന്മയും മുഹമ്മദ് നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലം പഠിപ്പിച്ച സൽസ്വഭാവത്തിന്റെയും സുന്നത്തിന്റെയും പാത പിന്തുടരലാണ്. നമ്മെ ഏറെ സ്നേഹിച്ച തിരുനബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലമയുടെ ഉത്തമ മാതൃക മുറുകെ പിടിച്ച് തിന്മയുടെ കെണികളിൽ നിന്ന് അകന്നുനിൽക്കാം.',
  },
  {
    id: 'l3c1',
    emoji: '👑',
    tag: 'പാഠം 02 · 5 നല്ല ഗുണങ്ങൾ',
    title: 'നിയ്യത്ത്, റഹ്‌മത്ത്, റുബൂബിയത്ത്, ഖുവ്വത്ത്, ഖിദ്മത്ത്',
    arabic: 'نِيَّة · رَحْمَة · رُبُوبِيَّة · قُوَّة · خِدْمَة',
    summary: 'ഉള്ളിലെ മനസ്സ് നല്ലതായാൽ ചെയ്യുന്നതെല്ലാം മനോഹരമാകും!',
    detail:
      'രാത്രി വെള്ളം കൊടുത്ത ഉമർ رَضِيَ اللَّهُ عَنْهُ പോലെ ഇഖ്‌ലാസ് വെക്കുക; നബി ﷺ-യുടെ കാരുണ്യം ഹൃദയത്തിൽ നിറയ്ക്കുക. രാവിലെ ഭക്ഷണവും വെള്ളവും ഉറക്കവും ശ്രദ്ധിച്ച് ആരോഗ്യത്തോടെ കൂട്ടുകാരെ സഹായിക്കാം!',
    speech:
      'രാത്രി വെള്ളം കൊടുത്ത ഉമർ റളിയള്ളാഹു അൻഹുവിനെ പോലെ ഇഖ്‌ലാസ് വെക്കുക; നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലമയുടെ കാരുണ്യം ഹൃദയത്തിൽ നിറയ്ക്കുക. രാവിലെ ഭക്ഷണവും വെള്ളവും ഉറക്കവും ശ്രദ്ധിച്ച് ആരോഗ്യത്തോടെ കൂട്ടുകാരെ സഹായിക്കാം!',
  },
  {
    id: 'l3c2',
    emoji: '🧠',
    tag: 'പാഠം 03 · 20 സ്വഭാവങ്ങൾ',
    title: 'സ്നേഹം vs ദേഷ്യം & ആസ്വാദനം',
    arabic: 'طَلَب vs ആസ്വാദനം',
    summary: 'നല്ല സ്വഭാവത്തിൽ ഒന്നാമത്തേത് സ്നേഹം; ഏറ്റവും മോശം ദേഷ്യം!',
    detail:
      'മനുഷ്യനിൽ 20 അടിസ്ഥാന സ്വഭാവങ്ങളുണ്ട് — ദേഷ്യപ്പെടാതെ എല്ലാവരെയും സ്നേഹിക്കുകയാണ് നല്ല സ്വഭാവം. എന്തിനെയും സംശയിച്ചു തർക്കിക്കുന്നതിനേക്കാൾ, നിസ്കാരവും മൗലിദും നല്ല ഇബാദത്തുകളും സന്തോഷത്തോടെ ആസ്വദിക്കാൻ പഠിക്കണം!',
    speech:
      'മനുഷ്യനിൽ ഇരുപത് അടിസ്ഥാന സ്വഭാവങ്ങളുണ്ട്. ദേഷ്യപ്പെടാതെ എല്ലാവരെയും സ്നേഹിക്കുകയാണ് നല്ല സ്വഭാവം. എന്തിനെയും സംശയിച്ചു തർക്കിക്കുന്നതിനേക്കാൾ, നിസ്കാരവും മൗലിദും നല്ല ഇബാദത്തുകളും സന്തോഷത്തോടെ ആസ്വദിക്കാൻ പഠിക്കണം!',
  },
  {
    id: 'l3c3',
    emoji: '🏡',
    tag: 'പാഠം 04 · കുടുംബവും ഉമ്മയും',
    title: 'വീട്ടുകാർ, ഉമ്മ & പ്രവാചക മാതൃക',
    arabic: 'قُوا أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا',
    summary: 'ഉമ്മയുടെ ദുആയും വീട്ടുകാരുടെ സ്നേഹവുമാണ് നമ്മുടെ ബലം!',
    detail:
      'ഹിറാ ഗുഹയിൽ നിന്ന് വന്ന നബി ﷺ-യെ സമാധാനിപ്പിച്ച ഖദീജ ബീവി رَضِيَ اللَّهُ عَنْهَا യുടെയും, ഉമ്മുസലമ ബീവി رَضِيَ اللَّهُ عَنْهَا യുടെയും സ്നേഹം ഓർക്കൂ! എ.പി.ജെ. അബ്ദുൽ കലാം തന്റെ വിജയത്തിന് കാരണമായി പറഞ്ഞത് “ഉമ്മയുടെ സ്നേഹമുള്ള കരങ്ങൾ” എന്നായിരുന്നു!',
    speech:
      'ഹിറാ ഗുഹയിൽ നിന്ന് വന്ന നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലമയെ സമാധാനിപ്പിച്ച ഖദീജ ബീവി റളിയള്ളാഹു അൻഹയുടെയും, ഉമ്മുസലമ ബീവി റളിയള്ളാഹു അൻഹയുടെയും സ്നേഹം ഓർക്കൂ! എ പി ജെ അബ്ദുൽ കലാം തന്റെ വിജയത്തിന് കാരണമായി പറഞ്ഞത് ഉമ്മയുടെ സ്നേഹമുള്ള കരങ്ങൾ എന്നായിരുന്നു!',
  },
  {
    id: 'l3c4',
    emoji: '🛡️',
    tag: 'പാഠം 05 · ആദർശ കവചം',
    title: 'നല്ല സ്വഭാവവും മോശം കെണികളും',
    arabic: 'كَمَا يَتَجَارَى الْكَلَبُ بِصَاحِبِهِ',
    summary: 'നല്ല വിശ്വാസി അനുസരണയുള്ളവൻ; തെറ്റായ കെണികളിൽ വീഴരുത്!',
    detail:
      'തെറ്റായ വഴികളിൽ നിന്ന് മനസ്സിനെ കാക്കണമെന്ന് നബി ﷺ പഠിപ്പിച്ചിട്ടുണ്ട്. ആദർശ വ്യക്തതയും നല്ല സ്വഭാവവും കാത്തുസൂക്ഷിക്കാൻ നമ്മൾ എപ്പോഴും പണ്ഡിതന്മാരുടെയും മാതാപിതാക്കളുടെയും നല്ല മാർഗ്ഗനിർദ്ദേശത്തോടൊപ്പം നിൽക്കണം!',
    speech:
      'തെറ്റായ വഴികളിൽ നിന്ന് മനസ്സിനെ കാക്കണമെന്ന് നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലം പഠിപ്പിച്ചിട്ടുണ്ട്. ആദർശ വ്യക്തതയും നല്ല സ്വഭാവവും കാത്തുസൂക്ഷിക്കാൻ നമ്മൾ എപ്പോഴും പണ്ഡിതന്മാരുടെയും മാതാപിതാക്കളുടെയും നല്ല മാർഗ്ഗനിർദ്ദേശത്തോടൊപ്പം നിൽക്കണം!',
  },
];

const MIND_CHAIN = [
  { emoji: '🤲', step: '1. വിശ്വാസം', desc: 'അല്ലാഹുവാണ് നമ്മളെ പടച്ചതും നോക്കുന്നതും എന്ന ഉറച്ച വിശ്വാസം!' },
  { emoji: '💭', step: '2. ചിന്തകൾ', desc: 'സ്വർഗ്ഗവും നന്മകളും ഓർത്ത് നല്ല കാര്യങ്ങൾ മാത്രം ചിന്തിക്കാം.' },
  { emoji: '❤️', step: '3. സ്വഭാവം', desc: 'ദേഷ്യം കളഞ്ഞ് എല്ലാവരോടും സ്നേഹത്തോടെ പെരുമാറാം!' },
  { emoji: '💬', step: '4. സംസാരം', desc: 'കളിയാക്കലും ചീത്തവാക്കും മാറ്റി നല്ല വാക്കുകൾ മാത്രം പറയാം.' },
  { emoji: '🌟', step: '5. പ്രവർത്തനം', desc: 'നല്ല വാക്കുകൾ വീട്ടിലും നാട്ടിലും നല്ല സഹായങ്ങളായി മാറും!' },
];

type DeskRole = 'president' | 'secretary' | 'treasurer';

interface DeskTask {
  id: string;
  emoji: string;
  label: string;
  role: DeskRole;
}

const DESK_TASKS: DeskTask[] = [
  { id: 't1', emoji: '📝', label: 'യോഗ മിനിറ്റ്സ് എഴുതുക & സർക്കുലർ വായിക്കുക', role: 'secretary' },
  {
    id: 't2',
    emoji: '💰',
    label: 'പരിപാടിക്ക് 10–15% കരുതൽ തുകയും ബഡ്ജറ്റും ഉണ്ടാക്കൽ',
    role: 'treasurer',
  },
  { id: 't3', emoji: '👑', label: 'യോഗത്തിന് അധ്യക്ഷനാകുക & പ്രഭാഷകനെ കാര്യം അറിയിക്കൽ', role: 'president' },
  { id: 't4', emoji: '🧾', label: 'വരവുചിലവ് കണക്കും സഹചാരി ഫണ്ടും സൂക്ഷിക്കൽ', role: 'treasurer' },
  { id: 't5', emoji: '💻', label: 'കത്തുകൾ അയക്കലും ഓർഗാനെറ്റ് പോർട്ടൽ റിപ്പോർട്ട് അപ്‌ലോഡും', role: 'secretary' },
  { id: 't6', emoji: '🤝', label: 'എല്ലാവർക്കും ചുമതല കൊടുത്ത് ടീമിൽ സ്നേഹം വളർത്തൽ', role: 'president' },
];

export const Level3Organizer: React.FC<Level3OrganizerProps> = ({
  isCompleted,
  onAwardXp,
  onUnlockBadge,
  onCompleteLevel,
  collectedEggs = [],
  onClaimEasterEgg,
  initialTab,
  onActiveLessonChange,
  onMarkLessonCompleted,
  completedLessonIds = [],
  quizAnswers,
  onQuizAnswered,
  devUnlocked = false,
}) => {
  const [activeTab, setActiveTab] = useState<L3Tab>(initialTab || 'sky_catcher');
  const [glitterKey, setGlitterKey] = useState(0);
  const [glitterMsg, setGlitterMsg] = useState('');

  const [activeTool, setActiveTool] = useState<'shield' | 'trap'>('shield');
  const [caughtBubbles, setCaughtBubbles] = useState<string[]>([]);
  const [sortCombo, setSortCombo] = useState(0);
  const [skyMistakes, setSkyMistakes] = useState(0);
  const [skyMsg, setSkyMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [activeScrollIdx, setActiveScrollIdx] = useState<number>(0);
  const [readScrollIds, setReadScrollIds] = useState<string[]>(['l3c0']);
  const [activeChainIdx, setActiveChainIdx] = useState<number>(0);
  const [visitedMindSteps, setVisitedMindSteps] = useState<number[]>([0]);

  const [taskIdx, setTaskIdx] = useState(0);
  const [placedTasks, setPlacedTasks] = useState<string[]>([]);
  const [deskMistakes, setDeskMistakes] = useState(0);
  const [deskMsg, setDeskMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [newsStage, setNewsStage] = useState<0 | 1 | 2 | 3>(0);
  const [erasedHypes, setErasedHypes] = useState<number[]>([]);
  const [minutesPicked, setMinutesPicked] = useState<string[]>([]);
  const [aiPicked, setAiPicked] = useState<string[]>([]);
  const [pressPicked, setPressPicked] = useState<string[]>([]);
  const [newsMistakes, setNewsMistakes] = useState(0);
  const [newsMsg, setNewsMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [completedSceneGames, setCompletedSceneGames] = useState<string[]>([]);

  const currentTask = DESK_TASKS[taskIdx];
  const activeScroll = LESSON_FLIP_CARDS[activeScrollIdx] || LESSON_FLIP_CARDS[0];

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    onActiveLessonChange?.(`l3_${activeTab}`);
  }, [activeTab, onActiveLessonChange]);

  useEffect(() => {
    if (caughtBubbles.length >= 6 && Boolean(quizAnswers.l3_sky_catcher)) {
      onMarkLessonCompleted?.('l3_sky_catcher');
    }
  }, [caughtBubbles.length, quizAnswers.l3_sky_catcher, onMarkLessonCompleted]);

  useEffect(() => {
    if (
      readScrollIds.length >= 2 &&
      completedSceneGames.includes('l3_scrolls') &&
      Boolean(quizAnswers.l3_scrolls)
    ) {
      onMarkLessonCompleted?.('l3_scrolls');
    }
  }, [readScrollIds.length, completedSceneGames, quizAnswers.l3_scrolls, onMarkLessonCompleted]);

  useEffect(() => {
    if (
      visitedMindSteps.length >= 3 &&
      completedSceneGames.includes('l3_mind_chain') &&
      Boolean(quizAnswers.l3_mind_chain)
    ) {
      onMarkLessonCompleted?.('l3_mind_chain');
    }
  }, [visitedMindSteps.length, completedSceneGames, quizAnswers.l3_mind_chain, onMarkLessonCompleted]);

  useEffect(() => {
    if (placedTasks.length >= 4 && Boolean(quizAnswers.l3_unit_desks)) {
      onMarkLessonCompleted?.('l3_unit_desks');
    }
  }, [placedTasks.length, quizAnswers.l3_unit_desks, onMarkLessonCompleted]);

  useEffect(() => {
    if (
      erasedHypes.length === 3 &&
      minutesPicked.length === MINUTES_ORDER_CORRECT.length &&
      aiPicked.length === AI_WORKFLOW_CORRECT.length &&
      Boolean(quizAnswers.l3_newsroom)
    ) {
      onMarkLessonCompleted?.('l3_newsroom');
    }
  }, [
    erasedHypes.length,
    minutesPicked.length,
    aiPicked.length,
    quizAnswers.l3_newsroom,
    onMarkLessonCompleted,
  ]);

  useEffect(() => {
    if (activeTab === 'sky_catcher') {
      narrator.speak(
        'ആദ്യം നന്മ കവചം തിരഞ്ഞെടുത്ത് ആകാശത്ത് പറക്കുന്ന നല്ല ഗുണങ്ങൾ പിടിക്കൂ, കെണികൾ ബ്ലാസ്റ്റർ കൊണ്ട് പൊട്ടിക്കൂ! തിരുനബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലം പഠിപ്പിച്ച നന്മയുടെ പാത പിന്തുടരാം!',
        '🎈 സ്കൈ ക്യാച്ചർ ഗെയിം'
      );
    } else if (activeTab === 'scrolls') {
      narrator.speak(
        'ജ്ഞാനച്ചുരുൾ വായന! മുഹമ്മദ് നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലം കാണിച്ചുതന്ന ഉത്തമ സ്വഭാവവും നന്മയുടെ പാതയും നമുക്ക് ഇവിടെ നിന്ന് പഠിക്കാം.',
        '📜 ജ്ഞാനച്ചുരുൾ വായന'
      );
    } else if (activeTab === 'mind_chain') {
      narrator.speak(
        'മനസ്സിന്റെ അഞ്ച് ആരോഹണ പടവുകൾ! വിശ്വാസത്തിൽ നിന്ന് നല്ല പ്രവർത്തനത്തിലേക്കുള്ള പടവുകളിൽ ഓരോന്നായി കയറൂ!',
        '🪜 മനസ്സിന്റെ 5 പടവുകൾ'
      );
    } else if (activeTab === 'unit_desks') {
      narrator.speak(
        `ഓഫീസ് ഡെസ്ക് ഗെയിം! ${currentTask.label}. ഇത് ഏത് ഭാരവാഹിയുടെ ഡെസ്കിൽ വെക്കും?`,
        '👑 ഓഫീസ് ഡെസ്ക്'
      );
    } else {
      narrator.speak(
        'ബബിൾ പോപ്പ് ന്യൂസ്‌റൂം! അതിശയോക്തി ബബിളുകൾ പൊട്ടിച്ചു കളഞ്ഞ് ശരിയായ വാർത്തയും മിനിറ്റ്സും നിർമ്മിക്കൂ!',
        '🫧 ബബിൾ പോപ്പ് ന്യൂസ്‌റൂം'
      );
    }
  }, [activeTab]);

  const triggerGlitter = (msg: string) => {
    setGlitterMsg(msg);
    setGlitterKey((k) => k + 1);
  };

  const skyFailed = skyMistakes >= 3 && caughtBubbles.length < SKY_BUBBLES.length;
  const deskFailed = deskMistakes >= 3 && placedTasks.length < DESK_TASKS.length;
  const newsFailed = newsMistakes >= 3;

  const handleCatchBubble = (bubble: SkyBubble) => {
    if (skyFailed || caughtBubbles.includes(bubble.id)) return;

    if (bubble.target === activeTool) {
      const nextCombo = sortCombo + 1;
      setSortCombo(nextCombo);
      sound.playSuccess(nextCombo);
      const nextCaught = [...caughtBubbles, bubble.id];
      setCaughtBubbles(nextCaught);
      onAwardXp(20, `l3_val_${bubble.id}`);
      setSkyMsg({
        ok: true,
        text: `${bubble.emoji} ${bubble.label}: ${bubble.insight}`,
      });
      triggerGlitter(
        bubble.target === 'shield'
          ? `❤️ കവചത്തിൽ ചേർന്നു! +20 XP`
          : `⚡ കെണി പൊട്ടിച്ചു! +20 XP`
      );
      narrator.speak(bubble.speech, `${bubble.emoji} ${bubble.label}`);
      if (nextCaught.length === SKY_BUBBLES.length) {
        window.setTimeout(() => scrollToActiveQuiz(), 950);
      }
    } else {
      setSortCombo(0);
      sound.playError();
      const nextM = skyMistakes + 1;
      setSkyMistakes(nextM);
      const neededTool =
        bubble.target === 'shield'
          ? '“❤️ നല്ലത് പിടിക്കൂ” വടി'
          : '“⚡ കെണി പൊട്ടിക്കൂ” ബ്ലാസ്റ്റർ';
      setSkyMsg({
        ok: false,
        text:
          nextM >= 3
            ? '💥 3 തവണ തെറ്റായ ആയുധം ഉപയോഗിച്ചു! സ്കൈ ക്യാച്ചർ പരാജയപ്പെട്ടു — വീണ്ടും ശ്രമിക്കാം!'
            : `${bubble.emoji} “${bubble.label}” (${3 - nextM} അവസരം ബാക്കി) — ഇത് പിടിക്കാൻ ${neededTool} തിരഞ്ഞെടുക്കൂ!`,
      });
    }
  };

  const handleSelectScroll = (idx: number) => {
    const card = LESSON_FLIP_CARDS[idx];
    if (!card) return;
    sound.playPop();
    sound.playWriting();
    setActiveScrollIdx(idx);
    if (!readScrollIds.includes(card.id)) {
      setReadScrollIds((prev) => [...prev, card.id]);
      onAwardXp(10, `l3_lesson_${card.id}`);
      triggerGlitter(`📜 ${card.tag} +10 XP`);
    }
    narrator.speak(card.speech, `${card.emoji} ${card.title}`);
  };

  const handleAssignDesk = (desk: DeskRole) => {
    if (deskFailed) return;
    if (currentTask.role === desk) {
      sound.playSuccess();
      sound.playWriting();
      if (!placedTasks.includes(currentTask.id)) {
        const nextPlaced = [...placedTasks, currentTask.id];
        setPlacedTasks(nextPlaced);
        onAwardXp(25, `l3_desk_${currentTask.id}`);
        if (nextPlaced.length === DESK_TASKS.length) {
          window.setTimeout(() => scrollToActiveQuiz(), 950);
        }
      }
      setDeskMsg({ ok: true, text: '🎉 കൃത്യം! ശരിയായ ഭാരവാഹിയുടെ ഡെസ്കിൽ ഫയൽ എത്തി (+25 XP)!' });
      triggerGlitter('📂 ഫയൽ ഡെസ്കിൽ എത്തി! +25 XP');
      narrator.speak(`ശരിയാണ്! ${currentTask.label}`);
      if (taskIdx < DESK_TASKS.length - 1) {
        setTimeout(() => {
          setTaskIdx((i) => Math.min(i + 1, DESK_TASKS.length - 1));
        }, 650);
      }
    } else {
      sound.playError();
      const nextM = deskMistakes + 1;
      setDeskMistakes(nextM);
      setDeskMsg({
        ok: false,
        text:
          nextM >= 3
            ? '💥 3 ഫയലുകൾ തെറ്റായ ഡെസ്കിൽ വെച്ചു! ഓഫീസ് ടാസ്ക് പരാജയപ്പെട്ടു — വീണ്ടും ശ്രമിക്കാം!'
            : `ഈ ചുമതല ആ ഡെസ്കിന്റേതല്ല 😅 (${3 - nextM} അവസരം ബാക്കി) — ഡെസ്കിന് താഴെയുള്ള സൂചന വായിക്കൂ!`,
      });
    }
  };

  const handleSnapNextBlock = (
    correctList: string[],
    picked: string[],
    setPicked: React.Dispatch<React.SetStateAction<string[]>>,
    item: string,
    xpKey: string
  ) => {
    if (newsFailed) return;
    const expected = correctList[picked.length];
    if (item === expected) {
      const next = [...picked, item];
      setPicked(next);
      sound.playDrop();
      if (next.length === correctList.length) {
        sound.playHoist();
        onAwardXp(40, xpKey);
        setNewsMsg({ ok: true, text: '🎉 അടിപൊളി! പൂർണ്ണ ക്രമം കൃത്യമായി ചേർന്നു! (+40 XP)' });
        triggerGlitter('🚂 ട്രെയിൻ ക്രമം പൂർത്തിയായി! +40 XP');
        narrator.speak('വളരെ മനോഹരം! പൂർണ്ണ ക്രമം കൃത്യമായി ചേർന്നു!');
        if (xpKey === 'l3_ai_snap') {
          window.setTimeout(() => scrollToActiveQuiz(), 950);
        }
      } else {
        setNewsMsg({
          ok: true,
          text: `ചേർന്നു (${next.length}/${correctList.length})! ഇനി അടുത്ത പടി തിരഞ്ഞെടുക്കൂ.`,
        });
      }
    } else {
      sound.playError();
      const nextM = newsMistakes + 1;
      setNewsMistakes(nextM);
      setNewsMsg({
        ok: false,
        text:
          nextM >= 3
            ? '💥 3 തവണ ക്രമം തെറ്റി! ന്യൂസ്‌റൂം ടാസ്ക് പരാജയപ്പെട്ടു — വീണ്ടും ശ്രമിക്കാം!'
            : `അടുത്ത പടി ഇതല്ല 😅 (${3 - nextM} അവസരം ബാക്കി)! ആദ്യം വേണ്ടത്: “${expected}” എന്ന ഘട്ടമാണ്.`,
      });
    }
  };

  const newsroomDone =
    erasedHypes.length === 3 &&
    minutesPicked.length === MINUTES_ORDER_CORRECT.length &&
    aiPicked.length === AI_WORKFLOW_CORRECT.length;

  const handleFinishLevel3 = () => {
    sound.playUnlock();
    onAwardXp(60, 'l3_complete');
    onUnlockBadge('ആദർശരക്ഷാധികാരി');
    narrator.speak(
      'അഭിനന്ദനങ്ങൾ! ജില്ലാ തലത്തിലെ എല്ലാ പാഠങ്ങളും വിജയകരമായി പൂർത്തിയാക്കി! ഇനി സ്റ്റേറ്റ് & ഗ്ലോബൽ തലത്തിലേക്ക് കടക്കാം!'
    );
    onCompleteLevel();
  };

  const l3Tabs: { id: L3Tab; label: string }[] = [
    { id: 'sky_catcher', label: '1. സ്കൈ ക്യാച്ചർ ഗെയിം' },
    { id: 'scrolls', label: '2. ജ്ഞാനച്ചുരുൾ (പ്രവാചക സ്നേഹം ﷺ)' },
    { id: 'mind_chain', label: '3. മനസ്സിന്റെ 5 പടവുകൾ' },
    { id: 'unit_desks', label: '4. ഓഫീസ് ഡെസ്ക്' },
    { id: 'newsroom', label: '5. ന്യൂസ്‌റൂം & മിനിറ്റ്സ്' },
  ];
  const activeL3Idx = l3Tabs.findIndex((t) => t.id === activeTab);
  const isLastL3Tab = activeL3Idx === l3Tabs.length - 1;
  const currentL3LessonId = `l3_${activeTab}`;
  const l3StepUnlocked =
    devUnlocked ||
    isCompleted ||
    completedLessonIds.includes(currentL3LessonId) ||
    Boolean(quizAnswers[currentL3LessonId]);

  const handleAdvanceL3Tab = () => {
    onMarkLessonCompleted?.(currentL3LessonId);
    if (!isLastL3Tab) {
      setActiveTab(l3Tabs[activeL3Idx + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinishLevel3();
    }
  };

  const trackItems: { id: L3Tab; lessonId: string; label: string; emoji: string }[] = [
    { id: 'sky_catcher', lessonId: 'l3_sky_catcher', label: 'സ്കൈ ക്യാച്ചർ', emoji: '🎈' },
    { id: 'scrolls', lessonId: 'l3_scrolls', label: 'ജ്ഞാനച്ചുരുൾ (പ്രവാചക സ്നേഹം ﷺ)', emoji: '📜' },
    { id: 'mind_chain', lessonId: 'l3_mind_chain', label: 'മനസ്സിന്റെ 5 പടവുകൾ', emoji: '🪜' },
    { id: 'unit_desks', lessonId: 'l3_unit_desks', label: 'ഓഫീസ് ഡെസ്ക്', emoji: '👑' },
    { id: 'newsroom', lessonId: 'l3_newsroom', label: 'ന്യൂസ്‌റൂം & മിനിറ്റ്സ്', emoji: '📰' },
  ];

  return (
    <section className="space-y-4">
      {/* 1. GAME FIRST FOR LESSON TABS */}
      {(activeTab === 'scrolls' || activeTab === 'mind_chain') && (
        <OptionalLessonMiniGame
          key={`l3_${activeTab}`}
          lessonKey={`l3_${activeTab}` as MiniGameLessonKey}
          onAwardXp={onAwardXp}
          isCompleted={
            isCompleted ||
            completedLessonIds.includes(`l3_${activeTab}`) ||
            completedSceneGames.includes(`l3_${activeTab}`)
          }
          onComplete={() =>
            setCompletedSceneGames((prev) =>
              prev.includes(`l3_${activeTab}`) ? prev : [...prev, `l3_${activeTab}`]
            )
          }
        />
      )}

      {/* GAME 3A: 2D ANIMATED FLOATING SKY BUBBLE CATCHER GAME */}
      {activeTab === 'sky_catcher' && (
        <div className="space-y-4">
        <GameFullscreenShell
          title="🎈 സ്കൈ ക്യാച്ചർ"
          subtitle="നന്മകൾ പിടിക്കൂ · കെണികൾ പൊട്ടിക്കൂ"
        >
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveTool('shield');
                  }}
                  title="❤️ ഹൃദയ കവച വടി (നല്ല ഗുണങ്ങൾ പിടിക്കൂ)"
                  aria-label="ഹൃദയ കവച വടി"
                  className={`px-3.5 py-2 rounded-xl border-2 border-b-4 text-base font-extrabold flex items-center gap-1.5 transition-all ${
                    activeTool === 'shield'
                      ? 'bg-emerald-600 text-white border-emerald-900 ring-2 ring-emerald-300'
                      : 'bg-emerald-50 text-emerald-950 border-emerald-300'
                  }`}
                >
                  <span>❤️</span>
                  <span className="text-xs">🛡️</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveTool('trap');
                  }}
                  title="⚡ ഷീൽഡ് ബ്ലാസ്റ്റർ (കെണികൾ പൊട്ടിക്കൂ)"
                  aria-label="ഷീൽഡ് ബ്ലാസ്റ്റർ"
                  className={`px-3.5 py-2 rounded-xl border-2 border-b-4 text-base font-extrabold flex items-center gap-1.5 transition-all ${
                    activeTool === 'trap'
                      ? 'bg-red-700 text-white border-red-950 ring-2 ring-red-300'
                      : 'bg-red-50 text-red-950 border-red-300'
                  }`}
                >
                  <span>⚡</span>
                  <span className="text-xs">💥</span>
                </button>
              </div>
              <div className="flex items-center gap-2 tabular-nums">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-900">
                  🎈 {caughtBubbles.length}/{SKY_BUBBLES.length}
                </span>
                <GameShatterLives
                  lives={Math.max(0, 3 - skyMistakes)}
                  maxLives={3}
                  dark={false}
                  compact
                />
                {sortCombo > 1 && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-red-700">
                    <Flame className="w-3.5 h-3.5 text-orange-500" /> x{sortCombo}
                  </span>
                )}
              </div>
            </div>

            {skyFailed && (
              <GameDefeatBurstOverlay
                title="നന്മ വേട്ട പരാജയപ്പെട്ടു!"
                reason="3 തെറ്റുകൾ സംഭവിച്ചതിനാൽ കവചങ്ങൾ തകർന്നു — നല്ല ഗുണങ്ങൾ പിടിച്ചും തിന്മകൾ ഒഴിവാക്കിയും വീണ്ടും കളിക്കാം!"
                onRetry={() => {
                  sound.playClick();
                  setSkyMistakes(0);
                  setSortCombo(0);
                  setCaughtBubbles([]);
                  setSkyMsg(null);
                }}
                overlay={false}
              />
            )}

            <AnimatePresence mode="wait">
              {skyMsg && (
                <motion.div
                  key={skyMsg.text}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-bold ${
                    skyMsg.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  {skyMsg.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative w-full h-80 sm:h-96 rounded-2xl border-2 border-emerald-300 overflow-hidden shadow-md bg-sky-900">
            <img
              src={worldSkyRainbowImg}
              alt="സ്കൈ ക്യാച്ചർ മഴവില്ല് ആകാശ ഗെയിം"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-950/20" />

            <DriftingCloudsAndSun />
            <FloatingSparkleField />
            <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
            <SwayingGardenPlants />
            {onClaimEasterEgg && (
              <EasterEggSpot
                eggId="egg_garden_flower"
                collected={collectedEggs.includes('egg_garden_flower')}
                onClaim={onClaimEasterEgg}
                className="absolute bottom-3 right-3 z-30"
              />
            )}

            {SKY_BUBBLES.map((bubble) => {
              const caught = caughtBubbles.includes(bubble.id);
              return (
                <motion.button
                  key={bubble.id}
                  type="button"
                  disabled={caught}
                  whileHover={!caught ? { scale: 1.09 } : undefined}
                  whileTap={!caught ? { scale: 0.9 } : undefined}
                  onClick={() => handleCatchBubble(bubble)}
                  style={{ left: bubble.x, top: bubble.y }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border-b-4 text-[11px] sm:text-xs font-extrabold shadow-lg flex items-center gap-1 max-w-[140px] sm:max-w-none transition-all ${
                    caught
                      ? 'opacity-30 scale-90 bg-slate-800 text-slate-300 border-slate-900 cursor-default'
                      : 'bg-white/95 text-slate-950 border-amber-400 hover:bg-amber-100 animate-float-bob cursor-pointer'
                  }`}
                >
                  <span className="text-sm sm:text-base leading-none shrink-0">
                    {caught ? '✅' : bubble.emoji}
                  </span>
                  <span className="leading-tight text-left break-words">{bubble.label}</span>
                </motion.button>
              );
            })}

            {caughtBubbles.length === SKY_BUBBLES.length && (
              <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center text-white space-y-3">
                <p className="text-3xl">🎉✨</p>
                <h3 className="text-lg sm:text-xl font-extrabold">
                  അടിപൊളി! 8 ബബിളുകളും വിജയകരമായി പിടിച്ചു!
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    scrollToActiveQuiz();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-b-4 border-amber-700 text-xs sm:text-sm font-extrabold shadow-lg"
                >
                  അടുത്തത് · ക്വിസ് ➡️
                </button>
              </div>
            )}
          </div>
        </div>
        </GameFullscreenShell>
        </div>
      )}

      {/* 2. LESSON OPEN BY DEFAULT RIGHT BELOW GAME LAUNCHER */}
      {activeTab === 'sky_catcher' && (
        <CollapsibleLessonDrawer
          key="l3-sky-note"
          emoji="❤️"
          title="തിരുനബി ﷺ-യുടെ മാതൃക · പാഠം"
          onSpeak={() =>
            narrator.speak(
              'നമ്മൾ ചെയ്യുന്ന ഓരോ നന്മയും നമ്മെ ഏറെ സ്നേഹിച്ച മുഹമ്മദ് നബി സ്വല്ലല്ലാഹു അലൈഹി വസല്ലം പഠിപ്പിച്ച ഉത്തമ മാതൃക പിന്തുടരലാണ്. തിന്മയുടെ കെണികളിൽ നിന്ന് അകന്നുനിന്ന് എപ്പോഴും സൽസ്വഭാവം കാത്തുസൂക്ഷിക്കാം.',
              '❤️ തിരുനബി ﷺ-യുടെ ഉത്തമ മാതൃക'
            )
          }
        >
          <p className="text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
            ❤️ നമ്മൾ ചെയ്യുന്ന ഓരോ നന്മയും മുഹമ്മദ് നബി ﷺ പഠിപ്പിച്ച ഉത്തമ മാതൃകയും സത്യപാതയും പിന്തുടരലാണ് — തിന്മയുടെ കെണികളിൽ നിന്ന് അകന്നുനിൽക്കാം!
          </p>
        </CollapsibleLessonDrawer>
      )}

      {/* 2. COLLAPSIBLE LESSON: WISDOM SCROLLS */}
      {activeTab === 'scrolls' && (
        <CollapsibleLessonDrawer
          key="l3-drawer-scrolls"
          emoji="📜"
          title="ജ്ഞാനച്ചുരുൾ · പാഠം"
          badgeText={`${readScrollIds.length}/${LESSON_FLIP_CARDS.length}`}
          onSpeak={() =>
            narrator.speak(activeScroll.speech, `${activeScroll.emoji} ${activeScroll.title}`)
          }
        >
        <div className="relative space-y-4">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />

          {/* Single-Focus Illuminated Wisdom Scroll Reader */}
          <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/70 p-4 sm:p-6 shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/80">
              <div>
                <p className="text-[11px] font-extrabold text-red-900">
                  📜 കാർഡിനകത്തെ “അടുത്ത പാഠം →” ബട്ടൺ തൊട്ട് ഓരോ അധ്യായമായി വായിക്കാം
                </p>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  ഹൃദയ തോട്ടത്തിലെ ജ്ഞാനച്ചുരുൾ
                </h3>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-extrabold tabular-nums">
                ച്ചുരുൾ {activeScrollIdx + 1} / {LESSON_FLIP_CARDS.length} · വായിച്ചത് {readScrollIds.length}/{LESSON_FLIP_CARDS.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeScroll.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="relative rounded-2xl border-2 border-emerald-800/20 bg-white overflow-hidden shadow-inner"
              >
                <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-block text-[11px] font-extrabold text-amber-300">
                      {activeScroll.emoji} {activeScroll.tag}
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-white">
                      {activeScroll.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      narrator.speak(activeScroll.speech, `${activeScroll.emoji} ${activeScroll.title}`)
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-extrabold shrink-0"
                  >
                    <Volume2 className="w-4 h-4" /> കഥ കേൾക്കാം
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {activeScroll.arabic && (
                    <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-center">
                      <p className="font-arabic text-xl sm:text-2xl font-bold text-emerald-950">
                        {activeScroll.arabic}
                      </p>
                    </div>
                  )}

                  <p className="text-sm sm:text-base font-extrabold text-red-900">
                    ✨ {activeScroll.summary}
                  </p>

                  <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                    {activeScroll.detail}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={activeScrollIdx === 0}
                      onClick={() => handleSelectScroll(activeScrollIdx - 1)}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs font-extrabold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← മുൻ പാഠം
                    </button>
                    <span className="text-xs font-bold text-slate-500 tabular-nums">
                      ച്ചുരുൾ {activeScrollIdx + 1} / {LESSON_FLIP_CARDS.length}
                    </span>
                    <button
                      type="button"
                      disabled={activeScrollIdx === LESSON_FLIP_CARDS.length - 1}
                      onClick={() => handleSelectScroll(activeScrollIdx + 1)}
                      className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-extrabold hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      അടുത്ത പാഠം →
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </CollapsibleLessonDrawer>
      )}

      {/* 2. COLLAPSIBLE LESSON: MIND CHAIN */}
      {activeTab === 'mind_chain' && (
        <CollapsibleLessonDrawer
          key="l3-drawer-mind"
          emoji="🪜"
          title="മനസ്സിന്റെ 5 പടവുകൾ · പാഠം"
          badgeText={`${activeChainIdx + 1}/${MIND_CHAIN.length}`}
        >
        <div className="relative space-y-4">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-4 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    🪜 മനസ്സിന്റെ 5 ആരോഹണ പടവുകൾ
                  </h3>
                  <p className="text-xs text-slate-600">
                    വിശ്വാസത്തിൽ നിന്ന് നല്ല പ്രവർത്തനത്തിലേക്കുള്ള പടവുകളിൽ ഓരോന്നായി കയറൂ!
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 tabular-nums">
                പടി {activeChainIdx + 1} / {MIND_CHAIN.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {MIND_CHAIN.map((item, idx) => {
                const isCurrent = activeChainIdx === idx;
                const isReached = idx <= activeChainIdx;
                const indentClasses = [
                  'sm:ml-0',
                  'sm:ml-5',
                  'sm:ml-10',
                  'sm:ml-15',
                  'sm:ml-20',
                ];
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setActiveChainIdx(idx);
                      setVisitedMindSteps((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
                      onAwardXp(5, `l3_chain_${idx}`);
                      narrator.speak(`${item.step}: ${item.desc}`, item.step);
                    }}
                    className={`w-full sm:w-auto sm:min-w-[340px] max-w-xl ${indentClasses[idx] || ''} text-left p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-emerald-900 text-white border-amber-400 shadow-md scale-[1.01]'
                        : isReached
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:border-emerald-500'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950'
                          : isReached
                          ? 'bg-emerald-200 text-emerald-950'
                          : 'bg-white border border-slate-200'
                      }`}
                    >
                      {item.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-extrabold">{item.step}</p>
                      <p
                        className={`text-xs mt-0.5 leading-relaxed ${
                          isCurrent ? 'text-emerald-100' : 'text-slate-600'
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        </CollapsibleLessonDrawer>
      )}

      {/* 3. STORYLINE (COLLAPSED) + MANDATORY QUIZ FOR SKY CATCHER / SCROLLS / MIND CHAIN */}
      {activeTab !== 'unit_desks' && activeTab !== 'newsroom' && (
        <LessonCheckQuiz
          lessonId={`l3_${activeTab}`}
          savedAnswer={quizAnswers[`l3_${activeTab}`]}
          onAnswered={(lessonId, selectedIdx, isCorrect) => {
            onQuizAnswered(lessonId, selectedIdx, isCorrect);
            onMarkLessonCompleted?.(lessonId);
          }}
          onNextLesson={handleAdvanceL3Tab}
          nextLessonLabel={!isLastL3Tab ? 'അടുത്ത പാഠം ➡️' : 'സ്റ്റേറ്റ് & ഗ്ലോബൽ തലം ➡️'}
        />
      )}

      {/* TAB 3: UNIT OFFICE DESKS */}
      {activeTab === 'unit_desks' && (
        <GameFullscreenShell
          title="👑 യൂണിറ്റ് ഓഫീസ് ഡെസ്ക്"
          subtitle="ഓരോ ഫയലും ശരിയായ ഭാരവാഹിയുടെ ഡെസ്കിലേക്ക് മാറ്റൂ"
        >
        <div className="relative bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 overflow-hidden">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
          <div className="relative h-28 sm:h-32 rounded-2xl overflow-hidden border border-amber-200">
            <img
              src={worldNewsroomDeskImg}
              alt="യൂണിറ്റ് ഓഫീസ് ഡെസ്ക്"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent flex items-center px-4">
              <div className="text-white">
                <p className="text-[11px] font-bold text-amber-300">👑 യൂണിറ്റ് ഓഫീസ് ഡെസ്ക്</p>
                <p className="text-sm sm:text-base font-extrabold">
                  പ്രസിഡന്റ് · സെക്രട്ടറി · ട്രഷറർ ചുമതലകൾ ക്രമീകരിക്കാം!
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                📂 ഫയൽ {taskIdx + 1} / {DESK_TASKS.length}: ശരിയായ ഭാരവാഹിയുടെ ഡെസ്കിൽ വെക്കൂ!
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GameShatterLives
                lives={Math.max(0, 3 - deskMistakes)}
                maxLives={3}
                dark={false}
                compact
              />
              <div className="flex gap-1">
              {DESK_TASKS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setTaskIdx(i);
                    setDeskMsg(null);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold border ${
                    i === taskIdx
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : placedTasks.includes(t.id)
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              </div>
            </div>
          </div>

          {deskFailed && (
            <GameDefeatBurstOverlay
              title="ഓഫീസ് ഫയൽ ടാസ്ക് പരാജയപ്പെട്ടു!"
              reason="3 ഫയലുകൾ തെറ്റായ ഡെസ്കിൽ വെച്ചു. പ്രസിഡന്റ്, സെക്രട്ടറി, ട്രഷറർ ചുമതലകൾ കൃത്യമായി നൽകാൻ വീണ്ടും ശ്രമിക്കാം!"
              onRetry={() => {
                sound.playClick();
                setDeskMistakes(0);
                setPlacedTasks([]);
                setTaskIdx(0);
                setDeskMsg(null);
              }}
              overlay={false}
            />
          )}

          <AnimatePresence mode="wait">
            {deskMsg && (
              <motion.div
                key={deskMsg.text}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-2 ${
                  deskMsg.ok
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <span>{deskMsg.text}</span>
                {placedTasks.length === DESK_TASKS.length && (
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

          <motion.div
            key={currentTask.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            draggable
            onDragStart={() => sound.playClick()}
            className="max-w-lg mx-auto p-5 rounded-2xl bg-amber-50/85 border-2 border-b-4 border-amber-400 text-center cursor-grab card-3d-tilt"
          >
            <p className="text-2xl mb-1">{currentTask.emoji}</p>
            <p className="text-base sm:text-lg font-extrabold text-slate-900">
              {currentTask.label}
            </p>
            <button
              type="button"
              onClick={() => narrator.speak(currentTask.label)}
              className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-amber-900 border border-amber-300 text-[11px] font-bold"
            >
              <Volume2 className="w-3 h-3" /> വായിച്ചു കേൾക്കാം
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(
              [
                {
                  id: 'president',
                  emoji: '👑',
                  title: 'പ്രസിഡന്റ് ഡെസ്ക്',
                  sub: 'യോഗാധ്യക്ഷത, പ്രഭാഷകനെ ലക്ഷ്യം അറിയിക്കൽ & ഭാരവാഹി ഐക്യം',
                },
                {
                  id: 'secretary',
                  emoji: '📝',
                  title: 'സെക്രട്ടറി ഡെസ്ക്',
                  sub: 'യോഗ മിനിറ്റ്സ്, മേൽഘടക സർക്കുലർ വായന & ഓർഗാനെറ്റ് റിപ്പോർട്ട്',
                },
                {
                  id: 'treasurer',
                  emoji: '💰',
                  title: 'ട്രഷറർ ഡെസ്ക്',
                  sub: 'ബഡ്ജറ്റ്, വരവുചിലവ്, 10–15% കരുതൽ തുക (Buffer Fund) & സഹചാരി',
                },
              ] as const
            ).map((desk) => (
              <button
                key={desk.id}
                type="button"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleAssignDesk(desk.id)}
                onClick={() => handleAssignDesk(desk.id)}
                className="p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-emerald-600 hover:bg-emerald-50/60 transition-all text-center card-3d-tilt"
              >
                <p className="text-2xl mb-1">{desk.emoji}</p>
                <p className="text-base font-extrabold text-slate-900">{desk.title}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{desk.sub}</p>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-xs font-extrabold text-emerald-900">
              🏕️ ഒരു ശാഖ/യൂണിറ്റ് രൂപീകരിക്കുന്ന 4 ഘട്ടങ്ങൾ:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {UNIT_STEPS.map((st) => (
                <p
                  key={st}
                  className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200"
                >
                  {st}
                </p>
              ))}
            </div>
          </div>
        </div>
        </GameFullscreenShell>
      )}

      {/* TAB 4: BUBBLE POP NEWSROOM */}
      {activeTab === 'newsroom' && (
        <GameFullscreenShell
          title="📰 ന്യൂസ്‌റൂം & മിനിറ്റ്സ് സ്റ്റുഡിയോ"
          subtitle="ബബിൾ പൊട്ടിക്കൽ, യോഗ മിനിറ്റ്സ്, പത്രക്കുറിപ്പ്, AI ക്രമം എന്നിവ പൂർത്തിയാക്കൂ"
        >
        <div className="relative space-y-4">
          <GlitterBurstOverlay triggerKey={glitterKey} label={glitterMsg} />
          <AnimatePresence mode="wait">
            {newsMsg && (
              <motion.div
                key={newsMsg.text}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-xl border text-xs sm:text-sm font-bold ${
                  newsMsg.ok
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                {newsMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          {newsFailed && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-rose-900">💥 ന്യൂസ്‌റൂം ക്രമം 3 തവണ തെറ്റി!</p>
                <p className="text-xs font-semibold text-rose-800">
                  മിനിറ്റ്സും പത്രക്കുറിപ്പും കൃത്യമായ ക്രമത്തിൽ അടുക്കാൻ വീണ്ടും ശ്രമിക്കാം!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setNewsMistakes(0);
                  setMinutesPicked([]);
                  setPressPicked([]);
                  setAiPicked([]);
                  setNewsMsg(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold border-b-4 border-amber-700"
              >
                🔄 വീണ്ടും ശ്രമിക്കാം
              </button>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-extrabold">📰 വാർത്താ റിപ്പോർട്ടിംഗ് സ്റ്റുഡിയോ (5W &amp; 1H) — ഓരോ ടാസ്ക്കായി പൂർത്തിയാക്കൂ:</p>
              <p>
                പത്രക്കുറിപ്പിലും റിപ്പോർട്ടിലും{' '}
                <strong>എന്ത്, ആര്, എപ്പോൾ, എവിടെ, എന്തുകൊണ്ട്, എങ്ങനെ</strong>{' '}
                എന്നീ 6 വസ്തുതകൾ മതി!
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { idx: 0 as const, label: `1. ബബിൾ പൊട്ടിക്കൽ (${erasedHypes.length}/3)` },
                {
                  idx: 1 as const,
                  label: `2. മിനിറ്റ്സ് (${minutesPicked.length}/${MINUTES_ORDER_CORRECT.length})`,
                },
                {
                  idx: 2 as const,
                  label: `3. പത്രക്കുറിപ്പ് (${pressPicked.length}/${PRESS_RELEASE_ORDER_CORRECT.length})`,
                },
                {
                  idx: 3 as const,
                  label: `4. AI ക്രമം (${aiPicked.length}/${AI_WORKFLOW_CORRECT.length})`,
                },
              ].map((st) => (
                <button
                  key={st.idx}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setNewsStage(st.idx);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all ${
                    newsStage === st.idx
                      ? 'bg-emerald-800 text-white border-emerald-950'
                      : 'bg-white text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {newsStage === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eraser className="w-5 h-5 text-red-900" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  🫧 അതിശയോക്തി ബബിളുകൾ പൊട്ടിക്കൂ! ({erasedHypes.length}/3)
                </h3>
              </div>
              {erasedHypes.length === 3 && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setNewsStage(1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-extrabold"
                >
                  അടുത്തത്: 🚂 മിനിറ്റ്സ് ട്രെയിൻ →
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm sm:text-base leading-loose text-slate-800 flex flex-wrap items-center gap-2">
              {[
                { idx: 0, text: '🫧 “ചരിത്രത്തിൽ സമാനതകളില്ലാത്ത' },
                { idx: 1, text: '🫧 അത്യപൂർവ്വ മഹാസംഗമം' },
                { idx: 2, text: '🫧 ആകാശം മുട്ടുന്ന ആവേശത്തോടെ”' },
              ].map((h) => {
                const erased = erasedHypes.includes(h.idx);
                return (
                  <button
                    key={h.idx}
                    type="button"
                    disabled={erased}
                    onClick={() => {
                      sound.playPop();
                      const next = [...erasedHypes, h.idx];
                      setErasedHypes(next);
                      if (next.length === 3) {
                        sound.playSuccess();
                        onAwardXp(30, 'l3_hype_erased');
                        setNewsMsg({
                          ok: true,
                          text: '💥 ബബിളുകൾ പൊട്ടി! വസ്തുതാപരമായ വാർത്താ തലക്കെട്ട് തെളിഞ്ഞു (+30 XP)!',
                        });
                        triggerGlitter('💥 അതിശയോക്തി പൊട്ടിച്ചു! +30 XP');
                        narrator.speak('വളരെ ശരി! മനുഷ്യജാലിക ജനുവരി 26-ന് വടകരയിൽ നടക്കും എന്ന വസ്തുത മാത്രം മതി!');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full border-2 text-xs sm:text-sm font-bold transition-all ${
                      erased
                        ? 'line-through bg-slate-200 text-slate-400 border-slate-200 scale-90'
                        : 'bg-red-100 text-red-900 border-red-400 hover:bg-red-200 animate-float-bob cursor-pointer'
                    }`}
                  >
                    {erased ? '💥 പൊട്ടി!' : h.text}
                  </button>
                );
              })}
              <span className="font-extrabold text-emerald-900">
                → ✅ മനുഷ്യജാലിക ജനുവരി 26-ന് വടകരയിൽ നടക്കും: SKSSF
              </span>
            </div>
          </div>
          )}

          {newsStage === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  🚂 യോഗ മിനിറ്റ്സ് ട്രെയിൻ (1 മുതൽ 6)
                </h4>
                <button
                  type="button"
                  onClick={() => setMinutesPicked([])}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <div className="min-h-[84px] p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1">
                {minutesPicked.length === 0 && (
                  <p className="text-xs text-slate-400">ശരിയായ ക്രമത്തിൽ ബോഗികൾ ചേരും...</p>
                )}
                {minutesPicked.map((m, i) => (
                  <p key={m} className="text-xs font-bold text-emerald-950">
                    {i + 1}. {m}
                  </p>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  MINUTES_ORDER_CORRECT[3],
                  MINUTES_ORDER_CORRECT[0],
                  MINUTES_ORDER_CORRECT[5],
                  MINUTES_ORDER_CORRECT[1],
                  MINUTES_ORDER_CORRECT[4],
                  MINUTES_ORDER_CORRECT[2],
                ]
                  .filter((item) => !minutesPicked.includes(item))
                  .map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        handleSnapNextBlock(
                          MINUTES_ORDER_CORRECT,
                          minutesPicked,
                          setMinutesPicked,
                          item,
                          'l3_min_snap'
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-700 hover:text-white text-xs font-semibold text-slate-800 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
              </div>
              {minutesPicked.length === MINUTES_ORDER_CORRECT.length && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setNewsStage(2);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-extrabold"
                  >
                    അടുത്തത്: 📰 പത്രക്കുറിപ്പ് ക്രമം →
                  </button>
                </div>
              )}
            </div>
          )}

          {newsStage === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  📰 പത്രക്കുറിപ്പ് ക്രമം (1 മുതൽ 4)
                </h4>
                <button
                  type="button"
                  onClick={() => setPressPicked([])}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <div className="min-h-[84px] p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1">
                {pressPicked.length === 0 && (
                  <p className="text-xs text-slate-400">ആദ്യം വാർത്ത, പിന്നെ വിശദീകരണം...</p>
                )}
                {pressPicked.map((m, i) => (
                  <p key={m} className="text-xs font-bold text-emerald-950">
                    {i + 1}. {m}
                  </p>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  PRESS_RELEASE_ORDER_CORRECT[2],
                  PRESS_RELEASE_ORDER_CORRECT[0],
                  PRESS_RELEASE_ORDER_CORRECT[3],
                  PRESS_RELEASE_ORDER_CORRECT[1],
                ]
                  .filter((item) => !pressPicked.includes(item))
                  .map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        handleSnapNextBlock(
                          PRESS_RELEASE_ORDER_CORRECT,
                          pressPicked,
                          setPressPicked,
                          item,
                          'l3_press_snap'
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-700 hover:text-white text-xs font-semibold text-slate-800 transition-colors text-left"
                    >
                      {item}
                    </button>
                  ))}
              </div>
              {pressPicked.length === PRESS_RELEASE_ORDER_CORRECT.length && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setNewsStage(3);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-extrabold"
                  >
                    അടുത്തത്: 🤖 AI 6 ഘട്ടങ്ങൾ →
                  </button>
                </div>
              )}
            </div>
          )}

          {newsStage === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  🤖 AI 6 ഘട്ടങ്ങൾ (വ്യാജ കോട്ട് ഇടരുത്!)
                </h4>
                <button
                  type="button"
                  onClick={() => setAiPicked([])}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <div className="min-h-[84px] p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex flex-wrap gap-1.5 items-start">
                {aiPicked.length === 0 && (
                  <p className="text-xs text-slate-400">1. Draft മുതൽ 6. Publish വരെ...</p>
                )}
                {aiPicked.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 rounded bg-emerald-700 text-white text-xs font-bold"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  AI_WORKFLOW_CORRECT[3],
                  AI_WORKFLOW_CORRECT[0],
                  AI_WORKFLOW_CORRECT[5],
                  AI_WORKFLOW_CORRECT[1],
                  AI_WORKFLOW_CORRECT[4],
                  AI_WORKFLOW_CORRECT[2],
                ]
                  .filter((item) => !aiPicked.includes(item))
                  .map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        handleSnapNextBlock(
                          AI_WORKFLOW_CORRECT,
                          aiPicked,
                          setAiPicked,
                          item,
                          'l3_ai_snap'
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-700 hover:text-white text-xs font-semibold text-slate-800 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
        </GameFullscreenShell>
      )}

      {activeTab === 'unit_desks' && (
        <CollapsibleLessonDrawer
          key="l3-drawer-unit-desks"
          emoji="📋"
          title="യൂണിറ്റ് ഓഫീസും ഭാരവാഹി ചുമതലകളും · പാഠം"
          badgeText="ഓഫീസ് അച്ചടക്കം"
          onSpeak={() =>
            narrator.speak(
              'ഒരു യൂണിറ്റ് കമ്മിറ്റിയിൽ പ്രസിഡന്റ്, ജനറൽ സെക്രട്ടറി, ട്രഷറർ എന്നിവർക്ക് കൃത്യമായ ചുമതലകളുണ്ട്. യോഗ തീരുമാനങ്ങൾ മിനിറ്റ്സ് ബുക്കിൽ എഴുതി ഒപ്പുവെക്കുന്നതും വരവ്-ചെലവ് കണക്കുകൾ സുതാര്യമായി സൂക്ഷിക്കുന്നതും സംഘടനാ വിശ്വാസ്യത വർദ്ധിപ്പിക്കുന്നു.',
              '📋 യൂണിറ്റ് ഓഫീസ് ചുമതലകൾ'
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <p className="text-xs sm:text-sm font-extrabold text-amber-950">👑 പ്രസിഡന്റ്</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                യോഗങ്ങളിൽ അധ്യക്ഷത വഹിക്കുക, എല്ലാവരെയും ഒന്നിച്ച് കൊണ്ടുപോകുക, മിനിറ്റ്സ് ഒപ്പുവെച്ച് അംഗീകരിക്കുക.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <p className="text-xs sm:text-sm font-extrabold text-emerald-950">📝 ജനറൽ സെക്രട്ടറി</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                യോഗം വിളിച്ചുചേർക്കുക, മിനിറ്റ്സ് ബുക്കും അംഗത്വ രജിസ്റ്ററും സൂക്ഷിക്കുക, മേൽകമ്മിറ്റി സർക്കുലറുകൾ നടപ്പാക്കുക.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
              <p className="text-xs sm:text-sm font-extrabold text-sky-950">💰 ട്രഷറർ</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                വരവ്-ചെലവ്-നീക്കിയിരിപ്പ് കണക്കുകളും രസീതുകളും കൃത്യമായി സൂക്ഷിച്ച് ഓരോ യോഗത്തിലും അവതരിപ്പിക്കുക.
              </p>
            </div>
          </div>
        </CollapsibleLessonDrawer>
      )}

      {activeTab === 'newsroom' && (
        <CollapsibleLessonDrawer
          key="l3-drawer-newsroom"
          emoji="📰"
          title="മാധ്യമ & വാർത്താ പരിശീലനം · പാഠം"
          badgeText="മീഡിയ അദബ്"
          onSpeak={() =>
            narrator.speak(
              'പരിപാടികളുടെ വാർത്തകളും പ്രസ്താവനകളും തയ്യാറാക്കുമ്പോൾ സത്യസന്ധത, കൃത്യത, മാന്യമായ ഭാഷ എന്നിവ നിർബന്ധമാണ്. വസ്തുതകൾ ഉറപ്പുവരുത്തി മാത്രം വാർത്തകൾ പങ്കുവെക്കുക.',
              '📰 മാധ്യമ പരിശീലനം'
            )
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <p className="text-xs sm:text-sm font-extrabold text-emerald-950">✅ സത്യസന്ധതയും കൃത്യതയും</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                തീയതി, സ്ഥലം, അതിഥികളുടെ പേരുകൾ, പരിപാടിയുടെ ലക്ഷ്യം എന്നിവ തെറ്റില്ലാതെ പരിശോധിച്ച് മാത്രമേ വാർത്തയും പോസ്റ്ററും പുറത്തുവിടാവൂ.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <p className="text-xs sm:text-sm font-extrabold text-amber-950">🎙️ മാന്യമായ ഭാഷയും ഉത്തരവാദിത്തവും</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                അതിശയോക്തികളും പ്രകോപനങ്ങളും ഒഴിവാക്കി, സമൂഹത്തിന് നന്മയും പ്രചോദനവും പകരുന്ന മാന്യമായ ഭാഷയാണ് നല്ല മാധ്യമ പ്രവർത്തനത്തിന്റെ അടയാളം.
              </p>
            </div>
          </div>
        </CollapsibleLessonDrawer>
      )}

      {(activeTab === 'unit_desks' || activeTab === 'newsroom') && (
        <LessonCheckQuiz
          lessonId={`l3_${activeTab}`}
          savedAnswer={quizAnswers[`l3_${activeTab}`]}
          onAnswered={(lessonId, selectedIdx, isCorrect) => {
            onQuizAnswered(lessonId, selectedIdx, isCorrect);
            onMarkLessonCompleted?.(lessonId);
          }}
          onNextLesson={handleAdvanceL3Tab}
          nextLessonLabel={!isLastL3Tab ? 'അടുത്ത പാഠം ➡️' : 'സ്റ്റേറ്റ് & ഗ്ലോബൽ തലം ➡️'}
        />
      )}

      {/* 4. NAVIGATION & MAP STRICTLY BELOW LESSON */}
      <LessonStepperNav
        stepLabel={`ഘട്ടം 3 · ജില്ലാ തലം · പാഠം ${activeL3Idx + 1} / ${l3Tabs.length}: ${l3Tabs[activeL3Idx]?.label || ''}`}
        statusHint={
          !l3StepUnlocked
            ? 'മുകളിലെ ക്വിസിന് ഉത്തരം നൽകിയാൽ അടുത്ത പാഠം തുറക്കും!'
            : undefined
        }
        currentStep={activeL3Idx}
        totalSteps={l3Tabs.length}
        prevLabel={activeL3Idx > 0 ? l3Tabs[activeL3Idx - 1].label : undefined}
        onPrev={activeL3Idx > 0 ? () => setActiveTab(l3Tabs[activeL3Idx - 1].id) : undefined}
        nextLabel={!isLastL3Tab ? l3Tabs[activeL3Idx + 1].label : 'സ്റ്റേറ്റ് & ഗ്ലോബൽ തലം'}
        nextIsWorldAdvance={isLastL3Tab}
        nextDisabled={!l3StepUnlocked}
        onNext={handleAdvanceL3Tab}
      />

      <LessonProgressTrack
        stageTitle="ഘട്ടം 3 · ജില്ലാ തലം"
        stageSubtitle="ആദർശ കവചം, ജ്ഞാനച്ചുരുൾ, ഓഫീസ് ഡെസ്ക് & ന്യൂസ്‌റൂം"
        items={trackItems}
        activeId={activeTab}
        completedLessonIds={completedLessonIds}
        devUnlocked={devUnlocked}
        onSelectCompleted={(id) => setActiveTab(id as L3Tab)}
      />
    </section>
  );
};
