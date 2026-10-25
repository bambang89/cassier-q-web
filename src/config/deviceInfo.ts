export const deviceType = 'WEB';

const OS_PATTERNS: [RegExp, string][] = [
  [/Windows/, 'Windows'],
  [/iPhone|iPad/, 'iOS'],
  [/Android/, 'Android'],
  [/Mac OS X/, 'macOS'],
  [/Linux/, 'Linux'],
];

// Urutan penting: UA Edge memuat "Chrome", UA Chrome memuat "Safari".
const BROWSER_PATTERNS: [RegExp, string][] = [
  [/Edg\/(\d+)/, 'Edge'],
  [/(?:Chrome|CriOS)\/(\d+)/, 'Chrome'],
  [/(?:Firefox|FxiOS)\/(\d+)/, 'Firefox'],
  [/Version\/(\d+).*Safari/, 'Safari'],
];

function describeBrowser(ua: string): string {
  const os = OS_PATTERNS.find(([re]) => re.test(ua))?.[1] ?? 'Unknown OS';
  for (const [re, name] of BROWSER_PATTERNS) {
    const match = ua.match(re);
    if (match) return `${os} · ${name} ${match[1]}`;
  }
  return `${os} · Browser`;
}

/** Label singkat, mis. "macOS · Chrome 155" (kolom devices.device_os maks 100 karakter). */
export const deviceOsVersion = typeof navigator === 'undefined' ? 'unknown' : describeBrowser(navigator.userAgent);

export const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0';

export function generateDeviceId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}
