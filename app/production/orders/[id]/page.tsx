"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ProductionOrderWithDetails } from "@/types/production";

export default function ProductionOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("production");
  const common = useTranslations("common");
  const { toast } = useToast();
  const [order, setOrder] = useState<ProductionOrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params?.id as string;

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      fetch(`/api/production/orders/${orderId}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
              errorData.error || `Failed to fetch order: ${res.statusText}`,
            );
          }
          return res.json();
        })
        .then((data) => {
          setOrder(data);
          setError(null);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
          toast({
            variant: "destructive",
            title: t("errorFetchingOrderTitle") || "Error",
            description: err.message || t("errorFetchingOrderDesc"),
          });
        })
        .finally(() => setLoading(false));
    }
  }, [orderId, t, toast]);

  const handleDelete = async () => {
    if (!orderId) return;
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
      router.push("/production/orders");
    } catch (err: any) {
      console.error("Delete error:", err);
      toast({
        variant: "destructive",
        title: t("errorDeletingOrderTitle") || "Delete Failed",
        description: err.message || t("errorDeletingOrderDesc"),
      });
    }
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    switch (status) {
      case "PLANNED":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "DONE":
        return "success";
      case "CANCELLED":
        return "destructive";
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
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!order)
    return <div className="text-center p-4">{t("orderNotFound")}</div>;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("productionOrderDetailsTitle")} - {order.orderNumber}
        </h2>
        <div className="flex items-center space-x-2">
          <Link href="/production/orders">
            <Button variant="outline">{common("backToList")}</Button>
          </Link>
          <Link href={`/production/orders/${order.id}/edit`}>
            <Button>{common("edit")}</Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            {common("delete")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("orderDetails")}</CardTitle>
          <CardDescription>
            {t("orderNumber")}: {order.orderNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <strong>{t("product")}:</strong> {order.product?.name} (SKU:{" "}
              {order.product?.sku})
            </div>
            <div>
              <strong>{t("bom")}:</strong> {order.bom?.name || common("na")}
            </div>
            <div>
              <strong>{t("status")}:</strong>{" "}
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {order.status}
              </Badge>
            </div>
            <div>
              <strong>{t("priority")}:</strong> {order.priority || common("na")}
            </div>
            <div>
              <strong>{t("qtyOrdered")}:</strong> {order.qtyOrdered}{" "}
              {order.product?.unit}
            </div>
            <div>
              <strong>{t("qtyProduced")}:</strong> {order.qtyProduced}{" "}
              {order.product?.unit}
            </div>
            <div>
              <strong>{t("startDate")}:</strong>{" "}
              {order.startDate
                ? new Date(order.startDate).toLocaleDateString()
                : common("na")}
            </div>
            <div>
              <strong>{t("expectedEndDate")}:</strong>{" "}
              {order.expectedEndDate
                ? new Date(order.expectedEndDate).toLocaleDateString()
                : common("na")}
            </div>
            <div>
              <strong>{t("actualEndDate")}:</strong>{" "}
              {order.actualEndDate
                ? new Date(order.actualEndDate).toLocaleDateString()
                : common("na")}
            </div>
            <div>
              <strong>{t("createdAt")}:</strong>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>{t("updatedAt")}:</strong>{" "}
              {new Date(order.updatedAt).toLocaleString()}
            </div>
          </div>
          {order.notes && (
            <div className="pt-4">
              <strong>{t("notes")}:</strong>{" "}
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {order.bom && order.bom.components && order.bom.components.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("bomComponents")}</CardTitle>
            <CardDescription>
              {t("materialsRequiredForOrder", { qty: order.qtyOrdered })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("componentName")}</TableHead>
                  <TableHead>{t("componentSku")}</TableHead>
                  <TableHead className="text-right">{t("qtyPerBom")}</TableHead>
                  <TableHead className="text-right">
                    {t("totalRequired")}
                  </TableHead>
                  <TableHead>{t("unit")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.bom.components.map((component) => (
                  <TableRow key={component.id}>
                    <TableCell>{component.product.name}</TableCell>
                    <TableCell>{component.product.sku}</TableCell>
                    <TableCell className="text-right">
                      {component.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {component.quantity * order.qtyOrdered}
                    </TableCell>
                    <TableCell>
                      {component.unit || component.product.unit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {!order.bom && (
        <Card>
          <CardHeader>
            <CardTitle>{t("bomComponents")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t("noBomAssigned")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
