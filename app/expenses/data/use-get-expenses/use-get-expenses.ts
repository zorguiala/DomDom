import { useQuery } from '@tanstack/react-query';
import { ExpenseWithCategory } from '@/types/expenses';

interface UseGetExpensesReturn {
  data: ExpenseWithCategory[] | undefined;
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
    queryFn: async (): Promise<ExpenseWithCategory[]> => {
      const response = await fetch('/api/expenses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      
      const apiData: ExpenseWithCategory[] = await response.json();
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