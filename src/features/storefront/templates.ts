import type { StorefrontLayout } from '@/types/storefront';
import { THEME_STYLES, DEFAULT_PAGE } from '@/features/storefront/constants';
import { createBlock } from '@/features/storefront/utils';
import type { StorefrontTemplate } from '@/features/storefront/types';

const themeOf = (key: string) => THEME_STYLES.find((t) => t.key === key)!;

const layout = (style: string, blocks: StorefrontLayout['blocks'], page: StorefrontLayout['page'] = {}): StorefrontLayout => ({
  version: 2,
  blocks,
  theme: { ...themeOf(style).theme },
  page: { ...DEFAULT_PAGE, ...page },
});

export const TEMPLATES: StorefrontTemplate[] = [
  {
    key: 'kafe',
    label: 'Kafe & Kopi',
    emoji: '☕',
    description: 'Banner hangat, menu andalan, galeri suasana, jam buka',
    color: themeOf('kafe').color,
    build: (name) =>
      layout(
        'kafe',
        [
          createBlock('announcement', { icon: '☕', text: 'Buy 2 get 1 setiap Senin – Kamis, jam 14.00–17.00' }),
          createBlock('hero', { badge: 'Kopi lokal • Roasting sendiri', title: name, subtitle: 'Pesan dari meja atau ambil tanpa antre.', buttonText: 'Lihat Menu', height: 'lg' }),
          createBlock('featured', { badge: 'Signature' }),
          createBlock('categories', { title: 'Menu' }),
          createBlock('products', { title: 'Semua Menu', display: 'list', columnsDesktop: '2', showDescription: true }),
          createBlock('gallery', { title: 'Suasana Kafe' }),
          createBlock('hours'),
          createBlock('info', { title: 'Mampir ke Kafe' }),
        ],
        { fulfillments: ['DINE_IN', 'PICKUP', 'DELIVERY'] },
      ),
  },
  {
    key: 'restoran',
    label: 'Restoran',
    emoji: '🍽️',
    description: 'Slide promo, kategori kotak, menu grid, testimoni',
    color: '#DC2626',
    build: () =>
      layout(
        'modern',
        [
          createBlock('slideshow'),
          createBlock('categories', { display: 'grid', title: 'Mau makan apa hari ini?' }),
          createBlock('products', { title: 'Menu Favorit', columns: '2', columnsDesktop: '4' }),
          createBlock('features', {}, { background: 'soft', paddingY: 'lg' }),
          createBlock('testimonials'),
          createBlock('map'),
          createBlock('info'),
        ],
        { fulfillments: ['DINE_IN', 'PICKUP', 'DELIVERY'], headerStyle: 'theme' },
      ),
  },
  {
    key: 'retail',
    label: 'Toko Kelontong / Minimarket',
    emoji: '🛒',
    description: 'Pengumuman ongkir, kategori, produk lengkap dengan pencarian',
    color: '#059669',
    build: (name) =>
      layout(
        'segar',
        [
          createBlock('announcement', { icon: '🚚', text: 'Gratis antar untuk belanja di atas Rp100.000 (radius 3 km)' }),
          createBlock('hero', { title: name, subtitle: 'Kebutuhan harian lengkap, harga bersahabat.', buttonText: 'Belanja Sekarang', height: 'sm' }),
          createBlock('categories', { display: 'grid' }),
          createBlock('products', { title: 'Semua Produk', columns: '3', columnsDesktop: '5', hideSoldOut: true }),
          createBlock('faq'),
          createBlock('info'),
        ],
        { fulfillments: ['PICKUP', 'DELIVERY'] },
      ),
  },
  {
    key: 'apotek',
    label: 'Apotek',
    emoji: '💊',
    description: 'Tampilan bersih, info konsultasi, produk per kategori',
    color: '#0F766E',
    build: (name) =>
      layout(
        'modern',
        [
          createBlock('hero', { title: name, subtitle: 'Obat & vitamin asli, konsultasi apoteker via WhatsApp.', buttonText: 'Cari Produk', button2Text: 'Konsultasi', button2Link: 'wa:', height: 'sm' }),
          createBlock('features', {
            title: 'Layanan Kami',
            items: [
              { icon: '✅', title: 'Produk resmi', text: 'Terdaftar BPOM.' },
              { icon: '👩‍⚕️', title: 'Apoteker siaga', text: 'Siap menjawab pertanyaan Anda.' },
              { icon: '🛵', title: 'Antar cepat', text: 'Pesanan diantar ke rumah.' },
            ],
          }),
          createBlock('categories', { display: 'list' }),
          createBlock('products', { title: 'Produk', display: 'list', columnsDesktop: '3', showDescription: true }),
          createBlock('text', { heading: 'Obat keras', body: 'Obat yang memerlukan resep dokter hanya dapat diserahkan dengan menunjukkan resep asli di apotek.', size: 'sm' }, { background: 'soft' }),
          createBlock('hours'),
          createBlock('info'),
        ],
        { fulfillments: ['PICKUP', 'DELIVERY'] },
      ),
  },
  {
    key: 'laundry',
    label: 'Laundry',
    emoji: '🧺',
    description: 'Daftar layanan + harga, cara kerja, jam operasional',
    color: '#7C3AED',
    build: (name) =>
      layout(
        'ceria',
        [
          createBlock('hero', { title: name, subtitle: 'Cuci bersih, wangi, rapi. Antar-jemput tersedia.', buttonText: 'Lihat Layanan', height: 'md', align: 'center' }),
          createBlock('features', {
            title: 'Cara Kerja',
            items: [
              { icon: '📱', title: '1. Pesan online', text: 'Pilih layanan di bawah.' },
              { icon: '🛵', title: '2. Kami jemput', text: 'Atau antar sendiri ke outlet.' },
              { icon: '✨', title: '3. Bersih & wangi', text: 'Siap diambil atau diantar kembali.' },
            ],
          }),
          createBlock('products', { title: 'Layanan & Harga', display: 'list', columnsDesktop: '2', showSearch: false, showDescription: true }),
          createBlock('countdown', { title: 'Diskon 20% member baru berakhir dalam' }),
          createBlock('faq'),
          createBlock('info'),
        ],
        { fulfillments: ['PICKUP', 'DELIVERY'] },
      ),
  },
  {
    key: 'bengkel',
    label: 'Bengkel',
    emoji: '🔧',
    description: 'Servis & suku cadang, tombol booking WhatsApp, peta',
    color: '#111827',
    build: (name) =>
      layout(
        'minimal',
        [
          createBlock('hero', { title: name, subtitle: 'Servis motor & mobil, suku cadang original.', buttonText: 'Booking Servis', buttonLink: 'wa:', button2Text: 'Suku Cadang', button2Link: '#produk', height: 'md' }),
          createBlock('products', { title: 'Servis & Suku Cadang', columns: '2', columnsDesktop: '4' }),
          createBlock('features', { title: 'Kenapa servis di sini?' }, { background: 'dark', paddingY: 'lg' }),
          createBlock('testimonials'),
          createBlock('map'),
          createBlock('hours'),
        ],
        { fulfillments: ['PICKUP'] },
      ),
  },
  {
    key: 'fashion',
    label: 'Fashion & Butik',
    emoji: '👗',
    description: 'Elegan, foto besar, koleksi geser, media sosial',
    color: themeOf('gelap').color,
    build: (name) =>
      layout(
        'gelap',
        [
          createBlock('hero', { badge: 'Koleksi Terbaru', title: name, subtitle: 'Tampil percaya diri setiap hari.', buttonText: 'Lihat Koleksi', height: 'xl', align: 'center' }, { width: 'full', paddingY: 'none' }),
          createBlock('products', { title: 'Koleksi Baru', display: 'carousel', limit: 10, showSearch: false }),
          createBlock('gallery', { title: 'Lookbook', columns: '2', aspect: '4/3' }),
          createBlock('products', { title: 'Semua Produk', columns: '2', columnsDesktop: '4' }),
          createBlock('social'),
        ],
        { fulfillments: ['PICKUP', 'DELIVERY'] },
      ),
  },
  {
    key: 'katalog',
    label: 'Katalog Saja',
    emoji: '📒',
    description: 'Tanpa keranjang — pembeli melihat produk lalu chat WhatsApp',
    color: '#2563EB',
    build: (name) =>
      layout(
        'modern',
        [
          createBlock('hero', { title: name, subtitle: 'Lihat katalog kami, pesan lewat WhatsApp.', buttonText: 'Chat WhatsApp', buttonLink: 'wa:' }),
          createBlock('categories'),
          createBlock('products', { title: 'Katalog', showDescription: true }),
          createBlock('button', { items: [{ label: 'Pesan via WhatsApp', link: 'wa:', variant: 'solid' }], fullWidth: true }),
          createBlock('info'),
        ],
        { orderingEnabled: false },
      ),
  },
  {
    key: 'kosong',
    label: 'Mulai dari Kosong',
    emoji: '⬜',
    description: 'Halaman kosong, susun sendiri dari nol',
    color: '#64748B',
    build: () => layout('modern', []),
  },
];
