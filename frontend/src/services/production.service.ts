import { apiClient } from "./api-client";

export interface ProductionOrder {
  id: string;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  quantity: number;
  completedQuantity: number;
  plannedStartDate: string;
  actualStartDate?: string;
  bom: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
}

export interface CreateProductionOrderDto {
  bomId: string;
  quantity: number;
  plannedStartDate: Date;
  priority: "low" | "medium" | "high";
}

export interface RecordProductionDto {
  quantity: number;
  employeeId: string;
  notes?: string;
}

class ProductionService {
  async getOrders(): Promise<ProductionOrder[]> {
    const response = await apiClient.get("/production/orders");
    return response.data;
  }

  async getOrder(id: string): Promise<ProductionOrder> {
    const response = await apiClient.get(`/production/orders/${id}`);
    return response.data;
  }

  async createOrder(data: CreateProductionOrderDto): Promise<ProductionOrder> {
    const response = await apiClient.post("/production/orders", data);
    return response.data;
  }

  async updateOrderStatus(
    id: string,
    status: string
  ): Promise<ProductionOrder> {
    const response = await apiClient.patch(`/production/orders/${id}/status`, {
      status,
    });
    return response.data;
  }

  async recordProduction(
    orderId: string,
    data: RecordProductionDto
  ): Promise<ProductionOrder> {
    const response = await apiClient.post(
      `/production/orders/${orderId}/record`,
      data
    );
    return response.data;
  }
}

export default new ProductionService();
