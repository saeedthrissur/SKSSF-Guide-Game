export type FontSizeLevel = 1 | 2 | 3 | 4 | 5;

export interface DisplayPrefsSnapshot {
  darkMode: boolean;
  fontLevel: FontSizeLevel;
  language: string;
}

export interface TranslateLanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
}

export const TRANSLATE_LANGUAGES: TranslateLanguageOption[] = [
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം (Original)' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
];

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

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: new (
          options: Record<string, unknown>,
          elementId: string
        ) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

function readCookieLanguage(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/i);
  if (match?.[1]) {
    return decodeURIComponent(match[1]).trim();
  }
  return null;
}

function setGoogleTranslateCookie(langCode: string): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const host = window.location.hostname;
  const expiryPast = 'Thu, 01 Jan 1970 00:00:00 GMT';
  if (!langCode || langCode === 'ml') {
    document.cookie = `googtrans=; expires=${expiryPast}; path=/`;
    if (host && host.includes('.')) {
      document.cookie = `googtrans=; expires=${expiryPast}; path=/; domain=.${host}`;
      document.cookie = `googtrans=; expires=${expiryPast}; path=/; domain=${host}`;
    }
    return;
  }
  const value = `/ml/${langCode}`;
  document.cookie = `googtrans=${value}; path=/; SameSite=Lax`;
  if (host && host.includes('.')) {
    document.cookie = `googtrans=${value}; path=/; domain=.${host}; SameSite=Lax`;
  }
}

class DisplayPrefsManager {
  private prefs: DisplayPrefsSnapshot = {
    darkMode: false,
    fontLevel: 2,
    language: 'ml',
  };
  private listeners = new Set<(snap: DisplayPrefsSnapshot) => void>();
  private gtScriptRequested = false;
  private gtInitialized = false;
  private pendingLang: string | null = null;

  constructor() {
    this.loadFromStorage();
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
        const cookieLang = readCookieLanguage();
        const language =
          typeof parsed.language === 'string' && parsed.language
            ? parsed.language
            : cookieLang || 'ml';
        this.prefs = { darkMode, fontLevel, language };
      } else {
        const cookieLang = readCookieLanguage();
        if (cookieLang && cookieLang !== 'ml') {
          this.prefs.language = cookieLang;
        }
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

    if (this.prefs.language && this.prefs.language !== 'ml') {
      setGoogleTranslateCookie(this.prefs.language);
      this.ensureGoogleTranslateLoaded();
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

  public ensureGoogleTranslateLoaded(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Ensure hidden mount container exists permanently in document.body
    let mount = document.getElementById('google_translate_element');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'google_translate_element';
      mount.style.position = 'fixed';
      mount.style.bottom = '-9999px';
      mount.style.left = '-9999px';
      mount.style.visibility = 'hidden';
      document.body.appendChild(mount);
    }

    if (this.gtInitialized) {
      if (this.pendingLang) {
        this.applyComboLanguage(this.pendingLang);
      }
      return;
    }

    window.googleTranslateElementInit = () => {
      try {
        const TranslateElement = window.google?.translate?.TranslateElement;
        if (!TranslateElement) return;
        new TranslateElement(
          {
            pageLanguage: 'ml',
            autoDisplay: false,
            includedLanguages: 'ml,en,ar,ur,hi,ta,kn,te,bn,fr,es,de,id,ms,tr',
          },
          'google_translate_element'
        );
        this.gtInitialized = true;
        if (this.pendingLang) {
          window.setTimeout(() => this.applyComboLanguage(this.pendingLang!), 350);
        }
      } catch {
        // Ignore third-party widget init errors
      }
    };

    if (!this.gtScriptRequested) {
      this.gtScriptRequested = true;
      const script = document.createElement('script');
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  private applyComboLanguage(langCode: string, retries = 10): void {
    if (typeof document === 'undefined') return;
    const combo = document.querySelector<HTMLSelectElement>('select.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      this.pendingLang = null;
      return;
    }
    if (retries > 0) {
      window.setTimeout(() => this.applyComboLanguage(langCode, retries - 1), 300);
    }
  }

  public setLanguage(langCode: string): void {
    const normalized = (langCode || 'ml').trim();
    const prev = this.prefs.language;
    this.prefs.language = normalized;
    this.persist();
    this.emit();

    setGoogleTranslateCookie(normalized);

    if (normalized === 'ml') {
      // Returning to original Malayalam: cleanly restore original text nodes
      const combo =
        typeof document !== 'undefined'
          ? document.querySelector<HTMLSelectElement>('select.goog-te-combo')
          : null;
      if (combo) {
        combo.value = 'ml';
        combo.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (prev !== 'ml' && typeof window !== 'undefined') {
        window.setTimeout(() => window.location.reload(), 120);
      }
      return;
    }

    this.pendingLang = normalized;
    this.ensureGoogleTranslateLoaded();
    this.applyComboLanguage(normalized);
  }

  public resetToDefaults(): void {
    const wasTranslated = this.prefs.language !== 'ml';
    this.prefs = { darkMode: false, fontLevel: 2, language: 'ml' };
    this.persist();
    setGoogleTranslateCookie('ml');
    this.applyToDom();
    this.emit();
    if (wasTranslated && typeof window !== 'undefined') {
      window.setTimeout(() => window.location.reload(), 120);
    }
  }
}

export const displayPrefs = new DisplayPrefsManager();
