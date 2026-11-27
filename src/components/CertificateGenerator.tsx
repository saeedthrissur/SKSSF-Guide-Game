import React, { useEffect, useRef, useState } from 'react';
import { Award, Camera, Copy, Download, Lock, Printer, Share2, ShieldAlert, Trash2 } from 'lucide-react';
import { sound } from '../utils/sound';
import { copyAppShareLink, generateAppQrDataUrl, getAppShareUrl } from '../utils/shareLink';
import { loadDailyAndProfileState } from '../utils/gameStorage';
import { ALL_LESSONS } from '../utils/lessonTracker';
import { OFFICIAL_FLAG_ASSETS } from './SvgArtwork';

interface CertificateGeneratorProps {
  xp: number;
  rank: string;
  badges: string[];
  isPreviewOnly?: boolean;
  completedLessonsCount?: number;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
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

function drawOpticalCenteredLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number
): void {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.direction = 'ltr';
  const m = ctx.measureText(text);
  const leftBear = typeof m.actualBoundingBoxLeft === 'number' ? m.actualBoundingBoxLeft : 0;
  const rightBear =
    typeof m.actualBoundingBoxRight === 'number' && m.actualBoundingBoxRight > 0
      ? m.actualBoundingBoxRight
      : m.width;
  const visualCenterOffset = (rightBear - leftBear) / 2;
  ctx.fillText(text, Math.round(centerX - visualCenterOffset), y);
  ctx.restore();
}

function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      drawOpticalCenteredLine(ctx, line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    drawOpticalCenteredLine(ctx, line, x, currentY);
  }
  return currentY;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  xp,
  rank,
  badges,
  isPreviewOnly = false,
  completedLessonsCount = ALL_LESSONS.length,
}) => {
  const initialDaily = loadDailyAndProfileState();
  const lockedName = initialDaily.profile.lockedCertificateName?.trim() || '';

  const [recipientName, setRecipientName] = useState(
    lockedName || initialDaily.profile.playerName || ''
  );
  const [unitName, setUnitName] = useState(initialDaily.profile.unitName || '');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const appUrl = getAppShareUrl();

  useEffect(() => {
    if (lockedName && recipientName !== lockedName) {
      setRecipientName(lockedName);
    }
  }, [lockedName, recipientName]);

  useEffect(() => {
    let active = true;
    generateAppQrDataUrl(220).then((url) => {
      if (active && url) setQrDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const cleanCertificateLabel = (raw: string) =>
    raw
      .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu, '')
      .replace(/SKSSF അനുഭാവി/g, 'വിജ്ഞാനാന്വേഷി')
      .replace(/SKSSF അംഗം/g, 'ആശയാഭിലാഷി')
      .replace(/SKSSF സംഘാടക പ്രതിനിധി/g, 'ആദർശാനുഭാവി')
      .replace(/SKSSF ഭാരവാഹി/g, 'ചരിത്രാന്വേഷി')
      .replace(/SKSSF നേതൃത്വം/g, 'ആദർശരക്ഷാധികാരി')
      .replace(/SKSSF വിഖായ വളണ്ടിയർ/g, 'ആദർശരക്ഷാധികാരി')
      .replace(/SKSSF മാർഗ്ഗദർശി/g, 'വിജ്ഞാനസാരഥി')
      .replace(/SKSSF യൂണിറ്റ് പ്രതിനിധി/g, 'ആശയാഭിലാഷി')
      .replace(/SKSSF ശാഖാ പ്രതിനിധി/g, 'ആശയാഭിലാഷി')
      .replace(/SKSSF മദ്രസാ പ്രതിനിധി/g, 'ചരിത്രാന്വേഷി')
      .replace(/SKSSF കമ്മിറ്റി ഭാരവാഹി/g, 'ആദർശാനുഭാവി')
      .replace(/SKSSF മേഖലാ ഭാരവാഹി/g, 'ചരിത്രാന്വേഷി')
      .replace(/SKSSF ജില്ലാ ഭാരവാഹി/g, 'ആദർശരക്ഷാധികാരി')
      .replace(/SKSSF ദഅ്‌വത്ത് പ്രതിനിധി/g, 'ആദർശാനുഭാവി')
      .replace(/കൂട്ടുകാരൻ/g, 'വിജ്ഞാനാന്വേഷി')
      .replace(/പ്രവർത്തകൻ/g, 'ആശയാഭിലാഷി')
      .replace(/സംഘാടകൻ/g, 'ആദർശാനുഭാവി')
      .replace(/\s+/g, ' ')
      .trim();

  const cleanRank = cleanCertificateLabel(rank) || 'വിജ്ഞാനാന്വേഷി';
  const cleanBadges = Array.from(new Set(badges.map(cleanCertificateLabel).filter(Boolean)));

  const effectiveName = lockedName || recipientName.trim();
  const displayName = effectiveName || 'നിങ്ങളുടെ പേര്';
  const displayUnit = unitName.trim() || 'യൂണിറ്റ് / നാട്';
  const issueDate = new Date().toLocaleDateString('ml-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const CERTIFICATE_TITLE = 'ആദർശ വിജ്ഞാന പ്രതിഭ - പ്രശംസാപത്രം';
  const CERTIFICATE_DISCLAIMER =
    'ഇതൊരു വിജ്ഞാനപ്രദമായ ഓൺലൈൻ ക്വിസ്/ഗെയിം വിജയത്തിന്റെ പ്രശംസാപത്രം മാത്രമാണ്; സംഘടനയുടെ ഔദ്യോഗിക അംഗത്വ രേഖയല്ല.';

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveName) return;
    sound.playUnlock();
    setGenerated(true);
    setShareNote(
      isPreviewOnly
        ? `ഇത് പ്രിവ്യൂ മാത്രമാണ് — ${ALL_LESSONS.length} പാഠങ്ങളും കളിച്ച് തീർത്താലേ പ്രശംസാപത്രം ഡൗൺലോഡ് ചെയ്യാൻ പറ്റൂ.`
        : 'പേര് ചേർത്തു! ഇനി താഴെ നിന്ന് ഡൗൺലോഡ് ചെയ്യാം അല്ലെങ്കിൽ വാട്‌സ്ആപ്പിൽ ഷെയർ ചെയ്യാം.'
    );
  };

  const buildCertificateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const liveQr = qrDataUrl || (await generateAppQrDataUrl(220));
    const [samasthaFlag, skssfFlag, userPhoto, qrImg] = await Promise.all([
      loadImage(OFFICIAL_FLAG_ASSETS.samastha),
      loadImage(OFFICIAL_FLAG_ASSETS.skssf),
      photoDataUrl ? loadImage(photoDataUrl) : Promise.resolve(null),
      liveQr ? loadImage(liveQr) : Promise.resolve(null),
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1190;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.textBaseline = 'alphabetic';

    // Warm ivory parchment canvas
    ctx.fillStyle = '#FCFBF7';
    ctx.fillRect(0, 0, 1600, 1190);

    // Subtle emerald top header tint
    const topTint = ctx.createLinearGradient(0, 48, 0, 290);
    topTint.addColorStop(0, 'rgba(6, 95, 70, 0.08)');
    topTint.addColorStop(1, 'rgba(6, 95, 70, 0)');
    ctx.fillStyle = topTint;
    ctx.fillRect(62, 62, 1476, 228);

    // Outer deep emerald border & inner double gold frame
    ctx.strokeStyle = '#065F46';
    ctx.lineWidth = 20;
    ctx.strokeRect(34, 34, 1532, 1122);

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 5;
    ctx.strokeRect(60, 60, 1480, 1070);

    ctx.strokeStyle = '#065F46';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(72, 72, 1456, 1046);

    // Maroon heritage corner bars
    ctx.fillStyle = '#7F1D1D';
    ctx.fillRect(60, 60, 116, 12);
    ctx.fillRect(1424, 60, 116, 12);
    ctx.fillRect(60, 1118, 116, 12);
    ctx.fillRect(1424, 1118, 116, 12);

    // Draw Real Official Flags on Left & Right Top Corners (Aspect-ratio preserved!)
    if (samasthaFlag) {
      drawImageContain(ctx, samasthaFlag, 108, 96, 170, 146);
    }
    if (skssfFlag) {
      drawImageContain(ctx, skssfFlag, 1322, 96, 170, 146);
    }

    // Top Center: User Circular Portrait Photo OR Official Gold-Ringed Crest
    const crestCx = 800;
    const crestCy = 172;
    if (userPhoto) {
      const r = 74;
      ctx.beginPath();
      ctx.arc(crestCx, crestCy, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = '#D97706';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(crestCx, crestCy, r + 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(crestCx, crestCy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const sc = Math.max((r * 2) / userPhoto.width, (r * 2) / userPhoto.height);
      const dw = userPhoto.width * sc;
      const dh = userPhoto.height * sc;
      ctx.drawImage(userPhoto, crestCx - dw / 2, crestCy - dh / 2, dw, dh);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(crestCx, crestCy, 56, 0, Math.PI * 2);
      ctx.fillStyle = '#065F46';
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#FEF3C7';
      ctx.font = '800 22px "Noto Serif", Georgia, serif';
      ctx.fillText('SKJU · SKSSF', crestCx, crestCy + 8);
    }

    // Certificate Titles (optically centered)
    ctx.fillStyle = '#7F1D1D';
    ctx.font = '700 26px "Noto Serif Malayalam", "Noto Serif", Georgia, serif';
    drawOpticalCenteredLine(ctx, 'SKSSF ഗൈഡ് ഗെയിം · “വിജ്ഞാനം · വിനയം · സേവനം”', 800, 294);

    ctx.fillStyle = '#064E3B';
    ctx.font = '800 42px "Noto Serif Malayalam", "Noto Serif", Georgia, serif';
    drawOpticalCenteredLine(ctx, CERTIFICATE_TITLE, 800, 356);

    // Ornamental gold divider line
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(420, 384);
    ctx.lineTo(1180, 384);
    ctx.stroke();

    // Natural, simple Kerala Malayalam body text
    ctx.fillStyle = '#334155';
    ctx.font = '600 24px "Noto Serif Malayalam", "Noto Serif", Georgia, serif';
    const lastLineY = wrapCenteredText(
      ctx,
      'സമസ്തയുടെ ചരിത്രവും SKSSF പ്രവർത്തനങ്ങളും സബ് വിങ്ങുകളും സൈബർ മര്യാദകളും ഉൾപ്പെടെ എല്ലാ പാഠങ്ങളും ഗെയിമുകളും വിജയകരമായി പൂർത്തിയാക്കിയതിന് സ്നേഹത്തോടെ നൽകുന്ന പ്രശംസാപത്രം.',
      800,
      432,
      1180,
      38
    );

    const drawCenteredFit = (
      text: string,
      centerX: number,
      y: number,
      maxPx: number,
      startSize: number,
      minSize: number,
      weight = 700,
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
      ctx.fillText(text, Math.round(centerX - (rightBear - leftBear) / 2), y);
      ctx.restore();
    };

    // Recipient Name & Place (dynamically positioned so zero overlap!)
    const nameY = Math.max(582, lastLineY + 80);
    ctx.fillStyle = '#0F172A';
    drawCenteredFit(displayName, 800, nameY, 1220, 52, 26, 800);

    // Subtle underline beneath name
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(480, nameY + 18);
    ctx.lineTo(1120, nameY + 18);
    ctx.stroke();

    ctx.fillStyle = '#047857';
    drawCenteredFit(displayUnit, 800, nameY + 58, 1180, 28, 18, 700);

    // Achievement Summary Box
    const boxY = Math.max(706, nameY + 90);
    ctx.fillStyle = '#F0FDF4';
    ctx.beginPath();
    ctx.roundRect(190, boxY, 1220, 124, 18);
    ctx.fill();
    ctx.strokeStyle = '#86EFAC';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#064E3B';
    drawCenteredFit(`സ്കോർ: ${xp} XP   ·   സ്ഥാനം: ${cleanRank}`, 800, boxY + 48, 1140, 27, 18, 800);

    ctx.fillStyle = '#334155';
    const badgeLine =
      cleanBadges.length > 0 ? cleanBadges.join(' · ') : 'എല്ലാ പാഠങ്ങളും പൂർത്തിയാക്കി';
    drawCenteredFit(`ബാഡ്ജുകൾ: ${badgeLine}`, 800, boxY + 92, 1140, 21, 14, 600);

    // Symmetrically Centered Footer with QR Code + App Link + Date
    if (qrImg) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(110, 902, 110, 110);
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(110, 902, 110, 110);
      ctx.drawImage(qrImg, 115, 907, 100, 100);
    }

    ctx.fillStyle = '#065F46';
    drawCenteredFit('നിങ്ങൾക്കും ഈ ഗെയിം കളിക്കാം — QR കോഡ് സ്കാൻ ചെയ്യൂ', 800, 934, 920, 21, 15, 800);
    ctx.fillStyle = '#0F172A';
    drawCenteredFit(
      appUrl.replace(/^https?:\/\//, ''),
      800,
      964,
      920,
      16,
      12,
      600,
      '"Noto Serif", Georgia, serif'
    );
    ctx.fillStyle = '#475569';
    drawCenteredFit(`തീയതി: ${issueDate}  ·  SKSSF ഗൈഡ് ഗെയിം`, 800, 998, 920, 19, 14, 700);

    // Official non-membership disclaimer at the bottom
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(130, 1034);
    ctx.lineTo(1470, 1034);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    drawCenteredFit(CERTIFICATE_DISCLAIMER, 800, 1076, 1360, 18, 12, 600);

    return canvas;
  };

  const handleDownloadPng = async () => {
    if (isPreviewOnly) {
      sound.playError();
      setShareNote(`പ്രിവ്യൂവിൽ ഡൗൺലോഡ് പറ്റില്ല — ${ALL_LESSONS.length} പാഠങ്ങളും കളിച്ച് തീർക്കൂ!`);
      return;
    }
    setDownloading(true);
    setShareNote(null);
    sound.playSuccess();
    try {
      const canvas = await buildCertificateCanvas();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `SKSSF-Guide-Certificate-${displayName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setShareNote('സർട്ടിഫിക്കറ്റ് ഫോണിൽ സേവ് ആയി!');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareSocial = async () => {
    if (isPreviewOnly) {
      sound.playError();
      setShareNote(`പ്രിവ്യൂവിൽ ഷെയർ പറ്റില്ല — ${ALL_LESSONS.length} പാഠങ്ങളും കളിച്ച് തീർക്കൂ!`);
      return;
    }
    setDownloading(true);
    setShareNote(null);
    sound.playSuccess();
    const shareCaption = `ഞാൻ SKSSF ഗൈഡ് ഗെയിം മുഴുവൻ കളിച്ച് സർട്ടിഫിക്കറ്റ് നേടി! (${xp} XP)\nനിങ്ങളും ഒന്ന് കളിച്ചു നോക്കൂ 👉 ${appUrl}`;
    try {
      const canvas = await buildCertificateCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (blob && navigator.share) {
        const file = new File(
          [blob],
          `SKSSF-Guide-Certificate-${displayName.replace(/\s+/g, '-')}.png`,
          { type: 'image/png' }
        );
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `SKSSF ഗൈഡ് ഗെയിം — ${CERTIFICATE_TITLE}`,
            text: shareCaption,
            files: [file],
          });
          setShareNote('പ്രശംസാപത്രവും ലിങ്കും ഷെയർ ചെയ്തു!');
          return;
        }
        await navigator.share({
          title: `SKSSF ഗൈഡ് ഗെയിം — ${CERTIFICATE_TITLE}`,
          text: shareCaption,
        });
        setShareNote('ഗെയിം ലിങ്ക് ഷെയർ ചെയ്തു!');
        return;
      }
      const link = document.createElement('a');
      link.download = `SKSSF-Guide-Certificate-${displayName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      await copyAppShareLink();
      setShareNote('സർട്ടിഫിക്കറ്റ് സേവ് ആയി, ലിങ്ക് കോപ്പിയും ചെയ്തു — ഇനി വാട്‌സ്ആപ്പിൽ അയക്കാം.');
    } catch {
      setShareNote('ഷെയർ മാറ്റിവെച്ചു — വേണമെങ്കിൽ താഴെ നിന്ന് ഡൗൺലോഡ് ചെയ്യാം.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyAppLink = async () => {
    sound.playPop();
    const ok = await copyAppShareLink();
    setShareNote(
      ok
        ? `ഗെയിം ലിങ്ക് കോപ്പി ചെയ്തു! (${appUrl})`
        : `ഈ ലിങ്ക് ഷെയർ ചെയ്യൂ: ${appUrl}`
    );
  };

  const handlePrint = () => {
    if (isPreviewOnly) {
      sound.playError();
      setShareNote(`പ്രിവ്യൂവിൽ പ്രിന്റ് പറ്റില്ല — ${ALL_LESSONS.length} പാഠങ്ങളും കളിച്ച് തീർക്കൂ!`);
      return;
    }
    sound.playClick();
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-6 space-y-5 shadow-sm">
      <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
        <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Award className="w-6 h-6" />
        </span>
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
            നിങ്ങളുടെ സർട്ടിഫിക്കറ്റ്
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
            പേരും നാടും (വേണമെങ്കിൽ ഫോട്ടോയും) ചേർത്ത് നിങ്ങളുടെ സർട്ടിഫിക്കറ്റ് ഫോണിൽ സേവ് ചെയ്യാം, വാട്‌സ്ആപ്പിൽ ഷെയർ ചെയ്യാം.
          </p>
        </div>
      </div>

      {isPreviewOnly && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-3.5 flex items-start gap-2.5 text-xs font-extrabold text-amber-950">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p>👁️ പ്രിവ്യൂ മാത്രം</p>
            <p className="font-semibold text-amber-900 leading-relaxed">
              ഇപ്പോൾ {completedLessonsCount}/{ALL_LESSONS.length} പാഠങ്ങളേ കഴിഞ്ഞിട്ടുള്ളൂ. ഡിസൈൻ നോക്കാൻ മാത്രമാണ് ഇത് — {ALL_LESSONS.length} പാഠങ്ങളും കളിച്ച് തീർത്താലേ പ്രശംസാപത്രം ഡൗൺലോഡ് ചെയ്യാനും ഷെയർ ചെയ്യാനും പറ്റൂ.
            </p>
          </div>
        </div>
      )}

      {/* Simple 3-Step Form */}
      <form
        onSubmit={handleGenerate}
        className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end"
      >
        <div className="md:col-span-5">
          <label
            htmlFor="cert-name"
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 mb-1.5"
          >
            <span>1. നിങ്ങളുടെ പേര്</span>
            {lockedName && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800">
                <Lock className="w-3 h-3" /> ബാക്കപ്പ് ലോക്ക്
              </span>
            )}
          </label>
          <input
            id="cert-name"
            type="text"
            required
            readOnly={Boolean(lockedName)}
            value={lockedName || recipientName}
            onChange={(e) => {
              if (!lockedName) setRecipientName(e.target.value);
            }}
            placeholder="ഉദാ: മുഹമ്മദ് അമീൻ കെ."
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none ${
              lockedName
                ? 'border-emerald-300 bg-emerald-50/70 font-extrabold cursor-not-allowed'
                : 'border-slate-300 focus:border-emerald-700'
            }`}
          />
          {lockedName && (
            <p className="text-[10px] font-bold text-emerald-800 mt-1">
              🔒 ബാക്കപ്പിൽ നിന്ന് എടുത്ത പേരായതിനാൽ ഇവിടെ പേര് മാറ്റാൻ പറ്റില്ല.
            </p>
          )}
        </div>

        <div className="md:col-span-4">
          <label
            htmlFor="cert-unit"
            className="block text-xs font-extrabold text-slate-700 mb-1.5"
          >
            2. യൂണിറ്റ് / നാട് (വേണമെങ്കിൽ)
          </label>
          <input
            id="cert-unit"
            type="text"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            placeholder="ഉദാ: നിങ്ങളുടെ നാട് / യൂണിറ്റ്"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-700"
          />
        </div>

        <div className="md:col-span-3">
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 text-white text-sm font-extrabold hover:bg-emerald-800 transition-colors whitespace-nowrap"
          >
            സർട്ടിഫിക്കറ്റ് കാണാം
          </button>
        </div>
      </form>

      {/* Photo Upload Bar */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="text-xs font-extrabold text-amber-950">
          3. ഫോട്ടോ ചേർക്കാം (നിർബന്ധമില്ല — ഫോട്ടോ ഫോണിൽ തന്നെ സുരക്ഷിതമായിരിക്കും):
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{photoDataUrl ? 'ഫോട്ടോ മാറ്റാം' : 'ഫോട്ടോ ചേർക്കാം'}</span>
          </button>
          {photoDataUrl && (
            <button
              type="button"
              onClick={() => setPhotoDataUrl(null)}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> ഒഴിവാക്കാം
            </button>
          )}
        </div>
      </div>

      {/* Live High-Fidelity Certificate Preview */}
      <div
        id="certificate-print-area"
        className="relative bg-[#FCFBF7] border-4 sm:border-[10px] border-emerald-900 rounded-2xl p-3 sm:p-6 shadow-md overflow-hidden"
      >
        {isPreviewOnly && (
          <div className="mb-3 rounded-xl bg-amber-300 border-2 border-amber-600 px-3 py-1.5 text-center text-xs font-black text-slate-950 tracking-wide">
            PREVIEW ONLY · NOT OFFICIAL ({completedLessonsCount}/{ALL_LESSONS.length} പാഠങ്ങൾ)
          </div>
        )}
        <div className="border-2 border-amber-600/80 rounded-xl p-4 sm:p-8 text-center space-y-4 sm:space-y-5 bg-gradient-to-b from-emerald-50/40 via-transparent to-transparent">
          {/* Top Row: Samastha Flag + Center Photo/Crest + SKSSF Flag */}
          <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto">
            <img
              src={OFFICIAL_FLAG_ASSETS.samastha}
              alt="സമസ്ത ഔദ്യോഗിക പതാക"
              className="w-20 h-16 sm:w-28 sm:h-20 object-contain rounded-lg bg-white p-0.5"
              referrerPolicy="no-referrer"
            />
            {photoDataUrl ? (
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-md shrink-0">
                <img
                  src={photoDataUrl}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full border-2 border-white"
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-900 border-2 border-amber-500 flex items-center justify-center shrink-0 shadow-xs">
                <span className="text-[10px] sm:text-xs font-extrabold text-amber-100 tracking-wider">
                  SKJU · SKSSF
                </span>
              </div>
            )}
            <img
              src={OFFICIAL_FLAG_ASSETS.skssf}
              alt="SKSSF ഔദ്യോഗിക പതാക"
              className="w-20 h-16 sm:w-28 sm:h-20 object-contain rounded-lg bg-white p-0.5"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <p className="text-xs sm:text-sm font-extrabold text-red-900">
              SKSSF ഗൈഡ് ഗെയിം · “വിജ്ഞാനം · വിനയം · സേവനം”
            </p>
            <h4 className="text-xl sm:text-3xl font-extrabold text-emerald-950 mt-1 leading-snug">
              {CERTIFICATE_TITLE}
            </h4>
          </div>

          <div className="max-w-2xl mx-auto border-t-2 border-amber-500/40 pt-4">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              സമസ്തയുടെ ചരിത്രവും SKSSF പ്രവർത്തനങ്ങളും സബ് വിങ്ങുകളും സൈബർ മര്യാദകളും ഉൾപ്പെടെ എല്ലാ പാഠങ്ങളും ഗെയിമുകളും വിജയകരമായി പൂർത്തിയാക്കിയതിന് സ്നേഹത്തോടെ നൽകുന്ന പ്രശംസാപത്രം.
            </p>
          </div>

          <div className="py-1.5 space-y-1">
            <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 break-words">
              {displayName}
            </p>
            <div className="w-48 h-px bg-slate-300 mx-auto" />
            <p className="text-xs sm:text-sm font-bold text-emerald-800 pt-1">
              {displayUnit}
            </p>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 sm:p-4 max-w-2xl mx-auto text-xs sm:text-sm space-y-1.5">
            <p className="font-extrabold text-emerald-950 tabular-nums">
              സ്കോർ: {xp} XP · സ്ഥാനം: {cleanRank}
            </p>
            <p className="text-slate-700 font-semibold leading-relaxed">
              ബാഡ്ജുകൾ:{' '}
              {cleanBadges.length > 0 ? cleanBadges.join(' · ') : 'എല്ലാ പാഠങ്ങളും പൂർത്തിയാക്കി'}
            </p>
          </div>

          <div className="pt-4 flex flex-col items-center justify-center gap-2.5 text-xs text-slate-600 border-t border-slate-200 text-center">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="SKSSF ഗൈഡ് ഗെയിം QR കോഡ്"
                className="w-16 h-16 rounded-lg bg-white p-1 border border-emerald-300 shrink-0"
              />
            )}
            <div className="leading-snug text-center">
              <p className="text-[11px] font-extrabold text-emerald-900">
                നിങ്ങൾക്കും ഈ ഗെയിം കളിക്കാം — QR കോഡ് സ്കാൻ ചെയ്യൂ
              </p>
              <p className="text-[10px] font-semibold text-slate-700 break-all">
                {appUrl.replace(/^https?:\/\//, '')}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                തീയതി: {issueDate} · SKSSF ഗൈഡ് ഗെയിം · “വിജ്ഞാനം · വിനയം · സേവനം”
              </p>
            </div>
            <p className="w-full pt-2.5 mt-1 border-t border-slate-200 text-[10px] sm:text-[11px] font-medium text-slate-500 leading-relaxed">
              {CERTIFICATE_DISCLAIMER}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={handleCopyAppLink}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs sm:text-sm font-extrabold hover:bg-emerald-100 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          ലിങ്ക് കോപ്പി
        </button>
        <button
          type="button"
          disabled={isPreviewOnly}
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm font-bold hover:bg-slate-50 disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isPreviewOnly ? <Lock className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
          പ്രിന്റ് / PDF
        </button>
        <button
          type="button"
          disabled={downloading || isPreviewOnly}
          onClick={handleShareSocial}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-extrabold hover:bg-emerald-800 disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isPreviewOnly ? <Lock className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          ഷെയർ ചെയ്യാം
        </button>
        <button
          type="button"
          disabled={downloading || isPreviewOnly}
          onClick={handleDownloadPng}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 border-b-4 border-amber-600 text-xs sm:text-sm font-black hover:bg-amber-300 disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isPreviewOnly ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {isPreviewOnly
            ? `${ALL_LESSONS.length} പാഠങ്ങളും പൂർത്തിയാക്കൂ`
            : downloading
            ? 'തയ്യാറാക്കുന്നു...'
            : 'ചിത്രമായി ഡൗൺലോഡ്'}
        </button>
      </div>

      {(generated || shareNote) && (
        <p className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 font-bold text-center sm:text-right">
          ✅ {shareNote || 'പേര് ചേർത്തു! ഇനി താഴെ നിന്ന് ഡൗൺലോഡ് ചെയ്യാം അല്ലെങ്കിൽ ഷെയർ ചെയ്യാം.'}
        </p>
      )}
    </div>
  );
};
