'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import type { PromoCode } from '@/types/models';
import * as promoApi from '@/services/promoCodesApi';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingBlock } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/Display';
import { DiscountIcon } from '@/components/ui/icons/DataIcons';
import { PromoCodeForm } from '@/features/settings/components/PromoCodeForm';

export default function PromoCodeEditPage() {
  const { promoId } = useParams<{ promoId: string }>();
  const [promo, setPromo] = useState<PromoCode | null | undefined>(undefined);

  useEffect(() => {
    if (promoId === 'new') return;
    promoApi
      .fetchPromoCodes()
      .then((list) => setPromo(list.find((p) => p.id === promoId) ?? null))
      .catch(() => setPromo(null));
  }, [promoId]);

  if (promoId === 'new') return <PromoCodeForm />;
  if (promo) return <PromoCodeForm editing={promo} />;
  return (
    <>
      <PageHeader title="Ubah Kode Promo" backHref="/promo-codes" />
      {promo === undefined ? <LoadingBlock /> : <EmptyState icon={DiscountIcon} title="Kode promo tidak ditemukan" />}
    </>
  );
}
