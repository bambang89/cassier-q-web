import type { Receipt } from '@/types/models';

export type PrinterType = 'SYSTEM' | 'THERMAL' | 'DOT_MATRIX' | 'LABEL';

export interface ReceiptPrinter {
  readonly type: PrinterType;
  /** Nama yang ditampilkan di UI (mis. pemilihan jenis printer). */
  readonly label: string;
  print(receipt: Receipt): Promise<void>;
}

export interface StoredPrinterConfig {
  type: Extract<PrinterType, 'THERMAL' | 'DOT_MATRIX'>;
  deviceName: string;
  deviceAddress: string;
}

/** Receipt paper width in mm. 58mm = small thermal printers, 80mm = standard POS printers. */
export type PaperWidth = 58 | 80;
