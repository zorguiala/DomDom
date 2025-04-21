import api from "./api";
import { BOM, BOMInput, MaterialRequirement } from "../types/bom";

export const bomApi = {
  getBOMs: async (search?: string) => {
    const response = await api.get("/bom", { params: { search } });
    return response.data;
  },

  getBOM: async (id: string) => {
    const response = await api.get(`/bom/${id}`);
    return response.data;
  },

  createBOM: async (bom: BOMInput) => {
    const response = await api.post("/bom", bom);
    return response.data;
  },

  updateBOM: async (id: string, bom: Partial<BOMInput>) => {
    const response = await api.put(`/bom/${id}`, bom);
    return response.data;
  },

  deleteBOM: async (id: string) => {
    const response = await api.delete(`/bom/${id}`);
    return response.data;
  },

  getMaterialRequirements: async (id: string, quantity: number) => {
    const response = await api.get(`/bom/${id}/material-requirements`, {
      params: { quantity },
    });
    return response.data;
  },

  checkAvailability: async (id: string, quantity: number) => {
    const response = await api.get(`/bom/${id}/availability`, {
      params: { quantity },
    });
    return response.data;
  },

  calculateCost: async (id: string, quantity: number) => {
    const response = await api.get(`/bom/${id}/cost`, {
      params: { quantity },
    });
    return response.data;
  },
};
