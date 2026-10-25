import type { StorefrontTheme, BlockStyle, FontKey, StorefrontPageSettings, Fulfillment } from '@/types/storefront';
import type { BlockGroup, EditorDevice, EditorPanelKey } from '@/features/storefront/types';

export const RADIUS: Record<StorefrontTheme['radius'], string> = { none: '0px', sm: '6px', md: '10px', lg: '16px', xl: '24px' };

export const BTN_RADIUS: Record<StorefrontTheme['buttonShape'], string> = { square: '0px', rounded: '10px', pill: '999px' };

export const PADDING: Record<NonNullable<BlockStyle['paddingY']>, string> = {
  none: 'py-0',
  sm: 'py-3',
  md: 'py-6',
  lg: 'py-10 @3xl:py-14',
  xl: 'py-14 @3xl:py-24',
};

export const BUTTON_SIZES = { sm: 'px-4 py-2 text-sm', md: 'px-5 py-2.5 text-[15px]', lg: 'px-7 py-3.5 text-base' };

export const HERO_HEIGHT: Record<string, string> = { sm: 'min-h-[180px]', md: 'min-h-[240px] @3xl:min-h-[320px]', lg: 'min-h-[320px] @3xl:min-h-[440px]', xl: 'min-h-[460px] @3xl:min-h-[620px]' };

export const GRID_MOBILE: Record<string, string> = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3' };

export const GRID_DESKTOP: Record<string, string> = { '2': '@3xl:grid-cols-2', '3': '@3xl:grid-cols-3', '4': '@3xl:grid-cols-4', '5': '@3xl:grid-cols-5' };

export const DAY_NAMES = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

export const MAP_HEIGHT: Record<string, number> = { sm: 220, md: 320, lg: 440 };

export const BLOCK_GROUPS: { key: BlockGroup; label: string }[] = [
  { key: 'utama', label: 'Banner & Sorotan' },
  { key: 'produk', label: 'Produk & Katalog' },
  { key: 'konten', label: 'Konten' },
  { key: 'info', label: 'Info Toko' },
  { key: 'tata', label: 'Tata Letak' },
];

/** Batas backend (StorefrontService.MAX_BLOCKS). */
export const MAX_BLOCKS = 40;

export const FONTS: Record<FontKey, { label: string; css: string; google?: string; serif?: boolean }> = {
  jakarta: { label: 'Plus Jakarta Sans', css: 'var(--font-sans)' },
  poppins: { label: 'Poppins', css: "'Poppins', sans-serif", google: 'Poppins:wght@400;500;600;700;800' },
  nunito: { label: 'Nunito', css: "'Nunito', sans-serif", google: 'Nunito:wght@400;600;700;800' },
  dmsans: { label: 'DM Sans', css: "'DM Sans', sans-serif", google: 'DM+Sans:wght@400;500;700' },
  fredoka: { label: 'Fredoka (ceria)', css: "'Fredoka', sans-serif", google: 'Fredoka:wght@400;500;600;700' },
  space: { label: 'Space Grotesk', css: "'Space Grotesk', sans-serif", google: 'Space+Grotesk:wght@400;500;700' },
  playfair: { label: 'Playfair Display (serif)', css: "'Playfair Display', serif", google: 'Playfair+Display:wght@500;700;800', serif: true },
  lora: { label: 'Lora (serif)', css: "'Lora', serif", google: 'Lora:wght@400;600;700', serif: true },
  dmserif: { label: 'DM Serif Display', css: "'DM Serif Display', serif", google: 'DM+Serif+Display', serif: true },
};

export const DEFAULT_THEME: StorefrontTheme = {
  font: 'jakarta',
  headingFont: 'jakarta',
  headingSize: 'md',
  background: '#F7F8FB',
  surface: '#FFFFFF',
  text: '#0F172A',
  radius: 'lg',
  buttonShape: 'pill',
  cardStyle: 'shadow',
  productCard: 'classic',
};

export const DEFAULT_PAGE: StorefrontPageSettings = {
  headerShow: true,
  headerStyle: 'light',
  headerSticky: true,
  headerShowLogo: true,
  headerTagline: '',
  footerShow: true,
  footerText: '',
  footerPoweredBy: true,
  floatingWhatsapp: '',
  orderingEnabled: true,
  fulfillments: ['PICKUP', 'DELIVERY', 'DINE_IN'],
  minOrder: 0,
  closedMessage: 'Toko sedang tidak menerima pesanan online. Silakan lihat-lihat dulu ya!',
  checkoutNote: 'Pembayaran dilakukan di toko saat pesanan diambil/diantar.',
  tables: [],
  seoTitle: '',
  seoDescription: '',
};

/** Gaya siap pakai di tab Tema: warna + font + bentuk sekaligus. */
export const THEME_STYLES: { key: string; label: string; color: string; theme: Partial<StorefrontTheme> }[] = [
  { key: 'modern', label: 'Modern', color: '#2563EB', theme: { ...DEFAULT_THEME } },
  {
    key: 'kafe',
    label: 'Kafe Hangat',
    color: '#9A5B2E',
    theme: { font: 'nunito', headingFont: 'playfair', background: '#FBF7F2', surface: '#FFFFFF', text: '#3B2A1F', radius: 'lg', buttonShape: 'pill', cardStyle: 'border', productCard: 'classic', headingSize: 'lg' },
  },
  {
    key: 'segar',
    label: 'Segar',
    color: '#059669',
    theme: { font: 'poppins', headingFont: 'poppins', background: '#F3FBF7', surface: '#FFFFFF', text: '#0B2B20', radius: 'xl', buttonShape: 'pill', cardStyle: 'shadow', productCard: 'classic', headingSize: 'md' },
  },
  {
    key: 'gelap',
    label: 'Elegan Gelap',
    color: '#E2B04A',
    theme: { font: 'dmsans', headingFont: 'dmserif', background: '#0F1115', surface: '#1A1D24', text: '#F3F4F6', radius: 'md', buttonShape: 'rounded', cardStyle: 'border', productCard: 'overlay', headingSize: 'lg' },
  },
  {
    key: 'ceria',
    label: 'Ceria',
    color: '#DB2777',
    theme: { font: 'fredoka', headingFont: 'fredoka', background: '#FFF5FA', surface: '#FFFFFF', text: '#3A0D24', radius: 'xl', buttonShape: 'pill', cardStyle: 'shadow', productCard: 'classic', headingSize: 'lg' },
  },
  {
    key: 'minimal',
    label: 'Minimalis',
    color: '#111827',
    theme: { font: 'space', headingFont: 'space', background: '#FFFFFF', surface: '#FFFFFF', text: '#111827', radius: 'none', buttonShape: 'square', cardStyle: 'flat', productCard: 'minimal', headingSize: 'md' },
  },
];

export const THEME_PRESETS = ['#2563EB', '#0F766E', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#9A5B2E', '#E2B04A', '#0B1F33'];


export const EDITOR_DEVICES: { key: EditorDevice; label: string; icon: string; width: number }[] = [
  { key: 'mobile', label: 'HP', icon: '📱', width: 390 },
  { key: 'tablet', label: 'Tablet', icon: '📲', width: 768 },
  { key: 'desktop', label: 'Desktop', icon: '🖥', width: 1200 },
];

export const EDITOR_PANELS: { key: EditorPanelKey; label: string; icon: string }[] = [
  { key: 'blocks', label: 'Blok', icon: '➕' },
  { key: 'layers', label: 'Lapisan', icon: '🗂' },
  { key: 'templates', label: 'Template', icon: '🧩' },
  { key: 'theme', label: 'Tema', icon: '🎨' },
  { key: 'page', label: 'Halaman', icon: '⚙️' },
];

/** Kunci localStorage draf editor yang belum disimpan. */
export const EDITOR_DRAFT_KEY = 'cassierq.storefront.draft.v2';

export const EMOJIS = ['🎉', '🔥', '⭐', '✅', '⚡', '🌿', '💳', '🚚', '🛵', '☕', '🍵', '🍰', '🍔', '🍜', '🍗', '🥤', '💊', '🧺', '🔧', '👗', '🎁', '💯', '❤️', '📍', '🕘', '📣', '🛒', '👩‍🍳', '👨‍⚕️', '✨', '🏷️', '💬'];

export const BG_OPTIONS: { value: NonNullable<BlockStyle['background']>; label: string; swatch: string }[] = [
  { value: 'none', label: 'Tanpa', swatch: 'repeating-conic-gradient(#e2e8f0 0 25%, #fff 0 50%) 50% / 10px 10px' },
  { value: 'surface', label: 'Kartu', swatch: '#ffffff' },
  { value: 'soft', label: 'Lembut', swatch: 'color-mix(in srgb, var(--sf-preview, #2563eb) 15%, white)' },
  { value: 'theme', label: 'Tema', swatch: 'var(--sf-preview, #2563eb)' },
  { value: 'dark', label: 'Gelap', swatch: '#0B1F33' },
  { value: 'custom', label: 'Lainnya', swatch: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' },
];

export const FONT_OPTIONS = (Object.keys(FONTS) as FontKey[]).map((key) => ({ value: key, label: FONTS[key].label }));

export const FULFILLMENT_LABELS: { value: Fulfillment; label: string }[] = [
  { value: 'PICKUP', label: 'Ambil di toko' },
  { value: 'DELIVERY', label: 'Diantar' },
  { value: 'DINE_IN', label: 'Makan di tempat' },
];

export const MAX_TABLES = 200;

export const PALETTE_PREFIX = 'palette:';

export const LAYER_PREFIX = 'layer:';
