"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectMagic } from "@/components/ui/select-magic";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/language-context";
import { Plus, Trash2, Package, Factory } from "lucide-react";
import { useGetProducts } from "@/app/inventory/data/use-get-products/use-get-products";
import { useCreateBom } from "@/app/production/data/use-create-bom/use-create-bom";
import { ProductionCalculator } from "@/app/components/production-calculator";

interface BomComponent {
  productId: string;
  quantity: number;
  unit: string;
}

interface BomFormData {
  name: string;
  description: string;
  finalProductId: string;
  outputQuantity: number;
  outputUnit: string;
  components: BomComponent[];
}

export default function NewBomPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("production");
  const common = useTranslations("common");
  
  const { data: products = [], isLoading: productsLoading, error: productsError } = useGetProducts();
  const { mutate: createBom, isLoading: creating } = useCreateBom();



  const [formData, setFormData] = useState<BomFormData>({
    name: "",
    description: "",
    finalProductId: "",
    outputQuantity: 1,
    outputUnit: "piece",
    components: [{ productId: "", quantity: 1, unit: "piece" }],
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.finalProductId || !formData.outputQuantity || formData.components.length === 0) {
      toast({
        title: t("error"),
        description: t("fillRequiredFields"),
        variant: "destructive",
      });
      return;
    }

    // Validate all components have products and quantities
    const invalidComponents = formData.components.some(
      comp => !comp.productId || comp.quantity <= 0
    );

    if (invalidComponents) {
      toast({
        title: t("error"),
        description: t("invalidComponents"),
        variant: "destructive",
      });
      return;
    }

    try {
      await createBom(formData);
      toast({
        title: common("success"),
        description: t("bomCreatedSuccessfully"),
      });
      router.push("/production/bom");
    } catch (error) {
      toast({
        title: t("error"),
        description: t("bomCreationFailed"),
        variant: "destructive",
      });
    }
  };

  const addComponent = () => {
    setFormData(prev => ({
      ...prev,
      components: [...prev.components, { productId: "", quantity: 1, unit: "piece" }],
    }));
  };

  const removeComponent = (index: number) => {
    if (formData.components.length > 1) {
      setFormData(prev => ({
        ...prev,
        components: prev.components.filter((_, i) => i !== index),
      }));
    }
  };

  const updateComponent = (index: number, field: keyof BomComponent, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.map((component, i) => {
        if (i === index) {
          const updatedComponent = { ...component, [field]: value };
          
          // If product is selected, automatically set the unit from product data
          if (field === "productId" && value) {
            const selectedProduct = products.find(p => p.id === value);
            if (selectedProduct) {
              updatedComponent.unit = selectedProduct.unit;
            }
          }
          
          return updatedComponent;
        }
        return component;
      }),
    }));
  };

  // Helper function to get the unit for a component based on its product
  const getComponentUnit = (component: BomComponent) => {
    if (component.productId) {
      const product = products.find(p => p.id === component.productId);
      return product?.unit || component.unit;
    }
    return component.unit;
  };

  const getProductOptions = () => {
    return products.map(product => ({
      value: product.id,
      label: `${product.name} (${product.sku}) - Stock: ${product.qtyOnHand}`,
    }));
  };

  const getFinishedGoodOptions = () => {
    return products
      .filter(p => p.isFinishedGood || !p.isRawMaterial)
      .map(product => ({
        value: product.id,
        label: `${product.name} (${product.sku})`,
      }));
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("createNewBom")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("bomTitle")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("bomName")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t("enterBomName")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalProduct">{t("finalProduct")} *</Label>
                <SelectMagic 
                  value={formData.finalProductId} 
                  onChange={(e) => setFormData(prev => ({ ...prev, finalProductId: e.target.value }))}
                >
                  <option value="">{t("selectFinalProduct")}</option>
                  {getFinishedGoodOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectMagic>
              </div>
            </div>

            {/* Output Configuration - Like Odoo */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  {t("productionOutput")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="outputQuantity">{t("outputQuantity")} *</Label>
                    <Input
                      id="outputQuantity"
                      type="number"
                      value={formData.outputQuantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, outputQuantity: parseFloat(e.target.value) || 1 }))}
                      placeholder="110"
                      min="0.01"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("outputQuantity")} (ex: 110 {t("piece")})
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outputUnit">{t("outputUnit")} *</Label>
                    <SelectMagic 
                      value={formData.outputUnit} 
                      onChange={(e) => setFormData(prev => ({ ...prev, outputUnit: e.target.value }))}
                    >
                      <option value="piece">{t("piece")}</option>
                      <option value="kg">{t("kg")}</option>
                      <option value="liter">{t("liter")}</option>
                      <option value="meter">{t("meter")}</option>
                      <option value="box">Boxes</option>
                    </SelectMagic>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="description">{common("description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t("enterBomName")}
                rows={3}
              />
            </div>

            {/* Components Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg">{t("rawMaterials")} *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addComponent}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addComponent")}
                </Button>
              </div>

              {formData.components.map((component, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>{common("product")}</Label>
                      <SelectMagic 
                        value={component.productId} 
                        onChange={(e) => updateComponent(index, "productId", e.target.value)}
                      >
                        <option value="">{t("selectProduct")}</option>
                        {getProductOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </SelectMagic>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {common("quantity")} 
                        {component.productId && (
                          <span className="text-sm text-muted-foreground ml-1">
                            ({getComponentUnit(component)})
                          </span>
                        )}
                      </Label>
                      <Input
                        type="number"
                        value={component.quantity}
                        onChange={(e) => updateComponent(index, "quantity", parseFloat(e.target.value) || 0)}
                        placeholder={`20 ${getComponentUnit(component)}`}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeComponent(index)}
                        disabled={formData.components.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Cost Calculations - Like Odoo */}
            <ProductionCalculator
              components={formData.components}
              outputQuantity={formData.outputQuantity}
              products={products}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={creating || productsLoading}>
                {creating ? t("creating") : t("createBOM")}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/production/bom")}
              >
                {common("cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 