// app/[locale]/dashboard/purchases/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // For displaying status
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";
import { format } from 'date-fns'; // For date formatting

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface PurchaseItem {
  id: string;
  product: Product;
  qtyOrdered: number;
  qtyReceived: number;
  unitCost: number;
  totalCost: number;
}

interface SupplierInfo {
  id: string;
  companyName: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier?: SupplierInfo | null; // From include: { supplier: true }
  supplierName?: string | null; // Fallback if supplier relation is not there
  orderDate: string;
  expectedDate?: string | null;
  receivedDate?: string | null;
  status: string; // e.g., DRAFT, CONFIRMED, RECEIVED
  totalAmount: number;
  items: PurchaseItem[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PurchasesOverviewPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const t = useTranslations("purchases"); // Translation keys specific to purchases
  const commonT = useTranslations("common");
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/purchases");
      if (!response.ok) {
        throw new Error(t("errorFetchPOs") || "Failed to fetch purchase orders");
      }
      const data = await response.json();
      setPurchaseOrders(data.purchases || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: commonT("error") || "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const handleDelete = async (poId: string) => {
    if (!confirm(t("confirmDeletePO") || "Are you sure you want to delete this purchase order?")) {
      return;
    }
    try {
      const response = await fetch(`/api/purchases/${poId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("errorDeletePO") || "Failed to delete purchase order");
      }
      toast({
        title: t("success") || "Success",
        description: t("poDeletedSuccess") || "Purchase order deleted successfully.",
      });
      fetchPurchaseOrders(); // Refresh list
    } catch (err: any) {
      toast({
        title: commonT("error") || "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toUpperCase()) {
      case "DRAFT":
        return "outline";
      case "CONFIRMED":
        return "secondary";
      case "RECEIVED":
        return "default"; // Or a success-like color if available
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'PP'); // e.g., Aug 17, 2023
    } catch {
      return dateString; // Fallback if date is invalid
    }
  };


  if (loading) {
    return <div className="flex-1 space-y-4 p-8 pt-6"><p>{commonT("loading") || "Loading purchase orders..."}</p></div>;
  }
  if (error) {
    return <div className="flex-1 space-y-4 p-8 pt-6"><p>{commonT("error") || "Error"}: {error}</p></div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("title") || "Purchase Orders"}</h2>
        <Link href={`/${locale}/dashboard/purchases/new`} passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("newOrder") || "New Purchase Order"}
          </Button>
        </Link>
      </div>

      {/* Placeholder for overview cards if needed, similar to app/purchases/page.tsx */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> ... </div> */}

      <Card>
        <CardHeader>
          <CardTitle>{t("poListTitle") || "Purchase Orders"}</CardTitle>
          <CardDescription>{t("poListDescription") || "View and manage all your purchase orders."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("poNumber") || "PO Number"}</TableHead>
                <TableHead>{t("supplier") || "Supplier"}</TableHead>
                <TableHead>{t("orderDate") || "Order Date"}</TableHead>
                <TableHead>{t("expectedDate") || "Expected Date"}</TableHead>
                <TableHead>{t("status") || "Status"}</TableHead>
                <TableHead className="text-right">{t("totalAmount") || "Total Amount"}</TableHead>
                <TableHead className="text-right">{commonT("actions") || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.length > 0 ? (
                purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.poNumber}</TableCell>
                    <TableCell>{po.supplier?.companyName || po.supplierName || t("notAssigned") || "N/A"}</TableCell>
                    <TableCell>{formatDate(po.orderDate)}</TableCell>
                    <TableCell>{formatDate(po.expectedDate)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(po.status)}>
                        {t(`status${po.status.toUpperCase()}`) || po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Assuming currency formatting is handled by a global utility or later */}
                      {po.totalAmount.toFixed(2)} {/* Basic formatting */}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/${locale}/dashboard/purchases/${po.id}/edit`} passHref> {/* Or a view page */}
                        <Button variant="outline" size="sm" className="mr-2">
                           <Edit className="mr-1 h-4 w-4" /> {/* Using Edit icon for View/Edit */}
                           {commonT("viewEdit") || "View/Edit"}
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(po.id)} disabled={po.status.toUpperCase() === 'RECEIVED'}>
                        <Trash2 className="mr-1 h-4 w-4" /> {commonT("delete") || "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    {t("noPOsFound") || "No purchase orders found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
