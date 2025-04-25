import { useState } from "react";
import { productionApi } from "../productionApi";
import {
  ProductionOrder,
  RecordProductionDto,
} from "../../../types/production";

interface UseRecordProductionReturn {
  recordProduction: (
    orderId: string,
    data: RecordProductionDto
  ) => Promise<void>;
  loading: boolean;
  error: Error | null;
  productionOrder: ProductionOrder | null;
}

export const useRecordProduction = (): UseRecordProductionReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [productionOrder, setProductionOrder] =
    useState<ProductionOrder | null>(null);

  const recordProduction = async (
    orderId: string,
    data: RecordProductionDto
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await productionApi.recordProduction(orderId, data);
      setProductionOrder(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to record production")
      );
      console.error("Error recording production:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    recordProduction,
    loading,
    error,
    productionOrder,
  };
};
