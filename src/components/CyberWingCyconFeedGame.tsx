import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, RotateCcw, ShieldAlert, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { sound } from '../utils/sound';
import { narrator } from '../utils/narrator';
import { GameDefeatBurstOverlay, GameShatterLives } from './GameLivesHud';
import { useGameStagePaused, useGameStagePortal } from './GameFullscreenShell';
import { OFFICIAL_WING_LOGOS } from '../data/officialLogos';
import { InlineOfficialLinksStrip } from './OfficialResourceHubModal';
import { getLinksForLesson } from '../data/officialLinks';

interface CyberFeedPost {
  id: string;
  handle: string;
  author: string;
  avatar: string;
  tag: string;
  headline: string;
  body: string;
  action: 'publish' | 'block';
  reasonRight: string;
  reasonWrong: string;
  logoId?: 'cyber' | 'skicr' | 'viqaya' | 'trend' | 'sargalayam';
}

const CYBER_FEED_DECK: CyberFeedPost[] = [
  {
    id: 'p_cycon_poster',
    handle: '@skssf_cyber',
    author: 'SKSSF Cyber Wing',
    avatar: '💻',
    tag: 'ഔദ്യോഗിക പോസ്റ്റർ',
    headline: 'CYCON സൈബർ സമ്മേളനം — വിജ്ഞാനം · വിനയം · സേവനം',
    body: 'ധാർമ്മിക ഡിജിറ്റൽ സാക്ഷരതയും ക്രിയാത്മക പ്രബോധനവും ലക്ഷ്യമാക്കി SKSSF സൈകോൺ ക്യാമ്പ്.',
    action: 'publish',
    reasonRight: '✅ ഔദ്യോഗിക സൈകോൺ പോസ്റ്റർ പബ്ലിഷ് ചെയ്തു!',
    reasonWrong: '❌ ഇത് ഔദ്യോഗിക SKSSF സൈകോൺ പോസ്റ്ററാണ് — ബ്ലോക്ക് ചെയ്യരുത്!',
    logoId: 'cyber',
  },
  {
    id: 'p_troll_fight',
    handle: '@rage_bait_99',
    author: 'പ്രകോപന പേജ്',
    avatar: '🤬',
    tag: 'തർക്ക വീഡിയോ',
    headline: 'വിശ്വാസത്തെ പരിഹസിക്കുന്ന വീഡിയോ! കമന്റിൽ കയറി ചീത്ത വിളിക്കൂ!',
    body: 'എല്ലാവരും ഈ വീഡിയോ ഷെയർ ചെയ്ത് കമന്റ് ബോക്സിൽ വഴക്കിടൂ എന്ന് ആഹ്വാനം.',
    action: 'block',
    reasonRight: '🛡️ തർക്കുൽ മാലായഅ്നി! പ്രകോപന വീഡിയോ ഒഴിവാക്കി ("Do Not Recommend")!',
    reasonWrong: '💥 തെറ്റ്! പ്രകോപന വീഡിയോയ്ക്ക് റീച്ച് കൂട്ടുന്നത് സൈബർ മര്യാദയ്ക്ക് എതിരാണ്!',
  },
  {
    id: 'p_skicr_live',
    handle: '@SKICROfficial',
    author: 'SKICR Live Class Room',
    avatar: '📡',
    tag: 'ലൈവ് ക്ലാസ്',
    headline: 'സമസ്ത ഇസ്‌ലാമിക് ക്ലാസ് റൂം — ഇന്നത്തെ ഖുർആൻ & ഫിഖ്ഹ് ക്ലാസ്',
    body: 'ലോകമെമ്പാടുമുള്ള വിദ്യാർത്ഥികൾക്കായി സൗജന്യ ലൈവ് പഠന ക്ലാസ് രാത്രി 8:30-ന്.',
    action: 'publish',
    reasonRight: '✅ SKICR ലൈവ് പഠന ക്ലാസ് ഫീഡിൽ പബ്ലിഷ് ചെയ്തു!',
    reasonWrong: '❌ SKICR സമസ്തയുടെ ഔദ്യോഗിക ലൈവ് ക്ലാസ് റൂമാണ് — പബ്ലിഷ് ചെയ്യണം!',
    logoId: 'skicr',
  },
  {
    id: 'p_otp_phish',
    handle: '@free_win_2025',
    author: 'അജ്ഞാത സമ്മാന ലിങ്ക്',
    avatar: '🎣',
    tag: 'അജ്ഞാത ലിങ്ക്',
    headline: 'നിങ്ങൾക്ക് ₹50,000 സമ്മാനം! ഈ ലിങ്കിൽ ക്ലിക്ക് ചെയ്ത് OTP നൽകൂ!',
    body: 'ഉടൻ ഫോൺ നമ്പറും ബാങ്ക് OTP-യും അയച്ചാൽ സമ്മാനം ലഭിക്കുമെന്ന് വ്യാജ സന്ദേശം.',
    action: 'block',
    reasonRight: '🛡️ ഫിഷിംഗ് തട്ടിപ്പ് ലിങ്ക് ബ്ലോക്ക് ചെയ്തു! OTP ഒരിക്കലും പങ്കിടരുത്.',
    reasonWrong: '💥 അപകടം! ഇത് വ്യാജ ഫിഷിംഗ് തട്ടിപ്പാണ് — ഉടൻ ബ്ലോക്ക് ചെയ്യണം!',
  },
  {
    id: 'p_sahachari_blood',
    handle: '@skssf_viqaya',
    author: 'വിഖായ · സഹചാരി ഡെസ്ക്',
    avatar: '🩸',
    tag: 'അടിയന്തര സേവനം',
    headline: 'കോഴിക്കോട് മെഡിക്കൽ കോളേജിൽ O+ രക്തം ആവശ്യമുണ്ട് (Verified)',
    body: 'സഹചാരി ഹെൽപ്പ് ഡെസ്ക് സ്ഥിരീകരിച്ച അടിയന്തര രക്തദാന അഭ്യർത്ഥന.',
    action: 'publish',
    reasonRight: '✅ സ്ഥിരീകരിച്ച സഹചാരി രക്തദാന അറിയിപ്പ് പങ്കുവെച്ചു!',
    reasonWrong: '❌ സ്ഥിരീകരിച്ച രക്തദാന ജീവകാരുണ്യ അഭ്യർത്ഥന പബ്ലിഷ് ചെയ്യണം!',
    logoId: 'viqaya',
  },
  {
    id: 'p_fake_forward',
    handle: '@rumor_factory',
    author: 'വ്യാജ ഫോർവേഡ്',
    avatar: '📢',
    tag: 'സ്ഥിരീകരിക്കാത്തത്',
    headline: 'നാളെ എല്ലാ പരീക്ഷകളും റദ്ദാക്കി! ഉറപ്പില്ലെങ്കിലും 10 ഗ്രൂപ്പിൽ അയക്കൂ!',
    body: 'ഉറവിടമോ ഔദ്യോഗിക അറിയിപ്പോ ഇല്ലാത്ത തെറ്റിദ്ധരിപ്പിക്കുന്ന വാട്സ്ആപ്പ് ഫോർവേഡ്.',
    action: 'block',
    reasonRight: '🛡️ ഉറവിടം സ്ഥിരീകരിക്കാത്ത വ്യാജ വാർത്ത തടഞ്ഞു! ("തബയ്യുൻ" പാലിച്ചു)',
    reasonWrong: '💥 തെറ്റ്! സ്ഥിരീകരിക്കാത്ത കിംവദന്തികൾ ഷെയർ ചെയ്യുന്നത് ഇസ്‌ലാമിക മര്യാദയല്ല!',
  },
  {
    id: 'p_trend_webinar',
    handle: '@trendkerala',
    author: 'SKSSF TREND',
    avatar: '🎓',
    tag: 'കരിയർ ഗൈഡൻസ്',
    headline: 'പ്ലസ് ടു കഴിഞ്ഞവർക്കായി സൗജന്യ സിവിൽ സർവീസ് & സ്കോളർഷിപ്പ് വെബിനാർ',
    body: 'വിദ്യാർത്ഥികൾക്ക് മികച്ച കോഴ്സുകളും സ്കോളർഷിപ്പുകളും പരിചയപ്പെടുത്തുന്ന ട്രെൻഡ് ക്ലാസ്.',
    action: 'publish',
    reasonRight: '✅ TREND വിദ്യാഭ്യാസ വെബിനാർ പോസ്റ്റർ പബ്ലിഷ് ചെയ്തു!',
    reasonWrong: '❌ വിദ്യാർത്ഥികൾക്ക് ഉപകാരപ്രദമായ TREND ഔദ്യോഗിക അറിയിപ്പാണിത്!',
    logoId: 'trend',
  },
  {
    id: 'p_personal_mock',
    handle: '@troll_kerala_x',
    author: 'വ്യക്തിഹത്യ ട്രോൾ',
    avatar: '🤡',
    tag: 'പരിഹാസം',
    headline: 'മറ്റൊരാളുടെ ഫോട്ടോ എഡിറ്റ് ചെയ്ത് പരിഹസിക്കുന്ന ട്രോൾ പോസ്റ്റ്',
    body: 'അനുവാദമില്ലാതെ മറ്റുള്ളവരെ കളിയാക്കാനും അപമാനിക്കാനും നിർമ്മിച്ച മീം.',
    action: 'block',
    reasonRight: '🛡️ വ്യക്തിഹത്യയും പരിഹാസവും തടഞ്ഞു! സൈബർ ലോകത്തും മാന്യത കാത്തു.',
    reasonWrong: '💥 തെറ്റ്! മറ്റുള്ളവരെ പരിഹസിക്കുന്നതും അപമാനിക്കുന്നതും ബ്ലോക്ക് ചെയ്യണം!',
  },
  {
    id: 'p_sargalayam_reel',
    handle: '@skssfsargalaya',
    author: 'SKSSF സർഗലയ',
    avatar: '🎨',
    tag: 'കലാ സന്ദേശം',
    headline: 'സർഗലയം ഖിറാഅത്ത് & അറബിക് കലിഗ്രഫി പ്രദർശന വീഡിയോ',
    body: 'വിദ്യാർത്ഥികളുടെ സർഗ്ഗാത്മക കഴിവുകൾ പ്രോത്സാഹിപ്പിക്കുന്ന മനോഹരമായ റീൽ.',
    action: 'publish',
    reasonRight: '✅ സർഗലയം ഇസ്‌ലാമിക കലാ വീഡിയോ പബ്ലിഷ് ചെയ്തു!',
    reasonWrong: '❌ ഇത് സർഗലയം കലാ-വിദ്യാഭ്യാസ റീലാണ് — പബ്ലിഷ് ചെയ്യണം!',
    logoId: 'sargalayam',
  },
  {
    id: 'p_fake_edit_date',
    handle: '@edited_news_bot',
    author: 'എഡിറ്റ് ചെയ്ത പോസ്റ്റർ',
    avatar: '⚠️',
    tag: 'വ്യാജ തീയതി',
    headline: 'സമ്മേളനം റദ്ദാക്കിയെന്ന് വ്യാജമായി എഡിറ്റ് ചെയ്ത സ്ക്രീൻഷോട്ട്!',
    body: 'ഔദ്യോഗിക പേജുകളിൽ ഇല്ലാത്ത, ആശയക്കുഴപ്പം ഉണ്ടാക്കാൻ നിർമ്മിച്ച വ്യാജ പോസ്റ്റർ.',
    action: 'block',
    reasonRight: '🛡️ വ്യാജ എഡിറ്റ് പോസ്റ്റർ കൃത്യമായി പിടികൂടി ബ്ലോക്ക് ചെയ്തു!',
    reasonWrong: '💥 തെറ്റ്! വ്യാജമായി എഡിറ്റ് ചെയ്ത സമ്മേളന അറിയിപ്പ് ബ്ലോക്ക് ചെയ്യണം!',
  },
];

interface BotNode {
  id: number;
  x: number;
  y: number;
  label: string;
  cleared: boolean;
}

const TARGET_CLEARS = 8;
const MAX_LIVES = 3;

function shuffleDeck(items: CyberFeedPost[]): CyberFeedPost[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeBotNodes(): BotNode[] {
  const slots = [
    { x: 20 + Math.random() * 18, y: 24 + Math.random() * 20, label: '🤖 SPAM BOT' },
    { x: 58 + Math.random() * 22, y: 26 + Math.random() * 22, label: '⚠️ FAKE LINK' },
    { x: 34 + Math.random() * 32, y: 62 + Math.random() * 18, label: '⚡ TROLL FLOOD' },
  ];
  return slots.map((s, idx) => ({ id: idx + 1, ...s, cleared: false }));
}

export interface CyberWingCyconFeedGameProps {
  xpKey: string;
  title: string;
  subtitle: string;
  onAwardXp: (amount: number, key: string) => void;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export const CyberWingCyconFeedGame: React.FC<CyberWingCyconFeedGameProps> = ({
  xpKey,
  title,
  subtitle,
  onAwardXp,
  onComplete,
  isCompleted = false,
}) => {
  const stagePaused = useGameStagePaused();
  const stagePortal = useGameStagePortal();
  const [phase, setPhase] = useState<'ready' | 'playing' | 'won' | 'lost'>('playing');
  const [deck, setDeck] = useState<CyberFeedPost[]>(() => shuffleDeck(CYBER_FEED_DECK));
  const [deckIdx, setDeckIdx] = useState(0);
  const [clearedCount, setClearedCount] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [streak, setStreak] = useState(0);
  const [reachScore, setReachScore] = useState(1200);
  const [feedback, setFeedback] = useState<{ text: string; tone: 'ok' | 'err' | 'warn' } | null>(
    null
  );
  const [failReason, setFailReason] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  // Per-card countdown timer
  const [cardDuration, setCardDuration] = useState(7.5);
  const [cardTimeLeft, setCardTimeLeft] = useState(7.5);

  // Swipe drag state
  const [dragX, setDragX] = useState(0);
  const dragStartRef = useRef<number | null>(null);

  // Spam-bot attack mini-event (triggers after 3rd and 6th clear)
  const [botAttack, setBotAttack] = useState<{
    active: boolean;
    nodes: BotNode[];
    timeLeft: number;
    maxTime: number;
  }>({ active: false, nodes: [], timeLeft: 5.0, maxTime: 5.0 });
  const botTriggeredAtRef = useRef<Set<number>>(new Set());

  const currentPost = deck[deckIdx % deck.length];
  const cyberLinks = getLinksForLesson('l4_cyber_shield').slice(0, 4);

  const getNextCardDuration = (clears: number) => Math.max(5.0, 7.6 - clears * 0.3);

  const startGame = useCallback(() => {
    sound.unlockAudio();
    sound.playClick();
    const freshDeck = shuffleDeck(CYBER_FEED_DECK);
    botTriggeredAtRef.current = new Set();
    setDeck(freshDeck);
    setDeckIdx(0);
    setClearedCount(0);
    setLives(MAX_LIVES);
    setStreak(0);
    setReachScore(1200);
    setFailReason('');
    setDragX(0);
    setBotAttack({ active: false, nodes: [], timeLeft: 5.0, maxTime: 5.0 });
    setCardDuration(7.6);
    setCardTimeLeft(7.6);
    setFeedback({
      text: '📡 സൈകോൺ ലൈവ് ഫീഡ് ഓൺ-എയർ! നല്ലവ പബ്ലിഷ് ചെയ്യൂ, വ്യാജവും തർക്കവും ബ്ലോക്ക് ചെയ്യൂ!',
      tone: 'warn',
    });
    setPhase('playing');
  }, []);

  const triggerDamage = useCallback(
    (reasonText: string, advanceCard: boolean) => {
      sound.playError();
      setShakeKey((k) => k + 1);
      setStreak(0);
      setReachScore((r) => Math.max(400, r - 600));
      setFeedback({ text: reasonText, tone: 'err' });

      setLives((prev) => {
        const nextLives = Math.max(0, prev - 1);
        if (nextLives === 0) {
          setFailReason(reasonText);
          setPhase('lost');
          setBotAttack((b) => ({ ...b, active: false }));
          narrator.speak('സൈബർ കവചം തകർന്നു! വീണ്ടും ശ്രദ്ധയോടെ ശ്രമിക്കാം.', 'സൈകോൺ മോഡറേറ്റർ');
        } else if (advanceCard) {
          const nextDur = getNextCardDuration(clearedCount);
          setDeckIdx((i) => i + 1);
          setCardDuration(nextDur);
          setCardTimeLeft(nextDur);
          setDragX(0);
        }
        return nextLives;
      });
    },
    [clearedCount]
  );

  const handleDecision = useCallback(
    (choice: 'publish' | 'block') => {
      if (phase !== 'playing' || botAttack.active || !currentPost) return;
      sound.unlockAudio();

      if (choice === currentPost.action) {
        const nextClears = clearedCount + 1;
        const nextStreak = streak + 1;
        const bonus = 1200 + nextStreak * 350;
        sound.playSuccess(nextClears);
        setClearedCount(nextClears);
        setStreak(nextStreak);
        setReachScore((r) => r + bonus);
        setFeedback({ text: currentPost.reasonRight, tone: 'ok' });
        setDragX(0);

        if (nextClears >= TARGET_CLEARS) {
          setPhase('won');
          sound.playHoist();
          onAwardXp(35, `hands_${xpKey}`);
          onComplete?.();
          stagePortal?.notifyStageWin(
            `സൈകോൺ ലൈവ് ഫീഡ് 100% സുരക്ഷിതമായി പൂർത്തിയാക്കി! (${(reachScore + bonus).toLocaleString()}+ Reach)`
          );
          narrator.speak(
            'അടിപൊളി! നിങ്ങൾ സൈകോൺ ലൈവ് ഫീഡ് സുരക്ഷിതമായി നയിച്ചു! വ്യാജ വാർത്തകളും പ്രകോപനങ്ങളും ഒഴിവാക്കി നല്ല സന്ദേശങ്ങൾ മാത്രം പങ്കുവെച്ചു!',
            'SKSSF സൈബർ വിംഗ് (സൈകോൺ)'
          );
          return;
        }

        // Trigger a live Spam-Bot Intrusion after 3rd and 6th verified clear!
        if ((nextClears === 3 || nextClears === 6) && !botTriggeredAtRef.current.has(nextClears)) {
          botTriggeredAtRef.current.add(nextClears);
          const nextDur = getNextCardDuration(nextClears);
          setDeckIdx((i) => i + 1);
          setCardDuration(nextDur);
          setCardTimeLeft(nextDur);
          setBotAttack({
            active: true,
            nodes: makeBotNodes(),
            timeLeft: 5.0,
            maxTime: 5.0,
          });
          setFeedback({
            text: '🚨 സ്പാം-ബോട്ട് ആക്രമണം! 5 സെക്കൻഡിനുള്ളിൽ 3 വൈറസ് ബോട്ടുകളിലും തൊട്ട് നശിപ്പിക്കൂ!',
            tone: 'warn',
          });
          return;
        }

        const nextDur = getNextCardDuration(nextClears);
        setDeckIdx((i) => i + 1);
        setCardDuration(nextDur);
        setCardTimeLeft(nextDur);
      } else {
        triggerDamage(currentPost.reasonWrong, true);
      }
    },
    [
      botAttack.active,
      clearedCount,
      currentPost,
      onAwardXp,
      onComplete,
      phase,
      streak,
      triggerDamage,
      xpKey,
    ]
  );

  // Per-card live countdown timer (pauses during bot attack or blurred shell overlay)
  useEffect(() => {
    if (phase !== 'playing' || botAttack.active || stagePaused) return;
    const interval = window.setInterval(() => {
      setCardTimeLeft((prev) => {
        const next = Math.max(0, +(prev - 0.1).toFixed(1));
        if (next <= 0) {
          window.clearInterval(interval);
          triggerDamage('⏱️ സമയം തീർന്നു! പരിശോധിക്കാത്ത പോസ്റ്റ് ഫീഡിൽ ലീക്ക് ആയി!', true);
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [phase, botAttack.active, stagePaused, deckIdx, triggerDamage]);

  // Spam-bot attack countdown timer
  useEffect(() => {
    if (phase !== 'playing' || !botAttack.active || stagePaused) return;
    const interval = window.setInterval(() => {
      setBotAttack((prev) => {
        if (!prev.active) return prev;
        const next = Math.max(0, +(prev.timeLeft - 0.1).toFixed(1));
        if (next <= 0) {
          window.clearInterval(interval);
          window.setTimeout(() => {
            setBotAttack({ active: false, nodes: [], timeLeft: 5.0, maxTime: 5.0 });
            triggerDamage('🤖 സ്പാം-ബോട്ട് ഫയർവാൾ തകർത്ത് ഫീഡിൽ കയറി!', false);
          }, 0);
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: next };
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [phase, botAttack.active, stagePaused, triggerDamage]);

  // Keyboard shortcuts (ArrowLeft / ArrowRight)
  useEffect(() => {
    if (phase !== 'playing' || botAttack.active || stagePaused) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleDecision('block');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDecision('publish');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, botAttack.active, handleDecision]);

  const handleZapBot = (nodeId: number) => {
    if (!botAttack.active) return;
    sound.unlockAudio();
    sound.playSuccess(2);
    setBotAttack((prev) => {
      const updated = prev.nodes.map((n) => (n.id === nodeId ? { ...n, cleared: true } : n));
      const remaining = updated.filter((n) => !n.cleared).length;
      if (remaining === 0) {
        setReachScore((r) => r + 1500);
        setFeedback({
          text: '🛡️ ഫയർവാൾ സുരക്ഷിതം! എല്ലാ സ്പാം-ബോട്ടുകളെയും തകർത്തു (+1500 Reach)!',
          tone: 'ok',
        });
        return { active: false, nodes: [], timeLeft: 5.0, maxTime: 5.0 };
      }
      return { ...prev, nodes: updated };
    });
  };

  // Pointer swipe handlers for the social feed card
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'playing' || botAttack.active) return;
    dragStartRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return;
    const delta = e.clientX - dragStartRef.current;
    setDragX(Math.max(-135, Math.min(135, delta)));
  };

  const handlePointerUp = () => {
    if (dragStartRef.current === null) return;
    dragStartRef.current = null;
    if (dragX > 56) {
      handleDecision('publish');
    } else if (dragX < -56) {
      handleDecision('block');
    } else {
      setDragX(0);
    }
  };

  const timePct = Math.max(0, Math.min(100, (cardTimeLeft / cardDuration) * 100));
  const timerColor =
    timePct > 50 ? 'bg-emerald-400' : timePct > 25 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse';

  return (
    <motion.div
      key={shakeKey}
      animate={shakeKey > 0 ? { x: [0, -7, 7, -4, 4, 0] } : undefined}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border-2 border-cyan-500/45 bg-gradient-to-b from-slate-950 via-[#08162C] to-slate-950 text-white p-3.5 sm:p-5 space-y-3.5 shadow-xl overflow-hidden"
    >
      {/* Top Cyber Command Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="bg-white rounded-xl p-1.5 shadow-md shrink-0">
            <img
              src={OFFICIAL_WING_LOGOS.cyber.src}
              alt={OFFICIAL_WING_LOGOS.cyber.label}
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                CYCON LIVE FEED
              </span>
              {streak >= 2 && phase === 'playing' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/25 border border-amber-400/50 text-amber-200 text-[10px] font-black">
                  🔥 x{streak} സ്ട്രീക്ക്
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-cyan-400/30 text-right">
            <p className="text-[9px] font-bold text-cyan-300 uppercase">പുരോഗതി</p>
            <p className="text-xs sm:text-sm font-black tabular-nums text-white">
              {clearedCount}/{TARGET_CLEARS}
            </p>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-emerald-400/30 text-right">
            <p className="text-[9px] font-bold text-emerald-300 uppercase">Reach</p>
            <p className="text-xs sm:text-sm font-black tabular-nums text-amber-300">
              {reachScore.toLocaleString()}
            </p>
          </div>
          <GameShatterLives lives={lives} maxLives={MAX_LIVES} dark compact />
        </div>
      </div>

      {/* READY / BRIEFING PHASE */}
      {phase === 'ready' && (
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center text-3xl shadow-lg shrink-0">
              📱
            </div>
            <div className="space-y-1">
              <p className="text-sm sm:text-base font-extrabold text-cyan-200">
                സൈകോൺ (CyCon) ലൈവ് ഫീഡ് കമാൻഡർ ദൗത്യം
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-xl bg-emerald-950/60 border border-emerald-400/35 p-3 space-y-1">
              <p className="font-black text-emerald-300">📢 പബ്ലിഷ് (വലത്തോട്ട് →)</p>
              <p className="text-slate-200 leading-snug">
                സൈകോൺ പോസ്റ്ററുകൾ, SKICR ലൈവ് ക്ലാസ്, സഹചാരി രക്തദാനം, TREND വെബിനാർ എന്നിവ പബ്ലിഷ് ചെയ്യൂ.
              </p>
            </div>
            <div className="rounded-xl bg-rose-950/60 border border-rose-400/35 p-3 space-y-1">
              <p className="font-black text-rose-300">🚫 ബ്ലോക്ക് (ഇടത്തോട്ട് ←)</p>
              <p className="text-slate-200 leading-snug">
                പ്രകോപന തർക്കങ്ങൾ, വ്യാജ ഫോർവേഡുകൾ, OTP ഫിഷിംഗ് ലിങ്കുകൾ, ട്രോളുകൾ എന്നിവ ഉടൻ ബ്ലോക്ക് ചെയ്യൂ.
              </p>
            </div>
            <div className="rounded-xl bg-amber-950/60 border border-amber-400/35 p-3 space-y-1">
              <p className="font-black text-amber-300">⚠️ പരാജയപ്പെടുന്ന വിധം (3 കവചം)</p>
              <p className="text-slate-200 leading-snug">
                തെറ്റായ തീരുമാനം, സമയം തീരൽ, അല്ലെങ്കിൽ സ്പാം-ബോട്ട് ആക്രമണം തടയാതിരുന്നാൽ കവചം തകരും!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            <span>സൈകോൺ ലൈവ് ഫീഡ് തുടങ്ങാം! (8 പോസ്റ്റുകൾ ശരിയാക്കൂ)</span>
          </button>
        </div>
      )}

      {/* ACTIVE GAMEPLAY ARENA */}
      {phase === 'playing' && (
        <div className="relative space-y-3">
          {/* Urgency Countdown Bar */}
          {!botAttack.active && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-extrabold">
                <span className="text-cyan-200">
                  ⏱️ പോസ്റ്റ് പരിശോധന സമയം (കാർഡ് വലിച്ചിടാം അല്ലെങ്കിൽ ബട്ടൺ അമർത്താം)
                </span>
                <span
                  className={`tabular-nums font-black ${
                    cardTimeLeft <= 2.2 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                  }`}
                >
                  {cardTimeLeft.toFixed(1)}s
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-100 ${timerColor}`}
                  style={{ width: `${timePct}%` }}
                />
              </div>
            </div>
          )}

          {/* LIVE SPAM-BOT ATTACK STAGE */}
          {botAttack.active ? (
            <div className="relative h-64 sm:h-72 rounded-2xl border-2 border-rose-500 bg-gradient-to-br from-rose-950/90 via-slate-950 to-amber-950/80 overflow-hidden p-3 select-none">
              <div className="flex items-center justify-between gap-2 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-black animate-pulse">
                  <ShieldAlert className="w-4 h-4" />
                  SPAM BOT ATTACK! 3 ബോട്ടുകളിലും തൊടൂ!
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-rose-400/60 text-amber-300 text-xs font-black tabular-nums">
                  ⏱️ {botAttack.timeLeft.toFixed(1)}s
                </span>
              </div>

              {/* Breach Danger Bar */}
              <div className="mt-2 h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-rose-500/40 relative z-10">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-100"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((botAttack.maxTime - botAttack.timeLeft) / botAttack.maxTime) * 100))}%`,
                  }}
                />
              </div>

              {/* Interactive Glitch Bot Targets */}
              {botAttack.nodes.map((node) =>
                node.cleared ? null : (
                  <motion.button
                    key={node.id}
                    type="button"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{
                      scale: [1, 1.12, 1],
                      opacity: 1,
                      rotate: [-3, 3, -3],
                    }}
                    transition={{ duration: 0.75, repeat: Infinity }}
                    onClick={() => handleZapBot(node.id)}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 border-2 border-amber-300 text-white shadow-[0_0_24px_rgba(244,63,94,0.75)] font-black text-xs cursor-pointer active:scale-90 z-20"
                  >
                    <span className="block text-base leading-none">{node.label.split(' ')[0]}</span>
                    <span className="text-[10px] tracking-wide">{node.label.slice(2)}</span>
                    <span className="block text-[9px] text-amber-200 mt-0.5">തൊട്ട് തകർക്കൂ!</span>
                  </motion.button>
                )
              )}

              <p className="absolute bottom-2.5 inset-x-0 text-center text-[11px] font-bold text-rose-200/90">
                ബാക്കി വൈറസ് ബോട്ടുകൾ: {botAttack.nodes.filter((n) => !n.cleared).length} / 3
              </p>
            </div>
          ) : (
            /* SWIPEABLE SOCIAL FEED POST CARD */
            <div className="relative py-1">
              <AnimatePresence mode="wait">
                {currentPost && (
                  <motion.div
                    key={`${currentPost.id}-${deckIdx}`}
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      x: dragX,
                      rotate: dragX * 0.08,
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`relative rounded-2xl border-2 bg-slate-900/95 p-4 sm:p-5 shadow-2xl select-none touch-none cursor-grab active:cursor-grabbing transition-colors ${
                      dragX > 35
                        ? 'border-emerald-400 shadow-emerald-500/25'
                        : dragX < -35
                        ? 'border-rose-500 shadow-rose-500/25'
                        : 'border-cyan-400/45'
                    }`}
                  >
                    {/* Live Swipe Stamps */}
                    {dragX > 32 && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg border-2 border-emerald-400 bg-emerald-600/90 text-white text-xs font-black rotate-6 pointer-events-none">
                        📢 PUBLISH
                      </div>
                    )}
                    {dragX < -32 && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg border-2 border-rose-400 bg-rose-600/90 text-white text-xs font-black -rotate-6 pointer-events-none">
                        🚫 BLOCK
                      </div>
                    )}

                    {/* Post Author Bar */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {currentPost.logoId ? (
                          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
                            <img
                              src={OFFICIAL_WING_LOGOS[currentPost.logoId].src}
                              alt={currentPost.author}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                            {currentPost.avatar}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                            {currentPost.author}
                          </p>
                          <p className="text-[11px] font-bold text-cyan-300/90 truncate">
                            {currentPost.handle}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-amber-200 shrink-0">
                        #{currentPost.tag}
                      </span>
                    </div>

                    {/* Post Body */}
                    <div className="py-3 space-y-1.5">
                      <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                        {currentPost.headline}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {currentPost.body}
                      </p>
                    </div>

                    {/* Swipe Hint Footer */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>⬅️ ഇടത്തോട്ട് വലിച്ചാൽ: ബ്ലോക്ക്</span>
                      <span>വലത്തോട്ട് വലിച്ചാൽ: പബ്ലിഷ് ➡️</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Big Instant Decision Buttons */}
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                <button
                  type="button"
                  onClick={() => handleDecision('block')}
                  className="py-3.5 px-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 border-2 border-rose-300/60 text-white font-black text-xs sm:text-sm shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>⬅️ 🚫 ബ്ലോക്ക് / ഒഴിവാക്കൂ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('publish')}
                  className="py-3.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 border-2 border-emerald-200/70 text-slate-950 font-black text-xs sm:text-sm shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>📢 പബ്ലിഷ് ചെയ്യൂ ➡️</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Feedback Strip */}
          {feedback && (
            <div
              className={`rounded-xl px-3.5 py-2 text-xs font-extrabold border ${
                feedback.tone === 'ok'
                  ? 'bg-emerald-950/75 border-emerald-400/50 text-emerald-200'
                  : feedback.tone === 'err'
                  ? 'bg-rose-950/85 border-rose-400/60 text-rose-200'
                  : 'bg-amber-950/75 border-amber-400/50 text-amber-200'
              }`}
            >
              {feedback.text}
            </div>
          )}
        </div>
      )}

      {/* LOST / DEFEAT ANIMATION PHASE */}
      {phase === 'lost' && (
        <GameDefeatBurstOverlay
          title="സൈബർ കവചം തകർന്നു — ഫീഡ് പരാജയപ്പെട്ടു!"
          reason={
            failReason ||
            '3 തെറ്റുകൾ / സമയം തീരൽ കാരണം സൈകോൺ ലൈവ് ഫീഡ് സുരക്ഷ തകർന്നു!'
          }
          scoreText={`ശരിയാക്കിയ പോസ്റ്റുകൾ: ${clearedCount}/${TARGET_CLEARS} · Reach: ${reachScore.toLocaleString()}`}
          onRetry={startGame}
          overlay={false}
        />
      )}

      {/* VICTORY PHASE */}
      {phase === 'won' && (
        <div className="rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-cyan-950/90 p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="inline-flex items-center gap-1 text-xs font-black text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  CYCON VERIFIED MODERATOR · +35 XP
                </p>
                <h4 className="text-sm sm:text-base font-black text-white">
                  സൈകോൺ ലൈവ് ഫീഡ് 100% സുരക്ഷിതമായി പൂർത്തിയാക്കി!
                </h4>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  തർക്കുൽ മാലായഅ്നി പാലിച്ചും വ്യാജ ലിങ്കുകളും സ്പാം-ബോട്ടുകളും തകർത്തും{' '}
                  {reachScore.toLocaleString()}+ പേരിലേക്ക് നല്ല സന്ദേശങ്ങൾ എത്തിച്ചു!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow-md active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>വീണ്ടും കളിക്കാം</span>
            </button>
          </div>

          <div className="bg-white rounded-xl p-2.5 text-slate-900">
            <InlineOfficialLinksStrip
              links={cyberLinks}
              heading="💻 SKSSF സൈബർ വിംഗ് & സമസ്ത ഔദ്യോഗിക ഡിജിറ്റൽ ലിങ്കുകൾ"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>ഗെയിം പൂർത്തിയായി! ഇനി താഴെയുള്ള പാഠവും ക്വിസും പൂർത്തിയാക്കാം.</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
