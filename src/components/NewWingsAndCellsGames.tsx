import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ExternalLink, RotateCcw, ShieldCheck } from 'lucide-react';
import { OFFICIAL_WING_LOGOS } from '../data/officialLogos';
import { GameFullscreenShell } from './GameFullscreenShell';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';

interface PuzzleGameProps {
  onAwardXp: (amount: number, actionId: string) => void;
  onComplete?: () => void;
  isCompleted?: boolean;
}

/* ============================================================================
 * SHARED REUSABLE CASE-ROUTING STRATEGY ENGINE (USED FOR RICH ADULT PUZZLES)
 * ========================================================================== */
interface ChoiceCard {
  id: string;
  label: string;
  sub: string;
  emoji: string;
  logoSrc?: string;
  url?: string;
}

interface StrategyCase {
  id: string;
  tag: string;
  emoji: string;
  brief: string;
  correctId: string;
  explanation: string;
  link?: { url: string; label: string };
}

const StrategyMatrixEngine: React.FC<{
  shellTitle: string;
  actionPrefix: string;
  completeActionId: string;
  themeBg: string;
  borderCls: string;
  accentBadgeCls: string;
  timeLimitSec?: number;
  choices: ChoiceCard[];
  cases: StrategyCase[];
  introFeedback: string;
  winHeading: string;
  failTitle: string;
  onAwardXp: (amount: number, actionId: string) => void;
  onComplete?: () => void;
  isCompleted?: boolean;
}> = ({
  shellTitle,
  actionPrefix,
  completeActionId,
  themeBg,
  borderCls,
  accentBadgeCls,
  timeLimitSec = 55,
  choices,
  cases,
  introFeedback,
  winHeading,
  failTitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [idx, setIdx] = useState(0);
  const [shields, setShields] = useState(3);
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(isCompleted);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(introFeedback);
  const [isErr, setIsErr] = useState(false);
  const [lastLink, setLastLink] = useState<{ url: string; label: string } | null>(null);

  const failed = Boolean(failReason) && !won;
  const activeCase = cases[idx];

  const reset = () => {
    sound.playClick();
    setIdx(0);
    setShields(3);
    setTimeLeft(timeLimitSec);
    setStarted(false);
    setWon(false);
    setFailReason(null);
    setFeedback(introFeedback);
    setIsErr(false);
    setLastLink(null);
  };

  useEffect(() => {
    if (!started || won || failed) return;
    const t = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          sound.playError();
          setFailReason(`സമയം കഴിഞ്ഞു! ${timeLimitSec} സെക്കൻഡിനുള്ളിൽ എല്ലാ കേസുകളും കൃത്യമായി പരിഹരിക്കണം.`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [started, won, failed, timeLimitSec]);

  const handleSelect = (choice: ChoiceCard) => {
    sound.unlockAudio();
    if (won || failed || !activeCase) return;
    if (!started) setStarted(true);

    if (choice.id === activeCase.correctId) {
      sound.playSuccess(idx + 1);
      setIsErr(false);
      setFeedback(activeCase.explanation);
      if (activeCase.link) {
        setLastLink(activeCase.link);
      } else if (choice.url) {
        setLastLink({ url: choice.url, label: choice.label });
      }
      onAwardXp(10, `${actionPrefix}_${activeCase.id}`);
      narrator.speak(activeCase.explanation, choice.label);

      if (idx + 1 >= cases.length) {
        setWon(true);
        sound.playHoist();
        onAwardXp(30, completeActionId);
        onComplete?.();
      } else {
        setIdx((v) => v + 1);
      }
    } else {
      sound.playError();
      setIsErr(true);
      const nextShields = Math.max(0, shields - 1);
      setShields(nextShields);
      if (nextShields <= 0) {
        setFailReason('3 തവണ തെറ്റായ ഓപ്ഷൻ തിരഞ്ഞെടുത്തു — വീണ്ടും ശ്രദ്ധയോടെ ശ്രമിക്കാം!');
      } else {
        setFeedback(`ആ വിഭാഗമല്ല! ചോദ്യത്തിലെ സൂചന വീണ്ടും വായിക്കൂ (ബാക്കി കവചങ്ങൾ: ${nextShields})`);
      }
    }
  };

  return (
    <GameFullscreenShell title={shellTitle} isGameDone={won}>
      <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3.5 sm:p-4 space-y-3 shadow-sm">
        <div
          className={`relative rounded-2xl overflow-hidden border-2 ${borderCls} ${themeBg} text-white shadow-inner select-none`}
        >
          {/* HUD Bar */}
          <div className="bg-slate-950/90 px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-white/15">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold tabular-nums ${accentBadgeCls}`}>
                {won ? cases.length : idx}/{cases.length}
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-xs font-extrabold tabular-nums ${
                  timeLeft <= 10 && started && !won
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-800 text-white'
                }`}
              >
                ⏱️ {timeLeft}s
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <GameShatterLives lives={shields} maxLives={3} compact />
              {(started || won || failed) && (
                <button
                  type="button"
                  onClick={reset}
                  aria-label="വീണ്ടും കളിക്കാം"
                  title="വീണ്ടും കളിക്കാം"
                  className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-3.5 sm:p-4 space-y-3">
            {!won && activeCase ? (
              <>
                <motion.div
                  key={activeCase.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-white text-slate-900 border-2 border-amber-300 p-3.5 shadow-md space-y-1.5"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xl shrink-0">
                      {activeCase.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black text-emerald-800">
                        കേസ് #{idx + 1} · {activeCase.tag}
                      </p>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug mt-0.5">
                        {activeCase.brief}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {choices.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      disabled={failed}
                      onClick={() => handleSelect(ch)}
                      className="rounded-xl bg-white/10 hover:bg-emerald-600/85 active:scale-[0.98] border border-white/25 hover:border-amber-300 p-2.5 text-left flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      {ch.logoSrc ? (
                        <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                          <img src={ch.logoSrc} alt={ch.label} className="max-h-7 w-full object-contain" />
                        </div>
                      ) : (
                        <span className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-lg shrink-0">
                          {ch.emoji}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-white leading-tight">{ch.label}</p>
                        <p className="text-[10px] font-semibold text-amber-200/95 leading-snug mt-0.5">{ch.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-emerald-900/80 border-2 border-amber-300 p-4 text-center space-y-3">
                <p className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{winHeading}</span>
                </p>
                {choices.some((c) => c.url) && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {choices
                      .filter((c) => c.url)
                      .map((c) => (
                        <a
                          key={c.id}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sound.playClick()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-950 hover:bg-amber-200 text-xs font-extrabold shadow-xs transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{c.label}</span>
                        </a>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {failed && (
            <GameDefeatBurstOverlay
              title={failTitle}
              reason={failReason || 'വീണ്ടും ശ്രമിക്കാം!'}
              scoreText={`പരിഹരിച്ചവ: ${idx}/${cases.length}`}
              onRetry={reset}
            />
          )}
        </div>

        {/* Live Feedback Strip */}
        <div
          className={`rounded-xl px-3 py-2 text-xs font-extrabold border flex flex-wrap items-center justify-between gap-2 ${
            isErr
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <span className="flex-1 min-w-[200px] leading-relaxed">{feedback}</span>
          {lastLink && (
            <a
              href={lastLink.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-extrabold shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{lastLink.label}</span>
            </a>
          )}
        </div>
      </div>
    </GameFullscreenShell>
  );
};

/* ============================================================================
 * LESSON 53 GAME: TWALABA WING — DARS & ARABIC COLLEGE STRATEGY DESK
 * ========================================================================== */
export const TwalabaConferencePuzzleGame: React.FC<PuzzleGameProps> = (props) => (
  <StrategyMatrixEngine
    {...props}
    shellTitle="📜 ത്വലബ വിംഗ് — ദർസ് & അറബിക് കോളേജ് ഏകോപന പസിൽ"
    actionPrefix="l4_twalaba"
    completeActionId="l4_twalaba_complete"
    themeBg="bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950"
    borderCls="border-emerald-400/70"
    accentBadgeCls="bg-emerald-500/30 text-emerald-200"
    introFeedback="ഓരോ മതവിദ്യാർത്ഥി ആവശ്യവും വായിച്ച് ശരിയായ ത്വലബ വിംഗ് പദ്ധതിയിലേക്ക് വിന്യസിക്കൂ!"
    winHeading="ത്വലബ വിംഗ് ഏകോപന ദൗത്യം വിജയകരമായി പൂർത്തിയാക്കി!"
    failTitle="ത്വലബ ഏകോപനം തടസ്സപ്പെട്ടു!"
    choices={[
      {
        id: 'dars_unit',
        label: 'സ്ഥാപനതല ത്വലബ യൂണിറ്റ്',
        sub: 'പള്ളി ദർസ് & അറബിക് കോളേജ് കൂട്ടായ്മ',
        emoji: '🕌',
        logoSrc: OFFICIAL_WING_LOGOS.thwalaba.src,
        url: 'https://skssf.in/twalaba/',
      },
      {
        id: 'lang_oratory',
        label: 'ഭാഷാ–പ്രഭാഷണ പരിശീലന കളരി',
        sub: 'അറബി · ഇംഗ്ലീഷ് · ഉറുദു & രചനാ മികവ്',
        emoji: '🎙️',
      },
      {
        id: 'kerala_conf',
        label: 'കേരള ത്വലബ കോൺഫറൻസ്',
        sub: 'സംസ്ഥാനതല മുതഅല്ലിം സംഗമവും പ്രമേയവും',
        emoji: '🏛️',
      },
      {
        id: 'welfare_desk',
        label: 'മുതഅല്ലിം ക്ഷേമ & ഹെൽത്ത് ഡെസ്ക്',
        sub: 'ആരോഗ്യ–പഠന–കിതാബ് സഹായ പദ്ധതികൾ',
        emoji: '🤝',
      },
    ]}
    cases={[
      {
        id: 'tw1',
        tag: 'പള്ളി ദർസ് സംഘാടനം',
        emoji: '📚',
        brief:
          'പുതിയതായി തുടങ്ങിയ ഒരു പള്ളി ദർസിലെ 45 മുതഅല്ലിമുകളെ ആഴ്ചതോറുമുള്ള സാഹിത്യ സമാജവും സംഘടനാ ശിക്ഷണവുമായി ഏകോപിപ്പിക്കണം.',
        correctId: 'dars_unit',
        explanation:
          'പള്ളി ദർസുകളിലും അറബിക് കോളേജുകളിലും സ്ഥാപനതല ത്വലബ യൂണിറ്റ് രൂപീകരിച്ചാണ് മുതഅല്ലിമുകളെ ചിട്ടയായി വളർത്തുന്നത്.',
      },
      {
        id: 'tw2',
        tag: 'അന്താരാഷ്ട്ര പ്രബോധന തയ്യാറെടുപ്പ്',
        emoji: '🌍',
        brief:
          'അറബിക് കോളേജിൽ പഠിക്കുന്ന വിദ്യാർത്ഥികൾക്ക് ഫിഖ്ഹ് പഠനത്തോടൊപ്പം ഇംഗ്ലീഷിലും അറബിയിലും ഉറുദുവിലും പ്രഭാഷണവും ലേഖന രചനയും പരിശീലിപ്പിക്കണം.',
        correctId: 'lang_oratory',
        explanation:
          'ബഹുഭാഷാ പ്രാവീണ്യവും പ്രഭാഷണ-രചനാ മികവും വളർത്തുന്ന ഭാഷാ പരിശീലന കളരികളാണ് ത്വലബ വിംഗിന്റെ കരുത്ത്.',
      },
      {
        id: 'tw3',
        tag: 'സംസ്ഥാന നയരൂപീകരണം',
        emoji: '🚩',
        brief:
          'കേരളത്തിലെ ആയിരക്കണക്കിന് ദർസ്-അറബിക് കോളേജ് വിദ്യാർത്ഥികളെ ഒരു വേദിയിൽ അണിനിരത്തി വിദ്യാഭ്യാസ-ആദർശ നയരേഖ അവതരിപ്പിക്കണം.',
        correctId: 'kerala_conf',
        explanation:
          'കേരള ത്വലബ കോൺഫറൻസിലൂടെയാണ് മതവിദ്യാർത്ഥികളുടെ സംസ്ഥാനതല കൂട്ടായ്മയും ദിശാബോധവും രൂപപ്പെടുന്നത്.',
      },
      {
        id: 'tw4',
        tag: 'വിദ്യാർത്ഥി കരുതൽ',
        emoji: '💊',
        brief:
          'ദൂരദേശങ്ങളിൽ നിന്ന് ദർസിൽ താമസിച്ച് പഠിക്കുന്ന നിർദ്ധന മുതഅല്ലിമുകൾക്ക് കിതാബുകളും അടിയന്തര ചികിത്സാ പിന്തുണയും ഉറപ്പാക്കണം.',
        correctId: 'welfare_desk',
        explanation:
          'മുതഅല്ലിം ക്ഷേമ ഡെസ്ക് വഴി ആരോഗ്യ-കിതാബ്-വിദ്യാഭ്യാസ പിന്തുണ നൽകുന്നത് ത്വലബ വിംഗിന്റെ പ്രധാന ഉത്തരവാദിത്തമാണ്.',
      },
    ]}
  />
);

/* ============================================================================
 * LESSON 54 GAME: ISTHIQAMA & MANEESHA — 2-STEP IDEOLOGICAL DEDUCTION PUZZLE
 * ========================================================================== */
interface IdeoPuzzleCase {
  id: string;
  context: string;
  scenario: string;
  wing: 'isthiqama' | 'maneesha';
  actions: { id: string; label: string; isCorrect: boolean }[];
  explanation: string;
}

const IDEO_CASES: IdeoPuzzleCase[] = [
  {
    id: 'im1',
    context: 'ആദർശ പ്രതിരോധം',
    scenario:
      'കോളേജ് വിദ്യാർത്ഥികൾക്കിടയിൽ നിരീശ്വരവാദവും ലിബറൽ ആശയങ്ങളും പ്രചരിപ്പിക്കുന്ന പ്രചാരണം നടക്കുന്നു. ഇതിന് മറുപടി നൽകാൻ ഏത് വിംഗാണ് മുന്നിൽ നിൽക്കേണ്ടത്, എന്ത് നടപടിയാണ് വേണ്ടത്?',
    wing: 'isthiqama',
    actions: [
      { id: 'a1', label: 'വൈകാരികമായ തെറിവിളിയും സമൂഹമാധ്യമ വഴക്കും നടത്തുക', isCorrect: false },
      {
        id: 'a2',
        label: 'സമസ്ത മുശാവറ പണ്ഡിതരുടെ മേൽനോട്ടത്തിൽ ശാസ്ത്രീയ ആദർശ പഠന ക്യാമ്പും സംവാദ ക്ലാസും സംഘടിപ്പിക്കുക',
        isCorrect: true,
      },
    ],
    explanation:
      'ഇസ്തിഖാമ (Isthiqama) വിംഗാണ് നിരീശ്വരവാദം, ലിബറലിസം, പുത്തനാശയങ്ങൾ എന്നിവയെ പണ്ഡിത മാർഗ്ഗനിർദ്ദേശത്തിൽ ശാസ്ത്രീയമായി പ്രതിരോധിക്കുന്നത്.',
  },
  {
    id: 'im2',
    context: 'സാംസ്കാരിക–ബൗദ്ധിക വേദി',
    scenario:
      'മലബാർ ചരിത്രവും കേരള ഇസ്‌ലാമിക പൈതൃകവും വളച്ചൊടിക്കുന്ന ലേഖനങ്ങൾക്കെതിരെ എഴുത്തുകാരെയും ഗവേഷകരെയും ചേർത്ത് പുസ്തക ചർച്ചയും ചരിത്ര ഡോക്യുമെന്റേഷനും നടത്തണം.',
    wing: 'maneesha',
    actions: [
      {
        id: 'a1',
        label: 'അക്കാദമിക് സെമിനാറുകളും വായനാ സംവാദങ്ങളും ചരിത്ര ഗവേഷണ പ്രസിദ്ധീകരണങ്ങളും സംഘടിപ്പിക്കുക',
        isCorrect: true,
      },
      { id: 'a2', label: 'ചരിത്ര ചർച്ചകൾ ഒഴിവാക്കി വെറും മുദ്രാവാക്യം മാത്രം മുഴക്കുക', isCorrect: false },
    ],
    explanation:
      '“ഇടം നേടുകയല്ല, ഇടപെടുകയാണ്” എന്ന മുദ്രാവാക്യവുമായി പ്രവർത്തിക്കുന്ന മനീഷ (Maneesha) ആണ് ബൗദ്ധിക-സാംസ്കാരിക-ചരിത്ര ഇടപെടലുകൾ നയിക്കുന്നത്.',
  },
  {
    id: 'im3',
    context: 'വിശ്വാസ സംരക്ഷണം',
    scenario:
      'അഹ്ലുസ്സുന്നത്ത് ആശയങ്ങളിൽ സംശയം ജനിപ്പിക്കുന്ന പുത്തനാശയ വാദങ്ങൾക്ക് പ്രമാണബദ്ധമായ മറുപടി നൽകാൻ യുവപണ്ഡിതർക്ക് പരിശീലനം വേണം.',
    wing: 'isthiqama',
    actions: [
      { id: 'a1', label: 'സംസ്ഥാനതല ഇസ്തിഖാമ ആദർശ പരിശീലന ക്യാമ്പും റഫറൻസ് സീരീസും നടത്തുക', isCorrect: true },
      { id: 'a2', label: 'പ്രമാണമില്ലാത്ത വാട്സ്ആപ്പ് ഫോർവേഡുകൾ മാത്രം അയക്കുക', isCorrect: false },
    ],
    explanation:
      'ആധികാരിക പ്രമാണങ്ങളുടെ അടിസ്ഥാനത്തിൽ യുവപ്രബോധകരെ വാർത്തെടുക്കുന്ന സംസ്ഥാന വിംഗാണ് ഇസ്തിഖാമ.',
  },
  {
    id: 'im4',
    context: 'പൊതുവേദിയിലെ സാംസ്കാരിക സംവാദം',
    scenario:
      'സർവ്വകലാശാലാ ക്യാമ്പസുകളിൽ സാഹിത്യം, ഭരണഘടനാ മൂല്യങ്ങൾ, ബഹുസ്വരത എന്നിവയെക്കുറിച്ച് ആരോഗ്യകരമായ ബൗദ്ധിക സംവാദ വേദി ഒരുക്കണം.',
    wing: 'maneesha',
    actions: [
      { id: 'a1', label: 'കലാലയങ്ങളിൽ അധ്യാപകരെയും എഴുത്തുകാരെയും പങ്കെടുപ്പിച്ച് മനീഷ ഡയലോഗ് ഫോറം നടത്തുക', isCorrect: true },
      { id: 'a2', label: 'സാംസ്കാരിക സംവാദങ്ങളിൽ നിന്ന് പൂർണ്ണമായും പിന്മാറുക', isCorrect: false },
    ],
    explanation:
      'പൊതുബൗദ്ധിക മണ്ഡലത്തിൽ അർത്ഥവത്തായ സാംസ്കാരിക ഇടപെടൽ നടത്തുന്ന SKSSF ഫോറമാണ് മനീഷ.',
  },
];

export const IsthiqamaManeeshaPuzzleGame: React.FC<PuzzleGameProps> = ({
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [idx, setIdx] = useState(0);
  const [pickedWing, setPickedWing] = useState<'isthiqama' | 'maneesha' | null>(null);
  const [shields, setShields] = useState(3);
  const [won, setWon] = useState(isCompleted);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(
    'ഘട്ടം 1: ശരിയായ വിംഗ് (ഇസ്തിഖാമ / മനീഷ) തിരഞ്ഞെടുക്കുക → ഘട്ടം 2: ഉചിതമായ പ്രായോഗിക തന്ത്രം തിരഞ്ഞെടുക്കുക!'
  );
  const [isErr, setIsErr] = useState(false);

  const failed = Boolean(failReason) && !won;
  const active = IDEO_CASES[idx];

  const reset = () => {
    sound.playClick();
    setIdx(0);
    setPickedWing(null);
    setShields(3);
    setWon(false);
    setFailReason(null);
    setIsErr(false);
    setFeedback(
      'ഘട്ടം 1: ശരിയായ വിംഗ് (ഇസ്തിഖാമ / മനീഷ) തിരഞ്ഞെടുക്കുക → ഘട്ടം 2: ഉചിതമായ പ്രായോഗിക തന്ത്രം തിരഞ്ഞെടുക്കുക!'
    );
  };

  const handleAction = (actionId: string) => {
    sound.unlockAudio();
    if (won || failed || !active) return;
    if (!pickedWing) {
      setIsErr(true);
      setFeedback('ആദ്യം ഇസ്തിഖാമയാണോ മനീഷയാണോ നേതൃത്വം നൽകേണ്ടതെന്ന് മുകളിൽ തിരഞ്ഞെടുക്കൂ!');
      return;
    }

    const action = active.actions.find((a) => a.id === actionId);
    const wingOk = pickedWing === active.wing;
    const actionOk = Boolean(action?.isCorrect);

    if (wingOk && actionOk) {
      sound.playSuccess(idx + 1);
      setIsErr(false);
      setFeedback(active.explanation);
      onAwardXp(15, `l4_im_${active.id}`);
      narrator.speak(active.explanation);

      if (idx + 1 >= IDEO_CASES.length) {
        setWon(true);
        sound.playHoist();
        onAwardXp(30, 'l4_isthiqama_maneesha_complete');
        onComplete?.();
      } else {
        setIdx((v) => v + 1);
        setPickedWing(null);
      }
    } else {
      sound.playError();
      setIsErr(true);
      const nextShields = Math.max(0, shields - 1);
      setShields(nextShields);
      if (nextShields <= 0) {
        setFailReason('3 തവണ തന്ത്രം പിഴച്ചു — വിംഗും നടപടിയും വീണ്ടും വിലയിരുത്തി ശ്രമിക്കാം!');
      } else {
        setFeedback(
          !wingOk
            ? `തിരഞ്ഞെടുത്ത വിംഗ് ഒരിക്കൽ കൂടി പരിശോധിക്കൂ (ആദർശ പ്രതിരോധം = ഇസ്തിഖാമ, സാംസ്കാരിക-ബൗദ്ധിക സംവാദം = മനീഷ). ബാക്കി കവചം: ${nextShields}`
            : `വിംഗ് ശരിയാണ്, പക്ഷേ ആ നടപടി അനുയോജ്യമല്ല! പ്രമാണബദ്ധമായ ശരിയായ രീതി തിരഞ്ഞെടുക്കൂ (ബാക്കി കവചം: ${nextShields})`
        );
      }
    }
  };

  return (
    <GameFullscreenShell title="🧠 ഇസ്തിഖാമ & മനീഷ — 2-ഘട്ട ആദർശ-ബൗദ്ധിക പസിൽ" isGameDone={won}>
      <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3.5 sm:p-4 space-y-3 shadow-sm">
        <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-400/70 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white shadow-inner">
          <div className="bg-slate-950/90 px-3 py-2 flex items-center justify-between gap-2 border-b border-white/15">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-md px-1.5 py-0.5 flex items-center gap-1">
                <img src={OFFICIAL_WING_LOGOS.isthiqama.src} alt="Isthiqama" className="h-5 w-auto object-contain" />
                <img src={OFFICIAL_WING_LOGOS.maneesha.src} alt="Maneesha" className="h-5 w-auto object-contain" />
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-100 text-xs font-extrabold tabular-nums">
                {won ? IDEO_CASES.length : idx}/{IDEO_CASES.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <GameShatterLives lives={shields} maxLives={3} compact />
              <button
                type="button"
                onClick={reset}
                aria-label="വീണ്ടും കളിക്കാം"
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 space-y-3">
            {!won && active ? (
              <>
                <div className="rounded-2xl bg-white text-slate-900 border-2 border-amber-300 p-3.5 space-y-1">
                  <p className="text-[10px] font-black text-indigo-800">
                    കേസ് #{idx + 1} · {active.context}
                  </p>
                  <p className="text-xs sm:text-sm font-extrabold leading-snug">{active.scenario}</p>
                </div>

                {/* Step 1: Pick Wing */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-extrabold text-amber-300">ഘട്ടം 1: ഏത് വിംഗ് നേതൃത്വം നൽകണം?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        {
                          id: 'isthiqama',
                          label: 'ഇസ്തിഖാമ (Isthiqama)',
                          sub: 'ആദർശ പ്രചാരണവും പ്രതിരോധവും',
                          logo: OFFICIAL_WING_LOGOS.isthiqama.src,
                        },
                        {
                          id: 'maneesha',
                          label: 'മനീഷ (Maneesha)',
                          sub: 'ബൗദ്ധിക–സാംസ്കാരിക ഇടപെടൽ',
                          logo: OFFICIAL_WING_LOGOS.maneesha.src,
                        },
                      ] as const
                    ).map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setPickedWing(w.id);
                        }}
                        className={`rounded-xl p-2.5 border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                          pickedWing === w.id
                            ? 'bg-emerald-600 border-amber-300 text-white shadow-md'
                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
                          <img src={w.logo} alt={w.label} className="max-h-7 w-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold leading-tight">{w.label}</p>
                          <p className="text-[10px] text-amber-100 leading-tight mt-0.5">{w.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Pick Strategic Action */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-extrabold text-amber-300">ഘട്ടം 2: ഉചിതമായ തന്ത്രം തിരഞ്ഞെടുത്ത് സമർപ്പിക്കൂ:</p>
                  <div className="space-y-2">
                    {active.actions.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        disabled={failed}
                        onClick={() => handleAction(act.id)}
                        className="w-full rounded-xl bg-white/10 hover:bg-emerald-600/85 border border-white/25 hover:border-amber-300 px-3 py-2.5 text-left text-xs font-extrabold text-white leading-snug transition-all cursor-pointer"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-emerald-900/80 border-2 border-amber-300 p-4 text-center space-y-2">
                <p className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>ഇസ്തിഖാമ &amp; മനീഷ 2-ഘട്ട ബൗദ്ധിക പസിൽ പൂർണ്ണ വിജയം!</span>
                </p>
              </div>
            )}
          </div>

          {failed && (
            <GameDefeatBurstOverlay
              title="ആദർശ-ബൗദ്ധിക പസിൽ പരാജയപ്പെട്ടു!"
              reason={failReason || 'വീണ്ടും ശ്രമിക്കാം!'}
              scoreText={`പൂർത്തിയാക്കിയവ: ${idx}/${IDEO_CASES.length}`}
              onRetry={reset}
            />
          )}
        </div>

        <div
          className={`rounded-xl px-3 py-2 text-xs font-extrabold border ${
            isErr ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          {feedback}
        </div>
      </div>
    </GameFullscreenShell>
  );
};

/* ============================================================================
 * LESSON 55 GAME: MEEM — RURAL MEDICAL CAMP RESOURCE ALLOCATION PUZZLE
 * ========================================================================== */
export const MeemMedicalCampGame: React.FC<PuzzleGameProps> = (props) => (
  <StrategyMatrixEngine
    {...props}
    shellTitle="🩺 മീം (MEEM) — ഗ്രാമീണ മെഡിക്കൽ ക്യാമ്പ് ട്രയാജ് പസിൽ"
    actionPrefix="l4_meem"
    completeActionId="l4_meem_complete"
    themeBg="bg-gradient-to-b from-teal-950 via-emerald-950 to-slate-950"
    borderCls="border-teal-400/70"
    accentBadgeCls="bg-teal-500/30 text-teal-100"
    introFeedback="ഗ്രാമീണ മെഡിക്കൽ ക്യാമ്പിലെ ഓരോ അടിയന്തര ആവശ്യത്തിനും കൃത്യമായ MEEM യൂണിറ്റിനെ നിയോഗിക്കൂ!"
    winHeading="MEEM ഗ്രാമീണ മെഡിക്കൽ ക്യാമ്പ് & സാന്ത്വന ദൗത്യം വിജയിച്ചു!"
    failTitle="മെഡിക്കൽ ക്യാമ്പ് ഏകോപനം തടസ്സപ്പെട്ടു!"
    choices={[
      {
        id: 'specialty_camp',
        label: 'സ്പെഷ്യാലിറ്റി മെഡിക്കൽ ക്യാമ്പ്',
        sub: 'ഡോക്ടർമാരുടെ സൗജന്യ പരിശോധന & മരുന്ന്',
        emoji: '🩺',
        logoSrc: OFFICIAL_WING_LOGOS.meem.src,
        url: 'https://skssf.in/meem/',
      },
      {
        id: 'palliative_care',
        label: 'പാലിയേറ്റീവ് & ഹോം കെയർ ടീം',
        sub: 'കിടപ്പുരോഗികൾക്ക് വീട്ടിലെത്തി പരിചരണം',
        emoji: '🏠',
      },
      {
        id: 'ethics_circle',
        label: 'മെഡിക്കൽ എത്തിക്സ് & മീം സർക്കിൾ',
        sub: 'മെഡിക്കൽ വിദ്യാർത്ഥികളുടെ ധാർമ്മിക കൂട്ടായ്മ',
        emoji: '🎓',
      },
      {
        id: 'sahachari_link',
        label: 'സഹചാരി റിലീഫ് റഫറൽ ഡെസ്ക്',
        sub: 'ഡയാലിസിസ്–കാൻസർ തുടർചികിത്സാ സഹായം',
        emoji: '🤝',
        logoSrc: OFFICIAL_WING_LOGOS.sahachari.src,
        url: 'https://www.skssfsahachari.com/',
      },
    ]}
    cases={[
      {
        id: 'm1',
        tag: 'പിന്നാക്ക ഗ്രാമം',
        emoji: '🚑',
        brief:
          'ആശുപത്രി സൗകര്യം കുറഞ്ഞ മലയോര പ്രദേശത്തെ 200 പേർക്ക് പ്രമേഹം, രക്തസമ്മർദ്ദം, നേത്ര പരിശോധനയും സൗജന്യ മരുന്നും ഒരുക്കണം.',
        correctId: 'specialty_camp',
        explanation:
          'MEEM-ലെ ഡോക്ടർമാരും ആരോഗ്യപ്രവർത്തകരും ചേർന്ന് സംഘടിപ്പിക്കുന്ന സൗജന്യ സ്പെഷ്യാലിറ്റി മെഡിക്കൽ ക്യാമ്പാണ് ഇതിന് ഉത്തരം.',
      },
      {
        id: 'm2',
        tag: 'കിടപ്പുരോഗി പരിചരണം',
        emoji: '💙',
        brief:
          'ക്യാമ്പിലേക്ക് വരാൻ കഴിയാത്ത പ്രായമായ കിടപ്പുരോഗികൾക്ക് ആഴ്ചതോറും വീട്ടിലെത്തി മുറിവ് വെച്ചുകെട്ടാനും സാന്ത്വന പരിചരണത്തിനും ടീം വേണം.',
        correctId: 'palliative_care',
        explanation:
          'പാലിയേറ്റീവ് ഹോം കെയർ ടീം വഴിയാണ് കിടപ്പുരോഗികൾക്ക് വീട്ടിലെത്തി കരുതലേകുന്നത്.',
      },
      {
        id: 'm3',
        tag: 'മെഡിക്കൽ കോളേജ് ക്യാമ്പസ്',
        emoji: '📘',
        brief:
          'MBBS, നഴ്സിംഗ്, പാരാമെഡിക്കൽ വിദ്യാർത്ഥികൾക്ക് സേവനമനസ്സും മെഡിക്കൽ എത്തിക്സും വളർത്താൻ ക്യാമ്പസിൽ കൂട്ടായ്മ തുടങ്ങണം.',
        correctId: 'ethics_circle',
        explanation:
          'Medical Eminence for Ethical Movement (MEEM) സർക്കിളുകളിലൂടെയാണ് മെഡിക്കൽ വിദ്യാർത്ഥികളിൽ ധാർമ്മിക ബോധം വളർത്തുന്നത്.',
      },
      {
        id: 'm4',
        tag: 'ദീർഘകാല ചികിത്സാ സഹായം',
        emoji: '🏥',
        brief:
          'ക്യാമ്പിലെ പരിശോധനയിൽ നിർദ്ധനനായ ഒരു രോഗിക്ക് തുടർ ഡയാലിസിസും വീൽചെയറും അടിയന്തരമായി ആവശ്യമാണെന്ന് കണ്ടെത്തി.',
        correctId: 'sahachari_link',
        explanation:
          'സഹചാരി റിലീഫ് സെല്ലുമായി ചേർന്നാണ് MEEM ദീർഘകാല കാൻസർ-ഡയാലിസിസ് ചികിത്സാ സഹായങ്ങൾ ഉറപ്പാക്കുന്നത്.',
      },
    ]}
  />
);

/* ============================================================================
 * LESSON 56 GAME: IFC — 20-HOUSE CLUSTER BUILDER & FAMILY GUIDANCE PUZZLE
 * ========================================================================== */
const IFC_DILEMMAS = [
  {
    id: 'ifc1',
    title: 'വിവാഹപൂർവ്വ ബോധവൽക്കരണം',
    prompt:
      'മഹല്ലിലെ യുവതീയുവാക്കൾക്ക് ദാമ്പത്യ ഉത്തരവാദിത്തങ്ങളും കുടുംബ സമാധാനവും ശാസ്ത്രീയമായി പഠിപ്പിക്കാൻ IFC എന്ത് പദ്ധതിയാണ് നടത്തേണ്ടത്?',
    options: [
      { id: 'o1', label: 'പ്രീ-മാരിറ്റൽ & ഫാമിലി കൗൺസിലിംഗ് ശിൽപശാല', ok: true },
      { id: 'o2', label: 'വിവാഹ വേദിയിലെ അലങ്കാര മത്സരം മാത്രം', ok: false },
    ],
    note: 'ഇസ്‌ലാമിക് ഫാമിലി ക്ലസ്റ്ററിന്റെ (IFC) പ്രധാന ദൗത്യങ്ങളിലൊന്നാണ് വിവാഹപൂർവ്വ-കുടുംബ കൗൺസിലിംഗ്.',
  },
  {
    id: 'ifc2',
    title: 'മാതൃകാ പാരന്റിംഗ് & ഡിജിറ്റൽ ശീലം',
    prompt:
      'കുട്ടികളുടെ അമിത മൊബൈൽ ഉപയോഗവും പഠനശ്രദ്ധക്കുറവും പരിഹരിക്കാൻ 20 വീടുകളിലെ മാതാപിതാക്കൾക്ക് എന്ത് ഇടപെടലാണ് ഫലപ്രദം?',
    options: [
      { id: 'o1', label: 'കുട്ടികളോട് എപ്പോഴും ദേഷ്യപ്പെട്ട് സംസാരിക്കാൻ നിർദ്ദേശിക്കുക', ok: false },
      { id: 'o2', label: 'പ്രതിമാസ ക്ലസ്റ്റർ സദസ്സിൽ പോസിറ്റീവ് പാരന്റിംഗ് & സ്നേഹപൂർണ്ണമായ മാർഗ്ഗനിർദ്ദേശം നൽകുക', ok: true },
    ],
    note: '20 വീടുകൾ ചേർന്ന ക്ലസ്റ്ററുകളിലെ പ്രതിമാസ സദസ്സുകളിലൂടെയാണ് IFC മാതൃകാ പാരന്റിംഗ് വളർത്തുന്നത്.',
  },
  {
    id: 'ifc3',
    title: 'വനിതാ ശാക്തീകരണം',
    prompt:
      'വീട്ടമ്മമാർക്ക് മതപഠനത്തോടൊപ്പം സാമ്പത്തിക സ്വയംപര്യാപ്തത നേടാൻ IFC ക്ലസ്റ്ററിൽ എന്ത് ചേർക്കാം?',
    options: [
      { id: 'o1', label: 'വനിതാ പഠന ക്ലാസുകൾക്കൊപ്പം സ്വയംതൊഴിൽ-നൈപുണ്യ പരിശീലനവും', ok: true },
      { id: 'o2', label: 'പഠന ക്ലാസുകൾ പൂർണ്ണമായി നിർത്തിവെക്കുക', ok: false },
    ],
    note: 'വനിതാ മതപഠനത്തോടൊപ്പം കുടുംബ ഭദ്രതയ്ക്കും സ്വയംതൊഴിൽ പരിശീലനത്തിനും IFC പ്രാധാന്യം നൽകുന്നു.',
  },
];

export const IfcFamilyClusterGame: React.FC<PuzzleGameProps> = ({
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [phase, setPhase] = useState<'cluster' | 'cases'>(isCompleted ? 'cases' : 'cluster');
  const [clusterSize, setClusterSize] = useState<number>(10);
  const [clusterCount, setClusterCount] = useState<number>(6);
  const [caseIdx, setCaseIdx] = useState(0);
  const [shields, setShields] = useState(3);
  const [won, setWon] = useState(isCompleted);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(
    'ഘട്ടം 1: 60 വീടുകളുള്ള മഹല്ലിനെ IFC മാതൃകയിൽ കൃത്യം എത്ര വീടുകളുടെ ക്ലസ്റ്ററുകളായി തിരിക്കണം? സ്ലൈഡർ ക്രമീകരിച്ച് ഉറപ്പിക്കൂ!'
  );
  const [isErr, setIsErr] = useState(false);

  const failed = Boolean(failReason) && !won;
  const activeCase = IFC_DILEMMAS[caseIdx];

  const reset = () => {
    sound.playClick();
    setPhase('cluster');
    setClusterSize(10);
    setClusterCount(6);
    setCaseIdx(0);
    setShields(3);
    setWon(false);
    setFailReason(null);
    setIsErr(false);
    setFeedback(
      'ഘട്ടം 1: 60 വീടുകളുള്ള മഹല്ലിനെ IFC മാതൃകയിൽ കൃത്യം എത്ര വീടുകളുടെ ക്ലസ്റ്ററുകളായി തിരിക്കണം? സ്ലൈഡർ ക്രമീകരിച്ച് ഉറപ്പിക്കൂ!'
    );
  };

  const checkClusterPlan = () => {
    sound.unlockAudio();
    if (clusterSize === 20 && clusterCount === 3) {
      sound.playSuccess(1);
      setIsErr(false);
      setFeedback('കൃത്യം! 20 വീടുകൾ = 1 IFC ക്ലസ്റ്റർ (60 വീടുകൾ = 3 ക്ലസ്റ്ററുകൾ). ഇനി ഘട്ടം 2: കുടുംബ കൗൺസിലിംഗ് കേസുകൾ പരിഹരിക്കൂ!');
      onAwardXp(15, 'l4_ifc_cluster_math');
      setPhase('cases');
    } else {
      sound.playError();
      setIsErr(true);
      const next = Math.max(0, shields - 1);
      setShields(next);
      if (next <= 0) {
        setFailReason('ക്ലസ്റ്റർ കണക്ക് 3 തവണ പിഴച്ചു! സൂചന: IFC-യിൽ 20 വീടുകളാണ് ഒരു ക്ലസ്റ്റർ (20 × 3 = 60).');
      } else {
        setFeedback(`ഇപ്പോൾ ${clusterSize} × ${clusterCount} = ${clusterSize * clusterCount} വീടുകൾ. IFC നിയമം: 20 വീടുകൾ ചേർന്ന 1 ക്ലസ്റ്റർ! (ബാക്കി കവചം: ${next})`);
      }
    }
  };

  const handleCasePick = (ok: boolean) => {
    sound.unlockAudio();
    if (won || failed || !activeCase) return;
    if (ok) {
      sound.playSuccess(caseIdx + 2);
      setIsErr(false);
      setFeedback(activeCase.note);
      onAwardXp(10, `l4_ifc_${activeCase.id}`);
      narrator.speak(activeCase.note);
      if (caseIdx + 1 >= IFC_DILEMMAS.length) {
        setWon(true);
        sound.playHoist();
        onAwardXp(30, 'l4_ifc_complete');
        onComplete?.();
      } else {
        setCaseIdx((v) => v + 1);
      }
    } else {
      sound.playError();
      setIsErr(true);
      const next = Math.max(0, shields - 1);
      setShields(next);
      if (next <= 0) {
        setFailReason('3 തവണ തെറ്റായ തീരുമാനം തിരഞ്ഞെടുത്തു — വീണ്ടും ശ്രമിക്കാം!');
      } else {
        setFeedback(`ആ രീതി കുടുംബ സമാധാനത്തിന് അനുയോജ്യമല്ല — വീണ്ടും ചിന്തിക്കൂ (ബാക്കി കവചം: ${next})`);
      }
    }
  };

  return (
    <GameFullscreenShell title="🏡 IFC — 20-വീട് ഫാമിലി ക്ലസ്റ്റർ & കൗൺസിലിംഗ് പസിൽ" isGameDone={won}>
      <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3.5 sm:p-4 space-y-3 shadow-sm">
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400/70 bg-gradient-to-b from-emerald-950 via-slate-900 to-emerald-950 text-white shadow-inner">
          <div className="bg-slate-950/90 px-3 py-2 flex items-center justify-between gap-2 border-b border-white/15">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-md px-1.5 py-0.5 flex items-center">
                <img src={OFFICIAL_WING_LOGOS.ifc.src} alt="IFC" className="h-5 w-auto object-contain" />
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/30 text-emerald-100 text-xs font-extrabold">
                {phase === 'cluster' ? 'ഘട്ടം 1: 60-വീട് പ്ലാൻ' : `ഘട്ടം 2: കേസ് ${won ? IFC_DILEMMAS.length : caseIdx + 1}/${IFC_DILEMMAS.length}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <GameShatterLives lives={shields} maxLives={3} compact />
              <button
                type="button"
                onClick={reset}
                aria-label="വീണ്ടും കളിക്കാം"
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 space-y-3">
            {won ? (
              <div className="rounded-2xl bg-emerald-900/80 border-2 border-amber-300 p-4 text-center space-y-2">
                <p className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>20-വീട് IFC ഫാമിലി ക്ലസ്റ്റർ പ്ലാനും കൗൺസിലിംഗ് പസിലും പൂർത്തിയാക്കി!</span>
                </p>
              </div>
            ) : phase === 'cluster' ? (
              <div className="space-y-3">
                <div className="rounded-2xl bg-white text-slate-900 border-2 border-amber-300 p-3.5 space-y-2">
                  <p className="text-xs sm:text-sm font-extrabold">
                    നമ്മുടെ മഹല്ലിൽ ആകെ <span className="text-emerald-700">60 വീടുകൾ</span> ഉണ്ട്. SKSSF IFC ഭരണഘടനാ മാതൃക അനുസരിച്ച് ഒരു ക്ലസ്റ്ററിൽ എത്ര വീടുകളും ആകെ എത്ര ക്ലസ്റ്ററുകളുമാണ് വേണ്ടത്?
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 space-y-1.5">
                      <p className="text-[11px] font-extrabold text-emerald-950">ഒരു ക്ലസ്റ്ററിലെ വീടുകൾ: {clusterSize}</p>
                      <div className="flex gap-1.5">
                        {[10, 15, 20, 30].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setClusterSize(v);
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                              clusterSize === v ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-300 text-slate-800'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 space-y-1.5">
                      <p className="text-[11px] font-extrabold text-amber-950">ആകെ ക്ലസ്റ്ററുകൾ: {clusterCount}</p>
                      <div className="flex gap-1.5">
                        {[2, 3, 4, 6].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setClusterCount(v);
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                              clusterCount === v ? 'bg-amber-600 text-white' : 'bg-white border border-slate-300 text-slate-800'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={checkClusterPlan}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm cursor-pointer shadow-md"
                >
                  ക്ലസ്റ്റർ പ്ലാൻ പരിശോധിക്കൂ ({clusterSize} വീടുകൾ × {clusterCount} ക്ലസ്റ്ററുകൾ = {clusterSize * clusterCount})
                </button>
              </div>
            ) : (
              activeCase && (
                <div className="space-y-2.5">
                  <div className="rounded-2xl bg-white text-slate-900 border-2 border-amber-300 p-3.5 space-y-1">
                    <p className="text-[10px] font-black text-emerald-800">{activeCase.title}</p>
                    <p className="text-xs sm:text-sm font-extrabold leading-snug">{activeCase.prompt}</p>
                  </div>
                  <div className="space-y-2">
                    {activeCase.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleCasePick(opt.ok)}
                        className="w-full rounded-xl bg-white/10 hover:bg-emerald-600/85 border border-white/25 hover:border-amber-300 px-3 py-2.5 text-left text-xs font-extrabold text-white leading-snug cursor-pointer"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          {failed && (
            <GameDefeatBurstOverlay
              title="IFC പ്ലാൻ പരാജയപ്പെട്ടു!"
              reason={failReason || 'വീണ്ടും ശ്രമിക്കാം!'}
              scoreText={`പൂർത്തിയായ ഘട്ടം: ${phase === 'cluster' ? '1' : '2'}`}
              onRetry={reset}
            />
          )}
        </div>

        <div
          className={`rounded-xl px-3 py-2 text-xs font-extrabold border ${
            isErr ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          {feedback}
        </div>
      </div>
    </GameFullscreenShell>
  );
};

/* ============================================================================
 * LESSON 57 GAME: ORGANET — DIGITAL PORTAL COMPLIANCE AUDIT DETECTIVE
 * ========================================================================== */
interface OrganetAuditForm {
  id: string;
  tier: string;
  title: string;
  rows: { id: string; label: string; value: string; isViolation: boolean }[];
  explanation: string;
}

const ORGANET_AUDIT_FORMS: OrganetAuditForm[] = [
  {
    id: 'org1',
    tier: 'ശാഖാ കമ്മിറ്റി അപ്‌ലോഡ്',
    title: 'organet.skssf.in · ശാഖാ രൂപീകരണ പരിശോധന',
    rows: [
      { id: 'r1', label: 'ആകെ കമ്മിറ്റി അംഗങ്ങൾ', value: '15 പേർ (ഭാരവാഹികൾ 10 + അംഗങ്ങൾ 5)', isViolation: false },
      { id: 'r2', label: 'പുതുമുഖ പ്രാതിനിധ്യം', value: '60% പുതുമുഖങ്ങൾ (9 പേർ)', isViolation: false },
      { id: 'r3', label: 'റെഗുലർ ക്യാമ്പസ് വിദ്യാർത്ഥികൾ', value: '1 വിദ്യാർത്ഥി മാത്രം', isViolation: true },
      { id: 'r4', label: 'പ്രായപരിധി', value: '14–40 വയസ്സിനിടയിൽ', isViolation: false },
    ],
    explanation:
      'കൃത്യം കണ്ടെത്തി! ശാഖാ കമ്മിറ്റിയിൽ കുറഞ്ഞത് 3 റെഗുലർ ക്യാമ്പസ് വിദ്യാർത്ഥികൾ നിർബന്ധമാണ് — 1 പേർ മാത്രം പോരാ!',
  },
  {
    id: 'org2',
    tier: 'ക്ലസ്റ്റർ കമ്മിറ്റി അപ്‌ലോഡ്',
    title: 'organet.skssf.in · ക്ലസ്റ്റർ യോഗ്യതാ പരിശോധന',
    rows: [
      { id: 'r1', label: 'ആകെ കമ്മിറ്റി അംഗങ്ങൾ', value: '19 പേർ', isViolation: false },
      { id: 'r2', label: 'ഉൾപ്പെട്ട ശാഖകളുടെ എണ്ണം', value: '3 ശാഖകൾ മാത്രം', isViolation: true },
      { id: 'r3', label: 'ക്ലസ്റ്റർ കൗൺസിലർ അനുപാതം', value: '15 മെമ്പർഷിപ്പിന് 1 കൗൺസിലർ', isViolation: false },
      { id: 'r4', label: 'ഓർഗനൈസിംഗ് സെക്രട്ടറി', value: 'NIL (നിയമപ്രകാരം)', isViolation: false },
    ],
    explanation:
      'സൂപ്പർ ഓഡിറ്റ്! ഒരു ക്ലസ്റ്ററിൽ കുറഞ്ഞത് 5 മുതൽ പരമാവധി 10 വരെ ശാഖകൾ ഉണ്ടായിരിക്കണം — 3 ശാഖകൾ പോരാ!',
  },
  {
    id: 'org3',
    tier: 'മേഖലാ കമ്മിറ്റി അപ്‌ലോഡ്',
    title: 'organet.skssf.in · മേഖലാ കൗൺസിലർ പരിശോധന',
    rows: [
      { id: 'r1', label: 'ആകെ കമ്മിറ്റി അംഗങ്ങൾ', value: '21 പേർ', isViolation: false },
      { id: 'r2', label: 'ക്ലസ്റ്ററുകൾ & ശാഖകൾ', value: '4 ക്ലസ്റ്ററുകൾ · 28 ശാഖകൾ', isViolation: false },
      { id: 'r3', label: 'സത്യധാര വരിസംഖ്യ', value: 'കൗൺസിലർമാർ സത്യധാര വരിക്കാരല്ല', isViolation: true },
      { id: 'r4', label: 'മേഖലാ കൗൺസിലർ അനുപാതം', value: '25 മെമ്പർഷിപ്പിന് 1 കൗൺസിലർ', isViolation: false },
    ],
    explanation:
      'കൃത്യം! മേഖലാ കമ്മിറ്റി കൗൺസിലർമാർ നിർബന്ധമായും സത്യധാര ദ്വൈവാരിക വരിക്കാരായിരിക്കണം.',
  },
  {
    id: 'org4',
    tier: 'ജില്ലാ കമ്മിറ്റി അപ്‌ലോഡ്',
    title: 'organet.skssf.in · ജില്ലാ കൗൺസിലർ പരിശോധന',
    rows: [
      { id: 'r1', label: 'ആകെ കമ്മിറ്റി അംഗങ്ങൾ', value: '25 പേർ (സെക്രട്ടറിയേറ്റ് 15 + 10)', isViolation: false },
      { id: 'r2', label: 'ജില്ലാ കൗൺസിലർ അനുപാതം', value: '150 മെമ്പർഷിപ്പിന് 1 കൗൺസിലർ', isViolation: false },
      { id: 'r3', label: 'സുപ്രഭാതം ദിനപത്ര വരിസംഖ്യ', value: 'സുപ്രഭാതം വരിക്കാരല്ല എന്ന് രേഖപ്പെടുത്തി', isViolation: true },
      { id: 'r4', label: 'ഐ.ടി കോർഡിനേറ്റർ', value: 'ഓർഗാനെറ്റ് അപ്രൂവൽ ചുമതല നൽകി', isViolation: false },
    ],
    explanation:
      'അസ്സൽ ഓഡിറ്റർ! ജില്ലാ കൗൺസിലർമാർ സുപ്രഭാതം ദിനപത്രത്തിന്റെ വരിക്കാരായിരിക്കണം എന്നതാണ് സംഘടനാ വ്യവസ്ഥ.',
  },
];

export const OrganetAuditPuzzleGame: React.FC<PuzzleGameProps> = ({
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [idx, setIdx] = useState(0);
  const [shields, setShields] = useState(3);
  const [won, setWon] = useState(isCompleted);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(
    'ഓർഗാനെറ്റ് ഓഡിറ്റ് ഡെസ്ക്: താഴെയുള്ള അപ്‌ലോഡ് ഫോമിലെ തെറ്റായ / നിയമം ലംഘിക്കുന്ന ഒറ്റ വരി കണ്ടെത്തി തൊടുക!'
  );
  const [isErr, setIsErr] = useState(false);

  const failed = Boolean(failReason) && !won;
  const form = ORGANET_AUDIT_FORMS[idx];

  const reset = () => {
    sound.playClick();
    setIdx(0);
    setShields(3);
    setWon(false);
    setFailReason(null);
    setIsErr(false);
    setFeedback(
      'ഓർഗാനെറ്റ് ഓഡിറ്റ് ഡെസ്ക്: താഴെയുള്ള അപ്‌ലോഡ് ഫോമിലെ തെറ്റായ / നിയമം ലംഘിക്കുന്ന ഒറ്റ വരി കണ്ടെത്തി തൊടുക!'
    );
  };

  const handleRowTap = (isViolation: boolean) => {
    sound.unlockAudio();
    if (won || failed || !form) return;
    if (isViolation) {
      sound.playSuccess(idx + 1);
      setIsErr(false);
      setFeedback(form.explanation);
      onAwardXp(15, `l4_organet_${form.id}`);
      narrator.speak(form.explanation);
      if (idx + 1 >= ORGANET_AUDIT_FORMS.length) {
        setWon(true);
        sound.playHoist();
        onAwardXp(30, 'l4_organet_complete');
        onComplete?.();
      } else {
        setIdx((v) => v + 1);
      }
    } else {
      sound.playError();
      setIsErr(true);
      const next = Math.max(0, shields - 1);
      setShields(next);
      if (next <= 0) {
        setFailReason('3 തവണ ശരിയായ വരിയെ തെറ്റായി അടയാളപ്പെടുത്തി — ഓഡിറ്റ് വീണ്ടും ശ്രമിക്കാം!');
      } else {
        setFeedback(`ആ വരി സംഘടനാ നിയമപ്രകാരം ശരിയാണ്! യഥാർത്ഥ പിഴവ് മറ്റൊരു വരിയിലാണ് (ബാക്കി കവചം: ${next})`);
      }
    }
  };

  return (
    <GameFullscreenShell title="🖥️ ഓർഗാനെറ്റ് (Organet) — ഡാറ്റാ ഓഡിറ്റ് ഡിറ്റക്ടീവ്" isGameDone={won}>
      <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3.5 sm:p-4 space-y-3 shadow-sm">
        <div className="relative rounded-2xl overflow-hidden border-2 border-sky-400/70 bg-gradient-to-b from-slate-950 via-sky-950 to-slate-950 text-white shadow-inner">
          <div className="bg-slate-950/90 px-3 py-2 flex items-center justify-between gap-2 border-b border-white/15">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-md px-1.5 py-0.5 flex items-center">
                <img src={OFFICIAL_WING_LOGOS.organet.src} alt="Organet" className="h-5 w-auto object-contain" />
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-sky-500/30 text-sky-100 text-xs font-extrabold tabular-nums">
                ഓഡിറ്റ് {won ? ORGANET_AUDIT_FORMS.length : idx + 1}/{ORGANET_AUDIT_FORMS.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <GameShatterLives lives={shields} maxLives={3} compact />
              <button
                type="button"
                onClick={reset}
                aria-label="വീണ്ടും കളിക്കാം"
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 space-y-3">
            {!won && form ? (
              <div className="rounded-2xl bg-white text-slate-900 border-2 border-amber-300 overflow-hidden shadow-md">
                <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-black text-sky-900">{form.title}</span>
                  <span className="text-[10px] font-extrabold text-amber-800">{form.tier}</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {form.rows.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      disabled={failed}
                      onClick={() => handleRowTap(row.isViolation)}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-rose-50 active:bg-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-extrabold text-slate-700">{row.label}</span>
                      <span className="text-xs font-black text-slate-950">{row.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-900/80 border-2 border-amber-300 p-4 text-center space-y-2">
                <p className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>4 ഓർഗാനെറ്റ് അപ്‌ലോഡ് ഫോമുകളിലെയും നിയമലംഘനങ്ങൾ കൃത്യമായി കണ്ടെത്തി!</span>
                </p>
              </div>
            )}
          </div>

          {failed && (
            <GameDefeatBurstOverlay
              title="ഓർഗാനെറ്റ് ഓഡിറ്റ് പരാജയപ്പെട്ടു!"
              reason={failReason || 'വീണ്ടും ശ്രമിക്കാം!'}
              scoreText={`കണ്ടെത്തിയവ: ${idx}/${ORGANET_AUDIT_FORMS.length}`}
              onRetry={reset}
            />
          )}
        </div>

        <div
          className={`rounded-xl px-3 py-2 text-xs font-extrabold border ${
            isErr ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          {feedback}
        </div>
      </div>
    </GameFullscreenShell>
  );
};

/* ============================================================================
 * LESSON 58 GAME: SATHYADHARA, FORWARD FOUNDATION & ISA EDITORIAL DESK
 * ========================================================================== */
export const SathyadharaIsaDeskGame: React.FC<PuzzleGameProps> = (props) => (
  <StrategyMatrixEngine
    {...props}
    shellTitle="📖 സത്യധാര, ഫോർവേഡ് ഫൗണ്ടേഷൻ & ഇസ — എഡിറ്റോറിയൽ പസിൽ"
    actionPrefix="l4_sathyadhara_isa"
    completeActionId="l4_sathyadhara_isa_complete"
    themeBg="bg-gradient-to-b from-amber-950 via-slate-900 to-emerald-950"
    borderCls="border-amber-400/70"
    accentBadgeCls="bg-amber-500/30 text-amber-200"
    introFeedback="ഓരോ പ്രസാധന-യുവജന പദ്ധതിയും അതിന്റെ ശരിയായ SKSSF വിഭാഗത്തിലേക്ക് നയിക്കൂ!"
    winHeading="സത്യധാര, ഫോർവേഡ് ഫൗണ്ടേഷൻ & ISA ഡെസ്ക് പൂർണ്ണ വിജയം!"
    failTitle="എഡിറ്റോറിയൽ ഡെസ്ക് തടസ്സപ്പെട്ടു!"
    choices={[
      {
        id: 'sathyadhara_print',
        label: 'സത്യധാര ദ്വൈവാരിക (1997)',
        sub: 'sathyadhara.com · SKSSF മുഖപത്രം',
        emoji: '📰',
        logoSrc: OFFICIAL_WING_LOGOS.sathyadhara.src,
        url: 'https://sathyadhara.com/',
      },
      {
        id: 'sathyadhara_digital',
        label: 'സത്യധാര ഡിജിറ്റൽ & ഗൾഫ് പതിപ്പ്',
        sub: '@SathyadharaDigital · പ്രവാസി വായനക്കാർ',
        emoji: '▶️',
        logoSrc: OFFICIAL_WING_LOGOS.sathyadhara.src,
        url: 'https://www.youtube.com/@SathyadharaDigital',
      },
      {
        id: 'isa_books',
        label: 'ഇസ്‌ലാമിക് സാഹിത്യ അക്കാദമി (ISA)',
        sub: 'ഇസ ബുക്ക് സ്റ്റാൾ · കോഴിക്കോട് ഇസ്‌ലാമിക് സെന്റർ',
        emoji: '📚',
        logoSrc: OFFICIAL_WING_LOGOS.isa.src,
        url: 'https://skssf.in/isa/',
      },
      {
        id: 'forward_foundation',
        label: 'ഫോർവേഡ് ഫൗണ്ടേഷൻ',
        sub: '@forwardfoundation_kerala · യുവജന ശാക്തീകരണം',
        emoji: '🚀',
        url: 'https://www.instagram.com/forwardfoundation_kerala/',
      },
    ]}
    cases={[
      {
        id: 'si1',
        tag: 'ശാഖാ വരിസംഖ്യാ കാമ്പയിൻ',
        emoji: '🗞️',
        brief:
          '1997 മുതൽ പുറത്തിറങ്ങുന്ന SKSSF-ന്റെ ഔദ്യോഗിക ദ്വൈവാരികയ്ക്ക് ഓരോ ശാഖയിൽ നിന്നും പുതിയ വരിക്കാരെ ചേർക്കാനും ആദർശ ലേഖനങ്ങൾ വായിക്കാനും ഏതാണ്?',
        correctId: 'sathyadhara_print',
        explanation:
          'സത്യധാര ദ്വൈവാരിക (sathyadhara.com) ആണ് 1997 മുതൽ SKSSF-ന്റെ ഔദ്യോഗിക മുഖപത്രമായി പുറത്തിറങ്ങുന്നത്.',
      },
      {
        id: 'si2',
        tag: 'ഡിജിറ്റൽ & പ്രവാസി വായന',
        emoji: '🌍',
        brief:
          'ഗൾഫ് നാടുകളിലെ വായനക്കാർക്ക് മാസികാ എഡിഷനും, യുവതലമുറയ്ക്ക് ആനുകാലിക വീഡിയോ വിശകലനങ്ങളും അഭിമുഖങ്ങളും എവിടെ കാണാം?',
        correctId: 'sathyadhara_digital',
        explanation:
          'ഗൾഫ് സത്യധാരയും @SathyadharaDigital യൂട്യൂബ് ചാനലും പ്രവാസികൾക്കും ഡിജിറ്റൽ വായനക്കാർക്കും വേണ്ടിയാണ്.',
      },
      {
        id: 'si3',
        tag: 'ആധികാരിക ഗ്രന്ഥ പ്രസാധനം',
        emoji: '🏛️',
        brief:
          'ചരിത്രം, ആദർശം, ബാലസാഹിത്യം എന്നീ മേഖലകളിൽ ആധികാരിക പുസ്തകങ്ങൾ വാങ്ങാൻ കോഴിക്കോട് ഇസ്‌ലാമിക് സെന്ററിലെ പ്രസാധനാലയം ഏതാണ്?',
        correctId: 'isa_books',
        explanation:
          'ഇസ്‌ലാമിക് സാഹിത്യ അക്കാദമിയും (ISA) കോഴിക്കോട് ഇസ്‌ലാമിക് സെന്ററിലെ ഇസ ബുക്ക് സ്റ്റാളുമാണ് SKSSF-ന്റെ പ്രസാധന കേന്ദ്രം.',
      },
      {
        id: 'si4',
        tag: 'യുവജന നൈപുണ്യ വികസനം',
        emoji: '💡',
        brief:
          'വിദ്യാർത്ഥികൾക്കും യുവാക്കൾക്കും സാമൂഹിക-സംരംഭക-നൈപുണ്യ ശാക്തീകരണ പദ്ധതികൾ ആവിഷ്കരിക്കുന്ന SKSSF ഫൗണ്ടേഷൻ ഏതാണ്?',
        correctId: 'forward_foundation',
        explanation:
          'ഫോർവേഡ് ഫൗണ്ടേഷൻ (@forwardfoundation_kerala) ആണ് യുവജന നൈപുണ്യ വികസനവും സാമൂഹിക ശാക്തീകരണ പ്രോജക്ടുകളും നയിക്കുന്നത്.',
      },
    ]}
  />
);

/* ============================================================================
 * LESSON 59 GAME: NATIONAL COMMITTEE, SIC & SPC — INDIA-TO-GULF COORDINATION
 * ========================================================================== */
export const NationalGlobalCoordGame: React.FC<PuzzleGameProps> = (props) => (
  <StrategyMatrixEngine
    {...props}
    shellTitle="🌍 നാഷണൽ കമ്മിറ്റി, SIC & പ്രവാസി സെൽ — ആഗോള ഏകോപന പസിൽ"
    actionPrefix="l4_national_global"
    completeActionId="l4_national_global_complete"
    themeBg="bg-gradient-to-b from-sky-950 via-slate-900 to-emerald-950"
    borderCls="border-sky-400/70"
    accentBadgeCls="bg-sky-500/30 text-sky-100"
    introFeedback="ഇന്ത്യയിലെ വിവിധ സംസ്ഥാനങ്ങൾ മുതൽ ഗൾഫും മക്ക–മദീനയും വരെയുള്ള അഭ്യർത്ഥനകൾ ശരിയായ ഘടകത്തിലേക്ക് നയിക്കൂ!"
    winHeading="ഇന്ത്യ മുതൽ ഗൾഫ് വരെയുള്ള ആഗോള ഏകോപന പസിൽ പൂർത്തിയാക്കി!"
    failTitle="ആഗോള ഏകോപനം തടസ്സപ്പെട്ടു!"
    choices={[
      {
        id: 'national_hostels',
        label: 'SKSSF നാഷണൽ കമ്മിറ്റി & ഹോസ്റ്റലുകൾ',
        sub: 'ഡൽഹി ഓഖ്‌ല വിഹാർ · ബംഗളൂരു ഹെബ്ബാൾ · ഉത്തരേന്ത്യ',
        emoji: '🇮🇳',
        url: 'https://www.facebook.com/skssfnational/',
      },
      {
        id: 'sic_global',
        label: 'സമസ്ത ഇസ്‌ലാമിക് സെന്റർ (SIC)',
        sub: 'വിദേശ രാജ്യങ്ങളിലെ സമസ്ത കേന്ദ്ര ഏകോപനം',
        emoji: '🌐',
        logoSrc: OFFICIAL_WING_LOGOS.sic.src,
        url: 'https://samastha.info/org-details/9',
      },
      {
        id: 'spc_pravasi',
        label: 'സമസ്ത പ്രവാസി സെൽ (SPC)',
        sub: 'പ്രവാസി പ്രവർത്തകരുടെ ക്ഷേമവും കൂട്ടായ്മയും',
        emoji: '✈️',
        logoSrc: OFFICIAL_WING_LOGOS.spc.src,
        url: 'https://samastha.info/org-details/8',
      },
      {
        id: 'hajj_viqaya',
        label: 'മക്ക–മദീന ഹജ്ജ് വിഖായ സേവനം',
        sub: 'ഹാജിമാർക്കുള്ള അന്താരാഷ്ട്ര വളണ്ടിയർ തണൽ',
        emoji: '🕋',
        logoSrc: OFFICIAL_WING_LOGOS.viqaya.src,
        url: 'https://viqaya.skssf.in/',
      },
    ]}
    cases={[
      {
        id: 'ng1',
        tag: 'കേന്ദ്ര സർവ്വകലാശാലാ വിദ്യാർത്ഥി',
        emoji: '🎓',
        brief:
          'കേരളത്തിൽ നിന്ന് ഡൽഹി ജാമിഅ മില്ലിയ്യയിലും ബംഗളൂരുവിലും ഉപരിപഠനത്തിന് എത്തിയ വിദ്യാർത്ഥിക്ക് സുരക്ഷിത ഹോസ്റ്റലും അഡ്മിഷൻ സഹായവും വേണം.',
        correctId: 'national_hostels',
        explanation:
          'SKSSF നാഷണൽ കമ്മിറ്റിയുടെ കീഴിൽ ഡൽഹി ഓഖ്‌ല വിഹാറിലും ബംഗളൂരു ഹെബ്ബാളിലും വിദ്യാർത്ഥി ഹോസ്റ്റലുകളും ഹെൽപ്പ് ഡെസ്കുകളും പ്രവർത്തിക്കുന്നു.',
      },
      {
        id: 'ng2',
        tag: 'ഗൾഫ് നാടുകളിലെ സംഘടനാ ഏകോപനം',
        emoji: '🕌',
        brief:
          'യു.എ.ഇ, സൗദി, ഖത്തർ, ഒമാൻ, കുവൈത്ത്, ബഹ്റൈൻ എന്നിവിടങ്ങളിലെ സമസ്ത ഘടകങ്ങളുടെയും മദ്രസകളുടെയും കേന്ദ്ര ഏകോപനം ആരാണ് നയിക്കുന്നത്?',
        correctId: 'sic_global',
        explanation:
          'സമസ്ത ഇസ്‌ലാമിക് സെന്റർ (SIC) ആണ് വിദേശ രാജ്യങ്ങളിലെ സമസ്ത പ്രവർത്തനങ്ങളുടെ കേന്ദ്ര ഏകോപന സമിതി.',
      },
      {
        id: 'ng3',
        tag: 'പ്രവാസി ക്ഷേമം',
        emoji: '🤝',
        brief:
          'വിദേശത്ത് ജോലി ചെയ്യുന്ന പ്രവർത്തകരുടെ ക്ഷേമ പദ്ധതികളും പ്രവാസി കുടുംബങ്ങളുടെ കൂട്ടായ്മയും ഏകോപിപ്പിക്കുന്ന സമസ്ത സെൽ ഏതാണ്?',
        correctId: 'spc_pravasi',
        explanation:
          'സമസ്ത പ്രവാസി സെൽ (SPC) ആണ് പ്രവാസികളുടെ ക്ഷേമത്തിനും കൂട്ടായ്മയ്ക്കുമായി പ്രവർത്തിക്കുന്ന പ്രത്യേക സെൽ.',
      },
      {
        id: 'ng4',
        tag: 'ഹജ്ജ് സീസൺ സേവനം',
        emoji: '⛑️',
        brief:
          'ഹജ്ജ് വേളയിൽ മക്കയിലും മദീനയിലും മിനായിലും വഴിതെറ്റിയതും പ്രായമായതുമായ ഹാജിമാരെ സഹായിക്കാൻ സജ്ജമായ വളണ്ടിയർ സേന ഏതാണ്?',
        correctId: 'hajj_viqaya',
        explanation:
          'മക്കയിലും മദീനയിലും ഹാജിമാർക്ക് തണലേകുന്ന അന്താരാഷ്ട്ര ഹജ്ജ് വിഖായ സേവനം പ്രവാസ ലോകത്തെ അഭിമാനമാണ്.',
      },
    ]}
  />
);

/* ============================================================================
 * LESSON 60 GAME: SAMASTHA SPECIAL CELLS & BODIES ROUTING MATRIX
 * ========================================================================== */
export const SamasthaCellsMatrixGame: React.FC<PuzzleGameProps> = (props) => (
  <StrategyMatrixEngine
    {...props}
    shellTitle="⚖️ സമസ്ത പ്രത്യേക സെല്ലുകളും സമിതികളും — ഡിഡക്ഷൻ മാട്രിക്സ്"
    actionPrefix="l4_samastha_cells"
    completeActionId="l4_samastha_cells_complete"
    themeBg="bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950"
    borderCls="border-emerald-400/70"
    accentBadgeCls="bg-emerald-500/30 text-emerald-100"
    timeLimitSec={65}
    introFeedback="ഓരോ മേഖലയിലെയും ആവശ്യത്തിന് കൃത്യമായ സമസ്ത പ്രത്യേക സെല്ലിനെയോ സമിതിയെയോ തിരഞ്ഞെടുക്കൂ!"
    winHeading="സമസ്തയുടെ എല്ലാ പ്രത്യേക സെല്ലുകളും സമിതികളും കൃത്യമായി തിരിച്ചറിഞ്ഞു!"
    failTitle="സെൽ മാട്രിക്സ് തടസ്സപ്പെട്ടു!"
    choices={[
      {
        id: 'skjq',
        label: 'SKJQ (ഖുത്വബാഅ്)',
        sub: 'ഇമാമുമാരുടെയും ഖത്തീബുമാരുടെയും കൂട്ടായ്മ',
        emoji: '🕌',
        logoSrc: OFFICIAL_WING_LOGOS.skjq.src,
        url: 'https://samastha.info/org-details/5',
      },
      {
        id: 'slc',
        label: 'SLC (സമസ്ത ലീഗൽ സെൽ)',
        sub: 'നിയമോപദേശവും നിയമസഹായവും',
        emoji: '⚖️',
        logoSrc: OFFICIAL_WING_LOGOS.slc.src,
        url: 'https://samastha.info/org-details/6#',
      },
      {
        id: 'sea',
        label: 'SEA (എംപ്ലോയീസ് അസോസിയേഷൻ)',
        sub: 'ഉദ്യോഗസ്ഥരുടെ ധാർമ്മിക കൂട്ടായ്മ',
        emoji: '💼',
        url: 'https://samastha.info/org-details/7',
      },
      {
        id: 'skjm',
        label: 'SKJM (മുദരിസീൻ)',
        sub: 'പള്ളി ദർസ് & അറബിക് കോളേജ് അധ്യാപകർ',
        emoji: '📖',
        url: 'https://samastha.info/org-details/3',
      },
      {
        id: 'skjmf',
        label: 'SKJMF (മുഫത്തിഷീൻ)',
        sub: 'മദ്രസാ ഇൻസ്പെക്ടർമാരുടെ സമിതി',
        emoji: '🔍',
        url: 'https://samastha.info/org-details/4',
      },
      {
        id: 'skmma',
        label: 'SKMMA (മദ്രസ മാനേജ്മെന്റ്)',
        sub: 'മദ്രസാ ഭരണസമിതി & അടിസ്ഥാന സൗകര്യം',
        emoji: '🏫',
        logoSrc: OFFICIAL_WING_LOGOS.skmma.src,
        url: 'https://samastha.info/org-details/14',
      },
    ]}
    cases={[
      {
        id: 'sc1',
        tag: 'ജുമുഅ ഖുതുബ & ഇമാം പരിശീലനം',
        emoji: '🎙️',
        brief:
          'പള്ളികളിലെ ഇമാമുമാർക്കും ഖത്തീബുമാർക്കും സമകാലിക വിഷയങ്ങളിൽ ആധികാരിക പ്രഭാഷണ പരിശീലനവും കൂട്ടായ്മയും വേണം.',
        correctId: 'skjq',
        explanation:
          'സമസ്ത കേരള ജംഇയ്യത്തുൽ ഖുത്വബാഅ് (SKJQ) ആണ് പള്ളികളിലെ ഇമാമുമാരുടെയും ഖത്തീബുമാരുടെയും കൂട്ടായ്മ.',
      },
      {
        id: 'sc2',
        tag: 'ഭരണഘടനാ-നിയമ സഹായം',
        emoji: '📜',
        brief:
          'മഹല്ല്-സ്ഥാപന രജിസ്ട്രേഷൻ, വഖഫ് സംരക്ഷണം, ന്യൂനപക്ഷ അവകാശങ്ങൾ എന്നിവയിൽ ആധികാരിക നിയമോപദേശം ആവശ്യമാണ്.',
        correctId: 'slc',
        explanation:
          'സമസ്ത ലീഗൽ സെൽ (SLC) ആണ് നിയമോപദേശവും നിയമസഹായവും നൽകുന്ന വിദഗ്ദ്ധ സമിതി.',
      },
      {
        id: 'sc3',
        tag: 'സർക്കാർ–പൊതുമേഖലാ ഉദ്യോഗസ്ഥർ',
        emoji: '🏢',
        brief:
          'സർക്കാർ, അർദ്ധസർക്കാർ ഉദ്യോഗസ്ഥരെ ഒരുമിപ്പിച്ച് ധാർമ്മിക സേവന വേദിയും വിദ്യാർത്ഥി കരിയർ മെന്ററിംഗും സംഘടിപ്പിക്കണം.',
        correctId: 'sea',
        explanation:
          'സമസ്ത എംപ്ലോയീസ് അസോസിയേഷൻ (SEA) ആണ് ഉദ്യോഗസ്ഥരുടെ ഔദ്യോഗിക കൂട്ടായ്മ.',
      },
      {
        id: 'sc4',
        tag: 'ദർസ് അധ്യാപക കൂട്ടായ്മ',
        emoji: '📚',
        brief:
          'പള്ളി ദർസുകളിലും അറബിക് കോളേജുകളിലും കിതാബ് ഓതിക്കൊടുക്കുന്ന മുദരിസുമാരുടെ അക്കാദമിക സമിതി ഏതാണ്?',
        correctId: 'skjm',
        explanation:
          'സമസ്ത കേരള ജംഇയ്യത്തുൽ മുദരിസീൻ (SKJM) ആണ് ദർസ്-അറബിക് കോളേജ് അധ്യാപകരുടെ സംഘടന.',
      },
      {
        id: 'sc5',
        tag: 'മദ്രസാ നിലവാര പരിശോധന',
        emoji: '📋',
        brief:
          'മദ്രസകളിലെ സിലബസ് നടത്തിപ്പും അക്കാദമിക നിലവാരവും പരീക്ഷാ കൃത്യതയും നേരിട്ട് പരിശോധിക്കുന്ന ഇൻസ്പെക്ടർമാരുടെ സംഘടന ഏതാണ്?',
        correctId: 'skjmf',
        explanation:
          'സമസ്ത കേരള ജംഇയ്യത്തുൽ മുഫത്തിഷീൻ (SKJMF) ആണ് മദ്രസാ ഇൻസ്പെക്ടർമാരുടെ ഔദ്യോഗിക സമിതി.',
      },
      {
        id: 'sc6',
        tag: 'മദ്രസാ ഭരണസമിതി ഏകോപനം',
        emoji: '🏗️',
        brief:
          'മദ്രസകളുടെ കെട്ടിടം, സ്മാർട്ട് ക്ലാസ് സൗകര്യങ്ങൾ, മാനേജ്മെന്റ് ഭരണസമിതികളുടെ ഏകോപനം എന്നിവ നയിക്കുന്ന സംഘടന ഏതാണ്?',
        correctId: 'skmma',
        explanation:
          'സമസ്ത കേരള മദ്രസ മാനേജ്മെന്റ് അസോസിയേഷൻ (SKMMA) ആണ് മദ്രസാ ഭരണസമിതികളെ ഏകോപിപ്പിക്കുന്നത്.',
      },
    ]}
  />
);

/* ============================================================================
 * LESSON 61 GAME: SAMASTHA HIGHER EDUCATION & CAREER PATHWAY LOGIC PUZZLE
 * ========================================================================== */
export const HigherEducationPathwayGame: React.FC<PuzzleGameProps> = (props) => (
  <StrategyMatrixEngine
    {...props}
    shellTitle="🎓 സമസ്ത ഉന്നത വിദ്യാഭ്യാസ ശൃംഖല — അഡ്മിഷൻ പാത്ത്‌വേ പസിൽ"
    actionPrefix="l4_higher_ed"
    completeActionId="l4_higher_ed_complete"
    themeBg="bg-gradient-to-b from-emerald-950 via-sky-950 to-slate-950"
    borderCls="border-amber-400/70"
    accentBadgeCls="bg-amber-500/30 text-amber-200"
    timeLimitSec={65}
    introFeedback="ഓരോ വിദ്യാർത്ഥിയുടെയും പ്രായവും പഠന ലക്ഷ്യവും വിശകലനം ചെയ്ത് ഏറ്റവും അനുയോജ്യമായ സമസ്ത വിദ്യാഭ്യാസ പാത നിർദ്ദേശിക്കൂ!"
    winHeading="6 വിദ്യാർത്ഥികൾക്കും കൃത്യമായ സമസ്ത വിദ്യാഭ്യാസ പാത നിർദ്ദേശിച്ചു!"
    failTitle="അഡ്മിഷൻ ഗൈഡൻസ് തടസ്സപ്പെട്ടു!"
    choices={[
      {
        id: 'albirr',
        label: 'അൽബിർ പ്രീ-സ്കൂൾ (Al-Birr)',
        sub: '3–5 വയസ്സ് · 350+ പ്രീ-പ്രൈമറി ശാഖകൾ',
        emoji: '🧸',
        logoSrc: OFFICIAL_WING_LOGOS.albirr_preschool.src,
        url: 'https://albirrschools.org/',
      },
      {
        id: 'asmi',
        label: 'ASMI ഇംഗ്ലീഷ് മീഡിയം സ്കൂൾ',
        sub: 'SKIMVB മേൽനോട്ടത്തിലുള്ള ധാർമ്മിക-ആധുനിക സ്കൂൾ',
        emoji: '🏫',
        logoSrc: OFFICIAL_WING_LOGOS.asmi.src,
        url: 'https://asmischools.in/app/appp/signin/about_us',
      },
      {
        id: 'elearning',
        label: 'സമസ്ത ഇ-ലേണിംഗ് (Global)',
        sub: '26+ രാജ്യങ്ങൾ · ക്ലാസ് 1–10 ഓൺലൈൻ മദ്രസ',
        emoji: '💻',
        logoSrc: OFFICIAL_WING_LOGOS.samastha_elearning.src,
        url: 'https://www.samasthaelearning.com/',
      },
      {
        id: 'snec',
        label: 'SNEC (ശരീഅഃ / ഷീ / ലൈഫ്)',
        sub: 'SNEET/SLET വഴി +2, ഡിഗ്രി, പി.ജി സമന്വയം',
        emoji: '🎓',
        logoSrc: OFFICIAL_WING_LOGOS.snec.src,
        url: 'https://www.snec.in/',
      },
      {
        id: 'cswc',
        label: 'CSWC വനിതാ കോളേജുകൾ',
        sub: 'ഫളീല (3 വർഷം) & ഫാദീല (2 വർഷം) · 114 കോളേജുകൾ',
        emoji: '🏛️',
        logoSrc: OFFICIAL_WING_LOGOS.cswc.src,
        url: 'https://cswc.in/',
      },
      {
        id: 'jamia',
        label: 'ജാമിഅ നൂരിയ്യ & ജാമിഅ ജലാലിയ്യ',
        sub: 'പട്ടിക്കാട് (ഫൈസി) & മുണ്ടക്കുളം ഉന്നത മതകലാലയങ്ങൾ',
        emoji: '🕌',
        url: 'https://www.jamianooriya.in/',
      },
    ]}
    cases={[
      {
        id: 'he1',
        tag: 'പ്രായം 4 · ഒമാൻ പ്രവാസി കുടുംബം',
        emoji: '🌱',
        brief:
          '4 വയസ്സുകാരന് കളിയിലൂടെ ഇസ്‌ലാമിക സംസ്കാരവും പ്രീ-പ്രൈമറി പഠനവും തുടങ്ങണം — കേരളം മുതൽ ഒമാൻ, സൗദി വരെ ശാഖകളുള്ള സംവിധാനം ഏത്?',
        correctId: 'albirr',
        explanation:
          '350-ലധികം ശാഖകളുള്ള അൽബിർ ഇസ്‌ലാമിക് പ്രീ-സ്കൂൾ (albirrschools.org) ആണ് പ്രീ-പ്രൈമറി പഠനത്തിന് ഏറ്റവും ഉചിതം.',
      },
      {
        id: 'he2',
        tag: 'ക്ലാസ് 5 · ഇംഗ്ലീഷ് മീഡിയം പഠനം',
        emoji: '📘',
        brief:
          'ആധുനിക ഇംഗ്ലീഷ് മീഡിയം സ്കൂൾ സിലബസിനൊപ്പം SKIMVB-യുടെ ധാർമ്മിക അന്തരീക്ഷവും മതബോധനവും ഒരുമിച്ച് വേണം.',
        correctId: 'asmi',
        explanation:
          'ASMI (Association of Samastha Minority Institutions) ഇംഗ്ലീഷ് മീഡിയം സ്കൂളുകളാണ് ഈ സമന്വയ സ്കൂൾ വിദ്യാഭ്യാസം നൽകുന്നത്.',
      },
      {
        id: 'he3',
        tag: 'ക്ലാസ് 7 · യൂറോപ്പിലെ വിദ്യാർത്ഥി',
        emoji: '🌍',
        brief:
          'സമീപത്ത് മദ്രസ ഇല്ലാത്ത വിദേശ രാജ്യത്ത് താമസിക്കുന്ന 7-ാം ക്ലാസ് വിദ്യാർത്ഥിക്ക് വീട്ടിലിരുന്ന് സമസ്ത സിലബസ് പഠിക്കണം.',
        correctId: 'elearning',
        explanation:
          '26+ രാജ്യങ്ങളിലെ കുട്ടികൾക്കായി ക്ലാസ് 1 മുതൽ 10 വരെ ഓൺലൈൻ മദ്രസ നൽകുന്ന സമസ്ത ഇ-ലേണിംഗ് (samasthaelearning.com)!',
      },
      {
        id: 'he4',
        tag: 'SSLC കഴിഞ്ഞ വിദ്യാർത്ഥി · സമന്വയ ഡിഗ്രി',
        emoji: '🧭',
        brief:
          'പത്താം ക്ലാസ് കഴിഞ്ഞു; +2, ഡിഗ്രി, പി.ജി എന്നിവയ്ക്കൊപ്പം ശരീഅഃ/ഷീ സമന്വയ പഠനം SNEET/SLET വഴി നേടണം.',
        correctId: 'snec',
        explanation:
          'സമസ്ത നാഷണൽ എജ്യുക്കേഷൻ കൗൺസിൽ (SNEC — snec.in) ആണ് ശരീഅഃ, ഷീ, ലൈഫ് സമന്വയ പ്രോഗ്രാമുകൾ നടത്തുന്നത്.',
      },
      {
        id: 'he5',
        tag: 'വനിതാ ഉന്നത മതപഠനം',
        emoji: '🌟',
        brief:
          'പെൺകുട്ടിക്ക് സുരക്ഷിത ഇസ്‌ലാമിക കോളേജിൽ 3 വർഷത്തെ ഫളീല ബിരുദവും തുടർന്ന് 2 വർഷത്തെ ഫാദീല പി.ജിയും പഠിക്കണം.',
        correctId: 'cswc',
        explanation:
          '93 ഡേ കോളേജുകളും 21 റെസിഡൻഷ്യൽ കോളേജുകളുമായി CSWC (cswc.in) ആണ് ഫളീല-ഫാദീല കോഴ്സുകൾ നൽകുന്നത്.',
      },
      {
        id: 'he6',
        tag: 'ഉന്നത ഫിഖ്ഹ്-തഫ്സീർ ബിരുദം',
        emoji: '📜',
        brief:
          'ദർസ് പഠനം പൂർത്തിയാക്കിയ വിദ്യാർത്ഥിക്ക് ‘മൗലവി ഫാളിൽ ഫൈസി’ അല്ലെങ്കിൽ ഉന്നത ഫിഖ്ഹ്-തഫ്സീർ ബിരുദം നേടണം.',
        correctId: 'jamia',
        explanation:
          '1963-ൽ തറക്കല്ലിട്ട പട്ടിക്കാട് ജാമിഅ നൂരിയ്യയും മുണ്ടക്കുളം ജാമിഅ ജലാലിയ്യയുമാണ് സമസ്തയുടെ പരമോന്നത മതകലാലയങ്ങൾ.',
      },
    ]}
  />
);

/* ============================================================================
 * LESSON 62 GAME: OFFICIAL SOCIAL MEDIA DETECTIVE (REAL VS FAKE HANDLE SPOTTER)
 * ========================================================================== */
interface SocialVerifyRound {
  id: string;
  platform: 'Instagram' | 'YouTube' | 'X (Twitter)' | 'Telegram & App' | 'Website & Facebook';
  orgName: string;
  realIndex: 0 | 1;
  cards: [
    { handle: string; urlDisplay: string; note: string },
    { handle: string; urlDisplay: string; note: string }
  ];
  verifiedUrl: string;
  explanation: string;
}

const SOCIAL_VERIFY_ROUNDS: SocialVerifyRound[] = [
  {
    id: 'sv1',
    platform: 'YouTube',
    orgName: 'SKJU & SKIMVB ഔദ്യോഗിക യൂട്യൂബ്',
    realIndex: 0,
    cards: [
      {
        handle: '@SamasthaOnline',
        urlDisplay: 'youtube.com/@SamasthaOnline',
        note: 'സമസ്ത ഓൺലൈൻ ഔദ്യോഗിക ചാനൽ',
      },
      {
        handle: '@SamasthaNewsUnofficial99',
        urlDisplay: 'youtube.com/@SamasthaNewsUnofficial99',
        note: 'വൈറൽ ക്ലിപ്പുകളും അഭ്യൂഹങ്ങളും',
      },
    ],
    verifiedUrl: 'https://www.youtube.com/@SamasthaOnline',
    explanation:
      'കൃത്യം! @SamasthaOnline ആണ് സമസ്തയുടെയും SKIMVB-യുടെയും ഔദ്യോഗിക യൂട്യൂബ് ചാനൽ (സെന്റിനറി ഇൻസ്റ്റാഗ്രാം: @samastha_centenary).',
  },
  {
    id: 'sv2',
    platform: 'Instagram',
    orgName: 'SKSSF കേരള സ്റ്റേറ്റ് ഇൻസ്റ്റാഗ്രാം',
    realIndex: 1,
    cards: [
      {
        handle: '@skssf_fanclub_viral',
        urlDisplay: 'instagram.com/skssf_fanclub_viral',
        note: 'സ്ഥിരീകരിക്കാത്ത ഫാൻ പേജ്',
      },
      {
        handle: '@skssfkeralastate',
        urlDisplay: 'instagram.com/skssfkeralastate/',
        note: 'SKSSF സംസ്ഥാന കമ്മിറ്റി ഔദ്യോഗിക പേജ്',
      },
    ],
    verifiedUrl: 'https://www.instagram.com/skssfkeralastate/',
    explanation:
      'ശരിയാണ്! @skssfkeralastate (Instagram), SKSSFStateCommittee (Facebook), @skssfstate (X), @SKSSFLIVE (YouTube) എന്നിവയാണ് ഔദ്യോഗിക അക്കൗണ്ടുകൾ.',
  },
  {
    id: 'sv3',
    platform: 'YouTube',
    orgName: 'SKSBV സംസ്ഥാന കമ്മിറ്റി യൂട്യൂബ് & ഇൻസ്റ്റാഗ്രാം',
    realIndex: 0,
    cards: [
      {
        handle: '@sksbvstate · @sksbvofficial',
        urlDisplay: 'youtube.com/@sksbvstate',
        note: 'sksbv.in · ഔദ്യോഗിക ബാലവേദി ചാനൽ',
      },
      {
        handle: '@balavedhi_cartoon_club',
        urlDisplay: 'youtube.com/@balavedhi_cartoon_club',
        note: 'അനൗദ്യോഗിക വീഡിയോ അക്കൗണ്ട്',
      },
    ],
    verifiedUrl: 'https://www.youtube.com/@sksbvstate',
    explanation:
      'മിടുക്ക്! sksbv.in, @sksbvofficial (Instagram & Facebook), @sksbvstate (YouTube) എന്നിവയാണ് SKSBV-യുടെ ഔദ്യോഗിക പ്ലാറ്റ്‌ഫോമുകൾ.',
  },
  {
    id: 'sv4',
    platform: 'Telegram & App',
    orgName: 'SKICR TV · SKSSF ഔദ്യോഗിക മീഡിയ ടീം',
    realIndex: 1,
    cards: [
      {
        handle: 'skicr-free-apk-download.xyz',
        urlDisplay: 'അനൗദ്യോഗിക തേർഡ്-പാർട്ടി APK സൈറ്റ്',
        note: 'സുരക്ഷിതമല്ലാത്ത തേർഡ്-പാർട്ടി ഫയൽ',
      },
      {
        handle: '@SKICRTV · skicr.skssf.in · t.me/skicrtvlive',
        urlDisplay: 'Google Play: com.kicr.skssf',
        note: 'ഔദ്യോഗിക സൈറ്റ്, YouTube, Telegram & Play Store ആപ്പ്',
      },
    ],
    verifiedUrl: 'https://skicr.skssf.in/',
    explanation:
      'കൃത്യം! ആപ്പുകൾ എപ്പോഴും ഔദ്യോഗിക Google Play Store-ൽ നിന്ന് മാത്രം ഇൻസ്റ്റാൾ ചെയ്യണം (skicr.skssf.in, @SKICRTV, t.me/skicrtvlive).',
  },
  {
    id: 'sv5',
    platform: 'Website & Facebook',
    orgName: 'SKSSF വിഖായ & സത്യധാര ഔദ്യോഗിക പോർട്ടലുകൾ',
    realIndex: 0,
    cards: [
      {
        handle: 'viqaya.skssf.in · sathyadhara.com',
        urlDisplay: '@SathyadharaDigital · fb/viqayakerala',
        note: 'skssf.in സബ്‌ഡൊമെയ്‌നും ഔദ്യോഗിക സൈറ്റും',
      },
      {
        handle: 'viqaya-donation-fastpay.net',
        urlDisplay: 'വ്യാജ പേയ്‌മെന്റ് ലിങ്ക്',
        note: 'വ്യക്തിഗത അക്കൗണ്ടിലേക്ക് പണം ചോദിക്കുന്ന വ്യാജ സൈറ്റ്',
      },
    ],
    verifiedUrl: 'https://viqaya.skssf.in/',
    explanation:
      'സൂപ്പർ ജാഗ്രത! viqaya.skssf.in, sathyadhara.com, @SathyadharaDigital, fb/viqayakerala, fb/sathyadhara.kerala എന്നിവയാണ് ഔദ്യോഗികം — വ്യാജ ഡൊമെയ്‌നുകളിൽ വഞ്ചിതരാകരുത്!',
  },
];

export const OfficialSocialDetectiveGame: React.FC<PuzzleGameProps> = ({
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const [idx, setIdx] = useState(0);
  const [shields, setShields] = useState(3);
  const [won, setWon] = useState(isCompleted);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(
    'ഡിജിറ്റൽ ഡിറ്റക്ടീവ്: താഴെ കാണുന്ന രണ്ട് പേജുകളിൽ യഥാർത്ഥ ഔദ്യോഗിക അക്കൗണ്ട് ഏതാണെന്ന് തിരിച്ചറിഞ്ഞ് വെരിഫൈ ചെയ്യൂ!'
  );
  const [isErr, setIsErr] = useState(false);
  const [lastVerified, setLastVerified] = useState<{ url: string; label: string } | null>(null);

  const failed = Boolean(failReason) && !won;
  const round = SOCIAL_VERIFY_ROUNDS[idx];

  const reset = () => {
    sound.playClick();
    setIdx(0);
    setShields(3);
    setWon(false);
    setFailReason(null);
    setIsErr(false);
    setLastVerified(null);
    setFeedback(
      'ഡിജിറ്റൽ ഡിറ്റക്ടീവ്: താഴെ കാണുന്ന രണ്ട് പേജുകളിൽ യഥാർത്ഥ ഔദ്യോഗിക അക്കൗണ്ട് ഏതാണെന്ന് തിരിച്ചറിഞ്ഞ് വെരിഫൈ ചെയ്യൂ!'
    );
  };

  const handlePickCard = (cardIdx: 0 | 1) => {
    sound.unlockAudio();
    if (won || failed || !round) return;

    if (cardIdx === round.realIndex) {
      sound.playSuccess(idx + 1);
      setIsErr(false);
      setFeedback(round.explanation);
      setLastVerified({ url: round.verifiedUrl, label: round.cards[cardIdx].handle });
      onAwardXp(15, `l4_social_verify_${round.id}`);
      narrator.speak(round.explanation, round.orgName);

      if (idx + 1 >= SOCIAL_VERIFY_ROUNDS.length) {
        setWon(true);
        sound.playHoist();
        onAwardXp(30, 'l4_social_verification_complete');
        onComplete?.();
      } else {
        setIdx((v) => v + 1);
      }
    } else {
      sound.playError();
      setIsErr(true);
      const next = Math.max(0, shields - 1);
      setShields(next);
      if (next <= 0) {
        setFailReason('3 തവണ വ്യാജ പേജിൽ ക്ലിക്ക് ചെയ്തു — ഔദ്യോഗിക ഡൊമെയ്‌നും ഹാൻഡിലും ശ്രദ്ധിച്ച് വീണ്ടും ശ്രമിക്കാം!');
      } else {
        setFeedback(`സൂക്ഷിക്കൂ! അത് അനൗദ്യോഗിക/വ്യാജ അക്കൗണ്ടാണ് — യഥാർത്ഥ ഡൊമെയ്‌നും ഹാൻഡിലും പരിശോധിക്കൂ (ബാക്കി കവചം: ${next})`);
      }
    }
  };

  return (
    <GameFullscreenShell title="🛡️ ഔദ്യോഗിക സോഷ്യൽ മീഡിയ & വ്യാജ പേജ് ഡിറ്റക്ടീവ്" isGameDone={won}>
      <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3.5 sm:p-4 space-y-3 shadow-sm">
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400/70 bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 text-white shadow-inner">
          <div className="bg-slate-950/90 px-3 py-2 flex items-center justify-between gap-2 border-b border-white/15">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[11px] font-black">
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFY
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white/15 text-emerald-100 text-xs font-extrabold tabular-nums">
                {won ? SOCIAL_VERIFY_ROUNDS.length : idx + 1}/{SOCIAL_VERIFY_ROUNDS.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <GameShatterLives lives={shields} maxLives={3} compact />
              <button
                type="button"
                onClick={reset}
                aria-label="വീണ്ടും കളിക്കാം"
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 space-y-3">
            {!won && round ? (
              <>
                <div className="rounded-xl bg-white/10 border border-white/20 px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black text-amber-300">{round.platform}</p>
                    <p className="text-xs sm:text-sm font-extrabold text-white">{round.orgName}</p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-200 shrink-0">യഥാർത്ഥ പേജ് തിരഞ്ഞെടുക്കൂ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {round.cards.map((card, cIdx) => (
                    <button
                      key={card.handle}
                      type="button"
                      disabled={failed}
                      onClick={() => handlePickCard(cIdx as 0 | 1)}
                      className="rounded-2xl bg-white text-slate-900 hover:bg-emerald-50 border-2 border-slate-200 hover:border-amber-400 p-3.5 text-left space-y-1.5 shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <p className="text-xs sm:text-sm font-black text-slate-950 break-all">{card.handle}</p>
                      <p className="text-[11px] font-bold text-emerald-800 break-all">{card.urlDisplay}</p>
                      <p className="text-[11px] font-semibold text-slate-600 leading-snug">{card.note}</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-emerald-900/80 border-2 border-amber-300 p-4 text-center space-y-3">
                <p className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>എല്ലാ ഔദ്യോഗിക സോഷ്യൽ മീഡിയ അക്കൗണ്ടുകളും കൃത്യമായി വെരിഫൈ ചെയ്തു!</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { label: '@SamasthaOnline', url: 'https://www.youtube.com/@SamasthaOnline' },
                    { label: '@skssfkeralastate', url: 'https://www.instagram.com/skssfkeralastate/' },
                    { label: '@SKSSFLIVE', url: 'https://www.youtube.com/@SKSSFLIVE' },
                    { label: '@sksbvstate', url: 'https://www.youtube.com/@sksbvstate' },
                    { label: '@SKICRTV', url: 'https://www.youtube.com/@SKICRTV' },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sound.playClick()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white text-emerald-950 hover:bg-amber-200 text-[11px] font-extrabold"
                    >
                      <ExternalLink className="w-3 h-3 text-emerald-700" />
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {failed && (
            <GameDefeatBurstOverlay
              title="വെരിഫിക്കേഷൻ പരാജയപ്പെട്ടു!"
              reason={failReason || 'വീണ്ടും ശ്രമിക്കാം!'}
              scoreText={`വെരിഫൈ ചെയ്തവ: ${idx}/${SOCIAL_VERIFY_ROUNDS.length}`}
              onRetry={reset}
            />
          )}
        </div>

        <div
          className={`rounded-xl px-3 py-2 text-xs font-extrabold border flex flex-wrap items-center justify-between gap-2 ${
            isErr ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <span className="flex-1 min-w-[200px] leading-relaxed">{feedback}</span>
          {lastVerified && (
            <a
              href={lastVerified.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-extrabold shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              <span>തുറക്കാം</span>
            </a>
          )}
        </div>
      </div>
    </GameFullscreenShell>
  );
};
