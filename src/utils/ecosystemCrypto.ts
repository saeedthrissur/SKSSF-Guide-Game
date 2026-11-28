/**
 * SKSSF Guide Game — Ecosystem Cryptography, 4-Tier Entity ID Hierarchy,
 * Anti-Slot-Injection Whitelist & Origin-Locked Signed Payloads.
 *
 * Host-agnostic: dynamically binds signatures to `window.location.origin`
 * so the app migrates cleanly across Codeberg, GitLab, IPFS, 4EVERLAND, or Fleek.
 */

export type EntityTier = 'USR' | 'APP' | 'INS' | 'ORG';
export type UserBatchId = 'B1' | 'B2' | 'B3' | 'B4';

export type AuthorizedAppId =
  | 'APP-SK-GUIDE-01'
  | 'APP-SK-MAHALLU-02'
  | 'APP-SK-TAJDEED-03'
  | 'APP-SK-CHAT-04'
  | 'APP-SK-DARS-05'
  | 'APP-SK-PROFILE-00';

export interface AuthorizedAppMeta {
  appId: AuthorizedAppId;
  nameEn: string;
  nameMl: string;
  category: 'core' | 'education' | 'community' | 'chat' | 'profile';
  descriptionMl: string;
  kitabs?: { arabic: string; malayalam: string; subject: string }[];
  allowedSlots: ('customCurrencies' | 'assetSlots' | 'chatDock' | 'profileBridge' | 'lifelines')[];
  verificationKeyFingerprint: string;
  status: 'active' | 'socket_ready';
}

/**
 * Authorized SKSSF / Samastha Ecosystem Application Registry.
 * External plugins, custom currencies, asset slots, and #ecosystem-chat-dock widgets
 * are ONLY accepted when signed with a verified key from this whitelist.
 */
export const AUTHORIZED_APP_REGISTRY: Record<AuthorizedAppId, AuthorizedAppMeta> = {
  'APP-SK-GUIDE-01': {
    appId: 'APP-SK-GUIDE-01',
    nameEn: 'SKSSF Guide Game',
    nameMl: 'SKSSF ഗൈഡ് ഗെയിം',
    category: 'core',
    descriptionMl: '62 പാഠങ്ങളും ഗെയിമുകളും ക്വിസ്സുകളും ഉൾപ്പെടുന്ന പ്രധാന പഠന പോർട്ടൽ.',
    allowedSlots: ['customCurrencies', 'assetSlots', 'profileBridge', 'lifelines'],
    verificationKeyFingerprint: 'SK-PUB-GUIDE-01-V1-89A4C2',
    status: 'active',
  },
  'APP-SK-MAHALLU-02': {
    appId: 'APP-SK-MAHALLU-02',
    nameEn: 'Mahallu Connect',
    nameMl: 'മഹല്ല് കണക്ട്',
    category: 'community',
    descriptionMl: 'മഹല്ല്-യൂണിറ്റ് സേവനങ്ങളും കൂട്ടായ്മകളും ബന്ധിപ്പിക്കുന്ന ഇക്കോസിസ്റ്റം ആപ്പ്.',
    allowedSlots: ['customCurrencies', 'assetSlots', 'profileBridge'],
    verificationKeyFingerprint: 'SK-PUB-MAHALLU-02-V1-41D7E9',
    status: 'socket_ready',
  },
  'APP-SK-TAJDEED-03': {
    appId: 'APP-SK-TAJDEED-03',
    nameEn: 'Tajdeed Learning',
    nameMl: 'തജ്ദീദ് വിജ്ഞാന വേദി',
    category: 'education',
    descriptionMl: 'തജ്ദീദ് ആദർശ പഠന പരമ്പരകളും സെമിനാർ ക്വിസ്സുകളും.',
    allowedSlots: ['customCurrencies', 'assetSlots', 'lifelines'],
    verificationKeyFingerprint: 'SK-PUB-TAJDEED-03-V1-63F0B5',
    status: 'socket_ready',
  },
  'APP-SK-CHAT-04': {
    appId: 'APP-SK-CHAT-04',
    nameEn: 'SKSSF Verified Chat',
    nameMl: 'വെരിഫൈഡ് പഠന ചാറ്റ്',
    category: 'chat',
    descriptionMl: 'വെരിഫൈഡ് സുഹൃത്തുക്കളുമായി സുരക്ഷിതമായി സംവദിക്കുന്ന #ecosystem-chat-dock പ്ലഗിൻ.',
    allowedSlots: ['chatDock', 'profileBridge'],
    verificationKeyFingerprint: 'SK-PUB-CHAT-04-V1-92C8A1',
    status: 'socket_ready',
  },
  'APP-SK-DARS-05': {
    appId: 'APP-SK-DARS-05',
    nameEn: 'Dars & Kitab Academy',
    nameMl: 'ദർസ് കിതാബ് വിജ്ഞാന ഗെയിം',
    category: 'education',
    descriptionMl:
      'ഫത്ഹുൽ മുഈൻ, അൽഫിയ്യ ഇബ്നു മാലിക് തുടങ്ങിയ ക്ലാസിക് ദർസ് കിതാബുകളുടെ പഠന-ചാലഞ്ച് സോക്കറ്റ്.',
    kitabs: [
      { arabic: 'فَتْحُ الْمُعِينْ', malayalam: 'ഫത്ഹുൽ മുഈൻ', subject: 'ഫിഖ്ഹ് (കർമ്മശാസ്ത്രം)' },
      { arabic: 'أَلْفِيَّةُ ابْنِ مَالِكْ', malayalam: 'അൽഫിയ്യ ഇബ്നു മാലിക്', subject: 'നഹ്‌വ് (അറബി വ്യാകരണം)' },
      { arabic: 'كُتُبُ الدَّرْسِ', malayalam: 'ക്ലാസിക് ദർസ് കിതാബുകൾ', subject: 'തഫ്സീർ · ഹദീസ് · ഉസൂൽ' },
    ],
    allowedSlots: ['customCurrencies', 'assetSlots', 'lifelines', 'profileBridge'],
    verificationKeyFingerprint: 'SK-PUB-DARS-05-V1-77E3D4',
    status: 'socket_ready',
  },
  'APP-SK-PROFILE-00': {
    appId: 'APP-SK-PROFILE-00',
    nameEn: 'Master Profile Hub',
    nameMl: 'മാസ്റ്റർ പ്രൊഫൈൽ ഹബ്',
    category: 'profile',
    descriptionMl: 'USR / INS / ORG ഐഡികളും ബാഡ്ജുകളും ക്രോസ്-ആപ്പ് സിങ്ക് ചെയ്യുന്ന കേന്ദ്ര പ്രൊഫൈൽ.',
    allowedSlots: ['profileBridge', 'assetSlots'],
    verificationKeyFingerprint: 'SK-PUB-PROFILE-00-V1-55B9F2',
    status: 'socket_ready',
  },
};

/**
 * Cryptographic whitelist mapping Authorized App IDs to their public verification tags.
 * Any external script or rogue app missing a matching whitelist entry & HMAC signature is blocked.
 */
export const AUTHORIZED_APP_KEYS: Readonly<Record<AuthorizedAppId, string>> = Object.freeze({
  'APP-SK-GUIDE-01': AUTHORIZED_APP_REGISTRY['APP-SK-GUIDE-01'].verificationKeyFingerprint,
  'APP-SK-MAHALLU-02': AUTHORIZED_APP_REGISTRY['APP-SK-MAHALLU-02'].verificationKeyFingerprint,
  'APP-SK-TAJDEED-03': AUTHORIZED_APP_REGISTRY['APP-SK-TAJDEED-03'].verificationKeyFingerprint,
  'APP-SK-CHAT-04': AUTHORIZED_APP_REGISTRY['APP-SK-CHAT-04'].verificationKeyFingerprint,
  'APP-SK-DARS-05': AUTHORIZED_APP_REGISTRY['APP-SK-DARS-05'].verificationKeyFingerprint,
  'APP-SK-PROFILE-00': AUTHORIZED_APP_REGISTRY['APP-SK-PROFILE-00'].verificationKeyFingerprint,
});

export function isAuthorizedAppId(value: string): value is AuthorizedAppId {
  return Object.prototype.hasOwnProperty.call(AUTHORIZED_APP_KEYS, value);
}

// ==================== HOST-AGNOSTIC ORIGIN HELPERS ====================

export function getDynamicOrigin(): string {
  if (typeof window === 'undefined' || !window.location) return 'local-offline';
  return window.location.origin || 'local-offline';
}

export function getDynamicBaseUrl(): string {
  if (typeof window === 'undefined' || !window.location) return '';
  const cleanPath = window.location.pathname.replace(/\/lesson\/[^/]+\/?$/i, '/');
  return `${window.location.origin}${cleanPath}`;
}

export function isSafeHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

// ==================== PURE-JS SHA-256 & HMAC-SHA256 ====================
// Works identically offline, on HTTP localhost, IPFS gateways, and HTTPS origins.

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function sha256Bytes(data: Uint8Array): Uint8Array {
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const bitLen = data.length * 8;
  const paddedLen = Math.ceil((data.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(data);
  padded[data.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const w = new Uint32Array(64);

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function sha256Hex(message: string): string {
  return bytesToHex(sha256Bytes(new TextEncoder().encode(message)));
}

export function hmacSha256Hex(key: string, message: string): string {
  const enc = new TextEncoder();
  let keyBytes: Uint8Array = enc.encode(key);
  if (keyBytes.length > 64) {
    keyBytes = sha256Bytes(keyBytes);
  }
  const block = new Uint8Array(64);
  block.set(keyBytes);
  const oPad = new Uint8Array(64);
  const iPad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    oPad[i] = block[i] ^ 0x5c;
    iPad[i] = block[i] ^ 0x36;
  }
  const msgBytes = enc.encode(message);
  const inner = new Uint8Array(64 + msgBytes.length);
  inner.set(iPad, 0);
  inner.set(msgBytes, 64);
  const innerHash = sha256Bytes(inner);

  const outer = new Uint8Array(64 + 32);
  outer.set(oPad, 0);
  outer.set(innerHash, 64);
  return bytesToHex(sha256Bytes(outer));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function deriveDomainSigningKey(appId: AuthorizedAppId, origin = getDynamicOrigin()): string {
  return `SKSSF-ECO-V1::${appId}::${AUTHORIZED_APP_KEYS[appId]}::${origin}`;
}

export function encodeBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeBase64Url(encoded: string): string | null {
  try {
    const norm = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = norm.length % 4 === 0 ? '' : '='.repeat(4 - (norm.length % 4));
    const binary = atob(norm + pad);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

// ==================== 4-TIER ENTITY ID GENERATORS & VALIDATORS ====================

const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomToken(len: number): string {
  const buf = new Uint8Array(len);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < len; i++) {
      buf[i] = Math.floor(Math.random() * 256);
    }
  }
  let out = '';
  for (let i = 0; i < len; i++) {
    out += ID_ALPHABET[buf[i] % ID_ALPHABET.length];
  }
  return out;
}

export function generateUserId(batch: UserBatchId = 'B1'): string {
  return `USR-SK-${batch}-${randomToken(4)}`;
}

export function generateInstitutionId(): string {
  return `INS-SK-${randomToken(4)}`;
}

export function generateOrganizationId(): string {
  return `ORG-SK-${randomToken(4)}`;
}

export function isValidUserId(id: string): boolean {
  return /^USR-SK-B[1-4]-[A-Z0-9]{4,8}$/.test(id.trim().toUpperCase());
}

export function isValidInstitutionId(id: string): boolean {
  return /^INS-SK-[A-Z0-9]{4,10}$/.test(id.trim().toUpperCase());
}

export function isValidOrganizationId(id: string): boolean {
  return /^ORG-SK-[A-Z0-9]{4,10}$/.test(id.trim().toUpperCase());
}

export function getUserBatchFromId(userId: string): UserBatchId {
  const match = userId.trim().toUpperCase().match(/^USR-SK-(B[1-4])-/);
  return (match?.[1] as UserBatchId) ?? 'B1';
}

export function detectEntityTier(id: string): EntityTier | null {
  const upper = id.trim().toUpperCase();
  if (isValidUserId(upper)) return 'USR';
  if (isAuthorizedAppId(upper)) return 'APP';
  if (isValidInstitutionId(upper)) return 'INS';
  if (isValidOrganizationId(upper)) return 'ORG';
  return null;
}

export function generateSuggestedHandle(displayName?: string): string {
  const slug = (displayName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10);
  const suffix = randomToken(4).toLowerCase();
  return `@${slug.length >= 3 ? slug : 'learner'}_${suffix}`;
}

export function sanitizeHandle(raw: string): string {
  const clean = raw
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);
  return clean.length >= 3 ? `@${clean}` : '';
}

// ==================== ANTI-SLOT-INJECTION VERIFICATION ====================

export function signAuthorizedAppPayload(
  appId: AuthorizedAppId,
  payloadJson: string,
  origin = getDynamicOrigin()
): string {
  return hmacSha256Hex(deriveDomainSigningKey(appId, origin), payloadJson).slice(0, 32);
}

export function verifyAuthorizedAppSignature(
  appId: string,
  payloadJson: string,
  signature: string,
  allowedSlot?: AuthorizedAppMeta['allowedSlots'][number],
  origin = getDynamicOrigin()
): { valid: boolean; reason?: string } {
  if (!isAuthorizedAppId(appId)) {
    return { valid: false, reason: 'അനധികൃത ആപ്പ് ഐഡി (Unauthorized App ID) — ബ്ലോക്ക് ചെയ്തു.' };
  }
  const meta = AUTHORIZED_APP_REGISTRY[appId];
  if (allowedSlot && !meta.allowedSlots.includes(allowedSlot)) {
    return { valid: false, reason: `${appId} എന്ന ആപ്പിന് ഈ സ്ലോട്ടിലേക്ക് അനുമതിയില്ല.` };
  }
  const expected = signAuthorizedAppPayload(appId, payloadJson, origin);
  if (!constantTimeEqual(expected, signature.trim())) {
    return { valid: false, reason: 'ക്രിപ്റ്റോഗ്രാഫിക് സിഗ്നേച്ചർ പൊരുത്തപ്പെടുന്നില്ല (Tampered Payload).' };
  }
  return { valid: true };
}

export interface ChatDockWidgetMessage {
  appId: string;
  widgetType: 'quick_ping' | 'study_room_invite' | 'peer_message_badge';
  fromUserId: string;
  toUserId: string;
  previewText: string;
  ts: number;
  sig: string;
}

export function verifyChatDockPluginMessage(
  msg: unknown
): { valid: boolean; data?: ChatDockWidgetMessage; reason?: string } {
  if (!msg || typeof msg !== 'object' || Array.isArray(msg)) {
    return { valid: false, reason: 'Invalid plugin packet' };
  }
  const m = msg as Partial<ChatDockWidgetMessage>;
  if (m.appId !== 'APP-SK-CHAT-04') {
    return { valid: false, reason: 'Only APP-SK-CHAT-04 signed widgets are allowed in #ecosystem-chat-dock.' };
  }
  if (
    !m.fromUserId ||
    !m.toUserId ||
    !isValidUserId(m.fromUserId) ||
    !isValidUserId(m.toUserId) ||
    typeof m.previewText !== 'string' ||
    typeof m.ts !== 'number' ||
    typeof m.sig !== 'string'
  ) {
    return { valid: false, reason: 'Incomplete chat widget packet' };
  }
  const canonical = JSON.stringify({
    appId: m.appId,
    widgetType: m.widgetType,
    fromUserId: m.fromUserId,
    toUserId: m.toUserId,
    previewText: m.previewText.slice(0, 120),
    ts: m.ts,
  });
  const check = verifyAuthorizedAppSignature(m.appId, canonical, m.sig, 'chatDock');
  if (!check.valid) return check;
  return { valid: true, data: m as ChatDockWidgetMessage };
}

// ==================== RECIPIENT-LOCKED GIFT VOUCHERS & LESSON GIFTS ====================

export type GiftKind = 'silver' | 'gold' | 'diamond' | 'lesson_unlock';

export interface SignedGiftVoucher {
  v: 1;
  appId: AuthorizedAppId;
  giftId: string;
  kind: GiftKind;
  amount: number;
  lessonId?: string;
  lessonTitle?: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  note?: string;
  origin: string;
  issuedAt: number;
  sig: string;
}

export function createSignedGiftVoucher(params: {
  kind: GiftKind;
  amount: number;
  lessonId?: string;
  lessonTitle?: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  note?: string;
}): { voucher: SignedGiftVoucher; code: string; url: string } {
  const origin = getDynamicOrigin();
  const body = {
    v: 1 as const,
    appId: 'APP-SK-GUIDE-01' as const,
    giftId: `GFT-${randomToken(8)}`,
    kind: params.kind,
    amount: Math.max(1, Math.round(params.amount)),
    ...(params.lessonId ? { lessonId: params.lessonId.slice(0, 60) } : {}),
    ...(params.lessonTitle ? { lessonTitle: params.lessonTitle.slice(0, 80) } : {}),
    fromUserId: params.fromUserId.trim().toUpperCase(),
    fromName: params.fromName.trim().slice(0, 40) || 'SKSSF സുഹൃത്ത്',
    toUserId: params.toUserId.trim().toUpperCase(),
    ...(params.note ? { note: params.note.trim().slice(0, 90) } : {}),
    origin,
    issuedAt: Date.now(),
  };
  const sig = signAuthorizedAppPayload('APP-SK-GUIDE-01', JSON.stringify(body), origin);
  const voucher: SignedGiftVoucher = { ...body, sig };
  const token = encodeBase64Url(JSON.stringify(voucher));
  const code = `SKGIFT1:${token}`;
  const base = getDynamicBaseUrl();
  const url = base ? `${base}?gift=${encodeURIComponent(code)}` : code;
  return { voucher, code, url };
}

export function verifySignedGiftVoucher(
  rawInput: string,
  currentUserId: string
): { valid: boolean; voucher?: SignedGiftVoucher; error?: string } {
  const trimmed = rawInput.trim();
  const match = trimmed.match(/SKGIFT1:[A-Za-z0-9_-]+/);
  if (!match) {
    return { valid: false, error: 'സാധുവായ SKGIFT1: സമ്മാന കോഡ് കണ്ടെത്തിയില്ല.' };
  }
  const json = decodeBase64Url(match[0].slice('SKGIFT1:'.length));
  if (!json) {
    return { valid: false, error: 'സമ്മാന കോഡ് വായിക്കാൻ കഴിഞ്ഞില്ല.' };
  }
  try {
    const parsed = JSON.parse(json) as Partial<SignedGiftVoucher>;
    if (
      parsed.v !== 1 ||
      parsed.appId !== 'APP-SK-GUIDE-01' ||
      !parsed.giftId ||
      !parsed.fromUserId ||
      !parsed.toUserId ||
      !parsed.origin ||
      !parsed.sig ||
      typeof parsed.amount !== 'number'
    ) {
      return { valid: false, error: 'സമ്മാന ഡാറ്റ അപൂർണ്ണമാണ്.' };
    }
    const { sig, ...unsigned } = parsed;
    const check = verifyAuthorizedAppSignature(
      parsed.appId,
      JSON.stringify(unsigned),
      sig,
      undefined,
      parsed.origin
    );
    if (!check.valid) {
      return { valid: false, error: 'വ്യാജമോ തിരുത്തിയതോ ആയ സമ്മാന വൗച്ചർ — നിരസിച്ചു!' };
    }
    if (parsed.toUserId.toUpperCase() !== currentUserId.trim().toUpperCase()) {
      return {
        valid: false,
        error: `ഈ സമ്മാനം ${parsed.toUserId} എന്ന ഐഡിക്ക് മാത്രമുള്ളതാണ് (നിങ്ങളുടെ ഐഡി: ${currentUserId}).`,
      };
    }
    if (parsed.fromUserId.toUpperCase() === currentUserId.trim().toUpperCase()) {
      return {
        valid: false,
        error: 'സ്വന്തം സമ്മാന വൗച്ചർ സ്വയം ക്ലെയിം ചെയ്യാൻ കഴിയില്ല.',
      };
    }
    return { valid: true, voucher: parsed as SignedGiftVoucher };
  } catch {
    return { valid: false, error: 'സമ്മാന വൗച്ചർ ഫോർമാറ്റ് തെറ്റാണ്.' };
  }
}

// ==================== SIGNED 2-PLAYER DUEL LINKS ====================

export interface SignedDuelChallenge {
  v: 1;
  duelId: string;
  challengerId: string;
  challengerName: string;
  challengerScore: number;
  challengerTimeSec: number;
  questionIds: string[];
  origin: string;
  createdAt: number;
  sig: string;
}

export function createSignedDuelLink(params: {
  challengerId: string;
  challengerName: string;
  challengerScore: number;
  challengerTimeSec: number;
  questionIds: string[];
}): { duel: SignedDuelChallenge; code: string; url: string } {
  const origin = getDynamicOrigin();
  const body = {
    v: 1 as const,
    duelId: `DL-${randomToken(6)}`,
    challengerId: params.challengerId.toUpperCase(),
    challengerName: params.challengerName.slice(0, 40) || 'SKSSF സുഹൃത്ത്',
    challengerScore: Math.max(0, Math.min(5, Math.round(params.challengerScore))),
    challengerTimeSec: Math.max(1, Math.min(600, Math.round(params.challengerTimeSec))),
    questionIds: params.questionIds.slice(0, 5),
    origin,
    createdAt: Date.now(),
  };
  const sig = signAuthorizedAppPayload('APP-SK-GUIDE-01', JSON.stringify(body), origin);
  const duel: SignedDuelChallenge = { ...body, sig };
  const code = `SKDUEL1:${encodeBase64Url(JSON.stringify(duel))}`;
  const base = getDynamicBaseUrl();
  const url = base ? `${base}?duel=${encodeURIComponent(code)}` : code;
  return { duel, code, url };
}

export function verifySignedDuelPayload(
  rawInput: string
): { valid: boolean; duel?: SignedDuelChallenge; error?: string } {
  const match = rawInput.trim().match(/SKDUEL1:[A-Za-z0-9_-]+/);
  if (!match) return { valid: false, error: 'സാധുവായ മത്സര കോഡ് (SKDUEL1:) അല്ല.' };
  const json = decodeBase64Url(match[0].slice('SKDUEL1:'.length));
  if (!json) return { valid: false, error: 'മത്സര കോഡ് വായിക്കാൻ കഴിഞ്ഞില്ല.' };
  try {
    const parsed = JSON.parse(json) as Partial<SignedDuelChallenge>;
    if (
      parsed.v !== 1 ||
      !parsed.duelId ||
      !parsed.challengerId ||
      !Array.isArray(parsed.questionIds) ||
      !parsed.origin ||
      !parsed.sig
    ) {
      return { valid: false, error: 'മത്സര വിവരങ്ങൾ അപൂർണ്ണമാണ്.' };
    }
    const { sig, ...unsigned } = parsed;
    const check = verifyAuthorizedAppSignature(
      'APP-SK-GUIDE-01',
      JSON.stringify(unsigned),
      sig,
      undefined,
      parsed.origin
    );
    if (!check.valid) return { valid: false, error: 'മത്സര കോഡിന്റെ സിഗ്നേച്ചർ സാധുവല്ല.' };
    return { valid: true, duel: parsed as SignedDuelChallenge };
  } catch {
    return { valid: false, error: 'മത്സര കോഡ് തകരാറുള്ളതാണ്.' };
  }
}

// ==================== VERIFIED FRIEND INVITE & 3-LESSON MILESTONE ====================

export interface SignedInviteMilestone {
  v: 1;
  inviterId: string;
  inviteeId: string;
  inviteeName: string;
  completedCount: number;
  origin: string;
  issuedAt: number;
  sig: string;
}

export function createInviteLink(inviterId: string, inviterName: string): string {
  const base = getDynamicBaseUrl();
  const params = new URLSearchParams({
    invite: inviterId.toUpperCase(),
    by: inviterName.slice(0, 32) || 'SKSSF സുഹൃത്ത്',
  });
  return base ? `${base}?${params.toString()}` : `?${params.toString()}`;
}

export function createSignedInviteMilestoneCode(params: {
  inviterId: string;
  inviteeId: string;
  inviteeName: string;
  completedCount: number;
}): string {
  const origin = getDynamicOrigin();
  const body = {
    v: 1 as const,
    inviterId: params.inviterId.toUpperCase(),
    inviteeId: params.inviteeId.toUpperCase(),
    inviteeName: params.inviteeName.slice(0, 40) || 'SKSSF പഠിതാവ്',
    completedCount: Math.max(3, Math.round(params.completedCount)),
    origin,
    issuedAt: Date.now(),
  };
  const sig = signAuthorizedAppPayload('APP-SK-GUIDE-01', JSON.stringify(body), origin);
  return `SKINV3:${encodeBase64Url(JSON.stringify({ ...body, sig }))}`;
}

export function verifySignedInviteMilestoneCode(
  rawInput: string,
  expectedInviterId: string
): { valid: boolean; data?: SignedInviteMilestone; error?: string } {
  const match = rawInput.trim().match(/SKINV3:[A-Za-z0-9_-]+/);
  if (!match) return { valid: false, error: 'സാധുവായ ഇൻവൈറ്റ് മൈൽസ്റ്റോൺ കോഡ് (SKINV3:) അല്ല.' };
  const json = decodeBase64Url(match[0].slice('SKINV3:'.length));
  if (!json) return { valid: false, error: 'കോഡ് ഡീകോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.' };
  try {
    const parsed = JSON.parse(json) as Partial<SignedInviteMilestone>;
    if (
      parsed.v !== 1 ||
      !parsed.inviterId ||
      !parsed.inviteeId ||
      !parsed.origin ||
      !parsed.sig ||
      (parsed.completedCount ?? 0) < 3
    ) {
      return { valid: false, error: 'ക്ഷണിക്കപ്പെട്ട സുഹൃത്ത് കുറഞ്ഞത് 3 പാഠങ്ങൾ പൂർത്തിയാക്കണം.' };
    }
    const { sig, ...unsigned } = parsed;
    const check = verifyAuthorizedAppSignature(
      'APP-SK-GUIDE-01',
      JSON.stringify(unsigned),
      sig,
      undefined,
      parsed.origin
    );
    if (!check.valid) return { valid: false, error: 'സിഗ്നേച്ചർ പരിശോധന പരാജയപ്പെട്ടു.' };
    if (parsed.inviterId.toUpperCase() !== expectedInviterId.trim().toUpperCase()) {
      return { valid: false, error: 'ഈ മൈൽസ്റ്റോൺ കോഡ് മറ്റൊരു ഇൻവൈറ്റർക്കുള്ളതാണ്.' };
    }
    if (parsed.inviteeId.toUpperCase() === expectedInviterId.trim().toUpperCase()) {
      return { valid: false, error: 'സ്വന്തം ഐഡി ഇൻവൈറ്റ് ബോണസിനായി ഉപയോഗിക്കാനാവില്ല.' };
    }
    return { valid: true, data: parsed as SignedInviteMilestone };
  } catch {
    return { valid: false, error: 'കോഡ് ഫോർമാറ്റ് തെറ്റാണ്.' };
  }
}

// ==================== ORIGIN-LOCKED CERTIFICATE / CARD QR VERIFIER ====================

export interface OriginLockedCardPayload {
  v: 1;
  type: 'certificate' | 'badge' | 'friend_card' | 'heritage_card';
  appId: AuthorizedAppId;
  userId: string;
  handle: string;
  name: string;
  unit?: string;
  xp: number;
  completedLessons: number;
  rank: string;
  verificationTier: number;
  ledgerHead: string;
  origin: string;
  issuedAt: number;
  sig: string;
}

export function createOriginLockedCardPayload(params: {
  type: OriginLockedCardPayload['type'];
  userId: string;
  handle: string;
  name: string;
  unit?: string;
  xp: number;
  completedLessons: number;
  rank: string;
  verificationTier: number;
  ledgerHead: string;
}): { payload: OriginLockedCardPayload; code: string } {
  const origin = getDynamicOrigin();
  const body = {
    v: 1 as const,
    type: params.type,
    appId: 'APP-SK-GUIDE-01' as const,
    userId: params.userId.toUpperCase(),
    handle: params.handle,
    name: params.name.slice(0, 48) || 'SKSSF പഠിതാവ്',
    ...(params.unit ? { unit: params.unit.slice(0, 48) } : {}),
    xp: Math.max(0, Math.round(params.xp)),
    completedLessons: Math.max(0, Math.round(params.completedLessons)),
    rank: params.rank.slice(0, 40),
    verificationTier: Math.max(0, Math.min(3, Math.round(params.verificationTier))),
    ledgerHead: params.ledgerHead.slice(0, 16),
    origin,
    issuedAt: Date.now(),
  };
  const sig = signAuthorizedAppPayload('APP-SK-GUIDE-01', JSON.stringify(body), origin);
  const payload: OriginLockedCardPayload = { ...body, sig };
  const code = `SKCARD1:${encodeBase64Url(JSON.stringify(payload))}`;
  return { payload, code };
}

export function verifyOriginLockedCardCode(rawInput: string): {
  valid: boolean;
  sameOrigin: boolean;
  payload?: OriginLockedCardPayload;
  error?: string;
} {
  const match = rawInput.trim().match(/SKCARD1:[A-Za-z0-9_-]+/);
  if (!match) {
    return {
      valid: false,
      sameOrigin: false,
      error: 'സാധുവായ SKCARD1: കാർഡ് / QR കോഡ് കണ്ടെത്തിയില്ല.',
    };
  }
  const json = decodeBase64Url(match[0].slice('SKCARD1:'.length));
  if (!json) {
    return { valid: false, sameOrigin: false, error: 'QR കോഡ് വായിക്കാൻ കഴിഞ്ഞില്ല.' };
  }
  try {
    const parsed = JSON.parse(json) as Partial<OriginLockedCardPayload>;
    if (
      parsed.v !== 1 ||
      !parsed.appId ||
      !isAuthorizedAppId(parsed.appId) ||
      !parsed.userId ||
      !isValidUserId(parsed.userId) ||
      !parsed.origin ||
      !parsed.sig
    ) {
      return { valid: false, sameOrigin: false, error: 'കാർഡ് വിവരങ്ങൾ അപൂർണ്ണമാണ്.' };
    }
    const { sig, ...unsigned } = parsed;
    const check = verifyAuthorizedAppSignature(
      parsed.appId,
      JSON.stringify(unsigned),
      sig,
      undefined,
      parsed.origin
    );
    if (!check.valid) {
      return {
        valid: false,
        sameOrigin: false,
        error: 'വ്യാജമോ തിരുത്തിയതോ ആയ കാർഡ്! ക്രിപ്റ്റോഗ്രാഫിക് സിഗ്നേച്ചർ പരാജയപ്പെട്ടു.',
      };
    }
    const sameOrigin = parsed.origin === getDynamicOrigin();
    return {
      valid: true,
      sameOrigin,
      payload: parsed as OriginLockedCardPayload,
    };
  } catch {
    return { valid: false, sameOrigin: false, error: 'QR കോഡ് ഫോർമാറ്റ് തെറ്റാണ്.' };
  }
}

// ==================== BLOCKCHAIN HASH CHAIN LEDGER ====================

export interface LedgerBlockInput {
  index: number;
  ts: number;
  action: string;
  deltaSilver: number;
  deltaGold: number;
  deltaDiamond: number;
  deltaXp: number;
  meta?: string;
  prevHash: string;
}

export interface LedgerBlock extends LedgerBlockInput {
  currentHash: string;
}

export function computeLedgerBlockHash(block: LedgerBlockInput): string {
  const canonical = [
    block.index,
    block.ts,
    block.action,
    block.deltaSilver,
    block.deltaGold,
    block.deltaDiamond,
    block.deltaXp,
    block.meta ?? '',
    block.prevHash,
  ].join('|');
  return sha256Hex(`SKSSF-CHAIN-V1::${canonical}`).slice(0, 24);
}

export function verifyHashChainIntegrity(
  chain: LedgerBlock[],
  expectedBalances: { silver: number; gold: number; diamond: number }
): { valid: boolean; brokenAtIndex?: number; reason?: string } {
  if (!Array.isArray(chain) || chain.length === 0) {
    return { valid: false, reason: 'Ledger chain missing' };
  }
  let s = 0;
  let g = 0;
  let d = 0;
  for (let i = 0; i < chain.length; i++) {
    const blk = chain[i];
    const expectedPrev = i === 0 ? 'GENESIS-SKSSF-000000' : chain[i - 1].currentHash;
    if (blk.prevHash !== expectedPrev) {
      return { valid: false, brokenAtIndex: i, reason: 'Broken prevHash link in ledger' };
    }
    const recomputed = computeLedgerBlockHash({
      index: blk.index,
      ts: blk.ts,
      action: blk.action,
      deltaSilver: blk.deltaSilver,
      deltaGold: blk.deltaGold,
      deltaDiamond: blk.deltaDiamond,
      deltaXp: blk.deltaXp,
      meta: blk.meta,
      prevHash: blk.prevHash,
    });
    if (!constantTimeEqual(recomputed, blk.currentHash)) {
      return { valid: false, brokenAtIndex: i, reason: 'Tampered block hash detected' };
    }
    s += blk.deltaSilver;
    g += blk.deltaGold;
    d += blk.deltaDiamond;
  }
  if (
    s !== expectedBalances.silver ||
    g !== expectedBalances.gold ||
    d !== expectedBalances.diamond
  ) {
    return {
      valid: false,
      reason: 'Wallet balance does not match verified Hash Chain ledger totals',
    };
  }
  return { valid: true };
}
