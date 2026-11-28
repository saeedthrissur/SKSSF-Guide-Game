import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Copy,
  Download,
  Lock,
  QrCode,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import {
  createOriginLockedCardPayload,
  getDynamicOrigin,
  OriginLockedCardPayload,
  verifyHashChainIntegrity,
  verifyOriginLockedCardCode,
  verifySignedGiftVoucher,
} from '../utils/ecosystemCrypto';
import { useEcosystem } from '../utils/ecosystemStore';
import {
  exportProgressBackupCodeAsync,
  importProgressBackupCodeAsync,
} from '../utils/gameStorage';
import { copyTextToClipboard } from '../utils/shareLink';
import { sound } from '../utils/sound';

interface CardQrVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  rank: string;
  completedLessonsCount: number;
  onRestoredBackup: () => void;
}

export const CardQrVerifierModal: React.FC<CardQrVerifierModalProps> = ({
  isOpen,
  onClose,
  xp,
  rank,
  completedLessonsCount,
  onRestoredBackup,
}) => {
  const { state, ledgerHead, markHubVisited } = useEcosystem();
  const [tab, setTab] = useState<'verify' | 'ledger' | 'backup_qr'>('verify');
  const [scanInput, setScanInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    ok: boolean;
    title: string;
    detail: string;
    card?: OriginLockedCardPayload;
  } | null>(null);
  const [myCardCode, setMyCardCode] = useState('');
  const [myCardQr, setMyCardQr] = useState<string | null>(null);
  const [copiedCard, setCopiedCard] = useState(false);

  // 1-Click Backup QR Image Download & Restore
  const [backupPin, setBackupPin] = useState('');
  const [backupStatus, setBackupStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [backupQrImg, setBackupQrImg] = useState<string | null>(null);
  const [backupCodeText, setBackupCodeText] = useState('');
  const [restoreInput, setRestoreInput] = useState('');
  const [restorePin, setRestorePin] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    markHubVisited('verifier');
    const created = createOriginLockedCardPayload({
      type: completedLessonsCount >= 62 ? 'certificate' : 'badge',
      userId: state.identity.userId,
      handle: state.identity.handle,
      name: state.identity.displayName || state.identity.handle,
      xp,
      completedLessons: completedLessonsCount,
      rank,
      verificationTier: state.identity.verificationTier,
      ledgerHead,
    });
    setMyCardCode(created.code);
    QRCode.toDataURL(created.code, { width: 200, margin: 1 })
      .then((u) => setMyCardQr(u))
      .catch(() => setMyCardQr(null));
  }, [
    isOpen,
    markHubVisited,
    state.identity,
    xp,
    completedLessonsCount,
    rank,
    ledgerHead,
  ]);

  if (!isOpen) return null;

  const chainCheck = verifyHashChainIntegrity(state.ledger, {
    silver: state.wallet.silver,
    gold: state.wallet.gold,
    diamond: state.wallet.diamond,
  });

  const handleVerifyCode = () => {
    sound.unlockAudio();
    const raw = scanInput.trim();
    if (!raw) return;

    if (raw.includes('SKCARD1:')) {
      const res = verifyOriginLockedCardCode(raw);
      if (res.valid && res.payload) {
        sound.playSuccess(2);
        setVerifyResult({
          ok: true,
          title: res.sameOrigin
            ? '✅ 100% യഥാർത്ഥ കാർഡ് (Origin-Locked HMAC Verified!)'
            : '✅ സാധുവായ ഇക്കോസിസ്റ്റം കാർഡ് (മറ്റൊരു ഹോസ്റ്റിൽ സൈൻ ചെയ്തത്)',
          detail: `പേര്: ${res.payload.name} · ഐഡി: ${res.payload.userId} · റാങ്ക്: ${res.payload.rank} · ${res.payload.xp} XP · പാഠങ്ങൾ: ${res.payload.completedLessons}/62 · Ledger: #${res.payload.ledgerHead}`,
          card: res.payload,
        });
      } else {
        sound.playError();
        setVerifyResult({
          ok: false,
          title: '❌ വ്യാജമോ തിരുത്തിയതോ ആയ കാർഡ്!',
          detail: res.error || 'സിഗ്നേച്ചർ പരിശോധന പരാജയപ്പെട്ടു.',
        });
      }
      return;
    }

    if (raw.includes('SKGIFT1:')) {
      const res = verifySignedGiftVoucher(raw, state.identity.userId);
      if (res.valid && res.voucher) {
        sound.playSuccess(2);
        setVerifyResult({
          ok: true,
          title: '🎁 സാധുവായ സമ്മാന വൗച്ചർ!',
          detail: `അയച്ചത്: ${res.voucher.fromName} (${res.voucher.fromUserId}) → സ്വീകർത്താവ്: ${res.voucher.toUserId}`,
        });
      } else {
        sound.playError();
        setVerifyResult({
          ok: false,
          title: '⚠️ സമ്മാന വൗച്ചർ മുന്നറിയിപ്പ്',
          detail: res.error || 'സാധുവായ വൗച്ചർ അല്ല.',
        });
      }
      return;
    }

    sound.playError();
    setVerifyResult({
      ok: false,
      title: 'അജ്ഞാത കോഡ് ഫോർമാറ്റ്',
      detail: 'SKCARD1: അല്ലെങ്കിൽ SKGIFT1: എന്ന് തുടങ്ങുന്ന കോഡ് നൽകുക.',
    });
  };

  const handleGenerateBackupQrImage = async () => {
    sound.unlockAudio();
    const cleanPin = backupPin.trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      sound.playError();
      setBackupStatus({ ok: false, text: '4 അക്ക രഹസ്യ PIN നമ്പർ നൽകുക (ഉദാ: 4829).' });
      return;
    }
    const name = state.identity.displayName || state.identity.handle || 'SKSSF പഠിതാവ്';
    const exported = await exportProgressBackupCodeAsync(name, cleanPin);
    if (!exported.ok || !exported.code) {
      sound.playError();
      setBackupStatus({ ok: false, text: exported.error || 'ബാക്കപ്പ് ഉണ്ടാക്കാനായില്ല.' });
      return;
    }
    setBackupCodeText(exported.code);

    // Draw 1-click downloadable PNG backup card containing QR + backup summary
    const canvas = document.createElement('canvas');
    canvas.width = 760;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#064E3B';
      ctx.fillRect(0, 0, 760, 960);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(28, 28, 704, 904);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, 688, 888);

      ctx.fillStyle = '#064E3B';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SKSSF GUIDE GAME — BACKUP QR', 380, 96);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`${state.identity.userId} · ${name}`, 380, 134);

      try {
        // Keep QR scannable (compact summary payload if full encrypted code exceeds QR v40 capacity)
        const qrPayload =
          exported.code.length <= 2200
            ? exported.code
            : `SKSSF-BK-META:${state.identity.userId}:${ledgerHead}`;
        const qrUrl = await QRCode.toDataURL(qrPayload, {
          width: 480,
          margin: 2,
          errorCorrectionLevel: 'L',
        });
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = qrUrl;
        });
        ctx.drawImage(img, 140, 175, 480, 480);
      } catch {
        // Ignore QR canvas fallback
      }

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`XP: ${xp} · Lessons: ${completedLessonsCount}/62 · Ledger: #${ledgerHead}`, 380, 708);
      ctx.fillStyle = '#64748B';
      ctx.font = '16px sans-serif';
      ctx.fillText('Protected by 4-Digit PIN (AES-GCM SKSSF-BK3)', 380, 750);
      ctx.fillText(`Origin: ${getDynamicOrigin()}`, 380, 785);
      ctx.fillStyle = '#991B1B';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Keep your 4-digit PIN safe to restore on any device.', 380, 845);

      const pngUrl = canvas.toDataURL('image/png');
      setBackupQrImg(pngUrl);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `SKSSF-Backup-QR-${state.identity.userId}.png`;
      a.click();
    }

    sound.playUnlock();
    setBackupStatus({
      ok: true,
      text: '✅ 1-ക്ലിക്ക് ബാക്കപ്പ് QR ചിത്രം ഡൗൺലോഡ് ചെയ്തു! കോഡും താഴെ കോപ്പി ചെയ്യാം.',
    });
  };

  const handleRestoreBackup = async () => {
    sound.unlockAudio();
    const res = await importProgressBackupCodeAsync(restoreInput, restorePin);
    if (res.ok) {
      sound.playUnlock();
      setBackupStatus({
        ok: true,
        text: `✅ ${res.restoredName} — ${res.restoredLessons} പാഠങ്ങളും ${res.restoredXp} XP-യും പുനഃസ്ഥാപിച്ചു!`,
      });
      onRestoredBackup();
    } else {
      sound.playError();
      setBackupStatus({ ok: false, text: res.error || 'റീസ്റ്റോർ പരാജയപ്പെട്ടു.' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="കാർഡ് / QR പരിശോധകൻ"
    >
      <div className="max-w-2xl w-full max-h-[88vh] overflow-y-auto overscroll-contain my-auto rounded-3xl border-2 border-emerald-300 bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 px-5 py-4 text-white border-b-4 border-amber-400 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div>
            <p className="text-[11px] font-extrabold text-amber-300 font-mono">
              HMAC-SHA256 · Origin: {getDynamicOrigin()}
            </p>
            <h2 className="text-base sm:text-lg font-black">
              🔍 കാർഡ് / QR പരിശോധിക്കുക &amp; ഹാഷ് ചെയിൻ സുരക്ഷ
            </h2>
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
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setTab('verify')}
              className={`min-h-[40px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer ${
                tab === 'verify' ? 'bg-emerald-700 text-white' : 'text-slate-700'
              }`}
            >
              <SearchCheck className="w-3.5 h-3.5" />
              <span>QR പരിശോധന</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('ledger')}
              className={`min-h-[40px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer ${
                tab === 'ledger' ? 'bg-emerald-700 text-white' : 'text-slate-700'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ഹാഷ് ചെയിൻ ({state.ledger.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('backup_qr')}
              className={`min-h-[40px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer ${
                tab === 'backup_qr' ? 'bg-emerald-700 text-white' : 'text-slate-700'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>ബാക്കപ്പ് QR</span>
            </button>
          </div>

          {/* TAB 1: ORIGIN-LOCKED CARD & QR VERIFIER */}
          {tab === 'verify' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 flex flex-col sm:flex-row items-center gap-3">
                {myCardQr && (
                  <img
                    src={myCardQr}
                    alt="എന്റെ വെരിഫൈഡ് കാർഡ് QR"
                    className="w-24 h-24 rounded-xl border border-emerald-300 bg-white p-1 shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-xs font-black text-emerald-950">
                    എന്റെ ഒറിജിൻ-ലോക്ക് ചെയ്ത വെരിഫിക്കേഷൻ കോഡ് (SKCARD1)
                  </p>
                  <p className="text-[10px] font-mono bg-white border border-emerald-200 p-1.5 rounded-lg truncate">
                    {myCardCode}
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyTextToClipboard(myCardCode);
                      if (ok) {
                        setCopiedCard(true);
                        window.setTimeout(() => setCopiedCard(false), 2000);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCard ? 'കോപ്പി ചെയ്തു!' : 'എന്റെ കാർഡ് കോഡ് കോപ്പി'}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                <p className="text-xs font-black text-slate-900">
                  🔍 മറ്റൊരു കാർഡ് / സർട്ടിഫിക്കറ്റ് / സമ്മാന QR കോഡ് പരിശോധിക്കാം
                </p>
                <textarea
                  rows={3}
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="SKCARD1:... അല്ലെങ്കിൽ SKGIFT1:... കോഡ് ഇവിടെ ഒട്ടിക്കുക"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black cursor-pointer"
                >
                  ക്രിപ്റ്റോഗ്രാഫിക് പരിശോധന നടത്തുക
                </button>

                {verifyResult && (
                  <div
                    className={`rounded-xl border-2 p-3 space-y-1 ${
                      verifyResult.ok
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                        : 'bg-rose-50 border-rose-400 text-rose-950'
                    }`}
                  >
                    <p className="text-xs font-black">{verifyResult.title}</p>
                    <p className="text-xs font-semibold leading-relaxed">{verifyResult.detail}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BLOCKCHAIN HASH CHAIN LEDGER */}
          {tab === 'ledger' && (
            <div className="space-y-3">
              <div
                className={`rounded-2xl border-2 p-3.5 flex items-center gap-2.5 ${
                  chainCheck.valid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                {chainCheck.valid ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div className="text-xs">
                  <p className="font-black">
                    {chainCheck.valid
                      ? '✅ ഹാഷ് ചെയിൻ ലെഡ്ജർ 100% സുരക്ഷിതമാണ് (SHA-256 Verified)'
                      : '⚠️ ലെഡ്ജർ പൊരുത്തക്കേട് കണ്ടെത്തി'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-600">
                    Head Hash: #{ledgerHead} · ആകെ ബ്ലോക്കുകൾ: {state.ledger.length}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {[...state.ledger].reverse().slice(0, 20).map((blk) => (
                  <div
                    key={blk.index}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 font-black text-slate-800">
                      <span>
                        #{blk.index} · {blk.action}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-800">
                        {blk.deltaSilver !== 0 ? `S:${blk.deltaSilver > 0 ? '+' : ''}${blk.deltaSilver} ` : ''}
                        {blk.deltaGold !== 0 ? `G:${blk.deltaGold > 0 ? '+' : ''}${blk.deltaGold} ` : ''}
                        {blk.deltaDiamond !== 0 ? `D:${blk.deltaDiamond > 0 ? '+' : ''}${blk.deltaDiamond}` : ''}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500 truncate">
                      prev:{blk.prevHash.slice(0, 12)} → cur:{blk.currentHash}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 1-CLICK BACKUP QR IMAGE DOWNLOAD & RESTORE */}
          {tab === 'backup_qr' && (
            <div className="space-y-4">
              {backupStatus && (
                <div
                  className={`rounded-xl border px-3 py-2 text-xs font-extrabold ${
                    backupStatus.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}
                >
                  {backupStatus.text}
                </div>
              )}

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2.5">
                <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>1-ക്ലിക്ക് ബാക്കപ്പ് QR ചിത്രം ഡൗൺലോഡ് ചെയ്യാം (SKSSF-BK3)</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={backupPin}
                    onChange={(e) => setBackupPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="4 അക്ക PIN നൽകുക (ഉദാ: 4829)"
                    className="flex-1 min-h-[40px] px-3 rounded-xl border border-emerald-300 bg-white text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateBackupQrImage}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black cursor-pointer shrink-0"
                  >
                    🖼️ ബാക്കപ്പ് QR ഡൗൺലോഡ്
                  </button>
                </div>
                {backupQrImg && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <img
                      src={backupQrImg}
                      alt="ബാക്കപ്പ് QR കാർഡ്"
                      className="w-28 rounded-xl border border-emerald-300"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-700">
                        നിങ്ങളുടെ എൻക്രിപ്റ്റ് ചെയ്ത ബാക്കപ്പ് കോഡും സുരക്ഷിതമായി കോപ്പി ചെയ്തു സൂക്ഷിക്കാം:
                      </p>
                      <button
                        type="button"
                        onClick={() => copyTextToClipboard(backupCodeText)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SKSSF-BK3 കോഡ് കോപ്പി</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-2.5">
                <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-700" />
                  <span>മറ്റൊരു ഫോണിലെ ബാക്കപ്പ് കോഡ് പുനഃസ്ഥാപിക്കാം (Restore)</span>
                </p>
                <textarea
                  rows={2}
                  value={restoreInput}
                  onChange={(e) => setRestoreInput(e.target.value)}
                  placeholder="SKSSF-BK3:... അല്ലെങ്കിൽ SKSSF-BK2:... കോഡ് ഇവിടെ ഒട്ടിക്കുക"
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs font-mono"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={restorePin}
                    onChange={(e) => setRestorePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="ബാക്കപ്പ് 4-അക്ക PIN"
                    className="flex-1 min-h-[40px] px-3 rounded-xl border border-amber-300 bg-white text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleRestoreBackup}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shrink-0"
                  >
                    ബാക്കപ്പ് റീസ്റ്റോർ ചെയ്യുക
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
