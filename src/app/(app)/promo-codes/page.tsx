'use client';

import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { PromoCodeList } from '@/features/settings/PromoCodeList';

export default function PromoCodesPage() {
  return (
    <>
      <PageHeader title="Kode Promo" subtitle="Buat & kelola kode diskon" backHref="/settings" />
      <PageBody>
        <PromoCodeList />
      </PageBody>
    </>
  );
}
