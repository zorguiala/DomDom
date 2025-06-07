import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

// Mock data - in real app, this would come from API
const inventoryData = {
  totalProducts: 1234,
  lowStockItems: 23,
  outOfStockItems: 7,
  recentlyUpdated: 45,
  topLowStockItems: [
    {
      name: "Widget A",
      currentStock: 5,
      minStock: 20,
      category: "Electronics",
    },
    { name: "Component B", currentStock: 2, minStock: 15, category: "Parts" },
    {
      name: "Material C",
      currentStock: 8,
      minStock: 25,
      category: "Raw Materials",
    },
    { name: "Tool D", currentStock: 1, minStock: 10, category: "Equipment" },
    { name: "Supply E", currentStock: 3, minStock: 12, category: "Office" },
  ],
};

export function InventoryOverview() {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">
              Total Products
            </span>
          </div>
          <div className="text-2xl font-bold">
            {formatNumber(inventoryData.totalProducts)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Low Stock</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {formatNumber(inventoryData.lowStockItems)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Out of Stock</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatNumber(inventoryData.outOfStockItems)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Recently Updated
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(inventoryData.recentlyUpdated)}
          </div>
        </div>
      </div>

      {/* Low Stock Alert List */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
          Low Stock Alerts
        </h4>
        <div className="space-y-2">
          {inventoryData.topLowStockItems.map((item, index) => (
            <div
              key={index}
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
                  Current / Min
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
