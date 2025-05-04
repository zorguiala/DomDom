import api from "./api";
import { 
  BatchInventoryStatus, 
  BatchMovement, 
  CreateInventoryBatchRequest, 
  InventoryBatch 
} from "../types/inventory-batch";

export const inventoryBatchApi = {
  // Get all batches with optional filtering
  getBatches: async (productId?: string, includeInactive?: boolean) => {
    const response = await api.get("/inventory/batches", { 
      params: { productId, includeInactive } 
    });
    return response.data as InventoryBatch[];
  },

  // Get a specific batch by ID
  getBatch: async (batchId: string) => {
    const response = await api.get(`/inventory/batches/${batchId}`);
    return response.data as InventoryBatch;
  },

  // Create a new batch
  createBatch: async (batchData: CreateInventoryBatchRequest) => {
    const response = await api.post("/inventory/batches", batchData);
    return response.data as InventoryBatch;
  },

  // Update an existing batch
  updateBatch: async (batchId: string, batchData: Partial<InventoryBatch>) => {
    const response = await api.patch(`/inventory/batches/${batchId}`, batchData);
    return response.data as InventoryBatch;
  },

  // Delete/deactivate a batch
  deactivateBatch: async (batchId: string) => {
    const response = await api.delete(`/inventory/batches/${batchId}`);
    return response.data;
  },

  // Get batch inventory status (current quantities, expiry, etc.)
  getBatchInventoryStatus: async () => {
    const response = await api.get("/inventory/batches/status");
    return response.data as BatchInventoryStatus[];
  },

  // Get batch movements history
  getBatchMovements: async (batchId: string) => {
    const response = await api.get(`/inventory/batches/${batchId}/movements`);
    return response.data as BatchMovement[];
  },

  // Add quantity to a batch
  addQuantity: async (batchId: string, quantity: number, notes?: string) => {
    const response = await api.post(`/inventory/batches/${batchId}/add`, { 
      quantity, 
      notes 
    });
    return response.data as InventoryBatch;
  },

  // Remove quantity from a batch
  removeQuantity: async (batchId: string, quantity: number, notes?: string) => {
    const response = await api.post(`/inventory/batches/${batchId}/remove`, { 
      quantity, 
      notes 
    });
    return response.data as InventoryBatch;
  },

  // Get batches nearing expiry
  getNearExpiryBatches: async (daysThreshold: number = 30) => {
    const response = await api.get("/inventory/batches/near-expiry", {
      params: { days: daysThreshold }
    });
    return response.data as BatchInventoryStatus[];
  },

  // Get expired batches
  getExpiredBatches: async () => {
    const response = await api.get("/inventory/batches/expired");
    return response.data as BatchInventoryStatus[];
  }
};
