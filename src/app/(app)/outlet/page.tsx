'use client';

import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { StoreProfileForm } from '@/features/account/StoreProfileForm';

export default function OutletPage() {
  return (
    <>
      <PageHeader title="Outlet" subtitle="Profil & data toko" />
      <PageBody>
        <StoreProfileForm />
      </PageBody>
    </>
  );
}
