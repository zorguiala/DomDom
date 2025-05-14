import axios from "axios";

interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  price: number;
  costPrice: number;
  profitMargin: number;
  totalValueInStock: number;
  lowStockAlert: boolean;
  unit: string;
}

interface StockTransaction {
  id: string;
  productId: string;
  type: "addition" | "removal" | "transfer" | "adjustment";
  quantity: number;
  date: string;
  notes?: string;
  reason?: string;
  sourceLocation?: string;
  destinationLocation?: string;
  referenceNumber?: string;
  createdBy: string;
  createdAt: string;
}

interface StockCount {
  id: string;
  name: string;
  status: "draft" | "in_progress" | "completed" | "reconciled";
  createdAt: string;
  scheduledDate: string;
  completedAt?: string;
  createdBy: string;
  completedBy?: string;
  notes?: string;
  items: StockCountItem[];
}

interface StockCountItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  expectedQuantity: number;
  actualQuantity?: number;
  unit: string;
  variance?: number;
  variancePercentage?: number;
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
  // Product endpoints
  getAllStock: async (): Promise<Product[]> => {
    const response = await axios.get("/api/stock");
    return response.data;
  },

  getLowStockItems: async (): Promise<Product[]> => {
    const response = await axios.get("/api/stock/low-stock");
    return response.data;
  },

  getStockMetrics: async (): Promise<StockMetrics> => {
    const response = await axios.get("/api/stock/metrics");
    return response.data;
  },

  getMostProfitableProducts: async (limit = 5): Promise<Product[]> => {
    const response = await axios.get(
      `/api/stock/metrics/most-profitable?limit=${limit}`
    );
    return response.data;
  },

  getTopSellingProducts: async (
    limit = 5,
    dateRange?: { start: string; end: string }
  ): Promise<Product[]> => {
    let url = `/api/stock/metrics/top-selling?limit=${limit}`;
    if (dateRange) {
      url += `&startDate=${dateRange.start}&endDate=${dateRange.end}`;
    }
    const response = await axios.get(url);
    return response.data;
  },

  // Transaction endpoints
  createTransaction: async (
    transaction: Omit<StockTransaction, "id" | "createdBy" | "createdAt">
  ): Promise<StockTransaction> => {
    const response = await axios.post("/api/stock/transactions", transaction);
    return response.data;
  },

  getTransactions: async (
    filters?: TransactionFilters
  ): Promise<StockTransaction[]> => {
    let url = "/api/stock/transactions";
    if (filters) {
      const params = new URLSearchParams();
      if (filters.productId) params.append("productId", filters.productId);
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
    productId: string,
    dateRange?: { start: string; end: string }
  ): Promise<StockTransaction[]> => {
    let url = `/api/stock/history/${productId}`;
    if (dateRange) {
      url += `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
    }
    const response = await axios.get(url);
    return response.data;
  },

  // Stock count endpoints
  createStockCount: async (data: {
    name: string;
    scheduledDate: string;
    products: string[];
    notes?: string;
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
    items: Array<{ itemId: string; actualQuantity: number; notes?: string }>
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
  StockTransaction,
  StockCount,
  StockCountItem,
  StockMetrics,
  TransactionFilters,
};
