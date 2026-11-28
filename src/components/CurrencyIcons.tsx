import React from 'react';
import { Globe, Sparkles, Store, Zap } from 'lucide-react';
import { useEcosystem } from '../utils/ecosystemStore';
import { sound } from '../utils/sound';

/** Bespoke Platinum-Silver Coin SVG with octagonal Islamic geometric star border */
export const SilverCoinSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="skSilverOuter" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="45%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
      <linearGradient id="skSilverInner" x1="8" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="55%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    <circle cx="18" cy="18" r="16" fill="url(#skSilverOuter)" stroke="#475569" strokeWidth="1.5" />
    <circle cx="18" cy="18" r="12.5" fill="url(#skSilverInner)" stroke="#F8FAFC" strokeWidth="1.2" />
    {/* 8-point geometric star */}
    <path
      d="M18 8.5L20.4 13.4L25.5 11.5L23.6 16.6L28.5 19L23.6 21.4L25.5 26.5L20.4 24.6L18 29.5L15.6 24.6L10.5 26.5L12.4 21.4L7.5 19L12.4 16.6L10.5 11.5L15.6 13.4Z"
      fill="#F8FAFC"
      opacity="0.9"
    />
    <circle cx="18" cy="18" r="3.4" fill="#64748B" stroke="#F8FAFC" strokeWidth="1" />
    <path d="M10 10C12.5 8 15 7.2 18 7.2" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
  </svg>
);

/** Bespoke 24K Gold Coin SVG with embossed rim & center geometric emblem */
export const GoldCoinSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="skGoldOuter" x1="3" y1="3" x2="33" y2="33" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="45%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
      <linearGradient id="skGoldInner" x1="8" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="55%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
    </defs>
    <circle cx="18" cy="18" r="16" fill="url(#skGoldOuter)" stroke="#78350F" strokeWidth="1.5" />
    <circle cx="18" cy="18" r="12.5" fill="url(#skGoldInner)" stroke="#FEF9C3" strokeWidth="1.3" strokeDasharray="2.5 1.5" />
    {/* Geometric 8-point rosette */}
    <polygon
      points="18,8.5 21,14.5 27.5,14.5 22.5,18.8 24.5,25.5 18,21.5 11.5,25.5 13.5,18.8 8.5,14.5 15,14.5"
      fill="#FEF9C3"
      stroke="#92400E"
      strokeWidth="0.9"
    />
    <path d="M10 10C12.5 7.8 15.2 7 18.4 7" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" opacity="0.85" />
  </svg>
);

/** Bespoke Faceted Blue-White Crystal Diamond SVG with specular gleam */
export const DiamondGemSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="skDiamondTop" x1="6" y1="6" x2="30" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F0F9FF" />
        <stop offset="50%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="skDiamondBody" x1="18" y1="13" x2="18" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7DD3FC" />
        <stop offset="55%" stopColor="#0EA5E9" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
    </defs>
    <polygon points="10,6 26,6 33,14 18,32 3,14" fill="url(#skDiamondBody)" stroke="#075985" strokeWidth="1.4" strokeLinejoin="round" />
    <polygon points="10,6 26,6 33,14 3,14" fill="url(#skDiamondTop)" stroke="#075985" strokeWidth="1.1" strokeLinejoin="round" />
    <polygon points="10,6 18,14 26,6" fill="#E0F2FE" opacity="0.9" />
    <polygon points="12,14 24,14 18,32" fill="#BAE6FD" opacity="0.55" />
    <path d="M12 14L18 32M24 14L18 32M10 6L12 14M26 6L24 14" stroke="#E0F2FE" strokeWidth="0.9" opacity="0.8" />
    {/* Crisp corner gleam */}
    <path d="M8 9.5L9.5 6.5L11 9.5L14 11L11 12.5L9.5 15.5L8 12.5L5 11Z" fill="#FFFFFF" opacity="0.95" />
  </svg>
);

/** Mastery Crown Star SVG (Gold filled vs muted slate) */
export const CrownStarSvg: React.FC<{ filled?: boolean; className?: string }> = ({
  filled = true,
  className = 'w-4 h-4',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4L12 2.5Z"
      fill={filled ? '#F59E0B' : '#E2E8F0'}
      stroke={filled ? '#92400E' : '#94A3B8'}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

interface WalletHudBarProps {
  xp: number;
  onOpenMarket: () => void;
  onOpenEcosystemHub?: () => void;
  unvisitedHubsCount?: number;
  hasUnvisitedMarket?: boolean;
  onMilestoneToast?: (msg: string) => void;
}

export const WalletHudBar: React.FC<WalletHudBarProps> = ({
  xp,
  onOpenMarket,
  onOpenEcosystemHub,
  unvisitedHubsCount = 0,
  hasUnvisitedMarket = false,
  onMilestoneToast,
}) => {
  const { state, boostInfo, getClaimableXpMilestones, claimXpDiamondMilestone } = useEcosystem();
  const claimableXp = getClaimableXpMilestones(xp);

  const handleClaimXpDiamond = () => {
    sound.unlockAudio();
    sound.playUnlock();
    const res = claimXpDiamondMilestone(xp);
    if (onMilestoneToast) onMilestoneToast(res.message);
  };

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white px-3 py-2 shadow-2xs flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div
          title="വെള്ളി നാണയങ്ങൾ (Silver Coins)"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-800 tabular-nums"
        >
          <SilverCoinSvg className="w-4.5 h-4.5 shrink-0" />
          <span>{state.wallet.silver}</span>
        </div>

        <div
          title="സ്വർണ്ണ നാണയങ്ങൾ (Gold Coins)"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-xs font-black text-amber-950 tabular-nums"
        >
          <GoldCoinSvg className="w-4.5 h-4.5 shrink-0" />
          <span>{state.wallet.gold}</span>
        </div>

        <div
          title="വജ്രങ്ങൾ (Diamonds)"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-xs font-black text-sky-950 tabular-nums"
        >
          <DiamondGemSvg className="w-4.5 h-4.5 shrink-0" />
          <span>{state.wallet.diamond}</span>
        </div>

        {boostInfo.is2xActive && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-900 text-amber-300 text-[10px] sm:text-[11px] font-black">
            <Zap className="w-3 h-3 shrink-0" />
            <span>2x കോയിൻ ബൂസ്റ്റ് സജീവം</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {claimableXp.length > 0 && (
          <button
            type="button"
            onClick={handleClaimXpDiamond}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-black shadow-xs cursor-pointer transition-colors"
          >
            <DiamondGemSvg className="w-3.5 h-3.5" />
            <span>{claimableXp[0]} XP ബോണസ്: +1 വജ്രം</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            sound.unlockAudio();
            sound.playClick();
            onOpenMarket();
          }}
          className="relative inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] sm:text-xs font-black cursor-pointer transition-colors"
        >
          <Store className="w-3.5 h-3.5 shrink-0" />
          <span>വിജ്ഞാന മാർക്കറ്റ്</span>
          {hasUnvisitedMarket && (
            <span
              aria-label="പുതിയ വിഭാഗം"
              className="w-2 h-2 rounded-full bg-amber-300 ring-2 ring-emerald-900"
            />
          )}
        </button>

        {onOpenEcosystemHub && (
          <button
            type="button"
            onClick={() => {
              sound.unlockAudio();
              sound.playClick();
              onOpenEcosystemHub();
            }}
            className="relative inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-400/40 text-[11px] sm:text-xs font-black cursor-pointer transition-colors shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>ഇക്കോസിസ്റ്റം ഹബ്</span>
            {unvisitedHubsCount > 0 && (
              <span
                aria-label={`${unvisitedHubsCount} പുതിയ വിഭാഗങ്ങൾ`}
                className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black leading-none"
              >
                {unvisitedHubsCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

/** Subtle, spoiler-free hidden treasure star (3 hidden quietly across the app, +2 Diamonds each) */
export const HiddenTreasureStar: React.FC<{
  starId: string;
  hintLabel?: string;
  onClaimed?: (msg: string) => void;
}> = ({ starId, onClaimed }) => {
  const { state, claimHiddenStar } = useEcosystem();
  const alreadyFound = state.progression.foundHiddenStars.includes(starId);
  if (alreadyFound) return null;

  return (
    <button
      type="button"
      onClick={() => {
        sound.unlockAudio();
        sound.playUnlock();
        const res = claimHiddenStar(starId);
        if (onClaimed) onClaimed(res.message);
      }}
      aria-label="നിഗൂഢ തിളക്കം"
      className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-amber-300/60 bg-amber-50/70 hover:bg-amber-100 text-amber-500 hover:text-amber-600 opacity-75 hover:opacity-100 transition-all active:scale-90 cursor-pointer"
    >
      <Sparkles className="w-3.5 h-3.5" />
    </button>
  );
};
