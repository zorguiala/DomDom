"use client";

import { useTranslations } from "@/lib/language-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectMagic } from "@/components/ui/select-magic";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Factory, Package, Calendar } from "lucide-react";
import Link from "next/link";
import { formatTND } from "@/lib/currency";

interface BillOfMaterial {
  id: string;
  name: string;
  description?: string;
  finalProduct: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  };
  outputQuantity: number;
  outputUnit: string;
  unitCost?: number;
  components: Array<{
    id: string;
    quantity: number;
    unit: string;
    product: {
      id: string;
      name: string;
      sku: string;
      unit: string;
      qtyOnHand: number;
    };
  }>;
}

interface FormData {
  bomId: string;
  qtyOrdered: number;
  priority: string;
  startDate: string;
  expectedEndDate: string;
  notes: string;
}

export default function ProductionOrderCreatePage() {
  const t = useTranslations("production");
  const common = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();

  const [boms, setBOMs] = useState<BillOfMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    bomId: "",
    qtyOrdered: 1,
    priority: "MEDIUM",
    startDate: "",
    expectedEndDate: "",
    notes: "",
  });

  useEffect(() => {
    fetchBOMs();
  }, []);

  const fetchBOMs = async () => {
    try {
      const res = await fetch("/api/production/bom");
      if (!res.ok) throw new Error("Failed to fetch BOMs");
      const data = await res.json();
      setBOMs(data.boms || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: common("error"),
        description: t("errorFetchingBOMs") || "Failed to fetch BOMs",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedBOM = boms.find(bom => bom.id === formData.bomId);

  // Calculate total units that will be produced (this is just qtyOrdered)
  const totalUnitsToProduced = formData.qtyOrdered;

  // Calculate scaling factor for material requirements
  const scalingFactor = selectedBOM 
    ? formData.qtyOrdered / selectedBOM.outputQuantity 
    : 0;

  // Calculate total cost (quantity × unit cost)
  const totalCost = selectedBOM && selectedBOM.unitCost
    ? formData.qtyOrdered * selectedBOM.unitCost
    : 0;

  // Check if we have enough stock for all components (with proper scaling)
  const canProduce = selectedBOM ? 
    selectedBOM.components.every(component => {
      const requiredQty = component.quantity * scalingFactor;
      return component.product.qtyOnHand >= requiredQty;
    }) : false;

  const stockWarnings = selectedBOM 
    ? selectedBOM.components.filter(component => {
        const requiredQty = component.quantity * scalingFactor;
        return component.product.qtyOnHand < requiredQty;
      })
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bomId) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("selectBOMRequired") || "Please select a BOM",
      });
      return;
    }

    if (!canProduce) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("insufficientStock") || "Insufficient stock for production",
      });
      return;
    }

    setCreating(true);
    try {
      const payload = {
        bomId: formData.bomId,
        qtyOrdered: formData.qtyOrdered,
        priority: formData.priority,
        startDate: formData.startDate || null,
        expectedEndDate: formData.expectedEndDate || null,
        notes: formData.notes,
      };

      const res = await fetch("/api/production/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create production order");
      }

      toast({
        title: common("success"),
        description: t("orderCreatedSuccessfully") || "Production order created successfully",
      });
      
      router.push("/production/orders");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: common("error"),
        description: error.message,
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">{common("loading")}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("createProductionOrder")}</h1>
        <Link href="/production/orders">
          <Button variant="outline">{common("backToList")}</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              {t("productionOrderDetails")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("selectBOMToCreateOrder")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* BOM Selection */}
            <div className="space-y-2">
              <Label htmlFor="bomId">{t("selectBOM")} *</Label>
              <SelectMagic
                value={formData.bomId}
                onChange={(e) => setFormData(prev => ({ ...prev, bomId: e.target.value }))}
              >
                <option value="">{t("selectBOM")}</option>
                {boms.map(bom => (
                  <option key={bom.id} value={bom.id}>
                    {bom.name} → {bom.finalProduct.name} ({bom.outputQuantity} {bom.outputUnit})
                  </option>
                ))}
              </SelectMagic>
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qtyOrdered">{t("quantityToOrder")} *</Label>
                <Input
                  id="qtyOrdered"
                  type="number"
                  value={formData.qtyOrdered}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    qtyOrdered: parseInt(e.target.value) || 1 
                  }))}
                  min="1"
                  placeholder="1"
                />
                {selectedBOM && (
                  <p className="text-xs text-muted-foreground">
                    {t("willProduce")}: {totalUnitsToProduced} {selectedBOM.finalProduct.unit} of {selectedBOM.finalProduct.name}
                    <br />
                    <span className="text-blue-600">
                      Scaling factor: {scalingFactor.toFixed(3)}x (BOM recipe: {selectedBOM.outputQuantity} {selectedBOM.outputUnit})
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">{t("priority")}</Label>
                <SelectMagic
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="LOW">{t("low")}</option>
                  <option value="MEDIUM">{t("medium")}</option>
                  <option value="HIGH">{t("high")}</option>
                </SelectMagic>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t("startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedEndDate">{t("expectedEndDate")}</Label>
                <Input
                  id="expectedEndDate"
                  type="date"
                  value={formData.expectedEndDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedEndDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{common("notes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t("enterNotes")}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* BOM Details & Stock Check */}
        {selectedBOM && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("bomDetails")} & {t("stockCheck")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("totalCost")}</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatTND(totalCost)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("outputQuantity")}</p>
                  <p className="text-lg font-bold text-green-600">
                    {totalUnitsToProduced} {selectedBOM.finalProduct.unit}
                  </p>
                </div>

                <div className={`text-center p-3 rounded-lg ${canProduce ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm text-muted-foreground">{t("stockStatus")}</p>
                  <p className={`text-lg font-bold ${canProduce ? 'text-green-600' : 'text-red-600'}`}>
                    {canProduce ? t("available") : t("insufficient")}
                  </p>
                </div>
              </div>

              {/* Component Requirements */}
              <div className="space-y-2">
                <h4 className="font-medium">{t("materialRequirements")}:</h4>
                {selectedBOM.components.map((component, index) => {
                  const needed = component.quantity * scalingFactor;
                  const available = component.product.qtyOnHand;
                  const hasEnough = available >= needed;

                  return (
                    <div key={index} className={`p-2 rounded text-sm ${
                      hasEnough ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <span className="font-medium">{component.product.name}</span>: 
                      Need {needed.toFixed(3)} {component.unit}, 
                      Available {available} {component.unit}
                      {!hasEnough && ` (Short by ${(needed - available).toFixed(3)} ${component.unit})`}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={creating || !canProduce || !formData.bomId}
            className="flex items-center gap-2"
          >
            <Factory className="h-4 w-4" />
            {creating ? t("creating") : t("createProductionOrder")}
          </Button>
          
          <Link href="/production/orders">
            <Button type="button" variant="outline">
              {common("cancel")}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
