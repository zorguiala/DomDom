import { useQuery } from '@tanstack/react-query';
import { Employee } from '@/types';

interface EmployeesApiResponse {
  employees: Employee[];
}

interface UseGetEmployeesReturn {
  data: Employee[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query hook for fetching all employees
 * @returns Employees array with loading and error states
 */
export function useGetEmployees(): UseGetEmployeesReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['hr', 'employees'],
    queryFn: async (): Promise<Employee[]> => {
      const response = await fetch('/api/hr/employees');
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const apiData: EmployeesApiResponse = await response.json();
      return apiData.employees;
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