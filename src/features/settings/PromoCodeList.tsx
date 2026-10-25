'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import * as promoApi from '@/api/promoCodesApi';
import { apiErrorMessage } from '@/api/errors';
import type { PromoCode } from '@/types/models';
import { Alert } from '@/lib/alert';
import { useMenuAccess } from '@/navigation/menu';
import { Badge, EmptyState } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Field';
import { LoadingBlock } from '@/components/ui/Spinner';
import { DiscountIcon, PlusIcon } from '@/components/icons/LineIcons';
import { promoStatus, promoSummary, shortDate } from './promoUtils';

/** Kode promo toko dengan status, pemakaian, dan saklar aktif; klik kartu untuk mengubah. */
export function PromoCodeList() {
  const router = useRouter();
  const { isManager } = useMenuAccess();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPromos(await promoApi.fetchPromoCodes());
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Kode promo gagal dimuat.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isManager) load();
  }, [isManager, load]);

  const toggleActive = async (promo: PromoCode, active: boolean) => {
    setPromos((prev) => prev.map((p) => (p.id === promo.id ? { ...p, active } : p)));
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, usedCount: _used, ...payload } = promo;
      await promoApi.updatePromoCode(promo.id, { ...payload, active });
    } catch (error) {
      setPromos((prev) => prev.map((p) => (p.id === promo.id ? promo : p)));
      Alert.alert('Gagal', apiErrorMessage(error, 'Status promo tidak bisa diubah.'));
    }
  };

  if (!isManager) {
    return (
      <EmptyState
        icon={DiscountIcon}
        title="Khusus pemilik toko"
        description="Kode promo dibuat dan dikelola oleh pemilik / Kepala Toko. Kasir cukup memasukkan kodenya saat pembayaran."
      />
    );
  }

  return (
    <div className="space-y-3">
      <Button leftIcon={<PlusIcon size={16} />} onClick={() => router.push('/promo-codes/new')}>
        Buat Kode Promo
      </Button>
      {promos.length === 0 ? (
        loading ? (
          <LoadingBlock />
        ) : (
          <EmptyState icon={DiscountIcon} title="Belum ada kode promo" description="Buat kode promo, misalnya HEMAT10 untuk diskon 10%, lalu bagikan ke pelanggan." />
        )
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {promos.map((item) => {
            const status = promoStatus(item);
            return (
              <div
                key={item.id}
                onClick={() => router.push(`/promo-codes/${item.id}`)}
                className="cursor-pointer rounded-xl border border-line bg-white p-4 transition hover:border-primary-200 hover:shadow-card"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-sm border border-dashed border-primary-300 bg-primary-50 px-2 py-1 font-bold tracking-wider text-primary-700">
                    <DiscountIcon size={14} className="text-primary-600" /> {item.code}
                  </span>
                  <Badge variant={status.tone}>{status.label}</Badge>
                  <span className="flex-1" />
                  <span onClick={(e) => e.stopPropagation()}>
                    <Switch value={item.active} onChange={(v) => toggleActive(item, v)} label={`Aktifkan ${item.code}`} />
                  </span>
                </div>
                <p className="font-semibold text-ink">{item.name}</p>
                <p className="text-sm text-ink-2">{promoSummary(item)}</p>
                <div className="mt-2 flex justify-between text-[12.5px] text-ink-3">
                  <span>
                    Dipakai {item.usedCount}
                    {item.usageLimit !== null ? ` / ${item.usageLimit}` : ''} kali
                  </span>
                  <span>{item.endsAt ? `s.d. ${shortDate(item.endsAt)}` : 'Tanpa batas waktu'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
