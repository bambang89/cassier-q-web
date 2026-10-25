'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import * as promoApi from '@/api/promoCodesApi';
import type { PromoCode } from '@/types/models';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingBlock } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/Display';
import { DiscountIcon } from '@/components/icons/LineIcons';
import { PromoCodeForm } from '@/features/settings/PromoCodeForm';

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
