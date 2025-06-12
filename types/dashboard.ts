/**
 * Dashboard API Response Types
 */

export interface DashboardKpiData {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  lowStockCount: number;
  totalEmployees: number;
  employeesChange: number;
}

export interface DashboardLowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  category: string;
}

export interface DashboardInventoryData {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentlyUpdated: number;
  topLowStockItems: DashboardLowStockItem[];
}

export interface DashboardProductionData {
  activeOrders: number;
  completedToday: number;
  pendingOrders: number;
  utilizationRate: number;
  recentOrders: DashboardProductionOrder[];
}

export interface DashboardProductionOrder {
  id: string;
  orderNumber: string;
  productName: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  progress: number;
  expectedDate: string;
}

export interface DashboardRecentActivity {
  id: string;
  type: 'sale' | 'purchase' | 'production' | 'inventory';
  description: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, any>;
}

export interface DashboardApiResponse {
  kpis: DashboardKpiData;
  inventory: DashboardInventoryData;
  production: DashboardProductionData;
  recentActivity: DashboardRecentActivity[];
}