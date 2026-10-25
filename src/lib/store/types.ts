import type { MenuAccessMatrix, AdminStore, ActiveStore } from '@/types/api';
import type { User, CartItem, Product, CashierSession, Category, CheckoutSettings, Customer, LedgerEntry, Employee, Receipt, Order, ProductPhoto, ProductUnit, PurchaseOrder, SalesSummary, Role, StoreProfile, Supplier, Unit } from '@/types/models';
import type { AsyncStatus } from '@/types/common';
import type { store } from '@/lib/store';

export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AccessState {
  /** Toko yang sedang dibantu SUPERADMIN (null = belum memilih). */
  activeStore: ActiveStore | null;
  activeStoreLoaded: boolean;
  stores: AdminStore[];
  storesStatus: LoadStatus;
  /** null = belum dimuat / tanpa batasan; array = menu yang boleh tampil. */
  allowedMenus: string[] | null;
  /** null = tanpa batasan (Kepala Toko/Superadmin, atau belum dimuat); array = aksi yang diizinkan. */
  allowedActions: string[] | null;
  matrix: MenuAccessMatrix | null;
  matrixStatus: LoadStatus;
  error: string | null;
}

export type AuthState = {
  user: User | null;
  status: 'idle' | 'checking' | 'authenticating' | 'authenticated' | 'unauthenticated';
  error: string | null;
  passwordAction: { status: AsyncStatus; error: string | null };
  revokeUserAction: { status: AsyncStatus; error: string | null };
};

export type CartState = {
  items: CartItem[];
  /** Pesanan (menu Pesanan) yang sedang dibayar lewat keranjang ini; ditandai lunas setelah checkout. */
  customerOrder: { id: string; orderNumber: string; customerName: string } | null;
};

export interface AddItemPayload {
  product: Product;
  /** Kalau tidak diisi, dianggap dijual dalam base unit produknya. */
  unit?: { unitId: string; unitName: string; conversionToBase: number };
}

export type CashierSessionState = {
  current: CashierSession | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

export type CategoriesState = {
  items: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

export type CheckoutSettingsState = {
  settings: CheckoutSettings | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
};

export type CustomersState = {
  items: Customer[];
  status: AsyncStatus;
  error: string | null;
  mutationStatus: AsyncStatus;
  mutationError: string | null;
  /** Riwayat hutang/pembayaran, di-cache per customerId. */
  ledgerByCustomerId: Record<string, LedgerEntry[]>;
  ledgerStatusByCustomerId: Record<string, AsyncStatus>;
  paymentStatus: AsyncStatus;
  paymentError: string | null;
};

export type EmployeesState = {
  items: Employee[];
  status: AsyncStatus;
  error: string | null;
  mutationStatus: AsyncStatus;
  mutationError: string | null;
};

export type OrdersState = {
  items: Order[];
  page: number;
  totalPages: number;
  totalElements: number;
  status: AsyncStatus;
  error: string | null;
  /** Order yang sedang dibuka di OrderDetailScreen. */
  current: Order | null;
  currentStatus: AsyncStatus;
  currentError: string | null;
  createStatus: AsyncStatus;
  createError: string | null;
  voidStatus: AsyncStatus;
  voidError: string | null;
  /** Data struk resmi (GET /orders/{id}/receipt) untuk ReceiptScreen. */
  receipt: Receipt | null;
  receiptStatus: AsyncStatus;
  receiptError: string | null;
};

export type ProductPhotosState = {
  /** Di-cache per productId, sama seperti productUnitsSlice. */
  byProductId: Record<string, ProductPhoto[]>;
  statusByProductId: Record<string, AsyncStatus>;
  mutationStatus: AsyncStatus;
  mutationError: string | null;
};

export type ProductUnitsState = {
  /** Di-cache per productId — dipakai berulang di POS/Restock/ProductForm dalam satu sesi tanpa fetch ulang. */
  byProductId: Record<string, ProductUnit[]>;
  statusByProductId: Record<string, AsyncStatus>;
  registerStatus: AsyncStatus;
  registerError: string | null;
};

export type ProductsState = {
  items: Product[];
  search: string;
  latestFetchId: string | null;
  page: number;
  totalPages: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  mutationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationError: string | null;
};

export type PurchaseOrdersState = {
  items: PurchaseOrder[];
  page: number;
  totalPages: number;
  totalElements: number;
  status: AsyncStatus;
  error: string | null;
  current: PurchaseOrder | null;
  currentStatus: AsyncStatus;
  createStatus: AsyncStatus;
  createError: string | null;
  receiveStatus: AsyncStatus;
  receiveError: string | null;
  cancelStatus: AsyncStatus;
  cancelError: string | null;
};

export type ReportsState = {
  summary: SalesSummary | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

export type RolesState = {
  items: Role[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

export type StoreProfileState = {
  profile: StoreProfile | null;
  status: AsyncStatus;
  error: string | null;
  updateStatus: AsyncStatus;
  updateError: string | null;
};

export type SuppliersState = {
  items: Supplier[];
  status: AsyncStatus;
  error: string | null;
  mutationStatus: AsyncStatus;
  mutationError: string | null;
};

export type UnitsState = {
  items: Unit[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
