'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { Order, Receipt } from '@/types/models';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearReceipt, fetchOrders, fetchReceipt } from '@/store/slices/ordersSlice';
import { usePermissions } from '@/hooks/usePermissions';
import { paymentMethodLabel } from '@/utils/receiptText';
import { cn } from '@/lib/cn';
import { useIsWide } from '@/lib/useMedia';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { InfoCell, SplitItem, SplitView } from '@/components/layout/SplitView';
import { Modal } from '@/components/ui/Modal';
import { Badge, Chip, EmptyState } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { PrintIcon, ReceiptIcon, RefundIcon } from '@/components/icons/LineIcons';
import { STATUS_VARIANT, VoidForm, dateTimeLabel, money, statusLabel, timeLabel } from '@/features/orders/orderUi';

type StatusFilter = 'ALL' | 'PAID' | 'VOID';
const FILTERS: { label: string; value: StatusFilter }[] = [
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

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
                  amount={money(item.grandTotal)}
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
                        {money(item.grandTotal)}
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

function OrderDetailPane({
  order,
  receipt,
  loading,
  onRefund,
}: {
  order: Order | null;
  receipt: Receipt | null;
  loading: boolean;
  onRefund: () => void;
}) {
  const { can } = usePermissions();
  if (!order) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-ink-3">
        <ReceiptIcon size={28} />
        <p>Pilih transaksi di daftar untuk melihat detail.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px] p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-bold text-gray-900">#{order.transactionNumber}</p>
          <p className="mt-0.5 text-[13px] text-gray-500">{dateTimeLabel(order.transactionDate)}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status] ?? 'neutral'}>{statusLabel(order.status)}</Badge>
      </div>

      {loading || !receipt ? (
        <LoadingBlock label="Memuat detail transaksi..." />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl border border-gray-150 bg-white p-5 shadow-card lg:grid-cols-4">
            <InfoCell label="Pelanggan" value={receipt.customerName ?? 'Umum'} />
            <InfoCell label="Kasir" value={receipt.cashierName} />
            <InfoCell label="Pembayaran" value={paymentMethodLabel(receipt.paymentMethod)} />
            <InfoCell label="Outlet" value={receipt.storeName ?? '-'} />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-150 bg-white shadow-card">
            <p className="px-5 pt-4 pb-3 text-[15px] font-bold text-gray-900">Item Pesanan</p>
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="bg-gray-50 text-left text-[11.5px] font-semibold tracking-wide text-gray-500 uppercase">
                  <th className="px-5 py-2 font-semibold">Produk</th>
                  <th className="w-20 px-3 py-2 text-center font-semibold">Qty</th>
                  <th className="w-36 px-5 py-2 text-right font-semibold">Harga</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, index) => (
                  <tr key={`${item.productName}-${index}`} className="border-t border-gray-100">
                    <td className="px-5 py-3 font-semibold text-gray-900">{item.productName}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-gray-900">{money(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1.5 border-t border-dashed border-gray-200 px-5 py-4 text-[13.5px]">
              <Row label="Subtotal" value={money(receipt.subtotal)} />
              {receipt.discountAmount > 0 ? <Row label="Diskon" value={`− ${money(receipt.discountAmount)}`} valueClass="text-success-600" /> : null}
              {receipt.taxAmount > 0 ? <Row label="Pajak" value={money(receipt.taxAmount)} /> : null}
              <div className="flex items-center justify-between border-t border-gray-150 pt-3">
                <span className="text-[15px] font-bold text-gray-900">Total</span>
                <span className="text-xl font-extrabold text-gray-900">{money(receipt.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2.5">
            <Link
              href={`/orders/${order.id}/receipt`}
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <PrintIcon size={15} /> Cetak Ulang
            </Link>
            {order.status === 'PAID' && can('orders.void') ? (
              <button
                type="button"
                onClick={onRefund}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-error-100 bg-white px-4 py-2.5 text-[13px] font-semibold text-error-600 shadow-sm hover:bg-error-50"
              >
                <RefundIcon size={15} /> Refund
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value, valueClass = 'text-gray-900' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={cn('font-semibold', valueClass)}>{value}</span>
    </div>
  );
}
