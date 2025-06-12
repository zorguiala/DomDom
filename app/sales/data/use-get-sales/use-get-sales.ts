import { useQuery } from '@tanstack/react-query';
import { Sale } from '@/types';

interface SalesApiResponse {
  sales: Sale[];
}

interface UseGetSalesReturn {
  data: Sale[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query hook for fetching all sales
 * @returns Sales array with loading and error states
 */
export function useGetSales(): UseGetSalesReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sales'],
    queryFn: async (): Promise<Sale[]> => {
      const response = await fetch('/api/sales');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
      
      const apiData: SalesApiResponse = await response.json();
      return apiData.sales;
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