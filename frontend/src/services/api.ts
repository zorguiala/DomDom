import axios from "axios";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api";

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
    const response = await api.get("/production/efficiency");
    return response.data;
  },

  getProductionOutput: async () => {
    const response = await api.get("/production/output");
    return response.data;
  },

  // Employee Attendance
  getEmployeePresence: async () => {
    const response = await api.get("/employees/attendance/today");
    return response.data;
  },

  // Recent Activities
  getRecentActivities: async () => {
    const response = await api.get("/activities/recent");
    return response.data;
  },

  // System Alerts
  getSystemAlerts: async () => {
    const response = await api.get("/alerts");
    return response.data;
  },
};

export default api;
