"use client";

import { useTranslations } from "@/lib/language-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
// Import your own Table components here
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function ProductionOrdersPage() {
  const t = useTranslations("production");
  const common = useTranslations("common");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/production/orders");
      if (!res.ok) throw new Error(await res.text());
      setOrders(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDeleteOrder") || "Delete order?")) return;
    await fetch("/api/production/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchOrders();
  };

  if (loading) return <div>{common("loading")}</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("ordersListTitle")}</CardTitle>
          </div>
          <Link href="/production/orders/new">
            <Button>{t("newOrder")}</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("orderNumber")}</TableHead>
                <TableHead>{t("product")}</TableHead>
                <TableHead>{t("bom")}</TableHead>
                <TableHead>{t("qtyOrdered")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("priority")}</TableHead>
                <TableHead>{t("startDate")}</TableHead>
                <TableHead>{t("expectedEndDate")}</TableHead>
                <TableHead>{common("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.product?.name}</TableCell>
                  <TableCell>{order.bom?.name}</TableCell>
                  <TableCell>{order.qtyOrdered}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.priority}</TableCell>
                  <TableCell>{order.startDate ? new Date(order.startDate).toLocaleDateString() : ""}</TableCell>
                  <TableCell>{order.expectedEndDate ? new Date(order.expectedEndDate).toLocaleDateString() : ""}</TableCell>
                  <TableCell>
                    <Link href={`/production/orders/${order.id}/edit`}>
                      <Button size="sm" variant="outline">{common("edit")}</Button>
                    </Link>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(order.id)}>{common("delete")}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 