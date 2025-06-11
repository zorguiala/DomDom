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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslations } from "@/lib/language-context";
import { ArrowLeft, Save, RefreshCw, Package, User } from "lucide-react";
import Link from "next/link";
import type { Sale } from "@/types";

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function EditSalePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("sales");
  const common = useTranslations("common");
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [status, setStatus] = useState("");

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

      // Populate form fields
      setCustomerName(data.sale.customerName);
      setCustomerEmail(data.sale.customerEmail || "");
      setCustomerPhone(data.sale.customerPhone || "");
      setStatus(data.sale.status);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching sale:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/sales/${saleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || null,
          customerPhone: customerPhone.trim() || null,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update sale");
      }

      // Redirect to sale detail page
      router.push(`/sales/${saleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (saleId) {
      fetchSale();
    }
  }, [saleId]);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error && !sale) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
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
          <Link href={`/sales/${saleId}`}>
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sale
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Edit Sale #{sale?.id.slice(0, 8)}
            </h2>
            <p className="text-muted-foreground">
              Update sale information and status
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Sale Information Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Update customer details for this sale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t("placeholderEnterCustomerName")}
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder={t("placeholderEnterCustomerEmail")}
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t("placeholderEnterCustomerPhone")}
              />
            </div>
            <div>
              <Label htmlFor="status">{common("status")}</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Sale Summary */}
        {sale && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Sale Summary
              </CardTitle>
              <CardDescription>Read-only sale information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sale ID</span>
                <Badge>#{sale.id.slice(0, 8)}</Badge>
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
                <span className="text-sm font-medium">{common("created")}</span>
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
        )}
      </div>

      {/* Sale Items (Read-only) */}
      {sale && (
        <Card>
          <CardHeader>
            <CardTitle>Sale Items ({sale.items.length})</CardTitle>
            <CardDescription>
              Products included in this sale (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{common("product")}</TableHead>
                  <TableHead>{t("inventory.sku")}</TableHead>
                  <TableHead className="text-right">{common("quantity")}</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">{common("total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.product.name}</div>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
