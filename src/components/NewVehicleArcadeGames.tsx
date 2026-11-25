import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { useGameFullscreen } from './GameFullscreenShell';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';

/* ============================================================================
 * CONFIG INTERFACES FOR THE 3 NEW INTERACTIVE ARCADE ENGINES
 * ========================================================================== */
export interface AirplaneSicFlightConfig {
  engine: 'airplane_sic_flight';
  title: string;
  subtitle: string;
  departureAirport: string;
  arrivalAirport: string;
  hubs: {
    id: string;
    lane: 0 | 1 | 2;
    emoji: string;
    shortLabel: string;
    label: string;
    note: string;
  }[];
  doneMessage: string;
}

export interface HelicopterRescueDropConfig {
  engine: 'helicopter_rescue_drop';
  title: string;
  subtitle: string;
  kitEmoji: string;
  pads: {
    id: string;
    emoji: string;
    shortLabel: string;
    label: string;
    note: string;
  }[];
  doneMessage: string;
}

export interface BalloonPopArcadeConfig {
  engine: 'balloon_pop_arcade';
  title: string;
  subtitle: string;
  targets: {
    id: string;
    emoji: string;
    label: string;
    color: string;
    note: string;
  }[];
  decoys: { emoji: string; label: string }[];
  doneMessage: string;
}

/* ============================================================================
 * ENGINE A: INTERNATIONAL SIC & SAMASTHA CONFERENCE AIRPLANE FLIGHT GAME
 *   Phase 1: Airport Terminal & Runway Takeoff (🛫)
 *   Phase 2: 3-Lane Sky Cruise — Visit SIC/Samastha Hubs & Dodge Storm Clouds!
 *   Phase 3: Final Runway Approach & Smooth Touchdown Landing (🛬)
 *   Uses 3 Shatterable Shields (GameShatterLives) + Animated Defeat!
 * ========================================================================== */
export const AirplaneSicFlightGame: React.FC<{
  config: AirplaneSicFlightConfig;
  onWin: () => void;
  resetSignal: number;
}> = ({ config, onWin, resetSignal }) => {
  const isFullscreen = useGameFullscreen();
  const [phase, setPhase] = useState<'runway' | 'takeoff' | 'cruise' | 'landing' | 'landed'>('runway');
  const [planeLane, setPlaneLane] = useState<0 | 1 | 2>(1);
  const [hubIdx, setHubIdx] = useState(0);
  const [hubX, setHubX] = useState(640);
  const [stormLane, setStormLane] = useState<0 | 1 | 2>(0);
  const [stormX, setStormX] = useState(460);
  const [visited, setVisited] = useState<number[]>([]);
  const [shields, setShields] = useState(3);
  const [score, setScore] = useState(0);
  const [runwayProg, setRunwayProg] = useState(0);
  const [hitFlash, setHitFlash] = useState(false);
  const [failedReason, setFailedReason] = useState<string | null>(null);
  const [msg, setMsg] = useState(
    `🛫 ${config.departureAirport} റൺവേയിൽ വിമാനം തയ്യാർ! “ടേക്ക്-ഓഫ്” അമർത്തി പറന്നുയരൂ!`
  );

  const stateRef = useRef({
    phase: 'runway' as 'runway' | 'takeoff' | 'cruise' | 'landing' | 'landed',
    planeLane: 1 as 0 | 1 | 2,
    hubIdx: 0,
    hubX: 640,
    stormLane: 0 as 0 | 1 | 2,
    stormX: 460,
    visited: [] as number[],
    shields: 3,
    stormHitThisPass: false,
    hubHandledThisPass: false,
  });

  stateRef.current.phase = phase;
  stateRef.current.planeLane = planeLane;
  stateRef.current.hubIdx = hubIdx;
  stateRef.current.visited = visited;
  stateRef.current.shields = shields;

  const resetLocal = () => {
    setPhase('runway');
    setPlaneLane(1);
    setHubIdx(0);
    setHubX(640);
    const firstStormLane: 0 | 1 | 2 = config.hubs[0]?.lane === 0 ? 2 : 0;
    setStormLane(firstStormLane);
    setStormX(460);
    setVisited([]);
    setShields(3);
    setScore(0);
    setRunwayProg(0);
    setHitFlash(false);
    setFailedReason(null);
    stateRef.current.hubX = 640;
    stateRef.current.stormX = 460;
    stateRef.current.stormLane = firstStormLane;
    stateRef.current.stormHitThisPass = false;
    stateRef.current.hubHandledThisPass = false;
    setMsg(`🛫 ${config.departureAirport} റൺവേയിൽ വിമാനം തയ്യാർ! “ടേക്ക്-ഓഫ്” അമർത്തി പറന്നുയരൂ!`);
  };

  useEffect(() => {
    resetLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal, config.title]);

  const failed = Boolean(failedReason);
  const laneYs = [62, 120, 178];
  const activeHub = config.hubs[hubIdx];

  // Runway Takeoff Animation
  useEffect(() => {
    if (phase !== 'takeoff' || failed) return;
    let raf = 0;
    let last = performance.now();
    let prog = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      prog += dt * 78;
      if (prog >= 100) {
        setRunwayProg(100);
        setPhase('cruise');
        const firstHub = config.hubs[0];
        setMsg(
          firstHub
            ? `✈️ ആകാശത്തെത്തി! ⛈️ മേഘം ഒഴിവാക്കി ${firstHub.emoji} ${firstHub.shortLabel} ലക്ഷ്യമാക്കി പറക്കൂ!`
            : '✈️ ആകാശത്തെത്തി!'
        );
        return;
      }
      setRunwayProg(prog);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [phase, failed, config.hubs]);

  // Smooth 60fps Sky Cruise Loop
  useEffect(() => {
    if (phase !== 'cruise' || failed) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const s = stateRef.current;
      if (s.phase !== 'cruise' || s.shields <= 0) return;

      // Move storm cloud hazard
      let nextStormX = s.stormX - 185 * dt;
      if (
        !s.stormHitThisPass &&
        nextStormX <= 165 &&
        nextStormX >= 95 &&
        s.planeLane === s.stormLane
      ) {
        s.stormHitThisPass = true;
        sound.playError();
        setHitFlash(true);
        window.setTimeout(() => setHitFlash(false), 380);
        const rem = Math.max(0, s.shields - 1);
        s.shields = rem;
        setShields(rem);
        setScore((sc) => Math.max(0, sc - 30));
        if (rem <= 0) {
          setFailedReason('⛈️ ഇടിമേഘത്തിൽ 3 തവണ തട്ടി! ഷീൽഡുകൾ തകർന്നു — വീണ്ടും പറക്കാം.');
          return;
        }
        setMsg(`⛈️ കൊടുങ്കാറ്റിൽ തട്ടി! ഒരു ഷീൽഡ് പൊട്ടി — ഇനി ${rem} ഷീൽഡ് ബാക്കി!`);
      }
      if (nextStormX < -60) {
        nextStormX = 650;
        const currHub = config.hubs[s.hubIdx];
        const candidates: (0 | 1 | 2)[] = [0, 1, 2].filter(
          (l) => !currHub || l !== currHub.lane
        ) as (0 | 1 | 2)[];
        const nextSL = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
        s.stormLane = nextSL;
        s.stormHitThisPass = false;
        setStormLane(nextSL);
      }
      s.stormX = nextStormX;
      setStormX(nextStormX);

      // Move SIC / Conference destination gate
      let nextHubX = s.hubX - 142 * dt;
      const curHub = config.hubs[s.hubIdx];
      if (
        curHub &&
        !s.hubHandledThisPass &&
        nextHubX <= 168 &&
        nextHubX >= 96 &&
        s.planeLane === curHub.lane
      ) {
        s.hubHandledThisPass = true;
        const nextVisited = [...s.visited, s.hubIdx];
        s.visited = nextVisited;
        setVisited(nextVisited);
        setScore((sc) => sc + 120);
        sound.playSuccess(nextVisited.length);
        setMsg(`✨ ${curHub.note}`);
        narrator.speak(curHub.note, curHub.label);
      }

      // Missed hub penalty
      if (curHub && !s.hubHandledThisPass && nextHubX < 75) {
        s.hubHandledThisPass = true;
        sound.playError();
        setHitFlash(true);
        window.setTimeout(() => setHitFlash(false), 380);
        const rem = Math.max(0, s.shields - 1);
        s.shields = rem;
        setShields(rem);
        if (rem <= 0) {
          setFailedReason(`✈️ ${curHub.shortLabel} ലക്ഷ്യം നഷ്ടപ്പെട്ടു! എല്ലാ കേന്ദ്രങ്ങളിലും എത്തണം.`);
          return;
        }
        setMsg(`⚠️ ${curHub.shortLabel} കടന്നുപോയി! ഷീൽഡ് പൊട്ടി — വീണ്ടും വരുന്നുണ്ട്!`);
        // Loop same hub again so player can still succeed if shields remain
        nextHubX = 640;
        s.hubHandledThisPass = false;
      }

      if (nextHubX < -55) {
        if (s.visited.includes(s.hubIdx)) {
          const nextIdx = s.hubIdx + 1;
          if (nextIdx >= config.hubs.length) {
            s.phase = 'landing';
            setPhase('landing');
            setMsg(`🛬 ${config.arrivalAirport} റൺവേ മുന്നിൽ കാണുന്നു! “ലാൻഡ് ചെയ്യൂ” അമർത്തൂ!`);
            return;
          }
          s.hubIdx = nextIdx;
          setHubIdx(nextIdx);
          nextHubX = 650;
          s.hubHandledThisPass = false;
          const up = config.hubs[nextIdx];
          if (up) {
            setMsg(`✈️ അടുത്ത ലക്ഷ്യം: ${up.emoji} ${up.shortLabel}! വിമാനം ആ പാതയിലേക്ക് ഉയർത്തൂ/താഴ്ത്തൂ!`);
          }
        } else {
          nextHubX = 650;
          s.hubHandledThisPass = false;
        }
      }

      s.hubX = nextHubX;
      setHubX(nextHubX);

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [phase, failed, config.hubs, config.arrivalAirport]);

  const handleTakeoff = () => {
    sound.unlockAudio();
    if (phase !== 'runway' || failed) return;
    sound.playPop();
    setPhase('takeoff');
    setMsg(`🛫 എഞ്ചിൻ ഓൺ! ${config.departureAirport} റൺവേയിലൂടെ വിമാനം കുതിച്ചുയരുന്നു!`);
  };

  const handleLand = () => {
    sound.unlockAudio();
    if (phase !== 'landing' || failed) return;
    setPhase('landed');
    setScore((sc) => sc + 150);
    sound.playHoist();
    setMsg(`🛬 സുരക്ഷിത ലാൻഡിംഗ്! ${config.doneMessage}`);
    onWin();
  };

  const planeY =
    phase === 'runway'
      ? 182
      : phase === 'takeoff'
      ? 182 - Math.max(0, (runwayProg - 35) * 1.1)
      : phase === 'landing'
      ? 145
      : phase === 'landed'
      ? 182
      : laneYs[planeLane];

  const planeX =
    phase === 'runway'
      ? 110
      : phase === 'takeoff'
      ? 110 + runwayProg * 0.7
      : phase === 'landed'
      ? 280
      : 130;

  const planeRot =
    phase === 'takeoff' && runwayProg > 30
      ? -18
      : phase === 'landing'
      ? 11
      : 0;

  return (
    <div className="space-y-2.5">
      <div
        className={`relative rounded-2xl overflow-hidden border-2 shadow-inner select-none transition-colors ${
          hitFlash ? 'border-rose-500 ring-4 ring-rose-300/60' : 'border-sky-400 bg-sky-900'
        }`}
      >
        {/* Top Readable HUD */}
        <div className="bg-slate-950/92 px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-sky-500/30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 border border-sky-400/50 text-sky-200 text-xs font-extrabold tabular-nums">
              ✈️ {visited.length}/{config.hubs.length}
            </span>
            <span className="text-xs font-extrabold text-amber-300 truncate">
              {phase === 'runway'
                ? `🛫 ${config.departureAirport}`
                : phase === 'landing' || phase === 'landed'
                ? `🛬 ${config.arrivalAirport}`
                : activeHub
                ? `ലക്ഷ്യം: ${activeHub.emoji} ${activeHub.shortLabel}`
                : '✈️'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-200 text-xs font-extrabold tabular-nums">
              ⭐ {score}
            </span>
            <GameShatterLives lives={shields} maxLives={3} compact />
          </div>
        </div>

        {/* SVG AIRPORT + RUNWAY + SKY VIEWPORT */}
        <svg
          viewBox="0 0 600 245"
          className={`w-full block ${isFullscreen ? 'max-h-[62dvh] h-auto mx-auto' : 'h-auto'}`}
          role="img"
          aria-label={config.title}
        >
          <defs>
            <linearGradient id="sicFlightSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="65%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>

          <rect width="600" height="245" fill="url(#sicFlightSky)" />

          {/* Sun & Fluffy Background Clouds */}
          <circle cx="535" cy="40" r="22" fill="#FDE047" opacity="0.9" />
          {[95, 290, 460].map((cx, i) => (
            <g key={cx} opacity="0.55" transform={`translate(${cx}, ${34 + i * 16})`}>
              <ellipse cx="0" cy="0" rx="28" ry="11" fill="#FFFFFF" />
              <ellipse cx="16" cy="-5" rx="18" ry="9" fill="#FFFFFF" />
            </g>
          ))}

          {/* AIRPORT TERMINAL + ATC TOWER + TARMAC RUNWAY (Runway / Takeoff / Landing / Landed) */}
          {(phase === 'runway' || phase === 'takeoff' || phase === 'landing' || phase === 'landed') && (
            <g>
              {/* Distant Green Field */}
              <rect x="0" y="168" width="600" height="30" fill="#16A34A" />
              {/* Airport Terminal Building */}
              <g transform={phase === 'landing' || phase === 'landed' ? 'translate(350, 108)' : 'translate(38, 108)'}>
                <rect x="0" y="22" width="160" height="44" rx="5" fill="#F8FAFC" stroke="#334155" strokeWidth="2" />
                <rect x="10" y="30" width="140" height="16" rx="2" fill="#38BDF8" opacity="0.85" />
                <rect x="0" y="16" width="160" height="8" rx="2" fill="#065F46" />
                {/* ATC Control Tower */}
                <rect x="168" y="4" width="22" height="62" fill="#E2E8F0" stroke="#334155" strokeWidth="1.8" />
                <polygon points="160,6 198,6 192,-12 166,-12" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.8" />
                <line x1="179" y1="-12" x2="179" y2="-24" stroke="#F59E0B" strokeWidth="2.5" />
                <circle cx="179" cy="-25" r="3.5" fill="#EF4444" />
              </g>
              {/* Tarmac Runway */}
              <rect x="0" y="192" width="600" height="53" fill="#334155" />
              <rect x="0" y="192" width="600" height="4" fill="#FACC15" />
              <rect x="0" y="241" width="600" height="4" fill="#FACC15" />
              {[24, 96, 168, 240, 312, 384, 456, 528].map((rx) => (
                <rect key={rx} x={rx} y="215" width="42" height="5" rx="2" fill="#FFFFFF" opacity="0.92" />
              ))}
              {/* Runway Landing Guide Lights */}
              {(phase === 'landing' || phase === 'landed') &&
                [80, 160, 240, 320, 400, 480].map((lx) => (
                  <circle key={lx} cx={lx} cy="198" r="4" fill="#4ADE80" />
                ))}
            </g>
          )}

          {/* 3-LANE FLIGHT CORRIDOR IN CRUISE PHASE */}
          {phase === 'cruise' && (
            <g>
              {laneYs.map((ly, i) => (
                <g
                  key={ly}
                  className="cursor-pointer"
                  onClick={() => {
                    if (failed) return;
                    sound.playClick();
                    setPlaneLane(i as 0 | 1 | 2);
                  }}
                >
                  <rect
                    x="0"
                    y={ly - 27}
                    width="600"
                    height="54"
                    fill={planeLane === i ? '#0284C7' : '#38BDF8'}
                    opacity={planeLane === i ? 0.25 : 0.08}
                  />
                  <line
                    x1="0"
                    y1={ly + 27}
                    x2="600"
                    y2={ly + 27}
                    stroke="#FFFFFF"
                    strokeOpacity="0.35"
                    strokeDasharray="10 10"
                  />
                </g>
              ))}

              {/* Distant Cloud Carpet Below */}
              <path d="M0 228 Q75 210 150 225 T320 222 T480 226 T600 218 L600 245 L0 245 Z" fill="#FFFFFF" opacity="0.88" />

              {/* Storm Cloud Hazard (Dodge!) */}
              <g transform={`translate(${stormX}, ${laneYs[stormLane]})`}>
                <ellipse cx="0" cy="0" rx="32" ry="18" fill="#1E293B" stroke="#F43F5E" strokeWidth="2.5" />
                <text x="0" y="6" textAnchor="middle" fontSize="20">
                  ⛈️
                </text>
              </g>

              {/* SIC / Samastha Conference Hub Gate */}
              {activeHub && (
                <g
                  transform={`translate(${hubX}, ${laneYs[activeHub.lane]})`}
                  className="cursor-pointer"
                  onClick={() => {
                    sound.playClick();
                    setPlaneLane(activeHub.lane);
                  }}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r="24"
                    fill={visited.includes(hubIdx) ? '#16A34A' : '#FACC15'}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                  />
                  <text x="0" y="7" textAnchor="middle" fontSize="21">
                    {visited.includes(hubIdx) ? '✅' : activeHub.emoji}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* SKSSF / SAMASTHA AIRLINER JET */}
          <motion.g
            animate={{ x: planeX, y: planeY, rotate: planeRot }}
            transition={{ type: 'spring', stiffness: 150, damping: 18 }}
          >
            {/* Jet Exhaust Trail during Flight */}
            {(phase === 'cruise' || phase === 'takeoff') && (
              <motion.line
                x1="-54"
                y1="4"
                x2="-96"
                y2="4"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                animate={{ opacity: [0.3, 0.85, 0.3] }}
                transition={{ duration: 0.45, repeat: Infinity }}
              />
            )}
            {/* Tail Fin (Emerald Green & Gold) */}
            <path d="M-42 0 L-56 -22 L-38 -22 L-24 0 Z" fill="#047857" stroke="#064E3B" strokeWidth="1.5" />
            {/* Main Fuselage */}
            <path
              d="M-46 0 Q-48 -10 -30 -10 L32 -10 Q56 -10 62 2 Q56 12 32 12 L-34 10 Z"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2"
            />
            {/* SKSSF Emerald & Sky Stripe */}
            <path d="M-38 2 L46 2 L42 6 L-36 6 Z" fill="#10B981" />
            <path d="M-36 6 L40 6 L38 8.5 L-34 8.5 Z" fill="#0EA5E9" />
            {/* Cockpit Windshield */}
            <path d="M36 -8 Q48 -7 52 -1 L36 -1 Z" fill="#0F172A" />
            {/* Passenger Windows */}
            {[-20, -10, 0, 10, 20].map((wx) => (
              <rect key={wx} x={wx} y="-6" width="5.5" height="4.5" rx="1.5" fill="#38BDF8" />
            ))}
            {/* Swept Wing */}
            <path d="M-8 3 L12 3 L-6 20 L-18 20 Z" fill="#059669" stroke="#064E3B" strokeWidth="1.4" />
            {/* Landing Gear on Runway */}
            {(phase === 'runway' || phase === 'landed' || phase === 'landing') && (
              <g>
                <line x1="28" y1="12" x2="28" y2="21" stroke="#0F172A" strokeWidth="2.5" />
                <circle cx="28" cy="22" r="4" fill="#0F172A" />
                <line x1="-10" y1="11" x2="-10" y2="21" stroke="#0F172A" strokeWidth="2.5" />
                <circle cx="-10" cy="22" r="4" fill="#0F172A" />
              </g>
            )}
          </motion.g>
        </svg>

        {/* Live Narrative Bar */}
        <div className="bg-slate-900/95 px-3 py-1.5 border-t border-sky-500/30 text-xs font-bold text-sky-100 text-center">
          {msg}
        </div>

        {/* Cockpit Controls */}
        <div className="bg-slate-950 px-3 py-2.5 border-t border-sky-500/30">
          {phase === 'runway' ? (
            <button
              type="button"
              onClick={handleTakeoff}
              className="w-full max-w-sm mx-auto h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border-b-4 border-emerald-900 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>🛫 ടേക്ക്-ഓഫ് — പറന്നുയരൂ!</span>
            </button>
          ) : phase === 'landing' ? (
            <button
              type="button"
              onClick={handleLand}
              className="w-full max-w-sm mx-auto h-13 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-b-4 border-amber-700 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg animate-pulse cursor-pointer"
            >
              <span>🛬 റൺവേയിൽ ലാൻഡ് ചെയ്യൂ!</span>
            </button>
          ) : phase === 'landed' ? (
            <div className="text-center text-xs sm:text-sm font-extrabold text-emerald-300 py-1.5">
              🎉 സുരക്ഷിത ലാൻഡിംഗ് പൂർത്തിയായി!
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <button
                type="button"
                disabled={planeLane === 0 || phase !== 'cruise' || failed}
                onClick={() => {
                  sound.playClick();
                  setPlaneLane((l) => Math.max(0, l - 1) as 0 | 1 | 2);
                }}
                className="h-13 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white border-b-4 border-sky-900 font-black text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>▲</span>
                <span className="text-xs sm:text-sm">മുകളിലേക്ക്</span>
              </button>
              <button
                type="button"
                disabled={planeLane === 2 || phase !== 'cruise' || failed}
                onClick={() => {
                  sound.playClick();
                  setPlaneLane((l) => Math.min(2, l + 1) as 0 | 1 | 2);
                }}
                className="h-13 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white border-b-4 border-sky-900 font-black text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>▼</span>
                <span className="text-xs sm:text-sm">താഴേക്ക്</span>
              </button>
            </div>
          )}
        </div>

        {failed && (
          <GameDefeatBurstOverlay
            title="✈️ വിമാനയാത്ര തടസ്സപ്പെട്ടു!"
            reason={failedReason || 'കൊടുങ്കാറ്റ് ഒഴിവാക്കി എല്ലാ SIC കേന്ദ്രങ്ങളിലും എത്തൂ!'}
            scoreText={`✈️ ${visited.length}/${config.hubs.length} · ⭐ ${score}`}
            onRetry={resetLocal}
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * ENGINE B: SKSSF RESCUE HELICOPTER AIR-DROP GAME
 *   - Spinning-rotor rescue helicopter glides above lush hills & ground helipads
 *   - Drop relief kits (🪂) ONLY when aligned over a ground helipad & clear of bird/wind!
 *   - Uses 3 Shatterable Shields (GameShatterLives) + Animated Defeat!
 * ========================================================================== */
export const HelicopterRescueDropGame: React.FC<{
  config: HelicopterRescueDropConfig;
  onWin: () => void;
  resetSignal: number;
}> = ({ config, onWin, resetSignal }) => {
  const isFullscreen = useGameFullscreen();
  const [heliX, setHeliX] = useState(110);
  const [birdX, setBirdX] = useState(500);
  const [delivered, setDelivered] = useState<number[]>([]);
  const [dropping, setDropping] = useState<{ x: number; hit: boolean } | null>(null);
  const [shields, setShields] = useState(3);
  const [failedReason, setFailedReason] = useState<string | null>(null);
  const [msg, setMsg] = useState('🚁 ഹെലികോപ്റ്റർ ഗ്രൗണ്ട് ഹെലിപാഡിന് മുകളിൽ എത്തുമ്പോൾ (⛈️ ഇല്ലാത്തപ്പോൾ) “🪂 കിറ്റ് ഇറക്കൂ” അമർത്തൂ!');

  const dirRef = useRef(1);
  const birdDirRef = useRef(-1);
  const heliXRef = useRef(110);
  const birdXRef = useRef(500);

  const padXs = [125, 300, 475];
  const allDone = delivered.length === config.pads.length;
  const failed = Boolean(failedReason);

  const resetLocal = () => {
    heliXRef.current = 110;
    birdXRef.current = 500;
    dirRef.current = 1;
    birdDirRef.current = -1;
    setHeliX(110);
    setBirdX(500);
    setDelivered([]);
    setDropping(null);
    setShields(3);
    setFailedReason(null);
    setMsg('🚁 ഹെലികോപ്റ്റർ ഗ്രൗണ്ട് ഹെലിപാഡിന് മുകളിൽ എത്തുമ്പോൾ (⛈️ ഇല്ലാത്തപ്പോൾ) “🪂 കിറ്റ് ഇറക്കൂ” അമർത്തൂ!');
  };

  useEffect(() => {
    resetLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal, config.title]);

  useEffect(() => {
    if (allDone || failed || dropping) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      let nx = heliXRef.current + dirRef.current * 165 * dt;
      if (nx >= 525) {
        nx = 525;
        dirRef.current = -1;
      } else if (nx <= 75) {
        nx = 75;
        dirRef.current = 1;
      }
      heliXRef.current = nx;
      setHeliX(nx);

      let bx = birdXRef.current + birdDirRef.current * 115 * dt;
      if (bx >= 540) {
        bx = 540;
        birdDirRef.current = -1;
      } else if (bx <= 60) {
        bx = 60;
        birdDirRef.current = 1;
      }
      birdXRef.current = bx;
      setBirdX(bx);

      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [allDone, failed, dropping]);

  const hoveredPad = padXs.findIndex((px) => Math.abs(heliX - px) <= 46);
  const birdBlocking = Math.abs(heliX - birdX) <= 48;
  const overReadyPad = hoveredPad >= 0 && !delivered.includes(hoveredPad) && !birdBlocking;

  const handleDropKit = () => {
    sound.unlockAudio();
    if (allDone || failed || dropping) return;
    const cx = heliXRef.current;
    const hitBird = Math.abs(cx - birdXRef.current) <= 48;
    const targetIdx = padXs.findIndex((px) => Math.abs(cx - px) <= 46);
    const valid = !hitBird && targetIdx >= 0 && !delivered.includes(targetIdx);

    setDropping({ x: cx, hit: valid });
    if (valid) {
      sound.playPop();
      window.setTimeout(() => {
        setDropping(null);
        const nextDel = [...delivered, targetIdx];
        setDelivered(nextDel);
        const pad = config.pads[targetIdx];
        sound.playSuccess(nextDel.length);
        setMsg(`🪂 ${pad.note}`);
        narrator.speak(pad.note, pad.label);
        if (nextDel.length === config.pads.length) {
          onWin();
        }
      }, 520);
    } else {
      sound.playError();
      window.setTimeout(() => {
        setDropping(null);
        const rem = Math.max(0, shields - 1);
        setShields(rem);
        if (rem <= 0) {
          setFailedReason(
            hitBird
              ? '⛈️ കൊടുങ്കാറ്റിൽ പാരച്യൂട്ട് തട്ടി 3 ഷീൽഡും പൊട്ടി!'
              : '📦 ഹെലിപാഡിന് പുറത്ത് കിറ്റ് വീണു — 3 ഷീൽഡും തകർന്നു!'
          );
        } else {
          setMsg(
            hitBird
              ? `⛈️ കൊടുങ്കാറ്റ് കടന്നുപോകാൻ കാത്തിരിക്കൂ! ഇനി ${rem} ഷീൽഡ് ബാക്കി.`
              : `⚠️ ഹെലിപാഡിന് കൃത്യം മുകളിൽ എത്തുമ്പോൾ മാത്രം ഇറക്കൂ! ഇനി ${rem} ഷീൽഡ് ബാക്കി.`
          );
        }
      }, 480);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 bg-sky-100 shadow-inner select-none">
        {/* Top HUD */}
        <div className="bg-slate-950/92 px-3 py-2 flex items-center justify-between gap-2 border-b border-emerald-500/30">
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950 text-amber-300 text-xs font-extrabold tabular-nums">
            🚁 {delivered.length}/{config.pads.length} എയർഡ്രോപ്പ്
          </span>
          <GameShatterLives lives={shields} maxLives={3} compact />
        </div>

        <svg
          viewBox="0 0 600 250"
          className={`w-full block ${isFullscreen ? 'max-h-[62dvh] h-auto mx-auto' : 'h-auto'}`}
          role="img"
          aria-label={config.title}
        >
          <defs>
            <linearGradient id="heliSkyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="68%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#DCFCE7" />
            </linearGradient>
          </defs>
          <rect width="600" height="250" fill="url(#heliSkyGrad)" />
          {/* Lush Kerala Mountains & Ground */}
          <path d="M0 185 Q140 135 280 172 T600 162 L600 250 L0 250 Z" fill="#16A34A" opacity="0.85" />
          <rect x="0" y="196" width="600" height="54" fill="#15803D" />

          {/* Vertical Aim Beam */}
          {!allDone && !failed && !dropping && (
            <line
              x1={heliX}
              y1="72"
              x2={heliX}
              y2="198"
              stroke={overReadyPad ? '#22C55E' : birdBlocking ? '#F43F5E' : '#FACC15'}
              strokeWidth="2.5"
              strokeDasharray="6 6"
              opacity="0.75"
            />
          )}

          {/* Moving Mid-Air Wind/Storm Hazard */}
          {!allDone && (
            <g transform={`translate(${birdX}, 126)`}>
              <ellipse
                cx="0"
                cy="0"
                rx="30"
                ry="14"
                fill={birdBlocking ? '#991B1B' : '#334155'}
                stroke="#FDE047"
                strokeWidth="1.5"
              />
              <text x="0" y="6" textAnchor="middle" fontSize="18">
                ⛈️
              </text>
            </g>
          )}

          {/* Ground-Level Relief Helipads (Firmly on Earth!) */}
          {config.pads.map((pad, idx) => {
            const px = padXs[idx];
            const done = delivered.includes(idx);
            const active = hoveredPad === idx && !done && !birdBlocking;
            return (
              <g key={pad.id} transform={`translate(${px}, 208)`}>
                {/* Ground Helipad Slab */}
                <ellipse
                  cx="0"
                  cy="10"
                  rx="44"
                  ry="13"
                  fill={done ? '#065F46' : active ? '#FACC15' : '#475569'}
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                />
                <text x="0" y="14" textAnchor="middle" fill={active ? '#0F172A' : '#FFFFFF'} fontSize="10" fontWeight="900">
                  {done ? '✅' : 'H'}
                </text>
                {/* Ground Relief Camp / Building beside pad */}
                <rect x="-24" y="-30" width="48" height="30" rx="5" fill={done ? '#ECFDF5' : '#FFFFFF'} stroke="#0F172A" strokeWidth="1.8" />
                <polygon points="-28,-30 0,-46 28,-30" fill={done ? '#059669' : '#0284C7'} />
                <text x="0" y="-9" textAnchor="middle" fontSize="17">
                  {done ? '✅' : pad.emoji}
                </text>
              </g>
            );
          })}

          {/* Dropping Parachute Relief Kit */}
          {dropping && (
            <motion.g
              initial={{ x: dropping.x, y: 74 }}
              animate={{ x: dropping.x, y: 192 }}
              transition={{ duration: 0.48, ease: 'easeIn' }}
            >
              <path d="M-16 -10 Q0 -26 16 -10 Z" fill={dropping.hit ? '#FACC15' : '#F43F5E'} stroke="#0F172A" strokeWidth="1.5" />
              <line x1="-12" y1="-10" x2="-4" y2="4" stroke="#334155" strokeWidth="1.5" />
              <line x1="12" y1="-10" x2="4" y2="4" stroke="#334155" strokeWidth="1.5" />
              <text x="0" y="14" textAnchor="middle" fontSize="16">
                {config.kitEmoji}
              </text>
            </motion.g>
          )}

          {/* Animated Spinning-Rotor SKSSF Rescue Helicopter */}
          <g transform={`translate(${heliX}, 54) scale(${dirRef.current >= 0 ? 1 : -1}, 1)`}>
            {/* Tail Boom & Rear Rotor */}
            <rect x="-54" y="-4" width="32" height="7" rx="3" fill="#047857" stroke="#064E3B" strokeWidth="1.5" />
            <circle cx="-54" cy="-2" r="8" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 3" />
            {/* Cabin Body */}
            <ellipse cx="4" cy="0" rx="28" ry="16" fill="#059669" stroke="#064E3B" strokeWidth="2" />
            {/* Glass Cockpit */}
            <path d="M8 -12 Q28 -10 30 2 L8 2 Z" fill="#BAE6FD" stroke="#0C4A6E" strokeWidth="1.5" />
            {/* Yellow Rescue Stripe */}
            <rect x="-18" y="4" width="38" height="4.5" rx="2" fill="#FACC15" />
            {/* Landing Skids */}
            <line x1="-14" y1="16" x2="-14" y2="23" stroke="#1E293B" strokeWidth="2.5" />
            <line x1="16" y1="16" x2="16" y2="23" stroke="#1E293B" strokeWidth="2.5" />
            <line x1="-22" y1="23" x2="26" y2="23" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            {/* Top Rotor Mast & Spinning Blades */}
            <line x1="2" y1="-16" x2="2" y2="-24" stroke="#0F172A" strokeWidth="3.5" />
            <motion.rect
              x="-44"
              y="-26"
              width="92"
              height="4"
              rx="2"
              fill="#0F172A"
              animate={{ scaleX: [1, 0.2, 1] }}
              transition={{ duration: 0.14, repeat: Infinity }}
              style={{ transformOrigin: '2px -24px' }}
            />
          </g>
        </svg>

        {/* Ground Pad Name Strip + Status */}
        <div className="bg-slate-900/95 px-3 py-1.5 border-t border-emerald-500/30 flex flex-wrap items-center justify-center gap-2 text-[11px] font-extrabold">
          {config.pads.map((p, i) => (
            <span
              key={p.id}
              className={`px-2 py-0.5 rounded-md ${
                delivered.includes(i)
                  ? 'bg-emerald-700 text-white'
                  : hoveredPad === i
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {delivered.includes(i) ? '✅' : p.emoji} {p.shortLabel}
            </span>
          ))}
        </div>

        {/* Drop Action Button */}
        <div className="bg-slate-950 px-3 py-2.5 border-t border-emerald-500/30 flex flex-col items-center gap-1.5">
          <p className="text-[11px] font-bold text-emerald-100 text-center">{msg}</p>
          <motion.button
            type="button"
            disabled={allDone || failed || Boolean(dropping)}
            whileTap={{ scale: 0.93 }}
            onClick={handleDropKit}
            className={`w-full max-w-xs h-13 rounded-2xl border-2 border-b-4 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              allDone
                ? 'bg-emerald-600 text-white border-emerald-400 border-b-emerald-900'
                : overReadyPad
                ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 border-white border-b-amber-700 ring-4 ring-emerald-300'
                : birdBlocking
                ? 'bg-rose-700 text-white border-rose-400 border-b-rose-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-300 border-b-emerald-900'
            }`}
          >
            <span>{allDone ? '🎉 എല്ലാ കിറ്റുകളും എത്തി!' : birdBlocking ? '⛈️ കാറ്റ് മാറട്ടെ!' : `🪂 ${config.kitEmoji} കിറ്റ് ഇറക്കൂ!`}</span>
          </motion.button>
        </div>

        {failed && (
          <GameDefeatBurstOverlay
            title="🚁 എയർഡ്രോപ്പ് ദൗത്യം തകർന്നു!"
            reason={failedReason || 'ഹെലിപാഡിന് കൃത്യം മുകളിൽ എത്തുമ്പോൾ കിറ്റ് ഇറക്കൂ!'}
            scoreText={`🚁 ${delivered.length}/${config.pads.length}`}
            onRetry={resetLocal}
          />
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * ENGINE C: INTERACTIVE FLOATING BALLOON POP ARCADE
 *   - Colorful target balloons float upward alongside red spiky trap balloons
 *   - Tap correct SKSSF role/age/growth balloons to pop them; avoid red trap balloons!
 *   - Uses 3 Shatterable Shields (GameShatterLives) + Animated Defeat!
 * ========================================================================== */
interface ActiveBalloon {
  uid: number;
  x: number;
  y: number;
  speed: number;
  isDecoy: boolean;
  targetIdx?: number;
  emoji: string;
  label: string;
  color: string;
}

export const BalloonPopArcadeGame: React.FC<{
  config: BalloonPopArcadeConfig;
  onWin: () => void;
  resetSignal: number;
}> = ({ config, onWin, resetSignal }) => {
  const isFullscreen = useGameFullscreen();
  const [poppedIds, setPoppedIds] = useState<string[]>([]);
  const [balloons, setBalloons] = useState<ActiveBalloon[]>([]);
  const [shields, setShields] = useState(3);
  const [score, setScore] = useState(0);
  const [popBurst, setPopBurst] = useState<{ x: number; y: number; ok: boolean } | null>(null);
  const [failedReason, setFailedReason] = useState<string | null>(null);
  const [msg, setMsg] = useState('🎈 ശരിയായ പച്ച/സ്വർണ്ണ ബലൂണുകളിൽ തൊട്ട് പൊട്ടിക്കൂ! ചുവന്ന 💣 കെണി ബലൂൺ തൊടരുത്!');

  const uidRef = useRef(1);
  const poppedRef = useRef<string[]>([]);
  const shieldsRef = useRef(3);
  poppedRef.current = poppedIds;
  shieldsRef.current = shields;

  const allDone = poppedIds.length >= config.targets.length;
  const failed = Boolean(failedReason);

  const spawnInitialBalloons = (): ActiveBalloon[] => {
    const list: ActiveBalloon[] = [];
    config.targets.forEach((t, idx) => {
      list.push({
        uid: uidRef.current++,
        x: 110 + ((idx * 175) % 400),
        y: 235 + idx * 55,
        speed: 44 + (idx % 2) * 10,
        isDecoy: false,
        targetIdx: idx,
        emoji: t.emoji,
        label: t.label,
        color: t.color,
      });
    });
    config.decoys.slice(0, 2).forEach((d, idx) => {
      list.push({
        uid: uidRef.current++,
        x: 185 + idx * 210,
        y: 255 + idx * 65,
        speed: 52,
        isDecoy: true,
        emoji: d.emoji,
        label: d.label,
        color: '#DC2626',
      });
    });
    return list;
  };

  const resetLocal = () => {
    setPoppedIds([]);
    poppedRef.current = [];
    setShields(3);
    shieldsRef.current = 3;
    setScore(0);
    setPopBurst(null);
    setFailedReason(null);
    setBalloons(spawnInitialBalloons());
    setMsg('🎈 ശരിയായ ബലൂണുകളിൽ തൊട്ട് പൊട്ടിക്കൂ! ചുവന്ന 💣 കെണി ബലൂൺ തൊടരുത്!');
  };

  useEffect(() => {
    resetLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal, config.title]);

  useEffect(() => {
    if (allDone || failed) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      setBalloons((prev) =>
        prev.map((b) => {
          let ny = b.y - b.speed * dt;
          if (ny < -38) {
            ny = 275;
            return { ...b, y: ny, x: 90 + ((b.x + 135) % 420) };
          }
          return { ...b, y: ny };
        })
      );

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [allDone, failed]);

  const handlePop = (b: ActiveBalloon) => {
    sound.unlockAudio();
    if (allDone || failed) return;

    setPopBurst({ x: b.x, y: b.y, ok: !b.isDecoy });
    window.setTimeout(() => setPopBurst(null), 350);

    if (b.isDecoy) {
      sound.playError();
      const rem = Math.max(0, shieldsRef.current - 1);
      shieldsRef.current = rem;
      setShields(rem);
      setScore((sc) => Math.max(0, sc - 30));
      setBalloons((prev) => prev.map((item) => (item.uid === b.uid ? { ...item, y: 280 } : item)));
      if (rem <= 0) {
        setFailedReason('💣 ചുവന്ന കെണി ബലൂണിൽ 3 തവണ തൊട്ടു — ഷീൽഡുകൾ തകർന്നു!');
      } else {
        setMsg(`💥 അയ്യോ! “${b.label}” തെറ്റായ ബലൂൺ ആണ്! ഇനി ${rem} ഷീൽഡ് ബാക്കി.`);
      }
      return;
    }

    const target = typeof b.targetIdx === 'number' ? config.targets[b.targetIdx] : null;
    if (!target || poppedRef.current.includes(target.id)) return;

    const nextPopped = [...poppedRef.current, target.id];
    poppedRef.current = nextPopped;
    setPoppedIds(nextPopped);
    setScore((sc) => sc + 100);
    setBalloons((prev) => prev.filter((item) => item.uid !== b.uid));
    sound.playSuccess(nextPopped.length);
    setMsg(`🎉 ${target.note}`);
    narrator.speak(target.note, target.label);

    if (nextPopped.length >= config.targets.length) {
      onWin();
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 bg-sky-200 shadow-inner select-none">
        {/* Top HUD */}
        <div className="bg-slate-950/92 px-3 py-2 flex items-center justify-between gap-2 border-b border-amber-400/30">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-extrabold tabular-nums">
              🎈 {poppedIds.length}/{config.targets.length}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-200 text-xs font-extrabold tabular-nums">
              ⭐ {score}
            </span>
          </div>
          <GameShatterLives lives={shields} maxLives={3} compact />
        </div>

        {/* Sky Arena */}
        <svg
          viewBox="0 0 600 250"
          className={`w-full block ${isFullscreen ? 'max-h-[62dvh] h-auto mx-auto' : 'h-auto'}`}
          role="img"
          aria-label={config.title}
        >
          <defs>
            <linearGradient id="popSkyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="75%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#BBF7D0" />
            </linearGradient>
          </defs>
          <rect width="600" height="250" fill="url(#popSkyGrad)" />
          <path d="M0 222 Q150 202 300 222 T600 216 L600 250 L0 250 Z" fill="#16A34A" />

          {/* Floating Interactive Balloons */}
          {balloons.map((b) => (
            <g
              key={b.uid}
              transform={`translate(${b.x}, ${b.y})`}
              className="cursor-pointer"
              onClick={() => handlePop(b)}
            >
              {/* Balloon String */}
              <path d="M0 32 Q-6 45 2 58" fill="none" stroke="#475569" strokeWidth="1.8" />
              {/* Balloon Knot */}
              <polygon points="-4,32 4,32 0,27" fill={b.color} />
              {/* Balloon Body */}
              <ellipse
                cx="0"
                cy="0"
                rx="38"
                ry="30"
                fill={b.color}
                stroke={b.isDecoy ? '#FEF08A' : '#FFFFFF'}
                strokeWidth={b.isDecoy ? '2.5' : '2'}
                strokeDasharray={b.isDecoy ? '5 3' : undefined}
              />
              {/* Glossy Shine */}
              <ellipse cx="-14" cy="-11" rx="7" ry="4" fill="#FFFFFF" opacity="0.35" transform="rotate(-25 -14 -11)" />
              <text x="0" y="-2" textAnchor="middle" fontSize="18">
                {b.emoji}
              </text>
              <text x="0" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="900">
                {b.label.slice(0, 14)}
              </text>
            </g>
          ))}

          {/* Pop Burst Sparkle */}
          {popBurst && (
            <g transform={`translate(${popBurst.x}, ${popBurst.y})`}>
              <motion.circle
                cx="0"
                cy="0"
                r="28"
                fill="none"
                stroke={popBurst.ok ? '#FACC15' : '#F43F5E'}
                strokeWidth="4"
                initial={{ scale: 0.3, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.32 }}
              />
              <text x="0" y="6" textAnchor="middle" fontSize="22">
                {popBurst.ok ? '✨' : '💥'}
              </text>
            </g>
          )}
        </svg>

        {/* Bottom Progress Targets + Live Feedback */}
        <div className="bg-slate-950 px-3 py-2 border-t border-amber-400/30 space-y-1.5">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {config.targets.map((t) => {
              const done = poppedIds.includes(t.id);
              return (
                <span
                  key={t.id}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${
                    done ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-amber-200 border border-slate-700'
                  }`}
                >
                  {done ? '✅' : t.emoji} {t.label}
                </span>
              );
            })}
          </div>
          <p className="text-[11px] font-bold text-sky-100 text-center">{msg}</p>
        </div>

        {failed && (
          <GameDefeatBurstOverlay
            title="💥 ബലൂൺ ആർക്കേഡ് പരാജയപ്പെട്ടു!"
            reason={failedReason || 'ചുവന്ന കെണി ബലൂൺ ഒഴിവാക്കി ശരിയായ ബലൂണുകൾ പൊട്ടിക്കൂ!'}
            scoreText={`🎈 ${poppedIds.length}/${config.targets.length} · ⭐ ${score}`}
            onRetry={resetLocal}
          />
        )}
      </div>
    </div>
  );
};
