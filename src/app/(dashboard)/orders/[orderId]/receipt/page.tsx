'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { PAPER_CHARS, getPaperWidth, savePaperWidth } from '@/services/printing/settings';
import type { PaperWidth } from '@/services/printing/types';
import { clearReceipt, fetchReceipt } from '@/lib/store/slices/ordersSlice';
import { Alert } from '@/lib/alert';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { formatReceiptText, paymentMethodLabel } from '@/utils/receiptText';
import { formatRupiah } from '@/utils/format';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { FolderIcon } from '@/components/ui/icons/DataIcons';
import { PrintIcon } from '@/components/ui/icons/ActionIcons';
import { PaperWidthPicker } from '@/features/orders/components/PaperWidthPicker';
import { ReceiptPaper } from '@/features/orders/components/ReceiptPaper';

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
              <p className="mt-1 text-[36px] leading-tight font-extrabold text-ink">{formatRupiah(receipt.grandTotal, true)}</p>
              <p className="mt-1 text-sm text-ink-2">
                {receipt.transactionNumber} · {paymentMethodLabel(receipt.paymentMethod)}
              </p>
              {receipt.changeAmount > 0 ? <p className="text-sm text-ink-2">Kembalian {formatRupiah(receipt.changeAmount, true)}</p> : null}
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

