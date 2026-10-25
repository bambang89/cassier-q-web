import { useId } from 'react';

import type { ProductKind } from '@/features/landing/types';
import { Coffee } from '@/features/landing/components/product-art/Coffee';
import { Bread } from '@/features/landing/components/product-art/Bread';
import { Water } from '@/features/landing/components/product-art/Water';
import { Tea } from '@/features/landing/components/product-art/Tea';
import { Noodle } from '@/features/landing/components/product-art/Noodle';
import { Milk } from '@/features/landing/components/product-art/Milk';

/*
 * Ilustrasi "packshot" produk contoh untuk mockup landing — SVG murni dengan
 * shading 3D: gradien silinder (sisi gelap → kilap → pantulan tepi), kilap
 * specular yang di-blur, ambient occlusion di dasar, dan bayangan lantai lembut.
 * Cahaya utama dari kiri atas. Id diberi prefix useId karena SVG yang sama
 * tampil berkali-kali di halaman.
 */

export function ProductArt({ kind, className }: { kind: ProductKind; className?: string }) {
  const raw = useId();
  const id = (name: string) => `${raw.replace(/[^a-zA-Z0-9]/g, '')}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const ids = { id, url };

  return (
    <svg viewBox="10 0 80 100" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id={id('blur-lg')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id={id('blur-sm')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
        <filter id={id('blur-xs')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
        {/* Gelap di kedua sisi silinder → kesan volume. */}
        <linearGradient id={id('cyl-shade')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.42" />
          <stop offset="14%" stopColor="#000" stopOpacity="0.08" />
          <stop offset="30%" stopColor="#000" stopOpacity="0" />
          <stop offset="68%" stopColor="#000" stopOpacity="0.06" />
          <stop offset="90%" stopColor="#000" stopOpacity="0.38" />
          <stop offset="97%" stopColor="#000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        {/* Pantulan cahaya tepi kanan (rim light). */}
        <linearGradient id={id('rim')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="88%" stopColor="#fff" stopOpacity="0" />
          <stop offset="95%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* bayangan lantai: lebar & lembut + kontak tajam */}
      <ellipse cx="51" cy="90" rx="27" ry="4.2" fill="#0b1f33" opacity="0.22" filter={url('blur-lg')} />
      <ellipse cx="50" cy="88.6" rx="17" ry="1.9" fill="#0b1f33" opacity="0.38" filter={url('blur-sm')} />
      {kind === 'coffee' && <Coffee {...ids} />}
      {kind === 'bread' && <Bread {...ids} />}
      {kind === 'water' && <Water {...ids} />}
      {kind === 'tea' && <Tea {...ids} />}
      {kind === 'noodle' && <Noodle {...ids} />}
      {kind === 'milk' && <Milk {...ids} />}
    </svg>
  );
}

