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

export default function ProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("inventory");
  const common = useTranslations("common");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/inventory/${productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data.product);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      router.push("/inventory");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
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
          <p className="text-gray-600 mt-2">{error || "Product not found"}</p>
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
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Basic details about this product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Product Name
                </label>
                <p className="text-lg">{product.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center">
                  <Hash className="mr-2 h-4 w-4" />
                  SKU
                </label>
                <p className="text-lg font-mono">{product.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium">{t("category")}</label>
                <p className="text-lg">{product.category || "No category"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">{common("unit")}</label>
                <p className="text-lg">{product.unit}</p>
              </div>
              <div>
                <label className="text-sm font-medium">{common("type")}</label>
                <div className="flex gap-2">
                  {product.isRawMaterial && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Raw Material
                    </span>
                  )}
                  {product.isFinishedGood && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      Finished Good
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Stock Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Stock</label>
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
                <label className="text-sm font-medium">Minimum Stock</label>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Selling Price</label>
              <p className="text-2xl font-bold text-green-600">
                ${product.priceSell.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Cost Price</label>
              <p className="text-lg">${product.priceCost.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium">{common("margin")}</label>
              <p className="text-lg font-semibold">
                ${(product.priceSell - product.priceCost).toFixed(2)}
                <span className="text-sm text-muted-foreground ml-2">
                  (
                  {(
                    ((product.priceSell - product.priceCost) /
                      product.priceSell) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest transactions and stock movements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                No recent stock movements
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
