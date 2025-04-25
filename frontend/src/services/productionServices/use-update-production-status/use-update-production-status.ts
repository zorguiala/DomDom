import { useState } from "react";
import { productionApi } from "../productionApi";
import {
  ProductionOrder,
  UpdateProductionOrderStatusDto,
} from "../../../types/production";

interface UseUpdateProductionStatusResult {
  updateProductionStatus: (
    id: string,
    data: UpdateProductionOrderStatusDto
  ) => Promise<ProductionOrder | null>;
  loading: boolean;
  error: Error | null;
  updatedOrder: ProductionOrder | null;
}

export const useUpdateProductionStatus =
  (): UseUpdateProductionStatusResult => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [updatedOrder, setUpdatedOrder] = useState<ProductionOrder | null>(
      null
    );

    const updateProductionStatus = async (
      id: string,
      data: UpdateProductionOrderStatusDto
    ): Promise<ProductionOrder | null> => {
      try {
        setLoading(true);
        const result = await productionApi.updateOrderStatus(id, data);
        setUpdatedOrder(result);
        setError(null);
        return result;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error(`Failed to update status for production order ${id}`)
        );
        return null;
      } finally {
        setLoading(false);
      }
    };

    return {
      updateProductionStatus,
      loading,
      error,
      updatedOrder,
    };
  };
