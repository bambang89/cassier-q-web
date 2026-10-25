import { BoxIcon } from '@/components/ui/icons/NavIcons';
import { BellIcon, LockIcon, PrintIcon } from '@/components/ui/icons/ActionIcons';
import { DiscountIcon, TruckIcon, WalletIcon, CreditCardIcon, PersonIcon } from '@/components/ui/icons/DataIcons';

// Hanya pengaturan yang tidak punya menu sendiri di sidebar (Outlet, Karyawan, dll. ada di sidebar).
export const SECTIONS = [
  { key: 'akun', label: 'Akun', icon: PersonIcon, available: true },
  { key: 'pembayaran', label: 'Pembayaran & PPN', icon: WalletIcon, available: true },
  { key: 'promo', label: 'Kode Promo', icon: DiscountIcon, available: true },
  { key: 'paket', label: 'Paket Bundling', icon: BoxIcon, available: true },
  { key: 'pembelian', label: 'Pembelian', icon: TruckIcon, available: true },
  { key: 'struk', label: 'Struk & Printer', icon: PrintIcon, available: true },
  { key: 'pengguna', label: 'Hak Akses', icon: LockIcon, available: true },
  { key: 'keamanan', label: 'Keamanan', icon: LockIcon, available: true },
  { key: 'notifikasi', label: 'Notifikasi', icon: BellIcon, available: false },
  { key: 'langganan', label: 'Langganan', icon: CreditCardIcon, available: false },
] as const;
