import React, { useEffect, useRef, useState } from 'react';
import { Award, Camera, Copy, Download, Printer, Share2, Trash2 } from 'lucide-react';
import { sound } from '../utils/sound';
import { copyAppShareLink, generateAppQrDataUrl, getAppShareUrl } from '../utils/shareLink';

interface CertificateGeneratorProps {
  xp: number;
  rank: string;
  badges: string[];
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
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
  }
  return currentY;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  xp,
  rank,
  badges,
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const appUrl = getAppShareUrl();

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

  const displayName = recipientName.trim() || 'നിങ്ങളുടെ പേര്';
  const displayUnit = unitName.trim() || 'യൂണിറ്റ് / നാട്';
  const issueDate = new Date().toLocaleDateString('ml-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) return;
    sound.playUnlock();
    setGenerated(true);
    setShareNote('നിങ്ങളുടെ സർട്ടിഫിക്കറ്റ് റെഡിയായി! ഇനി താഴെ നിന്ന് ഡൗൺലോഡ് ചെയ്യാനോ ഷെയർ ചെയ്യാനോ കഴിയും.');
  };

  const buildCertificateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const liveQr = qrDataUrl || (await generateAppQrDataUrl(220));
    const [samasthaFlag, skssfFlag, userPhoto, qrImg] = await Promise.all([
      loadImage('/assets/official/flag_111154.jpg'),
      loadImage('/assets/official/flag_111138.jpg'),
      photoDataUrl ? loadImage(photoDataUrl) : Promise.resolve(null),
      liveQr ? loadImage(liveQr) : Promise.resolve(null),
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.textBaseline = 'alphabetic';

    // Warm ivory parchment canvas
    ctx.fillStyle = '#FCFBF7';
    ctx.fillRect(0, 0, 1600, 1130);

    // Subtle emerald top header tint
    const topTint = ctx.createLinearGradient(0, 48, 0, 290);
    topTint.addColorStop(0, 'rgba(6, 95, 70, 0.08)');
    topTint.addColorStop(1, 'rgba(6, 95, 70, 0)');
    ctx.fillStyle = topTint;
    ctx.fillRect(62, 62, 1476, 228);

    // Outer deep emerald border & inner double gold frame
    ctx.strokeStyle = '#065F46';
    ctx.lineWidth = 20;
    ctx.strokeRect(34, 34, 1532, 1062);

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 5;
    ctx.strokeRect(60, 60, 1480, 1010);

    ctx.strokeStyle = '#065F46';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(72, 72, 1456, 986);

    // Maroon heritage corner bars
    ctx.fillStyle = '#7F1D1D';
    ctx.fillRect(60, 60, 116, 12);
    ctx.fillRect(1424, 60, 116, 12);
    ctx.fillRect(60, 1058, 116, 12);
    ctx.fillRect(1424, 1058, 116, 12);

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
      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SKJU · SKSSF', crestCx, crestCy + 8);
    }

    // Certificate Titles
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7F1D1D';
    ctx.font = '700 26px "Noto Sans Malayalam", sans-serif';
    ctx.fillText('SKSSF ഗൈഡ് ഗെയിം · “വിജ്ഞാനം · വിനയം · സേവനം”', 800, 294);

    ctx.fillStyle = '#064E3B';
    ctx.font = '800 48px "Noto Sans Malayalam", sans-serif';
    ctx.fillText('വിജയ സർട്ടിഫിക്കറ്റ്', 800, 356);

    // Ornamental gold divider line
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(420, 384);
    ctx.lineTo(1180, 384);
    ctx.stroke();

    // Natural, simple Kerala Malayalam body text
    ctx.fillStyle = '#334155';
    ctx.font = '600 24px "Noto Sans Malayalam", sans-serif';
    const lastLineY = wrapCenteredText(
      ctx,
      'സമസ്തയുടെ ചരിത്രവും SKSSF യൂണിറ്റ്-കമ്മിറ്റി പ്രവർത്തനങ്ങളും 17 സബ് വിങ്ങുകളും സൈബർ മര്യാദകളും ഉൾപ്പെടെ എല്ലാ പാഠങ്ങളും ഗെയിമുകളും ഭംഗിയായി പൂർത്തിയാക്കിയതിന് സ്നേഹപൂർവ്വം നൽകുന്ന സർട്ടിഫിക്കറ്റ്:',
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
      family = '"Noto Sans Malayalam", sans-serif'
    ) => {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.direction = 'ltr';
      let size = startSize;
      ctx.font = `normal ${weight} ${size}px ${family}`;
      while (size > minSize && ctx.measureText(text).width > maxPx) {
        size -= 2;
        ctx.font = `normal ${weight} ${size}px ${family}`;
      }
      ctx.fillText(text, centerX, y);
      ctx.restore();
    };

    // Recipient Name & Place (dynamically positioned so zero overlap!)
    const nameY = Math.max(588, lastLineY + 86);
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
    drawCenteredFit(displayUnit, 800, nameY + 60, 1180, 28, 18, 700);

    // Achievement Summary Box
    const boxY = Math.max(720, nameY + 96);
    ctx.fillStyle = '#F0FDF4';
    ctx.beginPath();
    ctx.roundRect(190, boxY, 1220, 134, 18);
    ctx.fill();
    ctx.strokeStyle = '#86EFAC';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#064E3B';
    drawCenteredFit(`നേടിയ സ്കോർ: ${xp} XP   ·   സ്ഥാനം: ${rank}`, 800, boxY + 52, 1140, 27, 18, 800);

    ctx.fillStyle = '#334155';
    const badgeLine =
      badges.length > 0 ? badges.join(' · ') : 'എല്ലാ പാഠങ്ങളും ഭംഗിയായി പൂർത്തിയാക്കി';
    drawCenteredFit(`ലഭിച്ച ബാഡ്ജുകൾ: ${badgeLine}`, 800, boxY + 98, 1140, 21, 14, 600);

    // Footer with Scannable QR Code + App Link
    if (qrImg) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(108, 922, 110, 110);
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(108, 922, 110, 110);
      ctx.drawImage(qrImg, 113, 927, 100, 100);
    }

    ctx.save();
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#065F46';
    ctx.font = 'normal 800 20px "Noto Sans Malayalam", sans-serif';
    ctx.fillText('📲 നിങ്ങളും ഈ ഗെയിം കളിക്കാൻ QR സ്കാൻ ചെയ്യൂ', 234, 958);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'normal 600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(appUrl.replace(/^https?:\/\//, ''), 234, 990);
    ctx.fillStyle = '#475569';
    ctx.font = 'normal 600 19px "Noto Sans Malayalam", sans-serif';
    ctx.fillText(`തീയതി: ${issueDate}`, 234, 1024);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#065F46';
    ctx.font = 'normal 800 22px "Noto Sans Malayalam", sans-serif';
    ctx.fillText('SKSSF ഗൈഡ് ഗെയിം · “വിജ്ഞാനം · വിനയം · സേവനം”', 1480, 1020);
    ctx.restore();

    return canvas;
  };

  const handleDownloadPng = async () => {
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
      setShareNote('സർട്ടിഫിക്കറ്റ് ചിത്രം ഫോണിൽ സേവ് ചെയ്തു!');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareSocial = async () => {
    setDownloading(true);
    setShareNote(null);
    sound.playSuccess();
    const shareCaption = `ഞാൻ SKSSF ഗൈഡ് ഗെയിമിൽ വിജയ സർട്ടിഫിക്കറ്റ് നേടി! (${xp} XP)\nനിങ്ങളും കളിച്ചു നോക്കൂ 👉 ${appUrl}`;
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
            title: 'SKSSF ഗൈഡ് ഗെയിം — വിജയ സർട്ടിഫിക്കറ്റ്',
            text: shareCaption,
            url: appUrl,
            files: [file],
          });
          setShareNote('സർട്ടിഫിക്കറ്റും ഗെയിം ലിങ്കും ഷെയർ ചെയ്തു!');
          return;
        }
        await navigator.share({
          title: 'SKSSF ഗൈഡ് ഗെയിം — വിജയ സർട്ടിഫിക്കറ്റ്',
          text: shareCaption,
          url: appUrl,
        });
        setShareNote('ഗെയിം ലിങ്ക് ഷെയർ ചെയ്തു!');
        return;
      }
      const link = document.createElement('a');
      link.download = `SKSSF-Guide-Certificate-${displayName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      await copyAppShareLink();
      setShareNote('സർട്ടിഫിക്കറ്റ് സേവ് ചെയ്തു, ഗെയിം ലിങ്ക് കോപ്പിയും ചെയ്തു — ഇനി വാട്‌സ്ആപ്പിൽ അയക്കാം!');
    } catch {
      setShareNote('ഷെയർ വേണ്ടെന്ന് വെച്ചു — ഡൗൺലോഡ് അല്ലെങ്കിൽ ലിങ്ക് കോപ്പി ബട്ടൺ ഉപയോഗിക്കാം.');
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
            🏆 നിങ്ങളുടെ വിജയ സർട്ടിഫിക്കറ്റ്
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
            പേരും നാടും ഫോട്ടോയും ചേർത്ത് സമസ്തയുടെയും SKSSF-ന്റെയും ഔദ്യോഗിക കൊടികളുള്ള സർട്ടിഫിക്കറ്റ് ഡൗൺലോഡ് ചെയ്യാം, വാട്‌സ്ആപ്പിൽ ഷെയർ ചെയ്യാം.
          </p>
        </div>
      </div>

      {/* Simple 3-Step Form */}
      <form
        onSubmit={handleGenerate}
        className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end"
      >
        <div className="md:col-span-5">
          <label
            htmlFor="cert-name"
            className="block text-xs font-extrabold text-slate-700 mb-1.5"
          >
            1. നിങ്ങളുടെ പേര്
          </label>
          <input
            id="cert-name"
            type="text"
            required
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="ഉദാ: മുഹമ്മദ് അമീൻ കെ."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-700"
          />
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
            സർട്ടിഫിക്കറ്റ് റെഡിയാക്കാം
          </button>
        </div>
      </form>

      {/* Photo Upload Bar */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="text-xs font-extrabold text-amber-950">
          3. നിങ്ങളുടെ ഫോട്ടോ കൂടി വെക്കാം (വേണമെങ്കിൽ മാത്രം — ഫോണിൽ തന്നെ സുരക്ഷിതം):
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
            <span>{photoDataUrl ? 'വേറെ ഫോട്ടോ വെക്കാം' : 'എന്റെ ഫോട്ടോ വെക്കാം'}</span>
          </button>
          {photoDataUrl && (
            <button
              type="button"
              onClick={() => setPhotoDataUrl(null)}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> നീക്കാം
            </button>
          )}
        </div>
      </div>

      {/* Live High-Fidelity Certificate Preview */}
      <div
        id="certificate-print-area"
        className="relative bg-[#FCFBF7] border-4 sm:border-[10px] border-emerald-900 rounded-2xl p-3 sm:p-6 shadow-md overflow-hidden"
      >
        <div className="border-2 border-amber-600/80 rounded-xl p-4 sm:p-8 text-center space-y-4 sm:space-y-5 bg-gradient-to-b from-emerald-50/40 via-transparent to-transparent">
          {/* Top Row: Samastha Flag + Center Photo/Crest + SKSSF Flag */}
          <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto">
            <img
              src="/assets/official/flag_111154.jpg"
              alt="സമസ്ത ഔദ്യോഗിക പതാക"
              className="w-16 h-14 sm:w-24 sm:h-20 object-contain"
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
              src="/assets/official/flag_111138.jpg"
              alt="SKSSF ഔദ്യോഗിക പതാക"
              className="w-16 h-14 sm:w-24 sm:h-20 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <p className="text-xs sm:text-sm font-extrabold text-red-900">
              SKSSF ഗൈഡ് ഗെയിം · “വിജ്ഞാനം · വിനയം · സേവനം”
            </p>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-1">
              വിജയ സർട്ടിഫിക്കറ്റ്
            </h4>
          </div>

          <div className="max-w-2xl mx-auto border-t-2 border-amber-500/40 pt-4">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              സമസ്തയുടെ ചരിത്രവും SKSSF യൂണിറ്റ്-കമ്മിറ്റി പ്രവർത്തനങ്ങളും 17 സബ് വിങ്ങുകളും സൈബർ മര്യാദകളും ഉൾപ്പെടെ എല്ലാ പാഠങ്ങളും ഗെയിമുകളും ഭംഗിയായി പൂർത്തിയാക്കിയതിന് സ്നേഹപൂർവ്വം നൽകുന്ന സർട്ടിഫിക്കറ്റ്:
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
              നേടിയ സ്കോർ: {xp} XP · സ്ഥാനം: {rank}
            </p>
            <p className="text-slate-700 font-semibold leading-relaxed">
              ലഭിച്ച ബാഡ്ജുകൾ:{' '}
              {badges.length > 0 ? badges.join(' · ') : 'എല്ലാ പാഠങ്ങളും ഭംഗിയായി പൂർത്തിയാക്കി'}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 border-t border-slate-200">
            <div className="flex items-center gap-2.5 text-left">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="SKSSF ഗൈഡ് ഗെയിം QR കോഡ്"
                  className="w-14 h-14 rounded-lg bg-white p-1 border border-emerald-300 shrink-0"
                />
              )}
              <div className="leading-snug">
                <p className="text-[11px] font-extrabold text-emerald-900">
                  📲 നിങ്ങളും ഈ ഗെയിം കളിക്കാൻ QR സ്കാൻ ചെയ്യൂ
                </p>
                <p className="text-[10px] font-semibold text-slate-700 break-all">
                  {appUrl.replace(/^https?:\/\//, '')}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">തീയതി: {issueDate}</p>
              </div>
            </div>
            <span className="font-extrabold text-emerald-900 text-center sm:text-right">
              SKSSF ഗൈഡ് ഗെയിം · “വിജ്ഞാനം · വിനയം · സേവനം”
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={handleCopyAppLink}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-sky-300 bg-sky-50 text-sky-950 text-xs sm:text-sm font-extrabold hover:bg-sky-100 whitespace-nowrap shrink-0"
        >
          <Copy className="w-4 h-4" />
          🔗 ലിങ്ക് കോപ്പി
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm font-bold hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          <Printer className="w-4 h-4" />
          പ്രിന്റ് / PDF
        </button>
        <button
          type="button"
          disabled={downloading}
          onClick={handleShareSocial}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-extrabold hover:bg-emerald-800 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Share2 className="w-4 h-4" />
          ഷെയർ ചെയ്യാം
        </button>
        <button
          type="button"
          disabled={downloading}
          onClick={handleDownloadPng}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-900 text-white text-xs sm:text-sm font-extrabold hover:bg-red-950 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'തയ്യാറാക്കുന്നു...' : 'ചിത്രമായി ഡൗൺലോഡ്'}
        </button>
      </div>

      {(generated || shareNote) && (
        <p className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 font-bold text-center sm:text-right">
          ✅ {shareNote || 'സർട്ടിഫിക്കറ്റ് തയ്യാറായി! ഇനി ഡൗൺലോഡ് ചെയ്യാനോ ഷെയർ ചെയ്യാനോ കഴിയും.'}
        </p>
      )}
    </div>
  );
};
