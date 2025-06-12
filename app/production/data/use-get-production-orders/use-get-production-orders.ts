import { useQuery } from '@tanstack/react-query';
import { ProductionOrder } from '@/types';

interface ProductionOrdersApiResponse {
  orders: ProductionOrder[];
}

interface UseGetProductionOrdersReturn {
  data: ProductionOrder[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query hook for fetching all production orders
 * @returns Production orders array with loading and error states
 */
export function useGetProductionOrders(): UseGetProductionOrdersReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['production', 'orders'],
    queryFn: async (): Promise<ProductionOrder[]> => {
      const response = await fetch('/api/production/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch production orders');
      }
      
      const apiData: ProductionOrdersApiResponse = await response.json();
      return apiData.orders;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}