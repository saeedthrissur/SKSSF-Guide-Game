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

export async function copyAppShareLink(): Promise<boolean> {
  const url = getAppShareUrl();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return true;
  } catch {
    return false;
  }
}
