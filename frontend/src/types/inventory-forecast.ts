// Types for inventory forecasting

export interface StockForecast {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  averageDailyUsage: number;
  leadTimeDays: number;
  reorderPoint: number;
  daysUntilStockout: number;
  suggestedOrderQuantity: number;
  status: 'CRITICAL' | 'LOW' | 'NORMAL' | 'EXCESS';
}

export interface UsageTrend {
  productId: string;
  averageDailyUsage: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  historicalData: {
    date: string;
    quantity: number;
  }[];
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  daysUntilStockout: number;
  reorderPoint: number;
  leadTimeDays: number;
  usageTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface InventoryOptimizationMetrics {
  totalProductsAnalyzed: number;
  excessInventoryValue: number;
  lowStockItemsCount: number;
  potentialStockoutCount: number;
  averageInventoryDays: number;
  inventoryTurnoverRate: number;
}

export interface InventoryForecastParams {
  productId?: string;
  period?: number; // Days to forecast
  includeHistorical?: boolean;
}
