'use client';

import type { CustomerOrder, CustomerOrderStatus } from '@/types/storefront';
import { formatRupiah } from '@/utils/format';
import { cn } from '@/utils/cn';
import { timeAgo } from '@/utils/date';
import { Badge } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { itemSummary, FULFILLMENT_LABEL, nextAction, STATUS_META } from '@/features/customer-orders/utils';

export function OrderCard({
  order,
  canProcess,
  busy,
  paying,
  onOpen,
  onAdvance,
  onPay,
}: {
  order: CustomerOrder;
  canProcess: boolean;
  busy: boolean;
  paying: boolean;
  onOpen: () => void;
  onAdvance: (status: CustomerOrderStatus) => void;
  onPay: () => void;
}) {
  const meta = STATUS_META[order.status];
  const next = nextAction(order.status);
  const isNew = order.status === 'NEW';
  return (
    <div
      onClick={onOpen}
      className={cn(
        'cursor-pointer animate-fade-in rounded-xl border bg-white p-4 shadow-card transition hover:shadow-md',
        isNew ? 'border-error-200 ring-2 ring-error-100' : 'border-line',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{order.customerName}</p>
          <p className="text-[12.5px] text-ink-3">
            {order.orderNumber} · {timeAgo(order.createdAt)}
          </p>
        </div>
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-ink-2">{itemSummary(order)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-ink-2">{FULFILLMENT_LABEL[order.fulfillment]}</span>
        {order.tableLabel ? <span className="rounded-full bg-primary-50 px-2 py-0.5 text-primary-700">Meja {order.tableLabel}</span> : null}
        <span className="ml-auto text-sm font-bold text-ink">{formatRupiah(order.subtotal, true)}</span>
      </div>
      {['NEW', 'ACCEPTED', 'IN_PROGRESS', 'READY'].includes(order.status) ? (
        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {next && canProcess ? (
            <Button size="sm" variant={isNew ? 'solid' : 'secondary'} className="flex-1" loading={busy} onClick={() => onAdvance(next.status)}>
              {next.label}
            </Button>
          ) : null}
          <Button size="sm" variant={order.status === 'READY' ? 'success' : 'outline'} className="flex-1" loading={paying} onClick={onPay}>
            Bayar di Kasir
          </Button>
        </div>
      ) : null}
    </div>
  );
}
