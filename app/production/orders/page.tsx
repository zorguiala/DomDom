"use client";

import { useTranslations } from "@/lib/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SelectMagic } from "@/components/ui/select-magic";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductionOrderWithDetails } from "@/types/production";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Play, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import {
  AnimatedList,
  AnimatedListItem,
  AnimatedTableRow,
} from "@/components/magicui/animated-list";

export default function ProductionOrdersPage() {
  const t = useTranslations("production");
  const common = useTranslations("common");
  const { toast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<ProductionOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/production/orders");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Failed to fetch orders: ${res.statusText}`,
        );
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: t("errorFetchingOrdersTitle") || "Error Fetching Orders",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Validation logic
    if (order.status === newStatus) return; // No change needed
    
    if (newStatus === "IN_PROGRESS" && order.status !== "PLANNED") {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("canOnlyStartFromPlanned") || "Can only start production from PLANNED status",
      });
      return;
    }

    if (newStatus === "COMPLETED" && !["PLANNED", "IN_PROGRESS"].includes(order.status)) {
      toast({
        variant: "destructive", 
        title: t("error"),
        description: t("canOnlyCompleteFromPlannedOrProgress") || "Can only complete from PLANNED or IN_PROGRESS status",
      });
      return;
    }

    // Confirm completion
    if (newStatus === "COMPLETED") {
      const confirmed = confirm(
        t("confirmCompleteOrder") || 
        `Are you sure you want to mark this production order as completed? This will update inventory automatically.`
      );
      if (!confirmed) return;
    }

    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/production/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          qtyProduced: newStatus === "COMPLETED" ? order.qtyOrdered : order.qtyProduced
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      // Show success message
      toast({
        title: common("success"),
        description: t("statusUpdatedSuccessfully") || "Status updated successfully",
      });

      // Refresh orders
      fetchOrders();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: err.message,
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (
      !confirm(
        t("confirmDeleteOrder") ||
          "Are you sure you want to delete this production order?",
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/production/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete order");
      }
      toast({
        title: t("orderDeletedTitle") || "Order Deleted",
        description:
          t("orderDeletedDesc") ||
          "The production order has been successfully deleted.",
      });
      fetchOrders();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("errorDeletingOrderTitle") || "Delete Failed",
        description: err.message,
      });
    }
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case "PLANNED":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PLANNED":
        return <Clock className="h-3 w-3" />;
      case "IN_PROGRESS":
        return <Play className="h-3 w-3" />;
      case "COMPLETED":
        return <CheckCircle className="h-3 w-3" />;
      case "CANCELLED":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case "PLANNED":
        return [
          { value: "IN_PROGRESS", label: t("inProgress") || "In Progress" },
          { value: "COMPLETED", label: t("completed") || "Completed" },
          { value: "CANCELLED", label: t("cancelled") || "Cancelled" },
        ];
      case "IN_PROGRESS":
        return [
          { value: "COMPLETED", label: t("completed") || "Completed" },
          { value: "CANCELLED", label: t("cancelled") || "Cancelled" },
        ];
      case "COMPLETED":
      case "CANCELLED":
        return []; // Cannot change from final states
      default:
        return [];
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        {common("loading")}
      </div>
    );

  if (error && orders.length === 0)
    return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("ordersListTitle")}
        </h2>
        <div className="flex items-center space-x-2">
          <Link href="/production/orders/new">
            <Button>{t("newOrder")}</Button>
          </Link>
        </div>
      </div>

      {error && orders.length > 0 && (
        <p className="text-sm font-medium text-destructive text-center">
          {error}
        </p>
      )}

      <Card>
        <CardContent className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("orderNumber")}</TableHead>
                <TableHead>{t("product")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("progress")}</TableHead>
                <TableHead className="text-right">{t("qtyOrdered")}</TableHead>
                <TableHead className="text-right">{t("qtyProduced")}</TableHead>
                <TableHead>{t("priority")}</TableHead>
                <TableHead className="text-center">{common("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {t("noOrdersFound")}
                  </TableCell>
                </TableRow>
              )}

              {orders.map((order) => {
                let progressValue = 0;
                let progressText = "";
                if (order.qtyOrdered > 0) {
                  progressValue = (order.qtyProduced / order.qtyOrdered) * 100;
                }

                switch (order.status) {
                  case "PLANNED":
                    progressText = `0% (0/${order.qtyOrdered})`;
                    progressValue = 0;
                    break;
                  case "IN_PROGRESS":
                    progressText = `${Math.round(progressValue)}% (${order.qtyProduced}/${order.qtyOrdered})`;
                    break;
                  case "COMPLETED":
                    progressText = `${common("completed")} (${order.qtyProduced}/${order.qtyOrdered})`;
                    progressValue = 100;
                    break;
                  case "CANCELLED":
                    progressText = common("na");
                    progressValue = 0;
                    break;
                  default:
                    progressText = common("na");
                }

                const availableStatuses = getAvailableStatuses(order.status);

                return (
                  <AnimatedTableRow
                    key={order.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 40 }}
                  >
                    <TableCell>
                      <Link
                        href={`/production/orders/${order.id}`}
                        className="hover:underline text-primary font-medium"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.product?.name || common("na")}</div>
                        {order.bom && (
                          <div className="text-xs text-muted-foreground">
                            BOM: {order.bom.name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                        
                        {/* Inline Status Changer */}
                        {availableStatuses.length > 0 && (
                          <div className="min-w-[120px]">
                            <SelectMagic
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStatusChange(order.id, e.target.value);
                                }
                              }}
                              disabled={updatingStatus === order.id}
                              className="text-xs h-7"
                            >
                              <option value="">{t("changeStatus") || "Change..."}</option>
                              {availableStatuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </SelectMagic>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="min-w-[150px]">
                      <div className="flex flex-col">
                        <div aria-hidden="true">
                          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                order.status === "CANCELLED" 
                                  ? "bg-gray-400" 
                                  : order.status === "COMPLETED" 
                                    ? "bg-green-500" 
                                    : "bg-primary"
                              }`}
                              style={{ width: `${progressValue}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {progressText}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right font-medium">
                      {order.qtyOrdered}
                    </TableCell>
                    
                    <TableCell className="text-right font-medium">
                      {order.qtyProduced}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {order.priority || common("na")}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{common("openMenu")}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{common("actions")}</DropdownMenuLabel>
                          
                          <DropdownMenuItem
                            onClick={() => router.push(`/production/orders/${order.id}`)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            {common("viewDetails")}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => router.push(`/production/orders/${order.id}/edit`)}
                            disabled={order.status === "COMPLETED"}
                            className="flex items-center gap-2"
                          >
                            {common("edit")}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => handleDelete(order.id)}
                            disabled={["IN_PROGRESS", "COMPLETED"].includes(order.status)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-700 dark:focus:text-red-50"
                          >
                            {common("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </AnimatedTableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
