'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Product } from '@/types/models';
import * as bundlesApi from '@/services/bundlesApi';
import { Alert } from '@/lib/alert';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { apiErrorMessage } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { formatRupiah } from '@/utils/format';
import { EmptyState } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { BoxIcon } from '@/components/ui/icons/NavIcons';
import { PlusIcon, ChevronRightIcon } from '@/components/ui/icons/ActionIcons';

/** Paket toko dengan isi, harga, dan berapa yang masih bisa dijual. Khusus Kepala Toko. */
export function BundleList() {
  const router = useRouter();
  const { isManager } = useMenuAccess();
  const [bundles, setBundles] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBundles(await bundlesApi.fetchBundles());
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Paket gagal dimuat.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isManager) load();
  }, [isManager, load]);

  if (!isManager) {
    return (
      <EmptyState
        icon={BoxIcon}
        title="Khusus Kepala Toko"
        description="Paket bundling dibuat dan diatur oleh Kepala Toko. Kasir cukup menjual paketnya dari layar Kasir."
      />
    );
  }

  return (
    <div className="space-y-3">
      <Button leftIcon={<PlusIcon size={16} />} onClick={() => router.push('/bundles/new')}>
        Buat Paket Baru
      </Button>
      {bundles.length === 0 ? (
        loading ? (
          <LoadingBlock />
        ) : (
          <EmptyState icon={BoxIcon} title="Belum ada paket" description="Gabungkan beberapa produk jadi satu paket dengan harga khusus, mis. Paket Sarapan = Roti + Susu." />
        )
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {bundles.map((item) => {
            const items = item.bundleItems ?? [];
            const soldOut = item.stockQuantity <= 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(`/bundles/${item.id}`)}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-3.5 text-left transition hover:border-primary-200 hover:shadow-card"
              >
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-warning-50 text-2xl">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    '🎁'
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-ink">{item.productName}</span>
                  <span className="line-clamp-2 block text-[12.5px] text-ink-2">
                    {items.map((i) => `${Number(i.quantity)} ${i.unitName} ${i.productName}`).join(' · ') || 'Belum ada isi'}
                  </span>
                  <span className="mt-1 flex items-center justify-between">
                    <span className="font-bold text-primary-700">{formatRupiah(item.sellingPrice)}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[12px] font-semibold',
                        soldOut ? 'bg-error-50 text-error-600' : 'bg-success-50 text-success-700',
                      )}
                    >
                      {soldOut ? 'Isi habis' : `Bisa dijual ${item.stockQuantity}`}
                    </span>
                  </span>
                </span>
                <ChevronRightIcon size={18} className="text-gray-400" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
