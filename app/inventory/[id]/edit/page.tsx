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
import { useTranslations } from "@/lib/language-context";
import { ArrowLeft, Save, Package } from "lucide-react";
import Link from "next/link";

interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  unit: string;
  priceSell: string;
  priceCost: string;
  qtyOnHand: string;
  minQty: string;
  isRawMaterial: boolean;
  isFinishedGood: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("inventory");
  const common = useTranslations("common");

  const productId = params.id as string;

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    category: "",
    unit: "",
    priceSell: "",
    priceCost: "",
    qtyOnHand: "",
    minQty: "",
    isRawMaterial: false,
    isFinishedGood: false,
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetchLoading(true);
        const response = await fetch(`/api/inventory/${productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        const product = data.product;

        setFormData({
          name: product.name,
          sku: product.sku,
          category: product.category || "",
          unit: product.unit,
          priceSell: product.priceSell.toString(),
          priceCost: product.priceCost.toString(),
          qtyOnHand: product.qtyOnHand.toString(),
          minQty: product.minQty?.toString() || "",
          isRawMaterial: product.isRawMaterial,
          isFinishedGood: product.isFinishedGood,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching product:", err);
      } finally {
        setFetchLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleInputChange =
    (field: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.sku ||
      !formData.priceSell ||
      !formData.priceCost
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/inventory/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      router.push(`/inventory/${productId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error updating product:", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/inventory/${productId}`}>
          <Button className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Product Information
            </CardTitle>
            <CardDescription>
              Update the product information below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  placeholder={t("placeholderProductName")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={handleInputChange("sku")}
                  placeholder={t("placeholderSku")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange("category")}
                  placeholder={t("placeholderCategory")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={handleInputChange("unit")}
                  placeholder={t("placeholderUnitExamples")}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceSell">Selling Price *</Label>
                <Input
                  id="priceSell"
                  type="number"
                  step="0.01"
                  value={formData.priceSell}
                  onChange={handleInputChange("priceSell")}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceCost">Cost Price *</Label>
                <Input
                  id="priceCost"
                  type="number"
                  step="0.01"
                  value={formData.priceCost}
                  onChange={handleInputChange("priceCost")}
                  placeholder={common("placeholderZeroAmount")}
                  required
                />
              </div>
            </div>

            {/* Stock Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qtyOnHand">Current Stock Quantity</Label>
                <Input
                  id="qtyOnHand"
                  type="number"
                  step="0.01"
                  value={formData.qtyOnHand}
                  onChange={handleInputChange("qtyOnHand")}
                  placeholder={common("placeholderZero")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minQty">Minimum Stock Level</Label>
                <Input
                  id="minQty"
                  type="number"
                  step="0.01"
                  value={formData.minQty}
                  onChange={handleInputChange("minQty")}
                  placeholder={common("optional")}
                />
              </div>
            </div>

            {/* Product Type */}
            <div className="space-y-4">
              <Label>Product Type</Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRawMaterial"
                    checked={formData.isRawMaterial}
                    onChange={handleInputChange("isRawMaterial")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isRawMaterial">Raw Material</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFinishedGood"
                    checked={formData.isFinishedGood}
                    onChange={handleInputChange("isFinishedGood")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isFinishedGood">Finished Good</Label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link href={`/inventory/${productId}`}>
                <Button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  "Updating..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Product
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
