import type { ProductKind } from '@/features/landing/types';

/** Latar "studio": warna lembut sesuai produk (dipakai Thumb di mockups.tsx). */
export const PRODUCT_BG: Record<ProductKind, string> = {
  coffee: 'from-[#f3e4cf] to-[#fbf6ee]',
  bread: 'from-[#f5dfc6] to-[#fdf5ec]',
  water: 'from-[#d3e9fd] to-[#f2f8ff]',
  tea: 'from-[#dcecd3] to-[#f4f9f0]',
  noodle: 'from-[#fcdccd] to-[#fff4ee]',
  milk: 'from-[#dce4fd] to-[#f3f6ff]',
};

export const MOCK_RAIL = ['Dasbor', 'Kasir', 'Pesanan', 'Produk', 'Stok', 'Laporan', 'Karyawan'];

export const MOCK_PRODUCTS: { name: string; price: number; kind: ProductKind }[] = [
  { name: 'Kopi Susu Gula Aren', price: 18000, kind: 'coffee' },
  { name: 'Roti Cokelat Keju', price: 12000, kind: 'bread' },
  { name: 'Air Mineral 600ml', price: 4000, kind: 'water' },
  { name: 'Teh Melati Botol', price: 6500, kind: 'tea' },
  { name: 'Mi Instan Goreng', price: 3500, kind: 'noodle' },
  { name: 'Susu UHT 250ml', price: 7000, kind: 'milk' },
];

export const MOCK_HOURS = [12, 20, 34, 48, 40, 30, 26, 38, 55, 62, 44, 22];

export const MOCK_STOCK = [
  { name: 'Gula Pasir 1kg', unit: 'pcs', qty: 4, min: 10 },
  { name: 'Minyak Goreng 2L', unit: 'pcs', qty: 18, min: 8 },
  { name: 'Beras Premium 5kg', unit: 'karung', qty: 2, min: 5 },
  { name: 'Telur Ayam', unit: 'kg', qty: 22, min: 6 },
  { name: 'Kopi Bubuk 200g', unit: 'pcs', qty: 31, min: 10 },
];

export const MOCK_ORDER_COLS = [
  { title: 'Baru', tone: 'bg-electric-600', items: [['ORD-0141', 'Meja 4', 'Makan di tempat'], ['ORD-0142', 'Rina', 'Ambil sendiri']] },
  { title: 'Diproses', tone: 'bg-warning-500', items: [['ORD-0139', 'Meja 2', 'Makan di tempat']] },
  { title: 'Siap', tone: 'bg-pine-500', items: [['ORD-0137', 'Budi', 'Diantar']] },
];
