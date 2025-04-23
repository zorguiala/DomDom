import api from "./api";

export const productionApi = {
  getActiveOrders: async () => {
    const response = await api.get("/production/active");
    return response.data;
  },

  getProductionStats: async (startDate: Date, endDate: Date) => {
    const response = await api.get("/production/stats", {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return response.data;
  },
};
