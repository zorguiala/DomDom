"use client";

import { Suspense, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/lib/language-context";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";
import { useGetProducts } from "./data/use-get-products/use-get-products";
import { formatCurrency } from "@/lib/utils";

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const common = useTranslations("common");
  const { data: products = [], isLoading: loading, error, refetch: fetchProducts } = useGetProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category &&
        product.category.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <div className="flex items-center space-x-2">
          <Link href="/inventory/new">
            <ShimmerButton>
              <Plus className="mr-2 h-4 w-4" />
              {t("addProduct")}
            </ShimmerButton>
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle>{t("products")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {" "}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchProducts")}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {common("filter")}
            </Button>
            <Button
              variant="outline"
              onClick={fetchProducts}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {common("refresh")}
            </Button>
          </div>{" "}
          {/* Products Table */}
          <div className="rounded-md border">
            <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b bg-muted/50">
              <div>{t("product")}</div>
              <div>{t("sku")}</div>
              <div>{t("category")}</div>
              <div>{t("stockLevel")}</div>
              <div>{t("unitCost")}</div>
              <div>{common("actions")}</div>
            </div>

            {error && (
              <div className="p-4 text-red-600 bg-red-50 border-b">
                {common("errorPrefix")}{error instanceof Error ? error.message : 'An error occurred'}
              </div>
            )}

            {loading ? (
              <div className="p-4">{common("loading")}{t("loadingSuffixProducts")}</div>
            ) : (
              <ProductList products={filteredProducts} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Product list component
function ProductList({ products }: { products: Product[] }) {
  const t = useTranslations("inventory");
  const common = useTranslations("common");

  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("noProductsFound")}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {products.map((product) => (
        <div key={product.id} className="grid grid-cols-6 gap-4 p-4">
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-muted-foreground">
              {product.category || t("noCategory")}
            </div>
          </div>
          <div className="font-mono text-sm">{product.sku}</div>
          <div>
            {product.category && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                {product.category}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  getStockStatus(product) === "in_stock"
                    ? "bg-green-50 text-green-700"
                    : getStockStatus(product) === "low_stock"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                }`}
              >
                {product.qtyOnHand}
              </span>
              {product.minQty && (
                <span className="text-xs text-muted-foreground">
                  / {product.minQty}{t("minSuffix")}
                </span>
              )}
            </div>
          </div>
          <div className="font-medium">{formatCurrency(product.priceCost)}</div>{" "}
          <div className="flex items-center space-x-2">
            <Link href={`/inventory/${product.id}`}>
              <Button className="h-8 px-3 text-sm">{common("view")}</Button>
            </Link>
            <Link href={`/inventory/${product.id}/edit`}>
              <Button className="h-8 px-3 text-sm">{common("edit")}</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStockStatus(product: Product) {
  if (product.qtyOnHand <= 0) return "out_of_stock";
  if (product.minQty && product.qtyOnHand < product.minQty) return "low_stock";
  return "in_stock";
}
