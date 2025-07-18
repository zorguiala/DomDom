"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/language-context";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Hash,
  Tag,
} from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";
import { useGetProduct } from "../data/use-get-product/use-get-product";
import { useDeleteProduct } from "../data/use-delete-product/use-delete-product";
import { formatCurrency } from "@/lib/utils";

export default function ProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("inventory");
  const common = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const { mutate: deleteProduct, mutateAsync: deleteProductAsync, isLoading: isDeleting } = useDeleteProduct();

  const productId = params.id as string;
  const { data: product, isLoading: loading, error: fetchError } = useGetProduct({ productId });

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      await deleteProductAsync(productId);
      router.push("/inventory");
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    }
  };

  function getStockStatus(product: Product) {
    if (product.qtyOnHand <= 0) return "out_of_stock";
    if (product.minQty && product.qtyOnHand < product.minQty) return "low_stock";
    return "in_stock";
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">{common("error")}</h2>
          <p className="text-gray-600 mt-2">
            {error || (fetchError instanceof Error ? fetchError.message : "Product not found")}
          </p>
          <Link href="/inventory">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/inventory">
            <Button className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h2>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/inventory/${product.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              {common("edit")}
            </Button>
          </Link>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("addProductTitle")}</CardTitle>
            <CardDescription>{t("addProductDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  {t("productName")}
                </label>
                <p className="text-lg">{product.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center">
                  <Hash className="mr-2 h-4 w-4" />
                  {t("sku")}
                </label>
                <p className="text-lg font-mono">{product.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium">{t("category")}</label>
                <p className="text-lg">{product.category || t("noCategory")}</p>
              </div>
              <div>
                <label className="text-sm font-medium">{t("unit")}</label>
                <p className="text-lg">{product.unit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              {t("stockLevel")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("qtyOnHand")}</label>
              <p
                className={`text-2xl font-bold ${
                  getStockStatus(product) === "in_stock"
                    ? "text-green-600"
                    : getStockStatus(product) === "low_stock"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {product.qtyOnHand}
              </p>
            </div>
            {product.minQty && (
              <div>
                <label className="text-sm font-medium">{t("minQty")}</label>
                <p className="text-lg">{product.minQty}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">{common("status")}</label>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getStockStatus(product) === "in_stock"
                    ? "bg-green-100 text-green-800"
                    : getStockStatus(product) === "low_stock"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {getStockStatus(product).replace("_", " ").toUpperCase()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("pricingInfo")}</CardTitle>
            <CardDescription>{t("pricingInfoDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("priceSell")}</label>
                <p className="text-lg">{formatCurrency(product.priceSell)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">{t("priceCost")}</label>
                <p className="text-lg">{formatCurrency(product.priceCost)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">{t("margin")}</label>
                <p className="text-lg">{formatCurrency(product.priceSell - product.priceCost)} ({((product.priceSell - product.priceCost) / product.priceSell * 100).toFixed(1)}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm mb-2">{t("recentActivityDesc")}</div>
            <div className="text-muted-foreground text-xs">{t("noRecentStockMovements")}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
