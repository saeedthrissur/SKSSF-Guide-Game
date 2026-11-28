import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Share2, Swords, Trophy, Users, X } from 'lucide-react';
import { LESSON_QUIZZES } from '../data/lessonQuizzes';
import {
  createSignedDuelLink,
  SignedDuelChallenge,
  verifySignedDuelPayload,
} from '../utils/ecosystemCrypto';
import { useEcosystem } from '../utils/ecosystemStore';
import { copyTextToClipboard, getWhatsAppShareHref } from '../utils/shareLink';
import { sound } from '../utils/sound';

interface MultiplayerDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomingDuelCode?: string | null;
  onClearIncomingDuel?: () => void;
}

const ALL_QUIZ_KEYS = Object.keys(LESSON_QUIZZES);

function pickFiveQuestionIds(seed?: string[]): string[] {
  if (seed && seed.length === 5 && seed.every((k) => Boolean(LESSON_QUIZZES[k]))) {
    return seed;
  }
  const pool = [...ALL_QUIZ_KEYS];
  const chosen: string[] = [];
  for (let i = 0; i < 5 && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    chosen.push(pool.splice(idx, 1)[0]);
  }
  return chosen;
}

export const MultiplayerDuelModal: React.FC<MultiplayerDuelModalProps> = ({
  isOpen,
  onClose,
  incomingDuelCode,
  onClearIncomingDuel,
}) => {
  const { state, markHubVisited, transactCurrency } = useEcosystem();
  const [mode, setMode] = useState<'pass_play' | 'whatsapp_duel'>('pass_play');
  const [notice, setNotice] = useState<string | null>(null);

  // Pass & Play state
  const [p1Name, setP1Name] = useState(state.identity.displayName || 'കളിക്കാരൻ 1');
  const [p2Name, setP2Name] = useState('കളിക്കാരൻ 2');
  const [ppPhase, setPpPhase] = useState<'setup' | 'p1' | 'handoff' | 'p2' | 'result'>('setup');
  const [ppQuestions, setPpQuestions] = useState<string[]>(() => pickFiveQuestionIds());
  const [ppIdx, setPpIdx] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  // WhatsApp Challenge Duel state
  const [duelPhase, setDuelPhase] = useState<'menu' | 'playing' | 'done'>('menu');
  const [duelQuestions, setDuelQuestions] = useState<string[]>(() => pickFiveQuestionIds());
  const [duelIdx, setDuelIdx] = useState(0);
  const [duelScore, setDuelScore] = useState(0);
  const [duelStartTs, setDuelStartTs] = useState<number>(Date.now());
  const [duelElapsedSec, setDuelElapsedSec] = useState<number>(0);
  const [incomingDuel, setIncomingDuel] = useState<SignedDuelChallenge | null>(null);
  const [pasteDuelInput, setPasteDuelInput] = useState('');
  const [generatedDuel, setGeneratedDuel] = useState<{ code: string; url: string; qr?: string } | null>(
    null
  );
  const [copiedDuel, setCopiedDuel] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const visit = markHubVisited('multiplayer');
    if (visit.rewardText) setNotice(`🎉 സന്ദർശന സമ്മാനം: ${visit.rewardText}`);
  }, [isOpen, markHubVisited]);

  useEffect(() => {
    if (isOpen && incomingDuelCode) {
      const check = verifySignedDuelPayload(incomingDuelCode);
      if (check.valid && check.duel) {
        setMode('whatsapp_duel');
        setIncomingDuel(check.duel);
        setDuelQuestions(pickFiveQuestionIds(check.duel.questionIds));
        setDuelIdx(0);
        setDuelScore(0);
        setDuelStartTs(Date.now());
        setDuelPhase('playing');
        onClearIncomingDuel?.();
      }
    }
  }, [isOpen, incomingDuelCode, onClearIncomingDuel]);

  const activePpQuiz = useMemo(() => LESSON_QUIZZES[ppQuestions[ppIdx]], [ppQuestions, ppIdx]);
  const activeDuelQuiz = useMemo(
    () => LESSON_QUIZZES[duelQuestions[duelIdx]],
    [duelQuestions, duelIdx]
  );

  if (!isOpen) return null;

  const startPassAndPlay = () => {
    sound.unlockAudio();
    sound.playPop();
    setPpQuestions(pickFiveQuestionIds());
    setPpIdx(0);
    setP1Score(0);
    setP2Score(0);
    setPpPhase('p1');
  };

  const handlePpAnswer = (optIdx: number) => {
    if (!activePpQuiz) return;
    const ok = optIdx === activePpQuiz.correctIdx;
    if (ok) sound.playSuccess(2);
    else sound.playError();

    if (ppPhase === 'p1') {
      if (ok) setP1Score((s) => s + 1);
      if (ppIdx + 1 >= ppQuestions.length) {
        setPpPhase('handoff');
      } else {
        setPpIdx((i) => i + 1);
      }
    } else if (ppPhase === 'p2') {
      const nextP2 = ok ? p2Score + 1 : p2Score;
      if (ok) setP2Score(nextP2);
      if (ppIdx + 1 >= ppQuestions.length) {
        setPpPhase('result');
        transactCurrency({
          action: 'multiplayer_pass_play_finish',
          deltaSilver: 15,
          meta: `${p1Score}v${nextP2}`,
        });
      } else {
        setPpIdx((i) => i + 1);
      }
    }
  };

  const startNewWhatsAppDuel = (opponent?: SignedDuelChallenge) => {
    sound.unlockAudio();
    sound.playPop();
    setIncomingDuel(opponent ?? null);
    setDuelQuestions(pickFiveQuestionIds(opponent?.questionIds));
    setDuelIdx(0);
    setDuelScore(0);
    setDuelStartTs(Date.now());
    setGeneratedDuel(null);
    setDuelPhase('playing');
  };

  const handleDuelAnswer = async (optIdx: number) => {
    if (!activeDuelQuiz) return;
    const ok = optIdx === activeDuelQuiz.correctIdx;
    const nextScore = ok ? duelScore + 1 : duelScore;
    if (ok) {
      sound.playSuccess(2);
      setDuelScore(nextScore);
    } else {
      sound.playError();
    }

    if (duelIdx + 1 >= duelQuestions.length) {
      const elapsed = Math.max(1, Math.round((Date.now() - duelStartTs) / 1000));
      setDuelElapsedSec(elapsed);
      setDuelPhase('done');
      transactCurrency({
        action: 'multiplayer_duel_complete',
        deltaSilver: nextScore * 5,
        deltaGold: nextScore >= 4 ? 5 : 0,
        meta: `score:${nextScore}/5`,
      });
      if (!incomingDuel) {
        const created = createSignedDuelLink({
          challengerId: state.identity.userId,
          challengerName: state.identity.displayName || state.identity.handle,
          challengerScore: nextScore,
          challengerTimeSec: elapsed,
          questionIds: duelQuestions,
        });
        let qr: string | undefined;
        try {
          qr = await QRCode.toDataURL(created.url, { width: 200, margin: 1 });
        } catch {
          qr = undefined;
        }
        setGeneratedDuel({ code: created.code, url: created.url, qr });
      }
    } else {
      setDuelIdx((i) => i + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="സുഹൃത്തുമായി മത്സരിക്കാം"
    >
      <div className="max-w-xl w-full max-h-[88vh] overflow-y-auto overscroll-contain my-auto rounded-3xl border-2 border-emerald-300 bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 px-5 py-4 text-white border-b-4 border-amber-400 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div>
            <p className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5" />
              <span>സെർവർരഹിത 2-പ്ലെയർ വിജ്ഞാന മത്സരം</span>
            </p>
            <h2 className="text-base sm:text-lg font-black">⚔️ സുഹൃത്തുമായി മത്സരിക്കാം (2-Player Duel)</h2>
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
          {notice && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-950">
              {notice}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setMode('pass_play')}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'pass_play' ? 'bg-emerald-700 text-white' : 'text-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>ഒരേ ഫോണിൽ 2 പേർ</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('whatsapp_duel')}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'whatsapp_duel' ? 'bg-emerald-700 text-white' : 'text-slate-700'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp ചലഞ്ച് ഡ്യുവൽ</span>
            </button>
          </div>

          {/* MODE 1: PASS & PLAY */}
          {mode === 'pass_play' && (
            <div className="space-y-3">
              {ppPhase === 'setup' && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                  <p className="text-xs font-bold text-slate-700">
                    ഒരേ ഫോണിൽ രണ്ട് കൂട്ടുകാർ മാറിമാറി 5 ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകാം!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={p1Name}
                      onChange={(e) => setP1Name(e.target.value)}
                      placeholder="കളിക്കാരൻ 1 പേര്"
                      className="min-h-[40px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={p2Name}
                      onChange={(e) => setP2Name(e.target.value)}
                      placeholder="കളിക്കാരൻ 2 പേര്"
                      className="min-h-[40px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={startPassAndPlay}
                    className="w-full min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black cursor-pointer"
                  >
                    ⚔️ മത്സരം തുടങ്ങാം!
                  </button>
                </div>
              )}

              {(ppPhase === 'p1' || ppPhase === 'p2') && activePpQuiz && (
                <div className="rounded-2xl border-2 border-emerald-300 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-800">
                    <span>ഊഴം: {ppPhase === 'p1' ? p1Name : p2Name}</span>
                    <span>ചോദ്യം {ppIdx + 1} / 5</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 leading-snug">
                    {activePpQuiz.question}
                  </p>
                  <div className="space-y-2">
                    {activePpQuiz.options.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handlePpAnswer(idx)}
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-left text-xs font-extrabold text-slate-800 cursor-pointer"
                      >
                        {['A', 'B', 'C', 'D'][idx]}. {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {ppPhase === 'handoff' && (
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-center space-y-3">
                  <p className="text-base font-black text-emerald-950">
                    {p1Name} പൂർത്തിയാക്കി! ഇനി ഫോൺ {p2Name}-ന് നൽകുക.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPpQuestions(pickFiveQuestionIds());
                      setPpIdx(0);
                      setPpPhase('p2');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-black cursor-pointer"
                  >
                    {p2Name} തുടങ്ങാം →
                  </button>
                </div>
              )}

              {ppPhase === 'result' && (
                <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-white p-5 text-center space-y-3">
                  <Trophy className="w-9 h-9 text-amber-500 mx-auto" />
                  <h3 className="text-lg font-black text-emerald-950">
                    {p1Score > p2Score
                      ? `🏆 ${p1Name} വിജയിച്ചു!`
                      : p2Score > p1Score
                      ? `🏆 ${p2Name} വിജയിച്ചു!`
                      : '🤝 സമനില! ഇരുവരും മികച്ച പ്രകടനം!'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                      <p className="text-xs font-bold text-slate-600">{p1Name}</p>
                      <p className="text-2xl font-black text-emerald-900">{p1Score}/5</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-bold text-slate-600">{p2Name}</p>
                      <p className="text-2xl font-black text-amber-900">{p2Score}/5</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-emerald-800">+15 വെള്ളി നാണയം ബോണസ് ലഭിച്ചു!</p>
                  <button
                    type="button"
                    onClick={() => setPpPhase('setup')}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-black cursor-pointer"
                  >
                    വീണ്ടും മത്സരിക്കാം
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: WHATSAPP CHALLENGE DUEL */}
          {mode === 'whatsapp_duel' && (
            <div className="space-y-3">
              {duelPhase === 'menu' && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2.5">
                    <p className="text-xs font-black text-emerald-950">
                      ⚡ പുതിയ 5-ചോദ്യ WhatsApp ചലഞ്ച് തുടങ്ങാം
                    </p>
                    <p className="text-[11px] font-semibold text-slate-700">
                      ആദ്യം നിങ്ങൾ 5 ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക — തുടർന്ന് നിങ്ങളുടെ സ്കോറും ഇതേ 5 ചോദ്യങ്ങളും അടങ്ങിയ സൈൻ ചെയ്ത ലിങ്കും QR-ഉം സുഹൃത്തിന് WhatsApp-ൽ അയക്കാം!
                    </p>
                    <button
                      type="button"
                      onClick={() => startNewWhatsAppDuel()}
                      className="w-full min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black cursor-pointer"
                    >
                      ⚔️ 5 ചോദ്യം കളിച്ച് ചലഞ്ച് ലിങ്ക് ഉണ്ടാക്കാം
                    </button>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                    <p className="text-xs font-black text-amber-950">
                      📥 സുഹൃത്ത് അയച്ച ഡ്യുവൽ കോഡ് (SKDUEL1:) സ്വീകരിക്കാം
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={pasteDuelInput}
                        onChange={(e) => setPasteDuelInput(e.target.value)}
                        placeholder="SKDUEL1:... കോഡ് ഇവിടെ ഒട്ടിക്കുക"
                        className="flex-1 min-h-[40px] px-3 rounded-xl border border-amber-300 bg-white text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const check = verifySignedDuelPayload(pasteDuelInput);
                          if (!check.valid || !check.duel) {
                            sound.playError();
                            setNotice(check.error || 'തെറ്റായ ഡ്യുവൽ കോഡ്.');
                            return;
                          }
                          setPasteDuelInput('');
                          startNewWhatsAppDuel(check.duel);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shrink-0"
                      >
                        മത്സരം സ്വീകരിക്കാം
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {duelPhase === 'playing' && activeDuelQuiz && (
                <div className="rounded-2xl border-2 border-emerald-300 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-800">
                    <span>
                      {incomingDuel ? `⚔️ എതിരാളി: ${incomingDuel.challengerName}` : '⚔️ നിങ്ങളുടെ ഡ്യുവൽ റൗണ്ട്'}
                    </span>
                    <span>ചോദ്യം {duelIdx + 1} / 5 · സ്കോർ: {duelScore}</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 leading-snug">
                    {activeDuelQuiz.question}
                  </p>
                  <div className="space-y-2">
                    {activeDuelQuiz.options.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleDuelAnswer(idx)}
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-left text-xs font-extrabold text-slate-800 cursor-pointer"
                      >
                        {['A', 'B', 'C', 'D'][idx]}. {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {duelPhase === 'done' && (
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-4 space-y-3 text-center">
                  <Trophy className="w-8 h-8 text-amber-600 mx-auto" />
                  {incomingDuel ? (
                    <>
                      <p className="text-base font-black text-emerald-950">
                        {duelScore > incomingDuel.challengerScore ||
                        (duelScore === incomingDuel.challengerScore &&
                          duelElapsedSec < incomingDuel.challengerTimeSec)
                          ? `🏆 നിങ്ങൾ ${incomingDuel.challengerName}-നെ തോൽപ്പിച്ചു!`
                          : duelScore === incomingDuel.challengerScore
                          ? '🤝 ഒപ്പത്തിനൊപ്പം സമനില!'
                          : `💪 ${incomingDuel.challengerName} മുന്നിലെത്തി — വീണ്ടും ശ്രമിക്കാം!`}
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="rounded-xl bg-white border border-emerald-200 p-2.5">
                          <p className="text-[11px] font-bold text-slate-500">നിങ്ങൾ</p>
                          <p className="text-xl font-black text-emerald-900">
                            {duelScore}/5 ({duelElapsedSec}s)
                          </p>
                        </div>
                        <div className="rounded-xl bg-white border border-amber-200 p-2.5">
                          <p className="text-[11px] font-bold text-slate-500">
                            {incomingDuel.challengerName}
                          </p>
                          <p className="text-xl font-black text-amber-900">
                            {incomingDuel.challengerScore}/5 ({incomingDuel.challengerTimeSec}s)
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-black text-emerald-950">
                        നിങ്ങളുടെ സ്കോർ: {duelScore}/5 ({duelElapsedSec} സെക്കൻഡ്)!
                      </p>
                      {generatedDuel && (
                        <div className="rounded-2xl bg-white border border-emerald-200 p-3 flex flex-col sm:flex-row items-center gap-3 text-left">
                          {generatedDuel.qr && (
                            <img
                              src={generatedDuel.qr}
                              alt="ഡ്യുവൽ QR"
                              className="w-24 h-24 rounded-xl border border-emerald-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1 space-y-2">
                            <p className="text-xs font-bold text-slate-700">
                              ഈ സൈൻ ചെയ്ത ചലഞ്ച് ലിങ്ക് സുഹൃത്തിന് അയച്ച് സ്കോർ മറികടക്കാൻ വെല്ലുവിളിക്കൂ!
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={getWhatsAppShareHref(
                                  `⚔️ SKSSF ഗൈഡ് ഗെയിം 5-ചോദ്യ ഡ്യുവൽ! ഞാൻ ${duelScore}/5 (${duelElapsedSec}s) നേടി — നിങ്ങൾക്ക് എന്നെ തോൽപ്പിക്കാനാകുമോ?`,
                                  generatedDuel.url
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-black"
                              >
                                WhatsApp-ൽ വെല്ലുവിളിക്കാം
                              </a>
                              <button
                                type="button"
                                onClick={async () => {
                                  const ok = await copyTextToClipboard(generatedDuel.code);
                                  if (ok) {
                                    setCopiedDuel(true);
                                    window.setTimeout(() => setCopiedDuel(false), 2000);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                              >
                                {copiedDuel ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedDuel ? 'കോപ്പി ചെയ്തു' : 'കോഡ് കോപ്പി'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setDuelPhase('menu')}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-black cursor-pointer"
                  >
                    മറ്റൊരു ഡ്യുവൽ തുടങ്ങാം
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
