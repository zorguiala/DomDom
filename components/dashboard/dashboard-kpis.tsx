import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "@/lib/language-context";
import { useDashboardKpi } from "./data/use-get-kpi/use-get-kpi";

export function DashboardKPIs() {
  const { data: kpiData, isLoading, error } = useDashboardKpi();
  const common = useTranslations("common");
  const dashboardT = useTranslations("dashboard"); // For dashboard specific translations

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full text-red-500 p-4 border border-red-200 bg-red-50 rounded-md">
        Failed to load KPIs: {error instanceof Error ? error.message : error}
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="col-span-full text-muted-foreground p-4">
        No KPI data available.
      </div>
    );
  }

  const displayKpis = [
    {
      title: dashboardT("kpi.totalRevenue"),
      value: formatCurrency(kpiData.totalRevenue),
      change: dashboardT("kpi.revenueChange", { change: kpiData.revenueChange }),
      icon: DollarSign,
      trend: kpiData.revenueChange >= 0 ? "up" : "down",
    },
    {
      title: dashboardT("kpi.orders"),
      value: formatNumber(kpiData.totalOrders),
      change: dashboardT("kpi.ordersChange", { change: kpiData.ordersChange }),
      icon: ShoppingCart,
      trend: kpiData.ordersChange >= 0 ? "up" : "down",
    },
    {
      title: dashboardT("kpi.products"),
      value: formatNumber(kpiData.totalProducts),
      change: dashboardT("kpi.lowStockAlert", { count: kpiData.lowStockCount }),
      icon: Package,
      trend: kpiData.lowStockCount > 0 ? "warning" : "neutral",
    },
    {
      title: dashboardT("kpi.employees"),
      value: formatNumber(kpiData.totalEmployees),
      change: dashboardT("kpi.newEmployees", { count: kpiData.employeesChange }),
      icon: Users,
      trend: kpiData.employeesChange === 0 ? "neutral" : (kpiData.employeesChange > 0 ? "up" : "down"),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {displayKpis.map((kpi, index) => (
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
                  : kpi.trend === "down"
                    ? "text-red-600"
                    : kpi.trend === "warning"
                      ? "text-yellow-600"
                      : "text-muted-foreground"
              }`}
            >
              {kpi.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
              {kpi.trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
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
