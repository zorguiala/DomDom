"use client";

import { useTranslations } from "@/lib/language-context";
import { Card, CardContent } from "@/components/ui/card"; // Removed CardHeader, CardTitle
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal } from "lucide-react";
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
      // Assuming API returns an array directly or an object like { orders: [] }
      // The previous /api/production/orders/route.ts returns orders directly as an array
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      fetchOrders(); // Refresh the list
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
        return "default"; // Blue in shadcn
      case "DONE":
        return "success"; // Green
      case "CANCELLED":
        return "destructive"; // Red
      default:
        return "outline";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        {common("loading")}
      </div>
    );
  // Show error message if fetch failed and no orders are loaded
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
      {/* Display error message even if some orders are loaded, but less prominently */}
      {error && orders.length > 0 && (
        <p className="text-sm font-medium text-destructive text-center">
          {error}
        </p>
      )}
      <Card>
        <CardContent className="mt-4">
          {" "}
          {/* Added mt-4 for spacing if CardHeader is removed */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("orderNumber")}</TableHead>
                <TableHead>{t("product")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("progress")}</TableHead>{" "}
                {/* New Progress Column */}
                <TableHead className="text-right">{t("qtyOrdered")}</TableHead>
                <TableHead className="text-right">{t("qtyProduced")}</TableHead>
                <TableHead>{t("priority")}</TableHead>
                {/* <TableHead>{t("expectedEndDate")}</TableHead> -- Removing to save space, can be on detail page */}
                <TableHead className="text-center">
                  {common("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {" "}
                    {/* Adjusted colSpan */}
                    {t("noOrdersFound")}
                  </TableCell>
                </TableRow>
              )}
              {/* Animate each table row using AnimatedTableRow (motion.tr) for valid table structure */}
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
                  case "DONE":
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
                        className="hover:underline text-primary"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{order.product?.name || common("na")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      {" "}
                      {/* Progress Cell */}
                      {/* Always show a progress bar for visual consistency and accessibility */}
                      <div className="flex flex-col">
                        <div aria-hidden="true">
                          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${order.status === "CANCELLED" ? "bg-gray-400" : order.status === "DONE" ? "bg-green-500" : "bg-primary"}`}
                              style={{ width: `${progressValue}%` }}
                            />
                          </div>
                        </div>
                        <span
                          className="text-xs text-muted-foreground mt-1"
                          aria-label={progressText}
                        >
                          {progressText}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {order.qtyOrdered}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.qtyProduced}
                    </TableCell>
                    <TableCell>{order.priority || common("na")}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">
                              {common("openMenu")}
                            </span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {common("actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/production/orders/${order.id}`)
                            }
                          >
                            {common("viewDetails")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/production/orders/${order.id}/edit`)
                            }
                          >
                            {common("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(order.id)}
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
