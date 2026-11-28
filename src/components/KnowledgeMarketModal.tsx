import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeftRight,
  Check,
  Copy,
  Gift,
  Heart,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import {
  ANTI_INFLATION_CAPS,
  useEcosystem,
} from '../utils/ecosystemStore';
import { ALL_LESSONS } from '../utils/lessonTracker';
import { copyTextToClipboard, getWhatsAppShareHref } from '../utils/shareLink';
import { sound } from '../utils/sound';
import { DiamondGemSvg, GoldCoinSvg, SilverCoinSvg } from './CurrencyIcons';

interface KnowledgeMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  onGrantExtraHp: () => void;
  onUpdatePlayerNameExternal?: (newName: string) => void;
}

export const KnowledgeMarketModal: React.FC<KnowledgeMarketModalProps> = ({
  isOpen,
  onClose,
  xp,
  onGrantExtraHp,
  onUpdatePlayerNameExternal,
}) => {
  const {
    state,
    boostInfo,
    markHubVisited,
    exchangeCurrency,
    purchaseStoreItem,
    claimXpDiamondMilestone,
    getClaimableXpMilestones,
    createRecipientLockedGift,
    redeemRecipientLockedGift,
    updateDisplayNameWithRules,
  } = useEcosystem();

  const [tab, setTab] = useState<'exchange' | 'store' | 'gift'>('exchange');
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // Rename pass state
  const [renameInput, setRenameInput] = useState('');
  const [showRenameBox, setShowRenameBox] = useState(false);

  // Gift creation state
  const [giftToId, setGiftToId] = useState('');
  const [giftKind, setGiftKind] = useState<'silver' | 'gold' | 'diamond' | 'lesson_unlock'>('silver');
  const [giftAmount, setGiftAmount] = useState<number>(25);
  const [giftLessonId, setGiftLessonId] = useState<string>(ALL_LESSONS[6]?.id ?? ALL_LESSONS[0].id);
  const [giftNote, setGiftNote] = useState('');
  const [generatedGift, setGeneratedGift] = useState<{ code: string; url: string; qr?: string } | null>(
    null
  );
  const [copiedGift, setCopiedGift] = useState(false);

  // Gift redemption state
  const [redeemInput, setRedeemInput] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const visit = markHubVisited('market');
    if (visit.rewardText) {
      setNotice({ ok: true, text: `🎉 പുതിയ വിഭാഗം സന്ദർശന സമ്മാനം: ${visit.rewardText}` });
    }
  }, [isOpen, markHubVisited]);

  if (!isOpen) return null;

  const claimableXp = getClaimableXpMilestones(xp);
  const customCurrencies = Object.entries(state.wallet.customCurrencies);

  const handleExchange = (
    dir: 'silver_to_gold' | 'gold_to_diamond' | 'diamond_to_gold' | 'diamond_to_silver'
  ) => {
    sound.unlockAudio();
    const res = exchangeCurrency(dir);
    if (res.ok) sound.playSuccess(2);
    else sound.playError();
    setNotice({ ok: res.ok, text: res.message });
  };

  const handleBuy = (
    item:
      | 'hint_5050'
      | 'hint_time'
      | 'cooldown_skip_gold'
      | 'cooldown_skip_diamond'
      | 'extra_hp'
      | 'free_roam'
      | 'streak_freeze'
      | 'frame_royal_emerald'
      | 'frame_malabar_gold'
      | 'sound_malabar_oud'
      | 'sound_haram_chimes'
  ) => {
    sound.unlockAudio();
    const res = purchaseStoreItem(item);
    if (res.ok) {
      sound.playUnlock();
      if (item === 'extra_hp') onGrantExtraHp();
    } else {
      sound.playError();
    }
    setNotice({ ok: res.ok, text: res.message });
  };

  const handleUseRenamePass = () => {
    sound.unlockAudio();
    const res = updateDisplayNameWithRules(renameInput, true);
    if (res.ok) {
      sound.playUnlock();
      onUpdatePlayerNameExternal?.(renameInput.trim());
      setShowRenameBox(false);
      setRenameInput('');
    } else {
      sound.playError();
    }
    setNotice({ ok: res.ok, text: res.message });
  };

  const handleCreateGift = async () => {
    sound.unlockAudio();
    const lessonObj = ALL_LESSONS.find((l) => l.id === giftLessonId);
    const res = createRecipientLockedGift({
      toUserId: giftToId,
      kind: giftKind,
      amount: giftKind === 'lesson_unlock' ? 1 : giftAmount,
      lessonId: giftKind === 'lesson_unlock' ? giftLessonId : undefined,
      lessonTitle: giftKind === 'lesson_unlock' ? lessonObj?.title : undefined,
      note: giftNote,
    });
    if (!res.ok || !res.code || !res.url) {
      sound.playError();
      setNotice({ ok: false, text: res.message });
      return;
    }
    sound.playSuccess(3);
    let qr: string | undefined;
    try {
      qr = await QRCode.toDataURL(res.url, { width: 220, margin: 1 });
    } catch {
      qr = undefined;
    }
    setGeneratedGift({ code: res.code, url: res.url, qr });
    setNotice({ ok: true, text: res.message });
  };

  const handleRedeemGift = () => {
    sound.unlockAudio();
    const res = redeemRecipientLockedGift(redeemInput);
    if (res.ok) {
      sound.playUnlock();
      setRedeemInput('');
    } else {
      sound.playError();
    }
    setNotice({ ok: res.ok, text: res.message });
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="വിജ്ഞാന മാർക്കറ്റ്"
    >
      <div className="max-w-2xl w-full max-h-[88vh] overflow-y-auto overscroll-contain my-auto rounded-3xl border-2 border-emerald-300 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 px-5 py-4 text-white border-b-4 border-amber-400 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>100% പരസ്യരഹിതം · പണമില്ലാത്ത വിജ്ഞാന സമ്പദ്‌വ്യവസ്ഥ</span>
            </p>
            <h2 className="text-base sm:text-lg font-black leading-snug">
              🏪 വിജ്ഞാന മാർക്കറ്റ് (Knowledge Exchange Market)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="അടയ്ക്കുക"
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Wallet Summary Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 flex items-center gap-2">
              <SilverCoinSvg className="w-7 h-7 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500">വെള്ളി</p>
                <p className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
                  {state.wallet.silver}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-2.5 flex items-center gap-2">
              <GoldCoinSvg className="w-7 h-7 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-amber-800">സ്വർണ്ണം</p>
                <p className="text-sm sm:text-base font-black text-amber-950 tabular-nums">
                  {state.wallet.gold}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-2.5 flex items-center gap-2">
              <DiamondGemSvg className="w-7 h-7 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-sky-800">വജ്രം</p>
                <p className="text-sm sm:text-base font-black text-sky-950 tabular-nums">
                  {state.wallet.diamond}
                </p>
              </div>
            </div>
          </div>

          {boostInfo.is2xActive && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>⚡ ഇപ്പോൾ 2x കോയിൻ ബൂസ്റ്റ് സജീവം: {boostInfo.reasonsMl.join(' · ')}</span>
            </div>
          )}

          {/* 500 XP Milestone Bonus Banner */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-sky-950">
              <p className="font-black">⚡ ഓരോ 500 XP-ക്കും +1 വജ്രം ബോണസ് (XP കുറയില്ല!)</p>
              <p className="text-[11px] text-sky-800">
                നിലവിലെ XP: {xp} · ക്ലെയിം ചെയ്ത മൈൽസ്റ്റോണുകൾ: {state.wallet.claimedXpMilestones.length}
              </p>
            </div>
            <button
              type="button"
              disabled={claimableXp.length === 0}
              onClick={() => {
                sound.unlockAudio();
                const res = claimXpDiamondMilestone(xp);
                if (res.ok) sound.playUnlock();
                setNotice({ ok: res.ok, text: res.message });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                claimableXp.length > 0
                  ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {claimableXp.length > 0 ? `${claimableXp[0]} XP ക്ലെയിം (+1 💎)` : 'അടുത്തത് 500 XP-ൽ'}
            </button>
          </div>

          {/* Feedback Notice */}
          {notice && (
            <div
              className={`rounded-xl border px-3.5 py-2.5 text-xs font-extrabold flex items-center justify-between gap-2 ${
                notice.ok
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <span>{notice.text}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="text-xs underline cursor-pointer shrink-0"
              >
                ശരി
              </button>
            </div>
          )}

          {/* 3 Main Market Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTab('exchange');
              }}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                tab === 'exchange' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
              <span>നാണയ വിനിമയം</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTab('store');
              }}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                tab === 'store' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>സ്റ്റോർ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTab('gift');
              }}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                tab === 'gift' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span>സമ്മാനം അയക്കാം</span>
            </button>
          </div>

          {/* TAB 1: TWO-WAY EXCHANGE */}
          {tab === 'exchange' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                  <p className="text-xs font-black text-slate-900">⬆️ ഉയർന്ന നാണയത്തിലേക്ക് മാറ്റാം</p>
                  <button
                    type="button"
                    onClick={() => handleExchange('silver_to_gold')}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-300 text-xs font-black text-slate-900 flex items-center justify-between cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1">
                      <SilverCoinSvg className="w-4 h-4" /> 100 വെള്ളി
                    </span>
                    <span>→</span>
                    <span className="inline-flex items-center gap-1 text-amber-900">
                      <GoldCoinSvg className="w-4 h-4" /> 10 സ്വർണ്ണം
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExchange('gold_to_diamond')}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-sky-50 border-2 border-sky-300 text-xs font-black text-slate-900 flex items-center justify-between cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1">
                      <GoldCoinSvg className="w-4 h-4" /> 100 സ്വർണ്ണം
                    </span>
                    <span>→</span>
                    <span className="inline-flex items-center gap-1 text-sky-900">
                      <DiamondGemSvg className="w-4 h-4" /> 1 വജ്രം
                    </span>
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                  <p className="text-xs font-black text-slate-900">⬇️ വജ്രം ചില്ലറയാക്കാം (Two-Way)</p>
                  <button
                    type="button"
                    onClick={() => handleExchange('diamond_to_gold')}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-300 text-xs font-black text-slate-900 flex items-center justify-between cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1 text-sky-900">
                      <DiamondGemSvg className="w-4 h-4" /> 1 വജ്രം
                    </span>
                    <span>→</span>
                    <span className="inline-flex items-center gap-1 text-amber-900">
                      <GoldCoinSvg className="w-4 h-4" /> 80 സ്വർണ്ണം
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExchange('diamond_to_silver')}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 text-xs font-black text-slate-900 flex items-center justify-between cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1 text-sky-900">
                      <DiamondGemSvg className="w-4 h-4" /> 1 വജ്രം
                    </span>
                    <span>→</span>
                    <span className="inline-flex items-center gap-1 text-slate-800">
                      <SilverCoinSvg className="w-4 h-4" /> 800 വെള്ളി
                    </span>
                  </button>
                </div>
              </div>

              {/* Extensible Cross-App Currency & Asset Slots (Protected by AUTHORIZED_APP_KEYS) */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>ക്രോസ്-ആപ്പ് കസ്റ്റം കറൻസി &amp; അസറ്റ് സ്ലോട്ടുകൾ</span>
                  </p>
                  <span className="text-[10px] font-bold text-emerald-800">APP-SK-XXXX Whitelist</span>
                </div>
                {customCurrencies.length === 0 && state.wallet.assetSlots.length === 0 ? (
                  <p className="text-[11px] font-semibold text-slate-600">
                    ഭാവിയിലെ അംഗീകൃത SKSSF ഇക്കോസിസ്റ്റം ആപ്പുകളിൽ (ദർസ് കിതാബ്, മഹല്ല്, തജ്ദീദ്) നിന്നുള്ള സൈൻ ചെയ്ത ടോക്കണുകൾ ഇവിടെ സുരക്ഷിതമായി ദൃശ്യമാകും.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {customCurrencies.map(([k, slot]) => (
                      <span
                        key={k}
                        className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-xs font-extrabold text-emerald-950"
                      >
                        {slot.symbol} {slot.labelMl}: {slot.balance} ({slot.appId})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STORE */}
          {tab === 'store' && (
            <div className="space-y-3">
              {/* Silver Items */}
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-600 flex items-center gap-1.5">
                  <SilverCoinSvg className="w-4 h-4" />
                  <span>വെള്ളി നാണയ സ്റ്റോർ (ക്വിസ് ഹിന്റുകൾ)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleBuy('hint_5050')}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-slate-50 text-left flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-900">✂️ 50:50 ക്വിസ് ഹിന്റ്</p>
                      <p className="text-[11px] text-slate-600">
                        കൈവശമുള്ളത്: {state.inventory.quizHint5050}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-black">
                      50 വെള്ളി
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuy('hint_time')}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-slate-50 text-left flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-900">⏱️ +15 സെക്കൻഡ് ടൈം ബൂസ്റ്റ്</p>
                      <p className="text-[11px] text-slate-600">
                        കൈവശമുള്ളത്: {state.inventory.quizHintTime}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-black">
                      35 വെള്ളി
                    </span>
                  </button>
                </div>
              </div>

              {/* Gold Items */}
              <div className="space-y-2">
                <p className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                  <GoldCoinSvg className="w-4 h-4" />
                  <span>സ്വർണ്ണ നാണയ സ്റ്റോർ</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleBuy('cooldown_skip_gold')}
                    className="p-3 rounded-2xl border border-amber-200 hover:border-amber-500 bg-amber-50/70 text-left space-y-1 cursor-pointer"
                  >
                    <p className="text-xs font-black text-amber-950">⚡ കൂൾഡൗൺ സ്കിപ്പ്</p>
                    <p className="text-[11px] text-slate-700">1 മണിക്കൂർ വിശ്രമം ഉടൻ ഒഴിവാക്കാം</p>
                    <p className="text-xs font-black text-amber-900">{ANTI_INFLATION_CAPS.COOLDOWN_SKIP_GOLD} സ്വർണ്ണം</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuy('extra_hp')}
                    className="p-3 rounded-2xl border border-rose-200 hover:border-rose-400 bg-rose-50/60 text-left space-y-1 cursor-pointer"
                  >
                    <p className="text-xs font-black text-rose-950 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" /> അധിക ജീവൻ (HP)
                    </p>
                    <p className="text-[11px] text-slate-700">ഹൃദയങ്ങൾ 3/3 ആയി നിറയ്ക്കാം</p>
                    <p className="text-xs font-black text-amber-900">{ANTI_INFLATION_CAPS.EXTRA_HP_GOLD} സ്വർണ്ണം</p>
                  </button>
                  <button
                    type="button"
                    disabled={state.inventory.freeRoamStageUnlocked}
                    onClick={() => handleBuy('free_roam')}
                    className="p-3 rounded-2xl border border-emerald-200 hover:border-emerald-500 bg-emerald-50/60 text-left space-y-1 cursor-pointer disabled:opacity-60"
                  >
                    <p className="text-xs font-black text-emerald-950">🗺️ ഫ്രീ-റോം സ്റ്റേജ്</p>
                    <p className="text-[11px] text-slate-700">
                      {state.inventory.freeRoamStageUnlocked ? '✅ അൺലോക്കാണ്' : 'മിനി-ഗെയിം സ്കിപ്പ് ഫ്രീ'}
                    </p>
                    <p className="text-xs font-black text-amber-900">{ANTI_INFLATION_CAPS.FREE_ROAM_GOLD} സ്വർണ്ണം</p>
                  </button>
                </div>
              </div>

              {/* Diamond Premium Unlocks */}
              <div className="space-y-2">
                <p className="text-xs font-black text-sky-800 flex items-center gap-1.5">
                  <DiamondGemSvg className="w-4 h-4" />
                  <span>വജ്രം സ്റ്റോർ (പ്രീമിയം അൺലോക്കുകൾ)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleBuy('streak_freeze')}
                    className="p-3 rounded-2xl border border-sky-200 hover:border-sky-500 bg-sky-50/60 text-left flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-black text-sky-950">❄️ സ്ട്രീക്ക് ഫ്രീസ്</p>
                      <p className="text-[11px] text-slate-600">കൈവശം: {state.inventory.streakFreezes}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-sky-300 text-xs font-black">
                      3 വജ്രം
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBuy('frame_royal_emerald')}
                    className="p-3 rounded-2xl border border-emerald-200 hover:border-emerald-500 bg-emerald-50/60 text-left flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-black text-emerald-950">🛡️ റോയൽ എമറാൾഡ് ഫ്രെയിം</p>
                      <p className="text-[11px] text-slate-600">
                        {state.inventory.unlockedBadgeFrames.includes('royal_emerald') ? '✅ സ്വന്തമാക്കി' : 'ബാഡ്ജ് ഫ്രെയിം'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-sky-300 text-xs font-black">
                      2 വജ്രം
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBuy('frame_malabar_gold')}
                    className="p-3 rounded-2xl border border-amber-200 hover:border-amber-500 bg-amber-50/60 text-left flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-black text-amber-950">✨ മലബാർ ഗോൾഡ് ഫ്രെയിം</p>
                      <p className="text-[11px] text-slate-600">
                        {state.inventory.unlockedBadgeFrames.includes('malabar_gold') ? '✅ സ്വന്തമാക്കി' : 'ബാഡ്ജ് ഫ്രെയിം'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-sky-300 text-xs font-black">
                      2 വജ്രം
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBuy('sound_malabar_oud')}
                    className="p-3 rounded-2xl border border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 text-left flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-black text-indigo-950">🎵 മലബാർ ഊദ് ആംബിയന്റ് പാക്ക്</p>
                      <p className="text-[11px] text-slate-600">
                        {state.inventory.unlockedSoundPacks.includes('malabar_oud') ? '✅ സ്വന്തമാക്കി' : 'സൗണ്ട് പാക്ക്'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-sky-300 text-xs font-black">
                      2 വജ്രം
                    </span>
                  </button>
                </div>

                {/* 10-Diamond Name Rename Pass */}
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-black text-amber-950">
                        🪪 നെയിം ചേഞ്ച് കാർഡ് (Name Rename Pass)
                      </p>
                      <p className="text-[11px] text-slate-700">
                        നിങ്ങളുടെ <span className="font-mono font-bold">{state.identity.userId}</span> ഐഡി നഷ്ടപ്പെടുത്താതെ പേര് മാറ്റാം (പഴയ പേര് ഹാഷ് ചെയിനിൽ സൂക്ഷിക്കും).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRenameBox((v) => !v)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shrink-0"
                    >
                      10 വജ്രം · മാറ്റാം
                    </button>
                  </div>
                  {showRenameBox && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <input
                        type="text"
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        maxLength={40}
                        placeholder="പുതിയ പേര് നൽകുക..."
                        className="flex-1 min-h-[40px] px-3 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleUseRenamePass}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black cursor-pointer"
                      >
                        10 💎 നൽകി സ്ഥിരീകരിക്കുക
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RECIPIENT-LOCKED GIFTING & 2-DIAMOND LESSON GIFT */}
          {tab === 'gift' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-700" />
                    <span>സ്വീകർത്താവിന്റെ ഐഡി ലോക്ക് ചെയ്ത സമ്മാനം അയക്കാം</span>
                  </p>
                  <span className="text-[10px] font-extrabold text-emerald-800">
                    ഇന്ന് അയച്ചത്: {state.social.giftsSentToday}/{ANTI_INFLATION_CAPS.MAX_GIFTS_SENT_PER_DAY}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700">
                      സുഹൃത്തിന്റെ യൂസർ ഐഡി (USR-SK-BX-XXXX)
                    </label>
                    <input
                      type="text"
                      value={giftToId}
                      onChange={(e) => setGiftToId(e.target.value.toUpperCase())}
                      placeholder="ഉദാ: USR-SK-B1-7K4M"
                      className="w-full min-h-[40px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900"
                    />
                    {state.social.friends.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {state.social.friends.slice(0, 4).map((f) => (
                          <button
                            key={f.userId}
                            type="button"
                            onClick={() => setGiftToId(f.userId)}
                            className="px-2 py-0.5 rounded-lg bg-white border border-emerald-200 text-[10px] font-bold text-emerald-900 cursor-pointer"
                          >
                            {f.displayName} ({f.userId.slice(-4)})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700">സമ്മാനത്തിന്റെ തരം</label>
                    <select
                      value={giftKind}
                      onChange={(e) => {
                        const v = e.target.value as typeof giftKind;
                        setGiftKind(v);
                        if (v === 'silver') setGiftAmount(25);
                        if (v === 'gold') setGiftAmount(10);
                        if (v === 'diamond') setGiftAmount(1);
                      }}
                      className="w-full min-h-[40px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900"
                    >
                      <option value="silver">🪙 വെള്ളി നാണയം അയക്കാം</option>
                      <option value="gold">🥇 സ്വർണ്ണ നാണയം അയക്കാം</option>
                      <option value="diamond">💎 വജ്രം അയക്കാം</option>
                      <option value="lesson_unlock">📘 പാഠം അൺലോക്ക് ഗിഫ്റ്റ് (2 വജ്രം)</option>
                    </select>
                  </div>
                </div>

                {giftKind === 'lesson_unlock' ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700">
                      തുറന്നുനൽകേണ്ട പാഠം തിരഞ്ഞെടുക്കുക (ചെലവ്: 2 വജ്രം)
                    </label>
                    <select
                      value={giftLessonId}
                      onChange={(e) => setGiftLessonId(e.target.value)}
                      className="w-full min-h-[40px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900"
                    >
                      {ALL_LESSONS.map((l, idx) => (
                        <option key={l.id} value={l.id}>
                          പാഠം {idx + 1}: {l.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-700">എണ്ണം</label>
                      <input
                        type="number"
                        min={giftKind === 'diamond' ? 1 : giftKind === 'gold' ? 5 : 10}
                        max={giftKind === 'diamond' ? 5 : giftKind === 'gold' ? 100 : 500}
                        value={giftAmount}
                        onChange={(e) => setGiftAmount(Number(e.target.value))}
                        className="w-full min-h-[40px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-700">ആശംസാ സന്ദേശം (ഐച്ഛികം)</label>
                      <input
                        type="text"
                        value={giftNote}
                        onChange={(e) => setGiftNote(e.target.value)}
                        maxLength={80}
                        placeholder="പഠനത്തിന് ആശംസകൾ!"
                        className="w-full min-h-[40px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCreateGift}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black cursor-pointer"
                >
                  🔐 സൈൻ ചെയ്ത സമ്മാന വൗച്ചർ &amp; QR ഉണ്ടാക്കുക
                </button>

                {generatedGift && (
                  <div className="rounded-2xl border-2 border-amber-300 bg-white p-3.5 space-y-2.5">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {generatedGift.qr && (
                        <img
                          src={generatedGift.qr}
                          alt="സമ്മാന QR കോഡ്"
                          className="w-28 h-28 rounded-xl border border-emerald-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-xs font-black text-emerald-950">
                          ✅ {giftToId} ഐഡിക്ക് മാത്രമായി ലോക്ക് ചെയ്ത സമ്മാനം തയ്യാറായി!
                        </p>
                        <p className="text-[10px] font-mono bg-slate-100 p-2 rounded-lg break-all text-slate-700">
                          {generatedGift.code}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await copyTextToClipboard(generatedGift.code);
                              if (ok) {
                                setCopiedGift(true);
                                window.setTimeout(() => setCopiedGift(false), 2000);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                          >
                            {copiedGift ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedGift ? 'കോപ്പി ചെയ്തു' : 'കോഡ് കോപ്പി'}</span>
                          </button>
                          <a
                            href={getWhatsAppShareHref(
                              `🎁 SKSSF ഗൈഡ് ഗെയിമിൽ നിങ്ങൾക്കായി ഒരു സമ്മാനം അയച്ചിട്ടുണ്ട്! (${giftToId} ഐഡിക്ക് മാത്രം തുറക്കാം):`,
                              generatedGift.url
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                          >
                            WhatsApp-ൽ അയക്കാം
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Redeem Gift Code */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black text-amber-950">📥 സുഹൃത്ത് അയച്ച സമ്മാനം സ്വീകരിക്കാം</p>
                  <span className="text-[10px] font-extrabold text-amber-800">
                    ഇന്ന് സ്വീകരിച്ചത്: {state.social.giftsReceivedToday}/{ANTI_INFLATION_CAPS.MAX_GIFTS_RECEIVED_PER_DAY}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-600">
                  നിങ്ങളുടെ ഐഡി: <span className="font-mono font-black text-emerald-900">{state.identity.userId}</span> · ഓരോ വൗച്ചറും 1 തവണ മാത്രമേ ഉപയോഗിക്കാനാകൂ.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={redeemInput}
                    onChange={(e) => setRedeemInput(e.target.value)}
                    placeholder="SKGIFT1:... കോഡ് ഇവിടെ ഒട്ടിക്കുക"
                    className="flex-1 min-h-[40px] px-3 rounded-xl border border-amber-300 bg-white text-xs font-mono text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleRedeemGift}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shrink-0"
                  >
                    സമ്മാനം തുറക്കാം
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
