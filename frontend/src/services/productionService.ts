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

const productionService = {
  // Get all production orders
  getProductionOrders: async () => {
    const response = await api.get("/production/orders");
    return response.data;
  },

  // Get a specific production order
  getProductionOrder: async (id: number) => {
    const response = await api.get(`/production/orders/${id}`);
    return response.data;
  },

  // Create a new production order
  createProductionOrder: async (productionOrder: Partial<ProductionOrder>) => {
    const response = await api.post("/production/orders", productionOrder);
    return response.data;
  },

  // Update a production order
  updateProductionOrder: async (
    id: number,
    productionOrder: Partial<ProductionOrder>
  ) => {
    const response = await api.put(`/production/orders/${id}`, productionOrder);
    return response.data;
  },

  // Delete a production order
  deleteProductionOrder: async (id: number) => {
    const response = await api.delete(`/production/orders/${id}`);
    return response.data;
  },

  // Record production output
  recordProductionOutput: async (orderId: number, output: ProductionOutput) => {
    const response = await api.post(
      `/production/orders/${orderId}/output`,
      output
    );
    return response.data;
  },

  // Get production progress
  getProductionProgress: async (orderId: number) => {
    const response = await api.get(`/production/orders/${orderId}/progress`);
    return response.data;
  },

  // Get production records with optional filters
  getProductionRecords: async (filters: ProductionRecordFilters = {}) => {
    const response = await api.get("/production/records", { params: filters });
    return response.data;
  },

  // Get employee efficiency data
  getEmployeeEfficiency: async (startDate?: string, endDate?: string) => {
    const response = await api.get("/production/employees/efficiency", {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

export default productionService;
