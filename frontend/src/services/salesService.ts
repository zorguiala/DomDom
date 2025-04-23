import api from "./api";

export const salesApi = {
  getSalesReport: async (startDate: Date, endDate: Date) => {
    const response = await api.get("/sales/reports/sales", {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return response.data;
  },

  getTopProducts: async (startDate: Date, endDate: Date, limit?: number) => {
    const response = await api.get("/sales/reports/top-products", {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit,
      },
    });
    return response.data;
  },
};
