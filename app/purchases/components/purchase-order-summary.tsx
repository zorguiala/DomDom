"use client";

import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useTranslations } from "@/lib/language-context";

interface PurchaseOrderSummaryProps {
  total: number;
  submitting: boolean;
  onCancel: () => void;
  disabled: boolean;
}

export function PurchaseOrderSummary({
  total,
  submitting,
  onCancel,
  disabled,
}: PurchaseOrderSummaryProps) {
  const t = useTranslations("purchases");
  const common = useTranslations("common");
  
  return (
    <div className="flex justify-between items-center pt-4 border-t">
      <div className="text-lg font-medium">
        {t("total")}: {total.toFixed(2)} TND
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {common("cancel")}
        </Button>
        <ShimmerButton type="submit" disabled={disabled || submitting}>
          {submitting ? t("creating") : t("createOrder")}
        </ShimmerButton>
      </div>
    </div>
  );
} 