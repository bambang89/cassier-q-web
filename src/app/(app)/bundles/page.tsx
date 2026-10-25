'use client';

import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { BundleList } from '@/features/settings/BundleList';

export default function BundlesPage() {
  return (
    <>
      <PageHeader title="Paket Bundling" subtitle="Gabung produk, harga khusus" backHref="/settings" />
      <PageBody>
        <BundleList />
      </PageBody>
    </>
  );
}
