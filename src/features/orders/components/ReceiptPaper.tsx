import type { Receipt } from '@/types/models';
import { paymentMethodLabel } from '@/utils/receiptText';
import { formatRupiah } from '@/utils/format';

/** Pratinjau struk monokrom yang mudah dibaca — ikut tercetak lewat window.print(). */
export function ReceiptPaper({ receipt }: { receipt: Receipt }) {
  const isVoid = receipt.status === 'VOID';
  const itemCount = receipt.items.reduce((sum, item) => sum + item.quantity, 0);
  const date = new Date(receipt.transactionDate).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative bg-white px-5 pt-6 pb-8 text-gray-900 shadow-lg print:shadow-none">
      <div className="text-center">
        <p className="text-[19px] font-bold">{receipt.storeName ?? 'cassier-Q'}</p>
        {receipt.storeAddress ? <p className="text-[12.5px]">{receipt.storeAddress}</p> : null}
        {receipt.storePhone ? <p className="text-[12.5px]">Telp. {receipt.storePhone}</p> : null}
      </div>
      {isVoid ? (
        <p className="mt-3 rounded-sm border border-gray-900 py-1 text-center text-[12px] font-bold">TRANSAKSI DIBATALKAN</p>
      ) : null}
      <Dashed />
      <div className="space-y-0.5">
        <Pair label="No. Transaksi" value={receipt.transactionNumber} size="text-[12.5px]" />
        <Pair label="Tanggal" value={date} size="text-[12.5px]" />
        <Pair label="Kasir" value={receipt.cashierName} size="text-[12.5px]" />
        {receipt.customerName ? <Pair label="Pelanggan" value={receipt.customerName} size="text-[12.5px]" /> : null}
      </div>
      <Dashed />
      <p className="mb-2 text-[11.5px] font-semibold tracking-wider">
        {receipt.items.length} PRODUK · {itemCount} ITEM
      </p>
      <div className="space-y-2">
        {receipt.items.map((item, index) => (
          <div key={`${item.productName}-${index}`}>
            <p className="text-sm font-semibold">{item.productName}</p>
            <Pair label={`${item.quantity} ${item.unitName} × ${formatRupiah(item.unitPrice, true)}`} value={formatRupiah(item.subtotal, true)} />
          </div>
        ))}
      </div>
      <Dashed />
      <div className="space-y-0.5">
        <Pair label="Subtotal" value={formatRupiah(receipt.subtotal, true)} />
        {receipt.discountAmount > 0 ? <Pair label="Diskon" value={`-${formatRupiah(receipt.discountAmount, true)}`} /> : null}
        {receipt.taxAmount > 0 ? <Pair label="Pajak" value={formatRupiah(receipt.taxAmount, true)} /> : null}
      </div>
      <div className="my-2 border-y border-gray-900 py-2">
        <Pair label="TOTAL" value={formatRupiah(receipt.grandTotal, true)} size="text-base" bold />
      </div>
      <div className="space-y-0.5">
        <Pair label={`Bayar (${paymentMethodLabel(receipt.paymentMethod)})`} value={formatRupiah(receipt.paymentAmount, true)} />
        <Pair label="Kembalian" value={formatRupiah(receipt.changeAmount, true)} />
        {receipt.debtAmount && receipt.debtAmount > 0 ? <Pair label="Sisa Utang" value={formatRupiah(receipt.debtAmount, true)} /> : null}
      </div>
      <Dashed />
      <p className="text-center text-sm font-semibold">{isVoid ? 'Struk ini tidak berlaku' : 'Terima kasih!'}</p>
    </div>
  );
}

export function Pair({ label, value, size = 'text-[13px]', bold }: { label: string; value: string; size?: string; bold?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 ${size}`}>
      <span className={bold ? 'font-bold' : ''}>{label}</span>
      <span className={`text-right ${bold ? 'font-bold' : 'font-semibold'}`}>{value}</span>
    </div>
  );
}

export function Dashed() {
  return <div className="my-3 border-t border-dashed border-gray-400" />;
}
