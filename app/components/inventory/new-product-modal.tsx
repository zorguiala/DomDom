"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useToast } from "@/hooks/use-toast";
import { useCreateProduct } from "@/app/inventory/data/use-create-product/use-create-product";
import { useTranslations } from "@/lib/language-context";
import { Product } from "@/types";

interface NewProductModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (product: Product) => void;
  name?: string;
  context?: "purchase" | "bom" | "inventory";
}

export function NewProductModal({ open, onClose, onCreated, name, context = "inventory" }: NewProductModalProps) {
  const t = useTranslations("inventory");
  
  // Determine product type based on context
  const getProductType = () => {
    switch (context) {
      case "purchase":
        return { isRawMaterial: true, isFinishedGood: false };
      case "bom":
        return { isRawMaterial: false, isFinishedGood: true };
      default:
        return { isRawMaterial: false, isFinishedGood: false };
    }
  };

  const [form, setForm] = useState({
    name: name || "",
    unit: "",
    ...getProductType(),
  });
  
  const { mutateAsync, isLoading } = useCreateProduct();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = await mutateAsync({ 
        ...form,
        // These will be set later in product management
        priceSell: 0,
        priceCost: 0,
        qtyOnHand: 0,
        minQty: 0
      });

      if (!product?.id) {
        throw new Error("Invalid product data received from server");
      }

      toast({ title: "Product created!" });
      onCreated(product);
      onClose();
    } catch (err: any) {
      console.error("Error creating product:", err);
      toast({ 
        title: "Error creating product", 
        description: err.message || "An unexpected error occurred", 
        variant: "destructive" 
      });
    }
  };

  const getContextDescription = () => {
    switch (context) {
      case "purchase":
        return `This product will be created as a ${t("rawMaterial")} for purchasing.`;
      case "bom":
        return `This product will be created as a ${t("finishedGood")} for manufacturing.`;
      default:
        return "Enter basic product information. Additional details can be set later in product management.";
    }
  };

  const getProductTypeText = () => {
    if (form.isRawMaterial) return t("rawMaterial");
    if (form.isFinishedGood) return t("finishedGood");
    return "Standard Product";
  };

  const getProductTypeDescription = () => {
    if (context === "purchase") return `${t("rawMaterial")}s are products you purchase from suppliers`;
    if (context === "bom") return `${t("finishedGood")}s are products you manufacture using raw materials`;
    return "";
  };

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>New Product</CardTitle>
          <CardDescription>{getContextDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label>Unit</Label>
              <Input name="unit" value={form.unit} onChange={handleChange} required placeholder="e.g., kg, pcs, box" />
            </div>
            
            {/* Show product type info instead of checkboxes */}
            {context !== "inventory" && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">
                  Product Type: {getProductTypeText()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getProductTypeDescription()}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <ShimmerButton type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Create Product"}
              </ShimmerButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 