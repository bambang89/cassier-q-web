'use client';

import type { PublicProduct } from '@/types/storefront';
import { cn } from '@/utils/cn';
import { paletteColorFor, emojiForProduct } from '@/utils/productDisplay';
import { formatRupiah } from '@/utils/format';
import { PlusIcon } from '@/components/ui/icons/ActionIcons';
import { useSf } from '@/features/storefront/hooks/useSf';
import { SoldOut } from '@/features/storefront/components/renderer/primitives';
import { useCardClass } from '@/features/storefront/hooks/useCardClass';

export function ProductImage({ product, className }: { product: PublicProduct; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center overflow-hidden', className)} style={{ backgroundColor: `color-mix(in srgb, ${paletteColorFor(product.id)} 60%, var(--sf-surface))` }}>
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        <span className="text-4xl">{product.bundle ? '🎁' : emojiForProduct({ productName: product.name, categoryName: product.categoryName } as never)}</span>
      )}
    </div>
  );
}

export function AddButton({ product, light }: { product: PublicProduct; light?: boolean }) {
  const { onAdd, cart } = useSf();
  if (!onAdd) return null;
  const count = cart[product.id] ?? 0;
  return (
    <button
      type="button"
      disabled={!product.available}
      onClick={(e) => {
        e.stopPropagation();
        onAdd(product);
      }}
      aria-label={`Tambah ${product.name}`}
      className={cn(
        'relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full shadow-md transition duration-200 hover:scale-110 active:scale-90 disabled:cursor-not-allowed disabled:hover:scale-100',
        !product.available ? 'bg-gray-200 text-gray-400' : light ? 'bg-white text-[#0F172A]' : 'bg-[var(--sf)] text-white',
      )}
    >
      <PlusIcon size={18} strokeWidth={2.2} />
      {count > 0 ? (
        <span key={count} className="absolute -top-1.5 -right-1.5 flex min-w-5 animate-pop-in items-center justify-center rounded-full border-2 border-white bg-[#0F172A] px-1 text-[11px] font-bold text-white">{count}</span>
      ) : null}
    </button>
  );
}

export function ProductCard({ product, showDescription }: { product: PublicProduct; showDescription: boolean }) {
  const { theme } = useSf();
  const card = useCardClass();
  const dim = !product.available && 'opacity-60';

  if (theme.productCard === 'overlay') {
    return (
      <div className={cn('group relative aspect-[3/4] overflow-hidden rounded-[var(--sf-radius)] text-left', dim)}>
        <ProductImage product={product} className="absolute inset-0 transition duration-700 group-hover:scale-[1.08]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {!product.available ? <SoldOut /> : null}
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-2 p-3 text-white">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm leading-tight font-semibold">{product.name}</p>
            <p className="mt-1 font-bold">{formatRupiah(product.price)}</p>
          </div>
          <AddButton product={product} light />
        </div>
      </div>
    );
  }

  if (theme.productCard === 'minimal') {
    return (
      <div className={cn('group flex flex-col text-left', dim)}>
        <div className="relative overflow-hidden rounded-[var(--sf-radius)]">
          <ProductImage product={product} className="aspect-square transition duration-500 group-hover:scale-[1.06]" />
          {!product.available ? <SoldOut /> : null}
          <div className="absolute right-2 bottom-2">
            <AddButton product={product} />
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-tight font-medium">{product.name}</p>
        {showDescription && product.description ? <p className="line-clamp-2 text-[12px] text-[var(--sf-muted)]">{product.description}</p> : null}
        <p className="mt-0.5 text-sm font-bold">{formatRupiah(product.price)}</p>
      </div>
    );
  }

  return (
    <div className={cn(card, 'group flex h-full flex-col overflow-hidden text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgb(0_0_0/0.10)]', dim)}>
      <div className="relative overflow-hidden">
        <ProductImage product={product} className="aspect-square transition duration-500 group-hover:scale-[1.06]" />
        {!product.available ? <SoldOut /> : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 min-h-[2.5em] text-sm leading-tight font-semibold">{product.name}</p>
        {showDescription && product.description ? <p className="line-clamp-2 text-[12px] text-[var(--sf-muted)]">{product.description}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="font-bold text-[var(--sf)]">{formatRupiah(product.price)}</span>
          <AddButton product={product} />
        </div>
      </div>
    </div>
  );
}

export function ProductRow({ product, showDescription }: { product: PublicProduct; showDescription: boolean }) {
  const card = useCardClass();
  return (
    <div className={cn(card, 'flex items-center gap-3 p-3 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgb(0_0_0/0.08)]', !product.available && 'opacity-60')}>
      <ProductImage product={product} className="size-20 shrink-0 rounded-[calc(var(--sf-radius)*0.75)]" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-semibold">{product.name}</p>
        {showDescription && product.description ? <p className="line-clamp-2 text-[13px] text-[var(--sf-muted)]">{product.description}</p> : null}
        <p className="mt-1 font-bold text-[var(--sf)]">
          {formatRupiah(product.price)} <span className="text-[12px] font-normal text-[var(--sf-muted)]">/ {product.unitName}</span>
        </p>
        {!product.available ? <p className="text-[12px] font-semibold text-error-600">Habis</p> : null}
      </div>
      <AddButton product={product} />
    </div>
  );
}
