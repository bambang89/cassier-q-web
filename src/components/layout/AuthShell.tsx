'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { CheckIcon } from '@/components/icons/LineIcons';
import { FullScreenLoader, useAuthBootstrap } from './AuthBootstrap';

const HIGHLIGHTS = [
  'Kasir cepat dengan scan barcode & cetak struk',
  'Stok, pelanggan, dan utang tercatat otomatis',
  'Laporan penjualan harian dalam satu layar',
];

/** Layar login/daftar: panel brand di kiri (layar lebar) + form di kanan. */
export function AuthShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useAuthBootstrap();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  if (status === 'idle' || status === 'checking' || status === 'authenticated') return <FullScreenLoader />;

  return (
    <div className="flex min-h-dvh bg-white">
      <aside className="relative hidden flex-1 flex-col justify-center overflow-hidden bg-[linear-gradient(135deg,#0B1F33_0%,#123E7A_55%,#2563EB_100%)] px-12 lg:flex">
        <div className="absolute -right-[120px] -bottom-[140px] size-[380px] rounded-full bg-[rgba(96,165,250,0.18)]" />
        <p className="text-[13px] font-bold tracking-[2px] text-[#8FE0C2]">CASSIER-Q</p>
        <h2 className="mt-3 max-w-[440px] text-[34px] leading-[44px] font-bold text-white">
          Kasir pintar untuk bisnis yang terus bertumbuh.
        </h2>
        <ul className="mt-8 space-y-4">
          {HIGHLIGHTS.map((item, index) => (
            <li
              key={item}
              className="flex animate-fade-in items-center gap-3"
              style={{ animationDelay: `${300 + index * 90}ms` }}
            >
              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[rgba(16,185,129,0.9)] text-white">
                <CheckIcon size={14} strokeWidth={2.4} />
              </span>
              <span className="text-[15px] text-white/90">{item}</span>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex flex-1 items-center justify-center overflow-y-auto">{children}</div>
    </div>
  );
}

/** Logo simbol di atas form auth. */
export function AuthLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/branding/cassier-q-symbol.svg"
      alt="cassier-Q"
      className="mx-auto mb-5 size-14 animate-[pop-in_0.52s_ease-out_both]"
    />
  );
}
