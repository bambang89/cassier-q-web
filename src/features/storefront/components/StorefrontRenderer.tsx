'use client';

import type { BlockStyle, PublicStorefront, StorefrontBlock } from '@/types/storefront';
import { cn } from '@/utils/cn';
import { PADDING } from '@/features/storefront/constants';
import { blockAnchors, frameStyle, prop } from '@/features/storefront/utils';
import { useSf } from '@/features/storefront/hooks/useSf';
import { useReveal } from '@/features/storefront/hooks/useReveal';
import { HeroBlock, SlideshowBlock, AnnouncementBlock } from '@/features/storefront/components/renderer/BannerBlocks';
import { CategoriesBlock, ProductsBlock, FeaturedBlock } from '@/features/storefront/components/renderer/ProductBlocks';
import { ImageBlock, GalleryBlock, TextBlock, ButtonBlock, FeaturesBlock, TestimonialsBlock, FaqBlock, VideoBlock } from '@/features/storefront/components/renderer/ContentBlocks';
import { CountdownBlock, HoursBlock, InfoBlock, MapBlock, SocialBlock, DividerBlock } from '@/features/storefront/components/renderer/InfoBlocks';
import { BLOCK_DEFS } from '@/features/storefront/blockDefs';

// ── Konteks bersama ──────────────────────────────────────────────────

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

// ── Blok: banner ─────────────────────────────────────────────────────

// ── Blok: produk ─────────────────────────────────────────────────────

// ── Blok: konten ─────────────────────────────────────────────────────

// ── Blok: info toko ──────────────────────────────────────────────────

// ── Header, footer, tombol WhatsApp ──────────────────────────────────

