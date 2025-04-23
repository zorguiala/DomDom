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