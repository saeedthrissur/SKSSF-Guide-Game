export function normalizeSpeechKeyText(text: string): string {
  return text
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

// Deterministic FNV-1a 64-bit hex hash (matches both browser and Node generator cleanly)
export function hashSpeechKey(cleanText: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < cleanText.length; i++) {
    const ch = cleanText.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `v_${p1}${p2}`;
}

// Pre-generated Google Gemini TTS clips ONLY (natural Malayalam male voice 'Charon', stored in ./assets/voice-gemini/)
export const VOICE_GEMINI_MANIFEST: Record<string, string> = {
  v_054b836dc7a8e808: './assets/voice-gemini/v_054b836dc7a8e808.mp3',
  v_05ca031a4c8e4777: './assets/voice-gemini/v_05ca031a4c8e4777.mp3',
  v_06b06f20963a57c9: './assets/voice-gemini/v_06b06f20963a57c9.mp3',
  v_08478edd3cdf3783: './assets/voice-gemini/v_08478edd3cdf3783.mp3',
  v_091389a0573e535a: './assets/voice-gemini/v_091389a0573e535a.mp3',
  v_09ef905303ef14b4: './assets/voice-gemini/v_09ef905303ef14b4.mp3',
  v_0aa14a41576a0f76: './assets/voice-gemini/v_0aa14a41576a0f76.mp3',
  v_13e91a75988d1b49: './assets/voice-gemini/v_13e91a75988d1b49.mp3',
  v_16362da6503b48e4: './assets/voice-gemini/v_16362da6503b48e4.mp3',
  v_1a83d0dce554fbd4: './assets/voice-gemini/v_1a83d0dce554fbd4.mp3',
  v_23bfc01b4a0ff6aa: './assets/voice-gemini/v_23bfc01b4a0ff6aa.mp3',
  v_2562b228146dd5f8: './assets/voice-gemini/v_2562b228146dd5f8.mp3',
  v_2899d43fc39886ac: './assets/voice-gemini/v_2899d43fc39886ac.mp3',
  v_2a8cbb7665f49677: './assets/voice-gemini/v_2a8cbb7665f49677.mp3',
  v_2b4ade02750bfcd7: './assets/voice-gemini/v_2b4ade02750bfcd7.mp3',
  v_30e3080af6478e94: './assets/voice-gemini/v_30e3080af6478e94.mp3',
  v_3134da19117d27a0: './assets/voice-gemini/v_3134da19117d27a0.mp3',
  v_32a08ca14b9c50fb: './assets/voice-gemini/v_32a08ca14b9c50fb.mp3',
  v_472fce1796fa467e: './assets/voice-gemini/v_472fce1796fa467e.mp3',
  v_53c38c52891f8b2a: './assets/voice-gemini/v_53c38c52891f8b2a.mp3',
  v_5f174e73770fa813: './assets/voice-gemini/v_5f174e73770fa813.mp3',
  v_60c08c79ff0b3458: './assets/voice-gemini/v_60c08c79ff0b3458.mp3',
  v_78d3146d6e1efd0b: './assets/voice-gemini/v_78d3146d6e1efd0b.mp3',
  v_79ad475a365471dd: './assets/voice-gemini/v_79ad475a365471dd.mp3',
  v_7feea7bbc6d30463: './assets/voice-gemini/v_7feea7bbc6d30463.mp3',
  v_8050d2e5ba1abb2a: './assets/voice-gemini/v_8050d2e5ba1abb2a.mp3',
  v_880c47aa19695d0b: './assets/voice-gemini/v_880c47aa19695d0b.mp3',
  v_927b0b6d74a78b4e: './assets/voice-gemini/v_927b0b6d74a78b4e.mp3',
  v_94d35ad78c4eded2: './assets/voice-gemini/v_94d35ad78c4eded2.mp3',
  v_95253eeae6b8b3ea: './assets/voice-gemini/v_95253eeae6b8b3ea.mp3',
  v_96123f654d761df1: './assets/voice-gemini/v_96123f654d761df1.mp3',
  v_a618bc3c36d69f6c: './assets/voice-gemini/v_a618bc3c36d69f6c.mp3',
  v_a6bafd29fcb45907: './assets/voice-gemini/v_a6bafd29fcb45907.mp3',
  v_a7b263cb00f6da16: './assets/voice-gemini/v_a7b263cb00f6da16.mp3',
  v_ad0effef8a74a103: './assets/voice-gemini/v_ad0effef8a74a103.mp3',
  v_b454a02ff628f2e5: './assets/voice-gemini/v_b454a02ff628f2e5.mp3',
  v_b7a720480c4ffbb7: './assets/voice-gemini/v_b7a720480c4ffbb7.mp3',
  v_b94865d526c35660: './assets/voice-gemini/v_b94865d526c35660.mp3',
  v_bb2774b303328576: './assets/voice-gemini/v_bb2774b303328576.mp3',
  v_bdb97eff5c9f62c6: './assets/voice-gemini/v_bdb97eff5c9f62c6.mp3',
  v_c104ea5693ba9913: './assets/voice-gemini/v_c104ea5693ba9913.mp3',
  v_c4cdd5c1c91e5031: './assets/voice-gemini/v_c4cdd5c1c91e5031.mp3',
  v_ce75143dd478c0e8: './assets/voice-gemini/v_ce75143dd478c0e8.mp3',
  v_d3dac257465633c9: './assets/voice-gemini/v_d3dac257465633c9.mp3',
  v_d710d83d335922b5: './assets/voice-gemini/v_d710d83d335922b5.mp3',
  v_d829d51eae4f4e4a: './assets/voice-gemini/v_d829d51eae4f4e4a.mp3',
  v_dae2b698b02a3ab8: './assets/voice-gemini/v_dae2b698b02a3ab8.mp3',
  v_e5f98a2e408081fa: './assets/voice-gemini/v_e5f98a2e408081fa.mp3',
  v_f1e9ba0d6995e26d: './assets/voice-gemini/v_f1e9ba0d6995e26d.mp3',
  v_f2a336445a7c88b6: './assets/voice-gemini/v_f2a336445a7c88b6.mp3',
  v_f60a9b37a567eaf6: './assets/voice-gemini/v_f60a9b37a567eaf6.mp3',
};
