import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, RotateCcw, Volume2, X } from 'lucide-react';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';

export interface EraArtifactItem {
  id: string;
  emoji: string;
  label: string;
  discovery: string;
  speech: string;
}

interface EraInteractiveStageProps {
  boardId: number;
  artifacts: EraArtifactItem[];
  collectedIds: string[];
  onCollect: (art: EraArtifactItem) => void;
}

/* ============================================================================
 * SHARED IN-PLACE STORY CARD (Appears right inside the game stage — zero scroll!)
 * ========================================================================== */
const InStageStoryModal: React.FC<{
  artifact: EraArtifactItem | null;
  badgeText: string;
  onClose: () => void;
}> = ({ artifact, badgeText, onClose }) => (
  <AnimatePresence>
    {artifact && (
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.22 }}
        className="mt-3 rounded-2xl border-2 border-emerald-500 bg-white shadow-xl p-4 sm:p-5 space-y-3 text-slate-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold text-emerald-700">{badgeText}</p>
            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
              {artifact.emoji} {artifact.label}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="അടയ്ക്കുക"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
          {artifact.discovery}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => narrator.speak(artifact.speech, artifact.label)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-950 text-xs font-extrabold hover:bg-amber-200"
          >
            <Volume2 className="w-3.5 h-3.5" /> വീണ്ടും കേൾക്കാം
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold"
          >
            മനസ്സിലായി ✓
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ============================================================================
 * ERA 1 (1921–1926): MALABAR DHOW HERITAGE RESCUE VOYAGE (3-Lane Sailing Game!)
 * Dodge storms & reefs while collecting the 3 golden 1921–1926 historical scrolls.
 * ========================================================================== */
interface SeaObj {
  uid: number;
  lane: 0 | 1 | 2;
  y: number;
  kind: 'scroll' | 'storm' | 'reef';
  artifactIdx?: number;
}

const RealisticChestUnlockGame: React.FC<{
  artifacts: EraArtifactItem[];
  collectedIds: string[];
  onCollect: (art: EraArtifactItem) => void;
}> = ({ artifacts, collectedIds, onCollect }) => {
  const [boatLane, setBoatLane] = useState<0 | 1 | 2>(1);
  const [seaObjs, setSeaObjs] = useState<SeaObj[]>([]);
  const [lives, setLives] = useState<number>(3);
  const [playing, setPlaying] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [hitFlash, setHitFlash] = useState<boolean>(false);
  const [activeArt, setActiveArt] = useState<EraArtifactItem | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>(
    '⛵ ഉരു ഇടത്തോട്ടും വലത്തോട്ടും നീക്കി 1921–1926 കാലത്തെ 3 സുവർണ്ണ ചരിത്ര ചുരുളുകൾ ശേഖരിക്കൂ! കൊടുങ്കാറ്റും പാറക്കെട്ടും ഒഴിവാക്കൂ.'
  );

  const laneRef = useRef<0 | 1 | 2>(1);
  const livesRef = useRef<number>(3);
  const collectedRef = useRef<string[]>(collectedIds);
  const activeArtRef = useRef<EraArtifactItem | null>(null);
  const uidRef = useRef<number>(1);

  laneRef.current = boatLane;
  livesRef.current = lives;
  collectedRef.current = collectedIds;
  activeArtRef.current = activeArt;

  const collectedCount = artifacts.filter((a) => collectedIds.includes(a.id)).length;
  const allCollected = collectedCount === artifacts.length;

  const steer = (dir: -1 | 1) => {
    if (!playing || failed || allCollected) return;
    sound.unlockAudio();
    sound.playClick();
    setBoatLane((prev) => {
      const next = Math.max(0, Math.min(2, prev + dir)) as 0 | 1 | 2;
      laneRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    if (!playing || failed || allCollected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        steer(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        steer(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing, failed, allCollected]);

  useEffect(() => {
    if (!playing || failed || allCollected) return;
    let tick = 0;

    const interval = window.setInterval(() => {
      // Pause movement gently while player reads a discovered scroll card
      if (activeArtRef.current) return;
      tick += 1;

      setSeaObjs((prev) => {
        const nextList: SeaObj[] = [];
        for (const obj of prev) {
          const ny = obj.y + 3.4;
          if (ny >= 72 && ny <= 90 && obj.lane === laneRef.current) {
            if (obj.kind === 'scroll') {
              const missing = artifacts.filter((a) => !collectedRef.current.includes(a.id));
              const picked = missing[0];
              if (picked) {
                sound.playUnlock();
                onCollect(picked);
                setActiveArt(picked);
                setStatusMsg(`📜 കണ്ടെത്തി: ${picked.label}!`);
                if (missing.length <= 1) {
                  setPlaying(false);
                  sound.playHoist();
                  setStatusMsg('🎉 മൂന്ന് ചരിത്ര ചുരുളുകളും സുരക്ഷിതമായി തീരത്തെത്തിച്ചു!');
                }
              }
            } else {
              const nextLives = Math.max(0, livesRef.current - 1);
              livesRef.current = nextLives;
              setLives(nextLives);
              sound.playError();
              setHitFlash(true);
              window.setTimeout(() => setHitFlash(false), 320);
              if (nextLives <= 0) {
                setFailed(true);
                setPlaying(false);
                setStatusMsg('💔 കൊടുങ്കാറ്റിലും പാറക്കെട്ടിലും ഉരു തട്ടി! വീണ്ടും ശ്രമിക്കാം.');
                return [];
              } else {
                setStatusMsg(
                  obj.kind === 'storm'
                    ? `⛈️ കൊടുങ്കാറ്റ് അടിച്ചു! ശ്രദ്ധിച്ച് തുഴയൂ (❤️ ${nextLives})`
                    : `🪨 പാറക്കെട്ടിൽ തട്ടി! ലെയിൻ മാറ്റൂ (❤️ ${nextLives})`
                );
              }
            }
            continue;
          }
          if (ny < 104) {
            nextList.push({ ...obj, y: ny });
          }
        }

        if (tick % 14 === 0) {
          const spawnLane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
          const r = Math.random();
          const kind: SeaObj['kind'] = r < 0.45 ? 'scroll' : r < 0.75 ? 'storm' : 'reef';
          nextList.push({
            uid: uidRef.current++,
            lane: spawnLane,
            y: -8,
            kind,
          });
        }
        return nextList;
      });
    }, 65);

    return () => window.clearInterval(interval);
  }, [playing, failed, allCollected, artifacts, onCollect]);

  const startVoyage = () => {
    sound.unlockAudio();
    sound.playPop();
    livesRef.current = 3;
    laneRef.current = 1;
    setLives(3);
    setBoatLane(1);
    setSeaObjs([]);
    setFailed(false);
    setActiveArt(null);
    setPlaying(true);
    setStatusMsg('⛵ യാത്ര തുടങ്ങി! സുവർണ്ണ ചുരുളുകൾ (📜) ശേഖരിക്കൂ, കൊടുങ്കാറ്റും (⛈️) പാറയും (🪨) ഒഴിവാക്കൂ!');
  };

  const lanePercent = boatLane === 0 ? '16.6%' : boatLane === 1 ? '50%' : '83.3%';

  return (
    <div className="p-3.5 sm:p-5 bg-gradient-to-b from-[#0b2545] via-[#134074] to-[#081c36] text-white space-y-3">
      {/* Top Voyage HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/35 border border-sky-400/35 rounded-xl px-3 py-2">
        <span className="text-xs font-extrabold text-amber-300 tabular-nums">
          ⛵ 1921–1926 ചരിത്ര കടൽയാത്ര · 📜 {collectedCount}/{artifacts.length}
        </span>
        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-rose-500/20 border border-rose-400/50">
          {Array.from({ length: 3 })
            .map((_, i) => (i < lives ? '❤️' : '💔'))
            .join('')}
        </span>
      </div>

      {/* Animated Malabar Sea Stage */}
      <div
        className={`relative h-[270px] sm:h-[300px] rounded-2xl border-4 overflow-hidden select-none bg-gradient-to-b from-[#0c4a6e] via-[#0369a1] to-[#082f49] transition-colors ${
          hitFlash ? 'border-rose-400 ring-4 ring-rose-400/40' : 'border-amber-400/60'
        }`}
      >
        {/* Subtle shimmering sea lane guides */}
        <div className="absolute inset-y-0 left-1/3 w-px border-l-2 border-dashed border-sky-200/25" />
        <div className="absolute inset-y-0 left-2/3 w-px border-l-2 border-dashed border-sky-200/25" />

        {/* Animated wave sparkles */}
        {[18, 48, 78].map((yPos, idx) => (
          <motion.div
            key={idx}
            animate={{ x: [-12, 12, -12] }}
            transition={{ duration: 2.8 + idx * 0.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ top: `${yPos}%` }}
            className="absolute inset-x-6 flex justify-between text-sky-200/20 text-xl pointer-events-none"
          >
            <span>〰️</span>
            <span>〰️</span>
            <span>〰️</span>
          </motion.div>
        ))}

        {/* Direct tap-lane controls */}
        {playing && !activeArt && (
          <div className="absolute inset-0 z-10 grid grid-cols-3">
            {([0, 1, 2] as const).map((tLane) => (
              <button
                key={tLane}
                type="button"
                aria-label={`കടൽപ്പാത ${tLane + 1}`}
                onClick={() => {
                  sound.unlockAudio();
                  sound.playClick();
                  laneRef.current = tLane;
                  setBoatLane(tLane);
                }}
                className="h-full w-full bg-transparent active:bg-white/10 cursor-pointer"
              />
            ))}
          </div>
        )}

        {/* Incoming Scrolls & Hazards */}
        {seaObjs.map((obj) => {
          const leftPos = obj.lane === 0 ? '16.6%' : obj.lane === 1 ? '50%' : '83.3%';
          return (
            <div
              key={obj.uid}
              style={{ left: leftPos, top: `${obj.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-lg ${
                obj.kind === 'scroll'
                  ? 'bg-amber-400 border-yellow-100 text-slate-950'
                  : obj.kind === 'storm'
                  ? 'bg-slate-800/95 border-sky-300 text-white'
                  : 'bg-rose-800/95 border-rose-300 text-white'
              }`}
            >
              <span className="text-2xl leading-none">
                {obj.kind === 'scroll' ? '📜' : obj.kind === 'storm' ? '⛈️' : '🪨'}
              </span>
            </div>
          );
        })}

        {/* Illustrated Malabar Wooden Uru / Dhow SVG */}
        <motion.div
          animate={{ left: lanePercent, rotate: [-2, 2, -2] }}
          transition={{
            left: { type: 'spring', stiffness: 360, damping: 26 },
            rotate: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ top: '80%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-20 sm:w-24"
        >
          <svg viewBox="0 0 110 120" className="w-full h-auto drop-shadow-[0_10px_14px_rgba(0,0,0,0.55)]">
            {/* Water wake */}
            <ellipse cx="55" cy="108" rx="34" ry="8" fill="#BAE6FD" opacity="0.35" />
            {/* Wooden Malabar Uru Hull */}
            <path d="M55 10 Q85 42 82 92 Q55 108 28 92 Q25 42 55 10 Z" fill="#78350F" stroke="#FDE68A" strokeWidth="2.5" />
            <path d="M55 18 Q76 45 74 86 Q55 98 36 86 Q34 45 55 18 Z" fill="#92400E" />
            {/* Cross wooden deck planks */}
            <line x1="36" y1="52" x2="74" y2="52" stroke="#451A03" strokeWidth="2.5" />
            <line x1="36" y1="72" x2="74" y2="72" stroke="#451A03" strokeWidth="2.5" />
            {/* Billowing White Sail */}
            <path d="M55 24 Q92 48 55 76 Q42 50 55 24 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
            {/* Mast & Green Heritage Pennant */}
            <circle cx="55" cy="54" r="4" fill="#FBBF24" />
            <polygon points="55,10 74,16 55,22" fill="#16A34A" />
          </svg>
        </motion.div>

        {/* Start Overlay */}
        {!playing && !allCollected && !failed && (
          <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3">
            <div className="text-4xl">⛵</div>
            <h4 className="text-base sm:text-lg font-extrabold text-amber-300">
              മലബാർ ഉരു — 1921–1926 ചരിത്ര രക്ഷായാത്ര
            </h4>
            <p className="text-xs font-semibold text-sky-100 max-w-sm leading-relaxed">
              1921-ന് ശേഷമുള്ള പ്രക്ഷുബ്ധ കാലത്തെ വെല്ലുവിളികളെ (⛈️, 🪨) മറികടന്ന്, സുവർണ്ണ ചരിത്ര ചുരുളുകൾ (📜) ശേഖരിച്ച് സുരക്ഷിതമായി തീരത്തെത്തിക്കൂ!
            </p>
            <button
              type="button"
              onClick={startVoyage}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold border-b-4 border-amber-700 shadow-lg cursor-pointer"
            >
              ⛵ കടൽയാത്ര തുടങ്ങാം!
            </button>
          </div>
        )}

        {/* Fail Overlay */}
        {failed && !allCollected && (
          <div className="absolute inset-0 z-30 bg-rose-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3">
            <div className="text-4xl">💔</div>
            <h4 className="text-base font-extrabold text-rose-200">ഉരുവിന് 3 തവണ ആഘാതമേറ്റു!</h4>
            <p className="text-xs font-semibold text-rose-100 max-w-xs">
              കൊടുങ്കാറ്റും പാറക്കെട്ടും ഒഴിവാക്കി ചരിത്ര ചുരുളുകൾ ശേഖരിക്കാൻ വീണ്ടും ശ്രമിക്കാം.
            </p>
            <button
              type="button"
              onClick={startVoyage}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold border-b-4 border-amber-700 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> വീണ്ടും തുഴയാം
            </button>
          </div>
        )}
      </div>

      {/* Steering Controls */}
      {!allCollected && (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={!playing || Boolean(activeArt)}
            onClick={() => steer(-1)}
            className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 text-sm font-extrabold border-b-4 border-amber-700 active:scale-95 transition-transform cursor-pointer"
          >
            ⬅️ ഇടത്തോട്ട്
          </button>
          <span className="text-[11px] font-bold text-sky-100 px-2 text-center">
            📜 ശേഖരിക്കൂ · ⛈️🪨 ഒഴിവാക്കൂ
          </span>
          <button
            type="button"
            disabled={!playing || Boolean(activeArt)}
            onClick={() => steer(1)}
            className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 text-sm font-extrabold border-b-4 border-amber-700 active:scale-95 transition-transform cursor-pointer"
          >
            വലത്തോട്ട് ➡️
          </button>
        </div>
      )}

      {/* Collected Historical Scroll Chips (Always Re-Readable!) */}
      <div className="grid grid-cols-3 gap-2">
        {artifacts.map((art) => {
          const found = collectedIds.includes(art.id);
          return (
            <button
              key={art.id}
              type="button"
              disabled={!found}
              onClick={() => {
                if (!found) return;
                sound.playClick();
                setActiveArt(art);
              }}
              className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                found
                  ? 'bg-emerald-900/80 border-emerald-400 text-white cursor-pointer hover:bg-emerald-800'
                  : 'bg-white/5 border-white/15 text-sky-200/60 cursor-default'
              }`}
            >
              <div className="text-xl">{found ? art.emoji : '🔒'}</div>
              <p className="text-[10px] font-extrabold mt-0.5 leading-tight line-clamp-2">
                {found ? art.label : 'ചരിത്ര ചുരുൾ'}
              </p>
            </button>
          );
        })}
      </div>

      <p className="text-xs font-bold text-amber-200 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-center">
        {statusMsg}
      </p>

      <InStageStoryModal
        artifact={activeArt}
        badgeText="📜 1921–1926 ചരിത്ര രേഖ (+15 XP)"
        onClose={() => setActiveArt(null)}
      />
    </div>
  );
};

/* ============================================================================
 * ERA 2 (1925–1934): KOZHIKODE TOWN HALL WAX SEAL & REGISTRATION STAMP PRESS
 * ========================================================================== */
const HeritageStampPressGame: React.FC<{
  artifacts: EraArtifactItem[];
  collectedIds: string[];
  onCollect: (art: EraArtifactItem) => void;
}> = ({ artifacts, collectedIds, onCollect }) => {
  const [stampingId, setStampingId] = useState<string | null>(null);
  const [activeArt, setActiveArt] = useState<EraArtifactItem | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(18);
  const [started, setStarted] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const allStamped = artifacts.every((a) => collectedIds.includes(a.id));

  useEffect(() => {
    if (!started || allStamped || failed) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFailed(true);
          sound.playError();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, allStamped, failed]);

  const handleStamp = (art: EraArtifactItem) => {
    if (failed) return;
    setStarted(true);
    setStampingId(art.id);
    sound.playDrop();
    window.setTimeout(() => {
      setStampingId(null);
      setActiveArt(art);
      onCollect(art);
    }, 320);
  };

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-b from-[#4c1024] via-[#6e1532] to-slate-950 text-white space-y-4">
      <div className="flex items-center justify-between gap-2 bg-black/30 border border-amber-400/30 rounded-xl px-3.5 py-2">
        <span className="text-xs font-extrabold text-amber-300 tabular-nums">
          🔖 {artifacts.filter((a) => collectedIds.includes(a.id)).length}/{artifacts.length}
        </span>
        <span className={`text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-lg ${timeLeft <= 5 ? 'bg-rose-600 text-white' : 'bg-amber-400/20 text-amber-200'}`}>
          ⏱️ {timeLeft}s
        </span>
      </div>

      {failed && !allStamped && (
        <div className="p-3 rounded-2xl bg-rose-950/90 border-2 border-rose-400 flex items-center justify-between gap-3">
          <span className="text-lg font-extrabold text-rose-200">⏰ 🔖</span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTimeLeft(18);
              setFailed(false);
              setStarted(false);
            }}
            aria-label="വീണ്ടും ശ്രമിക്കാം"
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-base font-extrabold border-b-4 border-amber-700"
          >
            🔄
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {artifacts.map((art) => {
          const stamped = collectedIds.includes(art.id);
          const isPressing = stampingId === art.id;
          return (
            <div
              key={art.id}
              className="relative rounded-2xl border-2 border-amber-300/60 bg-[#FFFDF5] text-slate-900 p-3 shadow-lg flex flex-col justify-between min-h-[135px]"
            >
              <div className="space-y-1.5 text-center">
                <span className="text-3xl block">{art.emoji}</span>
                <div className="space-y-1">
                  <div className="h-1.5 rounded bg-slate-200 w-full" />
                  <div className="h-1.5 rounded bg-slate-200 w-3/4 mx-auto" />
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleStamp(art)}
                  aria-label={art.label}
                  title={art.label}
                  className={`w-full py-2 rounded-xl font-extrabold text-lg flex items-center justify-center border-b-4 transition-all ${
                    stamped
                      ? 'bg-emerald-700 text-white border-emerald-950'
                      : 'bg-[#8C1D40] hover:bg-[#a3234b] text-amber-100 border-[#4d0d22]'
                  }`}
                >
                  {isPressing ? '💥' : stamped ? '✅' : '🔖'}
                </motion.button>
              </div>

              {/* Realistic Embossed Crimson Wax Seal */}
              <AnimatePresence>
                {(stamped || isPressing) && (
                  <motion.div
                    initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
                    animate={{ scale: 1, opacity: 1, rotate: -10 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    className="pointer-events-none absolute top-11 right-3 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 via-[#8C1D40] to-red-950 border-2 border-amber-300 shadow-md flex flex-col items-center justify-center text-amber-200"
                  >
                    <span className="text-[9px] font-extrabold leading-none">SKJU</span>
                    <span className="text-[10px] font-extrabold leading-tight">1926</span>
                    <span className="text-[8px] font-bold">✓</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <InStageStoryModal
        artifact={activeArt}
        badgeText="🔖 1925–1934 സീൽ പതിച്ച ചരിത്ര രേഖ (+15 XP)"
        onClose={() => setActiveArt(null)}
      />
    </div>
  );
};

/* ============================================================================
 * ERA 3 (1947–1989): PITCH-BLACK HURRICANE LANTERN DISCOVERY GAME
 * - Screen stays completely pitch black so nothing hidden can be seen!
 * - Moving the glowing lantern near a hidden board illuminates ONLY that board.
 * - Discovered boards stay permanently brightly lit even after lantern moves away!
 * - Includes lantern oil countdown so running out of oil fails & offers retry!
 * ========================================================================== */
const MadrasaLanternSweepGame: React.FC<{
  artifacts: EraArtifactItem[];
  collectedIds: string[];
  onCollect: (art: EraArtifactItem) => void;
}> = ({ artifacts, collectedIds, onCollect }) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [lanternPos, setLanternPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [activeArt, setActiveArt] = useState<EraArtifactItem | null>(null);
  const [oilLeft, setOilLeft] = useState<number>(36);
  const [started, setStarted] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);

  const targets = [
    { x: 22, y: 26 },
    { x: 54, y: 50 },
    { x: 78, y: 74 },
  ];

  const litCount = artifacts.filter((a) => collectedIds.includes(a.id)).length;
  const allLit = litCount >= artifacts.length;

  useEffect(() => {
    if (!started || allLit || failed) return;
    const timer = window.setInterval(() => {
      setOilLeft((prev) => {
        if (prev <= 1) {
          setFailed(true);
          sound.playError();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, allLit, failed]);

  const moveLanternTo = (clientX: number, clientY: number) => {
    if (failed) return;
    if (!started) setStarted(true);
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(7, Math.min(93, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((clientY - rect.top) / rect.height) * 100));
    setLanternPos({ x, y });
  };

  const nudgeLantern = (dx: number, dy: number) => {
    if (failed) return;
    if (!started) setStarted(true);
    sound.unlockAudio();
    setLanternPos((prev) => ({
      x: Math.max(7, Math.min(93, prev.x + dx)),
      y: Math.max(10, Math.min(90, prev.y + dy)),
    }));
  };

  const handleRetry = () => {
    sound.unlockAudio();
    sound.playPop();
    setOilLeft(36);
    setFailed(false);
    setStarted(false);
    setLanternPos({ x: 50, y: 50 });
  };

  return (
    <div className="p-3 sm:p-5 bg-black text-white space-y-3">
      <div className="flex items-center justify-between gap-2 bg-amber-500/15 border border-amber-400/35 rounded-xl px-3.5 py-2">
        <span className="text-xs font-extrabold text-amber-300 tabular-nums">
          🏮 {litCount}/{artifacts.length}
        </span>
        <span
          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg tabular-nums ${
            oilLeft <= 10 && !allLit
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-slate-900 text-amber-300 border border-amber-500/40'
          }`}
        >
          🪔 {allLit ? '✅' : `${oilLeft}s`}
        </span>
      </div>

      {/* Pitch-Black Stage: Completely dark except directly under Lantern beam and permanently lit discovered boards! */}
      <div
        ref={stageRef}
        onPointerMove={(e) => {
          if (e.buttons > 0 || e.pointerType === 'mouse') {
            moveLanternTo(e.clientX, e.clientY);
          }
        }}
        onPointerDown={(e) => moveLanternTo(e.clientX, e.clientY)}
        className="relative h-72 sm:h-80 rounded-2xl border-2 border-amber-500/50 overflow-hidden select-none touch-none bg-black cursor-none"
      >
        {/* Subtle Heritage Backdrop — COMPLETELY HIDDEN in pitch black outside lantern beam */}
        <img
          src="./src/assets/images/era_madrasa_lantern_1794953898224.jpg"
          alt="മദ്രസാ വിളക്ക് വെളിച്ചം"
          className="absolute inset-0 w-full h-full object-cover opacity-45 pointer-events-none"
          referrerPolicy="no-referrer"
        />

        {/* Pure Pitch-Black Darkness Layer with Warm Circular Cutout ONLY Around Lantern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle 105px at ${lanternPos.x}% ${lanternPos.y}%, rgba(254, 240, 138, 0.24) 0%, rgba(245, 158, 11, 0.08) 42%, rgba(0, 0, 0, 0.99) 76%, #000000 100%)`,
          }}
        />

        {/* Permanent Golden Light Pools for Already-Discovered Boards */}
        {artifacts.map((art, i) => {
          const lit = collectedIds.includes(art.id);
          if (!lit) return null;
          const pos = targets[i] || { x: 50, y: 50 };
          return (
            <div
              key={`glow-${art.id}`}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-56 h-36 rounded-full"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                background:
                  'radial-gradient(circle, rgba(254,240,138,0.45) 0%, rgba(245,158,11,0.16) 52%, rgba(0,0,0,0) 76%)',
              }}
            />
          );
        })}

        {/* Moving Hurricane Lantern Icon */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-30 text-3xl drop-shadow-[0_0_20px_rgba(251,191,36,0.98)]"
          style={{ left: `${lanternPos.x}%`, top: `${lanternPos.y}%` }}
        >
          🏮
        </div>

        {/* 3 Boards:
            - Undiscovered & Lantern far away: 100% INVISIBLE (opacity-0, pitch black!)
            - Undiscovered & Lantern brought close: Glows into view so user can tap!
            - Discovered (lit): Stays PERMANENTLY BRIGHTLY LIT! */}
        {artifacts.map((art, i) => {
          const pos = targets[i] || { x: 50, y: 50 };
          const lit = collectedIds.includes(art.id);
          const dist = Math.hypot(lanternPos.x - pos.x, lanternPos.y - pos.y);
          const near = dist < 21;
          const isVisible = lit || near;
          return (
            <motion.button
              key={art.id}
              type="button"
              whileTap={isVisible ? { scale: 0.94 } : undefined}
              onClick={(e) => {
                e.stopPropagation();
                if (failed || !isVisible) return;
                setLanternPos(pos);
                setActiveArt(art);
                onCollect(art);
              }}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              aria-label={art.label}
              title={art.label}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 px-3.5 py-2.5 rounded-2xl border-2 text-center transition-all duration-200 ${
                lit
                  ? 'opacity-100 bg-amber-300 text-slate-950 border-yellow-100 shadow-[0_0_30px_rgba(251,191,36,0.95)] cursor-pointer'
                  : near
                  ? 'opacity-100 bg-amber-400 text-slate-950 border-yellow-100 scale-110 shadow-[0_0_26px_rgba(251,191,36,0.85)] cursor-pointer'
                  : 'opacity-0 pointer-events-none bg-black border-transparent'
              }`}
            >
              <span className="text-2xl">{lit ? '🌟✅' : `${art.emoji} 👆`}</span>
            </motion.button>
          );
        })}

        {/* In-Screen Touch D-Pad (Bottom-Right) for Fullscreen / One-Hand Mobile Play */}
        {!failed && !allLit && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute bottom-2.5 right-2.5 z-30 flex items-center gap-1 bg-slate-900/80 border border-amber-400/40 rounded-xl p-1 backdrop-blur-xs cursor-auto"
          >
            <button
              type="button"
              onClick={() => nudgeLantern(-12, 0)}
              aria-label="ഇടത്തേക്ക്"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-200 text-sm font-extrabold"
            >
              ◀
            </button>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => nudgeLantern(0, -12)}
                aria-label="മുകളിലേക്ക്"
                className="w-8 h-7 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-200 text-xs font-extrabold"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => nudgeLantern(0, 12)}
                aria-label="താഴേക്ക്"
                className="w-8 h-7 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-200 text-xs font-extrabold"
              >
                ▼
              </button>
            </div>
            <button
              type="button"
              onClick={() => nudgeLantern(12, 0)}
              aria-label="വലത്തേക്ക്"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-200 text-sm font-extrabold"
            >
              ▶
            </button>
          </div>
        )}

        {/* Failure Overlay inside Pitch-Black Stage when Lantern Oil Runs Out */}
        {failed && !allLit && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-5 text-center space-y-3 cursor-auto"
          >
            <span className="text-4xl">🪔 ❌</span>
            <p className="text-sm font-extrabold text-rose-300 tabular-nums">
              {litCount}/{artifacts.length}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              aria-label="വീണ്ടും ശ്രമിക്കാം"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-base font-extrabold shadow-lg"
            >
              <RotateCcw className="w-4 h-4" /> 🔄
            </button>
          </div>
        )}
      </div>

      <InStageStoryModal
        artifact={activeArt}
        badgeText="🏮 1947–1989 വെളിച്ചത്തിന്റെ ചരിത്രം (+15 XP)"
        onClose={() => setActiveArt(null)}
      />
    </div>
  );
};

/* ============================================================================
 * ERA 4 (1989–1995): VINTAGE LANDLINE DIAL & TAGORE HALL MICROPHONE CONSOLE
 * ========================================================================== */
const VintageLandlineBroadcastGame: React.FC<{
  artifacts: EraArtifactItem[];
  collectedIds: string[];
  onCollect: (art: EraArtifactItem) => void;
}> = ({ artifacts, collectedIds, onCollect }) => {
  const [dialAngle, setDialAngle] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [activeArt, setActiveArt] = useState<EraArtifactItem | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [started, setStarted] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const allHeard = artifacts.every((a) => collectedIds.includes(a.id));

  useEffect(() => {
    if (!started || allHeard || failed) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFailed(true);
          sound.playError();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, allHeard, failed]);

  const dialCodes = ['1989', '1992', '1995'];

  const handleDialStation = (idx: number) => {
    if (failed) return;
    const art = artifacts[idx];
    if (!art) return;
    setStarted(true);
    sound.playPop();
    setDialAngle((prev) => prev + 120);
    setActiveIdx(idx);
    window.setTimeout(() => {
      setActiveArt(art);
      onCollect(art);
    }, 260);
  };

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-cyan-950 to-emerald-950 text-white space-y-4">
      <div className="flex items-center justify-between gap-2 bg-black/35 border border-cyan-400/35 rounded-xl px-3.5 py-2">
        <span className="text-xs font-extrabold text-cyan-200 tabular-nums">
          ☎️ {artifacts.filter((a) => collectedIds.includes(a.id)).length}/{artifacts.length}
        </span>
        <span className={`text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-lg ${timeLeft <= 5 ? 'bg-rose-600 text-white' : 'bg-cyan-400/20 text-cyan-200'}`}>
          ⏱️ {timeLeft}s
        </span>
      </div>
      {failed && !allHeard && (
        <div className="p-3 rounded-2xl bg-rose-950/90 border-2 border-rose-400 flex items-center justify-between gap-3">
          <span className="text-lg font-extrabold text-rose-200">📵 ⏰</span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTimeLeft(20);
              setFailed(false);
              setStarted(false);
            }}
            aria-label="വീണ്ടും ശ്രമിക്കാം"
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-base font-extrabold border-b-4 border-amber-700"
          >
            🔄
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5 rounded-2xl bg-slate-950/80 border-2 border-cyan-500/40 p-4 flex flex-col items-center space-y-3">
          <motion.div
            animate={{ rotate: dialAngle }}
            transition={{ type: 'spring', stiffness: 130, damping: 14 }}
            className="w-28 h-28 rounded-full border-4 border-amber-400 bg-gradient-to-br from-slate-800 to-slate-950 relative flex items-center justify-center shadow-lg"
          >
            {[0, 1, 2, 3, 4, 5].map((n) => {
              const ang = (n * 60 * Math.PI) / 180;
              const x = 44 + Math.cos(ang) * 34;
              const y = 44 + Math.sin(ang) * 34;
              return (
                <span
                  key={n}
                  style={{ left: `${x}px`, top: `${y}px` }}
                  className="absolute w-4 h-4 rounded-full bg-amber-100 text-slate-950 text-[9px] font-extrabold flex items-center justify-center"
                >
                  {n + 1}
                </span>
              );
            })}
            <span className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 text-sm font-extrabold flex items-center justify-center">
              📞
            </span>
          </motion.div>

          <div className="flex items-end justify-center gap-1.5 h-8 w-full px-4">
            {[0.4, 0.9, 0.65, 1, 0.75, 0.5, 0.85, 0.6].map((h, idx) => (
              <motion.span
                key={idx}
                animate={
                  activeIdx !== null
                    ? { scaleY: [0.3, h, 0.45, h * 0.9] }
                    : { scaleY: 0.25 }
                }
                transition={{
                  repeat: Infinity,
                  duration: 0.65 + idx * 0.08,
                  ease: 'easeInOut',
                }}
                className="w-2.5 h-full rounded-full bg-emerald-400 origin-bottom"
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-7 grid grid-cols-3 md:grid-cols-1 gap-2">
          {artifacts.map((art, idx) => {
            const heard = collectedIds.includes(art.id);
            const active = activeIdx === idx;
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => handleDialStation(idx)}
                aria-label={art.label}
                title={art.label}
                className={`w-full p-3 rounded-xl border-2 flex items-center justify-between gap-2 transition-all ${
                  active
                    ? 'bg-amber-400 text-slate-950 border-white shadow-md'
                    : heard
                    ? 'bg-emerald-900/75 text-white border-emerald-400'
                    : 'bg-white/10 hover:bg-white/15 text-white border-cyan-400/40'
                }`}
              >
                <span className="px-2 py-0.5 rounded-lg bg-slate-950/80 text-amber-300 font-mono text-xs font-extrabold">
                  #{dialCodes[idx] || idx + 1}
                </span>
                <span className="text-2xl">{art.emoji}</span>
                <span className="text-lg shrink-0">
                  {heard ? '✅' : '📞'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <InStageStoryModal
        artifact={activeArt}
        badgeText="🎙️ 1989–1995 ചരിത്ര ശബ്ദരേഖ (+15 XP)"
        onClose={() => setActiveArt(null)}
      />
    </div>
  );
};

/* ============================================================================
 * ERA 5 (1993–GLOBAL): INTERACTIVE GLOBAL FLIGHT ROUTE RADAR PILOT
 * ========================================================================== */
const GlobalFlightBeaconGame: React.FC<{
  artifacts: EraArtifactItem[];
  collectedIds: string[];
  onCollect: (art: EraArtifactItem) => void;
}> = ({ artifacts, collectedIds, onCollect }) => {
  const [planeStop, setPlaneStop] = useState<number>(0);
  const [activeArt, setActiveArt] = useState<EraArtifactItem | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [started, setStarted] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const allVisited = artifacts.every((a) => collectedIds.includes(a.id));

  useEffect(() => {
    if (!started || allVisited || failed) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFailed(true);
          sound.playError();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, allVisited, failed]);

  const stops = [
    { x: 18, y: 66, city: 'കേരളം (SKSBV / വാദിനൂർ)' },
    { x: 50, y: 36, city: 'മക്ക · മദീന (വിഖായ & SIC)' },
    { x: 82, y: 54, city: 'ലോകമെങ്ങും (E-Learning & SKICR)' },
  ];

  const flyToStop = (idx: number) => {
    if (failed) return;
    const art = artifacts[idx];
    if (!art) return;
    setStarted(true);
    setPlaneStop(idx);
    sound.playHoist();
    window.setTimeout(() => {
      setActiveArt(art);
      onCollect(art);
    }, 320);
  };

  const currentPos = stops[planeStop] || stops[0];

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-950 via-indigo-950 to-emerald-950 text-white space-y-4">
      <div className="flex items-center justify-between gap-2 bg-white/10 border border-sky-400/35 rounded-xl px-3.5 py-2">
        <span className="text-xs font-extrabold text-amber-300 tabular-nums">
          ✈️ {artifacts.filter((a) => collectedIds.includes(a.id)).length}/{artifacts.length}
        </span>
        <span className={`text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-lg ${timeLeft <= 5 ? 'bg-rose-600 text-white' : 'bg-sky-400/20 text-sky-200'}`}>
          ⏱️ {timeLeft}s
        </span>
      </div>

      {failed && !allVisited && (
        <div className="p-3 rounded-2xl bg-rose-950/90 border-2 border-rose-400 flex items-center justify-between gap-3">
          <span className="text-lg font-extrabold text-rose-200">⛽ ⏰</span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTimeLeft(20);
              setFailed(false);
              setStarted(false);
            }}
            aria-label="വീണ്ടും ശ്രമിക്കാം"
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-base font-extrabold border-b-4 border-amber-700"
          >
            🔄
          </button>
        </div>
      )}

      {/* Global Radar & Animated Flight Path */}
      <div className="relative h-60 sm:h-64 rounded-2xl border-2 border-sky-400/40 bg-slate-950/90 overflow-hidden">
        <svg viewBox="0 0 600 240" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <ellipse cx="300" cy="120" rx="250" ry="95" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.22" />
          <ellipse cx="300" cy="120" rx="140" ry="95" fill="none" stroke="#34D399" strokeWidth="1" opacity="0.22" />
          <line x1="30" y1="120" x2="570" y2="120" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" />
          <path
            d="M 108 158 Q 200 60 300 86 Q 410 45 492 130"
            fill="none"
            stroke="#FBBF24"
            strokeWidth="3.5"
            strokeDasharray="8 6"
          />
        </svg>

        <motion.div
          animate={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 16 }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-30 text-3xl drop-shadow-[0_0_14px_rgba(56,189,248,0.9)]"
        >
          ✈️
        </motion.div>

        {artifacts.map((art, idx) => {
          const st = stops[idx] || stops[0];
          const visited = collectedIds.includes(art.id);
          return (
            <button
              key={art.id}
              type="button"
              onClick={() => flyToStop(idx)}
              aria-label={art.label}
              title={art.label}
              style={{ left: `${st.x}%`, top: `${st.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 px-3 py-2 rounded-2xl border-2 flex items-center gap-1.5 transition-all ${
                visited
                  ? 'bg-emerald-600 text-white border-emerald-200 shadow-lg'
                  : 'bg-sky-900/95 hover:bg-sky-800 text-white border-amber-400 shadow-md'
              }`}
            >
              <span className="text-2xl">{art.emoji}</span>
              {visited ? <CheckCircle2 className="w-4 h-4 text-amber-300" /> : <span className="text-sm">✈️</span>}
            </button>
          );
        })}
      </div>

      <InStageStoryModal
        artifact={activeArt}
        badgeText="🌍 1993–ആഗോള സേവന ചരിത്രം (+15 XP)"
        onClose={() => setActiveArt(null)}
      />
    </div>
  );
};

/* ============================================================================
 * UNIFIED DISPATCHER FOR LEVEL 1'S 5 HISTORICAL ERAS
 * ========================================================================== */
export const EraInteractiveStage: React.FC<EraInteractiveStageProps> = ({
  boardId,
  artifacts,
  collectedIds,
  onCollect,
}) => {
  switch (boardId) {
    case 1:
      return (
        <RealisticChestUnlockGame
          artifacts={artifacts}
          collectedIds={collectedIds}
          onCollect={onCollect}
        />
      );
    case 2:
      return (
        <HeritageStampPressGame
          artifacts={artifacts}
          collectedIds={collectedIds}
          onCollect={onCollect}
        />
      );
    case 3:
      return (
        <MadrasaLanternSweepGame
          artifacts={artifacts}
          collectedIds={collectedIds}
          onCollect={onCollect}
        />
      );
    case 4:
      return (
        <VintageLandlineBroadcastGame
          artifacts={artifacts}
          collectedIds={collectedIds}
          onCollect={onCollect}
        />
      );
    default:
      return (
        <GlobalFlightBeaconGame
          artifacts={artifacts}
          collectedIds={collectedIds}
          onCollect={onCollect}
        />
      );
  }
};
