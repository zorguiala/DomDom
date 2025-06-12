import { useQuery } from '@tanstack/react-query';
import { DashboardInventoryData } from '@/types/dashboard';

interface UseDashboardInventoryReturn {
  data: DashboardInventoryData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query hook for fetching dashboard inventory overview data
 * @returns Dashboard inventory data with loading and error states
 */
export function useDashboardInventory(): UseDashboardInventoryReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'inventory'],
    queryFn: async (): Promise<DashboardInventoryData> => {
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data for inventory');
      }
      
      const apiResponse = await response.json();
      
      if (!apiResponse.inventory) {
        throw new Error('Inventory data not found in API response');
      }
      
      return apiResponse.inventory;
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