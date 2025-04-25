import { useState } from "react";
import { productionApi } from "../productionApi";
import {
  ProductionOrder,
  CreateProductionOrderDto,
} from "../../../types/production";

interface UseCreateProductionResult {
  createProductionOrder: (
    data: CreateProductionOrderDto
  ) => Promise<ProductionOrder | null>;
  loading: boolean;
  error: Error | null;
  createdOrder: ProductionOrder | null;
}

export const useCreateProduction = (): UseCreateProductionResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdOrder, setCreatedOrder] = useState<ProductionOrder | null>(
    null
  );

  const createProductionOrder = async (
    data: CreateProductionOrderDto
  ): Promise<ProductionOrder | null> => {
    try {
      setLoading(true);
      const result = await productionApi.createOrder(data);
      setCreatedOrder(result);
      setError(null);
      return result;
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to create production order")
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProductionOrder,
    loading,
    error,
    createdOrder,
  };
};
