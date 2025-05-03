import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.error("API Response Error:", {
      status: error.response?.status,
      url: originalRequest?.url,
      method: originalRequest?.method,
      data: error.response?.data,
    });

    // Only handle 401 errors that aren't from the auth endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/")
    ) {
      originalRequest._retry = true;

      try {
        // Here you could implement token refresh logic if needed
        // For now, just redirect to login if the token is invalid
        const currentPath = window.location.pathname;
        if (!currentPath.includes("/login")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = `/login?redirect=${encodeURIComponent(
            currentPath
          )}`;
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authApi = {
  setToken: (token: string) => {
    // Set token for future API calls
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  },

  login: async (credentials: LoginCredentials) => {
    try {
      const response = await api.post("/auth/login", {
        username: credentials.email, // Using username for Passport compatibility
        password: credentials.password,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Login failed");
      }
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Registration failed");
      }
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("authApi.getProfile: Error fetching profile", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch profile";
        console.error("authApi.getProfile: Error details", {
          status: error.response?.status,
          data: error.response?.data,
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }
      throw error;
    }
  },
};

// Dashboard API calls
export const dashboardApi = {
  // Inventory Statistics
  getInventoryStats: async () => {
    const response = await api.get("/inventory/stats");
    return response.data;
  },

  getInventoryStatus: async () => {
    const response = await api.get("/inventory/status");
    return response.data;
  },

  getLowStockAlerts: async () => {
    const response = await api.get("/inventory/low-stock-alerts");
    return response.data;
  },

  // Sales Statistics
  getSalesOverview: async (startDate: string, endDate: string) => {
    const response = await api.get("/sales/overview", {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getTodaysSales: async () => {
    const today = new Date().toISOString().split("T")[0];
    const response = await api.get(`/sales/daily/${today}`);
    return response.data;
  },

  // Production Statistics
  getProductionEfficiency: async () => {
    try {
      const response = await api.get("/production/efficiency");
      return response.data;
    } catch (error) {
      console.warn("Production efficiency endpoint not available");
      // Return mock data
      return {
        value: 85,
        change: 5
      };
    }
  },

  getProductionOutput: async () => {
    try {
      const response = await api.get("/production/output");
      return response.data;
    } catch (error) {
      console.warn("Production output endpoint not available");
      // Return mock data
      return [
        { product: "Premium Chocolate Bar", planned: 500, actual: 480, variance: -20 },
        { product: "Vanilla Ice Cream", planned: 300, actual: 320, variance: 20 },
        { product: "Strawberry Yogurt", planned: 800, actual: 750, variance: -50 },
        { product: "Caramel Sauce", planned: 200, actual: 190, variance: -10 },
      ];
    }
  },

  // Employee Attendance
  getEmployeePresence: async () => {
    try {
      const response = await api.get("/employees/attendance/today");
      return response.data;
    } catch (error) {
      console.warn("Employee attendance endpoint not available");
      // Return mock data
      return {
        present: 8,
        total: 10,
        change: 0
      };
    }
  },

  // Recent Activities
  getRecentActivities: async () => {
    try {
      const response = await api.get("/activities/recent");
      return response.data;
    } catch (error) {
      console.warn("Recent activities endpoint not available");
      // Return mock data
      return [
        {
          id: "1",
          description: "New sales order created",
          user: "Admin User",
          module: "Sales",
          timestamp: new Date().toISOString(),
          status: "Completed",
        }
      ];
    }
  },

  // System Alerts
  getSystemAlerts: async () => {
    try {
      const response = await api.get("/alerts");
      return response.data;
    } catch (error) {
      console.warn("System alerts endpoint not available");
      // Return mock data
      return [
        {
          severity: "warning",
          title: "Low Stock Alert",
          message: "5 products are below minimum stock levels",
          time: new Date().toISOString(),
        }
      ];
    }
  },
};

export default api;
