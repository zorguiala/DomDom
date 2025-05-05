import api from "./api";
import { Product } from "../types/inventory";

export interface ProductFilters {
  search?: string;
  isRawMaterial?: boolean;
  isActive?: boolean;
}

export const productApi = {
  getProducts: async (filters?: ProductFilters) => {
    const response = await api.get("/products", { params: filters });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (product: Omit<Product, "id">) => {
    // Map currentStock to initialStock for backend compatibility
    const payload: any = { ...product };
    if (payload.currentStock !== undefined) {
      payload.initialStock = payload.currentStock;
    }
    delete payload.currentStock;
    delete payload.createdAt;
    delete payload.updatedAt;
    // Ensure price is present for backend (NOT NULL constraint)
    if (payload.price === undefined || payload.price === null) {
      throw new Error("Product price is required.");
    }
    const response = await api.post("/products", payload);
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
};
