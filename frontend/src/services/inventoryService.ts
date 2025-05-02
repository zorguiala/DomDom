import api from "./api";
import { Product } from "../types/inventory";

export interface ProductFilters {
  search?: string;
  isRawMaterial?: boolean;
  isActive?: boolean;
}

export const inventoryApi = {
  getProducts: async (filters?: ProductFilters) => {
    const response = await api.get("/products", { params: filters });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (product: Omit<Product, "id">) => {
    const response = await api.post("/products", product);
    return response.data;
  },

  updateProduct: async (id: string, product: Partial<Product>) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  findByBarcode: async (barcode: string) => {
    const response = await api.get(`/products/barcode/${barcode}`);
    return response.data;
  },

  updateBarcode: async (id: string, barcode: string) => {
    const response = await api.put(`/products/${id}/barcode`, { barcode });
    return response.data;
  },

  getTransactions: async (
    productId?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    const response = await api.get("/inventory/transactions", {
      params: {
        productId,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    });
    return response.data;
  },

  createTransaction: async (data: {
    productId: string;
    type: "IN" | "OUT";
    quantity: number;
    unitPrice: number;
    reference?: string;
    notes?: string;
  }) => {
    const response = await api.post("/inventory/transaction", data);
    return response.data;
  },

  getLowStockProducts: async (threshold?: number) => {
    // Only send threshold if it's a valid number
    const params: any = {};
    if (typeof threshold === "number" && !isNaN(threshold)) {
      params.threshold = threshold;
    }
    const response = await api.get("/inventory/low-stock", { params });
    return response.data;
  },

  getInventoryReport: async (startDate: Date, endDate: Date) => {
    const response = await api.get("/inventory/report", {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return response.data;
  },
};
