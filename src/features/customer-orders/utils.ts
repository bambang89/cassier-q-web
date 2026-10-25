import type { CustomerOrder, CustomerOrderStatus, Fulfillment } from '@/types/storefront';
import type { BadgeVariant } from '@/types/ui';

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

export function itemSummary(order: CustomerOrder): string {
  return order.items.map((i) => `${Number(i.quantity)}× ${i.productName}`).join(', ');
}

/** Bunyi "ding" singkat saat ada pesanan baru (tanpa file audio). */
export function ding() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // browser memblokir audio sebelum ada interaksi — abaikan
  }
}
