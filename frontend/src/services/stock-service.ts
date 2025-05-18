import axios from "axios";

interface Product {
  id: string;
  name: string;
  sku: string;
  stockItemId: string;
  price: number;
  unit: string;
  // Other product-specific fields
}

interface StockItem {
  id: string;
  name: string;
  sku: string;
  currentQuantity: number;
  minimumQuantity: number;
  costPrice: number;
  sellingPrice: number;
  profitMargin: number;
  itemType: 'raw_material' | 'finished_product' | 'packaging';
  location: string;
  unit: string;
  isActive: boolean;
  productId?: string; // Optional link to product
}

interface StockTransaction {
  id: string;
  stockItemId: string;
  type: "purchase" | "sale" | "production_in" | "production_out" | "transfer" | "adjustment";
  quantity: number;
  unitPrice?: number;
  date: string;
  notes?: string;
  reason?: string;
  sourceLocation?: string;
  destinationLocation?: string;
  referenceNumber?: string;
  performedById?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
}

interface StockCount {
  id: string;
  name: string;
  countDate: string;
  status: "draft" | "in_progress" | "completed" | "reconciled";
  createdAt: string;
  reconciledAt?: string;
  isReconciled: boolean;
  createdById: string;
  reconciledById?: string;
  notes?: string;
  items: StockCountItem[];
}

interface StockCountItem {
  id: string;
  stockCountId: string;
  stockItemId: string;
  stockItem: {
    id: string;
    name: string;
    sku: string;
    currentQuantity: number;
  };
  expectedQuantity: number;
  actualQuantity?: number;
  discrepancy?: number;
  isReconciled: boolean;
  notes?: string;
}

interface StockMetrics {
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalProducts: number;
}

interface TransactionFilters {
  productId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

const stockApi = {
  // Stock Item endpoints
  getAllStockItems: async (): Promise<StockItem[]> => {
    const response = await axios.get("/api/stock/items");
    return response.data;
  },

  getLowStockItems: async (): Promise<StockItem[]> => {
    const response = await axios.get("/api/stock/items/low-stock");
    return response.data;
  },

  getStockMetrics: async (): Promise<StockMetrics> => {
    const response = await axios.get("/api/stock/metrics");
    return response.data;
  },

  getMostProfitableItems: async (limit = 5): Promise<StockItem[]> => {
    const response = await axios.get(
      `/api/stock/metrics/most-profitable?limit=${limit}`
    );
    return response.data;
  },

  getTopSellingItems: async (
    limit = 5,
    dateRange?: { start: string; end: string }
  ): Promise<StockItem[]> => {
    let url = `/api/stock/metrics/top-selling?limit=${limit}`;
    if (dateRange) {
      url += `&startDate=${dateRange.start}&endDate=${dateRange.end}`;
    }
    const response = await axios.get(url);
    return response.data;
  },

  // Transaction endpoints
  createTransaction: async (
    transaction: Omit<StockTransaction, "id" | "createdAt">
  ): Promise<StockTransaction> => {
    const response = await axios.post("/api/stock/transactions", transaction);
    return response.data;
  },

  getTransactions: async (
    filters?: { stockItemId?: string; type?: string; startDate?: string; endDate?: string }
  ): Promise<StockTransaction[]> => {
    let url = "/api/stock/transactions";
    if (filters) {
      const params = new URLSearchParams();
      if (filters.stockItemId) params.append("stockItemId", filters.stockItemId);
      if (filters.type) params.append("type", filters.type);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    const response = await axios.get(url);
    return response.data;
  },

  getTransactionById: async (id: string): Promise<StockTransaction> => {
    const response = await axios.get(`/api/stock/transactions/${id}`);
    return response.data;
  },

  getStockMovementHistory: async (
    stockItemId: string,
    dateRange?: { start: string; end: string }
  ): Promise<StockTransaction[]> => {
    let url = `/api/stock/items/${stockItemId}/history`;
    if (dateRange) {
      url += `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
    }
    const response = await axios.get(url);
    return response.data;
  },

  // Stock count endpoints
  createStockCount: async (data: {
    name: string;
    countDate: string;
    stockItems: string[];
    notes?: string;
    createdById: string;
  }): Promise<StockCount> => {
    const response = await axios.post("/api/stock/counts", data);
    return response.data;
  },

  getAllStockCounts: async (): Promise<StockCount[]> => {
    const response = await axios.get("/api/stock/counts");
    return response.data;
  },

  getStockCountById: async (id: string): Promise<StockCount> => {
    const response = await axios.get(`/api/stock/counts/${id}`);
    return response.data;
  },

  startStockCount: async (id: string): Promise<StockCount> => {
    const response = await axios.post(`/api/stock/counts/${id}/start`);
    return response.data;
  },

  recordStockCountQuantities: async (
    id: string,
    items: Array<{ stockItemId: string; actualQuantity: number; notes?: string }>
  ): Promise<StockCount> => {
    const response = await axios.post(`/api/stock/counts/${id}/record`, {
      items,
    });
    return response.data;
  },

  completeStockCount: async (id: string): Promise<StockCount> => {
    const response = await axios.post(`/api/stock/counts/${id}/complete`);
    return response.data;
  },

  reconcileStockCount: async (id: string): Promise<StockCount> => {
    const response = await axios.post(`/api/stock/counts/${id}/reconcile`);
    return response.data;
  },
};

export { stockApi };
export type {
  Product,
  StockItem,
  StockTransaction,
  StockCount,
  StockCountItem,
  StockMetrics,
  TransactionFilters,
};
