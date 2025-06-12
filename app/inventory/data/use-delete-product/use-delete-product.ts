import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseDeleteProductReturn {
  mutate: (productId: string) => void;
  mutateAsync: (productId: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

/**
 * React Query mutation hook for deleting a product
 * @returns Mutation function with loading and error states
 */
export function useDeleteProduct(): UseDeleteProductReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      const response = await fetch(`/api/inventory/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }
    },
    onSuccess: (_data: void, productId: string) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      // Remove the specific product from cache
      queryClient.removeQueries({ queryKey: ['inventory', 'product', productId] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    isSuccess: mutation.isSuccess,
  };
}