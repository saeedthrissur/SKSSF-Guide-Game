import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Gift,
  Lock,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import {
  HERITAGE_ALBUM_CARDS,
  HeritageCardDef,
  PASS_14_TIERS,
  SEASONAL_EVENTS_CATALOG,
  useEcosystem,
} from '../utils/ecosystemStore';
import { sound } from '../utils/sound';
import { DiamondGemSvg, GoldCoinSvg, SilverCoinSvg } from './CurrencyIcons';

// ==================== 12-CARD HERITAGE ALBUM MODAL ====================

export const HeritageAlbumModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { state, markHubVisited } = useEcosystem();
  const [selectedCard, setSelectedCard] = useState<HeritageCardDef | null>(null);
  const [rewardBanner, setRewardBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const visit = markHubVisited('album');
    if (visit.rewardText) setRewardBanner(visit.rewardText);
  }, [isOpen, markHubVisited]);

  if (!isOpen) return null;

  const unlockedSet = new Set(state.progression.collectedHeritageCards);

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="പൈതൃക ആൽബം"
    >
      <div className="max-w-3xl w-full max-h-[88vh] overflow-y-auto overscroll-contain my-auto rounded-3xl border-2 border-amber-300 bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 px-5 py-4 text-white border-b-4 border-amber-400 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div>
            <p className="text-[11px] font-extrabold text-amber-300">
              ശേഖരിച്ചവ: {unlockedSet.size} / {HERITAGE_ALBUM_CARDS.length} · ഒളിഞ്ഞ നിധി നക്ഷത്രങ്ങൾ: {state.progression.foundHiddenStars.length}/3
            </p>
            <h2 className="text-base sm:text-lg font-black">📜 12-കാർഡ് പൈതൃക ആൽബം (Heritage Album)</h2>
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
          {rewardBanner && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-extrabold text-emerald-950">
              🎉 സന്ദർശന സമ്മാനം: {rewardBanner}
            </div>
          )}

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-xs font-bold text-amber-950 flex flex-wrap items-center justify-between gap-2">
            <span>✨ പാഠങ്ങളിലും മാപ്പിലും ഒളിഞ്ഞിരിക്കുന്ന 3 നക്ഷത്രങ്ങൾ (✨ +2) കണ്ടെത്തിയാൽ ഓരോന്നിനും +2 വജ്രങ്ങൾ!</span>
            <span className="font-black">{state.progression.foundHiddenStars.length} / 3 കണ്ടെത്തി</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {HERITAGE_ALBUM_CARDS.map((card) => {
              const unlocked = unlockedSet.has(card.id);
              const rarityStyle =
                card.rarity === 'diamond'
                  ? 'border-sky-300 bg-gradient-to-br from-sky-50 via-white to-emerald-50'
                  : card.rarity === 'gold'
                  ? 'border-amber-300 bg-gradient-to-br from-amber-50 via-white to-orange-50/40'
                  : 'border-slate-300 bg-gradient-to-br from-slate-50 via-white to-slate-100/60';
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedCard(card);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    unlocked ? rarityStyle : 'border-slate-200 bg-slate-100/80 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-900 text-amber-300">
                      #{card.number} · {card.year}
                    </span>
                    {unlocked ? (
                      card.rarity === 'diamond' ? (
                        <DiamondGemSvg className="w-4 h-4" />
                      ) : card.rarity === 'gold' ? (
                        <GoldCoinSvg className="w-4 h-4" />
                      ) : (
                        <SilverCoinSvg className="w-4 h-4" />
                      )
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <p className="text-xs font-black text-slate-900 leading-snug">{card.titleMl}</p>
                  <p className="text-[10px] font-semibold text-slate-600 mt-1 line-clamp-2">
                    {unlocked ? card.quoteMl : `🔒 ${card.unlockRuleMl}`}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedCard && (
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black text-emerald-950">
                  #{selectedCard.number} · {selectedCard.titleMl} ({selectedCard.year})
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="text-xs font-bold text-slate-600 cursor-pointer"
                >
                  അടയ്ക്കുക
                </button>
              </div>
              {unlockedSet.has(selectedCard.id) ? (
                <>
                  <p className="text-xs font-extrabold text-amber-900">“{selectedCard.quoteMl}”</p>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                    {selectedCard.detailMl}
                  </p>
                </>
              ) : (
                <p className="text-xs font-bold text-slate-600">
                  🔒 ഈ പൈതൃക കാർഡ് തുറക്കാൻ: {selectedCard.unlockRuleMl}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== 14-DAY KNOWLEDGE PASS MODAL ====================

export const KnowledgePass14Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  completedLessonsCount: number;
  streakDays: number;
}> = ({ isOpen, onClose, completedLessonsCount, streakDays }) => {
  const { state, markHubVisited, claimPassTier } = useEcosystem();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const visit = markHubVisited('pass14');
    if (visit.rewardText) setNotice(`🎉 സന്ദർശന സമ്മാനം: ${visit.rewardText}`);
  }, [isOpen, markHubVisited]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="14-ദിന വിജ്ഞാന യാത്ര"
    >
      <div className="max-w-2xl w-full max-h-[88vh] overflow-y-auto overscroll-contain my-auto rounded-3xl border-2 border-emerald-300 bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 px-5 py-4 text-white border-b-4 border-amber-400 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div>
            <p className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>10 പ്രോഗ്രസീവ് മൈൽസ്റ്റോൺ ടയറുകൾ · പാഠങ്ങൾ: {completedLessonsCount}/62 · സ്ട്രീക്ക്: {streakDays}</span>
            </p>
            <h2 className="text-base sm:text-lg font-black">🗓️ 14-ദിന വിജ്ഞാന യാത്ര (14-Day Knowledge Pass)</h2>
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

        <div className="p-4 sm:p-5 space-y-3">
          {notice && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-extrabold text-emerald-950">
              {notice}
            </div>
          )}

          <div className="space-y-2">
            {PASS_14_TIERS.map((tier) => {
              const claimed = state.progression.claimedPassTiers.includes(tier.tier);
              const eligible = completedLessonsCount >= tier.requiredLessons;
              return (
                <div
                  key={tier.tier}
                  className={`rounded-2xl border-2 p-3 flex flex-wrap items-center justify-between gap-2.5 ${
                    claimed
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : eligible
                      ? 'border-amber-400 bg-amber-50/70'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs sm:text-sm font-black text-slate-900">
                      ടയർ {tier.tier}: {tier.titleMl}{' '}
                      <span className="text-[11px] font-bold text-slate-500">({tier.requirementMl})</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <SilverCoinSvg className="w-3.5 h-3.5" /> +{tier.rewardSilver}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GoldCoinSvg className="w-3.5 h-3.5" /> +{tier.rewardGold}
                      </span>
                      {tier.rewardDiamond > 0 && (
                        <span className="inline-flex items-center gap-1 text-sky-900">
                          <DiamondGemSvg className="w-3.5 h-3.5" /> +{tier.rewardDiamond}
                        </span>
                      )}
                      {tier.cardId && (
                        <span className="text-emerald-800">📜 +പൈതൃക കാർഡ്</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={claimed || !eligible}
                    onClick={() => {
                      sound.unlockAudio();
                      const res = claimPassTier(tier.tier, completedLessonsCount, streakDays);
                      if (res.ok) sound.playUnlock();
                      else sound.playError();
                      setNotice(res.message);
                    }}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 ${
                      claimed
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : eligible
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {claimed ? '✅ ക്ലെയിം ചെയ്തു' : eligible ? 'സമ്മാനം വാങ്ങാം' : '🔒 ലോക്ക്'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== EVERY-3-LESSONS PES-STYLE PACK / SPIN / SCRATCH MODAL ====================

interface PackOutcome {
  orbTier: 'silver' | 'gold' | 'black_diamond' | 'snake';
  titleMl: string;
  descMl: string;
  deltaSilver: number;
  deltaGold: number;
  deltaDiamond: number;
  grantVipJump?: boolean;
  grantExtraHp?: boolean;
  cardId?: string;
}

const PACK_OUTCOMES_POOL: PackOutcome[] = [
  {
    orbTier: 'black_diamond',
    titleMl: '⚡ ലൈറ്റ്നിംഗ് ബ്ലാക്ക്-ഡയമണ്ട് ഓർബ്! 🚀 VIP ജമ്പ് പാസ് + 2 വജ്രം',
    descMl: 'അപൂർവ്വ കോണി സമ്മാനം! നിങ്ങൾക്ക് 1 VIP ജമ്പ് പാസും +2 വജ്രങ്ങളും ലഭിച്ചു!',
    deltaSilver: 0,
    deltaGold: 0,
    deltaDiamond: 2,
    grantVipJump: true,
    cardId: 'hc_1989_skssf',
  },
  {
    orbTier: 'gold',
    titleMl: '🥇 ഗോൾഡ് ഓർബ്! +30 സ്വർണ്ണ നാണയം & എക്സ്ട്രാ HP',
    descMl: 'മികച്ച പഠന വേഗതയ്ക്കുള്ള സ്വർണ്ണ സമ്മാനം!',
    deltaSilver: 0,
    deltaGold: 30,
    deltaDiamond: 0,
    grantExtraHp: true,
  },
  {
    orbTier: 'silver',
    titleMl: '🪙 സിൽവർ ഓർബ്! +100 വെള്ളി നാണയം',
    descMl: 'വിജ്ഞാന മാർക്കറ്റിൽ ഹിന്റുകളും സ്വർണ്ണവും വാങ്ങാൻ +100 വെള്ളി!',
    deltaSilver: 100,
    deltaGold: 0,
    deltaDiamond: 0,
  },
  {
    orbTier: 'snake',
    titleMl: '🐍 റിവിഷൻ പാമ്പ് / 😅 അടുത്ത തവണ ഭാഗ്യം!',
    descMl: 'പാമ്പും കോണിയും കളിയിലെ ചെറിയ പരീക്ഷണം! എങ്കിലും ശ്രമത്തിന് +15 വെള്ളി ആശ്വാസ സമ്മാനം.',
    deltaSilver: 15,
    deltaGold: 0,
    deltaDiamond: 0,
  },
];

export const EveryThreeLessonsPackModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onGrantExtraHp: () => void;
}> = ({ isOpen, onClose, onGrantExtraHp }) => {
  const { transactCurrency, grantVipJumpPass, unlockHeritageCard, consumePendingPackReward } =
    useEcosystem();
  const [mode, setMode] = useState<'pack' | 'spin' | 'scratch'>('pack');
  const [phase, setPhase] = useState<'ready' | 'opening' | 'revealed'>('ready');
  const [outcome, setOutcome] = useState<PackOutcome | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhase('ready');
      setOutcome(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerReveal = () => {
    if (phase !== 'ready') return;
    sound.unlockAudio();
    sound.playPop();
    setPhase('opening');
    window.setTimeout(() => {
      // Weighted fair roll: ~22% Black-Diamond, 30% Gold, 30% Silver, 18% Snake/Try again
      const r = Math.random();
      const picked =
        r < 0.22
          ? PACK_OUTCOMES_POOL[0]
          : r < 0.52
          ? PACK_OUTCOMES_POOL[1]
          : r < 0.82
          ? PACK_OUTCOMES_POOL[2]
          : PACK_OUTCOMES_POOL[3];
      setOutcome(picked);
      setPhase('revealed');
      if (picked.orbTier === 'snake') sound.playError();
      else sound.playUnlock();

      transactCurrency({
        action: `pack_reward_${mode}_${picked.orbTier}`,
        deltaSilver: picked.deltaSilver,
        deltaGold: picked.deltaGold,
        deltaDiamond: picked.deltaDiamond,
      });
      if (picked.grantVipJump) grantVipJumpPass();
      if (picked.grantExtraHp) onGrantExtraHp();
      if (picked.cardId) unlockHeritageCard(picked.cardId);
      consumePendingPackReward();
    }, 950);
  };

  return (
    <div
      className="fixed inset-0 z-[115] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="3 പാഠം സമ്മാന പാക്കറ്റ്"
    >
      <div className="max-w-md w-full my-auto rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-white p-5 space-y-4 shadow-2xl text-center">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-amber-300 flex items-center gap-1">
            <Gift className="w-3.5 h-3.5" /> ഓരോ 3 പാഠങ്ങൾക്കുമുള്ള ബോണസ്
          </span>
          <button
            type="button"
            onClick={() => {
              consumePendingPackReward();
              onClose();
            }}
            aria-label="അടയ്ക്കുക"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-black text-white">
          🎁 പാക്കറ്റ് പൊട്ടിക്കാം · പാമ്പും കോണിയും ബോണസ്!
        </h3>

        {phase === 'ready' && (
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'pack', label: '⚡ കാർഡ് പായ്ക്ക്' },
                { id: 'spin', label: '🎡 സ്പിൻ വീൽ' },
                { id: 'scratch', label: '🪙 സ്ക്രാച്ച് കാർഡ്' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`py-2 px-2 rounded-xl text-[11px] font-black border cursor-pointer ${
                  mode === m.id
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-white/10 text-emerald-100 border-white/15'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Animated PES-Style Orb / Pack Stage */}
        <div className="py-4 flex flex-col items-center justify-center">
          <motion.button
            type="button"
            disabled={phase !== 'ready'}
            onClick={triggerReveal}
            animate={
              phase === 'opening'
                ? { scale: [1, 1.18, 0.92, 1.25], rotate: [0, -10, 10, 360] }
                : phase === 'revealed'
                ? { scale: [0.85, 1.06, 1] }
                : { scale: [1, 1.04, 1] }
            }
            transition={{ duration: phase === 'opening' ? 0.9 : 1.6, repeat: phase === 'ready' ? Infinity : 0 }}
            className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl cursor-pointer ${
              outcome?.orbTier === 'black_diamond'
                ? 'bg-gradient-to-br from-slate-950 via-sky-700 to-slate-900 border-sky-300'
                : outcome?.orbTier === 'gold'
                ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-800 border-amber-200'
                : outcome?.orbTier === 'snake'
                ? 'bg-gradient-to-br from-rose-700 via-rose-900 to-slate-900 border-rose-300'
                : 'bg-gradient-to-br from-emerald-500 via-emerald-700 to-slate-900 border-amber-300'
            }`}
          >
            {phase === 'opening' ? (
              <Zap className="w-12 h-12 text-amber-300" />
            ) : phase === 'revealed' && outcome ? (
              outcome.orbTier === 'black_diamond' ? (
                <DiamondGemSvg className="w-14 h-14" />
              ) : outcome.orbTier === 'gold' ? (
                <GoldCoinSvg className="w-14 h-14" />
              ) : outcome.orbTier === 'silver' ? (
                <SilverCoinSvg className="w-14 h-14" />
              ) : (
                <span className="text-4xl">🐍</span>
              )
            ) : (
              <>
                <Sparkles className="w-10 h-10 text-amber-300" />
                <span className="text-[11px] font-black mt-1 text-white">തൊട്ട് തുറക്കാം!</span>
              </>
            )}
          </motion.button>
        </div>

        {phase === 'revealed' && outcome ? (
          <div className="space-y-3">
            <div className="rounded-2xl bg-white/10 border border-white/20 p-3.5 space-y-1">
              <p className="text-sm font-black text-amber-300">{outcome.titleMl}</p>
              <p className="text-xs text-emerald-100 leading-relaxed">{outcome.descMl}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[44px] py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm cursor-pointer"
            >
              സമ്മാനം സ്വീകരിച്ച് തുടരാം →
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={triggerReveal}
            className="w-full min-h-[44px] py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm cursor-pointer"
          >
            {mode === 'pack'
              ? '⚡ പാക്കറ്റ് പൊട്ടിക്കാം!'
              : mode === 'spin'
              ? '🎡 വീൽ കറക്കാം!'
              : '🪙 കാർഡ് ഉരച്ചു നോക്കാം!'}
          </button>
        )}
      </div>
    </div>
  );
};

// ==================== ANNUAL SEASONAL & SPECIAL DAY EVENT MODAL ====================

export const AnnualSeasonalEventModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { state, activeSeasonal, recordSeasonalResult } = useEcosystem();
  const [selectedEventId, setSelectedEventId] = useState(activeSeasonal.event.id);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedEventId(activeSeasonal.event.id);
      setQIdx(0);
      setScore(0);
      setFinished(false);
      setLastFeedback(null);
    }
  }, [isOpen, activeSeasonal.event.id]);

  if (!isOpen) return null;

  const event =
    SEASONAL_EVENTS_CATALOG.find((e) => e.id === selectedEventId) ?? activeSeasonal.event;
  const activeQ = event.questions[qIdx];
  const myRecords = state.progression.seasonalRecords.filter((r) => r.eventId === event.id);

  const handleAnswer = (optIdx: number) => {
    if (finished || !activeQ) return;
    sound.unlockAudio();
    const ok = optIdx === activeQ.correctIdx;
    const nextScore = ok ? score + 1 : score;
    if (ok) {
      sound.playSuccess(2);
      setScore(nextScore);
      setLastFeedback(`✅ ശരിയാണ്! ${activeQ.fact}`);
    } else {
      sound.playError();
      setLastFeedback(`💡 ശരിയായ ഉത്തരം: ${activeQ.options[activeQ.correctIdx]}. ${activeQ.fact}`);
    }

    if (qIdx + 1 >= event.questions.length) {
      setFinished(true);
      recordSeasonalResult(event.id, nextScore, event.questions.length);
    } else {
      window.setTimeout(() => {
        setQIdx((i) => i + 1);
        setLastFeedback(null);
      }, 1000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="വാർഷിക സീസണൽ ചാലഞ്ച്"
    >
      <div className="max-w-2xl w-full max-h-[88vh] overflow-y-auto overscroll-contain my-auto rounded-3xl border-2 border-amber-300 bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 px-5 py-4 text-white border-b-4 border-amber-400 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div>
            <p className="text-[11px] font-extrabold text-amber-300">
              {activeSeasonal.isLiveWindow ? '🔴 ലൈവ് 3-ദിന മിനി ടൂർണമെന്റ്!' : '📅 വാർഷിക സീസണൽ കലണ്ടർ'} · {event.multiplierLabel}
            </p>
            <h2 className="text-base sm:text-lg font-black">{event.nameMl}</h2>
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
          {/* Switch between all 6 annual self-repeating events */}
          <div className="flex flex-wrap gap-1.5">
            {SEASONAL_EVENTS_CATALOG.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedEventId(ev.id);
                  setQIdx(0);
                  setScore(0);
                  setFinished(false);
                  setLastFeedback(null);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black border cursor-pointer ${
                  ev.id === event.id
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                {ev.windowLabel}
              </button>
            ))}
          </div>

          <p className="text-xs font-bold text-slate-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            {event.descriptionMl}
          </p>

          {/* Quiz Arena */}
          {!finished && activeQ ? (
            <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold text-emerald-800">
                <span>ചോദ്യം {qIdx + 1} / {event.questions.length}</span>
                <span>സ്കോർ: {score}</span>
              </div>
              <p className="text-sm font-black text-slate-900 leading-snug">{activeQ.q}</p>
              <div className="grid grid-cols-1 gap-2">
                {activeQ.options.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(idx)}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-left text-xs font-extrabold text-slate-800 cursor-pointer"
                  >
                    {['A', 'B', 'C', 'D'][idx]}. {opt}
                  </button>
                ))}
              </div>
              {lastFeedback && (
                <p className="text-xs font-bold text-emerald-950 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  {lastFeedback}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-center space-y-2">
              <Trophy className="w-8 h-8 text-amber-600 mx-auto" />
              <p className="text-base font-black text-emerald-950">
                സീസണൽ ചാലഞ്ച് പൂർത്തിയായി! സ്കോർ: {score} / {event.questions.length}
              </p>
              <p className="text-xs font-bold text-slate-700">
                നിങ്ങളുടെ {activeSeasonal.year} വർഷത്തെ റെക്കോർഡ് സുരക്ഷിതമായി സേവ് ചെയ്തു!
              </p>
              <button
                type="button"
                onClick={() => {
                  setQIdx(0);
                  setScore(0);
                  setFinished(false);
                  setLastFeedback(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-black cursor-pointer"
              >
                വീണ്ടും കളിക്കാം
              </button>
            </div>
          )}

          {/* Year-over-Year & Friends Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-1.5">
              <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>വർഷാവർഷ റെക്കോർഡ് (Year-over-Year)</span>
              </p>
              {myRecords.length === 0 ? (
                <p className="text-[11px] font-semibold text-slate-500">
                  ഈ സീസണിൽ ഇതുവരെ റെക്കോർഡ് ഇല്ല — മുകളിലെ ക്വിസ് കളിച്ചു തുടങ്ങൂ!
                </p>
              ) : (
                myRecords.map((r) => (
                  <div
                    key={`${r.eventId}_${r.year}`}
                    className="flex items-center justify-between text-xs font-bold bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                  >
                    <span>{r.year}</span>
                    <span className="text-emerald-800 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {r.bestScore}/{r.totalQuestions}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-1.5">
              <p className="text-xs font-black text-slate-900">🏆 സുഹൃത്തുക്കളുടെ സീസണൽ സ്കോർ</p>
              {state.social.friends.length === 0 ? (
                <p className="text-[11px] font-semibold text-slate-500">
                  വെരിഫൈഡ് സുഹൃത്തുക്കളെ ചേർത്താൽ അവരുടെ സീസണൽ സ്കോറുകളുമായി താരതമ്യം ചെയ്യാം.
                </p>
              ) : (
                state.social.friends.slice(0, 4).map((f) => (
                  <div
                    key={f.userId}
                    className="flex items-center justify-between text-xs font-bold bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                  >
                    <span className="truncate">{f.displayName}</span>
                    <span className="text-amber-800">{f.seasonalScore ?? 0}/3</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
