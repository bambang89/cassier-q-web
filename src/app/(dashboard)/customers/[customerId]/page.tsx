'use client';

import { useParams } from 'next/navigation';

import { useAppSelector } from '@/hooks/store';
import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { CustomerDetailContent } from '@/features/customers/components/CustomerDetailContent';

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
