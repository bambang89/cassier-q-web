import type { ProductArtIds } from '@/features/landing/types';

/* ── Mi instan goreng (kemasan bantal) ───────────────────────────────── */
export function Noodle({ id, url }: ProductArtIds) {
  const top = Array.from({ length: 13 }, (_, i) => `L${(17 + i * 5.5).toFixed(1)} ${i % 2 ? 25.5 : 28}`).join(' ');
  const bottom = Array.from({ length: 13 }, (_, i) => `L${(83 - i * 5.5).toFixed(1)} ${i % 2 ? 84.5 : 82}`).join(' ');
  const pack = `M17 28 ${top} L83 28 Q87.5 55 83 82 ${bottom} L17 82 Q12.5 55 17 28 Z`;
  return (
    <g transform="rotate(-7 50 55)">
      <defs>
        <linearGradient id={id('pack')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff7a45" />
          <stop offset="50%" stopColor="#e2381c" />
          <stop offset="100%" stopColor="#8f1a0a" />
        </linearGradient>
        {/* gembung: terang di tengah, gelap di tepi */}
        <radialGradient id={id('puff')} cx="42%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="80%" stopColor="#000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.38" />
        </radialGradient>
        <radialGradient id={id('bowl')} cx="45%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#e3e7ec" />
          <stop offset="100%" stopColor="#b9c0c9" />
        </radialGradient>
        <radialGradient id={id('mie')} cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#ffd56a" />
          <stop offset="100%" stopColor="#d98a12" />
        </radialGradient>
        <clipPath id={id('pk')}>
          <path d={pack} />
        </clipPath>
      </defs>
      <path d={pack} fill={url('pack')} />
      <g clipPath={url('pk')}>
        {/* pita kuning */}
        <path d="M10 35 Q50 33 90 35 L90 46 Q50 44 10 46 Z" fill="#ffc928" />
        <path d="M10 46 Q50 44 90 46 L90 47.2 Q50 45.2 10 47.2 Z" fill="#a8200e" opacity="0.5" />
        <rect x="23" y="38" width="31" height="3.4" rx="1.7" fill="#a8200e" />
        <rect x="58" y="38.4" width="19" height="2.4" rx="1.2" fill="#a8200e" opacity="0.5" />
        {/* foto mangkuk mi */}
        <ellipse cx="51" cy="72" rx="22" ry="4.5" fill="#5a0f05" opacity="0.4" filter={url('blur-sm')} />
        <path d="M28.5 60 Q50 85 71.5 60 Z" fill={url('bowl')} />
        <ellipse cx="50" cy="60" rx="21.5" ry="6.2" fill={url('mie')} />
        <path
          d="M31 60 q3 -3 6 0 t6 0 t6 0 t6 0 t6 0 t6 0 M33 62.2 q3 -2.5 6 0 t6 0 t6 0 t6 0 t6 0 M36 58 q3 -2 6 0 t6 0 t6 0 t6 0"
          stroke="#b8700c"
          strokeWidth="0.8"
          fill="none"
        />
        <ellipse cx="43" cy="57.4" rx="3" ry="2.4" fill="#fff6d0" />
        <circle cx="43.3" cy="57.6" r="1.3" fill="#ffae1a" />
        <path d="M55 55.5 l5.5 1 -1.2 2.6 -5.4 -1 z" fill="#2f7d31" />
        <path d="M49.5 56 l3.6 0.4 M60 60 l3 -0.6" stroke="#c0392b" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="10" y="20" width="80" height="70" fill={url('puff')} />
        {/* kerutan plastik */}
        <path d="M22 30 Q24 55 21 80 M78 31 Q76 55 79 79" stroke="#fff" strokeWidth="1.2" opacity="0.35" fill="none" filter={url('blur-xs')} />
        <path d="M30 29 C40 33 58 33 70 29" stroke="#fff" strokeWidth="2.6" opacity="0.5" fill="none" filter={url('blur-sm')} />
      </g>
      {/* segel bergerigi */}
      <path d={`M17 28 ${top} L83 28`} fill="none" stroke="#ffb59a" strokeWidth="0.5" opacity="0.8" />
      <path d={`M83 82 ${bottom}`} fill="none" stroke="#5c0d03" strokeWidth="0.5" opacity="0.6" />
    </g>
  );
}
