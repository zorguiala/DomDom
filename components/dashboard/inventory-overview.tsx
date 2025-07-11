import { AlertTriangle, Package, TrendingDown, TrendingUp, RefreshCw } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useTranslations } from "@/lib/language-context";
import { useDashboardInventory } from "./data/use-get-inventory/use-get-inventory";

export function InventoryOverview() {
  const { data, isLoading, error } = useDashboardInventory();
  const common = useTranslations("common");
  const dashboardT = useTranslations("dashboard");

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Summary Stats Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="space-y-2 p-4 bg-muted/30 rounded-lg animate-pulse">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-7 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
        {/* Low Stock Alert List Skeleton */}
        <div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 animate-pulse">
                <div className="flex-1 space-y-1 py-1">
                  <div className="h-3 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="text-right space-y-1 py-1">
                  <div className="h-3 w-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
         <div className="text-center text-sm text-muted-foreground">{common("loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full text-red-500 p-4 border border-red-200 bg-red-50 rounded-md">
        Failed to load inventory overview: {error?.message || 'Unknown error'}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="col-span-full text-muted-foreground p-4">
        No inventory data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">
              {dashboardT("inventory.totalProducts")}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {formatNumber(data.totalProducts)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">{dashboardT("inventory.lowStock")}</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {formatNumber(data.lowStockItems)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">{dashboardT("inventory.outOfStock")}</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatNumber(data.outOfStockItems)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              {dashboardT("inventory.recentlyUpdated")}
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(data.recentlyUpdated)}
          </div>
        </div>
      </div>

      {/* Low Stock Alert List */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
          {dashboardT("inventory.lowStockAlertsTitle")}
        </h4>
        <div className="space-y-2">
          {data.topLowStockItems && data.topLowStockItems.length > 0 ? (
            data.topLowStockItems.map((item) => (
              <div
                key={item.id} // Assuming API provides an id for each item
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-yellow-600">
                    {item.currentStock} / {item.minStock}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dashboardT("inventory.currentMinLabel")}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{dashboardT("inventory.noLowStockItems")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
