import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

// Mock data - in real app, this would come from API
const kpiData = {
  totalRevenue: 45231.89,
  revenueChange: 20.1,
  totalOrders: 2350,
  ordersChange: 19,
  totalProducts: 1234,
  lowStockCount: 23,
  totalEmployees: 45,
  employeesChange: 2,
};

export function DashboardKPIs() {
  const kpis = [
    {
      title: "Total Revenue",
      value: formatCurrency(kpiData.totalRevenue),
      change: `+${kpiData.revenueChange}% from last month`,
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Orders",
      value: formatNumber(kpiData.totalOrders),
      change: `+${kpiData.ordersChange}% from last month`,
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Products",
      value: formatNumber(kpiData.totalProducts),
      change: `${kpiData.lowStockCount} low stock alerts`,
      icon: Package,
      trend: "warning",
    },
    {
      title: "Employees",
      value: formatNumber(kpiData.totalEmployees),
      change: `+${kpiData.employeesChange} new this month`,
      icon: Users,
      trend: "up",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div
              className={`text-xs flex items-center ${
                kpi.trend === "up"
                  ? "text-green-600"
                  : kpi.trend === "warning"
                    ? "text-yellow-600"
                    : "text-muted-foreground"
              }`}
            >
              {kpi.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
              {kpi.trend === "warning" && (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {kpi.change}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
