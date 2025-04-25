import { useState, useEffect } from "react";
import { productionApi } from "../productionApi";
import { ProductionOrder } from "../../../types/production";

interface UseGetProductionDetailResult {
  productionOrder: ProductionOrder | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useGetProductionDetail = (
  id: string
): UseGetProductionDetailResult => {
  const [productionOrder, setProductionOrder] =
    useState<ProductionOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProductionOrder = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getOrderById(id);
      setProductionOrder(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error(`Failed to fetch production order ${id}`)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductionOrder();
    }
  }, [id]);

  return {
    productionOrder,
    loading,
    error,
    refetch: fetchProductionOrder,
  };
};
