import QRCode from 'qrcode';

export function getAppShareUrl(): string {
  if (typeof window === 'undefined') return 'https://skssf-guide-game.app';
  return `${window.location.origin}${window.location.pathname}`;
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

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return true;
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
