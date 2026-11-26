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

const SAVE_KEY = 'skssf_guide_progress_v2';
const HISTORY_KEY = 'skssf_guide_run_history_v2';

export function loadSavedGameState(): SavedGameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedGameState>;
    if (!parsed || typeof parsed !== 'object') return null;

    const validStage =
      parsed.stage === 'prologue' ||
      parsed.stage === 'storyboard' ||
      parsed.stage === 'pov' ||
      parsed.stage === 'world'
        ? parsed.stage
        : 'prologue';

    const validLevel: 1 | 2 | 3 | 4 =
      parsed.currentLevel === 2 || parsed.currentLevel === 3 || parsed.currentLevel === 4
        ? parsed.currentLevel
        : 1;

    const parsedLives =
      typeof parsed.lives === 'number' && Number.isFinite(parsed.lives)
        ? Math.max(0, Math.min(3, Math.round(parsed.lives)))
        : 3;

    return {
      version: 2,
      stage: validStage,
      currentLevel: validLevel,
      activeLessonId: typeof parsed.activeLessonId === 'string' ? parsed.activeLessonId : 'prologue_curiosity',
      xp: typeof parsed.xp === 'number' && Number.isFinite(parsed.xp) ? Math.max(0, parsed.xp) : 0,
      awardedActions: Array.isArray(parsed.awardedActions) ? parsed.awardedActions.filter((x): x is string => typeof x === 'string') : [],
      badges: Array.isArray(parsed.badges) ? parsed.badges.filter((x): x is string => typeof x === 'string') : [],
      unlockedLevels:
        Array.isArray(parsed.unlockedLevels) && parsed.unlockedLevels.length > 0
          ? parsed.unlockedLevels.filter((x): x is number => typeof x === 'number')
          : [1],
      completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels.filter((x): x is number => typeof x === 'number') : [],
      completedLessonIds: Array.isArray(parsed.completedLessonIds)
        ? parsed.completedLessonIds.filter((x): x is string => typeof x === 'string')
        : [],
      collectedEggs: Array.isArray(parsed.collectedEggs) ? parsed.collectedEggs.filter((x): x is string => typeof x === 'string') : [],
      quizAnswers: parsed.quizAnswers && typeof parsed.quizAnswers === 'object' ? parsed.quizAnswers : {},
      lives: parsedLives,
      runNumber: typeof parsed.runNumber === 'number' && parsed.runNumber >= 1 ? parsed.runNumber : 1,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
    };
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

export function loadRunHistory(): RunHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is RunHistoryEntry => item && typeof item.runNumber === 'number');
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

export function clearAllAppStorage(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(HISTORY_KEY);
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
