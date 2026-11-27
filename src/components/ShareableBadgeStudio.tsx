import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Award, Camera, Check, Copy, Download, Lock, Share2, Trash2, X } from 'lucide-react';
import { sound } from '../utils/sound';
import { copyAppShareLink, generateAppQrDataUrl, getAppShareUrl } from '../utils/shareLink';
import { ALL_LESSONS } from '../utils/lessonTracker';
import { OFFICIAL_FLAG_ASSETS } from './SvgArtwork';

export interface ShareableBadgeMeta {
  id: string;
  tierLabel: string;
  title: string;
  subtitle: string;
  unlockHint: string;
  accentFrom: string;
  accentTo: string;
}

export const SHAREABLE_BADGES: ShareableBadgeMeta[] = [
  {
    id: 'starter_member',
    tierLabel: 'ഘട്ടം 1',
    title: 'SKSSF അനുഭാവി',
    subtitle: 'വിജ്ഞാനം · വിനയം · സേവനം — പഠന യാത്ര തുടങ്ങി',
    unlockHint: 'തുടക്കത്തിൽ തന്നെ ലഭിക്കും',
    accentFrom: '#065F46',
    accentTo: '#0F766E',
  },
  {
    id: 'jeep_starter',
    tierLabel: 'ഘട്ടം 2',
    title: 'SKSSF പ്രവർത്തകൻ',
    subtitle: 'സംഘടനാ പ്രചാരണവും അടിസ്ഥാന പാഠങ്ങളും പൂർത്തിയാക്കി',
    unlockHint: 'ജീപ്പ് ഗെയിം പൂർത്തിയാക്കൂ',
    accentFrom: '#0369A1',
    accentTo: '#065F46',
  },
  {
    id: 'flag_keeper',
    tierLabel: 'ഘട്ടം 3',
    title: 'SKSSF സംഘാടകൻ',
    subtitle: 'സമസ്തയുടെയും SKSSF-ന്റെയും പതാകയും ചരിത്രവും പഠിച്ചു',
    unlockHint: 'പതാക പാഠം പൂർത്തിയാക്കൂ',
    accentFrom: '#7F1D1D',
    accentTo: '#065F46',
  },
  {
    id: 'madrasa_guardian',
    tierLabel: 'ഘട്ടം 4',
    title: 'SKSSF ഭാരവാഹി',
    subtitle: 'സമസ്ത മദ്രസാ ബോർഡും സംഘടനാ സംവിധാനങ്ങളും പഠിച്ചു',
    unlockHint: 'മദ്രസ ബോർഡ് പൂർത്തിയാക്കൂ',
    accentFrom: '#047857',
    accentTo: '#115E59',
  },
  {
    id: 'viqaya_hero',
    tierLabel: 'ഘട്ടം 5',
    title: 'SKSSF വിഖായ വളണ്ടിയർ',
    subtitle: 'സേവനത്തിനും ദുരിതാശ്വാസ പ്രവർത്തനങ്ങൾക്കും സദാസന്നദ്ധൻ',
    unlockHint: 'വിഖായ വാഹനം പൂർത്തിയാക്കൂ',
    accentFrom: '#0E7490',
    accentTo: '#065F46',
  },
  {
    id: 'master_guide',
    tierLabel: 'പൂർണ്ണ വിജയം',
    title: 'SKSSF നേതാവ്',
    subtitle: 'എല്ലാ പാഠങ്ങളും ദൗത്യങ്ങളും വിജയകരമായി പൂർത്തിയാക്കി',
    unlockHint: 'എല്ലാ ഘട്ടവും പൂർത്തിയാക്കൂ',
    accentFrom: '#92400E',
    accentTo: '#064E3B',
  },
];

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

export interface ShareableBadgeStudioProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  rank: string;
  initialBadgeId?: string;
  completedLessonIds?: string[];
  completedLevels?: number[];
  awardedActions?: Record<string, boolean>;
}

export const ShareableBadgeStudio: React.FC<ShareableBadgeStudioProps> = ({
  isOpen,
  onClose,
  xp,
  rank,
  initialBadgeId = 'starter_member',
  completedLessonIds = [],
  completedLevels = [],
  awardedActions = {},
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
    if (initialBadgeId && unlockedMap[initialBadgeId]) {
      setSelectedId(initialBadgeId);
      return;
    }
    const highestUnlocked = [...SHAREABLE_BADGES]
      .reverse()
      .find((b) => unlockedMap[b.id]);
    setSelectedId(highestUnlocked?.id || 'starter_member');
  }, [isOpen, initialBadgeId, unlockedMap]);

  if (!isOpen) return null;

  const cleanRank =
    rank
      .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu, '')
      .replace(/കൂട്ടുകാരൻ/g, 'പ്രവർത്തകൻ')
      .replace(/\s+/g, ' ')
      .trim() || 'SKSSF പ്രവർത്തകൻ';

  const badge =
    SHAREABLE_BADGES.find((b) => b.id === selectedId && unlockedMap[b.id]) ||
    SHAREABLE_BADGES[0];
  const displayName = userName.trim() || 'നിങ്ങളുടെ പേര്';
  const displayPlace = unitPlace.trim() || 'യൂണിറ്റ് / നാട്';

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
    canvas.height = 1350;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Rich festive background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
    bgGrad.addColorStop(0, badge.accentFrom);
    bgGrad.addColorStop(1, badge.accentTo);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Warm ivory inner card
    ctx.fillStyle = '#FCFBF7';
    ctx.beginPath();
    ctx.roundRect(54, 54, 972, 1242, 42);
    ctx.fill();

    // Inner gold border
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(78, 78, 924, 1194, 30);
    ctx.stroke();

    // Top Official Flags Row (Aspect-ratio preserved — zero stretch!)
    if (samasthaFlag) {
      drawImageContain(ctx, samasthaFlag, 118, 112, 148, 128);
    }
    if (skssfFlag) {
      drawImageContain(ctx, skssfFlag, 814, 112, 148, 128);
    }

    const drawOpticalCenteredFit = (
      text: string,
      centerX: number,
      y: number,
      maxPx: number,
      startSize: number,
      minSize: number,
      weight: number | string = 700,
      family = '"Noto Sans Malayalam", sans-serif'
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

    ctx.fillStyle = '#065F46';
    drawOpticalCenteredFit('SKSSF ഗൈഡ് ഗെയിം', 540, 166, 500, 32, 20, 800);
    ctx.fillStyle = '#92400E';
    drawOpticalCenteredFit('“വിജ്ഞാനം · വിനയം · സേവനം”', 540, 208, 500, 22, 15, 700);

    // Golden Circular User Photo Frame (or Emblem if no photo uploaded)
    const cx = 540;
    const cy = 434;
    const radius = 152;

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 12, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    if (userImg) {
      drawCircularCoverImage(ctx, userImg, cx, cy, radius);
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = badge.accentFrom;
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, radius - 16, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(254, 243, 199, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'ltr';
      ctx.fillStyle = '#FEF3C7';
      ctx.font = '800 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SKSSF', cx, cy - 12);
      ctx.fillStyle = '#FDE68A';
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('EST. 1989', cx, cy + 32);
      ctx.restore();
    }

    // Ribbon Badge Title (dead centered — formal, zero emoji)
    ctx.fillStyle = badge.accentFrom;
    ctx.beginPath();
    ctx.roundRect(140, 626, 800, 86, 24);
    ctx.fill();

    ctx.fillStyle = '#FEF3C7';
    drawOpticalCenteredFit(badge.title, 540, 682, 740, 34, 20, 800);

    // User Name & Place (dead centered)
    ctx.fillStyle = '#0F172A';
    drawOpticalCenteredFit(displayName, 540, 790, 840, 46, 24, 800);

    ctx.fillStyle = '#047857';
    drawOpticalCenteredFit(displayPlace, 540, 838, 820, 28, 17, 700);

    // Subtitle (dead centered)
    ctx.fillStyle = '#334155';
    drawOpticalCenteredFit(badge.subtitle, 540, 896, 840, 23, 15, 600);

    // XP & Rank Strip (dead centered — zero emoji)
    ctx.fillStyle = '#F1F5F9';
    ctx.beginPath();
    ctx.roundRect(120, 926, 840, 68, 18);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#064E3B';
    drawOpticalCenteredFit(`${xp} XP  ·  ${cleanRank}`, 540, 969, 780, 25, 16, 800);

    // Symmetrically Centered Scannable QR Code + App Link Invite Strip
    ctx.fillStyle = '#ECFDF5';
    ctx.beginPath();
    ctx.roundRect(120, 1014, 840, 232, 22);
    ctx.fill();
    ctx.strokeStyle = '#6EE7B7';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (qrImg) {
      const qrSize = 112;
      const qrX = 540 - qrSize / 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(qrX - 6, 1028, qrSize + 12, qrSize + 12, 12);
      ctx.fill();
      ctx.drawImage(qrImg, qrX, 1034, qrSize, qrSize);
    }

    ctx.fillStyle = '#064E3B';
    drawOpticalCenteredFit('നിങ്ങളും ഈ ഗെയിം കളിച്ചു നോക്കൂ', 540, 1178, 780, 23, 15, 800);
    ctx.fillStyle = '#047857';
    drawOpticalCenteredFit('QR കോഡ് സ്കാൻ ചെയ്യൂ അല്ലെങ്കിൽ ലിങ്ക് തുറക്കൂ', 540, 1206, 780, 17, 13, 700);
    ctx.fillStyle = '#0F172A';
    drawOpticalCenteredFit(
      appUrl.replace(/^https?:\/\//, ''),
      540,
      1232,
      780,
      16,
      12,
      700,
      '"Plus Jakarta Sans", sans-serif'
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
      link.download = `SKSSF-Badge-${displayName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setStatusMsg('ബാഡ്ജ് സേവ് ചെയ്തു! ഇനി വാട്‌സ്ആപ്പിലോ സ്റ്റാറ്റസിലോ ഇടാം.');
    } finally {
      setBusy(false);
    }
  };

  const handleSocialShare = async () => {
    setBusy(true);
    setStatusMsg(null);
    sound.playSuccess();
    const shareCaption = `ഞാൻ SKSSF ഗൈഡ് ഗെയിമിൽ "${badge.title}" ബാഡ്ജ് നേടി! (${xp} XP)\nനിങ്ങളും കളിച്ചു നോക്കൂ 👉 ${appUrl}`;
    try {
      const canvas = await renderBadgeCanvas();
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (blob && navigator.share) {
        const file = new File([blob], `SKSSF-Badge-${badge.id}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${badge.title} — SKSSF ഗൈഡ് ഗെയിം`,
            text: shareCaption,
            url: appUrl,
            files: [file],
          });
          setStatusMsg('ബാഡ്ജും ഗെയിം ലിങ്കും ഷെയർ ചെയ്തു!');
          return;
        }
        await navigator.share({
          title: `${badge.title} — SKSSF ഗൈഡ് ഗെയിം`,
          text: shareCaption,
          url: appUrl,
        });
        setStatusMsg('ഗെയിം ലിങ്ക് ഷെയർ ചെയ്തു!');
        return;
      }
      const link = document.createElement('a');
      link.download = `SKSSF-Badge-${displayName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      await copyAppShareLink();
      setStatusMsg('ചിത്രം ഡൗൺലോഡ് ചെയ്തു, ഗെയിം ലിങ്ക് കോപ്പിയും ചെയ്തു — ഇനി വാട്‌സ്ആപ്പിൽ അയക്കാം!');
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
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="എന്റെ ഫോട്ടോ ബാഡ്ജ്"
    >
      <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-2xl max-w-4xl w-full p-4 sm:p-6 my-auto max-h-[92vh] overflow-y-auto space-y-5">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-extrabold text-emerald-700">
              🏅 ഓരോ കളി ജയിക്കുമ്പോഴും പുതിയ ബാഡ്ജ് തുറക്കും ({unlockedCount}/{SHAREABLE_BADGES.length} തുറന്നു)
            </p>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              📷 എന്റെ ഫോട്ടോ ബാഡ്ജ്
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="അടയ്ക്കുക"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Form + Photo Picker + Progressive Badge Selector */}
          <div className="lg:col-span-6 space-y-4">
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold"
                >
                  <Camera className="w-4 h-4" />
                  <span>{photoDataUrl ? 'വേറെ ഫോട്ടോ വെക്കാം' : '📷 ഫോട്ടോ എടുക്കാം / ചേർക്കാം'}</span>
                </button>
                {photoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoDataUrl(null)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> നീക്കാം
                  </button>
                )}
              </div>
            </div>

            {/* Name & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  2. നിങ്ങളുടെ പേര്
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="ഉദാ: മുഹമ്മദ് റയ്യാൻ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  3. യൂണിറ്റ് / നാട്
                </label>
                <input
                  type="text"
                  value={unitPlace}
                  onChange={(e) => setUnitPlace(e.target.value)}
                  placeholder="ഉദാ: നിങ്ങളുടെ നാട് / യൂണിറ്റ്"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Progressive Badge Picker (Only unlocked badges selectable) */}
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
                      className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                        active
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs'
                          : locked
                          ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-75 cursor-not-allowed'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            locked ? 'text-slate-400' : 'text-emerald-700'
                          }`}
                        >
                          {item.tierLabel}
                        </span>
                        {locked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          active && <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs font-extrabold mt-1 leading-snug break-words">
                        {item.title}
                      </p>
                      {locked && (
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-snug break-words">
                          {item.unlockHint}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Share, Download & Copy Link Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={handleSocialShare}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-sm disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                <span>{busy ? 'തയ്യാറാക്കുന്നു...' : 'ഷെയർ ചെയ്യാം'}</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>ഡൗൺലോഡ്</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-extrabold cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>🔗 ഗെയിം ലിങ്ക് കോപ്പി ചെയ്യാം</span>
              </button>
            </div>

            {statusMsg && (
              <p className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                ✅ {statusMsg}
              </p>
            )}
          </div>

          {/* Right: Live High-Fidelity Card Preview WITH Official SKSSF & Samastha Flags */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              className="w-full max-w-[360px] rounded-3xl p-3.5 shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${badge.accentFrom}, ${badge.accentTo})`,
              }}
            >
              <div className="bg-[#FCFBF7] rounded-2xl border-2 border-amber-500/80 p-4 text-center space-y-3">
                {/* Official Flags Row */}
                <div className="flex items-center justify-between gap-2">
                  <img
                    src={OFFICIAL_FLAG_ASSETS.samastha}
                    alt="സമസ്ത പതാക"
                    referrerPolicy="no-referrer"
                    className="w-14 h-12 object-contain rounded-lg bg-white p-0.5"
                  />
                  <div className="leading-tight">
                    <p className="text-xs font-extrabold text-emerald-900">SKSSF ഗൈഡ് ഗെയിം</p>
                    <p className="text-[10px] font-bold text-amber-800">
                      “വിജ്ഞാനം · വിനയം · സേവനം”
                    </p>
                  </div>
                  <img
                    src={OFFICIAL_FLAG_ASSETS.skssf}
                    alt="SKSSF ഔദ്യോഗിക പതാക"
                    referrerPolicy="no-referrer"
                    className="w-14 h-12 object-contain rounded-lg bg-white p-0.5"
                  />
                </div>

                {/* Circular Photo Portrait */}
                <div className="flex justify-center py-1">
                  <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-md">
                    <div className="w-full h-full rounded-full overflow-hidden bg-emerald-50 flex items-center justify-center border-2 border-white">
                      {photoDataUrl ? (
                        <img
                          src={photoDataUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center text-amber-100"
                          style={{ backgroundColor: badge.accentFrom }}
                        >
                          <span className="text-base font-black tracking-wider">SKSSF</span>
                          <span className="text-[10px] font-bold text-amber-200 tracking-widest mt-0.5">
                            EST. 1989
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ribbon Title */}
                <div
                  className="py-2 px-3 rounded-xl text-amber-100 text-xs sm:text-sm font-extrabold"
                  style={{ backgroundColor: badge.accentFrom }}
                >
                  {badge.title}
                </div>

                <div>
                  <p className="text-lg font-extrabold text-slate-900 break-words">
                    {displayName}
                  </p>
                  <p className="text-xs font-bold text-emerald-800">{displayPlace}</p>
                </div>

                <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
                  {badge.subtitle}
                </p>

                <div className="py-2 px-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-emerald-950 tabular-nums">
                  <Award className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
                  {xp} XP · {cleanRank}
                </div>

                {/* Live Scannable QR Code + App Link Preview (Dead Centered) */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center gap-2 text-center">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="SKSSF ഗൈഡ് ഗെയിം QR കോഡ്"
                      className="w-16 h-16 rounded-lg bg-white p-1 border border-emerald-200 shrink-0"
                    />
                  )}
                  <div className="min-w-0 w-full text-center">
                    <p className="text-[11px] font-extrabold text-emerald-950 leading-snug">
                      നിങ്ങളും ഈ ഗെയിം കളിച്ചു നോക്കൂ
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-800 leading-snug mt-0.5 break-all">
                      {appUrl.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
