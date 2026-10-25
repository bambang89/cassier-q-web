import type { ProductArtIds } from '@/features/landing/types';

/* ── Susu UHT 250 ml (karton) ────────────────────────────────────────── */
export function Milk({ id, url }: ProductArtIds) {
  return (
    <g>
      <defs>
        <linearGradient id={id('front')} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e3e9f7" />
        </linearGradient>
        <linearGradient id={id('side')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b3c1e6" />
          <stop offset="100%" stopColor="#8495c4" />
        </linearGradient>
        <linearGradient id={id('top')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dbe2f3" />
        </linearGradient>
        <linearGradient id={id('wave')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4f8cff" />
          <stop offset="100%" stopColor="#1f4fc4" />
        </linearGradient>
        <linearGradient id={id('ao')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="70%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      {/* sedotan terbungkus plastik di sisi */}
      <path d="M64.5 30 L67.5 28.6 L67.5 60 L64.5 61.4 Z" fill="#fff" opacity="0.7" />
      <path d="M65.6 30 L66.4 29.6 L66.4 60 L65.6 60.4 Z" fill="#ff8a5c" opacity="0.8" />
      {/* atas */}
      <path d="M28 24 L58 24 L72 17 L42 17 Z" fill={url('top')} />
      <path d="M42 17 L72 17 L72 15.6 L42 15.6 Z" fill="#c9d3ea" />
      <path d="M42 15.6 L72 15.6 L58 22.6 L28 22.6 Z" fill="#f4f7fe" opacity="0.9" />
      <circle cx="62" cy="20" r="1.6" fill="#c3cde6" />
      <circle cx="61.7" cy="19.7" r="0.6" fill="#fff" />
      {/* sisi kanan (lebih gelap) */}
      <path d="M58 24 L72 17 L72 81 L58 88 Z" fill={url('side')} />
      <path d="M58 70 C62 66 67 69 72 64 L72 81 L58 88 Z" fill="#163a94" />
      <path d="M58 76 C62 73 67 75 72 71 L72 81 L58 88 Z" fill="#0d2a73" />
      {/* depan */}
      <rect x="28" y="24" width="30" height="64" fill={url('front')} />
      <path d="M28 67 C34 61 40 71 46 65 C51 60 55 65 58 63 L58 88 L28 88 Z" fill={url('wave')} />
      <path d="M28 73 C34 68 40 77 46 71 C51 66 55 71 58 69 L58 88 L28 88 Z" fill="#163a94" />
      {/* gelas susu + percikan */}
      <path d="M38.5 39 L49.5 39 L48 56 L40 56 Z" fill="#ffffff" stroke="#9fb3e3" strokeWidth="0.6" />
      <path d="M39 43 L49 43 L48 56 L40 56 Z" fill="#eef3ff" />
      <path d="M39.6 40 L40.8 54.6" stroke="#fff" strokeWidth="0.9" opacity="0.9" />
      <rect x="33" y="33" width="20" height="2.8" rx="1.4" fill="#1f4fc4" />
      <rect x="36" y="59" width="14" height="1.5" rx="0.75" fill="#1f4fc4" opacity="0.55" />
      <rect x="28" y="24" width="30" height="64" fill={url('ao')} />
      {/* bevel tepi */}
      <path d="M58 24 L58 88" stroke="#fff" strokeWidth="0.8" opacity="0.9" />
      <path d="M28 24 L58 24 L72 17" stroke="#fff" strokeWidth="0.7" fill="none" />
      <path d="M30 28 L30 64" stroke="#fff" strokeWidth="2.2" opacity="0.8" filter={url('blur-xs')} />
    </g>
  );
}
