import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ExternalLink, RotateCcw, Youtube } from 'lucide-react';
import { OFFICIAL_WING_LOGOS } from '../data/officialLogos';
import { GameFullscreenShell } from './GameFullscreenShell';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';

/* ============================================================================
 * NEW GAME 51: SAMASTHA EDUCATION & DIGITAL PORTAL ROUTER GAME
 * Students route 6 real learner/parent requests to the exact official portal
 * (SNEC, CSWC, Al-Birr, Samastha E-Learning, SKJMCC, Jamia Nooriya / MEAEC)
 * AND can click to open the live official website directly!
 * ========================================================================== */
interface PortalChoice {
  id: string;
  label: string;
  shortUrl: string;
  url: string;
  emoji: string;
  logoSrc?: string;
}

const EDUCATION_PORTALS: PortalChoice[] = [
  {
    id: 'snec',
    label: 'SNEC (ശരീഅഃ / ഷീ / ലൈഫ്)',
    shortUrl: 'snec.in',
    url: 'https://www.snec.in/',
    emoji: '🎓',
    logoSrc: OFFICIAL_WING_LOGOS.snec.src,
  },
  {
    id: 'cswc',
    label: 'CSWC വനിതാ കോളേജുകൾ',
    shortUrl: 'cswc.in',
    url: 'https://cswc.in/',
    emoji: '🏛️',
    logoSrc: OFFICIAL_WING_LOGOS.cswc.src,
  },
  {
    id: 'albirr',
    label: 'അൽബിർ പ്രീ-സ്കൂൾ',
    shortUrl: 'albirrschools.org',
    url: 'https://albirrschools.org/',
    emoji: '🧸',
    logoSrc: OFFICIAL_WING_LOGOS.albirr_preschool.src,
  },
  {
    id: 'elearning',
    label: 'സമസ്ത ഇ-ലേണിംഗ്',
    shortUrl: 'samasthaelearning.com',
    url: 'https://www.samasthaelearning.com/',
    emoji: '💻',
    logoSrc: OFFICIAL_WING_LOGOS.samastha_elearning.src,
  },
  {
    id: 'skjmcc',
    label: 'SKJMCC മുഅല്ലിം പോർട്ടൽ',
    shortUrl: 'skjmcc.net',
    url: 'https://skjmcc.net/',
    emoji: '📖',
    logoSrc: OFFICIAL_WING_LOGOS.skjmcc.src,
  },
  {
    id: 'jamia_meaec',
    label: 'ജാമിഅ നൂരിയ്യ പട്ടിക്കാട്',
    shortUrl: 'jamianooriya.in',
    url: 'https://www.jamianooriya.in/',
    emoji: '🕌',
  },
];

interface PortalRequestCase {
  id: string;
  caller: string;
  emoji: string;
  request: string;
  correctPortalId: string;
  tip: string;
  directUrl: string;
  directLabel: string;
}

const PORTAL_CASES: PortalRequestCase[] = [
  {
    id: 'req_elearning',
    caller: 'ദുബായിലെ രക്ഷിതാവ്',
    emoji: '🌍',
    request: '“എന്റെ 4-ാം ക്ലാസ് മകന് വിദേശത്തിരുന്ന് സമസ്ത ഓൺലൈൻ മദ്രസയിൽ ചേരണം — ഏത് പോർട്ടലിൽ രജിസ്റ്റർ ചെയ്യണം?”',
    correctPortalId: 'elearning',
    tip: '26+ രാജ്യങ്ങളിലെ കുട്ടികൾക്ക് 1–10 ക്ലാസുകളിലേക്ക് samasthaelearning.com വഴി ഓൺലൈൻ മദ്രസ പഠിക്കാം!',
    directUrl: 'https://www.samasthaelearning.com/',
    directLabel: 'samasthaelearning.com',
  },
  {
    id: 'req_snec',
    caller: 'പത്താം ക്ലാസ് വിദ്യാർത്ഥി',
    emoji: '📚',
    request: '“+2, ഡിഗ്രി, പി.ജി എന്നിവയോടൊപ്പം മതപഠനം സമന്വയിപ്പിക്കുന്ന ശരീഅഃ/ഷീ പ്രോഗ്രാം (SNEET/SLET) എവിടെ അപേക്ഷിക്കാം?”',
    correctPortalId: 'snec',
    tip: 'സമസ്ത നാഷണൽ എജ്യുക്കേഷൻ കൗൺസിൽ (SNEC — snec.in) ആണ് ശരീഅഃ, ഷീ, ലൈഫ് സമന്വയ കോഴ്സുകൾ നയിക്കുന്നത്!',
    directUrl: 'https://www.snec.in/',
    directLabel: 'snec.in',
  },
  {
    id: 'req_albirr',
    caller: 'കുരുന്നിന്റെ ഉമ്മ',
    emoji: '🌱',
    request: '“4 വയസ്സുകാരന് ആധുനിക ബോധന രീതികളോടൊപ്പം ഇസ്‌ലാമിക മൂല്യങ്ങളുള്ള പ്രീ-സ്കൂൾ വേണം (350+ ശാഖകൾ)!”',
    correctPortalId: 'albirr',
    tip: 'കേരളം, കർണാടക, ഒമാൻ, സൗദി എന്നിവിടങ്ങളിലായി 350+ ശാഖകളുള്ള അൽബിർ ഇസ്‌ലാമിക് പ്രീ-സ്കൂൾ (albirrschools.org)!',
    directUrl: 'https://albirrschools.org/',
    directLabel: 'albirrschools.org',
  },
  {
    id: 'req_cswc',
    caller: 'പെൺകുട്ടി വിദ്യാർത്ഥിനി',
    emoji: '🎓',
    request: '“വനിതകൾക്ക് സുരക്ഷിത ഇസ്‌ലാമിക അന്തരീക്ഷത്തിൽ 3 വർഷ ഫളീല ബിരുദവും 2 വർഷ ഫാദീല പി.ജിയും എവിടെ പഠിക്കാം?”',
    correctPortalId: 'cswc',
    tip: '93 ഡേ കോളേജുകളും 21 റെസിഡൻഷ്യൽ കോളേജുകളുമായി CSWC (cswc.in) ഫളീല-ഫാദീല കോഴ്സുകൾ നൽകുന്നു!',
    directUrl: 'https://cswc.in/',
    directLabel: 'cswc.in',
  },
  {
    id: 'req_skjmcc',
    caller: 'മദ്രസാ ഉസ്താദ്',
    emoji: '📖',
    request: '“ഒരു ലക്ഷം മുഅല്ലിമീങ്ങളുടെ ക്ഷേമ പദ്ധതികളും ‘അൽ-മുഅല്ലിം’, ‘കുരുന്നുകൾ’ മാസികാ വിവരങ്ങളും എവിടെ കിട്ടും?”',
    correctPortalId: 'skjmcc',
    tip: 'സമസ്ത കേരള ജംഇയ്യത്തുൽ മുഅല്ലിമീൻ സെൻട്രൽ കൗൺസിലിന്റെ (SKJMCC) skjmcc.net പോർട്ടലിൽ എല്ലാം ലഭ്യമാണ്!',
    directUrl: 'https://skjmcc.net/',
    directLabel: 'skjmcc.net',
  },
  {
    id: 'req_jamia',
    caller: 'ഉന്നത പഠന വിദ്യാർത്ഥി',
    emoji: '🏛️',
    request: '“പട്ടിക്കാട് ആസ്ഥാനമായുള്ള സമസ്തയുടെ പരമോന്നത മതകലാലയത്തിൽ ‘മൗലവി ഫാളിൽ ഫൈസി’ ബിരുദത്തിന് അപേക്ഷിക്കണം!”',
    correctPortalId: 'jamia_meaec',
    tip: '1963-ൽ തറക്കല്ലിട്ട് 1965-ൽ ആരംഭിച്ച ജാമിഅ നൂരിയ്യ അറബിക് കോളേജ് (jamianooriya.in)!',
    directUrl: 'https://www.jamianooriya.in/',
    directLabel: 'jamianooriya.in',
  },
];

export const SamasthaPortalRouterGame: React.FC<{
  onAwardXp: (amount: number, actionId: string) => void;
  onComplete?: () => void;
  isCompleted?: boolean;
}> = ({ onAwardXp, onComplete, isCompleted = false }) => {
  const [idx, setIdx] = useState(0);
  const [shields, setShields] = useState(3);
  const [timeLeft, setTimeLeft] = useState(40);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(isCompleted);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(
    '🌐 ഓരോ വിദ്യാർത്ഥിയുടെയും ആവശ്യം വായിച്ച് ശരിയായ സമസ്ത ഔദ്യോഗിക പോർട്ടലിലേക്ക് നയിക്കൂ!'
  );
  const [lastSolvedLink, setLastSolvedLink] = useState<{ url: string; label: string } | null>(null);
  const [isErr, setIsErr] = useState(false);

  const failed = Boolean(failReason) && !won;
  const activeCase = PORTAL_CASES[idx];

  const reset = () => {
    sound.playClick();
    setIdx(0);
    setShields(3);
    setTimeLeft(40);
    setStarted(false);
    setWon(false);
    setFailReason(null);
    setLastSolvedLink(null);
    setIsErr(false);
    setFeedback('🌐 ഓരോ വിദ്യാർത്ഥിയുടെയും ആവശ്യം വായിച്ച് ശരിയായ സമസ്ത ഔദ്യോഗിക പോർട്ടലിലേക്ക് നയിക്കൂ!');
  };

  useEffect(() => {
    if (!started || won || failed) return;
    const t = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          sound.playError();
          setFailReason('⏱️ ഹെൽപ്പ്‌ഡെസ്ക് സമയം കഴിഞ്ഞു! 40 സെക്കൻഡിനുള്ളിൽ 6 പേരെയും ശരിയായ പോർട്ടലിലേക്ക് നയിക്കണം.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [started, won, failed]);

  const handlePick = (portalId: string) => {
    sound.unlockAudio();
    if (won || failed || !activeCase) return;
    if (!started) setStarted(true);

    if (portalId === activeCase.correctPortalId) {
      sound.playSuccess(idx + 1);
      setIsErr(false);
      setFeedback(`✅ ${activeCase.tip}`);
      setLastSolvedLink({ url: activeCase.directUrl, label: activeCase.directLabel });
      onAwardXp(10, `l4_portal_${activeCase.id}`);
      narrator.speak(activeCase.tip, activeCase.directLabel);

      if (idx + 1 >= PORTAL_CASES.length) {
        setWon(true);
        sound.playHoist();
        onAwardXp(30, 'l4_samastha_portals_complete');
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
        setFailReason('💥 3 തവണ തെറ്റായ പോർട്ടൽ തിരഞ്ഞെടുത്തു — ഡിജിറ്റൽ ഹെൽപ്പ്‌ഡെസ്ക് കവചങ്ങൾ തകർന്നു!');
      } else {
        setFeedback(`⚠️ ആ പോർട്ടലല്ല! ചോദ്യത്തിലെ സൂചന ശ്രദ്ധിക്കൂ (ബാക്കി കവചങ്ങൾ: ${nextShields})`);
      }
    }
  };

  return (
    <GameFullscreenShell title="🌐 സമസ്ത എജ്യുക്കേഷൻ & പോർട്ടൽ റൂട്ടർ ഗെയിം" isGameDone={won}>
      <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3.5 sm:p-4 space-y-3 shadow-sm">
        <div className="relative rounded-2xl overflow-hidden border-2 border-sky-300 bg-gradient-to-b from-slate-900 via-sky-950 to-emerald-950 text-white shadow-inner select-none">
          {/* HUD Bar */}
          <div className="bg-slate-950/90 px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-sky-500/30">
            <div className="flex items-center gap-1.5">
              <div className="bg-white rounded-md px-1.5 py-0.5 flex items-center gap-1 shrink-0">
                <img src={OFFICIAL_WING_LOGOS.skimvb.src} alt="SKIMVB" className="h-5 w-auto object-contain" />
                <img src={OFFICIAL_WING_LOGOS.snec.src} alt="SNEC" className="h-5 w-auto object-contain" />
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-sky-500/25 text-sky-200 text-xs font-extrabold tabular-nums">
                🌐 {won ? PORTAL_CASES.length : idx}/{PORTAL_CASES.length}
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-xs font-extrabold tabular-nums ${
                  timeLeft <= 8 && started && !won ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-white'
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

          {/* Active Student Request */}
          <div className="p-3.5 sm:p-4 space-y-3">
            {!won && activeCase ? (
              <>
                <motion.div
                  key={activeCase.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-white text-slate-900 border-2 border-amber-300 p-3.5 shadow-md space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-xl shrink-0">
                      {activeCase.emoji}
                    </span>
                    <div>
                      <p className="text-[10px] font-black text-sky-700">
                        വിദ്യാർത്ഥി അഭ്യർത്ഥന #{idx + 1} · {activeCase.caller}
                      </p>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                        {activeCase.request}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* 6 Portal Routing Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EDUCATION_PORTALS.map((portal) => (
                    <button
                      key={portal.id}
                      type="button"
                      disabled={failed}
                      onClick={() => handlePick(portal.id)}
                      className="rounded-xl bg-white/10 hover:bg-emerald-600/80 active:scale-95 border border-white/25 hover:border-amber-300 p-2.5 text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {portal.logoSrc ? (
                          <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
                            <img src={portal.logoSrc} alt={portal.label} className="max-h-7 w-full object-contain" />
                          </div>
                        ) : (
                          <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-lg shrink-0">
                            {portal.emoji}
                          </span>
                        )}
                        <span className="text-[11px] font-extrabold text-white leading-tight">
                          {portal.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-200 truncate">
                        🔗 {portal.shortUrl}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-emerald-900/75 border-2 border-amber-300 p-4 text-center space-y-3">
                <p className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>🎉 6 പോർട്ടലുകളും കൃത്യമായി നയിച്ചു! ഇനി ഏത് സൈറ്റും നേരിട്ട് തുറന്ന് ഉപയോഗിക്കാം:</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {EDUCATION_PORTALS.map((p) => (
                    <a
                      key={p.id}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sound.playClick()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-950 hover:bg-amber-200 text-xs font-extrabold shadow-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{p.shortUrl}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {failed && (
            <GameDefeatBurstOverlay
              title="🌐 പോർട്ടൽ റൂട്ടർ പരാജയപ്പെട്ടു!"
              reason={failReason || 'വീണ്ടും ശ്രമിക്കാം!'}
              scoreText={`ശരിയായവ: ${idx}/${PORTAL_CASES.length}`}
              onRetry={reset}
            />
          )}
        </div>

        {/* Live Feedback + Instant Direct Link to Last Matched Portal */}
        <div
          className={`rounded-xl px-3 py-2 text-xs font-extrabold border flex flex-wrap items-center justify-between gap-2 ${
            isErr
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <span className="flex-1 min-w-[200px] leading-relaxed">{feedback}</span>
          {lastSolvedLink && (
            <a
              href={lastSolvedLink.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-extrabold shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{lastSolvedLink.label} തുറക്കാം</span>
            </a>
          )}
        </div>
      </div>
    </GameFullscreenShell>
  );
};

/* ============================================================================
 * NEW GAME 52: SAMASTHA MEDIA, MAGAZINES & YOUTUBE STUDIO GAME
 * Students match 6 live audience requests to the right publication or YouTube
 * channel — and can directly open YouTube / E-Paper / Magazine portals!
 * ========================================================================== */
interface StudioChannel {
  id: string;
  title: string;
  sub: string;
  url: string;
  isYoutube?: boolean;
  emoji: string;
  logoSrc?: string;
}

const STUDIO_CHANNELS: StudioChannel[] = [
  {
    id: 'suprabhaatham',
    title: 'സുപ്രഭാതം ഇ-പേപ്പർ',
    sub: 'epaper.suprabhaatham.com',
    url: 'https://epaper.suprabhaatham.com/',
    emoji: '📰',
    logoSrc: OFFICIAL_WING_LOGOS.suprabhaatham.src,
  },
  {
    id: 'kurunnukal_balavedhi',
    title: 'കുരുന്നുകൾ & @sksbvstate',
    sub: 'youtube.com/@sksbvstate',
    url: 'https://www.youtube.com/@sksbvstate',
    isYoutube: true,
    emoji: '🌟',
    logoSrc: OFFICIAL_WING_LOGOS.samastha_magazines.src,
  },
  {
    id: 'skjmcc_mag',
    title: 'അൽ-മുഅല്ലിം & സന്തുഷ്ട കുടുംബം',
    sub: 'magazine.skjmcc.net',
    url: 'https://magazine.skjmcc.net/',
    emoji: '📖',
    logoSrc: OFFICIAL_WING_LOGOS.samastha_magazines.src,
  },
  {
    id: 'skicr_live',
    title: 'SKICR TV · ഇസ്‌ലാമിക് ക്ലാസ് റൂം',
    sub: '@SKICRTV · skicr.skssf.in',
    url: 'https://www.youtube.com/@SKICRTV',
    isYoutube: true,
    emoji: '📡',
    logoSrc: OFFICIAL_WING_LOGOS.skicr.src,
  },
  {
    id: 'trend_yt',
    title: 'TREND കരിയർ ചാനൽ',
    sub: '@trendkerala · trendinfo.in',
    url: 'https://www.youtube.com/@trendkerala',
    isYoutube: true,
    emoji: '🎓',
    logoSrc: OFFICIAL_WING_LOGOS.trend.src,
  },
  {
    id: 'sargalayam_yt',
    title: 'സർഗലയ കലാ-യൂട്യൂബ്',
    sub: '@skssfsargalaya',
    url: 'https://www.youtube.com/@skssfsargalaya',
    isYoutube: true,
    emoji: '🎨',
    logoSrc: OFFICIAL_WING_LOGOS.sargalayam.src,
  },
];

const BROADCAST_REQUESTS = [
  {
    id: 'b_suprabhaatham',
    audience: 'രാവിലത്തെ വായനക്കാരൻ',
    emoji: '☕',
    prompt: '“ഇന്നത്തെ സുപ്രഭാതം ദിനപത്രത്തിന്റെ കേരള-ഗൾഫ് എഡിഷൻ ഫോണിൽ ഡിജിറ്റൽ ഇ-പേപ്പറായി വായിക്കണം!”',
    targetId: 'suprabhaatham',
    note: 'epaper.suprabhaatham.com വഴി സുപ്രഭാതത്തിന്റെ ഡിജിറ്റൽ പതിപ്പ് ലോകത്തെവിടെ നിന്നും വായിക്കാം!',
  },
  {
    id: 'b_kurunnukal',
    audience: 'മദ്രസാ വിദ്യാർത്ഥി',
    emoji: '🌟',
    prompt: '“മദ്രസാ കുട്ടികൾക്കുള്ള ഇസ്‌ലാമിക കഥകളും ക്വിസുകളും മജ്‌ലിസുൽ മആരിഫ് ക്ലാസുകളും എവിടെ കാണാം?”',
    targetId: 'kurunnukal_balavedhi',
    note: 'കുരുന്നുകൾ ബാലമാസികയും SKSBV-യുടെ @sksbvstate യൂട്യൂബ് ചാനലും കുട്ടികൾക്കുള്ള വിജ്ഞാന കലവറയാണ്!',
  },
  {
    id: 'b_family',
    audience: 'രക്ഷിതാക്കളും ഉസ്താദുമാരും',
    emoji: '🏠',
    prompt: '“1959 മുതലുള്ള ‘അൽ-മുഅല്ലിം’ അധ്യാപക മാസികയും ‘സന്തുഷ്ട കുടുംബം’ കുടുംബ മാസികയും വായിക്കാൻ?”',
    targetId: 'skjmcc_mag',
    note: 'SKJMCC-യുടെ magazine.skjmcc.net പോർട്ടലിൽ അൽ-മുഅല്ലിമും സന്തുഷ്ട കുടുംബവും ലഭ്യമാണ്!',
  },
  {
    id: 'b_skicr',
    audience: 'പ്രവാസി പഠിതാവ്',
    emoji: '🌍',
    prompt: '“സമസ്തയുടെ തത്സമയ ഇസ്‌ലാമിക് ക്ലാസ് റൂം പ്രഭാഷണങ്ങളും സമ്മേളന ലൈവും ഏത് ചാനലിലാണ്?”',
    targetId: 'skicr_live',
    note: '@SKICRTV (skicr.skssf.in) ലോകവ്യാപകമായി ലൈവ് പഠന ക്ലാസുകളും സമ്മേളനങ്ങളും എത്തിക്കുന്നു!',
  },
  {
    id: 'b_trend',
    audience: 'ഹയർ സെക്കൻഡറി വിദ്യാർത്ഥി',
    emoji: '🚀',
    prompt: '“TASTE പരിശീലന പദ്ധതിയും കരിയർ ഗൈഡൻസ് വീഡിയോകളും കാണാൻ ഏത് SKSSF ചാനലാണ് തുറക്കേണ്ടത്?”',
    targetId: 'trend_yt',
    note: 'trendinfo.in വെബ്സൈറ്റും @trendkerala യൂട്യൂബ് ചാനലും കരിയർ വഴികാട്ടികളാണ്!',
  },
  {
    id: 'b_sargalayam',
    audience: 'കലാപ്രതിഭ വിദ്യാർത്ഥി',
    emoji: '🎤',
    prompt: '“സർഗലയ കലാമേളകൾ, ദഫ്‌മുട്ട്, മാപ്പിളപ്പാട്ട്, പ്രസംഗ വേദികൾ കാണാൻ ഏത് ചാനൽ സന്ദർശിക്കണം?”',
    targetId: 'sargalayam_yt',
    note: 'SKSSF സർഗലയത്തിന്റെ ഔദ്യോഗിക ചാനലായ @skssfsargalaya-ൽ കലാമേള ഹൈലൈറ്റുകൾ കാണാം!',
  },
];

export const SamasthaMediaStudioGame: React.FC<{
  onAwardXp: (amount: number, actionId: string) => void;
  onComplete?: () => void;
  isCompleted?: boolean;
}> = ({ onAwardXp, onComplete, isCompleted = false }) => {
  const [idx, setIdx] = useState(0);
  const [shields, setShields] = useState(3);
  const [timeLeft, setTimeLeft] = useState(40);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(isCompleted);
  const [failReason, setFailReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(
    '📺 ലൈവ് സ്റ്റുഡിയോ ഓൺ എയർ! ഓരോ പ്രേക്ഷകന്റെയും ചോദ്യത്തിന് ശരിയായ മാധ്യമം/യൂട്യൂബ് ചാനൽ കണക്ട് ചെയ്യൂ!'
  );
  const [lastChannel, setLastChannel] = useState<StudioChannel | null>(null);
  const [isErr, setIsErr] = useState(false);

  const failed = Boolean(failReason) && !won;
  const req = BROADCAST_REQUESTS[idx];

  const reset = () => {
    sound.playClick();
    setIdx(0);
    setShields(3);
    setTimeLeft(40);
    setStarted(false);
    setWon(false);
    setFailReason(null);
    setLastChannel(null);
    setIsErr(false);
    setFeedback('📺 ലൈവ് സ്റ്റുഡിയോ ഓൺ എയർ! ഓരോ പ്രേക്ഷകന്റെയും ചോദ്യത്തിന് ശരിയായ മാധ്യമം/യൂട്യൂബ് ചാനൽ കണക്ട് ചെയ്യൂ!');
  };

  useEffect(() => {
    if (!started || won || failed) return;
    const t = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          sound.playError();
          setFailReason('⏱️ ലൈവ് ബ്രോഡ്‌കാസ്റ്റ് സമയം കഴിഞ്ഞു! 40 സെക്കൻഡിനുള്ളിൽ 6 ചാനലുകളും കണക്ട് ചെയ്യണം.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [started, won, failed]);

  const handleConnect = (channel: StudioChannel) => {
    sound.unlockAudio();
    if (won || failed || !req) return;
    if (!started) setStarted(true);

    if (channel.id === req.targetId) {
      sound.playSuccess(idx + 1);
      setIsErr(false);
      setFeedback(`✅ ${req.note}`);
      setLastChannel(channel);
      onAwardXp(10, `l4_media_${req.id}`);
      narrator.speak(req.note, channel.title);

      if (idx + 1 >= BROADCAST_REQUESTS.length) {
        setWon(true);
        sound.playHoist();
        onAwardXp(30, 'l4_media_youtube_hub_complete');
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
        setFailReason('💥 3 തവണ തെറ്റായ ചാനൽ കണക്ട് ചെയ്തു — സ്റ്റുഡിയോ സിഗ്നൽ നഷ്ടപ്പെട്ടു!');
      } else {
        setFeedback(`⚠️ ആ ചാനലല്ല! പ്രേക്ഷകന്റെ ആവശ്യം ഒരിക്കൽ കൂടി വായിക്കൂ (ബാക്കി കവചങ്ങൾ: ${next})`);
      }
    }
  };

  return (
    <GameFullscreenShell title="📺 സമസ്ത മീഡിയ, മാഗസിൻ & യൂട്യൂബ് സ്റ്റുഡിയോ" isGameDone={won}>
      <div className="bg-white rounded-2xl border-2 border-emerald-200 p-3.5 sm:p-4 space-y-3 shadow-sm">
        <div className="relative rounded-2xl overflow-hidden border-2 border-rose-400/70 bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white shadow-inner select-none">
          {/* Top On-Air Studio Bar */}
          <div className="bg-slate-950/90 px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/30">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[11px] font-black">
                ● ON AIR
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-purple-500/30 text-purple-100 text-xs font-extrabold tabular-nums">
                📺 {won ? BROADCAST_REQUESTS.length : idx}/{BROADCAST_REQUESTS.length}
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-xs font-extrabold tabular-nums ${
                  timeLeft <= 8 && started && !won ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-white'
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

          <div className="p-3.5 sm:p-4 space-y-3">
            {!won && req ? (
              <>
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-gradient-to-br from-amber-50 to-white text-slate-900 border-2 border-amber-300 p-3.5 shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-xl shrink-0">
                      {req.emoji}
                    </span>
                    <div>
                      <p className="text-[10px] font-black text-rose-700">
                        ലൈവ് കോൾ #{idx + 1} · {req.audience}
                      </p>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                        {req.prompt}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STUDIO_CHANNELS.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      disabled={failed}
                      onClick={() => handleConnect(ch)}
                      className="rounded-xl bg-white/10 hover:bg-rose-600/80 active:scale-95 border border-white/25 hover:border-amber-300 p-2.5 text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {ch.logoSrc ? (
                          <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
                            <img src={ch.logoSrc} alt={ch.title} className="max-h-7 w-full object-contain" />
                          </div>
                        ) : (
                          <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-lg shrink-0">
                            {ch.emoji}
                          </span>
                        )}
                        <span className="text-[11px] font-extrabold text-white leading-tight">
                          {ch.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-200 truncate">
                        {ch.isYoutube ? '▶' : '🌐'} {ch.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-emerald-900/75 border-2 border-amber-300 p-4 text-center space-y-3">
                <p className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>🎉 ലൈവ് സ്റ്റുഡിയോ വിജയം! ഇഷ്ടമുള്ള ചാനലും മാസികയും നേരിട്ട് തുറക്കാം:</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {STUDIO_CHANNELS.map((ch) => (
                    <a
                      key={ch.id}
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sound.playClick()}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-xs transition-colors ${
                        ch.isYoutube
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-white hover:bg-amber-200 text-emerald-950'
                      }`}
                    >
                      {ch.isYoutube ? <Youtube className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />}
                      <span>{ch.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {failed && (
            <GameDefeatBurstOverlay
              title="📺 സ്റ്റുഡിയോ സിഗ്നൽ നഷ്ടപ്പെട്ടു!"
              reason={failReason || 'വീണ്ടും ശ്രമിക്കാം!'}
              scoreText={`കണക്ട് ചെയ്തവ: ${idx}/${BROADCAST_REQUESTS.length}`}
              onRetry={reset}
            />
          )}
        </div>

        {/* Feedback + Live Link Launcher */}
        <div
          className={`rounded-xl px-3 py-2 text-xs font-extrabold border flex flex-wrap items-center justify-between gap-2 ${
            isErr
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <span className="flex-1 min-w-[200px] leading-relaxed">{feedback}</span>
          {lastChannel && (
            <a
              href={lastChannel.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-[11px] font-extrabold shrink-0 ${
                lastChannel.isYoutube ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {lastChannel.isYoutube ? <Youtube className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
              <span>{lastChannel.title} തുറക്കാം</span>
            </a>
          )}
        </div>
      </div>
    </GameFullscreenShell>
  );
};
