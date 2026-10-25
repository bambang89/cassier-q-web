'use client';

import Link from 'next/link';

import type { Receipt, Order } from '@/types/models';
import { usePermissions } from '@/hooks/usePermissions';
import { formatRupiah } from '@/utils/format';
import { dateTimeLabel } from '@/utils/date';
import { paymentMethodLabel } from '@/utils/receiptText';
import { Badge } from '@/components/ui/Display';
import { InfoCell } from '@/components/common/SplitView';
import { LoadingBlock } from '@/components/ui/Spinner';
import { SummaryRow } from '@/components/ui/SummaryRow';
import { ReceiptIcon } from '@/components/ui/icons/NavIcons';
import { PrintIcon, RefundIcon } from '@/components/ui/icons/ActionIcons';
import { STATUS_VARIANT, statusLabel } from '@/features/orders/utils';

export function OrderDetailPane({
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
                    <td className="px-5 py-3 text-right text-gray-900">{formatRupiah(item.subtotal, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1.5 border-t border-dashed border-gray-200 px-5 py-4 text-[13.5px]">
              <SummaryRow label="Subtotal" value={formatRupiah(receipt.subtotal, true)} />
              {receipt.discountAmount > 0 ? <SummaryRow label="Diskon" value={`− ${formatRupiah(receipt.discountAmount, true)}`} valueClass="text-success-600" /> : null}
              {receipt.taxAmount > 0 ? <SummaryRow label="Pajak" value={formatRupiah(receipt.taxAmount, true)} /> : null}
              <div className="flex items-center justify-between border-t border-gray-150 pt-3">
                <span className="text-[15px] font-bold text-gray-900">Total</span>
                <span className="text-xl font-extrabold text-gray-900">{formatRupiah(receipt.grandTotal, true)}</span>
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
