/**
 * Stock types for the DomDom application
 * Centralized types for stock management functionality
 */

export enum StockTransactionType {
  ADDITION = 'ADDITION',
  REMOVAL = 'REMOVAL',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  PRODUCTION_IN = 'PRODUCTION_IN',
  PRODUCTION_OUT = 'PRODUCTION_OUT',
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  RETURN = 'RETURN',
  WASTE = 'WASTE'
}

export enum StockItemType {
  RAW = 'raw',
  FINISHED = 'finished'
}

export enum StockCountStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  RECONCILED = 'RECONCILED',
  CANCELLED = 'CANCELLED'
}

// Metrics related types
export interface StockMetricsResponse {
  totalStockValue: number;
  totalStockItems: number;
  lowStockItemsCount: number;
  mostProfitableProducts: StockItemWithMetrics[];
  lowestStockItems: StockItemWithMetrics[];
  topSellingProducts: StockItemWithMetrics[];
}

export interface StockItemWithMetrics {
  id: string;
  name: string;
  currentQuantity: number;
  minimumQuantity: number;
  costPrice: number;
  sellingPrice: number;
  unit: string;
  category: string;
  type: string;
  profitMargin?: number;
  totalProfit?: number;
  salesCount?: number;
  stockValue?: number;
  daysUntilStockout?: number;
}

// Type for stock summary
export interface StockSummary {
  totalItems: number;
  totalValue: number;
  rawMaterialsValue: number;
  finishedProductsValue: number;
  lowStockItemsCount: number;
}
