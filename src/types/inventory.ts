export type StockStatus = 'OUT' | 'LOW' | 'OK';

export type StockItem = {
  productId: string;
  sku: string;
  productName: string;
  categoryName: string;
  baseUnitName: string;
  imageUrl: string | null;
  stock: number;
  minimumStock: number;
  costPrice: number | null;
  /** stok × harga modal */
  stockValue: number | null;
  status: StockStatus;
};

export type StockSummary = {
  products: number;
  outOfStock: number;
  lowStock: number;
  totalValue: number;
  items: StockItem[];
};

export type StockMovementItem = {
  id: string;
  createdAt: string;
  productId: string;
  productName: string;
  movementType: string;
  quantity: number;
  unitName: string;
  quantityBase: number;
  stockBefore: number;
  stockAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdBy: string | null;
};

export type OpnameResult = {
  lines: {
    productId: string;
    productName: string;
    systemQuantity: number;
    countedQuantity: number;
    difference: number;
    differenceValue: number;
  }[];
  totalDifferenceValue: number;
};

export type BadStockReason = 'DAMAGED' | 'EXPIRED' | 'LOST' | 'DEFECT' | 'CUSTOMER_RETURN';

export type BadStockStatus = 'PENDING' | 'QUARANTINED' | 'RETURNED' | 'DISPOSED' | 'CANCELLED';

export type BadStockItem = {
  id: string;
  createdAt: string;
  productId: string;
  productName: string;
  quantity: number;
  unitName: string;
  quantityBase: number;
  reason: BadStockReason;
  notes: string | null;
  photoUrl: string | null;
  status: BadStockStatus;
  costValue: number | null;
  stockDeducted: boolean;
  reportedBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  supplierName: string | null;
  resolutionNote: string | null;
};

export type BadStockReport = {
  totalValue: number;
  records: number;
  byReason: { reason: BadStockReason; count: number; value: number }[];
  topProducts: { productId: string; productName: string; quantityBase: number; value: number }[];
  pending: number;
};

export type Stock = {
  productId: string;
  productName: string;
  storeId: string;
  quantityBaseUnit: number;
  minimumStock: number | null;
  maximumStock: number | null;
  updatedAt: string;
};
