import { Clock, CheckCircle, AlertCircle, PlayCircle } from "lucide-react";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { useTranslations } from "@/lib/language-context";

type ProductionOrderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "delayed";

interface StatusConfig {
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

// Mock data - in real app, this would come from API
const productionData = {
  activeOrders: 15,
  completedToday: 8,
  pendingOrders: 23,
  delayedOrders: 3,
  recentOrders: [
    {
      id: "PO-001",
      product: "Widget Assembly A",
      quantity: 100,
      status: "in_progress" as ProductionOrderStatus,
      progress: 65,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      expectedCompletion: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    },
    {
      id: "PO-002",
      product: "Component Set B",
      quantity: 250,
      status: "completed" as ProductionOrderStatus,
      progress: 100,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      expectedCompletion: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: "PO-003",
      product: "Custom Part C",
      quantity: 50,
      status: "pending" as ProductionOrderStatus,
      progress: 0,
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
      expectedCompletion: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), // 4 days from now
    },
    {
      id: "PO-004",
      product: "Tool Kit D",
      quantity: 75,
      status: "delayed" as ProductionOrderStatus,
      progress: 30,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      expectedCompletion: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago (delayed)
    },
  ],
};

const statusConfig: Record<ProductionOrderStatus, StatusConfig> = {
  pending: { icon: Clock, color: "text-gray-500", bgColor: "bg-gray-100" },
  in_progress: {
    icon: PlayCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  completed: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  delayed: { icon: AlertCircle, color: "text-red-500", bgColor: "bg-red-100" },
};

export function ProductionStatus() {
  const common = useTranslations("common");
  const productionT = useTranslations("production"); // For existing "delayed"
  const dashProdT = useTranslations("dashboard.production");

  const getStatusTranslation = (status: ProductionOrderStatus) => {
    switch (status) {
      case "in_progress":
        return dashProdT("statusInProgress");
      case "completed":
        return dashProdT("statusCompleted");
      case "pending":
        return dashProdT("statusPending"); // Using new specific key
      case "delayed":
        return dashProdT("statusDelayed"); // Using new specific key
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <PlayCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">{dashProdT("activeOrders")}</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(productionData.activeOrders)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              {dashProdT("completedToday")}
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(productionData.completedToday)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-muted-foreground">{dashProdT("statusPending")}</span>
          </div>
          <div className="text-2xl font-bold text-gray-600">
            {formatNumber(productionData.pendingOrders)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">{dashProdT("statusDelayed")}</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatNumber(productionData.delayedOrders)}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h4 className="text-sm font-medium mb-3">{dashProdT("recentOrdersTitle")}</h4>
        <div className="space-y-3">
          {productionData.recentOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            return (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${statusConfig[order.status].bgColor}`}
                  >
                    <StatusIcon
                      className={`h-4 w-4 ${statusConfig[order.status].color}`}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{order.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.product}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dashProdT("quantityPrefix")}{formatNumber(order.quantity)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium capitalize">
                    {getStatusTranslation(order.status)}
                  </div>
                  {order.status === "in_progress" && (
                    <div className="text-xs text-muted-foreground">
                      {order.progress}{dashProdT("progressSuffix")}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {order.status === "completed"
                      ? `${dashProdT("completedPrefix")}${formatRelativeTime(order.expectedCompletion)}`
                      : `${dashProdT("duePrefix")}${formatRelativeTime(order.expectedCompletion)}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
