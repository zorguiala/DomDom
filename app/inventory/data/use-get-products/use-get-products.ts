import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types';

interface InventoryApiResponse {
  products: Product[];
}

interface UseGetProductsReturn {
  data: Product[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query hook for fetching all products from inventory
 * @returns Products array with loading and error states
 */
export function useGetProducts(): UseGetProductsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory', 'products'],
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch('/api/inventory');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const apiData: InventoryApiResponse = await response.json();
      return apiData.products;
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