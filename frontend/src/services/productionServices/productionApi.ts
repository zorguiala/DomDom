import api from "../api";
import {
  ProductionOrder,
  ProductionOrderStatus,
  ProductionProgress,
  ProductionRecord,
  ProductionStats,
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  UpdateProductionOrderStatusDto,
  RecordProductionDto,
} from "../../types/production";
import { Employee } from "../../types/employee";

export const productionApi = {
  // Production Orders
  getAllOrders: async (
    status?: ProductionOrderStatus
  ): Promise<ProductionOrder[]> => {
    const response = await api.get("/production/orders", {
      params: { status },
    });
    return response.data;
  },

  getOrderById: async (id: string): Promise<ProductionOrder> => {
    const response = await api.get(`/production/orders/${id}`);
    return response.data;
  },

  createOrder: async (
    orderData: CreateProductionOrderDto
  ): Promise<ProductionOrder> => {
    const response = await api.post("/production/orders", orderData);
    return response.data;
  },

  updateOrder: async (
    id: string,
    orderData: UpdateProductionOrderDto
  ): Promise<ProductionOrder> => {
    const response = await api.put(`/production/orders/${id}`, orderData);
    return response.data;
  },

  updateOrderStatus: async (
    id: string,
    statusData: UpdateProductionOrderStatusDto
  ): Promise<ProductionOrder> => {
    const response = await api.put(
      `/production/orders/${id}/status`,
      statusData
    );
    return response.data;
  },

  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/production/orders/${id}`);
  },

  // Production Records
  getProductionRecords: async (
    orderId: string
  ): Promise<ProductionRecord[]> => {
    const response = await api.get("/production/records", {
      params: { productionOrderId: orderId },
    });
    return response.data;
  },

  recordProduction: async (
    orderId: string,
    data: RecordProductionDto
  ): Promise<ProductionOrder> => {
    const response = await api.post(
      `/production/orders/${orderId}/output`,
      data
    );
    return response.data;
  },

  // Production Progress
  getProductionProgress: async (
    orderId: string
  ): Promise<ProductionProgress> => {
    const response = await api.get(`/production/orders/${orderId}/progress`);
    return response.data;
  },

  // Stats and Metrics
  getActiveOrders: async (): Promise<ProductionOrder[]> => {
    const response = await api.get("/production/orders", {
      params: {
        status: [
          ProductionOrderStatus.PLANNED,
          ProductionOrderStatus.IN_PROGRESS,
        ],
      },
    });
    return response.data;
  },

  getProductionStats: async (
    startDate: Date,
    endDate: Date
  ): Promise<ProductionStats> => {
    const response = await api.get("/production/stats", {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return response.data;
  },

  getEmployees: async (): Promise<Employee[]> => {
    const response = await api.get("/production/employees");
    return response.data;
  },

  getEfficiencyMetrics: async (): Promise<any> => {
    const response = await api.get("/production/efficiency");
    return response.data;
  },

  getProductionOutput: async (): Promise<any> => {
    const response = await api.get("/production/output");
    return response.data;
  },
};
