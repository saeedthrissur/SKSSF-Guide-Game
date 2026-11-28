import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Crown, Gift, Lock, Play, Search, Swords, Unlock, X, Zap } from 'lucide-react';
import {
  ALL_LESSONS,
  getSequentialFrontierIndex,
  LessonDescriptor,
} from '../utils/lessonTracker';
import { SNAKES_AND_LADDERS_NODES, useEcosystem } from '../utils/ecosystemStore';
import { CrownStarSvg, HiddenTreasureStar } from './CurrencyIcons';
import { sound } from '../utils/sound';

interface AllLessonsMapPageProps {
  activeLessonId: string;
  completedLessonIds: string[];
  devUnlocked: boolean;
  onSetDevUnlocked: (val: boolean) => void;
  onSelectLesson: (lessonId: string) => void;
  onClose: () => void;
  onOpenBossChallenge?: (level: number) => void;
  onOpenGrandFinale?: () => void;
  onEcoToast?: (msg: string) => void;
}

const DEV_UNLOCK_SALT = 'skssf-guide-dev-salt-v2::';
const DEV_UNLOCK_SHA256_HEX = '97ebdf29fd603f7868c9d598f14e770fa5db72fb85ffb44ad77e92066eb530d5';

function sha256FallbackHex(message: string): string {
  const bytes = new TextEncoder().encode(message);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const w = new Uint32Array(64);
  const rotr = (v: number, n: number) => (v >>> n) | (v << (32 - n));

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((n) => n.toString(16).padStart(8, '0')).join('');
}

async function verifyDevUnlockCode(rawCode: string): Promise<boolean> {
  const payload = `${DEV_UNLOCK_SALT}${rawCode.trim().toLowerCase()}`;
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle?.digest) {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return hex === DEV_UNLOCK_SHA256_HEX;
    }
  } catch {
    // Fall back to pure-JS SHA-256 on non-HTTPS local preview
  }
  return sha256FallbackHex(payload) === DEV_UNLOCK_SHA256_HEX;
}

export const AllLessonsMapPage: React.FC<AllLessonsMapPageProps> = ({
  activeLessonId,
  completedLessonIds,
  devUnlocked,
  onSetDevUnlocked,
  onSelectLesson,
  onClose,
  onOpenBossChallenge,
  onOpenGrandFinale,
  onEcoToast,
}) => {
  const { state: ecoState, consumeVipJumpPass } = useEcosystem();
  const [tapCount, setTapCount] = useState(0);
  const tapTimerRef = useRef<number | null>(null);
  const [codePromptOpen, setCodePromptOpen] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'remaining'>('all');
  const [vipNotice, setVipNotice] = useState<string | null>(null);

  const giftedSet = useMemo(
    () => new Set(ecoState.social.giftedLessonIds),
    [ecoState.social.giftedLessonIds]
  );
  const snakeLadderByIndex = useMemo(() => {
    const m = new Map<number, (typeof SNAKES_AND_LADDERS_NODES)[number]>();
    SNAKES_AND_LADDERS_NODES.forEach((n) => m.set(n.lessonIndex, n));
    return m;
  }, []);

  const totalCount = ALL_LESSONS.length;
  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);
  const completedCount = useMemo(
    () => ALL_LESSONS.filter((l) => completedSet.has(l.id)).length,
    [completedSet]
  );
  const remainingCount = Math.max(0, totalCount - completedCount);
  const progressPct = Math.round((completedCount / Math.max(1, totalCount)) * 100);

  const nextSequentialIdx = useMemo(
    () => getSequentialFrontierIndex(completedLessonIds),
    [completedLessonIds]
  );
  const activeIdx = Math.max(
    0,
    ALL_LESSONS.findIndex((l) => l.id === activeLessonId)
  );
  const resumeIdx = devUnlocked || activeIdx <= nextSequentialIdx ? activeIdx : nextSequentialIdx;
  const activeLesson = ALL_LESSONS[resumeIdx];

  // Group lessons by groupLabel preserving curriculum order + applying search & filter
  const groups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const map = new Map<string, { label: string; items: { lesson: LessonDescriptor; globalIdx: number }[] }>();
    ALL_LESSONS.forEach((lesson, idx) => {
      const isDone = completedSet.has(lesson.id);
      if (statusFilter === 'done' && !isDone) return;
      if (statusFilter === 'remaining' && isDone) return;
      if (
        q &&
        !lesson.title.toLowerCase().includes(q) &&
        !lesson.groupLabel.toLowerCase().includes(q) &&
        !String(idx + 1).includes(q)
      ) {
        return;
      }
      const existing = map.get(lesson.groupLabel);
      if (existing) {
        existing.items.push({ lesson, globalIdx: idx });
      } else {
        map.set(lesson.groupLabel, {
          label: lesson.groupLabel,
          items: [{ lesson, globalIdx: idx }],
        });
      }
    });
    return Array.from(map.values());
  }, [searchQuery, statusFilter, completedSet]);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current !== null) {
        window.clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  // Silent 6-tap trigger on the decorative map icon
  const handleIconTap = () => {
    const next = tapCount + 1;
    if (tapTimerRef.current !== null) {
      window.clearTimeout(tapTimerRef.current);
    }
    if (next >= 6) {
      setTapCount(0);
      setCodeValue('');
      setCodeError(false);
      setCodePromptOpen(true);
    } else {
      setTapCount(next);
      tapTimerRef.current = window.setTimeout(() => {
        setTapCount(0);
      }, 3200);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyDevUnlockCode(codeValue);
    if (ok) {
      sound.unlockAudio();
      sound.playUnlock();
      onSetDevUnlocked(true);
      setCodePromptOpen(false);
      setCodeValue('');
      setCodeError(false);
    } else {
      sound.playError();
      setCodeError(true);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Top Overview Header Card */}
      <div className="rounded-3xl border-2 border-emerald-200 bg-white p-3.5 sm:p-5 shadow-sm space-y-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleIconTap}
              aria-label="പാഠങ്ങളുടെ ഭൂപടം"
              className="w-11 h-11 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center text-xl shadow-xs shrink-0 select-none"
            >
              🗺️
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-extrabold text-emerald-950 leading-tight break-words">
                എല്ലാ പാഠങ്ങളും ({totalCount})
              </h2>
              <p className="text-xs font-semibold text-slate-600 mt-0.5 leading-snug break-words">
                പൂർത്തിയായവയും ഇനി ബാക്കിയുള്ളവയും
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {devUnlocked && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSetDevUnlocked(false);
                }}
                aria-label="Lock"
                className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-400 text-amber-900 flex items-center justify-center"
              >
                <Unlock className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>തിരികെ</span>
            </button>
          </div>
        </div>

        {/* 3 Clear Stat Tiles (Overflow-Safe on Narrow Mobile & Font Level 5) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-center">
          <div className="min-w-0 overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 px-1.5 sm:px-3 py-2.5 sm:py-3 flex flex-col items-center justify-center">
            <p className="max-[380px]:text-[9.5px] text-[10px] sm:text-xs font-bold text-slate-600 leading-snug text-center [overflow-wrap:anywhere] max-w-full">
              ആകെ പാഠങ്ങൾ
            </p>
            <p className="text-lg sm:text-2xl font-extrabold text-slate-900 tabular-nums mt-1 notranslate">
              {totalCount}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-2xl bg-emerald-50 border border-emerald-200 px-1.5 sm:px-3 py-2.5 sm:py-3 flex flex-col items-center justify-center">
            <p className="max-[380px]:text-[9.5px] text-[10px] sm:text-xs font-bold text-emerald-800 leading-snug text-center [overflow-wrap:anywhere] max-w-full">
              പൂർത്തിയായവ
            </p>
            <p className="text-lg sm:text-2xl font-extrabold text-emerald-700 tabular-nums mt-1 notranslate">
              {completedCount}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-2xl bg-amber-50 border border-amber-200 px-1.5 sm:px-3 py-2.5 sm:py-3 flex flex-col items-center justify-center">
            <p className="max-[380px]:text-[9.5px] text-[10px] sm:text-xs font-bold text-amber-900 leading-snug text-center [overflow-wrap:anywhere] max-w-full">
              ബാക്കിയുള്ളവ
            </p>
            <p className="text-lg sm:text-2xl font-extrabold text-amber-700 tabular-nums mt-1 notranslate">
              {remainingCount}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-extrabold text-emerald-900 tabular-nums">
            <span>പുരോഗതി</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-amber-400 transition-all duration-300"
            />
          </div>
        </div>

        {/* Quick Resume Active Lesson + Search & Status Filter Controls */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          {activeLesson && (
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playClick();
                onSelectLesson(activeLesson.id);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
            >
              <span className="text-xs font-extrabold text-emerald-950 truncate">
                നിലവിലെ പാഠം തുടരാം: {resumeIdx + 1}. {activeLesson.title}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 shrink-0 whitespace-nowrap">
                <Play className="w-3.5 h-3.5 fill-current" /> തുടരാം
              </span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="പാഠം തിരയുക (ഉദാ: വിഖായ, പതാക, ട്രെൻഡ്)..."
                aria-label="പാഠം തിരയുക"
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 text-xs sm:text-sm font-semibold text-slate-900 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="തിരയൽ മായ്ക്കുക"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)_minmax(0,1fr)] sm:inline-flex items-stretch gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 w-full sm:w-auto shrink-0">
              {(
                [
                  { id: 'all', label: `എല്ലാം (${totalCount})` },
                  { id: 'done', label: `പൂർത്തിയായവ (${completedCount})` },
                  { id: 'remaining', label: `ബാക്കി (${remainingCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStatusFilter(tab.id);
                  }}
                  className={`min-w-0 px-1.5 sm:px-2.5 py-1.5 rounded-lg max-[380px]:text-[9.5px] text-[10px] sm:text-[11px] font-extrabold leading-tight text-center [overflow-wrap:anywhere] transition-colors cursor-pointer tabular-nums ${
                    statusFilter === tab.id
                      ? 'bg-white text-emerald-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Ladders & Revision Loops + 45s Boss Challenges + Subtle Hidden Star */}
        <div className="pt-2.5 border-t border-slate-100 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-emerald-50/70 border border-emerald-200 px-3 py-2 text-[11px] font-bold text-emerald-950">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black">🪜 ബോണസ് കോണിയും റിവിഷൻ ലൂപ്പും:</span>
              <span>🪜 ബോണസ് കോണി (മുന്നോട്ട് കുതിക്കാം)</span>
              <span>·</span>
              <span>🌀 റിവിഷൻ ലൂപ്പ് (വീണ്ടും ഉറപ്പിക്കാം)</span>
            </div>
            <HiddenTreasureStar
              starId="star_map_vault"
              onClaimed={onEcoToast}
            />
          </div>

          {ecoState.inventory.vipJumpPasses > 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-300 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-amber-950">
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                വിഐപി ജമ്പ് പാസ് ലഭ്യമാണ് ({ecoState.inventory.vipJumpPasses}) — അടുത്ത 1–2 പാഠങ്ങളിലേക്ക് കുതിക്കാം!
              </span>
            </div>
          )}
          {vipNotice && (
            <p className="text-xs font-extrabold text-emerald-800 px-1">{vipNotice}</p>
          )}

          {onOpenBossChallenge && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((lvl) => {
                const done = ecoState.progression.completedBossLevels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      sound.unlockAudio();
                      sound.playPop();
                      onOpenBossChallenge(lvl);
                    }}
                    className={`px-2.5 py-2 rounded-xl border text-left text-[11px] font-black transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                      done
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-950'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1 truncate">
                      {done ? <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : <Swords className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                      <span className="truncate">ഘട്ടം {lvl} ബോസ്</span>
                    </span>
                    <span className="text-[10px] shrink-0">{done ? '✓' : '45s'}</span>
                  </button>
                );
              })}
            </div>
          )}

          {onOpenGrandFinale && (completedCount >= totalCount || devUnlocked) && (
            <button
              type="button"
              onClick={() => {
                sound.unlockAudio();
                sound.playUnlock();
                onOpenGrandFinale();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-amber-700 text-white text-xs sm:text-sm font-black shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>🏆 62/62 ഗ്രാൻഡ് ഫിനാലെ വോൾട്ട് (9:16 സ്റ്റാറ്റസ് കാർഡ് · പോക്കറ്റ് വോൾട്ട് · റാപ്പിഡ് ക്വിസ്)</span>
            </button>
          )}
        </div>
      </div>

      {/* Grouped Complete List of All Lessons */}
      <div className="space-y-4">
        {groups.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-2">
            <p className="text-sm font-extrabold text-slate-800">
              ഈ തിരയലിൽ പാഠങ്ങളൊന്നും കണ്ടെത്തിയില്ല.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold cursor-pointer"
            >
              എല്ലാ പാഠങ്ങളും കാണിക്കാം
            </button>
          </div>
        )}
        {groups.map((grp, grpIdx) => {
          const grpDone = grp.items.filter((x) => completedSet.has(x.lesson.id)).length;
          return (
            <div
              key={grp.label}
              style={{ animationDelay: `${Math.min(grpIdx * 40, 200)}ms` }}
              className="map-group-enter rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 px-1">
                <h3 className="text-sm sm:text-base font-extrabold text-emerald-950">
                  {grp.label}
                </h3>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-800 tabular-nums">
                  {grpDone}/{grp.items.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grp.items.map(({ lesson, globalIdx }) => {
                  const isDone = completedSet.has(lesson.id);
                  const isCurrent = lesson.id === activeLessonId;
                  const isGifted = giftedSet.has(lesson.id);
                  const isFreeRoam = ecoState.inventory.freeRoamStageUnlocked;
                  const canOpen =
                    devUnlocked || isFreeRoam || isDone || isGifted || globalIdx <= nextSequentialIdx;
                  const canVipJump =
                    !canOpen &&
                    ecoState.inventory.vipJumpPasses > 0 &&
                    globalIdx <= nextSequentialIdx + 2;
                  const slNode = snakeLadderByIndex.get(globalIdx);
                  const stars = ecoState.progression.lessonStars[lesson.id] ?? 0;

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      disabled={!canOpen && !canVipJump}
                      onClick={() => {
                        if (canVipJump && !canOpen) {
                          if (consumeVipJumpPass()) {
                            sound.unlockAudio();
                            sound.playUnlock();
                            setVipNotice(`🪜 വിഐപി ജമ്പ് പാസ് ഉപയോഗിച്ച് പാഠം ${globalIdx + 1}-ലേക്ക് കയറി!`);
                            onSelectLesson(lesson.id);
                          }
                          return;
                        }
                        if (!canOpen) return;
                        sound.unlockAudio();
                        sound.playClick();
                        onSelectLesson(lesson.id);
                      }}
                      className={`map-lesson-row w-full min-w-0 overflow-hidden text-left px-3 sm:px-3.5 py-2.5 rounded-2xl border-2 flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-emerald-700 text-white border-emerald-900 shadow-sm cursor-pointer'
                          : isDone
                          ? 'bg-emerald-50/90 text-emerald-950 border-emerald-300 hover:bg-emerald-100 hover:shadow-xs cursor-pointer'
                          : isGifted
                          ? 'bg-sky-50 text-sky-950 border-sky-300 hover:bg-sky-100 cursor-pointer'
                          : canOpen
                          ? 'bg-white text-slate-900 border-amber-300 hover:bg-amber-50 hover:shadow-xs cursor-pointer'
                          : canVipJump
                          ? 'bg-amber-50/90 text-amber-950 border-dashed border-amber-400 hover:bg-amber-100 cursor-pointer'
                          : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                        <span
                          className={`w-7 h-7 rounded-xl text-xs font-extrabold flex items-center justify-center shrink-0 tabular-nums notranslate ${
                            isCurrent
                              ? 'bg-amber-400 text-slate-950'
                              : isDone
                              ? 'bg-emerald-700 text-white'
                              : isGifted
                              ? 'bg-sky-600 text-white'
                              : canOpen
                              ? 'bg-amber-100 text-amber-950'
                              : canVipJump
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {globalIdx + 1}
                        </span>
                        <span className="text-lg shrink-0 notranslate" aria-hidden="true">
                          {lesson.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs sm:text-sm font-extrabold leading-snug break-words">
                            {lesson.title}
                          </span>
                          <div className="flex flex-wrap items-center gap-1 mt-0.5">
                            {globalIdx === 0 && (
                              <span
                                className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md border ${
                                  isCurrent
                                    ? 'bg-amber-300 text-slate-950 border-amber-100'
                                    : 'bg-emerald-100 text-emerald-950 border-emerald-400'
                                }`}
                              >
                                🚩 തുടക്കം · START
                              </span>
                            )}
                            {globalIdx === totalCount - 1 && (
                              <span
                                className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md border ${
                                  isCurrent
                                    ? 'bg-amber-300 text-slate-950 border-amber-100'
                                    : 'bg-amber-100 text-amber-950 border-amber-400'
                                }`}
                              >
                                🏁 ലക്ഷ്യം · FINISH
                              </span>
                            )}
                            {slNode && (
                              <span
                                title={slNode.descriptionMl}
                                className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                  slNode.type === 'ladder'
                                    ? isCurrent
                                      ? 'bg-amber-400 text-slate-950'
                                      : 'bg-emerald-100 text-emerald-900'
                                    : isCurrent
                                    ? 'bg-rose-400 text-slate-950'
                                    : 'bg-rose-100 text-rose-900'
                                }`}
                              >
                                {slNode.type === 'ladder'
                                  ? `🪜 കോണി → #${slNode.targetIndex + 1}`
                                  : `🌀 റിവിഷൻ → #${slNode.targetIndex + 1}`}
                              </span>
                            )}
                            {isGifted && !isDone && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-900">
                                <Gift className="w-2.5 h-2.5" /> ഗിഫ്റ്റ് അൺലോക്ക്
                              </span>
                            )}
                            {canVipJump && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-950">
                                ⚡ വിഐപി ജമ്പ്
                              </span>
                            )}
                            {stars > 0 && (
                              <span className="inline-flex items-center gap-0.5">
                                {[1, 2, 3].map((n) => (
                                  <CrownStarSvg key={n} filled={n <= stars} className="w-3 h-3" />
                                ))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="shrink-0">
                        {isDone ? (
                          <CheckCircle2
                            className={`w-4 h-4 ${isCurrent ? 'text-amber-300' : 'text-emerald-600'}`}
                          />
                        ) : isCurrent || devUnlocked || isGifted || isFreeRoam ? (
                          <Play
                            className={`w-4 h-4 ${isCurrent ? 'text-amber-300' : 'text-emerald-700'}`}
                          />
                        ) : canVipJump ? (
                          <Zap className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* More Lessons Coming Soon Banner */}
      <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-4 sm:p-5 text-center shadow-2xs space-y-1.5">
        <p className="text-lg" aria-hidden="true">
          ✨🚀📚
        </p>
        <h3 className="text-sm sm:text-base font-extrabold text-emerald-950">
          കൂടുതൽ പാഠങ്ങളും പുതിയ ഗെയിമുകളും ഉടൻ വരുന്നു!
        </h3>
        <p className="text-xs font-semibold text-slate-600 tabular-nums">
          നിലവിൽ {totalCount} സംവേദനാത്മക പാഠങ്ങളും ചെറു ഗെയിമുകളും ലഭ്യമാണ്.
        </p>
      </div>

      {/* Silent Unmarked Access Modal — ONLY opens after 6 rapid taps on the corner icon */}
      {codePromptOpen && (
        <div
          className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setCodePromptOpen(false)}
        >
          <form
            onSubmit={handleSubmitCode}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border-2 border-slate-300 p-4 w-full max-w-xs space-y-3 shadow-xl"
          >
            <input
              type="password"
              autoFocus
              value={codeValue}
              onChange={(e) => {
                setCodeValue(e.target.value);
                setCodeError(false);
              }}
              placeholder="••••"
              className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-center text-base font-extrabold tracking-widest outline-none ${
                codeError
                  ? 'border-rose-500 bg-rose-50 text-rose-900'
                  : 'border-slate-300 focus:border-emerald-600 text-slate-900'
              }`}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCodePromptOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-extrabold"
              >
                ✓
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.section>
  );
};
