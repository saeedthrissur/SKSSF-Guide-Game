import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Award, Camera, Check, Copy, Download, Flame, Lock, Share2, Trash2, X } from 'lucide-react';
import { sound } from '../utils/sound';
import { copyAppShareLink, generateAppQrDataUrl, getAppShareUrl } from '../utils/shareLink';
import { ALL_LESSONS } from '../utils/lessonTracker';
import { loadDailyAndProfileState, UnitProfile } from '../utils/gameStorage';
import { sanitizeFinalPlayerText, sanitizePlayerText } from '../utils/sanitize';
import { OFFICIAL_FLAG_ASSETS } from './SvgArtwork';

export type BadgeMetalTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'emerald' | 'royal';

export interface ShareableBadgeMeta {
  id: string;
  tierLabel: string;
  metalTier: BadgeMetalTier;
  metalNameMl: string;
  metalNameEn: string;
  stars: number;
  title: string;
  subtitle: string;
  unlockHint: string;
  /** Rich outer metallic sheen gradient (3 stops for real brushed metal look) */
  frameStops: [string, string, string];
  /** Inner metallic border line */
  trimColor: string;
  /** Main ribbon & medallion fill gradient */
  accentFrom: string;
  accentTo: string;
  /** Clean readable text color for accent highlights */
  accentText: string;
  /** Ribbon text color */
  ribbonText: string;
  /** Clean crisp card surface */
  cardBg: string;
  /** Soft tinted strip bg for XP & QR footer */
  stripBg: string;
  stripBorder: string;
  /** Translucent background shield watermark color */
  watermarkColor: string;
}

export const SHAREABLE_BADGES: ShareableBadgeMeta[] = [
  {
    id: 'starter_member',
    tierLabel: 'ഘട്ടം 1',
    metalTier: 'bronze',
    metalNameMl: 'വെങ്കല ബാഡ്ജ്',
    metalNameEn: 'BRONZE',
    stars: 1,
    title: 'വിജ്ഞാനാന്വേഷി',
    subtitle: 'വിജ്ഞാനം · വിനയം · സേവനം — പഠന യാത്ര തുടങ്ങി',
    unlockHint: 'തുടക്കത്തിൽ തന്നെ ലഭിക്കും',
    frameStops: ['#6B2D0C', '#C26A27', '#8C3F14'],
    trimColor: '#D97706',
    accentFrom: '#7C2D12',
    accentTo: '#B45309',
    accentText: '#9A3412',
    ribbonText: '#FEF3C7',
    cardBg: '#FFFDF9',
    stripBg: '#FFF7ED',
    stripBorder: '#FDBA74',
    watermarkColor: '#9A3412',
  },
  {
    id: 'jeep_starter',
    tierLabel: 'ഘട്ടം 2',
    metalTier: 'silver',
    metalNameMl: 'സിൽവർ ബാഡ്ജ്',
    metalNameEn: 'SILVER',
    stars: 2,
    title: 'ആശയാഭിലാഷി',
    subtitle: 'ആദർശത്തിന്റെ അടിസ്ഥാന പാഠങ്ങളും പ്രചാരണ ഗെയിമും പൂർത്തിയാക്കി',
    unlockHint: 'ജീപ്പ് ഗെയിം പൂർത്തിയാക്കൂ',
    frameStops: ['#334155', '#CBD5E1', '#475569'],
    trimColor: '#94A3B8',
    accentFrom: '#1E293B',
    accentTo: '#475569',
    accentText: '#334155',
    ribbonText: '#F8FAFC',
    cardBg: '#FAFCFF',
    stripBg: '#F1F5F9',
    stripBorder: '#CBD5E1',
    watermarkColor: '#475569',
  },
  {
    id: 'flag_keeper',
    tierLabel: 'ഘട്ടം 3',
    metalTier: 'gold',
    metalNameMl: 'ഗോൾഡ് ബാഡ്ജ്',
    metalNameEn: 'GOLD',
    stars: 3,
    title: 'ആദർശാനുഭാവി',
    subtitle: 'സമസ്തയുടെയും SKSSF-ന്റെയും പതാകയും ചരിത്രവും പഠിച്ചു',
    unlockHint: 'പതാക പാഠം പൂർത്തിയാക്കൂ',
    frameStops: ['#78350F', '#FACC15', '#A16207'],
    trimColor: '#EAB308',
    accentFrom: '#7F1D1D',
    accentTo: '#B45309',
    accentText: '#92400E',
    ribbonText: '#FEF9C3',
    cardBg: '#FFFDF6',
    stripBg: '#FEFCE8',
    stripBorder: '#FDE047',
    watermarkColor: '#A16207',
  },
  {
    id: 'madrasa_guardian',
    tierLabel: 'ഘട്ടം 4',
    metalTier: 'platinum',
    metalNameMl: 'പ്ലാറ്റിനം ബാഡ്ജ്',
    metalNameEn: 'PLATINUM',
    stars: 4,
    title: 'ചരിത്രാന്വേഷി',
    subtitle: 'സമസ്ത മദ്രസാ ബോർഡും സംഘടനാ സംവിധാനങ്ങളും പഠിച്ചു',
    unlockHint: 'മദ്രസ ബോർഡ് പൂർത്തിയാക്കൂ',
    frameStops: ['#1E3A8A', '#93C5FD', '#1D4ED8'],
    trimColor: '#60A5FA',
    accentFrom: '#172554',
    accentTo: '#1D4ED8',
    accentText: '#1E40AF',
    ribbonText: '#EFF6FF',
    cardBg: '#F8FBFF',
    stripBg: '#EFF6FF',
    stripBorder: '#93C5FD',
    watermarkColor: '#1D4ED8',
  },
  {
    id: 'viqaya_hero',
    tierLabel: 'ഘട്ടം 5',
    metalTier: 'emerald',
    metalNameMl: 'എമറാൾഡ് ബാഡ്ജ്',
    metalNameEn: 'EMERALD',
    stars: 5,
    title: 'ആദർശരക്ഷാധികാരി',
    subtitle: 'സേവനത്തിന്റെയും ദുരിതാശ്വാസ പ്രവർത്തനങ്ങളുടെയും പാഠങ്ങൾ പഠിച്ചു',
    unlockHint: 'വിഖായ വാഹനം പൂർത്തിയാക്കൂ',
    frameStops: ['#022C22', '#10B981', '#065F46'],
    trimColor: '#D97706',
    accentFrom: '#064E3B',
    accentTo: '#047857',
    accentText: '#065F46',
    ribbonText: '#FEF3C7',
    cardBg: '#F9FEFB',
    stripBg: '#ECFDF5',
    stripBorder: '#6EE7B7',
    watermarkColor: '#065F46',
  },
  {
    id: 'master_guide',
    tierLabel: 'പൂർണ്ണ വിജയം',
    metalTier: 'royal',
    metalNameMl: 'റോയൽ ഗോൾഡ് ബാഡ്ജ്',
    metalNameEn: 'ROYAL GOLD',
    stars: 6,
    title: 'വിജ്ഞാനസാരഥി',
    subtitle: 'എല്ലാ പാഠങ്ങളും ക്വിസ് ദൗത്യങ്ങളും വിജയകരമായി പൂർത്തിയാക്കി',
    unlockHint: 'എല്ലാ ഘട്ടവും പൂർത്തിയാക്കൂ',
    frameStops: ['#581010', '#D97706', '#7F1D1D'],
    trimColor: '#F59E0B',
    accentFrom: '#7F1D1D',
    accentTo: '#991B1B',
    accentText: '#7F1D1D',
    ribbonText: '#FEF08A',
    cardBg: '#FFFDF7',
    stripBg: '#FEF2F2',
    stripBorder: '#FCA5A5',
    watermarkColor: '#881337',
  },
];

/** Clean sculpted mini metallic shield icon used in picker & watermark */
const MetallicShieldSvg: React.FC<{
  badge: ShareableBadgeMeta;
  className?: string;
  watermark?: boolean;
}> = ({ badge, className = 'w-8 h-8', watermark = false }) => {
  const gradId = `shield_grad_${badge.id}_${watermark ? 'wm' : 'ic'}`;
  return (
    <svg
      viewBox="0 0 120 136"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="12" y1="8" x2="108" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={badge.frameStops[0]} />
          <stop offset="48%" stopColor={badge.frameStops[1]} />
          <stop offset="100%" stopColor={badge.frameStops[2]} />
        </linearGradient>
      </defs>
      {/* Outer Heraldic Shield */}
      <path
        d="M60 6L108 22V66C108 98 86 119 60 130C34 119 12 98 12 66V22L60 6Z"
        fill={watermark ? badge.watermarkColor : `url(#${gradId})`}
        stroke={watermark ? badge.watermarkColor : badge.trimColor}
        strokeWidth="4"
      />
      {/* Inner Bevel Shield */}
      <path
        d="M60 16L98 29V65C98 91 80 109 60 118C40 109 22 91 22 65V29L60 16Z"
        fill="none"
        stroke={watermark ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}
        strokeWidth="2.5"
      />
      {/* Center 5-point Star */}
      <path
        d="M60 36L66.2 50.6L82 52L70 62.4L73.6 78L60 69.8L46.4 78L50 62.4L38 52L53.8 50.6L60 36Z"
        fill={watermark ? '#FFFFFF' : badge.ribbonText}
        opacity={watermark ? 0.55 : 0.95}
      />
      {/* Royal Crown accent for top tiers */}
      {badge.stars >= 5 && (
        <path
          d="M42 29L48 21L60 27L72 21L78 29H42Z"
          fill={watermark ? '#FFFFFF' : '#FDE047'}
          opacity={watermark ? 0.6 : 1}
        />
      )}
    </svg>
  );
};

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number
) {
  const scale = Math.min(boxW / img.width, boxH / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const dx = boxX + (boxW - w) / 2;
  const dy = boxY + (boxH - h) / 2;
  ctx.drawImage(img, dx, dy, w, h);
}

function drawCircularCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const scale = Math.max((radius * 2) / img.width, (radius * 2) / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
  ctx.restore();
}

function drawCanvasShield(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  w: number,
  h: number
) {
  const half = w / 2;
  const shoulderY = topY + h * 0.14;
  const bodyEndY = topY + h * 0.52;
  const bottomY = topY + h;

  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx + half, shoulderY);
  ctx.lineTo(cx + half, bodyEndY);
  ctx.bezierCurveTo(cx + half, topY + h * 0.78, cx + half * 0.55, topY + h * 0.92, cx, bottomY);
  ctx.bezierCurveTo(cx - half * 0.55, topY + h * 0.92, cx - half, topY + h * 0.78, cx - half, bodyEndY);
  ctx.lineTo(cx - half, shoulderY);
  ctx.closePath();
}

export interface ShareableBadgeStudioProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  rank: string;
  streakDays?: number;
  initialBadgeId?: string;
  completedLessonIds?: string[];
  completedLevels?: number[];
  awardedActions?: Record<string, boolean>;
  profile?: UnitProfile;
  onUpdateUnitProfile?: (patch: Partial<UnitProfile>) => void;
  onOpenSupport?: () => void;
}

export const ShareableBadgeStudio: React.FC<ShareableBadgeStudioProps> = ({
  isOpen,
  onClose,
  xp,
  rank,
  streakDays = 0,
  initialBadgeId = 'starter_member',
  completedLessonIds = [],
  completedLevels = [],
  awardedActions = {},
  profile,
  onUpdateUnitProfile,
}) => {
  const [selectedId, setSelectedId] = useState<string>('starter_member');
  const [userName, setUserName] = useState<string>('');
  const [unitPlace, setUnitPlace] = useState<string>('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const appUrl = getAppShareUrl();

  const unlockedMap = useMemo<Record<string, boolean>>(() => {
    const jeepDone = Boolean(
      awardedActions.opening_jeep_ready || completedLessonIds.includes('prologue_curiosity')
    );
    const flagDone = Boolean(
      completedLessonIds.includes('l1_flags') || completedLevels.includes(1)
    );
    const madrasaDone = Boolean(
      awardedActions.l2_madrasa_board ||
        awardedActions.madrasa_board_complete ||
        completedLessonIds.includes('l2_madrasa_board') ||
        completedLevels.includes(2)
    );
    const viqayaDone = Boolean(
      awardedActions.viqaya_prep_complete ||
        awardedActions.l4_viqaya_van ||
        awardedActions.viqaya_van_complete ||
        completedLessonIds.includes('l4_viqaya_van') ||
        completedLevels.includes(3)
    );
    const allDone = ALL_LESSONS.every((l) => completedLessonIds.includes(l.id));

    return {
      starter_member: true,
      jeep_starter: jeepDone,
      flag_keeper: flagDone,
      madrasa_guardian: madrasaDone,
      viqaya_hero: viqayaDone,
      master_guide: allDone,
    };
  }, [awardedActions, completedLessonIds, completedLevels]);

  const unlockedCount = useMemo(
    () => SHAREABLE_BADGES.filter((b) => unlockedMap[b.id]).length,
    [unlockedMap]
  );

  useEffect(() => {
    let active = true;
    if (isOpen) {
      generateAppQrDataUrl(220).then((url) => {
        if (active && url) setQrDataUrl(url);
      });
    }
    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setStatusMsg(null);
    // Auto-fill Name & Unit from saved profile
    const savedProfile = profile || loadDailyAndProfileState().profile;
    const savedName = sanitizeFinalPlayerText(
      savedProfile.lockedCertificateName || savedProfile.playerName || '',
      40
    );
    const savedUnit = sanitizeFinalPlayerText(
      [savedProfile.unitName, savedProfile.mekhalaName].filter(Boolean).join(' · '),
      45
    );
    if (savedName) setUserName((prev) => prev || savedName);
    if (savedUnit) setUnitPlace((prev) => prev || savedUnit);

    if (initialBadgeId && unlockedMap[initialBadgeId]) {
      setSelectedId(initialBadgeId);
      return;
    }
    const highestUnlocked = [...SHAREABLE_BADGES]
      .reverse()
      .find((b) => unlockedMap[b.id]);
    setSelectedId(highestUnlocked?.id || 'starter_member');
  }, [isOpen, initialBadgeId, unlockedMap, profile]);

  if (!isOpen) return null;

  const badge =
    SHAREABLE_BADGES.find((b) => b.id === selectedId && unlockedMap[b.id]) ||
    SHAREABLE_BADGES[0];
  const displayName = sanitizeFinalPlayerText(userName, 40) || 'നിങ്ങളുടെ പേര്';
  const displayPlace = sanitizeFinalPlayerText(unitPlace, 45) || 'യൂണിറ്റ് / നാട്';
  const starGlyphs = '★'.repeat(badge.stars);
  // Never repeat badge title inside the XP pill: clean format "20 XP • ഘട്ടം 1 • 🔥 1 ദിവസം"
  const statsSummary =
    streakDays > 0
      ? `${xp} XP • ${badge.tierLabel} • 🔥 ${streakDays} ദിവസം`
      : `${xp} XP • ${badge.tierLabel}`;
  void rank;

  const handlePhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        sound.playPop();
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderBadgeCanvas = async (): Promise<HTMLCanvasElement> => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const liveQr = qrDataUrl || (await generateAppQrDataUrl(220));
    const [samasthaFlag, skssfFlag, userImg, qrImg] = await Promise.all([
      loadImg(OFFICIAL_FLAG_ASSETS.samastha),
      loadImg(OFFICIAL_FLAG_ASSETS.skssf),
      photoDataUrl ? loadImg(photoDataUrl) : Promise.resolve(null),
      liveQr ? loadImg(liveQr) : Promise.resolve(null),
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1385;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 1. Rich Metallic Outer Background Frame (Bronze / Silver / Gold / Platinum / Emerald / Royal)
    const frameGrad = ctx.createLinearGradient(0, 0, 1080, 1385);
    frameGrad.addColorStop(0, badge.frameStops[0]);
    frameGrad.addColorStop(0.5, badge.frameStops[1]);
    frameGrad.addColorStop(1, badge.frameStops[2]);
    ctx.fillStyle = frameGrad;
    ctx.fillRect(0, 0, 1080, 1385);

    // Subtle diagonal metallic sheen overlay
    const sheenGrad = ctx.createLinearGradient(0, 0, 1080, 620);
    sheenGrad.addColorStop(0, 'rgba(255,255,255,0.16)');
    sheenGrad.addColorStop(0.45, 'rgba(255,255,255,0.03)');
    sheenGrad.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, 1080, 1385);

    // 2. Crisp Rounded Inner Card (Zero Clipping!)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = badge.cardBg;
    ctx.beginPath();
    ctx.roundRect(48, 48, 984, 1289, 42);
    ctx.fill();
    ctx.restore();

    // Inner metallic border trim
    ctx.strokeStyle = badge.trimColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(68, 68, 944, 1249, 30);
    ctx.stroke();

    // 3. Subtle Low-Opacity Shield Crest Watermark behind the card center (never obscures text)
    ctx.save();
    ctx.globalAlpha = 0.065;
    drawCanvasShield(ctx, 540, 260, 560, 640);
    ctx.fillStyle = badge.watermarkColor;
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = badge.watermarkColor;
    ctx.stroke();
    ctx.restore();

    // 4. Top Official Flags (cleanly framed, never touching text)
    if (samasthaFlag) {
      drawImageContain(ctx, samasthaFlag, 102, 102, 128, 104);
    }
    if (skssfFlag) {
      drawImageContain(ctx, skssfFlag, 850, 102, 128, 104);
    }

    const drawOpticalCenteredFit = (
      text: string,
      centerX: number,
      y: number,
      maxPx: number,
      startSize: number,
      minSize: number,
      weight: number | string = 700,
      family = '"Noto Serif Malayalam", "Noto Serif", Georgia, serif'
    ) => {
      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.direction = 'ltr';
      let size = startSize;
      ctx.font = `normal ${weight} ${size}px ${family}`;
      let metrics = ctx.measureText(text);
      const getVisualW = (m: TextMetrics) => {
        const hasBox =
          typeof m.actualBoundingBoxLeft === 'number' &&
          typeof m.actualBoundingBoxRight === 'number' &&
          m.actualBoundingBoxRight + m.actualBoundingBoxLeft > 0;
        return hasBox ? m.actualBoundingBoxRight + m.actualBoundingBoxLeft : m.width;
      };
      while (size > minSize && Math.max(metrics.width, getVisualW(metrics)) > maxPx) {
        size -= 1;
        ctx.font = `normal ${weight} ${size}px ${family}`;
        metrics = ctx.measureText(text);
      }
      const leftBear =
        typeof metrics.actualBoundingBoxLeft === 'number' ? metrics.actualBoundingBoxLeft : 0;
      const rightBear =
        typeof metrics.actualBoundingBoxRight === 'number' && metrics.actualBoundingBoxRight > 0
          ? metrics.actualBoundingBoxRight
          : metrics.width;
      const visualCenterOffset = (rightBear - leftBear) / 2;
      ctx.fillText(text, Math.round(centerX - visualCenterOffset), y);
      ctx.restore();
    };

    // Header Titles
    ctx.fillStyle = badge.accentText;
    drawOpticalCenteredFit(
      `${starGlyphs}  ${badge.metalNameMl} ബാഡ്ജ്  ·  ${badge.tierLabel}`,
      540,
      126,
      560,
      20,
      14,
      800
    );
    ctx.fillStyle = '#0F172A';
    drawOpticalCenteredFit('SKSSF ഗൈഡ് ഗെയിം', 540, 174, 560, 34, 22, 800);
    ctx.fillStyle = badge.accentText;
    drawOpticalCenteredFit('“വിജ്ഞാനം · വിനയം · സേവനം”', 540, 212, 540, 21, 15, 700);

    // 5. Sculpted Metallic Shield Crest behind the Circular User Photo / Seal
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    const shieldGrad = ctx.createLinearGradient(370, 245, 710, 625);
    shieldGrad.addColorStop(0, badge.frameStops[0]);
    shieldGrad.addColorStop(0.5, badge.frameStops[1]);
    shieldGrad.addColorStop(1, badge.frameStops[2]);
    drawCanvasShield(ctx, 540, 244, 340, 382);
    ctx.fillStyle = shieldGrad;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = badge.trimColor;
    ctx.stroke();
    ctx.restore();

    // Inner bevel line on sculpted shield
    drawCanvasShield(ctx, 540, 260, 308, 348);
    ctx.strokeStyle = 'rgba(255,255,255,0.48)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // User Photo or Official Metallic Emblem inside the Shield Crest
    const cx = 540;
    const cy = 418;
    const radius = 122;

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    if (userImg) {
      drawCircularCoverImage(ctx, userImg, cx, cy, radius);
    } else {
      ctx.save();
      const sealGrad = ctx.createRadialGradient(cx - 24, cy - 28, 18, cx, cy, radius);
      sealGrad.addColorStop(0, badge.accentTo);
      sealGrad.addColorStop(1, badge.accentFrom);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = sealGrad;
      ctx.fill();
      ctx.strokeStyle = badge.trimColor;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'ltr';
      ctx.fillStyle = badge.ribbonText;
      ctx.font = '800 42px "Noto Serif", Georgia, serif';
      ctx.fillText('SKSSF', cx, cy - 12);
      ctx.font = '700 20px "Noto Serif", Georgia, serif';
      ctx.fillText('EST. 1989', cx, cy + 28);
      ctx.restore();
    }

    // Metallic tier stars on bottom point of shield
    ctx.fillStyle = badge.ribbonText;
    drawOpticalCenteredFit(starGlyphs, 540, 582, 220, 24, 16, 800);

    // 6. Metallic Ribbon Banner for Badge Title
    const ribbonGrad = ctx.createLinearGradient(124, 650, 956, 734);
    ribbonGrad.addColorStop(0, badge.accentFrom);
    ribbonGrad.addColorStop(0.5, badge.accentTo);
    ribbonGrad.addColorStop(1, badge.accentFrom);
    ctx.fillStyle = ribbonGrad;
    ctx.beginPath();
    ctx.roundRect(124, 650, 832, 82, 24);
    ctx.fill();
    ctx.strokeStyle = badge.trimColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = badge.ribbonText;
    drawOpticalCenteredFit(`${badge.title} · ${badge.metalNameMl}`, 540, 704, 760, 34, 20, 800);

    // 7. User Name, Unit/Place & Subtitle (Crisp, Unclipped, High-Contrast)
    ctx.fillStyle = '#0F172A';
    drawOpticalCenteredFit(displayName, 540, 806, 840, 48, 26, 800);

    ctx.fillStyle = badge.accentText;
    drawOpticalCenteredFit(displayPlace, 540, 856, 800, 28, 18, 700);

    ctx.fillStyle = '#334155';
    drawOpticalCenteredFit(badge.subtitle, 540, 906, 860, 22, 15, 600);

    // 8. XP, Rank & Daily Streak Strip
    ctx.fillStyle = badge.stripBg;
    ctx.beginPath();
    ctx.roundRect(124, 934, 832, 64, 18);
    ctx.fill();
    ctx.strokeStyle = badge.stripBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    drawOpticalCenteredFit(statsSummary, 540, 976, 790, 25, 16, 800);

    // 9. Clean Bottom QR Invite Footer Box (Full Width, 100% Readable, Zero Clipping!)
    ctx.fillStyle = badge.stripBg;
    ctx.beginPath();
    ctx.roundRect(108, 1024, 864, 224, 24);
    ctx.fill();
    ctx.strokeStyle = badge.stripBorder;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (qrImg) {
      const qrSize = 152;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(142, 1060, qrSize + 16, qrSize + 16, 16);
      ctx.fill();
      ctx.strokeStyle = badge.trimColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.drawImage(qrImg, 150, 1068, qrSize, qrSize);
    }

    const textCenterX = 626;
    ctx.fillStyle = '#0F172A';
    drawOpticalCenteredFit('നിങ്ങളും ഈ ഗെയിം കളിച്ചു നോക്കൂ', textCenterX, 1110, 560, 28, 18, 800);
    ctx.fillStyle = '#334155';
    drawOpticalCenteredFit(
      'QR കോഡ് സ്കാൻ ചെയ്യൂ അല്ലെങ്കിൽ ലിങ്ക് തുറക്കൂ',
      textCenterX,
      1154,
      560,
      21,
      15,
      600
    );
    ctx.fillStyle = badge.accentText;
    drawOpticalCenteredFit(
      appUrl.replace(/^https?:\/\//, ''),
      textCenterX,
      1198,
      560,
      21,
      14,
      700,
      '"Noto Serif", Georgia, serif'
    );

    // 10. Official Disclaimer Footer
    ctx.fillStyle = '#64748B';
    drawOpticalCenteredFit(
      'ഇതൊരു പഠന ഗെയിം ബാഡ്ജ് മാത്രമാണ് · ഔദ്യോഗിക അംഗത്വ രേഖയല്ല',
      540,
      1288,
      880,
      18,
      13,
      600
    );

    return canvas;
  };

  const handleDownload = async () => {
    setBusy(true);
    setStatusMsg(null);
    sound.playSuccess();
    try {
      const canvas = await renderBadgeCanvas();
      const link = document.createElement('a');
      link.download = `SKSSF-${badge.metalNameEn}-Badge-${displayName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setStatusMsg('ബാഡ്ജ് സേവ് ചെയ്തു! ഇനി വാട്സ്ആപ്പിലോ സ്റ്റാറ്റസിലോ ഇടാം.');
    } finally {
      setBusy(false);
    }
  };

  const handleSocialShare = async () => {
    setBusy(true);
    setStatusMsg(null);
    sound.playSuccess();
    const shareCaption = `ഞാൻ SKSSF ഗൈഡ് ഗെയിമിൽ "${badge.title}" (${badge.metalNameMl}) നേടി! (${xp} XP)\nനിങ്ങളും കളിച്ചു നോക്കൂ 👉 ${appUrl}`;
    try {
      const canvas = await renderBadgeCanvas();
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (blob && navigator.share) {
        const file = new File([blob], `SKSSF-${badge.metalNameEn}-Badge.png`, {
          type: 'image/png',
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${badge.title} — SKSSF ഗൈഡ് ഗെയിം`,
            text: shareCaption,
            files: [file],
          });
          setStatusMsg('ബാഡ്ജും ഗെയിം ലിങ്കും ഷെയർ ചെയ്തു!');
          return;
        }
        await navigator.share({
          title: `${badge.title} — SKSSF ഗൈഡ് ഗെയിം`,
          text: shareCaption,
        });
        setStatusMsg('ഗെയിം ലിങ്ക് ഷെയർ ചെയ്തു!');
        return;
      }
      const link = document.createElement('a');
      link.download = `SKSSF-${badge.metalNameEn}-Badge-${displayName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      await copyAppShareLink();
      setStatusMsg('ചിത്രം ഡൗൺലോഡ് ചെയ്തു, ഗെയിം ലിങ്ക് കോപ്പിയും ചെയ്തു — ഇനി വാട്സ്ആപ്പിൽ അയക്കാം!');
    } catch {
      setStatusMsg('ഷെയർ വേണ്ടെന്ന് വെച്ചു — ഡൗൺലോഡ് / ലിങ്ക് കോപ്പി ബട്ടൺ ഉപയോഗിക്കാം.');
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = async () => {
    sound.playPop();
    const ok = await copyAppShareLink();
    setStatusMsg(
      ok
        ? `ഗെയിം ലിങ്ക് കോപ്പി ചെയ്തു! (${appUrl})`
        : `ഈ ലിങ്ക് ഷെയർ ചെയ്യൂ: ${appUrl}`
    );
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="എന്റെ ഫോട്ടോ ബാഡ്ജ്"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border-2 border-amber-300 shadow-2xl max-w-4xl w-full p-4 sm:p-6 my-auto max-h-[85vh] overflow-y-auto overscroll-contain space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-extrabold text-emerald-700">
              🏅 വെങ്കലം → സിൽവർ → ഗോൾഡ് → പ്ലാറ്റിനം → എമറാൾഡ് → റോയൽ ഗോൾഡ് ({unlockedCount}/{SHAREABLE_BADGES.length} തുറന്നു)
            </p>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              📷 എന്റെ ഫോട്ടോ ബാഡ്ജ്
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="അടയ്ക്കുക"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Form + Photo Picker + Metallic Progressive Badge Selector (Below preview on mobile, left on desktop) */}
          <div className="order-2 lg:order-1 lg:col-span-6 space-y-4">
            {/* Photo Upload Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
              <p className="text-xs font-extrabold text-amber-950">
                1. നിങ്ങളുടെ ഫോട്ടോ വെക്കാം (വേണമെങ്കിൽ മാത്രം)
              </p>
              <p className="text-[11px] font-semibold text-amber-900 leading-snug">
                🔒 സ്വകാര്യത: നിങ്ങളുടെ ഫോട്ടോ ഈ ഫോണിൽ മാത്രമേ ഉപയോഗിക്കൂ — ഒരു സെർവറിലേക്കും അപ്‌ലോഡ് ചെയ്യില്ല.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoPick}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{photoDataUrl ? 'വേറെ ഫോട്ടോ വെക്കാം' : '📷 ഫോട്ടോ എടുക്കാം / ചേർക്കാം'}</span>
                </button>
                {photoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoDataUrl(null)}
                    className="min-h-[40px] inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> നീക്കാം
                  </button>
                )}
              </div>
            </div>

            {/* Name & Unit (Sanitized + Auto-Synced) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  2. നിങ്ങളുടെ പേര്
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={userName}
                  onChange={(e) => {
                    const clean = sanitizePlayerText(e.target.value, 40);
                    setUserName(clean);
                    onUpdateUnitProfile?.({ playerName: clean });
                  }}
                  placeholder="ഉദാ: മുഹമ്മദ് റയ്യാൻ"
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  3. യൂണിറ്റ് / നാട്
                </label>
                <input
                  type="text"
                  maxLength={45}
                  value={unitPlace}
                  onChange={(e) => {
                    const clean = sanitizePlayerText(e.target.value, 45);
                    setUnitPlace(clean);
                    onUpdateUnitProfile?.({ unitName: clean });
                  }}
                  placeholder="ഉദാ: നിങ്ങളുടെ നാട് / യൂണിറ്റ്"
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Metallic Progressive Badge Picker */}
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-slate-700">
                4. നിങ്ങൾക്ക് തുറന്ന ബാഡ്ജ് തിരഞ്ഞെടുക്കാം:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SHAREABLE_BADGES.map((item) => {
                  const locked = !unlockedMap[item.id];
                  const active = selectedId === item.id && !locked;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={locked}
                      onClick={() => {
                        sound.playPop();
                        setSelectedId(item.id);
                      }}
                      className={`min-h-[56px] p-2.5 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 ${
                        active
                          ? 'bg-emerald-50 border-emerald-600 text-slate-950 shadow-xs cursor-pointer'
                          : locked
                          ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-75 cursor-not-allowed'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-amber-400 cursor-pointer'
                      }`}
                    >
                      <div className={`shrink-0 mt-0.5 ${locked ? 'grayscale opacity-50' : ''}`}>
                        <MetallicShieldSvg badge={item} className="w-8 h-9" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="text-[10px] font-black tracking-wide truncate"
                            style={{ color: locked ? '#94A3B8' : item.accentText }}
                          >
                            {item.metalNameMl}
                          </span>
                          {locked ? (
                            <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                          ) : (
                            active && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs font-extrabold leading-snug break-words mt-0.5">
                          {item.title}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-snug break-words">
                          {locked ? item.unlockHint : `${'★'.repeat(item.stars)} ${item.tierLabel}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Streamlined Primary Actions: Share + Download + Subtle Copy Link Icon */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={handleSocialShare}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{busy ? 'തയ്യാറാക്കുന്നു...' : 'ഷെയർ ചെയ്യാം'}</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDownload}
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ഡൗൺലോഡ്</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label="ഗെയിം ലിങ്ക് കോപ്പി ചെയ്യാം"
                title="ഗെയിം ലിങ്ക് കോപ്പി ചെയ്യാം"
                className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 cursor-pointer shrink-0"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {statusMsg && (
              <p className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                ✅ {statusMsg}
              </p>
            )}
          </div>

          {/* Crisp Zero-Clipping Metallic Game Badge Card Preview (Top on mobile, right on desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex justify-center items-start">
            <div
              className="w-full max-w-[368px] rounded-[28px] p-3 shadow-xl relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${badge.frameStops[0]} 0%, ${badge.frameStops[1]} 50%, ${badge.frameStops[2]} 100%)`,
              }}
            >
              {/* Crisp Inner Card (Never Clipped! Protected in Dark Mode via badge-preview-surface) */}
              <div
                className="badge-preview-surface rounded-[20px] p-4 text-center relative overflow-hidden space-y-3"
                style={{
                  backgroundColor: badge.cardBg,
                  border: `2px solid ${badge.trimColor}`,
                }}
              >
                {/* Translucent Metallic Shield Crest Watermark Behind Content */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]"
                >
                  <MetallicShieldSvg badge={badge} watermark className="w-60 h-68" />
                </div>

                {/* Top Header Row: Flags + Metallic Tier + Title */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <img
                    src={OFFICIAL_FLAG_ASSETS.samastha}
                    alt="സമസ്ത പതാക"
                    referrerPolicy="no-referrer"
                    className="w-10 h-9 object-contain shrink-0"
                  />
                  <div className="leading-tight min-w-0">
                    <p
                      className="text-[10px] font-black tracking-wider"
                      style={{ color: badge.accentText }}
                    >
                      {starGlyphs} {badge.metalNameMl} · {badge.tierLabel}
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                      SKSSF ഗൈഡ് ഗെയിം
                    </p>
                    <p className="text-[10px] font-bold" style={{ color: badge.accentText }}>
                      “വിജ്ഞാനം · വിനയം · സേവനം”
                    </p>
                  </div>
                  <img
                    src={OFFICIAL_FLAG_ASSETS.skssf}
                    alt="SKSSF ഔദ്യോഗിക പതാക"
                    referrerPolicy="no-referrer"
                    className="w-10 h-9 object-contain shrink-0"
                  />
                </div>

                {/* Sculpted Metallic Shield-Medallion Centerpiece */}
                <div className="relative z-10 flex justify-center py-0.5">
                  <div className="relative w-[132px] h-[146px] flex items-center justify-center">
                    <MetallicShieldSvg badge={badge} className="absolute inset-0 w-full h-full drop-shadow-md" />
                    <div className="relative z-10 -mt-3 w-[82px] h-[82px] rounded-full p-[3px] bg-white shadow-sm">
                      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                        {photoDataUrl ? (
                          <img
                            src={photoDataUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex flex-col items-center justify-center"
                            style={{
                              background: `radial-gradient(circle at 35% 30%, ${badge.accentTo}, ${badge.accentFrom})`,
                              color: badge.ribbonText,
                            }}
                          >
                            <span className="text-xs font-black tracking-wider">SKSSF</span>
                            <span className="text-[8px] font-bold tracking-widest opacity-90">
                              EST. 1989
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-wider drop-shadow-2xs whitespace-nowrap"
                      style={{ color: badge.ribbonText }}
                    >
                      {starGlyphs}
                    </span>
                  </div>
                </div>

                {/* Metallic Ribbon Title */}
                <div
                  className="relative z-10 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold shadow-xs"
                  style={{
                    background: `linear-gradient(90deg, ${badge.accentFrom}, ${badge.accentTo}, ${badge.accentFrom})`,
                    color: badge.ribbonText,
                    border: `1.5px solid ${badge.trimColor}`,
                  }}
                >
                  {badge.title} · {badge.metalNameMl}
                </div>

                {/* User Name, Place & Description */}
                <div className="relative z-10 space-y-1">
                  <p className="text-lg font-extrabold text-slate-900 break-words leading-snug">
                    {displayName}
                  </p>
                  <p className="text-xs font-bold" style={{ color: badge.accentText }}>
                    {displayPlace}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-600 leading-relaxed px-1">
                    {badge.subtitle}
                  </p>
                </div>

                {/* Clean XP, Stage & Daily Streak Strip (Never duplicates badge title!) */}
                <div
                  className="relative z-10 py-1.5 px-3 rounded-xl text-[11px] font-extrabold text-slate-900 tabular-nums flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5"
                  style={{
                    backgroundColor: badge.stripBg,
                    border: `1px solid ${badge.stripBorder}`,
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 shrink-0" style={{ color: badge.accentText }} />
                    {xp} XP • {badge.tierLabel}
                  </span>
                  {streakDays > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-amber-700">
                      <span aria-hidden="true">•</span>
                      <Flame className="w-3.5 h-3.5 shrink-0" />
                      {streakDays} ദിവസം
                    </span>
                  )}
                </div>

                {/* Clean Full-Width QR Invite Box (Zero Clipping!) */}
                <div
                  className="relative z-10 rounded-xl p-2.5 flex items-center gap-3 text-left"
                  style={{
                    backgroundColor: badge.stripBg,
                    border: `1.5px solid ${badge.stripBorder}`,
                  }}
                >
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="SKSSF ഗൈഡ് ഗെയിം QR കോഡ്"
                      className="w-14 h-14 rounded-lg bg-white p-1 shrink-0"
                      style={{ border: `1px solid ${badge.trimColor}` }}
                    />
                  )}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-[11px] font-extrabold text-slate-900 leading-snug">
                      നിങ്ങളും ഈ ഗെയിം കളിച്ചു നോക്കൂ
                    </p>
                    <p className="text-[10px] font-semibold text-slate-600 leading-snug">
                      QR കോഡ് സ്കാൻ ചെയ്യൂ അല്ലെങ്കിൽ ലിങ്ക് തുറക്കൂ
                    </p>
                    <p
                      className="text-[10px] font-bold truncate"
                      style={{ color: badge.accentText }}
                    >
                      {appUrl.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                </div>

                {/* Clear Game-Only Disclaimer */}
                <p className="relative z-10 text-[10px] font-semibold text-slate-500 leading-snug pt-0.5">
                  ഇതൊരു പഠന ഗെയിം ബാഡ്ജ് മാത്രമാണ് · ഔദ്യോഗിക അംഗത്വ രേഖയല്ല
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
