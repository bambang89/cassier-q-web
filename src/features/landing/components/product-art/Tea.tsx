import type { ProductArtIds } from '@/features/landing/types';

/* ── Teh melati botol kaca ───────────────────────────────────────────── */
export function Tea({ id, url }: ProductArtIds) {
  const body = 'M43 22 L57 22 L57 30 C66.5 35 68 41 68 47 L68 85 Q68 89.5 63.5 89.5 L36.5 89.5 Q32 89.5 32 85 L32 47 C32 41 33.5 35 43 30 Z';
  return (
    <g>
      <defs>
        <linearGradient id={id('amber')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a1f03" />
          <stop offset="16%" stopColor="#b8681b" />
          <stop offset="30%" stopColor="#f0a94a" />
          <stop offset="55%" stopColor="#bb6d1f" />
          <stop offset="85%" stopColor="#6e3507" />
          <stop offset="100%" stopColor="#3a1702" />
        </linearGradient>
        <linearGradient id={id('tlabel')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#05392a" />
          <stop offset="25%" stopColor="#15a079" />
          <stop offset="55%" stopColor="#0e7a5b" />
          <stop offset="100%" stopColor="#042b1f" />
        </linearGradient>
        <linearGradient id={id('metal')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a6370" />
          <stop offset="22%" stopColor="#d5dae1" />
          <stop offset="34%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#a3acb8" />
          <stop offset="100%" stopColor="#4b535e" />
        </linearGradient>
        <linearGradient id={id('gold')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9c7a2c" />
          <stop offset="30%" stopColor="#ffe9a8" />
          <stop offset="100%" stopColor="#8a6a22" />
        </linearGradient>
        <clipPath id={id('tbody')}>
          <path d={body} />
        </clipPath>
      </defs>
      <ellipse cx="57" cy="89.2" rx="12" ry="2.4" fill="#c06f1a" opacity="0.32" filter={url('blur-sm')} />
      <path d={body} fill={url('amber')} />
      <g clipPath={url('tbody')}>
        {/* ruang udara di leher */}
        <rect x="30" y="20" width="40" height="11" fill="#2a1202" opacity="0.35" />
        <ellipse cx="50" cy="31" rx="9" ry="1" fill="#ffd28a" opacity="0.6" />
        {/* label */}
        <rect x="30" y="51" width="40" height="25" fill={url('tlabel')} />
        <rect x="30" y="51" width="40" height="1.6" fill={url('gold')} />
        <rect x="30" y="74.4" width="40" height="1.6" fill={url('gold')} />
        <g transform="translate(50 59.5)">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="0" cy="-2.8" rx="1.6" ry="2.8" fill="#fff" transform={`rotate(${r})`} />
          ))}
          <circle r="1.2" fill="#f4d58d" />
        </g>
        <rect x="40" y="66" width="20" height="2.2" rx="1.1" fill="#fff" />
        <rect x="43.5" y="69.6" width="13" height="1.3" rx="0.65" fill="#fff" opacity="0.6" />
        <rect x="30" y="51" width="40" height="25" fill={url('cyl-shade')} opacity="0.7" />
        <rect x="30" y="20" width="40" height="72" fill={url('rim')} />
      </g>
      {/* kilap kaca: lunak + tajam */}
      <path d="M37 39 C35.6 43 35.4 46 35.6 49 L35.6 85" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.4" filter={url('blur-sm')} />
      <path d="M37.2 40 C36.2 43.5 36 46 36.1 49 M36.1 77.5 L36.1 85" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.95" />
      <path d="M64.5 49 L64.5 84" stroke="#fff" strokeWidth="0.7" opacity="0.35" />
      {/* tutup logam */}
      <rect x="41.5" y="12.5" width="17" height="10.5" rx="1.8" fill={url('metal')} />
      {[14.8, 17, 19.2, 21.2].map((y) => (
        <rect key={y} x="41.5" y={y} width="17" height="0.55" fill="#2f363f" opacity="0.35" />
      ))}
      <ellipse cx="50" cy="12.6" rx="8.4" ry="1.1" fill="#eef1f5" />
    </g>
  );
}
