"use client";

import { useTranslations } from "@/lib/language-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Factory,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

interface ProductionOrder {
  id: string;
  orderNumber: string;
  product?: { name: string };
  bom?: { name: string };
  qtyOrdered: number;
  status: string;
  priority: string;
  startDate?: string;
  expectedEndDate?: string;
  createdAt: string;
}

function ProductionOrdersTable() {
  const t = useTranslations("production");
  // const common = useTranslations("common"); // common is not used here
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/production/orders");
        if (response.ok) {
          const data = await response.json();
          setOrders(data.slice(0, 5)); // Show only recent 5 orders
        }
      } catch (error) {
        console.error("Failed to fetch production orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) { // Normalize to uppercase for reliable matching
      case "COMPLETED":
      case "DONE": // Assuming DONE maps to completed
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      case "PLANNED":
        return "outline";
      case "DELAYED":
      case "CANCELLED": // Assuming CANCELLED also uses destructive
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority.toUpperCase()) { // Normalize
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary";
      case "LOW":
        return "outline";
      default:
        return "outline";
    }
  };

  const translateStatus = (status: string) => {
    const upperStatus = status.toUpperCase();
    if (upperStatus === "COMPLETED" || upperStatus === "DONE") return t("statusDone");
    if (upperStatus === "IN_PROGRESS") return t("statusInProgress");
    if (upperStatus === "PLANNED") return t("statusPlanned");
    if (upperStatus === "DELAYED") return t("delayed"); // Uses existing production.delayed
    if (upperStatus === "CANCELLED") return t("statusCancelled");
    return status; // Fallback to raw status if no match
  };

  const translatePriority = (priority: string) => {
    const upperPriority = priority.toUpperCase();
    if (upperPriority === "HIGH") return t("high");
    if (upperPriority === "MEDIUM") return t("medium");
    if (upperPriority === "LOW") return t("low");
    return priority; // Fallback
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-sm text-muted-foreground">
          {t("noOrdersFound") || "No production orders found."}
        </div>
        <Link href="/production/orders/new">
          <Button className="mt-4">
            {t("createFirstOrder") || "Create First Order"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("orderNumber")}</TableHead>
          <TableHead>{t("product")}</TableHead>
          <TableHead>{t("quantity")}</TableHead>
          <TableHead>{t("status")}</TableHead>
          <TableHead>{t("priority")}</TableHead>
          <TableHead>{t("expectedEndDate")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">
              <Badge variant="outline">#{order.orderNumber}</Badge>
            </TableCell>
            <TableCell>
              <div className="font-medium">{order.product?.name || t("notApplicable")}</div>
              {order.bom?.name && (
                <div className="text-sm text-muted-foreground">
                  {t("bomPrefix")}{order.bom.name}
                </div>
              )}
            </TableCell>
            <TableCell>{order.qtyOrdered}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(order.status)}>
                {translateStatus(order.status)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getPriorityVariant(order.priority)}>
                {translatePriority(order.priority)}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {order.expectedEndDate
                ? formatDate(new Date(order.expectedEndDate))
                : t("notSet")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ProductionPage() {
  const t = useTranslations("");
  // const common = useTranslations("common"); // Not used directly here, but available if needed
  const dashboardT = useTranslations("dashboard"); // For dashboard.production keys

  const [kpis, setKpis] = useState({
    activeOrders: 0,
    inProgress: 0,
    completed: 0,
    delayed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const response = await fetch("/api/production/orders"); // This fetches all orders
        if (response.ok) {
          const orders: ProductionOrder[] = await response.json();

          const activeOrders = orders.filter(
            (order) =>
              order.status.toUpperCase() !== "COMPLETED" && order.status.toUpperCase() !== "DONE" && order.status.toUpperCase() !== "CANCELLED",
          ).length;

          const inProgress = orders.filter(
            (order) => order.status.toUpperCase() === "IN_PROGRESS",
          ).length;

          // Assuming "completed" for KPI means "DONE" or "COMPLETED" status
          const completed = orders.filter(
            (order) => order.status.toUpperCase() === "COMPLETED" || order.status.toUpperCase() === "DONE",
          ).length;

          const delayed = orders.filter(
            (order) =>
              order.status.toUpperCase() === "DELAYED" ||
              (order.expectedEndDate &&
                new Date(order.expectedEndDate) < new Date() &&
                order.status.toUpperCase() !== "COMPLETED" && order.status.toUpperCase() !== "DONE" && order.status.toUpperCase() !== "CANCELLED"),
          ).length;

          setKpis({ activeOrders, inProgress, completed, delayed });
        }
      } catch (error) {
        console.error("Failed to fetch production KPIs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("production.title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>{" "}
        <div className="flex items-center space-x-2">
          <Link href="/production/orders/new">
            <ShimmerButton>
              <Plus className="mr-2 h-4 w-4" />
              {t("newOrder")}
            </ShimmerButton>
          </Link>
        </div>
      </div>
      {/* Production Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("activeOrders")}
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>{" "}
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                kpis.activeOrders
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardT("production.kpiActiveOrdersDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("inProgress")}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>{" "}
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                kpis.inProgress
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardT("production.kpiInProgressDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("completed")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>{" "}
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                kpis.completed
              )}
            </div>
            <p className="text-xs text-muted-foreground">{dashboardT("production.kpiCompletedDesc")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("delayed")}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>{" "}
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                kpis.delayed
              )}
            </div>
            <p className="text-xs text-muted-foreground">{dashboardT("production.kpiDelayedDesc")}</p>
          </CardContent>
        </Card>
      </div>{" "}
      {/* Production Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("recentOrders")}</CardTitle>
            <CardDescription>{t("recentOrdersDescription")}</CardDescription>
          </div>
          <Link href="/production/orders">
            <Button>{t("viewAllOrders")}</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <ProductionOrdersTable />
        </CardContent>
      </Card>
    </div>
  );
}
