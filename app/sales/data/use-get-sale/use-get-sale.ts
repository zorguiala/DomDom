import { useQuery } from '@tanstack/react-query';
import { Sale } from '@/types';

interface UseGetSaleParams {
  saleId: string;
  enabled?: boolean;
}

interface UseGetSaleReturn {
  data: Sale | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query hook for fetching a single sale by ID
 * @param saleId - The ID of the sale to fetch
 * @param enabled - Whether the query should be enabled
 * @returns Sale data with loading and error states
 */
export function useGetSale({ saleId, enabled = true }: UseGetSaleParams): UseGetSaleReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sales', 'sale', saleId],
    queryFn: async (): Promise<Sale> => {
      const response = await fetch(`/api/sales/${saleId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sale');
      }
      
      const apiData = await response.json();
      return apiData.sale;
    },
    enabled: enabled && !!saleId,
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