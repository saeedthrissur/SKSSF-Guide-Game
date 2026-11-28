/**
 * Shared text sanitization utilities for player profile fields, certificates,
 * photo badges, and WhatsApp share links.
 * Prevents URL/spam injection, control characters, and layout-breaking text.
 */

const URL_PATTERN =
  /(?:https?:\/\/|www\.|wa\.me\/|t\.me\/|bit\.ly\/|tinyurl\.com\/)[^\s]*/gi;
const DOMAIN_LIKE_PATTERN =
  /\b[a-z0-9-]{2,}\.(?:com|in|org|net|io|co|xyz|info|me|ly|app|site|online|shop|click)\b/gi;
const CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E]/g;

// Basic spam/abusive token filter (keeps genuine Malayalam/English names untouched)
const BLOCKED_SPAM_WORDS = [
  'casino',
  'betting',
  'lottery',
  'xxx',
  'porn',
  'viagra',
  'crypto giveaway',
  'free money',
];

export function sanitizePlayerText(raw: string, maxLen = 40): string {
  if (typeof raw !== 'string') return '';
  let clean = raw
    .replace(CONTROL_CHARS_PATTERN, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(URL_PATTERN, '')
    .replace(DOMAIN_LIKE_PATTERN, '')
    .replace(/[<>`{}|\\^~]/g, '')
    .replace(/\s{2,}/g, ' ');

  for (const word of BLOCKED_SPAM_WORDS) {
    const re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    clean = clean.replace(re, '');
  }

  return clean.slice(0, maxLen);
}

export function sanitizeFinalPlayerText(raw: string, maxLen = 40): string {
  return sanitizePlayerText(raw, maxLen).trim();
}
