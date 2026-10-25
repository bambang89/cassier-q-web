import { Droplets } from '@/features/landing/components/product-art/Droplets';
import type { ProductArtIds } from '@/features/landing/types';

/* ── Es kopi susu gula aren ──────────────────────────────────────────── */
export function Coffee({ id, url }: ProductArtIds) {
  const cup = 'M29 29 L71 29 L65 86.5 Q50 90 35 86.5 Z';
  return (
    <g>
      <defs>
        <linearGradient id={id('latte')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6e8d4" />
          <stop offset="30%" stopColor="#dcb184" />
          <stop offset="52%" stopColor="#b47640" />
          <stop offset="70%" stopColor="#7c4219" />
          <stop offset="86%" stopColor="#4a240b" />
          <stop offset="100%" stopColor="#2d1405" />
        </linearGradient>
        <linearGradient id={id('lid')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9d2dc" />
          <stop offset="25%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#eef2f6" />
          <stop offset="100%" stopColor="#aab5c2" />
        </linearGradient>
        <linearGradient id={id('straw')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#05090f" />
          <stop offset="40%" stopColor="#3a4656" />
          <stop offset="100%" stopColor="#05090f" />
        </linearGradient>
        <clipPath id={id('cup')}>
          <path d={cup} />
        </clipPath>
      </defs>
      {/* bayangan berwarna (cahaya tembus kopi) */}
      <ellipse cx="57" cy="89.5" rx="14" ry="2.6" fill="#8a4a1c" opacity="0.28" filter={url('blur-sm')} />
      {/* sedotan */}
      <path d="M55 3 L59.4 3.8 L55.4 31 L51 30.3 Z" fill={url('straw')} />
      <g clipPath={url('cup')}>
        {/* sedotan di dalam (terbias) */}
        <path d="M51 30 L55.4 31 L57.5 86 L53.2 86 Z" fill="#1a1007" opacity="0.55" />
        <rect x="28" y="35" width="44" height="58" fill={url('latte')} />
        {/* es batu */}
        {[
          [36, 37, 10, 9, -14],
          [49, 39, 10, 8, 12],
          [41, 47, 9, 8, 5],
          [55, 49, 8, 7, -8],
        ].map(([x, y, w, h, r], i) => (
          <g key={i} transform={`rotate(${r} ${x + w / 2} ${y + h / 2})`}>
            <rect x={x} y={y} width={w} height={h} rx="2.2" fill="#fff" opacity={0.42 - i * 0.07} />
            <path d={`M${x + 1.5} ${y + 1.6} h${w - 4}`} stroke="#fff" strokeWidth="0.9" strokeLinecap="round" opacity="0.9" />
          </g>
        ))}
        {/* permukaan susu */}
        <ellipse cx="50" cy="35.5" rx="21" ry="2.2" fill="#fbf2e4" opacity="0.85" />
        <rect x="28" y="28" width="44" height="64" fill={url('cyl-shade')} />
        <rect x="28" y="28" width="44" height="64" fill={url('rim')} />
        <Droplets
          points={[
            [36, 60, 0.9], [39, 70, 1.2], [44, 76, 0.8], [58, 64, 1], [61, 73, 1.3], [53, 81, 0.9],
            [37, 80, 1], [62, 56, 0.7], [47, 67, 0.7], [56, 72, 0.6], [41, 63, 0.6], [64, 81, 0.8],
          ]}
        />
      </g>
      {/* tepi gelas & kilap */}
      <path d={cup} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.7" />
      <path d="M33.6 33 L38 82" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity="0.55" filter={url('blur-sm')} />
      <path d="M34 34 L37.8 78" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" opacity="0.95" />
      {/* stiker */}
      <g transform="translate(43 56)">
        <rect width="15" height="10" rx="2.4" fill="#fff" />
        <rect width="15" height="10" rx="2.4" fill={url('cyl-shade')} opacity="0.5" />
        <circle cx="4" cy="5" r="2.4" fill="#0e7a5b" />
        <path d="M2.8 5 l1 1 1.8 -2" stroke="#fff" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        <rect x="7.6" y="3.2" width="5.6" height="1.3" rx="0.65" fill="#0b1f33" opacity="0.75" />
        <rect x="7.6" y="5.6" width="4" height="1.1" rx="0.55" fill="#0b1f33" opacity="0.35" />
      </g>
      {/* tutup kubah */}
      <path d="M30.5 29.5 Q50 11 69.5 29.5 Z" fill={url('lid')} opacity="0.92" />
      <path d="M30.5 29.5 Q50 11 69.5 29.5" fill="none" stroke="#94a1b0" strokeWidth="0.5" />
      <path d="M36 25.5 Q43 17.5 52 16.6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.95" filter={url('blur-xs')} />
      <rect x="27.5" y="27.6" width="45" height="4" rx="2" fill={url('lid')} />
      <rect x="28.5" y="28" width="43" height="0.8" rx="0.4" fill="#fff" opacity="0.9" />
    </g>
  );
}
