import { useState, useEffect } from "react";
import { productionApi } from "../productionApi";
import { ProductionOrder } from "../../../types/production";

interface UseGetProductionResult {
  productionOrders: ProductionOrder[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useGetProduction = (): UseGetProductionResult => {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProductionOrders = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getAllOrders();
      setProductionOrders(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch production orders")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionOrders();
  }, []);

  return {
    productionOrders,
    loading,
    error,
    refetch: fetchProductionOrders,
  };
};
