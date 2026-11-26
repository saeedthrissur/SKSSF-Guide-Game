import { sound } from './sound';
import {
  hashSpeechKey,
  normalizeSpeechKeyText,
  VOICE_GEMINI_MANIFEST,
} from '../data/voiceManifest';

export interface NarratorState {
  enabled: boolean;
  speaking: boolean;
  loading: boolean;
  awaitingUnlock: boolean;
  unavailableNotice: boolean;
  currentText: string;
}

type Listener = (state: NarratorState) => void;

interface CachedAudioBlob {
  blob: Blob;
  mimeType: string;
}

const IDB_NAME = 'skssf_gemini_charon_v3';
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
          resolve({ blob: val.blob, mimeType: val.mimeType || val.blob.type || 'audio/wav' });
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
  private unavailableNotice: boolean = false;

  constructor() {
    sound.registerNarratorHooks({
      onNarratorVolChange: (vol) => {
        if (this.currentAudio) {
          this.currentAudio.volume = vol;
          this.currentAudio.muted = vol <= 0.001;
        }
      },
      onAutoNarrateChange: (enabled) => {
        this.setEnabled(enabled);
      },
      onMuteChange: (isMuted) => {
        if (isMuted) {
          this.pendingSpeech = null;
          this.awaitingUnlock = false;
          this.stop();
        }
      },
    });
    this.attachGestureUnlocker();
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
      unavailableNotice: this.unavailableNotice,
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
    if (sound.isMuted()) {
      sound.setMuted(false);
    }
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
    this.speaking = false;
    this.loading = false;
    this.unavailableNotice = false;
    sound.setAmbienceDucked(false);
    this.emit();
  }

  public async speak(text: string, captionDisplay?: string) {
    const cleanText = normalizeSpeechKeyText(text);
    this.lastSpeechText = text;
    this.currentText = captionDisplay || text;
    this.unavailableNotice = false;
    this.emit();

    if (!this.enabled || sound.isMuted() || !cleanText) return;

    this.stop();
    const mySeq = this.requestSeq;
    this.lastSpeechText = text;
    this.currentText = captionDisplay || text;
    this.awaitingUnlock = false;
    this.unavailableNotice = false;
    this.loading = true;
    this.emit();

    const keyHash = hashSpeechKey(cleanText);

    // 1. In-memory or IndexedDB cache of verified Gemini Charon male Malayalam audio (0ms)
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

    // 2. Pre-generated static Gemini audio clip ONLY inside ./assets/voice-gemini/
    const staticGeminiUrl = VOICE_GEMINI_MANIFEST[keyHash];
    if (staticGeminiUrl) {
      const controller = new AbortController();
      this.abortController = controller;
      try {
        const res = await fetch(staticGeminiUrl, { signal: controller.signal });
        if (mySeq !== this.requestSeq || controller.signal.aborted) return;
        const ct = res.headers.get('content-type') || '';
        if (res.ok && !ct.includes('text/html')) {
          const blob = await res.blob();
          if (mySeq !== this.requestSeq || controller.signal.aborted) return;
          if (blob.size > 500) {
            const entry: CachedAudioBlob = {
              blob,
              mimeType: blob.type || 'audio/mpeg',
            };
            this.storeInMemory(keyHash, entry);
            void writeIdbClip(keyHash, entry);
            await this.playBlob(entry, cleanText, captionDisplay, mySeq);
            return;
          }
        }
      } catch (err) {
        if ((err as Error)?.name === 'AbortError' || mySeq !== this.requestSeq) return;
      }
    }

    // 3. Live Google Gemini TTS Male ('Charon') via server /api/tts
    if (!this.serverTtsUnavailable) {
      const controller = new AbortController();
      this.abortController = controller;
      this.loading = true;
      this.speaking = false;
      sound.setAmbienceDucked(true);
      this.emit();

      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, 8500);

      try {
        const res = await fetch('./api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText }),
          signal: controller.signal,
        });
        window.clearTimeout(timeoutId);

        if (mySeq !== this.requestSeq || controller.signal.aborted) {
          this.finishSilentOnFailure(mySeq);
          return;
        }

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = (await res.json()) as {
            audioBase64?: string;
            mimeType?: string;
            provider?: string;
          };
          if (mySeq !== this.requestSeq || controller.signal.aborted) {
            this.finishSilentOnFailure(mySeq);
            return;
          }

          if (data.audioBase64) {
            const mimeType = data.mimeType || 'audio/wav';
            const blob = base64ToBlob(data.audioBase64, mimeType);
            const entry: CachedAudioBlob = { blob, mimeType };

            this.storeInMemory(keyHash, entry);
            void writeIdbClip(keyHash, entry);

            await this.playBlob(entry, cleanText, captionDisplay, mySeq);
            return;
          }
        } else if (res.status === 404 || res.status === 405 || contentType.includes('text/html')) {
          // Static host without /api/tts backend — fail silently (never use browser/robotic voice)
          this.serverTtsUnavailable = true;
        }
      } catch (err) {
        window.clearTimeout(timeoutId);
        if (mySeq !== this.requestSeq) return;
        if ((err as Error)?.name === 'AbortError') {
          this.finishSilentOnFailure(mySeq);
          return;
        }
      }
    }

    // 4. Fail silently immediately — NEVER fall back to browser/female/robotic speechSynthesis
    this.finishSilentOnFailure(mySeq, this.serverTtsUnavailable);
  }

  private storeInMemory(keyHash: string, entry: CachedAudioBlob) {
    if (this.clientCache.size > 120) {
      const firstKey = this.clientCache.keys().next().value;
      if (firstKey) this.clientCache.delete(firstKey);
    }
    this.clientCache.set(keyHash, entry);
  }

  private finishSilentOnFailure(seq: number, markUnavailable = false) {
    if (seq !== this.requestSeq) return;
    this.speaking = false;
    this.loading = false;
    this.unavailableNotice = markUnavailable;
    sound.setAmbienceDucked(false);
    this.emit();
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
