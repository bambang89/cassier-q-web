import type { StockStatus, BadStockStatus } from '@/types/inventory';

export type BadStockFilter = 'ALL' | BadStockStatus;

export type StockFilter = 'ALL' | StockStatus;

export type InventoryTab = 'stock' | 'movements' | 'opname' | 'badStock';
