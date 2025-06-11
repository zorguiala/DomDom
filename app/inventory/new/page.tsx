"use client";

import { useState } from "react";
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
import { useTranslations } from "@/lib/language-context";
import { ArrowLeft, Save, Package } from "lucide-react";
import Link from "next/link";

interface NewProductFormData {
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

export default function NewProductPage() {
  const router = useRouter();
  const t = useTranslations("inventory");
  const common = useTranslations("common");

  const [formData, setFormData] = useState<NewProductFormData>({
    name: "",
    sku: "",
    category: "",
    unit: "pcs",
    priceSell: "",
    priceCost: "",
    qtyOnHand: "0",
    minQty: "",
    isRawMaterial: false,
    isFinishedGood: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange =
    (field: keyof NewProductFormData) =>
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

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const result = await response.json();
      router.push(`/inventory/${result.product.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error creating product:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/inventory">
          <Button className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("addProduct")}
          </h2>
          <p className="text-muted-foreground">
            Create a new product in your inventory
          </p>
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
              Enter the basic information for the new product
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
                <Label htmlFor="qtyOnHand">Initial Stock Quantity</Label>
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
              <Link href="/inventory">
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
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Product
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
