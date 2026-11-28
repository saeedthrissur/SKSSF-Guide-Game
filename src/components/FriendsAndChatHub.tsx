import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  AlertTriangle,
  Ban,
  BookOpen,
  Check,
  Copy,
  Link2,
  MessageCircle,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  AUTHORIZED_APP_REGISTRY,
  AuthorizedAppId,
  createInviteLink,
  createOriginLockedCardPayload,
  createSignedInviteMilestoneCode,
  getDynamicBaseUrl,
  isValidUserId,
  verifyChatDockPluginMessage,
  verifyOriginLockedCardCode,
  ChatDockWidgetMessage,
} from '../utils/ecosystemCrypto';
import { ecosystemSyncAdapter, useEcosystem } from '../utils/ecosystemStore';
import { containsAbusiveLanguage, sanitizeFinalPlayerText } from '../utils/sanitize';
import { copyTextToClipboard, getWhatsAppShareHref } from '../utils/shareLink';
import { sound } from '../utils/sound';

interface FriendsAndChatHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  rank: string;
  completedLessonsCount: number;
  onDeleteAllProfileData: () => void;
  onSyncExternalProfileName: (newName: string) => void;
}

export const FriendsAndChatHubModal: React.FC<FriendsAndChatHubModalProps> = ({
  isOpen,
  onClose,
  xp,
  rank,
  completedLessonsCount,
  onDeleteAllProfileData,
  onSyncExternalProfileName,
}) => {
  const {
    state,
    ledgerHead,
    markHubVisited,
    addVerifiedFriend,
    blockAndRemoveUser,
    unblockUser,
    updateDisplayNameWithRules,
    updateHandle,
    configureMasterProfileLink,
    connectAuthorizedApp,
    redeemFriendInviteMilestone,
    grantWebOfTrustAttestation,
  } = useEcosystem();

  const [tab, setTab] = useState<'friends' | 'profile' | 'ecosystem'>('friends');
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // Friend add inputs
  const [friendInput, setFriendInput] = useState('');
  const [friendNameInput, setFriendNameInput] = useState('');
  const [myCardQr, setMyCardQr] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Invite milestone redemption
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Profile inputs
  const [nameInput, setNameInput] = useState(state.identity.displayName);
  const [handleInput, setHandleInput] = useState(state.identity.handle);
  const [insIdInput, setInsIdInput] = useState(state.identity.masterProfileLink.institutionId || '');
  const [orgIdInput, setOrgIdInput] = useState(state.identity.masterProfileLink.organizationId || '');
  const [pinInput, setPinInput] = useState('');
  const [attestIdInput, setAttestIdInput] = useState('');
  const [attestNameInput, setAttestNameInput] = useState('');

  // Double-confirmation Delete Profile state
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setNameInput(state.identity.displayName);
    setHandleInput(state.identity.handle);
    setDeleteStep(0);
    setDeleteConfirmText('');
    const visit = markHubVisited('friends');
    if (visit.rewardText) {
      setNotice({ ok: true, text: `🎉 സന്ദർശന സമ്മാനം: ${visit.rewardText}` });
    }
    const card = createOriginLockedCardPayload({
      type: 'friend_card',
      userId: state.identity.userId,
      handle: state.identity.handle,
      name: state.identity.displayName || state.identity.handle,
      xp,
      completedLessons: completedLessonsCount,
      rank,
      verificationTier: state.identity.verificationTier,
      ledgerHead,
    });
    QRCode.toDataURL(card.code, { width: 180, margin: 1 })
      .then((url) => setMyCardQr(url))
      .catch(() => setMyCardQr(null));
  }, [
    isOpen,
    markHubVisited,
    state.identity.userId,
    state.identity.handle,
    state.identity.displayName,
    state.identity.verificationTier,
    xp,
    completedLessonsCount,
    rank,
    ledgerHead,
  ]);

  if (!isOpen) return null;

  const inviteUrl = createInviteLink(
    state.identity.userId,
    state.identity.displayName || state.identity.handle
  );

  const myMilestoneReturnCode =
    state.social.invitedByUserId && completedLessonsCount >= 3
      ? createSignedInviteMilestoneCode({
          inviterId: state.social.invitedByUserId,
          inviteeId: state.identity.userId,
          inviteeName: state.identity.displayName || state.identity.handle,
          completedCount: completedLessonsCount,
        })
      : null;

  const handleAddFriend = () => {
    sound.unlockAudio();
    const raw = friendInput.trim();
    // Accept either SKCARD1:... verified QR payload OR direct USR-SK-BX-XXXX ID
    if (raw.includes('SKCARD1:')) {
      const verified = verifyOriginLockedCardCode(raw);
      if (!verified.valid || !verified.payload) {
        sound.playError();
        setNotice({ ok: false, text: verified.error || 'വെരിഫൈഡ് കാർഡ് കോഡ് സാധുവല്ല.' });
        return;
      }
      const res = addVerifiedFriend({
        userId: verified.payload.userId,
        handle: verified.payload.handle,
        displayName: verified.payload.name,
        verificationTier: verified.payload.verificationTier,
      });
      if (res.ok) {
        sound.playUnlock();
        setFriendInput('');
        setFriendNameInput('');
      } else {
        sound.playError();
      }
      setNotice({ ok: res.ok, text: res.message });
      return;
    }

    if (!isValidUserId(raw)) {
      sound.playError();
      setNotice({
        ok: false,
        text: 'ശരിയായ USR-SK-B1-XXXX ഐഡിയോ SKCARD1: വെരിഫൈഡ് QR കോഡോ നൽകുക.',
      });
      return;
    }
    if (friendNameInput.trim() && containsAbusiveLanguage(friendNameInput)) {
      sound.playError();
      setNotice({ ok: false, text: 'മാന്യമായ പേര് നൽകുക (അനാവശ്യ വാക്കുകൾ അനുവദിക്കില്ല).' });
      return;
    }
    const cleanFriendName = sanitizeFinalPlayerText(friendNameInput, 40) || raw;
    const res = addVerifiedFriend({
      userId: raw,
      displayName: cleanFriendName,
    });
    if (res.ok) {
      sound.playUnlock();
      setFriendInput('');
      setFriendNameInput('');
    } else {
      sound.playError();
    }
    setNotice({ ok: res.ok, text: res.message });
  };

  const buildChatDeepLink = (friendUserId: string) => {
    const base = getDynamicBaseUrl();
    const qs = new URLSearchParams({
      chatWith: friendUserId,
      from: state.identity.userId,
      appId: 'APP-SK-GUIDE-01',
    });
    return `${base}?${qs.toString()}`;
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="സുഹൃത്തുക്കൾ, പ്രൊഫൈൽ & ഇക്കോസിസ്റ്റം"
    >
      <div className="max-w-2xl w-full max-h-[88vh] overflow-y-auto overscroll-contain my-auto rounded-3xl border-2 border-emerald-300 bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 px-5 py-4 text-white border-b-4 border-amber-400 flex items-center justify-between gap-3 sticky top-0 z-10">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-amber-300 font-mono">
              {state.identity.userId} · {state.identity.handle} · Batch {state.identity.batch}
            </p>
            <h2 className="text-base sm:text-lg font-black">
              വെരിഫൈഡ് സുഹൃത്തുക്കൾ, പ്രൊഫൈൽ &amp; ദർസ് ഹബ്
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
                className="underline text-xs cursor-pointer shrink-0"
              >
                ശരി
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setTab('friends')}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'friends' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>സുഹൃത്തുക്കൾ ({state.social.friends.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('profile')}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'profile' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>ഐഡി &amp; സുരക്ഷ</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('ecosystem')}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'ecosystem' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ദർസ് &amp; ആപ്പുകൾ</span>
            </button>
          </div>

          {/* TAB 1: VERIFIED FRIENDS LIST & INVITES */}
          {tab === 'friends' && (
            <div className="space-y-4">
              {/* My Shareable Friend ID Card with Color-Coded Profile QR Badge */}
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-800 text-white text-[11px] font-black">
                    🪪 പ്രൊഫൈൽ ഐഡി QR
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800">
                    സുഹൃത്തുക്കളെ ചേർക്കാനും സമ്മാനം സ്വീകരിക്കാനും ഇത് കാണിക്കാം
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {myCardQr && (
                    <img
                      src={myCardQr}
                      alt="എന്റെ പ്രൊഫൈൽ ഐഡി QR"
                      className="w-24 h-24 rounded-xl border border-emerald-300 bg-white p-1 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1 space-y-1.5 text-center sm:text-left">
                    <p className="text-xs font-black text-emerald-950">എന്റെ 4-ടയർ യൂസർ ഐഡി</p>
                    <p className="text-sm font-mono font-black text-emerald-800">{state.identity.userId}</p>
                    <p className="text-[11px] font-bold text-slate-600">
                      ഹാൻഡിൽ: {state.identity.handle} · വെരിഫിക്കേഷൻ ടയർ: {state.identity.verificationTier}/3
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await copyTextToClipboard(state.identity.userId);
                          if (ok) {
                            setCopiedId(true);
                            window.setTimeout(() => setCopiedId(false), 2000);
                          }
                        }}
                        className="inline-flex items-center gap-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId ? 'കോപ്പി ചെയ്തു' : 'ഐഡി കോപ്പി'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Verified Friend */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-700" />
                  <span>വെരിഫൈഡ് സുഹൃത്തിനെ ചേർക്കാം (B1–B4 ബാച്ചുകൾ)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={friendInput}
                    onChange={(e) => setFriendInput(e.target.value)}
                    placeholder="USR-SK-B1-XXXX അല്ലെങ്കിൽ SKCARD1:... കോഡ്"
                    className="min-h-[40px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900"
                  />
                  <input
                    type="text"
                    value={friendNameInput}
                    onChange={(e) => setFriendNameInput(e.target.value)}
                    placeholder="സുഹൃത്തിന്റെ പേര് (ഐച്ഛികം)"
                    className="min-h-[40px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddFriend}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black cursor-pointer"
                >
                  + സുഹൃത്തിനെ ചേർക്കാം
                </button>
              </div>

              {/* Friends List */}
              <div className="space-y-2">
                {state.social.friends.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-500 text-center py-4 bg-slate-50 rounded-2xl border border-slate-200">
                    ഇതുവരെ സുഹൃത്തുക്കളെ ചേർത്തിട്ടില്ല. മുകളിൽ സുഹൃത്തിന്റെ USR-SK-BX-XXXX ഐഡി നൽകൂ!
                  </p>
                ) : (
                  state.social.friends.map((f) => (
                    <div
                      key={f.userId}
                      className="rounded-2xl border border-slate-200 bg-white p-3 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <span>{f.displayName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                            {f.batch}
                          </span>
                        </p>
                        <p className="text-[11px] font-mono text-slate-500">
                          {f.userId} · {f.handle} · Tier {f.verificationTier}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={buildChatDeepLink(f.userId)}
                          onClick={(e) => {
                            e.preventDefault();
                            sound.playPop();
                            window.dispatchEvent(
                              new CustomEvent('skssf:open-chat-bridge', {
                                detail: { chatWith: f.userId, friendName: f.displayName },
                              })
                            );
                            setNotice({
                              ok: true,
                              text: `💬 ${f.displayName} (${f.userId}) — ചാറ്റ് ആപ്പ് ഡീപ്-ലിങ്ക് തയ്യാറാണ്! (?chatWith=${f.userId}&from=${state.identity.userId}&appId=APP-SK-GUIDE-01)`,
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>ചാറ്റ് ചെയ്യാം</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            const res = blockAndRemoveUser(f.userId);
                            setNotice({ ok: true, text: res.message });
                          }}
                          className="inline-flex items-center gap-1 min-h-[36px] px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-black cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5 shrink-0" />
                          <span>ബ്ലോക്ക് / നീക്കം</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Blocked Users Safety List */}
              {state.social.blockedUserIds.length > 0 && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3 space-y-2">
                  <p className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5 text-rose-600" />
                    <span>ബ്ലോക്ക് ചെയ്ത ഐഡികൾ ({state.social.blockedUserIds.length})</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {state.social.blockedUserIds.map((bid) => (
                      <button
                        key={bid}
                        type="button"
                        onClick={() => {
                          unblockUser(bid);
                          setNotice({ ok: true, text: `✅ ${bid} അൺബ്ലോക്ക് ചെയ്തു.` });
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-[11px] font-mono font-bold text-slate-700 hover:border-emerald-400 cursor-pointer"
                      >
                        <span>{bid}</span>
                        <RotateCcw className="w-3 h-3 text-emerald-700" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Friend Invite (+1 Diamond both after 3 lessons) */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-2.5">
                <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>💎 സുഹൃത്തിനെ ക്ഷണിക്കാം — ഇരുവർക്കും +1 വജ്രം!</span>
                </p>
                <p className="text-[11px] font-semibold text-slate-700">
                  നിങ്ങളുടെ ഇൻവൈറ്റ് ലിങ്ക് വഴി വരുന്ന സുഹൃത്ത് ആദ്യ 3 പാഠങ്ങൾ പൂർത്തിയാക്കി മൈൽസ്റ്റോൺ കോഡ് തിരികെ നൽകിയാൽ ഇരുവർക്കും +1 വജ്രം ലഭിക്കും.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyTextToClipboard(inviteUrl);
                      if (ok) {
                        setCopiedInvite(true);
                        window.setTimeout(() => setCopiedInvite(false), 2000);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
                  >
                    {copiedInvite ? '✅ ലിങ്ക് കോപ്പി ചെയ്തു' : '🔗 ഇൻവൈറ്റ് ലിങ്ക് കോപ്പി'}
                  </button>
                  <a
                    href={getWhatsAppShareHref(
                      `✨ SKSSF ഗൈഡ് ഗെയിമിൽ എന്നോടൊപ്പം ചേരൂ! ആദ്യ 3 പാഠങ്ങൾ പൂർത്തിയാക്കിയാൽ നമുക്ക് ഇരുവർക്കും +1 വജ്രം ബോണസ്:`,
                      inviteUrl
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-black"
                  >
                    WhatsApp ഇൻവൈറ്റ്
                  </a>
                </div>

                {myMilestoneReturnCode && (
                  <div className="rounded-xl bg-white border border-emerald-300 p-2.5 space-y-1">
                    <p className="text-[11px] font-black text-emerald-950">
                      🎉 നിങ്ങൾ 3 പാഠങ്ങൾ പൂർത്തിയാക്കി! നിങ്ങളെ ക്ഷണിച്ച {state.social.invitedByUserId}-ന് ഈ കോഡ് അയച്ചുനൽകൂ:
                    </p>
                    <p className="text-[10px] font-mono bg-slate-100 p-1.5 rounded break-all">
                      {myMilestoneReturnCode}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    placeholder="സുഹൃത്ത് അയച്ച SKINV3:... മൈൽസ്റ്റോൺ കോഡ്"
                    className="flex-1 min-h-[38px] px-3 rounded-xl border border-amber-300 bg-white text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const res = redeemFriendInviteMilestone(inviteCodeInput);
                      if (res.ok) {
                        sound.playUnlock();
                        setInviteCodeInput('');
                      } else {
                        sound.playError();
                      }
                      setNotice({ ok: res.ok, text: res.message });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-black cursor-pointer shrink-0"
                  >
                    +1 💎 ക്ലെയിം
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ZERO-FRICTION IDENTITY, RENAME PASS, MASTER PROFILE & DELETE */}
          {tab === 'profile' && (
            <div className="space-y-4">
              {/* Name & Handle */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <p className="text-xs font-black text-slate-900">
                  🪪 പേരും യൂസർനെയിമും (1 സൗജന്യ തിരുത്തൽ → ശേഷം 10 💎 നെയിം ചേഞ്ച് കാർഡ്)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      രജിസ്റ്റർ ചെയ്ത പേര്{' '}
                      {state.identity.nameLocked
                        ? '🔒 (ലോക്കാണ് — മാറ്റാൻ 10 💎)'
                        : state.identity.displayName
                        ? '⚠️ (1 സൗജന്യ തിരുത്തൽ ബാക്കി)'
                        : '(ആദ്യ രജിസ്ട്രേഷൻ)'}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        maxLength={40}
                        placeholder="നിങ്ങളുടെ പേര്"
                        className="flex-1 min-h-[40px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const res = updateDisplayNameWithRules(
                            nameInput,
                            state.identity.nameLocked
                          );
                          if (res.ok) {
                            sound.playUnlock();
                            onSyncExternalProfileName(nameInput.trim());
                          } else {
                            sound.playError();
                          }
                          setNotice({ ok: res.ok, text: res.message });
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-black cursor-pointer shrink-0"
                      >
                        {state.identity.nameLocked ? '10 💎 മാറ്റാം' : 'സേവ്'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      യൂണീക്ക് യൂസർനെയിം (@handle)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                        maxLength={22}
                        placeholder="@learner_sk26"
                        className="flex-1 min-h-[40px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const res = updateHandle(handleInput);
                          setNotice({ ok: res.ok, text: res.message });
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-black cursor-pointer shrink-0"
                      >
                        സേവ്
                      </button>
                    </div>
                  </div>
                </div>

                {state.identity.nameHistory.length > 0 && (
                  <div className="rounded-xl bg-white border border-slate-200 p-2.5 space-y-1">
                    <p className="text-[11px] font-black text-slate-700">
                      📜 പേര് മാറ്റ ചരിത്രം (Hash Chain Name History):
                    </p>
                    {state.identity.nameHistory.map((h, i) => (
                      <p key={i} className="text-[11px] text-slate-600">
                        {h.oldName} → <span className="font-bold text-emerald-900">{h.newName}</span> (
                        {h.method === 'rename_pass_10d' ? '10 💎 നെയിം കാർഡ്' : 'സൗജന്യ തിരുത്തൽ'})
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Master Profile Link & 4-Tier Entity IDs (INS / ORG / APP-SK-PROFILE-00) */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5">
                <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-emerald-700" />
                  <span>മാസ്റ്റർ പ്രൊഫൈൽ ബ്രിഡ്ജ് (APP-SK-PROFILE-00) &amp; മൾട്ടി-ബാച്ച് സിങ്ക്</span>
                </p>
                <p className="text-[11px] text-slate-700">
                  ഷാർഡ്: <span className="font-mono font-bold">{ecosystemSyncAdapter.resolveShardName(state.identity.batch)}</span> · മോഡ്: 100% ഓഫ്‌ലൈൻ-ഫസ്റ്റ് (Supabase Ready)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={insIdInput}
                    onChange={(e) => setInsIdInput(e.target.value.toUpperCase())}
                    placeholder="സ്ഥാപനം: INS-SK-XXXX"
                    className="min-h-[38px] px-3 rounded-xl border border-emerald-300 bg-white text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={orgIdInput}
                    onChange={(e) => setOrgIdInput(e.target.value.toUpperCase())}
                    placeholder="യൂണിറ്റ്/സംഘടന: ORG-SK-XXXX"
                    className="min-h-[38px] px-3 rounded-xl border border-emerald-300 bg-white text-xs font-mono"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="ഐച്ഛിക 4-അക്ക PIN"
                    className="min-h-[38px] px-3 rounded-xl border border-emerald-300 bg-white text-xs font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const res = configureMasterProfileLink({
                      institutionId: insIdInput || undefined,
                      organizationId: orgIdInput || undefined,
                      pin4: pinInput || undefined,
                    });
                    setNotice({ ok: res.ok, text: res.message });
                    if (res.ok) setPinInput('');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black cursor-pointer"
                >
                  🔗 മാസ്റ്റർ പ്രൊഫൈൽ ലിങ്ക് സേവ് ചെയ്യുക
                </button>
              </div>

              {/* Web-of-Trust Verification (Zero Aadhaar / Govt IDs) */}
              <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 space-y-2">
                <p className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-700" />
                  <span>വെബ്-ഓഫ്-ട്രസ്റ്റ് വെരിഫിക്കേഷൻ (ടയർ {state.identity.verificationTier}/3 · ആധാർ/സർക്കാർ രേഖകൾ ആവശ്യമില്ല)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={attestIdInput}
                    onChange={(e) => setAttestIdInput(e.target.value.toUpperCase())}
                    placeholder="സാക്ഷ്യപ്പെടുത്തുന്ന ORG-SK-XXXX / USR-SK-..."
                    className="min-h-[38px] px-3 rounded-xl border border-sky-300 bg-white text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={attestNameInput}
                    onChange={(e) => setAttestNameInput(e.target.value)}
                    placeholder="യൂണിറ്റ് / പണ്ഡിതന്റെ പേര്"
                    className="min-h-[38px] px-3 rounded-xl border border-sky-300 bg-white text-xs font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const res = grantWebOfTrustAttestation(attestIdInput, attestNameInput);
                    setNotice({ ok: res.ok, text: res.message });
                    if (res.ok) {
                      setAttestIdInput('');
                      setAttestNameInput('');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-700 text-white text-xs font-black cursor-pointer"
                >
                  അറ്റസ്റ്റേഷൻ രേഖപ്പെടുത്തുക
                </button>
              </div>

              {/* Delete Profile & Reset with Double Confirmation */}
              <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/70 p-4 space-y-2.5">
                <p className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>🗑️ പ്രൊഫൈൽ ഡിലീറ്റ് ചെയ്യുക (Delete Profile &amp; Reset)</span>
                </p>
                {deleteStep === 0 && (
                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer"
                  >
                    🗑️ പ്രൊഫൈൽ ഡിലീറ്റ് ചെയ്യുക
                  </button>
                )}
                {deleteStep === 1 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-rose-900">
                      ⚠️ മുന്നറിയിപ്പ് (ഘട്ടം 1/2): നിങ്ങളുടെ എല്ലാ നാണയങ്ങളും വജ്രങ്ങളും ഹാഷ് ചെയിൻ ലെഡ്ജറും പാഠപുരോഗതിയും പൂർണ്ണമായി മായ്ക്കപ്പെടും! തുടരണോ?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteStep(2)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-700 text-white text-xs font-black cursor-pointer"
                      >
                        അതെ, രണ്ടാം സ്ഥിരീകരണത്തിലേക്ക്
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteStep(0)}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        വേണ്ട, റദ്ദാക്കുക
                      </button>
                    </div>
                  </div>
                )}
                {deleteStep === 2 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-rose-950">
                      ⚠️ അന്തിമ സ്ഥിരീകരണം (ഘട്ടം 2/2): സ്ഥിരീകരിക്കാൻ താഴെ <span className="font-mono font-black">DELETE</span> എന്ന് ടൈപ്പ് ചെയ്യുക.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE എന്ന് ടൈപ്പ് ചെയ്യുക"
                        className="flex-1 min-h-[38px] px-3 rounded-xl border border-rose-400 bg-white text-xs font-mono font-bold"
                      />
                      <button
                        type="button"
                        disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                        onClick={() => {
                          onDeleteAllProfileData();
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-700 text-white text-xs font-black cursor-pointer disabled:opacity-40"
                      >
                        പൂർണ്ണമായി ഡിലീറ്റ് ചെയ്യുക
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUTHORIZED ECOSYSTEM APPS & DARS KITAB SOCKET (APP-SK-DARS-05) */}
          {tab === 'ecosystem' && (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-black text-amber-300">
                    APP-SK-DARS-05 · BIDIRECTIONAL SYNC SOCKET
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-700 text-emerald-100 font-bold">
                    Whitelist Verified
                  </span>
                </div>
                <h3 className="text-base font-black">📚 ദർസ് കിതാബ് ഇക്കോസിസ്റ്റം (Dars &amp; Kitab Academy)</h3>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  നിങ്ങളുടെ <span className="font-mono font-bold text-amber-300">{state.identity.userId}</span> ഐഡിയും നാണയ വാലറ്റും ലൈഫ്‌ലൈനുകളും ദർസ് കിതാബ് ഗെയിമുമായി സുരക്ഷിതമായി ബന്ധിപ്പിക്കാം.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {AUTHORIZED_APP_REGISTRY['APP-SK-DARS-05'].kitabs?.map((k) => (
                    <div
                      key={k.arabic}
                      className="rounded-xl bg-white/10 border border-white/15 p-2.5 text-center space-y-0.5"
                    >
                      <p className="text-base font-black text-amber-300" dir="rtl">
                        {k.arabic}
                      </p>
                      <p className="text-xs font-extrabold text-white">{k.malayalam}</p>
                      <p className="text-[10px] text-emerald-200">{k.subject}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playUnlock();
                    const res = connectAuthorizedApp('APP-SK-DARS-05');
                    setNotice({ ok: res.ok, text: `${res.message} (ദർസ് പൈതൃക കാർഡും അൺലോക്കായി!)` });
                  }}
                  className="w-full min-h-[40px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
                >
                  {state.identity.linkedApps['APP-SK-DARS-05']
                    ? '✅ APP-SK-DARS-05 സോക്കറ്റ് സജീവമാണ് (പുതുക്കാം)'
                    : '🔗 ദർസ് കിതാബ് സോക്കറ്റ് ബന്ധിപ്പിക്കുക'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(AUTHORIZED_APP_REGISTRY) as AuthorizedAppId[]).map((appId) => {
                  const meta = AUTHORIZED_APP_REGISTRY[appId];
                  const connected = Boolean(state.identity.linkedApps[appId]);
                  return (
                    <div
                      key={appId}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-black text-emerald-800">
                          {appId}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            connected
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {connected ? 'സജീവം' : 'സോക്കറ്റ് തയ്യാർ'}
                        </span>
                      </div>
                      <p className="text-xs font-black text-slate-900">{meta.nameMl}</p>
                      <p className="text-[11px] text-slate-600 leading-snug">{meta.descriptionMl}</p>
                      {!connected && (
                        <button
                          type="button"
                          onClick={() => {
                            const res = connectAuthorizedApp(appId);
                            setNotice({ ok: res.ok, text: res.message });
                          }}
                          className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                        >
                          സോക്കറ്റ് ബന്ധിപ്പിക്കാം
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Hidden / Extensible Bottom #ecosystem-chat-dock Plugin Slot.
 * Strictly validates every incoming message via verifyChatDockPluginMessage()
 * so ONLY widgets cryptographically signed by APP-SK-CHAT-04 can render here.
 */
export const EcosystemChatDockSlot: React.FC = () => {
  const { state } = useEcosystem();
  const [verifiedMessages, setVerifiedMessages] = useState<ChatDockWidgetMessage[]>([]);
  const [bridgeBanner, setBridgeBanner] = useState<{ chatWith: string; friendName?: string } | null>(
    null
  );

  useEffect(() => {
    const handlePostMessage = (ev: MessageEvent) => {
      if (!ev.data || typeof ev.data !== 'object') return;
      if ((ev.data as { channel?: string }).channel !== 'SKSSF_CHAT_DOCK_V1') return;
      const check = verifyChatDockPluginMessage((ev.data as { payload?: unknown }).payload);
      if (check.valid && check.data) {
        setVerifiedMessages((prev) => [check.data!, ...prev].slice(0, 3));
      }
    };
    const handleBridge = (ev: Event) => {
      const detail = (ev as CustomEvent<{ chatWith: string; friendName?: string }>).detail;
      if (detail?.chatWith) setBridgeBanner(detail);
    };
    window.addEventListener('message', handlePostMessage);
    window.addEventListener('skssf:open-chat-bridge', handleBridge);
    return () => {
      window.removeEventListener('message', handlePostMessage);
      window.removeEventListener('skssf:open-chat-bridge', handleBridge);
    };
  }, []);

  return (
    <div
      id="ecosystem-chat-dock"
      data-authorized-app="APP-SK-CHAT-04"
      data-user-id={state.identity.userId}
      className={
        bridgeBanner || verifiedMessages.length > 0
          ? 'fixed bottom-16 left-3 z-40 max-w-xs w-[calc(100vw-24px)] rounded-2xl border-2 border-emerald-400 bg-white shadow-xl p-3 space-y-2'
          : 'sr-only'
      }
    >
      {bridgeBanner && (
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs space-y-0.5">
            <p className="font-black text-emerald-950 flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>APP-SK-CHAT-04 ചാറ്റ് ബ്രിഡ്ജ്</span>
            </p>
            <p className="text-[11px] font-semibold text-slate-700">
              {bridgeBanner.friendName || bridgeBanner.chatWith} എന്ന വെരിഫൈഡ് സുഹൃത്തുമായുള്ള ചാറ്റ് സോക്കറ്റ് സജീവമാണ്.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBridgeBanner(null)}
            aria-label="അടയ്ക്കുക"
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {verifiedMessages.map((m, idx) => (
        <div key={idx} className="rounded-xl bg-emerald-50 border border-emerald-200 p-2 text-xs">
          <p className="font-black text-emerald-900">{m.fromUserId}</p>
          <p className="text-slate-700">{m.previewText}</p>
        </div>
      ))}
    </div>
  );
};
