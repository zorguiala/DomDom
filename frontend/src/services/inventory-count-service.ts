import api from "./api";
import { 
  CountStatus, 
  CreateInventoryCountRequest, 
  InventoryCount, 
  InventoryCountItemDto, 
  InventoryReconciliation, 
  UpdateInventoryCountRequest 
} from "../types/inventory-count";

export const inventoryCountApi = {
  // Get all inventory counts with optional filtering
  getInventoryCounts: async (status?: CountStatus) => {
    const response = await api.get("/inventory/counts", { 
      params: { status } 
    });
    return response.data as InventoryCount[];
  },

  // Get a specific inventory count by ID
  getInventoryCount: async (id: string) => {
    const response = await api.get(`/inventory/counts/${id}`);
    return response.data as InventoryCount;
  },

  // Create a new inventory count
  createInventoryCount: async (countData: CreateInventoryCountRequest) => {
    const response = await api.post("/inventory/counts", countData);
    return response.data as InventoryCount;
  },

  // Update an existing inventory count
  updateInventoryCount: async (id: string, countData: UpdateInventoryCountRequest) => {
    const response = await api.patch(`/inventory/counts/${id}`, countData);
    return response.data as InventoryCount;
  },

  // Delete an inventory count
  deleteInventoryCount: async (id: string) => {
    const response = await api.delete(`/inventory/counts/${id}`);
    return response.data;
  },

  // Update inventory count items (actual quantities)
  updateCountItems: async (countId: string, items: InventoryCountItemDto[]) => {
    const response = await api.put(`/inventory/counts/${countId}/items`, { items });
    return response.data as InventoryCount;
  },

  // Generate an inventory count sheet template with expected quantities
  generateCountSheet: async () => {
    const response = await api.get("/inventory/counts/template");
    return response.data as {
      productId: string;
      productName: string;
      expectedQuantity: number;
      unit: string;
    }[];
  },
  
  // Change count status (e.g., mark as in progress, completed)
  updateCountStatus: async (countId: string, status: CountStatus, notes?: string) => {
    const response = await api.patch(`/inventory/counts/${countId}/status`, { 
      status,
      notes
    });
    return response.data as InventoryCount;
  },

  // Reconcile inventory count (approve or reject variances)
  reconcileCount: async (countId: string, reconciliation: InventoryReconciliation) => {
    const response = await api.post(`/inventory/counts/${countId}/reconcile`, reconciliation);
    return response.data as InventoryCount;
  },

  // Get variance report for a specific count
  getVarianceReport: async (countId: string) => {
    const response = await api.get(`/inventory/counts/${countId}/variance`);
    return response.data as {
      totalItemsCounted: number;
      itemsWithVariance: number;
      totalVarianceValue: number;
      items: {
        productId: string;
        productName: string;
        expectedQuantity: number;
        actualQuantity: number;
        variance: number;
        variancePercentage: number;
        varianceValue: number;
      }[];
    };
  }
};
