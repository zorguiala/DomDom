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
import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/language-context"; // Assuming this is the project's i18n hook

interface ApiKpiData {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  lowStockCount: number;
  totalEmployees: number;
  employeesChange: number;
}

export function DashboardKPIs() {
  const [kpiData, setKpiData] = useState<ApiKpiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const common = useTranslations("common"); // For "Loading..."

  useEffect(() => {
    const fetchKpiData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard KPIs");
        }
        const data = await response.json();
        setKpiData(data.kpis); // Assuming API returns { kpis: { ... } }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpiData();
  }, []);

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
        Failed to load KPIs: {error}
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

  // Transform fetched kpiData into the structure expected by the map function
  const displayKpis = [
    {
      title: "Total Revenue", // Consider translating these titles if needed
      value: formatCurrency(kpiData.totalRevenue),
      change: `${kpiData.revenueChange >= 0 ? '+' : ''}${kpiData.revenueChange}% from last month`,
      icon: DollarSign,
      trend: kpiData.revenueChange >= 0 ? "up" : "down",
    },
    {
      title: "Orders",
      value: formatNumber(kpiData.totalOrders),
      change: `${kpiData.ordersChange >= 0 ? '+' : ''}${kpiData.ordersChange}% from last month`,
      icon: ShoppingCart,
      trend: kpiData.ordersChange >= 0 ? "up" : "down",
    },
    {
      title: "Products",
      value: formatNumber(kpiData.totalProducts),
      change: `${kpiData.lowStockCount} low stock alerts`,
      icon: Package,
      trend: kpiData.lowStockCount > 0 ? "warning" : "neutral", // Neutral if no low stock
    },
    {
      title: "Employees",
      value: formatNumber(kpiData.totalEmployees),
      change: `${kpiData.employeesChange >= 0 ? '+' : ''}${kpiData.employeesChange} this month`,
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
                      : "text-muted-foreground" // Neutral trend
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
