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
 * ERA 1 (1921–1924): REALISTIC MECHANICAL WOODEN CHEST + BRASS KEY UNLOCK
 * (The ONLY chest in the entire app — with real brass key turn, padlock pop,
 *  3D lid rotation, golden light beams & rising historical parchment scrolls!)
 * ========================================================================== */
const RealisticChestUnlockGame: React.FC<{
  artifacts: EraArtifactItem[];
  collectedIds: string[];
  onCollect: (art: EraArtifactItem) => void;
}> = ({ artifacts, collectedIds, onCollect }) => {
  const [keyProgress, setKeyProgress] = useState<number>(
    collectedIds.some((id) => artifacts.some((a) => a.id === id)) ? 100 : 0
  );
  const [chestOpen, setChestOpen] = useState<boolean>(
    collectedIds.some((id) => artifacts.some((a) => a.id === id))
  );
  const [unlocking, setUnlocking] = useState(false);
  const [activeArt, setActiveArt] = useState<EraArtifactItem | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(24);
  const [started, setStarted] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const allCollected = artifacts.every((a) => collectedIds.includes(a.id));

  useEffect(() => {
    if (!started || allCollected || failed) return;
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
  }, [started, allCollected, failed]);

  const resetEra1 = () => {
    sound.playClick();
    setTimeLeft(24);
    setFailed(false);
    setStarted(false);
    setChestOpen(false);
    setKeyProgress(0);
  };

  const triggerChestUnlock = () => {
    if (chestOpen || unlocking || failed) return;
    setStarted(true);
    setUnlocking(true);
    setKeyProgress(100);
    sound.playClick();
    window.setTimeout(() => {
      sound.playUnlock();
      setChestOpen(true);
      setUnlocking(false);
    }, 450);
  };

  const handleSliderChange = (val: number) => {
    if (failed) return;
    setStarted(true);
    setKeyProgress(val);
    if (val >= 92 && !chestOpen) {
      triggerChestUnlock();
    }
  };

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-b from-[#1f130a] via-[#2d1b0e] to-[#120a05] text-white space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/35 border border-amber-400/35 rounded-xl px-3.5 py-2">
        <span className="text-xs font-extrabold text-amber-200">
          ⏳ 24 സെക്കൻഡിനുള്ളിൽ പെട്ടി തുറന്ന് 3 രേഖകളും വായിക്കൂ!
        </span>
        <span className={`text-xs font-extrabold tabular-nums px-2.5 py-0.5 rounded-lg ${timeLeft <= 6 ? 'bg-rose-600 text-white' : 'bg-amber-400/20 text-amber-200'}`}>
          ⏱️ {timeLeft}s
        </span>
      </div>
      {failed && !allCollected && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-400 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-rose-200">⏰ സമയം കഴിഞ്ഞു! ചരിത്ര പെട്ടി പൂട്ടിപ്പോയി!</p>
            <p className="text-xs font-semibold text-rose-100">വേഗത്തിൽ താക്കോൽ തിരിച്ച് 3 രേഖകളും പരിശോധിക്കാൻ വീണ്ടും ശ്രമിക്കാം.</p>
          </div>
          <button type="button" onClick={resetEra1} className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold border-b-4 border-amber-700">
            🔄 വീണ്ടും ശ്രമിക്കാം
          </button>
        </div>
      )}
      {/* Realistic 3D-Shaded Wooden Chest SVG Stage */}
      <div className="relative rounded-2xl border border-amber-500/35 bg-gradient-to-b from-amber-950/70 via-[#2a170b] to-[#120904] p-4 sm:p-5 overflow-hidden">
        {/* Ambient golden glow rays when open */}
        <AnimatePresence>
          {chestOpen && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0.3 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none absolute inset-x-0 top-0 h-56 origin-bottom bg-gradient-to-t from-amber-300/35 via-yellow-200/15 to-transparent"
              style={{ clipPath: 'polygon(18% 100%, 82% 100%, 100% 0%, 0% 0%)' }}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-col items-center">
          {/* Mechanical Wooden Chest SVG with 3D Lid Rotation & Padlock Animation */}
          <svg
            viewBox="0 0 360 210"
            className="w-full max-w-sm h-auto drop-shadow-[0_14px_20px_rgba(0,0,0,0.65)]"
            role="img"
            aria-label="ചരിത്ര രേഖാ പെട്ടി"
          >
            <defs>
              <linearGradient id="woodDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B4513" />
                <stop offset="50%" stopColor="#5C2D0C" />
                <stop offset="100%" stopColor="#3B1A06" />
              </linearGradient>
              <linearGradient id="woodLid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A65E26" />
                <stop offset="65%" stopColor="#6E3510" />
                <stop offset="100%" stopColor="#4A2107" />
              </linearGradient>
              <linearGradient id="brassMetal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="45%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
              <radialGradient id="goldGlow" cx="50%" cy="65%" r="55%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Floor shadow */}
            <ellipse cx="180" cy="194" rx="135" ry="12" fill="rgba(0,0,0,0.55)" />

            {/* Open Chest Interior Glow & Velvet */}
            {chestOpen && (
              <g>
                <rect x="64" y="88" width="232" height="30" rx="6" fill="#3F0D12" />
                <ellipse cx="180" cy="94" rx="110" ry="38" fill="url(#goldGlow)" />
                {/* Parchment tips peeking inside */}
                <rect x="92" y="74" width="38" height="24" rx="4" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.5" transform="rotate(-8 111 86)" />
                <rect x="160" y="68" width="40" height="26" rx="4" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.5" />
                <rect x="228" y="75" width="38" height="24" rx="4" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.5" transform="rotate(7 247 87)" />
              </g>
            )}

            {/* Animated Heavy Wooden Lid */}
            <motion.g
              initial={false}
              animate={
                chestOpen
                  ? { y: -42, scaleY: 0.42, opacity: 0.92 }
                  : { y: 0, scaleY: 1, opacity: 1 }
              }
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              style={{ transformOrigin: '180px 92px' }}
            >
              <path
                d="M54 96 Q54 44 106 40 L254 40 Q306 44 306 96 Z"
                fill="url(#woodLid)"
                stroke="#3B1A06"
                strokeWidth="3"
              />
              {/* Wood plank lines on lid */}
              <line x1="62" y1="68" x2="298" y2="68" stroke="#3B1A06" strokeWidth="2" opacity="0.65" />
              <line x1="56" y1="84" x2="304" y2="84" stroke="#3B1A06" strokeWidth="2" opacity="0.65" />
              {/* Brass bands on lid */}
              <rect x="86" y="40" width="16" height="56" fill="url(#brassMetal)" stroke="#78350F" strokeWidth="1.5" />
              <rect x="258" y="40" width="16" height="56" fill="url(#brassMetal)" stroke="#78350F" strokeWidth="1.5" />
              {/* Brass rivets */}
              {[50, 72, 88].map((ry) => (
                <g key={ry}>
                  <circle cx="94" cy={ry} r="2.3" fill="#FFFBEB" />
                  <circle cx="266" cy={ry} r="2.3" fill="#FFFBEB" />
                </g>
              ))}
            </motion.g>

            {/* Chest Base Box */}
            <rect
              x="56"
              y="96"
              width="248"
              height="92"
              rx="8"
              fill="url(#woodDark)"
              stroke="#2C1204"
              strokeWidth="3"
            />
            {/* Wood planks */}
            <line x1="58" y1="126" x2="302" y2="126" stroke="#2C1204" strokeWidth="2" opacity="0.7" />
            <line x1="58" y1="156" x2="302" y2="156" stroke="#2C1204" strokeWidth="2" opacity="0.7" />
            {/* Brass vertical straps & bottom trim */}
            <rect x="86" y="96" width="16" height="92" fill="url(#brassMetal)" stroke="#78350F" strokeWidth="1.5" />
            <rect x="258" y="96" width="16" height="92" fill="url(#brassMetal)" stroke="#78350F" strokeWidth="1.5" />
            <rect x="54" y="94" width="252" height="10" rx="3" fill="url(#brassMetal)" stroke="#78350F" strokeWidth="1.5" />
            <rect x="54" y="180" width="252" height="10" rx="3" fill="url(#brassMetal)" stroke="#78350F" strokeWidth="1.5" />

            {/* Side iron ring handles */}
            <circle cx="52" cy="142" r="9" fill="none" stroke="url(#brassMetal)" strokeWidth="4" />
            <circle cx="308" cy="142" r="9" fill="none" stroke="url(#brassMetal)" strokeWidth="4" />

            {/* Center Brass Lock Plate + Animated Padlock Shackle */}
            <g>
              <rect
                x="156"
                y="90"
                width="48"
                height="48"
                rx="9"
                fill="url(#brassMetal)"
                stroke="#78350F"
                strokeWidth="2.5"
              />
              {/* Keyhole */}
              <circle cx="180" cy="111" r="6" fill="#1C0A00" />
              <path d="M177 115 L183 115 L185 129 L175 129 Z" fill="#1C0A00" />

              {/* Animated Brass Key inserting & rotating inside the keyhole */}
              {!chestOpen && keyProgress > 10 && (
                <motion.g
                  animate={{
                    rotate: unlocking || keyProgress >= 92 ? 90 : (keyProgress / 100) * 65,
                  }}
                  style={{ transformOrigin: '180px 115px' }}
                >
                  <circle cx="180" cy="115" r="11" fill="none" stroke="#FEF08A" strokeWidth="4" />
                  <line x1="180" y1="126" x2="180" y2="150" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />
                  <line x1="180" y1="142" x2="188" y2="142" stroke="#FDE047" strokeWidth="3" />
                  <line x1="180" y1="148" x2="186" y2="148" stroke="#FDE047" strokeWidth="3" />
                </motion.g>
              )}
            </g>
          </svg>

          {/* Mechanical Key Slide/Turn Control when Locked */}
          {!chestOpen ? (
            <div className="w-full max-w-md mt-2 p-3.5 rounded-2xl bg-black/45 border border-amber-400/40 space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-amber-200">
                <span>🗝️ പിച്ചള താക്കോൽ വലതുവശത്തേക്ക് നീക്കി പൂട്ട് തിരിക്കൂ!</span>
                <span className="tabular-nums text-amber-400">{keyProgress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={keyProgress}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                aria-label="പൂട്ട് തുറക്കാൻ താക്കോൽ നീക്കുക"
                className="w-full accent-amber-400 h-3 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[11px] text-amber-100/80">
                <span>← താക്കോൽ തിരിക്കുക</span>
                <button
                  type="button"
                  onClick={triggerChestUnlock}
                  className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold transition-colors"
                >
                  🗝️ പൂട്ട് തുറക്കാം
                </button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mt-3 space-y-2.5"
            >
              <p className="text-center text-xs sm:text-sm font-extrabold text-amber-300">
                🔓 പെട്ടി തുറന്നു! ഉള്ളിലെ 3 ചരിത്ര രേഖകൾ ഓരോന്നായി പുറത്തെടുത്ത് വായിക്കൂ:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {artifacts.map((art, idx) => {
                  const found = collectedIds.includes(art.id);
                  return (
                    <motion.button
                      key={art.id}
                      type="button"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => {
                        setActiveArt(art);
                        onCollect(art);
                      }}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        found
                          ? 'bg-emerald-900/75 border-emerald-400 text-white'
                          : 'bg-amber-100 border-amber-500 text-slate-950 hover:bg-amber-200 shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-lg">{art.emoji}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            found ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {found ? 'വായിച്ചു ✓' : 'തുറക്കൂ 📜'}
                        </span>
                      </div>
                      <p className="text-xs font-extrabold mt-1.5 leading-snug">{art.label}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <InStageStoryModal
        artifact={activeArt}
        badgeText="📜 1921–1924 ചരിത്ര രേഖ (+15 XP)"
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
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/30 border border-amber-400/30 rounded-xl px-4 py-2.5">
        <p className="text-xs sm:text-sm font-extrabold text-amber-200">
          🔖 18 സെക്കൻഡിനുള്ളിൽ 3 ചരിത്ര രേഖകളിലും 1926 സമസ്ത സീൽ പതിക്കൂ!
        </p>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-lg ${timeLeft <= 5 ? 'bg-rose-600 text-white' : 'bg-amber-400/20 text-amber-200'}`}>
            ⏱️ {timeLeft}s
          </span>
          <span className="text-xs font-extrabold text-amber-300 tabular-nums">
            മുദ്ര പതിച്ചത്: {artifacts.filter((a) => collectedIds.includes(a.id)).length}/{artifacts.length}
          </span>
        </div>
      </div>

      {failed && !allStamped && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-400 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-rose-200">⏰ സമയം കഴിഞ്ഞു! രേഖകൾ സീൽ ചെയ്യാൻ വൈകി!</p>
            <p className="text-xs font-semibold text-rose-100">18 സെക്കൻഡിനുള്ളിൽ 3 രേഖകളിലും സീൽ പതിക്കാൻ വീണ്ടും ശ്രമിക്കാം.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTimeLeft(18);
              setFailed(false);
              setStarted(false);
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold border-b-4 border-amber-700"
          >
            🔄 വീണ്ടും ശ്രമിക്കാം
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {artifacts.map((art) => {
          const stamped = collectedIds.includes(art.id);
          const isPressing = stampingId === art.id;
          return (
            <div
              key={art.id}
              className="relative rounded-2xl border-2 border-amber-300/60 bg-[#FFFDF5] text-slate-900 p-4 shadow-lg flex flex-col justify-between min-h-[175px]"
            >
              {/* Paper header lines */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                  <span className="text-[10px] font-extrabold text-red-900">ഔദ്യോഗിക ചരിത്ര രേഖ</span>
                  <span className="text-base">{art.emoji}</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{art.label}</h4>
                <div className="space-y-1 pt-1">
                  <div className="h-1.5 rounded bg-slate-200 w-full" />
                  <div className="h-1.5 rounded bg-slate-200 w-4/5" />
                </div>
              </div>

              {/* Wax Seal Stamp Area */}
              <div className="pt-3 flex items-center justify-between gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleStamp(art)}
                  className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 border-b-4 transition-all ${
                    stamped
                      ? 'bg-emerald-700 text-white border-emerald-950'
                      : 'bg-[#8C1D40] hover:bg-[#a3234b] text-amber-100 border-[#4d0d22]'
                  }`}
                >
                  {isPressing ? '💥 സീൽ പതിയുന്നു...' : stamped ? '✅ സീൽ പതിച്ചു · വായിക്കൂ' : '🔖 1926 സീൽ പതിക്കൂ'}
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
      <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-500/15 border border-amber-400/35 rounded-xl px-3.5 py-2">
        <p className="text-xs sm:text-sm font-extrabold text-amber-200">
          🏮 കറുത്ത ഇരുട്ടിൽ വിളക്ക് നീക്കി മറഞ്ഞിരിക്കുന്ന 3 ബോർഡുകൾ കണ്ടെത്തി തെളിയിക്കൂ!
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg tabular-nums ${
              oilLeft <= 10 && !allLit
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-900 text-amber-300 border border-amber-500/40'
            }`}
          >
            🪔 എണ്ണ: {allLit ? 'സുരക്ഷിതം ✓' : `${oilLeft}s`}
          </span>
          <span className="text-xs font-extrabold text-amber-300 tabular-nums">
            കണ്ടെത്തിയത്: {litCount}/{artifacts.length}
          </span>
        </div>
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
          src="/src/assets/images/era_madrasa_lantern_1794953898224.jpg"
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
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 px-3 py-2 rounded-2xl border-2 text-left max-w-[155px] sm:max-w-[205px] transition-all duration-200 ${
                lit
                  ? 'opacity-100 bg-amber-300 text-slate-950 border-yellow-100 shadow-[0_0_30px_rgba(251,191,36,0.95)] cursor-pointer'
                  : near
                  ? 'opacity-100 bg-amber-400 text-slate-950 border-yellow-100 scale-105 shadow-[0_0_26px_rgba(251,191,36,0.85)] cursor-pointer'
                  : 'opacity-0 pointer-events-none bg-black border-transparent'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{lit ? '🌟' : art.emoji}</span>
                <span className="text-[11px] sm:text-xs font-extrabold leading-tight">
                  {art.label}
                </span>
              </div>
              <p className="text-[10px] font-bold mt-1">
                {lit ? '✨ തിളങ്ങി നിൽക്കുന്നു ✓' : '👆 ഇവിടെ തൊട്ട് തെളിയിക്കൂ!'}
              </p>
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
            <span className="text-4xl">🪔</span>
            <p className="text-base sm:text-lg font-extrabold text-rose-300">
              വിളക്കിലെ എണ്ണ തീർന്നു! ({litCount}/{artifacts.length} മാത്രം കണ്ടെത്തി)
            </p>
            <p className="text-xs text-slate-300 max-w-sm">
              ഇരുട്ടിലൂടെ വേഗത്തിൽ വിളക്ക് നീക്കി 3 ബോർഡുകളും തെളിയിക്കൂ!
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>🔄 വീണ്ടും ശ്രമിക്കാം</span>
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
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/35 border border-cyan-400/35 rounded-xl px-3.5 py-2">
        <span className="text-xs font-extrabold text-cyan-200">
          ☎️ 20 സെക്കൻഡിനുള്ളിൽ 3 ക്യാമ്പ് നമ്പറുകളും ഡയൽ ചെയ്ത് സന്ദേശം കേൾക്കൂ!
        </span>
        <span className={`text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-lg ${timeLeft <= 5 ? 'bg-rose-600 text-white' : 'bg-cyan-400/20 text-cyan-200'}`}>
          ⏱️ {timeLeft}s
        </span>
      </div>
      {failed && !allHeard && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-400 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-rose-200">📵 ലൈൻ കട്ടായി! സമയം കഴിഞ്ഞു!</p>
            <p className="text-xs font-semibold text-rose-100">20 സെക്കൻഡിനുള്ളിൽ 3 നമ്പറുകളും വേഗം ഡയൽ ചെയ്യാൻ വീണ്ടും ശ്രമിക്കാം.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTimeLeft(20);
              setFailed(false);
              setStarted(false);
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold border-b-4 border-amber-700"
          >
            🔄 വീണ്ടും ശ്രമിക്കാം
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Retro Landline Rotary Dial & Live Broadcast VU Meter */}
        <div className="md:col-span-5 rounded-2xl bg-slate-950/80 border-2 border-cyan-500/40 p-4 flex flex-col items-center space-y-3">
          <p className="text-xs font-extrabold text-cyan-300">
            ☎️ 1989–1995 ക്യാമ്പ് ലാൻഡ്‌ഫോൺ &amp; ടാഗോർ ഹാൾ മൈക്ക്
          </p>
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

          {/* Animated Audio Broadcast Bars */}
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

        {/* 3 Broadcast Buttons to Dial */}
        <div className="md:col-span-7 space-y-2.5">
          <p className="text-xs font-bold text-emerald-200">
            ഓരോ നമ്പറിലും ഡയൽ ചെയ്ത് ക്യാമ്പ് ഓർമ്മകളും 1995 ടാഗോർ ഹാൾ പ്രഖ്യാപനവും കേൾക്കൂ:
          </p>
          {artifacts.map((art, idx) => {
            const heard = collectedIds.includes(art.id);
            const active = activeIdx === idx;
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => handleDialStation(idx)}
                className={`w-full p-3 rounded-xl border-2 text-left flex items-center justify-between gap-3 transition-all ${
                  active
                    ? 'bg-amber-400 text-slate-950 border-white shadow-md'
                    : heard
                    ? 'bg-emerald-900/75 text-white border-emerald-400'
                    : 'bg-white/10 hover:bg-white/15 text-white border-cyan-400/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-1 rounded-lg bg-slate-950/80 text-amber-300 font-mono text-xs font-extrabold">
                    #{dialCodes[idx] || idx + 1}
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold">
                      {art.emoji} {art.label}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold shrink-0">
                  {heard ? 'കേട്ടു ✓' : 'ഡയൽ ചെയ്യൂ 📞'}
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
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/10 border border-sky-400/35 rounded-xl px-4 py-2.5">
        <p className="text-xs sm:text-sm font-extrabold text-sky-200">
          ✈️ 20 സെക്കൻഡിനുള്ളിൽ കേരളത്തിൽ നിന്ന് മക്കയിലേക്കും ലോകമെങ്ങും വിമാനം പറത്തി 3 സ്റ്റേഷനുകൾ സന്ദർശിക്കൂ!
        </p>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-extrabold tabular-nums px-2 py-0.5 rounded-lg ${timeLeft <= 5 ? 'bg-rose-600 text-white' : 'bg-sky-400/20 text-sky-200'}`}>
            ⏱️ {timeLeft}s
          </span>
          <span className="text-xs font-extrabold text-amber-300 tabular-nums">
            സന്ദർശിച്ചത്: {artifacts.filter((a) => collectedIds.includes(a.id)).length}/{artifacts.length}
          </span>
        </div>
      </div>

      {failed && !allVisited && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-400 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-rose-200">⛽ ഇന്ധനം തീർന്നു! വിമാന യാത്ര പൂർത്തിയായില്ല!</p>
            <p className="text-xs font-semibold text-rose-100">20 സെക്കൻഡിനുള്ളിൽ 3 ഗ്ലോബൽ സ്റ്റേഷനുകളിലും പറന്നെത്താൻ വീണ്ടും ശ്രമിക്കാം.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTimeLeft(20);
              setFailed(false);
              setStarted(false);
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold border-b-4 border-amber-700"
          >
            🔄 വീണ്ടും ശ്രമിക്കാം
          </button>
        </div>
      )}

      {/* Global Radar & Animated Flight Path */}
      <div className="relative h-60 sm:h-64 rounded-2xl border-2 border-sky-400/40 bg-slate-950/90 overflow-hidden">
        <svg viewBox="0 0 600 240" className="absolute inset-0 w-full h-full" aria-hidden="true">
          {/* Radar Latitude/Longitude Grid */}
          <ellipse cx="300" cy="120" rx="250" ry="95" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.22" />
          <ellipse cx="300" cy="120" rx="140" ry="95" fill="none" stroke="#34D399" strokeWidth="1" opacity="0.22" />
          <line x1="30" y1="120" x2="570" y2="120" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" />
          {/* Curved Flight Route */}
          <path
            d="M 108 158 Q 200 60 300 86 Q 410 45 492 130"
            fill="none"
            stroke="#FBBF24"
            strokeWidth="3.5"
            strokeDasharray="8 6"
          />
        </svg>

        {/* Flying Animated Plane */}
        <motion.div
          animate={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 16 }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-30 text-3xl drop-shadow-[0_0_14px_rgba(56,189,248,0.9)]"
        >
          ✈️
        </motion.div>

        {/* 3 Global Radar Beacons */}
        {artifacts.map((art, idx) => {
          const st = stops[idx] || stops[0];
          const visited = collectedIds.includes(art.id);
          return (
            <button
              key={art.id}
              type="button"
              onClick={() => flyToStop(idx)}
              style={{ left: `${st.x}%`, top: `${st.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 px-2.5 py-2 rounded-xl border-2 text-left max-w-[140px] sm:max-w-[185px] transition-all ${
                visited
                  ? 'bg-emerald-600 text-white border-emerald-200 shadow-lg'
                  : 'bg-sky-900/95 hover:bg-sky-800 text-white border-amber-400 shadow-md'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{visited ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" /> : art.emoji}</span>
                <span className="text-[10px] sm:text-xs font-extrabold leading-tight">
                  {art.label}
                </span>
              </div>
              <p className="text-[9px] text-amber-200 font-bold mt-0.5">
                {visited ? 'എത്തിച്ചേർന്നു ✓' : 'ഇങ്ങോട്ട് പറക്കൂ ✈️'}
              </p>
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
