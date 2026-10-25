'use client';

import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { PromoCodeList } from '@/features/settings/components/PromoCodeList';

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
