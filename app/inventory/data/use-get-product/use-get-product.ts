import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types';

interface UseGetProductParams {
  productId: string;
  enabled?: boolean;
}

interface UseGetProductReturn {
  data: Product | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query hook for fetching a single product by ID
 * @param productId - The ID of the product to fetch
 * @param enabled - Whether the query should be enabled
 * @returns Product data with loading and error states
 */
export function useGetProduct({ productId, enabled = true }: UseGetProductParams): UseGetProductReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory', 'product', productId],
    queryFn: async (): Promise<Product> => {
      const response = await fetch(`/api/inventory/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const apiData = await response.json();
      return apiData.product;
    },
    enabled: enabled && !!productId,
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