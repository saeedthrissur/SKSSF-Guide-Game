export interface DailyMissionItem {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  target: number;
  progress: number;
  rewardXp: number;
  claimed: boolean;
}

export interface EngagementSnapshot {
  streakDays: number;
  bestStreak: number;
  lastActiveDate: string | null;
  recentActiveDates: string[];
  dailyMissionsDate: string;
  missions: DailyMissionItem[];
  unclaimedCount: number;
  totalMissionsClaimed: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  unit: string;
  mekhala: string;
  xp: number;
  completedLessons: number;
  streakDays: number;
  isCurrentUser?: boolean;
  isSample?: boolean;
  updatedAt: number;
}

export interface PlayerLeaderboardProfile {
  name: string;
  unit: string;
  mekhala: string;
}

export const PRESET_SKSSF_UNITS: { id: string; label: string; malayalam: string }[] = [
  { id: 'Arangadi', label: 'Arangadi', malayalam: 'അറങ്ങാടി' },
  { id: 'Thaikkadav', label: 'Thaikkadav', malayalam: 'തൈക്കടവ്' },
  { id: 'Kadappuram-Anchangadi', label: 'Kadappuram-Anchangadi', malayalam: 'കടപ്പുറം-അഞ്ചങ്ങാടി' },
  { id: 'Thiruvathra', label: 'Thiruvathra', malayalam: 'തിരുവത്ര' },
  { id: 'Karukamad', label: 'Karukamad', malayalam: 'കരുക്കമാട്' },
  { id: 'Munakkadav', label: 'Munakkadav', malayalam: 'മുനക്കടവ്' },
  { id: 'Vattekkad', label: 'Vattekkad', malayalam: 'വട്ടേക്കാട്' },
];

export const DEFAULT_MEKHAlA_LABEL = 'ചാവക്കാട് / തൃശ്ശൂർ മേഖല';

const ENGAGEMENT_KEY = 'skssf_engagement_v1';
const LEADERBOARD_PROFILE_KEY = 'skssf_lb_profile_v1';
const LEADERBOARD_PEERS_KEY = 'skssf_lb_peers_v1';

interface StoredEngagement {
  streakDays: number;
  bestStreak: number;
  lastActiveDate: string | null;
  recentActiveDates: string[];
  dailyMissionsDate: string;
  missions: DailyMissionItem[];
  totalMissionsClaimed: number;
}

interface MissionTemplate {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  target: number;
  rewardXp: number;
}

const MISSION_POOL: MissionTemplate[] = [
  {
    id: 'complete_lesson_1',
    title: 'ഇന്ന് 1 പാഠം പൂർത്തിയാക്കാം',
    subtitle: 'ഏതെങ്കിലും ഒരു പാഠവും ക്വിസും പൂർത്തിയാക്കുക',
    emoji: '📘',
    target: 1,
    rewardXp: 20,
  },
  {
    id: 'quiz_perfect_1',
    title: 'ക്വിസിൽ 100% ശരിയുത്തരം നേടാം',
    subtitle: 'ഒരു പാഠത്തിന്റെ ക്വിസിൽ ശരിയായ ഉത്തരം തിരഞ്ഞെടുക്കുക',
    emoji: '🎯',
    target: 1,
    rewardXp: 20,
  },
  {
    id: 'viqaya_wing_1',
    title: 'വിഖായ / വിംഗ് പാഠം പഠിക്കാം',
    subtitle: 'വിഖായ, സഹചാരി, ട്രെൻഡ്, പതാക അല്ലെങ്കിൽ POV പാഠം പൂർത്തിയാക്കുക',
    emoji: '🦺',
    target: 1,
    rewardXp: 25,
  },
  {
    id: 'share_progress_1',
    title: 'പുരോഗതി കൂട്ടുകാരുമായി ഷെയർ ചെയ്യാം',
    subtitle: 'വാട്‌സ്ആപ്പിലോ ലിങ്ക് കോപ്പി ചെയ്തോ ഫലം പങ്കുവെയ്ക്കുക',
    emoji: '📲',
    target: 1,
    rewardXp: 15,
  },
  {
    id: 'complete_lesson_2',
    title: 'ഇന്ന് 2 പാഠങ്ങൾ മുന്നേറാം',
    subtitle: 'തുടർച്ചയായി 2 പാഠങ്ങൾ പൂർത്തിയാക്കി ബോണസ് നേടുക',
    emoji: '🚀',
    target: 2,
    rewardXp: 30,
  },
  {
    id: 'community_rank_1',
    title: 'യൂണിറ്റ് ലീഡർബോർഡിൽ പേര് ചേർക്കാം',
    subtitle: 'നിങ്ങളുടെ പേരും SKSSF യൂണിറ്റും സേവ് ചെയ്യുക അല്ലെങ്കിൽ ബാഡ്ജ് തുറക്കുക',
    emoji: '🏅',
    target: 1,
    rewardXp: 15,
  },
];

const SAMPLE_UNIT_ENTRIES: LeaderboardEntry[] = [
  {
    id: 'sample_arangadi',
    name: 'യൂണിറ്റ് മാതൃക · അറങ്ങാടി',
    unit: 'Arangadi',
    mekhala: 'ചാവക്കാട് മേഖല',
    xp: 420,
    completedLessons: 34,
    streakDays: 6,
    isSample: true,
    updatedAt: 1700000001,
  },
  {
    id: 'sample_thaikkadav',
    name: 'യൂണിറ്റ് മാതൃക · തൈക്കടവ്',
    unit: 'Thaikkadav',
    mekhala: 'ചാവക്കാട് മേഖല',
    xp: 365,
    completedLessons: 29,
    streakDays: 5,
    isSample: true,
    updatedAt: 1700000002,
  },
  {
    id: 'sample_kadappuram',
    name: 'യൂണിറ്റ് മാതൃക · കടപ്പുറം-അഞ്ചങ്ങാടി',
    unit: 'Kadappuram-Anchangadi',
    mekhala: 'ചാവക്കാട് മേഖല',
    xp: 310,
    completedLessons: 24,
    streakDays: 4,
    isSample: true,
    updatedAt: 1700000003,
  },
  {
    id: 'sample_thiruvathra',
    name: 'യൂണിറ്റ് മാതൃക · തിരുവത്ര',
    unit: 'Thiruvathra',
    mekhala: 'ചാവക്കാട് മേഖല',
    xp: 245,
    completedLessons: 19,
    streakDays: 3,
    isSample: true,
    updatedAt: 1700000004,
  },
  {
    id: 'sample_karukamad',
    name: 'യൂണിറ്റ് മാതൃക · കരുക്കമാട്',
    unit: 'Karukamad',
    mekhala: 'ചാവക്കാട് മേഖല',
    xp: 190,
    completedLessons: 15,
    streakDays: 3,
    isSample: true,
    updatedAt: 1700000005,
  },
  {
    id: 'sample_munakkadav',
    name: 'യൂണിറ്റ് മാതൃക · മുനക്കടവ്',
    unit: 'Munakkadav',
    mekhala: 'ചാവക്കാട് മേഖല',
    xp: 140,
    completedLessons: 11,
    streakDays: 2,
    isSample: true,
    updatedAt: 1700000006,
  },
  {
    id: 'sample_vattekkad',
    name: 'യൂണിറ്റ് മാതൃക · വട്ടേക്കാട്',
    unit: 'Vattekkad',
    mekhala: 'ചാവക്കാട് മേഖല',
    xp: 95,
    completedLessons: 7,
    streakDays: 2,
    isSample: true,
    updatedAt: 1700000007,
  },
];

export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayKey(date = new Date()): string {
  const prev = new Date(date.getTime());
  prev.setDate(prev.getDate() - 1);
  return getLocalDateKey(prev);
}

export function getLast7DateKeys(today = new Date()): string[] {
  const keys: string[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today.getTime());
    d.setDate(d.getDate() - i);
    keys.push(getLocalDateKey(d));
  }
  return keys;
}

function generateMissionsForDate(dateKey: string): DailyMissionItem[] {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) % 9973;
  }

  // Always pick 1 core study/quiz mission, 1 wing/multi-lesson mission, and 1 share/community mission
  const groupA = [MISSION_POOL[0], MISSION_POOL[1]];
  const groupB = [MISSION_POOL[2], MISSION_POOL[4]];
  const groupC = [MISSION_POOL[3], MISSION_POOL[5]];

  const picked: MissionTemplate[] = [
    groupA[hash % groupA.length],
    groupB[Math.floor(hash / 2) % groupB.length],
    groupC[Math.floor(hash / 3) % groupC.length],
  ];

  return picked.map((tpl) => ({
    ...tpl,
    progress: 0,
    claimed: false,
  }));
}

function isWingOrPracticalLesson(lessonId: string): boolean {
  return (
    lessonId.startsWith('pov_') ||
    lessonId.includes('viqaya') ||
    lessonId.includes('wing') ||
    lessonId.includes('sahachari') ||
    lessonId.includes('trend') ||
    lessonId.includes('sargalayam') ||
    lessonId.includes('cyber') ||
    lessonId.includes('flag')
  );
}

type EngagementListener = (snap: EngagementSnapshot) => void;

class EngagementStore {
  private state: StoredEngagement;
  private listeners = new Set<EngagementListener>();

  constructor() {
    this.state = this.loadState();
  }

  private createDefaultState(): StoredEngagement {
    const today = getLocalDateKey();
    return {
      streakDays: 1,
      bestStreak: 1,
      lastActiveDate: today,
      recentActiveDates: [today],
      dailyMissionsDate: today,
      missions: generateMissionsForDate(today),
      totalMissionsClaimed: 0,
    };
  }

  private loadState(): StoredEngagement {
    const today = getLocalDateKey();
    if (typeof window === 'undefined') {
      return this.createDefaultState();
    }
    try {
      const raw = window.localStorage.getItem(ENGAGEMENT_KEY);
      if (!raw) {
        const fresh = this.createDefaultState();
        this.persist(fresh);
        return fresh;
      }
      const parsed = JSON.parse(raw) as Partial<StoredEngagement>;
      const sameDayMissions =
        parsed.dailyMissionsDate === today && Array.isArray(parsed.missions) && parsed.missions.length === 3
          ? parsed.missions
          : generateMissionsForDate(today);

      const loaded: StoredEngagement = {
        streakDays: typeof parsed.streakDays === 'number' && parsed.streakDays >= 0 ? parsed.streakDays : 1,
        bestStreak: typeof parsed.bestStreak === 'number' && parsed.bestStreak >= 1 ? parsed.bestStreak : 1,
        lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : null,
        recentActiveDates: Array.isArray(parsed.recentActiveDates)
          ? parsed.recentActiveDates.filter((d): d is string => typeof d === 'string').slice(-14)
          : [],
        dailyMissionsDate: today,
        missions: sameDayMissions,
        totalMissionsClaimed:
          typeof parsed.totalMissionsClaimed === 'number' ? parsed.totalMissionsClaimed : 0,
      };
      return this.applyDailyVisit(loaded);
    } catch {
      return this.createDefaultState();
    }
  }

  private applyDailyVisit(current: StoredEngagement): StoredEngagement {
    const today = getLocalDateKey();
    const yesterday = getYesterdayKey();
    let streakDays = current.streakDays;

    if (current.lastActiveDate === today) {
      streakDays = Math.max(1, streakDays);
    } else if (current.lastActiveDate === yesterday) {
      streakDays = Math.max(1, streakDays) + 1;
    } else {
      streakDays = 1;
    }

    const bestStreak = Math.max(current.bestStreak || 1, streakDays);
    const recentSet = new Set(current.recentActiveDates);
    recentSet.add(today);
    const recentActiveDates = Array.from(recentSet).sort().slice(-14);

    const missions =
      current.dailyMissionsDate === today && current.missions.length === 3
        ? current.missions
        : generateMissionsForDate(today);

    const next: StoredEngagement = {
      ...current,
      streakDays,
      bestStreak,
      lastActiveDate: today,
      recentActiveDates,
      dailyMissionsDate: today,
      missions,
    };
    this.persist(next);
    return next;
  }

  private persist(next: StoredEngagement) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }

  private emit() {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => fn(snap));
  }

  public getSnapshot(): EngagementSnapshot {
    const unclaimedCount = this.state.missions.filter(
      (m) => m.progress >= m.target && !m.claimed
    ).length;
    return {
      streakDays: this.state.streakDays,
      bestStreak: this.state.bestStreak,
      lastActiveDate: this.state.lastActiveDate,
      recentActiveDates: [...this.state.recentActiveDates],
      dailyMissionsDate: this.state.dailyMissionsDate,
      missions: this.state.missions.map((m) => ({ ...m })),
      unclaimedCount,
      totalMissionsClaimed: this.state.totalMissionsClaimed,
    };
  }

  public subscribe(fn: EngagementListener): () => void {
    this.listeners.add(fn);
    fn(this.getSnapshot());
    return () => {
      this.listeners.delete(fn);
    };
  }

  public recordDailyActivity() {
    this.state = this.applyDailyVisit(this.state);
    this.emit();
  }

  private incrementMissionIds(ids: string[]) {
    this.state = this.applyDailyVisit(this.state);
    let changed = false;
    const nextMissions = this.state.missions.map((m) => {
      if (!ids.includes(m.id)) return m;
      const nextProgress = Math.min(m.target, m.progress + 1);
      if (nextProgress !== m.progress) {
        changed = true;
        return { ...m, progress: nextProgress };
      }
      return m;
    });
    if (changed) {
      this.state = { ...this.state, missions: nextMissions };
      this.persist(this.state);
      this.emit();
    }
  }

  public recordLessonCompleted(lessonId: string) {
    const ids = ['complete_lesson_1', 'complete_lesson_2'];
    if (isWingOrPracticalLesson(lessonId)) {
      ids.push('viqaya_wing_1');
    }
    this.incrementMissionIds(ids);
  }

  public recordQuizCorrect(lessonId?: string) {
    const ids = ['quiz_perfect_1'];
    if (lessonId && isWingOrPracticalLesson(lessonId)) {
      ids.push('viqaya_wing_1');
    }
    this.incrementMissionIds(ids);
  }

  public recordShareAction() {
    this.incrementMissionIds(['share_progress_1']);
  }

  public recordCommunityAction() {
    this.incrementMissionIds(['community_rank_1']);
  }

  public claimMission(missionId: string): number {
    this.state = this.applyDailyVisit(this.state);
    let reward = 0;
    const nextMissions = this.state.missions.map((m) => {
      if (m.id === missionId && m.progress >= m.target && !m.claimed) {
        reward = m.rewardXp;
        return { ...m, claimed: true };
      }
      return m;
    });
    if (reward > 0) {
      this.state = {
        ...this.state,
        missions: nextMissions,
        totalMissionsClaimed: this.state.totalMissionsClaimed + 1,
      };
      this.persist(this.state);
      this.emit();
    }
    return reward;
  }

  public resetAll() {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(ENGAGEMENT_KEY);
        window.localStorage.removeItem(LEADERBOARD_PROFILE_KEY);
        window.localStorage.removeItem(LEADERBOARD_PEERS_KEY);
      } catch {
        // Ignore
      }
    }
    this.state = this.createDefaultState();
    this.persist(this.state);
    this.emit();
  }
}

export const engagementStore = new EngagementStore();

export function loadLeaderboardProfile(): PlayerLeaderboardProfile {
  if (typeof window === 'undefined') {
    return { name: '', unit: 'Arangadi', mekhala: DEFAULT_MEKHAlA_LABEL };
  }
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_PROFILE_KEY);
    if (!raw) return { name: '', unit: 'Arangadi', mekhala: DEFAULT_MEKHAlA_LABEL };
    const parsed = JSON.parse(raw) as Partial<PlayerLeaderboardProfile>;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      unit: typeof parsed.unit === 'string' && parsed.unit.trim() ? parsed.unit : 'Arangadi',
      mekhala:
        typeof parsed.mekhala === 'string' && parsed.mekhala.trim()
          ? parsed.mekhala
          : DEFAULT_MEKHAlA_LABEL,
    };
  } catch {
    return { name: '', unit: 'Arangadi', mekhala: DEFAULT_MEKHAlA_LABEL };
  }
}

export function saveLeaderboardProfile(profile: PlayerLeaderboardProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LEADERBOARD_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore
  }
}

export function loadSavedPeerEntries(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_PEERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePeerEntries(entries: LeaderboardEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LEADERBOARD_PEERS_KEY, JSON.stringify(entries.slice(0, 40)));
  } catch {
    // Ignore
  }
}

export function getSampleUnitEntries(): LeaderboardEntry[] {
  return SAMPLE_UNIT_ENTRIES.map((e) => ({ ...e }));
}

export function formatUnitDisplay(unitId: string): string {
  const found = PRESET_SKSSF_UNITS.find((u) => u.id === unitId);
  return found ? `${found.malayalam} (${found.label})` : unitId;
}

export function buildLeaderboardWhatsAppMessage(params: {
  playerName: string;
  unit: string;
  mekhala: string;
  rank: number;
  totalEntries: number;
  xp: number;
  completedLessons: number;
  totalLessons: number;
  streakDays: number;
  shareUrl: string;
}): string {
  const displayName = params.playerName.trim() || 'SKSSF പ്രവർത്തകൻ';
  const unitDisplay = formatUnitDisplay(params.unit);
  return [
    `🏆 SKSSF ഗൈഡ് ഗെയിം — യൂണിറ്റ് & മേഖലാ റാങ്ക്!`,
    `👤 പേര്: ${displayName}`,
    `📍 യൂണിറ്റ്: ${unitDisplay}`,
    `🏛️ മേഖല: ${params.mekhala}`,
    `🥇 റാങ്ക്: #${params.rank} / ${params.totalEntries}`,
    `⭐ സ്കോർ: ${params.xp} XP · 📘 പാഠങ്ങൾ: ${params.completedLessons}/${params.totalLessons} · 🔥 തുടർച്ച: ${params.streakDays} ദിവസം`,
    `“വിജ്ഞാനം, വിനയം, സേവനം” — നിങ്ങളും കളിച്ചു നോക്കൂ:`,
    params.shareUrl,
  ].join('\n');
}
