'use client';

import type { Product } from '@/types/models';
import { cn } from '@/lib/cn';
import { LOW_STOCK_THRESHOLD, emojiForProduct, paletteColorFor } from '@/utils/productDisplay';
import { firstStep } from '@/utils/priceTiers';
import { isBundle } from '@/utils/bundles';
import { Badge } from '@/components/ui/Display';
import type { BadgeVariant } from '@/components/ui/Display';

export type ProductGridCardVariant = 'pos' | 'catalog';

function stockStatus(item: Product): { label: string; variant: BadgeVariant } {
  if (item.stockQuantity <= 0) return { label: 'Habis', variant: 'error' };
  if (item.stockQuantity <= LOW_STOCK_THRESHOLD) return { label: 'Menipis', variant: 'warning' };
  return { label: 'Aman', variant: 'success' };
}

/**
 * 'pos': kartu jual di Kasir — stok polos, klik mati bila stok habis.
 * 'catalog': kartu kelola produk — status stok berupa Badge, klik tetap aktif.
 */
export function ProductGridCard({
  item,
  onClick,
  variant = 'pos',
  index = 0,
}: {
  item: Product;
  onClick?: () => void;
  variant?: ProductGridCardVariant;
  index?: number;
}) {
  const outOfStock = item.stockQuantity <= 0;
  const lowStock = !outOfStock && item.stockQuantity <= LOW_STOCK_THRESHOLD;
  const disabled = variant === 'pos' && outOfStock;
  const badge = variant === 'catalog' ? stockStatus(item) : null;
  const step = firstStep(item);

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
      className={cn(
        'flex w-full animate-fade-in cursor-pointer flex-col overflow-hidden rounded-xl border border-line bg-white text-left shadow-card transition hover:border-primary-200 active:scale-[0.97]',
        outOfStock && 'opacity-55',
        disabled && 'cursor-not-allowed',
      )}
    >
      <div
        className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden"
        style={item.imageUrl ? undefined : { backgroundColor: paletteColorFor(item.id) }}
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <span className="text-[40px] tab:text-[44px]">{isBundle(item) ? '🎁' : emojiForProduct(item)}</span>
        )}
        {isBundle(item) ? (
          <span className="absolute top-2 left-2 rounded-md bg-primary-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
            PAKET
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5 tab:p-3">
        <p className="line-clamp-2 min-h-[2.5em] text-[13px] leading-tight font-semibold text-ink">{item.productName}</p>
        {step ? (
          <p className="truncate text-[12px] font-semibold text-success-600">
            Grosir ≥{step.minQuantity} {item.baseUnitName} · Rp{step.unitPrice.toLocaleString('id-ID')}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-1">
          <span className="text-[13px] font-bold text-ink">Rp {item.sellingPrice.toLocaleString('id-ID')}</span>
          {badge ? (
            <Badge variant={badge.variant}>{badge.label}</Badge>
          ) : (
            <span
              className={cn(
                'text-[12px] font-semibold',
                outOfStock ? 'text-error-600' : lowStock ? 'text-warning-700' : 'text-ink-3',
              )}
            >
              {outOfStock ? 'Stok habis' : `Stok ${item.stockQuantity}`}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/** Deretan chip kategori yang bisa digulir horizontal. */
export function CategoryChips({
  categories,
  selectedId,
  onSelect,
}: {
  categories: { id: string; categoryName: string }[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (categories.length === 0) return null;
  const chip = (active: boolean) =>
    cn(
      'shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition active:scale-[0.94]',
      active ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 bg-white text-ink-2 hover:border-primary-200',
    );
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      <button type="button" className={chip(selectedId === null)} onClick={() => onSelect(null)}>
        Semua
      </button>
      {categories.map((cat) => (
        <button key={cat.id} type="button" className={chip(selectedId === cat.id)} onClick={() => onSelect(cat.id)}>
          {cat.categoryName}
        </button>
      ))}
    </div>
  );
}
