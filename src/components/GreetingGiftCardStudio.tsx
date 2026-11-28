import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Download, Gift, Share2, Sparkles, X } from 'lucide-react';
import { useEcosystem } from '../utils/ecosystemStore';
import { getAppShareUrl, getWhatsAppShareHref } from '../utils/shareLink';
import { sound } from '../utils/sound';

interface GreetingTemplate {
  id: 'eid' | 'ramadan' | 'milad' | 'success';
  labelMl: string;
  arabic: string;
  headingMl: string;
  duaMl: string;
  bgStart: string;
  bgEnd: string;
  accent: string;
}

const TEMPLATES: GreetingTemplate[] = [
  {
    id: 'eid',
    labelMl: '🌙 ഈദ് മുബാറക്',
    arabic: 'عِيدٌ مُبَارَكٌ · تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ',
    headingMl: 'ഈദ് മുബാറക്!',
    duaMl: 'അല്ലാഹു നമ്മുടെ സൽക്കർമ്മങ്ങൾ സ്വീകരിക്കുകയും സന്തോഷവും സമാധാനവും ചൊരിയുകയും ചെയ്യട്ടെ.',
    bgStart: '#022C22',
    bgEnd: '#065F46',
    accent: '#F59E0B',
  },
  {
    id: 'ramadan',
    labelMl: '🕌 റമദാൻ കരീം',
    arabic: 'رَمَضَانُ كَرِيمٌ',
    headingMl: 'റമദാൻ കരീം ആശംസകൾ!',
    duaMl: 'വിശുദ്ധ റമദാൻ വിജ്ഞാനത്തിന്റെയും കാരുണ്യത്തിന്റെയും പാപമോചനത്തിന്റെയും മാസമാകട്ടെ.',
    bgStart: '#1E1B4B',
    bgEnd: '#064E3B',
    accent: '#FBBF24',
  },
  {
    id: 'milad',
    labelMl: '✨ നബിദിന ആശംസകൾ',
    arabic: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
    headingMl: 'തിരുനബി ﷺ ജന്മദിന ആശംസകൾ!',
    duaMl: 'ലോകത്തിന് കാരുണ്യമായ പ്രവാചകരുടെ ﷺ സൽസ്വഭാവവും സ്നേഹവും നമ്മുടെ ജീവിതത്തിൽ പ്രകാശിക്കട്ടെ.',
    bgStart: '#064E3B',
    bgEnd: '#0F766E',
    accent: '#FDE047',
  },
  {
    id: 'success',
    labelMl: '🏆 പഠന വിജയാശംസ',
    arabic: 'بَارَكَ اللَّهُ فِيكُمْ',
    headingMl: 'മികച്ച വിജയാശംസകൾ!',
    duaMl: 'വിജ്ഞാനം, വിനയം, സേവനം എന്നീ മൂല്യങ്ങളിലൂടെ ഉയർന്ന വിജയങ്ങൾ നേടാൻ അല്ലാഹു അനുഗ്രഹിക്കട്ടെ.',
    bgStart: '#0F172A',
    bgEnd: '#065F46',
    accent: '#38BDF8',
  },
];

export const GreetingGiftCardStudioModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { state, createRecipientLockedGift } = useEcosystem();
  const [tplId, setTplId] = useState<GreetingTemplate['id']>('eid');
  const [toName, setToName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [attachGift, setAttachGift] = useState(false);
  const [giftToUserId, setGiftToUserId] = useState('');
  const [giftKind, setGiftKind] = useState<'silver' | 'gold' | 'diamond'>('silver');
  const [giftAmount, setGiftAmount] = useState(25);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>(getAppShareUrl());

  if (!isOpen) return null;

  const tpl = TEMPLATES.find((t) => t.id === tplId) ?? TEMPLATES[0];
  const senderName = state.identity.displayName || state.identity.handle;

  const handleExportCard = async () => {
    sound.unlockAudio();
    let qrTargetUrl = getAppShareUrl();
    let giftLabel = '';

    if (attachGift) {
      const giftRes = createRecipientLockedGift({
        toUserId: giftToUserId,
        kind: giftKind,
        amount: giftAmount,
        note: `${tpl.headingMl} — ${senderName}`,
      });
      if (!giftRes.ok || !giftRes.url) {
        sound.playError();
        setStatusMsg(giftRes.message);
        return;
      }
      qrTargetUrl = giftRes.url;
      setShareUrl(giftRes.url);
      giftLabel = `🎁 സമ്മാന വൗച്ചർ (${giftToUserId.toUpperCase()}): +${giftAmount} ${
        giftKind === 'silver' ? 'വെള്ളി' : giftKind === 'gold' ? 'സ്വർണ്ണം' : 'വജ്രം'
      }`;
    } else {
      setShareUrl(qrTargetUrl);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1120;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 900, 1120);
      grad.addColorStop(0, tpl.bgStart);
      grad.addColorStop(1, tpl.bgEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 900, 1120);

      // Decorative Islamic geometric border
      ctx.strokeStyle = tpl.accent;
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, 828, 1048);
      ctx.lineWidth = 2;
      ctx.strokeRect(52, 52, 796, 1016);

      // Center geometric diamond ornament
      ctx.save();
      ctx.translate(450, 145);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(-34, -34, 68, 68);
      ctx.strokeStyle = tpl.accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(-34, -34, 68, 68);
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.fillStyle = tpl.accent;
      ctx.font = 'bold 34px serif';
      ctx.fillText(tpl.arabic, 450, 265);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 46px sans-serif';
      ctx.fillText(tpl.headingMl, 450, 345);

      if (toName.trim()) {
        ctx.fillStyle = '#FDE68A';
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText(`പ്രിയപ്പെട്ട ${toName.trim()}-ന്,`, 450, 415);
      }

      // Wrap message text
      const bodyText = customMessage.trim() || tpl.duaMl;
      ctx.fillStyle = '#ECFDF5';
      ctx.font = '24px sans-serif';
      const words = bodyText.split(' ');
      let line = '';
      let y = 485;
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > 720) {
          ctx.fillText(line, 450, y);
          line = word;
          y += 40;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, 450, y);

      // QR Box
      try {
        const qrUrl = await QRCode.toDataURL(qrTargetUrl, { width: 220, margin: 1 });
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = qrUrl;
        });
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(340, 675, 220, 220);
        ctx.drawImage(img, 346, 681, 208, 208);
      } catch {
        // Ignore QR fallback
      }

      if (giftLabel) {
        ctx.fillStyle = '#FDE047';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(giftLabel, 450, 945);
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`സ്നേഹപൂർവ്വം, ${senderName} (${state.identity.userId})`, 450, 1005);

      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '16px sans-serif';
      ctx.fillText('SKSSF ഗൈഡ് ഗെയിം · വിജ്ഞാനം · വിനയം · സേവനം', 450, 1045);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `SKSSF-Greeting-${tpl.id}.png`;
      link.click();
    }

    sound.playUnlock();
    setStatusMsg(
      attachGift
        ? '✅ സമ്മാന QR പതിപ്പിച്ച ആശംസാ കാർഡ് ഡൗൺലോഡ് ചെയ്തു! WhatsApp-ലും പങ്കുവെക്കാം.'
        : '✅ ആശംസാ കാർഡ് PNG ഡൗൺലോഡ് ചെയ്തു!'
    );
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="ആശംസാ & ദുആ കാർഡ് സ്റ്റുഡിയോ"
    >
      <div className="max-w-xl w-full max-h-[88vh] overflow-y-auto overscroll-contain my-auto rounded-3xl border-2 border-amber-300 bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 px-5 py-4 text-white border-b-4 border-amber-400 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div>
            <p className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> ഈദ് · റമദാൻ · നബിദിനം · വിജയാശംസ
            </p>
            <h2 className="text-base sm:text-lg font-black">💌 ആശംസാ &amp; ദുആ കാർഡ് + ഗിഫ്റ്റ് QR സ്റ്റുഡിയോ</h2>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTplId(t.id)}
                className={`py-2 px-2 rounded-xl text-xs font-black border cursor-pointer ${
                  t.id === tplId
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {t.labelMl}
              </button>
            ))}
          </div>

          {/* Live Card Preview */}
          <div
            style={{ background: `linear-gradient(135deg, ${tpl.bgStart}, ${tpl.bgEnd})` }}
            className="rounded-2xl border-4 border-amber-400 p-5 text-center text-white space-y-2 shadow-lg"
          >
            <p className="text-sm font-black text-amber-300" dir="rtl">
              {tpl.arabic}
            </p>
            <h3 className="text-xl font-black">{tpl.headingMl}</h3>
            {toName.trim() && (
              <p className="text-xs font-bold text-amber-200">പ്രിയപ്പെട്ട {toName.trim()}-ന്,</p>
            )}
            <p className="text-xs text-emerald-50/95 leading-relaxed">
              {customMessage.trim() || tpl.duaMl}
            </p>
            <p className="text-[11px] font-bold text-amber-300 pt-2">
              — {senderName} ({state.identity.userId})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              maxLength={35}
              placeholder="ആർക്കാണ് അയക്കുന്നത്? (പേര്)"
              className="min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs font-bold"
            />
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              maxLength={120}
              placeholder="സ്വന്തം ദുആ / ആശംസാ വരി (ഐച്ഛികം)"
              className="min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs font-bold"
            />
          </div>

          {/* Optional Gift QR Bundle Toggle */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-2.5">
            <label className="flex items-center gap-2 text-xs font-black text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                checked={attachGift}
                onChange={(e) => setAttachGift(e.target.checked)}
                className="w-4 h-4 accent-emerald-700"
              />
              <Gift className="w-4 h-4 text-amber-700" />
              <span>കാർഡിൽ സ്വീകർത്താവിന്റെ ഐഡി ലോക്ക് ചെയ്ത നാണയ/വജ്ര സമ്മാന QR ചേർക്കാം</span>
            </label>

            {attachGift && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <input
                  type="text"
                  value={giftToUserId}
                  onChange={(e) => setGiftToUserId(e.target.value.toUpperCase())}
                  placeholder="USR-SK-B1-XXXX"
                  className="min-h-[38px] px-2.5 rounded-xl border border-amber-300 bg-white text-xs font-mono font-bold"
                />
                <select
                  value={giftKind}
                  onChange={(e) => {
                    const k = e.target.value as 'silver' | 'gold' | 'diamond';
                    setGiftKind(k);
                    setGiftAmount(k === 'silver' ? 25 : k === 'gold' ? 10 : 1);
                  }}
                  className="min-h-[38px] px-2.5 rounded-xl border border-amber-300 bg-white text-xs font-bold"
                >
                  <option value="silver">വെള്ളി നാണയം</option>
                  <option value="gold">സ്വർണ്ണ നാണയം</option>
                  <option value="diamond">വജ്രം</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={giftAmount}
                  onChange={(e) => setGiftAmount(Number(e.target.value))}
                  className="min-h-[38px] px-2.5 rounded-xl border border-amber-300 bg-white text-xs font-bold"
                />
              </div>
            )}
          </div>

          {statusMsg && (
            <p className="rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-2 text-xs font-extrabold text-emerald-950">
              {statusMsg}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportCard}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>കാർഡ് PNG ഡൗൺലോഡ്</span>
            </button>
            <a
              href={getWhatsAppShareHref(
                `${tpl.headingMl} — ${customMessage.trim() || tpl.duaMl}\nസ്നേഹപൂർവ്വം, ${senderName}`,
                shareUrl
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black inline-flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
