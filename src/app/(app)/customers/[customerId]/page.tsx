'use client';

import { useParams } from 'next/navigation';

import { useAppSelector } from '@/store/hooks';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { CustomerDetailContent } from '@/features/customers/CustomerDetailContent';

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const customer = useAppSelector((state) => state.customers.items.find((c) => c.id === customerId));
  return (
    <>
      <PageHeader title={customer?.name ?? 'Pelanggan'} backHref="/customers" />
      <PageBody>
        <CustomerDetailContent customerId={customerId} />
      </PageBody>
    </>
  );
}
