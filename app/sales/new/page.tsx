"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Truck,
  Calculator,
  User,
  Phone,
  Mail,
  Package,
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku: string;
  priceSell: number;
  qtyOnHand: number;
  isFinishedGood?: boolean;
}

interface SaleItem {
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function NewSalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const salesType = searchParams.get("type") || "classic";
  const t = useTranslations("sales");
  const common = useTranslations("common");
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      // Only show finished goods for sales (check if property exists)
      setProducts(data.products.filter((p: any) => p.isFinishedGood !== false));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    }
  };

  const addItem = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (salesType === "classic" && quantity > product.qtyOnHand) {
      toast({
        title: "Error",
        description: `Insufficient stock. Available: ${product.qtyOnHand}`,
        variant: "destructive",
      });
      return;
    }

    const existingItemIndex = saleItems.findIndex(
      (item: SaleItem) => item.productId === selectedProductId
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].totalPrice =
        updatedItems[existingItemIndex].quantity *
        updatedItems[existingItemIndex].unitPrice;
      setSaleItems(updatedItems);
    } else {
      // Add new item
      const newItem: SaleItem = {
        productId: product.id,
        product,
        quantity,
        unitPrice: product.priceSell,
        totalPrice: quantity * product.priceSell,
      };
      setSaleItems([...saleItems, newItem]);
    }

    // Reset form
    setSelectedProductId("");
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setSaleItems(saleItems.filter((_: SaleItem, i: number) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = saleItems.reduce((sum: number, item: SaleItem) => sum + item.totalPrice, 0);
    const tva = salesType === "classic" ? subtotal * 0.19 : 0;
    const timbre = salesType === "classic" ? 1 : 0;
    const total = subtotal + tva + timbre;

    return { subtotal, tva, timbre, total };
  };

  const handleSubmit = async () => {
    // Validate form
    if (salesType === "classic" && !customerName) {
      toast({
        title: "Error",
        description: "Customer name is required for classic sales",
        variant: "destructive",
      });
      return;
    }

    if (salesType === "door-to-door" && (!driverName || !vehicleNumber)) {
      toast({
        title: "Error",
        description: "Driver name and vehicle number are required for van sales",
        variant: "destructive",
      });
      return;
    }

    if (saleItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: salesType === "door-to-door" ? "DOOR_TO_DOOR" : "CLASSIC",
          customerName: customerName || (salesType === "door-to-door" ? "Van Sale" : ""),
          customerEmail,
          customerPhone,
          driverName,
          vehicleNumber,
          notes,
          items: saleItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create sale");
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: salesType === "door-to-door" 
          ? `Van sale created with exit slip: ${data.sale.exitSlipNumber}`
          : "Sale created successfully",
      });

      router.push("/sales");
    } catch (error) {
      console.error("Error creating sale:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create sale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tva, timbre, total } = calculateTotals();

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
            <h2 className="text-3xl font-bold tracking-tight">
              {salesType === "door-to-door" ? "New Van Sale" : "New Classic Sale"}
            </h2>
            <p className="text-muted-foreground">
              {salesType === "door-to-door"
                ? "Create a new door-to-door van sale with exit slip"
                : "Create a new classic sale (Quote → Invoice → Delivery)"}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {salesType === "door-to-door" ? (
            <>
              <Truck className="mr-2 h-4 w-4" />
              Van Sale
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Classic Sale
            </>
          )}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Customer/Driver Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              {salesType === "door-to-door" ? "Driver Information" : "Customer Information"}
            </CardTitle>
            <CardDescription>
              {salesType === "door-to-door"
                ? "Enter driver and vehicle details"
                : "Enter customer contact information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {salesType === "door-to-door" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="driverName">Driver Name *</Label>
                  <Input
                    id="driverName"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Enter driver name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                  <Input
                    id="vehicleNumber"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="Enter vehicle number"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+216 12 345 678"
                      className="pl-8"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Add Items */}
        <Card>
          <CardHeader>
            <CardTitle>Add Products</CardTitle>
            <CardDescription>Select products and quantities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {product.name} ({product.sku})
                        </span>
                        <Badge variant="outline" className="ml-2">
                          Stock: {product.qtyOnHand}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
            <Button onClick={addItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sale Items</CardTitle>
          <CardDescription>
            {saleItems.length} item{saleItems.length !== 1 ? "s" : ""} added
          </CardDescription>
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
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saleItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No items added yet
                  </TableCell>
                </TableRow>
              ) : (
                saleItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.product?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.product?.sku}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary and Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              {salesType === "door-to-door"
                ? "Exit slip will be generated automatically"
                : "TVA 19% and Timbre 1 TND will be applied"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {salesType === "classic" && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>TVA (19%)</span>
                    <span>{formatCurrency(tva)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Timbre</span>
                    <span>{formatCurrency(timbre)}</span>
                  </div>
                </>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Button
                onClick={handleSubmit}
                disabled={loading || saleItems.length === 0}
                className="w-full"
              >
                {loading ? (
                  "Creating..."
                ) : salesType === "door-to-door" ? (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Create Van Sale & Exit Slip
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Create Quote
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/sales")}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
