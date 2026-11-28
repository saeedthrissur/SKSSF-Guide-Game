/**
 * Shared text sanitization & anti-bullying / child-safety utilities for player profile fields,
 * @handles, certificates, photo badges, 2-player duel nicknames, greeting cards, and share links.
 * Prevents URL/spam injection, profanity/harassment/mockery, control characters, and layout breaking.
 */

const URL_PATTERN =
  /(?:https?:\/\/|www\.|wa\.me\/|t\.me\/|bit\.ly\/|tinyurl\.com\/)[^\s]*/gi;
const DOMAIN_LIKE_PATTERN =
  /\b[a-z0-9-]{2,}\.(?:com|in|org|net|io|co|xyz|info|me|ly|app|site|online|shop|click)\b/gi;
const CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E]/g;

// Respectful anti-bullying, anti-profanity & anti-spam filter (keeps genuine Malayalam/English names intact)
const BLOCKED_SPAM_AND_ABUSE_WORDS = [
  'casino',
  'betting',
  'lottery',
  'xxx',
  'porn',
  'viagra',
  'crypto giveaway',
  'free money',
  'fuck',
  'shit',
  'bitch',
  'bastard',
  'asshole',
  'idiot',
  'stupid',
  'loser',
  'moron',
  'shut up',
  'kill yourself',
  'hate you',
  'scam',
  'hacked',
  'thendi',
  'patti',
  'myre',
  'poda',
  'podi',
  'തെണ്ടി',
  'മണ്ടൻ',
  'പട്ടി',
  'നാറി',
  'കള്ളൻ',
  'വിഡ്ഢി',
];

export function containsAbusiveLanguage(raw: string): boolean {
  if (typeof raw !== 'string' || !raw.trim()) return false;
  const lower = raw.toLowerCase();
  return BLOCKED_SPAM_AND_ABUSE_WORDS.some((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Use word boundary for pure ASCII tokens to avoid false positives on genuine names
    const pattern = /^[a-z\s]+$/.test(word) ? new RegExp(`\\b${escaped}\\b`, 'i') : new RegExp(escaped, 'i');
    return pattern.test(lower);
  });
}

export function sanitizePlayerText(raw: string, maxLen = 40): string {
  if (typeof raw !== 'string') return '';
  let clean = raw
    .replace(CONTROL_CHARS_PATTERN, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(URL_PATTERN, '')
    .replace(DOMAIN_LIKE_PATTERN, '')
    .replace(/[<>`{}|\\^~]/g, '')
    .replace(/\s{2,}/g, ' ');

  for (const word of BLOCKED_SPAM_AND_ABUSE_WORDS) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = /^[a-z\s]+$/.test(word) ? new RegExp(`\\b${escaped}\\b`, 'gi') : new RegExp(escaped, 'gi');
    clean = clean.replace(re, '');
  }

  return clean.replace(/\s{2,}/g, ' ').slice(0, maxLen);
}

export function sanitizeFinalPlayerText(raw: string, maxLen = 40): string {
  return sanitizePlayerText(raw, maxLen).trim();
}
