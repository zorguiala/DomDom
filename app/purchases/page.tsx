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
import { Plus, ShoppingCart, Package, Truck, DollarSign } from "lucide-react";
import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { addDays, isWithinInterval } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useGetPurchases } from "./data/use-get-purchases/use-get-purchases";
import Link from "next/link";
import { InputMagic } from "@/components/ui/select-magic";

export default function PurchasesPage() {
  const t = useTranslations("purchases");
  const common = useTranslations("common");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const { data: purchases = [], isLoading, error } = useGetPurchases();

  // Filter purchases by date range
  const filteredPurchases = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return purchases;
    return purchases.filter((purchase: any) => {
      const orderDate = new Date(purchase.orderDate);
      if (
        !orderDate ||
        isNaN(orderDate.getTime()) ||
        !dateRange.from ||
        isNaN(dateRange.from.getTime()) ||
        !dateRange.to ||
        isNaN(dateRange.to.getTime())
      ) {
        return true; // or false, depending on whether you want to show or hide invalid dates
      }
      return isWithinInterval(orderDate, { start: dateRange.from, end: dateRange.to });
    });
  }, [purchases, dateRange]);

  // KPIs
  const totalSpent = filteredPurchases.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0);
  const pendingOrders = filteredPurchases.filter((p: any) => p.status === "DRAFT").length;
  const deliveredOrders = filteredPurchases.filter((p: any) => p.status === "RECEIVED").length;
  const inTransitOrders = filteredPurchases.filter((p: any) => p.status === "CONFIRMED").length;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/purchases/new">
            <ShimmerButton>
              <Plus className="mr-2 h-4 w-4" />
              {t("newOrder")}
            </ShimmerButton>
          </Link>
        </div>
      </div>

      {/* Date Range Picker */}
      <Card className="mb-4 p-4">
        <label className="block text-sm font-medium mb-1">{common("dateRange")}</label>
        <div className="flex items-center gap-2">
          <InputMagic
            type="date"
            value={dateRange.from && !isNaN(dateRange.from.getTime()) ? dateRange.from.toISOString().slice(0, 10) : ""}
            onChange={e => setDateRange(r => ({ ...r, from: e.target.value ? new Date(e.target.value) : undefined }))}
            className="mr-2"
          />
          <span className="mx-2">-</span>
          <InputMagic
            type="date"
            value={dateRange.to && !isNaN(dateRange.to.getTime()) ? dateRange.to.toISOString().slice(0, 10) : ""}
            onChange={e => setDateRange(r => ({ ...r, to: e.target.value ? new Date(e.target.value) : undefined }))}
          />
        </div>
      </Card>

      {/* Purchase Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalSpent")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">{t("kpiThisMonth")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("pendingOrders")}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">{t("kpiAwaitingApproval")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("delivered")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredOrders}</div>
            <p className="text-xs text-muted-foreground">{t("kpiThisMonth")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("inTransit")}
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTransitOrders}</div>
            <p className="text-xs text-muted-foreground">{t("kpiExpectedThisWeek")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentOrders")}</CardTitle>
          <CardDescription>{t("recentOrdersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">{common("loading")}</div>
          ) : error ? (
            <div className="text-sm text-red-600">{common("error")}</div>
          ) : (
            <PurchaseTable purchases={filteredPurchases} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PurchaseTable({ purchases }: { purchases: any[] }) {
  const t = useTranslations("purchases");
  const common = useTranslations("common");
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">{t("poNumber")}</th>
            <th className="px-4 py-2 text-left">{t("supplier")}</th>
            <th className="px-4 py-2 text-left">{common("date")}</th>
            <th className="px-4 py-2 text-left">{t("status")}</th>
            <th className="px-4 py-2 text-left">{t("totalAmount")}</th>
          </tr>
        </thead>
        <tbody>
          {purchases.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-muted-foreground">
                {t("noPOsFound")}
              </td>
            </tr>
          ) : (
            purchases.map((purchase) => (
              <tr key={purchase.id}>
                <td className="px-4 py-2 font-mono">
                  <Link href={`/purchases/${purchase.id}/edit`} className="text-primary hover:underline">
                    {purchase.poNumber}
                  </Link>
                </td>
                <td className="px-4 py-2">{purchase.supplier?.companyName || purchase.supplierName || "-"}</td>
                <td className="px-4 py-2">{new Date(purchase.orderDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                    purchase.status === "DRAFT" ? "bg-yellow-100 text-yellow-800" :
                    purchase.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                    purchase.status === "RECEIVED" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {purchase.status}
                  </span>
                </td>
                <td className="px-4 py-2">{formatCurrency(purchase.totalAmount)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
