import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AuthorizedAppId,
  computeLedgerBlockHash,
  createSignedGiftVoucher,
  generateSuggestedHandle,
  generateUserId,
  getDynamicOrigin,
  getUserBatchFromId,
  isAuthorizedAppId,
  isValidInstitutionId,
  isValidOrganizationId,
  isValidUserId,
  LedgerBlock,
  sanitizeHandle,
  sha256Hex,
  SignedGiftVoucher,
  UserBatchId,
  verifyAuthorizedAppSignature,
  verifyHashChainIntegrity,
  verifySignedGiftVoucher,
  verifySignedInviteMilestoneCode,
} from './ecosystemCrypto';
import { getLocalDateKey, loadDailyAndProfileState, saveDailyAndProfileState } from './gameStorage';
import { sanitizeFinalPlayerText } from './sanitize';

// ==================== TYPES ====================

export type GuidedHubId = 'market' | 'album' | 'pass14' | 'multiplayer' | 'verifier' | 'friends';

export const ALL_GUIDED_HUBS: GuidedHubId[] = [
  'market',
  'album',
  'pass14',
  'multiplayer',
  'verifier',
  'friends',
];

export interface CustomCurrencySlot {
  appId: AuthorizedAppId;
  symbol: string;
  labelMl: string;
  balance: number;
  updatedAt: number;
}

export interface AuthorizedAssetSlot {
  slotId: string;
  appId: AuthorizedAppId;
  titleMl: string;
  kind: 'badge' | 'kitab_certificate' | 'pass' | 'relic';
  issuedAt: number;
}

export interface NameHistoryRecord {
  oldName: string;
  newName: string;
  changedAt: number;
  method: 'free_typo_fix' | 'rename_pass_10d';
}

export interface WebOfTrustAttestation {
  id: string;
  attesterId: string; // USR-SK-... or ORG-SK-...
  attesterName: string;
  tierGranted: 1 | 2 | 3;
  attestedAt: number;
}

export interface VerifiedFriend {
  userId: string;
  handle: string;
  displayName: string;
  batch: UserBatchId;
  verificationTier: number;
  addedAt: number;
  seasonalScore?: number;
}

export interface SeasonalEventDef {
  id: string;
  nameMl: string;
  nameEn: string;
  themeColor: string;
  windowLabel: string;
  descriptionMl: string;
  multiplierLabel: string;
  questions: {
    q: string;
    options: [string, string, string, string];
    correctIdx: 0 | 1 | 2 | 3;
    fact: string;
  }[];
}

export interface SeasonalRecord {
  eventId: string;
  year: number;
  bestScore: number;
  totalQuestions: number;
  playedAt: number;
}

export interface HeritageCardDef {
  id: string;
  number: number;
  titleMl: string;
  year: string;
  rarity: 'silver' | 'gold' | 'diamond';
  unlockRuleMl: string;
  quoteMl: string;
  detailMl: string;
}

export interface PassTierDef {
  tier: number;
  titleMl: string;
  requirementMl: string;
  requiredLessons: number;
  requiredStreak: number;
  rewardSilver: number;
  rewardGold: number;
  rewardDiamond: number;
  cardId?: string;
}

export interface SnakesAndLaddersNode {
  lessonIndex: number; // 0-based index in ALL_LESSONS
  type: 'ladder' | 'snake';
  targetIndex: number;
  labelMl: string;
  descriptionMl: string;
}

export interface EcosystemState {
  version: 1;
  identity: {
    userId: string;
    batch: UserBatchId;
    handle: string;
    displayName: string;
    freeNameEditUsed: boolean;
    nameLocked: boolean;
    nameHistory: NameHistoryRecord[];
    pinHash?: string;
    masterProfileLink: {
      linked: boolean;
      profileHubAppId: 'APP-SK-PROFILE-00';
      institutionId?: string; // INS-SK-XXXX
      organizationId?: string; // ORG-SK-XXXX
      cloudSyncReady: boolean;
      playGamesSocketReady: boolean;
      linkedAt?: number;
    };
    verificationTier: 0 | 1 | 2 | 3;
    canVerifyEntities: boolean;
    attestations: WebOfTrustAttestation[];
    orgRoles: string[];
    linkedApps: Partial<Record<AuthorizedAppId, { connectedAt: number; syncVersion: number }>>;
  };
  wallet: {
    silver: number;
    gold: number;
    diamond: number;
    lessonSilverEmitted: number;
    lessonGoldEmitted: number;
    lessonDiamondEmitted: number;
    claimedXpMilestones: number[]; // e.g., [500, 1000, 1500]
    customCurrencies: Record<string, CustomCurrencySlot>;
    assetSlots: AuthorizedAssetSlot[];
  };
  inventory: {
    quizHint5050: number;
    quizHintTime: number;
    streakFreezes: number;
    freeRoamStageUnlocked: boolean;
    unlockedBadgeFrames: string[];
    activeBadgeFrame: string;
    unlockedSoundPacks: string[];
    vipJumpPasses: number;
  };
  exploration: {
    visitedHubs: GuidedHubId[];
    claimedDiscoveryRewards: string[];
  };
  social: {
    friends: VerifiedFriend[];
    burnedGiftIds: string[];
    giftDateKey: string;
    giftsSentToday: number;
    giftsReceivedToday: number;
    giftedLessonIds: string[];
    invitedByUserId?: string;
    invitedByName?: string;
    claimedInviteCodes: string[];
  };
  progression: {
    collectedHeritageCards: string[];
    foundHiddenStars: string[]; // 3 hidden stars (+2 Diamonds each)
    claimedPassTiers: number[];
    lessonStars: Record<string, 1 | 2 | 3>;
    speedReplayDateKey: string;
    speedReplayCountToday: number;
    consecutiveLessonsSinceBreak: number;
    cooldownUntil: number; // timestamp ms
    completedBossLevels: number[];
    rewardPackTriggersCount: number;
    pendingPackReward: boolean;
    seasonalRecords: SeasonalRecord[];
    darsSyncStats: {
      kitabsLinked: string[];
      lastSyncedAt?: number;
    };
  };
  ledger: LedgerBlock[];
  tamperDetected: boolean;
  tamperMessage?: string;
}

// ==================== MULTI-BATCH SUPABASE SYNC ADAPTER ====================

export interface SyncMutation {
  id: string;
  batch: UserBatchId;
  userId: string;
  ledgerHead: string;
  ts: number;
  kind: 'wallet_delta' | 'profile_update' | 'gift_burn' | 'seasonal_score';
}

export interface SyncAdapter {
  readonly mode: 'offline_first' | 'supabase_sharded';
  resolveShardName(batch: UserBatchId): string;
  enqueueMutation(mutation: SyncMutation): void;
  getPendingCount(): number;
  flushIfConfigured(): Promise<{ synced: number; offline: boolean }>;
}

const SYNC_QUEUE_KEY = 'skssf_eco_sync_queue_v1';

export function resolveBatchShard(batch: UserBatchId): string {
  const shardMap: Record<UserBatchId, string> = {
    B1: 'supabase-shard-b1-kerala-north',
    B2: 'supabase-shard-b2-kerala-central',
    B3: 'supabase-shard-b3-kerala-south',
    B4: 'supabase-shard-b4-global-gcc',
  };
  return shardMap[batch] ?? shardMap.B1;
}

export const ecosystemSyncAdapter: SyncAdapter = {
  mode: 'offline_first',
  resolveShardName: resolveBatchShard,
  enqueueMutation(mutation: SyncMutation) {
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      const list: SyncMutation[] = raw ? JSON.parse(raw) : [];
      const next = [...list.slice(-49), mutation];
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(next));
    } catch {
      // Offline-safe no-op
    }
  },
  getPendingCount() {
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.length : 0;
    } catch {
      return 0;
    }
  },
  async flushIfConfigured() {
    // 100% offline-first until a multi-batch Supabase project is connected via env/socket
    return { synced: 0, offline: true };
  },
};

// ==================== STATIC CATALOGS ====================

export const ANTI_INFLATION_CAPS = {
  MAX_SILVER_FROM_LESSONS: 1860, // 62 lessons * 30 avg cap
  MAX_GOLD_FROM_LESSONS: 420,
  MAX_DIAMOND_FROM_LESSONS: 25,
  MAX_GIFTS_SENT_PER_DAY: 2,
  MAX_GIFTS_RECEIVED_PER_DAY: 2,
  MAX_SPEED_REPLAYS_PER_DAY: 5,
  COOLDOWN_AFTER_LESSONS: 5,
  COOLDOWN_DURATION_MS: 60 * 60 * 1000, // 1 hour
  COOLDOWN_SKIP_GOLD: 25,
  COOLDOWN_SKIP_DIAMOND: 1,
  EXTRA_HP_GOLD: 40,
  FREE_ROAM_GOLD: 150,
  STREAK_FREEZE_DIAMOND: 3,
  BADGE_FRAME_DIAMOND: 2,
  SOUND_PACK_DIAMOND: 2,
  RENAME_PASS_DIAMOND: 10,
  LESSON_GIFT_DIAMOND: 2,
  GAME_SKIP_GOLD: 20,
};

export const HERITAGE_ALBUM_CARDS: HeritageCardDef[] = [
  {
    id: 'hc_1926_samastha',
    number: 1,
    titleMl: 'സമസ്ത പിറവി (1926)',
    year: '1926',
    rarity: 'diamond',
    unlockRuleMl: 'തുടക്കത്തിൽ തന്നെ അൺലോക്ക്',
    quoteMl: 'അഹ്ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ പണ്ഡിത കാവൽക്കോട്ട.',
    detailMl: '1926 ജൂൺ 26-ന് കോഴിക്കോട് വെച്ച് സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ രൂപീകൃതമായി.',
  },
  {
    id: 'hc_1951_skimvb',
    number: 2,
    titleMl: 'വിദ്യാഭ്യാസ ബോർഡ് (SKIMVB)',
    year: '1951',
    rarity: 'gold',
    unlockRuleMl: '3 പാഠങ്ങൾ പൂർത്തിയാക്കൂ',
    quoteMl: '11,000-ത്തിലധികം മദ്രസകളിലൂടെ വിജ്ഞാന വെളിച്ചം.',
    detailMl: '1951 സെപ്റ്റംബർ 17-ന് വളാഞ്ചേരിയിൽ വെച്ച് സമസ്ത വിദ്യാഭ്യാസ ബോർഡ് നിലവിൽ വന്നു.',
  },
  {
    id: 'hc_1954_sys',
    number: 3,
    titleMl: 'സുന്നി യുവജന സംഘം (SYS)',
    year: '1954',
    rarity: 'silver',
    unlockRuleMl: '6 പാഠങ്ങൾ പൂർത്തിയാക്കൂ',
    quoteMl: 'യുവജനങ്ങളുടെ ആദർശ-സേവന മുന്നേറ്റം.',
    detailMl: 'സമസ്തയ്ക്ക് കീഴിൽ യുവജനങ്ങളെ ഏകോപിപ്പിക്കാൻ 1954-ൽ SYS രൂപീകൃതമായി.',
  },
  {
    id: 'hc_1963_jamia',
    number: 4,
    titleMl: 'പട്ടിക്കാട് ജാമിഅ നൂരിയ്യ',
    year: '1963',
    rarity: 'gold',
    unlockRuleMl: '10 പാഠങ്ങൾ പൂർത്തിയാക്കൂ',
    quoteMl: 'ഉന്നത മതപഠനത്തിന്റെ കേരളീയ വിളക്കുമാടം.',
    detailMl: '1963-ൽ പട്ടിക്കാട് സ്ഥാപിതമായ ജാമിഅ നൂരിയ്യ ആയിരക്കണക്കിന് പണ്ഡിതരെ വാർത്തെടുത്തു.',
  },
  {
    id: 'hc_1976_smf',
    number: 5,
    titleMl: 'മഹല്ല് ഫെഡറേഷൻ (SMF)',
    year: '1976',
    rarity: 'silver',
    unlockRuleMl: '15 പാഠങ്ങൾ പൂർത്തിയാക്കൂ',
    quoteMl: 'മഹല്ലുകളുടെ ഐക്യവും സാമൂഹിക ക്ഷേമവും.',
    detailMl: '1976-ൽ മഹല്ല് കമ്മിറ്റികളെ ഏകോപിപ്പിക്കാൻ സമസ്ത കേരള സുന്നി മഹല്ല് ഫെഡറേഷൻ പിറന്നു.',
  },
  {
    id: 'hc_1989_skssf',
    number: 6,
    titleMl: 'SKSSF പിറവി (ഫെബ്രുവരി 19)',
    year: '1989',
    rarity: 'diamond',
    unlockRuleMl: '18 പാഠങ്ങൾ അല്ലെങ്കിൽ പായ്ക്ക് ഓപ്പണിംഗ്',
    quoteMl: 'വിജ്ഞാനം · വിനയം · സേവനം — വിദ്യാർത്ഥി മുന്നേറ്റം.',
    detailMl: '1989 ഫെബ്രുവരി 19-ന് കോഴിക്കോട് സാമൂതിരി ഹൈസ്കൂളിൽ SKSSF രൂപീകൃതമായി.',
  },
  {
    id: 'hc_1993_sksbv',
    number: 7,
    titleMl: 'SKSBV ബാലവേദി',
    year: '1993',
    rarity: 'silver',
    unlockRuleMl: '24 പാഠങ്ങൾ പൂർത്തിയാക്കൂ',
    quoteMl: 'കുരുന്നുകളിൽ നന്മയുടെയും വിജ്ഞാനത്തിന്റെയും വിത്തുകൾ.',
    detailMl: 'മദ്രസാ വിദ്യാർത്ഥികളുടെ സർഗ്ഗശേഷിയും ധാർമ്മികതയും വളർത്താൻ 1993-ൽ SKSBV സ്ഥാപിതമായി.',
  },
  {
    id: 'hc_1995_tagore',
    number: 8,
    titleMl: 'ടാഗോർ ഹാൾ സമാധാന പ്രഖ്യാപനം',
    year: '1995',
    rarity: 'gold',
    unlockRuleMl: '30 പാഠങ്ങൾ പൂർത്തിയാക്കൂ',
    quoteMl: 'പ്രകോപനമല്ല, വിജ്ഞാനവും സമാധാനവുമാണ് നമ്മുടെ വഴി.',
    detailMl: '1995-ൽ കോഴിക്കോട് ടാഗോർ ഹാളിൽ ശംസുൽ ഉലമയും സമസ്തയും യുവാക്കൾക്ക് ജനാധിപത്യ-സമാധാന ദിശ നൽകി.',
  },
  {
    id: 'hc_1997_sathyadhara',
    number: 9,
    titleMl: 'സത്യധാര മുഖപത്രം',
    year: '1997',
    rarity: 'silver',
    unlockRuleMl: '36 പാഠങ്ങൾ പൂർത്തിയാക്കൂ',
    quoteMl: 'ആദർശത്തിന്റെയും അക്ഷരത്തിന്റെയും കരുത്ത്.',
    detailMl: '1997 മുതൽ SKSSF-ന്റെ ഔദ്യോഗിക ദ്വൈവാരികയായി സത്യധാര പ്രസിദ്ധീകരിക്കുന്നു.',
  },
  {
    id: 'hc_viqaya',
    number: 10,
    titleMl: 'വിഖായ & സഹചാരി സേവനം',
    year: 'സേവനം',
    rarity: 'gold',
    unlockRuleMl: '44 പാഠങ്ങൾ അല്ലെങ്കിൽ പായ്ക്ക് ഓപ്പണിംഗ്',
    quoteMl: 'ജാതിമത ഭേദമന്യേ ദുരിതാശ്വാസവും ആതുരസേവനവും.',
    detailMl: 'പ്രളയവും മഹാമാരിയും നേരിട്ട വിഖായ വളണ്ടിയർമാരും സഹചാരി റിലീഫ് സെല്ലും കേരളത്തിന് മാതൃകയായി.',
  },
  {
    id: 'hc_dars_kitabs',
    number: 11,
    titleMl: 'ദർസ് കിതാബ് പൈതൃകം',
    year: 'ദർസ്',
    rarity: 'diamond',
    unlockRuleMl: '52 പാഠങ്ങൾ അല്ലെങ്കിൽ ദർസ് ഹബ് സന്ദർശിക്കൂ',
    quoteMl: 'فَتْحُ الْمُعِينْ · أَلْفِيَّةُ ابْنِ مَالِكْ — പള്ളി ദർസുകളുടെ അറിവ് വെളിച്ചം.',
    detailMl: 'മഖ്ദൂമുമാരിലൂടെ കേരളത്തിൽ വേരുറച്ച ദർസ് സമ്പ്രദായം ഇന്നും ത്വലബയിലൂടെ സജീവമാണ്.',
  },
  {
    id: 'hc_centenary_2026',
    number: 12,
    titleMl: 'സമസ്ത ശതാബ്ദി & ആഗോള ദൗത്യം',
    year: '2026',
    rarity: 'diamond',
    unlockRuleMl: 'എല്ലാ 62 പാഠങ്ങളും പൂർത്തിയാക്കൂ',
    quoteMl: 'ഒരു നൂറ്റാണ്ടിന്റെ പണ്ഡിത പാരമ്പര്യം പുതുതലമുറയിലേക്ക്.',
    detailMl: '1926 മുതൽ 2026 വരെ ഒരു നൂറ്റാണ്ട് പിന്നിടുന്ന സമസ്തയുടെ ജ്ഞാനപൈതൃകം ലോകമെങ്ങും പ്രകാശിക്കുന്നു.',
  },
];

export const PASS_14_TIERS: PassTierDef[] = [
  { tier: 1, titleMl: 'തുടക്ക പടി', requirementMl: '1 പാഠം പൂർത്തിയാക്കൂ', requiredLessons: 1, requiredStreak: 0, rewardSilver: 30, rewardGold: 5, rewardDiamond: 0 },
  { tier: 2, titleMl: 'ആദ്യ ചുവട്', requirementMl: '3 പാഠങ്ങൾ', requiredLessons: 3, requiredStreak: 1, rewardSilver: 45, rewardGold: 8, rewardDiamond: 0, cardId: 'hc_1951_skimvb' },
  { tier: 3, titleMl: 'പതിവ് പഠിതാവ്', requirementMl: '6 പാഠങ്ങൾ', requiredLessons: 6, requiredStreak: 2, rewardSilver: 60, rewardGold: 12, rewardDiamond: 0, cardId: 'hc_1954_sys' },
  { tier: 4, titleMl: 'വിജ്ഞാന തൽപരൻ', requirementMl: '10 പാഠങ്ങൾ', requiredLessons: 10, requiredStreak: 3, rewardSilver: 75, rewardGold: 15, rewardDiamond: 1, cardId: 'hc_1963_jamia' },
  { tier: 5, titleMl: 'യൂണിറ്റ് സഹചാരി', requirementMl: '18 പാഠങ്ങൾ', requiredLessons: 18, requiredStreak: 4, rewardSilver: 90, rewardGold: 20, rewardDiamond: 1, cardId: 'hc_1989_skssf' },
  { tier: 6, titleMl: 'മേഖലാ നായകൻ', requirementMl: '26 പാഠങ്ങൾ', requiredLessons: 26, requiredStreak: 5, rewardSilver: 110, rewardGold: 25, rewardDiamond: 1 },
  { tier: 7, titleMl: '17 വിംഗ് പരിചിതൻ', requirementMl: '35 പാഠങ്ങൾ', requiredLessons: 35, requiredStreak: 6, rewardSilver: 130, rewardGold: 30, rewardDiamond: 2, cardId: 'hc_1997_sathyadhara' },
  { tier: 8, titleMl: 'ജില്ലാ സാരഥി', requirementMl: '44 പാഠങ്ങൾ', requiredLessons: 44, requiredStreak: 8, rewardSilver: 150, rewardGold: 40, rewardDiamond: 2, cardId: 'hc_viqaya' },
  { tier: 9, titleMl: 'ദർസ് & സൈബർ കാവൽ', requirementMl: '54 പാഠങ്ങൾ', requiredLessons: 54, requiredStreak: 10, rewardSilver: 180, rewardGold: 50, rewardDiamond: 2, cardId: 'hc_dars_kitabs' },
  { tier: 10, titleMl: '14-ദിന ജേതാവ് 🏆', requirementMl: '62 പാഠങ്ങൾ', requiredLessons: 62, requiredStreak: 12, rewardSilver: 250, rewardGold: 75, rewardDiamond: 3, cardId: 'hc_centenary_2026' },
];

export const SNAKES_AND_LADDERS_NODES: SnakesAndLaddersNode[] = [
  { lessonIndex: 3, type: 'ladder', targetIndex: 6, labelMl: '🪜 വിജ്ഞാന കോണി (+3)', descriptionMl: 'സമസ്ത ചരിത്രം വേഗത്തിൽ കയറി അടുത്ത ഘട്ടത്തിലേക്ക്!' },
  { lessonIndex: 11, type: 'snake', targetIndex: 9, labelMl: '🐍 റിവിഷൻ പാമ്പ് (-2)', descriptionMl: 'അദബ് മറന്നാൽ റിവിഷൻ ചെയ്യാൻ 2 പടി താഴേക്ക്!' },
  { lessonIndex: 17, type: 'ladder', targetIndex: 21, labelMl: '🪜 യൂണിറ്റ് കോണി (+4)', descriptionMl: 'POV യാത്ര പൂർത്തിയാക്കി യൂണിറ്റ് തലത്തിലേക്ക് കുതിക്കാം!' },
  { lessonIndex: 27, type: 'snake', targetIndex: 24, labelMl: '🐍 പരീക്ഷണ പാമ്പ് (-3)', descriptionMl: 'കമ്മിറ്റി ഘടന ഉറപ്പിക്കാൻ ചെറിയ റിവിഷൻ!' },
  { lessonIndex: 34, type: 'ladder', targetIndex: 38, labelMl: '🪜 17-വിംഗ് കോണി (+4)', descriptionMl: '17 ഉപവിഭാഗങ്ങൾ അറിഞ്ഞ് ജില്ലാ തലത്തിലേക്ക്!' },
  { lessonIndex: 45, type: 'snake', targetIndex: 42, labelMl: '🐍 സൈബർ കെണി (-3)', descriptionMl: 'വ്യാജ വാർത്തയിൽ വീഴാതെ സൈബർ മര്യാദ ഉറപ്പിക്കൂ!' },
  { lessonIndex: 52, type: 'ladder', targetIndex: 56, labelMl: '🪜 ദർസ് വിജ്ഞാന കോണി (+4)', descriptionMl: 'ത്വലബയും കിതാബ് അറിവും നിങ്ങളെ മുന്നോട്ട് നയിക്കുന്നു!' },
];

export const SEASONAL_EVENTS_CATALOG: SeasonalEventDef[] = [
  {
    id: 'skssf_foundation_feb19',
    nameMl: 'SKSSF സ്ഥാപക ദിന ചാലഞ്ച് (ഫെബ്രുവരി 19)',
    nameEn: 'SKSSF Foundation Day',
    themeColor: 'emerald',
    windowLabel: 'ഫെബ്രുവരി 18 – 20',
    descriptionMl: '1989 ഫെബ്രുവരി 19-ന്റെ ഓർമ്മയിൽ 3 ദിവസത്തെ സ്പെഷ്യൽ വിജ്ഞാന മത്സരവും 2x നാണയ ബോണസും!',
    multiplierLabel: '2x നാണയ ബോണസ്',
    questions: [
      {
        q: 'SKSSF രൂപീകൃതമായത് ഏത് വർഷം, ഏത് സ്ഥലത്ത് വെച്ചാണ്?',
        options: [
          '1989 ഫെബ്രുവരി 19 · കോഴിക്കോട് സാമൂതിരി ഹൈസ്കൂൾ',
          '1987 മാർച്ച് 12 · മലപ്പുറം ടൗൺ ഹാൾ',
          '1991 ജനുവരി 26 · തിരൂർ വാഗൺ ട്രാജഡി ഹാൾ',
          '1985 ജൂൺ 26 · കോഴിക്കോട് ടാഗോർ ഹാൾ',
        ],
        correctIdx: 0,
        fact: '1989 ഫെബ്രുവരി 19-ന് കോഴിക്കോട് സാമൂതിരി ഹൈസ്കൂളിൽ വെച്ചാണ് SKSSF പിറവിയെടുത്തത്.',
      },
      {
        q: 'SKSSF-ന്റെ ഔദ്യോഗിക മുദ്രാവാക്യം (Motto) ഏതാണ്?',
        options: [
          'അറിവ് · ഐക്യം · പുരോഗതി',
          'വിജ്ഞാനം · വിനയം · സേവനം',
          'സമാധാനം · സൗഹൃദം · സഹകരണം',
          'വിദ്യാഭ്യാസം · സംസ്കാരം · നേതൃത്വം',
        ],
        correctIdx: 1,
        fact: 'വിജ്ഞാനം, വിനയം, സേവനം എന്നിവയാണ് SKSSF-ന്റെ അടിസ്ഥാന മുദ്രാവാക്യം.',
      },
      {
        q: 'SKSSF-ന്റെ ഔദ്യോഗിക മുഖപത്രമായ സത്യധാര ആരംഭിച്ച വർഷം ഏതാണ്?',
        options: ['1989', '1993', '1997', '2001'],
        correctIdx: 2,
        fact: '1997 മുതൽ SKSSF-ന്റെ ദ്വൈവാരികയായി സത്യധാര പുറത്തിറങ്ങുന്നു.',
      },
    ],
  },
  {
    id: 'ramadan_special',
    nameMl: 'റമദാൻ വിജ്ഞാന-സേവന ചാലഞ്ച്',
    nameEn: 'Ramadan Knowledge & Relief Cup',
    themeColor: 'amber',
    windowLabel: 'വിശുദ്ധ റമദാൻ മാസം',
    descriptionMl: 'റമദാൻ മാസത്തിലെ ആത്മീയ അറിവുകളും സഹചാരി ജീവകാരുണ്യ ചാലഞ്ചും!',
    multiplierLabel: '2x കോയിൻ + വജ്ര ബോണസ്',
    questions: [
      {
        q: 'റമദാനിലും ദുരിതകാലത്തും രോഗികൾക്ക് ആത്മാഭിമാനം കാത്ത് സഹായം എത്തിക്കുന്ന SKSSF വിഭാഗം?',
        options: ['സഹചാരി റിലീഫ് സെൽ', 'ട്രെൻഡ്', 'സർഗ്ഗലയം', 'ഓർഗാനെറ്റ്'],
        correctIdx: 0,
        fact: 'സഹചാരി റിലീഫ് സെൽ ജാതിമത ഭേദമന്യേ ചികിത്സാ-ജീവകാരുണ്യ സഹായങ്ങൾ എത്തിക്കുന്നു.',
      },
      {
        q: 'പരസ്യ പ്രദർശനമില്ലാതെ അല്ലാഹുവിന്റെ പ്രീതിക്ക് വേണ്ടി മാത്രം സേവനം ചെയ്യുന്ന ഗുണം?',
        options: ['തവാളുഅ്', 'ഇഖ്‌ലാസ് (നിഷ്കളങ്കത)', 'തവക്കുൽ', 'സ്വബ്ർ'],
        correctIdx: 1,
        fact: 'നിഷ്കളങ്കത (ഇഖ്‌ലാസ്) ആണ് ഓരോ സേവന പ്രവർത്തനത്തിന്റെയും ജീവൻ.',
      },
      {
        q: 'വിശുദ്ധ ഖുർആൻ പാരായണവും ആത്മീയ സദസ്സുകളും ഏകോപിപ്പിക്കുന്ന SKSSF ആത്മീയ വേദി?',
        options: ['ഇബാദ് (IBAD)', 'സൈബർ വിംഗ്', 'ക്യാമ്പസ് വിംഗ്', 'മനീഷ'],
        correctIdx: 0,
        fact: 'ഇബാദ് (IBAD) ആത്മീയ സദസ്സുകൾക്കും മജ്‌ലിസുന്നൂർ പോലുള്ള കൂട്ടായ്മകൾക്കും നേതൃത്വം നൽകുന്നു.',
      },
    ],
  },
  {
    id: 'environment_june5',
    nameMl: 'ലോക പരിസ്ഥിതി ദിന ഹരിത ചാലഞ്ച് (ജൂൺ 5)',
    nameEn: 'World Environment Day',
    themeColor: 'emerald',
    windowLabel: 'ജൂൺ 4 – 6',
    descriptionMl: 'ഹരിത ക്യാമ്പസും മരം നടൽ സ്വദഖയും — 3 ദിവസത്തെ പരിസ്ഥിതി മിനി ടൂർണമെന്റ്.',
    multiplierLabel: '2x ഹരിത നാണയം',
    questions: [
      {
        q: 'അന്ത്യദിനം അടുത്താലും കയ്യിലൊരു ചെറിയ തൈ ഉണ്ടെങ്കിൽ എന്ത് ചെയ്യാനാണ് തിരുനബി ﷺ പഠിപ്പിച്ചത്?',
        options: [
          'അത് സുരക്ഷിതമായി സൂക്ഷിച്ചു വെക്കുക',
          'അത് ഭൂമിയിൽ നടുക',
          'മറ്റൊരാൾക്ക് കൈമാറുക',
          'വെള്ളത്തിൽ ഒഴുക്കുക',
        ],
        correctIdx: 1,
        fact: 'മരം നടൽ തുടരുന്ന ദാനധർമ്മമാണെന്നും അന്ത്യദിനം അടുത്താലും തൈ നടണമെന്നും ഹദീസിൽ പഠിപ്പിക്കുന്നു.',
      },
      {
        q: 'സമ്മേളനങ്ങളിലും ക്യാമ്പസിലും പ്ലാസ്റ്റിക് ഒഴിവാക്കി ശുചിത്വം പാലിക്കുന്ന രീതി?',
        options: ['ഗ്രീൻ പ്രോട്ടോക്കോൾ', 'ഡിജിറ്റൽ പ്രോട്ടോക്കോൾ', 'ഓഫീസ് ഡെസ്ക്', 'സിൽവർ മാപ്പ്'],
        correctIdx: 0,
        fact: 'സ്റ്റീൽ ഗ്ലാസുകളും തുണി ബാനറുകളും ഉപയോഗിക്കുന്ന ഗ്രീൻ പ്രോട്ടോക്കോൾ പരിസ്ഥിതി സംരക്ഷണത്തിന് അനിവാര്യമാണ്.',
      },
      {
        q: 'ഒഴുകുന്ന പുഴയുടെ കരയിൽ നിന്നാലും വുളൂഅ് ചെയ്യുമ്പോൾ എന്താണ് ഒഴിവാക്കേണ്ടത്?',
        options: ['തണുത്ത വെള്ളം', 'വെള്ളം അമിതമായി പാഴാക്കൽ', 'രാവിലത്തെ വുളൂഅ്', 'കൈകൾ കഴുകൽ'],
        correctIdx: 1,
        fact: 'ഒഴുകുന്ന പുഴയുടെ കരയിലാണെങ്കിലും വെള്ളം പാഴാക്കരുത് എന്നതാണ് പ്രവാചക മാതൃക.',
      },
    ],
  },
  {
    id: 'reading_june19',
    nameMl: 'വായനാദിന കിതാബ് ചാലഞ്ച് (ജൂൺ 19)',
    nameEn: 'Reading Day Challenge',
    themeColor: 'sky',
    windowLabel: 'ജൂൺ 18 – 20',
    descriptionMl: 'ലൈബ്രറി അദബും ദർസ് കിതാബുകളും — വായനാദിന പ്രത്യേക മത്സരം!',
    multiplierLabel: '2x വിജ്ഞാന നാണയം',
    questions: [
      {
        q: 'ഇസ്‌ലാമിക് ലൈബ്രറിയിലെ തട്ടിൽ ഏറ്റവും മുകളിൽ ആദരവോടെ വെക്കേണ്ട ഗ്രന്ഥം?',
        options: ['ചരിത്ര ഗ്രന്ഥം', 'വിശുദ്ധ ഖുർആൻ (മുസ്ഹഫ്)', 'നിഘണ്ടു', 'വാർഷിക മാസിക'],
        correctIdx: 1,
        fact: 'ഏറ്റവും മുകളിൽ മുസ്ഹഫ്, തുടർന്ന് തഫ്സീർ, ഹദീസ്, ഫിഖ്ഹ് ക്രമത്തിലാണ് കിതാബുകൾ അടുക്കേണ്ടത്.',
      },
      {
        q: 'കേരളത്തിലെ പള്ളി ദർസുകളിൽ വ്യാപകമായി പഠിപ്പിക്കുന്ന പ്രശസ്ത ഫിഖ്ഹ് ഗ്രന്ഥം?',
        options: ['ഫത്ഹുൽ മുഈൻ (فَتْحُ الْمُعِينْ)', 'അൽ-മുഅല്ലിം', 'സത്യധാര', 'കുരുന്നുകൾ'],
        correctIdx: 0,
        fact: 'ശൈഖ് സൈനുദ്ദീൻ മഖ്ദൂം (റ) രചിച്ച ഫത്ഹുൽ മുഈൻ ദർസുകളിലെ പ്രധാന ഫിഖ്ഹ് ഗ്രന്ഥമാണ്.',
      },
      {
        q: 'അറബി വ്യാകരണത്തിലെ (നഹ്‌വ്) ക്ലാസിക് പദ്യഗ്രന്ഥം ഏതാണ്?',
        options: ['അൽഫിയ്യ ഇബ്നു മാലിക് (أَلْفِيَّةُ ابْنِ مَالِكْ)', 'താരീഖുൽ ഉമം', 'രിയാളുസ്സ്വാലിഹീൻ', 'അൽ-ബയാൻ'],
        correctIdx: 0,
        fact: 'ഇമാം ഇബ്നു മാലിക് രചിച്ച 1000 വരികളുള്ള അൽഫിയ്യ നഹ്‌വിലെ ക്ലാസിക് ഗ്രന്ഥമാണ്.',
      },
    ],
  },
  {
    id: 'independence_aug15',
    nameMl: 'സ്വാതന്ത്ര്യദിന ദേശസ്നേഹ ചാലഞ്ച് (ആഗസ്റ്റ് 15)',
    nameEn: 'Independence Day Harmony Cup',
    themeColor: 'amber',
    windowLabel: 'ആഗസ്റ്റ് 14 – 16',
    descriptionMl: 'മതസൗഹാർദ്ദവും ഭരണഘടനാ മൂല്യങ്ങളും — സ്വാതന്ത്ര്യദിന 3-ദിന ചാലഞ്ച്.',
    multiplierLabel: '2x നാണയ ബോണസ്',
    questions: [
      {
        q: '1995 കോഴിക്കോട് ടാഗോർ ഹാൾ പ്രഖ്യാപനത്തിലൂടെ സമസ്ത യുവാക്കൾക്ക് നൽകിയ സന്ദേശം?',
        options: [
          'വൈകാരിക പ്രകോപനം ഒഴിവാക്കി ജനാധിപത്യ സമാധാനത്തിന്റെ പാത പിന്തുടരുക',
          'സാമൂഹിക കാര്യങ്ങളിൽ നിന്ന് പൂർണ്ണമായി മാറിനിൽക്കുക',
          'പഠനം നിർത്തി യാത്രകൾ നടത്തുക',
          'കായിക മത്സരങ്ങൾ മാത്രം സംഘടിപ്പിക്കുക',
        ],
        correctIdx: 0,
        fact: 'സമാധാനവും ജനാധിപത്യ മൂല്യങ്ങളും മതസൗഹാർദ്ദവും ഉയർത്തിപ്പിടിക്കാനാണ് ടാഗോർ ഹാൾ പ്രഖ്യാപനം ആഹ്വാനം ചെയ്തത്.',
      },
      {
        q: 'ഭരണഘടനാ അവകാശ സംരക്ഷണത്തിനും നിയമസഹായത്തിനുമായി സമസ്തയ്ക്ക് കീഴിൽ പ്രവർത്തിക്കുന്ന സെൽ?',
        options: ['സമസ്ത ലീഗൽ സെൽ (SLC)', 'SKJM', 'SKMMA', 'SKSBV'],
        correctIdx: 0,
        fact: 'സമസ്ത ലീഗൽ സെൽ (SLC) നിയമസഹായവും ഭരണഘടനാ ബോധവൽക്കരണവും നൽകുന്നു.',
      },
      {
        q: 'സ്വാതന്ത്ര്യദിനത്തിൽ SKSSF യൂണിറ്റുകൾ ദേശസ്നേഹവും സൗഹാർദ്ദവും ഉയർത്താൻ നടത്തുന്ന പ്രധാന സംരംഭം?',
        options: ['മനുഷ്യജാലിക & സ്വാതന്ത്ര്യദിന സദസ്സ്', 'വാണിജ്യ മേള', 'ചലച്ചിത്ര പ്രദർശനം', 'സ്വകാര്യ യാത്ര'],
        correctIdx: 0,
        fact: 'മതസൗഹാർദ്ദവും രാജ്യസ്നേഹവും ശക്തിപ്പെടുത്തുന്ന മനുഷ്യജാലിക പോലുള്ള പരിപാടികൾ SKSSF സംഘടിപ്പിക്കുന്നു.',
      },
    ],
  },
  {
    id: 'rabiul_awwal_milad',
    nameMl: 'റബീഉൽ അവ്വൽ — നബിദിന സീറത്ത് ചാലഞ്ച്',
    nameEn: 'Rabi-ul-Awwal Milad Cup',
    themeColor: 'emerald',
    windowLabel: 'റബീഉൽ അവ്വൽ മാസം',
    descriptionMl: 'തിരുനബി ﷺ-യുടെ കാരുണ്യവും സൽസ്വഭാവവും പഠിക്കുന്ന വാർഷിക സീറത്ത് മത്സരം!',
    multiplierLabel: '2x നാണയം + ഹെറിറ്റേജ് കാർഡ്',
    questions: [
      {
        q: 'ലോകത്തിന് കാരുണ്യമായി (റഹ്മത്തൻ ലിൽ ആലമീൻ) നിയോഗിക്കപ്പെട്ട പ്രവാചകരുടെ മാതൃക നാം എങ്ങനെ പിന്തുടരണം?',
        options: [
          'സൽസ്വഭാവം, കാരുണ്യം, സത്യസന്ധത എന്നിവ നിത്യജീവിതത്തിൽ പകർത്തി',
          'പ്രസംഗങ്ങളിൽ മാത്രം പരാമർശിച്ച്',
          'തർക്കങ്ങളിലൂടെ മാത്രം',
          'മറ്റുള്ളവരെ വിമർശിച്ച്',
        ],
        correctIdx: 0,
        fact: 'തിരുനബി ﷺ പഠിപ്പിച്ച സൽസ്വഭാവവും കാരുണ്യവും ജീവിതത്തിൽ പകർത്തലാണ് യഥാർത്ഥ പ്രവാചക സ്നേഹം.',
      },
      {
        q: 'പ്രവാചക പ്രകീർത്തനമായ ബുർദയും മാപ്പിളപ്പാട്ടും ധാർമ്മിക ബോധത്തോടെ വളർത്തുന്ന SKSSF വേദി?',
        options: ['സർഗ്ഗലയം', 'വിഖായ', 'സഹചാരി', 'ഓർഗാനെറ്റ്'],
        correctIdx: 0,
        fact: 'സർഗ്ഗലയം വിദ്യാർത്ഥികളുടെ ഖിറാഅത്ത്, ബുർദ, കലിഗ്രഫി, സാഹിത്യ കഴിവുകൾ പ്രോത്സാഹിപ്പിക്കുന്നു.',
      },
      {
        q: 'ഖുർആനും ഹദീസും ശരിയായി മനസ്സിലാക്കാനുള്ള വിശ്വാസ്യതയുള്ള പരമ്പര ഏതാണ്?',
        options: [
          'നബി ﷺ → സ്വഹാബികൾ → സത്യപണ്ഡിതന്മാർ',
          'സോഷ്യൽ മീഡിയ കമന്റുകൾ മാത്രം',
          'സ്വന്തം ഊഹാപോഹങ്ങൾ',
          'അജ്ഞാത ഫോർവേഡ് സന്ദേശങ്ങൾ',
        ],
        correctIdx: 0,
        fact: 'സ്വഹാബികളിലൂടെയും സത്യപണ്ഡിതന്മാരിലൂടെയും കൈമാറിവന്ന ശുദ്ധമായ അറിവാണ് നാം മുറുകെ പിടിക്കേണ്ടത്.',
      },
    ],
  },
];

// ==================== BOOST & SEASONAL DETECTION ====================

export interface ActiveBoostInfo {
  is2xActive: boolean;
  reasonsMl: string[];
  multiplier: 1 | 2;
}

export function getActiveCoinBoost(now = new Date()): ActiveBoostInfo {
  const day = now.getDay(); // 5 = Friday
  const hour = now.getHours(); // 19..20 = 7 PM to 9 PM
  const reasonsMl: string[] = [];
  if (day === 5) reasonsMl.push('വെള്ളിയാഴ്ച ജുമുഅ സ്പെഷ്യൽ (2x)');
  if (hour >= 19 && hour < 21) reasonsMl.push('സായാഹ്ന പഠന സമയം 7–9 PM (2x)');
  return {
    is2xActive: reasonsMl.length > 0,
    reasonsMl,
    multiplier: reasonsMl.length > 0 ? 2 : 1,
  };
}

export function getActiveSeasonalEvent(now = new Date()): {
  event: SeasonalEventDef;
  isLiveWindow: boolean;
  year: number;
} {
  const m = now.getMonth() + 1; // 1..12
  const d = now.getDate();
  const year = now.getFullYear();

  // Fixed Gregorian 3-day windows
  if (m === 2 && d >= 18 && d <= 20) {
    return { event: SEASONAL_EVENTS_CATALOG[0], isLiveWindow: true, year };
  }
  if (m === 6 && d >= 4 && d <= 6) {
    return { event: SEASONAL_EVENTS_CATALOG[2], isLiveWindow: true, year };
  }
  if (m === 6 && d >= 18 && d <= 20) {
    return { event: SEASONAL_EVENTS_CATALOG[3], isLiveWindow: true, year };
  }
  if (m === 8 && d >= 14 && d <= 16) {
    return { event: SEASONAL_EVENTS_CATALOG[4], isLiveWindow: true, year };
  }

  // Approximate Islamic Hijri month check via Intl.DateTimeFormat islamic calendar (self-repeating every year!)
  try {
    const hijriMonth = parseInt(
      new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric' }).format(now),
      10
    );
    if (hijriMonth === 9) {
      return { event: SEASONAL_EVENTS_CATALOG[1], isLiveWindow: true, year };
    }
    if (hijriMonth === 3) {
      return { event: SEASONAL_EVENTS_CATALOG[5], isLiveWindow: true, year };
    }
  } catch {
    // Fallback if browser omits islamic calendar
  }

  // Otherwise highlight the nearest upcoming seasonal event so users can always practice & compare year-over-year
  const idx = (m + 5) % SEASONAL_EVENTS_CATALOG.length;
  return { event: SEASONAL_EVENTS_CATALOG[idx], isLiveWindow: false, year };
}

// ==================== STORAGE & GENESIS CREATION ====================

const ECO_STORAGE_KEY = 'skssf_ecosystem_state_v1';
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function appendLedgerBlock(
  chain: LedgerBlock[],
  input: Omit<LedgerBlock, 'index' | 'prevHash' | 'currentHash' | 'ts'>
): LedgerBlock[] {
  const prevHash =
    chain.length === 0 ? 'GENESIS-SKSSF-000000' : chain[chain.length - 1].currentHash;
  const blockInput = {
    index: chain.length,
    ts: Date.now(),
    action: input.action,
    deltaSilver: input.deltaSilver,
    deltaGold: input.deltaGold,
    deltaDiamond: input.deltaDiamond,
    deltaXp: input.deltaXp,
    meta: input.meta,
    prevHash,
  };
  const currentHash = computeLedgerBlockHash(blockInput);
  return [...chain, { ...blockInput, currentHash }];
}

export function createFreshEcosystemState(initialDisplayName?: string): EcosystemState {
  const daily = loadDailyAndProfileState();
  const savedName = initialDisplayName?.trim() || daily.profile.playerName?.trim() || '';
  const userId = generateUserId('B1');
  const handle = generateSuggestedHandle(savedName);
  const today = getLocalDateKey();

  // First-launch welcome gift: 50 Silver + 10 Gold recorded in Genesis Hash Chain block!
  const genesisChain = appendLedgerBlock([], {
    action: 'welcome_gift_genesis',
    deltaSilver: 50,
    deltaGold: 10,
    deltaDiamond: 0,
    deltaXp: 0,
    meta: `${userId}|origin:${getDynamicOrigin()}`,
  });

  return {
    version: 1,
    identity: {
      userId,
      batch: 'B1',
      handle,
      displayName: savedName,
      freeNameEditUsed: false,
      nameLocked: Boolean(daily.profile.lockedCertificateName),
      nameHistory: [],
      masterProfileLink: {
        linked: false,
        profileHubAppId: 'APP-SK-PROFILE-00',
        cloudSyncReady: true,
        playGamesSocketReady: true,
      },
      verificationTier: 0,
      canVerifyEntities: false,
      attestations: [],
      orgRoles: [],
      linkedApps: {
        'APP-SK-GUIDE-01': { connectedAt: Date.now(), syncVersion: 1 },
      },
    },
    wallet: {
      silver: 50,
      gold: 10,
      diamond: 0,
      lessonSilverEmitted: 0,
      lessonGoldEmitted: 0,
      lessonDiamondEmitted: 0,
      claimedXpMilestones: [],
      customCurrencies: {},
      assetSlots: [],
    },
    inventory: {
      quizHint5050: 1,
      quizHintTime: 1,
      streakFreezes: 0,
      freeRoamStageUnlocked: false,
      unlockedBadgeFrames: ['classic'],
      activeBadgeFrame: 'classic',
      unlockedSoundPacks: ['classic'],
      vipJumpPasses: 0,
    },
    exploration: {
      visitedHubs: [],
      claimedDiscoveryRewards: [],
    },
    social: {
      friends: [],
      burnedGiftIds: [],
      giftDateKey: today,
      giftsSentToday: 0,
      giftsReceivedToday: 0,
      giftedLessonIds: [],
      claimedInviteCodes: [],
    },
    progression: {
      collectedHeritageCards: ['hc_1926_samastha'],
      foundHiddenStars: [],
      claimedPassTiers: [],
      lessonStars: {},
      speedReplayDateKey: today,
      speedReplayCountToday: 0,
      consecutiveLessonsSinceBreak: 0,
      cooldownUntil: 0,
      completedBossLevels: [],
      rewardPackTriggersCount: 0,
      pendingPackReward: false,
      seasonalRecords: [],
      darsSyncStats: {
        kitabsLinked: ['فَتْحُ الْمُعِينْ', 'أَلْفِيَّةُ ابْنِ مَالِكْ'],
      },
    },
    ledger: genesisChain,
    tamperDetected: false,
  };
}

function sanitizeCustomCurrencies(raw: unknown): Record<string, CustomCurrencySlot> {
  const clean: Record<string, CustomCurrencySlot> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return clean;
  const src = raw as Record<string, unknown>;
  for (const key of Object.keys(src)) {
    if (FORBIDDEN_KEYS.has(key) || key.length > 40) continue;
    const val = src[key] as Partial<CustomCurrencySlot>;
    if (
      val &&
      typeof val === 'object' &&
      val.appId &&
      isAuthorizedAppId(val.appId) &&
      typeof val.balance === 'number' &&
      Number.isFinite(val.balance) &&
      typeof val.symbol === 'string' &&
      typeof val.labelMl === 'string'
    ) {
      clean[key] = {
        appId: val.appId,
        symbol: val.symbol.slice(0, 12),
        labelMl: val.labelMl.slice(0, 40),
        balance: Math.max(0, Math.round(val.balance)),
        updatedAt: typeof val.updatedAt === 'number' ? val.updatedAt : Date.now(),
      };
    }
  }
  return clean;
}

export function loadEcosystemState(): EcosystemState {
  try {
    const raw = localStorage.getItem(ECO_STORAGE_KEY);
    if (!raw) {
      const fresh = createFreshEcosystemState();
      saveEcosystemState(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<EcosystemState>;
    const fallback = createFreshEcosystemState();
    if (!parsed || typeof parsed !== 'object' || !parsed.identity || !parsed.wallet) {
      return fallback;
    }

    const ledger = Array.isArray(parsed.ledger) ? parsed.ledger : fallback.ledger;
    const rawSilver = typeof parsed.wallet.silver === 'number' ? Math.round(parsed.wallet.silver) : 50;
    const rawGold = typeof parsed.wallet.gold === 'number' ? Math.round(parsed.wallet.gold) : 10;
    const rawDiamond = typeof parsed.wallet.diamond === 'number' ? Math.round(parsed.wallet.diamond) : 0;

    const integrity = verifyHashChainIntegrity(ledger, {
      silver: rawSilver,
      gold: rawGold,
      diamond: rawDiamond,
    });

    // If localStorage was manually edited, recompute trusted balances directly from the valid prefix of the Hash Chain!
    let trustedSilver = rawSilver;
    let trustedGold = rawGold;
    let trustedDiamond = rawDiamond;
    let tamperDetected = false;
    let tamperMessage: string | undefined;

    if (!integrity.valid) {
      tamperDetected = true;
      tamperMessage =
        'ലോക്കൽ സ്റ്റോറേജിൽ അനധികൃത മാറ്റം കണ്ടെത്തി! ഹാഷ് ചെയിൻ ലെഡ്ജർ അനുസരിച്ച് യഥാർത്ഥ ബാലൻസ് സുരക്ഷിതമായി പുനഃസ്ഥാപിച്ചു.';
      let s = 0;
      let g = 0;
      let d = 0;
      for (let i = 0; i < ledger.length; i++) {
        const blk = ledger[i];
        const expectedPrev = i === 0 ? 'GENESIS-SKSSF-000000' : ledger[i - 1].currentHash;
        if (blk.prevHash !== expectedPrev) break;
        const hash = computeLedgerBlockHash({
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
        if (hash !== blk.currentHash) break;
        s += blk.deltaSilver;
        g += blk.deltaGold;
        d += blk.deltaDiamond;
      }
      trustedSilver = Math.max(0, s);
      trustedGold = Math.max(0, g);
      trustedDiamond = Math.max(0, d);
    }

    const today = getLocalDateKey();
    const sameGiftDay = parsed.social?.giftDateKey === today;
    const sameReplayDay = parsed.progression?.speedReplayDateKey === today;

    const merged: EcosystemState = {
      version: 1,
      identity: {
        ...fallback.identity,
        ...parsed.identity,
        userId: isValidUserId(parsed.identity.userId || '')
          ? parsed.identity.userId
          : fallback.identity.userId,
        batch: getUserBatchFromId(parsed.identity.userId || fallback.identity.userId),
        masterProfileLink: {
          ...fallback.identity.masterProfileLink,
          ...(parsed.identity.masterProfileLink || {}),
        },
        attestations: Array.isArray(parsed.identity.attestations)
          ? parsed.identity.attestations.slice(-30)
          : [],
        orgRoles: Array.isArray(parsed.identity.orgRoles)
          ? parsed.identity.orgRoles.slice(0, 12)
          : [],
        nameHistory: Array.isArray(parsed.identity.nameHistory)
          ? parsed.identity.nameHistory.slice(-20)
          : [],
        linkedApps: parsed.identity.linkedApps || fallback.identity.linkedApps,
      },
      wallet: {
        ...fallback.wallet,
        ...parsed.wallet,
        silver: trustedSilver,
        gold: trustedGold,
        diamond: trustedDiamond,
        claimedXpMilestones: Array.isArray(parsed.wallet.claimedXpMilestones)
          ? parsed.wallet.claimedXpMilestones
          : [],
        customCurrencies: sanitizeCustomCurrencies(parsed.wallet.customCurrencies),
        assetSlots: Array.isArray(parsed.wallet.assetSlots)
          ? parsed.wallet.assetSlots.filter((a) => a && isAuthorizedAppId(a.appId))
          : [],
      },
      inventory: {
        ...fallback.inventory,
        ...(parsed.inventory || {}),
      },
      exploration: {
        visitedHubs: Array.isArray(parsed.exploration?.visitedHubs)
          ? parsed.exploration.visitedHubs
          : [],
        claimedDiscoveryRewards: Array.isArray(parsed.exploration?.claimedDiscoveryRewards)
          ? parsed.exploration.claimedDiscoveryRewards
          : [],
      },
      social: {
        ...fallback.social,
        ...(parsed.social || {}),
        giftDateKey: today,
        giftsSentToday: sameGiftDay ? parsed.social?.giftsSentToday ?? 0 : 0,
        giftsReceivedToday: sameGiftDay ? parsed.social?.giftsReceivedToday ?? 0 : 0,
        friends: Array.isArray(parsed.social?.friends) ? parsed.social.friends : [],
        burnedGiftIds: Array.isArray(parsed.social?.burnedGiftIds)
          ? parsed.social.burnedGiftIds.slice(-300)
          : [],
        giftedLessonIds: Array.isArray(parsed.social?.giftedLessonIds)
          ? parsed.social.giftedLessonIds
          : [],
        claimedInviteCodes: Array.isArray(parsed.social?.claimedInviteCodes)
          ? parsed.social.claimedInviteCodes
          : [],
      },
      progression: {
        ...fallback.progression,
        ...(parsed.progression || {}),
        speedReplayDateKey: today,
        speedReplayCountToday: sameReplayDay
          ? parsed.progression?.speedReplayCountToday ?? 0
          : 0,
        collectedHeritageCards: Array.isArray(parsed.progression?.collectedHeritageCards)
          ? Array.from(new Set(['hc_1926_samastha', ...parsed.progression.collectedHeritageCards]))
          : ['hc_1926_samastha'],
        foundHiddenStars: Array.isArray(parsed.progression?.foundHiddenStars)
          ? parsed.progression.foundHiddenStars
          : [],
        claimedPassTiers: Array.isArray(parsed.progression?.claimedPassTiers)
          ? parsed.progression.claimedPassTiers
          : [],
        lessonStars: parsed.progression?.lessonStars || {},
        completedBossLevels: Array.isArray(parsed.progression?.completedBossLevels)
          ? parsed.progression.completedBossLevels
          : [],
        seasonalRecords: Array.isArray(parsed.progression?.seasonalRecords)
          ? parsed.progression.seasonalRecords
          : [],
        darsSyncStats: parsed.progression?.darsSyncStats || fallback.progression.darsSyncStats,
      },
      ledger,
      tamperDetected,
      tamperMessage,
    };

    return merged;
  } catch {
    const fresh = createFreshEcosystemState();
    saveEcosystemState(fresh);
    return fresh;
  }
}

export function saveEcosystemState(state: EcosystemState): void {
  try {
    localStorage.setItem(ECO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearEcosystemStorage(): void {
  try {
    localStorage.removeItem(ECO_STORAGE_KEY);
    localStorage.removeItem(SYNC_QUEUE_KEY);
  } catch {
    // Ignore
  }
}

// ==================== CONTEXT INTERFACE ====================

export interface EcosystemActionResult {
  ok: boolean;
  message: string;
  data?: unknown;
}

export interface EcosystemContextValue {
  state: EcosystemState;
  boostInfo: ActiveBoostInfo;
  activeSeasonal: { event: SeasonalEventDef; isLiveWindow: boolean; year: number };
  ledgerHead: string;
  /** Award or deduct currencies with Hash Chain ledger block */
  transactCurrency: (params: {
    action: string;
    deltaSilver?: number;
    deltaGold?: number;
    deltaDiamond?: number;
    deltaXp?: number;
    meta?: string;
    applyBoost?: boolean;
    fromLesson?: boolean;
  }) => EcosystemActionResult;
  /** Claim +1 Diamond for every 500 XP milestone without reducing XP */
  claimXpDiamondMilestone: (currentXp: number) => EcosystemActionResult;
  getClaimableXpMilestones: (currentXp: number) => number[];
  /** Two-way Knowledge Exchange conversions */
  exchangeCurrency: (
    direction: 'silver_to_gold' | 'gold_to_diamond' | 'diamond_to_gold' | 'diamond_to_silver'
  ) => EcosystemActionResult;
  /** Purchase items from Knowledge Market store */
  purchaseStoreItem: (
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
  ) => EcosystemActionResult;
  /** Guided exploration tracking + discovery rewards */
  markHubVisited: (hub: GuidedHubId) => { newlyVisited: boolean; rewardText?: string };
  /** Identity & Rename Pass */
  updateDisplayNameWithRules: (
    newName: string,
    usePaidRenamePass?: boolean
  ) => EcosystemActionResult;
  updateHandle: (rawHandle: string) => EcosystemActionResult;
  configureMasterProfileLink: (params: {
    institutionId?: string;
    organizationId?: string;
    pin4?: string;
  }) => EcosystemActionResult;
  connectAuthorizedApp: (appId: AuthorizedAppId) => EcosystemActionResult;
  /** Anti-Slot-Injection entry point for external plugins/custom currencies */
  injectAuthorizedSlotAsset: (params: {
    appId: string;
    payloadJson: string;
    signature: string;
    slotType: 'customCurrencies' | 'assetSlots';
  }) => EcosystemActionResult;
  /** Friends & Gifts */
  addVerifiedFriend: (friend: {
    userId: string;
    handle?: string;
    displayName: string;
    verificationTier?: number;
    seasonalScore?: number;
  }) => EcosystemActionResult;
  removeFriend: (userId: string) => void;
  createRecipientLockedGift: (params: {
    toUserId: string;
    kind: 'silver' | 'gold' | 'diamond' | 'lesson_unlock';
    amount: number;
    lessonId?: string;
    lessonTitle?: string;
    note?: string;
  }) => { ok: boolean; message: string; voucher?: SignedGiftVoucher; code?: string; url?: string };
  redeemRecipientLockedGift: (rawCode: string) => EcosystemActionResult;
  registerInvitedBy: (inviterId: string, inviterName?: string) => void;
  redeemFriendInviteMilestone: (rawCode: string) => EcosystemActionResult;
  /** Heritage, Hidden Stars, 14-Day Pass, Mastery Stars, Boss, Cooldown, Pack Reward */
  unlockHeritageCard: (cardId: string) => void;
  claimHiddenStar: (starId: string) => EcosystemActionResult;
  claimPassTier: (
    tierNumber: number,
    completedLessonsCount: number,
    streakDays: number
  ) => EcosystemActionResult;
  recordLessonMastery: (
    lessonId: string,
    stars: 1 | 2 | 3,
    isSpeedReplay?: boolean
  ) => { silverEarned: number; triggerPackReward: boolean; triggerCooldown: boolean };
  consumePendingPackReward: () => void;
  grantVipJumpPass: () => void;
  consumeVipJumpPass: () => boolean;
  triggerCooldownNow: () => void;
  skipCooldown: (payWith: 'gold' | 'diamond') => EcosystemActionResult;
  markBossLevelComplete: (level: number) => void;
  recordSeasonalResult: (eventId: string, score: number, total: number) => void;
  consumeQuizHint: (kind: '5050' | 'time') => boolean;
  dismissTamperBanner: () => void;
  deleteProfileAndResetEcosystem: () => void;
  setActiveBadgeFrame: (frameId: string) => void;
  grantWebOfTrustAttestation: (attesterId: string, attesterName: string) => EcosystemActionResult;
}

const EcosystemContext = createContext<EcosystemContextValue | null>(null);

export const useEcosystem = (): EcosystemContextValue => {
  const ctx = useContext(EcosystemContext);
  if (!ctx) {
    throw new Error('useEcosystem must be used inside EcosystemProvider');
  }
  return ctx;
};

export const EcosystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<EcosystemState>(() => loadEcosystemState());
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  useEffect(() => {
    saveEcosystemState(state);
  }, [state]);

  // Refresh time-based 2x boost (Friday / 7-9 PM) every 60 seconds
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const boostInfo = useMemo(() => getActiveCoinBoost(new Date(nowTick)), [nowTick]);
  const activeSeasonal = useMemo(() => getActiveSeasonalEvent(new Date(nowTick)), [nowTick]);
  const ledgerHead = state.ledger[state.ledger.length - 1]?.currentHash ?? 'GENESIS';

  const transactCurrency = useCallback(
    (params: {
      action: string;
      deltaSilver?: number;
      deltaGold?: number;
      deltaDiamond?: number;
      deltaXp?: number;
      meta?: string;
      applyBoost?: boolean;
      fromLesson?: boolean;
    }): EcosystemActionResult => {
      let result: EcosystemActionResult = { ok: true, message: 'ഇടപാട് പൂർത്തിയായി.' };
      setState((prev) => {
        const mult = params.applyBoost && boostInfo.is2xActive ? 2 : 1;
        let dS = Math.round((params.deltaSilver ?? 0) * (params.deltaSilver && params.deltaSilver > 0 ? mult : 1));
        let dG = Math.round((params.deltaGold ?? 0) * (params.deltaGold && params.deltaGold > 0 ? mult : 1));
        let dD = Math.round(params.deltaDiamond ?? 0);
        const dXp = Math.round(params.deltaXp ?? 0);

        // Enforce anti-inflation caps for lesson earnings
        let nextLessonS = prev.wallet.lessonSilverEmitted;
        let nextLessonG = prev.wallet.lessonGoldEmitted;
        let nextLessonD = prev.wallet.lessonDiamondEmitted;

        if (params.fromLesson) {
          if (dS > 0) {
            const room = Math.max(0, ANTI_INFLATION_CAPS.MAX_SILVER_FROM_LESSONS - nextLessonS);
            dS = Math.min(dS, room);
            nextLessonS += dS;
          }
          if (dG > 0) {
            const room = Math.max(0, ANTI_INFLATION_CAPS.MAX_GOLD_FROM_LESSONS - nextLessonG);
            dG = Math.min(dG, room);
            nextLessonG += dG;
          }
          if (dD > 0) {
            const room = Math.max(0, ANTI_INFLATION_CAPS.MAX_DIAMOND_FROM_LESSONS - nextLessonD);
            dD = Math.min(dD, room);
            nextLessonD += dD;
          }
        }

        const nextS = prev.wallet.silver + dS;
        const nextG = prev.wallet.gold + dG;
        const nextD = prev.wallet.diamond + dD;

        if (nextS < 0 || nextG < 0 || nextD < 0) {
          result = { ok: false, message: 'ആവശ്യമായ നാണയങ്ങൾ / വജ്രങ്ങൾ വാലറ്റിൽ ഇല്ല.' };
          return prev;
        }

        const nextLedger = appendLedgerBlock(prev.ledger, {
          action: params.action,
          deltaSilver: dS,
          deltaGold: dG,
          deltaDiamond: dD,
          deltaXp: dXp,
          meta: params.meta,
        });

        ecosystemSyncAdapter.enqueueMutation({
          id: `mut_${Date.now()}`,
          batch: prev.identity.batch,
          userId: prev.identity.userId,
          ledgerHead: nextLedger[nextLedger.length - 1].currentHash,
          ts: Date.now(),
          kind: 'wallet_delta',
        });

        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            silver: nextS,
            gold: nextG,
            diamond: nextD,
            lessonSilverEmitted: nextLessonS,
            lessonGoldEmitted: nextLessonG,
            lessonDiamondEmitted: nextLessonD,
          },
          ledger: nextLedger,
        };
      });
      return result;
    },
    [boostInfo.is2xActive]
  );

  const getClaimableXpMilestones = useCallback(
    (currentXp: number): number[] => {
      const claimable: number[] = [];
      const maxTier = Math.floor(Math.max(0, currentXp) / 500) * 500;
      for (let m = 500; m <= maxTier; m += 500) {
        if (!state.wallet.claimedXpMilestones.includes(m)) {
          claimable.push(m);
        }
      }
      return claimable;
    },
    [state.wallet.claimedXpMilestones]
  );

  const claimXpDiamondMilestone = useCallback(
    (currentXp: number): EcosystemActionResult => {
      const claimable = getClaimableXpMilestones(currentXp);
      if (claimable.length === 0) {
        return {
          ok: false,
          message: 'അടുത്ത 500 XP മൈൽസ്റ്റോൺ പൂർത്തിയാക്കുമ്പോൾ +1 വജ്രം ക്ലെയിം ചെയ്യാം.',
        };
      }
      const nextMilestone = claimable[0];
      setState((prev) => {
        if (prev.wallet.claimedXpMilestones.includes(nextMilestone)) return prev;
        const nextLedger = appendLedgerBlock(prev.ledger, {
          action: 'xp_500_milestone_diamond',
          deltaSilver: 0,
          deltaGold: 0,
          deltaDiamond: 1,
          deltaXp: 0,
          meta: `milestone:${nextMilestone}XP`,
        });
        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            diamond: prev.wallet.diamond + 1,
            claimedXpMilestones: [...prev.wallet.claimedXpMilestones, nextMilestone],
          },
          ledger: nextLedger,
        };
      });
      return {
        ok: true,
        message: `🎉 ${nextMilestone} XP മൈൽസ്റ്റോൺ ബോണസ്! +1 വജ്രം (Diamond) ലഭിച്ചു (നിങ്ങളുടെ XP കുറയില്ല!).`,
      };
    },
    [getClaimableXpMilestones]
  );

  const exchangeCurrency = useCallback(
    (
      direction: 'silver_to_gold' | 'gold_to_diamond' | 'diamond_to_gold' | 'diamond_to_silver'
    ): EcosystemActionResult => {
      if (direction === 'silver_to_gold') {
        return transactCurrency({
          action: 'exchange_silver_to_gold',
          deltaSilver: -100,
          deltaGold: 10,
          meta: '100S->10G',
        });
      }
      if (direction === 'gold_to_diamond') {
        return transactCurrency({
          action: 'exchange_gold_to_diamond',
          deltaGold: -100,
          deltaDiamond: 1,
          meta: '100G->1D',
        });
      }
      if (direction === 'diamond_to_gold') {
        return transactCurrency({
          action: 'exchange_diamond_to_gold',
          deltaDiamond: -1,
          deltaGold: 80,
          meta: '1D->80G',
        });
      }
      return transactCurrency({
        action: 'exchange_diamond_to_silver',
        deltaDiamond: -1,
        deltaSilver: 800,
        meta: '1D->800S',
      });
    },
    [transactCurrency]
  );

  const purchaseStoreItem = useCallback(
    (
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
    ): EcosystemActionResult => {
      let outcome: EcosystemActionResult = { ok: false, message: 'വാങ്ങാൻ കഴിഞ്ഞില്ല.' };
      setState((prev) => {
        let dS = 0;
        let dG = 0;
        let dD = 0;
        const nextInv = { ...prev.inventory };
        let nextCooldown = prev.progression.cooldownUntil;
        let nextConsecutive = prev.progression.consecutiveLessonsSinceBreak;

        switch (item) {
          case 'hint_5050':
            dS = -50;
            nextInv.quizHint5050 += 1;
            outcome = { ok: true, message: '✅ 50:50 ക്വിസ് ഹിന്റ് (+1) വാങ്ങി!' };
            break;
          case 'hint_time':
            dS = -35;
            nextInv.quizHintTime += 1;
            outcome = { ok: true, message: '✅ +15 സെക്കൻഡ് ടൈം ബൂസ്റ്റ് (+1) വാങ്ങി!' };
            break;
          case 'cooldown_skip_gold':
            dG = -ANTI_INFLATION_CAPS.COOLDOWN_SKIP_GOLD;
            nextCooldown = 0;
            nextConsecutive = 0;
            outcome = { ok: true, message: '⚡ 1 മണിക്കൂർ കൂൾഡൗൺ ഒഴിവാക്കി! ഇപ്പോൾ തുടരാം.' };
            break;
          case 'cooldown_skip_diamond':
            dD = -ANTI_INFLATION_CAPS.COOLDOWN_SKIP_DIAMOND;
            nextCooldown = 0;
            nextConsecutive = 0;
            outcome = { ok: true, message: '💎 1 വജ്രം നൽകി കൂൾഡൗൺ ഒഴിവാക്കി!' };
            break;
          case 'extra_hp':
            dG = -ANTI_INFLATION_CAPS.EXTRA_HP_GOLD;
            outcome = { ok: true, message: '❤️ അധിക ജീവൻ (Extra HP) ലഭിച്ചു!' };
            break;
          case 'free_roam':
            if (prev.inventory.freeRoamStageUnlocked) {
              outcome = { ok: false, message: 'ഫ്രീ-റോം സ്റ്റേജ് അൺലോക്ക് ഇതിനകം സ്വന്തമാണ്.' };
              return prev;
            }
            dG = -ANTI_INFLATION_CAPS.FREE_ROAM_GOLD;
            nextInv.freeRoamStageUnlocked = true;
            outcome = { ok: true, message: '🗺️ ഫ്രീ-റോം സ്റ്റേജ് അൺലോക്ക് സജീവമായി!' };
            break;
          case 'streak_freeze':
            dD = -ANTI_INFLATION_CAPS.STREAK_FREEZE_DIAMOND;
            nextInv.streakFreezes += 1;
            outcome = { ok: true, message: '❄️ സ്ട്രീക്ക് ഫ്രീസ് (+1) സുരക്ഷിതമാക്കി!' };
            break;
          case 'frame_royal_emerald':
            if (prev.inventory.unlockedBadgeFrames.includes('royal_emerald')) {
              outcome = { ok: false, message: 'റോയൽ എമറാൾഡ് ഫ്രെയിം ഇതിനകം അൺലോക്കാണ്.' };
              return prev;
            }
            dD = -ANTI_INFLATION_CAPS.BADGE_FRAME_DIAMOND;
            nextInv.unlockedBadgeFrames = [...prev.inventory.unlockedBadgeFrames, 'royal_emerald'];
            nextInv.activeBadgeFrame = 'royal_emerald';
            outcome = { ok: true, message: '🛡️ റോയൽ എമറാൾഡ് ബാഡ്ജ് ഫ്രെയിം അൺലോക്ക് ചെയ്തു!' };
            break;
          case 'frame_malabar_gold':
            if (prev.inventory.unlockedBadgeFrames.includes('malabar_gold')) {
              outcome = { ok: false, message: 'മലബാർ ഗോൾഡ് ഫ്രെയിം ഇതിനകം അൺലോക്കാണ്.' };
              return prev;
            }
            dD = -ANTI_INFLATION_CAPS.BADGE_FRAME_DIAMOND;
            nextInv.unlockedBadgeFrames = [...prev.inventory.unlockedBadgeFrames, 'malabar_gold'];
            nextInv.activeBadgeFrame = 'malabar_gold';
            outcome = { ok: true, message: '✨ മലബാർ ഗോൾഡ് ബാഡ്ജ് ഫ്രെയിം അൺലോക്ക് ചെയ്തു!' };
            break;
          case 'sound_malabar_oud':
            if (prev.inventory.unlockedSoundPacks.includes('malabar_oud')) {
              outcome = { ok: false, message: 'ഈ ആംബിയന്റ് സൗണ്ട് പാക്ക് ഇതിനകം സ്വന്തമാണ്.' };
              return prev;
            }
            dD = -ANTI_INFLATION_CAPS.SOUND_PACK_DIAMOND;
            nextInv.unlockedSoundPacks = [...prev.inventory.unlockedSoundPacks, 'malabar_oud'];
            outcome = { ok: true, message: '🎵 മലബാർ ഊദ് ആംബിയന്റ് സൗണ്ട് പാക്ക് അൺലോക്ക് ചെയ്തു!' };
            break;
          case 'sound_haram_chimes':
            if (prev.inventory.unlockedSoundPacks.includes('haram_chimes')) {
              outcome = { ok: false, message: 'ഈ ആംബിയന്റ് സൗണ്ട് പാക്ക് ഇതിനകം സ്വന്തമാണ്.' };
              return prev;
            }
            dD = -ANTI_INFLATION_CAPS.SOUND_PACK_DIAMOND;
            nextInv.unlockedSoundPacks = [...prev.inventory.unlockedSoundPacks, 'haram_chimes'];
            outcome = { ok: true, message: '🔔 ക്രിസ്റ്റൽ ആംബിയന്റ് സൗണ്ട് പാക്ക് അൺലോക്ക് ചെയ്തു!' };
            break;
        }

        if (
          prev.wallet.silver + dS < 0 ||
          prev.wallet.gold + dG < 0 ||
          prev.wallet.diamond + dD < 0
        ) {
          outcome = { ok: false, message: 'ആവശ്യമായ നാണയങ്ങൾ / വജ്രങ്ങൾ വാലറ്റിൽ ഇല്ല.' };
          return prev;
        }

        const nextLedger = appendLedgerBlock(prev.ledger, {
          action: `store_buy_${item}`,
          deltaSilver: dS,
          deltaGold: dG,
          deltaDiamond: dD,
          deltaXp: 0,
          meta: item,
        });

        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            silver: prev.wallet.silver + dS,
            gold: prev.wallet.gold + dG,
            diamond: prev.wallet.diamond + dD,
          },
          inventory: nextInv,
          progression: {
            ...prev.progression,
            cooldownUntil: nextCooldown,
            consecutiveLessonsSinceBreak: nextConsecutive,
          },
          ledger: nextLedger,
        };
      });
      return outcome;
    },
    []
  );

  const markHubVisited = useCallback(
    (hub: GuidedHubId): { newlyVisited: boolean; rewardText?: string } => {
      let newlyVisited = false;
      let rewardText: string | undefined;

      setState((prev) => {
        if (prev.exploration.visitedHubs.includes(hub)) return prev;
        newlyVisited = true;
        const nextVisited = [...prev.exploration.visitedHubs, hub];
        const nextClaimed = [...prev.exploration.claimedDiscoveryRewards];
        let dS = 0;
        let dG = 0;
        const notes: string[] = [];

        if (hub === 'market' && !nextClaimed.includes('disc_market')) {
          dS += 10;
          nextClaimed.push('disc_market');
          notes.push('+10 വെള്ളി നാണയം (വിജ്ഞാന മാർക്കറ്റ് സന്ദർശനം)');
        }
        if (hub === 'album' && !nextClaimed.includes('disc_album')) {
          dS += 10;
          nextClaimed.push('disc_album');
          notes.push('+10 വെള്ളി നാണയം (പൈതൃക ആൽബം സന്ദർശനം)');
        }
        if (
          ALL_GUIDED_HUBS.every((h) => nextVisited.includes(h)) &&
          !nextClaimed.includes('disc_all_6')
        ) {
          dG += 15;
          nextClaimed.push('disc_all_6');
          notes.push('+15 സ്വർണ്ണ നാണയം (6 പുതിയ വിഭാഗങ്ങളും പര്യവേക്ഷണം ചെയ്തു!)');
        }

        if (notes.length > 0) {
          rewardText = notes.join(' · ');
        }

        const nextLedger =
          dS > 0 || dG > 0
            ? appendLedgerBlock(prev.ledger, {
                action: `discovery_reward_${hub}`,
                deltaSilver: dS,
                deltaGold: dG,
                deltaDiamond: 0,
                deltaXp: 0,
                meta: notes.join(';'),
              })
            : prev.ledger;

        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            silver: prev.wallet.silver + dS,
            gold: prev.wallet.gold + dG,
          },
          exploration: {
            visitedHubs: nextVisited,
            claimedDiscoveryRewards: nextClaimed,
          },
          ledger: nextLedger,
        };
      });

      return { newlyVisited, rewardText };
    },
    []
  );

  const updateDisplayNameWithRules = useCallback(
    (newName: string, usePaidRenamePass = false): EcosystemActionResult => {
      const clean = sanitizeFinalPlayerText(newName, 40);
      if (clean.length < 2) {
        return { ok: false, message: 'കുറഞ്ഞത് 2 അക്ഷരമുള്ള ശരിയായ പേര് നൽകുക.' };
      }

      let outcome: EcosystemActionResult = { ok: false, message: 'പേര് അപ്ഡേറ്റ് ചെയ്യാനായില്ല.' };

      setState((prev) => {
        const oldName = prev.identity.displayName;
        if (oldName === clean) {
          outcome = { ok: false, message: 'ഇതേ പേര് തന്നെയാണ് നിലവിലുള്ളത്.' };
          return prev;
        }

        // Initial name registration (first time setting name)
        if (!oldName) {
          const nextLedger = appendLedgerBlock(prev.ledger, {
            action: 'identity_name_register',
            deltaSilver: 0,
            deltaGold: 0,
            deltaDiamond: 0,
            deltaXp: 0,
            meta: `name:${clean}`,
          });
          const daily = loadDailyAndProfileState();
          saveDailyAndProfileState({
            ...daily,
            profile: { ...daily.profile, playerName: clean },
          });
          outcome = {
            ok: true,
            message:
              '✅ പേര് രജിസ്റ്റർ ചെയ്തു! അക്ഷരത്തെറ്റ് തിരുത്താൻ 1 സൗജന്യ അവസരം കൂടി ഉണ്ടാകും; അതിനുശേഷം പേര് ലോക്കാകും.',
          };
          return {
            ...prev,
            identity: { ...prev.identity, displayName: clean },
            ledger: nextLedger,
          };
        }

        // 1 free spelling-correction edit before permanent lock
        if (!prev.identity.freeNameEditUsed && !prev.identity.nameLocked) {
          const record: NameHistoryRecord = {
            oldName,
            newName: clean,
            changedAt: Date.now(),
            method: 'free_typo_fix',
          };
          const nextLedger = appendLedgerBlock(prev.ledger, {
            action: 'identity_free_spelling_fix',
            deltaSilver: 0,
            deltaGold: 0,
            deltaDiamond: 0,
            deltaXp: 0,
            meta: `${oldName}->${clean}`,
          });
          const daily = loadDailyAndProfileState();
          saveDailyAndProfileState({
            ...daily,
            profile: {
              ...daily.profile,
              playerName: clean,
              lockedCertificateName: clean,
            },
          });
          outcome = {
            ok: true,
            message:
              '✅ സൗജന്യ അക്ഷരത്തെറ്റ് തിരുത്തൽ പൂർത്തിയായി! ഇനി പേര് ലോക്കാണ് (മാറ്റണമെങ്കിൽ 10 വജ്രത്തിന്റെ നെയിം ചേഞ്ച് കാർഡ് ഉപയോഗിക്കാം).',
          };
          return {
            ...prev,
            identity: {
              ...prev.identity,
              displayName: clean,
              freeNameEditUsed: true,
              nameLocked: true,
              nameHistory: [...prev.identity.nameHistory, record],
            },
            ledger: nextLedger,
          };
        }

        // After lock: requires 10-Diamond Name Rename Pass!
        if (!usePaidRenamePass) {
          outcome = {
            ok: false,
            message:
              'സൗജന്യ തിരുത്തൽ അവസരം കഴിഞ്ഞു. പേര് മാറ്റാൻ 10 വജ്രത്തിന്റെ "🪪 നെയിം ചേഞ്ച് കാർഡ്" ഉപയോഗിക്കുക.',
          };
          return prev;
        }

        if (prev.wallet.diamond < ANTI_INFLATION_CAPS.RENAME_PASS_DIAMOND) {
          outcome = {
            ok: false,
            message: `നെയിം ചേഞ്ച് കാർഡിന് ${ANTI_INFLATION_CAPS.RENAME_PASS_DIAMOND} വജ്രങ്ങൾ ആവശ്യമാണ് (നിലവിൽ: ${prev.wallet.diamond}).`,
          };
          return prev;
        }

        const record: NameHistoryRecord = {
          oldName,
          newName: clean,
          changedAt: Date.now(),
          method: 'rename_pass_10d',
        };
        const nextLedger = appendLedgerBlock(prev.ledger, {
          action: 'identity_name_rename_pass_10d',
          deltaSilver: 0,
          deltaGold: 0,
          deltaDiamond: -ANTI_INFLATION_CAPS.RENAME_PASS_DIAMOND,
          deltaXp: 0,
          meta: `${prev.identity.userId}:${oldName}->${clean}`,
        });
        const daily = loadDailyAndProfileState();
        saveDailyAndProfileState({
          ...daily,
          profile: {
            ...daily.profile,
            playerName: clean,
            lockedCertificateName: clean,
          },
        });
        outcome = {
          ok: true,
          message: `🪪 നെയിം ചേഞ്ച് കാർഡ് വിജയകരം! നിങ്ങളുടെ ${prev.identity.userId} ഐഡി അതേപടി നിലനിർത്തി പേര് "${clean}" എന്നാക്കി.`,
        };
        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            diamond: prev.wallet.diamond - ANTI_INFLATION_CAPS.RENAME_PASS_DIAMOND,
          },
          identity: {
            ...prev.identity,
            displayName: clean,
            nameLocked: true,
            nameHistory: [...prev.identity.nameHistory, record],
          },
          ledger: nextLedger,
        };
      });

      return outcome;
    },
    []
  );

  const updateHandle = useCallback((rawHandle: string): EcosystemActionResult => {
    const clean = sanitizeHandle(rawHandle);
    if (!clean) {
      return {
        ok: false,
        message: 'കുറഞ്ഞത് 3 ഇംഗ്ലീഷ് അക്ഷരങ്ങളോ അക്കങ്ങളോ ഉള്ള യൂസർനെയിം നൽകുക (ഉദാ: @rashid_sk26).',
      };
    }
    setState((prev) => ({
      ...prev,
      identity: { ...prev.identity, handle: clean },
    }));
    return { ok: true, message: `✅ യൂസർനെയിം ${clean} ആയി സേവ് ചെയ്തു!` };
  }, []);

  const configureMasterProfileLink = useCallback(
    (params: { institutionId?: string; organizationId?: string; pin4?: string }): EcosystemActionResult => {
      if (params.institutionId && !isValidInstitutionId(params.institutionId)) {
        return { ok: false, message: 'സ്ഥാപന ഐഡി INS-SK-XXXX മാതൃകയിലായിരിക്കണം.' };
      }
      if (params.organizationId && !isValidOrganizationId(params.organizationId)) {
        return { ok: false, message: 'സംഘടനാ/യൂണിറ്റ് ഐഡി ORG-SK-XXXX മാതൃകയിലായിരിക്കണം.' };
      }
      if (params.pin4 && !/^\d{4}$/.test(params.pin4.trim())) {
        return { ok: false, message: 'സുരക്ഷാ PIN കൃത്യം 4 അക്കങ്ങളായിരിക്കണം.' };
      }
      setState((prev) => ({
        ...prev,
        identity: {
          ...prev.identity,
          ...(params.pin4 ? { pinHash: sha256Hex(`PIN::${prev.identity.userId}::${params.pin4}`) } : {}),
          masterProfileLink: {
            ...prev.identity.masterProfileLink,
            linked: true,
            institutionId: params.institutionId?.trim().toUpperCase() || prev.identity.masterProfileLink.institutionId,
            organizationId: params.organizationId?.trim().toUpperCase() || prev.identity.masterProfileLink.organizationId,
            linkedAt: Date.now(),
          },
          linkedApps: {
            ...prev.identity.linkedApps,
            'APP-SK-PROFILE-00': { connectedAt: Date.now(), syncVersion: 1 },
          },
        },
      }));
      return { ok: true, message: '🔗 മാസ്റ്റർ പ്രൊഫൈൽ (APP-SK-PROFILE-00) സോക്കറ്റ് വിജയകരമായി ബന്ധിപ്പിച്ചു!' };
    },
    []
  );

  const connectAuthorizedApp = useCallback((appId: AuthorizedAppId): EcosystemActionResult => {
    setState((prev) => ({
      ...prev,
      identity: {
        ...prev.identity,
        linkedApps: {
          ...prev.identity.linkedApps,
          [appId]: { connectedAt: Date.now(), syncVersion: 1 },
        },
      },
      progression:
        appId === 'APP-SK-DARS-05'
          ? {
              ...prev.progression,
              collectedHeritageCards: Array.from(
                new Set([...prev.progression.collectedHeritageCards, 'hc_dars_kitabs'])
              ),
              darsSyncStats: {
                kitabsLinked: ['فَتْحُ الْمُعِينْ', 'أَلْفِيَّةُ ابْنِ مَالِكْ', 'كُتُبُ الدَّرْسِ'],
                lastSyncedAt: Date.now(),
              },
            }
          : prev.progression,
    }));
    return { ok: true, message: `✅ ${appId} ഇക്കോസിസ്റ്റം സോക്കറ്റ് സജീവമായി!` };
  }, []);

  const injectAuthorizedSlotAsset = useCallback(
    (params: {
      appId: string;
      payloadJson: string;
      signature: string;
      slotType: 'customCurrencies' | 'assetSlots';
    }): EcosystemActionResult => {
      const check = verifyAuthorizedAppSignature(
        params.appId,
        params.payloadJson,
        params.signature,
        params.slotType
      );
      if (!check.valid) {
        return { ok: false, message: check.reason || 'അനധികൃത സ്ലോട്ട് ഇഞ്ചക്ഷൻ തടഞ്ഞു!' };
      }
      try {
        const parsed = JSON.parse(params.payloadJson);
        if (params.slotType === 'customCurrencies') {
          const key = String(parsed.key || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
          if (!key || FORBIDDEN_KEYS.has(key)) {
            return { ok: false, message: 'തെറ്റായ കറൻസി സ്ലോട്ട് കീ.' };
          }
          setState((prev) => ({
            ...prev,
            wallet: {
              ...prev.wallet,
              customCurrencies: {
                ...prev.wallet.customCurrencies,
                [key]: {
                  appId: params.appId as AuthorizedAppId,
                  symbol: String(parsed.symbol || '🪙').slice(0, 10),
                  labelMl: String(parsed.labelMl || key).slice(0, 40),
                  balance: Math.max(0, Math.round(Number(parsed.balance || 0))),
                  updatedAt: Date.now(),
                },
              },
            },
          }));
          return { ok: true, message: `✅ ${params.appId} കസ്റ്റം കറൻസി സ്ലോട്ട് വെരിഫൈ ചെയ്ത് ചേർത്തു.` };
        }
        const slot: AuthorizedAssetSlot = {
          slotId: String(parsed.slotId || `SLOT-${Date.now()}`).slice(0, 40),
          appId: params.appId as AuthorizedAppId,
          titleMl: String(parsed.titleMl || 'അംഗീകൃത ആപ്പ് അസറ്റ്').slice(0, 60),
          kind: parsed.kind || 'badge',
          issuedAt: Date.now(),
        };
        setState((prev) => ({
          ...prev,
          wallet: {
            ...prev.wallet,
            assetSlots: [...prev.wallet.assetSlots.filter((s) => s.slotId !== slot.slotId), slot],
          },
        }));
        return { ok: true, message: `✅ ${params.appId} അസറ്റ് സ്ലോട്ട് വെരിഫൈ ചെയ്തു.` };
      } catch {
        return { ok: false, message: 'സ്ലോട്ട് പെയ്‌ലോഡ് JSON ശരിയല്ല.' };
      }
    },
    []
  );

  const addVerifiedFriend = useCallback(
    (friend: {
      userId: string;
      handle?: string;
      displayName: string;
      verificationTier?: number;
      seasonalScore?: number;
    }): EcosystemActionResult => {
      const cleanId = friend.userId.trim().toUpperCase();
      if (!isValidUserId(cleanId)) {
        return { ok: false, message: 'ശരിയായ യൂസർ ഐഡി നൽകുക (ഉദാ: USR-SK-B1-XXXX).' };
      }
      if (cleanId === state.identity.userId) {
        return { ok: false, message: 'സ്വന്തം ഐഡി സുഹൃത്തായി ചേർക്കാൻ കഴിയില്ല.' };
      }
      const cleanName = sanitizeFinalPlayerText(friend.displayName, 40) || cleanId;
      const cleanHandle = sanitizeHandle(friend.handle || '') || `@${cleanId.slice(-4).toLowerCase()}`;
      setState((prev) => {
        const exists = prev.social.friends.some((f) => f.userId === cleanId);
        const entry: VerifiedFriend = {
          userId: cleanId,
          handle: cleanHandle,
          displayName: cleanName,
          batch: getUserBatchFromId(cleanId),
          verificationTier: Math.max(0, Math.min(3, Math.round(friend.verificationTier ?? 1))),
          addedAt: Date.now(),
          seasonalScore: friend.seasonalScore,
        };
        return {
          ...prev,
          social: {
            ...prev.social,
            friends: exists
              ? prev.social.friends.map((f) => (f.userId === cleanId ? { ...f, ...entry } : f))
              : [entry, ...prev.social.friends].slice(0, 100),
          },
        };
      });
      return { ok: true, message: `✅ ${cleanName} (${cleanId}) വെരിഫൈഡ് സുഹൃത്തുക്കളിൽ ചേർത്തു!` };
    },
    [state.identity.userId]
  );

  const removeFriend = useCallback((userId: string) => {
    setState((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        friends: prev.social.friends.filter((f) => f.userId !== userId),
      },
    }));
  }, []);

  const createRecipientLockedGift = useCallback(
    (params: {
      toUserId: string;
      kind: 'silver' | 'gold' | 'diamond' | 'lesson_unlock';
      amount: number;
      lessonId?: string;
      lessonTitle?: string;
      note?: string;
    }) => {
      const toId = params.toUserId.trim().toUpperCase();
      if (!isValidUserId(toId)) {
        return { ok: false, message: 'സ്വീകർത്താവിന്റെ ശരിയായ ഐഡി നൽകുക (USR-SK-B1-XXXX).' };
      }
      if (toId === state.identity.userId) {
        return { ok: false, message: 'സ്വന്തം ഐഡിയിലേക്ക് സമ്മാനം അയക്കാൻ കഴിയില്ല.' };
      }
      const today = getLocalDateKey();
      const sentToday = state.social.giftDateKey === today ? state.social.giftsSentToday : 0;
      if (sentToday >= ANTI_INFLATION_CAPS.MAX_GIFTS_SENT_PER_DAY) {
        return {
          ok: false,
          message: `ദിവസേന പരമാവധി ${ANTI_INFLATION_CAPS.MAX_GIFTS_SENT_PER_DAY} സമ്മാനങ്ങൾ മാത്രമേ അയക്കാനാകൂ.`,
        };
      }

      const costS = params.kind === 'silver' ? Math.max(10, Math.round(params.amount)) : 0;
      const costG = params.kind === 'gold' ? Math.max(5, Math.round(params.amount)) : 0;
      const costD =
        params.kind === 'diamond'
          ? Math.max(1, Math.round(params.amount))
          : params.kind === 'lesson_unlock'
          ? ANTI_INFLATION_CAPS.LESSON_GIFT_DIAMOND
          : 0;

      if (
        state.wallet.silver < costS ||
        state.wallet.gold < costG ||
        state.wallet.diamond < costD
      ) {
        return { ok: false, message: 'ഈ സമ്മാനം അയക്കാൻ ആവശ്യമായ നാണയങ്ങൾ / വജ്രങ്ങൾ വാലറ്റിൽ ഇല്ല.' };
      }

      const created = createSignedGiftVoucher({
        kind: params.kind,
        amount: params.kind === 'lesson_unlock' ? 1 : Math.max(1, Math.round(params.amount)),
        lessonId: params.lessonId,
        lessonTitle: params.lessonTitle,
        fromUserId: state.identity.userId,
        fromName: state.identity.displayName || state.identity.handle,
        toUserId: toId,
        note: params.note,
      });

      setState((prev) => {
        const nextLedger = appendLedgerBlock(prev.ledger, {
          action: `gift_send_${params.kind}`,
          deltaSilver: -costS,
          deltaGold: -costG,
          deltaDiamond: -costD,
          deltaXp: 0,
          meta: `${created.voucher.giftId}->${toId}`,
        });
        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            silver: prev.wallet.silver - costS,
            gold: prev.wallet.gold - costG,
            diamond: prev.wallet.diamond - costD,
          },
          social: {
            ...prev.social,
            giftDateKey: today,
            giftsSentToday: (prev.social.giftDateKey === today ? prev.social.giftsSentToday : 0) + 1,
          },
          ledger: nextLedger,
        };
      });

      return {
        ok: true,
        message: `🎁 ${toId} എന്ന സുഹൃത്തിനായി സൈൻ ചെയ്ത സമ്മാന വൗച്ചർ തയ്യാറായി!`,
        voucher: created.voucher,
        code: created.code,
        url: created.url,
      };
    },
    [state.identity, state.social, state.wallet]
  );

  const redeemRecipientLockedGift = useCallback(
    (rawCode: string): EcosystemActionResult => {
      const check = verifySignedGiftVoucher(rawCode, state.identity.userId);
      if (!check.valid || !check.voucher) {
        return { ok: false, message: check.error || 'സമ്മാന കോഡ് സാധുവല്ല.' };
      }
      const v = check.voucher;
      if (state.social.burnedGiftIds.includes(v.giftId)) {
        return { ok: false, message: 'ഈ സമ്മാന വൗച്ചർ ഇതിനകം ഉപയോഗിച്ചുകഴിഞ്ഞു (Single-Use Protection).' };
      }
      const today = getLocalDateKey();
      const recToday = state.social.giftDateKey === today ? state.social.giftsReceivedToday : 0;
      if (recToday >= ANTI_INFLATION_CAPS.MAX_GIFTS_RECEIVED_PER_DAY) {
        return {
          ok: false,
          message: `ദിവസേന പരമാവധി ${ANTI_INFLATION_CAPS.MAX_GIFTS_RECEIVED_PER_DAY} സമ്മാനങ്ങൾ മാത്രമേ സ്വീകരിക്കാനാകൂ.`,
        };
      }

      const dS = v.kind === 'silver' ? v.amount : 0;
      const dG = v.kind === 'gold' ? v.amount : 0;
      const dD = v.kind === 'diamond' ? v.amount : 0;

      setState((prev) => {
        const nextLedger = appendLedgerBlock(prev.ledger, {
          action: `gift_redeem_${v.kind}`,
          deltaSilver: dS,
          deltaGold: dG,
          deltaDiamond: dD,
          deltaXp: 0,
          meta: `${v.giftId}<-${v.fromUserId}`,
        });
        const nextGiftedLessons =
          v.kind === 'lesson_unlock' && v.lessonId
            ? Array.from(new Set([...prev.social.giftedLessonIds, v.lessonId]))
            : prev.social.giftedLessonIds;
        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            silver: prev.wallet.silver + dS,
            gold: prev.wallet.gold + dG,
            diamond: prev.wallet.diamond + dD,
          },
          social: {
            ...prev.social,
            giftDateKey: today,
            giftsReceivedToday:
              (prev.social.giftDateKey === today ? prev.social.giftsReceivedToday : 0) + 1,
            burnedGiftIds: [...prev.social.burnedGiftIds, v.giftId],
            giftedLessonIds: nextGiftedLessons,
          },
          ledger: nextLedger,
        };
      });

      const desc =
        v.kind === 'lesson_unlock'
          ? `"${v.lessonTitle || v.lessonId}" പാഠം നിങ്ങൾക്ക് തുറന്നുകിട്ടി!`
          : v.kind === 'silver'
          ? `+${v.amount} വെള്ളി നാണയം ലഭിച്ചു!`
          : v.kind === 'gold'
          ? `+${v.amount} സ്വർണ്ണ നാണയം ലഭിച്ചു!`
          : `+${v.amount} വജ്രം ലഭിച്ചു!`;
      return { ok: true, message: `🎉 ${v.fromName} അയച്ച സമ്മാനം സ്വീകരിച്ചു: ${desc}`, data: v };
    },
    [state.identity.userId, state.social]
  );

  const registerInvitedBy = useCallback((inviterId: string, inviterName?: string) => {
    const clean = inviterId.trim().toUpperCase();
    if (!isValidUserId(clean)) return;
    setState((prev) => {
      if (prev.social.invitedByUserId || clean === prev.identity.userId) return prev;
      return {
        ...prev,
        social: {
          ...prev.social,
          invitedByUserId: clean,
          invitedByName: inviterName?.slice(0, 40),
        },
      };
    });
  }, []);

  const redeemFriendInviteMilestone = useCallback(
    (rawCode: string): EcosystemActionResult => {
      const check = verifySignedInviteMilestoneCode(rawCode, state.identity.userId);
      if (!check.valid || !check.data) {
        return { ok: false, message: check.error || 'മൈൽസ്റ്റോൺ കോഡ് സാധുവല്ല.' };
      }
      const key = `${check.data.inviteeId}`;
      if (state.social.claimedInviteCodes.includes(key)) {
        return { ok: false, message: 'ഈ സുഹൃത്തിന്റെ ഇൻവൈറ്റ് ബോണസ് ഇതിനകം സ്വീകരിച്ചു.' };
      }
      setState((prev) => {
        const nextLedger = appendLedgerBlock(prev.ledger, {
          action: 'friend_invite_3lesson_bonus',
          deltaSilver: 0,
          deltaGold: 0,
          deltaDiamond: 1,
          deltaXp: 0,
          meta: `invitee:${check.data!.inviteeId}`,
        });
        return {
          ...prev,
          wallet: { ...prev.wallet, diamond: prev.wallet.diamond + 1 },
          social: {
            ...prev.social,
            claimedInviteCodes: [...prev.social.claimedInviteCodes, key],
          },
          ledger: nextLedger,
        };
      });
      return {
        ok: true,
        message: `💎 ${check.data.inviteeName} ആദ്യ 3 പാഠങ്ങൾ പൂർത്തിയാക്കി! നിങ്ങൾക്ക് +1 വജ്രം ലഭിച്ചു!`,
      };
    },
    [state.identity.userId, state.social.claimedInviteCodes]
  );

  const unlockHeritageCard = useCallback((cardId: string) => {
    setState((prev) => {
      if (prev.progression.collectedHeritageCards.includes(cardId)) return prev;
      return {
        ...prev,
        progression: {
          ...prev.progression,
          collectedHeritageCards: [...prev.progression.collectedHeritageCards, cardId],
        },
      };
    });
  }, []);

  const claimHiddenStar = useCallback((starId: string): EcosystemActionResult => {
    let outcome: EcosystemActionResult = { ok: false, message: 'ഈ നിധി നക്ഷത്രം ഇതിനകം കണ്ടെത്തി.' };
    setState((prev) => {
      if (prev.progression.foundHiddenStars.includes(starId)) return prev;
      const nextLedger = appendLedgerBlock(prev.ledger, {
        action: 'hidden_treasure_star',
        deltaSilver: 0,
        deltaGold: 0,
        deltaDiamond: 2,
        deltaXp: 0,
        meta: starId,
      });
      outcome = {
        ok: true,
        message: '✨ ഒളിഞ്ഞിരുന്ന വിജ്ഞാന നിധി നക്ഷത്രം കണ്ടെത്തി! +2 വജ്രങ്ങൾ (Diamonds) ലഭിച്ചു!',
      };
      return {
        ...prev,
        wallet: { ...prev.wallet, diamond: prev.wallet.diamond + 2 },
        progression: {
          ...prev.progression,
          foundHiddenStars: [...prev.progression.foundHiddenStars, starId],
        },
        ledger: nextLedger,
      };
    });
    return outcome;
  }, []);

  const claimPassTier = useCallback(
    (tierNumber: number, completedLessonsCount: number, streakDays: number): EcosystemActionResult => {
      const def = PASS_14_TIERS.find((t) => t.tier === tierNumber);
      if (!def) return { ok: false, message: 'ടയർ കണ്ടെത്തിയില്ല.' };
      if (completedLessonsCount < def.requiredLessons) {
        return {
          ok: false,
          message: `ഈ സമ്മാനം തുറക്കാൻ കുറഞ്ഞത് ${def.requiredLessons} പാഠങ്ങൾ പൂർത്തിയാക്കണം (നിലവിൽ: ${completedLessonsCount}).`,
        };
      }
      if (state.progression.claimedPassTiers.includes(tierNumber)) {
        return { ok: false, message: 'ഈ ടയർ സമ്മാനം ഇതിനകം സ്വീകരിച്ചു.' };
      }
      setState((prev) => {
        const nextLedger = appendLedgerBlock(prev.ledger, {
          action: `pass14_tier_${tierNumber}`,
          deltaSilver: def.rewardSilver,
          deltaGold: def.rewardGold,
          deltaDiamond: def.rewardDiamond,
          deltaXp: 0,
          meta: `streak:${streakDays}`,
        });
        const nextCards = def.cardId
          ? Array.from(new Set([...prev.progression.collectedHeritageCards, def.cardId]))
          : prev.progression.collectedHeritageCards;
        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            silver: prev.wallet.silver + def.rewardSilver,
            gold: prev.wallet.gold + def.rewardGold,
            diamond: prev.wallet.diamond + def.rewardDiamond,
          },
          progression: {
            ...prev.progression,
            claimedPassTiers: [...prev.progression.claimedPassTiers, tierNumber],
            collectedHeritageCards: nextCards,
          },
          ledger: nextLedger,
        };
      });
      return {
        ok: true,
        message: `🏆 ടയർ ${tierNumber} സമ്മാനം ലഭിച്ചു: +${def.rewardSilver} വെള്ളി, +${def.rewardGold} സ്വർണ്ണം${
          def.rewardDiamond > 0 ? `, +${def.rewardDiamond} വജ്രം` : ''
        }!`,
      };
    },
    [state.progression.claimedPassTiers]
  );

  const recordLessonMastery = useCallback(
    (
      lessonId: string,
      stars: 1 | 2 | 3,
      isSpeedReplay = false
    ): { silverEarned: number; triggerPackReward: boolean; triggerCooldown: boolean } => {
      let silverEarned = 0;
      let triggerPackReward = false;
      let triggerCooldown = false;
      const today = getLocalDateKey();
      const mult = boostInfo.is2xActive ? 2 : 1;

      setState((prev) => {
        const prevStars: number = prev.progression.lessonStars[lessonId] ?? 0;
        const bestStars = Math.max(prevStars, stars) as 1 | 2 | 3;

        if (isSpeedReplay) {
          const countToday =
            prev.progression.speedReplayDateKey === today
              ? prev.progression.speedReplayCountToday
              : 0;
          if (countToday < ANTI_INFLATION_CAPS.MAX_SPEED_REPLAYS_PER_DAY) {
            silverEarned = (stars === 3 ? 20 : stars === 2 ? 12 : 8) * mult;
          }
          const nextLedger =
            silverEarned > 0
              ? appendLedgerBlock(prev.ledger, {
                  action: 'speed_mastery_replay',
                  deltaSilver: silverEarned,
                  deltaGold: 0,
                  deltaDiamond: 0,
                  deltaXp: 0,
                  meta: `${lessonId}|stars:${stars}`,
                })
              : prev.ledger;
          return {
            ...prev,
            wallet: { ...prev.wallet, silver: prev.wallet.silver + silverEarned },
            progression: {
              ...prev.progression,
              lessonStars: { ...prev.progression.lessonStars, [lessonId]: bestStars },
              speedReplayDateKey: today,
              speedReplayCountToday: countToday + (silverEarned > 0 ? 1 : 0),
            },
            ledger: nextLedger,
          };
        }

        // First-time completion reward (capped against inflation)
        const baseSilver = (stars === 3 ? 25 : stars === 2 ? 18 : 12) * mult;
        const baseGold = (stars === 3 ? 6 : stars === 2 ? 4 : 2) * mult;
        const sRoom = Math.max(
          0,
          ANTI_INFLATION_CAPS.MAX_SILVER_FROM_LESSONS - prev.wallet.lessonSilverEmitted
        );
        const gRoom = Math.max(
          0,
          ANTI_INFLATION_CAPS.MAX_GOLD_FROM_LESSONS - prev.wallet.lessonGoldEmitted
        );
        const dS = prevStars === 0 ? Math.min(baseSilver, sRoom) : 0;
        const dG = prevStars === 0 ? Math.min(baseGold, gRoom) : 0;
        silverEarned = dS;

        const nextConsecutive =
          prevStars === 0
            ? prev.progression.consecutiveLessonsSinceBreak + 1
            : prev.progression.consecutiveLessonsSinceBreak;

        const totalMastered = Object.keys({
          ...prev.progression.lessonStars,
          [lessonId]: bestStars,
        }).length;

        if (prevStars === 0 && totalMastered > 0 && totalMastered % 3 === 0) {
          triggerPackReward = true;
        }
        if (prevStars === 0 && nextConsecutive >= ANTI_INFLATION_CAPS.COOLDOWN_AFTER_LESSONS) {
          triggerCooldown = true;
        }

        // Auto-unlock heritage cards by milestone count
        const nextCards = new Set(prev.progression.collectedHeritageCards);
        if (totalMastered >= 3) nextCards.add('hc_1951_skimvb');
        if (totalMastered >= 6) nextCards.add('hc_1954_sys');
        if (totalMastered >= 10) nextCards.add('hc_1963_jamia');
        if (totalMastered >= 15) nextCards.add('hc_1976_smf');
        if (totalMastered >= 18) nextCards.add('hc_1989_skssf');
        if (totalMastered >= 24) nextCards.add('hc_1993_sksbv');
        if (totalMastered >= 30) nextCards.add('hc_1995_tagore');
        if (totalMastered >= 36) nextCards.add('hc_1997_sathyadhara');
        if (totalMastered >= 44) nextCards.add('hc_viqaya');
        if (totalMastered >= 52) nextCards.add('hc_dars_kitabs');
        if (totalMastered >= 62) nextCards.add('hc_centenary_2026');

        const nextLedger =
          dS > 0 || dG > 0
            ? appendLedgerBlock(prev.ledger, {
                action: `lesson_complete_${lessonId}`,
                deltaSilver: dS,
                deltaGold: dG,
                deltaDiamond: 0,
                deltaXp: 15,
                meta: `stars:${bestStars}`,
              })
            : prev.ledger;

        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            silver: prev.wallet.silver + dS,
            gold: prev.wallet.gold + dG,
            lessonSilverEmitted: prev.wallet.lessonSilverEmitted + dS,
            lessonGoldEmitted: prev.wallet.lessonGoldEmitted + dG,
          },
          progression: {
            ...prev.progression,
            lessonStars: { ...prev.progression.lessonStars, [lessonId]: bestStars },
            collectedHeritageCards: Array.from(nextCards),
            consecutiveLessonsSinceBreak: triggerCooldown ? 0 : nextConsecutive,
            cooldownUntil: triggerCooldown
              ? Date.now() + ANTI_INFLATION_CAPS.COOLDOWN_DURATION_MS
              : prev.progression.cooldownUntil,
            pendingPackReward: triggerPackReward ? true : prev.progression.pendingPackReward,
            rewardPackTriggersCount:
              prev.progression.rewardPackTriggersCount + (triggerPackReward ? 1 : 0),
          },
          ledger: nextLedger,
        };
      });

      return { silverEarned, triggerPackReward, triggerCooldown };
    },
    [boostInfo.is2xActive]
  );

  const consumePendingPackReward = useCallback(() => {
    setState((prev) => ({
      ...prev,
      progression: { ...prev.progression, pendingPackReward: false },
    }));
  }, []);

  const grantVipJumpPass = useCallback(() => {
    setState((prev) => ({
      ...prev,
      inventory: { ...prev.inventory, vipJumpPasses: prev.inventory.vipJumpPasses + 1 },
    }));
  }, []);

  const consumeVipJumpPass = useCallback((): boolean => {
    let ok = false;
    setState((prev) => {
      if (prev.inventory.vipJumpPasses <= 0) return prev;
      ok = true;
      return {
        ...prev,
        inventory: { ...prev.inventory, vipJumpPasses: prev.inventory.vipJumpPasses - 1 },
      };
    });
    return ok;
  }, []);

  const triggerCooldownNow = useCallback(() => {
    setState((prev) => ({
      ...prev,
      progression: {
        ...prev.progression,
        cooldownUntil: Date.now() + ANTI_INFLATION_CAPS.COOLDOWN_DURATION_MS,
        consecutiveLessonsSinceBreak: 0,
      },
    }));
  }, []);

  const skipCooldown = useCallback(
    (payWith: 'gold' | 'diamond'): EcosystemActionResult => {
      return purchaseStoreItem(
        payWith === 'gold' ? 'cooldown_skip_gold' : 'cooldown_skip_diamond'
      );
    },
    [purchaseStoreItem]
  );

  const markBossLevelComplete = useCallback((level: number) => {
    setState((prev) => {
      if (prev.progression.completedBossLevels.includes(level)) return prev;
      const nextLedger = appendLedgerBlock(prev.ledger, {
        action: `level_${level}_boss_victory`,
        deltaSilver: 40,
        deltaGold: 15,
        deltaDiamond: 1,
        deltaXp: 50,
        meta: `boss_L${level}`,
      });
      return {
        ...prev,
        wallet: {
          ...prev.wallet,
          silver: prev.wallet.silver + 40,
          gold: prev.wallet.gold + 15,
          diamond: prev.wallet.diamond + 1,
        },
        progression: {
          ...prev.progression,
          completedBossLevels: [...prev.progression.completedBossLevels, level],
        },
        ledger: nextLedger,
      };
    });
  }, []);

  const recordSeasonalResult = useCallback((eventId: string, score: number, total: number) => {
    const year = new Date().getFullYear();
    setState((prev) => {
      const existing = prev.progression.seasonalRecords.find(
        (r) => r.eventId === eventId && r.year === year
      );
      const bestScore = existing ? Math.max(existing.bestScore, score) : score;
      const nextRecords = [
        ...prev.progression.seasonalRecords.filter(
          (r) => !(r.eventId === eventId && r.year === year)
        ),
        { eventId, year, bestScore, totalQuestions: total, playedAt: Date.now() },
      ];
      const rewardGold = existing ? 0 : score * 10;
      const rewardDiamond = !existing && score === total ? 1 : 0;
      const nextLedger =
        rewardGold > 0 || rewardDiamond > 0
          ? appendLedgerBlock(prev.ledger, {
              action: `seasonal_${eventId}_${year}`,
              deltaSilver: 0,
              deltaGold: rewardGold,
              deltaDiamond: rewardDiamond,
              deltaXp: 25,
              meta: `score:${score}/${total}`,
            })
          : prev.ledger;
      return {
        ...prev,
        wallet: {
          ...prev.wallet,
          gold: prev.wallet.gold + rewardGold,
          diamond: prev.wallet.diamond + rewardDiamond,
        },
        progression: { ...prev.progression, seasonalRecords: nextRecords },
        ledger: nextLedger,
      };
    });
  }, []);

  const consumeQuizHint = useCallback((kind: '5050' | 'time'): boolean => {
    let ok = false;
    setState((prev) => {
      if (kind === '5050') {
        if (prev.inventory.quizHint5050 > 0) {
          ok = true;
          return {
            ...prev,
            inventory: { ...prev.inventory, quizHint5050: prev.inventory.quizHint5050 - 1 },
          };
        }
        return prev;
      }
      if (prev.inventory.quizHintTime > 0) {
        ok = true;
        return {
          ...prev,
          inventory: { ...prev.inventory, quizHintTime: prev.inventory.quizHintTime - 1 },
        };
      }
      return prev;
    });
    return ok;
  }, []);

  const dismissTamperBanner = useCallback(() => {
    setState((prev) => ({ ...prev, tamperDetected: false, tamperMessage: undefined }));
  }, []);

  const deleteProfileAndResetEcosystem = useCallback(() => {
    clearEcosystemStorage();
    const fresh = createFreshEcosystemState('');
    saveEcosystemState(fresh);
    setState(fresh);
  }, []);

  const setActiveBadgeFrame = useCallback((frameId: string) => {
    setState((prev) => {
      if (!prev.inventory.unlockedBadgeFrames.includes(frameId)) return prev;
      return {
        ...prev,
        inventory: { ...prev.inventory, activeBadgeFrame: frameId },
      };
    });
  }, []);

  const grantWebOfTrustAttestation = useCallback(
    (attesterId: string, attesterName: string): EcosystemActionResult => {
      const upper = attesterId.trim().toUpperCase();
      if (!isValidUserId(upper) && !isValidOrganizationId(upper)) {
        return {
          ok: false,
          message: 'വെരിഫിക്കേഷൻ നൽകാൻ സാധുവായ USR-SK-... അല്ലെങ്കിൽ ORG-SK-... ഐഡി നൽകുക.',
        };
      }
      const nextTier: 1 | 2 | 3 = isValidOrganizationId(upper) ? 3 : 2;
      setState((prev) => {
        const entry: WebOfTrustAttestation = {
          id: `ATT-${Date.now()}`,
          attesterId: upper,
          attesterName: sanitizeFinalPlayerText(attesterName, 40) || upper,
          tierGranted: nextTier,
          attestedAt: Date.now(),
        };
        const mergedTier = Math.max(prev.identity.verificationTier, nextTier) as 0 | 1 | 2 | 3;
        return {
          ...prev,
          identity: {
            ...prev.identity,
            verificationTier: mergedTier,
            canVerifyEntities: mergedTier >= 2,
            attestations: [entry, ...prev.identity.attestations].slice(0, 20),
          },
        };
      });
      return {
        ok: true,
        message: `🛡️ വെബ്-ഓഫ്-ട്രസ്റ്റ് അറ്റസ്റ്റേഷൻ രേഖപ്പെടുത്തി! (ടയർ ${nextTier} വെരിഫൈഡ് — ആധാർ/സർക്കാർ രേഖകളില്ലാതെ സുരക്ഷിതം)`,
      };
    },
    []
  );

  const value = useMemo<EcosystemContextValue>(
    () => ({
      state,
      boostInfo,
      activeSeasonal,
      ledgerHead,
      transactCurrency,
      claimXpDiamondMilestone,
      getClaimableXpMilestones,
      exchangeCurrency,
      purchaseStoreItem,
      markHubVisited,
      updateDisplayNameWithRules,
      updateHandle,
      configureMasterProfileLink,
      connectAuthorizedApp,
      injectAuthorizedSlotAsset,
      addVerifiedFriend,
      removeFriend,
      createRecipientLockedGift,
      redeemRecipientLockedGift,
      registerInvitedBy,
      redeemFriendInviteMilestone,
      unlockHeritageCard,
      claimHiddenStar,
      claimPassTier,
      recordLessonMastery,
      consumePendingPackReward,
      grantVipJumpPass,
      consumeVipJumpPass,
      triggerCooldownNow,
      skipCooldown,
      markBossLevelComplete,
      recordSeasonalResult,
      consumeQuizHint,
      dismissTamperBanner,
      deleteProfileAndResetEcosystem,
      setActiveBadgeFrame,
      grantWebOfTrustAttestation,
    }),
    [
      state,
      boostInfo,
      activeSeasonal,
      ledgerHead,
      transactCurrency,
      claimXpDiamondMilestone,
      getClaimableXpMilestones,
      exchangeCurrency,
      purchaseStoreItem,
      markHubVisited,
      updateDisplayNameWithRules,
      updateHandle,
      configureMasterProfileLink,
      connectAuthorizedApp,
      injectAuthorizedSlotAsset,
      addVerifiedFriend,
      removeFriend,
      createRecipientLockedGift,
      redeemRecipientLockedGift,
      registerInvitedBy,
      redeemFriendInviteMilestone,
      unlockHeritageCard,
      claimHiddenStar,
      claimPassTier,
      recordLessonMastery,
      consumePendingPackReward,
      grantVipJumpPass,
      consumeVipJumpPass,
      triggerCooldownNow,
      skipCooldown,
      markBossLevelComplete,
      recordSeasonalResult,
      consumeQuizHint,
      dismissTamperBanner,
      deleteProfileAndResetEcosystem,
      setActiveBadgeFrame,
      grantWebOfTrustAttestation,
    ]
  );

  return React.createElement(EcosystemContext.Provider, { value }, children);
};
