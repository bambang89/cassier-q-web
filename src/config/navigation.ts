import type { ComponentType } from 'react';

import type { LineIconProps } from '@/types/ui';
import type { MenuKey, MenuEntry } from '@/types/navigation';
import { DashboardIcon, CartIcon, ReceiptIcon, ClipboardIcon, BoxIcon, LayersIcon, PeopleIcon, BarChartIcon, EmployeeIcon, StoreIcon, PlugIcon, SettingsIcon, GlobeIcon } from '@/components/ui/icons/NavIcons';
import { TruckIcon, ScaleIcon, FolderIcon, WalletIcon } from '@/components/ui/icons/DataIcons';
import { PrintIcon } from '@/components/ui/icons/ActionIcons';

const blue = 'bg-primary-50 text-primary-600';
const teal = 'bg-info-50 text-info-700';
const green = 'bg-success-50 text-success-600';
const amber = 'bg-warning-50 text-warning-600';
const gray = 'bg-gray-100 text-gray-700';

export const MENU_CATALOG: Record<MenuKey, MenuEntry> = {
  dashboard: { key: 'dashboard', label: 'Beranda', hint: 'Ringkasan penjualan hari ini', icon: DashboardIcon, tint: blue, href: '/dashboard' },
  pos: { key: 'pos', label: 'Kasir', hint: 'Catat penjualan', icon: CartIcon, tint: blue, href: '/pos' },
  orders: { key: 'orders', label: 'Transaksi', hint: 'Riwayat & void transaksi', icon: ReceiptIcon, tint: teal, href: '/orders' },
  pesanan: { key: 'pesanan', label: 'Pesanan', hint: 'Antrian pesanan masuk', icon: ClipboardIcon, tint: blue, href: '/pesanan' },
  products: { key: 'products', label: 'Produk', hint: 'Katalog, harga & stok', icon: BoxIcon, tint: green, href: '/products' },
  categories: { key: 'categories', label: 'Kategori', hint: 'Kelompok produk', icon: FolderIcon, tint: amber, href: '/categories' },
  units: { key: 'units', label: 'Satuan', hint: 'Pcs, dus, kg, ...', icon: ScaleIcon, tint: blue, href: '/units' },
  inventory: { key: 'inventory', label: 'Inventori', hint: 'Stok & mutasi gudang', icon: LayersIcon, tint: teal, href: '/inventory' },
  customers: { key: 'customers', label: 'Pelanggan', hint: 'Data & utang pelanggan', icon: PeopleIcon, tint: green, href: '/customers' },
  expenses: { key: 'expenses', label: 'Pengeluaran', hint: 'Biaya operasional', icon: WalletIcon, tint: amber, href: '/expenses' },
  reports: { key: 'reports', label: 'Laporan', hint: 'Penjualan & produk terlaris', icon: BarChartIcon, tint: blue, href: '/reports' },
  suppliers: { key: 'suppliers', label: 'Supplier', hint: 'Pemasok barang', icon: TruckIcon, tint: teal, href: '/suppliers' },
  purchase_orders: { key: 'purchase_orders', label: 'Purchase Order', hint: 'Pembelian ke supplier', icon: ReceiptIcon, tint: green, href: '/purchase-orders' },
  employees: { key: 'employees', label: 'Karyawan', hint: 'Tim & hak akses', icon: EmployeeIcon, tint: teal, href: '/employees' },
  outlet: { key: 'outlet', label: 'Outlet', hint: 'Profil & data toko', icon: StoreIcon, tint: green, href: '/outlet' },
  integrations: { key: 'integrations', label: 'Integrasi', hint: 'Layanan pihak ketiga', icon: PlugIcon, tint: amber, href: '/integrations' },
  printer: { key: 'printer', label: 'Printer Struk', hint: 'Ukuran kertas & cetak', icon: PrintIcon, tint: gray, href: '/printer' },
};

export const MENU_KEYS = Object.keys(MENU_CATALOG) as MenuKey[];

/** Isi sidebar (padanan TAB_SCREENS mobile). menuKey null = selalu tampil. */
export const SIDEBAR_ITEMS: { label: string; href: string; icon: ComponentType<LineIconProps>; menuKey: MenuKey | null; managerOnly?: boolean }[] = [
  { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon, menuKey: 'dashboard' },
  { label: 'Kasir', href: '/pos', icon: CartIcon, menuKey: 'pos' },
  { label: 'Transaksi', href: '/orders', icon: ReceiptIcon, menuKey: 'orders' },
  { label: 'Pesanan', href: '/pesanan', icon: ClipboardIcon, menuKey: 'pesanan' },
  { label: 'Produk', href: '/products', icon: BoxIcon, menuKey: 'products' },
  { label: 'Inventori', href: '/inventory', icon: LayersIcon, menuKey: 'inventory' },
  { label: 'Pelanggan', href: '/customers', icon: PeopleIcon, menuKey: 'customers' },
  { label: 'Laporan', href: '/reports', icon: BarChartIcon, menuKey: 'reports' },
  { label: 'Karyawan', href: '/employees', icon: EmployeeIcon, menuKey: 'employees' },
  { label: 'Outlet', href: '/outlet', icon: StoreIcon, menuKey: 'outlet' },
  { label: 'Integrasi', href: '/integrations', icon: PlugIcon, menuKey: 'integrations' },
  { label: 'Pengeluaran', href: '/expenses', icon: ReceiptIcon, menuKey: 'expenses' },
  { label: 'Toko Online', href: '/storefront', icon: GlobeIcon, menuKey: null, managerOnly: true },
  { label: 'Pengaturan', href: '/settings', icon: SettingsIcon, menuKey: null },
];

/** Bottom tab bar HP: Beranda · Transaksi · Kasir (tengah) · Produk · Menu. */
export const PHONE_TABS = [
  { key: 'dashboard', label: 'Beranda', href: '/dashboard' },
  { key: 'orders', label: 'Transaksi', href: '/orders' },
  { key: 'pos', label: 'Kasir', href: '/pos' },
  { key: 'products', label: 'Produk', href: '/products' },
  { key: 'menu', label: 'Menu', href: '/menu' },
] as const;

export const PHONE_TAB_HREFS: string[] = PHONE_TABS.map((t) => t.href);

