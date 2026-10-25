'use client';

import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { CheckoutSettingsForm } from '@/features/settings/components/CheckoutSettingsForm';

export default function CheckoutSettingsPage() {
  return (
    <>
      <PageHeader title="Pembayaran & PPN" subtitle="Metode bayar, default & pajak" backHref="/settings" />
      <PageBody>
        <CheckoutSettingsForm />
      </PageBody>
    </>
  );
}
