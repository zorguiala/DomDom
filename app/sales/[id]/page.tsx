"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { useTranslations } from "@/lib/language-context";
import {
  ArrowLeft,
  Edit,
  Package,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import type { Sale } from "@/types";

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("sales");
  const common = useTranslations("common");
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saleId = params.id as string;

  const fetchSale = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sales/${saleId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Sale not found");
        }
        throw new Error("Failed to fetch sale");
      }
      const data = await response.json();
      setSale(data.sale);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching sale:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (saleId) {
      fetchSale();
    }
  }, [saleId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  if (error || !sale) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Sale not found"}</p>
            <div className="space-x-2">
              <Button onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={fetchSale}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/sales">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sales
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Sale #{sale.id.slice(0, 8)}
            </h2>
            <p className="text-muted-foreground">
              Created {formatDate(new Date(sale.createdAt))}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchSale}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link href={`/sales/${sale.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Sale
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Sale Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Sale Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className={getStatusColor(sale.status)}>
                {sale.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Amount</span>
              <span className="font-bold text-lg">
                {formatCurrency(sale.totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Items</span>
              <span className="font-medium">{sale.totalAmount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Created</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(new Date(sale.createdAt))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Updated</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(new Date(sale.updatedAt))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Name
              </span>
              <p className="font-medium">{sale.customerName}</p>
            </div>
            {sale.customerEmail && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Email
                </span>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{sale.customerEmail}</p>
                </div>
              </div>
            )}
            {sale.customerPhone && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Phone
                </span>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{sale.customerPhone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sale Items */}
      <Card>
        <CardHeader>
          <CardTitle>Sale Items ({sale.items.length})</CardTitle>
          <CardDescription>Products included in this sale</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <Link
                        href={`/inventory/${item.product.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Product
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{item.product.sku}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.qty}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Sale Total */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="text-sm">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(sale.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
