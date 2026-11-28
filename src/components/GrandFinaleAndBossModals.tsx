import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  BookOpen,
  Clock,
  Crown,
  Download,
  Flame,
  Search,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { LESSON_QUIZZES } from '../data/lessonQuizzes';
import { ALL_LESSONS } from '../utils/lessonTracker';
import { createOriginLockedCardPayload } from '../utils/ecosystemCrypto';
import { ANTI_INFLATION_CAPS, useEcosystem } from '../utils/ecosystemStore';
import { sound } from '../utils/sound';
import { DiamondGemSvg, GoldCoinSvg } from './CurrencyIcons';

// ==================== 45-SECOND 5-QUESTION LEVEL BOSS CHALLENGE ====================

interface BossQuestion {
  q: string;
  options: [string, string, string, string];
  correctIdx: 0 | 1 | 2 | 3;
}

const LEVEL_BOSS_POOLS: Record<number, { titleMl: string; questions: BossQuestion[] }> = {
  1: {
    titleMl: 'ഘട്ടം 1 ബോസ് ചാലഞ്ച് — യൂണിറ്റ് & ചരിത്ര കവചം',
    questions: [
      {
        q: 'സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ രൂപീകൃതമായ കൃത്യമായ തീയതി?',
        options: ['1926 ജൂൺ 26', '1926 ആഗസ്റ്റ് 15', '1951 സെപ്റ്റംബർ 17', '1989 ഫെബ്രുവരി 19'],
        correctIdx: 0,
      },
      {
        q: 'SKSSF-ന്റെ ഔദ്യോഗിക പതാകയിലെ നിറങ്ങളുടെ ക്രമം ഏതാണ്?',
        options: ['നീല, വെള്ള, പച്ച', 'പച്ച, വെള്ള, ചുവപ്പ്', 'കറുപ്പ്, വെള്ള, പച്ച', 'മഞ്ഞ, വെള്ള, നീല'],
        correctIdx: 0,
      },
      {
        q: 'സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡ് (SKIMVB) നിലവിൽ വന്ന വർഷം?',
        options: ['1926', '1951', '1954', '1976'],
        correctIdx: 1,
      },
      {
        q: 'ഒരു പുതിയ SKSSF യൂണിറ്റ് ഔദ്യോഗികമായി രൂപീകരിക്കാൻ വേണ്ട പ്രവർത്തക സമിതി അംഗസംഖ്യ?',
        options: ['7 അംഗങ്ങൾ', '11 അംഗങ്ങൾ', '15 അംഗങ്ങൾ', '25 അംഗങ്ങൾ'],
        correctIdx: 2,
      },
      {
        q: 'SKSSF രൂപീകൃതമായ 1989 ഫെബ്രുവരി 19-ലെ വേദി ഏതായിരുന്നു?',
        options: [
          'കോഴിക്കോട് ടാഗോർ ഹാൾ',
          'കോഴിക്കോട് സാമൂതിരി ഹൈസ്കൂൾ',
          'വളാഞ്ചേരി മർകസ്',
          'പട്ടിക്കാട് ജാമിഅ നൂരിയ്യ',
        ],
        correctIdx: 1,
      },
    ],
  },
  2: {
    titleMl: 'ഘട്ടം 2 ബോസ് ചാലഞ്ച് — ക്ലസ്റ്റർ, മേഖല & 17 വിങ്ങുകൾ',
    questions: [
      {
        q: 'വിദ്യാർത്ഥികൾക്ക് കരിയർ ഗൈഡൻസും സിവിൽ സർവീസ് പരിശീലനവും നൽകുന്ന SKSSF വിംഗ്?',
        options: ['ഇബാദ് (IBAD)', 'ട്രെൻഡ് (TREND)', 'വിഖായ', 'മനീഷ'],
        correctIdx: 1,
      },
      {
        q: 'ദുരന്തനിവാരണത്തിനും സന്നദ്ധ സേവനത്തിനുമായി പ്രവർത്തിക്കുന്ന യൂണിഫോം വളണ്ടിയർ വിംഗ്?',
        options: ['സഹചാരി', 'വിഖായ (Viqaya)', 'ത്വലബ', 'സർഗ്ഗലയം'],
        correctIdx: 1,
      },
      {
        q: 'പള്ളി ദർസുകളിലെയും അറബിക് കോളേജുകളിലെയും വിദ്യാർത്ഥികളെ ഏകോപിപ്പിക്കുന്ന വിംഗ്?',
        options: ['ത്വലബ വിംഗ്', 'ക്യാമ്പസ് വിംഗ്', 'ഇസ്തിഖാമ', 'മീം (MEEM)'],
        correctIdx: 0,
      },
      {
        q: 'യൂണിറ്റ്–മേഖല–ജില്ലാ അംഗത്വവും റിപ്പോർട്ടുകളും ഡിജിറ്റലായി ഏകോപിപ്പിക്കുന്ന സംവിധാനം?',
        options: ['ഓർഗാനെറ്റ് (Organet)', 'SKICR', 'സത്യധാര', 'SNEC'],
        correctIdx: 0,
      },
      {
        q: 'മതസൗഹാർദ്ദത്തിനും ചരിത്ര-സാംസ്കാരിക ബൗദ്ധിക സംവാദങ്ങൾക്കും നേതൃത്വം നൽകുന്ന വിംഗ്?',
        options: ['മനീഷ (Maneesha)', 'വിഖായ', 'സഹചാരി', 'അൽബിർ'],
        correctIdx: 0,
      },
    ],
  },
  3: {
    titleMl: 'ഘട്ടം 3 ബോസ് ചാലഞ്ച് — ജില്ലാ തലം & സംഘടനാ മര്യാദ',
    questions: [
      {
        q: 'അനാവശ്യ തർക്കങ്ങളിൽ നിന്ന് ഒഴിഞ്ഞുനിൽക്കുന്ന സൈബർ മര്യാദയുടെ അറബി പ്രയോഗം?',
        options: ['ഇഖ്‌ലാസ്', 'തർക്കുൽ മാലായഅ്നി', 'മുശാവറ', 'തവാളുഅ്'],
        correctIdx: 1,
      },
      {
        q: 'മജ്‌ലിസുന്നൂർ പോലുള്ള ആത്മീയ സദസ്സുകളിൽ ബറക്കത്തിനായി വിതരണം ചെയ്യുന്ന ഭക്ഷണം?',
        options: ['ചീരണി', 'വലീമ', 'ഇഫ്താർ', 'സദ്യ'],
        correctIdx: 0,
      },
      {
        q: 'ഇസ്‌ലാമിക് ലൈബ്രറിയിൽ കിതാബുകൾ അടുക്കുമ്പോൾ ഏറ്റവും മുകളിൽ വെക്കേണ്ട ഗ്രന്ഥം?',
        options: ['ചരിത്ര ഗ്രന്ഥം', 'ഹദീസ് കിതാബ്', 'വിശുദ്ധ ഖുർആൻ (മുസ്ഹഫ്)', 'നിഘണ്ടു'],
        correctIdx: 2,
      },
      {
        q: '1995 കോഴിക്കോട് ടാഗോർ ഹാൾ പ്രഖ്യാപനം യുവാക്കളോട് ആഹ്വാനം ചെയ്തത് എന്തിനാണ്?',
        options: [
          'വിജ്ഞാനത്തിന്റെയും ജനാധിപത്യ സമാധാനത്തിന്റെയും പാത',
          'വ്യാപാര കൂട്ടായ്മ മാത്രം',
          'രാഷ്ട്രീയ പ്രക്ഷോഭം മാത്രം',
          'സാമൂഹിക പിൻവാങ്ങൽ',
        ],
        correctIdx: 0,
      },
      {
        q: 'ഒരു യൂണിറ്റ് പരിപാടിയിലെ വരവ്-ചെലവ് കണക്കുകൾ എങ്ങനെ സൂക്ഷിക്കണം?',
        options: [
          'ഓർമ്മയിൽ മാത്രം വെച്ചാൽ മതി',
          'വരവ്, ചെലവ്, നീക്കിയിരിപ്പ് സുതാര്യമായി എഴുതി യോഗത്തിൽ അവതരിപ്പിക്കണം',
          'ആകെ തുക മാത്രം ഏകദേശമായി എഴുതണം',
          'സെക്രട്ടറി മാത്രം അറിയണം',
        ],
        correctIdx: 1,
      },
    ],
  },
  4: {
    titleMl: 'ഘട്ടം 4 ബോസ് ചാലഞ്ച് — സ്റ്റേറ്റ്, ഗ്ലോബൽ & സമസ്ത ശൃംഖല',
    questions: [
      {
        q: 'SKSSF-ന്റെ ഔദ്യോഗിക ദ്വൈവാരിക മുഖപത്രം ഏതാണ്?',
        options: ['സത്യധാര', 'അൽ-മുഅല്ലിം', 'കുരുന്നുകൾ', 'സന്തുഷ്ട കുടുംബം'],
        correctIdx: 0,
      },
      {
        q: '1963-ൽ പട്ടിക്കാട് സ്ഥാപിതമായ സമസ്തയുടെ ഉന്നത മതപഠന കേന്ദ്രം?',
        options: ['ജാമിഅ നൂരിയ്യ', 'അൽബിർ', 'SNEC', 'SKMMA'],
        correctIdx: 0,
      },
      {
        q: 'സമസ്തയ്ക്ക് കീഴിൽ നിയമസഹായവും ഭരണഘടനാ അവകാശ സംരക്ഷണവും നൽകുന്ന സെൽ?',
        options: ['SLC (സമസ്ത ലീഗൽ സെൽ)', 'SKJQ', 'SPC', 'SEA'],
        correctIdx: 0,
      },
      {
        q: 'SKSSF-ന്റെ മെഡിക്കൽ-ആരോഗ്യ സേവന വിംഗ് ഏതാണ്?',
        options: ['MEEM', 'TREND', 'IBAD', 'SKICR'],
        correctIdx: 0,
      },
      {
        q: 'കുട്ടികൾക്കായി 1993-ൽ രൂപീകൃതമായ സമസ്ത ബാലവേദി ഏതാണ്?',
        options: ['SKSBV', 'SYS', 'SMF', 'SKJMCC'],
        correctIdx: 0,
      },
    ],
  },
};

export const LevelBossChallengeModal: React.FC<{
  level: number | null;
  onClose: () => void;
}> = ({ level, onClose }) => {
  const { markBossLevelComplete } = useEcosystem();
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'won' | 'failed'>('ready');

  const boss = level ? LEVEL_BOSS_POOLS[level] ?? LEVEL_BOSS_POOLS[1] : null;

  useEffect(() => {
    if (level) {
      setQIdx(0);
      setScore(0);
      setTimeLeft(45);
      setPhase('ready');
    }
  }, [level]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      sound.playError();
      setPhase('failed');
      return;
    }
    const id = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearInterval(id);
  }, [phase, timeLeft]);

  if (!level || !boss) return null;

  const currentQ = boss.questions[qIdx];

  const handleAnswer = (optIdx: number) => {
    if (phase !== 'playing' || !currentQ) return;
    const ok = optIdx === currentQ.correctIdx;
    const nextScore = ok ? score + 1 : score;
    if (ok) {
      sound.playSuccess(2);
      setScore(nextScore);
    } else {
      sound.playError();
    }
    if (qIdx + 1 >= boss.questions.length) {
      if (nextScore >= 4) {
        sound.playUnlock();
        markBossLevelComplete(level);
        setPhase('won');
      } else {
        setPhase('failed');
      }
    } else {
      setQIdx((i) => i + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[115] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="ലെവൽ ബോസ് ചാലഞ്ച്"
    >
      <div className="max-w-lg w-full my-auto rounded-3xl border-2 border-amber-400 bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 px-5 py-4 text-white border-b-4 border-amber-400 flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-black text-amber-300">⏱️ 45 സെക്കൻഡ് · 5 ചോദ്യങ്ങൾ</p>
            <h3 className="text-sm sm:text-base font-black">{boss.titleMl}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="അടയ്ക്കുക"
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {phase === 'ready' && (
            <div className="text-center space-y-3">
              <Crown className="w-11 h-11 text-amber-500 mx-auto" />
              <p className="text-sm font-black text-slate-900">
                45 സെക്കൻഡിനുള്ളിൽ 5 ചോദ്യങ്ങളിൽ കുറഞ്ഞത് 4 എണ്ണം ശരിയാക്കൂ!
              </p>
              <p className="text-xs font-bold text-slate-600">
                വിജയിച്ചാൽ: +40 വെള്ളി, +15 സ്വർണ്ണം, +1 വജ്രം &amp; ലെവൽ ബോസ് കിരീടം!
              </p>
              <button
                type="button"
                onClick={() => {
                  sound.unlockAudio();
                  sound.playPop();
                  setPhase('playing');
                }}
                className="w-full min-h-[46px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm cursor-pointer"
              >
                🔥 ബോസ് ചാലഞ്ച് തുടങ്ങാം!
              </button>
            </div>
          )}

          {phase === 'playing' && currentQ && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-emerald-800">ചോദ്യം {qIdx + 1} / 5 · സ്കോർ: {score}</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg tabular-nums ${
                    timeLeft <= 12 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-950'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> {timeLeft}s
                </span>
              </div>
              <p className="text-sm font-black text-slate-900 leading-snug">{currentQ.q}</p>
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(idx)}
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-left text-xs font-extrabold text-slate-800 cursor-pointer"
                  >
                    {['A', 'B', 'C', 'D'][idx]}. {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'won' && (
            <div className="text-center space-y-3">
              <Trophy className="w-11 h-11 text-amber-500 mx-auto" />
              <h4 className="text-lg font-black text-emerald-950">
                🏆 ബോസ് ചാലഞ്ച് വിജയിച്ചു! ({score}/5 · ബാക്കി {timeLeft}s)
              </h4>
              <p className="text-xs font-bold text-emerald-800">
                +40 വെള്ളി, +15 സ്വർണ്ണം, +1 വജ്രം വാലറ്റിൽ ചേർത്തു!
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[44px] rounded-xl bg-emerald-700 text-white font-black text-sm cursor-pointer"
              >
                തുടരാം →
              </button>
            </div>
          )}

          {phase === 'failed' && (
            <div className="text-center space-y-3">
              <p className="text-base font-black text-rose-900">
                ⏱️ സമയം തീർന്നു അല്ലെങ്കിൽ സ്കോർ കുറവാണ് ({score}/5). കുറഞ്ഞത് 4/5 വേണം!
              </p>
              <button
                type="button"
                onClick={() => {
                  setQIdx(0);
                  setScore(0);
                  setTimeLeft(45);
                  setPhase('playing');
                }}
                className="w-full min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm cursor-pointer"
              >
                വീണ്ടും ശ്രമിക്കാം!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== SMART 1-HOUR COOLDOWN GATE MODAL ====================

export const SmartCooldownGateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { state, skipCooldown } = useEcosystem();
  const [now, setNow] = useState(() => Date.now());
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isOpen]);

  const remainingMs = Math.max(0, state.progression.cooldownUntil - now);
  if (!isOpen || remainingMs <= 0) return null;

  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);

  return (
    <div
      className="fixed inset-0 z-[112] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="പഠന വിശ്രമം"
    >
      <div className="max-w-md w-full my-auto rounded-3xl border-2 border-amber-400 bg-white shadow-2xl p-5 text-center space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-emerald-800">🌿 സ്മാർട്ട് പഠന വിശ്രമം</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="അടയ്ക്കുക"
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Clock className="w-10 h-10 text-amber-500 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900">
            തുടർച്ചയായി 5 പാഠങ്ങൾ പൂർത്തിയാക്കി!
          </h3>
          <p className="text-xs font-semibold text-slate-600 leading-relaxed">
            പഠിച്ച കാര്യങ്ങൾ മനസ്സിൽ ഉറയ്ക്കാൻ ചെറിയൊരു വിശ്രമം എടുക്കാം — അല്ലെങ്കിൽ സ്വർണ്ണ/വജ്രം ഉപയോഗിച്ച് ഇപ്പോൾ തന്നെ തുടരാം!
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 py-3">
          <p className="text-[11px] font-bold text-emerald-800">ബാക്കി സമയം</p>
          <p className="text-2xl font-black font-mono text-emerald-950 tabular-nums">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </p>
        </div>

        {msg && <p className="text-xs font-extrabold text-rose-700">{msg}</p>}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              const res = skipCooldown('gold');
              if (res.ok) {
                sound.playUnlock();
                onClose();
              } else {
                sound.playError();
                setMsg(res.message);
              }
            }}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <GoldCoinSvg className="w-4 h-4" />
            <span>{ANTI_INFLATION_CAPS.COOLDOWN_SKIP_GOLD} സ്വർണ്ണം · തുടരാം</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const res = skipCooldown('diamond');
              if (res.ok) {
                sound.playUnlock();
                onClose();
              } else {
                sound.playError();
                setMsg(res.message);
              }
            }}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <DiamondGemSvg className="w-4 h-4" />
            <span>{ANTI_INFLATION_CAPS.COOLDOWN_SKIP_DIAMOND} വജ്രം · തുടരാം</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== 62/62 GRAND FINALE UNLOCKS VAULT ====================

export const GrandFinaleVaultModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  rank: string;
  completedCount: number;
  devUnlocked?: boolean;
}> = ({ isOpen, onClose, xp, rank, completedCount, devUnlocked = false }) => {
  const { state, ledgerHead } = useEcosystem();
  const [tab, setTab] = useState<'status_card' | 'pocket_vault' | 'rapid_quiz'>('status_card');
  const [search, setSearch] = useState('');
  const [statusExported, setStatusExported] = useState(false);

  // Endless Rapid Quiz state
  const quizKeys = useMemo(() => Object.keys(LESSON_QUIZZES), []);
  const [rapidKey, setRapidKey] = useState<string>(() => quizKeys[0]);
  const [rapidStreak, setRapidStreak] = useState(0);
  const [rapidBest, setRapidBest] = useState(0);
  const [rapidMsg, setRapidMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const unlocked = devUnlocked || completedCount >= ALL_LESSONS.length;
  const filteredLessons = ALL_LESSONS.filter((l) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return l.title.toLowerCase().includes(q) || l.groupLabel.toLowerCase().includes(q);
  });

  const handleDownload916StatusCard = async () => {
    sound.unlockAudio();
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, '#022C22');
    grad.addColorStop(0.55, '#065F46');
    grad.addColorStop(1, '#0F172A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Gold geometric frame
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 10;
    ctx.strokeRect(48, 48, 984, 1824);
    ctx.lineWidth = 3;
    ctx.strokeRect(72, 72, 936, 1776);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('SKSSF GUIDE GAME · GRAND FINALE', 540, 210);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('62/62 പാഠങ്ങൾ പൂർത്തിയാക്കി!', 540, 340);

    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(state.identity.displayName || state.identity.handle, 540, 520);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = 'bold 34px monospace';
    ctx.fillText(`${state.identity.userId} · ${rank}`, 540, 590);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(`⚡ ${xp} XP · 💎 ${state.wallet.diamond} · 🥇 ${state.wallet.gold}`, 540, 740);

    // Origin-locked verification QR
    const cardPayload = createOriginLockedCardPayload({
      type: 'certificate',
      userId: state.identity.userId,
      handle: state.identity.handle,
      name: state.identity.displayName || state.identity.handle,
      xp,
      completedLessons: completedCount,
      rank,
      verificationTier: state.identity.verificationTier,
      ledgerHead,
    });

    try {
      const qr = await QRCode.toDataURL(cardPayload.code, { width: 380, margin: 2 });
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = qr;
      });
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(340, 920, 400, 400);
      ctx.drawImage(img, 350, 930, 380, 380);
    } catch {
      // Ignore QR error
    }

    ctx.fillStyle = '#FDE68A';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('“വിജ്ഞാനം · വിനയം · സേവനം”', 540, 1490);
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '24px sans-serif';
    ctx.fillText('ഇതൊരു പഠന ഗെയിം നേട്ടം മാത്രമാണ് · ഔദ്യോഗിക അംഗത്വ രേഖയല്ല', 540, 1620);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `SKSSF-9x16-Status-${state.identity.userId}.png`;
    a.click();
    sound.playUnlock();
    setStatusExported(true);
  };

  const activeRapidQuiz = LESSON_QUIZZES[rapidKey];

  return (
    <div
      className="fixed inset-0 z-[115] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="ഗ്രാൻഡ് ഫിനാലെ വോൾട്ട്"
    >
      <div className="max-w-2xl w-full max-h-[88vh] overflow-y-auto overscroll-contain my-auto rounded-3xl border-2 border-amber-400 bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 px-5 py-4 text-white border-b-4 border-amber-400 flex items-center justify-between gap-2 sticky top-0 z-10">
          <div>
            <p className="text-[11px] font-black text-amber-300">
              🏆 62/62 ഗ്രാൻഡ് ഫിനാലെ അൺലോക്കുകൾ ({completedCount}/{ALL_LESSONS.length})
            </p>
            <h2 className="text-base sm:text-lg font-black">
              9:16 സ്റ്റാറ്റസ് കാർഡ് · പോക്കറ്റ് വോൾട്ട് · എൻഡ്‌ലെസ് റാപ്പിഡ് ക്വിസ്
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="അടയ്ക്കുക"
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {!unlocked ? (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-amber-600 mx-auto" />
              <p className="text-sm font-black text-amber-950">
                എല്ലാ {ALL_LESSONS.length} പാഠങ്ങളും പൂർത്തിയാക്കുമ്പോൾ ഈ 3 ഗ്രാൻഡ് ഫിനാലെ അൺലോക്കുകളും തുറക്കും!
              </p>
              <p className="text-xs font-bold text-slate-700">
                നിലവിലെ പുരോഗതി: {completedCount} / {ALL_LESSONS.length} പാഠങ്ങൾ
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTab('status_card')}
                  className={`min-h-[40px] px-2 py-2 rounded-xl text-xs font-black cursor-pointer ${
                    tab === 'status_card' ? 'bg-emerald-700 text-white' : 'text-slate-700'
                  }`}
                >
                  📱 9:16 സ്റ്റാറ്റസ് കാർഡ്
                </button>
                <button
                  type="button"
                  onClick={() => setTab('pocket_vault')}
                  className={`min-h-[40px] px-2 py-2 rounded-xl text-xs font-black cursor-pointer ${
                    tab === 'pocket_vault' ? 'bg-emerald-700 text-white' : 'text-slate-700'
                  }`}
                >
                  📚 പോക്കറ്റ് വോൾട്ട്
                </button>
                <button
                  type="button"
                  onClick={() => setTab('rapid_quiz')}
                  className={`min-h-[40px] px-2 py-2 rounded-xl text-xs font-black cursor-pointer ${
                    tab === 'rapid_quiz' ? 'bg-emerald-700 text-white' : 'text-slate-700'
                  }`}
                >
                  ⚡ എൻഡ്‌ലെസ് ക്വിസ്
                </button>
              </div>

              {tab === 'status_card' && (
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-5 text-center space-y-3">
                  <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
                  <h3 className="text-base font-black text-emerald-950">
                    9:16 WhatsApp Status Celebration Card (1080×1920)
                  </h3>
                  <p className="text-xs font-semibold text-slate-700">
                    നിങ്ങളുടെ 62/62 വിജയം, {xp} XP, ഒറിജിൻ-ലോക്ക് QR കോഡ് എന്നിവയടങ്ങിയ ഫുൾ-സ്ക്രീൻ വാട്സ്ആപ്പ് സ്റ്റാറ്റസ് കാർഡ് ഡൗൺലോഡ് ചെയ്യൂ!
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload916StatusCard}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{statusExported ? '✅ ഡൗൺലോഡ് ചെയ്തു (വീണ്ടും എടുക്കാം)' : '9:16 സ്റ്റാറ്റസ് കാർഡ് ഡൗൺലോഡ്'}</span>
                  </button>
                </div>
              )}

              {tab === 'pocket_vault' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="62 പാഠങ്ങളുടെ കുറിപ്പുകളിൽ തിരയുക..."
                      className="w-full min-h-[40px] pl-9 pr-3 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {filteredLessons.map((lesson, i) => {
                      const q = LESSON_QUIZZES[lesson.id];
                      return (
                        <div
                          key={lesson.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1"
                        >
                          <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>
                              {i + 1}. {lesson.emoji} {lesson.title}
                            </span>
                          </p>
                          {q && (
                            <p className="text-[11px] font-semibold text-slate-700 leading-relaxed">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === 'rapid_quiz' && activeRapidQuiz && (
                <div className="rounded-2xl border-2 border-amber-300 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-emerald-800 inline-flex items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-500" /> എൻഡ്‌ലെസ് റാപ്പിഡ് ക്വിസ്
                    </span>
                    <span className="text-amber-900 inline-flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" /> സ്ട്രീക്ക്: {rapidStreak} (മികച്ചത്: {rapidBest})
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 leading-snug">
                    {activeRapidQuiz.question}
                  </p>
                  <div className="space-y-2">
                    {activeRapidQuiz.options.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          const ok = idx === activeRapidQuiz.correctIdx;
                          if (ok) {
                            sound.playSuccess(2);
                            const ns = rapidStreak + 1;
                            setRapidStreak(ns);
                            setRapidBest((b) => Math.max(b, ns));
                            setRapidMsg('✅ ശരിയാണ്! അടുത്ത ചോദ്യം...');
                          } else {
                            sound.playError();
                            setRapidStreak(0);
                            setRapidMsg(`💡 ശരിയുത്തരം: ${activeRapidQuiz.options[activeRapidQuiz.correctIdx]}`);
                          }
                          const nextKey = quizKeys[Math.floor(Math.random() * quizKeys.length)];
                          setRapidKey(nextKey);
                        }}
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-left text-xs font-extrabold cursor-pointer"
                      >
                        {['A', 'B', 'C', 'D'][idx]}. {opt}
                      </button>
                    ))}
                  </div>
                  {rapidMsg && (
                    <p className="text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                      {rapidMsg}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
