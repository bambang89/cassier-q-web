'use client';

import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { StoreProfileForm } from '@/features/account/components/StoreProfileForm';

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
