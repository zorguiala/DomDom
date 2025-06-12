import { useMemo } from "react";
import { SaleItem, SaleTotals, VanReturnSummary } from "@/types/sales";

export function useSaleCalculations(
  items: SaleItem[],
  saleType: "DOOR_TO_DOOR" | "CLASSIC"
): SaleTotals {
  return useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tva = saleType === "CLASSIC" ? subtotal * 0.19 : 0;
    const timbre = saleType === "CLASSIC" ? 1 : 0;
    const total = subtotal + tva + timbre;

    return { subtotal, tva, timbre, total };
  }, [items, saleType]);
}

export function useVanReturnCalculations(
  items: SaleItem[],
  returnedQuantities: { [productId: string]: number }
): VanReturnSummary {
  return useMemo(() => {
    let totalReturned = 0;
    let totalSold = 0;

    items.forEach((item) => {
      const returnedQty = returnedQuantities[item.productId] || 0;
      const soldQty = item.qty - returnedQty;
      
      totalReturned += returnedQty * item.unitPrice;
      totalSold += soldQty * item.unitPrice;
    });

    const totalOut = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return { totalOut, totalReturned, totalSold };
  }, [items, returnedQuantities]);
}