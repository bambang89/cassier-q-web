import type { CustomerOrder, CustomerOrderStatus, Fulfillment } from '@/types/storefront';
import type { BadgeVariant } from '@/components/ui/Display';

export const STATUS_META: Record<CustomerOrderStatus, { label: string; variant: BadgeVariant }> = {
  NEW: { label: 'Baru', variant: 'error' },
  ACCEPTED: { label: 'Dikonfirmasi', variant: 'primary' },
  IN_PROGRESS: { label: 'Diproses', variant: 'warning' },
  READY: { label: 'Siap', variant: 'success' },
  COMPLETED: { label: 'Selesai', variant: 'neutral' },
  CANCELLED: { label: 'Dibatalkan', variant: 'neutral' },
};

export const FULFILLMENT_LABEL: Record<Fulfillment, string> = {
  PICKUP: 'Ambil di toko',
  DELIVERY: 'Diantar',
  DINE_IN: 'Makan di tempat',
  TAKEAWAY: 'Bawa pulang',
};

/** Langkah berikutnya yang ditawarkan sebagai tombol utama. */
export function nextAction(status: CustomerOrderStatus): { label: string; status: CustomerOrderStatus } | null {
  switch (status) {
    case 'NEW':
      return { label: 'Terima', status: 'ACCEPTED' };
    case 'ACCEPTED':
      return { label: 'Proses', status: 'IN_PROGRESS' };
    case 'IN_PROGRESS':
      return { label: 'Tandai Siap', status: 'READY' };
    default:
      return null;
  }
}

export const rupiah = (value: number) => `Rp ${Math.round(value).toLocaleString('id-ID')}`;

/** "baru saja", "5 mnt lalu", "2 jam lalu", atau tanggal. */
export function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function itemSummary(order: CustomerOrder): string {
  return order.items.map((i) => `${Number(i.quantity)}× ${i.productName}`).join(', ');
}
