import React, { useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, CheckCircle2, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { GameFullscreenShell, useGameFullscreen, useGameStagePaused } from './GameFullscreenShell';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import { OFFICIAL_WING_LOGOS } from '../data/officialLogos';
import { OFFICIAL_FLAG_ASSETS } from './SvgArtwork';
import {
  GeometricOnboardingOverlay,
  OnboardingHintReplayButton,
} from './VisualOnboardingHint';

/* ============================================================================
 * 1. OPENING INTERACTIVE ACTIVITY: SKSSF ANNOUNCEMENT VEHICLE + ROUTE PUZZLE
 *    - Realistic 3D-perspective moving road & official fluttering SKSSF flag
 *    - Phase 1: Precision 4-module rigging (Roof PA Horns, Flagpole, Banner, Battery)
 *    - Phase 2: Adult-friendly tactical route & timing logic puzzle
 * ========================================================================== */

type JeepPartId = 'speaker' | 'flag' | 'sticker' | 'amp';

interface JeepPart {
  id: JeepPartId;
  code: string;
  title: string;
  targetName: string;
  placedSpeech: string;
}

const JEEP_PARTS: JeepPart[] = [
  {
    id: 'speaker',
    code: 'PA',
    title: 'ഡ്യുവൽ PA ലൗഡ്‌സ്പീക്കർ',
    targetName: 'മേൽക്കൂര റാക്ക്',
    placedSpeech:
      'ഡ്യുവൽ ലൗഡ്‌സ്പീക്കർ മേൽക്കൂരയിലെ സ്റ്റീൽ റാക്കിൽ ഉറപ്പിച്ചു. ഇനി വ്യക്തമായ ശബ്ദത്തിൽ സമ്മേളന സന്ദേശം അറിയിക്കാം.',
  },
  {
    id: 'flag',
    code: 'FLAG',
    title: 'SKSSF ഔദ്യോഗിക പതാക',
    targetName: 'മുൻഭാഗത്തെ കൊടിമരം',
    placedSpeech:
      'ആകാശനീലയും വെള്ളയും പച്ചയും ചേർന്ന SKSSF ഔദ്യോഗിക പതാക മുൻഭാഗത്തെ കൊടിമരത്തിൽ ഉയർന്നു പാറുന്നു.',
  },
  {
    id: 'sticker',
    code: 'BANNER',
    title: 'സമ്മേളന ആദർശ ബാനർ',
    targetName: 'സൈഡ് പാനൽ',
    placedSpeech:
      'വിജ്ഞാനം, വിനയം, സേവനം എന്ന ആദർശ ബാനർ വാഹനത്തിന്റെ സൈഡ് പാനലിൽ ഭംഗിയായി ഘടിപ്പിച്ചു.',
  },
  {
    id: 'amp',
    code: 'AMP',
    title: 'ആംപ്ലിഫയർ & ബാറ്ററി',
    targetName: 'പിൻഭാഗ കാബിൻ',
    placedSpeech:
      'ബാറ്ററിയും ആംപ്ലിഫയറും പിൻഭാഗ കാബിനിൽ സുരക്ഷിതമായി കണക്ട് ചെയ്തു. ശബ്ദ സംവിധാനം സജ്ജമായി.',
  },
];

interface RouteLogicPuzzle {
  id: string;
  badge: string;
  question: string;
  options: { label: string; isCorrect: boolean; feedback: string }[];
}

const JEEP_ROUTE_PUZZLES: RouteLogicPuzzle[] = [
  {
    id: 'route_etiquette',
    badge: 'തന്ത്രപരമായ പസിൽ 1/2 · പ്രചാരണ മര്യാദ',
    question:
      'വൈകുന്നേരം 4:30-ന് യാത്ര തുടങ്ങുന്ന പ്രചാരണ വാഹനത്തിന്റെ വഴിയിൽ ഒരു ആശുപത്രി, ജുമുഅ മസ്ജിദ് (അസർ ബാങ്ക് സമയം), പ്രധാന ടൗൺ ജംഗ്ഷൻ എന്നിവയുണ്ട്. ഏറ്റവും ഉത്തരവാദിത്തമുള്ള പ്രചാരണ രീതി ഏതാണ്?',
    options: [
      {
        label: 'ആശുപത്രി മേഖലയിലും ബാങ്ക് സമയത്തും മൈക്ക് ഓഫ് ചെയ്ത്, ടൗൺ ജംഗ്ഷനിൽ മാത്രം മിതമായ ശബ്ദത്തിൽ അനൗൺസ് ചെയ്യുക',
        isCorrect: true,
        feedback:
          'കൃത്യം! പൊതുജനങ്ങൾക്ക് ബുദ്ധിമുട്ടുണ്ടാക്കാതെ, സൈലന്റ് സോണും പ്രാർത്ഥനാ സമയവും മാനിക്കുന്നതാണ് മാതൃകാ SKSSF സംഘാടനത്തിന്റെ അടയാളം.',
      },
      {
        label: 'എല്ലാ സ്ഥലത്തും ഒരേ ഉച്ചത്തിലുള്ള ശബ്ദത്തിൽ നിർത്താതെ അനൗൺസ് ചെയ്തു പോകുക',
        isCorrect: false,
        feedback:
          'ശരിയല്ല — ആശുപത്രി മേഖലയിലും ബാങ്ക് സമയത്തും മൈക്ക് ഉപയോഗിക്കുന്നത് നിയമപരമായും ധാർമ്മികമായും തെറ്റാണ്.',
      },
      {
        label: 'ടൗൺ ജംഗ്ഷൻ ഒഴിവാക്കി ആളൊഴിഞ്ഞ ഇടവഴികളിലൂടെ മാത്രം വാഹനം ഓടിക്കുക',
        isCorrect: false,
        feedback:
          'ആളൊഴിഞ്ഞ വഴികളിലൂടെ മാത്രം പോയാൽ സമ്മേളന സന്ദേശം നാട്ടുകാരിലേക്ക് കൃത്യമായി എത്തില്ല.',
      },
    ],
  },
  {
    id: 'route_budget',
    badge: 'തന്ത്രപരമായ പസിൽ 2/2 · സമയ ക്രമീകരണം',
    question:
      'മഗ്‌രിബിന് മുമ്പ് ബാക്കിയുള്ളത് 45 മിനിറ്റ് മാത്രം. 3 കേന്ദ്രങ്ങളിൽ എത്തണം: (A) മാർക്കറ്റ് ജംഗ്ഷൻ — 20 മിനിറ്റ് (5:30-ന് കടകൾ അടയും), (B) മദ്രസാ പരിസരം — 10 മിനിറ്റ് (5:00-ന് കുട്ടികൾ വിടും), (C) ബസ് സ്റ്റാൻഡ് — 15 മിനിറ്റ് (6:00 വരെ തിരക്ക്). ഏറ്റവും മികച്ച ക്രമം ഏത്?',
    options: [
      {
        label: 'B (മദ്രസ) → A (മാർക്കറ്റ്) → C (ബസ് സ്റ്റാൻഡ്)',
        isCorrect: true,
        feedback:
          'മികച്ച ആസൂത്രണം! 5:00-ന് മദ്രസയിൽ തുടങ്ങി, 5:30-ന് മുമ്പ് മാർക്കറ്റും തീർത്ത്, അവസാനം തിരക്കുള്ള ബസ് സ്റ്റാൻഡിൽ എത്താം.',
      },
      {
        label: 'C (ബസ് സ്റ്റാൻഡ്) → B (മദ്രസ) → A (മാർക്കറ്റ്)',
        isCorrect: false,
        feedback:
          'അങ്ങനെ പോയാൽ മദ്രസ വിട്ടുപോകുകയും മാർക്കറ്റ് കടകൾ അടയുകയും ചെയ്യും. സമയക്രമം ഒരിക്കൽ കൂടി കണക്കുകൂട്ടൂ.',
      },
      {
        label: 'A (മാർക്കറ്റ്) → C (ബസ് സ്റ്റാൻഡ്) → B (മദ്രസ)',
        isCorrect: false,
        feedback:
          'അവസാനം മദ്രസയിൽ എത്തിയാൽ കുട്ടികളും രക്ഷിതാക്കളും പോയിക്കഴിഞ്ഞിരിക്കും.',
      },
    ],
  },
];

export interface AnnouncementVehicleActivityProps {
  onComplete: () => void;
  onAwardXp: (amount: number, actionId: string) => void;
  onOpenBadgeStudio?: (presetBadgeId: string) => void;
  onProceedNext?: () => void;
}

export const AnnouncementVehicleActivity: React.FC<AnnouncementVehicleActivityProps> = ({
  onComplete,
  onAwardXp,
  onOpenBadgeStudio,
  onProceedNext,
}) => {
  const [placed, setPlaced] = useState<Record<JeepPartId, boolean>>({
    speaker: false,
    flag: false,
    sticker: false,
    amp: false,
  });
  const [selectedPart, setSelectedPart] = useState<JeepPartId | null>(null);
  const [draggingPart, setDraggingPart] = useState<JeepPartId | null>(null);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [puzzleDone, setPuzzleDone] = useState(false);
  const [puzzleFeedback, setPuzzleFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [celebrated, setCelebrated] = useState(false);
  const [wrongMsg, setWrongMsg] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const maxMistakes = 3;
  const failed = mistakes >= maxMistakes;

  const placedCount = Object.values(placed).filter(Boolean).length;
  const allPlaced = placedCount === 4;
  const missionDone = allPlaced && puzzleDone;

  useEffect(() => {
    if (missionDone && !celebrated) {
      setCelebrated(true);
      sound.playHoist();
      onAwardXp(50, 'opening_jeep_ready');
      onComplete();
      narrator.speak(
        'മികച്ച സംഘാടന മികവ്! SKSSF പ്രചാരണ വാഹനം പൂർണ്ണമായി സജ്ജീകരിക്കുകയും റൂട്ട് പസിൽ വിജയകരമായി പൂർത്തിയാക്കുകയും ചെയ്തു. ഇനി അടുത്ത പാഠത്തിലേക്ക് മുന്നേറാം.',
        'SKSSF പ്രചാരണ വാഹനം തയ്യാർ'
      );
    }
  }, [missionDone, celebrated, onAwardXp, onComplete]);

  const placePart = (partId: JeepPartId, targetSlot?: JeepPartId) => {
    sound.unlockAudio();
    if (placed[partId] || failed) return;
    if (targetSlot && targetSlot !== partId) {
      sound.playError();
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      const correctItem = JEEP_PARTS.find((p) => p.id === partId);
      setWrongMsg(
        nextMistakes >= maxMistakes
          ? '3 തവണ തെറ്റായ സ്ഥാനത്ത് വെച്ചു! വീണ്ടും കൃത്യതയോടെ സജ്ജീകരിക്കാം.'
          : `തെറ്റായ സ്ഥാനം! "${correctItem?.title}" സ്ഥാപിക്കേണ്ടത് "${correctItem?.targetName}" ഭാഗത്താണ്. (ബാക്കി കവചം: ${maxMistakes - nextMistakes})`
      );
      return;
    }
    setWrongMsg(null);
    const nextState = { ...placed, [partId]: true };
    setPlaced(nextState);
    setSelectedPart(null);
    setDraggingPart(null);
    const meta = JEEP_PARTS.find((p) => p.id === partId);
    const nextCount = Object.values(nextState).filter(Boolean).length;
    sound.playSuccess(nextCount);
    if (meta) {
      onAwardXp(10, `jeep_part_${partId}`);
      narrator.speak(meta.placedSpeech, meta.title);
    }
  };

  const handleTapZone = (slot: JeepPartId) => {
    if (placed[slot] || failed) return;
    if (selectedPart) {
      placePart(selectedPart, slot);
    } else {
      setWrongMsg('ആദ്യം താഴെയുള്ള ട്രേയിൽ നിന്ന് അനുയോജ്യമായ ഉപകരണം തിരഞ്ഞെടുത്ത് ഇവിടെ ഘടിപ്പിക്കുക.');
      sound.playClick();
    }
  };

  const handlePuzzleAnswer = (opt: RouteLogicPuzzle['options'][number]) => {
    sound.unlockAudio();
    if (opt.isCorrect) {
      sound.playSuccess(puzzleIdx + 2);
      setPuzzleFeedback({ ok: true, text: opt.feedback });
      if (puzzleIdx + 1 < JEEP_ROUTE_PUZZLES.length) {
        window.setTimeout(() => {
          setPuzzleIdx((i) => i + 1);
          setPuzzleFeedback(null);
        }, 1250);
      } else {
        setPuzzleDone(true);
      }
    } else {
      sound.playError();
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setPuzzleFeedback({ ok: false, text: opt.feedback });
    }
  };

  const handleReset = () => {
    sound.playClick();
    setPlaced({ speaker: false, flag: false, sticker: false, amp: false });
    setSelectedPart(null);
    setPuzzleIdx(0);
    setPuzzleDone(false);
    setPuzzleFeedback(null);
    setCelebrated(false);
    setWrongMsg(null);
    setMistakes(0);
  };

  const playVoiceIntro = () => {
    sound.unlockAudio();
    narrator.speak(
      'പ്രചാരണ വാഹനം സജ്ജീകരിക്കാം. താഴെയുള്ള നാല് ഉപകരണങ്ങൾ വാഹനത്തിലെ കൃത്യമായ സ്ഥാനങ്ങളിൽ ഘടിപ്പിച്ച ശേഷം, പ്രചാരണ റൂട്ട് പസിൽ പരിഹരിക്കുക.',
      'SKSSF പ്രചാരണ വാഹനം'
    );
  };

  return (
    <GameFullscreenShell title="SKSSF പ്രചാരണ വാഹനം · 3D റൂട്ട് ദൗത്യം" isGameDone={missionDone}>
      <AnnouncementVehicleInner
        placed={placed}
        placedCount={placedCount}
        allPlaced={allPlaced}
        missionDone={missionDone}
        puzzleIdx={puzzleIdx}
        puzzleFeedback={puzzleFeedback}
        mistakes={mistakes}
        maxMistakes={maxMistakes}
        failed={failed}
        selectedPart={selectedPart}
        draggingPart={draggingPart}
        wrongMsg={wrongMsg}
        setSelectedPart={setSelectedPart}
        setDraggingPart={setDraggingPart}
        setWrongMsg={setWrongMsg}
        placePart={placePart}
        handleTapZone={handleTapZone}
        handlePuzzleAnswer={handlePuzzleAnswer}
        handleReset={handleReset}
        playVoiceIntro={playVoiceIntro}
        onOpenBadgeStudio={onOpenBadgeStudio}
        onProceedNext={onProceedNext}
      />
    </GameFullscreenShell>
  );
};

interface AnnouncementVehicleInnerProps {
  placed: Record<JeepPartId, boolean>;
  placedCount: number;
  allPlaced: boolean;
  missionDone: boolean;
  puzzleIdx: number;
  puzzleFeedback: { ok: boolean; text: string } | null;
  mistakes: number;
  maxMistakes: number;
  failed: boolean;
  selectedPart: JeepPartId | null;
  draggingPart: JeepPartId | null;
  wrongMsg: string | null;
  setSelectedPart: React.Dispatch<React.SetStateAction<JeepPartId | null>>;
  setDraggingPart: React.Dispatch<React.SetStateAction<JeepPartId | null>>;
  setWrongMsg: React.Dispatch<React.SetStateAction<string | null>>;
  placePart: (partId: JeepPartId, targetSlot?: JeepPartId) => void;
  handleTapZone: (slot: JeepPartId) => void;
  handlePuzzleAnswer: (opt: RouteLogicPuzzle['options'][number]) => void;
  handleReset: () => void;
  playVoiceIntro: () => void;
  onOpenBadgeStudio?: (presetBadgeId: string) => void;
  onProceedNext?: () => void;
}

const AnnouncementVehicleInner: React.FC<AnnouncementVehicleInnerProps> = ({
  placed,
  placedCount,
  allPlaced,
  missionDone,
  puzzleIdx,
  puzzleFeedback,
  mistakes,
  maxMistakes,
  failed,
  selectedPart,
  draggingPart,
  wrongMsg,
  setSelectedPart,
  setDraggingPart,
  setWrongMsg,
  placePart,
  handleTapZone,
  handlePuzzleAnswer,
  handleReset,
  playVoiceIntro,
  onOpenBadgeStudio,
  onProceedNext,
}) => {
  const isFullscreen = useGameFullscreen();
  const rawUid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const bodyGradId = `jeep-body-3d-${rawUid}`;
  const glassGradId = `jeep-glass-3d-${rawUid}`;
  const roadGradId = `jeep-road-3d-${rawUid}`;
  const flagWaveGradId = `jeep-flag-wave-${rawUid}`;
  const activePuzzle = JEEP_ROUTE_PUZZLES[puzzleIdx];

  // 3-Second Pure-Geometric Visual Onboarding Hint (auto-dismisses after 3.2s or on first touch)
  const [showVisualGuide, setShowVisualGuide] = useState(true);
  const guideTimerRef = useRef<number | null>(null);

  const replayVisualGuide = () => {
    if (guideTimerRef.current !== null) {
      window.clearTimeout(guideTimerRef.current);
    }
    setShowVisualGuide(true);
    guideTimerRef.current = window.setTimeout(() => {
      guideTimerRef.current = null;
      setShowVisualGuide(false);
    }, 3200);
  };

  const dismissVisualGuide = () => {
    if (guideTimerRef.current !== null) {
      window.clearTimeout(guideTimerRef.current);
      guideTimerRef.current = null;
    }
    setShowVisualGuide(false);
  };

  useEffect(() => {
    if (allPlaced || missionDone) {
      dismissVisualGuide();
      return;
    }
    replayVisualGuide();
    return () => {
      if (guideTimerRef.current !== null) {
        window.clearTimeout(guideTimerRef.current);
      }
    };
  }, [allPlaced, missionDone]);

  // Road waypoint completion progress (0..3: Start -> Madrasa -> Market -> Finish)
  const routeStageIdx = missionDone ? 3 : allPlaced ? (puzzleIdx >= 1 ? 2 : 1) : placedCount >= 2 ? 1 : 0;

  return (
    <div
      onPointerDown={dismissVisualGuide}
      className="relative rounded-3xl overflow-hidden border-2 border-emerald-300 bg-gradient-to-b from-slate-900 via-emerald-950/5 to-white shadow-lg"
    >
      {/* Dignified Header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 text-white flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
            {allPlaced && !missionDone ? 'ഘട്ടം 2 · റൂട്ട് ലോജിക് പസിൽ' : 'ഘട്ടം 1 · പ്രചാരണ വാഹന സജ്ജീകരണം'}
          </p>
          <h2 className="text-sm sm:text-base font-extrabold leading-tight">
            SKSSF പ്രചാരണ വാഹനം
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!allPlaced && !missionDone && (
            <OnboardingHintReplayButton
              dark
              onClick={() => {
                sound.playClick();
                replayVisualGuide();
              }}
            />
          )}
          <button
            type="button"
            onClick={playVoiceIntro}
            aria-label="ശബ്ദത്തിൽ കേൾക്കാം"
            title="ശബ്ദത്തിൽ കേൾക്കാം"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-2xs transition-transform active:scale-95 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          {(placedCount > 0 || mistakes > 0) && (
            <button
              type="button"
              onClick={handleReset}
              aria-label="വീണ്ടും ഒരുക്കാം"
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main 3D Perspective Stage */}
      <div className="relative px-3 sm:px-5 pt-3 pb-4 overflow-hidden bg-slate-50">
        {/* Progress & Shields Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 tabular-nums">
              ഉപകരണങ്ങൾ: {placedCount}/4
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 tabular-nums">
              റൂട്ട് പസിൽ: {missionDone ? '2/2' : allPlaced ? `${puzzleIdx}/2` : '0/2'}
            </span>
          </div>

          {!missionDone && (
            <GameShatterLives
              lives={Math.max(0, maxMistakes - mistakes)}
              maxLives={maxMistakes}
              dark={false}
              compact
            />
          )}
        </div>

        {/* 3D Perspective Scenic Highway + Realistic Shaded SKSSF Jeep */}
        <div
          className={`relative rounded-2xl border-2 border-slate-800 bg-gradient-to-b from-sky-900 via-sky-700/80 to-amber-200/80 overflow-hidden flex items-end justify-center select-none transition-all shadow-inner ${
            isFullscreen ? 'min-h-[340px] sm:min-h-[410px]' : 'min-h-[265px] sm:min-h-[305px]'
          }`}
          style={{ perspective: '680px' }}
        >
          {/* Warm Horizon Sun Glow */}
          <div
            className="absolute top-6 right-12 w-24 h-24 rounded-full pointer-events-none opacity-65 blur-xl"
            style={{ background: 'radial-gradient(circle, #FEF08A 0%, rgba(251,191,36,0) 70%)' }}
          />

          {/* Parallax Distant Kerala Horizon: Hills, Mosque Minarets & Coconut Palms */}
          <motion.svg
            animate={{ x: [0, -180] }}
            transition={{
              duration: missionDone ? 3.0 : allPlaced ? 5.2 : 9.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            viewBox="0 0 1080 220"
            className="absolute left-0 bottom-[74px] sm:bottom-[86px] w-[145%] h-40 pointer-events-none"
            aria-hidden="true"
          >
            <path
              d="M0 220 Q160 135 340 180 Q540 115 740 175 Q920 125 1080 180 L1080 220 Z"
              fill="#065F46"
              opacity="0.45"
            />
            <path
              d="M0 220 Q220 165 440 198 Q680 155 1080 200 L1080 220 Z"
              fill="#047857"
              opacity="0.7"
            />
            {/* Distant Mosque Silhouette */}
            <g transform="translate(110, 108)" opacity="0.9">
              <rect x="20" y="42" width="66" height="58" rx="3" fill="#064E3B" />
              <path d="M24 42 Q53 6 82 42 Z" fill="#022C22" />
              <rect x="8" y="20" width="10" height="80" fill="#064E3B" />
              <path d="M8 20 Q13 8 18 20 Z" fill="#022C22" />
              <rect x="88" y="20" width="10" height="80" fill="#064E3B" />
              <path d="M88 20 Q93 8 98 20 Z" fill="#022C22" />
              <path d="M44 100 L44 74 Q53 62 62 74 L62 100 Z" fill="#FDE68A" opacity="0.75" />
            </g>
            {/* Passing Roadside Palms */}
            {[360, 580, 820].map((px) => (
              <g key={px} transform={`translate(${px}, 96)`} opacity="0.88">
                <path d="M35 124 Q43 72 47 30" stroke="#451A03" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M47 30 Q18 18 4 38" stroke="#14532D" strokeWidth="5.5" fill="none" strokeLinecap="round" />
                <path d="M47 30 Q74 16 90 36" stroke="#14532D" strokeWidth="5.5" fill="none" strokeLinecap="round" />
                <path d="M47 30 Q26 4 10 14" stroke="#166534" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                <path d="M47 30 Q68 2 84 14" stroke="#166534" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              </g>
            ))}
          </motion.svg>

          {/* Unmistakable Starting Flag (Left) & Destination Finish Flag (Right) Beacons */}
          <div className="pointer-events-none absolute top-2.5 left-2.5 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 text-[10px] sm:text-[11px] font-black shadow-[0_0_12px_rgba(16,185,129,0.55)]">
            <span aria-hidden="true">🚩</span>
            <span>തുടക്കം</span>
          </div>
          <div
            className={`pointer-events-none absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full border-2 text-[10px] sm:text-[11px] font-black transition-all ${
              missionDone
                ? 'bg-amber-400 border-white text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.9)] scale-105'
                : 'bg-slate-950/90 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.55)]'
            }`}
          >
            <span aria-hidden="true">🏁</span>
            <span>{missionDone ? 'ലക്ഷ്യം നേടി!' : 'ലക്ഷ്യം'}</span>
          </div>

          {/* 3D Tilted Perspective High-Contrast Asphalt Highway Deck */}
          <div
            className="absolute inset-x-0 bottom-0 h-[96px] sm:h-[108px] overflow-hidden border-t-4 border-emerald-400"
            style={{
              background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 42%, #0F172A 100%)',
              boxShadow:
                'inset 0 10px 18px rgba(0,0,0,0.5), 0 -2px 14px rgba(16,185,129,0.45)',
            }}
          >
            {/* Glowing Emerald Shoulder Beacons along top edge */}
            <motion.div
              animate={{ x: [0, -64] }}
              transition={{
                duration: missionDone ? 0.34 : allPlaced ? 0.55 : 1.0,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="flex items-center gap-12 pt-1 px-2 w-[160%]"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-1.5 rounded-xs bg-emerald-300 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                />
              ))}
            </motion.div>

            {/* Receding High-Contrast Luminous Gold Asphalt Lane Stripes */}
            <motion.div
              animate={{ x: [0, -88] }}
              transition={{
                duration: missionDone ? 0.28 : allPlaced ? 0.48 : 0.95,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="flex items-center gap-10 pt-5 sm:pt-6 px-4 w-[180%]"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-2 rounded-xs bg-amber-300 shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.85)]"
                  style={{ transform: 'skewX(-28deg)' }}
                />
              ))}
            </motion.div>

            {/* High-Contrast Illuminated Road Route & Landmark Waypoints Strip */}
            <div className="absolute inset-x-2 bottom-1.5 z-20 rounded-xl bg-slate-950/88 border border-emerald-400/70 px-2.5 py-1 flex items-center justify-between gap-1 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              {[
                { idx: 0, icon: '🚩', label: 'തുടക്കം' },
                { idx: 1, icon: '🕌', label: 'മദ്രസ' },
                { idx: 2, icon: '🏪', label: 'മാർക്കറ്റ്' },
                { idx: 3, icon: '🏁', label: 'ലക്ഷ്യം' },
              ].map((wp, i, arr) => {
                const reached = routeStageIdx >= wp.idx;
                const active = routeStageIdx === wp.idx;
                return (
                  <React.Fragment key={wp.label}>
                    <div
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black whitespace-nowrap transition-all ${
                        active
                          ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.85)]'
                          : reached
                          ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/70'
                          : 'text-slate-300'
                      }`}
                    >
                      <span aria-hidden="true">{wp.icon}</span>
                      <span>{wp.label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        aria-hidden="true"
                        className={`flex-1 h-1 rounded-full min-w-[10px] transition-all ${
                          routeStageIdx > wp.idx
                            ? 'bg-gradient-to-r from-emerald-400 to-amber-300 shadow-[0_0_8px_rgba(52,211,153,0.85)]'
                            : 'bg-slate-700'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* 3-Second Pure-Geometric Visual Onboarding Overlay (Zero Human/Hand Figures) */}
          <GeometricOnboardingOverlay
            visible={showVisualGuide && !allPlaced && !missionDone && !failed}
            variant="vehicle"
            cueLabel="താഴെ നിന്ന് തൊട്ട് മുകളിൽ വയ്ക്കാം"
          />

          {/* Realistic 3D-Shaded SKSSF Campaign Vehicle */}
          <div
            className={`relative z-10 mb-5 sm:mb-6 ${
              isFullscreen
                ? 'w-[350px] sm:w-[530px] h-[235px] sm:h-[290px]'
                : 'w-[315px] sm:w-[455px] h-[215px] sm:h-[250px]'
            }`}
          >
            <svg
              viewBox="0 0 460 235"
              className="w-full h-full drop-shadow-[0_14px_18px_rgba(2,6,23,0.48)]"
              aria-label="SKSSF പ്രചാരണ വാഹനം"
            >
              <defs>
                <linearGradient id={bodyGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="55%" stopColor="#F1F5F9" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
                <linearGradient id={glassGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="48%" stopColor="#1E3A5F" />
                  <stop offset="52%" stopColor="#38BDF8" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
                <linearGradient id={roadGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
                </linearGradient>
                <linearGradient id={flagWaveGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#000000" stopOpacity="0" />
                  <stop offset="30%" stopColor="#000000" stopOpacity="0.18" />
                  <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.25" />
                  <stop offset="80%" stopColor="#000000" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Ground Contact Shadow (gives real 3D planted weight on asphalt) */}
              <ellipse cx="230" cy="216" rx="175" ry="13" fill="#020617" opacity="0.48" />

              {/* Headlight Projection Cone */}
              {(allPlaced || missionDone) && (
                <polygon points="402,140 460,115 460,185 402,164" fill={`url(#${roadGradId})`} />
              )}

              {/* Heavy-Duty Metallic Roof Rack */}
              <rect x="86" y="74" width="184" height="7" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1" />
              <rect x="110" y="79" width="6" height="11" fill="#334155" />
              <rect x="176" y="79" width="6" height="11" fill="#334155" />
              <rect x="242" y="79" width="6" height="11" fill="#334155" />

              {/* MODULE 1: REALISTIC 3D SHADED DUAL PA HORN LOUDSPEAKERS */}
              {placed.speaker && (
                <g>
                  <rect x="150" y="69" width="58" height="7" rx="2" fill="#0F172A" />
                  <rect x="174" y="52" width="10" height="19" rx="2" fill="#475569" />
                  {/* Forward Horn */}
                  <polygon
                    points="182,48 232,33 232,69 182,59"
                    fill="#F8FAFC"
                    stroke="#0F766E"
                    strokeWidth="2"
                  />
                  <polygon points="182,54 232,51 232,69 182,59" fill="#CBD5E1" opacity="0.65" />
                  <ellipse cx="232" cy="51" rx="5" ry="18" fill="#0F172A" stroke="#0F766E" strokeWidth="2" />
                  <ellipse cx="232" cy="51" rx="2.2" ry="6.5" fill="#F59E0B" />
                  {/* Rear Horn */}
                  <polygon
                    points="174,48 128,36 128,67 174,59"
                    fill="#E2E8F0"
                    stroke="#0F766E"
                    strokeWidth="2"
                  />
                  <ellipse cx="128" cy="51.5" rx="4.5" ry="15" fill="#1E293B" stroke="#0F766E" strokeWidth="1.8" />
                  <rect x="170" y="46" width="18" height="14" rx="3" fill="#047857" stroke="#022C22" strokeWidth="1.5" />
                  {/* Animated Acoustic Pulse Rings */}
                  {(allPlaced || missionDone) && (
                    <motion.g
                      stroke="#FBBF24"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      animate={{ opacity: [0.35, 1, 0.35], x: [0, 5, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                    >
                      <path d="M240 43 Q248 51 240 59" />
                      <path d="M248 37 Q259 51 248 65" opacity="0.7" />
                      <path d="M256 32 Q269 51 256 70" opacity="0.45" />
                    </motion.g>
                  )}
                </g>
              )}

              {/* Realistic Sculpted Jeep / Utility Van Body */}
              <path
                d="M66 178 L66 98 Q66 86 80 86 L264 86 Q282 86 296 104 L322 128 L392 134 Q408 136 408 152 L408 178 Q408 190 394 190 L80 190 Q66 190 66 178 Z"
                fill={`url(#${bodyGradId})`}
                stroke="#0F172A"
                strokeWidth="3.5"
              />
              {/* 3D Side Body Character Crease & Metallic Underbody */}
              <path d="M72 152 L404 152" stroke="#94A3B8" strokeWidth="1.2" />
              <path d="M68 166 L406 166 L406 178 Q406 188 394 188 L80 188 Q68 188 68 178 Z" fill="#047857" />
              <rect x="68" y="158" width="338" height="8" fill="#0284C7" />
              {/* Front Steel Bullbar & Bumper */}
              <rect x="404" y="164" width="12" height="18" rx="4" fill="#1E293B" />
              <rect x="58" y="164" width="10" height="18" rx="3" fill="#1E293B" />

              {/* Tinted 3D Glass Windows with Sky Specular Glare */}
              <rect x="84" y="97" width="70" height="36" rx="5" fill={`url(#${glassGradId})`} stroke="#334155" strokeWidth="2" />
              <rect x="166" y="97" width="80" height="36" rx="5" fill={`url(#${glassGradId})`} stroke="#334155" strokeWidth="2" />
              <path d="M258 97 L280 97 L308 129 L258 129 Z" fill={`url(#${glassGradId})`} stroke="#334155" strokeWidth="2" />
              {/* Side Mirror */}
              <rect x="292" y="124" width="12" height="9" rx="2.5" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />

              {/* MODULE 4: AMPLIFIER & BATTERY CONSOLE VISIBLE THROUGH REAR CABIN */}
              {placed.amp && (
                <g>
                  <rect x="92" y="106" width="52" height="22" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                  <circle cx="103" cy="117" r="4" fill="#10B981" />
                  <rect x="112" y="112" width="26" height="4" rx="1" fill="#38BDF8" />
                  <rect x="112" y="119" width="18" height="3" rx="1" fill="#FBBF24" />
                </g>
              )}

              {/* LED Headlight & Tail Light */}
              <rect x="394" y="140" width="14" height="15" rx="3" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.8" />
              <rect x="64" y="140" width="8" height="18" rx="2" fill="#EF4444" />

              {/* Chrome Upright Flagpole Welded to Front Fender */}
              <rect x="376" y="130" width="16" height="7" rx="2" fill="#1E293B" />
              <line x1="384" y1="132" x2="384" y2="20" stroke="#E2E8F0" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="384" y1="132" x2="384" y2="20" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="384" cy="17" r="5" fill="#F59E0B" stroke="#92400E" strokeWidth="1.5" />

              {/* MODULE 2: CUSTOM REALISTIC WAVING SKSSF CLOTH FLAG (Hoist on right pole, streaming left in wind) */}
              {placed.flag && (
                <g transform="translate(284, 18)">
                  <defs>
                    <clipPath id={`${flagWaveGradId}-clip`}>
                      <path d="M 98,2 C 74,-1.5 48,4.2 22,0.2 C 11,-1.6 4,0.6 0,2.4 L 0,58.4 C 4,56.6 11,54.4 22,56.2 C 48,60.2 74,54.5 98,58 Z" />
                    </clipPath>
                  </defs>
                  <motion.g
                    animate={{
                      skewY: missionDone ? [-3.4, 3.6, -2.5, 3.1, -3.4] : [-1.8, 2.2, -1.5, 1.9, -1.8],
                      scaleX: [1, 0.945, 1.015, 0.96, 1],
                    }}
                    transition={{
                      duration: missionDone ? 0.78 : 1.45,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{ transformOrigin: '98px 30px' }}
                  >
                    <g clipPath={`url(#${flagWaveGradId}-clip)`}>
                      {/* Base White Cloth Field */}
                      <rect x="0" y="-4" width="98" height="68" fill="#FFFFFF" />

                      {/* Authentic Mosque Dome & Tall Left Minaret on White Field */}
                      <g
                        transform="translate(10, 6)"
                        fill="none"
                        stroke="#0F172A"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="7" width="3.8" height="23" fill="#FFFFFF" />
                        <line x1="2" y1="14" x2="5.8" y2="14" />
                        <line x1="2" y1="21" x2="5.8" y2="21" />
                        <path d="M 1.4,7 C 1.4,3.8 6.4,3.8 6.4,7 Z" fill="#0F172A" />
                        <line x1="3.9" y1="1.8" x2="3.9" y2="4.4" />
                        <path d="M 8,25.5 C 9,14 19,10.5 21,6.5 C 23,10.5 33,14 34,25.5 Z" fill="#FFFFFF" />
                        <path d="M 21,6.5 L 21,25.5" />
                        <path d="M 21,6.5 C 17.2,13 16,19.2 16,25.5" />
                        <path d="M 21,6.5 C 24.8,13 26,19.2 26,25.5" />
                        <path d="M 10.5,18.2 Q 21,20.8 31.5,18.2" />
                        <line x1="21" y1="2.8" x2="21" y2="6.5" />
                        <path d="M 6.2,25.5 L 35.8,25.5 L 37.2,30.5 L 4.8,30.5 Z" fill="#FFFFFF" />
                      </g>

                      {/* Official Sky-Blue Hoist Canton Sewn Against the Right Pole */}
                      <rect x="60" y="-4" width="38" height="44" fill="#0EA5E9" />

                      {/* Pure Geometric White Crescent (opening toward right hoist pole) & 5-Pointed Star nestled cleanly in opening */}
                      <g transform="translate(79, 20)">
                        <path
                          d="M -4.11,-8.77 A 10.5,10.5 0 1,0 9.59,2.72 A 9.4,9.4 0 1,1 -4.11,-8.77 Z"
                          fill="#FFFFFF"
                        />
                        <polygon
                          points="2.4,-6.9 3.4,-4.0 6.5,-4.0 4.1,-2.1 4.9,0.8 2.4,-0.9 -0.1,0.8 0.7,-2.1 -1.7,-4.0 1.4,-4.0"
                          fill="#FFFFFF"
                        />
                      </g>

                      {/* Bottom Official Green Strip with Bold Noto Serif 'SKSSF' */}
                      <rect x="0" y="40" width="98" height="24" fill="#16A34A" />
                      <text
                        x="49"
                        y="53.5"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="12.5"
                        fontWeight="800"
                        letterSpacing="2.2"
                        fontFamily="'Noto Serif', Georgia, serif"
                      >
                        SKSSF
                      </text>

                      {/* Dynamic Fabric Light & Shadow Ripple Sweeping Across Cloth */}
                      <motion.rect
                        x="-40"
                        y="-4"
                        width="178"
                        height="68"
                        fill={`url(#${flagWaveGradId})`}
                        animate={{ x: [28, -42] }}
                        transition={{ duration: missionDone ? 0.72 : 1.35, repeat: Infinity, ease: 'linear' }}
                      />
                    </g>

                    {/* Subtle Rippled Cloth Outline */}
                    <path
                      d="M 98,2 C 74,-1.5 48,4.2 22,0.2 C 11,-1.6 4,0.6 0,2.4 L 0,58.4 C 4,56.6 11,54.4 22,56.2 C 48,60.2 74,54.5 98,58 Z"
                      fill="none"
                      stroke="#0F172A"
                      strokeWidth="1.25"
                    />
                  </motion.g>
                  {/* Brass Grommet Ties Connecting Flag Cloth to Pole */}
                  <circle cx="99.5" cy="9" r="2.4" fill="#F59E0B" />
                  <circle cx="99.5" cy="51" r="2.4" fill="#F59E0B" />
                </g>
              )}

              {/* Wheel Arches */}
              <path d="M98 190 A36 36 0 0 1 170 190 Z" fill="#0F172A" />
              <path d="M300 190 A36 36 0 0 1 372 190 Z" fill="#0F172A" />

              {/* 3D Shaded Deep-Dish Alloy Wheels */}
              {[134, 336].map((cx) => (
                <g key={cx} transform={`translate(${cx}, 190)`}>
                  <circle cx="0" cy="0" r="29" fill="#0F172A" stroke="#334155" strokeWidth="3.5" />
                  <circle cx="0" cy="0" r="21" fill="#1E293B" />
                  <circle cx="0" cy="0" r="15" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: missionDone ? 0.38 : allPlaced ? 0.65 : 1.1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{ transformOrigin: '0px 0px' }}
                  >
                    <line x1="0" y1="-13" x2="0" y2="13" stroke="#334155" strokeWidth="3" />
                    <line x1="-13" y1="0" x2="13" y2="0" stroke="#334155" strokeWidth="3" />
                    <line x1="-9" y1="-9" x2="9" y2="9" stroke="#475569" strokeWidth="2" />
                    <line x1="9" y1="-9" x2="-9" y2="9" stroke="#475569" strokeWidth="2" />
                  </motion.g>
                  <circle cx="0" cy="0" r="5" fill="#047857" stroke="#FDE68A" strokeWidth="1.2" />
                </g>
              ))}
            </svg>

            {/* PRECISION DROP SLOT 1: ROOF RACK (PA SPEAKER) */}
            {!placed.speaker && (
              <button
                type="button"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = (e.dataTransfer.getData('text/plain') as JeepPartId) || draggingPart;
                  if (dropped) placePart(dropped, 'speaker');
                }}
                onClick={() => handleTapZone('speaker')}
                aria-label="മേൽക്കൂര റാക്ക്"
                className={`absolute left-[27%] top-[14%] w-[26%] h-[18%] rounded-xl border-2 border-dashed flex items-center justify-center text-[10px] font-black tracking-wide transition-all cursor-pointer ${
                  selectedPart
                    ? 'border-amber-400 bg-amber-300/80 text-slate-950 shadow-md ring-2 ring-amber-300/70'
                    : 'border-white/80 bg-slate-900/65 text-white hover:bg-slate-900/80'
                }`}
              >
                മേൽക്കൂര റാക്ക്
              </button>
            )}

            {/* PRECISION DROP SLOT 2: FRONT FLAGPOLE */}
            {!placed.flag && (
              <button
                type="button"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = (e.dataTransfer.getData('text/plain') as JeepPartId) || draggingPart;
                  if (dropped) placePart(dropped, 'flag');
                }}
                onClick={() => handleTapZone('flag')}
                aria-label="കൊടിമരം"
                className={`absolute left-[63%] top-[10%] w-[21%] h-[24%] rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] font-black transition-all cursor-pointer ${
                  selectedPart
                    ? 'border-sky-300 bg-sky-200/85 text-slate-950 shadow-md ring-2 ring-sky-300/70'
                    : 'border-white/80 bg-slate-900/65 text-white hover:bg-slate-900/80'
                }`}
              >
                കൊടിമരം
              </button>
            )}

            {/* PRECISION DROP SLOT 3: SIDE PANEL BANNER */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = (e.dataTransfer.getData('text/plain') as JeepPartId) || draggingPart;
                if (dropped) placePart(dropped, 'sticker');
              }}
              onClick={() => !placed.sticker && handleTapZone('sticker')}
              role={placed.sticker ? undefined : 'button'}
              tabIndex={placed.sticker ? -1 : 0}
              onKeyDown={(e) => !placed.sticker && e.key === 'Enter' && handleTapZone('sticker')}
              aria-label="സൈഡ് പാനൽ"
              className={`absolute left-[38%] top-[56%] w-[34%] h-[16%] rounded-lg flex items-center justify-center transition-all ${
                placed.sticker
                  ? 'pointer-events-none'
                  : selectedPart
                  ? 'border-2 border-dashed border-emerald-500 bg-emerald-200/85 text-slate-950 shadow-md ring-2 ring-emerald-300 cursor-pointer'
                  : 'border-2 border-dashed border-slate-500 bg-white/85 text-slate-800 hover:bg-emerald-50 cursor-pointer'
              }`}
            >
              {placed.sticker ? (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-2 py-0.5 rounded bg-emerald-900 border border-amber-400 text-amber-100 text-[9px] sm:text-[10px] font-black tracking-wide shadow-xs text-center leading-tight"
                >
                  SKSSF · വിജ്ഞാനം · വിനയം · സേവനം
                </motion.div>
              ) : (
                <span className="text-[10px] font-black">സൈഡ് പാനൽ</span>
              )}
            </div>

            {/* PRECISION DROP SLOT 4: REAR CABIN AMPLIFIER & BATTERY */}
            {!placed.amp && (
              <button
                type="button"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = (e.dataTransfer.getData('text/plain') as JeepPartId) || draggingPart;
                  if (dropped) placePart(dropped, 'amp');
                }}
                onClick={() => handleTapZone('amp')}
                aria-label="പിൻഭാഗ കാബിൻ"
                className={`absolute left-[18%] top-[42%] w-[16%] h-[16%] rounded-lg border-2 border-dashed flex items-center justify-center text-[9px] font-black leading-tight text-center transition-all cursor-pointer ${
                  selectedPart
                    ? 'border-amber-400 bg-amber-200/90 text-slate-950 shadow-md ring-2 ring-amber-300'
                    : 'border-amber-300/80 bg-slate-900/75 text-amber-100 hover:bg-slate-900/90'
                }`}
              >
                കാബിൻ
              </button>
            )}
          </div>
        </div>

        {/* Validation Feedback */}
        {wrongMsg && (
          <p className="mt-2.5 text-xs font-extrabold text-amber-950 bg-amber-100 border border-amber-300 rounded-xl px-3 py-2 text-center">
            {wrongMsg}
          </p>
        )}

        {/* Phase 1 Tray / Phase 2 Adult Strategic Route Puzzle / Victory */}
        {failed ? (
          <div className="mt-3">
            <GameDefeatBurstOverlay
              title="ദൗത്യം വീണ്ടും ശ്രമിക്കാം"
              reason="3 തവണ തെറ്റായ തിരഞ്ഞെടുപ്പ് സംഭവിച്ചു — കൃത്യതയോടെ ഒരിക്കൽ കൂടി പൂർത്തിയാക്കാം."
              onRetry={handleReset}
              overlay={false}
            />
          </div>
        ) : !allPlaced ? (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] font-extrabold text-slate-700 text-center">
              താഴെ നിന്ന് ഓരോ ഉപകരണവും തൊട്ട് തിരഞ്ഞെടുത്ത് കൃത്യമായ സ്ഥലത്ത് തൊടുക:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {JEEP_PARTS.map((part) => {
                const isDone = placed[part.id];
                const isSelected = selectedPart === part.id;
                return (
                  <button
                    key={part.id}
                    type="button"
                    draggable={!isDone}
                    onDragStart={(e) => {
                      sound.unlockAudio();
                      setDraggingPart(part.id);
                      setSelectedPart(part.id);
                      e.dataTransfer.setData('text/plain', part.id);
                    }}
                    onClick={() => {
                      sound.unlockAudio();
                      if (isDone) return;
                      sound.playPop();
                      setSelectedPart(isSelected ? null : part.id);
                      setWrongMsg(null);
                    }}
                    disabled={isDone}
                    className={`relative min-h-[44px] py-2.5 px-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60 cursor-default'
                        : isSelected
                        ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-md'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-amber-300">
                        {part.code}
                      </span>
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                    </div>
                    <p className="text-xs font-extrabold mt-1.5 leading-snug">{part.title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : !missionDone && activePuzzle ? (
          <div className="mt-3 rounded-2xl border-2 border-emerald-300 bg-white p-3.5 sm:p-4 space-y-3 shadow-sm">
            <div className="space-y-1">
              <p className="text-[11px] font-black text-emerald-800">{activePuzzle.badge}</p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-relaxed">
                {activePuzzle.question}
              </p>
            </div>
            <div className="space-y-2">
              {activePuzzle.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePuzzleAnswer(opt)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 text-xs font-bold text-slate-900 leading-relaxed transition-colors cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {puzzleFeedback && (
              <p
                className={`text-xs font-extrabold px-3 py-2 rounded-xl border ${
                  puzzleFeedback.ok
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {puzzleFeedback.text}
              </p>
            )}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-900 text-white border-2 border-amber-300 shadow-lg flex flex-wrap items-center justify-between gap-2.5"
            >
              <span className="text-sm font-extrabold text-amber-300 inline-flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> പ്രചാരണ ദൗത്യം വിജയിച്ചു · +50 XP
              </span>
              <div className="flex items-center gap-2">
                {onOpenBadgeStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSuccess();
                      onOpenBadgeStudio('jeep_starter');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Award className="w-4 h-4" /> ബാഡ്ജ്
                  </button>
                )}
                {onProceedNext && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onProceedNext();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 text-xs sm:text-sm font-extrabold shadow-sm active:scale-95 cursor-pointer"
                  >
                    അടുത്തത് →
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. MID-GAME MINI-ACTIVITY: SAMASTHA MADRASA BOARD SETUP (മദ്രസ ബോർഡ് ഒരുക്കാം)
 *    - Authentic Kerala heritage activity appealing to kids AND elders
 * ========================================================================== */

type MadrasaPartId = 'arch_flag' | 'main_board' | 'motto_plaque' | 'notice_board';

const MADRASA_PARTS: {
  id: MadrasaPartId;
  emoji: string;
  title: string;
  hint: string;
  speech: string;
}[] = [
  {
    id: 'arch_flag',
    emoji: '🚩',
    title: 'സമസ്ത പതാക & കമാനം',
    hint: 'മദ്രസയുടെ മുകൾഭാഗത്ത് വെക്കാം',
    speech: 'മനോഹരം! സമസ്തയുടെ ഔദ്യോഗിക പതാക മദ്രസ കമാനത്തിൽ ഉയർന്നു!',
  },
  {
    id: 'main_board',
    emoji: '🏫',
    title: 'മദ്രസ പ്രധാന ബോർഡ്',
    hint: 'നടുവിലുള്ള വലിയ ഫ്രെയിമിൽ വെക്കാം',
    speech: 'കൃത്യം! സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡിന്റെ നാമഫലകം ഭംഗിയായി സ്ഥാപിച്ചു!',
  },
  {
    id: 'motto_plaque',
    emoji: '📖',
    title: '“വിജ്ഞാനം · വിനയം · സേവനം”',
    hint: 'ഇടതുവശത്തെ തൂണിൽ വെക്കാം',
    speech: 'സൂപ്പർ! വിജ്ഞാനം, വിനയം, സേവനം എന്ന ആദർശ ഫലകം സ്ഥാപിച്ചു!',
  },
  {
    id: 'notice_board',
    emoji: '🗓️',
    title: 'ക്ലാസ്സ് & യൂണിറ്റ് അറിയിപ്പ്',
    hint: 'വലതുവശത്തെ ബോർഡിൽ വെക്കാം',
    speech: 'മികച്ച പ്രകടനം! മദ്രസ സമയവിവരവും SKSSF യൂണിറ്റ് അറിയിപ്പ് ബോർഡും തയ്യാറായി!',
  },
];

const MADRASA_DECOYS: { id: string; emoji: string; title: string; reason: string }[] = [
  {
    id: 'decoy_torn',
    emoji: '🗑️',
    title: 'കീറിയ പോസ്റ്റർ',
    reason: 'കീറിയ പോസ്റ്റർ മദ്രസ കവാടത്തിൽ വെക്കാൻ പാടില്ല!',
  },
  {
    id: 'decoy_broken',
    emoji: '🚫',
    title: 'പൊട്ടിയ ബോർഡ്',
    reason: 'പൊട്ടിയ പഴയ ബോർഡ് ഒഴിവാക്കി നല്ല SKIMVB ഭാഗങ്ങൾ തിരഞ്ഞെടുക്കൂ!',
  },
];

export const MadrasaBoardActivity: React.FC<{
  onAwardXp: (amount: number, actionId: string) => void;
  onUnlockBadge?: (badge: string) => void;
  onOpenBadgeStudio?: (presetBadgeId: string) => void;
  onComplete?: () => void;
}> = ({ onAwardXp, onUnlockBadge, onOpenBadgeStudio, onComplete }) => {
  const stagePaused = useGameStagePaused();
  const [placed, setPlaced] = useState<Record<MadrasaPartId, boolean>>({
    arch_flag: false,
    main_board: false,
    motto_plaque: false,
    notice_board: false,
  });
  const [selected, setSelected] = useState<MadrasaPartId | null>(null);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(28);
  const [started, setStarted] = useState(false);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>(
    'താഴെ നിന്ന് ശരിയായ ഭാഗം തിരഞ്ഞെടുത്ത് മുകളിലെ ശരിയായ സ്ഥാനത്ത് വെക്കൂ — തെറ്റായ വസ്തുക്കൾ (🗑️ 🚫) തൊടരുത്!'
  );
  const [feedbackError, setFeedbackError] = useState(false);
  const [doneNotified, setDoneNotified] = useState(false);

  const count = Object.values(placed).filter(Boolean).length;
  const allDone = count === 4;
  const failed = (hearts <= 0 || Boolean(failReason)) && !allDone;

  const resetBoard = () => {
    sound.playClick();
    setPlaced({ arch_flag: false, main_board: false, motto_plaque: false, notice_board: false });
    setSelected(null);
    setHearts(3);
    setTimeLeft(28);
    setStarted(false);
    setFailReason(null);
    setFeedback('താഴെ നിന്ന് ശരിയായ ഭാഗം തിരഞ്ഞെടുത്ത് മുകളിലെ ശരിയായ സ്ഥാനത്ത് വെക്കൂ — തെറ്റായ വസ്തുക്കൾ (🗑️ 🚫) തൊടരുത്!');
    setFeedbackError(false);
    setDoneNotified(false);
  };

  useEffect(() => {
    if (!started || allDone || failed || stagePaused) return;
    const id = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setTimeLeft((t) => {
        if (t <= 1) {
          sound.playError();
          setFailReason('⏱️ മദ്രസ ബെൽ അടിച്ചു! 28 സെക്കൻഡിനുള്ളിൽ 4 ഭാഗങ്ങളും ഒരുക്കണം — സാരമില്ല, ഒന്നുകൂടി ശ്രമിക്കാം!');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, allDone, failed, stagePaused]);

  const loseShield = (reasonMsg: string) => {
    sound.playError();
    setFeedback(reasonMsg);
    setFeedbackError(true);
    setHearts((prev) => {
      const next = Math.max(0, prev - 1);
      if (next <= 0) {
        setFailReason('💥 3 തവണ തെറ്റിച്ചതിനാൽ കവചങ്ങൾ തകർന്നു — വീണ്ടും ശ്രമിക്കാം!');
      }
      return next;
    });
  };

  const handleDecoyTap = (decoy: (typeof MADRASA_DECOYS)[number]) => {
    sound.unlockAudio();
    if (failed || allDone) return;
    if (!started) setStarted(true);
    loseShield(`💥 അയ്യോ! ${decoy.reason}`);
  };

  const snap = (slotId: MadrasaPartId, droppedId?: MadrasaPartId) => {
    sound.unlockAudio();
    if (placed[slotId] || failed || allDone) return;
    if (!started) setStarted(true);
    const activeId = droppedId || selected;
    if (!activeId) {
      sound.playClick();
      setFeedback('👇 ആദ്യം താഴെയുള്ള ട്രേയിൽ നിന്ന് ശരിയായ ഭാഗം തിരഞ്ഞെടുക്കൂ, ശേഷം ഇവിടെ തൊടൂ!');
      setFeedbackError(false);
      return;
    }
    if (activeId !== slotId) {
      const pickedItem = MADRASA_PARTS.find((p) => p.id === activeId);
      loseShield(
        `💥 തെറ്റായ സ്ഥാനം! “${pickedItem?.title || ''}” അവിടെയല്ല വെക്കേണ്ടത് (${pickedItem?.hint || ''}).`
      );
      return;
    }
    const next = { ...placed, [slotId]: true };
    setPlaced(next);
    setSelected(null);
    setFeedbackError(false);
    const total = Object.values(next).filter(Boolean).length;
    sound.playSuccess(total);
    onAwardXp(10, `madrasa_board_${slotId}`);
    const item = MADRASA_PARTS.find((p) => p.id === slotId);
    if (total === 4) {
      setFeedback('🎉 മാഷാ അല്ലാഹ്! സമസ്ത മദ്രസ ബോർഡ് (SKIMVB) മനോഹരമായി ഒരുങ്ങി!');
      if (!doneNotified) {
        setDoneNotified(true);
        sound.playHoist();
        onAwardXp(30, 'madrasa_board_complete');
        onUnlockBadge?.('ചരിത്രാന്വേഷി');
        onComplete?.();
        narrator.speak(
          'അടിപൊളി! നമ്മുടെ സമസ്ത മദ്രസ ബോർഡ് മനോഹരമായി ഒരുങ്ങി! 11,000-ലധികം മദ്രസകളുടെ വെളിച്ചം പകരുന്ന ഈ പൈതൃകമാണ് നമ്മുടെ കരുത്ത്.',
          '🏫 മദ്രസ ബോർഡ് തയ്യാർ!'
        );
      }
    } else if (item) {
      setFeedback(`✅ ${item.speech}`);
      narrator.speak(item.speech, `${item.emoji} ${item.title}`);
    }
  };

  return (
    <GameFullscreenShell title="🏫 സമസ്ത മദ്രസ ബോർഡ് (SKIMVB)" isGameDone={allDone}>
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3.5 sm:p-4 space-y-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-50 border border-emerald-200 rounded-lg px-1.5 py-0.5 shrink-0">
            <img
              src={OFFICIAL_WING_LOGOS.skimvb.src}
              alt={OFFICIAL_WING_LOGOS.skimvb.label}
              className="h-6 w-auto object-contain"
            />
            <img
              src={OFFICIAL_WING_LOGOS.skjmcc.src}
              alt={OFFICIAL_WING_LOGOS.skjmcc.label}
              className="h-6 w-auto object-contain"
            />
            <img
              src={OFFICIAL_WING_LOGOS.snec.src}
              alt={OFFICIAL_WING_LOGOS.snec.label}
              className="h-6 w-auto object-contain"
            />
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 text-xs font-extrabold tabular-nums">
            🏫 {count}/4
          </span>
          <span
            className={`px-2 py-1 rounded-lg text-xs font-extrabold tabular-nums ${
              timeLeft <= 7 && started && !allDone
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            ⏱️ {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <GameShatterLives lives={hearts} maxLives={3} dark={false} compact />
          {(started || count > 0 || allDone || failed) && (
            <button
              type="button"
              onClick={resetBoard}
              aria-label="വീണ്ടും കളിക്കാം"
              title="വീണ്ടും കളിക്കാം"
              className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              narrator.speak(
                'നമ്മുടെ സമസ്ത മദ്രസയുടെ ബോർഡ് ഒരുക്കാം! താഴെ നിന്ന് ശരിയായ ഭാഗം തിരഞ്ഞെടുത്ത് ശരിയായ സ്ഥലത്ത് വെക്കൂ. കീറിയ പോസ്റ്ററോ പൊട്ടിയ ബോർഡോ തൊടരുത്!',
                '🏫 മദ്രസ ബോർഡ് ഒരുക്കാം'
              );
            }}
            aria-label="കേൾക്കാം"
            className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 flex items-center justify-center"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Madrasa Entrance Arch Visual */}
      <div className="relative rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-sky-100 via-amber-50 to-emerald-100 p-3.5 sm:p-4 space-y-2.5">
        <div className="flex justify-center">
          <button
            type="button"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              snap('arch_flag');
            }}
            onClick={() => snap('arch_flag')}
            aria-label="സമസ്ത പതാക"
            className={`relative px-5 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
              placed.arch_flag
                ? 'bg-emerald-900 text-amber-200 border-amber-400 shadow'
                : selected === 'arch_flag'
                ? 'border-dashed border-amber-500 bg-amber-100 text-amber-950 ring-4 ring-amber-200'
                : 'border-dashed border-emerald-400 bg-white/85 hover:bg-amber-50 text-slate-700'
            }`}
          >
            {placed.arch_flag ? (
              <>
                <img
                  src={OFFICIAL_FLAG_ASSETS.samastha}
                  alt="സമസ്ത പതാക"
                  referrerPolicy="no-referrer"
                  className="w-8 h-7 object-contain rounded bg-white p-0.5"
                />
                <span className="text-xs font-extrabold">🌙 1926</span>
                <img
                  src={OFFICIAL_FLAG_ASSETS.skssf}
                  alt="SKSSF പതാക"
                  referrerPolicy="no-referrer"
                  className="w-8 h-7 object-contain rounded bg-white p-0.5"
                />
              </>
            ) : (
              <span className="text-xs font-extrabold text-slate-600">⬆️ കവാടത്തിന് മുകളിൽ</span>
            )}
          </button>
        </div>

        {/* Main Header Signboard Slot */}
        <button
          type="button"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            snap('main_board');
          }}
          onClick={() => snap('main_board')}
          aria-label="മദ്രസ ബോർഡ്"
          className={`relative w-full py-3.5 px-4 rounded-2xl border-2 transition-all text-center ${
            placed.main_board
              ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border-amber-300 shadow-md'
              : selected === 'main_board'
              ? 'border-dashed border-amber-500 bg-amber-100/90 text-amber-950 ring-4 ring-amber-200'
              : 'border-dashed border-emerald-400 bg-white/85 hover:bg-amber-50 text-slate-700'
          }`}
        >
          {placed.main_board ? (
            <p className="text-sm font-extrabold text-amber-200">
              🏫 SKIMVB · 1951 (11,000+ മദ്രസകൾ)
            </p>
          ) : (
            <span className="text-xs font-extrabold text-slate-600">📌 വലിയ നടുവിലെ ബോർഡ് സ്ഥാനം</span>
          )}
        </button>

        {/* Left & Right Entrance Plaques */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              snap('motto_plaque');
            }}
            onClick={() => snap('motto_plaque')}
            aria-label="ആദർശ ഫലകം"
            className={`relative p-3 rounded-xl border-2 transition-all text-center ${
              placed.motto_plaque
                ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                : selected === 'motto_plaque'
                ? 'border-dashed border-amber-500 bg-amber-100 text-amber-950 ring-4 ring-amber-200'
                : 'border-dashed border-emerald-400 bg-white/85 hover:bg-amber-50 text-slate-700'
            }`}
          >
            {placed.motto_plaque ? (
              <p className="text-xs font-extrabold">📖 വിജ്ഞാനം · വിനയം ✅</p>
            ) : (
              <span className="text-[11px] font-extrabold text-slate-600">⬅️ ഇടതുവശത്തെ ഫലകം</span>
            )}
          </button>

          <button
            type="button"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              snap('notice_board');
            }}
            onClick={() => snap('notice_board')}
            aria-label="അറിയിപ്പ് ബോർഡ്"
            className={`relative p-3 rounded-xl border-2 transition-all text-center ${
              placed.notice_board
                ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-xs'
                : selected === 'notice_board'
                ? 'border-dashed border-amber-500 bg-amber-100 text-amber-950 ring-4 ring-amber-200'
                : 'border-dashed border-emerald-400 bg-white/85 hover:bg-amber-50 text-slate-700'
            }`}
          >
            {placed.notice_board ? (
              <p className="text-xs font-extrabold">🗓️ ക്ലാസ്സ് അറിയിപ്പ് ✅</p>
            ) : (
              <span className="text-[11px] font-extrabold text-slate-600">➡️ വലതുവശത്തെ ബോർഡ്</span>
            )}
          </button>
        </div>
      </div>

      {/* Live Feedback Strip */}
      <div
        className={`px-3 py-2 rounded-xl text-xs font-bold text-center border ${
          feedbackError
            ? 'bg-rose-50 border-rose-300 text-rose-800'
            : allDone
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        {feedback}
      </div>

      {failed ? (
        <GameDefeatBurstOverlay
          title="മദ്രസ ബോർഡ് ഒരുക്കൽ പരാജയപ്പെട്ടു!"
          reason={failReason || '3 തവണ തെറ്റിച്ചതിനാൽ കവചങ്ങൾ തകർന്നു — വീണ്ടും ശ്രമിക്കാം!'}
          scoreText={`🏫 ${count}/4`}
          onRetry={resetBoard}
          overlay={false}
        />
      ) : !allDone ? (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { kind: 'real' as const, item: MADRASA_PARTS[1] },
              { kind: 'decoy' as const, decoy: MADRASA_DECOYS[0] },
              { kind: 'real' as const, item: MADRASA_PARTS[0] },
              { kind: 'real' as const, item: MADRASA_PARTS[3] },
              { kind: 'decoy' as const, decoy: MADRASA_DECOYS[1] },
              { kind: 'real' as const, item: MADRASA_PARTS[2] },
            ].map((entry) => {
              if (entry.kind === 'decoy') {
                return (
                  <button
                    key={entry.decoy.id}
                    type="button"
                    onClick={() => handleDecoyTap(entry.decoy)}
                    className="py-2 px-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-rose-400 hover:bg-rose-50 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
                  >
                    <span className="text-xl">{entry.decoy.emoji}</span>
                    <span className="text-[10px] font-extrabold text-slate-700 leading-tight text-center">
                      {entry.decoy.title}
                    </span>
                  </button>
                );
              }
              const item = entry.item;
              const done = placed[item.id];
              const isPicked = selected === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={done}
                  draggable={!done}
                  onDragStart={() => {
                    sound.unlockAudio();
                    if (!started) setStarted(true);
                    setSelected(item.id);
                  }}
                  onClick={() => {
                    sound.playClick();
                    if (!started) setStarted(true);
                    setSelected(item.id);
                    setFeedback(`🎯 തിരഞ്ഞെടുത്തത്: ${item.emoji} ${item.title} — ശരിയായ സ്ഥാനത്ത് തൊടൂ!`);
                    setFeedbackError(false);
                  }}
                  aria-label={item.title}
                  className={`py-2 px-1.5 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${
                    done
                      ? 'bg-emerald-50 border-emerald-300 opacity-55'
                      : isPicked
                      ? 'bg-amber-300 border-amber-600 ring-2 ring-amber-200 cursor-grab'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-400 cursor-grab'
                  }`}
                >
                  <span className="text-xl">{done ? '✅' : item.emoji}</span>
                  <span className="text-[10px] font-extrabold text-slate-800 leading-tight text-center">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-sm font-extrabold text-emerald-950">🎉 +70 XP · മദ്രസ ബോർഡ് തയ്യാർ!</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetBoard}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>വീണ്ടും കളിക്കാം</span>
            </button>
            {onOpenBadgeStudio && (
              <button
                type="button"
                onClick={() => onOpenBadgeStudio('madrasa_guardian')}
                aria-label="ഫോട്ടോ ബാഡ്ജ്"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold cursor-pointer"
              >
                <Award className="w-4 h-4" /> 📷 ബാഡ്ജ്
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </GameFullscreenShell>
  );
};

/* ============================================================================
 * 3. LEVEL 4 MINI-ACTIVITY: VIQAYA & ALERT EMERGENCY RESCUE DRIVING GAME
 * ========================================================================== */
interface ViqayaMissionDef {
  id: number;
  title: string;
  targetName: string;
  needIcon: string;
  needLabel: string;
  hazardIcon: string;
  hazardLabel: string;
  roadBg: string;
  goalCount: number;
  speech: string;
}

const VIQAYA_MISSIONS: ViqayaMissionDef[] = [
  {
    id: 1,
    title: 'ദൗത്യം 1 · പ്രളയ രക്ഷാദൗത്യം',
    targetName: 'ദുരിതാശ്വാസ ക്യാമ്പ്',
    needIcon: 'കിറ്റ്',
    needLabel: 'ദുരിതാശ്വാസ കിറ്റ് ബോക്സ്',
    hazardIcon: 'തടസ്സം',
    hazardLabel: 'കുഴി / ഓയിൽ / വെള്ളമൊഴുക്ക്',
    roadBg: 'from-slate-900 via-slate-800 to-slate-900',
    goalCount: 3,
    speech: 'പ്രളയബാധിതർക്കുള്ള ദുരിതാശ്വാസ കിറ്റുകൾ സുരക്ഷിതമായി ക്യാമ്പിൽ എത്തിച്ചു.',
  },
  {
    id: 2,
    title: 'ദൗത്യം 2 · അടിയന്തര ആശുപത്രി എക്സ്പ്രസ്',
    targetName: 'സഹചാരി / മെഡിക്കൽ കോളേജ്',
    needIcon: 'രക്തം',
    needLabel: 'രക്തം & മരുന്ന് കൂളർ ബോക്സ്',
    hazardIcon: 'തടസ്സം',
    hazardLabel: 'ബാരിക്കേഡ് / ഓയിൽ / കുഴി',
    roadBg: 'from-slate-950 via-slate-900 to-slate-950',
    goalCount: 3,
    speech: 'അടിയന്തര രക്തവും മരുന്നുകളും കൂളർ ബോക്സിൽ കൃത്യസമയത്ത് ആശുപത്രിയിൽ എത്തിച്ചു.',
  },
  {
    id: 3,
    title: 'ദൗത്യം 3 · ഹജ്ജ് & പ്രവാസി വിഖായ',
    targetName: 'ഹജ്ജ് ക്യാമ്പ് & തീർത്ഥാടകർ',
    needIcon: 'കുടിവെള്ളം',
    needLabel: 'കുടിവെള്ള ബോട്ടിൽ പാക്ക്',
    hazardIcon: 'തടസ്സം',
    hazardLabel: 'ബാരിക്കേഡ് / റോഡ് കുഴി',
    roadBg: 'from-emerald-950 via-slate-900 to-emerald-950',
    goalCount: 3,
    speech: 'ഹജ്ജ് തീർത്ഥാടകർക്കുള്ള കുടിവെള്ള പാക്കുകളും വിഖായ സേവനവും ഭംഗിയായി പൂർത്തിയാക്കി.',
  },
];

type HazardVariant = 'pothole' | 'oil' | 'barricade';
type AidVariant = 'relief_box' | 'blood_box' | 'water_pack';

interface RoadObj {
  uid: number;
  lane: 0 | 1 | 2;
  y: number; // -10 to 105
  kind: 'aid' | 'hazard';
  aidVariant?: AidVariant;
  hazardVariant?: HazardVariant;
}

const AidCrateGraphic: React.FC<{ variant: AidVariant }> = ({ variant }) => {
  if (variant === 'blood_box') {
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 64 56" className="w-12 h-11 drop-shadow-[0_6px_8px_rgba(0,0,0,0.55)]">
          {/* 3D Insulated Medical Blood Cooler Box */}
          <path d="M10 18 L54 18 L58 50 L6 50 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.2" />
          <path d="M10 18 L16 10 L48 10 L54 18 Z" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
          <path d="M23 10 L23 5 L41 5 L41 10" fill="none" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" />
          <rect x="8" y="18" width="48" height="6" fill="#DC2626" />
          {/* Red Blood Drop + Cross Emblem */}
          <rect x="28" y="28" width="8" height="16" rx="1.5" fill="#DC2626" />
          <rect x="24" y="32" width="16" height="8" rx="1.5" fill="#DC2626" />
          <circle cx="48" cy="36" r="4.5" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
          <path d="M48 33 Q51 37 48 39 Q45 37 48 33 Z" fill="#DC2626" />
        </svg>
        <span className="-mt-0.5 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black leading-snug shadow-xs">
          രക്തം · മരുന്ന്
        </span>
      </div>
    );
  }
  if (variant === 'water_pack') {
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 64 56" className="w-12 h-11 drop-shadow-[0_6px_8px_rgba(0,0,0,0.55)]">
          {/* 3D Drinking Water Bottle Pack Tray */}
          <rect x="8" y="26" width="48" height="24" rx="5" fill="#0369A1" stroke="#E0F2FE" strokeWidth="2" />
          {/* Three Sealed Water Bottles */}
          {[18, 32, 46].map((bx) => (
            <g key={bx}>
              <rect x={bx - 5} y="12" width="10" height="22" rx="3" fill="#7DD3FC" stroke="#0C4A6E" strokeWidth="1.6" />
              <rect x={bx - 3} y="7" width="6" height="5" rx="1" fill="#0284C7" />
              <rect x={bx - 4.5} y="20" width="9" height="5" fill="#FFFFFF" opacity="0.85" />
            </g>
          ))}
        </svg>
        <span className="-mt-0.5 px-1.5 py-0.5 rounded bg-sky-600 text-white text-[10px] font-black leading-snug shadow-xs">
          കുടിവെള്ളം
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 64 56" className="w-12 h-11 drop-shadow-[0_6px_8px_rgba(0,0,0,0.55)]">
        {/* 3D Relief Food & Aid Supply Carton */}
        <polygon points="8,20 32,10 56,20 32,30" fill="#FDE68A" stroke="#78350F" strokeWidth="2" />
        <polygon points="8,20 32,30 32,52 8,42" fill="#D97706" stroke="#78350F" strokeWidth="2" />
        <polygon points="56,20 32,30 32,52 56,42" fill="#B45309" stroke="#78350F" strokeWidth="2" />
        {/* Emerald Relief Ribbon + White Medical Strip */}
        <polygon points="19,15 24,13 48,23 43,25" fill="#059669" />
        <rect x="14" y="32" width="12" height="10" rx="2" fill="#FFFFFF" />
        <rect x="18.5" y="34" width="3" height="6" fill="#059669" />
        <rect x="17" y="35.5" width="6" height="3" fill="#059669" />
      </svg>
      <span className="-mt-0.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black leading-snug shadow-xs">
        സഹായ കിറ്റ്
      </span>
    </div>
  );
};

const RoadHazardGraphic: React.FC<{ variant: HazardVariant }> = ({ variant }) => {
  if (variant === 'pothole') {
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 72 48" className="w-14 h-10 drop-shadow-[0_4px_6px_rgba(0,0,0,0.65)]">
          {/* Cracked 3D Road Pothole */}
          <ellipse cx="36" cy="26" rx="28" ry="15" fill="#475569" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5 3" />
          <ellipse cx="36" cy="27" rx="22" ry="11" fill="#0F172A" />
          <ellipse cx="36" cy="30" rx="14" ry="6" fill="#020617" />
          <path d="M12 24 L20 20 M56 22 L64 26 M26 14 L32 18" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="-mt-0.5 px-1.5 py-0.5 rounded bg-slate-950/90 border border-amber-400 text-amber-300 text-[10px] font-black leading-snug">
          റോഡ് കുഴി
        </span>
      </div>
    );
  }
  if (variant === 'oil') {
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 72 48" className="w-14 h-10 drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)]">
          {/* Glossy Iridescent Oil Spill */}
          <path
            d="M12 28 Q10 14 28 14 Q44 10 58 20 Q66 32 48 38 Q26 42 12 28 Z"
            fill="#020617"
            stroke="#6366F1"
            strokeWidth="2"
          />
          <ellipse cx="30" cy="23" rx="11" ry="4.5" fill="#38BDF8" opacity="0.35" />
          <ellipse cx="44" cy="29" rx="8" ry="3.5" fill="#A855F7" opacity="0.4" />
        </svg>
        <span className="-mt-0.5 px-1.5 py-0.5 rounded bg-slate-950/90 border border-indigo-400 text-indigo-200 text-[10px] font-black leading-snug">
          ഓയിൽ ചോർച്ച
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 76 52" className="w-14 h-10 drop-shadow-[0_6px_8px_rgba(0,0,0,0.65)]">
        {/* 3D Highway Construction Barricade with Twin Amber Beacons */}
        <rect x="10" y="34" width="6" height="14" rx="1" fill="#334155" />
        <rect x="60" y="34" width="6" height="14" rx="1" fill="#334155" />
        <rect x="6" y="14" width="64" height="20" rx="3" fill="#F97316" stroke="#0F172A" strokeWidth="2" />
        <polygon points="14,14 24,14 16,34 6,34" fill="#FFFFFF" />
        <polygon points="34,14 44,14 36,34 26,34" fill="#FFFFFF" />
        <polygon points="54,14 64,14 56,34 46,34" fill="#FFFFFF" />
        <circle cx="16" cy="9" r="4.5" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
        <circle cx="60" cy="9" r="4.5" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
      </svg>
      <span className="-mt-0.5 px-1.5 py-0.5 rounded bg-orange-600 text-white text-[10px] font-black leading-snug">
        ബാരിക്കേഡ്
      </span>
    </div>
  );
};

export const ViqayaRescueVehicleActivity: React.FC<{
  onAwardXp: (amount: number, actionId: string) => void;
  onUnlockBadge?: (badge: string) => void;
  onOpenBadgeStudio?: (presetBadgeId: string) => void;
  onComplete?: () => void;
}> = ({ onAwardXp, onUnlockBadge, onOpenBadgeStudio, onComplete }) => {
  const stagePaused = useGameStagePaused();
  const [missionIdx, setMissionIdx] = useState(0);
  const [lane, setLane] = useState<0 | 1 | 2>(1);
  const [steerTilt, setSteerTilt] = useState<-1 | 0 | 1>(0);
  const [speedGear, setSpeedGear] = useState<1 | 2 | 3>(2); // 1=30km/h, 2=50km/h, 3=70km/h
  const [braking, setBraking] = useState(false);
  const [floodSurge, setFloodSurge] = useState<{ active: boolean; y: number; cleared: boolean }>({
    active: false,
    y: -15,
    cleared: false,
  });
  const [objects, setObjects] = useState<RoadObj[]>([]);
  const [collected, setCollected] = useState(0);
  const [lives, setLives] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [won, setWon] = useState(false);
  const [failed, setFailed] = useState(false);
  const [statusMsg, setStatusMsg] = useState(
    'സ്റ്റിയറിംഗ് ഉപയോഗിച്ച് ലെയിൻ മാറ്റൂ, വേഗം നിയന്ത്രിക്കൂ — വെള്ളമൊഴുക്ക് വരുമ്പോൾ ബ്രേക്ക് പിടിച്ച് നിർത്തണം!'
  );
  const [hitFlash, setHitFlash] = useState(false);

  const laneRef = useRef<0 | 1 | 2>(1);
  const speedRef = useRef<1 | 2 | 3>(2);
  const brakingRef = useRef(false);
  const missionRef = useRef(0);
  const collectedRef = useRef(0);
  const livesRef = useRef(3);
  const objectsRef = useRef<RoadObj[]>([]);
  const uidRef = useRef(1);
  const floodRef = useRef<{ active: boolean; y: number; cleared: boolean }>({
    active: false,
    y: -15,
    cleared: false,
  });
  const steerTimerRef = useRef<number | null>(null);
  const rawUid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const ambBodyGradId = `amb-3d-body-${rawUid}`;

  laneRef.current = lane;
  speedRef.current = speedGear;
  brakingRef.current = braking;
  missionRef.current = missionIdx;
  collectedRef.current = collected;
  livesRef.current = lives;

  const currentMission = VIQAYA_MISSIONS[missionIdx] ?? VIQAYA_MISSIONS[0];
  const isRaining = playing && !won && !failed && missionIdx === 0;
  const effectiveKmh = !playing || won || failed || braking ? 0 : speedGear === 1 ? 30 : speedGear === 2 ? 50 : 70;

  const triggerSteerTilt = (dir: -1 | 1) => {
    setSteerTilt(dir);
    if (steerTimerRef.current) window.clearTimeout(steerTimerRef.current);
    steerTimerRef.current = window.setTimeout(() => setSteerTilt(0), 260);
  };

  const moveLane = (dir: -1 | 1) => {
    if (!playing || won || failed) return;
    sound.unlockAudio();
    sound.playClick();
    triggerSteerTilt(dir);
    setLane((prev) => {
      const next = Math.max(0, Math.min(2, prev + dir)) as 0 | 1 | 2;
      laneRef.current = next;
      return next;
    });
  };

  const adjustSpeed = (delta: -1 | 1) => {
    if (!playing || won || failed) return;
    sound.unlockAudio();
    sound.playClick();
    setBraking(false);
    brakingRef.current = false;
    setSpeedGear((prev) => {
      const next = Math.max(1, Math.min(3, prev + delta)) as 1 | 2 | 3;
      speedRef.current = next;
      return next;
    });
  };

  // Keyboard support: ArrowLeft/Right steer, ArrowUp/Down speed, Space brake
  useEffect(() => {
    if (!playing || won || failed) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveLane(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveLane(1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        adjustSpeed(1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        adjustSpeed(-1);
      } else if (e.key === ' ') {
        e.preventDefault();
        brakingRef.current = true;
        setBraking(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        brakingRef.current = false;
        setBraking(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [playing, won, failed]);

  // Game Loop: smooth 60ms ticks with variable speed, braking & flowing floodwater current (pauses on overlay/background)
  useEffect(() => {
    if (!playing || won || failed || stagePaused) return;
    let tick = 0;

    const timer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      tick += 1;
      const mIdx = missionRef.current;
      const mDef = VIQAYA_MISSIONS[mIdx];
      const isBrakingNow = brakingRef.current;
      const gearMult = speedRef.current === 1 ? 0.72 : speedRef.current === 2 ? 1.0 : 1.38;
      const roadSpeed = isBrakingNow ? 0 : (2.9 + mIdx * 0.55) * gearMult;

      // Flowing Floodwater Current mechanic (occurs periodically in Mission 1 & 2)
      const f = floodRef.current;
      if (f.active) {
        // Flood surge drains across the road when ambulance stops, or approaches fast if driving
        const nextY = f.y + (isBrakingNow ? 1.85 : roadSpeed + 0.9);
        if (!f.cleared && nextY >= 68 && nextY <= 86) {
          if (isBrakingNow) {
            // Safely stopped for rushing water!
            floodRef.current = { active: true, y: nextY, cleared: true };
            setFloodSurge({ active: true, y: nextY, cleared: true });
            sound.playPop();
            setStatusMsg('മികച്ച ഡ്രൈവിംഗ്! ബ്രേക്ക് പിടിച്ച് നിർത്തിയതിനാൽ വെള്ളമൊഴുക്ക് സുരക്ഷിതമായി ഒഴുകിപ്പോയി.');
          } else {
            // Drove into rushing floodwater without braking!
            floodRef.current = { active: false, y: -15, cleared: false };
            setFloodSurge({ active: false, y: -15, cleared: false });
            const nextLives = Math.max(0, livesRef.current - 1);
            livesRef.current = nextLives;
            setLives(nextLives);
            sound.playError();
            setHitFlash(true);
            window.setTimeout(() => setHitFlash(false), 350);
            if (nextLives <= 0) {
              setFailed(true);
              setPlaying(false);
              setStatusMsg('വെള്ളമൊഴുക്കിൽ ബ്രേക്ക് പിടിക്കാത്തതിനാൽ വാഹനം കുടുങ്ങി! വീണ്ടും ശ്രമിക്കാം.');
              return;
            } else {
              setStatusMsg(`വെള്ളമൊഴുക്ക് വരുമ്പോൾ ബ്രേക്ക് പിടിച്ചു നിർത്തണം! (ബാക്കി കവചം: ${nextLives})`);
            }
          }
        } else if (nextY > 106) {
          floodRef.current = { active: false, y: -15, cleared: false };
          setFloodSurge({ active: false, y: -15, cleared: false });
        } else {
          floodRef.current = { ...f, y: nextY };
          setFloodSurge({ ...f, y: nextY });
        }
      } else if ((mIdx === 0 || mIdx === 1) && tick > 30 && tick % 72 === 0) {
        floodRef.current = { active: true, y: -12, cleared: false };
        setFloodSurge({ active: true, y: -12, cleared: false });
        setStatusMsg('മുന്നറിയിപ്പ്! റോഡിന് കുറുകെ വെള്ളമൊഴുക്ക് വരുന്നു — ബ്രേക്ക് പിടിച്ച് നിർത്തൂ!');
      }

      // Compute collisions, aid collection, and spawning cleanly outside React state updater (StrictMode safe!)
      const prevObjects = objectsRef.current;
      const nextList: RoadObj[] = [];
      let resetRoad = false;

      for (const obj of prevObjects) {
        const ny = obj.y + roadSpeed;
        // Collision window near ambulance (y between 72 and 89)
        if (ny >= 72 && ny <= 89 && obj.lane === laneRef.current) {
          if (obj.kind === 'aid') {
            const newCount = collectedRef.current + 1;
            collectedRef.current = newCount;
            setCollected(newCount);
            sound.playSuccess(newCount);
            if (newCount >= mDef.goalCount) {
              if (mIdx + 1 < VIQAYA_MISSIONS.length) {
                const nextMission = VIQAYA_MISSIONS[mIdx + 1];
                missionRef.current = mIdx + 1;
                collectedRef.current = 0;
                floodRef.current = { active: false, y: -15, cleared: false };
                setFloodSurge({ active: false, y: -15, cleared: false });
                setMissionIdx(mIdx + 1);
                setCollected(0);
                onAwardXp(15, `viqaya_mission_${mDef.id}`);
                setStatusMsg(`${mDef.title} വിജയിച്ചു! അടുത്തത്: ${nextMission.title}`);
                narrator.speak(mDef.speech);
                resetRoad = true;
                break;
              } else {
                setWon(true);
                setPlaying(false);
                sound.playHoist();
                onAwardXp(40, 'viqaya_prep_complete');
                onUnlockBadge?.('ആദർശരക്ഷാധികാരി');
                onComplete?.();
                setStatusMsg('മൂന്ന് വിഖായ & അലേർട്ട് രക്ഷാദൗത്യങ്ങളും വിജയകരമായി പൂർത്തിയാക്കി!');
                narrator.speak('അടിപൊളി! പ്രളയ ദുരിതാശ്വാസം, ആശുപത്രി എക്സ്പ്രസ്, ഹജ്ജ് സേവനം എന്നീ മൂന്ന് വിഖായ ദൗത്യങ്ങളും വിജയിച്ചു!');
                resetRoad = true;
                break;
              }
            } else {
              setStatusMsg(`${mDef.needLabel} ശേഖരിച്ചു (${newCount}/${mDef.goalCount})`);
            }
          } else {
            // Hit road obstacle!
            const nextLives = Math.max(0, livesRef.current - 1);
            livesRef.current = nextLives;
            setLives(nextLives);
            sound.playError();
            setHitFlash(true);
            window.setTimeout(() => setHitFlash(false), 320);
            const hitName =
              obj.hazardVariant === 'pothole'
                ? 'റോഡ് കുഴി'
                : obj.hazardVariant === 'oil'
                ? 'ഓയിൽ ചോർച്ച'
                : 'റോഡ് ബാരിക്കേഡ്';
            if (nextLives <= 0) {
              setFailed(true);
              setPlaying(false);
              setStatusMsg('വാഹനത്തിന് 3 തവണ തടസ്സമേറ്റു! വേഗം നിയന്ത്രിച്ച് വീണ്ടും ശ്രമിക്കാം.');
              resetRoad = true;
              break;
            } else {
              setStatusMsg(`${hitName} തട്ടി! ശ്രദ്ധിച്ച് സ്റ്റിയറിംഗ് തിരിക്കൂ (ബാക്കി കവചം: ${nextLives})`);
            }
          }
          continue;
        }
        if (ny < 106) {
          nextList.push({ ...obj, y: ny });
        }
      }

      if (resetRoad) {
        objectsRef.current = [];
        setObjects([]);
        return;
      }

      // Spawn aid boxes & realistic hazards only while moving (and not overlapping active flood surge)
      const spawnEvery = speedRef.current === 3 ? 11 : speedRef.current === 2 ? 14 : 18;
      if (!isBrakingNow && !floodRef.current.active && tick % spawnEvery === 0) {
        const spawnLane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
        const isHazard = Math.random() < 0.54;
        const aidVariant: AidVariant =
          mIdx === 0 ? 'relief_box' : mIdx === 1 ? 'blood_box' : 'water_pack';
        const hazardPool: HazardVariant[] =
          mIdx === 0
            ? ['pothole', 'oil', 'barricade']
            : mIdx === 1
            ? ['barricade', 'oil', 'pothole']
            : ['barricade', 'pothole', 'oil'];
        const hazardVariant = hazardPool[Math.floor(Math.random() * hazardPool.length)];
        nextList.push({
          uid: uidRef.current++,
          lane: spawnLane,
          y: -10,
          kind: isHazard ? 'hazard' : 'aid',
          ...(isHazard ? { hazardVariant } : { aidVariant }),
        });
      }

      objectsRef.current = nextList;
      setObjects(nextList);
    }, 60);

    return () => window.clearInterval(timer);
  }, [playing, won, failed, onAwardXp, onUnlockBadge, onComplete]);

  const startOrReset = () => {
    sound.unlockAudio();
    sound.playPop();
    missionRef.current = 0;
    collectedRef.current = 0;
    livesRef.current = 3;
    laneRef.current = 1;
    speedRef.current = 2;
    brakingRef.current = false;
    objectsRef.current = [];
    floodRef.current = { active: false, y: -15, cleared: false };
    setMissionIdx(0);
    setCollected(0);
    setLives(3);
    setLane(1);
    setSpeedGear(2);
    setBraking(false);
    setFloodSurge({ active: false, y: -15, cleared: false });
    setObjects([]);
    setWon(false);
    setFailed(false);
    setPlaying(true);
    setStatusMsg('ദൗത്യം 1 തുടങ്ങി! സഹായ കിറ്റ് ബോക്സുകൾ എടുക്കൂ — കുഴി, ഓയിൽ, ബാരിക്കേഡ് ഒഴിവാക്കൂ, വെള്ളമൊഴുക്കിൽ ബ്രേക്ക് പിടിക്കൂ!');
  };

  const lanePercent = lane === 0 ? '17.5%' : lane === 1 ? '50%' : '82.5%';
  const roadAnimDuration = speedGear === 3 ? '0.26s' : speedGear === 2 ? '0.42s' : '0.68s';
  const roadRunning = playing && !won && !failed && !braking;
  const wheelAngle = steerTilt === -1 ? -42 : steerTilt === 1 ? 42 : lane === 0 ? -16 : lane === 2 ? 16 : 0;

  return (
    <GameFullscreenShell
      title="വിഖായ & അലേർട്ട് (ALERT) രക്ഷാദൗത്യം"
      subtitle="3D ഹൈവേ ഡ്രൈവിംഗ് · സ്റ്റിയറിംഗ്, വേഗം & ബ്രേക്ക് നിയന്ത്രണം"
      isGameDone={won}
    >
      <div className="bg-white rounded-2xl border-2 border-sky-200 p-3 sm:p-4 space-y-3 shadow-sm">
        {/* Top Mission & Speedometer HUD */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white rounded-xl px-3 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 px-2 py-1 rounded-lg bg-white flex items-center justify-center shrink-0">
              <img
                src={OFFICIAL_WING_LOGOS.viqaya.src}
                alt={OFFICIAL_WING_LOGOS.viqaya.label}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-amber-300 leading-tight">
                {currentMission.title} ({missionIdx + 1}/3)
              </p>
              <p className="text-xs font-bold text-sky-100 leading-snug">
                ലക്ഷ്യം: {currentMission.needIcon} {collected}/{currentMission.goalCount} → {currentMission.targetName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2 py-1 rounded-lg text-[11px] font-black tabular-nums border ${
                braking
                  ? 'bg-rose-600 text-white border-rose-300'
                  : 'bg-slate-800 text-emerald-300 border-slate-700'
              }`}
            >
              {braking ? 'BRAKE' : `${effectiveKmh} km/h`}
            </span>
            <GameShatterLives lives={lives} maxLives={3} dark compact />
            {won && onOpenBadgeStudio && (
              <button
                type="button"
                onClick={() => onOpenBadgeStudio('viqaya_hero')}
                aria-label="ഫോട്ടോ ബാഡ്ജ്"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" /> ബാഡ്ജ്
              </button>
            )}
          </div>
        </div>

        {/* 3D-Perspective Downward-Scrolling Rescue Highway Stage */}
        <div
          className={`relative h-[305px] sm:h-[340px] rounded-2xl bg-gradient-to-b ${currentMission.roadBg} border-4 overflow-hidden select-none transition-colors ${
            hitFlash
              ? 'border-rose-500 ring-4 ring-rose-300'
              : floodSurge.active
              ? 'border-sky-400 ring-2 ring-sky-300/60'
              : 'border-emerald-700'
          }`}
          style={{ perspective: '540px' }}
        >
          {/* 3D Tilted Highway Road Surface moving continuously DOWNWARD */}
          <div
            className="absolute inset-x-[-6%] inset-y-[-10%]"
            style={{
              transform: 'rotateX(16deg)',
              transformOrigin: '50% 85%',
            }}
          >
            {/* Side Green Shoulders + Bright Glowing Emerald/Gold Roadside Guard Markers */}
            <div
              className="absolute inset-y-0 left-0 w-7 bg-emerald-800 border-r-2 border-amber-300 shadow-[2px_0_12px_rgba(251,191,36,0.55)] animate-road-scroll-down"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, rgba(253,224,71,0.95) 0px, rgba(253,224,71,0.95) 12px, transparent 12px, transparent 48px)',
                backgroundSize: '100% 48px',
                animationDuration: roadAnimDuration,
                animationPlayState: roadRunning ? 'running' : 'paused',
              }}
            />
            <div
              className="absolute inset-y-0 right-0 w-7 bg-emerald-800 border-l-2 border-amber-300 shadow-[-2px_0_12px_rgba(251,191,36,0.55)] animate-road-scroll-down"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, rgba(253,224,71,0.95) 0px, rgba(253,224,71,0.95) 12px, transparent 12px, transparent 48px)',
                backgroundSize: '100% 48px',
                animationDuration: roadAnimDuration,
                animationPlayState: roadRunning ? 'running' : 'paused',
              }}
            />

            {/* Wet/Textured Asphalt Scrolling Downward */}
            <div
              className="absolute inset-y-0 inset-x-7 pointer-events-none opacity-25 animate-road-scroll-down"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent 0px, transparent 40px, rgba(255,255,255,0.22) 40px, rgba(255,255,255,0.22) 48px)',
                backgroundSize: '100% 48px',
                animationDuration: roadAnimDuration,
                animationPlayState: roadRunning ? 'running' : 'paused',
              }}
            />

            {/* Two Bold Luminous Gold Highway Lane Dividers Scrolling Downward */}
            <div
              className="absolute inset-y-0 left-[35.5%] w-1.5 -translate-x-1/2 pointer-events-none animate-road-scroll-down drop-shadow-[0_0_6px_rgba(250,204,21,0.85)]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, rgba(253,224,71,0.98) 0px, rgba(253,224,71,0.98) 22px, transparent 22px, transparent 48px)',
                backgroundSize: '100% 48px',
                animationDuration: roadAnimDuration,
                animationPlayState: roadRunning ? 'running' : 'paused',
              }}
            />
            <div
              className="absolute inset-y-0 left-[64.5%] w-1.5 -translate-x-1/2 pointer-events-none animate-road-scroll-down drop-shadow-[0_0_6px_rgba(250,204,21,0.85)]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, rgba(253,224,71,0.98) 0px, rgba(253,224,71,0.98) 22px, transparent 22px, transparent 48px)',
                backgroundSize: '100% 48px',
                animationDuration: roadAnimDuration,
                animationPlayState: roadRunning ? 'running' : 'paused',
              }}
            />
          </div>

          {/* Flowing Floodwater Surge Crossing All 3 Lanes (Brake to let it pass!) */}
          {floodSurge.active && (
            <div
              style={{ top: `${floodSurge.y}%` }}
              className="absolute inset-x-0 h-14 -translate-y-1/2 z-15 pointer-events-none flex items-center justify-center"
            >
              <div
                className="w-full h-full bg-gradient-to-b from-sky-400/75 via-cyan-500/85 to-blue-700/80 border-y-2 border-sky-200 animate-flood-flow flex items-center justify-center"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0px, rgba(255,255,255,0.28) 18px, transparent 18px, transparent 64px)',
                  backgroundSize: '64px 100%',
                }}
              >
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-950/80 text-amber-300 text-[10px] font-black tracking-wide shadow">
                  {braking
                    ? 'വെള്ളമൊഴുക്ക് മാറുന്നു — സുരക്ഷിതം!'
                    : 'വെള്ളമൊഴുക്ക്! ബ്രേക്ക് പിടിച്ച് നിർത്തൂ!'}
                </span>
              </div>
            </div>
          )}

          {/* Animated Monsoon Rainfall Overlay during Flood Rescue Mission 1 */}
          {isRaining && (
            <div
              className="absolute inset-0 z-25 pointer-events-none opacity-45 animate-rain-fall"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(108deg, transparent 0px, transparent 16px, rgba(186,230,253,0.55) 16px, rgba(186,230,253,0.55) 17.5px)',
                backgroundSize: '36px 96px',
              }}
            />
          )}

          {/* Tap-Direct-Lane Invisible Click Zones for ultra-easy mobile steering */}
          {playing && (
            <div className="absolute inset-0 z-10 grid grid-cols-3">
              {([0, 1, 2] as const).map((targetLane) => (
                <button
                  key={targetLane}
                  type="button"
                  aria-label={`ലെയിൻ ${targetLane + 1}`}
                  onClick={() => {
                    sound.unlockAudio();
                    sound.playClick();
                    if (targetLane !== laneRef.current) {
                      triggerSteerTilt(targetLane > laneRef.current ? 1 : -1);
                    }
                    laneRef.current = targetLane;
                    setLane(targetLane);
                  }}
                  className="h-full w-full bg-transparent active:bg-white/5 cursor-pointer"
                />
              ))}
            </div>
          )}

          {/* Custom 3D-Shaded Illustrated Supply Crates & Road Obstacles */}
          {objects.map((obj) => {
            const leftPos = obj.lane === 0 ? '17.5%' : obj.lane === 1 ? '50%' : '82.5%';
            // Subtle perspective depth scaling: objects grow as they approach the bottom
            const depthScale = 0.72 + Math.max(0, Math.min(1, obj.y / 90)) * 0.36;
            return (
              <div
                key={obj.uid}
                style={{
                  left: leftPos,
                  top: `${obj.y}%`,
                  transform: `translate(-50%, -50%) scale(${depthScale.toFixed(2)})`,
                }}
                className="absolute z-20 pointer-events-none"
              >
                {obj.kind === 'aid' ? (
                  <AidCrateGraphic variant={obj.aidVariant || 'relief_box'} />
                ) : (
                  <RoadHazardGraphic variant={obj.hazardVariant || 'pothole'} />
                )}
              </div>
            );
          })}

          {/* Upgraded Realistic 3D-Styled SKSSF VIQAYA Ambulance */}
          <motion.div
            animate={{
              left: lanePercent,
              rotate: steerTilt === -1 ? -9 : steerTilt === 1 ? 9 : 0,
            }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            style={{ top: '80%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-[74px] sm:w-[86px]"
          >
            <svg viewBox="0 0 116 146" className="w-full h-auto drop-shadow-[0_12px_14px_rgba(0,0,0,0.65)]">
              <defs>
                <linearGradient id={ambBodyGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#CBD5E1" />
                  <stop offset="22%" stopColor="#FFFFFF" />
                  <stop offset="78%" stopColor="#F8FAFC" />
                  <stop offset="100%" stopColor="#94A3B8" />
                </linearGradient>
              </defs>

              {/* High-Beam Headlight Cones */}
              <polygon points="28,18 6,0 44,0" fill="#FEF08A" opacity="0.4" />
              <polygon points="88,18 72,0 110,0" fill="#FEF08A" opacity="0.4" />

              {/* Ground Shadow */}
              <rect x="18" y="20" width="80" height="118" rx="18" fill="#020617" opacity="0.38" />

              {/* Four Tires (front wheels subtly angle with steering!) */}
              <rect x="13" y="30" width="8" height="22" rx="3" fill="#0F172A" />
              <rect x="95" y="30" width="8" height="22" rx="3" fill="#0F172A" />
              <rect x="13" y="96" width="8" height="24" rx="3" fill="#0F172A" />
              <rect x="95" y="96" width="8" height="24" rx="3" fill="#0F172A" />

              {/* Side Mirrors */}
              <rect x="11" y="42" width="10" height="6" rx="2" fill="#0F172A" />
              <rect x="95" y="42" width="10" height="6" rx="2" fill="#0F172A" />

              {/* Sculpted 3D Metallic Ambulance Chassis */}
              <path
                d="M24 28 Q24 14 40 12 L76 12 Q92 14 92 28 L94 124 Q94 134 84 134 L32 134 Q22 134 22 124 Z"
                fill={`url(#${ambBodyGradId})`}
                stroke="#0F766E"
                strokeWidth="3"
              />

              {/* Front Hood Vents & Headlights */}
              <rect x="30" y="13" width="14" height="5" rx="2" fill="#FEF08A" />
              <rect x="72" y="13" width="14" height="5" rx="2" fill="#FEF08A" />
              <line x1="46" y1="22" x2="70" y2="22" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

              {/* Tinted Aerodynamic Windshield with Glare */}
              <path
                d="M29 32 Q58 24 87 32 L83 49 Q58 45 33 49 Z"
                fill="#0F172A"
                stroke="#38BDF8"
                strokeWidth="1.5"
              />
              <path d="M36 34 L52 31 L44 45 L34 45 Z" fill="#38BDF8" opacity="0.35" />

              {/* Roof Side SKSSF Blue & Emerald Livery Stripes */}
              <rect x="24" y="54" width="5.5" height="72" rx="2" fill="#0284C7" />
              <rect x="86.5" y="54" width="5.5" height="72" rx="2" fill="#16A34A" />

              {/* Flashing Red / Blue Emergency LED Lightbar */}
              <rect x="33" y="52" width="50" height="9" rx="4" fill="#1E293B" />
              <rect x="35" y="53.5" width="20" height="6" rx="3" fill="#EF4444" />
              <rect x="61" y="53.5" width="20" height="6" rx="3" fill="#3B82F6" />

              {/* Elevated Roof Panel + AC Unit + Bold Medical Cross */}
              <rect x="33" y="65" width="50" height="56" rx="7" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
              <rect x="52" y="71" width="12" height="32" rx="2" fill="#DC2626" />
              <rect x="42" y="81" width="32" height="12" rx="2" fill="#DC2626" />

              {/* Crisp VIQAYA Roof Tag */}
              <rect x="35" y="108" width="46" height="12" rx="3.5" fill="#065F46" />
              <text x="58" y="117" textAnchor="middle" fill="#FEF08A" fontSize="8.5" fontWeight="900">
                VIQAYA
              </text>

              {/* Rear Brake Lights (glow intensely when braking!) */}
              <rect
                x="26"
                y="130"
                width="16"
                height="5"
                rx="2"
                fill={braking ? '#FF1E1E' : '#991B1B'}
              />
              <rect
                x="74"
                y="130"
                width="16"
                height="5"
                rx="2"
                fill={braking ? '#FF1E1E' : '#991B1B'}
              />
              {braking && (
                <>
                  <circle cx="34" cy="134" r="9" fill="#EF4444" opacity="0.45" />
                  <circle cx="82" cy="134" r="9" fill="#EF4444" opacity="0.45" />
                </>
              )}
            </svg>
          </motion.div>

          {/* Start / Fail / Win Overlays */}
          {!playing && !won && !failed && (
            <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3 text-white">
              <h4 className="text-base sm:text-lg font-extrabold text-amber-300">
                വിഖായ &amp; അലേർട്ട് (ALERT) രക്ഷാദൗത്യം
              </h4>
              <p className="text-xs font-semibold text-slate-200 max-w-sm leading-relaxed">
                3 ദൗത്യങ്ങൾ: സഹായ കിറ്റ് ബോക്സ്, രക്തം &amp; മരുന്ന് കൂളർ ബോക്സ്, കുടിവെള്ള പാക്ക് എന്നിവ ശേഖരിക്കുക. കുഴി, ഓയിൽ, ബാരിക്കേഡ് എന്നിവ ഒഴിവാക്കുകയും വെള്ളമൊഴുക്ക് വരുമ്പോൾ ബ്രേക്ക് പിടിച്ച് നിർത്തുകയും ചെയ്യുക.
              </p>
              <button
                type="button"
                onClick={startOrReset}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-extrabold border-b-4 border-emerald-800 shadow-lg cursor-pointer"
              >
                ഡ്രൈവിംഗ് തുടങ്ങാം
              </button>
            </div>
          )}

          {failed && (
            <GameDefeatBurstOverlay
              title="വിഖായ രക്ഷാദൗത്യം പരാജയപ്പെട്ടു"
              reason="തടസ്സങ്ങൾ ഒഴിവാക്കിയും വെള്ളമൊഴുക്കിൽ ബ്രേക്ക് പിടിച്ചും ഒരിക്കൽ കൂടി ശ്രമിക്കൂ."
              onRetry={startOrReset}
            />
          )}

          {won && (
            <div className="absolute inset-0 z-30 bg-emerald-950/92 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3 text-white">
              <h4 className="text-base sm:text-lg font-extrabold text-amber-300">
                വിഖായ &amp; അലേർട്ട് ദൗത്യം വിജയിച്ചു (+40 XP)
              </h4>
              <p className="text-xs font-semibold text-emerald-100 max-w-sm">
                പ്രളയ ദുരിതാശ്വാസം, ആശുപത്രി രക്ത-മരുന്ന് വിതരണം, ഹജ്ജ് കുടിവെള്ള സേവനം എന്നിവ സുരക്ഷിതമായി പൂർത്തിയാക്കി!
              </p>
              <button
                type="button"
                onClick={startOrReset}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold border-b-4 border-amber-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> വീണ്ടും കളിക്കാം
              </button>
            </div>
          )}
        </div>

        {/* Realistic Cockpit Dashboard: Steering Wheel + Speed Control + Brake Pedal */}
        <div className="rounded-2xl bg-slate-900 text-white p-2.5 sm:p-3 border border-slate-700 space-y-2.5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            {/* Steer Left */}
            <button
              type="button"
              disabled={!playing}
              onClick={() => moveLane(-1)}
              className="min-w-0 py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs sm:text-sm font-extrabold border-b-4 border-slate-950 active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-1"
            >
              <span aria-hidden="true">←</span>
              <span className="truncate">ഇടത്തോട്ട്</span>
            </button>

            {/* Live Rotating 3D Steering Wheel Indicator */}
            <div className="flex flex-col items-center justify-center px-1">
              <motion.svg
                animate={{ rotate: wheelAngle }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                viewBox="0 0 64 64"
                className="w-12 h-12 sm:w-14 sm:h-14"
                aria-label="സ്റ്റിയറിംഗ്"
              >
                <circle cx="32" cy="32" r="26" fill="none" stroke="#334155" strokeWidth="7" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="10 16" />
                {/* Top Center Marker */}
                <rect x="29.5" y="3" width="5" height="6" rx="1.5" fill="#F59E0B" />
                {/* Steering Spokes */}
                <line x1="10" y1="32" x2="54" y2="32" stroke="#475569" strokeWidth="5.5" strokeLinecap="round" />
                <line x1="32" y1="32" x2="32" y2="55" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                <circle cx="32" cy="32" r="8.5" fill="#065F46" stroke="#FBBF24" strokeWidth="2" />
              </motion.svg>
            </div>

            {/* Steer Right */}
            <button
              type="button"
              disabled={!playing}
              onClick={() => moveLane(1)}
              className="min-w-0 py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs sm:text-sm font-extrabold border-b-4 border-slate-950 active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-1"
            >
              <span className="truncate">വലത്തോട്ട്</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Speed Gear (- / +) & Tactile Brake Pedal */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={!playing || speedGear <= 1}
              onClick={() => adjustSpeed(-1)}
              className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-sky-200 text-xs font-extrabold border border-slate-600 cursor-pointer"
            >
              വേഗം −
            </button>
            <button
              type="button"
              disabled={!playing}
              onPointerDown={() => {
                if (!playing) return;
                sound.unlockAudio();
                brakingRef.current = true;
                setBraking(true);
              }}
              onPointerUp={() => {
                brakingRef.current = false;
                setBraking(false);
              }}
              onPointerLeave={() => {
                if (brakingRef.current) {
                  brakingRef.current = false;
                  setBraking(false);
                }
              }}
              onPointerCancel={() => {
                brakingRef.current = false;
                setBraking(false);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black border-b-4 transition-all cursor-pointer select-none ${
                braking
                  ? 'bg-rose-500 border-rose-800 text-white scale-95'
                  : 'bg-rose-600 hover:bg-rose-500 border-rose-900 text-white disabled:opacity-40'
              }`}
            >
              {braking ? 'നിർത്തി (BRAKE)' : 'ബ്രേക്ക് പിടിക്കൂ'}
            </button>
            <button
              type="button"
              disabled={!playing || speedGear >= 3}
              onClick={() => adjustSpeed(1)}
              className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-300 text-xs font-extrabold border border-slate-600 cursor-pointer"
            >
              വേഗം +
            </button>
          </div>
        </div>

        <p className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center">
          {statusMsg}
        </p>
      </div>
    </GameFullscreenShell>
  );
};
