import type { PaymentMethod } from '@/types/models';

export type AdminStore = {
  id: string;
  storeCode: string;
  storeName: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  status: string;
  parentStoreId: string | null;
};

/** `actions` = izin aksi di dalam menu, mis. "products.create" (semua aksi untuk Kepala Toko). */
export type MyMenuAccess = { restricted: boolean; menus: string[]; actions?: string[] };

export type ActionDef = { code: string; label: string };

export type MenuAccessMatrix = {
  menus: string[];
  roles: Record<string, string[]>;
  /** Menu → aksi yang bisa diatur; menu yang tidak ada di sini hanya bisa dilihat. */
  actions?: Record<string, ActionDef[]>;
  /** Role staf → aksi yang diizinkan. */
  roleActions?: Record<string, string[]>;
};

export interface RegisterPayload {
  storeCode: string;
  storeName: string;
  username: string;
  name: string;
  email: string;
  password: string;
  /** Opsional — bisa dilengkapi belakangan di menu Outlet. */
  address?: string;
  city?: string;
  phone?: string;
}

export interface CategoryPayload {
  categoryCode: string;
  categoryName: string;
  parentCategoryId?: string;
}

export interface CustomerPayload {
  customerCode: string;
  name: string;
  phone?: string;
  address?: string;
  creditLimit?: number;
}

export interface CreateEmployeePayload {
  name: string;
  username: string;
  email?: string;
  phone?: string;
  password: string;
  /** KEPALA_TOKO | PRODUCT | GUDANG | KASIR */
  roleCode: string;
  nationalId?: string;
  employeeNumber?: string;
}

export interface UpdateEmployeePayload {
  name: string;
  email?: string;
  phone?: string;
  roleCode: string;
  nationalId?: string;
  employeeNumber?: string;
}

export interface CreateOrderPayload {
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  customerId?: string;
  /** Server menghitung ulang potongannya; discountAmount di atas hanya diskon manual. */
  promoCode?: string;
}

export interface FetchOrdersParams {
  page?: number;
  size?: number;
}

export interface FetchProductsParams {
  search?: string;
  page?: number;
  size?: number;
}

export interface ProductPayload {
  sku: string;
  barcode?: string;
  productName: string;
  categoryId: string;
  brand?: string;
  description?: string;
  imageUrl?: string;
  baseUnitId: string;
  sellingPrice: number;
  costPrice?: number;
}

/** Di web: File dari <input type="file">. */
export type ProductPhotoFile = File;

export interface RestockPayload {
  unitId: string;
  quantity: number;
  notes?: string;
}

export interface RegisterProductUnitPayload {
  unitId: string;
  conversionToBase: number;
  purchaseUnit?: boolean;
  saleUnit?: boolean;
}

export interface CreatePurchaseOrderItemPayload {
  productId: string;
  unitId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  /** Format YYYY-MM-DD. */
  expectedDate?: string;
  notes?: string;
  items: CreatePurchaseOrderItemPayload[];
}

export interface ReceiveItemPayload {
  purchaseOrderItemId: string;
  receivedQuantity: number;
}

export interface FetchPurchaseOrdersParams {
  page?: number;
  size?: number;
}

export interface FetchSalesSummaryParams {
  from?: string;
  to?: string;
}

export interface UpdateCheckoutSettingsPayload {
  enabledPaymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod;
  taxEnabled: boolean;
}

export interface UpdateStoreProfilePayload {
  storeName?: string;
  address?: string;
  province?: string;
  city?: string;
  phone?: string;
  settings?: Record<string, string>;
}

export type ActiveStore = { id: string; name: string };

export interface SupplierPayload {
  supplierCode: string;
  supplierName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export type TokenSet = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export interface UnitPayload {
  unitCode: string;
  unitName: string;
}

export type SessionExpiredHandler = () => void;

export type AuthResponseBody = {
  accessToken: string;
  refreshToken: string;
  /** epoch millis */
  expiresAt: number;
};
