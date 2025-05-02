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
};
