'use client';

import type { CustomerOrder, CustomerOrderStatus } from '@/types/storefront';
import { formatRupiah } from '@/utils/format';
import { Badge } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { PeopleIcon } from '@/components/ui/icons/NavIcons';
import { ClockIcon, PinIcon } from '@/components/ui/icons/DataIcons';
import { FULFILLMENT_LABEL, nextAction, STATUS_META } from '@/features/customer-orders/utils';

export function OrderDetail({
  order,
  canProcess,
  busy,
  paying,
  onAdvance,
  onCancel,
  onPay,
}: {
  order: CustomerOrder;
  canProcess: boolean;
  busy: boolean;
  paying: boolean;
  onAdvance: (status: CustomerOrderStatus) => void;
  onCancel: () => void;
  onPay: () => void;
}) {
  const meta = STATUS_META[order.status];
  const next = nextAction(order.status);
  const active = ['NEW', 'ACCEPTED', 'IN_PROGRESS', 'READY'].includes(order.status);
  const wa = order.customerPhone?.replace(/\D/g, '').replace(/^0/, '62');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <span className="text-[12.5px] text-ink-3">
          {order.source === 'ONLINE' ? 'Toko online' : 'Kasir'} · {new Date(order.createdAt).toLocaleString('id-ID')}
        </span>
      </div>
      <div className="space-y-1.5 rounded-xl bg-gray-50 p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <PeopleIcon size={15} /> {order.customerName}
          {order.customerPhone ? <span className="font-normal text-ink-3">· {order.customerPhone}</span> : null}
        </p>
        <p className="flex items-center gap-2 text-ink-2">
          <ClockIcon size={15} /> {FULFILLMENT_LABEL[order.fulfillment]}
          {order.tableLabel ? ` · Meja ${order.tableLabel}` : ''}
        </p>
        {order.deliveryAddress ? (
          <p className="flex items-start gap-2 text-ink-2">
            <PinIcon size={15} className="mt-0.5 shrink-0" /> {order.deliveryAddress}
          </p>
        ) : null}
        {order.notes ? <p className="text-ink-2 italic">“{order.notes}”</p> : null}
      </div>
      <div>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-3 border-b border-gray-100 py-2 text-sm last:border-0">
            <span>
              <span className="font-semibold text-ink">
                {Number(item.quantity)}× {item.productName}
              </span>
              {item.notes ? <span className="block text-[12.5px] text-warning-700">“{item.notes}”</span> : null}
            </span>
            <span className="font-semibold">{formatRupiah(item.subtotal, true)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between">
          <span className="text-ink-2">Total</span>
          <span className="text-xl font-extrabold">{formatRupiah(order.subtotal, true)}</span>
        </div>
      </div>
      {active ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            {next && canProcess ? (
              <Button className="flex-1" loading={busy} onClick={() => onAdvance(next.status)}>
                {next.label}
              </Button>
            ) : null}
            <Button variant="success" className="flex-1" loading={paying} onClick={onPay}>
              Bayar di Kasir
            </Button>
          </div>
          <div className="flex gap-2">
            {wa ? (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex-1 rounded-lg border border-gray-200 py-2.5 text-center text-sm font-semibold text-ink">
                Hubungi via WhatsApp
              </a>
            ) : null}
            {canProcess ? (
              <Button variant="dangerOutline" className="flex-1" onClick={onCancel}>
                Batalkan
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
