// Toko online & Pesanan — padanan DTO backend (storefront, customerorder).

export type BlockType =
  | 'hero'
  | 'slideshow'
  | 'announcement'
  | 'categories'
  | 'products'
  | 'featured'
  | 'image'
  | 'gallery'
  | 'text'
  | 'button'
  | 'features'
  | 'testimonials'
  | 'faq'
  | 'video'
  | 'countdown'
  | 'hours'
  | 'info'
  | 'map'
  | 'social'
  | 'spacer'
  | 'divider';

/** Gaya tampilan yang sama untuk semua jenis blok (tab "Gaya" di editor). */
export interface BlockStyle {
  background?: 'none' | 'surface' | 'soft' | 'theme' | 'dark' | 'custom';
  backgroundColor?: string;
  textTone?: 'auto' | 'light' | 'dark';
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  width?: 'contained' | 'full';
  align?: 'left' | 'center' | 'right';
  showOn?: 'all' | 'mobile' | 'desktop';
  /** Id jangkar (#...) supaya tombol/tautan bisa melompat ke blok ini. */
  anchor?: string;
}

export interface StorefrontBlock {
  id: string;
  type: BlockType;
  hidden?: boolean;
  /** Blok terkunci tidak bisa diseret atau dihapus. */
  locked?: boolean;
  /** Nama di panel Lapisan (kosong = nama jenis blok). */
  name?: string;
  // Isi per jenis blok (lihat lib/storefront/blocks.ts).
  props: Record<string, unknown>;
  style?: BlockStyle;
}

export type FontKey = 'jakarta' | 'poppins' | 'nunito' | 'dmsans' | 'fredoka' | 'space' | 'playfair' | 'lora' | 'dmserif';

/** Tema global toko (tab "Tema"). */
export interface StorefrontTheme {
  font: FontKey;
  headingFont: FontKey;
  headingSize: 'sm' | 'md' | 'lg';
  background: string;
  surface: string;
  text: string;
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  buttonShape: 'square' | 'rounded' | 'pill';
  cardStyle: 'shadow' | 'border' | 'flat';
  productCard: 'classic' | 'minimal' | 'overlay';
}

/** Satu meja; link pesannya /toko/<slug>/<code>. */
export interface StorefrontTable {
  id: string;
  label: string;
  code: string;
}

/** Pengaturan halaman: header, footer, pemesanan, SEO (tab "Halaman"). */
export interface StorefrontPageSettings {
  headerShow: boolean;
  headerStyle: 'light' | 'theme' | 'transparent';
  headerSticky: boolean;
  headerShowLogo: boolean;
  headerTagline: string;
  footerShow: boolean;
  footerText: string;
  footerPoweredBy: boolean;
  floatingWhatsapp: string;
  orderingEnabled: boolean;
  fulfillments: Fulfillment[];
  minOrder: number;
  closedMessage: string;
  checkoutNote: string;
  /** Daftar meja (opsional). Kosong = pembeli mengetik nomor meja sendiri. */
  tables: StorefrontTable[];
  seoTitle: string;
  seoDescription: string;
}

export interface StorefrontLayout {
  /** 1 = hanya blok (versi awal), 2 = + tema & pengaturan halaman. */
  version: 1 | 2;
  blocks: StorefrontBlock[];
  theme?: Partial<StorefrontTheme>;
  page?: Partial<StorefrontPageSettings>;
}

export interface StorefrontSettings {
  slug: string;
  published: boolean;
  themeColor: string | null;
  layout: StorefrontLayout | null;
  updatedAt: string | null;
  saved: boolean;
  storeName: string;
}

export interface PublicProduct {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string | null;
  imageUrl: string | null;
  unitName: string;
  price: number;
  available: boolean;
  bundle: boolean;
}

export interface PublicStorefront {
  slug: string;
  themeColor: string | null;
  layout: StorefrontLayout;
  store: { name: string; address: string | null; city: string | null; phone: string | null; logoUrl: string | null };
  categories: { id: string; name: string }[];
  products: PublicProduct[];
}

export type CustomerOrderStatus = 'NEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type Fulfillment = 'PICKUP' | 'DELIVERY' | 'DINE_IN' | 'TAKEAWAY';

export interface CustomerOrderItem {
  id: string;
  productId: string;
  unitId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string | null;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  source: 'ONLINE' | 'POS';
  status: CustomerOrderStatus;
  fulfillment: Fulfillment;
  customerName: string;
  customerPhone: string | null;
  customerId: string | null;
  tableLabel: string | null;
  deliveryAddress: string | null;
  notes: string | null;
  subtotal: number;
  salesTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
  items: CustomerOrderItem[];
}

export interface OrderCounts {
  newCount: number;
  acceptedCount: number;
  inProgressCount: number;
  readyCount: number;
}

export interface PublicOrderStatus {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  fulfillment: Fulfillment;
  subtotal: number;
  createdAt: string;
  items: CustomerOrderItem[];
}

export interface PublicOrderRequest {
  customerName: string;
  customerPhone?: string;
  fulfillment: Fulfillment;
  tableLabel?: string;
  deliveryAddress?: string;
  notes?: string;
  items: { productId: string; quantity: number; notes?: string }[];
}
