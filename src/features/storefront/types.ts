import type { StorefrontBlock, PublicStorefront, PublicProduct, StorefrontTheme, StorefrontPageSettings, BlockStyle, BlockType, StorefrontLayout } from '@/types/storefront';
import type { useStorefrontEditor } from '@/features/storefront/hooks/useStorefrontEditor';

export type SfListItem = Record<string, unknown> & { id?: string };

export interface StorefrontContextValue {
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

export type BlockProps = Record<string, unknown>;

export type FieldOption = { value: string; label: string };

export interface FieldBase {
  key: string;
  label: string;
  help?: string;
  /** Tampilkan isian hanya bila kondisi terpenuhi (mis. pilih produk hanya bila sumber = manual). */
  showIf?: (props: BlockProps) => boolean;
}

/** Isian sederhana — dipakai langsung di blok maupun di dalam item daftar. */
export type SimpleFieldDef = FieldBase &
  (
    | { kind: 'text' | 'textarea' | 'image' | 'url' | 'color' | 'datetime' | 'emoji'; placeholder?: string }
    | { kind: 'select'; options: FieldOption[]; segmented?: boolean }
    | { kind: 'number'; min?: number; max?: number; step?: number; suffix?: string }
    | { kind: 'range'; min: number; max: number; step?: number; suffix?: string }
    | { kind: 'toggle' }
  );

/** Satu isian yang bisa diubah pemilik toko di panel pengaturan blok. */
export type FieldDef =
  | SimpleFieldDef
  | (FieldBase & { kind: 'category' })
  | (FieldBase & { kind: 'product' })
  | (FieldBase & { kind: 'products'; max?: number })
  | (FieldBase & {
      kind: 'list';
      itemLabel: string;
      itemFields: SimpleFieldDef[];
      newItem: () => BlockProps;
      /** Isian yang dipakai sebagai judul item di daftar. */
      titleKey: string;
      max?: number;
    });

export type BlockGroup = 'utama' | 'produk' | 'konten' | 'info' | 'tata';

export interface BlockDef {
  type: BlockType;
  group: BlockGroup;
  label: string;
  description: string;
  emoji: string;
  defaults: BlockProps;
  style?: BlockStyle;
  fields: FieldDef[];
}

export type EditorDevice = 'mobile' | 'tablet' | 'desktop';

export type EditorPanelKey = 'blocks' | 'layers' | 'templates' | 'theme' | 'page';

/** Bagian halaman (bukan blok) yang sedang dipilih di editor. */
export type PageSelection = 'header' | 'footer' | null;

/** Seluruh isi editor dalam satu objek — satu riwayat Undo/Redo. */
export interface EditorDoc {
  slug: string;
  published: boolean;
  themeColor: string;
  blocks: StorefrontBlock[];
  theme: StorefrontTheme;
  page: StorefrontPageSettings;
}

/** Semua state & aksi editor toko online (hasil useStorefrontEditor). */
export type StorefrontEditor = ReturnType<typeof useStorefrontEditor>;

export type InspectorListItem = BlockProps & { id: string };

export type InspectorTab = 'content' | 'style' | 'advanced';

export interface InspectorProps {
  block: StorefrontBlock;
  products: PublicProduct[];
  categories: { id: string; name: string }[];
  /** `key` dipakai untuk menggabungkan ketikan beruntun jadi satu langkah undo. */
  onChange: (patch: Partial<StorefrontBlock>, key?: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export interface StorefrontTemplate {
  key: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
  build: (storeName: string) => StorefrontLayout;
}

export interface CartLine {
  product: PublicProduct;
  quantity: number;
  notes?: string;
}

export interface EditorHistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface EditorShortcutActions {
  save: () => Promise<void> | void;
  undo: () => void;
  redo: () => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (id: string, delta: number) => void;
  /** Esc: batal pilih & keluar dari pratinjau. */
  clear: () => void;
}
