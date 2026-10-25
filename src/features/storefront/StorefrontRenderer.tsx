'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';

import type {
  BlockStyle,
  PublicProduct,
  PublicStorefront,
  StorefrontBlock,
  StorefrontPageSettings,
  StorefrontTheme,
} from '@/types/storefront';
import { cn } from '@/lib/cn';
import { BLOCK_DEFS, FONTS, SOCIAL_PLATFORMS, prop, propsWithDefaults, resolveLink, resolvePage, resolveTheme } from '@/lib/storefront/blocks';
import { emojiForProduct, paletteColorFor } from '@/utils/productDisplay';
import { CartIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, PinIcon, PlusIcon, SearchIcon, StoreIcon } from '@/components/icons/LineIcons';

export const rupiah = (value: number) => `Rp${Math.round(value).toLocaleString('id-ID')}`;

type Item = Record<string, unknown> & { id?: string };

const RADIUS: Record<StorefrontTheme['radius'], string> = { none: '0px', sm: '6px', md: '10px', lg: '16px', xl: '24px' };
const BTN_RADIUS: Record<StorefrontTheme['buttonShape'], string> = { square: '0px', rounded: '10px', pill: '999px' };

/** Warna & bentuk tema toko sebagai CSS variable (--sf-*) untuk semua blok. */
export function themeStyle(color: string | null | undefined, theme?: Partial<StorefrontTheme>): CSSProperties {
  const t = { ...resolveTheme(null), ...theme };
  return {
    ['--sf' as string]: color || '#2563EB',
    ['--sf-base' as string]: color || '#2563EB',
    ['--sf-bg' as string]: t.background,
    ['--sf-surface' as string]: t.surface,
    ['--sf-text' as string]: t.text,
    ['--sf-muted' as string]: `color-mix(in srgb, ${t.text} 62%, ${t.background})`,
    ['--sf-line' as string]: `color-mix(in srgb, ${t.text} 12%, ${t.surface})`,
    ['--sf-radius' as string]: RADIUS[t.radius],
    ['--sf-btn-radius' as string]: BTN_RADIUS[t.buttonShape],
    ['--sf-font' as string]: FONTS[t.font]?.css ?? FONTS.jakarta.css,
    ['--sf-heading-font' as string]: FONTS[t.headingFont]?.css ?? FONTS.jakarta.css,
    fontFamily: 'var(--sf-font)',
    color: 'var(--sf-text)',
  };
}

/** Muat font Google yang dipilih di tema (sekali per kombinasi). */
export function useStorefrontFonts(theme: Partial<StorefrontTheme> | undefined) {
  const families = [theme?.font, theme?.headingFont]
    .map((key) => (key ? FONTS[key]?.google : undefined))
    .filter((v, i, arr): v is string => !!v && arr.indexOf(v) === i);
  const href = families.length ? `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join('&')}&display=swap` : '';
  useEffect(() => {
    if (!href) return;
    let link = document.getElementById('sf-fonts') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = 'sf-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [href]);
}

// ── Konteks bersama ──────────────────────────────────────────────────

interface StorefrontContextValue {
  data: PublicStorefront;
  theme: StorefrontTheme;
  page: StorefrontPageSettings;
  cart: Record<string, number>;
  onAdd?: (product: PublicProduct) => void;
  categoryId: string | null;
  onCategory: (id: string | null) => void;
  /** Mode editor: tautan tidak membuka halaman lain, iframe tidak menangkap klik. */
  editor: boolean;
  whatsapp: string | null;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

function useSf(): StorefrontContextValue {
  const value = useContext(StorefrontContext);
  if (!value) throw new Error('Blok toko harus dirender di dalam <StorefrontProvider>');
  return value;
}

export function StorefrontProvider({
  data,
  cart = {},
  onAdd,
  editor = false,
  children,
}: {
  data: PublicStorefront;
  cart?: Record<string, number>;
  onAdd?: (product: PublicProduct) => void;
  editor?: boolean;
  children: ReactNode;
}) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const theme = resolveTheme(data.layout);
  const page = resolvePage(data.layout);
  useStorefrontFonts(theme);
  const value: StorefrontContextValue = {
    data,
    theme,
    page,
    cart,
    onAdd: page.orderingEnabled ? (onAdd ?? (editor ? () => undefined : undefined)) : undefined,
    categoryId,
    onCategory: setCategoryId,
    editor,
    whatsapp: page.floatingWhatsapp || data.store.phone,
  };
  return (
    <StorefrontContext.Provider value={value}>
      <div style={themeStyle(data.themeColor, theme)} className="@container min-h-full bg-[var(--sf-bg)]">
        {children}
      </div>
    </StorefrontContext.Provider>
  );
}

/** Jangkar otomatis: blok Daftar Produk pertama = #produk (dipakai tombol "Lihat Menu"). */
export function blockAnchors(blocks: StorefrontBlock[]): Record<string, string> {
  const anchors: Record<string, string> = {};
  let productsAnchored = blocks.some((b) => b.style?.anchor === 'produk');
  for (const block of blocks) {
    if (block.style?.anchor) anchors[block.id] = block.style.anchor;
    else if (block.type === 'products' && !productsAnchored) {
      anchors[block.id] = 'produk';
      productsAnchored = true;
    }
  }
  return anchors;
}

/** Merender susunan blok toko online untuk pembeli (blok tersembunyi tidak ikut). */
export function StorefrontRenderer({ data }: { data: PublicStorefront }) {
  const blocks = data.layout.blocks.filter((b) => !b.hidden && BLOCK_DEFS[b.type]);
  const anchors = blockAnchors(blocks);
  return (
    <>
      {blocks.map((block) => (
        <StorefrontBlockView key={block.id} block={block} anchor={anchors[block.id]} />
      ))}
    </>
  );
}

// ── Bingkai blok (gaya umum) ─────────────────────────────────────────

const PADDING: Record<NonNullable<BlockStyle['paddingY']>, string> = {
  none: 'py-0',
  sm: 'py-3',
  md: 'py-6',
  lg: 'py-10 @3xl:py-14',
  xl: 'py-14 @3xl:py-24',
};

function isLightColor(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return true;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

function frameStyle(style: BlockStyle): CSSProperties {
  const css: CSSProperties = {};
  switch (style.background) {
    case 'surface':
      css.background = 'var(--sf-surface)';
      break;
    case 'soft':
      css.background = 'color-mix(in srgb, var(--sf) 9%, var(--sf-bg))';
      break;
    case 'theme':
      css.background = 'var(--sf-base)';
      break;
    case 'dark':
      css.background = '#0B1F33';
      break;
    case 'custom':
      css.background = style.backgroundColor || 'transparent';
      break;
    default:
      break;
  }
  let tone = style.textTone ?? 'auto';
  if (tone === 'auto') {
    if (style.background === 'dark') tone = 'light';
    else if (style.background === 'theme') tone = 'light';
    else if (style.background === 'custom' && style.backgroundColor) tone = isLightColor(style.backgroundColor) ? 'dark' : 'light';
  }
  if (tone === 'light') {
    Object.assign(css, {
      ['--sf-text']: '#FFFFFF',
      ['--sf-muted']: 'rgb(255 255 255 / 0.78)',
      ['--sf-line']: 'rgb(255 255 255 / 0.2)',
      ['--sf-surface']: 'rgb(255 255 255 / 0.1)',
      color: '#FFFFFF',
    });
    // Di atas latar warna tema, aksen jadi putih dan teks tombol memakai warna tema.
    if (style.background === 'theme') Object.assign(css, { ['--sf']: '#FFFFFF', ['--sf-on']: 'var(--sf-base)' });
  } else if (tone === 'dark') {
    Object.assign(css, { ['--sf-text']: '#0F172A', ['--sf-muted']: '#475569', ['--sf-line']: 'rgb(15 23 42 / 0.12)', color: '#0F172A' });
  }
  return css;
}

/** Satu blok lengkap dengan bingkai gaya (latar, jarak, lebar, perataan, tampil di). */
/** Blok publik muncul halus (fade + naik) saat pertama kali masuk layar. */
function useReveal(enabled: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(!enabled);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof IntersectionObserver === 'undefined') return setShown(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);
  return [ref, shown] as const;
}

export function StorefrontBlockView({ block, anchor }: { block: StorefrontBlock; anchor?: string }) {
  const { editor } = useSf();
  const [revealRef, shown] = useReveal(!editor);
  const style: BlockStyle = { paddingY: 'sm', width: 'contained', align: 'left', showOn: 'all', ...BLOCK_DEFS[block.type]?.style, ...block.style };
  const full = style.width === 'full';
  return (
    <section
      ref={revealRef}
      id={anchor}
      data-sf-type={block.type}
      data-shown={shown}
      style={frameStyle(style)}
      className={cn(
        'scroll-mt-20 sf-reveal',
        PADDING[style.paddingY ?? 'sm'],
        style.align === 'center' && 'text-center',
        style.align === 'right' && 'text-right',
        !editor && style.showOn === 'mobile' && '@3xl:hidden',
        !editor && style.showOn === 'desktop' && 'hidden @3xl:block',
      )}
    >
      <div className={cn(!full && 'mx-auto w-full max-w-6xl px-4 @3xl:px-6')}>
        <BlockContent block={block} full={full} align={style.align ?? 'left'} />
      </div>
    </section>
  );
}

function BlockContent({ block, full, align }: { block: StorefrontBlock; full: boolean; align: string }) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock block={block} full={full} />;
    case 'slideshow':
      return <SlideshowBlock block={block} full={full} />;
    case 'announcement':
      return <AnnouncementBlock block={block} full={full} />;
    case 'categories':
      return <CategoriesBlock block={block} align={align} />;
    case 'products':
      return <ProductsBlock block={block} />;
    case 'featured':
      return <FeaturedBlock block={block} />;
    case 'image':
      return <ImageBlock block={block} full={full} />;
    case 'gallery':
      return <GalleryBlock block={block} />;
    case 'text':
      return <TextBlock block={block} />;
    case 'button':
      return <ButtonBlock block={block} align={align} />;
    case 'features':
      return <FeaturesBlock block={block} />;
    case 'testimonials':
      return <TestimonialsBlock block={block} />;
    case 'faq':
      return <FaqBlock block={block} />;
    case 'video':
      return <VideoBlock block={block} />;
    case 'countdown':
      return <CountdownBlock block={block} />;
    case 'hours':
      return <HoursBlock block={block} />;
    case 'info':
      return <InfoBlock block={block} />;
    case 'map':
      return <MapBlock block={block} />;
    case 'social':
      return <SocialBlock block={block} align={align} />;
    case 'spacer':
      return <div style={{ height: Number(prop<number>(block, 'height')) || 32 }} />;
    case 'divider':
      return <DividerBlock block={block} align={align} />;
    default:
      return null;
  }
}

// ── Bagian kecil yang dipakai bersama ────────────────────────────────

function useCardClass(): string {
  const { theme } = useSf();
  return cn(
    'rounded-[var(--sf-radius)] bg-[var(--sf-surface)]',
    theme.cardStyle === 'shadow' && 'shadow-[0_1px_2px_rgb(0_0_0/0.05),0_8px_24px_rgb(0_0_0/0.05)]',
    theme.cardStyle === 'border' && 'border border-[var(--sf-line)]',
  );
}

function Heading({ children, className, as: Tag = 'h2' }: { children: ReactNode; className?: string; as?: 'h1' | 'h2' | 'h3' }) {
  const { theme } = useSf();
  if (!children) return null;
  const size = Tag === 'h3' ? 'text-base' : theme.headingSize === 'sm' ? 'text-lg' : theme.headingSize === 'lg' ? 'text-2xl @3xl:text-3xl' : 'text-xl @3xl:text-2xl';
  return <Tag className={cn('sf-heading font-bold text-[var(--sf-text)]', size, className)}>{children}</Tag>;
}

/** Tautan yang paham "#jangkar", "wa:" dan URL luar; di editor tidak berpindah halaman. */
function SfLink({ link, className, style, children, onClick }: { link: string; className?: string; style?: CSSProperties; children: ReactNode; onClick?: () => void }) {
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

const BUTTON_SIZES = { sm: 'px-4 py-2 text-sm', md: 'px-5 py-2.5 text-[15px]', lg: 'px-7 py-3.5 text-base' };

function SfButton({ label, link, variant = 'solid', size = 'md', className }: { label: string; link: string; variant?: string; size?: keyof typeof BUTTON_SIZES; className?: string }) {
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

function Placeholder({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center rounded-[var(--sf-radius)] border-2 border-dashed border-[var(--sf-line)] p-6 text-center text-sm text-[var(--sf-muted)]', className)}>
      {label}
    </div>
  );
}

/** Blok yang isinya dari internet (video, peta): di editor ditutup lapisan supaya kliknya memilih blok. */
function EmbedShield() {
  const { editor } = useSf();
  return editor ? <div className="absolute inset-0 z-[1]" /> : null;
}

function itemsOf(block: StorefrontBlock): Item[] {
  const value = prop<unknown>(block, 'items');
  return Array.isArray(value) ? (value as Item[]) : [];
}

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

// ── Blok: banner ─────────────────────────────────────────────────────

const HERO_HEIGHT: Record<string, string> = { sm: 'min-h-[180px]', md: 'min-h-[240px] @3xl:min-h-[320px]', lg: 'min-h-[320px] @3xl:min-h-[440px]', xl: 'min-h-[460px] @3xl:min-h-[620px]' };

function HeroBlock({ block, full }: { block: StorefrontBlock; full: boolean }) {
  const { theme } = useSf();
  const imageUrl = prop<string>(block, 'imageUrl');
  const center = prop<string>(block, 'align') === 'center';
  const overlay = Math.min(90, Math.max(0, Number(prop<number>(block, 'overlay')) || 0)) / 100;
  const button = prop<string>(block, 'buttonText');
  const button2 = prop<string>(block, 'button2Text');
  const badge = prop<string>(block, 'badge');
  const titleSize = theme.headingSize === 'lg' ? 'text-4xl @3xl:text-6xl' : theme.headingSize === 'sm' ? 'text-2xl @3xl:text-4xl' : 'text-3xl @3xl:text-5xl';
  return (
    <div
      className={cn(
        'relative flex flex-col justify-end overflow-hidden p-6 text-white @3xl:p-12',
        HERO_HEIGHT[prop<string>(block, 'height')] ?? HERO_HEIGHT.md,
        !full && 'rounded-[calc(var(--sf-radius)*1.5)] shadow-lg',
        center && 'items-center text-center',
      )}
      style={
        imageUrl
          ? { backgroundImage: `linear-gradient(180deg, rgba(11,31,51,${overlay * 0.3}), rgba(11,31,51,${overlay})), url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: 'linear-gradient(135deg, #0B1F33 0%, var(--sf) 100%)' }
      }
    >
      {!imageUrl ? (
        <>
          <div className="absolute -top-16 -right-12 size-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 left-1/3 size-40 rounded-full bg-white/5" />
        </>
      ) : null}
      {badge ? <span className="relative mb-3 w-fit rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold tracking-wide backdrop-blur">{badge}</span> : null}
      <h1 className={cn('sf-heading relative leading-[1.08] font-extrabold', titleSize)}>{prop<string>(block, 'title')}</h1>
      {prop<string>(block, 'subtitle') ? <p className={cn('relative mt-3 max-w-xl text-white/85 @3xl:text-lg', center && 'mx-auto')}>{prop<string>(block, 'subtitle')}</p> : null}
      {button || button2 ? (
        <div className={cn('relative mt-6 flex flex-wrap gap-2', center && 'justify-center')}>
          {button ? <SfButton label={button} link={prop<string>(block, 'buttonLink')} variant="white" /> : null}
          {button2 ? <SfButton label={button2} link={prop<string>(block, 'button2Link')} variant="glass" /> : null}
        </div>
      ) : null}
    </div>
  );
}

function SlideshowBlock({ block, full }: { block: StorefrontBlock; full: boolean }) {
  const items = itemsOf(block);
  const [index, setIndex] = useState(0);
  const interval = Number(prop<number>(block, 'interval')) || 0;
  const count = items.length;
  const current = count ? index % count : 0;

  useEffect(() => {
    if (!interval || count < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), interval * 1000);
    return () => window.clearInterval(timer);
  }, [interval, count]);

  if (count === 0) return <Placeholder label="Tambahkan slide di panel pengaturan" className="min-h-40" />;
  const go = (delta: number) => (e: MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i + delta + count) % count);
  };

  return (
    <div className={cn('relative overflow-hidden', !full && 'rounded-[calc(var(--sf-radius)*1.5)] shadow-lg')}>
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((item) => {
          const image = str(item.imageUrl);
          return (
            <div
              key={item.id}
              className={cn('relative flex w-full shrink-0 flex-col justify-end p-6 text-left text-white @3xl:p-12', HERO_HEIGHT[prop<string>(block, 'height')] ?? HERO_HEIGHT.md)}
              style={
                image
                  ? { backgroundImage: `linear-gradient(180deg, rgba(11,31,51,0.05), rgba(11,31,51,0.7)), url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: 'linear-gradient(120deg, var(--sf) 0%, #0B1F33 100%)' }
              }
            >
              {str(item.title) ? <p className="sf-heading text-2xl font-extrabold @3xl:text-4xl">{str(item.title)}</p> : null}
              {str(item.subtitle) ? <p className="mt-1 max-w-lg text-white/85">{str(item.subtitle)}</p> : null}
              {str(item.buttonText) ? <SfButton label={str(item.buttonText)} link={str(item.link)} variant="white" size="sm" className="mt-4 w-fit" /> : null}
            </div>
          );
        })}
      </div>
      {count > 1 ? (
        <>
          <button type="button" onClick={go(-1)} aria-label="Slide sebelumnya" className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-[#0F172A] shadow">
            <ChevronLeftIcon size={18} />
          </button>
          <button type="button" onClick={go(1)} aria-label="Slide berikutnya" className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-[#0F172A] shadow">
            <ChevronRightIcon size={18} />
          </button>
          {prop<boolean>(block, 'showDots') ? (
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  aria-label={`Slide ${i + 1}`}
                  className={cn('h-2 cursor-pointer rounded-full bg-white transition-all', i === current ? 'w-6' : 'w-2 opacity-60')}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function AnnouncementBlock({ block, full }: { block: StorefrontBlock; full: boolean }) {
  const text = `${prop<string>(block, 'icon') ? `${prop<string>(block, 'icon')}  ` : ''}${prop<string>(block, 'text')}`;
  const link = prop<string>(block, 'link');
  const marquee = prop<boolean>(block, 'marquee');
  const body = marquee ? (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="inline-flex animate-marquee gap-16">
        {[0, 1, 2, 3].map((i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  ) : (
    <span>{text}</span>
  );
  const className = cn('block bg-[var(--sf)] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm', !full && 'rounded-[var(--sf-radius)]');
  return link ? (
    <SfLink link={link} className={className}>
      {body}
    </SfLink>
  ) : (
    <div className={className}>{body}</div>
  );
}

// ── Blok: produk ─────────────────────────────────────────────────────

function scrollToProducts(from: HTMLElement) {
  const root = (from.closest('[data-sf-root]') as HTMLElement | null) ?? document;
  root.querySelector('[data-sf-type="products"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function CategoriesBlock({ block, align }: { block: StorefrontBlock; align: string }) {
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

function sortProducts(list: PublicProduct[], sort: string): PublicProduct[] {
  const copy = [...list];
  if (sort === 'name') copy.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  else if (sort === 'price-asc') copy.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') copy.sort((a, b) => b.price - a.price);
  else if (sort === 'available') copy.sort((a, b) => Number(b.available) - Number(a.available));
  return copy;
}

const GRID_MOBILE: Record<string, string> = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3' };
const GRID_DESKTOP: Record<string, string> = { '2': '@3xl:grid-cols-2', '3': '@3xl:grid-cols-3', '4': '@3xl:grid-cols-4', '5': '@3xl:grid-cols-5' };

function ProductsBlock({ block }: { block: StorefrontBlock }) {
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

function ProductImage({ product, className }: { product: PublicProduct; className?: string }) {
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

function AddButton({ product, light }: { product: PublicProduct; light?: boolean }) {
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

const SoldOut = () => <span className="absolute top-2 left-2 rounded-full bg-error-600 px-2 py-0.5 text-[11px] font-bold text-white">Habis</span>;

function ProductCard({ product, showDescription }: { product: PublicProduct; showDescription: boolean }) {
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
            <p className="mt-1 font-bold">{rupiah(product.price)}</p>
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
        <p className="mt-0.5 text-sm font-bold">{rupiah(product.price)}</p>
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
          <span className="font-bold text-[var(--sf)]">{rupiah(product.price)}</span>
          <AddButton product={product} />
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product, showDescription }: { product: PublicProduct; showDescription: boolean }) {
  const card = useCardClass();
  return (
    <div className={cn(card, 'flex items-center gap-3 p-3 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgb(0_0_0/0.08)]', !product.available && 'opacity-60')}>
      <ProductImage product={product} className="size-20 shrink-0 rounded-[calc(var(--sf-radius)*0.75)]" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-semibold">{product.name}</p>
        {showDescription && product.description ? <p className="line-clamp-2 text-[13px] text-[var(--sf-muted)]">{product.description}</p> : null}
        <p className="mt-1 font-bold text-[var(--sf)]">
          {rupiah(product.price)} <span className="text-[12px] font-normal text-[var(--sf-muted)]">/ {product.unitName}</span>
        </p>
        {!product.available ? <p className="text-[12px] font-semibold text-error-600">Habis</p> : null}
      </div>
      <AddButton product={product} />
    </div>
  );
}

function FeaturedBlock({ block }: { block: StorefrontBlock }) {
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
        <p className="text-2xl font-extrabold text-[var(--sf)]">{rupiah(product.price)}</p>
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

// ── Blok: konten ─────────────────────────────────────────────────────

function ImageBlock({ block, full }: { block: StorefrontBlock; full: boolean }) {
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

function GalleryBlock({ block }: { block: StorefrontBlock }) {
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

function TextBlock({ block }: { block: StorefrontBlock }) {
  const size = prop<string>(block, 'size');
  return (
    <div className="mx-auto max-w-3xl [text-align:inherit]">
      {prop<string>(block, 'eyebrow') ? <p className="mb-1 text-[12px] font-bold tracking-[0.14em] text-[var(--sf)] uppercase">{prop<string>(block, 'eyebrow')}</p> : null}
      <Heading className="mb-2">{prop<string>(block, 'heading')}</Heading>
      <p className={cn('leading-relaxed whitespace-pre-line text-[var(--sf-muted)]', size === 'sm' && 'text-sm', size === 'lg' && 'text-lg @3xl:text-xl')}>{prop<string>(block, 'body')}</p>
    </div>
  );
}

function ButtonBlock({ block, align }: { block: StorefrontBlock; align: string }) {
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

function FeaturesBlock({ block }: { block: StorefrontBlock }) {
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

function TestimonialsBlock({ block }: { block: StorefrontBlock }) {
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

function FaqBlock({ block }: { block: StorefrontBlock }) {
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

export function youtubeId(url: string): string | null {
  const m = /(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([\w-]{11})/.exec(url);
  return m ? m[1] : null;
}

function VideoBlock({ block }: { block: StorefrontBlock }) {
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

// ── Blok: info toko ──────────────────────────────────────────────────

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function CountdownBlock({ block }: { block: StorefrontBlock }) {
  const now = useNow(1000);
  const card = useCardClass();
  const endsAt = prop<string>(block, 'endsAt');
  const target = endsAt ? new Date(endsAt).getTime() : NaN;
  const left = Number.isFinite(target) ? Math.max(0, target - now) : null;
  const units =
    left == null
      ? null
      : [
          { label: 'Hari', value: Math.floor(left / 86_400_000) },
          { label: 'Jam', value: Math.floor(left / 3_600_000) % 24 },
          { label: 'Menit', value: Math.floor(left / 60_000) % 60 },
          { label: 'Detik', value: Math.floor(left / 1000) % 60 },
        ];
  const button = prop<string>(block, 'buttonText');
  return (
    <div className={cn(card, 'p-6 text-center @3xl:p-10')}>
      <Heading>{left === 0 ? prop<string>(block, 'expiredText') : prop<string>(block, 'title')}</Heading>
      {prop<string>(block, 'subtitle') ? <p className="mt-1 text-sm text-[var(--sf-muted)]">{prop<string>(block, 'subtitle')}</p> : null}
      {units == null ? (
        <p className="mt-4 text-sm text-[var(--sf-muted)]">Atur tanggal berakhir di panel pengaturan.</p>
      ) : left! > 0 ? (
        <div className="mt-5 flex justify-center gap-2 @3xl:gap-4">
          {units.map((u) => (
            <div key={u.label} className="min-w-16 rounded-[var(--sf-radius)] bg-[var(--sf)] px-3 py-3 text-white @3xl:min-w-20">
              <span className="block text-2xl font-extrabold tabular-nums @3xl:text-4xl">{String(u.value).padStart(2, '0')}</span>
              <span className="text-[11px] font-semibold tracking-wide uppercase opacity-80">{u.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      {button && left !== 0 ? <SfButton label={button} link={prop<string>(block, 'link')} className="mt-5" /> : null}
    </div>
  );
}

const DAY_NAMES = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

function HoursBlock({ block }: { block: StorefrontBlock }) {
  const items = itemsOf(block);
  const card = useCardClass();
  const today = DAY_NAMES[new Date().getDay()];
  const highlight = prop<boolean>(block, 'highlightToday');
  return (
    <div className="mx-auto max-w-xl">
      <Heading className="mb-3">{prop<string>(block, 'title')}</Heading>
      <div className={cn(card, 'divide-y divide-[var(--sf-line)] overflow-hidden text-left')}>
        {items.map((item) => {
          const isToday = highlight && str(item.day).toLowerCase().replace("'", '').startsWith(today);
          const closed = /tutup|libur/i.test(str(item.time));
          return (
            <div key={item.id} className={cn('flex items-center justify-between gap-3 px-4 py-2.5 text-sm', isToday && 'bg-[color-mix(in_srgb,var(--sf)_10%,transparent)] font-bold')}>
              <span>
                {str(item.day)} {isToday ? <span className="ml-1 rounded-full bg-[var(--sf)] px-2 py-0.5 text-[10px] text-white">Hari ini</span> : null}
              </span>
              <span className={cn(closed && 'text-error-600')}>{str(item.time)}</span>
            </div>
          );
        })}
      </div>
      {prop<string>(block, 'note') ? <p className="mt-2 text-[13px] text-[var(--sf-muted)]">{prop<string>(block, 'note')}</p> : null}
    </div>
  );
}

function InfoBlock({ block }: { block: StorefrontBlock }) {
  const { data, editor } = useSf();
  const card = useCardClass();
  const wa = prop<string>(block, 'whatsapp').replace(/\D/g, '').replace(/^0/, '62');
  const maps = prop<string>(block, 'mapsUrl');
  const address = [data.store.address, data.store.city].filter(Boolean).join(', ');
  const stop = (e: MouseEvent) => editor && e.preventDefault();
  return (
    <div className={cn(card, 'space-y-3 p-5 text-left')}>
      <Heading>{prop<string>(block, 'title')}</Heading>
      {prop<boolean>(block, 'showAddress') && address ? (
        <p className="flex items-start gap-2 text-sm text-[var(--sf-muted)]">
          <PinIcon size={16} className="mt-0.5 shrink-0 text-[var(--sf)]" /> {address}
        </p>
      ) : null}
      {prop<string>(block, 'hours') ? (
        <p className="flex items-center gap-2 text-sm text-[var(--sf-muted)]">
          <ClockIcon size={16} className="shrink-0 text-[var(--sf)]" /> {prop<string>(block, 'hours')}
        </p>
      ) : null}
      {prop<boolean>(block, 'showPhone') && data.store.phone ? <p className="text-sm text-[var(--sf-muted)]">☎️ {data.store.phone}</p> : null}
      <div className="flex flex-wrap gap-2 pt-1">
        {wa ? (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" onClick={stop} className="rounded-[var(--sf-btn-radius)] bg-[#25D366] px-4 py-2 text-sm font-bold text-white">
            Chat WhatsApp
          </a>
        ) : null}
        {maps ? (
          <a href={maps} target="_blank" rel="noreferrer" onClick={stop} className="rounded-[var(--sf-btn-radius)] border border-[var(--sf-line)] px-4 py-2 text-sm font-bold">
            Buka Peta
          </a>
        ) : null}
      </div>
    </div>
  );
}

const MAP_HEIGHT: Record<string, number> = { sm: 220, md: 320, lg: 440 };

function MapBlock({ block }: { block: StorefrontBlock }) {
  const { data } = useSf();
  const query = prop<string>(block, 'query') || [data.store.name, data.store.address, data.store.city].filter(Boolean).join(', ');
  return (
    <div>
      <Heading className="mb-3">{prop<string>(block, 'title')}</Heading>
      {query ? (
        <div className="relative overflow-hidden rounded-[var(--sf-radius)] border border-[var(--sf-line)]" style={{ height: MAP_HEIGHT[prop<string>(block, 'height')] ?? 320 }}>
          <iframe title="Peta lokasi" src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`} loading="lazy" className="absolute inset-0 size-full border-0" />
          <EmbedShield />
        </div>
      ) : (
        <Placeholder label="Isi alamat toko di Profil Toko, atau ketik alamat di panel pengaturan" />
      )}
    </div>
  );
}

export function socialHref(platform: string, raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (platform === 'whatsapp' && !/^https?:/i.test(value)) return resolveLink(`wa:${value}`);
  if (value.startsWith('@')) {
    const user = value.slice(1);
    const bases: Record<string, string> = { instagram: 'https://instagram.com/', tiktok: 'https://tiktok.com/@', x: 'https://x.com/', youtube: 'https://youtube.com/@', facebook: 'https://facebook.com/' };
    if (bases[platform]) return bases[platform] + user;
  }
  return resolveLink(value);
}

function SocialBlock({ block, align }: { block: StorefrontBlock; align: string }) {
  const { editor } = useSf();
  const items = itemsOf(block);
  const icons = prop<string>(block, 'display') === 'icons';
  return (
    <div>
      <Heading className="mb-3">{prop<string>(block, 'title')}</Heading>
      <div className={cn('flex flex-wrap gap-2', align === 'center' && 'justify-center', align === 'right' && 'justify-end')}>
        {items.map((item) => {
          const platform = SOCIAL_PLATFORMS.find((p) => p.value === item.platform) ?? SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1];
          const href = socialHref(platform.value, str(item.url));
          return (
            <a
              key={item.id}
              href={href ?? '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => (editor || !href) && e.preventDefault()}
              title={platform.label}
              className={cn(
                'inline-flex items-center gap-2 font-semibold text-white shadow-sm transition hover:brightness-110',
                icons ? 'size-11 justify-center rounded-full text-lg' : 'rounded-[var(--sf-btn-radius)] px-4 py-2 text-sm',
                !href && 'opacity-50',
              )}
              style={{ backgroundColor: platform.color }}
            >
              <span>{platform.emoji}</span>
              {icons ? null : platform.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function DividerBlock({ block, align }: { block: StorefrontBlock; align: string }) {
  const width = prop<string>(block, 'width');
  return (
    <hr
      className={cn('border-0 border-t border-[var(--sf-line)]', width === 'short' && 'w-24', width === 'half' && 'w-1/2', align === 'center' && 'mx-auto', align === 'right' && 'ml-auto')}
      style={{ borderTopStyle: (prop<string>(block, 'lineStyle') || 'solid') as never, borderTopWidth: Number(prop<number>(block, 'thickness')) || 1 }}
    />
  );
}

// ── Header, footer, tombol WhatsApp ──────────────────────────────────

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
