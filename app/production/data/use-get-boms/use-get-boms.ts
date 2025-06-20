import { useQuery } from '@tanstack/react-query';

interface BomComponent {
  id: string;
  productId: string;
  quantity: number;
  unit: string;
  product: {
    id: string;
    name: string;
    sku: string;
    unit: string;
    priceCost: number;
    qtyOnHand: number;
  };
}

interface BillOfMaterials {
  id: string;
  name: string;
  description?: string;
  finalProductId: string;
  createdAt: string;
  updatedAt: string;
  components: BomComponent[];
  finalProduct: {
    id: string;
    name: string;
    sku: string;
    priceCost: number;
    isFinishedGood: boolean;
  };
}

interface BomsApiResponse {
  boms: BillOfMaterials[];
}

interface UseGetBomsReturn {
  data: BillOfMaterials[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query hook for fetching all BOMs
 * @returns BOMs array with loading and error states
 */
export function useGetBoms(): UseGetBomsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['production', 'boms'],
    queryFn: async (): Promise<BillOfMaterials[]> => {
      const response = await fetch('/api/production/bom');
      
      if (!response.ok) {
        throw new Error('Failed to fetch BOMs');
      }
      
      const apiData: BomsApiResponse = await response.json();
      return apiData.boms;
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