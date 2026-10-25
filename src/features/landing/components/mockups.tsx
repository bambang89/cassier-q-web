import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';
import { SearchIcon, BarcodeIcon } from '@/components/ui/icons/ActionIcons';
import { ProductArt } from '@/features/landing/components/ProductArt';
import type { ProductKind } from '@/features/landing/types';
import { rp } from '@/features/landing/utils';
import { PRODUCT_BG, MOCK_RAIL, MOCK_PRODUCTS, MOCK_HOURS, MOCK_STOCK, MOCK_ORDER_COLS } from '@/features/landing/constants';

/*
 * Mockup HTML/CSS yang meniru tata letak aplikasi cassier-Q (sidebar navy,
 * grid produk, keranjang). Semua angka & nama produk adalah CONTOH tampilan,
 * bukan data pelanggan — tiap mockup diberi keterangan "Ilustrasi tampilan".
 */

export function MockCaption({ children = 'Ilustrasi tampilan aplikasi · data contoh', className }: { children?: ReactNode; className?: string }) {
  return <p className={cn('mt-3 text-center text-xs text-ink-3', className)}>{children}</p>;
}

function Frame({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn('overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_30px_60px_-30px_rgb(11_31_51/0.35)]', className)}
    >
      <div className="flex h-8 items-center gap-1.5 border-b border-gray-100 bg-gray-25 px-3" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="ml-3 h-4 w-40 rounded bg-gray-100" />
      </div>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

function Rail({ active }: { active: string }) {
  return (
    <div className="hidden w-[92px] shrink-0 flex-col gap-1 bg-navy-900 p-2 sm:flex">
      <div className="mb-2 flex items-center gap-1 px-1 py-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/branding/cassier-q-symbol.svg" alt="" className="size-5" />
        <span className="whitespace-nowrap text-[9.5px] font-bold text-white">cassier-Q</span>
      </div>
      {MOCK_RAIL.map((r) => (
        <span
          key={r}
          className={cn(
            'rounded-lg px-2 py-1.5 text-[10px] font-semibold',
            r === active ? 'bg-electric-600 text-white' : 'text-rail-muted',
          )}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

/** Foto produk: ilustrasi di atas latar lembut sesuai warna produk. */
function Thumb({ kind, className }: { kind: ProductKind; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-b', PRODUCT_BG[kind], className)}>
      {/* studio: sorot cahaya dari atas + lantai yang sedikit lebih gelap */}
      <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_28%,rgb(255_255_255/0.85),transparent_70%)]" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-transparent to-black/[0.06]" />
      <ProductArt kind={kind} className="absolute inset-0 size-full drop-shadow-[0_3px_3px_rgb(11_31_51/0.18)]" />
      <span aria-hidden="true" className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/[0.04]" />
    </div>
  );
}

export function PosMockup({ className }: { className?: string }) {
  const cart = [
    { name: 'Kopi Susu Gula Aren', qty: 2, price: 18000, kind: 'coffee' as const },
    { name: 'Roti Cokelat Keju', qty: 1, price: 12000, kind: 'bread' as const },
    { name: 'Air Mineral 600ml', qty: 3, price: 4000, kind: 'water' as const },
  ];
  const subtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  return (
    <Frame className={className} label="Ilustrasi layar kasir cassier-Q: daftar produk dan keranjang belanja">
      <div className="flex h-[340px] sm:h-[380px]">
        <Rail active="Kasir" />
        <div className="flex min-w-0 flex-1 flex-col bg-canvas p-3">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-[10px] text-ink-3">
              <SearchIcon size={12} />
              <span className="truncate">Cari produk atau scan barcode…</span>
            </div>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-electric-600 text-white">
              <BarcodeIcon size={15} />
            </span>
          </div>
          <div className="mb-2 flex gap-1.5 overflow-hidden">
            {['Semua', 'Minuman', 'Makanan', 'Sembako'].map((c, i) => (
              <span key={c} className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold', i === 0 ? 'bg-navy-900 text-white' : 'bg-white text-ink-2')}>
                {c}
              </span>
            ))}
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2 overflow-hidden md:grid-cols-3">
            {MOCK_PRODUCTS.map((p) => (
              <div key={p.name} className="flex min-w-0 flex-col rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/[0.03]">
                <Thumb kind={p.kind} className="mb-1.5 min-h-0 w-full flex-1 rounded-lg" />
                <span className="truncate px-0.5 text-[10px] font-semibold text-ink">{p.name}</span>
                <span className="px-0.5 text-[10px] font-bold text-electric-700">{rp(p.price)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-[44%] max-w-[230px] shrink-0 flex-col border-l border-gray-100 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink">Keranjang</span>
            <span className="rounded-full bg-pine-50 px-2 py-0.5 text-[9px] font-bold text-pine-700">Shift dibuka</span>
          </div>
          <div className="flex-1 space-y-2">
            {cart.map((c) => (
              <div key={c.name} className="flex items-center gap-2 border-b border-dashed border-gray-100 pb-2">
                <Thumb kind={c.kind} className="size-8 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold text-ink">{c.name}</p>
                  <p className="text-[9px] text-ink-3">
                    {c.qty} × {rp(c.price)}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-ink">{rp(c.qty * c.price)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between text-ink-2">
              <span>Subtotal</span>
              <span>{rp(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-2">
              <span>Kode promo</span>
              <span className="text-pine-600">−{rp(2000)}</span>
            </div>
            <div className="flex justify-between text-[12px] font-extrabold text-ink">
              <span>Total</span>
              <span>{rp(subtotal - 2000)}</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1">
            {['Tunai', 'QRIS', 'Debit'].map((m, i) => (
              <span key={m} className={cn('rounded-md py-1 text-center text-[9px] font-bold', i === 1 ? 'bg-electric-50 text-electric-700 ring-1 ring-electric-400' : 'bg-gray-100 text-ink-2')}>
                {m}
              </span>
            ))}
          </div>
          <span className="mt-2 rounded-lg bg-electric-600 py-2 text-center text-[11px] font-bold text-white">Bayar</span>
        </div>
      </div>
    </Frame>
  );
}

export function ReportMockup({ className }: { className?: string }) {
  return (
    <Frame className={className} label="Ilustrasi laporan penjualan: grafik per jam, metode pembayaran, dan produk terlaris">
      <div className="flex h-[340px] sm:h-[380px]">
        <Rail active="Laporan" />
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-2.5 bg-canvas p-3 md:grid-cols-5">
          <div className="grid grid-cols-3 gap-2 md:col-span-5">
            {[
              ['Penjualan', 'Rp4.820.000', '+12% vs periode lalu'],
              ['Transaksi', '186', '+5% vs periode lalu'],
              ['Rata-rata', 'Rp25.900', '−2% vs periode lalu'],
            ].map(([k, v, d], i) => (
              <div key={k} className="rounded-xl bg-white p-2.5 shadow-sm">
                <p className="text-[9px] font-semibold text-ink-3">{k}</p>
                <p className="text-[12px] font-extrabold text-ink sm:text-[13px]">{v}</p>
                <p className={cn('text-[8.5px] font-semibold', i === 2 ? 'text-error-600' : 'text-pine-600')}>{d}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white p-2.5 shadow-sm md:col-span-3">
            <p className="mb-2 text-[10px] font-bold text-ink">Penjualan per jam</p>
            <div className="flex h-[120px] items-end gap-1 sm:h-[150px]">
              {MOCK_HOURS.map((h, i) => (
                <span key={i} className="flex-1 rounded-t bg-gradient-to-t from-electric-600 to-electric-400" style={{ height: `${(h / 62) * 100}%` }} />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[8px] text-ink-3">
              <span>08.00</span>
              <span>14.00</span>
              <span>20.00</span>
            </div>
          </div>
          <div className="hidden flex-col gap-2 md:col-span-2 md:flex">
            <div className="rounded-xl bg-white p-2.5 shadow-sm">
              <p className="mb-2 text-[10px] font-bold text-ink">Metode pembayaran</p>
              <div className="mb-2 flex h-2 overflow-hidden rounded-full">
                <span className="w-[46%] bg-electric-600" />
                <span className="w-[34%] bg-pine-500" />
                <span className="w-[20%] bg-violet-400" />
              </div>
              {[
                ['Tunai', '46%', 'bg-electric-600'],
                ['QRIS', '34%', 'bg-pine-500'],
                ['Debit', '20%', 'bg-violet-400'],
              ].map(([m, p, c]) => (
                <div key={m} className="flex items-center justify-between text-[9px] text-ink-2">
                  <span className="flex items-center gap-1.5">
                    <span className={cn('size-1.5 rounded-full', c)} />
                    {m}
                  </span>
                  <span className="font-semibold">{p}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 rounded-xl bg-white p-2.5 shadow-sm">
              <p className="mb-1.5 text-[10px] font-bold text-ink">Produk terlaris</p>
              {['Kopi Susu Gula Aren', 'Air Mineral 600ml', 'Roti Cokelat Keju'].map((p, i) => (
                <div key={p} className="flex items-center gap-1.5 py-0.5 text-[9px] text-ink-2">
                  <span className="w-3 font-bold text-ink-3">{i + 1}</span>
                  <span className="truncate">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function StockMockup({ className }: { className?: string }) {
  return (
    <Frame className={className} label="Ilustrasi daftar stok dengan penanda stok menipis dan stok opname">
      <div className="flex h-[340px] sm:h-[380px]">
        <Rail active="Stok" />
        <div className="min-w-0 flex-1 bg-canvas p-3">
          <div className="mb-3 flex items-center gap-2">
            {['Daftar stok', 'Mutasi', 'Stok opname', 'Barang rusak'].map((t, i) => (
              <span key={t} className={cn('rounded-lg px-2.5 py-1.5 text-[10px] font-semibold', i === 0 ? 'bg-white text-ink shadow-sm' : 'text-ink-3')}>
                {t}
              </span>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="grid grid-cols-[1fr_60px_70px] border-b border-gray-100 px-3 py-2 text-[9px] font-bold text-ink-3 uppercase">
              <span>Produk</span>
              <span className="text-right">Stok</span>
              <span className="text-right">Status</span>
            </div>
            {MOCK_STOCK.map((s) => {
              const low = s.qty < s.min;
              return (
                <div key={s.name} className="grid grid-cols-[1fr_60px_70px] items-center border-b border-gray-50 px-3 py-2.5 text-[10px]">
                  <span className="truncate font-semibold text-ink">{s.name}</span>
                  <span className="text-right text-ink-2">
                    {s.qty} {s.unit}
                  </span>
                  <span className="text-right">
                    <span className={cn('rounded-full px-1.5 py-0.5 text-[8.5px] font-bold', low ? 'bg-warning-100 text-warning-700' : 'bg-pine-50 text-pine-700')}>
                      {low ? 'Menipis' : 'Aman'}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-warning-200 bg-warning-50 p-2.5 text-[10px] text-warning-700">
            <span className="size-1.5 shrink-0 rounded-full bg-warning-500" />2 produk di bawah stok minimum — buat pesanan pembelian ke pemasok.
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function OrdersMockup({ className }: { className?: string }) {
  return (
    <Frame className={className} label="Ilustrasi menu Pesanan: pesanan dari toko online masuk ke kasir per status">
      <div className="flex h-[340px] sm:h-[380px]">
        <Rail active="Pesanan" />
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-2 bg-canvas p-3">
          {MOCK_ORDER_COLS.map((col) => (
            <div key={col.title} className="flex flex-col gap-2 rounded-xl bg-gray-100/70 p-2">
              <div className="flex items-center gap-1.5 px-1 text-[10px] font-bold text-ink">
                <span className={cn('size-2 rounded-full', col.tone)} />
                {col.title}
                <span className="ml-auto text-ink-3">{col.items.length}</span>
              </div>
              {col.items.map(([no, who, how]) => (
                <div key={no} className="rounded-lg bg-white p-2 shadow-sm">
                  <p className="text-[10px] font-bold text-ink">{no}</p>
                  <p className="text-[9px] text-ink-2">{who}</p>
                  <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[8.5px] font-semibold text-ink-2">{how}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function PhoneStoreMockup({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Ilustrasi halaman toko online cassier-Q di ponsel pembeli"
      className={cn('w-[188px] rounded-[30px] border-[6px] border-night bg-night shadow-[0_30px_50px_-20px_rgb(7_17_31/0.55)]', className)}
    >
      <div aria-hidden="true" className="overflow-hidden rounded-[24px] bg-white">
        <div className="bg-gradient-to-br from-electric-600 to-pine-600 px-3 pb-4 pt-5 text-white">
          <p className="text-[8px] font-semibold opacity-80">Toko online · Meja 4</p>
          <p className="text-[13px] font-extrabold">Kedai Contoh</p>
        </div>
        <div className="space-y-1.5 p-2.5">
          {MOCK_PRODUCTS.slice(0, 4).map((p) => (
            <div key={p.name} className="flex items-center gap-2 rounded-lg border border-gray-100 p-1.5">
              <Thumb kind={p.kind} className="size-9 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[8.5px] font-semibold text-ink">{p.name}</p>
                <p className="text-[8.5px] font-bold text-electric-700">{rp(p.price)}</p>
              </div>
              <span className="flex size-4 items-center justify-center rounded bg-electric-600 text-[10px] font-bold leading-none text-white">+</span>
            </div>
          ))}
          <div className="mt-1 rounded-lg bg-night py-1.5 text-center text-[9px] font-bold text-white">Pesan · {rp(42000)}</div>
        </div>
      </div>
    </div>
  );
}
