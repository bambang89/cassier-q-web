import type { BadgeVariant } from '@/types/ui';
import type { Product } from '@/types/models';
import { LOW_STOCK_THRESHOLD } from '@/utils/productDisplay';

/**
 * SKU otomatis: 3 huruf awal kategori + tanggal + 4 karakter acak,
 * mis. "MAK-261013-7KQ2". Keunikan tetap dicek backend ("SKU sudah dipakai").
 */
export function generateSku(categoryName?: string | null): string {
  const prefix = (categoryName ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'PRD';
  const now = new Date();
  const date = [now.getFullYear() % 100, now.getMonth() + 1, now.getDate()].map((n) => String(n).padStart(2, '0')).join('');
  const random = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, '0');
  return `${prefix}-${date}-${random}`;
}

export function stockStatus(item: Product): { label: string; variant: BadgeVariant } {
  if (item.stockQuantity <= 0) return { label: 'Habis', variant: 'error' };
  if (item.stockQuantity <= LOW_STOCK_THRESHOLD) return { label: 'Menipis', variant: 'warning' };
  return { label: 'Aman', variant: 'success' };
}

export function stockVariant(product: Product): BadgeVariant {
  if (product.stockQuantity <= 0) return 'error';
  if (product.stockQuantity <= LOW_STOCK_THRESHOLD) return 'warning';
  return 'neutral';
}
