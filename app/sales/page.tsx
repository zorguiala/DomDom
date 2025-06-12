"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-radix";
import { useTranslations } from "@/lib/language-context";
import { Calendar, Download, FileText, Filter, RefreshCw, Search, Truck } from "lucide-react";
import Link from "next/link";
import { useSales } from "@/hooks/sales/use-sales";
import { SalesKPICards } from "@/components/sales/sales-kpi-cards";
import { SalesTable } from "@/components/sales/sales-table";
import { SaleType } from "@/types/sales";


export default function SalesPage() {
  const t = useTranslations("sales");
  const common = useTranslations("common");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | SaleType>("ALL");
  
  const { data: sales = [], isLoading, error, refetch } = useSales();

  // Filter sales based on search and type
  const filteredSales = sales.filter(
    (sale) =>
      (filterType === "ALL" || sale.type === filterType) &&
      (sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customerEmail &&
          sale.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{common("error")}</p>
            <Button onClick={() => refetch()}>

              <RefreshCw className="mr-2 h-4 w-4" />
              {common("tryAgain")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filteredSales = sales.filter(
    (sale) =>
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customerEmail &&
        sale.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {common("refresh")}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {common("export")}
          </Button>
          <Link href="/sales/new?type=classic">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              {t("classicSale")}
            </Button>
          </Link>
          <Link href="/sales/new?type=door-to-door">
            <ShimmerButton>
              <Truck className="mr-2 h-4 w-4" />
              {t("vanSale")}
            </ShimmerButton>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("placeholderSearchSales")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select 
          value={filterType} 
          onValueChange={(value) => setFilterType(value as "ALL" | SaleType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("allSales")}</SelectItem>
            <SelectItem value="CLASSIC">{t("classicSales")}</SelectItem>
            <SelectItem value="DOOR_TO_DOOR">{t("vanSales")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <SalesKPICards sales={sales} />
      )}

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {t("sales")} ({filteredSales.length})
              </CardTitle>
              <CardDescription>
                {filteredSales.length === sales.length
                  ? t("allSalesRecords")
                  : t("filteredFromTotal", { filtered: filteredSales.length, total: sales.length })}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {common("filter")}
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                {common("dateRange")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <SalesTable sales={filteredSales} />
          )}

        </CardContent>
      </Card>
    </div>
  );
}
