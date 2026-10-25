import type { ProductUnit } from '@/types/models';
import { SECTIONS } from '@/features/settings/constants';

export type PromoStatus = { label: string; tone: 'success' | 'warning' | 'neutral' | 'error' };

/** Satu isi paket yang sedang diedit. */
export type DraftItem = {
  productId: string;
  productName: string;
  unitId: string;
  unitName: string;
  conversionToBase: number;
  quantity: number;
  /** Harga jual per satuan dasar (pembanding "harga normal"). */
  basePrice: number;
  stockBase: number;
  units: ProductUnit[];
};

export type SettingsHandlers = { onCloseSession: () => void; onChangePassword: () => void; onLogout: () => void; onLogoutAll: () => void };

export type SettingsSectionKey = (typeof SECTIONS)[number]['key'];
