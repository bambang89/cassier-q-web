'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCurrentOrder, fetchOrder } from '@/store/slices/ordersSlice';
import { usePermissions } from '@/hooks/usePermissions';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { Badge, Card } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { STATUS_VARIANT, VoidForm, dateTimeLabel, money, statusLabel } from '@/features/orders/orderUi';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { can } = usePermissions();
  const order = useAppSelector((state) => state.orders.current);
  const currentStatus = useAppSelector((state) => state.orders.currentStatus);
  const [voidVisible, setVoidVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchOrder(orderId));
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderId]);

  return (
    <>
      <PageHeader title={order?.transactionNumber ?? 'Detail Transaksi'} backHref="/orders" />
      <PageBody>
        {currentStatus === 'loading' || !order ? (
          <LoadingBlock />
        ) : (
          <div className="mx-auto max-w-[640px] animate-fade-in">
            <Card padding="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink-2">{dateTimeLabel(order.transactionDate)}</p>
                <Badge variant={STATUS_VARIANT[order.status] ?? 'neutral'}>{statusLabel(order.status)}</Badge>
              </div>
              <p className="mt-1 text-[13px] text-ink-3">Kasir: {order.cashierName}</p>
              <hr className="my-4 border-line" />
              {order.items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex items-start justify-between gap-3 py-2">
                  <div>
                    <p className="font-medium text-ink">{item.productName}</p>
                    <p className="text-[13px] text-ink-2">
                      {item.quantity} {item.unitName} × {money(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold text-ink">{money(item.subtotal)}</p>
                </div>
              ))}
              <hr className="my-4 border-line" />
              <div className="space-y-1.5">
                <SummaryRow label="Subtotal" value={order.subtotal} />
                {order.discountAmount > 0 ? <SummaryRow label="Diskon" value={-order.discountAmount} /> : null}
                {order.taxAmount > 0 ? <SummaryRow label="Pajak" value={order.taxAmount} /> : null}
                <SummaryRow label="Total" value={order.grandTotal} bold />
                <SummaryRow label="Dibayar" value={order.paymentAmount} />
                <SummaryRow label="Kembalian" value={order.changeAmount} />
              </div>
              {order.voidReason ? <p className="mt-4 rounded-lg bg-error-50 p-3 text-sm text-error-600">Dibatalkan: {order.voidReason}</p> : null}
            </Card>
            <Button variant="outline" fullWidth className="mt-4" onClick={() => router.push(`/orders/${order.id}/receipt`)}>
              Cetak Ulang Struk
            </Button>
            {order.status === 'PAID' && can('orders.void') ? (
              <Button variant="danger" fullWidth className="mt-2.5" onClick={() => setVoidVisible(true)}>
                Batalkan Transaksi
              </Button>
            ) : null}
          </div>
        )}
      </PageBody>

      <Modal isOpen={voidVisible} onClose={() => setVoidVisible(false)} size="sm">
        <VoidForm
          orderId={orderId}
          onDone={() => {
            setVoidVisible(false);
            dispatch(fetchOrder(orderId));
          }}
          onCancel={() => setVoidVisible(false)}
        />
      </Modal>
    </>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'font-semibold text-ink-2' : 'text-ink-2'}>{label}</span>
      <span className={bold ? 'text-lg font-bold text-ink' : 'font-medium text-ink'}>
        {value < 0 ? `− ${money(-value)}` : money(value)}
      </span>
    </div>
  );
}
