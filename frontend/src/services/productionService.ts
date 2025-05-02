import api from "./api";

export interface ProductionOrder {
  id: number;
  orderNumber: string;
  startDate: Date;
  dueDate: Date;
  status: string;
  productId: number;
  productName: string;
  quantityOrdered: number;
  quantityProduced: number;
  items: ProductionOrderItem[];
}

export interface ProductionOrderItem {
  id: number;
  productionOrderId: number;
  bomItemId: number;
  productId: number;
  productName: string;
  quantity: number;
}

export interface ProductionRecord {
  id: number;
  productionOrderId: number;
  employeeId: number;
  employeeName: string;
  quantity: number;
  recordDate: Date;
  notes: string;
}

export interface ProductionOutput {
  employeeId: number;
  quantity: number;
  notes?: string;
}

export interface EmployeeEfficiency {
  employeeId: number;
  employeeName: string;
  totalProduced: number;
  averagePerHour: number;
}

export interface ProductionRecordFilters {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  productionOrderId?: number;
}

interface GetOrdersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  employeeId?: number;
  bomId?: number;
  startDate?: string;
  endDate?: string;
}

class ProductionService {
  private baseUrl = "/api";

  // Get all production orders
  async getProductionOrders() {
    const response = await api.get("/production/orders");
    return response.data;
  }

  // Get a specific production order
  async getProductionOrder(id: number) {
    const response = await api.get(`/production/orders/${id}`);
    return response.data;
  }

  // Create a new production order
  async createProductionOrder(productionOrder: Partial<ProductionOrder>) {
    const response = await api.post("/production/orders", productionOrder);
    return response.data;
  }

  // Update a production order
  async updateProductionOrder(
    id: number,
    productionOrder: Partial<ProductionOrder>
  ) {
    const response = await api.put(`/production/orders/${id}`, productionOrder);
    return response.data;
  }

  // Delete a production order
  async deleteProductionOrder(id: number) {
    const response = await api.delete(`/production/orders/${id}`);
    return response.data;
  }

  // Record production output
  async recordProductionOutput(orderId: number, output: ProductionOutput) {
    const response = await api.post(
      `/production/orders/${orderId}/output`,
      output
    );
    return response.data;
  }

  // Get production progress
  async getProductionProgress(orderId: number) {
    const response = await api.get(`/production/orders/${orderId}/progress`);
    return response.data;
  }

  // Get production records with optional filters
  async getProductionRecords(filters: ProductionRecordFilters = {}) {
    const response = await api.get("/production/records", { params: filters });
    return response.data;
  }

  // Get employee efficiency data
  async getEmployeeEfficiency(startDate?: string, endDate?: string) {
    const response = await api.get("/production/employees/efficiency", {
      params: { startDate, endDate },
    });
    return response.data;
  }

  // Get orders with pagination and sorting
  async getOrders(params: GetOrdersParams = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params.status) queryParams.append("status", params.status);
    if (params.employeeId)
      queryParams.append("employeeId", params.employeeId.toString());
    if (params.bomId) queryParams.append("bomId", params.bomId.toString());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const response = await api.get(
      `${this.baseUrl}/production-orders?${queryParams}`
    );
    return response.data;
  }
}

export const productionService = new ProductionService();
