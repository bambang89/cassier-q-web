'use client';

import type { StorefrontBlock } from '@/types/storefront';
import { cn } from '@/utils/cn';
import { Placeholder, SfLink, Heading, SfButton, EmbedShield } from '@/features/storefront/components/renderer/primitives';
import { itemsOf, str, youtubeId, prop } from '@/features/storefront/utils';
import { BUTTON_SIZES } from '@/features/storefront/constants';
import { useCardClass } from '@/features/storefront/hooks/useCardClass';

export function ImageBlock({ block, full }: { block: StorefrontBlock; full: boolean }) {
  const url = prop<string>(block, 'imageUrl');
  const aspect = prop<string>(block, 'aspect');
  const caption = prop<string>(block, 'caption');
  const link = prop<string>(block, 'link');
  if (!url) return <Placeholder label="Belum ada gambar — unggah di panel pengaturan" className="aspect-[16/7]" />;
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={caption || ''}
      className={cn('w-full object-cover', prop<boolean>(block, 'rounded') && !full && 'rounded-[var(--sf-radius)]')}
      style={aspect && aspect !== 'auto' ? { aspectRatio: aspect } : undefined}
    />
  );
  return (
    <figure>
      {link ? <SfLink link={link} className="block">{img}</SfLink> : img}
      {caption ? <figcaption className="mt-2 px-4 text-center text-sm text-[var(--sf-muted)]">{caption}</figcaption> : null}
    </figure>
  );
}

export function GalleryBlock({ block }: { block: StorefrontBlock }) {
  const items = itemsOf(block);
  const cols = prop<string>(block, 'columns');
  const aspect = prop<string>(block, 'aspect') || '1/1';
  return (
    <div>
      <Heading className="mb-3">{prop<string>(block, 'title')}</Heading>
      <div className={cn('grid gap-2 @3xl:gap-3', cols === '2' ? 'grid-cols-2' : cols === '4' ? 'grid-cols-2 @lg:grid-cols-4' : 'grid-cols-2 @lg:grid-cols-3')}>
        {items.map((item) => (
          <figure key={item.id} className="group relative overflow-hidden rounded-[var(--sf-radius)] bg-[color-mix(in_srgb,var(--sf)_8%,var(--sf-surface))]" style={{ aspectRatio: aspect }}>
            {str(item.imageUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={str(item.imageUrl)} alt={str(item.caption)} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
            ) : (
              <div className="flex size-full items-center justify-center text-3xl opacity-40">🖼</div>
            )}
            {str(item.caption) ? <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-[12px] font-semibold text-white">{str(item.caption)}</figcaption> : null}
          </figure>
        ))}
      </div>
    </div>
  );
}

export function TextBlock({ block }: { block: StorefrontBlock }) {
  const size = prop<string>(block, 'size');
  return (
    <div className="mx-auto max-w-3xl [text-align:inherit]">
      {prop<string>(block, 'eyebrow') ? <p className="mb-1 text-[12px] font-bold tracking-[0.14em] text-[var(--sf)] uppercase">{prop<string>(block, 'eyebrow')}</p> : null}
      <Heading className="mb-2">{prop<string>(block, 'heading')}</Heading>
      <p className={cn('leading-relaxed whitespace-pre-line text-[var(--sf-muted)]', size === 'sm' && 'text-sm', size === 'lg' && 'text-lg @3xl:text-xl')}>{prop<string>(block, 'body')}</p>
    </div>
  );
}

export function ButtonBlock({ block, align }: { block: StorefrontBlock; align: string }) {
  const items = itemsOf(block);
  const fullWidth = prop<boolean>(block, 'fullWidth');
  const size = (prop<string>(block, 'size') || 'md') as keyof typeof BUTTON_SIZES;
  if (items.length === 0) return <Placeholder label="Tambahkan tombol di panel pengaturan" />;
  return (
    <div className={cn('flex flex-wrap gap-2', fullWidth && 'flex-col', align === 'center' && 'justify-center', align === 'right' && 'justify-end')}>
      {items.map((item) => (
        <SfButton key={item.id} label={str(item.label) || 'Tombol'} link={str(item.link)} variant={str(item.variant) || 'solid'} size={size} className={cn(fullWidth && 'w-full')} />
      ))}
    </div>
  );
}

export function FeaturesBlock({ block }: { block: StorefrontBlock }) {
  const items = itemsOf(block);
  const card = useCardClass();
  const plain = prop<string>(block, 'display') === 'plain';
  const cols = prop<string>(block, 'columns');
  return (
    <div>
      <Heading className="mb-4">{prop<string>(block, 'title')}</Heading>
      <div className={cn('grid grid-cols-1 gap-3 @md:grid-cols-2', cols === '3' && '@3xl:grid-cols-3', cols === '4' && '@3xl:grid-cols-4')}>
        {items.map((item) => (
          <div key={item.id} className={cn('flex gap-3 [text-align:inherit]', plain ? 'py-2' : cn(card, 'p-4'))}>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[calc(var(--sf-radius)*0.75)] bg-[color-mix(in_srgb,var(--sf)_12%,transparent)] text-xl">{str(item.icon) || '✅'}</span>
            <div className="min-w-0 text-left">
              <Heading as="h3">{str(item.title)}</Heading>
              {str(item.text) ? <p className="mt-0.5 text-sm text-[var(--sf-muted)]">{str(item.text)}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TestimonialsBlock({ block }: { block: StorefrontBlock }) {
  const items = itemsOf(block);
  const card = useCardClass();
  const carousel = prop<string>(block, 'display') === 'carousel';
  return (
    <div>
      <Heading className="mb-4">{prop<string>(block, 'title')}</Heading>
      <div className={cn(carousel ? 'no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2' : 'grid grid-cols-1 gap-3 @md:grid-cols-2 @3xl:grid-cols-3')}>
        {items.map((item) => {
          const rating = Math.min(5, Math.max(1, Number(item.rating) || 5));
          return (
            <figure key={item.id} className={cn(card, 'flex flex-col gap-3 p-5 text-left', carousel && 'w-[80%] shrink-0 snap-start @lg:w-[45%] @3xl:w-[31%]')}>
              <span className="tracking-widest text-[#F5B301]">
                {'★'.repeat(rating)}
                <span className="opacity-25">{'★'.repeat(5 - rating)}</span>
              </span>
              <blockquote className="flex-1 leading-relaxed">“{str(item.text)}”</blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-[var(--sf)] text-sm font-bold text-white">{str(item.name).charAt(0).toUpperCase() || '?'}</span>
                <span>
                  <span className="block text-sm font-bold">{str(item.name)}</span>
                  {str(item.role) ? <span className="block text-[12px] text-[var(--sf-muted)]">{str(item.role)}</span> : null}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

export function FaqBlock({ block }: { block: StorefrontBlock }) {
  const items = itemsOf(block);
  const card = useCardClass();
  return (
    <div className="mx-auto max-w-3xl">
      <Heading className="mb-4">{prop<string>(block, 'title')}</Heading>
      <div className={cn(card, 'divide-y divide-[var(--sf-line)] overflow-hidden text-left')}>
        {items.map((item) => (
          <details key={item.id} className="group px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
              {str(item.q)}
              <span className="text-[var(--sf)] transition group-open:rotate-45">＋</span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-[var(--sf-muted)]">{str(item.a)}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function VideoBlock({ block }: { block: StorefrontBlock }) {
  const id = youtubeId(prop<string>(block, 'url') || '');
  const aspect = prop<string>(block, 'aspect') || '16/9';
  return (
    <div className={cn(aspect === '9/16' && 'mx-auto max-w-sm')}>
      <Heading className="mb-3">{prop<string>(block, 'title')}</Heading>
      {id ? (
        <div className="relative overflow-hidden rounded-[var(--sf-radius)] bg-black" style={{ aspectRatio: aspect }}>
          <iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={prop<string>(block, 'title') || 'Video'} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 size-full" />
          <EmbedShield />
        </div>
      ) : (
        <Placeholder label="Tempel link YouTube di panel pengaturan" className="aspect-video" />
      )}
    </div>
  );
}
