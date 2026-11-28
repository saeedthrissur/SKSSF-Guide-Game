import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, RotateCcw, Volume2, X } from 'lucide-react';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import { useGameStagePaused, useGameStagePortal } from './GameFullscreenShell';
import { OFFICIAL_WING_LOGOS } from '../data/officialLogos';
import eraMadrasaLanternImg from '../assets/images/era_madrasa_lantern_1794953898224.jpg';

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
 * ERA 1 (1921–1926): MALABAR DHOW HERITAGE RESCUE VOYAGE (3-Lane Action Sailing!)
 * - Starts immediately when blurred shell theme card closes (no double-start!)
 * - Double-lane monsoon storm & reef barriers + 35s monsoon deadline timer + 3 shields!
 * - Local session collection so Replay always works cleanly from 0/3!
 * ========================================================================== */
interface SeaObj {
  uid: number;
  lane: 0 | 1 | 2;
  y: number;
  kind: 'scroll' | 'storm' | 'reef';
}

const ERA1_TIME_LIMIT = 35;

const RealisticChestUnlockGame: React.FC<{
  artifacts: EraArtifactItem[];
  collectedIds: string[];
  onCollect: (art: EraArtifactItem) => void;
}> = ({ artifacts, collectedIds, onCollect }) => {
  const stagePaused = useGameStagePaused();
  const stagePortal = useGameStagePortal();

  const [boatLane, setBoatLane] = useState<0 | 1 | 2>(1);
  const [seaObjs, setSeaObjs] = useState<SeaObj[]>([]);
  const [sessionCollectedIds, setSessionCollectedIds] = useState<string[]>([]);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(ERA1_TIME_LIMIT);
  const [failed, setFailed] = useState<boolean>(false);
  const [failReason, setFailReason] = useState<string>('');
  const [won, setWon] = useState<boolean>(false);
  const [hitFlash, setHitFlash] = useState<boolean>(false);
  const [catchToast, setCatchToast] = useState<string | null>(null);
  const [activeArt, setActiveArt] = useState<EraArtifactItem | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>(
    '⛵ ഉരു ഇടത്തോട്ടും വലത്തോട്ടും നീക്കി 35 സെക്കൻഡിനുള്ളിൽ 3 ചരിത്ര ചുരുളുകൾ (📜) ശേഖരിക്കൂ! ⛈️ കൊടുങ്കാറ്റും 🪨 പാറയും ഒഴിവാക്കൂ.'
  );

  const laneRef = useRef<0 | 1 | 2>(1);
  const livesRef = useRef<number>(3);
  const sessionCollectedRef = useRef<string[]>([]);
  const uidRef = useRef<number>(1);
  const toastTimerRef = useRef<number | null>(null);

  laneRef.current = boatLane;
  livesRef.current = lives;
  sessionCollectedRef.current = sessionCollectedIds;

  const collectedCount = sessionCollectedIds.length;

  const steer = useCallback(
    (dir: -1 | 1) => {
      if (stagePaused || failed || won) return;
      sound.unlockAudio();
      sound.playClick();
      setBoatLane((prev) => {
        const next = Math.max(0, Math.min(2, prev + dir)) as 0 | 1 | 2;
        laneRef.current = next;
        return next;
      });
    },
    [stagePaused, failed, won]
  );

  // Keyboard steering
  useEffect(() => {
    if (stagePaused || failed || won) return;
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
  }, [stagePaused, failed, won, steer]);

  // 35-second Monsoon Deadline Countdown (pauses while blurred overlay is open)
  useEffect(() => {
    if (stagePaused || failed || won) return;
    const t = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(t);
          setFailed(true);
          setFailReason('⏱️ മൺസൂൺ കൊടുങ്കാറ്റ് ശക്തമായി! 35 സെക്കൻഡിനുള്ളിൽ 3 ചരിത്ര ചുരുളുകളും തീരത്തെത്തിക്കാനായില്ല.');
          sound.playError();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [stagePaused, failed, won]);

  // Main Sea Voyage Loop (faster waves + double-lane hazard barriers for real dodging!)
  useEffect(() => {
    if (stagePaused || failed || won) return;
    let tick = 0;

    const interval = window.setInterval(() => {
      tick += 1;

      setSeaObjs((prev) => {
        const nextList: SeaObj[] = [];
        for (const obj of prev) {
          const ny = obj.y + 4.3;
          if (ny >= 72 && ny <= 90 && obj.lane === laneRef.current) {
            if (obj.kind === 'scroll') {
              const missing = artifacts.filter((a) => !sessionCollectedRef.current.includes(a.id));
              const picked = missing[0];
              if (picked) {
                sound.playUnlock();
                const updatedIds = [...sessionCollectedRef.current, picked.id];
                sessionCollectedRef.current = updatedIds;
                setSessionCollectedIds(updatedIds);
                onCollect(picked);

                setCatchToast(`📜 കണ്ടെത്തി (${updatedIds.length}/${artifacts.length}): ${picked.label}`);
                if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
                toastTimerRef.current = window.setTimeout(() => setCatchToast(null), 2400);
                setStatusMsg(`📜 ചരിത്രരേഖ ശേഖരിച്ചു: ${picked.label}!`);

                if (updatedIds.length >= artifacts.length) {
                  setWon(true);
                  sound.playHoist();
                  stagePortal?.notifyStageWin(
                    '1921–1926 പ്രക്ഷുബ്ധ കാലത്തെ കൊടുങ്കാറ്റുകൾ മറികടന്ന് 3 സുവർണ്ണ ചരിത്രരേഖകളും സുരക്ഷിതമായി തീരത്തെത്തിച്ചു!'
                  );
                  return [];
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
                setFailReason('💥 കൊടുങ്കാറ്റിലും പാറക്കെട്ടിലും 3 തവണ ഉരു തട്ടി! ശ്രദ്ധിച്ച് ലെയിൻ മാറി തുഴയൂ.');
                return [];
              } else {
                setStatusMsg(
                  obj.kind === 'storm'
                    ? `⛈️ കൊടുങ്കാറ്റ് അടിച്ചു! ഉടൻ ലെയിൻ മാറ്റൂ (ബാക്കി കവചം: ${nextLives})`
                    : `🪨 പാറക്കെട്ടിൽ തട്ടി! സൂക്ഷിച്ച് തുഴയൂ (ബാക്കി കവചം: ${nextLives})`
                );
              }
            }
            continue;
          }
          if (ny < 104) {
            nextList.push({ ...obj, y: ny });
          }
        }

        // Spawn wave every 11 ticks (~0.66s): alternating double-hazard barriers & scroll waves
        if (tick % 11 === 0) {
          const isScrollWave = tick % 22 === 0;
          if (isScrollWave) {
            const scrollLane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
            const hazardLane = ((scrollLane + (Math.random() < 0.5 ? 1 : 2)) % 3) as 0 | 1 | 2;
            nextList.push({
              uid: uidRef.current++,
              lane: scrollLane,
              y: -8,
              kind: 'scroll',
            });
            nextList.push({
              uid: uidRef.current++,
              lane: hazardLane,
              y: -8,
              kind: Math.random() < 0.5 ? 'storm' : 'reef',
            });
          } else {
            // Double hazard barrier leaving 1 safe passage lane!
            const safeLane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
            ([0, 1, 2] as const).forEach((ln) => {
              if (ln !== safeLane) {
                nextList.push({
                  uid: uidRef.current++,
                  lane: ln,
                  y: -8,
                  kind: Math.random() < 0.55 ? 'storm' : 'reef',
                });
              }
            });
          }
        }
        return nextList;
      });
    }, 60);

    return () => window.clearInterval(interval);
  }, [stagePaused, failed, won, artifacts, onCollect, stagePortal]);

  const restartVoyage = () => {
    sound.unlockAudio();
    sound.playPop();
    livesRef.current = 3;
    laneRef.current = 1;
    sessionCollectedRef.current = [];
    setLives(3);
    setTimeLeft(ERA1_TIME_LIMIT);
    setBoatLane(1);
    setSeaObjs([]);
    setSessionCollectedIds([]);
    setFailed(false);
    setFailReason('');
    setWon(false);
    setCatchToast(null);
    setActiveArt(null);
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
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-lg text-xs font-black tabular-nums border ${
              timeLeft <= 10 && !won
                ? 'bg-rose-600 border-rose-300 text-white animate-pulse'
                : 'bg-slate-900/90 border-sky-400/40 text-amber-300'
            }`}
          >
            ⏱️ {timeLeft}s
          </span>
          <GameShatterLives lives={lives} maxLives={3} dark compact />
        </div>
      </div>

      {/* Animated Malabar Sea Stage */}
      <div
        className={`relative h-[265px] sm:h-[295px] rounded-2xl border-4 overflow-hidden select-none bg-gradient-to-b from-[#0c4a6e] via-[#0369a1] to-[#082f49] transition-colors ${
          hitFlash ? 'border-rose-400 ring-4 ring-rose-400/40' : 'border-amber-400/60'
        }`}
      >
        {/* In-stage Scroll Caught Toast (Never blocks boat or forces scrolling!) */}
        <AnimatePresence>
          {catchToast && (
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-2.5 inset-x-3 z-30 rounded-xl bg-emerald-950/92 border-2 border-amber-300 px-3 py-1.5 text-center text-xs font-extrabold text-amber-200 shadow-lg pointer-events-none"
            >
              {catchToast}
            </motion.div>
          )}
        </AnimatePresence>

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
        {!stagePaused && !failed && !won && (
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
            <ellipse cx="55" cy="108" rx="34" ry="8" fill="#BAE6FD" opacity="0.35" />
            <path d="M55 10 Q85 42 82 92 Q55 108 28 92 Q25 42 55 10 Z" fill="#78350F" stroke="#FDE68A" strokeWidth="2.5" />
            <path d="M55 18 Q76 45 74 86 Q55 98 36 86 Q34 45 55 18 Z" fill="#92400E" />
            <line x1="36" y1="52" x2="74" y2="52" stroke="#451A03" strokeWidth="2.5" />
            <line x1="36" y1="72" x2="74" y2="72" stroke="#451A03" strokeWidth="2.5" />
            <path d="M55 24 Q92 48 55 76 Q42 50 55 24 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
            <circle cx="55" cy="54" r="4" fill="#FBBF24" />
            <polygon points="55,10 74,16 55,22" fill="#16A34A" />
          </svg>
        </motion.div>

        {/* Fail Overlay (Portals directly centered onto blurred GameFullscreenShell!) */}
        {failed && !won && (
          <GameDefeatBurstOverlay
            title="⛵ 1921 കടൽയാത്ര പരാജയപ്പെട്ടു!"
            reason={failReason || 'കൊടുങ്കാറ്റിലും പാറക്കെട്ടിലും തട്ടി ഉരുവിന് ആഘാതമേറ്റു! വീണ്ടും ശ്രമിക്കാം.'}
            scoreText={`ശേഖരിച്ച ചരിത്രരേഖകൾ: ${collectedCount}/${artifacts.length}`}
            onRetry={restartVoyage}
          />
        )}
      </div>

      {/* Steering Controls */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={stagePaused || failed || won}
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
          disabled={stagePaused || failed || won}
          onClick={() => steer(1)}
          className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 text-sm font-extrabold border-b-4 border-amber-700 active:scale-95 transition-transform cursor-pointer"
        >
          വലത്തോട്ട് ➡️
        </button>
      </div>

      {/* Collected Historical Scroll Chips (Always Re-Readable!) */}
      <div className="grid grid-cols-3 gap-2">
        {artifacts.map((art) => {
          const found = collectedIds.includes(art.id) || sessionCollectedIds.includes(art.id);
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
 * ERA 2 (1925–1934): KOZHIKODE TOWN HALL ARCHIVE & OFFICIAL SKJU 1926 WAX SEAL
 * - Authenticate 6 historical documents (3 genuine 1925–1934 records + 3 forged records!)
 * - Live 8.5s urgency timer per document + 3 Shatterable Shields!
 * - Stamp authentic documents with embossed SKJU 1926 Crimson Wax Seal; reject forgeries!
 * - Failing (wrong stamp, rejecting genuine doc, or timeout x3) triggers GameDefeatBurstOverlay!
 * ========================================================================== */
interface SealDocumentCase {
  id: string;
  docNumber: string;
  yearTag: string;
  title: string;
  excerpt: string;
  isAuthentic: boolean;
  artifactIdx?: number;
  okFeedback: string;
  errFeedback: string;
}

const SEAL_DOCUMENT_CASES: SealDocumentCase[] = [
  {
    id: 'doc_1925_valiya_palli',
    docNumber: 'രേഖ #1925-A',
    yearTag: '1925 · കോഴിക്കോട്',
    title: 'വലിയ ജുമുഅത്ത് പള്ളി പ്രാരംഭ ആലോചനാ യോഗം',
    excerpt:
      'കോഴിക്കോട് വലിയ ജുമുഅത്ത് പള്ളിയിൽ പ്രമുഖ പണ്ഡിതന്മാർ സംഗമിച്ച് സുന്നത്ത് ജമാഅത്തിന്റെ സംരക്ഷണത്തിനായി ഒരു സംഘടന രൂപീകരിക്കാൻ പ്രാരംഭ സമിതി (മുശാവറ) നിശ്ചയിച്ചു.',
    isAuthentic: true,
    artifactIdx: 0,
    okFeedback: '🔖 സീൽ പതിച്ചു! 1925 പ്രാരംഭ യോഗരേഖ ഔദ്യോഗിക ആർക്കൈവിൽ ചേർത്തു!',
    errFeedback: '💥 തെറ്റ്! 1925 കോഴിക്കോട് വലിയ ജുമുഅത്ത് പള്ളി യോഗം യഥാർത്ഥ ചരിത്രരേഖയാണ് — സീൽ പതിക്കണം!',
  },
  {
    id: 'doc_fake_1942',
    docNumber: 'രേഖ #FAKE-42',
    yearTag: '1942 · തിരുവനന്തപുരം?!',
    title: '1942-ൽ തിരുവനന്തപുരത്ത് സമസ്ത രൂപീകരിച്ചു?!',
    excerpt:
      '1942 ഓഗസ്റ്റിൽ തിരുവനന്തപുരം സെക്രട്ടേറിയറ്റ് ഹാളിലാണ് സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ ആദ്യമായി രൂപീകരിച്ചതെന്ന് അവകാശപ്പെടുന്ന തെറ്റായ കുറിപ്പ്.',
    isAuthentic: false,
    okFeedback: '🛡️ വ്യാജ രേഖ തടഞ്ഞു! സമസ്ത രൂപീകരിച്ചത് 1926 ജൂൺ 26-ന് കോഴിക്കോട് ടൗൺ ഹാളിലാണ്!',
    errFeedback: '💥 വ്യാജ രേഖയിൽ സീൽ പതിച്ചു! സമസ്ത പിറന്നത് 1926-ൽ കോഴിക്കോടാണ്, 1942 തിരുവനന്തപുരത്തല്ല!',
  },
  {
    id: 'doc_1926_townhall',
    docNumber: 'രേഖ #1926-B',
    yearTag: '1926 ജൂൺ 26 · ടൗൺ ഹാൾ',
    title: 'സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ ഔദ്യോഗിക രൂപീകരണ രേഖ',
    excerpt:
      'കോഴിക്കോട് ടൗൺ ഹാളിൽ വരക്കൽ മുല്ലക്കോയ തങ്ങൾ (ഖ.സി.) പ്രഥമ പ്രസിഡന്റായും പാങ്ങിൽ അഹമ്മദ് കുട്ടി മുസ്ലിയാർ (ന.മ.) വൈസ് പ്രസിഡന്റായും സമസ്ത ഔദ്യോഗികമായി നിലവിൽ വന്നു.',
    isAuthentic: true,
    artifactIdx: 1,
    okFeedback: '🔖 SKJU 1926 സീൽ പതിച്ചു! ടൗൺ ഹാൾ ചരിത്ര പ്രഖ്യാപന രേഖ അംഗീകരിച്ചു!',
    errFeedback: '💥 തെറ്റ്! 1926 ജൂൺ 26 ടൗൺ ഹാൾ രേഖ സമസ്തയുടെ ചരിത്രപരമായ പിറവി രേഖയാണ് — സീൽ പതിക്കണം!',
  },
  {
    id: 'doc_fake_1960_reg',
    docNumber: 'രേഖ #FAKE-60',
    yearTag: '1960 · വ്യാജ രജിസ്റ്റർ?!',
    title: '1960-ലാണ് സമസ്ത ആദ്യമായി രജിസ്റ്റർ ചെയ്തത്?!',
    excerpt:
      'സൊസൈറ്റീസ് ആക്ട് പ്രകാരം 1960-ൽ മാത്രമാണ് സമസ്തയുടെ ഭരണഘടന രജിസ്റ്റർ ചെയ്തതെന്ന് തിരുത്തിയെഴുതിയ വ്യാജ പേപ്പർ.',
    isAuthentic: false,
    okFeedback: '🛡️ വ്യാജ രജിസ്റ്റർ നിരസിച്ചു! യഥാർത്ഥ രജിസ്ട്രേഷൻ 1934 നവംബർ 14-ന് (S1/1934-35) ആയിരുന്നു!',
    errFeedback: '💥 വ്യാജ രേഖയിൽ സീൽ പതിച്ചു! സമസ്ത രജിസ്റ്റർ ചെയ്തത് 1934 നവംബർ 14-നാണ്, 1960-ലല്ല!',
  },
  {
    id: 'doc_1934_registration',
    docNumber: 'രേഖ #1934-C',
    yearTag: '1934 നവംബർ 14 · Reg S1',
    title: 'സൊസൈറ്റീസ് ആക്ട് പ്രകാരം ഔദ്യോഗിക രജിസ്ട്രേഷൻ (S1/1934-35)',
    excerpt:
      '1934 നവംബർ 14-ന് കോഴിക്കോട് ജില്ലാ രജിസ്ട്രാർ ഓഫീസിൽ (S1/1934-35) സമസ്തയുടെ ഭരണഘടനയും ലക്ഷ്യങ്ങളും ഔദ്യോഗികമായി രജിസ്റ്റർ ചെയ്തു.',
    isAuthentic: true,
    artifactIdx: 2,
    okFeedback: '🔖 1934 ഔദ്യോഗിക രജിസ്ട്രേഷൻ രേഖയിൽ SKJU സീൽ പതിച്ചു!',
    errFeedback: '💥 തെറ്റ്! 1934 നവംബർ 14 (S1/1934-35) സമസ്തയുടെ യഥാർത്ഥ രജിസ്ട്രേഷൻ രേഖയാണ് — സീൽ പതിക്കണം!',
  },
  {
    id: 'doc_fake_no_scholars',
    docNumber: 'രേഖ #FAKE-99',
    yearTag: 'വ്യാജ പ്രമേയം?!',
    title: 'പണ്ഡിത മുശാവറ ഇല്ലാതെ ആദർശം മാറ്റാമെന്ന് പ്രമേയം?!',
    excerpt:
      'അഹ്ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ പണ്ഡിത പരമ്പരയുടെ അംഗീകാരമില്ലാതെ സ്വന്തം ഇഷ്ടപ്രകാരം മതവിധികൾ മാറ്റാമെന്ന് എഴുതിയ വ്യാജ പ്രമേയം.',
    isAuthentic: false,
    okFeedback: '🛡️ വ്യാജ പ്രമേയം നിരസിച്ചു! സമസ്തയുടെ അടിത്തറ 40 അംഗ പണ്ഡിത മുശാവറയുടെ നേതൃത്വമാണ്!',
    errFeedback: '💥 വ്യാജ പ്രമേയത്തിൽ സീൽ പതിച്ചു! പണ്ഡിത മുശാവറയും സുന്നത്ത് ജമാഅത്തുമാണ് സമസ്തയുടെ അടിത്തറ!',
  },
];

const DOC_TIME_LIMIT = 9.0;

function shuffleSealDocs(): SealDocumentCase[] {
  const copy = [...SEAL_DOCUMENT_CASES];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const HeritageStampPressGame: React.FC<{
  artifacts: EraArtifactItem[];
  collectedIds: string[];
  onCollect: (art: EraArtifactItem) => void;
}> = ({ artifacts, collectedIds, onCollect }) => {
  const stagePaused = useGameStagePaused();
  const stagePortal = useGameStagePortal();

  const [docs, setDocs] = useState<SealDocumentCase[]>(() => shuffleSealDocs());
  const [docIdx, setDocIdx] = useState<number>(0);
  const [verifiedCount, setVerifiedCount] = useState<number>(0);
  const [stampedArtifactIds, setStampedArtifactIds] = useState<string[]>([]);
  const [shields, setShields] = useState<number>(3);
  const [docTimeLeft, setDocTimeLeft] = useState<number>(DOC_TIME_LIMIT);
  const [stampAnim, setStampAnim] = useState<'seal' | 'reject' | null>(null);
  const [failed, setFailed] = useState<boolean>(false);
  const [failReason, setFailReason] = useState<string>('');
  const [won, setWon] = useState<boolean>(false);
  const [activeArt, setActiveArt] = useState<EraArtifactItem | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; tone: 'info' | 'ok' | 'err' }>({
    text: '📜 ചരിത്രരേഖ വായിച്ച് സത്യമാണെങ്കിൽ "🔖 സീൽ പതിക്കൂ", വ്യാജമാണെങ്കിൽ "🚫 നിരസിക്കൂ" അമർത്തൂ!',
    tone: 'info',
  });

  const currentDoc = docs[docIdx];

  const advanceToNext = useCallback(
    (nextVerified: number, nextDocIdx: number) => {
      if (nextVerified >= SEAL_DOCUMENT_CASES.length || nextDocIdx >= docs.length) {
        setWon(true);
        sound.playHoist();
        stagePortal?.notifyStageWin(
          '1925–1934 കാലത്തെ 3 യഥാർത്ഥ ചരിത്രരേഖകളിലും ഔദ്യോഗിക SKJU 1926 സീൽ പതിച്ച് വ്യാജരേഖകൾ തടഞ്ഞു!'
        );
        return;
      }
      setDocIdx(nextDocIdx);
      setDocTimeLeft(DOC_TIME_LIMIT);
    },
    [docs.length, stagePortal]
  );

  const damageShield = useCallback(
    (reasonMsg: string) => {
      sound.playError();
      setFeedback({ text: reasonMsg, tone: 'err' });
      setShields((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          setFailed(true);
          setFailReason(reasonMsg);
        } else {
          // Move to next document or reset timer on current doc if time ran out
          setDocTimeLeft(DOC_TIME_LIMIT);
        }
        return next;
      });
    },
    []
  );

  // Per-document countdown timer (pauses during blurred shell overlay or stamp animation)
  useEffect(() => {
    if (stagePaused || failed || won || stampAnim !== null) return;
    const interval = window.setInterval(() => {
      setDocTimeLeft((prev) => {
        const next = Math.max(0, +(prev - 0.1).toFixed(1));
        if (next <= 0) {
          window.clearInterval(interval);
          damageShield('⏱️ സമയം തീർന്നു! ചരിത്രരേഖ പരിശോധിക്കാതെ മേശയിൽ നിന്ന് നഷ്ടപ്പെട്ടു (-1 കവചം).');
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [stagePaused, failed, won, stampAnim, docIdx, damageShield]);

  const handleVerdict = (verdict: 'seal' | 'reject') => {
    if (stagePaused || failed || won || stampAnim !== null || !currentDoc) return;
    sound.unlockAudio();

    const isCorrect =
      (verdict === 'seal' && currentDoc.isAuthentic) ||
      (verdict === 'reject' && !currentDoc.isAuthentic);

    if (!isCorrect) {
      damageShield(currentDoc.errFeedback);
      return;
    }

    // Correct decision! Play tactile stamp animation
    setStampAnim(verdict);
    if (verdict === 'seal') {
      sound.playDrop();
    } else {
      sound.playSuccess(verifiedCount + 1);
    }

    if (currentDoc.isAuthentic && typeof currentDoc.artifactIdx === 'number') {
      const art = artifacts[currentDoc.artifactIdx];
      if (art) {
        onCollect(art);
        setStampedArtifactIds((prev) => (prev.includes(art.id) ? prev : [...prev, art.id]));
      }
    }

    const nextVerified = verifiedCount + 1;
    setVerifiedCount(nextVerified);
    setFeedback({ text: currentDoc.okFeedback, tone: 'ok' });

    window.setTimeout(() => {
      setStampAnim(null);
      advanceToNext(nextVerified, docIdx + 1);
    }, 520);
  };

  const resetGame = () => {
    sound.unlockAudio();
    sound.playPop();
    setDocs(shuffleSealDocs());
    setDocIdx(0);
    setVerifiedCount(0);
    setStampedArtifactIds([]);
    setShields(3);
    setDocTimeLeft(DOC_TIME_LIMIT);
    setStampAnim(null);
    setFailed(false);
    setFailReason('');
    setWon(false);
    setActiveArt(null);
    setFeedback({
      text: '📜 ചരിത്രരേഖ വായിച്ച് സത്യമാണെങ്കിൽ "🔖 സീൽ പതിക്കൂ", വ്യാജമാണെങ്കിൽ "🚫 നിരസിക്കൂ" അമർത്തൂ!',
      tone: 'info',
    });
  };

  const timePct = Math.max(0, Math.min(100, (docTimeLeft / DOC_TIME_LIMIT) * 100));

  return (
    <div className="p-3.5 sm:p-5 bg-gradient-to-b from-[#4c1024] via-[#6e1532] to-slate-950 text-white space-y-3">
      {/* Top Heritage Archive HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/35 border border-amber-400/35 rounded-xl px-3 py-2">
        <span className="text-xs font-extrabold text-amber-300 tabular-nums">
          🕌 1926 ചരിത്രരേഖ പരിശോധന · {verifiedCount}/{SEAL_DOCUMENT_CASES.length}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-black tabular-nums px-2 py-0.5 rounded-lg border ${
              docTimeLeft <= 2.5 && !won
                ? 'bg-rose-600 border-rose-300 text-white animate-pulse'
                : 'bg-amber-400/20 border-amber-400/40 text-amber-200'
            }`}
          >
            ⏱️ {docTimeLeft.toFixed(1)}s
          </span>
          <GameShatterLives lives={shields} maxLives={3} dark compact />
        </div>
      </div>

      {/* Live Per-Document Timer Bar */}
      <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden border border-amber-400/25">
        <div
          className={`h-full transition-all duration-100 ${
            timePct > 50 ? 'bg-amber-400' : timePct > 25 ? 'bg-orange-400' : 'bg-rose-500 animate-pulse'
          }`}
          style={{ width: `${timePct}%` }}
        />
      </div>

      {/* Active Historical Parchment Document on the 1926 Town Hall Desk */}
      {currentDoc && !won && (
        <div className="relative rounded-2xl border-2 border-amber-300/80 bg-[#FFFDF5] text-slate-900 p-4 sm:p-5 shadow-2xl space-y-2.5 min-h-[185px] overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-amber-200 pb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#8C1D40] text-amber-100 text-[10px] font-black tracking-wide">
              {currentDoc.docNumber}
            </span>
            <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md">
              📅 {currentDoc.yearTag}
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-black text-slate-950 leading-snug">
            📜 {currentDoc.title}
          </h4>

          <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
            {currentDoc.excerpt}
          </p>

          {/* Animated Wax Seal or Rejection Stamp Slam */}
          <AnimatePresence>
            {stampAnim === 'seal' && (
              <motion.div
                initial={{ scale: 2.4, opacity: 0, rotate: -28 }}
                animate={{ scale: 1, opacity: 1, rotate: -10 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-red-600 via-[#8C1D40] to-red-950 border-4 border-amber-300 shadow-xl flex flex-col items-center justify-center text-amber-200"
              >
                <span className="text-[10px] font-black leading-none">SKJU</span>
                <span className="text-xs font-black leading-tight">1926</span>
                <span className="text-[9px] font-extrabold">OFFICIAL ✓</span>
              </motion.div>
            )}
            {stampAnim === 'reject' && (
              <motion.div
                initial={{ scale: 2.2, opacity: 0, rotate: 18 }}
                animate={{ scale: 1, opacity: 1, rotate: 8 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 px-3 py-1.5 rounded-xl border-4 border-rose-600 bg-rose-100/95 text-rose-700 font-black text-xs shadow-xl"
              >
                🚫 വ്യാജരേഖ!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Stamp Controls */}
      <div className="grid grid-cols-2 gap-2.5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          disabled={stagePaused || failed || won || stampAnim !== null}
          onClick={() => handleVerdict('reject')}
          className="py-3 px-3 rounded-xl bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white border-b-4 border-rose-950 font-black text-xs sm:text-sm shadow-lg cursor-pointer"
        >
          🚫 വ്യാജരേഖ — നിരസിക്കൂ
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          disabled={stagePaused || failed || won || stampAnim !== null}
          onClick={() => handleVerdict('seal')}
          className="py-3 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 border-b-4 border-amber-700 font-black text-xs sm:text-sm shadow-lg cursor-pointer"
        >
          🔖 ഔദ്യോഗിക സീൽ പതിക്കൂ
        </motion.button>
      </div>

      {/* Feedback Banner */}
      <div
        className={`rounded-xl px-3 py-2 text-xs font-extrabold border text-center ${
          feedback.tone === 'err'
            ? 'bg-rose-950/90 border-rose-400/70 text-rose-200'
            : feedback.tone === 'ok'
            ? 'bg-emerald-950/85 border-emerald-400/60 text-emerald-200'
            : 'bg-black/35 border-amber-400/30 text-amber-200'
        }`}
      >
        {feedback.text}
      </div>

      {/* 3 Sealed Official Historical Archive Slots (Tap to Read Anytime!) */}
      <div className="grid grid-cols-3 gap-2">
        {artifacts.map((art) => {
          const stamped = collectedIds.includes(art.id) || stampedArtifactIds.includes(art.id);
          return (
            <button
              key={art.id}
              type="button"
              disabled={!stamped}
              onClick={() => {
                if (!stamped) return;
                sound.playClick();
                setActiveArt(art);
              }}
              className={`p-2 rounded-xl border-2 text-center transition-all ${
                stamped
                  ? 'bg-emerald-900/80 border-amber-300 text-white cursor-pointer hover:bg-emerald-800'
                  : 'bg-black/25 border-white/15 text-amber-200/50 cursor-default'
              }`}
            >
              <div className="text-lg">{stamped ? '🔖✅' : '🔒'}</div>
              <p className="text-[10px] font-extrabold mt-0.5 leading-tight line-clamp-2">
                {stamped ? art.label : '1926 ചരിത്രരേഖ'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Defeat Overlay (Portals directly centered onto blurred GameFullscreenShell!) */}
      {failed && !won && (
        <GameDefeatBurstOverlay
          title="🔖 ചരിത്രരേഖ പരിശോധന പരാജയപ്പെട്ടു!"
          reason={
            failReason ||
            'വ്യാജരേഖയിൽ സീൽ പതിച്ചതോ യഥാർത്ഥ ചരിത്രരേഖ തെറ്റി നിരസിച്ചതോ കാരണം കവചം തകർന്നു!'
          }
          scoreText={`പരിശോധിച്ച രേഖകൾ: ${verifiedCount}/${SEAL_DOCUMENT_CASES.length}`}
          onRetry={resetGame}
        />
      )}

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
        {/* Subtle Heritage Backdrop — bundled via Vite ES import */}
        <img
          src={eraMadrasaLanternImg}
          alt="മദ്രസാ വിളക്ക് വെളിച്ചം"
          className="absolute inset-0 w-full h-full object-cover opacity-55 pointer-events-none"
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
              <span className="text-2xl">{lit ? '🌟✅' : `${art.emoji} ✨`}</span>
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
          <GameDefeatBurstOverlay
            title="🪔 റാന്തൽ എണ്ണ തീർന്നു!"
            reason="സമയത്തിനുള്ളിൽ 3 ചരിത്ര ബോർഡുകളും വെളിച്ചം തെളിച്ച് കണ്ടെത്താൻ കഴിഞ്ഞില്ല."
            scoreText={`കണ്ടെത്തിയവ: ${litCount}/${artifacts.length}`}
            onRetry={handleRetry}
          />
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
 * ERA 4 (1989–1995): AUTHENTIC VINTAGE ROTARY DIAL LANDLINE TELEPHONE GAME
 *    - Hold any digit hole on the classic rotary wheel & spin clockwise until
 *      it hits the chrome finger stop (🛑), then release so it springs back!
 *    - Dial authentic historical years: 1989, 1992, 1995
 *    - 3 Hearts + Timer + Wrong-number feedback + Game Over & Replay!
 * ========================================================================== */
const ROTARY_STOP_ANGLE_DEG = 38; // Chrome finger stop at ~4:15 o'clock
const ROTARY_DIGITS: { digit: string; baseAngle: number; maxTravel: number }[] = [
  { digit: '1', baseAngle: -32, maxTravel: 70 },
  { digit: '2', baseAngle: -60, maxTravel: 98 },
  { digit: '3', baseAngle: -88, maxTravel: 126 },
  { digit: '4', baseAngle: -116, maxTravel: 154 },
  { digit: '5', baseAngle: -144, maxTravel: 182 },
  { digit: '6', baseAngle: -172, maxTravel: 210 },
  { digit: '7', baseAngle: -200, maxTravel: 238 },
  { digit: '8', baseAngle: -228, maxTravel: 266 },
  { digit: '9', baseAngle: -256, maxTravel: 294 },
  { digit: '0', baseAngle: -284, maxTravel: 322 },
];

const ERA4_CALL_MISSIONS = [
  {
    code: '1989',
    badge: 'കോൾ 1 · 1989',
    prompt: 'SKSSF പിറന്നതും ലാൻഡ്‌ഫോൺ ക്യാമ്പുകൾ തുടങ്ങിയതുമായ വർഷം ഡയൽ ചെയ്യൂ!',
    stationName: '📞 1989 · ലാൻഡ്‌ഫോൺ ക്യാമ്പ് ലൈൻ',
  },
  {
    code: '1992',
    badge: 'കോൾ 2 · 1992',
    prompt: 'സമാധാനത്തിന്റെയും ജനാധിപത്യത്തിന്റെയും ഉറച്ച നിലപാടെടുത്ത വർഷം ഡയൽ ചെയ്യൂ!',
    stationName: '🛡️ 1992 · സമാധാന സന്ദേശ ലൈൻ',
  },
  {
    code: '1995',
    badge: 'കോൾ 3 · 1995',
    prompt: 'കോഴിക്കോട് ടാഗോർ ഹാൾ ചരിത്ര പ്രഖ്യാപനം നടന്ന വർഷം ഡയൽ ചെയ്യൂ!',
    stationName: '🎤 1995 · ടാഗോർ ഹാൾ ലൈൻ',
  },
];

const VintageLandlineBroadcastGame: React.FC<{
  artifacts: EraArtifactItem[];
  collectedIds: string[];
  onCollect: (art: EraArtifactItem) => void;
}> = ({ artifacts, collectedIds, onCollect }) => {
  const dialSvgRef = useRef<SVGSVGElement | null>(null);

  // Pick first uncollected mission initially
  const firstPendingIdx = Math.max(
    0,
    artifacts.findIndex((a) => !collectedIds.includes(a.id))
  );
  const [missionIdx, setMissionIdx] = useState<number>(firstPendingIdx);
  const [enteredDigits, setEnteredDigits] = useState<string>('');
  const [dialRotation, setDialRotation] = useState<number>(0);
  const [draggingDigit, setDraggingDigit] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState<boolean>(false);
  const [hitStop, setHitStop] = useState<boolean>(false);

  const [hearts, setHearts] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [started, setStarted] = useState<boolean>(false);
  const [failedReason, setFailedReason] = useState<'hearts' | 'time' | null>(null);
  const [statusBanner, setStatusBanner] = useState<{
    tone: 'info' | 'ok' | 'err' | 'ring';
    text: string;
  }>({
    tone: 'info',
    text: '✨ നമ്പറിൽ വിരൽ അമർത്തിപ്പിടിച്ച് വലത്തോട്ട് സ്റ്റോപ്പ് (🛑) വരെ കറക്കി വിടൂ!',
  });
  const [connectedIdx, setConnectedIdx] = useState<number | null>(null);
  const [activeArt, setActiveArt] = useState<EraArtifactItem | null>(null);

  // Mutable drag refs so pointermove stays rock-solid with zero stale closures
  const dragStateRef = useRef<{
    active: boolean;
    digit: string;
    maxTravel: number;
    lastAngle: number;
    accumulated: number;
    lastTickStep: number;
    reachedStop: boolean;
  } | null>(null);

  const collectedCount = artifacts.filter((a) => collectedIds.includes(a.id)).length;
  const allHeard = collectedCount >= artifacts.length && artifacts.length > 0;
  const activeMission = ERA4_CALL_MISSIONS[missionIdx] || ERA4_CALL_MISSIONS[0];
  const targetCode = activeMission.code;
  const expectedNextDigit = targetCode[enteredDigits.length] || '';

  // Countdown timer per active mission
  useEffect(() => {
    if (!started || allHeard || failedReason || connectedIdx !== null) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFailedReason('time');
          sound.playError();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, allHeard, failedReason, connectedIdx]);

  const getPointerAngleDeg = (clientX: number, clientY: number): number => {
    const svg = dialSvgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  };

  const handleDigitRegistered = (digit: string) => {
    if (failedReason || connectedIdx !== null) return;
    const nextExpected = targetCode[enteredDigits.length];

    if (digit === nextExpected) {
      const nextEntered = enteredDigits + digit;
      setEnteredDigits(nextEntered);
      sound.playPop();

      if (nextEntered === targetCode) {
        // Call Connected!
        setConnectedIdx(missionIdx);
        sound.playSuccess(missionIdx + 1);
        setStatusBanner({
          tone: 'ring',
          text: `📞 റിംഗ്... റിംഗ്...! ${activeMission.stationName} കണക്റ്റ് ആയി!`,
        });
        const art = artifacts[missionIdx];
        if (art) {
          window.setTimeout(() => {
            setActiveArt(art);
            onCollect(art);
          }, 520);
        }
      } else {
        setStatusBanner({
          tone: 'ok',
          text: `✅ “${digit}” ഡയൽ ചെയ്തു! ഇനി അടുത്ത അക്കം (${targetCode[nextEntered.length]}) കറക്കൂ!`,
        });
      }
    } else {
      // Wrong digit -> lose a heart!
      sound.playError();
      const nextHearts = Math.max(0, hearts - 1);
      setHearts(nextHearts);
      if (nextHearts <= 0) {
        setFailedReason('hearts');
        setStatusBanner({
          tone: 'err',
          text: `📵 “${digit}” തെറ്റായ നമ്പർ! 3 തവണ തെറ്റിയതിനാൽ കോൾ കട്ടായി — ഗെയിം ഔട്ട്!`,
        });
      } else {
        setStatusBanner({
          tone: 'err',
          text: `❌ “${digit}” തെറ്റാണ്! ഇനി ഡയൽ ചെയ്യേണ്ട അക്കം “${nextExpected}” ആണ് (ബാക്കി കവചം: 🛡️ ${nextHearts})`,
        });
      }
    }
  };

  const animateSpringReturn = (fromDeg: number, committedDigit: string | null) => {
    setIsReturning(true);
    setDraggingDigit(null);
    setHitStop(false);
    setDialRotation(0);

    // Subtle mechanical spring-return ticks
    const tickCount = Math.max(2, Math.min(6, Math.round(fromDeg / 55)));
    for (let i = 1; i <= tickCount; i++) {
      window.setTimeout(() => {
        sound.playClick();
      }, i * 58);
    }

    window.setTimeout(() => {
      setIsReturning(false);
      if (committedDigit !== null) {
        handleDigitRegistered(committedDigit);
      }
    }, Math.max(220, tickCount * 62));
  };

  const handleHolePointerDown = (
    e: React.PointerEvent<SVGGElement>,
    item: { digit: string; baseAngle: number; maxTravel: number }
  ) => {
    if (failedReason || isReturning || connectedIdx !== null || allHeard) return;
    e.stopPropagation();
    e.preventDefault();
    sound.unlockAudio();
    sound.playClick();
    if (!started) setStarted(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore capture errors on synthetic events
    }

    const startAngle = getPointerAngleDeg(e.clientX, e.clientY);
    dragStateRef.current = {
      active: true,
      digit: item.digit,
      maxTravel: item.maxTravel,
      lastAngle: startAngle,
      accumulated: 0,
      lastTickStep: 0,
      reachedStop: false,
    };
    setDraggingDigit(item.digit);
    setHitStop(false);
    setDialRotation(0);
  };

  const handleHolePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    const st = dragStateRef.current;
    if (!st || !st.active) return;
    e.preventDefault();

    const curAngle = getPointerAngleDeg(e.clientX, e.clientY);
    let delta = curAngle - st.lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    st.lastAngle = curAngle;

    const nextAcc = Math.max(0, Math.min(st.maxTravel, st.accumulated + delta));
    st.accumulated = nextAcc;
    setDialRotation(nextAcc);

    const tickStep = Math.floor(nextAcc / 28);
    if (tickStep > st.lastTickStep) {
      st.lastTickStep = tickStep;
      sound.playClick();
    }

    if (nextAcc >= st.maxTravel - 12 && !st.reachedStop) {
      st.reachedStop = true;
      setHitStop(true);
      sound.playPop();
    }
  };

  const handleHolePointerUp = (e: React.PointerEvent<SVGGElement>) => {
    const st = dragStateRef.current;
    if (!st || !st.active) return;
    e.preventDefault();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release errors
    }

    const { digit, accumulated, maxTravel, reachedStop } = st;
    dragStateRef.current = null;

    if (reachedStop || accumulated >= maxTravel * 0.72) {
      animateSpringReturn(accumulated, digit);
    } else {
      setStatusBanner({
        tone: 'info',
        text: `✨ “${digit}” അമർത്തിപ്പിടിച്ച് വലത്തോട്ട് സ്റ്റോപ്പ് (🛑) വരെ കറക്കിയ ശേഷമേ വിരൽ വിടാവൂ!`,
      });
      animateSpringReturn(Math.max(20, accumulated), null);
    }
  };

  const handleSelectMission = (idx: number) => {
    if (isReturning) return;
    sound.playClick();
    const art = artifacts[idx];
    if (art && collectedIds.includes(art.id)) {
      // Allow re-listening to completed historical call directly
      setActiveArt(art);
      return;
    }
    setMissionIdx(idx);
    setEnteredDigits('');
    setConnectedIdx(null);
    setTimeLeft(45);
    setStatusBanner({
      tone: 'info',
      text: `☎️ ${ERA4_CALL_MISSIONS[idx]?.code} ഡയൽ ചെയ്യാൻ ഓരോ അക്കവും സ്റ്റോപ്പ് (🛑) വരെ കറക്കൂ!`,
    });
  };

  const handleCloseModal = () => {
    setActiveArt(null);
    if (connectedIdx !== null) {
      const nextUnheard = artifacts.findIndex(
        (a, i) => i !== connectedIdx && !collectedIds.includes(a.id)
      );
      setConnectedIdx(null);
      setEnteredDigits('');
      if (nextUnheard !== -1) {
        setMissionIdx(nextUnheard);
        setTimeLeft(45);
        setStatusBanner({
          tone: 'info',
          text: `അടുത്ത കോൾ: ${ERA4_CALL_MISSIONS[nextUnheard]?.code} ഡയൽ ചെയ്യാൻ നമ്പർ കറക്കൂ!`,
        });
      }
    }
  };

  const handleRetryGame = () => {
    sound.unlockAudio();
    sound.playPop();
    setHearts(3);
    setTimeLeft(45);
    setFailedReason(null);
    setEnteredDigits('');
    setConnectedIdx(null);
    setStarted(false);
    setDialRotation(0);
    setDraggingDigit(null);
    setHitStop(false);
    setStatusBanner({
      tone: 'info',
      text: '✨ നമ്പറിൽ വിരൽ അമർത്തിപ്പിടിച്ച് വലത്തോട്ട് സ്റ്റോപ്പ് (🛑) വരെ കറക്കി വിടൂ!',
    });
  };

  // Helper to get (x, y) in SVG 280x280 coords for a given angle in degrees
  const polarToXY = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: 140 + Math.cos(rad) * radius,
      y: 140 + Math.sin(rad) * radius,
    };
  };

  const stopPoint = polarToXY(ROTARY_STOP_ANGLE_DEG, 94);

  return (
    <div className="p-3.5 sm:p-5 bg-gradient-to-br from-stone-950 via-slate-900 to-emerald-950 text-white space-y-3.5">
      {/* Top Vintage Exchange HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/45 border border-amber-400/35 rounded-2xl px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-extrabold text-amber-300 tabular-nums">
            ☎️ കോളുകൾ: {collectedCount}/{artifacts.length}
          </span>
          <GameShatterLives lives={hearts} maxLives={3} dark compact />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-extrabold tabular-nums px-2.5 py-0.5 rounded-lg ${
              timeLeft <= 10 && !allHeard
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-amber-400/20 text-amber-200 border border-amber-400/35'
            }`}
          >
            ⏱️ {allHeard ? '✅' : `${timeLeft}s`}
          </span>
        </div>
      </div>

      {/* Mission Year Selector Strip */}
      <div className="grid grid-cols-3 gap-2">
        {artifacts.map((art, idx) => {
          const done = collectedIds.includes(art.id);
          const isCurrent = idx === missionIdx && !allHeard;
          const m = ERA4_CALL_MISSIONS[idx];
          return (
            <button
              key={art.id}
              type="button"
              onClick={() => handleSelectMission(idx)}
              className={`px-2.5 py-2 rounded-xl border-2 text-center transition-all cursor-pointer ${
                done
                  ? 'bg-emerald-900/75 border-emerald-400 text-emerald-100'
                  : isCurrent
                  ? 'bg-amber-400 text-slate-950 border-white shadow-md'
                  : 'bg-white/10 hover:bg-white/15 border-white/20 text-slate-200'
              }`}
            >
              <p className="text-xs sm:text-sm font-black font-mono tracking-wider">
                {done ? '✅' : art.emoji} {m?.code}
              </p>
              <p className="text-[10px] font-bold truncate opacity-90">
                {done ? 'കേട്ടു (വീണ്ടും കേൾക്കാം)' : isCurrent ? 'ഇപ്പോൾ വിളിക്കാം' : `കോൾ ${idx + 1}`}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Mission Target Prompt & LED Dial Display */}
      {!allHeard && !failedReason && (
        <div className="rounded-2xl bg-slate-950/85 border border-amber-400/40 p-3.5 space-y-2.5 text-center">
          <p className="text-xs sm:text-sm font-extrabold text-amber-200 leading-snug">
            {activeMission.prompt}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-bold text-slate-300">ഡയൽ ചെയ്യേണ്ട വർഷം:</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-mono text-sm sm:text-base font-black tracking-widest">
              {targetCode}
            </span>
          </div>

          {/* 4-Slot Retro Nixie/LED Digit Readout */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            {targetCode.split('').map((targetChar, i) => {
              const dialedChar = enteredDigits[i];
              const isNext = i === enteredDigits.length;
              return (
                <div
                  key={`${missionIdx}-${i}`}
                  className={`w-11 h-12 sm:w-12 sm:h-13 rounded-xl border-2 font-mono text-xl sm:text-2xl font-black flex items-center justify-center transition-all ${
                    dialedChar
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.45)]'
                      : isNext
                      ? 'bg-amber-950/70 border-amber-400 text-amber-300 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-slate-600'
                  }`}
                >
                  {dialedChar || (isNext ? targetChar : '•')}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Guidance Strip */}
      {!allHeard && !failedReason && (
        <div
          className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-extrabold text-center border ${
            statusBanner.tone === 'err'
              ? 'bg-rose-950/90 border-rose-400 text-rose-200'
              : statusBanner.tone === 'ok' || statusBanner.tone === 'ring'
              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
              : 'bg-amber-950/60 border-amber-400/40 text-amber-100'
          }`}
        >
          {statusBanner.text}
        </div>
      )}

      {/* Main Vintage Bakelite Rotary Telephone Console */}
      <div className="relative rounded-3xl bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-950 border-2 border-amber-500/45 p-4 sm:p-5 shadow-2xl overflow-hidden">
        {/* Vintage Bakelite Handset Cradle at Top */}
        <motion.div
          animate={
            connectedIdx !== null
              ? { y: -10, rotate: [-3, 3, -3, 3, 0] }
              : { y: 0, rotate: 0 }
          }
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-[260px] mb-2"
        >
          <svg viewBox="0 0 260 66" className="w-full h-auto drop-shadow-lg" aria-hidden="true">
            {/* Brass Cradle Posts */}
            <rect x="78" y="34" width="10" height="24" rx="4" fill="#D97706" />
            <rect x="172" y="34" width="10" height="24" rx="4" fill="#D97706" />
            {/* Classic Black Bakelite Handset */}
            <path
              d="M 24 44 C 24 14, 72 8, 130 8 C 188 8, 236 14, 236 44 C 236 56, 212 60, 198 54 C 188 49, 184 36, 172 32 C 156 27, 104 27, 88 32 C 76 36, 72 49, 62 54 C 48 60, 24 56, 24 44 Z"
              fill="url(#bakeliteGrad)"
              stroke="#57534E"
              strokeWidth="2.5"
            />
            {/* Handset Gloss Highlight */}
            <path
              d="M 55 18 Q 130 10 205 18"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Speaker & Mic Caps */}
            <ellipse cx="44" cy="46" rx="14" ry="7" fill="#0C0A09" stroke="#A8A29E" strokeWidth="1.2" />
            <ellipse cx="216" cy="46" rx="14" ry="7" fill="#0C0A09" stroke="#A8A29E" strokeWidth="1.2" />
            <defs>
              <linearGradient id="bakeliteGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#44403C" />
                <stop offset="50%" stopColor="#1C1917" />
                <stop offset="100%" stopColor="#0C0A09" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Interactive Rotary Wheel */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 select-none touch-none">
            <svg
              ref={dialSvgRef}
              viewBox="0 0 280 280"
              className="w-full h-full drop-shadow-[0_14px_24px_rgba(0,0,0,0.65)] touch-none"
              role="application"
              aria-label="പഴയകാല റോട്ടറി ഫോൺ ഡയൽ"
            >
              <defs>
                <radialGradient id="dialBezel" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="65%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#78350F" />
                </radialGradient>
                <radialGradient id="creamPlate" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="100%" stopColor="#FDE68A" />
                </radialGradient>
                <radialGradient id="wheelMetal" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
                  <stop offset="55%" stopColor="rgba(148,163,184,0.22)" />
                  <stop offset="100%" stopColor="rgba(15,23,42,0.58)" />
                </radialGradient>
              </defs>

              {/* Outer Brass Rim */}
              <circle cx="140" cy="140" r="134" fill="url(#dialBezel)" stroke="#FEF3C7" strokeWidth="2" />
              {/* Inner Dark Housing */}
              <circle cx="140" cy="140" r="124" fill="#1C1917" />
              {/* Static Vintage Cream Number Backing Plate */}
              <circle cx="140" cy="140" r="118" fill="url(#creamPlate)" stroke="#92400E" strokeWidth="2.5" />

              {/* Clockwise Spin Hint Arc (shows direction to spin!) */}
              {!allHeard && !failedReason && (
                <path
                  d="M 78 52 A 108 108 0 0 1 236 168"
                  fill="none"
                  stroke={draggingDigit ? '#059669' : '#D97706'}
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  opacity="0.55"
                />
              )}

              {/* FIXED DIGITS ON THE BACKING PLATE (Stay still while clear wheel rotates!) */}
              {ROTARY_DIGITS.map((item) => {
                const pos = polarToXY(item.baseAngle, 91);
                const isNextHint = !allHeard && !failedReason && item.digit === expectedNextDigit;
                return (
                  <g key={`plate-${item.digit}`} className="pointer-events-none">
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isNextHint ? 19 : 17}
                      fill={isNextHint ? '#FEF08A' : '#FFFFFF'}
                      stroke={isNextHint ? '#D97706' : '#78350F'}
                      strokeWidth={isNextHint ? 2.5 : 1.5}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 6}
                      textAnchor="middle"
                      fontSize="19"
                      fontWeight="900"
                      fill="#1C1917"
                    >
                      {item.digit}
                    </text>
                  </g>
                );
              })}

              {/* ROTATING CLEAR/METALLIC FINGER WHEEL (Turns smoothly clockwise with pointer!) */}
              <g
                style={{
                  transform: `rotate(${dialRotation}deg)`,
                  transformOrigin: '140px 140px',
                  transition: isReturning
                    ? 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)'
                    : 'none',
                }}
              >
                {/* Translucent Wheel Ring */}
                <circle
                  cx="140"
                  cy="140"
                  r="117"
                  fill="url(#wheelMetal)"
                  stroke="#E2E8F0"
                  strokeWidth="2.5"
                />

                {/* 10 Draggable Finger Holes */}
                {ROTARY_DIGITS.map((item) => {
                  const pos = polarToXY(item.baseAngle, 91);
                  const isBeingDragged = draggingDigit === item.digit;
                  const isNextTarget = !allHeard && !failedReason && item.digit === expectedNextDigit;
                  return (
                    <g
                      key={`hole-${item.digit}`}
                      onPointerDown={(e) => handleHolePointerDown(e, item)}
                      onPointerMove={handleHolePointerMove}
                      onPointerUp={handleHolePointerUp}
                      onPointerCancel={handleHolePointerUp}
                      className="cursor-grab active:cursor-grabbing"
                      style={{ touchAction: 'none' }}
                    >
                      {/* Generous invisible hit area for effortless touch dragging */}
                      <circle cx={pos.x} cy={pos.y} r="24" fill="transparent" />
                      {/* Visible metallic finger hole rim */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="19"
                        fill={
                          isBeingDragged
                            ? 'rgba(16, 185, 129, 0.28)'
                            : isNextTarget
                            ? 'rgba(250, 204, 21, 0.16)'
                            : 'rgba(255, 255, 255, 0.08)'
                        }
                        stroke={
                          isBeingDragged
                            ? '#34D399'
                            : isNextTarget
                            ? '#F59E0B'
                            : '#F8FAFC'
                        }
                        strokeWidth={isBeingDragged ? 4 : isNextTarget ? 3 : 2.2}
                      />
                    </g>
                  );
                })}
              </g>

              {/* STATIC CENTER MEDALLION CARD */}
              <circle cx="140" cy="140" r="56" fill="#0F172A" stroke="#F59E0B" strokeWidth="3.5" />
              <circle cx="140" cy="140" r="49" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.5" />
              <text
                x="140"
                y="128"
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fill="#065F46"
              >
                SKSSF · 1989
              </text>
              <text
                x="140"
                y="148"
                textAnchor="middle"
                fontSize="18"
                fontWeight="900"
                fill="#7C2D12"
              >
                {draggingDigit
                  ? hitStop
                    ? '🛑 വിടൂ!'
                    : `↻ ${draggingDigit}`
                  : allHeard
                  ? '✅ വിജയം'
                  : targetCode}
              </text>
              <text
                x="140"
                y="165"
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#475569"
              >
                {draggingDigit ? 'സ്റ്റോപ്പ് വരെ കറക്കൂ' : 'കറക്കി വിളിക്കൂ ☎️'}
              </text>

              {/* ICONIC CHROME FINGER STOP (Mounted Over the Wheel at 4:15 o'clock!) */}
              <g className="pointer-events-none">
                <line
                  x1={stopPoint.x - 16}
                  y1={stopPoint.y - 11}
                  x2={stopPoint.x + 28}
                  y2={stopPoint.y + 18}
                  stroke={hitStop ? '#10B981' : '#E2E8F0'}
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <line
                  x1={stopPoint.x - 14}
                  y1={stopPoint.y - 10}
                  x2={stopPoint.x + 24}
                  y2={stopPoint.y + 16}
                  stroke={hitStop ? '#6EE7B7' : '#94A3B8'}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle
                  cx={stopPoint.x + 20}
                  cy={stopPoint.y + 13}
                  r="11"
                  fill={hitStop ? '#10B981' : '#DC2626'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={stopPoint.x + 20}
                  y={stopPoint.y + 17}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="900"
                  fill="#FFFFFF"
                >
                  🛑
                </text>
              </g>
            </svg>
          </div>

          {/* Live Audio Wave Strip */}
          <div className="mt-2 flex items-end justify-center gap-1.5 h-6 w-40">
            {[0.4, 0.9, 0.65, 1, 0.75, 0.5, 0.85, 0.6].map((h, idx) => (
              <motion.span
                key={idx}
                animate={
                  connectedIdx !== null || draggingDigit !== null
                    ? { scaleY: [0.3, h, 0.45, h * 0.9] }
                    : { scaleY: 0.22 }
                }
                transition={{
                  repeat: Infinity,
                  duration: 0.55 + idx * 0.07,
                  ease: 'easeInOut',
                }}
                className={`w-2 h-full rounded-full origin-bottom ${
                  connectedIdx !== null ? 'bg-emerald-400' : 'bg-amber-400/75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* GAME OVER OVERLAY */}
        {failedReason && !allHeard && (
          <GameDefeatBurstOverlay
            title={
              failedReason === 'time'
                ? 'സമയം തീർന്നു — കോൾ കട്ടായി!'
                : '3 തവണ തെറ്റായ നമ്പർ — ഗെയിം ഔട്ട്!'
            }
            reason="പഴയ റോട്ടറി ഫോണിൽ നമ്പർ അമർത്തിപ്പിടിച്ച് വലത്തോട്ട് 🛑 സ്റ്റോപ്പ് വരെ കറക്കി വിട്ടാലാണ് അക്കം ഡയൽ ആവുക. വീണ്ടും ശ്രമിക്കൂ!"
            onRetry={handleRetryGame}
          />
        )}

        {/* ALL 3 CALLS COMPLETED VICTORY BANNER */}
        {allHeard && (
          <div className="mt-3 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 p-4 text-center space-y-2.5">
            <p className="text-sm sm:text-base font-black text-emerald-300">
              🎉 അടിപൊളി! 1989, 1992, 1995 ചരിത്ര കോളുകളെല്ലാം റോട്ടറി ഫോണിൽ കറക്കി വിളിച്ചു!
            </p>
            <p className="text-xs text-emerald-100">
              മുകളിലെ ഏത് വർഷത്തിൽ തൊട്ടും ആ ചരിത്ര സന്ദേശം വീണ്ടും കേൾക്കാം. ഇനി താഴെയുള്ള പാഠം വായിച്ച് ക്വിസ് തുറക്കൂ!
            </p>
          </div>
        )}
      </div>

      <InStageStoryModal
        artifact={activeArt}
        badgeText="🎙️ 1989–1995 ചരിത്ര ശബ്ദരേഖ (+15 XP)"
        onClose={handleCloseModal}
      />
    </div>
  );
};

/* ============================================================================
 * ERA 5 (1993 SKSBV, 1999 WADINOOR & GLOBAL LIGHT):
 * COMPLETELY REBUILT 60FPS GLOBAL LIGHT-BEAM & SATELLITE RELAY ARCADE GAME!
 * Aim the golden Wadinoor Lighthouse beam past drifting storm clouds to light
 * up the 3 orbiting global beacons (SKSBV/Wadinoor, Makkah-Madinah, SKICR/World).
 * ========================================================================== */
const GlobalFlightBeaconGame: React.FC<{
  artifacts: EraArtifactItem[];
  collectedIds: string[];
  onCollect: (art: EraArtifactItem) => void;
}> = ({ artifacts, collectedIds, onCollect }) => {
  const [aimAngle, setAimAngle] = useState<number>(0); // -62° (left) to +62° (right)
  const [pulse, setPulse] = useState<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [clouds, setClouds] = useState<{ id: number; x: number; y: number; dir: number; speed: number }[]>([
    { id: 1, x: 24, y: 46, dir: 1, speed: 26 },
    { id: 2, x: 74, y: 61, dir: -1, speed: 32 },
  ]);
  const [beaconPhase, setBeaconPhase] = useState<number>(0);
  const [shields, setShields] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [started, setStarted] = useState<boolean>(false);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [activeArt, setActiveArt] = useState<EraArtifactItem | null>(null);
  const [burstPos, setBurstPos] = useState<{ x: number; y: number; key: number } | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>(
    '🛰️ ആകാശത്ത് തൊട്ട്/വലിച്ചിട്ട് ലൈറ്റ് ബീം ഉന്നം വെക്കൂ — കാർമേഘങ്ങളെ (⛈️) ഒഴിവാക്കി 3 ആഗോള ബീക്കണുകളും പ്രകാശിപ്പിക്കൂ!'
  );
  const [isErr, setIsErr] = useState<boolean>(false);
  const [localLitIds, setLocalLitIds] = useState<string[]>(() =>
    artifacts.filter((a) => collectedIds.includes(a.id)).map((a) => a.id)
  );

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const pulseRef = useRef(pulse);
  pulseRef.current = pulse;
  const cloudsRef = useRef(clouds);
  cloudsRef.current = clouds;
  const phaseRef = useRef(beaconPhase);
  phaseRef.current = beaconPhase;
  const localLitRef = useRef(localLitIds);
  localLitRef.current = localLitIds;
  const shieldsRef = useRef(shields);
  shieldsRef.current = shields;

  const allVisited = artifacts.length > 0 && artifacts.every((a) => localLitIds.includes(a.id));
  const failed = Boolean(failReason) && !allVisited;

  const beaconConfigs = [
    {
      baseX: 20,
      baseY: 24,
      ampX: 8,
      city: '1993 SKSBV · 1999 വാദിനൂർ',
      logoSrc: OFFICIAL_WING_LOGOS.ibad.src,
    },
    {
      baseX: 50,
      baseY: 18,
      ampX: 9,
      city: 'മക്ക · മദീന (വിഖായ & SIC)',
      logoSrc: OFFICIAL_WING_LOGOS.viqaya.src,
    },
    {
      baseX: 80,
      baseY: 24,
      ampX: 8,
      city: 'ലോകമെങ്ങും (E-Learning & SKICR)',
      logoSrc: OFFICIAL_WING_LOGOS.skicr.src,
    },
  ];

  const getBeaconPos = (idx: number, phase: number) => {
    const cfg = beaconConfigs[idx] || beaconConfigs[0];
    const x = cfg.baseX + Math.sin(phase * 1.15 + idx * 2.1) * cfg.ampX;
    const y = cfg.baseY + Math.cos(phase * 1.5 + idx * 1.4) * 3.5;
    return { x, y };
  };

  const resetGame = () => {
    sound.playClick();
    setAimAngle(0);
    setPulse(null);
    setClouds([
      { id: 1, x: 24, y: 46, dir: 1, speed: 26 },
      { id: 2, x: 74, y: 61, dir: -1, speed: 32 },
    ]);
    setShields(3);
    setTimeLeft(45);
    setStarted(false);
    setFailReason(null);
    setActiveArt(null);
    setBurstPos(null);
    setLocalLitIds([]);
    setIsErr(false);
    setStatusMsg('🛰️ ആകാശത്ത് തൊട്ട്/വലിച്ചിട്ട് ലൈറ്റ് ബീം ഉന്നം വെക്കൂ — കാർമേഘങ്ങളെ (⛈️) ഒഴിവാക്കി 3 ആഗോള ബീക്കണുകളും പ്രകാശിപ്പിക്കൂ!');
  };

  // Countdown timer
  useEffect(() => {
    if (!started || allVisited || failed || activeArt) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          sound.playError();
          setFailReason('⏱️ പ്രകാശ സിഗ്നൽ സമയം കഴിഞ്ഞു! 45 സെക്കൻഡിനുള്ളിൽ 3 ആഗോള ബീക്കണുകളും തെളിയിക്കണം.');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, allVisited, failed, activeArt]);

  // 60fps animation loop for orbiting beacons, patrolling storm clouds, and light-beam pulse collision
  useEffect(() => {
    if (allVisited || failed || activeArt) return;
    let rafId = 0;
    let lastTs = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const nextPhase = phaseRef.current + dt;
      phaseRef.current = nextPhase;
      setBeaconPhase(nextPhase);

      const nextClouds = cloudsRef.current.map((c) => {
        let nx = c.x + c.dir * c.speed * dt;
        let ndir = c.dir;
        if (nx > 86) {
          nx = 86;
          ndir = -1;
        } else if (nx < 14) {
          nx = 14;
          ndir = 1;
        }
        return { ...c, x: nx, dir: ndir };
      });
      cloudsRef.current = nextClouds;
      setClouds(nextClouds);

      const p = pulseRef.current;
      if (p) {
        const nx = p.x + p.vx * dt;
        const ny = p.y + p.vy * dt;

        // Check storm cloud collision
        const hitCloud = nextClouds.find(
          (c) => Math.abs(c.x - nx) < 10.5 && Math.abs(c.y - ny) < 8.5
        );
        if (hitCloud) {
          pulseRef.current = null;
          setPulse(null);
          sound.playError();
          setIsErr(true);
          const nextShields = Math.max(0, shieldsRef.current - 1);
          shieldsRef.current = nextShields;
          setShields(nextShields);
          if (nextShields <= 0) {
            setFailReason('⛈️ കാർമേഘങ്ങൾ 3 തവണ പ്രകാശ ബീം തടഞ്ഞു — സാറ്റലൈറ്റ് കവചങ്ങൾ തകർന്നു!');
          } else {
            setStatusMsg(`⛈️ അയ്യോ! കാർമേഘം പ്രകാശ ബീം തടഞ്ഞു — വിടവ് നോക്കി അയക്കൂ! (ബാക്കി കവചങ്ങൾ: ${nextShields})`);
          }
        } else {
          // Check orbiting milestone beacon hit
          let hitBeaconIdx = -1;
          for (let i = 0; i < artifacts.length; i++) {
            const art = artifacts[i];
            if (localLitRef.current.includes(art.id)) continue;
            const pos = getBeaconPos(i, nextPhase);
            const dist = Math.hypot(pos.x - nx, pos.y - ny);
            if (dist < 11.5) {
              hitBeaconIdx = i;
              break;
            }
          }

          if (hitBeaconIdx >= 0) {
            const art = artifacts[hitBeaconIdx];
            const pos = getBeaconPos(hitBeaconIdx, nextPhase);
            pulseRef.current = null;
            setPulse(null);
            sound.playHoist();
            setIsErr(false);
            setBurstPos({ x: pos.x, y: pos.y, key: Date.now() });
            const nextLit = [...localLitRef.current, art.id];
            localLitRef.current = nextLit;
            setLocalLitIds(nextLit);
            setActiveArt(art);
            onCollect(art);
            setStatusMsg(`✨ മനോഹരം! “${art.label}” ആഗോള ബീക്കൺ പ്രകാശിച്ചു!`);
          } else if (nx < 0 || nx > 100 || ny < 0 || ny > 100) {
            pulseRef.current = null;
            setPulse(null);
            setStatusMsg('🌟 ലക്ഷ്യം തെറ്റി! ബീക്കൺ കൃത്യമായി ഉന്നം വെച്ച് വീണ്ടും പ്രകാശം അയക്കൂ.');
          } else {
            const updated = { ...p, x: nx, y: ny };
            pulseRef.current = updated;
            setPulse(updated);
          }
        }
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allVisited, failed, activeArt, artifacts]);

  const fireBeam = (overrideAngle?: number) => {
    sound.unlockAudio();
    if (allVisited || failed || activeArt || pulseRef.current) return;
    if (!started) setStarted(true);
    const angleDeg = typeof overrideAngle === 'number' ? overrideAngle : aimAngle;
    const rad = (angleDeg * Math.PI) / 180;
    const speed = 92; // % per second
    const newPulse = {
      x: 50,
      y: 86,
      vx: Math.sin(rad) * speed,
      vy: -Math.cos(rad) * speed,
    };
    pulseRef.current = newPulse;
    setPulse(newPulse);
    sound.playPop();
  };

  const aimFromPointer = (clientX: number, clientY: number, shouldFire: boolean) => {
    const box = arenaRef.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((clientX - box.left) / box.width) * 100;
    const py = ((clientY - box.top) / box.height) * 100;
    const dx = px - 50;
    const dy = Math.max(8, 86 - py);
    const rawDeg = (Math.atan2(dx, dy) * 180) / Math.PI;
    const clamped = Math.max(-62, Math.min(62, Math.round(rawDeg)));
    setAimAngle(clamped);
    if (shouldFire) {
      fireBeam(clamped);
    }
  };

  // Compute dashed aim guide endpoint
  const aimRad = (aimAngle * Math.PI) / 180;
  const guideX2 = 50 + Math.sin(aimRad) * 76;
  const guideY2 = 86 - Math.cos(aimRad) * 76;

  return (
    <div className="p-3.5 sm:p-4 bg-gradient-to-b from-slate-950 via-indigo-950 to-emerald-950 text-white space-y-3 select-none">
      {/* Top Arcade HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-sky-400/35 rounded-xl px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-extrabold tabular-nums">
            🌟 {localLitIds.length}/{artifacts.length}
          </span>
          <span
            className={`px-2 py-0.5 rounded-lg text-xs font-extrabold tabular-nums ${
              timeLeft <= 8 && started && !allVisited
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-sky-500/20 text-sky-200'
            }`}
          >
            ⏱️ {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <GameShatterLives lives={shields} maxLives={3} compact />
          {(started || localLitIds.length > 0 || failed) && (
            <button
              type="button"
              onClick={resetGame}
              aria-label="വീണ്ടും കളിക്കാം"
              title="വീണ്ടും കളിക്കാം"
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Night-to-Dawn Global Sky Arena */}
      <div
        ref={arenaRef}
        onPointerMove={(e) => {
          if (e.buttons === 1) aimFromPointer(e.clientX, e.clientY, false);
        }}
        onPointerDown={(e) => {
          aimFromPointer(e.clientX, e.clientY, true);
        }}
        className="relative h-64 sm:h-72 rounded-2xl border-2 border-sky-400/50 bg-gradient-to-b from-[#040B1C] via-[#0B2347] to-[#064E3B] overflow-hidden cursor-crosshair touch-none shadow-inner"
      >
        {/* Starfield & World Arc + Golden Aim Sightline */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          {/* World latitude arcs */}
          <ellipse cx="50" cy="96" rx="46" ry="30" fill="none" stroke="#34D399" strokeWidth="0.5" opacity="0.3" />
          <ellipse cx="50" cy="96" rx="34" ry="20" fill="none" stroke="#38BDF8" strokeWidth="0.45" opacity="0.25" />

          {/* Glowing network lines once beacons are lit */}
          {artifacts.map((art, i) => {
            if (!localLitIds.includes(art.id)) return null;
            const pos = getBeaconPos(i, beaconPhase);
            return (
              <line
                key={`net-${art.id}`}
                x1="50"
                y1="86"
                x2={pos.x}
                y2={pos.y}
                stroke="#FDE047"
                strokeWidth="0.9"
                strokeDasharray="2 1.5"
                opacity="0.75"
              />
            );
          })}

          {/* Live Laser Sightline from Wadinoor Lighthouse */}
          {!allVisited && !failed && (
            <line
              x1="50"
              y1="86"
              x2={guideX2}
              y2={guideY2}
              stroke="#FBBF24"
              strokeWidth="0.75"
              strokeDasharray="2.2 2"
              opacity="0.85"
            />
          )}
        </svg>

        {/* Orbiting Milestone Beacons (SKSBV/Wadinoor, Makkah/Madinah, Global SKICR) */}
        {artifacts.map((art, idx) => {
          const pos = getBeaconPos(idx, beaconPhase);
          const cfg = beaconConfigs[idx] || beaconConfigs[0];
          const lit = localLitIds.includes(art.id);
          return (
            <div
              key={art.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center"
            >
              <div
                className={`px-2 py-1.5 rounded-2xl border-2 flex items-center gap-1.5 shadow-lg transition-all ${
                  lit
                    ? 'bg-emerald-600/95 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.75)] scale-105'
                    : 'bg-slate-900/90 border-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.5)]'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
                  <img src={cfg.logoSrc} alt={cfg.city} className="max-h-6 w-full object-contain" />
                </div>
                <span className="text-base leading-none">{art.emoji}</span>
                {lit && <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />}
              </div>
              <span className="mt-1 px-1.5 py-0.5 rounded-md bg-slate-950/85 text-[9px] font-extrabold text-amber-200 whitespace-nowrap border border-white/15">
                {cfg.city}
              </span>
            </div>
          );
        })}

        {/* Patrolling Storm Clouds / Signal Jammers */}
        {!allVisited &&
          clouds.map((c) => (
            <div
              key={c.id}
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            >
              <div className="px-2.5 py-1 rounded-full bg-slate-800/95 border-2 border-rose-400/80 shadow-lg flex items-center gap-1">
                <span className="text-lg leading-none">⛈️</span>
                <span className="text-[9px] font-black text-rose-200">തടസ്സം</span>
              </div>
            </div>
          ))}

        {/* Flying Golden Light Pulse */}
        {pulse && (
          <div
            style={{ left: `${pulse.x}%`, top: `${pulse.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            <div className="w-6 h-6 rounded-full bg-amber-300 border-2 border-white shadow-[0_0_20px_#FDE047] flex items-center justify-center text-xs">
              ⚡
            </div>
          </div>
        )}

        {/* Golden Starburst on Hit */}
        {burstPos && (
          <motion.div
            key={burstPos.key}
            initial={{ scale: 0.4, opacity: 1 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.65 }}
            style={{ left: `${burstPos.x}%`, top: `${burstPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none text-3xl"
          >
            ✨
          </motion.div>
        )}

        {/* Bottom-Center Rotating Wadinoor 1999 Lighthouse Satellite Turret */}
        <div
          style={{ left: '50%', top: '88%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center"
        >
          <div
            style={{ transform: `rotate(${aimAngle}deg)` }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-t from-amber-500 to-yellow-300 border-2 border-white shadow-[0_0_18px_rgba(251,191,36,0.85)] flex items-center justify-center text-slate-950 font-black text-lg transition-transform duration-75"
          >
            📡
          </div>
          <span className="mt-0.5 px-2 py-0.5 rounded-md bg-emerald-900/95 border border-amber-300/60 text-[9px] font-black text-amber-200 whitespace-nowrap">
            1999 വാദിനൂർ · പ്രകാശ ഗോപുരം
          </span>
        </div>

        {/* Defeat Burst Overlay */}
        {failed && (
          <GameDefeatBurstOverlay
            title="⛈️ പ്രകാശ റിലേ തടസ്സപ്പെട്ടു!"
            reason={failReason || 'വീണ്ടും ശ്രമിക്കാം!'}
            scoreText={`തെളിയിച്ച ബീക്കണുകൾ: ${localLitIds.length}/${artifacts.length}`}
            onRetry={resetGame}
          />
        )}
      </div>

      {/* Tactile Aim & Fire Controls (Works alongside direct sky tap/drag!) */}
      {!allVisited && !failed ? (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setAimAngle((a) => Math.max(-62, a - 12));
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-sky-400/50 text-white text-sm font-black active:scale-95 cursor-pointer"
          >
            ◀ ഇടത്
          </button>
          <button
            type="button"
            onClick={() => fireBeam()}
            disabled={Boolean(pulse)}
            className="flex-1 max-w-xs px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 border-b-4 border-amber-700 text-xs sm:text-sm font-black shadow-md active:scale-95 cursor-pointer"
          >
            ⚡ പ്രകാശം അയക്കൂ!
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setAimAngle((a) => Math.min(62, a + 12));
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-sky-400/50 text-white text-sm font-black active:scale-95 cursor-pointer"
          >
            വലത് ▶
          </button>
        </div>
      ) : allVisited ? (
        <div className="rounded-xl bg-emerald-900/90 border border-amber-300 p-3 text-center space-y-2">
          <p className="text-xs sm:text-sm font-extrabold text-amber-300">
            🎉 മാഷാ അല്ലാഹ്! 1993 SKSBV, 1999 വാദിനൂർ, മക്ക-മദീന &amp; ആഗോള SKICR പ്രകാശ ശൃംഖല പൂർത്തിയായി!
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            <a
              href="https://www.sksbv.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white text-emerald-950 text-[11px] font-extrabold hover:bg-amber-200"
            >
              🔗 sksbv.in
            </a>
            <a
              href="https://www.samasthaelearning.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white text-emerald-950 text-[11px] font-extrabold hover:bg-amber-200"
            >
              🔗 samasthaelearning.com
            </a>
            <a
              href="https://www.youtube.com/@SKICROfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-extrabold hover:bg-rose-500"
            >
              ▶ @SKICROfficial
            </a>
          </div>
        </div>
      ) : null}

      <p
        className={`rounded-xl px-3 py-2 text-xs font-extrabold border text-center ${
          isErr
            ? 'bg-rose-950/80 border-rose-400 text-rose-200'
            : 'bg-white/10 border-sky-400/35 text-sky-100'
        }`}
      >
        {statusMsg}
      </p>

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
