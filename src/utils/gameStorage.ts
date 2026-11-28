import { sanitizeFinalPlayerText, sanitizePlayerText } from './sanitize';

export interface QuizAnswerRecord {
  selectedIdx: number;
  isCorrect: boolean;
  answeredAt: number;
}

export type QuizAnswerMap = Record<string, QuizAnswerRecord>;

export interface SavedGameState {
  version: number;
  stage: 'prologue' | 'storyboard' | 'world' | 'pov';
  currentLevel: 1 | 2 | 3 | 4;
  activeLessonId: string;
  xp: number;
  awardedActions: string[];
  badges: string[];
  unlockedLevels: number[];
  completedLevels: number[];
  completedLessonIds: string[];
  collectedEggs: string[];
  quizAnswers: QuizAnswerMap;
  lives: number;
  runNumber: number;
  savedAt: number;
}

export interface RunHistoryEntry {
  runNumber: number;
  finishedAt: number;
  xp: number;
  completedLessons: number;
  totalLessons: number;
  quizzesAnswered: number;
  quizzesCorrect: number;
  badgesCount: number;
  eggsCount: number;
  highestLevel: number;
  reachedCertificate: boolean;
}

export interface UnitProfile {
  playerName: string;
  unitName: string;
  mekhalaName: string;
  lockedCertificateName?: string;
}

export interface DailyAndProfileState {
  streakDays: number;
  bestStreak: number;
  lastActiveDate: string;
  lastStreakEarnedDate?: string;
  lastRealTimestamp?: number;
  todayDate: string;
  todayLessonsCount: number;
  todayQuizzesCorrect: number;
  todaySpecialGameDone?: boolean;
  streakHistoryDates?: string[];
  completedDailyGameDates?: string[];
  dailyGameBestScore?: number;
  claimedMissionsToday: string[];
  profile: UnitProfile;
}

export interface DailyMissionDef {
  id: 'daily_checkin' | 'daily_lesson' | 'daily_quiz' | 'daily_special_game';
  emoji: string;
  title: string;
  rewardXp: number;
  target: number;
}

export const DAILY_MISSIONS: DailyMissionDef[] = [
  {
    id: 'daily_checkin',
    emoji: '🌅',
    title: 'ഇന്നത്തെ പഠന യാത്ര തുടങ്ങാം',
    rewardXp: 10,
    target: 1,
  },
  {
    id: 'daily_special_game',
    emoji: '🎯',
    title: 'ഇന്നത്തെ സ്പെഷ്യൽ ഗെയിം പൂർത്തിയാക്കാം',
    rewardXp: 25,
    target: 1,
  },
  {
    id: 'daily_lesson',
    emoji: '📘',
    title: 'ഇന്ന് 1 പാഠം പൂർത്തിയാക്കാം',
    rewardXp: 20,
    target: 1,
  },
  {
    id: 'daily_quiz',
    emoji: '✅',
    title: 'ഇന്ന് 1 ക്വിസ് ശരിയായി ഉത്തരം നൽകാം',
    rewardXp: 15,
    target: 1,
  },
];

const SAVE_KEY = 'skssf_guide_progress_v2';
const HISTORY_KEY = 'skssf_guide_run_history_v2';
const DAILY_KEY = 'skssf_guide_daily_v1';
const AUDIO_KEY = 'skssf_guide_audio_v3';
const BACKUP_V1_PREFIX = 'SKSSF-BK1:';
const BACKUP_V2_PREFIX = 'SKSSF-BK2:';
const BACKUP_V3_PREFIX = 'SKSSF-BK3:';
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateKey(d);
}

export function sanitizeQuizAnswers(raw: unknown): QuizAnswerMap {
  const clean: QuizAnswerMap = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return clean;
  }
  const source = raw as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    if (FORBIDDEN_KEYS.has(key) || key.length === 0 || key.length > 80) continue;
    const entry = source[key];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const rec = entry as Partial<QuizAnswerRecord>;
    if (
      typeof rec.selectedIdx === 'number' &&
      Number.isFinite(rec.selectedIdx) &&
      rec.selectedIdx >= 0 &&
      rec.selectedIdx <= 20 &&
      typeof rec.isCorrect === 'boolean'
    ) {
      clean[key] = {
        selectedIdx: Math.round(rec.selectedIdx),
        isCorrect: rec.isCorrect,
        answeredAt:
          typeof rec.answeredAt === 'number' && Number.isFinite(rec.answeredAt)
            ? rec.answeredAt
            : Date.now(),
      };
    }
  }
  return clean;
}

function sanitizeStringArray(raw: unknown, maxLen = 300): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === 'string' && item.length > 0 && item.length <= 160) {
      out.push(item);
      if (out.length >= maxLen) break;
    }
  }
  return out;
}

export function sanitizeSavedGameState(parsed: unknown): SavedGameState | null {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const p = parsed as Partial<SavedGameState>;

  const validStage =
    p.stage === 'prologue' ||
    p.stage === 'storyboard' ||
    p.stage === 'pov' ||
    p.stage === 'world'
      ? p.stage
      : 'prologue';

  const validLevel: 1 | 2 | 3 | 4 =
    p.currentLevel === 2 || p.currentLevel === 3 || p.currentLevel === 4
      ? p.currentLevel
      : 1;

  const parsedLives =
    typeof p.lives === 'number' && Number.isFinite(p.lives)
      ? Math.max(0, Math.min(3, Math.round(p.lives)))
      : 3;

  const unlocked = Array.isArray(p.unlockedLevels)
    ? p.unlockedLevels.filter((x): x is number => typeof x === 'number' && x >= 1 && x <= 4)
    : [];

  return {
    version: 2,
    stage: validStage,
    currentLevel: validLevel,
    activeLessonId:
      typeof p.activeLessonId === 'string' && p.activeLessonId.length <= 80
        ? p.activeLessonId
        : 'prologue_curiosity',
    xp:
      typeof p.xp === 'number' && Number.isFinite(p.xp)
        ? Math.max(0, Math.min(100000, Math.round(p.xp)))
        : 0,
    awardedActions: sanitizeStringArray(p.awardedActions, 500),
    badges: sanitizeStringArray(p.badges, 100),
    unlockedLevels: unlocked.length > 0 ? unlocked : [1],
    completedLevels: Array.isArray(p.completedLevels)
      ? p.completedLevels.filter((x): x is number => typeof x === 'number' && x >= 1 && x <= 4)
      : [],
    completedLessonIds: sanitizeStringArray(p.completedLessonIds, 100),
    collectedEggs: sanitizeStringArray(p.collectedEggs, 30),
    quizAnswers: sanitizeQuizAnswers(p.quizAnswers),
    lives: parsedLives,
    runNumber:
      typeof p.runNumber === 'number' && Number.isFinite(p.runNumber) && p.runNumber >= 1
        ? Math.min(999, Math.round(p.runNumber))
        : 1,
    savedAt:
      typeof p.savedAt === 'number' && Number.isFinite(p.savedAt) ? p.savedAt : Date.now(),
  };
}

export function loadSavedGameState(): SavedGameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return sanitizeSavedGameState(parsed);
  } catch {
    return null;
  }
}

export function saveGameState(state: SavedGameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, version: 2, savedAt: Date.now() }));
  } catch {
    // Ignore storage quota / privacy errors
  }
}

export function clearSavedGameState(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore
  }
}

function sanitizeRunHistory(raw: unknown): RunHistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is RunHistoryEntry =>
        Boolean(item) &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        typeof (item as RunHistoryEntry).runNumber === 'number' &&
        Number.isFinite((item as RunHistoryEntry).runNumber)
    )
    .slice(-10)
    .map((item) => ({
      runNumber: Math.max(1, Math.round(item.runNumber)),
      finishedAt: typeof item.finishedAt === 'number' ? item.finishedAt : Date.now(),
      xp: typeof item.xp === 'number' && Number.isFinite(item.xp) ? Math.max(0, Math.round(item.xp)) : 0,
      completedLessons:
        typeof item.completedLessons === 'number' && Number.isFinite(item.completedLessons)
          ? Math.max(0, Math.round(item.completedLessons))
          : 0,
      totalLessons:
        typeof item.totalLessons === 'number' && Number.isFinite(item.totalLessons)
          ? Math.max(1, Math.round(item.totalLessons))
          : 62,
      quizzesAnswered:
        typeof item.quizzesAnswered === 'number' && Number.isFinite(item.quizzesAnswered)
          ? Math.max(0, Math.round(item.quizzesAnswered))
          : 0,
      quizzesCorrect:
        typeof item.quizzesCorrect === 'number' && Number.isFinite(item.quizzesCorrect)
          ? Math.max(0, Math.round(item.quizzesCorrect))
          : 0,
      badgesCount:
        typeof item.badgesCount === 'number' && Number.isFinite(item.badgesCount)
          ? Math.max(0, Math.round(item.badgesCount))
          : 0,
      eggsCount:
        typeof item.eggsCount === 'number' && Number.isFinite(item.eggsCount)
          ? Math.max(0, Math.round(item.eggsCount))
          : 0,
      highestLevel:
        typeof item.highestLevel === 'number' && Number.isFinite(item.highestLevel)
          ? Math.max(1, Math.min(4, Math.round(item.highestLevel)))
          : 1,
      reachedCertificate: Boolean(item.reachedCertificate),
    }));
}

export function loadRunHistory(): RunHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return sanitizeRunHistory(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function archiveRunToHistory(entry: RunHistoryEntry): RunHistoryEntry[] {
  const existing = loadRunHistory().filter((r) => r.runNumber !== entry.runNumber);
  const next = [...existing, entry].sort((a, b) => a.runNumber - b.runNumber).slice(-10);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }
  return next;
}

export function clearRunHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore
  }
}

// ==================== DAILY STREAK, DAILY MISSIONS & UNIT PROFILE ====================
function createDefaultDailyState(): DailyAndProfileState {
  const today = getLocalDateKey();
  return {
    streakDays: 0,
    bestStreak: 0,
    lastActiveDate: today,
    lastStreakEarnedDate: '',
    lastRealTimestamp: Date.now(),
    todayDate: today,
    todayLessonsCount: 0,
    todayQuizzesCorrect: 0,
    todaySpecialGameDone: false,
    streakHistoryDates: [],
    completedDailyGameDates: [],
    dailyGameBestScore: 0,
    claimedMissionsToday: [],
    profile: {
      playerName: '',
      unitName: '',
      mekhalaName: '',
    },
  };
}

function sanitizeDateKeyArray(raw: unknown, maxLen = 60): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item) && !seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out.slice(-maxLen);
}

function sanitizeDailyState(raw: unknown): DailyAndProfileState {
  const today = getLocalDateKey();
  const yesterday = getYesterdayDateKey();
  const fallback = createDefaultDailyState();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fallback;

  const p = raw as Partial<DailyAndProfileState>;
  const rawProfile =
    p.profile && typeof p.profile === 'object' && !Array.isArray(p.profile)
      ? (p.profile as Partial<UnitProfile>)
      : {};

  const lockedCert =
    typeof rawProfile.lockedCertificateName === 'string'
      ? sanitizeFinalPlayerText(rawProfile.lockedCertificateName, 40)
      : '';

  const cleanProfile: UnitProfile = {
    playerName:
      typeof rawProfile.playerName === 'string'
        ? sanitizePlayerText(rawProfile.playerName, 40)
        : '',
    unitName:
      typeof rawProfile.unitName === 'string'
        ? sanitizePlayerText(rawProfile.unitName, 45)
        : '',
    mekhalaName:
      typeof rawProfile.mekhalaName === 'string'
        ? sanitizePlayerText(rawProfile.mekhalaName, 45)
        : '',
    ...(lockedCert ? { lockedCertificateName: lockedCert } : {}),
  };

  const nowTs = Date.now();
  const prevRealTs =
    typeof p.lastRealTimestamp === 'number' && Number.isFinite(p.lastRealTimestamp)
      ? p.lastRealTimestamp
      : nowTs;
  const clockTamperedBackward = nowTs + 60_000 < prevRealTs;

  const prevEarnedDate =
    typeof p.lastStreakEarnedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.lastStreakEarnedDate)
      ? p.lastStreakEarnedDate
      : typeof p.lastActiveDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.lastActiveDate)
      ? p.lastActiveDate
      : '';

  let streakDays =
    typeof p.streakDays === 'number' && Number.isFinite(p.streakDays) && p.streakDays >= 0
      ? Math.min(365, Math.round(p.streakDays))
      : 0;
  let bestStreak =
    typeof p.bestStreak === 'number' && Number.isFinite(p.bestStreak) && p.bestStreak >= 0
      ? Math.min(365, Math.round(p.bestStreak))
      : streakDays;

  let todayLessonsCount =
    typeof p.todayLessonsCount === 'number' && Number.isFinite(p.todayLessonsCount)
      ? Math.max(0, Math.round(p.todayLessonsCount))
      : 0;
  let todayQuizzesCorrect =
    typeof p.todayQuizzesCorrect === 'number' && Number.isFinite(p.todayQuizzesCorrect)
      ? Math.max(0, Math.round(p.todayQuizzesCorrect))
      : 0;
  let claimedMissionsToday = sanitizeStringArray(p.claimedMissionsToday, 12);

  const rawHistory = sanitizeDateKeyArray(p.streakHistoryDates, 60);
  const completedDailyGameDates = sanitizeDateKeyArray(p.completedDailyGameDates, 60);
  const dailyGameBestScore =
    typeof p.dailyGameBestScore === 'number' && Number.isFinite(p.dailyGameBestScore)
      ? Math.max(0, Math.round(p.dailyGameBestScore))
      : 0;

  // Never auto-increment streakDays on mere app open!
  // Only reset streakDays to 0 if more than 1 full calendar day passed since last genuine activity.
  if (!clockTamperedBackward && prevEarnedDate && prevEarnedDate < yesterday) {
    streakDays = 0;
  }

  if (p.todayDate !== today && !clockTamperedBackward) {
    todayLessonsCount = 0;
    todayQuizzesCorrect = 0;
    claimedMissionsToday = [];
  }

  const todaySpecialGameDone =
    completedDailyGameDates.includes(today) ||
    (p.todayDate === today && Boolean(p.todaySpecialGameDone));

  return {
    streakDays,
    bestStreak: Math.max(bestStreak, streakDays),
    lastActiveDate: clockTamperedBackward ? (p.lastActiveDate || today) : today,
    lastStreakEarnedDate: prevEarnedDate,
    lastRealTimestamp: Math.max(prevRealTs, nowTs),
    todayDate: clockTamperedBackward ? (p.todayDate || today) : today,
    todayLessonsCount,
    todayQuizzesCorrect,
    todaySpecialGameDone,
    streakHistoryDates: rawHistory,
    completedDailyGameDates,
    dailyGameBestScore,
    claimedMissionsToday,
    profile: cleanProfile,
  };
}

/**
 * Increments daily streak ONLY upon genuine learning activity
 * (completing >=1 lesson, answering >=1 quiz correctly, or finishing today's daily game),
 * guarded by a monotonic timestamp check to prevent system-clock streak forging.
 */
export function recordGenuineDailyActivity(prev: DailyAndProfileState): DailyAndProfileState {
  const nowTs = Date.now();
  const today = getLocalDateKey();
  const yesterday = getYesterdayDateKey();
  const lastTs = prev.lastRealTimestamp ?? 0;

  // Guard 1: Reject backward device clock jumps
  if (nowTs + 60_000 < lastTs) {
    return prev;
  }
  // Guard 2: Already earned today's streak credit
  if (prev.lastStreakEarnedDate === today) {
    return {
      ...prev,
      lastRealTimestamp: Math.max(lastTs, nowTs),
    };
  }
  // Guard 3: Reject rapid synthetic date stepping (< 4 hours real elapsed time between different calendar dates)
  const earnedPrev = prev.lastStreakEarnedDate || '';
  const MIN_REAL_GAP_MS = 4 * 60 * 60 * 1000;
  if (earnedPrev && earnedPrev !== today && lastTs > 0 && nowTs - lastTs < MIN_REAL_GAP_MS && prev.streakDays >= 2) {
    return {
      ...prev,
      lastRealTimestamp: Math.max(lastTs, nowTs),
    };
  }

  const nextStreak = earnedPrev === yesterday ? Math.min(365, prev.streakDays + 1) : 1;
  const nextBest = Math.max(prev.bestStreak, nextStreak);
  const nextHistory = (prev.streakHistoryDates || []).includes(today)
    ? prev.streakHistoryDates || []
    : [...(prev.streakHistoryDates || []), today].slice(-60);

  return {
    ...prev,
    streakDays: nextStreak,
    bestStreak: nextBest,
    lastActiveDate: today,
    lastStreakEarnedDate: today,
    lastRealTimestamp: Math.max(lastTs, nowTs),
    todayDate: today,
    streakHistoryDates: nextHistory,
  };
}

export function loadDailyAndProfileState(): DailyAndProfileState {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) {
      const fresh = createDefaultDailyState();
      saveDailyAndProfileState(fresh);
      return fresh;
    }
    const clean = sanitizeDailyState(JSON.parse(raw));
    saveDailyAndProfileState(clean);
    return clean;
  } catch {
    return createDefaultDailyState();
  }
}

export function saveDailyAndProfileState(state: DailyAndProfileState): void {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota / privacy errors
  }
}

export function getLockedCertificateName(): string {
  const daily = loadDailyAndProfileState();
  return daily.profile.lockedCertificateName?.trim() || '';
}

export function lockCertificateName(name: string, unitName?: string): DailyAndProfileState {
  const daily = loadDailyAndProfileState();
  const existingLocked = daily.profile.lockedCertificateName?.trim();
  const cleanName = existingLocked || sanitizeFinalPlayerText(name, 40);
  if (!cleanName) return daily;
  const cleanUnit =
    typeof unitName === 'string' && unitName.trim()
      ? sanitizeFinalPlayerText(unitName, 45)
      : daily.profile.unitName;
  const next: DailyAndProfileState = {
    ...daily,
    profile: {
      ...daily.profile,
      playerName: cleanName,
      unitName: cleanUnit,
      lockedCertificateName: cleanName,
    },
  };
  saveDailyAndProfileState(next);
  return next;
}

// ==================== PIN + NAME PROTECTED PROGRESS BACKUP & RESTORE (SKSSF-BK2) ====================
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function fnv1aHex(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= c + ((i * 31) & 0xff);
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

function xorCipherBytes(data: Uint8Array, pin: string, salt: string): Uint8Array {
  const seedStr = `SKSSF-GUIDE-BK2-KEY::${pin}::${salt}`;
  let state = 0x6a09e667;
  for (let i = 0; i < seedStr.length; i++) {
    state ^= seedStr.charCodeAt(i);
    state = Math.imul(state, 0x01000193) >>> 0;
  }
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    // xorshift32 keystream mixed with position
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state = (state + (i * 0x9e3779b1)) >>> 0;
    out[i] = data[i] ^ ((state >>> 16) & 0xff);
  }
  return out;
}

function generateSaltHex(len = 8): string {
  const chars = '0123456789abcdef';
  const buf = new Uint8Array(len);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < len; i++) {
      buf[i] = Math.floor(Math.random() * 256);
    }
  }
  let s = '';
  for (let i = 0; i < len; i++) {
    s += chars[buf[i] & 15];
  }
  return s;
}

interface BackupBundleV2 {
  v: 2;
  exportedAt: number;
  ownerName: string;
  sig: string;
  game: SavedGameState | null;
  history: RunHistoryEntry[];
  daily: DailyAndProfileState;
  soundPack?: string;
}

export interface ExportBackupResult {
  ok: boolean;
  code?: string;
  ownerName?: string;
  error?: string;
}

export function exportProgressBackupCode(learnerName: string, pin: string): ExportBackupResult {
  const cleanPin = pin.trim();
  if (!/^\d{4}$/.test(cleanPin)) {
    return {
      ok: false,
      error: '4 അക്ക രഹസ്യ PIN നമ്പർ നൽകുക (ഉദാ: 4829).',
    };
  }

  const daily = loadDailyAndProfileState();
  // Prevent re-exporting someone else's restored backup under a different name
  const lockedExisting = daily.profile.lockedCertificateName?.trim();
  const cleanName = (lockedExisting || learnerName.trim()).slice(0, 60);

  if (cleanName.length < 2) {
    return {
      ok: false,
      error: 'ബാക്കപ്പ് സുരക്ഷിതമാക്കാൻ നിങ്ങളുടെ പേര് നൽകുക (കുറഞ്ഞത് 2 അക്ഷരം).',
    };
  }

  // Keep local profile synced with learner's chosen name
  const updatedDaily: DailyAndProfileState = {
    ...daily,
    profile: {
      ...daily.profile,
      playerName: cleanName,
      ...(lockedExisting ? { lockedCertificateName: lockedExisting } : {}),
    },
  };
  saveDailyAndProfileState(updatedDaily);

  let soundPack: string | undefined;
  try {
    const audioRaw = localStorage.getItem(AUDIO_KEY);
    if (audioRaw) {
      const audioObj = JSON.parse(audioRaw) as { soundPack?: string };
      if (typeof audioObj.soundPack === 'string') {
        soundPack = audioObj.soundPack;
      }
    }
  } catch {
    // Ignore
  }

  const game = loadSavedGameState();
  const history = loadRunHistory();
  const exportedAt = Date.now();
  const sig = fnv1aHex(
    `${cleanPin}|${cleanName}|${exportedAt}|${game?.xp ?? 0}|${game?.completedLessonIds.length ?? 0}`
  );

  const bundle: BackupBundleV2 = {
    v: 2,
    exportedAt,
    ownerName: cleanName,
    sig,
    game,
    history,
    daily: updatedDaily,
    soundPack,
  };

  const salt = generateSaltHex(8);
  const plainBytes = new TextEncoder().encode(JSON.stringify(bundle));
  const cipherBytes = xorCipherBytes(plainBytes, cleanPin, salt);

  return {
    ok: true,
    ownerName: cleanName,
    code: `${BACKUP_V2_PREFIX}${salt}:${bytesToBase64(cipherBytes)}`,
  };
}

export interface RestoreBackupResult {
  ok: boolean;
  error?: string;
  restoredName?: string;
  restoredLessons?: number;
  restoredXp?: number;
  restoredStreak?: number;
}

export function importProgressBackupCode(rawInput: string, pin: string): RestoreBackupResult {
  try {
    const trimmed = rawInput.trim();
    const cleanPin = pin.trim();

    if (trimmed.includes(BACKUP_V1_PREFIX) && !trimmed.includes(BACKUP_V2_PREFIX)) {
      return {
        ok: false,
        error:
          'പഴയ SKSSF-BK1 കോഡുകൾ സർട്ടിഫിക്കറ്റ് സുരക്ഷയ്ക്കായി നിർത്തലാക്കി. പുതിയ PIN സുരക്ഷിത ബാക്കപ്പ് കോഡ് (SKSSF-BK2) ഉപയോഗിക്കുക.',
      };
    }

    const bk2Match = trimmed.match(/SKSSF-BK2:[0-9a-f]{4,16}:[A-Za-z0-9+/=\s]+/i);
    if (!bk2Match) {
      return {
        ok: false,
        error: 'തെറ്റായ ബാക്കപ്പ് കോഡാണ്. SKSSF-BK2: എന്ന് തുടങ്ങുന്ന മുഴുവൻ കോഡും ഒട്ടിക്കുക.',
      };
    }

    if (!/^\d{4}$/.test(cleanPin)) {
      return {
        ok: false,
        error: 'ബാക്കപ്പ് ഉണ്ടാക്കിയപ്പോൾ നൽകിയ 4 അക്ക PIN നമ്പർ നൽകുക.',
      };
    }

    const body = bk2Match[0].slice(BACKUP_V2_PREFIX.length).replace(/\s+/g, '');
    const sepIdx = body.indexOf(':');
    if (sepIdx <= 0 || sepIdx > 16) {
      return { ok: false, error: 'ബാക്കപ്പ് കോഡ് അപൂർണ്ണമാണ് അല്ലെങ്കിൽ തകരാറുള്ളതാണ്.' };
    }

    const salt = body.slice(0, sepIdx);
    const payloadB64 = body.slice(sepIdx + 1);
    if (!/^[0-9a-f]{4,16}$/i.test(salt) || !payloadB64 || payloadB64.length > 65000) {
      return { ok: false, error: 'ബാക്കപ്പ് കോഡ് അപൂർണ്ണമാണ് അല്ലെങ്കിൽ തകരാറുള്ളതാണ്.' };
    }

    const cipherBytes = base64ToBytes(payloadB64);
    const plainBytes = xorCipherBytes(cipherBytes, cleanPin, salt);
    const decodedText = new TextDecoder().decode(plainBytes);
    const decoded = JSON.parse(decodedText) as Partial<BackupBundleV2>;

    if (
      !decoded ||
      typeof decoded !== 'object' ||
      decoded.v !== 2 ||
      typeof decoded.ownerName !== 'string' ||
      decoded.ownerName.trim().length < 2 ||
      typeof decoded.sig !== 'string' ||
      typeof decoded.exportedAt !== 'number'
    ) {
      return { ok: false, error: 'തെറ്റായ 4 അക്ക PIN അല്ലെങ്കിൽ തകരാറുള്ള ബാക്കപ്പ് കോഡ്!' };
    }

    const cleanOwnerName = decoded.ownerName.trim().slice(0, 60);
    const cleanGame = decoded.game ? sanitizeSavedGameState(decoded.game) : null;
    const expectedSig = fnv1aHex(
      `${cleanPin}|${cleanOwnerName}|${decoded.exportedAt}|${cleanGame?.xp ?? 0}|${cleanGame?.completedLessonIds.length ?? 0}`
    );

    if (decoded.sig !== expectedSig) {
      return { ok: false, error: 'തെറ്റായ 4 അക്ക PIN നമ്പറാണ്. കൃത്യമായ PIN നൽകി വീണ്ടും ശ്രമിക്കുക.' };
    }

    const cleanHistory = sanitizeRunHistory(decoded.history);
    const cleanDaily = sanitizeDailyState(decoded.daily);
    // Lock certificate name to the original backup owner's name
    cleanDaily.profile = {
      ...cleanDaily.profile,
      playerName: cleanOwnerName,
      lockedCertificateName: cleanOwnerName,
    };

    if (cleanGame) {
      saveGameState(cleanGame);
      try {
        const serializedIds = JSON.stringify(cleanGame.completedLessonIds);
        localStorage.setItem('skssf_guide_completed_lessons_v1', serializedIds);
        localStorage.setItem('skssf_confirmed_lessons_v1', serializedIds);
      } catch {
        // Ignore
      }
    }

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(cleanHistory));
    } catch {
      // Ignore
    }

    saveDailyAndProfileState(cleanDaily);

    if (
      decoded.soundPack === 'classic' ||
      decoded.soundPack === 'oud_warm' ||
      decoded.soundPack === 'crystal_bell'
    ) {
      try {
        const prevAudio = localStorage.getItem(AUDIO_KEY);
        const parsedAudio = prevAudio ? JSON.parse(prevAudio) : {};
        localStorage.setItem(
          AUDIO_KEY,
          JSON.stringify({ ...parsedAudio, soundPack: decoded.soundPack })
        );
      } catch {
        // Ignore
      }
    }

    return {
      ok: true,
      restoredName: cleanOwnerName,
      restoredLessons: cleanGame?.completedLessonIds.length ?? 0,
      restoredXp: cleanGame?.xp ?? 0,
      restoredStreak: cleanDaily.streakDays,
    };
  } catch {
    return {
      ok: false,
      error: 'തെറ്റായ 4 അക്ക PIN നമ്പർ അല്ലെങ്കിൽ അപൂർണ്ണമായ ബാക്കപ്പ് കോഡ്. വീണ്ടും പരിശോധിക്കുക.',
    };
  }
}

async function deriveAesGcmKey(pin: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`SKSSF-GUIDE-BK3::${pin}`),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function applyRestoredBackupBundle(decoded: Partial<BackupBundleV2>): RestoreBackupResult {
  const cleanOwnerName = (decoded.ownerName || '').trim().slice(0, 60);
  const cleanGame = decoded.game ? sanitizeSavedGameState(decoded.game) : null;
  const cleanHistory = sanitizeRunHistory(decoded.history);
  const cleanDaily = sanitizeDailyState(decoded.daily);
  cleanDaily.profile = {
    ...cleanDaily.profile,
    playerName: cleanOwnerName,
    lockedCertificateName: cleanOwnerName,
  };

  if (cleanGame) {
    saveGameState(cleanGame);
    try {
      const serializedIds = JSON.stringify(cleanGame.completedLessonIds);
      localStorage.setItem('skssf_guide_completed_lessons_v1', serializedIds);
      localStorage.setItem('skssf_confirmed_lessons_v1', serializedIds);
    } catch {
      // Ignore
    }
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(cleanHistory));
  } catch {
    // Ignore
  }

  saveDailyAndProfileState(cleanDaily);

  if (
    decoded.soundPack === 'classic' ||
    decoded.soundPack === 'oud_warm' ||
    decoded.soundPack === 'crystal_bell'
  ) {
    try {
      const prevAudio = localStorage.getItem(AUDIO_KEY);
      const parsedAudio = prevAudio ? JSON.parse(prevAudio) : {};
      localStorage.setItem(
        AUDIO_KEY,
        JSON.stringify({ ...parsedAudio, soundPack: decoded.soundPack })
      );
    } catch {
      // Ignore
    }
  }

  return {
    ok: true,
    restoredName: cleanOwnerName,
    restoredLessons: cleanGame?.completedLessonIds.length ?? 0,
    restoredXp: cleanGame?.xp ?? 0,
    restoredStreak: cleanDaily.streakDays,
  };
}

export async function exportProgressBackupCodeAsync(
  learnerName: string,
  pin: string
): Promise<ExportBackupResult> {
  const cleanPin = pin.trim();
  if (!/^\d{4}$/.test(cleanPin)) {
    return {
      ok: false,
      error: '4 അക്ക രഹസ്യ PIN നമ്പർ നൽകുക (ഉദാ: 4829).',
    };
  }

  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return exportProgressBackupCode(learnerName, cleanPin);
  }

  const daily = loadDailyAndProfileState();
  const lockedExisting = daily.profile.lockedCertificateName?.trim();
  const cleanName = (lockedExisting || learnerName.trim()).slice(0, 60);

  if (cleanName.length < 2) {
    return {
      ok: false,
      error: 'ബാക്കപ്പ് സുരക്ഷിതമാക്കാൻ നിങ്ങളുടെ പേര് നൽകുക (കുറഞ്ഞത് 2 അക്ഷരം).',
    };
  }

  const updatedDaily: DailyAndProfileState = {
    ...daily,
    profile: {
      ...daily.profile,
      playerName: cleanName,
      ...(lockedExisting ? { lockedCertificateName: lockedExisting } : {}),
    },
  };
  saveDailyAndProfileState(updatedDaily);

  let soundPack: string | undefined;
  try {
    const audioRaw = localStorage.getItem(AUDIO_KEY);
    if (audioRaw) {
      const audioObj = JSON.parse(audioRaw) as { soundPack?: string };
      if (typeof audioObj.soundPack === 'string') {
        soundPack = audioObj.soundPack;
      }
    }
  } catch {
    // Ignore
  }

  const game = loadSavedGameState();
  const history = loadRunHistory();
  const exportedAt = Date.now();
  const sig = fnv1aHex(
    `${cleanPin}|${cleanName}|${exportedAt}|${game?.xp ?? 0}|${game?.completedLessonIds.length ?? 0}`
  );

  const bundle: BackupBundleV2 = {
    v: 2,
    exportedAt,
    ownerName: cleanName,
    sig,
    game,
    history,
    daily: updatedDaily,
    soundPack,
  };

  try {
    const salt = new Uint8Array(new ArrayBuffer(16));
    const iv = new Uint8Array(new ArrayBuffer(12));
    crypto.getRandomValues(salt);
    crypto.getRandomValues(iv);
    const aesKey = await deriveAesGcmKey(cleanPin, salt);
    const plainBytes = new TextEncoder().encode(JSON.stringify(bundle));
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plainBytes);
    const cipherBytes = new Uint8Array(cipherBuf);
    return {
      ok: true,
      ownerName: cleanName,
      code: `${BACKUP_V3_PREFIX}${bytesToBase64(salt)}:${bytesToBase64(iv)}:${bytesToBase64(cipherBytes)}`,
    };
  } catch {
    return exportProgressBackupCode(learnerName, cleanPin);
  }
}

export async function importProgressBackupCodeAsync(
  rawInput: string,
  pin: string
): Promise<RestoreBackupResult> {
  const trimmed = rawInput.trim();
  const cleanPin = pin.trim();

  if (trimmed.includes(BACKUP_V2_PREFIX) && !trimmed.includes(BACKUP_V3_PREFIX)) {
    return importProgressBackupCode(trimmed, cleanPin);
  }
  if (trimmed.includes(BACKUP_V1_PREFIX) && !trimmed.includes(BACKUP_V3_PREFIX)) {
    return importProgressBackupCode(trimmed, cleanPin);
  }

  const bk3Match = trimmed.match(/SKSSF-BK3:[A-Za-z0-9+/=\s]+:[A-Za-z0-9+/=\s]+:[A-Za-z0-9+/=\s]+/);
  if (!bk3Match) {
    return {
      ok: false,
      error: 'തെറ്റായ ബാക്കപ്പ് കോഡാണ്. SKSSF-BK3: അല്ലെങ്കിൽ SKSSF-BK2: എന്ന് തുടങ്ങുന്ന മുഴുവൻ കോഡും ഒട്ടിക്കുക.',
    };
  }

  if (!/^\d{4}$/.test(cleanPin)) {
    return {
      ok: false,
      error: 'ബാക്കപ്പ് ഉണ്ടാക്കിയപ്പോൾ നൽകിയ 4 അക്ക PIN നമ്പർ നൽകുക.',
    };
  }

  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return {
      ok: false,
      error: 'ഈ ബ്രൗസറിൽ SKSSF-BK3 എൻക്രിപ്ഷൻ പിന്തുണയില്ല — സുരക്ഷിത HTTPS ബ്രൗസർ ഉപയോഗിക്കുക.',
    };
  }

  try {
    const body = bk3Match[0].slice(BACKUP_V3_PREFIX.length).replace(/\s+/g, '');
    const parts = body.split(':');
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2] || parts[2].length > 90000) {
      return { ok: false, error: 'ബാക്കപ്പ് കോഡ് അപൂർണ്ണമാണ് അല്ലെങ്കിൽ തകരാറുള്ളതാണ്.' };
    }
    const rawSalt = base64ToBytes(parts[0]);
    const rawIv = base64ToBytes(parts[1]);
    const rawCipher = base64ToBytes(parts[2]);

    const salt = new Uint8Array(new ArrayBuffer(rawSalt.length));
    salt.set(rawSalt);
    const iv = new Uint8Array(new ArrayBuffer(rawIv.length));
    iv.set(rawIv);
    const cipher = new Uint8Array(new ArrayBuffer(rawCipher.length));
    cipher.set(rawCipher);

    const aesKey = await deriveAesGcmKey(cleanPin, salt);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, cipher);
    const decodedText = new TextDecoder().decode(new Uint8Array(plainBuf));
    const decoded = JSON.parse(decodedText) as Partial<BackupBundleV2>;

    if (
      !decoded ||
      typeof decoded !== 'object' ||
      decoded.v !== 2 ||
      typeof decoded.ownerName !== 'string' ||
      decoded.ownerName.trim().length < 2
    ) {
      return { ok: false, error: 'തെറ്റായ 4 അക്ക PIN അല്ലെങ്കിൽ തകരാറുള്ള ബാക്കപ്പ് കോഡ്!' };
    }

    return applyRestoredBackupBundle(decoded);
  } catch {
    return {
      ok: false,
      error: 'തെറ്റായ 4 അക്ക PIN നമ്പർ അല്ലെങ്കിൽ അപൂർണ്ണമായ ബാക്കപ്പ് കോഡ്. വീണ്ടും പരിശോധിക്കുക.',
    };
  }
}

export function clearAllAppStorage(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(DAILY_KEY);
    localStorage.removeItem('skssf_guide_completed_lessons_v1');
    localStorage.removeItem('skssf_confirmed_lessons_v1');
    localStorage.removeItem('skssf_guide_audio_v3');
    localStorage.removeItem('skssf_guide_audio_v2');
    localStorage.removeItem('skssf_guide_audio_v1');
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('skssf_') || k.startsWith('mission_samastha_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore storage errors
  }
}
