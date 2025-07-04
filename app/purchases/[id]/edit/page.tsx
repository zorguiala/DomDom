"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-radix";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function EditPurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [purchase, setPurchase] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [purchaseId, setPurchaseId] = useState<string>("");

  useEffect(() => {
    params.then(resolvedParams => {
      setPurchaseId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (purchaseId) {
      fetchPurchase();
    }
  }, [purchaseId]);

  const fetchPurchase = async () => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`);
      const data = await response.json();
      if (data.purchase) {
        setPurchase(data.purchase);
        setStatus(data.purchase.status);
        setItems(data.purchase.items);
      }
    } catch (error) {
      console.error("Error fetching purchase:", error);
      toast({
        title: "Error",
        description: "Failed to fetch purchase order",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    // If changing to CONFIRMED, automatically set received quantities to ordered quantities
    if (newStatus === "CONFIRMED") {
      setItems(prevItems =>
        prevItems.map(item => ({
          ...item,
          qtyReceived: item.qtyOrdered
        }))
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update status
      if (status !== purchase.status) {
        const response = await fetch(`/api/purchases/${purchaseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update status");
        }

        const data = await response.json();
        setPurchase(data.purchase);
        toast({
          title: "Success",
          description: `Purchase order ${status === "CONFIRMED" ? "confirmed and stock updated" : "updated"} successfully`,
        });
      }

      router.refresh();
    } catch (error: any) {
      console.error("Error updating purchase:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update purchase order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQtyReceivedChange = (itemId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              qtyReceived: numValue > item.qtyOrdered ? item.qtyOrdered : numValue
            }
          : item
      )
    );
  };

  if (!purchase) {
    return <div>Loading...</div>;
  }

  const canReceive = status === "CONFIRMED";
  const isReceived = status === "RECEIVED";
  const isDraft = status === "DRAFT";

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Purchase Order</h2>
          <p className="text-muted-foreground">Update purchase order details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order #{purchase.poNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier</Label>
                  <div className="mt-1">
                    {purchase.supplier?.companyName || purchase.supplierName || "-"}
                  </div>
                </div>
                <div>
                  <Label>Order Date</Label>
                  <div className="mt-1">
                    {new Date(purchase.orderDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <div className="mt-1">
                    {formatCurrency(purchase.totalAmount)}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <select 
                    className="mt-1 bg-white px-3 py-2 border border-gray-300 rounded-md"
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="DRAFT" disabled={!isDraft}>Draft</option>
                    <option value="CONFIRMED" disabled={isReceived}>Confirmed</option>
                    <option value="RECEIVED" disabled={!canReceive && !isReceived}>Received</option>
                  </select>
                  {status === "CONFIRMED" && isDraft && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Confirming will automatically set received quantities equal to ordered quantities
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Ordered Qty</TableHead>
                      <TableHead className="text-right">Received Qty</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.product.sku}</TableCell>
                        <TableCell className="text-right">{item.qtyOrdered}</TableCell>
                        <TableCell className="text-right">
                          {item.qtyReceived || 0}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalCost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Purchase Order"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 