import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateProductForm, Product } from '@/types';

interface UseCreateProductReturn {
  mutate: (data: CreateProductForm) => void;
  mutateAsync: (data: CreateProductForm) => Promise<Product>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  data: Product | undefined;
}

/**
 * React Query mutation hook for creating a new product
 * @returns Mutation function with loading and error states
 */
export function useCreateProduct(): UseCreateProductReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateProductForm): Promise<Product> => {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const result = await response.json();
      return result.product;
    },
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
}