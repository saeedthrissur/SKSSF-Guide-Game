import { sound } from './sound';
import {
  hashSpeechKey,
  normalizeSpeechKeyText,
} from '../data/voiceManifest';

export interface NarratorState {
  enabled: boolean;
  speaking: boolean;
  loading: boolean;
  awaitingUnlock: boolean;
  currentText: string;
}

type Listener = (state: NarratorState) => void;

interface CachedAudioBlob {
  blob: Blob;
  mimeType: string;
}

const IDB_NAME = 'mission_samastha_midhun_male_v2';
const IDB_STORE = 'audio_clips';

function openVoiceDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readIdbClip(keyHash: string): Promise<CachedAudioBlob | null> {
  try {
    const db = await openVoiceDb();
    if (!db) return null;
    return await new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(keyHash);
      req.onsuccess = () => {
        const val = req.result as { blob?: Blob; mimeType?: string } | undefined;
        if (val?.blob instanceof Blob && val.blob.size > 500) {
          resolve({ blob: val.blob, mimeType: val.mimeType || val.blob.type || 'audio/mpeg' });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function writeIdbClip(keyHash: string, entry: CachedAudioBlob): Promise<void> {
  try {
    const db = await openVoiceDb();
    if (!db) return;
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put({ blob: entry.blob, mimeType: entry.mimeType }, keyHash);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore storage quota errors
  }
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

class MaleStoryNarrator {
  private enabled: boolean = true;
  private speaking: boolean = false;
  private loading: boolean = false;
  private awaitingUnlock: boolean = false;
  private currentText: string =
    'ഹലോ കൂട്ടുകാരേ! SKSSF ഗൈഡ് ഗെയിമിലേക്ക് സ്വാഗതം! നമ്മൾ ആരാണ്, നമ്മുടെ ദൗത്യങ്ങൾ എന്ത് എന്ന് കളിച്ചു പഠിക്കാം!';
  private lastSpeechText: string =
    'ഹലോ കൂട്ടുകാരേ! SKSSF ഗൈഡ് ഗെയിമിലേക്ക് സ്വാഗതം! നമ്മൾ ആരാണ്, നമ്മുടെ ദൗത്യങ്ങൾ എന്ത് എന്ന് കളിച്ചു പഠിക്കാം!';
  private currentAudio: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private abortController: AbortController | null = null;
  private clientCache = new Map<string, CachedAudioBlob>();
  private listeners = new Set<Listener>();
  private requestSeq: number = 0;
  private pendingSpeech: { text: string; caption?: string } | null = null;
  private gestureListenerAttached: boolean = false;
  private serverTtsUnavailable: boolean = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    sound.registerNarratorHooks({
      // Do NOT stop narrator when background Quran/Adhan starts — they coexist cleanly with soft ducking
      onNarratorVolChange: (vol) => {
        if (this.currentAudio) {
          this.currentAudio.volume = vol;
          this.currentAudio.muted = vol <= 0.001;
        }
      },
      onAutoNarrateChange: (enabled) => {
        this.setEnabled(enabled);
      },
    });
    this.attachGestureUnlocker();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
      } catch {
        // Ignore
      }
    }
  }

  private attachGestureUnlocker() {
    if (typeof window === 'undefined' || this.gestureListenerAttached) return;
    this.gestureListenerAttached = true;

    const handleGesture = () => {
      sound.unlockAudio();
      if (this.pendingSpeech && this.enabled && !sound.isMuted()) {
        const queued = this.pendingSpeech;
        this.pendingSpeech = null;
        this.awaitingUnlock = false;
        this.emit();
        void this.speak(queued.text, queued.caption);
      }
    };

    window.addEventListener('pointerdown', handleGesture, true);
    window.addEventListener('keydown', handleGesture, true);
  }

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.getState());
    return () => {
      this.listeners.delete(fn);
    };
  }

  public getState(): NarratorState {
    return {
      enabled: this.enabled,
      speaking: this.speaking,
      loading: this.loading,
      awaitingUnlock: this.awaitingUnlock,
      currentText: this.currentText,
    };
  }

  private emit() {
    const snap = this.getState();
    this.listeners.forEach((fn) => fn(snap));
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.pendingSpeech = null;
      this.awaitingUnlock = false;
      this.stop();
    } else {
      this.emit();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public replayLast() {
    this.setEnabled(true);
    void this.speak(this.lastSpeechText || this.currentText, this.currentText);
  }

  public stop() {
    this.requestSeq += 1;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
    this.activeUtterance = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore speechSynthesis cancel errors
      }
    }
    this.speaking = false;
    this.loading = false;
    sound.setAmbienceDucked(false);
    this.emit();
  }

  public async speak(text: string, captionDisplay?: string) {
    const cleanText = normalizeSpeechKeyText(text);
    this.lastSpeechText = text;
    this.currentText = captionDisplay || text;
    this.emit();

    if (!this.enabled || sound.isMuted() || !cleanText) return;

    // Keep background Quran/Adhan gently ducked instead of stopping it!
    this.stop();
    const mySeq = this.requestSeq;
    this.lastSpeechText = text;
    this.currentText = captionDisplay || text;
    this.awaitingUnlock = false;
    this.loading = true;
    this.emit();

    const keyHash = hashSpeechKey(cleanText);

    // 1. In-memory or IndexedDB cache of verified strictly-male Malayalam TTS (0ms)
    const memCached = this.clientCache.get(keyHash);
    if (memCached) {
      await this.playBlob(memCached, cleanText, captionDisplay, mySeq);
      return;
    }

    const idbCached = await readIdbClip(keyHash);
    if (mySeq !== this.requestSeq) return;
    if (idbCached) {
      this.storeInMemory(keyHash, idbCached);
      await this.playBlob(idbCached, cleanText, captionDisplay, mySeq);
      return;
    }

    // 2. Live strictly-male native Malayalam TTS via server /api/tts (ml-IN-MidhunNeural)
    if (!this.serverTtsUnavailable) {
      const controller = new AbortController();
      this.abortController = controller;
      this.loading = true;
      this.speaking = false;
      sound.setAmbienceDucked(true);
      this.emit();

      try {
        const res = await fetch('./api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText }),
          signal: controller.signal,
        });

        if (mySeq !== this.requestSeq || controller.signal.aborted) return;

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = (await res.json()) as {
            audioBase64?: string;
            mimeType?: string;
            provider?: string;
          };
          if (mySeq !== this.requestSeq || controller.signal.aborted) return;

          if (data.audioBase64) {
            const mimeType = data.mimeType || 'audio/mpeg';
            const blob = base64ToBlob(data.audioBase64, mimeType);
            const entry: CachedAudioBlob = { blob, mimeType };

            this.storeInMemory(keyHash, entry);
            void writeIdbClip(keyHash, entry);

            await this.playBlob(entry, cleanText, captionDisplay, mySeq);
            return;
          }
        } else if (res.status === 404 || res.status === 405 || contentType.includes('text/html')) {
          // Static host (e.g., GitHub Pages) has no /api/tts backend — switch smoothly to Google/Browser TTS
          this.serverTtsUnavailable = true;
        }
      } catch (err) {
        if ((err as Error)?.name === 'AbortError' || mySeq !== this.requestSeq) return;
      }
    }

    if (mySeq !== this.requestSeq) return;

    // 3. Static-host / GitHub Pages fallback: Google / Browser SpeechSynthesis Malayalam TTS
    const spokeViaGoogleTts = this.speakWithBrowserGoogleTts(cleanText, mySeq);
    if (!spokeViaGoogleTts) {
      this.finishSilentOnFailure(mySeq);
    }
  }

  private storeInMemory(keyHash: string, entry: CachedAudioBlob) {
    if (this.clientCache.size > 120) {
      const firstKey = this.clientCache.keys().next().value;
      if (firstKey) this.clientCache.delete(firstKey);
    }
    this.clientCache.set(keyHash, entry);
  }

  private finishSilentOnFailure(seq: number) {
    if (seq !== this.requestSeq) return;
    this.speaking = false;
    this.loading = false;
    sound.setAmbienceDucked(false);
    this.emit();
  }

  private pickBestMalayalamVoice(): { voice: SpeechSynthesisVoice | null; isExplicitMale: boolean } {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { voice: null, isExplicitMale: false };
    }
    const voices = window.speechSynthesis.getVoices() || [];
    const mlVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('ml'));
    if (mlVoices.length === 0) return { voice: null, isExplicitMale: false };

    // Prefer explicitly male Malayalam voices (e.g., Google Android ml-in-x-mlm / Midhun / Male)
    const maleVoice = mlVoices.find((v) =>
      /(midhun|male|man|mlm|ml-in-x-mlm)/i.test(`${v.name} ${v.voiceURI}`)
    );
    if (maleVoice) return { voice: maleVoice, isExplicitMale: true };

    // Next prefer Google Malayalam TTS voice
    const googleMl = mlVoices.find((v) => /google/i.test(`${v.name} ${v.voiceURI}`));
    if (googleMl) return { voice: googleMl, isExplicitMale: false };

    return { voice: mlVoices[0], isExplicitMale: false };
  }

  private splitSpeechChunks(text: string): string[] {
    const parts = text
      .split(/(?<=[.!?।,\n])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const chunks: string[] = [];
    let buf = '';
    for (const part of parts) {
      if ((buf + ' ' + part).trim().length <= 165) {
        buf = (buf ? `${buf} ` : '') + part;
      } else {
        if (buf) chunks.push(buf);
        buf = part.slice(0, 180);
      }
    }
    if (buf) chunks.push(buf);
    return chunks.length > 0 ? chunks : [text.slice(0, 180)];
  }

  private speakWithBrowserGoogleTts(cleanText: string, seq: number): boolean {
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      return false;
    }

    try {
      const synth = window.speechSynthesis;
      synth.cancel();

      const chunks = this.splitSpeechChunks(cleanText);
      const { voice, isExplicitMale } = this.pickBestMalayalamVoice();
      const gain = sound.getNarratorGain();

      let idx = 0;
      const speakNextChunk = () => {
        if (seq !== this.requestSeq) return;
        if (idx >= chunks.length) {
          this.activeUtterance = null;
          this.speaking = false;
          this.loading = false;
          sound.setAmbienceDucked(false);
          this.emit();
          return;
        }

        const utter = new SpeechSynthesisUtterance(chunks[idx]);
        utter.lang = voice?.lang || 'ml-IN';
        if (voice) utter.voice = voice;
        utter.rate = 0.96;
        utter.pitch = isExplicitMale ? 1.0 : 0.88;
        utter.volume = Math.max(0, Math.min(1, gain));
        this.activeUtterance = utter;

        utter.onstart = () => {
          if (seq !== this.requestSeq) return;
          this.loading = false;
          this.speaking = true;
          sound.setAmbienceDucked(true);
          this.emit();
        };

        utter.onend = () => {
          if (seq !== this.requestSeq) return;
          idx += 1;
          speakNextChunk();
        };

        utter.onerror = () => {
          if (seq !== this.requestSeq) return;
          this.activeUtterance = null;
          this.finishSilentOnFailure(seq);
        };

        synth.speak(utter);
      };

      this.loading = false;
      this.speaking = true;
      sound.setAmbienceDucked(true);
      this.emit();
      speakNextChunk();
      return true;
    } catch {
      return false;
    }
  }

  private async playBlob(
    entry: CachedAudioBlob,
    rawCleanText: string,
    captionDisplay: string | undefined,
    seq: number
  ) {
    if (seq !== this.requestSeq) return;
    try {
      if (this.currentObjectUrl) {
        URL.revokeObjectURL(this.currentObjectUrl);
        this.currentObjectUrl = null;
      }
      const objectUrl = URL.createObjectURL(entry.blob);
      this.currentObjectUrl = objectUrl;

      const audio = new Audio(objectUrl);
      const gain = sound.getNarratorGain();
      audio.volume = gain;
      audio.muted = gain <= 0.001;
      this.currentAudio = audio;
      this.loading = true;
      this.speaking = false;
      this.awaitingUnlock = false;
      sound.setAmbienceDucked(true);
      this.emit();

      audio.onplaying = () => {
        if (seq !== this.requestSeq) return;
        this.loading = false;
        this.speaking = true;
        this.emit();
      };
      audio.onended = () => {
        if (seq !== this.requestSeq) return;
        this.speaking = false;
        this.loading = false;
        sound.setAmbienceDucked(false);
        this.currentAudio = null;
        if (this.currentObjectUrl === objectUrl) {
          URL.revokeObjectURL(objectUrl);
          this.currentObjectUrl = null;
        }
        this.emit();
      };
      audio.onerror = () => {
        if (seq !== this.requestSeq) return;
        this.speaking = false;
        this.loading = false;
        sound.setAmbienceDucked(false);
        this.currentAudio = null;
        if (this.currentObjectUrl === objectUrl) {
          URL.revokeObjectURL(objectUrl);
          this.currentObjectUrl = null;
        }
        this.finishSilentOnFailure(seq);
      };

      await audio.play();
      if (seq === this.requestSeq) {
        this.loading = false;
        this.speaking = true;
        this.emit();
      }
    } catch (playErr) {
      if (seq !== this.requestSeq) return;
      const errName = (playErr as Error)?.name || '';
      this.speaking = false;
      this.loading = false;
      sound.setAmbienceDucked(false);
      this.currentAudio = null;
      if (this.currentObjectUrl) {
        URL.revokeObjectURL(this.currentObjectUrl);
        this.currentObjectUrl = null;
      }

      if (errName === 'NotAllowedError') {
        this.pendingSpeech = { text: rawCleanText, caption: captionDisplay };
        this.awaitingUnlock = true;
        this.emit();
      } else {
        this.finishSilentOnFailure(seq);
      }
    }
  }

  public async clearVoiceCache(): Promise<void> {
    this.stop();
    this.clientCache.clear();
    if (typeof indexedDB === 'undefined') return;
    try {
      const db = await openVoiceDb();
      if (db) {
        await new Promise<void>((resolve) => {
          const tx = db.transaction(IDB_STORE, 'readwrite');
          tx.objectStore(IDB_STORE).clear();
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
        db.close();
      }
      await new Promise<void>((resolve) => {
        const del = indexedDB.deleteDatabase(IDB_NAME);
        del.onsuccess = () => resolve();
        del.onerror = () => resolve();
        del.onblocked = () => resolve();
      });
    } catch {
      // Ignore IndexedDB errors
    }
  }
}

export const narrator = new MaleStoryNarrator();
