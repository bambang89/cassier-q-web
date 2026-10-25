import type { ComponentType } from 'react';

import type { LineIconProps } from '@/types/ui';

/**
 * Katalog menu — padanan navigation/menuCatalog.ts di aplikasi mobile.
 * Key sama dengan MenuAccessService.MENUS di backend; target berupa URL.
 */
export type MenuKey =
  | 'dashboard'
  | 'pos'
  | 'orders'
  | 'pesanan'
  | 'products'
  | 'categories'
  | 'units'
  | 'inventory'
  | 'customers'
  | 'expenses'
  | 'reports'
  | 'suppliers'
  | 'purchase_orders'
  | 'employees'
  | 'outlet'
  | 'integrations'
  | 'printer';

export type MenuEntry = {
  key: MenuKey;
  label: string;
  hint: string;
  icon: ComponentType<LineIconProps>;
  /** Kelas warna chip ikon (teks + latar). */
  tint: string;
  href: string;
};

export type MenuPageItem = { key: string; label: string; hint: string; icon: React.ComponentType<LineIconProps>; tint: string; onClick: () => void };
