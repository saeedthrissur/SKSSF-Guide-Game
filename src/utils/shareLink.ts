import QRCode from 'qrcode';
import type { LessonDescriptor } from './lessonTracker';

export const LOCAL_FILE_SHARE_NOTICE_ML =
  'ℹ️ നിങ്ങൾ ഇപ്പോൾ ഫയൽ (file://) രൂപത്തിലാണ് തുറന്നിരിക്കുന്നത്. സുഹൃത്തുക്കൾക്ക് തുറക്കാൻ കഴിയുന്ന ഷെയർ ലിങ്ക് ലഭിക്കാൻ വെബ്സൈറ്റ് (HTTPS) വിലാസത്തിലൂടെ തുറക്കുക.';

/** Returns true ONLY when opened directly from local disk via file:// */
export function isLocalFileProtocol(): boolean {
  if (typeof window === 'undefined' || !window.location) return false;
  return (
    window.location.protocol === 'file:' ||
    window.location.origin === 'null' ||
    !window.location.origin
  );
}

/** Dynamically resolves the live hosted origin + pathname (GitHub Pages, Codeberg, IPFS, custom domain). */
export function getAppShareUrl(): string {
  if (typeof window === 'undefined' || !window.location) return '';
  if (isLocalFileProtocol()) {
    return window.location.href.split(/[?#]/)[0];
  }
  const cleanPath = window.location.pathname.replace(/\/lesson\/[^/]+\/?$/i, '/');
  return `${window.location.origin}${cleanPath}`;
}

export async function generateAppQrDataUrl(size = 240): Promise<string | null> {
  try {
    const url = getAppShareUrl();
    return await QRCode.toDataURL(url, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#064E3B',
        light: '#FFFFFF',
      },
    });
  } catch {
    return null;
  }
}

export function getLessonShareUrl(lessonId: string): string {
  const base = getAppShareUrl();
  if (!lessonId) return base;
  return `${base}?lesson=${encodeURIComponent(lessonId)}`;
}

export function getWhatsAppShareHref(text: string, url: string): string {
  const combined = `${text}\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(combined)}`;
}

/**
 * Resolves a lesson from URL query (?lesson= / ?l=), hash (#lesson= / #/lesson/ / #<id>),
 * or path (/lesson/<id>). Supports exact lesson ID, tab ID, or 1-based lesson number (1..52).
 */
export function resolveLessonFromUrl(
  lessons: LessonDescriptor[],
  loc?: { search: string; hash: string; pathname: string }
): LessonDescriptor | null {
  const targetLoc =
    loc ??
    (typeof window !== 'undefined'
      ? {
          search: window.location.search,
          hash: window.location.hash,
          pathname: window.location.pathname,
        }
      : null);

  if (!targetLoc) return null;

  const candidates: string[] = [];

  try {
    const searchParams = new URLSearchParams(targetLoc.search);
    const qLesson = searchParams.get('lesson') || searchParams.get('l');
    if (qLesson) candidates.push(qLesson);
  } catch {
    // Ignore malformed query strings
  }

  const rawHash = (targetLoc.hash || '').replace(/^#/, '').trim();
  if (rawHash) {
    if (rawHash.includes('=')) {
      try {
        const hashParams = new URLSearchParams(rawHash.replace(/^\?/, ''));
        const hLesson = hashParams.get('lesson') || hashParams.get('l');
        if (hLesson) candidates.push(hLesson);
      } catch {
        // Ignore malformed hash params
      }
    }
    const hashPathMatch = rawHash.match(/^\/?lesson\/([^/?#]+)/i);
    if (hashPathMatch?.[1]) {
      candidates.push(decodeURIComponent(hashPathMatch[1]));
    } else if (!rawHash.includes('=') && !rawHash.includes('/')) {
      candidates.push(decodeURIComponent(rawHash));
    }
  }

  const pathMatch = (targetLoc.pathname || '').match(/\/lesson\/([^/?#]+)/i);
  if (pathMatch?.[1]) {
    try {
      candidates.push(decodeURIComponent(pathMatch[1]));
    } catch {
      candidates.push(pathMatch[1]);
    }
  }

  for (const raw of candidates) {
    const token = raw.trim();
    if (!token) continue;
    const lower = token.toLowerCase();

    // 1. Exact ID match (case-insensitive)
    const byId = lessons.find((l) => l.id.toLowerCase() === lower);
    if (byId) return byId;

    // 2. 1-based lesson number (1..52)
    if (/^\d+$/.test(token)) {
      const num = parseInt(token, 10);
      if (num >= 1 && num <= lessons.length) {
        return lessons[num - 1];
      }
    }

    // 3. Tab ID match (case-insensitive)
    const byTab = lessons.find((l) => l.tab && l.tab.toLowerCase() === lower);
    if (byTab) return byTab;
  }

  return null;
}

/**
 * Updates browser address bar with ?lesson=<id> without reloading, preserving unrelated params.
 */
export function syncLessonUrl(lessonId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    // Normalize /lesson/<id> paths back to root so relative ./assets/ never break
    if (/\/lesson\/[^/]+\/?$/i.test(url.pathname)) {
      url.pathname = url.pathname.replace(/\/lesson\/[^/]+\/?$/i, '/');
    }
    if (lessonId) {
      url.searchParams.set('lesson', lessonId);
    } else {
      url.searchParams.delete('lesson');
      url.searchParams.delete('l');
    }
    // Clear legacy #lesson=... hash once promoted to ?lesson=
    if (/^#(\/?lesson[=/])/i.test(url.hash)) {
      url.hash = '';
    }
    const next = `${url.pathname}${url.search}${url.hash}`;
    const curr = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== curr) {
      window.history.replaceState({}, '', next);
    }
  } catch {
    // Ignore history API restrictions in sandboxed iframes
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to execCommand fallback
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return Boolean(copied);
  } catch {
    return false;
  }
}

export async function copyAppShareLink(): Promise<boolean> {
  return copyTextToClipboard(getAppShareUrl());
}

export async function copyLessonShareLink(lessonId: string): Promise<boolean> {
  return copyTextToClipboard(getLessonShareUrl(lessonId));
}
