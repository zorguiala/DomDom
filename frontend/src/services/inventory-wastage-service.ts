import api from "./api";
import { 
  CreateWastageRecordRequest, 
  WastageAnalytics, 
  WastageRecord, 
  WastageReportItem 
} from "../types/inventory-wastage";

export const inventoryWastageApi = {
  // Get all wastage records with optional filtering
  getWastageRecords: async (
    productId?: string, 
    startDate?: Date, 
    endDate?: Date
  ) => {
    const response = await api.get("/inventory/wastage", { 
      params: { 
        productId,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      } 
    });
    return response.data as WastageRecord[];
  },

  // Get a specific wastage record by ID
  getWastageRecord: async (id: string) => {
    const response = await api.get(`/inventory/wastage/${id}`);
    return response.data as WastageRecord;
  },

  // Create a new wastage record
  createWastageRecord: async (wastageData: CreateWastageRecordRequest) => {
    const response = await api.post("/inventory/wastage", wastageData);
    return response.data as WastageRecord;
  },

  // Update an existing wastage record
  updateWastageRecord: async (id: string, wastageData: Partial<CreateWastageRecordRequest>) => {
    const response = await api.patch(`/inventory/wastage/${id}`, wastageData);
    return response.data as WastageRecord;
  },

  // Delete a wastage record
  deleteWastageRecord: async (id: string) => {
    const response = await api.delete(`/inventory/wastage/${id}`);
    return response.data;
  },

  // Get wastage analytics and reports
  getWastageAnalytics: async (
    startDate?: Date, 
    endDate?: Date
  ) => {
    const response = await api.get("/inventory/wastage/analytics", {
      params: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }
    });
    return response.data as WastageAnalytics;
  },

  // Get wastage by product report
  getWastageByProduct: async (
    startDate?: Date, 
    endDate?: Date
  ) => {
    const response = await api.get("/inventory/wastage/by-product", {
      params: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }
    });
    return response.data as WastageReportItem[];
  },

  // Get wastage by reason report
  getWastageByReason: async (
    startDate?: Date, 
    endDate?: Date
  ) => {
    const response = await api.get("/inventory/wastage/by-reason", {
      params: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }
    });
    return response.data as {
      reason: string;
      count: number;
      quantity: number;
      value: number;
    }[];
  }
};
