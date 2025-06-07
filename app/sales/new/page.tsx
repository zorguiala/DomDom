"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "@/lib/language-context";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Plus,
  Minus,
  Search,
  ShoppingCart,
  User,
  Package,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type { SaleItem, Product } from "@/types";

export default function NewSalePage() {
  const router = useRouter();
  const t = useTranslations("sales");
  const common = useTranslations("common");

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Products and sale items
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch("/api/inventory");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      (product.category?.toLowerCase() || "").includes(productSearch.toLowerCase()),
  );

  const addProductToSale = (product: Product) => {
    const existingItem = saleItems.find(
      (item) => item.productId === product.id,
    );

    if (existingItem) {
      // Increase quantity if product already exists
      setSaleItems((items) =>
        items.map((item) =>
          item.productId === product.id
            ? { ...item, qty: Math.min(item.qty + 1, product.qtyOnHand), totalPrice: (Math.min(item.qty + 1, product.qtyOnHand)) * item.unitPrice }
            : item,
        ),
      );
    } else {
      // Add new product to sale
      setSaleItems((items) => [
        ...items,
        {
          id: `${product.id}-${Date.now()}`,
          saleId: "",
          productId: product.id,
          product,
          qty: 1,
          unitPrice: product.priceSell,
          totalPrice: product.priceSell,
          deliveredQty: 0,
        },
      ]);
    }

    setShowProductSearch(false);
    setProductSearch("");
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromSale(productId);
      return;
    }

    setSaleItems((items) =>
      items.map((item) =>
        item.productId === productId
          ? { ...item, qty: Math.min(quantity, item.product.qtyOnHand), totalPrice: Math.min(quantity, item.product.qtyOnHand) * item.unitPrice }
          : item,
      ),
    );
  };

  const updateItemPrice = (productId: string, price: number) => {
    setSaleItems((items) =>
      items.map((item) =>
        item.productId === productId
          ? { ...item, unitPrice: Math.max(0, price), totalPrice: item.qty * Math.max(0, price) }
          : item,
      ),
    );
  };

  const removeItemFromSale = (productId: string) => {
    setSaleItems((items) =>
      items.filter((item) => item.productId !== productId),
    );
  };

  const calculateTotal = () => {
    return saleItems.reduce(
      (total, item) => total + item.qty * item.unitPrice,
      0,
    );
  };

  const calculateTotalItems = () => {
    return saleItems.reduce((total, item) => total + item.qty, 0);
  };

  const handleSave = async () => {
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }

    if (saleItems.length === 0) {
      setError("At least one product must be added to the sale");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || null,
          customerPhone: customerPhone.trim() || null,
          status: "PENDING",
          totalAmount: calculateTotal(),
          totalItems: calculateTotalItems(),
          saleItems: saleItems.map((item) => ({
            productId: item.productId,
            quantity: item.qty,
            price: item.unitPrice,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create sale");
      }

      const data = await response.json();

      // Redirect to the new sale detail page
      router.push(`/sales/${data.sale.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

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
              Create New Sale
            </h2>
            <p className="text-muted-foreground">
              Add products and customer information to create a new sale
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSave}
            disabled={saving || saleItems.length === 0}
          >
            {saving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? "Creating Sale..." : "Create Sale"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Enter customer details for this sale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter customer email"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter customer phone"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sale Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Sale Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Items</span>
              <span className="font-medium">{calculateTotalItems()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Products</span>
              <span className="font-medium">{saleItems.length}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-lg font-medium">Total Amount</span>
              <span className="font-bold text-xl">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Add Products
              </CardTitle>
              <CardDescription>
                Search and add products to this sale
              </CardDescription>
            </div>
            <Button onClick={() => setShowProductSearch(!showProductSearch)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showProductSearch && (
            <div className="mb-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, SKU, or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              {productSearch && (
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  {productsLoading ? (
                    <div className="p-4 text-center">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => addProductToSale(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {product.sku} | Category: {product.category ?? "-"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(product.priceSell)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Stock: {product.qtyOnHand}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {!productsLoading && filteredProducts.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sale Items */}
      <Card>
        <CardHeader>
          <CardTitle>Sale Items ({saleItems.length})</CardTitle>
          <CardDescription>Products added to this sale</CardDescription>
        </CardHeader>
        <CardContent>
          {saleItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products added yet. Use the "Add Product" button above to add
              products to this sale.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Stock: {item.product.qtyOnHand}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>{item.product.sku}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            updateItemQuantity(
                              item.productId,
                              item.qty - 1,
                            )
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateItemQuantity(
                              item.productId,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-16 text-center"
                          min="1"
                          max={item.product.qtyOnHand}
                        />
                        <Button
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            updateItemQuantity(
                              item.productId,
                              item.qty + 1,
                            )
                          }
                          disabled={item.qty >= item.product.qtyOnHand}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItemPrice(
                            item.productId,
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-24 text-right"
                        step="0.01"
                        min="0"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.qty * item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        className="h-8 w-8 p-0"
                        onClick={() => removeItemFromSale(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {saleItems.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="text-sm">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
