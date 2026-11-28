export type FontSizeLevel = 1 | 2 | 3 | 4 | 5;

export interface DisplayPrefsSnapshot {
  darkMode: boolean;
  fontLevel: FontSizeLevel;
  language: string;
}

export const FONT_LEVEL_META: Record<
  FontSizeLevel,
  { scalePct: number; label: string }
> = {
  1: { scalePct: 87.5, label: 'ചെറുത് (1/5)' },
  2: { scalePct: 100, label: 'സാധാരണം (2/5)' },
  3: { scalePct: 108, label: 'ഇടത്തരം (3/5)' },
  4: { scalePct: 116, label: 'വലുത് (4/5)' },
  5: { scalePct: 125, label: 'ഏറ്റവും വലുത് (5/5)' },
};

const STORAGE_KEY = 'skssf_display_prefs_v1';

/** Clean up any legacy third-party translation cookies if previously set */
function clearLegacyTranslateCookies(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const expiryPast = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `googtrans=; expires=${expiryPast}; path=/`;
  const host = window.location.hostname;
  if (host && host.includes('.')) {
    document.cookie = `googtrans=; expires=${expiryPast}; path=/; domain=.${host}`;
    document.cookie = `googtrans=; expires=${expiryPast}; path=/; domain=${host}`;
  }
}

class DisplayPrefsManager {
  private prefs: DisplayPrefsSnapshot = {
    darkMode: false,
    fontLevel: 2,
    language: 'ml',
  };
  private listeners = new Set<(snap: DisplayPrefsSnapshot) => void>();

  constructor() {
    this.loadFromStorage();
    clearLegacyTranslateCookies();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DisplayPrefsSnapshot>;
        const darkMode = Boolean(parsed.darkMode);
        const rawLevel = Number(parsed.fontLevel);
        const fontLevel: FontSizeLevel =
          rawLevel >= 1 && rawLevel <= 5 ? (Math.round(rawLevel) as FontSizeLevel) : 2;
        this.prefs = { darkMode, fontLevel, language: 'ml' };
      }
    } catch {
      // Ignore storage read errors
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
    } catch {
      // Ignore storage write errors
    }
  }

  private emit(): void {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => fn(snap));
  }

  public getSnapshot(): DisplayPrefsSnapshot {
    return { ...this.prefs };
  }

  public subscribe(fn: (snap: DisplayPrefsSnapshot) => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  public applyToDom(): void {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.classList.toggle('dark', this.prefs.darkMode);
    html.dataset.theme = this.prefs.darkMode ? 'dark' : 'light';
    html.dataset.fontLevel = String(this.prefs.fontLevel);

    const scalePct = FONT_LEVEL_META[this.prefs.fontLevel].scalePct;
    html.style.fontSize = `${scalePct}%`;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', this.prefs.darkMode ? '#0b1220' : '#047857');
    }
  }

  public setDarkMode(enabled: boolean): void {
    this.prefs.darkMode = enabled;
    this.persist();
    this.applyToDom();
    this.emit();
  }

  public toggleDarkMode(): void {
    this.setDarkMode(!this.prefs.darkMode);
  }

  public setFontLevel(level: number): void {
    const clamped = Math.max(1, Math.min(5, Math.round(level))) as FontSizeLevel;
    this.prefs.fontLevel = clamped;
    this.persist();
    this.applyToDom();
    this.emit();
  }

  public stepFontLevel(delta: -1 | 1): void {
    this.setFontLevel(this.prefs.fontLevel + delta);
  }

  public resetToDefaults(): void {
    this.prefs = { darkMode: false, fontLevel: 2, language: 'ml' };
    this.persist();
    clearLegacyTranslateCookies();
    this.applyToDom();
    this.emit();
  }
}

export const displayPrefs = new DisplayPrefsManager();
