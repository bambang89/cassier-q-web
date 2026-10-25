import { PAYMENT_METHODS } from '@/types/models';
import type { Receipt, ReceiptRow } from '@/types/models';
import { formatRupiah } from '@/utils/format';

/** Default line width = 58mm paper (32 chars). 80mm paper = 48 chars. */
const WIDTH = 32;

/** Centers `text` within a line of `width` characters (left padding only). */
function center(text: string, width = WIDTH): string {
  if (text.length >= width) return text;
  return ' '.repeat(Math.floor((width - text.length) / 2)) + text;
}

/** Returns a divider line of `width` repeated characters. */
function divider(char = '-', width = WIDTH): string {
  return char.repeat(width);
}

/**
 * Left-aligns `left` and right-aligns `right` on one line of `width` characters.
 * If they do not fit, `right` moves to a new right-aligned line.
 */
function twoCol(left: string, right: string, width = WIDTH): string {
  const space = width - left.length - right.length;
  if (space >= 1) return left + ' '.repeat(space) + right;
  return `${left}\n${' '.repeat(Math.max(0, width - right.length))}${right}`;
}

/** Maps a payment method code (e.g. CASH) to its display label (e.g. Tunai). */
export function paymentMethodLabel(method: string): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

/**
 * Builds the structured receipt rows used for printing.
 * `width` is the characters per line: 32 for 58mm paper, 48 for 80mm.
 */
export function buildReceiptRows(receipt: Receipt, width = WIDTH): ReceiptRow[] {
  const rows: ReceiptRow[] = [];

  rows.push({ kind: 'center', text: receipt.storeName ?? 'cassier-Q' });
  if (receipt.storeAddress) rows.push({ kind: 'center', text: receipt.storeAddress });
  if (receipt.storePhone) rows.push({ kind: 'center', text: receipt.storePhone });
  rows.push({ kind: 'divider', text: divider('=', width) });
  rows.push({ kind: 'line', text: `No: ${receipt.transactionNumber}` });
  rows.push({ kind: 'line', text: `Tgl: ${new Date(receipt.transactionDate).toLocaleString('id-ID')}` });
  rows.push({ kind: 'line', text: `Kasir: ${receipt.cashierName}` });
  if (receipt.customerName) rows.push({ kind: 'line', text: `Pelanggan: ${receipt.customerName}` });
  rows.push({ kind: 'divider', text: divider('-', width) });

  for (const item of receipt.items) {
    rows.push({ kind: 'line', text: item.productName });
    rows.push({
      kind: 'pair',
      label: `  ${item.quantity} ${item.unitName} x ${formatRupiah(item.unitPrice)}`,
      value: formatRupiah(item.subtotal),
    });
  }

  rows.push({ kind: 'divider', text: divider('-', width) });
  rows.push({ kind: 'pair', label: 'Subtotal', value: formatRupiah(receipt.subtotal) });
  if (receipt.discountAmount > 0) {
    rows.push({ kind: 'pair', label: 'Diskon', value: `-${formatRupiah(receipt.discountAmount)}` });
  }
  if (receipt.taxAmount > 0) rows.push({ kind: 'pair', label: 'Pajak', value: formatRupiah(receipt.taxAmount) });
  rows.push({ kind: 'pair', label: 'TOTAL', value: formatRupiah(receipt.grandTotal) });
  rows.push({
    kind: 'pair',
    label: `Bayar (${paymentMethodLabel(receipt.paymentMethod)})`,
    value: formatRupiah(receipt.paymentAmount),
  });
  rows.push({ kind: 'pair', label: 'Kembalian', value: formatRupiah(receipt.changeAmount) });

  if (receipt.debtAmount && receipt.debtAmount > 0) {
    rows.push({ kind: 'pair', label: 'Sisa Utang', value: formatRupiah(receipt.debtAmount) });
  }
  rows.push({ kind: 'divider', text: divider('=', width) });

  if (receipt.status === 'VOID') {
    rows.push({ kind: 'center', text: '** TRANSAKSI DIBATALKAN **' });
    rows.push({ kind: 'divider', text: divider('=', width) });
  } else {
    rows.push({ kind: 'center', text: 'Terima kasih!' });
  }

  return rows;
}

/** Renders the receipt as plain monospace text (for sharing/saving), `width` characters per line. */
export function formatReceiptText(receipt: Receipt, width = WIDTH): string {
  return buildReceiptRows(receipt, width)
    .map((row) => {
      switch (row.kind) {
        case 'center':
          return center(row.text, width);
        case 'line':
        case 'divider':
          return row.text;
        case 'pair':
          return twoCol(row.label, row.value, width);
      }
    })
    .join('\n');
}
