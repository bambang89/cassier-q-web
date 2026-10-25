import type { CSSProperties } from 'react';
import { closestCenter, pointerWithin } from '@dnd-kit/core';
import type { CollisionDetection } from '@dnd-kit/core';

import type { Product } from '@/types/models';
import type { StorefrontTheme, StorefrontBlock, BlockStyle, PublicProduct, BlockType, StorefrontLayout, StorefrontPageSettings } from '@/types/storefront';
import { BTN_RADIUS, RADIUS, FONTS, DEFAULT_THEME, DEFAULT_PAGE, LAYER_PREFIX, PALETTE_PREFIX } from '@/features/storefront/constants';
import type { SfListItem, BlockProps, EditorDoc } from '@/features/storefront/types';
import { BLOCK_DEFS } from '@/features/storefront/blockDefs';
import { uid } from '@/features/storefront/blockDefs/shared';

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

export function isLightColor(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return true;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

export function frameStyle(style: BlockStyle): CSSProperties {
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

export function itemsOf(block: StorefrontBlock): SfListItem[] {
  const value = prop<unknown>(block, 'items');
  return Array.isArray(value) ? (value as SfListItem[]) : [];
}

export const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export function scrollToProducts(from: HTMLElement) {
  const root = (from.closest('[data-sf-root]') as HTMLElement | null) ?? document;
  root.querySelector('[data-sf-type="products"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function sortProducts(list: PublicProduct[], sort: string): PublicProduct[] {
  const copy = [...list];
  if (sort === 'name') copy.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  else if (sort === 'price-asc') copy.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') copy.sort((a, b) => b.price - a.price);
  else if (sort === 'available') copy.sort((a, b) => Number(b.available) - Number(a.available));
  return copy;
}

export function youtubeId(url: string): string | null {
  const m = /(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([\w-]{11})/.exec(url);
  return m ? m[1] : null;
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

export function newBlockId(): string {
  return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Salin isi bawaan secara dalam supaya item daftar tidak berbagi objek/id antar blok. */
export function cloneDefaults(type: BlockType): BlockProps {
  const props = JSON.parse(JSON.stringify(BLOCK_DEFS[type].defaults)) as BlockProps;
  for (const value of Object.values(props)) {
    if (Array.isArray(value)) value.forEach((item) => item && typeof item === 'object' && ((item as BlockProps).id = uid()));
  }
  return props;
}

/** Pastikan setiap item daftar punya id (dibutuhkan untuk diseret di editor). */
export function ensureItemIds(props: BlockProps): BlockProps {
  for (const [key, value] of Object.entries(props)) {
    if (Array.isArray(value) && value.some((item) => item && typeof item === 'object' && !(item as BlockProps).id)) {
      props[key] = value.map((item) => (item && typeof item === 'object' && !(item as BlockProps).id ? { ...(item as BlockProps), id: uid() } : item));
    }
  }
  return props;
}

export function createBlock(type: BlockType, props?: BlockProps, style?: BlockStyle): StorefrontBlock {
  const block: StorefrontBlock = { id: newBlockId(), type, props: ensureItemIds({ ...cloneDefaults(type), ...props }) };
  if (style || BLOCK_DEFS[type].style) block.style = { ...BLOCK_DEFS[type].style, ...style };
  return block;
}

/** Salinan blok dengan id baru (termasuk id item di dalamnya). */
export function cloneBlock(block: StorefrontBlock): StorefrontBlock {
  const copy = JSON.parse(JSON.stringify(block)) as StorefrontBlock;
  copy.id = newBlockId();
  copy.locked = false;
  for (const value of Object.values(copy.props)) {
    if (Array.isArray(value)) value.forEach((item) => item && typeof item === 'object' && ((item as BlockProps).id = uid()));
  }
  return copy;
}

/** Ambil isian blok dengan default bila belum diisi. */
export function prop<T>(block: StorefrontBlock, key: string): T {
  const value = block.props[key];
  return (value === undefined ? BLOCK_DEFS[block.type]?.defaults[key] : value) as T;
}

/** Isian blok lengkap dengan default (untuk showIf di editor). */
export function propsWithDefaults(block: StorefrontBlock): BlockProps {
  const props = { ...BLOCK_DEFS[block.type].defaults, ...block.props };
  // Blok "Daftar Produk" versi awal hanya punya categoryId.
  if (block.type === 'products' && block.props.source === undefined) props.source = block.props.categoryId ? 'category' : 'all';
  return props;
}

export function blockLabel(block: StorefrontBlock): string {
  return block.name?.trim() || BLOCK_DEFS[block.type]?.label || block.type;
}

export function resolveTheme(layout: StorefrontLayout | null | undefined): StorefrontTheme {
  return { ...DEFAULT_THEME, ...layout?.theme };
}

export function resolvePage(layout: StorefrontLayout | null | undefined): StorefrontPageSettings {
  return { ...DEFAULT_PAGE, ...layout?.page };
}

/** Susunan awal yang langsung layak terbit. */
export function defaultLayout(storeName: string): StorefrontLayout {
  return {
    version: 2,
    blocks: [
      createBlock('hero', { title: storeName }),
      createBlock('categories'),
      createBlock('products'),
      createBlock('info'),
    ],
    theme: { ...DEFAULT_THEME },
    page: { ...DEFAULT_PAGE },
  };
}

/** Ubah tautan isian blok jadi href: "#produk", "wa:0812…", "https://…". */
export function resolveLink(link: string | undefined | null, whatsapp?: string | null): string | null {
  const value = (link ?? '').trim();
  if (!value) return null;
  if (value.startsWith('#')) return value;
  if (value.startsWith('wa:')) {
    const number = (value.slice(3) || whatsapp || '').replace(/\D/g, '').replace(/^0/, '62');
    return number ? `https://wa.me/${number}` : null;
  }
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return `https://${value}`;
}

/**
 * Nomor meja di URL di-encode base64url (UTF-8, tanpa "="):
 * "Meja 2" → /toko/<slug>/TWVqYSAy. Tidak terbaca langsung, tapi bisa di-decode balik.
 */
export function encodeTable(label: string): string {
  const bytes = new TextEncoder().encode(label.trim());
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Kebalikan encodeTable; null bila bukan hasil encode yang valid. */
export function decodeTable(code: string): string | null {
  if (!/^[A-Za-z0-9_-]{2,80}$/.test(code)) return null;
  try {
    const base64 = code.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (code.length % 4)) % 4);
    const binary = atob(base64);
    const label = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))).trim();
    return label && label.length <= 40 && !/[\u0000-\u001f]/.test(label) ? label : null;
  } catch {
    return null;
  }
}

export function newTable(label: string): { id: string; label: string; code: string } {
  return { id: uid(), label, code: encodeTable(label) };
}

/**
 * Meja dari segmen URL. Bila pemilik mengisi daftar meja, hanya meja terdaftar yang diterima;
 * bila daftar kosong, nomor meja hasil decode langsung dipakai.
 */
export function resolveTable(code: string, tables: { label: string; code: string }[]): string | null {
  const label = decodeTable(code);
  if (tables.length === 0) return label;
  const match = tables.find((t) => t.code === code || (label !== null && t.label.trim().toLowerCase() === label.toLowerCase()));
  return match ? match.label : null;
}

/** Bandingkan isi editor (untuk status "ada perubahan"). */
export const snapshotDoc = (doc: EditorDoc) => JSON.stringify(doc);

/** Produk katalog → bentuk produk toko online (untuk pratinjau editor, tanpa harga modal). */
export function toPublicProduct(p: Product): PublicProduct {
  return {
    id: p.id,
    name: p.productName,
    categoryId: p.categoryId,
    categoryName: p.categoryName,
    description: p.description,
    imageUrl: p.imageUrl,
    unitName: p.baseUnitName,
    price: p.sellingPrice,
    available: p.stockQuantity > 0,
    bundle: p.productType === 'BUNDLE',
  };
}

/**
 * Deteksi tabrakan editor: blok baru dari palet memakai posisi pointer (jatuh tepat di blok
 * yang ditunjuk), urutan di panel Lapisan hanya melawan baris lapisan, dan blok di kanvas
 * hanya melawan blok kanvas.
 */
export const builderCollision: CollisionDetection = (args) => {
  const id = String(args.active.id);
  const containers = args.droppableContainers;
  if (id.startsWith(PALETTE_PREFIX)) {
    const hits = pointerWithin({ ...args, droppableContainers: containers.filter((c) => !String(c.id).startsWith(LAYER_PREFIX)) });
    const block = hits.find((c) => c.id !== 'canvas');
    return block ? [block] : hits;
  }
  if (id.startsWith(LAYER_PREFIX)) return closestCenter({ ...args, droppableContainers: containers.filter((c) => String(c.id).startsWith(LAYER_PREFIX)) });
  return closestCenter({ ...args, droppableContainers: containers.filter((c) => c.id !== 'canvas' && !String(c.id).startsWith(LAYER_PREFIX)) });
};
