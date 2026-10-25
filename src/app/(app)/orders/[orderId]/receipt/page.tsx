'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import type { Receipt } from '@/types/models';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearReceipt, fetchReceipt } from '@/store/slices/ordersSlice';
import { PAPER_CHARS, getPaperWidth, savePaperWidth } from '@/services/printing/settings';
import type { PaperWidth } from '@/services/printing/settings';
import { formatReceiptText, paymentMethodLabel } from '@/utils/receiptText';
import { Alert } from '@/lib/alert';
import { formatRupiah } from '@/lib/pos';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { PaperWidthPicker } from '@/features/orders/PaperWidthPicker';
import { FolderIcon, PrintIcon } from '@/components/icons/LineIcons';

/** Lebar pratinjau di layar, kira-kira sebanding 58mm : 80mm. */
const PAPER_MAX_WIDTH: Record<PaperWidth, number> = { 58: 340, 80: 460 };

export default function ReceiptPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const receipt = useAppSelector((state) => state.orders.receipt);
  const receiptStatus = useAppSelector((state) => state.orders.receiptStatus);
  const [paperWidth, setPaperWidth] = useState<PaperWidth>(58);

  useEffect(() => {
    dispatch(fetchReceipt(orderId));
    getPaperWidth().then(setPaperWidth);
    return () => {
      dispatch(clearReceipt());
    };
  }, [dispatch, orderId]);

  const onChangePaperWidth = (width: PaperWidth) => {
    setPaperWidth(width);
    savePaperWidth(width);
  };

  const receiptText = receipt ? formatReceiptText(receipt, PAPER_CHARS[paperWidth]) : '';

  const onPrint = () => {
    // Ukuran halaman cetak mengikuti lebar kertas struk.
    const style = document.createElement('style');
    style.textContent = `@page { size: ${paperWidth}mm auto; margin: 3mm; }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => style.remove(), 500);
  };

  const onSave = () => {
    if (!receipt) return;
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `struk-${receipt.transactionNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onShare = async () => {
    if (!receipt) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Struk ${receipt.transactionNumber}`, text: receiptText });
      } else {
        await navigator.clipboard.writeText(receiptText);
        Alert.alert('Disalin', 'Teks struk sudah disalin ke clipboard.');
      }
    } catch {
      // Dibatalkan user — bukan error.
    }
  };

  const done = () => router.push('/pos');

  return (
    <>
      <PageHeader title="Struk" subtitle={receipt?.transactionNumber} backHref="/orders" />

      {!receipt ? (
        <div className="flex-1">
          {receiptStatus === 'failed' ? (
            <p className="p-10 text-center text-error-600">Struk tidak ditemukan.</p>
          ) : (
            <LoadingBlock />
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col tab:flex-row">
          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#EEF1F5,#E2E8F0)] p-5 tab:p-8">
            <div className="print-area mx-auto" style={{ maxWidth: PAPER_MAX_WIDTH[paperWidth] }}>
              <ReceiptPaper receipt={receipt} />
            </div>
          </div>

          <div className="shrink-0 border-t border-line bg-white p-5 tab:w-[340px] tab:border-t-0 tab:border-l tab:p-6">
            <div className="hidden tab:block">
              <p className={receipt.status === 'VOID' ? 'text-sm text-error-600' : 'text-sm text-ink-3'}>
                {receipt.status === 'VOID' ? 'Transaksi dibatalkan' : 'Total pembayaran'}
              </p>
              <p className="mt-1 text-[36px] leading-tight font-extrabold text-ink">{formatRupiah(receipt.grandTotal)}</p>
              <p className="mt-1 text-sm text-ink-2">
                {receipt.transactionNumber} · {paymentMethodLabel(receipt.paymentMethod)}
              </p>
              {receipt.changeAmount > 0 ? <p className="text-sm text-ink-2">Kembalian {formatRupiah(receipt.changeAmount)}</p> : null}
              <p className="mt-6 mb-2 text-sm font-semibold text-ink">Ukuran kertas</p>
            </div>
            <PaperWidthPicker value={paperWidth} onChange={onChangePaperWidth} />
            <div className="mt-4 grid grid-cols-2 gap-2 tab:grid-cols-1">
              <Button leftIcon={<PrintIcon size={16} />} onClick={onPrint}>
                Cetak Struk
              </Button>
              <Button variant="outline" leftIcon={<FolderIcon size={16} />} onClick={onSave}>
                Simpan
              </Button>
              <Button variant="outline" onClick={onShare}>
                Bagikan
              </Button>
              <Button variant="ghost" onClick={done}>
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Pair({ label, value, size = 'text-[13px]', bold }: { label: string; value: string; size?: string; bold?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 ${size}`}>
      <span className={bold ? 'font-bold' : ''}>{label}</span>
      <span className={`text-right ${bold ? 'font-bold' : 'font-semibold'}`}>{value}</span>
    </div>
  );
}

function Dashed() {
  return <div className="my-3 border-t border-dashed border-gray-400" />;
}

/** Pratinjau struk monokrom yang mudah dibaca — ikut tercetak lewat window.print(). */
function ReceiptPaper({ receipt }: { receipt: Receipt }) {
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
            <Pair label={`${item.quantity} ${item.unitName} × ${formatRupiah(item.unitPrice)}`} value={formatRupiah(item.subtotal)} />
          </div>
        ))}
      </div>
      <Dashed />
      <div className="space-y-0.5">
        <Pair label="Subtotal" value={formatRupiah(receipt.subtotal)} />
        {receipt.discountAmount > 0 ? <Pair label="Diskon" value={`-${formatRupiah(receipt.discountAmount)}`} /> : null}
        {receipt.taxAmount > 0 ? <Pair label="Pajak" value={formatRupiah(receipt.taxAmount)} /> : null}
      </div>
      <div className="my-2 border-y border-gray-900 py-2">
        <Pair label="TOTAL" value={formatRupiah(receipt.grandTotal)} size="text-base" bold />
      </div>
      <div className="space-y-0.5">
        <Pair label={`Bayar (${paymentMethodLabel(receipt.paymentMethod)})`} value={formatRupiah(receipt.paymentAmount)} />
        <Pair label="Kembalian" value={formatRupiah(receipt.changeAmount)} />
        {receipt.debtAmount && receipt.debtAmount > 0 ? <Pair label="Sisa Utang" value={formatRupiah(receipt.debtAmount)} /> : null}
      </div>
      <Dashed />
      <p className="text-center text-sm font-semibold">{isVoid ? 'Struk ini tidak berlaku' : 'Terima kasih!'}</p>
    </div>
  );
}
