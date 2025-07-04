"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/language-context";
import { SaleType } from "@/types/sales";
import { formatCurrency } from "@/lib/currency";
import { ShoppingCart, Check } from "lucide-react";

interface SaleTotals {
  subtotal: number;
  total: number;
  itemCount: number;
}

interface SaleSummaryProps {
  totals: SaleTotals;
  saleType: SaleType;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export function SaleSummary({ 
  totals, 
  saleType, 
  onSubmit, 
  isSubmitting, 
  isValid 
}: SaleSummaryProps) {
  const t = useTranslations("sales");
  const common = useTranslations("common");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {t("saleSummary") || "Sale Summary"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("itemCount") || "Items"}:</span>
            <span>{totals.itemCount}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>{t("subtotal") || "Subtotal"}:</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between font-medium">
              <span>{t("total") || "Total"}:</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">
              {saleType === "DOOR_TO_DOOR" ? t("vanSale") : t("classicSale")}
            </span>
          </div>
        </div>

        <Button 
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
              {common("processing") || "Processing..."}
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t("completeSale") || "Complete Sale"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 