import React, { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Gamepad2, Info, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { GameFullscreenShell, useGameFullscreen } from './GameFullscreenShell';
import { scrollToActiveQuiz } from './LessonCheckQuiz';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import { getOfficialLogosForLesson } from '../data/officialLogos';
import {
  AirplaneSicFlightConfig,
  AirplaneSicFlightGame,
  BalloonPopArcadeConfig,
  BalloonPopArcadeGame,
  GreenCampusSortConfig,
  GreenCampusSortGame,
  HelicopterRescueDropConfig,
  HelicopterRescueDropGame,
  OrganetChainConfig,
  OrganetChainGame,
  SargalayamSpotlightConfig,
  SargalayamSpotlightGame,
  TagoreHallPassGateConfig,
  TagoreHallPassGateGame,
  TrendCareerCompassConfig,
  TrendCareerCompassGame,
} from './NewVehicleArcadeGames';

import {
  FoodPackDeliverGame,
  MasjidCleanSweepGame,
  PaintRollerGame,
  PhotoCropEditGame,
  ScratchCleanBoardGame,
  StageSetupDragGame,
  TrophyGiftPackGame,
  UnitRoomDecorGame,
} from './HandsOnSkssfGames';
import { CyberWingCyconFeedGame } from './CyberWingCyconFeedGame';
import {
  IslamicLibraryShelfGame,
  MajlisAgendaNoticeGame,
  ProgramBudgetCheeraniGame,
  ProgramReviewReportGame,
  StadiumCleanupViqayaGame,
  StageBuildSequenceGame,
  WallWritingPaintGame,
} from './SkssfPracticalGames';

export type MiniGameLessonKey =
  | 'p0_creator'
  | 'p0_prophet'
  | 'p1'
  | 'p3'
  | 'p4'
  | 'sb_ch1'
  | 'sb_ch2'
  | 'sb_ch3'
  | 'storyboard'
  | 'pov_1'
  | 'pov_2'
  | 'pov_3'
  | 'pov_4'
  | 'pov_6'
  | 'pov_7'
  | 'pov_8'
  | 'pov_journey'
  | 'l1_cosmic'
  | 'l1_roots'
  | 'l2_tiers'
  | 'l2_election_roles'
  | 'l2_centres'
  | 'l2_dawa_age'
  | 'l2_dawa_lanterns'
  | 'l2_vault'
  | 'l3_scrolls'
  | 'l3_mind_chain'
  | 'l4_climb'
  | 'l4_compass'
  | 'l4_crisis'
  | 'l4_cyber_shield'
  | 'l4_sahachari'
  | 'l4_trend_career'
  | 'l4_sargalayam'
  | 'l4_green_earth';

interface TreeRainConfig {
  engine: 'tree_rain_garden';
  title: string;
  subtitle: string;
  toolEmoji: string;
  actionLabel: string;
  skyTheme: 'day' | 'rain' | 'garden';
  spots: { id: string; label: string; bloomEmoji: string; message: string }[];
  doneMessage: string;
}

interface RoadVehicleConfig {
  engine: 'road_vehicle_drive';
  title: string;
  subtitle: string;
  vehicleType: 'car' | 'scooter' | 'bus' | 'van' | 'bicycle' | 'truck' | 'ambulance';
  weather: 'sunny' | 'evening' | 'rainy';
  driveLabel: string;
  serveLabel: string;
  stops: { id: string; emoji: string; label: string; actionLabel?: string; reward: string }[];
  doneMessage: string;
}

interface TrainVoyageConfig {
  engine: 'train_station_voyage';
  title: string;
  subtitle: string;
  stations: { id: string; year: string; label: string; coachColor: string; note: string }[];
  doneMessage: string;
}

interface CraneBuilderConfig {
  engine: 'mosque_crane_builder';
  title: string;
  subtitle: string;
  theme: 'mosque' | 'tower';
  flagVariant: 'skju' | 'skssf';
  blocks: { id: string; label: string; color: string; accent: string; note: string }[];
  doneMessage: string;
}

interface FlagHoistConfig {
  engine: 'flag_rope_hoist';
  title: string;
  subtitle: string;
  levels: { pct: number; emoji: string; label: string; note: string }[];
  doneMessage: string;
}

interface ShipSailConfig {
  engine: 'ship_harbor_sail';
  title: string;
  subtitle: string;
  islands: { id: string; lane: 0 | 1 | 2; emoji: string; label: string; note: string }[];
  doneMessage: string;
}

interface BalloonClimbConfig {
  engine: 'balloon_altitude_climb';
  title: string;
  subtitle: string;
  gates: { id: string; emoji: string; label: string; note: string }[];
  doneMessage: string;
}

interface CyberArcadeConfig {
  engine: 'cyber_shield_arcade';
  title: string;
  subtitle: string;
  waves: { id: string; isFake: boolean; emoji: string; text: string; feedback: string }[];
  doneMessage: string;
}

type SceneGameConfig =
  | TreeRainConfig
  | RoadVehicleConfig
  | TrainVoyageConfig
  | CraneBuilderConfig
  | FlagHoistConfig
  | ShipSailConfig
  | BalloonClimbConfig
  | CyberArcadeConfig
  | AirplaneSicFlightConfig
  | HelicopterRescueDropConfig
  | BalloonPopArcadeConfig
  | TagoreHallPassGateConfig
  | TrendCareerCompassConfig
  | GreenCampusSortConfig
  | OrganetChainConfig
  | SargalayamSpotlightConfig;

const SCENE_GAME_CONFIGS: Partial<Record<MiniGameLessonKey, SceneGameConfig>> = {
  p0_creator: {
    engine: 'tree_rain_garden',
    title: '🕌 പള്ളിയുടെയും അൽബിർ മദ്‌റസയുടെയും പൂന്തോട്ടം നനയ്ക്കാം!',
    subtitle: 'നീങ്ങുന്ന വെള്ളം നനയ്ക്കുന്ന ജഗ്ഗ് (🫖) കൃത്യമായി ചെടിക്ക് മുകളിൽ എത്തുമ്പോൾ മാത്രം 💧 അമർത്തൂ — വെള്ളം തറയിൽ പാഴാക്കിയാൽ കളി ഔട്ട് ആകും!',
    toolEmoji: '🫖',
    actionLabel: '💧',
    skyTheme: 'garden',
    spots: [
      {
        id: 'seed',
        label: '1. പള്ളി മുറ്റത്തെ തൈ',
        bloomEmoji: '🌳',
        message: 'വെള്ളം പാഴാക്കാതെ കൃത്യമായി നനച്ചപ്പോൾ പള്ളി മുറ്റത്തെ തൈ പച്ചമരമായി വളർന്നു!',
      },
      {
        id: 'flower',
        label: '2. മദ്‌റസ പൂച്ചെടി',
        bloomEmoji: '🌺',
        message: 'അൽബിർ മദ്‌റസ പൂന്തോട്ടത്തിലെ പൂച്ചെടി മനോഹരമായി വിരിഞ്ഞു!',
      },
      {
        id: 'fruit',
        label: '3. അൽബിർ കിഡ്‌സ് ഫലവൃക്ഷം',
        bloomEmoji: '🍎',
        message: 'ഒരു തുള്ളി പോലും പാഴാക്കാതെ നനച്ചപ്പോൾ മധുരപ്പഴങ്ങൾ നിറഞ്ഞ മരം വളർന്നു!',
      },
    ],
    doneMessage: '🌳 മാഷാ അല്ലാഹ്! ഒരു തുള്ളി വെള്ളം പോലും പാഴാക്കാതെ പള്ളിയും മദ്‌റസയും പൂന്തോട്ടമാക്കി! (+25 XP)',
  },
  p0_prophet: {
    engine: 'road_vehicle_drive',
    title: '💡 നഗരത്തിലെ തെരുവുവിളക്കുകൾ തെളിയിക്കാം! (വിഖായ സേവനം)',
    subtitle: 'നഗരത്തിലെ 3 തെരുവുവിളക്കുകൾ അണഞ്ഞു കിടക്കുകയാണ്! വിഖായ വാഹനം ഓടിച്ച് ഓരോ വിളക്കും ശരിയാക്കി കത്തിക്കൂ!',
    vehicleType: 'car',
    weather: 'evening',
    driveLabel: '🚗 വാഹനം ഓടിക്കൂ',
    serveLabel: '💡 വിളക്ക് കത്തിക്കൂ',
    stops: [
      {
        id: 'lamp1',
        emoji: '💡',
        label: 'ഒന്നാമത്തെ വിളക്ക്',
        reward: 'ഒന്നാമത്തെ വിളക്ക് കത്തിച്ചു! ഇനി രണ്ടാമത്തെ വിളക്കിലേക്ക് വണ്ടി ഓടിക്കൂ!',
      },
      {
        id: 'lamp2',
        emoji: '💡',
        label: 'രണ്ടാമത്തെ വിളക്ക്',
        reward: 'രണ്ടാമത്തെ വിളക്കും കത്തിച്ചു! ഇനി മൂന്നാമത്തെ വിളക്കിലേക്ക് വണ്ടി ഓടിക്കൂ!',
      },
      {
        id: 'lamp3',
        emoji: '💡',
        label: 'മൂന്നാമത്തെ വിളക്ക്',
        reward: 'മൂന്നാമത്തെ വിളക്കും കത്തിച്ചു! നഗരത്തിലെ എല്ലാ വിളക്കുകളും പ്രകാശിച്ചു!',
      },
    ],
    doneMessage: '🎉 ജയിച്ചു! മൂന്ന് വിളക്കുകളും കത്തിച്ച് വിഖായ സേവന ദൗത്യം പൂർത്തിയാക്കി! (+25 XP)',
  },
  p1: {
    engine: 'mosque_crane_builder',
    title: '🕌 1926 സമസ്ത പൈതൃക മന്ദിരം പണിയാം!',
    subtitle: 'ആടുന്ന ക്രെയിൻ നടുവിൽ എത്തുമ്പോൾ “⬇️ ഇറക്കൂ!” അമർത്തി 4 തൂണുകളും മിനാരവും പണിയൂ!',
    theme: 'mosque',
    flagVariant: 'skju',
    blocks: [
      {
        id: 'aqeedah',
        label: '1. ശുദ്ധമായ അഖീദ അടിത്തറ',
        color: '#065F46',
        accent: '#A7F3D0',
        note: 'അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ ഉറച്ച വിശ്വാസ അടിത്തറ ഉറപ്പിച്ചു!',
      },
      {
        id: 'madhhab',
        label: '2. 4 മദ്‌ഹബുകളും ഫിഖ്ഹും',
        color: '#047857',
        accent: '#FDE68A',
        note: 'ആരാധനകളുടെ കൃത്യതയും 4 മദ്‌ഹബുകളുടെ കാവലും സ്ഥാപിച്ചു!',
      },
      {
        id: 'waqf',
        label: '3. വഖഫ് പള്ളികളും അറബി ഖുതുബയും',
        color: '#7A1838',
        accent: '#FDE047',
        note: 'വഖഫ് പള്ളികളും മൗലിദ്-റാതീബ് പൈതൃകവും കാത്തുസൂക്ഷിച്ചു!',
      },
      {
        id: 'dome',
        label: '4. 1926 സമസ്ത പണ്ഡിത താഴികക്കുടം',
        color: '#0F766E',
        accent: '#FACC15',
        note: '1926 കോഴിക്കോട് ടൗൺ ഹാൾ പൈതൃക താഴികക്കുടവും സമസ്ത പതാകയും ഉയർന്നു!',
      },
    ],
    doneMessage: '🕌 അടിപൊളി! 1926 സമസ്തയുടെ പൈതൃക മന്ദിരം ഭംഗിയായി നിർമ്മിച്ചു! (+25 XP)',
  },
  p3: {
    engine: 'train_station_voyage',
    title: '🚂 സമസ്ത ചരിത്ര തീവണ്ടി യാത്ര!',
    subtitle: 'തീവണ്ടി ഓടിച്ച് 1951, 1989, 1993 ചരിത്ര സ്റ്റേഷനുകളിൽ നിർത്തി കോച്ചുകൾ ഘടിപ്പിക്കൂ!',
    stations: [
      {
        id: 's1951',
        year: '1951',
        label: 'SKIMVB മദ്രസാ സ്റ്റേഷൻ',
        coachColor: '#047857',
        note: '1951-ലെ വിദ്യാഭ്യാസ ബോർഡ് കോച്ച് (11,000+ മദ്രസകൾ) തീവണ്ടിയിൽ ഘടിപ്പിച്ചു!',
      },
      {
        id: 's1989',
        year: '1989',
        label: 'SKSSF സ്റ്റേഷൻ',
        coachColor: '#0284C7',
        note: '1989 ഫെബ്രുവരി 19-ന് പിറന്ന SKSSF (17 വിങ്ങുകൾ) കോച്ച് ഘടിപ്പിച്ചു!',
      },
      {
        id: 's1993',
        year: '1993',
        label: 'SKSBV ബാലവേദി സ്റ്റേഷൻ',
        coachColor: '#D97706',
        note: '1993-ലെ SKSBV ബാലവേദി കോച്ചും ചേർത്തു — ചരിത്ര എക്സ്പ്രസ് പൂർത്തിയായി!',
      },
    ],
    doneMessage: '🚂 സൂപ്പർ! 1951 → 1989 → 1993 ചരിത്ര എക്സ്പ്രസ് വിജയകരമായി ലക്ഷ്യത്തിലെത്തി! (+25 XP)',
  },
  p4: {
    engine: 'flag_rope_hoist',
    title: '🚩 SKSSF & ട്രെൻഡ് (TREND) 4 സംഘടനാ തല പതാക ഉയർത്താം!',
    subtitle: '“🪢 കയർ വലിക്കൂ!” അമർത്തി യൂണിറ്റ് മുതൽ സ്റ്റേറ്റ് & TREND എഡ്യൂഹബ് വരെ SKSSF പതാക ഉയർത്തൂ!',
    levels: [
      { pct: 25, emoji: '🏠', label: 'യൂണിറ്റ് & SKSBV മദ്രസാ തലം', note: 'മഹല്ലിലെ ആദ്യ കർമ്മവേദിയും SKSBV അടിത്തറയും കടന്നു!' },
      { pct: 50, emoji: '🏘️', label: 'ക്ലസ്റ്റർ & മേഖലാ തലം', note: 'ഓർഗാനെറ്റ് വഴി യൂണിറ്റുകളെ ഒരുമിപ്പിക്കുന്ന പാലം കടന്നു!' },
      { pct: 75, emoji: '🎓', label: 'ജില്ലാ തലം & TREND (TASTE · Educare)', note: 'വിദ്യാർത്ഥികൾക്കായുള്ള TREND കരിയർ & സ്കോളർഷിപ്പ് ഉയരത്തിലെത്തി!' },
      { pct: 100, emoji: '🌍', label: 'സ്റ്റേറ്റ് & ആഗോള SIC/SKSSF', note: 'SKSSF ഔദ്യോഗിക പതാക ഏറ്റവും ഉയരത്തിൽ പാറിപ്പറക്കുന്നു!' },
    ],
    doneMessage: '🚩 വിസ്മയം! നാല് സംഘടനാ തലങ്ങളിലും SKSSF പതാക അഭിമാനത്തോടെ പാറിപ്പറന്നു! (+25 XP)',
  },
  sb_ch1: {
    engine: 'mosque_crane_builder',
    title: '🕌 1926 സമസ്ത വഖഫ് പള്ളിയും പണ്ഡിത പൈതൃകവും നിർമ്മിക്കാം!',
    subtitle: 'ആടുന്ന ക്രെയിൻ നടുവിൽ എത്തുമ്പോൾ “⬇️ ഇറക്കൂ!” അമർത്തി പ്രവാചകർ ﷺ → സ്വഹാബികൾ → പണ്ഡിത പരമ്പരയുടെ 4 തൂണുകൾ പണിയൂ!',
    theme: 'mosque',
    flagVariant: 'skju',
    blocks: [
      {
        id: 'sb_quran',
        label: '1. ഖുർആനും തിരുനബി ﷺ സുന്നത്തും',
        color: '#065F46',
        accent: '#A7F3D0',
        note: 'പ്രവാചകർ ﷺ പഠിപ്പിച്ച ഖുർആനിന്റെയും ഹദീസിന്റെയും അടിത്തറ ഉറപ്പിച്ചു!',
      },
      {
        id: 'sb_sahaba',
        label: '2. സ്വഹാബികളുടെയും പണ്ഡിതന്മാരുടെയും പരമ്പര',
        color: '#047857',
        accent: '#FDE68A',
        note: 'സ്വഹാബികളിൽ നിന്ന് പണ്ഡിതന്മാർ കൈമാറിയ ശുദ്ധമായ അറിവിന്റെ നില പണിതു!',
      },
      {
        id: 'sb_waqf',
        label: '3. വഖഫ് പള്ളികളും മൗലിദ്-റാതീബും',
        color: '#7A1838',
        accent: '#FDE047',
        note: 'പൂർവികന്മാർ വഖഫ് ചെയ്ത പള്ളികളിലെ ദിക്ർ-മൗലിദ് പാരമ്പര്യം കാത്തുസൂക്ഷിച്ചു!',
      },
      {
        id: 'sb_samastha',
        label: '4. 1926 സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ',
        color: '#0F766E',
        accent: '#FACC15',
        note: 'സമസ്തയുടെ പൈതൃക താഴികക്കുടവും ഔദ്യോഗിക പതാകയും അഭിമാനത്തോടെ ഉയർന്നു!',
      },
    ],
    doneMessage: '🕌 അടിപൊളി! പണ്ഡിത പരമ്പരയും വഖഫ് പള്ളി പൈതൃകവും ഭംഗിയായി സംരക്ഷിച്ചു! (+25 XP)',
  },
  sb_ch2: {
    engine: 'tagore_hall_pass_gate',
    title: '🏛️ 1995 കോഴിക്കോട് ടാഗോർ ഹാൾ — സമാധാന സദസ്സ് പ്രവേശന കവാടം!',
    subtitle: '1995 കോഴിക്കോട് ടാഗോർ ഹാളിലെ സമാധാന സദസ്സിലേക്ക് എത്തുന്ന അതിഥികളെ പരിശോധിക്കൂ — സൗഹാർദ്ദ സന്ദേശകരെ ✅ സ്വാഗതം ചെയ്യൂ, വിദ്വേഷ കെണികളെ 🛑 തടയൂ!',
    guests: [
      {
        id: 'tg_shamsul',
        emoji: '🕊️',
        name: 'സമാധാന സദസ്സ് പ്രതിനിധി',
        message: 'ശംസുൽ ഉലമയുടെ ആഹ്വാനപ്രകാരം മതസൗഹാർദ്ദവും സാഹോദര്യവും പകരാൻ വന്നതാണ്.',
        allow: true,
        feedback: 'സമാധാന സദസ്സിലേക്ക് സ്വാഗതം! സൗഹാർദ്ദമാണ് സമസ്തയുടെ മുഖമുദ്ര.',
      },
      {
        id: 'tg_rumor',
        emoji: '🔥',
        name: 'വ്യാജ പ്രചാരകൻ',
        message: 'നാട്ടിൽ ഭിന്നതയുണ്ടാക്കുന്ന പ്രകോപന ലഘുലേഖകൾ ഹാളിൽ വിതരണം ചെയ്യണം!',
        allow: false,
        feedback: 'മിടുക്കൻ! ഭിന്നത പരത്തുന്ന വിദ്വേഷ കെണിയെ ടാഗോർ ഹാൾ കവാടത്തിൽ തന്നെ തടഞ്ഞു!',
      },
      {
        id: 'tg_taste',
        emoji: '🎤',
        name: 'TREND TASTE പരിശീലകൻ',
        message: 'വിദ്യാർത്ഥികൾക്ക് വ്യക്തിത്വ വികസനവും നല്ല സംസാര പരിശീലനവും നൽകാൻ വന്നതാണ്.',
        allow: true,
        feedback: 'സ്വാഗതം! TREND TASTE വിദ്യാർത്ഥികളെ ആത്മവിശ്വാസമുള്ള നേതാക്കളാക്കുന്നു.',
      },
      {
        id: 'tg_hate',
        emoji: '🤬',
        name: 'കലഹ പ്രചാരകൻ',
        message: 'സൗഹാർദ്ദ വേദിയിൽ ബഹളമുണ്ടാക്കി സമാധാന സന്ദേശം തടസ്സപ്പെടുത്തണം!',
        allow: false,
        feedback: 'കൃത്യം! സമാധാനം തകർക്കാൻ വന്നവരെ കവാടത്തിൽ തന്നെ തടഞ്ഞുനിർത്തി!',
      },
      {
        id: 'tg_educare',
        emoji: '🎓',
        name: 'TREND Educare സ്കോളർഷിപ്പ് ടീം',
        message: 'നിർദ്ധന വിദ്യാർത്ഥികൾക്ക് ഉന്നത വിദ്യാഭ്യാസ വഴികാട്ടിയും സ്കോളർഷിപ്പും നൽകാൻ എത്തിയതാണ്.',
        allow: true,
        feedback: 'അടിപൊളി! വിദ്യാഭ്യാസ പുരോഗതിക്കായുള്ള TREND Educare ടീമിനെ സ്വാഗതം ചെയ്തു!',
      },
    ],
    doneMessage: '🏛️🕊️ വിസ്മയം! 1995 കോഴിക്കോട് ടാഗോർ ഹാൾ സമാധാന സദസ്സ് വിജയകരമായി സംരക്ഷിച്ചു! (+25 XP)',
  },
  sb_ch3: {
    engine: 'road_vehicle_drive',
    title: '🚐 സഹചാരി റിലീഫ് സെൽ (Sahachari) സേവന വാൻ!',
    subtitle: 'ആദ്യം 🕌 പള്ളിയിൽ നിന്ന് പിരിവ് ശേഖരിക്കൂ → പിന്നെ 🏥 ആശുപത്രിയിൽ പോയി മരുന്ന് വാങ്ങൂ → അവസാനം 🏠 രോഗിയുടെ വീട്ടിൽ മരുന്ന് എത്തിക്കൂ!',
    vehicleType: 'van',
    weather: 'sunny',
    driveLabel: '▶▶',
    serveLabel: '💝',
    stops: [
      {
        id: 'mosque_collection',
        emoji: '🕌',
        label: '1. പള്ളി (സഹചാരി പിരിവ്)',
        actionLabel: '🕌 പിരിവ് ശേഖരിക്കൂ',
        reward: 'പള്ളിയിൽ വാഹനം നിർത്തി സഹചാരി പിരിവ് ശേഖരിച്ചു! ഇനി ആശുപത്രിയിൽ പോയി മരുന്ന് വാങ്ങാം!',
      },
      {
        id: 'hospital_medicine',
        emoji: '🏥',
        label: '2. ആശുപത്രി (മരുന്ന് വാങ്ങൽ)',
        actionLabel: '💊 മരുന്ന് വാങ്ങൂ',
        reward: 'ആശുപത്രിയിൽ വാഹനം നിർത്തി രോഗിക്ക് വേണ്ട മരുന്നുകൾ വാങ്ങി വണ്ടിയിൽ കയറ്റി! ഇനി വീട്ടിലേക്ക് പോകാം!',
      },
      {
        id: 'home_delivery',
        emoji: '🏠',
        label: '3. വീട് (മരുന്ന് വിതരണം)',
        actionLabel: '🏠 മരുന്ന് നൽകൂ',
        reward: 'നിർദ്ധന രോഗിയുടെ വീട്ടിൽ വാഹനം നിർത്തി മരുന്ന് കൈമാറി! സഹചാരി ദൗത്യം വിജയകരം!',
      },
    ],
    doneMessage: '🚐 മനോഹരം! പള്ളിയിൽ പിരിവ് ശേഖരിച്ച്, ആശുപത്രിയിൽ നിന്ന് മരുന്ന് വാങ്ങി, രോഗിയുടെ വീട്ടിൽ എത്തിച്ചു! (+25 XP)',
  },
  l1_cosmic: {
    engine: 'tree_rain_garden',
    title: '🕌 മദ്‌റസ പൂന്തോട്ടം — ജലസംരക്ഷണ ദൃഷ്ടാന്തം!',
    subtitle: 'വെള്ളം അല്ലാഹുവിന്റെ വലിയ അനുഗ്രഹമാണ്! നീങ്ങുന്ന ജഗ്ഗ് കൃത്യമായി ചെടികൾക്ക് മുകളിൽ എത്തുമ്പോൾ മാത്രം നനയ്ക്കൂ — വെള്ളം പാഴാക്കിയാൽ ഔട്ട്!',
    toolEmoji: '🫖',
    actionLabel: '💧',
    skyTheme: 'garden',
    spots: [
      {
        id: 'c_evap',
        label: '1. ശുദ്ധജല തൈ',
        bloomEmoji: '🌲',
        message: 'ഒരു തുള്ളി പോലും പാഴാക്കാതെ നനച്ചപ്പോൾ പച്ചമരം തളിർത്തു — വെള്ളം അല്ലാഹുവിന്റെ അനുഗ്രഹം!',
      },
      {
        id: 'c_palm',
        label: '2. മദ്‌റസ തെങ്ങിൻതൈ',
        bloomEmoji: '🌴',
        message: 'സൂര്യപ്രകാശവും ശുദ്ധജലവും ചേർന്ന് തെങ്ങിൻതൈ മനോഹരമായി വളർന്നു!',
      },
      {
        id: 'c_forest',
        label: '3. പള്ളി മുറ്റത്തെ പൂക്കൾ',
        bloomEmoji: '🌺',
        message: 'വെള്ളം പാഴാക്കാതെ സംരക്ഷിച്ചപ്പോൾ പള്ളിമുറ്റം മുഴുവൻ പൂത്തുലഞ്ഞു!',
      },
    ],
    doneMessage: '🌿 അടിപൊളി! ജലസംരക്ഷണത്തോടെ പള്ളി–മദ്‌റസ പൂന്തോട്ടം മനോഹരമായി വളർത്തി! (+25 XP)',
  },
  l1_roots: {
    engine: 'ship_harbor_sail',
    title: '⛵ സമസ്ത പൈതൃക പായ്ക്കപ്പൽ (പൊന്നാനി · വരക്കൽ · SKIMVB · ജാമിഅ നൂരിയ്യ)!',
    subtitle: 'മുകളിലേക്കും താഴേക്കും കപ്പൽ തിരിച്ച് തിരമാലകളിലൂടെ 3 ചരിത്ര ദീപസ്തംഭങ്ങളിൽ (1926, 1951 SKIMVB, 1989 SKSSF) എത്തിച്ചേരൂ!',
    islands: [
      {
        id: 'i1926',
        lane: 0,
        emoji: '🕌',
        label: '1926 വരക്കൽ & കോഴിക്കോട് ടൗൺ ഹാൾ',
        note: '1926 ജൂൺ 26-ന് വരക്കൽ മുല്ലക്കോയ തങ്ങളുടെ നേതൃത്വത്തിൽ സമസ്ത പിറന്ന ദീപസ്തംഭം തൊട്ടു!',
      },
      {
        id: 'i1951',
        lane: 2,
        emoji: '🏫',
        label: '1951 SKIMVB & 1963 ജാമിഅ നൂരിയ്യ',
        note: '11,000+ മദ്രസകളും അൽബിറും SNEC-ഉം ജാമിഅ നൂരിയ്യയും നയിക്കുന്ന വിജ്ഞാന ദ്വീപിൽ എത്തി!',
      },
      {
        id: 'i1989',
        lane: 1,
        emoji: '🚩',
        label: '1989 കോഴിക്കോട് SKSSF തുറമുഖം',
        note: '1989 ഫെബ്രുവരി 19-ന് SKSSF പിറന്ന തുറമുഖത്ത് കപ്പൽ സുരക്ഷിതമായി അടുത്തു!',
      },
    ],
    doneMessage: '⛵ ഗംഭീരം! സമസ്തയുടെ മൂന്ന് ചരിത്ര ദീപസ്തംഭങ്ങളിലും പായ്ക്കപ്പൽ എത്തിച്ച് വിജയിച്ചു! (+25 XP)',
  },
  l2_tiers: {
    engine: 'organet_chain_connect',
    title: '🔗 SKSSF ഓർഗാനെറ്റ് (Organet) — 15 → 19 → 21 → 25 → 31 ശൃംഖല!',
    subtitle: 'യൂണിറ്റ് (15) മുതൽ സ്റ്റേറ്റ് (31) വരെ കൃത്യമായ ക്രമത്തിൽ ഓർഗാനെറ്റ് കണ്ണികൾ ബന്ധിപ്പിക്കൂ — തെറ്റായ എണ്ണങ്ങൾ (10, 40) തൊടരുത്!',
    nodes: [
      { id: 't15', count: 15, label: 'യൂണിറ്റ്', emoji: '🏠', note: '15 അംഗ യൂണിറ്റ് ഘടകം ഓർഗാനെറ്റിൽ ആദ്യ കണ്ണിയായി ചേർത്തു!' },
      { id: 't19', count: 19, label: 'ക്ലസ്റ്റർ', emoji: '🏘️', note: '19 അംഗ ക്ലസ്റ്റർ ഘടകം കൃത്യമായി ബന്ധിപ്പിച്ചു!' },
      { id: 't21', count: 21, label: 'മേഖല', emoji: '🏙️', note: '21 അംഗ മേഖലാ ഘടകം ശൃംഖലയിൽ ഉറപ്പിച്ചു!' },
      { id: 't25', count: 25, label: 'ജില്ല', emoji: '🗺️', note: '25 അംഗ ജില്ലാ കമ്മിറ്റി ഓർഗാനെറ്റിൽ ചേർത്തു!' },
      { id: 't31', count: 31, label: 'സ്റ്റേറ്റ്', emoji: '🚩', note: '31 അംഗ സ്റ്റേറ്റ് കമ്മിറ്റിയോടെ 5-തല ഓർഗാനെറ്റ് ശൃംഖല പൂർത്തിയായി!' },
    ],
    decoys: [
      { id: 'd10', count: 10, label: 'തെറ്റായ എണ്ണം' },
      { id: 'd40', count: 40, label: 'തെറ്റായ എണ്ണം' },
    ],
    doneMessage: '🔗 വിസ്മയം! SKSSF ഓർഗാനെറ്റ് 15–19–21–25–31 അഞ്ച് തല ശൃംഖലയും കൃത്യമായി ബന്ധിപ്പിച്ചു! (+25 XP)',
  },
  l2_election_roles: {
    engine: 'road_vehicle_drive',
    title: '🚌 SKSSF കൗൺസിൽ ബസ് യാത്ര!',
    subtitle: 'പച്ച കൗൺസിൽ ബസ് ഓടിച്ച് 3 സ്റ്റോപ്പുകളിൽ നിന്ന് പ്രസിഡന്റ്, ജനറൽ സെക്രട്ടറി, ട്രഷറർ എന്നിവരെ കയറ്റൂ!',
    vehicleType: 'bus',
    weather: 'sunny',
    driveLabel: '⛽ ബസ് ഓടിക്കൂ!',
    serveLabel: '🚪 വാതിൽ തുറന്ന് കയറ്റൂ!',
    stops: [
      {
        id: 'pres',
        emoji: '👑',
        label: 'സ്റ്റോപ്പ് 1 · പ്രസിഡന്റ്',
        reward: 'പ്രസിഡന്റ് ബസ്സിൽ കയറി — യോഗ അധ്യക്ഷതയും കൂട്ടായ്മയും സജ്ജം!',
      },
      {
        id: 'sec',
        emoji: '📝',
        label: 'സ്റ്റോപ്പ് 2 · ജനറൽ സെക്രട്ടറി',
        reward: 'ജനറൽ സെക്രട്ടറി കയറി — മിനിറ്റ്സും റിപ്പോർട്ടും യോഗ ക്ഷണവും റെഡി!',
      },
      {
        id: 'treas',
        emoji: '💰',
        label: 'സ്റ്റോപ്പ് 3 · ട്രഷറർ',
        reward: 'ട്രഷററും കയറി — സുതാര്യ വരവ്-ചെലവ് അക്കൗണ്ട് ടീം പൂർണ്ണം!',
      },
    ],
    doneMessage: '🚌 അടിപൊളി! മൂന്ന് മുഖ്യ ഭാരവാഹികളെയും കയറ്റി കൗൺസിൽ ബസ് ക്യാമ്പിലെത്തി! (+25 XP)',
  },
  l2_centres: {
    engine: 'road_vehicle_drive',
    title: '🚐 SKSSF സേവന വാൻ നഗരയാത്ര!',
    subtitle: 'സേവന വാൻ ഓടിച്ച് ഇസ്‌ലാമിക് സെന്ററിലും ഹോസ്റ്റലിലും സഹചാരി ഹെൽപ്പ് ഡെസ്കിലും സഹായം എത്തിക്കൂ!',
    vehicleType: 'van',
    weather: 'sunny',
    driveLabel: '⛽ വാൻ ഓടിക്കൂ!',
    serveLabel: '📦 സേവന കിറ്റ് നൽകൂ!',
    stops: [
      {
        id: 'ic',
        emoji: '🏛️',
        label: 'കോഴിക്കോട് ഇസ്‌ലാമിക് സെന്റർ',
        reward: 'ലൈബ്രറിയിലേക്കും സത്യധാര ഓഫീസിലേക്കും പുസ്തകക്കെട്ടുകൾ കൈമാറി!',
      },
      {
        id: 'hostel',
        emoji: '🛏️',
        label: 'ഡൽഹി–ബെംഗളൂരു വിദ്യാർത്ഥി ഹോസ്റ്റൽ',
        reward: 'ദൂരെ നിന്ന് പഠിക്കാൻ വന്ന വിദ്യാർത്ഥികൾക്ക് പഠന കിറ്റുകൾ നൽകി!',
      },
      {
        id: 'help',
        emoji: '🏥',
        label: 'സഹചാരി & മെഡിക്കൽ ഹെൽപ്പ് ഡെസ്ക്',
        reward: 'ആശുപത്രിയിലെ രോഗികൾക്കും കൂട്ടിരിപ്പുകാർക്കും കരുതൽ സഹായം എത്തിച്ചു!',
      },
    ],
    doneMessage: '🚐 സൂപ്പർ! മൂന്ന് പ്രധാന സേവന കേന്ദ്രങ്ങളിലും SKSSF വാൻ സഹായം എത്തിച്ചു! (+25 XP)',
  },
  l2_dawa_age: {
    engine: 'balloon_pop_arcade',
    title: '🎈 പ്രായപാത ബലൂൺ ആർക്കേഡ് (SKSBV · SKSSF 14–40 · SYS 18+)!',
    subtitle: 'ആകാശത്തേക്ക് പറക്കുന്ന ശരിയായ സംഘടനാ ബലൂണുകൾ തൊട്ട് പൊട്ടിക്കൂ — ചുവന്ന 💣 കെണി ബലൂൺ തൊടരുത്!',
    targets: [
      {
        id: 'sksbv',
        emoji: '🎒',
        label: 'SKSBV മദ്രസ',
        color: '#059669',
        note: 'മദ്രസയിലെ ബാലവേദി SKSBV-യിൽ നിന്ന് നല്ല ശീലങ്ങൾ തുടങ്ങി!',
      },
      {
        id: 'skssf',
        emoji: '🚩',
        label: 'SKSSF 14–40',
        color: '#0284C7',
        note: '14 മുതൽ 40 വയസ്സ് വരെയും SKSSF-ൽ സജീവമായി പ്രവർത്തിക്കാൻ കഴിയും!',
      },
      {
        id: 'sys',
        emoji: '🤝',
        label: 'SYS 18+',
        color: '#D97706',
        note: 'SKSSF-ൽ പ്രവർത്തിക്കുന്നവർക്കും 18+ ആയാൽ SYS-ലും ഒരുമിച്ച് പ്രവർത്തിക്കാം!',
      },
    ],
    decoys: [
      { emoji: '💣', label: 'അലസത' },
      { emoji: '💣', label: 'വഴക്ക്' },
    ],
    doneMessage: '🎈 മിടുക്കൻ! പ്രായപാതയിലെ മൂന്ന് സംഘടനാ ബലൂണുകളും കൃത്യമായി പൊട്ടിച്ചു! (+25 XP)',
  },
  l2_vault: {
    engine: 'road_vehicle_drive',
    title: '🚚 സുപ്രഭാതം & സത്യധാര പ്രസ് വാൻ!',
    subtitle: 'പ്രസ് വാൻ ഓടിച്ച് മഹല്ലുകളിലേക്കും ലൈബ്രറികളിലേക്കും പത്രങ്ങളും അറിവിന്റെ പുസ്തകങ്ങളും വിതരണം ചെയ്യൂ!',
    vehicleType: 'truck',
    weather: 'sunny',
    driveLabel: '⛽ പ്രസ് വാൻ ഓടിക്കൂ!',
    serveLabel: '📰 കെട്ടുകൾ കൈമാറൂ!',
    stops: [
      {
        id: 'sup',
        emoji: '📰',
        label: '1. സുപ്രഭാതം ദിനപത്രം',
        reward: 'രാവിലെ തന്നെ മഹല്ല് വായനശാലയിൽ സുപ്രഭാതം ദിനപത്രം എത്തിച്ചു!',
      },
      {
        id: 'sat',
        emoji: '📖',
        label: '2. സത്യധാര ദ്വൈവാരിക',
        reward: 'യൂണിറ്റ് ഓഫീസിലേക്ക് സത്യധാര ദ്വൈവാരിക കെട്ടുകൾ കൈമാറി!',
      },
      {
        id: 'dhiu',
        emoji: '🎓',
        label: '3. ജാമിഅ നൂരിയ്യ & ദാറുൽ ഹുദാ ലൈബ്രറി',
        reward: 'മത-ഭൗതിക സമന്വയ വിദ്യാഭ്യാസ സ്ഥാപനത്തിലേക്ക് വിജ്ഞാന ശേഖരം എത്തിച്ചു!',
      },
    ],
    doneMessage: '🚚 ഗംഭീരം! അറിവിന്റെ പത്രങ്ങളും പുസ്തകങ്ങളും എല്ലായിടത്തും എത്തിച്ചു! (+25 XP)',
  },
  l3_scrolls: {
    engine: 'tree_rain_garden',
    title: '🕌 പള്ളി & മദ്‌റസ സൽസ്വഭാവ പൂന്തോട്ടം നനയ്ക്കാം!',
    subtitle: 'വെള്ളം നനയ്ക്കുന്ന ജഗ്ഗ് (🫖) കൃത്യമായി വാടിയ ചെടിക്ക് മുകളിൽ എത്തുമ്പോൾ മാത്രം ഒഴിക്കൂ — തറയിൽ വെള്ളം പാഴാക്കിയാൽ കളി ഔട്ട്!',
    toolEmoji: '🫖',
    actionLabel: '💧',
    skyTheme: 'garden',
    spots: [
      {
        id: 'humble',
        label: '1. വിനയത്തിന്റെ ചെടി',
        bloomEmoji: '🌻',
        message: 'തെറ്റ് വിനയത്തോടെ തിരുത്താൻ പഠിച്ചപ്പോൾ സ്വർണ്ണ സൂര്യകാന്തി വിരിഞ്ഞു!',
      },
      {
        id: 'mercy',
        label: '2. കാരുണ്യത്തിന്റെ ചെടി',
        bloomEmoji: '🌹',
        message: 'വയോധികരെയും കൂട്ടുകാരെയും സഹായിച്ചപ്പോൾ ചുവന്ന റോസാപ്പൂ വിരിഞ്ഞു!',
      },
      {
        id: 'family',
        label: '3. ഉമ്മയുടെ ദുആ തണൽ',
        bloomEmoji: '🦋',
        message: 'ഉമ്മയോടും കുടുംബത്തോടും സ്നേഹം കാണിച്ചപ്പോൾ പൂമ്പാറ്റകൾ പറന്നുയർന്നു!',
      },
    ],
    doneMessage: '🌿 മനോഹരം! സൽസ്വഭാവ പൂന്തോട്ടം മുഴുവൻ പൂത്തുലഞ്ഞു! (+25 XP)',
  },
  l3_mind_chain: {
    engine: 'balloon_pop_arcade',
    title: '🎈 SKSSF ട്രെൻഡ് (TREND) & നല്ല ചിന്തകൾ ബലൂൺ ആർക്കേഡ്!',
    subtitle: 'നല്ല ചിന്തകളുടെയും TREND വളർച്ചയുടെയും ബലൂണുകൾ പൊട്ടിക്കൂ! ചുവന്ന 💣 നെഗറ്റീവ് ബലൂണുകൾ ഒഴിവാക്കൂ!',
    targets: [
      { id: 'g1', emoji: '🤲', label: 'വിശ്വാസം', color: '#059669', note: 'അല്ലാഹുവിലുള്ള ഉറച്ച വിശ്വാസവും സൽസ്വഭാവവും നേടി!' },
      { id: 'g2', emoji: '🎤', label: 'TREND TASTE', color: '#0284C7', note: 'ആത്മവിശ്വാസവും പ്രസംഗ-ആശയവിനിമയ കഴിവും നേടി!' },
      { id: 'g3', emoji: '🎓', label: 'Educare', color: '#7C3AED', note: 'സ്കോളർഷിപ്പും ഉന്നത വിദ്യാഭ്യാസ വഴികാട്ടിയും സ്വന്തമാക്കി!' },
      { id: 'g4', emoji: '🌟', label: 'വിനയം', color: '#D97706', note: 'അറിവും വിനയവും ചേർന്ന ഉത്തമ SKSSF പ്രവർത്തകനായി ഉയർന്നു!' },
    ],
    decoys: [
      { emoji: '💣', label: 'അഹങ്കാരം' },
      { emoji: '💣', label: 'സമയനഷ്ടം' },
    ],
    doneMessage: '🎈 വിസ്മയം! നല്ല ചിന്തകളുടെയും TREND വളർച്ചയുടെയും ബലൂണുകൾ കൃത്യമായി നേടി! (+25 XP)',
  },
  l4_compass: {
    engine: 'train_station_voyage',
    title: '🚂 SKSSF ഓർഗാനെറ്റ് (Organet) & സംഘാടന എക്സ്പ്രസ് തീവണ്ടി!',
    subtitle: 'തീവണ്ടി ഓടിച്ച് ശൂറ, 5 ചോദ്യങ്ങൾ (ഓർഗാനെറ്റ്), ജിറാഫും ഏണിയും എന്നീ 3 സ്റ്റേഷനുകളിൽ കൃത്യമായി ബ്രേക്ക് ചെയ്ത് കോച്ചുകൾ ഘടിപ്പിക്കൂ!',
    stations: [
      {
        id: 'c_shura',
        year: 'ശൂറ',
        label: 'കൂടിയാലോചന സ്റ്റേഷൻ',
        coachColor: '#047857',
        note: 'എല്ലാവരോടും ആലോചിച്ച് തീരുമാനമെടുക്കുന്ന ശൂറ കോച്ച് തീവണ്ടിയിൽ ഘടിപ്പിച്ചു!',
      },
      {
        id: 'c_time',
        year: '5W',
        label: 'ഓർഗാനെറ്റ് പ്ലാനിംഗ്',
        coachColor: '#0284C7',
        note: 'എന്ത്, എന്തിന്, എപ്പോൾ, എവിടെ, ആര് — കൃത്യമായ ഓർഗാനെറ്റ് പ്ലാനിംഗ് കോച്ച് ചേർത്തു!',
      },
      {
        id: 'c_giraffe',
        year: '🦒',
        label: 'ജിറാഫും ഏണിയും',
        coachColor: '#D97706',
        note: 'ദൂരക്കാഴ്ചയോടെ കൂടെയുള്ളവരെ ഉയർത്തുന്ന സംഘാടക കോച്ചും ചേർത്തു!',
      },
    ],
    doneMessage: '🚂 അടിപൊളി! SKSSF ഓർഗാനെറ്റ് എക്സ്പ്രസ് തീവണ്ടി എല്ലാ സ്റ്റേഷനുകളും വിജയകരമായി കടന്നു! (+25 XP)',
  },
  l4_crisis: {
    engine: 'helicopter_rescue_drop',
    title: '🚁 വിഖായ & അലേർട്ട് (ALERT) രക്ഷാ ഹെലികോപ്റ്റർ എയർഡ്രോപ്പ്!',
    subtitle: 'കൊടുങ്കാറ്റ് (⛈️) ഇല്ലാത്തപ്പോൾ ഹെലികോപ്റ്റർ ഗ്രൗണ്ട് ഹെലിപാഡിന് മുകളിൽ എത്തുമ്പോൾ 🪂 രക്ഷാ കിറ്റ് ഇറക്കൂ!',
    kitEmoji: '🩹',
    pads: [
      {
        id: 'lpc',
        emoji: '🧭',
        shortLabel: 'ALERT പോസ്റ്റ്',
        label: 'വിഖായ & ALERT കൺട്രോൾ പോസ്റ്റ്',
        note: 'ഫോൺ ഓഫ് ചെയ്യാതെ Leader–Plan–Communicate ടീമിനെ ഏകോപിപ്പിച്ചു!',
      },
      {
        id: 'camp',
        emoji: '⛺',
        shortLabel: 'ദുരിതാശ്വാസ ക്യാമ്പ്',
        label: 'സഹചാരി ദുരിതാശ്വാസ ക്യാമ്പ്',
        note: 'മഴയിൽ കുടുങ്ങിയ കുടുംബങ്ങൾക്ക് കുടിവെള്ളവും ഭക്ഷണവും ഫസ്റ്റ്-എയ്ഡും ഇറക്കി!',
      },
      {
        id: 'unity',
        emoji: '🏥',
        shortLabel: 'മെഡിക്കൽ ക്യാമ്പ്',
        label: 'അടിയന്തര മെഡിക്കൽ ക്യാമ്പ്',
        note: 'പ്രതിസന്ധിയിൽ കൃത്യസമയത്ത് മരുന്നും രക്ഷാ കിറ്റും എത്തിച്ചു!',
      },
    ],
    doneMessage: '🚁 സല്യൂട്ട്! വിഖായ & അലേർട്ട് ഹെലികോപ്റ്റർ എല്ലാ ക്യാമ്പുകളിലും കൃത്യമായി സഹായം എത്തിച്ചു! (+25 XP)',
  },
  l4_cyber_shield: {
    engine: 'cyber_shield_arcade',
    title: '🛡️ SKSSF മീഡിയ & സൈബർ വിംഗ് (സൈകോൺ / Cycone) കവച ബ്ലോക്കർ!',
    subtitle: 'നമ്മുടെ നാടിന്റെ ടവറിലേക്ക് പറന്നുവരുന്ന സന്ദേശങ്ങൾ നോക്കൂ — വ്യാജവാർത്തയാണെങ്കിൽ സൈബർ വിംഗ് ഷീൽഡ് കൊണ്ട് തടുക്കൂ, സത്യവാർത്തയാണെങ്കിൽ കടത്തിവിടൂ!',
    waves: [
      {
        id: 'w1',
        isFake: true,
        emoji: '🔥',
        text: 'ഉറവിടമില്ലാത്ത ഭയപ്പെടുത്തുന്ന ഫോർവേഡ്!',
        feedback: '🛡️ കൃത്യം! വ്യാജവാർത്ത ആകാശത്ത് വെച്ച് തന്നെ സൈബർ വിംഗ് ഷീൽഡ് കൊണ്ട് തകർത്തു!',
      },
      {
        id: 'w2',
        isFake: false,
        emoji: '🩸',
        text: 'ഔദ്യോഗിക SKSSF വിഖായ രക്തദാന ക്യാമ്പ് അറിയിപ്പ്',
        feedback: '✅ സൂപ്പർ! സത്യസന്ധമായ സേവന അറിയിപ്പ് നാടിന്റെ ടവറിലേക്ക് സുരക്ഷിതമായി കടത്തിവിട്ടു!',
      },
      {
        id: 'w3',
        isFake: true,
        emoji: '🤬',
        text: 'പ്രകോപന വീഡിയോ — കമന്റ് യുദ്ധ കെണി!',
        feedback: '🛡️ മിടുക്കൻ! തർക്കുൽ മാലായഅ്നി — കമന്റ് യുദ്ധ കെണി തടുത്തുനിർത്തി!',
      },
      {
        id: 'w4',
        isFake: false,
        emoji: '📚',
        text: 'SKSSF TREND (TASTE & Educare) കരിയർ ക്ലാസ്സ് ലിങ്ക്',
        feedback: '✅ ഗംഭീരം! ഉപകാരപ്രദമായ TREND വിദ്യാഭ്യാസ ലിങ്ക് കൂട്ടുകാർക്ക് എത്തിച്ചുകൊടുത്തു!',
      },
    ],
    doneMessage: '🛡️ ഡിജിറ്റൽ വിജയം! SKSSF സൈബർ വിംഗ് കവചം കൊണ്ട് ടവർ 100% സുരക്ഷിതമാക്കി! (+25 XP)',
  },
  pov_journey: {
    engine: 'helicopter_rescue_drop',
    title: '🚁 എന്റെ യൂണിറ്റ് — സമ്മേളന നോട്ടീസും കിറ്റും എയർഡ്രോപ്പ് (POV)!',
    subtitle: 'ഹെലികോപ്റ്റർ മഹല്ലിലെ 3 കേന്ദ്രങ്ങൾക്ക് മുകളിൽ എത്തുമ്പോൾ കൊടുങ്കാറ്റ് ഒഴിവാക്കി 🪂 യൂണിറ്റ് കിറ്റ് ഇറക്കൂ!',
    kitEmoji: '📦',
    pads: [
      { id: 'pj1', emoji: '🕌', shortLabel: 'മഹല്ല് പള്ളി', label: 'മഹല്ല് പള്ളി മുറ്റം', note: 'മഹല്ല് പള്ളിയിൽ ജുമുഅ അറിയിപ്പും നോട്ടീസും എത്തിച്ചു!' },
      { id: 'pj2', emoji: '🏫', shortLabel: 'മദ്‌റസ ഹാൾ', label: 'മദ്‌റസ പഠന ഹാൾ', note: 'SKSBV വിദ്യാർത്ഥികൾക്ക് പഠന കിറ്റും നോട്ട്ബുക്കുകളും നൽകി!' },
      { id: 'pj3', emoji: '🏠', shortLabel: 'യൂണിറ്റ് ഓഫീസ്', label: 'SKSSF യൂണിറ്റ് ഓഫീസ്', note: 'യൂണിറ്റ് അസംബ്ലിക്ക് വേണ്ട എല്ലാ ഒരുക്കങ്ങളും പൂർത്തിയാക്കി!' },
    ],
    doneMessage: '🚁 മനോഹരം! എന്റെ യൂണിറ്റിലെ മൂന്ന് കേന്ദ്രങ്ങളിലും കൃത്യമായി എയർഡ്രോപ്പ് പൂർത്തിയാക്കി! (+25 XP)',
  },
  l4_climb: {
    engine: 'airplane_sic_flight',
    title: '✈️ കരിപ്പൂർ മുതൽ ഗ്ലോബൽ SIC വരെ — അന്താരാഷ്ട്ര വിമാന യാത്ര!',
    subtitle: 'കരിപ്പൂർ അന്താരാഷ്ട്ര എയർപോർട്ട് (CCJ) റൺവേയിൽ നിന്ന് പറന്നുയർന്ന് കൊടുങ്കാറ്റ് ഒഴിവാക്കി ദുബായ് SIC, ദോഹ SIC, റിയാദ് SIC കേന്ദ്രങ്ങളിലൂടെ ജിദ്ദ/മക്ക എയർപോർട്ടിൽ ലാൻഡ് ചെയ്യൂ!',
    departureAirport: 'കരിപ്പൂർ അന്താരാഷ്ട്ര എയർപോർട്ട് (CCJ)',
    arrivalAirport: 'ജിദ്ദ / മക്ക അന്താരാഷ്ട്ര എയർപോർട്ട്',
    hubs: [
      { id: 'sic_dxb', lane: 0, emoji: '🇦🇪', shortLabel: 'ദുബായ് SIC', label: 'യു.എ.ഇ — ദുബായ് SIC സെന്റർ', note: 'ദുബായ് സമസ്ത ഇസ്‌ലാമിക് സെന്റർ (SIC) പ്രവർത്തകരെ അന്താരാഷ്ട്ര യാത്രയിൽ ചേർത്തു!' },
      { id: 'sic_doh', lane: 2, emoji: '🇶🇦', shortLabel: 'ദോഹ SIC', label: 'ഖത്തർ — ദോഹ SIC പ്രവാസി കേന്ദ്രം', note: 'ദോഹ SIC പ്രവാസി വിദ്യാഭ്യാസ-സേവന കേന്ദ്രം സന്ദർശിച്ച് പ്രതിനിധികളെ കൂട്ടി!' },
      { id: 'sic_ruh', lane: 1, emoji: '🇸🇦', shortLabel: 'റിയാദ് SIC & ഹജ്ജ്', label: 'സൗദി — റിയാദ് SIC & മക്ക ഹജ്ജ് വിഖായ', note: 'റിയാദ് SIC കേന്ദ്രവും മക്ക-മദീന ഹജ്ജ് വിഖായ സേവനവും സന്ദർശിച്ചു!' },
    ],
    doneMessage: '✈️🌍 വിസ്മയം! കരിപ്പൂരിൽ നിന്ന് ഗൾഫ് SIC കേന്ദ്രങ്ങളിലൂടെ ജിദ്ദ/മക്ക റൺവേയിൽ സുരക്ഷിതമായി ലാൻഡ് ചെയ്തു! (+25 XP)',
  },
  l4_sahachari: {
    engine: 'ship_harbor_sail',
    title: '⛵ സഹചാരി കായൽ ആംബുലൻസ് ബോട്ട് സേവനം!',
    subtitle: 'പാറക്കെട്ടുകളും ചുഴികളും ഒഴിവാക്കി കായലിലൂടെ സഹചാരി ബോട്ട് ഓടിച്ച് 3 കേന്ദ്രങ്ങളിലും രക്തദാനവും മരുന്നും ഭക്ഷ്യക്കിറ്റും എത്തിക്കൂ!',
    islands: [
      {
        id: 'sah1',
        lane: 0,
        emoji: '🩸',
        label: 'മെഡിക്കൽ കോളേജ് ബ്ലഡ് ബാങ്ക്',
        note: 'അടിയന്തര ഘട്ടത്തിൽ രോഗിക്ക് സമയത്ത് രക്തം എത്തിച്ചു — മാഷാ അല്ലാഹ്!',
      },
      {
        id: 'sah2',
        lane: 2,
        emoji: '💊',
        label: 'ഡയാലിസിസ് & ചികിത്സാ കേന്ദ്രം',
        note: 'നിർധന രോഗിക്ക് മരുന്നും സഹചാരി ചികിത്സാ സഹായവും കൈമാറി!',
      },
      {
        id: 'sah3',
        lane: 1,
        emoji: '🏠',
        label: 'സഹചാരി ഭവന & ഭക്ഷ്യ കിറ്റ് കേന്ദ്രം',
        note: 'ജാതി-മത ഭേദമന്യേ അവശത അനുഭവിക്കുന്ന കുടുംബത്തിന് ആശ്വാസം എത്തിച്ചു!',
      },
    ],
    doneMessage: '⛵ അൽഹംദുലില്ലാഹ്! സഹചാരി കായൽ ആംബുലൻസ് ബോട്ട് കാരുണ്യ ദൗത്യം വിജയകരമായി പൂർത്തിയാക്കി! (+25 XP)',
  },
  l4_trend_career: {
    engine: 'trend_career_compass',
    title: '🎓 TREND കരിയർ ഗൈഡൻസ് ഹെൽപ്പ്‌ഡെസ്ക് എക്സ്പ്രസ്!',
    subtitle: 'കേരളത്തിലെ 5 വിദ്യാർത്ഥികൾ തങ്ങളുടെ സ്വപ്നങ്ങളുമായി TREND ഡെസ്കിൽ എത്തിയിരിക്കുന്നു — ഓരോരുത്തർക്കും കൃത്യമായ TREND വഴി തിരഞ്ഞെടുത്ത് നൽകൂ!',
    tracks: [
      { id: 'ias', emoji: '⚖️', label: 'Future India (IAS/IPS)', color: '#4F46E5' },
      { id: 'neet', emoji: '🩺', label: 'മെഡിക്കൽ / NEET', color: '#059669' },
      { id: 'ca', emoji: '📊', label: 'CA & ഫിനാൻസ്', color: '#0284C7' },
      { id: 'taste', emoji: '🎤', label: 'TASTE വ്യക്തിത്വം', color: '#D97706' },
      { id: 'educare', emoji: '🌍', label: 'Educare സ്കോളർഷിപ്പ്', color: '#7C3AED' },
    ],
    students: [
      {
        id: 'st1',
        avatar: '🧑‍⚕️',
        name: 'ആയിഷ (പ്ലസ് ടു സയൻസ്)',
        dream: 'എനിക്ക് ഡോക്ടറായി പാവപ്പെട്ട രോഗികളെ ചികിത്സിക്കാൻ ആഗ്രഹമുണ്ട്!',
        correctTrackId: 'neet',
        tip: 'സൂപ്പർ! ആയിഷയ്ക്ക് TREND മെഡിക്കൽ / NEET മാർഗ്ഗനിർദ്ദേശം കൃത്യമായി നൽകി!',
      },
      {
        id: 'st2',
        avatar: '👨‍⚖️',
        name: 'അബ്ദുല്ല (ബിരുദ വിദ്യാർത്ഥി)',
        dream: 'എനിക്ക് ജില്ലാ കളക്ടറായി (IAS) നാടിനെ സത്യസന്ധമായി സേവിക്കണം!',
        correctTrackId: 'ias',
        tip: 'മിടുക്കൻ! സിവിൽ സർവീസ് സ്വപ്നത്തിന് TREND Future India വിഭാഗം തിരഞ്ഞെടുത്തു!',
      },
      {
        id: 'st3',
        avatar: '🧑‍💼',
        name: 'ഫാത്തിമ (കൊമേഴ്‌സ്)',
        dream: 'കണക്കുകളും ഓഡിറ്റിംഗും എനിക്ക് വലിയ ഇഷ്ടമാണ് — ചാർട്ടേഡ് അക്കൗണ്ടന്റ് ആകണം!',
        correctTrackId: 'ca',
        tip: 'കൃത്യം! ഫാത്തിമയ്ക്ക് TREND CA & ഫിനാൻസ് കോച്ചിംഗ് വഴി കാണിച്ചു!',
      },
      {
        id: 'st4',
        avatar: '🗣️',
        name: 'മുഹമ്മദ് (ഹൈസ്കൂൾ)',
        dream: 'വേദിയിൽ കയറി പേടിയില്ലാതെ പ്രസംഗിക്കാനും നേതൃപാടവം വളർത്താനും പഠിക്കണം!',
        correctTrackId: 'taste',
        tip: 'അടിപൊളി! ആത്മവിശ്വാസത്തിനും പ്രസംഗത്തിനും TREND TASTE ക്യാമ്പ് മികച്ചതാണ്!',
      },
      {
        id: 'st5',
        avatar: '🎒',
        name: 'സൽമാൻ (മികച്ച പഠിതാവ്)',
        dream: 'ഉന്നത സർവകലാശാലയിൽ പഠിക്കാൻ ആഗ്രഹമുണ്ട്, പക്ഷേ ഫീസ് കണ്ടെത്താൻ സ്കോളർഷിപ്പ് വേണം!',
        correctTrackId: 'educare',
        tip: 'ഗംഭീരം! സൽമാന് TREND Educare സ്കോളർഷിപ്പ് & ഫെലോഷിപ്പ് സഹായം ഉറപ്പാക്കി!',
      },
    ],
    doneMessage: '🎓🏆 ഗംഭീരം! TREND കരിയർ ഗൈഡൻസ് ഡെസ്കിലെ എല്ലാ വിദ്യാർത്ഥികൾക്കും ശരിയായ വഴി കാണിച്ചുകൊടുത്തു! (+25 XP)',
  },
  l4_sargalayam: {
    engine: 'sargalayam_spotlight',
    title: '🎨 SKSSF സർഗ്ഗലയം — കലോത്സവ വേദി ഡയറക്ടർ!',
    subtitle: 'കലോത്സവത്തിന് എത്തുന്ന ഓരോ മത്സരവും ശരിയായ സർഗ്ഗലയം വേദിയിലേക്ക് അയക്കൂ — ധാർമ്മിക മൂല്യങ്ങൾക്ക് വിരുദ്ധമായ പരിപാടി 🚫 വിലക്കൂ!',
    acts: [
      {
        id: 'sg_a1',
        emoji: '📖',
        title: 'ഖുർആൻ പാരായണം & ഉറുദു/മലയാളം പ്രസംഗം',
        detail: 'മനോഹരമായ തജ്‌വീദോടെയുള്ള ഖിറാഅത്തും ആശയസമ്പുഷ്ടമായ പ്രഭാഷണവും.',
        stage: 'speech',
        note: 'കൃത്യം! പ്രസംഗം & ഖിറാഅത്ത് മുഖ്യ വേദിയിലേക്ക് അയച്ചു!',
      },
      {
        id: 'sg_a2',
        emoji: '🎶',
        title: 'ഇശൽ മാപ്പിളപ്പാട്ട് & ബുർദ ആലാപനം',
        detail: 'പൈതൃക ഇസ്‌ലാമിക കാവ്യങ്ങളുടെയും പ്രവാചക പ്രകീർത്തനങ്ങളുടെയും അവതരണം.',
        stage: 'song',
        note: 'സൂപ്പർ! മാപ്പിളപ്പാട്ട് & ബുർദ വേദിയിലേക്ക് കൃത്യമായി അയച്ചു!',
      },
      {
        id: 'sg_a3',
        emoji: '🚫',
        title: 'അനുചിത ബഹളവും അനാദരവ് പ്രദർശനവും',
        detail: 'ധാർമ്മിക മൂല്യങ്ങൾക്കും സർഗ്ഗലയം അച്ചടക്കത്തിനും വിരുദ്ധമായ പരിപാടി.',
        stage: 'reject',
        note: 'മിടുക്കൻ! മൂല്യബോധമുള്ള സർഗ്ഗലയം വേദിയിൽ അനുചിത പരിപാടിക്ക് വിലക്കേർപ്പെടുത്തി!',
      },
      {
        id: 'sg_a4',
        emoji: '✒️',
        title: 'അറബി കലിഗ്രഫി & കഥാരചന',
        detail: 'മനോഹരമായ അറബി കൈയെഴുത്തും സാഹിത്യ സൃഷ്ടികളുടെ പ്രദർശനവും.',
        stage: 'art',
        note: 'അടിപൊളി! കലിഗ്രഫി & സാഹിത്യ പവലിയനിലേക്ക് വിജയകരമായി അയച്ചു!',
      },
      {
        id: 'sg_a5',
        emoji: '🎙️',
        title: 'സമകാലിക വിഷയ സംവാദം (Debate)',
        detail: 'വിദ്യാർത്ഥികളുടെ യുക്തിയും വിനയവും തെളിയിക്കുന്ന സംവാദ മത്സരം.',
        stage: 'speech',
        note: 'ഗംഭീരം! പ്രസംഗം & സംവാദ വേദിയിൽ അവസാന എൻട്രിയും തിളങ്ങി!',
      },
    ],
    doneMessage: '🎨🏆 അടിപൊളി! മൂല്യബോധമുള്ള SKSSF സർഗ്ഗലയം കലോത്സവ വേദികൾ ഗംഭീരമായി നിയന്ത്രിച്ചു! (+25 XP)',
  },
  l4_green_earth: {
    engine: 'green_campus_sort',
    title: '♻️ ഹരിത ക്യാമ്പസ് — ഗ്രീൻ പ്രോട്ടോക്കോൾ വേർതിരിക്കൽ കൺവെയർ!',
    subtitle: 'ക്യാമ്പസിൽ നിന്ന് വരുന്ന ഓരോ വസ്തുവും 🌿 ജൈവവള ബിൻ, ♻️ റീസൈക്കിൾ ബിൻ, 🌱 ഗ്രീൻ മാതൃക എന്നിങ്ങനെ കൃത്യമായി വേർതിരിക്കൂ!',
    items: [
      {
        id: 'gc1',
        emoji: '🍂',
        label: 'ഉണങ്ങിയ മരയിലകൾ',
        bin: 'compost',
        note: 'ഉണങ്ങിയ ഇലകൾ ജൈവവളമാക്കി ക്യാമ്പസ് ചെടികൾക്ക് വളമാക്കി!',
      },
      {
        id: 'gc2',
        emoji: '📰',
        label: 'പഴയ പത്രങ്ങളും നോട്ട്ബുക്ക് പേപ്പറും',
        bin: 'recycle',
        note: 'പേപ്പറുകൾ റീസൈക്കിൾ ബിന്നിൽ ഇട്ട് മരങ്ങളെ സംരക്ഷിച്ചു!',
      },
      {
        id: 'gc3',
        emoji: '🛍️',
        label: 'തുണി സഞ്ചിയും സ്റ്റീൽ ഗ്ലാസും',
        bin: 'green_alt',
        note: 'പ്ലാസ്റ്റിക് ഒഴിവാക്കുന്ന തുണി സഞ്ചിയും സ്റ്റീൽ ഗ്ലാസും മികച്ച ഗ്രീൻ മാതൃക!',
      },
      {
        id: 'gc4',
        emoji: '🍌',
        label: 'പഴത്തൊലിയും ഭക്ഷ്യാവശിഷ്ടവും',
        bin: 'compost',
        note: 'ജൈവ മാലിന്യം കമ്പോസ്റ്റ് പിറ്റിൽ ഇട്ട് മണ്ണിനെ സമ്പുഷ്ടമാക്കി!',
      },
      {
        id: 'gc5',
        emoji: '🧴',
        label: 'വൃത്തിയാക്കിയ പ്ലാസ്റ്റിക് കുപ്പി',
        bin: 'recycle',
        note: 'പ്ലാസ്റ്റിക് കുപ്പികൾ വലിച്ചെറിയാതെ റീസൈക്കിൾ ശേഖരണത്തിൽ നൽകി!',
      },
      {
        id: 'gc6',
        emoji: '🌱',
        label: 'പൊതുസ്ഥലത്ത് നടാനുള്ള തൈ',
        bin: 'green_alt',
        note: '“തൈ നടുന്നത് സ്വദഖയാണ്” — ഗ്രീൻ ക്യാമ്പസ് മാതൃക പൂർത്തിയായി!',
      },
    ],
    doneMessage: '♻️🌿 മാഷാ അല്ലാഹ്! 50-ാം പാഠത്തിലെ ഹരിത ക്യാമ്പസ് ഗ്രീൻ പ്രോട്ടോക്കോൾ വിജയകരമായി പൂർത്തിയാക്കി! (+25 XP)',
  },
};

/* ============================================================================
 * REUSABLE IN-STAGE FAILURE & RETRY OVERLAY (WORKS IN NORMAL & FULLSCREEN)
 * ========================================================================== */
const InStageFailOverlay: React.FC<{
  title?: string;
  reason: string;
  scoreText?: string;
  onRetry: () => void;
}> = ({ title = '💥 ഷീൽഡുകൾ തകർന്നു!', reason, scoreText, onRetry }) => (
  <GameDefeatBurstOverlay
    title={title}
    reason={reason}
    scoreText={scoreText}
    onRetry={onRetry}
  />
);

/* ============================================================================
 * ICON-FIRST ARCADE GAME PEDALS (NO BORING TEXT LABELS — INSTANTLY RECOGNIZABLE!)
 *  - GameBrakePedal: Sculpted red metallic car brake pedal + stop emblem
 *  - GameGasPedal  : Sculpted angled emerald/lime racing accelerator pedal + »» chevrons
 * ========================================================================== */
const GameBrakePedal: React.FC<{
  disabled: boolean;
  highlight?: boolean;
  onClick: () => void;
}> = ({ disabled, highlight = false, onClick }) => (
  <motion.button
    type="button"
    disabled={disabled}
    whileTap={!disabled ? { scale: 0.9, y: 4 } : {}}
    onClick={onClick}
    aria-label="ബ്രേക്ക് (നിർത്തുക)"
    title="ബ്രേക്ക്"
    className={`relative h-14 sm:h-16 rounded-2xl border-2 border-b-4 flex items-center justify-center transition-all select-none ${
      disabled
        ? 'bg-slate-800/90 border-slate-700 text-slate-500 cursor-not-allowed opacity-55'
        : highlight
        ? 'bg-gradient-to-b from-rose-500 to-rose-700 border-rose-300 border-b-rose-950 text-white ring-4 ring-amber-300 shadow-[0_0_24px_rgba(244,63,94,0.8)]'
        : 'bg-gradient-to-b from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 border-rose-400/70 border-b-rose-950 text-white shadow-lg'
    }`}
  >
    {/* Sculpted Brake Pedal Pad Graphic */}
    <svg viewBox="0 0 68 44" className="w-12 h-8 sm:w-14 sm:h-9 drop-shadow" aria-hidden="true">
      {/* Pedal stem */}
      <rect x="29" y="0" width="10" height="9" rx="2" fill="#94A3B8" />
      {/* Wide rubber-grip brake pad */}
      <rect x="6" y="7" width="56" height="33" rx="8" fill={disabled ? '#334155' : '#1E293B'} stroke={disabled ? '#475569' : '#FDA4AF'} strokeWidth="2.2" />
      {/* Anti-slip grip grooves */}
      <line x1="15" y1="15" x2="15" y2="32" stroke={disabled ? '#64748B' : '#FB7185'} strokeWidth="3" strokeLinecap="round" />
      <line x1="53" y1="15" x2="53" y2="32" stroke={disabled ? '#64748B' : '#FB7185'} strokeWidth="3" strokeLinecap="round" />
      {/* Center Stop Square / Brake Icon */}
      <rect x="26" y="15" width="16" height="16" rx="3" fill={disabled ? '#64748B' : '#F43F5E'} stroke="#FFFFFF" strokeWidth="1.8" />
    </svg>
    {highlight && !disabled && (
      <motion.span
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 0.55, repeat: Infinity }}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 border-2 border-white flex items-center justify-center text-xs font-black shadow"
      >
        !
      </motion.span>
    )}
  </motion.button>
);

const GameGasPedal: React.FC<{
  disabled: boolean;
  running: boolean;
  readyPulse?: boolean;
  onClick: () => void;
}> = ({ disabled, running, readyPulse = false, onClick }) => (
  <motion.button
    type="button"
    disabled={disabled}
    whileTap={!disabled ? { scale: 0.9, y: 4 } : {}}
    onClick={onClick}
    aria-label="മുന്നോട്ട് ഓടിക്കുക"
    title="മുന്നോട്ട്"
    className={`relative h-14 sm:h-16 rounded-2xl border-2 border-b-4 flex items-center justify-center gap-1.5 transition-all select-none ${
      running
        ? 'bg-emerald-950 border-emerald-600 text-emerald-300 cursor-default shadow-inner'
        : disabled
        ? 'bg-slate-800/90 border-slate-700 text-slate-500 cursor-not-allowed opacity-55'
        : readyPulse
        ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 border-emerald-200 border-b-emerald-900 text-slate-950 ring-4 ring-emerald-300/80 shadow-[0_0_24px_rgba(16,185,129,0.75)]'
        : 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 border-emerald-300/80 border-b-emerald-950 text-white shadow-lg'
    }`}
  >
    {/* Tall Angled Racing Gas Pedal + Animated Forward Chevrons (»») */}
    <svg viewBox="0 0 74 48" className="w-14 h-9 sm:w-16 sm:h-10 drop-shadow" aria-hidden="true">
      {/* Tall pedal arm */}
      <rect x="20" y="2" width="22" height="42" rx="6" fill={running ? '#064E3B' : '#0F172A'} stroke={running ? '#34D399' : '#A7F3D0'} strokeWidth="2.2" transform="skewX(-8)" />
      {/* Pedal tread bars */}
      <line x1="21" y1="13" x2="35" y2="13" stroke={running ? '#10B981' : '#34D399'} strokeWidth="2.8" strokeLinecap="round" />
      <line x1="20" y1="21" x2="34" y2="21" stroke={running ? '#10B981' : '#34D399'} strokeWidth="2.8" strokeLinecap="round" />
      <line x1="19" y1="29" x2="33" y2="29" stroke={running ? '#10B981' : '#34D399'} strokeWidth="2.8" strokeLinecap="round" />
      <line x1="18" y1="37" x2="32" y2="37" stroke={running ? '#10B981' : '#34D399'} strokeWidth="2.8" strokeLinecap="round" />
      {/* Forward Double Chevrons (GO »») */}
      <motion.g
        animate={running || readyPulse ? { x: [0, 4, 0] } : { x: 0 }}
        transition={{ duration: running ? 0.45 : 0.9, repeat: Infinity }}
      >
        <path d="M46 13 L56 24 L46 35" fill="none" stroke={running ? '#6EE7B7' : '#FEF08A'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M58 13 L68 24 L58 35" fill="none" stroke={running ? '#34D399' : '#FFFFFF'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </svg>
  </motion.button>
);

/* ============================================================================
 * AUTHENTIC OFFICIAL SKSSF / SAMASTHA VECTOR FLAG WITH EXACT CRESCENT, STAR,
 * MOSQUE DOME, MINARET & DIRECTION-AWARE WIND FLUTTER PHYSICS!
 *  - flyDirection="right": Stationary pole on LEFT, cloth waves RIGHT (opening upper-left toward pole)
 *  - flyDirection="left" : Moving forward RIGHT, pole on RIGHT, cloth streams BACKWARD LEFT (opening upper-right toward pole)
 * ========================================================================== */
const MiniOfficialFlagSvg: React.FC<{
  x: number;
  y: number;
  width?: number;
  height?: number;
  variant?: 'skssf' | 'skju';
  flyDirection?: 'right' | 'left';
  windSpeed?: 'idle' | 'fast';
}> = ({
  x,
  y,
  width = 44,
  height = 28,
  variant = 'skssf',
  flyDirection = 'right',
  windSpeed = 'idle',
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const maskId = `mflag-crescent-${uid}`;
  const clipId = `mflag-clip-${uid}`;
  const sx = width / 94;
  const sy = height / 56;
  const cantonFill = variant === 'skssf' ? '#0EA5E9' : '#8C1D40';
  const isLeft = flyDirection === 'left';
  const fast = windSpeed === 'fast';

  return (
    <g transform={`translate(${x}, ${y}) scale(${sx}, ${sy})`}>
      <defs>
        {/* Exact Official Crescent Mask: Opening faces UPPER-HOIST toward the pole! */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-16" y="-16" width="32" height="32">
          <rect x="-20" y="-20" width="40" height="40" fill="black" />
          <circle cx="0" cy="0" r="10.2" fill="white" />
          <circle cx={isLeft ? 3.5 : -3.5} cy="-3.1" r="8.5" fill="black" />
        </mask>
        <clipPath id={clipId}>
          {isLeft ? (
            <path d="M 94,0 C 70,-2.2 44,2.6 20,-1.4 C 10,-2.8 4,-1 0,0.5 L 0,55.5 C 4,54 10,52.2 20,53.6 C 44,57.6 70,52.8 94,56 Z" />
          ) : (
            <path d="M 0,0 C 24,-2.2 50,2.6 74,-1.4 C 84,-2.8 90,-1 94,0.5 L 94,55.5 C 90,54 84,52.2 74,53.6 C 50,57.6 24,52.8 0,56 Z" />
          )}
        </clipPath>
      </defs>

      <motion.g
        animate={
          fast
            ? {
                skewY: isLeft ? [-3, 3.4, -2.2, 2.9, -3] : [3, -3.4, 2.2, -2.9, 3],
                scaleX: [1, 0.94, 1.02, 0.955, 1],
              }
            : {
                skewY: isLeft ? [-1.6, 2.0, -1.2, 1.6, -1.6] : [1.6, -2.0, 1.2, -1.6, 1.6],
                scaleX: [1, 0.975, 1.008, 0.98, 1],
              }
        }
        transition={{ duration: fast ? 0.78 : 1.75, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: isLeft ? '94px 28px' : '0px 28px' }}
      >
        <g clipPath={`url(#${clipId})`}>
          {/* Base White Field */}
          <rect x="0" y="-4" width="94" height="64" fill="#FFFFFF" />

          {/* Mosque Dome + Tall Left Minaret on White Field */}
          <g
            transform={isLeft ? 'translate(10, 5)' : 'translate(48, 5)'}
            fill="none"
            stroke="#0F172A"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="3.5" height="23" fill="#FFFFFF" />
            <line x1="2" y1="14" x2="5.5" y2="14" />
            <path d="M 1.5,7 C 1.5,4 6,4 6,7 Z" fill="#0F172A" />
            <line x1="3.75" y1="2" x2="3.75" y2="4.5" />
            <path d="M 7.5,25 C 8.5,14 18,10.5 20,6.5 C 22,10.5 31.5,14 32.5,25 Z" fill="#FFFFFF" />
            <path d="M 20,6.5 L 20,25" />
            <path d="M 20,6.5 C 16.5,13 15.5,19 15.5,25" />
            <path d="M 20,6.5 C 23.5,13 24.5,19 24.5,25" />
            <path d="M 10,18 Q 20,20.5 30,18" />
            <line x1="20" y1="3" x2="20" y2="6.5" />
            <path d="M 6,25 L 34,25 L 35.5,30 L 4.5,30 Z" fill="#FFFFFF" />
          </g>

          {/* Hoist-Side Canton Sewn Against the Flagpole */}
          <rect x={isLeft ? 58 : 0} y="-4" width="36" height="43" fill={cantonFill} />

          {/* Official White Crescent & 5-Pointed Star Nestled Inside Opening */}
          <g transform={isLeft ? 'translate(75, 20)' : 'translate(19, 20)'}>
            <circle cx="0" cy="0" r="10.2" fill="#FFFFFF" mask={`url(#${maskId})`} />
            {isLeft ? (
              <polygon
                points="4.1,-7.4 5.0,-4.9 7.6,-4.8 5.5,-3.2 6.3,-0.7 4.1,-2.2 1.9,-0.7 2.7,-3.2 0.6,-4.8 3.2,-4.9"
                fill="#FFFFFF"
              />
            ) : (
              <polygon
                points="-4.1,-7.4 -3.2,-4.9 -0.6,-4.8 -2.7,-3.2 -1.9,-0.7 -4.1,-2.2 -6.3,-0.7 -5.5,-3.2 -7.6,-4.8 -5.0,-4.9"
                fill="#FFFFFF"
              />
            )}
          </g>

          {/* Bottom Official Green Strip (#16A34A) — SKSSF Text for SKSSF, Clean Solid Green for Samastha (flag_111154.jpg) */}
          <rect x="0" y="39" width="94" height="21" fill="#16A34A" />
          {variant === 'skssf' && (
            <text
              x="47"
              y="51.2"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11.5"
              fontWeight="900"
              letterSpacing="2.2"
              fontFamily="Georgia, serif"
            >
              SKSSF
            </text>
          )}
        </g>

        {/* Crisp Rippled Border */}
        <path
          d={
            isLeft
              ? 'M 94,0 C 70,-2.2 44,2.6 20,-1.4 C 10,-2.8 4,-1 0,0.5 L 0,55.5 C 4,54 10,52.2 20,53.6 C 44,57.6 70,52.8 94,56 Z'
              : 'M 0,0 C 24,-2.2 50,2.6 74,-1.4 C 84,-2.8 90,-1 94,0.5 L 94,55.5 C 90,54 84,52.2 74,53.6 C 50,57.6 24,52.8 0,56 Z'
          }
          fill="none"
          stroke="#0F172A"
          strokeWidth="1.35"
        />
      </motion.g>
    </g>
  );
};

/* ============================================================================
 * ENGINE 1: MASJID & MADRASA GARDEN WATERING JUG GAME (NO WASTING WATER!)
 *  - Gliding Watering Jug moves smoothly over the Masjid & Madrasa courtyard
 *  - Tap the big animated 💧 icon button ONLY when spout is over a thirsty pot!
 *  - Pouring on empty brick ground or an already-watered plant WASTES water!
 *  - Wasting water twice (or running out of jug water) = GAME OVER + Retry!
 * ========================================================================== */
const TreeRainGardenGame: React.FC<{
  config: TreeRainConfig;
  onWin: () => void;
  resetSignal: number;
}> = ({ config, onWin, resetSignal }) => {
  const isFullscreen = useGameFullscreen();
  const [jugX, setJugX] = useState(110);
  const [grown, setGrown] = useState<number[]>([]);
  const [pouring, setPouring] = useState<'idle' | 'hit' | 'waste'>('idle');
  const [pourX, setPourX] = useState(110);
  const [waterLeft, setWaterLeft] = useState(5);
  const [wastedCount, setWastedCount] = useState(0);
  const [failedReason, setFailedReason] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [tappedPotIdx, setTappedPotIdx] = useState<number | null>(null);
  const [msg, setMsg] = useState(
    'ജഗ്ഗ് കൃത്യമായി വാടിയ ചെടിക്ക് മുകളിൽ എത്തുമ്പോൾ താഴെയുള്ള 💧 ചിഹ്നം അമർത്തൂ! തറയിൽ വെള്ളം പാഴാക്കിയാൽ കളി ഔട്ട് ആകും!'
  );

  const dirRef = useRef(1);
  const jugXRef = useRef(110);
  const spotXs = [130, 300, 470];
  const allGrown = grown.length === config.spots.length;
  const failed = Boolean(failedReason);

  const resetLocal = () => {
    jugXRef.current = 110;
    dirRef.current = 1;
    setJugX(110);
    setGrown([]);
    setPouring('idle');
    setPourX(76);
    setWaterLeft(5);
    setWastedCount(0);
    setFailedReason(null);
    setTappedPotIdx(null);
    setMsg(
      'ജഗ്ഗ് കൃത്യമായി വാടിയ ചെടിക്ക് മുകളിൽ എത്തുമ്പോൾ താഴെയുള്ള 💧 ചിഹ്നം അമർത്തൂ! തറയിൽ വെള്ളം പാഴാക്കിയാൽ കളി ഔട്ട് ആകും!'
    );
  };

  useEffect(() => {
    resetLocal();
  }, [resetSignal]);

  // Silky-smooth 60fps requestAnimationFrame glide (zero stutter!)
  useEffect(() => {
    if (allGrown || failed || pouring !== 'idle') return;
    let rafId = 0;
    let lastTs = performance.now();
    const speedPxPerSec = 175;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      let next = jugXRef.current + dirRef.current * speedPxPerSec * dt;
      if (next >= 530) {
        next = 530;
        dirRef.current = -1;
      } else if (next <= 95) {
        next = 95;
        dirRef.current = 1;
      }
      jugXRef.current = next;
      setJugX(next);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [allGrown, failed, pouring]);

  // Spout rose tip sits cleanly at -34px from jug center
  const spoutX = jugX - 34;
  const hoveredSpotIdx = spotXs.findIndex((sx) => Math.abs(spoutX - sx) <= 46);
  const overDrySpot = hoveredSpotIdx >= 0 && !grown.includes(hoveredSpotIdx);

  const handlePourWater = () => {
    sound.unlockAudio();
    if (pouring !== 'idle' || failed || allGrown || waterLeft <= 0) return;

    const currentSpout = jugXRef.current - 34;
    setPourX(currentSpout);
    const nextWater = waterLeft - 1;
    setWaterLeft(nextWater);

    const targetIdx = spotXs.findIndex((sx) => Math.abs(currentSpout - sx) <= 46);
    const isHitDry = targetIdx >= 0 && !grown.includes(targetIdx);

    if (isHitDry) {
      setPouring('hit');
      sound.playPop();
      window.setTimeout(() => {
        setPouring('idle');
        const nextGrown = [...grown, targetIdx];
        setGrown(nextGrown);
        const spot = config.spots[targetIdx];
        sound.playSuccess(nextGrown.length);
        setMsg(`✨ ${spot.message}`);
        narrator.speak(spot.message, spot.label);
        if (nextGrown.length === config.spots.length) {
          onWin();
        } else if (nextWater < config.spots.length - nextGrown.length) {
          sound.playError();
          setFailedReason('ജഗ്ഗിലെ വെള്ളം തികയാതെ പോയി! ബാക്കിയുള്ള ചെടികൾ നനയ്ക്കാൻ കഴിഞ്ഞില്ല.');
        }
      }, 560);
    } else {
      setPouring('waste');
      sound.playError();
      const nextWasted = wastedCount + 1;
      setWastedCount(nextWasted);
      const hitAlreadyWatered = targetIdx >= 0 && grown.includes(targetIdx);

      window.setTimeout(() => {
        setPouring('idle');
        const remainingNeeded = config.spots.length - grown.length;
        if (nextWasted >= 2) {
          setFailedReason(
            'വെള്ളം വെറുതെ പാഴാക്കി! 2 തവണ ചെടിക്ക് പുറത്ത് / അധികമായി വെള്ളം ഒഴിച്ചതിനാൽ കളി ഔട്ട് ആയി.'
          );
        } else if (nextWater < remainingNeeded) {
          setFailedReason(
            'വെള്ളം പാഴാക്കിയതിനാൽ ജഗ്ഗിലെ വെള്ളം തികയാതെ പോയി! ശ്രദ്ധിച്ച് ചെടികൾക്ക് മുകളിൽ മാത്രം ഒഴിക്കൂ.'
          );
        } else {
          setMsg(
            hitAlreadyWatered
              ? '⚠️ നനച്ച ചെടിയിൽ തന്നെ വീണ്ടും ഒഴിച്ചു!'
              : '⚠️ ചെടിയില്ലാത്ത തറയിൽ വെള്ളം പാഴായി!'
          );
        }
      }, 560);
    }
  };

  const waterRatio = Math.max(0, Math.min(1, waterLeft / 5));

  return (
    <div className="space-y-2">
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 bg-sky-100 shadow-inner select-none">
        {/* Icon-Only Top HUD */}
        <div className="absolute top-2 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 text-sky-200 text-xs font-extrabold tabular-nums">
              🫖 {waterLeft}/5
            </span>
            <span
              className={`px-2.5 py-1 rounded-xl text-xs font-extrabold tabular-nums ${
                wastedCount > 0 ? 'bg-rose-700 text-white animate-pulse' : 'bg-slate-950/75 text-emerald-200'
              }`}
            >
              💦 {wastedCount}/2
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-950/85 text-amber-300 text-xs font-extrabold tabular-nums">
            🌺 {grown.length}/{config.spots.length}
          </span>
        </div>

        <svg
          viewBox="0 0 600 265"
          className={`w-full block ${isFullscreen ? 'max-h-[66dvh] h-auto mx-auto' : 'h-auto'}`}
          role="img"
          aria-label={config.title}
        >
          <defs>
            <linearGradient id="madrasaGardenSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="62%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#DCFCE7" />
            </linearGradient>
            <linearGradient id="jugBodyGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="55%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="jugSpoutGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0369A1" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
          </defs>

          <rect width="600" height="265" fill="url(#madrasaGardenSky)" />

          {/* Warm Sun (Outer translate + inner rotate so it spins cleanly in place!) */}
          <g transform="translate(542, 46)">
            <motion.g
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <line
                  key={deg}
                  x1="0"
                  y1="-26"
                  x2="0"
                  y2="-32"
                  stroke="#FACC15"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${deg})`}
                />
              ))}
            </motion.g>
            <circle cx="0" cy="0" r="24" fill="#FDE047" opacity="0.32" />
            <circle cx="0" cy="0" r="18" fill="#FACC15" />
          </g>

          {/* Masjid Dome + Madrasa Silhouette in Background */}
          <g opacity="0.92">
            <rect x="205" y="122" width="190" height="72" rx="4" fill="#FEFCE8" stroke="#065F46" strokeWidth="2" />
            <path d="M252 122 Q300 72 348 122 Z" fill="#059669" stroke="#064E3B" strokeWidth="2" />
            <line x1="300" y1="74" x2="300" y2="62" stroke="#F59E0B" strokeWidth="2.5" />
            <circle cx="300" cy="60" r="3" fill="#F59E0B" />
            <rect x="190" y="92" width="16" height="102" fill="#ECFDF5" stroke="#065F46" strokeWidth="1.8" />
            <path d="M188 92 Q198 76 208 92 Z" fill="#047857" />
            <rect x="394" y="92" width="16" height="102" fill="#ECFDF5" stroke="#065F46" strokeWidth="1.8" />
            <path d="M392 92 Q402 76 412 92 Z" fill="#047857" />
            {[232, 278, 324, 362].map((ax) => (
              <path
                key={ax}
                d={`M${ax - 10} 188 L${ax - 10} 152 Q${ax} 138 ${ax + 10} 152 L${ax + 10} 188 Z`}
                fill="#065F46"
                opacity="0.75"
              />
            ))}
          </g>

          {/* Courtyard Lawn & Brick Path */}
          <rect x="0" y="190" width="600" height="75" fill="#22C55E" />
          <rect x="0" y="218" width="600" height="47" fill="#78350F" opacity="0.88" />
          {[60, 185, 240, 360, 415, 540].map((tx) => (
            <line key={tx} x1={tx} y1="218" x2={tx - 10} y2="265" stroke="#92400E" strokeWidth="1.5" opacity="0.55" />
          ))}

          {/* Target Aim Drop Guide Beam under Spout Tip */}
          {!allGrown && !failed && pouring === 'idle' && (
            <line
              x1={spoutX}
              y1="82"
              x2={spoutX}
              y2="204"
              stroke={overDrySpot ? '#16A34A' : '#F43F5E'}
              strokeWidth={overDrySpot ? '3' : '2'}
              strokeDasharray="6 6"
              opacity={overDrySpot ? 0.92 : 0.4}
            />
          )}

          {/* ANIMATED GLIDING WATERING JUG — OUTER <g> HANDLES X POSITION, INNER <motion.g> HANDLES TILT ONLY! */}
          <g transform={`translate(${jugX}, 44)`}>
            <motion.g
              animate={
                pouring === 'waste'
                  ? { rotate: [-18, 12, -14, 10, 0] }
                  : pouring === 'hit'
                  ? { rotate: -26 }
                  : { rotate: overDrySpot ? -8 : 0 }
              }
              transition={{ duration: pouring === 'waste' ? 0.45 : 0.2 }}
              style={{ transformOrigin: '0px 22px' }}
            >
              {/* Soft Shadow under jug */}
              <ellipse cx="0" cy="46" rx="18" ry="3.5" fill="#0F172A" opacity="0.14" />
              {/* Top & Rear Ergonomic Loop Handle */}
              <path
                d="M-6 8 C-4 -6 22 -6 24 12 C26 24 24 34 15 34"
                fill="none"
                stroke="#0369A1"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Spout Neck pointing cleanly left-down */}
              <path
                d="M-14 22 L-33 30 L-30 37 L-11 32 Z"
                fill="url(#jugSpoutGrad)"
                stroke="#0C4A6E"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Brass Rose Sprinkler Head */}
              <ellipse
                cx="-34"
                cy="34"
                rx="4.8"
                ry="7"
                fill="#FACC15"
                stroke="#92400E"
                strokeWidth="1.6"
                transform="rotate(-24 -34 34)"
              />
              {/* Sculpted Jug Body */}
              <path
                d="M-15 8 L15 8 L19 36 Q19 42 11 42 L-11 42 Q-19 42 -19 36 Z"
                fill="url(#jugBodyGrad)"
                stroke="#0C4A6E"
                strokeWidth="2.2"
              />
              {/* Top Rim Lip */}
              <ellipse cx="0" cy="8" rx="15" ry="3.2" fill="#7DD3FC" stroke="#0C4A6E" strokeWidth="1.6" />
              {/* Live Water Level Gauge Inside Jug */}
              <rect x="-11" y="16" width="22" height="20" rx="4" fill="#0C4A6E" opacity="0.45" />
              <rect
                x="-10"
                y={17 + (1 - waterRatio) * 18}
                width="20"
                height={waterRatio * 18}
                rx="3"
                fill="#7DD3FC"
              />
              <text x="0" y="31" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="900">
                💧{waterLeft}
              </text>
            </motion.g>
          </g>

          {/* REALISTIC CASCADING WATER DROPLETS & RIPPLE SPLASH WHEN POURING */}
          {pouring !== 'idle' && (
            <g>
              {[-7, -2, 3, 8].map((dx, i) => (
                <motion.circle
                  key={dx}
                  cx={pourX + dx * 0.5}
                  cy={84}
                  r={i % 2 === 0 ? 3.8 : 3}
                  fill={pouring === 'waste' ? '#FB7185' : '#38BDF8'}
                  stroke={pouring === 'waste' ? '#E11D48' : '#0284C7'}
                  strokeWidth="1"
                  initial={{ cy: 84, opacity: 0.95 }}
                  animate={{ cy: [84, 204], opacity: [1, 0.9, 0.15] }}
                  transition={{ duration: 0.42, repeat: Infinity, delay: i * 0.08, ease: 'easeIn' }}
                />
              ))}
              {/* Splash Ripple Ring at Ground / Pot Top (Outer translate, inner scale!) */}
              <g transform={`translate(${pourX}, 205)`}>
                <motion.ellipse
                  cx="0"
                  cy="0"
                  rx="24"
                  ry="7"
                  fill="none"
                  stroke={pouring === 'waste' ? '#F43F5E' : '#38BDF8'}
                  strokeWidth="3"
                  initial={{ scale: 0.35, opacity: 1 }}
                  animate={{ scale: [0.35, 1.35], opacity: [1, 0] }}
                  transition={{ duration: 0.48, repeat: Infinity }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
                {pouring === 'waste' && (
                  <text x="0" y="-12" textAnchor="middle" fill="#BE123C" fontSize="16" fontWeight="900">
                    ❌💦
                  </text>
                )}
              </g>
            </g>
          )}

          {/* 3 POTTED GARDEN PLANTS (Outer translate + Inner motion so zero transform bugs!) */}
          {config.spots.map((spot, idx) => {
            const x = spotXs[idx];
            const isGrown = grown.includes(idx);
            const isAimed = hoveredSpotIdx === idx && !isGrown;
            return (
              <g
                key={spot.id}
                transform={`translate(${x}, 200)`}
                className="cursor-pointer"
                onClick={() => {
                  sound.playClick();
                  setTappedPotIdx((cur) => (cur === idx ? null : idx));
                }}
              >
                {/* Glowing Green Aim Halo when spout is over thirsty plant */}
                {isAimed && (
                  <motion.ellipse
                    cx="0"
                    cy="20"
                    rx="44"
                    ry="13"
                    fill="#4ADE80"
                    opacity="0.48"
                    animate={{ scale: [1, 1.09, 1] }}
                    transition={{ duration: 0.45, repeat: Infinity }}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />
                )}

                {/* Terracotta Flower Pot */}
                <path
                  d="M-24 4 L24 4 L18 26 L-18 26 Z"
                  fill={isGrown ? '#D97706' : isAimed ? '#F59E0B' : '#B45309'}
                  stroke={isAimed ? '#FEF08A' : '#78350F'}
                  strokeWidth={isAimed ? '3' : '2'}
                />
                <rect x="-27" y="-1" width="54" height="7" rx="3" fill="#EA580C" stroke="#78350F" strokeWidth="1.5" />

                {!isGrown ? (
                  <motion.g
                    animate={{ rotate: [-4, 4, -4] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    style={{ transformOrigin: '0px 0px' }}
                  >
                    <path d="M0 0 Q-4 -18 -12 -14" stroke="#65A30D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    <path d="M0 0 Q6 -20 14 -13" stroke="#84CC16" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    <text x="0" y="-26" textAnchor="middle" fontSize="15">
                      {isAimed ? '🎯' : '🥀'}
                    </text>
                  </motion.g>
                ) : (
                  <motion.g
                    initial={{ scaleY: 0.2, opacity: 0.3 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 170, damping: 12 }}
                    style={{ transformOrigin: '0px 0px' }}
                  >
                    <rect x="-7" y="-58" width="14" height="58" rx="4" fill="#78350F" />
                    <circle cx="0" cy="-74" r="32" fill="#15803D" />
                    <circle cx="-22" cy="-60" r="22" fill="#16A34A" />
                    <circle cx="22" cy="-60" r="22" fill="#22C55E" />
                    <circle cx="0" cy="-86" r="20" fill="#4ADE80" opacity="0.65" />
                    <text x="0" y="-66" textAnchor="middle" fontSize="24">
                      {spot.bloomEmoji}
                    </text>
                  </motion.g>
                )}

                {/* Compact Icon Chip under Pot (Tap pot to reveal its name!) */}
                <rect
                  x="-22"
                  y="32"
                  width="44"
                  height="22"
                  rx="8"
                  fill={isGrown ? '#065F46' : tappedPotIdx === idx ? '#F59E0B' : '#1E293B'}
                />
                <text x="0" y="47" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="800">
                  {isGrown ? '✅' : spot.bloomEmoji}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tap-to-Reveal Label Strip (Only shown when user taps a pot or ℹ️!) */}
        {(showInfo || tappedPotIdx !== null) && (
          <div className="bg-slate-900/95 border-t border-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-emerald-100 text-center">
            {tappedPotIdx !== null
              ? `${config.spots[tappedPotIdx].bloomEmoji} ${config.spots[tappedPotIdx].label}`
              : msg}
          </div>
        )}

        {/* ICON-ONLY BOTTOM POUR CONTROL BAR */}
        <div className="bg-slate-950/92 backdrop-blur-xs border-t-2 border-emerald-500/40 px-3 py-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTappedPotIdx(null);
              setShowInfo((v) => !v);
            }}
            aria-label="സഹായം"
            className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
              showInfo
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/20'
            }`}
          >
            <Info className="w-5 h-5" />
          </button>

          <motion.button
            type="button"
            disabled={pouring !== 'idle' || allGrown || failed}
            whileTap={{ scale: 0.9, y: 3 }}
            onClick={handlePourWater}
            aria-label="വെള്ളം ഒഴിക്കൂ"
            className={`h-14 flex-1 max-w-[200px] rounded-2xl border-2 border-b-4 flex items-center justify-center gap-2 transition-all shadow-lg ${
              allGrown
                ? 'bg-emerald-600 text-white border-emerald-400 border-b-emerald-900 opacity-85'
                : overDrySpot
                ? 'bg-gradient-to-b from-sky-400 to-sky-600 text-slate-950 border-white border-b-sky-900 ring-4 ring-emerald-300 animate-pulse'
                : 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-amber-200 border-b-amber-700'
            }`}
          >
            <span className="text-2xl">{allGrown ? '✅' : '🫖'}</span>
            <span className="text-2xl">{allGrown ? '🌺' : '💧'}</span>
          </motion.button>

          <div className="w-11 shrink-0" />
        </div>

        {failed && (
          <InStageFailOverlay
            title="💦 വെള്ളം പാഴാക്കി — കളി ഔട്ട്!"
            reason={failedReason || 'വെള്ളം വെറുതെ പാഴാക്കിയതിനാൽ പരാജയപ്പെട്ടു!'}
            scoreText={`🌺 ${grown.length}/${config.spots.length} · 💦 ${wastedCount}/2`}
            onRetry={resetLocal}
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * ENGINE 2: ANIMATED ROAD VEHICLE DRIVING GAME (CAR / BUS / VAN / BIKE / TRUCK / AMBULANCE)
 *   - Tall, spacious scenic highway (scales even larger in full-screen!)
 *   - 100% reliable CSS left-% driving animation (never freezes on mobile or desktop!)
 *   - Detailed sculpted Kerala Car, Tour Bus, Viqaya Ambulance, Relief Van/Truck & Bicycle
 *   - 1-tap drive directly to next stop OR tap the glowing roadside stop itself!
 * ========================================================================== */
const DetailedVehicleSvg: React.FC<{
  vehicleType: RoadVehicleConfig['vehicleType'];
  driving: boolean;
  evening: boolean;
}> = ({ vehicleType, driving, evening }) => {
  const wheelAnim = driving ? { rotate: 360 } : { rotate: 0 };
  const wheelTrans = driving
    ? { duration: 0.45, repeat: Infinity, ease: 'linear' as const }
    : { duration: 0.25 };

  if (vehicleType === 'bicycle') {
    return (
      <svg viewBox="0 0 180 115" className="w-full h-auto drop-shadow-lg" aria-label="വിദ്യാർത്ഥി സൈക്കിൾ">
        <ellipse cx="90" cy="106" rx="64" ry="6" fill="#0F172A" opacity="0.28" />
        {/* Upright SKSSF Flag streaming BACKWARD (left) as bicycle moves forward */}
        <line x1="54" y1="8" x2="54" y2="68" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
        <circle cx="54" cy="7" r="3" fill="#FACC15" />
        <MiniOfficialFlagSvg
          x={8}
          y={9}
          width={46}
          height={28}
          variant="skssf"
          flyDirection="left"
          windSpeed={driving ? 'fast' : 'idle'}
        />
        {/* Rider */}
        <circle cx="94" cy="30" r="11" fill="#FDE68A" stroke="#78350F" strokeWidth="2" />
        <path d="M84 26 Q94 14 104 26 Z" fill="#FFFFFF" stroke="#065F46" strokeWidth="1.5" />
        <path d="M86 42 L104 42 L100 68 L82 68 Z" fill="#059669" stroke="#064E3B" strokeWidth="2" />
        <line x1="100" y1="48" x2="122" y2="54" stroke="#FDE68A" strokeWidth="5" strokeLinecap="round" />
        {/* Frame */}
        <line x1="48" y1="84" x2="88" y2="62" stroke="#0284C7" strokeWidth="5" strokeLinecap="round" />
        <line x1="88" y1="62" x2="132" y2="84" stroke="#0284C7" strokeWidth="5" strokeLinecap="round" />
        <line x1="88" y1="62" x2="80" y2="84" stroke="#0369A1" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="48" y1="84" x2="80" y2="84" stroke="#0369A1" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="120" y1="48" x2="132" y2="84" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
        <line x1="114" y1="48" x2="128" y2="48" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" />
        {/* Spoked Wheels */}
        {[48, 132].map((cx) => (
          <g key={cx} transform={`translate(${cx}, 84)`}>
            <circle cx="0" cy="0" r="20" fill="none" stroke="#0F172A" strokeWidth="5" />
            <circle cx="0" cy="0" r="15" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
            <motion.g animate={wheelAnim} transition={wheelTrans} style={{ transformOrigin: '0px 0px' }}>
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#94A3B8" strokeWidth="2" />
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#94A3B8" strokeWidth="2" />
            </motion.g>
            <circle cx="0" cy="0" r="4" fill="#FACC15" />
          </g>
        ))}
      </svg>
    );
  }

  if (vehicleType === 'bus') {
    return (
      <svg viewBox="0 0 220 120" className="w-full h-auto drop-shadow-xl" aria-label="SKSSF യാത്രാ ബസ്">
        <ellipse cx="105" cy="111" rx="88" ry="7" fill="#0F172A" opacity="0.3" />
        {/* Headlight glow */}
        <polygon points="196,76 220,64 220,98 196,88" fill="#FEF08A" opacity={evening ? 0.65 : 0.35} />
        {/* Upright SKSSF Flag streaming BACKWARD (left) as bus drives forward */}
        <line x1="176" y1="5" x2="176" y2="38" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
        <circle cx="176" cy="4.5" r="3" fill="#FACC15" />
        <MiniOfficialFlagSvg
          x={130}
          y={6}
          width={46}
          height={28}
          variant="skssf"
          flyDirection="left"
          windSpeed={driving ? 'fast' : 'idle'}
        />
        {/* Bus Body */}
        <rect x="14" y="34" width="184" height="62" rx="12" fill="#FFFFFF" stroke="#065F46" strokeWidth="3" />
        <rect x="16" y="74" width="180" height="10" fill="#0284C7" />
        <rect x="16" y="84" width="180" height="11" rx="3" fill="#059669" />
        {/* Roof AC Pod */}
        <rect x="64" y="26" width="64" height="9" rx="4" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
        {/* Windows */}
        {[24, 58, 92, 126].map((wx) => (
          <rect key={wx} x={wx} y="43" width="28" height="22" rx="4" fill="#BAE6FD" stroke="#0369A1" strokeWidth="2" />
        ))}
        <path d="M162 43 L188 43 Q194 43 194 50 L194 67 L162 67 Z" fill="#7DD3FC" stroke="#0369A1" strokeWidth="2" />
        {/* Headlight & Tail light */}
        <rect x="192" y="76" width="8" height="12" rx="2" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
        <rect x="12" y="76" width="6" height="12" rx="2" fill="#EF4444" />
        {/* Wheels */}
        {[54, 158].map((cx) => (
          <g key={cx} transform={`translate(${cx}, 96)`}>
            <circle cx="0" cy="0" r="15" fill="#0F172A" stroke="#334155" strokeWidth="3" />
            <circle cx="0" cy="0" r="8" fill="#E2E8F0" />
            <motion.g animate={wheelAnim} transition={wheelTrans} style={{ transformOrigin: '0px 0px' }}>
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#475569" strokeWidth="2.5" />
              <line x1="-8" y1="0" x2="8" y2="0" stroke="#475569" strokeWidth="2.5" />
            </motion.g>
            <circle cx="0" cy="0" r="3.5" fill="#059669" />
          </g>
        ))}
      </svg>
    );
  }

  if (vehicleType === 'ambulance' || vehicleType === 'van' || vehicleType === 'truck') {
    const isAmb = vehicleType === 'ambulance';
    const isTruck = vehicleType === 'truck';
    const bodyFill = isAmb ? '#FFFFFF' : isTruck ? '#F59E0B' : '#ECFDF5';
    const strokeCol = isAmb ? '#0F766E' : isTruck ? '#92400E' : '#065F46';
    return (
      <svg viewBox="0 0 215 120" className="w-full h-auto drop-shadow-xl" aria-label="സേവന വാഹനം">
        <ellipse cx="102" cy="111" rx="82" ry="7" fill="#0F172A" opacity="0.3" />
        <polygon points="190,74 215,60 215,96 190,86" fill="#FEF08A" opacity={evening ? 0.7 : 0.38} />
        {/* Upright SKSSF Flag streaming BACKWARD (left) as van/ambulance drives forward */}
        <line x1="168" y1="5" x2="168" y2="54" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
        <circle cx="168" cy="4.5" r="3" fill="#FACC15" />
        <MiniOfficialFlagSvg
          x={122}
          y={6}
          width={46}
          height={28}
          variant="skssf"
          flyDirection="left"
          windSpeed={driving ? 'fast' : 'idle'}
        />
        {/* Flashing Beacon for Ambulance */}
        {isAmb && (
          <motion.rect
            x="92"
            y="24"
            width="24"
            height="10"
            rx="4"
            fill="#EF4444"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 0.45, repeat: Infinity }}
          />
        )}
        {/* Body */}
        <path
          d="M16 92 L16 40 Q16 32 26 32 L130 32 Q144 32 152 44 L168 60 L186 64 Q194 66 194 76 L194 92 Q194 97 186 97 L24 97 Q16 97 16 92 Z"
          fill={bodyFill}
          stroke={strokeCol}
          strokeWidth="3"
        />
        {/* Stripes */}
        <rect x="18" y="75" width="174" height="9" fill="#0284C7" />
        <rect x="18" y="84" width="174" height="11" fill="#16A34A" />
        {/* Cabin windshield */}
        <path d="M132 40 L146 40 L163 60 L132 60 Z" fill="#7DD3FC" stroke="#0369A1" strokeWidth="2" />
        {/* Side window or Medical Cross */}
        {isAmb ? (
          <g>
            <rect x="64" y="47" width="28" height="8" rx="2" fill="#DC2626" />
            <rect x="74" y="37" width="8" height="28" rx="2" fill="#DC2626" />
          </g>
        ) : (
          <rect x="28" y="42" width="90" height="24" rx="5" fill="#E0F2FE" stroke={strokeCol} strokeWidth="2" />
        )}
        <rect x="188" y="73" width="8" height="12" rx="2" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
        <rect x="13" y="73" width="6" height="12" rx="2" fill="#EF4444" />
        {/* Spinning Wheels */}
        {[56, 152].map((cx) => (
          <g key={cx} transform={`translate(${cx}, 97)`}>
            <circle cx="0" cy="0" r="15" fill="#0F172A" stroke="#334155" strokeWidth="3" />
            <circle cx="0" cy="0" r="8" fill="#E2E8F0" />
            <motion.g animate={wheelAnim} transition={wheelTrans} style={{ transformOrigin: '0px 0px' }}>
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#475569" strokeWidth="2.5" />
              <line x1="-8" y1="0" x2="8" y2="0" stroke="#475569" strokeWidth="2.5" />
            </motion.g>
            <circle cx="0" cy="0" r="3.5" fill="#059669" />
          </g>
        ))}
      </svg>
    );
  }

  // DEFAULT ('car' & 'scooter'): GLOSSY KERALA SKSSF CAR / SEDAN (Unmistakable, bright, crisp!)
  return (
    <svg viewBox="0 0 220 120" className="w-full h-auto drop-shadow-xl" aria-label="SKSSF കാർ">
      <defs>
        <linearGradient id="carBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="55%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="carGlassGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {/* Soft ground shadow */}
      <ellipse cx="104" cy="110" rx="84" ry="7" fill="#0F172A" opacity="0.34" />

      {/* Bright Headlight Cone */}
      <polygon
        points="192,75 220,58 220,99 192,89"
        fill="#FEF08A"
        opacity={evening ? 0.72 : 0.35}
      />

      {/* Straight Upright Flagpole on Hood + Official SKSSF Flag streaming BACKWARD (left) */}
      <line x1="172" y1="5" x2="172" y2="62" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
      <circle cx="172" cy="4.5" r="3.5" fill="#FACC15" />
      <MiniOfficialFlagSvg
        x={126}
        y={6}
        width={46}
        height={28}
        variant="skssf"
        flyDirection="left"
        windSpeed={driving ? 'fast' : 'idle'}
      />

      {/* Sculpted Car Cabin & Hood */}
      <path
        d="M16 88 L18 68 Q20 60 32 58 L52 38 Q62 30 78 30 L124 30 Q138 30 148 40 L166 58 L188 62 Q198 64 198 76 L198 88 Q198 96 188 96 L26 96 Q16 96 16 88 Z"
        fill="url(#carBodyGrad)"
        stroke="#022C22"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Glossy Roof Highlight */}
      <path d="M68 35 L130 35" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      {/* White & Sky-Blue SKSSF Racing Stripe along Doors */}
      <rect x="20" y="75" width="175" height="6" rx="2" fill="#FFFFFF" opacity="0.95" />
      <rect x="20" y="81" width="175" height="5" rx="2" fill="#0EA5E9" />

      {/* Rear & Front Side Windows + Sloped Windshield */}
      <path d="M56 58 L70 39 L96 39 L96 58 Z" fill="url(#carGlassGrad)" stroke="#064E3B" strokeWidth="2" />
      <path d="M102 39 L132 39 L154 58 L102 58 Z" fill="url(#carGlassGrad)" stroke="#064E3B" strokeWidth="2" />
      {/* Window shine */}
      <line x1="112" y1="42" x2="120" y2="55" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.65" strokeLinecap="round" />

      {/* Door seam & chrome handles */}
      <line x1="99" y1="58" x2="99" y2="93" stroke="#064E3B" strokeWidth="1.8" opacity="0.6" />
      <rect x="74" y="65" width="12" height="3.5" rx="1.5" fill="#FDE68A" />
      <rect x="112" y="65" width="12" height="3.5" rx="1.5" fill="#FDE68A" />

      {/* Side mirror */}
      <ellipse cx="152" cy="59" rx="5.5" ry="3.5" fill="#047857" stroke="#022C22" strokeWidth="1.5" />

      {/* Glowing Headlight & Red Taillight & Chrome Bumpers */}
      <rect x="188" y="69" width="11" height="12" rx="3" fill="#FDE047" stroke="#B45309" strokeWidth="2" />
      <rect x="15" y="69" width="8" height="12" rx="2" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1.5" />
      <rect x="184" y="88" width="16" height="6" rx="3" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
      <rect x="14" y="88" width="15" height="6" rx="3" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />

      {/* Wheel Arches + Alloy Spinning Wheels */}
      {[56, 152].map((cx) => (
        <g key={cx}>
          <path d={`M${cx - 21} 96 A 21 21 0 0 1 ${cx + 21} 96`} fill="#022C22" />
          <g transform={`translate(${cx}, 96)`}>
            <circle cx="0" cy="0" r="16" fill="#0F172A" stroke="#334155" strokeWidth="3" />
            <circle cx="0" cy="0" r="9.5" fill="#F1F5F9" />
            <motion.g animate={wheelAnim} transition={wheelTrans} style={{ transformOrigin: '0px 0px' }}>
              <line x1="0" y1="-9" x2="0" y2="9" stroke="#334155" strokeWidth="2.5" />
              <line x1="-9" y1="0" x2="9" y2="0" stroke="#334155" strokeWidth="2.5" />
              <line x1="-6.5" y1="-6.5" x2="6.5" y2="6.5" stroke="#64748B" strokeWidth="2" />
              <line x1="6.5" y1="-6.5" x2="-6.5" y2="6.5" stroke="#64748B" strokeWidth="2" />
            </motion.g>
            <circle cx="0" cy="0" r="3.8" fill="#059669" />
          </g>
        </g>
      ))}
    </svg>
  );
};

const RoadVehicleDriveGame: React.FC<{
  config: RoadVehicleConfig;
  onWin: () => void;
  resetSignal: number;
}> = ({ config, onWin, resetSignal }) => {
  const isFullscreen = useGameFullscreen();
  // Realistic single-approaching-stop state:
  // Initially ONLY the vehicle is visible on the open road (stopX = null).
  // Player presses Accelerator to cruise; after brief open road, Stop #1 approaches smoothly from right (114%)
  // into the glowing Brake Zone beside the vehicle (22%..56%). Player presses Brake + Action button,
  // then Accelerates again so the completed stop glides cleanly off the left (-18%) before Stop #2 appears!
  const [driving, setDriving] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stopX, setStopX] = useState<number | null>(null);
  const [roadOffset, setRoadOffset] = useState(0);
  const [bgOffset, setBgOffset] = useState(0);
  const [servedStops, setServedStops] = useState<number[]>([]);
  const [missedStops, setMissedStops] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [routeEnded, setRouteEnded] = useState(false);
  const [msg, setMsg] = useState(
    'വലതുവശത്തെ പച്ച പെഡൽ (»») അമർത്തി വണ്ടി ഓടിക്കൂ! സ്റ്റോപ്പ് അടുത്തെത്തുമ്പോൾ ഇടതുവശത്തെ ചുവന്ന ബ്രേക്ക് അമർത്തി നിർത്തൂ!'
  );

  // Smooth 60fps requestAnimationFrame driving physics refs (zero jitter, seamless acceleration & stop!)
  const openRoadSecRef = useRef(0.95);
  const speedRef = useRef(0);
  const stopXRef = useRef<number | null>(null);
  const roadOffsetRef = useRef(0);
  const bgOffsetRef = useRef(0);
  const stateRef = useRef({
    driving: false,
    currentIdx: 0,
    servedStops: [] as number[],
    missedStops: [] as number[],
    routeEnded: false,
  });

  stateRef.current = {
    driving,
    currentIdx,
    servedStops,
    missedStops,
    routeEnded,
  };

  const resetGame = () => {
    setDriving(false);
    setCurrentIdx(0);
    stopXRef.current = null;
    openRoadSecRef.current = 0.9;
    speedRef.current = 0;
    roadOffsetRef.current = 0;
    bgOffsetRef.current = 0;
    setStopX(null);
    setRoadOffset(0);
    setBgOffset(0);
    setServedStops([]);
    setMissedStops([]);
    setScore(0);
    setRouteEnded(false);
    setMsg(
      'വലതുവശത്തെ പച്ച പെഡൽ (»») അമർത്തി വണ്ടി ഓടിക്കൂ! സ്റ്റോപ്പ് അടുത്തെത്തുമ്പോൾ ഇടതുവശത്തെ ചുവന്ന ബ്രേക്ക് അമർത്തി നിർത്തൂ!'
    );
  };

  useEffect(() => {
    resetGame();
  }, [resetSignal, config.title]);

  const activeStop = currentIdx < config.stops.length ? config.stops[currentIdx] : null;
  const isCurrentServed = servedStops.includes(currentIdx);
  const isCurrentMissed = missedStops.includes(currentIdx);
  const inStopZone = stopX !== null && stopX >= 22 && stopX <= 56;
  const canServeNow = !driving && inStopZone && !isCurrentServed && !isCurrentMissed && !routeEnded;
  const won = routeEnded && servedStops.length === config.stops.length && missedStops.length === 0;
  const failed = routeEnded && !won;

  // Silky-smooth 60fps requestAnimationFrame driving physics loop (synchronized road, scenery & stops!)
  useEffect(() => {
    if (routeEnded) return;
    let rafId = 0;
    let lastTs = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      const s = stateRef.current;
      if (s.routeEnded) return;

      // Smooth acceleration (0 -> 1 in ~0.35s) and crisp smooth braking (1 -> 0 in ~0.12s)
      const targetSpeed = s.driving ? 1 : 0;
      const accelRate = s.driving ? 3.2 : 9.0;
      if (speedRef.current < targetSpeed) {
        speedRef.current = Math.min(targetSpeed, speedRef.current + accelRate * dt);
      } else if (speedRef.current > targetSpeed) {
        speedRef.current = Math.max(targetSpeed, speedRef.current - accelRate * dt);
      }

      const spd = speedRef.current;
      if (spd > 0.002) {
        // Synchronized road dashes & distant hills scroll smoothly with zero snapping!
        roadOffsetRef.current = (roadOffsetRef.current + 260 * spd * dt) % 88;
        bgOffsetRef.current = (bgOffsetRef.current + 6.5 * spd * dt) % 50;
        setRoadOffset(roadOffsetRef.current);
        setBgOffset(bgOffsetRef.current);

        // Phase 1: Cruising on open road before next stop enters view
        if (stopXRef.current === null) {
          openRoadSecRef.current -= spd * dt;
          if (openRoadSecRef.current <= 0) {
            openRoadSecRef.current = 0;
            stopXRef.current = 112;
            setStopX(112);
            const upcoming = config.stops[s.currentIdx];
            if (upcoming) {
              setMsg(`👀 മുന്നിൽ “${upcoming.emoji} ${upcoming.label}” വരുന്നു! അടുത്തെത്തുമ്പോൾ ചുവന്ന ബ്രേക്ക് അമർത്തൂ!`);
            }
          }
        } else {
          // Phase 2: Current stop glides smoothly leftward at 31%/sec
          const nextX = stopXRef.current - 31 * spd * dt;

          // Check if player drove right past the stop WITHOUT braking & serving!
          if (
            nextX < 14 &&
            !s.servedStops.includes(s.currentIdx) &&
            !s.missedStops.includes(s.currentIdx)
          ) {
            const missedStop = config.stops[s.currentIdx];
            sound.playError();
            setMissedStops((prev) => (prev.includes(s.currentIdx) ? prev : [...prev, s.currentIdx]));
            setScore((sc) => Math.max(0, sc - 50));
            setMsg(
              `⚠️ അയ്യോ! “${missedStop?.label}” നിർത്താതെ കടന്നുപോയി (-50 മാർക്ക്)! അടുത്ത സ്റ്റോപ്പിൽ ശ്രദ്ധിച്ച് ബ്രേക്ക് അമർത്തൂ!`
            );
          }

          if (nextX <= -16) {
            const nextIdx = s.currentIdx + 1;
            stopXRef.current = null;
            setStopX(null);
            if (nextIdx >= config.stops.length) {
              speedRef.current = 0;
              setDriving(false);
              setRouteEnded(true);
              const allOk = s.servedStops.length === config.stops.length && s.missedStops.length === 0;
              if (allOk) {
                onWin();
              } else {
                sound.playError();
              }
              return;
            } else {
              setCurrentIdx(nextIdx);
              openRoadSecRef.current = 1.05;
              setMsg('🛣️ വാഹനം തുറന്ന റോഡിലൂടെ മുന്നോട്ട് പോകുന്നു... അടുത്ത സ്റ്റോപ്പ് ഉടൻ വരും!');
            }
          } else {
            stopXRef.current = nextX;
            setStopX(nextX);
          }
        }
      }

      if (s.driving || speedRef.current > 0.002) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    if (driving || speedRef.current > 0.002) {
      rafId = window.requestAnimationFrame(step);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [driving, routeEnded, config.stops, onWin]);

  const handleAccelerate = () => {
    sound.unlockAudio();
    if (routeEnded) return;
    if (canServeNow && activeStop) {
      sound.playPop();
      setMsg(`💡 ആദ്യം “${activeStop.actionLabel ?? config.serveLabel}” അമർത്തൂ — അല്ലെങ്കിൽ വീണ്ടും മുന്നോട്ട് അമർത്തിയാൽ സ്റ്റോപ്പ് വിട്ടുപോകും!`);
      // Still allow accelerating if user wants, or click again — let's actually start driving immediately so real physics apply!
    }
    if (!driving) {
      sound.playPop();
      setDriving(true);
      if (stopX === null) {
        setMsg('🚗 വാഹനം യാത്ര തുടങ്ങി! മുന്നിൽ സ്റ്റോപ്പ് പ്രത്യക്ഷപ്പെടുമ്പോൾ “🛑 ബ്രേക്ക്” അമർത്തൂ!');
      } else if (isCurrentServed) {
        setMsg('🚗 ഗംഭീരം! വാഹനം വീണ്ടും സ്റ്റാർട്ട് ചെയ്തു — ഈ സ്റ്റോപ്പ് കടന്ന് അടുത്തതിലേക്ക് നീങ്ങുന്നു...');
      }
    }
  };

  const handleBrake = () => {
    sound.unlockAudio();
    if (routeEnded) return;
    if (driving) {
      setDriving(false);
      sound.playClick();
      if (inStopZone && !isCurrentServed && !isCurrentMissed && activeStop) {
        setMsg(`🛑 കൃത്യമായി നിർത്തി! ഇനി നടുവിലെ ${activeStop.emoji} ബട്ടൺ അമർത്തൂ!`);
      } else if (stopX !== null && stopX > 56) {
        setMsg('🛑 ഇത്തിരി നേരത്തെയാണ് നിർത്തിയത്! പച്ച പെഡൽ (»») അമർത്തി അൽപം കൂടി മുന്നോട്ട് പോകൂ!');
      } else {
        setMsg('🛑 വാഹനം നിർത്തി! മുന്നോട്ട് പോകാൻ പച്ച പെഡൽ (»») അമർത്തൂ.');
      }
    }
  };

  const handleServe = () => {
    sound.unlockAudio();
    if (!canServeNow || !activeStop) return;
    const nextServed = [...servedStops, currentIdx];
    setServedStops(nextServed);
    setScore((sc) => sc + 100);
    sound.playSuccess(nextServed.length);
    setMsg(`🎉 ${activeStop.reward}`);
    narrator.speak(activeStop.reward, activeStop.label);
  };

  const skyClass =
    config.weather === 'evening'
      ? 'from-indigo-950 via-indigo-900 to-sky-900'
      : config.weather === 'rainy'
      ? 'from-slate-700 via-slate-500 to-sky-200'
      : 'from-sky-400 via-sky-200 to-emerald-100';

  const currentActionText = activeStop?.actionLabel ?? config.serveLabel;

  return (
    <div className="space-y-2.5">
      {/* FULL-IMMERSION SCROLLING HIGHWAY STAGE WITH IN-SCREEN COCKPIT CONTROLS */}
      <div
        className={`relative rounded-2xl overflow-hidden border-2 border-emerald-400 bg-gradient-to-b ${skyClass} shadow-inner select-none flex flex-col justify-between transition-all ${
          isFullscreen ? 'min-h-[78dvh]' : 'min-h-[345px] sm:min-h-[395px]'
        }`}
      >
        {/* TOP HUD INSIDE GAME SCREEN */}
        <div className="relative z-20 px-3 pt-2.5 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/85 text-amber-300 text-xs font-extrabold backdrop-blur-xs tabular-nums">
              {config.weather === 'evening' ? '💡' : '✅'} {servedStops.length}/{config.stops.length}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/85 text-emerald-200 text-xs font-extrabold tabular-nums">
              ⭐ {score}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <GameShatterLives lives={Math.max(0, 3 - missedStops.length)} maxLives={3} compact />
          </div>
        </div>

        {/* MIDDLE SCENIC ROAD VIEWPORT */}
        <div className="relative flex-1 min-h-[220px] sm:min-h-[250px] overflow-hidden">
          {/* Moon / Stars / Sun */}
          {config.weather === 'evening' ? (
            <>
              <div className="absolute top-4 right-8 w-11 h-11 rounded-full bg-amber-200 shadow-[0_0_26px_rgba(253,224,71,0.75)] pointer-events-none">
                <div className="w-9 h-9 rounded-full bg-indigo-950 translate-x-3 -translate-y-1" />
              </div>
              {[
                { l: '12%', t: '12%' },
                { l: '32%', t: '8%' },
                { l: '55%', t: '15%' },
                { l: '75%', t: '10%' },
              ].map((st, idx) => (
                <motion.span
                  key={idx}
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 2 + idx * 0.4, repeat: Infinity }}
                  style={{ left: st.l, top: st.t }}
                  className="absolute text-amber-200 text-xs pointer-events-none"
                >
                  ✦
                </motion.span>
              ))}
            </>
          ) : (
            <div
              className={`absolute top-4 right-8 w-11 h-11 rounded-full pointer-events-none ${
                config.weather === 'rainy'
                  ? 'bg-slate-300/80'
                  : 'bg-amber-300 shadow-[0_0_26px_rgba(250,204,21,0.85)]'
              }`}
            />
          )}

          {/* Rain Overlay when Rainy */}
          {config.weather === 'rainy' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
              {[10, 22, 34, 46, 58, 70, 82, 92].map((leftPct, idx) => (
                <motion.div
                  key={leftPct}
                  animate={{ y: [-20, 240] }}
                  transition={{ duration: 0.72, repeat: Infinity, delay: idx * 0.09, ease: 'linear' }}
                  style={{ left: `${leftPct}%` }}
                  className="absolute top-0 w-0.5 h-10 bg-sky-100 rounded-full rotate-12"
                />
              ))}
            </div>
          )}

          {/* Parallax Scrolling Distant City / Kerala Hills (Continuously synchronized with 60fps driving velocity!) */}
          <div
            style={{ transform: `translate3d(-${bgOffset}%, 0, 0)` }}
            className="absolute left-0 bottom-20 sm:bottom-24 w-[200%] h-36 sm:h-44 flex pointer-events-none will-change-transform"
          >
            {[0, 1].map((dup) => (
              <div key={dup} className="w-1/2 h-full shrink-0">
                {config.weather === 'evening' ? (
                  <svg viewBox="0 0 900 200" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
                    <rect x="20" y="85" width="75" height="115" rx="4" fill="#0F172A" opacity="0.88" />
                    <rect x="115" y="55" width="90" height="145" rx="4" fill="#1E293B" opacity="0.92" />
                    <rect x="230" y="95" width="70" height="105" rx="4" fill="#0F172A" opacity="0.85" />
                    <rect x="340" y="68" width="92" height="132" rx="4" fill="#1E293B" opacity="0.9" />
                    <rect x="465" y="98" width="88" height="102" rx="4" fill="#064E3B" opacity="0.92" />
                    <path d="M478 98 Q509 52 540 98 Z" fill="#047857" />
                    <rect x="548" y="60" width="14" height="140" fill="#065F46" />
                    <rect x="595" y="74" width="85" height="126" rx="4" fill="#1E293B" opacity="0.9" />
                    <rect x="705" y="54" width="95" height="146" rx="4" fill="#0F172A" opacity="0.92" />
                    <rect x="815" y="84" width="72" height="116" rx="4" fill="#1E293B" opacity="0.88" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 900 200" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
                    <path d="M0 200 Q160 100 340 155 T700 125 T900 165 L900 200 Z" fill="#16A34A" opacity="0.88" />
                    <path d="M0 200 Q220 140 480 175 T900 155 L900 200 Z" fill="#22C55E" />
                    {[95, 290, 485, 680, 820].map((tx) => (
                      <g key={tx} transform={`translate(${tx}, 78)`}>
                        <path d="M12 110 Q16 70 18 35" stroke="#78350F" strokeWidth="6" fill="none" strokeLinecap="round" />
                        <path d="M18 35 Q-4 24 -14 38" stroke="#15803D" strokeWidth="5" fill="none" strokeLinecap="round" />
                        <path d="M18 35 Q40 22 50 38" stroke="#15803D" strokeWidth="5" fill="none" strokeLinecap="round" />
                        <path d="M18 35 Q8 12 -6 20" stroke="#16A34A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                        <path d="M18 35 Q30 12 44 20" stroke="#16A34A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                      </g>
                    ))}
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* GLOWING BRAKE / STOP ZONE MARKER BESIDE VEHICLE (Only pulses when a stop is approaching!) */}
          {stopX !== null && !isCurrentServed && !isCurrentMissed && (
            <div
              className={`absolute left-[22%] w-[34%] bottom-20 sm:bottom-24 h-2.5 rounded-full z-10 transition-colors ${
                inStopZone
                  ? 'bg-amber-300 shadow-[0_0_20px_rgba(253,224,71,0.95)] animate-pulse'
                  : 'bg-emerald-300/45 border border-dashed border-white/60'
              }`}
            />
          )}

          {/* SINGLE APPROACHING STOP: STREETLAMP POST (EVENING ONLY) OR GROUND-LEVEL BUILDING (MOSQUE / HOSPITAL / HOME)! */}
          {stopX !== null && activeStop && (
            <div
              style={{ left: `${stopX}%` }}
              className="absolute bottom-20 sm:bottom-24 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
            >
              {/* Soft Golden Light Cone shining onto road ONLY when streetlamp is LIT */}
              {isCurrentServed && config.weather === 'evening' && (
                <div
                  className="pointer-events-none absolute top-11 -z-10 w-40 h-40 opacity-70"
                  style={{
                    background:
                      'radial-gradient(ellipse at top, rgba(254, 240, 138, 0.98) 0%, rgba(250, 204, 21, 0.38) 48%, rgba(250, 204, 21, 0) 78%)',
                  }}
                />
              )}

              <div
                className={`mb-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold whitespace-nowrap shadow-md ${
                  isCurrentServed
                    ? 'bg-emerald-600 text-white'
                    : isCurrentMissed
                    ? 'bg-rose-700 text-white'
                    : inStopZone
                    ? 'bg-amber-400 text-slate-950 animate-bounce'
                    : 'bg-slate-900/90 text-amber-200'
                }`}
              >
                {isCurrentServed
                  ? `✅ ${activeStop.label}`
                  : isCurrentMissed
                  ? '❌ വിട്ടുപോയി!'
                  : inStopZone
                  ? driving
                    ? '🛑 നിർത്തൂ!'
                    : '👇 ഇപ്പോൾ അമർത്തൂ!'
                  : `${activeStop.emoji} ${activeStop.label}`}
              </div>

              {config.weather === 'evening' ? (
                <>
                  {/* Real Streetlamp Head on Lamp Pole */}
                  <div
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl shadow-xl transition-all ${
                      isCurrentServed
                        ? 'bg-amber-300 border-yellow-100 text-slate-950 shadow-[0_0_32px_rgba(253,224,71,0.95)] scale-105'
                        : isCurrentMissed
                        ? 'bg-rose-900 border-rose-400 text-white opacity-75'
                        : inStopZone
                        ? 'bg-amber-400 border-white text-slate-950 ring-4 ring-amber-200/80'
                        : 'bg-slate-900/95 border-amber-300/70 text-white'
                    }`}
                  >
                    <span>{isCurrentServed ? '💡' : '🔌'}</span>
                  </div>
                  <div
                    className={`w-2.5 h-12 sm:h-16 rounded-t-xs border-x ${
                      isCurrentServed ? 'bg-amber-100 border-amber-400' : 'bg-slate-400 border-slate-600'
                    }`}
                  />
                </>
              ) : (
                /* GROUND-ANCHORED ARCHITECTURAL BUILDING (Mosque / Hospital / Home sitting FIRMLY on the ground!) */
                <div
                  className={`relative transition-transform ${
                    inStopZone && !isCurrentServed ? 'scale-105' : 'scale-100'
                  }`}
                >
                  <svg
                    viewBox="0 0 116 92"
                    className="w-24 h-20 sm:w-28 sm:h-24 drop-shadow-lg block"
                    aria-hidden="true"
                  >
                    {/* Ground Foundation Step */}
                    <rect x="4" y="84" width="108" height="8" rx="3" fill="#475569" />
                    {activeStop.emoji === '🕌' ? (
                      <>
                        {/* Mosque Building on Ground */}
                        <rect x="16" y="42" width="84" height="42" rx="3" fill="#FEFCE8" stroke="#065F46" strokeWidth="2.5" />
                        <path d="M32 42 Q58 10 84 42 Z" fill={isCurrentServed ? '#10B981' : '#059669'} stroke="#064E3B" strokeWidth="2.5" />
                        <line x1="58" y1="12" x2="58" y2="3" stroke="#F59E0B" strokeWidth="2.5" />
                        <circle cx="58" cy="3" r="3" fill="#FACC15" />
                        {/* Left & Right Minarets */}
                        <rect x="8" y="24" width="10" height="60" fill="#ECFDF5" stroke="#065F46" strokeWidth="2" />
                        <path d="M7 24 Q13 14 19 24 Z" fill="#047857" />
                        <rect x="98" y="24" width="10" height="60" fill="#ECFDF5" stroke="#065F46" strokeWidth="2" />
                        <path d="M97 24 Q103 14 109 24 Z" fill="#047857" />
                        {/* Arched Mosque Door */}
                        <path d="M46 84 L46 60 Q58 48 70 60 L70 84 Z" fill="#065F46" />
                      </>
                    ) : activeStop.emoji === '🏥' ? (
                      <>
                        {/* Ground-Level Hospital Building */}
                        <rect x="12" y="26" width="92" height="58" rx="4" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
                        <rect x="12" y="20" width="92" height="10" rx="2" fill="#0284C7" />
                        {/* Red Cross Emblem */}
                        <rect x="52" y="34" width="12" height="24" rx="2" fill="#EF4444" />
                        <rect x="46" y="40" width="24" height="12" rx="2" fill="#EF4444" />
                        {/* Windows & Entrance */}
                        <rect x="20" y="38" width="16" height="14" rx="2" fill="#BAE6FD" />
                        <rect x="80" y="38" width="16" height="14" rx="2" fill="#BAE6FD" />
                        <rect x="46" y="64" width="24" height="20" rx="2" fill="#0369A1" />
                      </>
                    ) : (
                      <>
                        {/* Ground-Level Kerala Family Home */}
                        <rect x="16" y="44" width="84" height="40" rx="3" fill="#FFFBEB" stroke="#B45309" strokeWidth="2.5" />
                        {/* Terracotta Sloped Roof */}
                        <polygon points="8,46 58,14 108,46" fill="#C2410C" stroke="#7C2D12" strokeWidth="2.5" />
                        {/* Windows & Front Door */}
                        <rect x="25" y="54" width="16" height="14" rx="2" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.5" />
                        <rect x="75" y="54" width="16" height="14" rx="2" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.5" />
                        <rect x="48" y="56" width="20" height="28" rx="2" fill="#92400E" />
                        <circle cx="63" cy="70" r="2" fill="#FACC15" />
                      </>
                    )}
                    {isCurrentServed && (
                      <circle cx="96" cy="22" r="13" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2.5" />
                    )}
                    {isCurrentServed && (
                      <text x="96" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900">
                        ✓
                      </text>
                    )}
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* WIDE PAVED ASPHALT HIGHWAY WITH CONTINUOUS 60FPS SCROLLING DASHES */}
          <div className="absolute inset-x-0 bottom-0 h-20 sm:h-24 bg-slate-800 border-t-4 border-amber-400 overflow-hidden">
            <div className="w-full h-1 bg-white/75 mt-1" />
            <div
              style={{ transform: `translate3d(-${roadOffset}px, 0, 0)` }}
              className="flex items-center gap-10 pt-6 sm:pt-8 px-4 w-[180%] will-change-transform"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-12 h-2 rounded-full bg-amber-300/95 shrink-0" />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-1.5 h-1 bg-white/55" />
          </div>

          {/* SILKY-SMOOTH VEHICLE ON THE ROAD (Zero bounce / zero shaking — Flag streams backward!) */}
          <motion.div
            animate={{ y: 0, rotate: driving ? -0.35 : 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`absolute left-[14%] sm:left-[18%] bottom-2 sm:bottom-3 z-30 pointer-events-none ${
              isFullscreen ? 'w-44 sm:w-56' : 'w-36 sm:w-48'
            }`}
          >
            <DetailedVehicleSvg
              vehicleType={config.vehicleType}
              driving={driving}
              evening={config.weather === 'evening'}
            />
          </motion.div>
        </div>

        {/* IN-SCREEN DRIVING COCKPIT CONTROLS (ICON-ONLY PEDALS) */}
        <div className="relative z-30 bg-slate-950/92 backdrop-blur-xs border-t-2 border-emerald-500/40 px-3 sm:px-4 py-2">
          <div className="grid grid-cols-3 gap-2.5 items-center max-w-lg mx-auto">
            <GameBrakePedal
              disabled={!driving || routeEnded}
              highlight={driving && inStopZone && !isCurrentServed}
              onClick={handleBrake}
            />

            <motion.button
              type="button"
              disabled={!canServeNow}
              whileTap={canServeNow ? { scale: 0.9, y: 3 } : {}}
              onClick={handleServe}
              aria-label={currentActionText}
              title={currentActionText}
              className={`h-14 sm:h-16 px-2 rounded-2xl border-2 border-b-4 transition-all flex items-center justify-center leading-none ${
                canServeNow
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 border-white border-b-amber-700 ring-4 ring-amber-200/80 shadow-[0_0_24px_rgba(250,204,21,0.85)]'
                  : 'bg-slate-800/90 text-slate-500 border-slate-700 border-b-slate-950 cursor-not-allowed opacity-55'
              }`}
            >
              <motion.span
                animate={canServeNow ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.65, repeat: Infinity }}
                className="text-2xl sm:text-3xl"
              >
                {activeStop?.emoji ?? (config.weather === 'evening' ? '💡' : '✨')}
              </motion.span>
            </motion.button>

            <GameGasPedal
              disabled={driving || routeEnded}
              running={driving}
              readyPulse={!driving && !routeEnded && !canServeNow}
              onClick={handleAccelerate}
            />
          </div>
        </div>

        {/* FAILURE OVERLAY INSIDE STAGE WHEN ANY STOP WAS MISSED */}
        {failed && (
          <InStageFailOverlay
            title="⚠️ ചില സ്റ്റോപ്പുകൾ നിർത്താതെ കടന്നുപോയി!"
            reason={`ആകെ ${config.stops.length} സ്റ്റോപ്പുകളിൽ ${missedStops.length} എണ്ണം വിട്ടുപോയി!`}
            scoreText={`⭐ ${score} · ✅ ${servedStops.length}/${config.stops.length}`}
            onRetry={resetGame}
          />
        )}
      </div>

      {/* Icon-Only Stop Indicators Below Stage (Tap any icon to see its label!) */}
      {!isFullscreen && (
        <div className="flex flex-wrap items-center gap-1.5">
          {config.stops.map((s, i) => {
            const done = servedStops.includes(i);
            const missed = missedStops.includes(i);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMsg(`${s.emoji} ${s.label}`);
                }}
                aria-label={s.label}
                title={s.label}
                className={`text-sm font-extrabold px-2.5 py-1 rounded-lg border ${
                  done
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                    : missed
                    ? 'bg-rose-100 text-rose-900 border-rose-400'
                    : currentIdx === i
                    ? 'bg-amber-100 text-amber-950 border-amber-500'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {done ? '✅' : missed ? '❌' : s.emoji}
              </button>
            );
          })}
          <span className="text-[11px] font-bold text-slate-600 ml-1">
            {msg && msg.length < 40 ? msg : ''}
          </span>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * ENGINE 3: HERITAGE TRAIN STATION VOYAGE GAME
 * ========================================================================== */
const TrainStationVoyageGame: React.FC<{
  config: TrainVoyageConfig;
  onWin: () => void;
  resetSignal: number;
}> = ({ config, onWin, resetSignal }) => {
  const isFullscreen = useGameFullscreen();
  const [driving, setDriving] = useState(false);
  const [stationIdx, setStationIdx] = useState(0);
  const [stationX, setStationX] = useState<number | null>(null);
  const [openTrackTicks, setOpenTrackTicks] = useState(24);
  const [attachedList, setAttachedList] = useState<number[]>([]);
  const [missedList, setMissedList] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [routeEnded, setRouteEnded] = useState(false);
  const [msg, setMsg] = useState('പച്ച പെഡൽ (»») അമർത്തി തീവണ്ടി ഓടിക്കൂ! സ്റ്റേഷൻ അടുത്തെത്തുമ്പോൾ ചുവന്ന ബ്രേക്ക് അമർത്തി 🔔 കോച്ച് ഘടിപ്പിക്കൂ!');

  const ref = useRef({
    driving: false,
    stationIdx: 0,
    stationX: null as number | null,
    openTrackTicks: 24,
    attachedList: [] as number[],
    missedList: [] as number[],
    routeEnded: false,
  });
  ref.current = { driving, stationIdx, stationX, openTrackTicks, attachedList, missedList, routeEnded };

  const resetLocal = () => {
    setDriving(false);
    setStationIdx(0);
    setStationX(null);
    setOpenTrackTicks(24);
    setAttachedList([]);
    setMissedList([]);
    setScore(0);
    setRouteEnded(false);
    setMsg('പച്ച പെഡൽ (»») അമർത്തി തീവണ്ടി ഓടിക്കൂ! സ്റ്റേഷൻ അടുത്തെത്തുമ്പോൾ ചുവന്ന ബ്രേക്ക് അമർത്തി 🔔 കോച്ച് ഘടിപ്പിക്കൂ!');
  };

  useEffect(() => {
    resetLocal();
  }, [resetSignal]);

  const activeSt = stationIdx < config.stations.length ? config.stations[stationIdx] : null;
  const isAttached = attachedList.includes(stationIdx);
  const isMissed = missedList.includes(stationIdx);
  const inZone = stationX !== null && stationX >= 175 && stationX <= 345;
  const canAttach = !driving && inZone && !isAttached && !isMissed && !routeEnded;
  const won = routeEnded && attachedList.length === config.stations.length && missedList.length === 0;
  const failed = routeEnded && !won;

  useEffect(() => {
    if (!driving || routeEnded) return;
    let rafId = 0;
    let lastTs = performance.now();
    let localStationX = ref.current.stationX;
    let localOpenSec = Math.max(0.05, ref.current.openTrackTicks * 0.035);

    const step = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      const s = ref.current;
      if (!s.driving || s.routeEnded) return;

      if (localStationX === null) {
        localOpenSec -= dt;
        if (localOpenSec <= 0) {
          localOpenSec = 0;
          localStationX = 640;
          setOpenTrackTicks(0);
          setStationX(640);
          const upcoming = config.stations[s.stationIdx];
          if (upcoming) {
            setMsg(`🚉 മുന്നിൽ ${upcoming.year} (${upcoming.label}) വരുന്നു! അടുത്തെത്തുമ്പോൾ ചുവന്ന ബ്രേക്ക് അമർത്തൂ!`);
          }
        }
      } else {
        const nextX = localStationX - 175 * dt;
        if (nextX < 130 && !s.attachedList.includes(s.stationIdx) && !s.missedList.includes(s.stationIdx)) {
          sound.playError();
          setMissedList((p) => (p.includes(s.stationIdx) ? p : [...p, s.stationIdx]));
          setScore((sc) => Math.max(0, sc - 50));
          setMsg(`⚠️ ${config.stations[s.stationIdx]?.year} സ്റ്റേഷൻ നിർത്താതെ കടന്നുപോയി (-50 മാർക്ക്)!`);
        }

        if (nextX <= -70) {
          const nextIdx = s.stationIdx + 1;
          localStationX = null;
          setStationX(null);
          if (nextIdx >= config.stations.length) {
            setDriving(false);
            setRouteEnded(true);
            if (s.attachedList.length === config.stations.length && s.missedList.length === 0) {
              onWin();
            } else {
              sound.playError();
            }
            return;
          } else {
            setStationIdx(nextIdx);
            localOpenSec = 0.95;
            setOpenTrackTicks(28);
            setMsg('🚂 ചരിത്ര തീവണ്ടി മുന്നോട്ട് കുതിക്കുന്നു... അടുത്ത സ്റ്റേഷൻ ഉടൻ എത്തും!');
          }
        } else {
          localStationX = nextX;
          setStationX(nextX);
        }
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [driving, routeEnded, config.stations, onWin]);

  const handleAttach = () => {
    sound.unlockAudio();
    if (!canAttach || !activeSt) return;
    const next = [...attachedList, stationIdx];
    setAttachedList(next);
    setScore((sc) => sc + 100);
    sound.playSuccess(next.length);
    setMsg(`🚂 ${activeSt.note}`);
    narrator.speak(activeSt.note, `${activeSt.year} ${activeSt.label}`);
  };

  return (
    <div className="space-y-2.5">
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-inner bg-sky-200 select-none">
        {/* Crisp Readable HTML Station Banner & Shatterable Shields */}
        <div className="bg-slate-950/92 px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-extrabold tabular-nums">
              🚂 {attachedList.length}/{config.stations.length} · ⭐ {score}
            </span>
            {activeSt && (
              <span className="text-xs font-extrabold text-emerald-100 truncate">
                🚉 {activeSt.year} — {activeSt.label}
              </span>
            )}
          </div>
          <GameShatterLives lives={Math.max(0, 3 - missedList.length)} maxLives={3} compact />
        </div>

        <svg
          viewBox="0 0 600 220"
          className={`w-full block ${isFullscreen ? 'max-h-[62dvh] h-auto mx-auto' : 'h-auto'}`}
          role="img"
          aria-label={config.title}
        >
          {/* Clear Sky & Distant Lush Hills */}
          <rect width="600" height="220" fill="#BAE6FD" />
          <circle cx="525" cy="36" r="19" fill="#FACC15" />
          <path d="M0 150 Q150 108 300 140 T600 128 L600 168 L0 168 Z" fill="#22C55E" />
          <path d="M0 156 Q200 132 420 152 T600 144 L600 172 L0 172 Z" fill="#16A34A" />

          {/* REALISTIC SOLID GROUND EMBANKMENT + STONE BALLAST + WOODEN SLEEPERS + DOUBLE STEEL RAILS */}
          <rect x="0" y="182" width="600" height="38" fill="#57534E" />
          <rect x="0" y="172" width="600" height="14" fill="#78716C" />
          <rect x="0" y="196" width="600" height="24" fill="#15803D" />
          {Array.from({ length: 28 }).map((_, i) => (
            <rect key={i} x={i * 22} y="167" width="11" height="13" rx="1.5" fill="#78350F" />
          ))}
          <line x1="0" y1="168" x2="600" y2="168" stroke="#E2E8F0" strokeWidth="3.5" />
          <line x1="0" y1="176" x2="600" y2="176" stroke="#CBD5E1" strokeWidth="2.5" />

          {/* Glowing Station Stop Zone on Tracks */}
          {stationX !== null && !isAttached && !isMissed && (
            <rect
              x="175"
              y="163"
              width="170"
              height="6"
              rx="3"
              fill={inZone ? '#FACC15' : '#A7F3D0'}
              opacity={inZone ? 0.95 : 0.55}
            />
          )}

          {/* GROUND-MOUNTED RAILWAY STATION PLATFORM & SIGNAL POST */}
          {stationX !== null && activeSt && (
            <g transform={`translate(${stationX}, 68)`}>
              {/* Platform Canopy & Pillar anchored to Ground */}
              <rect x="-46" y="72" width="92" height="28" rx="3" fill="#F8FAFC" stroke="#475569" strokeWidth="2" />
              <polygon points="-54,72 0,56 54,72" fill={activeSt.coachColor} />
              {/* Station Signal Post */}
              <rect x="44" y="28" width="5" height="72" fill="#334155" />
              <circle cx="46.5" cy="34" r="6" fill={isAttached ? '#22C55E' : inZone ? '#FACC15' : '#EF4444'} stroke="#FFFFFF" strokeWidth="1.5" />
              {/* Crisp Year Badge (Never overflows!) */}
              <rect
                x="-38"
                y="12"
                width="76"
                height="32"
                rx="8"
                fill={isAttached ? '#065F46' : isMissed ? '#881337' : inZone ? '#FACC15' : '#FFFFFF'}
                stroke={activeSt.coachColor}
                strokeWidth="3"
              />
              <text
                x="0"
                y="33"
                textAnchor="middle"
                fill={isAttached ? '#FDE047' : isMissed ? '#FFFFFF' : '#0F172A'}
                fontSize="13"
                fontWeight="900"
              >
                {activeSt.year} {isAttached ? '✅' : isMissed ? '❌' : ''}
              </text>
              <line x1="0" y1="44" x2="0" y2="60" stroke="#475569" strokeWidth="3" />
            </g>
          )}

          {/* Chugging Train Engine + Attached Coaches */}
          <g transform="translate(225, 0)">
            {attachedList.map((stI, cIdx) => {
              const st = config.stations[stI];
              return (
                <g key={st.id} transform={`translate(${-(cIdx + 1) * 56}, 130)`}>
                  <rect x="0" y="4" width="48" height="28" rx="5" fill={st.coachColor} stroke="#0F172A" strokeWidth="1.5" />
                  <text x="24" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">
                    {st.year}
                  </text>
                  <circle cx="12" cy="34" r="6" fill="#0F172A" />
                  <circle cx="36" cy="34" r="6" fill="#0F172A" />
                  <line x1="48" y1="22" x2="56" y2="22" stroke="#0F172A" strokeWidth="3" />
                </g>
              );
            })}

            {/* Locomotive Engine with Backward-Streaming Official SKSSF Flag */}
            <g transform="translate(0, 120)">
              {driving && (
                <motion.circle
                  cx="48"
                  cy="-8"
                  r="8"
                  fill="#FFFFFF"
                  opacity="0.85"
                  animate={{ y: [0, -16], x: [0, -14], opacity: [0.9, 0] }}
                  transition={{ duration: 0.75, repeat: Infinity }}
                />
              )}
              <rect x="42" y="0" width="12" height="16" fill="#0F172A" />
              <rect x="0" y="6" width="26" height="36" rx="4" fill="#065F46" stroke="#0F172A" strokeWidth="2" />
              <rect x="24" y="14" width="38" height="28" rx="5" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
              <rect x="6" y="12" width="14" height="12" rx="2" fill="#FEF08A" />
              <line x1="32" y1="-22" x2="32" y2="14" stroke="#F8FAFC" strokeWidth="2.5" />
              <MiniOfficialFlagSvg
                x={-6}
                y={-22}
                width={38}
                height={23}
                variant="skssf"
                flyDirection="left"
                windSpeed={driving ? 'fast' : 'idle'}
              />
              <circle cx="14" cy="44" r="8" fill="#0F172A" stroke="#FACC15" strokeWidth="2" />
              <circle cx="48" cy="44" r="8" fill="#0F172A" stroke="#FACC15" strokeWidth="2" />
            </g>
          </g>
        </svg>

        {/* IN-SCREEN TRAIN COCKPIT CONTROLS (ICON-ONLY) */}
        <div className="bg-slate-950/92 border-t border-emerald-500/40 px-3 py-2">
          <div className="grid grid-cols-3 gap-2.5 items-center max-w-lg mx-auto">
            <GameBrakePedal
              disabled={!driving || routeEnded}
              highlight={driving && inZone && !isAttached}
              onClick={() => {
                sound.playClick();
                setDriving(false);
              }}
            />

            <motion.button
              type="button"
              disabled={!canAttach}
              whileTap={canAttach ? { scale: 0.9, y: 3 } : {}}
              onClick={handleAttach}
              aria-label="കോച്ച് ഘടിപ്പിക്കൂ"
              title={msg}
              className={`h-14 sm:h-16 px-2 rounded-2xl border-2 border-b-4 transition-all flex items-center justify-center ${
                canAttach
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-white border-b-amber-700 ring-4 ring-amber-200 shadow-lg'
                  : 'bg-slate-800/90 text-slate-500 border-slate-700 border-b-slate-950 cursor-not-allowed opacity-55'
              }`}
            >
              <motion.span
                animate={canAttach ? { rotate: [-12, 12, -12] } : { rotate: 0 }}
                transition={{ duration: 0.45, repeat: Infinity }}
                className="text-2xl sm:text-3xl"
              >
                🔔
              </motion.span>
            </motion.button>

            <GameGasPedal
              disabled={driving || routeEnded}
              running={driving}
              readyPulse={!driving && !routeEnded && !canAttach}
              onClick={() => {
                sound.unlockAudio();
                sound.playPop();
                setDriving(true);
              }}
            />
          </div>
        </div>

        {failed && (
          <InStageFailOverlay
            title="🚂 ചില ചരിത്ര സ്റ്റേഷനുകൾ വിട്ടുപോയി!"
            reason="എല്ലാ സ്റ്റേഷനുകളിലും കൃത്യമായി ബ്രേക്ക് അമർത്തി കോച്ചുകൾ ഘടിപ്പിക്കണം!"
            scoreText={`🚂 ${attachedList.length}/${config.stations.length} · ⭐ ${score}`}
            onRetry={resetLocal}
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * ENGINE 4: LIVE SWINGING CRANE MOSQUE / TOWER BUILDER GAME
 * ========================================================================== */
const CraneBuilderGame: React.FC<{
  config: CraneBuilderConfig;
  onWin: () => void;
  resetSignal: number;
}> = ({ config, onWin, resetSignal }) => {
  const isFullscreen = useGameFullscreen();
  const [placedCount, setPlacedCount] = useState(0);
  const [craneX, setCraneX] = useState(300);
  const [hearts, setHearts] = useState(3);
  const [msg, setMsg] = useState('ആടുന്ന ക്രെയിൻ നടുവിലെ പച്ച അടയാളത്തിന് മുകളിൽ എത്തുമ്പോൾ “⬇️ ഇറക്കൂ!” അമർത്തൂ! (3 അവസരം)');
  const dirRef = useRef(1);

  const resetLocal = () => {
    setPlacedCount(0);
    setCraneX(300);
    setHearts(3);
    setMsg('ആടുന്ന ക്രെയിൻ നടുവിലെ പച്ച അടയാളത്തിന് മുകളിൽ എത്തുമ്പോൾ “⬇️ ഇറക്കൂ!” അമർത്തൂ! (3 അവസരം)');
  };

  useEffect(() => {
    resetLocal();
  }, [resetSignal]);

  const allDone = placedCount >= config.blocks.length;
  const failed = hearts <= 0 && !allDone;

  useEffect(() => {
    if (allDone || failed) return;
    const id = window.setInterval(() => {
      setCraneX((prev) => {
        const next = prev + dirRef.current * 8;
        if (next >= 460) dirRef.current = -1;
        if (next <= 140) dirRef.current = 1;
        return next;
      });
    }, 36);
    return () => window.clearInterval(id);
  }, [allDone, failed]);

  const isAligned = Math.abs(craneX - 300) <= 78;

  const handleDrop = () => {
    sound.unlockAudio();
    if (allDone || failed) return;
    if (isAligned) {
      const blk = config.blocks[placedCount];
      const next = placedCount + 1;
      setPlacedCount(next);
      sound.playDrop();
      sound.playSuccess(next);
      setMsg(`✨ ${blk.note}`);
      narrator.speak(blk.note, blk.label);
      if (next === config.blocks.length) {
        onWin();
      }
    } else {
      sound.playError();
      const nextHearts = Math.max(0, hearts - 1);
      setHearts(nextHearts);
      setMsg(
        nextHearts <= 0
          ? '⚠️ 3 തവണ തെറ്റായി ഇറക്കി — നിർമ്മാണം തകർന്നു! വീണ്ടും ശ്രമിക്കാം.'
          : `⚠️ നടുവിൽ അല്ലായിരുന്നു! ഒരു അവസരം കുറഞ്ഞു (ബാക്കി: ${nextHearts}). പച്ച അടയാളത്തിൽ എത്തുമ്പോൾ അമർത്തൂ!`
      );
    }
  };

  const currentBlock = config.blocks[placedCount];
  const blockH = config.blocks.length === 5 ? 27 : 32;

  return (
    <div className="space-y-2.5">
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-inner bg-sky-100 select-none">
        {/* Crisp Readable HTML Top HUD + Active Step Banner (ZERO overflowing SVG text!) */}
        <div className="bg-slate-950/92 px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-extrabold tabular-nums">
              🏗️ {placedCount}/{config.blocks.length}
            </span>
            <span className="text-xs font-extrabold text-white truncate">
              {allDone ? '🎉 നിർമ്മാണം പൂർത്തിയായി!' : currentBlock ? currentBlock.label : ''}
            </span>
          </div>
          <GameShatterLives lives={hearts} maxLives={3} compact />
        </div>

        <svg
          viewBox="0 0 600 255"
          className={`w-full block ${isFullscreen ? 'max-h-[62dvh] h-auto mx-auto' : 'h-auto'}`}
          role="img"
          aria-label={config.title}
        >
          <rect width="600" height="255" fill="#E0F2FE" />
          <rect x="0" y="220" width="600" height="35" fill="#16A34A" />
          {[55, 115, 485, 545].map((tx) => (
            <g key={tx} transform={`translate(${tx}, 168)`}>
              <rect x="7" y="24" width="6" height="28" fill="#78350F" />
              <circle cx="10" cy="20" r="16" fill="#15803D" />
            </g>
          ))}

          {/* Overhead Crane Rail & Ground Alignment Guide */}
          <rect x="80" y="14" width="440" height="10" rx="4" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
          <rect
            x="212"
            y="214"
            width="176"
            height="12"
            rx="4"
            fill={isAligned && !allDone ? '#22C55E' : '#CBD5E1'}
          />

          {/* Swinging Architectural Piece with Clean Numeric Badge (Zero Overflow!) */}
          {!allDone && currentBlock && (
            <g>
              <line x1={craneX} y1="24" x2={craneX} y2="54" stroke="#334155" strokeWidth="3" />
              <rect
                x={craneX - 84}
                y="54"
                width="168"
                height={blockH}
                rx="6"
                fill={currentBlock.color}
                stroke={isAligned ? '#FACC15' : '#FFFFFF'}
                strokeWidth="2.5"
              />
              {/* Architectural Windows / Arch Details */}
              {[-52, -24, 24, 52].map((ox) => (
                <path
                  key={ox}
                  d={`M${craneX + ox - 7} ${54 + blockH - 4} L${craneX + ox - 7} ${64} Q${craneX + ox} ${58} ${craneX + ox + 7} ${64} L${craneX + ox + 7} ${54 + blockH - 4} Z`}
                  fill={currentBlock.accent}
                  opacity="0.35"
                />
              ))}
              <circle cx={craneX} cy={54 + blockH * 0.5} r="11" fill="#0F172A" stroke="#FACC15" strokeWidth="1.8" />
              <text x={craneX} y={54 + blockH * 0.64} textAnchor="middle" fill="#FDE047" fontSize="11" fontWeight="900">
                {placedCount + 1}
              </text>
            </g>
          )}

          {/* Stacked Mosque / Tower Architectural Tiers */}
          {config.blocks.slice(0, placedCount).map((blk, i) => {
            const y = 216 - (i + 1) * blockH;
            return (
              <motion.g
                key={blk.id}
                initial={{ y: -25, opacity: 0.7 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              >
                <rect
                  x="216"
                  y={y}
                  width="168"
                  height={blockH - 2}
                  rx="5"
                  fill={blk.color}
                  stroke={blk.accent}
                  strokeWidth="2"
                />
                {[-54, -26, 26, 54].map((ox) => (
                  <path
                    key={ox}
                    d={`M${300 + ox - 7} ${y + blockH - 4} L${300 + ox - 7} ${y + 10} Q${300 + ox} ${y + 4} ${300 + ox + 7} ${y + 10} L${300 + ox + 7} ${y + blockH - 4} Z`}
                    fill={blk.accent}
                    opacity="0.4"
                  />
                ))}
                <circle cx="300" cy={y + blockH * 0.48} r="10.5" fill="#064E3B" stroke="#FACC15" strokeWidth="1.5" />
                <text x="300" y={y + blockH * 0.62} textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="900">
                  ✓{i + 1}
                </text>
              </motion.g>
            );
          })}

          {allDone && (
            <g>
              {config.theme === 'mosque' && (
                <path
                  d={`M245 ${216 - placedCount * blockH} Q300 ${160 - placedCount * blockH} 355 ${216 - placedCount * blockH} Z`}
                  fill="#065F46"
                  stroke="#FACC15"
                  strokeWidth="2.5"
                />
              )}
              <line
                x1="300"
                y1={216 - placedCount * blockH - (config.theme === 'mosque' ? 56 : 36)}
                x2="300"
                y2={216 - placedCount * blockH}
                stroke="#0F172A"
                strokeWidth="3"
              />
              <MiniOfficialFlagSvg
                x={301}
                y={216 - placedCount * blockH - (config.theme === 'mosque' ? 56 : 36)}
                width={48}
                height={29}
                variant={config.flagVariant}
                flyDirection="right"
                windSpeed="idle"
              />
            </g>
          )}
        </svg>

        {/* IN-SCREEN CRANE CONTROLS (ICON-ONLY) */}
        <div className="bg-slate-950/92 border-t border-emerald-500/40 px-3 py-2 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={allDone || failed}
            onClick={handleDrop}
            aria-label="താഴെ ഇറക്കൂ"
            title={msg}
            className={`h-13 px-10 rounded-2xl border-2 border-b-4 text-2xl font-extrabold transition-all ${
              allDone
                ? 'bg-emerald-600 text-white border-emerald-400 border-b-emerald-800 opacity-80'
                : isAligned
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-white border-b-emerald-800 ring-4 ring-emerald-200 shadow-md'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-200 border-b-amber-600 shadow-md'
            }`}
          >
            {allDone ? '✅' : '⬇️'}
          </button>
        </div>

        {failed && (
          <InStageFailOverlay
            title="🏗️ ക്രെയിൻ ബാലൻസ് തെറ്റി!"
            reason="പച്ച അടയാളത്തിൽ എത്തുമ്പോൾ കൃത്യമായി അമർത്തൂ!"
            scoreText={`🏗️ ${placedCount}/${config.blocks.length}`}
            onRetry={resetLocal}
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * ENGINE 5: ROPE-PULL CEREMONIAL FLAG HOISTING GAME
 * ========================================================================== */
const FlagRopeHoistGame: React.FC<{
  config: FlagHoistConfig;
  onWin: () => void;
  resetSignal: number;
}> = ({ config, onWin, resetSignal }) => {
  const isFullscreen = useGameFullscreen();
  const [pct, setPct] = useState(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(28);
  const [windPhase, setWindPhase] = useState<'calm' | 'warning' | 'gust'>('calm');
  const [shields, setShields] = useState(3);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [msg, setMsg] = useState('“🪢 കയർ വലിക്കൂ!” അമർത്തി പതാക ഉയർത്തൂ — ചുവന്ന ⛈️ കൊടുങ്കാറ്റ് വരുമ്പോൾ വലിക്കരുത്!');

  const resetLocal = () => {
    setPct(0);
    setStarted(false);
    setTimeLeft(28);
    setWindPhase('calm');
    setShields(3);
    setFailReason(null);
    setMsg('“🪢 കയർ വലിക്കൂ!” അമർത്തി പതാക ഉയർത്തൂ — ചുവന്ന ⛈️ കൊടുങ്കാറ്റ് വരുമ്പോൾ വലിക്കരുത്!');
  };

  useEffect(() => {
    resetLocal();
  }, [resetSignal]);

  const won = pct >= 100;
  const failed = Boolean(failReason);
  const windGust = windPhase === 'gust';
  const windWarning = windPhase === 'warning';

  // Fixed: depend ONLY on [started, won, failed] so tapping "Pull" never resets the storm clock!
  useEffect(() => {
    if (!started || won || failed) return;
    let halfSec = 0;
    const id = window.setInterval(() => {
      halfSec += 1;
      const cyclePos = halfSec % 9; // 4.5s repeating weather cycle

      if (cyclePos === 3) {
        setWindPhase('warning');
        setMsg('⚠️ സൂക്ഷിക്കൂ! ചുവന്ന കൊടുങ്കാറ്റ് വരുന്നു — കൈ എടുക്കാൻ തയ്യാറാകൂ!');
      } else if (cyclePos >= 4 && cyclePos <= 7) {
        setWindPhase('gust');
        if (cyclePos === 4) {
          setMsg('⛈️ ചുവന്ന കൊടുങ്കാറ്റ്! ഇപ്പോൾ കയർ വലിക്കരുത് — കാറ്റ് അടങ്ങാൻ 2 സെക്കൻഡ് കാക്കൂ!');
        }
      } else {
        setWindPhase('calm');
        if (cyclePos === 8) {
          setMsg('🌤️ കാറ്റ് അടങ്ങി! ഇപ്പോൾ വേഗം “🪢⬆️ കയർ വലിക്കൂ!”');
        }
      }

      // Every full second: tick countdown & slight gravity slip
      if (halfSec % 2 === 0) {
        setTimeLeft((t) => {
          if (t <= 1) {
            sound.playError();
            setFailReason('⏱️ സമയം കഴിഞ്ഞു! 28 സെക്കൻഡിനുള്ളിൽ പതാക 100% ഉയർത്തണം.');
            return 0;
          }
          return t - 1;
        });
        setPct((p) => (p > 0 && p < 100 ? Math.max(0, p - 2) : p));
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [started, won, failed]);

  const handlePull = () => {
    sound.unlockAudio();
    if (won || failed) return;
    if (!started) setStarted(true);

    if (windGust) {
      sound.playError();
      const rem = Math.max(0, shields - 1);
      setShields(rem);
      setPct((p) => Math.max(0, p - 8));
      if (rem <= 0) {
        setFailReason('⛈️ ചുവന്ന കൊടുങ്കാറ്റിൽ കയർ വലിച്ച് 3 ഷീൽഡും പൊട്ടി! കാറ്റ് അടങ്ങുമ്പോൾ മാത്രം വലിക്കൂ.');
      } else {
        setMsg(`⛈️ കൊടുങ്കാറ്റിൽ കയർ കുരുങ്ങി! 1 ഷീൽഡ് പൊട്ടി (ബാക്കി: ${rem}) — ചുവപ്പ് മാറാൻ കാക്കൂ!`);
      }
      return;
    }

    const next = Math.min(100, pct + 10);
    setPct(next);
    sound.playPop();

    const reached = config.levels.find((l) => pct < l.pct && next >= l.pct);
    if (reached) {
      sound.playSuccess(Math.ceil(next / 25));
      setMsg(`${reached.emoji} ${reached.label}: ${reached.note}`);
      narrator.speak(reached.note, reached.label);
    }
    if (next >= 100) {
      setWindPhase('calm');
      onWin();
    }
  };

  const flagY = 178 - (pct / 100) * 145;

  return (
    <div className="space-y-2.5">
      <div
        className={`relative rounded-2xl overflow-hidden border-2 shadow-inner select-none transition-colors duration-200 ${
          windGust
            ? 'border-rose-600 bg-rose-200 ring-4 ring-rose-400/60'
            : windWarning
            ? 'border-amber-500 bg-amber-100'
            : 'border-emerald-300 bg-sky-100'
        }`}
      >
        <div className="bg-slate-950/92 px-3 py-2 flex items-center justify-between gap-2 border-b border-emerald-500/30">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-extrabold tabular-nums">
              🚩 {pct}%
            </span>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold tabular-nums ${timeLeft <= 6 ? 'bg-rose-700 text-white animate-pulse' : 'bg-slate-800 text-white'}`}>
              ⏱️ {timeLeft}s
            </span>
            {windGust && (
              <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[11px] font-black animate-pulse">
                ⛈️ കൊടുങ്കാറ്റ്!
              </span>
            )}
            {windWarning && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-black animate-pulse">
                ⚠️ കാറ്റ് വരുന്നു
              </span>
            )}
          </div>
          <GameShatterLives lives={shields} maxLives={3} compact />
        </div>

        <svg
          viewBox="0 0 600 245"
          className={`w-full block ${isFullscreen ? 'max-h-[62dvh] h-auto mx-auto' : 'h-auto'}`}
          role="img"
          aria-label={config.title}
        >
          <rect
            width="600"
            height="245"
            fill={windGust ? '#FDA4AF' : windWarning ? '#FEF3C7' : '#E0F2FE'}
          />
          {!windGust && <circle cx="520" cy="45" r="22" fill="#FACC15" />}
          <path d="M0 205 Q180 185 360 205 T600 198 L600 245 L0 245 Z" fill={windGust ? '#15803D' : '#16A34A'} />

          {/* Storm Warning Cloud */}
          {windWarning && (
            <g>
              <rect x="18" y="14" width="205" height="30" rx="9" fill="#D97706" />
              <text x="120" y="33" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900">
                ⚠️ കാറ്റ് വരുന്നു — സൂക്ഷിക്കൂ!
              </text>
              <text x="58" y="88" fontSize="34">🌩️</text>
            </g>
          )}

          {/* Unmistakable Red Storm Gust Streaks, Cloud & Leaves */}
          {windGust && (
            <g>
              {/* Dark crimson storm cloud */}
              <ellipse cx="90" cy="58" rx="68" ry="26" fill="#881337" opacity="0.9" />
              <ellipse cx="140" cy="64" rx="52" ry="22" fill="#9F1239" opacity="0.92" />
              <text x="92" y="72" textAnchor="middle" fontSize="34">⛈️</text>

              {[48, 86, 124, 160, 190].map((wy, i) => (
                <motion.line
                  key={wy}
                  x1="-40"
                  y1={wy}
                  x2="230"
                  y2={wy - 8}
                  stroke="#BE123C"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="24 14"
                  animate={{ x: [0, 420], opacity: [0.3, 1, 0.2] }}
                  transition={{ duration: 0.45 + i * 0.05, repeat: Infinity, ease: 'linear' }}
                />
              ))}

              {/* Flying leaves */}
              {[72, 138].map((ly, i) => (
                <motion.text
                  key={ly}
                  x="20"
                  y={ly}
                  fontSize="18"
                  animate={{ x: [0, 520], y: [0, i === 0 ? -18 : 16] }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                >
                  🍃
                </motion.text>
              ))}

              <rect x="16" y="12" width="225" height="32" rx="9" fill="#BE123C" stroke="#FFF1F2" strokeWidth="2" />
              <text x="128" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="12.5" fontWeight="900">
                ⛈️ ചുവന്ന കൊടുങ്കാറ്റ്! നിൽക്കൂ!
              </text>
            </g>
          )}

          <rect x="215" y="205" width="90" height="18" rx="4" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
          <rect x="256" y="24" width="8" height="182" rx="4" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
          <circle cx="260" cy="22" r="7" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />

          {config.levels.map((lv) => {
            const ly = 185 - (lv.pct / 100) * 145;
            const reached = pct >= lv.pct;
            return (
              <g key={lv.label}>
                <line x1="266" y1={ly + 12} x2="345" y2={ly + 12} stroke={reached ? '#16A34A' : '#94A3B8'} strokeWidth="2" strokeDasharray="4 4" />
                <rect
                  x="348"
                  y={ly}
                  width="195"
                  height="24"
                  rx="7"
                  fill={reached ? '#065F46' : '#FFFFFF'}
                  stroke={reached ? '#FACC15' : '#CBD5E1'}
                  strokeWidth="1.5"
                />
                <text x="358" y={ly + 16} fill={reached ? '#FFFFFF' : '#334155'} fontSize="10" fontWeight="800">
                  {reached ? '✅ ' : `${lv.emoji} `}
                  {lv.label.slice(0, 20)}
                </text>
              </g>
            );
          })}

          <motion.g
            animate={{ y: flagY, rotate: windGust ? [0, -4, 4, 0] : 0 }}
            transition={{ y: { type: 'spring', stiffness: 160, damping: 16 }, rotate: { duration: 0.25, repeat: windGust ? Infinity : 0 } }}
          >
            <MiniOfficialFlagSvg
              x={264}
              y={0}
              width={68}
              height={42}
              variant="skssf"
              flyDirection="right"
              windSpeed={won || windGust ? 'fast' : 'idle'}
            />
          </motion.g>
        </svg>

        <div
          className={`px-3 py-1.5 border-t text-[11px] font-extrabold text-center ${
            windGust
              ? 'bg-rose-800 border-rose-400 text-white'
              : windWarning
              ? 'bg-amber-600 border-amber-300 text-white'
              : 'bg-slate-900/95 border-emerald-500/30 text-amber-100'
          }`}
        >
          {msg}
        </div>

        <div className="bg-slate-950/92 border-t border-emerald-500/40 px-3 py-2 flex items-center justify-center">
          <button
            type="button"
            disabled={won || failed}
            onClick={handlePull}
            className={`h-13 px-8 rounded-2xl border-2 border-b-4 text-sm sm:text-base font-black transition-all cursor-pointer ${
              won
                ? 'bg-emerald-600 text-white border-emerald-400 border-b-emerald-800 opacity-85'
                : windGust
                ? 'bg-rose-700 text-white border-rose-300 border-b-rose-950 animate-pulse ring-4 ring-rose-400/70'
                : windWarning
                ? 'bg-amber-500 text-slate-950 border-amber-200 border-b-amber-800'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-200 border-b-amber-600 shadow-md active:translate-y-0.5'
            }`}
          >
            {won
              ? '🎉🚩 പതാക ഉയർന്നു!'
              : windGust
              ? '⛈️ കൊടുങ്കാറ്റ്! വലിക്കരുത്!'
              : windWarning
              ? '⚠️ കാറ്റ് വരുന്നു — കയർ വലിക്കാം'
              : '🪢⬆️ കയർ വലിക്കൂ!'}
          </button>
        </div>

        {failed && (
          <InStageFailOverlay
            title="🚩 പതാക ഉയർത്തൽ തടസ്സപ്പെട്ടു!"
            reason={failReason || 'ചുവന്ന കൊടുങ്കാറ്റ് ഒഴിവാക്കി സമയത്തിനുള്ളിൽ പതാക ഉയർത്തൂ!'}
            scoreText={`🚩 ${pct}%`}
            onRetry={resetLocal}
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * ENGINE 6: MALABAR SAILING SHIP HARBOR NAVIGATION GAME
 * ========================================================================== */
const ShipHarborSailGame: React.FC<{
  config: ShipSailConfig;
  onWin: () => void;
  resetSignal: number;
}> = ({ config, onWin, resetSignal }) => {
  const isFullscreen = useGameFullscreen();
  const [sailing, setSailing] = useState(false);
  const [lane, setLane] = useState<0 | 1 | 2>(1);
  const [idx, setIdx] = useState(0);
  const [islandX, setIslandX] = useState<number | null>(null);
  const [rockX, setRockX] = useState(480);
  const [rockLane, setRockLane] = useState<0 | 1 | 2>(2);
  const [shields, setShields] = useState(3);
  const [openSeaTicks, setOpenSeaTicks] = useState(20);
  const [visited, setVisited] = useState<number[]>([]);
  const [missed, setMissed] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [ended, setEnded] = useState(false);
  const [failMsg, setFailMsg] = useState<string | null>(null);
  const [msg, setMsg] = useState('“⛵ യാത്ര തുടങ്ങൂ!” അമർത്തൂ — 🌀 ചുഴി ഒഴിവാക്കി ഓരോ ദീപസ്തംഭത്തിലും എത്തൂ!');

  const ref = useRef({
    sailing: false,
    lane: 1 as 0 | 1 | 2,
    idx: 0,
    islandX: null as number | null,
    rockX: 480,
    rockLane: 2 as 0 | 1 | 2,
    rockHit: false,
    shields: 3,
    openSeaTicks: 20,
    visited: [] as number[],
    missed: [] as number[],
    ended: false,
  });
  ref.current.sailing = sailing;
  ref.current.lane = lane;
  ref.current.idx = idx;
  ref.current.islandX = islandX;
  ref.current.shields = shields;
  ref.current.openSeaTicks = openSeaTicks;
  ref.current.visited = visited;
  ref.current.missed = missed;
  ref.current.ended = ended;

  const resetLocal = () => {
    setSailing(false);
    setLane(1);
    setIdx(0);
    setIslandX(null);
    const initRockLane: 0 | 1 | 2 = config.islands[0]?.lane === 2 ? 0 : 2;
    setRockX(480);
    setRockLane(initRockLane);
    ref.current.rockX = 480;
    ref.current.rockLane = initRockLane;
    ref.current.rockHit = false;
    setShields(3);
    setOpenSeaTicks(20);
    setVisited([]);
    setMissed([]);
    setScore(0);
    setEnded(false);
    setFailMsg(null);
    setMsg('“⛵ യാത്ര തുടങ്ങൂ!” അമർത്തൂ — 🌀 ചുഴി ഒഴിവാക്കി ഓരോ ദീപസ്തംഭത്തിലും എത്തൂ!');
  };

  useEffect(() => {
    resetLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const activeIsland = idx < config.islands.length ? config.islands[idx] : null;
  const laneYs = [58, 122, 184];
  const won = ended && visited.length === config.islands.length && missed.length === 0 && shields > 0;
  const failed = Boolean(failMsg) || (ended && !won);

  useEffect(() => {
    if (!sailing || ended || failMsg) return;
    const id = window.setInterval(() => {
      const s = ref.current;
      if (!s.sailing || s.ended) return;

      // Move whirlpool hazard
      let nextRock = s.rockX - 6.6;
      if (!s.rockHit && nextRock <= 155 && nextRock >= 95 && s.lane === s.rockLane) {
        s.rockHit = true;
        sound.playError();
        const rem = Math.max(0, s.shields - 1);
        s.shields = rem;
        setShields(rem);
        setScore((sc) => Math.max(0, sc - 40));
        if (rem <= 0) {
          setSailing(false);
          setEnded(true);
          setFailMsg('🌀 കടൽ ചുഴിയിൽ തട്ടി 3 ഷീൽഡും പൊട്ടി! പാത മാറ്റി ഒഴിവാക്കൂ.');
          return;
        }
        setMsg(`🌀 ചുഴിയിൽ തട്ടി! 1 ഷീൽഡ് പൊട്ടി — ഇനി ${rem} ഷീൽഡ് ബാക്കി!`);
      }
      if (nextRock < -40) {
        nextRock = 635;
        const curIsl = config.islands[s.idx];
        const choices = ([0, 1, 2] as (0 | 1 | 2)[]).filter((l) => !curIsl || l !== curIsl.lane);
        const nl = choices[Math.floor(Math.random() * choices.length)] ?? 0;
        s.rockLane = nl;
        s.rockHit = false;
        setRockLane(nl);
      }
      s.rockX = nextRock;
      setRockX(nextRock);

      if (s.islandX === null) {
        if (s.openSeaTicks > 1) {
          setOpenSeaTicks((t) => t - 1);
        } else {
          setOpenSeaTicks(0);
          setIslandX(640);
          const nextIsl = config.islands[s.idx];
          if (nextIsl) {
            setMsg(`🔭 മുന്നിൽ ${nextIsl.emoji} ${nextIsl.label} കാണുന്നു! 🌀 ചുഴി ഒഴിവാക്കി ആ പാതയിലേക്ക് തിരിക്കൂ!`);
          }
        }
        return;
      }

      const nextX = s.islandX - 5.6;
      const isl = config.islands[s.idx];

      if (
        isl &&
        nextX <= 155 &&
        nextX >= 95 &&
        !s.visited.includes(s.idx) &&
        !s.missed.includes(s.idx) &&
        s.lane === isl.lane
      ) {
        const nextVisited = [...s.visited, s.idx];
        setVisited(nextVisited);
        setScore((sc) => sc + 100);
        sound.playSuccess(nextVisited.length);
        setMsg(`✨ ${isl.note}`);
        narrator.speak(isl.note, isl.label);
      }

      if (isl && nextX < 80 && !s.visited.includes(s.idx) && !s.missed.includes(s.idx)) {
        sound.playError();
        setMissed((p) => [...p, s.idx]);
        const rem = Math.max(0, s.shields - 1);
        s.shields = rem;
        setShields(rem);
        setScore((sc) => Math.max(0, sc - 50));
        if (rem <= 0) {
          setSailing(false);
          setEnded(true);
          setFailMsg(`🌊 ${isl.label} കടന്നുപോയി — എല്ലാ ഷീൽഡുകളും തകർന്നു!`);
          return;
        }
        setMsg(`🌊 അയ്യോ! ${isl.label} കടന്നുപോയി (-50 മാർക്ക്)!`);
      }

      if (nextX <= -50) {
        const nextIdx = s.idx + 1;
        if (nextIdx >= config.islands.length) {
          setIslandX(null);
          setSailing(false);
          setEnded(true);
          if (s.visited.length === config.islands.length && s.missed.length === 0) {
            onWin();
          } else {
            sound.playError();
          }
        } else {
          setIslandX(null);
          setIdx(nextIdx);
          setOpenSeaTicks(22);
          setMsg('⛵ കപ്പൽ തിരമാലകളിലൂടെ മുന്നോട്ട് നീങ്ങുന്നു... അടുത്ത ലക്ഷ്യം ഉടൻ വരും!');
        }
      } else {
        setIslandX(nextX);
      }
    }, 35);
    return () => window.clearInterval(id);
  }, [sailing, ended, failMsg, config.islands, onWin]);

  return (
    <div className="space-y-2.5">
      <div className="relative rounded-2xl overflow-hidden border-2 border-sky-300 shadow-inner bg-sky-700 select-none">
        <div className="bg-slate-950/92 px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-sky-500/30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-extrabold tabular-nums">
              ⛵ {visited.length}/{config.islands.length} · ⭐ {score}
            </span>
            {activeIsland && (
              <span className="text-xs font-extrabold text-sky-100 truncate">
                {activeIsland.emoji} {activeIsland.label}
              </span>
            )}
          </div>
          <GameShatterLives lives={shields} maxLives={3} compact />
        </div>

        <svg
          viewBox="0 0 600 235"
          className={`w-full block ${isFullscreen ? 'max-h-[62dvh] h-auto mx-auto' : 'h-auto'}`}
          role="img"
          aria-label={config.title}
        >
          <rect width="600" height="235" fill="#0284C7" />
          {laneYs.map((ly, i) => (
            <g
              key={ly}
              className="cursor-pointer"
              onClick={() => {
                if (ended) return;
                sound.playClick();
                setLane(i as 0 | 1 | 2);
              }}
            >
              <rect
                x="0"
                y={ly - 28}
                width="600"
                height="56"
                fill={lane === i ? '#0369A1' : i % 2 === 0 ? '#0284C7' : '#0EA5E9'}
                opacity="0.72"
              />
              <line x1="0" y1={ly + 28} x2="600" y2={ly + 28} stroke="#BAE6FD" strokeOpacity="0.35" strokeDasharray="10 10" />
            </g>
          ))}

          {/* Animated Sea Rock / Whirlpool Hazard */}
          {sailing && (
            <g transform={`translate(${rockX}, ${laneYs[rockLane]})`}>
              <circle cx="0" cy="0" r="19" fill="#1E293B" stroke="#FB7185" strokeWidth="2.5" strokeDasharray="5 3" />
              <text x="0" y="6" textAnchor="middle" fontSize="18">
                🌀
              </text>
            </g>
          )}

          {/* SINGLE APPROACHING LIGHTHOUSE ISLAND */}
          {islandX !== null && activeIsland && (
            <g
              transform={`translate(${islandX}, ${laneYs[activeIsland.lane]})`}
              className="cursor-pointer"
              onClick={() => {
                if (ended) return;
                sound.playClick();
                setLane(activeIsland.lane);
              }}
            >
              <ellipse cx="0" cy="14" rx="36" ry="12" fill="#FDE68A" />
              <circle
                cx="0"
                cy="-2"
                r="22"
                fill={visited.includes(idx) ? '#16A34A' : missed.includes(idx) ? '#9F1239' : '#FACC15'}
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
              <text x="0" y="5" textAnchor="middle" fontSize="17">
                {visited.includes(idx) ? '✅' : missed.includes(idx) ? '❌' : activeIsland.emoji}
              </text>
            </g>
          )}

          {/* Animated Malabar Sailing Dhow with Backward-Streaming Official SKSSF Flag */}
          <motion.g
            animate={{ x: 125, y: laneYs[lane] }}
            transition={{ type: 'spring', stiffness: 150, damping: 16 }}
          >
            <path d="M-28 6 L30 6 L20 20 L-18 20 Z" fill="#78350F" stroke="#FEF08A" strokeWidth="1.5" />
            <line x1="0" y1="-36" x2="0" y2="6" stroke="#F8FAFC" strokeWidth="3" />
            <path d="M2 -32 Q26 -14 4 2 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
            <MiniOfficialFlagSvg
              x={-34}
              y={-36}
              width={34}
              height={21}
              variant="skssf"
              flyDirection="left"
              windSpeed={sailing ? 'fast' : 'idle'}
            />
          </motion.g>
        </svg>

        {/* IN-SCREEN SHIP STEERING CONTROLS (ICON-ONLY) */}
        <div className="bg-slate-950/92 border-t border-sky-400/40 px-3 py-2">
          <div className="grid grid-cols-3 gap-2.5 items-center max-w-lg mx-auto">
            <motion.button
              type="button"
              disabled={lane === 0 || ended}
              whileTap={{ scale: 0.9, y: -2 }}
              onClick={() => {
                sound.playClick();
                setLane((l) => Math.max(0, l - 1) as 0 | 1 | 2);
              }}
              aria-label="മുകളിലേക്ക് തിരിക്കുക"
              title={msg}
              className="h-14 sm:h-16 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white border-2 border-sky-300 border-b-4 border-b-sky-900 flex items-center justify-center text-2xl font-black shadow-lg"
            >
              ▲
            </motion.button>

            <motion.button
              type="button"
              disabled={lane === 2 || ended}
              whileTap={{ scale: 0.9, y: 2 }}
              onClick={() => {
                sound.playClick();
                setLane((l) => Math.min(2, l + 1) as 0 | 1 | 2);
              }}
              aria-label="താഴേക്ക് തിരിക്കുക"
              className="h-14 sm:h-16 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white border-2 border-sky-300 border-b-4 border-b-sky-900 flex items-center justify-center text-2xl font-black shadow-lg"
            >
              ▼
            </motion.button>

            <GameGasPedal
              disabled={sailing || ended}
              running={sailing}
              readyPulse={!sailing && !ended}
              onClick={() => {
                sound.unlockAudio();
                sound.playPop();
                setSailing(true);
              }}
            />
          </div>
        </div>

        {failed && (
          <InStageFailOverlay
            title="🌊 ചില ദീപസ്തംഭങ്ങൾ നഷ്ടപ്പെട്ടു!"
            reason="കപ്പൽ ശരിയായ പാതയിലേക്ക് തിരിക്കൂ!"
            scoreText={`⛵ ${visited.length}/${config.islands.length} · ⭐ ${score}`}
            onRetry={resetLocal}
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * ENGINE 7: HOT-AIR BALLOON ALTITUDE CLIMB GAME
 * ========================================================================== */
const BalloonClimbGame: React.FC<{
  config: BalloonClimbConfig;
  onWin: () => void;
  resetSignal: number;
}> = ({ config, onWin, resetSignal }) => {
  const isFullscreen = useGameFullscreen();
  const [step, setStep] = useState(0);
  const [flaming, setFlaming] = useState(false);
  const [stormX, setStormX] = useState(40);
  const [hearts, setHearts] = useState(3);
  const stormDirRef = useRef(1);
  const [msg, setMsg] = useState('ഇടിമേഘം (⛈️) ബലൂണിന് മുകളിൽ ഇല്ലാത്ത സമയം നോക്കി “🔥 ജ്വാല ഉയർത്തൂ!” അമർത്തൂ!');

  const resetLocal = () => {
    setStep(0);
    setFlaming(false);
    setStormX(40);
    setHearts(3);
    setMsg('ഇടിമേഘം (⛈️) ബലൂണിന് മുകളിൽ ഇല്ലാത്ത സമയം നോക്കി “🔥 ജ്വാല ഉയർത്തൂ!” അമർത്തൂ!');
  };

  useEffect(() => {
    resetLocal();
  }, [resetSignal]);

  const allDone = step >= config.gates.length;
  const failed = hearts <= 0 && !allDone;
  const stormDanger = Math.abs(stormX - 155) < 52;

  useEffect(() => {
    if (allDone || failed) return;
    const id = window.setInterval(() => {
      setStormX((prev) => {
        const next = prev + stormDirRef.current * 5.5;
        if (next >= 270) stormDirRef.current = -1;
        if (next <= 40) stormDirRef.current = 1;
        return next;
      });
    }, 40);
    return () => window.clearInterval(id);
  }, [allDone, failed]);

  const handlePumpFlame = () => {
    sound.unlockAudio();
    if (allDone || failed) return;
    if (stormDanger) {
      sound.playError();
      const nextHearts = Math.max(0, hearts - 1);
      setHearts(nextHearts);
      setMsg(
        nextHearts <= 0
          ? '⛈️ ഇടിമേഘത്തിൽ തട്ടി ബലൂൺ താഴെയിറങ്ങി! വീണ്ടും ശ്രമിക്കാം.'
          : `⛈️ സൂക്ഷിക്കൂ! ഇടിമേഘം മാറാൻ കാത്തുനിൽക്കൂ! (ബാക്കി അവസരം: ${nextHearts})`
      );
      return;
    }
    setFlaming(true);
    const gate = config.gates[step];
    const next = step + 1;
    setStep(next);
    sound.playSuccess(next);
    setMsg(`${gate.emoji} ${gate.label}: ${gate.note}`);
    narrator.speak(gate.note, gate.label);
    window.setTimeout(() => setFlaming(false), 380);
    if (next === config.gates.length) {
      onWin();
    }
  };

  const balloonY = 185 - (step / config.gates.length) * 140;

  return (
    <div className="space-y-2.5">
      <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-300 shadow-inner bg-indigo-950 select-none">
        <div className="bg-slate-950/92 px-3 py-2 flex items-center justify-between gap-2 border-b border-indigo-400/30">
          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-900 text-amber-300 text-xs font-extrabold tabular-nums">
            🎈 {step}/{config.gates.length}
          </span>
          <GameShatterLives lives={hearts} maxLives={3} compact />
        </div>

        <svg
          viewBox="0 0 600 250"
          className={`w-full block ${isFullscreen ? 'max-h-[66dvh] h-auto mx-auto' : 'h-auto'}`}
          role="img"
          aria-label={config.title}
        >
          <defs>
            <linearGradient id="balloonSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="45%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#BBF7D0" />
            </linearGradient>
          </defs>
          <rect width="600" height="250" fill="url(#balloonSky)" />
          <rect x="0" y="220" width="600" height="30" fill="#15803D" />

          {/* Moving Storm Cloud Hazard Overhead */}
          {!allDone && (
            <g transform={`translate(${stormX}, ${Math.max(38, balloonY - 64)})`}>
              <ellipse cx="0" cy="0" rx="34" ry="15" fill={stormDanger ? '#991B1B' : '#334155'} stroke="#CBD5E1" strokeWidth="1.5" />
              <text x="0" y="6" textAnchor="middle" fontSize="18">
                ⛈️
              </text>
            </g>
          )}

          {config.gates.map((g, idx) => {
            const gy = 200 - ((idx + 1) / config.gates.length) * 165;
            const reached = idx < step;
            return (
              <g key={g.id}>
                <line x1="210" y1={gy} x2="310" y2={gy} stroke={reached ? '#FACC15' : '#FFFFFF'} strokeOpacity="0.55" strokeDasharray="5 5" />
                <rect
                  x="316"
                  y={gy - 13}
                  width="245"
                  height="26"
                  rx="8"
                  fill={reached ? '#065F46' : '#FFFFFF'}
                  stroke={reached ? '#FACC15' : '#CBD5E1'}
                  strokeWidth="1.5"
                />
                <text x="328" y={gy + 4} fill={reached ? '#FFFFFF' : '#1E293B'} fontSize="10.5" fontWeight="800">
                  {reached ? '✅ ' : `${g.emoji} `}
                  {g.label}
                </text>
              </g>
            );
          })}

          <motion.g animate={{ y: balloonY }} transition={{ type: 'spring', stiffness: 120, damping: 14 }}>
            <g transform="translate(155, 0)">
              <ellipse cx="0" cy="-22" rx="30" ry="34" fill="#EF4444" stroke="#FEF08A" strokeWidth="2" />
              <ellipse cx="0" cy="-22" rx="14" ry="34" fill="#FACC15" />
              <path d="M-12 10 L-8 24 M12 10 L8 24" stroke="#F8FAFC" strokeWidth="2" />
              {flaming && <polygon points="-6,14 0,4 6,14" fill="#F97316" />}
              <rect x="-12" y="24" width="24" height="14" rx="3" fill="#78350F" stroke="#FDE68A" strokeWidth="1.5" />
            </g>
          </motion.g>
        </svg>

        {/* IN-SCREEN BALLOON CONTROLS (ICON-ONLY) */}
        <div className="bg-slate-950/92 border-t border-indigo-400/40 px-3 py-2 flex items-center justify-center">
          <button
            type="button"
            disabled={allDone || failed}
            onClick={handlePumpFlame}
            aria-label="ജ്വാല ഉയർത്തൂ"
            title={msg}
            className={`h-13 px-10 rounded-2xl border-2 border-b-4 text-2xl font-extrabold transition-all ${
              allDone
                ? 'bg-emerald-600 text-white border-emerald-400 border-b-emerald-800 opacity-85'
                : stormDanger
                ? 'bg-rose-700 text-white border-rose-400 border-b-rose-950'
                : 'bg-orange-500 hover:bg-orange-400 text-white border-amber-200 border-b-orange-800 shadow-md active:translate-y-0.5'
            }`}
          >
            {allDone ? '🌟' : stormDanger ? '⛈️' : '🔥⬆️'}
          </button>
        </div>

        {failed && (
          <InStageFailOverlay
            title="⛈️ ഇടിമേഘത്തിൽ ബലൂൺ കുടുങ്ങി!"
            reason="ഇടിമേഘം മാറുമ്പോൾ കൃത്യമായി 🔥 അമർത്തൂ!"
            scoreText={`🎈 ${step}/${config.gates.length}`}
            onRetry={resetLocal}
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * ENGINE 8: REAL-TIME CYBER SHIELD METEOR DEFLECTOR ARCADE
 * ========================================================================== */
const CyberShieldArcadeGame: React.FC<{
  config: CyberArcadeConfig;
  onWin: () => void;
  resetSignal: number;
}> = ({ config, onWin, resetSignal }) => {
  const isFullscreen = useGameFullscreen();
  const [waveIdx, setWaveIdx] = useState(0);
  const [orbX, setOrbX] = useState(50);
  const [cleared, setCleared] = useState(0);
  const [hp, setHp] = useState(3);
  const [shieldFlash, setShieldFlash] = useState<'block' | 'allow' | null>(null);
  const [msg, setMsg] = useState('വരുന്ന സന്ദേശം വായിച്ച് വ്യാജമാണെങ്കിൽ “🛡️ തടുക്കൂ!”, സത്യമാണെങ്കിൽ “✅ കടത്തിവിടൂ!” അമർത്തൂ!');

  const resetLocal = () => {
    setWaveIdx(0);
    setOrbX(50);
    setCleared(0);
    setHp(3);
    setShieldFlash(null);
    setMsg('വരുന്ന സന്ദേശം വായിച്ച് വ്യാജമാണെങ്കിൽ “🛡️ തടുക്കൂ!”, സത്യമാണെങ്കിൽ “✅ കടത്തിവിടൂ!” അമർത്തൂ!');
  };

  useEffect(() => {
    resetLocal();
  }, [resetSignal]);

  const allDone = cleared >= config.waves.length;
  const failed = hp <= 0 && !allDone;
  const activeWave = config.waves[waveIdx];

  useEffect(() => {
    if (allDone || failed || !activeWave) return;
    const id = window.setInterval(() => {
      setOrbX((prev) => {
        if (prev >= 425) {
          // Reached the tower without player decision!
          if (activeWave.isFake) {
            sound.playError();
            setHp((h) => Math.max(0, h - 1));
            setMsg('💥 വ്യാജവാർത്ത ടവറിൽ തട്ടി! ഷീൽഡ് ശക്തി കുറഞ്ഞു — വേഗത്തിൽ “🛡️ തടുക്കൂ!” അമർത്തൂ!');
          }
          return 50;
        }
        return prev + 4.5;
      });
    }, 55);
    return () => window.clearInterval(id);
  }, [allDone, failed, activeWave]);

  const handleAction = (action: 'block' | 'allow') => {
    sound.unlockAudio();
    if (allDone || failed || !activeWave) return;
    const isCorrect = (action === 'block' && activeWave.isFake) || (action === 'allow' && !activeWave.isFake);
    if (isCorrect) {
      setShieldFlash(action);
      window.setTimeout(() => setShieldFlash(null), 450);
      const nextCleared = cleared + 1;
      setCleared(nextCleared);
      sound.playSuccess(nextCleared);
      setMsg(activeWave.feedback);
      narrator.speak(activeWave.feedback, activeWave.text);
      if (nextCleared >= config.waves.length) {
        onWin();
      } else {
        setWaveIdx((w) => w + 1);
        setOrbX(50);
      }
    } else {
      sound.playError();
      const nextHp = Math.max(0, hp - 1);
      setHp(nextHp);
      setMsg(
        nextHp <= 0
          ? '💥 സൈബർ ഷീൽഡ് തകർന്നു! വീണ്ടും ശ്രമിക്കാം.'
          : activeWave.isFake
          ? `⚠️ തെറ്റിപ്പോയി! ഇത് വ്യാജവാർത്തയാണ് — “🛡️ തടുക്കൂ!” അമർത്തൂ! (ബാക്കി ഷീൽഡ്: ${nextHp})`
          : `⚠️ തെറ്റിപ്പോയി! ഇത് സത്യവാർത്തയാണ് — “✅ കടത്തിവിടൂ!” അമർത്തൂ! (ബാക്കി ഷീൽഡ്: ${nextHp})`
      );
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="relative rounded-2xl overflow-hidden border-2 border-sky-400 bg-slate-950 shadow-inner select-none">
        <div className="bg-slate-950/92 px-3 py-2 flex items-center justify-between gap-2 border-b border-sky-500/30">
          <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-sky-300 text-xs font-extrabold tabular-nums">
            📩 {cleared}/{config.waves.length}
          </span>
          <GameShatterLives lives={hp} maxLives={3} compact />
        </div>

        <svg
          viewBox="0 0 600 215"
          className={`w-full block ${isFullscreen ? 'max-h-[58dvh] h-auto mx-auto' : 'h-auto'}`}
          role="img"
          aria-label={config.title}
        >
          <rect width="600" height="215" fill="#0F172A" />
          <rect x="0" y="182" width="600" height="33" fill="#064E3B" />
          {[55, 145, 250, 355].map((tx) => (
            <circle key={tx} cx={tx} cy="178" r="16" fill="#065F46" />
          ))}

          <line x1="40" y1="98" x2="480" y2="98" stroke="#38BDF8" strokeWidth="3" strokeDasharray="8 6" opacity="0.5" />

          <rect
            x="455"
            y="40"
            width="10"
            height="120"
            rx="5"
            fill={shieldFlash === 'block' ? '#38BDF8' : shieldFlash === 'allow' ? '#4ADE80' : '#0EA5E9'}
            opacity={shieldFlash ? 1 : 0.45}
          />

          <g transform="translate(505, 60)">
            <polygon points="25,0 5,122 45,122" fill="none" stroke="#94A3B8" strokeWidth="3" />
            <line x1="12" y1="60" x2="38" y2="60" stroke="#94A3B8" strokeWidth="2.5" />
            <circle cx="25" cy="6" r="9" fill={hp > 1 ? '#22C55E' : '#EF4444'} />
            <text x="25" y="140" textAnchor="middle" fill="#A7F3D0" fontSize="9.5" fontWeight="800">
              നാടിന്റെ ടവർ
            </text>
          </g>

          {!allDone && activeWave && (
            <g transform={`translate(${orbX}, 98)`}>
              <rect
                x="-30"
                y="-26"
                width="210"
                height="52"
                rx="14"
                fill={activeWave.isFake ? '#7F1D1D' : '#065F46'}
                stroke={activeWave.isFake ? '#F87171' : '#34D399'}
                strokeWidth="2.5"
              />
              <text x="-12" y="6" fontSize="20">
                {activeWave.emoji}
              </text>
              <text x="16" y="4" fill="#FFFFFF" fontSize="10.5" fontWeight="800">
                {activeWave.text.slice(0, 26)}
              </text>
            </g>
          )}

          {allDone && (
            <text x="275" y="105" textAnchor="middle" fill="#4ADE80" fontSize="17" fontWeight="900">
              🛡️ സൈബർ കവചം 100% സുരക്ഷിതം!
            </text>
          )}
        </svg>

        {/* IN-SCREEN MESSAGE & ICONIC SHIELD ACTION BUTTONS */}
        <div className="bg-slate-900/95 border-t border-sky-500/40 px-3 py-2 space-y-2">
          {!allDone && activeWave && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 text-amber-200 border border-sky-400/40 text-xs font-extrabold text-center">
              {activeWave.emoji} {activeWave.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
            <button
              type="button"
              disabled={allDone || failed}
              onClick={() => handleAction('block')}
              aria-label="വ്യാജം — തടുക്കൂ"
              title={msg}
              className="h-12 rounded-xl border-b-4 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white border-rose-950 text-xl font-extrabold shadow-md flex items-center justify-center gap-1.5"
            >
              <span>🛡️</span>
              <span>❌</span>
            </button>
            <button
              type="button"
              disabled={allDone || failed}
              onClick={() => handleAction('allow')}
              aria-label="സത്യം — കടത്തിവിടൂ"
              className="h-12 rounded-xl border-b-4 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white border-emerald-950 text-xl font-extrabold shadow-md flex items-center justify-center gap-1.5"
            >
              <span>✅</span>
              <span>➡️</span>
            </button>
          </div>
        </div>

        {failed && (
          <InStageFailOverlay
            title="💥 സൈബർ കവചം തകർന്നു!"
            reason="വ്യാജം 🛡️, സത്യം ✅ — കൃത്യമായി വേർതിരിച്ച് വീണ്ടും ശ്രമിക്കാം!"
            scoreText={`📩 ${cleared}/${config.waves.length}`}
            onRetry={resetLocal}
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * MANDATORY ANIMATED LESSON GAME WRAPPER (NO SKIP / NO OPTIONAL LABEL!)
 * ========================================================================== */
export interface OptionalLessonMiniGameProps {
  lessonKey: MiniGameLessonKey;
  onAwardXp: (amount: number, actionId: string) => void;
  onComplete?: () => void;
  isCompleted?: boolean;
  defaultOpen?: boolean;
}

const SceneGameRunner: React.FC<{
  lessonKey: MiniGameLessonKey;
  config: SceneGameConfig;
  onAwardXp: (amount: number, actionId: string) => void;
  onComplete?: () => void;
  externalCompleted: boolean;
}> = ({ lessonKey, config, onAwardXp, onComplete, externalCompleted }) => {
  const [completed, setCompleted] = useState(externalCompleted);
  const [resetSignal, setResetSignal] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setCompleted(externalCompleted);
    setShowInfo(false);
  }, [externalCompleted, lessonKey]);

  const handleWin = () => {
    if (!completed) {
      setCompleted(true);
      sound.playHoist();
      onAwardXp(25, `scene_game_${lessonKey}`);
      onComplete?.();
      narrator.speak(config.doneMessage, config.title);
      window.setTimeout(() => scrollToActiveQuiz(), 850);
    }
  };

  const handleReplay = () => {
    sound.playClick();
    setResetSignal((k) => k + 1);
  };

  const wingLogos = getOfficialLogosForLesson(lessonKey);

  return (
    <GameFullscreenShell
      title={config.title}
      isGameDone={completed}
      onSkipGame={onComplete}
    >
      <div
        className={`rounded-2xl border-2 shadow-sm overflow-hidden ${
          completed
            ? 'border-emerald-400 bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/60'
            : 'border-amber-400 bg-gradient-to-br from-amber-50/95 via-white to-sky-50/70'
        }`}
      >
        {/* Minimal Icon-Only Game Strip + Official Wing Logo */}
        <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowInfo((v) => !v);
              }}
              aria-label="വിവരം"
              className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowInfo((v) => !v);
              }}
              aria-label="സഹായം"
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                showInfo ? 'bg-white text-emerald-950' : 'bg-white/15 hover:bg-white/25 text-amber-200'
              }`}
            >
              <Info className="w-4 h-4" />
            </button>
            {wingLogos.slice(0, 2).map((logo) => (
              <div
                key={logo.id}
                className="h-7 px-1.5 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs"
                title={logo.label}
              >
                <img
                  src={logo.src}
                  alt={logo.label}
                  className="h-5 w-auto max-w-[68px] object-contain"
                />
              </div>
            ))}
            {completed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600/80 text-white text-xs font-extrabold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> +25
              </span>
            )}
          </div>

          {completed && (
            <button
              type="button"
              onClick={handleReplay}
              aria-label="വീണ്ടും കളിക്കാം"
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {showInfo && (
          <div className="px-3.5 py-2 bg-emerald-950/95 text-emerald-100 border-b border-emerald-800 space-y-0.5">
            <p className="text-xs font-extrabold text-amber-300 leading-snug">{config.title}</p>
            <p className="text-[11px] font-semibold leading-snug">{config.subtitle}</p>
          </div>
        )}

        <div className="p-2.5 sm:p-3 space-y-2.5 text-slate-900">
          {config.engine === 'tree_rain_garden' && (
            <TreeRainGardenGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'road_vehicle_drive' && (
            <RoadVehicleDriveGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'train_station_voyage' && (
            <TrainStationVoyageGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'mosque_crane_builder' && (
            <CraneBuilderGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'flag_rope_hoist' && (
            <FlagRopeHoistGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'ship_harbor_sail' && (
            <ShipHarborSailGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'balloon_altitude_climb' && (
            <BalloonClimbGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'cyber_shield_arcade' && (
            <CyberShieldArcadeGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'airplane_sic_flight' && (
            <AirplaneSicFlightGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'helicopter_rescue_drop' && (
            <HelicopterRescueDropGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'balloon_pop_arcade' && (
            <BalloonPopArcadeGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'tagore_hall_pass_gate' && (
            <TagoreHallPassGateGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'trend_career_compass' && (
            <TrendCareerCompassGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'green_campus_sort' && (
            <GreenCampusSortGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'organet_chain_connect' && (
            <OrganetChainGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}
          {config.engine === 'sargalayam_spotlight' && (
            <SargalayamSpotlightGame config={config} onWin={handleWin} resetSignal={resetSignal} />
          )}

          {completed && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white border border-amber-300 flex flex-wrap items-center justify-between gap-2 shadow-sm">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>🎉 +25 XP</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.unlockAudio();
                  sound.playClick();
                  scrollToActiveQuiz();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold"
              >
                <span>അടുത്തത് · ക്വിസ്</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </GameFullscreenShell>
  );
};

export const OptionalLessonMiniGame: React.FC<OptionalLessonMiniGameProps> = ({
  lessonKey,
  onAwardXp,
  onComplete,
  isCompleted: externalCompleted = false,
}) => {
  // 7 Authentic Kerala SKSSF Practical Games (POV Lessons)
  if (lessonKey === 'pov_1') {
    const title = '📚 ഇസ്‌ലാമിക ലൈബ്രറി അദബ് — പുസ്തകങ്ങൾ ക്രമത്തിൽ അടുക്കാം!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <IslamicLibraryShelfGame
          xpKey="pov_1_library"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'pov_2') {
    const title = '📜 മജ്‌ലിസുന്നൂർ അജണ്ടയും നോട്ടീസും തയ്യാറാക്കാം!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <MajlisAgendaNoticeGame
          xpKey="pov_2_majlis_notice"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'pov_3') {
    const title = '🖌️ സമ്മേളന ചുമരിലെഴുത്ത് (Wall Writing)!';
    return (
      <GameFullscreenShell
        title={title}
        subtitle="അനുവാദമുള്ള ചുമരിൽ 5 ഭാഗങ്ങൾക്കും ചേരുന്ന നിറം തിരഞ്ഞെടുത്ത് പെയിന്റ് ചെയ്യൂ — തെറ്റായ നിറമോ സ്വകാര്യ ഗേറ്റിൽ തട്ടലോ സമയം തീരലോ കവചം തകർക്കും!"
        isGameDone={externalCompleted}
        onSkipGame={onComplete}
      >
        <WallWritingPaintGame
          xpKey="pov_3_wall_writing"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'pov_4') {
    const title = '🏗️ സമ്മേളന സ്റ്റേജ് നിർമ്മാണം (7 ഘട്ടങ്ങൾ)!';
    return (
      <GameFullscreenShell
        title={title}
        subtitle="കലക്കിവെച്ച ഭാഗങ്ങളിൽ നിന്ന് 30 സെക്കൻഡിനുള്ളിൽ തറ മുതൽ പ്രസംഗപീഠം വരെ ശരിയായ ക്രമത്തിൽ തിരഞ്ഞെടുക്കൂ! അപകട വസ്തുക്കളും തെറ്റായ ക്രമവും കവചം തകർക്കും."
        isGameDone={externalCompleted}
        onSkipGame={onComplete}
      >
        <StageBuildSequenceGame
          xpKey="pov_4_stage_build"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'pov_6') {
    const title = '💰 വരവ്–ചെലവ്–നീക്കിയിരിപ്പും ചീരണി വിതരണവും!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <ProgramBudgetCheeraniGame
          xpKey="pov_6_budget_cheerani"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'pov_7') {
    const title = '🏟️ പരിപാടിക്ക് ശേഷം സ്റ്റേഡിയം ശുചീകരണം (വിഖായ)!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <StadiumCleanupViqayaGame
          xpKey="pov_7_stadium_cleanup"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'pov_8') {
    const title = '📋 പരിപാടി അവലോകന റിപ്പോർട്ട് തയ്യാറാക്കാം!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <ProgramReviewReportGame
          xpKey="pov_8_review_report"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }

  // Route dedicated tactile Drag-and-Drop / Scratch-Clean / Welcome Arch Painting / Stage / Room / Food / Photo-Crop / Trophy games
  if (lessonKey === 'p1') {
    const title = '🎨 സമ്മേളന സ്വാഗത കമാനം പെയിന്റ് ചെയ്യാം!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <PaintRollerGame
          xpKey="p1_paint"
          title={title}
          subtitle="ഇഷ്ടമുള്ള നിറങ്ങൾ തിരഞ്ഞെടുത്ത് സമ്മേളന നഗരിയിലേക്കുള്ള സ്വാഗത കമാനത്തിന്റെ 6 ഭാഗങ്ങളും മനോഹരമായി പെയിന്റ് ചെയ്യൂ!"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'p3') {
    const title = '🧽 1951 SKIMVB മദ്രസാ ബോർഡ് (11,000+ മദ്രസകൾ · അൽബിർ · SNEC) സ്ക്രാച്ച് & ക്ലീൻ!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <ScratchCleanBoardGame
          xpKey="p3_scratch_board"
          title={title}
          subtitle="വിരൽ / മൗസ് കൊണ്ട് ബോർഡിലെ പൊടി ഉരച്ചു കളഞ്ഞ് 1951 SKIMVB, 1989 SKSSF, 1993 SKSBV വിവരങ്ങൾ തെളിയിക്കൂ!"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'storyboard') {
    const title = '📱 SKSSF സൈബർ വിംഗ് (സൈകോൺ) — ലൈവ് ഫീഡ് മോഡറേറ്റർ!';
    const subtitle =
      'നല്ല സൈകോൺ / SKICR / സഹചാരി പോസ്റ്റുകൾ പബ്ലിഷ് (➡️) ചെയ്യൂ, വ്യാജ വാർത്തകളും പ്രകോപന തർക്കങ്ങളും ബ്ലോക്ക് (⬅️) ചെയ്യൂ! തെറ്റായ തീരുമാനമോ സമയം തീരലോ സ്പാം-ബോട്ട് ആക്രമണമോ കവചം തകർക്കും.';
    return (
      <GameFullscreenShell
        title={title}
        subtitle={subtitle}
        isGameDone={externalCompleted}
        onSkipGame={onComplete}
      >
        <CyberWingCyconFeedGame
          xpKey="storyboard_posters"
          title={title}
          subtitle={subtitle}
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'l1_cosmic') {
    const title = '🏆 അൽബിർ കിഡ്‌സ് ഫെസ്റ്റ് (Albirr) & SKSBV മജ്‌ലിസുൽ മആരിഫ് ട്രോഫി, ഗിഫ്റ്റ് & സ്ക്രാച്ച്!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <TrophyGiftPackGame
          xpKey="l1_trophy_gift"
          title={title}
          subtitle="അൽബിർ & SKSBV മദ്രസാ വിജയികൾക്കുള്ള ട്രോഫികളിൽ സ്റ്റിക്കർ ഒട്ടിച്ചും സമ്മാനപ്പൊതിയിൽ റിബ്ബൺ കെട്ടിയും സ്വർണ്ണ കാർഡ് സ്ക്രാച്ച് ചെയ്യൂ!"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'l2_election_roles') {
    const title = '🎙️ SKSSF സമ്മേളന & സർഗലയം (Sargalayam) വേദി ക്രമീകരണം!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <StageSetupDragGame
          xpKey="l2_stage_setup"
          title={title}
          subtitle="കസേരകൾ വരിയായി അടുക്കിയും SKSSF സർഗലയം ബാനർ ഒട്ടിച്ചും പോഡിയത്തിൽ മൈക്ക് ശരിയാക്കിയും വേദി ഒരുക്കൂ!"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'l2_centres') {
    const title = '🧹 വിഖായ പള്ളി & ഇസ്‌ലാമിക് സെന്റർ മുറ്റം വൃത്തിയാക്കാം!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <MasjidCleanSweepGame
          xpKey="l2_masjid_clean"
          title={title}
          subtitle="മുറ്റത്ത് വീണ ഇലകളും മാലിന്യങ്ങളും വിഖായ ഗ്രീൻ ബിന്നിലേക്ക് വലിച്ചിടൂ അല്ലെങ്കിൽ തൊട്ട് വൃത്തിയാക്കൂ!"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  // l2_dawa_age now routes cleanly to SCENE_GAME_CONFIGS.l2_dawa_age (BalloonPopArcadeGame!) so it is no longer a PosterWallStickGame clone.
  if (lessonKey === 'l2_dawa_lanterns') {
    const title = '🏠 SKSSF യൂണിറ്റ് ഓഫീസ്, സഹചാരി & സത്യധാര ലൈബ്രറി റൂം ഒരുക്കാം!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <UnitRoomDecorGame
          xpKey="l2_unit_room"
          title={title}
          subtitle="SKSSF കൊടി സ്റ്റാൻഡ്, നോട്ടീസ് ബോർഡ്, സത്യധാര ലൈബ്രറി, മേശ, ക്ലോക്ക് എന്നിവ വലിച്ചിട്ട് ഓഫീസ് ഒരുക്കൂ!"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'l2_vault') {
    const title = '📸 SKSSF മീഡിയ & സൈബർ വിംഗ് (സുപ്രഭാതം · സത്യധാര) ഫോട്ടോ സ്റ്റുഡിയോ!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <PhotoCropEditGame
          xpKey="l2_photo_studio"
          title={title}
          subtitle="സുപ്രഭാതം & സത്യധാര റിപ്പോർട്ടിനായി ക്യാമറ ഫോക്കസ് ചെയ്ത് ഫോട്ടോ എടുക്കൂ, ശേഷം ക്രോപ്പ് ചെയ്ത് എഡിറ്റ് ചെയ്ത് സേവ് ചെയ്യൂ!"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }
  if (lessonKey === 'l3_scrolls') {
    const title = '🍱 സഹചാരി റിലീഫ് സെൽ & വിഖായ ഭക്ഷണ/കരുതൽ പാക്ക് വിതരണം!';
    return (
      <GameFullscreenShell title={title} isGameDone={externalCompleted} onSkipGame={onComplete}>
        <FoodPackDeliverGame
          xpKey="l3_food_pack"
          title={title}
          subtitle="ഭക്ഷണപ്പൊതിയും വെള്ളവും ഈത്തപ്പഴവും സഹചാരി ബോക്സിലേക്ക് വലിച്ചിട്ട് പാക്ക് ചെയ്ത് 3 കുടുംബങ്ങൾക്ക് എത്തിക്കൂ!"
          onAwardXp={onAwardXp}
          onComplete={onComplete}
          isCompleted={externalCompleted}
        />
      </GameFullscreenShell>
    );
  }

  const config = SCENE_GAME_CONFIGS[lessonKey as keyof typeof SCENE_GAME_CONFIGS];

  if (!config) return null;

  return (
    <SceneGameRunner
      lessonKey={lessonKey}
      config={config}
      onAwardXp={onAwardXp}
      onComplete={onComplete}
      externalCompleted={externalCompleted}
    />
  );
};
