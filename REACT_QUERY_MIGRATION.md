# React Query Migration Status

This document tracks the migration of API calls from useEffect to React Query hooks.

## Completed Migrations

### Dashboard Components
1. **dashboard-kpis.tsx** ✅
   - Created: `components/dashboard/data/use-get-kpi/use-get-kpi.ts`
   - Refactored component to use `useDashboardKpi()`

2. **inventory-overview.tsx** ✅
   - Created: `components/dashboard/data/use-get-inventory/use-get-inventory.ts`
   - Refactored component to use `useDashboardInventory()`

### Main Pages
1. **app/inventory/page.tsx** ✅
   - Created: `app/inventory/data/use-get-products/use-get-products.ts`
   - Refactored to use `useGetProducts()`

2. **app/inventory/[id]/page.tsx** ✅
   - Created: `app/inventory/data/use-get-product/use-get-product.ts`
   - Created: `app/inventory/data/use-delete-product/use-delete-product.ts`
   - Refactored to use `useGetProduct()` and `useDeleteProduct()`

3. **app/sales/page.tsx** ✅
   - Created: `app/sales/data/use-get-sales/use-get-sales.ts`
   - Created: `app/sales/data/use-get-sale/use-get-sale.ts`
   - Refactored to use `useGetSales()`

4. **app/expenses/page.tsx** ✅
   - Created: `app/expenses/data/use-get-expenses/use-get-expenses.ts`
   - Refactored to use `useGetExpenses()`

5. **app/hr/employees/page.tsx** ✅
   - Created: `app/hr/employees/data/use-get-employees/use-get-employees.ts`
   - Refactored to use `useGetEmployees()`

## Created Hooks (Not Yet Implemented in Components)

1. **Production Orders**
   - Created: `app/production/data/use-get-production-orders/use-get-production-orders.ts`

2. **Inventory Mutations**
   - Created: `app/inventory/data/use-create-product/use-create-product.ts`

## Remaining Pages to Refactor

### Production Pages
- `app/production/page.tsx` (2 useEffect calls)
- `app/production/orders/page.tsx`
- `app/production/orders/[id]/page.tsx`
- `app/production/orders/[id]/edit/page.tsx`
- `app/production/orders/new/page.tsx`
- `app/production/bom/page.tsx`
- `app/production/bom/[id]/edit/page.tsx`

### Sales Pages
- `app/sales/[id]/page.tsx`
- `app/sales/[id]/edit/page.tsx`
- `app/sales/new/page.tsx`

### Inventory Pages
- `app/inventory/[id]/edit/page.tsx`

### HR Pages
- `app/hr/employees/[id]/edit/page.tsx`
- `app/hr/attendance/page.tsx` (2 useEffect calls)
- `app/hr/payroll/page.tsx` (2 useEffect calls)
- `app/hr/payroll/[payrollId]/page.tsx`

### Expenses Pages
- `app/expenses/[id]/edit/page.tsx`

### Dashboard Pages
- `app/dashboard/profile/page.tsx`

### Auth Pages
- `app/auth/reset-password/[token]/page.tsx`

### Locale-specific Pages
- `app/[locale]/dashboard/sales/commercials/page.tsx`
- `app/[locale]/dashboard/sales/commercials/[id]/edit/page.tsx`
- `app/[locale]/dashboard/sales/commercials/new/page.tsx`
- `app/[locale]/dashboard/sales/clients/page.tsx`
- `app/[locale]/dashboard/sales/clients/[id]/edit/page.tsx`
- `app/[locale]/dashboard/purchases/page.tsx`
- `app/[locale]/dashboard/purchases/[id]/edit/page.tsx`
- `app/[locale]/dashboard/purchases/new/page.tsx`
- `app/[locale]/dashboard/purchases/suppliers/page.tsx`
- `app/[locale]/dashboard/purchases/suppliers/[id]/edit/page.tsx`

## Types Structure

Created a new types file for dashboard-specific types:
- `types/dashboard.ts` - Contains all dashboard API response types

## Patterns Established

### Query Hooks Pattern
```typescript
export function useGetResource(): UseGetResourceReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resource-key'],
    queryFn: async (): Promise<ResourceType> => {
      const response = await fetch('/api/resource');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  return { data, isLoading, error: error as Error | null, refetch };
}
```

### Mutation Hooks Pattern
```typescript
export function useCreateResource(): UseCreateResourceReturn {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: CreateResourceForm): Promise<Resource> => {
      const response = await fetch('/api/resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-key'] });
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
```

## Next Steps

1. Continue creating React Query hooks for each data fetching operation
2. Refactor remaining components to use the hooks
3. Create mutation hooks for all create/update/delete operations
4. Consider implementing optimistic updates for better UX
5. Add proper error boundaries for better error handling

## Benefits Achieved So Far

1. **Better caching**: React Query automatically caches data
2. **Background refetching**: Data stays fresh automatically
3. **Loading states**: Built-in loading and error states
4. **Deduplication**: Multiple components can use the same hook without duplicate requests
5. **Better TypeScript support**: Fully typed responses
6. **Separation of concerns**: Data fetching logic is separated from components