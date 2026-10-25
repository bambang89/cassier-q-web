'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';

import { cn } from '@/utils/cn';
import { MockCaption, OrdersMockup, PosMockup, ReportMockup, StockMockup } from '@/features/landing/components/mockups';

const TABS = [
  {
    key: 'kasir',
    label: 'Transaksi kasir',
    steps: ['Buka shift kasir dengan modal awal', 'Cari produk atau scan barcode, atur jumlah & satuan', 'Pakai kode promo, pilih metode bayar, cetak struk'],
    Mock: PosMockup,
  },
  {
    key: 'stok',
    label: 'Produk & stok',
    steps: ['Stok berkurang otomatis setiap transaksi', 'Tanda "Menipis" saat stok di bawah batas minimum', 'Stok opname & catatan barang rusak untuk koreksi'],
    Mock: StockMockup,
  },
  {
    key: 'laporan',
    label: 'Laporan penjualan',
    steps: ['Ringkasan penjualan & jumlah transaksi', 'Perbandingan dengan periode sebelumnya', 'Rincian per jam, per hari, metode bayar, produk terlaris'],
    Mock: ReportMockup,
  },
  {
    key: 'pesanan',
    label: 'Pesanan online',
    steps: ['Pembeli memesan dari halaman toko online / link meja', 'Pesanan masuk ke menu Pesanan di kasir', 'Ubah status Baru → Diproses → Siap, lalu bayar di kasir'],
    Mock: OrdersMockup,
  },
];

export function ProductDemo() {
  const [active, setActive] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + TABS.length) % TABS.length;
    setActive(next);
    refs.current[next]?.focus();
  };

  const tab = TABS[active];
  return (
    <div>
      <div role="tablist" aria-label="Pilih tampilan produk" onKeyDown={onKey} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:justify-center sm:px-0">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`${id}-tab-${t.key}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-500',
              i === active ? 'bg-night text-white' : 'bg-white text-ink-2 ring-1 ring-gray-200 hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${tab.key}`} className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.6fr]">
        <ol className="space-y-4">
          {tab.steps.map((s, i) => (
            <li key={s} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-electric-50 text-sm font-bold text-electric-700">{i + 1}</span>
              <p className="pt-1 text-[15px] leading-relaxed text-ink-2">{s}</p>
            </li>
          ))}
        </ol>
        <div key={tab.key} className="motion-safe:animate-fade-in">
          <tab.Mock />
          <MockCaption />
        </div>
      </div>
    </div>
  );
}
