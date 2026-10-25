'use client';

import type { MouseEvent } from 'react';
import { useMemo, useState } from 'react';

import type { StorefrontBlock, PublicProduct } from '@/types/storefront';
import { cn } from '@/utils/cn';
import { emojiForProduct } from '@/utils/productDisplay';
import { formatRupiah } from '@/utils/format';
import { SearchIcon, ChevronRightIcon } from '@/components/ui/icons/ActionIcons';
import { useSf } from '@/features/storefront/hooks/useSf';
import { Heading, Placeholder } from '@/features/storefront/components/renderer/primitives';
import { scrollToProducts, sortProducts, str, prop, propsWithDefaults } from '@/features/storefront/utils';
import { useCardClass } from '@/features/storefront/hooks/useCardClass';
import { GRID_DESKTOP, GRID_MOBILE } from '@/features/storefront/constants';
import { ProductCard, ProductRow, ProductImage } from '@/features/storefront/components/renderer/ProductCard';

export function CategoriesBlock({ block, align }: { block: StorefrontBlock; align: string }) {
  const { data, categoryId, onCategory } = useSf();
  const card = useCardClass();
  if (data.categories.length === 0) return <Placeholder label="Kategori muncul otomatis dari produk aktif toko" />;
  const display = prop<string>(block, 'display');
  const list = [...(prop<boolean>(block, 'showAll') ? [{ id: null as string | null, name: 'Semua' }] : []), ...data.categories];
  const emojiOf = (name: string) => (name === 'Semua' ? '🏪' : emojiForProduct({ productName: name, categoryName: name } as never));
  const pick = (id: string | null) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onCategory(id);
    scrollToProducts(e.currentTarget);
  };

  return (
    <div>
      <Heading className="mb-3">{prop<string>(block, 'title')}</Heading>
      {display === 'grid' ? (
        <div className="grid grid-cols-4 gap-2 @lg:grid-cols-6 @3xl:grid-cols-8">
          {list.map((c) => (
            <button
              key={c.id ?? 'all'}
              type="button"
              onClick={pick(c.id)}
              className={cn(card, 'flex cursor-pointer flex-col items-center gap-1.5 p-3 text-center transition hover:-translate-y-0.5', categoryId === c.id && 'ring-2 ring-[var(--sf)]')}
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--sf)_12%,transparent)] text-xl">{emojiOf(c.name)}</span>
              <span className="line-clamp-2 text-[12px] leading-tight font-semibold">{c.name}</span>
            </button>
          ))}
        </div>
      ) : display === 'list' ? (
        <div className={cn(card, 'divide-y divide-[var(--sf-line)] overflow-hidden')}>
          {list.map((c) => (
            <button key={c.id ?? 'all'} type="button" onClick={pick(c.id)} className={cn('flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left', categoryId === c.id && 'text-[var(--sf)]')}>
              <span className="text-lg">{emojiOf(c.name)}</span>
              <span className="flex-1 font-semibold">{c.name}</span>
              <ChevronRightIcon size={16} className="text-[var(--sf-muted)]" />
            </button>
          ))}
        </div>
      ) : (
        <div className={cn('no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4', align === 'center' && 'justify-center')}>
          {list.map((c) => {
            const active = categoryId === c.id;
            return (
              <button
                key={c.id ?? 'all'}
                type="button"
                onClick={pick(c.id)}
                className={cn(
                  'shrink-0 cursor-pointer rounded-[var(--sf-btn-radius)] border px-4 py-2 text-sm font-semibold whitespace-nowrap transition',
                  active ? 'border-[var(--sf)] bg-[var(--sf)] text-white' : 'border-[var(--sf-line)] bg-[var(--sf-surface)] hover:border-[var(--sf)]',
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProductsBlock({ block }: { block: StorefrontBlock }) {
  const { data, categoryId, onCategory } = useSf();
  const [query, setQuery] = useState('');
  const p = propsWithDefaults(block);
  const source = str(p.source);
  const display = str(p.display);
  const limit = Number(p.limit) || 0;

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list: PublicProduct[];
    if (source === 'manual') {
      const ids = Array.isArray(p.productIds) ? (p.productIds as string[]) : [];
      const byId = new Map(data.products.map((x) => [x.id, x]));
      list = ids.map((id) => byId.get(id)).filter((x): x is PublicProduct => !!x);
    } else {
      const category = source === 'category' ? str(p.categoryId) : categoryId;
      list = sortProducts(data.products.filter((x) => !category || x.categoryId === category), str(p.sort));
    }
    if (p.hideSoldOut) list = list.filter((x) => x.available);
    if (q) list = list.filter((x) => x.name.toLowerCase().includes(q));
    return limit > 0 ? list.slice(0, limit) : list;
  }, [data.products, source, p.productIds, p.categoryId, p.sort, p.hideSoldOut, categoryId, query, limit]);

  const activeCategory = source === 'all' && categoryId ? data.categories.find((c) => c.id === categoryId) : null;

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <Heading>{str(p.title)}</Heading>
          {str(p.subtitle) ? <p className="mt-0.5 text-sm text-[var(--sf-muted)]">{str(p.subtitle)}</p> : null}
        </div>
        {p.showCount ? <span className="shrink-0 text-sm text-[var(--sf-muted)]">{products.length} produk</span> : null}
      </div>
      {activeCategory ? (
        <button type="button" onClick={(e) => (e.stopPropagation(), onCategory(null))} className="mb-3 inline-flex cursor-pointer items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--sf)_12%,transparent)] px-3 py-1 text-[13px] font-semibold text-[var(--sf)]">
          {activeCategory.name} ✕
        </button>
      ) : null}
      {p.showSearch ? (
        <label className="mb-3 flex h-11 items-center gap-2 rounded-[var(--sf-btn-radius)] border border-[var(--sf-line)] bg-[var(--sf-surface)] px-4 focus-within:border-[var(--sf)]">
          <SearchIcon size={16} className="text-[var(--sf-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Cari produk…"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--sf-text)] outline-none placeholder:text-[var(--sf-muted)]"
          />
        </label>
      ) : null}
      {products.length === 0 ? (
        <Placeholder label={source === 'manual' ? 'Pilih produk di panel pengaturan blok' : 'Belum ada produk.'} />
      ) : display === 'carousel' ? (
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {products.map((x) => (
            <div key={x.id} className="w-[44%] shrink-0 snap-start @lg:w-[30%] @3xl:w-[22%]">
              <ProductCard product={x} showDescription={!!p.showDescription} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-3',
            display === 'list' ? 'grid-cols-1 @md:grid-cols-2' : GRID_MOBILE[str(p.columns)] ?? 'grid-cols-2',
            display === 'list' ? (str(p.columnsDesktop) === '3' || Number(p.columnsDesktop) > 3 ? '@3xl:grid-cols-3' : '@3xl:grid-cols-2') : GRID_DESKTOP[str(p.columnsDesktop)] ?? '@3xl:grid-cols-4',
          )}
        >
          {products.map((x) => (display === 'list' ? <ProductRow key={x.id} product={x} showDescription={!!p.showDescription} /> : <ProductCard key={x.id} product={x} showDescription={!!p.showDescription} />))}
        </div>
      )}
    </div>
  );
}

export function FeaturedBlock({ block }: { block: StorefrontBlock }) {
  const { data, onAdd } = useSf();
  const card = useCardClass();
  const product = data.products.find((x) => x.id === prop<string>(block, 'productId')) ?? null;
  if (!product) return <Placeholder label="Pilih produk unggulan di panel pengaturan" className="min-h-40" />;
  const right = prop<string>(block, 'imageSide') === 'right';
  const button = prop<string>(block, 'buttonText');
  return (
    <div className={cn(card, 'grid overflow-hidden text-left @2xl:grid-cols-2')}>
      <ProductImage product={product} className={cn('aspect-[4/3] @2xl:aspect-auto @2xl:min-h-72', right && '@2xl:order-2')} />
      <div className="flex flex-col justify-center gap-3 p-6 @3xl:p-10">
        {prop<string>(block, 'badge') ? <span className="w-fit rounded-full bg-[color-mix(in_srgb,var(--sf)_14%,transparent)] px-3 py-1 text-[12px] font-bold text-[var(--sf)]">{prop<string>(block, 'badge')}</span> : null}
        <Heading>{prop<string>(block, 'headline') || product.name}</Heading>
        {prop<string>(block, 'description') || product.description ? <p className="leading-relaxed text-[var(--sf-muted)]">{prop<string>(block, 'description') || product.description}</p> : null}
        <p className="text-2xl font-extrabold text-[var(--sf)]">{formatRupiah(product.price)}</p>
        {button && onAdd ? (
          <button
            type="button"
            disabled={!product.available}
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
            className="w-fit cursor-pointer rounded-[var(--sf-btn-radius)] bg-[var(--sf)] px-6 py-3 font-bold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {product.available ? button : 'Stok habis'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
