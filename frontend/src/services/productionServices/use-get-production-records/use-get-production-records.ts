import { useState, useEffect } from "react";
import { productionApi } from "../productionApi";
import { ProductionRecord } from "../../../types/production";

interface UseGetProductionRecordsResult {
  records: ProductionRecord[];
  loading: boolean;
  error: Error | null;
  fetchRecords: (orderId: string) => Promise<ProductionRecord[]>;
  refetch: () => Promise<void>;
}

export const useGetProductionRecords = (
  orderId?: string
): UseGetProductionRecordsResult => {
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | undefined>(
    orderId
  );

  const fetchRecords = async (id: string): Promise<ProductionRecord[]> => {
    try {
      setLoading(true);
      setCurrentOrderId(id);
      const result = await productionApi.getProductionRecords(id);
      setRecords(result);
      setError(null);
      return result;
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch production records")
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  const refetch = async (): Promise<void> => {
    if (currentOrderId) {
      await fetchRecords(currentOrderId);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchRecords(orderId);
    }
  }, [orderId]);

  return {
    records,
    loading,
    error,
    fetchRecords,
    refetch,
  };
};
