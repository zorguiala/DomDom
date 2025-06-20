import { useMutation, useQueryClient } from '@tanstack/react-query';

interface BomComponent {
  productId: string;
  quantity: number;
  unit: string;
}

interface CreateBomData {
  name: string;
  description?: string;
  finalProductId: string;
  outputQuantity: number;
  outputUnit: string;
  components: BomComponent[];
}

interface UseCreateBomReturn {
  mutate: (data: CreateBomData) => void;
  mutateAsync: (data: CreateBomData) => Promise<any>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

/**
 * React Query mutation hook for creating a new BOM
 * Automatically calculates final product cost and updates inventory
 * @returns Mutation function with loading and error states
 */
export function useCreateBom(): UseCreateBomReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateBomData) => {
      const response = await fetch('/api/production/bom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create BOM');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate BOMs query to refetch data
      queryClient.invalidateQueries({ queryKey: ['production', 'boms'] });
      // Also invalidate products since costs may have changed
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
} 