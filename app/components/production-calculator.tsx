"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Factory, DollarSign, Package } from "lucide-react";
import { formatTND } from "@/lib/currency";
import { Product } from "@/types";
import { useTranslations } from "@/lib/language-context";

interface BomComponent {
  productId: string;
  quantity: number;
  unit: string;
}

interface ProductionCalculatorProps {
  components: BomComponent[];
  outputQuantity: number;
  products: Product[];
  className?: string;
}

export function ProductionCalculator({ 
  components, 
  outputQuantity, 
  products, 
  className = "" 
}: ProductionCalculatorProps) {
  const t = useTranslations("production");
  // Calculate total component cost
  const totalComponentCost = components.reduce((total, component) => {
    if (component.productId && component.quantity > 0) {
      const product = products.find(p => p.id === component.productId);
      if (product && product.priceCost) {
        return total + (product.priceCost * component.quantity);
      }
    }
    return total;
  }, 0);

  // Calculate unit cost (total cost / output quantity)
  const unitCost = outputQuantity > 0 ? totalComponentCost / outputQuantity : 0;

  // Calculate how many BOMs can be produced with current stock
  let canProduce = Infinity;
  components.forEach(component => {
    if (component.productId && component.quantity > 0) {
      const product = products.find(p => p.id === component.productId);
      if (product) {
        const maxFromThisComponent = product.qtyOnHand / component.quantity;
        canProduce = Math.min(canProduce, maxFromThisComponent);
      }
    }
  });

  if (canProduce === Infinity || canProduce < 0) {
    canProduce = 0;
  }

  const totalUnitsCanProduce = Math.floor(canProduce) * outputQuantity;

  if (totalComponentCost === 0) return null;

  return (
    <Card className={`bg-blue-50 border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {t("costAnalysis")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <p className="text-muted-foreground font-medium">{t("totalCost")}</p>
            </div>
            <p className="text-xl font-bold text-blue-600">
              {formatTND(totalComponentCost)}
            </p>
            <p className="text-xs text-muted-foreground">
              For {outputQuantity} units
            </p>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-green-600" />
              <p className="text-muted-foreground font-medium">{t("unitCost")} (per item)</p>
            </div>
            <p className="text-xl font-bold text-green-600">
              {formatTND(unitCost)}
            </p>
            <p className="text-xs text-muted-foreground">
              Total ÷ {outputQuantity} units
            </p>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Factory className="h-4 w-4 text-orange-600" />
              <p className="text-muted-foreground font-medium">{t("canProduce")}</p>
            </div>
            <p className="text-xl font-bold text-orange-600">
              {Math.floor(canProduce)}
            </p>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-4 w-4 text-purple-600" />
              <p className="text-muted-foreground font-medium">Total {t("piece")}</p>
            </div>
            <p className="text-xl font-bold text-purple-600">
              {totalUnitsCanProduce}
            </p>
          </div>
        </div>

        {/* Low stock warnings */}
        {components.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Stock Status:</h4>
            <div className="space-y-1">
              {components.map((component, index) => {
                const product = products.find(p => p.id === component.productId);
                if (!product || !component.productId) return null;

                const stockRatio = product.qtyOnHand / component.quantity;
                const isLowStock = stockRatio < 5; // Less than 5 BOMs worth of stock

                return (
                  <div key={index} className={`text-xs p-2 rounded ${
                    isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    <span className="font-medium">{product.name}</span>: 
                    Stock {product.qtyOnHand} {product.unit}, 
                    Need {component.quantity} {component.unit} per BOM 
                    ({Math.floor(stockRatio)} BOMs possible)
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 