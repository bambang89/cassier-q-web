'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { clearReceipt, fetchOrders, fetchReceipt } from '@/lib/store/slices/ordersSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { useIsWide } from '@/hooks/useMedia';
import { cn } from '@/utils/cn';
import { formatRupiah } from '@/utils/format';
import { timeLabel } from '@/utils/date';
import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { SplitItem, SplitView } from '@/components/common/SplitView';
import { Modal } from '@/components/ui/Modal';
import { Badge, Chip, EmptyState } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ReceiptIcon } from '@/components/ui/icons/NavIcons';
import { RefundIcon } from '@/components/ui/icons/ActionIcons';
import { VoidForm } from '@/features/orders/components/OrderUi';
import type { OrderStatusFilter } from '@/features/orders/types';
import { STATUS_VARIANT, statusLabel } from '@/features/orders/utils';
import { OrderDetailPane } from '@/features/orders/components/OrderDetailPane';

const FILTERS: { label: string; value: OrderStatusFilter }[] = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Lunas', value: 'PAID' },
  { label: 'Dibatalkan', value: 'VOID' },
];

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isWide = useIsWide();
  const { items, page, totalPages, totalElements, status } = useAppSelector((state) => state.orders);
  const receipt = useAppSelector((state) => state.orders.receipt);
  const receiptStatus = useAppSelector((state) => state.orders.receiptStatus);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [voidVisible, setVoidVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('ALL');

  useEffect(() => {
    dispatch(fetchOrders({ page: 0 }));
  }, [dispatch]);

  useEffect(() => {
    if (isWide && !selectedOrderId && items.length > 0) setSelectedOrderId(items[0].id);
  }, [isWide, items, selectedOrderId]);

  useEffect(() => {
    if (!isWide || !selectedOrderId) return;
    dispatch(fetchReceipt(selectedOrderId));
    return () => {
      dispatch(clearReceipt());
    };
  }, [dispatch, isWide, selectedOrderId]);

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter(
      (item) =>
        (statusFilter === 'ALL' || item.status === statusFilter) &&
        (!q || item.transactionNumber.toLowerCase().includes(q)),
    );
  }, [items, searchQuery, statusFilter]);

  const canLoadMore = page + 1 < totalPages;
  const loadMore = () => {
    if (status !== 'loading' && canLoadMore) dispatch(fetchOrders({ page: page + 1 }));
  };
  const loadMoreButton = canLoadMore ? (
    <div className="p-3">
      <Button variant="secondary" size="sm" fullWidth loading={status === 'loading'} onClick={loadMore}>
        Muat lebih banyak
      </Button>
    </div>
  ) : null;

  const empty =
    status === 'loading' ? (
      <LoadingBlock label="Memuat transaksi..." />
    ) : (
      <EmptyState
        icon={ReceiptIcon}
        title={statusFilter === 'ALL' && !searchQuery ? 'Belum Ada Transaksi' : 'Tidak ada transaksi'}
        description={
          statusFilter === 'ALL' && !searchQuery
            ? 'Riwayat penjualan bakal muncul di sini setelah kamu mencatat transaksi pertama di kasir.'
            : 'Tidak ada transaksi yang cocok dengan filter ini.'
        }
      />
    );

  return (
    <>
      <PageHeader title="Transaksi" subtitle={`${totalElements.toLocaleString('id-ID')} transaksi tercatat`} />

      {isWide ? (
        <SplitView
          detailKey={selectedOrderId}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nomor transaksi"
          listHeader={
            <div className="flex gap-1.5 border-b border-gray-150 px-3.5 py-2.5">
              {FILTERS.map((f) => (
                <Chip key={f.value} active={statusFilter === f.value} onClick={() => setStatusFilter(f.value)}>
                  {f.label}
                </Chip>
              ))}
            </div>
          }
          listFooter={loadMoreButton}
          detail={
            <OrderDetailPane
              order={items.find((o) => o.id === selectedOrderId) ?? null}
              receipt={receiptStatus === 'succeeded' ? receipt : null}
              loading={receiptStatus === 'loading'}
              onRefund={() => setVoidVisible(true)}
            />
          }
        >
          {visibleItems.length === 0
            ? empty
            : visibleItems.map((item) => (
                <SplitItem
                  key={item.id}
                  active={item.id === selectedOrderId}
                  onClick={() => setSelectedOrderId(item.id)}
                  title={item.transactionNumber}
                  amount={formatRupiah(item.grandTotal, true)}
                  meta={
                    <span className="flex items-center justify-between gap-2">
                      <span>{`${timeLabel(item.transactionDate)} · ${item.cashierName}`}</span>
                      <Badge variant={STATUS_VARIANT[item.status] ?? 'neutral'}>{statusLabel(item.status)}</Badge>
                    </span>
                  }
                />
              ))}
        </SplitView>
      ) : (
        <PageBody>
          <div className="no-scrollbar -mx-5 mb-3 flex gap-2 overflow-x-auto px-5">
            {FILTERS.map((f) => (
              <Chip key={f.value} active={statusFilter === f.value} onClick={() => setStatusFilter(f.value)}>
                {f.label}
              </Chip>
            ))}
          </div>
          {visibleItems.length === 0 ? (
            empty
          ) : (
            <div className="space-y-2.5">
              {visibleItems.map((item, index) => {
                const isVoid = item.status === 'VOID';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(`/orders/${item.id}`)}
                    style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
                    className="flex w-full animate-fade-in cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-3.5 text-left shadow-card active:scale-[0.98]"
                  >
                    <span
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-lg',
                        isVoid ? 'bg-error-50 text-error-600' : 'bg-primary-50 text-primary-600',
                      )}
                    >
                      {isVoid ? <RefundIcon size={18} /> : <ReceiptIcon size={18} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{`#${item.transactionNumber.split('-').pop()}`}</span>
                      <span className="block truncate text-[12.5px] text-ink-3">
                        {`${timeLabel(item.transactionDate)} · ${item.items.length} item · ${item.cashierName}`}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className={cn('text-sm font-bold', isVoid ? 'text-ink-3 line-through' : 'text-ink')}>
                        {formatRupiah(item.grandTotal, true)}
                      </span>
                      <Badge variant={STATUS_VARIANT[item.status] ?? 'neutral'}>{statusLabel(item.status)}</Badge>
                    </span>
                  </button>
                );
              })}
              {loadMoreButton}
            </div>
          )}
        </PageBody>
      )}

      <Modal isOpen={voidVisible} onClose={() => setVoidVisible(false)} size="sm">
        {selectedOrderId ? (
          <VoidForm
            orderId={selectedOrderId}
            onDone={() => {
              setVoidVisible(false);
              dispatch(fetchOrders({ page: 0 }));
              dispatch(fetchReceipt(selectedOrderId));
            }}
            onCancel={() => setVoidVisible(false)}
          />
        ) : null}
      </Modal>
    </>
  );
}

