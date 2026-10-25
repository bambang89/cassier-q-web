import type { SummaryRowProps } from '@/types/ui';
import { cn } from '@/utils/cn';

/** Baris label–nilai pada ringkasan transaksi (subtotal, diskon, total, dst.). */
export function SummaryRow({ label, value, valueClass = 'text-gray-900', className }: SummaryRowProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-gray-500">{label}</span>
      <span className={cn('font-semibold', valueClass)}>{value}</span>
    </div>
  );
}
