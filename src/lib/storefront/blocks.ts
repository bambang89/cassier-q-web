import type {
  BlockStyle,
  BlockType,
  FontKey,
  StorefrontBlock,
  StorefrontLayout,
  StorefrontPageSettings,
  StorefrontTheme,
} from '@/types/storefront';

type Props = Record<string, unknown>;
type Option = { value: string; label: string };

interface FieldBase {
  key: string;
  label: string;
  help?: string;
  /** Tampilkan isian hanya bila kondisi terpenuhi (mis. pilih produk hanya bila sumber = manual). */
  showIf?: (props: Props) => boolean;
}

/** Isian sederhana — dipakai langsung di blok maupun di dalam item daftar. */
export type SimpleFieldDef = FieldBase &
  (
    | { kind: 'text' | 'textarea' | 'image' | 'url' | 'color' | 'datetime' | 'emoji'; placeholder?: string }
    | { kind: 'select'; options: Option[]; segmented?: boolean }
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
      newItem: () => Props;
      /** Isian yang dipakai sebagai judul item di daftar. */
      titleKey: string;
      max?: number;
    });

export type BlockGroup = 'utama' | 'produk' | 'konten' | 'info' | 'tata';

export const BLOCK_GROUPS: { key: BlockGroup; label: string }[] = [
  { key: 'utama', label: 'Banner & Sorotan' },
  { key: 'produk', label: 'Produk & Katalog' },
  { key: 'konten', label: 'Konten' },
  { key: 'info', label: 'Info Toko' },
  { key: 'tata', label: 'Tata Letak' },
];

export interface BlockDef {
  type: BlockType;
  group: BlockGroup;
  label: string;
  description: string;
  emoji: string;
  defaults: Props;
  style?: BlockStyle;
  fields: FieldDef[];
}

const LINK_HELP = 'Tautan web (https://…), nomor WA (wa:0812…), atau lompat ke blok (#produk).';

const HEIGHTS: Option[] = [
  { value: 'sm', label: 'Pendek' },
  { value: 'md', label: 'Sedang' },
  { value: 'lg', label: 'Tinggi' },
  { value: 'xl', label: 'Layar penuh' },
];

const ASPECTS: Option[] = [
  { value: 'auto', label: 'Asli' },
  { value: '21/9', label: '21:9' },
  { value: '16/9', label: '16:9' },
  { value: '4/3', label: '4:3' },
  { value: '1/1', label: '1:1' },
];

const COLS = (values: string[]): Option[] => values.map((v) => ({ value: v, label: v }));

const uid = () => Math.random().toString(36).slice(2, 9);

export const SOCIAL_PLATFORMS: { value: string; label: string; emoji: string; color: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', emoji: '💬', color: '#25D366' },
  { value: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C' },
  { value: 'tiktok', label: 'TikTok', emoji: '🎵', color: '#111111' },
  { value: 'facebook', label: 'Facebook', emoji: '👍', color: '#1877F2' },
  { value: 'youtube', label: 'YouTube', emoji: '▶️', color: '#FF0000' },
  { value: 'x', label: 'X / Twitter', emoji: '✖️', color: '#111111' },
  { value: 'shopee', label: 'Shopee', emoji: '🛒', color: '#EE4D2D' },
  { value: 'tokopedia', label: 'Tokopedia', emoji: '🟢', color: '#03AC0E' },
  { value: 'gofood', label: 'GoFood', emoji: '🛵', color: '#00AA13' },
  { value: 'grabfood', label: 'GrabFood', emoji: '🍱', color: '#00B14F' },
  { value: 'website', label: 'Website', emoji: '🌐', color: '#334155' },
];

export const BLOCK_DEFS: Record<BlockType, BlockDef> = {
  hero: {
    type: 'hero',
    group: 'utama',
    label: 'Banner Utama',
    description: 'Judul besar, ajakan, dan gambar latar',
    emoji: '🖼️',
    defaults: {
      badge: '',
      title: 'Selamat datang!',
      subtitle: 'Pesan online, ambil tanpa antre.',
      imageUrl: '',
      buttonText: 'Lihat Menu',
      buttonLink: '#produk',
      button2Text: '',
      button2Link: '',
      align: 'left',
      height: 'md',
      overlay: 55,
    },
    fields: [
      { key: 'badge', label: 'Label kecil', kind: 'text', placeholder: 'mis. Baru buka!' },
      { key: 'title', label: 'Judul', kind: 'text' },
      { key: 'subtitle', label: 'Subjudul', kind: 'textarea' },
      { key: 'imageUrl', label: 'Gambar latar', kind: 'image' },
      { key: 'overlay', label: 'Gelapkan gambar', kind: 'range', min: 0, max: 90, step: 5, suffix: '%', showIf: (p) => !!p.imageUrl },
      { key: 'buttonText', label: 'Teks tombol utama', kind: 'text', placeholder: 'Kosongkan bila tanpa tombol' },
      { key: 'buttonLink', label: 'Tautan tombol utama', kind: 'url', help: LINK_HELP, showIf: (p) => !!p.buttonText },
      { key: 'button2Text', label: 'Teks tombol kedua', kind: 'text', placeholder: 'Opsional' },
      { key: 'button2Link', label: 'Tautan tombol kedua', kind: 'url', help: LINK_HELP, showIf: (p) => !!p.button2Text },
      { key: 'align', label: 'Posisi teks', kind: 'select', segmented: true, options: [{ value: 'left', label: 'Kiri' }, { value: 'center', label: 'Tengah' }] },
      { key: 'height', label: 'Tinggi banner', kind: 'select', segmented: true, options: HEIGHTS },
    ],
  },
  slideshow: {
    type: 'slideshow',
    group: 'utama',
    label: 'Slide Promo',
    description: 'Beberapa banner bergeser otomatis',
    emoji: '🎞️',
    defaults: {
      items: [
        { id: uid(), imageUrl: '', title: 'Promo Spesial', subtitle: 'Diskon untuk menu pilihan', buttonText: 'Pesan', link: '#produk' },
        { id: uid(), imageUrl: '', title: 'Menu Baru', subtitle: 'Coba rasa terbaru kami', buttonText: '', link: '' },
      ],
      interval: 5,
      height: 'md',
      showDots: true,
    },
    fields: [
      {
        key: 'items',
        label: 'Slide',
        kind: 'list',
        itemLabel: 'Slide',
        titleKey: 'title',
        max: 8,
        newItem: () => ({ id: uid(), imageUrl: '', title: 'Slide baru', subtitle: '', buttonText: '', link: '' }),
        itemFields: [
          { key: 'imageUrl', label: 'Gambar', kind: 'image' },
          { key: 'title', label: 'Judul', kind: 'text' },
          { key: 'subtitle', label: 'Subjudul', kind: 'text' },
          { key: 'buttonText', label: 'Teks tombol', kind: 'text' },
          { key: 'link', label: 'Tautan', kind: 'url' },
        ],
      },
      { key: 'interval', label: 'Ganti otomatis tiap', kind: 'number', min: 0, max: 30, suffix: 'detik (0 = manual)' },
      { key: 'height', label: 'Tinggi', kind: 'select', segmented: true, options: HEIGHTS.slice(0, 3) },
      { key: 'showDots', label: 'Tampilkan titik navigasi', kind: 'toggle' },
    ],
  },
  announcement: {
    type: 'announcement',
    group: 'utama',
    label: 'Pengumuman',
    description: 'Pita info singkat, mis. promo hari ini',
    emoji: '📣',
    defaults: { icon: '🎉', text: 'Gratis ongkir untuk pembelian di atas Rp100.000!', link: '', marquee: false },
    fields: [
      { key: 'icon', label: 'Ikon', kind: 'emoji' },
      { key: 'text', label: 'Teks pengumuman', kind: 'text' },
      { key: 'link', label: 'Tautan (opsional)', kind: 'url', help: LINK_HELP },
      { key: 'marquee', label: 'Teks berjalan', kind: 'toggle' },
    ],
  },
  categories: {
    type: 'categories',
    group: 'produk',
    label: 'Kategori',
    description: 'Tombol kategori untuk menyaring produk',
    emoji: '🗂️',
    defaults: { title: 'Kategori', display: 'chips', showAll: true },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      {
        key: 'display',
        label: 'Tampilan',
        kind: 'select',
        segmented: true,
        options: [
          { value: 'chips', label: 'Pil' },
          { value: 'grid', label: 'Kotak' },
          { value: 'list', label: 'Daftar' },
        ],
      },
      { key: 'showAll', label: 'Tampilkan pilihan "Semua"', kind: 'toggle' },
    ],
  },
  products: {
    type: 'products',
    group: 'produk',
    label: 'Daftar Produk',
    description: 'Grid / daftar / geser produk yang bisa dipesan',
    emoji: '🛍️',
    defaults: {
      title: 'Produk Kami',
      subtitle: '',
      source: 'all',
      categoryId: '',
      productIds: [],
      sort: 'default',
      display: 'grid',
      columns: '2',
      columnsDesktop: '4',
      limit: 0,
      showSearch: true,
      showDescription: false,
      showCount: true,
      hideSoldOut: false,
    },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      { key: 'subtitle', label: 'Subjudul', kind: 'text', placeholder: 'Opsional' },
      {
        key: 'source',
        label: 'Sumber produk',
        kind: 'select',
        options: [
          { value: 'all', label: 'Semua produk (ikut filter kategori pembeli)' },
          { value: 'category', label: 'Satu kategori' },
          { value: 'manual', label: 'Pilih produk sendiri' },
        ],
      },
      { key: 'categoryId', label: 'Kategori', kind: 'category', showIf: (p) => p.source === 'category' },
      { key: 'productIds', label: 'Produk pilihan (seret untuk mengurutkan)', kind: 'products', max: 40, showIf: (p) => p.source === 'manual' },
      {
        key: 'sort',
        label: 'Urutan',
        kind: 'select',
        showIf: (p) => p.source !== 'manual',
        options: [
          { value: 'default', label: 'Bawaan' },
          { value: 'name', label: 'Nama A–Z' },
          { value: 'price-asc', label: 'Harga termurah' },
          { value: 'price-desc', label: 'Harga termahal' },
          { value: 'available', label: 'Yang tersedia dulu' },
        ],
      },
      {
        key: 'display',
        label: 'Tampilan',
        kind: 'select',
        segmented: true,
        options: [
          { value: 'grid', label: 'Grid' },
          { value: 'list', label: 'Daftar' },
          { value: 'carousel', label: 'Geser' },
        ],
      },
      { key: 'columns', label: 'Kolom di HP', kind: 'select', segmented: true, options: COLS(['1', '2', '3']), showIf: (p) => p.display === 'grid' },
      { key: 'columnsDesktop', label: 'Kolom di desktop', kind: 'select', segmented: true, options: COLS(['2', '3', '4', '5']), showIf: (p) => p.display !== 'carousel' },
      { key: 'limit', label: 'Jumlah maksimal', kind: 'number', min: 0, max: 200, suffix: '(0 = semua)' },
      { key: 'showSearch', label: 'Kolom pencarian', kind: 'toggle' },
      { key: 'showDescription', label: 'Tampilkan deskripsi produk', kind: 'toggle' },
      { key: 'showCount', label: 'Tampilkan jumlah produk', kind: 'toggle' },
      { key: 'hideSoldOut', label: 'Sembunyikan produk habis', kind: 'toggle' },
    ],
  },
  featured: {
    type: 'featured',
    group: 'produk',
    label: 'Produk Unggulan',
    description: 'Sorot satu produk andalan dengan besar',
    emoji: '⭐',
    defaults: { productId: '', badge: 'Paling laris', headline: '', description: '', buttonText: 'Tambah ke Keranjang', imageSide: 'left' },
    fields: [
      { key: 'productId', label: 'Produk', kind: 'product' },
      { key: 'badge', label: 'Label', kind: 'text' },
      { key: 'headline', label: 'Judul (kosong = nama produk)', kind: 'text' },
      { key: 'description', label: 'Deskripsi (kosong = deskripsi produk)', kind: 'textarea' },
      { key: 'buttonText', label: 'Teks tombol', kind: 'text' },
      { key: 'imageSide', label: 'Posisi gambar', kind: 'select', segmented: true, options: [{ value: 'left', label: 'Kiri' }, { value: 'right', label: 'Kanan' }] },
    ],
  },
  image: {
    type: 'image',
    group: 'konten',
    label: 'Gambar / Promo',
    description: 'Gambar banner promo dengan keterangan',
    emoji: '🏷️',
    defaults: { imageUrl: '', caption: '', link: '', aspect: 'auto', rounded: true },
    fields: [
      { key: 'imageUrl', label: 'Gambar', kind: 'image' },
      { key: 'caption', label: 'Keterangan', kind: 'text' },
      { key: 'link', label: 'Tautan saat diklik', kind: 'url', help: LINK_HELP },
      { key: 'aspect', label: 'Rasio', kind: 'select', segmented: true, options: ASPECTS },
      { key: 'rounded', label: 'Sudut membulat', kind: 'toggle' },
    ],
  },
  gallery: {
    type: 'gallery',
    group: 'konten',
    label: 'Galeri Foto',
    description: 'Kumpulan foto suasana toko / produk',
    emoji: '🖼',
    defaults: { title: 'Galeri', items: [{ id: uid(), imageUrl: '', caption: '' }, { id: uid(), imageUrl: '', caption: '' }, { id: uid(), imageUrl: '', caption: '' }], columns: '3', aspect: '1/1' },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      {
        key: 'items',
        label: 'Foto',
        kind: 'list',
        itemLabel: 'Foto',
        titleKey: 'caption',
        max: 24,
        newItem: () => ({ id: uid(), imageUrl: '', caption: '' }),
        itemFields: [
          { key: 'imageUrl', label: 'Gambar', kind: 'image' },
          { key: 'caption', label: 'Keterangan', kind: 'text' },
        ],
      },
      { key: 'columns', label: 'Kolom', kind: 'select', segmented: true, options: COLS(['2', '3', '4']) },
      { key: 'aspect', label: 'Rasio foto', kind: 'select', segmented: true, options: ASPECTS.slice(2) },
    ],
  },
  text: {
    type: 'text',
    group: 'konten',
    label: 'Teks',
    description: 'Judul dan paragraf bebas',
    emoji: '📝',
    defaults: { eyebrow: '', heading: 'Tentang Kami', body: 'Ceritakan toko Anda di sini.', size: 'md' },
    fields: [
      { key: 'eyebrow', label: 'Teks kecil di atas judul', kind: 'text' },
      { key: 'heading', label: 'Judul', kind: 'text' },
      { key: 'body', label: 'Isi', kind: 'textarea', help: 'Baris baru tetap dipertahankan.' },
      { key: 'size', label: 'Ukuran huruf', kind: 'select', segmented: true, options: [{ value: 'sm', label: 'Kecil' }, { value: 'md', label: 'Sedang' }, { value: 'lg', label: 'Besar' }] },
    ],
  },
  button: {
    type: 'button',
    group: 'konten',
    label: 'Tombol',
    description: 'Satu atau beberapa tombol ajakan',
    emoji: '🔘',
    defaults: { items: [{ id: uid(), label: 'Pesan via WhatsApp', link: 'wa:', variant: 'solid' }], size: 'md', fullWidth: false },
    fields: [
      {
        key: 'items',
        label: 'Tombol',
        kind: 'list',
        itemLabel: 'Tombol',
        titleKey: 'label',
        max: 6,
        newItem: () => ({ id: uid(), label: 'Tombol', link: '#produk', variant: 'outline' }),
        itemFields: [
          { key: 'label', label: 'Teks', kind: 'text' },
          { key: 'link', label: 'Tautan', kind: 'url', help: LINK_HELP },
          { key: 'variant', label: 'Gaya', kind: 'select', segmented: true, options: [{ value: 'solid', label: 'Penuh' }, { value: 'outline', label: 'Garis' }, { value: 'soft', label: 'Lembut' }] },
        ],
      },
      { key: 'size', label: 'Ukuran', kind: 'select', segmented: true, options: [{ value: 'sm', label: 'Kecil' }, { value: 'md', label: 'Sedang' }, { value: 'lg', label: 'Besar' }] },
      { key: 'fullWidth', label: 'Lebar penuh', kind: 'toggle' },
    ],
  },
  features: {
    type: 'features',
    group: 'konten',
    label: 'Keunggulan',
    description: 'Ikon + poin keunggulan toko',
    emoji: '✨',
    defaults: {
      title: 'Kenapa pilih kami?',
      items: [
        { id: uid(), icon: '⚡', title: 'Cepat', text: 'Pesanan siap dalam hitungan menit.' },
        { id: uid(), icon: '🌿', title: 'Bahan segar', text: 'Dipilih setiap hari.' },
        { id: uid(), icon: '💳', title: 'Bayar mudah', text: 'Tunai, QRIS, atau transfer.' },
      ],
      columns: '3',
      display: 'card',
    },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      {
        key: 'items',
        label: 'Poin',
        kind: 'list',
        itemLabel: 'Poin',
        titleKey: 'title',
        max: 12,
        newItem: () => ({ id: uid(), icon: '✅', title: 'Keunggulan', text: '' }),
        itemFields: [
          { key: 'icon', label: 'Ikon', kind: 'emoji' },
          { key: 'title', label: 'Judul', kind: 'text' },
          { key: 'text', label: 'Keterangan', kind: 'textarea' },
        ],
      },
      { key: 'columns', label: 'Kolom di desktop', kind: 'select', segmented: true, options: COLS(['2', '3', '4']) },
      { key: 'display', label: 'Tampilan', kind: 'select', segmented: true, options: [{ value: 'card', label: 'Kartu' }, { value: 'plain', label: 'Polos' }] },
    ],
  },
  testimonials: {
    type: 'testimonials',
    group: 'konten',
    label: 'Testimoni',
    description: 'Ulasan dan rating pelanggan',
    emoji: '💬',
    defaults: {
      title: 'Kata Pelanggan',
      items: [
        { id: uid(), name: 'Rina', role: 'Pelanggan setia', text: 'Rasanya enak dan pelayanannya cepat!', rating: 5 },
        { id: uid(), name: 'Budi', role: '', text: 'Pesan online, tinggal ambil. Praktis.', rating: 5 },
      ],
      display: 'grid',
    },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      {
        key: 'items',
        label: 'Ulasan',
        kind: 'list',
        itemLabel: 'Ulasan',
        titleKey: 'name',
        max: 12,
        newItem: () => ({ id: uid(), name: 'Nama', role: '', text: '', rating: 5 }),
        itemFields: [
          { key: 'name', label: 'Nama', kind: 'text' },
          { key: 'role', label: 'Keterangan', kind: 'text' },
          { key: 'text', label: 'Ulasan', kind: 'textarea' },
          { key: 'rating', label: 'Bintang', kind: 'range', min: 1, max: 5 },
        ],
      },
      { key: 'display', label: 'Tampilan', kind: 'select', segmented: true, options: [{ value: 'grid', label: 'Grid' }, { value: 'carousel', label: 'Geser' }] },
    ],
  },
  faq: {
    type: 'faq',
    group: 'konten',
    label: 'Tanya Jawab',
    description: 'Pertanyaan yang sering diajukan',
    emoji: '❓',
    defaults: {
      title: 'Pertanyaan Umum',
      items: [
        { id: uid(), q: 'Bagaimana cara memesan?', a: 'Pilih produk, masukkan keranjang, lalu kirim pesanan. Bayar di toko saat mengambil.' },
        { id: uid(), q: 'Apakah bisa diantar?', a: 'Bisa, pilih "Diantar" lalu isi alamat Anda.' },
      ],
    },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      {
        key: 'items',
        label: 'Pertanyaan',
        kind: 'list',
        itemLabel: 'Pertanyaan',
        titleKey: 'q',
        max: 20,
        newItem: () => ({ id: uid(), q: 'Pertanyaan baru?', a: '' }),
        itemFields: [
          { key: 'q', label: 'Pertanyaan', kind: 'text' },
          { key: 'a', label: 'Jawaban', kind: 'textarea' },
        ],
      },
    ],
  },
  video: {
    type: 'video',
    group: 'konten',
    label: 'Video',
    description: 'Sematkan video YouTube',
    emoji: '🎬',
    defaults: { title: '', url: '', aspect: '16/9' },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      { key: 'url', label: 'Link YouTube', kind: 'url', placeholder: 'https://youtu.be/…' },
      { key: 'aspect', label: 'Rasio', kind: 'select', segmented: true, options: [{ value: '16/9', label: '16:9' }, { value: '9/16', label: '9:16 (Shorts)' }, { value: '1/1', label: '1:1' }] },
    ],
  },
  countdown: {
    type: 'countdown',
    group: 'info',
    label: 'Hitung Mundur',
    description: 'Waktu tersisa promo / acara',
    emoji: '⏳',
    defaults: { title: 'Promo berakhir dalam', subtitle: '', endsAt: '', expiredText: 'Promo telah berakhir', buttonText: '', link: '#produk' },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      { key: 'subtitle', label: 'Keterangan', kind: 'text' },
      { key: 'endsAt', label: 'Berakhir pada', kind: 'datetime' },
      { key: 'expiredText', label: 'Teks setelah berakhir', kind: 'text' },
      { key: 'buttonText', label: 'Teks tombol', kind: 'text' },
      { key: 'link', label: 'Tautan tombol', kind: 'url', help: LINK_HELP, showIf: (p) => !!p.buttonText },
    ],
  },
  hours: {
    type: 'hours',
    group: 'info',
    label: 'Jam Buka',
    description: 'Tabel jam operasional per hari',
    emoji: '🕘',
    defaults: {
      title: 'Jam Buka',
      items: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => ({ id: uid(), day, time: '08.00 – 21.00' })),
      note: '',
      highlightToday: true,
    },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      {
        key: 'items',
        label: 'Hari',
        kind: 'list',
        itemLabel: 'Baris',
        titleKey: 'day',
        max: 14,
        newItem: () => ({ id: uid(), day: 'Hari libur nasional', time: 'Tutup' }),
        itemFields: [
          { key: 'day', label: 'Hari', kind: 'text' },
          { key: 'time', label: 'Jam', kind: 'text', placeholder: 'mis. 08.00 – 21.00 / Tutup' },
        ],
      },
      { key: 'note', label: 'Catatan', kind: 'text' },
      { key: 'highlightToday', label: 'Tandai hari ini', kind: 'toggle' },
    ],
  },
  info: {
    type: 'info',
    group: 'info',
    label: 'Info & Kontak',
    description: 'Alamat, jam buka, WhatsApp, peta',
    emoji: '📍',
    defaults: { title: 'Kunjungi Kami', hours: 'Setiap hari, 08.00–21.00', whatsapp: '', mapsUrl: '', showAddress: true, showPhone: true },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      { key: 'hours', label: 'Jam buka', kind: 'text' },
      { key: 'whatsapp', label: 'No. WhatsApp', kind: 'text', placeholder: 'mis. 081234567890' },
      { key: 'mapsUrl', label: 'Link Google Maps', kind: 'url' },
      { key: 'showAddress', label: 'Tampilkan alamat toko', kind: 'toggle' },
      { key: 'showPhone', label: 'Tampilkan telepon toko', kind: 'toggle' },
    ],
  },
  map: {
    type: 'map',
    group: 'info',
    label: 'Peta Lokasi',
    description: 'Peta Google Maps tertanam',
    emoji: '🗺️',
    defaults: { title: 'Lokasi Kami', query: '', height: 'md' },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      { key: 'query', label: 'Alamat / nama tempat', kind: 'text', help: 'Kosongkan untuk memakai alamat toko.' },
      { key: 'height', label: 'Tinggi', kind: 'select', segmented: true, options: HEIGHTS.slice(0, 3) },
    ],
  },
  social: {
    type: 'social',
    group: 'info',
    label: 'Media Sosial',
    description: 'Tautan Instagram, TikTok, marketplace',
    emoji: '🔗',
    defaults: {
      title: 'Ikuti Kami',
      items: [
        { id: uid(), platform: 'instagram', url: '' },
        { id: uid(), platform: 'tiktok', url: '' },
      ],
      display: 'buttons',
    },
    fields: [
      { key: 'title', label: 'Judul', kind: 'text' },
      {
        key: 'items',
        label: 'Tautan',
        kind: 'list',
        itemLabel: 'Tautan',
        titleKey: 'platform',
        max: 12,
        newItem: () => ({ id: uid(), platform: 'website', url: '' }),
        itemFields: [
          { key: 'platform', label: 'Platform', kind: 'select', options: SOCIAL_PLATFORMS.map((p) => ({ value: p.value, label: `${p.emoji} ${p.label}` })) },
          { key: 'url', label: 'Link / username', kind: 'url' },
        ],
      },
      { key: 'display', label: 'Tampilan', kind: 'select', segmented: true, options: [{ value: 'buttons', label: 'Tombol' }, { value: 'icons', label: 'Ikon' }] },
    ],
  },
  spacer: {
    type: 'spacer',
    group: 'tata',
    label: 'Jarak Kosong',
    description: 'Ruang kosong antar blok',
    emoji: '↕️',
    defaults: { height: 32 },
    style: { paddingY: 'none' },
    fields: [{ key: 'height', label: 'Tinggi', kind: 'range', min: 8, max: 200, step: 4, suffix: 'px' }],
  },
  divider: {
    type: 'divider',
    group: 'tata',
    label: 'Garis Pemisah',
    description: 'Garis tipis antar bagian',
    emoji: '➖',
    defaults: { lineStyle: 'solid', thickness: 1, width: 'full' },
    fields: [
      { key: 'lineStyle', label: 'Jenis garis', kind: 'select', segmented: true, options: [{ value: 'solid', label: 'Lurus' }, { value: 'dashed', label: 'Putus' }, { value: 'dotted', label: 'Titik' }] },
      { key: 'thickness', label: 'Tebal', kind: 'range', min: 1, max: 6, suffix: 'px' },
      { key: 'width', label: 'Panjang', kind: 'select', segmented: true, options: [{ value: 'short', label: 'Pendek' }, { value: 'half', label: 'Setengah' }, { value: 'full', label: 'Penuh' }] },
    ],
  },
};

export const BLOCK_ORDER = Object.keys(BLOCK_DEFS) as BlockType[];

/** Batas backend (StorefrontService.MAX_BLOCKS). */
export const MAX_BLOCKS = 40;

export function newBlockId(): string {
  return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Salin isi bawaan secara dalam supaya item daftar tidak berbagi objek/id antar blok. */
function cloneDefaults(type: BlockType): Props {
  const props = JSON.parse(JSON.stringify(BLOCK_DEFS[type].defaults)) as Props;
  for (const value of Object.values(props)) {
    if (Array.isArray(value)) value.forEach((item) => item && typeof item === 'object' && ((item as Props).id = uid()));
  }
  return props;
}

/** Pastikan setiap item daftar punya id (dibutuhkan untuk diseret di editor). */
export function ensureItemIds(props: Props): Props {
  for (const [key, value] of Object.entries(props)) {
    if (Array.isArray(value) && value.some((item) => item && typeof item === 'object' && !(item as Props).id)) {
      props[key] = value.map((item) => (item && typeof item === 'object' && !(item as Props).id ? { ...(item as Props), id: uid() } : item));
    }
  }
  return props;
}

export function createBlock(type: BlockType, props?: Props, style?: BlockStyle): StorefrontBlock {
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
    if (Array.isArray(value)) value.forEach((item) => item && typeof item === 'object' && ((item as Props).id = uid()));
  }
  return copy;
}

/** Ambil isian blok dengan default bila belum diisi. */
export function prop<T>(block: StorefrontBlock, key: string): T {
  const value = block.props[key];
  return (value === undefined ? BLOCK_DEFS[block.type]?.defaults[key] : value) as T;
}

/** Isian blok lengkap dengan default (untuk showIf di editor). */
export function propsWithDefaults(block: StorefrontBlock): Props {
  const props = { ...BLOCK_DEFS[block.type].defaults, ...block.props };
  // Blok "Daftar Produk" versi awal hanya punya categoryId.
  if (block.type === 'products' && block.props.source === undefined) props.source = block.props.categoryId ? 'category' : 'all';
  return props;
}

export function blockLabel(block: StorefrontBlock): string {
  return block.name?.trim() || BLOCK_DEFS[block.type]?.label || block.type;
}

// ── Tema & halaman ────────────────────────────────────────────────────

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

// ── Meja ─────────────────────────────────────────────────────────────

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
