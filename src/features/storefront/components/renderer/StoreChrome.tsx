'use client';

import { useRef } from 'react';

import { cn } from '@/utils/cn';
import { CartIcon, StoreIcon } from '@/components/ui/icons/NavIcons';
import { useSf } from '@/features/storefront/hooks/useSf';

export function StoreHeader({ cartCount = 0, onCart, onSelect, selected }: { cartCount?: number; onCart?: () => void; onSelect?: () => void; selected?: boolean }) {
  const { data, page } = useSf();
  if (!page.headerShow && !onSelect) return null;
  const themed = page.headerStyle === 'theme';
  return (
    <header
      onClick={onSelect}
      className={cn(
        'top-0 z-30',
        page.headerSticky && 'sticky',
        page.headerStyle === 'light' && 'border-b border-[var(--sf-line)] bg-[color-mix(in_srgb,var(--sf-surface)_88%,transparent)] backdrop-blur',
        themed && 'bg-[var(--sf)] text-white',
        onSelect && 'cursor-pointer outline-2 -outline-offset-2',
        onSelect && (selected ? 'outline outline-primary-500' : 'hover:outline hover:outline-gray-300'),
        !page.headerShow && 'opacity-40',
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 @3xl:px-6">
        {page.headerShowLogo ? (
          <span className={cn('flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--sf-radius)*0.75)]', themed ? 'bg-white/20' : 'bg-[var(--sf)] text-white')}>
            {data.store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.store.logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <StoreIcon size={20} />
            )}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="sf-heading truncate font-bold">{data.store.name}</p>
          {page.headerTagline || data.store.city ? <p className={cn('truncate text-[12.5px]', themed ? 'text-white/80' : 'text-[var(--sf-muted)]')}>{page.headerTagline || data.store.city}</p> : null}
        </div>
        {page.orderingEnabled ? (
          <button
            type="button"
            onClick={(e) => {
              if (!onCart) return;
              e.stopPropagation();
              onCart();
            }}
            className={cn('relative flex size-11 cursor-pointer items-center justify-center rounded-full', themed ? 'bg-white/20' : 'bg-[color-mix(in_srgb,var(--sf-text)_7%,transparent)]')}
            aria-label="Keranjang"
          >
            <CartIcon size={20} />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-[var(--sf)] px-1 text-[11px] font-bold text-white ring-2 ring-white">{cartCount}</span>
            ) : null}
          </button>
        ) : null}
      </div>
    </header>
  );
}

export function StoreFooter({ onSelect, selected }: { onSelect?: () => void; selected?: boolean }) {
  const { data, page } = useSf();
  if (!page.footerShow && !onSelect) return null;
  const address = [data.store.address, data.store.city].filter(Boolean).join(', ');
  return (
    <footer
      onClick={onSelect}
      className={cn(
        'mt-6 border-t border-[var(--sf-line)] bg-[var(--sf-surface)] pt-8 pb-28 text-center',
        onSelect && 'cursor-pointer outline-2 -outline-offset-2',
        onSelect && (selected ? 'outline outline-primary-500' : 'hover:outline hover:outline-gray-300'),
        !page.footerShow && 'opacity-40',
      )}
    >
      <div className="mx-auto max-w-3xl space-y-1 px-4">
        <p className="sf-heading font-bold">{data.store.name}</p>
        {address ? <p className="text-sm text-[var(--sf-muted)]">{address}</p> : null}
        {page.footerText ? <p className="pt-2 text-sm whitespace-pre-line text-[var(--sf-muted)]">{page.footerText}</p> : null}
        <p className="pt-3 text-[12px] text-[var(--sf-muted)]">
          © {new Date().getFullYear()} {data.store.name}
          {page.footerPoweredBy ? ' · Dibuat dengan cassier-Q' : ''}
        </p>
      </div>
    </footer>
  );
}

export function FloatingWhatsapp({ contained, raised }: { contained?: boolean; raised?: boolean }) {
  const { page, editor } = useSf();
  const number = page.floatingWhatsapp.replace(/\D/g, '').replace(/^0/, '62');
  const ref = useRef<HTMLAnchorElement>(null);
  if (!number) return null;
  return (
    <a
      ref={ref}
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => editor && e.preventDefault()}
      aria-label="Chat WhatsApp"
      className={cn(
        'z-30 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-float transition hover:scale-105',
        contained ? 'sticky bottom-4 float-right mr-4 -mt-14' : 'fixed right-4',
        !contained && (raised ? 'bottom-24' : 'bottom-5'),
      )}
    >
      💬
    </a>
  );
}
