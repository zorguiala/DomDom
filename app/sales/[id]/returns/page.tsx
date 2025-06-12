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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  Truck,
  AlertCircle,
  Save,
} from "lucide-react";
import Link from "next/link";

interface SaleItem {
  id: string;
  productId: string;
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
}

interface VanSale {
  id: string;
  saleNumber: string;
  type: string;
  exitSlipNumber: string;
  exitSlipDate: string;
  items: SaleItem[];
  vanOperation: {
    id: string;
    driverName: string;
    vehicleNumber: string;
    departureTime: string;
    status: string;
  };
}

export default function VanReturnsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const saleId = params.id as string;

  const [sale, setSale] = useState<VanSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [returnedQuantities, setReturnedQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchSale();
  }, [saleId]);

  const fetchSale = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sales/${saleId}`);
      if (!response.ok) throw new Error("Failed to fetch sale");
      
      const data = await response.json();
      
      if (data.sale.type !== "DOOR_TO_DOOR") {
        toast({
          title: "Error",
          description: "This operation is only for van sales",
          variant: "destructive",
        });
        router.push("/sales");
        return;
      }

      if (data.sale.vanOperation?.status === "COMPLETED") {
        toast({
          title: "Warning",
          description: "This van sale has already been completed",
          variant: "destructive",
        });
        router.push("/sales");
        return;
      }

      setSale(data.sale);
      
      // Initialize returned quantities (default to 0)
      const initialQuantities: { [key: string]: number } = {};
      data.sale.items.forEach((item: SaleItem) => {
        initialQuantities[item.productId] = 0;
      });
      setReturnedQuantities(initialQuantities);
    } catch (error) {
      console.error("Error fetching sale:", error);
      toast({
        title: "Error",
        description: "Failed to load sale details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, value: string) => {
    const qty = parseInt(value) || 0;
    const item = sale?.items.find((i) => i.productId === productId);
    
    if (item && qty > item.qty) {
      toast({
        title: "Error",
        description: `Cannot return more than ${item.qty} units`,
        variant: "destructive",
      });
      return;
    }

    setReturnedQuantities({
      ...returnedQuantities,
      [productId]: Math.max(0, qty),
    });
  };

  const calculateSoldQuantity = (item: SaleItem) => {
    return item.qty - (returnedQuantities[item.productId] || 0);
  };

  const calculateTotals = () => {
    if (!sale) return { totalOut: 0, totalReturned: 0, totalSold: 0 };

    let totalReturned = 0;
    let totalSold = 0;

    sale.items.forEach((item) => {
      const returnedQty = returnedQuantities[item.productId] || 0;
      const soldQty = item.qty - returnedQty;
      
      totalReturned += returnedQty * item.unitPrice;
      totalSold += soldQty * item.unitPrice;
    });

    const totalOut = sale.items.reduce((sum, item) => sum + item.totalPrice, 0);

    return { totalOut, totalReturned, totalSold };
  };

  const handleSubmit = async () => {
    if (!sale) return;

    setSaving(true);
    try {
      const returnedItems = Object.entries(returnedQuantities)
        .filter(([_, qty]) => qty >= 0)
        .map(([productId, returnedQty]) => ({
          productId,
          returnedQty,
        }));

      const response = await fetch("/api/sales/van-returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          saleId: sale.id,
          returnedItems,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process returns");
      }

      toast({
        title: "Success",
        description: "Van sale returns processed successfully",
      });

      router.push("/sales");
    } catch (error) {
      console.error("Error processing returns:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process returns",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="text-center">
          <p>Sale not found</p>
          <Link href="/sales">
            <Button className="mt-4">Back to Sales</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { totalOut, totalReturned, totalSold } = calculateTotals();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/sales">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Process Van Returns</h2>
            <p className="text-muted-foreground">
              Record returned products for {sale.saleNumber}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Truck className="mr-2 h-4 w-4" />
          Van Sale Return
        </Badge>
      </div>

      {/* Sale Information */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Exit Slip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sale.exitSlipNumber}</div>
            <p className="text-xs text-muted-foreground">
              {formatDate(new Date(sale.exitSlipDate))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{sale.vanOperation.driverName}</div>
            <p className="text-sm text-muted-foreground">
              Vehicle: {sale.vanOperation.vehicleNumber}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Departure Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg">
              {formatDate(new Date(sale.vanOperation.departureTime))}
            </div>
            <p className="text-sm text-muted-foreground">
              Status: <Badge variant="secondary">In Progress</Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Return Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Return Products</CardTitle>
          <CardDescription>
            Enter the quantity of products being returned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Taken Out</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Returned</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Sale Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => {
                const soldQty = calculateSoldQuantity(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.product.sku}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={returnedQuantities[item.productId] || 0}
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                        className="w-20 text-right"
                        min="0"
                        max={item.qty}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {soldQty}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(soldQty * item.unitPrice)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Return Summary</CardTitle>
            <CardDescription>
              Overview of the van sale operation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Total Products Out</span>
                </div>
                <span className="font-medium">{formatCurrency(totalOut)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                  <span>Total Returned</span>
                </div>
                <span className="font-medium text-orange-600">
                  {formatCurrency(totalReturned)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span className="font-semibold">Total Sold</span>
                </div>
                <span className="font-bold text-green-600">
                  {formatCurrency(totalSold)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Complete the van sale return process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-amber-50 p-4 text-sm">
              <p className="font-medium text-amber-900">Important:</p>
              <ul className="mt-2 list-disc list-inside text-amber-800 space-y-1">
                <li>Verify all returned products are in good condition</li>
                <li>Count each product carefully before entering quantities</li>
                <li>This action cannot be undone once confirmed</li>
              </ul>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full"
              size="lg"
            >
              {saving ? (
                "Processing..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Complete Return Process
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}