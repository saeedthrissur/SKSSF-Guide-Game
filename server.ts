import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { config as loadDotenv } from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { createServer as createViteServer } from 'vite';

loadDotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const CACHE_DIR = path.resolve(__dirname, '.tts-cache');

try {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
} catch {
  // Ignore if filesystem cache dir cannot be created
}

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      apiVersion: 'v1beta',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

interface CachedAudio {
  audioBase64: string;
  mimeType: string;
  provider: 'gemini-charon' | 'edge-midhun-male';
}

// Bounded in-memory + disk cache so repeated phrases play instantaneously with 0 latency
const ttsCache = new Map<string, CachedAudio>();
const inFlightTts = new Map<string, Promise<CachedAudio | null>>();
const MAX_CACHE_ENTRIES = 300;

// Cooldown circuit-breakers if Gemini TTS models hit temporary RPM/RPD limits
const modelCooldownUntil: Record<string, number> = {};

function makeCacheKey(text: string): string {
  return crypto.createHash('sha256').update(`v4_midhun_male:${text}`).digest('hex').slice(0, 24);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeMalayalamSpeechText(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+/g, '')
    .replace(/[()·→✓✦⚠️✅🔄📖⛵🔥🎙️🔊🔇🏆✨🎪🎒📱🗺️🌱🌿⚛️📐♾️🕌📜]+/g, ' ')
    .replace(/(\d+)\s*\+/g, '$1-ലധികം ')
    .replace(/&/g, ' ഉം ')
    .replace(/[—:;]+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 650);
}

function readDiskCache(key: string): CachedAudio | null {
  try {
    const file = path.join(CACHE_DIR, `${key}.json`);
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw) as CachedAudio;
    // Only reuse strictly verified native male Malayalam TTS entries
    if (parsed?.audioBase64 && parsed?.mimeType && parsed.provider === 'edge-midhun-male') {
      return parsed;
    }
  } catch {
    // Ignore corrupt disk cache entry
  }
  return null;
}

function writeDiskCache(key: string, entry: CachedAudio): void {
  if (entry.provider !== 'edge-midhun-male') return;
  try {
    const file = path.join(CACHE_DIR, `${key}.json`);
    fs.writeFileSync(file, JSON.stringify(entry));
  } catch {
    // Ignore disk cache write errors
  }
}

type GeminiTtsModel =
  | 'gemini-3.8-flash-lite-tts'
  | 'gemini-3.8-flash-tts'
  | 'gemini-2.5-flash-preview-tts'
  | 'gemini-2.5-pro-preview-tts';

async function callGeminiTtsModel(
  modelName: GeminiTtsModel,
  cleanText: string
): Promise<CachedAudio | null> {
  if (!ai) return null;
  const now = Date.now();
  if (now < (modelCooldownUntil[modelName] || 0)) return null;

  try {
    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: 'Warm, friendly, clear native Malayalam male storyteller speaking naturally to children and students',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              // Strictly Male Voice ('Charon')
              prebuiltVoiceConfig: { voiceName: 'Charon' },
            },
          },
        },
      });
    } catch (innerErr) {
      const msg = innerErr instanceof Error ? innerErr.message : '';
      if (
        msg.includes('Unknown name') ||
        msg.includes('speechConfig') ||
        msg.includes('speechMetadata') ||
        msg.includes('INVALID_ARGUMENT') ||
        msg.includes('400')
      ) {
        response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [{ text: cleanText }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Charon' },
              },
            },
          },
        });
      } else {
        throw innerErr;
      }
    }

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const inlineMime = part?.inlineData?.mimeType || 'audio/wav';

    if (!base64Audio) return null;

    let finalBase64 = base64Audio;
    let finalMime = inlineMime;
    const rawBuf = Buffer.from(base64Audio, 'base64');
    const isAlreadyWav =
      rawBuf.length >= 12 &&
      rawBuf.toString('ascii', 0, 4) === 'RIFF' &&
      rawBuf.toString('ascii', 8, 12) === 'WAVE';
    if (!isAlreadyWav && (inlineMime.toLowerCase().includes('l16') || inlineMime.toLowerCase().includes('pcm'))) {
      const rateMatch = inlineMime.match(/rate=(\d+)/i);
      const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
      const header = Buffer.alloc(44);
      header.write('RIFF', 0);
      header.writeUInt32LE(36 + rawBuf.length, 4);
      header.write('WAVE', 8);
      header.write('fmt ', 12);
      header.writeUInt32LE(16, 16);
      header.writeUInt16LE(1, 20); // PCM
      header.writeUInt16LE(1, 22); // Mono
      header.writeUInt32LE(sampleRate, 24);
      header.writeUInt32LE(sampleRate * 2, 28);
      header.writeUInt16LE(2, 32);
      header.writeUInt16LE(16, 34);
      header.write('data', 36);
      header.writeUInt32LE(rawBuf.length, 40);
      finalBase64 = Buffer.concat([header, rawBuf]).toString('base64');
      finalMime = 'audio/wav';
    } else if (isAlreadyWav) {
      finalMime = 'audio/wav';
    }

    return {
      audioBase64: finalBase64,
      mimeType: finalMime,
      provider: 'gemini-charon',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const quotaMatch = msg.match(/quotaId["']?:\s*["']?([^"',}\s]+)/i);
    const retryMatch = msg.match(/retryDelay["']?:\s*["']?([^"',}\s]+)/i);
    const quotaId = quotaMatch?.[1] || 'none';
    console.warn(`[TTS Gemini ${modelName}]`, `quota=${quotaId} retry=${retryMatch?.[1] || 'none'}`);
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      const isDaily = /PerDay|daily/i.test(quotaId) || /PerDay/i.test(msg);
      const retrySecs = retryMatch?.[1] ? parseInt(retryMatch[1], 10) : 0;
      const cooldownMs = isDaily
        ? 10 * 60 * 1000
        : Math.max(22, Math.min(65, retrySecs || 25)) * 1000;
      modelCooldownUntil[modelName] = Date.now() + cooldownMs;
    } else if (msg.includes('403') || msg.includes('API_KEY_INVALID') || msg.includes('404')) {
      modelCooldownUntil[modelName] = Date.now() + 10 * 60 * 1000;
    }
    return null;
  }
}

async function generateWithGeminiMale(cleanText: string): Promise<CachedAudio | null> {
  const models: GeminiTtsModel[] = [
    'gemini-3.8-flash-lite-tts',
    'gemini-3.8-flash-tts',
    'gemini-2.5-flash-preview-tts',
    'gemini-2.5-pro-preview-tts',
  ];
  for (const model of models) {
    const res = await callGeminiTtsModel(model, cleanText);
    if (res) return res;
  }
  return null;
}

async function synthesizeEdgeMalayalamMaleOnce(cleanText: string): Promise<CachedAudio> {
  const tts = new MsEdgeTTS({
    connectionTimeoutMs: 9000,
    synthesisTimeoutMs: 25000,
  });

  try {
    // Strictly Native Malayalam MALE Neural Voice (ml-IN-MidhunNeural)
    await tts.setMetadata(
      'ml-IN-MidhunNeural',
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
    );

    const safeInput = escapeXml(cleanText);
    const { audioStream } = tts.toStream(safeInput);

    const audioBase64 = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      audioStream.on('data', (chunk: Buffer | Uint8Array) => {
        chunks.push(Buffer.from(chunk));
      });
      audioStream.on('error', (streamErr: unknown) => {
        reject(streamErr);
      });
      audioStream.on('close', () => {
        const merged = Buffer.concat(chunks);
        if (merged.length === 0) {
          reject(new Error('Empty audio stream from MidhunNeural'));
          return;
        }
        resolve(merged.toString('base64'));
      });
    });

    return {
      audioBase64,
      mimeType: 'audio/mpeg',
      provider: 'edge-midhun-male',
    };
  } finally {
    try {
      tts.close();
    } catch {
      // Ignore close cleanup errors
    }
  }
}

async function generateWithEdgeMalayalamMale(cleanText: string): Promise<CachedAudio | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await synthesizeEdgeMalayalamMaleOnce(cleanText);
    } catch {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  }
  return null;
}

async function resolveMalayalamMaleTts(cleanText: string): Promise<CachedAudio | null> {
  const key = makeCacheKey(cleanText);

  const memHit = ttsCache.get(key);
  if (memHit) return memHit;

  const diskHit = readDiskCache(key);
  if (diskHit) {
    ttsCache.set(key, diskHit);
    return diskHit;
  }

  const pending = inFlightTts.get(key);
  if (pending) return pending;

  const task = (async () => {
    try {
      // 1) Primary: Strictly Native Malayalam MALE Neural ('ml-IN-MidhunNeural') — 100% consistent male voice
      let result = await generateWithEdgeMalayalamMale(cleanText);

      // 2) Secondary Fallback ONLY if Edge TTS fails: Gemini AI Male ('Charon')
      if (!result) {
        result = await generateWithGeminiMale(cleanText);
      }

      if (result) {
        if (ttsCache.size >= MAX_CACHE_ENTRIES) {
          const oldestKey = ttsCache.keys().next().value;
          if (oldestKey) ttsCache.delete(oldestKey);
        }
        ttsCache.set(key, result);
        if (result.provider === 'edge-midhun-male') {
          writeDiskCache(key, result);
        }
      }

      return result;
    } finally {
      inFlightTts.delete(key);
    }
  })();

  inFlightTts.set(key, task);
  return task;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  // Server-side Strictly Male Malayalam TTS (Gemini Charon + Native Malayalam MidhunNeural)
  app.post('/api/tts', async (req, res) => {
    const rawText = typeof req.body?.text === 'string' ? req.body.text : '';
    const cleanText = normalizeMalayalamSpeechText(rawText);
    if (!cleanText) {
      res.status(400).json({ error: 'Malayalam text is required' });
      return;
    }

    try {
      const audio = await resolveMalayalamMaleTts(cleanText);
      if (!audio) {
        res.status(502).json({
          fallback: true,
          error: 'Unable to synthesize Malayalam speech at the moment',
        });
        return;
      }

      res.setHeader('X-TTS-Provider', audio.provider);
      res.json({
        audioBase64: audio.audioBase64,
        mimeType: audio.mimeType,
        provider: audio.provider,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'TTS generation failed';
      res.status(502).json({
        fallback: true,
        error: message,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    app.use('/assets', express.static(path.resolve(__dirname, 'public', 'assets')));
    process.env.DISABLE_HMR = 'true';
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'spa',
    });

    // Suppress Vite HMR WebSocket auto-connect in preview iframe when HMR is disabled
    app.get('/@vite/client', (req, res, next) => {
      delete req.headers['accept-encoding'];
      const chunks: Buffer[] = [];
      const origWrite = res.write.bind(res);
      const origEnd = res.end.bind(res);

      const toBuf = (c: unknown): Buffer | null => {
        if (typeof c === 'string') return Buffer.from(c, 'utf8');
        if (Buffer.isBuffer(c)) return c;
        if (c instanceof Uint8Array) return Buffer.from(c);
        return null;
      };

      res.write = ((chunk: unknown) => {
        const b = toBuf(chunk);
        if (b) chunks.push(b);
        return true;
      }) as typeof res.write;

      res.end = ((chunk?: unknown) => {
        const b = toBuf(chunk);
        if (b) chunks.push(b);
        let body = Buffer.concat(chunks).toString('utf8');
        body = body.replace(
          'transport.connect(createHMRHandler(handleMessage));',
          '/* HMR WebSocket disabled */'
        );
        const out = Buffer.from(body, 'utf8');
        res.removeHeader('content-length');
        res.setHeader('Content-Length', String(out.length));
        res.write = origWrite;
        res.end = origEnd;
        return origEnd(out);
      }) as typeof res.end;

      next();
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
