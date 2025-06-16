import { useQuery } from '@tanstack/react-query';
import { DashboardKpiData } from '@/types/dashboard';

interface UseDashboardKpiReturn {
  data: DashboardKpiData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query hook for fetching dashboard KPI data
 * @returns Dashboard KPI data with loading and error states
 */
export function useDashboardKpi(): UseDashboardKpiReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'kpi'],
    queryFn: async (): Promise<DashboardKpiData> => {
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard KPIs');
      }
      
      const apiData = await response.json();
      return apiData.kpis;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}