'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import type { CustomerOrderStatus, PublicOrderStatus } from '@/types/storefront';
import { fetchPublicOrder, fetchPublicStorefront } from '@/services/storefrontApi';
import { cn } from '@/utils/cn';
import { formatRupiah } from '@/utils/format';
import { LoadingBlock } from '@/components/ui/Spinner';
import { CheckIcon } from '@/components/ui/icons/ActionIcons';
import { themeStyle } from '@/features/storefront/utils';

const STEPS: { status: CustomerOrderStatus; label: string }[] = [
  { status: 'NEW', label: 'Pesanan diterima sistem' },
  { status: 'ACCEPTED', label: 'Dikonfirmasi toko' },
  { status: 'IN_PROGRESS', label: 'Sedang disiapkan' },
  { status: 'READY', label: 'Siap diambil / diantar' },
  { status: 'COMPLETED', label: 'Selesai' },
];

/** Halaman lacak pesanan pembeli — diperbarui otomatis tiap 15 detik. */
export default function PublicOrderPage() {
  const { slug, orderId } = useParams<{ slug: string; orderId: string }>();
  const [order, setOrder] = useState<PublicOrderStatus | null>(null);
  const [theme, setTheme] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState(false);
  // Dipesan dari link meja (?meja=<kode>): "Kembali" membuka link meja yang sama.
  const [tableCode, setTableCode] = useState<string | null>(null);

  useEffect(() => {
    setTableCode(new URLSearchParams(window.location.search).get('meja'));
    fetchPublicStorefront(slug)
      .then((sf) => {
        setTheme(sf.themeColor);
        setStoreName(sf.store.name);
      })
      .catch(() => undefined);
    const load = () =>
      fetchPublicOrder(slug, orderId)
        .then(setOrder)
        .catch(() => setError(true));
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [slug, orderId]);

  if (error) return <p className="p-10 text-center text-ink-2">Pesanan tidak ditemukan.</p>;
  if (!order) return <LoadingBlock label="Memuat pesanan…" />;

  const cancelled = order.status === 'CANCELLED';
  const reached = STEPS.findIndex((s) => s.status === order.status);

  return (
    <div style={themeStyle(theme)} className="min-h-dvh bg-[#F7F8FB] px-4 py-8">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl bg-[linear-gradient(135deg,#0B1F33_0%,var(--sf)_100%)] p-6 text-white shadow-lg">
          <p className="text-sm text-white/75">{storeName}</p>
          <p className="mt-1 text-2xl font-extrabold">{cancelled ? 'Pesanan dibatalkan' : 'Terima kasih! 🎉'}</p>
          <p className="mt-1 text-sm text-white/80">No. pesanan {order.orderNumber}</p>
        </div>

        {!cancelled ? (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            {STEPS.map((step, i) => {
              const done = i <= reached;
              return (
                <div key={step.status} className="flex items-start gap-3 pb-4 last:pb-0">
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full border-2',
                      done ? 'border-[var(--sf)] bg-[var(--sf)] text-white' : 'border-gray-200 text-transparent',
                    )}
                  >
                    <CheckIcon size={14} />
                  </span>
                  <p className={cn('pt-0.5 text-sm', done ? 'font-semibold text-ink' : 'text-ink-3', i === reached && 'text-[var(--sf)]')}>{step.label}</p>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 py-1.5 text-sm">
              <span className="text-ink">
                {Number(item.quantity)}× {item.productName}
                {item.notes ? <span className="block text-[12px] text-ink-3">“{item.notes}”</span> : null}
              </span>
              <span className="font-semibold">{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-gray-100 pt-3">
            <span className="text-ink-2">Total</span>
            <span className="text-lg font-extrabold">{formatRupiah(order.subtotal)}</span>
          </div>
        </div>
        <Link href={tableCode ? `/toko/${slug}/${encodeURIComponent(tableCode)}` : `/toko/${slug}`} className="block text-center font-semibold text-[var(--sf)]">
          {tableCode ? '← Pesan lagi' : '← Kembali ke toko'}
        </Link>
      </div>
    </div>
  );
}
