import api from "./api";
import { Sale, CreateSaleDto, SaleReport } from "../types/sales";

export const salesService = {
  getSales: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
  }) => {
    const response = await api.get("/sales", { params });
    return response.data;
  },
  getSale: async (id: string) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },
  createSale: async (data: CreateSaleDto) => {
    const response = await api.post("/sales", data);
    return response.data;
  },
  updateSale: async (id: string, update: Partial<Sale>) => {
    const response = await api.put(`/sales/${id}`, update);
    return response.data;
  },
  deleteSale: async (id: string) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },
  getSalesReport: async (params?: {
    startDate?: string;
    endDate?: string;
    productId?: string;
    customerName?: string;
  }) => {
    const response = await api.get("/sales/report", { params });
    return response.data as SaleReport;
  },
};
