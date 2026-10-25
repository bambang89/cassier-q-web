import type { ProductArtIds } from '@/features/landing/types';

/* ── Roti cokelat keju ───────────────────────────────────────────────── */
export function Bread({ id, url }: ProductArtIds) {
  const bun = 'M15 74 C13 50 29 32 50 32 C71 32 87 50 85 74 C85 80 72 83 50 83 C28 83 15 80 15 74 Z';
  const cheese: [number, number, number][] = [
    [33, 44, -20], [42, 40, 15], [51, 39, -8], [60, 41, 25], [67, 47, -15], [38, 51, 30], [47, 48, -25],
    [57, 48, 10], [64, 54, 35], [31, 56, 5], [53, 55, -30], [44, 57, 20], [70, 58, -5], [25, 62, 18],
  ];
  return (
    <g>
      <defs>
        <radialGradient id={id('crust')} cx="38%" cy="26%" r="78%">
          <stop offset="0%" stopColor="#ffe2a8" />
          <stop offset="25%" stopColor="#f5b25a" />
          <stop offset="58%" stopColor="#d9852f" />
          <stop offset="84%" stopColor="#a5561a" />
          <stop offset="100%" stopColor="#6e340b" />
        </radialGradient>
        <filter id={id('crumb')} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4" result="n" />
          <feDiffuseLighting in="n" surfaceScale="1.6" lightingColor="#fff" result="l">
            <feDistantLight azimuth="225" elevation="48" />
          </feDiffuseLighting>
          {/* lembutkan: tekstur hanya meredupkan maks. ~30% */}
          <feComponentTransfer in="l" result="soft">
            <feFuncR type="linear" slope="0.32" intercept="0.7" />
            <feFuncG type="linear" slope="0.32" intercept="0.7" />
            <feFuncB type="linear" slope="0.32" intercept="0.7" />
          </feComponentTransfer>
          <feComposite in="soft" in2="SourceAlpha" operator="in" result="lit" />
          <feBlend in="SourceGraphic" in2="lit" mode="multiply" />
        </filter>
        <linearGradient id={id('paper')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffdf9" />
          <stop offset="100%" stopColor="#e6dccd" />
        </linearGradient>
        <linearGradient id={id('choco')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a2a10" />
          <stop offset="100%" stopColor="#2a1004" />
        </linearGradient>
      </defs>
      {/* kertas alas bergelombang */}
      <path d="M13 77 Q20 75 27 77 T41 77 T55 77 T69 77 T83 77 L87 77 L82 88 Q50 91.5 18 88 Z" fill={url('paper')} />
      <path d="M17 80 L21 88 M27 80 L29 89 M37 80 L38 89.6 M47 80 L47 90 M57 80 L56 89.8 M67 80 L65 89.4 M77 80 L74 88.6" stroke="#d6c9b6" strokeWidth="0.5" />
      {/* roti */}
      <path d={bun} fill={url('crust')} filter={url('crumb')} />
      {/* AO di dasar & kilap mentega */}
      <path d="M15 74 C15 80 28 83 50 83 C72 83 85 80 85 74 C80 78 66 79 50 79 C34 79 20 78 15 74 Z" fill="#3b1904" opacity="0.45" filter={url('blur-sm')} />
      <path d="M25 49 C31 39 40 35.5 49 35.5" stroke="#fff6e0" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" filter={url('blur-sm')} />
      <ellipse cx="38" cy="42" rx="5" ry="2.4" fill="#fff" opacity="0.35" filter={url('blur-sm')} transform="rotate(-28 38 42)" />
      {/* siraman cokelat dengan kilap */}
      <path
        d="M23 54 C27 47 32 61 36 52 C40 43 45 59 49 50 C53 41 58 57 62 48 C66 40 71 55 77 50"
        stroke="#000"
        strokeOpacity="0.35"
        strokeWidth="4.2"
        strokeLinecap="round"
        fill="none"
        transform="translate(0.6 1.4)"
        filter={url('blur-sm')}
      />
      <path
        d="M23 54 C27 47 32 61 36 52 C40 43 45 59 49 50 C53 41 58 57 62 48 C66 40 71 55 77 50"
        stroke={url('choco')}
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M24 53 C27.5 48 31 57 34.5 53 M41 51 C43 46 45.5 52 47.5 49 M56 51 C57.5 46 60 50 61.5 47.5 M68 50 C70 47 72.5 52 75.5 49.5"
        stroke="#fff"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* keju parut dengan bayangan */}
      {cheese.map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x + 3} ${y + 1})`}>
          <rect x={x + 0.4} y={y + 1} width="6" height="2" rx="1" fill="#5c2a07" opacity="0.35" />
          <rect x={x} y={y} width="6" height="2" rx="1" fill={i % 3 ? '#ffd23f' : '#ffe27a'} />
          <rect x={x + 0.8} y={y + 0.35} width="3.6" height="0.55" rx="0.3" fill="#fff" opacity="0.8" />
        </g>
      ))}
    </g>
  );
}
