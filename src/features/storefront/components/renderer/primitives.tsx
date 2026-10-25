'use client';

import type { ReactNode, CSSProperties, MouseEvent } from 'react';

import { cn } from '@/utils/cn';
import { useSf } from '@/features/storefront/hooks/useSf';
import { BUTTON_SIZES } from '@/features/storefront/constants';
import { resolveLink } from '@/features/storefront/utils';

export function Heading({ children, className, as: Tag = 'h2' }: { children: ReactNode; className?: string; as?: 'h1' | 'h2' | 'h3' }) {
  const { theme } = useSf();
  if (!children) return null;
  const size = Tag === 'h3' ? 'text-base' : theme.headingSize === 'sm' ? 'text-lg' : theme.headingSize === 'lg' ? 'text-2xl @3xl:text-3xl' : 'text-xl @3xl:text-2xl';
  return <Tag className={cn('sf-heading font-bold text-[var(--sf-text)]', size, className)}>{children}</Tag>;
}

/** Tautan yang paham "#jangkar", "wa:" dan URL luar; di editor tidak berpindah halaman. */
export function SfLink({ link, className, style, children, onClick }: { link: string; className?: string; style?: CSSProperties; children: ReactNode; onClick?: () => void }) {
  const { editor, whatsapp } = useSf();
  const href = resolveLink(link, whatsapp);
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    if (!href) return e.preventDefault();
    if (href.startsWith('#')) {
      e.preventDefault();
      if (editor) e.stopPropagation();
      const root = (e.currentTarget.closest('[data-sf-root]') as HTMLElement | null) ?? document;
      root.querySelector(`[id="${CSS.escape(href.slice(1))}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (editor) {
      e.preventDefault();
    }
  };
  return (
    <a href={href ?? '#'} onClick={handle} target={href && !href.startsWith('#') ? '_blank' : undefined} rel="noreferrer" className={className} style={style}>
      {children}
    </a>
  );
}

export function SfButton({ label, link, variant = 'solid', size = 'md', className }: { label: string; link: string; variant?: string; size?: keyof typeof BUTTON_SIZES; className?: string }) {
  return (
    <SfLink
      link={link}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--sf-btn-radius)] font-bold transition hover:brightness-95 active:scale-[0.98]',
        BUTTON_SIZES[size],
        variant === 'solid' && 'bg-[var(--sf)] text-[color:var(--sf-on,#fff)] shadow-sm',
        variant === 'outline' && 'border-2 border-[var(--sf)] text-[var(--sf)]',
        variant === 'soft' && 'bg-[color-mix(in_srgb,var(--sf)_14%,transparent)] text-[var(--sf)]',
        variant === 'white' && 'bg-white text-[#0F172A] shadow-md',
        variant === 'glass' && 'border border-white/50 bg-white/10 text-white backdrop-blur',
        className,
      )}
    >
      {label}
    </SfLink>
  );
}

export function Placeholder({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center rounded-[var(--sf-radius)] border-2 border-dashed border-[var(--sf-line)] p-6 text-center text-sm text-[var(--sf-muted)]', className)}>
      {label}
    </div>
  );
}

/** Blok yang isinya dari internet (video, peta): di editor ditutup lapisan supaya kliknya memilih blok. */
export function EmbedShield() {
  const { editor } = useSf();
  return editor ? <div className="absolute inset-0 z-[1]" /> : null;
}

export const SoldOut = () => <span className="absolute top-2 left-2 rounded-full bg-error-600 px-2 py-0.5 text-[11px] font-bold text-white">Habis</span>;
