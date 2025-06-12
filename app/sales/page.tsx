"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { useTranslations } from "@/lib/language-context";
import {
  Plus,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Download,
  Truck,
  FileText,
  Package,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Sale {
  id: string;
  saleNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  type: "DOOR_TO_DOOR" | "CLASSIC";
  status: string;
  totalAmount: number;
  subtotal: number;
  tva: number;
  timbre: number;
  exitSlipNumber: string | null;
  exitSlipDate: string | null;
  returnDate: string | null;
  returnedAmount: number;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
    deliveredQty: number;
    returnedQty: number;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }>;
  vanOperation?: {
    id: string;
    driverName: string | null;
    vehicleNumber: string | null;
    status: "IN_PROGRESS" | "COMPLETED";
    totalProductsOut: number;
    totalProductsSold: number;
    totalReturned: number;
  };
}

export default function SalesPage() {
  const t = useTranslations("sales");
  const common = useTranslations("common");
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "DOOR_TO_DOOR" | "CLASSIC">("ALL");

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sales");
      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }
      const data = await response.json();
      setSales(data.sales);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = sales.filter(
    (sale) =>
      (filterType === "ALL" || sale.type === filterType) &&
      (sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customerEmail &&
          sale.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))),
  );

  // Separate calculations for each type
  const doorToDoorSales = sales.filter((s: Sale) => s.type === "DOOR_TO_DOOR");
  const classicSales = sales.filter((s: Sale) => s.type === "CLASSIC");
  
  const totalRevenue = sales.reduce((sum: number, sale: Sale) => sum + sale.totalAmount, 0);
  const doorToDoorRevenue = doorToDoorSales.reduce((sum: number, sale: Sale) => sum + sale.totalAmount, 0);
  const classicRevenue = classicSales.reduce((sum: number, sale: Sale) => sum + sale.totalAmount, 0);
  
  const totalOrders = sales.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = sales.filter(
    (sale) => sale.status === "QUOTE",
  ).length;
  const inProgressVanSales = doorToDoorSales.filter(
    (sale) => sale.vanOperation?.status === "IN_PROGRESS",
  ).length;

  const getStatusVariant = (status: string, type: string, sale?: Sale) => {
    if (type === "DOOR_TO_DOOR") {
      switch (status) {
        case "CONFIRMED":
          return sale?.vanOperation?.status === "IN_PROGRESS" ? "secondary" : "default";
        case "DELIVERED":
          return "default";
        default:
          return "outline";
      }
    }
    
    switch (status.toLowerCase()) {
      case "quote":
        return "secondary";
      case "confirmed":
        return "default";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string, sale: Sale) => {
    if (sale.type === "DOOR_TO_DOOR") {
      if (status === "CONFIRMED" && sale.vanOperation?.status === "IN_PROGRESS") {
        return "In Progress";
      }
      if (status === "DELIVERED") {
        return "Completed";
      }
    }
    
    switch (status.toLowerCase()) {
      case "quote":
        return t("quote");
      case "confirmed":
        return t("confirmed");
      case "delivered":
        return t("delivered");
      case "cancelled":
        return t("cancelled");
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchSales}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchSales} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {common("export")}
          </Button>
          <Link href="/sales/new?type=classic">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Classic Sale
            </Button>
          </Link>
          <Link href="/sales/new?type=door-to-door">
            <ShimmerButton>
              <Truck className="mr-2 h-4 w-4" />
              Van Sale
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
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Sales</SelectItem>
            <SelectItem value="CLASSIC">Classic Sales</SelectItem>
            <SelectItem value="DOOR_TO_DOOR">Van Sales</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalRevenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {totalOrders} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Van Sales Revenue
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(doorToDoorRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {doorToDoorSales.length} van sales ({inProgressVanSales} in progress)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Classic Sales Revenue
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(classicRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {classicSales.length} classic sales ({pendingOrders} quotes)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("averageOrderValue")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">Per sale average</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales ({filteredSales.length})</CardTitle>
              <CardDescription>
                {filteredSales.length === sales.length
                  ? "All sales records"
                  : `Filtered from ${sales.length} total sales`}
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
          <Table>
            <TableCaption>Recent sales transactions</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Sale #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>{t("customer")}</TableHead>
                <TableHead>{common("date")}</TableHead>
                <TableHead>{common("amount")}</TableHead>
                <TableHead>{common("status")}</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">{common("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {searchTerm
                      ? "No sales found matching your search."
                      : "No sales found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{sale.saleNumber}</Badge>
                    </TableCell>
                    <TableCell>
                      {sale.type === "DOOR_TO_DOOR" ? (
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          <span>Van</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>Classic</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sale.customerName}</div>
                        {sale.customerEmail && (
                          <div className="text-sm text-muted-foreground">
                            {sale.customerEmail}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(new Date(sale.createdAt))}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {formatCurrency(sale.totalAmount)}
                        </div>
                        {sale.type === "CLASSIC" && sale.tva > 0 && (
                          <div className="text-xs text-muted-foreground">
                            TVA: {formatCurrency(sale.tva)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(sale.status, sale.type, sale)}>
                        {getStatusLabel(sale.status, sale)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sale.type === "DOOR_TO_DOOR" ? (
                        <div className="text-sm">
                          {sale.vanOperation && (
                            <>
                              <div>Driver: {sale.vanOperation.driverName || "N/A"}</div>
                              {sale.exitSlipNumber && (
                                <div className="text-muted-foreground">
                                  Exit: {sale.exitSlipNumber}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm">
                          {sale.items.length} items
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/sales/${sale.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {sale.type === "DOOR_TO_DOOR" && 
                         sale.vanOperation?.status === "IN_PROGRESS" && (
                          <Link href={`/sales/${sale.id}/returns`}>
                            <Button variant="ghost" size="sm">
                              <Package className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/sales/${sale.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
