'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { fetchPurchaseOrders } from '@/lib/store/slices/purchaseOrdersSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { usePermissions } from '@/hooks/usePermissions';
import { poStatusMeta } from '@/utils/purchaseOrders';
import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge, EmptyState, KpiCard } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { BoxIcon } from '@/components/ui/icons/NavIcons';
import { PlusIcon } from '@/components/ui/icons/ActionIcons';

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const dispatch = useAppDispatch();
  const { items, page, totalPages, totalElements, status } = useAppSelector((state) => state.purchaseOrders);

  useEffect(() => {
    dispatch(fetchPurchaseOrders({ page: 0 }));
  }, [dispatch]);

  const open = (id: string) => router.push(`/purchase-orders/${id}`);
  const totalValue = items.reduce((sum, po) => sum + po.totalCost, 0);
  const waiting = items.filter((po) => poStatusMeta(po).label === 'Menunggu Diterima').length;

  return (
    <>
      <PageHeader
        title="Purchase Order"
        subtitle="Pembelian stok ke supplier"
        right={
          can('purchase_orders.create') ? (
            <Button size="sm" leftIcon={<PlusIcon size={14} />} onClick={() => router.push('/purchase-orders/new')}>
              Buat PO
            </Button>
          ) : undefined
        }
      />
      <PageBody className="space-y-4">
        {totalElements > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard icon={BoxIcon} iconClass="bg-primary-50 text-primary-600" label="Total PO" value={totalElements.toLocaleString('id-ID')} />
            <KpiCard icon={BoxIcon} iconClass="bg-warning-50 text-warning-600" label="Menunggu diterima (termuat)" value={String(waiting)} className="hidden sm:block" />
            <KpiCard icon={BoxIcon} iconClass="bg-success-50 text-success-600" label="Nilai pembelian (termuat)" value={`Rp ${totalValue.toLocaleString('id-ID')}`} className="hidden sm:block" />
          </div>
        ) : null}

        {items.length === 0 ? (
          status === 'loading' ? (
            <LoadingBlock label="Memuat purchase order..." />
          ) : (
            <EmptyState
              icon={BoxIcon}
              title="Belum Ada Purchase Order"
              description="Buat PO ke pemasok untuk mencatat pembelian barang dagangan secara rapi, lengkap dengan status penerimaannya."
              actionLabel={can('purchase_orders.create') ? '+ Buat PO' : undefined}
              onAction={can('purchase_orders.create') ? () => router.push('/purchase-orders/new') : undefined}
            />
          )
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-line bg-white shadow-card tab:block">
              <table className="w-full text-[13.5px]">
                <thead className="bg-gray-50 text-left text-[11.5px] font-semibold tracking-wide text-gray-500 uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">No. PO</th>
                    <th className="px-3 py-3 font-semibold">Pemasok</th>
                    <th className="px-3 py-3 font-semibold">Tanggal</th>
                    <th className="px-3 py-3 text-right font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((po) => {
                    const meta = poStatusMeta(po);
                    return (
                      <tr key={po.id} onClick={() => open(po.id)} className="cursor-pointer border-t border-gray-100 hover:bg-gray-25">
                        <td className="px-5 py-3 font-semibold text-primary-700">{po.poNumber}</td>
                        <td className="px-3 py-3 text-ink">{po.supplierName}</td>
                        <td className="px-3 py-3 text-ink-2">{new Date(po.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-3 py-3 text-right font-bold text-ink">Rp {po.totalCost.toLocaleString('id-ID')}</td>
                        <td className="px-5 py-3">
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="space-y-2.5 tab:hidden">
              {items.map((po) => {
                const meta = poStatusMeta(po);
                return (
                  <button key={po.id} type="button" onClick={() => open(po.id)} className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-3.5 text-left">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{po.poNumber}</span>
                      <span className="block truncate text-[12.5px] text-ink-2">
                        {po.supplierName} · {new Date(po.orderDate).toLocaleDateString('id-ID')}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className="font-bold text-ink">Rp {po.totalCost.toLocaleString('id-ID')}</span>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </span>
                  </button>
                );
              })}
            </div>
            {page + 1 < totalPages ? (
              <div className="flex justify-center">
                <Button variant="secondary" size="sm" loading={status === 'loading'} onClick={() => dispatch(fetchPurchaseOrders({ page: page + 1 }))}>
                  Muat lebih banyak
                </Button>
              </div>
            ) : null}
          </>
        )}
      </PageBody>
    </>
  );
}
