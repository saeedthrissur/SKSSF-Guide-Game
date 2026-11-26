export type AmbienceScene = 'harbor' | 'heritage' | 'conference' | 'study';
export type QuranTrackId = 'fatiha' | 'ikhlas';
export type SoundPreset = 'voice_focus' | 'calm_balanced' | 'nature_immersion';
export type BackgroundMode = 'auto' | 'birds' | 'ocean' | 'off';

export const QURAN_TRACKS: { id: QuranTrackId; label: string; url: string; duration: string }[] = [
  {
    id: 'fatiha',
    label: 'സൂറത്തുൽ ഫാതിഹ',
    url: './assets/audio/quran_fatiha.mp3',
    duration: '0:56',
  },
  {
    id: 'ikhlas',
    label: 'സൂറത്തുൽ ഇഖ്‌ലാസ്',
    url: './assets/audio/quran_ikhlas.mp3',
    duration: '0:21',
  },
];

const SCENE_TRACKS: Record<AmbienceScene, { primary: string; label: string }> = {
  harbor: {
    primary: './assets/audio/ocean_waves.mp3',
    label: '🌊 തീരദേശ തിരമാലകൾ',
  },
  heritage: {
    primary: './assets/audio/birds_morning.mp3',
    label: '🐦 പൈതൃക പ്രഭാതം',
  },
  conference: {
    primary: './assets/audio/crowd_hall.mp3',
    label: '🏛️ സമ്മേളന നഗരി',
  },
  study: {
    primary: './assets/audio/birds_morning.mp3',
    label: '🌿 പഠന ശാന്തത',
  },
};

export interface SoundStateSnapshot {
  muted: boolean;
  autoNarrate: boolean;
  ambiencePlaying: boolean;
  backgroundMode: BackgroundMode;
  currentScene: AmbienceScene;
  sceneLabel: string;
  quranPlaying: boolean;
  quranTrack: QuranTrackId;
  quranLabel: string;
  adhanPlaying: boolean;
  sfxEnabled: boolean;
  narratorPct: number;
  ambiencePct: number;
  spiritualPct: number;
  sfxPct: number;
  preset: SoundPreset;
}

type SoundListener = (snap: SoundStateSnapshot) => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = true;
  private autoNarrate: boolean = true;

  // Ambient background audio: OFF by default (only starts softly if user manually turns it on)
  private ambienceActive: boolean = false;
  private userPausedAmbience: boolean = true;
  private backgroundMode: BackgroundMode = 'off';
  private currentScene: AmbienceScene = 'harbor';
  private ambienceAudio: HTMLAudioElement | null = null;
  private secondaryTimer: number | null = null;
  private ducked: boolean = false;

  // Spiritual audio channels (Quran Recitation + Adhan Call)
  private quranActive: boolean = false;
  private quranTrack: QuranTrackId = 'fatiha';
  private quranAudio: HTMLAudioElement | null = null;

  private adhanActive: boolean = false;
  private adhanAudio: HTMLAudioElement | null = null;

  // Game & Environmental SFX pool & toggle
  private sfxAudioPool = new Set<HTMLAudioElement>();
  private sfxEnabled: boolean = true;

  // Sound Balance Enhancement (0-100 percentages — calm & comfortable default volume)
  private narratorPct: number = 76;
  private ambiencePct: number = 5;
  private spiritualPct: number = 60;
  private sfxPct: number = 25;
  private preset: SoundPreset = 'voice_focus';

  private listeners = new Set<SoundListener>();
  private onBeforeSpiritualPlay?: () => void;
  private onNarratorVolChange?: (vol: number) => void;
  private onAutoNarrateChange?: (enabled: boolean) => void;
  private onMuteChange?: (muted: boolean) => void;

  constructor() {
    this.loadSavedPrefs();
    this.attachAutoAmbienceUnlocker();
  }

  private attachAutoAmbienceUnlocker() {
    if (typeof window === 'undefined') return;
    const kick = () => {
      this.unlockAudio();
    };
    window.addEventListener('pointerdown', kick, { capture: true, passive: true });
    window.addEventListener('keydown', kick, { capture: true, passive: true });
  }

  private loadSavedPrefs() {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('skssf_guide_audio_v3');
      if (!raw) return;
      const p = JSON.parse(raw) as Partial<{
        narratorPct: number;
        ambiencePct: number;
        spiritualPct: number;
        sfxPct: number;
        sfxEnabled: boolean;
        autoNarrate: boolean;
        backgroundMode: BackgroundMode;
        userPausedAmbience: boolean;
      }>;
      if (typeof p.narratorPct === 'number') this.narratorPct = Math.max(0, Math.min(100, p.narratorPct));
      if (typeof p.ambiencePct === 'number') this.ambiencePct = Math.max(0, Math.min(100, p.ambiencePct));
      if (typeof p.spiritualPct === 'number') this.spiritualPct = Math.max(0, Math.min(100, p.spiritualPct));
      if (typeof p.sfxPct === 'number') this.sfxPct = Math.max(0, Math.min(100, p.sfxPct));
      if (typeof p.sfxEnabled === 'boolean') this.sfxEnabled = p.sfxEnabled;
      if (typeof p.autoNarrate === 'boolean') this.autoNarrate = p.autoNarrate;
      if (typeof p.userPausedAmbience === 'boolean') this.userPausedAmbience = p.userPausedAmbience;
      if (p.backgroundMode === 'birds' || p.backgroundMode === 'ocean' || p.backgroundMode === 'off') {
        this.backgroundMode = p.backgroundMode;
      }
    } catch {
      // Ignore storage errors
    }
  }

  private savePrefs() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        'skssf_guide_audio_v3',
        JSON.stringify({
          narratorPct: this.narratorPct,
          ambiencePct: this.ambiencePct,
          spiritualPct: this.spiritualPct,
          sfxPct: this.sfxPct,
          sfxEnabled: this.sfxEnabled,
          autoNarrate: this.autoNarrate,
          backgroundMode: this.backgroundMode,
          userPausedAmbience: this.userPausedAmbience,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }

  public resetToDefaults() {
    this.muted = true;
    this.narratorPct = 76;
    this.ambiencePct = 5;
    this.spiritualPct = 60;
    this.sfxPct = 25;
    this.sfxEnabled = true;
    this.autoNarrate = true;
    this.backgroundMode = 'off';
    this.userPausedAmbience = true;
    this.preset = 'voice_focus';
    this.stopAmbience();
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('skssf_guide_audio_v3');
        window.localStorage.removeItem('skssf_guide_audio_v2');
        window.localStorage.removeItem('skssf_guide_audio_v1');
      } catch {
        // Ignore
      }
    }
    this.onMuteChange?.(this.muted);
    this.onAutoNarrateChange?.(this.autoNarrate);
    this.syncActiveVolumes();
    this.emit();
  }

  public registerNarratorHooks(hooks: {
    onBeforeSpiritualPlay?: () => void;
    onNarratorVolChange?: (vol: number) => void;
    onAutoNarrateChange?: (enabled: boolean) => void;
    onMuteChange?: (muted: boolean) => void;
  }) {
    this.onBeforeSpiritualPlay = hooks.onBeforeSpiritualPlay;
    this.onNarratorVolChange = hooks.onNarratorVolChange;
    this.onAutoNarrateChange = hooks.onAutoNarrateChange;
    this.onMuteChange = hooks.onMuteChange;
    this.onAutoNarrateChange?.(this.autoNarrate);
    this.onNarratorVolChange?.(this.getNarratorGain());
  }

  public subscribe(fn: SoundListener): () => void {
    this.listeners.add(fn);
    fn(this.getSnapshot());
    return () => {
      this.listeners.delete(fn);
    };
  }

  public getSnapshot(): SoundStateSnapshot {
    const qTrack = QURAN_TRACKS.find((t) => t.id === this.quranTrack) || QURAN_TRACKS[0];
    return {
      muted: this.muted,
      autoNarrate: this.autoNarrate,
      ambiencePlaying: this.ambienceActive,
      backgroundMode: this.backgroundMode,
      currentScene: this.currentScene,
      sceneLabel:
        this.backgroundMode === 'ocean'
          ? '🌊 ശാന്തമായ കടൽ'
          : SCENE_TRACKS[this.currentScene].label,
      quranPlaying: this.quranActive,
      quranTrack: this.quranTrack,
      quranLabel: qTrack.label,
      adhanPlaying: this.adhanActive,
      sfxEnabled: this.sfxEnabled,
      narratorPct: this.narratorPct,
      ambiencePct: this.ambiencePct,
      spiritualPct: this.spiritualPct,
      sfxPct: this.sfxPct,
      preset: this.preset,
    };
  }

  private emit() {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => fn(snap));
  }

  private getContext(ignoreMute = false): AudioContext | null {
    if ((!ignoreMute && this.muted) || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getNarratorGain(): number {
    if (this.muted || this.narratorPct <= 0) return 0;
    return Math.max(0, Math.min(1, Math.pow(this.narratorPct / 100, 1.35)));
  }

  private getEffectiveAmbienceGain(): number {
    if (this.muted || this.backgroundMode === 'off' || this.ambiencePct <= 0) return 0;
    // Ultra-gentle ceiling so optional nature ambience never annoys or drowns out narration
    const ceiling = this.backgroundMode === 'ocean' ? 0.065 : 0.085;
    const base = Math.pow(this.ambiencePct / 100, 1.55) * ceiling;
    if (this.ducked || this.quranActive || this.adhanActive) {
      return Math.min(base, base * 0.2);
    }
    return base;
  }

  private getEffectiveSpiritualGain(): number {
    if (this.muted || this.spiritualPct <= 0) return 0;
    const base = Math.pow(this.spiritualPct / 100, 1.35) * 0.72;
    // Gently duck background Quran/Adhan while narrator is speaking so both remain pleasant
    if (this.ducked) {
      return Math.min(base, base * 0.35);
    }
    return base;
  }

  private getEffectiveSfxGain(baseWeight = 1.0): number {
    if (this.muted || !this.sfxEnabled || this.sfxPct <= 0) return 0;
    const raw = Math.pow(this.sfxPct / 100, 1.45) * 0.22 * baseWeight;
    if (this.ducked || this.quranActive || this.adhanActive) {
      return Math.min(raw, raw * 0.35);
    }
    return raw;
  }

  private syncActiveVolumes() {
    const ambVol = this.getEffectiveAmbienceGain();
    if (this.ambienceAudio) {
      this.ambienceAudio.volume = ambVol;
      this.ambienceAudio.muted = ambVol <= 0.001;
    }
    const spVol = this.getEffectiveSpiritualGain();
    if (this.quranAudio) {
      this.quranAudio.volume = spVol;
      this.quranAudio.muted = spVol <= 0.001;
    }
    if (this.adhanAudio) {
      this.adhanAudio.volume = spVol;
      this.adhanAudio.muted = spVol <= 0.001;
    }
    const sfxVol = this.getEffectiveSfxGain(0.8);
    this.sfxAudioPool.forEach((a) => {
      try {
        a.volume = sfxVol;
        a.muted = sfxVol <= 0.001;
        if (sfxVol <= 0.001) a.pause();
      } catch {
        // Ignore
      }
    });
    this.onNarratorVolChange?.(this.getNarratorGain());
  }

  public setAutoNarrate(enabled: boolean) {
    this.autoNarrate = enabled;
    this.onAutoNarrateChange?.(enabled);
    this.savePrefs();
    this.emit();
  }

  public setBackgroundMode(mode: BackgroundMode) {
    this.backgroundMode = mode;
    if (mode === 'off') {
      this.userPausedAmbience = true;
      this.stopAmbience();
    } else {
      this.userPausedAmbience = false;
      if (this.ambiencePct === 0) this.ambiencePct = 15;
      if (this.ambienceActive) {
        this.startSceneAudio();
      } else {
        this.startAmbience();
      }
    }
    this.savePrefs();
    this.emit();
  }

  public setBalance(patch: {
    narratorPct?: number;
    ambiencePct?: number;
    spiritualPct?: number;
    sfxPct?: number;
    sfxEnabled?: boolean;
  }) {
    if (typeof patch.narratorPct === 'number') {
      this.narratorPct = Math.max(0, Math.min(100, Math.round(patch.narratorPct)));
    }
    if (typeof patch.ambiencePct === 'number') {
      this.ambiencePct = Math.max(0, Math.min(100, Math.round(patch.ambiencePct)));
      if (this.ambiencePct === 0 && this.ambienceAudio) {
        this.ambienceAudio.muted = true;
      }
    }
    if (typeof patch.spiritualPct === 'number') {
      this.spiritualPct = Math.max(0, Math.min(100, Math.round(patch.spiritualPct)));
    }
    if (typeof patch.sfxPct === 'number') {
      this.sfxPct = Math.max(0, Math.min(100, Math.round(patch.sfxPct)));
      if (this.sfxPct > 0 && !this.sfxEnabled) {
        this.sfxEnabled = true;
      }
    }
    if (typeof patch.sfxEnabled === 'boolean') {
      this.sfxEnabled = patch.sfxEnabled;
    }
    this.syncActiveVolumes();
    this.savePrefs();
    this.emit();
  }

  public applyPreset(preset: SoundPreset) {
    this.preset = preset;
    if (preset === 'voice_focus') {
      this.narratorPct = 100;
      this.ambiencePct = 0;
      this.spiritualPct = 75;
      this.sfxPct = 35;
      this.sfxEnabled = true;
      this.userPausedAmbience = true;
      this.stopAmbience();
    } else if (preset === 'calm_balanced') {
      this.narratorPct = 100;
      this.ambiencePct = 8;
      this.spiritualPct = 75;
      this.sfxPct = 45;
      this.sfxEnabled = true;
      this.backgroundMode = 'birds';
      this.userPausedAmbience = false;
      this.startAmbience();
    } else {
      this.narratorPct = 100;
      this.ambiencePct = 16;
      this.spiritualPct = 80;
      this.sfxPct = 55;
      this.sfxEnabled = true;
      this.backgroundMode = 'birds';
      this.userPausedAmbience = false;
      this.startAmbience();
    }
    this.syncActiveVolumes();
    this.savePrefs();
    this.emit();
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopAmbience();
      this.stopSpiritualAudio();
      this.sfxAudioPool.forEach((a) => {
        try {
          a.pause();
        } catch {
          // Ignore
        }
      });
      this.sfxAudioPool.clear();
    }
    this.onMuteChange?.(muted);
    this.syncActiveVolumes();
    this.emit();
  }

  public unlockAudio() {
    if (this.muted) return;
    const ctx = this.getContext(true);
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.ensureAutoAmbience();
  }

  public ensureAutoAmbience() {
    if (
      this.muted ||
      this.userPausedAmbience ||
      this.backgroundMode === 'off' ||
      this.ambiencePct <= 0
    ) {
      return;
    }
    if (!this.ambienceActive) {
      this.startAmbience();
    } else if (this.ambienceAudio && this.ambienceAudio.paused) {
      this.ambienceAudio.volume = this.getEffectiveAmbienceGain();
      this.ambienceAudio.play().catch(() => {});
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public isAmbiencePlaying(): boolean {
    return this.ambienceActive;
  }

  public getSceneLabel(): string {
    return this.backgroundMode === 'ocean'
      ? '🌊 ശാന്തമായ കടൽ'
      : SCENE_TRACKS[this.currentScene].label;
  }

  public setAmbienceDucked(ducked: boolean) {
    this.ducked = ducked;
    this.syncActiveVolumes();
  }

  public setAmbienceScene(scene: AmbienceScene) {
    if (this.currentScene === scene) return;
    this.currentScene = scene;
    if (this.ambienceActive && !this.muted) {
      this.startSceneAudio();
    }
    this.emit();
  }

  private getSelectedAmbienceUrl(): string {
    if (this.backgroundMode === 'ocean') {
      return './assets/audio/ocean_waves.mp3';
    }
    return SCENE_TRACKS[this.currentScene].primary;
  }

  private startSceneAudio() {
    if (typeof window === 'undefined' || this.muted || this.backgroundMode === 'off') return;
    const trackUrl = this.getSelectedAmbienceUrl();
    const normalizedTrack = trackUrl.replace(/^\.\//, '');

    if (this.ambienceAudio) {
      if (this.ambienceAudio.src.endsWith(normalizedTrack)) {
        this.ambienceAudio.volume = this.getEffectiveAmbienceGain();
        if (this.ambienceAudio.paused) {
          this.ambienceAudio.play().catch(() => {});
        }
        return;
      }
      this.ambienceAudio.pause();
      this.ambienceAudio = null;
    }

    const audio = new Audio(trackUrl);
    audio.loop = true;
    audio.volume = this.getEffectiveAmbienceGain();
    this.ambienceAudio = audio;
    audio.play().catch(() => {});
  }

  public startAmbience() {
    if (this.muted) return;
    if (this.backgroundMode === 'off') {
      this.backgroundMode = 'birds';
    }
    this.ambienceActive = true;
    this.startSceneAudio();

    if (this.secondaryTimer === null && typeof window !== 'undefined') {
      this.secondaryTimer = window.setInterval(() => {
        if (
          !this.ambienceActive ||
          this.muted ||
          this.ducked ||
          this.quranActive ||
          this.adhanActive ||
          !this.sfxEnabled
        ) {
          return;
        }
        if (this.backgroundMode === 'ocean') {
          this.playSeagull();
        }
      }, 24000);
    }
    this.emit();
  }

  public stopAmbience() {
    this.ambienceActive = false;
    if (this.secondaryTimer !== null) {
      window.clearInterval(this.secondaryTimer);
      this.secondaryTimer = null;
    }
    if (this.ambienceAudio) {
      try {
        this.ambienceAudio.pause();
        this.ambienceAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.ambienceAudio = null;
    }
    this.emit();
  }

  public toggleAmbience(): boolean {
    if (this.ambienceActive) {
      this.userPausedAmbience = true;
      this.stopAmbience();
      this.savePrefs();
      return false;
    }
    this.userPausedAmbience = false;
    if (this.ambiencePct === 0) this.ambiencePct = 15;
    this.startAmbience();
    this.savePrefs();
    return this.ambienceActive;
  }

  // ==================== QURAN RECITATION ====================
  public selectQuranTrack(trackId: QuranTrackId, autoPlay = true) {
    this.quranTrack = trackId;
    if (this.quranActive || autoPlay) {
      this.playQuran(trackId);
    } else {
      this.emit();
    }
  }

  public playQuran(trackId?: QuranTrackId) {
    if (typeof window === 'undefined') return;
    if (this.muted) {
      this.muted = false;
    }
    if (trackId) {
      this.quranTrack = trackId;
    }
    this.stopAdhan();
    this.onBeforeSpiritualPlay?.();

    const meta = QURAN_TRACKS.find((t) => t.id === this.quranTrack) || QURAN_TRACKS[0];
    if (this.quranAudio) {
      this.quranAudio.pause();
      this.quranAudio = null;
    }

    const audio = new Audio(meta.url);
    audio.loop = true;
    audio.volume = this.getEffectiveSpiritualGain();
    audio.onended = () => {
      if (this.quranAudio === audio) {
        this.quranActive = false;
        this.quranAudio = null;
        this.syncActiveVolumes();
        this.emit();
      }
    };
    audio.onerror = () => {
      if (this.quranAudio === audio) {
        this.quranActive = false;
        this.quranAudio = null;
        this.syncActiveVolumes();
        this.emit();
      }
    };

    this.quranAudio = audio;
    this.quranActive = true;
    this.syncActiveVolumes();
    this.emit();
    audio.play().catch(() => {
      this.quranActive = false;
      this.emit();
    });
  }

  public stopQuran() {
    this.quranActive = false;
    if (this.quranAudio) {
      try {
        this.quranAudio.pause();
        this.quranAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.quranAudio = null;
    }
    this.syncActiveVolumes();
    this.emit();
  }

  public toggleQuran(): boolean {
    if (this.quranActive) {
      this.stopQuran();
      return false;
    }
    this.playQuran();
    return true;
  }

  // ==================== ADHAN (CALL TO PRAYER) ====================
  public playAdhanFull() {
    if (typeof window === 'undefined') return;
    if (this.muted) {
      this.muted = false;
    }
    this.stopQuran();
    this.onBeforeSpiritualPlay?.();

    if (this.adhanAudio) {
      this.adhanAudio.pause();
      this.adhanAudio = null;
    }

    const audio = new Audio('./assets/audio/adhan_full.mp3');
    audio.loop = true;
    audio.volume = this.getEffectiveSpiritualGain();
    audio.onended = () => {
      if (this.adhanAudio === audio) {
        this.adhanActive = false;
        this.adhanAudio = null;
        this.syncActiveVolumes();
        this.emit();
      }
    };
    audio.onerror = () => {
      if (this.adhanAudio === audio) {
        this.adhanActive = false;
        this.adhanAudio = null;
        this.syncActiveVolumes();
        this.emit();
      }
    };

    this.adhanAudio = audio;
    this.adhanActive = true;
    this.syncActiveVolumes();
    this.emit();
    audio.play().catch(() => {
      this.adhanActive = false;
      this.emit();
    });
  }

  public stopAdhan() {
    this.adhanActive = false;
    if (this.adhanAudio) {
      try {
        this.adhanAudio.pause();
        this.adhanAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.adhanAudio = null;
    }
    this.syncActiveVolumes();
    this.emit();
  }

  public toggleAdhan(): boolean {
    if (this.adhanActive) {
      this.stopAdhan();
      return false;
    }
    this.playAdhanFull();
    return true;
  }

  public stopSpiritualAudio() {
    if (this.quranActive) this.stopQuran();
    if (this.adhanActive) this.stopAdhan();
  }

  // ==================== ENVIRONMENTAL SFX ====================
  private playRealSfx(url: string, weight = 0.85, durationLimitMs?: number) {
    const vol = this.getEffectiveSfxGain(weight);
    if (vol <= 0 || typeof window === 'undefined') return;
    try {
      const audio = new Audio(url);
      audio.volume = vol;
      this.sfxAudioPool.add(audio);
      audio.onended = () => {
        this.sfxAudioPool.delete(audio);
      };
      audio.onerror = () => {
        this.sfxAudioPool.delete(audio);
      };
      audio.play().catch(() => {
        this.sfxAudioPool.delete(audio);
      });
      if (durationLimitMs) {
        window.setTimeout(() => {
          try {
            audio.pause();
            this.sfxAudioPool.delete(audio);
          } catch {
            // Ignore
          }
        }, durationLimitMs);
      }
    } catch {
      // Ignore
    }
  }

  public playSeagull() {
    this.playRealSfx('./assets/audio/seagull_cry.mp3', 0.65);
  }

  public playShipCreak() {
    this.playRealSfx('./assets/audio/wooden_ship.mp3', 0.65, 2800);
  }

  public playOceanBreeze() {
    this.playRealSfx('./assets/audio/ocean_waves.mp3', 0.45, 3200);
  }

  public playBirdsChime() {
    this.playRealSfx('./assets/audio/birds_morning.mp3', 0.72, 3600);
  }

  public playWriting() {
    this.playRealSfx('./assets/audio/ink_writing.mp3', 0.8, 1800);
  }

  public playApplause() {
    this.playRealSfx('./assets/audio/crowd_applause.mp3', 0.7);
  }

  public playAdhan() {
    this.playRealSfx('./assets/audio/adhan_call.mp3', 0.75, 4200);
  }

  // ==================== TACTILE UI SOUND EFFECTS ====================
  private getToneGain(base: number): number {
    if (this.muted || !this.sfxEnabled || this.sfxPct <= 0) return 0;
    return base * Math.pow(this.sfxPct / 100, 1.5) * 1.15;
  }

  public playClick() {
    const ctx = this.getContext();
    const g = this.getToneGain(0.055);
    if (!ctx || g <= 0) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(g, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Ignore
    }
  }

  public playPop() {
    const ctx = this.getContext();
    const g = this.getToneGain(0.065);
    if (!ctx || g <= 0) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(g, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Ignore
    }
  }

  public playGlitter() {
    const ctx = this.getContext();
    const g = this.getToneGain(0.04);
    if (!ctx || g <= 0) return;
    try {
      const sparkles = [1046.5, 1318.5, 1567.98, 2093.0];
      sparkles.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.045;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(g, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.19);
      });
    } catch {
      // Ignore
    }
  }

  public playDrop() {
    const ctx = this.getContext();
    const g = this.getToneGain(0.06);
    if (!ctx || g <= 0) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(g, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.095);
    } catch {
      // Ignore
    }
  }

  public playSuccess(combo = 1) {
    const ctx = this.getContext();
    const g = this.getToneGain(0.065);
    if (!ctx || g <= 0) return;
    try {
      const shift = Math.min(combo - 1, 5) * 45;
      const notes = [523.25 + shift, 659.25 + shift, 783.99 + shift];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = ctx.currentTime + idx * 0.065;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(g, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.23);
      });
    } catch {
      // Ignore
    }
  }

  public playError() {
    const ctx = this.getContext();
    const g = this.getToneGain(0.055);
    if (!ctx || g <= 0) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(g, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.17);
    } catch {
      // Ignore
    }
  }

  public playHoist() {
    this.playApplause();
    const ctx = this.getContext();
    const g = this.getToneGain(0.065);
    if (!ctx || g <= 0) return;
    try {
      const notes = [392.0, 493.88, 587.33, 783.99, 987.77];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = ctx.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(g, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.29);
      });
    } catch {
      // Ignore
    }
  }

  public playUnlock() {
    this.playApplause();
    const ctx = this.getContext();
    const g = this.getToneGain(0.07);
    if (!ctx || g <= 0) return;
    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = ctx.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(g, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.36);
      });
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEngine();
