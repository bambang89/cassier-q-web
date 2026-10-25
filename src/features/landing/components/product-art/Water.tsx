import { Droplets } from '@/features/landing/components/product-art/Droplets';
import type { ProductArtIds } from '@/features/landing/types';

/* ── Air mineral 600 ml ──────────────────────────────────────────────── */
export function Water({ id, url }: ProductArtIds) {
  const body = 'M40 24 L60 24 L60 28 C67.5 32 69 38 69 44 L69 84 Q69 89.5 63.5 89.5 L36.5 89.5 Q31 89.5 31 84 L31 44 C31 38 32.5 32 40 28 Z';
  return (
    <g>
      <defs>
        <linearGradient id={id('pet')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7fb6e2" />
          <stop offset="18%" stopColor="#d8efff" />
          <stop offset="32%" stopColor="#f6fbff" />
          <stop offset="62%" stopColor="#c4e2f8" />
          <stop offset="88%" stopColor="#8ec3ea" />
          <stop offset="100%" stopColor="#5f9fd2" />
        </linearGradient>
        <linearGradient id={id('cap')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#123a92" />
          <stop offset="22%" stopColor="#4f8cff" />
          <stop offset="38%" stopColor="#9cc0ff" />
          <stop offset="60%" stopColor="#2a64e8" />
          <stop offset="100%" stopColor="#0e2f78" />
        </linearGradient>
        <linearGradient id={id('wlabel')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cfdcf3" />
          <stop offset="28%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c3d3ef" />
        </linearGradient>
        <clipPath id={id('wbody')}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* kaustik biru di lantai */}
      <ellipse cx="56" cy="89.2" rx="11" ry="2.2" fill="#3d7bff" opacity="0.25" filter={url('blur-sm')} />
      <path d={body} fill={url('pet')} />
      <g clipPath={url('wbody')}>
        {/* air & garis permukaan */}
        <rect x="30" y="33" width="40" height="58" fill="#3d7bff" opacity="0.08" />
        <ellipse cx="50" cy="33" rx="12" ry="1.3" fill="#fff" opacity="0.8" />
        {/* ulir */}
        {[74, 78, 82].map((y) => (
          <g key={y}>
            <path d={`M31 ${y} Q50 ${y + 2.4} 69 ${y}`} stroke="#4f8fcf" strokeWidth="0.9" fill="none" opacity="0.6" />
            <path d={`M31 ${y + 1} Q50 ${y + 3.4} 69 ${y + 1}`} stroke="#fff" strokeWidth="0.7" fill="none" opacity="0.8" />
          </g>
        ))}
        {/* label melingkar */}
        <rect x="30" y="49" width="40" height="21" fill={url('wlabel')} />
        <path d="M30 62 C39 57.5 45 66.5 54 62 C61 58.5 65 61 70 60 L70 70 L30 70 Z" fill="#2a64e8" />
        <path d="M30 65.5 C39 62 45 70 54 65.5 C61 62 65 64.5 70 63.5 L70 70 L30 70 Z" fill="#123a92" />
        <rect x="38" y="52.6" width="24" height="2.6" rx="1.3" fill="#123a92" />
        <rect x="42.5" y="56.6" width="15" height="1.5" rx="0.75" fill="#2a64e8" opacity="0.55" />
        <rect x="30" y="49" width="40" height="21" fill={url('cyl-shade')} opacity="0.55" />
        <rect x="30" y="24" width="40" height="66" fill={url('rim')} />
        <Droplets points={[[36, 76, 0.8], [62, 44, 0.9], [64, 79, 1.1], [58, 84, 0.7], [37, 42, 0.7], [41, 85, 0.9]]} />
      </g>
      {/* kilap specular */}
      <path d="M35.5 34 C34.3 38 34 43 34.3 47 L34.3 84" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" fill="none" opacity="0.55" filter={url('blur-sm')} />
      <path d="M35.6 36 C34.8 40 34.6 44 34.8 47 M34.8 72 L34.8 84" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" />
      {/* leher & tutup */}
      <rect x="40.5" y="20.6" width="19" height="4" rx="1" fill="#e2f2fd" stroke="#94c4e8" strokeWidth="0.5" />
      <rect x="39.5" y="21.6" width="21" height="1.2" rx="0.6" fill="#9cc8ea" />
      <rect x="41.5" y="8" width="17" height="13" rx="2.2" fill={url('cap')} />
      {[44, 46.5, 49, 51.5, 54, 56.5].map((x) => (
        <rect key={x} x={x} y="9.6" width="0.8" height="10" rx="0.4" fill="#06204f" opacity="0.35" />
      ))}
      <ellipse cx="50" cy="8.2" rx="8.5" ry="1.2" fill="#6fa0ff" />
    </g>
  );
}
