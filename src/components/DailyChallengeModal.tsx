import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Gamepad2,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import {
  DAILY_MISSIONS,
  DailyAndProfileState,
  getLocalDateKey,
} from '../utils/gameStorage';
import { sound } from '../utils/sound';

export interface DailySpecialGameMeta {
  dayIndex: number; // 0 = Sun ... 6 = Sat
  shortDay: string;
  dayName: string;
  emoji: string;
  title: string;
  tagline: string;
  type: 'speed_quiz' | 'year_match' | 'wing_match' | 'true_false' | 'hierarchy' | 'friday_scholar' | 'memory';
}

export const DAILY_SPECIAL_GAMES: DailySpecialGameMeta[] = [
  {
    dayIndex: 0,
    shortDay: 'ഞാ',
    dayName: 'ഞായർ',
    emoji: '⚡',
    title: 'സ്പീഡ് ഫ്ലാഷ് ക്വിസ്',
    tagline: '60 സെക്കൻഡിൽ 5 വേഗതയേറിയ SKSSF ചോദ്യങ്ങൾ',
    type: 'speed_quiz',
  },
  {
    dayIndex: 1,
    shortDay: 'തി',
    dayName: 'തിങ്കൾ',
    emoji: '📅',
    title: 'ചരിത്ര വർഷ പൊരുത്തം',
    tagline: 'സമസ്തയുടെയും SKSSF-ന്റെയും പ്രധാന വർഷങ്ങൾ പൊരുത്തപ്പെടുത്താം',
    type: 'year_match',
  },
  {
    dayIndex: 2,
    shortDay: 'ചൊ',
    dayName: 'ചൊവ്വ',
    emoji: '🧩',
    title: 'ഉപവിഭാഗ ദൗത്യ വേട്ട',
    tagline: 'ഓരോ സേവന സാഹചര്യത്തിനും ശരിയായ ഉപവിഭാഗം കണ്ടെത്താം',
    type: 'wing_match',
  },
  {
    dayIndex: 3,
    shortDay: 'ബു',
    dayName: 'ബുധൻ',
    emoji: '✅',
    title: 'ശരിയോ തെറ്റോ ബ്ലിറ്റ്‌സ്',
    tagline: 'സംഘടനാ വസ്തുതകൾ ശരിയോ തെറ്റോ എന്ന് വേഗം തിരിച്ചറിയാം',
    type: 'true_false',
  },
  {
    dayIndex: 4,
    shortDay: 'വ്യാ',
    dayName: 'വ്യാഴം',
    emoji: '🏛️',
    title: 'ഘടനാ പിരമിഡ് ക്രമീകരണം',
    tagline: 'യൂണിറ്റ് മുതൽ ദേശീയ/ഗ്ലോബൽ തലം വരെ ശരിയായ ക്രമത്തിൽ അടുക്കാം',
    type: 'hierarchy',
  },
  {
    dayIndex: 5,
    shortDay: 'വെ',
    dayName: 'വെള്ളി',
    emoji: '🕌',
    title: 'ജുമുഅ വിജ്ഞാന സ്പെഷ്യൽ',
    tagline: 'സമസ്തയുടെ മഹത്തുക്കളെയും ആദർശ മൂല്യങ്ങളെയും അറിയാം',
    type: 'friday_scholar',
  },
  {
    dayIndex: 6,
    shortDay: 'ശ',
    dayName: 'ശനി',
    emoji: '🃏',
    title: 'SKSSF മെമ്മറി ഫ്ലിപ്പ്',
    tagline: 'സമാനമായ 6 ജോഡി കാർഡുകൾ ഓർമ്മശക്തി ഉപയോഗിച്ച് കണ്ടെത്താം',
    type: 'memory',
  },
];

export function getTodaySpecialGame(): DailySpecialGameMeta {
  const idx = new Date().getDay();
  return DAILY_SPECIAL_GAMES[idx] || DAILY_SPECIAL_GAMES[0];
}

export function getStreakTierInfo(streakDays: number) {
  if (streakDays >= 30) {
    return { label: '👑 റോയൽ സ്ട്രീക്ക്', nextTarget: null, color: 'text-amber-800 bg-amber-100 border-amber-300' };
  }
  if (streakDays >= 14) {
    return { label: '🥇 ഗോൾഡ് സ്ട്രീക്ക്', nextTarget: 30, color: 'text-yellow-900 bg-yellow-100 border-yellow-300' };
  }
  if (streakDays >= 7) {
    return { label: '🥈 സിൽവർ സ്ട്രീക്ക്', nextTarget: 14, color: 'text-slate-800 bg-slate-100 border-slate-300' };
  }
  if (streakDays >= 3) {
    return { label: '🥉 വെങ്കല സ്ട്രീക്ക്', nextTarget: 7, color: 'text-orange-900 bg-orange-100 border-orange-300' };
  }
  return { label: '🔥 തുടക്ക സ്ട്രീക്ക്', nextTarget: 3, color: 'text-emerald-900 bg-emerald-100 border-emerald-300' };
}

interface McqItem {
  q: string;
  options: string[];
  correct: number;
  note: string;
}

const SPEED_QUIZ_ITEMS: McqItem[] = [
  {
    q: 'SKSSF രൂപീകൃതമായ തീയതി ഏത്?',
    options: ['1989 ഫെബ്രുവരി 19', '1926 ജൂൺ 26', '1951 സെപ്റ്റംബർ 17', '1995 ജനുവരി 10'],
    correct: 0,
    note: '1989 ഫെബ്രുവരി 19-ന് കോഴിക്കോട് സാമൂതിരി ഹൈസ്കൂളിൽ വെച്ചാണ് SKSSF രൂപീകൃതമായത്.',
  },
  {
    q: 'SKSSF-ന്റെ ഔദ്യോഗിക മുദ്രാവാക്യം ഏത്?',
    options: [
      'വിജ്ഞാനം · വിനയം · സേവനം',
      'പഠനം · പോരാട്ടം · വിജയം',
      'സേവനം · സമത്വം · സമാധാനം',
      'ഐക്യം · ശക്തി · പുരോഗതി',
    ],
    correct: 0,
    note: 'വിജ്ഞാനം, വിനയം, സേവനം എന്നതാണ് SKSSF-ന്റെ ആദർശ മുദ്രാവാക്യം.',
  },
  {
    q: 'SKSSF പതാകയിലെ മൂന്ന് നിറങ്ങൾ ഏവ?',
    options: [
      'നീല, വെള്ള, പച്ച',
      'ചുവപ്പ്, വെള്ള, പച്ച',
      'മഞ്ഞ, വെള്ള, പച്ച',
      'നീല, മഞ്ഞ, പച്ച',
    ],
    correct: 0,
    note: 'മുകളിൽ ഇടത് മൂലയിൽ നീല ഭാഗവും ചന്ദ്രക്കല-നക്ഷത്രവും, വലതുഭാഗത്ത് വെള്ളയിൽ മസ്ജിദും, താഴെ പച്ച പട്ടയുമാണ് SKSSF പതാകയുടെ രൂപകൽപ്പന.',
  },
  {
    q: 'ദുരിതാശ്വാസത്തിനും സന്നദ്ധ സേവനത്തിനുമുള്ള SKSSF വിഭാഗം ഏത്?',
    options: ['വിഖായ (Viqaya)', 'ട്രെൻഡ് (Trend)', 'സർഗലയം', 'ഇബാദ്'],
    correct: 0,
    note: 'സന്നദ്ധ സേവനത്തിനും ദുരന്തനിവാരണത്തിനുമായി പ്രവർത്തിക്കുന്ന വിഭാഗമാണ് വിഖായ.',
  },
  {
    q: 'SKSSF-ന്റെ ഔദ്യോഗിക മുഖപത്രം ഏതാണ്?',
    options: ['സത്യധാര', 'സുന്നി അഫ്കാർ', 'കുടുംബം', 'സുപ്രഭാതം'],
    correct: 0,
    note: 'സത്യധാരയാണ് SKSSF-ന്റെ ഔദ്യോഗിക പ്രസിദ്ധീകരണം.',
  },
];

const WING_SCENARIO_ITEMS: McqItem[] = [
  {
    q: 'പ്രളയബാധിത പ്രദേശത്ത് വീടുകൾ വൃത്തിയാക്കാനും രക്ഷാപ്രവർത്തനത്തിനും ഇറങ്ങുന്ന ഉപവിഭാഗം?',
    options: ['വിഖായ (Viqaya)', 'ട്രെൻഡ് (Trend)', 'സർഗലയം', 'സൈബർ വിങ്'],
    correct: 0,
    note: 'വിഖായ വളണ്ടിയർമാരാണ് ദുരിതാശ്വാസ-സേവന രംഗത്ത് സജീവമായി പ്രവർത്തിക്കുന്നത്.',
  },
  {
    q: 'വിദ്യാർത്ഥികൾക്ക് കരിയർ ഗൈഡൻസും സിവിൽ സർവീസ് പരിശീലനവും നൽകുന്ന വിഭാഗം?',
    options: ['ട്രെൻഡ് (Trend)', 'സഹചാരി', 'ത്വലബ വിങ്', 'ഇബാദ്'],
    correct: 0,
    note: 'വിദ്യാഭ്യാസ-കരിയർ മാർഗ്ഗനിർദ്ദേശത്തിനായി പ്രവർത്തിക്കുന്ന വിഭാഗമാണ് ട്രെൻഡ്.',
  },
  {
    q: 'നിർധനരായ രോഗികൾക്ക് ചികിത്സാ സഹായവും രക്തദാന സേവനവും നൽകുന്ന വിഭാഗം?',
    options: ['സഹചാരി (Sahachari)', 'ക്യാമ്പസ് വിങ്', 'സൈബർ വിങ്', 'സർഗലയം'],
    correct: 0,
    note: 'ആരോഗ്യ-കാരുണ്യ സേവന രംഗത്തെ SKSSF-ന്റെ പ്രധാന സംവിധാനമാണ് സഹചാരി.',
  },
  {
    q: 'ഓൺലൈൻ വ്യാജപ്രചാരണങ്ങളെ പ്രതിരോധിക്കാനും ഡിജിറ്റൽ സാക്ഷരത വളർത്താനുമുള്ള വിഭാഗം?',
    options: ['സൈബർ വിങ് (Cyber Wing)', 'വിഖായ', 'ഇബാദ്', 'ട്രെൻഡ്'],
    correct: 0,
    note: 'ആരോഗ്യകരമായ ഡിജിറ്റൽ ഇടപെടലുകൾക്കും സൈബർ ബോധവൽക്കരണത്തിനുമാണ് സൈബർ വിങ്.',
  },
  {
    q: 'കലാ-സാഹിത്യ പ്രതിഭകളെ പ്രോത്സാഹിപ്പിക്കുകയും സർഗമേളകൾ സംഘടിപ്പിക്കുകയും ചെയ്യുന്ന വിഭാഗം?',
    options: ['സർഗലയം (Sargalayam)', 'സഹചാരി', 'വിഖായ', 'ത്വലബ വിങ്'],
    correct: 0,
    note: 'വിദ്യാർത്ഥികളുടെ കലാ-സാഹിത്യ കഴിവുകൾ വളർത്താനാണ് സർഗലയം പ്രവർത്തിക്കുന്നത്.',
  },
];

const FRIDAY_SCHOLAR_ITEMS: McqItem[] = [
  {
    q: '1926-ൽ സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമയുടെ സ്ഥാപക പ്രസിഡന്റ് ആരായിരുന്നു?',
    options: [
      'വരക്കൽ മുല്ലക്കോയ തങ്ങൾ (ന.മ.)',
      'ശംസുൽ ഉലമ ഇ.കെ അബൂബക്കർ മുസ്ലിയാർ (ന.മ.)',
      'കണ്ണിയത്ത് അഹമ്മദ് മുസ്ലിയാർ (ന.മ.)',
      'പാണക്കാട് ശിഹാബ് തങ്ങൾ (ന.മ.)',
    ],
    correct: 0,
    note: 'സയ്യിദ് അബ്ദുറഹ്മാൻ ബാഅലവി വരക്കൽ മുല്ലക്കോയ തങ്ങൾ (ന.മ.) ആണ് സമസ്തയുടെ സ്ഥാപക പ്രസിഡന്റ്.',
  },
  {
    q: 'സമസ്തയുടെ 1926 രൂപീകരണ യോഗത്തിൽ അധ്യക്ഷത വഹിച്ച മഹാൻ ആര്?',
    options: [
      'പാങ്ങിൽ അഹമ്മദ് കുട്ടി മുസ്ലിയാർ (ന.മ.)',
      'ചെറുശ്ശേരി സൈനുദ്ദീൻ മുസ്ലിയാർ (ന.മ.)',
      'കോട്ടുമല അബൂബക്കർ മുസ്ലിയാർ (ന.മ.)',
      'വാണിയമ്പലം അബ്ദുറഹ്മാൻ മുസ്ലിയാർ (ന.മ.)',
    ],
    correct: 0,
    note: 'പാങ്ങിൽ അഹമ്മദ് കുട്ടി മുസ്ലിയാർ (ന.മ.) ആയിരുന്നു 1926-ലെ ചരിത്ര സമ്മേളനത്തിന്റെ അധ്യക്ഷൻ.',
  },
  {
    q: '‘ശംസുൽ ഉലമ’ എന്ന അപരനാമത്തിൽ അറിയപ്പെടുന്ന സമസ്തയുടെ ദീർഘകാല ജനറൽ സെക്രട്ടറി?',
    options: [
      'ഇ.കെ അബൂബക്കർ മുസ്ലിയാർ (ന.മ.)',
      'കണ്ണിയത്ത് അഹമ്മദ് മുസ്ലിയാർ (ന.മ.)',
      'കെ.കെ അബൂബക്കർ ഹസ്രത്ത് (ന.മ.)',
      'പറവണ്ണ മുഹ്‌യിദ്ദീൻ കുട്ടി മുസ്ലിയാർ (ന.മ.)',
    ],
    correct: 0,
    note: '40 വർഷത്തോളം സമസ്തയെ നയിച്ച മഹാനാണ് ശംസുൽ ഉലമ ഇ.കെ അബൂബക്കർ മുസ്ലിയാർ (ന.മ.).',
  },
  {
    q: 'മദ്രസാ വിദ്യാഭ്യാസത്തിന് ഏകീകൃത സിലബസ് രൂപീകരിച്ച സമസ്തയുടെ ബോർഡ് ഏത് വർഷം സ്ഥാപിതമായി?',
    options: ['1951', '1926', '1934', '1989'],
    correct: 0,
    note: '1951 സെപ്റ്റംബർ 17-നാണ് സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡ് സ്ഥാപിതമായത്.',
  },
  {
    q: 'വിനയവും അറിവും സേവനവും ഒത്തുചേരുന്ന സംഘടനാ സംസ്കാരം പഠിപ്പിക്കുന്ന ആദർശ വാക്യം?',
    options: [
      'വിജ്ഞാനം · വിനയം · സേവനം',
      'ശക്തി · വേഗം · വിജയം',
      'സമ്പത്ത് · പ്രശസ്തി · അധികാരം',
      'തർക്കം · വാദം · ജയം',
    ],
    correct: 0,
    note: 'വിജ്ഞാനം, വിനയം, സേവനം എന്ന മൂന്ന് തൂണുകളിലാണ് SKSSF-ന്റെ പ്രവർത്തന ശൈലി.',
  },
];

const YEAR_MATCH_PAIRS = [
  { id: 'y1926', event: 'സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ രൂപീകരണം', year: '1926' },
  { id: 'y1934', event: 'സമസ്ത ഔദ്യോഗിക രജിസ്ട്രേഷൻ', year: '1934' },
  { id: 'y1951', event: 'സമസ്ത മദ്രസാ വിദ്യാഭ്യാസ ബോർഡ്', year: '1951' },
  { id: 'y1989', event: 'SKSSF രൂപീകരണം (ഫെബ്രുവരി 19)', year: '1989' },
  { id: 'y1997', event: 'സത്യധാര ദ്വൈവാരിക തുടക്കം', year: '1997' },
];

const TRUE_FALSE_ITEMS = [
  {
    statement: 'SKSSF രൂപീകൃതമായത് 1989 ഫെബ്രുവരി 19-ന് കോഴിക്കോട്ട് വെച്ചാണ്.',
    answer: true,
    note: 'ശരി! 1989 ഫെബ്രുവരി 19-ന് കോഴിക്കോട് സാമൂതിരി ഹൈസ്കൂളിലായിരുന്നു രൂപീകരണം.',
  },
  {
    statement: 'സമസ്തയുടെ പതാകയിൽ ചുവപ്പ്, വെള്ള, പച്ച എന്നീ നിറങ്ങളാണ് ഉള്ളത്.',
    answer: true,
    note: 'ശരി! മുകളിൽ ഇടത് മൂലയിൽ ചുവപ്പ് ഭാഗവും ചന്ദ്രക്കല-നക്ഷത്രവും, വലതുഭാഗത്ത് വെള്ളയിൽ മസ്ജിദും, താഴെ പച്ച പട്ടയുമാണ് സമസ്ത പതാക.',
  },
  {
    statement: 'വിഖായ എന്നത് SKSSF-ന്റെ കലാ-സാഹിത്യ ഉപവിഭാഗത്തിന്റെ പേരാണ്.',
    answer: false,
    note: 'തെറ്റ്! വിഖായ ദുരിതാശ്വാസ-സന്നദ്ധ സേവന വിഭാഗമാണ്; കലാ-സാഹിത്യ വിഭാഗം സർഗലയമാണ്.',
  },
  {
    statement: 'SKSSF-ന്റെ പ്രാഥമിക സംഘടനാ ഘടകം യൂണിറ്റ് (Unit) ആണ്.',
    answer: true,
    note: 'ശരി! യൂണിറ്റിൽ തുടങ്ങി ക്ലസ്റ്റർ, മേഖല, ജില്ല, സംസ്ഥാനം, ദേശീയ/ഗ്ലോബൽ തലം എന്നിങ്ങനെയാണ് ഘടന.',
  },
  {
    statement: 'സമസ്ത മദ്രസാ വിദ്യാഭ്യാസ ബോർഡ് സ്ഥാപിതമായത് 1989-ലാണ്.',
    answer: false,
    note: 'തെറ്റ്! മദ്രസാ ബോർഡ് 1951-ലാണ് സ്ഥാപിതമായത്; 1989-ൽ SKSSF ആണ് രൂപീകൃതമായത്.',
  },
  {
    statement: 'വിദ്യാർത്ഥികൾക്ക് കരിയർ ഗൈഡൻസ് നൽകുന്ന SKSSF ഉപവിഭാഗമാണ് ട്രെൻഡ് (Trend).',
    answer: true,
    note: 'ശരി! ട്രെൻഡ് വിദ്യാഭ്യാസ-കരിയർ മാർഗ്ഗനിർദ്ദേശത്തിനായി പ്രവർത്തിക്കുന്നു.',
  },
];

const HIERARCHY_TARGET = [
  { id: 'unit', label: '1. യൂണിറ്റ് കമ്മിറ്റി', hint: 'പ്രാദേശിക മഹല്ല് / ശാഖാ തലം' },
  { id: 'cluster', label: '2. ക്ലസ്റ്റർ കമ്മിറ്റി', hint: 'സമീപ യൂണിറ്റുകളുടെ ഏകോപനം' },
  { id: 'mekhala', label: '3. മേഖലാ കമ്മിറ്റി', hint: 'ക്ലസ്റ്ററുകളെ നയിക്കുന്ന തലം' },
  { id: 'district', label: '4. ജില്ലാ കമ്മിറ്റി', hint: 'ജില്ലാതല ഏകോപനം' },
  { id: 'state', label: '5. സംസ്ഥാന കമ്മിറ്റി', hint: 'സംസ്ഥാനതല നേതൃത്വം' },
  { id: 'national_global', label: '6. ദേശീയ / ഗ്ലോബൽ കമ്മിറ്റി', hint: 'ദേശീയ-അന്താരാഷ്ട്ര തല ഏകോപനം' },
];

const MEMORY_CARDS_SOURCE = [
  { pairId: 'skssf', label: 'SKSSF', sub: '1989' },
  { pairId: 'samastha', label: 'സമസ്ത', sub: '1926' },
  { pairId: 'viqaya', label: 'വിഖായ', sub: 'സേവനം' },
  { pairId: 'trend', label: 'ട്രെൻഡ്', sub: 'കരിയർ' },
  { pairId: 'sathyadhara', label: 'സത്യധാര', sub: 'മുഖപത്രം' },
  { pairId: 'sahachari', label: 'സഹചാരി', sub: 'കാരുണ്യം' },
];

function buildShuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleMcqItems(items: McqItem[]): McqItem[] {
  return items.map((item) => {
    const tagged = item.options.map((text, idx) => ({
      text,
      isCorrect: idx === item.correct,
    }));
    const shuffled = buildShuffled(tagged);
    const newCorrect = Math.max(
      0,
      shuffled.findIndex((entry) => entry.isCorrect)
    );
    return {
      ...item,
      options: shuffled.map((entry) => entry.text),
      correct: newCorrect,
    };
  });
}

export interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyState: DailyAndProfileState;
  onCompleteSpecialGame: (score: number, maxScore: number, isTodayOfficial: boolean) => void;
  onClaimMission: (missionId: string, rewardXp: number) => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  dailyState,
  onCompleteSpecialGame,
  onClaimMission,
}) => {
  const todayGame = getTodaySpecialGame();
  const [activeDayIdx, setActiveDayIdx] = useState<number>(todayGame.dayIndex);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [finalResult, setFinalResult] = useState<{ score: number; maxScore: number } | null>(null);

  // MCQ / Speed / Wing / Friday state
  const [shuffledMcqList, setShuffledMcqList] = useState<McqItem[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);

  // Tracked timeouts so tab switches / restarts / closes never leak stale callbacks
  const timersRef = useRef<number[]>([]);
  const clearAllTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };
  const scheduleTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
  };

  // Year Match state
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [matchedYearIds, setMatchedYearIds] = useState<string[]>([]);
  const [yearWrongFlash, setYearWrongFlash] = useState<string | null>(null);
  const [shuffledYears, setShuffledYears] = useState<typeof YEAR_MATCH_PAIRS>([]);

  // True/False state
  const [tfIdx, setTfIdx] = useState(0);
  const [tfPicked, setTfPicked] = useState<boolean | null>(null);

  // Hierarchy puzzle state
  const [hierarchyPool, setHierarchyPool] = useState<typeof HIERARCHY_TARGET>([]);
  const [hierarchyBuilt, setHierarchyBuilt] = useState<typeof HIERARCHY_TARGET>([]);
  const [hierarchyError, setHierarchyError] = useState<string | null>(null);

  // Memory Flip state
  const [memCards, setMemCards] = useState<
    { uid: string; pairId: string; label: string; sub: string; flipped: boolean; matched: boolean }[]
  >([]);
  const [memOpenUids, setMemOpenUids] = useState<string[]>([]);
  const [memMoves, setMemMoves] = useState(0);

  const selectedGame = DAILY_SPECIAL_GAMES[activeDayIdx] || todayGame;
  const isTodayOfficial = activeDayIdx === todayGame.dayIndex;

  useEffect(() => {
    clearAllTimers();
    if (isOpen) {
      setActiveDayIdx(getTodaySpecialGame().dayIndex);
      setPhase('ready');
      setFinalResult(null);
    }
    return () => {
      clearAllTimers();
    };
  }, [isOpen]);

  // Countdown timer for Sunday Speed Flash Quiz
  useEffect(() => {
    if (!isOpen || phase !== 'playing' || selectedGame.type !== 'speed_quiz') return;
    if (timeLeft <= 0) {
      finishGame(score, SPEED_QUIZ_ITEMS.length);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, phase, selectedGame.type, timeLeft]);

  const last7Days = useMemo(() => {
    const activeSet = new Set(dailyState.streakHistoryDates || [dailyState.todayDate]);
    const gameSet = new Set(dailyState.completedDailyGameDates || []);
    const weekdayLabels = ['ഞാ', 'തി', 'ചൊ', 'ബു', 'വ്യാ', 'വെ', 'ശ'];
    const days: {
      key: string;
      shortDay: string;
      dayNum: number;
      isToday: boolean;
      active: boolean;
      gameDone: boolean;
    }[] = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      const key = getLocalDateKey(d);
      days.push({
        key,
        shortDay: weekdayLabels[d.getDay()],
        dayNum: d.getDate(),
        isToday: offset === 0,
        active: activeSet.has(key) || offset === 0,
        gameDone: gameSet.has(key),
      });
    }
    return days;
  }, [dailyState.streakHistoryDates, dailyState.completedDailyGameDates, dailyState.todayDate]);

  if (!isOpen) return null;

  const streakTier = getStreakTierInfo(dailyState.streakDays);

  const startSelectedGame = () => {
    clearAllTimers();
    sound.unlockAudio();
    sound.playPop();
    setPhase('playing');
    setFinalResult(null);
    const sourceMcq =
      selectedGame.type === 'speed_quiz'
        ? SPEED_QUIZ_ITEMS
        : selectedGame.type === 'wing_match'
        ? WING_SCENARIO_ITEMS
        : FRIDAY_SCHOLAR_ITEMS;
    setShuffledMcqList(shuffleMcqItems(sourceMcq));
    setQIdx(0);
    setScore(0);
    setSelectedOpt(null);
    setTimeLeft(60);

    setSelectedEventId(null);
    setMatchedYearIds([]);
    setYearWrongFlash(null);
    setShuffledYears(buildShuffled(YEAR_MATCH_PAIRS));

    setTfIdx(0);
    setTfPicked(null);

    setHierarchyPool(buildShuffled(HIERARCHY_TARGET));
    setHierarchyBuilt([]);
    setHierarchyError(null);

    const deck = buildShuffled(
      MEMORY_CARDS_SOURCE.flatMap((item) => [
        { uid: `${item.pairId}_a`, ...item, flipped: false, matched: false },
        { uid: `${item.pairId}_b`, ...item, flipped: false, matched: false },
      ])
    );
    setMemCards(deck);
    setMemOpenUids([]);
    setMemMoves(0);
  };

  const finishGame = (earned: number, max: number) => {
    clearAllTimers();
    sound.playSuccess(3);
    setFinalResult({ score: earned, maxScore: max });
    setPhase('done');
    onCompleteSpecialGame(earned, max, isTodayOfficial);
  };

  const fallbackMcqList: McqItem[] =
    selectedGame.type === 'speed_quiz'
      ? SPEED_QUIZ_ITEMS
      : selectedGame.type === 'wing_match'
      ? WING_SCENARIO_ITEMS
      : FRIDAY_SCHOLAR_ITEMS;
  const activeMcqList: McqItem[] =
    shuffledMcqList.length > 0 ? shuffledMcqList : fallbackMcqList;

  const handleMcqAnswer = (idx: number) => {
    if (selectedOpt !== null) return;
    const item = activeMcqList[qIdx];
    const correct = idx === item.correct;
    setSelectedOpt(idx);
    const nextScore = correct ? score + 1 : score;
    if (correct) {
      sound.playSuccess(2);
      setScore(nextScore);
    } else {
      sound.playError();
    }
    scheduleTimer(() => {
      if (qIdx + 1 >= activeMcqList.length) {
        finishGame(nextScore, activeMcqList.length);
      } else {
        setQIdx((q) => q + 1);
        setSelectedOpt(null);
      }
    }, 1050);
  };

  const handleYearPick = (yearPairId: string) => {
    if (!selectedEventId || matchedYearIds.includes(yearPairId)) return;
    if (selectedEventId === yearPairId) {
      sound.playSuccess(2);
      const next = [...matchedYearIds, yearPairId];
      setMatchedYearIds(next);
      setSelectedEventId(null);
      setYearWrongFlash(null);
      if (next.length >= YEAR_MATCH_PAIRS.length) {
        scheduleTimer(() => finishGame(YEAR_MATCH_PAIRS.length, YEAR_MATCH_PAIRS.length), 350);
      }
    } else {
      sound.playError();
      setYearWrongFlash('ആ വർഷം പൊരുത്തപ്പെടുന്നില്ല — ഒരിക്കൽ കൂടി ശ്രമിക്കാം!');
    }
  };

  const handleTrueFalsePick = (choice: boolean) => {
    if (tfPicked !== null) return;
    const item = TRUE_FALSE_ITEMS[tfIdx];
    const correct = choice === item.answer;
    setTfPicked(choice);
    const nextScore = correct ? score + 1 : score;
    if (correct) {
      sound.playSuccess(2);
      setScore(nextScore);
    } else {
      sound.playError();
    }
    scheduleTimer(() => {
      if (tfIdx + 1 >= TRUE_FALSE_ITEMS.length) {
        finishGame(nextScore, TRUE_FALSE_ITEMS.length);
      } else {
        setTfIdx((i) => i + 1);
        setTfPicked(null);
      }
    }, 1050);
  };

  const handleHierarchyPick = (item: (typeof HIERARCHY_TARGET)[number]) => {
    const expected = HIERARCHY_TARGET[hierarchyBuilt.length];
    if (item.id === expected.id) {
      sound.playSuccess(2);
      const nextBuilt = [...hierarchyBuilt, item];
      setHierarchyBuilt(nextBuilt);
      setHierarchyPool((pool) => pool.filter((x) => x.id !== item.id));
      setHierarchyError(null);
      if (nextBuilt.length >= HIERARCHY_TARGET.length) {
        scheduleTimer(() => finishGame(HIERARCHY_TARGET.length, HIERARCHY_TARGET.length), 350);
      }
    } else {
      sound.playError();
      setHierarchyError(`അടുത്തത് "${expected.hint}" ആണ് — ശരിയായ ഘടകം തിരഞ്ഞെടുക്കൂ!`);
    }
  };

  const handleMemoryTap = (uid: string) => {
    if (memOpenUids.length >= 2) return;
    const target = memCards.find((c) => c.uid === uid);
    if (!target || target.flipped || target.matched) return;
    sound.playPop();

    const updated = memCards.map((c) => (c.uid === uid ? { ...c, flipped: true } : c));
    const nextOpen = [...memOpenUids, uid];
    setMemCards(updated);
    setMemOpenUids(nextOpen);

    if (nextOpen.length === 2) {
      setMemMoves((m) => m + 1);
      const [firstUid, secondUid] = nextOpen;
      const c1 = updated.find((c) => c.uid === firstUid)!;
      const c2 = updated.find((c) => c.uid === secondUid)!;
      if (c1.pairId === c2.pairId) {
        sound.playSuccess(2);
        const matchedDeck = updated.map((c) =>
          c.pairId === c1.pairId ? { ...c, matched: true } : c
        );
        setMemCards(matchedDeck);
        setMemOpenUids([]);
        if (matchedDeck.every((c) => c.matched)) {
          scheduleTimer(() => finishGame(MEMORY_CARDS_SOURCE.length, MEMORY_CARDS_SOURCE.length), 400);
        }
      } else {
        scheduleTimer(() => {
          setMemCards((prev) =>
            prev.map((c) =>
              c.uid === firstUid || c.uid === secondUid ? { ...c, flipped: false } : c
            )
          );
          setMemOpenUids([]);
        }, 700);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="പ്രതിദിന സ്ട്രീക്കും സ്പെഷ്യൽ ഗെയിമുകളും"
      onClick={() => {
        clearAllTimers();
        onClose();
      }}
    >
      <div
        className="bg-white rounded-3xl border-2 border-amber-300 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black text-slate-900 leading-tight">
                🔥 ദിന സ്ട്രീക്കും സ്പെഷ്യൽ ഗെയിമുകളും
              </h2>
              <p className="text-xs text-slate-600 leading-snug mt-0.5">
                ദിവസവും കളിച്ച് സ്ട്രീക്ക് നിലനിർത്തൂ · ഓരോ ദിവസവും വ്യത്യസ്ത സ്പെഷ്യൽ ഗെയിം!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="അടയ്ക്കുക"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streak Hero + 7-Day Calendar */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-white border border-amber-200 p-4 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-extrabold text-amber-800">{streakTier.label}</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums leading-tight mt-0.5">
                🔥 {dailyState.streakDays} ദിവസം തുടർച്ച
              </p>
              <p className="text-[11px] font-bold text-slate-600 tabular-nums mt-0.5">
                മികച്ച സ്ട്രീക്ക്: {dailyState.bestStreak} ദിവസം
                {streakTier.nextTarget
                  ? ` · അടുത്ത ലെവലിന് ${Math.max(1, streakTier.nextTarget - dailyState.streakDays)} ദിവസം കൂടി`
                  : ' · പരമോന്നത റോയൽ സ്ട്രീക്ക്!'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-extrabold text-emerald-800">
                {dailyState.todaySpecialGameDone ? '✅ ഇന്നത്തെ സ്പെഷ്യൽ ഗെയിം പൂർത്തിയാക്കി!' : '🎯 ഇന്നത്തെ സ്പെഷ്യൽ ഗെയിം കാത്തിരിക്കുന്നു'}
              </p>
              <p className="text-[11px] font-bold text-slate-500 tabular-nums mt-0.5">
                ഇന്ന്: +35 XP ബോണസ്
              </p>
            </div>
          </div>

          {/* 7-Day Activity Calendar Strip */}
          <div className="grid grid-cols-7 gap-1.5">
            {last7Days.map((day) => (
              <div
                key={day.key}
                className={`rounded-xl py-2 px-1 text-center border transition-colors ${
                  day.isToday
                    ? 'bg-amber-400/20 border-amber-500 text-slate-950'
                    : day.active
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <p className="text-[10px] font-extrabold">{day.shortDay}</p>
                <p className="text-xs font-black tabular-nums mt-0.5">
                  {day.gameDone ? '🏆' : day.active ? '🔥' : day.dayNum}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Rotating Special Games Selector */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>ഓരോ ദിവസത്തിനുമുള്ള 7 സ്പെഷ്യൽ ഗെയിമുകൾ</span>
            </p>
            <span className="text-[11px] font-bold text-emerald-700">
              ഇന്ന്: {todayGame.dayName} ({todayGame.emoji} {todayGame.title})
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DAILY_SPECIAL_GAMES.map((g) => {
              const isToday = g.dayIndex === todayGame.dayIndex;
              const isSelected = g.dayIndex === activeDayIdx;
              return (
                <button
                  key={g.dayIndex}
                  type="button"
                  onClick={() => {
                    clearAllTimers();
                    sound.playClick();
                    setActiveDayIdx(g.dayIndex);
                    setPhase('ready');
                    setFinalResult(null);
                  }}
                  className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : isToday
                      ? 'bg-amber-50 text-amber-950 border-amber-400 hover:bg-amber-100'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-[10px] font-extrabold">{g.shortDay}</p>
                  <p className="text-sm leading-none mt-1">{g.emoji}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Special Game Arena */}
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-4 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-extrabold text-emerald-800">
                {selectedGame.dayName} സ്പെഷ്യൽ · {isTodayOfficial ? 'ഔദ്യോഗിക ദിന ഗെയിം (+35 XP)' : 'പരിശീലന മോഡ്'}
              </p>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {selectedGame.emoji} {selectedGame.title}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">{selectedGame.tagline}</p>
            </div>
            {phase === 'playing' && selectedGame.type === 'speed_quiz' && (
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>

          {phase === 'ready' && (
            <div className="bg-white rounded-xl border border-emerald-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-700 leading-relaxed">
                {isTodayOfficial ? (
                  dailyState.todaySpecialGameDone ? (
                    <span className="font-bold text-emerald-800">
                      ✅ ഇന്നത്തെ സ്പെഷ്യൽ ഗെയിം നിങ്ങൾ ഇതിനകം ജയിച്ചു! വേണമെങ്കിൽ വീണ്ടും കളിച്ചു പരിശീലിക്കാം.
                    </span>
                  ) : (
                    <span>
                      ഇന്നത്തെ സ്പെഷ്യൽ ഗെയിം പൂർത്തിയാക്കിയാൽ <strong>+35 ബോണസ് XP</strong>-ഉം ഇന്നത്തെ <strong>🏆 സ്ട്രീക്ക് അടയാളവും</strong> ലഭിക്കും!
                    </span>
                  )
                ) : (
                  <span>
                    ഇത് <strong>{selectedGame.dayName}</strong> ദിവസത്തെ സ്പെഷ്യൽ ഗെയിം ആണ് — ഇപ്പോൾ പരിശീലനമായി കളിച്ചു നോക്കാം!
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={startSelectedGame}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black shadow-xs shrink-0 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>ഗെയിം തുടങ്ങാം</span>
              </button>
            </div>
          )}

          {/* PLAYING: MCQ (Speed Quiz / Wing Match / Friday Scholar) */}
          {phase === 'playing' &&
            (selectedGame.type === 'speed_quiz' ||
              selectedGame.type === 'wing_match' ||
              selectedGame.type === 'friday_scholar') && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 tabular-nums">
                  <span>
                    ചോദ്യം {qIdx + 1}/{activeMcqList.length}
                  </span>
                  <span className="text-emerald-700">സ്കോർ: {score}</span>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  {activeMcqList[qIdx].q}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeMcqList[qIdx].options.map((opt, idx) => {
                    const picked = selectedOpt === idx;
                    const isRight = idx === activeMcqList[qIdx].correct;
                    let cls =
                      'bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-900';
                    if (selectedOpt !== null) {
                      if (isRight) cls = 'bg-emerald-600 border-emerald-700 text-white';
                      else if (picked) cls = 'bg-rose-600 border-rose-700 text-white';
                      else cls = 'bg-slate-50 border-slate-200 text-slate-400';
                    }
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={selectedOpt !== null}
                        onClick={() => handleMcqAnswer(idx)}
                        className={`p-3 rounded-xl border-2 text-left text-xs sm:text-sm font-bold transition-colors cursor-pointer ${cls}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {selectedOpt !== null && (
                  <p className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    💡 {activeMcqList[qIdx].note}
                  </p>
                )}
              </div>
            )}

          {/* PLAYING: Year Match (Monday) */}
          {phase === 'playing' && selectedGame.type === 'year_match' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <p className="text-xs font-bold text-slate-600">
                ആദ്യം ഇടതുവശത്തെ ചരിത്ര സംഭവം തൊടുക, തുടർന്ന് അതിന്റെ ശരിയായ വർഷം തിരഞ്ഞെടുക്കുക ({matchedYearIds.length}/{YEAR_MATCH_PAIRS.length}):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7 space-y-2">
                  {YEAR_MATCH_PAIRS.map((pair) => {
                    const done = matchedYearIds.includes(pair.id);
                    const active = selectedEventId === pair.id;
                    return (
                      <button
                        key={pair.id}
                        type="button"
                        disabled={done}
                        onClick={() => {
                          sound.playClick();
                          setSelectedEventId(pair.id);
                          setYearWrongFlash(null);
                        }}
                        className={`w-full p-2.5 rounded-xl border-2 text-left text-xs font-extrabold transition-colors cursor-pointer ${
                          done
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 line-through opacity-75'
                            : active
                            ? 'bg-amber-100 border-amber-500 text-slate-950'
                            : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        {done ? '✅ ' : ''}
                        {pair.event}
                      </button>
                    );
                  })}
                </div>
                <div className="sm:col-span-5 grid grid-cols-2 sm:grid-cols-1 gap-2 content-start">
                  {shuffledYears.map((pair) => {
                    const done = matchedYearIds.includes(pair.id);
                    return (
                      <button
                        key={pair.id}
                        type="button"
                        disabled={done || !selectedEventId}
                        onClick={() => handleYearPick(pair.id)}
                        className={`p-2.5 rounded-xl border-2 text-center text-sm font-black tabular-nums transition-colors cursor-pointer ${
                          done
                            ? 'bg-emerald-600 border-emerald-700 text-white'
                            : selectedEventId
                            ? 'bg-white hover:bg-amber-50 border-emerald-300 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        {pair.year}
                      </button>
                    );
                  })}
                </div>
              </div>
              {yearWrongFlash && (
                <p className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5">
                  ⚠️ {yearWrongFlash}
                </p>
              )}
            </div>
          )}

          {/* PLAYING: True / False Blitz (Wednesday) */}
          {phase === 'playing' && selectedGame.type === 'true_false' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 tabular-nums">
                <span>
                  പ്രസ്താവന {tfIdx + 1}/{TRUE_FALSE_ITEMS.length}
                </span>
                <span className="text-emerald-700">സ്കോർ: {score}</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-relaxed">
                “{TRUE_FALSE_ITEMS[tfIdx].statement}”
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={tfPicked !== null}
                  onClick={() => handleTrueFalsePick(true)}
                  className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-black cursor-pointer"
                >
                  ✅ ശരി (TRUE)
                </button>
                <button
                  type="button"
                  disabled={tfPicked !== null}
                  onClick={() => handleTrueFalsePick(false)}
                  className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-black cursor-pointer"
                >
                  ❌ തെറ്റ് (FALSE)
                </button>
              </div>
              {tfPicked !== null && (
                <p className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  💡 {TRUE_FALSE_ITEMS[tfIdx].note}
                </p>
              )}
            </div>
          )}

          {/* PLAYING: Hierarchy Pyramid Builder (Thursday) */}
          {phase === 'playing' && selectedGame.type === 'hierarchy' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <p className="text-xs font-bold text-slate-600">
                SKSSF സംഘടനാ ഘടന താഴെ (യൂണിറ്റ്) മുതൽ മുകളിലേക്ക് (സംസ്ഥാനം) ശരിയായ ക്രമത്തിൽ തൊട്ട് അടുക്കുക:
              </p>
              {hierarchyBuilt.length > 0 && (
                <div className="space-y-1.5">
                  {hierarchyBuilt.map((step) => (
                    <div
                      key={step.id}
                      className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-extrabold text-emerald-950 flex items-center justify-between"
                    >
                      <span>✅ {step.label}</span>
                      <span className="text-[10px] font-semibold text-emerald-700">{step.hint}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hierarchyPool.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleHierarchyPick(item)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-400 text-left cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-extrabold text-slate-900">
                      {item.label.replace(/^\d+\.\s*/, '')}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.hint}</p>
                  </button>
                ))}
              </div>
              {hierarchyError && (
                <p className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5">
                  ⚠️ {hierarchyError}
                </p>
              )}
            </div>
          )}

          {/* PLAYING: Memory Card Flip (Saturday) */}
          {phase === 'playing' && selectedGame.type === 'memory' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 tabular-nums">
                <span>ഒരേപോലെയുള്ള 6 ജോഡികൾ കണ്ടെത്താം</span>
                <span>നീക്കങ്ങൾ: {memMoves}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {memCards.map((card) => {
                  const showFace = card.flipped || card.matched;
                  return (
                    <button
                      key={card.uid}
                      type="button"
                      disabled={showFace}
                      onClick={() => handleMemoryTap(card.uid)}
                      className={`h-20 rounded-xl border-2 flex flex-col items-center justify-center p-1.5 text-center transition-all cursor-pointer ${
                        card.matched
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                          : showFace
                          ? 'bg-amber-50 border-amber-400 text-slate-950'
                          : 'bg-emerald-800 hover:bg-emerald-700 border-emerald-900 text-amber-200'
                      }`}
                    >
                      {showFace ? (
                        <>
                          <span className="text-xs font-black leading-tight">{card.label}</span>
                          <span className="text-[10px] font-bold opacity-80 mt-0.5">{card.sub}</span>
                        </>
                      ) : (
                        <span className="text-lg font-black">?</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DONE SCREEN */}
          {phase === 'done' && finalResult && (
            <div className="bg-white rounded-xl border-2 border-emerald-400 p-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-black text-emerald-950">
                  🎉 അഭിനന്ദനങ്ങൾ! {selectedGame.title} പൂർത്തിയാക്കി!
                </p>
                <p className="text-xs font-bold text-slate-600 mt-1 tabular-nums">
                  സ്കോർ: {finalResult.score}/{finalResult.maxScore}
                  {isTodayOfficial ? ' · ഇന്നത്തെ സ്ട്രീക്ക് +35 XP ചേർത്തു!' : ' · പരിശീലന ഗെയിം പൂർത്തിയായി!'}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={startSelectedGame}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> വീണ്ടും കളിക്കാം
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> ശരി
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Today's Daily Missions Quick Claim */}
        <div className="space-y-2">
          <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>ഇന്നത്തെ ദിന ദൗത്യങ്ങൾ (Daily Missions)</span>
          </p>
          <div className="space-y-1.5">
            {DAILY_MISSIONS.map((mission) => {
              const progress =
                mission.id === 'daily_checkin'
                  ? 1
                  : mission.id === 'daily_special_game'
                  ? dailyState.todaySpecialGameDone
                    ? 1
                    : 0
                  : mission.id === 'daily_lesson'
                  ? Math.min(1, dailyState.todayLessonsCount)
                  : Math.min(1, dailyState.todayQuizzesCorrect);
              const ready = progress >= mission.target;
              const claimed = dailyState.claimedMissionsToday.includes(mission.id);
              return (
                <div
                  key={mission.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-base shrink-0">{mission.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 leading-snug">
                        {mission.title}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 tabular-nums">
                        {progress}/{mission.target} · +{mission.rewardXp} XP
                      </p>
                    </div>
                  </div>
                  {claimed ? (
                    <span className="text-[11px] font-extrabold text-emerald-700 shrink-0">
                      ✅ നേടി
                    </span>
                  ) : ready ? (
                    <button
                      type="button"
                      onClick={() => {
                        sound.unlockAudio();
                        sound.playSuccess(3);
                        onClaimMission(mission.id, mission.rewardXp);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-extrabold shrink-0 cursor-pointer"
                    >
                      +{mission.rewardXp} XP നേടാം
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">ബാക്കി</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
