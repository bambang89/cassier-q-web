'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import * as bundlesApi from '@/api/bundlesApi';
import type { Product } from '@/types/models';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingBlock } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/Display';
import { BoxIcon } from '@/components/icons/LineIcons';
import { BundleForm } from '@/features/settings/BundleForm';

export default function BundleEditPage() {
  const { bundleId } = useParams<{ bundleId: string }>();
  const [bundle, setBundle] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    if (bundleId === 'new') return;
    bundlesApi
      .fetchBundles()
      .then((list) => setBundle(list.find((b) => b.id === bundleId) ?? null))
      .catch(() => setBundle(null));
  }, [bundleId]);

  if (bundleId === 'new') return <BundleForm />;
  if (bundle) return <BundleForm editing={bundle} />;
  return (
    <>
      <PageHeader title="Ubah Paket" backHref="/bundles" />
      {bundle === undefined ? <LoadingBlock /> : <EmptyState icon={BoxIcon} title="Paket tidak ditemukan" />}
    </>
  );
}
