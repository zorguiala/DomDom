import { Product } from '../../entities/product.entity';
import { InventoryTransaction } from '../../entities/inventory-transaction.entity';

export interface StockReportItem {
  productId: string;
  productName: string;
  totalPurchased: number;
  totalSold: number;
  currentStock: number;
  totalValue: number;
}

export interface InventoryValuation {
  productId: string;
  productName: string;
  currentStock: number;
  averageCost: number;
  totalValue: number;
  lastPurchasePrice: number;
}

export interface InventoryValueReport {
  totalValue: number;
  rawMaterialsValue: number;
  finishedProductsValue: number;
  rawMaterialsCount: number;
  finishedProductsCount: number;
  productCount: number;
}

export interface ProductMovementReport {
  product: Product;
  period: {
    startDate: Date;
    endDate: Date;
  };
  openingStock: number;
  closingStock: number;
  totalsByType: Record<string, number>;
  transactions: InventoryTransaction[];
  dailyMovement: DailyMovement[];
}

export interface DailyMovement {
  date: string;
  openingBalance: number;
  in: number;
  out: number;
  closingBalance: number;
}

export interface ProductTurnoverData {
  product: Product;
  unitsSold: number;
  averageInventory: number;
  turnoverRate: number;
}

export interface ProductTransactionGroup {
  product: Product;
  totalQuantity: number;
  totalValue: number;
  transactions: InventoryTransaction[];
}

export interface ProductionInventoryImpact {
  period: {
    startDate: Date;
    endDate: Date;
  };
  productionIn: {
    transactions: InventoryTransaction[];
    byProduct: Record<string, ProductTransactionGroup>;
    totalQuantity: number;
    totalValue: number;
  };
  productionOut: {
    transactions: InventoryTransaction[];
    byProduct: Record<string, ProductTransactionGroup>;
    totalQuantity: number;
    totalValue: number;
  };
  netImpact: number;
}

export interface LowStockAlert {
  isLow: boolean;
  currentStock: number;
  minimumStock: number;
  product: Product;
}
