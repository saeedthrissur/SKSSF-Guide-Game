import React, { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, CheckCircle2, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { GameFullscreenShell, useGameFullscreen } from './GameFullscreenShell';

/* ============================================================================
 * 1. OPENING INTERACTIVE ACTIVITY: SKSSF ANNOUNCEMENT VEHICLE (പ്രചാരണ വാഹനം)
 *    - Zero quiz/exam pressure at entry
 *    - Animated pointing-hand cue so even kids who can't read Malayalam yet
 *      instantly understand what to tap or drag!
 *    - Dignified Kerala SKSSF Conference Announcement Jeep aesthetic for all ages
 * ========================================================================== */

type JeepPartId = 'speaker' | 'flag' | 'sticker';

interface JeepPart {
  id: JeepPartId;
  emoji: string;
  title: string;
  shortHint: string;
  targetName: string;
  placedSpeech: string;
}

const JEEP_PARTS: JeepPart[] = [
  {
    id: 'speaker',
    emoji: '📢',
    title: 'ലൗഡ്‌സ്പീക്കർ',
    shortHint: 'വണ്ടിയുടെ മുകളിൽ വെക്കാം',
    targetName: 'മേൽക്കൂര (Roof)',
    placedSpeech:
      'മിടുക്കൻ! ലൗഡ്‌സ്പീക്കർ വണ്ടിയുടെ മുകളിൽ കൃത്യമായി വെച്ചു! ഇനി നാട്ടിൽ സമ്മേളന സന്ദേശം കേൾക്കാം!',
  },
  {
    id: 'flag',
    emoji: '🚩',
    title: 'SKSSF ഔദ്യോഗിക കൊടി',
    shortHint: 'മുൻഭാഗത്തെ കൊടിമരത്തിൽ വെക്കാം',
    targetName: 'മുൻഭാഗം (Flag Pole)',
    placedSpeech:
      'അടിപൊളി! ആകാശനീലയും വെള്ളയും പച്ചയും ചേർന്ന SKSSF ഔദ്യോഗിക കൊടി വണ്ടിയിൽ പാറിപ്പറക്കുന്നു!',
  },
  {
    id: 'sticker',
    emoji: '🏷️',
    title: 'ആദർശ സ്റ്റിക്കർ',
    shortHint: 'വണ്ടിയുടെ വാതിലിൽ ഒട്ടിക്കാം',
    targetName: 'വാതിൽ (Door)',
    placedSpeech:
      'ഗംഭീരം! വിജ്ഞാനം, വിനയം, സേവനം എന്ന SKSSF സന്ദേശ സ്റ്റിക്കർ വണ്ടിയുടെ വാതിലിൽ ഒട്ടിച്ചു!',
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
  });
  const [selectedPart, setSelectedPart] = useState<JeepPartId | null>(null);
  const [draggingPart, setDraggingPart] = useState<JeepPartId | null>(null);
  const [celebrated, setCelebrated] = useState(false);
  const [wrongMsg, setWrongMsg] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const maxMistakes = 3;
  const failed = mistakes >= maxMistakes;

  const placedCount = Object.values(placed).filter(Boolean).length;
  const allPlaced = placedCount === 3;
  const nextSuggestedPart = JEEP_PARTS.find((p) => !placed[p.id])?.id ?? null;

  useEffect(() => {
    if (allPlaced && !celebrated) {
      setCelebrated(true);
      sound.playHoist();
      onAwardXp(50, 'opening_jeep_ready');
      onComplete();
      narrator.speak(
        'അടിപൊളി! നമ്മുടെ SKSSF പ്രചാരണ വാഹനം പൂർണ്ണമായി ഒരുങ്ങി! ലൗഡ്‌സ്പീക്കറും കൊടിയും സ്റ്റിക്കറും ചേർന്ന് വണ്ടി യാത്ര തുടങ്ങുകയാണ്. ഇപ്പോൾ തന്നെ നിങ്ങളുടെ ഫോട്ടോ ചേർത്ത് ആദ്യ ബാഡ്ജ് ഷെയർ ചെയ്യാം, അല്ലെങ്കിൽ അടുത്ത പാഠത്തിലേക്ക് പോകാം!',
        '🚗 പ്രചാരണ വാഹനം തയ്യാർ!'
      );
    }
  }, [allPlaced, celebrated, onAwardXp, onComplete]);

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
          ? '3 തവണ തെറ്റായ സ്ഥലത്ത് വെച്ചു! കുഴപ്പമില്ല, വീണ്ടും ശ്രമിക്കാം!'
          : `അവിടെയല്ല! "${correctItem?.title}" → "${correctItem?.targetName}" എന്ന തിളങ്ങുന്ന സ്ഥലത്ത് തൊടൂ. (ബാക്കി അവസരം: ${maxMistakes - nextMistakes})`
      );
      return;
    }
    setWrongMsg(null);
    const nextState = { ...placed, [partId]: true };
    setPlaced(nextState);
    setSelectedPart(null);
    setDraggingPart(null);
    const meta = JEEP_PARTS.find((p) => p.id === partId);
    sound.playSuccess(Object.values(nextState).filter(Boolean).length);
    if (meta) {
      onAwardXp(10, `jeep_part_${partId}`);
      if (Object.values(nextState).filter(Boolean).length < 3) {
        narrator.speak(meta.placedSpeech, `${meta.emoji} ${meta.title}`);
      }
    }
  };

  const handleTapZone = (slot: JeepPartId) => {
    if (placed[slot] || failed) return;
    if (selectedPart) {
      placePart(selectedPart, slot);
    } else {
      placePart(slot, slot);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setPlaced({ speaker: false, flag: false, sticker: false });
    setSelectedPart(null);
    setCelebrated(false);
    setWrongMsg(null);
    setMistakes(0);
  };

  const playVoiceIntro = () => {
    sound.unlockAudio();
    narrator.speak(
      'സ്വാഗതം കൂട്ടുകാരേ! ഇതാണ് SKSSF ഗൈഡ് ഗെയിം! താഴെയുള്ള ലൗഡ്‌സ്പീക്കറും കൊടിയും സ്റ്റിക്കറും വലിച്ചോ തൊട്ടോ വണ്ടിയിലെ തിളങ്ങുന്ന സ്ഥലത്ത് വെക്കൂ — വിരൽ കാണിക്കുന്നിടത്ത് തൊട്ടാൽ മതി!',
      '🚗 കളി എങ്ങനെ കളിക്കാം?'
    );
  };

  return (
    <GameFullscreenShell title="🚐 SKSSF പ്രചാരണ വാഹനം" isGameDone={allPlaced}>
      <AnnouncementVehicleInner
        placed={placed}
        placedCount={placedCount}
        allPlaced={allPlaced}
        mistakes={mistakes}
        maxMistakes={maxMistakes}
        failed={failed}
        selectedPart={selectedPart}
        draggingPart={draggingPart}
        nextSuggestedPart={nextSuggestedPart}
        wrongMsg={wrongMsg}
        setSelectedPart={setSelectedPart}
        setDraggingPart={setDraggingPart}
        setWrongMsg={setWrongMsg}
        placePart={placePart}
        handleTapZone={handleTapZone}
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
  mistakes: number;
  maxMistakes: number;
  failed: boolean;
  selectedPart: JeepPartId | null;
  draggingPart: JeepPartId | null;
  nextSuggestedPart: JeepPartId | null;
  wrongMsg: string | null;
  setSelectedPart: React.Dispatch<React.SetStateAction<JeepPartId | null>>;
  setDraggingPart: React.Dispatch<React.SetStateAction<JeepPartId | null>>;
  setWrongMsg: React.Dispatch<React.SetStateAction<string | null>>;
  placePart: (partId: JeepPartId, targetSlot?: JeepPartId) => void;
  handleTapZone: (slot: JeepPartId) => void;
  handleReset: () => void;
  playVoiceIntro: () => void;
  onOpenBadgeStudio?: (presetBadgeId: string) => void;
  onProceedNext?: () => void;
}

const AnnouncementVehicleInner: React.FC<AnnouncementVehicleInnerProps> = ({
  placed,
  placedCount,
  allPlaced,
  mistakes,
  maxMistakes,
  failed,
  selectedPart,
  draggingPart,
  nextSuggestedPart,
  wrongMsg,
  setSelectedPart,
  setDraggingPart,
  setWrongMsg,
  placePart,
  handleTapZone,
  handleReset,
  playVoiceIntro,
  onOpenBadgeStudio,
  onProceedNext,
}) => {
  const isFullscreen = useGameFullscreen();
  const rawUid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const flagCrescentMaskId = `jeep-flag-crescent-${rawUid}`;
  const flagClothClipId = `jeep-flag-cloth-${rawUid}`;
  const flagWaveGradId = `jeep-flag-wave-${rawUid}`;
  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-300 bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-50 shadow-lg">
      {/* Clean Icon-First Header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl sm:text-2xl shrink-0">🚐</span>
          <h2 className="text-sm sm:text-base font-extrabold leading-tight">
            SKSSF പ്രചാരണ വാഹനം
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={playVoiceIntro}
            aria-label="ശബ്ദത്തിൽ കേൾക്കാം"
            title="ശബ്ദത്തിൽ കേൾക്കാം"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-2xs transition-transform active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          {placedCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              aria-label="വീണ്ടും ഒരുക്കാം"
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Animated Scenic Stage */}
      <div className="relative px-3 sm:px-5 pt-3 pb-4 overflow-hidden">
        {/* Compact Visual Stars & Hearts Bar */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-950">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={i < placedCount ? { scale: [1, 1.35, 1] } : {}}
                transition={{ duration: 0.35 }}
                className={`text-base ${i < placedCount ? 'opacity-100' : 'opacity-30 grayscale'}`}
              >
                ⭐
              </motion.span>
            ))}
            <span className="text-emerald-800 tabular-nums ml-0.5">{placedCount}/3</span>
          </div>

          {!allPlaced && (
            <span className="text-xs font-extrabold text-rose-900 tabular-nums">
              {Array.from({ length: maxMistakes })
                .map((_, i) => (i < maxMistakes - mistakes ? '❤️' : '🖤'))
                .join('')}
            </span>
          )}
        </div>

        {/* Scenic Road + Animated Vehicle Stage */}
        <div
          className={`relative rounded-2xl border-2 border-emerald-200 bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 overflow-hidden flex items-end justify-center select-none transition-all ${
            isFullscreen ? 'min-h-[340px] sm:min-h-[410px]' : 'min-h-[270px] sm:min-h-[310px]'
          }`}
        >
          {/* Drifting clouds & warm sun */}
          <motion.div
            animate={{ x: [0, 18, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-3 left-6 text-2xl sm:text-3xl opacity-80 pointer-events-none"
          >
            ☁️
          </motion.div>
          <motion.div
            animate={{ x: [0, -16, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-5 right-10 text-2xl sm:text-3xl opacity-75 pointer-events-none"
          >
            ⛅
          </motion.div>

          {/* Distant Kerala Mosque Silhouette & Passing Coconut Palms */}
          <motion.svg
            animate={{ x: [0, -120] }}
            transition={{ duration: allPlaced ? 3.8 : 7.5, repeat: Infinity, ease: 'linear' }}
            viewBox="0 0 960 220"
            className="absolute left-0 bottom-16 sm:bottom-20 w-[130%] h-44 pointer-events-none opacity-85"
            aria-hidden="true"
          >
            {/* Soft distant hills */}
            <path d="M0 220 Q180 140 380 190 Q600 130 960 185 L960 220 Z" fill="#A7F3D0" />
            {/* Mosque Dome */}
            <g transform="translate(80, 96)">
              <rect x="18" y="42" width="64" height="58" rx="4" fill="#ECFDF5" stroke="#059669" strokeWidth="2" />
              <path d="M22 42 Q50 4 78 42 Z" fill="#047857" />
              <rect x="6" y="24" width="12" height="76" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
              <path d="M6 24 Q12 10 18 24 Z" fill="#047857" />
              <rect x="82" y="24" width="12" height="76" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
              <path d="M82 24 Q88 10 94 24 Z" fill="#047857" />
              <path d="M40 100 L40 72 Q50 60 60 72 L60 100 Z" fill="#065F46" />
            </g>
            {/* Palm trees */}
            <g transform="translate(450, 96)">
              <path d="M35 120 Q42 75 46 34" stroke="#78350F" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M46 34 Q18 22 6 40" stroke="#15803D" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M46 34 Q72 20 88 38" stroke="#15803D" strokeWidth="5" fill="none" strokeLinecap="round" />
            </g>
            <g transform="translate(690, 90)">
              <path d="M35 120 Q42 75 46 34" stroke="#78350F" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M46 34 Q18 22 6 40" stroke="#15803D" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M46 34 Q72 20 88 38" stroke="#15803D" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M46 34 Q30 6 12 16" stroke="#16A34A" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M46 34 Q64 4 82 14" stroke="#16A34A" strokeWidth="5" fill="none" strokeLinecap="round" />
            </g>
          </motion.svg>

          {/* Wide Asphalt Road — Wheels stay strictly ON the smooth road once ready! */}
          <div className="absolute inset-x-0 bottom-0 h-20 sm:h-24 bg-slate-700 border-t-4 border-emerald-700 overflow-hidden">
            {/* Crisp white road shoulder line */}
            <div className="w-full h-1 bg-white/75 mt-1.5" />
            <motion.div
              animate={{ x: [0, -72] }}
              transition={{ duration: allPlaced ? 0.45 : 1.05, repeat: Infinity, ease: 'linear' }}
              className="flex items-center gap-8 pt-6 sm:pt-7 px-4 w-[160%]"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-10 h-1.5 rounded-full bg-amber-300/95 shrink-0" />
              ))}
            </motion.div>
            <div className="absolute inset-x-0 bottom-1.5 h-1 bg-white/50" />
          </div>

          {/* Interactive SKSSF Announcement Jeep Container:
              Planted smoothly on the asphalt road with ZERO shake, ZERO bounce, and ZERO tilt! */}
          <div
            className={`relative z-10 mb-1 sm:mb-1.5 ${
              isFullscreen
                ? 'w-[340px] sm:w-[510px] h-[230px] sm:h-[280px]'
                : 'w-[310px] sm:w-[440px] h-[215px] sm:h-[245px]'
            }`}
          >
            {/* Vehicle Base SVG + Firmly Mounted Roof Speaker & Straight Flagpole */}
            <svg
              viewBox="0 0 440 230"
              className="w-full h-full drop-shadow-lg"
              aria-label="SKSSF പ്രചാരണ വാഹനം"
            >
              {/* Soft Shadow under vehicle */}
              <ellipse cx="220" cy="212" rx="160" ry="12" fill="#0F172A" opacity="0.28" />

              {/* Headlight glow when completed */}
              {allPlaced && (
                <polygon points="384,142 440,118 440,178 384,162" fill="#FDE047" opacity="0.45" />
              )}

              {/* Roof Rack firmly bolted to vehicle roof (y=74 to y=88) */}
              <rect x="92" y="74" width="170" height="7" rx="3.5" fill="#334155" />
              <rect x="115" y="78" width="6" height="12" fill="#475569" />
              <rect x="174" y="78" width="6" height="12" fill="#475569" />
              <rect x="235" y="78" width="6" height="12" fill="#475569" />

              {/* SOLID ROOF-MOUNTED DUAL PA HORN LOUDSPEAKER (Bolted directly onto Roof Rack — ZERO floating!) */}
              {placed.speaker && (
                <g>
                  {/* Steel mounting clamp & pedestal welded right onto roof rack y=74 */}
                  <rect x="150" y="70" width="54" height="7" rx="2" fill="#1E293B" />
                  <rect x="172" y="54" width="10" height="18" rx="2" fill="#334155" />
                  <circle cx="177" cy="54" r="6" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.5" />
                  {/* Forward PA Horn Cone */}
                  <polygon
                    points="181,49 224,36 224,68 181,59"
                    fill="#F8FAFC"
                    stroke="#0F766E"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <ellipse cx="224" cy="52" rx="4.5" ry="16" fill="#1E293B" stroke="#0F766E" strokeWidth="2" />
                  <ellipse cx="224" cy="52" rx="2" ry="6" fill="#F59E0B" />
                  {/* Rear PA Horn Cone */}
                  <polygon
                    points="173,49 132,38 132,66 173,59"
                    fill="#F1F5F9"
                    stroke="#0F766E"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <ellipse cx="132" cy="52" rx="4" ry="14" fill="#334155" stroke="#0F766E" strokeWidth="2" />
                  {/* Center Speaker Housing Accent */}
                  <rect x="169" y="48" width="16" height="12" rx="3" fill="#059669" stroke="#064E3B" strokeWidth="1.5" />
                  {/* Animated Sound Waves coming right out of the front horn */}
                  {allPlaced && (
                    <g stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round">
                      <path d="M232 45 Q239 52 232 59" opacity="0.95" />
                      <path d="M239 40 Q249 52 239 64" opacity="0.7" />
                      <path d="M246 35 Q258 52 246 69" opacity="0.45" />
                    </g>
                  )}
                </g>
              )}

              {/* Jeep Main Body */}
              <path
                d="M68 178 L68 96 Q68 86 80 86 L256 86 Q272 86 284 102 L310 128 L374 134 Q388 136 388 150 L388 178 Q388 188 376 188 L80 188 Q68 188 68 178 Z"
                fill="#FFFFFF"
                stroke="#065F46"
                strokeWidth="4"
              />

              {/* Emerald & Sky-Blue SKSSF Stripe along vehicle lower body */}
              <path d="M70 164 L386 164 L386 178 Q386 186 376 186 L80 186 Q70 186 70 178 Z" fill="#059669" />
              <rect x="70" y="156" width="316" height="8" fill="#0284C7" />

              {/* Rear Window & Cabin Windshield */}
              <rect x="86" y="98" width="68" height="36" rx="6" fill="#BAE6FD" stroke="#0F766E" strokeWidth="2.5" />
              <rect x="166" y="98" width="76" height="36" rx="6" fill="#BAE6FD" stroke="#0F766E" strokeWidth="2.5" />
              <path d="M254 98 L272 98 L296 128 L254 128 Z" fill="#7DD3FC" stroke="#0F766E" strokeWidth="2.5" />

              {/* Headlight & Grille */}
              <rect x="378" y="142" width="12" height="16" rx="3" fill="#FACC15" stroke="#B45309" strokeWidth="2" />
              <rect x="64" y="140" width="8" height="18" rx="2" fill="#EF4444" />

              {/* Straight Upright Front Flagpole Mount Welded to Front Hood */}
              <rect x="361" y="130" width="14" height="7" rx="2" fill="#334155" />
              <line x1="368" y1="132" x2="368" y2="24" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="368" cy="21" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />

              {/* AUTHENTIC SKSSF FLAG — Physically Streaming BACKWARD (Leftward) into the Wind as Vehicle Drives Forward! */}
              {placed.flag && (
                <g transform="translate(272, 26)">
                  <defs>
                    {/* Crisp SVG Mask for Iconic Crescent Moon (Curved Belly Bottom-Left, Opening Upper-Right Toward Hoist) */}
                    <mask
                      id={flagCrescentMaskId}
                      maskUnits="userSpaceOnUse"
                      x="-16"
                      y="-16"
                      width="32"
                      height="32"
                    >
                      <rect x="-20" y="-20" width="40" height="40" fill="black" />
                      <circle cx="0" cy="0" r="10.5" fill="white" />
                      <circle cx="3.6" cy="-3.2" r="8.8" fill="black" />
                    </mask>

                    {/* Gently Rippled Woven Cloth Silhouette — Pinned Flat at Right Hoist (x=94), Waving to Left Fly Edge (x=0) */}
                    <clipPath id={flagClothClipId}>
                      <path d="M 94,0 C 70,-2.2 44,2.8 20,-1.5 C 10,-3 4,-1.2 0,0.5 L 0,55.5 C 4,53.8 10,52 20,53.5 C 44,57.8 70,52.8 94,56 Z" />
                    </clipPath>

                    {/* Traveling 3D Cloth Fold Shading Gradient (Flows Pole -> Tail in Wind) */}
                    <linearGradient id={flagWaveGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0F172A" stopOpacity="0" />
                      <stop offset="22%" stopColor="#0F172A" stopOpacity="0.16" />
                      <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.22" />
                      <stop offset="72%" stopColor="#0F172A" stopOpacity="0.14" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Brass Pole Rings Clamped Firmly to Upright Pole at x=96 (368 in parent coords) */}
                  <circle cx="95.5" cy="7" r="2.6" fill="#F59E0B" stroke="#B45309" strokeWidth="0.7" />
                  <circle cx="95.5" cy="49" r="2.6" fill="#F59E0B" stroke="#B45309" strokeWidth="0.7" />

                  {/* Fluttering Flag Cloth Anchored at Right Hoist Edge (94, 28) */}
                  <motion.g
                    animate={
                      allPlaced
                        ? {
                            skewY: [-2.6, 3.1, -2.0, 2.7, -2.6],
                            scaleX: [1, 0.955, 1.015, 0.965, 1],
                            rotate: [-1.0, 1.35, -0.7, 1.05, -1.0],
                          }
                        : {
                            skewY: [-1.6, 2.0, -1.2, 1.7, -1.6],
                            scaleX: [1, 0.975, 1.006, 0.982, 1],
                            rotate: [-0.55, 0.75, -0.35, 0.65, -0.55],
                          }
                    }
                    transition={{
                      duration: allPlaced ? 0.95 : 1.7,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{ transformOrigin: '94px 28px' }}
                  >
                    <g clipPath={`url(#${flagClothClipId})`}>
                      {/* Base White Cloth */}
                      <rect x="0" y="-4" width="94" height="64" fill="#FFFFFF" />

                      {/* Trailing White Field (Left Side, Fly End) + Authentic Mosque Dome & Left Minaret */}
                      <g
                        transform="translate(10, 5)"
                        fill="none"
                        stroke="#0F172A"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {/* Left Tall Minaret */}
                        <rect x="2" y="7" width="3.5" height="23" fill="#FFFFFF" />
                        <line x1="2" y1="13" x2="5.5" y2="13" />
                        <line x1="2" y1="19" x2="5.5" y2="19" />
                        <path d="M 1.5,7 C 1.5,4 6,4 6,7 Z" fill="#0F172A" />
                        <line x1="3.75" y1="2" x2="3.75" y2="4.5" />
                        {/* Ribbed Mosque Dome */}
                        <path d="M 7.5,25 C 8.5,14 18,10.5 20,6.5 C 22,10.5 31.5,14 32.5,25 Z" fill="#FFFFFF" />
                        <path d="M 20,6.5 L 20,25" />
                        <path d="M 20,6.5 C 16.5,13 15.5,19 15.5,25" />
                        <path d="M 20,6.5 C 23.5,13 24.5,19 24.5,25" />
                        <path d="M 11,16 Q 20,18.5 29,16" />
                        <path d="M 8.5,20.5 Q 20,23 31.5,20.5" />
                        {/* Crescent atop Dome */}
                        <line x1="20" y1="3" x2="20" y2="6.5" />
                        <path d="M 18.8,2 A 2,2 0 1,0 21.2,2 A 1.5,1.5 0 1,1 18.8,2 Z" fill="#0F172A" />
                        {/* Dome Base */}
                        <path d="M 6,25 L 34,25 L 35.5,30 L 4.5,30 Z" fill="#FFFFFF" />
                      </g>

                      {/* Hoist-Side Top-Right Sky Blue Canton (#0EA5E9) — Sewn to the Flagpole! */}
                      <rect x="59" y="-4" width="35" height="43" fill="#0EA5E9" />

                      {/* Properly Oriented White Crescent & 5-Pointed Star Nestled Cleanly Inside Opening */}
                      <g transform="translate(75.5, 20.5)">
                        <circle
                          cx="0"
                          cy="0"
                          r="10.5"
                          fill="#FFFFFF"
                          mask={`url(#${flagCrescentMaskId})`}
                        />
                        <circle
                          cx="0"
                          cy="0"
                          r="10.5"
                          fill="none"
                          stroke="#FDE047"
                          strokeWidth="0.6"
                          mask={`url(#${flagCrescentMaskId})`}
                        />
                        <polygon
                          points="4.2,-7.6 5.11,-5.05 7.81,-4.97 5.67,-3.32 6.43,-0.73 4.2,-2.25 1.97,-0.73 2.73,-3.32 0.59,-4.97 3.29,-5.05"
                          fill="#FFFFFF"
                          stroke="#FDE047"
                          strokeWidth="0.35"
                        />
                      </g>

                      {/* Bottom Bright Green Band (#16A34A) with Crisp Readable SKSSF */}
                      <rect x="0" y="39" width="94" height="21" fill="#16A34A" />
                      <text
                        x="47"
                        y="51.2"
                        textAnchor="middle"
                        fontSize="11.5"
                        fontWeight="900"
                        fill="#FFFFFF"
                        letterSpacing="2.4"
                        fontFamily="Georgia, serif"
                      >
                        SKSSF
                      </text>

                      {/* Continuously Rolling Wind-Wave Fold Sheen (Moves Right-to-Left Along the Cloth!) */}
                      <motion.rect
                        x="0"
                        y="-4"
                        width="110"
                        height="64"
                        fill={`url(#${flagWaveGradId})`}
                        animate={{ x: [70, -110] }}
                        transition={{
                          duration: allPlaced ? 0.85 : 1.55,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    </g>

                    {/* Crisp Rippled Cloth Outline */}
                    <path
                      d="M 94,0 C 70,-2.2 44,2.8 20,-1.5 C 10,-3 4,-1.2 0,0.5 L 0,55.5 C 4,53.8 10,52 20,53.5 C 44,57.8 70,52.8 94,56 Z"
                      fill="none"
                      stroke="#0F172A"
                      strokeWidth="1.15"
                      strokeLinejoin="round"
                    />
                  </motion.g>

                  {/* Subtle Air-Flow Wind Streaks Trailing Behind Flying Edge When Moving */}
                  <motion.g
                    stroke="#FFFFFF"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                    animate={{ x: [0, -14], opacity: allPlaced ? [0.85, 0] : [0.45, 0] }}
                    transition={{
                      duration: allPlaced ? 0.65 : 1.25,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  >
                    <line x1="-5" y1="14" x2="-19" y2="14" />
                    <line x1="-8" y1="30" x2="-24" y2="30" />
                    <line x1="-4" y1="45" x2="-16" y2="45" />
                  </motion.g>
                </g>
              )}

              {/* Smoothly Spinning Axle-Centered Wheels */}
              {[132, 324].map((cx) => (
                <g key={cx} transform={`translate(${cx}, 188)`}>
                  <circle cx="0" cy="0" r="28" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
                  <circle cx="0" cy="0" r="14" fill="#E2E8F0" />
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: allPlaced ? 0.55 : 0.95, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '0px 0px' }}
                  >
                    <line x1="0" y1="-13" x2="0" y2="13" stroke="#334155" strokeWidth="2.5" />
                    <line x1="-13" y1="0" x2="13" y2="0" stroke="#334155" strokeWidth="2.5" />
                  </motion.g>
                  <circle cx="0" cy="0" r="5" fill="#059669" />
                </g>
              ))}
            </svg>

            {/* DROP ZONE 1: ROOF LOUDSPEAKER */}
            {!placed.speaker && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = (e.dataTransfer.getData('text/plain') as JeepPartId) || draggingPart;
                  if (dropped) placePart(dropped, 'speaker');
                }}
                onClick={() => handleTapZone('speaker')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleTapZone('speaker')}
                aria-label="ലൗഡ്‌സ്പീക്കർ"
                className={`absolute left-[27%] top-[14%] w-[27%] h-[19%] rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  selectedPart === 'speaker' || nextSuggestedPart === 'speaker'
                    ? 'border-2 border-dashed border-amber-500 bg-amber-200/75 shadow-md ring-4 ring-amber-300/60'
                    : 'border-2 border-dashed border-emerald-500/70 bg-white/75 hover:bg-amber-100/80'
                }`}
              >
                <span className="text-xl sm:text-2xl">📢</span>

                {(selectedPart === 'speaker' || (!selectedPart && nextSuggestedPart === 'speaker')) && (
                  <motion.span
                    animate={{ y: [0, -7, 0], scale: [1, 1.12, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    className="absolute -top-6 right-1 text-2xl sm:text-3xl pointer-events-none drop-shadow"
                  >
                    👇
                  </motion.span>
                )}
              </div>
            )}

            {/* DROP ZONE 2: FRONT FLAGPOLE */}
            {!placed.flag && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = (e.dataTransfer.getData('text/plain') as JeepPartId) || draggingPart;
                  if (dropped) placePart(dropped, 'flag');
                }}
                onClick={() => handleTapZone('flag')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleTapZone('flag')}
                aria-label="SKSSF കൊടി"
                className={`absolute left-[61.5%] top-[11%] w-[22%] h-[25.5%] rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  selectedPart === 'flag' || nextSuggestedPart === 'flag'
                    ? 'border-2 border-dashed border-sky-500 bg-sky-200/85 shadow-md ring-4 ring-sky-300/60'
                    : 'border-2 border-dashed border-emerald-500/70 bg-white/80 hover:bg-sky-100/85'
                }`}
              >
                <span className="text-xl sm:text-2xl">🚩</span>

                {(selectedPart === 'flag' || (!selectedPart && nextSuggestedPart === 'flag')) && (
                  <motion.span
                    animate={{ y: [0, -7, 0], scale: [1, 1.12, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    className="absolute -top-6 right-0 text-2xl sm:text-3xl pointer-events-none drop-shadow"
                  >
                    👇
                  </motion.span>
                )}
              </div>
            )}

            {/* DROP ZONE 3: SIDE DOOR STICKER */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = (e.dataTransfer.getData('text/plain') as JeepPartId) || draggingPart;
                if (dropped) placePart(dropped, 'sticker');
              }}
              onClick={() => handleTapZone('sticker')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleTapZone('sticker')}
              aria-label="SKSSF സ്റ്റിക്കർ"
              className={`absolute left-[37%] top-[56%] w-[36%] h-[18%] rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                placed.sticker
                  ? 'pointer-events-none'
                  : selectedPart === 'sticker' || nextSuggestedPart === 'sticker'
                  ? 'border-2 border-dashed border-emerald-600 bg-emerald-200/80 shadow-md ring-4 ring-emerald-300/60'
                  : 'border-2 border-dashed border-emerald-500/70 bg-white/80 hover:bg-emerald-100'
              }`}
            >
              {placed.sticker ? (
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-2 py-0.5 rounded bg-emerald-800 text-amber-200 text-[9px] sm:text-[11px] font-extrabold tracking-tight shadow-sm text-center leading-tight"
                >
                  ✨ SKSSF ✨
                </motion.div>
              ) : (
                <span className="text-xl sm:text-2xl">🏷️</span>
              )}

              {!placed.sticker && (selectedPart === 'sticker' || (!selectedPart && nextSuggestedPart === 'sticker')) && (
                <motion.span
                  animate={{ y: [0, -7, 0], scale: [1, 1.12, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="absolute -top-6 right-1 text-2xl sm:text-3xl pointer-events-none drop-shadow"
                >
                  👇
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Helpful Gentle Hint */}
        {wrongMsg && (
          <p className="mt-2.5 text-xs font-extrabold text-amber-950 bg-amber-100 border border-amber-300 rounded-xl px-3 py-2 text-center">
            {wrongMsg}
          </p>
        )}

        {/* Failure Overlay or Icon-First Parts Tray */}
        {failed ? (
          <div className="mt-3 p-3 rounded-2xl bg-rose-950 text-white border-2 border-rose-400 flex items-center justify-between gap-3 shadow-md">
            <span className="text-lg font-extrabold text-amber-300">❌ 💔</span>
            <button
              type="button"
              onClick={handleReset}
              aria-label="വീണ്ടും ശ്രമിക്കാം"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-base font-extrabold shadow-md active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> 🔄
            </button>
          </div>
        ) : !allPlaced ? (
          <div className="mt-3 space-y-1.5">
            <div className="grid grid-cols-3 gap-2">
              {JEEP_PARTS.map((part) => {
                const isDone = placed[part.id];
                const isSelected = selectedPart === part.id;
                const isSuggested = !selectedPart && nextSuggestedPart === part.id;
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
                      if (isSelected) {
                        placePart(part.id, part.id);
                      } else {
                        sound.playPop();
                        setSelectedPart(part.id);
                        setWrongMsg(null);
                      }
                    }}
                    disabled={isDone}
                    aria-label={part.title}
                    title={part.title}
                    className={`relative py-3 px-2 rounded-2xl border-2 flex items-center justify-center gap-1.5 transition-all ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60 cursor-default'
                        : isSelected
                        ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-md scale-[1.03]'
                        : isSuggested
                        ? 'bg-white border-emerald-500 text-slate-900 shadow-md ring-2 ring-emerald-300 hover:bg-emerald-50'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-400'
                    }`}
                  >
                    <span className="text-3xl">{part.emoji}</span>
                    {isDone && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                  </button>
                );
              })}
            </div>
            {selectedPart && (
              <p className="text-[11px] font-extrabold text-emerald-900 text-center">
                {JEEP_PARTS.find((p) => p.id === selectedPart)?.emoji}{' '}
                {JEEP_PARTS.find((p) => p.id === selectedPart)?.title}
              </p>
            )}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white border-2 border-amber-300 shadow-lg flex flex-wrap items-center justify-between gap-2.5"
            >
              <span className="text-sm font-extrabold text-amber-300 inline-flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> 🎉 +50 XP
              </span>
              <div className="flex items-center gap-2">
                {onOpenBadgeStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSuccess();
                      onOpenBadgeStudio('jeep_starter');
                    }}
                    aria-label="ഫോട്ടോ ബാഡ്ജ്"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold shadow-sm active:scale-95"
                  >
                    <Award className="w-4 h-4" /> 📷
                  </button>
                )}
                {onProceedNext && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onProceedNext();
                    }}
                    aria-label="അടുത്തത്"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 text-sm font-extrabold shadow-sm active:scale-95"
                  >
                    ➡️
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
    speech: 'മിടുക്കൻ! മദ്രസ സമയവിവരവും SKSSF യൂണിറ്റ് അറിയിപ്പ് ബോർഡും തയ്യാറായി!',
  },
];

export const MadrasaBoardActivity: React.FC<{
  onAwardXp: (amount: number, actionId: string) => void;
  onUnlockBadge?: (badge: string) => void;
  onOpenBadgeStudio?: (presetBadgeId: string) => void;
  onComplete?: () => void;
}> = ({ onAwardXp, onUnlockBadge, onOpenBadgeStudio, onComplete }) => {
  const [placed, setPlaced] = useState<Record<MadrasaPartId, boolean>>({
    arch_flag: false,
    main_board: false,
    motto_plaque: false,
    notice_board: false,
  });
  const [selected, setSelected] = useState<MadrasaPartId | null>('arch_flag');
  const [hearts, setHearts] = useState(3);
  const [doneNotified, setDoneNotified] = useState(false);

  const count = Object.values(placed).filter(Boolean).length;
  const allDone = count === 4;
  const failed = hearts <= 0 && !allDone;
  const suggested = MADRASA_PARTS.find((p) => !placed[p.id])?.id ?? null;

  const resetBoard = () => {
    sound.playClick();
    setPlaced({ arch_flag: false, main_board: false, motto_plaque: false, notice_board: false });
    setSelected('arch_flag');
    setHearts(3);
    setDoneNotified(false);
  };

  const snap = (slotId: MadrasaPartId, droppedId?: MadrasaPartId) => {
    sound.unlockAudio();
    if (placed[slotId] || failed || allDone) return;
    const activeId = droppedId || selected;
    if (activeId && activeId !== slotId) {
      sound.playError();
      setHearts((h) => Math.max(0, h - 1));
      return;
    }
    const next = { ...placed, [slotId]: true };
    setPlaced(next);
    const nextUnplaced = MADRASA_PARTS.find((p) => !next[p.id])?.id ?? null;
    setSelected(nextUnplaced);
    const total = Object.values(next).filter(Boolean).length;
    sound.playSuccess(total);
    onAwardXp(10, `madrasa_board_${slotId}`);
    const item = MADRASA_PARTS.find((p) => p.id === slotId);
    if (total === 4 && !doneNotified) {
      setDoneNotified(true);
      sound.playHoist();
      onAwardXp(30, 'madrasa_board_complete');
      onUnlockBadge?.('🏫 മദ്രസ കൂട്ടുകാരൻ');
      onComplete?.();
      narrator.speak(
        'അടിപൊളി! നമ്മുടെ സമസ്ത മദ്രസ ബോർഡ് മനോഹരമായി ഒരുങ്ങി! 11,000-ലധികം മദ്രസകളുടെ വെളിച്ചം പകരുന്ന ഈ പൈതൃകമാണ് നമ്മുടെ കരുത്ത്.',
        '🏫 മദ്രസ ബോർഡ് തയ്യാർ!'
      );
    } else if (item) {
      narrator.speak(item.speech, `${item.emoji} ${item.title}`);
    }
  };

  return (
    <GameFullscreenShell title="🏫 സമസ്ത മദ്രസ ബോർഡ് (SKIMVB)" isGameDone={allDone}>
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3.5 sm:p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 text-xs font-extrabold tabular-nums">
          🏫 {count}/4
        </span>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-xs font-extrabold">
            {Array.from({ length: 3 }).map((_, i) => (i < hearts ? '❤️' : '💔')).join('')}
          </span>
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              narrator.speak(
                'നമ്മുടെ സമസ്ത മദ്രസയുടെ ബോർഡ് ഒരുക്കാം! താഴെ നിന്ന് ഒരു ഭാഗം തിരഞ്ഞെടുത്ത് ശരിയായ സ്ഥലത്ത് വെക്കൂ.',
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
                : suggested === 'arch_flag' || selected === 'arch_flag'
                ? 'border-dashed border-amber-500 bg-amber-100 text-amber-950 ring-4 ring-amber-200'
                : 'border-dashed border-emerald-400 bg-white/80 text-slate-700'
            }`}
          >
            {placed.arch_flag ? (
              <>
                <img
                  src="./assets/official/flag_111154.jpg"
                  alt="സമസ്ത പതാക"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 object-contain rounded"
                />
                <span className="text-xs font-extrabold">🌙 1926</span>
                <img
                  src="./assets/official/flag_111138.jpg"
                  alt="SKSSF പതാക"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 object-contain rounded"
                />
              </>
            ) : (
              <span className="text-2xl">🚩</span>
            )}
            {!placed.arch_flag && (suggested === 'arch_flag' || selected === 'arch_flag') && (
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute -top-5 right-1 text-xl"
              >
                👇
              </motion.span>
            )}
          </button>
        </div>

        {/* Main Header Signboard Slot */}
        <button
          type="button"
          onClick={() => snap('main_board')}
          aria-label="മദ്രസ ബോർഡ്"
          className={`relative w-full py-3.5 px-4 rounded-2xl border-2 transition-all text-center ${
            placed.main_board
              ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border-amber-300 shadow-md'
              : suggested === 'main_board' || selected === 'main_board'
              ? 'border-dashed border-amber-500 bg-amber-100/90 text-amber-950 ring-4 ring-amber-200'
              : 'border-dashed border-emerald-400 bg-white/80 text-slate-700'
          }`}
        >
          {placed.main_board ? (
            <p className="text-sm font-extrabold text-amber-200">
              🏫 SKIMVB · 1951 (11,000+)
            </p>
          ) : (
            <span className="text-2xl">🏫</span>
          )}
          {!placed.main_board && (suggested === 'main_board' || selected === 'main_board') && (
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute -top-5 right-4 text-xl"
            >
              👇
            </motion.span>
          )}
        </button>

        {/* Left & Right Entrance Plaques */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => snap('motto_plaque')}
            aria-label="ആദർശ ഫലകം"
            className={`relative p-3 rounded-xl border-2 transition-all text-center ${
              placed.motto_plaque
                ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                : suggested === 'motto_plaque' || selected === 'motto_plaque'
                ? 'border-dashed border-amber-500 bg-amber-100 text-amber-950 ring-4 ring-amber-200'
                : 'border-dashed border-emerald-400 bg-white/80 text-slate-700'
            }`}
          >
            {placed.motto_plaque ? (
              <p className="text-xs font-extrabold">📖 ✅</p>
            ) : (
              <span className="text-2xl">📖</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => snap('notice_board')}
            aria-label="അറിയിപ്പ് ബോർഡ്"
            className={`relative p-3 rounded-xl border-2 transition-all text-center ${
              placed.notice_board
                ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-xs'
                : suggested === 'notice_board' || selected === 'notice_board'
                ? 'border-dashed border-amber-500 bg-amber-100 text-amber-950 ring-4 ring-amber-200'
                : 'border-dashed border-emerald-400 bg-white/80 text-slate-700'
            }`}
          >
            {placed.notice_board ? (
              <p className="text-xs font-extrabold">🗓️ ✅</p>
            ) : (
              <span className="text-2xl">🗓️</span>
            )}
          </button>
        </div>
      </div>

      {failed ? (
        <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-400 flex items-center justify-between gap-3">
          <span className="text-lg font-extrabold text-rose-900">💔</span>
          <button
            type="button"
            onClick={resetBoard}
            aria-label="വീണ്ടും ശ്രമിക്കാം"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-b-4 border-amber-600 text-base font-extrabold shadow"
          >
            <RotateCcw className="w-4 h-4" /> 🔄
          </button>
        </div>
      ) : !allDone ? (
        <div className="space-y-1.5">
          <div className="grid grid-cols-4 gap-2">
            {MADRASA_PARTS.map((item) => {
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
                    setSelected(item.id);
                  }}
                  onClick={() => {
                    sound.playClick();
                    setSelected(item.id);
                  }}
                  aria-label={item.title}
                  title={item.title}
                  className={`py-2.5 rounded-xl border-2 flex items-center justify-center transition-all ${
                    done
                      ? 'bg-emerald-50 border-emerald-300 opacity-55'
                      : isPicked
                      ? 'bg-amber-300 border-amber-600 ring-2 ring-amber-200 cursor-grab'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-400 cursor-grab'
                  }`}
                >
                  <span className="text-2xl">{done ? '✅' : item.emoji}</span>
                </button>
              );
            })}
          </div>
          {selected && (
            <p className="text-[11px] font-bold text-emerald-900 text-center">
              {MADRASA_PARTS.find((p) => p.id === selected)?.emoji}{' '}
              {MADRASA_PARTS.find((p) => p.id === selected)?.title}
            </p>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-2.5">
          <span className="text-sm font-extrabold text-emerald-950">🎉 +70 XP</span>
          {onOpenBadgeStudio && (
            <button
              type="button"
              onClick={() => onOpenBadgeStudio('madrasa_guardian')}
              aria-label="ഫോട്ടോ ബാഡ്ജ്"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold"
            >
              <Award className="w-4 h-4" /> 📷
            </button>
          )}
        </div>
      )}
    </div>
    </GameFullscreenShell>
  );
};

/* ============================================================================
 * 3. LEVEL 4 MINI-ACTIVITY: VIQAYA RELIEF VAN & GLOBAL FLIGHT PREP
 * ========================================================================== */

type RescuePartId = 'flag' | 'aid_kit' | 'speaker' | 'flight_banner';

const RESCUE_PARTS: { id: RescuePartId; emoji: string; label: string; speech: string }[] = [
  {
    id: 'flag',
    emoji: '🚩',
    label: 'SKSSF പതാക',
    speech: 'SKSSF പതാക വിഖായ സേവന വാഹനത്തിൽ ഉയർന്നു!',
  },
  {
    id: 'speaker',
    emoji: '📢',
    label: 'അറിയിപ്പ് മൈക്ക്',
    speech: 'ദുരന്തനിവാരണ അറിയിപ്പുകൾക്കായി മൈക്ക് സജ്ജമാക്കി!',
  },
  {
    id: 'aid_kit',
    emoji: '🩹',
    label: 'ഫസ്റ്റ്-എയ്ഡ് & കുടിവെള്ളം',
    speech: 'വിഖായ ഫസ്റ്റ്-എയ്ഡ് കിറ്റും ശുദ്ധജലവും വാഹനത്തിൽ കയറ്റി!',
  },
  {
    id: 'flight_banner',
    emoji: '✈️',
    label: 'ഹജ്ജ് വിഖായ & പ്രവാസി സെൽ',
    speech: 'മക്കയിലും മദീനയിലും പ്രവാസലോകത്തും സേവനം എത്തിക്കുന്ന ഗ്ലോബൽ ദൗത്യം സജ്ജമായി!',
  },
];

export const ViqayaRescueVehicleActivity: React.FC<{
  onAwardXp: (amount: number, actionId: string) => void;
  onUnlockBadge?: (badge: string) => void;
  onOpenBadgeStudio?: (presetBadgeId: string) => void;
  onComplete?: () => void;
}> = ({ onAwardXp, onUnlockBadge, onOpenBadgeStudio, onComplete }) => {
  const [placed, setPlaced] = useState<Record<RescuePartId, boolean>>({
    flag: false,
    speaker: false,
    aid_kit: false,
    flight_banner: false,
  });
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(18);
  const [failed, setFailed] = useState(false);
  const rawUid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const ambCrescentMaskId = `amb-flag-crescent-${rawUid}`;

  const count = Object.values(placed).filter(Boolean).length;
  const allDone = count === 4;
  const nextId = RESCUE_PARTS.find((p) => !placed[p.id])?.id ?? null;

  useEffect(() => {
    if (!started || allDone || failed) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          sound.playError();
          setFailed(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, allDone, failed]);

  const resetRescue = () => {
    sound.playClick();
    setPlaced({ flag: false, speaker: false, aid_kit: false, flight_banner: false });
    setFinished(false);
    setStarted(false);
    setTimeLeft(18);
    setFailed(false);
  };

  const snap = (id: RescuePartId) => {
    sound.unlockAudio();
    if (placed[id] || failed) return;
    if (!started) setStarted(true);
    const next = { ...placed, [id]: true };
    setPlaced(next);
    const total = Object.values(next).filter(Boolean).length;
    sound.playSuccess(total);
    onAwardXp(10, `viqaya_prep_${id}`);
    const item = RESCUE_PARTS.find((p) => p.id === id);
    if (total === 4 && !finished) {
      setFinished(true);
      sound.playHoist();
      onAwardXp(30, 'viqaya_prep_complete');
      onUnlockBadge?.('🚑 വിഖായ വളണ്ടിയർ');
      onComplete?.();
      narrator.speak(
        'അടിപൊളി! വിഖായ സഹായ വാഹനവും പ്രവാസി ഗ്ലോബൽ സേവന ദൗത്യവും പൂർണ്ണമായി സജ്ജമായി!',
        '🚑 വിഖായ & ഗ്ലോബൽ ദൗത്യം തയ്യാർ!'
      );
    } else if (item) {
      narrator.speak(item.speech, `${item.emoji} ${item.label}`);
    }
  };

  return (
    <GameFullscreenShell title="🚑 വിഖായ & അലേർട്ട് (ALERT) സേവന വാഹനം" isGameDone={allDone}>
    <div className="bg-white rounded-2xl border-2 border-sky-200 p-3.5 sm:p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 text-xs font-extrabold tabular-nums">
          🚑 {count}/4
        </span>
        <div className="flex items-center gap-2">
          {!allDone && (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold tabular-nums border ${timeLeft <= 6 ? 'bg-rose-600 text-white border-rose-800 animate-pulse' : 'bg-sky-50 text-sky-900 border-sky-200'}`}>
              ⏱️ {timeLeft}s
            </span>
          )}
          {allDone && onOpenBadgeStudio && (
            <button
              type="button"
              onClick={() => onOpenBadgeStudio('viqaya_hero')}
              aria-label="ഫോട്ടോ ബാഡ്ജ്"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold"
            >
              <Award className="w-4 h-4" /> 📷
            </button>
          )}
        </div>
      </div>

      {/* Live Moving Scenic Road + Relief Van + Global Flight Drop Target */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const dropped = e.dataTransfer.getData('text/plain') as RescuePartId;
          if (dropped) snap(dropped);
          else if (nextId) snap(nextId);
        }}
        className="relative rounded-2xl bg-gradient-to-b from-sky-100 via-white to-emerald-50 border-2 border-sky-300 p-4 pb-8 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 relative z-10">
          <motion.div
            animate={allDone ? { x: 0, y: 0 } : { x: [-3, 5, -3], y: [0, -2, 0] }}
            transition={allDone ? { duration: 0.4 } : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-28 sm:w-36 shrink-0"
          >
            <svg viewBox="0 0 185 112" className="w-full h-auto drop-shadow-md" aria-label="വിഖായ സേവന ആംബുലൻസ്">
              <defs>
                {/* Exact Official Crescent Mask: Opening Upper-Right Toward Flagpole (Hoist Right, Flying Left!) */}
                <mask id={ambCrescentMaskId} maskUnits="userSpaceOnUse" x="-10" y="-10" width="20" height="20">
                  <rect x="-12" y="-12" width="24" height="24" fill="black" />
                  <circle cx="0" cy="0" r="5.5" fill="white" />
                  <circle cx="2" cy="-1.7" r="4.6" fill="black" />
                </mask>
              </defs>
              <ellipse cx="90" cy="104" rx="70" ry="6" fill="#0F172A" opacity="0.22" />
              {/* Upright Front Hood Flagpole + Fluttering Backward-Streaming Official SKSSF Flag */}
              <line x1="158" y1="6" x2="158" y2="54" stroke="#475569" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="158" cy="5" r="2.6" fill="#F59E0B" />
              {placed.flag && (
                <g transform="translate(106, 7)">
                  <motion.g
                    animate={{ skewY: [-2.4, 2.8, -1.8, 2.4, -2.4], scaleX: [1, 0.96, 1.01, 0.97, 1] }}
                    transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: '51px 16px' }}
                  >
                    <rect x="0" y="0" width="51" height="31" rx="1.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.9" />
                    <g transform="translate(5, 3)" fill="none" stroke="#0F172A" strokeWidth="0.9" strokeLinecap="round">
                      <rect x="1.5" y="4" width="2.2" height="13" fill="#FFFFFF" />
                      <path d="M 1,4 C 1,2 4.2,2 4.2,4 Z" fill="#0F172A" />
                      <path d="M 5,15 C 5.8,8.5 11.2,6.5 12.5,4 C 13.8,6.5 19.2,8.5 20,15 Z" fill="#FFFFFF" />
                      <line x1="12.5" y1="4" x2="12.5" y2="15" />
                      <rect x="4" y="15" width="17" height="2.2" fill="#FFFFFF" />
                    </g>
                    <rect x="31" y="0" width="20" height="21" fill="#0EA5E9" />
                    <g transform="translate(40.5, 11.2)">
                      <circle cx="0" cy="0" r="5.5" fill="#FFFFFF" mask={`url(#${ambCrescentMaskId})`} />
                      <polygon
                        points="2.3,-4.2 2.8,-2.8 4.3,-2.7 3.1,-1.8 3.5,-0.4 2.3,-1.2 1.1,-0.4 1.5,-1.8 0.3,-2.7 1.8,-2.8"
                        fill="#FFFFFF"
                      />
                    </g>
                    <rect x="0" y="21" width="51" height="10" fill="#16A34A" />
                    <text x="25.5" y="28.3" textAnchor="middle" fill="#FFFFFF" fontSize="6.6" fontWeight="900" letterSpacing="1.1">
                      SKSSF
                    </text>
                  </motion.g>
                </g>
              )}
              <rect x="66" y="22" width="22" height="9" rx="4" fill="#EF4444" />
              <path d="M16 86 L16 38 Q16 30 26 30 L116 30 Q128 30 136 42 L152 58 L166 62 Q174 64 174 74 L174 86 Q174 92 166 92 L24 92 Q16 92 16 86 Z" fill="#FFFFFF" stroke="#0F766E" strokeWidth="3" />
              <rect x="18" y="72" width="154" height="10" fill="#0284C7" />
              <rect x="18" y="82" width="154" height="8" fill="#16A34A" />
              <path d="M118 37 L130 37 L146 56 L118 56 Z" fill="#7DD3FC" stroke="#0369A1" strokeWidth="2" />
              <rect x="26" y="40" width="42" height="22" rx="4" fill="#E0F2FE" stroke="#0369A1" strokeWidth="1.5" />
              <rect x="81" y="41" width="22" height="7" rx="1.5" fill="#DC2626" />
              <rect x="88.5" y="33.5" width="7" height="22" rx="1.5" fill="#DC2626" />
              <rect x="167" y="67" width="7" height="10" rx="2" fill="#FACC15" />
              <circle cx="46" cy="92" r="13" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2.5" />
              <circle cx="46" cy="92" r="5" fill="#059669" />
              <circle cx="138" cy="92" r="13" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2.5" />
              <circle cx="138" cy="92" r="5" fill="#059669" />
            </svg>
          </motion.div>
          <div className="flex flex-wrap items-center gap-1.5">
            {placed.flag && <span className="text-xl">🚩</span>}
            {placed.speaker && <span className="text-xl">📢</span>}
            {placed.aid_kit && <span className="text-xl">🩹</span>}
            {placed.flight_banner && <span className="text-xl">✈️</span>}
            {allDone && <span className="text-xl">✅</span>}
          </div>
        </div>
        <motion.div
          animate={{ x: [0, 14, 0], y: [0, -6, 0] }}
          transition={{ duration: 2.1, repeat: Infinity }}
          className={`text-4xl relative z-10 transition-opacity ${placed.flight_banner ? 'opacity-100' : 'opacity-45'}`}
        >
          ✈️
        </motion.div>
        {/* Rolling asphalt strip underneath */}
        <div className="absolute inset-x-0 bottom-0 h-5 bg-slate-700 overflow-hidden">
          <motion.div
            animate={{ x: [0, -64] }}
            transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
            className="flex items-center gap-6 pt-2 px-3 w-[150%]"
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-8 h-1 rounded-full bg-amber-300 shrink-0" />
            ))}
          </motion.div>
        </div>
      </div>

      {failed ? (
        <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-400 flex items-center justify-between gap-3">
          <span className="text-lg font-extrabold text-rose-900">⏱️ ❌</span>
          <button
            type="button"
            onClick={resetRescue}
            aria-label="വീണ്ടും ശ്രമിക്കാം"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-b-4 border-amber-600 text-base font-extrabold shadow"
          >
            <RotateCcw className="w-4 h-4" /> 🔄
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {RESCUE_PARTS.map((p) => {
            const done = placed[p.id];
            const isNext = nextId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={done}
                draggable={!done}
                onDragStart={(e) => {
                  sound.unlockAudio();
                  e.dataTransfer.setData('text/plain', p.id);
                }}
                onClick={() => snap(p.id)}
                aria-label={p.label}
                title={p.label}
                className={`py-2.5 rounded-xl border-2 flex items-center justify-center transition-all ${
                  done
                    ? 'bg-emerald-50 border-emerald-300 opacity-60'
                    : isNext
                    ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-200 cursor-grab'
                    : 'bg-slate-50 border-slate-200 hover:border-sky-400 cursor-grab'
                }`}
              >
                <span className="text-2xl">{done ? '✅' : p.emoji}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
    </GameFullscreenShell>
  );
};
