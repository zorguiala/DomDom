import api from "./api";
import { 
  InventoryForecastParams, 
  InventoryOptimizationMetrics, 
  LowStockAlert, 
  StockForecast, 
  UsageTrend 
} from "../types/inventory-forecast";

export const inventoryForecastApi = {
  // Get stock forecasts for all products or a specific product
  getStockForecasts: async (params?: InventoryForecastParams) => {
    const response = await api.get("/inventory/forecast", { 
      params 
    });
    return response.data as StockForecast[];
  },

  // Get low stock alerts
  getLowStockAlerts: async () => {
    const response = await api.get("/inventory/forecast/low-stock");
    return response.data as LowStockAlert[];
  },

  // Get usage trends for a product
  getUsageTrend: async (productId: string, period: number = 90) => {
    const response = await api.get(`/inventory/forecast/usage-trend/${productId}`, {
      params: { period }
    });
    return response.data as UsageTrend;
  },

  // Get inventory optimization metrics
  getOptimizationMetrics: async () => {
    const response = await api.get("/inventory/forecast/optimization");
    return response.data as InventoryOptimizationMetrics;
  },

  // Get reorder suggestions
  getReorderSuggestions: async () => {
    const response = await api.get("/inventory/forecast/reorder-suggestions");
    return response.data as {
      productId: string;
      productName: string;
      currentStock: number;
      suggestedOrderQuantity: number;
      estimatedCost: number;
      leadTimeDays: number;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }[];
  },

  // Get projected inventory levels
  getProjectedInventory: async (productId: string, days: number = 30) => {
    const response = await api.get(`/inventory/forecast/projected/${productId}`, {
      params: { days }
    });
    return response.data as {
      productId: string;
      productName: string;
      currentStock: number;
      projectedDays: {
        day: number;
        date: string;
        projectedLevel: number;
        projectedValue: number;
      }[];
    };
  },

  // Update product lead time
  updateProductLeadTime: async (productId: string, leadTimeDays: number) => {
    const response = await api.patch(`/products/${productId}/lead-time`, { 
      leadTimeDays 
    });
    return response.data;
  }
};
