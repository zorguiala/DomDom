"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, ShoppingCart, TrendingUp, Truck } from "lucide-react";
import { Sale } from "@/types/sales";

interface SalesKPICardsProps {
  sales: Sale[];
}

export function SalesKPICards({ sales }: SalesKPICardsProps) {
  const t = useTranslations("sales");
  
  // Calculate metrics
  const doorToDoorSales = sales.filter((s) => s.type === "DOOR_TO_DOOR");
  const classicSales = sales.filter((s) => s.type === "CLASSIC");
  
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const doorToDoorRevenue = doorToDoorSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const classicRevenue = classicSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  
  const totalOrders = sales.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = sales.filter((sale) => sale.status === "QUOTE").length;
  const inProgressVanSales = doorToDoorSales.filter(
    (sale) => sale.vanOperation?.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {t("totalOrders")}: {totalOrders}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("vanSale")}</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(doorToDoorRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {doorToDoorSales.length} {t("sales")} ({inProgressVanSales} {t("processing")})
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("classicSale")}</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(classicRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {classicSales.length} {t("sales")} ({pendingOrders} {t("quote")})
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("averageOrderValue")}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
          <p className="text-xs text-muted-foreground">{t("perSaleAverage")}</p>
        </CardContent>
      </Card>
    </div>
  );
}