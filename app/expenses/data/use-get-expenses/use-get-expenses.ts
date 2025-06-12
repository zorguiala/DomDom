import { useQuery } from '@tanstack/react-query';
import { Expense } from '@/types';

interface UseGetExpensesReturn {
  data: Expense[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query hook for fetching all expenses
 * @returns Expenses array with loading and error states
 */
export function useGetExpenses(): UseGetExpensesReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['expenses'],
    queryFn: async (): Promise<Expense[]> => {
      const response = await fetch('/api/expenses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      
      const apiData: Expense[] = await response.json();
      return apiData;
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